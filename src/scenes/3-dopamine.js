'use strict';
// 第 3 段：动力（多巴胺）
// 顶层名字一律带本段前缀 S3 / s3，避免和其他段撞名。
// 画面：满屏考试周书桌 → 讲台上一张贯穿 L2–L7 的多巴胺曲线图（基线、峰、低谷、门槛、叠加、平缓）→ 对策卡片
//       → 满屏上楼梯（每级一朵小火花）→ 讲台上灰色的路 + 尽头的大餐。
const S3LINES = seq(1.0, [
  ['第三页：为什么考试周什么都不想干？聊聊多巴胺。', { hold: .6 }],
  ['多巴胺管的是“想要”和“动力”。平时，它待在一条基线上。', { hold: .4 }],
  ['爽到的时候它冲高，冲完却会掉到基线以下，还要待上一阵。', { hold: .8 }],
  ['刷短视频：一条比一条刺激，快乐的门槛越抬越高。', { hold: 1.0 }],
  ['刷完两小时再看课本，当然一点感觉都没有。', { mood: 'annoyed', hold: .5 }],
  ['快乐还会叠加：边吃饭、边追剧、边回消息，峰越高，坑越深。', { hold: .8 }],
  ['对策一：别每次都叠满 buff，偶尔只做事情本身。', { hold: .6 }],
  ['对策二：把努力本身，当成奖励。', { mood: 'smile', hold: .5 }],
  ['“我正在变强”——这个念头，也能让多巴胺出来干活。', { pause: .2, hold: .7 }],
  ['只盯着考完那顿大餐，过程就只剩硬熬。', { mood: 'smug', pause: .2, hold: .6 }],
]);
const S3T = i => S3LINES[i][0], S3E = i => S3LINES[i][1];
const S3DUR = seqEnd(S3LINES) + 1.0;
const S3BC = [STAGE.board.x + STAGE.board.w / 2, STAGE.board.y + STAGE.board.h / 2];   // 黑板中心（推镜头用）

// ===================== 曲线图 =====================
// 图的几何：纵轴 x0，横轴 yAx，基线 yb；v = 0 在基线，v = 1 向上 up 像素，v = -1 向下 dn 像素
const S3G = { x0: 800, x1: 1640, yTop: 236, yAx: 792, yb: 560, up: 290, dn: 212 };
const s3X = u => S3G.x0 + 12 + u * (S3G.x1 - S3G.x0 - 40);
const s3Y = v => v >= 0 ? S3G.yb - v * S3G.up : S3G.yb - v * S3G.dn;
const s3Lin = x => x;
// 一次「爽」：u 起点，r 上升，a 峰高，f 回落，d 掉到基线下多深，h 在坑里待多久，rc 爬回基线
function s3Ev(u, e) {
  const a = e.u, b = a + e.r, d = b + e.f, g = d + e.h, z = g + e.rc;
  if (u <= a || u >= z) return 0;
  if (u < b) return e.a * easeSine((u - a) / e.r);
  if (u < d) return lerp(e.a, -e.d, easeIO((u - b) / e.f));
  if (u < g) return -e.d;
  return lerp(-e.d, 0, easeSine((u - g) / e.rc));
}
const s3Sum = evs => u => evs.reduce((s, e) => s + s3Ev(u, e), 0);
// A：一次爽 → 低谷 → 回来
const S3A = s3Sum([{ u: .2, r: .07, a: .85, f: .12, d: .55, h: .2, rc: .14 }]);
// B：刷短视频，一条比一条高；最后是课本（几乎不动）
const S3BK = [0, 1, 2, 3].map(k => ({ u: .05 + k * .18, r: .035, a: .42 + k * .14, f: .06, d: .14 + k * .05, h: .03, rc: .045 }));
const S3B = s3Sum([...S3BK, { u: .82, r: .025, a: .04, f: .035, d: .01, h: 0, rc: .02 }]);
const S3BPK = S3BK.map(e => e.u + e.r);    // 每个尖峰的位置
const s3Th = u => .3 + S3BPK.reduce((s, pk) => s + .15 * sm(pk, pk + .025, u, easeOutBack), 0);   // 快乐门槛
// C：三样叠在一起：超高峰，超深坑
const S3C = s3Sum([{ u: .16, r: .07, a: 1.15, f: .14, d: 1.0, h: .32, rc: .16 }]);
// D：只做一件事：平缓的小起伏
const S3D = s3Sum([0, 1, 2].map(k => ({ u: .17 + k * .26, r: .07, a: .28, f: .09, d: .07, h: .03, rc: .06 })));

