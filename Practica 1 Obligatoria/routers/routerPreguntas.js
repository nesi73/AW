const express = require("express");
const bodyParser = require("body-parser");

const controllerAsk = require("../controllers/controllerPreguntas.js");
//modulo de los middlewares
const middlewares = require("../middlewares.js");

//Declaramos el router
const router = express.Router();

//Uses
//middleware de sesion
router.use(middlewares.middlewareSession);
router.use(bodyParser.urlencoded({ extended: true }));

//MANEJADORES DE RUTA

//GETS//
//pagina principal de preguntas
router.get("/preguntas", middlewares.identificacionRequerida, controllerAsk.getAllAsk);

//formular pregunta
router.get("/formular", middlewares.identificacionRequerida, function (request, response) {
    response.render("formular");
});

//preguntas sin responder
router.get("/sinResponder", middlewares.identificacionRequerida, controllerAsk.getAllAsksWithoutReply);

//para coger las etiquetas de la pregunta
router.get("/etiquetados/:tag", middlewares.identificacionRequerida, controllerAsk.getAllAsksByTag);

//rutas parametricas
//get pregunta
router.get("/:idPregunta", middlewares.identificacionRequerida, controllerAsk.getAsk);

//Visitar pregunta
router.get("/visita/:idPregunta", middlewares.identificacionRequerida, controllerAsk.visitAsk); 

//Like y dislike preguntas
router.get("/:like/:idPregunta", middlewares.identificacionRequerida, controllerAsk.voteAsk);

//Like y dislike respuesta
router.get("/:like/:idPregunta/:idRespuesta", middlewares.identificacionRequerida, controllerAsk.voteReply);

//POSTS//
router.post("/procesar_formular", middlewares.identificacionRequerida, controllerAsk.insertAsk); //al no necesitar la funcion identificacionRequerida, no puedes usar response.locals para pasarle el username ya que ahi es donde se define

router.post("/procesar_busqueda", middlewares.identificacionRequerida, controllerAsk.getAllAsksByText);

router.post("/procesar_respuesta/:idPregunta", middlewares.identificacionRequerida, controllerAsk.insertReply);

module.exports = router;