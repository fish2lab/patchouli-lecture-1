'use strict';
// 第 5 段：运动（第二版 · 立体书 pop-up）。编配见 docs/分镜v2.md 顶部表格。
//   镜头从正上方的空白跨页（handoffBook）慢慢俯仰到约 50° 斜看摊在桌上的魔导书；书页平面用 tiltPlane 画，
//   立起来的纸片（帕秋莉、运动小人、大脑、日历帐篷、椅子、沙漏……）用同一套透视（s5P）投影，投影落在书页上。
//   L0 体力条被一格格撕掉 → L1 五个运动小人从折缝立起、线连到大脑 → L2 一条「150 分钟」被剪成七段落进七顶日历帐篷
//   → L3 两顶帐篷上立起哑铃 → L4 杠铃笑点（魔理沙、小恶魔挂两端，大帽子被压扁）→ L5 拉条抽走椅子 → L6 沙漏、接水、走两圈、伸懒腰
//   → L7 咳嗽、得意 → 立体件全部折平，书页回正（handoffBook）。
// 顶层名字一律带本段前缀 S5 / s5。
const S5LINES = seq(1.0, [
  ['第五页：运动。……好吧，这一页我是反面教材。', { mood: 'sad' }],
  ['对大脑帮助最大的，是有氧运动：快走、慢跑、骑车、游泳、打球。', { hold: .8 }],
  ['每周 150 分钟以上，拆开算，一天二十来分钟就够。', { hold: .9 }],
  ['世卫组织还建议：每周两天以上，做做力量练习。', { hold: .8 }],
  ['姆Q……杠铃……好重……', { mood: 'sad', pause: .3, hold: 1.8 }],
  ['还有：少坐。任何强度的活动，都比一直坐着强。', { hold: .6 }],
  ['坐着学一小时，就起来接杯水、走两圈、伸个懒腰。', { hold: 2.1 }],
  ['我喘成这样是因为哮喘。你们，可没有这个借口。', { mood: 'smug', pause: .9, hold: 1.1 }],
]);
const S5END = seqEnd(S5LINES), S5DUR = S5END + 2.1;
const s5T = i => S5LINES[i][0], s5E = i => S5LINES[i][1];
// s5W：第 i 句里说到 word 的时刻（按语音时长把字均分）
function s5W(i, word, off = 0) { const l = S5LINES[i], n = [...l[2]].length, v = voiceOf(l[2]), d = v ? v.d : n * .17, k = Math.max(0, l[2].indexOf(word));
  return l[0] + d * [...l[2].slice(0, k)].length / n + off; }
// 出场节拍：立体件折平 → 书页回正 → 空白跨页
const S5OUT = { fold: S5END + .05, flat: S5END + .75, tilt0: S5END + .55, tilt1: S5END + 1.75, hand: S5END + 1.8 };

// ===================== 颜色 =====================
const S5KC = mix(P.g3, P.ink2, .35), S5KB = mix(S5KC, P.ink, .28), S5SHIRT = mix(P.g2, P.g3, .35);            // 纸小人（剪影）
const S5GR = mix(P.green, P.paper, .08), S5GRD = mix(P.green, P.ink, .25);       // 本页唯一的强调色：绿
const S5BLK = mix(P.ink, P.ink2, .35), S5WH = '#f2ede4', S5GOLD = mix(P.moon, P.g3, .25), S5RED = mix(P.red, P.ink, .2);
const S5WATER = mix(P.g1, P.blue, .22);
const S5KS = 1.5, S5SS = 1.6;   // 左页小人的放大（运动小人、学生）

// ===================== 透视：书页平面 + 立起来的纸片 =====================
// 书页坐标 (X, Y) 就是平放时的屏幕坐标；h 是离开书页的高度（朝书页法线）。和 kit 的 tiltPlane 用同一套透视（f、cx、cy）。
const S5F = 1400, S5CY = 760, S5L = [.3, .42];   // 焦距、俯仰轴、光（高度 1 的点，影子落在书页上右移 .3、往里 .42）
function s5P(V, X, Y, h = 0) { const x = X - V.cx, d = Y - V.cy, cp = Math.cos(V.p), sp = Math.sin(V.p), y = d * cp + h * sp, z = d * sp - h * cp, k = S5F / (S5F + z);
  return [V.cx + x * k, V.cy + y * k, k]; }
// 镜头：p 俯仰（负 = 近处在下），cx 横移后的透视中心，zm 推拉，dy 竖移。tilt=0 时就是正上方的平面
// 镜头用「对准哪里」来写：[书页上的 X, Y, 离页高度 hc, 推近倍数]，这一点落在画面正中略上
function s5View(tau) {
  const tilt = sm(.2, 1.9, tau, easeIO) * (1 - sm(S5OUT.tilt0, S5OUT.tilt1, tau, easeIO));
  const A = [960, 640, 120, 1.02, 0], R = [1470, 800, 250, 1.28, 0], Lf = [540, 700, 150, 1.3, 20], Wd = [790, 780, 120, 1.26, 50], J = [1420, 850, 330, 1.52, 10], Lf2 = [680, 800, 120, 1.24, 20], E = [1000, 790, 140, 1.08, 40];
  const K = [[0, A], [1.9, A], [2.7, R], [s5T(1) - .1, R], [s5T(1) + .7, Lf], [s5T(2) + .1, Lf], [s5T(2) + .8, Wd], [s5E(3) - .1, Wd], [s5E(3) + .5, J],
    [s5E(4) - .1, J], [s5T(5) + .5, Lf2], [s5T(7) - .7, Lf2], [s5T(7) + .2, E], [S5OUT.fold, E], [S5OUT.tilt1, A]];
  const [X, Y, hc, z0, yo] = key(tau, K), V = { p: -.88 * tilt, cx: CX + (X - CX) * tilt, cy: S5CY, zm: lerp(1, z0, tilt), tilt, dy: 0 };
  const pt = s5P(V, X, Y, hc); V.dy = (yo - 30 - (pt[1] - CY) * V.zm) * tilt;
  return V;
}
// 卡片（立体书里立起来的一张纸）：底边钉在书页 (X, Y)，高 h0 处；a 是折起的角度（0 平躺、π/2 竖直）。
// 卡片局部坐标 (lx, ly)：ly 向下为正，底边在 ly = 0。s5Loc → 书页坐标 [X, Y, h]
function s5Loc(X, Y, a, h0, lx, ly) { const hh = -ly; return [X + lx, Y - hh * Math.cos(a), h0 + hh * Math.sin(a)]; }
// s5Aff：卡片 → 屏幕的仿射近似（在高 ref 处取横向比例）；shadow = true 时是它落在书页上的影子
function s5Aff(V, X, Y, a, h0, ref, shadow = false) {
  const f = (lx, ly) => { const [x, y, h] = s5Loc(X, Y, a, h0, lx, ly); return shadow ? s5P(V, x + h * S5L[0], y - h * S5L[1], 0) : s5P(V, x, y, h); };
  const o = f(0, 0), m0 = f(0, -ref), m1 = f(ref, -ref);
  return [(m1[0] - m0[0]) / ref, (m1[1] - m0[1]) / ref, (o[0] - m0[0]) / ref, (o[1] - m0[1]) / ref, o[0], o[1]];
}
// s5Card：生成一个「立体件」{ z 深度, draw, shadow }。fn(g) 在卡片局部坐标里画
function s5Card(V, X, Y, a, fn, o = {}) {
  const { h0 = 0, ref = 100, al = 1, z = Y } = o;
  if (al <= .002 || a < .04) return null;
  return { z, draw: c => { const M = s5Aff(V, X, Y, a, h0, ref); c.save(); c.globalAlpha *= al; c.transform(...M); fn(c); c.restore(); },
    shadow: g => { if (a < .03 && h0 < 1) return; const M = s5Aff(V, X, Y, a, h0, ref, true); g.save(); g.globalAlpha *= al; g.transform(...M); fn(g); g.restore(); } };
}
// 书页上的一块平面（落地的纸片等）：pts 是书页坐标，h 高度
const s5Proj = (V, pts, h = 0) => pts.map(([x, y, hh]) => s5P(V, x, y, hh ?? h));
// 凸包（影子轮廓用）
function s5Hull(pts) { const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = []; for (const q of p) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length > 1 && cr(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); } return lo.slice(0, -1).concat(up.slice(0, -1)); }
// 三维点 [X, Y, h] 的影子落点（书页坐标）
const s5Sh = ([x, y, h]) => [x + h * S5L[0], y - h * S5L[1], 0];

// 影子层：所有立体件的影子先画进一张缓冲（剪影），再整体压暗书页一次
const S5SHBUF = document.createElement('canvas');
function s5Shadows(c, pieces, al = .2) {
  const sc = c.getTransform().a || 1; if (S5SHBUF.width !== W * sc) { S5SHBUF.width = W * sc; S5SHBUF.height = H * sc; }
  const g = S5SHBUF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, S5SHBUF.width, S5SHBUF.height);
  const T = c.getTransform(); g.setTransform(T);
  for (const p of pieces) if (p.shadow) { g.save(); p.shadow(g); g.restore(); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-in'; g.fillStyle = '#2a1c16'; g.fillRect(0, 0, S5SHBUF.width, S5SHBUF.height); g.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = al; c.filter = `blur(${2.5 * sc}px)`; c.drawImage(S5SHBUF, 0, 0); c.restore();
}