// s3Axes：坐标轴 + 标签。k 画出进度 0..1
function s3Axes(c, tau, k) {
  const { x0, x1, yTop, yAx } = S3G, py = sm(0, .45, k), px = sm(.25, .75, k);
  rline(c, [[x0, yAx], [x0, yTop]], { w: 5, p: py, seed: 301, t: tau });
  rline(c, [[x0, yAx], [x1, yAx]], { w: 5, p: px, seed: 302, t: tau });
  if (py >= 1) rline(c, [[x0 - 14, yTop + 22], [x0, yTop], [x0 + 14, yTop + 22]], { w: 5, seed: 303, t: tau });
  if (px >= 1) rline(c, [[x1 - 22, yAx - 14], [x1, yAx], [x1 - 22, yAx + 14]], { w: 5, seed: 304, t: tau });
  zh(c, '多巴胺', x0 + 22, yTop + 30, { size: 40, p: sm(.4, .8, k, s3Lin) });
  zh(c, '时间', x1 + 14, yAx + 12, { size: 36, color: P.ink2, p: sm(.75, 1, k, s3Lin) });
}
// s3Baseline：虚线基线 + 「基线」
function s3Baseline(c, tau, p) {
  const { x0, x1, yb } = S3G;
  rline(c, [[x0, yb], [x1 - 10, yb]], { w: 4, color: P.ink2, p, seed: 305, t: tau, dash: [18, 12], al: .8 });
  zh(c, '基线', x1 - 12, yb - 14, { size: 34, color: P.ink2, align: 'right', p: sm(.6, 1, p, s3Lin) });
}
// s3Curve：画 v = f(u)，u 从 0 画到 uh（rline 的 p 按弧长对到 uh）；dip 为 true 时把基线下面填浅红
function s3Curve(c, tau, f, uh, o = {}) {
  const { color = P.purple, w = 7, seed = 310, dip = true, head = true, u1 = 1, al = 1 } = o;
  if (uh <= 0) return;
  const n = Math.ceil(u1 * 320), pts = [], cum = [0];
  for (let i = 0; i <= n; i++) { const u = u1 * i / n; pts.push([s3X(u), s3Y(f(u))]); if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); }
  const ih = clamp(uh / u1 * n, 0, n), i0 = Math.floor(ih), lh = i0 >= n ? cum[n] : lerp(cum[i0], cum[i0 + 1], ih - i0);
  fade(c, al, () => {
    if (dip) {   // 低谷填色：基线和曲线之间（只有 v < 0 的部分）
      const fp = [[s3X(0), S3G.yb]]; for (let i = 0; i <= i0; i++) fp.push([pts[i][0], Math.max(S3G.yb, pts[i][1])]);
      const ux = s3X(Math.min(uh, u1)); fp.push([ux, Math.max(S3G.yb, s3Y(f(Math.min(uh, u1))))], [ux, S3G.yb]);
      c.save(); c.fillStyle = alpha(P.red, .22); c.fill(polyPath(fp)); c.restore();
    }
    rline(c, pts, { w, color, p: lh / cum[n], seed, t: tau, amp: 1.2 });
    if (head && uh < u1) {   // 笔尖的小光点
      const hx = s3X(uh), hy = s3Y(f(uh)), g = c.createRadialGradient(hx, hy, 2, hx, hy, 34);
      g.addColorStop(0, alpha(P.moon, .7)); g.addColorStop(1, alpha(P.moon, 0));
      c.save(); c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 34, 0, TAU); c.fill(); c.restore();
      rshape(c, circPts(hx, hy, 10, 16), { fill: P.moon, stroke: P.ink, w: 3, seed: 311, t: tau });
    }
  });
}
// s3Pill：小标签（圆角 + 字）
function s3Pill(c, tau, x, y, text, k, o = {}) {
  const { size = 36, fill = P.pink, color = P.ink, seed = 320 } = o, w = zhWidth(c, text, size) + 36, h = size + 22;
  pop(c, x, y, easeOutBack(clamp(k, 0, 1)), () => {
    rshape(c, rectPts(x - w / 2, y - h / 2, w, h, h / 2), { fill, w: 4, seed, t: tau });
    zh(c, text, x, y + 2, { size, color, align: 'center', base: 'middle' });
  });
}
// s3Card：对策卡片（左边一枚金色书签）
function s3Card(c, tau, x, y, w, h, text, t0, o = {}) {
  const { size = 46 } = o, k = sm(t0, t0 + .45, tau, easeOutBack);
  pop(c, x + w / 2, y + h / 2, k, () => {
    rshape(c, rectPts(x, y, w, h, 14), { fill: mix(P.paper, '#ffffff', .6), w: 5, seed: 330, t: tau });
    rshape(c, [[x + 18, y - 8], [x + 52, y - 8], [x + 52, y + h - 10], [x + 35, y + h - 24], [x + 18, y + h - 10]], { fill: P.moon, w: 3, seed: 331, t: tau });
    zh(c, text, x + 72, y + h / 2 + 2, { size, base: 'middle', p: writeP(tau, t0 + .25, text, .06) });
  });
}
// s3Burst：一圈放射线 + 闪光，k 0..1
function s3Burst(c, x, y, k, r = 70, seed = 1, color = P.sun) {
  if (k <= 0 || k >= 1) return;
  const a = 1 - k, n = 8;
  for (let i = 0; i < n; i++) { const ang = i / n * TAU + hash(i, seed) * .4, r0 = r * (.35 + .65 * easeOut(k)) * .55, r1 = r * (.35 + .65 * easeOut(k));
    rline(c, [[x + Math.cos(ang) * r0, y + Math.sin(ang) * r0], [x + Math.cos(ang) * r1, y + Math.sin(ang) * r1]], { w: 5, color, al: a, seed: seed + i }); }
  for (let i = 0; i < 5; i++) { const ang = hash(i, seed + 7) * TAU, rr = r * (.6 + .6 * easeOut(k)) * (.6 + .4 * hash(i, seed + 3));
    sparkle(c, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, 16 * a + 4, { color: i % 2 ? '#fff6d8' : P.moon, al: a }); }
}

