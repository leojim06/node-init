"use strict"

const jwt = require('jwt-simple');
const config = require('../../config/config');

// Modificar el req.user para validar la información que
// se guardó en el token (recuperar token, decodificarlo, 
// comparar el role y permitir o denegar acceso)
function requireRole(role) {
    return function (req, res, next) {

        let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
        let key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

        if (token || key) {
            try {
                let decoded = jwt.decode(token, config.secret);

                // Tiempo de token expirado
                if (decoded.exp <= Date.now()) {
                    res.status(401).send("El token expiró");
                    return;
                }

                // Verificando información del token
                if (decoded.role === role) {
                    next()
                } else {
                    res.status(403).send("No autorizado :(");
                }
            } catch (err) {
                res.status(500).send("Oops... algo salió mal");
            }
        } else {
            res.status(401).send("Token o key invalidos");
            return;
        }
    };
};

module.exports = requireRole;