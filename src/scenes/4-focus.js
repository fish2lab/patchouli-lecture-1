'use strict';
// 第 4 段：专注（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S4，避免和其他段撞名。
const S4LINES = seq(1.0, [
  '第四页：学习与专注。学习，就是大脑在重新布线。',
  '做错题时那股挫败感，恰恰是大脑进入“可改写”状态的信号。',
  ['这时候放弃，大脑学会的就是“放弃”。再坚持一下。', { mood: 'smug' }],
  '白天做好标记，真正的布线，大多在休息和睡眠里完成。',
  '所以学 90 分钟左右，就休息 20 分钟。不是刷手机那种休息。',
  '紧张到脑子一片空白？试试“生理叹息”：',
  '用鼻子连吸两口气，再用嘴慢慢地、长长地呼出去。',
  '视线往上更清醒，往下容易犯困：屏幕别放太低。',
  ['消息一闪，注意力就被偷走了。开专注模式，手机放远点。', { mood: 'annoyed' }],
  '有研究建议：成年人每天刷手机，最好不超过 2 小时。',
]);
scene({ order: 4, key: 'focus', title: '专注', dur: seqEnd(S4LINES) + 1.0, lines: S4LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '专注' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    chapterTag(c, tau, '第四页 · 专注');
  } });
