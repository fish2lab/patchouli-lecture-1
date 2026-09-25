'use strict';
// 第 0 段：开场（第三版，设计见 docs/第三版修改.md 第一节；范本是迪士尼经典片头的「故事书开场」）。
//   0–2.4 秒：斜看的桌上躺着一本厚魔导书（书页厚边、书脊竹节、四角铜包角、书口铜扣、底下露一截紫丝带），
//            桌上有墨水瓶和羽毛笔、茶杯和一圈茶渍、角落一小摞书。镜头从斜看转到正上方，金墨一笔笔画出双框、角花、
//            七曜阵（七个角依次出现「日月火水木金土」，阵心月牙）和「帕秋莉讲座 · 第 1 集」。
//   铜扣「咔」一下弹开 → 封面带透视翻开（露出大理石纹衬纸和藏书票）→ 书自己哗哗翻三页 → 停在标题页：
//   左页淡墨七曜阵慢慢转，右页扉页排版逐字写出 → 页底探出一顶月牙帽：「……看什么看。」
//   L1 起：左页一笔笔画出地下大图书馆；右页是帕秋莉、名字、页边批注、红印「反面教材」；
//   五根书签从书顶垂下（五页目录）；左页换成三个墨线涂鸦（熬夜、久坐、外卖）。
// 书的皮面、框、铜件、厚边是 kit 的 grimoireCover / grimoireEdge，片尾合上的书用的是同一套。
// 顶层名字一律带本段前缀 S0 / s0。
const S0LINES = seq(7.6, [
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

// 前 8 秒的节拍（秒）
const S0H = {
  crane: 2.4,                                                            // 镜头从斜看转到正上方
  frame: .1, flour: .6, ring: .45, star: .8, glyph: 1.12, glyphStep: .1, moon: 1.5, rule: 1.6, title: 1.7, sub: 2.1, glint: 2.28,   // 金墨
  pop: 2.55, snap: 2.95,                                                 // 铜扣：舌片弹出 → 扣带翻到封面上
  open0: 2.95, open1: 3.9,                                               // 封面翻开（镜头同时平移到整本摊开）
  riff: [4.15, 4.45, 4.75], riffDur: .55, spread: 5.3,                   // 哗哗翻三页，停在标题页
  series: 5.35, big1: 5.6, big2: 6.15, orn: 6.8, foot: 6.95, cap0: 7.0, cap1: 7.55,
};
const S0CW = BOOK.w / 2 + 20, S0X0 = CX - 10, S0YM = BOOK.y - 8 + (BOOK.h + 20) / 2;   // 合着的书：宽、书脊那边的 x、竖直中线
const S0EMB = { x: S0X0 + 468, y: BOOK.y + 380, r: 232 };                              // 封面七曜阵
const S0GLYPHS = ['日', '月', '火', '水', '木', '金', '土'];
// 桌上的东西（桌面坐标：正上方看、书摊开时就是屏幕坐标）。书摊开后左半边会被封面盖住，所以左边只放平的茶渍，
// 立着的东西放在书摊开后的画面外面：镜头推近时自然出画。
const S0INK = { x: 2130, y: 400 }, S0CUP = { x: 640, y: 1178 }, S0STAIN = { x: 610, y: 640, r: 58 }, S0STACK = { x: 520, y: -250 }, S0TAIL = { x: 1068, len: 92 };

// ===================== 镜头 =====================
// cam = { x, y 画面中心对着的桌面点, z 缩放, pitch 俯仰（0 = 正上方）}
function s0Cam(tau) { const u = sm(0, S0H.crane, tau, easeIO), v = sm(S0H.open0, S0H.open1, tau, easeIO), bx = S0X0 + S0CW / 2;
  return { pitch: lerp(-.78, 0, u), x: lerp(lerp(1330, bx, u), CX, v), y: lerp(lerp(565, S0YM, u), CY, v), z: lerp(lerp(.72, .94, u), 1, v) }; }
function s0Apply(c, cam) { c.translate(CX, CY); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); }
// s0P：桌面点 (X, Y) 高 Z → 屏幕 [x, y, 缩放]。Z = 0 时和 kit 的 tiltPlane 是同一个投影
function s0P(cam, X, Y, Z = 0) { const qx = (X - cam.x) * cam.z, d = (Y - cam.y) * cam.z, zz = Z * cam.z, cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const k = 1400 / (1400 + d * sp - zz * cp); return [CX + qx * k, CY + (d * cp + zz * sp) * k, k]; }
function s0Area(q) { let s = 0; for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function s0Hull(pts) { const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1)); }
function s0Ring(cam, X, Y, Z, r, n = 36) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, q = s0P(cam, X + r * Math.cos(a), Y + r * Math.sin(a), Z); o.push([q[0], q[1]]); } return o; }

// ===================== 桌面和桌上的东西 =====================
// 桌面：和 kit 的 desk() 同一套木纹线（每块 W×H、14 道），往外铺时左右隔块镜像，线在接缝处连得上；
// 正上方看、镜头在原位时和 desk() 一模一样（书摊开后 spread() 画的就是 desk()）；斜看时按透视投影，远处挤在一起
function s0Desk(c, cam) {
  c.fillStyle = WOOD; c.fillRect(0, 0, W, H);
  const hw = CX / cam.z + 40, hh = CY / cam.z + 40, flat = Math.abs(cam.pitch) < .002;
  const n0 = flat ? Math.floor((cam.x - hw) / W) : -1, n1 = flat ? Math.floor((cam.x + hw) / W) : 1, m0 = flat ? Math.floor((cam.y - hh) / H) : -2, m1 = flat ? Math.floor((cam.y + hh) / H) : 1;
  c.save(); c.strokeStyle = 'rgba(0,0,0,.25)';
  if (flat) { s0Apply(c, cam); c.lineWidth = 2; } else c.lineWidth = 2 * cam.z;
  for (let n = n0; n <= n1; n++) { const odd = n % 2 !== 0, fx = u => odd ? (n + 1) * W - u : n * W + u;
    for (let m = m0; m <= m1; m++) for (let k = 0; k < 14; k++) { const y = 30 + k * 78 + Math.sin(k * 1.7) * 12 + m * H;
      c.beginPath();
      if (flat) { c.moveTo(fx(0), y); c.bezierCurveTo(fx(W * .3), y + 10, fx(W * .6), y - 12, fx(W), y + 6); c.stroke(); continue; }
      let vis = false;
      for (let i = 0; i <= 24; i++) { const t = i / 24, s = 1 - t, bx = 3 * s * s * t * W * .3 + 3 * s * t * t * W * .6 + t * t * t * W,
        by = s * s * s * y + 3 * s * s * t * (y + 10) + 3 * s * t * t * (y - 12) + t * t * t * (y + 6), [sx, sy] = s0P(cam, fx(bx), by);
        if (sy > -20 && sy < H + 20) vis = true; i ? c.lineTo(sx, sy) : c.moveTo(sx, sy); }
      if (vis) c.stroke(); } }
  c.restore();
  c.save(); s0Apply(c, cam); grain(c, polyPath(rectPts(cam.x - 3 * hw, cam.y - 4 * hh, 6 * hw, 8 * hh)), .1); c.restore();
}
// 远处压暗（镜头斜的时候才有）
function s0Dusk(c, pit) { const a = clamp(-pit / .78, 0, 1); if (a <= .01) return;
  const g = c.createLinearGradient(0, 0, 0, H * .45); g.addColorStop(0, alpha('#0d0908', .78 * a)); g.addColorStop(1, alpha('#0d0908', 0)); c.fillStyle = g; c.fillRect(0, 0, W, H * .45); }
