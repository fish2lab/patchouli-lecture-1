'use strict';
// 帕秋莉·诺蕾姬（纯 Canvas 2D 代码绘制，不加载任何图片）。
//
// drawPatchouli(c, o) — 全身立绘（约 5.7 头身）
//   x, y      脚底中心（逻辑坐标）
//   h         全身高度（帽顶到脚底），默认 860
//   facing    1 面朝右（看向右边的黑板），-1 面朝左
//   pose      'lecture' 一手托着打开的书、另一手比手势讲解（主姿势，参考 refs/character/5-book-standing.jpg）
//             'point'   朝面向的一侧抬高手臂指向前方（指黑板）
//             'read'    双手捧书低头看
//             'cheer'   双手举起（高兴、总结）
//             'tired'   驼背、手垂下（熬夜、没精神）
//             'shrug'   两手一摊（无奈、自嘲）
//   mood      'normal' | 'smile' | 'smug'（得意）| 'surprised' | 'sleepy' | 'annoyed' | 'sad'
//   mouth     0 闭嘴 .. 1 张大（说话时由 kit 的 mouthAt 给）
//   blink     0 睁眼 .. 1 闭眼
//   t         秒；头发飘动、呼吸、帽子月牙轻晃用
//   book      true 手里有书（lecture/read 默认 true，其他默认 false）
//   gesture   0..1 讲解手的抬起程度（lecture 姿势里讲解手从垂下到比手势）；不传时随 t 缓慢起伏
//
// drawPatchouliChibi(c, o) — Q 版（两头身）
//   x, y, h(默认 300), facing, mood, mouth, blink, t 同上
//   pose      'stand' | 'flat'（趴在地上，参考 3-flat-chibi）| 'lift'（举杠铃，参考 1-barbell-chibi，杠铃由调用方画，
//             双手举过头顶，返回的 hands 是杠铃握点）| 'sit' | 'lie'（抱书仰躺，参考 2-book-lying）| 'run'
//             flat / lie 是横着的：(x, y) 是身体贴地那条边的中点，头在左（facing=1 时），占宽约 h*1.2（flat）/ h*1.5（lie）
//   返回 { hands: [[x, y], [x, y]]（按屏幕 x 从左到右）, head: [x, y]（脸中心） }，方便场景把道具放在手上。
//
// 两个函数都只依赖参数（纯函数），可以在同一帧里画多次（不同位置、大小）。
// 画法：稀疏控制点 → 二次贝塞尔平滑路径（pchPath），控制点按 8fps 轻微抖动（身体 ~0.8px，脸 ~0.35px），
// 填色 + 一层阴影色块 + 少量高光，统一深紫描边。本文件顶层名字都带 pch 前缀。

// ===================== 颜色（全部由 P 派生） =====================
const PCH_C = (() => {
  const m = mix, robe = m(P.dress, P.hair, .3), book = m(P.ribbonRed, P.shelfDark, .5);
  return {
    line: m(P.ink, P.hairDark, .22), lineSoft: m(P.ink2, P.hair, .25), faceLine: m(P.ink, P.hairDark, .35),
    skin: P.skin, skinShade: m(P.skin, P.blush, .55), skinDeep: m(P.skin, P.ribbonRed, .3),
    hair: P.hair, hairShade: P.hairDark, hairDeep: m(P.hairDark, P.ink, .35), hairHi: m(P.hair, P.cap, .55), hairBack: m(P.hair, P.hairDark, .6),
    cap: P.cap, capShade: m(P.cap, m(P.stripe, P.pink, .4), .45), capDeep: m(P.cap, P.stripe, .75),
    dress: P.dress, dressShade: m(P.dress, P.stripe, .55), stripe: P.stripe,
    robe, robeShade: m(robe, P.hairDark, .3), robeLight: m(P.dress, P.hair, .16),
    red: P.ribbonRed, redShade: m(P.ribbonRed, P.ink, .38), redHi: m(P.ribbonRed, P.cap, .35),
    blue: P.ribbonBlue, blueShade: m(P.ribbonBlue, P.ink, .38), blueHi: m(P.ribbonBlue, P.cap, .35),
    moon: P.moon, moonShade: m(P.moon, P.orange, .45), moonHi: m(P.moon, P.cap, .6), moonLine: m(P.moon, P.ink, .62),
    irisDark: m(P.purple, P.ink, .55), iris: P.purple, irisLight: m(P.purple, P.pink, .55), pupil: m(P.ink, P.purple, .2),
    white: m(P.cap, P.paper, .1), eyeShade: m(P.cap, P.stripe, .5), lash: m(P.ink, P.hairDark, .12),
    mouth: m(P.ribbonRed, P.ink, .45), tongue: m(P.pink, P.ribbonRed, .25),
    book, bookShade: m(book, P.ink, .4), bookHi: m(book, P.pink, .25), gold: P.gold, goldShade: m(P.gold, P.shelf, .45),
    page: P.paper, pageShade: P.paper2, pageEdge: P.paperEdge, text: P.faint,
    boot: m(P.cap, P.stripe, .12), bootShade: m(P.cap, P.stripe, .55),
    sweat: m(P.sky, P.cap, .3),
  };
})();

