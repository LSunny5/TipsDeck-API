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
    tipname: xss(tip.tipname),
    tipdescription: xss(tip.tipdescription),
    directions: xss(tip.directions),
    sourcetitle: xss(tip.sourcetitle),
    sourceurl: xss(tip.sourceurl),
    rating: tip.rating,
    numraters: tip.numraters,
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
        const { category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating, numraters } = req.body
        const newTip = { category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating, numraters }

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

tipsRouter 
    .route('/:tip_id')
    .all((req, res, next) => {
        TipsService.getById(
            req.app.get('db'),
            req.params.tip_id
        )
            .then(tip => {
                if (!tip) {
                    return res.status(404).json({
                        error: { message: `Tip does not exist` }
                    })
                }
                res.tip = tip
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeTip(res.tip))
    })

    .delete((req, res, next) => {
        TipsService.deleteTip(
            req.app.get('db'),
            req.params.tip_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    
    .patch(jsonParser, (req, res, next) => {
        const { category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating, numraters } = req.body
        const tipToUpdate = { category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating, numraters }

        const numberOfValues = Object.values(tipToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain category_id, tipname, tipdescription, directions, sourcetitle, sourceurl, rating or numraters`
                }
            });
        }

        const error = getTipValidationError(tipToUpdate);
        if (error) {
            logger.error({
                message: `PATCH Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`,
                ip: `${req.ip}`
            });
            return res.status(400).send(error);
        }

        TipsService.updateTip(
            req.app.get('db'),
            req.params.tip_id,
            tipToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    }) 

module.exports = tipsRouter;