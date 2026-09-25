'use strict';
// 第 2 段：吃饭（第二版 · 俯拍桌面定格动画，见 docs/分镜v2.md 顶部表格）。
//   镜头从正上方看一张铺着亚麻桌布的长桌。桌上的东西是剪纸做的，但像真东西：多层纸叠出侧边（有厚度、透视下露出侧面），
//   顶光（略偏左上）投下清楚的影子；所有东西一拍两帧地被「挪动」（twos），像定格动画。帕秋莉是站在桌上的小剪纸人偶。
//   镜头沿长桌横移，五个「工位」：
//   A 盘子 + 时钟 + 两根筷子摆成「=」       L1
//   B 两只纸箱鼠笼、24 小时小钟、奶酪       L2–L3（2012 小鼠实验）
//   C 手风琴折页时间带（7:00→凌晨）          L4–L8（起床 1 小时、睡前 2–3 小时、炸鸡外卖、五天对齐、饮料和一勺糖）
//   D 衍纸（quilling）肠道迷宫、小菌、发酵罐  L9–L11
//   E 折起来的便条、桌布上的缝线             L12 → 线被拉直横贯画面
// 进场：handoffDisc（夜色里的圆盘）= 桌上的盘子，开灯、镜头拉远。出场：桌布上一根线被拉直 → handoffThread。
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
  ['再说说肠道里的小居民：菌群。越多样，一般越健康。', { pause: .5, hold: .8 }],
  ['实验里，每天吃天然发酵食品的人，菌群更多样，炎症指标也降了。', { hold: 1.1 }],
  ['无糖酸奶、泡菜、纳豆都算。点外卖加份蔬菜粗粮，少点奶茶。', { mood: 'smile', hold: 1.1 }],
  ['胃不好、或者有进食方面困扰的同学，先问医生，别硬饿。', { pause: .5, hold: 1.1 }],
]);
const s2T = i => S2LINES[i][0], s2E = i => S2LINES[i][1];
const S2DUR = seqEnd(S2LINES) + 2.1;
// s2at：第 i 句里说到 sub 这几个字的时刻（按语音时长把字均匀摊开）
function s2at(i, sub) { const [t0, , text] = S2LINES[i], v = voiceOf(text), n = text.length, d = v ? v.d : n * .16, k = Math.max(0, text.indexOf(sub)); return t0 + k / n * d; }

// ===================== 镜头、透视、光 =====================
// 相机在桌面正上方 S2CAM 高处（zoom 越大越低）。世界坐标 = 桌面上的像素（zoom 1 时和屏幕一样大）。
// 高出桌面 z 的点离画面中心更远（透视），所以画面边上的东西会露出侧面。顶光略偏左上：影子往右下落，离桌面越高落得越远越虚。
const S2CAM = 1250, S2LX = .2, S2LY = .32;
const S2OX = [0, 1920, 3840, 5760, 7680];       // 五个工位的世界 x 起点
const S2END = { y: 830, zoom: 2.2 };             // 出场：镜头压向桌布的缝线
function s2cam(t) {
  const e0 = s2E(0), e2 = s2E(2), e7 = s2E(7), e10 = s2E(10), e11 = s2E(11);
  const K = [[0, [720, 500, 2]], [.3, [720, 500, 2]], [1.6, [960, 540, 1]],
    [e0 + .05, [960, 540, 1]], [e0 + .52, [1920, 560, .92]], [e0 + 1, [2880, 540, 1]],
    [e2 + .05, [2880, 540, 1]], [e2 + .52, [3840, 560, .92]], [e2 + 1, [4800, 540, 1]],
    [e7 + .05, [4800, 540, 1]], [e7 + .55, [5760, 560, .92]], [e7 + 1.05, [6720, 540, 1]],
    [e10 + .05, [6720, 540, 1]], [e10 + .52, [7680, 560, .92]], [e10 + 1, [8640, 540, 1]],
    [e11 + .3, [8640, 540, 1]], [S2DUR - .8, [8640, S2END.y, S2END.zoom]]];
  const [x, y, z] = key(t, K); return { x, y, z };
}
const s2k = (C, z = 0) => S2CAM / (S2CAM / C.z - z);
function s2p(C, x, y, z = 0) { const k = s2k(C, z); return [CX + (x - C.x) * k, CY + (y - C.y) * k]; }
const s2P = (C, pts, z = 0) => pts.map(p => s2p(C, p[0], p[1], z));
// 局部轮廓 → 世界：平移 (x,y)、转 a、缩放 s（sy 可单独给）
const s2tf = (pts, x, y, a = 0, s = 1, sy = s) => { const co = Math.cos(a), si = Math.sin(a); return pts.map(([u, v]) => [x + u * s * co - v * sy * si, y + u * s * si + v * sy * co]); };
// 定格动画的「挪」：t0 起 d 秒从 a 到 b，按 twos 走（传进来的就是 twos 时间），末了轻微过冲
const s2mv = (t, t0, d, a, b, e = easeOut) => lerp(a, b, e(clamp((t - t0) / d, 0, 1)));
// s2drop：从 z0 高处落下（前快后停，落地一小弹）
function s2drop(t, t0, z0 = 260, d = .33) { if (t < t0) return z0; const u = (t - t0) / d; if (u < 1) return z0 * (1 - u * u); const v = (t - t0 - d) / .18; return v < 1 ? Math.sin(v * Math.PI) * 10 : 0; }

// s2prism：一块有厚度的剪纸（多层纸叠出侧面）。pts 世界坐标的轮廓；h 厚度；z0 离桌面的高度（悬空的东西影子更远更虚）
function s2prism(c, C, pts, h, top, o = {}) {
  const { z0 = 0, side = mix(top, P.ink, .3), seed = 1, sh = .3, gr = .1, step = 10, al = 1, noTop = false, layer = 3 } = o;
  if (al <= .001) return null; const k = s2k(C, 0), ext = h + z0;
  c.save(); c.globalAlpha *= al;
  if (sh > 0) { c.save(); c.shadowColor = `rgba(40,26,22,${sh})`; c.shadowBlur = (3 + ext * .45) * k; c.shadowOffsetX = (1.5 + ext * S2LX) * k; c.shadowOffsetY = (2 + ext * S2LY) * k;
    c.fillStyle = side; c.fill(polyPath(s2P(C, pts, z0))); c.restore(); }
  if (h > 0) { const n = Math.max(1, Math.round(h / layer)), hl = alpha(mix(side, '#ffffff', .4), .45);
    for (let i = 0; i < n; i++) { const path = polyPath(s2P(C, pts, z0 + h * i / n)); c.fillStyle = mix(side, P.ink, .16 * (1 - i / n)); c.fill(path); c.strokeStyle = hl; c.lineWidth = .8; c.stroke(path); } }
  let path = null; if (!noTop) path = cutPaper(c, s2P(C, pts, z0 + h), top, { seed, step, shadow: false, grain: gr });
  c.restore(); return path;
}
// s2wall：一条立着的纸边（衍纸）：沿折线 pts，高 h
function s2wall(c, C, pts, h, col, o = {}) {
  const { al = 1 } = o; if (pts.length < 2 || al <= 0) return; const k = s2k(C, 0), base = s2P(C, pts, 0), top = s2P(C, pts, h);
  c.save(); c.globalAlpha *= al; c.lineJoin = 'round'; c.lineCap = 'round';
  c.save(); c.filter = `blur(${(2 + h * .3) * k}px)`; c.strokeStyle = 'rgba(40,26,22,.22)'; c.lineWidth = 4 * k; c.stroke(polyPath(pts.map(([x, y]) => s2p(C, x + h * S2LX, y + h * S2LY, 0)), false)); c.restore();
  c.fillStyle = mix(col, P.ink, .22); c.fill(polyPath([...base, ...top.slice().reverse()]));
  c.strokeStyle = col; c.lineWidth = 3.2 * k; c.stroke(polyPath(top, false));
  c.strokeStyle = alpha(mix(col, '#ffffff', .5), .8); c.lineWidth = 1 * k; c.stroke(polyPath(top, false));
  c.restore();
}
// s2txt：印/写在某个表面上的字（跟着透视缩放）
function s2txt(c, C, text, x, y, z, size, o = {}) { const [sx, sy] = s2p(C, x, y, z); zh(c, text, sx, sy, { ...o, size: size * s2k(C, z) }); }
// s2arc：折线按弧长均匀取 n 个点
function s2arc(pts, n) { const q = resample(pts, 3), d = [0]; for (let i = 1; i < q.length; i++) d.push(d[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
  const L = d.at(-1), out = []; let j = 1; for (let i = 0; i < n; i++) { const s = L * i / (n - 1); while (j < d.length - 1 && d[j] < s) j++; const u = (s - d[j - 1]) / ((d[j] - d[j - 1]) || 1); out.push([lerp(q[j - 1][0], q[j][0], u), lerp(q[j - 1][1], q[j][1], u)]); } return out; }
// 沿路径偏移（带宽的一侧）
function s2offset(pts, d) { return pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [p[0] - ty / l * d, p[1] + tx / l * d]; }); }

// ===================== 桌布 =====================
// 亚麻经纬纹理：载入时生成一次（确定性）
const S2WEAVE = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), r = rng(2901);
  for (let i = 0; i < 128; i += 4) { g.fillStyle = `rgba(90,70,50,${.025 + r() * .03})`; g.fillRect(0, i, 128, 1.4); g.fillStyle = `rgba(90,70,50,${.02 + r() * .03})`; g.fillRect(i + 2, 0, 1.4, 128); }
  for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(r() * 128, r() * 128, 3 + r() * 6, 1); }
  return cv; })();
