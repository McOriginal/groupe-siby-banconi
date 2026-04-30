/**
 * html2pdf.js référence un fichier source map `es6-promise.map` dans son bundle,
 * mais ce fichier n'est pas publié dans le paquet npm (ENOENT au build).
 *
 * Create React App charge `source-map-loader` en pré-bundle : sans ce fichier,
 * Webpack affiche un WARNING (sans casser l'exécution de html2pdf).
 *
 * Ce script crée un source map minimal valide UNIQUEMENT si le fichier manque.
 * Cela supprime l'avertissement sans modifier le code applicatif ni le comportement
 * de html2pdf.js (les source maps ne sont utilisées qu'en debug du bundle).
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'html2pdf.js',
  'dist',
  'es6-promise.map'
);

/** Source map JSON minimal conforme au format V3 (suffisant pour source-map-loader). */
const minimalSourceMap = JSON.stringify({
  version: 3,
  file: '',
  sources: [],
  names: [],
  mappings: '',
});

function main() {
  try {
    if (fs.existsSync(mapPath)) {
      return;
    }
    const dir = path.dirname(mapPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(mapPath, `${minimalSourceMap}\n`, 'utf8');
    console.log(
      '[ensure-html2pdf-sourcemap] Fichier créé:',
      path.relative(path.join(__dirname, '..'), mapPath)
    );
  } catch (err) {
    console.warn('[ensure-html2pdf-sourcemap]', err.message);
    process.exitCode = 0; // ne pas faire échouer npm install
  }
}

main();
