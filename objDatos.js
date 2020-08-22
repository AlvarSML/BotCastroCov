"use strict";

module.exports = class Dato{
    constructor(activos,muertos,recuperados,totales,fecha) {
        this.activos = activos;
        this.muertos = muertos;
        this.recuperados = recuperados;
        this.totales = totales;
        this.Fecha = fecha;
    }

}