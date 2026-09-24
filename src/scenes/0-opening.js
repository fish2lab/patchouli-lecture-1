'use strict';
// 第 0 段：开场（第二版，见 docs/画风v2.md）。
//   桌上一本合着的魔导书，封面用金墨写出「帕秋莉讲座 · 第 1 集」→ 封面翻开 → 右页写出标题 → 页底探出一顶月牙帽：「……看什么看。」
//   左页一笔笔画出地下大图书馆（尖拱、书墙、梯子、吊灯、飘着的书）；右页是帕秋莉（剪纸人偶）、名字、页边批注、红印「反面教材」；
//   五根书签从书顶垂下（五页目录）；左页换成三个小涂鸦（熬夜、久坐、外卖）。
// 顶层名字一律带本段前缀 S0 / s0。
const S0LINES = seq(6.6, [
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

const S0H = { cover: .3, gold0: .5, open0: 2.3, open1: 3.2, sub: 3.4, big1: 3.9, big2: 4.6, cap0: 5.5, cap1: 6.3 };
// 封面（合着的书）：皮面、剪纸月牙徽记、金墨标题
function s0Cover(c, tau, x0, w) {
  const { y, h } = BOOK;
  cutPaper(c, rectPts(x0, y - 8, w, h + 20, 10), '#5b3034', { seed: 1201, step: 28, blur: 16, sx: 0, sy: 8, grain: .14 });
  rline(c, rectPts(x0 + 40, y + 30, w - 80, h - 60, 6), { w: 2, color: alpha(P.moon, .55), close: true, seed: 1202, p: sm(S0H.gold0, S0H.gold0 + 1, tau) });
  const cx = x0 + w / 2;
  drawMoonIcon(c, cx, y + 300, 70 * sm(S0H.gold0 + .2, S0H.gold0 + .6, tau, easeOutBack), P.moon, -.5);
  zh(c, '帕秋莉讲座', cx, y + 520, { size: 76, align: 'center', color: '#d8bf85', p: writeP(tau, S0H.gold0 + .6, '帕秋莉讲座', .12) });
  zh(c, '第 1 集', cx, y + 610, { size: 44, align: 'center', color: alpha('#d8bf85', .8), p: writeP(tau, S0H.gold0 + 1.3, '第 1 集', .1) });
}
// 左页：地下大图书馆（墨线插图）。p 画出进度，al 透明度
function s0Library(c, tau, p, al = 1) {
  if (p <= 0 || al <= 0) return; const L = BOOK.L, x0 = L.x + 70, x1 = L.x + L.w - 70, y0 = L.y + 100, y1 = L.y + L.h - 250, mx = (x0 + x1) / 2;
  c.save(); c.globalAlpha *= al; const ink = { color: P.ink, t: tau, amp: 1 };
  // 尖拱（双线）
  const arch = (dx, dy) => { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = u * Math.PI / 2; pts.push([x0 + dx + (mx - x0 - dx) * (1 - Math.cos(a)) * 1, y0 + dy + 210 - Math.sin(a) * (210 + dy * .3)]); } return pts; };
  const L1 = arch(0, 0), R1 = L1.map(([x, y]) => [2 * mx - x, y]).reverse();
  rline(c, [[x0, y1], ...L1, ...R1, [x1, y1]], { ...ink, w: 4, p: sm(0, .25, p), seed: 1301 });
  const L2 = arch(28, 22), R2 = L2.map(([x, y]) => [2 * mx - x, y]).reverse();
  rline(c, [[x0 + 28, y1], ...L2, ...R2, [x1 - 28, y1]], { ...ink, w: 2, p: sm(.05, .3, p), seed: 1302 });
  // 书墙：几层隔板 + 书脊（竖短线，高矮不齐，偶尔一本斜靠）
  const sx0 = x0 + 50, sx1 = x1 - 50;
  for (let r = 0; r < 5; r++) { const y = y0 + 250 + r * 92; if (y > y1 - 20) break; const pr = sm(.25 + r * .06, .45 + r * .06, p);
    rline(c, [[sx0, y], [sx1, y]], { ...ink, w: 2.5, p: pr, seed: 1310 + r });
    let x = sx0 + 6, k = 0; while (x < sx1 - 10) { const hgt = 50 + hash(k + r * 97, 3) * 30, bw = 9 + hash(k + r * 41, 5) * 12, lean = hash(k * 7 + r, 9) < .06;
      if (x < lerp(sx0, sx1, pr)) { if (lean) rline(c, [[x, y], [x + 22, y - hgt]], { ...ink, w: 2, seed: 1400 + k + r * 50 }); else { rline(c, [[x, y], [x, y - hgt], [x + bw, y - hgt], [x + bw, y]], { ...ink, w: 1.6, seed: 1400 + k + r * 50, amp: .6 });
        if (hash(k + r * 13, 11) < .25) { c.fillStyle = alpha([P.purple, P.red, P.blue, P.green][k % 4], .35); c.fillRect(x + 1, y - hgt + 1, bw - 2, hgt - 2); } } }
      x += bw + (lean ? 26 : 1); k++; } }
  // 梯子
  rline(c, [[sx1 - 150, y1], [sx1 - 70, y0 + 260]], { ...ink, w: 3, p: sm(.55, .7, p), seed: 1501 }); rline(c, [[sx1 - 100, y1], [sx1 - 20, y0 + 260]], { ...ink, w: 3, p: sm(.55, .7, p), seed: 1502 });
  for (let k = 1; k < 9; k++) { const u = k / 9; rline(c, [[lerp(sx1 - 150, sx1 - 70, u), lerp(y1, y0 + 260, u)], [lerp(sx1 - 100, sx1 - 20, u), lerp(y1, y0 + 260, u)]], { ...ink, w: 2, p: sm(.62 + u * .1, .7 + u * .1, p), seed: 1510 + k }); }
  // 两盏吊灯：铁链 + 灯罩 + 一点金色火苗
  for (const [lx, len] of [[x0 + 150, 170], [x1 - 150, 130]]) { const sway = Math.sin(tau * .8 + lx) * 4, pp = sm(.7, .85, p);
    rline(c, [[lx, y0 + 40], [lx + sway, y0 + 40 + len]], { ...ink, w: 1.5, p: pp, seed: 1520 + lx % 7 });
    if (pp > .9) { rline(c, [[lx + sway - 22, y0 + 40 + len], [lx + sway + 22, y0 + 40 + len], [lx + sway + 12, y0 + 70 + len], [lx + sway - 12, y0 + 70 + len], [lx + sway - 22, y0 + 40 + len]], { ...ink, w: 2.5, seed: 1530 + lx % 7 });
      cutPaper(c, [[lx + sway - 6, y0 + 70 + len], [lx + sway, y0 + 50 + len + 36 + Math.sin(twos(tau) * 9) * 3], [lx + sway + 6, y0 + 70 + len]], P.moon, { seed: 1540 + lx % 7, step: 4, shadow: false }); } }
  // 地面：几条透视线
  for (let k = -3; k <= 3; k++) rline(c, [[mx + k * 30, y1], [mx + k * 90, y1 + 70]], { ...ink, w: 1.2, color: alpha(P.ink, .4), p: sm(.8, .95, p), seed: 1550 + k });
  rline(c, [[x0 - 20, y1], [x1 + 20, y1]], { ...ink, w: 3, p: sm(.78, .9, p), seed: 1560 });
  // 飘着的书（剪纸小书，上下浮）
  [[mx - 120, y0 + 170, .3, P.purple], [mx + 90, y0 + 120, -.2, P.red], [mx + 10, y0 + 210, .1, P.blue]].forEach(([bx, by, rot, col], k) => { const a = sm(.85 + k * .04, .95 + k * .04, p); if (a <= 0) return;
    const yy = by + Math.sin(tau * 1.1 + k * 2) * 8; c.save(); c.globalAlpha *= a; c.translate(bx, yy); c.rotate(rot + Math.sin(tau * .7 + k) * .06);
    cutPaper(c, rectPts(-26, -18, 52, 36, 3), col, { seed: 1570 + k, step: 10 }); cutPaper(c, rectPts(-22, -14, 44, 6, 1), P.page || '#efe6d2', { seed: 1580 + k, step: 10, shadow: false }); c.restore(); });
  zh(c, '红魔馆 · 地下大图书馆', mx, y1 + 125, { size: 38, align: 'center', color: P.ink2, p: writeP(tau, 0, '红魔馆 · 地下大图书馆', .06) * sm(.85, 1, p) });
  c.restore();
}
function s0Note(c, text, x, y, tau, t0) { if (tau < t0) return;
  c.fillStyle = P.ink; c.beginPath(); c.arc(x - 22, y - 14, 5, 0, TAU); c.fill();
  zh(c, text, x, y, { size: 42, color: P.ink, p: writeP(tau, t0, text, .07) }); }
function s0Stamp(c, x, y, tau, t0) { const k = sm(t0, t0 + .18, tau, easeOut); if (k <= .001) return;
  const s = lerp(1.6, 1, k); c.save(); c.translate(x, y); c.rotate(-.12); c.scale(s, s); c.globalAlpha *= k * .9;
  rline(c, rectPts(-150, -52, 300, 104, 8), { w: 6, color: P.red, close: true, seed: 161, amp: 1.8 });
  zh(c, '反面教材', 0, 20, { size: 60, align: 'center', color: P.red, weight: 500 }); c.restore(); }
// 书签：从书顶垂下来的丝带，末端燕尾，下面手写页名
function s0Ribbon(c, x, len, col, label, tau, t0) { const k = sm(t0, t0 + .45, tau, easeOutBack); if (k <= .001) return;
  const y0 = BOOK.y - 30, L = len * k, sw = Math.sin(twos(tau) * 2.2 + x) * 3;
  cutPaper(c, [[x - 20, y0], [x + 20, y0], [x + 20 + sw, y0 + L], [x + sw, y0 + L - 22], [x - 20 + sw, y0 + L]], col, { seed: 170 + x % 13, step: 16 });
  zh(c, label, x + sw, y0 + L + 58, { size: 46, align: 'center', color: P.ink, p: writeP(tau, t0 + .3, label, .1) }); }
function s0Doodle(c, kind, x, y, tau, t0) { const p = sm(t0, t0 + .6, tau); if (p <= 0) return; const o = { w: 4, color: P.ink, seed: 180 + x % 17, t: tau };
  if (kind === 'phone') { rline(c, rectPts(x - 60, y - 60, 120, 120, 10), { ...o, close: true, p }); fade(c, p, () => { cutPaper(c, rectPts(x - 60, y - 60, 120, 120, 10), P.ink, { seed: 181, shadow: false, step: 30 }); cutPaper(c, rectPts(x - 16, y - 30, 32, 58, 5), '#f4efe2', { seed: 182, shadow: false, step: 10 }); zh(c, '2:00', x, y + 48, { size: 22, align: 'center', color: P.g1 }); }); }
  if (kind === 'chair') { rline(c, [[x - 40, y - 80], [x - 40, y + 70], [x - 40, y], [x + 40, y], [x + 40, y + 70]], { ...o, p }); rline(c, [[x - 40, y - 80], [x - 20, y - 80]], { ...o, p }); }
  if (kind === 'bag') { rline(c, [[x - 50, y - 40], [x + 50, y - 40], [x + 60, y + 70], [x - 60, y + 70], [x - 50, y - 40]], { ...o, p }); rline(c, [[x - 20, y - 40], [x - 18, y - 70], [x + 18, y - 70], [x + 20, y - 40]], { ...o, p, seed: 185 }); }
  zh(c, { phone: '熬夜', chair: '久坐', bag: '外卖' }[kind], x, y + 140, { size: 42, align: 'center', color: P.ink2, p: writeP(tau, t0 + .4, '熬夜', .1) });
}

scene({ order: 0, key: 'opening', title: '开场', dur: seqEnd(S0LINES) + 1.2, lines: S0LINES, noFlip: true,
  fn(c, tau, L) {
    const t1 = s0T(1), t2 = s0T(2), t3 = s0T(3), t4 = s0T(4), t5 = s0T(5), t6 = s0T(6), t7 = s0T(7), end = seqEnd(S0LINES);
    const R = BOOK.R, Lp = BOOK.L, edge = R.y + R.h;
    // 开头：镜头从斜上方看桌上合着的书，随着金墨写出标题慢慢转到正上方（立体感）
    if (tau < S0H.open0) { const pit = lerp(-.9, 0, sm(0, S0H.open0 - .5, tau, easeIO)), z = lerp(.92, 1, sm(0, S0H.open0, tau, easeIO)), cw = BOOK.w / 2 + 20;
      const x0 = lerp(CX - cw / 2, CX - 10, sm(S0H.open0 - .6, S0H.open0, tau, easeIO));
      c.fillStyle = WOOD; c.fillRect(0, 0, W, H);
      c.save(); c.translate(CX, CY); c.scale(z, z); c.translate(-CX, -CY);
      tiltPlane(c, b => { desk(b); s0Cover(b, tau, x0, cw); }, { pitch: pit, cy: CY });
      c.restore(); return; }
    spread(c, tau);
    // 封面翻开：盖在左页上的封面从右往左翻过去
    const oc = sm(S0H.open0, S0H.open1, tau, easeIO);
    // 标题：右页写出，L0 结束后淡掉
    const tA = 1 - sm(s0E(0) + .1, s0E(0) + .6, tau);
    if (tA > 0) fade(c, tA, () => {
      zh(c, '帕秋莉讲座 · 第 1 集', R.x + R.w / 2, R.y + 250, { size: 40, align: 'center', color: P.ink2, p: writeP(tau, S0H.sub, '帕秋莉讲座 · 第 1 集', .06) });
      zh(c, '我是帕秋莉，', R.x + R.w / 2, R.y + 420, { size: 80, align: 'center', color: P.ink, p: writeP(tau, S0H.big1, '我是帕秋莉，', .11) });
      zh(c, '我来教你调理身体！', R.x + R.w / 2, R.y + 540, { size: 72, align: 'center', color: P.ink, p: writeP(tau, S0H.big2, '我来教你调理身体！', .1) });
      drawMoonIcon(c, Lp.x + Lp.w / 2, Lp.y + Lp.h / 2 - 40, 90 * sm(S0H.open1, S0H.open1 + .5, tau, easeOutBack), alpha(P.moon, .7), -.5);
    });
    // 左页：图书馆（L1 画出，L6 起淡下去让给书签，L7 换成涂鸦）
    s0Library(c, tau, sm(t1 - .3, t1 + 3.4, tau), 1 - sm(t6 - .2, t6 + .3, tau));
    pageHeader(c, '序 · 帕秋莉的大图书馆', tau, s0E(0) + .5, { t1: t6 - .3 });
    // 右页：名字、批注、印章
    const rA = 1 - sm(t6 - .3, t6, tau);
    if (tau >= t2 && rA > 0) fade(c, rA, () => {
      zh(c, '帕秋莉·诺蕾姬', R.x + 330, R.y + 150, { size: 58, color: P.ink, p: writeP(tau, t2 + .3, '帕秋莉·诺蕾姬', .09) });
      zh(c, 'Patchouli Knowledge', R.x + 334, R.y + 200, { size: 30, color: P.ink2, p: writeP(tau, t2 + 1.2, 'Patchouli Knowledge', .04) });
      rline(c, [[R.x + 320, R.y + 190], [R.x + 250, R.y + 290]], { w: 2, color: P.ink2, p: sm(t2 + .1, t2 + .5, tau), seed: 191, t: tau });
      s0Note(c, '外出：上个月一次。', R.x + 400, R.y + 380, tau, t3 + .2);
      s0Note(c, '睡觉：看书看到天亮。', R.x + 400, R.y + 460, tau, t3 + 1.2);
      s0Note(c, '哮喘：有。', R.x + 400, R.y + 540, tau, t3 + 2.3);
      s0Stamp(c, R.x + 600, R.y + 470, tau, t5 + 1.0);
    });
    // 五根书签
    const pages = [['睡眠', P.purple], ['吃饭', P.g2], ['动力', P.red], ['专注', P.blue], ['运动', P.green]];
    fade(c, 1 - sm(t7 - .3, t7, tau), () => pages.forEach(([lab, col], k) => s0Ribbon(c, Lp.x + 120 + k * 170, 360 + (k % 2) * 60, col, lab, tau, t6 + .4 + k * .62)));
    // 左页：三个小涂鸦
    fade(c, 1 - sm(end - .3, end, tau), () => [['phone', Lp.x + 180], ['chair', Lp.x + 430], ['bag', Lp.x + 680]].forEach(([k, x], i) => s0Doodle(c, k, x, Lp.y + 420, tau, t7 + .4 + i * .5)));
    // 帕秋莉：先从右页下沿探头，L0 后整个人立在右页左下
    const talk0 = L.line === S0LINES[0][2];
    if (tau < s0E(0) + .3) { const up = sm(S0H.cap0, S0H.cap1, tau, easeOutBack);
      if (up > .001) { c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
        drawPatchouli(c, { x: R.x + R.w - 190, y: edge + lerp(260, 0, up), h: 560, pose: 'peek', mood: talk0 ? 'pout' : 'normal', look: -.6, mouth: talk0 ? L.mouth : 0, blink: blinkAt(tau, 4), t: tau }); c.restore(); } }
    else { const pop = sm(s0E(0) + .3, s0E(0) + .7, tau, easeOutBack);
      const pose = tau < t2 ? 'stand' : tau < t3 ? 'lecture' : tau < t4 ? 'tired' : tau < t5 ? 'cross' : tau < t6 ? 'lecture' : tau < t7 ? 'point' : 'lecture';
      c.save(); c.translate(R.x + 190, 900); c.scale(1, pop); c.translate(-(R.x + 190), -900);
      drawPatchouli(c, { x: R.x + 190, y: 900, h: 560, pose, mood: L.mood || 'normal', mouth: L.mouth, blink: blinkAt(tau, 3), look: pose === 'cross' ? .5 : -.4, facing: -1, t: tau, gesture: .6 + .4 * Math.sin(tau * 1.3) }); c.restore(); }
    // 封面还在翻
    if (oc < 1) { const cw = (BOOK.w / 2 + 20) * Math.cos(oc * Math.PI), x0 = cw >= 0 ? CX - 10 : CX - 10 + cw;
      c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fillStyle = cw >= 0 ? '#5b3034' : '#4a282b'; c.fillRect(x0, BOOK.y - 8, Math.abs(cw), BOOK.h + 20); c.restore();
      if (cw > 40) { c.save(); c.beginPath(); c.rect(x0, BOOK.y - 8, Math.abs(cw), BOOK.h + 20); c.clip(); c.translate(CX - 10, 0); c.scale(cw / (BOOK.w / 2 + 20), 1); c.translate(-(CX - 10), 0); s0Cover(c, tau, CX - 10, BOOK.w / 2 + 20); c.restore(); } }
  } });