function s0Shadow(c, cam, pts, a = .34) { const q = pts.map(([X, Y]) => { const p = s0P(cam, X, Y, 0); return [p[0], p[1]]; });
  c.save(); c.fillStyle = `rgba(14,8,6,${a})`; c.shadowColor = `rgba(14,8,6,${a})`; c.shadowBlur = 16 * cam.z; c.fill(polyPath(q)); c.restore(); }
function s0Cyl(c, cam, X, Y, z0, r0, r1, hh, side, top, seed) { const lo = s0Ring(cam, X, Y, z0, r0), hi = s0Ring(cam, X, Y, z0 + hh, r1);
  cutPaper(c, s0Hull([...lo, ...hi]), side, { seed, step: 18, shadow: false, grain: .08 }); cutPaper(c, hi, top, { seed: seed + 1, step: 18, shadow: false, grain: .08 }); return hi; }
// s0Box：长方体看得见的侧面（背面剔除），返回顶面四角。face(i, quad)：i = 0 远 1 右 2 近 3 左（转过 rot 之后的局部方向），quad = [下, 下, 上, 上]
function s0Box(c, cam, X, Y, z0, bw, bd, bh, rot, face) { const co = Math.cos(rot), si = Math.sin(rot), at = (u, v, z) => { const q = s0P(cam, X + u * co - v * si, Y + u * si + v * co, z); return [q[0], q[1]]; };
  const base = [[-bw / 2, -bd / 2], [bw / 2, -bd / 2], [bw / 2, bd / 2], [-bw / 2, bd / 2]], lo = base.map(([u, v]) => at(u, v, z0)), hi = base.map(([u, v]) => at(u, v, z0 + bh));
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4, q = [lo[i], lo[j], hi[j], hi[i]]; if (s0Area(q) > 0) face(i, q); }
  return hi; }
const s0Lp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
// 一本书（角落那摞）：左边是书脊，其余三面是夹在两块书板之间的书页
function s0Tome(c, cam, X, Y, z0, bw, bd, bh, rot, cover, seed) {
  const top = s0Box(c, cam, X, Y, z0, bw, bd, bh, rot, (i, q) => {
    cutPaper(c, q, mix(cover, P.ink, i === 3 ? .15 : .25), { seed: seed + i, step: 30, shadow: false, grain: .1 }); if (i === 3) return;
    const [a, b, e, d] = q; cutPaper(c, [s0Lp(a, d, .2), s0Lp(b, e, .2), s0Lp(b, e, .8), s0Lp(a, d, .8)], P.paper2, { seed: seed + 10 + i, step: 40, shadow: false, grain: .1, edge: false }); });
  cutPaper(c, top, cover, { seed: seed + 5, step: 30, shadow: false, grain: .12 });
  const cen = top.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]);
  rline(c, top.map(p => s0Lp(p, cen, .16)), { w: 1.2, color: alpha(GRIMOIRE.gold, .5), close: true, seed: seed + 6, amp: .3 });
}
function s0Stack(c, cam) { const { x, y } = S0STACK;
  s0Shadow(c, cam, rectPts(x - 196, y - 130, 410, 290, 24));
  s0Tome(c, cam, x, y, 0, 380, 270, 54, .05, mix(P.purple, P.ink, .35), 3100);
  s0Tome(c, cam, x + 14, y - 6, 54, 340, 250, 46, -.09, mix(P.green, P.ink, .42), 3120);
  s0Tome(c, cam, x - 8, y + 4, 100, 300, 220, 40, .14, mix(P.red, P.ink, .45), 3140); }
