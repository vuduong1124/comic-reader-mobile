@echo off
echo ========================================
echo        EXPO APK BUILD SCRIPT
echo ========================================
echo.

echo [1/4] Setting up Android SDK environment...
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
echo Android SDK: %ANDROID_HOME%
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Generating native Android code...
call npx expo prebuild --platform android
if errorlevel 1 (
    echo ERROR: Failed to prebuild
    pause
    exit /b 1
)
echo.

echo [4/4] Building APK...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo ERROR: Failed to build APK
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo           BUILD SUCCESSFUL!
echo ========================================
echo APK Location: android\app\build\outputs\apk\release\app-release.apk
echo.

echo Opening output folder...
start "" "%CD%\android\app\build\outputs\apk\release"
