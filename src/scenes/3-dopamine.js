'use strict';
// 第 3 段：动力（多巴胺）——第二版「图画展览会」式编配：一根线的三维过山车。
// 艺术理念：La Linea 式单线画。纸面上只有一根墨线：先是地面线，一笔画出书堆、趴着的学生和他头上的一团乱线；
// 乱线被拉开，镜头从贴地升起，这根线就成了向远处延伸的线轨（多巴胺曲线，z 方向是时间，高度是多巴胺）。
// 基线是一张水平的地平面（点阵 + 地平线），线轨低于它的那段下面垂一片浅红（低谷）；快乐门槛是一层半透明雾面。
// 帕秋莉（剪纸）站在小纸车里骑着线走：冲上高峰、坠进深谷、慢慢爬回；最后线自己折成楼梯，她一级级走上去，每级冒金色火花，
// 火花升起布满夜空 → handoffSparks（交给「专注」）。
// 顶层名字一律带本段前缀 S3 / s3。
const S3LINES = seq(1.0, [
  ['第三页：为什么考试周什么都不想干？聊聊多巴胺。', { hold: .6 }],
  ['多巴胺管的是“想要”和“动力”。平时，它待在一条基线上。', { hold: .6 }],
  ['爽到的时候它冲高，冲完却会掉到基线以下，还要待上一阵。', { hold: 1.4 }],
  ['刷短视频：一条比一条刺激，快乐的门槛越抬越高。', { hold: 1.0 }],
  ['刷完两小时再看课本，当然一点感觉都没有。', { mood: 'annoyed', hold: .6 }],
  ['快乐还会叠加：边吃饭、边追剧、边回消息，峰越高，坑越深。', { hold: .9 }],
  ['对策一：别每次都叠满 buff，偶尔只做事情本身。', { hold: .6 }],
  ['对策二：把努力本身，当成奖励。', { mood: 'smile', hold: .9 }],
  ['“我正在变强”——这个念头，也能让多巴胺出来干活。', { pause: .2, hold: .7 }],
  ['只盯着考完那顿大餐，过程就只剩硬熬。', { mood: 'smug', pause: .2, hold: .8 }],
]);
const s3T = i => S3LINES[i][0], s3E = i => S3LINES[i][1];
const S3END = seqEnd(S3LINES), S3DUR = S3END + 2.3;
const S3K = 1.6;   // 线轨世界的比例（线轨单位 × S3K = 镜头空间）
const s3Pj = (p, cam) => proj([p[0] * S3K, p[1] * S3K, p[2] * S3K], cam);
const S3GY = 800, S3INK = P.ink, S3POOL = mix(P.red, P.paper, .5), S3F = 900;
const s3Lin = x => x;
// s3Key：关键帧，每帧可带自己的缓动 [t, v, ease]
function s3Key(t, K) { if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t < K[i][0]) { const [t0, a] = K[i - 1], [t1, b, e = easeIO] = K[i], u = e((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u); }
  return K.at(-1)[1]; }

// ===================== 2D：La Linea 地面线，一笔画出书堆 + 趴着的学生 + 头上一团乱线 =====================
const S3C = (() => {
  const pts = [], kind = [], add = (p, k = 0) => { pts.push(p); kind.push(k); }, G = S3GY;
  // 一摞书（五本，左边错开）
  [[580, G], [580, G - 34], [592, G - 34], [592, G - 64], [574, G - 64], [574, G - 96], [586, G - 96], [586, G - 124], [596, G - 124], [596, G - 152], [626, G - 152]].forEach(p => add(p));
  // 胳膊搭在书上，头趴在胳膊上；头顶冒出一团乱线
  spline([[626, G - 152], [636, G - 166], [668, G - 170]], 4).forEach(p => add(p));
  const hc = [704, G - 206], hr = 46, arc = (a0, a1, n) => { for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; add([hc[0] + Math.cos(a) * hr, hc[1] + Math.sin(a) * hr]); } };
  arc(Math.PI * .66, Math.PI * 1.45, 14);
  const head = pts.at(-1).slice(), tg = [];
  for (let i = 0; i <= 120; i++) { const a = i * .47, r = 1 + .35 * noise1(i * .21, 7);
    tg.push([hc[0] - 4 + (52 * Math.cos(a) + 22 * Math.cos(a * 2.3 + 1)) * r + 10 * Math.sin(i * .05), hc[1] - 150 + (26 * Math.sin(a * 1.1) + 13 * Math.sin(a * 3.1)) * r]); }
  spline([head, [head[0] - 6, head[1] - 34], tg[0]], 5).forEach(p => add(p, 1)); spline(tg, 5).forEach(p => add(p, 1)); spline([tg.at(-1), [head[0] + 10, head[1] - 40], head], 5).forEach(p => add(p, 1));
  arc(Math.PI * 1.45, Math.PI * 1.86, 8);
  // 驼着的背，一路弯到地上
  spline([pts.at(-1), [792, G - 238], [850, G - 196], [884, G - 120], [896, G - 40], [900, G]], 5).forEach(p => add(p));
  const acc = [0]; for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const x0 = pts[0][0], x1 = pts.at(-1)[0], flat = acc.map(a => [lerp(x0, x1, a / acc.at(-1)), S3GY]);
  const tIdx = kind.map((k, i) => k ? i : -1).filter(i => i >= 0);
  return { pts, kind, flat, x0, x1, head, tA: tIdx[0], tB: tIdx.at(-1) };
})();
// 2D 线：tau 时刻地面线（含书堆轮廓）的点
function s3Line2D(tau) {
  const T0 = s3T(0), T1 = s3T(1), C = S3C, out = [];
  const drop = sm(.2, 1.0, tau, easeOutElastic);   // 横线一扭，落到地面
  const pull = sm(T1 + .5, T1 + 1.5, tau);          // 被拉开：乱线先解开，书堆再摊平
  const wave = (x, y) => y + Math.sin(x / 260 - tau * 9) * 34 * (1 - sm(.2, 1.1, tau)) * sm(.2, .35, tau);
  const yG = lerp(CY, S3GY, drop);
  for (let x = -20; x < C.x0; x += 16) out.push([x, wave(x, yG)]);
  const hd = [lerp(C.flat[C.tA][0], C.head[0], 0), 0];
  C.pts.forEach((p, i) => {
    const f = [C.flat[i][0], wave(C.flat[i][0], yG)]; let m;
    if (C.kind[i]) { const j = (i - C.tA) / (C.tB - C.tA); m = sm(T0 + 2.2 + j * .9, T0 + 2.3 + j * .9, tau) * (1 - sm(T1 + .5 + (1 - j) * .6, T1 + .6 + (1 - j) * .6, tau)); }
    else { const h = (S3GY - p[1]) / 260; m = Math.max(0, sm(T0 + .2 + h * 1.1, T0 + .55 + h * 1.1, tau, easeOutBack) * (1 - sm(T1 + 1.0, T1 + 1.5, tau, easeOutBack))); }   // 摊平时 easeOutBack 会冲过头，别压到地面以下
    if (C.kind[i]) { // 乱线的点在没画出来 / 解开后缩回头顶（落点也跟着横线起伏，否则线上有个台阶）
      const hm = Math.max(0, sm(T0 + .2 + (S3GY - C.head[1]) / 260 * 1.1, T0 + .55 + (S3GY - C.head[1]) / 260 * 1.1, tau, easeOutBack) * (1 - sm(T1 + 1.0, T1 + 1.5, tau, easeOutBack)));
      const hp = [lerp(C.flat[C.tA][0], C.head[0], hm), lerp(wave(C.flat[C.tA][0], yG), C.head[1], hm)]; out.push([lerp(hp[0], p[0], m), lerp(hp[1], p[1], m)]); }
    else out.push([lerp(f[0], p[0], m), lerp(f[1], p[1], m)]);
  });
  for (let x = C.x1 + 16; x <= W + 20; x += 16) out.push([x, wave(x, yG)]);
  return out;
}

