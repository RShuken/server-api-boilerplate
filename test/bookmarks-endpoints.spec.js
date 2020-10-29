/* eslint-disable strict */
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');




describe.only('Bookmarks Endpoints', function () {
  let db;
  const dbName = 'bookmarks';

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db(dbName).truncate());
    
  afterEach('cleanup', () => db(dbName).truncate());
    
  describe('GET /bookmarks', () => {
    context('Given no bookmarks', () => {
      it('responds with 200 and an empty bookmark', () => {
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get('/bookmarks')
          .expect(200, []);
      });
    });

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into(dbName).insert(testBookmarks);
      });

      it('responds with 200 and all of the bookmarks', () => {
        // eslint-disable-next-line no-undef
        return supertest(app).get('/bookmarks').expect(200, testBookmarks);
      });
    });
  });

  describe('GET /bookmarks/:bookmark_id', () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: 'Boookmark doesn\'t exist' } });
      });
    });



    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into(dbName).insert(testBookmarks);
      });

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(200, expectedBookmark);
      });
    });
  });
});