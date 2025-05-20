const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// DEBUG opcional
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static('uploads'));

// Rutas internas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

const aboutRoutes = require('./routes/about');
app.use('/api/about', aboutRoutes);

const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando ✅');
});

// Ruta de verificación directa (puedes eliminar si ya está en auth)
app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Ruta capturada correctamente ✅' });
});


// ================== SPOTIFY NOW PLAYING ================== //
let cachedAccessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && tokenExpiresAt > now) {
    return cachedAccessToken;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", process.env.SPOTIFY_REFRESH_TOKEN);

  const authHeader = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedAccessToken = response.data.access_token;
    tokenExpiresAt = now + (response.data.expires_in - 60) * 1000;
    return cachedAccessToken;
  } catch (error) {
    if (error.response) {
      console.error("Error obteniendo token de acceso:", error.response.data);
    } else {
      console.error("Error obteniendo token de acceso:", error.message);
    }
    throw error;
  }
}

app.get("/api/now-playing", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204 || !response.data) {
      return res.json({ isPlaying: false });
    }

    const item = response.data.item;
    res.json({
      isPlaying: response.data.is_playing,
      name: item.name,
      artists: item.artists.map((a) => a.name),
      album: {
        images: item.album.images,
      },
      external_urls: item.external_urls,
    });
  } catch (err) {
    if (err.response) {
      console.error("Error obteniendo datos de Spotify:", err.response.data);
      res.json({ isPlaying: false, error: "Error al conectar con Spotify", details: err.response.data });
    } else {
      console.error("Error obteniendo datos de Spotify:", err.message);
      res.json({ isPlaying: false, error: "Error al conectar con Spotify", details: err.message });
    }
  }
});
// ========================================================= //


// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch((err) => console.error('❌ Error al conectar con MongoDB:', err));
