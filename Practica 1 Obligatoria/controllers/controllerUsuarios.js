const ModelUsuario = require("../models/modelUser.js");
const mysql = require("mysql");
const config = require("../config.js");
var path = require('path');

const pool = mysql.createPool(config.mysqlConfig);
const modelUser = new ModelUsuario(pool);

//USUARIOS//
function getAllUsers(request, response, next) {
    modelUser.getAllUsers(function (err, result) {
        if (err) {
            console.log(err.message);
            next(err);
        } else {
            response.render("usuarios", { usuarios: result, titulo: "Usuarios" });
        }
    });
}

function getAllUsersByText(request, response, next) {
    modelUser.getAllUsersByText(request.body.nombreUserBusqueda, function (err, result) {
        if (err) {
            console.log(err.message);
            next(err);
        } else if (result) {
            response.render("usuarios", { usuarios: result, titulo: "Usuarios filtrados por [\"" + request.body.nombreUserBusqueda + "\"]" });
        } else {
            response.render("usuarios", { usuarios: [], titulo: "No hay usuarios con [\"" + request.body.nombreUserBusqueda + "\"]" });
        }
    });
}

function isUserCorrect(request, response, next) {
    modelUser.isUserCorrect(request.body.correo, request.body.password, function (err, result) {
        if (err) {
            console.log(err.message);
            next(err);
        } else if (result) {
            console.log("Usuario y contraseña correctos");
            console.log(result[0])
            request.session.currentUser = result[0].correo;
            request.session.currentName = result[0].nombre;
            response.redirect("/usuarios/principal");
        } else {
            console.log("Usuario y/o  contraseña incorrectos");
            response.render("login", { errorMsg: "Usuario y/o contraseña incorrectos" });
        }
    });
}

function getUserImageName(request, response, next) {
    modelUser.getUserImageName(response.locals.userEmail, function (err, result) {
        if (err) {
            console.log(err.message);
            next(err);
        } else {
            let pathImg = path.join(__dirname, "../public/profile_imgs/", result[0].avatar);
            response.sendFile(pathImg);
        }
    });
}

function getUser(request, response, next) {
    modelUser.getUser(request.body.correo, function (err, result) {
        if (err) {
            console.log(err.message);
            next();
        } else {
            response.render("perfilUsuario", { usuario: result });
        }
    });
}

function insertUser(request, response, next) {
    let f = new Date();
    let fecha = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + f.getDate();

    //si las passwords no coinciden, redireccionar con un errMsg
    if (request.body.password != request.body.confirmPassword) {
        response.render("registro", { errorMsg: "Passwords no coinciden" });
    }
    else {
        
        //necesario ver si request.file existe primero para asignarle el request.file.filename a una var. Si no existe, esa var es vacia.
        let nombreFichero = '';
        if (request.file) {
            nombreFichero = request.file.filename;
        }

        modelUser.insertUser(request.body.correo, request.body.password, request.body.nombre, nombreFichero, fecha, function (err, result) {
            if (err) {
                console.log(err.message);
                response.render("registro", { errorMsg: "Email ya existente" });
            } else {
                console.log("Usuario registrado con correo: " + request.body.correo);
                request.session.currentUser = request.body.correo;
                request.session.currentName = request.body.nombre;
                response.redirect("/usuarios/principal");
            }
        });
    }
}

module.exports = {
    getAllUsers: getAllUsers,
    getAllUsersByText: getAllUsersByText,
    isUserCorrect: isUserCorrect,
    getUserImageName: getUserImageName,
    getUser: getUser,
    insertUser: insertUser
};