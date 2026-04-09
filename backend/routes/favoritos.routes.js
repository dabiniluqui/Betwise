// ============================================================
// routes/favoritos.routes.js — Clase 7: Base de datos
// Todas las rutas de favoritos requieren JWT.
// ============================================================

const { Router } = require('express');
const favoritosController = require('../controllers/favoritos.controller');
const { verificarToken }  = require('../middlewares/auth.middleware');

const router = Router();

// GET    /api/v1/favoritos
router.get('/',    verificarToken, favoritosController.obtener);

// POST   /api/v1/favoritos
router.post('/',   verificarToken, favoritosController.agregar);

// DELETE /api/v1/favoritos/:id
router.delete('/:id', verificarToken, favoritosController.eliminar);

module.exports = router;
