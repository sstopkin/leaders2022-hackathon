FROM python:3.8-slim-buster

RUN mkdir /pathologies-generator
WORKDIR /pathologies-generator

COPY requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt \
                                             --no-cache-dir \
                                             -f https://download.pytorch.org/whl/cu113

COPY app .

RUN sed -i "s|YYYYMMDD|$(date '+%Y%m%d')|g" ./core/version.py && \
    sed -i "s|SHORT_SHA|${short_sha}|g" ./core/version.py

COPY ops-tools/environments/$ENV/logging.ini .

CMD python main.py