// 亚麻色桌布（和 handoffThread 的纸同色），纸纹随镜头移动；几道叠过的折痕让横移有参照。
function s2cloth(c, C, crease = 1) {
  c.fillStyle = P.paper; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = .12; const pat = c.createPattern(PAPER_GRAIN, 'repeat'); pat.setTransform(new DOMMatrix().translate(((CX - C.x) % 256 + 256) % 256, ((CY - C.y) % 256 + 256) % 256)); c.fillStyle = pat; c.fillRect(0, 0, W, H); c.restore();
  // 顶灯：中间亮、四周略暗（出场时退掉，和 handoffThread 的纯纸面接上）
  if (crease > 0) { const g = c.createRadialGradient(CX, CY * .9, 200, CX, CY, W * .72); g.addColorStop(0, 'rgba(255,250,235,.10)'); g.addColorStop(1, 'rgba(60,40,25,.20)'); c.save(); c.globalAlpha = crease; c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (crease <= 0) return; const k = s2k(C, 0);
  // 亚麻的经纬（很淡）
  c.save(); c.globalAlpha = .5 * crease; const wv = c.createPattern(S2WEAVE, 'repeat'); wv.setTransform(new DOMMatrix().translate(CX - C.x * k, CY - C.y * k).scale(k)); c.fillStyle = wv; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.globalAlpha = crease;
  for (let gx = -640; gx < 11000; gx += 640) { const [sx] = s2p(C, gx, 0); if (sx < -20 || sx > W + 20) continue;
    c.fillStyle = 'rgba(80,60,40,.05)'; c.fillRect(sx - 3 * k, 0, 3 * k, H); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(sx, 0, 2 * k, H); }
  for (const gy of [-40, 1120]) { const [, sy] = s2p(C, 0, gy); c.fillStyle = 'rgba(80,60,40,.05)'; c.fillRect(0, sy - 3 * k, W, 3 * k); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(0, sy, W, 2 * k); }
  c.restore();
}

// ===================== 道具 =====================
const S2C = {
  plate: mix(P.paper, '#ffffff', .25), well: mix(P.paper, P.g1, .3), cheese: mix(P.cap, P.moon, .42), kraft: P.paperEdge, kraftIn: mix(P.paperEdge, P.paper, .45),
  tea: mix(P.paperEdge, P.ink2, .35), coffee: mix(P.ink, P.paperEdge, .28), milktea: mix(P.paperEdge, P.cap, .45), gut: P.blush, thread: '#6b4f55', steel: mix(P.g1, P.g2, .35),
};
// 盘子：一圈紫色细边的纸盘（handoffDisc 的圆盘就是它）
function s2plate(c, C, x, y, r) {
  s2prism(c, C, circPts(x, y, r, 72), 8, S2C.plate, { seed: 2001, step: 26, side: mix(S2C.plate, P.g2, .4) });
  const [sx, sy] = s2p(C, x, y, 8), k = s2k(C, 8);
  c.save(); c.fillStyle = S2C.well; c.beginPath(); c.arc(sx, sy, r * .7 * k, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(60,40,30,.12)'; c.lineWidth = 6 * k; c.beginPath(); c.arc(sx + 2 * k, sy + 3 * k, r * .7 * k - 3 * k, Math.PI * 1.05, Math.PI * 1.75); c.stroke();
  c.strokeStyle = alpha(P.purple, .55); c.lineWidth = 2.5 * k; c.beginPath(); c.arc(sx, sy, r * .88 * k, 0, TAU); c.stroke(); c.restore();
}
// 时钟（24 小时盘也用它）：sector = [起点小时, 长度小时]（奶酪色扇形 = 能吃的时间）；hands = [时针角, 分针角]
function s2clock(c, C, x, y, r, o = {}) {
  const { h = 14, sector = null, hands = null, dial = 12, al = 1 } = o; if (al <= 0) return;
  c.save(); c.globalAlpha *= al;
  s2prism(c, C, circPts(x, y, r, 56), h, P.cap, { seed: 2010 + (x | 0) % 9, side: mix(P.cap, P.g2, .45) });
  const [sx, sy] = s2p(C, x, y, h), k = s2k(C, h), R = r * k;
  if (sector && sector[1] > .01) { const a0 = -Math.PI / 2 + sector[0] / dial * TAU, a1 = a0 + sector[1] / dial * TAU;
    c.fillStyle = S2C.cheese; c.beginPath(); c.moveTo(sx, sy); c.arc(sx, sy, R * .86, a0, a1); c.closePath(); c.fill(); }
  c.strokeStyle = P.g3; c.lineWidth = 2.5 * k; c.beginPath(); c.arc(sx, sy, R * .92, 0, TAU); c.stroke();
  for (let i = 0; i < dial; i++) { const a = i / dial * TAU, big = i % (dial / 4) === 0; c.strokeStyle = P.ink; c.lineWidth = (big ? 3.5 : 2) * k;
    c.beginPath(); c.moveTo(sx + Math.sin(a) * R * (big ? .66 : .74), sy - Math.cos(a) * R * (big ? .66 : .74)); c.lineTo(sx + Math.sin(a) * R * .84, sy - Math.cos(a) * R * .84); c.stroke(); }
  if (hands) hands.forEach((a, i) => { const len = (i ? .72 : .5) * r; s2prism(c, C, s2tf([[-6, -3], [len, -2], [len + 6, 0], [len, 2], [-6, 3]], x, y, a - Math.PI / 2), 2, P.ink, { z0: h + i * 2, seed: 2020 + i, sh: .2, gr: 0, step: 6 }); });
  if (hands) brassPin(c, sx, sy, 6 * k);
  c.restore();
}
// 纸条（标签、桌签）：宽 w、高 hh 的一张纸片，字写在上面
function s2slip(c, C, x, y, w, hh, text, o = {}) {
  const { a = 0, size = 40, color = P.ink, al = 1, z0 = 0, seed = 2030, fill = P.cap, ox = 0 } = o; if (al <= 0) return;
  s2prism(c, C, s2tf(rectPts(-w / 2, -hh / 2, w, hh, 3), x, y, a), 2, fill, { z0, seed, step: 30, al });
  if (text) fade(c, al, () => { const [sx, sy] = s2p(C, x + ox, y, z0 + 2), k = s2k(C, z0 + 2); c.save(); c.translate(sx, sy); c.rotate(a); zh(c, text, 0, size * .36 * k, { size: size * k, align: 'center', color, p: o.p ?? 1 }); c.restore(); });
}
// 老鼠（俯视）：蛋形身子、两只粉耳朵、线尾巴。fat 1..1.6，sleep 闭眼
function s2mouse(c, C, x, y, a, o = {}) {
  const { fat = 1, sleep = false, t = 0, run = 0 } = o, body = [], M = 1.35;
  for (let i = 0; i < 28; i++) { const th = i / 28 * TAU, cx = Math.cos(th); body.push([cx * 36 * (1 + (fat - 1) * .45), Math.sin(th) * 21 * fat * (1 - .42 * Math.pow(Math.max(0, cx), 1.6))]); }
  const wag = Math.sin(twos(t) * (run ? 30 : 5)) * (run ? 10 : 4), tail = s2tf([[-34 * fat, 0], [-56, 6 + wag * .4], [-74, -4 - wag], [-92, 6 + wag]], x, y, a, M);
  const k = s2k(C, 0); c.save(); c.strokeStyle = S2C.gut; c.lineWidth = 2.6 * k; c.lineCap = 'round'; c.stroke(polyPath(s2P(C, spline(tail, 4)), false)); c.restore();
  s2prism(c, C, s2tf(body, x, y, a, M), 14 * fat, P.cap, { seed: 2040 + (x | 0) % 7, step: 8, side: mix(P.cap, P.g2, .45) });
  const zt = 14 * fat;
  for (const s of [-1, 1]) { const e = s2tf([[10 - (fat - 1) * 6, s * 18 * fat]], x, y, a, M)[0]; s2prism(c, C, circPts(e[0], e[1], 9 * M, 14), 2, P.cap, { z0: zt, seed: 2045 + s, step: 5, sh: .15 });
    const [ex, ey] = s2p(C, e[0], e[1], zt + 2); c.fillStyle = P.blush; c.beginPath(); c.arc(ex, ey, 5 * M * k, 0, TAU); c.fill(); }
  const n = s2p(C, ...s2tf([[36 * (1 + (fat - 1) * .45), 0]], x, y, a, M)[0], zt); c.fillStyle = P.blush; c.beginPath(); c.arc(n[0], n[1], 3.4 * k, 0, TAU); c.fill();
  for (const s of [-1, 1]) { const e = s2p(C, ...s2tf([[22, s * 8]], x, y, a, M)[0], zt); c.fillStyle = P.ink; c.strokeStyle = P.ink; c.lineWidth = 1.6 * k;
    if (sleep) { c.beginPath(); c.arc(e[0], e[1] - 1.5 * k, 3 * k, .2, Math.PI - .2); c.stroke(); } else { c.beginPath(); c.arc(e[0], e[1], 2.6 * k, 0, TAU); c.fill(); } }
}
// 纸箱鼠笼：牛皮纸盒（壁厚、内壁明暗、地板上铁丝的影子）。inner(C) 画里面的东西
function s2box(c, C, x, y, w, hh, H, inner, o = {}) {
  const t = 14, out = rectPts(x, y, w, hh), inn = rectPts(x + t, y + t, w - t * 2, hh - t * 2), k = s2k(C, 0);
  s2prism(c, C, out, H, S2C.kraft, { noTop: true, seed: 2050, side: mix(S2C.kraft, P.ink, .25) });
  const fl = s2P(C, inn, 2), top = s2P(C, inn, H);
  c.fillStyle = S2C.kraftIn; c.fill(polyPath(fl)); grain(c, polyPath(fl), .1);
  // 内壁：四面，朝右下的两面（左、上壁的内侧）背光
  const shade = [.3, .12, .05, .22];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; c.fillStyle = mix(S2C.kraft, P.ink, shade[i]); c.fill(polyPath([top[i], top[j], fl[j], fl[i]])); }
  // 左、上壁投在地板上的影子
  c.save(); c.clip(polyPath(fl)); c.fillStyle = 'rgba(50,30,20,.16)'; const off = s2P(C, inn.map(([px, py]) => [px + H * S2LX, py + H * S2LY]), 2);
  c.fill(polyPath([fl[0], fl[1], [fl[1][0], off[1][1]], off[0], [off[3][0], fl[3][1]], fl[3]])); c.restore();
  c.save(); c.clip(polyPath(fl)); inner(C); c.restore();
  // 铁丝盖：一根根细线，和它们落在地板上的影子
  const bars = o.bars ?? 7;
  for (let i = 1; i <= bars; i++) { const bx = x + t + (w - 2 * t) * i / (bars + 1);
    c.save(); c.clip(polyPath(fl)); c.strokeStyle = 'rgba(40,26,22,.18)'; c.lineWidth = 4 * k; c.beginPath(); const sa = s2p(C, bx + H * S2LX, y + H * S2LY, 2), sb = s2p(C, bx + H * S2LX, y + hh + H * S2LY, 2); c.moveTo(...sa); c.lineTo(...sb); c.stroke(); c.restore();
    const a = s2p(C, bx, y, H + 3), b = s2p(C, bx, y + hh, H + 3); c.strokeStyle = P.g3; c.lineWidth = 2.6 * k; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); }
  // 纸盒边沿（顶面是一圈）
  const ring = new Path2D(); ring.addPath(polyPath(s2P(C, out, H))); ring.addPath(polyPath(top.slice().reverse()));
  c.save(); c.fillStyle = mix(S2C.kraft, '#ffffff', .12); c.fill(ring, 'evenodd'); c.restore();
}
function s2cheese(c, C, x, y, a, z0 = 0, s = 1) {
  const pts = s2tf([[-36, -24], [-20, -27], [40, -3], [42, 3], [-20, 27], [-36, 24], [-39, 0]], x, y, a, s);
  const path = s2prism(c, C, pts, 16 * s, S2C.cheese, { z0, seed: 2060 + (x | 0) % 5, step: 8, side: mix(S2C.cheese, P.paperEdge, .6) });
  const k = s2k(C, z0 + 16 * s); c.fillStyle = mix(S2C.cheese, P.paperEdge, .55);
  for (const [u, v, r] of [[-18, -8, 6], [4, 6, 4.5], [-22, 12, 3.5], [16, -2, 3]]) { const [hx, hy] = s2p(C, ...s2tf([[u, v]], x, y, a, s)[0], z0 + 16 * s); c.beginPath(); c.arc(hx, hy, r * k * s, 0, TAU); c.fill(); }
  return path;
}
// 碗（俯视）：一圈碗沿 + 米饭
function s2bowl(c, C, x, y, r = 24, o = {}) { const { al = 1, z0 = 0 } = o; if (al <= 0) return;
  s2prism(c, C, circPts(x, y, r, 28), 12, P.cap, { z0, seed: 2070 + (x | 0) % 11, step: 8, al, side: mix(P.cap, P.g2, .5) });
  const [sx, sy] = s2p(C, x, y, z0 + 12), k = s2k(C, z0 + 12);
  fade(c, al, () => { c.fillStyle = mix(P.cap, P.g1, .45); c.beginPath(); c.arc(sx, sy, r * .72 * k, 0, TAU); c.fill(); c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(sx - 1 * k, sy - 1 * k, r * .58 * k, 0, TAU); c.fill();
    c.strokeStyle = alpha(P.purple, .6); c.lineWidth = 1.6 * k; c.beginPath(); c.arc(sx, sy, r * .88 * k, 0, TAU); c.stroke(); });
}
// 纸飞机（俯视）
function s2plane(c, C, x, y, a, z0) { const pts = s2tf([[46, 0], [-30, -26], [-18, 0], [-30, 26]], x, y, a, 1.7);
  s2prism(c, C, pts, 4, P.stripe, { z0, seed: 2080, step: 8, sh: .22 }); const f0 = s2p(C, ...s2tf([[46, 0]], x, y, a, 1.7)[0], z0 + 4), f1 = s2p(C, ...s2tf([[-18, 0]], x, y, a, 1.7)[0], z0 + 4);
  c.strokeStyle = alpha(P.g2, .8); c.lineWidth = 1.5; c.beginPath(); c.moveTo(...f0); c.lineTo(...f1); c.stroke(); }
