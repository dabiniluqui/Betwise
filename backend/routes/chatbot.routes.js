const { Router } = require('express');
const { verificarToken } = require('../middlewares/auth.middleware');
const { chat } = require('../controllers/chatbot.controller');

const router = Router();

router.post('/', verificarToken, chat);

module.exports = router;
