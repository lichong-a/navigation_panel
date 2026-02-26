# FAQ

## 1. dnd-kit 拖拽相关问题

### 1.1 为什么 DragOverlay 预览框位置偏移？

**问题**：当 DragOverlay 组件嵌套在使用 CSS transform 的父元素内部时（如 dnd-kit 的 useSortable），预览框位置会偏移。

**原因**：父元素的 transform 会创建新的 stacking context，导致 DragOverlay 的定位计算错误。

**解决方案**：使用 `createPortal` 将 DragOverlay 渲染到 `document.body`，脱离 transform 上下文：

```tsx
import { createPortal } from 'react-dom'

// 在 DndContext 内部
{createPortal(
  <DragOverlay dropAnimation={null}>
    {activeItem ? (
      <div className="cursor-grabbing pointer-events-none scale-90">
        {/* 预览内容 */}
      </div>
    ) : null}
  </DragOverlay>,
  document.body
)}
```

### 1.2 为什么 Dialog 模态框被父元素遮挡？

**问题**：Dialog 组件在使用 transform 的父元素内部时，即使设置了高 z-index，仍可能被其他元素遮挡。

**原因**：CSS transform 会创建新的 stacking context，破坏 z-index 的层叠顺序。

**解决方案**：使用 `createPortal` 将 Dialog 渲染到 `document.body`：

```tsx
import { createPortal } from 'react-dom'

export function Dialog({ open, children }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Dialog 内容 */}
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
```

### 1.3 嵌套 DndContext 的注意事项

当分组和网站都需要拖拽排序时，会产生嵌套的 DndContext：

- 外层：GroupList 的 DndContext（分组拖拽）
- 内层：SiteGrid 的 DndContext（网站拖拽）

这种情况下，内层的 DragOverlay 和 Dialog 都需要用 `createPortal` 渲染到 body，避免受外层 transform 影响。

## 2. Docker 部署相关问题

### 2.1 容器启动后无法访问？

**检查步骤**：
1. 确认容器正在运行：`docker ps`
2. 检查端口映射：确保宿主机 3000 端口未被占用
3. 查看容器日志：`docker logs ricpanel`

### 2.2 数据目录权限问题？

**问题**：容器内使用 uid 1001 运行，如果宿主机 data 目录权限不正确会导致写入失败。

**解决方案**：
```bash
chown -R 1001:1001 data/
```

### 2.3 如何查看容器内日志？

```bash
# 实时查看日志
docker logs -f ricpanel

# 查看最近 100 行
docker logs --tail 100 ricpanel
```

### 2.4 如何进入容器调试？

```bash
docker exec -it ricpanel sh
```

