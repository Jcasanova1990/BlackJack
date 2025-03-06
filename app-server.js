const express = require('express');
const path = require('path');
const logger = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(logger('dev'));

// === Serve Static Files ===
// Serve the React build (your Vite app)
app.use(express.static(path.join(__dirname, 'public', 'dist')));

// Serve images and sounds directly from 'public'
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/sounds', express.static(path.join(__dirname, 'public', 'sounds')));

// === React Catch-All (for SPA navigation like /about, /game, etc.) ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});

module.exports = app;
