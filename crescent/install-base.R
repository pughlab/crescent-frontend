#!/usr/bin/env Rscript

withCallingHandlers(
    install.packages('BiocManager'),
    warning = stop
)
setRepositories(ind = 1:2)
withCallingHandlers(
    install.packages(c('Seurat','fmsb','optparse','staplr','devtools')),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('hhoeflin/hdf5r', 'mojaveazure/loomR@develop')),
    warning = stop
)
