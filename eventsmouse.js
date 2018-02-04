$(document).ready(function () {
    document.addEventListener("mousemove", ratonMovido);

    $(".estiloCuadro")
        .bind("mouseup", ratonSoltado)
        .bind("mousedown", ratonPulsado);
});


var xInic, yInic;
var estaPulsado = false;
var elemId;

function ratonPulsado(evt) {
    //Obtener la posición de inicio
    xInic = evt.clientX;
    yInic = evt.clientY;
    elemId = this.id;
    estaPulsado = true;
}

function ratonMovido(evt) {
    if (estaPulsado) {
        //Calcular la diferencia de posición
        var xActual = evt.clientX;
        var yActual = evt.clientY;
        var xInc = xActual - xInic;
        var yInc = yActual - yInic;
        xInic = xActual;
        yInic = yActual;

        //Establecer la nueva posición
        var elemento = document.getElementById(elemId);
        var position = getPosicion(elemento);
        elemento.style.top = (position[0] + yInc) + "px";
        elemento.style.left = (position[1] + xInc) + "px";
    }
}

function ratonSoltado() {
    estaPulsado = false;
}

/*
 * Función para obtener la posición en la que se encuentra el
 * elemento indicado como parámetro.
 * Retorna un array con las coordenadas x e y de la posición
 * Las líneas con los métodos getComputedStyle y getPropertyValue sirven para acceder a los estilos del elemento
 */
function getPosicion(elemento) {
    var posicion = new Array(2);
    posicion[0] = parseInt(document.defaultView.getComputedStyle(elemento, null).getPropertyValue("top"));
    posicion[1] = parseInt(document.defaultView.getComputedStyle(elemento, null).getPropertyValue("left"));
    return posicion;
}