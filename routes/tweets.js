const express = require("express");
const { handle } = require("express/lib/application");
const router = express.Router();
const db = require("../db/models");

const { Tweet } = db;

const asyncHandler = (handler) => (req, res, next) =>
    handler(req, res, next).catch(next);

const tweetNotFoundError = (id) => {
    const err = Error(`Tweet with id of ${id} could not be found.`);
    err.title = "Tweet not found.";
    err.status = 404;
    return err;
}

router.get(
    "/", 
    asyncHandler(async (req, res) => {
        const tweets = await Tweet.findAll();
        res.json({ tweets });
    })
);

router.get(
    "/:id(\\d+)",
    asyncHandler(async (req, res, next) => {
        const tweetId = parseInt(req.params.id, 10);
        const tweet = await Tweet.findByPk(tweetId);
        
        if (tweet) {
            res.json({ tweet });
        } else {
            next(tweetNotFoundError(tweetId))
        }
    })
);

module.exports = router;