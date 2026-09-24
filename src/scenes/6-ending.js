'use strict';
// 第 6 段：总结（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S6，避免和其他段撞名。
const S6LINES = seq(1.0, [
  '最后，把今天浓缩成四条。',
  '一，睡够、睡好。',
  '二，不吸烟。',
  '三，每天动一动。',
  '四，少吃糖。',
  ['能做到这四条，身体就已经不错了。剩下的慢慢调。', { mood: 'smile' }],
  '以上是科普，不是诊断。身体不舒服，请去校医院。',
  ['帕秋莉讲座第一集，下课。……我也该去睡觉了。', { mood: 'sleepy' }],
]);
scene({ order: 6, key: 'ending', title: '总结', dur: seqEnd(S6LINES) + 9.0, lines: S6LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '总结' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    chapterTag(c, tau, '合上魔导书');
  } });
