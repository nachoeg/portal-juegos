'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static('public'));

const reversiReglas = require('./private/reversiReglas');

app.get('/reversi', (req, res) => {
	let idPartida = req.query.idPartida;
	if (idPartida == null) {
		res.redirect('/reversi-salas');
	}
	res.sendFile(path.resolve(__dirname, './private/reversi.html'));
});

app.get('/reversi-salas', (req, res) => {
	res.sendFile(path.resolve(__dirname, './private/reversi-salas.html'));
});

app.get('/reversi/abandonar', (req, res) => {
	let idPartida = req.query.idPartida;
	let quienAbandono = parseInt(req.query.idJugador);
	let ruta = './private/tableros/tableroReversi' + idPartida + '.json';
	let jsonString = fs.readFileSync(ruta);
	let tablero = JSON.parse(jsonString);

	if (parseInt(tablero.cantJugadoresConectados) < 2) {
		//no hay nadie mas en la partida, por lo tanto la borro
		console.log('Ruta de la partida a eliminar ' + ruta);
		fs.unlinkSync(ruta, (err) => {
			if (err) throw err;
		});
		return;
	}
	if (parseInt(tablero.cantJugadoresQueAbandonaron) == 0) {
		//todavia hay un jugador en la partida, actualizo el tablero
		tablero.cantJugadoresQueAbandonaron = 1;
		tablero.cantJugadoresConectados--;
		tablero.quienAbandono = quienAbandono;
		let jsonData = JSON.stringify(tablero);
		fs.writeFileSync(ruta, jsonData);
	}
});

app.get('/reversi/cargarTablero', (req, res) => {
	let idPartida = req.query.idPartida;
	let ruta = './private/tableros/tableroReversi' + idPartida + '.json';
	let sala = fs.readFileSync(ruta);
	sala = JSON.parse(sala);

	res.json({
		tablero: sala.estado.tablero,
		jugadorActivo: sala.estado.jugador,
		infoJugadores: {
			negras: sala.jugadores.negras.datosPublicos,
			blancas: sala.jugadores.blancas.datosPublicos,
		},
	});
});

app.get('/reversi/cargarSalas', (req, res) => {
	let files = fs.readdirSync('./private/tableros');
	files = files.filter((element) => element != 'README.md');
	let arreglo = [];
	files.forEach((file) => {
		let jsonData = fs.readFileSync('./private/tableros/' + file);
		let sala = JSON.parse(jsonData);
		arreglo.push({ nombreSala: sala.nombreSala, idPartida: sala.idPartida });
	});
	res.json(arreglo);
});

app.get('/reversi/crearPartida', (req, res) => {
	let idPartida = Date.now();
	let nombreSala = req.query.nombreSala;
	let nickname = req.query.nickname;
	let idJugador = req.query.idJugador;
	let codigoNuevo = Math.floor(Math.random() * 9001 + 1000);
	let jsonString = fs.readFileSync('./private/tableroReversi.json'); //este archivo es una "plantilla" a partir de la cual se van a generar los nuevos archivos
	let tablero = JSON.parse(jsonString);

	tablero.cantJugadoresConectados++;
	tablero.idPartida = idPartida;
	tablero.nombreSala = nombreSala;

	if (idJugador == 1) {
		tablero.jugadores.negras.datosPublicos.nickname = nickname;
		tablero.jugadores.negras.codigoDeSeguridad = codigoNuevo;
	} else {
		tablero.jugadores.blancas.datosPublicos.nickname = nickname;
		tablero.jugadores.blancas.codigoDeSeguridad = codigoNuevo;
	}

	jsonString = JSON.stringify(tablero);
	let rutaArchivoNuevo =
		'./private/tableros/tableroReversi' + idPartida + '.json';
	console.log('Ruta de la partida creada ' + rutaArchivoNuevo);
	fs.writeFileSync(rutaArchivoNuevo, jsonString);

	res.json({ codigoDeSeguridad: codigoNuevo, id: idPartida });
});

