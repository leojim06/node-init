"use strict"

const requireRole = require('../middlewares/requireRole');
const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.controller');

router
    .get('/', userCtrl.getAll)
    .get('/:id', userCtrl.getOne)
    .post('/', userCtrl.create)
    .put('/:id', requireRole('user'), userCtrl.update)
    .delete('/:id', requireRole('user'), userCtrl.delete);

// experimento de autenticación según codigo en hoja
// router.all('/', requireRole('user'));

module.exports = router;