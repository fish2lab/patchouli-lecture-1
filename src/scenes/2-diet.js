'use strict';
// 第 2 段：吃饭。
// 画面：L1 天平「吃什么 = 什么时候吃」→ L2–L3 满屏小鼠实验（两个笼子、钟、奶酪、跑轮）
//      → L4–L6 一天的进食时间轴 + 跟着时间走的小胃 → L7 时间轴变成周一到周五（稳定 vs 倒时差）
//      → L8 不算开饭的饮料 → L9–L10 肠道和小菌、多样性刻度 → L11 这样吃 → L12 医生便签。
// 顶层名字一律带本段前缀 S2 / s2。
const S2LINES = seq(1.0, [
  ['第二页：吃饭。吃什么重要，什么时候吃同样重要。', { hold: .5 }],
  ['2012 年有个小鼠实验：一组随时能吃，一组只在固定 8 小时里吃。', { pause: .7, hold: .9 }],
  ['结果就算吃的是高脂饲料，限时组也更健康。', { mood: 'surprised', hold: 1.7 }],
  ['给大学生的入门版：起床后 1 小时内先不吃，', { pause: .6, hold: .4 }],
  ['睡前 2 到 3 小时，不再进食。', { hold: .6 }],
  ['凌晨一点的炸鸡外卖……嗯，你懂的。', { mood: 'annoyed', hold: .9 }],
  ['更重要的是：每天吃饭的时间要稳定，别让肠胃天天倒时差。', { hold: 1.1 }],
  ['白水、茶、不加糖的咖啡不算“开饭”；一勺糖就算。', { hold: .9 }],
  ['再说说肠道里的小居民：菌群。越多样，一般越健康。', { hold: .8 }],
  ['实验里，每天吃天然发酵食品的人，菌群更多样，炎症指标也降了。', { hold: 1.1 }],
  ['无糖酸奶、泡菜、纳豆都算。点外卖加份蔬菜粗粮，少点奶茶。', { mood: 'smile', hold: 1.1 }],
  ['胃不好、或者有进食方面困扰的同学，先问医生，别硬饿。', { hold: 1.1 }],
]);
const S2DUR = seqEnd(S2LINES) + 1.0;
const S2T = i => S2LINES[i][0], S2E = i => S2LINES[i][1];
// 第 i 句的第 n 个字大约什么时候说到（和 mouthAt 的节奏一致：每字 0.16 秒）
const s2ch = (i, n) => S2LINES[i][0] + n * .16;
// 满屏镜头的进出：in0→in1 推进魔导书页，out0→out1 拉回讲台
const S2FS = { in0: S2T(1) - .72, in1: S2T(1) - .04, out0: S2E(2) + .05, out1: S2E(2) + .75 };
// 黑板标题：[出现, 消失, 文字]
const S2TITLES = [
  [.45, S2FS.in0 - .05, '吃饭'],
  [S2FS.out1 - .05, S2T(6) - .02, '什么时候吃 · 入门版'],
  [S2T(6), S2T(7) - .02, '时间要稳定'],
  [S2T(7), S2T(8) - .02, '什么不算“开饭”'],
  [S2T(8), S2T(10) - .02, '肠道里的小居民'],
  [S2T(10), S2T(11) - .02, '这样吃'],
  [S2T(11), S2DUR - .6, '一句提醒'],
];
const S2BX = 1285;                   // 魔导书页中线
const s2lin = x => x;
// 弹出进度：t0 起 d 秒 easeOutBack；t1 前 0.22 秒干脆缩没
const s2pop = (tau, t0, d = .45) => tau < t0 ? 0 : easeOutBack(clamp((tau - t0) / d, 0, 1));
const s2k = (tau, t0, t1, d = .45) => s2pop(tau, t0, d) * (1 - sm(t1 - .22, t1, tau, easeIn));

// ===================== 通用小道具 =====================
function s2Title(c, tau) {
  for (const [a, b, text] of S2TITLES) {
    if (tau < a || tau > b) continue;
    const al = 1 - sm(b - .2, b, tau), p = writeP(tau, a, text, .06), w = zhWidth(c, text, 52);
    fade(c, al, () => {
      zh(c, text, S2BX, 144, { size: 52, align: 'center', p });
      rline(c, [[S2BX - w / 2 - 20, 166], [S2BX + w / 2 + 20, 166]], { w: 3, color: P.paperEdge, seed: 16, t: tau, p: sm(a + .15, a + .6, tau) });
    });
  }
}
// 盖章：u 是 0..1 的线性进度（从大砸下来）
function s2Stamp(c, x, y, text, color, u, rot, t, size = 50) {
  if (u <= 0) return;
  const w = zhWidth(c, text, size) + 64, h = size + 40, sc = 1 + .9 * (1 - easeOut(clamp(u, 0, 1)));
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc); c.globalAlpha *= sm(0, .35, u);
  rshape(c, rectPts(-w / 2, -h / 2, w, h, 16), { fill: alpha('#ffffff', .8), stroke: color, w: 6, seed: 101, t });
  rline(c, rectPts(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 10), { close: true, w: 2.5, color, seed: 102, t });
  zh(c, text, 0, size * .36, { size, align: 'center', color });
  c.restore();
}
function s2Star(c, x, y, r, rot, color, t, al = 1) {
  if (r <= 0 || al <= 0) return;
  rshape(c, starPts(x, y, r, 5, .48, rot), { fill: color, stroke: mix(color, P.ink, .45), w: 2.5, seed: 7, t, al });
}
function s2Bracket(c, x0, x1, y, o = {}) {
  rline(c, [[x0, y + 14], [x0, y], [x1, y], [x1, y + 14]], { w: 4, color: P.ink2, seed: 33, ...o });
}
function s2Sun(c, x, y, r, t) {
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t * .6; rline(c, [[x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3], [x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75]], { w: 4, color: P.orange, seed: 40 + k, t }); }
  rshape(c, circPts(x, y, r), { fill: P.sun, stroke: P.orange, w: 3.5, seed: 48, t });
}
function s2Steam(c, x, y, t, n = 2, al = .55) {
  for (let k = 0; k < n; k++) {
    const pts = []; for (let i = 0; i <= 10; i++) pts.push([x + (k - (n - 1) / 2) * 24 + 7 * Math.sin(i * .7 + t * 3 + k * 2), y - i * 7]);
    rline(c, pts, { w: 3.5, color: P.ink2, al: al * (.6 + .4 * Math.sin(t * 2 + k)), seed: 90 + k, t, smooth: true });
  }
}
function s2Arrow(c, x, y, s, dir, color, t) {   // 粗的小箭头 dir 1 向下 -1 向上
  rshape(c, [[x - s * .22, y - dir * s * .5], [x + s * .22, y - dir * s * .5], [x + s * .22, y], [x + s * .5, y], [x, y + dir * s * .55], [x - s * .5, y], [x - s * .22, y]], { fill: color, stroke: mix(color, P.ink, .4), w: 3, seed: 55, t });
}

// ===================== L1：天平 =====================
function s2Rice(c, x, y, s, t) {   // 饭碗，(x, y) 碗底
  c.save(); c.translate(x, y); c.scale(s, s);
  rline(c, [[20, -70], [70, -130]], { w: 6, color: P.shelf2, seed: 3, t }); rline(c, [[34, -64], [90, -118]], { w: 6, color: P.shelf2, seed: 4, t });
  rshape(c, [[-62, -60], [-40, -84], [-10, -92], [22, -88], [52, -78], [64, -60]], { fill: '#ffffff', stroke: P.ink, w: 3.5, seed: 5, t, smooth: true });
  rshape(c, [[-72, -62], [72, -62], [58, -22], [30, 0], [-30, 0], [-58, -22]], { fill: P.blue, stroke: P.ink, w: 4, seed: 6, t, smooth: true });
  rline(c, [[-62, -40], [62, -40]], { w: 4, color: P.paper, seed: 8, t, dash: [10, 9] });
  c.restore();
}
function s2Alarm(c, x, y, r, t) {  // 闹钟，(x, y) 钟心
  rline(c, [[x - r * .6, y + r * .75], [x - r * .85, y + r * 1.15]], { w: 6, color: P.ink, seed: 12, t });
  rline(c, [[x + r * .6, y + r * .75], [x + r * .85, y + r * 1.15]], { w: 6, color: P.ink, seed: 13, t });
  rshape(c, ellPts(x - r * .62, y - r * .88, r * .34, r * .24, 20, -.6), { fill: P.sun, stroke: P.ink, w: 3.5, seed: 14, t });
  rshape(c, ellPts(x + r * .62, y - r * .88, r * .34, r * .24, 20, .6), { fill: P.sun, stroke: P.ink, w: 3.5, seed: 15, t });
  rshape(c, circPts(x, y, r), { fill: P.red, stroke: P.ink, w: 4, seed: 16, t });
  rshape(c, circPts(x, y, r * .8), { fill: '#fffaf0', stroke: false, seed: 17, t });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; rline(c, [[x + Math.cos(a) * r * .66, y + Math.sin(a) * r * .66], [x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .74]], { w: 3, color: P.ink2, seed: 18 + k, amp: .4 }); }
  const m = t * 1.4, hh = t * .12;
  rline(c, [[x, y], [x + Math.sin(hh) * r * .4, y - Math.cos(hh) * r * .4]], { w: 6, color: P.ink, seed: 31, t });
  rline(c, [[x, y], [x + Math.sin(m) * r * .62, y - Math.cos(m) * r * .62]], { w: 4, color: P.ink, seed: 32, t });
}
function s2Scale(c, tau) {
  const a = .45, b = S2FS.in0 - .04; if (tau < a || tau > b) return;
  const out = 1 - sm(b - .25, b, tau, easeIn), tB = s2ch(0, 6), tC = s2ch(0, 12), tEq = s2ch(0, 18);
  const px = S2BX, py = 330, arm = 330, p = sm(a, a + .7, tau);
  let ang = 0;
  if (tau < tC) ang = -.2 * sm(tB + .1, tB + .6, tau);
  else { const u = tau - tC; ang = -.2 * Math.exp(-u * 1.9) * Math.cos(u * 6.2); }
  fade(c, out, () => pop(c, px, 560, lerp(.85, 1, out), () => {
    // 支架
    rshape(c, [[px - 110, 770], [px + 110, 770], [px + 70, 735], [px - 70, 735]], { fill: P.shelf2, stroke: P.ink, w: 4, seed: 71, t: tau, al: p });
    rline(c, [[px, 740], [px, py]], { w: 12, color: P.shelf2, seed: 72, t: tau, p });
    if (p < 1) return;
    const cs = Math.cos(ang), sn = Math.sin(ang), ends = [[px - arm * cs, py - arm * sn], [px + arm * cs, py + arm * sn]];
    rline(c, ends, { w: 10, color: P.ink2, seed: 73, t: tau });
    ends.forEach(([ex, ey], k) => {
      const pyy = ey + 150;
      rline(c, [[ex - 80, pyy - 10], [ex, ey], [ex + 80, pyy - 10]], { w: 3, color: P.ink2, seed: 74 + k, t: tau });
      rshape(c, [[ex - 95, pyy - 12], [ex + 95, pyy - 12], [ex + 60, pyy + 14], [ex - 60, pyy + 14]], { fill: P.gold, stroke: P.ink, w: 4, seed: 76 + k, t: tau });
      if (k === 0) { const kk = s2pop(tau, tB, .5); if (kk > 0) s2Rice(c, ex, pyy - 12 - 60 * (1 - clamp(kk, 0, 1)), .9 * Math.min(1.1, kk), tau); zh(c, '吃什么', ex, pyy + 90, { size: 54, align: 'center', p: writeP(tau, tB, '吃什么', .08) }); }
      else { const kk = s2pop(tau, tC, .5); if (kk > 0) s2Alarm(c, ex, pyy - 72 - 60 * (1 - clamp(kk, 0, 1)), 50 * Math.min(1.1, kk), tau); zh(c, '什么时候吃', ex, pyy + 90, { size: 54, align: 'center', p: writeP(tau, tC, '什么时候吃', .08) }); }
    });
    rshape(c, circPts(px, py, 14), { fill: P.moon, stroke: P.ink, w: 3, seed: 79, t: tau });
    // 等号徽章
    const ke = s2pop(tau, tEq, .5);
    pop(c, px, py - 90, ke, () => {
      rshape(c, circPts(px, py - 90, 54), { fill: P.moon, stroke: P.ink, w: 4.5, seed: 81, t: tau });
      rline(c, [[px - 26, py - 102], [px + 26, py - 102]], { w: 9, color: P.ink, seed: 82, t: tau });
      rline(c, [[px - 26, py - 78], [px + 26, py - 78]], { w: 9, color: P.ink, seed: 83, t: tau });
    });
    if (tau > tEq) for (let k = 0; k < 6; k++) { const u = clamp((tau - tEq - k * .05) / .7, 0, 1), a2 = k / 6 * TAU + .3;
      if (u > 0 && u < 1) sparkle(c, px + Math.cos(a2) * (60 + u * 70), py - 90 + Math.sin(a2) * (60 + u * 70), 14 * (1 - u), { color: P.moon }); }
    zh(c, '同样重要', px, 824, { size: 44, align: 'center', color: P.ink2, p: writeP(tau, tEq + .2, '同样重要', .08), outline: P.paper, ow: 10 });
  }));
}

