@echo off
chcp 65001 >nul

title 医保经办助手 - 一键启动

echo ==========================================
echo   医保经办助手 - 本地开发环境一键启动
echo ==========================================
echo.

REM 检查 Node.js 和 npm 是否可用
call node --version >nul 2>&1
if errorlevel 1 goto NODE_MISSING

call npm --version >nul 2>&1
if errorlevel 1 goto NPM_MISSING

echo [提示] Node.js 与 npm 检测通过.
echo.

REM 检查 node_modules
if not exist "node_modules" goto INSTALL_DEPS

echo [提示] 已检测到 node_modules, 跳过安装.
goto START_SERVER

:INSTALL_DEPS
echo [提示] 未检测到 node_modules, 正在执行 npm install...
echo.
call npm install
if errorlevel 1 goto INSTALL_FAILED
echo.
echo [成功] 依赖安装完成.
goto START_SERVER

:START_SERVER
echo.
echo [提示] 正在启动开发服务器, 默认地址 http://localhost:5200/
echo [提示] 登录账号:
echo          普通用户: 111 / 111
echo          系统管理员: 222 / 222
echo.
echo 如需停止服务, 请在此窗口按 Ctrl + C, 然后关闭窗口.
echo.

call npm run dev
if errorlevel 1 goto DEV_FAILED
goto END

:NODE_MISSING
echo [错误] 未检测到 Node.js, 请先安装 Node.js (https://nodejs.org/)
pause
exit /b 1

:NPM_MISSING
echo [错误] 未检测到 npm, 请检查 Node.js 安装是否完整
pause
exit /b 1

:INSTALL_FAILED
echo [错误] npm install 失败, 请检查网络连接或 npm 源配置.
pause
exit /b 1

:DEV_FAILED
echo.
echo [错误] 开发服务器启动失败, 请查看上方错误信息.
pause
exit /b 1

:END
echo.
echo [提示] 开发服务器已退出.
pause