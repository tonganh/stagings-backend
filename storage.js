const accessKey = process.env.MINIO_ACCESS_KEY;
const secretKey = process.env.MINIO_ACCESS_SECERETKEY;
const Minio = require('minio');
class StorageMinio {
  constructor() {
    this.minioClient = null;
  }
  createStorage() {
    if (this.minioClient === null) {
      this.minioClient = new Minio.Client({
        endPoint: process.env.MINIO_URL,
        // port: 9000,
        useSSL: true,
        accessKey: accessKey,
        secretKey: secretKey,
      });
    }
  }
  get storage() {
    this.createStorage();
    return this.minioClient;
  }
}
module.exports = StorageMinio;
