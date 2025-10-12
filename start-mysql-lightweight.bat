@echo off
echo Starting MySQL in lightweight mode for phpMyAdmin...

REM Kill any existing MySQL processes
taskkill /F /IM mysqld.exe 2>nul

REM Start MySQL with minimal configuration
cd /d C:\xampp\mysql\bin
mysqld.exe --defaults-file=my.ini ^
  --port=3307 ^
  --skip-innodb ^
  --default-storage-engine=MyISAM ^
  --key-buffer-size=32M ^
  --table-open-cache=64 ^
  --sort-buffer-size=512K ^
  --net-buffer-length=8K ^
  --read-buffer-size=256K ^
  --read-rnd-buffer-size=512K ^
  --myisam-sort-buffer-size=8M ^
  --thread-cache-size=8 ^
  --query-cache-size=16M ^
  --tmp-table-size=32M ^
  --max-heap-table-size=32M ^
  --max-connections=50 ^
  --console

pause
