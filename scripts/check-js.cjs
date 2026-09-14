const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
for (const script of scripts) execFileSync(process.execPath, ['--check', script], {stdio: 'inherit'});
console.log(`Syntax checked ${scripts.length} loaded scripts.`);
