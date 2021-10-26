const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
const util = new utils();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true })); 

app.get("/", function (request, response) {
  response.redirect("/tasks");
});

app.get("/tasks", function (request, response) {
  response.status(200);

  let taskList;
  daoT.getAllTasks("usuario@ucm.es", function (err, result) {
    if (err) {
      console.log(err.message);
    } else if (result) {
      taskList = result;
      response.render("tasks", { taskList: taskList });
    } else {
      console.log("Error al obtener las tareas");
    }
  });

});

app.post("/addTask", function (request, response) {
  let task = util.createTask(request.body.text);
  task.done = 0;

  daoT.insertTask("usuario@ucm.es", task, function (err, result) {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Se inserto la tarea");
      response.redirect("/tasks");
    }
  });
  
});

app.get("/finish/:taskId", function (request, response) {
    daoT.markTaskDone(request.params.taskId, function (err, result) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Tarea marcada");
            response.redirect("/tasks")
        }
    });
});

app.get("/deleteCompleted", function (request, response){
    daoT.deleteCompleted("usuario@ucm.es", function (err, result) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Se borraron las tareas completadas del usuario");
            response.redirect("/tasks")
        }
    });
});

// Arrancar el servidor
app.listen(config.port, function (err) {
  if (err) {
    console.log("ERROR al iniciar el servidor");
  } else {
    console.log(`Servidor arrancado en el puerto ${config.port}`);
  }
});
