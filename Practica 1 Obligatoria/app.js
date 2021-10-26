"use strict";
const mysql = require("mysql");
const config = require("./config.js");
const express = require("express");
const path = require("path");
const app = express();

//modulo de los middlewares
const middlewares = require("./middlewares.js");

//modulo routers
const routerUsuarios = require("./routers/routerUsuarios.js");
const routerPreguntas = require("./routers/routerPreguntas.js");

//para que funcione ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Uses
//middleware de sesion
app.use(middlewares.middlewareSession);
app.use(express.static(__dirname + '/public')); //IMPORTANTE

//routers
app.use("/usuarios", routerUsuarios)
app.use("/preguntas", routerPreguntas)

//MANEJADORES DE RUTA
//Si no cerraste sesion, se te direcciona a la pagina principal
app.get("/", function (request, response) {
  if (request.session.currentUser) {
    response.redirect("/usuarios/principal")
  }
  else
    response.redirect("/login")
});

app.get("/login", function (request, response) {
  if (request.session.currentUser) {
    response.redirect("/usuarios/principal")
  }
  else
    response.render("login", { errorMsg: null });
});

app.get("/registro", function (request, response) {
  if (request.session.currentUser) {
    response.redirect("/usuarios/principal")
  }
  else
    response.render("registro", { errorMsg: null });
});

app.get("/logout", function (request, response) {
  request.session.destroy()
  response.redirect("/login");
});

//middleware error 500
app.use(middlewares.error500);

//middleware error 404
app.use(middlewares.error404);

// Arrancar el servidor
app.listen(config.port, function (err) {
  if (err) {
    console.log("ERROR al iniciar el servidor");
  } else {
    console.log(`Servidor arrancado en el puerto ${config.port}`);
  }
});
