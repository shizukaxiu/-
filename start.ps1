# 医保经办助手 - 本地开发环境一键启动

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  医保经办助手 - 本地开发环境一键启动" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "node_modules")) {
  Write-Host "未检测到 node_modules，正在执行 npm install..." -ForegroundColor Yellow
  Write-Host ""
  npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install 失败，请检查网络或 Node.js 环境。" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
  }
}

Write-Host "正在启动开发服务器，默认地址 http://localhost:5200/" -ForegroundColor Green
Write-Host ""
Write-Host "登录账号："
Write-Host "  普通用户：111 / 111"
Write-Host "  系统管理员：222 / 222"
Write-Host ""

npm run dev

if ($LASTEXITCODE -ne 0) {
  Write-Host "启动失败，请检查错误信息。" -ForegroundColor Red
  Read-Host "按回车键退出"
}
