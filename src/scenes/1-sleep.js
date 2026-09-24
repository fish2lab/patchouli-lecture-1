'use strict';
// 第 1 段：睡眠（约 64 秒）
// 核心道具是一只 24 小时表盘（上半白天、下半夜里；指针走到哪，太阳/月亮就跟到哪），从 L2 一直用到 L11，逐句加信息：
//   L2 眼睛见光、指针被拨动 → L3 日出、皮质醇、闹钟 → L4 指针走十几个小时、沙漏倒计时 → L6 缩到角上
//   → L7 放大、23–4 点涂红 → L9 角上红区 / L10 下午几点停？/ L11 睡 8 小时的弧。
// 两个满屏镜头：L5 宿舍楼下晒太阳（从表盘早上 7 点圆形转场打开）、L8 熄灯后上下铺刷手机（从表盘红区打开）。
// 顶层名字一律带本段前缀 S1 / s1。
const S1LINES = seq(1.0, [
  '第一页：睡眠。所有调理的地基都在这里。',
  '你身体里有一座生物钟。最能拨动它的，是光。',
  '早上一见光，身体放出皮质醇，把你叫醒；',
  ['同时给十几个小时之后的困意，设好倒计时。', { hold: .5 }],
  ['所以起床后，去户外晒 2 到 10 分钟太阳。', { mood: 'smile', hold: 1.3 }],
  ['隔着玻璃晒，效果要大打折扣。', { hold: .5 }],
  ['反过来，晚上 11 点到凌晨 4 点，别让强光照进眼睛。', { hold: .2 }],
  ['熄灯后躺床上刷手机，等于告诉生物钟：“现在是白天”。', { mood: 'annoyed', hold: 1.1 }],
  ['实在要用，就把屏幕调暗、调暖，灯放低一点。', { hold: .4 }],
  ['咖啡因会堵住“困意信号”的受体。下午几点以后不喝，自己试出来。', { hold: .2 }],
  ['大多数人，每晚需要 6 到 8 小时睡眠。', { hold: .4 }],
  ['考试周通宵？白天学的东西，要靠睡觉才能存进脑子。', { mood: 'smug', hold: .7 }],
]);
const S1DUR = seqEnd(S1LINES) + 1.0;
const S1T = i => S1LINES[i][0], S1E = i => S1LINES[i][1];
const S1POSE = ['lecture', 'point', 'lecture', 'point', 'lecture', 'lecture', 'point', 'lecture', 'lecture', 'point', 'lecture', 'lecture'];
const S1IRIS = .6;                                   // 圆形转场时长
const S1DIAL = { big: [1050, 530, 240], mini: [1748, 205, 76] };   // 表盘：讲台大表盘、角上小表盘 [x, y, r]
const S1HX = 780;                                    // 黑板小标题左沿

