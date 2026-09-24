'use strict';
// 第 4 段：专注（第二版编配：蓝晒星图 cyanotype，见 docs/分镜v2.md 顶部表格）。
//   普鲁士蓝的蓝晒纸，白线白字。神经元是三维空间里的星（proj 透视，星云缓慢旋转，近大远小，镜头慢漂出视差），连线是星座。
//   进场：handoffSparks（动力段结束时的金色火花）冷却成白色星星，蓝晒液一刷一刷盖满画面。
//   L0 星座连线、断开、改连别的星 → L1 错题的红叉，星星一颗颗亮成金色「可改写」 → L2 两条星路：放弃 / 倒带 / 再试一次
//   → L3 白天插小旗，夜更深的蓝盖过半张星图，小旗变成实线（帕秋莉坐在大星上睡着） → L4 绕星云的一圈轨道：90 实线 + 20 虚线
//   → L5 一片空白：连线消失、星云缩成一团 → L6 星云跟着「吸、再吸、呼——」鼓两下再长长地收（一遍半）
//   → L7 星云退到远处，前景一个白线小人和一条视线：屏幕高/低 → L8 消息把视线拽走，专注模式，手机被弹进远处成了一颗星
//   → L9 十二颗星排成 24 小时的环，手机那颗落进 2 小时的一格。
//   出场：星图缩成摊在魔导书上的一张蓝晒纸，右半张像书页一样折过来（背面就是空白书页），最后只画 handoffBook。
// 顶层名字一律带本段前缀 S4 / s4。
const S4LINES = seq(1.4, [
  '第四页：学习与专注。学习，就是大脑在重新布线。',
  '做错题时那股挫败感，恰恰是大脑进入“可改写”状态的信号。',
  ['这时候放弃，大脑学会的就是“放弃”。再坚持一下。', { mood: 'smug' }],
  '白天做好标记，真正的布线，大多在休息和睡眠里完成。',
  '所以学 90 分钟左右，就休息 20 分钟。不是刷手机那种休息。',
  '紧张到脑子一片空白？试试“生理叹息”：',
  ['用鼻子连吸两口气，再用嘴慢慢地、长长地呼出去。', { hold: 2.5 }],
  '视线往上更清醒，往下容易犯困：屏幕别放太低。',
  ['消息一闪，注意力就被偷走了。开专注模式，手机放远点。', { mood: 'annoyed' }],
  '有研究建议：成年人每天刷手机，最好不超过 2 小时。',
]);
const s4T = i => S4LINES[i][0], s4E = i => S4LINES[i][1];
// s4At：第 i 句「说到」比例 f 的时刻（按语音长度算，没有语音时按整句）
const s4At = (i, f) => { const v = voiceOf(S4LINES[i][2]); return s4T(i) + f * (v ? v.d : s4E(i) - s4T(i) - .3); };
const S4IN = .2, S4END = seqEnd(S4LINES), S4X0 = S4END + .6, S4X1 = S4X0 + 1.1, S4X2 = S4X1 + .9, S4DUR = S4X2 + .25;

// ===================== 颜色：蓝晒 =====================
const S4C = { bg: mix(P.blue, '#0b2a55', .62), hi: mix(P.blue, '#2a64a0', .5), deep: mix(P.blue, '#061a36', .7), night: mix(P.night, '#08204a', .55),
  white: '#eef0e6', red: mix(P.red, '#ffffff', .25), gold: P.moon, edge: '#e4e2d6' };
const s4W = (a = 1) => alpha(S4C.white, a);

// 蓝晒纸：底色 + 曝光不匀的色斑 + 刷子纹 + 四边露出的纸（载入时画一次）；S4INSET 是刷子没刷到的纸边宽度
const S4INSET = 34;
function s4EdgePts(seed) { // 刷涂区域的轮廓：四边各自毛糙，角是圆的
  const pts = [], m = S4INSET, pad = (u, s) => m - 12 + 16 * noise1(u * 22, s) + 5 * noise1(u * 90, s + 5);
  const n = 90; for (let i = 0; i < n; i++) { const u = i / n; pts.push([m + u * (W - 2 * m), pad(u, seed)]); }
  for (let i = 0; i < 50; i++) { const u = i / 50; pts.push([W - pad(u, seed + 1), m + u * (H - 2 * m)]); }
  for (let i = 0; i < n; i++) { const u = i / n; pts.push([W - m - u * (W - 2 * m), H - pad(u, seed + 2)]); }
  for (let i = 0; i < 50; i++) { const u = i / 50; pts.push([pad(u, seed + 3), H - m - u * (H - 2 * m)]); }
  return pts; }
const S4EDGE = polyPath(s4EdgePts(7));
const S4SHEET = (() => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), r = rng(401);
  g.fillStyle = S4C.edge; g.fillRect(0, 0, W, H);
  // 纸边上的刷毛痕：左右两边横向的细长笔触伸进纸边
  g.save(); g.lineCap = 'round';
  for (let k = 0; k < 90; k++) { const y = r() * H, left = k % 2, len = 30 + r() * 60; g.strokeStyle = alpha(S4C.bg, .25 + r() * .4); g.lineWidth = 1 + r() * 3.5;
    g.beginPath(); if (left) { g.moveTo(S4INSET + 20, y); g.lineTo(S4INSET + 20 - len, y + (r() - .5) * 4); } else { g.moveTo(W - S4INSET - 20, y); g.lineTo(W - S4INSET - 20 + len, y + (r() - .5) * 4); } g.stroke(); }
  g.restore();
  g.save(); g.clip(S4EDGE);
  g.fillStyle = S4C.bg; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 14; k++) { const x = r() * W, y = r() * H, rr = 220 + r() * 520, col = r() < .5 ? S4C.hi : S4C.deep, a = .16 + r() * .2;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, alpha(col, a)); gr.addColorStop(1, alpha(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  // 刷子纹：少量宽而淡的横向笔触，略斜
  for (let k = 0; k < 22; k++) { const y = r() * H, w = 30 + r() * 110, tilt = (r() - .5) * 60;
    g.strokeStyle = alpha(r() < .5 ? S4C.hi : S4C.deep, .05 + r() * .07); g.lineWidth = w; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-100, y - tilt); g.bezierCurveTo(W * .33, y + (r() - .5) * 50, W * .66, y + (r() - .5) * 50, W + 100, y + tilt); g.stroke(); }
  // 边缘药液积得厚一点：内框附近压暗
  const vg = g.createRadialGradient(CX, CY, H * .45, CX, CY, W * .62); vg.addColorStop(0, alpha(S4C.deep, 0)); vg.addColorStop(1, alpha(S4C.deep, .45)); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.restore();
  grain(g, polyPath(rectPts(0, 0, W, H)), .16);
  return cv;
})();

// ===================== 星（神经元）和连线 =====================
const S4N = 44;
const S4ST = (() => { const r = rng(404), out = []; let guard = 0;
  while (out.length < S4N && guard++ < 20000) { const x = r() * 2 - 1, y = r() * 2 - 1, z = r() * 2 - 1; if (x * x + y * y + z * z > 1) continue;
    const p = [x * 540, y * 300, z * 420]; if (out.some(q => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 125)) continue; out.push([...p, .45 + r() * .8]); }
  return out; })();