// ===================== 道具 =====================
function s3Phone(c, tau, x, y, s = 1, o = {}) {
  const { seed = 340, glow = 1 } = o, w = 50 * s, h = 88 * s;
  if (glow > 0) { const g = c.createRadialGradient(x, y, 4, x, y, 80 * s); g.addColorStop(0, alpha(P.sky, .55 * glow)); g.addColorStop(1, alpha(P.sky, 0)); c.save(); c.fillStyle = g; c.beginPath(); c.arc(x, y, 80 * s, 0, TAU); c.fill(); c.restore(); }
  rshape(c, rectPts(x - w / 2, y - h / 2, w, h, 10 * s), { fill: P.ink, w: 4, seed, t: tau });
  rshape(c, rectPts(x - w / 2 + 6 * s, y - h / 2 + 10 * s, w - 12 * s, h - 22 * s, 4 * s), { fill: mix(P.sky, P.blue, .35), stroke: false, seed: seed + 1, t: tau });
  rshape(c, [[x - 8 * s, y - 14 * s], [x + 13 * s, y - 2 * s], [x - 8 * s, y + 10 * s]], { fill: P.paper, stroke: false, seed: seed + 2, t: tau });
}
function s3Textbook(c, tau, x, y, s = 1) {
  const w = 120 * s, h = 88 * s;
  rshape(c, rectPts(x - w / 2 + 6 * s, y - h / 2 + 8 * s, w, h, 6 * s), { fill: P.paper2, w: 4, seed: 350, t: tau });
  rshape(c, rectPts(x - w / 2, y - h / 2, w, h, 6 * s), { fill: P.green, w: 4, seed: 351, t: tau });
  rline(c, [[x - w / 2 + 14 * s, y - h / 2 + 4], [x - w / 2 + 14 * s, y + h / 2 - 4]], { w: 3, color: P.ink, seed: 352, t: tau });
  zh(c, '课本', x + 8 * s, y + 2, { size: 34 * s, color: P.paper, align: 'center', base: 'middle' });
}
function s3Bowl(c, tau, x, y, s = 1) {   // (x, y) 碗底
  const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; pts.push([x + Math.cos(a) * 50 * s, y - 38 * s + Math.sin(a) * 38 * s]); }
  rshape(c, ellPts(x, y - 40 * s, 44 * s, 20 * s, 24), { fill: '#fffaf0', w: 4, seed: 360, t: tau, smooth: true });
  rshape(c, [[x + 50 * s, y - 38 * s], ...pts.slice(1, -1), [x - 50 * s, y - 38 * s]], { fill: P.red, w: 4, seed: 361, t: tau });
  rline(c, [[x - 30 * s, y - 20 * s], [x + 30 * s, y - 20 * s]], { w: 4, color: P.paper, seed: 362, t: tau, al: .8 });
  rline(c, [[x + 8 * s, y - 50 * s], [x + 58 * s, y - 92 * s]], { w: 5, color: P.shelf2, seed: 363, t: tau });
  rline(c, [[x + 18 * s, y - 46 * s], [x + 70 * s, y - 80 * s]], { w: 5, color: P.shelf2, seed: 364, t: tau });
}
function s3TV(c, tau, x, y, s = 1) {   // (x, y) 底
  const w = 104 * s, h = 70 * s, top = y - h - 10 * s;
  rline(c, [[x - 6 * s, top], [x - 26 * s, top - 26 * s]], { w: 4, seed: 370, t: tau });
  rline(c, [[x + 6 * s, top], [x + 26 * s, top - 26 * s]], { w: 4, seed: 371, t: tau });
  rshape(c, rectPts(x - w / 2, top, w, h, 10 * s), { fill: P.purple, w: 4, seed: 372, t: tau });
  rshape(c, rectPts(x - w / 2 + 9 * s, top + 8 * s, w - 18 * s, h - 16 * s, 5 * s), { fill: P.sky, stroke: false, seed: 373, t: tau });
  rshape(c, heartPts(x, top + h / 2 + 2 * s, 17 * s, 30), { fill: P.pink, w: 3, seed: 374, t: tau });
  rline(c, [[x - 24 * s, y - 10 * s], [x - 30 * s, y]], { w: 4, seed: 375, t: tau });
  rline(c, [[x + 24 * s, y - 10 * s], [x + 30 * s, y]], { w: 4, seed: 376, t: tau });
}
function s3Msg(c, tau, x, y, s = 1) {   // (x, y) 中心
  const w = 100 * s, h = 64 * s;
  rshape(c, [[x - 20 * s, y + h / 2 - 4], [x - 34 * s, y + h / 2 + 18 * s], [x - 2 * s, y + h / 2 - 4]], { fill: P.green, w: 4, seed: 380, t: tau });
  rshape(c, rectPts(x - w / 2, y - h / 2, w, h, 20 * s), { fill: P.green, w: 4, seed: 381, t: tau });
  for (let i = -1; i <= 1; i++) rshape(c, circPts(x + i * 22 * s, y, 7 * s, 10), { fill: P.paper, stroke: false, seed: 382 + i });
  rshape(c, circPts(x + w / 2 - 4 * s, y - h / 2 + 2 * s, 19 * s, 16), { fill: P.red, w: 3, seed: 386, t: tau });
  zh(c, '9', x + w / 2 - 4 * s, y - h / 2 + 4 * s, { size: 30 * s, color: P.paper, align: 'center', base: 'middle' });
}
function s3Gift(c, tau, x, y, s = 1, open = 0) {   // (x, y) 盒底中心
  const w = 120 * s, h = 90 * s;
  if (open > 0) { const g = c.createRadialGradient(x, y - h, 5, x, y - h, 160 * s); g.addColorStop(0, alpha(P.moon, .6 * open)); g.addColorStop(1, alpha(P.moon, 0)); c.save(); c.fillStyle = g; c.beginPath(); c.arc(x, y - h, 160 * s, 0, TAU); c.fill(); c.restore(); }
  rshape(c, rectPts(x - w / 2, y - h, w, h, 6), { fill: P.red, w: 4, seed: 390, t: tau });
  rshape(c, rectPts(x - 12 * s, y - h, 24 * s, h, 2), { fill: P.gold, w: 3, seed: 391, t: tau });
  c.save(); c.translate(x - w / 2 - 8 * s, y - h); c.rotate(-.55 * easeOutBack(open)); c.translate(0, -60 * s * open);
  rshape(c, rectPts(0, -26 * s, w + 16 * s, 26 * s, 5), { fill: P.red, w: 4, seed: 392, t: tau });
  rshape(c, rectPts(w / 2 - 4 * s, -26 * s, 24 * s, 26 * s, 2), { fill: P.gold, w: 3, seed: 393, t: tau });
  rshape(c, ellPts(w / 2 - 14 * s, -38 * s, 22 * s, 12 * s, 16, -.5), { fill: P.gold, w: 3, seed: 394, t: tau });
  rshape(c, ellPts(w / 2 + 30 * s, -38 * s, 22 * s, 12 * s, 16, .5), { fill: P.gold, w: 3, seed: 395, t: tau });
  c.restore();
  if (open > .3) for (let i = 0; i < 4; i++) sparkle(c, x + (i - 1.5) * 34 * s, y - h - 40 * s - 30 * s * Math.sin(tau * 3 + i) * open, 14 + 6 * Math.sin(tau * 5 + i * 2), { color: i % 2 ? P.moon : '#fff6d8' });
}
function s3Pencil(c, tau, x, y, s = 1) {   // 笔在纸上写 + 汗
  rshape(c, rectPts(x - 80 * s, y - 20 * s, 160 * s, 100 * s, 6), { fill: '#fffaf0', w: 4, seed: 400, t: tau });
  const wr = (Math.sin(twos(tau) * 9) + 1) * .5;
  for (let i = 0; i < 3; i++) rline(c, [[x - 60 * s, y + (8 + i * 22) * s], [x + (i < 2 ? 50 : 10 + 30 * wr) * s, y + (8 + i * 22) * s]], { w: 3, color: P.ink2, seed: 401 + i, t: tau, amp: 3 });
  c.save(); c.translate(x + (30 + 20 * wr) * s, y + 40 * s); c.rotate(-.8);
  rshape(c, [[0, 0], [16 * s, -12 * s], [16 * s, 12 * s]], { fill: P.paper2, w: 3, seed: 405, t: tau });
  rshape(c, rectPts(16 * s, -12 * s, 100 * s, 24 * s), { fill: P.sun, w: 4, seed: 406, t: tau });
  rshape(c, rectPts(116 * s, -12 * s, 20 * s, 24 * s, 4), { fill: P.pink, w: 4, seed: 407, t: tau });
  c.restore();
  for (let i = 0; i < 2; i++) { const bob = Math.sin(tau * 4 + i * 2) * 5; s3Drop(c, tau, x - (70 - i * 30) * s, y - (50 + i * 24) * s + bob, 14 * s, 410 + i); }
}
function s3Drop(c, tau, x, y, r, seed = 1) {   // 汗滴
  rshape(c, [[x, y - r * 1.8], [x + r, y - r * .1], ...circPts(x, y, r, 16).slice(1, 8), [x - r, y - r * .1]], { fill: P.sky, w: 3, seed, t: tau, smooth: true });
}
function s3Feast(c, tau, x, y, s = 1, glow = 1) {   // 大餐：(x, y) 盘子中心
  const g = c.createRadialGradient(x, y - 30 * s, 10, x, y - 30 * s, 190 * s);
  g.addColorStop(0, alpha(P.moon, .55 * glow)); g.addColorStop(1, alpha(P.moon, 0));
  c.save(); c.fillStyle = g; c.beginPath(); c.arc(x, y - 30 * s, 190 * s, 0, TAU); c.fill(); c.restore();
  rshape(c, ellPts(x, y, 120 * s, 34 * s, 32), { fill: '#fffaf0', w: 4, seed: 420, t: tau });
  rshape(c, ellPts(x, y - 2 * s, 90 * s, 22 * s, 32), { fill: P.paper2, stroke: false, seed: 421 });
  // 鸡腿
  rshape(c, ellPts(x - 30 * s, y - 26 * s, 50 * s, 32 * s, 24, -.3), { fill: mix(P.orange, P.shelf2, .35), w: 4, seed: 422, t: tau, smooth: true });
  rline(c, [[x + 10 * s, y - 44 * s], [x + 48 * s, y - 64 * s]], { w: 12 * s, color: '#fffaf0', seed: 423, t: tau });
  rshape(c, circPts(x + 54 * s, y - 68 * s, 10 * s, 12), { fill: '#fffaf0', w: 3, seed: 424, t: tau });
  // 蛋糕
  rshape(c, rectPts(x + 50 * s, y - 50 * s, 60 * s, 40 * s, 6), { fill: P.pink, w: 4, seed: 425, t: tau });
  rshape(c, ellPts(x + 80 * s, y - 60 * s, 12 * s, 12 * s, 12), { fill: P.red, w: 3, seed: 426, t: tau });
  for (let i = 0; i < 4; i++) { const a = tau * 1.4 + i * 1.7; sparkle(c, x + Math.cos(a) * 140 * s, y - 60 * s + Math.sin(a * 1.3) * 60 * s, (12 + 6 * Math.sin(tau * 5 + i)) * glow, { color: i % 2 ? P.moon : '#fff6d8' }); }
  for (let i = 0; i < 3; i++) rline(c, [[x - 40 * s + i * 40 * s, y - 70 * s], [x - 30 * s + i * 40 * s, y - 95 * s], [x - 40 * s + i * 40 * s, y - 120 * s]], { w: 3, color: P.faint, seed: 427 + i, t: tau, smooth: true, al: .7 * glow });
}
function s3Tea(c, tau, x, y, s = 1, k = 1) {   // 奶茶（外卖），(x, y) 杯底
  pop(c, x, y, k, () => {
    rline(c, [[x + 10 * s, y - 130 * s], [x + 26 * s, y - 196 * s]], { w: 9 * s, color: P.pink, seed: 450, t: tau });
    rshape(c, [[x - 44 * s, y - 130 * s], [x + 44 * s, y - 130 * s], [x + 34 * s, y], [x - 34 * s, y]], { fill: mix(P.orange, P.paper, .55), w: 4, seed: 451, t: tau });
    rshape(c, rectPts(x - 50 * s, y - 142 * s, 100 * s, 14 * s, 4), { fill: P.paper, w: 4, seed: 452, t: tau });
    for (let i = 0; i < 6; i++) rshape(c, circPts(x - 22 * s + (i % 3) * 22 * s, y - 16 * s - Math.floor(i / 3) * 18 * s, 8 * s, 10), { fill: P.ink, stroke: false, seed: 453 + i });
  });
}
function s3Star(c, tau, x, y, r, text, k, rot = 0) {
  pop(c, x, y, easeOutBack(clamp(k, 0, 1), 2.4), () => {
    rshape(c, starPts(x, y, r, 5, .56, rot + Math.sin(tau * 3) * .06), { fill: P.sun, w: 5, seed: 430, t: tau });
    zh(c, text, x + 2, y + 8, { size: r * .56, align: 'center', base: 'middle', color: P.ink });
  });
}
// s3Scribble：头顶一团乱线（一直在转）
function s3Scribble(c, tau, x, y, r, p = 1, seed = 440) {
  const pts = [], ph = twos(tau) * 1.6;
  for (let i = 0; i < 110; i++) { const th = i * .42 + ph, rr = r * (.4 + .6 * hash(i >> 3, seed)),
    cx = x + r * .45 * noise1(i * .06 + ph * .3, seed), cy = y + r * .22 * noise1(i * .06 + ph * .3, seed + 3);
    pts.push([cx + Math.cos(th) * rr, cy + Math.sin(th) * rr * .62]); }
  rline(c, pts, { w: 4, color: P.ink2, p, seed, t: tau, smooth: true, amp: 2 });
}

