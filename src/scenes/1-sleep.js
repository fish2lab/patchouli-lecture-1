'use strict';
// 第 1 段：睡眠（第二版，见 docs/画风v2.md、docs/分镜v2.md 顶部表格）。
// 编配：**剪纸灯箱 / 纸雕剧场**。一只背后打光的纸剧场，一层层剪纸由远到近：
//   会转的天空转盘（太阳、月亮、晨昏色带、24 小时刻度环都贴在一个大圆盘上）→ 远山 → 远处校园 → 宿舍楼（窗是镂空的，夜里透光）
//   → 树 → 地面和小路 → 前景道具（锁、咖啡杯）→ 前景草叶；外面是剧场的框和顶檐，顶檐上吊着页签、指针和手写纸牌。
// 昼夜靠转盘和各层纸色变化；镜头用 parallax 缓推、横移，推近时近层放大得多、远层几乎不动。帕秋莉是站在台口前讲的剪纸人偶。
// 进场：翻页后书页上一扇小窗（窗里就是灯箱），镜头穿窗进去。出场：夜里推向月亮，月亮成为正中的圆盘 → handoffDisc。
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
const S1DUR = seqEnd(S1LINES) + 2.0;
const S1T = i => S1LINES[i][0], S1E = i => S1LINES[i][1];
// S1W：第 i 句说到 f（0..1）处的时间（按字的位置估，不含句尾 hold）
const S1W = (i, f) => { const l = S1LINES[i], h = (l[3] && l[3].hold) || 0; return l[0] + f * Math.max(.6, l[1] - l[0] - h - .3); };

// ===================== 节拍（全部由台词时间算出） =====================
const S1B = (() => { const t = S1T, e = S1E, w = S1W; return {
  in0: .85, in1: 1.6,                                            // 穿窗进灯箱
  rise: [1.75, 2.0, 2.3, 2.6], found: w(0, .62), pat: 1.7,       // 远山、校园、宿舍、树依次立起；「地基」地面和草叶砸下来
  tick: w(1, .12), notch: w(1, .62), light: w(1, .86),           // 刻度环、拨一格、是光
  sun0: w(2, .05), cort: w(2, .48), wake: w(2, .8),              // 日出、皮质醇、叫醒
  yawn: w(3, .5), glass: w(3, .72),                              // 困意、倒计时
  door: w(4, .18), walk0: w(4, .3), walk1: w(4, .52), num4: w(4, .5), gag: e(4) - 1.15,
  pane: t(5) + .35, tag5: w(5, .66),
  spin0: t(6) + .15, spin1: t(6) + 1.55, num6: w(6, .2), wedge: w(6, .3),
  off0: t(7) + .15, phone: w(7, .3), yank: w(7, .72),
  dim: w(8, .43), warm: w(8, .57), lamp: w(8, .72), back: w(8, .92),
  props: t(9) + .05, bean: w(9, .06), toss: w(9, .2), bump: w(9, .45), pm: w(9, .52), trial: w(9, .78),
  ribbon: w(10, .3), six: w(10, .5), eight: w(10, .64),
  up: t(11), yankR: w(11, .1), day: w(11, .26), night: w(11, .56), file: w(11, .66), num11: w(11, .86),
  exit0: e(11) - .25, exit1: S1DUR - .4,
}; })();

// ===================== 世界坐标（镜头不动时就是屏幕坐标） =====================
const S1Z = { sky: 5, hills: 2.6, campus: 1.5, dorm: .4, trees: .24, ground: .16, props: .1, grass: .05 };
const S1SKY = { x: 960, y: 757, R: 1400, sun: 459, ring: 560 };
const S1DORM = { x0: 850, x1: 1270, top: 424, bot: 840, door: [1060, 812] };
const S1WINS = (() => { const o = [], cols = [908, 1009, 1111, 1212], rows = [488, 576, 664, 752];
  rows.forEach((y, r) => cols.forEach((x, k) => { if (r === 3 && (k === 1 || k === 2)) return; o.push([x, y]); })); return o; })();
const S1KW = 4;                                  // 小人住的那扇窗（二楼最左，朝日出那边）
const S1WW = 74, S1WH = 80;                      // 窗的宽高
const S1PX = 1612, S1PY = 892;                   // 帕秋莉（台口前）
const S1LOCK = [330, 690];                       // 前景的纸锁
const s1NP = k => mix(P.purple, P.night, k);   // 夜里各层：越近越暗（灯箱的纵深）
const S1C = {
  kraft: mix(P.paperEdge, P.paper, .35), frame: mix(P.ink, P.purple, .22), white: '#f7f3ea', moon: '#ede6d6',
  lamp: P.lamp, amber: mix(P.lamp, P.ribbonRed, .28), phone: '#eef0ec', star: '#e9dfc4', sun: P.moon, sunIn: mix(P.moon, '#ffffff', .32),
  kid: mix(P.ink, P.night, .4), bean: P.shelf2,
  // 天空转盘的色带：白天 → 金 → 暮紫 → 深紫 → 夜
  sky: ['#efe7d3', mix('#efe7d3', P.moon, .5), mix(P.moon, P.purple, .5), s1NP(.35), s1NP(.54)],
};
const S1PAL = {
  hills2: [mix(P.g1, P.paper, .3), s1NP(.64)], hills: [mix(P.g1, P.purple, .16), s1NP(.74)],
  campus: [mix(P.g2, P.g1, .45), s1NP(.82)], dorm: [mix(P.g3, P.purple, .22), s1NP(.89)],
  trees: [mix(P.g3, P.ink2, .45), mix(P.night, '#000000', .1)], ground: [mix(P.ink2, P.g3, .35), mix(P.night, '#000000', .22)],
  grass: [mix(P.ink, P.ink2, .35), mix(P.night, '#000000', .42)], glass: [mix(P.g1, P.paper, .35), s1NP(.8)],
};
const s1Pal = (k, nk) => mix(S1PAL[k][0], S1PAL[k][1], nk);

// ===================== 时间：转盘上的钟点、昼夜、镜头 =====================
// s1Clock：此刻转盘指向几点（连续值，39 = 次日 15 点）
function s1Clock(tau) {
  const b = S1B;
  return key(tau, [[0, 3.6], [b.notch, 3.6], [b.notch + .2, 4.6], [b.light - .15, 4.6], [b.light + .45, 5.7],
    [b.sun0, 5.7], [b.wake, 7.2], [b.spin0, 7.9], [b.spin1, 23.2], [b.yank, 23.45], [b.yank + .42, 13],
    [b.back, 13], [b.back + 1.15, 23.7], [b.pm - .1, 23.7], [b.pm + 1.0, 39],
    [b.trial, 39], [b.trial + .45, 37.3], [b.trial + 1.0, 41], [b.trial + 1.5, 38.6],
    [S1T(10) + .15, 38.6], [b.ribbon - .15, 51], [b.yankR, 51], [b.day, 62], [b.night - .1, 62], [b.night + .85, 74]]);
}
// s1Night：夜的程度 0..1（太阳越低越暗）
function s1Night(T) { const cs = Math.cos((T - 12) * Math.PI / 12); return 1 - easeSine(clamp((cs + .1) / .5, 0, 1)); }
// 天空转盘上：钟点 h 在转盘未转时的角度（从正上方起顺时针），和世界坐标里的点
const s1Phi = h => (12 - h) * Math.PI / 12;
const s1On = (phi, r) => [S1SKY.x + Math.sin(phi) * r, S1SKY.y - Math.cos(phi) * r];
const s1Rot = T => (T - 12) * Math.PI / 12;
const s1SkyAt = (h, T, r) => s1On(s1Phi(h) + s1Rot(T), r);   // 转过之后钟点 h 在哪
// 镜头：[camX, camY, zoom]，和 kit 的 parallax 同一套算法。s1Map/s1Unmap：深度 d 的层上的点 ↔ 屏幕
function s1Map(p, d, cam) { const k = 1 / (1 + d), z = 1 + (cam[2] - 1) * k; return [CX + z * (p[0] - CX - cam[0] * k), CY + z * (p[1] - CY - cam[1] * k), z]; }
// s1Aim：让深度 d 层上的点 F 在 zoom 下落到屏幕 S
function s1Aim(F, d, zoom, S = [CX, CY]) { const k = 1 / (1 + d), z = 1 + (zoom - 1) * k; return [(F[0] - CX - (S[0] - CX) / z) / k, (F[1] - CY - (S[1] - CY) / z) / k, zoom]; }
function s1Cam(tau) {
  const b = S1B, t = S1T, kw = S1WINS[S1KW], wide = [0, 0, 1];
  const win = s1Aim(kw, S1Z.dorm, 2.4, [800, 470]), win2 = s1Aim(kw, S1Z.dorm, 2.5, [820, 470]), door = s1Aim([840, 760], S1Z.ground, 1.35, [820, 590]);
  const cam = key(tau, [[0, wide], [b.found, [0, 10, 1.02]], [t(1) + .1, [0, 10, 1.03]], [b.tick + .9, [-30, -150, 1.06]], [b.light, [-40, -150, 1.07]],
    [b.sun0, [-40, -150, 1.07]], [b.sun0 + 1.4, win], [S1E(2), win], [t(3) + 1.0, [-60, -30, 1.18]], [t(4) + .1, [-60, -30, 1.18]], [b.walk0, door], [b.gag, door], [b.gag + .5, [60, -20, 1.2]],
    [t(5) + .1, [60, -20, 1.2]], [b.pane - .1, win], [t(6), win], [b.spin0 + .9, [0, -70, 1.0]], [b.off0, [0, -70, 1.0]], [b.phone, win2], [b.yank - .05, win2], [b.yank + .5, [0, -40, 1.04]], [S1T(8) + .2, [0, -40, 1.04]], [b.dim - .1, win], [b.back, win], [b.back + 1.1, [0, -30, 1.05]],
    [t(9), [30, 0, 1.0]], [b.pm, [30, 0, 1.0]], [b.pm + 1, [0, -60, 1.04]], [t(10) + .2, [0, -60, 1.04]], [b.ribbon + .6, [0, -170, 1.08]], [b.yankR, [0, -150, 1.08]],
    [b.day + .5, [-20, -80, 1.1]], [b.night + .2, [-20, -80, 1.1]], [b.file, s1Aim(kw, S1Z.dorm, 1.6, [800, 520])], [b.exit0, s1Aim(kw, S1Z.dorm, 1.6, [800, 520])]]);
  if (tau <= b.exit0) return cam;
  // 出场：推向月亮。天空层的放大倍数按指数长到 300/月亮半径，月亮从原位滑到正中
  const u = sm(b.exit0, b.exit1, tau, easeIO), moon = s1SkyAt(24, s1Clock(tau), S1SKY.sun), zs = Math.pow(300 / 50, u), k = 1 / (1 + S1Z.sky);
  const S0 = s1Map(moon, S1Z.sky, cam), S = [lerp(S0[0], CX, u), lerp(S0[1], CY, u)], zoom = 1 + (zs * (1 + (cam[2] - 1) * k) - 1) / k;
  return s1Aim(moon, S1Z.sky, zoom, S);
}

