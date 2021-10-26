"use strict";

const mysql = require("mysql");
const config = require("./config.js");
const DAOUsers = require("./DAOUsers.js");
const DAOTasks = require("./DAOTasks.js");

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUser = new DAOUsers(pool);
let daoTask = new DAOTasks(pool);

// Definición de las funciones callback
// Uso de los métodos de las clases DAOUsers y DAOTasks

daoUser.isUserCorrect("usuario@ucm.es", "mipass", function (err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log("Usuario y contraseña correctos");
    } else {
        console.log("Usuario y/o contraseña incorrectos");
    }
});

daoUser.getUserImageName("usuario@ucm.es", function (err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log(result);
    } else {
        console.log("Usuario incorrecto");
    }
});

daoTask.getAllTasks("usuario@ucm.es", function (err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log(result);
    } else {
        console.log("Error al obtener las tareas");
    }
});


let task = {
    "text" : "TAREA usuario perro gato",
    "done" : 0,
    "tags" : ["perro", "gato"]
};

daoTask.insertTask("usuario@ucm.es", task, function (err, result) {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Se inserto la tarea");
    }
});

daoTask.markTaskDone(13, function (err, result) {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Tarea marcada");
    }
});

daoTask.deleteCompleted("usuario2@ucm.es", function (err) {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Se borraron las tareas completadas del usuario");
    }
});