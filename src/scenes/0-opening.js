'use strict';
// 第 0 段：开场（第二版，克制写意，见 docs/画风v2.md）。
//   片头：黑里点亮一根蜡烛 → 剪纸光圈照出桌面：摊开的书、墨水瓶、茶渍 → 书页上墨迹写出标题 → 书后升起一顶月牙帽，半眯着眼瞥镜头：「……看什么看。」
//   书页：镜头推进书页。大图书馆只用几笔墨画出书架走廊；帕秋莉是书页上的小剪纸人。
//   页边批注（外出、睡觉、哮喘）→ 红色小印章「反面教材」→ 书顶垂下五根书签（五页目录）→ 三个小涂鸦（熬夜、久坐、外卖）。
// 顶层名字一律带本段前缀 S0 / s0。
const S0LINES = seq(6.2, [
  ['……看什么看。', { mood: 'pout', hold: .5 }],
  ['这里是红魔馆地下，大图书馆。', { pause: .9 }],
  '我是帕秋莉·诺蕾姬，住在这里的魔法使。',
  ['常年不出门，睡得乱七八糟，还有哮喘。', { mood: 'sleepy', hold: .6 }],
  ['……所以由我来讲怎么调理身体，很有说服力吧？', { mood: 'smug', hold: .5 }],
  ['正因为是反面教材，哪些坑会让身体垮掉，我最清楚。', { mood: 'smug', hold: .4 }],
  ['今天这本魔导书一共五页：睡眠、吃饭、动力、专注、运动。', { hold: .6 }],
  ['专门写给熬夜、久坐、天天点外卖的大学生。', { mood: 'smile', hold: .6 }],
]);
const s0T = i => S0LINES[i][0], s0E = i => S0LINES[i][1];
// 桌面（俯视）上的东西，书页坐标
const S0DESK = { bx: CX + 20, by: CY - 10, pw: 440, ph: 580 };   // 书的中心、单页宽高

// ===================== 桌面 =====================
function s0Candle(c, x, y, s, tau, lit) {
  cutPaper(c, rectPts(x - 26 * s, y - 120 * s, 52 * s, 120 * s, 6 * s), '#e9e1cf', { seed: 21 });
  rline(c, [[x, y - 120 * s], [x + 2 * s, y - 138 * s]], { w: 3 * s, color: P.ink, seed: 22 });
  if (lit <= 0) return;
  const f = twos(tau), k = easeOutBack(clamp(lit, 0, 1)), sway = Math.sin(f * 9) * 2.5 * s, hh = (42 + Math.sin(f * 13) * 4) * s * k;
  cutPaper(c, [[x - 11 * s * k, y - 140 * s], [x - 12 * s * k + sway * .3, y - 140 * s - hh * .45], [x + sway, y - 140 * s - hh], [x + 12 * s * k + sway * .3, y - 140 * s - hh * .45], [x + 11 * s * k, y - 140 * s]], P.moon, { seed: 23 + (Math.floor(f * 4) % 3), step: 6, shadow: false, smooth: true });
}
// 光圈：一片剪出来的暖纸圆，边上是剪刀的折角。r 是半径
function s0Light(c, x, y, r) { if (r < 2) return null; return cutPaper(c, ellPts(x, y, r * 1.36, r, 64), P.paper, { seed: 31, step: 22, blur: 18, sx: 0, sy: 0 }); }
// 摊开的书（俯视）：两页纸 + 书脊 + 一点书页弯曲的线
function s0OpenBook(c, tau) {
  const { bx, by, pw, ph } = S0DESK;
  cutPaper(c, rectPts(bx - pw - 14, by - ph / 2 - 10, pw * 2 + 28, ph + 24, 8), '#6e3b3e', { seed: 41, step: 20 });   // 书壳
  for (const d of [-1, 1]) {
    const x0 = d < 0 ? bx - pw : bx, pts = [[x0, by - ph / 2], [x0 + pw, by - ph / 2], [x0 + pw, by + ph / 2], [x0, by + ph / 2]];
    cutPaper(c, pts, '#f3eee3', { seed: 42 + d, step: 26, shadow: false });
    for (let k = 1; k <= 3; k++) rline(c, [[bx + d * 6 * k, by - ph / 2 + 4], [bx + d * 6 * k, by + ph / 2 - 4]], { w: 1, color: alpha(P.ink, .12), seed: 50 + k * d });
  }
  rline(c, [[bx, by - ph / 2 - 6], [bx, by + ph / 2 + 6]], { w: 2.5, color: alpha(P.ink, .5), seed: 44, t: tau });
}
function s0InkBottle(c, x, y) {
  cutPaper(c, rectPts(x - 42, y - 30, 84, 70, 12), P.ink, { seed: 61 });
  cutPaper(c, rectPts(x - 18, y - 52, 36, 26, 4), P.ink2, { seed: 62, shadow: false });
  rline(c, [[x - 26, y + 6], [x + 22, y + 6]], { w: 2, color: alpha(P.paper, .35), seed: 63 });
}
// 茶渍：一圈断断续续的淡褐色环
function s0Stain(c, x, y, r) { for (let k = 0; k < 3; k++) rline(c, ellPts(x, y, r - k * 3, r * .96 - k * 3, 40).slice(k * 5, 36 - k * 3), { w: 2.5 - k * .6, color: alpha('#8a6a4a', .35 - k * .08), seed: 70 + k }); }

