cargarNickname();

function generadorNicknameRandom() {
	var result = '';
	var characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < 8; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	console.log(result);
	return result;
}

function cargarNickname() {
	//si no hay un local storage del nickname crea uno aleatorio y lo pone en el input
	let nickname = localStorage.getItem('nickname');
	console.log(nickname);
	if (nickname === null) {
		document.getElementById('nicknameInput').value = generadorNicknameRandom();
	} else {
		document.getElementById('nicknameInput').value = nickname;
	}
}

function guardarNickname() {
	//cuando se presiona en un juego se guarda el input en el local storage como nuevo nickname
	nickname = document.getElementById('nicknameInput').value;
	if (nickname === '') {
		nickname = generadorNicknameRandom();
	}
	localStorage.setItem('nickname', nickname);
}
