@echo off
setlocal
title Alumni Tracker - Setup dan Jalankan

echo.
echo ================================================
echo    ALUMNI TRACKER UMM - Setup Otomatis
echo ================================================
echo.

:: Cek Python
echo [1/5] Mengecek Python...
set "PY_CMD="

where python >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=python"
) else (
    where py >nul 2>&1
    if not errorlevel 1 (
        set "PY_CMD=py -3"
    )
)

if not defined PY_CMD (
    echo ERROR: Python 3.11+ tidak ditemukan di PATH.
    echo Install Python dari https://www.python.org/downloads/
    echo Pastikan opsi "Add python.exe to PATH" dicentang saat instalasi.
    pause
    exit /b 1
)

%PY_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python terdeteksi tapi tidak bisa dijalankan.
    pause
    exit /b 1
)
%PY_CMD% --version
echo.

:: Setup virtual environment
echo [2/5] Setup virtual environment...
cd /d "%~dp0backend"

if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -c "import sys" >nul 2>&1
    if errorlevel 1 (
        echo Virtual environment lama tidak valid, membuat ulang...
        rmdir /s /q venv
    )
)

if not exist "venv\Scripts\python.exe" (
    echo Membuat virtual environment...
    %PY_CMD% -m venv venv
    if errorlevel 1 (
        echo ERROR: Gagal membuat virtual environment.
        pause
        exit /b 1
    )
    echo Virtual environment berhasil dibuat.
) else (
    echo Virtual environment sudah ada, skip.
)
echo.

:: Install dependencies
echo [3/5] Install Python dependencies (tunggu sebentar)...
venv\Scripts\python.exe -m pip install -r requirements.txt -q --disable-pip-version-check
if errorlevel 1 (
    echo ERROR: Gagal install dependencies.
    pause
    exit /b 1
)
echo Dependencies berhasil diinstall.
echo.

:: Setup database
echo [4/5] Setup database...
if not exist "alumni_dev.db" (
    echo Membuat database baru...
    venv\Scripts\python.exe -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine); print('Database dan tabel berhasil dibuat.')"
    if errorlevel 1 (
        echo ERROR: Gagal membuat database.
        pause
        exit /b 1
    )
    
    if exist "..\public\Alumni 2000-2025.xlsx" (
        echo Mengimpor data Excel alumni...
        venv\Scripts\python.exe import_alumni.py --file "..\public\Alumni 2000-2025.xlsx" --create-users
        if errorlevel 1 (
            echo WARNING: Import Excel gagal. Lanjut menjalankan aplikasi.
        )
    ) else (
        echo File Excel tidak ditemukan, membuat user default saja...
        venv\Scripts\python.exe -c "from import_alumni import create_default_users; create_default_users()"
        if errorlevel 1 (
            echo WARNING: Gagal membuat user default. Lanjut menjalankan aplikasi.
        )
    )
) else (
    echo Database sudah ada, skip import.
)
echo.

:: Jalankan backend di window baru
echo [5/5] Menjalankan aplikasi...
where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm tidak ditemukan. Install Node.js LTS dari https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ------------------------------------------------
echo  Backend : http://127.0.0.1:8000
echo  Frontend: http://127.0.0.1:5173
echo  API Docs: http://127.0.0.1:8000/docs
echo ------------------------------------------------
echo.

start "Alumni Backend" cmd /k "cd /d ""%~dp0backend"" && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host :: --port 8000"

timeout /t 4 /nobreak >nul

:: Jalankan frontend di window baru
start "Alumni Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm.cmd run dev -- --host :: --port 5173"

timeout /t 5 /nobreak >nul

:: Buka browser
start http://127.0.0.1:5173

echo Aplikasi berjalan! Cek dua window terminal yang terbuka.
echo.
pause
