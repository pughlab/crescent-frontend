# CReSCENT: CanceR Single Cell Expression Toolkit (Web application) - Developer Documentation
For user manual please go to CReSCENT Docs: https://pughlab.github.io/crescent-frontend/


## Prerequisites
- Git (to clone this repo)
- [Node.js](https://nodejs.org/)
- [Docker](https://docs.docker.com/v17.09/engine/installation/)
- [docker-compose](https://docs.docker.com/compose/install/)

## Local development
Clone this repo.

Copy `sample.env` to `.env` and `react/sample.env` to `react/.env` and customize as needed.

`npm install` to install server dependencies.
`docker-compose up` to start the server backend.

If you are on Windows or Mac, make sure the `GRAPHENE_DEV` variable in your `.env` is set to `True`, and share `/var/lib/toil` from docker in file sharing. Otherwise, on linux, set `GRAPHENE_DEV` to `False` and run `docker network connect bridge minio` to connect minio to the default network, followed by `docker inspect minio` to retreive the IP of the container, and finally `echo "the ip" > graphene/src/schema/minioIP.txt` to give graphene the IP.

In the `react` folder, `npm install` for frontend dependencies and then `npm start` to start a React development server.

```bash
git clone https://github.com/suluxan/crescent-frontend.git
cd crescent-frontend
cp sample.env .env
cp react/sample.env react/.env
npm i
docker-compose up -d
# Linux only
# Set GRAPHENE_DEV=False in .env
docker network connect bridge minio
docker inspect minio
# Find the IPAdress under the Network called bridge, not crescent_frontend_default
echo "the ip" > graphene/src/schema/minioIP.txt
# End of Linux only
cd react
npm i
npm start
```

## Deploy to production
Clone this repo.

Copy the SSL certificate files specified in `nginx/conf/default.conf` to `nginx/certs/`.
Copy `sample.env` to `.env` and `react/sample.env` to `react/.env` and customize as needed. The `GRAPHENE_DEV` variable should be set to `False`.

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
docker network connect bridge minio
docker inspect minio
```
Now copy the `IPAddress` under `Networks: bridge` NOT `Networks: crescent_frontend_default` near the bottom. Excluding the quotations.
```
echo "the ip" > graphene/src/schema/minioIP.txt
```
