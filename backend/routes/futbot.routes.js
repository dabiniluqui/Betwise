const { Router } = require('express');
const { verificarToken } = require('../middlewares/auth.middleware');
const { chat } = require('../controllers/futbot.controller');

const router = Router();

router.post('/', verificarToken, chat);

module.exports = router;
