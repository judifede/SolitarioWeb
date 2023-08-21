import viewportToPixels from "./utils.js";
import {
  start_particula,
  TIPO_PARTICULA,
  timeoutCrearParticulaPadre,
  timeoutMoverParticulaPadre,
  reset_particulas,
} from "./particula.js";

var xInitial, yInitial;
var xOriginal, yOriginal;
var is_pressed = false;
var partida_empezada = false;
var element_id;
var z_index = 40;
var contador = null;
var es_descartada;
var element;
var nueva_posicion;
var cartas_restantes;
var cartas_columnas = 12;
var ruta_carta_pila_descartada;
var actual_dorso = "src/img/dorsos/dorso_azul.jpg";
var BARAJAS = {
  SPAIN: "Spain",
  POQUER: "Poquer",
};
var actual_baraja = BARAJAS.SPAIN;
var move_event = "mousemove";
var up_event = "mouseup";
var down_event = "mousedown";
var OPCIONES_ACORDEON = {
  DORSO: "dorso",
  FONDO: "fondo_pantalla",
  BARAJA: "baraja",
  IDIOMA: "idioma",
};
var DIFICULTADES = { FACIL: "Facil", MEDIO: "Medio", DIFICIL: "Dificil" };
var array_baraja_game;
var array_baraja_spanish = [
  "copa1",
  "copa2",
  "copa3",
  "copa4",
  "copa5",
  "copa6",
  "copa7",
  "copa10",
  "copa11",
  "copa12",
  "oro1",
  "oro2",
  "oro3",
  "oro4",
  "oro5",
  "oro6",
  "oro7",
  "oro10",
  "oro11",
  "oro12",
  "espada1",
  "espada2",
  "espada3",
  "espada4",
  "espada5",
  "espada6",
  "espada7",
  "espada10",
  "espada11",
  "espada12",
  "basto1",
  "basto2",
  "basto3",
  "basto4",
  "basto5",
  "basto6",
  "basto7",
  "basto10",
  "basto11",
  "basto12",
];
var array_baraja_french = [
  "corazon1",
  "corazon2",
  "corazon3",
  "corazon4",
  "corazon5",
  "corazon6",
  "corazon7",
  "corazon10",
  "corazon11",
  "corazon12",
  "diamante1",
  "diamante2",
  "diamante3",
  "diamante4",
  "diamante5",
  "diamante6",
  "diamante7",
  "diamante10",
  "diamante11",
  "diamante12",
  "pica1",
  "pica2",
  "pica3",
  "pica4",
  "pica5",
  "pica6",
  "pica7",
  "pica10",
  "pica11",
  "pica12",
  "trebol1",
  "trebol2",
  "trebol3",
  "trebol4",
  "trebol5",
  "trebol6",
  "trebol7",
  "trebol10",
  "trebol11",
  "trebol12",
];

/*------------------------------------------------------Eventos------------------------------------------------------*/
$(document).ready(function () {
  events_settings();
  //Firefox guarda cual estaba checked al recargar, asi que los inicializamos aquí.
  document.getElementsByName(OPCIONES_ACORDEON.DORSO)[0].checked = "checked";
  document.getElementsByName(OPCIONES_ACORDEON.FONDO)[0].checked = "checked";
  document.getElementsByName(OPCIONES_ACORDEON.BARAJA)[0].checked = "checked";
  document.getElementsByName(OPCIONES_ACORDEON.IDIOMA)[0].checked = "checked";
  //End Firefox.
});