// 墨水瓶（方玻璃瓶 + 圆瓶口 + 纸标签「墨」）和插在里面的羽毛笔
function s0Inkwell(c, cam) { const { x, y } = S0INK, glass = mix(P.night3, P.blue, .3);
  s0Shadow(c, cam, rectPts(x - 58, y - 52, 134, 130, 20));
  const top = s0Box(c, cam, x, y, 0, 118, 118, 72, .12, (i, q) => { cutPaper(c, q, mix(glass, P.ink, i === 2 ? .05 : .3), { seed: 3200 + i, step: 24, shadow: false, grain: .08 });
    if (i !== 2) return; const [a, b, e, d] = q, lb = [s0Lp(s0Lp(a, b, .22), s0Lp(d, e, .22), .2), s0Lp(s0Lp(a, b, .78), s0Lp(d, e, .78), .2), s0Lp(s0Lp(a, b, .78), s0Lp(d, e, .78), .78), s0Lp(s0Lp(a, b, .22), s0Lp(d, e, .22), .78)];
    cutPaper(c, lb, P.paper, { seed: 3204, step: 14, shadow: false, grain: .1 });
    const cx = (lb[0][0] + lb[2][0]) / 2, cy = (lb[0][1] + lb[2][1]) / 2, sz = Math.abs(lb[2][1] - lb[0][1]) * .72; if (sz > 6) zh(c, '墨', cx, cy, { size: sz, align: 'center', color: P.ink, base: 'middle' }); });
  cutPaper(c, top, mix(glass, P.cap, .12), { seed: 3205, step: 24, shadow: false, grain: .08 });
  s0Cyl(c, cam, x, y, 72, 30, 28, 24, mix(glass, P.ink, .2), mix(glass, P.cap, .1), 3210);
  cutPaper(c, s0Ring(cam, x, y, 96, 20), P.ink, { seed: 3212, step: 10, shadow: false, grain: 0, edge: false });
  // 羽毛笔：笔杆从瓶口斜向左后方立起，羽片是一片剪纸
  const b = s0P(cam, x + 4, y + 2, 92), e = s0P(cam, x - 80, y - 150, 380), dx = e[0] - b[0], dy = e[1] - b[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, A = [], B = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14, t = lerp(.24, 1, u), wv = Math.pow(Math.sin(Math.PI * lerp(.06, .94, u)), .7) * 24 * cam.z * lerp(b[2], e[2], t), px = b[0] + dx * t, py = b[1] + dy * t;
    A.push([px + nx * wv, py + ny * wv]); B.push([px - nx * wv * .7, py - ny * wv * .7]); }
  cutPaper(c, [...A, ...B.slice().reverse()], P.cap, { seed: 3220, step: 7, blur: 5, sx: 3, sy: 4, grain: .1 });
  c.save(); c.strokeStyle = alpha(P.g2, .6); c.lineWidth = 1; for (let i = 2; i < 13; i += 2) { const t = lerp(.24, 1, i / 14), px = b[0] + dx * t, py = b[1] + dy * t;
    c.beginPath(); c.moveTo(px, py); c.lineTo(A[i + 1][0], A[i + 1][1]); c.moveTo(px, py); c.lineTo(B[i + 1][0], B[i + 1][1]); c.stroke(); } c.restore();
  rline(c, [[b[0], b[1]], [e[0], e[1]]], { w: 2.4 * cam.z, color: mix(P.cap, P.g2, .45), seed: 3221, amp: .2 });
}
// 茶杯和托盘（瓷白、一道紫边），斜看时冒两缕热气
function s0Cup(c, cam, tau) { const { x, y } = S0CUP, por = P.cap, porS = mix(P.cap, P.g2, .32);
  s0Shadow(c, cam, ellPts(x + 8, y + 10, 108, 104, 32));
  s0Cyl(c, cam, x, y, 0, 94, 104, 7, porS, por, 3300);
  rline(c, s0Ring(cam, x, y, 7, 70), { w: 1.2, color: alpha(P.g2, .6), close: true, seed: 3302, amp: .3 });
  const hp = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI, q = s0P(cam, x + 58 + 20 * Math.cos(a), y, 41 + 20 * Math.sin(a)); hp.push([q[0], q[1]]); }
  rline(c, hp, { w: 10 * cam.z, color: porS, seed: 3303, amp: .2 }); rline(c, hp, { w: 5 * cam.z, color: por, seed: 3303, amp: .2 });
  s0Cyl(c, cam, x, y, 7, 42, 60, 62, porS, por, 3310);
  const band = []; for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI, q = s0P(cam, x + 55 * Math.cos(a), y + 55 * Math.sin(a), 52); band.push([q[0], q[1]]); }
  rline(c, band, { w: 5 * cam.z, color: P.purple, seed: 3312, amp: .2 });
  cutPaper(c, s0Ring(cam, x, y, 7 + 58, 53), mix(P.g3, P.moon, .3), { seed: 3313, step: 14, shadow: false, grain: .06, edge: false });
  const st = clamp(-cam.pitch / .5, 0, 1); if (st > .02) for (let k = 0; k < 2; k++) { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10, q = s0P(cam, x - 12 + k * 24 + Math.sin(u * 7 + tau * 2.5 + k * 2) * 12 * u, y - 6, 78 + u * 150); pts.push([q[0], q[1]]); }
    rline(c, pts, { w: 3.5 * cam.z, color: alpha(P.cap, .42 * st), smooth: true, seed: 3320 + k, amp: .3 }); }
}
// 茶渍：桌上一圈没擦干净的印子（平的，在书摊开后的封面底下）
function s0Stain(c) { const { x, y, r } = S0STAIN; c.save(); c.lineCap = 'round';
  c.strokeStyle = alpha(P.g2, .24); c.lineWidth = 7; c.beginPath(); c.arc(x, y, r, .5, 5.9); c.stroke();
  c.strokeStyle = alpha(P.g2, .14); c.lineWidth = 4; c.beginPath(); c.arc(x + 6, y - 3, r - 6, 2.2, 7.6); c.stroke();
  c.fillStyle = alpha(P.g2, .16); c.beginPath(); c.arc(x + r * 1.1, y + r * .8, 7, 0, TAU); c.fill(); c.restore(); }
// 紫丝带：从书底下露出来的一截，躺在桌上，末端燕尾。y0 = 露出来的起点，k = 露出来的长度比例（翻页时被拽回书里）
function s0Tail(c, y0, k) { const len = S0TAIL.len * k; if (len < 2) return;
  const x = S0TAIL.x, ang = .2, dx = Math.sin(ang), dy = Math.cos(ang), nx = dy, ny = -dx, hw = 15, ex = x + dx * len, ey = y0 + dy * len;
  cutPaper(c, [[x - nx * hw, y0 - ny * hw], [x + nx * hw, y0 + ny * hw], [ex + nx * hw, ey + ny * hw], [ex - dx * 16, ey - dy * 16], [ex - nx * hw, ey - ny * hw]], P.purple, { seed: 3401, step: 16, blur: 4, sx: 2, sy: 3, grain: .1 }); }