// ===================== 小工具 =====================
function s1Beat(tau) { let i = -1; for (let k = 0; k < S1LINES.length; k++) if (tau >= S1LINES[k][0]) i = k; return i; }
// s1V：元素 a 秒起 d 秒弹出（easeOutBack），b 前 0.25 秒干脆消失
function s1V(tau, a, b = 1e9, d = .45) { const u = clamp((tau - a) / d, 0, 1); return { k: tau < a ? 0 : easeOutBack(u), al: 1 - sm(b - .25, b, tau, easeOut) }; }
function s1Pop(c, x, y, v, fn) { if (v.k <= .001 || v.al <= .001) return; pop(c, x, y, v.k, () => fade(c, v.al, fn)); }
// s1Tube：有墨线描边的粗线（手臂、腿、袖子）
function s1Tube(c, pts, col, w, t, seed) { const smooth = pts.length > 2; rline(c, pts, { w: w + 8, color: P.ink, t, seed, smooth }); rline(c, pts, { w, color: col, t, seed, smooth }); }
// 24 小时表盘的角度：12 点在正上方、0 点在正下方，顺时针走
const s1Ang = h => -Math.PI / 2 + (h - 12) / 24 * TAU;
const s1Pt = (x, y, r, h) => [x + Math.cos(s1Ang(h)) * r, y + Math.sin(s1Ang(h)) * r];
function s1ArcPts(x, y, r, h0, h1) { const n = Math.max(2, Math.ceil(Math.abs(h1 - h0) * 4)), o = []; for (let k = 0; k <= n; k++) o.push(s1Pt(x, y, r, lerp(h0, h1, k / n))); return o; }
function s1Sector(x, y, r0, r1, h0, h1) { return r0 > 0 ? [...s1ArcPts(x, y, r1, h0, h1), ...s1ArcPts(x, y, r0, h1, h0)] : [[x, y], ...s1ArcPts(x, y, r1, h0, h1)]; }
const s1Bez = (a, m, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * m[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * m[1] + u * u * b[1]];
// s1Iris：圆形转场。先画 under，再在以 (x, y) 为圆心、随 k 张开的圆里画 over
function s1Iris(c, k, x, y, under, over) {
  under(); if (k <= 0) return;
  const R = easeIn(k) * .15 * 2400 + easeIO(k) * .85 * 2400;
  c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip(); over(); c.restore();
  c.save(); c.strokeStyle = P.moon; c.lineWidth = 10; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke(); c.strokeStyle = P.ink; c.lineWidth = 4; c.beginPath(); c.arc(x, y, R + 8, 0, TAU); c.stroke(); c.restore();
}
// s1Title：黑板左上的小标题，逐字写出、下面拉一道金线
function s1Title(c, tau, text, a, b, o = {}) {
  const al = 1 - sm(b - .25, b, tau, easeOut); if (tau < a || al <= 0) return;
  const { size = 54, color = P.ink } = o, x = S1HX, y = 166;
  fade(c, al, () => { zh(c, text, x, y, { size, p: writeP(tau, a, text, .08), color });
    rline(c, [[x - 10, y + 22], [x + zhWidth(c, text, size) + 18, y + 20]], { w: 4, color: P.moon, p: sm(a + .25, a + .8, tau), seed: 71, t: tau }); });
}
// s1Tag：圆角标签
function s1Tag(c, x, y, text, o = {}) {
  const { size = 44, fill = P.orange, color = P.paper, t = 0, p = 1, seed = 140 } = o, w = zhWidth(c, text, size) + size * 1.1, h = size * 1.55;
  rshape(c, rectPts(x - w / 2, y - h / 2, w, h, h / 2), { fill, w: 4, seed, t });
  zh(c, text, x, y + size * .36, { size, align: 'center', color, p });
}

// ===================== 小人、太阳、表盘 =====================
// s1Head：圆头（头发、刘海、豆豆眼、腮红）。(x, y) 头中心，r 半径。eyes: open|wide|happy|closed，mouth: smile|open|flat|wavy
function s1Head(c, x, y, r, o = {}) {
  const { t = 0, rot = 0, eyes = 'open', mouth = 'smile', hair = P.ink, skin = P.skin, seed = 50, look = 0, blush = .55 } = o, u = r / 58, w = 4.5 / Math.max(u, .75);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(u, u);
  rshape(c, circPts(0, 0, 58, 36), { fill: skin, w, seed, t });
  const hp = []; for (let k = 0; k <= 18; k++) { const a = Math.PI - .34 + k / 18 * (Math.PI + .68); hp.push([Math.cos(a) * 62, Math.sin(a) * 62 - 3]); }
  hp.push([50, -8], [36, -2], [24, -20], [8, -6], [-8, -24], [-24, -6], [-38, -20], [-52, -4]);
  rshape(c, hp, { fill: hair, w, seed: seed + 1, t });
  rline(c, [[-30, -40], [-12, -48]], { w: 3, color: alpha(P.paper, .5), seed: seed + 2, t });
  for (const sx of [-1, 1]) { const X = sx * 21 + look, Y = 12;
    if (eyes === 'open' || eyes === 'wide') { const R = eyes === 'wide' ? 9 : 6.5; c.fillStyle = P.ink; c.beginPath(); c.ellipse(X, Y, R, R * 1.3, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(X + R * .35, Y - R * .5, R * .4, 0, TAU); c.fill(); }
    else if (eyes === 'happy') rline(c, [[X - 9, Y + 4], [X, Y - 5], [X + 9, Y + 4]], { w, seed: seed + 3 + sx, t, smooth: true });
    else rline(c, [[X - 9, Y - 1], [X, Y + 5], [X + 9, Y - 1]], { w, seed: seed + 3 + sx, t, smooth: true });
    if (blush) { c.fillStyle = alpha(P.pink, blush); c.beginPath(); c.ellipse(sx * 37 + look * .6, 29, 10, 6, 0, 0, TAU); c.fill(); } }
  const mx = look * .8;
  if (mouth === 'open') rshape(c, ellPts(mx, 34, 8, 9, 16), { fill: mix(P.red, P.ink, .3), w: w * .8, seed: seed + 6, t });
  else if (mouth === 'flat') rline(c, [[mx - 8, 34], [mx + 8, 34]], { w, seed: seed + 6, t });
  else if (mouth === 'wavy') rline(c, [[mx - 11, 35], [mx - 5, 31], [mx + 1, 37], [mx + 8, 32]], { w, seed: seed + 6, t, smooth: true });
  else rline(c, [[mx - 9, 31], [mx, 37], [mx + 9, 31]], { w, seed: seed + 6, t, smooth: true });
  c.restore();
}
// s1Student：大学生小人。(x, y) 脚底中心，s 缩放（s=1 时身高约 310）。
// o = { t, pose: stand|walk|stretch, k 伸懒腰程度 0..1, ph 走路相位, facing, shirt, pants, eyes, mouth, seed }
function s1Student(c, x, y, s, o = {}) {
  const { t = 0, pose = 'stand', k = 1, ph = 0, facing = 1, shirt = P.blue, pants = P.ink2, seed = 40 } = o;
  const st = pose === 'stretch' ? k : 0, walk = pose === 'walk';
  c.save(); c.translate(x, y); c.scale(s * facing, s);
  if (st > 0) c.rotate(Math.sin(t * 2.4) * .06 * st);
  c.fillStyle = alpha(P.ink, .18); c.beginPath(); c.ellipse(0, 4, 62, 12, 0, 0, TAU); c.fill();
  c.translate(0, walk ? -Math.abs(Math.sin(ph)) * 7 : -st * 6);
  const sw = walk ? Math.sin(ph) * .45 : 0;
  for (const [sx, a] of [[-1, sw], [1, -sw]]) { const hx = sx * 17, hy = -94, fx = hx + Math.sin(a) * 84, fy = hy + Math.cos(a) * 84;
    s1Tube(c, [[hx, hy], [fx, fy]], pants, 17, t, seed + sx);
    rshape(c, ellPts(fx + 7, fy + 3, 17, 9, 16), { fill: P.paper, w: 4, seed: seed + 3 + sx, t }); }
  rshape(c, [[-35, -188], [35, -188], [45, -86], [-45, -86]], { fill: shirt, w: 4.5, seed: seed + 5, t });
  rline(c, [[-14, -186], [0, -170], [14, -186]], { w: 3.5, seed: seed + 6, t });
  s1Head(c, 0, -246, 58, { t, seed: seed + 10, rot: -st * .08, eyes: o.eyes || (st > .3 ? 'happy' : 'open'), mouth: o.mouth || (st > .3 ? 'open' : 'smile'), look: 5 });
  for (const sx of [-1, 1]) { const sh = [sx * 32, -176];
    let el, hd;
    if (walk) { const sn = Math.sin(ph) * sx; el = [sx * 44 + sn * 8, -138]; hd = [sx * 46 + sn * 24, -102]; }
    else { el = [sx * lerp(48, 72, st), lerp(-138, -250, st)]; hd = [sx * lerp(50, 60, st), lerp(-100, -330, st)]; }
    s1Tube(c, [sh, el, hd], shirt, 14, t, seed + 20 + sx);
    rshape(c, circPts(hd[0], hd[1], 11, 14), { fill: P.skin, w: 3.5, seed: seed + 22 + sx, t }); }
  c.restore();
}
// s1Sun：卡通太阳。mood: happy|confused
function s1Sun(c, x, y, r, o = {}) {
  const { t = 0, mood = 'happy', seed = 150, rays = 1 } = o, w = Math.max(2.5, r * .08);
  c.save(); c.translate(x, y);
  if (mood === 'confused') c.rotate(Math.sin(t * 3) * .12);
  const g = c.createRadialGradient(0, 0, r * .6, 0, 0, r * 2.2); g.addColorStop(0, alpha(P.sun, .4)); g.addColorStop(1, alpha(P.sun, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 2.2, 0, TAU); c.fill();
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * .35, l = r * (1.28 + .12 * Math.sin(t * 4 + k * 1.7)), l2 = r * (1.28 + .38 * rays);
    rline(c, [[Math.cos(a) * l, Math.sin(a) * l], [Math.cos(a) * l2, Math.sin(a) * l2]], { w: w * 1.3, color: P.orange, seed: seed + k, t }); }
  rshape(c, circPts(0, 0, r, 32), { fill: P.sun, w, seed, t });
  const e = r * .3, ey = -r * .1;
  if (mood === 'confused') {
    rline(c, [[-e - r * .15, ey - r * .32], [-e + r * .15, ey - r * .22]], { w, seed: seed + 11, t }); rline(c, [[e - r * .15, ey - r * .2], [e + r * .15, ey - r * .34]], { w, seed: seed + 12, t });
    c.fillStyle = P.ink; c.beginPath(); c.arc(-e, ey, r * .09, 0, TAU); c.arc(e, ey, r * .13, 0, TAU); c.fill();
    rline(c, [[-r * .3, r * .38], [-r * .12, r * .3], [r * .05, r * .4], [r * .25, r * .3]], { w, seed: seed + 13, t, smooth: true });
    rshape(c, [[r * .78, -r * .5], [r * .9, -r * .2], [r * .78, -r * .1], [r * .66, -r * .2]], { fill: P.sky, w: w * .7, seed: seed + 14, t, smooth: true });
  } else {
    c.fillStyle = P.ink; c.beginPath(); c.arc(-e, ey, r * .1, 0, TAU); c.arc(e, ey, r * .1, 0, TAU); c.fill();
    rline(c, [[-r * .28, r * .25], [0, r * .45], [r * .28, r * .25]], { w, seed: seed + 13, t, smooth: true });
    c.fillStyle = alpha(P.red, .35); c.beginPath(); c.ellipse(-r * .55, r * .18, r * .14, r * .08, 0, 0, TAU); c.ellipse(r * .55, r * .18, r * .14, r * .08, 0, 0, TAU); c.fill();
  }
  c.restore();
}
// s1Hand：表盘指针指向的钟点（整段共用一只表盘，指针随台词走）
function s1Hand(tau) {
  const T = S1T;
  if (tau < T(2)) return lerp(3, 5.5, easeOutElastic(clamp((tau - T(1) - 2.75) / 1.1, 0, 1)));
  if (tau < T(3)) return lerp(5.5, 7, sm(T(2) + .1, T(2) + 1.3, tau));
  if (tau < T(5)) return lerp(7, 22, sm(T(3) + .5, S1E(3) - .1, tau, easeSine));
  if (tau < T(6)) return 7;
  if (tau < T(8)) return lerp(7, 23, sm(T(6) + .2, T(6) + 1.3, tau)) + 2.5 * sm(T(6) + 1.3, S1E(6) + .5, tau, easeSine);
  if (tau < T(9)) return 23.5 + .4 * sm(T(8), S1E(8), tau);
  if (tau < T(10)) return lerp(9, 15, sm(T(9) + .1, T(9) + .8, tau)) + 2.2 * Math.sin((tau - T(9) - 3) * 2.6) * sm(T(9) + 2.9, T(9) + 3.5, tau);
  return lerp(23, 31, sm(T(10) + .4, S1E(10) - .3, tau, easeSine));
}
// s1Dial：24 小时表盘。o = { t, p 画出进度, hand 钟点, red 23–4 点红区 0..1, arc [h0, h1] 困意倒计时弧, noon 下午高亮 0..1, sleep [h0, h1] 睡眠弧, orb 太阳/月亮跟着指针, confused 太阳困惑 }
function s1Dial(c, x, y, r, o = {}) {
  const { t = 0, p = 1, hand = 3, red = 0, arc = null, noon = 0, sleep = null, orb = 1, confused = false, seed = 60 } = o, big = r > 120, lw = big ? 6 : 4;
  const fa = sm(.35, .85, p);
  c.save(); c.fillStyle = alpha('#000', .18 * fa); c.beginPath(); c.arc(x + 8, y + 10, r, 0, TAU); c.fill(); c.restore();
  if (fa > 0) fade(c, fa, () => {
    rshape(c, s1Sector(x, y, 0, r, 6, 18), { fill: mix(P.sun, P.paper, .5), stroke: false, seed, t, amp: .8 });
    rshape(c, s1Sector(x, y, 0, r, 18, 30), { fill: P.night3, stroke: false, seed: seed + 1, t, amp: .8 });
    for (let k = 0; k < (big ? 9 : 4); k++) { const a = hash(k, 7), h = 18.8 + hash(k, 8) * 10.4; const q = s1Pt(x, y, r * (.35 + a * .5), h); sparkle(c, q[0], q[1], r * (.02 + hash(k, 9) * .02), { al: .5 + .5 * Math.sin(t * 3 + k) }); }
  });
  if (noon > 0) fade(c, noon, () => { const pts = s1Sector(x, y, r * .2, r * .96, 12, 18); rshape(c, pts, { fill: alpha(P.orange, .45), stroke: P.orange, w: lw * .7, seed: seed + 2, t }); });
  if (red > 0) { const pts = s1Sector(x, y, r * .25, r * .96, 23, 23 + 5 * red), path = rshape(c, pts, { fill: alpha(P.red, .55), stroke: P.red, w: lw * .8, seed: seed + 3, t });
    hatch(c, path, [x - r, y - r, 2 * r, 2 * r], { color: P.paper, al: .35, gap: big ? 16 : 9, t, seed: seed + 4 }); }
  if (sleep) { const pts = s1Sector(x, y, r * .25, r * .96, sleep[0], sleep[1]); rshape(c, pts, { fill: alpha(P.blue, .65), stroke: P.sky, w: lw * .7, seed: seed + 5, t }); }
  rline(c, circPts(x, y, r, 72), { w: lw, p: sm(0, .6, p), close: true, seed: seed + 6, t });
  for (let h = 0; h < 24; h++) { if (p < .3 + h / 24 * .5) continue; const major = h % 6 === 0, night = h < 6 || h > 18;
    rline(c, [s1Pt(x, y, r * (major ? .8 : .88), h), s1Pt(x, y, r * .96, h)], { w: major ? lw * .8 : lw * .5, color: night ? P.paper2 : P.ink, seed: seed + 10 + h, t }); }
  if (big && p > .8) fade(c, sm(.8, 1, p), () => {
    zh(c, '12', x, y - r * .6, { size: 34, align: 'center', base: 'middle' });
    zh(c, '0', x, y + r * .62, { size: 34, align: 'center', base: 'middle', color: P.paper });
    zh(c, '6', x - r * .68, y - 26, { size: 34, align: 'center', base: 'middle' });
    zh(c, '18', x + r * .66, y - 26, { size: 34, align: 'center', base: 'middle' });
  });
  if (arc && arc[1] > arc[0] + .05) { const pts = s1ArcPts(x, y, r * 1.1, arc[0], arc[1]); rline(c, pts, { w: lw * 1.7, color: P.purple, seed: seed + 40, t, smooth: true });
    rshape(c, circPts(...pts[0], lw * 1.5, 12), { fill: P.purple, stroke: false }); }
  if (p > .6) { const hp = sm(.6, 1, p), e = s1Pt(x, y, r * .74 * hp, hand), a = s1Ang(hand), hl = r * .12;
    rline(c, [[x, y], e], { w: lw * 1.7, seed: seed + 41, t });
    rshape(c, [[e[0] + Math.cos(a) * hl * .6, e[1] + Math.sin(a) * hl * .6], [e[0] + Math.cos(a + 2.3) * hl * .5, e[1] + Math.sin(a + 2.3) * hl * .5], [e[0] + Math.cos(a - 2.3) * hl * .5, e[1] + Math.sin(a - 2.3) * hl * .5]], { fill: P.ink, w: 2, seed: seed + 42, t });
    rshape(c, circPts(x, y, r * .065, 16), { fill: P.moon, w: lw * .6, seed: seed + 43, t }); }
  if (orb && p >= 1) { const hm = ((hand % 24) + 24) % 24, day = sm(5.3, 6.5, hm) * (1 - sm(17.6, 18.6, hm)), q = s1Pt(x, y, r * (big ? 1.2 : 1.3), hand);
    if (day > .01) fade(c, day * orb, () => s1Sun(c, q[0], q[1], r * .13, { t, seed: seed + 50 }));
    if (day < .99) fade(c, (1 - day) * orb, () => { const g = c.createRadialGradient(q[0], q[1], 2, q[0], q[1], r * .3); g.addColorStop(0, alpha(P.moon, .5)); g.addColorStop(1, alpha(P.moon, 0)); c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], r * .3, 0, TAU); c.fill(); drawMoonIcon(c, q[0], q[1], r * .13, P.moon, -.4); }); }
}

