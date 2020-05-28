const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger');
const CategoriesService = require('./categories-service')
const {getCategoryValidationError} = require('./validate-category');

const categoriesRouter = express.Router()
const jsonParser = express.json()

//check for xss
const serializeCategory = cat => ({
    id: cat.id,
    category: xss(cat.category),
})

//router for Categories page
categoriesRouter
    .route('/')
    .get((req, res, next) => {
        CategoriesService.getAllCategories(
            req.app.get('db')
        )
            .then(categories => {
                res.json(categories.map(serializeCategory))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { category } = req.body
        const newCategory = { category }

        for (const field of ['category']) {
            if (!req.body[field]) {
                logger.error({
                    message: `Missing '${field}' in request body`,
                    request: `${req.originalUrl}`,
                    method: `${req.method}`,
                    ip: `${req.ip}`
                });
                return res.status(400).json({
                    error: { message: `Missing '${field}' in request body` }
                });
            }
        }

        //validate the category
        const error = getCategoryValidationError(newCategory);
        if (error) {
            logger.error({
                message: `POST Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`,
                ip: `${req.ip}`
            });
            return res.status(400).send(error);
        } 

        //post the category
        CategoriesService.insertCategory(
            req.app.get('db'),
            newCategory
        )
            .then(cat => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${cat.cat_id}`))
                    .json(serializeCategory(cat))
            })
            .catch(next)
    })

//routes with category id included
categoriesRouter
    .route('/:cat_id')
    .all((req, res, next) => {
        CategoriesService.getById(
            req.app.get('db'),
            req.params.cat_id
        )
            .then(cat => {
                if (!cat) {
                    return res.status(404).json({
                        error: { message: `Category does not exist` }
                    })
                }
                res.cat = cat;
                next();
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(serializeCategory(res.cat))
    })

    .delete((req, res, next) => {
        CategoriesService.deleteCategory(
            req.app.get('db'),
            req.params.cat_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { category } = req.body
        const catToUpdate = { category }

        const numberOfValues = Object.values(catToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain a 'category'`
                }
            })
        }

        const error = getCategoryValidationError(catToUpdate);
        if (error) {
            logger.error({
                message: `PATCH Validation Error`,
                request: `${req.originalUrl}`,
                method: `${req.method}`,
                ip: `${req.ip}`
            });
            return res.status(400).send(error);
        }

        CategoriesService.updateCategory(
            req.app.get('db'),
            req.params.cat_id,
            catToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    }) 

module.exports = categoriesRouter;