// ===================== 路径工具 =====================
// pchPath：点列 → 平滑 Path2D。点 [x, y, f]：f=0 平滑（过相邻中点的二次曲线）、f=1 尖角（曲线经过它）、
// f=2 下一段二次曲线的控制点（后面必须跟一个尖角点）。j 抖动幅度，sd 抖动种子。
function pchPath(pts, closed = true, j = 0, sd = 0) {
  const n = pts.length;
  const q = j ? pts.map((p, i) => [p[0] + j * (hash(i, sd) * 2 - 1), p[1] + j * (hash(i + 71, sd) * 2 - 1), p[2] | 0]) : pts;
  const pa = new Path2D(), fl = i => q[i][2] | 0;
  if (!closed) {
    pa.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < n; i++) {
      const p = q[i], f = fl(i);
      if (i === n - 1 || f === 1) { pa.lineTo(p[0], p[1]); continue; }
      const nx = q[i + 1];
      if (f === 2 || fl(i + 1) === 1 || i === n - 2) { pa.quadraticCurveTo(p[0], p[1], nx[0], nx[1]); i++; continue; }
      pa.quadraticCurveTo(p[0], p[1], (p[0] + nx[0]) / 2, (p[1] + nx[1]) / 2);
    }
    return pa;
  }
  let i0 = -1;
  for (let i = 0; i < n; i++) if (fl(i) === 1) { i0 = i; break; }
  if (i0 < 0) {
    const a = q[n - 1], b = q[0]; pa.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    for (let i = 0; i < n; i++) { const p = q[i], nx = q[(i + 1) % n]; pa.quadraticCurveTo(p[0], p[1], (p[0] + nx[0]) / 2, (p[1] + nx[1]) / 2); }
  } else {
    pa.moveTo(q[i0][0], q[i0][1]);
    for (let k = 1; k < n; k++) {
      const i = (i0 + k) % n, p = q[i], f = fl(i);
      if (f === 1) { pa.lineTo(p[0], p[1]); continue; }
      const j2 = (i0 + k + 1) % n, nx = q[j2];
      if (f === 2 || fl(j2) === 1) { pa.quadraticCurveTo(p[0], p[1], nx[0], nx[1]); k++; continue; }
      pa.quadraticCurveTo(p[0], p[1], (p[0] + nx[0]) / 2, (p[1] + nx[1]) / 2);
    }
  }
  pa.closePath(); return pa;
}
// pchShape：填色 + 描边。o = { fill, w 线宽(0 不描), line 线色, open, j 抖动, sd 种子, al }
function pchShape(c, pts, o = {}) {
  const { fill = null, w = 3, line = PCH_C.line, open = false, j = 0, sd = 0, al = 1 } = o;
  const pa = pchPath(pts, !open, j, sd);
  if (al !== 1) { c.save(); c.globalAlpha *= al; }
  if (fill && !open) { c.fillStyle = fill; c.fill(pa); }
  if (w) { c.strokeStyle = line; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(pa); }
  if (al !== 1) c.restore();
  return pa;
}
// pchLine：一笔（开放路径）
function pchLine(c, pts, w, line, j = 0, sd = 0, al = 1) { pchShape(c, pts, { open: true, w, line, j, sd, al }); }
// pchClip：在 path 里执行 fn（画阴影色块）
function pchClip(c, path, fn) { c.save(); c.clip(path); fn(); c.restore(); }
function pchFillPts(c, pts, fill, al = 1, j = 0, sd = 0) { const pa = pchPath(pts, true, j, sd); c.save(); c.globalAlpha *= al; c.fillStyle = fill; c.fill(pa); c.restore(); return pa; }
// pchEven：折线按弧长均分成 n 段，返回 n+1 个点
function pchEven(poly, n) {
  const acc = [0]; for (let i = 1; i < poly.length; i++) acc.push(acc[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const tot = acc.at(-1), out = []; let s = 1;
  for (let k = 0; k <= n; k++) { const d = tot * k / n; while (s < poly.length - 1 && acc[s] < d) s++; const u = (d - acc[s - 1]) / ((acc[s] - acc[s - 1]) || 1); out.push([lerp(poly[s - 1][0], poly[s][0], u), lerp(poly[s - 1][1], poly[s][1], u)]); }
  return out;
}
// pchScallop：沿折线做 n 个半圆褶边（荷叶边）。depth>0 鼓向行进方向的右手侧（屏幕坐标）。返回 [尖角, 控制点, 尖角, …]
function pchScallop(poly, n, depth) {
  const e = pchEven(poly, n), out = [[e[0][0], e[0][1], 1]];
  for (let i = 0; i < n; i++) { const a = e[i], b = e[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, dd = depth * (1 + .25 * Math.sin(i * 2.7));
    out.push([(a[0] + b[0]) / 2 - dy / l * dd * 2, (a[1] + b[1]) / 2 + dx / l * dd * 2, 2]); out.push([b[0], b[1], 1]); }
  return out;
}
// 褶边的谷点（画褶线用）
const pchValleys = sc => sc.filter((p, i) => p[2] === 1 && i > 0 && i < sc.length - 1);
const pchMap = (pts, fx, fy) => pts.map(p => [fx(p[0], p[1]), fy(p[0], p[1]), p[2]]);
const pchMirror = pts => pts.map(p => [-p[0], p[1], p[2]]);
const pchCurve = (n, fx, fy) => { const o = []; for (let k = 0; k <= n; k++) o.push([fx(k / n), fy(k / n)]); return o; };

// ===================== 静态形状（头部坐标：原点在下巴尖，y 向下，头顶约 -175，帽顶约 -250） =====================
const PCH_FACE = [[-60, -150], [60, -150], [66, -104], [65, -68], [57, -38], [36, -13], [0, 0, 1], [-36, -13], [-57, -38], [-65, -68], [-66, -104]];
// 刘海：发尖是尖角点，发尖之间的缝是平滑控制点（二次曲线拱起）
const PCH_BANG_TIPS = [[88, -98], [67, -98], [47, -93], [27, -97], [8, -91], [-12, -95], [-32, -92], [-52, -97], [-71, -95], [-88, -100]];
const PCH_BANG_NOTCH = [-20, -24, -21, -25, -20, -24, -22, -21, -23];
function pchBangsPts(dy = 0, sw = 0) {
  const o = [[-88, -150], [-72, -182], [0, -196], [72, -182], [88, -150], [92, -122]];
  PCH_BANG_TIPS.forEach((p, i) => {
    const wv = sw * Math.sin(i * 1.7);
    o.push([p[0] + wv, p[1] + dy, 1]);
    if (i < PCH_BANG_TIPS.length - 1) { const q = PCH_BANG_TIPS[i + 1]; o.push([(p[0] + q[0]) / 2 + wv, Math.min(p[1], q[1]) + PCH_BANG_NOTCH[i] + dy, 0]); }
  });
  o.push([-92, -122]);
  return o;
}
const PCH_BANGS = pchBangsPts();
const PCH_BANG_SHADOW = pchBangsPts(9);
// 刘海高光（天使环）：上沿平滑，下沿锯齿
const PCH_BANG_HI = (() => { const o = []; for (let k = 0; k <= 8; k++) { const x = -70 + k * 17.5; o.push([x, -150 + 10 * (x / 80) ** 2]); }
  for (let k = 16; k >= 0; k--) { const x = -70 + k * 8.75; o.push([x, -136 + 10 * (x / 80) ** 2 + (k % 2 ? 7 : 0), 1]); } return o; })();
const PCH_BANG_STRANDS = [[-62, -136, -61, -113], [-42, -140, -42, -114], [-22, -142, -22, -118], [-2, -144, -2, -113], [17, -142, 17, -120], [37, -140, 37, -114], [57, -136, 57, -118], [78, -130, 78, -120]];
// 帽子：蓬松的帽身 + 一圈荷叶边帽檐
const PCH_CAP_DOME = [[-100, -112], [-122, -148], [-126, -190], [-106, -224], [-62, -244], [0, -252], [58, -246], [102, -226], [126, -192], [124, -150], [104, -112], [60, -134], [0, -144], [-60, -134]];
const PCH_CAP_SHADE = [[16, -148], [80, -140], [120, -160], [124, -196], [104, -218], [102, -192], [82, -166], [48, -154]];
const PCH_CAP_FOLDS = [[[-24, -240], [-42, -214], [-52, -184]], [[30, -242], [50, -214], [58, -188]], [[-78, -226], [-92, -200], [-96, -176]], [[84, -222], [98, -196]]];
const PCH_FRILL_UP = pchCurve(10, u => -118 + 236 * u, u => -106 - 62 * Math.sin(Math.PI * u));
const PCH_FRILL_LOW = pchScallop(pchCurve(14, u => 122 - 244 * u, u => -80 - 62 * Math.sin(Math.PI * u) + 12 * (1 - Math.sin(Math.PI * u)) ** 3), 15, 5);
const PCH_FRILL = [...PCH_FRILL_UP.map((p, i) => [p[0], p[1], i === 0 || i === 10 ? 1 : 0]), ...PCH_FRILL_LOW];
const PCH_FRILL_PLEATS = pchValleys(PCH_FRILL_LOW).map(p => { const u = (122 - p[0]) / 244, top = -106 - 62 * Math.sin(Math.PI * u); return [[p[0], p[1]], [p[0] * .98, lerp(p[1], top, .62)]]; });
// 月牙（单位半径，内圆偏右上）
const PCH_MOON = (() => {
  const cx = .46, cy = -.34, r2 = .82, outer = [], inner = [];
  for (let k = 0; k < 90; k++) { const a = k / 90 * TAU, p = [Math.cos(a), Math.sin(a)]; if (Math.hypot(p[0] - cx, p[1] - cy) > r2) outer.push([p, a]); }
  // 外弧：从缺口之后开始连续排列
  let gap = 0; for (let i = 1; i < outer.length; i++) if (outer[i][1] - outer[i - 1][1] > .1) gap = i;
  const oa = [...outer.slice(gap), ...outer.slice(0, gap)].map(v => v[0]);
  for (let k = 0; k < 90; k++) { const a = k / 90 * TAU, p = [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2]; if (Math.hypot(p[0], p[1]) < 1) inner.push([p, a]); }
  let g2 = 0; for (let i = 1; i < inner.length; i++) if (inner[i][1] - inner[i - 1][1] > .1) g2 = i;
  let ia = [...inner.slice(g2), ...inner.slice(0, g2)].map(v => v[0]);
  const end = oa.at(-1); if (Math.hypot(ia[0][0] - end[0], ia[0][1] - end[1]) > Math.hypot(ia.at(-1)[0] - end[0], ia.at(-1)[1] - end[1])) ia = ia.reverse();
  return [...oa.map((p, i) => [p[0], p[1], i === 0 || i === oa.length - 1 ? 1 : 0]), ...ia];
})();

// ===================== 身体（全身坐标：脚底 (0,0)，身高 860） =====================
const PCH_DRESS = [[-24, -614], [24, -614], [60, -598], [70, -560], [74, -510], [80, -440], [96, -320], [114, -190], [128, -90], [133, -62, 1], [60, -55], [0, -53], [-60, -55], [-133, -62, 1], [-128, -90], [-114, -190], [-96, -320], [-80, -440], [-74, -510], [-70, -560], [-60, -598]];
const PCH_HEM_LOW = pchScallop(pchCurve(12, u => 140 - 280 * u, u => -34 + 8 * Math.sin(Math.PI * u)), 16, 4.5);
const PCH_HEM = [[-134, -66, 1], ...pchCurve(8, u => -134 + 268 * u, u => -66 + 12 * Math.sin(Math.PI * u)).slice(1, -1), [134, -66, 1], ...PCH_HEM_LOW];
const PCH_HEM_PLEATS = pchValleys(PCH_HEM_LOW);
// 外袍右片（左片镜像）：外沿、下摆、前襟
const PCH_ROBE = [[20, -612], [52, -606], [70, -588], [78, -548], [84, -490], [90, -430], [106, -310], [124, -190], [138, -88], [142, -66, 1], [110, -62], [84, -64, 1], [72, -150], [60, -300], [48, -430], [36, -520], [22, -580], [10, -606]];
const PCH_ROBE_FRONT = [[84, -66], [72, -150], [60, -300], [48, -430], [36, -520]];
const PCH_ROBE_FRILL = (() => { const sc = pchScallop(PCH_ROBE_FRONT, 16, -3.2), back = PCH_ROBE_FRONT.slice().reverse().map(p => [p[0] - 7, p[1]]); return [...sc, ...back.map((p, i) => [p[0], p[1], i === 0 || i === back.length - 1 ? 1 : 0])]; })();
const PCH_ROBE_SHADE = [[78, -548], [84, -490], [90, -430], [106, -310], [124, -190], [138, -88], [142, -66], [122, -64], [112, -150], [96, -300], [80, -430], [70, -520], [66, -570]];
// 披肩右半（左半镜像）
const PCH_CAPE_LOW = pchScallop([[104, -546], [80, -541], [56, -540], [32, -548], [14, -564]], 7, 3.6);
const PCH_CAPE = [[6, -596], [20, -618], [48, -614], [74, -602], [92, -582], [102, -560], ...PCH_CAPE_LOW, [8, -582]];
const PCH_CAPE_SHADE = [[104, -546], [80, -541], [56, -540], [32, -548], [14, -564], [20, -576], [44, -560], [72, -556], [98, -562]];

// ===================== 通用小件 =====================
// pchBow：蝴蝶结。size≈单边环的宽。tails 下垂的两条带子长度（0 不画）
function pchBow(c, x, y, size, col, shade, rot, j, sd, tails = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); const z = size, lw = Math.max(1.4, z * .1);
  if (tails) {
    const tl = z * 1.25 * tails;
    pchShape(c, [[-z * .12, z * .05, 1], [-z * .5, tl * .55], [-z * .62, tl, 1], [-z * .38, tl * .86, 1], [-z * .2, tl, 1], [-z * .12, tl * .4], [z * .05, z * .1, 1]], { fill: shade, w: lw, j, sd: sd + 1 });
    pchShape(c, [[z * .12, z * .05, 1], [z * .42, tl * .5], [z * .5, tl * .95, 1], [z * .28, tl * .8, 1], [z * .1, tl * .92, 1], [z * .06, tl * .4], [-z * .05, z * .1, 1]], { fill: col, w: lw, j, sd: sd + 2 });
  }
  for (const sg of [-1, 1]) {
    const pa = pchShape(c, [[0, 0, 1], [sg * z * .45, -z * .62], [sg * z * 1.02, -z * .55], [sg * z * 1.08, z * .12], [sg * z * .62, z * .45], [sg * z * .2, z * .22]], { fill: col, w: lw, j, sd: sd + 3 + sg });
    pchClip(c, pa, () => pchFillPts(c, [[0, z * .05], [sg * z * .6, z * .1], [sg * z * 1.1, 0], [sg * z * 1.1, z * .5], [0, z * .5]], shade, .8));
    pchLine(c, [[sg * z * .22, -z * .08], [sg * z * .55, -z * .2], [sg * z * .78, -z * .12]], lw * .7, PCH_C.line, 0, 0, .55);
  }
  pchShape(c, [[-z * .2, -z * .2], [z * .2, -z * .22], [z * .24, z * .18], [-z * .22, z * .2]], { fill: col, w: lw, j, sd: sd + 7 });
  c.restore();
}
function pchSweat(c, x, y, z, al = 1) {
  pchShape(c, [[0, -z, 1], [z * .55, z * .1], [z * .5, z * .6], [0, z * .8], [-z * .5, z * .6], [-z * .55, z * .1]].map(p => [p[0] + x, p[1] + y, p[2]]), { fill: PCH_C.sweat, w: z * .16, line: mix(P.blue, P.ink, .3), al });
  c.save(); c.globalAlpha *= al * .9; c.fillStyle = P.cap; c.beginPath(); c.ellipse(x - z * .2, y + z * .25, z * .12, z * .2, -.4, 0, TAU); c.fill(); c.restore();
}
function pchMoon(c, x, y, r, rot, j, sd) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(r, r);
  const pa = pchPath(PCH_MOON, true, j / r, sd);
  c.fillStyle = PCH_C.moon; c.fill(pa);
  c.save(); c.clip(pa); c.fillStyle = PCH_C.moonShade; c.beginPath(); c.arc(-.18, .22, .95, 0, TAU); c.arc(-.5, .4, .95, 0, TAU, true); c.fill();
  c.strokeStyle = PCH_C.moonHi; c.lineWidth = .1; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, .8, 2.9, 3.9); c.stroke(); c.restore();
  c.strokeStyle = PCH_C.moonLine; c.lineWidth = 2.4 / r; c.lineJoin = 'round'; c.stroke(pa);
  c.restore();
}