// ===================== 黑板上的道具 =====================
function s1Eye(c, x, y, s, o = {}) {
  const { t = 0, lit = 0, seed = 120 } = o;
  c.save(); c.translate(x, y); c.scale(s, s);
  const up = spline([[-95, 6], [-45, -46], [20, -54], [95, -8]], 6), lo = spline([[95, -8], [35, 40], [-40, 44], [-95, 6]], 6), shape = [...up, ...lo];
  rshape(c, shape, { fill: '#fff', stroke: false, seed, t });
  c.save(); c.clip(polyPath(shape));
  const ix = 14, iy = -4; rshape(c, circPts(ix, iy, 40, 30), { fill: P.teal, w: 4, seed: seed + 1, t });
  c.fillStyle = P.ink; c.beginPath(); c.arc(ix, iy, lerp(21, 10, lit), 0, TAU); c.fill();
  sparkle(c, ix + 15, iy - 15, 9 + 8 * lit, { color: '#fff' });
  c.restore();
  rline(c, up, { w: 7, seed: seed + 2, t }); rline(c, lo, { w: 4, seed: seed + 3, t });
  [[[-62, -32], [-80, -56]], [[-22, -48], [-28, -76]], [[28, -52], [34, -80]], [[68, -34], [84, -56]]].forEach(([a, b], k) => rline(c, [a, b], { w: 5, seed: seed + 5 + k, t }));
  c.restore();
}
// s1Beam：一束光（从 a 到 b 的楔形，w0/w1 两端宽），p 伸出比例，里面有光点往前走
function s1Beam(c, a, b, w0, w1, o = {}) {
  const { color = P.sun, al = .5, p = 1, t = 0, dots = 5, seed = 1 } = o; if (p <= 0) return;
  const e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, we = lerp(w0, w1, p);
  const g = c.createLinearGradient(a[0], a[1], e[0], e[1]); g.addColorStop(0, alpha(color, al)); g.addColorStop(1, alpha(color, al * .5));
  c.save(); c.fillStyle = g; c.fill(polyPath([[a[0] + nx * w0 / 2, a[1] + ny * w0 / 2], [e[0] + nx * we / 2, e[1] + ny * we / 2], [e[0] - nx * we / 2, e[1] - ny * we / 2], [a[0] - nx * w0 / 2, a[1] - ny * w0 / 2]])); c.restore();
  for (let k = 0; k < dots; k++) { const f = (t * .7 + k / dots) % 1; if (f > p) continue; const off = (hash(k, seed) - .5) * lerp(w0, w1, f) * .7;
    sparkle(c, lerp(a[0], b[0], f) + nx * off, lerp(a[1], b[1], f) + ny * off, 6 + 5 * hash(k, seed + 2), { al: Math.sin(f * Math.PI), rot: t }); }
}
// s1Burst：一团光（光源）
function s1Burst(c, x, y, r, t, seed = 160) {
  const g = c.createRadialGradient(x, y, 2, x, y, r * 2.4); g.addColorStop(0, alpha(P.sun, .8)); g.addColorStop(1, alpha(P.sun, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.4, 0, TAU); c.fill();
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t * .5, l = r * (1.1 + .25 * Math.sin(t * 5 + k)); rline(c, [[x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7], [x + Math.cos(a) * l * 1.4, y + Math.sin(a) * l * 1.4]], { w: 5, color: P.orange, seed: seed + k, t }); }
  sparkle(c, x, y, r, { color: '#fff8e0', rot: t * .6 });
}
function s1Alarm(c, x, y, s, o = {}) {
  const { t = 0, shake = 0, seed = 130 } = o, j = shake * Math.sin(twos(t) * 70) * .16;
  c.save(); c.translate(x, y + 60 * s); c.rotate(j); c.translate(0, -60 * s); c.scale(s, s);
  rline(c, [[-42, 52], [-60, 86]], { w: 9, seed, t }); rline(c, [[42, 52], [60, 86]], { w: 9, seed: seed + 1, t });
  for (const sx of [-1, 1]) rshape(c, ellPts(sx * 50, -62, 32, 24, 20, sx * .7), { fill: P.gold, w: 4, seed: seed + 2 + sx, t });
  rline(c, [[0, -76], [0, -92]], { w: 8, seed: seed + 5, t }); rshape(c, rectPts(-14, -104, 28, 14, 5), { fill: P.gold, w: 3.5, seed: seed + 6, t });
  rshape(c, circPts(0, 0, 74, 36), { fill: P.red, w: 5, seed: seed + 7, t });
  rshape(c, circPts(0, 0, 57, 32), { fill: P.paper, w: 4, seed: seed + 8, t });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; rline(c, [[Math.cos(a) * 46, Math.sin(a) * 46], [Math.cos(a) * 52, Math.sin(a) * 52]], { w: 3, seed: seed + 10 + k, t }); }
  const ha = -Math.PI / 2 + 7 / 12 * TAU; rline(c, [[0, 0], [Math.cos(ha) * 28, Math.sin(ha) * 28]], { w: 6, seed: seed + 30, t }); rline(c, [[0, 0], [0, -42]], { w: 4, seed: seed + 31, t });
  c.fillStyle = P.ink; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill();
  c.restore();
  if (shake > .05) for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) { const r0 = (98 + k * 22) * s, a0 = sx > 0 ? -.55 : Math.PI - .55 + 0;
    rline(c, [[x + Math.cos(a0) * r0, y + Math.sin(a0) * r0], [x + Math.cos(a0 + .55) * r0, y + Math.sin(a0 + .55) * r0], [x + Math.cos(a0 + 1.1) * r0, y + Math.sin(a0 + 1.1) * r0]], { w: 5, color: P.orange, smooth: true, seed: seed + 40 + k + sx, t, al: shake * (.5 + .5 * Math.sin(t * 20 + k * 2)) }); }
}
function s1Hourglass(c, x, y, s, u, t, seed = 170) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const glass = [[-58, -104], [-54, -52], [-12, -8], [-12, 8], [-54, 52], [-58, 104], [58, 104], [54, 52], [12, 8], [12, -8], [54, -52], [58, -104]], gp = polyPath(spline(glass, 6, true));
  c.fillStyle = alpha(P.sky, .3); c.fill(gp);
  c.save(); c.clip(gp);
  const top = lerp(-70, -6, u);
  if (u < 1) rshape(c, [[-70, top + 6], [0, top - 4], [70, top + 6], [70, 0], [-70, 0]], { fill: P.gold, stroke: false, seed, t, amp: .6 });
  const mh = lerp(0, 72, u); if (mh > 1) rshape(c, [[-70, 104], [-70, 104 - mh * .35], [0, 104 - mh], [70, 104 - mh * .35], [70, 104]], { fill: P.gold, stroke: false, seed: seed + 1, t, amp: .6 });
  if (u > 0 && u < 1) { c.strokeStyle = P.gold; c.lineWidth = 4; c.setLineDash([8, 6]); c.lineDashOffset = -t * 60; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, 104 - mh); c.stroke(); c.setLineDash([]); }
  c.restore();
  rline(c, spline(glass, 6, true), { w: 4, close: true, seed: seed + 2, t });
  rline(c, [[-36, -80], [-30, -44]], { w: 4, color: alpha('#fff', .8), seed: seed + 3, t });
  for (const sx of [-1, 1]) rline(c, [[sx * 72, -104], [sx * 72, 104]], { w: 9, color: P.shelf, seed: seed + 4 + sx, t });
  rshape(c, rectPts(-88, -128, 176, 26, 9), { fill: P.shelf2, w: 4, seed: seed + 6, t });
  rshape(c, rectPts(-88, 102, 176, 26, 9), { fill: P.shelf2, w: 4, seed: seed + 7, t });
  c.restore();
}
function s1Window(c, x, y, w, h, t, seed = 180) {
  rshape(c, rectPts(x - 16, y - 16, w + 32, h + 32, 8), { fill: P.shelf2, w: 5, seed, t });
  rshape(c, rectPts(x, y, w, h, 4), { fill: mix(P.sky, P.paper, .35), w: 4, seed: seed + 1, t });
  rline(c, [[x + w / 2, y], [x + w / 2, y + h]], { w: 10, color: P.shelf2, seed: seed + 2, t }); rline(c, [[x, y + h / 2], [x + w, y + h / 2]], { w: 10, color: P.shelf2, seed: seed + 3, t });
  for (const [a, b] of [[[x + 14, y + 60], [x + 46, y + 18]], [[x + 16, y + 100], [x + 58, y + 44]], [[x + w / 2 + 14, y + h / 2 + 70], [x + w / 2 + 50, y + h / 2 + 22]]]) rline(c, [a, b], { w: 5, color: alpha('#fff', .85), seed: seed + a[1], t });
}
function s1Phone(c, x, y, s, o = {}) {
  const { t = 0, warm = 0, dim = 0, rot = 0, seed = 190 } = o;
  const scr = mix(mix('#f4fbff', P.orange, warm * .85), P.shelfDark, dim * .55), glow = mix(P.sky, P.orange, warm);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const g = c.createRadialGradient(0, 0, 60, 0, 0, 260); g.addColorStop(0, alpha(glow, lerp(.6, .2, dim))); g.addColorStop(1, alpha(glow, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 260, 0, TAU); c.fill();
  const ra = (1 - dim) * (1 - warm * .5); if (ra > .02) for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .2, l0 = 160 + 8 * Math.sin(t * 6 + k), l1 = l0 + 34 * ra;
    rline(c, [[Math.cos(a) * l0, Math.sin(a) * l0 * 1.05], [Math.cos(a) * l1, Math.sin(a) * l1 * 1.05]], { w: 5, color: P.sky, seed: seed + k, t, al: ra }); }
  rshape(c, rectPts(-70, -134, 140, 268, 24), { fill: P.ink, w: 5, seed, t });
  rshape(c, rectPts(-58, -116, 116, 226, 12), { fill: scr, stroke: false, seed: seed + 1, t, amp: .5 });
  const ink = alpha(mix(P.ink, P.shelf, warm), lerp(.35, .55, dim));
  for (let k = 0; k < 3; k++) { const yy = -96 + k * 70; c.fillStyle = ink; c.fill(polyPath(rectPts(-46, yy, 36, 36, 6))); c.fill(polyPath(rectPts(-4, yy + 4, 50, 8, 4))); c.fill(polyPath(rectPts(-4, yy + 20, 34, 8, 4))); }
  c.fillStyle = P.ink2; c.beginPath(); c.arc(0, -126, 4, 0, TAU); c.fill();
  c.restore();
}
function s1Lamp(c, bx, by, hh, o = {}) {
  const { t = 0, seed = 200 } = o, hx = bx - 96, hy = by - hh + 20, low = clamp((480 - hh) / 290, 0, 1);
  const spread = lerp(150, 40, low), lg = c.createLinearGradient(hx, hy, hx, by);
  lg.addColorStop(0, alpha(mix(P.lamp, P.orange, low * .5), lerp(.55, .75, low))); lg.addColorStop(1, alpha(P.lamp, lerp(.18, .35, low)));
  c.save(); c.fillStyle = lg; c.fill(polyPath([[hx - 40, hy + 26], [hx + 40, hy + 26], [hx + 40 + spread, by], [hx - 40 - spread, by]])); c.restore();
  rline(c, [[bx, by - 10], [bx, by - hh]], { w: 10, color: P.ink2, seed, t });
  rline(c, [[bx, by - hh], [hx + 18, hy - 22]], { w: 8, color: P.ink2, seed: seed + 1, t });
  rshape(c, circPts(bx, by - hh, 11, 12), { fill: P.moon, w: 3.5, seed: seed + 2, t });
  rshape(c, [[hx - 22, hy - 28], [hx + 22, hy - 28], [hx + 48, hy + 28], [hx - 48, hy + 28]], { fill: P.teal, w: 4.5, seed: seed + 3, t });
  rshape(c, ellPts(hx, hy + 30, 30, 8, 16), { fill: mix(P.lamp, '#fff', .5), w: 3, seed: seed + 4, t });
  rshape(c, ellPts(bx, by - 6, 74, 16, 24), { fill: P.ink2, w: 4, seed: seed + 5, t });
}
function s1Bulb(c, x, y, s, t, seed = 210) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(0, -10, 10, 0, -10, 150); g.addColorStop(0, alpha(P.sun, .6)); g.addColorStop(1, alpha(P.sun, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, -10, 150, 0, TAU); c.fill();
  for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .38, l = 92 + 8 * Math.sin(t * 7 + k); rline(c, [[Math.cos(a) * 76, -10 + Math.sin(a) * 76], [Math.cos(a) * l * 1.25, -10 + Math.sin(a) * l * 1.25]], { w: 6, color: P.orange, seed: seed + k, t }); }
  rshape(c, [...ellPts(0, -10, 58, 58, 28).filter(p => p[1] < 20), [30, 38], [-30, 38]], { fill: mix(P.sun, '#fff', .45), w: 5, seed: seed + 10, t, smooth: true });
  rline(c, [[-14, 36], [-10, 6], [0, 18], [10, 6], [14, 36]], { w: 4, color: P.orange, seed: seed + 11, t });
  rshape(c, rectPts(-30, 38, 60, 36, 6), { fill: P.gray, w: 4, seed: seed + 12, t });
  rline(c, [[-30, 50], [30, 50]], { w: 3, seed: seed + 13, t }); rline(c, [[-30, 62], [30, 62]], { w: 3, seed: seed + 14, t });
  c.restore();
}
function s1Cup(c, x, y, s, t, seed = 220) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let k = 0; k < 3; k++) { const ph = (t * .6 + k / 3) % 1, pts = []; for (let j = 0; j <= 8; j++) pts.push([(k - 1) * 30 + Math.sin(j * .9 + t * 3 + k) * 10, -92 - j * 12 - ph * 30]);
    rline(c, pts, { w: 5, color: P.faint, smooth: true, seed: seed + k, t, al: Math.sin(ph * Math.PI) }); }
  rline(c, spline([[62, -46], [100, -40], [98, 10], [60, 22]], 6), { w: 13, color: P.ink, seed: seed + 5, t }); rline(c, spline([[62, -46], [100, -40], [98, 10], [60, 22]], 6), { w: 6, color: P.paper, seed: seed + 5, t });
  rshape(c, [[-66, -78], [66, -78], [58, 68], [-58, 68]], { fill: P.paper, w: 5, seed: seed + 6, t });
  rshape(c, [[-63, -30], [63, -30], [61, 0], [-61, 0]], { fill: P.orange, stroke: false, seed: seed + 7, t });
  rshape(c, ellPts(0, -78, 66, 14, 24), { fill: P.shelf, w: 4, seed: seed + 8, t });
  c.restore();
}
function s1Caffeine(c, x, y, r, t, seed = 230) {
  const pts = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  rline(c, [[x + r * .86, y - r * .5], [x + r * 1.4, y - r * .85]], { w: 4, seed: seed + 1, t }); rline(c, [[x - r * .86, y + r * .5], [x - r * 1.4, y + r * .85]], { w: 4, seed: seed + 2, t });
  rshape(c, pts, { fill: P.shelf2, w: 4, seed, t });
  zh(c, '咖', x, y + 12, { size: 34, align: 'center', color: P.paper });
}
function s1Sleepy(c, x, y, r, t, rot = 0, seed = 240) {
  c.save(); c.translate(x, y); c.rotate(rot);
  rshape(c, circPts(0, 0, r, 24), { fill: P.purple, w: 4, seed, t });
  zh(c, '困', 0, 12, { size: 36, align: 'center', color: P.paper });
  c.restore();
}
function s1Membrane(c, x0, x1, y, t, seed = 250, gap = null) {
  const top = [], bot = []; for (let x = x0; x <= x1; x += 20) { top.push([x, y - 22 + Math.sin(x * .02) * 5]); bot.push([x, y + 22 + Math.sin(x * .02) * 5]); }
  c.save(); c.fillStyle = alpha(P.pink, .3); c.fill(polyPath([...top, ...bot.slice().reverse()])); c.restore();
  for (const q of [...top, ...bot]) if (!gap || Math.abs(q[0] - gap) > 96) rshape(c, circPts(q[0], q[1], 8, 10), { fill: P.pink, w: 2.5, seed: seed + q[0], t });
}
function s1Socket(c, x, y, t, seed = 260) {
  rshape(c, [[x - 88, y + 70], [x - 88, y - 44], [x - 42, y - 50], [x - 40, y - 2], [x + 40, y - 2], [x + 42, y - 50], [x + 88, y - 44], [x + 88, y + 70]], { fill: P.teal, w: 5, seed, t });
  rline(c, [[x - 66, y + 20], [x - 66, y + 52]], { w: 3, color: alpha(P.paper, .6), seed: seed + 1, t });
}
function s1Bed(c, x, y, t, o = {}) {
  const { seed = 270, glow = 0 } = o;
  rshape(c, [[x - 20, y], [x - 20, y - 250], [x + 10, y - 272], [x + 40, y - 250], [x + 40, y]], { fill: P.shelf2, w: 5, seed, t, smooth: false });
  rline(c, [[x + 560, y], [x + 560, y - 96]], { w: 12, color: P.shelf, seed: seed + 1, t });
  rshape(c, rectPts(x + 20, y - 110, 560, 56, 10), { fill: P.shelf2, w: 5, seed: seed + 2, t });
  rshape(c, rectPts(x + 34, y - 142, 536, 36, 12), { fill: P.paper, w: 4, seed: seed + 3, t });
  if (glow > 0) { const g = c.createRadialGradient(x + 110, y - 190, 10, x + 110, y - 190, 150); g.addColorStop(0, alpha(P.moon, .6 * glow)); g.addColorStop(1, alpha(P.moon, 0)); c.fillStyle = g; c.beginPath(); c.arc(x + 110, y - 190, 150, 0, TAU); c.fill(); }
  rshape(c, ellPts(x + 108, y - 150, 74, 24, 24), { fill: '#fff', w: 4, seed: seed + 4, t });
  s1Head(c, x + 110, y - 184, 44, { t, rot: -.18, eyes: 'closed', mouth: 'smile', seed: seed + 10 });
  const bl = spline([[x + 150, y - 112], [x + 146, y - 170], [x + 250, y - 196], [x + 400, y - 186], [x + 520, y - 168], [x + 566, y - 120], [x + 566, y - 108]], 6);
  rshape(c, [...bl, [x + 150, y - 108]], { fill: mix(P.blue, P.paper, .3), w: 5, seed: seed + 5, t });
  for (let k = 0; k < 5; k++) { const bx = x + 220 + k * 70, by = y - 150 + (k % 2) * 16; drawMoonIcon(c, bx, by, 9, alpha(P.moon, .9), .3); }
  for (let k = 0; k < 3; k++) { const ph = (t * .45 + k / 3) % 1; zh(c, 'Z', x + 160 + ph * 90 + k * 6, y - 240 - ph * 120, { size: 30 + ph * 22, color: P.purple, al: Math.sin(ph * Math.PI) }); }
}
function s1Book(c, x, y, s, t, glow = 1, seed = 280) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow > 0) { const g = c.createRadialGradient(0, -30, 10, 0, -30, 190); g.addColorStop(0, alpha(P.moon, .65 * glow)); g.addColorStop(1, alpha(P.moon, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, -30, 190, 0, TAU); c.fill(); }
  rshape(c, [[-106, 0], [106, 0], [100, 16], [-100, 16]], { fill: P.purple, w: 4, seed, t });
  for (const sx of [-1, 1]) { rshape(c, spline([[0, 6], [sx * 50, -2], [sx * 100, 4], [sx * 96, -56], [sx * 50, -66], [0, -52]], 6, true), { fill: P.paper, w: 4, seed: seed + 1 + sx, t, smooth: false });
    for (let k = 0; k < 3; k++) rline(c, [[sx * 20, -38 + k * 13], [sx * (70 - k * 6), -40 + k * 14]], { w: 3, color: P.faint, seed: seed + 5 + k + sx, t }); }
  drawMoonIcon(c, -56, -48, 9, P.moon);
  c.restore();
  for (let k = 0; k < 5; k++) { const a = hash(k, 3) * TAU + t * .8; sparkle(c, x + Math.cos(a) * 90 * s, y - 40 * s + Math.sin(a) * 50 * s, 7 * glow, { al: .5 + .5 * Math.sin(t * 5 + k) }); }
}
function s1Floppy(c, x, y, s, t, seed = 290) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, [[-50, -50], [36, -50], [50, -36], [50, 50], [-50, 50]], { fill: P.blue, w: 5, seed, t });
  rshape(c, rectPts(-28, -50, 52, 32, 3), { fill: P.gray, w: 3.5, seed: seed + 1, t }); rshape(c, rectPts(4, -44, 12, 20, 2), { fill: P.blue, stroke: false, seed: seed + 2, t });
  rshape(c, rectPts(-34, 4, 68, 46, 4), { fill: P.paper, w: 3.5, seed: seed + 3, t });
  c.restore();
}

