'use strict';
// 第 5 段：运动（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S5，避免和其他段撞名。
const S5LINES = seq(1.0, [
  ['第五页：运动。……好吧，这一页我是反面教材。', { mood: 'sad' }],
  '对大脑帮助最大的，是有氧运动：快走、慢跑、骑车、游泳、打球。',
  '每周 150 分钟以上，拆开算，一天二十来分钟就够。',
  '世卫组织还建议：每周两天以上，做做力量练习。',
  ['姆Q……杠铃……好重……', { mood: 'sad', hold: 1 }],
  '还有：少坐。任何强度的活动，都比一直坐着强。',
  '坐着学一小时，就起来接杯水、走两圈、伸个懒腰。',
  ['我喘成这样是因为哮喘。你们，可没有这个借口。', { mood: 'smug' }],
]);
scene({ order: 5, key: 'exercise', title: '运动', dur: seqEnd(S5LINES) + 1.0, lines: S5LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '运动' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    chapterTag(c, tau, '第五页 · 运动');
  } });
