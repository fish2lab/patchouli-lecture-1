'use strict';
// 第 0 段：开场。
//   片头（满屏，0–6.4 秒）：尘光 → 魔导书转着飞近 → 封面月牙亮起 → 书打开 → 金色魔法阵 → 标题逐字写出 → 书页飞成讲台的魔导书页。
//   讲台：魔法阵里登场、红魔馆剪影、名字签、RPG 角色面板（槽一格格掉光）、「反面教材」印章、五页书签目录、宿舍三图标。
// 顶层名字一律带本段前缀 S0 / s0。本文件的 s0Icon 也给第 6 段（总结）翻页时用。
const S0LINES = seq(6.4, [
  '这里是红魔馆地下，大图书馆。',
  '我是帕秋莉·诺蕾姬，住在这里的魔法使。',
  ['常年不出门，睡得乱七八糟，还有哮喘。', { mood: 'sleepy', hold: .6 }],
  ['……所以由我来讲怎么调理身体，很有说服力吧？', { mood: 'smug', hold: .5 }],
  ['正因为是反面教材，哪些坑会让身体垮掉，我最清楚。', { mood: 'smile', hold: .4 }],
  ['今天这本魔导书一共五页：睡眠、吃饭、动力、专注、运动。', { hold: .6 }],
  ['专门写给熬夜、久坐、天天点外卖的大学生。', { mood: 'smile', hold: .6 }],
]);
// 片头节拍（秒）
const S0HEAD = { fly0: .25, fly1: 1.75, glow: 1.75, open0: 2.15, open1: 2.85, circ: 2.6, sub: 3.0, big1: 3.45, big2: 4.0, out0: 5.5, out1: 6.4 };
// 片头魔导书：书页尺寸（本地坐标），打开后放大到 S0BOOK.k
const S0BOOK = { pw: 400, ph: 520, k0: 1.05, k: 1.55 };
// 五页目录：图标名、标题、书签颜色
const S0PAGES = [['moon', '睡眠', P.purple], ['bowl', '吃饭', P.orange], ['spark', '动力', P.red], ['target', '专注', P.teal], ['dumbbell', '运动', P.green]];

// ===================== 小图标（线宽随尺寸，s ≈ 图标半径） =====================
function s0Icon(c, name, x, y, s, t = null, seed = 1) {
  const w = Math.max(3, s * .09), o = { w, t, seed };
  if (name === 'moon') {
    c.save(); c.translate(x, y); c.rotate(-.35);
    const p = new Path2D(); p.arc(0, 0, s * .82, 0, TAU); p.moveTo(s * .45 + s * .7, -s * .25); p.arc(s * .45, -s * .25, s * .7, 0, TAU);
    c.fillStyle = P.moon; c.fill(p, 'evenodd'); c.restore();
    sparkle(c, x + s * .62, y - s * .55, s * .22); sparkle(c, x + s * .8, y + s * .05, s * .13);
    rshape(c, starPts(x + s * .62, y - s * .55, s * .2, 4, .35), { fill: P.sun, stroke: P.ink, w: w * .6, t, seed: seed + 3 });
  } else if (name === 'bowl') {
    const rice = []; for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; rice.push([x + Math.cos(a) * s * .78, y - s * .05 + Math.sin(a) * s * .55]); }
    rshape(c, rice, { fill: P.paper, stroke: P.ink, ...o, seed: seed + 1 });
    rline(c, [[x + s * .2, y - s * .95], [x + s * .95, y - s * .2]], { ...o, color: P.shelf2, w: w * 1.1, seed: seed + 5 });
    rline(c, [[x + s * .38, y - s * 1.0], [x + s * 1.0, y - s * .38]], { ...o, color: P.shelf2, w: w * 1.1, seed: seed + 6 });
    const bowl = [[x - s * .95, y - s * .05]]; for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI; bowl.push([x + Math.cos(a) * s * .95, y - s * .05 + Math.sin(a) * s * .75]); }
    rshape(c, bowl.slice(1), { fill: P.red, stroke: P.ink, ...o, seed: seed + 2 });
    rline(c, [[x - s * .8, y + s * .28], [x + s * .8, y + s * .28]], { ...o, color: P.paper, w: w * .9, seed: seed + 7 });
    rshape(c, rectPts(x - s * .3, y + s * .66, s * .6, s * .18, 3), { fill: P.red, stroke: P.ink, ...o, w: w * .8, seed: seed + 4 });
    for (let k = 0; k < 3; k++) rline(c, [[x - s * .35 + k * s * .32, y - s * .3], [x - s * .3 + k * s * .32, y - s * .25]], { ...o, color: P.faint, w: w * .8, seed: seed + 9 + k });
  } else if (name === 'spark') {
    rshape(c, starPts(x, y, s, 8, .42, .2), { fill: P.sun, stroke: P.ink, ...o });
    rshape(c, starPts(x, y, s * .45, 4, .45), { fill: P.paper, stroke: false, ...o });
    for (let k = 0; k < 3; k++) sparkle(c, x + Math.cos(k * 2.1 + .5) * s * 1.05, y + Math.sin(k * 2.1 + .5) * s * 1.05, s * .16, { color: P.orange });
  } else if (name === 'target') {
    rshape(c, circPts(x, y, s * .92), { fill: P.red, stroke: P.ink, ...o });
    rshape(c, circPts(x, y, s * .62), { fill: P.paper, stroke: P.ink, ...o, w: w * .7, seed: seed + 1 });
    rshape(c, circPts(x, y, s * .3), { fill: P.red, stroke: P.ink, ...o, w: w * .7, seed: seed + 2 });
    rline(c, [[x + s * .9, y - s * .9], [x + s * .05, y - s * .05]], { ...o, w: w * 1.1, seed: seed + 3 });
    rline(c, [[x + s * .7, y - s * 1.05], [x + s * .95, y - s * .95], [x + s * 1.05, y - s * .7]], { ...o, color: P.purple, seed: seed + 4 });
  } else if (name === 'dumbbell') {
    rline(c, [[x - s * .75, y], [x + s * .75, y]], { ...o, w: w * 1.6, color: P.ink2 });
    for (const sx of [-1, 1]) {
      rshape(c, rectPts(x + sx * s * .6 - s * .13, y - s * .55, s * .26, s * 1.1, 5), { fill: P.ink2, stroke: P.ink, ...o, seed: seed + 2 + sx });
      rshape(c, rectPts(x + sx * s * .88 - s * .1, y - s * .36, s * .2, s * .72, 4), { fill: P.purple, stroke: P.ink, ...o, seed: seed + 5 + sx });
    }
  } else if (name === 'phone') {
    const g = c.createRadialGradient(x, y, s * .2, x, y, s * 1.5); g.addColorStop(0, alpha(P.sky, .55)); g.addColorStop(1, alpha(P.sky, 0));
    c.fillStyle = g; c.fillRect(x - s * 1.6, y - s * 1.6, s * 3.2, s * 3.2);
    rshape(c, rectPts(x - s * .5, y - s * .9, s, s * 1.8, s * .14), { fill: P.ink, stroke: P.ink, ...o });
    rshape(c, rectPts(x - s * .4, y - s * .75, s * .8, s * 1.45, 4), { fill: mix(P.sky, '#ffffff', .45), stroke: false, ...o });
    zh(c, '2:00', x, y - s * .22, { size: s * .3, align: 'center', color: P.ink });
    for (let k = 0; k < 3; k++) rline(c, [[x - s * .28, y + s * (.1 + k * .18)], [x + s * (.28 - k * .12), y + s * (.1 + k * .18)]], { ...o, w: w * .6, color: P.blue, seed: seed + 3 + k });
    drawMoonIcon(c, x + s * .85, y - s * .85, s * .28, P.moon, -.4);
  } else if (name === 'chair') {
    rline(c, [[x - s * .5, y - s * .95], [x - s * .5, y + s * .95]], { ...o, color: P.shelf2, w: w * 1.2 });
    rline(c, [[x - s * .5, y + s * .2], [x + s * .5, y + s * .2]], { ...o, color: P.shelf2, w: w * 1.3, seed: seed + 1 });
    rline(c, [[x + s * .45, y + s * .2], [x + s * .45, y + s * .95]], { ...o, color: P.shelf2, w: w * 1.2, seed: seed + 2 });
    // 驼背坐着的小人
    rshape(c, circPts(x - s * .05, y - s * .62, s * .2), { fill: P.paper, stroke: P.ink, ...o, seed: seed + 3 });
    rline(c, [[x - s * .12, y - s * .42], [x - s * .32, y - s * .15], [x - s * .3, y + s * .12]], { ...o, smooth: true, seed: seed + 4 });
    rline(c, [[x - s * .3, y + s * .12], [x + s * .5, y + s * .1], [x + s * .55, y + s * .85]], { ...o, seed: seed + 5 });
    rline(c, [[x - s * .25, y - s * .25], [x + s * .2, y - s * .15], [x + s * .3, y - s * .35]], { ...o, seed: seed + 6 });
    rshape(c, rectPts(x + s * .25, y - s * .52, s * .14, s * .24, 2), { fill: P.sky, stroke: P.ink, ...o, w: w * .6, seed: seed + 7 });
  } else if (name === 'bag') {
    for (let k = 0; k < 3; k++) rline(c, [[x - s * .3 + k * s * .3, y - s * .75], [x - s * .22 + k * s * .3, y - s * .95], [x - s * .32 + k * s * .3, y - s * 1.15]], { ...o, color: P.faint, w: w * .8, smooth: true, seed: seed + 11 + k });
    rline(c, [[x - s * .3, y - s * .45], [x - s * .25, y - s * .8], [x + s * .25, y - s * .8], [x + s * .3, y - s * .45]], { ...o, smooth: true, seed: seed + 1 });
    rshape(c, [[x - s * .7, y - s * .5], [x + s * .7, y - s * .5], [x + s * .6, y + s * .9], [x - s * .6, y + s * .9]], { fill: P.orange, stroke: P.ink, ...o });
    rshape(c, circPts(x, y + s * .2, s * .3), { fill: P.paper, stroke: P.ink, ...o, w: w * .7, seed: seed + 2 });
    zh(c, '饭', x, y + s * .2, { size: s * .36, align: 'center', base: 'middle', color: P.red });
  }
}

