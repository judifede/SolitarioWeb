
var xInitial, yInitial;
var xOriginal, yOriginal;
var is_pressed = false;
var element_id;
var z_index = 10;
var is_discarted;
var element;
var position;
var stack_discard_is_empty = true;

//Eventos
$(document).ready(function () {
    document.addEventListener("mousemove", mouse_moved);

    $(".carts")
        .bind("mouseup", mouse_released)
        .bind("mousedown", mouse_pressed);


});

//onMouseDown
function mouse_pressed(evt) {
    //Obtener la posición de inicio
    xInitial = evt.clientX;
    yInitial = evt.clientY;
    element_id = this.id;
    element = document.getElementById(element_id);
    var original_position = get_position(element);    
    yOriginal = original_position[0];
    xOriginal = original_position[1];
    is_pressed = true;
}

//onMouseMove
function mouse_moved(evt) {
    if (is_pressed) {
        //Calcular la diferencia de posición
        var xActual = evt.clientX;
        var yActual = evt.clientY;
        
        var xFinal = xActual - xInitial;
        var yFinal = yActual - yInitial;
        xInitial = xActual;
        yInitial = yActual;
        //Establecer la nueva posición
        position = get_position(element);
        element.style.top = (position[0] + yFinal) + "px";
        element.style.left = (position[1] + xFinal) + "px";
        
        // Esquinas:
        // 430 X 365 Y, 530 X 365 Y, 430 X 510 Y, 530 X 510 Y
        // Hay que tener en cuenta el width (100px) y el height (140px) que les hemos puesto a las cartas. 
        // Al restar y sumar, mínimos y máximos, sabremos si hay un "choque" con -> 330-530 X, 225-510 Y.
        is_discarted = is_discard();
    }
}

function is_discard(){
    if (position[0] <= 510 && position[0] >= 225 && position[1] <= 530 && position[1] >= 330) {
        return true;
    } else {
        return false;
    }
}
//onMouseUp
function mouse_released() {
    is_pressed = false;
    if(is_discarted){
        document.getElementById(element_id).classList.add("stack_discard");
        z_index++;
        document.getElementById(element_id).style.zIndex = z_index;
        $('.stack_discard').removeClass("empty");
    }else{
        element.style.top = yOriginal + "px";
        element.style.left = xOriginal + "px";
    }
}

/*
 * Función para obtener la posición en la que se encuentra el
 * elemento indicado como parámetro.
 * Retorna un array con las coordenadas x e y de la posición
 * Las líneas con los métodos getComputedStyle y getPropertyValue sirven para acceder a los estilos del elemento
 */
function get_position(element) {
    var position = new Array(2);
    position[0] = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("top"));
    position[1] = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("left"));
    return position;
}

//Lógica del juego

$(document).ready(function () {
    
    $(window).on('load', function () {
		first_flop();
    });
    
    $(".deck").click(function () {

    });


});

var array_deck =
["copa1", "copa2", "copa3", "copa4", "copa5", "copa6", "copa7", "copa10", "copa11", "copa12",
"oro1", "oro2", "oro3", "oro4", "oro5", "oro6", "oro7", "oro10", "oro11", "oro12",
"espada1", "espada2", "espada3", "espada4", "espada5", "espada6", "espada7", "espada10", "espada11", "espada12",
"basto1", "basto2", "basto3", "basto4", "basto5", "basto6", "basto7", "basto10", "basto11", "basto12"];


function first_flop(){
    
    $('.reverse_aux').addClass("flip");        
    $('#carta_up1').addClass("flip").attr('src', path_carta());
    $('#carta_up2').addClass("flip").attr('src', path_carta());
    $('#carta_up3').addClass("flip").attr('src', path_carta());
  
}

function path_carta(){
    return "spanish-deck/" + random_cart() + ".jpg";
}

function random_cart(){
    var position_aleatoria = Math.floor(Math.random()*array_deck.length);
    return array_deck.splice(position_aleatoria, 1);
}

function new_cart_from_deck(){

}