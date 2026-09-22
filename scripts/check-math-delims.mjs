#!/usr/bin/env node
/**
 * 抽查同步产物：是否还有「跨行公式的定界符没有独占一行」的情况。
 * 这类写法会让 remark-math 吞掉 \begin{...}，导致 KaTeX 报错。
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? 'src/content/notes');
if (!fs.existsSync(dir)) {
  console.error('目录不存在:', dir);
  process.exit(1);
}

let bad = 0;
let checked = 0;
const samples = [];

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.md')) continue;
  let text = fs.readFileSync(path.join(dir, f), 'utf8');

  // 屏蔽行内代码，避免误判
  text = text.replace(/`[^`\n]*`/g, (m) => '`' + '\u0000'.repeat(m.length - 2) + '`');

  const re = /\$\$([\s\S]*?)\$\$/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const inner = m[1];
    checked++;
    if (!inner.includes('\n')) continue; // 单行公式不管

    // 逐行剥掉引用块前缀（`> `）后再判断定界符是否独占一行
    const lines = inner.split('\n');
    const strip = (s) => s.replace(/^[ \t]*(?:>[ \t]?)*/, '');
    const firstLine = strip(lines[0]);
    const lastLine = strip(lines[lines.length - 1]);

    const okOpen = firstLine.trim() === '';
    const okClose = lastLine.trim() === '';
    if (okOpen && okClose) continue;

    bad++;
    if (samples.length < 8) {
      samples.push(`${f} :: ${JSON.stringify(m[0].slice(0, 70))}`);
    }
  }
}

console.log(`扫描公式对: ${checked}`);
console.log(`跨行但定界符未独占一行: ${bad}`);
samples.forEach((s) => console.log('   ' + s));
process.exit(bad === 0 ? 0 : 1);
