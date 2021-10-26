const config = require("./config");
const DAOTasks = require("./DAOTasks");
const DAOUsers = require("./DAOUsers");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
const daoUser = new DAOUsers(pool);

const util = new utils();

const sessionStore = new MySQLStore({
  host: config.mysqlConfig.host,
  user: config.mysqlConfig.user,
  password: config.mysqlConfig.password,
  database: config.mysqlConfig.database
});

const middlewareSession = session({
  saveUninitialized: false,
  secret: "foobar34",
  resave: false,
  store: sessionStore
});

app.use(middlewareSession);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (request, response) {
  response.redirect("/login");
});

//PRACTICA 5

function identificacionRequerida(request, response, next) {
  if (request.session.currentUser) {
    response.locals.userEmail = request.session.currentUser;
    next();
  } else {
    response.redirect("/login");
  }
}

app.get("/login", function (request, response) {
  response.render("login", { errorMsg: null });
});

app.post("/procesar_login", function (request, response) {
  //SOLO AQUI USAER EL request.body.correo. PARA ACCEDER AL USER CORREO CUSAR request.session.currentUser
  daoUser.isUserCorrect(request.body.correo, request.body.password, function (err, result) {
    if (err) {
      console.log(err.message);
    } else if (result) {
      request.session.currentUser = request.body.correo;
      response.redirect("/tasks");
    } else {
      response.render("login", { errorMsg: "Dirección de correo y/o contraseña no válidos" });
    }
  });

});

app.get("/logout", function (request, response) {
  request.session.destroy()
  response.redirect("/login");
});

app.get("/imagenUsuario", identificacionRequerida, function (request, response) {
  daoUser.getUserImageName(request.session.currentUser, function (err, result) {
    if (err) {
      console.log(err.message);
    } else if (result[0].img != null) {
      response.sendFile("profile_imgs/" + result[0].img, { root: __dirname })
    } else {
      response.sendFile("/public/img/avatar.jpg", { root: __dirname })
    }
  });
});

//PRACTICA 4
app.get("/tasks", identificacionRequerida, function (request, response) {
  response.status(200);

  let taskList;
  daoT.getAllTasks(request.session.currentUser, function (err, result) {
    if (err) {
      console.log(err.message);
    } else if (result) {
      taskList = result;
      response.render("tasks", { taskList: taskList, userMail: response.locals.userEmail });
    } else {
      response.render("tasks", { taskList: taskList, userMail: response.locals.userEmail });
    }
  });

});

app.post("/addTask", identificacionRequerida, function (request, response) {
  let task = util.createTask(request.body.desc);
  task.done = 0;

  daoT.insertTask(request.session.currentUser, task, function (err, result) {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Se inserto la tarea");
      response.redirect("/tasks");
    }
  });

});

app.get("/finish/:taskId", identificacionRequerida, function (request, response) {
  daoT.markTaskDone(request.params.taskId, function (err, result) {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Tarea marcada");
      response.redirect("/tasks")
    }
  });
});

app.get("/deleteCompleted", identificacionRequerida, function (request, response) {
  daoT.deleteCompleted(request.session.currentUser, function (err, result) {
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
