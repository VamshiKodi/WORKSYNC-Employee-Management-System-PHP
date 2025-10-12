@echo off
echo Starting MySQL in SAFE MODE...

REM Kill any existing MySQL processes
taskkill /F /IM mysqld.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start MySQL in safe mode with minimal features
cd /d C:\xampp\mysql\bin
mysqld.exe ^
  --port=3307 ^
  --bind-address=127.0.0.1 ^
  --skip-innodb ^
  --skip-bdb ^
  --skip-networking=0 ^
  --default-storage-engine=MyISAM ^
  --key-buffer-size=16M ^
  --max-allowed-packet=1M ^
  --table-open-cache=32 ^
  --sort-buffer-size=64K ^
  --read-buffer-size=256K ^
  --read-rnd-buffer-size=128K ^
  --net-buffer-length=2K ^
  --thread-stack=128K ^
  --max-connections=10 ^
  --skip-grant-tables ^
  --console

pause
