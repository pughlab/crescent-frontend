crescent-crossbar:
	docker build --rm -t crescent-crossbar -f crossbar/Dockerfile crossbar/
	docker run \
		-u 0 \
		-p 4000:4000 \
		--name crescent-crossbar \
		--rm -it crescent-crossbar

crescent-express:
	npm run server

crescent-client:
	npm run start

crescent-minio:
	docker run \
		-it \
		-p 9000:9000 \
                -e MINIO_ACCESS_KEY=crescent-access \
                -e MINIO_SECRET_KEY=crescent-secret \
		minio/minio server ./express/tmp/minio