function s0Desk(c, tau) {
  const H0 = { lit: .9, light0: 1.0, light1: 1.9, sub: 2.1, big1: 2.8, big2: 3.6, cap0: 4.6, cap1: 5.6 };
  c.fillStyle = P.night; c.fillRect(0, 0, W, H);
  const cx = 400, cy = 820, r = lerp(0, 520, sm(H0.light0, H0.light1, tau, easeOut));
  const light = s0Light(c, CX, CY + 20, r);
  if (light) { c.save(); c.clip(light);
    s0Stain(c, 440, 330, 52); s0InkBottle(c, 1540, 640); s0OpenBook(c, tau);
    // 书页上的字：左页小字，右页大字（墨迹逐字写出）
    const { bx, by, pw } = S0DESK;
    zh(c, '帕秋莉讲座', bx - pw / 2, by - 40, { size: 58, align: 'center', color: P.ink, p: writeP(tau, H0.sub, '帕秋莉讲座', .09) });
    zh(c, '第 一 集', bx - pw / 2, by + 50, { size: 40, align: 'center', color: P.ink2, p: writeP(tau, H0.sub + .5, '第 一 集', .09) });
    rline(c, [[bx - pw / 2 - 90, by + 80], [bx - pw / 2 + 90, by + 80]], { w: 2, color: P.ink2, p: sm(H0.sub + .9, H0.sub + 1.3, tau), seed: 81, t: tau });
    zh(c, '我是帕秋莉，', bx + pw / 2, by - 50, { size: 64, align: 'center', color: P.ink, p: writeP(tau, H0.big1, '我是帕秋莉，', .1) });
    zh(c, '我来教你调理身体！', bx + pw / 2, by + 40, { size: 56, align: 'center', color: P.ink, p: writeP(tau, H0.big2, '我来教你调理身体！', .09) });
    c.restore(); }
  s0Candle(c, cx, cy, 1.1, tau, sm(H0.lit - .1, H0.lit + .15, tau));
  // 书后升起一顶月牙帽：她扒着书的下沿探头
  const up = sm(H0.cap0, H0.cap1, tau, easeOutBack);
  if (up > .001) { const { bx, by, ph } = S0DESK, edge = by + ph / 2 + 12;
    c.save(); c.beginPath(); c.rect(0, 0, W, edge); c.clip();
    const L = lineAt(S0LINES, tau), talking = L && L.text === S0LINES[0][2];
    drawPatchouli(c, { x: bx + 250, y: edge + lerp(260, 0, up), h: 520, pose: 'peek', mood: talking ? 'pout' : 'normal', look: -.6, mouth: talking ? mouthAt(tau, L) : 0, blink: blinkAt(tau, 4), t: tau });
    c.restore(); }
}

