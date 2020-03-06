FROM r-base:latest

RUN apt-get update && \
    apt-get install -y libcurl4-openssl-dev libhdf5-dev libssl-dev libxml2-dev \
        imagemagick pdftk-java python3 python3-pip && \
    rm /etc/ImageMagick-6/policy.xml

COPY install-base.R .
RUN Rscript install-base.R

RUN wget https://github.com/lmcinnes/umap/archive/0.4dev.zip \
    && unzip 0.4dev.zip \
    && rm 0.4dev.zip \
    && cd umap-0.4dev \
    && pip3 install -r requirements.txt \
    && python3 setup.py install

