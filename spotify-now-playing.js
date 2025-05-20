require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 5051;

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
    tokenExpiresAt = now + (response.data.expires_in - 60) * 1000; // 1 min de margen
    return cachedAccessToken;
  } catch (error) {
    // Log detallado para depuración
    if (error.response) {
      console.error("Error obteniendo token de acceso:", error.response.data);
    } else {
      console.error("Error obteniendo token de acceso:", error.message);
    }
    throw error;
  }
}

/**
 * Endpoint principal que devuelve la información de la canción actual
 */
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
    
    // Si no hay nada reproduciéndose (código 204) o no hay datos
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
    // Log detallado para depuración
    if (err.response) {
      console.error("Error obteniendo datos de Spotify:", err.response.data);
      res.json({ isPlaying: false, error: "Error al conectar con Spotify", details: err.response.data });
    } else {
      console.error("Error obteniendo datos de Spotify:", err.message);
      res.json({ isPlaying: false, error: "Error al conectar con Spotify", details: err.message });
    }
  }
});

// Ruta de estado para verificar que el servidor está funcionando
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Ruta de estado para verificar que el servidor está funcionando
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Spotify Now Playing API escuchando en el puerto ${PORT}`);
});
