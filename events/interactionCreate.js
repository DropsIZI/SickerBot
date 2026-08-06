module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Formulario de /poema
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal-poema:')) {
      const { EmbedBuilder } = require('discord.js');
      const anonimo = interaction.customId.endsWith(':anon');

      try {
        await interaction.deferReply({ ephemeral: true });

        const titulo = interaction.fields.getTextInputValue('titulo').trim();
        const texto = interaction.fields.getTextInputValue('texto').trim();

        // El titulo va como encabezado dentro de la descripcion, no en
        // setTitle: asi Discord lo renderiza en grande de verdad
        const embed = new EmbedBuilder()
          .setColor(0xC77DFF)
          .setDescription(`## ✍️ ${titulo}\n\n${texto}`)
          .setTimestamp();

        if (anonimo) {
          embed.setFooter({ text: 'Publicado de forma anónima' });
        } else {
          embed.setFooter({
            text: `Por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 64 }),
          });
        }

        const { loadConfig } = require('../utils/levelManager');
        const canalId = loadConfig().poemasChannel;
        const destino = canalId
          ? await interaction.guild.channels.fetch(canalId).catch(() => null)
          : interaction.channel;

        if (!destino) {
          return interaction.editReply('❌ El canal de poemas ya no existe. Configúralo con `/set-canal-poemas`.');
        }

        await destino.send({ embeds: [embed] });
        return interaction.editReply(
          anonimo ? '✅ Tu poema se publicó de forma anónima.' : `✅ Poema publicado en ${destino}.`
        );
      } catch (err) {
        console.error('[modal-poema]', err);
        const msg = '❌ No pude publicar el poema.';
        return interaction.deferred ? interaction.editReply(msg) : interaction.reply({ content: msg, ephemeral: true });
      }
    }

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
