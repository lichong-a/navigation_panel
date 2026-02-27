# RicPanel

<div align="center">

**极简 · 高性能 · 零依赖**

一个现代化的个人导航面板

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 🚀 **高性能** | 服务端内存缓存，零重复 IO，毫秒级响应 |
| 🪶 **轻量级** | Docker 镜像仅 ~150MB，无数据库依赖 |
| 🔒 **零中间件** | 无需 Redis/MySQL/MongoDB，JSON 文件存储 |
| 🎨 **3D 动效** | Three.js 粒子背景，Framer Motion 流畅动画 |
| 📱 **响应式** | 完美适配桌面端与移动端 |
| 🌓 **多主题** | 支持暗色/亮色/跟随系统三种模式 |
| 🔄 **内外网** | 一键切换公网/内网地址 |
| 📦 **数据迁移** | 一键导入导出，备份无忧 |

## 🛠️ 快速开始

```bash
# Docker（推荐）
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data lc1025082182/ricpanel:latest

# 或本地运行
pnpm install && pnpm build && pnpm start
```

访问 `http://localhost:3000`，首次进入设置管理员账户即可使用。

## 📖 文档

- [部署文档](docs/deployment.md) - Docker / PM2 部署指南
- [常见问题](docs/faq.md) - 问题排查

## 📄 License

[MIT](LICENSE)

---

<div align="center">

**[GitHub](https://github.com/lichong-a/navigation_panel)** · Star ⭐ 支持

</div>
