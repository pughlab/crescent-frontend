FROM ubuntu:18.04
RUN apt-get update && apt-get install -y python3 python3-pip && python3 -m pip install --upgrade pip setuptools wheel
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
# FROM tiangolo/uvicorn-gunicorn-fastapi:python3.6

ADD ./src/requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install werkzeug==0.16.1
RUN pip install wes-service
RUN pip install -r requirements.txt