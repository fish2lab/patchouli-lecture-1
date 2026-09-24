'use strict';
// 第一版开场的图标（第 6 段总结的翻页还在用），第 6 段重做后删掉本文件。
const S0PAGES = [['moon', '睡眠', P.purple], ['bowl', '吃饭', P.orange], ['spark', '动力', P.red], ['target', '专注', P.teal], ['dumbbell', '运动', P.green]];

// ===================== 小图标（线宽随尺寸，s ≈ 图标半径） =====================
function s0Icon(c, name, x, y, s, t = null, seed = 1) {
  const w = Math.max(3, s * .09), o = { w, t, seed };
  if (name === 'moon') {
    c.save(); c.translate(x, y); c.rotate(-.35);
    const p = new Path2D(); p.arc(0, 0, s * .82, 0, TAU); p.moveTo(s * .45 + s * .7, -s * .25); p.arc(s * .45, -s * .25, s * .7, 0, TAU);
    c.fillStyle = P.moon; c.fill(p, 'evenodd'); c.restore();
    sparkle(c, x + s * .62, y - s * .55, s * .22); sparkle(c, x + s * .8, y + s * .05, s * .13);
    rshape(c, starPts(x + s * .62, y - s * .55, s * .2, 4, .35), { fill: P.sun, stroke: P.ink, w: w * .6, t, seed: seed + 3 });
  } else if (name === 'bowl') {
    const rice = []; for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; rice.push([x + Math.cos(a) * s * .78, y - s * .05 + Math.sin(a) * s * .55]); }
    rshape(c, rice, { fill: P.paper, stroke: P.ink, ...o, seed: seed + 1 });
    rline(c, [[x + s * .2, y - s * .95], [x + s * .95, y - s * .2]], { ...o, color: P.shelf2, w: w * 1.1, seed: seed + 5 });
    rline(c, [[x + s * .38, y - s * 1.0], [x + s * 1.0, y - s * .38]], { ...o, color: P.shelf2, w: w * 1.1, seed: seed + 6 });
    const bowl = [[x - s * .95, y - s * .05]]; for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI; bowl.push([x + Math.cos(a) * s * .95, y - s * .05 + Math.sin(a) * s * .75]); }
    rshape(c, bowl.slice(1), { fill: P.red, stroke: P.ink, ...o, seed: seed + 2 });
    rline(c, [[x - s * .8, y + s * .28], [x + s * .8, y + s * .28]], { ...o, color: P.paper, w: w * .9, seed: seed + 7 });
    rshape(c, rectPts(x - s * .3, y + s * .66, s * .6, s * .18, 3), { fill: P.red, stroke: P.ink, ...o, w: w * .8, seed: seed + 4 });
    for (let k = 0; k < 3; k++) rline(c, [[x - s * .35 + k * s * .32, y - s * .3], [x - s * .3 + k * s * .32, y - s * .25]], { ...o, color: P.faint, w: w * .8, seed: seed + 9 + k });
  } else if (name === 'spark') {
    rshape(c, starPts(x, y, s, 8, .42, .2), { fill: P.sun, stroke: P.ink, ...o });
    rshape(c, starPts(x, y, s * .45, 4, .45), { fill: P.paper, stroke: false, ...o });
    for (let k = 0; k < 3; k++) sparkle(c, x + Math.cos(k * 2.1 + .5) * s * 1.05, y + Math.sin(k * 2.1 + .5) * s * 1.05, s * .16, { color: P.orange });
  } else if (name === 'target') {
    rshape(c, circPts(x, y, s * .92), { fill: P.red, stroke: P.ink, ...o });
    rshape(c, circPts(x, y, s * .62), { fill: P.paper, stroke: P.ink, ...o, w: w * .7, seed: seed + 1 });
    rshape(c, circPts(x, y, s * .3), { fill: P.red, stroke: P.ink, ...o, w: w * .7, seed: seed + 2 });
    rline(c, [[x + s * .9, y - s * .9], [x + s * .05, y - s * .05]], { ...o, w: w * 1.1, seed: seed + 3 });
    rline(c, [[x + s * .7, y - s * 1.05], [x + s * .95, y - s * .95], [x + s * 1.05, y - s * .7]], { ...o, color: P.purple, seed: seed + 4 });
  } else if (name === 'dumbbell') {
    rline(c, [[x - s * .75, y], [x + s * .75, y]], { ...o, w: w * 1.6, color: P.ink2 });
    for (const sx of [-1, 1]) {
      rshape(c, rectPts(x + sx * s * .6 - s * .13, y - s * .55, s * .26, s * 1.1, 5), { fill: P.ink2, stroke: P.ink, ...o, seed: seed + 2 + sx });
      rshape(c, rectPts(x + sx * s * .88 - s * .1, y - s * .36, s * .2, s * .72, 4), { fill: P.purple, stroke: P.ink, ...o, seed: seed + 5 + sx });
    }
  } else if (name === 'phone') {
    const g = c.createRadialGradient(x, y, s * .2, x, y, s * 1.5); g.addColorStop(0, alpha(P.sky, .55)); g.addColorStop(1, alpha(P.sky, 0));
    c.fillStyle = g; c.fillRect(x - s * 1.6, y - s * 1.6, s * 3.2, s * 3.2);
    rshape(c, rectPts(x - s * .5, y - s * .9, s, s * 1.8, s * .14), { fill: P.ink, stroke: P.ink, ...o });
    rshape(c, rectPts(x - s * .4, y - s * .75, s * .8, s * 1.45, 4), { fill: mix(P.sky, '#ffffff', .45), stroke: false, ...o });
    zh(c, '2:00', x, y - s * .22, { size: s * .3, align: 'center', color: P.ink });
    for (let k = 0; k < 3; k++) rline(c, [[x - s * .28, y + s * (.1 + k * .18)], [x + s * (.28 - k * .12), y + s * (.1 + k * .18)]], { ...o, w: w * .6, color: P.blue, seed: seed + 3 + k });
    drawMoonIcon(c, x + s * .85, y - s * .85, s * .28, P.moon, -.4);
  } else if (name === 'chair') {
    rline(c, [[x - s * .5, y - s * .95], [x - s * .5, y + s * .95]], { ...o, color: P.shelf2, w: w * 1.2 });
    rline(c, [[x - s * .5, y + s * .2], [x + s * .5, y + s * .2]], { ...o, color: P.shelf2, w: w * 1.3, seed: seed + 1 });
    rline(c, [[x + s * .45, y + s * .2], [x + s * .45, y + s * .95]], { ...o, color: P.shelf2, w: w * 1.2, seed: seed + 2 });
    // 驼背坐着的小人
    rshape(c, circPts(x - s * .05, y - s * .62, s * .2), { fill: P.paper, stroke: P.ink, ...o, seed: seed + 3 });
    rline(c, [[x - s * .12, y - s * .42], [x - s * .32, y - s * .15], [x - s * .3, y + s * .12]], { ...o, smooth: true, seed: seed + 4 });
    rline(c, [[x - s * .3, y + s * .12], [x + s * .5, y + s * .1], [x + s * .55, y + s * .85]], { ...o, seed: seed + 5 });
    rline(c, [[x - s * .25, y - s * .25], [x + s * .2, y - s * .15], [x + s * .3, y - s * .35]], { ...o, seed: seed + 6 });
    rshape(c, rectPts(x + s * .25, y - s * .52, s * .14, s * .24, 2), { fill: P.sky, stroke: P.ink, ...o, w: w * .6, seed: seed + 7 });
  } else if (name === 'bag') {
    for (let k = 0; k < 3; k++) rline(c, [[x - s * .3 + k * s * .3, y - s * .75], [x - s * .22 + k * s * .3, y - s * .95], [x - s * .32 + k * s * .3, y - s * 1.15]], { ...o, color: P.faint, w: w * .8, smooth: true, seed: seed + 11 + k });
    rline(c, [[x - s * .3, y - s * .45], [x - s * .25, y - s * .8], [x + s * .25, y - s * .8], [x + s * .3, y - s * .45]], { ...o, smooth: true, seed: seed + 1 });
    rshape(c, [[x - s * .7, y - s * .5], [x + s * .7, y - s * .5], [x + s * .6, y + s * .9], [x - s * .6, y + s * .9]], { fill: P.orange, stroke: P.ink, ...o });
    rshape(c, circPts(x, y + s * .2, s * .3), { fill: P.paper, stroke: P.ink, ...o, w: w * .7, seed: seed + 2 });
    zh(c, '饭', x, y + s * .2, { size: s * .36, align: 'center', base: 'middle', color: P.red });
  }
}

// ===================== 片头 =====================
// 分段上色的逐字书写：segs = [[文字, 颜色], ...]，整体居中于 x，p 是整句的书写进度
