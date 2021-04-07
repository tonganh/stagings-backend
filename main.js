require('dotenv').config();
const port = process.env.PORT || 3000;
const db = require('./db');
const app = require('./app');

app.listen(port, () => {
  console.log(
    `🛠 LOG: 🚀 --> -----------------------------------------------------------------`
  );
  console.log(
    `🛠 LOG: 🚀 --> ~ file: main.js ~ line 7 ~ app.listen ~ process.env`,
    process.env
  );
  console.log(
    `🛠 LOG: 🚀 --> -----------------------------------------------------------------`
  );

  db.connect();
  console.log(`Example app listening at http://localhost:${port}`);
});
