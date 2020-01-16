FROM ubuntu:19.04

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get install -y \
            wget \
            curl \ 
            gcc \
            pdftk-java \
            g++ \
            make \
            libssl-dev \ 
            libcurl4-openssl-dev \
            libhdf5-dev \
            git \
            vim \
            r-base \ 
            openjdk-8-jre

# Seurat
RUN Rscript -e "install.packages('Seurat')"
RUN Rscript -e "install.packages('fmsb')"
RUN Rscript -e "install.packages('optparse')"
RUN Rscript -e "install.packages('staplr')"


# cellranger
#RUN wget -O cellranger-3.1.0.tar.gz "http://cf.10xgenomics.com/releases/cell-exp/cellranger-3.1.0.tar.gz?Expires=1573889510&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cDovL2NmLjEweGdlbm9taWNzLmNvbS9yZWxlYXNlcy9jZWxsLWV4cC9jZWxscmFuZ2VyLTMuMS4wLnRhci5neiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTU3Mzg4OTUxMH19fV19&Signature=QLEcdq7gQhKtp~HHPr8UL6PVG3sWotJSu8Wy08f0DW0mgp5uk8ea6rJd1d3ENzt0O0BySZ0LRAPUEyppPTP1JOLPibxzlRkDk9uufJDNDvzQrCHIXr3Mp8uXD6VMd3PLMHfCref28jOhWGWtRN92gtoF2ERAiV9nEK45BK5p1lo8rmvus96Njzmp8RQOWJnEILmO4pD~t-nILphKCsTOn6f8-YwUBk0aHbcb6f4CQ0zgYKeJKTRASkwhHKt1ooxVGIohBn~P8b9ShhrPu6M3ecGNXK1E86o0wAnFNFk4tOKtVeo79MH~BXO95f1yzVkxNrt49CeC3wzG2NMicrHzkg__&Key-Pair-Id=APKAI7S6A5RYOXBWRPDA"

#RUN apt-get install -y bsdtar \
#    && cp $(which tar) $(which tar)~ \
#    && ln -sf $(which bsdtar) $(which tar)
 
#RUN tar -xzvf cellranger-3.1.0.tar.gz \
#    && mv $(which tar)~ $(which tar) \
#    && rm cellranger-3.1.0.tar.gz

#ENV PATH="cellranger-3.1.0:${PATH}"

#RUN wget http://cf.10xgenomics.com/supp/cell-exp/refdata-cellranger-GRCh38-3.0.0.tar.gz
#RUN tar -xzvf refdata-cellranger-GRCh38-3.0.0.tar.gz

# inflection point
#RUN wget https://github.com/broadinstitute/Drop-seq/releases/download/v2.3.0/Drop-seq_tools-2.3.0.zip \
#    && unzip Drop-seq_tools-2.3.0.zip \
#    && rm Drop-seq_tools-2.3.0.zip \
#    && cp -R /Drop-seq_tools-2.3.0/jar /usr/bin \
#    && cp /Drop-seq_tools-2.3.0/BamTagHistogram /usr/bin

#RUN Rscript -e "install.packages('BiocManager')" \
#    && Rscript -e 'BiocManager::install("SingleCellExperiment")' \
#    && Rscript -e 'BiocManager::install("SummarizedExperiment")' \
#    && Rscript -e 'BiocManager::install("GenomicRanges")' \
#    && Rscript -e 'BiocManager::install("IRanges")' \
#    && Rscript -e 'BiocManager::install("S4Vectors")' \
#    && Rscript -e 'BiocManager::install("GenomeInfoDb")' \
#    && Rscript -e 'BiocManager::install("XVector")' 

#    && Rscript -e 'BiocManager::install("DropletUtils")'

#RUN Rscript -e "install.packages('devtools')" \
#    && Rscript -e 'devtools::install_github("rajewsky-lab/dropbead")'

#RUN Rscript -e "install.packages('Matrix')"


#RUN Rscript -e "install.packages("/DropletUtils_1.4.2.tar.gz", repos = NULL, type="source")
#RUN Rscript -e 'BiocManager::install("edgeR")' \ 
#    && Rscript -e 'BiocManager::install("rhdf5")' \
#    && Rscript -e 'BiocManager::install("HDF5Array")' \
#    && Rscript -e 'BiocManager::install("dqrng")' \
#    && Rscript -e 'BiocManager::install("beachmat")' \
#    && Rscript -e 'BiocManager::install("Rhdf5lib")' 

#RUN wget https://bioconductor.org/packages/release/bioc/src/contrib/DropletUtils_1.4.2.tar.gz 
#RUN R CMD INSTALL DropletUtils_1.4.2.tar.gz
RUN Rscript -e "install.packages('devtools')" 
RUN Rscript -e 'devtools::install_github("LTLA/beachmat")'
RUN Rscript -e 'devtools::install_github("MarioniLab/DropletUtils")'

#RUN pip install umap-learn

RUN apt-get update && \
    apt-get install -y \
            python3 \
            python3-pip \
            imagemagick 

RUN rm /etc/ImageMagick-6/policy.xml

RUN wget https://github.com/lmcinnes/umap/archive/0.4dev.zip \
    && unzip 0.4dev.zip \
    && rm 0.4dev.zip \
    && cd umap-0.4dev \
    && pip3 install -r requirements.txt \
    && python3 setup.py install

#RUN pip install toil[cwl]
#RUN cp -r /usr/local/lib/python2.7/dist-packages/backports/ssl_match_hostname/ /usr/lib/python2.7/dist-packages/backports
RUN apt-get update && \
    apt-get install -y \
            libxml2-dev 

RUN Rscript -e "install.packages('devtools', dependencies=TRUE)" \
    && Rscript -e 'devtools::install_github(repo = "hhoeflin/hdf5r")' \
    && Rscript -e 'devtools::install_github(repo = "mojaveazure/loomR", ref = "develop")'

