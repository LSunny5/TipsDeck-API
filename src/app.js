require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config')

//const { CLIENT_ORIGIN } = require('./config') //instead of NODE_ENV
const validateBearerToken = require('./validate-token');
const errorHandler = require('./error-handler');

const categoriesRouter = require('../categories/categories-router');
const tipsRouter = require('../tips/tips-router');

const app = express();

//const morganSetting = process.env.CLENT_ORIGIN === 'production' ? 'tiny' : 'common';
//app.use(morgan(morganSetting));

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', { skip: () => NODE_ENV === 'test' }))
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

//app.use(cors({origin: CLIENT_ORIGIN}));

app.get('/api', (req, res) => {
    res.json({ok:true});
})

app.use('/api/Category', categoriesRouter);
app.use('/api/Tips', tipsRouter);

app.use(errorHandler);

module.exports = app;