// ===================== 小工具 =====================
const s1Pop = (tau, a, d = .4) => tau < a ? 0 : easeOutBack(clamp((tau - a) / d, 0, 1));
// s1Arc：天空转盘上 r0..r1 的环带，从钟点 h0 到 h1（未转时的坐标）
function s1Arc(r0, r1, h0, h1, n = 40) { const o = []; for (let k = 0; k <= n; k++) o.push(s1On(s1Phi(lerp(h0, h1, k / n)), r1)); for (let k = n; k >= 0; k--) o.push(s1On(s1Phi(lerp(h0, h1, k / n)), r0)); return o; }
// s1Strip：一条光（剪纸条）：a → b，宽 w0 → w1，p 伸出比例；part = [u0, u1, alpha] 分段透明（硫酸纸后面变淡）
function s1Strip(c, a, b, o = {}) {
  const { w0 = 22, w1 = 70, p = 1, col = mix(P.moon, '#ffffff', .5), al = .8, seed = 460, cut = null } = o; if (p <= .01 || al <= .01) return;
  const dx = b[0] - a[0], dy = b[1] - a[1], Lh = Math.hypot(dx, dy) || 1, nx = -dy / Lh, ny = dx / Lh;
  const seg = (u0, u1, aa) => { if (u1 <= u0) return; const P0 = [a[0] + dx * u0, a[1] + dy * u0], P1 = [a[0] + dx * u1, a[1] + dy * u1], wa = lerp(w0, w1, u0) / 2, wb = lerp(w0, w1, u1) / 2;
    cutPaper(c, [[P0[0] + nx * wa, P0[1] + ny * wa], [P1[0] + nx * wb, P1[1] + ny * wb], [P1[0] - nx * wb, P1[1] - ny * wb], [P0[0] - nx * wa, P0[1] - ny * wa]], col, { seed: seed + (u0 * 10 | 0), step: 34, al: aa, blur: 6, grain: .05 }); };
  if (cut) { seg(0, Math.min(p, cut[0]), al); seg(cut[0], p, al * cut[1]); } else seg(0, p, al);
}
// s1Thread：顶檐上垂下的一根线
function s1Thread(c, x0, y0, x1, y1, al = 1) { c.save(); c.globalAlpha *= al; c.strokeStyle = alpha(mix(P.ink2, P.moon, .3), .85); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore(); }
const S1TOP = 86;   // 顶檐下沿（吊东西的线从这里垂下来）