// 外卖袋（牛皮纸袋，折口 + 订书钉 + 印了只鸡腿）
function s2bag(c, C, x, y, a, z0 = 0) {
  s2prism(c, C, s2tf(rectPts(-52, -62, 104, 124, 4), x, y, a), 34, S2C.kraft, { z0, seed: 2090, step: 16, side: mix(S2C.kraft, P.ink, .3) });
  const zt = z0 + 34; s2prism(c, C, s2tf(rectPts(-52, -62, 104, 30, 2), x, y, a), 4, mix(S2C.kraft, '#ffffff', .15), { z0: zt, seed: 2091, step: 16, sh: .15 });
  const k = s2k(C, zt), q = s2P(C, s2tf([[-10, 4], [8, -8], [22, 2], [18, 22], [2, 26], [-6, 20], [-22, 30], [-28, 22], [-14, 14]], x, y + 10, a), zt);
  c.strokeStyle = P.ink2; c.lineWidth = 2.4 * k; c.lineJoin = 'round'; c.stroke(polyPath(q));
  const st = s2P(C, s2tf([[-8, -48], [8, -48]], x, y, a), zt + 4); c.strokeStyle = P.g2; c.lineWidth = 2 * k; c.beginPath(); c.moveTo(...st[0]); c.lineTo(...st[1]); c.stroke();
}
// 墨色纸剪的「×」（两根交叉的黑纸条），放在东西上
function s2cross(c, C, x, y, s, z0, t0, t) { const u = clamp((t - t0) / .17, 0, 1); if (u <= 0) return; const zz = z0 + (1 - u) * 120;
  for (const a of [.78, -.78]) s2prism(c, C, s2tf(rectPts(-s / 2, -s * .09, s, s * .18, 2), x, y, a), 2, P.ink, { z0: zz, seed: 2095 + (a > 0 ? 1 : 0), step: 8, sh: .25, gr: .05 }); }
// 杯子：kind water | tea | coffee | milktea | yogurt
function s2cup(c, C, x, y, kind, o = {}) {
  const { s = 1, al = 1, z0 = 0 } = o; if (al <= 0 || s <= .01) return; const r = { water: 34, tea: 30, coffee: 33, milktea: 50, yogurt: 44 }[kind] * s, hh = { water: 54, tea: 26, coffee: 46, milktea: 84, yogurt: 56 }[kind] * s;
  c.save(); c.globalAlpha *= al;
  if (kind === 'tea') s2prism(c, C, circPts(x, y, 46 * s, 36), 4, P.cap, { z0, seed: 2100, step: 10, side: mix(P.cap, P.g2, .4) });
  const z1 = kind === 'tea' ? z0 + 4 : z0;
  if (kind === 'tea' || kind === 'coffee') { const hp = s2tf(rectPts(r - 4, -7, 22 * s, 14, 6), x, y, .5); s2prism(c, C, hp, hh * .6, kind === 'coffee' ? P.g3 : P.cap, { z0: z1 + hh * .2, seed: 2101, step: 6, sh: .15 }); }
  if (kind === 'water') { vellum(c, s2P(C, circPts(x, y, r, 36), z1 + hh), { seed: 2102, shadow: true }); const [sx, sy] = s2p(C, x, y, z1 + hh), k = s2k(C, z1 + hh);
    c.strokeStyle = alpha('#ffffff', .8); c.lineWidth = 2.5 * k; c.beginPath(); c.arc(sx, sy, r * .8 * k, Math.PI * 1.1, Math.PI * 1.5); c.stroke(); c.strokeStyle = alpha(P.blue, .25); c.lineWidth = 1.5 * k; c.beginPath(); c.arc(sx, sy, r * .62 * k, 0, TAU); c.stroke(); c.restore(); return; }
  const body = { tea: P.cap, coffee: P.g3, milktea: alpha(P.cap, 1), yogurt: P.cap }[kind];
  s2prism(c, C, circPts(x, y, r, 40), hh, body, { z0: z1, seed: 2103 + kind.length, step: 10, side: mix(body, P.ink, .3) });
  const zt = z1 + hh, [sx, sy] = s2p(C, x, y, zt), k = s2k(C, zt);
  if (kind === 'tea' || kind === 'coffee') { c.fillStyle = kind === 'tea' ? S2C.tea : S2C.coffee; c.beginPath(); c.arc(sx, sy, r * .8 * k, 0, TAU); c.fill(); c.strokeStyle = alpha('#ffffff', .35); c.lineWidth = 2 * k; c.beginPath(); c.arc(sx - 3 * k, sy - 3 * k, r * .45 * k, Math.PI, Math.PI * 1.5); c.stroke(); }
  if (kind === 'milktea') { c.fillStyle = S2C.milktea; c.beginPath(); c.arc(sx, sy, r * .86 * k, 0, TAU); c.fill(); c.fillStyle = P.ink2; for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = (i % 3 + 1) * .24 * r * k; c.beginPath(); c.arc(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, 5 * k * s, 0, TAU); c.fill(); }
    vellum(c, circPts(sx, sy, r * .95 * k, 36), { seed: 2104, shadow: false }); s2prism(c, C, circPts(x + 12 * s, y - 10 * s, 9 * s, 14), 60 * s, P.purple, { z0: zt, seed: 2105, step: 5, sh: .2 }); }
  if (kind === 'yogurt') { c.fillStyle = mix(P.g1, '#ffffff', .4); c.beginPath(); c.arc(sx, sy, r * .9 * k, 0, TAU); c.fill(); c.strokeStyle = alpha(P.g2, .6); c.lineWidth = 1.2 * k; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(sx, sy, r * (.3 + i * .12) * k, 0, TAU); c.stroke(); }
    zh(c, '无糖', sx, sy + 9 * k, { size: 26 * k, align: 'center', color: P.ink2 }); }
  c.restore();
}
// 勺子（悬在空中 z0）：(x, y) 是勺头中心，勺柄朝局部 -x；sugar 0..1 勺里剩多少糖；roll 0..1 绕长轴翻过去倒糖（俯拍看勺面变窄、变暗）
function s2spoon(c, C, x, y, a, z0, sugar = 1, roll = 0) {
  const w = 1 - .6 * roll, steel = mix(S2C.steel, P.ink, .22 * roll);
  s2prism(c, C, s2tf([[-22, -5], [-122, -6], [-128, 0], [-122, 6], [-22, 5]], x, y, a, 1, w), 3, steel, { z0, seed: 2110, step: 8, sh: .2 });
  s2prism(c, C, s2tf(ellPts(0, 0, 30, 21, 20), x, y, a, 1, w), 4, steel, { z0, seed: 2111, step: 8, sh: .2 });
  if (sugar > 0) { const r = rng(2112); for (let i = 0; i < 14 * sugar; i++) { const u = (r() - .5) * 34, v = (r() - .5) * 24 * w; s2prism(c, C, s2tf(rectPts(-4, -4, 8, 8), ...s2tf([[u, v]], x, y, a)[0], r() * 2), 5, '#f7f3ea', { z0: z0 + 4, seed: 2113 + i, step: 4, sh: .12, gr: 0 }); } }
}
// 发酵罐：玻璃罐身、布盖（荷叶边）+ 一圈扎口的线；tip 0..1 侧倒（口朝左）
function s2jar(c, C, x, y, o = {}) {
  const { lid = 1, lidX = 0, lidY = 0, tip = 0, fill = P.green } = o, r = 62;
  if (tip < .5) { s2prism(c, C, circPts(x, y, r, 40), 74, mix(P.cap, P.g1, .3), { seed: 2120, step: 12, side: mix(P.g1, P.green, .25), al: 1 });
    const [sx, sy] = s2p(C, x, y, 74), k = s2k(C, 74);
    c.fillStyle = mix(fill, P.g1, .35); c.beginPath(); c.arc(sx, sy, r * .8 * k, 0, TAU); c.fill(); c.fillStyle = mix(fill, P.ink, .15);
    for (let i = 0; i < 7; i++) { const a = i * 2.1, rr = (i % 3) * 14 * k; c.beginPath(); c.ellipse(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, 11 * k, 6 * k, a, 0, TAU); c.fill(); } }
  else { const L = 170, body = s2tf(rectPts(-L / 2, -r, L, r * 2, r * .7), x, y, 0); s2prism(c, C, body, 60, mix(P.cap, P.g1, .3), { seed: 2121, step: 12, side: mix(P.g1, P.green, .25) });
    const m = s2p(C, x - L / 2 + 6, y, 60), k = s2k(C, 60); c.fillStyle = mix(fill, P.ink, .2); c.beginPath(); c.ellipse(m[0], m[1], 14 * k, r * .8 * k, 0, 0, TAU); c.fill(); }
  if (lid > 0) { const lx = x + lidX, ly = y + lidY, pts = []; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; pts.push([lx + Math.cos(a) * (r - 2 + 4 * Math.sin(a * 12)), ly + Math.sin(a) * (r - 2 + 4 * Math.sin(a * 12))]); }
    s2prism(c, C, pts, 3, P.stripe, { z0: lidX || lidY ? 0 : 74, seed: 2122, step: 8, sh: .2 });
    const [sx, sy] = s2p(C, lx, ly, (lidX || lidY ? 0 : 74) + 3), k = s2k(C, 77); c.strokeStyle = P.purple; c.lineWidth = 3 * k; c.beginPath(); c.arc(sx, sy, (r - 16) * k, 0, TAU); c.stroke(); }
}

