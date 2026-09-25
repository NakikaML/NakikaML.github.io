/**
 * bili-export-browser.js —— 「导出我全部 B 站投稿」浏览器脚本
 * ============================================================================
 * 这个文件【不是给 node 跑的】，是给你粘贴到浏览器控制台里的。
 *
 * 为什么要在浏览器里跑？
 *   B 站的「列出某人的全部投稿」接口（space/wbi/arc/search）有很强的 IP 风控。
 *   从服务器 / 机房 IP 调用会被直接拒绝（-412 request was banned / -352 风控校验失败）。
 *   但你自己的浏览器有【登录态 + 家宽 IP】，同一个接口就能正常返回。
 *   所以：拿数据这一步交给你浏览器，剩下的（生成 md、下载封面）交给本地脚本。
 *
 * 用法（大约 30 秒）：
 *   1. 用浏览器打开你自己的空间视频页：  https://space.bilibili.com/451932330/video
 *      （确保是【已登录】状态；页面能正常看到视频列表就行）
 *   2. 按 F12 打开开发者工具，切到「控制台 / Console」标签
 *   3. 把本文件全部内容复制粘贴进去，回车
 *   4. 它会自动翻页抓完所有投稿，最后下载一个 bili-works.json
 *   5. 把 bili-works.json 放到网站项目根目录（F:\Nakika-Personal-Website\），
 *      然后我（或你自己）跑：  pnpm run import:bili
 *
 * 脚本会先试接口（元数据最全：标题/日期/简介/封面/时长），
 * 如果接口也被风控拦了，会自动退化成「滚页面 + 抓 DOM」，至少也能拿到
 * BVID、标题、封面、时长、播放量。
 *
 * ----------------------------------------------------------------------------
 * 断点续抓 + 自动重试（专治「抓到一半浏览器崩了 / DNS 解析失败」）
 * ----------------------------------------------------------------------------
 *   抓取进度会实时存进浏览器 localStorage，**每抓完一页落盘一次**。
 *   所以哪怕浏览器崩掉、DNS 抽风、页面被你自己关掉，都不会丢已抓到的数据。
 *
 *   · 崩了怎么办？—— 重开空间页，把本脚本再粘贴一次就行。
 *     它会打印「检测到断点：已抓到 N 条，从第 X 页继续」，然后从断点接着抓，
 *     已抓过的不会重复。
 *   · 单个请求失败（网络中断 / DNS 解析失败 / 风控 -799）会自动指数退避重试：
 *     3s → 6s → 12s → 24s → 30s → 30s，最多 6 次，等网络缓过来再继续。
 *   · 想彻底从头重抓：把下面 RESET_PROGRESS 改成 true 再跑一次。
 *
 *   控制台小工具（抓取中途想手动看一眼/抢救数据时用）：
 *     __biliExport.status()   // 看当前进度：已抓多少条、下一页是第几页
 *     __biliExport.dump()     // 不重新抓，直接把断点里的数据导出成 json
 *     __biliExport.reset()    // 清空断点，下次从头抓
 * ============================================================================
 */
