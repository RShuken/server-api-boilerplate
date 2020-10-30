'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
//const ArticlesService = require('./articles-service');
const BookmarkService = require('./bookmark-service');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

// standard middleware
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());


// routes

app.get('/bookmarks', (req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarkService.getAllBookmarks(knexInstance)
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});

app.get('/bookmarks/:bookmark_id', (req, res, next) => {
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




// these are for the articles 
// app.get('/articles', (req, res, next) => {
//   const knexInstance = req.app.get('db');
//   ArticlesService.getAllArticles(knexInstance)
//     .then((articles) => {
//       res.json(articles);
//     })
//     .catch(next);
// });

// app.get('/articles/:article_id', (req, res, next) => {
//   const knexInstance = req.app.get('db');
//   ArticlesService.getById(knexInstance, req.params.article_id)
//     .then(article => {
//       if (!article) {
//         return res.status(404).json({
//           error: { message: 'Article doesn\'t exist' }
//         });
//       }
//       res.json(article);
//     })
//     .catch(next);
// });

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// error handlers
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error, internal error please submit a bug report' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});


module.exports = app;
