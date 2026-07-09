# 晨昏 · 体重日历

极简的日历式早晚体重记录 App。点日历任意一天,就地填晨重/晚重,颜色显影趋势;「今天」页把目标进度做成「减重第 N 天」的旅程叙事。

## 仓库结构

- **`app/`** —— 真实可用的 App 源码([uni-app](https://uniapp.dcloud.net.cn/) / Vue3),一套代码编译出微信小程序和网页版,登录后数据云端同步(uniCloud)。详细的本地开发、云端配置、小程序发布步骤见 [`app/README.md`](app/README.md)。
- **`index.html`** —— 产品原型案例展示页,记录了 V1 → V2 → V3 的迭代过程和设计思路。
- **`.github/workflows/deploy-pages.yml`** —— 自动构建网页版并发布到 GitHub Pages。

## 在线地址

- 网页版 App:`https://molly-gith.github.io/weight-tracker/`
- 原型案例展示页:`https://molly-gith.github.io/weight-tracker/showcase/`

(需要仓库 Settings → Pages → Source 设为 **GitHub Actions** 后才会生效)
