'use strict';
// 第 6 段：总结。
//   讲台：魔导书页刷刷翻过五页 → 「今天的四条」逐条写出、打金色勾（右边配大插图）→ cheer 一起闪 → 免责便签
//         → 「下课」合上魔导书、打哈欠、蜡烛一盏盏灭掉。
//   片尾（满屏，约 9 秒）：深色底，Q 版帕秋莉抱书躺着睡，上方演职信息。
// 顶层名字一律带本段前缀 S6 / s6。翻页时的五个章节图标借用第 0 段的 s0Icon。
const S6LINES = seq(1.0, [
  ['最后，把今天浓缩成四条。', { hold: .8 }],
  ['一，睡够、睡好。', { hold: .35 }],
  ['二，不吸烟。', { hold: .35 }],
  ['三，每天动一动。', { hold: .35 }],
  ['四，少吃糖。', { hold: .35 }],
  ['能做到这四条，身体就已经不错了。剩下的慢慢调。', { mood: 'smile', hold: .3 }],
  ['以上是科普，不是诊断。身体不舒服，请去校医院。', { hold: .9 }],
  ['帕秋莉讲座第一集，下课。……我也该去睡觉了。', { mood: 'sleepy', hold: .8 }],
]);
// 四条清单：图标、文字、颜色
const S6ITEMS = [['moon', '睡够、睡好', P.purple], ['smoke', '不吸烟', P.red], ['shoe', '每天动一动', P.green], ['sugar', '少吃糖', P.orange]];
// 图书馆左侧的四支蜡烛（L8 一盏盏灭掉）
const S6CANDLES = [[72, 310], [640, 310], [58, 610], [652, 610]];
const S6CREDIT = 10;   // 片尾时长（含 1 秒转场）

