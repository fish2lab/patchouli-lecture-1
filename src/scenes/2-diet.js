'use strict';
// 第 2 段：吃饭（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S2，避免和其他段撞名。
const S2LINES = seq(1.0, [
  '第二页：吃饭。吃什么重要，什么时候吃同样重要。',
  '2012 年有个小鼠实验：一组随时能吃，一组只在固定 8 小时里吃。',
  ['结果就算吃的是高脂饲料，限时组也更健康。', { mood: 'surprised' }],
  '给大学生的入门版：起床后 1 小时内先不吃，',
  '睡前 2 到 3 小时，不再进食。',
  ['凌晨一点的炸鸡外卖……嗯，你懂的。', { mood: 'annoyed' }],
  '更重要的是：每天吃饭的时间要稳定，别让肠胃天天倒时差。',
  '白水、茶、不加糖的咖啡不算“开饭”；一勺糖就算。',
  '再说说肠道里的小居民：菌群。越多样，一般越健康。',
  '实验里，每天吃天然发酵食品的人，菌群更多样，炎症指标也降了。',
  ['无糖酸奶、泡菜、纳豆都算。点外卖加份蔬菜粗粮，少点奶茶。', { mood: 'smile' }],
  '胃不好、或者有进食方面困扰的同学，先问医生，别硬饿。',
]);
scene({ order: 2, key: 'diet', title: '吃饭', dur: seqEnd(S2LINES) + 1.0, lines: S2LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '吃饭' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    chapterTag(c, tau, '第二页 · 吃饭');
  } });
