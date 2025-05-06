// rutas/recibe_post.js
const express = require('express');
const router = express.Router();

// Importamos la función getClient y el objeto clients desde donde esté definido
// Nota: Necesitarás modificar este archivo para importar correctamente estos elementos
// o pasarlos como parámetro al crear el router
module.exports = (clients, getClient) => {
  // Ruta para obtener el QR de una instancia vía POST
  router.post('/qr', (req, res) => {
    const codigo = req.body.codigo;
    
    // Validar que el código sea de 8 dígitos
    if (!codigo || !/^\d{8}$/.test(codigo)) {
      return res.status(400).json({ error: "El código debe ser de 8 dígitos." });
    }
    
    // Verificar si existe esa instancia
    if (!clients[codigo]) {
      // Si no existe, la creamos
      getClient(codigo);
      return res.status(202).json({ 
        mensaje: "Instancia inicializándose. Intenta nuevamente en unos segundos." 
      });
    }
    
    // Devolver el QR si existe
    if (clients[codigo].qr) {
      res.json({ qr: clients[codigo].qr });
    } else {
      res.status(404).json({ 
        error: "QR aún no generado. Por favor espere unos segundos y vuelva a intentarlo." 
      });
    }
  });

  return router;
};