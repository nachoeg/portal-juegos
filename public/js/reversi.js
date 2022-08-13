setInformacion();
consultaTurno();

const TIMEOUT_MS = 1000;

async function fetchConsulta() {
	// devuelve si es mi turno
	try {
		let response = await fetch(
			'/reversi/es-mi-turno?idPartida=' +
				localStorage.getItem('idPartidaReversi') +
				'&codigoJugador=' +
				localStorage.getItem('codigoDeSeguridadReversi') +
				'&idJugador=' +
				localStorage.getItem('idJugador')
		);
		let datos = await isResponseOk(response);
		return datos;
	} catch (error) {
		alerta(
			`Partida no encontrada`,
			`Intente nuevamente. ${error.status}: ${error.statusText}`
		);
	}
}

async function consultaTurno() {
	// consulta si es el turno periodicamente hasta que lo sea
	try {
		let consulta = await fetchConsulta();
		console.log(consulta);
		if (consulta.finPartida) {
			// si es fin de partida llama a finalizar partida
			if (consulta.ganador == 0) {
				//empate
				finalizarPartida(
					'Hay un empate!',
					'Ambos jugadores tienen la misma cantidad de fichas y no hay mas movimientos por hacer.',
					false
				);
				return;
			}
			if (consulta.ganador == localStorage.getItem('idJugador')) {
				//victoria
				if (consulta.motivo == 'abandono') {
					finalizarPartida(
						'Victoria de ' + consulta.ganadorNick + '!',
						consulta.perdedorNick + ' abandonó la partida.',
						true
					);
				} else {
					finalizarPartida(
						'Victoria de ' + consulta.ganadorNick + '!',
						'Obtuviste más puntos, y no hay mas movimientos por hacer.',
						true
					);
				}
				return;
			} else {
				//derrota
				finalizarPartida(
					'Has perdido!',
					consulta.ganadorNick +
						' obtuvo más puntos, y no hay mas movimientos por hacer.',
					false
				);
				return;
			}
		}
		if (consulta.faltaOponente) {
			//si falta oponente hace aparecer un modal
			document.getElementById('faltaJugador').style.display = 'block';
			setTimeout(consultaTurno, TIMEOUT_MS);
			return;
		}
		desaparecerModal(document.getElementById('faltaJugador'));
		if (consulta.esMiTurno) {
			// si es mi turno actualiza los datos
			pintarTablero(consulta.estado.tablero, true);
			setPuntaje(consulta.puntos.negras, consulta.puntos.blancas);
			setJugadorActivo(consulta.estado.jugador);
			document.getElementById('nombre1').value = consulta.nicknameOponente;
			return;
		}
		if (consulta.motivo == 'sin movimientos') {
			//si no tengo movimientos actualiza los datos
			pintarTablero(consulta.estado.tablero, true);
			setPuntaje(consulta.puntos.negras, consulta.puntos.blancas);
			setJugadorActivo(consulta.estado.jugador);
			alerta('No tienes movimientos', 'Por lo tanto pasas el turno.');
		}
		setTimeout(consultaTurno, TIMEOUT_MS); // si no es mi turno vuelve a consultar en un tiempo
	} catch (error) {
		console.log(error);
	}
}

function pintarTablero(tablero, cambios) {
	// agrega o actualiza las fichas del tablero
	for (let i = 0; i <= 7; i++) {
		for (let j = 0; j <= 7; j++) {
			let valor = tablero[i][j];
			let casilla = document.getElementById((i * 8 + j + 1).toString());
			casilla.onmouseenter = function () {};
			casilla.onmouseleave = function () {};
			casilla.onclick = function () {
				enviar(i, j);
			};
			if (valor != 0) {
				let seleccion = casilla.getElementsByClassName('disco'); //impide que se repita el mismo disco
				if (seleccion[0] == null) {
					// no hay disco
					let disco = document.createElement('div');
					disco.classList.add('disco');
					if (valor == 1) {
						disco.classList.add('discoNegro');
					} else {
						disco.classList.add('discoBlanco');
					}
					casilla.appendChild(disco); // agrego disco
				} else {
					// hay disco
					if (cambios) {
						let disco = casilla.firstChild;
						if (disco.classList.contains('achicar')) {
							disco.classList.remove('achicar');
						}
						if ((valor == 1) & disco.className.includes('disco discoBlanco')) {
							disco.className = 'disco discoNegro aparecer';
							reproducirAudio('./sounds/colocarFicha.wav', 0.2);
						} else if (
							(valor == 2) &
							disco.className.includes('disco discoNegro')
						) {
							disco.className = 'disco discoBlanco aparecer';
							reproducirAudio('./sounds/colocarFicha.wav', 0.2);
						}
					}
				}
			} else {
				posiblesCambios(casilla, i, j);
			}
		}
	}
}

async function posiblesCambios(casilla, i, j) {
	// consulta si hay posibles cambios al poner un disco en una casilla
	try {
		let consulta = await fetchConsulta();
		if (consulta.esMiTurno) {
			let response = await fetch(
				'/reversi/posibles-cambios?idPartida=' +
					localStorage.getItem('idPartidaReversi') +
					'&i=' +
					i +
					'&j=' +
					j
			);
			let datos = await isResponseOk(response);
			console.log(datos);
			if (datos.pude) {
				if (!casilla.hasChildNodes()) {
					casilla.onmouseenter = function () {
						discosModificables(datos.tablero);
						let discoInvisible = document.createElement('div');
						discoInvisible.className = 'discoInvisible aparecer';
						casilla.appendChild(discoInvisible);
					};
					casilla.onmouseleave = function () {
						let modificables = document.querySelectorAll('.achicar');
						modificables.forEach((element) => {
							element.classList.remove('achicar');
						});
						casilla.firstChild.remove();
					};
				}
			}
		}
	} catch (error) {
		console.log('Error, intente nuevamente', error);
	}
}