// ===================== 衍纸肠道 =====================
// 一条弯来弯去的纸槽：粉色纸边立着（衍纸），槽底一条白纸。局部坐标（工位 D）
const S2GUT = (() => { const pts = [], R = 90, arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 18; i++) { const a = lerp(a0, a1, i / 18); pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); } };
  pts.push([900, 240], [250, 240]); arc(250, 330, -Math.PI / 2, -Math.PI * 1.5); pts.push([800, 420]); arc(800, 510, -Math.PI / 2, Math.PI / 2); pts.push([250, 600]); arc(250, 690, -Math.PI / 2, -Math.PI * 1.5); pts.push([905, 780]);
  const q = s2arc(pts, 420), L = pathLen(q); return { q, L, l: s2offset(q, -38), r: s2offset(q, 38) }; })();
function s2gutAt(s, lat = 0) { const n = S2GUT.q.length, f = clamp(s / S2GUT.L, 0, 1) * (n - 1), i = Math.min(n - 2, Math.floor(f)), u = f - i, a = S2GUT.q[i], b = S2GUT.q[i + 1], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
  return [lerp(a[0], b[0], u) - ty / l * lat, lerp(a[1], b[1], u) + tx / l * lat, Math.atan2(ty, tx)]; }
// 小菌：衍纸卷（coil）、小球、杆、泪滴、链、圈
const S2BUGT = ['coil', 'ball', 'rod', 'tear', 'chain', 'ring', 'coil', 'rod'];
const S2BUGC = [P.purple, P.g2, P.green, P.g3, P.stripe, P.hairDark, P.paperEdge, P.purple];
function s2bug(c, C, x, y, a, type, col, s = 1, seed = 1) {
  if (s <= .01) return; const k = s2k(C, 6);
  if (type === 'ball') { s2prism(c, C, circPts(x, y, 9 * s, 12), 6, col, { seed, step: 5, sh: .2, gr: 0 }); return; }
  if (type === 'rod') { s2prism(c, C, s2tf(rectPts(-15, -6, 30, 12, 6), x, y, a, s), 6, col, { seed, step: 5, sh: .2, gr: 0 }); return; }
  if (type === 'tear') { s2prism(c, C, s2tf([[-10, 0], [-6, -8], [2, -9], [14, 0], [2, 9], [-6, 8]], x, y, a, s), 6, col, { seed, step: 5, sh: .2, gr: 0 }); return; }
  if (type === 'chain') { for (const u of [-13, 0, 13]) s2prism(c, C, circPts(...s2tf([[u, 0]], x, y, a, s)[0], 6 * s, 10), 6, col, { seed: seed + u, step: 4, sh: .2, gr: 0 }); return; }
  // coil / ring：衍纸卷——一条纸边卷成的螺旋（或空心圈）
  s2prism(c, C, circPts(x, y, 11 * s, 16), 6, mix(col, '#ffffff', .25), { seed, step: 5, sh: .2, gr: 0 });
  const [sx, sy] = s2p(C, x, y, 6); c.strokeStyle = mix(col, P.ink, .2); c.lineWidth = 1.6 * k; c.beginPath();
  if (type === 'ring') c.arc(sx, sy, 6 * s * k, 0, TAU); else for (let i = 0; i <= 30; i++) { const th = i / 30 * TAU * 2.3 + a, rr = (1.5 + i / 30 * 8.5) * s * k; i ? c.lineTo(sx + Math.cos(th) * rr, sy + Math.sin(th) * rr) : c.moveTo(sx + Math.cos(th) * rr, sy + Math.sin(th) * rr); }
  c.stroke();
}
// 炎症：金色小纸火苗
function s2flame(c, C, x, y, s, t, seed) { if (s <= .01) return; const f = Math.floor(t * 12) % 2, w = f ? 1 : .86;
  s2prism(c, C, s2tf([[0, -34], [6 * w, -16], [13, -24 * w], [14, -2], [11, 8], [0, 14], [-11, 8], [-14, -4], [-12, -20 / w], [-5, -12]], x, y, 0, s), 6, P.moon, { seed, step: 5, sh: .25, gr: .05 });
  s2prism(c, C, s2tf([[0, -8], [5, 2], [0, 8], [-5, 2]], x, y + 2, 0, s), 1, mix(P.moon, '#ffffff', .5), { z0: 5, seed: seed + 1, step: 4, sh: 0, gr: 0 }); }

// ===================== 帕秋莉：站在桌上的小剪纸人偶 =====================
// 关键帧：[时刻, { st 工位, x, y（工位内坐标）, pose, facing, look, mood, tilt, dur 走过去用时 }]。位置变了就一跳一跳地走过去（定格）
function s2patK() {
  const E = s2E, T = s2T, a = s2at;
  return [
    [0, { st: 0, x: 1560, y: 870, pose: 'lecture', facing: -1, look: .5 }],
    [a(0, '吃什么') - .1, { pose: 'point', look: .8 }],
    [a(0, '什么时候吃') + .5, { pose: 'lecture', look: .3 }],
    [a(0, '同样重要'), { pose: 'cross', mood: 'smug', look: .6 }],
    [E(0) + .05, { st: 1, x: 1560, pose: 'stand', dur: .95 }],
    [T(1), { pose: 'lecture', look: .6 }],
    [a(1, '一组只在'), { pose: 'point', look: .9 }],
    [T(2) - .1, { pose: 'stand', look: .7 }],
    [a(2, '限时组'), { pose: 'point', look: .9 }],
    [a(2, '更健康') - .3, { x: 1260, pose: 'stand', look: .9, dur: .6 }],
    [a(2, '更健康') + .5, { pose: 'cross', mood: 'smug', look: .5 }],
    [E(2) + .05, { st: 2, x: 1720, pose: 'stand', dur: .95 }],
    [T(3), { pose: 'point', look: .9 }],
    [T(4), { pose: 'lecture', look: .3 }],
    [T(5), { pose: 'cross', mood: 'annoyed', look: -.6 }],
    [a(5, '你懂的') - .35, { x: 1680, pose: 'stand', mood: 'annoyed', look: .9, dur: .4 }],
    [a(5, '你懂的') + .2, { pose: 'point', mood: 'annoyed', look: .9 }],
    [a(5, '你懂的') + .85, { pose: 'cross', mood: 'pout', look: -.5 }],
    [s2E(5) + .1, { x: 1720, pose: 'stand', look: .6, dur: .4 }],
    [T(6), { pose: 'lecture', look: .6 }],
    [a(6, '倒时差') + .3, { pose: 'point', mood: 'annoyed', look: .9 }],
    [T(7) - .1, { pose: 'lecture', look: .4 }],
    [a(7, '不算'), { pose: 'cross', mood: 'smug', look: .4 }],
    [a(7, '就算'), { pose: 'hide', mood: 'flustered', look: .8 }],
    [E(7) + .05, { st: 3, x: 1690, pose: 'stand', dur: 1 }],
    [E(7) + 1.1, { y: 745, pose: 'sit', look: .7, dur: .25 }],
    [a(8, '越多样'), { pose: 'sit', mood: 'smile', look: .8 }],
    [T(9) - .15, { y: 870, x: 1660, pose: 'stand', mood: 'surprised', look: .8, dur: .3 }],
    [a(9, '菌群更多样'), { pose: 'point', look: .9 }],
    [a(9, '炎症') + .4, { pose: 'cross', mood: 'smug', look: .4 }],
    [T(10), { pose: 'lecture', look: .6 }],
    [a(10, '点外卖') - .2, { x: 1650, pose: 'lecture', look: .8, dur: .45 }],
    [a(10, '少点奶茶'), { pose: 'point', mood: 'smug', look: .9 }],
    [E(10) + .05, { st: 4, x: 1400, pose: 'stand', dur: .95 }],
    [T(11), { pose: 'stand', mood: 'normal', look: .5, tilt: .03 }],
    [a(11, '先问医生'), { pose: 'lecture', look: .5 }],
    [a(11, '别硬饿'), { pose: 'stand', mood: 'smile', tilt: .08, look: .3 }],
    [E(11) + .15, { x: 1470, pose: 'stand', mood: 'normal', look: -.4, dur: .3 }],
    [E(11) + .5, { x: 2500, pose: 'stand', mood: 'smug', dur: 1.2 }],
  ];
}
const S2PATK = s2patK();
function s2patAt(t) {
  let cur = { ...S2PATK[0][1] }, prev = cur, t0 = 0;
  for (const [tk, st] of S2PATK) { if (tk > t) break; prev = cur; cur = { ...cur, mood: undefined, tilt: 0, ...st }; t0 = tk; }
  const wx = S2OX[cur.st] + cur.x, px = S2OX[prev.st] + prev.x, d = cur.dur || 0, u = d ? clamp((t - t0) / d, 0, 1) : 1;
  if (u >= 1 || (px === wx && prev.y === cur.y)) return { ...cur, wx, wy: cur.y, hop: 0 };
  const steps = Math.max(1, Math.round(Math.abs(wx - px) / 150)), e = easeIO(u), hop = Math.abs(Math.sin(u * steps * Math.PI)) * (d > .5 ? 26 : 34);
  return { ...cur, pose: d > .5 ? 'stand' : cur.pose, facing: wx > px ? 1 : wx < px ? -1 : cur.facing, wx: lerp(px, wx, e), wy: lerp(prev.y, cur.y, e), hop, walking: true, tilt: (Math.sin(u * steps * Math.PI * 2) * .05) };
}
function s2pat(c, C, t, tau, L) {
  const ent = t < 1.45 ? 0 : t < 1.8 ? (t - 1.45) / .35 : 1; if (ent <= 0) return;
  const s = s2patAt(t), [sx, sy] = s2p(C, s.wx, s.wy, 0), k = s2k(C, 0), hh = 520 * k, sit = s.pose === 'sit';
  if (ent < 1) s.hop += (1 - ent * ent) * 340;
  // 脚下的影子（顶光：一小团，偏右下；跳起来时影子变淡变小）
  const fy = sit ? sy + 150 * k : sy, sa = .3 * Math.max(.2, 1 - s.hop / 60);
  c.save(); c.filter = `blur(${6 * k}px)`; c.fillStyle = `rgba(40,26,22,${sa})`; c.beginPath(); c.ellipse(sx + 16 * k, fy + 6 * k, 70 * k * Math.max(.4, 1 - s.hop / 120), 16 * k, 0, 0, TAU); c.fill(); c.restore();
  const talking = L.talking && L.line;
  drawPatchouli(c, { x: sx, y: sy - s.hop * k, h: hh, pose: s.pose, facing: s.facing ?? -1, look: s.look ?? .5, tilt: s.tilt || 0, mood: s.mood || L.mood || 'normal', mouth: talking ? L.mouth : 0, blink: blinkAt(tau, 2), t: tau, gesture: .55 + .35 * Math.sin(tau * 1.3) });
}

