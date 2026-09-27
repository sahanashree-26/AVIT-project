@echo off
echo =====================================================
echo  VitalSignAI - START
echo =====================================================
echo Starting backend (FastAPI) on http://localhost:8000 ...
start "VitalSignAI Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend (React + Vite) on http://localhost:5173 ...
start "VitalSignAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================
echo  Two windows just opened: Backend and Frontend.
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:8000
echo  Swagger  : http://localhost:8000/docs
echo =====================================================
