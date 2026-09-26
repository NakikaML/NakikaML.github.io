/**
 * editor-client.ts —— 「本地在页面上直接改字」的客户端
 * ==================================================================
 * 只在 pnpm dev 下工作。两种改法：
 *
 *   1. 行内改字：点段落/标题/列表项，直接改文字，失焦即保存。
 *      保存走 op: 'lines' —— 服务端只替换这几行源码，其余一个字节不动。
 *      所以只有「纯文本块」会被点亮（服务端 remark 插件标的 data-edit），
 *      含公式、加粗、链接、代码的块一律点不动，避免把标记语法改没。
 *
 *   2. 编辑原文：右侧抽屉里改整段正文（默认不动 frontmatter，可选一起改）。
 *      含公式/代码/表格这种复杂块时，点它会直接把你送进抽屉。
 *
 * 保存后不自动刷新页面：源码改了行数会变，但这里会同步平移其余块的
 * 行号（见 shiftRangesAfter），所以可以连着改好几段而不出错。
 *
 * 生产构建里这个文件不会被输出（组件本身只在 import.meta.env.DEV 下渲染），
 * 而且服务端接口 apply: 'serve' 根本不存在，所以线上访问者没有任何写入路径。
 */

interface EditorContext {
  collection: string;
  id: string;
}

interface ApiResult {
  ok: boolean;
  error?: string;
  warnings?: string[];
  path?: string;
  frontmatter?: string;
  body?: string;
  content?: string;
}

const ENDPOINT = '/__edit/note';

/** 页面上会被处理成「可编辑 / 不可编辑」的块 */
const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li';

const CSS = `
.nk-de-bar {
  position: fixed; right: 18px; bottom: 18px; z-index: 99999;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; max-width: min(92vw, 620px);
  padding: 8px 10px; border: 1px solid var(--border, #eae0d3);
  border-radius: var(--radius, 10px); background: var(--bg-elevated, #fff);
  box-shadow: var(--shadow-lg, 0 12px 32px rgba(74, 46, 24, .12));
  font: 500 13px/1.45 var(--font-sans, system-ui, sans-serif); color: var(--text, #241d17);
}
.nk-de-btn {
  appearance: none; cursor: pointer; padding: 5px 10px; border-radius: var(--radius-sm, 6px);
  border: 1px solid var(--border-strong, #d9cbb9); background: var(--bg-soft, #f7f2e9);
  color: inherit; font: inherit;
}
.nk-de-btn:hover { border-color: var(--accent, #d78b34); }
.nk-de-btn--primary { background: var(--accent, #d78b34); border-color: var(--accent, #d78b34); color: var(--on-accent, #2a1c08); }
.nk-de-btn--on { background: var(--green-soft, #e8f4ed); border-color: var(--green, #4f9a76); color: var(--green-text, #2f7355); }
.nk-de-status { font-weight: 400; color: var(--text-muted, #6c6255); max-width: 320px; }
.nk-de-status[data-kind="ok"] { color: var(--green-text, #2f7355); }
.nk-de-status[data-kind="warn"] { color: var(--accent-text, #8f5715); }
.nk-de-status[data-kind="error"] { color: var(--red-text, #bc3527); }

.nk-de-editable {
  outline: 1px dashed color-mix(in srgb, var(--accent, #d78b34) 55%, transparent);
  outline-offset: 3px; border-radius: 3px; cursor: text;
}
.nk-de-editable:hover { background: var(--accent-soft, #fdf1de); }
.nk-de-editable:focus {
  outline: 2px solid var(--accent, #d78b34); background: var(--accent-soft, #fdf1de);
}
.nk-de-locked { outline: 1px dashed var(--border-strong, #d9cbb9); outline-offset: 3px; }
.nk-de-locked:hover { outline-color: var(--red, #c9402e); cursor: help; }

.nk-de-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(760px, 96vw); z-index: 99998;
  display: flex; flex-direction: column; transform: translateX(101%);
  transition: transform .18s ease; background: var(--bg-elevated, #fff);
  border-left: 1px solid var(--border, #eae0d3); box-shadow: var(--shadow-lg, 0 12px 32px rgba(74, 46, 24, .12));
  font: 400 13px/1.5 var(--font-sans, system-ui, sans-serif); color: var(--text, #241d17);
}
.nk-de-drawer--open { transform: none; }
.nk-de-head { display: flex; align-items: baseline; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--border, #eae0d3); }
.nk-de-head strong { font-size: 14px; }
.nk-de-path { flex: 1; font: 400 12px/1.4 var(--font-mono, monospace); color: var(--text-faint, #9a8d7d); word-break: break-all; }
.nk-de-body { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; min-height: 0; overflow: auto; }
.nk-de-check { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--text-muted, #6c6255); }
.nk-de-fm {
  margin: 0; padding: 8px 10px; max-height: 26vh; overflow: auto; white-space: pre-wrap;
  border: 1px solid var(--border, #eae0d3); border-radius: var(--radius-sm, 6px);
  background: var(--bg-soft, #f7f2e9); font: 400 12px/1.5 var(--font-mono, monospace); color: var(--text-muted, #6c6255);
}
.nk-de-ta {
  flex: 1; min-height: 45vh; width: 100%; resize: vertical; box-sizing: border-box;
  padding: 10px 12px; border: 1px solid var(--border-strong, #d9cbb9); border-radius: var(--radius-sm, 6px);
  background: var(--bg, #fffdf9); color: var(--text, #241d17);
  font: 400 13px/1.6 var(--font-mono, monospace); tab-size: 2;
}
.nk-de-ta:focus { outline: 2px solid var(--accent, #d78b34); outline-offset: 0; }
.nk-de-foot { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-top: 1px solid var(--border, #eae0d3); }
.nk-de-hint { flex: 1; font-size: 12px; color: var(--text-faint, #9a8d7d); }
`;

