const storage = require('./storage');

const loadConfig = () => storage.getConfig();
const saveConfig = data => storage.setConfig(data);

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
  const actual = storage.getUserData(userId);
  let xp = actual.xp + amount;
  let level = actual.level;
  let leveledUp = false;

  while (xp >= xpForLevel(level + 1)) {
    xp -= xpForLevel(level + 1);
    level++;
    leveledUp = true;
  }

  storage.setUserData(userId, { xp, level });

  return { level, xp, leveledUp };
}

function getUser(userId) {
  return storage.getUserData(userId);
}

function getLeaderboard() {
  return Object.entries(storage.getLevels())
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
