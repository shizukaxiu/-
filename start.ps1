# 医保经办助手 - 本地开发环境一键启动

function Test-Command {
  param([string]$Command)
  $null = Get-Command $Command -ErrorAction SilentlyContinue
  return $?
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  医保经办助手 - 本地开发环境一键启动" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Command "node")) {
  Write-Host "[错误] 未检测到 Node.js, 请先安装 Node.js (https://nodejs.org/)" -ForegroundColor Red
  Read-Host "按回车键退出"
  exit 1
}

if (-not (Test-Command "npm")) {
  Write-Host "[错误] 未检测到 npm, 请检查 Node.js 安装是否完整" -ForegroundColor Red
  Read-Host "按回车键退出"
  exit 1
}

Write-Host "[提示] Node.js 与 npm 检测通过。" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "node_modules")) {
  Write-Host "[提示] 未检测到 node_modules, 正在执行 npm install..." -ForegroundColor Yellow
  Write-Host ""
  npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] npm install 失败, 请检查网络连接或 npm 源配置。" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
  }
  Write-Host ""
  Write-Host "[成功] 依赖安装完成。" -ForegroundColor Green
} else {
  Write-Host "[提示] 已检测到 node_modules, 跳过安装。" -ForegroundColor Green
}

Write-Host ""
Write-Host "[提示] 正在启动开发服务器, 默认地址 http://localhost:5200/" -ForegroundColor Green
Write-Host "[提示] 登录账号：" -ForegroundColor Green
Write-Host "         普通用户: 111 / 111"
Write-Host "         系统管理员: 222 / 222"
Write-Host ""
Write-Host "如需停止服务, 请在此窗口按 Ctrl + C, 然后关闭窗口。" -ForegroundColor Yellow
Write-Host ""

npm run dev

if ($LASTEXITCODE -ne 0) {
  Write-Host "[错误] 开发服务器启动失败, 请查看上方错误信息。" -ForegroundColor Red
} else {
  Write-Host "[提示] 开发服务器已退出。" -ForegroundColor Green
}
Read-Host "按回车键退出"