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
    devtools::install_version("SDMTools", version = "1.1-221.2", repos = "http://cran.us.r-project.org"),
    warning = stop
)
withCallingHandlers(
    devtools::install_github("satijalab/seurat@v3.1.1"),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('hhoeflin/hdf5r', 'mojaveazure/loomR@develop')),
    warning = stop
)
