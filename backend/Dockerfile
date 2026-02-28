FROM python:3.11-slim

# Pracovný adresár v kontajneri
WORKDIR /app

# Inštalácia dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopírovanie kódu do kontajnera
COPY worker.py .

# Príkaz na spustenie workera
CMD ["python", "-u", "worker.py"]
