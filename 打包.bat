@echo off
echo ========================================
echo 眼镜销售智能助手系统 - Windows打包脚本
echo ========================================
echo.

echo [1/4] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装Node.js
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)
echo Node.js 已安装
echo.

echo [2/4] 安装依赖包...
call npm install
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)
echo.

echo [3/4] 编译TypeScript...
call npm run typecheck
if errorlevel 1 (
    echo 警告: TypeScript检查有错误，但继续打包...
)
echo.

echo [4/4] 打包Windows应用...
call npm run build
if errorlevel 1 (
    echo 错误: 打包失败
    pause
    exit /b 1
)
echo.

echo ========================================
echo 打包完成！
echo ========================================
echo.
echo 生成的文件位置:
echo release\WeFlow-2.1.0-Setup.exe
echo.
echo 双击安装即可使用
echo.
pause