// ===================== 头部 =====================
const PCH_MOODS = {
  normal: { o: .6, tilt: 0, low: 0, brow: [0, 0, 0], mouth: 'flat' },
  smile: { o: .6, happy: true, tilt: 0, low: 0, brow: [-3, -1, 1], mouth: 'smile' },
  smug: { o: .44, tilt: -1.5, low: 5, brow: [0, 3, -2], asym: true, mouth: 'smug' },
  surprised: { o: 1.06, small: true, tilt: 0, low: 0, brow: [-9, -2, 0], mouth: 'o' },
  sleepy: { o: .28, tilt: 2, low: 0, brow: [3, -1, 3], mouth: 'sleepy', bubble: true },
  annoyed: { o: .48, tilt: -4.5, low: 1, brow: [2, 8, -3], mouth: 'wavy', vein: true },
  sad: { o: .64, tilt: 4, low: 0, brow: [-1, -8, 3], mouth: 'frown' },
};
const PCH_UP_OPEN = [[-19, -3], [-13, -15], [-2, -21], [10, -20], [19, -13], [24, -4]];
const PCH_UP_SHUT = [[-19, 5], [-12, 8], [0, 9], [12, 8], [20, 5], [24, 3]];
const PCH_LASH_TH = [.6, 2.4, 3.3, 3.8, 4, 3.2];

// 一只眼。局部坐标：外眼角朝 +x。o 睁开程度，m 表情参数，look 虹膜偏移（局部）
function pchEye(c, sgn, open, md, look, rg, sd) {
  const jf = rg.jf, tl = md.tilt;
  if (md.happy && open > .05) {   // 眯眼笑 ^
    pchLine(c, [[-18, 7], [-9, -2], [3, -5], [15, -1], [23, 7]], 3.6, PCH_C.lash, jf, sd); return;
  }
  if (open < .14) {                // 闭眼：向下弯的弧
    pchLine(c, [[-19, 3], [-8, 9], [6, 10], [18, 6], [24, 1]], 3.4, PCH_C.lash, jf, sd);
    pchLine(c, [[20, 5], [26, 9]], 2, PCH_C.lash, 0, 0, .8); return;
  }
  const up = PCH_UP_OPEN.map((p, i) => { const q = PCH_UP_SHUT[i]; return [p[0], lerp(q[1], p[1], open) + tl * (p[0] + 19) / 43 - (md.asym ? 0 : 0)]; });
  const low = [[22, 6 - md.low * .6], [14, 14 - md.low], [0, 16 - md.low], [-12, 13 - md.low * .8], [-18, 6 - md.low * .4]];
  const white = [[...up[0], 1], ...up.slice(1, -1), [...up.at(-1), 1], ...low];
  const wp = pchPath(white, true, jf * .6, sd);
  c.fillStyle = PCH_C.white; c.fill(wp);
  c.save(); c.clip(wp);
  const ir = md.small ? [10, 13] : [12.5, 16.5], ix = look[0], iy = 3 + look[1];
  const g = c.createLinearGradient(0, iy - ir[1], 0, iy + ir[1]);
  g.addColorStop(0, PCH_C.irisDark); g.addColorStop(.5, PCH_C.iris); g.addColorStop(1, PCH_C.irisLight);
  c.fillStyle = g; c.beginPath(); c.ellipse(ix, iy, ir[0], ir[1], 0, 0, TAU); c.fill();
  c.fillStyle = PCH_C.pupil; c.globalAlpha = .85; c.beginPath(); c.ellipse(ix, iy + 1, ir[0] * .44, ir[1] * .5, 0, 0, TAU); c.fill();
  c.globalAlpha = .7; c.fillStyle = PCH_C.irisLight; c.beginPath(); c.ellipse(ix, iy + ir[1] * .62, ir[0] * .62, ir[1] * .26, 0, 0, TAU); c.fill();
  c.globalAlpha = 1; c.strokeStyle = PCH_C.irisDark; c.lineWidth = 1.4; c.beginPath(); c.ellipse(ix, iy, ir[0], ir[1], 0, 0, TAU); c.stroke();
  // 上眼皮投在眼白上的影子
  c.fillStyle = PCH_C.eyeShade; c.globalAlpha = .55; c.fill(pchPath([...up.map(p => [p[0], p[1] - 4]), ...up.slice().reverse().map(p => [p[0], p[1] + 5])], true));
  // 高光（世界坐标里都在左上）
  c.globalAlpha = 1; c.fillStyle = P.cap;
  const hx = -5 * sgn; c.beginPath(); c.ellipse(ix + hx, iy - ir[1] * .42, 4, 5, 0, 0, TAU); c.fill();
  c.beginPath(); c.arc(ix - hx * .9, iy + ir[1] * .45, 1.8, 0, TAU); c.fill();
  c.restore();
  // 上睫毛（实心，外眼角挑一下）
  const lash = [...up.map((p, i) => [p[0], p[1] + .5, i === 0 ? 1 : 0]), [29, -9 + tl * .6, 1], ...up.slice().reverse().map((p, i) => [p[0] + (i === 0 ? 1 : 0), p[1] - PCH_LASH_TH[5 - i] * (.75 + .25 * open), i === 5 ? 1 : 0])];
  const lp = pchPath(lash, true, jf * .5, sd + 3); c.fillStyle = PCH_C.lash; c.fill(lp);
  if (open > .5) pchLine(c, [[-4, up[2][1] - 7], [8, up[3][1] - 8], [18, up[4][1] - 6]], 1.3, PCH_C.lineSoft, 0, 0, .6);
  pchLine(c, [[19, low[0][1] + 3], [9, low[1][1] + 1], [-3, low[2][1]]], 1.5, PCH_C.lineSoft, jf, sd + 5, .8);
}

function pchMouth(c, md, m, rg, t) {
  const jf = rg.jf, ln = PCH_C.faceLine;
  c.save(); c.translate(0, -22);
  if (m > .06) {
    const hw = (md.mouth === 'smile' ? 9 : 6.5) + 4 * m, hh = 3 + 14 * m;
    let pts;
    if (md.mouth === 'smile' || md.mouth === 'smug') pts = [[-hw, -2, 1], [0, -3], [hw, -2, 1], [hw * .8, hh * .6], [0, hh], [-hw * .8, hh * .6]];
    else if (md.mouth === 'o') pts = [[0, -hh * .45], [hw * .7, -hh * .25], [hw * .75, hh * .45], [0, hh * .8], [-hw * .75, hh * .45], [-hw * .7, -hh * .25]];
    else pts = [[-hw, 0, 1], [0, -2.5], [hw, 0, 1], [hw * .6, hh * .7], [0, hh], [-hw * .6, hh * .7]];
    const pa = pchPath(pts, true, jf * .5, 41 + rg.tk);
    c.fillStyle = PCH_C.mouth; c.fill(pa);
    pchClip(c, pa, () => { c.fillStyle = PCH_C.tongue; c.beginPath(); c.ellipse(0, hh * 1.02, hw * .7, hh * .45, 0, 0, TAU); c.fill(); });
    c.strokeStyle = ln; c.lineWidth = 2.1; c.lineJoin = 'round'; c.stroke(pa);
  } else {
    const k = md.mouth;
    if (k === 'o') { const pa = pchPath([[0, -5], [4.5, -2], [4.5, 3], [0, 6], [-4.5, 3], [-4.5, -2]], true, jf * .4, 43); c.fillStyle = PCH_C.mouth; c.fill(pa); c.strokeStyle = ln; c.lineWidth = 2; c.stroke(pa); }
    else if (k === 'sleepy') { const pa = pchPath([[-4, 0], [0, -2], [4, 0], [0, 3.5]], true, 0); c.fillStyle = PCH_C.mouth; c.fill(pa); c.strokeStyle = ln; c.lineWidth = 1.8; c.stroke(pa); }
    else {
      const sh = { flat: [[-6, 0], [0, 1.2], [6, -.4]], smile: [[-10, -3], [-4, 2], [4, 2], [10, -3]], smug: [[-8, 1.5], [0, 2], [7, -1], [11, -6]],
        wavy: [[-10, 1], [-5, -2], [0, 1], [5, -2], [10, 1]], frown: [[-8, 3], [-3, -1], [3, -1], [8, 3]] }[k] || [[-6, 0], [6, 0]];
      pchLine(c, sh, 2.3, ln, jf * .4, 44 + rg.tk);
      if (k === 'smile') pchLine(c, [[-5, 2.5], [0, 4.5], [5, 2.5]], 1.2, PCH_C.skinDeep, 0, 0, .6);
    }
  }
  c.restore();
}

