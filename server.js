"use strict"

/*
 * Dependencias
 */
const express = require('express');
const chalk = require('chalk');

const config = require('./config/config');
const app = require('./config/express');		// llamada a la app express creada en otro archivo

/*
 * Inicio de la aplicación y puesta en marcha
 * del servidor app
 */
app.listen(config.port, function (err) {
	if (err) {
		console.error(chalk.red('No se pudo iniciar el servidor'));
		console.log(chalk.red(err));
	} else {
		console.log(chalk.green('Servidor iniciado en el puerto ' + config.port));
	}
});