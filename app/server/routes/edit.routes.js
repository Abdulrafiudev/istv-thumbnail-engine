'use strict';

const { Router } = require('express');
const { edit } = require('../controllers/edit.controller');

const router = Router();
router.post('/edit', edit);

module.exports = router;
