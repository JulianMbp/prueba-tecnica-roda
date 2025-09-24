FROM python:3.11-slim

# set workdir
WORKDIR /app

# install system deps
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	libpq-dev \
	netcat-openbsd \
	&& rm -rf /var/lib/apt/lists/*

# copy requirements and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# copy app
COPY . /app

# make entrypoint executable
RUN chmod +x /app/entrypoint.sh

ENV PYTHONUNBUFFERED=1

CMD ["/app/entrypoint.sh", "gunicorn", "-b", "0.0.0.0:8000", "app:app"]