// ===================== 小工具 =====================
// 折起：t0 起 0.45 秒弹起（带一点回弹），t1 起 0.3 秒折平
function s5Up(tau, t0, t1 = Infinity, d = .45) { return Math.PI / 2 * easeOutBack(clamp((tau - t0) / d, 0, 1), 1.9) * (1 - sm(t1, t1 + .3, tau, easeIn)); }
function s5Cap(g, a, b, w, col, seed, o = {}) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = w / 2, pts = [];
  for (let k = 0; k <= 5; k++) { const t = ang - Math.PI / 2 + k / 5 * Math.PI; pts.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  for (let k = 0; k <= 5; k++) { const t = ang + Math.PI / 2 + k / 5 * Math.PI; pts.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); }
  return cutPaper(g, pts, col, { seed, step: 5, blur: 2, sx: 1, sy: 1.4, grain: .05, edge: false, ...o });
}
const s5D = (p, a, l) => [p[0] + Math.sin(a) * l, p[1] + Math.cos(a) * l];   // 角度 0 = 竖直向下，+ = 朝前（+x）
function s5IK(a, b, l1, l2, bend = 1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = clamp(Math.hypot(dx, dy), .01, l1 + l2 - .01), ang = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = ang + bend * A;
  const j = [a[0] + Math.cos(k) * l1, a[1] + Math.sin(k) * l1]; return [a, j, [a[0] + Math.cos(ang) * d, a[1] + Math.sin(ang) * d]];
}
const s5Circ = (g, x, y, r, col, seed, o = {}) => cutPaper(g, circPts(x, y, r, Math.max(10, r * 1.2 | 0)), col, { seed, step: 4, blur: 2, sx: 1, sy: 1.4, grain: .05, edge: false, ...o });