function events_settings() {
  cartas_restantes =
    document.getElementsByClassName("cartas_restantes")[0].innerHTML;

  //Evento Elegir dificultad.
  $(".button_dificultad").click(function () {
    var dificultad_seleccionada = $(this).attr("data-dificultad");
    elegir_dificultad(dificultad_seleccionada);
    $(".close_customs").addClass("active");
    $(".configuracion div").removeClass("opened");
    $(".tabs").removeClass("opened");
    $(".background_customs_instrucciones").removeClass("opened");
    partida_empezada = true;
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  });

  //Añadir eventos y eventos táctiles.
  if ("ontouchstart" in window) {
    move_event = "touchmove";
    up_event = "touchend";
    down_event = "touchstart";
  }

  document.addEventListener(move_event, mouse_moved);

  $("#cart_up_column1, #cart_up_column2, #cart_up_column3")
    .bind(up_event, mouse_released)
    .bind(down_event, mouse_pressed);

  $(".dorso_fixed, .cartas_restantes").bind("click", function () {
    nueva_carta_baraja();
    //Contador.
    if (contador == null) {
      contador = new Date();
    }
    //End Contador.
  });
  //End Añadir eventos y eventos táctiles.

  //Tabs.

  $(".tab_content").hide();
  $("ul.tabs li:first").addClass("active").show();
  $(".tab_content:first").show();

  $("ul.tabs li").click(function () {
    $("ul.tabs li").removeClass("active");
    $(this).addClass("active");
    $(".tab_content").hide();

    var activeTab = $(this).find("a").attr("href");
    $(activeTab).fadeIn();
    return false;
  });

  //End Tabs.

  //apariencia.
  $(".menu_configuracion_container").click(function () {
    $(".configuracion div").addClass("opened");
    $(".tabs").addClass("opened");
    $(".background_customs_instrucciones").addClass("opened");
  });

  $(".background_customs_instrucciones, .close_customs").click(function () {
    if (partida_empezada) {
      $(".configuracion div").removeClass("opened");
      $(".tabs").removeClass("opened");
      $(".background_customs_instrucciones").removeClass("opened");
    }
  });

  $(".arrow_next_tab").click(function () {
    $("ul.tabs li:nth-child(1)").removeClass("active");
    $("ul.tabs li:nth-child(2)").addClass("active");
    $(".tab_content").hide();
    $("#tab2").fadeIn();
  });

    $(".title_acordeon").click(function(){
      var acordeon_seleccionado = $(this)[0];
      console.log(acordeon_seleccionado);
        if($(acordeon_seleccionado).find(".fa").hasClass("fa-angle-down")){
            $(acordeon_seleccionado).find(".fa").removeClass("fa-angle-down");				
            $(acordeon_seleccionado).find(".fa").addClass("fa-angle-up");		
            $(this).next().show(750);
          }else{
            $(acordeon_seleccionado).find(".fa").addClass("fa-angle-down");				
            $(acordeon_seleccionado).find(".fa").removeClass("fa-angle-up");				
            $(this).next().hide(750);
        }
    });

  //Evento Cambio de dorso.
  $(".container_checkbox input[name='dorso']").bind("change", cambiar_dorso);

  //Evento Cambio de fondo.
  $(".container_checkbox input[name='fondo_pantalla']").bind(
    "change",
    cambiar_fondo_pantalla
  );

  //Evento Cambio de fondo.
  $(".container_checkbox input[name='baraja']").bind("change", cambiar_baraja);

  //Evento Cambio de idioma.
  $(".container_checkbox input[name='idioma']").bind("change", cambiar_idioma);

  //Nueva partida.
  $(".new_game").click(function () {
    $(".restart_game").addClass("opened");
    $(".container_results .new_game").removeClass("opened");
  });

  $(".restart_game .button_dificultad").click(function () {
    reset();
  });

  //End apariencia.
}

function elegir_dificultad(dificultad_seleccionada) {
  //Comprobamos si ha empezado la partida.
  var posicion_dificultad = 0;
  array_baraja_game = array_baraja_spanish.slice();
  console.log(array_baraja_game, " game");
  console.log(array_baraja_spanish, " spanish");

  // En base al data-dificultad seleccionado estableceremos las bases para el resto.
  switch (dificultad_seleccionada) {
    case DIFICULTADES.FACIL:
      cartas_restantes = "28";
      cartas_columnas = 12;
      posicion_dificultad = 4;
      document.getElementsByClassName("cartas_restantes")[0].innerHTML =
        cartas_restantes;
      break;
    case DIFICULTADES.MEDIO:
      cartas_restantes = "25";
      cartas_columnas = 15;
      posicion_dificultad = 5;
      document.getElementsByClassName("cartas_restantes")[0].innerHTML =
        cartas_restantes;
      break;
    case DIFICULTADES.DIFICIL:
      cartas_restantes = "22";
      cartas_columnas = 18;
      posicion_dificultad = 6;
      document.getElementsByClassName("cartas_restantes")[0].innerHTML =
        cartas_restantes;
      break;
    default:
      break;
  }

  if (posicion_dificultad >= 4) {
    dom_dificultad(posicion_dificultad);
  }

  //Animación inicial
  setTimeout(first_flop, 500);
}