// ===================== 天空转盘 =====================
const S1STARS = Array.from({ length: 46 }, (_, k) => [hash(k, 51) * TAU, 240 + hash(k, 52) * 1100, 3.5 + hash(k, 53) * 6]);
const S1CLOUDS = [[260, 250, 1.0], [1500, 190, .8], [980, 120, 1.15], [2100, 300, .9]];
// s1SkyCol：天色（背光的颜色），hs = 太阳高度（cos）
function s1SkyCol(hs) { const K = [[-.4, S1C.sky[4]], [-.18, S1C.sky[3]], [-.02, S1C.sky[2]], [.16, S1C.sky[1]], [.4, S1C.sky[0]]];
  if (hs <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (hs < K[i][0]) return mix(K[i - 1][1], K[i][1], easeSine((hs - K[i - 1][0]) / (K[i][0] - K[i - 1][0]))); return K.at(-1)[1]; }
// 纸云：白天飘，夜里收起
function s1Clouds(c, tau, st) { const a = 1 - st.nk; if (a <= .02) return;
  S1CLOUDS.forEach(([x0, cy, s], k) => { const cx = ((x0 + tau * (6 + k * 2) + 600) % 2800) - 600, pts = [];
    for (let i = 0; i <= 26; i++) { const u = i / 26, bump = Math.abs(Math.sin(u * Math.PI * 3.2 + k)) * 34 * s + 18 * s; pts.push([cx + (u - .5) * 230 * s, cy - bump * Math.sin(u * Math.PI)]); }
    pts.push([cx + 115 * s, cy + 10 * s], [cx - 115 * s, cy + 10 * s]);
    cutPaper(c, pts, mix(S1C.sky[0], '#ffffff', .55), { seed: 410 + k, step: 14, blur: 10, sy: 6, al: a }); }); }
function s1Sky(c, tau, st) {
  const { x, y, R, sun, ring } = S1SKY, b = S1B, T = st.T;
  // 背光：灯箱后面那盏灯的颜色就是天色（白天淡暖、晨昏金紫、夜里深紫），太阳那边亮一点
  const hs = Math.cos(s1Rot(T)), sky = mix(s1SkyCol(hs), P.night, st.dark), sunW = s1SkyAt(12, T, sun);
  c.fillStyle = sky; c.fillRect(-2000, -2000, W + 4000, H + 4000);
  const glow = clamp((hs + .25) / .5, 0, 1); if (glow > 0) { const g = c.createRadialGradient(sunW[0], sunW[1], 20, sunW[0], sunW[1], 900); g.addColorStop(0, alpha('#fff6e0', .35 * glow)); g.addColorStop(1, alpha('#fff6e0', 0)); c.fillStyle = g; c.fillRect(-2000, -2000, W + 4000, H + 4000); }
  // 天边的晨昏色带：三条波浪边的彩纸，只在太阳贴着地平线时露出来
  const tw = Math.exp(-Math.pow(hs / .28, 2)), dawn = Math.sin(s1Rot(T)) < 0;
  if (tw > .02) [[520, S1C.sky[3], 0], [575, S1C.sky[2], 1], [622, S1C.sky[1], 2]].forEach(([yy, col, k]) => { const pts = [[-800, 1400]];
    for (let px = -800; px <= 2700; px += 40) pts.push([px, yy + (1 - tw) * 160 + 14 * Math.sin(px * .006 + k * 2 + (dawn ? 0 : 3))]); pts.push([2700, 1400]);
    cutPaper(c, pts, col, { seed: 402 + k, step: 40, blur: 16, sx: 0, sy: -4, al: clamp(tw * 1.4, 0, 1) }); });
  // 夜里不动的远星
  if (st.nk > .05) S1STARS.slice(0, 22).forEach(([a, r, s], k) => sparkle(c, 80 + hash(k, 61) * 1760, 110 + hash(k, 62) * 420, s * .7, { color: alpha(S1C.star, st.nk * (.6 + .4 * Math.sin(tau * 1.7 + k))), rot: a }));
  // 天空转盘：一张半透明的大圆纸（星图盘），刻度环、太阳、月亮、星星都贴在它上面，跟着钟点转
  spin(c, x, y, s1Rot(T), () => {
    vellum(c, circPts(x, y, ring + 70, 120), { seed: 401, step: 50, color: '#fbf6ea', al: lerp(.5, .12, st.nk) * (1 - st.dark), blur: 18, sy: 0 });
    rline(c, circPts(x, y, ring + 70, 120), { w: 1.5, color: alpha(mix(P.ink2, S1C.star, st.nk), .35), close: true, seed: 406, amp: .6 });
    for (const [a, r, s] of S1STARS.slice(22)) { const rr = 130 + (r - 240) * .38, aa = Math.PI + (a / TAU - .5) * 2.4, [sx, sy] = [x + Math.sin(aa) * rr, y - Math.cos(aa) * rr];
      sparkle(c, sx, sy, s * (1 + .15 * Math.sin(tau * 2 + a * 7)), { color: alpha(S1C.star, .25 + .75 * st.nk), rot: a }); }
    // 24 小时刻度环：画出比例 st.tick（L1 「生物钟」时一格格画出来）
    const ringCol = () => mix(P.ink2, '#d8ceb8', st.nk);
    if (st.tick > 0) {
      rline(c, s1Arc(ring, ring, 12, 12 + 24 * st.tick, 96).slice(0, 97), { w: 2.2, color: alpha(P.ink2, .55), seed: 420, amp: .8 });
      for (let h = 0; h < 24; h++) { if (h / 24 > st.tick) break; const hh = 12 + h, big = hh % 3 === 0, a = s1Phi(hh), p0 = s1On(a, ring - 2), p1 = s1On(a, ring + (big ? 20 : 11));
        rline(c, [p0, p1], { w: big ? 3 : 2, color: ringCol(hh), seed: 421 + h, amp: .4 });
        if (big) { const q = s1On(a, ring + 42); c.save(); c.translate(q[0], q[1]); c.rotate(a); zh(c, String(hh % 24), 0, 0, { size: 30, align: 'center', base: 'middle', color: ringCol(hh), al: clamp(st.tick * 24 - h, 0, 1) }); c.restore(); } }
    }
    // 23—4 点：一条深色纸带盖住这段刻度（L6 滑进来，L9 撕掉）
    if (st.wedge > 0) { const hEnd = lerp(23, 28, st.wedge);
      const path = cutPaper(c, s1Arc(ring - 17, ring + 17, 23, hEnd, 30), mix(P.ink, '#000000', .2), { seed: 430, step: 16, blur: 6, al: st.wedgeA });
      fade(c, st.wedgeA, () => { rline(c, s1Arc(ring - 11, ring - 11, 23, hEnd, 30).slice(0, 31), { w: 1.4, color: alpha(P.moon, .7), seed: 431, dash: [7, 7], amp: .3 });
        rline(c, s1Arc(ring + 11, ring + 11, 23, hEnd, 30).slice(0, 31), { w: 1.4, color: alpha(P.moon, .7), seed: 432, dash: [7, 7], amp: .3 }); }); }
    // 6–8 小时：紫色书签丝带沿刻度环量出来，末端燕尾
    if (st.rib > 0 && st.ribA > 0) { const h1 = 23 + st.rib, a1 = s1Phi(h1), n = 30, pts = [];
      for (let k = 0; k <= n; k++) pts.push(s1On(s1Phi(lerp(23, h1, k / n)), ring + 20));
      const tip = s1On(a1 - .018, ring), notch = s1On(a1 + .01, ring);
      for (let k = n; k >= 0; k--) pts.push(s1On(s1Phi(lerp(23, h1, k / n)), ring - 20));
      pts.splice(n + 1, 0, s1On(a1 - .03, ring + 20), notch, s1On(a1 - .03, ring - 20));
      fade(c, st.ribA, () => { cutPaper(c, pts, P.purple, { seed: 440, step: 14, blur: 8, sy: 4 }); rline(c, s1Arc(ring, ring, 23, h1, 30).slice(0, 31), { w: 1, color: alpha('#ffffff', .25), seed: 441 });
        for (const [hh, lab, t0] of [[29, '6', b.six], [31, '8', b.eight]]) { if (tau < t0 || st.rib < hh - 23 - .05) continue; const a = s1Phi(hh), q = s1On(a, ring + 50), k = s1Pop(tau, t0, .3);
          c.save(); c.translate(q[0], q[1]); c.rotate(a); c.scale(k, k); zh(c, lab, 0, 0, { size: 36, align: 'center', base: 'middle', color: mix(P.purple, '#ffffff', .55) }); c.restore(); } }); }
    // 太阳（带一张小脸；被手机拽回白天时一脸困惑地转半圈）和月亮
    const [sx, sy] = [x, y - sun];
    spin(c, sx, sy, st.sunSpin, () => {
      cutPaper(c, starPts(sx, sy, 78, 14, .76, tau * .05), S1C.sun, { seed: 450, step: 8, blur: 10, sx: 0, sy: 4 });
      cutPaper(c, circPts(sx, sy, 54, 40), S1C.sunIn, { seed: 451, step: 8, blur: 4, sx: 0, sy: 2 });
      c.fillStyle = mix(P.ink2, P.moon, .3); for (const d of [-1, 1]) { c.beginPath(); c.ellipse(sx + d * 17, sy - 6, 4, st.sunEye ? 7 : 5, 0, 0, TAU); c.fill(); }
      rline(c, st.sunEye ? [[sx - 9, sy + 20], [sx - 3, sy + 16], [sx + 3, sy + 20], [sx + 9, sy + 16]] : [[sx - 12, sy + 14], [sx, sy + 21], [sx + 12, sy + 14]], { w: 3, color: mix(P.ink2, P.moon, .3), seed: 452, smooth: !st.sunEye, amp: .3 });
    });
    cutPaper(c, circPts(x, y + sun, 50, 56), S1C.moon, { seed: 455, step: 10, blur: 16, sx: 0, sy: 4, grain: .12 });
  });
}

// ===================== 远山、校园 =====================
function s1Hills(c, tau, st) {
  const nk = st.nk, far = [[-700, 1600]], near = [[-700, 1600]];
  for (let x = -700; x <= 2620; x += 30) { far.push([x, 606 + 30 * Math.sin(x * .0042 + 1.3) + 14 * Math.sin(x * .013)]); near.push([x, 660 + 26 * Math.sin(x * .0033 + 4) + 10 * Math.sin(x * .017 + 1)]); }
  far.push([2620, 1600]); near.push([2620, 1600]);
  cutPaper(c, far, s1Pal('hills2', nk), { seed: 470, step: 40, blur: 12, sy: -3, sx: 0 });
  cutPaper(c, near, s1Pal('hills', nk), { seed: 471, step: 40, blur: 12, sy: -3, sx: 0 });
}
function s1Campus(c, tau, st) {
  const nk = st.nk, col = s1Pal('campus', nk), sh = { step: 20, blur: 10, sx: -2, sy: -2 };
  // 教学楼、图书馆（圆顶）、水塔，远远一片
  cutPaper(c, [[1320, 1500], [1320, 590], [1400, 590], [1400, 560], [1560, 560], [1560, 600], [1640, 600], [1640, 1500]], col, { seed: 480, ...sh });
  const dome = [[1690, 1500], [1690, 620]]; for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; dome.push([1780 + Math.cos(a) * 90, 620 + Math.sin(a) * 70]); } dome.push([1870, 620], [1870, 1500]);
  cutPaper(c, dome, col, { seed: 481, ...sh });
  cutPaper(c, [[1772, 552], [1788, 552], [1784, 510], [1776, 510]], col, { seed: 482, ...sh });
  cutPaper(c, [[150, 1500], [158, 640], [170, 640], [176, 1500]], col, { seed: 483, ...sh });
  cutPaper(c, [[120, 640], [206, 640], [196, 596], [130, 596]], col, { seed: 484, ...sh });
  cutPaper(c, [[-400, 1500], [-400, 700], [60, 690], [300, 712], [300, 1500]], col, { seed: 485, ...sh });
  // 远处的窗：夜里零星亮几扇
  if (nk > .3) for (let k = 0; k < 14; k++) { const x = 1340 + (k % 7) * 40, y = 612 + Math.floor(k / 7) * 40; if (hash(k, 7) < .45) { c.fillStyle = alpha(S1C.lamp, (nk - .3) * st.lit); c.fillRect(x, y, 14, 16); } }
}

