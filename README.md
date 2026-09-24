# 我是帕秋莉，我来教你调理身体！（第 1 集）

「帕秋莉讲座」系列科普动画的第一集。以东方 Project 的帕秋莉·诺蕾姬为讲解角色，用网页动画（JS）的形式，给青年、以大学生为主的观众讲怎么调理身体。

## 原始需求

- 标题：我是帕秋莉，我来教你调理身体！
- 知识来源：<https://github.com/zijie0/HumanSystemOptimization> + 额外调查
- 针对群体：青年，大学生为主
- 参考实现（可以换风格，但要类似的 JS 项目和精细度）：<https://github.com/fish2lab/bjtu-touhou-booth>
- 参考形象：综合 `refs/character/` 下六张图。只作参考，成品里的角色全部用纯 JS 实现类似形象，不使用这些图片本身
  - `0-main.jpg`：主参考图
  - `1-barbell-chibi.jpg`：帕秋莉举杠铃，魔理沙和小恶魔挂在杠铃两端
  - `2-book-lying.jpg`：抱书躺在地板上
  - `3-flat-chibi.jpg`：Q 版趴在地上，旁边有魔导书
  - `4-figure-fullbody.jpg`：手办全身立绘，捧书站姿，看服装全貌和配色
  - `5-book-standing.jpg`：单手捧书站立、另一只手比手势讲解，灰底，适合当讲课主姿势
- 系列编号：1

资源拉取、内容调查、分镜和实现都由接手的 Agent 负责。

---

## 成品

- **看片：** [Releases](../../releases) 里有单文件网页 `patchouli-lecture-1.html`（双击打开，不用网络；空格暂停，←/→ 跳 5 秒，下方按钮切章节，♪ 开背景音乐）和 1080p MP4。
- **开发时直接打开** `index.html`（先 `npm run font` 下载字体到 `fonts/`）。`?scene=sleep` 只放一段，`?t=30` 从第 30 秒开始。

| 段 | 讲什么 |
|---|---|
| 开场 | 常年不出门的帕秋莉：「正因为是反面教材，哪些坑会让身体垮掉，我最清楚。」 |
| 第一页 · 睡眠 | 光和生物钟、早上晒太阳、夜里少见强光、咖啡因、睡眠帮记忆 |
| 第二页 · 吃饭 | 什么时候吃、时间稳定、肠道菌群和发酵食品 |
| 第三页 · 动力 | 多巴胺的峰和坑、短视频、叠加效应、把努力当奖励 |
| 第四页 · 专注 | 犯错信号、90+20、生理叹息、屏幕高度、手机 |
| 第五页 · 运动 | 有氧、力量、少坐（和举杠铃的帕秋莉） |
| 总结 | 四条极简清单、免责声明 |

## 怎么做的

内容、分镜、技术取舍见 `docs/方案.md`，台词出处见 `docs/内容来源.md`，分镜见 `docs/分镜.md`，施工接口见 `docs/施工.md`。

主会话先搭骨架（逐帧引擎、画具、全部台词、角色接口、工具），再开 7 个 git worktree 并行：角色 1 包、场景 6 包；最后合并、审片、出片。画面每一笔都是 Canvas 2D 代码，角色也是代码画的，参考图不进构建产物。

```sh
npm install && npm run font
node tools/frames.mjs --scene sleep --grid 36   # 抽一段的联系表到 out/frames/
node tools/build.mjs                            # 单文件页面 → dist/index.html（需要 pip install fonttools brotli）
node tools/render.mjs                           # 出片 → out/patchouli-lecture-1.mp4（需要 ffmpeg）
```

## 许可

- 代码：MIT。
- 字体：霞鹜文楷（SIL Open Font License，`fonts/LXGWWenKai-OFL.txt`）。
- 东方 Project 的角色版权归上海爱丽丝幻乐团（ZUN）。本片为同人科普作品，不构成医疗建议。
