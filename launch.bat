@echo off
cd web
echo "starting server at http://localhost:8080"
..\node.exe ..\server.js ..\config.json
cd ..
pause