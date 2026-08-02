const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const FONT_PATH = path.join(__dirname, '../assets/font-bold.ttf');
if (fs.existsSync(FONT_PATH)) {
  GlobalFonts.register(fs.readFileSync(FONT_PATH), 'Roboto');
}

// Tamaño recomendado: 800x250px
const W = 800, H = 250;

const ACTIONS = {
  ban: {
    bg: ['#1a0000', '#3d0000'],
    accent: '#FF4444',
    label: '🔨 BANEADO',
    msg: u => `¡Fuera del horno! ${u} ha sido expulsado permanentemente.`,
  },
  kick: {
    bg: ['#1a0d00', '#3d2000'],
    accent: '#FF8C00',
    label: '👢 KICKEADO',
    msg: u => `¡Esta rosca no era fresca! ${u} ha sido expulsado.`,
  },
  mute: {
    bg: ['#0d0d1a', '#1a1a40'],
    accent: '#FF9EBB',
    label: '🔇 SILENCIADO',
    msg: u => `¡Esa rosca se está portando mal! ${u} ha sido silenciado.`,
  },
  unmute: {
    bg: ['#001a0d', '#003d1a'],
    accent: '#57F287',
    label: '🔊 SILENCIO LEVANTADO',
    msg: u => `¡La rosca puede hablar de nuevo! ${u} ha sido des-silenciado.`,
  },
};

async function generateModCard(member, action) {
  const cfg = ACTIONS[action];
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Fondo degradado
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, cfg.bg[0]);
  grad.addColorStop(1, cfg.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Barra de acento izquierda
  ctx.fillStyle = cfg.accent;
  ctx.fillRect(0, 0, 5, H);

  // Overlay sutil
  const overlay = ctx.createLinearGradient(0, 0, W, 0);
  overlay.addColorStop(0, 'rgba(0,0,0,0)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Avatar circular
  const size = 140;
  const cx = 50 + size / 2;
  const cy = H / 2;

  ctx.shadowColor = cfg.accent;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
  ctx.strokeStyle = cfg.accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.clip();
  try {
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    ctx.drawImage(avatar, 50, cy - size / 2, size, size);
  } catch {
    ctx.fillStyle = '#333';
    ctx.fillRect(50, cy - size / 2, size, size);
  }
  ctx.restore();

  const tx = 50 + size + 36;

  // Etiqueta de acción
  ctx.font = 'bold 38px Roboto';
  ctx.fillStyle = cfg.accent;
  ctx.shadowColor = cfg.accent;
  ctx.shadowBlur = 12;
  ctx.fillText(cfg.label, tx, 95);
  ctx.shadowBlur = 0;

  // Separador
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(tx, 108, W - tx - 30, 2);

  // Nombre de usuario
  ctx.font = 'bold 28px Roboto';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(member.user.username, tx, 148);

  // Mensaje temático
  ctx.font = '18px Roboto';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  const msg = cfg.msg(member.user.username);
  // Truncar si es muy largo
  const maxW = W - tx - 30;
  let txt = msg;
  while (ctx.measureText(txt).width > maxW && txt.length > 10) {
    txt = txt.slice(0, -4) + '...';
  }
  ctx.fillText(txt, tx, 195);

  return canvas.toBuffer('image/png');
}

module.exports = { generateModCard };
