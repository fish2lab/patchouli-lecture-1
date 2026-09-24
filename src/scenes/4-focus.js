'use strict';
// 第 4 段：专注（学习与专注）
// 顶层名字一律带本段前缀 S4 / s4，避免和其他段撞名。
// 画面节拍全部挂在 S4LINES[i][0]（第 i 句开始）上，不写死秒数。
//   L0–L3 讲台：一张神经元网络贯穿始终（布线 → 可改写 → 学会放弃/再试一次 → 白天标记、夜里接线）
//   L4    讲台：90 分钟「学」+ 20 分钟「歇」时间条
//   L5–L6 满屏：生理叹息（一对卡通肺，吸 · 再吸 · 呼——，做一遍半）
//   L7–L9 讲台：视线高度、消息打断与专注模式、每天手机 ≤ 2 小时
const S4LINES = seq(1.0, [
  '第四页：学习与专注。学习，就是大脑在重新布线。',
  '做错题时那股挫败感，恰恰是大脑进入“可改写”状态的信号。',
  ['这时候放弃，大脑学会的就是“放弃”。再坚持一下。', { mood: 'smug' }],
  '白天做好标记，真正的布线，大多在休息和睡眠里完成。',
  '所以学 90 分钟左右，就休息 20 分钟。不是刷手机那种休息。',
  '紧张到脑子一片空白？试试“生理叹息”：',
  ['用鼻子连吸两口气，再用嘴慢慢地、长长地呼出去。', { hold: 1.6 }],
  '视线往上更清醒，往下容易犯困：屏幕别放太低。',
  ['消息一闪，注意力就被偷走了。开专注模式，手机放远点。', { mood: 'annoyed' }],
  '有研究建议：成年人每天刷手机，最好不超过 2 小时。',
]);

// ===================== 神经元网络 =====================
// 节点位置（归一化到网络框里）和基础连线
const S4N = [[.07, .28], [.30, .08], [.53, .33], [.24, .64], [.74, .10], [.93, .42], [.64, .74], [.40, .94], [.90, .88]];
const S4E = [[0, 1], [1, 2], [0, 3], [2, 3], [1, 4], [4, 5], [2, 5], [3, 7], [6, 7], [5, 8], [6, 8], [2, 6]];

// s4Cut：取折线在弧长比例 [a, b] 之间的那一段
function s4Cut(pts, a, b) {
  const tot = pathLen(pts), A = a * tot, B = b * tot, out = []; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i], d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1e-6, s0 = acc, s1 = acc + d;
    if (s1 >= A && s0 <= B) {
      const u0 = clamp((A - s0) / d, 0, 1), u1 = clamp((B - s0) / d, 0, 1);
      if (!out.length) out.push([lerp(p0[0], p1[0], u0), lerp(p0[1], p1[1], u0)]);
      out.push([lerp(p0[0], p1[0], u1), lerp(p0[1], p1[1], u1)]);
    }
    acc = s1;
  }
  return out;
}
// s4At：折线上弧长比例 f 处的点
function s4At(pts, f) { const q = s4Cut(pts, 0, clamp(f, 0, 1)); return q.length ? q.at(-1) : pts[0]; }
// s4Axon：两个神经元之间的连线。o = { p 画出, col, w, cut 断开 0..1, bend, seed, t, pulse 信号光点, al }
function s4Axon(c, A, B, r, o = {}) {
  const { p = 1, col = P.ink2, w = 4, cut = 0, bend = .12, seed = 1, t = 0, pulse = false, al = 1 } = o;
  if (p <= 0 || al <= 0) return;
  const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const a = [A[0] + ux * (r + 4), A[1] + uy * (r + 4)], b = [B[0] - ux * (r + 4), B[1] - uy * (r + 4)];
  const m = [(a[0] + b[0]) / 2 - uy * len * bend, (a[1] + b[1]) / 2 + ux * len * bend];
  const pts = spline([a, m, b], 6);
  fade(c, al, () => {
    if (cut > 0) {
      const h = .5 * (1 - cut);
      if (h > .01) { rline(c, s4Cut(pts, 0, h), { w, color: col, seed, t }); rline(c, s4Cut(pts, 1 - h, 1), { w, color: col, seed: seed + 3, t }); }
      const k = win(0, .55, cut, .12), mp = s4At(pts, .5);
      if (k > 0) { sparkle(c, mp[0], mp[1], 26 * k, { color: P.red, rot: cut * 3 }); sparkle(c, mp[0], mp[1], 13 * k, { color: '#fff' }); }
      return;
    }
    rline(c, pts, { w, color: col, p, seed, t });
    const e = p >= .98 ? b : s4At(pts, p);
    rshape(c, circPts(e[0], e[1], w * .9 + 2, 12), { fill: col, stroke: false, seed, t });
    if (pulse && p >= 1) {
      const f = (t * .55 + hash(seed, 4)) % 1, q = s4At(pts, f), g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 16);
      g.addColorStop(0, alpha(P.moon, .95)); g.addColorStop(1, alpha(P.moon, 0));
      c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], 16, 0, TAU); c.fill();
    }
  });
}
// s4Neuron：一个带触手的神经元（圆胞体 + 5–6 根分叉的树突 + 豆豆眼）。o = { t, seed, glow 金色 0..1, dark 夜里配色 }
function s4Neuron(c, x, y, r, o = {}) {
  const { t = 0, seed = 1, glow = 0, dark = false } = o;
  const n = 5 + (seed % 2), dcol = mix(dark ? '#cbbde6' : P.ink2, P.gold, glow);
  if (glow > 0) { const g = c.createRadialGradient(x, y, r * .5, x, y, r * 3.2); g.addColorStop(0, alpha(P.moon, .55 * glow)); g.addColorStop(1, alpha(P.moon, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3.2, 0, TAU); c.fill(); }
  for (let k = 0; k < n; k++) {
    const ang = k / n * TAU + hash(k, seed) * .8 + Math.sin(t * 1.6 + k + seed) * .08, len = r * (1.4 + hash(k, seed + 3) * .7);
    const P0 = [x + Math.cos(ang) * r * .85, y + Math.sin(ang) * r * .85], P1 = [x + Math.cos(ang + .18) * (r + len * .55), y + Math.sin(ang + .18) * (r + len * .55)], P2 = [x + Math.cos(ang - .08) * (r + len), y + Math.sin(ang - .08) * (r + len)];
    rline(c, [P0, P1, P2], { w: Math.max(2.5, r * .16), color: dcol, smooth: true, seed: seed * 7 + k, t });
    rline(c, [P1, [x + Math.cos(ang + .6) * (r + len * .85), y + Math.sin(ang + .6) * (r + len * .85)]], { w: Math.max(2, r * .11), color: dcol, seed: seed * 7 + k + 40, t });
  }
  rshape(c, circPts(x, y, r, 24), { fill: mix(mix(P.paper, P.pink, .5), P.moon, glow), stroke: P.ink, w: 3.5, seed, t, smooth: true });
  // 豆豆眼：亮起来时眯成 ^ ^
  const ey = y - r * .08, ex = r * .32, er = Math.max(2, r * .11);
  if (glow > .5) { for (const sx of [-1, 1]) rline(c, [[x + sx * ex - er * 1.4, ey + er * .6], [x + sx * ex, ey - er * .8], [x + sx * ex + er * 1.4, ey + er * .6]], { w: 2.5, color: P.ink, seed: seed + sx, t }); }
  else { c.fillStyle = P.ink; for (const sx of [-1, 1]) { c.beginPath(); c.arc(x + sx * ex, ey, er, 0, TAU); c.fill(); } }
  c.fillStyle = alpha(P.ribbonRed, .25); for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(x + sx * r * .55, y + r * .28, r * .16, r * .09, 0, 0, TAU); c.fill(); }
}
// s4Flag：插在神经元上的小旗子（「标记」）
function s4Flag(c, x, y, k, t, seed = 1) {
  pop(c, x, y, easeOutBack(clamp(k, 0, 1)), () => {
    rline(c, [[x, y], [x, y - 64]], { w: 4, color: P.ink, seed, t });
    rshape(c, [[x, y - 64], [x + 40, y - 52 + Math.sin(t * 5 + seed) * 3], [x, y - 38]], { fill: P.red, w: 3, seed: seed + 1, t });
  });
}
// s4Net：画整张网。o = { box:[x,y,w,h], r, app(i) 出现 0..1, glow(i), edges:[{a,b,p,col,w,cut,pulse,al}], dark, flags:[{n,k}], al }
function s4Net(c, tau, o) {
  const { box, r = 22, app = () => 1, glow = () => 0, edges = [], dark = false, flags = [], al = 1 } = o;
  if (al <= 0) return;
  const [bx, by, bw, bh] = box, pos = i => [bx + S4N[i][0] * bw, by + S4N[i][1] * bh];
  fade(c, al, () => {
    for (const [k, e] of edges.entries()) if (app(e.a) > .6 && app(e.b) > .6) s4Axon(c, pos(e.a), pos(e.b), r, { col: dark ? '#b9a8dd' : P.ink2, seed: 60 + k * 5, t: tau, ...e });
    for (let i = 0; i < S4N.length; i++) { const k = clamp(app(i), 0, 1); if (k <= 0) continue; const [x, y] = pos(i);
      pop(c, x, y, easeOutBack(k), () => s4Neuron(c, x, y, r, { t: tau, seed: i + 1, glow: glow(i), dark })); }
    for (const f of flags) { const [x, y] = pos(f.n); s4Flag(c, x + r * .2, y - r * .7, f.k, tau, f.n + 3); }
  });
  return pos;
}