// ===================== 五个工位 =====================
// A：盘子（吃什么）+ 时钟（什么时候吃）+ 筷子摆成的「=」
function s2stA(c, C, t) {
  const ox = S2OX[0], a = s2at;
  // 桌签（页眉）：一张平放的小纸签，月牙 + 页名
  s2prism(c, C, s2tf(rectPts(-200, -46, 400, 92, 4), ox + 290, 150, -.035), 3, P.cap, { seed: 2201, step: 30 });
  { const [sx, sy] = s2p(C, ox + 290, 150, 3), k = s2k(C, 3); c.save(); c.translate(sx, sy); c.rotate(-.035); drawMoonIcon(c, -150 * k, -12 * k, 18 * k, P.moon, -.5); zh(c, '第二页 · 吃饭', -118 * k, 14 * k, { size: 40 * k, color: P.ink2 }); c.restore(); }
  s2plate(c, C, ox + 720, 500, 150);
  // 吃什么：饭团、西兰花、煎蛋一样一样挪上盘子
  const f0 = a(0, '吃什么');
  const rice = s2mv(t, f0 - .15, .35, -260, 0), brc = s2mv(t, f0 + .15, .35, -240, 0), egg = s2mv(t, f0 + .45, .35, 260, 0);
  if (t > f0 - .15) { const x = ox + 668 + rice * .3, y = 470 + rice; [[44, 0], [34, 7], [22, 13]].forEach(([r, z], i) => s2prism(c, C, circPts(x - i * 2, y - i * 3, r, 22), 7, '#f7f3ea', { z0: 8 + z, seed: 2210 + i, step: 7, side: mix(P.cap, P.g1, .6), sh: .2 }));
    s2prism(c, C, s2tf(rectPts(-30, -12, 60, 24, 3), x + 4, y + 26, .1), 3, P.ink2, { z0: 16, seed: 2213, step: 8, sh: .15 }); }
  if (t > f0 + .15) { const x = ox + 790 + brc * -.2, y = 455 - brc * .2; s2prism(c, C, s2tf(rectPts(-6, -4, 30, 12, 5), x + 8, y + 22, .9), 10, mix(P.green, P.g1, .35), { z0: 8, seed: 2220, step: 6, sh: .2 });
    [[0, 0, 18], [-16, 10, 13], [14, 12, 13], [-4, -16, 12], [16, -8, 11]].forEach(([u, v, r], i) => s2prism(c, C, circPts(x + u, y + v, r, 12), 10 + (i % 2) * 4, P.green, { z0: 12, seed: 2221 + i, step: 5, sh: .2 })); }
  if (t > f0 + .45) { const x = ox + 745 + egg * .2, y = 572 + egg * .1; s2prism(c, C, s2tf([[-40, -8], [-22, -30], [8, -34], [36, -18], [40, 10], [22, 30], [-10, 32], [-36, 18]], x, y, .2), 3, '#f7f3ea', { z0: 8, seed: 2230, step: 8, sh: .15 });
    s2prism(c, C, circPts(x + 4, y - 2, 16, 18), 6, P.moon, { z0: 11, seed: 2231, step: 5, sh: .2 }); }
  // 什么时候吃：时钟一顿一顿挪进来，指针转两圈停在 12 点
  const c0 = a(0, '什么时候吃') - .3, cx = s2mv(t, c0, .5, 2150, 1185), sp = s2mv(t, c0 + .3, 1, 0, 1);
  if (t > c0) s2clock(c, C, ox + cx, 500, 118, { h: 16, hands: [lerp(-2.2, 0, sp), lerp(-TAU * 2 + .9, 0, sp)] });
  // 同样重要：两根筷子一根一根落下，摆成「=」
  const e0 = a(0, '同样重要');
  [[478, 0], [522, .22]].forEach(([y, d], i) => { if (t < e0 + d) return; const z = s2drop(t, e0 + d, 200);
    s2prism(c, C, s2tf([[-78, -4.5], [74, -3], [78, 0], [74, 3], [-78, 4.5]], ox + 970, y + i * 2, i * .03 - .015), 7, S2C.kraft, { z0: z, seed: 2240 + i, step: 10, side: mix(S2C.kraft, P.ink, .35) }); });
}
// B：2012 小鼠实验
function s2stB(c, C, t) {
  const ox = S2OX[1], a = s2at, t1 = s2T(1), q0 = a(1, '一组随时'), q1 = a(1, '一组只在'), q8 = a(1, '8 小时'), hf = a(2, '高脂'), hp = a(2, '更健康');
  // 日历纸「2012」
  const cy = s2mv(t, t1 - .1, .4, -200, 0); s2prism(c, C, s2tf(rectPts(-95, -70, 190, 140, 3), ox + 170, 190 + cy, .05), 4, P.cap, { seed: 2301, step: 16 });
  s2prism(c, C, s2tf(rectPts(-95, -70, 190, 30, 2), ox + 170, 190 + cy, .05), 2, P.g3, { z0: 4, seed: 2302, step: 16, sh: .1 });
  s2txt(c, C, '2012', ox + 172, 232 + cy, 6, 58, { align: 'center', color: P.ink });
  const fat = 1 + .55 * sm(hf + .5, hf + 1.4, t), sleep = t > hf + 1.5, run = t > hp - .6;
  // 左笼：随时能吃
  s2box(c, C, ox + 260, 330, 360, 320, 44, CC => {
    const cz = s2drop(t, hf, 240); if (t > hf) s2cheese(c, CC, ox + 360, 440, -.4, cz);
    const mx = ox + 470 - (fat - 1) * 60, my = 520; s2mouse(c, CC, mx, my, 2.8 - (fat - 1) * .6, { fat, sleep, t });
    if (sleep) for (let i = 0; i < 3; i++) { const u = ((t - hf - 1.5) * .7 + i / 3) % 1, [zx, zy] = s2p(CC, mx - 40 + u * 30, my - 50 - u * 60, 60); zh(c, 'z', zx, zy, { size: (18 + u * 16) * s2k(CC, 60), color: P.ink2, al: Math.sin(u * Math.PI) }); } });
  // 右笼：只在 8 小时里吃；吃完绕着笼子跑圈，撒金纸屑
  s2box(c, C, ox + 720, 330, 360, 320, 44, CC => {
    const cz = s2drop(t, hf + .15, 240); if (t > hf + .15) s2cheese(c, CC, ox + 820, 440, .3, cz, t > hp - .6 ? .7 : 1);
    const ang = run ? (t - hp + .6) * 3.2 : 0, rx = ox + 900 + Math.cos(ang) * 95 * (run ? 1 : 0), ry = 490 + Math.sin(ang) * 80 * (run ? 1 : 0);
    if (run) for (let j = 0; j < 26; j++) { const b = hp - .6 + j * .22; if (t < b || t > b + 2.6) continue; const ba = (b - hp + .6) * 3.2, u = clamp((t - b) / .4, 0, 1), bx = ox + 900 + Math.cos(ba) * 95 + (hash(j, 3) - .5) * 30, by = 490 + Math.sin(ba) * 80 + (hash(j, 4) - .5) * 30;
      s2prism(c, CC, s2tf(rectPts(-5, -3, 10, 6), bx, by, hash(j, 5) * 3), 1, P.moon, { z0: Math.sin(u * Math.PI) * 50, seed: 2320 + j, step: 4, sh: .15, gr: 0, al: 1 - sm(b + 2, b + 2.6, t) }); }
    s2mouse(c, CC, run ? rx : ox + 930, run ? ry : 520, run ? ang + Math.PI / 2 : 2.9, { t, run: run ? 1 : 0 }); });
  // 两只 24 小时小钟：左边一整圈都能吃，右边只有 8 小时
  const cL = s2mv(t, q0 - .3, .4, -260, 0), cR = s2mv(t, q1 - .3, .4, -260, 0);
  if (t > q0 - .3) s2clock(c, C, ox + 440, 210 + cL, 70, { h: 10, dial: 24, sector: [0, 24 * sm(q0, q0 + .8, t, easeOut)] });
  if (t > q1 - .3) s2clock(c, C, ox + 900, 210 + cR, 70, { h: 10, dial: 24, sector: [8, 8 * sm(q8 - .3, q8 + .3, t, easeOut)] });
  // 纸条：随时吃 / 8 小时
  if (t > q0 + .2) s2slip(c, C, ox + 440, 720 + s2mv(t, q0 + .2, .35, 200, 0), 190, 64, '随时吃', { size: 38, a: -.02, seed: 2330 });
  if (t > q8 - .1) s2slip(c, C, ox + 900, 722 + s2mv(t, q8 - .1, .35, 200, 0), 210, 76, '8 小时', { size: 54, a: .02, seed: 2331 });
  if (t > hp) { const [sx, sy] = s2p(C, ox + 1050, 716, 2); check(c, sx, sy, 56 * s2k(C, 2), { p: sm(hp, hp + .3, t), seed: 2332 }); }
}
// C：手风琴折页时间带
const S2H = h => 150 + (h - 7) * 75;          // 小时 → 工位 C 里的 x（7:00 → 150，凌晨 1:36 → 1545）
const S2ROW = { y: 470, h: 96, gap: 110 };
function s2strip(c, C, ox, y, o = {}) {
  const { u = 1, day = '', al = 1 } = o, x0 = ox + 100, x1 = ox + S2H(25.6), len = (x1 - x0) * u; if (al <= 0) return;
  c.save(); c.globalAlpha *= al;
  const path = s2prism(c, C, rectPts(x0, y, len, S2ROW.h), 3, P.cap, { seed: 2401 + (y | 0) % 13, step: 40 });
  const k = s2k(C, 3), sy0 = s2p(C, 0, y, 3)[1], sy1 = s2p(C, 0, y + S2ROW.h, 3)[1];
  if (path) { c.save(); c.clip(path);
    // 夜里那一截（24 点以后）是深色纸
    const n0 = s2p(C, ox + S2H(24), 0, 3)[0]; c.fillStyle = P.night2; c.fillRect(n0, sy0 - 2, W, sy1 - sy0 + 4);
    // 折痕：每小时一道，山折谷折交替明暗
    for (let h = 7; h < 25.6; h++) { const xa = s2p(C, ox + S2H(h), 0, 3)[0], xb = s2p(C, ox + S2H(h + 1), 0, 3)[0]; if (h % 2) { c.fillStyle = 'rgba(60,40,30,.025)'; c.fillRect(xa, sy0, xb - xa, sy1 - sy0); }
      c.fillStyle = 'rgba(60,40,30,.09)'; c.fillRect(xa - .5, sy0, 1.2, sy1 - sy0); }
    c.fillStyle = 'rgba(60,40,30,.12)'; const tx = s2p(C, ox + 150, 0, 3)[0]; c.fillRect(tx - 1, sy0, 2, sy1 - sy0);
    c.restore();
    for (const h of [7, 12, 18, 24]) if (ox + S2H(h) + 20 < x0 + len) s2txt(c, C, String(h), ox + S2H(h) + 6, y + 25, 3, 23, { color: h === 24 ? P.g1 : P.ink2 });
    if (day) s2txt(c, C, day, ox + 125, y + S2ROW.h / 2 + 12, 3, 34, { align: 'center', color: P.ink });
  }
  // 还没展开的那一叠（手风琴）
  if (u < 1) { const fx = x0 + len, left = Math.ceil((1 - u) * 25); s2prism(c, C, rectPts(fx - 4, y - 2, 30, S2ROW.h + 4), 4 + left * 1.6, P.cap, { seed: 2409, step: 20, side: mix(P.cap, P.g2, .5), layer: 1.6 }); }
  c.restore();
}
// 一行的遮条（早上 1 小时、睡前 2–3 小时）
function s2covers(c, C, ox, y, t, o = {}) {
  const { m = 1, e = 1, al = 1, eo = 0, eal = 1 } = o; if (al <= 0) return;
  if (m > 0) s2prism(c, C, rectPts(ox + S2H(7) - 3, y - 6 - (1 - m) * 200, S2H(8) - S2H(7) + 3, S2ROW.h + 12, 2), 3, P.g1, { z0: 3, seed: 2420, step: 20, al: al * Math.min(1, m * 3), side: mix(P.g1, P.ink, .3) });
  if (e > 0 && eal > 0) { const dy = -(1 - e) * 200 + eo; c.save(); c.globalAlpha *= eal; vellum(c, s2P(C, rectPts(ox + S2H(21), y - 6 + dy, S2H(22) - S2H(21), S2ROW.h + 12, 2), 6), { seed: 2421, al: al * Math.min(1, e * 3) * 1.2 });
    s2prism(c, C, rectPts(ox + S2H(22), y - 6 + dy, S2H(24) - S2H(22), S2ROW.h + 12, 2), 3, P.g1, { z0: 3, seed: 2422, step: 20, al: al * Math.min(1, e * 3), side: mix(P.g1, P.ink, .3) }); c.restore(); }
}
// 每天三顿饭的时刻（碗）：稳定前各天乱跳，稳定后对齐
const S2MEAL = [9, 12.5, 18.5];
function s2mealOff(i, j, t) {
  const st = s2at(6, '稳定') + i * .16, g = s2at(6, '倒时差');
  let d = (hash(i * 3 + j, 71) - .5) * 3.4 * (i || j !== 1 ? 1 : .7);
  const scatter = sm(s2T(6) + .5 + i * .1, s2T(6) + .8 + i * .1, t, easeOutBack), align = sm(st, st + .3, t, easeOutBack);
  let v = d * scatter * (1 - align);
  if (i === 4) { const px = s2planeX(t), hit = px > S2H(S2MEAL[j]) + 40; if (hit && t < g + 1.95) v += [1.4, -1.1, 1.7][j] * (1 - sm(g + 1.6, g + 1.9, t, easeOutBack)); }
  return v;
}
function s2planeX(t) { const g = s2at(6, '倒时差'); return lerp(-150, 1900, clamp((t - g + .1) / 1.3, 0, 1)); }
function s2stC(c, C, t) {
  const ox = S2OX[2], a = s2at, t3 = s2T(3), t6 = s2T(6), t7 = s2T(7), sg = a(7, '一勺糖'), js = a(7, '就算');
  const u = sm(t3 - .45, t3 + .9, t, x => x);
  // 五天：其余四条从第一条底下抽出来，上下散开成一周；L8 前收回去
  const ex = i => Math.min(sm(t6 + .1 + Math.abs(i - 2) * .08, t6 + .5 + Math.abs(i - 2) * .08, t, easeOut), 1 - sm(t7 - .35 + (4 - i) * .05, t7 + .05 + (4 - i) * .05, t, easeIO));
  const rowY = i => S2ROW.y + (i - 2) * S2ROW.gap * ex(i), y0 = rowY(0), gone = sm(js + .35, js + .7, t, easeIn);
  for (const i of [4, 3, 2, 1, 0]) { const k = ex(i); if (i && k <= 0) continue; const y = rowY(i), day = k > .5 ? '一二三四五'[i] : '';
    s2strip(c, C, ox, y, { u: i ? 1 : u, day });
    if (u >= 1) s2covers(c, C, ox, y, t, { m: sm(a(3, '起床后') - .1, a(3, '起床后') + .35, t, easeOut), e: sm(a(4, '睡前') - .1, a(4, '睡前') + .35, t, easeOut), eo: i === 0 ? -520 * gone : 0, eal: i === 0 ? 1 - gone : 1 });
    // 三顿饭（碗）
    const mt = a(4, '不再进食');
    S2MEAL.forEach((h, j) => { if (t < mt + j * .14) return; const d = s2mealOff(i, j, t), z = s2drop(t, mt + j * .14, 180), hit = i === 4 && s2planeX(t) > S2H(h) + 40 && t < a(6, '倒时差') + 1.9;
      s2bowl(c, C, ox + S2H(h + d), y + 58 + (hit ? [22, -18, 16][j] : 0), 26, { z0: z }); });
  }
  // 太阳、月亮贴纸（贴在第一天那条上）
  if (t > a(3, '起床后') + .3) { const z = s2drop(t, a(3, '起床后') + .3, 160); s2prism(c, C, starPts(ox + S2H(7) + 36, y0 - 26, 30, 10, .62), 3, P.moon, { z0: z, seed: 2430, step: 5, sh: .25 }); s2prism(c, C, circPts(ox + S2H(7) + 36, y0 - 26, 17, 16), 2, mix(P.moon, '#ffffff', .25), { z0: z + 3, seed: 2431, step: 5, sh: 0 }); }
  if (t > a(4, '睡前') + .3) { const z = s2drop(t, a(4, '睡前') + .3, 160); s2prism(c, C, crescentPts(ox + S2H(24.9), y0 + 54, 24, -.5, 48), 3, P.moon, { z0: z, seed: 2432, step: 5, sh: .25 }); }
  // 纸条：1 小时 / 2–3 小时（五天那句收走）
  const slipA = 1 - sm(t6 - .2, t6 + .1, t);
  if (t > a(3, '1 小时') - .1 && slipA > 0) s2slip(c, C, ox + S2H(7.5) + 20, y0 - 110 - (1 - slipA) * 400 + s2mv(t, a(3, '1 小时') - .1, .35, -260, 0), 170, 70, '1 小时', { size: 46, a: -.03, seed: 2440 });
  if (t > a(4, '2 到 3') - .1 && slipA > 0) s2slip(c, C, ox + S2H(22.5), y0 - 110 - (1 - slipA) * 400 + s2mv(t, a(4, '2 到 3') - .1, .35, -260, 0), 230, 70, '2–3 小时', { size: 46, a: .025, seed: 2441 });
  // 凌晨一点：炸鸡外卖从天而降落在夜里那截上，盖一个墨色 ×，被帕秋莉一脚踢出桌外
  const bt = a(5, '炸鸡') - .2, bk = a(5, '你懂的') + .3;
  if (t > bt && t < bk + 1) { const z = s2drop(t, bt, 420, .4), fly = sm(bk, bk + .5, t, easeIn), x = ox + S2H(25) + fly * 900, y = y0 + 40 - fly * 700 + Math.sin(fly * Math.PI) * -100;
    s2bag(c, C, x, y, .12 + fly * 4, z + fly * 200); if (fly <= 0) s2cross(c, C, x, y + 10, 96, z + 38, a(5, '嗯'), t); }
  // 倒时差：一架纸飞机从第五天上面掠过，把碗撞歪
  const px = s2planeX(t); if (px > -140 && px < 1880) s2plane(c, C, ox + px, rowY(4) + 40 + Math.sin(px / 180) * 24, .12 * Math.cos(px / 180), 70);
  // 饮料：白水、茶、黑咖啡立在睡前那段上方；一勺糖倒进咖啡
  const dA = 1 - sm(s2E(7) + .05, s2E(7) + .35, t), cy = y0 - 86 - (1 - dA) * 500;
  [['water', a(7, '白水'), 1236], ['tea', a(7, '茶'), 1330], ['coffee', a(7, '不加糖'), 1428]].forEach(([k, t0, x], i) => { if (t < t0 - .15) return;
    s2cup(c, C, ox + x, cy, k, { z0: s2drop(t, t0 - .15, 200) });
    const ck = a(7, '不算') + i * .15, [sx, sy] = s2p(C, ox + x, cy - 92, 0);
    if (t > ck && !(k === 'coffee' && t > js)) check(c, sx, sy, 50, { p: sm(ck, ck + .25, t), seed: 2450 + i }); });
  // 勺子从右上方飞来，勺头停在咖啡杯正上方（勺柄朝来的方向），绕长轴一翻，糖从勺头落进杯里，再原路飞走
  if (t > sg - .5 && dA > 0) { const u2 = s2mv(t, sg - .5, .5, 0, 1), tilt = sm(sg + .2, sg + .5, t), away = sm(js + .6, js + 1, t, easeIn), sx = ox + 1428;
    const kz = s2k(C, 46) / s2k(C, 110), rx = C.x + (sx - C.x) * kz, ry = C.y + (cy - C.y) * kz;   // 勺子高 110：按透视往回收，画面上正对杯口
    s2spoon(c, C, rx + lerp(320, 0, u2) + away * 300, ry + lerp(-300, 0, u2) - away * 300, 2.44, 110, 1 - tilt, tilt);
    for (let j = 0; j < 8; j++) { const b = sg + .3 + j * .03, v = clamp((t - b) / .3, 0, 1), e = easeIn(v); if (v <= 0) continue; s2prism(c, C, s2tf(rectPts(-4, -4, 8, 8), lerp(rx, sx, e) + (hash(j, 8) - .5) * 30, lerp(ry, cy, e) + (hash(j, 9) - .5) * 26, j), 3, '#f7f3ea', { z0: lerp(110, 46, e), seed: 2460 + j, step: 4, sh: .12, gr: 0 }); }
    if (t > js) s2cross(c, C, ox + 1428, cy, 70, 60, js, t); }
}
// D：衍纸肠道 + 小菌 + 发酵食品
function s2stD(c, C, t) {
  const ox = S2OX[3], a = s2at, t8 = s2T(8), t9 = s2T(9), t10 = s2T(10), jf = a(9, '发酵'), ya = a(8, '小居民'), dv = a(8, '越多样'), yz = a(9, '炎症');
  const build = sm(t8 - .2, t8 + 1.2, t, x => x), n = Math.max(2, Math.floor(build * S2GUT.q.length)), wg = pts => pts.slice(0, n).map(([x, y]) => [ox + x, y]);
  const dim = 1 - .45 * sm(s2E(10) + .05, s2E(10) + .6, t);
  c.save(); c.globalAlpha *= dim;
  // 槽底一条白纸 + 两道粉色衍纸边
  if (build > 0) { const band = wg(S2GUT.l).concat(wg(S2GUT.r).reverse()); s2prism(c, C, band, 2, mix(P.cap, P.blush, .12), { seed: 2501, step: 40, sh: .15 });
    s2wall(c, C, wg(S2GUT.l), 24, S2C.gut); s2wall(c, C, wg(S2GUT.r), 24, S2C.gut); }
  // 炎症：五朵金色小火苗，菌多了一朵朵熄掉
  [300, 1000, 1500, 2150, 2800].forEach((s, j) => { const on = sm(t9 + .3 + j * .12, t9 + .45 + j * .12, t, easeOutBack), off = sm(yz + j * .18, yz + .2 + j * .18, t); if (on <= 0) return; const [x, y] = s2gutAt(s, (j % 2 ? 1 : -1) * 12);
    s2flame(c, C, ox + x, y, on * (1 - off), t, 2510 + j);
    if (off > 0 && off < 1 || (t > yz + j * .18 && t < yz + j * .18 + .9)) { const v = clamp((t - yz - j * .18) / .9, 0, 1), [sx, sy] = s2p(C, ox + x, y - v * 40, 20); c.strokeStyle = alpha(P.g2, .7 * (1 - v)); c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 16; i++) { const th = i / 16 * TAU * 1.5, rr = 3 + i * .8; c.lineTo(sx + Math.cos(th) * rr, sy + Math.sin(th) * rr); } c.stroke(); } });
  // 小菌：先 8 个一样的小灰球，「越多样」时一个个换成不同的样子（替换动画），发酵罐倒进来更多
  for (let k0 = 0; k0 < 40; k0++) {
    const old = k0 < 8, born = old ? ya + k0 * .09 : jf + .35 + (k0 - 8) * .09; if (t < born) continue;
    const type = old && t < dv + k0 * .07 ? 'ball' : S2BUGT[(k0 * 5 + 3) % S2BUGT.length], col = old && t < dv + k0 * .07 ? P.g2 : S2BUGC[(k0 * 3 + 1) % S2BUGC.length];
    const s0 = 120 + hash(k0, 21) * (S2GUT.L - 240), lat = (hash(k0, 22) - .5) * 40;
    let s, zz = 0, x, y, ang;
    if (old) { s = (s0 + (t - born) * 9) % S2GUT.L; [x, y, ang] = s2gutAt(s, lat); }
    else { const v = (t - born) / .45; if (v < 1) { x = lerp(1040, 900, v); y = lerp(255, 240, v) + (hash(k0, 23) - .5) * 30; zz = Math.sin(v * Math.PI) * 70; ang = hash(k0, 24) * 6; }
      else { s = Math.min(s0, (t - born - .45) * 520) + Math.max(0, t - born - .45 - s0 / 520) * 9; [x, y, ang] = s2gutAt(s, lat * Math.min(1, (t - born - .45) * 3)); } }
    const pop = old ? sm(born, born + .2, t, easeOutBack) * (t > dv + k0 * .07 && t < dv + k0 * .07 + .17 ? 1.35 : 1) : 1;
    c.save(); if (zz) { c.globalAlpha *= 1; } s2bug(c, C, ox + x, y, ang + t * .3 * (k0 % 2 ? 1 : -1), type, col, pop, 2520 + k0); c.restore();
  }
  c.restore();
  // 纸条：菌群 / 多样 ✓ / 炎症 ↓
  const sa = 1 - sm(t10 - .3, t10, t);
  if (t > a(8, '菌群') - .1 && sa > 0) s2slip(c, C, ox + 1150, 460 + s2mv(t, a(8, '菌群') - .1, .35, 260, 0) - (1 - sa) * 600, 180, 82, '菌群', { size: 56, a: -.03, seed: 2560 });
  if (t > dv && sa > 0) { s2slip(c, C, ox + 1150, 565 + s2mv(t, dv, .35, 260, 0) - (1 - sa) * 600, 150, 64, '多样', { size: 40, a: .02, seed: 2561, ox: -16 }); const [sx, sy] = s2p(C, ox + 1195, 562 - (1 - sa) * 600, 2); if (t > dv + .35) check(c, sx, sy, 40, { p: sm(dv + .35, dv + .6, t), seed: 2562 }); }
  if (t > yz - .1 && sa > 0) { s2slip(c, C, ox + 1150, 668 + s2mv(t, yz - .1, .35, 260, 0) - (1 - sa) * 600, 170, 66, '炎症', { size: 40, a: -.02, seed: 2563, ox: -20 }); const [sx, sy] = s2p(C, ox + 1205, 668 - (1 - sa) * 600, 2);
    if (t > yz + .35) arrow(c, [sx, sy - 22], [sx, sy + 20], { w: 4, head: 11, color: P.green, p: sm(yz + .35, yz + .6, t), seed: 2564 }); }
  // 发酵罐（泡菜）：掀布盖、侧倒、把一群五花八门的小菌倒进肠道；L11 扶正，挪去和酸奶、纳豆排一排
  const lidOff = s2mv(t, jf - .5, .35, 0, 1), tip = t > jf - .15 && t < t10 - .2 ? 1 : 0, jx = s2mv(t, t10 - .2, .4, 1140, 1265), jy = s2mv(t, t10 - .2, .4, 250, 250);
  if (t > t9 - .4) { const z = s2drop(t, t9 - .4, 220); c.save(); if (z) c.translate(0, 0);
    s2jar(c, C, ox + jx + (tip ? 20 : 0), jy, { lid: t < t10 - .2 ? 1 : 0, lidX: lidOff * 140, lidY: lidOff * -90, tip });
    c.restore(); if (t < jf) s2slip(c, C, ox + 1140, 350, 110, 50, '发酵', { size: 30, a: .08, seed: 2570, al: 1 - sm(jf - .5, jf - .2, t) }); }
  // 无糖酸奶、泡菜、纳豆 ✓；外卖盒加蔬菜粗粮；奶茶缩小
  const yo = a(10, '无糖酸奶'), pc = a(10, '泡菜'), nd = a(10, '纳豆'), tk = a(10, '点外卖'), vg = a(10, '蔬菜粗粮'), mt = a(10, '少点奶茶');
  if (t > yo - .2) s2cup(c, C, ox + 1085, 250, 'yogurt', { z0: s2drop(t, yo - .2, 200) });
  if (t > nd - .2) { const z = s2drop(t, nd - .2, 200); s2prism(c, C, rectPts(ox + 1395, 200, 100, 96, 6), 26, P.cap, { z0: z, seed: 2580, step: 12 }); const [sx, sy] = s2p(C, ox + 1445, 248, z + 26), k = s2k(C, z + 26);
    c.fillStyle = mix(P.paperEdge, P.ink2, .3); for (let i = 0; i < 16; i++) { c.beginPath(); c.ellipse(sx + (hash(i, 31) - .5) * 64 * k, sy + (hash(i, 32) - .5) * 60 * k, 7 * k, 5.5 * k, hash(i, 33) * 3, 0, TAU); c.fill(); }
    c.strokeStyle = alpha('#ffffff', .7); c.lineWidth = .8 * k; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(sx + (hash(i, 34) - .5) * 60 * k, sy + (hash(i, 35) - .5) * 50 * k); c.quadraticCurveTo(sx, sy - 30 * k, sx + (hash(i, 36) - .5) * 60 * k, sy + (hash(i, 37) - .5) * 50 * k); c.stroke(); } }
  [[yo, 1085], [pc, 1265], [nd, 1445]].forEach(([t0, x], i) => { const ck = t0 + .5; if (t < ck) return; const [sx, sy] = s2p(C, ox + x, 130, 0); check(c, sx, sy, 50, { p: sm(ck, ck + .25, t), seed: 2590 + i }); });
  if (t > tk - .2) { const z = s2drop(t, tk - .2, 200), bxx = ox + 1040, byy = 470;
    s2prism(c, C, rectPts(bxx, byy, 260, 170, 6), 34, P.cap, { z0: z, seed: 2600, step: 14, noTop: false });
    const zt = z + 34, k = s2k(C, zt), q = s2P(C, rectPts(bxx + 10, byy + 10, 240, 150), zt); c.fillStyle = mix(P.cap, P.g1, .4); c.fill(polyPath(q));
    const dvd = s2P(C, [[bxx + 130, byy + 8], [bxx + 130, byy + 162]], zt); c.strokeStyle = P.cap; c.lineWidth = 6 * k; c.beginPath(); c.moveTo(...dvd[0]); c.lineTo(...dvd[1]); c.stroke();
    for (let i = 0; i < 6; i++) s2prism(c, C, ellPts(bxx + 40 + (i % 3) * 32, byy + 50 + Math.floor(i / 3) * 60, 18, 13, 12, i), 8, mix(P.paperEdge, P.moon, .3), { z0: zt, seed: 2605 + i, step: 5, sh: .15 });
    for (let i = 0; i < 9; i++) { const b = vg - .1 + i * .08; if (t < b) continue; const zz = zt + s2drop(t, b, 160, .3), x = bxx + 160 + (i % 3) * 32 + (hash(i, 41) - .5) * 10, y = byy + 38 + Math.floor(i / 3) * 44;
      if (i % 2 === 0) s2prism(c, C, s2tf([[-18, 0], [-6, -10], [14, -8], [20, 0], [14, 8], [-6, 10]], x, y, hash(i, 42) * 3), 4, P.green, { z0: zz, seed: 2610 + i, step: 5, sh: .15 });
      else for (let g = 0; g < 4; g++) s2prism(c, C, ellPts(x + (g % 2) * 12 - 6, y + (g > 1 ? 8 : -8), 6, 4, 8, g), 3, mix(P.paperEdge, P.cap, .3), { z0: zz, seed: 2620 + i * 4 + g, step: 3, sh: .12, gr: 0 }); } }
  if (t > tk) { const s = t < mt + .1 ? 1 : t < mt + .2 ? .8 : t < mt + .3 ? .58 : .62; s2cup(c, C, ox + 1420, 700, 'milktea', { s, z0: s2drop(t, tk, 200) }); }
  // 帕秋莉坐的那摞书
  if (t > t8 - .5 && t < t9 + .5) { const al = 1 - sm(t9 - .1, t9 + .3, t); [[P.g3, 0, 60], [P.paperEdge, .06, 40], [P.purple, -.04, 20]].forEach(([col, rot, z], i) => s2prism(c, C, s2tf(rectPts(-110, -70, 220, 140, 5), ox + 1690, 790 - i * 6, rot), 20, col, { z0: 40 - z + 0, seed: 2630 + i, step: 20, al })); }
}
// E：折起来的便条 + 桌布上的缝线（出场）
function s2stE(c, C, t) {
  const ox = S2OX[4], a = s2at, t11 = s2T(11), e11 = s2E(11), pull = sm(e11 + .55, S2DUR - .85, t, easeIO);
  // 缝线：一段段穿进桌布的平针线，被拉直
  const pt = s2patAt(t), drag = t > e11 + .45, x0 = ox + 30, x1 = drag ? Math.min(ox + 2600, pt.wx + 10) : ox + 2600, yy = S2END.y, k = s2k(C, 0);
  if (drag && pull < 1) { const f = s2p(C, x1, yy), hp = s2p(C, pt.wx, pt.wy), kk = s2k(C, 0); c.save(); c.strokeStyle = S2C.thread; c.lineWidth = 3 * kk; c.lineCap = 'round'; c.beginPath(); c.moveTo(...f); c.quadraticCurveTo(f[0] - 10 * kk, hp[1] - 120 * kk, hp[0] - 14 * kk, hp[1] - (210 + pt.hop) * kk); c.stroke(); c.restore(); }
  if (pull >= 1) { const sy = s2p(C, 0, yy)[1]; rline(c, [[-20, sy], [W + 20, sy]], { w: 3, color: S2C.thread, seed: 2002, amp: .3 }); }
  else { const a0 = s2p(C, x0, yy), a1 = s2p(C, x1, yy), w = lerp(3 * k, 3, pull), dash = 36 * k, gap = 22 * k * (1 - pull);
    c.save(); c.strokeStyle = S2C.thread; c.lineWidth = w; c.lineCap = 'round'; if (gap > .5) c.setLineDash([dash, gap]); c.lineDashOffset = -pull * 400 * k;
    c.beginPath(); c.moveTo(a0[0], a0[1]); for (let i = 1; i <= 60; i++) { const u = i / 60, wx = lerp(x0, x1, u), wy = yy + Math.sin(u * 40) * 3 * (1 - pull); const p = s2p(C, wx, wy); c.lineTo(p[0], p[1]); } c.stroke(); c.restore();
    if (gap > .5) { c.save(); c.globalAlpha = (1 - pull) * .5; c.strokeStyle = 'rgba(60,40,30,.25)'; c.lineWidth = 1; for (let wx = x0; wx < x1; wx += 58) { const p = s2p(C, wx - 11, yy); c.beginPath(); c.arc(p[0], p[1], 1.6 * k, 0, TAU); c.stroke(); } c.restore(); } }
  // 便条：折成四分之一的一张纸，一顿一顿打开
  const n0 = t11 - .2, o1 = sm(n0 + .3, n0 + .55, t, easeOut), o2 = sm(n0 + .7, n0 + .95, t, easeOut), nx = ox + 800, ny = 420, nw = 580, nh = 420, fa = 1 - sm(e11 + .15, e11 + .5, t);
  if (t > n0 && fa > 0) { const z = s2drop(t, n0, 220), w = nw * lerp(.5, 1, o1), hh = nh * lerp(.5, 1, o2);
    c.save(); c.globalAlpha *= 1; const lift = (1 - fa) * -700;
    s2prism(c, C, rectPts(nx - w / 2, ny - hh / 2 + lift, w, hh, 3), 3, P.cap, { z0: z, seed: 2701, step: 26 });
    // 折痕
    const kk = s2k(C, z + 3), m0 = s2p(C, nx, ny - hh / 2 + lift, z + 3), m1 = s2p(C, nx, ny + hh / 2 + lift, z + 3), h0 = s2p(C, nx - w / 2, ny + lift, z + 3), h1 = s2p(C, nx + w / 2, ny + lift, z + 3);
    c.strokeStyle = 'rgba(60,40,30,.18)'; c.lineWidth = 1.5 * kk; if (o1 > .9) { c.beginPath(); c.moveTo(...m0); c.lineTo(...m1); c.stroke(); } if (o2 > .9) { c.beginPath(); c.moveTo(...h0); c.lineTo(...h1); c.stroke(); }
    if (o2 >= 1) {
      const cz = z + 3; s2prism(c, C, [[-10, -34], [10, -34], [10, -10], [34, -10], [34, 10], [10, 10], [10, 34], [-10, 34], [-10, 10], [-34, 10], [-34, -10], [-10, -10]].map(([u, v]) => [nx - 190 + u * 1.25, ny - 56 + lift + v * 1.25]), 3, P.green, { z0: cz, seed: 2710, step: 8, sh: .2 });
      s2txt(c, C, '胃不好', nx - 120, ny - 80 + lift, cz, 50, { color: P.ink, p: writeP(t, n0 + 1, '胃不好', .08) });
      s2txt(c, C, '有进食困扰', nx - 120, ny + 2 + lift, cz, 50, { color: P.ink, p: writeP(t, a(11, '进食方面'), '有进食困扰', .08) });
      s2txt(c, C, '→ 先问医生', nx - 210, ny + 128 + lift, cz, 60, { color: P.ink, p: writeP(t, a(11, '先问医生'), '→ 先问医生', .08) });
      if (t > a(11, '先问医生') + .5) { const u0 = s2p(C, nx - 150, ny + 148 + lift, cz), u1 = s2p(C, nx + 200, ny + 148 + lift, cz); rline(c, [u0, u1], { w: 3, color: P.green, p: sm(a(11, '先问医生') + .5, a(11, '先问医生') + .8, t), seed: 2711 }); } }
    c.restore(); }
  // 别硬饿：一只小饭团被推到便条旁边
  const og = a(11, '别硬饿'); if (t > og && fa > 0) { const x = ox + s2mv(t, og, .45, 1300, 1080), y = 590 - (1 - fa) * 700;
    s2prism(c, C, [[0, -46], [30, -30], [46, 22], [34, 40], [-34, 40], [-46, 22], [-30, -30]].map(([u, v]) => [x + u, y + v]), 16, '#f7f3ea', { seed: 2720, step: 8, side: mix(P.cap, P.g1, .6) });
    s2prism(c, C, rectPts(x - 26, y + 8, 52, 34, 3), 2, P.ink2, { z0: 16, seed: 2721, step: 8, sh: .12 }); }
}

