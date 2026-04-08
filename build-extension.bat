@echo off
title Cursor Proxy VSIX Packager
color 0A

echo =======================================================
echo         Cursor Proxy VSCode Extension Packager
echo =======================================================
echo.

echo [1/3] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [Error] Failed to install root dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Changing directory to apps\vscode-extension...
cd apps\vscode-extension
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [Error] Directory apps\vscode-extension not found.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Building and packaging the extension...
call npm run package
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [Error] Failed to package the extension.
    pause
    exit /b %errorlevel%
)

echo.
echo =======================================================
echo  SUCCESS! The .vsix file is ready in apps\vscode-extension
echo =======================================================
echo You can use the Cursor IDE to install it:
echo Cursor: Extensions -^> ... -^> Install from VSIX
echo.
pause
