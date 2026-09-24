'use strict';
// 第 5 段：运动
// 讲台：体力槽 + 吸入器 → 五种有氧小人 + 大脑 → 一周日历（150 分钟、每天 20 分钟、力量 2 天）→【满屏】Q 版帕秋莉举杠铃，
// 两端挂着 Q 版魔理沙和小恶魔 → 椅子上的小人被划掉 → 沙漏 1 小时、接水 / 走两圈 / 伸懒腰 → 咳嗽、得意、「没有借口」。
// 顶层名字一律带本段前缀 S5 / s5，避免和其他段撞名。
const S5LINES = seq(1.0, [
  ['第五页：运动。……好吧，这一页我是反面教材。', { mood: 'sad' }],
  ['对大脑帮助最大的，是有氧运动：快走、慢跑、骑车、游泳、打球。', { hold: .8 }],
  ['每周 150 分钟以上，拆开算，一天二十来分钟就够。', { hold: .9 }],
  ['世卫组织还建议：每周两天以上，做做力量练习。', { hold: .8 }],
  ['姆Q……杠铃……好重……', { mood: 'sad', pause: .3, hold: 1.8 }],
  ['还有：少坐。任何强度的活动，都比一直坐着强。', { hold: .6 }],
  ['坐着学一小时，就起来接杯水、走两圈、伸个懒腰。', { hold: 1.5 }],
  ['我喘成这样是因为哮喘。你们，可没有这个借口。', { mood: 'smug', pause: .9, hold: 1.1 }],
]);
const S5DUR = seqEnd(S5LINES) + 1.0;
// 满屏杠铃镜头的起止（第 5 句前 0.35 秒切入，第 6 句开始时切回讲台）
const S5SHOT = [S5LINES[4][0] - .35, S5LINES[5][0]];

// ===================== 小工具 =====================
// 某句台词里某个词「说到」的时刻（按每字约 0.16 秒估）
function s5At(i, word, off = 0) { const l = S5LINES[i], k = l[2].indexOf(word); return l[0] + Math.max(0, k) * .16 + off; }
const s5Pop = (tau, t0, d = .4) => tau <= t0 ? 0 : easeOutBack(clamp((tau - t0) / d, 0, 1));
// 组的可见度：[a, b] 内为 1，最后 0.25 秒干脆地淡出
const s5Vis = (tau, a, b) => tau < a || tau > b ? 0 : 1 - sm(b - .25, b, tau);
const s5Dir = a => [Math.sin(a), Math.cos(a)];            // 角度 0 = 竖直向下，正 = 朝前（+x）
const s5Add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const S5WHITE = mix(P.paper, '#ffffff', .75);
// 多色一行字，整体居中，按 p 逐字写出。parts = [[文字, 颜色], ...]
function s5Words(c, parts, x, y, o = {}) {
  const { size = 48, p = 1, align = 'center', outline = null, ow = 8 } = o;
  const widths = parts.map(q => zhWidth(c, q[0], size)), total = widths.reduce((a, b) => a + b, 0);
  const nAll = parts.reduce((a, q) => a + [...q[0]].length, 0);
  let left = p >= 1 ? nAll : Math.floor(nAll * clamp(p, 0, 1) + 1e-6), cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  parts.forEach(([txt, col], k) => { const n = [...txt].length, m = clamp(left, 0, n); if (m > 0) zh(c, txt, cx, y, { size, color: col, p: m / n, outline, ow }); left -= n; cx += widths[k]; });
}
// 两段式 IK：从 a 到 b，两节长 l1 l2，bend 决定关节弯向哪边。返回 [关节, 末端]
function s5IK(a, b, l1, l2, bend = 1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = clamp(Math.hypot(dx, dy), .01, l1 + l2 - .01), ang = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = ang + bend * A;
  return [[a[0] + Math.cos(k) * l1, a[1] + Math.sin(k) * l1], [a[0] + Math.cos(ang) * d, a[1] + Math.sin(ang) * d]];
}
// 粗线「肢体」：先描深色边，再上颜色
function s5Limb(c, pts, col, w, t, seed) { rline(c, pts, { w: w + 5, color: P.ink, t, seed, amp: .7 }); rline(c, pts, { w, color: col, t, seed, amp: .7 }); }
function s5Dot(c, x, y, r, col, o = {}) { rshape(c, circPts(x, y, r, 20), { fill: col, stroke: o.stroke ?? P.ink, w: o.w ?? 3, t: o.t ?? null, seed: o.seed ?? 5, amp: o.amp ?? .6 }); }