// ===================== 小图标 =====================
function s6Icon(c, name, x, y, s, t = null, seed = 1) {
  const w = Math.max(3, s * .09), o = { w, t, seed };
  if (name === 'moon') s0Icon(c, 'moon', x, y, s, t, seed);
  else if (name === 'cig') {   // 香烟（没划掉）
    c.save(); c.translate(x, y); c.rotate(-.45);
    rshape(c, rectPts(-s * .95, -s * .15, s * 1.45, s * .3, 4), { fill: '#ffffff', stroke: P.ink, ...o });
    rshape(c, rectPts(s * .5, -s * .15, s * .45, s * .3, 4), { fill: P.orange, stroke: P.ink, ...o, seed: seed + 1 });
    rshape(c, rectPts(-s * 1.02, -s * .15, s * .14, s * .3, 3), { fill: P.red, stroke: P.ink, ...o, w: w * .7, seed: seed + 2 });
    c.restore();
    const ex = x - Math.cos(-.45) * s * .98, ey = y - Math.sin(-.45) * s * .98;
    const g = c.createRadialGradient(ex, ey, 2, ex, ey, s * .4); g.addColorStop(0, alpha(P.orange, .7)); g.addColorStop(1, alpha(P.orange, 0)); c.fillStyle = g; c.fillRect(ex - s * .4, ey - s * .4, s * .8, s * .8);
    for (let k = 0; k < 2; k++) rline(c, [[ex, ey - s * .1], [ex - s * .15 + k * s * .1, ey - s * .4], [ex + s * .08 + k * s * .1, ey - s * .7], [ex - s * .1 + k * s * .15, ey - s * 1.0]], { ...o, color: P.gray, w: w * .8, smooth: true, seed: seed + 5 + k });
  } else if (name === 'smoke') { s6Icon(c, 'cig', x, y + s * .1, s * .85, t, seed); s6No(c, x, y, s, t, 1, seed + 20); }
  else if (name === 'shoe') {
    const q = [[-.9, .3], [-.92, -.12], [-.5, -.22], [-.4, -.62], [-.02, -.62], [.08, -.25], [.55, -.08], [.92, .08], [.92, .3]].map(([a, b]) => [x + a * s, y + b * s]);
    rshape(c, q, { fill: P.blue, stroke: P.ink, ...o, smooth: false });
    rline(c, [[x - s * .88, y + s * .02], [x - s * .3, y - s * .02], [x + s * .3, y + s * .1], [x + s * .88, y + s * .14]], { ...o, color: P.paper, w: w * 1.1, smooth: true, seed: seed + 3 });
    for (let k = 0; k < 3; k++) rline(c, [[x - s * (.36 - k * .12), y - s * (.5 - k * .1)], [x - s * (.18 - k * .12), y - s * (.44 - k * .1)]], { ...o, color: P.paper, w: w * .8, seed: seed + 5 + k });
    rshape(c, rectPts(x - s * .96, y + s * .28, s * 1.92, s * .2, s * .08), { fill: P.paper, stroke: P.ink, ...o, seed: seed + 1 });
  } else if (name === 'cube') {
    const a = s * .62, top = [[x, y - a], [x + a * .95, y - a * .5], [x, y], [x - a * .95, y - a * .5]];
    rshape(c, [[x - a * .95, y - a * .5], [x, y], [x, y + a * 1.05], [x - a * .95, y + a * .55]], { fill: P.paper2, stroke: P.ink, ...o, seed: seed + 1 });
    rshape(c, [[x + a * .95, y - a * .5], [x, y], [x, y + a * 1.05], [x + a * .95, y + a * .55]], { fill: P.faint, stroke: P.ink, ...o, seed: seed + 2 });
    rshape(c, top, { fill: '#ffffff', stroke: P.ink, ...o, seed: seed + 3 });
    for (let k = 0; k < 5; k++) { c.fillStyle = alpha(P.ink2, .35); c.beginPath(); c.arc(x + (hash(k, seed) - .5) * a * 1.4, y + (hash(k, seed + 1) - .2) * a * .9, 2, 0, TAU); c.fill(); }
  } else if (name === 'sugar') { s6Icon(c, 'cube', x, y + s * .05, s * .95, t, seed); s6No(c, x, y, s, t, 1, seed + 20); }
  else if (name === 'hospital') {
    rshape(c, circPts(x, y, s), { fill: '#ffffff', stroke: P.ink, ...o });
    rshape(c, [[x - s * .2, y - s * .62], [x + s * .2, y - s * .62], [x + s * .2, y - s * .2], [x + s * .62, y - s * .2], [x + s * .62, y + s * .2], [x + s * .2, y + s * .2], [x + s * .2, y + s * .62], [x - s * .2, y + s * .62], [x - s * .2, y + s * .2], [x - s * .62, y + s * .2], [x - s * .62, y - s * .2], [x - s * .2, y - s * .2]], { fill: P.red, stroke: P.ink, ...o, w: w * .7, seed: seed + 1 });
  } else if (name === 'heart') {
    rshape(c, heartPts(x, y, s), { fill: P.pink, stroke: P.ink, ...o, smooth: true });
    rline(c, [[x - s * .45, y - s * .25], [x - s * .32, y - s * .35], [x - s * .2, y - s * .25]], { ...o, w: w * .9, smooth: true, seed: seed + 2 });
    rline(c, [[x + s * .2, y - s * .25], [x + s * .32, y - s * .35], [x + s * .45, y - s * .25]], { ...o, w: w * .9, smooth: true, seed: seed + 3 });
    rline(c, [[x - s * .22, y + s * .02], [x, y + s * .2], [x + s * .22, y + s * .02]], { ...o, w: w * .9, smooth: true, seed: seed + 4 });
    for (const sx of [-1, 1]) { c.fillStyle = alpha(P.red, .35); c.beginPath(); c.ellipse(x + sx * s * .5, y + s * .02, s * .12, s * .07, 0, 0, TAU); c.fill(); }
  }
}
// 禁止符号：红圈 + 斜杠，p 画出进度
function s6No(c, x, y, s, t, p = 1, seed = 1) {
  rline(c, circPts(x, y, s * 1.02, 64), { w: Math.max(4, s * .13), color: P.red, close: true, p: clamp(p * 1.6, 0, 1), seed, t });
  rline(c, [[x - s * .72, y - s * .72], [x + s * .72, y + s * .72]], { w: Math.max(4, s * .13), color: P.red, p: clamp(p * 2.5 - 1.5, 0, 1), seed: seed + 1, t });
}
// 蜡烛：on 0..1 亮度，off 熄灭后几秒（冒烟）
function s6Candle(c, tau, x, y, on, off, i) {
  if (on > 0) { const g = c.createRadialGradient(x, y - 50, 4, x, y - 50, 120); g.addColorStop(0, alpha(P.lamp, .45 * on)); g.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = g; c.fillRect(x - 120, y - 170, 240, 240); }
  rshape(c, [[x - 20, y], [x + 20, y], [x + 14, y - 8], [x - 14, y - 8]], { fill: P.gold, stroke: P.ink, w: 2.5, seed: 700 + i, t: tau });
  rshape(c, rectPts(x - 8, y - 46, 16, 38, 3), { fill: P.paper, stroke: P.ink, w: 2.5, seed: 710 + i, t: tau });
  if (on > 0) { const fl = 1 + .12 * Math.sin(tau * 13 + i * 2) + .06 * noise1(tau * 6, i);
    rshape(c, [[x, y - 46 - 26 * fl], [x + 7, y - 54], [x, y - 47], [x - 7, y - 54]], { fill: mix(P.sun, P.lamp, .4), stroke: false, smooth: true, seed: 720 + i, t: tau, al: on }); }
  if (off > 0 && off < 1.6) for (let k = 0; k < 2; k++) rline(c, [[x, y - 50], [x + 6 + k * 4, y - 70 - off * 30], [x - 6, y - 95 - off * 50], [x + 4, y - 120 - off * 70]], { w: 3, color: P.gray, smooth: true, seed: 730 + i + k, t: tau, al: (1 - off / 1.6) * .7 });
}

