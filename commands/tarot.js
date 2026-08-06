const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { cartaDelDia, cartaAlAzar, tirada } = require('../utils/tarot');
const { loadConfig } = require('../utils/levelManager');

const DIR_CARTAS = path.join(__dirname, '../assets/tarot');
const POSICIONES = ['🕰️ Pasado', '✨ Presente', '🔮 Futuro'];

// Busca la imagen de la carta, aceptando varias extensiones
function buscarImagen(slug) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const ruta = path.join(DIR_CARTAS, `${slug}.${ext}`);
    if (fs.existsSync(ruta)) return ruta;
  }
  return null;
}

function embedCarta({ carta, invertida }, titulo) {
  const significado = invertida ? carta.invertido : carta.derecho;

  const embed = new EmbedBuilder()
    .setColor(invertida ? 0x8B5E9C : 0xFF85A1)
    .setTitle(`${carta.emoji}  ${carta.nombre}${invertida ? '  (invertida)' : ''}`)
    .setDescription(`> ${significado}`);

  if (titulo) embed.setAuthor({ name: titulo });

  const imagen = buscarImagen(carta.slug);
  if (imagen) embed.setImage(`attachment://${path.basename(imagen)}`);

  return { embed, imagen };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tarot')
    .setDescription('Sick te lee las cartas 🔮')
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
    ),

  async execute(interaction) {
    // Si hay canal de tarot definido, solo se usa ahí
    const canalTarot = loadConfig().tarotChannel;
    if (canalTarot && interaction.channelId !== canalTarot) {
      return interaction.reply({
        content: `❌ Las cartas solo se leen en <#${canalTarot}> 🔮`,
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const tipo = interaction.options.getString('tipo') || 'dia';
    const pregunta = interaction.options.getString('pregunta');
    const usuario = interaction.user;

    const embeds = [];
    const ficheros = [];

    if (tipo === 'tres') {
      tirada(3).forEach((sacada, i) => {
        const { embed, imagen } = embedCarta(sacada, POSICIONES[i]);
        embeds.push(embed);
        if (imagen) ficheros.push(new AttachmentBuilder(imagen));
      });
    } else {
      const sacada = tipo === 'dia' ? cartaDelDia(usuario.id) : cartaAlAzar();
      const { embed, imagen } = embedCarta(sacada, tipo === 'dia' ? '🌙 Tu carta de hoy' : '🃏 Tu carta');
      embeds.push(embed);
      if (imagen) ficheros.push(new AttachmentBuilder(imagen));
    }

    embeds[0].setFooter({
      text: tipo === 'dia'
        ? `Carta del día de ${usuario.username} • vuelve mañana 🍩`
        : `Tirada de ${usuario.username} 🍩`,
    });

    const cabecera = pregunta
      ? `🔮 **${usuario.username}** preguntó: *${pregunta}*\nLas cartas dicen…`
      : `🔮 Las cartas de **${usuario.username}**…`;

    await interaction.editReply({ content: cabecera, embeds, files: ficheros });
  },
};
