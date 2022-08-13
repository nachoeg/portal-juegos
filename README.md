# Portal de juegos

Proyecto propuesto por la materia de **Seminario de Lenguajes: JS** por la [**Facultad de Informática de la UNLP**](https://www.info.unlp.edu.ar/), con el fin de aprender a como armar una aplicación, tanto desde el front-end como desde el back-end.

## Probar la aplicación

### Online

La aplicación esta desplegada en Heroku, en una cuenta gratis, y por lo tanto no tiene un buen rendimiento.

Ingresar al siguiente [**link**](https://portal-juegos.herokuapp.com/).

### Local (recomendada)

Tiene un mejor rendimiento, ya que no requiere de un servidor. Requiere tener instalado **Node.js** y **NPM**.

Los pasos para correr la aplicación:

1. Clonar el repositorio.
2. Instalar dependencias `npm install`.
3. Correr la aplicación `npm start`.
4. Abrir [**app**](http://localhost:3000/).

## Fotos

![Pagina de inicio](https://i.imgur.com/EzQGy3T.png)
![Salas](https://i.imgur.com/4wxnGeY.png)
![Reversi](https://i.imgur.com/cKgdzYn.png)
![Tema oscuro](https://i.imgur.com/E5tAf9Y.png)
![Tema clásico](https://i.imgur.com/p6k0Bbn.png)

## Consigna del Trabajo Práctico Integrador

Implemente un portal de juegos online como se describe a continuación.

El portal consta de una **página principal** que lista los juegos disponibles y permite acceder a cada uno de ellos para iniciar y jugar una partida.

Cada uno de los juegos tiene de 2 componentes:

- Una aplicación de front end que permite jugar desde el navegador.
- Una aplicación de back end implementada con nodejs que modela el juego con sus reglas y demás funcionalidades necesarias para permitir el desarrollo de una partida.

La comunicación entre ambas aplicaciones se realiza mediante una API REST.

Los juegos que deben implementarse son los que siguen.

- [Reversi](https://es.wikipedia.org/wiki/Reversi)
- [Batalla Naval](<https://es.wikipedia.org/wiki/Batalla_naval_(juego)>)

> El repositorio original cuenta con los dos juegos, sin embargo, en este repositorio solo estoy subiendo el Reversi, porque desde mi punto de vista, es el que esta más pulido de los dos (sin embargo ambos juegos no difieren mucho en funcionalidades).

### Consideraciones Generales

1. Todos los juegos se deben poder jugar normalmente de acuerdo a las reglas.
2. Las partidas deben poder ganarse, perderse o empatarse y el juego debe informar el resultado: ganador, perdedor, etc.
3. No debe ser posible hacer trampa o violar las reglas del juego usando las herramientas de desarrollo del navegador o invocando directamente a los servicios de la API REST. Por ejemplo, no puede ser posible que un mismo jugador coloque dos ﬁchas consecutivamente en el tablero del Reversi.
4. El trabajo debe ser desarrollado en grupo utilizando git. Los aportes de cada integrante del grupo deben verse reﬂejados en Gitlab.

### Consideraciones de la Aplicación de Back End

1. Debe estar implementada en Javascript usando nodejs teniendo en cuenta la posibilidad de que muchos jugadores se conecten y jueguen muchas partidas en forma simultánea.
2. Debe estar modularizada. Como mínimo es deseable que cada juego esté implementado en su propio módulo. En caso de tener funcionalidad común entre las implementaciones de dos o más módulos, esa funcionalidad puede ir en otro módulo que se comparta.
3. La API debe respetar los principios de una arquitectura REST.

### Consideraciones de la Aplicación de Front End

1. Si lo desea, puede utilizar librerías o frameworks para el desarrollo.
2. Ambos juegos requieren dos jugadores. Debe existir un mecanismo que permita a dos personas coordinarse para iniciar una partida entre sí.
3. Puede permitir continuar una partida luego de cerrar el navegador utilizando por ejemplo Cookies o LocalStorage.

## Funcionalidades extras

- Salas
- Seleccion de temas (claro, oscuro, clásico)
- Diseño responsive
- Ayudas con posibles movimientos
- Animaciones
- Sonidos
- Fullscreen

## Tecnologias usadas

- HTML, CSS (sin librerias ni frameworks)
- Bootstrap icons
- Javascript
- NodeJS
- ExpressJS