// 后发（头部坐标）。E 发梢的 y，wb 发梢半宽，flow 发梢横向漂移，tiltX 头歪时发顶的横移
function pchBackHair(c, rg, E, wb, flow, tiltX = 0, fan = 0) {
  const t = rg.t, pts = [], sw = Math.sin(t * 1.15) * 5 + Math.sin(t * .63 + 1) * 3;
  const dx = y => (y < -60 ? 0 : ((y + 60) / (E + 60)) ** 1.5) * (flow + sw) + tiltX * (1 - clamp((y + 170) / (E + 170), 0, 1));
  const side = (sg) => { const o = []; const ys = [-150, -110, -50, lerp(-50, E, .3), lerp(-50, E, .62), E - 30];
    ys.forEach((y, i) => { const x = i < 3 ? [92, 104, 108][i] : lerp(108, wb, (y + 50) / (E + 50)); o.push([sg * (x + fan * ((y + 150) / (E + 150)) ** 2) + dx(y), y]); }); return o; };
  const R = side(1), Lf = side(-1).reverse();
  pts.push([-60, -186], [0, -200], [60, -186], ...R);
  const nt = 7; for (let k = 0; k <= nt; k++) { const u = k / nt, x = lerp(wb + fan, -wb - fan, u), y = E - (k % 2 ? 16 : 0) - 8 * Math.sin(k * 2.3) ** 2;
    pts.push([x + dx(y) + Math.sin(t * 1.7 + k) * 2.5, y, 1]); if (k < nt) pts.push([lerp(wb + fan, -wb - fan, u + .5 / nt) + dx(y), E - 34 - 6 * Math.sin(k * 1.3), 0]); }
  pts.push(...Lf);
  const pa = pchShape(c, pts, { fill: PCH_C.hair, w: 3, j: rg.jb, sd: 11 + rg.tk });
  pchClip(c, pa, () => {
    pchFillPts(c, [[-66, -150], [66, -150], [70 + dx(E * .5) * .8, E * .5], [60 + dx(E), E + 10], [-60 + dx(E), E + 10], [-70 + dx(E * .5) * .8, E * .5]], PCH_C.hairBack, 1, rg.jb, 13 + rg.tk);
    for (let k = -3; k <= 3; k++) { if (!k) continue; const x0 = k * 30; pchLine(c, [[x0 * .9, -120], [x0 * 1.05 + dx(E * .4), E * .4], [x0 * 1.1 + dx(E * .85), E * .85]], 1.6, PCH_C.hairShade, rg.jb, 15 + k + rg.tk, .7); }
  });
  return pa;
}

// 侧发（胸前的一缕，发梢扎蝴蝶结）。sg 哪一侧，E 发梢 y
function pchLock(c, rg, sg, E, sway) {
  const B = E - 56, xs = y => 78 + 4 * (y + 150) / (E + 150) + sway * ((y + 150) / (E + 150)) ** 2;
  const ws = [[-150, 34], [-95, 30], [-40, 25], [B - 34, 20], [B - 6, 12], [B + 4, 14], [B + 22, 22], [E - 22, 20]];
  const out = ws.map(([y, w]) => [sg * (xs(y) + w / 2), y]), inn = ws.map(([y, w]) => [sg * (xs(y) - w / 2), y]).reverse();
  const tip = [[sg * (xs(E) + 5), E, 1], [sg * xs(E - 12), E - 14, 0], [sg * (xs(E) - 6), E - 4, 1]];
  const pa = pchShape(c, [...out, ...tip, ...inn], { fill: PCH_C.hair, w: 2.8, j: rg.jf * 1.5, sd: 21 + sg + rg.tk });
  pchClip(c, pa, () => {
    pchFillPts(c, ws.map(([y, w]) => [sg * (xs(y) - w / 2 - 2), y]).concat(ws.slice().reverse().map(([y, w]) => [sg * (xs(y) - w / 2 + w * .32), y])), PCH_C.hairShade, .75);
    pchLine(c, [[sg * (xs(-130) + 6), -130], [sg * (xs(-40) + 3), -40], [sg * xs(B - 20), B - 20]], 1.4, PCH_C.hairShade, 0, 0, .8);
    pchLine(c, [[sg * (xs(-110) + 11), -110], [sg * (xs(-60) + 9), -60]], 2.4, PCH_C.hairHi, 0, 0, .8);
    pchLine(c, [[sg * xs(B + 12), B + 12], [sg * (xs(E - 16) + 2), E - 16]], 1.3, PCH_C.hairShade, 0, 0, .7);
  });
  if (sg < 0) pchBow(c, sg * xs(B), B, 15, PCH_C.red, PCH_C.redShade, -.1, rg.jf, 31 + rg.tk, .75);
  else pchBow(c, sg * xs(B), B, 15, PCH_C.blue, PCH_C.blueShade, .1, rg.jf, 35 + rg.tk, .75);
}

// 头（原点在下巴尖）。o = { mood, mouth, blink, look:[x,y], es 眼睛放大, ey 眼睛高度, lockE 侧发长度, lids 眼皮额外下压 0..1, sweat }
function pchHead(c, rg, o) {
  const md = PCH_MOODS[o.mood] || PCH_MOODS.normal, t = rg.t, jf = rg.jf, es = o.es || 1, ey = o.ey || -66;
  // 脸
  const fp = pchShape(c, PCH_FACE, { fill: PCH_C.skin, w: 2.8, line: PCH_C.faceLine, j: jf, sd: 1 + rg.tk });
  pchClip(c, fp, () => {
    pchFillPts(c, PCH_BANG_SHADOW, PCH_C.skinShade, .8);
    pchFillPts(c, [[-70, -150], [-54, -150], [-52, -60], [-60, -20], [-70, -20]], PCH_C.skinShade, .55);
    pchFillPts(c, [[70, -150], [56, -150], [55, -80], [62, -30], [70, -30]], PCH_C.skinShade, .35);
  });
  // 腮红
  for (const sg of [-1, 1]) {
    const bx = sg * 38 * Math.min(1.08, es), by = ey + 24 * es, g = c.createRadialGradient(bx, by, 1, bx, by, 17 * es);
    g.addColorStop(0, alpha(P.blush, md.mouth === 'frown' ? .35 : .6)); g.addColorStop(1, alpha(P.blush, 0));
    c.save(); c.translate(bx, by); c.scale(1, .55); c.translate(-bx, -by); c.fillStyle = g; c.beginPath(); c.arc(bx, by, 17 * es, 0, TAU); c.fill(); c.restore();
    for (let k = -1; k <= 1; k++) pchLine(c, [[bx + k * 6 + 2, by - 3], [bx + k * 6 - 2, by + 3]], 1.2, PCH_C.skinDeep, 0, 0, .45);
  }
  // 眼睛
  const open = (o.lids !== undefined ? md.o * (1 - o.lids) : md.o) * (1 - (o.blink || 0));
  const look = o.look || [2.5, 0];
  for (const sg of [-1, 1]) {
    c.save(); c.translate(sg * 31 * Math.min(es, 1.12), ey); c.scale(sg * es, es);
    pchEye(c, sg, open, md, [look[0] * sg, look[1]], rg, 51 + sg * 3 + rg.tk);
    c.restore();
  }
  // 鼻子、嘴
  pchLine(c, [[3, ey + 25 * es], [1, ey + 29 * es]], 1.8, PCH_C.skinDeep, 0, 0, .8);
  c.save(); if (es !== 1) { c.translate(0, -22); c.scale(es * .9, es * .9); c.translate(0, 22); } pchMouth(c, md, o.mouth || 0, rg, t); c.restore();
  // 侧发、刘海
  const lockE = o.lockE || 132, sway = Math.sin(t * 1.4) * 2.5;
  pchLock(c, rg, -1, lockE, -sway);
  pchLock(c, rg, 1, lockE, sway);
  const bp = pchShape(c, pchBangsPts(0, Math.sin(t * 1.6) * .7), { fill: PCH_C.hair, w: 2.8, j: jf, sd: 61 + rg.tk });
  pchClip(c, bp, () => {
    pchFillPts(c, [[-100, -200], [100, -200], [100, -148], [0, -138], [-100, -148]], PCH_C.hairShade, .55);
    pchFillPts(c, PCH_BANG_HI, PCH_C.hairHi, .75);
    for (const s of PCH_BANG_STRANDS) pchLine(c, [[s[0], s[1]], [s[2] + 1, (s[1] + s[3]) / 2], [s[2], s[3]]], 1.4, PCH_C.hairShade, 0, 0, .8);
  });
  // 眉毛（画在刘海上）
  for (const sg of [-1, 1]) {
    const b = md.brow, asy = md.asym ? (sg > 0 ? -4 : 2) : 0;
    pchLine(c, [[sg * 14, -110 + b[0] + b[1] + asy], [sg * 29, -115 + b[0] + (b[1] + b[2]) / 2 + asy], [sg * 45, -111 + b[0] + b[2] + asy]], 2.6, PCH_C.hairDeep, jf * .5, 71 + sg + rg.tk, .9);
  }
  // 帽子
  const dp = pchShape(c, PCH_CAP_DOME, { fill: PCH_C.cap, w: 3, j: rg.jb, sd: 81 + rg.tk });
  pchClip(c, dp, () => {
    pchFillPts(c, PCH_CAP_SHADE, PCH_C.capShade, .9);
    pchFillPts(c, [[-126, -130], [126, -130], [126, -160], [60, -152], [0, -162], [-60, -152], [-126, -160]], PCH_C.capShade, .7);
    for (const f of PCH_CAP_FOLDS) pchLine(c, f, 1.8, PCH_C.capDeep, 0, 0, .9);
  });
  const frp = pchShape(c, PCH_FRILL, { fill: PCH_C.cap, w: 2.6, j: rg.jb * .8, sd: 83 + rg.tk });
  pchClip(c, frp, () => { c.save(); c.strokeStyle = PCH_C.capShade; c.lineWidth = 10; c.globalAlpha = .9; c.stroke(pchPath(PCH_FRILL_UP, false)); c.restore(); });
  for (const pl of PCH_FRILL_PLEATS) pchLine(c, pl, 1.4, PCH_C.capDeep, 0, 0, .9);
  pchBow(c, -121, -104, 15, PCH_C.red, PCH_C.redShade, .5, rg.jf, 91 + rg.tk, .9);
  pchBow(c, 124, -106, 14, PCH_C.blue, PCH_C.blueShade, -.45, rg.jf, 95 + rg.tk, .9);
  pchMoon(c, 74, -214, 31, -.55 + Math.sin(t * 1.7) * .07, rg.jf, 97 + rg.tk);
  // 表情附件
  if (md.vein) { c.save(); c.translate(-88, -176); c.rotate(-.2); for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); pchLine(c, [[3, -9], [6, -4], [11, -3]], 2.6, PCH_C.red, 0, 0); } c.restore(); }
  if (md.bubble && (o.mouth || 0) < .06) {
    const r = 6 + 5 * (.5 + .5 * Math.sin(t * 2.3));
    c.save(); c.globalAlpha = .55; c.fillStyle = mix(P.sky, P.cap, .5); c.beginPath(); c.arc(14 + r * .8, ey + 30 * es, r, 0, TAU); c.fill(); c.globalAlpha = .9; c.strokeStyle = mix(P.blue, P.ink, .3); c.lineWidth = 1.4; c.stroke();
    c.fillStyle = P.cap; c.beginPath(); c.arc(14 + r * .45, ey + 30 * es - r * .4, r * .22, 0, TAU); c.fill(); c.restore();
  }
  if (o.sweat) { const b = (t * 1.3) % 1; pchSweat(c, 74, -60 + b * 18, 8, 1 - b * .6); pchSweat(c, -80, -30 + ((b + .5) % 1) * 18, 6, 1 - ((b + .5) % 1) * .6); }
}

