# Dockerfile from crossbar docker/disclose example
FROM crossbario/crossbar

# copy over our own node directory from the host into the image
# set user "root" before copy and change owner afterwards
USER root
COPY . /crossbarnode
RUN chown -R crossbar:crossbar /crossbarnode

EXPOSE 4000

ENTRYPOINT ["crossbar", "start", "--cbdir", "/crossbarnode/.crossbar"]
