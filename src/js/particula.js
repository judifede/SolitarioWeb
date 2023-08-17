import viewportToPixels, { getRandomColor } from "./utils.js";

export var TIPO_PARTICULA = {
  fuegos_artificiales: "fuegos_artificiales",
  lluvia: "lluvia",
};
var particulasCreadas = 0;
var numParticulas = 0;
var gravedad;
var numHijos;
var movimientosYHijo;
var movimientosXHijo;
export var timeoutCrearParticulaPadre;
export var timeoutMoverParticulaPadre;


export function start_particula(particula_select) {
  if (particula_select == TIPO_PARTICULA.fuegos_artificiales) {
    movimientosYHijo = [
      -5, -5, 0, 5, 5, 5, 0, -5, -5, -5, 0, 5, 5, 5, 0, -5, -5, -5, 0, 5, 5, 5,
      0, -5,
    ];
    movimientosXHijo = [
      0, -5, -5, -5, 0, 5, 5, 5, 0, -5, -5, -5, 0, 5, 5, 5, 0, -5, -5, -5, 0, 5,
      5, 5,
    ];
    gravedad = 0.3;
    numHijos = 24;
    numParticulas = 50;
  } else if (particula_select == TIPO_PARTICULA.lluvia) {
    gravedad = 0.05;
    numParticulas = 100;
  }

  crearParticulaPadre(particula_select);
  moverParticulaPadre(particula_select);
}

function crearParticulaPadre(particula_select) {
  if (particulasCreadas < numParticulas) {
    var particula = document.createElement("div");
    particula.className = "particula";

    if (particula_select == TIPO_PARTICULA.fuegos_artificiales) {
      var ejeY = window.innerHeight;
      var movimientoYPadre = -10 - Math.random() * 12; //Sube la partícula
      particula.setAttribute("data-padre", "true");

      particula.style.background = getRandomColor();
    } else if (particula_select == TIPO_PARTICULA.lluvia) {
      var ejeY = 0;
      var movimientoYPadre = 10 + Math.random() * 5; //Baja la partícula

      var colores_lluvia = ["#00506E", "#009BBF", "#017DA3"];
      particula.style.background = colores_lluvia[Math.floor(Math.random() * 3)];

      particula.className = "particula lluvia";
    }

    var ejeX =
      Math.random() * (window.innerWidth - viewportToPixels("20vw") - 1) +
      viewportToPixels("10vw");

    particula.style.top = ejeY + "px";
    particula.style.left = ejeX + "px";

    particula.setAttribute("data-movimiento-y", movimientoYPadre);
    particula.setAttribute("data-movimiento-x", "0");

    document.getElementsByTagName("body")[0].append(particula);
    particulasCreadas++;

    //Se lanza el siguiente
    timeoutCrearParticulaPadre =  setTimeout(crearParticulaPadre.bind(null, particula_select), 50 + Math.random() * 100);
  }
}

function moverParticulaPadre(particula_select) {
  var particulas = document.getElementsByClassName("particula");
  for (var p = 0; p < particulas.length; p++) {
    var particula = particulas[p];

    var movimientoYPadreActual = parseFloat(
      particula.getAttribute("data-movimiento-y")
    );

    movimientoYPadreActual += gravedad;

    particula.setAttribute("data-movimiento-y", movimientoYPadreActual);

    var movimientoXPadreActual = parseFloat(
      particula.getAttribute("data-movimiento-x")
    );

    //Desplaza verticalmente
    var top = particula.style.top ? particula.style.top : "0";
    top = parseFloat(top.replace("px", ""));
    top += movimientoYPadreActual;
    particula.style.top = top + "px";

    //Desplaza horizontalmente
    var left = particula.style.left ? particula.style.left : "0";
    left = parseFloat(left.replace("px", ""));
    left += movimientoXPadreActual;
    particula.style.left = left + "px"; 

    var padre = particula.getAttribute("data-padre");

    if (
      particula_select == TIPO_PARTICULA.fuegos_artificiales &&
      movimientoYPadreActual >= 0 &&
      padre === "true"
    ) {
      //if (top <= viewportToPixels("35vh") && padre === "true") {
      explotar(particula);
    }

    //Borramos la particula del DOM cuando salga del borde de la ventana aunque se "desaparezca" con la animación antes
    if (top > window.innerHeight || left > window.innerWidth) {
      particula.remove();
    }
  }

  if (particulas.length > 0) {
    timeoutMoverParticulaPadre = setTimeout(moverParticulaPadre.bind(null, particula_select), 25);
  }

  if (particulas.length == 0) {
    reset_particulas();
  }
}

//Solo fuegos artificiales explota
function explotar(particula) {
  //TODO: Cambiar modos de explotar.

  for (var h = 0; h < numHijos; h++) {
    var hijo = document.createElement("div");
    hijo.className = "particula explotada";

    hijo.style.top = particula.style.top;
    hijo.style.left = particula.style.left;
    hijo.style.background = particula.style.background;

    var movimientoYHijo = movimientosYHijo[h] + Math.random() * 10 - 5;
    hijo.setAttribute("data-movimiento-y", movimientoYHijo);
    var movimientoXHijo = movimientosXHijo[h] + Math.random() * 10 - 5;
    hijo.setAttribute("data-movimiento-x", movimientoXHijo);

    hijo.setAttribute("data-padre", false);

    //Agregar el hijo
    document.getElementsByTagName("body")[0].append(hijo);
  }

  particula.remove();
}

export function reset_particulas() {
  particulasCreadas = 0;
}
