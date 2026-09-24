'use strict';
// 第 6 段：总结（第二版，魔导书「漫步」主题回归，见 docs/画风v2.md、docs/分镜v2.md 第 6 节）。
//   L1：书页哗哗翻过五页，每页一闪而过前面五幅「画」的缩影（灯箱、桌面、线轨、星图、立体书），停在空白跨页。
//   L2–L5：四件东西像压花一样从空中落下、压进左页，贴两条硫酸纸胶带，手写一条、金色打勾：
//          剪纸月亮「睡够、睡好」、被划掉的香烟「不吸烟」、一只鞋（蹦着进来）「每天动一动」、被划掉的方糖「少吃糖」。
//   L6：四件东西依次轻轻跳一下；「剩下的慢慢调」时左页底爬出一只墨线蜗牛。
//   L7：帕秋莉从书里抽出一张折起的纸条，钉在右页、展开：小红十字「科普 ≠ 诊断」「不舒服去校医院」。
//   L8：鞠躬「下课」，打哈欠；左半本书（封面）从空中翻过来盖下（逐列透视），她跳起来落在封面上。
//   片尾（约 9 秒）：合上的书滑到桌子正中，金墨逐行写出演职信息；帕秋莉像纸板一样扑倒、躺在封面上睡着（呼吸、Z）；
//          最后镜头从正上方慢慢抬到斜看（tiltPlane，开场的反向）。
// 顶层名字一律带本段前缀 S6 / s6。
const S6LINES = seq(1.0, [
  ['最后，把今天浓缩成四条。', { hold: .8 }],
  ['一，睡够、睡好。', { hold: .35 }],
  ['二，不吸烟。', { hold: .35 }],
  ['三，每天动一动。', { hold: .35 }],
  ['四，少吃糖。', { hold: .35 }],
  ['能做到这四条，身体就已经不错了。剩下的慢慢调。', { mood: 'smile', hold: .3 }],
  ['以上是科普，不是诊断。身体不舒服，请去校医院。', { hold: .9 }],
  ['帕秋莉讲座第一集，下课。……我也该去睡觉了。', { mood: 'sleepy', hold: 1.7 }],
]);
const s6T = i => S6LINES[i][0], s6E = i => S6LINES[i][1];
// 节拍（都从台词时间推出来）
const S6K = (() => { const e7 = s6E(7);
  return { riff0: 1.25, riffStep: .5, riffDur: .46, hop0: 4.02, hop1: 4.55,
    yawn0: e7 - 1.6, yawn1: e7 - .5, close0: e7 - .6, close1: e7 + 1.0, slide1: e7 + 1.8, flop0: e7 + 2.15, flop1: e7 + 2.45,
    title: e7 + 1.55, cred0: e7 + 2.5, credStep: .4, tilt0: e7 + 1.9, tilt1: e7 + 6.3, tilt2: e7 + 8.6, end: e7 + 8.9 }; })();
const S6LEATHER = '#5b3034';                                       // 书壳（和 kit 的 spread、开场封面同一张皮）
const S6GOLD = mix(P.moon, P.cap, .32);                            // 封面金墨（月牙金调淡，暗皮面上看得清）
const S6CW = BOOK.w / 2 + 20;                                      // 封面宽
const S6PAT = { x: 1620, y: 900, h: 520 };                         // 帕秋莉在右页的站位（脚底）
// 左页四个压花格：物件中心、标签基线
const S6CELLS = [[290, 300], [700, 300], [290, 640], [700, 640]];
const S6ITEMS = [['moon', '睡够、睡好', '一'], ['cig', '不吸烟', '二'], ['shoe', '每天动一动', '三'], ['sugar', '少吃糖', '四']];
// 演职信息（逐字照 docs/分镜v2.md 第 6 节，按意思断行）
const S6CREDITS = [
  ['知识来源：zijie0/HumanSystemOptimization', 0], ['（整理自 Huberman Lab 播客）；', 0], ['WHO《关于身体活动和久坐行为的指南》（2020）', 0],
  ['角色：东方 Project © 上海爱丽丝幻乐团。', 1], ['本片为同人科普作品，不构成医疗建议。', 1],
  ['字体：霞鹜文楷（SIL OFL）', 2], ['语音：AquesTalk（株式会社アクエスト）', 2],
];

// ===================== 小画具 =====================
// s6Shadow：只画 path 的软影（路径挪到画外，用 shadowOffset 挪回来）
function s6Shadow(c, path, dx, dy, blur, a) {
  const T = c.getTransform(), OFF = 6000, sc = Math.hypot(T.a, T.b) || 1;
  c.save(); c.shadowColor = `rgba(30,20,15,${a})`; c.shadowBlur = blur * sc; c.shadowOffsetX = T.a * OFF + dx * sc; c.shadowOffsetY = T.b * OFF + dy * sc;
  c.translate(-OFF, 0); c.fillStyle = '#000'; c.fill(path); c.restore();
}
// s6Piece：有厚度的一片纸：离纸面 lift 像素高时影子更远更虚；th 是纸板厚度（下右方露出一道暗边）
function s6Piece(c, pts, col, o = {}) {
  const { seed = 1, lift = 0, th = 3, step = 10, grain: gr = .1, sh = 1 } = o, path = polyPath(scissor(pts, seed, step), true);
  if (sh) s6Shadow(c, path, 2 + lift * .3, 3 + lift * .42, 4 + lift * .09, .34 * sh * (1 - Math.min(.55, lift / 500)));
  if (th) { c.save(); c.translate(th * .5, th); c.fillStyle = mix(col, P.ink, .38); c.fill(path); c.restore(); }
  c.fillStyle = col; c.fill(path); if (gr) grain(c, path, gr);
  c.strokeStyle = alpha(mix(col, '#ffffff', .45), .55); c.lineWidth = 1; c.stroke(path);
  return path;
}
const s6Map = (pts, x, y, s, rot = 0) => { const co = Math.cos(rot), si = Math.sin(rot); return pts.map(([u, v]) => [x + (u * co - v * si) * s, y + (u * si + v * co) * s]); };

