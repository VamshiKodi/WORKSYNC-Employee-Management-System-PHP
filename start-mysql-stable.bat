@echo off
echo Starting MySQL on port 3307...
cd /d C:\xampp\mysql\bin
mysqld.exe --defaults-file=my.ini --port=3307 --skip-grant-tables --skip-networking=0 --bind-address=127.0.0.1 --console
pause
