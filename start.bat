@echo off
chcp 65001 >nul
title 医保经办助手 - 一键启动

echo ==========================================
echo   医保经办助手 - 本地开发环境一键启动
echo ==========================================
echo.

if not exist "node_modules" (
  echo 未检测到 node_modules，正在执行 npm install...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install 失败，请检查网络或 Node.js 环境。
    pause
    exit /b 1
  )
)

echo 正在启动开发服务器，默认地址 http://localhost:5200/
echo.
echo 登录账号：
echo   普通用户：111 / 111
echo   系统管理员：222 / 222
echo.

call npm run dev

if errorlevel 1 (
  echo.
  echo 启动失败，请检查错误信息。
  pause
)