const s4D = (i, j) => Math.hypot(S4ST[i][0] - S4ST[j][0], S4ST[i][1] - S4ST[j][1], S4ST[i][2] - S4ST[j][2]);
// 连线：最近邻，每颗星最多 3 条
const S4ED = (() => { const pr = []; for (let i = 0; i < S4N; i++) for (let j = i + 1; j < S4N; j++) pr.push([s4D(i, j), i, j]); pr.sort((a, b) => a[0] - b[0]);
  const deg = Array(S4N).fill(0), E = []; for (const [d, i, j] of pr) { if (E.length >= 58 || d > 340) break; if (deg[i] < 3 && deg[j] < 3) { E.push([i, j]); deg[i]++; deg[j]++; } } return E; })();
const s4Has = (i, j) => S4ED.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
// L0 改连的几条：[边序号, 新的另一端]
const S4REW = [5, 13, 22, 31].filter(e => e < S4ED.length).map(e => { const [i, j] = S4ED[e]; let best = -1, bd = 1e9;
  for (let k = 0; k < S4N; k++) if (k !== i && k !== j && !s4Has(i, k)) { const d = s4D(i, k); if (d < bd) { bd = d; best = k; } } return [e, best]; });

// 旋转：绕 Y 转 a，再绕 X 转 b
function s4Rot(p, a, b) { const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b); const x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca; return [x, p[1] * cb - z * sb, p[1] * sb + z * cb]; }
const s4Ang = tau => .35 + tau * .055;
const S4TILT = .2;
const s4Cam = tau => ({ x: 200 + 90 * Math.sin(tau * .13), y: 30 + 40 * Math.sin(tau * .11 + 1), z: -1500, f: 1250 });

// 生理叹息的呼吸量 0..1：吸（大）→ 再吸（补一小口）→ 呼（长），做一遍半。时间对着语音：「连吸」「两口气」「再用嘴慢慢地、长长地呼出去」
function s4Breath(tau) {
  const t0 = s4T(6), u = tau - t0, v = voiceOf(S4LINES[6][2]), d = v ? v.d : 4.5;
  const i1 = d * .13, i2 = d * .26, ex0 = d * .42, ex1 = d + .15, c2 = ex1 + .25;
  return key(u, [[i1, 0], [i1 + .45, .72], [i2, .72], [i2 + .3, 1], [ex0, 1], [ex1, 0], [c2, 0], [c2 + .45, .72], [c2 + .6, .72], [c2 + .85, 1], [c2 + 1.05, 1], [c2 + 2.4, .15]], easeSine);
}
// 呼吸的各相（用来点亮「吸」「再吸」「呼——」）：返回 [吸, 再吸, 呼] 各自的亮度
function s4BreathPh(tau) { const u = tau - s4T(6), v = voiceOf(S4LINES[6][2]), d = v ? v.d : 4.5, i1 = d * .13, i2 = d * .26, ex0 = d * .42, ex1 = d + .15, c2 = ex1 + .25;
  const on = (a, b) => Math.min(sm(a - .1, a + .1, u), 1 - sm(b - .1, b + .15, u));
  return [Math.max(on(i1, i2), on(c2, c2 + .6)), Math.max(on(i2, ex0), on(c2 + .6, c2 + 1.05)), Math.max(on(ex0, ex1 + .2), on(c2 + 1.05, c2 + 2.5))]; }

// 星云这一刻的形态：缩放、偏移（退到远处）、抖
function s4CloudState(tau) {
  const t5 = s4T(5), t6 = s4T(6), t7 = s4T(7), t9 = s4T(9);
  let sc = key(tau, [[s4At(5, .25), 1], [s4At(5, .45), .42]], easeOutBack);
  if (tau >= t6 - .3) sc = lerp(.42, key(tau, [[s4E(6) - .2, .42], [s4E(6) + .4, 1]]), sm(s4E(6) - .2, s4E(6) + .4, tau)) + .42 * s4Breath(tau) * (1 - sm(s4E(6) - .2, s4E(6) + .4, tau));
  const back = key(tau, [[t7 - .25, 0], [t7 + .45, 1], [t9 - .1, 1], [t9 + .7, 0]]);
  const off = [lerp(0, 420, back), lerp(0, -560, back), lerp(0, 2600, back)];
  const shake = sm(s4At(5, .2), s4At(5, .35), tau) * (1 - sm(t6 - .4, t6, tau));
  return { sc, off, shake, lines: 1 - Math.max(sm(s4At(5, .25), s4At(5, .38), tau) * (1 - sm(t7 + .3, t7 + .9, tau)), 0), back };
}
// 第 i 颗星在世界里的位置
function s4StarW(i, tau, S) {
  const s = S4ST[i]; let p = s4Rot([s[0] * S.sc, s[1] * S.sc, s[2] * S.sc], s4Ang(tau), S4TILT);
  if (S.shake > 0) { const tt = twos(tau); p = [p[0] + S.shake * 9 * noise1(tt * 9 + i, 3), p[1] + S.shake * 9 * noise1(tt * 9 + i, 7), p[2]]; }
  p = [p[0] + S.off[0], p[1] + S.off[1], p[2] + S.off[2]];
  // L9：十二颗星排成 24 小时的环
  const rk = S4RING.indexOf(i);
  if (rk >= 0) { const m = sm(s4T(9) - .1 + rk * .06, s4T(9) + .9 + rk * .06, tau, easeIO); if (m > 0) p = p.map((v, j) => lerp(v, s4RingW(rk, tau)[j], m)); }
  return p;
}
// 24 小时环：12 颗星，每格 2 小时。先转进来，停在「红的那格」朝右上
const S4RING = (() => { const idx = S4ST.map((s, i) => [s[3], i]).sort((a, b) => b[0] - a[0]).slice(0, 12).map(x => x[1]); return idx; })();
const S4RR = 360;
function s4RingTh(tau) { return key(tau, [[s4T(9) + .3, -1.6], [s4T(9) + 1.6, 0]], easeOut); }
function s4RingPt(th) { return s4Rot([S4RR * Math.sin(th), -S4RR * Math.cos(th), 0], -.28, .42); }
function s4RingW(k, tau) { return s4RingPt(s4RingTh(tau) + k * TAU / 12); }

// 背景的远星（视差）
// 近处飘过的几粒星尘（离镜头近，镜头一漂就移得多：视差）
const S4NEAR = Array.from({ length: 16 }, (_, k) => [(hash(k, 56) - .5) * 1900, (hash(k, 57) - .5) * 1100, -1050 + hash(k, 58) * 500, hash(k, 59)]);
const S4DUST = Array.from({ length: 170 }, (_, k) => [(hash(k, 51) - .5) * 5200, (hash(k, 52) - .5) * 3000, 900 + hash(k, 53) * 3800, hash(k, 54)]);

// ===================== 小画具 =====================
function s4Header(c, tau) { const k = sm(.9, 1.3, tau); if (k <= 0) return; const x = 96, y = 110, txt = '第四页 · 专注', p = writeP(tau, 1.0, txt, .06);
  c.save(); c.globalAlpha *= k; drawMoonIcon(c, x, y - 14, 16, S4C.gold, -.5);
  zh(c, txt, x + 30, y, { size: 36, color: s4W(.92), p }); rline(c, [[x + 30, y + 14], [x + 30 + zhWidth(c, txt, 36) * p, y + 14]], { w: 1.5, color: s4W(.5), seed: 4130 }); c.restore(); }
