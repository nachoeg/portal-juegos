module.exports = {
    validarCasillero: validarCasillero,
    movimientosRestantes: movimientosRestantes,
    posiblesCambios: posiblesCambios
};

const CASILLA_VACIA = 0;
const negras = 1;
const blancas = 2;


//recibe por parametro el archivo y el jugador al que se le quieren contar las fichas
function contarFichas(situacion,jugador){
    let i = 0;
    let fichas = 0;
    let tablero = situacion.estado.tablero;

    while (i < parseInt(situacion.tamanioTablero)){
        let j = 0;
        while (j < parseInt(situacion.tamanioTablero)){
            
            if (tablero[i][j] == jugador){
                fichas++;
            }

            j++;
        }
        i++;
    }

    return fichas;
}
function movimientosRestantes(situacion){
    //situacion es la informacion de la partida actualmente
    let i = 0;

    var sinMovimientos = true;
    

    while ((i < parseInt(situacion.tamanioTablero)) && (sinMovimientos)){
        let j = 0;
        while ((j < parseInt(situacion.tamanioTablero)) && (sinMovimientos)){
            console.log("---------------------------------------------");
            console.log("CASILLA en posicion: ("+i+ ", "+j+")");
            let auxFilaArriba = hayMovimientosArriba(i,j,situacion);
            
            if(auxFilaArriba != -1){
                console.log("Hay movimientos arriba");
            }
            
            let auxFilaAbajo = hayMovimientosAbajo(i,j,situacion);

            if(auxFilaAbajo != -1){
                console.log("Hay movimientos abajo");
            }

            let auxColumnaDerecha = hayMovimientosDerecha(i,j,situacion) ;

            if(auxColumnaDerecha != -1){
                console.log("Hay movimientos derecha");
            }

            let auxColumnaIzquierda = hayMovimientosIzquierda(i,j,situacion) ;

            if(auxColumnaIzquierda != -1){
                console.log("Hay movimientos izquierda");
            }

            let auxSuperiorDerecho = hayMovimientosDiagonalArribaDerecha(i,j,situacion) ;

            if(auxSuperiorDerecho != -1){
                console.log("Hay movimientos diagonal arriba derecha");
            }

            let auxInferiorIzquierdo = hayMovimientosDiagonalAbajoIzquierda(i,j,situacion) ;

            if(auxInferiorIzquierdo != -1){
                console.log("Hay movimientos diagonal abajo izquierda");
            }

            let auxInferiorDerecho = hayMovimientosDiagonalAbajoDerecha(i,j,situacion) ;
            
            if(auxInferiorDerecho != -1){
                console.log("Hay movimientos diagonal abajo derecha");
            }

            let auxSuperiorIzquierdo = hayMovimientosDiagonalArribaIzquierda(i,j,situacion) ;

            if(auxSuperiorIzquierdo != -1){
                console.log("Hay movimientos diagonal arriba izquierda");
            }
            
            sinMovimientos = ((auxFilaAbajo == -1) && (auxFilaArriba == -1)
                    && (auxColumnaDerecha == -1) && (auxColumnaIzquierda == -1)
                    && (auxInferiorIzquierdo == -1) && (auxSuperiorDerecho == -1)
                    && (auxInferiorDerecho == -1) && (auxSuperiorIzquierdo == -1));
            j++;

            if (sinMovimientos){
                console.log("No hay movimientos");
            }

            console.log("---------------------------------------------");
        }
        i++;
    }
    //sinMovimientos es true si todas las busquedas dieron sin movimientos posibles
    //y es false si todas al menos se encontró un movimiento 
    return !sinMovimientos;
}


