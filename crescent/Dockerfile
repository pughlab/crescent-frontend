FROM r-base:4.0.2

RUN apt-get update && \
    apt-get install -y libcurl4-openssl-dev libhdf5-dev libssl-dev libxml2-dev libgit2-dev jags python3

COPY install-base.R .
RUN Rscript install-base.R

# RUN wget https://github.com/lmcinnes/umap/archive/0.4dev.zip \
#     && unzip 0.4dev.zip \
#     && rm 0.4dev.zip \
#     && cd umap-0.4dev \
#     && pip3 install -r requirements.txt \
#     && python3 setup.py install
