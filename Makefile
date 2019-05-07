crescent-crossbar:
	sudo docker build --rm -t crescent-crossbar -f crossbar/Dockerfile crossbar/
	sudo docker run \
		-u 0 \
		-p 4000:4000 \
		--name crescent-crossbar \
		--rm -it crescent-crossbar