//situacion es el json completo!
function validarCasillero(fila, columna, situacion){

    let resultado = situacion.estado.tablero;
    let pude= false;
    //validar que la fila y la columna sean validas
    //si la casilla está ocupada, se retorna falso
    if (resultado[fila][columna]!= CASILLA_VACIA){
        return {"ok": pude, "tablero": situacion};
    }

    let auxFilaArriba = hayMovimientosArriba(fila,columna,situacion);
    let auxFilaAbajo = hayMovimientosAbajo(fila,columna,situacion);

    let auxColumnaDerecha = hayMovimientosDerecha(fila,columna,situacion) ;
    let auxColumnaIzquierda = hayMovimientosIzquierda(fila,columna,situacion) ;

    let auxInferiorIzquierdo = hayMovimientosDiagonalAbajoIzquierda(fila,columna,situacion) ;
    let auxSuperiorDerecho = hayMovimientosDiagonalArribaDerecha(fila,columna,situacion) ;

    let auxInferiorDerecho = hayMovimientosDiagonalAbajoDerecha(fila,columna,situacion) ;
    let auxSuperiorIzquierdo = hayMovimientosDiagonalArribaIzquierda(fila,columna,situacion) ;

    if((auxFilaArriba != -1) | (auxFilaAbajo != -1)){
      pude = true;  
      modificarFichasVertical(fila,columna,situacion, auxFilaAbajo, auxFilaArriba);
    }

    if((auxColumnaDerecha != -1)|(auxColumnaIzquierda != -1)){
      pude = true;  
      modificarFichasHorizontal(fila,columna,situacion, auxColumnaDerecha, auxColumnaIzquierda);
    }
    
    if((auxInferiorIzquierdo != -1)|(auxSuperiorDerecho != -1)|(auxInferiorDerecho != -1)|(auxSuperiorIzquierdo != -1)){
      pude = true;
      modificarFichasDiagonal(fila,columna,situacion, auxSuperiorDerecho, auxInferiorIzquierdo, auxInferiorDerecho, auxSuperiorIzquierdo);
    }
    
    if (pude) { 
        //si  accedí acá, es porque tenia movimientos, 
        //dejo el flag en cero
        situacion.jugadorSinMovimientos = 0;
        situacion.estado.turno++;
        situacion.estado.jugador = (situacion.estado.turno % 2 == 0) ? blancas : negras;
        situacion.jugadores.negras.datosPublicos.fichas = contarFichas(situacion, negras);
        situacion.jugadores.blancas.datosPublicos.fichas = contarFichas(situacion, blancas);
    }
        return {"ok": pude, "tablero": situacion};

}


function hayMovimientosAbajo(fila, columna, situacion){
    let f = parseInt(fila);
    let auxFila = -1;
    //mientras encuentre fichas del color del jugador contrario (ni casilla vacia ni casilla de mi jugador Actual)
    let table = situacion.estado.tablero;
    while ((f+1 != situacion.tamanioTablero)&&(table[f+1][columna] != CASILLA_VACIA)&&(table[f+1][columna] != situacion.estado.jugador)){
        //me muevo verticalmente
        f++;
    }
    //si salí del while porque encontré una ficha de mi mismo color, me quedo con el numero de fila
    //para despues hacer las modificaciones de colores
    if((table[fila][columna] == CASILLA_VACIA)&&(f+1 != situacion.tamanioTablero)&&(f != fila)&&(table[f+1][columna] == situacion.estado.jugador)){
        auxFila = f; //CHEQUEO DE REGLAS: No aumento en 1 porque es hasta la ficha anterior a la negra. en f+1 hay una de mi color actual
    }
    return auxFila;
}

function hayMovimientosArriba(fila, columna, situacion){
    let f = parseInt(fila);
    let auxFila = -1;
    let table = situacion.estado.tablero;
    //búsqueda de fichas del color del jugador contrario--hacia arriba
    while ((f-1 != -1)&&(table[f-1][columna] != CASILLA_VACIA)&&(table[f-1][columna] != situacion.estado.jugador)){
        //me muevo verticalmente
        f--;
    }
    //si salí del while porque no me cai del tablero, porque encontré una ficha de mi mismo color y la ficha de mi mismo color no está en la posicion contigua
    if((table[fila][columna] == CASILLA_VACIA)&&(f-1 != -1)&&(f != fila)&&(table[f-1][columna] == situacion.estado.jugador)){
        auxFila = f; //CHEQUEO DE REGLAS: No aumento en 1 porque es hasta la ficha anterior a la negra. en f+1 hay una de mi color actual
    }

    return auxFila;
}


