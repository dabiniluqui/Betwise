const axios = require('axios');

function formatearPartidos(partidos) {
  if (!Array.isArray(partidos) || partidos.length === 0) {
    return 'No hay partidos en vivo en este momento.';
  }
  return partidos
    .slice(0, 15)
    .map(p =>
      `• ${p.liga ?? 'Liga'} — ` +
      `${p.local ?? '?'} ${p.goles_local ?? 0}` +
      `-${p.goles_visitante ?? 0} ${p.visitante ?? '?'}` +
      ` (${p.minuto ? `min. ${p.minuto}` : p.estado ?? 'En curso'})`
    )
    .join('\n');
}

async function chat(req, res) {
  const { messages, partidos = [], temperature = 0.7, max_tokens = 1000 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ ok: false, mensaje: 'El campo messages es requerido.' });
  }

  const resumenPartidos = formatearPartidos(partidos);

  const systemPrompt = `Sos FutBot, un experto en historia y estadísticas del fútbol mundial integrado en BetWise Argentina.

TUS ESPECIALIDADES:
- Historia completa del fútbol: equipos, jugadores, técnicos, torneos, registros y momentos icónicos
- Estadísticas históricas: Copas del Mundo, Champions League, Europa League, torneos nacionales, selecciones
- Análisis de partidos actuales: cuando el usuario pregunte por algún partido, usá los datos en tiempo real de abajo
- Fútbol argentino: historia de clubes, selección nacional, ídolos, récords y estadísticas locales
- Comparativas históricas: qué equipo tiene más títulos, quién goleó más, récords de goles en torneos, etc.

PARTIDOS EN VIVO AHORA MISMO:
${resumenPartidos}

CÓMO RESPONDER:
1. Respondé siempre en español rioplatense (usá "vos", "che", sé cercano e informado)
2. Cuando el usuario pregunte por partidos en curso, usá los datos del contexto anterior con score y minuto
3. Para historia del fútbol, respondé con precisión y entusiasmo genuino
4. Citá datos concretos: años, cantidad de goles, récords exactos, fechas históricas
5. Si el usuario dice "el partido" sin especificar, preguntá de cuál habla o referite a los del contexto
6. Si no tenés información precisa sobre algo muy reciente (post agosto 2024), decilo con honestidad
7. Mantené respuestas claras y concisas, máximo 4 párrafos
8. NUNCA des recomendaciones de apuestas, cuotas ni análisis de probabilidades de apuesta`;

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const apiKey = process.env.GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const { data } = await axios.post(
      url,
      { model: 'llama-3.3-70b-versatile', messages: allMessages, temperature, max_tokens },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    res.json(data);
  } catch (error) {
    const status = error.response?.status ?? 500;
    const mensaje = error.response?.data?.error?.message ?? 'Error al comunicarse con FutBot.';
    res.status(status).json({ ok: false, mensaje });
  }
}

module.exports = { chat };
