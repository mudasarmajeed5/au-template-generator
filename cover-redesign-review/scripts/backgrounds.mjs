import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('/home/mudassar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const sharp = require('sharp');
const root = new URL('../assets/', import.meta.url);
const designs = {
  formal: `<rect width="595" height="842" fill="#fdfcf8"/><rect x="30" y="30" width="535" height="782" fill="none" stroke="#15384c" stroke-width="1.4"/><rect x="36" y="36" width="523" height="770" fill="none" stroke="#c1a16b" stroke-width=".6"/><path d="M30 75V30H90M505 30H565V75M30 767V812H90M505 812H565V767" fill="none" stroke="#15384c" stroke-width="5"/><path d="M275 46H320M275 796H320" stroke="#ba965b" stroke-width="3"/><g stroke="#ba965b" fill="none" stroke-width=".7"><path d="M84 733H245L297 760L350 733H511M245 733L297 706L350 733L297 760Z"/><path d="M264 733L297 716L331 733L297 750Z"/></g>`,
  editorial: `<rect width="595" height="842" fill="#fffdfa"/><rect width="595" height="166" fill="#f1e8df"/><rect x="542" width="53" height="842" fill="#702e3d"/><path d="M542 166L595 113V263L542 316Z" fill="#b77d76"/><rect x="0" y="777" width="542" height="65" fill="#702e3d"/><path d="M0 777H88L153 842H0Z" fill="#b77d76"/><g fill="none" stroke="#d5aca0" stroke-width=".8"><circle cx="567" cy="530" r="70"/><circle cx="567" cy="530" r="52"/><circle cx="567" cy="530" r="34"/><path d="M78 40H420M78 47H262"/></g>`,
  split: `<rect width="595" height="842" fill="#fff"/><path d="M0 0H166V708L0 842Z" fill="#123f49"/><path d="M0 842L166 708V842Z" fill="#249397"/><path d="M0 842L166 754V842Z" fill="#c1e5df"/><path d="M595 0V96L473 0Z" fill="#dcefeb"/><path d="M595 0V41L542 0Z" fill="#249397"/><g fill="none" stroke="#c7dfdb" stroke-width=".7"><circle cx="567" cy="747" r="46"/><circle cx="567" cy="747" r="63"/><circle cx="567" cy="747" r="80"/></g><rect x="197" y="791" width="338" height="2" fill="#249397"/>`,
  technical: `<rect width="595" height="842" fill="white"/><rect width="595" height="132" fill="#16374f"/><path d="M0 132H595" stroke="#b18b4e" stroke-width="4"/><g stroke="#426179" stroke-width=".7" fill="none"><path d="M310 0L442 132M350 0L482 132M390 0L522 132M430 0L562 132M470 0L595 125M510 0L595 85M550 0L595 45M305 36H595M305 76H595"/></g><g stroke="#dbe6eb" stroke-width=".5"><path d="M558 172V707M570 172V707M582 172V707M550 180H595M550 200H595M550 220H595M550 240H595M550 260H595M550 280H595M550 300H595M550 320H595M550 340H595M550 360H595M550 380H595M550 400H595M550 420H595M550 440H595M550 460H595M550 480H595M550 500H595M550 520H595M550 540H595M550 560H595M550 580H595M550 600H595M550 620H595M550 640H595M550 660H595M550 680H595"/></g><path d="M0 821H595" stroke="#16374f" stroke-width="42"/><path d="M40 800H280" stroke="#b18b4e" stroke-width="3"/>`,
};
for (const [id, contents] of Object.entries(designs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">${contents}</svg>`;
  await writeFile(new URL(`${id}-background.svg`, root), svg);
  await sharp(Buffer.from(svg), {density:200}).png().toFile(new URL(`${id}-background.png`, root).pathname);
}
console.log('Created four original vector page backgrounds');