// ------------------------------------------------------------------ 工具

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

async function api(url: string, init?: RequestInit): Promise<ApiResult> {
  try {
    const res = await fetch(url, init);
    const data = (await res.json()) as ApiResult;
    if (!res.ok && data?.ok !== false) return { ok: false, error: `HTTP ${res.status}` };
    return data;
  } catch (err) {
    return { ok: false, error: `连不上本地编辑接口：${(err as Error).message}` };
  }
}

function post(payload: Record<string, unknown>): Promise<ApiResult> {
  return api(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ------------------------------------------------------------------ 主模块

let ctx: EditorContext;
let article: HTMLElement;
let editing = false;

let statusEl: HTMLElement;
let toggleBtn: HTMLButtonElement;
let drawer: HTMLElement;
let pathEl: HTMLElement;
let fmPre: HTMLElement;
let ta: HTMLTextAreaElement;
let fullToggle: HTMLInputElement;
let saveBtn: HTMLButtonElement;
let drawerMsg: HTMLElement;

let loaded: ApiResult | null = null;

export function initEditor(context: EditorContext) {
  // 静态求值：生产构建里这一行就是 `return`，后面的逻辑全部成为死代码
  if (!import.meta.env.DEV) return;

  ctx = context;
  const found = document.querySelector<HTMLElement>('article.prose');
  if (!found) return;
  article = found;

  injectCss();
  buildToolbar();
  buildDrawer();

  // 复杂块被点中时，直接送进原文抽屉
  article.addEventListener('click', (e) => {
    if (!editing) return;
    const target = (e.target as HTMLElement)?.closest?.('.nk-de-locked') as HTMLElement | null;
    if (!target) return;
    e.preventDefault();
    setStatus('这个块含公式/代码/表格等结构，已切到「编辑原文」', 'warn');
    void openDrawer(target.textContent ?? '');
  });
}

function injectCss() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
}

function setStatus(message: string, kind: 'info' | 'ok' | 'warn' | 'error' = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
  if (drawerMsg) {
    drawerMsg.textContent = message;
    drawerMsg.dataset.kind = kind;
  }
}

// ------------------------------------------------------------ 工具栏

function buildToolbar() {
  const bar = el('div', 'nk-de-bar');

  toggleBtn = el('button', 'nk-de-btn');
  toggleBtn.type = 'button';
  toggleBtn.textContent = '✎ 行内改字';
  toggleBtn.addEventListener('click', () => setEditing(!editing));

  const rawBtn = el('button', 'nk-de-btn');
  rawBtn.type = 'button';
  rawBtn.textContent = '📝 编辑原文';
  rawBtn.addEventListener('click', () => void openDrawer(''));

  statusEl = el('span', 'nk-de-status');
  statusEl.textContent = '本地编辑已就绪';

  bar.append(toggleBtn, rawBtn, statusEl);
  document.body.append(bar);
}

// ------------------------------------------------------------ 行内编辑

function setEditing(on: boolean) {
  editing = on;
  toggleBtn.textContent = on ? '✓ 完成（Esc）' : '✎ 行内改字';
  toggleBtn.classList.toggle('nk-de-btn--on', on);
  setStatus(on ? '点虚线框里的文字直接改；Esc 取消当前这段' : '本地编辑已就绪');

  const nodes = article.querySelectorAll<HTMLElement>(BLOCK_SELECTOR);
  nodes.forEach((node) => {
    const simple = node.dataset.edit === 'simple';

    // 被可编辑祖先（比如被标记的 li）覆盖的节点，不再单独处理
    const owner = node.closest<HTMLElement>('[data-edit]');
    if (!simple && owner && owner !== node) return;

    if (on) {
      if (simple) enableBlock(node);
      else node.classList.add('nk-de-locked');
    } else {
      if (simple) disableBlock(node);
      else node.classList.remove('nk-de-locked');
    }
  });

  if (!on) document.querySelectorAll('.nk-de-locked').forEach((n) => n.classList.remove('nk-de-locked'));
}

function enableBlock(node: HTMLElement) {
  node.classList.add('nk-de-editable');
  node.setAttribute('contenteditable', 'true');
  node.spellcheck = false;

  if (node.dataset.deBound === '1') return; // 事件只绑一次
  node.dataset.deBound = '1';

  node.addEventListener('focus', () => {
    node.dataset.deOriginal = node.textContent ?? '';
  });

  node.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      node.textContent = node.dataset.deOriginal ?? '';
      node.dataset.deSkip = '1';
      node.blur();
      setStatus('已取消这一段的修改');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault(); // 块内不留换行，避免破坏 Markdown 段落
      if (e.ctrlKey || e.metaKey) node.blur();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      node.blur();
    }
  });

  // 粘贴一律按纯文本插入，不然会把网页样式和 HTML 一起带进 Markdown
  node.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    if (!text) return;
    document.execCommand('insertText', false, text.replace(/[\r\n]+/g, ' '));
  });

  node.addEventListener('blur', () => {
    if (node.dataset.deSkip === '1') {
      node.dataset.deSkip = '';
      return;
    }
    const text = (node.textContent ?? '').trim();
    if (text === (node.dataset.deOriginal ?? '').trim()) return;
    void saveBlock(node);
  });
}

