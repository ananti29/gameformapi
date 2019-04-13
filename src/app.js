const express = require('express');
const app = express();
const cors = require('cors');
let GameModel = require('../models/game');
const winston = require('winston');
const expressWinston = require('express-winston');

const port = process.env.PORT || 3001;
const environment = process.env.NODE_ENV || 'development';

// winston request logger
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console(),
        new (winston.transports.File)({
            name: 'request-file',
            filename: './logs/requestapi.log'
        })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: 'HTTP {{req.statusCode}} {{res.responseTime}}ms {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
}));

// set api to use cors for all
app.use(cors({
    origin: 'https://gameform-client-test.herokuapp.com/'
}));

// set api to use JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongodb_conn_module = require('./mongodbConnModule');
let db = mongodb_conn_module.connect();

// GET all Games
app.get('/games', (req, res, next) => {
    GameModel.find().select('-__v')
        .exec((err, listGames) => {
            if (err) { return next(err); }
            // Successful, so render
            res.send(listGames);
        });
});

// POST one game
app.post('/add_game', (req, res, next) => {
    let db = req.db;
    const game = new GameModel({ gamename: req.body.gamename, platform: req.body.platform, notes: req.body.notes });
    game.save(function (err, game) {
        if (err) { return next(err); }
        res.json(game);
    });
});

app.put('/games/:id', (req, res, next) => {
    let db = req.db;
    GameModel.findOneAndUpdate({ _id: req.params.id }, { gamename: req.body.gamename, platform: req.body.platform, notes: req.body.notes }, { new: true }, function (err, game) {
        if (err) { return next(err); }
        res.json(game);
    });
});

// DELETE specific game
app.delete('/games/:id', (req, res, next) => {
    let db = req.db;
    GameModel.remove({
        _id: req.params.id
    }, function (err, post) {
        if (err) { return next(err); }
        res.send({
            success: true
        });
    });
});

// GET specific game
app.get('/game/:id', (req, res, next) => {
    let db = req.db;
    GameModel.findById(req.params.id).select('-__v')
        .exec((err, listGame) => {
            if (err) { return next(err); }
            // Successful, so render
            res.send(listGame);
        });
});

// redirect index to /games
app.use('/', (req, res, next) => {
    res.redirect('/games');
});

// winston error logger
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console(),
        new (winston.transports.File)({
            name: 'error-file',
            filename: './logs/errorapi.log'
        })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    level: 'error',
    json: true
}));

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 505).send('Something broke! The team is hard at work!');
});

// start server
app.listen(port, () => console.log(`API listening on port ${port}! \n` + `API is running on environment ${environment}!`));
