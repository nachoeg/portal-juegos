detectarPartidaEnJuego();
cargarSalas();

function detectarPartidaEnJuego() {
	let idPartida = localStorage.getItem('idPartidaReversi');
	if (idPartida !== null) {
		let boton = document.getElementById('botonPartidaEnJuego');
		boton.style.display = 'block';
		boton.href = '/reversi?idPartida=' + idPartida;
		boton = document.getElementById('botonAbandonarPartida');
		boton.style.display = 'block';
	}
}

function abrirSala(idPartida) {
	if (localStorage.getItem('idPartidaReversi') == idPartida) {
		//Si es la misma que creo
		location.replace('/reversi?idPartida=' + idPartida);
		return;
	}
	if (localStorage.getItem('idPartidaReversi') === null) {
		//Si no hay registros de nada
		fetch(
			'/reversi/unirse-a-partida?idPartida=' +
				idPartida +
				'&nickname=' +
				localStorage.getItem('nickname')
		)
			.then((response) => isResponseOk(response))
			.then((datos) => {
				if (!datos.ok) {
					throw new ErrorSala(datos.codigo, datos.motivo);
				} else {
					localStorage.setItem('idPartidaReversi', idPartida);
					localStorage.setItem(
						'codigoDeSeguridadReversi',
						datos.codigoDeSeguridad
					);
					localStorage.setItem('idJugador', datos.idJugador);
					location.replace('/reversi?idPartida=' + idPartida);
				}
			})
			.catch((error) => {
				alerta(
					`Ocurrió un error`,
					`Código de error ${error.status}: ${error.statusText}`
				);
			});
	} else {
		alerta(
			'Tienes una partida en progreso',
			'Debe abandonar la partida para ingresar a una nueva.'
		); // deberia aparecer un cartel que pregunte si desea abandonar la partida y unirse a una nueva
	}
}

function cargarSalas() {
	let listaSalas = document.getElementById('listaSalas');
	fetch('/reversi/cargarSalas')
		.then((respuesta) => respuesta.json())
		.then((arreglo) =>
			arreglo.forEach((sala) => {
				if (arreglo.length !== 0) {
					document.getElementById('salasPlaceholder').style.display = 'none';
					let li = document.createElement('li');
					li.innerHTML = sala.nombreSala;
					li.onclick = () => abrirSala(sala.idPartida);
					listaSalas.appendChild(li);
				}
			})
		);
}

function crearSala() {
	let nombreSala = document.getElementById('nombreSala').value;
	if (nombreSala.split(' ').join('') == '') {
		alerta(`Debe ingresar un nombre de sala valido`, `Intente nuevamente.`);
		return;
	}
	if (localStorage.getItem('idPartidaReversi') !== null) {
		alerta(
			`Ya tiene una partida creada`,
			`Debe abandonar la partida para crear una nueva.`
		);
		return;
	}
	let disco = document.querySelector('#discoSalas').className;
	let idJugador;
	if (disco == 'discoNegro') {
		idJugador = 1;
	} else {
		idJugador = 2;
	}
	fetch(
		'/reversi/crearPartida?nombreSala=' +
			nombreSala +
			'&nickname=' +
			localStorage.getItem('nickname') +
			'&idJugador=' +
			idJugador
	)
		.then((respuesta) => respuesta.json())
		.then((datos) => {
			localStorage.setItem('idPartidaReversi', datos.id);
			localStorage.setItem('codigoDeSeguridadReversi', datos.codigoDeSeguridad);
			localStorage.setItem('idJugador', idJugador);
			location.replace('/reversi?idPartida=' + datos.id);
		})
		.catch((error) => {
			alerta(
				`Ocurrió un error`,
				`Código de error ${error.status}: ${error.statusText}`
			);
		});
}

function cambiarDisco() {
	let disco = document.querySelector('#discoSalas');
	disco.classList.toggle('discoNegro');
	disco.classList.toggle('discoBlanco');
}

function ErrorSala(codigo, motivo) {
	this.status = codigo;
	this.statusText = motivo;
}

let input = document.getElementById('nombreSala');
input.addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		document.getElementById('botonSala').click();
	}
});
