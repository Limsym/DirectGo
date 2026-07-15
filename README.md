# DirectGo

DirectGo 是一个轻量的常用平台搜索入口：输入「平台 + 关键词」，即可直达知乎、微博、小红书、哔哩哔哩、GitHub 等平台的搜索结果，减少进入信息流后的干扰。

## 在线访问

- GitHub Pages（对应本仓库 `index.html`）：https://<YOUR_GITHUB_USERNAME>.github.io/DirectGo/
- 本地预览：直接在浏览器中打开 `index.html`，或在仓库根目录启动一个静态文件服务器。

> 说明：当前本地仓库未配置 Git remote，无法从仓库配置中读取 GitHub 用户名/组织名。将本仓库发布到 GitHub Pages 后，请把上方链接中的 `<YOUR_GITHUB_USERNAME>` 替换为实际的 GitHub 用户名或组织名。

## 文件结构

- `index.html`：页面结构与 SEO 元信息。
- `styles.css`：页面样式。
- `app.js`：平台别名、搜索跳转与交互逻辑。

## 使用方式

1. 打开上方 GitHub Pages 链接。
2. 在搜索框输入关键词，或输入「平台 + 关键词」（例如 `gh DirectGo`）。
3. 按下 Enter 或点击箭头按钮跳转到对应平台搜索结果。
