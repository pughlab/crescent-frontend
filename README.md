# CReSCENT: CanceR Single Cell Expression Toolkit (Web application)

## Prerequisites
- Git (to clone this repo)
- [Node.js](https://nodejs.org/)
- [Docker](https://docs.docker.com/v17.09/engine/installation/)
- [docker-compose](https://docs.docker.com/compose/install/)

## Local development
Clone this repo and create folders `results`, `minio/download` and `minio/upload` (BUG TO FIX).

Copy `sample.env` to `.env` and `react/sample.env` to `react/.env` and customize as needed.

`npm install` to install server dependencies.
`docker-compose up` to start the server backend.

In the `react` folder, `npm install` for frontend dependencies and then `npm start` to start a React development server.

```bash
git clone https://github.com/suluxan/crescent-frontend.git
cd crescent-frontend
cp sample.env .env
cp react/sample.env react/.env
npm i
docker-compose up -d
cd react
npm i
npm start
```

## Deploy to production
Clone this repo and create folders `minio/download` and `minio/upload` (BUG TO FIX).

Copy the SSL certificate files specified in `nginx/conf/default.conf` to `nginx/certs/`.
Copy `sample.env` to `.env` and `react/sample.env` to `react/.env` and customize as needed.

`npm install` to install server dependencies.
In the `react` folder, `npm install` for frontend dependencies and then `npm build` to compile a release version of the frontend in `build`.

In the root folder, `docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up` or `npm start` to start an HTTPS nginx reverse proxy for the entire application.

```bash
git clone https://github.com/suluxan/crescent-frontend.git
cd crescent-frontend
mkdir nginx/certs
cp YOUR_CERTIFICATES_HERE nginx/certs
cp sample.env .env
cp react/sample.env react/.env
npm ci
cd react
npm ci
npm run build
cd ..
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d 
# or npm start 
```
