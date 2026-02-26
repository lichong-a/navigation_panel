# RicPanel - 个人导航面板

一个简洁美观的个人导航网站，充满动效和 3D 效果。

## 功能特性

- 分组管理：创建、编辑、删除、拖拽排序
- 网站管理：标题、描述、图标、内网/外网地址、打开方式、标签
- 图标支持：Iconify 搜索、上传图片、自动获取 Favicon
- 内网/外网模式切换
- 3D 粒子背景 + 卡片悬停效果
- 数据导入导出
- 单管理员认证

## 技术栈

- Next.js 15 + React 19
- TypeScript 5
- Tailwind CSS 4
- React Three Fiber (3D)
- Framer Motion (动画)
- @dnd-kit (拖拽)
- Zustand (状态管理)
- JWT + bcrypt (认证)

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产运行
pnpm start
```

## 部署

### Docker 部署（推荐）

#### 方式一：docker-compose（推荐）

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 方式二：Docker 命令

```bash
# 构建镜像
docker build -t ricpanel:latest .

# 运行容器
docker run -d \
  --name ricpanel \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  ricpanel:latest
```

#### Docker 部署说明

- 镜像基于 `node:20-alpine`，体积小，安全性高
- 使用多阶段构建优化镜像大小
- 数据持久化：`data/` 目录挂载到宿主机
- 内置健康检查

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start pnpm --name ricpanel -- start

# 开机自启
pm2 startup
pm2 save
```

## 数据存储

- `data/config.json` - 管理员配置
- `data/sites.json` - 分组和网站数据
- `data/uploads/` - 上传的图标文件

首次访问会自动进入初始化向导。

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| TZ | 时区 | - |

## 常见问题

参见 [docs/faq.md](docs/faq.md)

## License

MIT