// ===================== 3D：线轨 =====================
// 线轨上一点：s 是纵深（时间），高度 v（多巴胺，像素，向上为正），x 缓缓蜿蜒
const s3X = s => 150 * Math.sin(s / 1400 + .4);
// 一次起伏：xs 起 → xp 峰（高 a）→ xf 落到谷底（深 d）→ xe 谷底结束 → xr 回到基线
function s3Ev(xp, a, d, o) { const { up, dn, flat, back } = o; return { xs: xp - up, xp, a, xf: xp + dn, d, xe: xp + dn + flat, xr: xp + dn + flat + back }; }
function s3Lift(s, e) {
  if (s <= e.xs || s >= e.xr) return 0;
  if (s < e.xp) return e.a * easeSine((s - e.xs) / (e.xp - e.xs));
  if (s < e.xf) return lerp(e.a, -e.d, easeSine((s - e.xp) / (e.xf - e.xp)));
  if (s < e.xe) return -e.d;
  return -e.d * (1 - easeSine((s - e.xe) / (e.xr - e.xe)));
}
const S3PH = k => 3150 + 430 * k, S3PA = k => 200 + 90 * k, S3FOG = [170, 260, 350, 440, 530];
const S3ST = { s0: 8950, w: 165, r: 112, n: 7 }, S3SEND = S3ST.s0 + S3ST.n * S3ST.w + 230;   // 台阶；线轨到台阶顶再往前一点就收笔
const s3Tk = k => s3T(3) + 1.25 + k * .95;              // 第 k 个手机峰：小车到峰顶的时刻
const s3Step = i => i === 0 ? s3T(7) + 2.3 : s3T(8) + .3 + (i - 1) * .85;   // 第 i 级台阶落脚（0..6）
// 这一刻线轨的形状
function s3Shape(tau) {
  const T = s3T, ev = [];
  // L2：一个峰 + 基线以下的低谷
  ev.push(s3Ev(1450, 520 * sm(T(2) + .15, T(2) + 1.0, tau, easeOutBack), 300 * sm(T(2) + 2.0, T(2) + 2.6, tau, easeOutElastic), { up: 520, dn: 330, flat: 480, back: 650 }));
  // L3：手机，一峰比一峰高
  for (let k = 0; k < 4; k++) { const tk = s3Tk(k); ev.push(s3Ev(S3PH(k), S3PA(k) * sm(tk - 1.4, tk - .9, tau, easeOutBack), (70 + 15 * k) * sm(tk + .1, tk + .5, tau, easeOutElastic), { up: 200, dn: 130, flat: 30, back: 70 })); }
  // L4：课本，几乎是平的
  ev.push(s3Ev(4950, 26 * sm(T(4) + 1.4, T(4) + 1.9, tau, easeOutElastic), 0, { up: 90, dn: 90, flat: 1, back: 1 }));
  // L5：叠加，超高峰、超深坑
  ev.push(s3Ev(5750, 900 * sm(T(5) + 4.1, T(5) + 4.7, tau, easeOutBack), 560 * sm(T(5) + 5.0, T(5) + 5.6, tau, easeOutElastic), { up: 480, dn: 380, flat: 700, back: 700 }));
  // L6：平缓的丘陵
  for (let k = 0; k < 3; k++) ev.push(s3Ev(7800 + 380 * k, 110 * sm(T(6) + 1.8 + k * .25, T(6) + 2.6 + k * .25, tau, easeOutBack), 28 * sm(T(6) + 1.8 + k * .25, T(6) + 2.6 + k * .25, tau), { up: 190, dn: 140, flat: 20, back: 60 }));
  // 台阶：线自己一级级折起来
  const fold = i => sm(T(7) + .3 + i * .13, T(7) + .75 + i * .13, tau, easeOutBack);
  const trem = 7 * Math.min(sm(T(5) + 4.2, T(5) + 4.4, tau), 1 - sm(T(5) + 5.2, T(5) + 6.2, tau));
  return { ev, fold, trem };
}
function s3V(s, sh, tau) {
  let v = 0; for (const e of sh.ev) v += s3Lift(s, e);
  const { s0, w, r, n } = S3ST;
  if (s > s0) { const u = (s - s0) / w; for (let i = 0; i < n; i++) v += r * sh.fold(i) * clamp((u - i) * w / 10, 0, 1); }
  if (sh.trem > .01 && s > 5270 && s < 6130) v += sh.trem * Math.sin(s * .06 + tau * 70) * Math.min(1, s3Lift(s, sh.ev[6]) / 200);
  return v;
}
const s3W = (s, sh, tau) => [s3X(s), -s3V(s, sh, tau), s];

// 小车走到哪（s）
const S3CAR = (() => { const T = s3T, K = [[0, 520], [T(2) + .5, 520], [T(2) + 2.05, 1450, easeOut], [T(2) + 2.35, 1500, s3Lin], [T(2) + 3.0, 1950, easeIn], [T(2) + 5.2, 2180, s3Lin], [T(2) + 7.2, 2900, easeSine]];
  K.push([T(3) + .3, 2920, easeIO]);
  for (let k = 0; k < 4; k++) { const tk = s3Tk(k); K.push([tk, S3PH(k), easeOut], [tk + .45, S3PH(k) + 150, easeIn]); }
  K.push([T(4) + 1.6, 4870, easeOut], [T(4) + 3.0, 4890, s3Lin], [T(5) + .4, 4890], [T(5) + 3.8, 5100, s3Lin], [T(5) + 4.75, 5750, easeOut], [T(5) + 5.1, 5790, s3Lin], [T(5) + 5.9, 6230, easeIn], [T(6) + 1.0, 6500, s3Lin], [T(6) + 3.0, 7560, easeIO], [T(6) + 5.8, 8620, s3Lin], [T(7) + 1.0, 8880, easeOut]);
  return K; })();
