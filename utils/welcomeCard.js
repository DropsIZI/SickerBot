const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const FONT_PATH = path.join(__dirname, '../assets/font-bold.ttf');
if (fs.existsSync(FONT_PATH)) {
  GlobalFonts.register(fs.readFileSync(FONT_PATH), 'Roboto');
}

const BG_PATH = path.join(__dirname, '../assets/welcome-bg.png');

// 16:9, misma proporción que assets/welcome-bg.png (1672x941) para no deformarla
const W = 1280, H = 720;

// Posiciones en fracciones del lienzo, medidas sobre el fondo:
// el avatar va dentro del agujero del donut y el texto en el hueco
// que queda entre el donut y la chica.
// Medido sobre el fondo buscando el mayor circulo inscrito en el agujero
// (164px de radio sobre 1672px de ancho = 0.0981). Se queda justo por
// debajo para no montarse sobre la masa del donut.
const DONUT = { cx: 0.2389, cy: 0.5054, hueco: 0.0955 }; // hueco = radio, fracción del ancho
const TEXTO = { cx: 0.540, maxAncho: 0.29 };          // maxAncho, fracción del ancho

// Reduce la fuente hasta que el texto quepa en el ancho disponible
function ajustarFuente(ctx, texto, tamMax, maxAncho) {
  let tam = tamMax;
  do {
    ctx.font = `bold ${tam}px Roboto`;
    if (ctx.measureText(texto).width <= maxAncho) break;
    tam -= 2;
  } while (tam > 20);
  return tam;
}

async function generateWelcomeCard(member) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  let hayFondo = true;
  try {
    const bg = await loadImage(BG_PATH);
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    hayFondo = false;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#FFE0EB');
    grad.addColorStop(0.5, '#FFC8DD');
    grad.addColorStop(1, '#FFAFCC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // --- Avatar dentro del agujero del donut ---
  const radio = W * DONUT.hueco;
  const avatarCX = W * DONUT.cx;
  const avatarCY = H * DONUT.cy;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, radio, 0, Math.PI * 2);
  ctx.clip();
  try {
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
    const avatar = await loadImage(avatarUrl);
    ctx.drawImage(avatar, avatarCX - radio, avatarCY - radio, radio * 2, radio * 2);
  } catch {
    ctx.fillStyle = '#FFB3C6';
    ctx.fillRect(avatarCX - radio, avatarCY - radio, radio * 2, radio * 2);
  }
  ctx.restore();

  // Borde que tapa la union entre el avatar y el agujero irregular
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, radio, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // --- Texto ---
  const textCX = W * TEXTO.cx;
  const maxAncho = W * TEXTO.maxAncho;
  ctx.textAlign = 'center';

  // Si falta el fondo, el degradado no trae los títulos: se dibujan aquí
  if (!hayFondo) {
    ctx.font = 'bold 34px Roboto';
    ctx.fillStyle = '#C2556E';
    ctx.fillText('¡Bienvenid@ a Sick Community!', textCX, H * 0.36);
  }

  // Nombre del usuario, en el hueco bajo "Bienvenida Rosquita"
  const nombre = member.user.username;
  ajustarFuente(ctx, nombre, 52, maxAncho);
  ctx.fillStyle = '#6B4A3A';
  ctx.shadowColor = 'rgba(255,255,255,0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText(nombre, textCX, H * 0.60);
  ctx.shadowBlur = 0;

  // Contador de miembros. Sin emoji: Roboto no los trae y saldría un cuadro vacío
  ctx.font = 'bold 26px Roboto';
  ctx.fillStyle = '#D96A93';
  ctx.fillText(`Miembro #${member.guild.memberCount}`, textCX, H * 0.68);

  ctx.textAlign = 'left';
  return canvas.toBuffer('image/png');
}

module.exports = { generateWelcomeCard };
