@echo off
title Alumni Tracker - Setup dan Jalankan

echo.
echo ================================================
echo    ALUMNI TRACKER UMM - Setup Otomatis
echo ================================================
echo.

:: Cek Python
echo [1/5] Mengecek Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python tidak ditemukan!
    echo Install dari Microsoft Store: cari "Python 3.12"
    pause
    exit /b 1
)
python --version
echo.

:: Setup virtual environment
echo [2/5] Setup virtual environment...
cd /d "%~dp0backend"

if not exist "venv\Scripts\activate.bat" (
    echo Membuat virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
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
call venv\Scripts\activate.bat
pip install -r requirements.txt -q --disable-pip-version-check
if %errorlevel% neq 0 (
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
    python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine); print('Database dan tabel berhasil dibuat.')"
    
    if exist "..\public\Alumni 2000-2025.xlsx" (
        echo Mengimpor data Excel alumni...
        python import_alumni.py --file "..\public\Alumni 2000-2025.xlsx" --create-users
    ) else (
        echo File Excel tidak ditemukan, membuat user default saja...
        python -c "from import_alumni import create_default_users; create_default_users()"
    )
) else (
    echo Database sudah ada, skip import.
)
echo.

:: Jalankan backend di window baru
echo [5/5] Menjalankan aplikasi...
echo.
echo ------------------------------------------------
echo  Backend : http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo ------------------------------------------------
echo.

start "Alumni Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

timeout /t 4 /nobreak >nul

:: Jalankan frontend di window baru
start "Alumni Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak >nul

:: Buka browser
start http://localhost:5173

echo Aplikasi berjalan! Cek dua window terminal yang terbuka.
echo.
pause
