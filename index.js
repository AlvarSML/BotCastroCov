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

function getSimbolo(n) {
    return (n > 0)?'+':'';
}


function tuitStatus(actual, ultimo) {

    let diffAct = actual.activos - ultimo.activos;
    let diffRec = actual.recuperados - ultimo.recuperados;
    let diffMuer = actual.muertos - ultimo.muertos;
    let diffTot = actual.totales - ultimo.totales;

    let status = "A " + actual.Fecha.getDate() + " de " + getMes(actual.Fecha.getMonth()) + " de " + actual.Fecha.getFullYear() +
        " hay en #CastroUrdiales:\n" + 
        actual.activos + " casos activos ("+getSimbolo(diffAct)+ ""+ diffAct + ")\n" +
        actual.recuperados + " recuperados ("+getSimbolo(diffRec)+ ""+ diffRec + ")\n" +
        actual.muertos + " fallecidos ("+getSimbolo(diffMuer)+ ""+ diffMuer + ")\n" +
        "En total: " + actual.totales + "("+getSimbolo(diffTot)+ ""+ diffTot + ")\n";
    console.log(status);
    Twitter.post('statuses/update', { status: status }, function (err, data, response) {
        console.log(data)
    })
}

async function subirDatos(ultimo, actual) {
    //console.log(fecha);
    actual.Fecha.setHours(2, 0, 0);

    // Si los datos son nuevos se sube un tuit
    let esUltimo;

    //Solo crear si no hay ninguna ficha de hoy
    let snap = await db.collection('datosDia').where('Fecha', '>=', actual.Fecha).get()
    
    if (snap.empty) {
        console.log("No hay registros de hoy, introduciendo nuevo");
        //generando registro
        db.collection('datosDia').doc().set({
            Fecha: actual.Fecha,
            activos: actual.activos,
            muertos: actual.muertos,
            totales: actual.totales,
            recuperados: actual.recuperados
        }).catch(err => {
            console.log(err);
        })
        // al haber nuevos datos, estos se tuitean
        esUltimo = true;
        tuitStatus(actual, ultimo);
    } else {
        esUltimo = false;
        //! actualizar datos
        //! solo se actualiza una vez al dia
        console.log("ya hay datos de hoy")
    }

    return esUltimo;
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
    let arrActual = await Promise.all([getActivos(castro), getTotales(castro), getMuertos(castro), getAltas(castro), getFecha(castro)]);
    let ultimo = await leerUltimo();
    let actual = new Dato(arrActual[0], arrActual[2], arrActual[3], arrActual[1], new Date(arrActual[4]));

    console.log(ultimo);
    console.log(actual);

    subirDatos(ultimo, actual);

    //leerDatosAyer(fecha,activos,totales);
}

// Inicio
main();

// intervalo de repeticion (en ms)
setInterval(main, 3600000);