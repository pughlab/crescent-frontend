FROM node:13-buster-slim
RUN apt-get update && apt-get install -y python3 python3-pip && python3 -m pip install --upgrade pip setuptools wheel
COPY ./express/python/requirements.txt /
RUN pip install --no-cache-dir -r requirements.txt
WORKDIR /usr/src/app

# GraphQL
EXPOSE 4001
# Express
EXPOSE 5000

CMD ["npm", "run", "server"]
