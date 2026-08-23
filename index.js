const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Vuelve a registrar los slash commands en cada arranque, asi los cambios de
// opciones/subcomandos quedan sincronizados sin correr deploy-commands.js aparte
require('./deploy-commands');

client.on('error', err => console.error('[Discord error]', err.message));
process.on('unhandledRejection', err => console.error('[unhandledRejection]', err));

// El almacenamiento se carga antes de conectar para que el primer mensaje
// que llegue ya encuentre el XP en memoria
require('./utils/storage').init()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(err => {
    console.error('[storage] error fatal al inicializar:', err);
    process.exit(1);
  });

// Health check: Render asigna el puerto por la variable PORT
const http = require('http');
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => res.writeHead(200).end('OK'))
  .listen(PORT, () => console.log(`[health] escuchando en el puerto ${PORT}`));