// ===================== 大学生小人 =====================
// s4Student(c, o)：圆头、豆豆眼、有颜色的卫衣。
//   view 'front'（站/走，x,y 为脚底中心，h 为身高）| 'side'（侧面坐着，面朝 facing，x 为臀部、y 为地面，h 为坐高）
//   mood 'normal' | 'happy' | 'sad' | 'panic' | 'calm'（闭眼微笑）| 'sleepy'
//   walk 走路相位（弧度，front）；arms 'down' | 'head'（抱头）| 'wave'；look 低头 0..1（side）；eye 'open'|'sparkle'|'sleepy'（side）
//   返回 { head:[x,y], eye:[x,y] }（逻辑坐标）
function s4Student(c, o = {}) {
  const { x = 0, y = 0, h = 120, t = 0, view = 'front', facing = 1, walk = 0, mood = 'normal', color = P.blue, arms = 'down', look = 0, eye = 'open', al = 1, seed = 41 } = o;
  const s = h / 100, lw = 4 / s, amp = 1.2 / s, T = t, hair = P.shelf;
  const L2W = (lx, ly) => [x + lx * s * facing, y + ly * s];
  c.save(); c.globalAlpha *= al; c.translate(x, y); c.scale(s * facing, s);
  const ln = (pts, w, col, sd, extra = {}) => rline(c, pts, { w, color: col, seed: seed + sd, t: T, amp, ...extra });
  const sh = (pts, fill, sd, extra = {}) => rshape(c, pts, { fill, stroke: P.ink, w: lw, seed: seed + sd, t: T, amp, ...extra });
  let ret;
  if (view === 'front') {
    const sw = Math.sin(walk), lift = Math.abs(Math.cos(walk)) * 2;
    c.translate(0, -lift);
    // 腿和鞋
    for (const k of [-1, 1]) { const fx = k * 8 + k * sw * 7; ln([[k * 8, -22], [fx, -2]], 7.5, P.ink2, 1 + k);
      sh(ellPts(fx + k * 2, -1, 6.5, 3.6, 12), P.ink, 3 + k); }
    // 手臂（先画后面）
    const hand = k => arms === 'head' ? [k * 22, -88] : arms === 'wave' && k > 0 ? [30, -76 + Math.sin(T * 9) * 4] : [k * 25 - k * sw * 3 * k, -28 - k * sw * 4];
    for (const k of [-1, 1]) { const hd = hand(k); ln([[k * 15, -46], [k * 22, -40 + (arms === 'head' ? -20 : 0)], hd], 6.5, mix(color, P.ink, .12), 5 + k, { smooth: true }); sh(circPts(hd[0], hd[1], 4.2, 12), P.skin, 7 + k); }
    // 卫衣
    sh(rectPts(-18, -53, 36, 36, 10), color, 9);
    ln([[-6, -52], [0, -45], [6, -52]], 2.2, P.ink, 10);
    ln([[-3, -44], [-3, -37]], 1.6, P.paper, 11); ln([[3, -44], [3, -37]], 1.6, P.paper, 12);
    // 头
    const hx = 0, hy = -76, r = 25;
    sh(circPts(hx, hy, r, 30), P.skin, 13, { smooth: true });
    const hp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; hp.push([hx + Math.cos(a) * (r + 1.5), hy + Math.sin(a) * (r + 1.5)]); }
    hp.push([hx + 26, hy - 2], [hx + 18, hy - 9], [hx + 12, hy - 4], [hx + 4, hy - 12], [hx - 5, hy - 5], [hx - 13, hy - 11], [hx - 20, hy - 3], [hx - 26, hy - 1]);
    sh(hp, hair, 14);
    // 腮红
    c.fillStyle = alpha(P.pink, .55); for (const k of [-1, 1]) { c.beginPath(); c.ellipse(hx + k * 15, hy + 9, 4.5, 2.6, 0, 0, TAU); c.fill(); }
    // 眼睛
    const ex = 9, ey = hy + 1;
    if (mood === 'calm' || mood === 'sleepy') for (const k of [-1, 1]) ln([[hx + k * ex - 4, ey], [hx + k * ex, ey + 2.5], [hx + k * ex + 4, ey]], 2, P.ink, 20 + k);
    else if (mood === 'happy') for (const k of [-1, 1]) ln([[hx + k * ex - 4, ey + 2], [hx + k * ex, ey - 2.5], [hx + k * ex + 4, ey + 2]], 2, P.ink, 20 + k);
    else if (mood === 'panic') for (const k of [-1, 1]) { sh(circPts(hx + k * ex, ey, 5, 12), '#fff', 22 + k, { w: 1.6 / s * 1.2 }); c.fillStyle = P.ink; c.beginPath(); c.arc(hx + k * ex + Math.sin(T * 20) * 1.2, ey, 1.7, 0, TAU); c.fill(); }
    else { c.fillStyle = P.ink; for (const k of [-1, 1]) { c.beginPath(); c.ellipse(hx + k * ex, ey, 2.4, 3.1, 0, 0, TAU); c.fill(); } }
    if (mood === 'sad' || mood === 'panic') for (const k of [-1, 1]) ln([[hx + k * 13, ey - 8], [hx + k * 5, ey - 6 - (mood === 'panic' ? 2 : -1)]], 1.8, P.ink, 24 + k);
    // 嘴
    const my = hy + 11;
    if (mood === 'happy') sh([[hx - 5, my - 1], [hx + 5, my - 1], [hx + 3, my + 3], [hx - 3, my + 3]], P.ribbonRed, 26, { w: 1.4 / s * 1.2 });
    else if (mood === 'sad') ln([[hx - 4, my + 2], [hx, my], [hx + 4, my + 2]], 1.8, P.ink, 26);
    else if (mood === 'panic') ln([[hx - 5, my + 1], [hx - 2, my - 1], [hx + 1, my + 1], [hx + 4, my - 1]], 1.8, P.ink, 26);
    else ln([[hx - 3.5, my], [hx, my + 2], [hx + 3.5, my]], 1.8, P.ink, 26);
    ret = { head: L2W(hx, hy - lift), eye: L2W(hx, ey - lift) };
  } else {
    // 侧面坐姿（面朝 +x）。臀 (0,-40)，膝 (26,-40)，脚 (27,0)
    const slump = look * 5;
    // 椅子
    ln([[-14, -38], [14, -38]], 4, P.shelf2, 30); ln([[-11, -38], [-13, 0]], 3, P.shelf2, 31); ln([[11, -38], [13, 0]], 3, P.shelf2, 32); ln([[-14, -38], [-17, -72]], 3.5, P.shelf2, 33);
    // 腿
    ln([[2, -42], [26, -42], [27, -3]], 8, P.ink2, 34);
    sh(ellPts(31, -2, 7, 3.4, 12), P.ink, 35);
    // 身体
    const shx = 4 + slump, shy = -70 + look * 2;
    sh([[-8, -36], [10, -36], [shx + 9, shy + 2], [shx - 7, shy - 1]], color, 36, { smooth: false });
    // 手臂
    const hd = o.hand || [30, -58];
    ln([[shx + 2, shy + 4], [shx + 12, -50], hd], 5.5, mix(color, P.ink, .12), 37, { smooth: true }); sh(circPts(hd[0], hd[1], 3.6, 10), P.skin, 38);
    // 头（绕脖子转）
    const nx = shx + 2, ny = shy - 2, rot = look * .6, R = 17;
    const toW = (lx, ly) => [nx + lx * Math.cos(rot) - ly * Math.sin(rot), ny + lx * Math.sin(rot) + ly * Math.cos(rot)];
    c.save(); c.translate(nx, ny); c.rotate(rot);
    const hx = 4, hy = -15;
    sh(circPts(hx, hy, R, 26), P.skin, 39, { smooth: true });
    const hp = []; for (let k = 0; k <= 14; k++) { const a = (95 + k / 14 * 225) * Math.PI / 180; hp.push([hx + Math.cos(a) * (R + 1.5), hy + Math.sin(a) * (R + 1.5)]); }
    hp.push([hx + 8, hy - 7], [hx + 1, hy - 3], [hx - 5, hy + 4], [hx - 6, hy + 12]);
    sh(hp, hair, 40);
    c.fillStyle = alpha(P.pink, .55); c.beginPath(); c.ellipse(hx + 9, hy + 6, 3.5, 2, 0, 0, TAU); c.fill();
    const ex = hx + 10, ey = hy - 1;
    if (eye === 'sleepy') ln([[ex - 3, ey + 1], [ex + 3, ey + 1.5]], 2, P.ink, 41);
    else { c.fillStyle = P.ink; c.beginPath(); c.ellipse(ex, ey, 2.2, 3, 0, 0, TAU); c.fill(); }
    ln([[hx + 16.5, hy + 1], [hx + 18.5, hy + 4], [hx + 16, hy + 5]], 1.6, P.ink, 42);
    ln([[hx + 11, hy + 9], [hx + 14, hy + 9.5]], 1.6, P.ink, 43);
    c.restore();
    const ew = toW(ex, ey), hw = toW(hx, hy);
    if (eye === 'sparkle') sparkle(c, ew[0] + 6, ew[1] - 6, 5 + Math.sin(T * 8) * 1.2, { color: P.moon });
    ret = { head: L2W(hw[0], hw[1]), eye: L2W(ew[0], ew[1]), lap: L2W(20, -46) };
  }
  c.restore();
  return ret;
}
// s4Phone：正面的手机图标。o = { lit 亮屏 0..1, badge, moon 专注模式月牙, t, seed, al, rot }
function s4Phone(c, x, y, w, h, o = {}) {
  const { lit = 0, badge = false, moon = false, t = 0, seed = 71, al = 1, rot = 0 } = o;
  fade(c, al, () => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
    rshape(c, rectPts(0, 0, w, h, w * .18), { fill: P.ink, w: 4, seed, t });
    rshape(c, rectPts(w * .1, h * .1, w * .8, h * .76, w * .08), { fill: mix(P.night3, '#dff1ff', lit), stroke: false, seed: seed + 1, t });
    if (lit > .3) for (let k = 0; k < 3; k++) rline(c, [[w * .22, h * (.28 + k * .16)], [w * (.78 - k * .12), h * (.28 + k * .16)]], { w: 3, color: alpha(P.blue, lit), seed: seed + 2 + k, t });
    if (moon) drawMoonIcon(c, w / 2, h * .47, w * .22, P.moon);
    rline(c, [[w * .4, h * .93], [w * .6, h * .93]], { w: 3, color: P.gray, seed: seed + 6, t });
    if (badge) { rshape(c, circPts(w, 0, 17, 14), { fill: P.red, w: 3, seed: seed + 7, t }); zh(c, '9', w, 1, { size: 26, align: 'center', base: 'middle', color: '#fff' }); }
    c.restore(); });
}
// s4Lungs：一对卡通肺。v 鼓起程度 0..1；o = { t, happy 闭眼笑 0..1 }
function s4Lungs(c, cx, cy, v, o = {}) {
  const { t = 0, happy = 0 } = o, pinkS = mix(P.pink, P.paper, .15), pipe = mix(P.pink, P.paper, .5);
  // 气管和支气管
  rshape(c, rectPts(cx - 18, cy - 290, 36, 190, 16), { fill: pipe, w: 5, seed: 81, t });
  for (let k = 0; k < 6; k++) rline(c, [[cx - 14, cy - 270 + k * 28], [cx + 14, cy - 266 + k * 28]], { w: 3, color: alpha(P.ink, .45), seed: 82 + k, t });
  const bron = side => [[cx, cy - 108], [cx + side * 40, cy - 88], [cx + side * 72, cy - 58]];
  // 两叶肺
  for (const side of [-1, 1]) {
    const sx = 1 + .24 * v, sy = 1 + .15 * v, ax = cx + side * 40, ay = cy - 96;
    const base = [[8, -40], [50, -112], [92, -118], [140, -56], [180, 60], [204, 190], [206, 290], [150, 318], [80, 300], [20, 316], [2, 250], [18, 150], [2, 40]];
    const pts = base.map(([px, py]) => [ax + side * px * sx, ay + py * sy]);
    const path = rshape(c, pts, { fill: pinkS, w: 5, seed: 90 + side, t, smooth: true });
    hatch(c, path, [ax - 260, ay - 60, 520, 520], { gap: 16, al: .12, seed: 93 + side, t, color: P.ribbonRed });
    // 高光
    rshape(c, ellPts(ax + side * 128 * sx, ay + 40 * sy, 20, 44, 16, side * .5), { fill: alpha('#fff', .55), stroke: false, seed: 95, t });
    // 里面的小支气管
    const inner = (px, py) => [ax + side * px * sx, ay + py * sy];
    rline(c, [inner(30, 40), inner(80, 130), inner(120, 250)], { w: 4, color: alpha(P.ribbonRed, .45), seed: 96 + side, t, smooth: true });
    rline(c, [inner(80, 150), inner(140, 170)], { w: 3.5, color: alpha(P.ribbonRed, .45), seed: 98 + side, t });
    rline(c, [inner(55, 110), inner(120, 90)], { w: 3.5, color: alpha(P.ribbonRed, .45), seed: 99 + side, t });
    // 脸
    const e = inner(112, 170), er = 9;
    if (happy > .5) rline(c, [[e[0] - 14, e[1] + 4], [e[0], e[1] - 8], [e[0] + 14, e[1] + 4]], { w: 5, color: P.ink, seed: 100 + side, t });
    else { c.fillStyle = P.ink; c.beginPath(); c.ellipse(e[0], e[1], er, er * 1.25, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(e[0] + 3, e[1] - 4, 3, 0, TAU); c.fill(); }
    c.fillStyle = alpha(P.ribbonRed, .35); c.beginPath(); c.ellipse(e[0] + side * 20, e[1] + 28, 16, 8, 0, 0, TAU); c.fill();
  }
  for (const side of [-1, 1]) rline(c, bron(side), { w: 22, color: pipe, seed: 104 + side, t, smooth: true });
  for (const side of [-1, 1]) rline(c, bron(side).map(([px, py]) => [px, py - 11]), { w: 4, color: P.ink, seed: 106 + side, t, smooth: true, al: .8 });
}
// s4Head：黑板上方的小标题（逐字写出 + 金色下划线），t1 前 0.25 秒淡出
function s4Head(c, tau, text, t0, t1, o = {}) {
  if (tau < t0) return; const a = 1 - sm(t1 - .25, t1, tau); if (a <= 0) return;
  const { x = 1285, y = 180, size = 56, color = P.ink } = o, w = zhWidth(c, text, size);
  fade(c, a, () => { zh(c, text, x, y, { size, align: 'center', color, p: writeP(tau, t0, text, .08) });
    rline(c, [[x - w / 2 - 12, y + 20], [x + w / 2 + 12, y + 17]], { w: 4, color: P.moon, p: sm(t0 + .3, t0 + .9, tau), t: tau, seed: 5 }); });
}
// s4Label：小徽章（圆角底 + 字）
function s4Label(c, text, x, y, o = {}) {
  const { size = 36, fill = P.ink, color = P.paper, t = 0, seed = 120, k = 1 } = o, w = zhWidth(c, text, size) + 36, h = size + 24;
  pop(c, x, y, k, () => { rshape(c, rectPts(x - w / 2, y - h / 2, w, h, h / 2), { fill, w: 3.5, seed, t }); zh(c, text, x, y + size * .36, { size, align: 'center', color }); });
}

scene({ order: 4, key: 'focus', title: '专注', dur: seqEnd(S4LINES) + 1.2, lines: S4LINES,
  fn(c, tau, L) {
    const s = S4LINES.map(l => l[0]), e = S4LINES.map(l => l[1]), D = seqEnd(S4LINES) + 1.2;
    // ---- 满屏镜头（生理叹息）的进出时间 ----
    const fsIn0 = s[5] + 1.9, fsIn1 = fsIn0 + .55, fsOut0 = e[6] - .5, fsOut1 = e[6];
    const irisIn = [1150, 474], irisOut = [1285, 470], slam = s[1] + 1.25;

    // ================= 讲台 =================
    const drawStage = () => {
      // 镜头：L2 推向分岔路，L8 推向手机；错题红叉落下时轻震
      const cam = key(tau, [[0, [1, 1285, 470]], [s[2], [1, 1000, 520]], [s[2] + .7, [1.045, 1000, 520]], [e[2], [1.045, 1000, 520]], [s[3] + .4, [1, 1285, 470]],
        [s[8], [1, 1180, 520]], [s[8] + .6, [1.05, 1180, 520]], [s[8] + 2.3, [1.05, 1180, 520]], [s[8] + 3, [1, 1285, 470]]]);
      const shk = tau > slam ? (1 - sm(slam, slam + .35, tau)) * 9 : 0;
      c.save();
      c.translate(cam[1] + noise1(tau * 40, 3) * shk, cam[2] + noise1(tau * 40, 8) * shk); c.scale(cam[0], cam[0]); c.translate(-cam[1], -cam[2]);
      libraryBg(c, tau);
      board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau });
      boardContent();
      // 帕秋莉的姿势
      let pose = 'lecture', mood, gesture = .5 + .5 * Math.sin(tau * 1.7);
      const inL = i => tau >= s[i] - .1 && tau < (S4LINES[i + 1] ? S4LINES[i + 1][0] - .1 : D - .5);
      if (tau < .4 || tau > D - .5) { pose = 'lecture'; gesture = .5; }
      else if (inL(0)) pose = tau > s[0] + 2.4 ? 'point' : 'lecture';
      else if (inL(1)) pose = tau > s[1] + 2.6 ? 'point' : 'lecture';
      else if (inL(2)) pose = tau < s[2] + 2.7 ? 'shrug' : 'point';
      else if (inL(3)) pose = tau > s[3] + 1.8 ? 'point' : 'lecture';
      else if (inL(4)) pose = tau < s[4] + 3 ? 'point' : 'lecture';
      else if (inL(5)) { pose = 'shrug'; mood = 'surprised'; }
      else if (inL(6)) pose = 'lecture';
      else if (inL(7)) pose = 'point';
      else if (inL(8)) pose = tau < s[8] + 2.5 ? 'shrug' : 'point';
      else if (inL(9)) pose = tau > s[9] + 1.8 && tau < e[9] ? 'point' : 'lecture';
      stageChar(c, tau, L, mood ? { pose, mood, gesture } : { pose, gesture });
      c.restore();
      chapterTag(c, tau, '第四页 · 专注');
    };

    // ================= 黑板内容 =================
    const boardContent = () => {
      // ---------- L0–L3 神经元网络 ----------
      const netEnd = s[4];
      if (tau < netEnd) {
        const netA = 1 - sm(netEnd - .3, netEnd, tau);
        const boxL0 = [820, 250, 960, 540], boxL1 = [1250, 270, 520, 480], boxDay = [800, 290, 420, 390];
        const box = key(tau, [[0, boxL0], [s[1], boxL0], [s[1] + .7, boxL1], [s[3], boxL1], [s[3] + .7, boxDay]]);
        const r = key(tau, [[0, 25], [s[1], 25], [s[1] + .7, 20], [s[3], 20], [s[3] + .7, 16]]);
        const app = i => sm(.45 + i * .1, .9 + i * .1, tau, x => x);
        // 连线：基础线画出来 → 两根断开 → 两根新的接上
        const edges = [];
        S4E.forEach(([a, b], k) => {
          const brk = (a === 2 && b === 5) || (a === 3 && b === 7);
          const p = sm(s[0] + .9 + k * .1, s[0] + 1.4 + k * .1, tau);
          const cut = brk ? sm(s[0] + 2.7, s[0] + 3.4, tau) : 0;
          if (brk && cut >= 1) return;
          edges.push({ a, b, p, cut, pulse: true });
        });
        for (const [k, [a, b]] of [[2, 4], [3, 6]].entries()) {
          const p = sm(s[0] + 3.2 + k * .25, s[0] + 3.9 + k * .25, tau);
          edges.push({ a, b, p, col: mix(P.teal, P.ink2, sm(s[1], s[1] + .8, tau)), w: 5, bend: -.15, pulse: true });
        }
        // L2：「学会了放弃」的灰线 1–3，长出来再倒回
        const g0 = s[2] + 1.1, gUp = sm(g0, g0 + 1, tau), gDown = sm(s[2] + 2.75, s[2] + 3.4, tau), gp = gUp * (1 - gDown);
        if (gp > 0) edges.push({ a: 1, b: 3, p: gp, col: P.gray, w: 13, bend: .08 });
        // L3 夜里：旗子变成结实的连线（在夜里那一份画，见下）
        // 金色：L1 挫败信号后一个个亮起；L2 末尾「再坚持」再闪一次；L3 渐褪
        const glow = i => {
          const a = sm(s[1] + 2.9 + i * .16, s[1] + 3.2 + i * .16, tau) * (1 - sm(s[2] + .3, s[2] + .9, tau));
          const b = win(s[2] + 3.8 + i * .06, s[3] + .2, tau, .25);
          return Math.max(a, b * .9);
        };
        // 白天：小旗子
        const flagN = [0, 2, 6, 8];
        const flags = flagN.map((n, k) => ({ n, k: sm(s[3] + .8 + k * .18, s[3] + 1.2 + k * .18, tau, x => x) }));
        // L3：白天/夜里两块底
        const dayK = sm(s[3], s[3] + .5, tau), nightK = sm(s[3] + 1.6, s[3] + 2.1, tau);
        if (dayK > 0) fade(c, netA, () => {
          c.save(); c.beginPath(); c.rect(740, 110, 535 * dayK, 700); c.clip();
          rshape(c, rectPts(740, 110, 535, 700, 18), { fill: mix(P.paper, P.sky, .5), stroke: P.paperEdge, w: 4, seed: 131, t: tau });
          const sx = 1215, sy = 170, sr = 30 + Math.sin(tau * 3) * 2;
          for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + tau * .4; rline(c, [[sx + Math.cos(a) * (sr + 10), sy + Math.sin(a) * (sr + 10)], [sx + Math.cos(a) * (sr + 24), sy + Math.sin(a) * (sr + 24)]], { w: 4, color: P.sun, seed: 132 + k, t: tau }); }
          rshape(c, circPts(sx, sy, sr, 24), { fill: P.sun, w: 4, seed: 143, t: tau });
          zh(c, '白天：做标记', 790, 188, { size: 48, p: writeP(tau, s[3] + .3, '白天：做标记') });
          c.restore();
        });
        if (nightK > 0) fade(c, netA, () => {
          c.save(); c.beginPath(); c.rect(1295 + 535 * (1 - nightK), 110, 535, 700); c.clip();
          rshape(c, rectPts(1295, 110, 535, 700, 18), { fill: P.night2, stroke: P.night3, w: 4, seed: 151, t: tau });
          for (let k = 0; k < 16; k++) sparkle(c, 1320 + hash(k, 3) * 490, 130 + hash(k, 5) * 560, 4 + 3 * Math.sin(tau * 3 + k), { color: alpha(P.moon, .7) });
          drawMoonIcon(c, 1780, 168, 30, P.moon, -.3);
          zh(c, '睡觉：接线', 1330, 188, { size: 48, color: P.paper, p: writeP(tau, s[3] + 2, '睡觉：接线') });
          // 床和睡着的小人
          const bx = 1420, by = 740;
          rshape(c, rectPts(bx, by, 330, 46, 10), { fill: P.shelf2, w: 4, seed: 152, t: tau });
          rshape(c, rectPts(bx + 10, by - 24, 70, 30, 12), { fill: '#fff', w: 3.5, seed: 153, t: tau });
          rshape(c, rectPts(bx + 80, by - 30, 240, 36, 16), { fill: P.blue, w: 4, seed: 154, t: tau });
          rshape(c, circPts(bx + 58, by - 38, 24, 20), { fill: P.skin, w: 3.5, seed: 155, t: tau });
          rline(c, [[bx + 48, by - 38], [bx + 55, by - 35], [bx + 62, by - 38]], { w: 2.5, color: P.ink, seed: 156, t: tau });
          rshape(c, [[bx + 34, by - 36], [bx + 40, by - 58], [bx + 60, by - 64], [bx + 80, by - 52], [bx + 76, by - 44], [bx + 56, by - 52], [bx + 42, by - 40]], { fill: P.shelf, w: 3, seed: 157, t: tau });
          for (let k = 0; k < 3; k++) { const f = ((tau - s[3]) * .5 + k / 3) % 1; zh(c, 'z', bx + 90 + f * 60 + k * 6, by - 60 - f * 70, { size: 30 + k * 6, color: P.paper, al: Math.sin(f * Math.PI) }); }
          // 夜里那一份网：旗子缩掉，旗子之间长出结实的金线
          const fk = 1 - sm(s[3] + 2.9, s[3] + 3.3, tau);
          const nEdges = S4E.filter(([a, b]) => !((a === 2 && b === 5) || (a === 3 && b === 7))).map(([a, b]) => ({ a, b }));
          [[0, 2], [2, 6], [6, 8]].forEach(([a, b], k) => nEdges.push({ a, b, p: sm(s[3] + 3.0 + k * .25, s[3] + 3.6 + k * .25, tau), col: P.moon, w: 11, bend: .05, pulse: true }));
          s4Net(c, tau, { box: [1355, 270, 420, 330], r: 16, dark: true, app: () => sm(s[3] + 1.9, s[3] + 2.3, tau, x => x), edges: nEdges,
            flags: flagN.map(n => ({ n, k: fk })), glow: i => flagN.includes(i) ? sm(s[3] + 3.4, s[3] + 3.9, tau) * .8 : 0 });
          c.restore();
        });
        const pos = s4Net(c, tau, { box, r, app, glow, edges, flags: tau > s[3] ? flags : [], al: netA });
        // L0 标题
        s4Head(c, tau, '学习 = 重新布线', s[0] + 1.6, s[1]);
        // L1：错题纸、红叉、挫败乱线、信号箭头、「可改写」
        const paperA = sm(s[1] + .1, s[1] + .55, tau, easeOutBack), paperOut = 1 - sm(s[2] - .1, s[2] + .2, tau);
        if (paperA > 0 && paperOut > 0) fade(c, paperOut, () => pop(c, 930, 520, paperA, () => {
          c.save(); c.translate(930, 520); c.rotate(-.05); c.translate(-930, -520);
          rshape(c, rectPts(770, 300, 330, 420, 10), { fill: '#fffaf0', w: 4, seed: 161, t: tau });
          for (let k = 0; k < 7; k++) rline(c, [[790, 390 + k * 46], [1080, 390 + k * 46]], { w: 2, color: alpha(P.blue, .3), seed: 162 + k, t: tau });
          zh(c, '错题本', 935, 360, { size: 40, align: 'center', color: P.ink2 });
          zh(c, '3x + 5 = 20', 800, 440, { size: 40, color: P.ink });
          zh(c, 'x = 3', 830, 530, { size: 48, color: P.ink, p: writeP(tau, s[1] + .5, 'x = 3', .09) });
          cross(c, 885, 515, 100, { p: sm(slam - .2, slam, tau), t: tau, w: 14 });
          c.restore();
          // 挫败：一团乱线 + 小闪电
          const sk = sm(s[1] + 1.5, s[1] + 2.3, tau);
          if (sk > 0) { const rr = rng(7), pts = []; for (let k = 0; k < 14; k++) { const a = k * 1.9, rad = 22 + rr() * 26; pts.push([1010 + Math.cos(a) * rad * 1.3, 262 + Math.sin(a) * rad * .8]); }
            rline(c, pts, { w: 4, color: P.ink, p: sk, smooth: true, t: tau, seed: 170 });
            if (sk >= 1) { rline(c, [[1080, 230], [1066, 262], [1084, 262], [1068, 296]], { w: 4, color: P.sun, t: tau, seed: 171 }); zh(c, '挫败！', 890, 270, { size: 36, color: P.red, align: 'center', al: sm(s[1] + 2, s[1] + 2.3, tau) }); }
          }
        }));
        const arP = sm(s[1] + 2.5, s[1] + 3, tau) * (1 - sm(s[2] - .1, s[2] + .2, tau));
        if (arP > 0) arrow(c, [1105, 470], [1235, 450], { p: arP >= 1 ? 1 : arP, color: P.moon, w: 7, bend: -25, t: tau, seed: 175 });
        const kk = sm(s[1] + 3.5, s[1] + 3.9, tau, easeOutBack) * (1 - sm(s[2] + .2, s[2] + .5, tau));
        if (kk > 0) { s4Label(c, '可改写', 1510, 222, { size: 44, fill: P.moon, color: P.ink, t: tau, k: kk });
          sparkle(c, 1400, 200, 12 + 4 * Math.sin(tau * 7), { color: P.moon }); sparkle(c, 1625, 246, 10 + 4 * Math.sin(tau * 6 + 1), { color: P.moon }); }
        // L2：分岔路 + 小人走左边、倒回、走右边
        const roadA = sm(s[2], s[2] + .4, tau) * (1 - sm(s[3] - .1, s[3] + .2, tau));
        if (roadA > 0) fade(c, roadA, () => {
          const fx = 960, fy = 560, Lp = [820, 330], Rp = [1110, 330];
          for (const q of [[[fx, 810], [fx, fy]], [[fx, fy], [900, 440], Lp], [[fx, fy], [1030, 440], Rp]]) rline(c, q, { w: 64, color: P.paper2, smooth: true, seed: 180, amp: .5 });
          for (const sd of [-1, 1]) rline(c, [[fx + sd * 32, 810], [fx + sd * 32, fy + 20]], { w: 3.5, color: P.paperEdge, t: tau, seed: 181 + sd });
          // 路牌
          const sign = (x, y, text, fill, sd) => { rline(c, [[x, y + 70], [x, y]], { w: 5, color: P.shelf2, t: tau, seed: sd });
            const w = zhWidth(c, text, 40) + 36; rshape(c, [[x - w / 2, y - 56], [x + w / 2, y - 56], [x + w / 2 + 16, y - 28], [x + w / 2, y], [x - w / 2, y]], { fill, w: 4, t: tau, seed: sd + 1 });
            zh(c, text, x, y - 14, { size: 40, align: 'center', color: '#fff' }); };
          sign(820, 300, '放弃', P.gray, 183); sign(1110, 300, '再试一次', P.green, 186);
          // 小人路线：上到路口 → 往左 → 倒带回路口 → 往右
          const t0 = s[2] + .3, route = key(tau, [[t0, [fx, 800]], [t0 + .9, [fx, fy + 10]], [t0 + 1.9, [870, 420]], [s[2] + 2.75, [870, 420]], [s[2] + 3.4, [fx, fy + 10]], [s[2] + 4.3, [1060, 420]]], x => x);
          const moving = (tau > t0 && tau < t0 + 1.9) || (tau > s[2] + 3.4 && tau < s[2] + 4.3), rew = tau > s[2] + 2.75 && tau < s[2] + 3.4;
          const facing = tau > s[2] + 3.4 ? 1 : tau > t0 + .9 ? -1 : 1;
          if (rew) { for (let k = 1; k <= 3; k++) { const q = key(tau + k * .12, [[s[2] + 2.75, [870, 420]], [s[2] + 3.4, [fx, fy + 10]]], x => x); s4Student(c, { x: q[0], y: q[1], h: 120, t: tau, al: .18, color: P.orange, facing }); }
            const rx = route[0] + 70, ry = route[1] - 150; for (const d of [0, 26]) rshape(c, [[rx + d, ry - 18], [rx + d, ry + 18], [rx + d - 26, ry]], { fill: P.ink, w: 3, t: tau, seed: 190 + d }); }
          s4Student(c, { x: route[0], y: route[1], h: 120, t: tau, walk: moving ? tau * 11 : 0, facing, color: P.orange, mood: tau > s[2] + 4.2 ? 'happy' : tau > s[2] + 1.6 ? 'sad' : 'normal' });
          if (tau > s[2] + 4.2) check(c, 1190, 250, 70, { t: tau, p: sm(s[2] + 4.2, s[2] + 4.5, tau) });
        });
        const glK = sm(s[2] + 1.9, s[2] + 2.2, tau, easeOutBack) * (1 - sm(s[2] + 2.8, s[2] + 3.1, tau));
        if (glK > 0 && pos) { const a = pos(1), b = pos(3), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          fade(c, glK, () => rline(c, [[mx - 8, my], [mx - 60, 200]], { w: 3, color: P.gray, dash: [8, 8], t: tau, seed: 195 }));
          s4Label(c, '学会了放弃', mx - 60, 180, { size: 38, fill: P.gray, color: '#fff', t: tau, k: glK }); }
      }

      // ---------- L4 90 + 20 ----------
      const b4 = 1 - sm(s[5] - .15, s[5] + .15, tau);
      if (tau > s[4] - .1 && b4 > 0) fade(c, b4, () => {
        s4Head(c, tau, '学 90 分钟，歇 20 分钟', s[4] + .2, s[5] + .2);
        const x0 = 800, xm = 1600, x1 = 1780, y0 = 290, bh = 92;
        const bp = sm(s[4] + .4, s[4] + 1.7, tau, easeOut), gp = sm(s[4] + 1.9, s[4] + 2.6, tau, easeOut);
        if (bp > 0) { rshape(c, rectPts(x0, y0, (xm - x0) * bp, bh, 14), { fill: P.blue, w: 4.5, t: tau, seed: 201 });
          for (let k = 1; k < 9; k++) if (x0 + k * 89 < x0 + (xm - x0) * bp - 10) rline(c, [[x0 + k * 89, y0 + bh - 18], [x0 + k * 89, y0 + bh - 4]], { w: 3, color: alpha('#fff', .6), t: tau, seed: 202 + k });
          zh(c, '学', (x0 + xm) / 2, y0 + 66, { size: 64, align: 'center', color: '#fff', al: sm(s[4] + .9, s[4] + 1.2, tau) });
          zh(c, '90 分钟', (x0 + xm) / 2, y0 + bh + 60, { size: 44, align: 'center', p: writeP(tau, s[4] + 1.1, '90 分钟') });
          // 书本小图标跟着蓝条往前走
          const hx = x0 + (xm - x0) * bp; if (bp < 1) rshape(c, rectPts(hx - 20, y0 - 50, 40, 30, 4), { fill: P.ribbonRed, w: 3, t: tau, seed: 212 }); }
        if (gp > 0) { rshape(c, rectPts(xm + 6, y0, (x1 - xm - 6) * gp, bh, 14), { fill: P.green, w: 4.5, t: tau, seed: 215 });
          zh(c, '歇', (xm + x1) / 2 + 3, y0 + 66, { size: 60, align: 'center', color: '#fff', al: sm(s[4] + 2.3, s[4] + 2.6, tau) });
          zh(c, '20 分钟', (xm + x1) / 2, y0 + bh + 60, { size: 44, align: 'center', color: P.green, p: writeP(tau, s[4] + 2.4, '20 分钟') });
        }
        // 歇的时候：闭眼 ✓ 散步 ✓ 手机 ✗
        const ic = [[1000, s[4] + 3.0], [1300, s[4] + 3.4], [1600, s[4] + 3.9]];
        zh(c, '怎么歇？', 800, 600, { size: 44, color: P.green, p: writeP(tau, s[4] + 2.9, '怎么歇？') });
        ic.forEach(([x, t0], k) => {
          const pk = sm(t0, t0 + .4, tau, easeOutBack); if (pk <= 0) return;
          pop(c, x, 700, pk, () => {
            if (k === 0) s4Student(c, { x, y: 770, h: 170, t: tau, mood: 'calm', color: P.teal });
            if (k === 1) { s4Student(c, { x: x + Math.sin(tau * 1.2) * 12, y: 770, h: 170, t: tau, walk: tau * 8, color: P.orange, mood: 'happy' });
              for (let j = 0; j < 3; j++) rline(c, [[x - 80, 680 + j * 22], [x - 55 - j * 6, 680 + j * 22]], { w: 3, color: P.faint, t: tau, seed: 230 + j }); }
            if (k === 2) s4Phone(c, x - 38, 610, 76, 140, { lit: .5 + .5 * (Math.floor(tau * 3) % 2), badge: true, t: tau });
            zh(c, ['闭眼休息', '散散步', '刷手机'][k], x, 818, { size: 38, align: 'center', color: k === 2 ? P.red : P.ink });
          });
          const mk = sm(t0 + .35, t0 + .7, tau);
          if (k < 2) check(c, x + 95, 590, 64, { t: tau, p: mk }); else cross(c, x, 680, 150, { t: tau, p: sm(s[4] + 4.5, s[4] + 4.9, tau), w: 14 });
        });
      });

      // ---------- L5 讲台部分：紧张到一片空白 ----------
      if (tau > s[5] - .05 && tau < fsIn1 + .1) {
        const k = sm(s[5] + .1, s[5] + .5, tau, easeOutBack);
        pop(c, 1150, 800, k, () => {
          const who = s4Student(c, { x: 1150, y: 830, h: 440, t: tau, mood: 'panic', arms: 'head', color: P.orange });
          // 桌子和考卷
          rshape(c, rectPts(930, 680, 460, 40, 8), { fill: P.shelf2, w: 4, t: tau, seed: 251 });
          for (const lx of [960, 1360]) rline(c, [[lx, 720], [lx, 820]], { w: 6, color: P.shelf, t: tau, seed: 252 + lx });
          rshape(c, [[1010, 682], [1200, 676], [1210, 664], [1020, 668]], { fill: '#fff', w: 3, t: tau, seed: 255 });
          // 汗滴
          for (let j = 0; j < 3; j++) { const f = ((tau * 1.4 + j / 3) % 1), a = -.6 + j * .6; const hx = who.head[0] + Math.cos(a - Math.PI / 2) * (130 + f * 50), hy = who.head[1] + Math.sin(a - Math.PI / 2) * (130 + f * 40);
            rshape(c, [[hx, hy - 16], [hx + 9, hy + 2], [hx, hy + 10], [hx - 9, hy + 2]], { fill: P.sky, w: 3, t: tau, seed: 256 + j, al: 1 - f }); }
        });
        // 空白的想法气泡
        const bk = sm(s[5] + .5, s[5] + .9, tau, easeOutBack);
        pop(c, 1520, 300, bk, () => {
          for (const [x, y, r] of [[1340, 420, 12], [1380, 380, 20]]) rshape(c, circPts(x, y, r, 16), { fill: '#fff', w: 4, t: tau, seed: 260 + r });
          rshape(c, ellPts(1580, 260, 220, 120, 40), { fill: '#fff', w: 4.5, t: tau, seed: 263, smooth: true });
          zh(c, '……', 1580, 280, { size: 72, align: 'center', color: P.faint, p: sm(s[5] + .9, s[5] + 1.5, tau) });
          zh(c, '一片空白', 1580, 350, { size: 34, align: 'center', color: P.gray, al: sm(s[5] + 1.2, s[5] + 1.5, tau) });
        });
      }

      // ---------- L7 视线高度 ----------
      const L7a = tau > s[7] - .1 && tau < s[9] + .2;
      if (L7a) {
        // 左：抬头看齐眼的屏幕（L8 继续用这一套）
        const lk = sm(s[7] + .05, s[7] + .45, tau, easeOutBack), lOut = 1 - sm(s[9] - .15, s[9] + .15, tau);
        // L8：消息拽走视线 → 专注模式 → 手机滑走
        const n0 = s[8], pull = sm(n0 + 1.0, n0 + 1.4, tau) * (1 - sm(n0 + 3.0, n0 + 3.4, tau));
        const focusOn = sm(n0 + 2.6, n0 + 3.0, tau);
        fade(c, lOut, () => pop(c, 1000, 780, lk, () => {
          rline(c, [[760, 782], [1520, 782]], { w: 3, color: P.faint, t: tau, seed: 300 });
          const deskR = key(tau, [[n0, 1210], [n0 + .5, 1470]]);
          rshape(c, rectPts(960, 592, deskR - 960, 22, 6), { fill: P.shelf2, w: 4, t: tau, seed: 301 });
          rline(c, [[980, 614], [980, 780]], { w: 6, color: P.shelf, t: tau, seed: 302 }); rline(c, [[deskR - 20, 614], [deskR - 20, 780]], { w: 6, color: P.shelf, t: tau, seed: 303 });
          // 显示器（侧面）+ 屏幕光
          rline(c, [[1150, 592], [1150, 540]], { w: 8, color: P.ink2, t: tau, seed: 304 }); rline(c, [[1120, 592], [1180, 592]], { w: 6, color: P.ink2, t: tau, seed: 305 });
          rshape(c, rectPts(1140, 410, 26, 136, 6), { fill: P.ink, w: 4, t: tau, seed: 306 });
          const gl = c.createLinearGradient(1140, 0, 1010, 0); gl.addColorStop(0, alpha(P.sky, .45)); gl.addColorStop(1, alpha(P.sky, 0));
          c.fillStyle = gl; c.beginPath(); c.moveTo(1140, 420); c.lineTo(1030, 380); c.lineTo(1030, 580); c.lineTo(1140, 536); c.fill();
          const lookK = pull * .6;
          const st = s4Student(c, { x: 880, y: 782, h: 330, view: 'side', t: tau, color: P.teal, look: lookK, eye: pull > .5 ? 'open' : 'sparkle', hand: [36, -57] });
          // L8 手机：先放在手边（比视线低），开专注模式后滑到桌子另一头
          const slide = sm(n0 + 3.0, n0 + 3.8, tau), px = lerp(1036, 1390, slide);
          // 视线：看屏幕（金色）/ 被手机拽走（红色）
          const toScreen = 1 - pull, ph = [px + 24, 540];
          if (toScreen > .05) rline(c, [st.eye, [1136, st.eye[1] + 4]], { w: 4, color: P.moon, dash: [14, 12], t: tau, seed: 307, al: toScreen * sm(s[7] + .5, s[7] + .8, tau) });
          if (pull > .05) rline(c, [st.eye, ph], { w: 4, color: P.red, dash: [14, 12], t: tau, seed: 308, al: pull });
          if (tau > n0) {
            const pa = sm(n0 + .1, n0 + .4, tau, easeOutBack);
            const blink = tau < n0 + 2.7 && Math.floor((tau - n0) * 4) % 2 === 0;
            if (slide > 0 && slide < 1) for (let j = 0; j < 3; j++) rline(c, [[px - 20 - j * 14, 530 + j * 22], [px - 70 - j * 24, 530 + j * 22]], { w: 3, color: P.faint, t: tau, seed: 312 + j });
            pop(c, px + 24, 592, pa, () => s4Phone(c, px, 506, 48, 86, { lit: focusOn > .5 ? 0 : blink ? 1 : .35, badge: focusOn < .5, moon: focusOn > .5, t: tau, rot: slide * .15, al: 1 - slide * .35 }));
            if (focusOn < .5 && tau > n0 + .15) { const bb = sm(n0 + .15, n0 + .45, tau, easeOutBack) * (blink ? 1.06 : 1);
              pop(c, 1105, 330, bb, () => { bubble(c, 1030, 290, 150, 72, { tail: [1066, 470], t: tau, fill: '#fff' }); zh(c, '叮！', 1108, 342, { size: 44, align: 'center', color: P.red }); }); }
            const ar = sm(n0 + .5, n0 + 1.0, tau) * (1 - sm(n0 + 2.6, n0 + 2.9, tau));
            if (ar > 0) arrow(c, [1028, 320], [st.eye[0] - 10, st.eye[1] - 70], { p: ar >= 1 ? 1 : ar, color: P.red, w: 6, bend: 30, t: tau, seed: 310 });
          }
        }));
        // 左上标签 ✓
        const t7 = s[7];
        fade(c, 1 - sm(s[8] - .15, s[8] + .1, tau), () => {
          zh(c, '往上：更清醒', 790, 200, { size: 48, p: writeP(tau, t7 + .3, '往上：更清醒') });
          check(c, 1130, 180, 70, { t: tau, p: sm(t7 + 1.1, t7 + 1.4, tau) });
          // 右：低头看腿上的笔记本
          const rk = sm(t7 + 1.5, t7 + 1.9, tau, easeOutBack);
          pop(c, 1560, 780, rk, () => {
            rline(c, [[1360, 782], [1800, 782]], { w: 3, color: P.faint, t: tau, seed: 320 });
            const st = s4Student(c, { x: 1430, y: 782, h: 330, view: 'side', t: tau, color: P.purple, look: 1, eye: 'sleepy', hand: [34, -44] });
            // 腿上的笔记本
            const lx = 1478, ly = 640;
            rshape(c, [[lx, ly], [lx + 96, ly - 4], [lx + 96, ly + 6], [lx, ly + 10]], { fill: P.gray, w: 3.5, t: tau, seed: 321 });
            rshape(c, [[lx + 96, ly - 2], [lx + 74, ly - 80], [lx + 84, ly - 82], [lx + 104, ly - 4]], { fill: P.ink2, w: 3.5, t: tau, seed: 322 });
            rline(c, [st.eye, [lx + 80, ly - 36]], { w: 4, color: P.ink2, dash: [12, 12], t: tau, seed: 323, al: sm(t7 + 2, t7 + 2.3, tau) });
            for (let j = 0; j < 3; j++) { const f = ((tau - t7) * .55 + j / 3) % 1; zh(c, 'z', st.head[0] - 30 + f * 50 + j * 4, st.head[1] - 80 - f * 90, { size: 34 + j * 8, color: P.purple, al: Math.sin(f * Math.PI) * sm(t7 + 2.2, t7 + 2.5, tau) }); }
            // 屏幕别放太低：虚影抬高到齐眼
            const up = sm(t7 + 3.1, t7 + 3.6, tau);
            if (up > 0) { arrow(c, [lx + 140, ly - 30], [lx + 140, ly - 30 - 140 * up], { color: P.moon, w: 6, t: tau, seed: 325, p: up >= 1 ? 1 : .97 * up });
              zh(c, '抬高', lx + 170, ly - 90, { size: 36, color: P.moon, outline: P.ink, ow: 6, al: up }); }
          });
          zh(c, '往下：容易困', 1350, 200, { size: 48, p: writeP(tau, t7 + 1.8, '往下：容易困') });
          cross(c, 1700, 180, 64, { t: tau, p: sm(t7 + 2.5, t7 + 2.8, tau) });
        });
        // L8：专注模式的月牙开关
        const fm = sm(n0 + 2.6, n0 + 3.0, tau, easeOutBack) * (1 - sm(s[9] - .15, s[9] + .15, tau));
        if (fm > 0) pop(c, 1360, 230, fm, () => {
          const g = c.createRadialGradient(1230, 230, 10, 1230, 230, 140); g.addColorStop(0, alpha(P.moon, .5)); g.addColorStop(1, alpha(P.moon, 0)); c.fillStyle = g; c.beginPath(); c.arc(1230, 230, 140, 0, TAU); c.fill();
          rshape(c, rectPts(1180, 190, 370, 84, 42), { fill: P.ink, stroke: P.moon, w: 4, t: tau, seed: 330 });
          drawMoonIcon(c, 1228, 232, 26, P.moon, -.3);
          zh(c, '专注模式', 1265, 248, { size: 44, color: P.paper });
          const on = sm(n0 + 2.9, n0 + 3.2, tau);
          rshape(c, rectPts(1450, 212, 76, 40, 20), { fill: mix(P.gray, P.green, on), w: 3, t: tau, seed: 331 });
          rshape(c, circPts(1470 + on * 36, 232, 15, 14), { fill: '#fff', w: 3, t: tau, seed: 332 });
          sparkle(c, 1190, 180, 10 + 3 * Math.sin(tau * 8), { color: P.moon });
        });
        if (tau > n0 - .1) s4Head(c, tau, '手机放远点', n0 + 3.3, s[9] + .1, { x: 1440, y: 440, size: 44 });
      }

      // ---------- L9 一天 24 小时 ----------
      const e9a = 1 - sm(D - .85, D - .55, tau);
      if (tau > s[9] - .1 && e9a > 0) fade(c, e9a, () => {
        const t9 = s[9];
        s4Head(c, tau, '一天 24 小时', t9 + .2, D);
        const x0 = 800, x1 = 1760, y0 = 400, bh = 86, hx = hh => x0 + (x1 - x0) * hh / 24;
        const dp = sm(t9 + .4, t9 + 1.6, tau, easeOut);
        if (dp > 0) {
          c.save(); c.beginPath(); c.rect(x0 - 30, y0 - 60, (x1 - x0 + 60) * dp, bh + 130); c.clip();
          rshape(c, rectPts(x0, y0, hx(7) - x0, bh, 12), { fill: P.night3, w: 4, t: tau, seed: 401 });
          rshape(c, rectPts(hx(7), y0, hx(23) - hx(7), bh, 4), { fill: mix(P.paper, P.sky, .55), w: 4, t: tau, seed: 402 });
          rshape(c, rectPts(hx(23), y0, x1 - hx(23), bh, 12), { fill: P.night3, w: 4, t: tau, seed: 403 });
          drawMoonIcon(c, hx(3.5), y0 + bh / 2, 22, P.moon, -.3);
          rshape(c, circPts(hx(12), y0 + bh / 2, 20, 20), { fill: P.sun, w: 3.5, t: tau, seed: 404 });
          for (const hh of [0, 6, 12, 18, 24]) { rline(c, [[hx(hh), y0 + bh], [hx(hh), y0 + bh + 14]], { w: 3, t: tau, seed: 405 + hh }); zh(c, String(hh), hx(hh), y0 + bh + 50, { size: 32, align: 'center', color: P.ink2 }); }
          c.restore();
        }
        // 手机那一小段（20–22 点）
        const pk = sm(t9 + 2.0, t9 + 2.8, tau, easeOut);
        if (pk > 0) { const px = hx(20), pw = (hx(22) - hx(20)) * pk;
          const path = rshape(c, rectPts(px, y0 - 8, pw, bh + 16, 8), { fill: P.orange, w: 4.5, t: tau, seed: 420 });
          hatch(c, path, [px, y0 - 8, pw, bh + 16], { gap: 12, al: .3, t: tau, seed: 421 });
          const ik = sm(t9 + 2.3, t9 + 2.7, tau, easeOutBack);
          pop(c, hx(21), 300, ik, () => s4Phone(c, hx(21) - 30, 250, 60, 110, { lit: 1, t: tau, rot: Math.sin(tau * 2) * .06 }));
        }
        const lk = sm(t9 + 3.0, t9 + 3.4, tau, easeOutBack);
        if (lk > 0) {
          rline(c, [[hx(21), y0 + bh + 14], [hx(21), 612]], { w: 4, color: P.orange, t: tau, seed: 430, p: sm(t9 + 2.9, t9 + 3.2, tau) });
          pop(c, hx(21) - 60, 660, lk, () => { rshape(c, rectPts(hx(21) - 250, 612, 380, 100, 22), { fill: '#fff', stroke: P.orange, w: 5, t: tau, seed: 431 });
            zh(c, '≤ 2 小时', hx(21) - 60, 682, { size: 64, align: 'center', color: P.ink }); });
          zh(c, '有研究建议', hx(21) - 60, 772, { size: 34, align: 'center', color: P.ink2, p: writeP(tau, t9 + 3.6, '有研究建议') });
        }
        // 左下：伸懒腰的小人，一天剩下的时间给学习和生活
        const sk = sm(t9 + 3.8, t9 + 4.2, tau, easeOutBack);
        pop(c, 960, 780, sk, () => { s4Student(c, { x: 960, y: 800, h: 190, t: tau, mood: 'happy', arms: 'wave', color: P.teal });
          sparkle(c, 1040, 640, 12 + 4 * Math.sin(tau * 6), { color: P.moon }); });
      });
    };

    // ================= 满屏：生理叹息 =================
    const drawFull = () => {
      const s6 = s[6];
      const g = c.createRadialGradient(1000, 540, 60, 1000, 540, 1100); g.addColorStop(0, P.night3); g.addColorStop(1, P.night); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let k = 0; k < 26; k++) { const x = hash(k, 11) * W, y = (hash(k, 12) * H - tau * (10 + hash(k, 13) * 20) + 2 * H) % H; c.fillStyle = alpha('#fff0c0', .18 + .2 * Math.sin(tau * 2 + k)); c.beginPath(); c.arc(x, y, 2 + hash(k, 14) * 3, 0, TAU); c.fill(); }
      const zoom = 1 + .05 * sm(fsIn0, fsOut1, tau, x => x);
      c.save(); c.translate(1000, 560); c.scale(zoom, zoom); c.translate(-1000, -560);
      magicCircle(c, 1000, 590, 400, tau, { al: .16 });
      // 呼吸曲线
      const B = [[s6 + .1, 0], [s6 + .8, .55], [s6 + .95, .55], [s6 + 1.45, 1], [s6 + 1.7, 1], [s6 + 4.4, 0], [s6 + 4.6, 0], [s6 + 5.1, .55], [s6 + 5.2, .55], [s6 + 5.55, 1], [s6 + 5.75, 1], [s6 + 8.2, 0]];
      const idle = tau < s6 + .1 ? .12 * (.5 + .5 * Math.sin((tau - fsIn0) * 2.6 - Math.PI / 2)) : 0;
      const v = Math.max(idle, key(tau, B, easeSine));
      const phases = [[s6 + .1, s6 + .95, 0], [s6 + .95, s6 + 1.7, 1], [s6 + 1.7, s6 + 4.6, 2], [s6 + 4.6, s6 + 5.2, 0], [s6 + 5.2, s6 + 5.75, 1], [s6 + 5.75, fsOut1 + 1, 2]];
      const cur = phases.find(p => tau >= p[0] && tau < p[1]), ph = cur ? cur[2] : -1;
      const cx = 1000, cy = 580;
      // 吸：空气从上面流进气管
      if (ph === 0 || ph === 1) for (let k = 0; k < 7; k++) { const f = ((tau - cur[0]) * 1.8 + k / 7) % 1, y = lerp(200, cy - 140, f);
        c.fillStyle = alpha(P.sky, Math.sin(f * Math.PI) * .9); c.beginPath(); c.arc(cx + Math.sin(f * 9 + k) * 10, y, 7 - f * 3, 0, TAU); c.fill(); }
      s4Lungs(c, cx, cy, v, { t: tau, happy: ph === 2 ? 1 : 0 });
      // 呼：一缕缕气从上面出去
      if (ph === 2) for (let k = 0; k < 6; k++) { const f = ((tau - cur[0]) * .7 + k / 6) % 1, x = cx + 30 + f * 300, y = cy - 300 - f * 110 + Math.sin(f * 7 + k) * 14;
        rline(c, [[x - 20, y], [x - 6, y - 8], [x + 8, y], [x + 22, y - 8]], { w: 5, color: alpha('#fff', Math.sin(f * Math.PI) * .8), t: tau, seed: 500 + k, smooth: true }); }
      if (ph === 0 || ph === 1) zh(c, '鼻子吸', cx - 60, 250, { size: 38, align: 'right', color: P.sky });
      if (ph === 2) zh(c, '嘴巴呼', cx + 380, 200, { size: 38, color: '#fff' });
      c.restore();
      // 标题
      zh(c, '生理叹息', 960, 120, { size: 76, align: 'center', color: P.moon, p: writeP(tau, fsIn0 + .3, '生理叹息', .1) });
      // 左边三个大字：吸 · 再吸 · 呼——（当前那个放大、变金）
      const words = [['吸', 330], ['再吸', 520], ['呼——', 720]];
      words.forEach(([w, y], j) => {
        const first = phases.find(p => p[2] === j)[0], k = sm(first, first + .3, tau, easeOutBack); if (k <= 0) return;
        const on = ph === j, big = on ? 1.18 : 1, x = 360;
        let pw = 1; if (j === 2 && on) pw = .34 + .66 * sm(cur[0], cur[0] + 2.2, tau, x => x);
        pop(c, 170, y - 40, k * big, () => {
          rshape(c, circPts(170, y - 42, 30, 20), { fill: on ? P.moon : P.night3, stroke: on ? P.ink : P.faint, w: 3, t: tau, seed: 520 + j });
          zh(c, String(j + 1), 170, y - 29, { size: 38, align: 'center', color: on ? P.ink : P.faint });
          zh(c, w, 225, y, { size: 118, color: on ? P.moon : P.paper, al: on ? 1 : .45, p: pw, outline: on ? P.ink : null, ow: 10 });
        });
      });
      // 角落里跟着一起做的 Q 版帕秋莉
      const ck = sm(fsIn0 + .4, fsIn0 + .8, tau, easeOutBack);
      pop(c, 1660, 880, ck, () => {
        c.save(); c.translate(1660, 880); c.scale(1, 1 + .05 * v); c.translate(-1660, -880);
        drawPatchouliChibi(c, { x: 1660, y: 880, h: 300, t: tau, mood: ph === 2 ? 'smile' : 'normal', mouth: ph === 2 ? .45 : L.mouth * .8, blink: ph === 2 ? 1 : blinkAt(tau, 3) });
        c.restore();
      });
    };

    // ================= 合成 =================
    const inFull = tau >= fsIn0 && tau < fsOut1;
    if (!inFull) { drawStage(); return; }
    let rad, ctr;
    if (tau < fsIn1) { rad = sm(fsIn0, fsIn1, tau, easeIn) * 2300; ctr = irisIn; drawStage(); }
    else if (tau >= fsOut0) { rad = (1 - sm(fsOut0, fsOut1, tau, easeOut)) * 2300; ctr = irisOut; drawStage(); }
    else rad = 99999;
    c.save();
    if (rad < 9999) { c.beginPath(); c.arc(ctr[0], ctr[1], Math.max(0, rad), 0, TAU); c.clip(); }
    drawFull();
    c.restore();
    if (rad < 9999 && rad > 1) rline(c, circPts(ctr[0], ctr[1], rad, 64), { w: 8, color: P.moon, close: true, t: tau, seed: 600 });
  } });
