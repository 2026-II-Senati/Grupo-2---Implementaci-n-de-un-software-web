'use strict';

const express = require('express');
const controller = require('../controllers/admin.controller');
const authController = require('../controllers/auth.controller');
const wrap = require('../middlewares/async-handler');
const { needAdmin } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/security');

const router = express.Router();

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

router.get('/data', needAdmin, wrap(controller.obtenerDatos));
router.patch('/verify', needAdmin, wrap(controller.verificarPago));
router.get('/export.xlsx', needAdmin, wrap(controller.exportarExcel));

module.exports = router;
