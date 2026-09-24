'use strict';
// 第 1 段：睡眠（占位版：只有台词和一个讲台画面，等场景包替换 fn）
// 顶层名字一律带本段前缀 S1，避免和其他段撞名。
const S1LINES = seq(1.0, [
  '第一页：睡眠。所有调理的地基都在这里。',
  '你身体里有一座生物钟。最能拨动它的，是光。',
  '早上一见光，身体放出皮质醇，把你叫醒；',
  '同时给十几个小时之后的困意，设好倒计时。',
  ['所以起床后，去户外晒 2 到 10 分钟太阳。', { mood: 'smile' }],
  '隔着玻璃晒，效果要大打折扣。',
  '反过来，晚上 11 点到凌晨 4 点，别让强光照进眼睛。',
  ['熄灯后躺床上刷手机，等于告诉生物钟：“现在是白天”。', { mood: 'annoyed' }],
  '实在要用，就把屏幕调暗、调暖，灯放低一点。',
  '咖啡因会堵住“困意信号”的受体。下午几点以后不喝，自己试出来。',
  '大多数人，每晚需要 6 到 8 小时睡眠。',
  ['考试周通宵？白天学的东西，要靠睡觉才能存进脑子。', { mood: 'smug' }],
]);
scene({ order: 1, key: 'sleep', title: '睡眠', dur: seqEnd(S1LINES) + 1.0, lines: S1LINES,
  fn(c, tau, L) {
    libraryBg(c, tau);
    const b = board(c, STAGE.board.x, STAGE.board.y, STAGE.board.w, STAGE.board.h, { t: tau, title: '睡眠' });
    zh(c, '（占位）' + (L.line || ''), b.x + 20, b.y + 80, { size: 40, color: P.ink2 });
    stageChar(c, tau, L);
    chapterTag(c, tau, '第一页 · 睡眠');
  } });
