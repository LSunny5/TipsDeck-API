const knex = require('knex');
const app = require('../src/app');
const { makeTipsArray, makeMaliciousTip } = require('./tips-fixtures');
const { makeCategoriesArray } = require('./categories-fixtures');

describe('Tips Endpoints for TipsDeck', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db.raw('TRUNCATE tipsdeck_tips, tipsdeck_categories RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE tipsdeck_tips, tipsdeck_categories RESTART IDENTITY CASCADE'))

    //Check for unauthorized requests to TipsDeck
    describe(`Unauthorized requests to TipsDeck`, () => {
        const testCategories = makeCategoriesArray();
        const testTips = makeTipsArray();

        beforeEach('insert tips', () => {
            return db
                .into('tipsdeck_categories')
                .insert(testCategories)
                .then(() => {
                    return db
                        .into('tipsdeck_tips')
                        .insert(testTips);
                });
        });

        it(`responds with 401 Unauthorized for GET /api/Tips`, () => {
            return supertest(app)
                .get('/api/Tips')
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for POST /api/Tips`, () => {
            return supertest(app)
                .post('/api/Tips')
                .send({
                    category: 2,
                    tipname: 'test tip name for Post endpoint test unauthorized',
                    tipdescription: 'test tip description for post endpoint unauthorized.',
                    directions: 'test tip directions for post endpoint unauthorized.',
                    sourcetitle: 'test tip source Title for post endpoint unauthorized',
                    sourceurl: 'https://www.post.com/test/unauthorized',
                    rating: 3.3,
                    numRaters: 7
                })
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for GET /api/Tips/:tip_id`, () => {
            const tip = testTips[1];
            return supertest(app)
                .get(`/api/Tips/${tip.id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/Tips/:tip_id`, () => {
            const tip = testTips[1];
            return supertest(app)
                .delete(`/api/Tips/${tip.id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for PATCH /api/Tips/:tip_id`, () => {
            const tip = testTips[1];
            return supertest(app)
                .patch(`/api/Tips/${tip.id}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check endpoints of authorized tips
    describe(`Authorized requests to TipsDeck`, () => {
        describe(`GET /api/Tips`, () => {
            context(`Given no tips`, () => {
                it(`responds with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/api/Tips')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, [])
                });
            });

            context('Given there are tips in the database', () => {
                const testCategories = makeCategoriesArray();
                const testTips = makeTipsArray();

                beforeEach('insert tips', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCategories)
                        .then(() => {
                            return db
                                .into('tipsdeck_tips')
                                .insert(testTips);
                        });
                });

                it('responds with 200 and all of the tips', () => {
                    return supertest(app)
                        .get('/api/Tips')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, testTips);
                });
            });

            context(`Given an XSS attack tip entered`, () => {
                const testCategories = makeCategoriesArray();
                const { maliciousTip, expectedTip } = makeMaliciousTip();

                beforeEach('insert malicious tip', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCategories)
                        .then(() => {
                            return db
                                .into('tipsdeck_tips')
                                .insert([maliciousTip]);
                        });
                });

                it('removes XSS attack tip name, description, directions, sourcetitle, and url ', () => {
                    return supertest(app)
                        .get(`/api/Tips`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].tipname).to.eql(expectedTip.tipname);
                            expect(res.body[0].tipdescription).to.eql(expectedTip.tipdescription);
                            expect(res.body[0].directions).to.eql(expectedTip.directions);
                            expect(res.body[0].sourcetitle).to.eql(expectedTip.sourcetitle);
                            expect(res.body[0].sourceurl).to.eql(expectedTip.sourceurl);
                        });
                });
            });
        });

        describe(`POST /api/Tips`, () => {
             context(`creates a tip, responding with 201 and the new tip`, () => {                
                const newTip = {
                    category_id: 1,
                    tipname: 'PostTest1',
                    tipdescription: 'Post Test description 1.',
                    directions: 'These are the directions for post test 1.',
                    sourcetitle: 'Post test 1 source',
                    sourceurl: 'https://www.test.com/posttesttip1',
                    rating: "0.0",
                    numraters: 0,
                }
                return supertest(app)
                    .post('/api/Tips')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newTip)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.category_id).to.eql(newTip.category_id)
                        expect(res.body.tipname).to.eql(newTip.tipname)
                        expect(res.body.tipdescription).to.eql(newTip.tipdescription)
                        expect(res.body.directions).to.eql(newTip.directions)
                        expect(res.body.sourcetitle).to.eql(newTip.sourcetitle)
                        expect(res.body.sourceurl).to.eql(newTip.sourceurl)
                        expect(res.body.rating).to.eql(newTip.rating)
                        expect(res.body.numraters).to.eql(newTip.numraters)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/Tips/${res.body.id}`)
                    })
                    .then(res =>
                        supertest(app)
                            .get(`/api/Tips/${res.body.id}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(res.body)
                    );
            }); 

            const requiredFields = ['category_id', 'tipname', 'tipdescription', 'directions', 'sourcetitle', 'sourceurl', 'rating', 'numraters']
            requiredFields.forEach(field => {
                const newTip = {
                    category_id: 2,
                    tipname: 'PostTest2',
                    tipdescription: 'Post Test description 2.',
                    directions: 'These are the directions for post test 2.',
                    sourcetitle: 'Post test 2 source',
                    sourceurl: 'https://www.test.com/posttesttip2',
                    rating: "0.0",
                    numraters: 0,
                }

                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newTip[field];

                    return supertest(app)
                        .post('/api/Tips')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(newTip)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body` }
                        });
                });
            });

            context('removes XSS attack content from response', () => {
                const { maliciousTip, expectedTip } = makeMaliciousTip()
                return supertest(app)
                    .post(`/api/Tips`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(maliciousTip)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.tipname).to.eql(expectedTip.tipname)
                        expect(res.body.tipdescription).to.eql(expectedTip.tipdescription)
                        expect(res.body.directions).to.eql(expectedTip.directions)
                        expect(res.body.sourcetitle).to.eql(expectedTip.sourcetitle)
                        expect(res.body.sourceurl).to.eql(expectedTip.sourceurl)
                    });
            });
        });

        describe(`GET /api/Tips/:tip_id`, () => {
            context(`Given no tips`, () => {
                it(`responds with 404`, () => {
                    const tipId = 123456
                    return supertest(app)
                        .get(`/api/Tips/${tipId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, { error: { message: `Tip does not exist` } })
                })
            })
    
            context('Given there are tips in the database', () => {
                const testCat = makeCategoriesArray();
                const testTips = makeTipsArray();
    
                beforeEach('insert tips', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                        .then(() => {
                            return db
                                .into('tipsdeck_tips')
                                .insert(testTips);
                        });
                });
    
                it('responds with 200 and the correct tip', () => {
                    const tipId = 2;
                    const expectedTip = testTips[tipId - 1];
                    return supertest(app)
                        .get(`/api/Tips/${tipId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, expectedTip)
                })
            })
    
             context(`Given an XSS attack tip`, () => {
                const testCat = makeCategoriesArray();
                const { maliciousTip, expectedTip } = makeMaliciousTip()
    
                beforeEach('insert malicious tip', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                        .then(() => {
                            return db
                                .into('tipsdeck_tips')
                                .insert([maliciousTip])
                        });
                })
    
                it('removes XSS attack content', () => {
                    return supertest(app)
                        .get(`/api/Tips/${maliciousTip.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.tipname).to.eql(expectedTip.tipname)
                            expect(res.body.tipdescription).to.eql(expectedTip.tipdescription)
                            expect(res.body.directions).to.eql(expectedTip.directions)
                            expect(res.body.sourcetitle).to.eql(expectedTip.sourcetitle)
                            expect(res.body.sourceurl).to.eql(expectedTip.sourceurl)
                        });
                });
            });
        });

        describe(`DELETE /api/Tips/:tip_id`, () => {
            context(`Given no tips`, () => {
                it(`responds with 404`, () => {
                    const tipId = 123456;
                    return supertest(app)
                        .delete(`/api/Tips/${tipId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, { error: { message: `Tip does not exist` } })
                });
            });
    
            context('Given there are tips in the database', () => {
                const testCat = makeCategoriesArray();
                const testTips = makeTipsArray();
    
                beforeEach('insert tips', () => {
                    return db
                        .into('tipsdeck_categories')
                        .insert(testCat)
                        .then(() => {
                            return db
                                .into('tipsdeck_tips')
                                .insert(testTips);
                        });
                });
    
                it('responds with 204 and removes the tip', () => {
                    const idToRemove = 2
                    const expectedTips = testTips.filter(note => note.id !== idToRemove)
                    return supertest(app)
                        .delete(`/api/Tips/${idToRemove}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get(`/api/Tips`)
                                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                                .expect(200, expectedTips)
                        );
                });
            });
        })







    });
});













