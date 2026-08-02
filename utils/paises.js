// Roles de pais. Se crean SIN color a proposito: en Discord el color que se
// ve es el del rol con color mas alto en la jerarquia, asi que si estos
// llevaran color taparian el del rango por nivel.
const PAISES = [
  { emoji: '🇦🇷', nombre: 'Argentina' },
  { emoji: '🇧🇴', nombre: 'Bolivia' },
  { emoji: '🇧🇷', nombre: 'Brasil' },
  { emoji: '🇨🇱', nombre: 'Chile' },
  { emoji: '🇨🇴', nombre: 'Colombia' },
  { emoji: '🇨🇷', nombre: 'Costa Rica' },
  { emoji: '🇨🇺', nombre: 'Cuba' },
  { emoji: '🇪🇨', nombre: 'Ecuador' },
  { emoji: '🇸🇻', nombre: 'El Salvador' },
  { emoji: '🇪🇸', nombre: 'España' },
  { emoji: '🇬🇹', nombre: 'Guatemala' },
  { emoji: '🇭🇳', nombre: 'Honduras' },
  { emoji: '🇲🇽', nombre: 'México' },
  { emoji: '🇳🇮', nombre: 'Nicaragua' },
  { emoji: '🇵🇦', nombre: 'Panamá' },
  { emoji: '🇵🇾', nombre: 'Paraguay' },
  { emoji: '🇵🇪', nombre: 'Perú' },
  { emoji: '🇵🇷', nombre: 'Puerto Rico' },
  { emoji: '🇩🇴', nombre: 'República Dominicana' },
  { emoji: '🇺🇾', nombre: 'Uruguay' },
  { emoji: '🇻🇪', nombre: 'Venezuela' },
];

const nombreRol = p => `${p.emoji} ${p.nombre}`;

module.exports = { PAISES, nombreRol };
