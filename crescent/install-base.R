#!/usr/bin/env Rscript

install.packages(c('Bioconductor','Seurat','fmsb','optparse','staplr','devtools'), dependencies=TRUE)
devtools::install_github(repo = 'hhoeflin/hdf5r')
devtools::install_github(repo = 'mojaveazure/loomR', ref = 'develop')
