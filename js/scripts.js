var xInitial, yInitial;
var xOriginal, yOriginal;
var is_pressed = false;
var element_id;
var z_index = 40;
var is_discarted;
var element;
var position;
var stack_discard_is_empty = true;
var carts_to_reveal = 12;
var top_discarted_cart;

var array_deck = ["copa1", "copa2", "copa3", "copa4", "copa5", "copa6", "copa7", "copa10", "copa11", "copa12",
    "oro1", "oro2", "oro3", "oro4", "oro5", "oro6", "oro7", "oro10", "oro11", "oro12",
    "espada1", "espada2", "espada3", "espada4", "espada5", "espada6", "espada7", "espada10", "espada11", "espada12",
    "basto1", "basto2", "basto3", "basto4", "basto5", "basto6", "basto7", "basto10", "basto11", "basto12"
];

/*------------------------------------------------------Eventos------------------------------------------------------*/
$(document).ready(function () {
    document.addEventListener("mousemove", mouse_moved);

    $("#cart_up_tier1, #cart_up_tier2, #cart_up_tier3")
        .bind("mouseup", mouse_released)
        .bind("mousedown", mouse_pressed);


    //Options
    $(".open_instruccions").click(function () {
        $(".container_data_info").addClass("on");
        $(".instruccions").addClass("on");
    });

    $(".close_instruccions, .container_data_info").click(function () {
        $(".container_data_info").removeClass("on");
        $(".instruccions").removeClass("on");
    });

    $(".options_collapsed").click(function () {
        $(".options_expanded").toggleClass("collapse_anim expand_anim");
        if($(".options_expanded").hasClass("collapse_anim")){
            $(".arrow_with_circle").attr("src", "img/arrow_with_circle_down.svg");
        }else{
            $(".arrow_with_circle").attr("src", "img/arrow_with_circle_up.svg");
        }
    });
    //End Options

});

function events_on(cart_up_tier) {
    $("#" + cart_up_tier)
        .bind("mouseup", mouse_released)
        .bind("mousedown", mouse_pressed);
}

function events_down(cart_up_tier) {
    $("#" + cart_up_tier)
        .unbind("mouseup", mouse_released)
        .unbind("mousedown", mouse_pressed);
}

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

    //var pila = document.getElementsByClassName("stack_discard")[0];
    //console.log("--------------------- " + get_position(pila));

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
        // 205 X 305 Y, 305 X 305 Y, 205 X 450 Y, 305 X 450 Y
        // Hay que tener en cuenta el width (100px) y el height (140px) que les hemos puesto a las cartas. 
        // Al restar y sumar, mínimos y máximos, sabremos si hay un "choque" con -> 105-305 X, 165-450 Y.
        is_discarted = is_discard();
    }
}

function is_discard() {
    if (position[0] <= 450 && position[0] >= 165 && position[1] <= 305 && position[1] >= 105) {
        return true;
    } else {
        return false;
    }
}
//onMouseUp
function mouse_released() {
    is_pressed = false;
    if (is_discarted) {
        element.classList.add("stack_discard");
        z_index++;
        element.style.zIndex = z_index;
        events_down(element_id);
        reveal_next_cart();
    } else {
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
    var position = new Array(4);
    position[0] = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("top"));
    position[1] = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("left"));
    return position;
}

/*------------------------------------------------------End Eventos------------------------------------------------------*/

/*------------------------------------------------------Lógica del juego------------------------------------------------------*/

$(document).ready(function () {

    $(window).on('load', function () {
        first_flop();
    });

    $(".reverse_fixed, .carts_missing").click(function () {
        new_cart_from_deck();
    });



});

function create_reverse(cart_up) {
    var data_position = cart_up.attr("data-position");
    var cart_up_id = cart_up.attr("id");
    if (cart_up.hasClass("deck_cart")) {
        var deck_cart = $("<img>").attr({
                src: "img/dorso.jpg",
                alt: "Dorso Auxiliar"
            })
            .attr("data-position", data_position).addClass("carts deck_reverse");
        deck_cart.insertAfter(document.getElementsByClassName("deck_cart")[0]);
    } else {
        var reverse_helper = $("<img>").attr({
                src: "img/dorso.jpg",
                alt: "Dorso Auxiliar"
            })
            .attr("data-position", data_position).addClass("carts reverse_helper");
        reverse_helper.insertAfter($('#' + cart_up_id));
    }
}

