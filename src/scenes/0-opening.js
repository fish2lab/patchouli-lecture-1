'use strict';
// 第 0 段：开场（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S0，避免和其他段撞名。
const S0LINES = seq(5.5, [
  '这里是红魔馆地下，大图书馆。',
  '我是帕秋莉·诺蕾姬，住在这里的魔法使。',
  ['常年不出门，睡得乱七八糟，还有哮喘。', { mood: 'sleepy' }],
  ['……所以由我来讲怎么调理身体，很有说服力吧？', { mood: 'smug', hold: .5 }],
  ['正因为是反面教材，哪些坑会让身体垮掉，我最清楚。', { mood: 'smile' }],
  '今天这本魔导书一共五页：睡眠、吃饭、动力、专注、运动。',
  ['专门写给熬夜、久坐、天天点外卖的大学生。', { mood: 'smile' }],
]);
scene({ order: 0, key: 'opening', title: '开场', dur: seqEnd(S0LINES) + 1.5, lines: S0LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '开场' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    
  } });
