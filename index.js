process.env.AWS_PROFILE = "dev-account";
require('ts-node/register');
const app = require('./src/app');
const parser = new app.ParseResume();
parser.getLines('');