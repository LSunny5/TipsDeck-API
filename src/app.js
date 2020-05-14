require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { CLIENT_ORIGIN } = require('./config') //instead of NODE_ENV
const validateBearerToken = require('./validate-token');
const errorHandler = require('./error-handler');
const morganSetting = process.env.CLIENT_ORIGIN === 'production' ? 'tiny' : 'common'

const app = express();

app.use(morgan(morganSetting));

app.use(helmet());
app.use(cors({orgin: CLIENT_ORIGIN}));
app.use(validateBearerToken);

app.get('/api/*', (req, res) => {
    res.json({ok:true});
})

app.use(errorHandler);

module.exports = app;