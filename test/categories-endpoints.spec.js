const knex = require('knex');
const app = require('../src/app');
const { makeCategoriesArray, makeMaliciousCategory } = require('./categories-fixtures');

describe('Category Endpoints for TipsDeck', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db);
    });

    //delete data from table after test is over
    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db.raw('TRUNCATE tipsdeck_categories, tipsdeck_tips RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE tipsdeck_tips, tipsdeck_categories RESTART IDENTITY CASCADE'));

    //test for unauthorized requests at each endpoint for categories
    describe(`Unauthorized requests`, () => {
        const testCategories = makeCategoriesArray();

        beforeEach('insert category', () => {
            return db.into('tipsdeck_categories').insert(testCategories);
        });

        it(`responds with 401 Unauthorized for GET /api/Category/`, () => {
            return supertest(app)
                .get('/api/Category')
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for POST /api/Category`, () => {
            return supertest(app)
                .post('/api/Category')
                .send({
                    category: 'Another test Category for Post Test Unauthorized'
                })
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for GET /api/Category/:cat_id`, () => {
            const testCat = testCategories[1];
            return supertest(app)
                .get(`/api/Category/${testCat.category}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/Category/:cat_id`, () => {
            const testCat = testCategories[1];
            return supertest(app)
                .delete(`/api/folders/${testCat.category}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for PATCH /api/Category/:cat_id`, () => {
            const testCat = testCategories[1];
            return supertest(app)
                .patch(`/api/folders/${testCat.category}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check the authorized GET Categories Endpoint
    describe(`Authorized requests`, () => {
        describe(`GET all categories /api/Category`, () => {
            context(`Given there are NO categories in database`, () => {
                it(`responds with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/api/Category')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, [])
                });
            });

            context('Given there are categories in the database', () => {
                const testCat = makeCategoriesArray();

                beforeEach('insert categories', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                })

                it('responds with 200 and all of the categories for GET', () => {
                    return supertest(app)
                        .get('/api/Category')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, testCat)
                });
            });

            context(`Given an XSS attack category name`, () => {
                const { maliciousCategory, expectedCategory } = makeMaliciousCategory();

                beforeEach('insert malicious category name', () => {
                    return db.into('tipsdeck_categories').insert(maliciousCategory);
                });

                it('removes XSS attack category name', () => {
                    return supertest(app)
                        .get(`/api/Category`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].category).to.eql(expectedCategory.category);
                        });
                });
            });
        });

        describe(`POST /api/Category`, () => {
            it(`creates a category, responding with 201 and the new category`, () => {
                const newCat = {
                    category: 'Test Category Post'
                }

                return supertest(app)
                    .post('/api/Category')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newCat)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.category).to.eql(newCat.category)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/Category/${newCat.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/Category/${res.body.id}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(res.body)
                    );
            });

            context(`responds with 400 Error for POST /api/Category and posts when name is shorter than 3`, () => {
                return supertest(app)
                    .post('/api/Category')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({
                        category: 'an'
                    })
                    .expect(400, { "error": { message: `Category name must be more than 3 and less than 50 characters.` } });
            });

            //check for missing category
            const requiredFields = ['category'];
            requiredFields.forEach(field => {
                const newCat = {
                    category: 'Test Category Post',
                }

                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newCat[field]

                    return supertest(app)
                        .post('/api/Category')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(newCat)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body` }
                        })
                })
            })

            context('removes XSS attack category name from response', () => {
                const { maliciousCategory, expectedCategory } = makeMaliciousCategory();
                return supertest(app)
                    .post(`/api/Category`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(maliciousCategory)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.category).to.eql(expectedCategory.category);
                    });
                expect(res.body[0].category).to.eql(expectedCategory.category);
            });
        });

        describe(`GET /api/Category/:cat_id`, () => {
            context(`Given no category`, () => {
                it(`responds with 404`, () => {
                    const catId = 123456;
                    return supertest(app)
                        .get(`/api/Category/${catId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, { error: { message: `Category does not exist` } });
                });
            });

            context('Given there are categories in the database', () => {
                const testCat = makeCategoriesArray();

                beforeEach('insert category', () => {
                    return db.into('tipsdeck_categories').insert(testCat);
                });

                it('responds with 200 and the specified category', () => {
                    const catId = 2;
                    const expectedCategory = testCat[catId - 1];
                    return supertest(app)
                        .get(`/api/Category/${catId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, expectedCategory);
                });
            });

            context(`Given an XSS attack folder`, () => {
                const testCat = makeCategoriesArray();
                const { maliciousCategory, expectedCategory } = makeMaliciousCategory();

                beforeEach('insert malicious category', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                        .then(() => {
                            return db.into('tipsdeck_categories').insert([maliciousCategory]);
                        });
                });

                it('removes XSS attack content', () => {
                    return supertest(app)
                        .get(`/api/Category/${maliciousCategory.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.category).to.eql(expectedCategory.category);
                        });
                });
            });
        });

        describe(`DELETE /api/Category/:cat_id`, () => {
            context(`Given no categories`, () => {
                it(`responds with 404`, () => {
                    const catId = 123456
                    return supertest(app)
                        .delete(`/api/Category/${catId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, { error: { message: `Category does not exist` } })
                });
            });
    
            context('Given there are categories in the database', () => {
                const testCat = makeCategoriesArray()
    
                beforeEach('insert categories', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                })
    
                it('responds with 204 and removes the folder', () => {
                    const idToRemove = 2;
                    const expectedCategories = testCat.filter(cat => cat.id !== idToRemove);
                    return supertest(app)
                        .delete(`/api/Category/${idToRemove}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/Category`)
                                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                                .expect(expectedCategories)
                        );
                });
            });
        });

        describe(`PATCH /api/Category/:cat_id`, () => {
            context(`Given no categories`, () => {
                it(`responds with 404`, () => {
                    const catId = 123456;
                    return supertest(app)
                        .patch(`/api/Category/${catId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, { error: { message: `Category does not exist` } })
                });
            });
    
            context('Given there are categories in the database', () => {
                const testCat = makeCategoriesArray()
    
                beforeEach('insert categories', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                })
    
                it('responds with 204 and updates the category', () => {
                    const idToUpdate = 2
                    const updateCategory = {
                        category: 'updated folder title',
                    }
                    const expectedCat = {
                        ...testCat[idToUpdate - 1],
                        ...updateCategory
                    }
                    return supertest(app)
                        .patch(`/api/Category/${idToUpdate}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(updateCategory)
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/Category/${idToUpdate}`)
                                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                                .expect(expectedCat)
                        );
                });

                context('removes XSS attack category name from response', () => {
                    const { maliciousCategory, expectedCategory } = makeMaliciousCategory();
                    const idToUpdate = 2;
                    return supertest(app)
                        .patch(`/api/Category${idToUpdate}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(maliciousCategory)
                        .expect(201)
                        .expect(res => {
                            expect(res.body.category).to.eql(expectedCategory.category);
                        });
                    expect(res.body[0].category).to.eql(expectedCategory.category);
                });
    
                it(`responds with 400 when no required fields are supplied`, () => {
                    const idToUpdate = 2;
                    return supertest(app)
                        .patch(`/api/Category/${idToUpdate}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send({ irrelevantField: 'foo' })
                        .expect(400, {
                            error: {
                                message: `Request body must contain a 'category'`
                            }
                        });
                });
    
                it(`responds with 204 when updating only a subset of fields`, () => {
                    const idToUpdate = 2;
                    const updateCat = {
                        category: 'Updated Category Name',
                    }
                    const expectedCat = {
                        ...testCat[idToUpdate - 1],
                        ...updateCat
                    }
    
                    return supertest(app)
                        .patch(`/api/Category/${idToUpdate}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send({
                            ...updateCat,
                            fieldToIgnore: 'should not be in GET response'
                        })
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/Category/${idToUpdate}`)
                                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                                .expect(expectedCat)
                        );
                });
            });
        });
    });
});