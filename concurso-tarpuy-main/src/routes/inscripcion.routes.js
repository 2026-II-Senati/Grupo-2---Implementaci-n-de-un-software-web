'use strict';

const express = require('express');
const controller = require('../controllers/inscripcion.controller');
const wrap = require('../middlewares/async-handler');
const { writeLimiter } = require('../middlewares/security');

const router = express.Router();

router.post('/fichas', writeLimiter, wrap(controller.crearFicha));
router.post('/libres', writeLimiter, wrap(controller.crearLibre));

module.exports = router;
