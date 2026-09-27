@echo off
setlocal enabledelayedexpansion
echo =====================================================
echo  VitalSignAI - SETUP
echo =====================================================

echo.
echo [1/6] Creating backend virtual environment...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat

echo.
echo [2/6] Installing backend dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [3/6] Checking backend\.env ...
if not exist .env (
    copy .env.example .env
    echo.
    echo !!! IMPORTANT: Edit backend\.env and set your real MySQL password
    echo     in DATABASE_URL before running the project.
    echo.
)

echo.
echo [4/6] Generating training dataset and training the Logistic Regression model...
python app\ml\generate_dataset.py
python app\ml\train.py

cd ..

echo.
echo [5/6] Installing frontend dependencies...
cd frontend
call npm install

echo.
echo [6/6] Checking frontend\.env ...
if not exist .env (
    echo VITE_API_URL=http://localhost:8000 > .env
)

cd ..

echo.
echo =====================================================
echo  SETUP COMPLETE
echo =====================================================
echo Next steps:
echo   1. Make sure MySQL is running and the 'vitalsignai' database
echo      exists (see database\create_database.sql).
echo   2. Check backend\.env has the correct DATABASE_URL password.
echo   3. Run run.bat to start the application.
echo =====================================================
pause
