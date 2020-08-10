let Twit = require('twit');
let Twitter = new Twit(require('./config.js'));

/**
 * Retweets a tweet passed into the function.
 * @param {*} tweet
 */
function retweet(tweet) {
    Twitter.post(
        'statuses/retweet/:id',
        { id: tweet.id_str },
        function (err, data, response) {
            // do something
        });
}