// ===================== 讲台：黑板内容 =====================
function s1Board(c, tau) {
  const T = S1T, E = S1E, t = tau, END = S1DUR - .55, hand = s1Hand(tau);
  // ---- L1：地基 ----
  s1Title(c, tau, '一切的地基', .5, T(1));
  { const a = T(0), vs = s1V(tau, a + .3, T(1)), glow = win(a + 2.0, T(1) - .2, tau, .4);
    s1Pop(c, 1285, 710, vs, () => {
      if (glow > 0) { c.save(); c.globalAlpha *= glow; c.shadowColor = P.moon; c.shadowBlur = 40; rshape(c, rectPts(810, 640, 950, 130, 24), { fill: false, stroke: P.moon, w: 10, seed: 82, t }); c.restore(); }
      rshape(c, rectPts(820, 650, 930, 116, 22), { fill: P.night3, w: 5, seed: 81, t });
      for (const bx of [990, 1580]) rline(c, [[bx, 656], [bx, 760]], { w: 3, color: alpha(P.paper, .25), seed: bx, t });
      drawMoonIcon(c, 1200, 706, 30, P.moon, -.3);
      zh(c, '睡眠', 1250, 728, { size: 62, color: P.paper });
    });
    const al = 1 - sm(T(1) - .25, T(1), tau);
    [['吃饭', P.orange], ['动力', P.pink], ['专注', P.teal], ['运动', P.green]].forEach(([txt, col], k) => {
      const tk = a + 1.0 + k * .2, u = clamp((tau - tk) / .45, 0, 1); if (u <= 0 || al <= 0) return;
      const dy = (1 - easeOutBack(u)) * -150, cx = 1285 + (k - 1.5) * 222;
      fade(c, sm(0, .25, u) * al, () => { rshape(c, rectPts(cx - 98, 512 + dy, 196, 130, 16), { fill: mix(col, P.paper, .35), w: 5, seed: 90 + k, t }); zh(c, txt, cx, 594 + dy, { size: 48, align: 'center' }); });
    });
    s1Pop(c, 1285, 420, s1V(tau, a + 2.2, T(1)), () => {
      rshape(c, [[890, 506], [1285, 300], [1680, 506]], { fill: mix(P.purple, P.paper, .45), w: 5, seed: 95, t });
      zh(c, '健康的身体', 1285, 474, { size: 46, align: 'center' });
      sparkle(c, 1285, 296, 22, { color: P.moon, rot: t });
    });
  }
  // ---- L2–L4：生物钟 ----
  s1Title(c, tau, '生物钟', T(1) + .1, T(4) + S1IRIS);
  // 表盘（整段共用）
  { const [x, y, r] = s1DialPos(tau), p = sm(T(1) + .1, T(1) + 1.2, tau), al = 1 - sm(T(11) - .25, T(11), tau);
    if (p > 0 && al > 0) fade(c, al, () => s1Dial(c, x, y, r, { t, p, hand,
      arc: tau >= T(3) + .3 && tau < T(5) ? [7, hand] : null,
      red: tau < T(6) ? 0 : sm(T(6) + 1.3, T(6) + 2.3, tau) * (1 - sm(T(9) - .25, T(9), tau)),
      noon: win(T(9) + 2.8, T(10), tau, .3),
      sleep: tau >= T(10) + .4 ? [23, hand] : null }));
    // L4：弧的末端 → 沙漏的虚线
    const lp = sm(E(3) - .5, E(3) + .1, tau) * (1 - sm(T(4) - .2, T(4), tau)); if (lp > 0) { const q = s1Pt(x, y, r * 1.1, 22); rline(c, [q, [1480, 590]], { w: 4, color: P.purple, dash: [6, 12], p: lp, seed: 301, t }); }
  }
  // L2：一束光照进眼睛 → 箭头拨动指针
  { const a = T(1), ve = s1V(tau, a + 1.0, T(2));
    s1Pop(c, 1600, 520, ve, () => {
      s1Beam(c, [1770, 250], [1640, 490], 50, 110, { p: sm(a + 1.3, a + 1.9, tau), t, al: .55 });
      s1Eye(c, 1600, 520, 1, { t, lit: sm(a + 1.8, a + 2.2, tau) });
      s1Burst(c, 1770, 250, 44, t);
      zh(c, '光', 1812, 400, { size: 56, color: P.orange, p: writeP(tau, a + 1.5, '光') });
    });
    fade(c, 1 - sm(T(2) - .25, T(2), tau), () => arrow(c, [1486, 540], [1296, 500], { p: sm(a + 2.2, a + 2.75, tau), bend: -46, t, color: P.orange, w: 7, head: 26 }));
    const kick = win(a + 2.75, a + 3.4, tau, .1); if (kick > 0) fade(c, kick, () => zh(c, '拨！', 1330, 450, { size: 48, color: P.red }));
  }
  // L3：闹钟 + 皮质醇 ↑
  { const a = T(2);
    s1Pop(c, 1600, 330, s1V(tau, a + .3, T(3)), () => s1Alarm(c, 1600, 330, 1, { t, shake: win(a + .6, a + 2.8, tau, .1) }));
    const vt = s1V(tau, a + 1.2, T(4) + S1IRIS), mv = sm(T(3), T(3) + .6, tau), tx = 1600, ty = lerp(580, 250, mv);
    s1Pop(c, tx, ty, vt, () => { c.save(); c.translate(tx, ty); c.scale(1 - .15 * mv, 1 - .15 * mv); c.translate(-tx, -ty); s1Tag(c, tx, ty, '皮质醇 ↑', { t, fill: P.orange, size: 46 }); c.restore(); });
    const sub = 1 - sm(T(3) - .25, T(3), tau); if (tau > a + 1.8 && sub > 0) zh(c, '起床！', tx, ty + 84, { size: 40, align: 'center', color: P.red, al: sub, p: writeP(tau, a + 1.8, '起床！', .1) });
  }
  // L4：沙漏 + 困意倒计时
  { const a = T(3), vh = s1V(tau, a + .3, T(4) + S1IRIS);
    s1Pop(c, 1600, 590, vh, () => { s1Hourglass(c, 1600, 590, .95, sm(a + .5, E(3), tau, u => u), t); zh(c, '困意倒计时', 1600, 790, { size: 44, align: 'center', p: writeP(tau, a + .9, '困意倒计时') }); });
    const zz = sm(E(3) - .4, E(3), tau); if (zz > 0 && tau < T(4) + S1IRIS) { const q = s1Pt(...S1DIAL.big, 22); zh(c, 'z z', q[0] + 60, q[1] + 30 - zz * 16, { size: 38, color: P.purple, al: zz }); }
  }
  // ---- L6：隔着玻璃 ----
  s1Title(c, tau, '隔着玻璃', T(5) + .3, T(6));
  { const a = T(5), b = T(6), al = 1 - sm(b - .25, b, tau);
    if (tau >= a && al > 0) fade(c, al, () => {
      s1Beam(c, [890, 440], [1170, 460], 150, 330, { p: sm(a + .6, a + 1.0, tau), t, al: .55, dots: 6, seed: 5 });
      s1Beam(c, [1330, 470], [1600, 600], 120, 50, { p: sm(a + 1.0, a + 1.4, tau), t, al: .22, dots: 2, seed: 9 });
      s1Pop(c, 890, 440, s1V(tau, a + .3), () => s1Sun(c, 890, 440, 64, { t }));
      s1Pop(c, 1250, 460, s1V(tau, a + .45), () => s1Window(c, 1175, 270, 150, 380, t));
      s1Pop(c, 1650, 800, s1V(tau, a + .6), () => s1Student(c, 1650, 800, .78, { t, eyes: 'open', mouth: 'flat', shirt: P.blue, seed: 44, facing: -1 }));
      s1Pop(c, 1480, 318, s1V(tau, a + 1.5), () => s1Tag(c, 1480, 318, '效果打折', { t, fill: P.red, size: 46 }));
      zh(c, '强度掉一半以上', 1480, 400, { size: 34, align: 'center', color: P.ink2, p: writeP(tau, a + 1.9, '强度掉一半以上') });
    });
  }
  // ---- L7：23:00–4:00 ----
  s1Title(c, tau, '晚上 11 点 → 凌晨 4 点', T(6) + .2, T(7) + S1IRIS);
  { const a = T(6), b = T(7) + S1IRIS;
    s1Pop(c, 1600, 380, s1V(tau, a + 1.6, b), () => { s1Bulb(c, 1600, 380, 1, t); cross(c, 1600, 370, 190, { p: sm(a + 2.7, a + 3.1, tau), t }); });
    const vt = s1V(tau, a + 2.3, b); s1Pop(c, 1600, 660, vt, () => s1Tag(c, 1600, 660, '少见强光', { t, fill: P.red, size: 48 }));
    if (vt.k > 0) fade(c, vt.al, () => { const q = s1Pt(...S1DIAL.big.slice(0, 2), S1DIAL.big[2] * .72, 25.5); rline(c, [q, [1480, 660]], { w: 4, color: P.red, dash: [6, 12], p: sm(a + 2.3, a + 2.8, tau), seed: 302, t }); });
  }
  // ---- L9：暗、暖、低 ----
  s1Title(c, tau, '实在要用', T(8) + .5, T(9));
  { const a = T(8), b = T(9), al = 1 - sm(b - .25, b, tau), ch = sm(a + .9, a + 2.1, tau);
    if (tau >= a && al > 0) fade(c, al, () => {
      s1Pop(c, 1010, 500, s1V(tau, a), () => {
        s1Phone(c, 1010, 500, 1.15, { t, warm: ch, dim: ch });
        rline(c, [[900, 700], [1120, 700]], { w: 8, color: P.faint, seed: 303, t }); rline(c, [[900, 700], [lerp(1110, 950, ch), 700]], { w: 8, color: P.orange, seed: 303, t });
        rshape(c, circPts(lerp(1110, 950, ch), 700, 16, 14), { fill: P.moon, w: 4, seed: 304, t }); s1Sun(c, 862, 700, 14, { t, rays: .6 });
        zh(c, '调暗 · 调暖', 1010, 790, { size: 44, align: 'center', p: writeP(tau, a + 1.0, '调暗 · 调暖') });
      });
      const hh = lerp(470, 200, sm(a + 2.4, a + 3.4, tau));
      s1Pop(c, 1520, 600, s1V(tau, a + 1.8), () => {
        rline(c, [[1320, 812], [1760, 812]], { w: 6, color: P.shelf2, seed: 305, t });
        s1Lamp(c, 1560, 806, hh, { t });
        arrow(c, [1700, 380], [1700, 560], { p: sm(a + 2.4, a + 3.2, tau), t, color: P.orange, w: 6, seed: 306 });
        zh(c, '放低', 1720, 640, { size: 44, align: 'center', p: writeP(tau, a + 3.0, '放低') });
      });
    });
  }
  // ---- L10：咖啡因 ----
  s1Title(c, tau, '咖啡因', T(9) + .2, T(10));
  { const a = T(9), b = T(10), al = 1 - sm(b - .25, b, tau);
    if (tau >= a && al > 0) fade(c, al, () => {
      const mb = s1V(tau, a + .1); s1Pop(c, 1090, 650, mb, () => { s1Membrane(c, 780, 1400, 660, t, 250, 1090); s1Socket(c, 1090, 650, t); zh(c, '受体', 1090, 790, { size: 38, align: 'center', color: P.ink2 }); });
      s1Pop(c, 1620, 640, s1V(tau, a + .3), () => { s1Cup(c, 1620, 640, 1, t); zh(c, '咖啡', 1620, 790, { size: 38, align: 'center', color: P.ink2 }); });
      // 咖啡因从杯里飞出来，先占住槽
      const cf = sm(a + .8, a + 1.7, tau); if (cf > 0) { const q = s1Bez([1620, 540], [1360, 330], [1090, 610], cf); s1Caffeine(c, q[0], q[1], 34, t); }
      // 三颗「困」：第一颗冲向槽，被弹开
      const go = sm(a + 1.8, a + 2.3, tau, easeIn), back = sm(a + 2.3, a + 2.9, tau, easeOut);
      const base = [[880, 420], [960, 330], [830, 540]];
      base.forEach((p0, k) => { const bob = Math.sin(t * 3 + k * 2) * 8, v = s1V(tau, a + .4 + k * .12);
        let q = [p0[0], p0[1] + bob], rot = Math.sin(t * 2 + k) * .15;
        if (k === 0) { const hit = [1090, 560]; q = back > 0 ? [lerp(hit[0], 940, back), lerp(hit[1], 470, back) - Math.sin(back * Math.PI) * 60] : [lerp(p0[0], hit[0], go), lerp(p0[1], hit[1], go) + bob * (1 - go)]; rot += back * 5; }
        s1Pop(c, q[0], q[1], v, () => s1Sleepy(c, q[0], q[1], 34, t, rot, 240 + k)); });
      if (back > .6) zh(c, '？', 990, 420, { size: 44, color: P.purple, al: sm(.6, 1, back) });
      fade(c, win(a + 2.3, b, tau, .15), () => { sparkle(c, 1090, 540, 26 * (1 - back * .5), { color: P.red, rot: t * 4 }); });
      zh(c, '困意信号', 900, 270, { size: 38, align: 'center', color: P.purple, p: writeP(tau, a + .6, '困意信号') });
      s1Pop(c, 1300, 470, s1V(tau, a + 2.35), () => s1Tag(c, 1300, 470, '被占住！', { t, fill: P.red, size: 40 }));
      // 下半句：几点停？（角上表盘同时亮出下午）
      s1Pop(c, 1510, 212, s1V(tau, a + 3.2), () => s1Tag(c, 1510, 212, '几点停？', { t, fill: P.purple, size: 44 }));
      zh(c, '因人而异，自己试', 1510, 300, { size: 34, align: 'center', color: P.ink2, p: writeP(tau, a + 4.2, '因人而异，自己试') });
    });
  }
  // ---- L11：6–8 小时 ----
  s1Title(c, tau, '睡多久', T(10) + .2, T(11));
  { const a = T(10), vb = s1V(tau, a + .1, END);
    s1Pop(c, 1100, 700, vb, () => s1Bed(c, 820, 790, t, { glow: sm(T(11) + 1.6, T(11) + 2.4, tau) * (1 - sm(END - .5, END, tau)) }));
    const vbar = s1V(tau, a + .4, T(11)), px = 1560, y0 = 780, ph = 47, fill = lerp(0, 7.6, sm(a + .6, a + 2.6, tau, easeSine));
    s1Pop(c, px, y0 - 200, vbar, () => {
      rshape(c, rectPts(px - 26, y0 - 8, 52, 8, 4), { fill: P.ink2, stroke: false });
      rshape(c, rectPts(px - 24, y0 - ph * 6, 48, ph * 2, 6), { fill: alpha(P.green, .25), stroke: P.green, w: 3, seed: 311, t });
      if (fill > .05) rshape(c, rectPts(px - 18, y0 - ph * fill, 36, ph * fill, 10), { fill: fill >= 6 ? P.green : P.sky, w: 4, seed: 312, t });
      rline(c, rectPts(px - 24, y0 - ph * 9, 48, ph * 9, 16), { w: 4, close: true, seed: 313, t });
      for (const h of [0, 2, 4, 6, 8]) { rline(c, [[px - 34, y0 - ph * h], [px - 24, y0 - ph * h]], { w: 3, seed: 314 + h, t }); zh(c, String(h), px - 44, y0 - ph * h + 11, { size: 32, align: 'right', color: P.ink2 }); }
      const kb = sm(a + 2.2, a + 2.8, tau); if (kb > 0) { rline(c, [[px + 34, y0 - ph * 8], [px + 50, y0 - ph * 8], [px + 50, y0 - ph * 6], [px + 34, y0 - ph * 6]], { w: 5, color: P.green, p: kb, seed: 320, t });
        zh(c, '6–8', px + 64, y0 - ph * 7 - 4, { size: 50, color: P.green, p: writeP(tau, a + 2.4, '6–8') }); zh(c, '小时', px + 66, y0 - ph * 7 + 44, { size: 40, color: P.ink2, p: writeP(tau, a + 2.7, '小时') }); }
    });
  }
  // ---- L12：睡觉 = 存档 ----
  s1Title(c, tau, '考试周通宵？', T(11) + .1, END, { color: P.red });
  { const a = T(11);
    s1Pop(c, 1500, 690, s1V(tau, a + .6, END), () => { rshape(c, rectPts(1420, 640, 160, 150, 8), { fill: P.shelf2, w: 5, seed: 330, t }); rline(c, [[1432, 712], [1568, 712]], { w: 3, seed: 331, t }); rshape(c, circPts(1500, 690, 7, 10), { fill: P.moon, w: 2.5 }); s1Book(c, 1500, 632, .85, t, sm(a + .9, a + 1.4, tau)); });
    s1Pop(c, 1560, 380, s1V(tau, a + .3, a + 3.0), () => {
      rshape(c, circPts(1560, 330, 72, 30), { fill: P.night3, w: 5, seed: 332, t });
      drawMoonIcon(c, 1560, 330, 34, P.moon, -.3); sparkle(c, 1520, 300, 8, { rot: t }); sparkle(c, 1600, 360, 6, { rot: -t });
      zh(c, '熬通宵', 1560, 456, { size: 44, align: 'center', color: P.ink });
      cross(c, 1560, 330, 130, { p: sm(a + .9, a + 1.3, tau), t }); });
    const words = ['单词', '公式', '定理', '年代', '语法'], hd = [930, 596], src = [1500, 580];
    if (tau < END) words.forEach((wd, k) => { const t0 = a + 1.3 + k * .42, u = clamp((tau - t0) / 1.0, 0, 1); if (u <= 0 || u >= 1) return;
      const q = s1Bez(src, [1230 - k * 20, 420 + k * 12], hd, easeIO(u)); zh(c, wd, q[0], q[1], { size: lerp(42, 22, u * u), align: 'center', color: P.purple, al: Math.min(1, u * 5, (1 - u) * 5), outline: P.paper, ow: 6 }); sparkle(c, q[0] + 30, q[1] - 20, 8, { al: 1 - u, rot: t * 3 }); });
    s1Pop(c, 1230, 340, s1V(tau, a + 3.1, END), () => { s1Floppy(c, 1030, 336, .8, t); zh(c, '睡觉 = 存档', 1100, 362, { size: 64, color: P.ink }); check(c, 1510, 330, 60, { p: sm(a + 3.6, a + 4.0, tau), t }); });
  }
}
// 表盘位置：L2–L4 讲台正中偏左；L6、L9–L11 缩在黑板右上角；L7 又放大回来
function s1DialPos(tau) {
  const T = S1T, B = S1DIAL.big, M = S1DIAL.mini;
  return key(tau, [[T(4) + 1, B], [T(5) - .01, M], [T(6), M], [T(6) + .8, B], [T(7) + 1, B], [T(8) - .01, M]]);
}
// 讲台镜头：讲表盘时轻轻推近
function s1Cam(tau) { return 1 + .035 * win(S1T(1) + .3, S1T(4), tau, .9) + .04 * win(S1T(6) + .6, S1T(7), tau, .9) + .025 * win(S1T(9) + .3, S1T(10), tau, .9); }
const S1CAMF = [1250, 520];
const s1CamPt = (tau, q) => { const z = s1Cam(tau); return [S1CAMF[0] + (q[0] - S1CAMF[0]) * z, S1CAMF[1] + (q[1] - S1CAMF[1]) * z]; };
function s1Lecture(c, tau, L) {
  const z = s1Cam(tau), i = s1Beat(tau), end = tau > S1E(11);
  c.save(); c.translate(S1CAMF[0], S1CAMF[1]); c.scale(z, z); c.translate(-S1CAMF[0], -S1CAMF[1]);
  libraryBg(c, tau);
  board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau });
  s1Board(c, tau);
  const pose = end || i < 0 ? 'lecture' : S1POSE[i];
  stageChar(c, tau, L, { pose, gesture: L.talking ? .55 + .45 * Math.sin(tau * 2.3) ** 2 : .3 });
  c.restore();
  chapterTag(c, tau, '第一页 · 睡眠');
}

