'use strict';
// 全片时间线：scenes/*.js 各自 scene({...}) 登记，这里按 order 排好，并在每帧最后画字幕。
// ?scene=sleep 或 ?scene=sleep,diet 只放这几段（开发用）；?nosub 不画字幕。
{
  const only = Q.get('scene'), noSub = Q.has('nosub');
  defineFilm(SCENES.slice().sort((a, b) => a.order - b.order).filter(s => !only || only.split(',').includes(s.key)));
  OVERLAY = (c, s, tau, cur) => { if (s.start > 0 && !s.noFlip) pageFlip(c, tau); if (!noSub && cur && !s.noSub) drawSubtitle(c, cur, tau); };
  mountPlayer();
}
// 字幕：画面底部居中，深色半透明底，白字。说话人不是帕秋莉时前面加名字。
function drawSubtitle(c, cur, tau) {
  const a = Math.min(sm(cur.t0, cur.t0 + .15, tau), 1 - sm(cur.t1 - .12, cur.t1, tau));
  if (a <= 0) return;
  const size = 46, who = cur.o.who && cur.o.who !== 'patchouli' ? cur.o.who + '：' : '', text = who + cur.text;
  const tw = zhWidth(c, text, size), pad = 34, bw = Math.min(W - 120, tw + pad * 2), bx = CX - bw / 2, by = STAGE.sub.y - size - 10;
  c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(20,14,34,.78)'; c.fill(polyPath(rectPts(bx, by, bw, size + 40, 20)));
  c.strokeStyle = alpha(P.moon, .55); c.lineWidth = 2; c.stroke(polyPath(rectPts(bx + 5, by + 5, bw - 10, size + 30, 16)));
  if (who) zh(c, who, CX - tw / 2, STAGE.sub.y + 6, { size, color: P.moon });
  zh(c, cur.text, CX - tw / 2 + (who ? zhWidth(c, who, size) : 0), STAGE.sub.y + 6, { size, color: '#fff8ec' });
  c.restore();
}

// pageFlip：每段开头 0.6 秒，魔导书页像翻书一样从右往左翻过去（段与段之间的转场）。
// 段首本来就是空白讲台画面，翻过去的那张纸画的也是空白页，所以翻完无缝。
function pageFlip(c, tau) {
  const D = .6; if (tau >= D) return;
  const u = easeIO(tau / D), { x, y, w, h } = STAGE.board, cw = w * Math.cos(u * Math.PI), lift = Math.sin(u * Math.PI) * 40;
  const X = cw >= 0 ? x : x + cw, ww = Math.abs(cw);
  if (ww < 2) return;
  c.save();
  c.fillStyle = alpha('#000', .25 * Math.sin(u * Math.PI)); c.fill(polyPath([[x, y], [x + cw, y - lift], [x + cw, y + h + lift], [x, y + h]]));
  const pts = [[x, y], [x + cw, y - lift], [x + cw, y + h + lift], [x, y + h]];
  c.fillStyle = cw >= 0 ? P.paper : mix(P.paper, P.paperEdge, .5); c.strokeStyle = P.paperEdge; c.lineWidth = 5;
  c.fill(polyPath(pts)); c.stroke(polyPath(pts));
  const g = c.createLinearGradient(X, 0, X + ww, 0); g.addColorStop(0, alpha(P.paperEdge, cw >= 0 ? 0 : .5)); g.addColorStop(1, alpha(P.paperEdge, cw >= 0 ? .5 : 0));
  c.fillStyle = g; c.fill(polyPath(pts));
  c.restore();
}