// ===================== 封面：七曜阵和标题 =====================
// s0Sigil：七曜阵——外双圈（圈间一串小点）、一笔画成的七芒星、内圈、七个角上的曜字圆章、阵心月牙。o 里是各部分画出进度 0..1
function s0Sigil(c, x, y, r, o = {}) {
  const { color, text = color, fill = null, w = 2.6, ring = 1, star = 1, glyphs = 7, moon = 1, moonColor = P.moon, rot = 0, seed = 1, beads = true } = o;
  const r2 = r - 12, va = k => rot - Math.PI / 2 + k * TAU / 7, vx = k => x + Math.cos(va(k)) * r2, vy = k => y + Math.sin(va(k)) * r2;
  rline(c, circPts(x, y, r, 120), { w, color, close: true, p: ring, seed, amp: .4 });
  rline(c, circPts(x, y, r2, 110), { w: w * .55, color, close: true, p: clamp(ring * 1.25 - .25, 0, 1), seed: seed + 1, amp: .4 });
  if (beads && ring >= 1) { c.save(); c.fillStyle = color; for (let k = 0; k < 21; k++) if (k % 3) { const a = rot - Math.PI / 2 + k * TAU / 21; c.beginPath(); c.arc(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6), w * .7, 0, TAU); c.fill(); } c.restore(); }
  const st = []; for (let i = 0; i <= 7; i++) { const k = (i * 3) % 7; st.push([vx(k), vy(k)]); }
  rline(c, st, { w: w * .8, color, p: star, seed: seed + 2, amp: .4 });
  rline(c, circPts(x, y, r * .33, 64), { w: w * .55, color, close: true, p: clamp(star * 1.4 - .4, 0, 1), seed: seed + 3, amp: .4 });
  const mr = r * .115;
  for (let k = 0; k < 7; k++) { const g = clamp(glyphs - k, 0, 1); if (g <= 0) continue;
    pop(c, vx(k), vy(k), easeOutBack(g), () => { if (fill) { c.fillStyle = fill; c.beginPath(); c.arc(vx(k), vy(k), mr, 0, TAU); c.fill(); }
      rline(c, circPts(vx(k), vy(k), mr, 28), { w: w * .6, color, close: true, seed: seed + 10 + k, amp: .3 });
      zh(c, S0GLYPHS[k], vx(k), vy(k) + 1, { size: mr * 1.25, align: 'center', color: text, base: 'middle' }); }); }
  if (moon > 0) drawMoonIcon(c, x, y, r * .2 * moon, moonColor, -.5);
}
// 标题下面的一道短金线（中间一粒菱形）
function s0Rule(c, x, y, p, color, seed) { if (p <= 0) return;
  rline(c, [[x - 20, y], [x - 170, y]], { w: 2, color, p, seed, amp: .3 }); rline(c, [[x + 20, y], [x + 170, y]], { w: 2, color, p, seed: seed + 1, amp: .3 });
  const k = sm(.5, 1, p, easeOutBack); if (k > 0) { c.save(); c.fillStyle = color; c.fill(polyPath([[x, y - 9 * k], [x + 9 * k, y], [x, y + 9 * k], [x - 9 * k, y]])); c.restore(); } }
// 封面上的纹样：第一帧就压印在皮面上（暗线），金墨沿着压印一笔笔画上去。tau 足够大时就是画完的封面
function s0CoverArt(c, tau) {
  const { x, y, r } = S0EMB, G = GRIMOIRE, H0 = S0H, lin = t => t, ty = BOOK.y + 810, sy = BOOK.y + 898;
  for (const [col, ox, oy] of [[alpha(P.cap, .07), 1.2, 1.6], [alpha(P.ink, .34), 0, 0]]) {
    s0Sigil(c, x + ox, y + oy, r, { color: col, w: 3.4, seed: 300, beads: false, moonColor: col });
    s0Rule(c, x + ox, BOOK.y + 690 + oy, 1, col, 330);
    zh(c, '帕秋莉讲座', x + ox, ty + oy, { size: 84, align: 'center', color: col }); zh(c, '第 1 集', x + ox, sy + oy, { size: 46, align: 'center', color: col }); }
  s0Sigil(c, x, y, r, { color: G.gold, fill: G.leather, w: 2.6, seed: 300, ring: sm(H0.ring, H0.ring + .6, tau, lin), star: sm(H0.star, H0.star + .6, tau, lin),
    glyphs: clamp((tau - H0.glyph) / H0.glyphStep, 0, 7), moon: sm(H0.moon, H0.moon + .35, tau, easeOutBack), moonColor: P.moon });
  s0Rule(c, x, BOOK.y + 690, sm(H0.rule, H0.rule + .35, tau, lin), G.gold, 330);
  zh(c, '帕秋莉讲座', x, ty, { size: 84, align: 'center', color: G.gold, p: writeP(tau, H0.title, '帕秋莉讲座', .08) });
  zh(c, '第 1 集', x, sy, { size: 46, align: 'center', color: G.gold, p: writeP(tau, H0.sub, '第 1 集', .05) });
  const gl = tau - H0.glint; if (gl > 0 && gl < .35) sparkle(c, x + r * .09, y - r * .12, 22 * Math.sin(gl / .35 * Math.PI), { color: P.cap, rot: gl * 2 });
}
const s0ClaspU = tau => sm(S0H.pop, S0H.snap, tau, t => t);
function s0Jolt(tau) { const t = tau - S0H.pop; return t > 0 && t < .3 ? Math.sin(t / .3 * Math.PI * 3) * 3.5 * (1 - t / .3) : 0; }
// 「咔」：舌片弹出的一瞬，书口外几道短线
function s0Click(c, tau) { const t = tau - S0H.pop; if (t < 0 || t > .24) return; const k = t / .24, x = S0X0 + S0CW + 4, y = S0YM;
  c.save(); c.globalAlpha *= 1 - k * k; c.strokeStyle = P.cap; c.lineWidth = 3; c.lineCap = 'round';
  for (const a of [-1.15, -.6, .6, 1.15]) { const r0 = 34 + 26 * k, r1 = r0 + 18; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); c.stroke(); }
  c.restore(); }
