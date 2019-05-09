const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const joinPath = require('join-path');
const appRoot = require('app-root-path').path;
require('dotenv').config();

const PORT = process.argv[2];

const app = express();

global.MAIN_ROOT_PATH = joinPath(appRoot, '/');
global.APP_ROOT_PATH = joinPath(MAIN_ROOT_PATH, 'app/');
global.APP_CONFIG_PATH = joinPath(APP_ROOT_PATH, 'config/');

require(`${APP_CONFIG_PATH}globalRootPath`);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', require(`${APP_ROUTES_PATH}index`));

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});