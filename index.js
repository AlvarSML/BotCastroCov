let Twit = require('twit');
let Twitter = new Twit(require('./config.js'));

function main() {
    Twitter.post('statuses/update', { status: 'Hola lucia' }, function (err, data, response) {
        console.log(data)
    })
}

// Inicio
main();

// intervalo de repeticion (en ms)
setInterval(main, 5000);