cargarFondo();

function cargarFondo() {
	let background = localStorage.getItem('background');
	let darkmode = localStorage.getItem('darkmode');
	if (background === null) {
		document.querySelector('.container').style.backgroundColor = '#f3f3f3';
	} else {
		document.querySelector('.container').style.background = background;
		if (darkmode === 'yes') {
			document.body.style.color = 'white';
		} else {
			document.body.style.color = 'black';
		}
	}
}

function cambiarTema(background, darkmode) {
	localStorage.setItem('background', background);
	localStorage.setItem('darkmode', darkmode);
	cargarFondo();
}

const isResponseOk = (response) => {
	if (!response.ok) {
		return Promise.reject({
			status: response.status,
			statusText: response.statusText,
		});
	}
	return response.json();
};

function reproducirAudio(direccion, volumen) {
	let audio = new Audio(direccion);
	audio.volume = volumen;
	audio.play();
}

function alerta(titulo, mensaje) {
	let alertaDiv = document.createElement('div');
	let closeBtn = document.createElement('span');
	let tituloStr = document.createElement('strong');
	let msj = document.createTextNode(mensaje);
	document.body.appendChild(alertaDiv);
	alertaDiv.classList.add('alert');
	closeBtn.classList.add('closeBtn');
	closeBtn.innerHTML = '&times;';
	closeBtn.onclick = () => (alertaDiv.style.display = 'none');
	tituloStr.innerText = titulo;
	alertaDiv.appendChild(closeBtn);
	alertaDiv.appendChild(tituloStr);
	alertaDiv.appendChild(msj);
	setTimeout(() => {
		alertaDiv.classList.add('desaparecer');
	}, 5000);
	setTimeout(() => {
		alertaDiv.style.display = 'none';
	}, 5300);
}

function desaparecerModal(modal) {
	if (modal.style.display == 'block') {
		modalContent = modal.firstElementChild;
		modalContent.classList.add('desaparecer');
		modal.classList.add('desvanecerModal');
		setTimeout(() => {
			modal.style.display = 'none';
			modal.classList.remove('desvanecerModal');
			modalContent.classList.remove('desaparecer');
		}, 400);
	}
}

function abandonarPartida() {
	fetch(
		'/reversi/abandonar?idPartida=' +
			localStorage.getItem('idPartidaReversi') +
			'&idJugador=' +
			localStorage.getItem('idJugador')
	)
		.then(finalizarPartida('Has perdido!', 'Abandonaste la partida.', false))
		.catch((error) => {
			alerta(
				`No fue posible abandonar la partida`,
				`Intente nuevamente. ${error.status}: ${error.statusText}`
			);
		});
}

function confirmarAbandonar() {
	let modal = document.getElementById('confirmarAbandono');
	modal.style.display = 'block';
	let close = document.querySelector('#cerrarConfirmarAbandono');
	let boton = document.querySelector('#botonConfirmarAbandono');

	boton.onclick = function () {
		desaparecerModal(modal);
		setTimeout(() => {
			abandonarPartida();
		}, 200);
	};

	close.onclick = function () {
		desaparecerModal(modal);
	};

	window.onclick = function (event) {
		if (event.target == modal) {
			desaparecerModal(modal);
		}
	};
}

function finalizarPartida(resultado, motivo, victoria) {
	localStorage.removeItem('idPartidaReversi');
	localStorage.removeItem('codigoDeSeguridadReversi');

	if (victoria) {
		reproducirAudio('./sounds/victoria.wav', 0.4);
	} else {
		reproducirAudio('./sounds/derrota.wav', 0.4);
	}

	let modal = document.getElementById('finalPartida');
	document.getElementById('resultado').innerText = resultado;
	document.getElementById('motivo').innerText = motivo;
	modal.style.display = 'block';

	let close = document.getElementById('cerrarFinalPartida');
	close.onclick = function () {
		desaparecerModal(modal);
	};

	window.onclick = function (event) {
		if (event.target == modal) {
			desaparecerModal(modal);
		}
	};
}
