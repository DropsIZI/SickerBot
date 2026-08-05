module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Menus de autoroles: deja al miembro exactamente con lo que marco
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('autorol:')) {
      const { GRUPOS, nombreRol, rolesDeGrupo } = require('../utils/autoroles');
      const grupoId = interaction.customId.slice('autorol:'.length);
      const grupo = GRUPOS[grupoId];
      if (!grupo) return;

      try {
        await interaction.deferReply({ ephemeral: true });

        const delGrupo = rolesDeGrupo(grupoId);
        const elegidos = grupo.opciones
          .filter(o => interaction.values.includes(o.nombre))
          .map(o => nombreRol(grupoId, o));

        const quitar = interaction.member.roles.cache
          .filter(r => delGrupo.includes(r.name) && !elegidos.includes(r.name));
        if (quitar.size) await interaction.member.roles.remove(quitar);

        const anadir = elegidos
          .filter(n => !interaction.member.roles.cache.some(r => r.name === n))
          .map(n => interaction.guild.roles.cache.find(r => r.name === n))
          .filter(Boolean);
        if (anadir.length) await interaction.member.roles.add(anadir);

        return interaction.editReply(
          elegidos.length
            ? `✅ ¡Listo! Ahora tienes: **${elegidos.join('**, **')}** 🍩`
            : '✅ Te quité los roles de esta sección.'
        );
      } catch (err) {
        console.error('[autorol:' + grupoId + ']', err);
        const msg = '❌ No pude cambiar tus roles. El rol del bot debe estar **por encima** de estos.';
        return interaction.deferred
          ? interaction.editReply(msg)
          : interaction.reply({ content: msg, ephemeral: true });
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