// ===================== L2–L3：满屏小鼠实验 =====================
// s2Mouse：圆滚滚的小白鼠。(x, y) 脚底中心，s 缩放（1 ≈ 身长 110）
function s2Mouse(c, x, y, s, o = {}) {
  const { face = 1, t = 0, seed = 1, fat = 0, sleepy = 0, run = 0, eat = 0, hop = 0 } = o;
  c.save(); c.translate(x, y - hop); c.scale(face * s, s);
  if (eat > 0) c.rotate(eat * .09 * (.5 + .5 * Math.sin(t * 10 + seed)));
  if (sleepy > 0) c.rotate(-sleepy * .06);
  const rx = 46 + fat * 24, ry = 30 + fat * 15, hx = rx * .62 + 10, hy = -ry * 1.18 - 6 + fat * 10 + (eat > 0 ? 6 : 0);
  const white = '#fffdf8', wag = Math.sin(t * 3 + seed) * 8;
  rline(c, [[-rx + 6, -ry * .6], [-rx - 24, -ry * .45 + wag * .3], [-rx - 46, -ry - 6 + wag], [-rx - 34, -ry - 30 + wag]], { w: 4.5, color: '#e98aa4', smooth: true, seed: seed + 3, t });
  const lf = run ? Math.sin(t * 24) * 11 : 0;
  rshape(c, ellPts(-rx * .45 + lf, -4, 13, 6.5), { fill: P.pink, stroke: P.ink, w: 2.5, seed: seed + 5, t });
  rshape(c, ellPts(rx * .5 - lf, -4, 11, 6), { fill: P.pink, stroke: P.ink, w: 2.5, seed: seed + 6, t });
  rshape(c, circPts(hx - 18, hy - 22, 15, 24), { fill: white, stroke: P.ink, w: 3, seed: seed + 11, t });
  rshape(c, circPts(hx - 18, hy - 22, 8, 16), { fill: P.pink, stroke: false, seed: seed + 12, t });
  rshape(c, ellPts(0, -ry, rx, ry), { fill: white, stroke: P.ink, w: 3.5, seed: seed + 7, t });
  rline(c, [[-rx * .5, -ry * .35], [-rx * .1, -ry * .15]], { w: 2.5, color: P.faint, seed: seed + 8, t, al: .7 });
  rshape(c, ellPts(hx, hy, 29, 24, 32, .14), { fill: white, stroke: P.ink, w: 3.5, seed: seed + 9, t });
  rshape(c, circPts(hx + 2, hy - 27, 14, 24), { fill: white, stroke: P.ink, w: 3, seed: seed + 13, t });
  rshape(c, circPts(hx + 2, hy - 27, 7.5, 16), { fill: P.pink, stroke: false, seed: seed + 14, t });
  if (sleepy > .5) rline(c, [[hx + 5, hy - 5], [hx + 11, hy - 1], [hx + 18, hy - 5]], { w: 3, color: P.ink, seed: seed + 15, t });
  else { c.fillStyle = P.ink; c.beginPath(); c.arc(hx + 12, hy - 5, 5, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(hx + 13.8, hy - 7, 1.8, 0, TAU); c.fill(); }
  c.fillStyle = alpha(P.pink, .6); c.beginPath(); c.ellipse(hx + 5, hy + 9, 7, 4, 0, 0, TAU); c.fill();
  c.fillStyle = '#e46a8c'; c.beginPath(); c.arc(hx + 29, hy + 3, 5, 0, TAU); c.fill();
  for (const [dy, ey] of [[0, -9], [3, 3], [5, 14]]) rline(c, [[hx + 22, hy + dy + 2], [hx + 50, hy + ey]], { w: 1.8, color: P.ink2, seed: seed + dy + 20, t, amp: .5 });
  if (eat > 0) rline(c, [[hx + 18, hy + 13], [hx + 22, hy + 16], [hx + 26, hy + 13]], { w: 2, color: P.ink, seed: seed + 30, t, amp: .3 });
  c.restore();
}
function s2Cage(c, x, y, w, h, t, p) {
  if (p <= 0) return;
  fade(c, clamp(p * 1.5, 0, 1), () => {
    rshape(c, rectPts(x, y, w, h, 26), { fill: alpha('#ffffff', .6), stroke: false, seed: 40 });
    rshape(c, rectPts(x + 8, y + h - 70, w - 16, 60), { fill: P.paper2, stroke: false, seed: 41 });
    for (let k = 0; k < 26; k++) { const sx = x + 30 + hash(k, 3) * (w - 60), sy = y + h - 58 + hash(k, 4) * 40;
      rline(c, [[sx, sy], [sx + 14, sy - 4 + hash(k, 5) * 8]], { w: 2.5, color: P.paperEdge, seed: k, amp: .5 }); }
  });
  for (let k = 0; k <= 16; k++) { const bx = x + 22 + k * (w - 44) / 16; rline(c, [[bx, y + 14], [bx, y + h - 66]], { w: 3, color: alpha(P.ink2, .35), seed: 50 + k, t, p }); }
  rline(c, rectPts(x, y, w, h, 26), { close: true, w: 6, color: P.ink2, seed: 44, t, p });
  rline(c, [[x + w * .42, y], [x + w * .42, y - 26], [x + w * .58, y - 26], [x + w * .58, y]], { w: 5, color: P.ink2, seed: 45, t, p });
}
function s2CageFront(c, x, y, w, h, t, p) {   // 笼子前面的托盘（盖住脚下）
  if (p <= 0) return;
  rshape(c, [[x - 10, y + h - 26], [x + w + 10, y + h - 26], [x + w - 4, y + h + 20], [x + 4, y + h + 20]], { fill: mix(P.purple, P.paper, .35), stroke: P.ink, w: 4, seed: 46, t, al: clamp(p * 1.5, 0, 1) });
}
const S2PELLETS = [[-44, -44], [-16, -46], [12, -45], [40, -43], [-30, -62], [-2, -64], [26, -61], [-16, -79], [12, -80], [-2, -95]];
function s2Feeder(c, x, y, s, o = {}) {   // (x, y) 碗底
  const { fill = 1, cheese = 0, drop = 0, t = 0, seed = 1 } = o;
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, ellPts(0, -40, 72, 12), { fill: mix(P.teal, P.ink, .35), stroke: P.ink, w: 3, seed: seed + 1, t });
  const n = Math.round(fill * S2PELLETS.length), pa = 1 - cheese;
  if (pa > 0) for (let k = 0; k < n; k++) { const [px, py] = S2PELLETS[k]; rshape(c, ellPts(px, py, 15, 10, 16, hash(k, 7) - .5), { fill: mix(P.shelf2, P.orange, .45), stroke: P.ink, w: 2, seed: seed + k, t, al: pa }); }
  if (cheese > 0) [[-32, -52, -.2], [22, -54, .25], [-4, -80, 0]].forEach(([cx, cy, r], k) => { if (k >= n / 3.3) return;
    c.save(); c.translate(cx, cy - drop * (1 + k * .4)); c.rotate(r);
    rshape(c, [[-30, 14], [30, 14], [22, -20]], { fill: P.sun, stroke: P.ink, w: 3, seed: seed + 20 + k, t });
    c.fillStyle = mix(P.sun, P.orange, .6); c.beginPath(); c.arc(-8, 4, 5, 0, TAU); c.arc(12, 0, 4, 0, TAU); c.fill();
    c.restore(); });
  rshape(c, [[-74, -40], [74, -40], [60, 0], [-60, 0]], { fill: P.teal, stroke: P.ink, w: 4, seed: seed + 3, t });
  rline(c, [[-66, -24], [66, -24]], { w: 3, color: alpha('#fff', .6), seed: seed + 4, t });
  c.restore();
}
// s2Dial：24 小时钟。lit = [h0, h1] 亮的时段，p 亮的扇形画出比例，hand 指针（小时）
function s2Dial(c, x, y, r, t, o = {}) {
  const { lit = null, p = 1, hand = 0, label = '' } = o, ang = hh => hh / 24 * TAU - Math.PI / 2;
  rshape(c, circPts(x, y, r), { fill: '#fffaf0', stroke: P.ink, w: 5, seed: 91, t });
  rshape(c, circPts(x, y, r - 9), { fill: alpha(P.gray, .22), stroke: false, seed: 92 });
  if (lit && p > 0) { const a0 = ang(lit[0]), a1 = a0 + (ang(lit[1]) - a0) * p, pts = [[x, y]];
    for (let k = 0; k <= 30; k++) { const a = lerp(a0, a1, k / 30); pts.push([x + Math.cos(a) * (r - 9), y + Math.sin(a) * (r - 9)]); }
    rshape(c, pts, { fill: alpha(P.sun, .9), stroke: false, seed: 93 }); }
  for (let k = 0; k < 24; k++) { const a = ang(k), r0 = k % 6 ? r - 14 : r - 22; rline(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * (r - 7), y + Math.sin(a) * (r - 7)]], { w: k % 6 ? 2 : 4, color: P.ink2, seed: 94 + k, amp: .3 }); }
  if (label && lit) { const am = ang((lit[0] + lit[1]) / 2); zh(c, label, x + Math.cos(am) * r * .5, y + Math.sin(am) * r * .5, { size: 32, align: 'center', base: 'middle', color: P.ink }); }
  const a = ang(hand); rline(c, [[x, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8]], { w: 6, color: P.red, seed: 120, t });
  rshape(c, circPts(x, y, 8), { fill: P.ink, stroke: false });
}
function s2Wheel(c, x, y, r, ang, t) {
  rline(c, [[x, y], [x - r * .55, y + r + 30]], { w: 7, color: P.ink2, seed: 61, t });
  rline(c, [[x, y], [x + r * .55, y + r + 30]], { w: 7, color: P.ink2, seed: 62, t });
  rshape(c, circPts(x, y, r), { fill: alpha(P.sky, .28), stroke: P.blue, w: 8, seed: 63, t });
  rline(c, circPts(x, y, r - 14), { close: true, w: 3, color: P.blue, seed: 64, t });
  for (let k = 0; k < 16; k++) { const a = ang + k * TAU / 16; rline(c, [[x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14)], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w: 3, color: P.blue, seed: 70 + k, amp: .4 }); }
  for (let k = 0; k < 6; k++) { const a = ang + k * TAU / 6; rline(c, [[x, y], [x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14)]], { w: 3, color: alpha(P.blue, .7), seed: 90 + k, t }); }
  rshape(c, circPts(x, y, 11), { fill: P.moon, stroke: P.ink, w: 3, seed: 97, t });
}
function s2Lab(c, tau, L) {
  const t2 = S2T(1), t3 = S2T(2), e3 = S2E(2);
  c.fillStyle = P.paper; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(CX, CY, 320, CX, CY, 1150); g.addColorStop(0, alpha(P.paper2, 0)); g.addColorStop(1, alpha(P.paperEdge, .6)); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const cam = key(tau, [[t2, [1, CX, 560]], [t3 + 1.3, [1.035, CX, 560]], [t3 + 1.9, [1.15, 500, 620]], [t3 + 2.6, [1.15, 500, 620]], [t3 + 3.2, [1.15, 1420, 620]], [t3 + 4.5, [1.15, 1420, 620]], [e3 - .2, [1, CX, 560]]]);
  c.save(); c.translate(cam[1], cam[2]); c.scale(cam[0], cam[0]); c.translate(-cam[1], -cam[2]);
  rline(c, rectPts(40, 40, W - 80, H - 80, 24), { close: true, w: 4, color: P.paperEdge, seed: 5, t: tau });
  // 标题
  const head = '2012 年 · 小鼠实验';
  zh(c, head, CX, 140, { size: 68, align: 'center', p: writeP(tau, t2 - .15, head, .06) });
  rline(c, [[CX - 260, 164], [CX + 260, 164]], { w: 4, color: P.moon, seed: 6, t: tau, p: sm(t2 + .3, t2 + .9, tau) });
  const cp = sm(t2 + .1, t2 + 1.0, tau), gy = 786;
  const cages = [[130, 300, 760, 520], [1030, 300, 760, 520]];
  cages.forEach(([x, y, w, h]) => s2Cage(c, x, y, w, h, tau, cp));
  // 条件标签
  const tA = s2ch(1, 13), tB = s2ch(1, 20), tc = s2ch(2, 6), tf = s2ch(2, 9) + .1, tRun = t3 + 2.55;
  zh(c, '随时能吃', 510, 272, { size: 54, align: 'center', p: writeP(tau, tA, '随时能吃', .08) });
  zh(c, '只在 8 小时里吃', 1410, 272, { size: 54, align: 'center', p: writeP(tau, tB, '只在 8 小时里吃', .06) });
  // 钟：左边 24 小时全亮，右边只亮 8 小时
  const hand = tau < tB ? 6 : (6 + (tau - tB) * 4.2) % 24;
  const kA = s2pop(tau, tA), kB = s2pop(tau, tB);
  pop(c, 770, 410, kA, () => s2Dial(c, 770, 410, 64, tau, { lit: [0, 24], p: 1, hand, label: '' }));
  if (kA > .5) zh(c, '24h', 770, 500, { size: 32, align: 'center', color: P.ink2 });
  pop(c, 1670, 410, kB, () => s2Dial(c, 1670, 410, 64, tau, { lit: [9, 17], p: sm(tB + .2, tB + .9, tau), hand, label: '8h' }));
  // 食盆：换成奶酪
  const cheese = sm(tc, tc + .25, tau), dropU = clamp((tau - tc) / .5, 0, 1), drop = tau < tc ? 0 : 260 * (1 - easeOutBack(dropU));
  const fillR = tau < tB ? 1 : sm(9, 9.4, hand, s2lin) * (1 - sm(16.6, 17, hand, s2lin));
  const fp = sm(t2 + .6, t2 + 1.0, tau);
  if (fp > 0) {
    s2Feeder(c, 390, gy + 4, fp, { fill: 1, cheese, drop, t: tau, seed: 1 });
    s2Feeder(c, 1290, gy + 4, fp, { fill: fillR, cheese, drop, t: tau, seed: 2 });
  }
  // 左笼三只：吃、吃、晃悠 → 变胖、没精神
  const fat = sm(tf, tf + 1.1, tau), sleepy = sm(tf + .8, tf + 1.0, tau);
  const mice = [[245, 1, 0], [540, -1, 1], [745, -1, 2]];
  mice.forEach(([mx, face, k]) => {
    const ka = s2pop(tau, t2 + .9 + k * .18, .4); if (ka <= 0) return;
    let xx = mx, ff = face, eat = k < 2 && fat < .5 ? 1 : 0;
    if (k === 2) { xx = mx + (1 - fat) * 36 * Math.sin(tau * .9); ff = Math.cos(tau * .9) > 0 ? 1 : -1; if (fat > .5) ff = -1; }
    pop(c, xx, gy, ka, () => s2Mouse(c, xx, gy, 1.2, { face: ff, t: tau, seed: 3 + k * 10, fat, sleepy, eat, hop: k === 2 && fat < .3 ? Math.abs(Math.sin(tau * 3.6)) * 6 : 0 }));
    if (sleepy > 0) for (let z = 0; z < 3; z++) { const u = ((tau - tf) * .6 + z / 3 + k * .21) % 1;
      zh(c, 'z', xx + face * 40 + u * 40, gy - 130 - fat * 30 - u * 70, { size: 32 + z * 6, color: P.ink2, al: sleepy * Math.sin(u * Math.PI) }); }
  });
  // 右笼：两只吃饭 + 一只在跑轮里
  const running = sm(tRun, tRun + .4, tau), wx = 1640, wy = gy - 130, wr = 100;
  if (cp > .6) fade(c, sm(t2 + .6, t2 + 1, tau), () => s2Wheel(c, wx, wy, wr, (tau > tRun ? (tau - tRun) * running * 7 : 0), tau));
  [[1150, 1, 0], [1440, -1, 1]].forEach(([mx, face, k]) => {
    const ka = s2pop(tau, t2 + 1.0 + k * .18, .4); if (ka <= 0) return;
    const eat = fillR > .5 && running < .5 ? 1 : 0, hop = running * Math.abs(Math.sin(tau * 6 + k * 1.3)) * 22;
    pop(c, mx, gy, ka, () => s2Mouse(c, mx, gy, 1.2, { face, t: tau, seed: 40 + k * 10, eat, hop }));
  });
  if (running > .5) for (let k = 0; k < 3; k++) { const u = (tau * 3 + k / 3) % 1; rline(c, [[wx - 60 - u * 30, wy + wr - 50 + k * 16], [wx - 100 - u * 30, wy + wr - 50 + k * 16]], { w: 3, color: P.ink2, al: 1 - u, seed: 150 + k, t: tau }); }
  const kw = s2pop(tau, t2 + 1.4, .4);
  pop(c, wx, wy + wr - 12, kw, () => s2Mouse(c, wx, wy + wr - 12 - (running ? Math.abs(Math.sin(tau * 12)) * 5 : 0), .95, { face: 1, t: tau, seed: 60, run: running > .5 ? 1 : 0 }));
  if (running > 0) for (let k = 0; k < 5; k++) { const u = ((tau - tRun) * .9 + k / 5) % 1, sx = wx + (k - 2) * 46 + Math.sin(u * 5 + k) * 14;
    s2Star(c, sx, wy - wr - 10 - u * 120, 18 * (1 - u * .4), u * 3 + k, k % 2 ? P.sun : P.moon, tau, running * Math.sin(u * Math.PI)); }
  cages.forEach(([x, y, w, h]) => s2CageFront(c, x, y, w, h, tau, cp));
  // 「高脂饲料」签
  const kc = s2pop(tau, tc - .15, .5);
  pop(c, CX, 222, kc, () => {
    rshape(c, rectPts(CX - 150, 188, 300, 64, 18), { fill: P.sun, stroke: P.ink, w: 4, seed: 130, t: tau });
    zh(c, '高脂饲料', CX, 236, { size: 44, align: 'center' });
  });
  // 结果章
  s2Stamp(c, 450, 470, '变胖 · 没精神', P.red, clamp((tau - (t3 + 2.1)) / .35, 0, 1), -.08, tau, 50);
  s2Stamp(c, 1320, 470, '更健康！', P.green, clamp((tau - (t3 + 3.25)) / .35, 0, 1), .07, tau, 56);
  if (tau > t3 + 3.4) for (let k = 0; k < 5; k++) { const u = clamp((tau - t3 - 3.4 - k * .06) / .6, 0, 1), a = k / 5 * TAU - .5;
    if (u < 1) sparkle(c, 1320 + Math.cos(a) * (120 + u * 60), 470 + Math.sin(a) * (50 + u * 40), 16 * (1 - u), { color: P.moon }); }
  c.restore();
  // Q 版帕秋莉从右下角探头
  const kp = sm(t2 + .3, t2 + .9, tau, easeOutBack) * (1 - sm(e3 - .2, e3 + .2, tau));
  if (kp > 0) drawPatchouliChibi(c, { x: lerp(2080, 1830, kp), y: 1090, h: 250, facing: -1, pose: 'stand', mood: (L && L.mood) || 'normal', mouth: (L && L.mouth) || 0, blink: blinkAt(tau, 4), t: tau });
}