// ===================== 片头 =====================
// 分段上色的逐字书写：segs = [[文字, 颜色], ...]，整体居中于 x，p 是整句的书写进度
function s0Rich(c, segs, x, y, size, p) {
  const all = segs.map(q => q[0]).join(''), n = Math.floor([...all].length * clamp(p, 0, 1) + 1e-6);
  let cx = x - zhWidth(c, all, size) / 2, used = 0;
  for (const [txt, col] of segs) { const m = [...txt].length, k = clamp(n - used, 0, m);
    if (k > 0) zh(c, [...txt].slice(0, k).join(''), cx, y, { size, color: col, outline: P.paper, ow: 10 });
    cx += zhWidth(c, txt, size); used += m; }
}
// 页面花饰：四角卷草 + 书签丝带（本地坐标，书页 0..pw）
function s0PageDeco(c, tau, side) {
  const { pw, ph } = S0BOOK;
  for (const [x0, y0, sx, sy] of [[side < 0 ? -pw + 26 : 26, -ph / 2 + 26, 1, 1], [side < 0 ? -26 : pw - 26, -ph / 2 + 26, -1, 1], [side < 0 ? -pw + 26 : 26, ph / 2 - 26, 1, -1], [side < 0 ? -26 : pw - 26, ph / 2 - 26, -1, -1]]) {
    rline(c, [[x0, y0 + sy * 60], [x0, y0], [x0 + sx * 60, y0]], { w: 3, color: P.moon, seed: 90 + x0, t: tau });
    rline(c, [[x0 + sx * 12, y0 + sy * 40], [x0 + sx * 22, y0 + sy * 20], [x0 + sx * 40, y0 + sy * 12]], { w: 2, color: P.gold, smooth: true, seed: 95 + x0, t: tau });
    sparkle(c, x0 + sx * 24, y0 + sy * 24, 7, { color: P.gold });
  }
}
// 片头的魔导书飞行轨迹：返回 { x, y, k, rot }
function s0BookPose(tau) {
  const T = S0HEAD, f = sm(T.fly0, T.fly1, tau, easeOut), u = 1 - f;
  const A = [1650, 150], B = [420, 180], C = [CX, CY + 20];
  const x = u * u * A[0] + 2 * u * f * B[0] + f * f * C[0], y = u * u * A[1] + 2 * u * f * B[1] + f * f * C[1];
  const land = tau - T.fly1, settle = land > 0 ? Math.sin(land * 14) * Math.exp(-land * 6) : 0;
  const k = lerp(.07, S0BOOK.k0, Math.pow(f, 1.4)) * (1 + settle * .04) * lerp(1, S0BOOK.k / S0BOOK.k0, sm(T.open0, T.open1 + .2, tau));
  const rot = -u * u * TAU * 1.6 + settle * .05;
  const bob = land > 0 ? Math.sin(land * 2.2) * 5 * sm(0, .6, land) : 0;
  return { x, y: y + bob, k, rot };
}
// 画魔导书（本地坐标：书脊在 x=0，右页 0..pw）。uo 打开进度 0..1，glow 封面月牙亮度
function s0Book(c, tau, uo, glow) {
  const { pw, ph } = S0BOOK, leather = mix(P.red, P.ink, .55), leather2 = mix(P.red, P.ink, .7), T = tau;
  // 底封（右）和书页块
  rshape(c, rectPts(-6, -ph / 2 - 12, pw + 20, ph + 24, 14), { fill: leather2, stroke: P.ink, w: 5, seed: 41, t: T });
  rshape(c, rectPts(0, -ph / 2, pw + 6, ph + 4, 6), { fill: P.paper2, stroke: P.paperEdge, w: 3, seed: 42, t: T });
  for (let k = 0; k < 5; k++) rline(c, [[pw + 1 - k * 1.5, -ph / 2 + 8 + k * 3], [pw + 1 - k * 1.5, ph / 2 - 6]], { w: 1.5, color: P.paperEdge, seed: 43 + k });
  rshape(c, rectPts(0, -ph / 2, pw, ph, 6), { fill: P.paper, stroke: P.paperEdge, w: 3, seed: 44, t: T });
  if (uo > .5) fade(c, sm(.6, 1, uo), () => s0PageDeco(c, tau, 1));
  // 左页（打开后可见）
  const sx = Math.cos(uo * Math.PI);
  if (sx < 0) {
    c.save(); c.scale(sx, 1);
    rshape(c, rectPts(-6, -ph / 2 - 12, pw + 20, ph + 24, 14), { fill: leather2, stroke: P.ink, w: 5, seed: 45, t: T });
    rshape(c, rectPts(0, -ph / 2, pw, ph, 6), { fill: P.paper, stroke: P.paperEdge, w: 3, seed: 46, t: T });
    fade(c, sm(.6, 1, uo), () => s0PageDeco(c, tau, 1));
    c.restore();
  }
  // 书沟阴影
  if (uo > .5) {
    const a = sm(.5, 1, uo), g = c.createLinearGradient(-40, 0, 40, 0);
    g.addColorStop(0, alpha(P.paperEdge, 0)); g.addColorStop(.5, alpha(P.paperEdge, .75 * a)); g.addColorStop(1, alpha(P.paperEdge, 0));
    c.fillStyle = g; c.fillRect(-40, -ph / 2, 80, ph);
    const sw = Math.sin(tau * 2.1) * 6;
    rshape(c, [[8, ph / 2 - 30], [30, ph / 2 - 30], [34 + sw, ph / 2 + 70], [21 + sw, ph / 2 + 56], [8 + sw, ph / 2 + 70]], { fill: P.red, stroke: P.ink, w: 3, seed: 55, t: tau });
  }
  // 封面（正面，朝右时可见）
  if (sx > 0) {
    c.save(); c.scale(sx, 1);
    rshape(c, rectPts(-6, -ph / 2 - 12, pw + 20, ph + 24, 14), { fill: leather, stroke: P.ink, w: 5, seed: 47, t: T });
    rshape(c, rectPts(-6, -ph / 2 - 12, 34, ph + 24, 10), { fill: leather2, stroke: P.ink, w: 4, seed: 48, t: T });
    rline(c, rectPts(40, -ph / 2 + 14, pw - 50, ph - 28, 10), { w: 5, color: P.moon, close: true, seed: 49, t: T });
    rline(c, rectPts(54, -ph / 2 + 28, pw - 78, ph - 56, 6), { w: 2, color: P.gold, close: true, seed: 50, t: T });
    for (const [cx, cy] of [[54, -ph / 2 + 28], [pw - 24, -ph / 2 + 28], [54, ph / 2 - 28], [pw - 24, ph / 2 - 28]]) rshape(c, starPts(cx, cy, 16, 4, .4), { fill: P.moon, stroke: false, seed: 51 });
    const mx = pw / 2 + 12, my = -20;
    if (glow > 0) { const g = c.createRadialGradient(mx, my, 10, mx, my, 220); g.addColorStop(0, alpha(P.lamp, .8 * glow)); g.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = g; c.fillRect(mx - 230, my - 230, 460, 460); }
    rline(c, circPts(mx, my, 118), { w: 4, color: P.moon, close: true, seed: 52, t: T });
    rline(c, circPts(mx, my, 104), { w: 2, color: P.gold, close: true, seed: 53, t: T });
    drawMoonIcon(c, mx, my, 80, mix(P.gold, '#fff6d8', glow * .55), -.35);
    zh(c, '魔 导 书', mx, ph / 2 - 56, { size: 34, align: 'center', color: P.moon });
    c.restore();
  }
}
function s0Title(c, tau) {
  const T = S0HEAD, out = sm(T.out0, T.out1, tau, easeIO);
  // 图书馆（转场时从上往下「落」下来）
  if (out > 0) {
    c.save(); const z = lerp(1.16, 1, out); c.translate(CX, CY + lerp(-90, 0, out)); c.scale(z, z); c.translate(-CX, -CY);
    libraryBg(c, tau); c.restore();
  }
  // 片头底色：深紫到黑的暗角 + 背景里很淡的大魔法阵 + 上升的金色尘光
  fade(c, 1 - out, () => {
    const g = c.createRadialGradient(CX, CY, 60, CX, CY, 1150); g.addColorStop(0, P.night3); g.addColorStop(.5, P.night); g.addColorStop(1, mix(P.night, '#000000', .75));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    magicCircle(c, CX, CY + 20, 760, tau, { color: P.hair, al: .07 * sm(.2, 1.5, tau), spin: .08 });
    for (let k = 0; k < 90; k++) {
      const sp = 20 + hash(k, 4) * 50, x = hash(k, 1) * W + Math.sin(tau * .7 + k) * 14, y = ((hash(k, 2) * (H + 100) - tau * sp) % (H + 100) + H + 100) % (H + 100) - 50;
      const tw = .45 + .55 * Math.sin(tau * (2 + hash(k, 3) * 3) + k * 1.7), r = 1.2 + hash(k, 5) * 2.6;
      if (hash(k, 6) < .18) sparkle(c, x, y, r * 2.6, { color: P.lamp, al: Math.max(0, tw) * .8 });
      else { c.fillStyle = alpha(P.lamp, Math.max(0, tw) * .55); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    }
  });
  // 魔导书
  const bp = s0BookPose(tau), uo = sm(T.open0, T.open1, tau, easeIO), glow = sm(T.glow, T.glow + .35, tau) * (1 - sm(T.open0 + .2, T.open0 + .45, tau));
  const { pw, ph } = S0BOOK;
  // 飞行拖尾
  for (let j = 1; j <= 16; j++) { const tt = tau - j * .03; if (tt < T.fly0 || tt > T.fly1 - .05) continue; const q = s0BookPose(tt);
    sparkle(c, q.x + (hash(j, Math.floor(tau * 12)) - .5) * 40 * q.k, q.y + (hash(j + 9, Math.floor(tau * 12)) - .5) * 40 * q.k, (18 - j) * 1.6 * Math.max(.3, q.k), { color: P.lamp, al: (1 - j / 17) * .8, rot: j }); }
  // 着陆的冲击环
  const land = tau - T.fly1;
  if (land > 0 && land < .7) { const u = land / .7; c.save(); c.globalAlpha = (1 - u) * .8; c.strokeStyle = P.moon; c.lineWidth = 6 * (1 - u) + 1;
    c.beginPath(); c.ellipse(bp.x, bp.y + 10, 200 + u * 600, (200 + u * 600) * .5, 0, 0, TAU); c.stroke(); c.restore(); }
  // 打开时书里透出的光
  const burst = Math.sin(clamp((tau - T.open0) / (T.open1 - T.open0 + .5), 0, 1) * Math.PI);
  const morph = sm(0, .7, out);
  c.save();
  if (out > 0) {   // 转场：书的跨页矩形插值到讲台黑板
    const sw = pw * 2 * bp.k, sh = ph * bp.k, B = STAGE.board;
    const rx = lerp(bp.x - sw / 2, B.x, morph), ry = lerp(bp.y - sh / 2, B.y, morph), rw = lerp(sw, B.w, morph), rh = lerp(sh, B.h, morph);
    fade(c, 1 - sm(.1, .55, out), () => { c.save(); c.translate(rx + rw / 2, ry + rh / 2); c.scale(rw / (pw * 2), rh / ph); s0Book(c, tau, 1, 0); c.restore(); });
    fade(c, sm(.05, .5, out), () => board(c, rx, ry, rw, rh, { t: tau }));
  } else {
    c.translate(bp.x, bp.y); c.rotate(bp.rot); c.scale(bp.k, bp.k); c.translate(-pw / 2 * (1 - uo), 0);
    s0Book(c, tau, uo, glow);
  }
  c.restore();
  if (burst > 0 && out <= 0) { c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(bp.x, bp.y, 20, bp.x, bp.y, 700); g.addColorStop(0, alpha(P.lamp, .3 * burst)); g.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + tau * .35 + hash(k, 2) * .2, L1 = (560 + 260 * hash(k, 3)) * (.6 + .4 * burst), wd = .035 + .03 * hash(k, 4);
      const gr = c.createRadialGradient(bp.x, bp.y, 60, bp.x, bp.y, L1); gr.addColorStop(0, alpha(P.lamp, .22 * burst)); gr.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = gr;
      c.beginPath(); c.moveTo(bp.x, bp.y); c.lineTo(bp.x + Math.cos(a - wd) * L1, bp.y + Math.sin(a - wd) * L1 * .75); c.lineTo(bp.x + Math.cos(a + wd) * L1, bp.y + Math.sin(a + wd) * L1 * .75); c.closePath(); c.fill(); }
    c.restore(); }
  // 书页上的魔法阵和标题（屏幕坐标，跟着书一起轻轻上下浮）
  const ta = 1 - sm(T.out0, T.out0 + .35, tau);
  if (tau > T.circ && ta > 0) fade(c, ta, () => {
    const mx = bp.x, my = bp.y, cp = sm(T.circ, T.circ + .9, tau, easeOut), R = 340;
    c.save(); c.globalAlpha *= .5;
    rline(c, circPts(mx, my, R, 96), { w: 5, color: P.moon, p: cp, seed: 61, t: tau });
    rline(c, circPts(mx, my, R * .9, 96), { w: 2.5, color: P.gold, p: cp, seed: 62, t: tau });
    const hex = []; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k * 2 % 7) * TAU / 7 + tau * .12; hex.push([mx + Math.cos(a) * R * .9, my + Math.sin(a) * R * .9]); }
    rline(c, hex, { w: 3, color: P.moon, p: sm(T.circ + .3, T.circ + 1.1, tau), seed: 63, t: tau });
    c.restore();
    magicCircle(c, mx, my, R * 1.12, tau, { color: P.gold, al: .35 * cp, spin: .25 });
    const sub = '帕秋莉讲座 · 第 1 集', l1 = '我是帕秋莉，', l2 = '我来教你调理身体！';
    const ps = writeP(tau, T.sub, sub, .045), p1 = writeP(tau, T.big1, l1, .085), p2 = writeP(tau, T.big2, l2, .085);
    zh(c, sub, mx, my - 232, { size: 52, align: 'center', color: P.purple, p: ps });
    if (ps > 0) { const wv = zhWidth(c, sub, 52) / 2 + 30; rline(c, [[mx - wv, my - 205], [mx + wv, my - 205]], { w: 3, color: P.moon, p: sm(T.sub + .2, T.sub + .7, tau), seed: 64, t: tau }); }
    s0Rich(c, [['我是', P.ink], ['帕秋莉', P.purple], ['，', P.ink]], mx, my - 30, 112, p1);
    s0Rich(c, [['我来教你', P.ink], ['调理身体', P.red], ['！', P.ink]], mx, my + 128, 112, p2);
    const fw = zhWidth(c, l2, 112) / 2;
    rline(c, [[mx - fw, my + 168], [mx - fw * .3, my + 180], [mx + fw * .4, my + 162], [mx + fw + 20, my + 176]], { w: 6, color: P.red, p: sm(T.big2 + .85, T.big2 + 1.2, tau), smooth: true, seed: 65, t: tau });
    // 笔尖的光点
    for (const [txt, t0, pp, yy, sz] of [[sub, T.sub, ps, my - 232, 52], [l1, T.big1, p1, my - 30, 112], [l2, T.big2, p2, my + 128, 112]]) {
      if (pp <= 0 || pp >= 1) continue; const n = Math.floor([...txt].length * pp), wv = zhWidth(c, txt, sz), x0 = mx - wv / 2 + zhWidth(c, [...txt].slice(0, n).join(''), sz);
      sparkle(c, x0 + 6, yy - sz * .4, 22 + 8 * Math.sin(tau * 30), { color: P.lamp, rot: tau * 5 }); }
    // 写完后标题周围一圈闪光
    const done = tau - (T.big2 + 9 * .085);
    if (done > 0) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .3, r = 420 + 30 * Math.sin(tau * 2 + k), tw = Math.max(0, Math.sin(tau * 5 + k * 2)) * sm(0, .3, done);
      sparkle(c, mx + Math.cos(a) * r * 1.3, my + Math.sin(a) * r * .72, 20 * tw, { color: P.lamp }); }
  });
  // 开头从黑里淡入
  const fin = 1 - sm(0, .7, tau); if (fin > 0) { c.fillStyle = alpha('#000000', fin); c.fillRect(0, 0, W, H); }
}