// ===================== 纸小人（剪影） =====================
// s5Kid(g, o)：脚底 (0,0)，身高约 150，朝右。o = { kind, ph 动作相位, hair 0 短发 1 马尾 2 鸭舌帽 3 丸子头, seed }
// kind: stand | walk | jog | bike | swim | ball | sit | stretch | cup
function s5Kid(g, o = {}) {
  const { kind = 'stand', ph = 0, hair = 0, seed = 300 } = o, s = Math.sin(ph), TH = 31, SH = 31, UA = 25, FA = 23;
  const leg = (h, a1, a2) => { const k = s5D(h, a1, TH); return [h, k, s5D(k, a1 + a2, SH)]; };
  const arm = (p, a1, a2) => { const e = s5D(p, a1, UA); return [p, e, s5D(e, a1 + a2, FA)]; };
  let hip = [0, -62], lean = 0, nod = 0, LB, LF, AB, AF, sh, head, pre = null, post = null;
  const body = () => { sh = s5D(hip, Math.PI - lean, 44); head = s5D(sh, Math.PI - lean * 1.2 - nod, 21); };
  switch (kind) {
    case 'walk': hip = [0, -62 + 2 * Math.abs(Math.cos(ph))]; lean = .05; body();
      LF = leg(hip, .42 * s, -.7 * Math.max(0, Math.sin(ph + 1.3))); LB = leg(hip, -.42 * s, -.7 * Math.max(0, Math.sin(ph + Math.PI + 1.3)));
      AF = arm(sh, -.38 * s, .3); AB = arm(sh, .38 * s, .3); break;
    case 'jog': hip = [0, -58 - 6 * Math.abs(Math.sin(ph))]; lean = .2; body();
      LF = leg(hip, .75 * s + .1, -1.25 * Math.max(0, Math.sin(ph + 1.1)) - .15); LB = leg(hip, -.75 * s + .1, -1.25 * Math.max(0, Math.sin(ph + Math.PI + 1.1)) - .15);
      AF = arm(sh, -.7 * s, 1.5); AB = arm(sh, .7 * s, 1.5); break;
    case 'bike': {
      const cr = [0, -24], seat = [-10, -76], bar = [30, -84];
      pre = () => { for (const wx of [-40, 40]) { const wc = [wx, -24]; rline(g, circPts(wc[0], wc[1], 23, 28), { w: 3.2, color: P.ink2, close: true, seed: seed + wx, amp: .3 });
          for (let k = 0; k < 3; k++) { const aa = ph * .8 + k * Math.PI / 3; rline(g, [[wc[0] - Math.cos(aa) * 21, wc[1] - Math.sin(aa) * 21], [wc[0] + Math.cos(aa) * 21, wc[1] + Math.sin(aa) * 21]], { w: 1.2, color: P.ink2, seed: seed + k, amp: .2 }); } }
        rline(g, [[-40, -24], cr, [seat[0] + 2, seat[1] + 6], [-40, -24]], { w: 3.5, color: P.ink2, seed: seed + 5, amp: .3 });
        rline(g, [cr, [26, -70], [40, -24]], { w: 3.5, color: P.ink2, seed: seed + 6, amp: .3 }); rline(g, [[seat[0] + 2, seat[1] + 6], [26, -70]], { w: 3.5, color: P.ink2, seed: seed + 7, amp: .3 });
        rline(g, [[26, -70], bar, [24, -86]], { w: 3, color: P.ink2, seed: seed + 8, amp: .3 }); s5Cap(g, [seat[0] - 8, seat[1] + 2], [seat[0] + 8, seat[1] + 2], 5, P.ink2, seed + 9); };
      hip = seat; lean = .78; body();
      const pF = [cr[0] + Math.cos(ph) * 12, cr[1] + Math.sin(ph) * 12], pB = [cr[0] - Math.cos(ph) * 12, cr[1] - Math.sin(ph) * 12];
      LF = s5IK(hip, pF, TH, SH, -1); LB = s5IK(hip, pB, TH, SH, -1); AF = s5IK(sh, bar, UA, FA, 1); AB = s5IK(sh, [bar[0] - 4, bar[1] + 2], UA, FA, 1); break; }
    case 'swim': {
      hip = [-34, -20]; sh = [12, -25]; head = [36, -32];
      LF = [hip, [-62, -29 + 4 * Math.sin(ph * 2)], [-88, -30 + 7 * Math.sin(ph * 2 + 1)]]; LB = [hip, [-62, -31 - 4 * Math.sin(ph * 2)], [-88, -32 - 7 * Math.sin(ph * 2 + 1)]];
      const arc = a => { const e = [sh[0] + Math.cos(a) * 22, sh[1] + Math.sin(a) * 22]; return [sh, e, [e[0] + Math.cos(a - .25) * 22, e[1] + Math.sin(a - .25) * 22]]; };
      AF = arc(-ph); AB = arc(-ph + Math.PI);
      post = () => { const top = []; for (let k = 0; k <= 24; k++) { const x = -110 + k * 9.6; top.push([x, -26 + 3.5 * Math.sin(x * .09 + ph * 1.3)]); }
        cutPaper(g, [...top, [120, 0], [-110, 0]], S5WATER, { seed: seed + 40, step: 8, blur: 2, sx: 1, sy: 1.4, grain: .06 });
        for (let k = 0; k < 3; k++) { const x0 = -90 + k * 70; rline(g, [[x0, -12 + k * 3], [x0 + 18, -15 + k * 3], [x0 + 36, -12 + k * 3]], { w: 1.4, color: alpha(P.ink2, .5), seed: seed + 50 + k, amp: .3, smooth: true }); } };
      break; }
    case 'ball': { const b = Math.abs(Math.sin(ph)), by = -10 - 50 * b; hip = [0, -58 - 3 * b]; lean = .15; body();
      LF = leg(hip, .25 + .15 * s, -.5); LB = leg(hip, -.25 + .15 * s, -.3); AB = arm(sh, -.5, .9); AF = s5IK(sh, [30, Math.min(-40, by - 13)], UA, FA, 1);
      post = () => { s5Circ(g, 30, by, 11, P.g1, seed + 60); rline(g, [[20, by - 5], [30, by - 1], [40, by - 5]], { w: 1.3, color: P.ink2, seed: seed + 61, amp: .2, smooth: true }); rline(g, [[26, by - 11], [28, by], [26, by + 11]], { w: 1.3, color: P.ink2, seed: seed + 62, amp: .2, smooth: true }); }; break; }
    case 'sit': hip = [0, -40]; lean = .32 + .04 * Math.sin(ph); nod = .25; body();
      LF = leg(hip, Math.PI / 2 - .05, -Math.PI / 2 + .1); LB = leg([hip[0] - 3, hip[1]], Math.PI / 2 - .12, -Math.PI / 2 + .12);
      AF = s5IK(sh, [44, -58], UA, FA, 1); AB = s5IK(sh, [38, -57], UA, FA, 1); break;
    case 'stretch': hip = [0, -62]; lean = -.12 - .06 * Math.sin(ph); nod = -.3; body();
      LF = leg(hip, .1, 0); LB = leg(hip, -.1, 0); { const top = [head[0] - 4, head[1] - 44]; AF = s5IK(sh, top, UA, FA, -1); AB = s5IK(sh, [top[0] - 3, top[1] + 2], UA, FA, -1); } break;
    case 'cup': hip = [0, -62]; lean = -.04; nod = -.12; body();
      LF = leg(hip, .06, 0); LB = leg(hip, -.06, 0); AB = arm(sh, .1, .1); AF = s5IK(sh, [head[0] + 12, head[1] + 6], UA, FA, 1);
      post = () => { const hp = AF[2]; cutPaper(g, [[hp[0] - 2, hp[1] - 12], [hp[0] + 11, hp[1] - 12], [hp[0] + 9, hp[1] + 6], [hp[0], hp[1] + 6]], S5WH, { seed: seed + 70, step: 4, blur: 2, sx: 1, sy: 1 }); }; break;
    default: hip = [0, -62]; body(); LF = leg(hip, .05, 0); LB = leg(hip, -.05, 0); AF = arm(sh, .1, .12); AB = arm(sh, -.1, .12);
  }
  g.save(); if (kind === 'swim') { g.beginPath(); g.rect(-300, -400, 600, 400); g.clip(); }
  if (pre) pre();
  const limb = (Lm, w, col, sd) => { s5Cap(g, Lm[0], Lm[1], w, col, sd); s5Cap(g, Lm[1], Lm[2], w * .9, col, sd + 1); };
  const arm2 = (Am, col, sd) => { s5Cap(g, Am[0], Am[1], 9, col === S5KC ? S5SHIRT : mix(S5SHIRT, P.ink, .2), sd); s5Cap(g, Am[1], Am[2], 7, col, sd + 1); };
  arm2(AB, S5KB, seed + 10); limb(LB, 10, S5KB, seed + 12);
  limb(LF, 10, S5KC, seed + 16);
  // 躯干：一片上衣（肩窄、腰略宽的梯形），比四肢浅一级
  { const dx = sh[0] - hip[0], dy = sh[1] - hip[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, ux = dx / l, uy = dy / l;
    cutPaper(g, [[hip[0] + nx * 11 - ux * 4, hip[1] + ny * 11 - uy * 4], [hip[0] - nx * 11 - ux * 4, hip[1] - ny * 11 - uy * 4], [sh[0] - nx * 9, sh[1] - ny * 9], [sh[0] - nx * 5 + ux * 5, sh[1] - ny * 5 + uy * 5], [sh[0] + nx * 5 + ux * 5, sh[1] + ny * 5 + uy * 5], [sh[0] + nx * 9, sh[1] + ny * 9]],
      S5SHIRT, { seed: seed + 14, step: 6, blur: 2, sx: 1, sy: 1.4, grain: .05, edge: false }); }
  // 头 + 发型
  const hx = head[0], hy = head[1];
  if (hair === 1) { s5Cap(g, [hx - 12, hy - 6], [hx - 19, hy + 16], 8, S5KC, seed + 20); s5Circ(g, hx - 13, hy - 9, 5, S5KB, seed + 24); }
  if (hair === 3) s5Circ(g, hx - 7, hy - 15, 7, S5KC, seed + 21);
  s5Circ(g, hx, hy, 17, S5KC, seed + 22);
  if (hair === 2) s5Cap(g, [hx + 4, hy - 12], [hx + 22, hy - 10], 6, S5KB, seed + 23);
  arm2(AF, S5KC, seed + 18);
  g.restore();
  if (post) post();
  return { head, hand: AF[2] };
}

// ===================== Q 版魔理沙、小恶魔（剪纸，和帕秋莉同一套做法） =====================
// 锚点 (0,0) 是她们抓住杠铃的地方；身子吊在杠铃下面，头在上面。part = 'back'（整个人）| 'front'（压在杠铃上的两只手）
const s5CP = (g, pts, col, seed, o = {}) => cutPaper(g, pts, col, { seed, step: 5, blur: 2.5, sx: 1.2, sy: 1.6, grain: .07, edge: true, ...o });
function s5ChibiLegs(g, t, seed, sock, shoe) {
  for (const sd of [-1, 1]) { const a = .38 * Math.sin(twos(t) * 5.5 + (sd > 0 ? 0 : 2.1)) + .06 * sd, k = [sd * 8, 42], f = s5D(k, a, 24);
    s5Cap(g, k, f, 9, sock, seed + sd); cutPaper(g, ellPts(f[0] + Math.sin(a) * 3 + 2, f[1] + 2, 7, 4.5, 12, a * .3), shoe, { seed: seed + 5 + sd, step: 3, blur: 1.5, sx: 1, sy: 1 }); }
}
function s5ChibiFace(g, seed, eye, happy = true) {
  s5CP(g, ellPts(0, -30, 23, 21, 30), P.skin, seed);
  for (const sd of [-1, 1]) { cutPaper(g, ellPts(sd * 12, -22, 5, 2.6, 10), alpha(P.blush, .9), { seed: seed + 3 + sd, shadow: false, grain: 0, edge: false });
    if (happy) { const pts = []; for (let k = 0; k <= 6; k++) { const u = k / 6 * 2 - 1; pts.push([sd * 9 + u * 5.5, -29 - 3 * (1 - u * u)]); } for (let k = 6; k >= 0; k--) { const u = k / 6 * 2 - 1; pts.push([sd * 9 + u * 5.5, -27 - 3 * (1 - u * u)]); }
      cutPaper(g, pts, S5BLK, { seed: seed + 6 + sd, shadow: false, grain: 0, edge: false, step: 3 }); }
    else { cutPaper(g, ellPts(sd * 9, -29, 3.6, 4.6, 12), eye, { seed: seed + 6 + sd, shadow: false, grain: 0, step: 3 }); cutPaper(g, circPts(sd * 9 - 1, -31, 1.3, 8), '#fff', { seed: seed + 8 + sd, shadow: false, grain: 0, edge: false, step: 2 }); } }
  cutPaper(g, [[-3.5, -19], [-1.5, -17.5], [0, -18.6], [1.5, -17.5], [3.5, -19], [2, -16], [0, -16.8], [-2, -16]], mix(P.red, P.ink, .4), { seed: seed + 9, shadow: false, grain: 0, edge: false, step: 2 });
}
function s5Marisa(g, t, part = 'back') {
  const tt = twos(t), sd = 700;
  if (part === 'front') { for (const x of [-13, 13]) s5CP(g, ellPts(x, -2, 6.5, 5, 12), P.skin, sd + (x > 0 ? 1 : 2)); return; }
  s5CP(g, ellPts(0, -34, 28, 29, 30), S5GOLD, sd + 3);                                                             // 后发
  s5ChibiLegs(g, t, sd + 10, S5WH, S5BLK);
  s5CP(g, [[-15, 6], [15, 6], [30, 44], [-30, 44]], S5BLK, sd + 20);                                                 // 黑裙
  s5CP(g, [[-30, 42], [30, 42], ...pchScallop(pchLine([30, 47], [-30, 47]), 6, 3)], S5WH, sd + 21, { step: 3 });    // 裙下白边
  s5CP(g, [[-10, 8], [10, 8], [17, 40], ...pchScallop(pchLine([17, 42], [-17, 42]), 4, 3), [-17, 40]], S5WH, sd + 22, { step: 3 });   // 围裙
  s5CP(g, [[-13, -10], [13, -10], [15, 8], [-15, 8]], S5BLK, sd + 23);                                                // 上身
  s5CP(g, [[-6, -10], [6, -10], [0, 2]], S5WH, sd + 24, { step: 3 });
  for (const x of [-17, 17]) s5CP(g, ellPts(x, -6, 9, 8, 14), S5WH, sd + 25 + (x > 0 ? 1 : 0));                      // 泡泡袖
  s5ChibiFace(g, sd + 30, P.moon, true);
  // 刘海 + 侧发 + 一侧编辫（她的右手边 = 画面左边）
  s5CP(g, [[-26, -40], [-22, -52], [0, -56], [22, -52], [26, -40], [21, -36], [17, -42], [12, -35], [7, -43], [2, -36], [-4, -43], [-9, -36], [-14, -42], [-19, -35]], S5GOLD, sd + 40, { step: 3 });
  s5CP(g, [[20, -44], [27, -40], [29, -22], [26, -10], [22, -18], [21, -32]], S5GOLD, sd + 41, { step: 3 });
  const bs = .06 * Math.sin(tt * 3.1);
  for (let k = 0; k < 4; k++) s5CP(g, ellPts(-25 - k * 1.2 + k * k * bs * 6, -30 + k * 10, 5.5 - k * .4, 6.5, 12), mix(S5GOLD, P.ink, k % 2 ? .08 : 0), sd + 42 + k, { step: 3 });
  s5CP(g, PCH_BOW_PTS.map(([x, y]) => [x * .55 - 30 + 18 * bs, y * .55 + 12]), S5WH, sd + 47, { step: 2 });
  // 帽子：宽帽檐 + 弯尖的帽身 + 白色大蝴蝶结
  s5CP(g, ellPts(0, -52, 48, 10, 30, -.06), S5BLK, sd + 50, { step: 6 });
  const tip = 4 * Math.sin(tt * 2.3);
  s5CP(g, [[-23, -55], [-15, -80], [-5, -100], [6, -113], [22 + tip, -121], [31 + tip, -117], [17 + tip * .6, -110], [11, -96], [17, -74], [23, -55]], S5BLK, sd + 51, { step: 5 });
  s5CP(g, [[-22, -58], [22, -58], [21, -64], [-20, -64]], mix(S5BLK, S5WH, .15), sd + 52, { step: 4, shadow: false });
  s5CP(g, PCH_BOW_PTS.map(([x, y]) => [x * 1.05 - 18, y * 1.05 - 64]), S5WH, sd + 53, { step: 3 });
}
function s5Koakuma(g, t, part = 'back') {
  const tt = twos(t), sd = 760, flap = .16 * Math.sin(tt * 6.3);
  if (part === 'front') { for (const x of [-13, 13]) s5CP(g, ellPts(x, -2, 6.5, 5, 12), P.skin, sd + (x > 0 ? 1 : 2)); return; }
  // 背后的蝠翼
  const wing = [[6, -6], [22, -26], [44, -44], [66, -46], [60, -34], [54, -30], [52, -20], [42, -18], [38, -8], [26, -8], [18, 0]];
  for (const s of [-1, 1]) { const a = s * flap, pts = wing.map(([x, y]) => { const X = x * Math.cos(a) - (y + 6) * Math.sin(a), Y = x * Math.sin(a) + (y + 6) * Math.cos(a) - 6; return [s * X, Y]; });
    s5CP(g, pts, S5BLK, sd + 3 + s, { step: 4 }); }
  s5CP(g, [[-27, -48], [-30, -20], [-31, 10], [-29, 36], [-24, 30], [-20, 40], [-14, 30], [14, 30], [20, 40], [24, 30], [29, 36], [31, 10], [30, -20], [27, -48], [0, -58]], S5RED, sd + 6, { step: 5 });   // 长长的红发
  s5ChibiLegs(g, t + .4, sd + 10, S5BLK, mix(S5BLK, P.ink, .4));
  s5CP(g, [[-15, 6], [15, 6], [26, 42], [-26, 42]], S5BLK, sd + 20);
  s5CP(g, [[-13, -10], [13, -10], [15, 8], [-15, 8]], S5WH, sd + 21);
  s5CP(g, [[-13, -10], [-4, -10], [-6, 8], [-15, 8]], S5BLK, sd + 22, { step: 4 }); s5CP(g, [[13, -10], [4, -10], [6, 8], [15, 8]], S5BLK, sd + 23, { step: 4 });
  s5CP(g, [[-2.5, -8], [2.5, -8], [3.5, 2], [0, 5], [-3.5, 2]], S5RED, sd + 24, { step: 2 });
  for (const x of [-17, 17]) s5CP(g, ellPts(x, -6, 8.5, 8, 14), S5WH, sd + 25 + (x > 0 ? 1 : 0));
  s5ChibiFace(g, sd + 30, S5RED, false);
  s5CP(g, [[-26, -38], [-22, -52], [0, -57], [22, -52], [26, -38], [22, -33], [18, -40], [13, -33], [8, -41], [2, -34], [-4, -41], [-10, -34], [-15, -41], [-20, -33]], S5RED, sd + 40, { step: 3 });
  for (const s of [-1, 1]) s5CP(g, [[s * 21, -44], [s * 28, -38], [s * 29, -14], [s * 25, -2], [s * 22, -14], [s * 20, -30]].map(([x, y]) => [x, y]), S5RED, sd + 41 + s, { step: 3 });
  // 头上一对小蝠翼
  for (const s of [-1, 1]) { const a = -s * .2 + s * flap * .7, base = [s * 20, -52];
    const pts = [[0, 0], [8, -10], [18, -16], [16, -9], [21, -7], [14, -2], [10, 3]].map(([x, y]) => [base[0] + s * (x * Math.cos(a) - y * Math.sin(a)), base[1] + (x * Math.sin(a) * s) + y * Math.cos(a)]);
    s5CP(g, pts, S5BLK, sd + 50 + s, { step: 3 }); }
}

// ===================== 杠铃笑点（在帕秋莉的卡片局部坐标里画） =====================
// st = { gy 握杆高度, squash 帽子被压扁 0..1, sag 杠铃弯, tiltB 杠铃倾斜, mar/koa 下落 0..1（1 = 挂上）, shake }
const S5BAR = 330, S5HANG = 262;
function s5Barbell(g, st, tau, part) {
  const { gy, sag = 0, tiltB = 0 } = st, yAt = x => gy + sag * Math.pow(Math.abs(x) / S5BAR, 1.6) + tiltB * x;
  if (part === 'bar') {
    const top = [], bot = []; for (let k = 0; k <= 30; k++) { const x = lerp(-S5BAR, S5BAR, k / 30), y = yAt(x); top.push([x, y - 4.5]); bot.unshift([x, y + 4.5]); }
    cutPaper(g, [...top, ...bot], mix(P.g3, P.ink, .2), { seed: 801, step: 10, blur: 3, sx: 1.5, sy: 2.5 });
    for (const s of [-1, 1]) { for (const [x0, hh, w] of [[150, 48, 16], [168, 38, 12]]) { const x = s * (x0 + w / 2), y = yAt(x);
        cutPaper(g, rectPts(x - w / 2, y - hh, w, hh * 2, 3), mix(P.ink2, P.ink, .3), { seed: 802 + x0 + s, step: 8, blur: 3, sx: 1.5, sy: 2.5 }); }
      const x = s * 186, y = yAt(x); cutPaper(g, rectPts(x - 5, y - 9, 10, 18, 2), P.g2, { seed: 806 + s, step: 5 });
      const xe = s * (S5BAR - 4), ye = yAt(xe); cutPaper(g, rectPts(xe - 7, ye - 8, 14, 16, 3), P.g2, { seed: 808 + s, step: 5 }); }
  }
  // 挂着的两个人
  const hang = (who, s, k) => { if (k <= 0) return; const x = s * S5HANG, y = yAt(x), drop = (1 - k) * -420, sw = .08 * Math.sin(twos(tau) * 3.3 + s);
    g.save(); g.translate(x, y + drop); g.rotate(sw * (k >= 1 ? 1 : 0) + tiltB * .8); who(g, tau + s, part === 'bar' ? 'front' : 'back'); g.restore(); };
  if (part === 'back' || part === 'bar') { hang(s5Marisa, -1, st.mar); hang(s5Koakuma, 1, st.koa); }
  return yAt;
}
// 帕秋莉举杠铃：帽子以握杆线为界，上半截被压扁（squash 0..1），身子也矮一点、抖
function s5Lifter(g, tau, L, st) {
  const { squash = 0, shake = 0 } = st, j = shake * (hash(Math.floor(tau * 12), 5) - .5) * 5;
  const po = { x: j, y: 0, h: 520, pose: 'lift', mood: st.mood || 'flustered', mouth: L.mouth, blink: blinkAt(tau, 5), t: tau };
  const yc = st.gy - 6, sy = 1 - .7 * squash, sx = 1 + .5 * squash;
  g.save(); g.translate(0, 0); g.scale(1, 1 - .05 * squash);
  s5Barbell(g, st, tau, 'back');
  g.save(); g.beginPath(); g.rect(-600, yc, 1200, 800); g.clip(); drawPatchouli(g, po); g.restore();
  g.save(); g.translate(0, yc); g.scale(sx, sy); g.translate(0, -yc); g.beginPath(); g.rect(-600, yc - 600, 1200, 600); g.clip(); drawPatchouli(g, po); g.restore();
  s5Barbell(g, st, tau, 'bar');
  // 抖的小线
  if (shake > .3) for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const x = s * (70 + k * 14), y = -250 - k * 40;
    rline(g, [[x, y], [x + s * 5, y + 10], [x, y + 20], [x + s * 5, y + 30]], { w: 2.2, color: alpha(P.ink2, .7), seed: 820 + k + s, t: tau, amp: .8 }); }
  g.restore();
}