// ===================== L4–L6：一天的时间轴 =====================
const S2TL = { x0: 800, x1: 1780, y: 430, h: 70 };
const s2hx = (hh, x0 = S2TL.x0, x1 = S2TL.x1) => lerp(x0, x1, (hh - 7) / 19);
// s2Bar：7:00 → 次日 2:00 的横条。band 绿色吃饭窗口 [a, b]；grayL 早上 1h 灰；grayR 睡前灰（从 24 往回吃到 21）；night 24 点后夜色
function s2Bar(c, x0, x1, y, h, o = {}) {
  const { band = null, grayL = 0, grayR = 0, night = 0, t = null, seed = 80, p = 1 } = o;
  const hx = hh => s2hx(hh, x0, x1), box = rectPts(x0, y, x1 - x0, h, Math.min(14, h * .3));
  if (p < 1) { rline(c, box, { close: true, w: 4, p, seed, t }); return; }
  rshape(c, box, { fill: '#fffaf0', stroke: false });
  c.save(); c.clip(polyPath(box));
  const seg = (a, b, col) => { if (b > a) rshape(c, rectPts(hx(a), y - 6, hx(b) - hx(a), h + 12), { fill: col, stroke: false, seed, t, amp: .8 }); };
  if (night > 0) { seg(24, 26, alpha(P.night3, night)); for (let k = 0; k < 4; k++) sparkle(c, hx(24.3 + k * .45), y + h * (.3 + .4 * hash(k, 3)), h * .12, { al: night * .9, rot: t * .5 }); }
  if (grayL > 0) seg(7, lerp(7, 8, grayL), alpha(P.gray, .55));
  if (band) seg(band[0], band[1], P.green);
  if (grayR > 0) seg(lerp(24, 21, grayR), 24, alpha(P.gray, .55));
  c.restore();
  rshape(c, box, { fill: null, stroke: P.ink, w: h > 50 ? 4.5 : 3.5, seed, t });
}
// s2Tummy：小胃。(x, y) 中心，mood: happy | sleepy | calm | shock | dizzy
function s2Tummy(c, x, y, s, mood, t, seed = 5) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const edge = mix(P.pink, P.red, .45);
  rline(c, [[-32, -48], [-38, -70], [-32, -92]], { w: 18, color: P.ink, t, seed, smooth: true });
  rline(c, [[-32, -48], [-38, -70], [-32, -92]], { w: 11, color: P.pink, t, seed, smooth: true });
  rline(c, [[48, 30], [66, 44], [70, 66]], { w: 18, color: P.ink, t, seed: seed + 1, smooth: true });
  rline(c, [[48, 30], [66, 44], [70, 66]], { w: 11, color: P.pink, t, seed: seed + 1, smooth: true });
  rshape(c, [[-44, -54], [-8, -52], [8, -26], [40, -22], [60, 8], [44, 46], [0, 60], [-42, 48], [-62, 8], [-60, -30]], { fill: P.pink, stroke: P.ink, w: 4, seed: seed + 2, t, smooth: true });
  rline(c, [[-40, 30], [-10, 44], [24, 40]], { w: 3, color: edge, seed: seed + 3, t, smooth: true, al: .6 });
  const ex = 15, ey = 4;
  if (mood === 'happy') { for (const d of [-1, 1]) rline(c, [[d * ex - 8, ey + 3], [d * ex, ey - 5], [d * ex + 8, ey + 3]], { w: 3.5, seed: seed + 4 + d, t });
    rshape(c, [[-9, 18], [9, 18], [6, 28], [0, 31], [-6, 28]], { fill: '#b0405a', stroke: P.ink, w: 2.5, seed: seed + 6, t }); }
  else if (mood === 'sleepy') { for (const d of [-1, 1]) rline(c, [[d * ex - 8, ey], [d * ex + 8, ey]], { w: 3.5, seed: seed + 4 + d, t });
    rline(c, [[-5, 22], [5, 22]], { w: 3, seed: seed + 6, t }); }
  else if (mood === 'shock') { for (const d of [-1, 1]) { rshape(c, circPts(d * ex, ey - 2, 9), { fill: '#fff', stroke: P.ink, w: 2.5, seed: seed + 4 + d, t }); c.fillStyle = P.ink; c.beginPath(); c.arc(d * ex, ey - 2, 3.5, 0, TAU); c.fill(); }
    rshape(c, ellPts(0, 26, 7, 9), { fill: '#b0405a', stroke: P.ink, w: 2.5, seed: seed + 6, t });
    rshape(c, [[52, -40], [60, -24], [52, -18], [45, -24]], { fill: P.sky, stroke: P.ink, w: 2, seed: seed + 7, t, smooth: true }); }
  else if (mood === 'dizzy') { for (const d of [-1, 1]) { const pts = []; for (let i = 0; i <= 18; i++) { const a = i * .7 + t * 6 * d, r = i * .55; pts.push([d * ex + Math.cos(a) * r, ey + Math.sin(a) * r]); } rline(c, pts, { w: 2.5, seed: seed + 4 + d, amp: .3 }); }
    rline(c, [[-12, 24], [-6, 20], [0, 25], [6, 20], [12, 24]], { w: 3, seed: seed + 6, t }); }
  else { for (const d of [-1, 1]) { c.fillStyle = P.ink; c.beginPath(); c.arc(d * ex, ey, 4.5, 0, TAU); c.fill(); }
    rline(c, [[-7, 20], [0, 25], [7, 20]], { w: 3, seed: seed + 6, t }); }
  c.fillStyle = alpha(P.red, .3); c.beginPath(); c.ellipse(-30, 18, 8, 5, 0, 0, TAU); c.ellipse(30, 18, 8, 5, 0, 0, TAU); c.fill();
  c.restore();
}
function s2Bag(c, x, y, s, t, rot = 0, sq = 1) {   // 炸鸡外卖袋，(x, y) 袋底中心
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s / sq, s * sq);
  const kraft = mix(P.orange, P.paper2, .45);
  c.save(); c.translate(26, -120); c.rotate(.5);   // 露出来的鸡腿
  rshape(c, [[-6, 30], [6, 30], [5, -4], [-5, -4]], { fill: P.cap, stroke: P.ink, w: 3, seed: 3, t });
  rshape(c, circPts(-7, -10, 8), { fill: P.cap, stroke: P.ink, w: 3, seed: 4, t }); rshape(c, circPts(7, -10, 8), { fill: P.cap, stroke: P.ink, w: 3, seed: 5, t });
  c.restore();
  rshape(c, [[-10, -80], [30, -130], [60, -110], [52, -70], [0, -60]], { fill: mix(P.orange, P.shelf2, .25), stroke: P.ink, w: 3.5, seed: 6, t, smooth: true });
  rshape(c, [[-55, 0], [55, 0], [50, -100], [-50, -100]], { fill: kraft, stroke: P.ink, w: 4, seed: 7, t });
  rshape(c, [[-50, -100], [50, -100], [44, -120], [30, -108], [16, -122], [0, -108], [-16, -122], [-30, -108], [-44, -120]], { fill: mix(kraft, '#fff', .2), stroke: P.ink, w: 3.5, seed: 8, t });
  rshape(c, circPts(0, -48, 26), { fill: P.red, stroke: P.ink, w: 3, seed: 9, t });
  rshape(c, [[-10, -40], [-4, -56], [8, -60], [12, -48], [2, -40]], { fill: P.sun, stroke: P.ink, w: 2, seed: 10, t, smooth: true });
  c.restore();
}
function s2Day(c, tau, L) {
  const a = S2FS.out1 - .1, e = S2T(6); if (tau < a || tau >= e) return;
  const tS = s2ch(3, 9), tG = s2ch(3, 14), tw = s2ch(3, 19), tM = S2T(4) + .05, tR = s2ch(4, 2);
  const tb0 = s2ch(5, 3), tl = tb0 + .6, tx = s2ch(5, 11) + .1;
  const p = sm(a, a + .9, tau), dec = 1 - sm(e - .22, e, tau, easeIn);
  const bandEnd = key(tau, [[tw, 8], [tw + .8, 24], [tR, 24], [tR + .7, 21]]);
  const { x0, x1, y, h } = S2TL;
  s2Bar(c, x0, x1, y, h, { p, band: tau > tw ? [8, bandEnd] : null, grayL: sm(tG, tG + .4, tau), grayR: sm(tR, tR + .7, tau), night: sm(tM, tM + .5, tau), t: tau });
  fade(c, dec, () => {
    // 刻度和时间
    const lp = sm(a + .6, a + 1.1, tau);
    if (lp > 0) fade(c, lp, () => {
      for (let hh = 7; hh <= 26; hh++) rline(c, [[s2hx(hh), y + h + 4], [s2hx(hh), y + h + (hh % 3 ? 12 : 20)]], { w: 3, color: P.ink2, seed: hh, amp: .4 });
      for (const hh of [7, 12, 18, 21, 24]) zh(c, hh + ':00', s2hx(hh), y + h + 58, { size: 32, align: 'center', color: P.ink2 });
    });
    // 起床 / 睡觉
    pop(c, s2hx(7), 262, s2pop(tau, tS), () => s2Sun(c, s2hx(7), 262, 22, tau));
    zh(c, '起床', s2hx(7) + 44, 276, { size: 40, p: writeP(tau, tS + .1, '起床', .1) });
    pop(c, s2hx(24), 262, s2pop(tau, tM), () => drawMoonIcon(c, s2hx(24), 262, 26, P.moon, -.3));
    zh(c, '睡觉', s2hx(24) - 36, 276, { align: 'right', size: 40, p: writeP(tau, tM + .1, '睡觉', .1) });
    // 早上 1h 先不吃
    if (tau > tG) { s2Bracket(c, s2hx(7), s2hx(8), 408, { t: tau, p: sm(tG, tG + .3, tau) }); zh(c, '先不吃 1h', s2hx(7) - 6, 392, { size: 40, p: writeP(tau, tG + .1, '先不吃 1h', .08) }); }
    if (tau > tw + .3) zh(c, '吃饭时间', s2hx(14.5), y + 50, { size: 46, align: 'center', color: '#fff', p: writeP(tau, tw + .35, '吃饭时间', .09), outline: mix(P.green, P.ink, .4), ow: 6 });
    if (tau > tR) { s2Bracket(c, s2hx(21), s2hx(24), 408, { t: tau, p: sm(tR, tR + .4, tau) }); zh(c, '不再进食 2–3h', s2hx(24) - 14, 392, { size: 40, align: 'right', p: writeP(tau, tR + .2, '不再进食 2–3h', .08) }); }
    // 小胃跟着时间走
    const hh = key(tau, [[tw, 7.4], [S2E(4), 23.3], [S2T(5), 23.3], [S2T(5) + .7, 25]], s2lin);
    const moving = (tau > tw && tau < S2E(4)) || (tau > S2T(5) && tau < S2T(5) + .7);
    let mood = hh < 8 ? 'sleepy' : hh < 21 ? 'happy' : 'calm';
    if (tau > tl) mood = tau < tx + .6 ? 'shock' : 'dizzy';
    const kt = s2pop(tau, S2T(3) + .9, .5), tx0 = s2hx(hh), ty = 720 - (moving ? Math.abs(Math.sin(tau * 9)) * 8 : 0);
    if (kt > 0) {
      fade(c, clamp(kt, 0, 1), () => {
        rline(c, [[tx0, y + h + 6], [tx0, 628]], { w: 3, color: P.ink2, dash: [8, 9], seed: 3 });
        rshape(c, [[tx0, y + h + 2], [tx0 - 10, y + h + 18], [tx0 + 10, y + h + 18]], { fill: P.red, stroke: P.ink, w: 2.5, seed: 4, t: tau });
      });
      pop(c, tx0, ty + 50, kt, () => s2Tummy(c, tx0, ty, .8, mood, tau));
      if (mood === 'sleepy') for (let z = 0; z < 2; z++) { const u = (tau * .7 + z / 2) % 1; zh(c, 'z', tx0 + 50 + u * 26, ty - 50 - u * 50, { size: 34, color: P.ink2, al: Math.sin(u * Math.PI) }); }
      if (mood === 'happy') { const u = (tau * 1.3) % 1; sparkle(c, tx0 + 56, ty - 40 - u * 30, 12 * Math.sin(u * Math.PI), { color: P.moon }); }
    }
    // 凌晨 1 点的炸鸡外卖
    if (tau > tb0) {
      const u = clamp((tau - tb0) / .6, 0, 1), v = tau - tl, bx = lerp(2080, s2hx(25), easeOut(u)), by = lerp(60, y, u * u);
      const sq = v > 0 ? 1 - .18 * Math.sin(v * 18) * Math.exp(-v * 7) : 1;
      s2Bag(c, bx, by - 2, 1.02, tau, (1 - u) * 1.6, sq);
      if (v > 0) { zh(c, '凌晨 1:00', s2hx(25) - 16, 612, { size: 36, align: 'right', color: P.red, p: writeP(tau, tl, '凌晨 1:00', .06) });
        if (v < .5) for (let k = 0; k < 6; k++) { const a2 = Math.PI + k / 5 * Math.PI; sparkle(c, s2hx(25) + Math.cos(a2) * (50 + v * 120), y - 8 + Math.sin(a2) * (10 + v * 60), 10 * (1 - v * 2), { color: P.paperEdge }); } }
      if (tau > tx) cross(c, s2hx(25) - 10, y - 70, 150, { p: sm(tx, tx + .3, tau, s2lin), t: tau });
    }
  });
}

