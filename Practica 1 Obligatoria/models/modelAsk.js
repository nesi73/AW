"use strict";
const mysql = require("mysql");
const util = require("../utils.js")
const utils = new util();

class modelAsk {
    constructor(pool) {
        this.pool = pool;
    }

    //PREGUNTAS//

    getAllAsks(callback) { //saca todas las preguntas
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }

            else { //Left join para que saque preguntas aunque no tengan etiquetas
                connection.query("SELECT preguntas.id, preguntas.titulo, preguntas.texto, preguntas.fecha, usuarios.avatar, usuarios.correo, usuarios.nombre as nombreUsuario, etiquetas.nombre as nombreEtiqueta FROM (preguntas LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta) JOIN usuarios ON preguntas.idUsuario = usuarios.correo ORDER BY preguntas.id DESC",
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            let slice = true; //variable para hacer que la funcion de utils parta el cuerpo de la pregunta, ya que en la vista general solo puede haber 150 caracteres
                            let array = utils.joinAskWithTags(rows,slice)
                            callback(null, array)
                        }

                    });
            }
        });
    }

    getAsk(idPregunta, callback) { //Se puede acceder la información detallada de una pregunta pulsando su título en cualquiera de las vistas de preguntas
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }

            else { //Left join para que saque preguntas aunque no tengan etiquetas
                connection.query("SELECT preguntas.id, preguntas.titulo, preguntas.texto, preguntas.fecha, preguntas.votos, preguntas.visitas, usuarios.avatar, usuarios.correo, usuarios.nombre as nombreUsuario, etiquetas.nombre as nombreEtiqueta FROM (preguntas LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta) JOIN usuarios ON preguntas.idUsuario = usuarios.correo WHERE preguntas.id = ?",
                    [idPregunta],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else if (rows.length === 0) {
                            callback(null, false) //no existe la pregunta
                        }
                        else {
                            let slice = false; //false porque en vista general se ve todo el cuerpo, no solo 150 chars
                            let array = utils.joinAskWithTags(rows,slice)
                            callback(null, array)
                        }
                    });
            }
        });
    }

    getReplies(idPregunta, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT respuestas.id, respuestas.texto, respuestas.votos, respuestas.fecha, usuarios.avatar, usuarios.correo, usuarios.nombre as nombreUsuario FROM (respuestas RIGHT JOIN preguntas ON respuestas.idPregunta = preguntas.id) JOIN usuarios ON respuestas.idUsuario = usuarios.correo WHERE preguntas.id = ? ORDER BY respuestas.id DESC",
                    [idPregunta],
                    function (err, resp) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            callback(null, resp)
                        }
                    });
            }
        });

    }

    //CUANDO SE INSERTA UNA PREGUNTA SALTA UN TRIGGER PARA AUMENTAR EL npreguntas DEL USUARIO
    insertAsk(titulo, texto, fecha, email, etiquetas, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("INSERT INTO preguntas(titulo, texto, fecha, idUsuario) VALUES (?,?,?,?)",
                    [titulo, texto, fecha, email],
                    function (err, rows) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Error en la insercion de la pregunta"))
                        }
                        else {
                            let arrayTags = "";
                            for (let i = 0; i < etiquetas.length && i < 5; ++i) { //solo deja insertar 5 etiquetas
                                //construir el string de la query. Si es el ultimo value, no tiene que tener una , al final
                                if (i == etiquetas.length - 1 || i == 4) {
                                    arrayTags += "(" + rows.insertId + ", ?)";
                                } else {
                                    arrayTags += "(" + rows.insertId + ", ?),";
                                }
                            }

                            connection.query("INSERT INTO etiquetas(idPregunta, nombre) VALUES " + arrayTags, etiquetas,
                                function (err, rows2) {
                                    connection.release(); // devolver al pool la conexión
                                    if (err) {
                                        callback(new Error("Error de acceso a la base de datos"))
                                    }
                                    else {
                                        callback(null, rows)
                                    }
                                });
                        }
                    });
            }
        }
        );
    }

    getAllAsksByTag(nombreTag, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT preguntas.id, preguntas.titulo, preguntas.texto,preguntas.fecha,usuarios.avatar,usuarios.correo,  usuarios.nombre as nombreUsuario, etiquetas.nombre as nombreEtiqueta FROM (preguntas LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta) JOIN usuarios ON preguntas.idUsuario = usuarios.correo WHERE preguntas.id IN (SELECT idPregunta FROM etiquetas WHERE nombre= ?)",
                    [nombreTag],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //no hay preguntas con esa etiqueta
                            }
                            else {
                                let slice = true;
                                let array = utils.joinAskWithTags(rows, slice)
                                callback(null, array)
                            }
                        }
                    });
            }
        });
    }

    getAllAsksWithoutReply(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT preguntas.id, preguntas.titulo, preguntas.texto,preguntas.fecha,usuarios.avatar,usuarios.correo, usuarios.nombre as nombreUsuario, etiquetas.nombre as nombreEtiqueta FROM (preguntas LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta) JOIN usuarios ON preguntas.idUsuario = usuarios.correo WHERE preguntas.id NOT IN (SELECT respuestas.idPregunta FROM respuestas)",
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //todas las preguntas tienen respuesta
                            }
                            else {
                                let slice = true;
                                let array = utils.joinAskWithTags(rows, slice);
                                callback(null, array)
                            }
                        }
                    });
            }
        });
    }

    getAllAsksByText(palabra, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                let likeQ = "%"+ palabra + "%"
                connection.query("SELECT preguntas.id, preguntas.titulo, preguntas.texto,preguntas.fecha,usuarios.avatar,usuarios.correo,  usuarios.nombre as nombreUsuario, etiquetas.nombre as nombreEtiqueta FROM (preguntas LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta) JOIN usuarios ON preguntas.idUsuario = usuarios.correo WHERE preguntas.titulo LIKE ? OR preguntas.texto LIKE ?",
                [likeQ, likeQ],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //ninguna pregunta contiene esa palabra en su texto o titulo
                            }
                            else {
                                let slice = true;
                                let array = utils.joinAskWithTags(rows, slice)
                                callback(null, array)
                            }
                        }
                    });
            }
        });
    }

    //CUANDO SE INSERTA EN votapregunta SALTA UN TRIGGER EN LA BD PARA ACTUALIZAR LA REPUTACION DEL USUARIO
    //TRIGGER updateVotosPreguntas AFTER INSERT votapregunta para actualizar los votos
    //TRIGGER darMedallaPregunta AFTER UPDATE pregunta dentro del trigger anterior, cuando se updatean los votos
    voteAsk(email, idPregunta, puntos, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("INSERT INTO votapregunta(idUsuario, idPregunta, puntos) VALUES (?,?,?)",
                    [email, idPregunta, puntos],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Un usuario no puede votar dos veces a la misma pregunta"))
                        }
                        else {
                            callback(null, rows);
                        }
                    });
            }
        });
    }

    //CUANDO SE INSERTA EN votaRespuesta SALTA UN TRIGGER EN LA BD PARA ACTUALIZAR LA REPUTACION DEL USUARIO
    //TRIGGER darMedallaVisita AFTER UPDATE preguntas cuando aumentan las visitas de la pregunta
    visitAsk(email, idPregunta, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("INSERT INTO visitaPregunta(idUsuario, idPregunta) VALUES (?,?)",
                    [email, idPregunta],
                    function (err, rows) {
                        if (err) {
                            connection.release(); // devolver al pool la conexión
                            callback(new Error("Un usuario no se puede visitar dos veces a la misma pregunta porque sino es un chollo lo de las medallas"))
                        }
                        else {
                            connection.query("UPDATE preguntas SET visitas=visitas + 1 where id=?",
                                [idPregunta],
                                function (err, rows) {
                                    connection.release(); // devolver al pool la conexión
                                    if (err) {
                                        callback(new Error("Error de acceso a la base de datos"))
                                    }
                                    else {
                                        callback(null, rows)
                                    }
                                });
                        }
                    });
            }
        });
    }

    //RESPUESTAS//

    //CUANDO SE INSERTA UNA RESPUESTA SALTA UN TRIGGER PARA AUMENTAR EL nrespuestas DEL USUARIO
    insertReply(texto, fecha, idUsuario, idPregunta, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("INSERT INTO respuestas(texto, fecha, idUsuario, idPregunta) VALUES (?,?,?,?)",
                    [texto, fecha, idUsuario, idPregunta],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error en la insercion de la repuesta"))
                        }
                        else {
                            callback(null, rows)
                        }
                    });
            }
        }
        );
    }

    //CUANDO SE INSERTA EN votarespuesta SALTA UN TRIGGER EN LA BD PARA ACTUALIZAR LA REPUTACION DEL USUARIO
    //TRIGGER updateVotosRespuestas AFTER INSERT votarespuesta para actualizar los votos
    //TRIGGER darMedallaRespuesta AFTER UPDATE repuestas dentro del trigger anterior, cuando se updatean los votos
    voteReply(idUsuario, idRespuesta, puntos, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("INSERT INTO votarespuesta(idUsuario, idRespuesta, puntos) VALUES (?,?,?)",
                    [idUsuario, idRespuesta, puntos],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Un usuario no puede votar dos veces a la misma respuesta"))
                        }
                        else {
                            callback(null, rows)
                        }
                    });
            }
        });
    }


}
module.exports = modelAsk;