FROM node:13-buster-slim
RUN apt-get update && apt-get install -y wget python3 python3-pip && python3 -m pip install --upgrade pip setuptools wheel
COPY ./python/requirements.txt /
RUN pip install --no-cache-dir -r requirements.txt
RUN wget -O- http://neuro.debian.net/lists/xenial.us-ca.full | tee /etc/apt/sources.list.d/neurodebian.sources.list && \
    apt-key adv --recv-keys --keyserver hkp://pool.sks-keyservers.net:80 0xA5D32F012649A5A9 && \
    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y singularity-container
WORKDIR /usr/src/app
CMD ["npm", "run", "server"]