// ===================== 宿舍楼 =====================
// s1Kid：窗里（或门口）的小人剪影。mode：sleep 躺着 | sit 坐起伸懒腰 | phone 躺着举手机 | desk 伏案 | stand 站在窗边
function s1KidIn(c, x, y, mode, tau, col, o = {}) {
  const k = o.k ?? 1; c.save(); c.translate(x, y); c.scale(1.2, 1.2); c.translate(-x, -y);
  const bed = () => { c.fillStyle = col; c.fillRect(x - 31, y + 14, 62, 9); c.fillRect(x - 31, y + 4, 6, 26); c.fillRect(x + 25, y + 10, 6, 20); };
  c.save(); c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  if (mode === 'sleep' || mode === 'phone') { bed(); c.beginPath(); c.moveTo(x - 18, y + 14); c.quadraticCurveTo(x + 2, y - 2, x + 24, y + 14); c.fill(); c.beginPath(); c.arc(x - 19, y + 6, 7.5, 0, TAU); c.fill();
    if (mode === 'phone') { c.lineWidth = 4; c.beginPath(); c.moveTo(x - 10, y + 8); c.lineTo(x - 6, y - 8); c.stroke(); c.fillStyle = o.glow || S1C.phone; c.fillRect(x - 11, y - 18, 9, 12); } }
  if (mode === 'sit') { bed(); const up = k; c.beginPath(); c.moveTo(x - 10, y + 14); c.quadraticCurveTo(x + 8, y + 4, x + 24, y + 14); c.fill();
    c.fillRect(x - 25, y + 14 - 22 * up, 12, 22 * up); c.beginPath(); c.arc(x - 19, y + 6 - 26 * up, 7.5, 0, TAU); c.fill();
    if (up > .9) { const a = Math.sin(twos(tau) * 5) * .2; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x - 23, y - 6); c.lineTo(x - 30, y - 30 + a * 8); c.moveTo(x - 15, y - 6); c.lineTo(x - 8, y - 30 - a * 8); c.stroke(); } }
  if (mode === 'desk') { c.fillRect(x - 6, y + 8, 38, 5); c.fillRect(x + 26, y + 8, 4, 26); c.beginPath(); c.arc(x - 12, y - 6, 7.5, 0, TAU); c.fill(); c.fillRect(x - 18, y + 2, 12, 22); c.lineWidth = 3; c.beginPath(); c.moveTo(x - 8, y + 4); c.lineTo(x + 6, y + 8); c.stroke();
    c.beginPath(); c.moveTo(x + 22, y + 8); c.lineTo(x + 18, y - 12); c.lineTo(x + 8, y - 16); c.stroke(); c.beginPath(); c.moveTo(x + 2, y - 14); c.lineTo(x + 14, y - 22); c.lineTo(x + 14, y - 10); c.fill(); }
  if (mode === 'stand') { c.beginPath(); c.arc(x - 4, y - 14, 8, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x - 16, y + 36); c.lineTo(x - 12, y - 4); c.lineTo(x + 4, y - 4); c.lineTo(x + 8, y + 36); c.fill(); }
  c.restore(); c.restore();
}
// s1Walker：走出宿舍的小人（剪影剪纸，脚底 (x, y)）。walk 走路相位，arms 0..1 伸懒腰
function s1Walker(c, x, y, walk, arms, col, tau) {
  const sw = Math.sin(walk * 12) * (arms > 0 ? 0 : 1), bob = Math.abs(Math.sin(walk * 12)) * 2;
  const pts = [[x - 8, y], [x - 3 - sw * 5, y], [x - 1, y - 20], [x + 1, y - 20], [x + 3 + sw * 5, y], [x + 8, y], [x + 4, y - 22], [x + 8, y - 46 - bob], [x - 8, y - 46 - bob], [x - 4, y - 22]];
  cutPaper(c, pts, col, { seed: 490, step: 6, blur: 3, sx: 2, sy: 1 });
  cutPaper(c, circPts(x, y - 56 - bob, 9, 16), col, { seed: 491, step: 5, blur: 3, sx: 2, sy: 1 });
  for (const d of [-1, 1]) { const sh = [x + d * 6, y - 42 - bob], down = [x + d * 9 + sw * d * 3, y - 22 - bob], up = [x + d * 17, y - 70 - bob + Math.sin(twos(tau) * 6 + d) * 2];
    rline(c, [sh, [lerp(down[0], up[0], arms), lerp(down[1], up[1], arms)]], { w: 4.5, color: col, seed: 492 + d }); }
}
function s1Dorm(c, tau, st) {
  const b = S1B, nk = st.nk, { x0, x1, top, bot } = S1DORM, col = s1Pal('dorm', nk), glass = s1Pal('glass', nk), kidCol = mix(col, P.ink, .55);
  // 楼身 + 檐口 + 屋顶水箱
  cutPaper(c, [[x0, bot], [x0, top], [x0 - 12, top], [x0 - 12, top - 16], [x1 + 12, top - 16], [x1 + 12, top], [x1, top], [x1, bot]], col, { seed: 500, step: 26, blur: 12, sx: -4, sy: -3 });
  cutPaper(c, [[x1 - 120, top - 16], [x1 - 120, top - 62], [x1 - 40, top - 62], [x1 - 40, top - 16]], col, { seed: 501, step: 14, blur: 8, sx: -3, sy: -2 });
  // 楼顶晾衣绳：两根杆、一根线、几件小衣服（风里轻晃）
  rline(c, [[x0 + 40, top - 16], [x0 + 40, top - 70]], { w: 4, color: col, seed: 502 }); rline(c, [[x0 + 210, top - 16], [x0 + 210, top - 70]], { w: 4, color: col, seed: 503 });
  const rope = u => [lerp(x0 + 40, x0 + 210, u), top - 66 + Math.sin(u * Math.PI) * 10]; rline(c, [0, .25, .5, .75, 1].map(rope), { w: 1.5, color: col, seed: 504, smooth: true });
  [[.22, 'shirt'], [.48, 'sock'], [.7, 'shirt']].forEach(([u, kind], k) => { const [px, py] = rope(u), sw = Math.sin(twos(st.tau) * 2.2 + k * 1.7) * .1;
    spin(c, px, py, sw, () => cutPaper(c, kind === 'shirt' ? [[px - 16, py], [px + 16, py], [px + 22, py + 8], [px + 14, py + 12], [px + 12, py + 34], [px - 12, py + 34], [px - 14, py + 12], [px - 22, py + 8]] : [[px - 5, py], [px + 5, py], [px + 5, py + 18], [px + 12, py + 24], [px + 10, py + 30], [px - 5, py + 26]], mix(col, S1C.white, .55 - .3 * nk), { seed: 507 + k, step: 6, blur: 3, sx: 2, sy: 2 })); });
  // 每层楼板一条浅色的腰线（纸条贴上去）
  for (const yy of [532, 620, 708]) cutPaper(c, rectPts(x0 - 6, yy, x1 - x0 + 12, 7, 1), mix(col, S1C.white, .12), { seed: 508 + yy, step: 30, blur: 4, sx: 0, sy: 3, grain: .05 });
  // 窗：镂空，透出后面的光
  S1WINS.forEach(([wx, wy], k) => {
    const lit = k === S1KW ? st.kidLit : st.lit * (hash(k, 11) < .62 ? 1 : 0) * (1 - sm(b.off0 + hash(k, 12) * .7, b.off0 + hash(k, 12) * .7 + .06, st.tau));
    let wc = glass; if (lit > 0) wc = mix(glass, k === S1KW ? st.kidCol : S1C.lamp, clamp(lit, 0, 1));
    const x = wx - S1WW / 2, y = wy - S1WH / 2;
    c.fillStyle = wc; c.fillRect(x, y, S1WW, S1WH);
    if (k === S1KW) { c.save(); c.beginPath(); c.rect(x, y, S1WW, S1WH); c.clip();
      // 窗里：台灯（L8 放低）、小人
      if (st.lampY !== null) { const ly = lerp(y + 6, y + 40, st.lampY); c.fillStyle = kidCol; c.fillRect(wx + 18, y - 2, 2, ly - y + 2); c.beginPath(); c.moveTo(wx + 10, ly + 10); c.lineTo(wx + 28, ly + 10); c.lineTo(wx + 23, ly); c.lineTo(wx + 15, ly); c.fill();
        c.fillStyle = alpha(S1C.amber, .45); c.beginPath(); c.moveTo(wx + 12, ly + 10); c.lineTo(wx + 26, ly + 10); c.lineTo(wx + 40, ly + 40); c.lineTo(wx - 2, ly + 40); c.fill(); }
      if (st.kid) s1KidIn(c, wx, wy + 6, st.kid, st.tau, kidCol, { k: st.kidK, glow: st.phoneGlow });
      // 存档：纸片飞进来时窗里闪一下金光
      if (st.flash > 0) { c.fillStyle = alpha(S1C.lamp, st.flash * .7); c.fillRect(x, y, S1WW, S1WH); }
      c.restore(); }
    // 窗洞的内侧阴影（上、左）+ 窗棂
    c.fillStyle = alpha('#000000', .22); c.fillRect(x, y, S1WW, 5); c.fillRect(x, y, 4, S1WH);
    c.fillStyle = col; c.fillRect(wx - 1.5, y, 3, S1WH); c.fillRect(x - 6, y + S1WH, S1WW + 12, 5);
  });
  // 门：L4 打开，小人走出来
  const [dx, dy] = S1DORM.door, dw = 84, dh = 104, open = st.door;
  c.fillStyle = mix(glass, '#000000', .3); c.fillRect(dx - dw / 2, dy - dh, dw, dh);
  if (st.walker && st.walker.inside) s1Walker(c, st.walker.x, dy, st.walker.w, st.walker.arms, kidCol, st.tau);
  const leaf = dw * Math.cos(open * 1.75);
  cutPaper(c, [[dx - dw / 2, dy - dh], [dx - dw / 2 + leaf, dy - dh - 4 * open], [dx - dw / 2 + leaf, dy + 2 * open], [dx - dw / 2, dy]], leaf >= 0 ? mix(col, P.ink, .2) : mix(col, P.ink, .38), { seed: 505, step: 16, blur: 5, sx: 2, sy: 1 });
}

