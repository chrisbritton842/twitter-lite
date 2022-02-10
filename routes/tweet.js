const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const db = require('../db/models');

const { Tweet } = db;

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map(error => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = 'Bad request.';
        return next(err);
    }

    next();
}

const tweetNotFoundError = (id) => {
    const err = new Error(`Tweet ${id} could not be found.`);
    err.title = 'Tweet not found.';
    err.status = 404;
    return err;
};

router.get('/', asyncHandler( async (req, res) => {
    const tweets = await Tweet.findAll();
    res.json({ tweets })
}));

router.get('/:id(\\d+)', asyncHandler( async (req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        res.json({ tweet })
    }

    else {
        next(tweetNotFoundError(tweetId));
    }
}));

const validateTweet = [
    check("message")
        .exists({ checkFalsy: true })
        .withMessage('Type a tweet!'),

    check("message")
        .isLength({ max: 280})
        .withMessage('Whoa, shorten this up!')
];

router.post('/', validateTweet, handleValidationErrors, asyncHandler( async (req, res) => {
    const { message } = req.body;
    const tweet = await Tweet.create({ message });
    res.json({ tweet });
}));

router.put('/:id(\\d+)', validateTweet, handleValidationErrors, asyncHandler( async (req, res, next) => {
    const tweetId = req.params.id;
    const { message } = req.body;
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        // tweet.message = message;
        // await tweet.save();

        const updatedTweet = await Tweet.update({ message });
        res.json({ updatedTweet });
    }

    else {
        next(tweetNotFoundError(tweetId));
    }
}))

module.exports = router;