// ===================== 其他立体件 =====================
// 体力条：两根小立柱之间一条纸带，挂着 10 格绿纸片。gone(i) 为真时第 i 格已被撕掉
function s5Stamina(g, tau, gone) {
  for (const x of [-150, 150]) s5Cap(g, [x, 0], [x, -250], 6, P.g2, 830 + x);
  cutPaper(g, rectPts(-156, -262, 312, 16, 2), P.paper2, { seed: 833, step: 12, blur: 2, sx: 1, sy: 1.5 });
  zh(g, '体力', 150, -276, { size: 30, color: P.ink2, align: 'right' });
  for (let i = 0; i < 10; i++) { if (gone(i)) continue; const x = -130 + i * 28, sw = .04 * Math.sin(twos(tau) * 2 + i);
    g.save(); g.translate(x, -248); g.rotate(sw); cutPaper(g, rectPts(-10, 0, 20, 30, 2), S5GR, { seed: 840 + i, step: 6, blur: 2, sx: 1, sy: 1.5 });
    rline(g, [[-9, 2], [9, 2]], { w: 1, color: alpha(P.paper, .8), seed: 850 + i, dash: [2, 3], amp: .1 }); g.restore(); }
}
const S5TAB0 = [-130, -248];   // 第 0 格在卡片里的位置（格距 28）
// 落下的纸片（三维）：从卡片上的 [X, Y, h] 落到书页上 [X+dx, Y+dy, 0]，u 0..1。返回四角的书页坐标
function s5Falling(i, X0, Y0, h0, u) {
  u = clamp(u, 0, 1);
  const dx = (hash(i, 11) - .5) * 160, dy = 50 + hash(i, 12) * 170, e = easeIn(clamp(u, 0, 1)) * .6 + clamp(u, 0, 1) * .4;
  const x = X0 + dx * u + 14 * Math.sin(u * 9 + i), y = Y0 + dy * easeOut(clamp(u, 0, 1)), h = h0 * (1 - e);
  const th = lerp(Math.PI / 2, 0, easeOut(clamp(u, 0, 1))), ps = (hash(i, 13) - .5) * 2.4 * u + .8 * Math.sin(u * 7 + i) * (1 - u);
  return [[-10, -15], [10, -15], [10, 15], [-10, 15]].map(([a, b]) => { const ax = a * Math.cos(ps) - b * Math.sin(ps), bb = a * Math.sin(ps) + b * Math.cos(ps);
    return [x + ax, y + bb * Math.cos(th), h - bb * Math.sin(th)]; });
}
// 大脑：一根纸茎托着一片脑形剪纸，lit 个绿点亮起
// 侧面的大脑（朝右）：大脑、小脑、脑干（脑干就是托着它的纸茎）
const S5BRAIN = [[-122, -8], [-130, -40], [-118, -72], [-92, -94], [-55, -106], [-10, -110], [35, -104], [76, -88], [106, -62], [124, -30], [124, 4], [110, 30], [82, 44], [46, 42], [14, 46], [-18, 40], [-52, 30], [-84, 22], [-108, 12]].map(([x, y]) => [x, y - 262]);
const S5CEREB = [[-100, 12], [-72, 14], [-52, 26], [-56, 48], [-80, 56], [-104, 48], [-116, 30]].map(([x, y]) => [x, y - 262]);
const S5LIGHT = [[-80, -310], [-30, -345], [30, -335], [85, -305], [95, -262]];
function s5Brain(g, tau, lit) {
  cutPaper(g, [[-16, 0], [16, 0], [5, -8], [4, -210], [-10, -210], [-5, -8]], P.g2, { seed: 860, step: 10 });
  cutPaper(g, S5CEREB, mix(P.blush, P.g2, .45), { seed: 861, step: 8, blur: 3, sx: 1.5, sy: 2.5 });
  for (let k = 0; k < 3; k++) rline(g, [[-108, -236 + k * 9], [-84, -232 + k * 9], [-60, -230 + k * 9]], { w: 1.4, color: alpha(P.ink2, .45), seed: 862 + k, smooth: true, amp: .3 });
  cutPaper(g, S5BRAIN, mix(P.blush, P.paper2, .5), { seed: 863, step: 12, blur: 3, sx: 1.5, sy: 2.5 });
  const gy = [[[-10, -370], [0, -330], [-14, -300], [-4, -265]], [[-60, -242], [-10, -270], [40, -262], [80, -240]], [[-110, -300], [-80, -330], [-50, -318], [-40, -350]], [[-100, -265], [-70, -280], [-40, -275]],
    [[30, -355], [50, -330], [40, -300], [70, -290], [100, -300]], [[60, -250], [90, -270], [112, -262]], [[-60, -345], [-30, -360]]];
  gy.forEach((pts, k) => rline(g, pts, { w: 2.2, color: alpha(P.ink2, .5), seed: 870 + k, smooth: true, amp: .5 }));
  S5LIGHT.forEach(([x, y], k) => { const q = lit(k); if (q <= 0) return; pop(g, x, y, easeOutBack(clamp(q, 0, 1)), () => { s5Circ(g, x, y, 11, S5GR, 880 + k); sparkle(g, x + 9, y - 9, 7 * clamp(q, 0, 1), { color: '#fbf6e8' }); }); });
  // 挂在纸茎上的小标签「有氧」
  const sw = .05 * Math.sin(twos(tau) * 1.7); g.save(); g.translate(8, -120); g.rotate(sw);
  rline(g, [[0, 0], [30, 10]], { w: 1.5, color: '#6b4f55', seed: 877, amp: .2 });
  cutPaper(g, [[28, 0], [110, 0], [118, 22], [110, 44], [28, 44]], P.paper, { seed: 878, step: 10, blur: 2, sx: 1, sy: 1.5 });
  zh(g, '有氧', 44, 34, { size: 30, color: P.ink }); g.restore();
}
// 日历帐篷：V 形立体件（真三维），i 是星期几。k 0..1 撑开。返回正面的仿射（写字、贴纸用）
const S5DAYS = '一二三四五六日', S5TENT = { Y: 720, w: 88, L: 70, x0: 150, gap: 112 };
function s5TentGeo(V, i, k) {
  const X = S5TENT.x0 + i * S5TENT.gap, hw = S5TENT.w / 2, hT = S5TENT.L * .86 * Math.sin(k * Math.PI / 2), dd = Math.sqrt(Math.max(0, S5TENT.L * S5TENT.L - hT * hT)), Y = S5TENT.Y;
  const F = [[X - hw, Y + dd, 0], [X + hw, Y + dd, 0], [X + hw, Y, hT], [X - hw, Y, hT]], B = [[X - hw, Y - dd, 0], [X + hw, Y - dd, 0], [X + hw, Y, hT], [X - hw, Y, hT]];
  const p00 = s5P(V, ...F[0]), p10 = s5P(V, ...F[1]), p01 = s5P(V, ...F[3]), L = S5TENT.L;
  const M = [(p10[0] - p00[0]) / S5TENT.w, (p10[1] - p00[1]) / S5TENT.w, (p00[0] - p01[0]) / L, (p00[1] - p01[1]) / L, p00[0], p00[1]];
  return { X, Y, hT, F, B, M };
}

