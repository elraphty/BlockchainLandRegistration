const joinPath = require('join-path');
global.JOIN_PATH = require('join-path');

global.APP_CONTROLLERS_PATH =joinPath(APP_ROOT_PATH, 'controllers/');
global.APP_ROUTES_PATH = joinPath(APP_ROOT_PATH, 'routes/');
global.APP_HELPERS_PATH = joinPath(APP_ROOT_PATH, 'helpers/');