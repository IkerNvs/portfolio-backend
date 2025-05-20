const About = require("../models/AboutBlocks");
const AboutBlock = require("../models/AboutBlocks");

// Validación de bloques
const isValidBlock = (block) =>
  block &&
  typeof block.id === "string" &&
  ["text", "image"].includes(block.type) &&
  typeof block.content === "string";

exports.saveAboutBlocks = async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];

    // Aplanar los bloques válidos y conservar row/column y todos los campos extra
    const blocks = rows.flatMap((row, rowIndex) =>
      Array.isArray(row)
        ? row.map((block, colIndex) => {
            if (
              block &&
              typeof block.id === "string" &&
              ["text", "image"].includes(block.type) &&
              typeof block.content === "string"
            ) {
              return {
                ...block,
                row: block.row ?? rowIndex,
                column: block.column ?? colIndex,
                imageHeight: block.imageHeight ?? null,
                imageWidth: block.imageWidth ?? null,
                objectFit: block.objectFit ?? null,
              };
            }
            return null;
          }).filter(Boolean)
        : []
    );

    let about = await About.findOne();
    if (!about) {
      about = new About({ blocks });
    } else {
      about.blocks = blocks;
      about.updatedAt = new Date();
    }

    await about.save();
    res.json({ message: "Contenido guardado correctamente" });
  } catch (err) {
    console.error("Error al guardar:", err);
    res.status(500).json({ error: "Error al guardar el contenido" });
  }
};

exports.saveBlocks = async (req, res) => {
  try {
    // Borra los bloques actuales
    await AboutBlock.deleteMany({});
    // Guarda los nuevos bloques (incluyendo los campos extra)
    const blocks = req.body.flat();
    await AboutBlock.insertMany(blocks);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about ? about.blocks : []);
  } catch (err) {
    console.error("Error al obtener contenido:", err);
    res.status(500).json({ error: "Error al obtener el contenido" });
  }
};

exports.getAboutBlocks = async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about ? about.blocks : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlocks = async (req, res) => {
  try {
    const blocks = await AboutBlock.find({});
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