app.get('/reversi/unirse-a-partida', (req, res) => {
	let nickname = req.query.nickname;
	let idPartida = req.query.idPartida;
	let ruta = './private/tableros/tableroReversi' + idPartida + '.json';

	try {
		let jsonData = fs.readFileSync(ruta);
		let tablero = JSON.parse(jsonData);

		if (tablero.cantJugadoresConectados == 2) {
			res.json({
				ok: false,
				codigo: 591,
				motivo: 'La sala a la que quieres ingresar está completa.',
			});
		} else {
			tablero.cantJugadoresConectados++;
			let idJugador;

			if (tablero.jugadores.negras.codigoDeSeguridad == 0) {
				idJugador = 1;
			} else {
				idJugador = 2;
			}

			let codigoNuevo = Math.floor(Math.random() * 9001 + 1000);
			while (tablero.jugadores.negras.codigoDeSeguridad == codigoNuevo) {
				codigoNuevo = Math.floor(Math.random() * 9001 + 1000);
			}

			if (idJugador == 1) {
				tablero.jugadores.negras.datosPublicos.nickname = nickname;
				tablero.jugadores.negras.codigoDeSeguridad = codigoNuevo;
			} else {
				tablero.jugadores.blancas.datosPublicos.nickname = nickname;
				tablero.jugadores.blancas.codigoDeSeguridad = codigoNuevo;
			}

			jsonData = JSON.stringify(tablero);
			fs.writeFileSync(ruta, jsonData);
			res.json({
				ok: true,
				codigoDeSeguridad: codigoNuevo,
				idJugador: idJugador,
			});
		}
	} catch (error) {
		res.json({ ok: false, codigo: 590, motivo: 'La partida ya no existe.' });
	}
});

app.get('/reversi/es-mi-turno', (req, res) => {
	let consultante = parseInt(req.query.codigoJugador);
	let idJugador = req.query.idJugador;
	let idPartida = req.query.idPartida;
	let ruta = './private/tableros/tableroReversi' + idPartida + '.json';
	let tablero = fs.readFileSync(ruta);
	tablero = JSON.parse(tablero);

	let jugadorActual = tablero.estado.jugador;
	let codigoJugadorActual;
	let nicknameOponente;

	if (jugadorActual == 1) {
		codigoJugadorActual = tablero.jugadores.negras.codigoDeSeguridad;
		nicknameOponente = tablero.jugadores.blancas.datosPublicos.nickname;
	} else {
		codigoJugadorActual = tablero.jugadores.blancas.codigoDeSeguridad;
		nicknameOponente = tablero.jugadores.negras.datosPublicos.nickname;
	}

	if (
		parseInt(tablero.cantJugadoresQueAbandonaron) == 1 &&
		tablero.quienAbandono != idJugador
	) {
		//si ya abandonó una persona
		console.log('Ruta de la partida a eliminar ' + ruta);
		fs.unlinkSync(ruta, (err) => {
			if (err) throw err;
		});

		let quienGano = tablero.quienAbandono == 1 ? 2 : 1;
		let ganadorNick;
		let perdedorNick;
		if (quienGano == 1) {
			ganadorNick = tablero.jugadores.negras.datosPublicos.nickname;
			perdedorNick = tablero.jugadores.blancas.datosPublicos.nickname;
		} else {
			ganadorNick = tablero.jugadores.blancas.datosPublicos.nickname;
			perdedorNick = tablero.jugadores.negras.datosPublicos.nickname;
		}
		res.json({
			finPartida: true,
			motivo: 'abandono',
			estado: tablero.estado,
			ganador: quienGano,
			ganadorNick: ganadorNick,
			perdedorNick: perdedorNick,
		});
	} else {
		if (parseInt(tablero.cantJugadoresConectados) < 2) {
			res.json({
				finPartida: false,
				faltaOponente: true,
			});
		} else {
			if (consultante == codigoJugadorActual) {
				//al ingresar acá es porque es mi turno, pero primero hay que chequear que tenga movimientos
				let tengoMovimientos = reversiReglas.movimientosRestantes(tablero);
				let fichasNegras = parseInt(
					tablero.jugadores.negras.datosPublicos.fichas
				);
				let fichasBlancas = parseInt(
					tablero.jugadores.blancas.datosPublicos.fichas
				);

				if (tengoMovimientos) {
					//si tengo movimientos, devuelvo el estado del tablero
					res.json({
						finPartida: false,
						faltaOponente: false,
						esMiTurno: true,
						estado: tablero.estado,
						nicknameOponente: nicknameOponente,
						puntos: {
							negras: fichasNegras,
							blancas: fichasBlancas,
						},
					});
				} else {
					//si no tengo tengo movimientos, chequeo la flag de movimientos
					let jugadorSinMovimientos = parseInt(tablero.jugadorSinMovimientos);
					if (jugadorSinMovimientos == 0) {
						tablero.jugadorSinMovimientos = 1;
						//jugadorSinMovimientos es un "flag" que va a estar en 0 cuando el jugador anterior
						//se haya podido mover.

						tablero.estado.jugador = jugadorActual == 1 ? 2 : 1; //cambio el turno
						tablero.estado.turno++;
						//En este caso, tengo que modificar el archivo Json, para que quede guardado que se cambió de turno
						let estado = tablero.estado;
						tablero = JSON.stringify(tablero);
						fs.writeFileSync(ruta, tablero);

						//le toca a este jugador, pero no tiene movimientos, así que su turno se saltea
						res.json({
							finPartida: false,
							faltaOponente: false,
							esMiTurno: false,
							estado: estado,
							motivo: 'sin movimientos',
							puntos: {
								negras: fichasNegras,
								blancas: fichasBlancas,
							},
						});
					}
					//si no hay movimientos pero el jugador anterior tampoco tuvo movimientos, finaliza la partida
					//lo indico con jugadorSinMovimientos en 2;
					//envío también información de quién gano la partida
					else {
						let quienGano;
						let ganadorNick;
						if (fichasNegras == fichasBlancas) {
							quienGano = 0;
							ganadorNick = 'Nadie';
						} else {
							if (fichasNegras > fichasBlancas) {
								quienGano = 1;
								ganadorNick = tablero.jugadores.negras.datosPublicos.nickname;
							} else {
								quienGano = 2;
								ganadorNick = tablero.jugadores.blancas.datosPublicos.nickname;
							}
						}
						tablero.cantJugadoresQueFinalizaron++;
						if (tablero.cantJugadoresQueFinalizaron == 2) {
							//si ambos finalizaron borro la partida
							console.log('Ruta de la partida a eliminar ' + ruta);
							fs.unlinkSync(ruta, (err) => {
								if (err) throw err;
							});
						} else {
							// sino cambio el turno para que el otro jugador tambien finalice su partida
							tablero.estado.jugador = jugadorActual == 1 ? 2 : 1;
							tablero.estado.turno++;
							tablero = JSON.stringify(tablero);
							fs.writeFileSync(ruta, tablero);
						}
						res.json({
							finPartida: true,
							faltaOponente: false,
							esMiTurno: false,
							motivo: 'fin partida',
							ganador: quienGano,
							ganadorNick: ganadorNick,
							puntos: {
								negras: fichasNegras,
								blancas: fichasBlancas,
							},
						});
					}
				}
			} else {
				//todavía no terminó de jugar el rival
				res.json({
					finPartida: false,
					faltaOponente: false,
					esMiTurno: false,
					motivo: 'esperando',
				});
			}
		}
	}
});