// ===================== 树、地面、草叶、前景道具 =====================
function s1Tree(c, x, y, r, col, seed, tau) {
  const sway = Math.sin(twos(tau) * 1.1 + seed) * .012;
  spin(c, x, y, sway, () => {
    cutPaper(c, [[x - 10, y], [x - 6, y - r * 1.2], [x + 6, y - r * 1.2], [x + 12, y]], col, { seed, step: 12, blur: 10, sx: -3, sy: -2 });
    const crown = []; for (let k = 0; k < 30; k++) { const a = k / 30 * TAU, rr = r * (1 + .12 * Math.sin(a * 5 + seed) + .06 * Math.sin(a * 11)); crown.push([x + Math.cos(a) * rr, y - r * 1.55 + Math.sin(a) * rr * .92]); }
    cutPaper(c, crown, col, { seed: seed + 1, step: 14, blur: 12, sx: -4, sy: -3 });
    // 叶子的剪口（透一点后面的光）
    c.save(); c.fillStyle = alpha('#ffffff', .07); for (let k = 0; k < 9; k++) { const a = hash(k, seed) * TAU, rr = hash(k, seed + 1) * r * .7; c.beginPath(); c.ellipse(x + Math.cos(a) * rr, y - r * 1.55 + Math.sin(a) * rr, 9, 4, a, 0, TAU); c.fill(); } c.restore();
  });
}
function s1Trees(c, tau, st) { const col = s1Pal('trees', st.nk); s1Tree(c, 150, 830, 150, col, 520, tau); s1Tree(c, 1300, 836, 70, col, 530, tau); }
function s1Ground(c, tau, st) {
  const nk = st.nk, pts = [[-600, 1600]]; for (let x = -600; x <= 2520; x += 30) pts.push([x, 814 + 10 * Math.sin(x * .006) + 6 * Math.sin(x * .021 + 2)]); pts.push([2520, 1600]);
  cutPaper(c, pts, s1Pal('ground', nk), { seed: 540, step: 30, blur: 16, sx: 0, sy: -6 });
  // 小路：从宿舍门口弯向左边有太阳的空地
  const path = [[1010, 818], [1110, 818], [1000, 900], [760, 1000], [640, 1000], [880, 900]];
  cutPaper(c, path, mix(s1Pal('ground', nk), s1Pal('hills2', nk), .28), { seed: 541, step: 18, shadow: false, grain: .12 });
  // 走出宿舍的小人（出了门就站在地面这一层上）
  // 一辆共享单车停在门口；路灯（夜里亮）
  s1Bike(c, 1185, 822, mix(s1Pal('dorm', nk), P.ink, .45));
  const lp = mix(s1Pal('dorm', nk), P.ink, .45); cutPaper(c, [[712, 830], [718, 600], [724, 600], [730, 830]], lp, { seed: 545, step: 20, blur: 8, sx: -3, sy: -2 });
  cutPaper(c, [[700, 606], [742, 606], [734, 590], [708, 590]], lp, { seed: 546, step: 8, blur: 6 });
  if (st.nk > .3) { c.fillStyle = alpha(S1C.lamp, (st.nk - .3) * 1.3 * (1 - st.dark)); c.beginPath(); c.moveTo(706, 606); c.lineTo(736, 606); c.lineTo(721, 620); c.fill(); }
}
function s1Bike(c, x, y, col) { const o = { w: 4, color: col, amp: .4 };
  for (const dx of [-30, 30]) rline(c, circPts(x + dx, y - 18, 17, 20), { ...o, close: true, seed: 547 + dx });
  rline(c, [[x - 30, y - 18], [x - 6, y - 40], [x + 18, y - 40], [x + 30, y - 18]], { ...o, seed: 549 }); rline(c, [[x - 6, y - 40], [x, y - 18], [x - 30, y - 18]], { ...o, seed: 550 });
  rline(c, [[x + 18, y - 40], [x + 14, y - 54], [x + 24, y - 56]], { ...o, seed: 551 }); rline(c, [[x - 10, y - 46], [x + 2, y - 46]], { ...o, w: 6, seed: 552 }); }
// 前景草叶：弯的、成簇的，只在两个角上高，中间一排矮的（藏在字幕纸条下面）
const S1BLADES = (() => { const r = rng(560), o = [];
  const clump = (x0, n, hMin, hMax, dir) => { for (let k = 0; k < n; k++) o.push([x0 + (r() - .5) * 150, 1070, hMin + r() * (hMax - hMin), dir * (.1 + r() * .45) + (r() - .5) * .3, 7 + r() * 7]); };
  clump(20, 11, 120, 300, 1); clump(170, 6, 70, 170, 1); clump(1880, 11, 130, 320, -1); clump(1730, 6, 70, 170, -1);
  return o; })();
function s1Grass(c, tau, st) {
  const col = s1Pal('grass', st.nk);
  S1BLADES.forEach(([x, y, h, lean, w], k) => { const sway = lean + Math.sin(twos(tau) * 1.2 + k * .7) * .03, tip = [x + Math.sin(sway) * h, y - Math.cos(sway) * h], mid = [x + Math.sin(sway) * h * .35, y - h * .55];
    const L1 = [], R1 = []; for (let i = 0; i <= 8; i++) { const u = i / 8, px = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * mid[0] + u * u * tip[0], py = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * mid[1] + u * u * tip[1], ww = w * (1 - u); L1.push([px - ww, py]); R1.push([px + ww, py]); }
    cutPaper(c, [...L1, ...R1.reverse()], col, { seed: 561 + k, step: 10, blur: 12, sx: -3, sy: -5, grain: .05 }); });
}
// 前景道具：纸锁（受体）、咖啡杯。L9 从台面立起来，L10 倒下
function s1Props(c, tau, st) {
  const k = st.props; if (k <= .001) return; const [lx, ly] = S1LOCK;
  popup(c, 900, k, () => {
    cutPaper(c, rectPts(lx - 115, ly - 150, 230, 300, 14), S1C.kraft, { seed: 600, step: 20, blur: 16, sx: -5, sy: 6 });
    rline(c, rectPts(lx - 98, ly - 133, 196, 266, 10), { w: 2, color: alpha(P.ink2, .5), close: true, seed: 601, amp: .6 });
    for (const [px, py] of [[-86, -122], [86, -122], [-86, 122], [86, 122]]) brassPin(c, lx + px, ly + py, 9);
    // 锁孔：它是「受体」
    c.fillStyle = P.ink; c.beginPath(); c.arc(lx, ly - 22, 26, 0, TAU); c.fill(); c.beginPath(); c.moveTo(lx - 12, ly - 10); c.lineTo(lx + 12, ly - 10); c.lineTo(lx + 22, ly + 58); c.lineTo(lx - 22, ly + 58); c.fill();
    // 咖啡杯（台面上）
    const cx = 590, cy = 880; cutPaper(c, [[cx - 44, cy - 70], [cx + 44, cy - 70], [cx + 34, cy], [cx - 34, cy]], S1C.white, { seed: 610, step: 10, blur: 8, sx: -3, sy: 3 });
    rline(c, [[cx + 42, cy - 56], [cx + 64, cy - 50], [cx + 62, cy - 26], [cx + 38, cy - 22]], { w: 7, color: S1C.white, seed: 611, smooth: true });
    cutPaper(c, ellPts(cx, cy - 68, 42, 7, 20), S1C.bean, { seed: 612, step: 6, shadow: false });
    for (let s = 0; s < 3; s++) { const ph = tau * 1.4 + s * 2.1, a = .5 + .5 * Math.sin(ph); rline(c, [[cx - 18 + s * 18, cy - 84], [cx - 12 + s * 18 + Math.sin(ph) * 6, cy - 110], [cx - 18 + s * 18, cy - 136]], { w: 3, color: alpha(S1C.white, .6 * a), seed: 613 + s, smooth: true }); }
  });
}