function dom_dificultad(posicion_dificultad) {
  //Vaciamos las columnas de cartas
  var allColumns = $(".column");
  allColumns.empty();

  //Creamos la base
  /*
    <img src="src/img/dorsos/dorso_azul.jpg" alt="Dorso" data-posicion="1" class="carts hide">
    <img src="src/img/dorsos/dorso_azul.jpg" alt="Dorso" data-posicion="2" class="carts hide">
    <img src="src/img/dorsos/dorso_azul.jpg" alt="Dorso" data-posicion="3" class="carts hide">
    <img src="src/img/dorsos/dorso_azul.jpg" alt="Carta Boca Arriba" data-posicion="4" class="carts"
        id="cart_up_column1">
    <img src="src/img/dorsos/dorso_azul.jpg" alt="Dorso Auxiliar" data-posicion="4" class="carts dorso_helper">
    */
  //Iteramos cada fila en cada columna
  for (var i = 1; i <= posicion_dificultad; i++) {
    var row = $("<img>")
      .attr({
        src: actual_dorso,
        alt: "Dorso",
      })
      .attr("data-posicion", i)
      .addClass("carts hide");

    if (i - 1 == 0) {
      row.appendTo($(".column"));
    } else if (i < posicion_dificultad) {
      row.insertAfter(
        $(".column img[data-posicion='" + parseInt(i - 1) + "']")
      );
    }

    //Definimos la última fila
    if (i == posicion_dificultad) {
      // Iterar sobre cada columna
      for (var j = 0; j < allColumns.length; j++) {
        var column = allColumns[j];
        var rowFaceUp = $("<img>")
          .attr({
            src: actual_dorso,
            alt: "Carta Boca Arriba",
          })
          .attr("data-posicion", posicion_dificultad)
          .addClass("carts");
        rowFaceUp.attr("id", "cart_up_column" + (j + 1));
        rowFaceUp.appendTo(column);
      }
    }
  }

  //Vaciamos elementos repetidos del mazo
  $(".baraja").find(":not(.cartas_restantes, .dorso_fixed)").remove();

  // Añadimos eventos de movimiento a los nuevos id.
  for (column = 1; column <= 3; column++) {
    events_on("cart_up_column" + column);
  }

  create_dorso($("#cart_up_column1"));
  create_dorso($("#cart_up_column2"));
  create_dorso($("#cart_up_column3"));
}

function events_on(cart_up_column) {
  $("#" + cart_up_column)
    .bind(up_event, mouse_released)
    .bind(down_event, mouse_pressed);
}

function events_down(cart_up_column) {
  $("#" + cart_up_column)
    .unbind(up_event, mouse_released)
    .unbind(down_event, mouse_pressed);
}

//onMouseDown.
function mouse_pressed(evt) {
  //Obtener la posición de inicio.
  //"ontouchstart" in window evt.targetTouches[0] -> Eventos Táctiles.
  evt.preventDefault();
  xInitial =
    "ontouchstart" in window ? evt.targetTouches[0].pageX : evt.clientX;
  yInitial =
    "ontouchstart" in window ? evt.targetTouches[0].pageY : evt.clientY;
  //End Eventos Táctiles.
  element_id = this.id;
  element = document.getElementById(element_id);
  var original_posicion = get_posicion(element);
  yOriginal = original_posicion[0];
  xOriginal = original_posicion[1];
  is_pressed = true;
}

