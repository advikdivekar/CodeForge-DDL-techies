FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

# Skip weasyprint — it needs heavy system libs (libpango etc.) unavailable in slim.
# PDF endpoint returns 500 in Docker; all other endpoints work normally.
RUN pip install --no-cache-dir $(grep -v weasyprint requirements.txt | tr '\n' ' ')

COPY . .

EXPOSE 8000

# Healthcheck via Python stdlib — no curl needed
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=20s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/ping')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