// ===================== 大学生小人 =====================
// s3Head：圆头 + 短发 + 简单五官。face：'normal' | 'happy' | 'blank' | 'tired' | 'grim' | 'sleep'
function s3Head(c, tau, x, y, r, o = {}) {
  const { face = 'normal', seed = 460, look = 0 } = o;
  rshape(c, circPts(x, y, r, 28), { fill: P.skin, w: 4, seed, t: tau });
  const hp = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + .1 + i / 12 * (Math.PI - .2); hp.push([x + Math.cos(a) * r * 1.06, y + Math.sin(a) * r * 1.06]); }
  hp.push([x + r * .9, y - r * .25], [x + r * .45, y - r * .42], [x + r * .1, y - r * .28], [x - r * .35, y - r * .45], [x - r * .8, y - r * .2]);
  rshape(c, hp, { fill: P.ink, w: 3, seed: seed + 1, t: tau });
  const ex = r * .36, ey = y + r * .12, mx = x + look * r * .1, my = y + r * .5, lw = Math.max(3, r * .08);
  const ln = (pts, sd, col = P.ink) => rline(c, pts, { w: lw, color: col, seed: seed + sd, t: tau });
  const dot = (px, py, rr) => rshape(c, circPts(px, py, rr, 10), { fill: P.ink, stroke: false, seed: seed + 9 });
  if (face === 'happy') {
    ln([[mx - ex - r * .14, ey + r * .04], [mx - ex, ey - r * .1], [mx - ex + r * .14, ey + r * .04]], 2);
    ln([[mx + ex - r * .14, ey + r * .04], [mx + ex, ey - r * .1], [mx + ex + r * .14, ey + r * .04]], 3);
    rshape(c, [[mx - r * .22, my - r * .06], [mx + r * .22, my - r * .06], [mx, my + r * .2]], { fill: P.red, w: lw * .8, seed: seed + 4, t: tau, smooth: true });
    for (const sx of [-1, 1]) rshape(c, ellPts(mx + sx * r * .58, ey + r * .24, r * .14, r * .08, 12), { fill: alpha(P.blush, .8), stroke: false, seed: seed + 5 });
  } else if (face === 'sleep') {
    ln([[mx - ex - r * .14, ey], [mx - ex, ey + r * .08], [mx - ex + r * .14, ey]], 2);
    ln([[mx + ex - r * .14, ey], [mx + ex, ey + r * .08], [mx + ex + r * .14, ey]], 3);
    rshape(c, ellPts(mx, my + r * .02, r * .07, r * .09, 10), { fill: P.ink2, stroke: false, seed: seed + 4 });
  } else if (face === 'tired') {
    ln([[mx - ex - r * .15, ey], [mx - ex + r * .15, ey + r * .03]], 2); ln([[mx + ex - r * .15, ey + r * .03], [mx + ex + r * .15, ey]], 3);
    for (const sx of [-1, 1]) ln([[mx + sx * ex - r * .13, ey + r * .14], [mx + sx * ex, ey + r * .2], [mx + sx * ex + r * .13, ey + r * .14]], 6 + sx, alpha(P.purple, .7));
    ln([[mx - r * .18, my + r * .02], [mx - r * .06, my - r * .04], [mx + r * .06, my + r * .03], [mx + r * .18, my - r * .02]], 4);
  } else if (face === 'grim') {
    dot(mx - ex, ey + r * .04, r * .07); dot(mx + ex, ey + r * .04, r * .07);
    ln([[mx - ex - r * .15, ey - r * .22], [mx - ex + r * .14, ey - r * .13]], 2); ln([[mx + ex - r * .14, ey - r * .13], [mx + ex + r * .15, ey - r * .22]], 3);
    ln([[mx - r * .18, my + r * .06], [mx, my - r * .04], [mx + r * .18, my + r * .06]], 4);
  } else if (face === 'blank') {
    dot(mx - ex, ey, r * .06); dot(mx + ex, ey, r * .06);
    ln([[mx - r * .14, my], [mx + r * .14, my]], 4);
  } else {
    dot(mx - ex, ey, r * .075); dot(mx + ex, ey, r * .075);
    ln([[mx - r * .15, my - r * .02], [mx, my + r * .07], [mx + r * .15, my - r * .02]], 4);
  }
}
// s3Student：大学生小人（圆头、简单五官、彩色上衣）。(x, y) 脚底中心，s = 1 时约 250 高。
//   o = { pose: 'stand'|'walk'|'slump', phase 走路相位 0..1, face, shirt, facing, seed, al, hop 0..1 抬腿 }
//   'slump'：趴桌子，(x, y) 是桌面上脑袋下面那一点
function s3Student(c, tau, x, y, s = 1, o = {}) {
  const { pose = 'stand', phase = 0, face = 'normal', shirt = P.teal, facing = 1, seed = 480, al = 1, hop = 0 } = o;
  c.save(); c.globalAlpha *= al; c.translate(x, y); c.scale(s * facing, s);
  if (pose === 'slump') {
    const br = Math.sin(tau * 1.6) * 3;   // 呼吸
    rshape(c, [[-120, 0], [-108, -96 + br], [-46, -128 + br], [46, -128 + br], [108, -96 + br], [120, 0]], { fill: shirt, w: 4, seed, t: tau, smooth: true });
    rshape(c, ellPts(-86, -16, 74, 20, 24, .06), { fill: mix(shirt, '#ffffff', .12), w: 4, seed: seed + 2, t: tau });
    s3Head(c, tau, -10, -84 + br * .6, 60, { face, seed: seed + 10 });
    rshape(c, ellPts(70, -14, 80, 20, 24, -.05), { fill: mix(shirt, '#ffffff', .12), w: 4, seed: seed + 3, t: tau });
    rshape(c, circPts(142, -16, 16, 14), { fill: P.skin, w: 3, seed: seed + 4, t: tau });
  } else {
    const walk = pose === 'walk', sw = walk ? Math.sin(phase * TAU) : 0, bob = walk ? -Math.abs(Math.cos(phase * TAU)) * 6 : 0;
    const hipY = -84 + bob, shY = hipY - 80;
    const leg = (sx, k, sd) => { const fx = sx + k * 24, fy = -2 - Math.max(0, -k) * hop * 30;
      rline(c, [[sx, hipY], [lerp(sx, fx, .5) + 4, (hipY + fy) / 2], [fx, fy]], { w: 16, color: P.ink2, seed: seed + sd, t: tau });
      rshape(c, ellPts(fx + 8, fy + 2, 17, 8, 12), { fill: P.ink, stroke: false, seed: seed + sd + 1 }); };
    leg(-14, sw, 1); leg(14, -sw, 3);
    const arm = (sx, k, sd) => { const hx = sx * 1.25 - k * 26, hy = shY + 64;
      rline(c, [[sx, shY + 10], [hx, hy]], { w: 14, color: shirt, seed: seed + sd, t: tau });
      rshape(c, circPts(hx, hy + 4, 9, 10), { fill: P.skin, w: 3, seed: seed + sd + 1 }); };
    arm(-30, sw, 5);
    rshape(c, [[-34, hipY + 6], [-30, shY + 4], [-14, shY - 4], [14, shY - 4], [30, shY + 4], [34, hipY + 6]], { fill: shirt, w: 4, seed: seed + 7, t: tau, smooth: false });
    arm(30, -sw, 8);
    s3Head(c, tau, 0, shY - 44, 46, { face, seed: seed + 10 });
  }
  c.restore();
}

