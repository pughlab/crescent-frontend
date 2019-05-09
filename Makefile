crescent-crossbar:
	docker build --rm -t crescent-crossbar -f crossbar/Dockerfile crossbar/
	docker run \
		-u 0 \
		-p 4000:4000 \
		--name crescent-crossbar \
		--rm -it crescent-crossbar