// 白字（逐字写出）
function s4Txt(c, text, x, y, tau, t0, o = {}) { if (tau < t0) return; zh(c, text, x, y, { size: 44, color: s4W(.95), p: writeP(tau, t0, text, o.spc || .07), ...o }); }
// 星：小的是圆点，亮的带四角芒
function s4Star(c, x, y, r, col, glint = 0) {
  c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  if (glint > 0) sparkle(c, x, y, r * (2.2 + 1.2 * glint), { color: col, al: .85 });
}
// 连线：白线，远的细而淡
function s4Line(c, a, b, o = {}) { const { p = 1, al = 1, col = S4C.white, w = null, seed = 1, dash = null } = o; if (!a || !b || p <= 0 || al <= 0) return;
  const k = (a[2] + b[2]) / 2, ww = w ?? (1 + 2.2 * clamp((k - .45) / .5, 0, 1)), aa = al * clamp(.35 + (k - .5) * 1.2, .25, .95);
  rline(c, [[a[0], a[1]], [b[0], b[1]]], { w: ww, color: alpha(col, aa), p, seed, amp: .5, dash }); }
// 取线段 a→b 上比例 u 的点
const s4L = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// 白线小人（侧面，坐在桌前）。d 低头 0..1，lift 屏幕垫高 0..1，gz 视线被拽向 { p, k }，books 三本垫书各自往右抽出去的量 0..1。返回 { eye, scr, head }
function s4Figure(c, tau, d, lift, gz, books) {
  const o = { w: 4, color: s4W(.95), amp: .7 }, sd = 4300, X = 300, DY = 745;
  // 凳子、桌子
  rline(c, [[X + 30, DY + 40], [X + 150, DY + 40]], { ...o, seed: sd }); rline(c, [[X + 45, DY + 40], [X + 30, 885]], { ...o, seed: sd + 1 }); rline(c, [[X + 135, DY + 40], [X + 150, 885]], { ...o, seed: sd + 2 });
  rline(c, [[X + 250, DY], [X + 720, DY]], { ...o, seed: sd + 3 }); rline(c, [[X + 280, DY], [X + 280, 885]], { ...o, seed: sd + 4 }); rline(c, [[X + 690, DY], [X + 690, 885]], { ...o, seed: sd + 5 });
  // 身体：背随低头弯
  const hip = [X + 95, DY + 25], sh = [X + 112 + 40 * d, DY - 160 + 22 * d], head = [X + 136 + 66 * d, DY - 222 + 46 * d];
  rline(c, [hip, [X + 88 + 16 * d, DY - 70], sh], { ...o, smooth: true, seed: sd + 6 });
  rline(c, [hip, [X + 215, DY + 35], [X + 222, 880], [X + 252, 880]], { ...o, seed: sd + 7 });
  rline(c, [sh, [X + 196 + 10 * d, DY - 72], [X + 300, DY - 8]], { ...o, seed: sd + 8 });
  rline(c, [sh, head], { ...o, seed: sd + 9 });
  rline(c, circPts(head[0], head[1], 38, 28), { ...o, close: true, seed: sd + 10 });
  // 三本垫书（抽出去时往右滑、淡掉）
  const bh = 52; books.forEach((u, k) => { if (u >= 1) return; const y1 = DY - bh * k, y0 = y1 - bh; c.save(); c.globalAlpha *= 1 - u;
    rline(c, rectPts(X + 430 + u * (260 + k * 60) + (k % 2) * 10, y0, 200 - k * 14, bh), { ...o, w: 3, close: true, seed: sd + 20 + k }); c.restore(); });
  const top = DY - bh * 3 * lift;
  // 笔记本电脑（侧面）：底座 + 翻起来的屏幕
  const bx0 = X + 450, bx1 = X + 610; rline(c, [[bx0, top], [bx1, top]], { ...o, w: 5, seed: sd + 30 });
  rline(c, [[bx1 - 6, top], [bx1 - 34, top - 130]], { ...o, w: 6, seed: sd + 31 });
  const scr = [bx1 - 22, top - 70];
  // 眼睛和视线
  const eye = [head[0] + 20, head[1] - 4 + 4 * d], closed = d > .6;
  if (closed) rline(c, [[eye[0] - 7, eye[1]], [eye[0], eye[1] + 4], [eye[0] + 7, eye[1]]], { ...o, w: 3, seed: sd + 40 }); else { c.fillStyle = s4W(); c.beginPath(); c.arc(eye[0], eye[1], 4.5, 0, TAU); c.fill(); }
  const tgt = gz && gz.k > 0 ? s4L(scr, gz.p, gz.k) : scr;
  if (!closed || (gz && gz.k > 0)) rline(c, [[eye[0] + 10, eye[1]], tgt], { w: 2.5, color: s4W(.8), dash: [3, 12], seed: sd + 41, amp: .3 });
  return { eye, scr, head, top };
}
// 手机：白线轮廓，on 亮屏，moon 专注模式（屏幕压暗 + 金月牙），dot 红点
function s4Phone(c, x, y, s, o = {}) { const { dot = 0, moon = 0, al = 1, rot = 0 } = o; if (al <= 0 || s <= .01) return;
  c.save(); c.globalAlpha *= al; c.translate(x, y); c.rotate(rot); c.scale(s, s);
  cutPaper(c, rectPts(-40, -72, 80, 144, 12), alpha(S4C.white, .9), { seed: 4401, step: 20, grain: .05, blur: 4 });
  const scr = rectPts(-32, -58, 64, 110, 5); cutPaper(c, scr, mix(S4C.hi, S4C.white, .55 * (1 - moon)), { seed: 4402, step: 20, shadow: false, grain: 0, edge: false });
  if (moon > 0) { drawMoonIcon(c, 0, -2, 22 * easeOutBack(clamp(moon, 0, 1)), S4C.gold, -.5); }
  else { for (let k = 0; k < 3; k++) rline(c, [[-20, -36 + k * 18], [16 - k * 10, -36 + k * 18]], { w: 4, color: s4W(.8), seed: 4403 + k, amp: .3 }); }
  if (dot > 0) { c.fillStyle = S4C.red; c.beginPath(); c.arc(34, -66, 13 * dot, 0, TAU); c.fill(); }
  c.restore(); }
// 蓝晒「实物投影」小图：闭眼、脚印、手机（白色剪影）
function s4Icon(c, kind, x, y, k) { if (k <= .01) return; pop(c, x, y, k, () => {
  const o = { w: 4, color: s4W(.95), amp: .5, seed: 4500 + kind.length };
  if (kind === 'eye') { rline(c, [[x - 26, y - 4], [x - 12, y + 8], [x + 12, y + 8], [x + 26, y - 4]], { ...o, smooth: true }); for (let k2 = -1; k2 <= 1; k2++) rline(c, [[x + k2 * 12, y + 9], [x + k2 * 15, y + 20]], { ...o, w: 3, seed: 4510 + k2 }); }
  if (kind === 'walk') { cutPaper(c, ellPts(x - 12, y + 6, 10, 18, 16, -.2), s4W(.92), { seed: 4520, step: 8, grain: 0 }); cutPaper(c, ellPts(x + 14, y - 10, 10, 18, 16, .2), s4W(.92), { seed: 4521, step: 8, grain: 0 }); }
  if (kind === 'phone') s4Phone(c, x, y, .36, {});
}); }

