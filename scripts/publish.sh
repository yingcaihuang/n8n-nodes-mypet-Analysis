#!/bin/bash

# MyPet Analytics - 发布脚本
# 用于自动化构建和发布流程

set -e

echo "🚀 开始发布 MyPet Analytics 到 npm..."

# 检查是否已登录 npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ 请先登录 npm: npm login"
    exit 1
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf dist/
mkdir -p dist/nodes/MyPetAnalytics/analytics
mkdir -p dist/credentials

# 安装依赖
echo "📦 安装依赖..."
npm install

# 运行测试
echo "🧪 运行测试..."
npm test

# 代码检查
echo "🔍 代码检查..."
npm run lint

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -f "dist/nodes/MyPetAnalytics/MyPetAnalytics.node.js" ]; then
    echo "❌ 构建失败：找不到主节点文件"
    exit 1
fi

if [ ! -f "dist/credentials/MyPetAnalyticsApi.credentials.js" ]; then
    echo "❌ 构建失败：找不到凭据文件"
    exit 1
fi

# 检查包内容
echo "📋 检查包内容..."
npm pack --dry-run

# 确认发布
echo "❓ 确认发布到 npm? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🚀 发布到 npm..."
    npm publish
    echo "✅ 发布成功！"
    echo "📦 包名: n8n-nodes-mypet-analytics"
    echo "🔗 npm: https://www.npmjs.com/package/n8n-nodes-mypet-analytics"
else
    echo "❌ 发布已取消"
    exit 1
fi

echo "🎉 发布完成！"
