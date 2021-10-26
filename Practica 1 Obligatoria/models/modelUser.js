"use strict";
const mysql = require("mysql");
const util = require("../utils.js")
const utils = new util();

class modelUser {
    constructor(pool) {
        this.pool = pool;
    }

    //USUARIOS// 
    
    getAllUsers(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }

            else {
                connection.query("SELECT tabla.correo, tabla.nombre, tabla.avatar, tabla.reputacion, tabla.nombreEtiqueta as nombreEtiqueta, suma FROM (SELECT usuarios.correo, usuarios.nombre, usuarios.avatar, usuarios.reputacion, etiquetas.nombre as nombreEtiqueta, SUM(CASE WHEN etiquetas.nombre IS NOT NULL THEN 1 ELSE 0 END) AS suma FROM (usuarios LEFT JOIN preguntas ON usuarios.correo = preguntas.idUsuario) LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta GROUP BY usuarios.nombre, etiquetas.nombre ORDER BY suma DESC) as tabla GROUP BY tabla.nombre",
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

    getAllUsersByText(palabra, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                let likeQ = "%"+ palabra + "%"
                connection.query("SELECT tabla.correo, tabla.nombre, tabla.avatar, tabla.reputacion, tabla.nombreEtiqueta as nombreEtiqueta FROM (SELECT usuarios.correo, usuarios.nombre, usuarios.avatar, usuarios.reputacion, etiquetas.nombre as nombreEtiqueta, count(*) as numEtiquetas FROM (usuarios LEFT JOIN preguntas ON usuarios.correo = preguntas.idUsuario) LEFT JOIN etiquetas ON preguntas.id = etiquetas.idPregunta GROUP BY usuarios.nombre, etiquetas.nombre ORDER BY numEtiquetas DESC) as tabla GROUP BY tabla.nombre HAVING tabla.nombre LIKE ?",
                    [likeQ],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //ningun nombre contiene esa palabra en su texto o titulo
                            }
                            else {
                                callback(null, rows)
                            }
                        }
                    });
            }
        });
    }

    getUser(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT usuarios.correo, usuarios.fecha, usuarios.avatar, usuarios.nombre, usuarios.npreguntas, usuarios.nrespuestas, usuarios.reputacion, medallas.logro, medallas.cantidad, medallas.tipo FROM usuarios LEFT JOIN medallas ON usuarios.correo = medallas.idUsuario WHERE usuarios.correo = ?",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //no existe el usuario
                            }
                            else {
                                let array = utils.joinUserWithMedallas(rows);
                                callback(null, array)
                            }
                        }
                    });
            }
        });
    }

    getUserName(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT nombre FROM usuarios WHERE correo = ?",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //no existe el usuario
                            }
                            else {
                                callback(null, rows)
                            }
                        }
                    });
            }
        });
    }

    getUserImageName(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT avatar FROM usuarios WHERE correo = ?",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //no existe el usuario
                            }
                            else {
                                callback(null, rows) 
                            }
                        }
                    });
            }
        });
    }

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM usuarios WHERE correo = ? AND pass = ?",
                    [email, password],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, rows)
                            }
                        }
                    });
            }
        }
        );
    }

    insertUser(email, pass, name, avatar, fecha, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                if(avatar.length < 1){
                    console.log("Sin avatar. Generando uno random.")
                    //let random = Math.floor(Math.random() * 4);
                    //avatar = "avatar_" + random + ".png";
                    let random = Math.floor(Math.random() * 3) + 1;
                    avatar = "defecto" + random + ".png";
                }
                connection.query("INSERT INTO usuarios(correo, pass, nombre, avatar, fecha) VALUES (?,?,?,?,?)",
                    [email, pass, name, avatar, fecha],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Ya existe un usuario con ese correo"))
                        }
                        else {
                            callback(null, rows)
                        }
                    });
            }
        }
        );
    }

    updateReputation(correo, reputacion, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("UPDATE usuarios SET reputacion=? + (SELECT reputacion FROM usuarios WHERE correo=?) WHERE correo=?",
                    [reputacion, correo, correo],
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

    updateUserImage(avatar, email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("UPDATE usuarios SET avatar = ? WHERE correo = ?",
                    [avatar, email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false) //no existe el usuario
                            }
                            else {
                                callback(null, rows)
                            }
                        }
                    });
            }
        });
    }

}
module.exports = modelUser;