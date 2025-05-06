// rutas/qr.js
const express = require('express');

module.exports = (clients, getClient) => {
  const router = express.Router();
  
  // Ruta para obtener el QR de una instancia
//   router.get('/qr/:codigo', (req, res) => {
//     const codigo = req.params.codigo;
    
//     // Validar que el código sea de 8 dígitos
//     if (!/^\d{8}$/.test(codigo)) {
//       return res.status(400).json({ error: "El código debe ser de 8 dígitos." });
//     }
    
//     // Verificar si existe esa instancia
//     if (!clients[codigo]) {
//       // Si no existe, la creamos
//       getClient(codigo);
//       return res.status(202).json({ 
//         mensaje: "Instancia inicializándose. Intenta nuevamente en unos segundos." 
//       });
//     }
    
//     // Devolver el QR si existe
//     if (clients[codigo].qr) {
//       res.json({ qr: clients[codigo].qr });
//     } else {
//       res.status(404).json({ 
//         error: "QR aún no generado. Por favor espere unos segundos y vuelva a intentarlo." 
//       });
//     }
//   });

// En rutas/qr.js, dentro de la ruta GET /qr/:codigo
// En rutas/qr.js, considera esta implementación alternativa
router.get('/qr/:codigo', async (req, res) => {
    const codigo = req.params.codigo;
    
    // Validar que el código sea de 8 dígitos
    if (!/^\d{8}$/.test(codigo)) {
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
    
    // Intentar esperar hasta 5 segundos si el QR no está disponible aún
    let intentos = 0;
    while (!clients[codigo].qr && intentos < 10) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
      intentos++;
    }
    
    // Devolver el QR si existe después de la espera
    if (clients[codigo].qr) {
      res.json({ qr: clients[codigo].qr });
    } else {
      res.status(404).json({ 
        error: "QR aún no generado. Por favor espere unos segundos y vuelva a intentarlo." 
      });
    }
  });

  // Ruta para reiniciar una sesión específica
  router.post('/reiniciar/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    
    // Validar que el código sea de 8 dígitos
    if (!/^\d{8}$/.test(codigo)) {
      return res.status(400).json({ error: "El código debe ser de 8 dígitos." });
    }
    
    // Comprobar si existe la instancia
    if (!clients[codigo]) {
      return res.status(404).json({ error: "No existe una instancia con ese código." });
    }
    
    // Destruir el cliente actual
    clients[codigo].client.destroy();
    
    // Eliminar el cliente del objeto y crear uno nuevo
    delete clients[codigo];
    getClient(codigo);
    
    res.json({ success: true, mensaje: "Sesión reiniciada correctamente" });
  });
  
  return router;
};