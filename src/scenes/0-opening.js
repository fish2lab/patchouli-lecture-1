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
  const cx = 470, cy = 800;   // 蜡烛
  paperBg(c, { color: P.paper2, lines: false });
  s0Stain(c, 520, 300, 52); s0InkBottle(c, 1540, 640); s0OpenBook(c, tau);
  const { bx, by, pw } = S0DESK;
  zh(c, '帕秋莉讲座', bx - pw / 2, by - 40, { size: 58, align: 'center', color: P.ink, p: writeP(tau, H0.sub, '帕秋莉讲座', .09) });
  zh(c, '第 一 集', bx - pw / 2, by + 50, { size: 40, align: 'center', color: P.ink2, p: writeP(tau, H0.sub + .5, '第 一 集', .09) });
  rline(c, [[bx - pw / 2 - 90, by + 80], [bx - pw / 2 + 90, by + 80]], { w: 2, color: P.ink2, p: sm(H0.sub + .9, H0.sub + 1.3, tau), seed: 81, t: tau });
  zh(c, '我是帕秋莉，', bx + pw / 2, by - 50, { size: 64, align: 'center', color: P.ink, p: writeP(tau, H0.big1, '我是帕秋莉，', .1) });
  zh(c, '我来教你调理身体！', bx + pw / 2, by + 40, { size: 56, align: 'center', color: P.ink, p: writeP(tau, H0.big2, '我来教你调理身体！', .09) });
  // 书后升起一顶月牙帽：她扒着书的下沿探头
  const up = sm(H0.cap0, H0.cap1, tau, easeOutBack);
  if (up > .001) { const { ph } = S0DESK, edge = by + ph / 2 + 12;
    c.save(); c.beginPath(); c.rect(0, 0, W, edge); c.clip();
    const L = lineAt(S0LINES, tau), talking = L && L.text === S0LINES[0][2];
    drawPatchouli(c, { x: bx + 250, y: edge + lerp(260, 0, up), h: 520, pose: 'peek', mood: talking ? 'pout' : 'normal', look: -.6, mouth: talking ? mouthAt(tau, L) : 0, blink: blinkAt(tau, 4), t: tau });
    c.restore(); }
  s0Candle(c, cx, cy, 1.1, tau, sm(H0.lit - .1, H0.lit + .15, tau));
  // 烛光：以蜡烛为光心的一块光斑，边界随火苗呼吸；点燃前全黑
  const k = sm(H0.light0, H0.light1, tau, easeOut), fx = cx, fy = cy - 160;
  const pool = orbPool(tau, { x: lerp(fx, CX - 20, k), y: lerp(fy, CY + 10, k), rx: 830 * k + 1, ry: 500 * k + 1, flick: 1.4 });
  darkness(c, pool, { center: [fx, fy], falloff: .5, soft: 60 });
}

// ===================== 吊灯下 =====================
// 页边批注：粉笔字 + 前面一个粉笔点
function s0Note(c, text, x, y, tau, t0) { if (tau < t0) return;
  c.fillStyle = CHALK; c.beginPath(); c.arc(x - 22, y - 14, 5, 0, TAU); c.fill();
  chalk(c, text, x, y, { size: 44, p: writeP(tau, t0, text, .07) }); }
// 红粉笔圈出来的「反面教材」
function s0Stamp(c, x, y, tau, t0) { const k = sm(t0, t0 + .18, tau, easeOut); if (k <= .001) return;
  const s = lerp(1.5, 1, k); c.save(); c.translate(x, y); c.rotate(-.12); c.scale(s, s); c.globalAlpha *= k;
  rline(c, rectPts(-150, -52, 300, 104, 8), { w: 6, color: '#d27b77', close: true, seed: 161, amp: 1.8 });
  zh(c, '反面教材', 0, 20, { size: 60, align: 'center', color: '#d27b77', weight: 500 }); c.restore(); }
