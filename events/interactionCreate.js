module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Menu desplegable de países: se deja solo el elegido
    if (interaction.isStringSelectMenu() && interaction.customId === 'roles-pais') {
      const { PAISES, nombreRol } = require('../utils/paises');
      const nombres = PAISES.map(nombreRol);

      try {
        await interaction.deferReply({ ephemeral: true });

        const elegido = interaction.values[0];
        const actuales = interaction.member.roles.cache.filter(r => nombres.includes(r.name));
        if (actuales.size) await interaction.member.roles.remove(actuales);

        if (elegido === '__ninguno__') {
          return interaction.editReply('✅ Te quité el rol de país.');
        }

        const pais = PAISES.find(p => p.nombre === elegido);
        const rol = interaction.guild.roles.cache.find(r => r.name === nombreRol(pais));
        if (!rol) return interaction.editReply('❌ Ese rol ya no existe, avisa a un admin.');

        await interaction.member.roles.add(rol);
        return interaction.editReply(`✅ ¡Listo! Ahora eres de ${pais.emoji} **${pais.nombre}** 🍩`);
      } catch (err) {
        console.error('[roles-pais]', err);
        const msg = '❌ No pude cambiar tu rol. El rol del bot debe estar por encima de los de país.';
        return interaction.deferred ? interaction.editReply(msg) : interaction.reply({ content: msg, ephemeral: true });
      }
    }

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