// 错题纸（蓝晒的实物投影：纸是白的，字行是蓝的缝）
function s4Quiz(c, x, y, k, tau, rx) { if (k <= .01) return; pop(c, x, y, k, () => {
  c.save(); c.translate(x, y); c.rotate(-.08);
  cutPaper(c, [[-80, -100], [52, -100], [80, -72], [80, 100], [-80, 100]], alpha(S4C.white, .88), { seed: 4601, step: 18, grain: .06 });
  for (let r = 0; r < 5; r++) { c.fillStyle = alpha(S4C.bg, .55); c.fillRect(-58, -66 + r * 32, r === 2 ? 80 : 112 - (r % 2) * 30, 7); }
  zh(c, '错题', -58, -78, { size: 22, color: alpha(S4C.bg, .8) });
  cross(c, 10, 8, 110, { color: S4C.red, p: rx, w: 13, seed: 4602, amp: 1.2 });
  c.restore(); }); }

// ===================== 帕秋莉：每句的表演 =====================
function s4Char(c, tau, L) {
  const t = s4T, ln = k => tau >= t(k), talk = L.talking ? L.mouth : 0;
  // 每句换个位置：句首突然漂过去，然后停住
  const xs = [1500, 1470, 1400, 1560, 1500, 1560, 1470, 1590, 1520, 1450]; let x = xs[0];
  for (let k = 1; k < xs.length; k++) x = lerp(x, xs[k], sm(t(k) - .25, t(k) + .3, tau, easeIO));
  let o = { x, y: 862, h: 520, pose: 'lecture', mood: L.mood || 'normal', look: -.3, facing: -1, tilt: 0 };
  if (!ln(1)) { o.gesture = tau < s4At(0, .6) ? .4 : .6 + .4 * Math.sin(twos(tau) * 2); }
  if (ln(1) && !ln(2)) { const f = (tau - t(1)); if (f < s4At(1, .5) - t(1)) { o.pose = 'hide'; o.mood = 'flustered'; o.look = -.6; } else { o.pose = 'point'; o.mood = 'normal'; o.look = -.8; } }
  if (ln(2) && !ln(3)) { if (tau < s4At(2, .62)) { o.pose = 'cross'; o.mood = 'pout'; } else { o.pose = 'point'; o.mood = 'smug'; o.look = -.7; } }
  if (ln(3) && !ln(4)) { o.pose = 'sit'; o.y = 712; o.mood = tau < s4At(3, .3) ? 'normal' : 'sleepy'; o.tilt = .12 * sm(s4At(3, .45), s4At(3, .75), tau); }
  if (ln(4) && !ln(5)) { if (tau < s4At(4, .62)) { o.pose = 'point'; o.look = -.8; o.mood = 'normal'; } else { o.pose = 'cross'; o.mood = 'pout'; } }
  if (ln(5) && !ln(6)) { if (tau < s4At(5, .55)) { o.pose = 'hide'; o.mood = 'flustered'; o.x += 4 * Math.sin(twos(tau) * 40); } else { o.pose = 'lecture'; o.mood = 'normal'; o.gesture = .9; } }
  if (ln(6) && !ln(7)) { const b = s4Breath(tau); o.pose = 'stand'; o.h = 520 * (1 + .035 * b); o.tilt = -.08 * b; o.mood = b < .5 && tau > s4At(6, .5) ? 'smile' : 'normal'; }
  if (ln(7) && !ln(8)) { if (tau < s4At(7, .45)) { o.pose = 'lecture'; o.look = -.5; } else if (tau < s4At(7, .72)) { o.pose = 'tired'; o.mood = 'sleepy'; } else { o.pose = 'point'; o.mood = 'annoyed'; o.look = -.8; } }
  if (ln(8) && !ln(9)) { if (tau < s4At(8, .55)) { o.pose = 'cross'; o.mood = 'annoyed'; } else if (tau < s4At(8, .8)) { o.pose = 'point'; o.mood = 'annoyed'; o.look = -.9; } else { o.pose = 'lecture'; o.mood = 'smug'; } }
  if (ln(9)) { if (tau < s4At(9, .7)) { o.pose = 'point'; o.look = -.8; o.mood = 'normal'; } else { o.pose = 'cross'; o.mood = 'smug'; } }
  // 飘着：轻轻上下（坐在大星上时跟着星）
  const bob = 7 * Math.sin(twos(tau) * 1.5);
  const drop = 1 - sm(1.0, 1.7, tau, easeOutBack);
  o.y += bob - drop * 900;
  c.save(); c.filter = 'brightness(.9) saturate(.85)';
  const r = drawPatchouli(c, { ...o, mouth: talk, blink: o.mood === 'sleepy' && tau > s4At(3, .6) && tau < t(4) ? 1 : blinkAt(tau, 4), t: tau });
  c.restore(); return { ...r, o };
}

