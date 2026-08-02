// Almacenamiento de niveles y configuracion.
//
// Con MONGODB_URI definida usa MongoDB Atlas; si no, cae a los JSON de data/.
// En Render el disco es efimero, asi que los JSON solo valen para desarrollo
// local: en produccion todo se pierde en cada redeploy sin Mongo.
//
// Todo se mantiene cacheado en memoria para que las lecturas sigan siendo
// sincronas (el resto del bot las usa asi) y solo las escrituras van a la base.

const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { MongoClient } = require('mongodb');

const LEVELS_FILE = path.join(__dirname, '../data/levels.json');
const CONFIG_FILE = path.join(__dirname, '../data/config.json');
const CONFIG_POR_DEFECTO = { levelRoles: {}, levelUpChannel: null };

let cacheLevels = {};
let cacheConfig = { ...CONFIG_POR_DEFECTO };
let colLevels = null;
let colConfig = null;
let usandoMongo = false;

const leerJSON = (file, porDefecto) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return porDefecto; }
};

const escribirJSON = (file, data) => {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); }
  catch (err) { console.error('[storage] no se pudo escribir ' + file + ':', err.message); }
};

// Las URIs mongodb+srv:// necesitan una consulta DNS de tipo SRV, que Node
// hace contra los servidores del sistema en vez de usar el resolver de
// Windows. Si esos servidores no responden (pasa con adblockers o VPNs que
// dejan 127.0.0.1 configurado), falla solo Mongo mientras el resto del bot
// conecta sin problema. En ese caso se reintenta con DNS publicos.
async function conectar(uri) {
  const opciones = { serverSelectionTimeoutMS: 15000 };
  try {
    return await new MongoClient(uri, opciones).connect();
  } catch (err) {
    const esFalloDeSrv = /querySrv|ECONNREFUSED|ESERVFAIL|ETIMEOUT/.test(err.message);
    if (!esFalloDeSrv || !uri.startsWith('mongodb+srv://')) throw err;

    console.warn('[storage] el DNS del sistema no resuelve SRV, reintentando con DNS publicos');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    return await new MongoClient(uri, opciones).connect();
  }
}

async function init() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    cacheLevels = leerJSON(LEVELS_FILE, {});
    cacheConfig = { ...CONFIG_POR_DEFECTO, ...leerJSON(CONFIG_FILE, {}) };
    console.log('[storage] sin MONGODB_URI, usando data/*.json (no persiste en Render)');
    return;
  }

  try {
    const client = await conectar(uri);
    const db = client.db(process.env.MONGODB_DB || 'sickerbot');
    colLevels = db.collection('levels');
    colConfig = db.collection('config');

    for (const doc of await colLevels.find({}).toArray()) {
      cacheLevels[doc._id] = { xp: doc.xp ?? 0, level: doc.level ?? 0 };
    }
    const cfg = await colConfig.findOne({ _id: 'config' });
    cacheConfig = { ...CONFIG_POR_DEFECTO, ...(cfg || {}) };
    delete cacheConfig._id;

    usandoMongo = true;
    console.log(`[storage] MongoDB conectado (${Object.keys(cacheLevels).length} usuarios cargados)`);
  } catch (err) {
    // Preferimos arrancar con los JSON antes que dejar el bot caido
    console.error('[storage] fallo la conexion a MongoDB, se usan los JSON:', err.message);
    cacheLevels = leerJSON(LEVELS_FILE, {});
    cacheConfig = { ...CONFIG_POR_DEFECTO, ...leerJSON(CONFIG_FILE, {}) };
  }
}

const getLevels = () => cacheLevels;
const getUserData = userId => cacheLevels[userId] || { xp: 0, level: 0 };

// Guarda un solo usuario: evita reescribir toda la coleccion en cada mensaje
function setUserData(userId, data) {
  cacheLevels[userId] = data;
  if (usandoMongo) {
    colLevels.updateOne({ _id: userId }, { $set: data }, { upsert: true })
      .catch(err => console.error('[storage] error guardando usuario:', err.message));
  } else {
    escribirJSON(LEVELS_FILE, cacheLevels);
  }
}

const getConfig = () => cacheConfig;

function setConfig(data) {
  cacheConfig = data;
  if (usandoMongo) {
    colConfig.updateOne({ _id: 'config' }, { $set: data }, { upsert: true })
      .catch(err => console.error('[storage] error guardando config:', err.message));
  } else {
    escribirJSON(CONFIG_FILE, cacheConfig);
  }
}

module.exports = { init, getLevels, getUserData, setUserData, getConfig, setConfig };
