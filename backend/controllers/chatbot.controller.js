const axios = require('axios');

async function chat(req, res) {
  const { messages, temperature = 0.7, max_tokens = 800 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ ok: false, mensaje: 'El campo messages es requerido.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const { data } = await axios.post(url, {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature,
      max_tokens,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    res.json(data);
  } catch (error) {
    const status = error.response?.status ?? 500;
    const mensaje = error.response?.data?.error?.message ?? 'Error al comunicarse con el asistente.';
    res.status(status).json({ ok: false, mensaje });
  }
}

module.exports = { chat };