// ===================== 整幅星图（进场、正文；出场时整张缩放折叠） =====================
function s4Scene(c, tau, L) {
  const cam = s4Cam(tau), S = s4CloudState(tau);
  // ---- 纸：进场时蓝晒液一刷一刷盖过夜色 ----
  const dev = sm(S4IN, S4IN + 1.1, tau);
  if (dev < 1) { c.fillStyle = NIGHT_BG; c.fillRect(0, 0, W, H); grain(c, polyPath(rectPts(0, 0, W, H)), .06);
    // 一笔一笔从左往右刷：每笔的前端斜着、毛糙（刷毛）
    c.save(); const cl = new Path2D(), nb = 12, bh = H / nb; for (let k = 0; k < nb; k++) { const y0 = k * bh - 8, e = sm(S4IN + (k * 5 % nb) * .045, S4IN + .6 + (k * 5 % nb) * .045, tau, easeOut), x1 = lerp(-260, W + 260, e);
      const pts = [[-10, y0]]; for (let j = 0; j <= 8; j++) { const v = j / 8; pts.push([x1 + 90 * (.5 - v) + 30 * noise1(j * 1.7 + k * 5, 5), y0 + v * (bh + 16)]); } pts.push([-10, y0 + bh + 16]); cl.addPath(polyPath(pts)); }
    c.clip(cl); c.drawImage(S4SHEET, 0, 0); c.restore(); }
  else c.drawImage(S4SHEET, 0, 0);

  // ---- L3：夜，更深的蓝从右边盖过半张星图 ----
  const nk = sm(s4At(3, .3), s4At(3, .5), tau, easeOut) * (1 - sm(s4T(4) - .1, s4T(4) + .5, tau, easeIO));
  if (nk > 0) { const C0 = proj(S.off, cam), x0 = lerp(W + 60, (C0 ? C0[0] : 820) + 10, nk), pts = [[x0, -10]]; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([x0 + 26 * noise1(u * 9, 11) + (i % 2) * 8, u * H]); } pts.push([x0, H + 10], [W + 10, H + 10], [W + 10, -10]);
    c.save(); c.clip(S4EDGE); c.globalAlpha *= .85; cutPaper(c, pts, S4C.night, { seed: 4700, step: 30, shadow: false, grain: .1, edge: false }); c.restore();
    drawMoonIcon(c, x0 + 700 - 120, 190, 34 * sm(s4At(3, .5), s4At(3, .6), tau, easeOutBack), S4C.gold, -.4); }

  // ---- 远星 ----
  const dustA = dev;
  for (let k = 0; k < S4DUST.length; k++) { const d = S4DUST[k], p = proj(s4Rot(d, s4Ang(tau) * .35, 0), cam); if (!p || dustA <= 0) continue;
    const tw = .55 + .45 * Math.sin(twos(tau) * (1 + d[3] * 2) + k), r = clamp(1.8 * p[2] * 2.2, .8, 2.6);
    c.fillStyle = s4W(.5 * tw * dustA); c.beginPath(); c.arc(p[0], p[1], r, 0, TAU); c.fill(); }

  for (let k = 0; k < S4NEAR.length; k++) { const d = S4NEAR[k], p = proj([d[0], d[1], d[2]], cam); if (!p || dustA <= 0) continue;
    c.fillStyle = s4W(.22 * dustA); c.beginPath(); c.arc(p[0], p[1], 2 + 1.8 * p[2], 0, TAU); c.fill(); }

  // ---- 神经元星的投影 ----
  const PJ = []; for (let i = 0; i < S4N; i++) PJ.push(proj(s4StarW(i, tau, S), cam));
  const sparkE = i => sm(S4IN + .15 + (i % 12) * .04, S4IN + 1.0 + (i % 12) * .04, tau, easeIO);   // 进场：火花飞到星的位置

  // ---- L4：绕星云的一圈轨道：90 实线 + 20 虚线 ----
  const orbA = sm(s4T(4) - .1, s4T(4) + .3, tau) * (1 - sm(s4At(5, .25), s4At(5, .4), tau));
  const orbP = (th) => { const q = s4Rot([600 * Math.cos(th), 0, 600 * Math.sin(th)], s4Ang(tau) * .3 + .6, S4TILT + .32); return proj([q[0] + S.off[0], q[1] + S.off[1], q[2] + S.off[2]], cam); };
  const S4K90 = 90 / 110 * TAU, th0 = Math.PI * .55;
  if (orbA > 0) { c.save(); c.globalAlpha *= orbA;
    const p90 = sm(s4At(4, .05), s4At(4, .3), tau), p20 = sm(s4At(4, .38), s4At(4, .55), tau);
    const arc = (a0, a1, p, w, dash, al) => { const n = 60, pts = []; for (let i = 0; i <= n * p; i++) { const q = orbP(a0 + (a1 - a0) * i / n); if (q) pts.push([q[0], q[1]]); } if (pts.length > 1) rline(c, pts, { w, color: s4W(al), seed: 4801, amp: .4, dash }); };
    arc(th0, th0 + S4K90, p90, 5, null, .95);
    arc(th0 + S4K90 + .04, th0 + TAU - .04, p20, 3, [4, 14], .85);
    // 端点的小刻和珠子（学的时候跑得快，歇的时候慢）
    for (const a of [th0, th0 + S4K90]) { const q = orbP(a); if (q && p90 > .05) { c.fillStyle = s4W(); c.beginPath(); c.arc(q[0], q[1], 7, 0, TAU); c.fill(); } }
    const bu = (tau - s4At(4, .3)) * .6, bth = th0 + (bu % 1 < .82 ? bu % 1 / .82 * S4K90 : S4K90 + (bu % 1 - .82) / .18 * (TAU - S4K90));
    if (tau > s4At(4, .3)) { const q = orbP(bth); if (q) s4Star(c, q[0], q[1], 6, S4C.white, .6); }
    const m90 = orbP(th0 + S4K90 * .5), m20 = orbP(th0 + S4K90 + (TAU - S4K90) * .5);
    if (m90) { zh(c, '90', m90[0] - 40, m90[1] + 110, { size: 96, color: s4W(), p: writeP(tau, s4At(4, .12), '90', .15) }); s4Txt(c, '分钟 · 学', m90[0] + 70, m90[1] + 110, tau, s4At(4, .2), { size: 36 }); }
    if (m20) { zh(c, '20', m20[0] - 30, m20[1] - 70, { size: 72, color: s4W(.9), p: writeP(tau, s4At(4, .42), '20', .15) }); s4Txt(c, '分钟 · 歇', m20[0] + 50, m20[1] - 70, tau, s4At(4, .48), { size: 32 }); }
    c.restore(); }

  // ---- 连线 ----
  const baseA = S.lines * (1 - .9 * sm(s4T(9) + .2, s4T(9) + 1, tau));
  const drawIn = i => sm(s4T(0) - .6 + (i % 15) * .1, s4T(0) + .3 + (i % 15) * .1, tau);
  const rewT = k => s4At(0, .6 + k * .07);
  if (baseA > 0) S4ED.forEach(([i, j], e) => {
    const rw = S4REW.findIndex(r => r[0] === e);
    if (rw < 0) { s4Line(c, PJ[i], PJ[j], { p: drawIn(e), al: baseA, seed: 4900 + e }); return; }
    const tb = rewT(rw), nj = S4REW[rw][1], a = PJ[i], b = PJ[j], nb = PJ[nj]; if (!a || !b || !nb) return;
    if (tau < tb) { s4Line(c, a, b, { p: drawIn(e), al: baseA, seed: 4900 + e }); return; }
    // 断开：两截缩回各自的星
    const r = sm(tb, tb + .35, tau, easeOut), m = s4L(a, b, .5);
    if (r < 1) { s4Line(c, a, [...s4L(a, m, 1 - r), a[2]], { al: baseA, seed: 4950 + e }); s4Line(c, [...s4L(b, m, 1 - r), b[2]], b, { al: baseA, seed: 4960 + e }); }
    // 新连到另一颗星
    const g = sm(tb + .3, tb + .8, tau, easeIO); s4Line(c, a, nb, { p: g, al: baseA, seed: 4970 + e });
    if (g > 0 && g < 1) { const q = s4L(a, nb, g); s4Star(c, q[0], q[1], 4, S4C.white, .5); }
  });

  // ---- L1：错题 → 红叉 → 星星一颗颗亮成金色 ----
  const qx = 290, qy = 700, xi = S4X;
  const qk = sm(s4At(1, .03), s4At(1, .12), tau, easeOutBack) * (1 - sm(s4T(2) + .2, s4T(2) + .5, tau));
  s4Quiz(c, qx, qy, qk, tau, sm(s4At(1, .15), s4At(1, .3), tau));
  const sigP = sm(s4At(1, .38), s4At(1, .55), tau), X = PJ[xi];
  if (qk > .01 && X && sigP > 0) rline(c, [[qx + 60, qy - 70], [X[0], X[1]]], { w: 2.5, color: alpha(S4C.red, .8 * qk), dash: [2, 10], p: sigP, seed: 4990, amp: .4 });
  const goldT = k => s4At(1, .58) + k * .16, goldOff = (i) => { const rk = S4GOLD.indexOf(i); if (rk < 0) return 0;
    const on = sm(goldT(rk), goldT(rk) + .2, tau), fade = sm(s4At(2, .08), s4At(2, .3), tau) * (1 - sm(s4At(2, .64), s4At(2, .74), tau)), off = sm(s4T(3) + .2, s4T(3) + .8, tau);
    return on * (1 - fade * .85) * (1 - off); };
  if (tau > s4At(1, .7) && tau < s4T(3) + 1) { const G = PJ[S4GOLD[3]]; if (G) fade(c, 1 - sm(s4T(3), s4T(3) + .5, tau), () => s4Txt(c, '“可改写”', G[0] - 40, G[1] - 60, tau, s4At(1, .72), { size: 46, color: alpha(S4C.gold, .95) })); }

  // ---- L2：两条星路：放弃 / 倒带 / 再试一次 ----
  const pA = S4PATH.quit, pB = S4PATH.retry;
  const l2 = tau >= s4T(2) - .2 && tau < s4T(3) + .6, l2a = sm(s4T(2) - .2, s4T(2) + .2, tau) * (1 - sm(s4T(3), s4T(3) + .5, tau));
  if (l2 && l2a > 0 && X) { c.save(); c.globalAlpha *= l2a;
    const qA = PJ[pA], qB = PJ[pB];
    const runA = sm(s4At(2, .08), s4At(2, .34), tau, easeIO), back = sm(s4At(2, .64), s4At(2, .74), tau, easeIn), runB = sm(s4At(2, .76), s4At(2, .96), tau, easeIO);
    const solidA = runA * (1 - back);
    // 虚的两条路
    if (qA) { rline(c, [[X[0], X[1]], [qA[0], qA[1]]], { w: 2, color: s4W(.45), dash: [3, 12], seed: 5001, amp: .3 }); zh(c, '放弃', qA[0] - 30, qA[1] + 62, { size: 40, color: s4W(.85), p: writeP(tau, s4T(2) + .1, '放弃', .1) }); }
    if (qB) { rline(c, [[X[0], X[1]], [qB[0], qB[1]]], { w: 2, color: s4W(.45), dash: [3, 12], seed: 5002, amp: .3 }); zh(c, '再试一次', qB[0] - 40, qB[1] - 42, { size: 40, color: s4W(.85), p: writeP(tau, s4T(2) + .3, '再试一次', .1) }); }
    // 走「放弃」：那条路被刻成粗灰线（学会了放弃）
    if (qA && solidA > 0) rline(c, [[X[0], X[1]], s4L(X, qA, solidA)], { w: 7, color: alpha(mix(S4C.white, S4C.bg, .45), .95), seed: 5003, amp: .4 });
    // 彗星：去 → 倒带回来 → 走另一条
    let cm = null; if (tau < s4At(2, .64)) cm = runA > 0 && runA < 1 ? s4L(X, qA, runA) : null; else if (back < 1) cm = s4L(X, qA, 1 - back); else if (runB > 0) cm = s4L(X, qB, runB);
    if (cm && qA && qB) s4Star(c, cm[0], cm[1], 7, S4C.white, .7);
    if (back > 0 && back < 1 && qA) { const m = s4L(X, qA, .5); rline(c, circPts(m[0] - 40, m[1], 22, 20).slice(2), { w: 3, color: s4W(.8), seed: 5004 }); zh(c, '⟲', m[0] - 52, m[1] + 12, { size: 30, color: s4W(.8) }); }
    if (qB && runB > 0) { rline(c, [[X[0], X[1]], s4L(X, qB, runB)], { w: 6, color: s4W(.98), seed: 5005, amp: .4 }); }
    c.restore(); }

  // ---- L3：白天插小旗 → 夜里小旗变成实线 ----
  const markA = 1 - sm(s4At(5, .25), s4At(5, .38), tau);
  if (tau > s4T(3) && markA > 0) S4MARK.forEach((i, k) => { const q = PJ[i]; if (!q) return;
    const fk = sm(s4At(3, .06 + k * .06), s4At(3, .12 + k * .06), tau, easeOutBack), ln = sm(s4At(3, .55 + k * .08), s4At(3, .7 + k * .08), tau), flag = fk * (1 - ln);
    if (flag > .01) { rline(c, [[q[0], q[1]], [q[0], q[1] - 46 * fk]], { w: 2.5, color: s4W(.9), seed: 5100 + k }); cutPaper(c, [[q[0], q[1] - 46 * fk], [q[0] + 28 * flag, q[1] - 38 * fk], [q[0], q[1] - 30 * fk]], s4W(.9), { seed: 5110 + k, step: 6, grain: 0 }); }
    if (k < S4MARK.length - 1) { const q2 = PJ[S4MARK[k + 1]]; if (!q2) return;
      if (ln < 1 && fk > .5) rline(c, [[q[0], q[1]], [q2[0], q2[1]]], { w: 1.5, color: s4W(.4 * (1 - ln)), dash: [2, 10], seed: 5120 + k, amp: .3 });
      s4Line(c, q, q2, { p: ln, al: markA * S.lines, w: 3.5, seed: 5130 + k }); } });
  if (tau > s4T(3) && tau < s4T(4) + .4) { const a = 1 - sm(s4T(4) - .1, s4T(4) + .3, tau);
    fade(c, a, () => { s4Txt(c, '白天：做标记', 150, 860, tau, s4At(3, .05), { size: 40 }); s4Txt(c, '夜里：接线', 880, 860, tau, s4At(3, .55), { size: 40 }); }); }

  // ---- 星 ----
  const order = PJ.map((p, i) => [p ? p[2] : 0, i]).sort((a, b) => a[0] - b[0]);
  for (const [, i] of order) { const q = PJ[i]; if (!q) continue;
    const sz = S4ST[i][3], rk = S4RING.indexOf(i), ringOn = rk >= 0 ? sm(s4T(9), s4T(9) + .8, tau) : 0, dimR = sm(s4T(9) + .2, s4T(9) + 1, tau) * (rk < 0 ? .7 : 0);
    let r = (2.2 + 3.4 * sz) * q[2] * 1.45 * (1 + .5 * ringOn), col = S4C.white, gl = sz > .95 ? .3 : 0;
    const gk = goldOff(i); if (gk > 0) { col = mix(S4C.white, S4C.gold, gk); r *= 1 + .5 * gk; gl = Math.max(gl, gk * .8); }
    if (i === xi && tau > s4At(1, .55) && tau < s4T(3) + .5) { const kk = sm(s4At(1, .55), s4At(1, .62), tau, easeOutBack); r *= 1 + .6 * kk; }
    if (i === S4PATH.retry && tau > s4At(2, .96) && tau < s4T(3) + .5) { gl = 1.3 * sm(s4At(2, .96), s4At(2, 1), tau, easeOutBack); col = mix(S4C.white, S4C.gold, .6); }
    const tw = .8 + .2 * Math.sin(twos(tau) * 2 + i * 1.7);
    if (dev < 1) { const hs = HANDOFF_SPARKS[i], e = sparkE(i); c.save(); c.globalAlpha *= 1; s4Star(c, lerp(hs[0], q[0], e), lerp(hs[1], q[1], e), lerp(hs[2], r, e), mix(P.moon, S4C.white, e), gl * e); c.restore(); continue; }
    c.save(); c.globalAlpha *= tw * (1 - dimR); s4Star(c, q[0], q[1], r, col, gl); c.restore(); }
  // 进场：没有对应星的火花冷却、飞散成远星
  if (dev < 1) for (let k = S4N; k < HANDOFF_SPARKS.length; k++) { const [x, y, r] = HANDOFF_SPARKS[k], e = sparkE(k); c.fillStyle = alpha(mix(P.moon, S4C.white, e), .9 * (1 - e * .6)); c.beginPath(); c.arc(x, y - e * 20, r * (1 - e * .5), 0, TAU); c.fill(); }

  // L1 红叉落在那颗星上
  if (X && tau > s4At(1, .55) && tau < s4T(2) + .5) { const a = 1 - sm(s4T(2), s4T(2) + .5, tau); c.save(); c.globalAlpha *= a; cross(c, X[0] + 34, X[1] - 30, 36, { color: S4C.red, p: sm(s4At(1, .55), s4At(1, .6), tau), w: 6, seed: 5200 }); c.restore(); }
  if (tau > s4At(0, .62) && tau < s4T(1) + .4) fade(c, 1 - sm(s4T(1), s4T(1) + .4, tau), () => s4Txt(c, '学习 = 重新布线', 150, 860, tau, s4At(0, .66), { size: 44 }));

  // ---- L4 的「歇」：闭眼、走走 ✓，手机 ✗ ----
  if (orbA > 0) { const m20 = orbP(th0 + S4K90 + (TAU - S4K90) * .5); if (m20) { c.save(); c.globalAlpha *= orbA;
    const bx = m20[0] + 20, by = m20[1] + 10;
    ['eye', 'walk', 'phone'].forEach((kd, k) => { const t0 = s4At(4, .55 + k * .07), kk = sm(t0, t0 + .25, tau, easeOutBack); s4Icon(c, kd, bx + k * 90, by, kk);
      if (k < 2) check(c, bx + k * 90 + 18, by + 50, 26, { color: s4W(.9), p: sm(t0 + .2, t0 + .4, tau), w: 4 });
      else { const cp = sm(s4At(4, .8), s4At(4, .9), tau); cross(c, bx + k * 90, by, 64, { color: S4C.red, p: cp, w: 7, seed: 5300 }); } });
    c.restore(); } }

  // ---- L5 / L6：一片空白 → 生理叹息 ----
  if (tau > s4T(5) && tau < s4T(7) + .3) { const a = 1 - sm(s4T(7) - .3, s4T(7) + .2, tau);
    const C = proj([S.off[0], S.off[1], S.off[2]], cam), b = tau > s4T(6) - .3 ? s4Breath(tau) : 0;
    fade(c, a, () => {
      // 星云：一团细星尘 + 三圈等高线，跟着呼吸鼓起来、收回去
      if (C) { const ap = sm(s4At(5, .3), s4At(5, .45), tau), tense = sm(s4At(5, .3), s4At(5, .4), tau) * (1 - sm(s4T(6), s4T(6) + .6, tau)), rot = s4Ang(tau) * .6;
        for (let k = 0; k < 90; k++) { const an = hash(k, 81) * TAU + rot * (.5 + hash(k, 82)), rr = Math.sqrt(hash(k, 83)) * 170 * (1 + .6 * b) * C[2];
          c.fillStyle = s4W(.4 * ap * (.5 + .5 * hash(k, 84))); c.beginPath(); c.arc(C[0] + Math.cos(an) * rr * 1.2, C[1] + Math.sin(an) * rr * .85, 1.2 + hash(k, 85) * 1.6, 0, TAU); c.fill(); }
        for (let i = 0; i < 3; i++) { const R = (120 + 50 * i) * (1 + .6 * b) * C[2], pts = [];
          for (let j = 0; j < 60; j++) { const th = j / 60 * TAU, jit = tense * 6 * noise1(twos(tau) * 14 + j * .7, 90 + i); const rr = R * (1 + .13 * noise1(th * 1.6 + i * 4 + rot, 70 + i)) + jit; pts.push([C[0] + Math.cos(th) * rr * 1.2, C[1] + Math.sin(th) * rr * .85]); }
          rline(c, pts, { close: true, w: [3, 2.2, 1.6][i], color: s4W([.75, .5, .3][i] * ap), seed: 5600 + i, amp: .4, dash: i === 2 ? [6, 12] : null }); } }
      s4Txt(c, '生理叹息', 150, 250, tau, s4At(5, .72), { size: 64 });
      if (tau > s4T(6) - .2 && C) { const ph = s4BreathPh(tau), base = sm(s4T(6), s4T(6) + .3, tau);
        const lab = [['吸', C[0] - 430, C[1] - 150, 80], ['再吸', C[0] - 250, C[1] - 300, 60], ['呼——', C[0] + 250, C[1] + 290, 80]];
        lab.forEach(([s, x, y, size], k) => { const seen = sm(k === 0 ? s4At(6, .1) : k === 1 ? s4At(6, .24) : s4At(6, .4), (k === 0 ? s4At(6, .1) : k === 1 ? s4At(6, .24) : s4At(6, .4)) + .2, tau);
          if (seen <= 0) return; zh(c, s, x, y, { size, color: s4W(base * (.3 + .7 * ph[k])), p: k === 2 ? writeP(tau, s4At(6, .4), s, .45) : 1 }); });
      }
    }); }

  // ---- L7 / L8：白线小人、视线、消息、专注模式 ----
  const figA = sm(s4T(7) - .1, s4T(7) + .4, tau) * (1 - sm(s4T(9) - .2, s4T(9) + .3, tau));
  let ph = null;
  if (figA > 0) {
    const down = sm(s4At(7, .42), s4At(7, .55), tau, easeIO) * (1 - sm(s4At(7, .78), s4At(7, .9), tau, easeOutBack)), lift = 1 - down;
    // 书：往下时从右边抽走，最后塞回来
    const out = sm(s4At(7, .4), s4At(7, .48), tau, easeIn) * (1 - sm(s4At(7, .74), s4At(7, .86), tau, easeOut));
    const books = [0, 1, 2].map(k => clamp(out * 1.3 - k * .15, 0, 1));
    // L8：消息把视线拽走 → 专注模式 → 手机被弹远
    const t8 = s4T(8), pop8 = sm(t8 + .1, t8 + .35, tau, easeOutBack), steal = sm(s4At(8, .2), s4At(8, .3), tau, easeOutElastic) * (1 - sm(s4At(8, .6), s4At(8, .7), tau, easeOut));
    const moon = sm(s4At(8, .5), s4At(8, .6), tau), fly = sm(s4At(8, .8), s4At(8, .95), tau, easeIn);
    const px = lerp(1130, 1330, fly), py = lerp(520, 170, fly) - 8 * Math.abs(Math.sin(twos(tau) * 12)) * (1 - moon) * sm(t8 + .3, t8 + .4, tau), ps = lerp(1, .06, fly);
    const phoneOn = tau > t8 && tau < s4T(9) + .5;
    fade(c, figA, () => {
      const F = s4Figure(c, tau, down * (1 - steal * .5), lift, phoneOn ? { p: [px - 50, py], k: steal } : null, books);
      if (F) { // 视线正常时：屏幕旁 ✓ / 低头时 zzz
        const awake = tau < s4At(7, .42) || tau > s4At(7, .86);
        if (tau < t8 && awake && tau > s4T(7) + .5) check(c, F.scr[0] + 60, F.scr[1] - 40, 40, { color: s4W(.9), p: sm(tau < s4At(7, .42) ? s4T(7) + .5 : s4At(7, .86), (tau < s4At(7, .42) ? s4T(7) + .5 : s4At(7, .86)) + .3, tau), w: 5 });
        if (down > .6) for (let k = 0; k < 3; k++) { const u = (tau * .8 + k / 3) % 1; zh(c, 'z', F.head[0] + 40 + u * 50, F.head[1] - 50 - u * 90, { size: 26 + k * 8, color: s4W(.85 * Math.sin(u * Math.PI)) }); }
        s4Txt(c, '↑ 清醒', 150, 250, tau, s4T(7) + .3, { size: 44, al: 1 - sm(s4At(7, .4), s4At(7, .46), tau) * .6 });
        s4Txt(c, '↓ 犯困', 150, 320, tau, s4At(7, .46), { size: 44, al: 1 - sm(s4At(7, .8), s4At(7, .86), tau) * .6 });
      }
      if (phoneOn) { s4Phone(c, px, py, pop8 * ps, { dot: (1 - moon) * sm(t8 + .3, t8 + .45, tau, easeOutBack), moon, rot: -.08 + fly * 2.5 });
        if (moon > 0 && fly < .3) s4Txt(c, '专注模式', px + 70, py + 10, tau, s4At(8, .55), { size: 38, al: 1 - fly * 3 }); }
    });
    ph = { px, py, fly };
  }

  // ---- L9：24 小时的环，手机那颗星落进 2 小时那一格 ----
  const rA = sm(s4T(9) + .3, s4T(9) + 1.2, tau);
  if (rA > 0) { const ang = s4RingTh(tau), n = 72, pts = [];
    for (let i = 0; i <= n; i++) { const w = s4RingPt(ang + i / n * TAU), q = proj([w[0] + S.off[0], w[1] + S.off[1], w[2] + S.off[2]], cam); if (q) pts.push([q[0], q[1]]); }
    c.save(); c.globalAlpha *= rA; rline(c, pts, { w: 2.5, color: s4W(.75), seed: 5400, amp: .4 });
    // 红的那格：0 点到 1 格（2 小时）
    const red = sm(s4At(9, .55), s4At(9, .75), tau), rp = []; for (let i = 0; i <= 12; i++) { const w = s4RingPt(ang + i / 12 * TAU / 12 * red), q = proj([w[0] + S.off[0], w[1] + S.off[1], w[2] + S.off[2]], cam); if (q) rp.push([q[0], q[1]]); }
    if (red > 0) rline(c, rp, { w: 9, color: S4C.red, seed: 5401, amp: .5 });
    const C = proj(S.off, cam), m = s4RingPt(ang + TAU / 24), mq = proj(m, cam);
    if (C) { s4Txt(c, '24 小时', C[0] - 70, C[1] + 16, tau, s4T(9) + .9, { size: 44, color: s4W(.85) }); }
    if (mq) { s4Txt(c, '≤ 2 小时', mq[0] + 60, mq[1] - 40, tau, s4At(9, .72), { size: 72 }); s4Txt(c, '有研究建议', mq[0] + 66, mq[1] + 12, tau, s4At(9, .05), { size: 32, color: s4W(.7) }); }
    // 手机星从远处落进那一格
    if (mq) { const k = sm(s4At(9, .5), s4At(9, .7), tau, easeIO), sx = lerp(1330, mq[0], k), sy = lerp(170, mq[1], k); s4Phone(c, sx, sy, lerp(.06, .22, k), { dot: 0, moon: 1, rot: lerp(2.5, 0, k) }); }
    c.restore(); }
  else if (ph && ph.fly >= 1) { /* 手机已经是一颗远星 */ const tw = .7 + .3 * Math.sin(twos(tau) * 3); s4Star(c, 1330, 170, 4, alpha(S4C.white, tw), .5); }

  // ---- 帕秋莉 + L3 她坐的大星 ----
  const bigK = sm(s4T(3) - .3, s4T(3) + .2, tau, easeOutBack) * (1 - sm(s4T(4) - .1, s4T(4) + .3, tau, easeIn));
  if (bigK > .001) { const by = lerp(1150, 800, bigK) + 7 * Math.sin(twos(tau) * 1.5); cutPaper(c, starPts(1560, by, 130, 5, .5, .1), alpha(S4C.white, .92), { seed: 5500, step: 14, grain: .06 }); }
  s4Char(c, tau, L);
  if (tau > s4At(3, .6) && tau < s4T(4)) for (let k = 0; k < 3; k++) { const u = (tau * .7 + k / 3) % 1; zh(c, 'z', 1600 + u * 60, 330 - u * 110, { size: 30 + k * 10, color: s4W(.9 * Math.sin(u * Math.PI)) }); }
  s4Header(c, tau);
}
// L1 的错题星、金色的星、L2 的两条路、L3 插旗的星：按固定时刻的投影位置选（载入时算一次）
const S4X = (() => { let best = 0, bd = 1e9; for (let i = 0; i < S4N; i++) { const p = s4Rot(S4ST[i], s4Ang(s4T(1) + 3), S4TILT), d = Math.hypot(p[0] + 60, p[1] - 20, p[2] + 120); if (d < bd) { bd = d; best = i; } } return best; })();
const S4GOLD = (() => S4ST.map((_, i) => [s4D(i, S4X), i]).sort((a, b) => a[0] - b[0]).slice(0, 10).map(x => x[1]))();
const S4PATH = (() => { const t = s4T(2) + 2, R = S4ST.map((s, i) => [s4Rot(s, s4Ang(t), S4TILT), i]).filter(([, i]) => i !== S4X);
  const X = s4Rot(S4ST[S4X], s4Ang(t), S4TILT);
  const quit = R.filter(([p]) => p[1] > X[1] + 120 && p[0] < X[0]).sort((a, b) => (b[0][1] - a[0][1]) - (b[0][0] - a[0][0]) * .2)[0] || R[0];
  const retry = R.filter(([p]) => p[1] < X[1] - 120 && p[0] > X[0] - 100).sort((a, b) => a[0][1] - b[0][1])[0] || R[1];
  return { quit: quit[1], retry: retry[1] }; })();