// ===================== 满屏 1：考试周书桌 =====================
const S3BOOKS = [   // [堆 x, 书宽, 书高, 颜色, 书脊字]
  [[400, 250, 46, P.red, '高数'], [400, 220, 40, P.blue], [400, 270, 48, P.green, '线代'], [400, 230, 38, P.orange], [400, 250, 46, P.purple, '大物'], [400, 210, 40, P.teal], [400, 240, 44, P.sun]],
  [[1450, 260, 46, P.blue, '英语'], [1450, 230, 40, P.pink], [1450, 250, 44, P.teal], [1450, 220, 38, P.red, '概率'], [1450, 240, 44, P.green]],
  [[660, 170, 36, P.orange], [660, 190, 38, P.sky], [660, 160, 34, P.purple]],
];
function s3Desk(c, tau, t0) {
  const u = tau - t0, z = 1 + .07 * sm(0, 6, u, easeSine);
  c.save(); c.fillStyle = P.night; c.fillRect(0, 0, W, H);
  c.translate(960, 600); c.scale(z, z); c.translate(-960, -600);
  // 墙
  const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, P.night2); g.addColorStop(1, P.night3); c.fillStyle = g; c.fillRect(-100, -100, W + 200, 900);
  // 窗：夜里的月亮
  rshape(c, rectPts(1180, 90, 380, 300, 8), { fill: P.night, stroke: P.shelf2, w: 10, seed: 500, t: tau });
  rline(c, [[1370, 90], [1370, 390]], { w: 8, color: P.shelf2, seed: 501, t: tau });
  rline(c, [[1180, 240], [1560, 240]], { w: 8, color: P.shelf2, seed: 502, t: tau });
  drawMoonIcon(c, 1470, 165, 38, P.moon, -.4);
  for (let i = 0; i < 7; i++) sparkle(c, 1210 + hash(i, 3) * 320, 110 + hash(i, 4) * 260, 5 + 4 * Math.sin(tau * 3 + i), { color: '#fff6d8', al: .8 });
  // 挂历「考试周」
  const ck = sm(.1, .5, u, easeOutBack);
  c.save(); c.translate(20, 60);
  pop(c, 330, 120, ck, () => {
    rline(c, [[330, 60], [330, 100]], { w: 4, color: P.faint, seed: 503 });
    rshape(c, rectPts(170, 100, 320, 290, 10), { fill: P.paper, w: 5, seed: 504, t: tau });
    rshape(c, rectPts(170, 100, 320, 80, 10), { fill: P.red, w: 5, seed: 505, t: tau });
    zh(c, '考试周', 330, 157, { size: 50, color: P.paper, align: 'center' });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
      const cx = 212 + k * 78, cy = 216 + r * 58, id = r * 4 + k;
      rline(c, rectPts(cx - 30, cy - 22, 60, 44), { w: 2, color: P.faint, close: true, seed: 510 + id });
      if (hash(id, 9) < .55) cross(c, cx, cy, 36, { p: sm(.6 + id * .08, .9 + id * .08, u, s3Lin), t: tau, seed: 530 + id });
    }
  });
  c.restore();
  // 台灯光
  const lg = c.createRadialGradient(1300, 560, 20, 1300, 640, 620); lg.addColorStop(0, alpha(P.lamp, .45)); lg.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = lg; c.fillRect(-100, 0, W + 200, 900);
  rline(c, [[1700, 740], [1650, 520], [1520, 450]], { w: 12, color: P.ink2, seed: 540, t: tau });
  rshape(c, [[1560, 420], [1440, 440], [1450, 500], [1590, 470]], { fill: P.teal, w: 5, seed: 541, t: tau });
  rshape(c, ellPts(1700, 744, 70, 16, 20), { fill: P.ink2, w: 4, seed: 542, t: tau });
  // 桌子
  rshape(c, rectPts(40, 740, 1840, 60, 6), { fill: P.shelf2, w: 5, seed: 543, t: tau });
  c.fillStyle = P.shelf; c.fillRect(40, 800, 1840, 400);
  rline(c, [[40, 800], [1880, 800]], { w: 5, seed: 544, t: tau });
  for (const dx of [240, 1380]) { rshape(c, rectPts(dx, 830, 300, 120, 6), { fill: mix(P.shelf, P.shelf2, .4), w: 4, seed: 545 + dx, t: tau });
    rline(c, [[dx + 120, 870], [dx + 180, 870]], { w: 8, color: P.moon, seed: 546 + dx, t: tau }); }
  // 书山：一本本砸下来
  S3BOOKS.forEach((pile, pi) => { let yy = 740;
    pile.forEach(([bx, bw, bh, col, label], i) => {
      const at = .15 + pi * .25 + i * .16, k = sm(at, at + .35, u, easeOutBack), off = (1 - k) * -520, rot = (hash(i, pi + 3) - .5) * .06, dx = (hash(i, pi + 5) - .5) * 40;
      yy -= bh;
      if (k > 0) { c.save(); c.translate(bx + dx, yy + bh / 2 + off); c.rotate(rot);
        rshape(c, rectPts(-bw / 2, -bh / 2, bw, bh, 5), { fill: col, w: 4, seed: 550 + pi * 10 + i, t: tau });
        rline(c, [[-bw / 2 + 16, -bh / 2 + 6], [-bw / 2 + 16, bh / 2 - 6]], { w: 3, color: alpha(P.paper, .7), seed: 580 + i });
        rline(c, [[bw / 2 - 16, -bh / 2 + 6], [bw / 2 - 16, bh / 2 - 6]], { w: 3, color: alpha(P.paper, .7), seed: 590 + i });
        if (label) zh(c, label, 0, 2, { size: 34, color: P.paper, align: 'center', base: 'middle' });
        c.restore(); }
    }); });
  // 手机亮着
  const ph = sm(1.3, 1.6, u, easeOutBack);
  pop(c, 1180, 720, ph, () => { c.save(); c.translate(1180, 722); c.scale(1, .45); s3Phone(c, tau, 0, 0, 1.1, { glow: .6 + .4 * Math.sin(tau * 6) }); c.restore(); });
  // 趴着的大学生 + 头顶乱线
  s3Tea(c, tau, 1290, 740, 1, sm(1.5, 1.8, u, easeOutBack));
  s3Student(c, tau, 960, 742, 1.3, { pose: 'slump', face: 'tired', shirt: P.blue });
  s3Scribble(c, tau, 945, 470, 120, sm(1.0, 2.6, u, s3Lin));
  c.restore();
}