function disableBlock(node: HTMLElement) {
  node.classList.remove('nk-de-editable');
  node.removeAttribute('contenteditable');
}

async function saveBlock(node: HTMLElement) {
  const start = Number(node.dataset.editStart);
  const end = Number(node.dataset.editEnd);
  const text = (node.textContent ?? '').trim();

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    setStatus('拿不到源码行号，刷新页面后重试', 'error');
    return;
  }
  if (!text) {
    setStatus('内容不能为空；要整段删除请用「编辑原文」', 'error');
    node.textContent = node.dataset.deOriginal ?? '';
    return;
  }

  setStatus('保存中…');
  const res = await post({ op: 'lines', collection: ctx.collection, id: ctx.id, start, end, text });

  if (!res.ok) {
    setStatus(res.error || '保存失败', 'error');
    node.textContent = node.dataset.deOriginal ?? '';
    return;
  }

  node.textContent = text;
  node.dataset.deOriginal = text;
  shiftRangesAfter(node, start, end);

  if (res.warnings?.length) setStatus(`已保存，但注意：${res.warnings[0]}`, 'warn');
  else setStatus(`已保存 ✓ ${res.path || ''}`, 'ok');
}

/**
 * 该块现在是 1 行，原来占 end-start+1 行。
 * 它后面所有块的行号要同步平移，否则接着改第二段就会写错位置。
 */
function shiftRangesAfter(node: HTMLElement, start: number, end: number) {
  const delta = 1 - (end - start + 1);
  if (delta === 0) return;
  article.querySelectorAll<HTMLElement>('[data-edit]').forEach((other) => {
    const s = Number(other.dataset.editStart);
    const e = Number(other.dataset.editEnd);
    if (!Number.isInteger(s) || !Number.isInteger(e)) return;
    if (other !== node && s > end) {
      other.dataset.editStart = String(s + delta);
      other.dataset.editEnd = String(e + delta);
    }
  });
}

// ------------------------------------------------------------ 原文抽屉

