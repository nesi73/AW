const config = require("./config.js");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);

//Sesiones
const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

//Middleware para identificar al usuario
function identificacionRequerida(request, response, next) {
    if (request.session.currentUser) {
        response.locals.userEmail = request.session.currentUser;
        response.locals.userName = request.session.currentName;
        next();
    } else {
        console.log("No lo intentes ;)")
        response.redirect("/login");
    }
}

//Middleware 500
function error500(err, request, response, next){
    response.status(500);
    response.render("error500", {error: err});
}

//Middleware 404
function error404(request, response, next){
    response.status(404);
    response.render("error404", {error: request.url});
}

module.exports = {
    middlewareSession: middlewareSession,
    identificacionRequerida: identificacionRequerida,
    error500: error500,
    error404: error404
};