// ===================== 学生小人（可复用） =====================
// s5Kid：圆头小人。(x, y) 是胯部；腿伸直时脚底在 y + 48s。朝右画，dir = -1 镜像。
// 角度：0 竖直向下，正值朝前。aF/aB 前后手 [上臂, 前臂相对]，lF/lB 前后腿 [大腿, 小腿相对]。
// footF/footB/handF/handB 给了就用 IK 把手脚放到那个点（小人局部坐标）。face: happy|smile|tired|sleepy|wow|joy
function s5Kid(c, x, y, s, o = {}) {
  const { t = 0, dir = 1, lean = 0, aB = [.25, .4], aF = [-.25, .4], lB = [.06, 0], lF = [-.06, 0], shirt = P.blue, pants = P.ink2, hair = P.shelf,
    face = 'happy', footB = null, footF = null, handB = null, handF = null, seed = 1, tilt = 0, prop = null, cap = null } = o;
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const sh = [Math.sin(lean) * 34, -Math.cos(lean) * 34], hc = [Math.sin(lean) * 64, -Math.cos(lean) * 64];
  const arm = (a, tg) => { if (tg) { const [e, h] = s5IK(sh, tg, 22, 20, 1); return [sh, e, h]; } const e = s5Add(sh, s5Dir(a[0]), 22); return [sh, e, s5Add(e, s5Dir(a[0] + a[1]), 20)]; };
  const leg = (a, tg, hx) => { const hp = [hx, 0]; if (tg) { const [k, f] = s5IK(hp, tg, 24, 24, -1); return [hp, k, f]; } const k = s5Add(hp, s5Dir(a[0]), 24); return [hp, k, s5Add(k, s5Dir(a[0] + a[1]), 24)]; };
  const AB = arm(aB, handB), AF = arm(aF, handF), LB = leg(lB, footB, -4), LF = leg(lF, footF, 4);
  const dk = col => mix(col, P.ink, .2);
  const drawLeg = (Lg, dark, sd) => { rline(c, Lg, { w: 15, color: P.ink, t, seed: sd, amp: .7 }); rline(c, Lg, { w: 10, color: dark ? dk(pants) : pants, t, seed: sd, amp: .7 });
    const f = Lg[2], k = Lg[1], ang = Math.atan2(f[1] - k[1], f[0] - k[0]) - Math.PI / 2; rshape(c, ellPts(f[0] + Math.cos(ang) * 5, f[1] + Math.sin(ang) * 5, 9, 6, 16, ang), { fill: dark ? P.ink : mix(P.ink, P.ink2, .4), stroke: P.ink, w: 3, t, seed: sd + 3, amp: .5 }); };
  const drawArm = (A, dark, sd) => { rline(c, A, { w: 13, color: P.ink, t, seed: sd, amp: .7 }); rline(c, [A[0], A[1]], { w: 8, color: dark ? dk(shirt) : shirt, t, seed: sd, amp: .7 });
    rline(c, [A[1], A[2]], { w: 7, color: dark ? dk(P.skin) : P.skin, t, seed: sd + 1, amp: .7 }); s5Dot(c, A[2][0], A[2][1], 5.5, dark ? dk(P.skin) : P.skin, { t, seed: sd + 2, w: 2.5 }); };
  drawArm(AB, true, seed + 10); drawLeg(LB, true, seed + 20);
  // 身体：胶囊形的衣服 + 短裤
  rline(c, [[0, -2], sh], { w: 34, color: P.ink, t, seed: seed + 30, amp: .6 }); rline(c, [[0, -2], sh], { w: 28, color: shirt, t, seed: seed + 30, amp: .6 });
  rline(c, [[0, 2], s5Add([0, 2], s5Dir(lean + Math.PI), 8)], { w: 29, color: pants, t, seed: seed + 31, amp: .5 });
  drawLeg(LF, false, seed + 40);
  // 头
  c.save(); c.translate(hc[0], hc[1]); c.rotate(tilt + lean * .4);
  rshape(c, circPts(0, 0, 24, 36), { fill: P.skin, stroke: P.ink, w: 3.5, t, seed: seed + 50, amp: .7 });
  const hairPts = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * (.93 + k / 12 * 1.1); hairPts.push([Math.cos(a) * 27, Math.sin(a) * 27 - 1]); }
  hairPts.push([24, -2], [15, -10], [8, -5], [0, -12], [-9, -6], [-17, 6], [-25, 12]);
  rshape(c, hairPts, { fill: cap || hair, stroke: P.ink, w: 3.5, t, seed: seed + 51, amp: .7, smooth: true });
  if (cap) rline(c, [[-22, -12], [22, -12]], { w: 3, color: S5WHITE, t, seed: seed + 52 });
  // 脸（朝右的四分之三侧脸）
  c.save(); c.fillStyle = alpha(P.blush, .75); c.beginPath(); c.ellipse(16, 9, 5, 2.6, 0, 0, TAU); c.fill(); c.restore();
  const eye = (ex) => {
    if (face === 'happy' || face === 'joy') rline(c, [[ex - 4, 3], [ex, -1], [ex + 4, 3]], { w: 3, t, seed: seed + ex, amp: .3 });
    else if (face === 'tired' || face === 'sleepy') { rline(c, [[ex - 4, 2], [ex + 4, 2]], { w: 3, t, seed: seed + ex, amp: .3 }); if (face === 'tired') rline(c, [[ex - 3, 7], [ex + 3, 7]], { w: 1.5, color: P.ink2, t, seed: seed + ex + 1, amp: .3 }); }
    else { c.fillStyle = P.ink; c.beginPath(); c.ellipse(ex, 1, 2.9, face === 'wow' ? 4.6 : 3.9, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - .8, -.6, 1.1, 0, TAU); c.fill(); }
  };
  eye(7); eye(17);
  if (face === 'joy' || face === 'wow') { c.fillStyle = mix(P.red, P.ink, .3); c.beginPath(); c.ellipse(14, 12.5, 3.6, face === 'wow' ? 4 : 3, 0, 0, face === 'wow' ? TAU : Math.PI); c.fill(); }
  else if (face === 'tired' || face === 'sleepy') rline(c, [[10, 13], [17, 12]], { w: 2.5, t, seed: seed + 60, amp: .3 });
  else rline(c, [[9, 10], [13.5, 13.5], [18, 10]], { w: 2.5, t, seed: seed + 60, amp: .3, smooth: true });
  c.restore();
  drawArm(AF, false, seed + 70);
  if (prop) prop(c, AF[2], AB[2]);
  c.restore();
}
// 步态：f 频率、amp 腿摆幅、knee 屈膝、arm 手摆幅、elbow 屈肘
function s5Gait(t, f, amp, knee, arm, elbow) {
  const ph = t * TAU * f, sn = Math.sin(ph), cs = Math.cos(ph);
  return { lF: [amp * sn, -knee * Math.max(0, -cs)], lB: [-amp * sn, -knee * Math.max(0, cs)], aF: [-arm * sn, elbow], aB: [arm * sn, elbow], bob: Math.abs(cs) };
}
// 五种有氧小人。(x, y) = 地面中心，s 缩放
function s5Walker(c, x, y, s, t, o = {}) {
  const g = s5Gait(t, 1.1, .42, .5, .45, .35);
  s5Kid(c, x, y - (48 + g.bob * 3) * s, s, { t, ...g, lean: .05, shirt: P.teal, seed: 3, face: 'smile', ...o });
}
function s5Jogger(c, x, y, s, t, o = {}) {
  const g = s5Gait(t, 1.7, .72, 1.3, .8, 1.5);
  s5Kid(c, x, y - (44 + g.bob * 8) * s, s, { t, ...g, lean: .22, shirt: P.orange, seed: 5, face: 'joy', ...o });
  rline(c, [[x - 55 * s, y - 60 * s], [x - 85 * s, y - 60 * s]], { w: 3, color: P.faint, t, seed: 9 });
  rline(c, [[x - 50 * s, y - 38 * s], [x - 72 * s, y - 38 * s]], { w: 3, color: P.faint, t, seed: 10 });
}
function s5Biker(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const R = 25, wb = [-44, -R], wf = [46, -R], cr = [0, -22], rot = t * 7;
  const wheel = (p, sd) => { rshape(c, circPts(p[0], p[1], R, 36), { fill: alpha(P.sky, .25), stroke: P.ink, w: 5, t, seed: sd });
    for (let k = 0; k < 3; k++) { const a = rot + k * Math.PI / 3; rline(c, [[p[0] - Math.cos(a) * R * .85, p[1] - Math.sin(a) * R * .85], [p[0] + Math.cos(a) * R * .85, p[1] + Math.sin(a) * R * .85]], { w: 2, color: P.ink2, t, seed: sd + k }); }
    s5Dot(c, p[0], p[1], 4, P.ink2, { t }); };
  wheel(wb, 41); wheel(wf, 47);
  const seat = [-12, -64], bar = [36, -76];
  rline(c, [wb, cr, seat, wb], { w: 6, color: P.red, t, seed: 51 }); rline(c, [cr, [30, -62], seat], { w: 6, color: P.red, t, seed: 52 });
  rline(c, [wf, [30, -62], bar], { w: 6, color: P.red, t, seed: 53 }); rline(c, [bar, [44, -80]], { w: 6, color: P.ink, t, seed: 54 });
  rshape(c, ellPts(seat[0] - 2, seat[1] - 3, 13, 5), { fill: P.ink, stroke: P.ink, w: 2, t, seed: 55 });
  const hip = [-8, -70], pa = [cr[0] + Math.cos(rot) * 11, cr[1] + Math.sin(rot) * 11], pb = [cr[0] - Math.cos(rot) * 11, cr[1] - Math.sin(rot) * 11];
  const loc = p => [p[0] - hip[0], p[1] - hip[1]];
  s5Kid(c, hip[0], hip[1], 1, { t, lean: .5, footF: loc(pa), footB: loc(pb), handF: loc(bar), handB: loc([bar[0] - 3, bar[1] + 1]), shirt: P.blue, seed: 7, face: 'smile' });
  s5Dot(c, cr[0], cr[1], 5, P.ink2, { t });
  c.restore();
}
function s5Swimmer(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const ph = t * TAU * .75;
  c.save(); c.translate(-4, -2); c.rotate(Math.PI / 2 - .08);
  s5Kid(c, 0, 0, 1, { t, dir: -1, aF: [ph, 0], aB: [ph + Math.PI, 0], lF: [.22 * Math.sin(ph * 3), 0], lB: [-.22 * Math.sin(ph * 3), 0], shirt: P.red, pants: P.red, cap: P.blue, seed: 11, face: 'joy' });
  c.restore();
  // 水面：盖住下半身
  const wave = []; for (let k = 0; k <= 24; k++) { const xx = -80 + k * 160 / 24; wave.push([xx, 2 + Math.sin(xx * .09 + t * 5) * 4]); }
  const band = [...wave, [80, 18], [60, 26], [-60, 26], [-80, 18]];
  rshape(c, band, { fill: alpha(P.sky, .75), stroke: false, t, seed: 13, smooth: true });
  rline(c, wave, { w: 4, color: P.blue, t, seed: 14 });
  for (const xx of [-50, 10, 55]) rline(c, [[xx - 10, 14], [xx, 11], [xx + 10, 14]], { w: 2.5, color: alpha(S5WHITE, .9), t, seed: 15 + xx, smooth: true });
  for (let k = 0; k < 4; k++) { const u = (t * 1.6 + k / 4) % 1; s5Dot(c, 60 + Math.cos(k * 2) * 18 * u, -8 - Math.sin(u * Math.PI) * 22, 3.2 * (1 - u) + 1, P.sky, { stroke: P.blue, w: 1.5 }); }
  c.restore();
}
function s5Baller(c, x, y, s, t) {
  const b = Math.abs(Math.sin(t * TAU * .9)), by = lerp(-11, -40, b), bx = 30;
  c.save(); c.translate(x, y); c.scale(s, s);
  const hip = [-6, -46];
  s5Kid(c, hip[0], hip[1], 1, { t, lean: .12, lF: [.3, -.5], lB: [-.2, -.25], aB: [-.6, .6], handF: [bx - hip[0], by - 12 - hip[1]], shirt: P.purple, seed: 15, face: 'joy' });
  rshape(c, circPts(bx, by, 11, 24), { fill: P.orange, stroke: P.ink, w: 3.5, t, seed: 16 });
  rline(c, [[bx - 11, by], [bx + 11, by]], { w: 2, t, seed: 17 }); rline(c, [[bx - 5, by - 10], [bx - 3, by], [bx - 5, by + 10]], { w: 2, t, seed: 18, smooth: true });
  rshape(c, ellPts(bx, 0, 12 - b * 5, 3), { fill: alpha(P.ink, .25), stroke: false });
  c.restore();
}