// ===================== 满屏 2：上楼梯 =====================
const S3STEP = { x: 90, y: 930, w: 160, h: 62, n: 11 };
function s3Stairs(c, tau, t0) {
  const u = tau - t0, st = S3STEP, per = .46, fk = Math.max(0, (u - .5) / per), k = Math.min(st.n - 2, Math.floor(fk)), fr = clamp(fk - k, 0, 1);
  const hopK = clamp(fr / .55, 0, 1), sx = x => st.x + x * st.w + st.w / 2, sy = x => st.y - x * st.h;
  const px = lerp(sx(k), sx(k + 1), easeIO(hopK)), py = lerp(sy(k), sy(k + 1), easeIO(hopK)) - Math.sin(hopK * Math.PI) * 50;
  const landed = j => t0 + .5 + (j - 1) * per + per * .55;   // 第 j 级落脚的时刻
  // 天空（屏幕坐标）
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.sky); g.addColorStop(.7, mix(P.sky, P.paper, .7)); g.addColorStop(1, P.paper);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const sg = c.createRadialGradient(1700, 150, 20, 1700, 150, 420); sg.addColorStop(0, alpha(P.sun, .7)); sg.addColorStop(1, alpha(P.sun, 0)); c.fillStyle = sg; c.fillRect(0, 0, W, H);
  rshape(c, circPts(1700, 150, 70, 28), { fill: P.sun, w: 5, seed: 600, t: tau });
  // 镜头：跟着小人，轻轻推近
  const z = lerp(1.22, 1.08, sm(0, 5, u, easeSine)), cx = clamp(px, 700, 1300), cy = clamp(py - 150, 200, 700);
  c.save(); c.translate(CX, CY); c.scale(z, z); c.translate(-cx, -cy);
  for (let i = 0; i < 4; i++) { const x0 = (hash(i, 61) * 2200 - 200 + u * 14 * (i + 1)) , y0 = 120 + hash(i, 62) * 300;
    rshape(c, ellPts(x0, y0, 90, 34, 18), { fill: alpha('#ffffff', .75), stroke: false, seed: 610 + i, smooth: true });
    rshape(c, ellPts(x0 + 60, y0 - 18, 60, 30, 16), { fill: alpha('#ffffff', .75), stroke: false, seed: 620 + i, smooth: true }); }
  // 远山
  rshape(c, [[-400, 1200], [-400, 760], [200, 600], [700, 720], [1200, 560], [1800, 700], [2400, 620], [2400, 1200]], { fill: mix(P.green, P.paper, .55), stroke: false, seed: 630, smooth: true });
  // 台阶
  for (let j = st.n - 1; j >= 0; j--) {
    const x = st.x + j * st.w, y = sy(j), lit = tau >= landed(j) && j >= 1, lk = sm(landed(j), landed(j) + .3, tau);
    rshape(c, rectPts(x, y, st.w + 6, 1300 - y, 4), { fill: lit ? mix(P.paper2, P.moon, .45 * lk) : P.paper2, w: 5, seed: 640 + j, t: tau });
    rshape(c, rectPts(x, y, st.w + 6, 16, 3), { fill: lit ? mix(P.paper, P.sun, .6 * lk) : P.paper, w: 4, seed: 660 + j, t: tau });
  }
  // 终点小旗
  const fx = sx(st.n - 1) + 62, fy = sy(st.n - 1);
  rline(c, [[fx, fy], [fx, fy - 150]], { w: 6, seed: 680, t: tau });
  rshape(c, [[fx, fy - 150], [fx + 80, fy - 128 + Math.sin(tau * 5) * 6], [fx, fy - 104]], { fill: P.red, w: 4, seed: 681, t: tau });
  // 每一级的小火花（落脚时迸一下，之后一直在台阶上跳）
  for (let j = 1; j < st.n; j++) { const tl = landed(j); if (tau < tl) continue;
    const x = sx(j), y = sy(j), e = tau - tl;
    s3Burst(c, x, y - 20, clamp(e / .6, 0, 1), 90, 700 + j);
    const fl = sm(0, .3, e, easeOutBack), fh = 1 + .15 * Math.sin(tau * 11 + j);
    pop(c, x + 48, y, fl, () => rshape(c, [[x + 48, y - 46 * fh], [x + 62, y - 14], [x + 48, y - 2], [x + 34, y - 14]], { fill: j % 2 ? P.orange : P.sun, w: 3, seed: 720 + j, t: tau, smooth: true }));
    if (e < 1) zh(c, '+1', x - 10, y - 150 - e * 60, { size: 44, color: P.moon, outline: P.ink, ow: 6, al: 1 - sm(.6, 1, e) });
  }
  // 小人
  s3Student(c, tau, px, py - 14, .9, { pose: 'walk', phase: hopK * .5 + .25, face: 'happy', shirt: P.teal, hop: Math.sin(hopK * Math.PI) });
  // 气泡「我正在变强」
  const bw = 340, bh = 96, bx = px - 60, by = py - 400, bk = sm(.7, 1.1, u, easeOutBack);
  pop(c, bx + 80, by + bh, bk, () => {
    bubble(c, bx, by, bw, bh, { tail: [px + 10, py - 290], t: tau, fill: '#fffaf0' });
    zh(c, '我正在变强', bx + bw / 2, by + bh / 2 + 4, { size: 54, align: 'center', base: 'middle', p: writeP(tau, t0 + 1.0, '我正在变强', .12) });
    if (u > 1.8) sparkle(c, bx + bw - 10, by + 8, 16 + 6 * Math.sin(tau * 8), { color: P.moon });
  });
  c.restore();
}

