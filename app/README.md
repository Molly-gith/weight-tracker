# 晨昏 · 体重日历 — 真实 App

用 [uni-app](https://uniapp.dcloud.net.cn/)(Vue3)开发,一套代码同时编译出**微信小程序**和**网页版(H5)**。数据默认存在设备本地,登录账号后自动同步到 uniCloud 云端,换设备也能看到同一份记录。

## 目录结构

```
app/
  src/
    pages/today/          今天页(晨重/晚重双卡 + 减重旅程进度)
    pages/calendar/        日历页(点格即录、每日变化值、月度小结)
    pages/onboarding/       首次设定目标(起点体重/目标体重)
    pages/account/          登录/注册/微信一键登录
    components/             共用组件(体重输入卡)
    utils/                  日期/统计/本地存储/登录鉴权
  uniCloud-aliyun/
    database/               数据库表结构(3 张表)
    cloudfunctions/          7 个云函数(注册/登录/微信登录/读写体重/读写目标)
```

## 本地开发预览(网页版)

```bash
cd app
npm install
npm run dev:h5
```

浏览器打开 http://localhost:5173 即可看到网页版效果。在没有配置 uniCloud 之前,App 会自动退化为"仅本地存储"模式,所有核心功能(记录、日历、目标进度)都能正常使用。

## 第一步:开通 uniCloud 云服务(数据云同步必需)

这一步官方工具链要求用图形界面的 **HBuilderX** 完成,命令行做不到,但操作很简单:

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)(标准版即可)
2. 打开 HBuilderX → 文件 → 打开目录 → 选择这个仓库里的 `app` 文件夹
3. 注册/登录一个 DCloud 账号(免费)
4. 在项目里右键根目录下的 `uniCloud-aliyun` 文件夹 → **关联云服务空间或创建云服务空间**
   - 选择**阿里云**(有免费额度,个人使用够用)
   - 按提示创建一个新空间(免费版即可)
5. 关联成功后,依次:
   - 右键 `uniCloud-aliyun/database` 文件夹 → **上传所有 Schema**(建好 3 张数据表)
   - 右键 `uniCloud-aliyun/cloudfunctions` 文件夹 → **上传所有云函数**(部署 7 个云函数)

## 第二步:配置云函数密钥

登录 [uniCloud 控制台](https://unicloud.dcloud.net.cn/),找到你的云空间 → 云函数 → 逐个进入下面这几个函数,在"配置"里添加环境变量:

- `user-register`、`user-login`、`user-wxlogin`、`weight-upsertEntry`、`weight-getEntries`、`weight-getGoal`、`weight-setGoal` 这 7 个函数都要加:
  - `CY_JWT_SECRET` = 任意一串随机字符串(比如用密码生成器生成 32 位),用来给登录令牌签名,7 个函数必须填**同一个值**
- `user-wxlogin` 额外再加两个(下一步注册小程序后才能拿到):
  - `WX_APPID` = 你的微信小程序 AppID
  - `WX_SECRET` = 你的微信小程序 AppSecret

## 第三步:注册微信小程序,拿到 AppID

1. 打开 https://mp.weixin.qq.com → 注册,选择"小程序"类型(个人主体即可,免费)
2. 注册完成后,进入 开发 → 开发管理 → 开发设置,复制 **AppID** 和 **AppSecret**
3. AppSecret 填进第二步 `user-wxlogin` 云函数的环境变量
4. AppID 填进 `app/src/manifest.json` 里的 `mp-weixin.appid` 字段(目前是空字符串 `""`)

## 第四步:用微信开发者工具预览小程序

```bash
cd app
npm run dev:mp-weixin
```

编译完成后,打开[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html),导入 `app/dist/dev/mp-weixin` 目录,选择你在第三步拿到的 AppID,即可在模拟器里预览、真机扫码体验。

正式发布小程序,则用:

```bash
npm run build:mp-weixin
```

产物在 `app/dist/build/mp-weixin`,用微信开发者工具导入后点击"上传",再到微信公众平台后台提交审核。

## 第五步:网页版自动部署

仓库根目录的 `.github/workflows/deploy-pages.yml` 已经配置好:每次 push 到 `main` 分支,GitHub Actions 会自动构建网页版并发布到 GitHub Pages,不需要你手动操作。

**唯一需要你手动做一次的设置**:仓库 Settings → Pages → Source,改成 **GitHub Actions**(而不是"Deploy from a branch")。

部署完成后:

- 真实 App 网页版:`https://molly-gith.github.io/weight-tracker/`
- 原型案例展示页(之前那个 `index.html`):`https://molly-gith.github.io/weight-tracker/showcase/`

## 关于登录方式

网页版和小程序共用**用户名 + 密码**登录/注册(不需要额外的短信服务账号和费用)。小程序端额外支持**微信一键登录**(用 `uni.login` 换取 openid,免密码)。两种方式登录后本质上是同一套用户体系,但目前没有做"网页账号绑定微信账号"的合并逻辑——如果你想让同一个人在小程序用微信登录、网页用密码登录后看到同一份数据,需要额外做账号绑定,目前是两条独立的登录路径。
