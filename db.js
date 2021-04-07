const mongoose = require('mongoose');

const db = {
  connect: () => {
    const url =
      process.env.NODE_ENV === 'production'
        ? `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@db:27017`
        : `mongodb://127.0.0.1:27017`;
    // ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shh5c.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    // connect db
    console.log('connect ', url);
    return new Promise((resolve, reject) => {
      mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DB_NAME,
      });
      const db = mongoose.connection;
      db.on('error', () => {
        console.error.bind(console, 'connection error:');
        reject();
      });
      db.once('open', () => {
        console.log('connected!');
        resolve(db);
      });
    });
  },
};
module.exports = db;
