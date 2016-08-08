"use strict"

/*
* Dependencias
*/
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const SALT_WORK_FACTORY = 10;

// valores para proteger la app de intentos para 
// romper las contraseñas de los usuarios

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 1 * 60 * 60 * 1000; // 1 hora

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true }, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true }, trim: true },
    // roles: [ {type: 'ObjectId', ref: 'RoleSchema'} ],
    role: { type: String, required: true, trim: true },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

    // Propiedades de seguridad
    loginAttempts: { type: Number, require: true, default: 0 },
    lockUntil: { type: Number }
});

UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
})


/*
* Procedimientos
*/
UserSchema.pre('save', function (next) {

    // acutalizar los campos de createt_at & updated_at
    let now = new Date();
    let user = this;

    user.updated_at = now;
    if (!user.created_at) {
        user.created_at = now;
    }

    // solo encripta la password si esta ha sido modificada
    // o es nueva
    if (!user.isModified('password')) {
        return next();
    }

    // generar el salt
    bcrypt.genSalt(SALT_WORK_FACTORY, function (err, salt) {
        if (err) {
            return next(err);
        }

        // encriptar la password con el salt creado
        // user.password = user.password.trim();
        bcrypt.hash(user.password.trim(), salt, function (err, hash) {
            if (err) {
                return next(err);
            }

            // sobreescribir la password ingresada con la
            // password encriptada
            user.password = hash;
            next(user);
        })
    });
});

/*
* Verificación de password
* 
*/
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.methods.incLoginAttempts = function (cb) {
    // si existe un bloqueo anterior y este ya ha expirado
    // eliminarlo y reiniciarlo
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }

    // de otro modo se incrementa los intentos de login
    let updates = { $inc: { loginAttempts: 1 } };

    // bloquear la cuenta si se excede el maximo permitido 
    // de intentos y la cuenta aun no esta bloqueada
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
}

const reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function (username, password, cb) {
    this.findOne({ username: username }, function (err, user) {
        if (err) {
            return cb(err);
        }

        // asegurarse que el usuario exista
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // verificar si la cuenta esta actualmente bloqueada
        if (user.isLocked) {
            // incrementar los intentos si la cuenta ya esta bloqueada
            return user.incLoginAttempts(function (err) {
                if (err) {
                    return cb(err);
                }
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // probar si el password coincide
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                return cb(err);
            }

            // verificar si el password coincide
            if (isMatch) {
                // si no existe bloqueo o intentos fallidos
                // devolver el usuario
                if (!user.loginAttempts && !user.lockUntil) {
                    return cb(null, user);
                }

                // reiniciar conteo de intentos y tiempo de bloqueo
                let updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };

                return user.update(updates, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, user);
                });
            }

            // el password es incorrecto
            user.incLoginAttempts(function (err) {
                if (err) {
                    return cb(err);
                }
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

module.exports = mongoose.model('User', UserSchema);