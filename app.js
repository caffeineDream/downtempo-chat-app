const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const verifyToken = require('./middleware/verifyToken');
require('dotenv').config();

/* Authentication routers */
const authRouter = require('./routes/auth/authenticate');
const registerRouter = require('./routes/auth/register');
const logoutRouter = require('./routes/auth/logout');

/* Routers */
const entranceRouter = require('./routes/entrance');
const createRoomRouter = require('./routes/createRoom');
const deleteRoomRouter = require('./routes/deleteRoom');

/* Middleware */
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static('public'));

app.use(verifyToken);


/* Routes */
app.get('/', entranceRouter);
app.post('/register', registerRouter);
app.post('/auth', authRouter);
app.post('/logout', logoutRouter);
app.post('/createRoom', createRoomRouter);
app.post('/deleteRoom', deleteRoomRouter);

/* 404 handler */
app.use((req, res, next) => {
    res.status(404).render('notFound');
});

module.exports = app;