app.get('/reversi/validar', (req, res) => {
	//i = fila, j = columna

	try {
		let fila = req.query.i;
		let columna = req.query.j;
		let idPartida = req.query.idPartida;
		let ruta = './private/tableros/tableroReversi' + idPartida + '.json';
		let tablero = fs.readFileSync(ruta);
		let situacionNueva = JSON.parse(tablero);
		let validacion = reversiReglas.validarCasillero(
			fila,
			columna,
			situacionNueva
		);
		let resultado = validacion.tablero;
		let jsonString = JSON.stringify(resultado);
		if (validacion.ok) {
			fs.writeFileSync(ruta, jsonString);
			res.json({
				pude: true,
				tablero: resultado.estado.tablero,
				puntajeNegras: resultado.jugadores.negras.datosPublicos.fichas,
				puntajeBlancas: resultado.jugadores.blancas.datosPublicos.fichas,
				jugadorActivo: resultado.estado.jugador,
			});
		} else {
			res.json({ pude: false });
		}
	} catch (error) {
		console.log(error);
	}
});

app.get('/reversi/posibles-cambios', (req, res) => {
	//i = fila, j = columna

	try {
		let fila = req.query.i;
		let columna = req.query.j;
		let idPartida = req.query.idPartida;
		let ruta = './private/tableros/tableroReversi' + idPartida + '.json';
		let tablero = fs.readFileSync(ruta);
		let situacionInicial = JSON.parse(tablero);

		let validacion = reversiReglas.posiblesCambios(
			fila,
			columna,
			situacionInicial
		);
		let tableroCambiado = validacion.tablero;

		res.json({
			pude: validacion.ok,
			tablero: tableroCambiado.estado.tablero,
		});
	} catch (error) {
		console.log(error);
	}
});

app.listen(
	process.env.PORT || 3000,
	() => {}
	// console.log(`Servidor corriendo en: http://localhost:${PORT}`)
);
