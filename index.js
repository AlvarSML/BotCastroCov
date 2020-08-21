'use strict'
const Twit = require('twit');
const Twitter = new Twit(require('./config.js'));
const axios = require('axios');
const Dato = require('./objDatos.js');
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
    let anteriores = leerUltimo();
    console.log(anteriores);
    let status = "A " + fecha.getDate() + " de " + getMes(fecha.getMonth()) + " de " + fecha.getFullYear() +
        " hay en #CastroUrdiales:\n" + activos + " casos activos (+" + (anteriores.activos - activos) + ")\n" + recuperados + " recuperados\n" + muertos + " fallecidos\nEn total: " + totales;
    console.log(status);
    Twitter.post('statuses/update', { status: status }, function (err, data, response) {
        console.log(data)
    })
}

function subirDatos(ultimo, actual) {
    //console.log(fecha);
    actual.Fecha.setHours(2, 0, 0);
    //Referencia de la coleccion
    let ref = db.collection('datosDia')

    //Solo crear si no hay ninguna ficha de hoy
    ref.where('Fecha', '>=', actual.Fecha).get()
        .then(snap => {
            if (snap.empty) {
                console.log("No hay registros de hoy, introduciendo nuevo");
                //generando registro
                let setDia = ref.doc().set({
                    Fecha: actual.Fecha,
                    activos: actual.activos,
                    muertos: actual.muertos,
                    totales: actual.totales,
                    recuperados: actual.recuperados
                }).catch(err => {
                    console.log(err);
                })
                // al haber nuevos datos, estos se tuitean
                tuitStatus(actual,ultimo);
            } else {
                //! actualizar datos
                //! solo se actualiza una vez al dia
                console.log("ya hay datos de hoy")
            }
        })
        .catch(err => {
            console.log(err);
        })


}

async function leerUltimo() {

    let snap = await db.collection('datosDia').orderBy('Fecha', 'desc').limit(1).get();
    let ultimo = new Dato();

    if (!snap.empty) {
        snap.forEach(doc => {
            ultimo.Fecha = doc.data().Fecha;
            ultimo.totales = doc.data().totales;
            ultimo.activos = doc.data().activos;
            ultimo.muertos = doc.data().muertos;
            ultimo.recuperados = doc.data().recuperados;
        })

        return ultimo;
    }
}
////////////////
// Funcion Main
////////////////
async function main() {

    // cada uso espera a que termine el anterior, se puede mejorar
    //leerUltimo().then(datos => console.log(datos));


    let activos = await getActivos(castro);
    let totales = await getTotales(castro);
    let muertos = await getMuertos(castro);
    let recuperados = await getAltas(castro);
    let fecha = await getFecha();
    fecha = new Date(fecha);

    //let diffActivos;
    let ultimo = await leerUltimo();
    let actual = new Dato(activos,muertos,recuperados,totales,fecha);

    console.log(ultimo);
    console.log(actual);

    subirDatos(activos, totales, muertos, recuperados, fecha);

    //leerDatosAyer(fecha,activos,totales);
}

// Inicio
main();

// intervalo de repeticion (en ms)
setInterval(main, 3600000);