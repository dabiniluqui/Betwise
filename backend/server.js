// ============================================================
// server.js — Entry point de BetWise Argentina
// Inicializa Express, Socket.io y monta todas las rutas
// ============================================================

require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const YAML       = require('yamljs');
const swaggerUi  = require('swagger-ui-express');

const { validarEnv }       = require('./config/env');
const router               = require('./routes/index');
const errorMiddleware       = require('./middlewares/error.middleware');
const { iniciarSocketPartidos } = require('./sockets/partidos.socket');

// Validar que todas las variables de entorno existan al arrancar
validarEnv();

const app    = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

// ── Middlewares globales ─────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger UI en /api/docs ──────────────────────────────────
const swaggerDoc = YAML.load('./docs/swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ── Rutas principales bajo /api/v1 ───────────────────────────
app.use('/api/v1', router);

// ── Ruta de salud del servidor ───────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Middleware de errores (siempre al final) ─────────────────
app.use(errorMiddleware);

// ── Iniciar lógica de WebSockets ─────────────────────────────
iniciarSocketPartidos(io);

// ── Levantar servidor ────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ BetWise Backend corriendo en http://localhost:${PORT}`);
  console.log(`📖 Documentación en   http://localhost:${PORT}/api/docs`);
});
