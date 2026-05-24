@echo off
chcp 936

echo 正在查找并终止 3000 端口上的 Node 服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 终止进程 PID: %%a
    taskkill /PID %%a /F
)
pause 