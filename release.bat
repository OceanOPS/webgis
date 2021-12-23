set RELEASE_DIR=release
rmdir /s /q .\%RELEASE_DIR%
mkdir .\%RELEASE_DIR%
mkdir .\%RELEASE_DIR%\app
xcopy ".\src\index.html" ".\%RELEASE_DIR%"
mkdir .\%RELEASE_DIR%\app\symbologies
xcopy ".\src\app\symbologies" ".\%RELEASE_DIR%\app\symbologies" /s /e
mkdir .\%RELEASE_DIR%\app\resources
xcopy ".\src\app\resources" ".\%RELEASE_DIR%\app\resources" /s /e
mkdir .\%RELEASE_DIR%\app\modules
xcopy ".\src\app\modules" ".\%RELEASE_DIR%\app\modules" /s /e
xcopy ".\src\app\run.js" ".\%RELEASE_DIR%\app"
xcopy ".\src\app\app.js" ".\%RELEASE_DIR%\app"
powershell -Command "(gc .\%RELEASE_DIR%\index.html) -replace 'debug = true', 'debug = false' | Out-File .\%RELEASE_DIR%\index.html"
