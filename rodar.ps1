# Para o Apache se estiver rodando
Stop-Process -Name "httpd" -Force -ErrorAction SilentlyContinue

# Inicia o Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Administrator\Downloads\domino-quimico\backend\build\Release'; .\domino-backend.exe"

# Inicia o Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Administrator\Downloads\domino-quimico\frontend'; npm run dev"

Write-Host "Backend e Frontend iniciados!"
