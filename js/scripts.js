var xInitial, yInitial;
var xOriginal, yOriginal;
var is_pressed = false;
var element_id;
var z_index = 40;
var interval;
var date_start = null;
var is_discarded;
var element;
var new_position;
var stack_discard_is_empty = true;
var carts_missing;
var carts_to_reveal = 12;
var top_discarded_cart_path;
var actual_reverse = "img/dorsos/dorso_azul.jpg";
var actual_difficulty = "Facil";
var max_position_actual;
var move_event = "mousemove";
var up_event = "mouseup";
var down_event = "mousedown";
var array_deck = ["copa1", "copa2", "copa3", "copa4", "copa5", "copa6", "copa7", "copa10", "copa11", "copa12",
    "oro1", "oro2", "oro3", "oro4", "oro5", "oro6", "oro7", "oro10", "oro11", "oro12",
    "espada1", "espada2", "espada3", "espada4", "espada5", "espada6", "espada7", "espada10", "espada11", "espada12",
    "basto1", "basto2", "basto3", "basto4", "basto5", "basto6", "basto7", "basto10", "basto11", "basto12"
];

/*------------------------------------------------------Eventos------------------------------------------------------*/
$(document).ready(function () {
    $(window).on('load', function () {
        first_flop();
    });

    events_settings();

    $(window).bind('resize', events_settings);


});