// ===================== 台口：框、顶檐、页签、指针、吊牌 =====================
function s1Frame(c, tau) {
  const col = S1C.frame, o = { step: 30, blur: 18, sx: 0, sy: 6, grain: .12 };
  const val = [[-20, -20], [W + 20, -20], [W + 20, S1TOP - 30]]; for (let x = W - 36; x >= 36; x -= 4) { const u = ((x - 36) / 92.4) % 1; val.push([x, S1TOP - 30 + Math.sin(u * Math.PI) * 26]); } val.push([-20, S1TOP - 30]);
  cutPaper(c, [[-20, -20], [40, -20], [40, H + 20], [-20, H + 20]], col, { ...o, seed: 700 });
  cutPaper(c, [[W - 40, -20], [W + 20, -20], [W + 20, H + 20], [W - 40, H + 20]], col, { ...o, seed: 701 });
  cutPaper(c, [[-20, H - 30], [W + 20, H - 30], [W + 20, H + 20], [-20, H + 20]], col, { ...o, seed: 702 });
  cutPaper(c, val, col, { ...o, seed: 703, step: 8 });
  rline(c, val.slice(3, -1), { w: 1.5, color: alpha(P.moon, .45), seed: 704, amp: .3 });
}
// s1Tag：顶檐左边挂着的页签「第一页 · 睡眠」（代替书页上的 pageHeader）
function s1Tag(c, tau, t0) {
  const k = sm(t0, t0 + .55, tau, easeOutBack); if (k <= .001) return;
  const text = '第一页 · 睡眠', w = zhWidth(c, text, 34) + 86, x = 70, y = lerp(-80, 110, k), sw = Math.sin((tau - t0) * 4.5) * .04 * Math.exp(-(tau - t0) * 1.2) + Math.sin(tau * 1.1) * .004;
  s1Thread(c, x + 30, S1TOP - 10, x + 30, y); s1Thread(c, x + w - 30, S1TOP - 10, x + w - 30, y);
  c.save(); c.translate(x + w / 2, y); c.rotate(sw); c.translate(-(x + w / 2), -y);
  cutPaper(c, rectPts(x, y, w, 62, 5), S1C.kraft, { seed: 710, step: 18, blur: 8, sy: 4 });
  drawMoonIcon(c, x + 36, y + 30, 15, P.moon, -.5);
  zh(c, text, x + 60, y + 43, { size: 34, color: P.ink2, p: writeP(tau, t0 + .3, text, .06) });
  c.restore();
}
// s1Pointer：顶檐正中垂下来的铜指针，指着天空转盘的刻度环（此刻几点）
function s1Pointer(c, tau, st) {
  const k = sm(S1B.tick - .1, S1B.tick + .4, tau, easeOutBack); if (k <= .001) return;
  const tipW = s1Map([S1SKY.x, S1SKY.y - S1SKY.ring - 4], S1Z.sky, st.cam), tipY = lerp(S1TOP, tipW[1], k), x = tipW[0];
  s1Thread(c, x, S1TOP - 10, x, tipY - 26);
  cutPaper(c, [[x - 12, tipY - 30], [x + 12, tipY - 30], [x, tipY]], '#b08a45', { seed: 720, step: 5, blur: 4, sy: 3, grain: 0 });
}
// s1Sign：从顶檐用两根线吊下来的手写纸牌。t0 放下，t1 收起
function s1Sign(c, tau, text, t0, t1, o = {}) {
  if (tau < t0 || tau > t1 + .5) return;
  const { x = 1340, y = 136, size = 74, sub = null, subT = t0, seed = 730 } = o;
  const dn = Math.min(sm(t0, t0 + .5, tau, easeOutBack), 1 - sm(t1, t1 + .45, tau, easeIn)), yy = lerp(-320, y, dn);
  const sw = Math.sin((tau - t0) * 5) * .05 * Math.exp(-(tau - t0) * 1.5) + Math.sin(tau * 1.2 + seed) * .005;
  const w = Math.max(zhWidth(c, text, size), sub ? zhWidth(c, sub, 34) : 0) + 80, h = size * 1.3 + (sub ? 50 : 0);
  s1Thread(c, x - w / 2 + 26, S1TOP - 10, x - w / 2 + 26, yy + 10); s1Thread(c, x + w / 2 - 26, S1TOP - 10, x + w / 2 - 26, yy + 10);
  c.save(); c.translate(x, yy); c.rotate(sw);
  cutPaper(c, rectPts(-w / 2, 0, w, h, 6), S1C.kraft, { seed, step: 22, blur: 10, sy: 6 });
  brassPin(c, -w / 2 + 26, 12, 6); brassPin(c, w / 2 - 26, 12, 6);
  zh(c, text, 0, size * 1.06, { size, align: 'center', color: P.ink, p: writeP(tau, t0 + .3, text, .07) });
  if (sub) zh(c, sub, 0, size * 1.06 + 46, { size: 34, align: 'center', color: P.ink2, p: writeP(tau, subT, sub, .07) });
  c.restore();
}
// s1Glass：吊着的纸沙漏（困意倒计时），sand 0..1 已漏下的比例，下面挂「困」字小签
function s1Glass(c, tau, x, t0, t1, sand) {
  if (tau < t0 || tau > t1 + .5) return;
  const dn = Math.min(sm(t0, t0 + .5, tau, easeOutBack), 1 - sm(t1, t1 + .45, tau, easeIn)), y = lerp(-300, 196, dn), sw = Math.sin((tau - t0) * 4) * .06 * Math.exp(-(tau - t0) * 1.3);
  s1Thread(c, x, S1TOP - 10, x, y);
  c.save(); c.translate(x, y); c.rotate(sw);
  const gh = 64, bulb = u => 30 * Math.sin(Math.PI * u) * (1 - .8 * Math.exp(-Math.pow((u - .5) * 9, 2))) + 4;
  const out = []; for (let k = 0; k <= 20; k++) { const u = k / 20; out.push([bulb(u), 10 + u * gh * 2]); } for (let k = 20; k >= 0; k--) { const u = k / 20; out.push([-bulb(u), 10 + u * gh * 2]); }
  vellum(c, out, { seed: 740, step: 8 });
  // 沙：上面一堆在减少，下面一堆在增多，中间一道细流
  const top = 1 - sand; c.fillStyle = mix(P.moon, '#ffffff', .15);
  if (top > .02) { c.beginPath(); c.moveTo(-bulb(.5 - .42 * top) * .9, 10 + gh * (1 - .84 * top)); c.lineTo(bulb(.5 - .42 * top) * .9, 10 + gh * (1 - .84 * top)); c.lineTo(0, 10 + gh * .98); c.fill(); }
  if (sand > .02) { const hh = gh * .8 * sand; c.beginPath(); c.moveTo(-26, 10 + gh * 2 - 2); c.quadraticCurveTo(0, 10 + gh * 2 - hh * 1.6, 26, 10 + gh * 2 - 2); c.fill(); }
  if (sand > .01 && sand < .99) { c.fillRect(-1, 10 + gh, 2, gh * .9); }
  cutPaper(c, rectPts(-40, 0, 80, 12, 3), '#b08a45', { seed: 741, step: 10, blur: 4, grain: 0 }); cutPaper(c, rectPts(-40, 10 + gh * 2, 80, 12, 3), '#b08a45', { seed: 742, step: 10, blur: 4, grain: 0 });
  // 「困」字小签
  const ty = 22 + gh * 2, ts = Math.sin(tau * 2.4) * .08;
  s1Thread(c, 0, ty, 0, ty + 16); c.translate(0, ty + 16); c.rotate(ts);
  cutPaper(c, [[-18, 4], [18, 4], [24, 14], [24, 64], [-24, 64], [-24, 14]], S1C.kraft, { seed: 743, step: 10, blur: 5, sy: 3 });
  zh(c, '困', 0, 52, { size: 34, align: 'center', color: P.ink });
  c.restore();
}
function s1KunTag(c, x, y, rot, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); cutPaper(c, [[-18, -30], [18, -30], [24, -20], [24, 30], [-24, 30], [-24, -20]], S1C.kraft, { seed: 743, step: 10, blur: 5, sy: 3 }); zh(c, '困', 0, 18, { size: 34, align: 'center', color: P.ink }); c.restore(); }
function s1Bean(c, x, y, rot, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); cutPaper(c, ellPts(0, 0, 17, 23, 22), S1C.bean, { seed: 620, step: 6, blur: 5, sy: 3 }); rline(c, [[-2, -18], [4, -6], [-4, 6], [2, 18]], { w: 3, color: mix(S1C.bean, P.paper, .45), seed: 621, smooth: true, amp: .2 }); c.restore(); }
// 学过的东西：小纸片
const S1SCRAPS = [['ABC', [560, 330], -.12], ['x²', [700, 250], .1], ['∫dx', [470, 450], .06], ['1840', [800, 360], -.08], ['细胞', [640, 430], .14]];
function s1Scrap(c, x, y, rot, text, s, seed) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); cutPaper(c, rectPts(-44, -26, 88, 52, 3), S1C.white, { seed, step: 12, blur: 6, sy: 4 }); zh(c, text, 0, 10, { size: 28, align: 'center', color: P.ink }); c.restore(); }

// ===================== 帕秋莉：每句的表演 =====================
function s1Act(tau) {
  const b = S1B, t = S1T, e = S1E, w = S1W;
  const A = [
    [0, { pose: 'stand', look: .3 }],
    [b.found - .05, { pose: 'stand', mood: 'smug', hop: 20 }],
    [b.found + .9, { pose: 'point', look: .6 }],
    [t(1), { pose: 'lecture', look: .3 }],
    [b.tick + .3, { pose: 'point', look: .9, tilt: -.08 }],
    [b.light - .3, { pose: 'lecture', mood: 'smug' }],
    [t(2), { pose: 'tired', mood: 'sleepy', look: -.2 }],
    [b.wake, { pose: 'stand', mood: 'surprised', hop: 30 }],
    [b.wake + .8, { pose: 'lecture', look: .4 }],
    [t(3), { pose: 'lecture', look: .6 }],
    [b.yawn, { pose: 'tired', mood: 'sleepy', yawn: 1 }],
    [b.yawn + 1.2, { pose: 'point', look: .7, tilt: -.06 }],
    [t(4), { pose: 'lecture', mood: 'smile' }],
    [b.num4 - .2, { pose: 'point', mood: 'smile', look: .9 }],
    [b.gag + .25, { pose: 'hide', mood: 'flustered', hop: 14 }],
    [t(5), { pose: 'hide', mood: 'normal', look: .8 }],
    [b.tag5, { pose: 'cross', mood: 'smug', look: .6 }],
    [t(6), { pose: 'point', look: .9, tilt: -.06 }],
    [w(6, .62), { pose: 'lecture', look: .4 }],
    [t(7), { pose: 'cross', mood: 'annoyed', look: .7 }],
    [b.yank + .05, { pose: 'stand', mood: 'surprised', hop: 26, look: .9 }],
    [b.yank + .9, { pose: 'cross', mood: 'pout' }],
    [t(8), { pose: 'lecture', look: .6, g: 1 }],
    [b.lamp - .1, { pose: 'point', look: .7 }],
    [b.back, { pose: 'stand', look: .5 }],
    [t(9), { pose: 'point', look: .9 }],
    [b.bump + .05, { pose: 'point', mood: 'smug', look: .9 }],
    [b.pm, { pose: 'lecture', look: .4 }],
    [b.trial, { pose: 'cross', look: 0 }],
    [t(10) + .15, { pose: 'lie', mood: 'sleepy', x: 1500, y: 884, facing: 1 }],
    [b.up, { pose: 'stand', mood: 'surprised', hop: 40 }],
    [b.yankR + .15, { pose: 'cross', mood: 'annoyed', look: 0 }],
    [b.day, { pose: 'lecture', look: .5 }],
    [w(11, .78), { pose: 'point', mood: 'smug', look: .8 }],
    [e(11) - .55, { pose: 'cross', mood: 'smug' }],
  ];
  let i = 0; for (let k = 0; k < A.length; k++) if (tau >= A[k][0]) i = k;
  return { ...A[i][1], t0: A[i][0] };
}
function s1Patchouli(c, tau, L) {
  const b = S1B, a = s1Act(tau), dt = tau - a.t0;
  const rise = sm(b.pat, b.pat + .4, tau, easeOutBack) * (1 - sm(b.exit0, b.exit0 + .35, tau, easeIn)); if (rise <= .001) return null;
  const x = a.x ?? S1PX, y = (a.y ?? S1PY) - (a.hop ? a.hop * Math.sin(Math.PI * clamp(dt / .34, 0, 1)) : 0);
  const wob = .05 * Math.exp(-dt * 9) * Math.sin(dt * 38);   // 换姿势时纸片晃一下
  let gesture = null; if (a.g) gesture = .5 + .5 * Math.sin((tau - a.t0) * 4.2);
  let r = null;
  c.save(); c.translate(x, y); c.scale(1, rise); c.translate(-x, -y);
  r = drawPatchouli(c, { x, y, h: 530, pose: a.pose, mood: a.mood || L.mood || 'normal', look: a.look ?? .3, tilt: (a.tilt || 0) + wob, facing: a.facing ?? -1,
    mouth: a.yawn ? .85 * sm(a.t0, a.t0 + .25, tau) * (1 - sm(a.t0 + .8, a.t0 + 1.1, tau)) : L.mouth, blink: blinkAt(tau, 5), t: tau, gesture });
  c.restore(); return r;
}

