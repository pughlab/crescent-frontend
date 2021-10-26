const Minio = require('minio');

module.exports = new Minio.Client({
    endPoint: process.env.NODE_ENV === 'development' ? process.env.MINIO_HOST_NAME_DEV : process.env.MINIO_HOST_NAME_PROD,
    port: parseInt(process.env.MINIO_HOST_PORT),
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});