function events_settings(){
    carts_missing = document.getElementsByClassName("carts_missing")[0].innerHTML;

    //Añadir eventos y eventos táctiles.
    if ("ontouchstart" in window) {
        move_event = "touchmove";
        up_event = "touchend";
        down_event = "touchstart";
        console.log("Yes");
        
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log(move_event + " " + up_event + " " + down_event );


    document.addEventListener(move_event, mouse_moved);

    $("#cart_up_tier1, #cart_up_tier2, #cart_up_tier3")
        .bind(up_event, mouse_released)
        .bind(down_event, mouse_pressed);

    $(".reverse_fixed, .carts_missing").click(function () {
        new_cart_from_deck();
        //Contador.
        if (date_start == null) {
            date_start = new Date();
        }
        //End Contador.
    });
    //End Añadir eventos y eventos táctiles.

    //Options.
    $(".option_instruccions").click(function () {
        $(".container_data_info").addClass("on");
        $(".instruccions").addClass("on");
    });

    $(".close_instruccions, .container_data_info").click(function () {
        $(".container_data_info").removeClass("on");
        $(".instruccions").removeClass("on");
    });

    $(".options_collapsed").click(function () {
        expand_and_collapse();
    });

    $(".reverse_collapsed").click(function () {
        sub_expand_and_collapse("reverse");
    });

    $(".difficulty_collapsed").click(function () {
        sub_expand_and_collapse("difficulty");
    });

    $(".background_alert").click(function () {
        $(".alert").removeClass("on");
        $(".background_alert").removeClass("on");
    });

    //Evento Cambio de dorso.
    $(".container_checkbox input[name='reverse']").bind("change", swap_reverse);

    //Evento Cambio de dificultad.
    $(".container_checkbox input[name='difficulty']").bind("change", swap_difficulty);

    //Nueva partida.
    $(".new_game").click(function () {
        location.reload();
    });

    //End Options.
}

function events_on(cart_up_tier) {
    $("#" + cart_up_tier)
        .bind(up_event, mouse_released)
        .bind(down_event, mouse_pressed);
}

function events_down(cart_up_tier) {
    $("#" + cart_up_tier)
        .unbind(up_event, mouse_released)
        .unbind(down_event, mouse_pressed);
}

//onMouseDown.
function mouse_pressed(evt) {
    //Obtener la posición de inicio.
    //"ontouchstart" in window evt.targetTouches[0] -> Eventos Táctiles.
    evt.preventDefault();
    xInitial = "ontouchstart" in window ? evt.targetTouches[0].pageX : evt.clientX;
    yInitial = "ontouchstart" in window ? evt.targetTouches[0].pageY : evt.clientY;
    //End Eventos Táctiles.
    element_id = this.id;
    element = document.getElementById(element_id);
    var original_position = get_position(element);
    yOriginal = original_position[0];
    xOriginal = original_position[1];
    is_pressed = true;
}

//onMouseMove.
function mouse_moved(evt) {
    if (is_pressed) {
        //Calcular la diferencia de posición.
        //"ontouchstart" in window evt.targetTouches[0] -> Eventos Táctiles.
        var xActual = "ontouchstart" in window ? evt.targetTouches[0].pageX : evt.clientX;
        var yActual = "ontouchstart" in window ? evt.targetTouches[0].pageY : evt.clientY;
        //End Eventos Táctiles.
        var xFinal = xActual - xInitial;
        var yFinal = yActual - yInitial;

        xInitial = xActual;
        yInitial = yActual;
        //Establecer la nueva posición.
        new_position = get_position(element);
        element.style.top = (new_position[0] + yFinal) + "px";
        element.style.left = (new_position[1] + xFinal) + "px";

        // Esquinas:
        // 205 X 305 Y, 305 X 305 Y, 205 X 450 Y, 305 X 450 Y
        // Hay que tener en cuenta el width (100px) y el height (140px) que les hemos puesto a las cartas. 
        // Al restar y sumar, mínimos y máximos, sabremos si hay un "choque" con -> 105-305 X, 165-450 Y.
        is_discarded = is_discard();
    }
}

function is_discard() {

    var top_stack_discard = viewportToPixels("48vh");
    var left_stack_discard = viewportToPixels("15vw");

    var mediaquery = window.matchMedia("(max-width: 768px)");
    if (mediaquery.matches) {
        // mediaquery es 768
        radio = 50;
    } else {
        // mediaquery no es 768
        radio = 150;
    }

    if (new_position[0] <= top_stack_discard + radio && new_position[0] >= top_stack_discard - radio &&
        new_position[1] <= left_stack_discard + radio && new_position[1] >= left_stack_discard - radio) {
        return true;
    } else {
        return false;
    }
}
//onMouseUp.
function mouse_released() {
    is_pressed = false;
    // is_discarded -> Cuando la carta coincide en posición con la pila de descartes.
    // cart_can_go_to_stack_discard -> Cuando la carta tiene el valor siguiente o anterior a la que vemos en la pila de descartes.
    if (is_discarded && cart_can_go_to_stack_discard(element.getAttribute("src"))) {
        element.classList.add("stack_discard");
        z_index++;
        element.style.zIndex = z_index;
        events_down(element_id);
        top_discarded_cart_path = element.getAttribute("src");
        reveal_next_cart();
        //Contador.
        if (date_start == null) {
            date_start = new Date();
        }
        //End Contador. 
    } else {
        element.style.top = yOriginal + "px";
        element.style.left = xOriginal + "px";
    }
}

/*
 * Función para obtener la posición en la que se encuentra el
 * elemento indicado como parámetro.
 * Retorna un array con las coordenadas x e y de la posición.
 * Las líneas con los métodos getComputedStyle y getPropertyValue sirven para acceder a los estilos del elemento.
 */
function get_position(element) {
    var position = new Array(4);
    position[0] = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("top"));
    position[1] = parseInt(document.defaultView.getComputedStyle(element, null).getPropertyValue("left"));
    return position;
}

function expand_and_collapse() {
    if (!$(".options_expanded").hasClass("expand_anim")) {
        $(".options_expanded").removeClass("collapse_anim");
        $(".options_expanded").addClass("expand_anim");
        $(".arrow_with_circle").attr("src", "img/icons/arrow_with_circle_up.svg");
    } else {
        $(".options_expanded").removeClass("expand_anim");
        $(".options_expanded").addClass("collapse_anim");
        $(".arrow_with_circle").attr("src", "img/icons/arrow_with_circle_down.svg");
    }
}

