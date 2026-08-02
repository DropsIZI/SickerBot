const fs = require('fs');
const path = require('path');

const LEVELS_FILE = path.join(__dirname, '../data/levels.json');
const CONFIG_FILE = path.join(__dirname, '../data/config.json');

function loadLevels() {
  try { return JSON.parse(fs.readFileSync(LEVELS_FILE, 'utf8')); }
  catch { return {}; }
}

function saveLevels(data) {
  fs.writeFileSync(LEVELS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return { levelRoles: {}, levelUpChannel: null }; }
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// XP necesaria para pasar del nivel N al N+1 (fórmula estilo MEE6)
function xpForLevel(level) {
  return 5 * level * level + 50 * level + 100;
}

// Cooldown en memoria: 60 segundos entre ganancias de XP por usuario
const cooldowns = new Map();

function isOnCooldown(userId) {
  const last = cooldowns.get(userId);
  return last && (Date.now() - last) < 60_000;
}

function setCooldown(userId) {
  cooldowns.set(userId, Date.now());
}

function addXP(userId, amount) {
  const data = loadLevels();
  if (!data[userId]) data[userId] = { xp: 0, level: 0 };

  data[userId].xp += amount;

  let leveledUp = false;
  let newLevel = data[userId].level;

  while (data[userId].xp >= xpForLevel(newLevel + 1)) {
    data[userId].xp -= xpForLevel(newLevel + 1);
    newLevel++;
    leveledUp = true;
  }

  data[userId].level = newLevel;
  saveLevels(data);

  return { level: newLevel, xp: data[userId].xp, leveledUp };
}

function getUser(userId) {
  const data = loadLevels();
  return data[userId] || { xp: 0, level: 0 };
}

function getLeaderboard() {
  const data = loadLevels();
  return Object.entries(data)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10);
}

function getLevelUpMessage(user, level) {
  if (level >= 50) return `👑 ¡INCREÍBLE! ${user} alcanzó el **nivel ${level}**! ¡Eres la rosca definitiva del servidor! 🍩✨`;
  if (level >= 25) return `🌟 ¡WOW! ${user} llegó al **nivel ${level}**! ¡Esta rosca no tiene límites! 🍩💫`;
  if (level >= 10) return `🔥 ¡${user} subió al **nivel ${level}**! ¡Eres una rosca de élite! 🍩👑`;
  if (level >= 5)  return `✨ ¡${user} alcanzó el **nivel ${level}**! ¡Esta rosca está creciendo! 🍩💪`;
  return `🎉 ¡${user} subió al **nivel ${level}**! ¡Sigue así, pequeña rosca! 🍩`;
}

module.exports = { addXP, getUser, getLeaderboard, isOnCooldown, setCooldown, getLevelUpMessage, xpForLevel, loadConfig, saveConfig };
