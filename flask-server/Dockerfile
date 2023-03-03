FROM python:3.10-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python3", "-m", "flask", "--app", "src/server.py", "--debug", "run", "--host=0.0.0.0"]