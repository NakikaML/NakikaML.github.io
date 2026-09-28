/**
 * rehype-code-meta.mjs —— 给代码块套一层「语言标签 + 复制按钮」的外壳
 * ==================================================================
 * 需求见 bug及意见汇总.md 的 opinion-4：像 Obsidian 那样，代码块左上角显示语言
 * （C++ / Java / …），右上角放一个小小的复制按钮。
 *
 * 做法：把每个
 *
 *     <pre data-language="cpp">…</pre>
 *
 * 包成
 *
 *     <div class="code-block">
 *       <div class="code-block__bar">
 *         <span class="code-block__lang">C++</span>
 *         <button type="button" class="code-block__copy" data-code-copy>复制</button>
 *       </div>
 *       <pre data-language="cpp">…</pre>
 *     </div>
 *
 * 为什么要多包一层、而不是直接在 <pre> 上做 ::before：
 *   <pre> 自己带 overflow-x: auto，绝对定位的角标会跟着内容一起横向滚走。
 *   外面这层不滚动，角标才能稳稳待在左上/右上。
 *
 * 语言从两处取，取到哪个用哪个（这样不依赖它和 Shiki 插件的先后顺序）：
 *   1. <pre data-language="cpp">  —— Astro 的 Shiki 集成加的（最终产物里一定有）
 *   2. <code class="language-cpp"> —— mdast→hast 阶段就有，Shiki 之前也能拿到
 *
 * 复制按钮只输出标记，点击逻辑在 BaseLayout.astro 里统一委托（一段脚本管全站）。
 */

/** 语言 id → 显示名。没有的语言就原样显示 id。 */
const LANG_NAMES = {
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  csharp: 'C#',
  cs: 'C#',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  python: 'Python',
  py: 'Python',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  kotlin: 'Kotlin',
  swift: 'Swift',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  sql: 'SQL',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  dockerfile: 'Dockerfile',
  makefile: 'Makefile',
  markdown: 'Markdown',
  md: 'Markdown',
  latex: 'LaTeX',
  tex: 'LaTeX',
  mermaid: 'Mermaid',
  plaintext: '文本',
  text: '文本',
  txt: '文本',
};

const el = (tagName, properties, children) => ({
  type: 'element',
  tagName,
  properties: properties ?? {},
  children: children ?? [],
});
const txt = (value) => ({ type: 'text', value });

/** 取出这个代码块的语言 id */
function langOf(pre) {
  const direct = pre.properties?.dataLanguage;
  if (typeof direct === 'string' && direct) return direct;

  const code = (pre.children ?? []).find(
    (c) => c.type === 'element' && c.tagName === 'code'
  );
  const cls = code?.properties?.className;
  const list = Array.isArray(cls) ? cls : typeof cls === 'string' ? cls.split(/\s+/) : [];
  for (const c of list) {
    if (typeof c === 'string' && c.startsWith('language-')) return c.slice('language-'.length);
  }
  return '';
}

function wrapPre(pre) {
  const raw = langOf(pre);
  const label = LANG_NAMES[raw] ?? raw;

  const bar = el('div', { className: ['code-block__bar'] }, [
    el('span', { className: ['code-block__lang'] }, [txt(label)]),
    el(
      'button',
      {
        type: 'button',
        className: ['code-block__copy'],
        'data-code-copy': '',
        'aria-label': '复制代码',
      },
      [txt('复制')]
    ),
  ]);

  return el('div', { className: ['code-block'] }, [bar, pre]);
}

/** 原地遍历（不引 unist-util-visit，少一个依赖） */
function walk(node) {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.map((child) => {
    if (child.type === 'element' && child.tagName === 'pre') return wrapPre(child);
    walk(child);
    return child;
  });
}

export default function rehypeCodeMeta() {
  return (tree) => walk(tree);
}
