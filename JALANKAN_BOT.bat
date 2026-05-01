@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo   BOT PENCARIAN DATA ALUMNI UMM
echo ============================================================
echo.
echo Pilih mode:
echo   [1] Mulai / Lanjutkan pencarian (2.5 detik per alumni)
echo   [2] Cari lebih cepat (1.5 detik) - BERESIKO DIBLOKIR
echo   [3] Cari hanya 100 alumni dulu (Test)
echo   [4] Cari berdasarkan Prodi tertentu
echo   [5] Lihat progress dan statistik coverage
echo   [6] Reset progress (mulai dari awal)
echo   [7] Keluar
echo.
set /p pilihan=Masukkan pilihan (1-7): 

if "%pilihan%"=="1" goto mulai
if "%pilihan%"=="2" goto cepat
if "%pilihan%"=="3" goto test
if "%pilihan%"=="4" goto prodi
if "%pilihan%"=="5" goto progress
if "%pilihan%"=="6" goto reset
if "%pilihan%"=="7" goto keluar
goto keluar

:mulai
echo.
echo Memulai / melanjutkan pencarian...
python scraper\alumni_scraper.py --delay 2.5
goto selesai

:cepat
echo.
echo Memulai pencarian mode cepat (1.5 detik)...
python scraper\alumni_scraper.py --delay 1.5
goto selesai

:test
echo.
echo Mencari 100 alumni pertama (mode test)...
python scraper\alumni_scraper.py --limit 100 --delay 2.0
goto selesai

:prodi
echo.
set /p nama_prodi=Masukkan nama prodi (contoh: Teknik Informatika): 
python scraper\alumni_scraper.py --prodi "%nama_prodi%"
goto selesai

:progress
echo.
python scraper\lihat_progress.py
goto selesai

:reset
echo.
echo PERINGATAN: Semua progress akan dihapus!
set /p konfirmasi=Yakin reset? (y/n): 
if /i "%konfirmasi%"=="y" (
    python scraper\alumni_scraper.py --reset
    echo Progress berhasil direset.
)
goto selesai

:selesai
echo.
pause
goto mulai_lagi

:mulai_lagi
cls
goto :eof

:keluar
echo Sampai jumpa!
exit /b 0