//onMouseMove.
function mouse_moved(evt) {
  if (is_pressed) {
    //Calcular la diferencia de posición.
    //"ontouchstart" in window evt.targetTouches[0] -> Eventos Táctiles.
    var xActual =
      "ontouchstart" in window ? evt.targetTouches[0].pageX : evt.clientX;
    var yActual =
      "ontouchstart" in window ? evt.targetTouches[0].pageY : evt.clientY;
    //End Eventos Táctiles.
    var xFinal = xActual - xInitial;
    var yFinal = yActual - yInitial;

    xInitial = xActual;
    yInitial = yActual;
    //Establecer la nueva posición.
    nueva_posicion = get_posicion(element);
    element.style.top = nueva_posicion[0] + yFinal + "px";
    element.style.left = nueva_posicion[1] + xFinal + "px";

    //Fuera del campo.
    outside_field(xFinal, yFinal);
    //End Fuera del campo.

    // Esquinas:
    // 205 X 305 Y, 305 X 305 Y, 205 X 450 Y, 305 X 450 Y
    // Hay que tener en cuenta el width (100px) y el height (140px) que les hemos puesto a las cartas.
    // Al restar y sumar, mínimos y máximos, sabremos si hay un "choque" con -> 105-305 X, 165-450 Y.
    es_descartada = is_discard();
  }
}

//Fuera del campo.
function outside_field(xFinal, yFinal) {
  var mediaquerytablet = window.matchMedia("(max-width: 768px)");
  var mediaquerymv = window.matchMedia("(max-width: 425px)");

  //Ancho
  var cart_width;
  cart_width = mediaquerytablet.matches ? 60 : 100;
  cart_width = mediaquerymv.matches ? 40 : 100;

  if (
    nueva_posicion[1] + xFinal >= viewportToPixels("100vw") - cart_width ||
    nueva_posicion[1] + xFinal <= 0
  ) {
    element.style.top = yOriginal + "px";
    element.style.left = xOriginal + "px";
    is_pressed = false;
  }

  //End Ancho

  //Alto
  var cart_height;
  cart_height = mediaquerytablet.matches ? 100 : 140;
  cart_height = mediaquerymv.matches ? 70 : 140;

  if (
    nueva_posicion[0] + yFinal >= viewportToPixels("100vh") - cart_height ||
    nueva_posicion[0] + yFinal <= 0
  ) {
    element.style.top = yOriginal + "px";
    element.style.left = xOriginal + "px";
    is_pressed = false;
  }

  //End Alto
}
//End Fuera del campo.

