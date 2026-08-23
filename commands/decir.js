const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags} = require('discord.js');

function splitMessage(text, maxLen = 2000) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const lines = text.split('\n');
  let current = '';
  for (const line of lines) {
    if ((current + '\n' + line).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = line;
    } else {
      current = current ? current + '\n' + line : line;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('decir')
    .setDescription('El bot envía un mensaje en este canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('mensaje').setDescription('El mensaje que enviará el bot').setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName('imagen').setDescription('Imagen opcional para adjuntar').setRequired(false)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString('mensaje').replace(/\\n/g, '\n');
    const imagen = interaction.options.getAttachment('imagen');

    const chunks = splitMessage(mensaje);
    for (let i = 0; i < chunks.length; i++) {
      const payload = { content: chunks[i] };
      if (imagen && i === chunks.length - 1) payload.files = [imagen.url];
      await interaction.channel.send(payload);
    }

    await interaction.reply({ content: '✅ Mensaje enviado.', flags: MessageFlags.Ephemeral });
  },
};
