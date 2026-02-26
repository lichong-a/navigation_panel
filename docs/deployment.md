# 部署文档

## 1. Docker 部署

### 1.1 前置要求

- Docker 20.10+
- Docker Compose 2.0+（可选）

### 1.2 使用 docker-compose 部署

```bash
# 克隆项目
git clone <repository-url>
cd navigation_panel

# 构建并启动（后台运行）
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 1.3 使用 Docker 命令部署

```bash
# 构建镜像
docker build -t ricpanel:latest .

# 运行容器
docker run -d \
  --name ricpanel \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e TZ=Asia/Shanghai \
  --restart unless-stopped \
  ricpanel:latest

# 查看日志
docker logs -f ricpanel

# 停止容器
docker stop ricpanel

# 删除容器
docker rm ricpanel
```

### 1.4 数据持久化

Docker 部署时，`data/` 目录需要挂载到宿主机以保证数据持久化：

```yaml
volumes:
  - ./data:/app/data
```

目录结构：
```
data/
├── config.json      # 管理员配置（用户名、密码哈希、JWT密钥）
├── sites.json       # 网站和分组数据
└── uploads/         # 上传的图标文件
```

### 1.5 反向代理配置

#### Nginx

```nginx
server {
    listen 80;
    server_name nav.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Caddy

```
nav.example.com {
    reverse_proxy localhost:3000
}
```

### 1.6 镜像优化说明

Dockerfile 采用多阶段构建：

1. **deps 阶段**：安装依赖
2. **builder 阶段**：构建应用
3. **runner 阶段**：精简的生产镜像

镜像特点：
- 基于 `node:20-alpine`，体积约 150MB
- 使用非 root 用户运行
- 内置健康检查
- 使用 Next.js standalone 输出模式

---

## 2. PM2 部署

### 2.1 安装

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 2.2 启动

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start pnpm --name ricpanel -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs ricpanel

# 开机自启
pm2 startup
pm2 save
```

### 2.3 ecosystem.config.js（可选）

```javascript
module.exports = {
  apps: [{
    name: 'ricpanel',
    script: 'pnpm',
    args: 'start',
    cwd: '/path/to/navigation_panel',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

---

## 3. 数据备份

### 3.1 手动备份

```bash
# 备份整个 data 目录
tar -czvf ricpanel-backup-$(date +%Y%m%d).tar.gz data/
```

### 3.2 定时备份（crontab）

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 3 点备份
0 3 * * * cd /path/to/navigation_panel && tar -czvf /backup/ricpanel-$(date +\%Y\%m\%d).tar.gz data/
```

### 3.3 恢复数据

```bash
# 解压备份
tar -xzvf ricpanel-backup-20260227.tar.gz

# Docker 部署时，确保 data/ 目录权限正确
chown -R 1001:1001 data/
```

---

## 4. 更新部署

### Docker

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### PM2

```bash
# 拉取最新代码
git pull

# 安装依赖并构建
pnpm install
pnpm build

# 重启服务
pm2 restart ricpanel
```

---

## 5. 故障排查

### 5.1 容器无法启动

```bash
# 查看日志
docker-compose logs ricpanel

# 检查端口占用
lsof -i :3000
```

### 5.2 数据权限问题

```bash
# 修复 data 目录权限（容器内使用 uid 1001）
chown -R 1001:1001 data/
```

### 5.3 健康检查失败

```bash
# 进入容器检查
docker exec -it ricpanel sh
wget -q -O /dev/null http://localhost:3000/ && echo "OK" || echo "FAIL"
```