// ===================== 手臂、手 =====================
function pchIK(S, T, l1, l2, bend) {
  const dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy), dd = clamp(d, Math.abs(l1 - l2) + 1, l1 + l2 - .5);
  const base = Math.atan2(dy, dx), a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), a1 = base + bend * a;
  const E = [S[0] + Math.cos(a1) * l1, S[1] + Math.sin(a1) * l1], a2 = Math.atan2(T[1] - E[1], T[0] - E[0]);
  return { S, E, Wr: [E[0] + Math.cos(a2) * l2, E[1] + Math.sin(a2) * l2], a1, a2 };
}
// 手臂几何。a = { S, T, bend, l1, l2, k 粗细倍数, hand, hAng, mir }
function pchArmGeo(a) {
  const g = pchIK(a.S, a.T, a.l1 || 100, a.l2 || 92, a.bend), k = a.k || 1;
  const u1 = [Math.cos(g.a1), Math.sin(g.a1)], u2 = [Math.cos(g.a2), Math.sin(g.a2)], n1 = [-u1[1], u1[0]], n2 = [-u2[1], u2[0]];
  let nE = [n1[0] + n2[0], n1[1] + n2[1]]; const ln = Math.hypot(nE[0], nE[1]) || 1; nE = [nE[0] / ln, nE[1] / ln];
  const M = [(g.E[0] + g.Wr[0]) / 2, (g.E[1] + g.Wr[1]) / 2], C = g.Wr, add = (p, v, s) => [p[0] + v[0] * s, p[1] + v[1] * s];
  const w0 = 17 * k, wE = 19 * k, wM = 23 * k, wC = 30 * k;
  const sleeve = [[...add(g.S, n1, w0), 1], add(g.E, nE, wE), add(M, n2, wM), [...add(C, n2, wC), 1], [...add(C, n2, -wC), 1], add(M, n2, -wM), add(g.E, nE, -wE), [...add(g.S, n1, -w0), 1]];
  // 阴影在朝下的一侧
  const ss = n2[1] > 0 ? 1 : -1;
  const shade = [add(g.S, n1, ss * w0), add(g.E, nE, ss * wE), add(M, n2, ss * wM), add(C, n2, ss * wC), add(C, n2, ss * wC * .45), add(M, n2, ss * wM * .4), add(g.E, nE, ss * wE * .35), add(g.S, n1, ss * w0 * .3)];
  const fr = [add(C, n2, wC + 3 * k), add(add(C, n2, wC + 7 * k), u2, 11 * k), add(add(C, n2, -wC - 7 * k), u2, 11 * k), add(C, n2, -wC - 3 * k)];
  const frill = [[...fr[0], 1], ...pchScallop([fr[1], add(add(C, n2, 0), u2, 13 * k), fr[2]], 6, 2.6 * k).map((p, i) => i === 0 ? [p[0], p[1], 0] : p), [...fr[3], 1]];
  return { ...g, u2, n2, k, sleeve, shade, frill, hand: a.hand || 'relax', hAng: a.hAng || 0, mir: !!a.mir, ang: g.a2 };
}
function pchSleeve(c, g, rg, sd, col = PCH_C.robe, shadeCol = PCH_C.robeShade) {
  const pa = pchShape(c, g.sleeve, { fill: col, w: 3 * g.k, j: rg.jb, sd: sd + rg.tk });
  pchClip(c, pa, () => pchFillPts(c, g.shade, shadeCol, .85));
}
function pchCuff(c, g, rg, sd) {
  const pa = pchShape(c, g.frill, { fill: PCH_C.dress, w: 2.4 * g.k, j: rg.jb * .6, sd: sd + rg.tk });
  pchClip(c, pa, () => { c.save(); c.strokeStyle = PCH_C.dressShade; c.lineWidth = 6 * g.k; c.beginPath(); c.moveTo(g.frill[0][0], g.frill[0][1]); c.lineTo(g.frill.at(-1)[0], g.frill.at(-1)[1]); c.stroke(); c.restore(); });
}
// 手（局部：原点在手腕，手指朝 +x，拇指在 -y 一侧）
const PCH_HANDS = {
  relax: { palm: [[2, -10], [20, -11], [33, -9], [39, -3], [38, 3], [32, 8], [18, 10], [2, 9]], fingers: [[8, -8, 19, -15, 6.5]], lines: [[[26, -4], [35, -3]], [[25, 2], [33, 4]]] },
  open: { palm: [[2, -10], [18, -11], [24, -6], [24, 6], [18, 10], [2, 9]], fingers: [[20, -8, 38, -14, 6.2], [23, -3, 43, -4, 6.6], [22, 2, 40, 5, 6.2], [19, 7, 33, 12, 5.4], [8, -9, 17, -22, 7]], lines: [] },
  point: { palm: [[2, -10], [18, -12], [26, -7], [27, 5], [19, 10], [2, 9]], fingers: [[20, -7, 46, -9, 6.2], [10, -9, 22, -10, 6.6]], lines: [[[18, -1], [25, 0]], [[17, 4], [24, 6]]] },
  fist: { palm: [[1, -11], [16, -13], [26, -9], [28, 3], [21, 11], [1, 9]], fingers: [[9, -10, 21, -9, 6.6]], lines: [[[20, -3], [27, -2]], [[19, 3], [26, 5]]] },
  hold: { palm: [[2, -9], [22, -9], [38, -7], [45, -3], [43, 2], [24, 6], [2, 8]], fingers: [[8, -8, 20, -17, 6.5]], lines: [[[28, -2], [40, -1]]] },
  nub: { palm: [[-2, -9], [9, -11], [17, -6], [17, 6], [9, 11], [-2, 9]], fingers: [], lines: [] },
};
function pchHand(c, g, rg, sd) {
  const hd = PCH_HANDS[g.hand] || PCH_HANDS.relax, k = g.k, C = g.Wr;
  c.save(); c.translate(C[0], C[1]); c.rotate(g.ang); if (g.mir) c.scale(1, -1); c.rotate(g.hAng); c.scale(k, k);
  const lw = 2.4, pp = pchPath(hd.palm, true, rg.jf, sd + rg.tk);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = PCH_C.line;
  for (const f of hd.fingers) { c.lineWidth = f[4] + lw * 2; c.beginPath(); c.moveTo(f[0], f[1]); c.lineTo(f[2], f[3]); c.stroke(); }
  c.fillStyle = PCH_C.skin; c.fill(pp); c.lineWidth = lw; c.stroke(pp);
  c.strokeStyle = PCH_C.skin;
  for (const f of hd.fingers) { c.lineWidth = f[4]; c.beginPath(); c.moveTo(f[0], f[1]); c.lineTo(f[2], f[3]); c.stroke(); }
  for (const l of hd.lines) pchLine(c, l, 1.3, PCH_C.skinDeep, 0, 0, .9);
  c.restore();
}
function pchArmFull(c, g, rg, sd) { pchSleeve(c, g, rg, sd); pchHand(c, g, rg, sd + 5); pchCuff(c, g, rg, sd + 9); }