// ===================== 满屏 1：宿舍楼下晒太阳（L5） =====================
function s1Cloud(c, x, y, s, t, seed) { const pts = []; for (let k = 0; k < 7; k++) pts.push([x + (k - 3) * 38 * s, y - (k % 2 ? 36 : 22) * s - (k === 3 ? 18 * s : 0)]); rshape(c, [[x - 150 * s, y], ...pts, [x + 150 * s, y]], { fill: alpha('#fff', .92), stroke: alpha(P.ink2, .5), w: 3, smooth: true, seed, t }); }
function s1Tee(c, x, y, s, col, t, seed) { rshape(c, [[x - 20 * s, y], [x - 34 * s, y + 12 * s], [x - 26 * s, y + 22 * s], [x - 18 * s, y + 16 * s], [x - 18 * s, y + 50 * s], [x + 18 * s, y + 50 * s], [x + 18 * s, y + 16 * s], [x + 26 * s, y + 22 * s], [x + 34 * s, y + 12 * s], [x + 20 * s, y]], { fill: col, w: 3, seed, t }); }
function s1Dorm(c, t, open) {
  const x0 = 70, y0 = 150, w = 780, h = 730;
  rshape(c, rectPts(x0, y0, w, h, 4), { fill: mix(P.orange, P.paper, .55), w: 5, seed: 400, t });
  for (let r = 0; r < 12; r++) rline(c, [[x0 + 10, y0 + 30 + r * 58], [x0 + w - 10, y0 + 30 + r * 58]], { w: 2, color: alpha(P.shelf, .15), seed: 401 + r, t });
  rshape(c, rectPts(x0 - 24, y0 - 36, w + 48, 46, 8), { fill: mix(P.red, P.ink, .25), w: 5, seed: 402, t });
  rshape(c, rectPts(x0 + w / 2 - 110, y0 + 26, 220, 62, 10), { fill: P.paper, w: 4, seed: 403, t }); zh(c, '7 号楼', x0 + w / 2, y0 + 72, { size: 42, align: 'center' });
  const cols = [P.pink, P.green, P.blue, P.gold, P.teal];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { const wx = x0 + 44 + k * 148, wy = y0 + 100 + r * 125, sd = 410 + r * 10 + k, hh = hash(sd, 4);
    rshape(c, rectPts(wx, wy, 104, 84, 4), { fill: mix(P.sky, P.paper, .25), w: 4, seed: sd, t });
    rline(c, [[wx + 52, wy], [wx + 52, wy + 84]], { w: 3, seed: sd + 50, t });
    if (hh < .45) rshape(c, [[wx + 4, wy + 4], [wx + 40, wy + 4], [wx + 26, wy + 80], [wx + 4, wy + 80]], { fill: cols[(r + k) % 5], w: 3, seed: sd + 60, t });
    rline(c, [[wx - 8, wy + 96], [wx + 112, wy + 96]], { w: 5, color: P.ink2, seed: sd + 70, t });
    if (hh > .62) { rline(c, [[wx, wy + 6], [wx + 104, wy + 6]], { w: 2, seed: sd + 80, t }); s1Tee(c, wx + 30, wy + 6, .7, cols[(k + 2) % 5], t, sd + 90); s1Tee(c, wx + 76, wy + 6, .6, cols[(k + 4) % 5], t, sd + 95); } }
  // 门
  const dx = 370, dw = 190, dy = 612, dh = 268;
  rshape(c, rectPts(dx - 20, dy - 24, dw + 40, 24, 4), { fill: P.shelf2, w: 4, seed: 470, t });
  rshape(c, rectPts(dx, dy, dw, dh, 2), { fill: P.night3, w: 5, seed: 471, t });
  const lw = dw / 2 * (1 - open * .8);
  rshape(c, rectPts(dx, dy, lw, dh, 2), { fill: mix(P.teal, P.paper, .15), w: 4, seed: 472, t });
  rshape(c, rectPts(dx + dw - lw, dy, lw, dh, 2), { fill: mix(P.teal, P.paper, .15), w: 4, seed: 473, t });
  if (lw > 30) { rshape(c, rectPts(dx + 14, dy + 30, lw - 28, 120, 3), { fill: mix(P.sky, P.paper, .4), w: 3, seed: 474, t }); rshape(c, rectPts(dx + dw - lw + 14, dy + 30, lw - 28, 120, 3), { fill: mix(P.sky, P.paper, .4), w: 3, seed: 475, t }); }
  rshape(c, rectPts(dx - 40, 872, dw + 80, 18, 4), { fill: P.paper2, w: 4, seed: 476, t });
}
function s1Bike(c, x, y, s, t) {
  for (const wx of [-60, 60]) { rline(c, circPts(x + wx * s, y - 38 * s, 38 * s, 24), { w: 5, close: true, seed: 480 + wx, t }); rshape(c, circPts(x + wx * s, y - 38 * s, 5, 8), { fill: P.ink }); }
  rline(c, [[x - 60 * s, y - 38 * s], [x - 10 * s, y - 38 * s], [x + 30 * s, y - 90 * s], [x - 26 * s, y - 90 * s], [x - 60 * s, y - 38 * s]], { w: 6, color: P.red, seed: 485, t });
  rline(c, [[x - 10 * s, y - 38 * s], [x - 26 * s, y - 90 * s], [x - 30 * s, y - 104 * s]], { w: 6, color: P.red, seed: 486, t });
  rline(c, [[x + 60 * s, y - 38 * s], [x + 30 * s, y - 90 * s], [x + 26 * s, y - 116 * s], [x + 48 * s, y - 118 * s]], { w: 6, color: P.ink, seed: 487, t });
  rshape(c, ellPts(x - 32 * s, y - 106 * s, 20 * s, 7 * s, 12), { fill: P.ink, w: 3, seed: 488, t });
}
function s1Tree(c, x, y, s, t) {
  rshape(c, [[x - 20 * s, y], [x - 14 * s, y - 200 * s], [x + 14 * s, y - 200 * s], [x + 22 * s, y]], { fill: P.shelf2, w: 5, seed: 490, t });
  for (const [ox, oy, r, sd] of [[-70, -240, 90, 491], [60, -260, 100, 492], [0, -330, 110, 493], [-20, -220, 80, 494]]) rshape(c, circPts(x + ox * s + Math.sin(t * 1.3 + sd) * 3, y + oy * s, r * s, 20), { fill: mix(P.green, sd % 2 ? P.teal : P.paper, .2), w: 5, seed: sd, t, smooth: true });
}
function s1Yard(c, tau) {
  const t = tau, u = tau - S1T(4), D = S1T(5) - S1T(4) + S1IRIS;
  const z = 1 + .07 * sm(0, D, u, easeSine), F = [1150, 660];
  c.save(); c.translate(F[0], F[1]); c.scale(z, z); c.translate(-F[0], -F[1]);
  const g = c.createLinearGradient(0, 0, 0, 880); g.addColorStop(0, mix(P.sky, P.blue, .3)); g.addColorStop(1, mix(P.sky, P.paper, .65)); c.fillStyle = g; c.fillRect(-200, -200, W + 400, 1100);
  const S = [1250, 200], sg = c.createRadialGradient(S[0], S[1], 40, S[0], S[1], 700); sg.addColorStop(0, alpha(P.sun, .55)); sg.addColorStop(1, alpha(P.sun, 0)); c.fillStyle = sg; c.fillRect(-200, -200, W + 400, H + 400);
  s1Cloud(c, 1000 + t * 12, 150, 1, t, 501); s1Cloud(c, 1650 - t * 8, 380, .8, t, 502); s1Cloud(c, 380 + t * 6, 90, .6, t, 503);
  s1Sun(c, S[0], S[1], 86, { t });
  for (let k = 0; k < 3; k++) { const bx = 900 + ((u * (60 + k * 15) + k * 140) % 700), by = 300 + k * 40 + Math.sin(u * 2 + k) * 10, fl = Math.sin(t * 12 + k) * 8; rline(c, [[bx - 16, by - fl], [bx, by], [bx + 16, by - fl]], { w: 4, seed: 510 + k, t }); }
  for (let k = 0; k < 9; k++) rshape(c, circPts(820 + k * 150, 868, 80 + hash(k, 5) * 30, 18), { fill: mix(P.green, P.teal, .3 + hash(k, 6) * .3), w: 4, seed: 520 + k, t, smooth: true });
  const gg = c.createLinearGradient(0, 880, 0, H); gg.addColorStop(0, mix(P.green, P.paper, .3)); gg.addColorStop(1, mix(P.green, P.teal, .3)); c.fillStyle = gg; c.fillRect(-200, 870, W + 400, 400);
  rshape(c, [[380, 890], [560, 890], [1500, 1100], [700, 1100]], { fill: P.paper2, w: 4, seed: 530, t });
  s1Dorm(c, t, sm(.1, .6, u));
  s1Tree(c, 1740, 900, 1.1, t);
  s1Bike(c, 960, 900, 1, t);
  // 学生：从门里走到阳光下，伸懒腰
  const wk = sm(.45, 2.1, u, u => u), sx = lerp(465, 1200, wk), st = sm(2.2, 2.7, u, easeOutBack);
  const lit = sm(2.1, 2.7, u);
  if (lit > 0) s1Beam(c, S, [sx, 640], 90, 260, { p: 1, al: .35 * lit, t, dots: 4, seed: 13 });
  if (u > .4) fade(c, sm(.4, .55, u), () => s1Student(c, sx, 900, .86, { t, pose: u < 2.15 ? 'walk' : 'stretch', ph: u * 9, k: st, shirt: P.blue, pants: P.ink2 }));
  if (st > .5) for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t * .8, rr = 170 + 20 * Math.sin(t * 4 + k); sparkle(c, sx + Math.cos(a) * rr, 640 + Math.sin(a) * rr * .8, 12 + 6 * Math.sin(t * 6 + k), { color: '#fff4c8', rot: t }); }
  c.restore();
  // 计时牌（不随镜头推）
  const v = s1V(tau, S1T(4) + 1.0);
  s1Pop(c, 1640, 180, v, () => {
    rshape(c, rectPts(1395, 64, 480, 232, 28), { fill: P.paper, stroke: P.ink, w: 5, seed: 540, t });
    zh(c, '起床后 · 户外', 1635, 118, { size: 38, align: 'center', color: P.ink2 });
    rshape(c, circPts(1480, 206, 54, 28), { fill: '#fff', w: 5, seed: 541, t }); rshape(c, rectPts(1468, 138, 24, 16, 4), { fill: P.ink2, w: 3, seed: 542, t });
    const ha = -Math.PI / 2 + (u - 1) * 3.2; rline(c, [[1480, 206], [1480 + Math.cos(ha) * 40, 206 + Math.sin(ha) * 40]], { w: 5, color: P.red, seed: 543, t });
    const fillA = clamp((u - 1) * 3.2 / TAU, 0, 1); if (fillA > 0) { c.save(); c.fillStyle = alpha(P.green, .35); c.beginPath(); c.moveTo(1480, 206); c.arc(1480, 206, 46, -Math.PI / 2, -Math.PI / 2 + fillA * TAU); c.fill(); c.restore(); }
    zh(c, '2–10 分钟', 1552, 232, { size: 60, color: P.ink, p: writeP(tau, S1T(4) + 1.3, '2–10 分钟', .09) });
  });
}