// ===================== L7：周一到周五 =====================
const S2MESSY = [[10, 22.5], [7.5, 15], [12, 25], [9, 19.5], [13.5, 24.6]];
const S2WK = ['周一', '周二', '周三', '周四', '周五'];
function s2Plane(c, x, y, s, dir, bank, t) {
  c.save(); c.translate(x, y); c.scale(s * dir, s); c.rotate(bank);
  rshape(c, [[-10, -4], [16, -46], [30, -46], [18, -4]], { fill: P.sky, stroke: P.ink, w: 3, seed: 1, t });
  rshape(c, [[-48, -6], [-58, -30], [-46, -30], [-34, -8]], { fill: P.sky, stroke: P.ink, w: 3, seed: 2, t });
  rshape(c, [[-56, -2], [30, -12], [56, -2], [30, 10], [-50, 8]], { fill: '#fffdf8', stroke: P.ink, w: 3.5, seed: 3, t, smooth: true });
  for (let k = 0; k < 4; k++) { c.fillStyle = P.blue; c.beginPath(); c.arc(-20 + k * 13, -2, 3.2, 0, TAU); c.fill(); }
  rshape(c, [[-6, 4], [20, 30], [30, 30], [16, 4]], { fill: P.sky, stroke: P.ink, w: 3, seed: 4, t });
  c.restore();
}
function s2Week(c, tau) {
  const a = S2T(6), b = S2T(7) - .02; if (tau < a || tau > b) return;
  const out = 1 - sm(b - .22, b, tau, easeIn), m = sm(a, a + .7, tau);
  const C1 = [840, 1270], C2 = [1420, 1810], rowY = k => 318 + k * 76, bh = 40;
  const t1 = s2ch(6, 6), tg = s2ch(6, 13), t2 = s2ch(6, 17), tp = s2ch(6, 22);
  fade(c, out, () => pop(c, S2BX, 480, lerp(.9, 1, out), () => {
    // 左：每天一样
    zh(c, '每天差不多', C1[0] - 70, 268, { size: 44, color: mix(P.green, P.ink, .3), p: writeP(tau, t1, '每天差不多', .07) });
    pop(c, C1[1] - 20, 250, s2pop(tau, tg), () => check(c, C1[1] - 20, 250, 56, { t: tau }));
    for (let k = 0; k < 5; k++) {
      const kk = k === 0 ? 1 : s2pop(tau, t1 + k * .16, .4); if (kk <= 0) continue;
      const yy = k === 0 ? lerp(S2TL.y, rowY(0), m) : lerp(rowY(0), rowY(k), clamp(kk, 0, 1.2));
      const x0 = k === 0 ? lerp(S2TL.x0, C1[0], m) : C1[0], x1 = k === 0 ? lerp(S2TL.x1, C1[1], m) : C1[1], hh = k === 0 ? lerp(S2TL.h, bh, m) : bh;
      s2Bar(c, x0, x1, yy, hh, { band: [8, 21], grayL: 1, grayR: 1, night: 1, t: tau, seed: 80 + k });
      if (m > .8) zh(c, S2WK[k], C1[0] - 14, yy + 32, { size: 32, align: 'right', color: P.ink2, al: k === 0 ? sm(.8, 1, m) : clamp(kk, 0, 1) });
    }
    if (tau > tg) for (const hh of [8, 21]) rline(c, [[s2hx(hh, C1[0], C1[1]), rowY(0) - 16], [s2hx(hh, C1[0], C1[1]), rowY(4) + bh + 16]], { w: 4, color: mix(P.green, P.ink, .2), dash: [10, 8], seed: hh, t: tau, p: sm(tg, tg + .5, tau) });
    // 右：天天倒时差
    zh(c, '天天倒时差', C2[0] - 60, 268, { size: 44, color: P.red, p: writeP(tau, t2, '天天倒时差', .07) });
    for (let k = 0; k < 5; k++) {
      const kk = s2pop(tau, t2 + k * .13, .4); if (kk <= 0) continue;
      const j = .5 * Math.sin(tau * 2.3 + k * 1.9), [w0, w1] = S2MESSY[k];
      pop(c, (C2[0] + C2[1]) / 2, rowY(k) + bh / 2, kk, () => {
        s2Bar(c, C2[0], C2[1], rowY(k), bh, { band: [w0 + j, w1 + j], grayL: 0, grayR: 0, night: 1, t: tau, seed: 90 + k });
        zh(c, S2WK[k], C2[0] - 14, rowY(k) + 32, { size: 32, align: 'right', color: P.ink2 });
      });
    }
    // 小飞机绕圈
    const kp = s2pop(tau, tp, .4);
    if (kp > 0) { const w = (tau - tp) * 2.6, px = 1735 + 72 * Math.cos(w), py = 240 + 18 * Math.sin(2 * w), dir = -Math.sin(w) >= 0 ? 1 : -1;
      for (let k = 1; k <= 5; k++) { const w2 = w - k * .18; c.fillStyle = alpha(P.ink2, .35 - k * .05); c.beginPath(); c.arc(1735 + 72 * Math.cos(w2), 240 + 18 * Math.sin(2 * w2), 4, 0, TAU); c.fill(); }
      pop(c, px, py, kp, () => s2Plane(c, px, py, .8, dir, .15 * Math.cos(2 * w), tau)); }
    // 两只小胃
    pop(c, (C1[0] + C1[1]) / 2, 790, s2pop(tau, tg + .1), () => s2Tummy(c, (C1[0] + C1[1]) / 2, 742 - Math.abs(Math.sin(tau * 4)) * 5, .66, 'happy', tau, 7));
    pop(c, (C2[0] + C2[1]) / 2, 790, s2pop(tau, tp + .1), () => {
      c.save(); c.translate((C2[0] + C2[1]) / 2, 742); c.rotate(.12 * Math.sin(tau * 5)); s2Tummy(c, 0, 0, .66, 'dizzy', tau, 9); c.restore(); });
  }));
}

