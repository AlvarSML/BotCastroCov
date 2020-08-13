'use strict'
const Twit = require('twit');
const Twitter = new Twit(require('./config.js'));
const axios = require('axios');

// anteriores
let antMuertos, antTotales, antRecuperados, antActivos;

// buscar id por si cambian
const castro = 19, laredo = 34, santander = 74, guriezo = 29, liendo = 35;

function getActivos(localidad) {
    return axios.get("https://covid19can-data.firebaseio.com/saludcantabria/mun-actives.json")
        .then(resp => {
            return resp.data.value[localidad];
        })

}

function getMuertos(localidad) {
    return axios.get("https://covid19can-data.firebaseio.com/saludcantabria/mun-deceased.json")
        .then(resp => {
            return resp.data.value[localidad];
        })

}

function getTotales(localidad) {
    return axios.get("https://covid19can-data.firebaseio.com/saludcantabria/mun-cases.json")
        .then(resp => {
            return resp.data.value[localidad];
        })

}

function getAltas(localidad) {
    return axios.get("https://covid19can-data.firebaseio.com/saludcantabria/mun-discharged.json")
        .then(resp => {
            return resp.data.value[localidad];
        })

}

function getFecha() {
    return axios.get("https://covid19can-data.firebaseio.com/saludcantabria/mun-actives.json")
        .then(resp => {
            return resp.data.updated;
        })
}

function getMes(mes) {
    switch (mes) {
        case 0:
            return "enero";
        case 1:
            return "febrero";
        case 2:
            return "marzo";
        case 3:
            return "abril";
        case 4:
            return "mayo";
        case 5:
            return "junio";
        case 6:
            return "julio";
        case 7:
            return "agosto";
        case 8:
            return "septiembre";
        case 9:
            return "octubre";
        case 10:
            return "noviembre";
        case 11:
            return "diciembre";
    }
}

async function main() {

    // cada uso espera a que termine el anterior, se puede mejorar
    let activos = await getActivos(castro);
    let totales = await getTotales(castro);
    let muertos = await getMuertos(castro);
    let recuperados = await getAltas(castro);
    let fecha = await getFecha();
    fecha = new Date(fecha);

    let diffActivos;
    // console.log(activos, totales, muertos, recuperados)

    let status = "A " + fecha.getDate() + " de " + getMes(fecha.getMonth()) + " de " + fecha.getFullYear() + 
        " hay en #CastroUrdiales:\n"+activos+" casos activos\n"+recuperados+" recuperados\n"+muertos+" fallecidos\nEn total: "+totales;
    //console.log(status);
    if (antActivos != undefined) {

    }

    Twitter.post('statuses/update', { status: status }, function (err, data, response) {
        console.log(data)
    })

    antActivos = activos;
    antMuertos = muertos;
    antRecuperados = recuperados;
    antTotales = totales

}

// Inicio
main();

// intervalo de repeticion (en ms)
setInterval(main, 3600000);