// ===================== 满屏 2：熄灯后的上下铺（L8） =====================
function s1Night(c, tau) {
  const t = tau, u = tau - S1T(7), D = S1T(8) - S1T(7) + S1IRIS, dark = sm(.95, 1.1, u);
  const z = 1 + .1 * sm(.5, D, u, easeSine), F = [720, 690];
  c.save(); c.translate(F[0], F[1]); c.scale(z, z); c.translate(-F[0], -F[1]);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix(P.night3, P.paper2, .35)); g.addColorStop(1, mix(P.night2, P.paper2, .25)); c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  c.fillStyle = mix(P.shelfDark, P.shelf, .5); c.fillRect(-200, 900, W + 400, 400);
  // 窗：夜空和月亮
  rshape(c, rectPts(70, 110, 350, 330, 6), { fill: mix(P.night, P.blue, .25), stroke: P.ink, w: 12, seed: 600, t });
  drawMoonIcon(c, 300, 210, 46, P.moon, -.5);
  for (let k = 0; k < 7; k++) sparkle(c, 100 + hash(k, 1) * 290, 140 + hash(k, 2) * 270, 5 + 4 * hash(k, 3), { al: .5 + .5 * Math.sin(t * 3 + k) });
  rline(c, [[245, 110], [245, 440]], { w: 10, color: P.ink2, seed: 601, t }); rline(c, [[70, 275], [420, 275]], { w: 10, color: P.ink2, seed: 602, t });
  rshape(c, [[40, 90], [120, 90], [100, 300], [118, 470], [40, 470]], { fill: mix(P.purple, P.night, .2), w: 4, seed: 603, t, smooth: true });
  // 上下铺
  const bx0 = 520, bx1 = 1180, grey = mix(P.gray, P.night3, .2);
  for (const x of [bx0, bx1]) rline(c, [[x, 120], [x, 905]], { w: 16, color: grey, seed: 610 + x, t });
  for (let k = 0; k < 7; k++) rline(c, [[bx1, 470 + k * 62], [bx1 + 64, 470 + k * 62]], { w: 8, color: grey, seed: 620 + k, t });
  rline(c, [[bx1 + 64, 420], [bx1 + 64, 905]], { w: 12, color: grey, seed: 630, t });
  rshape(c, rectPts(bx0, 420, bx1 - bx0, 26, 4), { fill: grey, w: 4, seed: 631, t });
  rshape(c, rectPts(bx0 + 8, 390, bx1 - bx0 - 16, 32, 10), { fill: P.paper2, w: 4, seed: 632, t });
  rline(c, [[bx0, 300], [bx0 + 300, 300]], { w: 9, color: grey, seed: 633, t });
  rshape(c, ellPts(600, 380, 60, 20, 20), { fill: P.paper, w: 4, seed: 634, t });
  s1Head(c, 604, 352, 36, { t, rot: -.2, eyes: 'closed', mouth: 'flat', seed: 640 });
  rshape(c, spline([[648, 395], [660, 350], [800, 330], [1000, 340], [1150, 360], [1162, 395]], 6), { fill: mix(P.green, P.night3, .3), w: 5, seed: 635, t });
  rshape(c, rectPts(bx0, 828, bx1 - bx0, 26, 4), { fill: grey, w: 4, seed: 636, t });
  rshape(c, rectPts(bx0 + 8, 798, bx1 - bx0 - 16, 32, 10), { fill: P.paper2, w: 4, seed: 637, t });
  rshape(c, ellPts(615, 792, 72, 22, 20), { fill: P.paper, w: 4, seed: 638, t });
  rshape(c, spline([[665, 800], [676, 752], [800, 730], [980, 740], [1150, 762], [1166, 800]], 6), { fill: mix(P.blue, P.paper, .25), w: 5, seed: 639, t });
  // 书桌：奶茶、书
  rshape(c, rectPts(1400, 690, 520, 26, 4), { fill: P.shelf2, w: 5, seed: 650, t });
  rline(c, [[1440, 716], [1440, 905]], { w: 12, color: P.shelf2, seed: 651, t }); rline(c, [[1880, 716], [1880, 905]], { w: 12, color: P.shelf2, seed: 652, t });
  rshape(c, [[1480, 580], [1570, 580], [1560, 690], [1490, 690]], { fill: mix(P.orange, P.paper, .5), w: 4, seed: 653, t });
  for (let k = 0; k < 6; k++) { c.fillStyle = P.ink; c.beginPath(); c.arc(1500 + (k % 3) * 20 + (k > 2 ? 10 : 0), 670 - (k > 2 ? 14 : 0), 7, 0, TAU); c.fill(); }
  rshape(c, ellPts(1525, 580, 48, 12, 16), { fill: P.paper, w: 4, seed: 654, t }); rline(c, [[1535, 578], [1555, 520]], { w: 9, color: P.pink, seed: 655, t });
  [[P.red, 0], [P.teal, 1], [P.gold, 2]].forEach(([col, k]) => rshape(c, rectPts(1640 + k * 8, 660 - k * 30, 200, 30, 4), { fill: col, w: 4, seed: 656 + k, t }));
  // 熄灯
  if (dark > 0) { c.fillStyle = alpha(mix(P.night, '#000', .4), .62 * dark); c.fillRect(-200, -200, W + 400, H + 400); }
  // 手机的光照亮脸（画在暗层之上）
  const ph = [772, 648], fl = .9 + .1 * Math.sin(t * 7) * Math.sin(t * 3.1);
  if (dark > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(ph[0] - 50, ph[1] + 60, 10, ph[0] - 50, ph[1] + 60, 330); lg.addColorStop(0, alpha(P.blue, .55 * dark * fl)); lg.addColorStop(1, alpha(P.blue, 0)); c.fillStyle = lg; c.beginPath(); c.arc(ph[0] - 50, ph[1] + 60, 330, 0, TAU); c.fill(); c.restore(); }
  const skin = mix(P.skin, P.sky, .55 * dark);
  s1Head(c, 628, 752, 50, { t, rot: -.3, eyes: dark > .5 ? 'wide' : 'open', mouth: dark > .5 ? 'flat' : 'smile', skin, seed: 660, look: 8 });
  const sleeve = mix(P.pink, P.night3, .3 * dark);
  s1Tube(c, [[736, 796], [748, 752], [766, 714]], sleeve, 16, t, 661);
  c.save(); c.translate(ph[0], ph[1]); c.rotate(-.5);
  rshape(c, rectPts(-40, -72, 80, 144, 14), { fill: P.ink2, w: 4, seed: 663, t }); rshape(c, circPts(-18, -50, 8, 10), { fill: P.ink, w: 2.5, seed: 664, t });
  c.save(); c.globalAlpha = dark; c.strokeStyle = alpha(mix(P.sky, '#fff', .6), .9); c.lineWidth = 5; c.stroke(polyPath(rectPts(-44, -76, 88, 152, 16))); c.restore();
  rshape(c, ellPts(-30, 52, 16, 13, 14), { fill: skin, w: 3.5, seed: 662, t }); rshape(c, ellPts(38, 34, 9, 12, 12), { fill: skin, w: 3, seed: 665, t });
  c.restore();
  // 手机里冒出来的点赞、消息
  if (dark > 0) for (let k = 0; k < 5; k++) { const q = (t * .55 + k / 5) % 1, x0 = ph[0] + 20 + (hash(k, 4) - .5) * 90 + Math.sin(q * 6 + k) * 16, y0 = ph[1] - 90 - q * 190, al = Math.sin(q * Math.PI) * dark;
    if (k % 2) rshape(c, heartPts(x0, y0, 14 + 4 * hash(k, 5)), { fill: alpha(P.pink, al), stroke: alpha(P.ink, al), w: 2.5, seed: 680 + k, t });
    else { rshape(c, rectPts(x0 - 20, y0 - 14, 40, 28, 10), { fill: alpha(P.sky, al), stroke: alpha(P.ink, al), w: 2.5, seed: 685 + k, t }); for (let j = -1; j <= 1; j++) { c.fillStyle = alpha(P.ink, al); c.beginPath(); c.arc(x0 + j * 10, y0, 3, 0, TAU); c.fill(); } } }
  // 上铺室友的 Zzz
  for (let k = 0; k < 3; k++) { const q = (t * .45 + k / 3) % 1; zh(c, 'Z', 640 + q * 80 + k * 5, 300 - q * 110, { size: 28 + q * 20, color: P.paper2, al: Math.sin(q * Math.PI) * .9 }); }
  c.restore();
  // 左上「熄灯」签
  fade(c, win(.35, 3.2, u, .25), () => s1Tag(c, 250, 60, '23:30 熄灯', { t, fill: P.ink, size: 38, seed: 670 }));
  // 右上：角上表盘，太阳困惑地冒出来
  const [dx, dy, dr] = [1700, 200, 104];
  s1Pop(c, dx, dy, s1V(tau, S1T(7) + 1.2), () => s1Dial(c, dx, dy, dr, { t, hand: 25.45, red: 1, orb: 0 }));
  const sv = s1V(tau, S1T(7) + 1.8), sp = [1572, 342];
  s1Pop(c, sp[0], sp[1], sv, () => { s1Sun(c, sp[0], sp[1], 46, { t, mood: 'confused' }); zh(c, '?', sp[0] + 56, sp[1] - 34 + Math.sin(t * 4) * 5, { size: 52, color: P.sun, outline: P.ink, ow: 6 }); });
  s1Pop(c, 1440, 420, s1V(tau, S1T(7) + 2.4), () => { bubble(c, 1230, 390, 420, 104, { tail: [sp[0] - 24, sp[1] + 30], t, fill: P.paper }); zh(c, '现在是……白天？', 1440, 458, { size: 42, align: 'center', p: writeP(tau, S1T(7) + 2.5, '现在是……白天？', .1) }); });
}