// ===================== 讲台部分 =====================
// 红魔馆 + 地下图书馆的小剪影（本地坐标，中心 0,0；u = 从开始画起过了几秒）
function s0Mansion(c, tau, u) {
  const o = { t: tau }, pk = (a, d = .4) => easeOutBack(clamp((u - a) / d, 0, 1));
  rline(c, [[-440, 0], [440, 0]], { w: 5, color: P.ink, p: sm(0, .5, u), seed: 71, ...o });
  pop(c, 0, 0, pk(.2, .5), () => {
    const wall = mix(P.red, P.paper, .12), roof = mix(P.red, P.ink, .45);
    for (const sx of [-1, 1]) { rshape(c, rectPts(sx * 280 - 32, -200, 64, 200), { fill: wall, seed: 72 + sx, ...o }); rshape(c, [[sx * 280 - 44, -200], [sx * 280, -262], [sx * 280 + 44, -200]], { fill: roof, seed: 74 + sx, ...o }); }
    rshape(c, rectPts(-250, -150, 500, 150), { fill: wall, seed: 76, ...o });
    rshape(c, [[-272, -150], [-232, -196], [232, -196], [272, -150]], { fill: roof, seed: 77, ...o });
    rshape(c, rectPts(-46, -290, 92, 140), { fill: wall, seed: 78, ...o });
    rshape(c, [[-62, -290], [0, -352], [62, -290]], { fill: roof, seed: 79, ...o });
    rshape(c, circPts(0, -240, 28), { fill: P.paper, seed: 80, ...o, w: 3 });
    rline(c, [[0, -240], [0, -258], [0, -240], [13, -234]], { w: 3, seed: 81, ...o });
    for (let r = 0; r < 2; r++) for (let k = -4; k <= 4; k++) if (k) rshape(c, rectPts(k * 50 - 12, -128 + r * 60, 24, 34, 8), { fill: alpha(P.sun, .85), w: 2.5, seed: 82 + k + r * 9, ...o });
    rshape(c, [[-30, 0], [-30, -52], [0, -70], [30, -52], [30, 0]], { fill: P.ink2, w: 3, seed: 99, ...o });
  });
  pop(c, 330, -300, pk(.6), () => { drawMoonIcon(c, 330, -300, 38, P.moon, -.3); sparkle(c, 380, -330, 10); });
  zh(c, '红魔馆', -350, -300, { size: 48, color: P.red, p: writeP(u, .5, '红魔馆', .1) });
  // 地下
  arrow(c, [-380, -40], [-380, 150], { w: 5, color: P.purple, p: sm(.9, 1.3, u), seed: 101, t: tau });
  zh(c, '地下', -440, 240, { size: 40, color: P.purple, p: writeP(u, 1.1, '地下', .1) });
  pop(c, 20, 170, pk(1.1, .45), () => {
    rshape(c, rectPts(-310, 40, 660, 260, 26), { fill: P.night2, seed: 102, ...o });
    const lg = c.createRadialGradient(20, 70, 10, 20, 150, 300); lg.addColorStop(0, alpha(P.lamp, .45)); lg.addColorStop(1, alpha(P.lamp, 0)); c.fillStyle = lg; c.fill(polyPath(rectPts(-306, 44, 652, 252, 22)));
    const cols = [P.red, P.blue, P.green, P.purple, P.orange, P.teal, P.pink, P.gold];
    for (let row = 0; row < 3; row++) {
      const yb = 115 + row * 70, n = Math.floor(clamp((u - 1.35 - row * .15) / .5, 0, 1) * 22);
      for (let k = 0; k < n; k++) { const bw = 20 + hash(k, row + 3) * 8, bh = 42 + hash(k, row + 7) * 14, x0 = -280 + k * 27;
        rshape(c, rectPts(x0, yb - bh, bw, bh, 2), { fill: mix(cols[(k * 3 + row) % 8], P.night, .25), stroke: P.ink, w: 2, seed: 110 + k + row * 30, t: tau }); }
      rline(c, [[-295, yb + 2], [335, yb + 2]], { w: 5, color: P.shelf2, seed: 180 + row, t: tau });
    }
  });
  zh(c, '大图书馆', 20, 200, { size: 64, align: 'center', color: P.moon, outline: P.night, ow: 10, p: writeP(u, 1.55, '大图书馆', .1) });
}
// 名字签
function s0NameCard(c, tau, u) {
  const o = { t: tau }, x = 1330, y = 215, w = 500, h = 470;
  pop(c, x + w / 2, y + h / 2, easeOutBack(clamp(u / .4, 0, 1)), () => {
    rshape(c, rectPts(x, y, w, h, 16), { fill: P.paper2, stroke: P.ink2, w: 5, seed: 201, ...o });
    rshape(c, [[x + 30, y - 18], [x + 180, y - 18], [x + 196, y + 10], [x + 180, y + 38], [x + 30, y + 38]], { fill: P.purple, seed: 202, ...o });
    zh(c, '名字签', x + 50, y + 22, { size: 34, color: P.paper });
    drawMoonIcon(c, x + w - 50, y + 50, 26, P.moon, -.3);
  });
  if (u < .2) return;
  const name = '帕秋莉·诺蕾姬';
  zh(c, name, x + w / 2, y + 140, { size: 66, align: 'center', color: P.ink, p: writeP(u, .3, name, .08) });
  rline(c, [[x + 40, y + 168], [x + w - 40, y + 168]], { w: 4, color: P.moon, p: sm(.8, 1.1, u), seed: 203, ...o });
  zh(c, 'Patchouli Knowledge', x + w / 2, y + 222, { size: 36, align: 'center', color: P.purple, p: writeP(u, .9, 'Patchouli Knowledge', .025) });
  zh(c, '住址：大图书馆', x + 44, y + 320, { size: 46, color: P.ink, p: writeP(u, 1.55, '住址：大图书馆', .06) });
  zh(c, '种族：魔法使', x + 44, y + 400, { size: 46, color: P.ink, p: writeP(u, 2.35, '种族：魔法使', .06) });
}
// RPG 角色面板。u = 面板出现后几秒；drain 是三条槽的掉格时间 [开始, 结束]；flash 槽闪红（L4）
function s0Panel(c, tau, u, beats) {
  const o = { t: tau }, X = 760, Y = 112, PW = 1050, PH = 700;
  const k = easeOutBack(clamp(u / .35, 0, 1));
  pop(c, X + PW / 2, Y + PH / 2, k, () => {
    rshape(c, rectPts(X, Y, PW, PH, 22), { fill: alpha(P.night2, .97), stroke: P.moon, w: 6, seed: 301, ...o });
    rline(c, rectPts(X + 14, Y + 14, PW - 28, PH - 28, 14), { w: 2, color: alpha(P.moon, .6), close: true, seed: 302, ...o });
    rshape(c, [[X + 40, Y - 22], [X + 250, Y - 22], [X + 270, Y + 4], [X + 250, Y + 30], [X + 40, Y + 30]], { fill: P.moon, seed: 303, ...o });
    zh(c, '角色面板', X + 70, Y + 16, { size: 36, color: P.ink });
    // 头像
    const hx = X + 100, hy = Y + 110;
    rshape(c, circPts(hx, hy, 70), { fill: P.night3, stroke: P.moon, w: 4, seed: 304, ...o });
    c.save(); c.beginPath(); c.arc(hx, hy, 66, 0, TAU); c.clip(); drawPatchouliChibi(c, { x: hx, y: hy + 150, h: 230, mood: 'sleepy', blink: blinkAt(tau, 4), t: tau }); c.restore();
    zh(c, '帕秋莉·诺蕾姬', X + 200, Y + 102, { size: 52, color: P.paper });
    zh(c, 'Lv.99  魔法使 · 大图书馆', X + 200, Y + 158, { size: 34, color: P.moon });
    rline(c, [[X + 40, Y + 200], [X + PW - 40, Y + 200]], { w: 2, color: alpha(P.moon, .6), seed: 305, ...o });
  });
  if (u < .25) return;
  const rows = [['魔力', 10, 10, null, null, P.moon, 'MAX'], ['外出频率', 10, 0, beats.out0, beats.out1, null, '极低'], ['作息规律', 10, 1, beats.sleep0, beats.sleep1, null, '混乱'], ['体力', 10, 1, beats.hp0, beats.hp1, null, '1/10']];
  rows.forEach(([name, full, last, t0, t1, col, val], r) => {
    const ry = Y + 280 + r * 92, bx = X + 290, sw = 50, gap = 6;
    zh(c, name, X + 50, ry + 16, { size: 46, color: P.paper });
    const prog = t0 === null ? 0 : clamp((u - t0) / (t1 - t0), 0, 1), gone = Math.floor(prog * (full - last) + 1e-6), left = full - gone;
    const fcol = col || (left > 6 ? P.green : left > 2 ? P.orange : P.red), flash = beats.flash && t0 !== null ? .5 + .5 * Math.sin((u - beats.flash) * 14) : 0;
    for (let s = 0; s < full; s++) {
      const sx = bx + s * (sw + gap);
      rshape(c, rectPts(sx, ry - 20, sw, 40, 5), { fill: alpha(P.ink, .6), stroke: flash > .5 && u > beats.flash ? P.red : alpha(P.paper, .35), w: 2.5, seed: 310 + s + r * 13, ...o });
      if (s < left) rshape(c, rectPts(sx + 4, ry - 16, sw - 8, 32, 3), { fill: fcol, stroke: false, seed: 330 + s + r * 13, ...o });
      else if (t0 !== null) { // 刚掉下去的格子往下落
        const dt = u - (t0 + (full - s) / (full - last) * (t1 - t0));
        if (dt > 0 && dt < .5) fade(c, 1 - dt / .5, () => { c.save(); c.translate(sx + sw / 2, ry + dt * dt * 900); c.rotate(dt * 3 * (s % 2 ? 1 : -1)); rshape(c, rectPts(-sw / 2 + 4, -16, sw - 8, 32, 3), { fill: P.orange, stroke: false, seed: 350 + s }); c.restore(); });
      }
    }
    if (col) { zh(c, val, bx + full * (sw + gap) + 20, ry + 14, { size: 40, color: P.moon }); sparkle(c, bx + full * (sw + gap) - 20, ry - 22, 12 + 4 * Math.sin(tau * 6), { color: P.lamp }); }
    else if (prog >= 1) pop(c, bx + full * (sw + gap) + 60, ry, easeOutBack(clamp((u - t1) / .3, 0, 1)), () => zh(c, val, bx + full * (sw + gap) + 20, ry + 14, { size: 40, color: P.red }));
  });
  // 哮喘：打勾
  const ay = Y + 280 + 4 * 92, bx = X + 290;
  zh(c, '哮喘', X + 50, ay + 16, { size: 46, color: P.paper });
  rshape(c, rectPts(bx, ay - 24, 48, 48, 6), { fill: alpha(P.ink, .6), stroke: alpha(P.paper, .6), w: 3, seed: 370, ...o });
  if (u > beats.asthma) {
    check(c, bx + 24, ay, 60, { color: P.red, p: sm(beats.asthma, beats.asthma + .3, u), t: tau, seed: 371 });
    zh(c, '有（常年）', bx + 80, ay + 14, { size: 40, color: P.red, p: writeP(u, beats.asthma + .2, '有（常年）', .06) });
  }
}
// 书签（目录的一页）。x 中心，y 顶边，k 弹出进度
function s0Bookmark(c, tau, i, x, y, k) {
  if (k <= 0) return;
  const [ic, name, col] = S0PAGES[i], bw = 176, bh = 340, sway = Math.sin(tau * 1.6 + i * 1.3) * .02;
  c.save(); c.translate(x, y - (1 - clamp(k, 0, 1)) * 120); c.rotate(sway); c.globalAlpha *= clamp(k * 2, 0, 1);
  const sc = .6 + .4 * k; c.scale(sc, sc);
  rshape(c, [[-bw / 2, 0], [bw / 2, 0], [bw / 2, bh], [0, bh - 44], [-bw / 2, bh]], { fill: col, stroke: P.ink, w: 5, seed: 401 + i, t: tau });
  rline(c, [[-bw / 2 + 14, 10], [-bw / 2 + 14, bh - 16]], { w: 2, color: alpha(P.paper, .5), seed: 410 + i, t: tau });
  rshape(c, circPts(0, 92, 62), { fill: P.paper, stroke: P.ink, w: 4, seed: 420 + i, t: tau });
  s0Icon(c, ic, 0, 92, 40, tau, 430 + i * 10);
  zh(c, name, 0, 236, { size: 52, align: 'center', color: P.paper, outline: P.ink, ow: 7 });
  zh(c, '第' + '一二三四五'[i] + '页', 0, 286, { size: 32, align: 'center', color: alpha(P.paper, .9) });
  c.restore();
}
function s0Stage(c, tau, L) {
  const t = S0LINES.map(l => l[0]), end = seqEnd(S0LINES), CH = .16;   // CH：约每字 0.16 秒（和嘴型节奏一致）
  // 镜头：面板那几句稍微推近黑板；印章砸下来时震屏
  const push = .04 * Math.min(sm(t[2] - .2, t[2] + .6, tau), 1 - sm(t[5] - .3, t[5] + .3, tau));
  const hit = t[4] + .42, shake = tau > hit ? Math.exp(-(tau - hit) * 8) * 16 : 0;
  c.save();
  c.translate(1280, 470); c.scale(1 + push, 1 + push); c.translate(-1280, -470);
  if (shake > .2) c.translate(noise1(tau * 45, 3) * shake, noise1(tau * 45, 8) * shake);
  libraryBg(c, tau);
  const B = STAGE.board, clear = 1 - sm(end + .25, end + .55, tau);
  board(c, B.x, B.y, B.w, B.h, { t: tau });
  const X = (a, b, f = .25) => Math.min(sm(a, a + f, tau), 1 - sm(b - f, b, tau));   // 这一组在 [a, b] 里可见
  // L1–L2：红魔馆剪影（L2 缩到左边），L2 名字签
  const aM = X(t[0], t[2] + .05);
  if (aM > 0) fade(c, aM, () => {
    const mv = sm(t[1] - .1, t[1] + .5, tau), sx = lerp(1285, 1010, mv), sy = lerp(510, 520, mv), z = lerp(1, .62, mv);
    c.save(); c.translate(sx, sy); c.scale(z, z); s0Mansion(c, tau, tau - t[0] - .25); c.restore();
  });
  const aN = X(t[1], t[2] + .05);
  if (aN > 0) fade(c, aN, () => s0NameCard(c, tau, tau - t[1] - .3));
  // L3–L5：RPG 面板
  const aP = X(t[2], t[5] + .05);
  if (aP > 0) fade(c, aP, () => {
    const u = tau - t[2];
    s0Panel(c, tau, u, { out0: .4, out1: 1.1, sleep0: 6 * CH + .1, sleep1: 12 * CH, hp0: 13 * CH, hp1: 16 * CH + .3, asthma: 15 * CH + .1, flash: t[3] - t[2] + .2 });
    // L4：汗滴 + 问号
    const u4 = tau - t[3];
    if (u4 > 0) {
      const dy = sm(.2, 2.6, u4) * 50, k4 = easeOutBack(clamp(u4 / .35, 0, 1));
      pop(c, 1790, 150, k4, () => { const x = 1790, y = 150 + dy;
        rshape(c, [[x, y - 60], [x + 30, y - 5], [x + 32, y + 22], [x, y + 44], [x - 32, y + 22], [x - 30, y - 5]], { fill: P.sky, stroke: P.ink, w: 4, seed: 501, smooth: true, t: tau });
        rline(c, [[x - 14, y + 6], [x - 12, y + 24]], { w: 5, color: '#ffffff', seed: 502 }); });
      for (let q = 0; q < 3; q++) { const kq = easeOutBack(clamp((u4 - .9 - q * .25) / .3, 0, 1)); if (kq <= 0) continue;
        const qx = 1520 + q * 72, qy = 200 + Math.sin(tau * 4 + q) * 6 - q * 12;
        pop(c, qx, qy, kq, () => zh(c, '？', qx, qy + 20, { size: 64 + q * 8, align: 'center', color: P.red, outline: P.paper, ow: 8 })); }
    }
    // L5：「反面教材」印章
    const u5 = tau - t[4];
    if (u5 > 0) {
      const f = clamp((u5 - .1) / .32, 0, 1), sc = lerp(2.8, 1, easeIn(f)), al = sm(0, .15, f);
      c.save(); c.translate(1300, 500); c.rotate(-.2); c.scale(sc, sc); c.globalAlpha *= al;
      rshape(c, rectPts(-310, -110, 620, 220, 20), { fill: alpha(P.paper, .82), stroke: P.red, w: 12, seed: 511, t: tau });
      rline(c, rectPts(-288, -88, 576, 176, 12), { w: 4, color: P.red, close: true, seed: 512, t: tau });
      zh(c, '反面教材', 0, 44, { size: 128, align: 'center', color: P.red });
      for (let k = 0; k < 26; k++) { c.fillStyle = alpha(P.paper, .75); c.beginPath(); c.arc((hash(k, 5) - .5) * 560, (hash(k, 6) - .5) * 170, 2 + hash(k, 7) * 5, 0, TAU); c.fill(); }
      c.restore();
      const dh = u5 - .42;
      if (dh > 0 && dh < .6) for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, r = 300 + dh * 380;
        c.fillStyle = alpha(P.red, (1 - dh / .6) * .7); c.beginPath(); c.arc(1300 + Math.cos(a) * r, 500 + Math.sin(a) * r * .45, 9 * (1 - dh / .6) + 2, 0, TAU); c.fill(); }
      const kb = easeOutBack(clamp((u5 - 14 * CH) / .4, 0, 1));
      pop(c, 1690, 700, kb, () => {
        rshape(c, starPts(1690, 700, 105, 14, .84, tau * .2), { fill: P.moon, stroke: P.ink, w: 4, seed: 520, t: tau });
        rshape(c, circPts(1690, 700, 76), { fill: P.sun, stroke: P.ink, w: 3, seed: 521, t: tau });
        zh(c, '踩坑', 1690, 690, { size: 40, align: 'center', color: P.ink }); zh(c, '专家', 1690, 736, { size: 40, align: 'center', color: P.ink });
      });
    }
  });
  // L6–L7：五页目录 + 宿舍三图标
  const aT = X(t[5], end + .55) * clear;
  if (aT > 0) fade(c, aT, () => {
    const u = tau - t[5], head = '魔导书 · 目录';
    zh(c, head, 1285, 160, { size: 56, align: 'center', color: P.ink, p: writeP(u, .05, head, .06) });
    rline(c, [[1285 - 200, 182], [1285 + 200, 182]], { w: 4, color: P.moon, p: sm(.4, .8, u), seed: 601, t: tau });
    const idx = [12, 15, 18, 21, 24], up = sm(t[6] - .1, t[6] + .4, tau);
    // 「一共五页」：先弹出五个虚线空位，念到哪页，哪页的书签落进去
    idx.forEach((ci, i) => { const kg = easeOutBack(clamp((u - (7 + i * .5) * CH) / .3, 0, 1)), a = 1 - sm(ci * CH - .1, ci * CH + .2, u), bxp = 855 + i * 215;
      if (kg > 0 && a > 0) pop(c, bxp, 380, kg * lerp(1, .82, up), () => { c.save(); c.globalAlpha *= a;
        rline(c, [[bxp - 88, 210], [bxp + 88, 210], [bxp + 88, 550], [bxp, 506], [bxp - 88, 550]], { w: 4, color: P.faint, close: true, dash: [14, 12], seed: 590 + i, t: tau });
        zh(c, String(i + 1), bxp, 400, { size: 72, align: 'center', color: P.faint }); c.restore(); }); });
    idx.forEach((ci, i) => {
      const k = easeOutBack(clamp((u - ci * CH + .12) / .4, 0, 1)), bxp = 855 + i * 215;
      c.save(); c.translate(bxp, 210); c.scale(lerp(1, .82, up), lerp(1, .82, up)); c.translate(-bxp, -210);
      s0Bookmark(c, tau, i, bxp, 210, k); c.restore();
    });
    // L7：宿舍三图标
    const u7 = tau - t[6];
    if (u7 > 0) {
      const items = [['phone', '熬夜', 4], ['chair', '久坐', 7], ['bag', '外卖', 13]];
      items.forEach(([ic, name, ci], i) => {
        const k = easeOutBack(clamp((u7 - ci * CH + .1) / .4, 0, 1)), xc = 975 + i * 320, yc = 690;
        pop(c, xc, yc, k, () => {
          const ring = u7 > 16 * CH ? .5 + .5 * Math.sin((u7 - 16 * CH) * 8 - i) : 0;
          rshape(c, circPts(xc - 70, yc, 70), { fill: P.paper2, stroke: ring > .6 ? P.moon : P.ink, w: ring > .6 ? 7 : 4, seed: 610 + i, t: tau });
          s0Icon(c, ic, xc - 70, yc + (ic === 'bag' ? 8 : 0), 48, tau, 620 + i * 10);
          zh(c, name, xc + 16, yc + 18, { size: 52, color: P.ink });
        });
      });
      zh(c, '写给大学生', 1285, 815, { size: 40, align: 'center', color: P.purple, p: writeP(u7, 15 * CH, '写给大学生', .08) });
    }
  });
  // 帕秋莉：L1 从脚下魔法阵的光里升起（read → L2 抬头 lecture）
  const cx = STAGE.char.x, cy = STAGE.char.y, ap = sm(t[0] + .15, t[0] + 1.3, tau, easeIO);
  const mc = Math.min(sm(t[0] - .1, t[0] + .5, tau, easeOutBack), 1 - sm(t[1] - .2, t[1] + .5, tau));
  if (mc > 0) { c.save(); c.translate(cx, cy - 6); c.scale(1, .26); magicCircle(c, 0, 0, 280 * mc, tau * 2, { color: P.moon, al: mc, spin: .6 }); c.restore(); }
  const pose = tau < t[1] - .05 ? 'read' : tau < t[2] ? 'lecture' : tau < t[3] ? 'tired' : tau < t[4] ? 'shrug' : tau >= t[5] && tau < t[6] ? 'point' : 'lecture';
  const gest = L && L.talking ? .55 + .45 * Math.sin(tau * 2.4) : .3;
  if (ap > 0) {
    c.save();
    if (ap < 1) { c.beginPath(); c.rect(0, cy + 40 - (STAGE.char.h + 120) * ap, 760, (STAGE.char.h + 120) * ap); c.clip(); }
    stageChar(c, tau, L, { pose, gesture: gest });
    c.restore();
  }
  // 光柱
  const beam = Math.sin(clamp((tau - t[0] + .05) / 1.7, 0, 1) * Math.PI);
  if (beam > 0) { c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(0, cy - 950, 0, cy); g.addColorStop(0, alpha(P.lamp, 0)); g.addColorStop(1, alpha(P.lamp, .5 * beam));
    c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy - 20, 230, 70, 0, 0, Math.PI); c.lineTo(cx - 180, cy - 950); c.lineTo(cx + 180, cy - 950); c.closePath(); c.fill();
    const ey = cy + 40 - (STAGE.char.h + 120) * ap; c.fillStyle = alpha(P.lamp, .6 * beam); c.beginPath(); c.ellipse(cx, ey, 220, 16, 0, 0, TAU); c.fill();
    for (let k = 0; k < 24; k++) { const yy = cy - ((tau * (180 + hash(k, 2) * 200) + hash(k, 3) * 900) % 900), xx = cx + (hash(k, 4) - .5) * 360;
      sparkle(c, xx, yy, 6 + hash(k, 5) * 8, { color: P.lamp, al: beam }); }
    c.restore(); }
  c.restore();
}

scene({ order: 0, key: 'opening', title: '开场', dur: seqEnd(S0LINES) + 1.5, lines: S0LINES,
  fn(c, tau, L) {
    if (tau < S0HEAD.out1) s0Title(c, tau);
    else s0Stage(c, tau, L);
  } });