function discosModificables(tablero) {
	// activa animacion sobre los discos que pueden ser modificados
	for (let i = 0; i <= 7; i++) {
		for (let j = 0; j <= 7; j++) {
			let valor = tablero[i][j];
			if (valor != 0) {
				let id = (i * 8 + j + 1).toString();
				let casilla = document.getElementById(id);
				let disco = casilla.querySelector('.disco');
				if (
					disco != null &&
					((valor == 1 && disco.classList.contains('discoBlanco')) ||
						(valor == 2 && disco.classList.contains('discoNegro')))
				) {
					disco.classList.add('achicar');
				}
			}
		}
	}
}

async function enviar(i, j) {
	// consulta el turno -> valida el movimiento -> actualiza la informacion
	let consulta = await fetchConsulta();
	console.log(consulta);
	if (consulta.finPartida && consulta.motivo == 'abandono') {
		finalizarPartida(
			'Victoria de ' + consulta.ganadorNick + '!',
			consulta.perdedorNick + ' abandonó la partida.',
			true
		);
	} else {
		if (consulta.esMiTurno) {
			fetch(
				'/reversi/validar?idPartida=' +
					localStorage.getItem('idPartidaReversi') +
					'&i=' +
					i +
					'&j=' +
					j
			)
				.then((response) => isResponseOk(response))
				.then((datos) => {
					console.log(datos);
					if (datos.pude == true) {
						let discoInvisible = document.getElementById(
							(i * 8 + j + 1).toString()
						).firstChild;
						if (discoInvisible != null) discoInvisible.remove();
						pintarTablero(datos.tablero, true);
						setPuntaje(datos.puntajeNegras, datos.puntajeBlancas);
						setJugadorActivo(datos.jugadorActivo);
						setTimeout(consultaTurno, TIMEOUT_MS);
					} else {
						posicionIncorrecta((i * 8 + j + 1).toString());
					}
				})
				.catch((error) => {
					alerta(
						`No es disponible`,
						`Intente nuevamente.${error.status}: ${error.statusText}`
					);
				});
		} else {
			alerta('Espera!', 'Todavia no es tu turno');
		}
	}
}

function setInformacion() {
	// recibe informacion sobre tablero, puntaje, nicknames... y los imprime
	fetch(
		'/reversi/cargarTablero?idPartida=' +
			localStorage.getItem('idPartidaReversi')
	)
		.then((response) => isResponseOk(response))
		.then((datos) => {
			pintarTablero(datos.tablero, false);
			setPuntaje(
				datos.infoJugadores.negras.fichas,
				datos.infoJugadores.blancas.fichas
			);
			setJugadorActivo(datos.jugadorActivo);
			setNicknames(
				datos.infoJugadores.negras.nickname,
				datos.infoJugadores.blancas.nickname
			);
			if (localStorage.getItem('idJugador') == 1) {
				let clase = document.getElementById('disco1').getAttribute('class');
				document.getElementById('disco1').className =
					document.getElementById('disco2').className;
				document.getElementById('disco2').className = clase;
			}
		})
		.catch((error) => {
			alerta(
				`No es disponible`,
				`Intente nuevamente. ${error.status}: ${error.statusText}`
			);
		});
}

function setPuntaje(negras, blancas) {
	if (localStorage.getItem('idJugador') == 2) {
		document.getElementById('puntaje1').value = negras;
		document.getElementById('puntaje2').value = blancas;
	} else {
		document.getElementById('puntaje2').value = negras;
		document.getElementById('puntaje1').value = blancas;
	}
}

function setJugadorActivo(jugadorActivo) {
	if (localStorage.getItem('idJugador') == 1) {
		if (jugadorActivo == 1) {
			jugadorActivo = 2;
		} else {
			jugadorActivo = 1;
		}
	}
	if (jugadorActivo == 1) {
		document.getElementById('info1').classList.add('jugadorActivo');
		document.getElementById('info2').classList.remove('jugadorActivo');
	} else {
		document.getElementById('info2').classList.add('jugadorActivo');
		document.getElementById('info1').classList.remove('jugadorActivo');
	}
}

function setNicknames(negras, blancas) {
	if (localStorage.getItem('idJugador') == 1) {
		document.getElementById('nombre1').value = blancas;
		document.getElementById('nombre2').value = negras;
	} else {
		document.getElementById('nombre1').value = negras;
		document.getElementById('nombre2').value = blancas;
	}
}

function posicionIncorrecta(id) {
	// animacion cuando el jugador hace click en un casillero incorrecto
	reproducirAudio('./sounds/colocarFichaIncorrecto.wav', 0.1);
	let casilla = document.getElementById(id);
	casilla.classList.add('incorrecto');
	casilla.addEventListener('animationend', finDeAnimacionPosIncorrecta, false);
}

function finDeAnimacionPosIncorrecta() {
	// borrar animacion
	this.classList.remove('incorrecto');
}

function botonFullscreen() {
	toggleFullScreen();
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.body.requestFullscreen();
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
}

document.addEventListener('keypress', function (event) {
	if (event.key === 'f' || event.key === 'F') {
		toggleFullScreen();
	}
});
