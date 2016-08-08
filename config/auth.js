"use strict"

const jwt = require('jwt-simple');
const User = require('../app/models/user');

const auth = {

    login: function (req, res) {

        let username = req.body.username || '';
        let password = req.body.password || '';

        if (username === '' || password === '') {
            res.status(400).json({
                "message": "Usuario o contraseña incorrecta"
            });
        }

        User.getAuthenticated(username, password, function (err, user, reason) {
            if (err) {
                res.status(500).json({
                    'error': 'Error del sistema',
                    'message': 'Usuario o contraseña incorrecta'
                });
            }

            if (user) {
                res.status(200).json(genToken(user));
            }

            let reasons = User.failedLogin;
            switch (reason) {
                case reasons.NOT_FOUND:
                    res.status(404).json({
                        "error": "Usuario no encontrado",
                        "message": "Usuario o contraseña incorrecta"
                    });
                    break;
                case reasons.PASSWORD_INCORRECT:
                    res.status(400).json({
                        "error": "Contraseña incorrecta",
                        "message": "Usuario o contraseña incorrecta"
                    });
                    break;
                case reasons.MAX_ATTEMPTS:
                    res.status(401).json({
                        "error": "Cuenta bloqueda por maximo de intentos permitidos",
                        "message": "Usuario o contraseña incorrecta"
                    });
                    break;
            }
        });
    },

    validate: function (username, password) {
        console.log('Validando usuario y contraseña');
        User.getAuthenticated(username, password, function (err, user, reason) {
            console.log(user.username);
            if (err) {
                return {
                    error: err
                }
            }

            if (user) {
                console.log('Retornando info del user');
                let obj = {
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
                return obj;
            }

            return {
                reason: reason,
                error: "No se pudo ingresar"
            }

        });
    },

    validateUser: function (username) {
        // funcion que valida la existencia del usuario
        // despues de que se ha decifrado el token 
        // y para comprobar si el rol es el correcto
        // Esta funcion debe devolver un objeto usuario
        // de la base de datos para comparar su rol 
        // en ontra parte del código
    }
};

function genToken(user) {
    let expires = expiresIn(1); // 1 día (segun la funcion)
    let config = require('./config');
    let token = jwt.encode({
        exp: expires,
        usermane: user.username,
        email: user.email,
        role: user.role
    }, config.secret);

    return {
        token: token,
        expires: expires,
        user: user.email,
        role: user.role
    };
}

function expiresIn(numDays) {
    let dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;