function sub_expand_and_collapse(option) {
    switch (option) {
        case "reverse":
            if (!$(".reverse_expanded").hasClass("sub_expand_anim")) {
                $(".reverse_expanded").removeClass("sub_collapse_anim");
                $(".reverse_expanded").addClass("sub_expand_anim");
                $(".reverse_collapsed .sub_arrow_with_circle").attr("src", "img/icons/arrow_with_circle_up.svg");
            } else {
                $(".reverse_expanded").removeClass("sub_expand_anim");
                $(".reverse_expanded").addClass("sub_collapse_anim");
                $(".reverse_collapsed .sub_arrow_with_circle").attr("src", "img/icons/arrow_with_circle_down.svg");
            }
            break;
        case "difficulty":
            if (!$(".difficulty_expanded").hasClass("sub_expand_anim")) {
                $(".difficulty_expanded").removeClass("sub_collapse_anim");
                $(".difficulty_expanded").addClass("sub_expand_anim");
                $(".difficulty_collapsed .sub_arrow_with_circle").attr("src", "img/icons/arrow_with_circle_up.svg");
            } else {
                $(".difficulty_expanded").removeClass("sub_expand_anim");
                $(".difficulty_expanded").addClass("sub_collapse_anim");
                $(".difficulty_collapsed .sub_arrow_with_circle").attr("src", "img/icons/arrow_with_circle_down.svg");
            }
            break;
        default:
            break;
    }
}

function viewportToPixels(value) { /*value=100vh, por ejemplo*/
    var parts = value.match(/([0-9\.]+)(vh|vw)/)
    var q = Number(parts[1])
    var side = window[['innerHeight', 'innerWidth'][
        ['vh', 'vw'].indexOf(parts[2])
    ]]
    return side * (q / 100)
}

/*------------------------------------------------------End Eventos------------------------------------------------------*/

