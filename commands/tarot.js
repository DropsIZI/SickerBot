const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { loadConfig } = require('../utils/levelManager');
const { construirLectura } = require('../utils/tarotLectura');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tarot')
    .setDescription('Consulta las cartas del tarot 🔮')
    .addStringOption(o =>
      o.setName('tipo')
        .setDescription('Qué tirada quieres')
        .addChoices(
          { name: '🌙 Carta del día (una por día)', value: 'dia' },
          { name: '🃏 Una carta al azar', value: 'azar' },
          { name: '🔮 Tirada de 3 (pasado, presente, futuro)', value: 'tres' },
        )
    )
    .addStringOption(o =>
      o.setName('pregunta').setDescription('Qué quieres consultar')
    )
    .addBooleanOption(o =>
      o.setName('anonimo')
        .setDescription('Publica la lectura sin revelar quién consultó')
    ),

  async execute(interaction) {
    // Si hay canal de tarot definido, solo se usa ahí. El prefijo !tarot no
    // pasa por aquí: ese funciona en cualquier canal a propósito.
    const canalTarot = loadConfig().tarotChannel;
    if (canalTarot && interaction.channelId !== canalTarot) {
      return interaction.reply({
        content: `❌ Las cartas solo se leen en <#${canalTarot}> 🔮\nSi quieres tirar aquí, escribe \`!tarot\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const anonimo = interaction.options.getBoolean('anonimo') === true;

    // Discord encabeza toda respuesta a un comando con «fulano usó /tarot»,
    // asi que para que la tirada sea anonima de verdad hay que responder en
    // privado y publicar la lectura como mensaje suelto del bot.
    await interaction.deferReply({ flags: anonimo ? MessageFlags.Ephemeral : undefined });

    const lectura = construirLectura({
      tipo: interaction.options.getString('tipo') || 'dia',
      pregunta: interaction.options.getString('pregunta'),
      usuario: interaction.user,
      anonimo,
    });

    if (!anonimo) return interaction.editReply(lectura);

    // Mensaje suelto del bot: sin la cabecera que delataria quien consulto
    await interaction.channel.send(lectura);
    await interaction.editReply('✅ Tu lectura se publicó de forma anónima.');
  },
};
