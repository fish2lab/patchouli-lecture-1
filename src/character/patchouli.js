'use strict';
// 帕秋莉·诺蕾姬（纯 Canvas 代码绘制）。
// 【占位版】这是接口占位：只画一个大致轮廓，尺寸和锚点与正式版一致。角色包会整个替换本文件，接口不变。
//
// drawPatchouli(c, o) — 全身立绘
//   x, y      脚底中心（逻辑坐标）
//   h         全身高度（帽顶到脚底），默认 860
//   facing    1 面朝右（看向右边的黑板），-1 面朝左
//   pose      'lecture' 左手捧书、右手比手势讲解（主姿势，参考 refs/character/5-book-standing.jpg）
//             'point'   右手抬高指向前方（指黑板）
//             'read'    双手捧书低头看
//             'cheer'   双手举起（高兴、总结）
//             'tired'   驼背、手垂下（熬夜、没精神）
//             'shrug'   两手一摊（无奈、自嘲）
//   mood      'normal' | 'smile' | 'smug'（得意）| 'surprised' | 'sleepy' | 'annoyed' | 'sad'
//   mouth     0 闭嘴 .. 1 张大（说话时由 kit 的 mouthAt 给）
//   blink     0 睁眼 .. 1 闭眼
//   t         秒；头发飘动、呼吸、书页用
//   book      true 手里有书（lecture/read 默认 true）
//   gesture   0..1 讲解手的抬起程度（lecture 姿势里右手从垂下到比手势）
//
// drawPatchouliChibi(c, o) — Q 版（两头身）
//   x, y, h(默认 300), facing, mood, mouth, blink, t 同上
//   pose      'stand' | 'flat'（趴在地上，参考 3-flat-chibi）| 'lift'（举杠铃，参考 1-barbell-chibi，杠铃由调用方画，
//             返回双手位置）| 'sit' | 'lie'（抱书仰躺，参考 2-book-lying）| 'run'
//   返回 { hands: [[x, y], [x, y]], head: [x, y] }，方便场景把道具放在手上。
//
// 两个函数都应该只依赖参数（纯函数），可以在同一帧里画多次（不同位置、大小）。

function drawPatchouli(c, o = {}) {
  const { x = 360, y = 1040, h = 860, facing = 1, pose = 'lecture', mouth = 0, blink = 0, t = 0 } = o, s = h / 860;
  c.save(); c.translate(x, y); c.scale(s * facing, s);
  const sway = Math.sin(t * 1.3) * 4;
  // 裙子
  rshape(c, [[-150, 0], [-110, -520], [110, -520], [150, 0]], { fill: P.dress, stroke: P.ink2, w: 4, seed: 2 });
  for (let k = -3; k <= 3; k++) rline(c, [[k * 30, -510], [k * 40, -10]], { w: 10, color: P.stripe, seed: k + 9 });
  // 头发
  rshape(c, [[-120, -380], [-130, -700], [130, -700], [120 + sway, -380]], { fill: P.hair, stroke: P.hairDark, w: 4, seed: 3, smooth: true });
  // 脸
  rshape(c, ellPts(0, -620, 80, 90), { fill: P.skin, stroke: P.ink2, w: 3, seed: 4 });
  const ey = -625; c.fillStyle = P.purple;
  if (blink > .5) { rline(c, [[-50, ey], [-20, ey]], { w: 4, color: P.ink }); rline(c, [[20, ey], [50, ey]], { w: 4, color: P.ink }); }
  else { c.beginPath(); c.ellipse(-35, ey, 10, 16, 0, 0, TAU); c.ellipse(35, ey, 10, 16, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#b0405a'; c.beginPath(); c.ellipse(0, -565, 12, 3 + mouth * 12, 0, 0, TAU); c.fill();
  // 帽子和月亮
  rshape(c, ellPts(0, -760, 150, 70), { fill: P.cap, stroke: P.ink2, w: 4, seed: 5 });
  drawMoonIcon(c, 90, -790, 28);
  // 书
  if (pose === 'lecture' || pose === 'read' || o.book) rshape(c, rectPts(40, -440, 150, 100), { fill: '#7a2e2e', stroke: P.ink, w: 3, seed: 6 });
  zh(c, '占位', 0, -250, { size: 60, align: 'center', color: P.ink2 });
  c.restore();
}

function drawPatchouliChibi(c, o = {}) {
  const { x = 0, y = 0, h = 300, facing = 1, pose = 'stand', mouth = 0 } = o, s = h / 300;
  c.save(); c.translate(x, y); c.scale(s * facing, s);
  if (pose === 'flat' || pose === 'lie') c.rotate(-Math.PI / 2 * facing);
  rshape(c, [[-70, 0], [-50, -120], [50, -120], [70, 0]], { fill: P.dress, stroke: P.ink2, w: 4, seed: 2 });
  rshape(c, circPts(0, -190, 85), { fill: P.hair, stroke: P.hairDark, w: 4, seed: 3 });
  rshape(c, ellPts(0, -175, 62, 55), { fill: P.skin, stroke: P.ink2, w: 3, seed: 4 });
  rshape(c, ellPts(0, -265, 95, 40), { fill: P.cap, stroke: P.ink2, w: 3, seed: 5 });
  c.fillStyle = '#b0405a'; c.beginPath(); c.ellipse(0, -150, 8, 2 + mouth * 8, 0, 0, TAU); c.fill();
  c.restore();
  const hy = pose === 'lift' ? y - h * .95 : y - h * .35;
  return { hands: [[x - 70 * s, hy], [x + 70 * s, hy]], head: [x, y - 190 * s] };
}