/*




    



    

    describe(`PATCH /api/Tips/:tip_id`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const tipId = 123456;
                return supertest(app)
                    .patch(`/api/Tips/${tipId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Note doesn't exist` } })
            });
        });

        context('Given there are notes in the database', () => {
            const testCat = makeCategoriesArray();
            const testTips = makeTipsArray();

            beforeEach('insert notes', () => {
                return db
                    .into('tipsdeck_categories')
                    .insert(testCat)
                    .then(() => {
                        return db
                            .into('tipsdeck_tips')
                            .insert(testTips);
                    });
            });

            it('responds with 204 and updates the note', () => {
                const idToUpdate = 2
                const updateNote = {
                    title: 'updated note title',
                    content: 'updated note content',
                    folder_id: 1,
                }
                const expectedTip = {
                    ...testTips[idToUpdate - 1],
                    ...updateNote
                }
                return supertest(app)
                    .patch(`/api/Tips/${idToUpdate}`)
                    .send(updateNote)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/Tips/${idToUpdate}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(200, expectedTip)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/Tips/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(400, {
                        error: {
                            message: `Request body must contain a 'title', 'content', or 'folder_id'`
                        }
                    });
            });

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updateNote = {
                    title: 'updated note title',
                }
                const expectedTip = {
                    ...testTips[idToUpdate - 1],
                    ...updateNote
                }

                return supertest(app)
                    .patch(`/api/Tips/${idToUpdate}`)
                    .send({
                        ...updateNote,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/Tips/${idToUpdate}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(200, expectedTip)
                    );
            });
        });
    });
*/