(() => {
  'use strict';

  // ==== 你的 B 站 UID（在空间页可以自动识别；识别不到就用这个）====
  const MID_OVERRIDE = '451932330';

  // ---- 抓取节奏（浏览器要是又崩了，就把这两个值调温和一点）----
  const PAGE_SIZE = 30; // 每页条数，30 是官方页面的默认值
  const SLEEP_MS = 1500; // 每次翻页之间的间隔，别调太小，容易触发风控 / 拖垮浏览器

  // ---- 断点续抓 ----
  // 进度存在浏览器 localStorage 里，每抓完一页就落盘一次。
  // 中途浏览器崩了、DNS 抽风，重开页面再粘贴一次本脚本，就会从断点接着抓，不会重复。
  // 想彻底从头重抓：把下面改成 true 再跑一次。
  const RESET_PROGRESS = false;

  // ---- 自动重试（应对 DNS 解析失败 / 网络中断 / 风控 -799）----
  const MAX_RETRY = 6; // 单个请求最多重试 6 次
  const RETRY_BASE_MS = 3000; // 首次等待 3s，之后翻倍：3→6→12→24→30→30
  const RETRY_MAX_MS = 30000; // 单次等待上限 30s

  // ==========================================================================
  // 一、MD5（浏览器的 WebCrypto 不提供 MD5，而 B 站 WBI 签名必须用 MD5）
  //     这是标准 MD5 实现，已经用 node:crypto 逐字节对拍验证过。
  // ==========================================================================
  function md5(str) {
    const K = [];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
    const S = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
      14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
      15, 21, 6, 10, 15, 21,
    ];
    const rotl = (x, c) => ((x << c) | (x >>> (32 - c))) >>> 0;

    // 字符串 -> UTF-8 字节（必须按字节算，否则中文标题会算错）
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) bytes.push(c);
      else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0xd800 || c >= 0xe000)
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else {
        i++;
        c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      }
    }

    const n = bytes.length;
    const padded = new Uint8Array((((n + 8) >> 6) + 1) << 6);
    padded.set(bytes, 0);
    padded[n] = 0x80;
    const bitLen = n * 8;
    const lo = bitLen >>> 0;
    const hi = Math.floor(bitLen / 4294967296) >>> 0;
    const dv = new DataView(padded.buffer);
    dv.setUint32(padded.length - 8, lo, true);
    dv.setUint32(padded.length - 4, hi, true);

    let a0 = 0x67452301,
      b0 = 0xefcdab89,
      c0 = 0x98badcfe,
      d0 = 0x10325476;
    for (let off = 0; off < padded.length; off += 64) {
      const M = [];
      for (let j = 0; j < 16; j++) M[j] = dv.getUint32(off + j * 4, true);
      let A = a0,
        B = b0,
        C = c0,
        D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) {
          F = (B & C) | (~B & D);
          g = i;
        } else if (i < 32) {
          F = (D & B) | (~D & C);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = (3 * i + 5) % 16;
        } else {
          F = C ^ (B | ~D);
          g = (7 * i) % 16;
        }
        const tmp = D;
        D = C;
        C = B;
        const sum = (A + F + K[i] + M[g]) >>> 0;
        B = (B + rotl(sum, S[i])) >>> 0;
        A = tmp;
      }
      a0 = (a0 + A) >>> 0;
      b0 = (b0 + B) >>> 0;
      c0 = (c0 + C) >>> 0;
      d0 = (d0 + D) >>> 0;
    }
    const le = (x) => {
      let s = '';
      for (let i = 0; i < 4; i++) s += ((x >>> (8 * i)) & 0xff).toString(16).padStart(2, '0');
      return s;
    };
    return le(a0) + le(b0) + le(c0) + le(d0);
  }

  // ==========================================================================
  // 二、WBI 签名
  // ==========================================================================
  const MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12,
    38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62,
    11, 36, 20, 34, 44, 52,
  ];

  function getMixinKey(imgKey, subKey) {
    const orig = imgKey + subKey;
    return MIXIN_KEY_ENC_TAB.map((n) => orig[n])
      .join('')
      .slice(0, 32);
  }

  function encWbi(params, mixinKey) {
    const wts = Math.round(Date.now() / 1000);
    const p = Object.assign({}, params, { wts });
    const query = Object.keys(p)
      .sort()
      .map((k) => {
        const v = String(p[k]).replace(/[!'()*]/g, '');
        return encodeURIComponent(k) + '=' + encodeURIComponent(v);
      })
      .join('&');
    return query + '&w_rid=' + md5(query + mixinKey);
  }

  // ==========================================================================
  // 三、抓取
  // ==========================================================================
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = (...a) => console.log('%c[bili-export]', 'color:#00a1d6;font-weight:bold', ...a);

  function detectMid() {
    const m = location.pathname.match(/^\/(\d+)/);
    return m ? m[1] : MID_OVERRIDE;
  }

  // 接口里的 pic 有时是 //i0.hdslb.com/... 协议相对写法
  const fixPic = (u) => (!u ? '' : u.startsWith('//') ? 'https:' + u : u.replace(/^http:/, 'https:'));

  function normalize(v) {
    return {
      bvid: v.bvid,
      title: v.title || '',
      pubdate: v.created || v.pubdate || null, // unix 秒
      // 存进 localStorage 前先截断：101 条的长简介可能撑爆 5MB 配额
      // （生成 md 时本来也只取前 120 字，够用）
      description: String(v.description || v.desc || '').slice(0, 500),
      cover: fixPic(v.pic),
      duration: v.length || null, // 接口给的是 "1:10" 这种字符串
      play: typeof v.play === 'number' ? v.play : null,
    };
  }

  // ==========================================================================
  // 三·B、断点存储（localStorage）
  // ==========================================================================
  const STORE_PREFIX = 'bili-export:';
  const storeKey = (mid) => STORE_PREFIX + mid;

  function loadState(mid) {
    try {
      const raw = localStorage.getItem(storeKey(mid));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveState(st) {
    st.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(storeKey(st.mid), JSON.stringify(st));
      return true;
    } catch (e) {
      console.warn('[bili-export] ⚠ 断点写入失败（localStorage 可能满了），本次仍会继续抓', e);
      return false;
    }
  }

  function clearState(mid) {
    try {
      localStorage.removeItem(storeKey(mid));
    } catch (e) {
      /* ignore */
    }
  }

  // ==========================================================================
  // 三·C、带自动重试的请求 —— 这次崩溃的核心修复
  // 以前任何一个请求抛错，整个抓取就断了。现在 DNS 解析失败 / 网络中断 /
  // 风控 -799 都会走指数退避重试，等网络缓过来再继续。
  // ==========================================================================
  async function fetchJson(url, label, opts) {
    const retries = opts && opts.retries != null ? opts.retries : MAX_RETRY;
    let delay = RETRY_BASE_MS;
    let lastErr = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        log(`   …等待 ${Math.round(delay / 1000)}s 后重试（第 ${attempt}/${retries} 次）`);
        await sleep(delay);
        delay = Math.min(delay * 2, RETRY_MAX_MS);
      }
      try {
        const r = await fetch(url, { credentials: 'include' });
        const j = await r.json();
        if (j && j.code === 0) return j;
        lastErr = new Error('code=' + (j && j.code) + ' ' + (j && j.message));
        log(`⚠ ${label} 返回 ${lastErr.message}`);
      } catch (e) {
        lastErr = e;
        const netErr = /Failed to fetch|NetworkError|load failed|Network request failed|NAME_NOT_RESOLVED|ERR_/i.test(
          String((e && e.message) || '')
        );
        log(`⚠ ${label} 请求异常：${netErr ? '网络中断 / DNS 解析失败' : (e && e.message)}`);
      }
    }
    throw lastErr || new Error(label + ' 失败');
  }

  // 每抓完一页就 saveState 落盘 —— 浏览器再崩也不丢已抓到的数据
  async function exportViaApi(mid, state) {
    const nav = await fetchJson('https://api.bilibili.com/x/web-interface/nav', 'nav（取 WBI 密钥）');
    if (!nav.data || !nav.data.wbi_img) throw new Error('拿不到 wbi_img（可能未登录）');
    const imgKey = nav.data.wbi_img.img_url.split('/').pop().split('.')[0];
    const subKey = nav.data.wbi_img.sub_url.split('/').pop().split('.')[0];
    const mixinKey = getMixinKey(imgKey, subKey);

    const known = new Set(state.videos.map((v) => v.bvid));
    let pn = state.nextPn || 1;
    let total = state.declaredTotal || Infinity;
    let sinceSave = 0;

    while (state.videos.length < total && pn <= 100) {
      const qs = encWbi(
        {
          mid,
          ps: PAGE_SIZE,
          pn,
          order: 'pubdate',
          platform: 'web',
          web_location: 1550101,
          // 这几个是页面真实请求会带的浏览器指纹参数，缺了容易吃 -352
          dm_img_list: '[]',
          dm_img_str: 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
          dm_cover_img_str:
            'QU5HTEUgKEludGVsLCBJbnRlbChSKSBVSEQgR3JhcGhpY3MgKDB4MDAwMDQ2RTYpIERpcmVjdDNEMTEgdnNfNV8wIFBzICAoRFgxMik=',
          dm_img_inter: '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}',
        },
        mixinKey
      );
      const j = await fetchJson('https://api.bilibili.com/x/space/wbi/arc/search?' + qs, `第 ${pn} 页`);
      const v = (j.data && j.data.list && j.data.list.vlist) || [];
      total = (j.data && j.data.page && j.data.page.count) || total;

      let added = 0;
      for (const item of v.map(normalize)) {
        if (known.has(item.bvid)) continue;
        known.add(item.bvid);
        state.videos.push(item);
        added++;
      }

      // ★ 关键：先把进度写下来，再决定下一步
      state.nextPn = pn + 1;
      state.declaredTotal = total === Infinity ? null : total;
      state.source = 'api';
      saveState(state);

      log(
        `✓ 第 ${pn} 页：新增 ${added} 条，累计 ${state.videos.length}/${total === Infinity ? '?' : total}（进度已保存）`
      );

      if (v.length === 0) break;
      if (total !== Infinity && state.videos.length >= total) break;
      pn++;
      await sleep(SLEEP_MS);
    }

    state.done = true;
    saveState(state);
    return state;
  }

  // 退化方案：滚页面 + 抓 DOM。拿不到简介，但 bvid/标题/封面/时长/播放量都有。
  // 同样是「边抓边存」，滚到一半崩了也不丢。
  async function exportViaDom(state) {
    const found = new Map(state.videos.map((v) => [v.bvid, v]));
    let stagnant = 0;
    let last = -1;
    for (let round = 0; round < 80 && stagnant < 6; round++) {
      for (const a of document.querySelectorAll('a[href*="/video/BV"]')) {
        const m = (a.getAttribute('href') || '').match(/\/video\/(BV[0-9A-Za-z]+)/);
        if (!m) continue;
        const bvid = m[1];
        if (found.has(bvid)) continue;
        const card = a.closest('li, .upload-video-card, .bili-video-card, .small-item, div') || a;
        const img = (a.querySelector('img') || card.querySelector('img') || {}).src || '';
        const text = (card.innerText || a.innerText || '').replace(/\s+/g, ' ');
        const dm = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        found.set(bvid, {
          bvid,
          title: (a.getAttribute('title') || a.innerText || '').trim().replace(/\s+/g, ' '),
          pubdate: dm ? Math.floor(new Date(`${dm[1]}-${dm[2]}-${dm[3]}T00:00:00+08:00`).getTime() / 1000) : null,
          description: '',
          cover: fixPic(img),
          duration: (text.match(/\b\d{1,2}:\d{2}\b/) || [null])[0],
          play: null,
        });
      }
      state.videos = [...found.values()];
      state.source = 'dom';
      saveState(state);
      log(`DOM 已收集 ${found.size} 条…（进度已保存）`);
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(1300);
      if (found.size === last) stagnant++;
      else stagnant = 0;
      last = found.size;
    }
    state.done = true;
    saveState(state);
    return state;
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);
  }

  /** 把 state 打包成 json 并触发下载 */
  function emit(state) {
    const payload = {
      exportedAt: new Date().toISOString(),
      mid: state.mid,
      source: state.source || 'api',
      count: state.videos.length,
      declaredTotal: state.declaredTotal || null,
      complete: !!state.done,
      videos: state.videos,
    };
    download(`bili-works-${state.mid}.json`, JSON.stringify(payload, null, 2));
    return payload;
  }

  async function main() {
    const mid = detectMid();
    log('目标 UID：' + mid);
    if (!/^\d+$/.test(mid)) {
      console.error('[bili-export] 识别不到 UID，请先把本文件顶部的 MID_OVERRIDE 改成你的 UID');
      return;
    }

    if (RESET_PROGRESS) {
      clearState(mid);
      log('已按 RESET_PROGRESS=true 清空断点，从头开始抓');
    }

    // ---- 断点续抓：先看 localStorage 里有没有上次的进度 ----
    let state = loadState(mid);
    if (state && state.videos && state.videos.length) {
      log(`🔁 检测到断点：已抓到 ${state.videos.length} 条，从第 ${state.nextPn} 页继续`);
      log('   （想从头重抓：把脚本顶部 RESET_PROGRESS 改成 true 再运行一次）');
    } else {
      state = {
        mid,
        source: 'api',
        startedAt: new Date().toISOString(),
        updatedAt: null,
        nextPn: 1,
        declaredTotal: null,
        videos: [],
        done: false,
      };
    }

    try {
      log('① 走接口（元数据最全）…');
      state = await exportViaApi(mid, state);
      log(`✅ 接口方式完成，共 ${state.videos.length} 条`);
    } catch (e) {
      console.warn('[bili-export] 接口方式最终失败：' + ((e && e.message) || e));
      if (state.videos.length > 0) {
        // 已经有部分数据：绝不丢掉，先导出一份，并告诉用户怎么续抓
        saveState(state);
        log(`⚠ 抓取中断，但已保存 ${state.videos.length} 条（进度存在这个浏览器里）`);
        log('   等网络恢复后，重新粘贴本脚本就会从断点继续，已抓到的不会重复。');
        log('   现在先把已有部分导出：');
        emit(state);
        return;
      }
      log('② 接口一条都没拿到，退化成 DOM 滚页抓取…');
      log('   请保持这个页面不动，脚本会自动滚动加载');
      try {
        state.source = 'dom';
        state = await exportViaDom(state);
        log(`✅ DOM 方式完成，共 ${state.videos.length} 条（没有简介字段）`);
      } catch (e2) {
        console.error('[bili-export] DOM 方式也失败了：', e2);
        return;
      }
    }

    const payload = emit(state);
    log(`🎉 已导出 ${payload.count} 条 → bili-works-${mid}.json`);
    log('   请把这个 json 放到项目根目录，然后运行： pnpm run import:bili');

    if (state.declaredTotal && state.videos.length < state.declaredTotal) {
      log(`⚠ 注意：B 站声明共 ${state.declaredTotal} 条，但只抓到 ${state.videos.length} 条。`);
      log('   可以再粘贴一次本脚本续抓，或把 RESET_PROGRESS 改成 true 重抓。');
    }

    console.table(
      state.videos.slice(0, 10).map((v) => ({
        bvid: v.bvid,
        标题: String(v.title).slice(0, 30),
        日期: v.pubdate ? new Date(v.pubdate * 1000).toLocaleDateString('zh-CN') : '—',
      }))
    );
    return payload;
  }

  // 暴露出来方便单测（node 里 import 本文件即可拿到这些函数）
  globalThis.__biliExport = {
    md5,
    getMixinKey,
    encWbi,
    normalize,
    fixPic,
    loadState,
    saveState,
    clearState,
    emit,
    exportViaApi,
    exportViaDom,
    /** 看当前断点进度：__biliExport.status() */
    status: (mid) => {
      const st = loadState(mid || detectMid());
      if (!st) return console.log('[bili-export] 没有已保存的进度');
      console.log(
        `[bili-export] 已抓 ${st.videos.length} 条，下一页 pn=${st.nextPn}，done=${st.done}，更新于 ${st.updatedAt}`
      );
      return st;
    },
    /** 不重新抓，直接把断点里的数据导出成 json：__biliExport.dump() */
    dump: (mid) => {
      const st = loadState(mid || detectMid());
      if (!st || !st.videos.length) return console.warn('[bili-export] 没有可导出的进度');
      emit(st);
      console.log(`[bili-export] 已导出 ${st.videos.length} 条`);
    },
    /** 清空断点（下次从头抓）：__biliExport.reset() */
    reset: (mid) => {
      clearState(mid || detectMid());
      console.log('[bili-export] 断点已清空，下次运行会从头抓');
    },
  };

  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    main();
  } else {
    console.log('[bili-export] 这是给浏览器控制台用的脚本，不要用 node 直接运行它。');
  }
})();
