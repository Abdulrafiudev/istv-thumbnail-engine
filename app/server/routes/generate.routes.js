'use strict';

const { Router } = require('express');
const { generate, health } = require('../controllers/generate.controller');

const router = Router();

router.post('/generate', generate);
router.get('/health', health);

module.exports = router;
