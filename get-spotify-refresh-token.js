const express = require("express");
const axios = require("axios");
const open = require("open"); // o const open = require("open").default;

const client_id = "1445d3a635314727b966c47d33f2a925";
const client_secret = "8e750592ca7c47be924856c535b5f834";
const redirect_uri = "http://127.0.0.1:8888/callback";
const scopes = "user-read-currently-playing user-read-playback-state";

const app = express();

app.get("/login", (req, res) => {
  const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirect_uri);

  const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

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
    res.send(`
      <h2>Refresh Token:</h2>
      <pre>${response.data.refresh_token}</pre>
      <p>Cópialo y pégalo en tu archivo .env</p>
    `);
    console.log("Refresh Token:", response.data.refresh_token);
    process.exit(0);
  } catch (err) {
    res.send("Error obteniendo el refresh token");
    console.error(err.response.data);
    process.exit(1);
  }
});

app.listen(8888, () => {
  console.log("Abre http://localhost:8888/login en tu navegador para autorizar la app.");
  // Usa open.default si open() falla
  if (typeof open === "function") {
    open("http://localhost:8888/login");
  } else if (typeof open.default === "function") {
    open.default("http://localhost:8888/login");
  } else {
    console.log("Por favor, abre manualmente: http://localhost:8888/login");
  }
});