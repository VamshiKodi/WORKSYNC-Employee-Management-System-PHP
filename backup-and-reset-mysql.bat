@echo off
echo ========================================
echo MySQL Data Directory Cleanup and Reset
echo ========================================

REM Stop any running MySQL processes
taskkill /F /IM mysqld.exe 2>nul

echo.
echo Step 1: Backing up your EMS database...
if exist "C:\xampp\mysql\data\ems" (
    xcopy "C:\xampp\mysql\data\ems" "C:\xampp\htdocs\EMS\ems-database-backup\" /E /I /Y
    echo EMS database backed up to: C:\xampp\htdocs\EMS\ems-database-backup\
) else (
    echo No EMS database found to backup.
)

echo.
echo Step 2: Cleaning corrupted MySQL files...
cd /d "C:\xampp\mysql\data"

REM Remove problematic binary and relay logs
del /Q mysql-relay-bin* 2>nul
del /Q relay-log* 2>nul
del /Q master-* 2>nul
del /Q multi-master.info 2>nul
del /Q ib_logfile* 2>nul
del /Q ibdata1 2>nul
del /Q ibtmp1 2>nul
del /Q ib_buffer_pool 2>nul
del /Q mysqld.dmp 2>nul

echo Corrupted files removed.

echo.
echo Step 3: Creating fresh MySQL data directory...
REM Keep only essential directories and files
REM EMS database should remain intact

echo.
echo Step 4: Starting MySQL with clean configuration...
cd /d "C:\xampp\mysql\bin"
start "MySQL Server" mysqld.exe --port=3307 --skip-innodb --default-storage-engine=MyISAM --skip-grant-tables --console

echo.
echo ========================================
echo MySQL reset complete!
echo Your EMS database backup is at:
echo C:\xampp\htdocs\EMS\ems-database-backup\
echo ========================================
pause