// ===================== L8：什么不算开饭 =====================
function s2Glass(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const body = [[-44, -150], [44, -150], [34, 0], [-34, 0]], lvl = -104;
  rshape(c, body, { fill: alpha(P.sky, .15), stroke: false, seed: 1 });
  c.save(); c.clip(polyPath(body));
  const wv = []; for (let i = 0; i <= 12; i++) { const xx = -50 + i * 100 / 12; wv.push([xx, lvl + 4 * Math.sin(xx * .08 + t * 4)]); }
  rshape(c, [...wv, [50, 10], [-50, 10]], { fill: alpha(P.sky, .75), stroke: false, seed: 2 });
  c.restore();
  rshape(c, body, { fill: null, stroke: P.ink, w: 4, seed: 3, t });
  rline(c, [[-28, -132], [-22, -24]], { w: 6, color: '#fff', al: .8, seed: 4, t });
  c.restore();
}
function s2Tea(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, ellPts(0, -4, 88, 14), { fill: P.cap, stroke: P.ink, w: 3.5, seed: 1, t });
  rshape(c, [[-64, -96], [64, -96], [52, -34], [26, -12], [-26, -12], [-52, -34]], { fill: P.cap, stroke: P.ink, w: 4, seed: 2, t, smooth: true });
  rline(c, [[-58, -66], [58, -66]], { w: 7, color: P.green, seed: 3, t });
  rshape(c, ellPts(0, -96, 62, 12), { fill: mix(P.gold, P.green, .4), stroke: P.ink, w: 3, seed: 4, t });
  rline(c, [[24, -96], [44, -128], [58, -130]], { w: 2.5, color: P.ink2, seed: 5, t, smooth: true });
  rshape(c, rectPts(52, -150, 26, 30, 4), { fill: P.gold, stroke: P.ink, w: 2.5, seed: 6, t });
  s2Steam(c, -10, -118, t, 2);
  c.restore();
}
function s2Mug(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rline(c, [[46, -108], [80, -104], [84, -60], [46, -44]], { w: 12, color: P.ink, seed: 1, t, smooth: true });
  rline(c, [[46, -108], [80, -104], [84, -60], [46, -44]], { w: 5, color: P.cap, seed: 1, t, smooth: true });
  rshape(c, rectPts(-50, -132, 100, 132, 14), { fill: P.cap, stroke: P.ink, w: 4, seed: 2, t });
  rline(c, [[-50, -46], [50, -46]], { w: 8, color: P.purple, seed: 3, t });
  rshape(c, ellPts(0, -128, 46, 10), { fill: mix(P.shelf2, P.ink, .45), stroke: P.ink, w: 3, seed: 4, t });
  s2Steam(c, 0, -150, t, 2);
  c.restore();
}
function s2Spoon(c, x, y, s, tilt, t, pour) {   // (x, y) 勺子头中心；pour 0..1 倒糖的时间进度
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(tilt);
  rline(c, [[40, -6], [150, -60]], { w: 12, color: P.ink, seed: 1, t }); rline(c, [[40, -6], [150, -60]], { w: 6, color: mix(P.gray, '#fff', .5), seed: 1, t });
  rshape(c, ellPts(0, 0, 52, 26), { fill: mix(P.gray, '#fff', .55), stroke: P.ink, w: 4, seed: 2, t });
  const n = Math.round(9 * (1 - pour * .6));
  for (let k = 0; k < n; k++) { const cx = -30 + (k % 5) * 14, cy = -12 - Math.floor(k / 5) * 12; rshape(c, rectPts(cx - 7, cy - 7, 14, 14, 2), { fill: '#fff', stroke: P.ink2, w: 2, seed: 3 + k, t }); }
  c.restore();
}
function s2Drinks(c, tau) {
  const a = S2T(7), b = S2T(8) - .02; if (tau < a || tau > b) return;
  const out = 1 - sm(b - .22, b, tau, easeIn), base = 470;
  const items = [[870, s2ch(7, 0), s2ch(7, 1.5), '白水', s2Glass], [1085, s2ch(7, 3), s2ch(7, 4), '茶', s2Tea], [1305, s2ch(7, 5), s2ch(7, 10), '黑咖啡', s2Mug]];
  const tN = s2ch(7, 12), tS = s2ch(7, 18), tX = s2ch(7, 21);
  fade(c, out, () => {
    items.forEach(([x, t0, tc, label, draw], k) => {
      pop(c, x, base - 70, s2pop(tau, t0), () => draw(c, x, base, 1, tau));
      zh(c, label, x, base + 70, { size: 40, align: 'center', p: writeP(tau, t0 + .1, label, .08) });
      pop(c, x + 62, base - 170, s2pop(tau, tc + .2), () => check(c, x + 62, base - 170, 60, { t: tau }));
    });
    if (tau > tN) { s2Bracket(c, 800, 1380, base + 100, { t: tau, p: sm(tN, tN + .4, tau), color: mix(P.green, P.ink, .2) });
      zh(c, '不算“开饭”', 1090, base + 180, { size: 52, align: 'center', color: mix(P.green, P.ink, .3), p: writeP(tau, tN + .2, '不算“开饭”', .08) }); }
    rline(c, [[1490, 250], [1490, 700]], { w: 3, color: P.paperEdge, dash: [12, 10], seed: 5, t: tau, p: sm(tS - .3, tS + .2, tau) });
    const ks = s2pop(tau, tS), pour = sm(tS + .35, tS + .75, tau), tilt = -.85 * pour;
    pop(c, 1640, base - 70, ks, () => s2Mug(c, 1640, base, .9, tau));
    pop(c, 1640, 250, ks, () => s2Spoon(c, 1640, 238, .85, tilt, tau, sm(tS + .6, tX, tau)));
    if (pour > .9) for (let k = 0; k < 12; k++) { const t0 = tS + .6 + k * .06, u = clamp((tau - t0) / .35, 0, 1);
      if (tau > t0 && u < 1) rshape(c, rectPts(1612 + (hash(k, 2) - .5) * 18 - 4, lerp(272, 352, u * u) - 4, 8, 8, 1), { fill: '#fff', stroke: P.ink2, w: 1.5, seed: k }); }
    zh(c, '+ 一勺糖', 1640, base + 70, { size: 40, align: 'center', p: writeP(tau, tS + .1, '+ 一勺糖', .07) });
    if (tau > tX) { cross(c, 1650, 350, 170, { p: sm(tX, tX + .3, tau, s2lin), t: tau });
      zh(c, '就算开饭！', 1660, base + 180, { size: 48, align: 'center', color: P.red, p: writeP(tau, tX + .2, '就算开饭！', .07) }); }
  });
}

