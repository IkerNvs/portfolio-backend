const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Crear usuario ADMIN
    const adminPassword = await bcrypt.hash('FYVSAKUDV$&%&yIASDFVIAY', 10);
    const admin = new User({
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
    });

    // Crear usuario VIEWER
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    const viewer = new User({
      username: 'viewer',
      passwordHash: viewerPassword,
      role: 'viewer',
    });

    // Guardar ambos usuarios
    await Promise.all([admin.save(), viewer.save()]);
    console.log('✅ Usuarios creados:\n- admin / [admin password]\n- viewer / viewer123');
  } catch (err) {
    console.error('❌ Error al crear usuarios:', err);
  } finally {
    await mongoose.disconnect();
  }
})();
