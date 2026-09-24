'use strict';
// 第 3 段：动力（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S3，避免和其他段撞名。
const S3LINES = seq(1.0, [
  '第三页：为什么考试周什么都不想干？聊聊多巴胺。',
  '多巴胺管的是“想要”和“动力”。平时，它待在一条基线上。',
  '爽到的时候它冲高，冲完却会掉到基线以下，还要待上一阵。',
  '刷短视频：一条比一条刺激，快乐的门槛越抬越高。',
  ['刷完两小时再看课本，当然一点感觉都没有。', { mood: 'annoyed' }],
  '快乐还会叠加：边吃饭、边追剧、边回消息，峰越高，坑越深。',
  '对策一：别每次都叠满 buff，偶尔只做事情本身。',
  ['对策二：把努力本身，当成奖励。', { mood: 'smile' }],
  '“我正在变强”——这个念头，也能让多巴胺出来干活。',
  ['只盯着考完那顿大餐，过程就只剩硬熬。', { mood: 'smug' }],
]);
scene({ order: 3, key: 'dopamine', title: '动力', dur: seqEnd(S3LINES) + 1.0, lines: S3LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '动力' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    chapterTag(c, tau, '第三页 · 动力');
  } });