// ===================== L9–L10：肠道和菌群 =====================
const S2GUT = [[850, 290], [900, 290], [1200, 290], [1450, 290], [1528, 380], [1450, 470], [1200, 470], [920, 470], [838, 560], [920, 650], [1200, 650], [1470, 650]];
const S2GUTP = spline(S2GUT, 4);
const S2GUTC = (() => { const acc = [0]; for (let i = 1; i < S2GUTP.length; i++) acc.push(acc[i - 1] + Math.hypot(S2GUTP[i][0] - S2GUTP[i - 1][0], S2GUTP[i][1] - S2GUTP[i - 1][1])); return acc; })();
function s2GutAt(u) {   // 沿肠道 u∈[0,1] 的位置和切线角
  const L0 = S2GUTC.at(-1) * clamp(u, 0, 1); let i = 1; while (i < S2GUTC.length - 1 && S2GUTC[i] < L0) i++;
  const a = S2GUTP[i - 1], b = S2GUTP[i], f = (L0 - S2GUTC[i - 1]) / Math.max(1e-6, S2GUTC[i] - S2GUTC[i - 1]);
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
}
// 小菌：wave 0 开头就有（种类少），1「越多样」时加，2 吃了发酵食品后加
const S2BUGS = (() => {
  const r = rng(29), out = [], N = 24;
  const kinds = { 0: [['coccus', P.green], ['coccus', P.green], ['rod', P.green]], 1: [['rod', P.blue], ['spiral', P.orange], ['duo', P.purple]], 2: [['spiral', P.teal], ['spiky', P.gold], ['rod', P.sky], ['duo', P.red], ['coccus', P.purple], ['spiral', P.blue]] };
  for (let k = 0; k < N; k++) { const wave = [0, 2, 1][k % 3], list = kinds[wave], [kind, col] = list[Math.floor(r() * list.length)];
    out.push({ u: .04 + .92 * (k + r() * .6) / N, off: (r() - .5) * 26, kind, col, sz: 1.25 + r() * .3, wave, ph: r() * TAU }); }
  return out;
})();
function s2Bug(c, x, y, sz, kind, col, ang, t, seed) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(sz, sz);
  const st = mix(col, P.ink, .55), o = { fill: col, stroke: st, w: 3, seed, t, amp: .8 };
  let ex = 0;
  if (kind === 'rod') { rline(c, [[-24, 0], [-34, -6], [-42, 2], [-50, -4]], { w: 2.5, color: st, seed, t, smooth: true }); rshape(c, rectPts(-26, -12, 52, 24, 12), o); ex = 8; }
  else if (kind === 'duo') { rshape(c, circPts(-12, 0, 14), o); rshape(c, circPts(12, 0, 14), o); ex = 12; }
  else if (kind === 'spiral') { const pts = []; for (let i = 0; i <= 20; i++) pts.push([-30 + i * 3, 8 * Math.sin(i / 20 * TAU * 1.5 + t * 7)]);
    rline(c, pts, { w: 14, color: st, seed, amp: .4, smooth: true }); rline(c, pts, { w: 8, color: col, seed, amp: .4, smooth: true }); ex = 30; }
  else if (kind === 'spiky') { rshape(c, starPts(0, 0, 22, 9, .72, t * .8), o); }
  else rshape(c, circPts(0, 0, 18), o);
  const ey = kind === 'spiral' ? 8 * Math.sin(1.5 * TAU + t * 7) - 4 : -3;
  c.fillStyle = P.ink; c.beginPath(); c.arc(ex - 5, ey, 2.8, 0, TAU); c.arc(ex + 5, ey, 2.8, 0, TAU); c.fill();
  if (kind !== 'spiral') rline(c, [[ex - 4, 5], [ex, 8], [ex + 4, 5]], { w: 2, color: P.ink, seed: seed + 1, amp: .2 });
  c.restore();
}
function s2FBowl(c, x, y, s, t) {   // 一碗发酵食品，(x, y) 碗底
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, [[-60, -62], [-30, -80], [10, -84], [40, -78], [60, -62]], { fill: '#fffdf8', stroke: P.ink, w: 3, seed: 1, t, smooth: true });
  rshape(c, [[-46, -70], [-26, -86], [-8, -72]], { fill: P.red, stroke: P.ink, w: 2.5, seed: 2, t });
  for (let k = 0; k < 4; k++) rshape(c, circPts(16 + k * 9, -74 - (k % 2) * 6, 6), { fill: mix(P.gold, P.shelf2, .4), stroke: P.ink, w: 2, seed: 3 + k, t });
  rshape(c, [[-70, -64], [70, -64], [56, -22], [28, 0], [-28, 0], [-56, -22]], { fill: P.orange, stroke: P.ink, w: 4, seed: 9, t, smooth: true });
  rline(c, [[-60, -42], [60, -42]], { w: 4, color: P.paper, seed: 10, t, dash: [10, 9] });
  c.restore();
}
function s2Gut(c, tau) {
  const a = S2T(8), b = S2T(10) - .02; if (tau < a || tau > b) return;
  const out = 1 - sm(b - .22, b, tau, easeIn), p = sm(a, a + 1.0, tau);
  const t0 = s2ch(8, 7), t1 = s2ch(8, 14), tH = s2ch(8, 20), tbw = s2ch(9, 3), tp = s2ch(9, 7), tg = s2ch(9, 16), ti = s2ch(9, 22);
  fade(c, out, () => pop(c, S2BX, 480, lerp(.9, 1, out), () => {
    rline(c, S2GUT, { w: 122, color: P.ink, smooth: true, seed: 3, t: tau, p });
    rline(c, S2GUT, { w: 110, color: mix(P.pink, P.red, .25), smooth: true, seed: 3, t: tau, p });
    rline(c, S2GUT, { w: 90, color: mix(P.pink, P.cap, .45), smooth: true, seed: 3, t: tau, p });
    rline(c, S2GUT, { w: 4, color: alpha(P.pink, .8), smooth: true, seed: 4, t: tau, p, dash: [18, 22] });
    // 小菌
    S2BUGS.forEach((g, k) => {
      const tA = g.wave === 0 ? t0 + g.u * .6 : g.wave === 1 ? t1 + g.u * .5 : tp + .3 + g.u * 1.4;
      const kk = s2pop(tau, tA, .4); if (kk <= 0) return;
      const u = g.u + .012 * Math.sin(tau * .9 + g.ph), [x, y, an] = s2GutAt(u), off = g.off + 6 * Math.sin(tau * 1.4 + g.ph);
      const bx = x - Math.sin(an) * off, by = y + Math.cos(an) * off, ang = (Math.cos(an) < 0 ? an + Math.PI : an) + .25 * Math.sin(tau * 2 + g.ph);
      pop(c, bx, by, kk, () => s2Bug(c, bx, by, g.sz, g.kind, g.col, ang, tau, 200 + k));
    });
    // 多样性刻度条
    const kg = s2pop(tau, t1 - .15), gx = 1660, gt = 305, gb = 665, gw = 56;
    const lvl = key(tau, [[t1, .22], [t1 + .8, .5], [tg, .5], [tg + .9, .9]]);
    pop(c, gx + gw / 2, (gt + gb) / 2, kg, () => {
      zh(c, '多样性', gx + gw / 2, gt - 24, { size: 40, align: 'center' });
      const box = rectPts(gx, gt, gw, gb - gt, 24);
      rshape(c, box, { fill: '#fffaf0', stroke: false });
      c.save(); c.clip(polyPath(box));
      const fy = lerp(gb, gt, lvl), col = lvl < .5 ? mix(P.red, P.gold, lvl * 2) : mix(P.gold, P.green, (lvl - .5) * 2);
      rshape(c, rectPts(gx - 6, fy, gw + 12, gb - fy + 6), { fill: col, stroke: false, seed: 5, t: tau });
      c.restore();
      rshape(c, box, { fill: null, stroke: P.ink, w: 4.5, seed: 6, t: tau });
      for (let k = 1; k < 4; k++) rline(c, [[gx, lerp(gb, gt, k / 4)], [gx + 14, lerp(gb, gt, k / 4)]], { w: 3, color: P.ink2, seed: 7 + k, amp: .4 });
      zh(c, '高', gx + gw + 14, gt + 30, { size: 32, color: P.ink2 }); zh(c, '低', gx + gw + 14, gb - 6, { size: 32, color: P.ink2 });
      const kh = s2pop(tau, tH); if (kh > 0) pop(c, gx - 34, fy, kh, () => rshape(c, heartPts(gx - 34, fy, 20), { fill: P.red, stroke: P.ink, w: 3, seed: 9, t: tau }));
    });
    if (tau > tg && tau < tg + 1.2) for (let k = 0; k < 5; k++) { const u = clamp((tau - tg - k * .1) / .8, 0, 1); sparkle(c, gx + gw / 2 + (k - 2) * 20, lerp(gb, gt, .9) - u * 60, 12 * Math.sin(u * Math.PI), { color: P.moon }); }
    // 一碗发酵食品倒进来
    const kb = s2pop(tau, tbw) * (1 - sm(tp + 1.8, tp + 2.1, tau, easeIn)), tilt = .95 * sm(tp - .1, tp + .4, tau);
    if (kb > 0) {
      pop(c, 800, 170, kb, () => { c.save(); c.translate(800, 170); c.rotate(tilt); s2FBowl(c, 0, 36, .9, tau); c.restore(); });
      zh(c, '发酵食品', 890, 196, { size: 38, al: clamp(kb, 0, 1), p: writeP(tau, tbw + .1, '发酵食品', .06), outline: P.paper, ow: 8 });
      if (tau > tp + .2) for (let k = 0; k < 12; k++) { const u = ((tau - tp - .2) * 1.6 + k / 12) % 1, cols = [P.teal, P.gold, P.sky, P.red, P.purple];
        c.fillStyle = cols[k % 5]; c.globalAlpha = clamp(kb, 0, 1) * (1 - u); c.beginPath(); c.arc(840 + u * 16 + (hash(k, 3) - .5) * 24, 200 + u * 90, 7, 0, TAU); c.fill(); c.globalAlpha = 1; }
    }
    // 炎症指标 ↓
    const ki = s2pop(tau, ti);
    pop(c, 1640, 760, ki, () => {
      const fs = lerp(1.5, .8, sm(ti + .3, ti + 1.0, tau)), fx = 1500, fy = 775;
      c.save(); c.translate(fx, fy); c.scale(fs, fs);
      rshape(c, [[0, 18], [-20, 6], [-18, -14], [-8, -6], [-6, -30], [8, -16], [14, -38], [22, -8], [20, 8]], { fill: P.orange, stroke: P.ink, w: 3, seed: 11, t: tau, smooth: true });
      c.restore();
      zh(c, '炎症指标', 1540, 790, { size: 44 });
      s2Arrow(c, 1745, 770, 46, 1, P.green, tau);
    });
  }));
}

