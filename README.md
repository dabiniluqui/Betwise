# BetWise Argentina ⚽

Plataforma de análisis de fútbol en tiempo real con módulo de salud financiera responsable.

## Stack
- **Frontend**: Angular 17 (standalone components)
- **Backend**: Node.js + Express.js
- **Base de datos**: Supabase (PostgreSQL)
- **Tiempo real**: Socket.io
- **API externa**: API-Football v3
- **Scraping**: Cheerio + Axios
- **Auth**: JWT + bcrypt
- **Docs**: Swagger / OpenAPI 3.0
- **Deploy**: Vercel (front) + Render (back)

## Estructura del proyecto

```
betwise-argentina/
├── frontend/   → Angular 17
└── backend/    → Node.js + Express
```

## Setup rápido

### Backend
```bash
cd backend
npm install
cp .env.example .env   # completar con tus keys
npm run dev
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

## Variables de entorno necesarias (backend/.env)
```
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=una_clave_secreta_larga
API_FOOTBALL_KEY=tu_key_de_api_football
NODE_ENV=development
```

## Deploy
- **Frontend** → Vercel: conectar repositorio, build command `ng build`, output `dist/frontend`
- **Backend** → Render: conectar repositorio, root `backend/`, start command `node server.js`