// ===================== 书页 =====================
// 书架走廊：几笔墨画的透视书架，p 画出比例
function s0Corridor(c, tau, p, al = 1) {
  if (p <= 0) return; const vx = 1240, vy = 420;
  c.save(); c.globalAlpha *= al; c.translate(vx, vy); c.scale(.62, .62); c.translate(-vx, -vy);
  for (const d of [-1, 1]) {
    const xo = vx + d * 620, rows = [0, 1, 2, 3, 4];
    fade(c, sm(0, .5, p) * .9, () => { c.fillStyle = alpha(P.ink, .07); c.fill(polyPath([[xo, 120], [vx + d * 70, vy - 60], [vx + d * 70, vy + 70], [xo, 820]])); });
    rline(c, [[xo, 120], [vx + d * 70, vy - 60]], { w: 3, color: P.ink, p: sm(0, .5, p), seed: 101 + d, t: tau });
    rline(c, [[xo, 820], [vx + d * 70, vy + 70]], { w: 3, color: P.ink, p: sm(.1, .6, p), seed: 103 + d, t: tau });
    rows.forEach(k => { const u = k / 4, y0 = lerp(120, 820, u), y1 = lerp(vy - 60, vy + 70, u);
      rline(c, [[xo, y0], [vx + d * 70, y1]], { w: 1.5, color: alpha(P.ink, .55), p: sm(.2 + k * .06, .7 + k * .06, p), seed: 110 + k + d * 7, t: tau }); });
    // 书脊：竖着的短线，越远越密
    for (let j = 0; j < 22; j++) { const u = Math.pow(j / 22, .75), x = lerp(xo, vx + d * 70, u), s = lerp(1, .12, u);
      for (let k = 0; k < 4; k++) { const y0 = lerp(lerp(120, 820, k / 4), lerp(vy - 60, vy + 70, k / 4), u), y1 = lerp(lerp(120, 820, (k + 1) / 4), lerp(vy - 60, vy + 70, (k + 1) / 4), u);
        if (hash(j * 7 + k, 5 + d) < .2) continue; const hgt = (y1 - y0) * (.55 + hash(j + k * 31, 9) * .35);
        rline(c, [[x, y1 - 2], [x, y1 - hgt]], { w: 1 + 2.5 * s, color: alpha(P.ink, .35 + .4 * s), p: sm(.45 + u * .3, .6 + u * .3, p), seed: 130 + j * 5 + k, amp: .6 }); } }
  }
  // 尽头：一扇暗门和一盏小灯
  fade(c, sm(.6, .9, p), () => { c.fillStyle = alpha(P.ink, .55); c.fill(polyPath(rectPts(vx - 70, vy - 60, 140, 130))); cutPaper(c, circPts(vx, vy - 20, 9), P.moon, { seed: 151, step: 5, shadow: false }); });
  rline(c, [[vx - 70, vy + 70], [vx + 70, vy + 70]], { w: 2, color: P.ink, p: sm(.6, .8, p), seed: 150 });
  c.restore();
}
// 页边批注：一行手写 + 前面一个小墨点
function s0Note(c, text, x, y, tau, t0) { if (tau < t0) return;
  c.fillStyle = P.ink; c.beginPath(); c.arc(x - 22, y - 14, 5, 0, TAU); c.fill();
  zh(c, text, x, y, { size: 42, color: P.ink, p: writeP(tau, t0, text, .07) }); }
