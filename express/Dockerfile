FROM node:11-alpine as build-deps
WORKDIR /Users/smohanra/Desktop/crescentMockup/express
COPY ../package.json .
COPY ../package-lock.json .

RUN npm install --no-save
COPY . ./
RUN npm run server

