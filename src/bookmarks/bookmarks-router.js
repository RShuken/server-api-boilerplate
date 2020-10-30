/* eslint-disable strict */
const express = require('express');
const BookmarkService = require('./bookmark-service');

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
      res.json(bookmark);
    })
    .catch(next);
});


module.exports = bookmarksRouter;
