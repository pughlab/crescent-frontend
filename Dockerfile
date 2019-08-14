# Dockerfile from crossbar docker/disclose example

FROM node:11-alpine as build-deps
WORKDIR /Users/smohanra/Desktop/crescentMockup
COPY package.json .
COPY package-lock.json .

RUN npm install --no-save
COPY . ./
EXPOSE 3000
EXPOSE 5000
CMD ["npm", "run", "start"]

