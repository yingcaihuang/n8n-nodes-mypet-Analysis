# MyPet Analytics - 发布检查清单

## 📋 发布前检查清单

### ✅ 代码质量检查
- [ ] 所有 TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] Prettier 格式化完成
- [ ] 单元测试全部通过
- [ ] 测试覆盖率达标

### ✅ 包配置检查
- [ ] package.json 信息完整正确
- [ ] 版本号符合语义化版本规范
- [ ] 依赖版本正确且兼容
- [ ] n8n 配置正确
- [ ] 文件包含列表正确

### ✅ 文档检查
- [ ] README.md 完整且准确
- [ ] 使用示例可用
- [ ] API 文档完整
- [ ] 许可证文件存在

### ✅ 功能检查
- [ ] 所有分析功能正常工作
- [ ] 可视化生成正常
- [ ] 报告生成正常
- [ ] 错误处理完善
- [ ] 与 MyPet Stocks 节点兼容

### ✅ 构建检查
- [ ] 构建脚本正常执行
- [ ] 输出文件结构正确
- [ ] 图标文件正确复制
- [ ] 入口文件正确

## 🚀 发布步骤

### 1. 环境准备
```bash
# 确保 Node.js 版本 >= 16
node --version

# 确保 npm 版本 >= 8
npm --version

# 登录 npm (如果还未登录)
npm login
```

### 2. 代码检查
```bash
# 安装依赖
npm install

# 运行测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

### 3. 构建项目
```bash
# 构建项目
npm run build

# 检查构建结果
ls -la dist/

# 检查包内容
npm run pack:check
```

### 4. 版本管理
```bash
# 更新版本号 (根据变更类型选择)
npm version patch   # 修复版本 1.0.0 -> 1.0.1
npm version minor   # 功能版本 1.0.0 -> 1.1.0
npm version major   # 重大版本 1.0.0 -> 2.0.0
```

### 5. 发布到 npm
```bash
# 使用发布脚本 (推荐)
npm run publish:npm

# 或手动发布
npm publish
```

### 6. 发布后验证
```bash
# 检查包是否发布成功
npm view n8n-nodes-mypet-analytics

# 测试安装
npm install n8n-nodes-mypet-analytics
```

## 📦 npm 包信息

- **包名**: `n8n-nodes-mypet-analytics`
- **当前版本**: `1.0.0`
- **许可证**: MIT
- **主页**: https://github.com/yingcaihuang/n8n-nodes-mypet-analytics
- **npm 链接**: https://www.npmjs.com/package/n8n-nodes-mypet-analytics

## 🔗 n8n 社区节点注册

发布到 npm 后，用户可以通过以下方式安装：

### 方式 1: n8n 界面安装
1. 打开 n8n 界面
2. 进入 **Settings** > **Community Nodes**
3. 点击 **Install a community node**
4. 输入: `n8n-nodes-mypet-analytics`
5. 点击 **Install**

### 方式 2: 命令行安装
```bash
# 在 n8n 项目目录中
npm install n8n-nodes-mypet-analytics

# 重启 n8n
npm start
```

### 方式 3: Docker 环境
```dockerfile
# 在 Dockerfile 中添加
RUN npm install -g n8n-nodes-mypet-analytics

# 或在 docker-compose.yml 中设置环境变量
environment:
  - N8N_CUSTOM_EXTENSIONS=n8n-nodes-mypet-analytics
```

## 🎯 发布后推广

### 社区推广
- [ ] 在 n8n 社区论坛发布介绍
- [ ] 在 GitHub 上创建 Release
- [ ] 在相关技术博客发文介绍
- [ ] 在社交媒体分享

### 文档更新
- [ ] 更新项目 README
- [ ] 创建使用教程
- [ ] 录制演示视频
- [ ] 更新示例工作流

### 用户支持
- [ ] 监控 GitHub Issues
- [ ] 回答用户问题
- [ ] 收集用户反馈
- [ ] 规划下一版本功能

## ⚠️ 注意事项

1. **版本管理**: 严格遵循语义化版本规范
2. **向后兼容**: 确保新版本不破坏现有工作流
3. **安全检查**: 定期更新依赖，修复安全漏洞
4. **性能监控**: 关注包大小和运行性能
5. **用户反馈**: 及时响应用户问题和建议

## 🆘 问题排查

### 常见发布问题
1. **权限错误**: 确保已正确登录 npm
2. **版本冲突**: 检查版本号是否已存在
3. **构建失败**: 检查 TypeScript 编译错误
4. **依赖问题**: 确保所有依赖正确安装

### 发布失败恢复
```bash
# 如果发布失败，可以撤销版本标签
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# 重新设置版本
npm version 1.0.0 --no-git-tag-version
```

---

**提醒**: 发布是不可逆操作，请确保所有检查项都已完成！
