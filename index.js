const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// DEBUG: comprobar que lee el .env correctamente
console.log("MONGO_URI:", process.env.MONGO_URI);

// Crear app
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());

// ✅ Aumentamos el límite para permitir imágenes en base64
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Hacer pública la carpeta de imágenes
app.use('/uploads', express.static('uploads'));

// Rutas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando ✅');
});

// TEMPORAL: ruta de verificación directa
app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Ruta capturada correctamente ✅' });
});

const aboutRoutes = require('./routes/about');
app.use('/api/about', aboutRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch((err) => console.error('❌ Error al conectar con MongoDB:', err));


//Mailer  
const contactRoutes = require('./routes/contact')
app.use('/api/contact', contactRoutes)



