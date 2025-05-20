const Project = require('../models/Project');

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

// Crear un nuevo proyecto (con imagen subida)
exports.createProject = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : "";

    const project = new Project({
      title,
      description,
      link,
      image,
    });

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
};

// Eliminar un proyecto
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};

// Actualizar un proyecto (con opción de subir nueva imagen)
exports.updateProject = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const updateData = { title, description, link };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el proyecto" });
  }
};