// ===================== 四件压花 =====================
// 每件在自己的坐标里画：中心 (0,0)，s ≈ 半宽。lift 离纸面的高度（影子用）
function s6Moon(c, s, lift) {
  s6Piece(c, crescentPts(0, 0, s, -.55, 64), P.moon, { seed: 601, lift, th: 3, step: 9 });
  for (const [x, y, r, k] of [[s * 1.05, -s * .75, s * .2, 0], [s * 1.25, -s * .1, s * .13, 1]]) s6Piece(c, starPts(x, y, r, 4, .38, .2), P.cap, { seed: 603 + k, lift, th: 2, step: 4 });
}
function s6Cig(c, s, lift, smoke) {
  const rot = -.32, body = s6Map(rectPts(-1.1, -.13, 1.55, .26), 0, 0, s, rot), filt = s6Map(rectPts(.45, -.13, .6, .26), 0, 0, s, rot);
  s6Piece(c, body, P.cap, { seed: 611, lift, th: 2.5, step: 12 });
  s6Piece(c, filt, mix(P.moon, P.paper2, .45), { seed: 612, lift, th: 0, step: 8, sh: 0 });
  const tip = s6Map([[-1.1, 0]], 0, 0, s, rot)[0];
  s6Piece(c, s6Map(rectPts(-1.1, -.13, .14, .26), 0, 0, s, rot), P.g2, { seed: 613, lift, th: 0, step: 4, sh: 0 });
  c.fillStyle = P.red; c.beginPath(); c.arc(tip[0] - 2, tip[1] + 1, s * .06, 0, TAU); c.fill();
  // 一缕烟：压平之前往上飘，压平后变成一条压扁的灰线
  if (smoke > 0) { const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push([tip[0] - 4 + Math.sin(u * 7 + smoke * 3) * 10 * u, tip[1] - u * s * 1.3 * smoke]); }
    rline(c, pts, { w: 2.5, color: alpha(P.g2, .8), smooth: true, seed: 615, amp: .6 }); }
}
function s6Shoe(c, s, lift) {
  const sole = [[-1, .34], [-1.02, .12], [1, .12], [1.04, .34]].map(([u, v]) => [u * s, v * s]);
  const up = [[-1, .16], [-1, -.12], [-.8, -.3], [-.35, -.32], [-.18, -.1], [.3, -.04], [.75, .02], [1.02, .14]].map(([u, v]) => [u * s, v * s]);
  s6Piece(c, sole, P.cap, { seed: 621, lift, th: 3, step: 10 });
  s6Piece(c, up, P.purple, { seed: 622, lift, th: 2, step: 9 });
  s6Piece(c, [[-.62 * s, -.3 * s], [-.5 * s, -.31 * s], [-.08 * s, .02 * s], [-.2 * s, .04 * s]], P.cap, { seed: 623, lift: 0, th: 0, step: 5, sh: .6 });   // 鞋襻
  c.fillStyle = P.moon; c.beginPath(); c.arc(-.14 * s, .01 * s, s * .05, 0, TAU); c.fill();
}
function s6Sugar(c, s, lift) {
  const a = s * .72, top = [[0, -a], [a * .95, -a * .5], [0, 0], [-a * .95, -a * .5]], lf = [[-a * .95, -a * .5], [0, 0], [0, a * 1.02], [-a * .95, a * .52]], rt = [[a * .95, -a * .5], [0, 0], [0, a * 1.02], [a * .95, a * .52]];
  const all = polyPath(scissor([[0, -a], [a * .95, -a * .5], [a * .95, a * .52], [0, a * 1.02], [-a * .95, a * .52], [-a * .95, -a * .5]], 631, 10), true);
  s6Shadow(c, all, 2 + lift * .3, 3 + lift * .42, 4 + lift * .09, .34 * (1 - Math.min(.55, lift / 500)));
  s6Piece(c, lf, P.g1, { seed: 632, th: 0, step: 10, sh: 0 }); s6Piece(c, rt, mix(P.g1, P.g2, .4), { seed: 633, th: 0, step: 10, sh: 0 }); s6Piece(c, top, P.cap, { seed: 634, th: 0, step: 10, sh: 0 });
  c.fillStyle = alpha(P.ink2, .35); for (let k = 0; k < 7; k++) { c.beginPath(); c.arc((hash(k, 7) - .5) * a * 1.4, (hash(k, 8) - .1) * a * .9, 1.6, 0, TAU); c.fill(); }
}
// s6Tape：一条硫酸纸胶带
function s6Tape(c, x, y, rot, k, seed) { if (k <= 0) return; pop(c, x, y, lerp(1.25, 1, k), () => fade(c, k, () => vellum(c, s6Map(rectPts(-34, -11, 68, 22), x, y, 1, rot), { seed, step: 14, blur: 2, sx: 1, sy: 1.5 }))); }
// s6Strike：红墨划掉（两笔 X）
function s6Strike(c, x, y, s, p) { if (p <= 0) return;
  rline(c, [[x - s * 1.05, y + s * .75], [x + s * 1.05, y - s * .75]], { w: 7, color: P.red, p: clamp(p * 1.7, 0, 1), seed: 641, amp: 1.2 });
  rline(c, [[x - s * .95, y - s * .7], [x + s * 1.0, y + s * .72]], { w: 7, color: P.red, p: clamp(p * 1.7 - .7, 0, 1), seed: 642, amp: 1.2 }); }