// ===================== 灯箱一帧 =====================
function s1State(tau) {
  const b = S1B, t = S1T, T = s1Clock(tau), nk = s1Night(T), cam = s1Cam(tau), kidW = S1WINS[S1KW];
  const st = { tau, T, nk, cam, tick: sm(b.tick, b.tick + 1.6, tau, easeIO), sunSpin: 0, sunEye: false, lit: 0, kidLit: 0, kidCol: S1C.lamp, kid: 'sleep', kidK: 1,
    phoneGlow: S1C.phone, lampY: null, dark: sm(b.exit0, b.exit0 + .9, tau), door: 0, walker: null, wedge: 0, wedgeA: 1, rib: 0, ribA: 1, props: 0, flash: 0 };
  // 困惑的太阳：被拽回白天后转半圈，再转回来
  if (tau > b.yank + .35 && tau < b.back + .5) { st.sunSpin = Math.PI * (sm(b.yank + .45, b.yank + .9, twos(tau), easeOutBack) - sm(b.yank + 1.9, b.yank + 2.3, twos(tau))) * .5 + .12 * Math.sin(twos(tau) * 7) * sm(b.yank + .4, b.yank + .6, tau) * (1 - sm(b.yank + 2.3, b.yank + 2.5, tau)); st.sunEye = true; }
  // 夜里宿舍亮灯：L6 转到深夜后亮起，L7 熄灯
  st.lit = sm(b.spin1 - .5, b.spin1 + .1, tau) * (1 - sm(b.off0 + .8, b.off0 + .9, tau));
  // 小人的窗
  if (tau < t(2)) st.kid = 'sleep';
  else if (tau < b.walk0 - .3) { st.kid = tau < b.wake ? 'sleep' : 'sit'; st.kidK = sm(b.wake, b.wake + .3, tau, easeOutBack); }
  else if (tau < t(5) + .2) st.kid = null;
  else if (tau < t(6)) st.kid = 'stand';
  else if (tau < b.phone) st.kid = 'sleep';
  else if (tau < t(9) + .4) { st.kid = 'phone'; }
  else if (tau < t(11)) st.kid = 'sleep';
  else if (tau < b.night) st.kid = tau < b.day ? 'desk' : 'stand';
  else st.kid = 'sleep';
  // 窗里的光：手机（冷白）→ 调暗 → 调暖（琥珀）；通宵台灯；夜里存档时的金光
  const ph = sm(b.phone, b.phone + .12, tau) * (1 - sm(t(9) + .1, t(9) + .5, tau)), dim = sm(b.dim, b.dim + .4, tau), warm = sm(b.warm, b.warm + .5, tau);
  const sunIn = sm(b.light + .3, b.light + .6, tau) * (1 - sm(t(4) - .2, t(4) + .2, tau)) + sm(b.pane + .3, b.pane + .6, tau) * (1 - sm(t(6), t(6) + .3, tau)) * .45;
  if (sunIn > 0) { st.kidLit = sunIn * .75; st.kidCol = mix(S1C.lamp, '#fff4d6', .3); }
  if (ph > 0) { st.kidLit = ph * lerp(1, .55, dim); st.kidCol = mix(S1C.phone, S1C.amber, warm); st.phoneGlow = mix(S1C.phone, S1C.amber, warm); }
  if (tau > t(8) - .2 && tau < t(9) + .4) st.lampY = sm(b.lamp, b.lamp + .8, tau, easeIO);
  if (tau >= t(11) && tau < b.day + .3) { st.kidLit = sm(t(11), t(11) + .15, tau) * (1 - sm(b.day, b.day + .3, tau)); st.kidCol = S1C.lamp; }
  if (tau > b.file) { let f = 0; for (let k = 0; k < 5; k++) { const ta = b.file + .55 + k * .3; f = Math.max(f, Math.exp(-Math.max(0, tau - ta) * 7) * (tau > ta ? 1 : 0)); } st.flash = f; }
  // 门和走出去的小人
  st.door = sm(b.door, b.door + .4, tau, easeOutBack) * (1 - sm(t(5) + .1, t(5) + .4, tau));
  if (tau > b.walk0 && tau < t(5) + .3) { const u = sm(b.walk0, b.walk1, tau, easeIO), back = sm(t(5), t(5) + .3, tau);
    st.walker = { x: lerp(S1DORM.door[0], 790, u) + back * 270, w: twos(tau), arms: sm(b.walk1 + .1, b.walk1 + .4, tau, easeOutBack) * (1 - back), inside: u < .12 || back > .5 }; }
  // 刻度环上的纸带：23—4 点（L6 滑进来，L9 撕掉）、6–8 小时丝带（L10）
  st.wedge = sm(b.wedge, b.wedge + .8, tau, easeOut); st.wedgeA = 1 - sm(t(9) + .1, t(9) + .4, tau);
  st.rib = key(tau, [[b.ribbon, 0], [b.six, 6], [b.eight - .15, 6], [b.eight, 8]], easeOut); st.ribA = 1 - sm(b.yankR, b.yankR + .35, tau);
  st.props = sm(b.props, b.props + .5, tau, easeOutBack) * (1 - sm(t(10) + .05, t(10) + .45, tau, easeIn));
  return st;
}
function s1Box(c, tau, L, full = true) {
  const b = S1B, t = S1T, st = s1State(tau), cam = st.cam;
  const riseY = i => i < 4 ? (1 - sm(b.rise[i], b.rise[i] + .5, tau, easeOutBack)) * 700 : (1 - sm(b.found - .25, b.found, tau, easeIn)) * 600;
  const layer = (depth, i, fn) => ({ depth, draw: cc => { const dy = i === null ? 0 : riseY(i); if (dy > 690) return; cc.save(); cc.translate(0, dy); fn(cc, tau, st); cc.restore(); } });
  const shake = tau > b.found && tau < b.found + .3 ? Math.sin((tau - b.found) * 90) * 5 * (1 - (tau - b.found) / .3) : 0;
  c.save(); c.translate(0, shake);
  parallax(c, [layer(S1Z.sky, null, s1Sky), layer(3.6, null, s1Clouds), layer(S1Z.hills, 0, s1Hills), layer(S1Z.campus, 1, s1Campus), layer(S1Z.dorm, 2, s1Dorm), layer(S1Z.trees, 3, s1Trees),
    layer(S1Z.ground, 4, s1Ground), layer(S1Z.props, null, s1Props), layer(S1Z.grass, 4, s1Grass)], cam[0], cam[1], cam[2]);
  c.restore();
  // 光：一条剪纸光带，从太阳（或手机）伸出来
  const sunS = s1Map(s1SkyAt(12, st.T, S1SKY.sun), S1Z.sky, cam), kwS = s1Map(S1WINS[S1KW], S1Z.dorm, cam), kwE = s1Map([S1WINS[S1KW][0] - S1WW / 2 + 4, S1WINS[S1KW][1]], S1Z.dorm, cam);
  const beamA = sm(b.light, b.light + .5, tau) * (1 - sm(t(4) + .1, t(4) + .35, tau)) + sm(b.walk1 - .1, b.walk1 + .3, tau) * (1 - sm(t(6), t(6) + .3, tau));
  if (beamA > 0 && st.nk < .9) {
    let tgt = kwE; if (tau > t(4)) { const walkerS = s1Map([st.walker ? st.walker.x : 790, 765], S1Z.ground, cam), pat = [S1PX - 30, S1PY - 330];
      tgt = key(tau, [[b.gag, walkerS], [b.gag + .3, pat], [t(5) + .1, pat], [t(5) + .5, kwE]]); if (tau > t(5) + .5) tgt = kwE; }
    const pane = sm(b.pane, b.pane + .4, tau);
    if (tau > t(5) + .5 && tau < t(6)) tgt = [kwS[0] + 6 * kwS[2], kwS[1] + 4 * kwS[2]];
    const blen = Math.hypot(tgt[0] - sunS[0], tgt[1] - sunS[1]) || 1, cut = pane > .5 && tau > t(5) ? [1 - (S1WW / 2 + 18) * kwS[2] / blen, .3] : null, zz = Math.sqrt(cam[2]);
    s1Strip(c, sunS, tgt, { p: beamA, w0: 34 * zz, w1: 84 * zz, cut, al: .26, seed: 461 });
    s1Strip(c, sunS, tgt, { p: beamA, w0: 16 * zz, w1: 44 * zz, cut, al: .75, col: mix(P.moon, '#ffffff', .62), seed: 462 });
    if (st.walker && !st.walker.inside) { const wk = st.walker, q = s1Map([wk.x, 822], S1Z.ground, cam); c.save(); c.translate(q[0], q[1]); c.scale(q[2] * 1.45, q[2] * 1.45);
      s1Walker(c, 0, 0, wk.w, wk.arms, mix(s1Pal('dorm', st.nk), P.ink, .5), tau); c.restore(); }
    for (let k = 0; k < 9; k++) { const u = ((hash(k, 71) + tau * .08) % 1) * beamA, q = [lerp(sunS[0], tgt[0], u), lerp(sunS[1], tgt[1], u) + Math.sin(tau * 2 + k) * 14 * zz];
      c.fillStyle = alpha('#fff4d6', .7 * Math.sin(u * Math.PI) * (cut && u > cut[0] ? cut[1] : 1)); c.beginPath(); c.arc(q[0], q[1], 2.5 * zz, 0, TAU); c.fill(); }
  }
  if (st.kid === 'phone' && tau > b.phone + .1 && tau < t(9) + .4) {   // 手机的光：伸向帕秋莉的眼睛那边——不，照向天空里的「生物钟」指针
    const k = sm(b.phone + .1, b.phone + .45, tau) * (1 - sm(t(9), t(9) + .3, tau)), dim = sm(b.dim, b.dim + .4, tau), warm = sm(b.warm, b.warm + .5, tau);
    const tip = s1Map([S1SKY.x, S1SKY.y - S1SKY.ring + 30], S1Z.sky, cam);
    s1Strip(c, [kwS[0] - 8, kwS[1] - 8], tip, { p: k * (1 - .45 * sm(b.back, b.back + .8, tau)), w0: 10, w1: lerp(60, 34, dim), col: mix(S1C.phone, S1C.amber, warm), al: lerp(.8, .45, dim), seed: 470 });
  }
  // 硫酸纸窗（L5）：盖在小人窗前，光过了它就淡一半；窗下挂「5折起」价签
  const paneK = sm(b.pane, b.pane + .45, tau, easeOutBack) * (1 - sm(t(6), t(6) + .3, tau));
  if (paneK > .001) { const [wx, wy, z] = kwS, pw = (S1WW + 30) * z, ph = (S1WH + 30) * z, py = lerp(-400, wy - ph / 2, paneK);
    vellum(c, rectPts(wx - pw / 2, py, pw, ph, 3), { seed: 750, al: 1.15 });
    rline(c, rectPts(wx - pw / 2 + 6, py + 6, pw - 12, ph - 12, 2), { w: 2, color: alpha(P.ink2, .45), close: true, seed: 751, amp: .5 });
    rline(c, [[wx, py + 6], [wx, py + ph - 6]], { w: 2, color: alpha(P.ink2, .45), seed: 752, amp: .5 });
    if (tau > b.tag5) { const k = s1Pop(tau, b.tag5, .45), tx = wx + pw / 2 - 14, ty = py + ph - 8, sw = Math.sin((tau - b.tag5) * 5) * .2 * Math.exp(-(tau - b.tag5) * 1.4);
      s1Thread(c, tx, ty, tx + 10, ty + 34 * k); c.save(); c.translate(tx + 10, ty + 34 * k); c.rotate(sw - .08); c.scale(k, k);
      cutPaper(c, [[-8, 0], [60, 0], [74, 20], [60, 40], [-8, 40]].map(([u, v]) => [u - 8, v - 4]), S1C.kraft, { seed: 753, step: 10, blur: 5, sy: 3 });
      zh(c, '5折起', 28, 26, { size: 26, align: 'center', color: P.ink }); c.restore(); }
  }
  // 顶檐上吊下来的东西
  s1Glass(c, tau, 700, b.glass, S1T(6) + .6, sm(b.glass + .4, b.spin1, tau, t => t));
  s1Sign(c, tau, '皮质醇', b.cort, S1T(3) + .2, { x: 1350, seed: 760 });
  s1Sign(c, tau, '2–10 分钟', b.num4, S1T(6) - .1, { x: 1330, size: 84, seed: 761 });
  s1Sign(c, tau, '23—4 点', b.num6, S1T(7) + .4, { x: 1330, size: 84, seed: 762 });
  s1Sign(c, tau, '几点停？', b.pm + .2, S1T(10) - .1, { x: 1330, sub: '因人而异，自己试', subT: b.trial, seed: 763 });
  s1Sign(c, tau, '6–8 小时', b.six - .2, S1T(11) + .1, { x: 1560, size: 84, seed: 764 });
  s1Sign(c, tau, '睡觉 = 存档', b.num11, S1DUR, { x: 1330, size: 76, seed: 765 });
  s1Pointer(c, tau, st);
  // 前景：咖啡豆跳进锁孔，「困」字签被挡回去（L9）
  const pat = s1Patchouli(c, tau, L);
  if (st.props > .5) {
    const lock = s1Map([S1LOCK[0], S1LOCK[1] - 10], S1Z.props, cam), cup = s1Map([590, 800], S1Z.props, cam), z = lock[2];
    if (tau > b.bean) { const u = sm(b.bean, b.bean + .5, tau, easeIn), hop = Math.sin(Math.PI * clamp((tau - b.bean) / .5, 0, 1)) * 190, wig = tau > b.bean + .5 ? Math.sin((tau - b.bean) * 30) * .15 * Math.exp(-(tau - b.bean - .5) * 5) : 0;
      s1Bean(c, lerp(cup[0], lock[0], u), lerp(cup[1], lock[1] - 14 * z, u) - hop, u * 5 + wig, z * lerp(.7, 1, u)); }
    if (tau > b.toss && pat) { const from = pat.tip || [S1PX - 200, 560], u = clamp((tau - b.toss) / (b.bump - b.toss), 0, 1), e1 = easeIn(u);
      if (tau < b.bump) { const q = [lerp(from[0], lock[0] + 30, e1), lerp(from[1], lock[1] - 20 * z, e1) - Math.sin(Math.PI * u) * 150]; s1KunTag(c, q[0], q[1], u * 7, z); }
      else { const v = clamp((tau - b.bump) / .9, 0, 1), fx = lock[0] + 30 + v * 140, fy = lock[1] - 20 * z - Math.sin(Math.PI * Math.min(1, v * 1.6)) * 90 + easeIn(v) * 160;
        s1KunTag(c, fx, fy, .5 + v * 2.2, z); if (v < .4) zh(c, '咚', lock[0] + 70, lock[1] - 90, { size: 40, color: P.ink2, al: 1 - v / .4 }); } }
  }
  // 学过的东西：白天从窗里飘出来，夜里一张张收回小人的窗（存档）
  if (tau > b.day - .2) S1SCRAPS.forEach(([text, pos, rot], k) => {
    const t0 = b.day + k * .12, out = sm(t0, t0 + .7, tau, easeOut), ta = b.file + .25 + k * .3, back = sm(ta, ta + .3, tau, easeIn); if (out <= 0 || back >= 1) return;
    const bob = Math.sin(tau * 1.7 + k * 1.3) * 10, fl = [pos[0] + Math.sin(tau * .8 + k) * 14, pos[1] + bob];
    const p = [lerp(lerp(kwS[0], fl[0], out), kwS[0], back), lerp(lerp(kwS[1], fl[1], out), kwS[1], back)];
    s1Scrap(c, p[0], p[1], rot + Math.sin(tau * 1.4 + k) * .08 + back * 1.5, text, lerp(.3, 1, out) * (1 - back * .8), 770 + k);
  });
  // 困惑的太阳旁边冒一个问号
  if (st.sunEye && tau > b.yank + .5) { const q = sm(b.yank + .5, b.yank + .75, tau, easeOutBack) * (1 - sm(b.back, b.back + .3, tau)); zh(c, '？', sunS[0] + 70, sunS[1] - 60, { size: 56 * Math.max(q, .01), color: P.ink2, al: q }); }
  if (full) { s1Frame(c, tau); s1Tag(c, tau, 1.9); }
}

