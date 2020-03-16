#!/usr/bin/env Rscript

withCallingHandlers(
    install.packages('BiocManager'),
    warning = stop
)
setRepositories(ind = 1:2)
withCallingHandlers(
    install.packages(c('fmsb','optparse','staplr','devtools')),
    warning = stop
)
withCallingHandlers(
    devtools::install_version('Seurat', version = '3.1.1'),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('hhoeflin/hdf5r', 'mojaveazure/loomR@develop')),
    warning = stop
)