function modificarFichasVertical(fila, columna,situacion,  auxFilaAbajo, auxFilaArriba){
    let table = situacion.estado.tablero;
    let fichasModificadas = 0;

    //modificar abajo
    if (auxFilaAbajo != -1){
        for (let i = fila; i<= auxFilaAbajo; i++){
            table[i][columna] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    //modificar arriba
    if (auxFilaArriba != -1){
        for (let i = auxFilaArriba; i<= fila; i++){
            table[i][columna] = situacion.estado.jugador;
            fichasModificadas++;
        }

    }
    if((auxFilaAbajo != -1)&&(auxFilaArriba != -1)){
        //para no contar dos veces la ficha "nueva"
        fichasModificadas = fichasModificadas - 1;
    }


    situacion.estado.tablero = table;

    return situacion;
}


function hayMovimientosDerecha(fila,columna,situacion){
    let c = parseInt(columna);
    let auxColumna = -1;
    //mientras encuentre fichas del color del jugador contrario (ni casilla vacia ni casilla de mi jugador Actual)
    let table = situacion.estado.tablero;

    while ((c+1 != situacion.tamanioTablero)&&(table[fila][c+1] != CASILLA_VACIA)&&(table[fila][c+1] != situacion.estado.jugador)){
        //me muevo horizontalmente-hacia derecha
        c++;
    }
    //si salí del while porque encontré una ficha de mi mismo color
    if((table[fila][columna] == CASILLA_VACIA)&&(c+1 != situacion.tamanioTablero)&&(c != columna)&&(table[fila][c+1] == situacion.estado.jugador)){
        auxColumna = c;
    }
    return auxColumna;
}

function hayMovimientosIzquierda(fila,columna,situacion){
    //búsqueda de fichas del color del jugador contrario (hacia izquierda)
    let table = situacion.estado.tablero;
    let c = parseInt(columna);
    let auxColumna = -1;
    while ((c-1 != -1)&&(table[fila][c-1] != CASILLA_VACIA)&&(table[fila][c-1] != situacion.estado.jugador)){
        //me muevo horizontalmente-hacia izquierda
        c--;
    }
    //si salí del while porque encontré una ficha de mi mismo color
    if((table[fila][columna] == CASILLA_VACIA)&&(c-1 != -1)&&(c != columna)&&(table[fila][c-1] == situacion.estado.jugador)){
        auxColumna = c;
    }

    return auxColumna;
}

function modificarFichasHorizontal(fila,columna,situacion, auxColumnaDer, auxColumnaIzq){
    let table = situacion.estado.tablero;
    let fichasModificadas = 0;

    if (auxColumnaDer != -1){
        for (let i = columna; i<= auxColumnaDer; i++){
            table[fila][i] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    if (auxColumnaIzq != -1){
        for (let i = auxColumnaIzq; i<= columna; i++){
            table[fila][i] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    
    if((auxColumnaIzq != -1)&&(auxColumnaDer != -1)){
        //para no contar dos veces la ficha "nueva"
        fichasModificadas = fichasModificadas - 1;
    }

    
    situacion.estado.tablero = table;

    return situacion;
}

function hayMovimientosDiagonalAbajoIzquierda(fila,columna,situacion){
    let f = parseInt(fila);
    let c = parseInt(columna);

    let table = situacion.estado.tablero;
    let auxInferiorIzquierdo = -1;

    //mientras encuentre fichas del color del jugador contrario (ni casilla vacia ni casilla de mi jugador Actual)
    while ((f+1 != situacion.tamanioTablero) && (c-1 >= 0) && (table[f+1][c-1] != CASILLA_VACIA)&&(table[f+1][c-1] != situacion.estado.jugador)){
        //me muevo hacia abajo a la izquierda
        f++;
        c--;
    }

    //si salí del while porque encontré una ficha de mi mismo color
    if((table[fila][columna] == CASILLA_VACIA)&&(f+1 != situacion.tamanioTablero) && (c-1 >= 0)&&(f != fila)&&(c != columna)&&(table[f+1][c-1] == situacion.estado.jugador)){
        auxInferiorIzquierdo = f;
    }

    
    return auxInferiorIzquierdo;
}

function hayMovimientosDiagonalArribaDerecha(fila,columna,situacion){
//búsqueda de fichas del color del jugador contrario--hacia derecha
    let f = parseInt(fila);
    let c = parseInt(columna);
    let table = situacion.estado.tablero;
    let auxSuperiorDerecho = -1;
    while ((f-1 >= 0) && (c+1 != situacion.tamanioTablero) &&(table[f-1][c+1] != CASILLA_VACIA)&&(table[f-1][c+1] != situacion.estado.jugador)){
        //me muevo hacia arriba a la derecha
        f--;
        c++;
    }

    //si salí del while porque encontré una ficha de mi mismo color
    if((table[fila][columna] == CASILLA_VACIA)&&(f-1 >= 0) && (c+1 != situacion.tamanioTablero)&&(f != fila)&&(c != columna) &&(table[f-1][c+1] == situacion.estado.jugador)){
       auxSuperiorDerecho = f;
    }

    return auxSuperiorDerecho;
}


function hayMovimientosDiagonalAbajoDerecha(fila,columna,situacion){
    let f = parseInt(fila);
    let c = parseInt(columna);

    let table = situacion.estado.tablero;
    let auxInferiorDerecho = -1;

    //mientras encuentre fichas del color del jugador contrario (ni casilla vacia ni casilla de mi jugador Actual)
    while ((f+1 != situacion.tamanioTablero) && (c+1 != situacion.tamanioTablero) && (table[f+1][c+1] != CASILLA_VACIA)&&(table[f+1][c+1] != situacion.estado.jugador)){
        //me muevo hacia abajo a la izquierda
        f++;
        c++;
    }

    //si salí del while porque encontré una ficha de mi mismo color
    if((table[fila][columna] == CASILLA_VACIA)&&(f+1 != situacion.tamanioTablero) && (c+1 != situacion.tamanioTablero)&&(f != fila)&&(c != columna)&&(table[f+1][c+1] == situacion.estado.jugador)){
        auxInferiorDerecho = f;
    }

    return auxInferiorDerecho;
}


function hayMovimientosDiagonalArribaIzquierda(fila,columna,situacion){
    //búsqueda de fichas del color del jugador contrario--hacia derecha
        let f = parseInt(fila);
        let c = parseInt(columna);
        let table = situacion.estado.tablero;
        let auxSuperiorIzquierdo = -1;
        while ((f-1 >= 0) && (c-1 >= 0) &&(table[f-1][c-1] != CASILLA_VACIA)&&(table[f-1][c-1] != situacion.estado.jugador)){
            //me muevo hacia arriba a la derecha
            f--;
            c--;
        }
    
        //si salí del while porque encontré una ficha de mi mismo color
        if((table[fila][columna] == CASILLA_VACIA)&&(f-1 >= 0) &&  (c-1 >= 0)&&(f != fila)&&(c != columna) &&(table[f-1][c-1] == situacion.estado.jugador)){
           auxSuperiorIzquierdo = f;
        }
        return auxSuperiorIzquierdo;
    }

function modificarFichasDiagonal(fila,columna,situacion, auxSuperiorDerecho, auxInferiorIzquierdo,auxInferiorDerecho, auxSuperiorIzquierdo){
    let table = situacion.estado.tablero;
    let fichasModificadas = 0;

    let f = parseInt(fila);
    let c = parseInt(columna);
    let limiteDiagInferiorIzquierdo = auxInferiorIzquierdo - fila;
    let limiteDiagSuperiorDerecho = fila - auxSuperiorDerecho;

    let limiteDiagInferiorDerecho = auxInferiorDerecho - fila;
    let limiteDiagSuperiorIzquierdo = fila - auxSuperiorIzquierdo;

    if (auxInferiorIzquierdo != -1){
        for (let i = 0; i<= limiteDiagInferiorIzquierdo; i++){
            table[f+i][c-i] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    
    if (auxSuperiorDerecho != -1){
        for (let i = 0; i<= limiteDiagSuperiorDerecho; i++){
            table[f-i][c +i] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    if (auxInferiorDerecho != -1){
        for (let i = 0; i<= limiteDiagInferiorDerecho; i++){
            table[f+i][c+i] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    if (auxSuperiorIzquierdo != -1){
        for (let i = 0; i<= limiteDiagSuperiorIzquierdo; i++){
            table[f-i][c -i] = situacion.estado.jugador;
            fichasModificadas++;
        }
    }

    let cambiosDiagonales = [auxInferiorDerecho, auxInferiorIzquierdo, auxSuperiorDerecho, auxSuperiorIzquierdo];
    let cantidadDeCambiosDiagonales = 0;
    cambiosDiagonales.forEach(element => {
        if (element == -1){
            cantidadDeCambiosDiagonales++;
        }
    });

    if(cantidadDeCambiosDiagonales > 1){
        fichasModificadas = fichasModificadas - (cantidadDeCambiosDiagonales -1);
    }

    
    situacion.estado.tablero = table;

    return situacion;
}


function posiblesCambios(fila, columna, situacion){

    let tablero = situacion.estado.tablero;
    let situacionAuxiliar = situacion;
    let pude= false;
    //validar que la fila y la columna sean validas
    //si la casilla está ocupada, se retorna falso
    if (tablero[fila][columna]!= CASILLA_VACIA){
        return {"ok": pude, "tablero": situacion};
    }

    let auxFilaArriba = hayMovimientosArriba(fila,columna,situacionAuxiliar);
    let auxFilaAbajo = hayMovimientosAbajo(fila,columna,situacionAuxiliar);

    let auxColumnaDerecha = hayMovimientosDerecha(fila,columna,situacionAuxiliar) ;
    let auxColumnaIzquierda = hayMovimientosIzquierda(fila,columna,situacionAuxiliar) ;

    let auxInferiorIzquierdo = hayMovimientosDiagonalAbajoIzquierda(fila,columna,situacionAuxiliar) ;
    let auxSuperiorDerecho = hayMovimientosDiagonalArribaDerecha(fila,columna,situacionAuxiliar) ;

    let auxInferiorDerecho = hayMovimientosDiagonalAbajoDerecha(fila,columna,situacionAuxiliar) ;
    let auxSuperiorIzquierdo = hayMovimientosDiagonalArribaIzquierda(fila,columna,situacionAuxiliar) ;

    if((auxFilaArriba != -1) | (auxFilaAbajo != -1)){
      pude = true;  
      modificarFichasVertical(fila,columna,situacionAuxiliar, auxFilaAbajo, auxFilaArriba);
    }

    if((auxColumnaDerecha != -1)|(auxColumnaIzquierda != -1)){
      pude = true;  
      modificarFichasHorizontal(fila,columna,situacionAuxiliar, auxColumnaDerecha, auxColumnaIzquierda);
    }
    
    if((auxInferiorIzquierdo != -1)|(auxSuperiorDerecho != -1)|(auxInferiorDerecho != -1)|(auxSuperiorIzquierdo != -1)){
      pude = true;
      modificarFichasDiagonal(fila,columna,situacionAuxiliar, auxSuperiorDerecho, auxInferiorIzquierdo, auxInferiorDerecho, auxSuperiorIzquierdo);
    }
    
    return {"ok": pude, "tablero": situacionAuxiliar};

}
