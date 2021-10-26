-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-01-2021 a las 17:21:04
-- Versión del servidor: 10.4.17-MariaDB
-- Versión de PHP: 8.0.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aw`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etiquetas`
--

CREATE TABLE `etiquetas` (
  `idPregunta` int(10) NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `etiquetas`
--

INSERT INTO `etiquetas` (`idPregunta`, `nombre`) VALUES
(63, 'css'),
(63, 'css3'),
(65, 'css'),
(65, 'html'),
(66, 'JavaScript'),
(67, 'nodejs'),
(68, 'mysql'),
(68, 'sql');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medallas`
--

CREATE TABLE `medallas` (
  `idUsuario` varchar(100) NOT NULL,
  `logro` varchar(40) NOT NULL,
  `cantidad` int(10) NOT NULL,
  `tipo` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id` int(10) NOT NULL,
  `titulo` varchar(1000) NOT NULL,
  `texto` varchar(1000) NOT NULL,
  `idUsuario` varchar(100) NOT NULL,
  `votos` int(30) NOT NULL DEFAULT 0,
  `visitas` int(30) NOT NULL DEFAULT 0,
  `fecha` varchar(10) NOT NULL,
  `medAsignada` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `preguntas`
--

INSERT INTO `preguntas` (`id`, `titulo`, `texto`, `idUsuario`, `votos`, `visitas`, `fecha`, `medAsignada`) VALUES
(63, '¿Cual es la diferencia entre position: relative, position: absolute y position: fixed?', 'Sé que estas propiedades de CSS sirven para posicionar un elemento dentro de la página. Sé que estas propiedades de CSS sirven para posicionar un elemento dentro de la página.', 'nico@404.es', 0, 0, '2021-1-13', 0),
(65, '¿Cómo funciona exactamente nth-child?', 'No acabo de comprender muy bien que hace exactamente y qué usos prácticos puede tener.\r\n', 'roberto@404.es', 0, 0, '2021-1-13', 0),
(66, 'Diferencias entre == y === (comparaciones en JavaScript)', 'Siempre he visto que en JavaScript hay:\r\n\r\nasignaciones =\r\ncomparaciones == y ===\r\nCreo entender que == hace algo parecido a comparar el valor de la variable y el === también compara el tipo (como un equals de java).\r\n', 'sfg@404.es', 0, 0, '2021-1-13', 0),
(67, 'Problema con asincronismo en Node', 'Soy nueva en Node... Tengo una modulo que conecta a una BD de postgres por medio de pg-node. En eso no tengo problemas. Mi problema es que al llamar a ese modulo, desde otro modulo, y despues querer usar los datos que salieron de la BD me dice undefined... Estoy casi seguro que es porque la conexion a la BD devuelve una promesa, y los datos no estan disponibles al momento de usarlos.', 'marta@404.es', 0, 0, '2021-1-13', 0),
(68, '¿Qué es la inyección SQL y cómo puedo evitarla?', 'He encontrado bastantes preguntas en StackOverflow sobre programas o formularios web que guardan información en una base de datos (especialmente en PHP y MySQL) y que contienen graves problemas de seguridad relacionados principalmente con la inyección SQL.\r\n\r\nNormalmente dejo un comentario y/o un enlace a una referencia externa, pero un comentario no da mucho espacio para mucho y sería positivo que hubiera una referencia interna en SOes sobre el tema así que decidí escribir esta pregunta.\r\n', 'lucas@404.es', 0, 0, '2021-1-13', 0);

--
-- Disparadores `preguntas`
--
DELIMITER $$
CREATE TRIGGER `darMedallaPregunta` AFTER UPDATE ON `preguntas` FOR EACH ROW BEGIN
    	DECLARE nombreMedalla varchar(40);
        DECLARE tipoMedalla varchar(10);
        DECLARE existe int;
		  
    	IF NEW.votos > OLD.votos THEN
			if NEW.votos = 1 OR NEW.votos = 2 OR NEW.votos = 4 OR NEW.votos = 6 THEN
				if NEW.votos = 1 THEN
					SET nombreMedalla="Estudiante";
					SET tipoMedalla="bronce";
				elseif NEW.votos = 2 THEN
					SET nombreMedalla="Pregunta interesante";
					SET tipoMedalla="bronce";
				elseif NEW.votos = 4 THEN
					SET nombreMedalla="Buena pregunta";
					SET tipoMedalla="plata";
				else
					SET nombreMedalla="Excelente pregunta";
					SET tipoMedalla="oro";
				END IF;
							
				select COUNT(*) into existe FROM medallas WHERE idUsuario=NEW.idUsuario AND logro=nombreMedalla;
			
				if OLD.medAsignada = 0 AND existe > 0 THEN
					UPDATE medallas SET cantidad = cantidad + 1 WHERE logro=nombreMedalla AND tipo=tipoMedalla AND idUsuario=NEW.idUsuario;
				elseif existe = 0 THEN
					INSERT INTO medallas(idUsuario, logro, cantidad, tipo) VALUES (NEW.idUsuario,nombreMedalla,1,tipoMedalla);
				END IF;
			END IF;
			
   		END IF;
 
     END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `darMedallaVisita` AFTER UPDATE ON `preguntas` FOR EACH ROW BEGIN
    	DECLARE nombreMedalla varchar(40);
        DECLARE tipoMedalla varchar(10);
        DECLARE existe int;
		
		if NEW.visitas > OLD.visitas THEN
			if NEW.visitas = 2 OR NEW.visitas = 4 OR NEW.visitas = 6 THEN
				if NEW.visitas = 2 THEN
					SET nombreMedalla="Pregunta popular";
					SET tipoMedalla="bronce";
				elseif NEW.visitas = 4 THEN
					SET nombreMedalla="Pregunta destacada";
					SET tipoMedalla="plata";
				else
					SET nombreMedalla="Pregunta famosa";
					SET tipoMedalla="oro";
				END IF;
							
				select COUNT(*) into existe FROM medallas WHERE idUsuario=NEW.idUsuario AND logro=nombreMedalla;
			
				if existe > 0 THEN
					UPDATE medallas SET cantidad = cantidad + 1 WHERE logro=nombreMedalla AND tipo=tipoMedalla AND idUsuario=NEW.idUsuario;
				else
					INSERT INTO medallas(idUsuario, logro, cantidad, tipo) VALUES (NEW.idUsuario,nombreMedalla,1,tipoMedalla);
				END IF;
			END IF;
		END IF;
			
 
     END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `updateNpreguntas` AFTER INSERT ON `preguntas` FOR EACH ROW UPDATE usuarios SET npreguntas=npreguntas+1 WHERE correo=NEW.idUsuario
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuestas`
--

CREATE TABLE `respuestas` (
  `id` int(10) NOT NULL,
  `texto` varchar(1000) NOT NULL,
  `votos` int(10) NOT NULL DEFAULT 0,
  `fecha` varchar(10) NOT NULL,
  `idUsuario` varchar(100) NOT NULL,
  `idPregunta` int(10) NOT NULL,
  `medAsignada` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `respuestas`
--

INSERT INTO `respuestas` (`id`, `texto`, `votos`, `fecha`, `idUsuario`, `idPregunta`, `medAsignada`) VALUES
(23, 'La propiedad position sirve para posicionar un elemento dentro de la página. Sin embargo, dependiendo de cual sea la propiedad que usemos, el elemento tomará una referencia u otra para posicionarse respecto a ella.\r\n\r\nLos posibles valores que puede adoptar la propiedad position son: static | relative | absolute | fixed | inherit | initial.\r\n', 0, '2021-1-13', 'lucas@404.es', 63, 0),
(24, 'La pseudoclase :nth-child() selecciona los hermanos que cumplan cierta condición definida en la fórmula an + b. a y b deben ser números enteros, n es un contador. El grupo an representa un ciclo, cada cuantos elementos se repite; b indica desde donde empezamos a contar.', 0, '2021-1-13', 'emy@404.es', 65, 0);

--
-- Disparadores `respuestas`
--
DELIMITER $$
CREATE TRIGGER `darMedallaRespuesta` AFTER UPDATE ON `respuestas` FOR EACH ROW BEGIN
    	DECLARE nombreMedalla varchar(40);
        DECLARE tipoMedalla varchar(10);
        DECLARE existe int;
		  
    	IF NEW.votos > OLD.votos THEN
			if NEW.votos = 2 OR NEW.votos = 4 OR NEW.votos = 6 THEN
				if NEW.votos = 2 THEN
					SET nombreMedalla="Respuesta interesante";
					SET tipoMedalla="bronce";
				elseif NEW.votos = 4 THEN
					SET nombreMedalla="Buena respuesta";
					SET tipoMedalla="plata";
				else
					SET nombreMedalla="Excelente respuesta";
					SET tipoMedalla="oro";
				END IF;
							
				select COUNT(*) into existe FROM medallas WHERE idUsuario=NEW.idUsuario AND logro=nombreMedalla;
			
				if OLD.medAsignada = 0 AND existe > 0 THEN
					UPDATE medallas SET cantidad = cantidad + 1 WHERE logro=nombreMedalla AND tipo=tipoMedalla AND idUsuario=NEW.idUsuario;
				elseif existe = 0 THEN
					INSERT INTO medallas(idUsuario, logro, cantidad, tipo) VALUES (NEW.idUsuario,nombreMedalla,1,tipoMedalla);
				END IF;
			END IF;
			
   		END IF;
 
     END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `updateNrespuestas` AFTER INSERT ON `respuestas` FOR EACH ROW UPDATE usuarios SET nrespuestas=nrespuestas+1 WHERE correo=NEW.idUsuario
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `correo` varchar(100) NOT NULL,
  `pass` varchar(20) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `fecha` varchar(10) NOT NULL,
  `nombre` varchar(15) NOT NULL,
  `npreguntas` int(10) NOT NULL,
  `nrespuestas` int(10) NOT NULL,
  `reputacion` int(10) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`correo`, `pass`, `avatar`, `fecha`, `nombre`, `npreguntas`, `nrespuestas`, `reputacion`) VALUES
('emy@404.es', '12345678', 'avatar_1610536014802.png', '2021-1-13', 'Emy', 0, 1, 1),
('lucas@404.es', '12345678', 'defecto2.png', '2021-1-13', 'Lucas', 1, 1, 1),
('marta@404.es', '12345678', 'avatar_1610535969721.png', '2021-1-13', 'Marta', 1, 0, 1),
('nico@404.es', '12345678', 'avatar_1610535889913.png', '2021-1-13', 'Nico', 1, 0, 1),
('roberto@404.es', '12345678', 'avatar_1610535925771.png', '2021-1-13', 'Roberto', 1, 0, 1),
('sfg@404.es', '12345678', 'avatar_1610535951756.png', '2021-1-13', 'SGF', 1, 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `visitapregunta`
--

CREATE TABLE `visitapregunta` (
  `idUsuario` varchar(100) NOT NULL,
  `idPregunta` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `votapregunta`
--

CREATE TABLE `votapregunta` (
  `idUsuario` varchar(100) NOT NULL,
  `idPregunta` int(10) NOT NULL,
  `puntos` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Disparadores `votapregunta`
--
DELIMITER $$
CREATE TRIGGER `updateReputationAsk` AFTER INSERT ON `votapregunta` FOR EACH ROW BEGIN
        DECLARE c varchar(100);
        DECLARE rep int;
        SELECT preguntas.idUsuario into c FROM preguntas WHERE preguntas.id=NEW.idPregunta;
        
        if NEW.puntos = 1 THEN
        	UPDATE usuarios SET reputacion=reputacion+10 WHERE correo=c;
        else
        	UPDATE usuarios SET reputacion=reputacion-2 WHERE correo=c;
        END IF;
        
        SELECT usuarios.reputacion into rep FROM usuarios WHERE usuarios.correo=c;
        
        if rep < 1 THEN
        	UPDATE usuarios SET reputacion=1 WHERE correo=c;
       	END IF;
                
 	END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `updateVotosPregunta` AFTER INSERT ON `votapregunta` FOR EACH ROW BEGIN
DECLARE v int;

UPDATE preguntas SET votos = votos + NEW.puntos WHERE id=NEW.idPregunta;

SELECT votos into v FROM preguntas WHERE id=NEW.idPregunta;

IF v = 1 OR v = 2 OR v = 4 OR v = 6 THEN
	UPDATE preguntas SET medAsignada = 1 WHERE id=NEW.idPregunta;
END IF;
                
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `votarespuesta`
--

CREATE TABLE `votarespuesta` (
  `idUsuario` varchar(100) NOT NULL,
  `idRespuesta` int(10) NOT NULL,
  `puntos` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Disparadores `votarespuesta`
--
DELIMITER $$
CREATE TRIGGER `updateReputationReply` AFTER INSERT ON `votarespuesta` FOR EACH ROW BEGIN
        DECLARE c varchar(20);
        DECLARE rep int;
        SELECT respuestas.idUsuario into c FROM respuestas WHERE respuestas.id=NEW.idRespuesta;
        if NEW.puntos = 1 THEN
        	UPDATE usuarios SET reputacion=reputacion+10 WHERE correo=c;
        else
        	UPDATE usuarios SET reputacion=reputacion-2 WHERE correo=c;
        END IF;
        
        SELECT usuarios.reputacion into rep FROM usuarios WHERE usuarios.correo=c;

        if rep < 1 THEN
            UPDATE usuarios SET reputacion=1 WHERE correo=c;
        END IF;
                
 	END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `updateVotosRespuestas` AFTER INSERT ON `votarespuesta` FOR EACH ROW BEGIN
DECLARE v int;

UPDATE respuestas SET votos = votos + NEW.puntos WHERE id=NEW.idRespuesta;

SELECT votos into v FROM respuestas WHERE id=NEW.idRespuesta;

IF v = 2 OR v = 4 OR v = 6 THEN
	UPDATE respuestas SET medAsignada = 1 WHERE id=NEW.idRespuesta;
END IF;
                
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `etiquetas`
--
ALTER TABLE `etiquetas`
  ADD PRIMARY KEY (`idPregunta`,`nombre`) USING BTREE,
  ADD KEY `idPreguntas` (`idPregunta`);

--
-- Indices de la tabla `medallas`
--
ALTER TABLE `medallas`
  ADD PRIMARY KEY (`idUsuario`,`logro`) USING BTREE,
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `respuestas`
--
ALTER TABLE `respuestas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idPregunta` (`idPregunta`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`correo`);

--
-- Indices de la tabla `visitapregunta`
--
ALTER TABLE `visitapregunta`
  ADD PRIMARY KEY (`idUsuario`,`idPregunta`),
  ADD KEY `idPregunta` (`idPregunta`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `votapregunta`
--
ALTER TABLE `votapregunta`
  ADD PRIMARY KEY (`idUsuario`,`idPregunta`),
  ADD KEY `idPregunta` (`idPregunta`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `votarespuesta`
--
ALTER TABLE `votarespuesta`
  ADD PRIMARY KEY (`idUsuario`,`idRespuesta`),
  ADD KEY `idRespuesta` (`idRespuesta`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `respuestas`
--
ALTER TABLE `respuestas`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `etiquetas`
--
ALTER TABLE `etiquetas`
  ADD CONSTRAINT `etiquetas_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `medallas`
--
ALTER TABLE `medallas`
  ADD CONSTRAINT `medallas_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `respuestas`
--
ALTER TABLE `respuestas`
  ADD CONSTRAINT `respuestas_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `respuestas_ibfk_2` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `visitapregunta`
--
ALTER TABLE `visitapregunta`
  ADD CONSTRAINT `visitapregunta_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `visitapregunta_ibfk_2` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `votapregunta`
--
ALTER TABLE `votapregunta`
  ADD CONSTRAINT `votapregunta_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `votapregunta_ibfk_2` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `votarespuesta`
--
ALTER TABLE `votarespuesta`
  ADD CONSTRAINT `votarespuesta_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `votarespuesta_ibfk_2` FOREIGN KEY (`idRespuesta`) REFERENCES `respuestas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