function s6Check(c, x, y, p) { if (p <= 0) return; rline(c, [[x - 20, y - 8], [x - 5, y + 12], [x + 26, y - 26]], { w: 7, color: P.moon, p, seed: 651, amp: .8 }); }
// s6Snail：墨线小蜗牛（「剩下的慢慢调」）
function s6Snail(c, x, y, tau, a) { if (a <= 0) return; c.save(); c.globalAlpha *= a; const o = { w: 2.6, color: P.ink, seed: 661, amp: .5 }, b = Math.sin(twos(tau) * 5) * 1.5;
  const sp = []; for (let k = 0; k <= 40; k++) { const u = k / 40, r = 22 * (1 - u * .85), an = -Math.PI / 2 + u * TAU * 1.7; sp.push([x + Math.cos(an) * r, y - 24 + Math.sin(an) * r]); }
  rline(c, sp, { ...o, smooth: true });
  rline(c, [[x - 30, y], [x + 24, y], [x + 40, y - 4], [x + 44, y - 14], [x + 38, y - 18]], { ...o, smooth: true, seed: 662 });
  rline(c, [[x + 38, y - 16], [x + 44 + b, y - 38]], { ...o, w: 2, seed: 663 }); rline(c, [[x + 42, y - 15], [x + 56, y - 34 - b]], { ...o, w: 2, seed: 664 });
  c.fillStyle = P.ink; c.beginPath(); c.arc(x + 44 + b, y - 39, 3, 0, TAU); c.arc(x + 57, y - 35 - b, 3, 0, TAU); c.fill();
  c.restore(); }

// 一件压花：从空中落下（高度 → 放大、影子远而虚）、压平（小小的纸屑动一下）、胶带、划掉、写字、打勾
function s6Specimen(c, tau, i, t0) {
  if (tau < t0) return; const [cx, cy] = S6CELLS[i], [kind, label, num] = S6ITEMS[i], u = tau - t0, s = 66;
  // 下落：前 0.55 秒从 360 高落到纸面；鞋是蹦着进来的（三步）
  let x = cx, y = cy, lift = 0, rot = 0;
  if (kind === 'shoe') { const hp = sm(0, .95, u, t => t); const n = 3, k = Math.min(n - 1, Math.floor(hp * n)), f = hp * n - k;
    x = lerp(cx - 190, cx, hp); lift = hp < 1 ? Math.sin(f * Math.PI) * 90 * (1 - k * .25) : 0; rot = hp < 1 ? -.18 * Math.sin(f * Math.PI) : 0;
    for (let j = 0; j < 3; j++) { const fx = lerp(cx - 190, cx, j / n) + 10, fa = sm(j / n * .95, j / n * .95 + .05, u) * (1 - sm(4, 6, u) * .6);
      if (fa > 0) { c.fillStyle = alpha(P.ink2, .3 * fa); c.beginPath(); c.ellipse(fx, cy + 34, 16, 6, 0, 0, TAU); c.fill(); } } }
  else { const f = sm(0, .55, u, easeIn); lift = (1 - f) * 360; rot = (1 - f) * (i % 2 ? -.5 : .45) + Math.sin(u * 7) * .1 * (1 - f); x = cx + (1 - f) * (i % 2 ? 60 : -60); }
  // 纸条糖块想逃：落地后蹦两下，被划掉后抖一下
  if (kind === 'sugar') { const b = u - .6; if (b > 0 && b < .9) { lift += Math.abs(Math.sin(b / .45 * Math.PI)) * 38 * (1 - b / .9); x += sm(0, .9, b) * 26; }
    if (u > .6) x += 26 * sm(.6, 1.5, u) - 26 * sm(1.7, 2.0, u); }
  const pressT = kind === 'shoe' ? .95 : .55, press = u > pressT ? Math.sin(clamp((u - pressT) / .18, 0, 1) * Math.PI) : 0;
  // 压过的一圈淡渍（压花会在纸上留下的痕迹）
  const st = sm(pressT, pressT + 1.2, u); if (st > 0) { const g = c.createRadialGradient(cx, cy, 10, cx, cy, s * 1.6); g.addColorStop(0, alpha(P.paperEdge, .16 * st)); g.addColorStop(1, alpha(P.paperEdge, 0)); c.fillStyle = g; c.fillRect(cx - s * 2, cy - s * 2, s * 4, s * 4); }
  const k = 1 + lift / 1300 - press * .03;
  c.save(); c.translate(x - lift * .12, y - lift * .2); c.scale(k, k * (1 - press * .05)); c.rotate(rot);
  if (kind === 'moon') s6Moon(c, s, lift);
  else if (kind === 'cig') s6Cig(c, s, lift, u < .7 ? sm(0, .5, u) : 1 - sm(1.25, 1.6, u) * 1);
  else if (kind === 'shoe') s6Shoe(c, s, lift);
  else s6Sugar(c, s, lift);
  c.restore();
  // 压下去那一下：两侧几道短墨线
  if (u > pressT && u < pressT + .3) { const a = 1 - (u - pressT) / .3; for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) { const an = (j - 1) * .45 + (sd < 0 ? Math.PI : 0), r0 = s * 1.25 + (1 - a) * 18;
    rline(c, [[cx + Math.cos(an) * r0, cy + Math.sin(an) * r0 * .6], [cx + Math.cos(an) * (r0 + 16), cy + Math.sin(an) * (r0 + 16) * .6]], { w: 2.5, color: alpha(P.ink, a), seed: 670 + j, amp: .3 }); } }
  // 胶带
  const tp = [[[-s * .7, s * .55, .5], [s * 1.0, -s * .65, -.6]], [[-s * .8, -s * .3, -.4], [s * .75, s * .1, .45]], [[-s * .75, s * .3, .35], [s * .8, s * .25, -.3]], [[-s * .65, -s * .1, .5], [s * .6, s * .5, -.45]]][i];
  tp.forEach(([dx, dy, r], j) => s6Tape(c, cx + dx, cy + dy, r, sm(pressT + .15 + j * .12, pressT + .3 + j * .12, u, easeOut), 680 + i * 2 + j));
  // 划掉（香烟、糖）
  if (kind === 'cig' || kind === 'sugar') s6Strike(c, cx + (kind === 'sugar' ? 0 : 0), cy, s * 1.05, sm(pressT + .5, pressT + 1.0, u));
  // 手写标签（序号小一号）+ 金色勾
  const ly = cy + 150, lw = zhWidth(c, label, 50), lp = writeP(tau, t0 + pressT + .25, label, .09);
  zh(c, num, cx - lw / 2 - 26, ly, { size: 34, align: 'right', color: P.ink2, p: sm(t0 + pressT + .1, t0 + pressT + .2, tau) > 0 ? 1 : 0 });
  zh(c, label, cx, ly, { size: 50, align: 'center', color: P.ink, p: lp });
  s6Check(c, cx + lw / 2 + 40, ly - 16, sm(t0 + pressT + .3 + label.length * .09, t0 + pressT + .6 + label.length * .09, tau));
}