// ===================== L11：这样吃 =====================
function s2Yogurt(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rline(c, [[14, -120], [48, -176]], { w: 8, color: P.gray, seed: 1, t });
  rshape(c, [[-52, -126], [52, -126], [42, 0], [-42, 0]], { fill: P.cap, stroke: P.ink, w: 4, seed: 2, t });
  rshape(c, [[-48, -92], [48, -92], [45, -50], [-45, -50]], { fill: P.sky, stroke: false, seed: 3, t });
  rshape(c, heartPts(0, -72, 14), { fill: '#fff', stroke: false, seed: 4, t });
  rshape(c, ellPts(0, -126, 56, 13), { fill: '#fffdf8', stroke: P.ink, w: 3.5, seed: 5, t });
  c.restore();
}
function s2Jar(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, [[-14, -140], [-2, -176], [20, -170], [12, -136]], { fill: P.green, stroke: P.ink, w: 3, seed: 1, t, smooth: true });
  rshape(c, [[-30, -140], [-24, -168], [0, -160], [4, -136]], { fill: P.red, stroke: P.ink, w: 3, seed: 2, t, smooth: true });
  rshape(c, [[-42, -140], [42, -140], [72, -100], [70, -34], [44, 0], [-44, 0], [-70, -34], [-72, -100]], { fill: mix(P.shelf2, P.orange, .35), stroke: P.ink, w: 4, seed: 3, t, smooth: true });
  rshape(c, ellPts(0, -140, 50, 12), { fill: mix(P.shelf2, P.ink, .2), stroke: P.ink, w: 3, seed: 4, t });
  rline(c, [[-58, -82], [58, -82]], { w: 4, color: alpha(P.paper, .6), seed: 5, t, dash: [14, 10] });
  rline(c, [[-50, -110], [-54, -50]], { w: 5, color: alpha('#fff', .35), seed: 6, t });
  c.restore();
}
function s2Natto(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let k = 0; k < 3; k++) rline(c, [[-6 + k * 14, -62], [-10 + k * 8 + 6 * Math.sin(t * 3 + k), -100], [-4, -130]], { w: 1.8, color: P.ink2, seed: 20 + k, t, smooth: true, al: .8 });
  rline(c, [[-8, -126], [70, -178]], { w: 6, color: P.shelf2, seed: 1, t }); rline(c, [[4, -132], [80, -170]], { w: 6, color: P.shelf2, seed: 2, t });
  rshape(c, [[-72, -62], [72, -62], [66, 0], [-66, 0]], { fill: P.cap, stroke: P.ink, w: 4, seed: 3, t });
  for (let k = 0; k < 9; k++) rshape(c, ellPts(-50 + (k % 5) * 25 + (k > 4 ? 12 : 0), -64 - (k > 4 ? 12 : 0), 12, 9), { fill: mix(P.gold, P.shelf2, .45), stroke: P.ink, w: 2, seed: 4 + k, t });
  rshape(c, [[-72, -62], [72, -62], [66, -40], [-66, -40]], { fill: null, stroke: false });
  c.restore();
}
function s2Box(c, x, y, s, t, veg) {   // 外卖盒；veg 0..1 加青菜粗粮
  c.save(); c.translate(x, y); c.scale(s, s);
  rshape(c, [[-110, -90], [110, -90], [124, -176], [-100, -186]], { fill: mix(P.cap, P.paper2, .6), stroke: P.ink, w: 4, seed: 1, t });
  rshape(c, [[-90, -86], [-60, -118], [-20, -126], [20, -120], [50, -106], [70, -90]], { fill: '#fffdf8', stroke: P.ink, w: 3, seed: 2, t, smooth: true });
  rshape(c, [[20, -96], [44, -120], [86, -112], [96, -90]], { fill: mix(P.orange, P.shelf2, .35), stroke: P.ink, w: 3, seed: 3, t, smooth: true });
  const leaves = [[-72, -104, -.5], [-44, -118, .2], [-20, -108, -.3]], grains = [[-4, -122], [8, -114], [18, -124], [-10, -112], [4, -128]];
  leaves.forEach(([lx, ly, r], k) => { const u = clamp(veg * 3 - k * .5, 0, 1); if (u <= 0) return; const dy = -160 * (1 - easeOutBack(u));
    rshape(c, ellPts(lx, ly + dy, 22, 11, 20, r), { fill: P.green, stroke: P.ink, w: 2.5, seed: 10 + k, t }); rline(c, [[lx - 16 * Math.cos(r), ly + dy - 16 * Math.sin(r)], [lx + 16 * Math.cos(r), ly + dy + 16 * Math.sin(r)]], { w: 2, color: mix(P.green, P.ink, .4), seed: 14 + k }); });
  grains.forEach(([gx, gy], k) => { const u = clamp(veg * 3 - 1.2 - k * .25, 0, 1); if (u <= 0) return; const dy = -160 * (1 - easeOutBack(u));
    rshape(c, ellPts(gx + 60, gy + dy + 8, 8, 6), { fill: P.gold, stroke: P.ink, w: 2, seed: 20 + k, t }); });
  rshape(c, [[-112, -92], [112, -92], [92, 0], [-92, 0]], { fill: P.cap, stroke: P.ink, w: 4, seed: 4, t });
  rline(c, [[-100, -64], [100, -64]], { w: 3, color: P.faint, seed: 5, t });
  c.restore();
}
function s2Boba(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rline(c, [[8, -196], [28, -262]], { w: 14, color: P.ink, seed: 1, t }); rline(c, [[8, -196], [28, -262]], { w: 8, color: P.pink, seed: 1, t });
  rshape(c, [[-54, -190], [54, -190], [42, 0], [-42, 0]], { fill: mix(P.orange, P.paper, .55), stroke: P.ink, w: 4, seed: 2, t });
  for (let k = 0; k < 7; k++) rshape(c, circPts(-30 + (k % 4) * 20 + (k > 3 ? 10 : 0), -16 - (k > 3 ? 18 : 0), 9, 12), { fill: P.ink, stroke: false, seed: 3 + k });
  rshape(c, ellPts(0, -194, 60, 16), { fill: P.cap, stroke: P.ink, w: 3.5, seed: 10, t });
  c.restore();
}
function s2Foods(c, tau) {
  const a = S2T(10), b = S2T(11) - .02; if (tau < a || tau > b) return;
  const out = 1 - sm(b - .22, b, tau, easeIn), by = 390;
  const top = [[930, 0, 3, '无糖酸奶', s2Yogurt], [1270, 5, 6, '泡菜', s2Jar], [1610, 8, 9, '纳豆', s2Natto]];
  const tV = s2ch(10, 16), tC = s2ch(10, 21), tT = s2ch(10, 23);
  fade(c, out, () => {
    top.forEach(([x, n0, n1, label, draw]) => {
      const t0 = s2ch(10, n0);
      pop(c, x, by - 70, s2pop(tau, t0), () => draw(c, x, by, .95, tau));
      zh(c, label, x, by + 56, { size: 40, align: 'center', p: writeP(tau, t0 + .1, label, .08) });
      pop(c, x + 80, by - 150, s2pop(tau, s2ch(10, n1) + .15), () => check(c, x + 80, by - 150, 56, { t: tau }));
    });
    const kb = s2pop(tau, s2ch(10, 13));
    pop(c, 1050, 700, kb, () => s2Box(c, 1050, 720, .95, tau, sm(tV, tV + 1.1, tau, s2lin)));
    zh(c, '+ 蔬菜粗粮', 1050, 800, { size: 40, align: 'center', color: mix(P.green, P.ink, .3), p: writeP(tau, tV + .2, '+ 蔬菜粗粮', .08) });
    pop(c, 1210, 590, s2pop(tau, tC), () => check(c, 1210, 590, 64, { t: tau }));
    const kt = s2pop(tau, s2ch(10, 13) + .3), sh = lerp(1.05, .6, sm(tT + .1, tT + .8, tau));
    pop(c, 1560, 720, kt, () => s2Boba(c, 1560, 730, .95 * sh, tau));
    if (tau > tT + .5) rshape(c, [[1560 + 70 * sh, 730 - 200 * sh], [1560 + 80 * sh, 730 - 178 * sh], [1560 + 70 * sh, 730 - 170 * sh], [1560 + 62 * sh, 730 - 178 * sh]], { fill: P.sky, stroke: P.ink, w: 2, seed: 9, t: tau, smooth: true });
    if (tau > tT) { zh(c, '少点奶茶', 1580, 800, { size: 40, align: 'center', color: P.red, p: writeP(tau, tT + .1, '少点奶茶', .08) });
      s2Arrow(c, 1680, 640, 46, 1, P.red, tau); }
  });
}

