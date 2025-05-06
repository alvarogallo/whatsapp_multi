// rutas/raiz.js
const express = require('express');
const router = express.Router();

// Ruta principal
router.get('/', (req, res) => {
  res.send('hola mundo');
});

// Exportamos el router para usarlo en otros archivos
module.exports = router;