const s3CarS = tau => s3Key(tau, S3CAR);

// 镜头：跟着小车（或台阶上的帕秋莉）。偏移 [ox 右, oy 上, oz 后, tz 看前方多远, fy 高度跟随]
// 镜头关键帧：[ox 右, oy 上, oz 后, fy 高度跟随, FX, FY]——镜头放在焦点（小车 / 台阶上的帕秋莉）右后上方，转过去让焦点落在屏幕 (FX, FY)
const S3CAMK = (() => { const T = s3T; return [
  [T(1) + 1.5, [980, 300, 300, .8, 560, 800]],
  [T(2), [980, 300, 300, .8, 560, 800]],
  [T(2) + 1.0, [900, 240, 220, .85, 520, 820]],
  [T(2) + 2.4, [900, 260, 240, .9, 560, 700]],
  [T(2) + 4.0, [950, 300, 260, .85, 560, 800]],
  [T(2) + 6.4, [950, 300, 260, .85, 560, 800]],
  [T(3) + .5, [1050, 950, 380, .32, 600, 860]],
  [T(4) + .9, [1250, 1150, 450, .12, 700, 870]],
  [T(5) + .7, [1150, 420, 320, .7, 520, 820]],
  [T(5) + 3.7, [1150, 420, 320, .7, 520, 820]],
  [T(5) + 4.4, [2200, 380, 650, .2, 760, 470]],
  [T(5) + 5.1, [2200, 380, 650, .2, 760, 470]],
  [T(5) + 5.9, [1000, 300, 260, .85, 560, 760]],
  [T(6) + 1.2, [1150, 420, 320, .8, 520, 800]],
  [T(7) + .4, [1150, 420, 320, .8, 520, 800]],
  [T(7) + 1.8, [1000, 300, 160, .85, 600, 820]],
  [T(9), [1000, 300, 160, .85, 600, 820]],
  [T(9) + 1.4, [1750, 250, 750, .55, 1250, 420]],
]; })();
function s3LookCam(pos, tgt, f = S3F) { const dx = tgt[0] - pos[0], dy = tgt[1] - pos[1], dz = tgt[2] - pos[2], yaw = Math.atan2(dx, dz), dzr = dx * Math.sin(yaw) + dz * Math.cos(yaw);
  return { x: pos[0], y: pos[1], z: pos[2], yaw, pitch: Math.atan2(dy, dzr), f }; }
// 台阶上帕秋莉的位置（世界坐标，脚底）
function s3StairPos(tau) {
  const { s0, w, r, n } = S3ST; let i = 0; while (i < n && tau >= s3Step(i)) i++;
  const at = j => j < 0 ? [s3X(8905) + 80, 0, 8905] : [s3X(s0 + (j + .5) * w) + 80, -(j + 1) * r, s0 + (j + .5) * w];
  if (i === 0 && tau < s3Step(0) - .45) return at(-1);
  const u = clamp((tau - (s3Step(i < n ? i : n - 1) - .45)) / .45, 0, 1), a = at(i - 1), b = at(Math.min(i, n - 1));
  if (i >= n) return at(n - 1);
  const e = easeIO(u); return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(Math.PI * u) * 70, lerp(a[2], b[2], e)];
}
function s3Chase(tau, sh) {
  const T = s3T, [ox, oy, oz, fy, FX, FY] = s3Key(tau, S3CAMK);
  let fs = s3CarS(tau), fyv = s3V(fs, sh, tau), fx = s3X(fs);
  // 台阶段：镜头跟帕秋莉
  const onSt = sm(T(7) + 1.2, T(7) + 2.2, tau);
  if (onSt > 0) { const p = s3StairPos(tau); fs = lerp(fs, p[2], onSt); fyv = lerp(fyv, -p[1], onSt); fx = lerp(fx, p[0], onSt); }
  const K = S3K, pos = [fx * K + ox, -fyv * fy * K - oy, fs * K - oz], foc = [fx * K, -fyv * K, fs * K];
  return s3Aim(pos, foc, FX, FY);
}
// s3Aim：镜头在 pos，转到让世界点 foc 落在屏幕 (FX, FY)
function s3Aim(pos, foc, FX, FY, f = S3F) {
  const dx = foc[0] - pos[0], dy = foc[1] - pos[1], dz = foc[2] - pos[2], th = Math.atan2(dx, dz), yaw = th - Math.atan((FX - CX) / f);
  const dz1 = dx * Math.sin(yaw) + dz * Math.cos(yaw), pitch = Math.atan2(dy, dz1) - Math.atan((FY - CY) / f);
  return { x: pos[0], y: pos[1], z: pos[2], yaw, pitch, f };
}
// 起始镜头：贴在基线平面上（地平线在 S3GY），整张地平面收成一条线；方向和打开后的镜头一致
function s3Cam0() { const T = s3T, ch = s3Chase(T(1) + 2.6, s3Shape(T(1) + 2.6)); return { ...ch, y: -.01, pitch: -Math.atan((S3GY - CY) / S3F) }; }
function s3Cam(tau, sh) {
  const open = sm(s3T(1) + 1.4, s3T(1) + 2.6, tau), chase = s3Chase(tau, sh);
  if (open >= 1) return chase;
  const c0 = s3Cam0(), e = easeIO(open);
  return { ...chase, y: lerp(c0.y, chase.y, e), pitch: lerp(c0.pitch, chase.pitch, e), yaw: lerp(c0.yaw, chase.yaw, e) };
}
// 屏幕点 (sx, S3GY) 在起始镜头里对应的地面世界点（缩放恰好为 k）
function s3Unproj(sx, k) { const c0 = s3Cam0(), dz = c0.f / k, dx1 = (sx - CX) / c0.f * dz, dz1 = dz / Math.cos(c0.pitch), cy = Math.cos(c0.yaw), sy = Math.sin(c0.yaw);
  return [c0.x + dx1 * cy + dz1 * sy, 0, c0.z - dx1 * sy + dz1 * cy]; }