// ===================== 讲台 =====================
// 一页「章节页」：大图标 + 标题（翻页时一闪而过）。k = -1 空白页，0..4 = 五个章节，5 = 清单页（只画标题底）
function s6Page(c, tau, k, B) {
  if (k < 0 || k > 4) return;
  const [ic, name, col] = S0PAGES[k], cx = B.x + B.w / 2, cy = B.y + B.h / 2 - 40;
  rshape(c, circPts(cx, cy, 160), { fill: mix(col, P.paper, .7), stroke: col, w: 6, seed: 750 + k, t: tau });
  s0Icon(c, ic, cx, cy, 105, tau, 760 + k * 10);
  zh(c, '第' + '一二三四五'[k] + '页 · ' + name, cx, cy + 250, { size: 64, align: 'center', color: P.ink });
}
// 书页从右往左翻过去：翻起的那页从右边往左边书脊压扁
function s6Flip(c, tau, u, k, B) {
  const sx = Math.cos(u * Math.PI / 2);   // 1 → 0
  if (sx <= .01) return;
  const x0 = B.x + 6, fw = (B.w - 12) * sx;
  c.save();
  const sh = c.createLinearGradient(x0 + fw, 0, x0 + fw + 80, 0); sh.addColorStop(0, alpha(P.ink, .25 * (1 - sx))); sh.addColorStop(1, alpha(P.ink, 0));
  c.fillStyle = sh; c.fillRect(x0 + fw, B.y, 80, B.h);
  c.beginPath(); c.rect(x0, B.y - 10, fw, B.h + 20); c.clip();
  c.translate(x0, 0); c.scale(sx, 1); c.translate(-x0, 0);
  rshape(c, rectPts(B.x, B.y, B.w, B.h, 18), { fill: P.paper, stroke: P.paperEdge, w: 6, seed: 11 + k, amp: 1 });
  const g = c.createLinearGradient(B.x, 0, B.x + B.w, 0); g.addColorStop(0, alpha(P.paperEdge, 0)); g.addColorStop(1, alpha(P.paperEdge, .6 * (1 - sx))); c.fillStyle = g; c.fillRect(B.x, B.y, B.w, B.h);
  s6Page(c, tau, k, B);
  c.restore();
}
function s6Stage(c, tau, L) {
  const t = S6LINES.map(l => l[0]), end = seqEnd(S6LINES), B = STAGE.board, CH = .16;
  // L8 的节拍：「下课」合书、哈欠、蜡烛一盏盏灭
  const t8 = t[7], close0 = t8 + 1.2, close1 = t8 + 1.9, yawn0 = t8 + 2.0, offs = [t8 + 2.7, t8 + 3.15, t8 + 3.6, t8 + 4.05];
  const nOff = offs.filter(o => tau >= o).length, flick = offs.reduce((a, o) => a + (tau > o && tau < o + .15 ? Math.sin((tau - o) * 60) * .06 : 0), 0);
  const dim = [0, .2, .34, .46, .58][nOff] + flick;
  // 镜头：清单阶段慢慢推近一点，cheer 时轻轻一弹，合书后退回
  const push = .03 * sm(t[1], t[4] + 1, tau) * (1 - sm(t[6] - .3, t[6] + .5, tau)) + .02 * Math.sin(clamp((tau - t[5]) / .6, 0, 1) * Math.PI);
  c.save(); c.translate(1280, 470); c.scale(1 + push, 1 + push); c.translate(-1280, -470);
  libraryBg(c, tau);
  S6CANDLES.forEach(([x, y], i) => s6Candle(c, tau, x, y, tau < offs[i] ? sm(.35 + i * .18, .6 + i * .18, tau) : 0, tau - offs[i], i));   // 段首一支支点亮，L8 一支支熄灭
  board(c, B.x, B.y, B.w, B.h, { t: tau });
  // L1：翻页。0.2 秒一页，空白页 → 五个章节 → 清单页
  const f0 = t[0] + .3, fd = .3, fi = Math.floor((tau - f0) / fd);
  if (tau >= f0 && fi <= 5) { s6Page(c, tau, fi, B); s6Flip(c, tau, (tau - f0) / fd - fi, fi - 1, B); }
  const listA = sm(f0 + 6 * fd - .05, f0 + 6 * fd, tau) * (1 - sm(close0 - .1, close0 + .3, tau));
  if (listA > 0) fade(c, listA, () => {
    const u0 = f0 + 6 * fd, title = '今天的四条';
    zh(c, title, B.x + B.w / 2, 170, { size: 64, align: 'center', color: P.ink, p: writeP(tau, u0, title, .08) });
    rline(c, [[B.x + B.w / 2 - 190, 196], [B.x + B.w / 2 + 190, 196]], { w: 4, color: P.moon, p: sm(u0 + .3, u0 + .7, tau), seed: 801, t: tau });
    // 「四条」：清单页先出四个虚线空位
    S6ITEMS.forEach((_, r) => { const y = 310 + r * 132, kg = easeOutBack(clamp((tau - u0 - .45 - r * .12) / .3, 0, 1)), a = 1 - sm(t[r + 1] - .05, t[r + 1] + .2, tau);
      if (kg > 0 && a > 0) pop(c, 822, y - 18, kg, () => fade(c, a, () => {
        rline(c, circPts(822, y - 18, 52), { w: 4, color: P.faint, close: true, dash: [10, 10], seed: 870 + r, t: tau });
        zh(c, String(r + 1), 822, y + 2, { size: 52, align: 'center', color: P.faint });
        rline(c, [[900, y + 16], [1230, y + 16]], { w: 4, color: P.faint, dash: [14, 12], seed: 875 + r, t: tau }); })); });
    // 四条
    const flash = Math.max(0, Math.sin(clamp((tau - t[5] - .15) / .7, 0, 1) * Math.PI));
    S6ITEMS.forEach(([ic, text, col], r) => {
      const t0 = t[r + 1], y = 310 + r * 132, k = easeOutBack(clamp((tau - t0) / .4, 0, 1)); if (k <= 0) return;
      if (flash > 0) { c.save(); c.globalAlpha = flash * .8; rshape(c, rectPts(760, y - 62, 580, 104, 30), { fill: alpha(P.sun, .45), stroke: P.moon, w: 3, seed: 810 + r, t: tau }); c.restore(); }
      pop(c, 822, y - 18, k, () => {
        rshape(c, circPts(822, y - 18, 54), { fill: mix(col, P.paper, .72), stroke: P.ink, w: 4, seed: 820 + r, t: tau });
        s6Icon(c, ic, 822, y - 18, 36, tau, 830 + r * 10);
        rshape(c, circPts(778, y - 62, 20), { fill: P.moon, stroke: P.ink, w: 3, seed: 840 + r, t: tau });
        zh(c, String(r + 1), 778, y - 51, { size: 32, align: 'center', color: P.ink });
      });
      const tw = t0 + .3, wp = writeP(tau, tw, text, .09);
      zh(c, text, 900, y + 4, { size: 62, color: P.ink, p: wp });
      const tc = tw + [...text].length * .09 + .15;
      if (tau > tc) { check(c, 1290, y - 20, 70, { color: P.moon, p: sm(tc, tc + .3, tau), t: tau, seed: 850 + r, w: 11 });
        const d = tau - tc - .3; if (d > 0 && d < .6) for (let q = 0; q < 6; q++) { const a = q / 6 * TAU + r; sparkle(c, 1300 + Math.cos(a) * (30 + d * 110), y - 20 + Math.sin(a) * (30 + d * 110), 14 * (1 - d / .6), { color: P.moon }); } }
    });
    // 右边的大插图：每条一张；L6 一颗笑脸心；L7 换成免责便签
    const RX = 1600, RY = 480, ill = (a, b) => Math.min(sm(a, a + .3, tau, easeOutBack), 1 - sm(b - .2, b, tau));
    const k1 = ill(t[1], t[2]);
    if (k1 > 0) pop(c, RX, RY, k1, () => {
      s0Icon(c, 'moon', RX - 20, RY, 150, tau, 900);
      for (let z = 0; z < 3; z++) { const ph = ((tau - t[1]) * .7 + z / 3) % 1; zh(c, 'Z', RX + 110 + ph * 90, RY - 90 - ph * 190, { size: 50 + z * 14, color: P.purple, al: Math.sin(ph * Math.PI) }); }
      for (let z = 0; z < 4; z++) sparkle(c, RX - 160 + z * 90, RY + 190 - (z % 2) * 40, 12 + 6 * Math.sin(tau * 4 + z), { color: P.moon });
    });
    const k2 = ill(t[2], t[3]);
    if (k2 > 0) pop(c, RX, RY, k2, () => {
      s6Icon(c, 'cig', RX, RY + 20, 170, tau, 910);
      const u = clamp((tau - t[2] - .5) / .45, 0, 1); if (u > 0) pop(c, RX, RY, lerp(1.6, 1, easeOut(u)), () => s6No(c, RX, RY, 200, tau, u, 915));
    });
    const k3 = ill(t[3], t[4]);
    if (k3 > 0) pop(c, RX, RY, k3, () => {
      const u = tau - t[3], stepN = Math.floor(u / .32);
      for (let q = 0; q < Math.min(stepN, 6); q++) { const fx = RX - 190 + q * 70, fy = RY + 170 + (q % 2 ? 26 : -8);
        rshape(c, ellPts(fx, fy, 22, 12, 20, -.2), { fill: alpha(P.ink2, .45), stroke: false, seed: 920 + q }); }
      const hop = Math.abs(Math.sin(u * Math.PI / .32)) * 40;
      c.save(); c.translate(RX, RY - hop); c.rotate(-.12 * Math.sin(u * Math.PI / .32)); s6Icon(c, 'shoe', 0, 0, 160, tau, 930); c.restore();
      for (let q = 0; q < 3; q++) rline(c, [[RX - 230, RY - 40 + q * 40], [RX - 180 + q * 10, RY - 40 + q * 40]], { w: 5, color: P.faint, seed: 935 + q, t: tau });
    });
    const k4 = ill(t[4], t[5]);
    if (k4 > 0) pop(c, RX, RY, k4, () => {
      const u = tau - t[4];
      [[RX - 80, RY + 90], [RX + 80, RY + 90], [RX, RY - 40]].forEach(([x, y], q) => {
        const go = q ? sm(.55 + q * .15, .95 + q * .15, u) : 0;
        if (go < 1) fade(c, 1 - go, () => s6Icon(c, 'cube', x + go * (q === 1 ? 160 : -160), y - go * 80, 110, tau, 940 + q * 5));
      });
      const ka = easeOutBack(clamp((u - 1.1) / .35, 0, 1));
      pop(c, RX + 190, RY + 60, ka, () => { arrow(c, [RX + 190, RY - 40], [RX + 190, RY + 140], { w: 10, color: P.green, head: 36, seed: 950, t: tau }); });
    });
    const k5 = ill(t[5], t[6] + .1);
    if (k5 > 0) pop(c, RX, RY, k5, () => {
      const beat = 1 + .06 * Math.max(0, Math.sin((tau - t[5]) * 7));
      pop(c, RX, RY - 20, beat, () => s6Icon(c, 'heart', RX, RY - 20, 170, tau, 960));
      S6ITEMS.forEach(([ic], q) => { const a = (tau - t[5]) * .9 + q / 4 * TAU; s6Icon(c, ic, RX + Math.cos(a) * 225, RY - 20 + Math.sin(a) * 185, 34, tau, 970 + q * 7); });
      const tx = '剩下的，慢慢调'; zh(c, tx, RX, RY + 290, { size: 44, align: 'center', color: P.purple, p: writeP(tau, t[5] + 16 * CH, tx, .08) });
    });
    // L7：免责便签
    const kn = clamp((tau - t[6] - .05) / .45, 0, 1);
    if (kn > 0) {
      const drop = easeOutBack(kn);
      c.save(); c.translate(RX, RY - 10 - (1 - drop) * 140); c.rotate(.05 - (1 - drop) * .2); c.globalAlpha *= clamp(kn * 3, 0, 1);
      rshape(c, rectPts(-235, -230, 470, 470, 10), { fill: mix(P.sun, P.paper, .55), stroke: P.ink, w: 4, seed: 980, t: tau });
      rshape(c, rectPts(-80, -254, 160, 44, 4), { fill: alpha(P.paperEdge, .75), stroke: false, seed: 981 });
      s6Icon(c, 'hospital', 0, -118, 62, tau, 982);
      zh(c, '科普 ≠ 诊断', 0, 30, { size: 58, align: 'center', color: P.ink, p: writeP(tau, t[6] + .4, '科普 ≠ 诊断', .07) });
      rline(c, [[-150, 56], [150, 56]], { w: 4, color: P.red, p: sm(t[6] + 1.2, t[6] + 1.5, tau), seed: 983, t: tau });
      zh(c, '身体不舒服', 0, 128, { size: 48, align: 'center', color: P.ink, p: writeP(tau, t[6] + 11 * CH, '身体不舒服', .07) });
      zh(c, '→ 去校医院', 0, 192, { size: 48, align: 'center', color: P.red, p: writeP(tau, t[6] + 17 * CH, '→ 去校医院', .07) });
      c.restore();
    }
  });
  // L6：cheer 时满黑板飘星星
  const st = tau - t[5];
  if (st > 0 && st < 4.2) for (let q = 0; q < 16; q++) { const ph = (st * .6 + hash(q, 2)) % 1, x = B.x + 60 + hash(q, 3) * (B.w - 120), y = B.y + B.h - 40 - ph * (B.h - 60);
    sparkle(c, x, y, (10 + hash(q, 4) * 14) * Math.sin(ph * Math.PI), { color: q % 3 ? P.moon : P.pink, al: sm(0, .3, st) * (1 - sm(3.6, 4.2, st)), rot: tau * 2 + q }); }
  // L8：「下课」—— 封面从左边盖过来，合上魔导书
  const cu = sm(close0, close1, tau, easeIO);
  if (cu > 0) {
    const cw = B.w * cu, leather = mix(P.red, P.ink, .55);
    c.save(); c.beginPath(); c.rect(B.x - 10, B.y - 16, cw + 24, B.h + 32); c.clip();
    c.translate(B.x, 0); c.scale(Math.max(cu, .02), 1); c.translate(-B.x, 0);
    rshape(c, rectPts(B.x - 6, B.y - 10, B.w + 12, B.h + 20, 20), { fill: leather, stroke: P.ink, w: 6, seed: 990, t: tau });
    rshape(c, rectPts(B.x - 6, B.y - 10, 50, B.h + 20, 14), { fill: mix(P.red, P.ink, .7), stroke: P.ink, w: 4, seed: 991, t: tau });
    rline(c, rectPts(B.x + 70, B.y + 30, B.w - 110, B.h - 60, 14), { w: 6, color: P.moon, close: true, seed: 992, t: tau });
    const mx = B.x + B.w / 2 + 20, my = B.y + B.h / 2 - 20;
    rline(c, circPts(mx, my, 170), { w: 5, color: P.moon, close: true, seed: 993, t: tau });
    drawMoonIcon(c, mx, my, 120, P.moon, -.35);
    zh(c, '帕秋莉讲座 · 第 1 集', mx, B.y + B.h - 70, { size: 44, align: 'center', color: P.moon });
    c.restore();
    const land = tau - close1; if (land > 0 && land < .5) for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI + Math.PI; sparkle(c, B.x + B.w / 2 + Math.cos(a) * (B.w * .5 + land * 120), B.y + B.h + Math.sin(a) * -20 - land * 60, 14 * (1 - land / .5), { color: P.lamp }); }
  }
  // 帕秋莉
  const pose = tau >= t[5] && tau < t[6] ? 'cheer' : tau >= t[1] && tau < t[5] ? (tau - t[1]) % 4 < 2 ? 'point' : 'lecture' : tau >= t[7] + 2 ? 'tired' : 'lecture';
  const yawn = Math.sin(clamp((tau - yawn0) / .9, 0, 1) * Math.PI);
  stageChar(c, tau, L, { pose, gesture: L && L.talking ? .55 + .45 * Math.sin(tau * 2.4) : .3, mouth: Math.max((L && L.mouth) || 0, yawn), mood: yawn > .1 || tau > yawn0 ? 'sleepy' : (L && L.mood) || 'normal', blink: yawn > .3 ? 1 : blinkAt(tau) });
  if (yawn > .05) { const hx = STAGE.char.x + 130, hy = STAGE.char.y - STAGE.char.h * .72; zh(c, '哈～', hx, hy - yawn * 30, { size: 48, color: P.paper, outline: P.ink, ow: 6, al: yawn }); }
  c.restore();
  if (dim > 0) { c.fillStyle = alpha(mix(P.night, '#000000', .6), dim); c.fillRect(0, 0, W, H); }
  chapterTag(c, tau, '合上魔导书');
}

