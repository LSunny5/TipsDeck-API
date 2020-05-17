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

    
    
    /*
    //Check for unauthorized requests to TipsDeck
    describe(`Unauthorized requests`, () => {
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

        it(`responds with 401 Unauthorized for GET /api/tips`, () => {
            return supertest(app)
                .get('/api/tips')
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for POST /api/tips`, () => {
            return supertest(app)
                .post('/api/tips')
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

        it(`responds with 401 Unauthorized for GET /api/tips/:tip_id`, () => {
            const tip = testTips[1];
            return supertest(app)
                .get(`/api/tips/${tip.id}`)
                .expect(401, { error: 'Unauthorized request' });
        });

        it(`responds with 401 Unauthorized for DELETE /api/tips/:tip_id`, () => {
            const tip = testTips[1];
            return supertest(app)
                .delete(`/api/tips/${tip.id}`)
                .expect(401, { error: 'Unauthorized request' });
        });
    });

    //check endpoints of authorized tips
    describe(`GET /api/tips`, () => {
        context(`Given no tips`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/tips')
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
                    .get('/api/tips')
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
                    .get(`/api/tips`)
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
    }); */
});






