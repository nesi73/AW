class Util {

  joinAskWithTags(rows, slice) { //devuelve un array con las preguntas y sus etiquetas en forma de array
    let array = []
    if (rows.length != 0) {
      let p = []
      rows.forEach(e => {
        if (array[e.id] === undefined) {

          if (e.texto.length > 150 && slice) { //Para mostrar solo 150 caracteres
            e.texto = e.texto.slice(0, 150) + "..."
          }

          if (e.votos != undefined) { //Para ver una pregunta en especifico
            p = {
              "id": e.id,
              "titulo": e.titulo,
              "texto": e.texto,
              "fecha": e.fecha,
              "votos": e.votos,
              "visitas": e.visitas,
              "avatar": e.avatar,
              "correo": e.correo,
              "nombreUsuario": e.nombreUsuario,
              "tags": [e.nombreEtiqueta]
            };
          }
          else { //Para la vista de todas las preguntas
            p = {
              "id": e.id,
              "titulo": e.titulo,
              "texto": e.texto,
              "fecha": e.fecha,
              "avatar": e.avatar,
              "correo": e.correo,
              "nombreUsuario": e.nombreUsuario,
              "tags": [e.nombreEtiqueta]
            };
          }

          array[p.id] = p
        }
        else {
          array[p.id].tags.push(e.nombreEtiqueta)
        }

      });
      //como los ids son las posiciones del array, a veces los ids en la BD son 1,4,5... Y las posiciones del 2 al 3 quedan vacias, por lo que para eliminarlas se hace esto:
      array = array.filter(Boolean)
      array = array.reverse(); //para que saque las respuestas de mas reciente a mas antigua, ya que va por ids
    }
    return array;
  }

  joinUserWithMedallas(rows) { //devuelve un array con el usuario y sus logros (medallas)

    let user = {
      "correo": rows[0].correo,
      "fecha": rows[0].fecha,
      "avatar": rows[0].avatar,
      "nombre": rows[0].nombre,
      "npreguntas": rows[0].npreguntas,
      "nrespuestas": rows[0].nrespuestas,
      "reputacion": rows[0].reputacion,
      "totalBronce": 0,
      "totalPlata": 0,
      "totalOro": 0,
      "medallasBronce": [],
      "medallasPlata": [],
      "medallasOro": []
    };

    if (rows.length != 0) {

      rows.forEach(e => {

        if (e.logro != undefined) {
          switch (e.tipo) {
            case "bronce":
              user.totalBronce += e.cantidad;
              user.medallasBronce.push({ "logro": e.logro, "cantidad": e.cantidad })
              break;
            case "plata":
              user.totalPlata += e.cantidad;
              user.medallasPlata.push({ "logro": e.logro, "cantidad": e.cantidad })
              break;
            case "oro":
              user.totalOro += e.cantidad;
              user.medallasOro.push({ "logro": e.logro, "cantidad": e.cantidad })
              break;
          }
        }

      });
      
    }

    return user;
  }

  createTask(texto) {
    let regexp = /@\w+/g; //@cualquier letra o numero. La g es para coger todos los tags que hay.
    let tags = texto.match(regexp);
    let tagsFin = [];

    if (tags != null) {
      tagsFin = tags.map((e) => e.substring(1)); //le quitas el @ del principio
    }
    return tagsFin;
  }
}
module.exports = Util;
