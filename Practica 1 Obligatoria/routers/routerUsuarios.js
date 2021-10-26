const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const controllerUser = require("../controllers/controllerUsuarios.js");
//modulo de los middlewares
const middlewares = require("../middlewares.js");

//Declaramos el router
const router = express.Router();

//Uses
//middleware de sesion
router.use(middlewares.middlewareSession);
router.use(bodyParser.urlencoded({ extended: true }));

//Multer. Permite guardar las imagenes de perfil que suba el usuario en profile_imgs
var storage = multer.diskStorage({
    destination: function (req, file, cb) { //donde se guardara el archivo
      cb(null, 'public/profile_imgs')
    },
    filename: function (req, file, cb) { //nombre del archivo, avatar_fecha.extension para que todos sean unicos y no se sobreescriban
      cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
  })
const multerFactory = multer({ storage: storage});


//MANEJADORES DE RUTA

//GETS//
//pagina principal
router.get("/principal", middlewares.identificacionRequerida, function (request, response) {
    response.render("principal");
});

//para coger la imagen del usuario en el header
router.get("/imagenUsuario", middlewares.identificacionRequerida, controllerUser.getUserImageName);

//pagina de vista de los usuarios
router.get("/usuarios", middlewares.identificacionRequerida, controllerUser.getAllUsers);

//POSTS//
router.post("/procesar_login", controllerUser.isUserCorrect);

router.post("/procesar_busqueda", middlewares.identificacionRequerida, controllerUser.getAllUsersByText);

//perfil del usuario
router.post("/perfil", middlewares.identificacionRequerida, controllerUser.getUser);

router.post("/procesar_registro", multerFactory.single("avatar"), controllerUser.insertUser);

module.exports = router;