// 合着的书在桌面上平的部分（丝带、影子、书页、封面），画在 tiltPlane 的缓冲里；ext = 朝镜头那一面在桌面上占的深度
function s0BookFlat(c, tau, ext, jolt) {
  c.save(); c.translate(0, jolt);
  c.save(); c.shadowColor = 'rgba(12,6,4,.5)'; c.shadowBlur = 26; c.shadowOffsetY = 10; c.fillStyle = 'rgba(12,6,4,.3)'; c.fill(polyPath(rectPts(S0X0 - 6, BOOK.y, S0CW + 10, BOOK.h + 14 + ext, 12))); c.restore();
  s0Tail(c, BOOK.y + BOOK.h + 6 + ext * .7, 1);
  cutPaper(c, rectPts(S0X0 + 6, BOOK.y - 2, S0CW - 6, BOOK.h + 18, 6), BOOK.page2, { seed: 1210, step: 50, blur: 14, sx: 0, sy: 8, grain: .1 });
  grimoireCover(c, S0X0, S0CW, { frame: sm(S0H.frame, S0H.frame + .7, tau, t => t), flourish: sm(S0H.flour, S0H.flour + .4, tau, t => t), clasp: s0ClaspU(tau) });
  s0CoverArt(c, tau);
  s0Click(c, tau);
  c.restore();
}
// 0 → open0：桌上合着的书，镜头从斜看转到正上方
function s0Closed(c, tau) {
  const cam = s0Cam(tau), pit = cam.pitch, T = GRIMOIRE.thick, ext = T * Math.tan(-pit), jolt = s0Jolt(tau);
  s0Desk(c, cam);
  s0Stack(c, cam);
  tiltPlane(c, b => { b.save(); s0Apply(b, cam); s0Stain(b); s0BookFlat(b, tau, ext, jolt); b.restore(); }, { pitch: pit });
  if (pit < -.002) {   // 书朝镜头的那一面：厚边 + 垂下来的丝带
    const yb = BOOK.y + BOOK.h + 12 + jolt, [ax, ay] = s0P(cam, S0X0, yb), [bx, by] = s0P(cam, S0X0 + S0CW, yb), [, ey] = s0P(cam, S0X0, yb, -T);
    grimoireEdge(c, ax, ay, bx, by, ey - ay);
    const [rx, ry, rk] = s0P(cam, S0TAIL.x, yb), [, ry2] = s0P(cam, S0TAIL.x, yb, -T), hw = 15 * cam.z * rk, ym = ry + (ry2 - ry) * .45;
    cutPaper(c, [[rx - hw, ym], [rx + hw, ym], [rx + hw, ry2 + 3], [rx - hw, ry2 + 3]], P.purple, { seed: 3402, step: 20, shadow: false, grain: .1 });
  }
  s0Inkwell(c, cam); s0Cup(c, cam, tau);
  s0Dusk(c, pit);
}

// ===================== 封面翻开 =====================
// 大理石纹衬纸（载入时生成一次，确定性的）：先滴一层层颜料石（后滴的把先滴的挤成细纹），再用梳子拉成波纹
const S0MARBLE = (() => { const w = 480, h = 540, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), img = g.createImageData(w, h), d = img.data, r = rng(4401);
  const pal = [P.hair, P.hairDark, P.stripe, mix(P.purple, P.ink, .55), P.purple, P.hair, P.cap, P.hairDark, mix(P.purple, P.ink, .3), P.moon].map(parseColor), ground = parseColor(mix(P.purple, P.ink, .5)), drops = [];
  for (let k = 0; k < 190; k++) { const x = r() * w, y = r() * h, rr = 7 + r() * 20, c1 = pal[k % pal.length], c2 = pal[(k * 7 + 3) % pal.length]; drops.push([x, y, rr, c1], [x, y, rr * .5, c2]); }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // 倒着撤回：先撤梳子（竖着拉的波、横着拉的波），再从最后一滴往前撤
    let px = x, py = y - 22 * Math.sin(x * .06) - 6 * Math.sin(x * .23); px = px - 16 * Math.sin(py * .035 + 1.3); let col = ground;
    for (let k = drops.length - 1; k >= 0; k--) { const [cx, cy, rr, cc] = drops[k], dx = px - cx, dy = py - cy, d2 = dx * dx + dy * dy; if (d2 < rr * rr) { col = cc; break; } const s = Math.sqrt(1 - rr * rr / d2); px = cx + dx * s; py = cy + dy * s; }
    const i = (y * w + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; }
  g.putImageData(img, 0, 0); return cv; })();
// 封面内侧（翻开后在左边）：皮面的包边、大理石纹衬纸、藏书票
function s0Endpaper(c) {
  const x0 = BOOK.x - 10, y0 = BOOK.y - 8, w = CX - x0, h = BOOK.h + 20;
  cutPaper(c, rectPts(x0, y0, w, h, 10), mix(GRIMOIRE.leather, P.ink, .06), { seed: 2101, step: 28, blur: 12, sx: 0, sy: 6, grain: .14 });
  const mx = x0 + 28, my = y0 + 28, mw = w - 32, mh = h - 56, path = cutPaper(c, rectPts(mx, my, mw, mh, 3), P.purple, { seed: 2102, step: 40, shadow: false, grain: 0, edge: false });
  c.save(); c.clip(path); c.drawImage(S0MARBLE, mx, my, mw, mh);
  const g = c.createLinearGradient(CX, 0, CX - 120, 0); g.addColorStop(0, 'rgba(30,18,14,.35)'); g.addColorStop(1, 'rgba(30,18,14,0)'); c.fillStyle = g; c.fillRect(CX - 120, my, 120, mh); c.restore();
  grain(c, path, .1);
  // 藏书票
  const bx = (x0 + CX) / 2 + 6, by = BOOK.y + 440, bw = 300, bh = 400;
  cutPaper(c, rectPts(bx - bw / 2, by - bh / 2, bw, bh, 4), P.cap, { seed: 2110, step: 24, blur: 5, sx: 2, sy: 3, grain: .1 });
  rline(c, rectPts(bx - bw / 2 + 14, by - bh / 2 + 14, bw - 28, bh - 28), { w: 2.2, color: P.ink2, close: true, seed: 2111, amp: .5 });
  rline(c, rectPts(bx - bw / 2 + 21, by - bh / 2 + 21, bw - 42, bh - 42), { w: 1, color: P.ink2, close: true, seed: 2112, amp: .5 });
  zh(c, 'Ex Libris', bx, by - 108, { size: 46, align: 'center', color: P.ink });
  s0Sigil(c, bx, by + 6, 62, { color: P.ink2, w: 1.6, seed: 2113, glyphs: 0, moonColor: P.moon, beads: false });
  zh(c, '· 大图书馆 ·', bx, by + 140, { size: 44, align: 'center', color: P.ink });
}
// 封面翻开：封面绕书脊从右翻到左，逐列透视（翻到半空时离镜头最近、最大）。th π → 0；cam 是这时的镜头（正上方，正在平移）
const S0BUF = document.createElement('canvas');
function s0Swing(c, tau, th, cam) {
  const sc = c.getTransform().a || 1; if (S0BUF.width !== Math.round(W * sc)) { S0BUF.width = Math.round(W * sc); S0BUF.height = Math.round(H * sc); }
  const b = S0BUF.getContext('2d'); b.setTransform(sc, 0, 0, sc, 0, 0); b.clearRect(0, 0, W, H);
  const face = Math.cos(th) > 0;   // true：看到的是封面内侧（衬纸）；false：封面
  if (face) s0Endpaper(b); else { grimoireCover(b, S0X0, S0CW, { clasp: 1 }); s0CoverArt(b, 99); }
  const f = 2900, y0 = BOOK.y - 8, y1 = BOOK.y + BOOK.h + 12, step = 3, span = face ? CX - (BOOK.x - 10) : S0CW, hx = face ? CX : S0X0;
  const col = s => { const k = f / (f - s * Math.sin(th) * cam.z); return [CX + (hx - s * Math.cos(th) - cam.x) * cam.z * k, k]; };
  const shade = .36 * (1 - Math.abs(Math.cos(th)));
  for (let s = 0; s < span; s += step) {
    const [xa, ka] = col(s), [xb] = col(Math.min(span, s + step)), xs = face ? CX - s - step : S0X0 + s;
    const dx = Math.min(xa, xb), dw = Math.abs(xb - xa) + .7; if (dw < .05) continue;
    const top = CY + (y0 - cam.y) * cam.z * ka, hh = (y1 - y0) * cam.z * ka;
    c.drawImage(S0BUF, xs * sc, y0 * sc, step * sc, (y1 - y0) * sc, dx, top, dw, hh);
    if (shade > .01) { c.fillStyle = `rgba(20,12,10,${shade * (face ? 1 : .7)})`; c.fillRect(dx, top, dw, hh); }
  }
}
// open0 → open1：封面翻开，镜头平移到整本摊开的书（open1 时正好是 spread 的画面）
function s0Opening(c, tau) {
  const cam = s0Cam(tau), th = Math.PI * (1 - sm(S0H.open0, S0H.open1, tau, easeIO));
  s0Desk(c, cam);
  c.save(); s0Apply(c, cam); s0Stain(c);
  c.save(); c.beginPath(); c.rect(CX - 12, -4000, 8000, 9000); c.clip(); spread(c, tau); c.restore();
  s0Tail(c, BOOK.y + BOOK.h + 6, 1);
  const sh = Math.sin(th); if (sh > .02) { const wv = S0CW * Math.abs(Math.cos(th)) + 160, side = Math.cos(th) < 0 ? 1 : -1, g = c.createLinearGradient(CX, 0, CX + side * wv, 0);
    g.addColorStop(0, `rgba(20,12,10,${.4 * sh})`); g.addColorStop(1, 'rgba(20,12,10,0)'); c.fillStyle = g; c.fillRect(Math.min(CX, CX + side * wv), BOOK.y - 8, wv, BOOK.h + 20); }
  c.restore();
  s0Inkwell(c, cam);
  s0Swing(c, tau, th, cam);
}