scene({ order: 2, key: 'diet', title: '吃饭', dur: S2DUR, lines: S2LINES, noFlip: true,
  fn(c, tau, L) {
    // 进场：前 0.2 秒只画交接圆盘；出场：最后 0.2 秒只画交接线
    if (tau < .2) { handoffDisc(c); return; }
    if (tau > S2DUR - .2) { handoffThread(c); return; }
    const t = twos(tau), C = s2cam(t), endK = sm(S2DUR - 1.4, S2DUR - .8, t);
    s2cloth(c, C, 1 - endK);
    for (const [i, f] of [[0, s2stA], [1, s2stB], [2, s2stC], [3, s2stD], [4, s2stE]]) { const [lx] = s2p(C, S2OX[i], 0), [rx] = s2p(C, S2OX[i] + 1920, 0); if (rx < -300 || lx > W + 300) continue; f(c, C, t); }
    s2pat(c, C, t, tau, L);
    // 开灯：夜色慢慢退去，圆盘（盘子）先留着
    const dark = 1 - sm(.2, 1.1, t);
    if (dark > 0) { c.save(); c.globalAlpha = dark; c.fillStyle = NIGHT_BG; c.fillRect(0, 0, W, H); const [px, py] = s2p(C, 720, 500, 0), k = s2k(C, 0);
      cutPaper(c, circPts(px, py, 150 * k, 72), '#ede6d6', { seed: 2001, step: 26, blur: 20, sx: 0, sy: 6 }); c.restore(); }
    // 定格动画的曝光闪动（极轻）
    if (tau > 1.2 && tau < S2DUR - 1) { const f = Math.floor(tau * 12); c.fillStyle = `rgba(30,20,10,${hash(f, 91) * .025})`; c.fillRect(0, 0, W, H); }
  } });
