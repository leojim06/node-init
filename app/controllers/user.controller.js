"use strict"

/*
 * Dependencias
 */
const User = require('../models/user.js');

const users = {
    getAll: function (req, res) {
        User.find(function (err, users) {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(200).json(users);
        });
    },

    getOne: function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                return res.status(500).send(err);
            }
            if (!user) {
                return res.status(404).send(err);
            }
            res.status(200).json(user);
        });
    },

    create: function (req, res) {
        let user = new User(req.body);
        user.save(function (err) {
            if (err) {
                if (err.name === 'ValidationError') {
                    return res.status(400).send(err);
                } else {
                    return res.status(500).send(err);
                }
            }
            res.status(201).json({ message: 'User registrado', user });
        });
    },

    update: function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                return res.send(404).send(err);
            }
            for (const prop in req.body) {
                user[prop] = req.body[prop];
            }
            user.save(function (err) {
                if (err) {
                    if (err.name === 'ValidationError') {
                        return res.status(400).send(err);
                    } else {
                        return res.status(500).send(err);
                    }
                }
                res.status(200).json({ message: 'User acutalizado', user });
            })
        });
    },

    delete: function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (!user) {
                return res.status(404).send(err);
            }
            user.remove(function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                res.status(200).json({ message: 'User eliminado', user });
            })
        })
    }
};

module.exports = users;