// 书堆（真三维的盒子）：[x0,x1]×[y0,y1]，高 h0..h1。返回立体件
function s5Box(V, x0, x1, y0, y1, h0, h1, cols, seed, al = 1) {
  if (h1 - h0 < 1 || al <= .01) return null;
  const P8 = [[x0, y0, h0], [x1, y0, h0], [x1, y1, h0], [x0, y1, h0], [x0, y0, h1], [x1, y0, h1], [x1, y1, h1], [x0, y1, h1]];
  const q = i => P8[i], face = (ids, col, sd, o = {}) => c => cutPaper(c, s5Proj(V, ids.map(q)), col, { seed: sd, step: 16, shadow: false, grain: .08, ...o });
  const lx = x0 - V.cx > 0, rx = x1 - V.cx < 0;
  return { z: y1, draw: c => fade(c, al, () => {
      if (lx) face([0, 3, 7, 4], cols[2], seed + 1)(c); if (rx) face([1, 2, 6, 5], cols[2], seed + 2)(c);
      face([3, 2, 6, 7], cols[1], seed + 3)(c); face([4, 5, 6, 7], cols[0], seed + 4)(c); }),
    shadow: g => { g.fillStyle = '#000'; g.globalAlpha = al; g.fill(polyPath(s5Proj(V, s5Hull(P8.map(s5Sh))))); } };
}