// 书签：钉在黑板上框的一根剪纸丝带，末端剪成燕尾，下面粉笔写页名
function s0Ribbon(c, x, y0, len, col, label, tau, t0) { const k = sm(t0, t0 + .45, tau, easeOutBack); if (k <= .001) return;
  const L = len * k, sw = Math.sin(twos(tau) * 2.2 + x) * 3;
  cutPaper(c, [[x - 20, y0], [x + 20, y0], [x + 20 + sw, y0 + L], [x + sw, y0 + L - 22], [x - 20 + sw, y0 + L]], col, { seed: 170 + x % 13, step: 16 });
  chalk(c, label, x + sw, y0 + L + 58, { size: 44, align: 'center', p: writeP(tau, t0 + .3, label, .1) }); }
// 三个粉笔小涂鸦：熄灯后亮着的手机、椅子、外卖袋
function s0Doodle(c, kind, x, y, tau, t0) { const p = sm(t0, t0 + .6, tau); if (p <= 0) return; const o = { w: 4, color: CHALK, seed: 180 + x % 17, t: tau };
  if (kind === 'phone') { rline(c, rectPts(x - 30, y - 55, 60, 110, 8), { ...o, close: true, p }); fade(c, p, () => { c.fillStyle = alpha(CHALK, .35); c.fill(polyPath(rectPts(x - 22, y - 45, 44, 80, 4))); }); rline(c, [[x + 55, y - 70], [x + 70, y - 90]], { ...o, p }); rline(c, [[x + 60, y - 50], [x + 82, y - 55]], { ...o, p }); }
  if (kind === 'chair') { rline(c, [[x - 40, y - 80], [x - 40, y + 70], [x - 40, y], [x + 40, y], [x + 40, y + 70]], { ...o, p }); rline(c, [[x - 40, y - 80], [x - 20, y - 80]], { ...o, p }); }
  if (kind === 'bag') { rline(c, [[x - 50, y - 40], [x + 50, y - 40], [x + 60, y + 70], [x - 60, y + 70], [x - 50, y - 40]], { ...o, p }); rline(c, [[x - 20, y - 40], [x - 18, y - 70], [x + 18, y - 70], [x + 20, y - 40]], { ...o, p, seed: 185 }); }
  chalk(c, { phone: '熬夜', chair: '久坐', bag: '外卖' }[kind], x, y + 130, { size: 40, align: 'center', p: writeP(tau, t0 + .4, '熬夜', .1) });
}
const S0BOARD = { x: 860, y: 210, w: 820, h: 500 };
function s0Page(c, tau, L) {
  const t1 = s0T(1), t2 = s0T(2), t3 = s0T(3), t4 = s0T(4), t5 = s0T(5), t6 = s0T(6), t7 = s0T(7), end = seqEnd(S0LINES), [, p1] = S0PUSH();
  // 地面和空气：暖纸；上面立黑板，帕秋莉站在灯下
  paperBg(c, { color: P.paper2, lines: false });
  // 地板的木纹：几条极淡的横线
  for (let k = 0; k < 6; k++) rline(c, [[0, 880 + k * k * 6], [W, 880 + k * k * 6]], { w: 1.5, color: alpha(P.ink, .08), seed: 300 + k });
  const { x: bx, y: by, w: bw, h: bh } = S0BOARD, B = chalkboard(c, bx, by, bw, bh, tau);
  // 黑板上的内容（粉笔）
  const wipe = (a, b) => 1 - sm(a - .25, a + .1, tau) + (b ? 0 : 0);
  if (tau >= t2) fade(c, 1 - sm(t6 - .3, t6, tau), () => {
    chalk(c, '帕秋莉·诺蕾姬', B.x + 30, B.y + 80, { size: 60, p: writeP(tau, t2 + .3, '帕秋莉·诺蕾姬', .09) });
    chalk(c, 'Patchouli Knowledge', B.x + 36, B.y + 134, { size: 32, al: .7, p: writeP(tau, t2 + 1.2, 'Patchouli Knowledge', .04) });
    s0Note(c, '外出：上个月一次。', B.x + 70, B.y + 250, tau, t3 + .2);
    s0Note(c, '睡觉：看书看到天亮。', B.x + 70, B.y + 330, tau, t3 + 1.2);
    s0Note(c, '哮喘：有。', B.x + 70, B.y + 410, tau, t3 + 2.3);
    s0Stamp(c, B.x + 470, B.y + 330, tau, t5 + 1.0);
  });
  const pages = [['睡眠', P.purple], ['吃饭', P.g2], ['动力', P.red], ['专注', P.blue], ['运动', P.green]];
  fade(c, 1 - sm(t7 - .3, t7, tau), () => pages.forEach(([lab, col], k) => s0Ribbon(c, B.x + 70 + k * 160, by - 18, 230 + (k % 2) * 36, col, lab, tau, t6 + .4 + k * .62)));
  fade(c, 1 - sm(end - .3, end, tau), () => [['phone', B.x + 130], ['chair', B.x + 370], ['bag', B.x + 610]].forEach(([k, x], i) => s0Doodle(c, k, x, B.y + 200, tau, t7 + .4 + i * .5)));
  // 帕秋莉：站在灯下
  const pose = tau < t2 ? 'stand' : tau < t3 ? 'lecture' : tau < t4 ? 'tired' : tau < t5 ? 'cross' : tau < t6 ? 'lecture' : tau < t7 ? 'point' : 'lecture';
  drawPatchouli(c, { x: 620, y: 920, h: 540, pose, mood: L.mood || 'normal', mouth: L.mouth, blink: blinkAt(tau, 3), look: pose === 'cross' ? -.5 : .4, t: tau, gesture: .6 + .4 * Math.sin(tau * 1.3) });
  // 吊灯亮起：烛火一支支点燃，光锥从灯下展开
  const lit = sm(p1 + .1, t1 + .6, tau), grow = sm(p1 + .3, t1 + 1.2, tau, easeOut), lx = 1060, ly = 118;
  const cone = lampCone(tau, { x: lx, y0: ly + 20, y1: 900, top: 520, bottom: 1640, ry: 120, lampY: ly }).map(([x, y]) => [lerp(lx, x, grow), lerp(ly, y, grow)]);
  const hole = darkness(c, cone, { center: [lx, ly + 200], falloff: .42, soft: 70 });
  // 暗处的书架（只在亮区外）
  c.save(); const out = new Path2D(); out.rect(0, 0, W, H); out.addPath(hole); c.clip(out, 'evenodd'); darkShelves(c, tau, { al: .5 * sm(p1, t1 + 1, tau) }); c.restore();
  chandelier(c, lx, ly, tau, { lit });
}

// 转场：从桌面推进右页（0.7 秒），推到底切到整页
const S0PUSH = () => [s0E(0) + .15, s0E(0) + .85];
scene({ order: 0, key: 'opening', title: '开场', dur: seqEnd(S0LINES) + 1.2, lines: S0LINES, noFlip: true,
  fn(c, tau, L) {
    const [p0, p1] = S0PUSH();
    if (tau < p1) { const k = sm(p0, p1, tau, easeIn), z = lerp(1, 3.2, k), fx = S0DESK.bx + S0DESK.pw / 2, fy = S0DESK.by;
      c.save(); c.translate(CX, CY); c.scale(z, z); c.translate(-lerp(CX, fx, k), -lerp(CY, fy, k)); s0Desk(c, tau); c.restore();
      if (k > .6) { c.fillStyle = alpha(P.night, (k - .6) / .4); c.fillRect(0, 0, W, H); } }
    else s0Page(c, tau, L);
    if (tau >= p1) chapterMark(c, '帕秋莉讲座 · 第 1 集', tau, p1 + .6);
  } });
