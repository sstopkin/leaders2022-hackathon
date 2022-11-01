FROM python:3.8-slim-buster

RUN mkdir /pathologies-generator
WORKDIR /pathologies-generator

ARG ENV

COPY requirements.txt .

RUN apt-get update \
  && apt-get install -y python3-opencv \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && pip install -r requirements.txt \
                                             --no-cache-dir \
                                             --extra-index-url https://download.pytorch.org/whl/cpu

COPY app .

RUN sed -i "s|YYYYMMDD|$(date '+%Y%m%d')|g" ./core/version.py && \
    sed -i "s|SHORT_SHA|${short_sha}|g" ./core/version.py

COPY ops-tools/environments/$ENV/logging.ini .

CMD python main.py