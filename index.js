'use strict'
const Twit = require('twit');
const Twitter = new Twit(require('./config.js'));
const axios = require('axios');

// Firebase
const admin = require('firebase-admin');
const serviceAccount = require('./KeyFirebase.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

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


function tuitStatus(activos, totales, muertos, recuperados, fecha) {
    let status = "A " + fecha.getDate() + " de " + getMes(fecha.getMonth()) + " de " + fecha.getFullYear() +
        " hay en #CastroUrdiales:\n" + activos + " casos activos\n" + recuperados + " recuperados\n" + muertos + " fallecidos\nEn total: " + totales;

    Twitter.post('statuses/update', { status: status }, function (err, data, response) {
        console.log(data)
    })
}

function subirDatos(activos, totales, muertos, recuperados, fecha) {
    console.log(fecha);

    //Referencia de la coleccion
    let ref = db.collection('datosDia')

    //Solo crear si no hay ninguna ficha de hoy
    ref.where('Fecha', '>=', fecha).get()
        .then(snap => {
            if (snap.empty) {
                console.log("No hay registros de hoy, introduciendo nuevo");
                //generando registro
                let setDia = ref.doc().set({
                    Fecha: fecha,
                    activos: activos,
                    muertos: muertos,
                    totales: totales,
                    recuperados: recuperados
                }).catch(err => {
                    console.log(err);
                })
            } else {
                //! actualizar datos
                console.log("ya hay datos de hoy")
            }
        })
        .catch(err => {
            console.log(err);
        })


}

function leerDatos() {
    let ref = db.collection('datosDia').get()
        .then(snap => {
            snap.forEach(doc => {
                console.log(doc.id, '--', doc.data());
            })
        })
}
////////////////
// Funcion Main
////////////////
async function main() {

    // cada uso espera a que termine el anterior, se puede mejorar
    let activos = await getActivos(castro);
    let totales = await getTotales(castro);
    let muertos = await getMuertos(castro);
    let recuperados = await getAltas(castro);
    let fecha = await getFecha();
    fecha = new Date(fecha);

    let diffActivos;

    subirDatos(activos, totales, muertos, recuperados, fecha);
    //tuitStatus(activos, totales, muertos, recuperados, fecha);
    //leerDatos()
}

// Inicio
main();

// intervalo de repeticion (en ms)
//setInterval(main, 3600000);