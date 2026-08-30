#!/usr/bin/env node
/* Gera dist/lumilinguas-demo.html: o aplicativo inteiro em um único arquivo
 * (CSS e JS embutidos) para demonstração/protótipo navegável — sem Service
 * Worker nem manifest (a versão instalável é a pasta normal).
 *
 * Uso: node tools/build-single.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

let html = read('index.html');

// remove casca de documento (o hospedeiro da demo fornece a própria)
html = html
  .replace(/^<!DOCTYPE html>\s*/i, '')
  .replace(/<html[^>]*>/i, '')
  .replace(/<\/html>\s*$/i, '')
  .replace(/<head>[\s\S]*?<\/head>/i, m => {
    // mantém apenas título e meta essenciais; CSS entra inline
    const css = read('css/app.css');
    return '<title>LumiLínguas</title>\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />\n' +
      '<style>\n' + css + '\n</style>';
  })
  .replace(/<body>/i, '')
  .replace(/<\/body>\s*$/i, '');

// troca cada <script src> pelo conteúdo do arquivo
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) =>
  '<script>\n' + read(src) + '\n</script>');

// marca a variante de arquivo único (desativa o registro do Service Worker)
html = html.replace('<title>', '<script>window.LUMI_SINGLE_FILE = true;</script>\n<title>');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'lumilinguas-demo.html');
fs.writeFileSync(out, html);
console.log('gerado:', out, Math.round(fs.statSync(out).size / 1024) + ' KB');