// ===================== 讲台上的黑板内容 =====================
function s3BoardContent(c, tau) {
  const T = S3T, E = S3E, D = S3DUR;
  const out = (b, f = .25) => 1 - sm(b - f, b, tau);   // 干脆消失
  // ---- 坐标轴（L2–L7）----
  const axA = out(T(7) + .25);
  if (tau >= T(1) && axA > 0) fade(c, axA, () => {
    s3Axes(c, tau, sm(T(1), T(1) + 1.6, tau, s3Lin));
    s3Baseline(c, tau, sm(T(1) + 2.6, T(1) + 3.3, tau, s3Lin));
  });
  // ---- A：基线上的光点 → 冲高 → 低谷（L2–L3）----
  if (tau >= T(1) + 2.8 && tau < T(3)) fade(c, out(T(3)), () => {
    const T2 = T(2);
    const uA = key(tau, [[T(1) + 3.0, 0], [E(1), .14], [T2 + .9, .2], [T2 + 1.5, .27], [T2 + 2.6, .39], [T2 + 4.5, .59], [T2 + 5.5, .73], [E(2), .8]], s3Lin);
    s3Curve(c, tau, S3A, uA);
    // 「爽！」
    const pk = [s3X(.27), s3Y(.85)], sk = sm(.265, .31, uA, s3Lin);
    s3Burst(c, pk[0], pk[1], sm(T2 + 1.45, T2 + 2.1, tau, s3Lin), 90, 740);
    s3Star(c, tau, pk[0] + 128, pk[1] - 24, 72, '爽！', sk, .1);
    // 低谷 + 还要待一阵
    const dx = s3X(.49), dk = sm(.4, .46, uA, s3Lin);
    if (dk > 0) zh(c, '低谷', dx, 640, { size: 46, color: P.red, align: 'center', p: dk });
    const bk = sm(.47, .59, uA, s3Lin);
    if (bk > 0) { const xa = s3X(.39), xb = s3X(.59);
      rline(c, [[xa, 690], [xa, 704], [xb, 704], [xb, 690]], { w: 4, color: P.red, p: bk, seed: 745, t: tau });
      zh(c, '还要待一阵', (xa + xb) / 2, 748, { size: 34, color: P.red, align: 'center', p: sm(.56, .66, uA, s3Lin) }); }
  });
  // 「想要」「动力」两个小标签（L2 前半）
  if (tau >= T(1) && tau < T(2) + 1) fade(c, out(T(2) + .9), () => {
    s3Pill(c, tau, 1040, S3G.yTop + 16, '想要', sm(T(1) + 1.1, T(1) + 1.5, tau), { fill: P.pink, seed: 750 });
    s3Pill(c, tau, 1180, S3G.yTop + 16, '动力', sm(T(1) + 1.9, T(1) + 2.3, tau), { fill: P.sun, seed: 752 });
  });
  // ---- B：短视频，门槛一格格抬高（L4–L5）----
  if (tau >= T(3) && tau < T(5)) fade(c, out(T(5)), () => {
    const uB = key(tau, [[T(3) + .3, 0], [E(3) - .1, .78], [T(4) + .9, .8], [T(4) + 3.0, .96]], s3Lin);
    // 快乐门槛：阶梯线 + 虚线引到右边的标签
    const thp = []; for (let i = 0; i <= 200; i++) { const uu = Math.min(uB, i / 200 * .96); thp.push([s3X(uu), s3Y(s3Th(uu))]); if (uu >= uB) break; }
    const thNow = s3Th(uB), ly = s3Y(thNow), tk = sm(T(3) + .1, T(3) + .5, tau);
    fade(c, tk, () => {
      if (thp.length > 1) rline(c, thp, { w: 6, color: P.orange, seed: 760, t: tau });
      rline(c, [[s3X(uB) + 10, ly], [S3G.x1 + 6, ly]], { w: 3, color: P.orange, dash: [6, 10], al: .6, seed: 761, t: tau });
      zh(c, '快乐门槛', S3G.x1 + 16, ly + 12, { size: 36, color: P.orange });
      rline(c, [[S3G.x1 + 176, ly + 16], [S3G.x1 + 176, ly - 22]], { w: 4, color: P.orange, seed: 762, t: tau });
      rline(c, [[S3G.x1 + 166, ly - 10], [S3G.x1 + 176, ly - 24], [S3G.x1 + 186, ly - 10]], { w: 4, color: P.orange, seed: 763, t: tau });
    });
    s3Curve(c, tau, S3B, uB, { seed: 765 });
    S3BK.forEach((e, k) => { const pu = S3BPK[k], x = s3X(pu), y = s3Y(e.a), pk = sm(pu - .012, pu + .02, uB, s3Lin);
      pop(c, x, y - 70, easeOutBack(pk), () => s3Phone(c, tau, x, y - 70, .85, { seed: 770 + k * 3, glow: .7 })); });
    // 课本：曲线几乎不动；小人的脸「……」
    const bkK = sm(T(4) + .2, T(4) + .6, tau, easeOutBack);
    pop(c, s3X(.835), 470, bkK, () => s3Textbook(c, tau, s3X(.835), 470, 1));
    const fk = sm(T(4) + 1.4, T(4) + 1.8, tau, easeOutBack), fx = 1745, fy = 500;
    pop(c, fx, fy, fk, () => {
      s3Head(c, tau, fx, fy, 50, { face: 'blank', seed: 780 });
      bubble(c, fx - 88, fy - 150, 170, 72, { tail: [fx - 10, fy - 56], t: tau, fill: '#fffaf0', seed: 782 });
      const nd = Math.floor(clamp((tau - T(4) - 1.9) / .35, 0, 3));
      for (let i = 0; i < nd; i++) rshape(c, circPts(fx - 38 + i * 36, fy - 112, 7, 10), { fill: P.ink, stroke: false, seed: 785 + i });
    });
  });
  // ---- C：三样叠满 → 超高峰超深坑（L6），图标堆留到 L7 ----
  const stackX = s3X(.06);
  const icons = [[S3T(5) + 1.25, (x, y) => s3Bowl(c, tau, x, y + 34, .9), 520], [S3T(5) + 1.9, (x, y) => s3TV(c, tau, x, y + 36, .82), 444], [S3T(5) + 2.55, (x, y) => s3Msg(c, tau, x, y, .82), 372]];
  if (tau >= T(5) && tau < T(7)) fade(c, out(T(7)), () => {
    icons.forEach(([at, draw, y], i) => {
      const dk = sm(at, at + .35, tau, easeOutBack), off = (1 - dk) * -260;
      const fly = i === 0 ? 0 : sm(T(6) + 1.5 + i * .12, T(6) + 1.95 + i * .12, tau, easeIn);
      if (dk <= 0 || fly >= 1) return;
      c.save(); c.translate(stackX + fly * 520, y + off - fly * 260); c.rotate(fly * 1.6 * (i % 2 ? 1 : -1)); c.globalAlpha *= 1 - fly;
      draw(0, 0); c.restore();
      if (fly > 0 && fly < .5) cross(c, stackX + fly * 520, y - fly * 260, 60, { t: tau, seed: 800 + i });
    });
  });
  if (tau >= T(5) && tau < T(6)) fade(c, out(T(6)), () => {
    const T5 = T(5), uC = key(tau, [[T5 + .4, 0], [T5 + 3.0, .16], [T5 + 3.6, .23], [T5 + 4.5, .37], [E(5), .62]], s3Lin);
    s3Curve(c, tau, S3C, uC, { seed: 810, w: 8 });
    const px = s3X(.23), py = s3Y(1.15);
    s3Burst(c, px, py, sm(T5 + 3.55, T5 + 4.2, tau, s3Lin), 120, 812);
    const pkk = sm(T5 + 3.6, T5 + 3.9, tau, easeOutBack);
    pop(c, px + 116, py + 36, pkk, () => zh(c, '峰越高', px + 60, py + 50, { size: 48, color: P.orange }));
    const dk = sm(T5 + 4.3, T5 + 4.7, tau, easeOutBack);
    pop(c, s3X(.53), 690, dk, () => zh(c, '坑越深', s3X(.53), 700, { size: 50, color: P.red, align: 'center' }));
  });
  // ---- D：对策一：只剩一样，平缓的小起伏（L7）----
  if (tau >= T(6) && tau < T(7)) fade(c, out(T(7)), () => {
    s3Card(c, tau, 960, 196, 680, 76, '对策一：别每次都叠满 buff', T(6) + .1, { size: 44 });
    const uD = key(tau, [[T(6) + 2.1, 0], [E(6) - .3, .96]], s3Lin);
    s3Curve(c, tau, S3D, uD, { seed: 820, color: P.green });
    const ck = sm(E(6) - .5, E(6) - .2, tau, s3Lin);
    if (ck > 0) check(c, s3X(.96) + 30, 470, 70, { p: ck, t: tau });
  });
  // ---- E：对策二：努力 = 奖励（L8）----
  if (tau >= T(7) + .1 && tau < T(8) + .3) {
    s3Card(c, tau, 960, 230, 650, 90, '对策二：努力 = 奖励', T(7) + .2, { size: 52 });
    const pk = sm(T(7) + 1.0, T(7) + 1.4, tau, easeOutBack), ek = sm(T(7) + 1.6, T(7) + 1.9, tau, easeOutBack), gk = sm(T(7) + 2.0, T(7) + 2.4, tau, easeOutBack);
    pop(c, 1040, 560, pk, () => { s3Pencil(c, tau, 1040, 540, 1.3); zh(c, '努力', 1040, 720, { size: 50, align: 'center' }); });
    pop(c, 1290, 580, ek, () => { rline(c, [[1250, 560], [1330, 560]], { w: 9, seed: 830, t: tau }); rline(c, [[1250, 600], [1330, 600]], { w: 9, seed: 831, t: tau }); });
    pop(c, 1540, 600, gk, () => { s3Gift(c, tau, 1540, 640, 1.3, sm(T(7) + 2.6, T(7) + 3.1, tau)); zh(c, '奖励', 1540, 720, { size: 50, align: 'center', color: P.red }); });
  }
  // ---- F：只盯着大餐：一路灰（L10）----
  if (tau >= E(8) - .15 && tau < D - .55) fade(c, out(D - .55), () => {
    const T9 = T(9), rk = sm(E(8) - .1, E(8) + .3, tau, s3Lin);
    const road = [[760, 700], [1560, 640], [1560, 600], [760, 610]];
    fade(c, rk, () => {
      rshape(c, road, { fill: mix(P.gray, P.paper, .35), w: 5, seed: 840, t: tau });
      for (let i = 0; i < 6; i++) { const x = 800 + i * 130; rline(c, [[x, 655 - i * 7], [x + 60, 651 - i * 7]], { w: 5, color: P.paper, seed: 841 + i, t: tau, al: .7 }); }
      for (let i = 0; i < 7; i++) { const x = 820 + i * 110, y = 560 + hash(i, 4) * 30; rshape(c, ellPts(x, y, 30, 12, 12), { fill: alpha(P.gray, .35), stroke: false, seed: 850 + i }); }
    });
    // 慢吞吞走路的小人 + 头顶灰云
    const wx = lerp(830, 980, sm(E(8), D - .8, tau, s3Lin)), ph = (tau * .9) % 1;
    fade(c, rk, () => {
      s3Student(c, tau, wx, 650, .72, { pose: 'walk', phase: ph, face: 'grim', shirt: mix(P.teal, P.gray, .75) });
      s3Drop(c, tau, wx + 44, 480 + Math.sin(tau * 4) * 4, 11, 860);
      const cy = 330 + Math.sin(tau * 2) * 5;
      rshape(c, [...ellPts(wx - 10, cy, 70, 34, 18)], { fill: P.gray, w: 4, seed: 861, t: tau, smooth: true });
      rshape(c, ellPts(wx + 34, cy - 20, 44, 30, 16), { fill: P.gray, w: 4, seed: 862, t: tau, smooth: true });
      for (let i = 0; i < 3; i++) { const yy = cy + 40 + ((tau * 90 + i * 30) % 60); rline(c, [[wx - 40 + i * 30, yy], [wx - 46 + i * 30, yy + 16]], { w: 3, color: P.gray, seed: 863 + i }); }
    });
    // 尽头的大餐
    const fk = sm(T9 + .6, T9 + 1.0, tau, easeOutBack);
    pop(c, 1680, 590, fk, () => { s3Feast(c, tau, 1680, 600, .95); zh(c, '考完那顿大餐', 1690, 440, { size: 36, align: 'center', color: P.ink2 }); });
    // 硬熬
    const hk = sm(T9 + 2.3, T9 + 2.7, tau, easeOutBack);
    pop(c, 1180, 760, hk, () => { zh(c, '过程只剩', 1150, 772, { size: 36, color: P.ink2, align: 'right' }); zh(c, '硬熬', 1164, 776, { size: 56, color: P.gray }); });
  });
}

