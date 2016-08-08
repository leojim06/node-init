'use strict'
/*
 * Dependencias
 */
const express = require('express');
const morgan = require('morgan');
const chalk = require('chalk');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const path = require('path');

const config = require('./config');

/*
 *Creación de la app con middleware de express
*/
const app = express();

/*
 *Agrega la función de log si el entorno es de desarrollo
*/
if (app.get('env') === 'development') {
    app.use(morgan('dev'));
    console.log(chalk.green('Iniciando express'));
}

app.use(cors());

app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({ extended: true }));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // permite a bodyParser to analizar texto raw
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));  // parse application/vnd.api+json as json
app.use(methodOverride());

/*
 *Establecer la ruta de los archivos estaticos para ser
 *servidos por express
*/
// app.use(express.static(path.join(__dirname, '../public')));

/*
 * Conección de la base de datos.
 */
const db = mongoose.connect(config.db, function (err) {
    if (err) {
        console.error(chalk.red('No se pudo conectar a la base de datos'));
        console.log(chalk.red(err));
        console.log(chalk.red(config.db));
    } else {
        console.log(chalk.green('Conección a mongo exitosa'));
    }
});

/*
 * Establecer las rutas de la aplicación 
 * desde el archivo global index.js, en el que se
 * configuran las rutas de la aplicación
 */
require('../app/routes')(app);

/*
 * Middleware de error al no encontrar la ruta especificada
 * Si existe alguna ruta que no ha sido creada,
 * entonces se envía el error
 */
app.use(function (req, res, next) {
    var err = new Error('No se encontró');
    err.status = 404;
    next(err);
});

/*
 * Middleware de error para todas las demás 
 * excepciones
 */
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res
            .status(err.status || 500)
            .json({
                message: err.mesage,
                error: err
            });
    });
}

module.exports = app;