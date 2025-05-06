function procesarMensaje(mensaje) {
    //return `${mensaje}...`;
    return "estoy dormido";
}
  
function procesarObjetoMensaje(mensajeObj) {
    if (mensajeObj && mensajeObj.body) {
      mensajeObj.body = procesarMensaje(mensajeObj.body);
    }
    return mensajeObj;
}
  
  // Exportamos las funciones para usarlas en otros archivos
module.exports = {
    procesarMensaje,
    procesarObjetoMensaje
};