// ---------- 3D 画具 ----------
function s3Seg(c, a, b, w, color, al = 1) { if (!a || !b) return; c.globalAlpha = al; c.strokeStyle = color; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
// 地平面（基线）：一张平放的横格纸——几条顺着线轨收向远处的细线，加地平线
function s3Floor(c, cam, al) {
  if (al <= 0) return; c.save(); c.strokeStyle = P.g2; c.lineCap = 'round';
  const zn = cam.z / S3K + 60, zf = zn + 7000, xc = Math.round(cam.x / S3K / 170) * 170;
  for (let x = xc - 2040; x <= xc + 2040; x += 170) { let a = null; for (const z of [zn - 1600, zn - 900, zn - 400, zn]) if ((a = s3Pj([x, 0, z], cam))) break; const b = s3Pj([x, 0, zf], cam); if (!a || !b) continue;
    const g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, alpha(P.g2, .32 * al)); g.addColorStop(1, alpha(P.g2, 0));
    c.strokeStyle = g; c.lineWidth = clamp(1.6 * a[2], .6, 2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  const hy = CY - cam.f * Math.tan(cam.pitch); c.globalAlpha = al * .3; c.strokeStyle = P.g2; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, hy); c.lineTo(W, hy); c.stroke();
  c.restore();
}
// 线轨：采样、帘子（到基线的竖线 / 低谷的浅红）、线本身（近粗远细）
function s3Samples(tau, sh, cam, s1 = 99999) {
  const out = [], cz = cam.z / S3K, a = cz - 2600;
  for (let s = a; s < Math.min(cz + 9000, s1, S3SEND); s += Math.abs(s - cz) < 1800 ? 6 : Math.abs(s - cz) < 4000 ? 12 : 24) { const w = s3W(s, sh, tau); out.push({ s, w, p: s3Pj(w, cam), q: s3Pj([w[0], 0, s], cam) }); }
  return out;
}
function s3Curtain(c, S, al, grey = 0) {
  if (al <= 0) return; c.save();
  // 低谷：线在基线以下的那段，下面挂一片浅红
  c.fillStyle = S3POOL; c.globalAlpha = al * .55; c.beginPath();
  for (let i = 1; i < S.length; i++) { const A = S[i - 1], B = S[i]; if (A.w[1] <= 1 || B.w[1] <= 1 || !A.p || !B.p || !A.q || !B.q) continue;
    c.moveTo(A.p[0], A.p[1]); c.lineTo(B.p[0], B.p[1]); c.lineTo(B.q[0], B.q[1]); c.lineTo(A.q[0], A.q[1]); c.closePath(); }
  c.fill();
  // 基线上的影子：一条细线
  c.strokeStyle = P.g2; c.lineWidth = 1.3; c.globalAlpha = al * .55; c.beginPath(); let on = false;
  for (const A of S) { if (!A.q) { on = false; continue; } on ? c.lineTo(A.q[0], A.q[1]) : c.moveTo(A.q[0], A.q[1]); on = true; } c.stroke();
  // 高出基线的地方：一排细竖线落到影子上
  c.lineWidth = 1; c.globalAlpha = al * .4;
  for (let i = 0; i < S.length; i++) { const A = S[i]; if (!A.p || !A.q || Math.abs(A.w[1]) < 6 || Math.round(A.s) % 70 > (A.s < S[0].s + 1600 ? 6 : 13)) continue;
    c.beginPath(); c.moveTo(A.p[0], A.p[1]); c.lineTo(A.q[0], A.q[1]); c.stroke(); }
  c.restore();
}
function s3Track(c, S, tau, o = {}) {
  const { al = 1, grey = null } = o; c.save(); c.lineCap = 'round'; const tk = tick(tau);
  for (let i = 1; i < S.length; i++) { const A = S[i - 1], B = S[i]; if (!A.p || !B.p) continue;
    const j = k => noise1(i * .35 + tk, 3) * .9; const w = clamp(6 * B.p[2], 1.2, 11);
    let col = S3INK; if (grey) { const g = grey(B.s); if (g > 0) col = mix(S3INK, P.g1, g); }
    s3Seg(c, [A.p[0] + j(), A.p[1] + j()], [B.p[0] + j(), B.p[1] + j()], w, col, al * clamp((S3SEND - B.s) / 120, 0, 1)); }
  c.restore();
}
// 雾面（快乐门槛）：高 h 的一张半透明水平面
function s3Fog(c, cam, h, z0, z1, al, tau) {
  if (al <= 0) return; z0 = Math.max(z0, cam.z / S3K + 80); if (z1 <= z0) return;
  const xm = s3X((z0 + z1) / 2), X0 = xm - 420, X1 = xm + 420, pts = [];
  for (const [x, z] of [[X0, z0], [X1, z0], [X1, z1], [X0, z1]]) { const p = s3Pj([x, -h, z], cam); if (!p) return; pts.push(p); }
  const path = polyPath(pts);
  c.save(); c.globalAlpha = al * .55; c.fillStyle = '#f7f3ec'; c.fill(path); grain(c, path, .05);
  // 雾面上的横纹（透视里一条条收拢），边缘红虚线
  c.globalAlpha = al * .35; c.strokeStyle = P.g2; c.lineWidth = 1;
  for (let z = Math.ceil(z0 / 120) * 120; z < z1; z += 120) { const a = s3Pj([X0, -h, z], cam), b = s3Pj([X1, -h, z], cam); if (a && b) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }
  c.globalAlpha = al * .7; c.strokeStyle = mix(P.red, P.paper, .25); c.lineWidth = 2; c.setLineDash([12, 9]); c.stroke(path); c.restore();
  return pts;
}
// 单线小图（phone 手机 / book 课本 / bowl 饭碗 / tv 电视 / msg 消息 / dish 大餐），画在屏幕点 p，缩放 k
function s3Glyph(c, kind, x, y, k, tau, o = {}) {
  const { al = 1, rot = 0, color = S3INK } = o; if (k <= .01 || al <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); const L = { w: 4.5, color, t: tau, amp: .8 };
  c.globalAlpha *= al;
  if (kind === 'phone') { rline(c, rectPts(-26, -46, 52, 92, 9), { ...L, close: true, seed: 341 }); rline(c, [[-8, -16], [-8, 16], [16, 0], [-8, -16]], { ...L, w: 3.5, seed: 342 }); rline(c, [[-6, 36], [6, 36]], { ...L, w: 3, seed: 343 }); }
  if (kind === 'book') { rline(c, rectPts(-36, -100, 72, 100, 4), { ...L, close: true, seed: 344 }); rline(c, [[-24, -100], [-24, 0]], { ...L, w: 3, seed: 345 }); rline(c, rectPts(-10, -78, 34, 20, 2), { ...L, w: 2.5, close: true, seed: 346 }); }
  if (kind === 'bowl') { rline(c, [[-46, -6], [46, -6], [36, 24], [18, 34], [-18, 34], [-36, 24], [-46, -6]], { ...L, seed: 346 }); rline(c, [[-38, -6], [-26, -24], [0, -30], [26, -24], [38, -6]], { ...L, w: 3.5, seed: 347, smooth: true }); rline(c, [[18, -40], [58, -70]], { ...L, w: 3, seed: 348 }); rline(c, [[26, -34], [64, -58]], { ...L, w: 3, seed: 349 }); }
  if (kind === 'tv') { rline(c, rectPts(-50, -34, 100, 68, 8), { ...L, close: true, seed: 350 }); rline(c, [[-18, -60], [0, -36], [22, -64]], { ...L, w: 3.5, seed: 351 }); rline(c, [[-12, -12], [-12, 12], [12, 0], [-12, -12]], { ...L, w: 3, seed: 352 }); }
  if (kind === 'msg') { rline(c, [[-44, -30], [44, -30], [44, 18], [-6, 18], [-24, 36], [-20, 18], [-44, 18], [-44, -30]], { ...L, seed: 353 }); for (let i = -1; i <= 1; i++) { c.fillStyle = color; c.beginPath(); c.arc(i * 20, -6, 4.5, 0, TAU); c.fill(); } }
  if (kind === 'dish') { rline(c, [[-96, 0], [96, 0]], { ...L, seed: 354 }); rline(c, [[-80, 0], [-74, -44], [-40, -82], [0, -92], [40, -82], [74, -44], [80, 0]], { ...L, seed: 355, smooth: true }); cutPaper(c, circPts(0, -104, 11, 14), P.moon, { seed: 356, step: 5, blur: 3, sx: 1, sy: 2 });
    for (let i = -1; i <= 1; i++) rline(c, [[i * 34, -120], [i * 34 + 10, -140], [i * 34 - 4, -160], [i * 34 + 8, -182]], { ...L, w: 2.5, color: P.g2, seed: 357 + i, smooth: true }); }
  c.restore();
}
// 金色小火花（剪纸星）
function s3Spark(c, x, y, r, al = 1, rot = 0) { if (r < 1 || al <= 0) return; cutPaper(c, starPts(x, y, r, 4, .36, rot), P.moon, { seed: 360 + (x | 0) % 11, step: 5, blur: 3, sx: 1, sy: 2, al, grain: 0 }); }
// 一阵火花：t0 起，从 (x, y) 喷出 n 片，u 秒后落下
function s3Burst(c, x, y, tau, t0, n = 7, spread = 1, al = 1, seed = 1) {
  const u = tau - t0; if (u < 0 || u > 1.6) return;
  for (let j = 0; j < n; j++) { const vx = (hash(j, seed) - .5) * 360 * spread, vy = -(260 + hash(j, seed + 1) * 260) * spread, px = x + vx * u, py = y + vy * u + 520 * u * u, a = al * (1 - sm(.9, 1.6, u));
    s3Spark(c, px, py, (11 + hash(j, seed + 2) * 12) * Math.max(.6, spread), a, u * 6 * (hash(j, seed + 3) - .5)); }
}
// 小纸车：一只圆底的深灰纸盆，月牙徽记，两只轮子；后面插两面小旗「想要」「动力」
function s3Cart(c, tau, flags, back) {
  const r = rng(1);
  if (back) { // 车后面的旗子（画在帕秋莉身后）
    [['想要', 70, -170], ['动力', 104, -214]].forEach(([t, x, y], i) => { const k = flags[i]; if (k <= 0) return; const fl = Math.sin(tau * 7 + i) * 4;
      // 冲高那一下，两面小旗被风吹飞
      const u = clamp((tau - s3T(2) - 1.25 - i * .12) / 1.1, 0, 1); if (u >= 1) return;
      c.save(); c.globalAlpha *= clamp(k * 1.5, 0, 1) * (1 - u); if (u > 0) { c.translate(-u * 520, -u * 260 + u * u * 120); c.rotate(-u * 3.5 * (i ? 1 : -.7)); } rline(c, [[x + 10, -40], [x + 10, y + 20 * (1 - k)]], { w: 3, color: P.ink2, seed: 370 + i });
      cutPaper(c, [[x + 10, y], [x + 88, y + 8 + fl], [x + 86, y + 44 + fl], [x + 10, y + 40]].map(([px, py]) => [px, py + 20 * (1 - k)]), P.paper, { seed: 372 + i, step: 14, blur: 3, sx: 1, sy: 2 });
      zh(c, t, x + 22, y + 32 + fl * .5 + 20 * (1 - k), { size: 26, color: P.ink }); c.restore(); });
    return;
  }
  cutPaper(c, [[-120, -64], [120, -64], [112, -18], [88, 8], [-88, 8], [-112, -18]], P.g3, { seed: 375, step: 16 });
  cutPaper(c, [[-126, -72], [126, -72], [124, -58], [-124, -58]], mix(P.g3, P.ink, .35), { seed: 376, step: 20 });
  drawMoonIcon(c, 0, -30, 18, P.moon, -.5);
  for (const x of [-70, 70]) { cutPaper(c, circPts(x, 10, 17, 16), P.ink, { seed: 377 + x, step: 6 }); c.fillStyle = P.g2; c.beginPath(); c.arc(x, 10, 5, 0, TAU); c.fill(); }
}

// 叠满的 buff：饭碗、电视、消息一样样落到车头上摞起来（车的局部坐标），L6 一样样掉下去
function s3Buffs(c, tau, trem) {
  const T = s3T, at = [T(5) + 1.5, T(5) + 2.3, T(5) + 3.2];
  // L3：手机先插在车头；L4 一开头被扔掉
  { const k = sm(T(3) + .1, T(3) + .4, tau, easeOutBack), fu = clamp((tau - T(4) - .2) / .9, 0, 1);
    if (k > .001 && fu < 1) s3Glyph(c, 'phone', 170 + fu * 260, -150 - (1 - k) * 200 - fu * 220 + fu * fu * 700, 1.1, tau, { al: 1 - fu, rot: Math.sin(tau * 4) * .05 + fu * 5 }); }
  ['bowl', 'tv', 'msg'].forEach((kd, i) => { const k = sm(at[i], at[i] + .3, tau, easeOutBack); if (k <= .001) return;
    const f0 = T(6) + .9 + i * .55, fu = clamp((tau - f0) / .9, 0, 1); if (fu >= 1) return;
    const sway = Math.sin(tau * 3.1 + i) * .04 * (i + 1) + trem * .012 * Math.sin(tau * 50 + i * 2);
    const x = 168 + i * 6 + fu * (90 + i * 40), y = -118 - i * 92 - (1 - k) * 260 + fu * fu * 700;
    s3Glyph(c, kd, x, y, 1.05, tau, { al: (1 - fu) * Math.min(1, k * 2), rot: sway * (i + 1) + fu * (2 + i) }); });
}
// ===================== 帕秋莉的表演 =====================
// [时刻, { pose, mood, look, tilt, at: 'ground' 地面 | 'cart' 车里 | 'stair' 台阶, jump }]
const S3ACT = (() => { const T = s3T; return [
  [0, { pose: 'stand', look: .5, at: 'ground' }],
  [T(0) + .7, { pose: 'lecture', look: .8, at: 'ground' }],
  [T(0) + 2.1, { pose: 'tired', mood: 'sleepy', look: .6, at: 'ground' }],
  [T(0) + 3.5, { pose: 'point', mood: 'smug', look: .6, at: 'ground' }],
  [T(1), { pose: 'point', look: .9, at: 'ground', tug: 1 }],
  [T(1) + 1.6, { pose: 'lecture', look: .6, at: 'ground' }],
  [T(1) + 3.3, { pose: 'stand', look: .3, at: 'hop' }],
  [T(1) + 4.0, { pose: 'lecture', look: .5, at: 'cart' }],
  [T(2), { pose: 'point', look: .6, at: 'cart' }],
  [T(2) + 1.3, { pose: 'cross', mood: 'surprised', look: .4, tilt: .1, at: 'cart', jump: 1 }],
  [T(2) + 2.0, { pose: 'lecture', mood: 'smug', look: .3, at: 'cart' }],
  [T(2) + 2.5, { pose: 'hide', mood: 'flustered', look: .5, at: 'cart', jump: 1 }],
  [T(2) + 3.6, { pose: 'sit', mood: 'sleepy', look: .2, tilt: .12, at: 'cart' }],
  [T(2) + 5.6, { pose: 'lecture', look: .6, at: 'cart' }],
  [T(3), { pose: 'point', look: .6, at: 'cart' }],
  [T(3) + 2.6, { pose: 'lecture', mood: 'normal', look: .5, tilt: -.08, at: 'cart' }],
  [T(4), { pose: 'cross', look: .6, at: 'cart' }],
  [T(4) + 2.1, { pose: 'tired', look: .3, at: 'cart' }],
  [T(5), { pose: 'lecture', look: .6, at: 'cart' }],
  [T(5) + 4.2, { pose: 'point', mood: 'surprised', look: .4, tilt: -.1, at: 'cart', jump: 1 }],
  [T(5) + 5.0, { pose: 'hide', mood: 'flustered', look: .7, at: 'cart', jump: 1 }],
  [T(6), { pose: 'cross', mood: 'pout', look: .6, at: 'cart' }],
  [T(6) + 3.0, { pose: 'sit', mood: 'smile', look: .5, at: 'cart' }],
  [T(7), { pose: 'lecture', look: .5, at: 'cart' }],
  [T(7) + 1.2, { pose: 'stand', look: .3, at: 'stair' }],
  [T(8), { pose: 'lecture', mood: 'smile', look: .6, at: 'stair' }],
  [T(8) + 3.0, { pose: 'point', look: .5, at: 'stair' }],
  [T(9), { pose: 'cross', look: .8, at: 'stair' }],
]; })();
function s3Act(tau) { let i = 0; while (i + 1 < S3ACT.length && tau >= S3ACT[i + 1][0]) i++; return { t0: S3ACT[i][0], ...S3ACT[i][1] }; }
// 小车的屏幕位置和倾角
function s3CartScreen(tau, sh, cam) {
  const s = s3CarS(tau), a = s3Pj(s3W(s - 30, sh, tau), cam), b = s3Pj(s3W(s + 30, sh, tau), cam), p = s3Pj(s3W(s, sh, tau), cam);
  if (!a || !b || !p) return null; return { p, k: p[2], ang: clamp(Math.atan2(b[1] - a[1], b[0] - a[0]), -.45, .45) };
}

scene({ order: 3, key: 'dopamine', title: '动力', dur: S3DUR, lines: S3LINES, noFlip: true,
  fn(c, tau, L) {
    const T = s3T, end = S3END, T1 = s3T(1);
    if (tau < .2) { handoffThread(c); return; }
    if (tau > S3DUR - .5) { handoffSparks(c); return; }
    c.fillStyle = P.paper; c.fillRect(0, 0, W, H); grain(c, polyPath(rectPts(0, 0, W, H)), .12);
    pageHeader(c, '第三页 · 动力', tau, .5, { x: 110, y: 96 });
    const act = s3Act(tau), mood = act.mood || L.mood || 'normal', blink = blinkAt(tau, 3), since = tau - act.t0;
    const wob = .035 * Math.sin(since * 22) * Math.exp(-since * 7), jump = act.jump ? -Math.sin(Math.PI * clamp(since / .32, 0, 1)) * 34 : 0;
    const is3D = tau >= T(1) + 1.4;
    // ---------------- 2D：地面线 ----------------
    if (!is3D || tau < T(1) + 1.9) {
      const a2 = 1 - sm(T(1) + 1.4, T(1) + 1.9, tau), col = mix('#6b4f55', S3INK, sm(.2, .8, tau));
      fade(c, a2, () => rline(c, s3Line2D(tau), { w: 5, color: col, t: tau, amp: .8, seed: 301 }));
      if (!is3D) {
        const up = sm(.9, 1.4, tau, easeOutBack), tug = act.tug ? 18 * sm(T(1) + .5, T(1) + .6, tau) + 22 * sm(T(1) + .95, T(1) + 1.05, tau) : 0;
        let tip = null;
        popup(c, S3GY, up, () => { c.save(); c.translate(1480 + tug, S3GY); c.rotate(wob); const A = drawPatchouli(c, { x: 0, y: 0, h: 520, pose: act.pose, mood, look: act.look, tilt: act.tilt || 0, mouth: L.mouth, blink, facing: -1, t: tau, gesture: .6 + .4 * Math.sin(tau * 1.3) }); c.restore(); tip = [1480 + tug + A.tip[0], S3GY + A.tip[1]]; });
        // 她揪住乱线的线头往回拽：头顶到她指尖一根绷着的线，乱线一圈圈解开
        if (tip && tau > T1 + .12 && tau < T1 + 1.45) { const hd = S3C.head, sag = 40 * (1 - sm(T1 + .4, T1 + .6, tau)) + 8 * Math.sin(tau * 20) * sm(T1 + .4, T1 + .5, tau);
          const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push([lerp(hd[0], tip[0], u), lerp(hd[1] - 20, tip[1], u) + Math.sin(u * Math.PI) * sag]); }
          rline(c, pts, { w: 5, color: S3INK, t: tau, amp: .8, seed: 309, p: sm(T1 + .12, T1 + .35, tau) }); }
        return;
      }
    }
    // ---------------- 3D：线轨 ----------------
    const sh = s3Shape(tau), cam = s3Cam(tau, sh), open = sm(T(1) + 1.4, T(1) + 2.6, tau);
    const outro = sm(end - .3, end + 1.0, tau);
    s3Floor(c, cam, sm(T(1) + 1.6, T(1) + 2.8, tau) * (1 - outro));
    const S = s3Samples(tau, sh, cam), grey = sm(T(9) + 1.6, T(9) + 2.6, tau) * (1 - sm(end - .2, end + .4, tau));
    const stGrey = s => grey * clamp((S3ST.s0 + (S3ST.n - .8) * S3ST.w - s) / 200, 0, 1) * (s > 8700 ? 1 : 0);
    s3Curtain(c, S, sm(T(1) + 2.0, T(1) + 3.0, tau) * (1 - sm(T(7), T(7) + .8, tau)) * (1 - outro));
    // 快乐门槛：雾面，每过一个手机峰抬一格
    const fogA = sm(T(3) + .5, T(3) + 1.0, tau) * (1 - sm(T(5) + .2, T(5) + .9, tau));
    let fogH = S3FOG[0]; for (let k = 0; k < 4; k++) fogH += (S3FOG[k + 1] - S3FOG[k]) * sm(s3Tk(k) + .35, s3Tk(k) + .65, tau, easeOutBack);
    const lineA = 1 - outro;
    // 雾面挡住它下面的线：先画雾下的线，再画雾，再画雾上的线
    if (fogA > 0) {
      const under = S.filter(A => -A.w[1] < fogH), over = S.map(A => (-A.w[1] >= fogH - 2 ? A : { ...A, p: null }));
      s3Track(c, S, tau, { al: lineA });
      const fp = s3Fog(c, cam, fogH, 2950, 5700, fogA, tau);
      s3Track(c, over, tau, { al: lineA });
      const lp = fp && [clamp((fp[0][0] + fp[3][0]) / 2, 160, 1500), (fp[0][1] + fp[3][1]) / 2]; if (fp && lp) { zh(c, '快乐门槛', lp[0] - 60, lp[1] - 22, { size: 34, color: mix(P.red, P.ink, .2), p: writeP(tau, T(3) + 2.7, '快乐门槛', .09), al: fogA }); }
    } else s3Track(c, S, tau, { al: lineA, grey: stGrey });
    // 基线
    if (tau > T(1) + 4.2 && tau < T(3)) { const p = s3Pj([s3X(1000) + 70, 0, 1000], cam); if (p) zh(c, '基线', p[0] - 10, p[1] + 58, { size: 38, color: P.ink2, p: writeP(tau, T(1) + 4.4, '基线', .15), al: 1 - sm(T(2) + 5.5, T(3), tau) }); }
    // 低谷
    if (tau < T(3)) { const p = s3Pj([s3X(2250), 120, 2250], cam); if (p) zh(c, '低谷', p[0] - 40, p[1], { size: 52, color: mix(P.red, P.ink, .25), p: writeP(tau, T(2) + 3.3, '低谷', .15), al: 1 - sm(T(2) + 6.4, T(3), tau) }); }
    // L3：手机，峰顶小火花
    for (let k = 0; k < 4; k++) { const tk = s3Tk(k), p = s3Pj(s3W(S3PH(k), sh, tau), cam); if (p) { const a = win(tk - .05, tk + .8, tau, .15); if (a > 0) s3Spark(c, p[0], p[1] - 40 * p[2], 22 * p[2] * a, a); } }
    // L4：课本几乎不动；和门槛之间的距离
    if (tau > T(4) && tau < T(5) + .6) { const al = sm(T(4) + .6, T(4) + 1.0, tau) * (1 - sm(T(5), T(5) + .5, tau)), p = s3Pj(s3W(4950, sh, tau), cam);
      if (p) { s3Glyph(c, 'book', p[0], p[1], Math.min(p[2] * 1.2 * S3K, 1.1), tau, { al, rot: Math.sin(tau * 3) * .02 });
        const q = s3Pj([s3X(4950), -fogH, 4950], cam); if (q) { rline(c, [[p[0], p[1] - 110 * Math.min(p[2] * 1.2 * S3K, 1.1)], [q[0], q[1]]], { w: 2.5, color: P.ink2, dash: [8, 10], p: sm(T(4) + 2.6, T(4) + 3.2, tau), seed: 380, al });
          zh(c, '……', (p[0] + q[0]) / 2 + 28, (p[1] + q[1]) / 2, { size: 60, color: P.ink2, p: writeP(tau, T(4) + 3.1, '……', .2), al }); } } }
    // L6：丘陵上的小火花
    for (let k = 0; k < 3; k++) { const s = 7800 + 380 * k, tt = s3Key(s, [[0, 0], [1, 1]]), p = s3Pj(s3W(s, sh, tau), cam);
      const tp = S3CAR.findIndex(r => r[1] >= s); if (!p || tp < 1) continue; const a0 = S3CAR[tp - 1], a1 = S3CAR[tp], tc = a0[0] + (a1[0] - a0[0]) * clamp((s - a0[1]) / (a1[1] - a0[1]), 0, 1);
      const a = win(tc - .05, tc + .7, tau, .12); if (a > 0) s3Spark(c, p[0], p[1] - 32 * p[2], 14 * p[2] * a, a); }
    // 对策一 / 对策二
    zh(c, '对策一', 130, 200, { size: 48, color: P.ink, p: writeP(tau, T(6) + .1, '对策一', .12), al: 1 - sm(T(7), T(7) + .3, tau) });
    zh(c, '对策二', 130, 200, { size: 48, color: P.ink, p: writeP(tau, T(7) + .2, '对策二', .12), al: 1 - outro });
    // 台阶上的火花（留在台阶上，L9 变灰时熄灭）
    for (let i = 0; i < S3ST.n; i++) { const t0 = s3Step(i); if (tau < t0) continue; const { s0, w, r } = S3ST, s = s0 + (i + .5) * w, p = s3Pj([s3X(s), -(i + 1) * r, s], cam); if (!p) continue;
      s3Burst(c, p[0] - 40 * p[2], p[1] - 30, tau, t0, 14, p[2] * 1.35, 1, 390 + i);
      const keep = (1 - grey) * (1 - outro); for (let j = 0; j < 5; j++) s3Spark(c, p[0] + (hash(j, i) - .5) * 300 * p[2], p[1] - 10 - hash(j, i + 7) * 16, (13 + hash(j, i + 3) * 9) * p[2] * sm(t0 + .5, t0 + .9, tau, easeOutBack), keep, hash(j, i + 5) * 3); }
    // 台阶顶：大餐；目光虚线
    { const { s0, w, r, n } = S3ST, s = s0 + n * w + 130, p = s3Pj([s3X(s), -n * r, s], cam), k = sm(T(9) + .2, T(9) + .6, tau, easeOutBack);
      if (p && k > 0) { s3Glyph(c, 'dish', p[0], p[1], p[2] * 1.05 * S3K * k, tau, { al: 1 - outro });
        const q = s3Pj([s3X(s0 + 2.5 * w), -3 * r, s0 + 2.5 * w], cam); if (q) zh(c, '硬熬', q[0] - 150, q[1] - 70, { size: 48, color: P.g2, p: writeP(tau, T(9) + 2.4, '硬熬', .15), al: 1 - sm(end - .6, end - .1, tau) }); } }
    // ---------------- 帕秋莉 ----------------
    const cs = s3CartScreen(tau, sh, cam), flags = [sm(T(1) + 1.9, T(1) + 2.3, tau, easeOutBack), sm(T(1) + 2.7, T(1) + 3.1, tau, easeOutBack)];
    const cartIn = sm(T(1) + 1.8, T(1) + 2.3, tau, easeOutBack), gestureV = .6 + .4 * Math.sin(tau * 1.3);
    // place：在 (x, y) 转 rot 画她，返回屏幕坐标的锚点
    const place = (x, y, rot, h, extra = {}) => { c.save(); c.translate(x, y); c.rotate(rot);
      const A = drawPatchouli(c, { x: 0, y: 0, h, pose: act.pose, mood, look: act.look, tilt: act.tilt || 0, mouth: L.mouth, blink, facing: -1, t: tau, gesture: gestureV, ...extra }); c.restore();
      const co = Math.cos(rot), si = Math.sin(rot), f = q => [x + q[0] * co - q[1] * si, y + q[0] * si + q[1] * co]; return { head: f(A.head), tip: f(A.tip), h }; };
    // 车里站脚的点：车的局部 (0, -40)
    const cartFoot = cs ? [cs.p[0] + Math.sin(cs.ang) * 40 * cs.k, cs.p[1] - Math.cos(cs.ang) * 40 * cs.k] : null;
    const drawCart = back => { if (cs && cartIn > 0) { c.save(); c.translate(cs.p[0], cs.p[1]); c.rotate(cs.ang); c.scale(cs.k * cartIn, cs.k * cartIn); c.translate(0, -28); s3Cart(c, tau, flags, back); if (!back) s3Buffs(c, tau, sh.trem); c.restore(); } };
    drawCart(true);
    let PA = null;
    if (act.at === 'ground' || act.at === 'hop') {
      let p = proj(s3Unproj(1480, 1), cam);
      if (act.at === 'hop' && cartFoot && p) { const u = sm(act.t0, act.t0 + .7, tau, s3Lin); p = [lerp(p[0], cartFoot[0], easeIO(u)), lerp(p[1], cartFoot[1], easeIO(u)) - Math.sin(Math.PI * u) * 200, lerp(p[2], cs.k, u)]; }
      if (p) PA = place(p[0], p[1] + jump, wob, 520 * p[2]);
    } else if (act.at === 'cart' && cs) {
      const fp = cartFoot, sit = act.pose === 'sit' ? -24 : 0;
      PA = place(fp[0], fp[1] + (jump + sit) * cs.k, cs.ang * .45 + wob, 520 * cs.k);
    } else if (act.at === 'stair') {
      const p = s3Pj(s3StairPos(tau), cam); if (p) PA = place(p[0], p[1] + jump, wob, 520 * p[2], { facing: 1 });
    }
    drawCart(false);
    // L2：峰顶「爽！」——贴着她冒出来
    if (PA && tau > T(2) + 1.8 && tau < T(2) + 3.9) { const k = sm(T(2) + 1.95, T(2) + 2.2, tau, easeOutBack) * (1 - sm(T(2) + 3.3, T(2) + 3.8, tau)), x = PA.head[0] + 190, y = PA.head[1] - 150;
      if (k > 0) { s3Spark(c, x, y, 52 * k, 1, .2 + tau * .5); zh(c, '爽！', x + 60, y + 24, { size: 64, color: P.ink, al: k }); } }
    // L5：超高峰上的大火花
    if (PA && tau > T(5) + 4.4 && tau < T(5) + 6.0) { const k = sm(T(5) + 4.55, T(5) + 4.8, tau, easeOutBack) * (1 - sm(T(5) + 5.3, T(5) + 5.7, tau)); if (k > 0) { s3Spark(c, PA.head[0] + 120 * PA.h / 520, PA.head[1] - 140 * PA.h / 520, 40 * k, 1, tau); s3Spark(c, PA.head[0] - 110 * PA.h / 520, PA.head[1] - 120 * PA.h / 520, 26 * k, 1, -tau); } }
    // 「我正在变强」：她头顶左上的纸条气泡
    if (PA && tau > T(8) && tau < T(9) + .6) { const k = sm(T(8) + .25, T(8) + .55, tau, easeOutBack) * (1 - sm(T(9) + .1, T(9) + .5, tau)), bx = PA.head[0] - 330, by = PA.head[1] - 150;
      if (k > 0) pop(c, bx, by, k, () => { const bw = zhWidth(c, '我正在变强', 46) + 60; cutPaper(c, rectPts(bx - bw / 2, by - 44, bw, 82, 18), '#f7f3ea', { seed: 398, step: 16 });
        cutPaper(c, [[bx + bw / 2 - 70, by + 30], [bx + bw / 2 - 30, by + 30], [PA.head[0] - 70, PA.head[1] - 60]], '#f7f3ea', { seed: 399, step: 10, shadow: false });
        zh(c, '我正在变强', bx, by + 14, { size: 46, align: 'center', color: P.ink, p: writeP(tau, T(8) + .4, '我正在变强', .1) }); }); }
    // L9：目光虚线——只盯着大餐
    if (PA && tau > T(9) + .7) { const { s0, w, r, n } = S3ST, p = s3Pj([s3X(s0 + n * w + 130), -n * r, s0 + n * w + 130], cam);
      if (p) rline(c, [[PA.head[0] + 50, PA.head[1] - 10], [p[0] - 40 * p[2], p[1] - 70 * p[2]]], { w: 3, color: P.ink2, dash: [3, 14], p: sm(T(9) + .8, T(9) + 1.5, tau), seed: 395, al: 1 - sm(end - .6, end - .1, tau) }); }
    // ---------------- 出场：夜色降临，火花升起布满夜空 ----------------
    if (tau > end - .4) {
      const u = sm(end - .4, S3DUR - .5, tau, s3Lin), night = sm(end - .4, end + 1.0, tau);
      // 夜色像墨一样从上往下洇开（下沿是一道起伏的边）
      const edge = lerp(-60, H + 120, easeIO(night)), np = [[0, -10], [W, -10]];
      for (let x = W; x >= 0; x -= 12) np.push([x, edge + Math.sin(x / 210 + tau * 2) * 30 + noise1(x / 140, 4) * 22]);
      c.save(); c.fillStyle = NIGHT_BG; c.fill(polyPath(np)); grain(c, polyPath(np), .06); c.restore();
      const { s0, w, r, n } = S3ST;
      HANDOFF_SPARKS.forEach(([x, y, rr], k) => { const i = k % n, s = s0 + (i + .5) * w, p0 = s3Pj([s3X(s) + (hash(k, 7) - .5) * 160, -(i + 1) * r, s], cam) || [CX, H];
        const d = clamp((u - hash(k, 8) * .35) / .65, 0, 1), e = easeIO(d), px = lerp(p0[0], x, e) + Math.sin(d * Math.PI) * (hash(k, 9) - .5) * 200, py = lerp(p0[1], y, e) - Math.sin(d * Math.PI) * 120;
        c.fillStyle = alpha(P.moon, .9 * sm(0, .1, u)); c.beginPath(); c.arc(px, py, lerp(rr * 1.6, rr, e), 0, TAU); c.fill(); });
    }
  } });
