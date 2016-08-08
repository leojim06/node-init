'use strict'

const auth = require('../../config/auth');
const requireRole = require('../middlewares/requireRole');

module.exports = function (app) {

    let path = '/api/v1';

    app.get(path + '/estudiante', requireRole('estudiante'), function (req, res, next) {
        res.status(200).json({ mesage: 'Envio de página de inicio del estudiante', err: 'Todo OK' });
    });

    app.get(path + '/docente', requireRole('docente'), function (req, res, next) {
        console.log(req.body);
        res.status(200).json({ mesage: 'Envio de página de inicio del docente', err: 'Todo OK' });
    });

    app.post('/login', auth.login);

    app.use(path + '/users', require('./users'));

}