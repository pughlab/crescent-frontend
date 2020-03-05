#!/usr/bin/env Rscript

install.packages(c('Seurat','fmsb','optparse','staplr'))
install.packages('devtools', dependencies=TRUE)
devtools::install_github(repo = 'hhoeflin/hdf5r')
devtools::install_github(repo = 'mojaveazure/loomR', ref = 'develop')