// 帕秋莉的姿势表
function s3Pose(tau) {
  const T = S3T, D = S3DUR;
  if (tau < T(1)) return { pose: 'lecture' };
  if (tau < T(1) + 3.2) return { pose: 'point' };
  if (tau < T(2) + 1.3) return { pose: 'lecture' };
  if (tau < T(2) + 2.4) return { pose: 'point', mood: 'surprised' };
  if (tau < T(3)) return { pose: 'lecture' };
  if (tau < T(4)) return { pose: 'point' };
  if (tau < T(5)) return { pose: 'shrug' };
  if (tau < T(5) + 3.4) return { pose: 'lecture' };
  if (tau < T(6)) return { pose: 'point', mood: 'surprised' };
  if (tau < T(7)) return { pose: 'lecture' };
  if (tau < T(8)) return { pose: 'point' };
  if (tau < D - .5) return { pose: 'shrug' };
  return { pose: 'lecture' };
}
// 讲台画面（带轻微推镜头和震屏）
function s3StageDraw(c, tau, L) {
  const T = S3T;
  const push = .03 * sm(T(2) + .8, T(2) + 1.8, tau) * (1 - sm(T(3) - .3, T(3), tau)) + .045 * sm(T(5) + 3.0, T(5) + 3.8, tau) * (1 - sm(T(6) - .3, T(6), tau));
  const sk = Math.max(0, 1 - Math.abs(tau - (T(5) + 3.65)) / .3), shx = Math.sin(tau * 70) * 7 * sk, shy = Math.cos(tau * 83) * 5 * sk;
  c.save(); c.translate(S3BC[0] + shx, S3BC[1] + shy); c.scale(1 + push, 1 + push); c.translate(-S3BC[0], -S3BC[1]);
  libraryBg(c, tau);
  board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '动力' });
  s3BoardContent(c, tau);
  const ps = s3Pose(tau);
  stageChar(c, tau, L, { ...ps, gesture: L.talking ? .6 + .4 * Math.sin(tau * 2.3) : .4 });
  c.restore();
}

scene({ order: 3, key: 'dopamine', title: '动力', dur: S3DUR, lines: S3LINES,
  fn(c, tau, L) {
    // 满屏镜头：[开始, 结束, 画法]
    const shots = [[.4, S3E(0) + .15, s3Desk], [S3T(8) - .3, S3E(8) + .25, s3Stairs]];
    let f = 0, full = null, st = 0;
    for (const [a, b, draw] of shots) { const k = Math.min(sm(a, a + .35, tau), 1 - sm(b - .35, b, tau)); if (k > 0) { f = k; full = draw; st = a; } }
    if (f < 1) { c.save(); if (f > 0) { const z = 1 + .6 * easeIn(f); c.translate(S3BC[0], S3BC[1]); c.scale(z, z); c.translate(-S3BC[0], -S3BC[1]); }
      s3StageDraw(c, tau, L); c.restore(); }
    if (f > 0) { c.save(); c.globalAlpha = f; const z = lerp(1.12, 1, easeOut(f)); c.translate(CX, CY); c.scale(z, z); c.translate(-CX, -CY); full(c, tau, st); c.restore(); }
    chapterTag(c, tau, '第三页 · 动力', { t0: .05 });
  } });