// ===================== 翻页和标题页 =====================
function s0HalfTitle(c) { const R = BOOK.R, x = R.x + R.w / 2;
  drawMoonIcon(c, x, R.y + 360, 26, alpha(P.moon, .55), -.5); zh(c, '帕秋莉讲座', x, R.y + 440, { size: 34, align: 'center', color: alpha(P.ink, .4) }); }
// 衬纸 → 哗哗翻三页（第二页是只有一弯月牙的半标题页）。丝带同时被拽回书里
function s0Riffle(c, tau) {
  const us = S0H.riff.map(t0 => (tau - t0) / S0H.riffDur), started = us.filter(u => u > 0).length, landed = us.filter(u => u >= 1).length, R = BOOK.R;
  s0Tail(c, BOOK.y + BOOK.h + 6, 1 - sm(S0H.riff[0], S0H.spread, tau));
  if (landed === 0) s0Endpaper(c);
  if (started === 1) s0HalfTitle(c);
  const moving = [0, 1, 2].filter(k => us[k] > 0 && us[k] < 1), onLeft = k => easeIO(us[k]) >= .5;
  for (const k of [...moving.filter(onLeft), ...moving.filter(k => !onLeft(k)).reverse()]) { turnPage(c, us[k]);
    if (k === 1 && !onLeft(k)) { const e = easeIO(us[k]), cw = R.w * Math.cos(e * Math.PI), lift = Math.sin(e * Math.PI) * 36;
      c.save(); c.clip(polyPath([[CX, R.y], [CX + cw, R.y - lift], [CX + cw, R.y + R.h + lift], [CX, R.y + R.h]])); c.translate(CX, 0); c.scale(cw / R.w, 1); c.translate(-CX, 0); s0HalfTitle(c); c.restore(); } }
}
// 左页：淡墨七曜阵，画出来之后慢慢转
function s0Frontis(c, tau, al) { const t0 = S0H.spread, p = sm(t0, t0 + .9, tau, t => t); if (p <= 0 || al <= 0) return; const Lp = BOOK.L;
  fade(c, al, () => s0Sigil(c, Lp.x + Lp.w / 2, Lp.y + Lp.h / 2 - 40, 300, { color: alpha(P.ink, .3), text: alpha(P.ink, .5), fill: BOOK.page, w: 2.2, seed: 40,
    ring: sm(0, .45, p, t => t), star: sm(.3, .75, p, t => t), glyphs: 7 * sm(.45, 1, p, t => t), moon: sm(.75, 1, p, easeOutBack), moonColor: alpha(P.moon, .8), rot: (tau - t0) * .12 })); }
// 花饰分隔线：两道细线从月牙往两边伸，末端卷起来
function s0Ornament(c, x, y, p) { if (p <= 0) return;
  for (const sx of [-1, 1]) { const m = pts => pts.map(([u, v]) => [x + sx * u, y + v]);
    rline(c, spline(m([[34, 0], [120, -3], [190, 2], [226, -6], [232, -16], [222, -20], [216, -12]]), 4), { w: 2, color: P.ink2, p, seed: 2201 + sx, amp: .4 });
    rline(c, spline(m([[60, 7], [140, 9], [180, 6]]), 4), { w: 1.2, color: P.ink2, p: sm(.3, 1, p, t => t), seed: 2203 + sx, amp: .4 });
    const k = sm(.6, 1, p, easeOutBack); if (k > 0) { c.save(); c.fillStyle = P.ink2; const [dx, dy] = m([[250, -4]])[0]; c.beginPath(); c.arc(dx, dy, 3.5 * k, 0, TAU); c.fill(); c.restore(); } }
  drawMoonIcon(c, x, y - 2, 20 * sm(0, .5, p, easeOutBack), P.moon, -.5); }
