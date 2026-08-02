module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ SickerBot conectado como ${client.user.tag}`);
    client.user.setActivity('🍩 Sick Community', { type: 0 });
  },
};
