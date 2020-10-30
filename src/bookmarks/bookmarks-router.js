/* eslint-disable strict */
const express = require('express');
const BookmarkService = require('./bookmark-service');
const xss = require('xss');

const bookmarksRouter = express.Router();
const jsonParser = express.json();

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarkService.getAllBookmarks(knexInstance)
      .then((bookmarks) => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, url, description, rating };
    // loops through the required req.body and generates an error message for each key if the value pair is empty
    for (const [key, value] of Object.entries(newBookmark)) {
      // eslint-disable-next-line eqeqeq
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    BookmarkService.insertBookmark(req.app.get('db'), newBookmark)
      .then((bookmark) => {
        res.status(201).location(`/bookmarks/${bookmark.id}`).json(bookmark);
      })
      .catch(next);
  });

bookmarksRouter.route('/:bookmark_id').get((req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarkService.getById(knexInstance, req.params.bookmark_id)
    .then((bookmark) => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: 'Bookmark doesn\'t exist' },
        });
      }
      res.json({
        id: bookmark.id,
        url: xss(bookmark.url), // sanitize url
        title: xss(bookmark.title), // sanitize title
        description: xss(bookmark.description), // sanitize content
        rating: bookmark.rating,
        date_added: bookmark.date_added,
      });
    })
    .catch(next);
});


module.exports = bookmarksRouter;