// ===================== 道具 =====================
function s5Inhaler(c, x, y, s, t, o = {}) {
  const { puff = 0 } = o;
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, rectPts(-18, -118, 36, 80, 10), { fill: mix(P.gray, '#ffffff', .35), stroke: P.ink, w: 4, t, seed: 61 });   // 药罐
  rline(c, [[-10, -104], [-10, -60]], { w: 3, color: S5WHITE, t, seed: 62 });
  rshape(c, [[-28, -66], [28, -66], [28, 30], [-76, 30], [-76, -4], [-28, -4]], { fill: P.blue, stroke: P.ink, w: 4.5, t, seed: 63 });   // L 形外壳
  rline(c, [[-70, 4], [-70, 24]], { w: 3, color: mix(P.blue, P.ink, .4), t, seed: 64 });
  rline(c, [[18, -56], [18, 18]], { w: 4, color: alpha(S5WHITE, .6), t, seed: 65 });
  if (puff > 0) for (let k = 0; k < 3; k++) { const r = (10 + k * 6) * puff; rshape(c, circPts(-92 - k * 22 * puff, 14 - k * 6, r, 20), { fill: alpha(S5WHITE, .85 * (1 - puff * .5)), stroke: alpha(P.ink2, .6), w: 2.5, t, seed: 66 + k }); }
  c.restore();
}
function s5Dumbbell(c, x, y, s, rot, t, col = P.ink2) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rline(c, [[-34, 0], [34, 0]], { w: 10, color: P.ink, t, seed: 71 }); rline(c, [[-34, 0], [34, 0]], { w: 5, color: P.gray, t, seed: 71 });
  for (const d of [-1, 1]) { rshape(c, rectPts(d * 30 - 8, -24, 16, 48, 5), { fill: col, stroke: P.ink, w: 3.5, t, seed: 72 + d });
    rshape(c, rectPts(d * 44 - 6, -17, 12, 34, 4), { fill: col, stroke: P.ink, w: 3.5, t, seed: 74 + d }); }
  c.restore();
}
function s5Shoe(c, x, y, s, t, col = P.orange) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, [[-40, 0], [-42, -22], [-22, -30], [-4, -26], [10, -40], [26, -40], [30, -22], [46, -12], [48, 0]], { fill: col, stroke: P.ink, w: 4, t, seed: 81, smooth: true });
  rline(c, [[-42, -2], [48, -2]], { w: 7, color: S5WHITE, t, seed: 82 });
  for (let k = 0; k < 3; k++) rline(c, [[4 + k * 7, -30 + k * 3], [14 + k * 7, -34 + k * 3]], { w: 2.5, color: S5WHITE, t, seed: 83 + k });
  c.restore();
}
function s5Chair(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const wood = P.shelf2;
  rline(c, [[-34, -54], [-36, 0]], { w: 7, color: P.ink, t, seed: 91 }); rline(c, [[30, -54], [32, 0]], { w: 7, color: P.ink, t, seed: 92 });
  rline(c, [[-38, -54], [-44, -150]], { w: 8, color: P.ink, t, seed: 93 });
  rshape(c, rectPts(-54, -148, 22, 64, 6), { fill: wood, stroke: P.ink, w: 3.5, t, seed: 94 });
  rshape(c, rectPts(-44, -64, 82, 14, 5), { fill: wood, stroke: P.ink, w: 3.5, t, seed: 95 });
  c.restore();
}
// 沙漏：p = 已漏下的比例
function s5Hourglass(c, x, y, h, p, t, o = {}) {
  const { spin = 0 } = o, w = h * .56, hh = h / 2;
  c.save(); c.translate(x, y); c.rotate(spin);
  const hw = d => w / 2 * (.12 + .88 * Math.pow(clamp(d, 0, 1), .75));
  const side = sgn => { const q = []; for (let k = 0; k <= 16; k++) { const yy = -hh + k / 16 * h; q.push([sgn * hw(Math.abs(yy) / hh), yy]); } return q; };
  const glass = [...side(1), ...side(-1).reverse()];
  rshape(c, glass, { fill: alpha(P.sky, .22), stroke: false });
  // 上面的沙
  const top = (1 - p) * hh * .82;
  if (top > 2) { const q = []; for (let k = 0; k <= 8; k++) { const yy = -top + k / 8 * top; q.push([hw(Math.abs(yy) / hh) - 3, yy]); } const qq = q.map(v => [-v[0], v[1]]).reverse();
    rshape(c, [...q, ...qq], { fill: P.gold, stroke: false, t, seed: 101 }); }
  // 下面的沙堆
  const bot = p * hh * .8;
  if (bot > 1) { const q = [[-hw(1) + 4, hh - 2]]; for (let k = 0; k <= 10; k++) { const u = k / 10, xx = lerp(-1, 1, u); const yy = hh - bot * (.55 + .45 * (1 - xx * xx)); q.push([clamp(xx * w / 2, -hw(Math.abs(yy) / hh) + 3, hw(Math.abs(yy) / hh) - 3), yy]); } q.push([hw(1) - 4, hh - 2]);
    rshape(c, q, { fill: P.gold, stroke: false, t, seed: 102 }); }
  if (p > 0 && p < 1) rline(c, [[0, 0], [0, hh - bot * .95]], { w: 3, color: P.gold, t, seed: 103, dash: [6, 5] });
  rline(c, glass, { w: 4.5, close: true, t, seed: 104 });
  rline(c, [[w * .18, -hh * .8], [w * .3, -hh * .45]], { w: 3, color: alpha(S5WHITE, .9), t, seed: 105 });
  for (const sg of [-1, 1]) rshape(c, rectPts(-w / 2 - 14, sg * hh - 9, w + 28, 18, 6), { fill: P.shelf2, stroke: P.ink, w: 4, t, seed: 106 + sg });
  for (const sg of [-1, 1]) rline(c, [[sg * (w / 2 + 6), -hh + 8], [sg * (w / 2 + 6), hh - 8]], { w: 6, color: P.shelf, t, seed: 108 + sg });
  c.restore();
}
function s5Dispenser(c, x, y, s, t, level) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, rectPts(-30, -102, 60, 102, 8), { fill: P.paper2, stroke: P.ink, w: 4, t, seed: 111 });
  rshape(c, rectPts(-24, -176, 48, 76, 14), { fill: alpha(P.sky, .45), stroke: P.ink, w: 4, t, seed: 112 });
  const wl = -176 + 76 * (1 - level * .9);
  rshape(c, rectPts(-20, wl + 4, 40, -100 - wl - 8, 8), { fill: alpha(P.blue, .45), stroke: false, t, seed: 113 });
  rshape(c, rectPts(18, -74, 22, 12, 4), { fill: P.red, stroke: P.ink, w: 3, t, seed: 114 });
  c.restore();
}
function s5Cup(c, x, y, s, lv, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (lv > 0) rshape(c, [[-10 + 1, -2], [10 - 1, -2], [12 - 2 * (1 - lv) , -24 * lv], [-12 + 2 * (1 - lv), -24 * lv]], { fill: alpha(P.blue, .6), stroke: false });
  rline(c, [[-13, -26], [-10, 0], [10, 0], [13, -26]], { w: 3.5, t, seed: 121 });
  c.restore();
}
// 咳嗽小云朵
function s5Puff(c, x, y, r, t, o = {}) {
  const { al = 1, text = null, seed = 131 } = o; if (al <= 0) return;
  const q = []; for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; const rr = r * (.82 + .22 * Math.abs(Math.sin(a * 2.5 + seed))); q.push([x + Math.cos(a) * rr * 1.2, y + Math.sin(a) * rr * .85]); }
  fade(c, al, () => { rshape(c, q, { fill: S5WHITE, stroke: P.ink2, w: 3, t, seed, smooth: true }); if (text) zh(c, text, x, y + r * .32, { size: Math.max(32, r * .9), align: 'center', color: P.ink2 }); });
}
function s5Drop(c, x, y, r, rot, t, seed = 141) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const q = []; for (let k = 0; k <= 20; k++) { const a = Math.PI * (-.15 + k / 20 * 1.3); q.push([Math.cos(a) * r, Math.sin(a) * r]); } q.push([0, -r * 2.1]);
  rshape(c, q, { fill: P.sky, stroke: P.ink, w: 2.5, t, seed, smooth: true }); c.restore();
}
function s5Brain(c, x, y, r, t, glow = 0) {
  if (glow > 0) {
    const g = c.createRadialGradient(x, y, r * .3, x, y, r * 2.2); g.addColorStop(0, alpha(P.moon, .55 * glow)); g.addColorStop(1, alpha(P.moon, 0)); c.fillStyle = g; c.fillRect(x - r * 2.3, y - r * 2.3, r * 4.6, r * 4.6);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + t * .4, r0 = r * 1.35, r1 = r * (1.6 + .12 * Math.sin(t * 6 + k)); rline(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 5, color: P.moon, t, seed: 150 + k, al: glow }); }
  }
  const q = []; for (let k = 0; k < 64; k++) { const a = k / 64 * TAU, rr = r * (1 + .06 * Math.sin(a * 9)); q.push([x + Math.cos(a) * rr * 1.15, y + Math.sin(a) * rr * .85]); }
  rshape(c, q, { fill: mix(P.pink, mix(P.moon, '#ffffff', .3), glow * .55), stroke: P.ink, w: 5, t, seed: 161, smooth: true });
  rline(c, [[x + 4, y - r * .82], [x - 6, y - r * .35], [x + 4, y + r * .15], [x - 2, y + r * .6]], { w: 4, t, seed: 162, smooth: true });
  const fold = mix(P.ink, P.pink, .35);
  for (const sg of [-1, 1]) {
    rline(c, [[x + sg * r * .85, y - r * .15], [x + sg * r * .6, y - r * .4], [x + sg * r * .35, y - r * .15], [x + sg * r * .5, y + r * .12]], { w: 3.5, color: fold, t, seed: 163 + sg, smooth: true });
    rline(c, [[x + sg * r * .3, y - r * .6], [x + sg * r * .5, y - r * .5], [x + sg * r * .72, y - r * .62]], { w: 3.5, color: fold, t, seed: 165 + sg, smooth: true });
    rline(c, [[x + sg * r * .9, y + r * .3], [x + sg * r * .6, y + r * .42], [x + sg * r * .35, y + r * .38]], { w: 3.5, color: fold, t, seed: 167 + sg, smooth: true });
  }
  if (glow > .5) {   // 亮起来的大脑会笑
    for (const sg of [-1, 1]) rline(c, [[x + sg * r * .32 - 8, y + r * .02 + 4], [x + sg * r * .32, y + r * .02 - 4], [x + sg * r * .32 + 8, y + r * .02 + 4]], { w: 4.5, t, seed: 169 + sg });
    rline(c, [[x - 10, y + r * .3], [x, y + r * .38], [x + 10, y + r * .3]], { w: 4, t, seed: 171, smooth: true });
  }
}
// RPG 状态面板：魔力满格、体力掉到 1 格
function s5StatPanel(c, x, y, w, h, tau, t0) {
  rshape(c, rectPts(x, y, w, h, 20), { fill: P.night2, stroke: P.moon, w: 5, t: tau, seed: 181 });
  rline(c, rectPts(x + 10, y + 10, w - 20, h - 20, 14), { w: 2, color: alpha(P.moon, .5), close: true, t: tau, seed: 182 });
  drawMoonIcon(c, x + 46, y + 56, 20, P.moon);
  zh(c, '帕秋莉 · 状态', x + 80, y + 72, { size: 42, color: P.paper });
  const rows = [['魔力', 10, P.purple], ['体力', 10 - Math.floor(9 * clamp((tau - t0 - .7) / 1.5, 0, 1)), null]];
  const bx = x + 150, cw = (w - 262) / 10;
  rows.forEach(([lab, n, col], r) => {
    const ry = y + 120 + r * 82;
    zh(c, lab, x + 40, ry + 38, { size: 40, color: P.paper });
    for (let k = 0; k < 10; k++) {
      const on = k < n, cx = bx + k * cw;
      let fill = alpha(P.paper, .12);
      if (on) fill = col || (n > 5 ? P.green : n > 2 ? P.orange : P.red);
      let al = 1; if (!col && on && n === 1) al = .55 + .45 * Math.abs(Math.sin(tau * 5));
      rshape(c, rectPts(cx + 3, ry, cw - 8, 48, 6), { fill, stroke: alpha(P.paper, .5), w: 2.5, t: tau, seed: 190 + k + r * 10, al });
      if (!col && !on && k < 10) { const dt = tau - (t0 + .7 + 1.5 * (10 - k - 1) / 9); if (dt > 0 && dt < .5) fade(c, 1 - dt / .5, () => rshape(c, rectPts(cx + 3, ry + dt * 90, cw - 8, 48, 6), { fill: P.green, stroke: false, seed: 199 })); }
    }
    zh(c, col ? '满' : `${n}/10`, bx + 10 * cw + 12, ry + 38, { size: 34, color: col ? P.moon : n === 1 ? P.red : P.paper });
  });
  zh(c, '状态：哮喘 · 常年不出门', x + 40, y + h - 30, { size: 32, color: P.pink });
}
// 周历：fills[k] 0..1 第 k 天的有氧格子，strong[k] 0..1 第 k 天的哑铃
function s5Calendar(c, x, y, w, h, tau, fills, strong) {
  rshape(c, rectPts(x, y, w, h, 12), { fill: S5WHITE, stroke: P.ink, w: 5, t: tau, seed: 201 });
  rshape(c, rectPts(x, y, w, 56, 12), { fill: P.ribbonRed, stroke: P.ink, w: 5, t: tau, seed: 202 });
  const cw = w / 7, days = '一二三四五六日';
  for (let k = 0; k < 7; k++) {
    const cx = x + k * cw;
    if (k) rline(c, [[cx, y + 56], [cx, y + h]], { w: 3, color: P.faint, t: tau, seed: 203 + k });
    zh(c, days[k], cx + cw / 2, y + 42, { size: 34, align: 'center', color: P.paper });
    rline(c, [[cx + cw / 2, y - 16], [cx + cw / 2, y + 12]], { w: 7, color: P.ink2, t: tau, seed: 211 + k });
    const f = fills[k] || 0;
    if (f > 0) { const fh = (h - 72) * f; rshape(c, rectPts(cx + 10, y + h - 8 - fh, cw - 20, fh, 8), { fill: alpha(P.green, .8), stroke: mix(P.green, P.ink, .4), w: 3, t: tau, seed: 221 + k }); }
    if (f > .6) zh(c, '20′', cx + cw / 2, y + h - 22, { size: 36, align: 'center', color: S5WHITE, al: sm(.6, 1, f) });
    const st = strong[k] || 0;
    if (st > 0) { rline(c, rectPts(cx + 5, y + 61, cw - 10, h - 66, 8), { w: 5, color: P.orange, close: true, t: tau, seed: 231 + k, al: clamp(st, 0, 1) });
      pop(c, cx + cw / 2, y + 108, st, () => s5Dumbbell(c, cx + cw / 2, y + 108 + Math.sin(tau * 5 + k) * 3, .95, -.12, tau)); }
  }
}
// 杠铃：hands 两个握点。返回沿杆取点的函数 at(k)（k = -1..1）
function s5Barbell(c, hl, hr, half, sag, t) {
  const m = [(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2], ang = Math.atan2(hr[1] - hl[1], hr[0] - hl[0]), u = [Math.cos(ang), Math.sin(ang)], n = [-u[1], u[0]];
  const at = k => [m[0] + u[0] * half * k + n[0] * sag * k * k, m[1] + u[1] * half * k + n[1] * sag * k * k];
  const pts = []; for (let k = 0; k <= 30; k++) pts.push(at(-1 + k / 15));
  const draw = () => {
    rline(c, pts, { w: 20, color: P.ink, t, seed: 241, smooth: true, amp: .8 }); rline(c, pts, { w: 12, color: P.gray, t, seed: 241, smooth: true, amp: .8 });
    rline(c, pts, { w: 3, color: alpha(S5WHITE, .7), t, seed: 242, smooth: true, amp: .8 });
    for (const sg of [-1, 1]) {
      const pa = at(sg * .7), pb = at(sg * .78), pc = at(sg * .84), a2 = ang + 2 * sag * sg * .75 / half;
      const plate = (p, ww, hh, col, sd) => { c.save(); c.translate(p[0], p[1]); c.rotate(a2); rshape(c, rectPts(-ww / 2, -hh / 2, ww, hh, 8), { fill: col, stroke: P.ink, w: 4.5, t, seed: sd }); rline(c, [[-ww / 2 + 7, -hh / 2 + 12], [-ww / 2 + 7, hh / 2 - 12]], { w: 3, color: alpha(S5WHITE, .35), t, seed: sd + 1 }); c.restore(); };
      plate(pa, 40, 190, P.ink2, 243 + sg); plate(pb, 28, 140, mix(P.ink2, P.purple, .4), 245 + sg); plate(pc, 18, 64, P.gray, 247 + sg);
    }
  };
  return { at, draw, ang };
}

// ===================== Q 版魔理沙、小恶魔 =====================
// 两头身，(x, y) = 抱着杠铃的那一点（胸口）。layer 'back' 画身体（杠铃之前），'front' 画搭在杠上的两只手。
function s5CFace(c, t, eyeCol, expr, seed) {
  rshape(c, ellPts(0, -54, 48, 44, 40), { fill: P.skin, stroke: P.ink, w: 3.5, t, seed, amp: .7 });
  for (const sg of [-1, 1]) {
    const ex = sg * 19, ey = -48;
    if (expr === 'laugh' || expr === 'smile') rline(c, [[ex - 9, ey + 3], [ex, ey - 6], [ex + 9, ey + 3]], { w: 4.5, t, seed: seed + sg, amp: .4, smooth: true });
    else { rshape(c, ellPts(ex, ey, 8.5, 12, 20), { fill: eyeCol, stroke: P.ink, w: 3, t, seed: seed + 3 + sg, amp: .4 });
      c.fillStyle = mix(eyeCol, P.ink, .55); c.beginPath(); c.ellipse(ex, ey + 2, 4.5, 7, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 3, ey - 5, 3, 0, TAU); c.fill();
      rline(c, [[ex - 11, ey - 10], [ex, ey - 14], [ex + 11, ey - 10]], { w: 4, t, seed: seed + 5 + sg, amp: .3, smooth: true }); }
    c.save(); c.fillStyle = alpha(P.blush, .8); c.beginPath(); c.ellipse(sg * 31, -36, 8, 4, 0, 0, TAU); c.fill(); c.restore();
    for (let k = 0; k < 3; k++) rline(c, [[sg * 31 - 6 + k * 5, -33], [sg * 31 - 3 + k * 5, -39]], { w: 1.5, color: mix(P.red, P.blush, .3), seed: seed + 10 + k });
  }
  if (expr === 'laugh') { const mp = [[-10, -32], [10, -32], [8, -24], [0, -19], [-8, -24]]; rshape(c, mp, { fill: mix(P.red, P.ink, .35), stroke: P.ink, w: 3, t, seed: seed + 20, smooth: true });
    rshape(c, ellPts(0, -22.5, 4.5, 2.5), { fill: P.pink, stroke: false }); }
  else rline(c, [[-7, -31], [-3.5, -28], [0, -31], [3.5, -28], [7, -31]], { w: 3, t, seed: seed + 21, amp: .3, smooth: true });
}
function s5CLegs(c, t, sock, shoe, ph) {
  for (const sg of [-1, 1]) { const a = .38 * Math.sin(t * 4.2 + ph + (sg > 0 ? 1.8 : 0)), hp = [sg * 12, 74], f = s5Add(hp, s5Dir(a), 34);
    rline(c, [hp, f], { w: 17, color: P.ink, t, seed: 301 + sg, amp: .6 }); rline(c, [hp, f], { w: 11, color: sock, t, seed: 301 + sg, amp: .6 });
    rshape(c, ellPts(f[0] + 3, f[1] + 3, 10, 7, 16, a * -1), { fill: shoe, stroke: P.ink, w: 3, t, seed: 305 + sg }); }
}
function s5CHands(c, t, sleeve) {
  for (const sg of [-1, 1]) { rshape(c, ellPts(sg * 20, -10, 10, 8), { fill: sleeve, stroke: P.ink, w: 3, t, seed: 311 + sg }); s5Dot(c, sg * 19, -3, 9, P.skin, { t, seed: 313 + sg, w: 3 }); }
}
function s5BatWing(c, x, y, sc, flip, flap, t, seed) {
  c.save(); c.translate(x, y); c.scale(sc * flip, sc); c.rotate(-flap);
  const q = [[0, 0], [30, -34], [66, -52], [100, -40], [92, -18], [78, -26], [70, -4], [54, -16], [42, 6], [26, -6], [14, 12]];
  rshape(c, q, { fill: P.ink, stroke: P.ink, w: 3, t, seed });
  for (const e of [[66, -52], [78, -26], [54, -16], [26, -6]]) rline(c, [[4, -2], e], { w: 2.5, color: mix(P.ink, P.purple, .55), t, seed: seed + e[0] });
  c.restore();
}
function s5Marisa(c, x, y, s, t, o = {}) {
  const { layer = 'back', rot = 0, expr = 'laugh', ph = 0 } = o;
  const hair = mix(P.moon, '#fff3c4', .35), gold = mix(P.moon, P.shelf, .25), black = P.ink, dress = mix(P.ink, P.night3, .35);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (layer === 'front') { s5CHands(c, t, S5WHITE); c.restore(); return; }
  const bob = Math.sin(t * 7 + ph) * 1.5;
  rshape(c, [[-58, -80], [-66, -30], [-62, 10], [-50, 26], [-30, 14], [0, 20], [30, 14], [50, 26], [62, 10], [66, -30], [58, -80], [0, -108]], { fill: hair, stroke: P.ink, w: 3.5, t, seed: 321, smooth: true });
  s5CLegs(c, t, S5WHITE, black, ph);
  // 裙子（黑）+ 衬裙花边（白）+ 围裙（白）
  const fr = []; for (let k = 0; k <= 12; k++) { const xx = lerp(-50, 50, k / 12); fr.push([xx, 86 + (k % 2 ? 6 : 0)]); }
  rshape(c, [[-46, 72], ...fr, [46, 72]], { fill: S5WHITE, stroke: P.ink, w: 3, t, seed: 323 });
  rshape(c, [[-24, -12], [24, -12], [30, 44], [46, 78], [-46, 78], [-30, 44]], { fill: dress, stroke: P.ink, w: 3.5, t, seed: 324 });
  rshape(c, [[-17, 6], [17, 6], [22, 66], [-22, 66]], { fill: S5WHITE, stroke: P.ink, w: 3, t, seed: 325, smooth: false });
  for (let k = 0; k < 5; k++) rline(c, [[-20 + k * 10, 66], [-18 + k * 10, 72]], { w: 2, color: P.ink2, seed: 326 + k });
  for (const sg of [-1, 1]) s5Dot(c, sg * 27, -6, 13, S5WHITE, { t, seed: 331 + sg });
  // 领口蝴蝶结
  for (const sg of [-1, 1]) rshape(c, [[0, -10], [sg * 13, -18], [sg * 13, -2]], { fill: S5WHITE, stroke: P.ink, w: 2.5, t, seed: 333 + sg });
  c.translate(0, bob);
  s5CFace(c, t, P.moon, expr, 340);
  // 刘海
  rshape(c, [[-52, -52], [-54, -88], [-30, -104], [0, -108], [30, -104], [54, -88], [52, -52], [44, -70], [34, -58], [24, -78], [12, -62], [2, -80], [-10, -62], [-22, -80], [-34, -60], [-44, -74]], { fill: hair, stroke: P.ink, w: 3.5, t, seed: 351 });
  // 一侧的辫子 + 白蝴蝶结；另一侧一缕头发
  for (let k = 0; k < 5; k++) rshape(c, ellPts(-54 - k * .8, -42 + k * 15, 9, 10, 18), { fill: hair, stroke: P.ink, w: 3, t, seed: 352 + k });
  for (const sg of [-1, 1]) rshape(c, [[-57, 30], [-57 + sg * 14, 22], [-57 + sg * 14, 38]], { fill: S5WHITE, stroke: P.ink, w: 2.5, t, seed: 358 + sg });
  rshape(c, [[48, -70], [60, -40], [58, -6], [50, 4], [46, -30]], { fill: hair, stroke: P.ink, w: 3, t, seed: 360, smooth: true });
  rline(c, [[40, -84], [48, -60]], { w: 2, color: gold, seed: 361 }); rline(c, [[-38, -86], [-44, -66]], { w: 2, color: gold, seed: 362 });
  // 大尖帽：帽檐 + 帽尖（尖头往后折）+ 白色大蝴蝶结
  rshape(c, [[-46, -110], [-34, -150], [-12, -196], [16, -226], [48, -222], [30, -204], [18, -158], [44, -110]], { fill: black, stroke: P.ink, w: 3.5, t, seed: 363, smooth: true });
  rline(c, [[-6, -186], [10, -210]], { w: 3, color: mix(P.ink, '#ffffff', .25), t, seed: 364 });
  rshape(c, ellPts(0, -104, 94, 20, 40, -.08), { fill: black, stroke: P.ink, w: 3.5, t, seed: 365 });
  rline(c, [[-60, -106], [-10, -114]], { w: 3, color: mix(P.ink, '#ffffff', .25), t, seed: 366 });
  rshape(c, [[-44, -112], [-38, -126], [40, -126], [44, -112]], { fill: S5WHITE, stroke: P.ink, w: 3, t, seed: 367 });
  for (const sg of [-1, 1]) rshape(c, [[-34, -122], [-34 + sg * 26, -140], [-34 + sg * 30, -110]], { fill: S5WHITE, stroke: P.ink, w: 3, t, seed: 368 + sg, smooth: true });
  s5Dot(c, -34, -122, 6, S5WHITE, { t, seed: 371 });
  c.restore();
}
function s5Koakuma(c, x, y, s, t, o = {}) {
  const { layer = 'back', rot = 0, expr = 'smile', ph = 0 } = o;
  const hair = mix(P.red, P.ribbonRed, .5), dark = mix(hair, P.ink, .35), black = mix(P.ink, P.night3, .35);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (layer === 'front') { s5CHands(c, t, S5WHITE); c.restore(); return; }
  const flap = .18 * Math.sin(t * 6 + ph), bob = Math.sin(t * 7 + ph + 1) * 1.5;
  for (const sg of [-1, 1]) s5BatWing(c, sg * 18, 2, 1.05, sg, flap, t, 381 + sg * 5);
  rshape(c, [[-60, -80], [-68, -20], [-68, 40], [-58, 74], [-36, 62], [0, 66], [36, 62], [58, 74], [68, 40], [68, -20], [60, -80], [0, -108]], { fill: hair, stroke: P.ink, w: 3.5, t, seed: 391, smooth: true });
  s5CLegs(c, t, black, P.ink, ph + 1);
  const fr = []; for (let k = 0; k <= 12; k++) fr.push([lerp(-48, 48, k / 12), 84 + (k % 2 ? 6 : 0)]);
  rshape(c, [[-44, 70], ...fr, [44, 70]], { fill: S5WHITE, stroke: P.ink, w: 3, t, seed: 393 });
  rshape(c, [[-24, -12], [24, -12], [28, 40], [44, 78], [-44, 78], [-28, 40]], { fill: black, stroke: P.ink, w: 3.5, t, seed: 394 });
  rshape(c, [[-13, -12], [13, -12], [0, 14]], { fill: S5WHITE, stroke: P.ink, w: 3, t, seed: 395 });   // 白衬衫
  rshape(c, [[-4, -9], [4, -9], [6, 16], [0, 24], [-6, 16]], { fill: P.ribbonRed, stroke: P.ink, w: 2.5, t, seed: 396 });   // 领带
  for (const sg of [-1, 1]) { rshape(c, [[0, -12], [sg * 16, -14], [sg * 8, -2]], { fill: S5WHITE, stroke: P.ink, w: 2.5, t, seed: 397 + sg }); s5Dot(c, sg * 27, -6, 13, S5WHITE, { t, seed: 399 + sg }); }
  c.translate(0, bob);
  s5CFace(c, t, P.red, expr, 400);
  rshape(c, [[-52, -52], [-54, -90], [-30, -106], [0, -110], [30, -106], [54, -90], [52, -52], [42, -72], [30, -56], [20, -80], [8, -60], [-4, -82], [-14, -60], [-26, -80], [-36, -58], [-44, -74]], { fill: hair, stroke: P.ink, w: 3.5, t, seed: 411 });
  for (const sg of [-1, 1]) rshape(c, [[sg * 46, -72], [sg * 60, -40], [sg * 62, 10], [sg * 56, 34], [sg * 46, 6], [sg * 44, -40]], { fill: hair, stroke: P.ink, w: 3, t, seed: 412 + sg, smooth: true });
  rline(c, [[30, -92], [36, -70]], { w: 2, color: dark, seed: 415 }); rline(c, [[-24, -96], [-30, -72]], { w: 2, color: dark, seed: 416 });
  // 头上的一对小蝙蝠翼
  for (const sg of [-1, 1]) s5BatWing(c, sg * 44, -90, .5, sg, .7 + flap * 1.4, t, 417 + sg * 3);
  c.restore();
}

// ===================== 满屏：举杠铃 =====================
function s5Speed(c, cx, cy, tau, r0) {
  const tk = tick(tau, 8);
  c.save();
  for (let k = 0; k < 80; k++) { const a = k / 80 * TAU + (hash(k, tk) - .5) * .06, r1 = r0 + hash(k + 99, tk) * 120, r2 = 1400, hw = 2 + hash(k, 3) * 7;
    const ca = Math.cos(a), sa = Math.sin(a);
    c.fillStyle = alpha(P.ink, .06 + hash(k, 5) * .14); c.beginPath(); c.moveTo(cx + ca * r1, cy + sa * r1);
    c.lineTo(cx + ca * r2 - sa * hw * 6, cy + sa * r2 + ca * hw * 6); c.lineTo(cx + ca * r2 + sa * hw * 6, cy + sa * r2 - ca * hw * 6); c.fill(); }
  c.restore();
}
// 颤抖的小弧线（漫画里的「抖抖」）
function s5Shiver(c, x, y, r, tau, seed) {
  const j = noise1(twos(tau) * 9, seed) * 3;
  for (const sg of [-1, 1]) for (let k = 0; k < 2; k++) { const rr = r + k * 14, q = []; for (let i = 0; i <= 6; i++) { const a = (sg > 0 ? 0 : Math.PI) + (i / 6 - .5) * .9; q.push([x + Math.cos(a) * rr + sg * j, y + Math.sin(a) * rr]); }
    rline(c, q, { w: 3.5, color: P.ink2, t: tau, seed: seed + k + sg * 3, smooth: true }); }
}
function s5LiftShot(c, tau, Ln) {
  const [f0, f1] = S5SHOT, u = tau - f0, len = f1 - f0;
  const g = c.createRadialGradient(960, 520, 80, 960, 520, 1100); g.addColorStop(0, mix(P.paper, P.hair, .12)); g.addColorStop(.55, mix(P.paper, P.hair, .4)); g.addColorStop(1, mix(P.hair, P.night3, .45)); c.fillStyle = g; c.fillRect(0, 0, W, H);
  s5Speed(c, 960, 500, tau, 520);
  // 镜头：从帕秋莉的脸拉开，再慢慢推近；全程轻微震动，第 1 秒杠铃压下来时震得最厉害
  const zoom = key(u, [[0, 1.45], [1.0, 1.0], [len, 1.07]]), fy = key(u, [[0, 470], [1.0, 540], [len, 520]]);
  const jolt = 2 + 7 * win(.9, 1.5, u, .15);
  const sx = noise1(twos(tau) * 7, 3) * jolt, sy = noise1(twos(tau) * 7, 8) * jolt;
  c.save(); c.translate(960 + sx, 540 + sy); c.scale(zoom, zoom); c.translate(-960, -fy);
  rshape(c, ellPts(960, 985, 380, 38), { fill: alpha('#000', .35), stroke: false });
  // 帕秋莉（Q 版）：上下两截，下半截左右打颤
  const px = 960 + noise1(twos(tau) * 5, 11) * 2.5, py = 990, ch = 640, cut = py - ch * .3, leg = noise1(twos(tau) * 13, 12) * 4;
  const co = { x: px, y: py, h: ch, pose: 'lift', mood: 'sad', mouth: Ln.mouth || 0, blink: blinkAt(tau, 3), t: tau };
  c.save(); c.beginPath(); c.rect(0, cut, W, H); c.clip(); c.translate(leg, 0); drawPatchouliChibi(c, co); c.restore();
  c.save(); c.beginPath(); c.rect(0, -400, W, cut + 400); c.clip(); var hp = drawPatchouliChibi(c, co); c.restore();
  const hands = hp.hands.slice().sort((a, b) => a[0] - b[0]), head = hp.head;
  // 杠铃：先压下来（第 1 秒内），然后一抖一抖
  const drop = key(u, [[0, -26], [.9, -26], [1.15, 14], [1.4, 0]]), wig = Math.sin(u * 17) * 3 + noise1(twos(tau) * 6, 21) * 4;
  const tilt = .05 * Math.sin(u * 2.1) + .02 * noise1(u * 3, 22);
  const hl = [hands[0][0], hands[0][1] + drop + wig - tilt * 60], hr = [hands[1][0], hands[1][1] + drop + wig + tilt * 60];
  const bar = s5Barbell(c, hl, hr, 600, 26 + 8 * Math.sin(u * 9), tau);
  const ml = bar.at(-.93), mr = bar.at(.93), slope = bar.ang;
  const sw = k => .06 * Math.sin(u * 3.4 + k);
  s5Marisa(c, ml[0], ml[1], 1.25, tau, { rot: slope - .12 + sw(0), expr: 'laugh', ph: 0 });
  s5Koakuma(c, mr[0], mr[1], 1.25, tau, { rot: slope + .12 + sw(2), expr: 'smile', ph: 2 });
  bar.draw();
  s5Marisa(c, ml[0], ml[1], 1.25, tau, { rot: slope - .12 + sw(0), layer: 'front' });
  s5Koakuma(c, mr[0], mr[1], 1.25, tau, { rot: slope + .12 + sw(2), layer: 'front' });
  for (const h of [hl, hr]) { s5Dot(c, h[0], h[1] - 4, 17, P.skin, { t: tau, seed: 431, w: 4 }); rline(c, [[h[0] - 8, h[1] - 12], [h[0] - 8, h[1] + 4]], { w: 2.5, t: tau, seed: 432 }); rline(c, [[h[0] + 3, h[1] - 13], [h[0] + 3, h[1] + 4]], { w: 2.5, t: tau, seed: 433 }); }
  // 汗：头两侧挂着，外加一颗颗往外甩
  const hs = ch / 300;
  for (const sg of [-1, 1]) s5Drop(c, head[0] + sg * 78 * hs, head[1] + 8 * hs + Math.sin(tau * 3 + sg) * 3, 9 * hs, sg * .2, tau, 441 + sg);
  for (let k = 0; k < 6; k++) { const q = (u * 1.3 + k / 6) % 1, sg = k % 2 ? 1 : -1, a = .6 + hash(k, 4) * .6;
    s5Drop(c, head[0] + sg * (60 + 240 * q) * Math.cos(a) * hs * .5, head[1] - 40 * hs - (170 * q - 260 * q * q) * hs * .5, 7 * hs * (1 - q * .5), sg * (.4 + q), tau, 450 + k); }
  // 鼻子里喷出的一口气
  const pq = (u * .9) % 1; s5Puff(c, head[0] - 70 * hs - pq * 60, head[1] + 30 * hs, 18 + 16 * pq, tau, { al: 1 - pq, seed: 461 });
  // 抖抖
  s5Shiver(c, px, py - 90, 170, tau, 471); s5Shiver(c, ml[0], ml[1] - 40, 120, tau, 481); s5Shiver(c, mr[0], mr[1] - 40, 120, tau, 491);
  const bob = Math.sin(u * 5) * 6;
  fade(c, sm(1.3, 1.6, u), () => {
    zh(c, '哈哈哈', ml[0] - 30, ml[1] - 330 + bob, { size: 44, align: 'center', color: P.moon, outline: P.ink, ow: 8 });
    zh(c, '加油～', mr[0] + 20, mr[1] - 330 - bob, { size: 44, align: 'center', color: P.pink, outline: P.ink, ow: 8 });
  });
  c.restore();
  // 「姆Q……」大字：一个字一个字砸下来，然后跟着发抖
  const chars = ['姆', 'Q', '…', '…'], size = 150;
  let xx = 960 - 360;
  chars.forEach((chr, k) => {
    const t0 = .35 + k * .18, kk = s5Pop(tau - f0, t0, .35);
    const cw = chr === '…' ? size * 1.0 : size * .95, jx = noise1(twos(tau) * 11, 500 + k) * 5, jy = noise1(twos(tau) * 11, 520 + k) * 5;
    if (kk > 0) pop(c, xx + cw / 2, 180, kk, () => zh(c, chr, xx + cw / 2 + jx, 225 + jy + (k > 1 ? -10 : 0), { size, align: 'center', color: mix(P.hair, '#ffffff', .35), outline: P.ink, ow: 18 }));
    xx += cw;
  });
  // 切进来时闪一下
  const fl = 1 - sm(0, .25, u); if (fl > 0) { c.fillStyle = alpha(S5WHITE, fl * .7); c.fillRect(0, 0, W, H); }
}

// ===================== 讲台各组 =====================
const S5B = { x: 740, y: 190, w: 1090, h: 630, cx: 1285 };   // 魔导书页内容区
function s5Title(c, tau) {
  const a = s5Vis(tau, .4, S5DUR - .5); if (a <= 0) return;
  const p = writeP(tau, .4, '运动', .15), tw = zhWidth(c, '运动', 52);
  fade(c, a, () => { zh(c, '运动', 1285, 144, { size: 52, align: 'center', p });
    rline(c, [[1285 - tw / 2 - 20, 166], [1285 + tw / 2 + 20, 166]], { w: 3, color: P.paperEdge, seed: 16, t: tau, p: sm(.5, .9, tau) }); });
}
// L1：状态面板 + 吸入器
function s5G1(c, tau) {
  const t0 = S5LINES[0][0], a = s5Vis(tau, t0 - .3, S5LINES[1][0]); if (a <= 0) return;
  fade(c, a, () => {
    pop(c, 1100, 385, s5Pop(tau, t0 - .3), () => s5StatPanel(c, 780, 225, 640, 330, tau, t0));
    const tr = t0 + 2.4, k = s5Pop(tau, tr);
    if (k > 0) { zh(c, '体力：只剩 1 格', 1100, 650, { size: 48, align: 'center', color: P.red, p: writeP(tau, tr, '体力：只剩 1 格') }); }
    const ti = s5At(0, '反面教材', -.2), ki = s5Pop(tau, ti, .5);
    pop(c, 1620, 520, ki, () => {
      const pu = ((tau - ti) % 1.6) / 1.6;
      s5Inhaler(c, 1640 + Math.sin(tau * 2) * 4, 520, 1.45, tau, { puff: tau > ti + .6 ? sm(0, .6, pu) * (1 - sm(.7, 1, pu)) : 0 });
      zh(c, '哮喘吸入器', 1600, 640, { size: 36, align: 'center', color: P.ink2 });
      zh(c, '（随身带）', 1600, 684, { size: 32, align: 'center', color: P.ink2 });
    });
  });
}
// L2：五个有氧小人 + 大脑
function s5G2(c, tau) {
  const t0 = S5LINES[1][0], a = s5Vis(tau, t0, S5LINES[2][0]); if (a <= 0) return;
  const kinds = [['快走', s5Walker], ['慢跑', s5Jogger], ['骑车', s5Biker], ['游泳', s5Swimmer], ['打球', s5Baller]];
  const tLit = s5At(1, '打球', .7);
  fade(c, a, () => {
    const lit = sm(tLit + .3, tLit + .7, tau);
    const ty = s5At(1, '有氧'), mvb = sm(ty - .35, ty + .15, tau), bx = lerp(1285, 1560, mvb), by = lerp(470, 330, mvb), br = lerp(150, 96, mvb);
    pop(c, bx, by, s5Pop(tau, t0 + .1, .5), () => { s5Brain(c, bx, by + Math.sin(tau * 2) * 4, br, tau, lit);
      zh(c, '大脑', bx, by + br + 52, { size: lerp(48, 36, mvb), align: 'center', color: P.ink2 }); }); if (tau > ty) zh(c, '有氧', 1060, 362, { size: 88, align: 'center', color: P.green, p: writeP(tau, ty, '有氧', .12) });
    if (tau > tLit) arrow(c, [1170, 330], [1420, 330], { w: 7, color: P.moon, p: sm(tLit, tLit + .4, tau), head: 26, t: tau, seed: 501 });
    // 小人一排，底下的括号把它们连到「有氧」
    const tb = s5At(1, '快走', -.2);
    rline(c, [[775, 525], [775, 505], [1795, 505], [1795, 525]], { w: 4, color: P.green, p: sm(tb, tb + .6, tau), t: tau, seed: 502 });
    rline(c, [[1060, 505], [1060, 400]], { w: 4, color: P.green, p: sm(tb + .4, tb + .7, tau), t: tau, seed: 503 });
    kinds.forEach(([lab, fn], k) => {
      const tk = s5At(1, lab, -.1), kk = s5Pop(tau, tk, .45), cx = S5B.x + S5B.w * (k + .5) / 5, gy = 730;
      pop(c, cx, gy - 60, kk, () => {
        rshape(c, ellPts(cx, gy + 4, 70, 10), { fill: alpha(P.ink, .12), stroke: false });
        fn(c, cx, gy, 1.25, tau - tk);
        zh(c, lab, cx, 800, { size: 40, align: 'center' });
      });
      if (lit > 0) sparkle(c, cx + 50, gy - 150, 12 * lit * (.7 + .3 * Math.sin(tau * 6 + k)), { color: P.moon });
    });
  });
}
// L3–L4：周历 + 150 分钟 + 每天 20 分钟 + 力量 2 天
function s5G3(c, tau) {
  const t0 = S5LINES[2][0], t4 = S5LINES[3][0], a = s5Vis(tau, t0, S5SHOT[0]); if (a <= 0) return;
  const cx0 = 790, cw = 1000, cy0 = 240, chh = 230, colW = cw / 7;
  const tGrow = t0 + .25, tSplit = s5At(2, '拆开', -.1);
  const fills = [], strong = [];
  for (let k = 0; k < 7; k++) { const ts = tSplit + .1 + k * .12; fills.push(sm(ts + .35, ts + .6, tau)); }
  const td = [s5At(3, '两天', 0), s5At(3, '两天', .35)];
  strong[1] = s5Pop(tau, td[0]); strong[4] = s5Pop(tau, td[1]);
  fade(c, a, () => {
    pop(c, 1285, cy0 + chh / 2, s5Pop(tau, t0, .45), () => s5Calendar(c, cx0, cy0, cw, chh, tau, fills, strong));
    // 一整条「150 分钟」绿色长条，说到「拆开」时断成 7 段飞进格子
    const grow = sm(tGrow, tGrow + 1.3, tau, easeOut), n = Math.round(150 * grow);
    for (let k = 0; k < 7; k++) {
      const ts = tSplit + .1 + k * .12, f = sm(ts, ts + .45, tau), segX = cx0 + k * colW;
      if (tau > ts + .45) continue;
      const x0 = cx0, x1 = cx0 + cw * grow;
      const sx = Math.max(segX, x0) + 4, ex = Math.min(segX + colW, x1) - 4; if (ex <= sx) continue;
      const yy = lerp(612, cy0 + chh - 50, easeIn(f)), sc = lerp(1, .6, f);
      rshape(c, rectPts(sx + (ex - sx) * (1 - sc) / 2, yy, (ex - sx) * sc, 40 * sc, 8), { fill: P.green, stroke: mix(P.green, P.ink, .4), w: 3, t: tau, seed: 511 + k, al: 1 - f * .3 });
    }
    // 大字：L3 在中间，L4 缩到左边
    const mv = sm(t4, t4 + .5, tau), tx = lerp(1285, 1000, mv), ty = lerp(580, 575, mv), sz = lerp(76, 52, mv);
    if (tau > tGrow) { const k = 1 + .12 * Math.sin(clamp((tau - tGrow - 1.3) / .3, 0, 1) * Math.PI);
      pop(c, tx, ty - 20, k, () => s5Words(c, [['每周 ', P.ink], [`${n}`, n >= 150 ? P.green : P.ink], [' 分钟', P.ink]], tx, ty, { size: sz }));
      if (mv > 0) fade(c, mv, () => { rshape(c, rectPts(tx - 48, 490, 96, 46, 12), { fill: P.green, stroke: P.ink, w: 3, t: tau, seed: 521 }); zh(c, '有氧', tx, 525, { size: 34, align: 'center', color: S5WHITE }); }); }
    const tDay = s5At(2, '一天', .2);
    if (tau > tDay) { const x2 = lerp(1285, 1000, mv), y2 = lerp(700, 660, mv), s2 = lerp(56, 42, mv);
      s5Words(c, [['≈ 每天 ', P.ink2], ['20 分钟', P.orange]], x2, y2, { size: s2, p: writeP(tau, tDay, '≈ 每天 20 分钟', .05) });
      const uw = zhWidth(c, '20 分钟', s2), tot = zhWidth(c, '≈ 每天 20 分钟', s2);
      rline(c, [[x2 + tot / 2 - uw, y2 + 14], [x2 + tot / 2, y2 + 14]], { w: 5, color: P.moon, p: sm(tDay + .6, tDay + 1, tau), t: tau, seed: 531 }); }
    // L4：力量 × 2 天 + WHO 2020
    if (tau > td[0]) {
      const kk = s5Pop(tau, td[0] + .5, .45);
      pop(c, 1560, 560, kk, () => { s5Dumbbell(c, 1360, 560 + Math.sin(tau * 5) * 3, 1.1, -.2, tau, P.orange);
        s5Words(c, [['力量 ', P.ink], ['× 2 天', P.orange]], 1620, 580, { size: 60 }); zh(c, '每周两天以上', 1620, 650, { size: 36, align: 'center', color: P.ink2 }); });
    }
    const tw = t4 + .2; if (tau > tw) fade(c, sm(tw, tw + .3, tau), () => { rline(c, [[1650, 770], [1810, 770]], { w: 2, color: P.faint, t: tau, seed: 541 }); zh(c, 'WHO 2020', 1810, 808, { size: 32, align: 'right', color: P.ink2 }); });
  });
}
// 坐着的学生（L6 被划掉，L7 站起来）。stand 0 坐 → 1 站
function s5Sitter(c, x, gy, s, tau, stand, face) {
  s5Chair(c, x, gy, s, tau);
  const sitHip = [x - 4 * s, gy - 70 * s], upHip = [x + 80 * s, gy - 48 * s], k = easeIO(stand), hop = Math.sin(k * Math.PI) * 26 * s;
  const hip = [lerp(sitHip[0], upHip[0], k), lerp(sitHip[1], upHip[1], k) - hop];
  const book = (cc, h) => { cc.save(); cc.translate(h[0] + 4, h[1] - 4); cc.rotate(-.5); rshape(cc, rectPts(-4, -16, 26, 20, 3), { fill: P.blue, stroke: P.ink, w: 3, t: tau, seed: 551 }); cc.restore(); };
  s5Kid(c, hip[0], hip[1], s, { t: tau, lean: lerp(-.04, 0, k), lF: [lerp(1.45, -.05, k), lerp(-1.45, 0, k)], lB: [lerp(1.35, .05, k), lerp(-1.35, 0, k)],
    aF: [lerp(.9, Math.PI - 1.1, k), lerp(.9, .75, k)], aB: [lerp(.7, Math.PI + 1.1, k), lerp(.8, -.75, k)], shirt: P.teal, face, seed: 21, prop: k < .3 ? book : null });
}
// L6：椅子被划掉；任何活动 > 一直坐着
function s5G6(c, tau) {
  const t0 = S5LINES[5][0], t1 = S5LINES[6][0], a = s5Vis(tau, t0, S5LINES[7][0] - .02); if (a <= 0) return;
  const mv = sm(t1, t1 + .5, tau), cx = lerp(960, 880, mv), stand = sm(s5At(6, '起来', -.1), s5At(6, '起来', .4), tau);
  fade(c, a, () => {
    pop(c, cx, 690, s5Pop(tau, t0 + .05), () => {
      s5Sitter(c, cx, 780, 1.35, tau, stand, stand > .5 ? 'joy' : 'sleepy');
      if (stand < .3 && tau < t1) { const zq = (tau * .7) % 1; zh(c, 'z', cx + 40 + zq * 30, 540 - zq * 50, { size: 32 + zq * 14, color: P.ink2, al: 1 - zq }); }
      if (stand > .2) { const kk = s5Pop(tau, s5At(6, '起来', .2), .3) * (1 - sm(s5At(6, '起来', 1.2), s5At(6, '起来', 1.4), tau)); pop(c, cx + 150, 480, kk, () => zh(c, '！', cx + 150, 500, { size: 64, align: 'center', color: P.moon, outline: P.ink, ow: 6 })); }
    });
    // L6 独有：红叉、右边的活动小人、比较式
    const b = 1 - sm(t1 - .25, t1, tau);
    if (b > 0 && tau < t1) fade(c, b, () => {
      const tx = s5At(5, '少坐', -.1);
      if (tau > tx) { cross(c, 960, 640, 250, { p: sm(tx, tx + .5, tau), t: tau, w: 18 }); }
      zh(c, '一直坐着', 960, 815, { size: 36, align: 'center', color: P.red, al: sm(tx + .3, tx + .6, tau) });
      const ta = s5At(5, '任何强度', -.1);
      pop(c, 1600, 660, s5Pop(tau, ta, .45), () => {
        s5Walker(c, 1480, 760, 1.05, tau);
        const st = Math.sin(tau * 3) * .15;
        s5Kid(c, 1620, 760 - 48 * 1.05, 1.05, { t: tau, lean: st, aF: [Math.PI - 1.1, .75], aB: [Math.PI + 1.1, -.75], shirt: P.pink, face: 'happy', seed: 31 });
        // 爬楼梯
        rline(c, [[1690, 760], [1690, 730], [1730, 730], [1730, 700], [1770, 700], [1770, 670], [1810, 670], [1810, 760]], { w: 4, t: tau, seed: 561 });
        const g2 = s5Gait(tau, 1.2, .5, 1, .5, .6); s5Kid(c, 1752, 700 - 50 * .9, .9, { t: tau, ...g2, lean: .15, shirt: P.orange, face: 'joy', seed: 41 });
        zh(c, '任何活动', 1640, 815, { size: 36, align: 'center', color: P.green });
      });
      const tc = s5At(5, '都比', -.1);
      if (tau > tc) s5Words(c, [['任何活动', P.green], [' ＞ ', P.moon], ['一直坐着', P.red]], 1285, 300, { size: 64, p: writeP(tau, tc, '任何活动 ＞ 一直坐着', .06) });
      pop(c, 1310, 640, s5Pop(tau, tc + .3), () => zh(c, '＞', 1310, 680, { size: 130, align: 'center', color: P.moon, outline: P.ink, ow: 6 }));
    });
  });
}
// L7：沙漏 1 小时 → 三张小卡片：接水、走两圈、伸懒腰
function s5G7(c, tau) {
  const t0 = S5LINES[6][0], a = s5Vis(tau, t0, S5LINES[7][0] - .02); if (a <= 0) return;
  const tsand = [t0 + .15, s5At(6, '起来', -.15)];
  fade(c, a, () => {
    pop(c, 880, 330, s5Pop(tau, t0 + .05), () => {
      const p = sm(tsand[0], tsand[1], tau, x => x), done = tau > tsand[1];
      s5Hourglass(c, 860, 330, 190, p, tau, { spin: done ? Math.sin(clamp(tau - tsand[1], 0, .4) / .4 * Math.PI) * .12 : 0 });
      zh(c, '1 小时', 960, 330, { size: 44, color: done ? P.red : P.ink });
      if (done) { const kk = s5Pop(tau, tsand[1], .3) * (1 - sm(tsand[1] + .8, tsand[1] + 1, tau)); pop(c, 860, 220, kk, () => zh(c, '叮！', 860, 222, { size: 44, align: 'center', color: P.moon, outline: P.ink, ow: 6 })); }
    });
    const labs = ['接水', '走两圈', '伸懒腰'], words = ['接杯水', '走两圈', '伸个懒腰'];
    labs.forEach((lab, k) => {
      const tk = Math.max(s5At(6, words[k], -.15), tsand[1] + .25 + k * .55), kk = s5Pop(tau, tk, .45), cx = 1250 + k * 225, u = tau - tk;
      pop(c, cx, 540, kk, () => {
        rshape(c, rectPts(cx - 102, 290, 204, 500, 18), { fill: mix(P.paper, '#ffffff', .45), stroke: P.ink, w: 4, t: tau, seed: 571 + k });
        rshape(c, circPts(cx - 72, 322, 22, 24), { fill: P.moon, stroke: P.ink, w: 3, t: tau, seed: 575 + k });
        zh(c, `${k + 1}`, cx - 72, 334, { size: 32, align: 'center', color: P.ink });
        zh(c, lab, cx, 770, { size: 40, align: 'center' });
        const gy = 700;
        if (k === 0) {   // 接水：杯子接满，然后举起来喝
          const lv = sm(.3, 1.4, u, x => x), drink = sm(1.6, 2, u);
          s5Dispenser(c, cx - 40, gy, 1.05, tau, 1 - lv * .15);
          const hand = [lerp(-58, -12, drink), lerp(-2, -58, drink)];
          s5Kid(c, cx + 50, gy - 48, 1.1, { t: tau, dir: -1, handF: hand, aB: [.2, .3], shirt: P.teal, face: drink > .5 ? 'happy' : 'wow', seed: 21,
            prop: (cc, h) => { cc.save(); cc.translate(h[0], h[1] + 12); cc.rotate(drink * 1.2); s5Cup(cc, 0, 0, 1, lv, tau); cc.restore(); } });
          if (lv > 0 && lv < 1 && drink === 0) rline(c, [[cx - 40 + 30, gy - 58], [cx - 40 + 30 + 2, gy - 34]], { w: 4, color: P.blue, t: tau, seed: 581 });
        } else if (k === 1) {   // 走两圈：沿椭圆走，右上角数圈
          const ecx = cx, ecy = 610, rx = 70, ry = 40;
          rline(c, ellPts(ecx, ecy, rx, ry, 40), { w: 3, color: P.faint, close: true, dash: [10, 10], t: tau, seed: 591 });
          const pr = clamp(u / 2.6, 0, 1), th = Math.PI / 2 + pr * 2 * TAU, px = ecx + Math.cos(th) * rx, py = ecy + Math.sin(th) * ry, dr = -Math.sin(th) >= 0 ? 1 : -1;
          const g2 = s5Gait(tau, 1.3, .42, .5, .45, .35);
          s5Kid(c, px, py - (48 + g2.bob * 3) * .85, .85, { t: tau, ...g2, dir: dr, shirt: P.teal, face: 'happy', seed: 21 });
          const laps = Math.min(2, Math.floor(pr * 2 + 1e-6));
          if (laps > 0) { const kl = s5Pop(tau, tk + laps * 1.3, .3); pop(c, cx + 60, 330, kl, () => zh(c, `×${laps}`, cx + 60, 344, { size: 40, align: 'center', color: P.green })); }
        } else {   // 伸懒腰
          const st = Math.sin(u * 2.4), up = sm(0, .4, u);
          s5Kid(c, cx, gy - 48 * 1.15, 1.15, { t: tau, lean: st * .12, aF: [lerp(.3, Math.PI - 1.05 + .1 * st, up), lerp(.1, .75, up)], aB: [lerp(-.3, Math.PI + 1.05 + .1 * st, up), lerp(-.1, -.75, up)], shirt: P.teal, face: 'happy', seed: 21 });
          for (let j = 0; j < 3; j++) sparkle(c, cx + Math.cos(j * 2.1 + u) * 70, 470 + Math.sin(j * 2.1 + u) * 30, 10 + 5 * Math.sin(u * 5 + j), { color: P.moon });
          rline(c, [[cx - 60, 420], [cx - 75, 400]], { w: 3, color: P.ink2, t: tau, seed: 601, al: up }); rline(c, [[cx + 60, 420], [cx + 75, 400]], { w: 3, color: P.ink2, t: tau, seed: 602, al: up });
        }
      });
    });
  });
}
// L8：「借口」对比 + 作业小结
function s5G8(c, tau) {
  const t0 = S5LINES[7][0], a = s5Vis(tau, t0, S5DUR - .5); if (a <= 0) return;
  fade(c, a, () => {
    pop(c, 970, 420, s5Pop(tau, t0 + .05), () => {
      rshape(c, rectPts(770, 240, 400, 360, 18), { fill: mix(P.paper, P.purple, .08), stroke: P.ink, w: 4, t: tau, seed: 611 });
      s5Inhaler(c, 1000, 470, 1.2, tau, { puff: sm(0, .5, (tau * .6) % 1) * (1 - sm(.6, .9, (tau * .6) % 1)) });
      zh(c, '我：哮喘', 970, 570, { size: 44, align: 'center', color: P.ink2 });
    });
    const tb = s5At(7, '你们', -.1);
    pop(c, 1600, 420, s5Pop(tau, tb), () => {
      rshape(c, rectPts(1410, 240, 400, 360, 18), { fill: mix(P.paper, P.green, .08), stroke: P.ink, w: 4, t: tau, seed: 612 });
      const j = Math.abs(Math.sin(tau * 5)) * 12;
      s5Kid(c, 1615, 470 - j, 1.3, { t: tau, aF: [Math.PI - 1.15, .8], aB: [Math.PI + 1.15, -.8], lF: [-.2, 0], lB: [.2, 0], shirt: P.orange, face: 'joy', seed: 51 });
      zh(c, '你们：', 1428, 570, { size: 44, color: P.ink2 });
    });
    zh(c, 'VS', 1285, 440, { size: 56, align: 'center', color: P.moon, outline: P.ink, ow: 6, al: sm(tb, tb + .3, tau) });
    const ts = s5At(7, '没有', .1), ks = tau < ts ? 0 : lerp(1.8, 1, easeOutBack(clamp((tau - ts) / .3, 0, 1)));
    if (ks > 0) pop(c, 1672, 552, ks, () => { c.save(); c.translate(1672, 552); c.rotate(-.12);
      rline(c, rectPts(-132, -46, 264, 84, 14), { w: 7, color: P.red, close: true, t: tau, seed: 621 });
      zh(c, '没有借口！', 0, 16, { size: 48, align: 'center', color: P.red }); c.restore(); });
    // 小结三条
    const items = [['有氧 150′/周', 0], ['力量 2 天/周', 1], ['每小时动一动', 2]];
    items.forEach(([txt, k]) => {
      const tk = ts + .6 + k * .35, kk = s5Pop(tau, tk, .4), x = 760 + k * 355;
      pop(c, x + 170, 710, kk, () => {
        rshape(c, rectPts(x, 670, 340, 84, 20), { fill: S5WHITE, stroke: P.ink, w: 3.5, t: tau, seed: 631 + k });
        if (k === 0) s5Shoe(c, x + 50, 730, .7, tau); else if (k === 1) s5Dumbbell(c, x + 48, 712, .6, -.2, tau, P.orange); else s5Hourglass(c, x + 46, 712, 60, .5, tau);
        zh(c, txt, x + 98, 725, { size: 34 });
      });
    });
  });
}

scene({ order: 5, key: 'exercise', title: '运动', dur: S5DUR, lines: S5LINES,
  fn(c, tau, L) {
    if (tau >= S5SHOT[0] && tau < S5SHOT[1]) { s5LiftShot(c, tau, L); return; }
    libraryBg(c, tau);
    // 镜头：每句台词慢慢推近书页一点，换句时退回
    let push = 0;
    for (let i = 0; i < S5LINES.length; i++) { const nx = i + 1 < S5LINES.length ? S5LINES[i + 1][0] : S5DUR - 1.1;
      push += sm(S5LINES[i][0], S5LINES[i][1] + .25, tau, easeSine) * (1 - sm(nx, nx + .5, tau)); }
    const z = 1 + .028 * push;
    c.save(); c.translate(1285, 465); c.scale(z, z); c.translate(-1285, -465);
    board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau });
    s5Title(c, tau);
    s5G1(c, tau); s5G2(c, tau); s5G3(c, tau); s5G6(c, tau); s5G7(c, tau); s5G8(c, tau);
    // 帕秋莉的姿势跟着台词走
    const T = S5LINES, cough = [T[7][0] - .85, T[7][0] + .05];
    let li = -1; for (let i = 0; i < T.length; i++) if (tau >= T[i][0]) li = i;
    const poses = ['tired', 'point', 'lecture', 'shrug', 'lecture', 'point', 'lecture', 'point'];
    let pose = li < 0 ? 'lecture' : poses[li], mood, x = STAGE.char.x, y = STAGE.char.y;
    if (tau >= cough[0] && tau < cough[1]) { pose = 'tired'; mood = 'annoyed';
      for (const tc of [cough[0] + .05, cough[0] + .5]) { const q = tau - tc; if (q > 0 && q < .15) { x += 5 * Math.sin(q * 60); y += 4; } } }
    if (tau > S5DUR - .5) { pose = 'lecture'; mood = 'normal'; }
    stageChar(c, tau, L, { pose, x, y, gesture: L.talking ? 1 : .5, ...(mood ? { mood } : {}) });
    // 咳嗽的两朵小云
    [cough[0] + .05, cough[0] + .5].forEach((tc, k) => { const q = tau - tc; if (q > 0 && q < 1.1) s5Puff(c, 560 + k * 50 + q * 60, 400 - k * 50 - q * 40, 34 + q * 12, tau, { al: 1 - sm(.6, 1.1, q), text: '咳', seed: 641 + k }); });
    if (li >= 0 && li < 1 && tau > T[0][0] + 2.6) s5Drop(c, 520, 330 + ((tau - T[0][0]) % 1.2) * 20, 12, .2, tau);
    c.restore();
    chapterTag(c, tau, '第五页 · 运动');
  } });