function buildDrawer() {
  drawer = el('aside', 'nk-de-drawer');

  const head = el('div', 'nk-de-head');
  const title = el('strong');
  title.textContent = '编辑原文';
  pathEl = el('span', 'nk-de-path');
  pathEl.textContent = '读取中…';
  const close = el('button', 'nk-de-btn');
  close.type = 'button';
  close.textContent = '✕';
  close.addEventListener('click', closeDrawer);
  head.append(title, pathEl, close);

  const body = el('div', 'nk-de-body');
  const label = el('label', 'nk-de-check');
  fullToggle = el('input');
  fullToggle.type = 'checkbox';
  const labelText = el('span');
  labelText.textContent = '连 frontmatter 一起改（标题 / 日期 / 标签）—— 默认只改正文，元信息不会被碰';
  label.append(fullToggle, labelText);
  fullToggle.addEventListener('change', applyFullMode);

  fmPre = el('pre', 'nk-de-fm');
  ta = el('textarea', 'nk-de-ta');
  ta.spellcheck = false;
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      void saveDrawer();
    } else if (e.key === 'Escape') {
      closeDrawer();
    }
  });
  body.append(label, fmPre, ta);

  const foot = el('div', 'nk-de-foot');
  drawerMsg = el('span', 'nk-de-hint');
  saveBtn = el('button', 'nk-de-btn nk-de-btn--primary');
  saveBtn.type = 'button';
  saveBtn.textContent = '保存 (Ctrl+S)';
  saveBtn.addEventListener('click', () => void saveDrawer());
  foot.append(drawerMsg, saveBtn);

  drawer.append(head, body, foot);
  document.body.append(drawer);
}

function closeDrawer() {
  drawer.classList.remove('nk-de-drawer--open');
}

async function openDrawer(seed: string) {
  drawer.classList.add('nk-de-drawer--open');

  if (!loaded || !loaded.ok) {
    setStatus('读取源文件…');
    const res = await api(`${ENDPOINT}?collection=${encodeURIComponent(ctx.collection)}&id=${encodeURIComponent(ctx.id)}`);
    if (!res.ok) {
      setStatus(res.error || '读取失败', 'error');
      return;
    }
    loaded = res;
    pathEl.textContent = res.path || '';
    fmPre.textContent = res.frontmatter || '（这篇没有 frontmatter）';
    fullToggle.checked = false;
    applyFullMode();
    setStatus('已载入原文');
  } else {
    applyFullMode();
  }

  if (seed) locateSeed(seed);
  ta.focus();
}

/** 根据「连 frontmatter 一起改」开关，在两个视图之间切换 */
function applyFullMode() {
  if (!loaded) return;
  const full = fullToggle.checked;
  fmPre.hidden = full;
  ta.value = full ? loaded.content ?? '' : loaded.body ?? '';
}

/** 从复杂块点进来时，尽力在原文里选中这一段（选中不了就让用户自己找） */
function locateSeed(seed: string) {
  const flat = seed.replace(/\s+/g, ' ').trim();
  if (!flat) return;
  const text = ta.value;

  const candidates = [flat.slice(0, 40), flat.slice(0, 20), flat.slice(0, 12)].filter((s) => s.length >= 6);
  for (const candidate of candidates) {
    const idx = text.indexOf(candidate);
    if (idx === -1) continue;
    ta.focus();
    ta.setSelectionRange(idx, idx + candidate.length);
    // 让选中的位置滚进视野
    const before = text.slice(0, idx).split('\n').length;
    ta.scrollTop = Math.max(0, (before - 3) * 20);
    setStatus('已尽量定位到这一块，请自行核对');
    return;
  }
  setStatus('这块是公式/代码/表格，请在原文里手动找到它', 'warn');
}

async function saveDrawer() {
  if (!loaded) return;
  const full = fullToggle.checked;
  const payload = full
    ? { op: 'full', collection: ctx.collection, id: ctx.id, content: ta.value }
    : { op: 'body', collection: ctx.collection, id: ctx.id, body: ta.value };

  setStatus('保存中…');
  const res = await post(payload);
  if (!res.ok) {
    setStatus(res.error || '保存失败', 'error');
    return;
  }

  closeDrawer();
  // 正文结构变了，页面上的行号全部作废 —— 直接刷新拿最新内容
  setStatus('已保存 ✓ 正在刷新…', 'ok');
  setTimeout(() => window.location.reload(), 250);
}