// 红色小印章「反面教材」
function s0Stamp(c, x, y, tau, t0) { const k = sm(t0, t0 + .18, tau, easeOut); if (k <= .001) return;
  const s = lerp(1.6, 1, k); c.save(); c.translate(x, y); c.rotate(-.12); c.scale(s, s); c.globalAlpha *= k;
  rline(c, rectPts(-150, -52, 300, 104, 8), { w: 6, color: P.red, close: true, seed: 161, amp: 1.8 });
  zh(c, '反面教材', 0, 20, { size: 60, align: 'center', color: P.red, weight: 500 }); c.restore(); }
// 书签：从书页上沿垂下来的一根丝带，末端剪成燕尾，下面手写页名
function s0Ribbon(c, x, len, col, label, tau, t0) { const k = sm(t0, t0 + .45, tau, easeOutBack); if (k <= .001) return;
  const L = len * k, sw = Math.sin(twos(tau) * 2.2 + x) * 3;
  cutPaper(c, [[x - 20, 30], [x + 20, 30], [x + 20 + sw, 30 + L], [x + sw, 30 + L - 22], [x - 20 + sw, 30 + L]], col, { seed: 170 + x % 13, step: 16 });
  zh(c, label, x + sw, 30 + L + 58, { size: 44, align: 'center', color: P.ink, p: writeP(tau, t0 + .3, label, .1) }); }
// 三个小涂鸦：熄灯后亮着的手机、椅子、外卖袋（墨线，一两笔）
function s0Doodle(c, kind, x, y, tau, t0) { const p = sm(t0, t0 + .6, tau); if (p <= 0) return; const o = { w: 4, color: P.ink, seed: 180 + x % 17, t: tau };
  if (kind === 'phone') { rshape(c, rectPts(x - 70, y - 70, 140, 140, 10), { fill: P.night, stroke: P.ink, w: 4, seed: 181, t: tau, al: p }); fade(c, p, () => { cutPaper(c, rectPts(x - 18, y - 32, 36, 64, 5), P.paper, { seed: 182, shadow: false }); c.fillStyle = P.paper; c.beginPath(); c.arc(x + 42, y - 44, 10, 0, TAU); c.fill(); c.fillStyle = P.night; c.beginPath(); c.arc(x + 47, y - 48, 9, 0, TAU); c.fill(); }); }
  if (kind === 'chair') { rline(c, [[x - 40, y - 80], [x - 40, y + 70], [x - 40, y], [x + 40, y], [x + 40, y + 70]], { ...o, p }); rline(c, [[x - 40, y - 80], [x - 20, y - 80]], { ...o, p }); }
  if (kind === 'bag') { rline(c, [[x - 50, y - 40], [x + 50, y - 40], [x + 60, y + 70], [x - 60, y + 70], [x - 50, y - 40]], { ...o, p }); rline(c, [[x - 20, y - 40], [x - 18, y - 70], [x + 18, y - 70], [x + 20, y - 40]], { ...o, p, seed: 185 }); }
  zh(c, { phone: '熬夜', chair: '久坐', bag: '外卖' }[kind], x, y + 130, { size: 40, align: 'center', color: P.ink2, p: writeP(tau, t0 + .4, '熬夜', .1) });
}

