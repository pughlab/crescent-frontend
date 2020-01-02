const Minio = require('minio');

module.exports = new Minio.Client({
    endPoint: 'minio',
    port: parseInt(process.env.MINIO_HOST_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});