// 右页：扉页（小字系列名夹在两道细线里、两行大字标题、带月牙的花饰分隔线、页底藏书处）
function s0TitlePage(c, tau, al) { if (tau < S0H.series || al <= 0) return; const R = BOOK.R, x = R.x + R.w / 2, lin = t => t;
  c.save(); c.globalAlpha *= al;
  const rp = sm(S0H.series, S0H.series + .4, tau, lin);
  for (const [yy, lw, sd] of [[R.y + 158, 1.8, 2211], [R.y + 166, .9, 2212], [R.y + 236, .9, 2213], [R.y + 244, 1.8, 2214]]) rline(c, [[x - 240, yy], [x + 240, yy]], { w: lw, color: P.ink2, p: rp, seed: sd, amp: .4 });
  zh(c, '帕秋莉讲座 · 第 1 集', x, R.y + 213, { size: 34, align: 'center', color: P.ink2, p: writeP(tau, S0H.series + .1, '帕秋莉讲座 · 第 1 集', .03) });
  zh(c, '我是帕秋莉，', x, R.y + 405, { size: 88, align: 'center', color: P.ink, p: writeP(tau, S0H.big1, '我是帕秋莉，', .09) });
  zh(c, '我来教你调理身体！', x, R.y + 528, { size: 78, align: 'center', color: P.ink, p: writeP(tau, S0H.big2, '我来教你调理身体！', .08) });
  s0Ornament(c, x, R.y + 628, sm(S0H.orn, S0H.orn + .4, tau, lin));
  zh(c, '红魔馆 · 地下大图书馆 藏', x, R.y + 830, { size: 28, align: 'center', color: P.ink2, p: writeP(tau, S0H.foot, '红魔馆 · 地下大图书馆 藏', .03) });
  c.restore(); }

// ===================== L1 之后（图书馆、批注、红印、书签、涂鸦） =====================
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
// L7 的三个墨线涂鸦：熬夜（被窝里亮着的手机、2:00）、久坐（椅子上瘫着的小人）、外卖（带小票和热气的外卖袋）。(x, y) 是涂鸦中心
function s0Doodle(c, kind, x, y, tau, t0) { const p = sm(t0, t0 + .9, tau, t => t); if (p <= 0) return;
  const o = { w: 4, color: P.ink, t: tau, amp: .9 }, seg = (a, b) => clamp((p - a) / (b - a), 0, 1), M = pts => pts.map(([u, v]) => [x + u, y + v]);
  if (kind === 'phone') {
    rline(c, M([[-150, 100], [150, 100]]), { ...o, w: 3, p: seg(0, .2), seed: 1801 });
    rline(c, M([[-146, 100], [-150, 50], [-128, -4], [-78, -42], [-10, -56], [58, -38], [110, -2], [138, 52], [146, 100]]), { ...o, smooth: true, p: seg(.05, .45), seed: 1802 });
    rline(c, M([[20, -40], [48, 10], [58, 96]]), { ...o, w: 2.5, smooth: true, p: seg(.3, .45), seed: 1803 });
    rline(c, M([[84, -12], [100, 40], [104, 96]]), { ...o, w: 2.5, smooth: true, p: seg(.35, .5), seed: 1804 });
    fade(c, seg(.4, .55), () => cutPaper(c, M([[-132, 96], [-128, 40], [-100, 8], [-50, -2], [-8, 14], [8, 58], [4, 96]]), P.ink, { seed: 1805, step: 10, shadow: false, grain: .08 }));
    fade(c, seg(.5, .7), () => { spin(c, x - 40, y + 50, -.22, () => { cutPaper(c, rectPts(x - 58, y + 18, 36, 62, 6), P.paper, { seed: 1806, step: 12, shadow: false, grain: .06 });
      rline(c, M([[-52, 36], [-30, 36]]), { w: 2, color: P.g2, seed: 1807, amp: .3 }); rline(c, M([[-52, 46], [-36, 46]]), { w: 2, color: P.g2, seed: 1808, amp: .3 }); });
      for (const [ax, ay] of [[-96, 44], [-80, 44]]) { c.fillStyle = P.paper; c.beginPath(); c.ellipse(x + ax, y + ay, 5, 3.4, 0, 0, TAU); c.fill(); }
      c.save(); c.strokeStyle = alpha(P.paper, .7); c.lineWidth = 2; c.lineCap = 'round'; for (const a of [-2.5, -2.05, -1.6]) { c.beginPath(); c.moveTo(x - 40 + Math.cos(a) * 44, y + 50 + Math.sin(a) * 44); c.lineTo(x - 40 + Math.cos(a) * 60, y + 50 + Math.sin(a) * 60); c.stroke(); } c.restore(); });
    zh(c, '2:00', x + 70, y - 70, { size: 46, align: 'center', color: P.ink, p: writeP(tau, t0 + .55, '2:00', .08) });
    fade(c, seg(.7, .85), () => drawMoonIcon(c, x + 128, y - 92, 16, P.moon, -.5));
  }
  if (kind === 'chair') {
    rline(c, M([[-78, -104], [-58, -104], [-50, 26], [-72, 26], [-78, -104]]), { ...o, p: seg(0, .25), seed: 1811 });
    rline(c, M([[-72, 30], [52, 30]]), { ...o, w: 5, p: seg(.1, .3), seed: 1812 }); rline(c, M([[-66, 42], [48, 42]]), { ...o, w: 3, p: seg(.15, .35), seed: 1813 });
    rline(c, M([[-8, 42], [-8, 92]]), { ...o, p: seg(.25, .4), seed: 1814 }); rline(c, M([[-70, 108], [-8, 92], [56, 108]]), { ...o, p: seg(.3, .45), seed: 1815 });
    for (const [cx0, sd] of [[-70, 1816], [56, 1817]]) rline(c, circPts(x + cx0, y + 114, 7, 12), { ...o, w: 3, close: true, p: seg(.4, .5), seed: sd });
    // 瘫着的小人：头往前垂，背弓着滑下去，两腿伸直，一只手耷拉着
    rline(c, circPts(x - 4, y - 52, 24, 24), { ...o, close: true, p: seg(.4, .55), seed: 1818 });
    rline(c, M([[-22, -34], [-46, -8], [-50, 26]]), { ...o, w: 4.5, smooth: true, p: seg(.5, .62), seed: 1819 });
    rline(c, M([[-46, 24], [26, 20], [96, 94], [118, 92]]), { ...o, w: 4.5, p: seg(.58, .75), seed: 1820 });
    rline(c, M([[-34, -20], [-18, 22], [-12, 62]]), { ...o, w: 4, smooth: true, p: seg(.68, .8), seed: 1821 });
    rline(c, M([[-14, -54], [-4, -52]]), { w: 3, color: P.ink, seed: 1822, p: seg(.8, .85), amp: .3 }); rline(c, M([[4, -50], [12, -48]]), { w: 3, color: P.ink, seed: 1823, p: seg(.8, .85), amp: .3 });
    rline(c, M([[22, -40], [34, -48], [44, -40], [56, -48], [66, -40]]), { w: 2.5, color: P.g2, smooth: true, p: seg(.85, 1), seed: 1824, amp: .4 });
  }
  if (kind === 'bag') {
    const sway = k => Math.sin(tau * 2.2 + k * 2.1) * 7;
    rline(c, M([[-40, -30], [-36, -54], [40, -54], [36, -30]]), { ...o, w: 3, p: seg(0, .2), seed: 1831 }); rline(c, M([[-38, -46], [38, -46]]), { ...o, w: 2, p: seg(.1, .25), seed: 1832 });
    rline(c, M([[22, -40], [74, -118]]), { ...o, w: 3, p: seg(.15, .3), seed: 1833 }); rline(c, M([[32, -38], [88, -110]]), { ...o, w: 3, p: seg(.2, .35), seed: 1834 });
    rline(c, M([[-78, -30], [78, -30], [88, 112], [-88, 112], [-78, -30]]), { ...o, p: seg(.2, .5), seed: 1835 });
    rline(c, M([[-78, -12], [80, -12]]), { ...o, w: 2, p: seg(.4, .55), seed: 1836 });
    for (const [a, sd] of [[-1, 1837], [1, 1838]]) rline(c, spline(M([[a * 58, -30], [a * 52, -72], [a * 22, -74], [a * 16, -30]]), 4), { ...o, w: 3.5, p: seg(.45, .6), seed: sd });
    fade(c, seg(.55, .7), () => { spin(c, x - 14, y + 44, .08, () => {
      cutPaper(c, M([[-46, 4], [18, 4], [18, 84], [10, 78], [2, 84], [-6, 78], [-14, 84], [-22, 78], [-30, 84], [-38, 78], [-46, 84]]), P.paper, { seed: 1839, step: 10, blur: 3, sx: 1.5, sy: 2 });
      for (let k = 0; k < 4; k++) rline(c, M([[-38, 22 + k * 13], [k === 3 ? -4 : 8, 22 + k * 13]]), { w: 2, color: P.g2, seed: 1840 + k, amp: .3 });
      rline(c, M([[-24, 2], [-6, 2]]), { w: 3, color: P.ink2, seed: 1845, amp: .2 }); }); });
    for (let k = 0; k < 3; k++) { const bx = -20 + k * 20, pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([x + bx + Math.sin(u * 6 + k) * 8 + sway(k) * u, y - 62 - u * 70]); }
      rline(c, pts, { w: 3, color: P.g2, smooth: true, p: seg(.65 + k * .08, .85 + k * .05), seed: 1850 + k, amp: .4, t: tau }); }
  }
  const lab = { phone: '熬夜', chair: '久坐', bag: '外卖' }[kind];
  zh(c, lab, x, y + 196, { size: 44, align: 'center', color: P.ink2, p: writeP(tau, t0 + .5, lab, .1) });
}