function is_discard() {
  var top_stack_discard = viewportToPixels("48vh");
  var left_stack_discard = viewportToPixels("20vw");

  var mediaquery = window.matchMedia("(max-width: 768px)");
  var radio = mediaquery.matches ? 50 : 150;

  if (
    nueva_posicion[0] <= top_stack_discard + radio &&
    nueva_posicion[0] >= top_stack_discard - radio &&
    nueva_posicion[1] <= left_stack_discard + radio &&
    nueva_posicion[1] >= left_stack_discard - radio
  ) {
    return true;
  } else {
    return false;
  }
}
//onMouseUp.
function mouse_released() {
  is_pressed = false;
  // es_descartada -> Cuando la carta coincide en posición con la pila de descartes.
  // carta_puede_ser_descartada -> Cuando la carta tiene el valor siguiente o anterior a la que vemos en la pila de descartes.
  if (
    es_descartada &&
    carta_puede_ser_descartada(element.getAttribute("src"))
  ) {
    element.classList.add("stack_discard");
    z_index++;
    element.style.zIndex = z_index;
    events_down(element_id);
    ruta_carta_pila_descartada = element.getAttribute("src");
    revelar_siguiente_carta();
    //Contador.
    if (contador == null) {
      contador = new Date();
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
function get_posicion(element) {
  var posicion = new Array(4);
  posicion[0] = parseInt(
    document.defaultView.getComputedStyle(element, null).getPropertyValue("top")
  );
  posicion[1] = parseInt(
    document.defaultView
      .getComputedStyle(element, null)
      .getPropertyValue("left")
  );
  return posicion;
}

/*------------------------------------------------------End Eventos------------------------------------------------------*/

/*------------------------------------------------------Lógica del juego------------------------------------------------------*/
function create_dorso(cart_up) {
  var data_posicion = cart_up.attr("data-posicion");
  var cart_up_id = cart_up.attr("id");
  if (cart_up.hasClass("baraja_carta")) {
    var baraja_carta = $("<img>")
      .attr({
        src: actual_dorso,
        alt: "Dorso Auxiliar",
      })
      .attr("data-posicion", data_posicion)
      .addClass("carts baraja_dorso");
    baraja_carta.insertAfter(
      document.getElementsByClassName("baraja_carta")[0]
    );
  } else {
    var dorso_helper = $("<img>")
      .attr({
        src: actual_dorso,
        alt: "Dorso Auxiliar",
      })
      .attr("data-posicion", data_posicion)
      .addClass("carts dorso_helper");
    dorso_helper.insertAfter($("#" + cart_up_id));
  }
}

function first_flop() {
  $(".dorso_helper").addClass("flip");
  $("#cart_up_column1").addClass("flip").attr("src", ruta_carta());
  $("#cart_up_column2").addClass("flip").attr("src", ruta_carta());
  $("#cart_up_column3").addClass("flip").attr("src", ruta_carta());
  nueva_carta_baraja();
}

function ruta_carta() {
  return "src/barajas/spanish-baraja/" + carta_aleatoria() + ".png";
}

function carta_aleatoria() {
  var posicion_aleatoria = Math.floor(Math.random() * array_baraja_game.length);
  return array_baraja_game.splice(posicion_aleatoria, 1);
}

function nueva_carta_baraja() {
  console.log(array_baraja_game, " game");
  console.log(array_baraja_spanish, " spanish");
  cartas_restantes =
    document.getElementsByClassName("cartas_restantes")[0].innerHTML;

  if (cartas_restantes > 0) {
    var nueva_carta = ruta_carta();
    var baraja_carta = $("<img>")
      .attr({
        src: nueva_carta,
        alt: "Nueva Carta",
        style: "z-index: " + z_index,
      })
      .addClass("carts baraja_carta");
    z_index++;
    baraja_carta.insertAfter(
      document.getElementsByClassName("cartas_restantes")[0]
    );
    cartas_restantes--;
    document.getElementsByClassName("cartas_restantes")[0].innerHTML =
      cartas_restantes;
    create_dorso($(".baraja_carta"));
    $(".baraja_dorso, .baraja_carta").addClass("nueva_carta");
    ruta_carta_pila_descartada = nueva_carta;
  }

  if (cartas_restantes == 0) {
    $(".dorso_fixed").remove();
    $(".cartas_restantes").addClass("no_carts");
    $(".baraja").addClass("empty");
    lose_game();
  }

  //Desactivamos temporalmente el onclick para evitar que se haga clic muchas veces seguidas. (600, 100 ms más que la animación).
  setTimeout(function () {
    $(".dorso_fixed, .cartas_restantes").bind("click", nueva_carta_baraja);
  }, 600);
  $(".dorso_fixed, .cartas_restantes").unbind("click");
}

function get_value_of_cart(cart_path) {
  var path_to_check = cart_path.split(".png")[0];
  var check_nums = path_to_check.match(/[0-9]/g);
//Comprobamos si el valor tiene 1 o 2 dígitos
  if (typeof check_nums[1] == "undefined") {
    return parseInt(check_nums);
  } else {
    return parseInt(check_nums[0].concat(check_nums[1]));
  }
}

function carta_puede_ser_descartada(cart_path) {
  //Si el elemento no existe porque no quedan cartas en algún column, dejamos el valor a false.

  if (!cart_path) {
    return false;
  }
  var value_current_element = get_value_of_cart(cart_path);
  var value_top_discarded_cart = get_value_of_cart(ruta_carta_pila_descartada);

  if (
    (value_top_discarded_cart == 7 && value_current_element == 10) ||
    (value_top_discarded_cart == 10 && value_current_element == 7) ||
    (value_top_discarded_cart == 12 && value_current_element == 1) ||
    (value_top_discarded_cart == 1 && value_current_element == 12)
  ) {
    var logic_exception = true;
  }

  if (
    value_top_discarded_cart == value_current_element + 1 ||
    value_top_discarded_cart == value_current_element - 1 ||
    logic_exception
  ) {
    return true;
  } else {
    return false;
  }
}

function revelar_siguiente_carta() {
  // es_descartada -> Cuando la carta coincide en posición con la pila de descartes.
  if (es_descartada) {
    cartas_columnas--;
    var column_posicion = element.getAttribute("data-posicion");
    var column = element_id.substring(element_id.length - 1, element_id.length);

    // borrar elemento dorso_helper.
    $(".column" + column + " .dorso_helper").remove();

    // quitar id de su column.
    element.setAttribute("alt", "Carta Descartada");
    element.removeAttribute("id");

    // nueva carta up de este column.
    if (column_posicion > 1) {
      // crear dorso_helper.
      create_dorso(
        $(
          ".column" +
            column +
            " img[data-posicion='" +
            parseInt(column_posicion - 1) +
            "']"
        )
      );

      // añadir id de su column.
      $(
        ".column" +
          column +
          " .hide[data-posicion='" +
          parseInt(column_posicion - 1) +
          "']"
      )
        .attr({
          id: "cart_up_column" + column,
          alt: "Carta Boca Arriba",
        })
        .removeClass("hide");

      var nueva_carta = ruta_carta();

      // animacion voltear.
      setTimeout(function () {
        $(".column" + column + ".dorso_helper").addClass("flip");
        switch (column) {
          case "1":
            $("#cart_up_column1").addClass("flip").attr("src", nueva_carta);
            events_on("cart_up_column1");
            break;
          case "2":
            $("#cart_up_column2").addClass("flip").attr("src", nueva_carta);
            events_on("cart_up_column2");
            break;
          case "3":
            $("#cart_up_column3").addClass("flip").attr("src", nueva_carta);
            events_on("cart_up_column3");
            break;
          default:
            break;
        }
      }, 300);
    }

    if (cartas_columnas == 0) {
      win_game();
    }

    setTimeout(function () {
      if (cartas_restantes == 0) {
        lose_game();
      }
    }, 1000);
  }
}

/*--------------------------------------------------------Opciones--------------------------------------------------------*/

function cambiar_dorso() {
  var input_dorso = document.getElementsByName("dorso");
  // Buscamos el dorso seleccionado.
  for (var i = 0; i < input_dorso.length; i++) {
    if (input_dorso[i].checked) {
      break;
    }
  }

  var all_carts = document.getElementsByClassName("carts");
  var dorso_ejemplo = document.getElementsByClassName("dorso_ejemplo");
  // En base al data-dorso seleccionado cambiamos el src buscando "dorsos" en éste.
  switch (input_dorso[i].getAttribute("data-dorso")) {
    case "Azul":
      for (var num_cart = 0; num_cart < all_carts.length; num_cart++) {
        if (all_carts[num_cart].getAttribute("src").includes("dorsos")) {
          all_carts[num_cart].setAttribute(
            "src",
            "src/img/dorsos/dorso_azul.jpg"
          );
          dorso_ejemplo[0].setAttribute("src", "src/img/dorsos/dorso_azul.jpg");
        }
      }
      actual_dorso = "src/img/dorsos/dorso_azul.jpg";
      break;
    case "Negro":
      for (var num_cart = 0; num_cart < all_carts.length; num_cart++) {
        if (all_carts[num_cart].getAttribute("src").includes("dorsos")) {
          all_carts[num_cart].setAttribute(
            "src",
            "src/img/dorsos/dorso_negro.jpg"
          );
          dorso_ejemplo[0].setAttribute(
            "src",
            "src/img/dorsos/dorso_negro.jpg"
          );
        }
      }
      actual_dorso = "src/img/dorsos/dorso_negro.jpg";
      break;
    case "Hearthstone":
      for (var num_cart = 0; num_cart < all_carts.length; num_cart++) {
        if (all_carts[num_cart].getAttribute("src").includes("dorsos")) {
          all_carts[num_cart].setAttribute(
            "src",
            "src/img/dorsos/dorso_hs.png"
          );
          dorso_ejemplo[0].setAttribute("src", "src/img/dorsos/dorso_hs.png");
        }
      }
      actual_dorso = "src/img/dorsos/dorso_hs.png";
      break;
    default:
      break;
  }
}

function cambiar_fondo_pantalla() {
  var input_fondo_pantalla = document.getElementsByName("fondo_pantalla");
  var fondo_pantalla_ejemplo = document.getElementsByClassName(
    "fondo_pantalla_ejemplo"
  );

  // Buscamos el dorso seleccionado.
  for (var i = 0; i < input_fondo_pantalla.length; i++) {
    if (input_fondo_pantalla[i].checked) {
      break;
    }
  }

  var body = document.getElementsByTagName("body")[0];
  var menu_icon = document.getElementsByClassName("menu_icon")[0];
  // En base al data-fondo_pantalla seleccionado cambiamos la clase del body, que contiene el fondo.
  var fondo_pantalla_seleccionada = input_fondo_pantalla[i].getAttribute(
    "data-fondo_pantalla"
  );
  fondo_pantalla_ejemplo[0].setAttribute(
    "src",
    "src/img/fondos_pantalla/" +
      fondo_pantalla_seleccionada.toLowerCase() +
      ".jpg"
  );
  if (fondo_pantalla_seleccionada == "Picnic") {
    menu_icon.setAttribute("src", "src/img/iconos/engranaje_azul.png");
  } else if (fondo_pantalla_seleccionada == "Casino") {
    menu_icon.setAttribute("src", "src/img/iconos/engranaje_gris.png");
  } else if (fondo_pantalla_seleccionada == "Steampunk") {
    menu_icon.setAttribute("src", "src/img/iconos/engranaje_gris.png");
  }
  body.removeAttribute("class");
  body.classList.add(fondo_pantalla_seleccionada.toLowerCase());
}

function cambiar_baraja() {
  //TODO: Cambio de baraja
  var input_baraja = document.getElementsByName("baraja");
  var baraja_ejemplo = document.getElementsByClassName("baraja_ejemplo");

  // Buscar todas las cartas boca arriba.

  // Buscamos la baraja seleccionado.

  for (var i = 0; i < input_baraja.length; i++) {
    if (input_baraja[i].checked) {
      break;
    }
  }

  var equivalentes_cambiar_a_french = {
    copa: "corazon",
    oro: "diamante",
    espada: "pica",
    basto: "trebol",
  };
  var equivalentes_cambiar_a_spanish = {
    corazon: "copa",
    diamante: "oro",
    pica: "espada",
    trebol: "basto",
  };

  // En base al data-baraja seleccionado cambiamos las cartas visibles por sus equivalentes.
  var baraja_seleccionada = input_baraja[i].getAttribute("data-baraja");

  var oro = "oro";

  if (baraja_seleccionada == "Spain") {
    $(".img[alt='Carta Boca']");
    baraja_ejemplo[0].setAttribute(
      "src",
      "src/barajas/spanish-baraja/copa1.png"
    );
  } else if (baraja_seleccionada == "Poquer") {
    baraja_ejemplo[0].setAttribute(
      "src",
      "src/barajas/french-baraja/corazon1.png"
    );
  }
}

function cambiar_idioma() {
  //TODO: Cambio de idioma
  /*var input_fondo_pantalla = document.getElementsByName("fondo_pantalla");
    var fondo_pantalla_ejemplo = document.getElementsByClassName("fondo_pantalla_ejemplo");
  
  /*
  body.casino {
      background-image: url('../img/fondos_pantalla/casino.jpg');
  }
  
  body.picnic {
      background-image: url('../img/fondos_pantalla/picnic.jpg');
  }
  
  body.steampunk {
      background-image: url('../img/fondos_pantalla/steampunk.jpg');
  */
  // Buscamos el dorso seleccionado.
  /*
    for (var i = 0; i < input_fondo_pantalla.length; i++) {
      if (input_fondo_pantalla[i].checked) {
        break;
      }
    }
  
    var body = document.getElementsByTagName("body")[0];
    var menu_icon = document.getElementsByClassName("menu_icon")[0];
    // En base al data-fondo_pantalla seleccionado cambiamos la clase del body, que contiene el fondo.
    var fondo_pantalla_seleccionada = input_fondo_pantalla[i].getAttribute("data-fondo_pantalla");
    fondo_pantalla_ejemplo[0].setAttribute("src", "src/img/fondos_pantalla/" + fondo_pantalla_seleccionada.toLowerCase() + ".jpg");
    if(fondo_pantalla_seleccionada == "Picnic"){
      menu_icon.setAttribute("src", "src/img/iconos/engranaje_azul.png");
    }else if(fondo_pantalla_seleccionada == "Casino"){
      menu_icon.setAttribute("src", "src/img/iconos/engranaje_gris.png");
    }else if(fondo_pantalla_seleccionada == "Steampunk"){
      menu_icon.setAttribute("src", "src/img/iconos/engranaje_gris.png");
    }
    body.removeAttribute("class");
    body.classList.add(fondo_pantalla_seleccionada.toLowerCase());
    */
}

/*------------------------------------------------------End Opciones------------------------------------------------------*/

/*------------------------------------------------------Idiomas------------------------------------------------------*/
//TODO: Idiomas como Blue Bay Hotels

/*------------------------------------------------------End Idiomas------------------------------------------------------*/

function win_game() {
  //Activamos la animación de fuegos artificiales
  start_particula(TIPO_PARTICULA.fuegos_artificiales);

  document.getElementsByClassName("result")[0].innerHTML = "¡Felicidades!";
  document
    .getElementsByClassName("container_results")[0]
    .classList.add("end_game");
  document
    .getElementsByClassName("background_results")[0]
    .classList.add("end_game");

  $(".container_results .new_game").addClass("opened");

  $(".dorso_fixed, .cartas_restantes").unbind("click");
}

function lose_game() {
  //Si el elemento no existe porque no quedan cartas en algún column, dejamos el valor a false.
  var cart_up_column1_src = document.getElementById("cart_up_column1")
    ? document.getElementById("cart_up_column1").getAttribute("src")
    : false;
  var cart_up_column2_src = document.getElementById("cart_up_column2")
    ? document.getElementById("cart_up_column2").getAttribute("src")
    : false;
  var cart_up_column3_src = document.getElementById("cart_up_column3")
    ? document.getElementById("cart_up_column3").getAttribute("src")
    : false;

  var play1 = carta_puede_ser_descartada(cart_up_column1_src);
  var play2 = carta_puede_ser_descartada(cart_up_column2_src);
  var play3 = carta_puede_ser_descartada(cart_up_column3_src);

  if (!play1 && !play2 && !play3) {
    //Activamos la animación de lluvia
    start_particula(TIPO_PARTICULA.lluvia);

    $(".container_results .new_game").addClass("opened");

    document.getElementsByClassName("result")[0].innerHTML =
      "¡Suerte la próxima vez!";
    document
      .getElementsByClassName("container_results")[0]
      .classList.add("end_game");
    document
      .getElementsByClassName("background_results")[0]
      .classList.add("end_game");
  }
}

function reset() {
  document
    .getElementsByClassName("container_results")[0]
    .classList.remove("end_game");

  document
    .getElementsByClassName("background_results")[0]
    .classList.remove("end_game");

  $(".restart_game").removeClass("opened");

  $("<img>")
    .attr({
      src: actual_dorso,
      alt: "Dorso",
    })
      .addClass("carts dorso_fixed")
      .appendTo($(".baraja"));

  $(".cartas_restantes").removeClass("no_carts");
  $(".baraja").removeClass("empty");

  var particulas = document.getElementsByClassName("particula");
  while (particulas.length > 0) {
    var particula = particulas[0];
    particula.remove();
  }
  clearTimeout(timeoutCrearParticulaPadre);
  clearTimeout(timeoutMoverParticulaPadre);

  reset_particulas();
}

/*------------------------------------------------------End Lógica del juego------------------------------------------------------*/
