FROM python:3.12-slim

WORKDIR /app

# System deps needed by mysqlclient-less PyMySQL + cryptography wheel builds
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train the model at image build time so ml_models/*.pkl always exists and
# matches the scikit-learn version actually installed in this image.
RUN python app/ml/generate_dataset.py && python app/ml/train.py

RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
