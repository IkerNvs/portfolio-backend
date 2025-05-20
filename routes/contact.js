// routes/contact.js
const express = require('express')
const nodemailer = require('nodemailer')
require('dotenv').config()

const router = express.Router()

router.post('/', async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_TO,
      subject: 'Nuevo mensaje desde el portfolio',
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    })

    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al enviar el mensaje' })
  }
})

module.exports = router
