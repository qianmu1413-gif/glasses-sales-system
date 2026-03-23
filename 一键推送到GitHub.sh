#!/bin/bash

echo "=========================================="
echo "眼镜销售智能助手系统 - GitHub自动打包"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "错误: 请在 weflow-source 目录下运行此脚本"
    exit 1
fi

echo "步骤 1/4: 添加所有文件到git..."
git add .

echo "步骤 2/4: 创建提交..."
git commit -m "眼镜销售智能助手系统 - 初始提交

核心功能：
- AI顾客画像分析（性格、年龄、消费倾向）
- 智能销售话术生成（6种场景）
- 镜框推荐系统（脸型、风格、价格匹配）
- 一键价格计算（镜框+镜片+折扣）
- 顾客数据管理（SQLite）
- 半自动消息发送（剪贴板复制）

技术栈：
- Electron + React + TypeScript
- OpenAI GPT-4 / Claude 3.5 Sonnet
- SQLite数据库
- Zustand状态管理"

echo ""
echo "=========================================="
echo "重要: 请先创建GitHub仓库"
echo "=========================================="
echo ""
echo "1. 访问 https://github.com/new"
echo "2. 创建新仓库（可以是私有的）"
echo "3. 复制仓库地址（例如: https://github.com/你的用户名/仓库名.git）"
echo ""
read -p "请输入你的GitHub仓库地址: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "错误: 仓库地址不能为空"
    exit 1
fi

echo ""
echo "步骤 3/4: 关联远程仓库..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo "步骤 4/4: 推送到GitHub..."
git push -u origin main || git push -u origin master

echo ""
echo "=========================================="
echo "✅ 推送成功！"
echo "=========================================="
echo ""
echo "接下来："
echo "1. 访问你的GitHub仓库"
echo "2. 点击 'Actions' 标签"
echo "3. 等待5-10分钟，自动打包完成"
echo "4. 在 'Artifacts' 部分下载 WeFlow-Windows-Setup"
echo "5. 解压得到 WeFlow-2.1.0-Setup.exe"
echo ""
echo "GitHub Actions会自动帮你打包Windows exe文件！"
echo ""
