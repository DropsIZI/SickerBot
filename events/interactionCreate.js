module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error('[interactionCreate]', err);
      const msg = { content: '❌ Ocurrió un error al ejecutar el comando.', ephemeral: true };
      interaction.replied || interaction.deferred
        ? interaction.followUp(msg)
        : interaction.reply(msg);
    }
  },
};