function s0Page(c, tau, L) {
  paperBg(c);
  const t1 = s0T(1), t2 = s0T(2), t3 = s0T(3), t4 = s0T(4), t5 = s0T(5), t6 = s0T(6), t7 = s0T(7), end = seqEnd(S0LINES);
  // 走廊：L1 画出来，L6 起淡掉
  s0Corridor(c, tau, sm(t1 - .4, t1 + 2.2, tau, easeOut), lerp(1, .22, sm(s0E(1), s0E(1) + .6, tau)) * (1 - sm(t6 - .2, t6 + .3, tau)));
  // 名字：她头边手写
  const nameA = 1 - sm(t6 - .2, t6 + .3, tau);
  if (tau >= t2 && nameA > 0) fade(c, nameA, () => { zh(c, '帕秋莉·诺蕾姬', 600, 300, { size: 52, color: P.ink, p: writeP(tau, t2 + .3, '帕秋莉·诺蕾姬', .09) });
    zh(c, 'Patchouli Knowledge', 604, 354, { size: 30, color: P.ink2, p: writeP(tau, t2 + 1.2, 'Patchouli Knowledge', .04) });
    rline(c, [[590, 380], [490, 450]], { w: 2, color: P.ink2, p: sm(t2 + .1, t2 + .5, tau), seed: 191, t: tau }); });
  // 页边批注 + 印章：盖在走廊右半边的一张小纸片上
  const noteA = 1 - sm(t6 - .2, t6 + .3, tau);
  if (tau >= t3 - .3 && noteA > 0) fade(c, noteA, () => {
    cutPaper(c, rectPts(1250, 470, 560, 330, 4), '#f4efe4', { seed: 201, step: 30, al: sm(t3 - .3, t3, tau) });
    s0Note(c, '外出：上个月一次。', 1310, 560, tau, t3 + .2);
    s0Note(c, '睡觉：看书看到天亮。', 1310, 640, tau, t3 + 1.2);
    s0Note(c, '哮喘：有。', 1310, 720, tau, t3 + 2.3);
    s0Stamp(c, 1560, 640, tau, t5 + 1.0);
  });
  // 五根书签
  const pages = [['睡眠', P.purple], ['吃饭', P.g2], ['动力', P.red], ['专注', P.blue], ['运动', P.green]];
  const ribA = 1 - sm(t7 - .2, t7 + .2, tau);
  if (ribA > 0) fade(c, ribA, () => pages.forEach(([lab, col], k) => s0Ribbon(c, 780 + k * 230, 360 + (k % 2) * 40, col, lab, tau, t6 + .4 + k * .62)));
  // 三个小涂鸦
  const dA = 1 - sm(end - .3, end, tau);
  if (dA > 0) fade(c, dA, () => [['phone', 880], ['chair', 1210], ['bag', 1540]].forEach(([k, x], i) => { c.save(); c.translate(x, 500); c.scale(1.5, 1.5); c.translate(-x, -500); s0Doodle(c, k, x, 500, tau, t7 + .4 + i * .5); c.restore(); }));
  // 帕秋莉：书页上的小剪纸人，站在左下
  const pose = tau < t2 ? 'stand' : tau < t3 ? 'lecture' : tau < t4 ? 'tired' : tau < t5 ? 'cross' : tau < t6 ? 'lecture' : tau < t7 ? 'point' : 'lecture';
  drawPatchouli(c, { x: 400, y: 900, h: 520, pose, mood: L.mood || 'normal', mouth: L.mouth, blink: blinkAt(tau, 3), look: pose === 'cross' ? -.5 : .4, t: tau, gesture: .6 + .4 * Math.sin(tau * 1.3) });
}

// 转场：从桌面推进右页（0.7 秒），推到底切到整页
const S0PUSH = () => [s0E(0) + .15, s0E(0) + .85];
scene({ order: 0, key: 'opening', title: '开场', dur: seqEnd(S0LINES) + 1.2, lines: S0LINES, noFlip: true,
  fn(c, tau, L) {
    const [p0, p1] = S0PUSH();
    if (tau < p1) { const k = sm(p0, p1, tau, easeIn), z = lerp(1, 3.2, k), fx = S0DESK.bx + S0DESK.pw / 2, fy = S0DESK.by;
      c.save(); c.translate(CX, CY); c.scale(z, z); c.translate(-lerp(CX, fx, k), -lerp(CY, fy, k)); s0Desk(c, tau); c.restore();
      if (k > .75) { c.fillStyle = alpha(P.paper, (k - .75) / .25); c.fillRect(0, 0, W, H); } }
    else s0Page(c, tau, L);
    if (tau >= p1) caption(c, '帕秋莉讲座 · 第 1 集', tau, p1 + .3);
  } });