// ===================== 翻过五页：每页一闪而过的缩影 =====================
// 贴在右页上的一张插页（稍小的纸 + 投影），k 章节 1..5
const S6PLATES = ['第一页 · 睡眠', '第二页 · 吃饭', '第三页 · 动力', '第四页 · 专注', '第五页 · 运动'];
function s6Plate(c, k, tau) {
  if (k < 1 || k > 5) return; const R = BOOK.R, cx = R.x + R.w / 2 - 20, cy = R.y + 430, w = 560, h = 440, x0 = cx - w / 2, y0 = cy - h / 2;
  drawMoonIcon(c, R.x + 60, R.y + 50, 14, P.moon, -.5); zh(c, S6PLATES[k - 1], R.x + 86, R.y + 64, { size: 34, color: P.ink2 });
  const bg = [null, P.night, P.paper2, P.paper, mix(P.blue, P.ink, .35), P.paper][k];
  cutPaper(c, rectPts(x0, y0, w, h, 3), bg, { seed: 700 + k, step: 40, blur: 8, sy: 5 });
  c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
  if (k === 1) {   // 剪纸灯箱：夜空、月、远山、宿舍楼、一扇亮窗，底下一道暖光
    cutPaper(c, circPts(x0 + 420, y0 + 110, 46, 32), P.cap, { seed: 711, step: 10, blur: 10, sx: 0, sy: 0 });
    const hill = (yy, amp, col, sd) => { const p = [[x0 - 10, y0 + h + 10]]; for (let i = 0; i <= 12; i++) p.push([x0 + i / 12 * (w + 20) - 10, yy - Math.sin(i * .9 + sd) * amp - Math.sin(i * 2.1) * amp * .3]); p.push([x0 + w + 10, y0 + h + 10]); cutPaper(c, p, col, { seed: 712 + sd, step: 18, blur: 8, sx: 0, sy: -3 }); };
    hill(y0 + 260, 30, mix(P.night, P.purple, .45), 1);
    cutPaper(c, [[x0 + 90, y0 + h + 10], [x0 + 90, y0 + 190], [x0 + 150, y0 + 160], [x0 + 210, y0 + 190], [x0 + 210, y0 + h + 10]], P.night3, { seed: 715, step: 14, blur: 8, sx: 0, sy: -3 });
    cutPaper(c, rectPts(x0 + 130, y0 + 240, 34, 40), P.lamp, { seed: 716, step: 8, shadow: false });
    hill(y0 + 350, 18, P.night2, 3);
    const g = c.createLinearGradient(0, y0 + h - 60, 0, y0 + h); g.addColorStop(0, alpha(P.lamp, 0)); g.addColorStop(1, alpha(P.lamp, .35)); c.fillStyle = g; c.fillRect(x0, y0 + h - 60, w, 60);
  } else if (k === 2) {   // 俯拍桌面：格子桌布、盘子、叉子、小钟
    c.strokeStyle = alpha(P.purple, .18); c.lineWidth = 16; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(x0 + i * 56, y0); c.lineTo(x0 + i * 56, y0 + h); c.stroke(); c.beginPath(); c.moveTo(x0, y0 + i * 56); c.lineTo(x0 + w, y0 + i * 56); c.stroke(); }
    s6Piece(c, circPts(cx - 30, cy + 10, 140, 48), P.cap, { seed: 721, th: 5, step: 16 }); s6Piece(c, circPts(cx - 30, cy + 10, 96, 40), mix(P.cap, P.g1, .4), { seed: 722, th: 0, step: 14, sh: .4 });
    s6Piece(c, [[cx + 150, cy - 110], [cx + 164, cy - 110], [cx + 162, cy + 150], [cx + 152, cy + 150]], P.g2, { seed: 723, th: 2, step: 20 });
    s6Piece(c, circPts(x0 + 90, y0 + 80, 50, 32), P.paper, { seed: 724, th: 3, step: 10 });
    rline(c, [[x0 + 90, y0 + 80], [x0 + 90, y0 + 50]], { w: 3, seed: 725 }); rline(c, [[x0 + 90, y0 + 80], [x0 + 112, y0 + 92]], { w: 3, seed: 726 });
  } else if (k === 3) {   // 一根线的过山车：向远处延伸的单线，近粗远细
    const pts = []; for (let i = 0; i <= 60; i++) { const z = i / 60, X = Math.sin(z * 4) * 180, Y = -Math.sin(z * 5.5 + .6) * 110 * (1 - z * .3) + 40, sc = 1 / (1 + z * 3.2);
      pts.push([cx + X * sc, cy - 60 + (Y + 220) * sc, sc]); }
    for (let i = 1; i < pts.length; i++) rline(c, [pts[i - 1], pts[i]], { w: 7 * pts[i][2] + 1, color: P.ink, seed: 730 + i, amp: .2 });
    const b = pts[14]; cutPaper(c, circPts(b[0], b[1] - 8, 10, 16), P.red, { seed: 739, step: 4 });
  } else if (k === 4) {   // 蓝晒星图：白色星点和连线
    const st = [[-200, -120], [-120, -60], [-40, -140], [60, -80], [150, -150], [200, -20], [110, 40], [10, 10], [-90, 80], [-190, 40], [40, 130], [170, 120]].map(([a, b]) => [cx + a, cy + b]);
    [[0, 1], [1, 2], [2, 3], [3, 4], [3, 7], [7, 6], [6, 5], [7, 8], [8, 9], [8, 10], [10, 11], [6, 11]].forEach(([a, b], j) => rline(c, [st[a], st[b]], { w: 1.8, color: alpha(P.cap, .75), seed: 740 + j, amp: .4 }));
    st.forEach(([a, b], j) => { c.fillStyle = P.cap; c.beginPath(); c.arc(a, b, 3 + hash(j, 4) * 5, 0, TAU); c.fill(); });
    c.strokeStyle = alpha(P.cap, .18); c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, 240, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, 150, 0, TAU); c.stroke();
  } else {   // 立体书：斜放的书页上立起三个纸小人
    rline(c, [[x0 + 40, y0 + h - 60], [x0 + 140, y0 + 150], [x0 + w - 140, y0 + 150], [x0 + w - 40, y0 + h - 60]], { w: 3, seed: 751 });
    rline(c, [[x0 + 90, y0 + 300], [x0 + w - 90, y0 + 300]], { w: 2, color: alpha(P.ink, .5), seed: 752, dash: [8, 8] });
    [[-150, 1], [0, 1.15], [150, .95]].forEach(([dx, sc], j) => { const fx = cx + dx, fy = y0 + 300;
      c.save(); c.translate(fx, fy); c.scale(sc, sc);
      s6Piece(c, [[-26, 0], [-18, -70], [18, -70], [26, 0]], [P.green, P.purple, P.blue][j], { seed: 753 + j, th: 2, step: 10, lift: 20 });
      s6Piece(c, circPts(0, -92, 20, 16), P.skin, { seed: 756 + j, th: 2, step: 6, lift: 20 }); c.restore(); });
  }
  c.restore();
}
// 快速翻页：每一次右页翻起来（正面是上一张插页，按宽度压扁），翻完露出下一张
function s6Riffle(c, tau) {
  const K = S6K, n = clamp(Math.floor((tau - K.riff0) / K.riffStep) + 1, 0, 6), u = n ? (tau - K.riff0 - (n - 1) * K.riffStep) / K.riffDur : 0;
  s6Plate(c, n, tau);
  if (n < 1 || u >= 1) return;
  turnPage(c, u);
  const R = BOOK.R, e = easeIO(u), cw = R.w * Math.cos(e * Math.PI), lift = Math.sin(e * Math.PI) * 36;
  if (cw > 20 && n - 1 >= 1) { const pts = [[CX, R.y], [CX + cw, R.y - lift], [CX + cw, R.y + R.h + lift], [CX, R.y + R.h]];
    c.save(); c.clip(polyPath(pts)); c.translate(CX, 0); c.scale(cw / R.w, 1); c.translate(-CX, 0); s6Plate(c, n - 1, tau); c.restore();
    c.save(); c.clip(polyPath(pts)); const g = c.createLinearGradient(CX, 0, CX + cw, 0); g.addColorStop(0, 'rgba(60,40,20,.25)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fill(polyPath(pts)); c.restore(); }
}

// ===================== 右页：折起来的纸条（免责） =====================
function s6Note(c, tau) {
  const t0 = s6T(6); if (tau < t0) return; const u = tau - t0, x = 1010, y = 250, pw = 156, h = 320, rot = -.025;
  const fly = sm(0, .55, u, easeOut), open2 = sm(.75, 1.05, u, easeOut), open3 = sm(1.05, 1.35, u, easeOut);
  const sx = lerp(S6PAT.x - 150, x, fly), sy = lerp(S6PAT.y - 330, y, fly), sc = lerp(.35, 1, fly);
  c.save(); c.translate(sx, sy); c.rotate(rot + (1 - fly) * .5); c.scale(sc, sc);
  const lift = (1 - fly) * 160;
  s6Piece(c, rectPts(0, 0, pw, h, 2), P.cap, { seed: 801, lift, th: 2, step: 26 });
  // 第二、三折：从右边一折一折展开（压扁的那一折颜色略暗）
  const p2 = pw * open2, p3 = pw * open3;
  if (p2 > 2) { s6Piece(c, rectPts(pw, 0, p2, h, 2), mix(P.cap, P.g1, (1 - open2) * .6), { seed: 802, th: 0, step: 26, sh: open2 }); }
  if (p3 > 2) { s6Piece(c, rectPts(pw * 2, 0, p3, h, 2), mix(P.cap, P.g1, (1 - open3) * .6), { seed: 803, th: 0, step: 26, sh: open3 }); }
  // 折痕
  if (open2 > .9) rline(c, [[pw, 8], [pw, h - 8]], { w: 1.2, color: alpha(P.ink, .18), seed: 804, amp: .3 });
  if (open3 > .9) rline(c, [[pw * 2, 8], [pw * 2, h - 8]], { w: 1.2, color: alpha(P.ink, .18), seed: 805, amp: .3 });
  // 内容：小红十字 + 两行字（展开到哪里露到哪里）
  c.save(); c.beginPath(); c.rect(0, 0, pw + p2 + p3, h); c.clip();
  const cr = [[-1, -3], [1, -3], [1, -1], [3, -1], [3, 1], [1, 1], [1, 3], [-1, 3], [-1, 1], [-3, 1], [-3, -1], [-1, -1]].map(([a, b]) => [72 + a * 11, 78 + b * 11]);
  if (u > .35) cutPaper(c, cr, P.red, { seed: 806, step: 6, blur: 2, sx: 1, sy: 1.5 });
  zh(c, '科普 ≠ 诊断', 128, 96, { size: 48, color: P.ink, p: writeP(tau, t0 + 1.3, '科普 ≠ 诊断', .08) });
  rline(c, [[40, 140], [pw * 3 - 40, 140]], { w: 1.5, color: alpha(P.ink2, .4), seed: 807, p: sm(t0 + 1.9, t0 + 2.3, tau) });
  zh(c, '不舒服', 60, 210, { size: 46, color: P.ink, p: writeP(tau, t0 + 2.4, '不舒服', .09) });
  zh(c, '去校医院', 200, 272, { size: 46, color: P.ink, p: writeP(tau, t0 + 2.75, '去校医院', .09) });
  arrow(c, [150, 222], [192, 254], { w: 3, head: 12, p: sm(t0 + 2.65, t0 + 2.8, tau), seed: 808 });
  c.restore();
  if (fly >= 1) brassPin(c, pw * 1.5, 18, 10 * sm(.55, .65, u, easeOutBack) + .01);
  c.restore();
}

// ===================== 左页 =====================
function s6LeftPage(c, tau) {
  const K = S6K;
  pageHeader(c, '合上魔导书', tau, .2, { t1: K.riff0 + .02 });
  pageHeader(c, '合上魔导书', tau, K.riff0 + 5 * K.riffStep + .15);
  for (let i = 0; i < 4; i++) {
    // L6：四件东西依次轻轻跳一下
    const j = s6T(5) + .35 + i * .28, hop = Math.sin(clamp((tau - j) / .32, 0, 1) * Math.PI);
    if (hop > 0) { const [cx, cy] = S6CELLS[i]; c.save(); c.translate(cx, cy); c.scale(1 + hop * .05, 1 + hop * .05); c.translate(-cx, cy * 0 - cy - hop * 10); s6Specimen(c, tau, i, s6T(i + 1)); c.restore(); }
    else s6Specimen(c, tau, i, s6T(i + 1));
    const sp = sm(j + .15, j + .3, tau, easeOutBack) * (1 - sm(j + 1.0, j + 1.3, tau)); if (sp > 0) { const [cx, cy] = S6CELLS[i]; cutPaper(c, starPts(cx + 80, cy - 70, 16 * sp, 4, .3, .3), P.moon, { seed: 690 + i, step: 4, blur: 2 }); }
  }
  // 「剩下的慢慢调」：底边一只蜗牛慢慢爬
  const sT = s6T(5) + (s6E(5) - s6T(5)) * .6; if (tau > sT) { const x = 150 + (tau - sT) * 13, a = sm(sT, sT + .4, tau);
    rline(c, [[130, 884], [x - 30, 884]], { w: 3, color: alpha(P.g1, .8 * a), seed: 668, amp: .4 }); s6Snail(c, x, 882, tau, a); }
}

// ===================== 帕秋莉（讲台部分） =====================
function s6Char(c, tau, L) {
  const K = S6K, blink = blinkAt(tau, 6);
  const cur = i => tau >= s6T(i) && tau < (i < 7 ? s6T(i + 1) : 1e9);
  let x = S6PAT.x, y = S6PAT.y, facing = -1, pose = 'lecture', mood = L.mood || 'normal', look = .3, gesture = null, mouth = L.mouth, rot = 0, tilt = 0, bl = blink;
  if (tau < K.hop0) { x = BOOK.L.x + 690; facing = 1; pose = tau < K.riff0 - .2 ? 'stand' : 'point'; look = .6; }
  else if (tau < K.hop1) { const f = sm(K.hop0, K.hop1, tau, easeIO); x = lerp(BOOK.L.x + 690, S6PAT.x, f); y = S6PAT.y - Math.sin(f * Math.PI) * 140; pose = 'stand'; facing = f < .5 ? 1 : -1; rot = Math.sin(f * Math.PI) * .12 * (f < .5 ? 1 : -1); }
  else if (cur(1)) { pose = 'point'; look = .5; }
  else if (cur(2)) { const lt = tau - s6T(2); pose = lt > .8 && lt < 2.4 ? 'hide' : 'lecture'; mood = lt > .8 && lt < 2.4 ? 'annoyed' : mood; }
  else if (cur(3)) { pose = 'cross'; mood = 'pout'; }
  else if (cur(4)) { pose = 'lecture'; mood = 'annoyed'; gesture = .8; }
  else if (cur(5)) { const lp = (tau - s6T(5)) / (s6E(5) - s6T(5)); pose = lp < .6 ? 'lecture' : 'stand'; mood = lp < .6 ? 'smile' : 'smug'; gesture = lp < .6 ? .95 : null; }
  else if (cur(6)) { const lt = tau - s6T(6); pose = lt < .7 ? 'point' : 'lecture'; gesture = .55; }
  else if (tau >= s6T(7)) {
    const lt = tau - s6T(7);
    if (lt < 2.4) { pose = 'stand'; mood = 'smug'; rot = -.14 * Math.sin(clamp((lt - 1.4) / .9, 0, 1) * Math.PI); tilt = .15 * Math.sin(clamp((lt - 1.4) / .9, 0, 1) * Math.PI); }   // 「下课」鞠一躬
    else { pose = 'tired'; mood = 'sleepy'; }
    const yw = Math.sin(clamp((tau - K.yawn0) / (K.yawn1 - K.yawn0), 0, 1) * Math.PI); if (yw > 0) { mouth = Math.max(mouth, clamp(yw * 1.4, 0, 1)); tilt -= yw * .12; bl = Math.max(bl, clamp(yw * 1.6 - .3, 0, 1)); }
  }
  c.save(); c.translate(x, y); c.rotate(rot * facing); c.translate(-x, -y);
  const r = drawPatchouli(c, { x, y, h: S6PAT.h, pose, mood, look, facing, mouth, blink: bl, t: tau, gesture, tilt });
  c.restore();
  // 咳嗽：两朵小纸云（L3，烟飘过来）
  if (cur(2)) { const lt = tau - s6T(2); for (let k = 0; k < 2; k++) { const a = sm(1.0 + k * .45, 1.15 + k * .45, lt, easeOutBack) * (1 - sm(1.6 + k * .45, 1.9 + k * .45, lt)); if (a <= 0) continue;
    const hx = r.head[0] - 70 - k * 30, hy = r.head[1] - 40 - k * 36 - (lt - 1 - k * .45) * 20; pop(c, hx, hy, a, () => { [[0, 0, 16], [14, -6, 12], [-13, -4, 11]].forEach(([a2, b, rr], j) => cutPaper(c, circPts(hx + a2, hy + b, rr, 14), P.cap, { seed: 820 + k * 3 + j, step: 5, blur: 3 })); }); } }
  // 哈欠的一滴眼泪
  const yw = Math.sin(clamp((tau - K.yawn0) / (K.yawn1 - K.yawn0), 0, 1) * Math.PI); if (yw > .4) cutPaper(c, circPts(r.head[0] - 22, r.head[1] - 4, 4.5 * yw, 10), mix(P.ribbonBlue, P.cap, .6), { seed: 830, step: 3, blur: 1 });
  return r;
}

// ===================== 合书与片尾 =====================
// 封面（合着的书）：皮面、金线框、月牙徽记；ct = 封面落下后的秒数（< 0 不写字）
function s6Cover(c, tau, x0, ct) {
  const { y, h } = BOOK, cx = x0 + S6CW / 2;
  cutPaper(c, rectPts(x0, y - 8, S6CW, h + 20, 10), S6LEATHER, { seed: 1201, step: 28, blur: 16, sx: 0, sy: 8, grain: .14 });
  rline(c, rectPts(x0 + 36, y + 26, S6CW - 72, h - 52, 6), { w: 2, color: alpha(P.moon, .55), close: true, seed: 1202 });
  drawMoonIcon(c, cx, y + 88, 34, P.moon, -.5);
  if (ct < 0) return;
  const K = S6K, T = s => s - K.close1;   // 以封面落下为 0
  zh(c, '帕秋莉讲座 · 第 1 集 · 完', cx, y + 190, { size: 52, align: 'center', color: S6GOLD, p: writeP(ct, T(K.title), '帕秋莉讲座 · 第 1 集 · 完', .06) });
  rline(c, [[cx - 170, y + 222], [cx + 170, y + 222]], { w: 2, color: alpha(P.moon, .6), seed: 1203, p: sm(T(K.title) + .6, T(K.title) + 1.0, ct) });
  let yy = y + 300, grp = 0;
  S6CREDITS.forEach(([s, g], i) => { if (g !== grp) { yy += 34; grp = g; } const t0 = T(K.cred0) + i * K.credStep;
    zh(c, s, cx, yy, { size: 36, align: 'center', color: S6GOLD, p: writeP(ct, t0, s, .03), al: sm(t0 - .05, t0 + .2, ct) }); yy += 54; });
}
// 合书：左半本（左页 + 封面）绕书脊从左翻到右，逐列透视（翻到半空时离镜头近、变大），th 0..π
const S6BUF = document.createElement('canvas');
function s6Swing(c, tau, L, th) {
  const sc = c.getTransform().a || 1; if (S6BUF.width !== W * sc) { S6BUF.width = W * sc; S6BUF.height = H * sc; }
  const b = S6BUF.getContext('2d'); b.setTransform(sc, 0, 0, sc, 0, 0); b.clearRect(0, 0, W, H);
  const face = Math.cos(th) > 0;   // true：看到的是左页那面；false：封面那面
  if (face) { spread(b, tau); s6LeftPage(b, tau); } else s6Cover(b, tau, CX - 10, -1);
  const f = 2900, y0 = BOOK.y - 8, y1 = BOOK.y + BOOK.h + 12, span = CX - (BOOK.x - 10), step = 3;
  const col = (s) => { const hz = s * Math.sin(th), k = f / (f - hz); return [CX - s * Math.cos(th) * k, k]; };
  const shade = .38 * (1 - Math.abs(Math.cos(th)));
  for (let s = 0; s < span; s += step) {
    const [xa, ka] = col(s), [xb] = col(Math.min(span, s + step)), xs = face ? CX - s - step : CX - 10 + s;
    const dx = Math.min(xa, xb), dw = Math.abs(xb - xa) + .7; if (dw < .05) continue;
    const top = CY + (y0 - CY) * ka, hh = (y1 - y0) * ka;
    c.drawImage(S6BUF, xs * sc, y0 * sc, step * sc, (y1 - y0) * sc, dx, top, dw, hh);
    if (shade > .01) { c.fillStyle = `rgba(20,12,10,${shade * (face ? 1 : .7)})`; c.fillRect(dx, top, dw, hh); }
  }
}
// 片尾之后的镜头俯仰：y → [屏幕 y, 缩放]（和 kit 的 tiltPlane 同一个公式）
function s6TiltMap(x, y, pitch, f = 1400) { const cp = Math.cos(pitch), sp = Math.sin(pitch), d = y - CY, k = f / (f + d * sp); return [CX + (x - CX) * k, CY + d * cp * k, k]; }
function s6Closing(c, tau, L) {
  const K = S6K, e7 = s6E(7);
  const cu = sm(K.close0, K.close1, tau, easeIO), th = cu * Math.PI;
  // 书滑到桌子正中（开场的反向），随后镜头慢慢抬起来
  const slide = sm(K.close1, K.slide1, tau, easeIO), x0 = lerp(CX - 10, CX - S6CW / 2, slide), dx = x0 - (CX - 10);
  const pitch = tau < K.tilt1 ? lerp(0, -.2, sm(K.tilt0, K.tilt1, tau, easeIO)) : lerp(-.2, -.8, sm(K.tilt1, K.tilt2, tau, easeIO));
  const zoom = lerp(1, .9, sm(K.tilt1, K.tilt2, tau, easeIO)) * (1 - .035 * Math.sin(cu * Math.PI));
  const thud = tau > K.close1 && tau < K.close1 + .25 ? Math.sin((tau - K.close1) / .25 * Math.PI * 3) * 3 * (1 - (tau - K.close1) / .25) : 0;
  c.fillStyle = WOOD; c.fillRect(0, 0, W, H);
  c.save(); c.translate(CX, CY + thud); c.scale(zoom, zoom); c.translate(-CX, -CY);
  if (cu < 1) {
    desk(c);
    c.save(); c.beginPath(); c.rect(CX - 12, 0, W, H); c.clip(); spread(c, tau); c.restore();
    // 右半本还摊着：右页上的纸条；翻过来的封面在上面投一道越来越深的影
    s6Note(c, tau);
    if (th > Math.PI / 2) { const a = sm(Math.PI / 2, Math.PI, th, t => t), wv = BOOK.R.w * (1 - a) + 60; const g = c.createLinearGradient(CX, 0, CX + wv + 200, 0); g.addColorStop(0, `rgba(20,12,10,${.45 * a})`); g.addColorStop(1, 'rgba(20,12,10,0)'); c.fillStyle = g; c.fillRect(CX, BOOK.y, BOOK.R.w + 60, BOOK.h); }
    s6Swing(c, tau, L, th);
  } else {
    const ct = tau - K.close1;
    tiltPlane(c, b => { desk(b); b.save(); b.translate(dx, 0);
      // 书口的厚度：封面底下露出一圈书页
      cutPaper(b, rectPts(CX - 10 + 6, BOOK.y - 2, S6CW - 6, BOOK.h + 18, 6), BOOK.page2, { seed: 1210, step: 50, blur: 14, sx: 0, sy: 8, grain: .1 });
      s6Cover(b, tau, CX - 10, ct); b.restore(); }, { pitch, cy: CY });
    // 书的前侧面（镜头抬起来才看得到）：一道书页的厚边
    if (pitch < -.01) { const [ax, ay, ka] = s6TiltMap(x0 + 6, BOOK.y + BOOK.h + 12, pitch), [bx] = s6TiltMap(x0 + S6CW, BOOK.y + BOOK.h + 12, pitch), th2 = 30 * Math.sin(-pitch) * ka;
      cutPaper(c, [[ax, ay], [bx, ay], [bx, ay + th2], [ax, ay + th2]], BOOK.page2, { seed: 1211, step: 60, shadow: false, grain: .1 });
      c.strokeStyle = alpha(P.paperEdge, .7); c.lineWidth = 1; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(ax, ay + th2 * k / 5); c.lineTo(bx, ay + th2 * k / 5); c.stroke(); }
      cutPaper(c, [[ax - 6, ay + th2], [bx, ay + th2], [bx, ay + th2 + 10 * Math.sin(-pitch) * ka], [ax - 6, ay + th2 + 10 * Math.sin(-pitch) * ka]], mix(S6LEATHER, P.ink, .3), { seed: 1212, step: 60, shadow: false }); }
  }
  s6Sleeper(c, tau, L, dx, pitch);
  c.restore();
  // 最后半秒压暗
  const dk = sm(K.end - .7, K.end, tau); if (dk > 0) { c.fillStyle = alpha('#0d0908', dk * .75); c.fillRect(0, 0, W, H); }
}
// 帕秋莉：翻书时跳起来落在封面上 → 纸板一样扑倒 → 躺着睡（呼吸、Z）
function s6Sleeper(c, tau, L, dx, pitch) {
  const K = S6K, j = sm(K.close0 + .35, K.close1 + .05, tau, t => t), jump = Math.sin(j * Math.PI) * 190, ground = S6PAT.y - (tau > K.close1 ? 6 : 0);
  const fx = S6PAT.x - 20 + dx;
  if (tau < K.flop0) {
    const x = fx, y = ground - jump, rot = j > 0 && j < 1 ? -.08 * Math.sin(j * TAU) : 0;
    const pose = j > 0 && j < 1 ? 'stand' : tau < K.close0 + .35 ? 'tired' : 'tired', mood = j > .02 && j < .6 ? 'surprised' : 'sleepy';
    const [px, py, k] = s6TiltMap(x, y, pitch);
    c.save(); c.translate(px, py); c.rotate(rot); c.translate(-px, -py);
    drawPatchouli(c, { x: px, y: py, h: S6PAT.h * k, pose, mood, facing: -1, look: .2, blink: mood === 'surprised' ? 0 : Math.max(.5, blinkAt(tau, 6)), mouth: L.mouth, t: tau });
    c.restore(); return;
  }
  // 扑倒：绕脚底往左倒下（头朝左），落地的瞬间换成躺姿，小小弹一下
  if (tau < K.flop1) { const f = sm(K.flop0, K.flop1, tau, easeIn), [px, py, k] = s6TiltMap(fx, ground, pitch);
    c.save(); c.translate(px, py); c.rotate(-f * Math.PI / 2); c.translate(-px, -py);
    drawPatchouli(c, { x: px, y: py, h: S6PAT.h * k, pose: 'tired', mood: 'sleepy', facing: -1, blink: 1, t: tau }); c.restore(); return; }
  const bo = tau - K.flop1, bounce = bo < .35 ? Math.abs(Math.sin(bo / .35 * Math.PI)) * 14 * (1 - bo / .35) : 0;
  const lx = fx - 250, ly = ground + 96;
  const [px, py, k] = s6TiltMap(lx, ly, pitch);
  const r = drawPatchouli(c, { x: px, y: py - bounce * k, h: S6PAT.h * k, pose: 'lie', mood: 'sleepy', facing: 1, blink: 1, t: tau });
  // Z：从脸边一个个冒出来往右上飘
  for (let n = 0; n < 3; n++) { const per = 2.4, ph = ((tau - K.flop1 - .6 - n * .8) % per + per) % per, on = tau - K.flop1 - .6 - n * .8; if (on < 0) continue;
    const a = Math.min(sm(0, .3, ph), 1 - sm(1.7, 2.3, ph)); if (a <= 0) continue;
    zh(c, n % 2 ? 'z' : 'Z', r.head[0] + 40 + ph * 40, r.head[1] - 60 - ph * 50, { size: (30 + ph * 8) * k, color: P.cap, al: a * .9, base: 'middle' }); }
}

scene({ order: 6, key: 'ending', title: '总结', dur: S6K.end, lines: S6LINES,
  fn(c, tau, L) {
    if (tau >= S6K.close0) { s6Closing(c, tau, L); return; }
    spread(c, tau);
    s6LeftPage(c, tau);
    s6Riffle(c, tau);
    s6Note(c, tau);
    s6Char(c, tau, L);
  } });