function first_flop() {

    $('.reverse_helper').addClass("flip");
    $('#cart_up_tier1').addClass("flip").attr('src', path_cart());
    $('#cart_up_tier2').addClass("flip").attr('src', path_cart());
    $('#cart_up_tier3').addClass("flip").attr('src', path_cart());
    new_cart_from_deck();

    setTimeout(function () {
        $('.stack_discard').removeClass("empty");
    }, 1550);

}

function path_cart() {
    return "spanish-deck/" + random_cart() + ".jpg";
}

function random_cart() {
    var position_aleatoria = Math.floor(Math.random() * array_deck.length);
    return array_deck.splice(position_aleatoria, 1);
}

function new_cart_from_deck() {
    var carts_missing = document.getElementsByClassName("carts_missing")[0].innerHTML;

    if (carts_missing > 0) {

        var deck_cart = $("<img>").attr({
                src: path_cart(),
                alt: "Nueva Carta",
                style: "z-index: " + z_index
            })
            .addClass("carts deck_cart");
        z_index++;
        deck_cart.insertAfter(document.getElementsByClassName("carts_missing")[0]);
        carts_missing--;
        document.getElementsByClassName("carts_missing")[0].innerHTML = carts_missing;
        create_reverse($('.deck_cart'));
        $('.deck_reverse, .deck_cart').addClass("new_cart");
    }

    if (carts_missing == 0) {
        $('.reverse_fixed').remove();
        $('.carts_missing').remove();
        $('.deck').addClass("empty");
    }

    //Desactivamos temporalmente el onclick para evitar que se haga clic muchas veces seguidas. (600, 100 ms más que la animación)
    setTimeout(function () {
        $(".reverse_fixed, .carts_missing").bind("click", function () {
            new_cart_from_deck();
        });
    }, 600);
    $(".reverse_fixed, .carts_missing").unbind("click");

}

function cart_can_go_to_stack_discard() {
    // is_discarted es true [onMouseUp]
    if (is_discarted) {

        var actual_cart = element;




    }
}

function reveal_next_cart() {

    // 
    //var cart_can_go_to_stack_discard = cart_can_go_to_stack_discard(); Cuando cart_can_go_to_stack_discard funcione, descomentar
    if (is_discarted) {
        carts_to_reveal--;
        var tier_position = element.getAttribute("data-position");
        var tier = element_id.substring(element_id.length - 1, element_id.length);

        // borrar elemento reverse_helper,
        $(".tier" + tier + " .reverse_helper").remove();

        // quitar id de su tier,
        element.setAttribute("alt", "Carta Descartada");
        element.removeAttribute("id");

        if (tier_position > 1) {
            // crear reverse_helper ,  
            create_reverse($(".tier" + tier + " img[data-position='" + parseInt(tier_position - 1) + "']"));

            // añadir id de su tier,
            $(".tier" + tier + " .hide[data-position='" + parseInt(tier_position - 1) + "']").attr({
                id: "cart_up_tier" + parseInt(tier),
                alt: "Carta Boca Arriba"
            }).removeClass("hide");


            // animacion voltear de la carta anterior,
            setTimeout(function () {
                $('.reverse_helper').addClass("flip");

                switch (tier) {
                    case "1":
                        $('#cart_up_tier1').addClass("flip").attr('src', path_cart());
                        events_on("cart_up_tier1");
                        break;
                    case "2":
                        $('#cart_up_tier2').addClass("flip").attr('src', path_cart());
                        events_on("cart_up_tier2");
                        break;
                    case "3":
                        $('#cart_up_tier3').addClass("flip").attr('src', path_cart());
                        events_on("cart_up_tier3");
                        break;
                    default:
                        break;
                }
            }, 200);
        }

        if (carts_to_reveal == 0) {
            end_game();
        }
    }
}

function end_game() {

    //win
    if (carts_to_reveal == 0) {
        document.getElementsByClassName("results")[0].innerHTML = "VICTORIA";
    }



    //lose


}

/*------------------------------------------------------End Lógica del juego------------------------------------------------------*/