// ===================== 书 =====================
// 打开的书（托在手上，书页朝观众斜上方）。局部：原点在书脊近端，宽约 140
function pchBookOpen(c, x, y, ang, rg, sc = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(sc, sc);
  const j = rg.jb * .7, sd = 101 + rg.tk;
  pchShape(c, [[-74, -10, 1], [74, -10, 1], [76, 4], [70, 13, 1], [-70, 13, 1], [-76, 4]], { fill: PCH_C.book, w: 3, j, sd });
  pchShape(c, [[-70, -12, 1], [0, -5, 1], [70, -12, 1], [70, 2, 1], [0, 8, 1], [-70, 2, 1]], { fill: PCH_C.pageShade, w: 2, j, sd: sd + 1 });
  for (let k = 1; k <= 3; k++) { pchLine(c, [[-68, -12 + k * 3.4], [-2, -5 + k * 3.4]], .9, PCH_C.pageEdge, 0, 0, .8); pchLine(c, [[68, -12 + k * 3.4], [2, -5 + k * 3.4]], .9, PCH_C.pageEdge, 0, 0, .8); }
  for (const sg of [-1, 1]) {
    const pa = pchShape(c, [[0, -6, 1], [sg * 34, -12], [sg * 70, -14, 1], [sg * 66, -40], [sg * 64, -58, 1], [sg * 32, -60], [0, -50, 1]], { fill: PCH_C.page, w: 2.2, j, sd: sd + 3 + sg });
    pchClip(c, pa, () => { pchFillPts(c, [[0, -60], [sg * 16, -58], [sg * 12, -8], [0, 0]], PCH_C.pageShade, .9);
      for (let k = 0; k < 5; k++) { const yy = -48 + k * 8; if (sg > 0 && k > 1 && k < 5) continue; pchLine(c, [[sg * 18, yy + 2], [sg * (58 - k), yy - 1]], 1.6, PCH_C.text, 0, 0, .9); } });
  }
  // 右页上的小魔法阵
  c.save(); c.strokeStyle = alpha(P.moon, .9); c.lineWidth = 1.6; c.beginPath(); c.ellipse(40, -28, 15, 10, -.05, 0, TAU); c.stroke();
  c.beginPath(); for (let k = 0; k <= 5; k++) { const a = k * 2 * TAU / 5 - Math.PI / 2 + rg.t * .5; const px = 40 + Math.cos(a) * 13, py = -28 + Math.sin(a) * 8.5; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.restore();
  // 包角
  for (const sg of [-1, 1]) pchShape(c, [[sg * 76, 4], [sg * 70, 13, 1], [sg * 58, 13, 1], [sg * 74, -2, 1]], { fill: PCH_C.gold, w: 1.6, line: PCH_C.goldShade });
  c.restore();
}
// 合着的书/书的背面（封面朝观众）。w×h，pages: 顶上露出的书页
function pchBookCover(c, x, y, w, h, ang, rg, pages = false, sd0 = 111) {
  c.save(); c.translate(x, y); c.rotate(ang);
  const j = rg.jb * .7, sd = sd0 + rg.tk, hw = w / 2, hh = h / 2;
  if (pages) { for (const sg of [-1, 1]) pchShape(c, [[0, -hh + 2, 1], [sg * hw * .5, -hh - 10], [sg * (hw - 3), -hh - 8, 1], [sg * (hw - 4), -hh + 4, 1]], { fill: PCH_C.page, w: 2, j, sd: sd + sg }); }
  const pa = pchShape(c, [[-hw, -hh, 1], [hw, -hh, 1], [hw, hh, 1], [-hw, hh, 1]], { fill: PCH_C.book, w: 3, j, sd: sd + 3 });
  pchClip(c, pa, () => { pchFillPts(c, [[-hw, hh - 8], [hw, hh - 8], [hw, hh], [-hw, hh]], PCH_C.bookShade, .8); pchFillPts(c, [[-hw, -hh], [-hw + 10, -hh], [-hw + 10, hh], [-hw, hh]], PCH_C.bookShade, .6); });
  c.save(); c.strokeStyle = PCH_C.gold; c.lineWidth = 2; c.globalAlpha = .9; c.strokeRect(-hw + 14, -hh + 8, w - 22, h - 16); c.restore();
  if (pages) pchLine(c, [[0, -hh], [0, hh]], 2.4, PCH_C.bookShade, 0, 0, .9);
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) pchShape(c, [[sx * hw, sy * hh, 1], [sx * (hw - 12), sy * hh, 1], [sx * hw, sy * (hh - 12), 1]], { fill: PCH_C.gold, w: 1.4, line: PCH_C.goldShade });
  drawMoonIcon(c, pages ? hw * .5 : 5, 0, Math.min(w, h) * .14, PCH_C.gold, -.4);
  c.restore();
}

// ===================== 全身 =====================
function pchPoseFull(pose, g, t, bookOn) {
  const br = Math.sin(t * TAU / 3.6) * 1.5;
  const q = { ub: br, sh: 0, hx: 0, hy: 0, tilt: -.03 + Math.sin(t * .8) * .015, look: [2.5, 0], lids: undefined, capL: 0, capR: 0, rot: 0, R: null, Lf: null, book: null, front: false };
  const hang = (sg, bend) => ({ T: [sg * 78, -404 + br], bend, hand: 'relax', hAng: sg > 0 ? 0 : 0, mir: sg < 0 });
  if (pose === 'lecture') {
    const e = easeIO(clamp(g, 0, 1)), w = Math.sin(t * 2.3) * 5 * e, w2 = Math.cos(t * 1.7) * 4 * e;
    q.R = bookOn ? { T: [176, -522 + br], bend: 1, hand: 'hold', hAng: -.1 } : hang(1, 1);
    q.Lf = { T: [lerp(-78, -150, e) + w2, lerp(-404, -552, e) + br + w], bend: -1, hand: e > .3 ? 'open' : 'relax', hAng: lerp(0, -.35, e), mir: true };
    q.capL = 6 * e; if (bookOn) q.book = 'open';
  } else if (pose === 'point') {
    q.R = { T: [232, -728], bend: 1, hand: 'point', hAng: -.05 }; q.capR = 16; q.look = [6, -3]; q.tilt = .02;
    q.Lf = bookOn ? { T: [14, -512 + br], bend: 1, hand: 'relax', hAng: .9, mir: true } : hang(-1, -1);
    if (bookOn) q.book = 'hug';
  } else if (pose === 'read') {
    q.hy = 8; q.tilt = .07; q.look = [0, 5]; q.lids = .25;
    q.R = { T: [60, -534 + br], bend: -1, l1: 88, l2: 64, hand: 'relax', hAng: .5 };
    q.Lf = { T: [-60, -534 + br], bend: 1, l1: 88, l2: 64, hand: 'relax', hAng: .5, mir: true };
    q.book = 'back'; q.front = true;
  } else if (pose === 'cheer') {
    const hop = Math.abs(Math.sin(t * 4.2)) * 5, wv = Math.sin(t * 8.4) * 5;
    q.ub = br - hop; q.tilt = -.04; q.look = [2, -2];
    q.R = { T: [138, -756 + wv - hop], bend: 1, hand: 'open', hAng: -.2 };
    q.Lf = { T: [-138, -756 - wv - hop], bend: -1, hand: 'open', hAng: -.2, mir: true };
    q.capL = q.capR = 16;
  } else if (pose === 'tired') {
    q.ub = 12 + br * .6; q.hy = 14; q.hx = 4; q.tilt = .14; q.look = [1, 4]; q.lids = .3; q.rot = Math.sin(t * .9) * .012;
    q.R = { T: [72, -390 + br], bend: 1, hand: 'relax' }; q.Lf = { T: [-72, -390 + br], bend: -1, hand: 'relax', mir: true };
  } else if (pose === 'shrug') {
    q.sh = -8; q.hy = 4; q.tilt = -.1; q.look = [1, -1];
    q.R = { T: [168, -514 + br], bend: 1, hand: 'open', hAng: -.3 }; q.Lf = { T: [-168, -514 + br], bend: -1, hand: 'open', hAng: -.3, mir: true };
    q.capL = q.capR = 5;
  } else { q.R = hang(1, 1); q.Lf = hang(-1, -1); }
  return q;
}

