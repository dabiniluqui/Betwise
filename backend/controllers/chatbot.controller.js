const axios = require('axios');

async function chat(req, res) {
  const { contents, systemInstruction, generationConfig } = req.body;

  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ ok: false, mensaje: 'El campo contents es requerido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const { data } = await axios.post(url, { contents, systemInstruction, generationConfig });
    res.json(data);
  } catch (error) {
    const status = error.response?.status ?? 500;
    const mensaje = error.response?.data?.error?.message ?? 'Error al comunicarse con Gemini.';
    res.status(status).json({ ok: false, mensaje });
  }
}

module.exports = { chat };
