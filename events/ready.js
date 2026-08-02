module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`✅ SickerBot conectado como ${client.user.tag}`);
    client.user.setActivity('🍩 Sick Community', { type: 0 });

    // Deja el canal de "en vivo" coherente tras un reinicio o redeploy
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (guild) {
      await require('../utils/liveStatus').restaurar(guild)
        .catch(err => console.error('[liveStatus] error al restaurar:', err.message));

      require('../utils/streamWatcher').iniciar(guild);
    }
  },
};
