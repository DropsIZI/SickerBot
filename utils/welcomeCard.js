const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const FONT_PATH = path.join(__dirname, '../assets/font-bold.ttf');
if (fs.existsSync(FONT_PATH)) {
  GlobalFonts.register(fs.readFileSync(FONT_PATH), 'Roboto');
}

const BG_PATH = path.join(__dirname, '../assets/welcome-bg.png');

// 1280x450px — proporción similar a la imagen de referencia
const W = 1280, H = 450;

async function generateWelcomeCard(member) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Fondo: imagen personalizada o degradado rosa si no existe
  try {
    const bg = await loadImage(BG_PATH);
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#FFE0EB');
    grad.addColorStop(0.5, '#FFC8DD');
    grad.addColorStop(1, '#FFAFCC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Overlay oscuro suave en zona del texto
  const textOverlay = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0);
  textOverlay.addColorStop(0, 'rgba(255,180,200,0)');
  textOverlay.addColorStop(0.3, 'rgba(255,200,215,0.55)');
  textOverlay.addColorStop(0.7, 'rgba(255,200,215,0.55)');
  textOverlay.addColorStop(1, 'rgba(255,180,200,0)');
  ctx.fillStyle = textOverlay;
  ctx.fillRect(0, 0, W, H);

  // Avatar circular centrado (zona del donut en la imagen de referencia)
  const avatarSize = 210;
  const avatarCX = W * 0.27;
  const avatarCY = H / 2;

  // Glow rosa
  ctx.shadowColor = '#FF85A1';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarSize / 2 + 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#FF85A1';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Clip circular avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  try {
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
    const avatar = await loadImage(avatarUrl);
    ctx.drawImage(avatar, avatarCX - avatarSize / 2, avatarCY - avatarSize / 2, avatarSize, avatarSize);
  } catch {
    ctx.fillStyle = '#FFB3C6';
    ctx.fillRect(avatarCX - avatarSize / 2, avatarCY - avatarSize / 2, avatarSize, avatarSize);
  }
  ctx.restore();

  // Texto central
  const textCX = W * 0.55;

  // "¡Bienvenida/o a"
  ctx.font = '28px Roboto';
  ctx.fillStyle = '#8B4560';
  ctx.textAlign = 'center';
  ctx.fillText('¡Bienvenid@ a', textCX, H / 2 - 70);

  // Nombre del servidor
  ctx.font = 'bold 22px Roboto';
  ctx.fillStyle = '#C2556E';
  ctx.fillText('Sick Community 🍩', textCX, H / 2 - 38);

  // Separador decorativo
  ctx.fillStyle = '#FF85A1';
  ctx.fillRect(textCX - 80, H / 2 - 22, 160, 3);

  // Nombre del usuario (grande)
  ctx.font = 'bold 58px Roboto';
  ctx.fillStyle = '#5C1F35';
  ctx.shadowColor = 'rgba(255,133,161,0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText(member.user.username, textCX, H / 2 + 40);
  ctx.shadowBlur = 0;

  // Miembro número X
  ctx.font = '22px Roboto';
  ctx.fillStyle = '#A0526A';
  ctx.fillText(`Miembro #${member.guild.memberCount} 🎀`, textCX, H / 2 + 80);

  ctx.textAlign = 'left';
  return canvas.toBuffer('image/png');
}

module.exports = { generateWelcomeCard };
