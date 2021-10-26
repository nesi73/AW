"use strict";
const mysql = require("mysql");

class DAOTasks {
    constructor(pool) {
        this.pool = pool;
    }

    getAllTasks(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }

            else {
                connection.query("SELECT task.id, task.text, task.done, tag.tag FROM user JOIN (task JOIN tag ON task.id = tag.taskId) ON user.email = task.user WHERE user.email=?",
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
                                let array = []
                                let task = []

                                rows.forEach(e => {
                                    if (array[e.id] === undefined) {
                                        task = {
                                            "id": e.id,
                                            "text": e.text,
                                            "done": e.done,
                                            "tags": [e.tag]
                                        };

                                        array[task.id] = task
                                    }
                                    else {
                                        array[task.id].tags.push(e.tag)
                                    }

                                });
                                
                                //como los ids son las posiciones del array, a veces los ids en la BD son 1,4,5... Y las posiciones del 2 al 3 quedan vacias, por lo que para eliminarlas se hace esto:
                                array = array.filter(Boolean)

                                callback(null, array)
                            }
                        }
                    });
            }
        });
    }

    insertTask(email, task, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("INSERT INTO task(user,text,done) VALUES(?,?,?)",
                    [email, task.text, task.done],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false); //no existe el usuario
                            }
                            else {
                                let array = []

                                task.tags.forEach(e => {
                                    array.push([rows.insertId, e])
                                })

                                connection.query("INSERT INTO tag(taskId,tag) VALUES ?",
                                    [array], function (err, result) {

                                        if (err) {
                                            callback(new Error("Error de acceso a la base de datos"))
                                        }
                                        else {
                                            callback(null);
                                        }

                                    })
                            }
                        }
                    });
            }
        }
        );
    }

    markTaskDone(idTask, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("UPDATE task SET done=1 WHERE task.id=?",
                    [idTask],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            callback(null)
                        }
                    });
            }
        }
        );
    }

    deleteCompleted(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("DELETE FROM task WHERE task.user=? AND task.done = 1",
                    [email],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            callback(null)
                        }
                    });
            }
        }
        );
    }
}
module.exports = DAOTasks;