scene({ order: 5, key: 'exercise', title: '运动', dur: S5DUR, lines: S5LINES, noFlip: true,
  fn(c, tau, L) {
    if (tau < .2 || tau >= S5OUT.hand) { handoffBook(c, tau); return; }
    const V = s5View(tau), out = sm(S5OUT.fold, S5OUT.flat, tau), outA = 1 - sm(S5OUT.flat - .2, S5OUT.flat + .3, tau);
    const t0 = s5T(0), t1 = s5T(1), t2 = s5T(2), t3 = s5T(3), t4 = s5T(4), t5 = s5T(5), t6 = s5T(6), t7 = s5T(7);
    const fold = (t0_, t1_ = Infinity, d) => s5Up(tau, t0_, Math.min(t1_, S5OUT.fold + hash(t0_ * 100 | 0, 3) * .3), d);
    const pieces = [], add = p => { if (p) pieces.push(p); };

    // ---------- 体力条：L0 撕掉 9 格，L4「好重」撕掉最后一格 ----------
    const STX = 1670, STY = 640, tear = [];
    { const a = s5W(0, '好吧'), b = s5W(0, '反面'); for (let i = 9; i >= 1; i--) { const n = 9 - i; tear[i] = n < 3 ? a + n * .42 : b + (n - 3) * .13; } tear[0] = s5W(4, '好重', .5); }
    const stA = fold(1.0, Infinity);
    add(s5Card(V, STX, STY, stA, g => s5Stamina(g, tau, i => tau >= tear[i]), { ref: 150, al: outA }));
    for (let i = 0; i < 10; i++) { const u = (tau - tear[i]) / .9; if (u <= 0) continue;
      const [lx, ly] = [S5TAB0[0] + i * 28, S5TAB0[1] + 15], q = s5Falling(i, STX + lx, STY, -ly, u), landed = u >= 1;
      add({ z: landed ? -1e9 : STY + 5, draw: cc => { const pp = s5Proj(V, q); fade(cc, outA, () => cutPaper(cc, pp, S5GR, { seed: 890 + i, step: 6, blur: 2, sx: 1, sy: 1.2, grain: .05 })); },
        shadow: landed ? null : g => { g.fillStyle = '#000'; g.fill(polyPath(s5Proj(V, s5Hull(q.map(s5Sh))))); } }); }
    // 吸入器（L0「反面教材」时立起；L7 咳嗽时喷一下）
    add(s5Card(V, 1590, 900, fold(s5W(0, '反面', .3)), g => {
      cutPaper(g, [[-14, 0], [14, 0], [14, -54], [8, -60], [-8, -60], [-14, -54]], P.g1, { seed: 895, step: 6 });
      cutPaper(g, [[-14, -8], [-34, -8], [-36, -24], [-14, -24]], P.g2, { seed: 896, step: 5 });
      cutPaper(g, rectPts(-10, -76, 20, 18, 3), P.g2, { seed: 897, step: 5 });
    }, { ref: 40, al: outA }));

    // ---------- L1：大脑 + 五个运动小人 ----------
    const kidX = [175, 340, 505, 670, 840], kidY = 740, kidKinds = ['walk', 'jog', 'bike', 'swim', 'ball'], kidWords = ['快走', '慢跑', '骑车', '游泳', '打球'];
    const kidOn = kidWords.map(w => s5W(1, w, -.1)), kidOff = kidX.map((_, i) => t2 + .15 + i * .1);
    const brA = fold(t1 + .2, t2 + .05), BX = 610, BY = 610;
    if (brA > 0) add(s5Card(V, BX, BY, brA, g => s5Brain(g, tau, k => (tau - kidOn[k] - .35) / .3), { ref: 200 }));
    kidX.forEach((x, i) => { const a = fold(kidOn[i], kidOff[i]); if (a <= 0) return;
      const ph = twos(tau) * TAU * [1.3, 2.3, 1.4, 1, 1.9][i] + i;
      add(s5Card(V, x, kidY, a, g => { g.scale(S5KS, S5KS); s5Kid(g, { kind: kidKinds[i], ph, hair: [0, 1, 2, 3, 1][i], seed: 300 + i * 40 }); }, { ref: 90 }));
      // 线：从大脑连到小人头上，接上时绷紧
      if (brA > .3) { const q = sm(kidOn[i] + .25, kidOn[i] + .55, tau), head = kidKinds[i] === 'swim' ? [34, -42] : kidKinds[i] === 'bike' ? [26, -120] : [3, -127];
        const [ax, ay, ah] = s5Loc(BX, BY, brA, 0, S5LIGHT[i][0] * .8 - 10, -226), [bx, by, bh] = s5Loc(x, kidY, a, 0, head[0] * S5KS, head[1] * S5KS);
        const pa = s5P(V, ax, ay, ah), pb = s5P(V, bx, by, bh), pe = [lerp(pa[0], pb[0], q), lerp(pa[1], pb[1], q)];
        if (q > 0) add({ z: BY + 1, draw: cc => thread(cc, [pa[0], pa[1]], pe, { sag: 30 * (1 - q * .7), color: alpha('#6b4f55', .85), w: 1.8, seed: 900 + i }) }); } });

    // ---------- L2–L3：「150 分钟」纸条 → 剪成七段 → 七顶日历帐篷；两顶帐篷上立起哑铃 ----------
    const tentOn = i => t2 + .9 + i * .09, tentOff = i => t5 - .4 + i * .05, cutT = s5W(2, '拆开'), cutDur = .5;
    const tents = [];
    for (let i = 0; i < 7; i++) { const k = clamp(fold(tentOn(i), tentOff(i)) / (Math.PI / 2), 0, 1.15); if (k <= 0) continue; const G = s5TentGeo(V, i, Math.min(k, 1)); tents[i] = G;
      const sideCol = mix(P.paper2, P.g2, .25);
      add({ z: S5TENT.Y, draw: cc => fade(cc, outA, () => {
          cutPaper(cc, s5Proj(V, G.B), mix(sideCol, P.ink, .12), { seed: 910 + i, step: 14, blur: 2, sx: 1, sy: 1.5 });
          cutPaper(cc, s5Proj(V, G.F), P.paper, { seed: 920 + i, step: 14, blur: 3, sx: 1.2, sy: 2 });
          cc.save(); cc.transform(...G.M); zh(cc, S5DAYS[i], S5TENT.w / 2, -S5TENT.L * .45, { size: 30, align: 'center', color: P.ink2 });
          // 落进来的一段绿纸条
          const land = cutT + cutDur + .25 + i * .12, u = sm(land, land + .35, tau, easeOutBack);
          if (u > 0) cutPaper(cc, rectPts(14, -S5TENT.L * .3 + (1 - u) * -60, S5TENT.w - 28, 12, 2), S5GR, { seed: 930 + i, step: 6, blur: 1.5, sx: 1, sy: 1.2 });
          cc.restore(); }),
        shadow: g => { if (G.hT < 1) return; g.fillStyle = '#000'; g.fill(polyPath(s5Proj(V, s5Hull([...G.F, ...G.B].map(s5Sh))))); } }); }
    // 横幅：150 分钟（剪开前一整条，剪开后七段各自落下）
    const banA = fold(s5W(2, "150", -.2), cutT + cutDur + 1.0), BNX = 490, BNY = 600;
    if (banA > 0) add(s5Card(V, BNX, BNY, banA, g => {
      for (const x of [-300, 300]) s5Cap(g, [x, 0], [x, -150], 6, P.g2, 940 + x);
      const cutP = sm(cutT, cutT + cutDur, tau), segW = 600 / 7;
      for (let i = 0; i < 7; i++) { const land = cutT + cutDur + .25 + i * .12, u = clamp((tau - (land - .35)) / .35, 0, 1); if (u >= 1) continue;
        const x0 = -300 + i * segW, dx = cutP >= 1 ? 3 * (i - 3) : 0;
        g.save(); g.translate(dx, u * 170); g.rotate(u * (hash(i, 7) - .5) * .8); g.globalAlpha *= 1 - u * u;
        cutPaper(g, rectPts(x0 + 2, -200, segW - 4 + (cutP < 1 ? 4 : 0), 60, 2), S5GR, { seed: 950 + i, step: 12, blur: 2, sx: 1, sy: 1.5 });
        g.save(); g.beginPath(); g.rect(x0, -210, segW, 80); g.clip(); zh(g, '150 分钟 / 周', 0, -156, { size: 44, align: 'center', color: '#f6f1e4', p: writeP(tau, s5W(2, '150'), '150 分钟 / 周', .06) }); g.restore(); g.restore(); }
      // 剪刀线：虚线一段段剪开
      if (cutP > 0 && cutP < 1.2) for (let i = 1; i < 7; i++) { const x = -300 + i * segW, q = clamp(cutP * 7 - (i - 1) * .9, 0, 1); if (q > 0 && tau < cutT + cutDur + .3) rline(g, [[x, -206], [x, -206 + 72 * q]], { w: 2, color: P.ink2, dash: [5, 5], seed: 960 + i, amp: .2 }); }
    }, { ref: 170 }));
    // 两顶帐篷上的哑铃（L3）
    [1, 4].forEach((i, n) => { const G = tents[i]; if (!G) return; const a = fold(s5W(3, '两天', n * .25), tentOff(i) - .2); if (a <= 0) return;
      const bob = 3 * Math.abs(Math.sin(twos(tau) * 3 + n));
      add(s5Card(V, G.X, G.Y, a, g => { g.translate(0, -bob); g.scale(1.5, 1.5);
        s5Cap(g, [-22, -14], [22, -14], 7, mix(P.g3, P.ink, .2), 970 + n);
        for (const s of [-1, 1]) { cutPaper(g, rectPts(s * 22 - 6, -30, 12, 32, 3), mix(P.ink2, P.ink, .3), { seed: 972 + n + s, step: 6 }); cutPaper(g, rectPts(s * 31 - 4, -25, 8, 22, 2), mix(P.ink2, P.ink, .2), { seed: 975 + n + s, step: 5 }); }
      }, { h0: G.hT, ref: 30, z: G.Y + 1 })); });

    // ---------- L5–L7：书桌、椅子、学生、沙漏、饮水机、走圈 ----------
    const pullT = s5W(5, '少坐', -.1), backT = t6 + .1, upT = s5W(6, '就起来', -.05), cupT = s5W(6, '接杯水', -.3), lapT = s5W(6, '走两圈', -.2), strT = s5W(6, '伸个懒腰', -.15);
    const pull = sm(pullT, pullT + .5, tau, easeIO) * (1 - sm(backT, backT + .5, tau, easeIO));
    const deskA = fold(t5 - .2, S5OUT.fold), DKX = 250, DKY = 740;
    // 书桌 + 椅子（一张卡）：拉条抽出来时椅子往前滑、折倒
    add(s5Card(V, DKX, DKY - 2, deskA, g => { g.scale(S5SS, S5SS); g.translate(30, 0);
      cutPaper(g, rectPts(10, -76, 96, 9, 2), P.g2, { seed: 980, step: 10 }); for (const x of [16, 96]) s5Cap(g, [x, -70], [x, 0], 6, P.g2, 981 + x);
      cutPaper(g, [[36, -76], [70, -76], [74, -84], [40, -86]], P.paper, { seed: 983, step: 6 }); cutPaper(g, [[40, -86], [72, -84], [70, -80], [38, -80]], P.ink2, { seed: 984, step: 6, shadow: false });
    }, { ref: 50 }));
    const chairX = DKX - 8 - 90 * pull, chairY = DKY + 50 * pull, chairA = deskA * (1 - .85 * pull);
    add(s5Card(V, chairX, chairY, chairA, g => { g.scale(S5SS, S5SS);
      s5Cap(g, [-24, -40], [16, -40], 7, P.g3, 985); s5Cap(g, [-24, -40], [-26, -98], 6, P.g3, 986); s5Cap(g, [-22, -40], [-24, 0], 5, P.g3, 987); s5Cap(g, [14, -40], [16, 0], 5, P.g3, 988);
    }, { ref: 50 }));
    // 学生：坐 → 站起来走 → 回来坐下（沙漏）→ 接水 → 走两圈 → 伸懒腰 → 接着慢慢走圈
    const LOOP = { x: 540, y: 890, rx: 300, ry: 62 }, WX = 840, WY = 690;
    if (deskA > 0) {
      let kind = 'sit', X = DKX, Y = DKY + 6, face = 1, ph = twos(tau) * TAU * 1.3;
      const loopPt = th => [LOOP.x + LOOP.rx * Math.cos(th), LOOP.y + LOOP.ry * Math.sin(th)];
      if (tau >= pullT + .15 && tau < backT + .35) { const u = sm(pullT + .15, backT - .1, tau, e => e); kind = 'walk'; X = DKX + 170 * u; Y = DKY + 6 + 60 * u; face = 1;
        if (tau > backT - .1) { const v = sm(backT - .1, backT + .35, tau); X = lerp(DKX + 170, DKX, v); Y = lerp(DKY + 66, DKY + 6, v); face = -1; } }
      if (tau >= upT) { const u = sm(upT, cupT + .3, tau, easeIO); kind = 'walk'; face = 1; X = lerp(DKX, WX - 60, u); Y = lerp(DKY + 6, WY + 30, u); }
      if (tau >= cupT + .3) { kind = 'cup'; X = WX - 60; Y = WY + 30; }
      const lapEnd = strT + 1.25, th0 = -.35, thE = TAU * 2 + Math.PI / 2;
      if (tau >= lapT) { const u = sm(lapT, lapT + .4, tau), p0 = [WX - 60, WY + 30], p1 = loopPt(th0); kind = 'jog'; ph = twos(tau) * TAU * 2.4;
        if (u < 1) { X = lerp(p0[0], p1[0], u); Y = lerp(p0[1], p1[1], u); face = 1; }
        else { const th = lerp(th0, thE, sm(lapT + .4, lapEnd, tau, e => e)); [X, Y] = loopPt(th); face = Math.sin(th) < 0 ? 1 : -1; } }
      if (tau >= lapEnd) { kind = 'stretch'; [X, Y] = loopPt(Math.PI / 2); face = 1; ph = twos(tau) * 2; }
      if (tau >= s5E(6) + .1) { const th = Math.PI / 2 + (tau - s5E(6) - .1) * .5; [X, Y] = loopPt(th); face = Math.sin(th) < 0 ? 1 : -1; kind = 'walk'; ph = twos(tau) * TAU * 1.2; }
      const kA = deskA * (kind === 'sit' ? 1 : 1);
      add(s5Card(V, X, Y, kA, g => { g.scale(face * S5SS, S5SS); s5Kid(g, { kind, ph, hair: 1, seed: 500 }); }, { ref: 100, z: Y + 2 }));
    }
    // 沙漏：L6 前半漏完「一小时」，「就起来」时翻过来
    const hgA = fold(t6 + .15, S5OUT.fold), HGX = 590, HGY = 700;
    if (hgA > 0) add(s5Card(V, HGX, HGY, hgA, g => { g.scale(1.3, 1.3);
      const flip = sm(upT - .15, upT + .3, tau, easeOutBack), run = sm(t6 + .5, upT - .2, tau, e => e), run2 = sm(upT + .3, S5OUT.fold, tau, e => e) * .5;
      zh(g, '1 小时', 0, 26, { size: 32, align: 'center', color: P.ink2, p: writeP(tau, t6 + .5, '1 小时', .08) });
      g.save(); g.translate(0, -62); g.rotate(flip * Math.PI);
      const sandTop = flip > .5 ? run2 : 1 - run, sandBot = flip > .5 ? 1 - run2 : run, dir = flip > .5 ? -1 : 1;
      cutPaper(g, [[-30, -56], [30, -56], [4, -2], [30, 56], [-30, 56], [-4, 2]], alpha(S5WH, .75), { seed: 990, step: 10, blur: 2, sx: 1, sy: 1.2, grain: .02 });
      const sand = mix(P.paper2, P.g3, .4), T1 = clamp(sandTop, 0, 1), B1 = clamp(sandBot, 0, 1);
      if (T1 > .02) { const yT = -4 - 46 * T1; g.save(); if (dir < 0) g.scale(1, -1); cutPaper(g, [[-26 * (-yT / 50), yT], [26 * (-yT / 50), yT], [3, -4], [-3, -4]], sand, { seed: 991, step: 6, shadow: false }); g.restore(); }
      if (B1 > .02) { const yB = 50 - 44 * B1; g.save(); if (dir < 0) g.scale(1, -1); cutPaper(g, [[-26, 50], [26, 50], [lerp(26, 6, 1 - (50 - yB) / 50), yB], [0, yB - 8], [-lerp(26, 6, 1 - (50 - yB) / 50), yB]], sand, { seed: 992, step: 6, shadow: false }); g.restore(); }
      if (T1 > .02 && T1 < .98 && Math.abs(flip - (flip > .5 ? 1 : 0)) < .05) rline(g, [[0, 0], [0, 44 * (dir)]], { w: 1.5, color: sand, seed: 993, amp: .1 });
      for (const y of [-56, 56]) cutPaper(g, rectPts(-36, y - 5, 72, 10, 3), mix(P.g2, P.shelf, .35), { seed: 994 + y, step: 8 });
      for (const x of [-31, 31]) s5Cap(g, [x, -52], [x, 52], 2.6, P.g2, 996 + x);
      g.restore();
    }, { ref: 60 }));
    // 饮水机（接水）
    const wA = fold(t6 + .6, S5OUT.fold);
    if (wA > 0) add(s5Card(V, WX, WY, wA, g => { g.scale(1.3, 1.3);
      cutPaper(g, rectPts(-26, -86, 52, 86, 4), P.g1, { seed: 1000, step: 10 });
      cutPaper(g, [[-20, -86], [20, -86], [24, -118], [18, -142], [8, -150], [-8, -150], [-18, -142], [-24, -118]], alpha(S5WATER, .9), { seed: 1001, step: 8 });
      rline(g, [[-16, -120], [16, -120]], { w: 1.5, color: alpha(P.ink2, .4), seed: 1002, amp: .3 });
      cutPaper(g, rectPts(-30, -62, 10, 8, 2), P.g2, { seed: 1003, step: 4 });
      if (tau > cupT + .2 && tau < lapT) { const bl = (tau * 2.5) % 1; s5Circ(g, 6, -110 + bl * -25, 3, alpha('#fff', .8), 1004); }
    }, { ref: 70 }));
    // 立着的小牌子：任何活动 ＞ 一直坐着
    const sgA = fold(s5W(5, '任何', -.1), S5OUT.fold);
    if (sgA > 0) add(s5Card(V, 500, 540, sgA, g => {
      for (const x of [-190, 190]) s5Cap(g, [x, 0], [x, -60], 6, P.g2, 1010 + x);
      cutPaper(g, rectPts(-240, -140, 480, 86, 4), P.paper, { seed: 1012, step: 16 });
      zh(g, '任何活动 ＞ 一直坐着', 0, -82, { size: 42, align: 'center', color: P.ink, p: writeP(tau, s5W(5, '任何'), '任何活动 ＞ 一直坐着', .07) });
      rline(g, [[-80, -64], [140, -64]], { w: 3, color: S5GR, seed: 1013, p: sm(s5W(5, '一直'), s5W(5, '一直') + .5, tau), amp: .5 });
    }, { ref: 90 }));

    // ---------- 帕秋莉（立在右页上的剪纸人偶） ----------
    {
      const home = [1420, 800], left = [1180, 810], box = [1260, 780], front = [1420, 850], side = [1110, 860];
      let X = home[0], Y = home[1], h0 = 0, pose = 'stand', mood = L.mood || 'normal', facing = 1, look = -.2, gesture = null, hop = 0;
      const hopTo = (ta, tb, A, B) => { const u = sm(ta, tb, tau, e => e); if (u <= 0) return false; X = lerp(A[0], B[0], u); Y = lerp(A[1], B[1], u); hop = Math.abs(Math.sin(u * Math.PI * 3)) * 26 * (u < 1 ? 1 : 0); return true; };
      if (tau < t1 - .2) { pose = tau < s5W(0, '好吧') ? 'stand' : 'tired'; mood = tau < s5W(0, '好吧') ? 'normal' : 'sleepy'; look = tau < s5W(0, '好吧') ? .1 : -.3; }
      else if (tau < t2) { hopTo(t1 - .2, t1 + .6, home, left); pose = tau < t1 + .6 ? 'stand' : 'point'; facing = -1; look = .5; mood = 'normal'; }
      else if (tau < t3) { const u = sm(t2 - .15, t2 + .45, tau, e => e); X = lerp(left[0], box[0], u); Y = lerp(left[1], box[1], u); h0 = 96 * easeOut(u) + 70 * Math.sin(u * Math.PI); pose = u < .75 ? 'stand' : 'sit'; if (pose === 'sit') h0 = Math.max(96, h0); facing = -1; look = .6; mood = tau > s5W(2, '就够') ? 'smug' : 'normal'; }
      else if (tau < s5E(3) + .2) { X = box[0]; Y = box[1]; if (tau < s5W(3, '力量', -.3)) { pose = 'sit'; h0 = 96; facing = -1; mood = 'normal'; look = .7; }
        else { const u = sm(s5W(3, '力量', -.3), s5W(3, '力量', .3), tau, e => e); X = lerp(box[0], front[0], u); Y = lerp(box[1], front[1], u); h0 = 96 * (1 - u) + 60 * Math.sin(u * Math.PI); pose = 'hide'; mood = 'flustered'; facing = -1; look = .8; } }
      else if (tau < t5 + .35) { X = front[0]; Y = front[1]; pose = 'lift'; }
      else if (tau < t6) { hopTo(t5 + .4, t5 + 1.1, front, side); if (tau < t5 + .4) { X = front[0]; Y = front[1]; } pose = tau < s5W(5, '任何', -.2) ? 'tired' : 'lecture'; mood = tau < s5W(5, '任何', -.2) ? 'annoyed' : 'normal'; facing = -1; look = .5; gesture = .9; }
      else if (tau < t7 - .8) { X = side[0]; Y = side[1]; facing = -1; look = .5; pose = tau < strT ? 'point' : 'lift'; mood = tau < strT ? 'normal' : 'smug'; }
      else { X = side[0]; Y = side[1]; hopTo(s5W(7, '你们', -.45), s5W(7, '你们', .15), side, front); const cough = tau < s5W(7, '你们', -.15); pose = cough ? 'tired' : 'cross'; mood = cough ? 'annoyed' : 'smug'; look = cough ? -.2 : .8; facing = 1; }
      // 咳嗽时身子一抖
      const coughs = [t7 - .8, t7 - .35]; let jx = 0; for (const tc of coughs) { const q = tau - tc; if (q > 0 && q < .18) { jx = 5 * Math.sin(q * 70); pose = 'tired'; mood = 'annoyed'; } }
      const pA = fold(.9, S5OUT.fold) * 1;
      // 三本书叠成的凳子（L2 坐上去，L3 跳下来，L4 前收起）
      const bk = clamp(fold(t2 - .45, s5E(3) - .1) / (Math.PI / 2), 0, 1.1);
      if (bk > .02) [[0, -66, 66, 32, [mix(P.ribbonRed, P.ink, .45), P.paper2, mix(P.ribbonRed, P.ink, .6)]], [1, -58, 60, 30, [P.g3, mix(P.paper2, P.g2, .2), mix(P.g3, P.ink, .3)]], [2, -62, 54, 34, [mix(P.purple, P.ink, .25), P.paper2, mix(P.purple, P.ink, .45)]]]
        .forEach(([n, a, b2, hh, cols]) => { const hb = [0, 32, 62][n] * bk; add(s5Box(V, box[0] + a, box[0] + b2, box[1] - 38 + n * 3, box[1] + 38 - n * 2, hb, hb + hh * bk, cols, 1060 + n * 10, outA)); });
      // 杠铃笑点的状态
      const jokeOn = tau >= s5E(3) + .2 && tau < t5 + .35;
      const lift = { gy: -403, mar: 0, koa: 0, squash: 0, sag: 0, tiltB: 0, shake: 0, mood: 'flustered' };
      if (jokeOn) {
        const mT = s5W(4, '杠铃', -.25), kT = s5W(4, '好重', -.25), off = t5 - .1;
        lift.mar = sm(mT, mT + .35, tau, easeIn) * (1 - sm(off, off + .25, tau)); lift.koa = sm(kT, kT + .35, tau, easeIn) * (1 - sm(off + .08, off + .33, tau));
        const hitM = tau - mT - .35, hitK = tau - kT - .35;
        lift.sag = (lift.mar >= 1 || hitM > 0 ? 14 : 0) + (hitK > 0 ? 16 : 0) + (hitM > 0 ? 10 * Math.exp(-hitM * 5) * Math.sin(hitM * 30) : 0) + (hitK > 0 ? 12 * Math.exp(-hitK * 5) * Math.sin(hitK * 30) : 0);
        lift.sag *= 1 - sm(off, off + .3, tau);
        lift.tiltB = (hitM > 0 && hitK <= 0 ? .045 * -1 : 0) * -1 * (hitM > 0 ? 1 : 0);
        lift.squash = hitK > 0 ? clamp(easeOutElastic(clamp(hitK / .5, 0, 1)), 0, 1.3) * (1 - sm(off + .1, off + .45, tau, easeOutBack)) : 0;
        lift.shake = hitM > 0 ? (hitK > 0 ? 1 : .5) * (1 - sm(off, off + .2, tau)) : .15;
        lift.mood = hitK > 0 ? 'flustered' : hitM > 0 ? 'annoyed' : 'normal';
        if (tau >= t5 - .1) { lift.mood = 'sleepy'; }
      }
      const barIn = sm(s5E(3) + .2, s5E(3) + .5, tau, easeOutBack), barOut = sm(t5 + .05, t5 + .3, tau);
      const draw = g => { g.translate(jx, 0);
        if (jokeOn) s5LifterGuarded(g, tau, L, lift, barIn * (1 - barOut));
        else drawPatchouli(g, { x: 0, y: 0, h: 520, pose, mood, look, facing, gesture, mouth: L.mouth, blink: blinkAt(tau, 5), t: tau }); };
      if (pA > 0) add(s5Card(V, X, Y, pA, draw, { h0: h0 + hop, ref: 260, z: h0 > 0 ? box[1] + 60 : Y + 3, al: outA }));
      // 咳嗽的两朵小纸云
      coughs.forEach((tc, k) => { const q = tau - tc; if (q <= 0 || q > 1.1) return;
        add(s5Card(V, X - 60 - q * 40, Y + 4, Math.PI / 2, g => { const s = .8 + q * .5, a = 1 - sm(.6, 1.1, q);
          g.globalAlpha *= a; g.translate(0, -330 - q * 60 - k * 30); g.scale(s * 1.7, s * 1.7); cutPaper(g, [[-22, 6], [-26, -6], [-18, -16], [-6, -18], [0, -24], [13, -20], [20, -12], [27, -7], [25, 6], [15, 12], [3, 11], [-8, 14], [-18, 12]], S5WH, { seed: 1030 + k, step: 5 });
          zh(g, '咳', 0, 5, { size: 17, align: 'center', color: P.ink2 }); }, { ref: 100, z: Y + 4 })); });
    }

    // ---------- 画：桌面 → 书页平面（透视）→ 影子 → 立体件（远的先画） ----------
    c.fillStyle = WOOD; c.fillRect(0, 0, W, H);
    c.save(); c.translate(CX, CY + V.dy); c.scale(V.zm, V.zm); c.translate(-V.cx, -CY);
    grain(c, polyPath(rectPts(-400, -400, W + 800, H + 800)), .1);
    tiltPlane(c, b => {
      spread(b, tau);
      pageHeader(b, '第五页 · 运动', tau, .25, { t1: S5OUT.fold });
      // 折缝：立体件立在哪里，书页上就有一道浅折痕
      const crease = (x0, x1, y, a) => { if (a > 0) rline(b, [[x0, y], [x1, y]], { w: 1.5, color: alpha(P.ink2, .25 * a), seed: 1040 + y, amp: .3 }); };
      crease(110, 900, kidY, sm(t1, t1 + .5, tau) * (1 - sm(t2, t2 + .5, tau)));
      crease(100, 910, S5TENT.Y, sm(t2 + .8, t2 + 1.3, tau) * outA * (1 - sm(t5 - .3, t5, tau)));
      // 书页上的手写
      fade(b, outA * (1 - sm(t5 - .4, t5 - .1, tau)), () => {
        const s1 = '150 ÷ 7 ≈ 21 分钟 / 天', w1 = s5W(2, '一天', -.3);
        zh(b, s1, 520, 850, { size: 50, align: 'center', color: P.ink, p: writeP(tau, w1, s1, .06) });
        const s2 = '＋ 力量练习 · 每周 ≥ 2 天', w2 = s5W(3, '两天', -.2);
        zh(b, s2, 520, 925, { size: 44, align: 'center', color: P.ink2, p: writeP(tau, w2, s2, .06) });
        zh(b, 'WHO 2020', 880, 965, { size: 26, align: 'right', color: P.g2, p: writeP(tau, w2 + 1.2, 'WHO 2020', .05) });
      });
      // 走圈的虚线、拉条
      fade(b, outA * sm(t5 - .1, t5 + .3, tau), () => {
        rline(b, ellPts(LOOP.x, LOOP.y, LOOP.rx, LOOP.ry, 60), { w: 2.2, color: alpha(P.ink2, .45), close: true, dash: [10, 12], seed: 1050, amp: .5, p: sm(lapT - .6, lapT, tau) });
        const tx = DKX - 40 - 90 * pull, ty = DKY + 20 + 50 * pull;
        cutPaper(b, [[tx - 18, ty], [tx + 18, ty], [tx + 18, ty + 96], [tx + 6, ty + 110], [tx - 18, ty + 110]], P.paper2, { seed: 1051, step: 12, blur: 2, sx: 1, sy: 1.5 });
        zh(b, '拉', tx, ty + 88, { size: 30, align: 'center', color: P.ink2 });
        if (pull < .05) arrow(b, [tx, ty + 120], [tx - 30, ty + 170], { w: 2.5, color: alpha(P.ink2, .6), head: 12, seed: 1052, bend: 8 });
      });
    }, { pitch: V.p, cx: V.cx, cy: V.cy, f: S5F });
    // 桌面的木板缝（透视里向远处收拢），书以外的地方；远处压暗一点
    if (V.tilt > .01) { const e = 8, bq = s5Proj(V, [[BOOK.x - 10 - e, BOOK.y - 8 - e], [BOOK.x + BOOK.w + 10 + e, BOOK.y - 8 - e], [BOOK.x + BOOK.w + 10 + e, BOOK.y + BOOK.h + 12 + e], [BOOK.x - 10 - e, BOOK.y + BOOK.h + 12 + e]]);
      c.save(); const cp = new Path2D(); cp.rect(-3000, -3000, W + 6000, H + 6000); cp.addPath(polyPath(bq)); c.clip(cp, 'evenodd');
      for (let k = -10; k <= 14; k++) { const X = CX + k * 270 + 40, a = s5P(V, X, -3000), b = s5P(V, X, 1500);
        rline(c, [[a[0], a[1]], [b[0], b[1]]], { w: 2, color: `rgba(0,0,0,${.3 * V.tilt})`, seed: 1070 + k, amp: .5 }); }
      c.restore(); }
    if (V.tilt > .01) { c.save(); const sc0 = c.getTransform().a / V.zm; c.setTransform(sc0, 0, 0, sc0, 0, 0); const gr = c.createLinearGradient(0, 0, 0, 460); gr.addColorStop(0, `rgba(12,8,6,${.5 * V.tilt})`); gr.addColorStop(1, 'rgba(12,8,6,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 460); c.restore(); }
    s5Shadows(c, pieces, .22);
    pieces.sort((a, b) => a.z - b.z).forEach(p => { c.save(); p.draw(c); c.restore(); });
    c.restore();
  } });
// s5LifterGuarded：杠铃出现/收起时，先只画帕秋莉举手，杠铃随 k 缩放出现
function s5LifterGuarded(g, tau, L, st, k) {
  if (k >= .999) { s5Lifter(g, tau, L, st); return; }
  const st2 = { ...st, mar: k < 1 ? st.mar : st.mar };
  drawPatchouli(g, { x: 0, y: 0, h: 520, pose: 'lift', mood: st.mood, mouth: L.mouth, blink: blinkAt(tau, 5), t: tau });
  if (k > .01) { g.save(); g.translate(0, st.gy); g.scale(k, k); g.translate(0, -st.gy); s5Barbell(g, st2, tau, 'bar'); g.restore(); }
}