scene({ order: 0, key: 'opening', title: '开场', dur: seqEnd(S0LINES) + 1.2, lines: S0LINES, noFlip: true,
  fn(c, tau, L) {
    if (tau < S0H.open0) { s0Closed(c, tau); return; }
    if (tau < S0H.open1) { s0Opening(c, tau); return; }
    const t1 = s0T(1), t2 = s0T(2), t3 = s0T(3), t4 = s0T(4), t5 = s0T(5), t6 = s0T(6), t7 = s0T(7), end = seqEnd(S0LINES);
    const R = BOOK.R, Lp = BOOK.L, edge = R.y + R.h;
    spread(c, tau);
    // 衬纸 → 翻页 → 标题页（L0 结束后收走，给 L1 的图书馆腾地方）
    if (tau < S0H.spread) s0Riffle(c, tau);
    const tA = 1 - sm(s0E(0) + .1, s0E(0) + .6, tau);
    if (tA > 0) { s0Frontis(c, tau, tA); s0TitlePage(c, tau, tA); }
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
    // 左页：三个墨线涂鸦
    fade(c, 1 - sm(end - .3, end, tau), () => [['phone', Lp.x + 180], ['chair', Lp.x + 450], ['bag', Lp.x + 720]].forEach(([k, x], i) => s0Doodle(c, k, x, Lp.y + 400, tau, t7 + .4 + i * .5)));
    // 帕秋莉：先从右页下沿探头，L0 后整个人立在右页左下
    const talk0 = L.line === S0LINES[0][2];
    if (tau < s0E(0) + .3) { const up = sm(S0H.cap0, S0H.cap1, tau, easeOutBack);
      if (up > .001) { c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
        drawPatchouli(c, { x: R.x + R.w - 145, y: edge + lerp(260, 0, up), h: 560, pose: 'peek', mood: talk0 ? 'pout' : 'normal', look: -.6, mouth: talk0 ? L.mouth : 0, blink: blinkAt(tau, 4), t: tau }); c.restore(); } }
    else { const pop = sm(s0E(0) + .3, s0E(0) + .7, tau, easeOutBack);
      const pose = tau < t2 ? 'stand' : tau < t3 ? 'lecture' : tau < t4 ? 'tired' : tau < t5 ? 'cross' : tau < t6 ? 'lecture' : tau < t7 ? 'point' : 'lecture';
      c.save(); c.translate(R.x + 190, 900); c.scale(1, pop); c.translate(-(R.x + 190), -900);
      drawPatchouli(c, { x: R.x + 190, y: 900, h: 560, pose, mood: L.mood || 'normal', mouth: L.mouth, blink: blinkAt(tau, 3), look: pose === 'cross' ? .5 : -.4, facing: -1, t: tau, gesture: .6 + .4 * Math.sin(tau * 1.3) }); c.restore(); }
  } });