// ===================== 片尾 =====================
function s6Credits(c, tau, u) {   // u = 片尾开始后几秒
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix(P.night, '#000000', .45)); g.addColorStop(1, P.night2); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // 星星
  for (let k = 0; k < 70; k++) { const x = hash(k, 11) * W, y = hash(k, 12) * 620, tw = .35 + .65 * Math.max(0, Math.sin(tau * (1 + hash(k, 13) * 2) + k));
    if (k % 5 === 0) sparkle(c, x, y, 5 + 4 * tw, { color: P.lamp, al: .7 * tw }); else { c.fillStyle = alpha(P.paper, .5 * tw); c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); } }
  // 地板和一圈烛光
  const fy = 800;
  const fg = c.createLinearGradient(0, fy, 0, H); fg.addColorStop(0, mix(P.shelf, P.night, .45)); fg.addColorStop(1, mix(P.shelfDark, '#000000', .4)); c.fillStyle = fg; c.fillRect(0, fy, W, H - fy);
  for (let k = 0; k < 6; k++) rline(c, [[0, fy + 18 + k * k * 9], [W, fy + 18 + k * k * 9]], { w: 2, color: alpha(P.shelfDark, .8), seed: 1000 + k, t: tau });
  const cx = CX - 20, cy = 868, lg = c.createRadialGradient(cx + 400, cy - 60, 10, cx, cy, 620);
  lg.addColorStop(0, alpha(P.lamp, .32)); lg.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = lg; c.fillRect(0, 300, W, H - 300);
  // 书堆 + 小蜡烛
  const bx = cx + 400;
  [[P.purple, 150, 38], [P.teal, 130, 34], [P.red, 142, 36]].forEach(([col, bw, bh], k) => { const y0 = cy + 40 - (k + 1) * bh + 6;
    rshape(c, rectPts(bx - bw / 2 + (k % 2 ? 10 : -6), y0, bw, bh, 5), { fill: mix(col, P.night, .25), stroke: P.ink, w: 3, seed: 1010 + k, t: tau });
    rline(c, [[bx - bw / 2 + (k % 2 ? 22 : 6), y0 + bh / 2], [bx + bw / 2 - 20, y0 + bh / 2]], { w: 2, color: alpha(P.moon, .7), seed: 1015 + k, t: tau }); });
  s6Candle(c, tau, bx + 10, cy + 40 - 3 * 36, .75, 0, 9);
  // Q 版帕秋莉抱书躺着睡（轻轻呼吸）
  const br = Math.sin(tau * 1.6);
  c.save(); c.translate(cx + 190, cy); c.scale(1, 1 + br * .012); c.translate(-(cx + 190), -cy);
  const r = drawPatchouliChibi(c, { x: cx + 190, y: cy, h: 360, pose: 'lie', mood: 'sleepy', blink: 1, mouth: .1 + .08 * br, t: tau });
  c.restore();
  const head = (r && r.head) || [cx, cy - 100];
  for (let z = 0; z < 3; z++) { const ph = (u * .45 + z / 3) % 1;
    zh(c, 'z', head[0] + 40 + ph * 70 + Math.sin(ph * 6) * 10, head[1] - 60 - ph * 150, { size: 38 + ph * 34, color: P.hair, outline: P.night, ow: 5, al: Math.sin(ph * Math.PI) * sm(.8, 1.6, u) }); }
  // 演职信息
  const ln = (k, d = .5) => sm(1.0 + k * .45, 1.0 + k * .45 + d, u);
  const title = '帕秋莉讲座 · 第 1 集 · 完', a0 = ln(0, .7);
  if (a0 > 0) { fade(c, a0, () => {
    zh(c, title, CX, 190 - (1 - a0) * 16, { size: 76, align: 'center', color: P.moon });
    const tw = zhWidth(c, title, 76) / 2 + 60; drawMoonIcon(c, CX - tw, 165, 26, P.moon, -.35); drawMoonIcon(c, CX + tw, 165, 26, P.moon, -.35);
    rline(c, [[CX - 330, 232], [CX + 330, 232]], { w: 3, color: alpha(P.moon, .7), p: sm(1.3, 2.0, u), seed: 1020, t: tau });
  }); }
  const rows = [
    ['知识来源：', 'zijie0/HumanSystemOptimization（整理自 Huberman Lab 播客）', 318],
    ['', 'WHO《关于身体活动和久坐行为的指南》（2020）', 372],
    ['角色：', '东方 Project © 上海爱丽丝幻乐团', 452],
    ['', '本片为同人科普作品，不构成医疗建议。', 506],
    ['字体：', '霞鹜文楷（SIL OFL）', 586],
  ];
  const LX = CX - Math.max(...rows.map(q => zhWidth(c, q[1], 38))) / 2 + 60;   // 标签右对齐到这里，正文从这里起（整块大致居中）
  rows.forEach(([lab, txt, y], k) => { const a = ln(k + 1); if (a <= 0) return;
    fade(c, a, () => { const yy = y + (1 - a) * 14;
      if (lab) zh(c, lab, LX, yy, { size: 38, align: 'right', color: P.moon });
      zh(c, txt, LX, yy, { size: 38, color: P.paper }); }); });
  // 开头从黑里淡入
  const fin = 1 - sm(0, .9, u); if (fin > 0) { c.fillStyle = `rgba(0,0,0,${fin})`; c.fillRect(0, 0, W, H); }
}

scene({ order: 6, key: 'ending', title: '总结', dur: seqEnd(S6LINES) + S6CREDIT, lines: S6LINES,
  fn(c, tau, L) {
    const E = seqEnd(S6LINES), cr = E + .9;   // 讲台在 E+0.9 秒前黑下去，之后是片尾
    if (tau < cr) {
      s6Stage(c, tau, L);
      const bk = sm(E + .1, cr, tau); if (bk > 0) { c.fillStyle = `rgba(0,0,0,${bk})`; c.fillRect(0, 0, W, H); }
    } else s6Credits(c, tau, tau - cr);
  } });