// ===================== L12：医生便签 =====================
function s2Note(c, tau) {
  const a = S2T(11), b = S2DUR - .55; if (tau < a || tau > b) return;
  const k = s2k(tau, a, b, .5), t1 = s2ch(11, 0), t2 = s2ch(11, 17), t3 = s2ch(11, 22);
  pop(c, S2BX, 480, k, () => {
    c.save(); c.translate(S2BX, 480); c.rotate(-.03 + .006 * Math.sin(tau * 1.5)); c.translate(-S2BX, -480);
    c.save(); c.fillStyle = alpha('#000', .15); c.fill(polyPath(rectPts(S2BX - 380, 262, 780, 460, 10))); c.restore();
    rshape(c, rectPts(S2BX - 390, 250, 780, 460, 10), { fill: '#fff7c9', stroke: P.ink, w: 4, seed: 301, t: tau });
    rshape(c, rectPts(S2BX - 70, 226, 140, 44, 4), { fill: alpha(P.sky, .6), stroke: false, seed: 302, t: tau });
    // 医院十字
    const cx0 = S2BX - 300, cy0 = 330;
    rshape(c, rectPts(cx0 - 48, cy0 - 48, 96, 96, 18), { fill: '#fff', stroke: P.red, w: 5, seed: 303, t: tau });
    rshape(c, [[cx0 - 12, cy0 - 34], [cx0 + 12, cy0 - 34], [cx0 + 12, cy0 - 12], [cx0 + 34, cy0 - 12], [cx0 + 34, cy0 + 12], [cx0 + 12, cy0 + 12], [cx0 + 12, cy0 + 34], [cx0 - 12, cy0 + 34], [cx0 - 12, cy0 + 12], [cx0 - 34, cy0 + 12], [cx0 - 34, cy0 - 12], [cx0 - 12, cy0 - 12]], { fill: P.red, stroke: false, seed: 304, t: tau });
    zh(c, '胃不好', S2BX - 200, 350, { size: 56, p: writeP(tau, t1, '胃不好', .1) });
    zh(c, '有进食困扰', S2BX - 200, 436, { size: 56, p: writeP(tau, s2ch(11, 4), '有进食困扰', .1) });
    if (tau > t2 - .1) { s2Arrow(c, S2BX - 250, 540, 50, 1, P.blue, tau);
      zh(c, '先问医生', S2BX - 200, 566, { size: 64, color: mix(P.blue, P.ink, .3), p: writeP(tau, t2, '先问医生', .1) }); }
    if (tau > t3) { zh(c, '别硬饿', S2BX + 150, 660, { size: 48, color: P.red, p: writeP(tau, t3, '别硬饿', .1) });
      rline(c, [[S2BX + 140, 676], [S2BX + 310, 672]], { w: 4, color: P.red, seed: 305, t: tau, p: sm(t3 + .3, t3 + .6, tau) }); }
    // 小胃也来了：先紧张，听到「先问医生」松口气
    const kt = s2pop(tau, s2ch(11, 8));
    pop(c, S2BX + 250, 470, kt, () => s2Tummy(c, S2BX + 250, 450 - Math.abs(Math.sin(tau * 3)) * 4, .9, tau < t2 + .3 ? 'shock' : 'happy', tau, 11));
    if (tau > t2 + .4) { const kh = s2pop(tau, t2 + .4); pop(c, S2BX + 320, 370, kh, () => rshape(c, heartPts(S2BX + 320, 370, 22), { fill: P.red, stroke: P.ink, w: 3, seed: 306, t: tau })); }
    c.restore();
  });
}

// ===================== 讲台 + 姿势 =====================
function s2Pose(tau, L) {
  const gesture = L.talking ? .45 + .45 * Math.abs(Math.sin(tau * 1.6)) : .25;
  let pose = 'lecture';
  const inL = (i, a = -.1) => tau >= S2T(i) + a && tau < (i + 1 < S2LINES.length ? S2T(i + 1) - .1 : S2DUR);
  if (inL(3)) pose = 'point';
  else if (inL(5)) pose = tau < s2ch(5, 10) ? 'point' : 'shrug';
  else if (inL(6)) pose = 'point';
  else if (inL(7)) pose = tau < s2ch(7, 18) ? 'lecture' : 'point';
  else if (inL(8)) pose = tau < S2T(8) + 1.3 ? 'read' : 'lecture';
  else if (inL(9)) pose = 'point';
  else if (inL(10)) pose = 'cheer';
  if (tau > S2DUR - .6) pose = 'lecture';
  return { pose, gesture };
}
function s2Cam(tau) {   // 讲台镜头：[缩放, 焦点 x, 焦点 y, 抖动 x, 抖动 y]
  const tx = s2ch(5, 11) + .1;
  let s = 1, fx = CX, fy = CY, dx = 0, dy = 0;
  if (tau > S2T(5) - .1 && tau < S2T(6) + .5) { s = key(tau, [[S2T(5), 1], [S2T(5) + .9, 1.05], [S2E(5) + .2, 1.05], [S2T(6) + .4, 1]]); fx = 1560; fy = 470;
    if (tau > tx + .25) { const d = Math.exp(-(tau - tx - .25) * 9); dx = 12 * Math.sin(tau * 83) * d; dy = 8 * Math.cos(tau * 71) * d; } }
  else if (tau > S2T(9) - .1 && tau < S2T(10) + .5) { s = key(tau, [[S2T(9), 1], [S2T(9) + 1.6, 1.04], [S2E(9), 1.04], [S2T(10) + .4, 1]]); fx = 1250; fy = 470; }
  return [s, fx, fy, dx, dy];
}
function s2Stage(c, tau, L) {
  libraryBg(c, tau);
  board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau });
  s2Title(c, tau);
  s2Scale(c, tau); s2Day(c, tau, L); s2Week(c, tau); s2Drinks(c, tau); s2Gut(c, tau); s2Foods(c, tau); s2Note(c, tau);
  stageChar(c, tau, L, s2Pose(tau, L));
}

scene({ order: 2, key: 'diet', title: '吃饭', dur: S2DUR, lines: S2LINES,
  fn(c, tau, L) {
    const z = Math.min(sm(S2FS.in0, S2FS.in1, tau), 1 - sm(S2FS.out0, S2FS.out1, tau));
    if (z >= 1) { s2Lab(c, tau, L); return; }
    c.save();
    if (z > 0) { const s = lerp(1, 1.75, z); c.translate(lerp(S2BX, CX, z), lerp(465, CY, z)); c.scale(s, s); c.translate(-S2BX, -465); }
    else { const [s, fx, fy, dx, dy] = s2Cam(tau); c.translate(fx + dx, fy + dy); c.scale(s, s); c.translate(-fx, -fy); }
    s2Stage(c, tau, L);
    c.restore();
    if (z > 0) fade(c, sm(.55, 1, z), () => s2Lab(c, tau, L));
    fade(c, 1 - sm(0, .3, z), () => chapterTag(c, tau, '第二页 · 吃饭', { t0: tau < S2FS.out0 ? 0 : S2FS.out1 - .1 }));
  } });
