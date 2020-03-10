#!/usr/bin/env Rscript

withCallingHandlers(
    install.packages('Bioconductor', dependencies=TRUE),
    warning = stop
)
setRepositories(ind = 1:2)
withCallingHandlers(
    install.packages(c('Seurat','fmsb','optparse','staplr','devtools'), dependencies=TRUE),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('hhoeflin/hdf5r', 'mojaveazure/loomR@develop'),
    warning = stop
)
