import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { byDateDesc } from '../utils/notes';
import { site } from '../site.config';

/**
 * RSS 订阅源 —— 博客 + 笔记合并输出。
 * 手写 XML，避免额外依赖。
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const GET: APIRoute = async ({ site: astroSite }) => {
  const base = (astroSite?.href ?? 'https://example.com').replace(/\/$/, '');

  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .map((p) => ({
      title: p.data.title,
      description: p.data.description,
      date: p.data.date,
      url: `${base}/blog/${p.id}/`,
    }));

  const notes = (await getCollection('notes'))
    .filter((n) => n.data.kind !== 'moc')
    .map((n) => ({
      title: n.data.title,
      description: `${n.data.category}${n.data.subfield ? ' · ' + n.data.subfield : ''}`,
      date: n.data.date ? new Date(n.data.date) : new Date(0),
      url: `${base}/notes/${n.id}/`,
    }))
    .filter((n) => n.date.getTime() > 0);

  const items = [...posts, ...notes]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 60);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${base}/</link>
    <description>${esc(site.description)}</description>
    <language>${site.lang}</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${i.url}</link>
      <guid isPermaLink="true">${i.url}</guid>
      <description>${esc(i.description)}</description>
      <pubDate>${i.date.toUTCString()}</pubDate>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