/*------------------------------------------------------Lógica del juego------------------------------------------------------*/
function create_reverse(cart_up) {
    var data_position = cart_up.attr("data-position");
    var cart_up_id = cart_up.attr("id");
    if (cart_up.hasClass("deck_cart")) {
        var deck_cart = $("<img>").attr({
                src: actual_reverse,
                alt: "Dorso Auxiliar"
            })
            .attr("data-position", data_position).addClass("carts deck_reverse");
        deck_cart.insertAfter(document.getElementsByClassName("deck_cart")[0]);
    } else {
        var reverse_helper = $("<img>").attr({
                src: actual_reverse,
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
}

function path_cart() {
    return "spanish-deck/" + random_cart() + ".jpg";
}

function random_cart() {
    var position_aleatoria = Math.floor(Math.random() * array_deck.length);
    return array_deck.splice(position_aleatoria, 1);
}

function new_cart_from_deck() {
    if (carts_missing > 0) {
        var new_cart = path_cart();
        var deck_cart = $("<img>").attr({
                src: new_cart,
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
        top_discarded_cart_path = new_cart;
    }

    if (carts_missing == 0) {
        $('.reverse_fixed').remove();
        $('.carts_missing').addClass("no_carts");
        $('.deck').addClass("empty");
        lose_game();
    }

    //Desactivamos temporalmente el onclick para evitar que se haga clic muchas veces seguidas. (600, 100 ms más que la animación).
    setTimeout(function () {
        $(".reverse_fixed, .carts_missing").bind("click", function () {
            new_cart_from_deck();
        });
    }, 600);
    $(".reverse_fixed, .carts_missing").unbind("click");
}

function get_value_of_cart(cart_path) {
    var path_to_check = cart_path.split(".jpg")[0];
    var check_nums = path_to_check.match(/[0-9]/g);

    if (typeof (check_nums[1]) == "undefined") {
        return parseInt(check_nums);
    } else {
        return parseInt(check_nums[0].concat(check_nums[1]));
    }
}

function cart_can_go_to_stack_discard(cart_path) {
    //Si el elemento no existe porque no quedan cartas en algún tier, dejamos el valor a false.    
    if (!cart_path) {
        return false;
    }
    var value_current_element = get_value_of_cart(cart_path);
    var value_top_discarded_cart = get_value_of_cart(top_discarded_cart_path);

    if (value_top_discarded_cart == 7 && value_current_element == 10 || value_top_discarded_cart == 10 && value_current_element == 7 ||
        value_top_discarded_cart == 12 && value_current_element == 1 || value_top_discarded_cart == 1 && value_current_element == 12) {
        var logic_exception = true;
    }

    if (value_top_discarded_cart == value_current_element + 1 || value_top_discarded_cart == value_current_element - 1 || logic_exception) {
        return true;
    } else {
        return false;
    }
}

function reveal_next_cart() {
    // is_discarded -> Cuando la carta coincide en posición con la pila de descartes.
    if (is_discarded) {
        carts_to_reveal--;
        var tier_position = element.getAttribute("data-position");
        var tier = element_id.substring(element_id.length - 1, element_id.length);

        // borrar elemento reverse_helper.
        $(".tier" + tier + " .reverse_helper").remove();

        // quitar id de su tier.
        element.setAttribute("alt", "Carta Descartada");
        element.removeAttribute("id");

        if (tier_position > 1) {
            // crear reverse_helper.
            create_reverse($(".tier" + tier + " img[data-position='" + parseInt(tier_position - 1) + "']"));

            // añadir id de su tier.
            $(".tier" + tier + " .hide[data-position='" + parseInt(tier_position - 1) + "']").attr({
                id: "cart_up_tier" + parseInt(tier),
                alt: "Carta Boca Arriba"
            }).removeClass("hide");

            var new_cart = path_cart();

            // animacion voltear de la carta anterior.
            setTimeout(function () {
                $('.reverse_helper').addClass("flip");
                switch (tier) {
                    case "1":
                        $('#cart_up_tier1').addClass("flip").attr('src', new_cart);
                        events_on("cart_up_tier1");
                        break;
                    case "2":
                        $('#cart_up_tier2').addClass("flip").attr('src', new_cart);
                        events_on("cart_up_tier2");
                        break;
                    case "3":
                        $('#cart_up_tier3').addClass("flip").attr('src', new_cart);
                        events_on("cart_up_tier3");
                        break;
                    default:
                        break;
                }

                if (carts_missing == 0) {
                    lose_game();
                }

            }, 200);
        }

        if (carts_to_reveal == 0) {
            win_game();
        }
    }
}

function win_game() {
    document.getElementsByClassName("results")[0].innerHTML = "VICTORIA";
    document.getElementsByClassName("container_results")[0].classList.add("end_game");
    $(".reverse_fixed, .carts_missing").unbind("click");
    get_timer("win");

}

function lose_game() {
    //Si el elemento no existe porque no quedan cartas en algún tier, dejamos el valor a false.
    var cart_up_tier1_src = document.getElementById("cart_up_tier1") ? document.getElementById("cart_up_tier1").getAttribute("src") : false;
    var cart_up_tier2_src = document.getElementById("cart_up_tier2") ? document.getElementById("cart_up_tier2").getAttribute("src") : false;
    var cart_up_tier3_src = document.getElementById("cart_up_tier3") ? document.getElementById("cart_up_tier3").getAttribute("src") : false;

    var play1 = cart_can_go_to_stack_discard(cart_up_tier1_src);
    var play2 = cart_can_go_to_stack_discard(cart_up_tier2_src);
    var play3 = cart_can_go_to_stack_discard(cart_up_tier3_src);


    if (!play1 && !play2 && !play3) {
        document.getElementsByClassName("results")[0].innerHTML = "DERROTA";
        document.getElementsByClassName("container_results")[0].classList.add("end_game");
        get_timer("lose");
    }
}

function get_timer(result) {

    var date_end = new Date();
    var msecPerMinute = 1000 * 60;
    var text_timer = "";

    var difference = date_end.getTime() - date_start.getTime();
    var minutes = Math.floor(difference / msecPerMinute);
    difference = difference - (minutes * msecPerMinute);

    var seconds = Math.floor(difference / 1000);

    //Posibilidades del mensaje text_timer.
    if (minutes == 0) {
        text_timer = seconds + " segundos. ";
    } else if (seconds == 0 && minutes == 1) {
        text_timer = minutes + " minuto. ";
    } else if (minutes == 1) {
        text_timer = minutes + " minuto y " + seconds + " segundos. ";
    } else if (seconds == 0) {
        text_timer = minutes + " minutos. ";
    } else {
        text_timer = minutes + " minutos y " + seconds + " segundos. ";
    }
    //End Posibilidades del mensaje text_timer.

    document.getElementsByClassName("time_result")[0].innerHTML = text_timer;

    if (result == "win") {
        document.getElementsByClassName("programmer_greeting")[0].innerHTML = "¿Podrás mejorarlo?";
    }
    if (result == "lose") {
        document.getElementsByClassName("programmer_greeting")[0].innerHTML = "Suerte la próxima vez.";
    }
}

/*------------------------------------------------------End Lógica del juego------------------------------------------------------*/
/*--------------------------------------------------------Opciones--------------------------------------------------------*/

function swap_reverse() {
    var input_reverse = document.getElementsByName("reverse");
    // Buscamos el dorso seleccionado.
    for (var i = 0; i < input_reverse.length; i++) {
        if (input_reverse[i].checked) {
            break;
        }
    }

    var all_carts = document.getElementsByClassName("carts");
    // En base al data-reverse seleccionado cambiamos el src buscando "dorsos" en éste.
    switch (input_reverse[i].getAttribute("data-reverse")) {
        case "Azul":
            for (num_cart = 0; num_cart < all_carts.length; num_cart++) {
                if (all_carts[num_cart].getAttribute("src").includes("dorsos")) {
                    all_carts[num_cart].setAttribute("src", "img/dorsos/dorso_azul.jpg");
                }
            }
            actual_reverse = "img/dorsos/dorso_azul.jpg";
            break;
        case "Oscuro":
            for (num_cart = 0; num_cart < all_carts.length; num_cart++) {
                if (all_carts[num_cart].getAttribute("src").includes("dorsos")) {
                    all_carts[num_cart].setAttribute("src", "img/dorsos/dorso_oscuro.jpg");
                }
            }
            actual_reverse = "img/dorsos/dorso_oscuro.jpg";
            break;
        case "Hearthstone":
            for (num_cart = 0; num_cart < all_carts.length; num_cart++) {
                if (all_carts[num_cart].getAttribute("src").includes("dorsos")) {
                    all_carts[num_cart].setAttribute("src", "img/dorsos/dorso_hs.png");
                }
            }
            actual_reverse = "img/dorsos/dorso_hs.png";
            break;
        default:
            break;
    }
}

function is_cart_moved_to_stack_discard(max_position) {
    var position1 = document.getElementById("cart_up_tier1").getAttribute("data-position");
    var position2 = document.getElementById("cart_up_tier2").getAttribute("data-position");
    var position3 = document.getElementById("cart_up_tier3").getAttribute("data-position");

    if (position1 < max_position || position2 < max_position || position3 < max_position) {
        return true;
    } else {
        return false;
    }
}

function is_game_started(actual_difficulty) {
    carts_missing = document.getElementsByClassName("carts_missing")[0].innerHTML;
    switch (actual_difficulty) {
        case "Facil":
            max_position_actual = 4;
            if (carts_missing < 27 || is_cart_moved_to_stack_discard(max_position_actual)) {
                return true;
            }
            break;
        case "Medio":
            max_position_actual = 5;
            if (carts_missing < 24 || is_cart_moved_to_stack_discard(max_position_actual)) {
                return true;
            }
            break;
        case "Dificil":
            max_position_actual = 6;
            if (carts_missing < 21 || is_cart_moved_to_stack_discard(max_position_actual)) {
                return true;
            }
            break;
        default:
            break;
    }
    return false;
}

function dom_difficulty(max_position_selected, max_position_actual) {


    if (max_position_selected > max_position_actual) {
        //Agregar filas de los tier.
        $("#cart_up_tier1, #cart_up_tier2, #cart_up_tier3").attr("src", actual_reverse).attr("data-position", max_position_selected).removeClass("flip");
        $(".tier .reverse_helper").remove();
        $(".deck_cart").remove();

        for (var i = max_position_actual; i < max_position_selected; i++) {
            var row = $("<img>").attr({
                src: actual_reverse,
                alt: "Dorso"
            }).attr("data-position", i).addClass("carts hide");
            row.insertAfter($(".tier img[data-position='" + parseInt(i - 1) + "']"));
        }

        // añadir eventos de movimiento a los nuevos id.
        for (tier = 1; tier <= 3; tier++) {
            events_on("cart_up_tier" + tier);
        }

        create_reverse($("#cart_up_tier1"));
        create_reverse($("#cart_up_tier2"));
        create_reverse($("#cart_up_tier3"));

        //Animación inicial
        setTimeout(function () {
            first_flop();
        }, 500);

    } else {
        //Borrar filas de los tier.
        $(".deck_cart").remove();

        for (var i = max_position_actual; i > max_position_selected; i--) {
            $(".tier img[data-position='" + parseInt(i) + "']").remove();
        }

        // añadir id de su tier.
        for (tier = 1; tier <= 3; tier++) {
            $(".tier" + tier + " .hide[data-position='" + max_position_selected + "']").attr({
                id: "cart_up_tier" + parseInt(tier),
                alt: "Carta Boca Arriba"
            }).removeClass("hide");
            events_on("cart_up_tier" + tier);
        }

        create_reverse($("#cart_up_tier1"));
        create_reverse($("#cart_up_tier2"));
        create_reverse($("#cart_up_tier3"));

        //Animación inicial
        setTimeout(function () {
            first_flop();
        }, 500);
    }
}

function swap_difficulty() {

    //Comprobamos si ha empezado la partida.
    var input_difficulty = document.getElementsByName("difficulty");
    game_started = is_game_started(actual_difficulty);
    if (game_started) {
        $(".alert").addClass("on");
        $(".background_alert").addClass("on");
        $(".container_checkbox input[name='difficulty']").unbind("change");

        //Volvemos a seleccionar la dificultad que estaba seleccionada.
        for (var j = 0; j < input_difficulty.length; j++) {
            if (input_difficulty[j].getAttribute("data-difficulty") == actual_difficulty) {
                input_difficulty[j].checked = "checked";
                break;
            }
        }

        $(".container_checkbox input[name='difficulty']").bind("change", swap_difficulty);
        return;
    }

    var max_position_selected = 0;

    // Buscamos la dificultad seleccionada.
    for (var i = 0; i < input_difficulty.length; i++) {
        if (input_difficulty[i].checked) {
            break;
        }
    }

    // En base al data-difficulty seleccionado estableceremos las bases para el resto.
    switch (input_difficulty[i].getAttribute("data-difficulty")) {
        case "Facil":
            carts_missing = "28";
            carts_to_reveal = 12;
            max_position_selected = 4;
            document.getElementsByClassName("carts_missing")[0].innerHTML = carts_missing;
            actual_difficulty = "Facil";
            break;
        case "Medio":
            carts_missing = "25";
            carts_to_reveal = 15;
            max_position_selected = 5;
            document.getElementsByClassName("carts_missing")[0].innerHTML = carts_missing;
            actual_difficulty = "Medio";
            break;
        case "Dificil":
            carts_missing = "22";
            carts_to_reveal = 18;
            max_position_selected = 6;
            document.getElementsByClassName("carts_missing")[0].innerHTML = carts_missing;
            actual_difficulty = "Dificil";
            break;
        default:
            break;
    }

    array_deck = ["copa1", "copa2", "copa3", "copa4", "copa5", "copa6", "copa7", "copa10", "copa11", "copa12",
        "oro1", "oro2", "oro3", "oro4", "oro5", "oro6", "oro7", "oro10", "oro11", "oro12",
        "espada1", "espada2", "espada3", "espada4", "espada5", "espada6", "espada7", "espada10", "espada11", "espada12",
        "basto1", "basto2", "basto3", "basto4", "basto5", "basto6", "basto7", "basto10", "basto11", "basto12"
    ];

    dom_difficulty(max_position_selected, max_position_actual);
}


/*------------------------------------------------------End Opciones------------------------------------------------------*/