// ===================== 组装 =====================
scene({ order: 1, key: 'sleep', title: '睡眠', dur: S1DUR, lines: S1LINES,
  fn(c, tau, L) {
    const a5 = S1T(4), b5 = S1T(5), a8 = S1T(7), b8 = S1T(8), D = S1IRIS;
    const lec = () => s1Lecture(c, tau, L), yard = () => s1Yard(c, tau), night = () => s1Night(c, tau);
    if (tau < a5) return lec();
    if (tau < a5 + D) { const q = s1CamPt(tau, s1Pt(...S1DIAL.big.slice(0, 2), S1DIAL.big[2] * 1.3, 7)); return s1Iris(c, (tau - a5) / D, q[0], q[1], lec, yard); }
    if (tau < b5) return yard();
    if (tau < b5 + D) return s1Iris(c, (tau - b5) / D, 1250, 460, yard, lec);
    if (tau < a8) return lec();
    if (tau < a8 + D) { const q = s1CamPt(tau, s1Pt(...S1DIAL.big.slice(0, 2), S1DIAL.big[2] * .6, 25.5)); return s1Iris(c, (tau - a8) / D, q[0], q[1], lec, night); }
    if (tau < b8) return night();
    if (tau < b8 + D) return s1Iris(c, (tau - b8) / D, 1010, 500, night, lec);
    lec();
  } });
