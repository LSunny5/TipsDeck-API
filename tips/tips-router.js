const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../src/logger');
const TipsService = require('./tips-service')
const { getTipValidationError } = require('./validate-tips');

const tipsRouter = express.Router()
const jsonParser = express.json()

const serializeTip = tip => ({
    id: tip.id,
    category_id: tip.category_id,
    tipname: xss(tip.content),
    tipdescription: xss(tip.tipdescription),
    directions: xss(tip.directions),
    sourcetitle: xss(tip.sourcetitle),
    sourceurl: xss(tip.sourceurl),
    rating: tip.rating,
    numRaters: tip.numRaters,
});

tipsRouter 
    .route('/')
    .get((req, res, next) => {
        TipsService.getAllTips(
            req.app.get('db')
        )
            .then(tips => {
                res.json(tips.map(serializeTip))
            })
            .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating, numRaters } = req.body
        const newTip = { category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating, numRaters }

        for (const [key, value] of Object.entries(newTip)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }

		const error = getTipValidationError(newTip);
		if (error) {
			logger.error({
				message: `POST Validation Error`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
                ip: `${req.ip}`
			});
			return res.status(400).send(error);
		}

        TipsService.insertTip(
            req.app.get('db'),
            newTip
        )
            .then(tip => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${tip.id}`))
                    .json(serializeTip(tip))
            })
            .catch(next)
    })








module.exports = tipsRouter;