const S4MARK = (() => { const t = s4At(3, .6); return S4ST.map((s, i) => [s4Rot(s, s4Ang(t), S4TILT), i]).filter(([p]) => p[0] > 90 && p[2] < 300).sort((a, b) => a[0][1] - b[0][1]).filter((_, k) => k % 2 === 0).slice(0, 5).map(x => x[1]); })();

scene({ order: 4, key: 'focus', title: '专注', dur: S4DUR, lines: S4LINES, noFlip: true,
  fn(c, tau, L) {
    if (tau < S4IN) { handoffSparks(c); return; }
    if (tau >= S4X2) { handoffBook(c, tau); return; }
    if (tau < S4X0) { s4Scene(c, tau, L); return; }
    // 出场：整张星图缩成摊在两页上的一张蓝晒纸，右半张像书页一样折到左边（背面是空白书页）
    spread(c, tau);
    const k = sm(S4X0, S4X1, tau, easeIO), x0 = BOOK.L.x, y0 = BOOK.L.y, w1 = BOOK.R.x + BOOK.R.w - x0, h1 = BOOK.L.h;
    const sx = lerp(1, w1 / W, k), sy = lerp(1, h1 / H, k), tx = lerp(0, x0, k), ty = lerp(0, y0, k);
    const f = sm(S4X1, S4X2, tau, easeIO), gx = tx + CX * sx;   // 折线（书脊）
    const drawSheet = () => { c.save(); c.translate(tx, ty); c.scale(sx, sy); s4Scene(c, S4X0, { mouth: 0, talking: false }); c.restore(); };
    // 左半张
    c.save(); c.beginPath(); c.rect(0, 0, gx, H); c.clip(); c.save(); c.shadowColor = 'rgba(20,15,10,.35)'; c.shadowBlur = 24 * k; c.shadowOffsetY = 8 * k; c.fillStyle = S4C.bg; c.fillRect(tx, ty, W * sx, H * sy); c.restore(); drawSheet(); c.restore();
    // 右半张：还没折时照常画，折起来时 x 方向按 cos 压扁；翻过书脊后画成空白书页（turnPage）
    if (f <= 0) { c.save(); c.beginPath(); c.rect(gx, 0, W, H); c.clip(); drawSheet(); c.restore(); return; }
    const cw = Math.cos(f * Math.PI);
    if (cw > 0) { c.save(); c.translate(gx, 0); c.scale(cw, 1); c.translate(-gx, 0); c.beginPath(); c.rect(gx, 0, W, H); c.clip(); drawSheet(); c.restore();
      c.save(); c.globalAlpha *= .35 * (1 - cw); c.fillStyle = '#000'; c.fillRect(gx, ty, (tx + W * sx - gx) * cw, H * sy); c.restore(); }
    else turnPage(c, f);
  } });
