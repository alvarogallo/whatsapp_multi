// rutas/instancias.js
const express = require('express');

module.exports = (clients, getClient) => {
  const router = express.Router();
  
  // Ruta para crear/obtener una instancia usando un código de 8 dígitos
  router.get('/instancia/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    
    // Validar que el código sea de 8 dígitos
    if (!/^\d{8}$/.test(codigo)) {
      return res.status(400).json({ error: "El código debe ser de 8 dígitos." });
    }
    
    // Crear o recuperar el cliente
    const clientData = getClient(codigo);
    
    res.json({ 
      codigo: codigo,
      estado: clientData.ready ? "conectado" : "pendiente",
      mensaje: clientData.ready ? 
              "WhatsApp conectado" : 
              "Escanea el código QR para conectar WhatsApp"
    });
  });
  
  return router;
};