@echo off
cd web
echo "starting server at http://localhost/"
..\node.exe ..\server.js ..\config.json
cd ..
pause