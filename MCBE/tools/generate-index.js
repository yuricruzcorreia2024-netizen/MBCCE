#!/usr/bin/env node
/**
 * generate-index.js
 * ------------------
 * Varre a pasta addons/ e gera addons/index.json automaticamente,
 * listando toda pasta que tenha um par nome.html + nome.js.
 *
 * Uso:
 *   node tools/generate-index.js
 *
 * Rode este comando sempre que adicionar, renomear ou remover
 * uma pasta de addon, antes de fazer commit/push.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ADDONS_DIR = path.join(ROOT, 'addons');
const OUTPUT_FILE = path.join(ADDONS_DIR, 'index.json');

function main() {
  if (!fs.existsSync(ADDONS_DIR)) {
    console.error('Pasta "addons/" não encontrada em ' + ADDONS_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(ADDONS_DIR, { withFileTypes: true });
  const valid = [];
  const skipped = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const folder = path.join(ADDONS_DIR, name);
    const htmlFile = path.join(folder, name + '.html');
    const jsFile = path.join(folder, name + '.js');

    if (fs.existsSync(htmlFile) && fs.existsSync(jsFile)) {
      valid.push(name);
    } else {
      skipped.push(name);
    }
  }

  valid.sort((a, b) => a.localeCompare(b));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(valid, null, 2) + '\n', 'utf8');

  console.log('addons/index.json atualizado com ' + valid.length + ' addon(s):');
  valid.forEach(id => console.log('  ✓ ' + id));

  if (skipped.length) {
    console.log('\nPastas ignoradas (faltando nome.html ou nome.js igual ao nome da pasta):');
    skipped.forEach(id => console.log('  ✗ ' + id));
  }
}

main();
