'use strict';
// 全片时间线：scenes/*.js 各自 scene({...}) 登记，这里按 order 排好，并在每帧最后画字幕。
// ?scene=sleep 或 ?scene=sleep,diet 只放这几段（开发用）；?nosub 不画字幕。
{
  const only = Q.get('scene'), noSub = Q.has('nosub');
  defineFilm(SCENES.slice().sort((a, b) => a.order - b.order).filter(s => !only || only.split(',').includes(s.key)));
  OVERLAY = (c, s, tau, cur) => { if (!noSub && cur && !s.noSub) drawSubtitle(c, cur, tau); };
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