// ===================== 进场：书页上的一扇小窗 =====================
const S1PORT = { x: BOOK.R.x + BOOK.R.w / 2, y: BOOK.R.y + BOOK.R.h / 2 - 20, z: 5 };
function s1Portal(c, tau, L) {
  const b = S1B, u = sm(b.in0, b.in1, tau, easeIn), z = Math.pow(S1PORT.z, u), g = (z - 1) / (S1PORT.z - 1);
  const ox = lerp(S1PORT.x, CX, g), oy = lerp(S1PORT.y, CY, g), ww = W / S1PORT.z, wh = H / S1PORT.z;
  c.save(); c.translate(ox, oy); c.scale(z, z); c.translate(-S1PORT.x, -S1PORT.y);
  spread(c, tau);
  // 小窗：牛皮纸窗框（剪纸）+ 里面就是灯箱
  cutPaper(c, rectPts(S1PORT.x - ww / 2 - 22, S1PORT.y - wh / 2 - 22, ww + 44, wh + 44, 6), S1C.kraft, { seed: 790, step: 16, blur: 10, sy: 5 });
  c.save(); c.beginPath(); c.rect(S1PORT.x - ww / 2, S1PORT.y - wh / 2, ww, wh); c.clip();
  c.translate(S1PORT.x - ww / 2, S1PORT.y - wh / 2); c.scale(1 / S1PORT.z, 1 / S1PORT.z); s1Box(c, tau, L); c.restore();
  zh(c, '第一页', S1PORT.x, S1PORT.y + wh / 2 + 80, { size: 40, align: 'center', color: P.ink2, al: 1 - u });
  c.restore();
}

scene({ order: 1, key: 'sleep', title: '睡眠', dur: S1DUR, lines: S1LINES,
  fn(c, tau, L) {
    const b = S1B;
    if (tau < b.in1) return s1Portal(c, tau, L);
    if (tau >= b.exit1) return handoffDisc(c);
    s1Box(c, tau, L);
    const x = sm(b.exit1 - .3, b.exit1, tau); if (x > 0) fade(c, x, () => handoffDisc(c));
  } });
