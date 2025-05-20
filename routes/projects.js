const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../utils/authMiddleware');
const upload = require('../middleware/upload'); // ✅ middleware para subir imágenes

// Ruta pública: obtener todos los proyectos
router.get('/', projectController.getProjects);

// Ruta protegida: crear proyecto con imagen subida
router.post('/', authMiddleware, upload.single("image"), projectController.createProject);


// Ruta protegida: eliminar proyecto por ID
router.delete('/:id', authMiddleware, projectController.deleteProject);

// Ruta protegida: actualizar proyecto por ID
router.put('/:id', authMiddleware, upload.single('image'), projectController.updateProject);

module.exports = router;