function drawPatchouli(c, o = {}) {
  const { x = 360, y = 1040, h = 860, facing = 1, pose = 'lecture', mood = 'normal', mouth = 0, blink = 0, t = 0 } = o, s = h / 860;
  const bookOn = o.book !== undefined ? !!o.book : (pose === 'lecture' || pose === 'read');
  const g = o.gesture !== undefined ? o.gesture : .62 + .28 * Math.sin(t * .9);
  const q = pchPoseFull(pose, g, t, bookOn), rg = { t, tk: tick(t), jb: .8, jf: .35 };
  c.save(); c.translate(x, y); c.scale(s * facing, s); if (q.rot) c.rotate(q.rot);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const ub = q.ub, HP = [q.hx, -628 + ub + q.hy + q.sh * .5];
  const upper = (pts, dy) => pts.map(p => [p[0], p[1] + dy * clamp((-p[1] - 150) / 400, 0, 1), p[2]]);
  // 后发
  c.save(); c.translate(HP[0], HP[1]); pchBackHair(c, rg, 330 - ub - q.hy, 126, -8, q.tilt * 120); c.restore();
  // 靴子
  for (const sg of [-1, 1]) {
    c.save(); c.translate(sg * 30, 0);
    const bp = pchShape(c, [[-16, -52], [16, -52], [17, -18], [sg * 5 + 18, -6], [sg * 5 + 16, 0, 1], [sg * 2 - 18, 0, 1], [sg * 2 - 19, -8], [-17, -20]], { fill: PCH_C.boot, w: 3, j: rg.jb, sd: 121 + sg + rg.tk });
    pchClip(c, bp, () => pchFillPts(c, [[-sg * 20, -60], [-sg * 8, -60], [-sg * 6, 0], [-sg * 24, 0]], PCH_C.bootShade, .7));
    pchLine(c, [[-18, -5], [sg * 5 + 17, -5]], 2, PCH_C.line, 0, 0, .8);
    pchBow(c, sg * 15, -30, 7, PCH_C.red, PCH_C.redShade, sg * .3, 0, 0, 0);
    c.restore();
  }
  // 睡袍（条纹）
  const dp = pchShape(c, upper(PCH_DRESS, ub), { fill: PCH_C.dress, w: 3, j: rg.jb, sd: 131 + rg.tk });
  pchClip(c, dp, () => {
    c.fillStyle = PCH_C.stripe;
    for (let k = -8; k <= 8; k++) { const xt = k * 9.5, xb = k * 17.5, wt = 2.8, wb = 5.2; c.beginPath(); c.moveTo(xt - wt, -640); c.lineTo(xt + wt, -640); c.lineTo(xb + wb, -40); c.lineTo(xb - wb, -40); c.fill(); }
    for (const sg of [-1, 1]) { c.save(); c.translate(-sg * 7, 3); pchFillPts(c, pchMap(PCH_ROBE, (px) => sg * px, (px, py) => py), PCH_C.dressShade, .55); c.restore(); }
    pchFillPts(c, [[-80, -600], [80, -600], [80, -585], [0, -560], [-80, -585]], PCH_C.dressShade, .5);
  });
  const hp = pchShape(c, PCH_HEM, { fill: PCH_C.dress, w: 2.6, j: rg.jb, sd: 133 + rg.tk });
  pchClip(c, hp, () => { c.save(); c.strokeStyle = PCH_C.dressShade; c.lineWidth = 10; c.stroke(pchPath(PCH_HEM.slice(0, 10), false)); c.restore(); });
  for (const v of PCH_HEM_PLEATS) pchLine(c, [[v[0], v[1]], [v[0] * .97, v[1] - 14]], 1.3, PCH_C.dressShade, 0, 0, 1);
  // 外袍（左右两片）
  for (const sg of [-1, 1]) {
    const pts = upper(pchMap(PCH_ROBE, px => sg * px, (px, py) => py), ub);
    const rp = pchShape(c, pts, { fill: PCH_C.robe, w: 3, j: rg.jb, sd: 141 + sg + rg.tk });
    pchClip(c, rp, () => pchFillPts(c, upper(pchMap(PCH_ROBE_SHADE, px => sg * px, (px, py) => py), ub), PCH_C.robeShade, sg < 0 ? .9 : .5));
    pchShape(c, upper(pchMap(PCH_ROBE_FRILL, px => sg * px, (px, py) => py), ub), { fill: PCH_C.robeLight, w: 2, j: rg.jb * .6, sd: 145 + sg + rg.tk });
  }
  pchBow(c, -118, -300, 30, PCH_C.red, PCH_C.redShade, .25, rg.jb, 151 + rg.tk, 1.1);
  // 手臂
  const S = sg => [sg * 62, -590 + ub + q.sh];
  const gR = pchArmGeo({ S: S(1), ...q.R }), gL = pchArmGeo({ S: S(-1), ...q.Lf });
  if (!q.front) { pchArmFull(c, gL, rg, 161); pchArmFull(c, gR, rg, 171); }
  else { pchSleeve(c, gL, rg, 161); pchSleeve(c, gR, rg, 171); }
  if (q.book === 'open') { const u = gR.u2; pchBookOpen(c, gR.Wr[0] + u[0] * 26, gR.Wr[1] + u[1] * 26 - 8, -.12 + Math.sin(t * 1.1) * .02, rg, .95); }
  // 披肩
  for (const sg of [-1, 1]) {
    const lift = sg > 0 ? q.capR : q.capL;
    const pts = pchMap(PCH_CAPE, px => sg * px, (px, py) => py + ub + q.sh - lift * clamp((px - 30) / 74, 0, 1) * clamp((py + 610) / 60, 0, 1));
    const cp = pchShape(c, pts, { fill: PCH_C.robeLight, w: 3, j: rg.jb, sd: 181 + sg + rg.tk });
    pchClip(c, cp, () => pchFillPts(c, pchMap(PCH_CAPE_SHADE, px => sg * px, (px, py) => py + ub + q.sh - lift * clamp((px - 30) / 74, 0, 1)), PCH_C.robe, .9));
  }
  // 脖子、领子、领结
  c.save(); c.translate(0, ub + q.sh * .5);
  const np = pchShape(c, [[-12, -646], [12, -646], [13, -606], [-13, -606]], { fill: PCH_C.skin, w: 2.4, line: PCH_C.faceLine });
  pchClip(c, np, () => pchFillPts(c, [[-14, -650], [14, -650], [14, -626], [0, -620], [-14, -626]], PCH_C.skinShade, .9));
  for (const sg of [-1, 1]) pchShape(c, [[0, -604, 1], [sg * 6, -614], [sg * 22, -616, 1], [sg * 20, -600], [sg * 8, -596, 1]], { fill: PCH_C.dress, w: 2.2, j: rg.jf, sd: 191 + sg + rg.tk });
  pchBow(c, 0, -600, 21, PCH_C.red, PCH_C.redShade, 0, rg.jf, 195 + rg.tk, 1);
  c.restore();
  // 头
  c.save(); c.translate(HP[0], HP[1]); c.rotate(q.tilt);
  pchHead(c, rg, { mood, mouth, blink, look: q.look, lids: q.lids, lockE: 132 });
  c.restore();
  // 前景层
  if (q.front) {
    if (q.book === 'back') pchBookCover(c, 0, -548 + ub, 124, 92, .02, rg, true);
    pchHand(c, gL, rg, 166); pchHand(c, gR, rg, 176); pchCuff(c, gL, rg, 169); pchCuff(c, gR, rg, 179);
  }
  if (q.book === 'hug') { pchBookCover(c, 12, -516 + ub, 70, 92, .12, rg, false); pchHand(c, gL, rg, 166); }
  c.restore();
}

// ===================== Q 版 =====================
// Q 版身体（局部：脚底 (0,0)，h=300）。o：pose 细节由调用方给
const PCH_CB_DRESS = [[-22, -104], [22, -104], [30, -84], [40, -56], [52, -30], [58, -16, 1], [0, -12], [-58, -16, 1], [-52, -30], [-40, -56], [-30, -84]];
const PCH_CB_HEM = [[-60, -20, 1], [0, -14], [60, -20, 1], ...pchScallop([[64, -8], [0, -3], [-64, -8]], 9, 3)];
const PCH_CB_ROBE = [[10, -106], [28, -102], [34, -84], [44, -56], [56, -30], [61, -18, 1], [36, -16, 1], [22, -60], [14, -90]];
const PCH_CB_CAPE = [[4, -100], [14, -110], [32, -106], [42, -94], [47, -80], ...pchScallop([[47, -78], [28, -74], [10, -82]], 4, 2.4)];

function pchChibiBody(c, rg, o) {
  const { armL, armR, feet = [[-17, 0], [17, 0]], front = false, dressLen = 0 } = o;
  const k = .42;
  // 靴子
  for (let i = 0; i < 2; i++) { const [fx, fy] = feet[i], sg = i ? 1 : -1;
    c.save(); c.translate(fx, fy); pchShape(c, [[-10, -20], [10, -20], [11, -6], [sg * 3 + 12, -2], [sg * 3 + 10, 0, 1], [sg * 2 - 11, 0, 1], [-12, -5]], { fill: PCH_C.boot, w: 2.4, j: rg.jb * .6, sd: 201 + i + rg.tk }); c.restore(); }
  const dl = pts => dressLen ? pts.map(p => [p[0], p[1] < -40 ? p[1] : p[1] + dressLen * clamp((p[1] + 40) / 30, 0, 1), p[2]]) : pts;
  const dp = pchShape(c, dl(PCH_CB_DRESS), { fill: PCH_C.dress, w: 2.6, j: rg.jb * .7, sd: 211 + rg.tk });
  pchClip(c, dp, () => { c.fillStyle = PCH_C.stripe; for (let q = -5; q <= 5; q++) { const xt = q * 6.5, xb = q * 12; c.beginPath(); c.moveTo(xt - 1.8, -110); c.lineTo(xt + 1.8, -110); c.lineTo(xb + 3.6, 0 + dressLen); c.lineTo(xb - 3.6, 0 + dressLen); c.fill(); } });
  c.save(); if (dressLen) c.translate(0, dressLen);
  pchShape(c, PCH_CB_HEM, { fill: PCH_C.dress, w: 2.2, j: rg.jb * .6, sd: 213 + rg.tk }); c.restore();
  for (const sg of [-1, 1]) {
    const rp = pchShape(c, dl(pchMap(PCH_CB_ROBE, px => sg * px, (px, py) => py)), { fill: PCH_C.robe, w: 2.6, j: rg.jb * .7, sd: 215 + sg + rg.tk });
    pchClip(c, rp, () => pchFillPts(c, dl(pchMap([[34, -84], [44, -56], [56, -30], [61, -18], [50, -18], [40, -56], [30, -84]], px => sg * px, (px, py) => py)), PCH_C.robeShade, sg < 0 ? .9 : .5));
  }
  // 手臂
  const gL = pchArmGeo({ ...armL, k, mir: true }), gR = pchArmGeo({ ...armR, k });
  if (!o.armsLater) { if (!front) { pchArmFull(c, gL, rg, 221); pchArmFull(c, gR, rg, 231); } else { pchSleeve(c, gL, rg, 221); pchSleeve(c, gR, rg, 231); } }
  for (const sg of [-1, 1]) pchShape(c, pchMap(PCH_CB_CAPE, px => sg * px, (px, py) => py), { fill: PCH_C.robeLight, w: 2.4, j: rg.jb * .6, sd: 241 + sg + rg.tk });
  pchBow(c, 0, -102, 9, PCH_C.red, PCH_C.redShade, 0, rg.jf, 245 + rg.tk, .8);
  return { gL, gR };
}

