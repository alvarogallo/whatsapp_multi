// Importamos los módulos necesarios
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Creamos una instancia de la aplicación express
const app = express();

// Configuramos middlewares
app.use(cors());
app.use(express.json());

// Definimos el puerto
const PORT = 3000;

// Objeto para almacenar clientes y sus QRs
const clients = {};

// Función para crear o recuperar un cliente
function getClient(sessionId) {
  const mensajeria = require('./procesos/mensajeria');
  
  // Si el cliente ya existe, lo devolvemos
  if (clients[sessionId]) {
    return clients[sessionId];
  }

  // Si no existe, creamos uno nuevo
  const client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({
      clientId: sessionId
    })
  });

  // Guardamos el QR cuando se genera
  client.on('qr', (qr) => {
    console.log(`QR generado para sesión ${sessionId}`);
    if (!clients[sessionId]) {
      clients[sessionId] = { client, qr, ready: false };
    } else {
      clients[sessionId].qr = qr;
    }
  });

  // Marcamos como listo cuando el cliente está listo
  client.on('ready', () => {
    console.log(`Cliente ${sessionId} está listo!`);
    if (clients[sessionId]) {
      clients[sessionId].ready = true;
    }
  });
  
  // Evento para capturar todos los mensajes recibidos
  client.on('message', (message) => {
    // Procesamos el mensaje
    const mensajeProcesado = mensajeria.procesarMensaje(message.body);
    
    // Registrar el mensaje procesado en la consola
    console.log(`[${sessionId}] Nuevo mensaje de ${message.from}: ${mensajeProcesado}`);
    
    // Si quieres más detalles del mensaje:
    console.log('[MENSAJE COMPLETO]', JSON.stringify(message, null, 2));
  });

  // Evento para capturar mensajes enviados por el cliente (opcional)
  client.on('message_create', (message) => {
    if (message.fromMe) {
      console.log(`[${sessionId}] Mensaje enviado a ${message.to}: ${message.body}`);
    }
  });

  // Inicializamos el cliente
  client.initialize();
  
  // Guardamos el cliente con QR vacío inicialmente
  clients[sessionId] = { client, qr: "", ready: false };
  
  return clients[sessionId];
}

// Importamos y configuramos las rutas después de definir clients y getClient
const rutaRaiz = require('./rutas/raiz');
const recibePostRouter = require('./rutas/recibe_post')(clients, getClient);
const instanciasRouter = require('./rutas/instancias')(clients, getClient);
const qrRouter = require('./rutas/qr')(clients, getClient);

// Aplicamos los routers
app.use('/', rutaRaiz);
app.use('/', recibePostRouter);
app.use('/', instanciasRouter);
app.use('/', qrRouter);

// Iniciar una instancia específica
const defaultCode = "123456781";
console.log("Iniciando instancia por defecto:", defaultCode);
const clientData = getClient(defaultCode);
console.log("Estado inicial:", clientData.ready ? "Conectado" : "Pendiente");


// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
}).on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
});