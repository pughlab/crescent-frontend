#!/usr/bin/env Rscript

withCallingHandlers(
    install.packages('BiocManager',repos='https://cloud.r-project.org/'),
    warning = stop
)
setRepositories(ind = 1:2)
withCallingHandlers(
    install.packages(c('fmsb','optparse','devtools', 'GSA'),repos='https://cloud.r-project.org/'),
    warning = stop
)
withCallingHandlers(
    devtools::install_version("mnormt", version = "1.5-5", repos = "http://cran.us.r-project.org"),
    warning = stop
)
withCallingHandlers(
    BiocManager::install(c('GSVA', 'qvalue', 'DropletUtils', 'infercnv')), 
    warning = stop
)
withCallingHandlers(
    devtools::install_version("SDMTools", version = "1.1-221.2", repos = "http://cran.us.r-project.org"),
    warning = stop
)
withCallingHandlers(
    devtools::install_github("spatstat/spatstat@v1.64-1"),
    warning = stop
)
withCallingHandlers(
    devtools::install_github("satijalab/seurat@v3.2.1"),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('hhoeflin/hdf5r', 'mojaveazure/loomR@develop')),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('carmonalab/STACAS@1.0.1')),
    warning = stop
)
withCallingHandlers(
    devtools::install_github(c('jmw86069/jamba')),
    warning = stop
)