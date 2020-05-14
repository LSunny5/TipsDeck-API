require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config')
const validateBearerToken = require('./validate-token');
const errorHandler = require('./error-handler');
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'

const app = express();

app.use(morgan(morganSetting));

app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

app.get('/api/*', (req, res) => {
    res.json({ok:true});
})

app.use(errorHandler);

module.exports = app;