function drawPatchouliChibi(c, o = {}) {
  const { x = 0, y = 0, h = 300, facing = 1, pose = 'stand', mood = 'normal', mouth = 0, blink = 0, t = 0 } = o, s = h / 300;
  const rg = { t, tk: tick(t), jb: .7, jf: .3 }, HK = .76;
  const headO = { mood, mouth, blink, look: [2, 0], es: 1.22, ey: -58, lockE: 66 };
  // 局部点 → 屏幕
  let mapPt = (lx, ly) => [x + lx * s * facing, y + ly * s];
  c.save(); c.translate(x, y); c.scale(s * facing, s); c.lineJoin = 'round'; c.lineCap = 'round';
  let hands, head;
  if (pose === 'flat') {
    // 趴着：头在左，身体往右平摊
    const br = Math.sin(t * 2) * 1.2;
    const bp = pchShape(c, [[-40, 0, 1], [-34, -36], [0, -52 - br], [60, -50 - br], [120, -42], [158, -26], [170, 0, 1]], { fill: PCH_C.robe, w: 2.6, j: rg.jb, sd: 301 + rg.tk });
    pchClip(c, bp, () => { c.fillStyle = PCH_C.stripe; for (let q = 0; q < 9; q++) { const yy = -46 + q * 6; c.fillRect(20, yy, 150, 2.4); } pchFillPts(c, [[-40, -10], [170, -10], [170, 0], [-40, 0]], PCH_C.robeShade, .8); });
    pchShape(c, [[150, -30], [178, -48], [188, -38], [168, -18]], { fill: PCH_C.boot, w: 2.4, j: rg.jb, sd: 303 + rg.tk });
    pchShape(c, [[140, -18], [170, -30], [178, -20], [150, -8]], { fill: PCH_C.boot, w: 2.4, j: rg.jb, sd: 304 + rg.tk });
    pchBow(c, 120, -44, 10, PCH_C.red, PCH_C.redShade, .3, rg.jf, 305 + rg.tk, .6); pchBow(c, 138, -38, 9, PCH_C.blue, PCH_C.blueShade, -.2, rg.jf, 306 + rg.tk, .6);
    // 披在背上的头发
    pchShape(c, [[-50, -150], [20, -120], [80, -70], [140, -52, 1], [110, -48], [124, -40, 1], [70, -46], [10, -52], [-30, -80]], { fill: PCH_C.hair, w: 2.6, j: rg.jb, sd: 307 + rg.tk });
    // 手臂（袖子沿地面伸到脸两侧）
    const gA = pchArmGeo({ S: [-30, -36], T: [-148, -10], bend: 1, l1: 60, l2: 58, k: .42, hand: 'nub', mir: true }), gB = pchArmGeo({ S: [-6, -34], T: [-18, -10], bend: 1, l1: 20, l2: 18, k: .42, hand: 'nub' });
    pchArmFull(c, gA, rg, 311);
    c.save(); c.translate(-84, -12); c.rotate(-.1); c.scale(HK, HK);
    pchBackHair(c, rg, 20, 110, 20, 0, 0);
    pchHead(c, rg, { ...headO, lockE: 40, mood: mood === 'normal' ? 'sad' : mood }); c.restore();
    pchArmFull(c, gB, rg, 321);
    hands = [gA.Wr, gB.Wr].map(p => mapPt(p[0], p[1])); head = mapPt(-84 + 0, -12 - 70 * HK);
  } else if (pose === 'lie') {
    // 仰躺抱书（俯视）：站姿整个转 -90°，头在左
    c.save(); c.translate(150, -86); c.rotate(-Math.PI / 2);
    const br = Math.sin(t * 1.6) * 1.2;
    c.save(); c.translate(0, -112); c.scale(HK, HK); pchBackHair(c, rg, 150, 150, 0, 0, 30); c.restore();
    const r = pchChibiBody(c, rg, { armL: { S: [-26, -96], T: [-16, -64 + br], bend: 1, l1: 26, l2: 24, hand: 'nub', hAng: 0 }, armR: { S: [26, -96], T: [18, -58 + br], bend: -1, l1: 26, l2: 24, hand: 'nub' }, front: true, dressLen: 40, feet: [[-17, 40], [17, 40]] });
    c.save(); c.translate(0, -112); c.scale(HK, HK); pchHead(c, rg, { ...headO, look: [0, 0] }); c.restore();
    pchBookCover(c, 0, -62 + br, 50, 60, .08, rg, false, 331);
    pchHand(c, r.gL, rg, 226); pchHand(c, r.gR, rg, 236); pchCuff(c, r.gL, rg, 229); pchCuff(c, r.gR, rg, 239);
    c.restore();
    const lm = (lx, ly) => { const X = ly + 150, Y = -lx - 86; return mapPt(X, Y); };
    hands = [r.gL.Wr, r.gR.Wr].map(p => lm(p[0], p[1])); head = lm(0, -112 - 62 * HK);
  } else {
    let hy = -112, hx = 0, lean = 0, feet = [[-17, 0], [17, 0]], armL, armR, extra = {}, flow = -4, bounce = 0, armsBehind = false;
    const br = Math.sin(t * TAU / 3.2) * 1.2;
    if (pose === 'run') {
      const ph = t * TAU * 2.2, sn = Math.sin(ph);
      bounce = -Math.abs(Math.cos(ph)) * 7; lean = .12; flow = -26;
      feet = [[sn * 20 - 17 * .3, -Math.max(0, -Math.cos(ph)) * 9], [-sn * 20 + 17 * .3, -Math.max(0, Math.cos(ph)) * 9]];
      armL = { S: [-26, -96], T: [-30 - sn * 18, -58 + Math.abs(sn) * 6], bend: 1, l1: 26, l2: 24, hand: 'nub' };
      armR = { S: [26, -96], T: [30 + sn * 18, -58 + Math.abs(sn) * 6], bend: -1, l1: 26, l2: 24, hand: 'nub' };
    } else if (pose === 'sit') {
      hy = -100;
      armL = { S: [-26, -86], T: [-20, -40], bend: 1, l1: 26, l2: 24, hand: 'nub' }; armR = { S: [26, -86], T: [20, -40], bend: -1, l1: 26, l2: 24, hand: 'nub' };
      extra.sit = true;
    } else if (pose === 'lift') {
      const tr = Math.sin(t * 47) * 1.3, sag = Math.sin(t * 3.1) * 3;
      hy = -106; hx = tr * .5; armsBehind = true;
      armL = { S: [-26, -96], T: [-106 + tr, -288 + sag], bend: -1, l1: 104, l2: 104, hand: 'nub', hAng: -.4 };
      armR = { S: [26, -96], T: [106 + tr, -288 - sag], bend: 1, l1: 104, l2: 104, hand: 'nub', hAng: -.4 };
      feet = [[-22 + tr, 0], [22 + tr, 0]]; headO.sweat = true;
    } else {
      armL = { S: [-26, -96], T: [-38, -52 + br], bend: 1, l1: 26, l2: 24, hand: 'nub' }; armR = { S: [26, -96], T: [38, -52 + br], bend: -1, l1: 26, l2: 24, hand: 'nub' };
    }
    c.save(); c.translate(0, bounce); if (lean) c.rotate(lean);
    c.save(); c.translate(hx, hy + br * .5); c.scale(HK, HK); pchBackHair(c, rg, extra.sit ? (0 - hy) / HK - 6 : 128, extra.sit ? 132 : 120, flow, 0, extra.sit ? 16 : 0); c.restore();
    let r;
    if (extra.sit) {
      // 坐着：裙子摊成一圈，两只靴底朝前
      const sp = pchShape(c, [[-84, -4, 1], [-78, -30], [-50, -64], [-24, -90], [24, -90], [50, -64], [78, -30], [84, -4, 1], [40, 2], [-40, 2]], { fill: PCH_C.dress, w: 2.6, j: rg.jb * .7, sd: 251 + rg.tk });
      pchClip(c, sp, () => { c.fillStyle = PCH_C.stripe; for (let q = -6; q <= 6; q++) { c.beginPath(); c.moveTo(q * 5 - 1.6, -95); c.lineTo(q * 5 + 1.6, -95); c.lineTo(q * 14 + 3.6, 5); c.lineTo(q * 14 - 3.6, 5); c.fill(); } });
      for (const sg of [-1, 1]) pchShape(c, [[sg * 24, -90], [sg * 50, -64], [sg * 80, -28], [sg * 86, -4, 1], [sg * 58, -2, 1], [sg * 34, -40], [sg * 16, -84]], { fill: PCH_C.robe, w: 2.6, j: rg.jb * .7, sd: 253 + sg + rg.tk });
      for (const sg of [-1, 1]) { c.save(); c.translate(sg * 22, -6); pchShape(c, ellPts(0, 0, 13, 10, 14), { fill: PCH_C.boot, w: 2.4, j: rg.jb * .5, sd: 255 + sg + rg.tk }); pchShape(c, ellPts(0, 1, 8, 6, 12), { fill: PCH_C.bootShade, w: 0 }); c.restore(); }
      const gL = pchArmGeo({ ...armL, k: .42, mir: true }), gR = pchArmGeo({ ...armR, k: .42 });
      pchArmFull(c, gL, rg, 221); pchArmFull(c, gR, rg, 231);
      c.save(); c.translate(0, 14); for (const sg of [-1, 1]) pchShape(c, pchMap(PCH_CB_CAPE, px => sg * px, (px, py) => py), { fill: PCH_C.robeLight, w: 2.4, j: rg.jb * .6, sd: 241 + sg + rg.tk });
      pchBow(c, 0, -102, 9, PCH_C.red, PCH_C.redShade, 0, rg.jf, 245 + rg.tk, .8); c.restore();
      r = { gL, gR };
    } else {
      r = pchChibiBody(c, rg, { armL, armR, feet, armsLater: armsBehind });
      if (armsBehind) { pchArmFull(c, r.gL, rg, 221); pchArmFull(c, r.gR, rg, 231); for (const sg of [-1, 1]) pchShape(c, pchMap(PCH_CB_CAPE, px => sg * px, (px, py) => py), { fill: PCH_C.robeLight, w: 2.4, j: rg.jb * .6, sd: 241 + sg + rg.tk }); pchBow(c, 0, -102, 9, PCH_C.red, PCH_C.redShade, 0, rg.jf, 245 + rg.tk, .8); }
    }
    c.save(); c.translate(hx, hy + br * .5); c.rotate(pose === 'run' ? -.08 : 0); c.scale(HK, HK); pchHead(c, rg, headO); c.restore();
    c.restore();
    const cs = Math.cos(lean), sn2 = Math.sin(lean), lm = (lx, ly) => { const X = lx * cs - ly * sn2, Y = lx * sn2 + ly * cs + bounce; return mapPt(X, Y); };
    hands = [r.gL.Wr, r.gR.Wr].map(p => { const u = [Math.cos(r.gL.a2), 0]; return lm(p[0], p[1]); });
    if (pose === 'lift') hands = [lm(r.gL.Wr[0] + Math.cos(r.gL.a2) * 8, r.gL.Wr[1] + Math.sin(r.gL.a2) * 8), lm(r.gR.Wr[0] + Math.cos(r.gR.a2) * 8, r.gR.Wr[1] + Math.sin(r.gR.a2) * 8)];
    head = lm(hx, hy - 70 * HK);
  }
  c.restore();
  hands.sort((a, b) => a[0] - b[0]);
  return { hands, head };
}
