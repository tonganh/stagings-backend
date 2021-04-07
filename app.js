const express = require('express');
const bodyParser = require('body-parser');
const router = new require('./router');
const cors = require('cors');
const authMidUser = require('./middleware/auth');
const authMidAdmin = require('./controllers/admin/middleware/auth');
const Routes = require('./controllers/admin/app/routes');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/static', express.static(path.join(__dirname, 'reports')));

app.use('/api/admin', authMidAdmin.authorize, Routes);
app.use('/api', authMidUser.authorize, router);

module.exports = app;
