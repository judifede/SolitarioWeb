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
  SPANISH: "Spanish",
  FRENCH: "French",
};
var actual_baraja = BARAJAS.SPANISH;
var move_event = "mousemove";
var up_event = "mouseup";
var down_event = "mousedown";
var OPCIONES_ACORDEON = {
  DORSO: "dorso",
  FONDO: "fondo_pantalla",
  BARAJA: "baraja",
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
  //End Firefox.
});

function events_settings() {
  cartas_restantes =
    document.getElementsByClassName("cartas_restantes")[0].innerHTML;

  if (actual_baraja == BARAJAS.SPANISH) {
    array_baraja_game = array_baraja_spanish.slice();
  } else if (actual_baraja == BARAJAS.FRENCH) {
    array_baraja_game = array_baraja_french.slice();
  }

  //Evento Elegir dificultad.
  $(".button_dificultad").click(function () {
    if (actual_baraja == BARAJAS.SPANISH) {
      array_baraja_game = array_baraja_spanish.slice();
    } else if (actual_baraja == BARAJAS.FRENCH) {
      array_baraja_game = array_baraja_french.slice();
    }
    var dificultad_seleccionada = $(this).attr("data-dificultad");
    elegir_dificultad(dificultad_seleccionada);
    $(".close_customs").addClass("active");
    $(".configuracion div").removeClass("opened");
    $(".tabs").removeClass("opened");
    $(".background_customs_instrucciones").removeClass("opened");
    partida_empezada = true;
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

  $(".title_acordeon").click(function () {
    var acordeon_seleccionado = $(this)[0];
    if ($(acordeon_seleccionado).find(".fa").hasClass("fa-angle-down")) {
      $(acordeon_seleccionado).find(".fa").removeClass("fa-angle-down");
      $(acordeon_seleccionado).find(".fa").addClass("fa-angle-up");
      $(this).next().show(750);
    } else {
      $(acordeon_seleccionado).find(".fa").addClass("fa-angle-down");
      $(acordeon_seleccionado).find(".fa").removeClass("fa-angle-up");
      $(this).next().hide(750);
    }
  });

  //Evento Cambio de dorso.
  $(".label_checkbox").siblings("input[name='dorso']").bind("change", cambiar_dorso);

  //Evento Cambio de fondo.
  $(".label_checkbox").siblings("input[name='fondo_pantalla']").bind(
    "change",
    cambiar_fondo_pantalla
  );

  //Evento Cambio de baraja.
  $(".label_checkbox").siblings("input[name='baraja']").bind("change", cambiar_baraja);

  //Eventos Cambio de idioma
  $(".select_selected").click(function (event) {
    event.stopPropagation(); //Detiene el evento de Ancestros (window) para poder abrir el menú
    $(".select_options").toggleClass("active");
  });

  //Cerrar menú al hacer clic fuera
  $(window).click(function () {
    $(".select_options").removeClass("active");
  });

  $(".select_options").click(function (event) {
    if (event.target.tagName === "LI") {
      cambiar_idioma();
    }
  });

  //End Eventos Cambio de idioma

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
  const imgs = document.querySelectorAll("#cart_up_column1, #cart_up_column2, #cart_up_column3")

  let counterLoader = 0
  imgs.forEach((img) => {
      img.addEventListener('load', function () {
        counterLoader++
        if (counterLoader >= imgs.length) {
          // Acciones a realizar una vez que la imagen haya cargado
          nueva_carta_baraja();
        }
      });
  })
}

function ruta_carta() {
  return (
    "src/barajas/" +
    actual_baraja.toLowerCase() +
    "-baraja/" +
    carta_aleatoria() +
    ".png"
  );
}

function carta_aleatoria() {
  var posicion_aleatoria = Math.floor(Math.random() * array_baraja_game.length);
  return array_baraja_game.splice(posicion_aleatoria, 1);
}

function nueva_carta_baraja() {
  cartas_restantes =
    document.getElementsByClassName("cartas_restantes")[0].innerHTML;

  var nueva_carta = ruta_carta();
  var baraja_carta = $("<img>")
    .attr({
      src: nueva_carta,
      alt: "Nueva Carta",
      style: "z-index: " + z_index,
    })
    .addClass("carts baraja_carta")
    .on('load', function () {
      // Acciones a realizar una vez que la imagen haya cargado
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

      if (cartas_restantes == 0) {
        $(".dorso_fixed").remove();
        $(".cartas_restantes").addClass("no_carts");
        $(".baraja").addClass("empty");
        lose_game();
      }
    });

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
        switch (column) {
          case "1":
            $("#cart_up_column1").attr("src", nueva_carta)
            .on('load', function () {
              $(".column" + column + ".dorso_helper").addClass("flip");
              $("#cart_up_column1").addClass("flip")
              events_on("cart_up_column1");
            });
            break;
          case "2":
            $("#cart_up_column2").attr("src", nueva_carta)
            .on('load', function () {
              $(".column" + column + ".dorso_helper").addClass("flip");
              $("#cart_up_column2").addClass("flip")
              events_on("cart_up_column2");
            });
            break;
          case "3":
            $("#cart_up_column3").attr("src", nueva_carta)
            .on('load', function () {
              $(".column" + column + ".dorso_helper").addClass("flip");
              $("#cart_up_column3").addClass("flip")
              events_on("cart_up_column3");
            });
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
  var input_baraja = document.getElementsByName("baraja");
  var baraja_ejemplo = document.getElementsByClassName("baraja_ejemplo");

  // Buscar todas las cartas boca arriba.
  var cartas_boca_arriba = $(
    ".baraja_carta, #cart_up_column1, #cart_up_column2, #cart_up_column3, .stack_discard"
  );

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

  if (baraja_seleccionada == BARAJAS.SPANISH) {
    actual_baraja = BARAJAS.SPANISH;

    //Bucle para cambiar el array_baraja_game
    for (
      var index_baraja_game = 0;
      index_baraja_game < array_baraja_game.length;
      index_baraja_game++
    ) {
      const array_elemento = array_baraja_game[index_baraja_game];
      let patron = /[^0-9]+/;
      let coincidencias = array_elemento.match(patron);
      let palo = coincidencias[0];
      array_baraja_game[index_baraja_game] = array_elemento.replace(
        palo,
        equivalentes_cambiar_a_spanish[palo]
      );
    }

    //Bucle para cambiar las cartas boca arriba
    for (var index = 0; index < cartas_boca_arriba.length; index++) {
      const carta_boca_arriba = cartas_boca_arriba[index];
      const src_carta_boca_arriba = carta_boca_arriba.getAttribute("src");
      let patron = /\/([^/0-9]+)\d*\.png$/;
      let coincidencias = src_carta_boca_arriba.match(patron);
      let palo = coincidencias[1];
      var nuevo_src = src_carta_boca_arriba
        .replace("french", "spanish")
        .replace(palo, equivalentes_cambiar_a_spanish[palo]);
      carta_boca_arriba.setAttribute("src", nuevo_src);
    }

    baraja_ejemplo[0].setAttribute(
      "src",
      "src/barajas/spanish-baraja/copa1.png"
    );
  } else if (baraja_seleccionada == BARAJAS.FRENCH) {
    actual_baraja = BARAJAS.FRENCH;

    //Bucle para cambiar el array_baraja_game
    for (
      var index_baraja_game = 0;
      index_baraja_game < array_baraja_game.length;
      index_baraja_game++
    ) {
      const array_elemento = array_baraja_game[index_baraja_game];
      let patron = /[^0-9]+/;
      let coincidencias = array_elemento.match(patron);
      let palo = coincidencias[0];
      array_baraja_game[index_baraja_game] = array_elemento.replace(
        palo,
        equivalentes_cambiar_a_french[palo]
      );
    }

    //Bucle para cambiar las cartas boca arriba
    for (var index = 0; index < cartas_boca_arriba.length; index++) {
      const carta_boca_arriba = cartas_boca_arriba[index];
      const src_carta_boca_arriba = carta_boca_arriba.getAttribute("src");
      let patron = /\/([^/0-9]+)\d*\.png$/;
      let coincidencias = src_carta_boca_arriba.match(patron);
      let palo = coincidencias[1];
      var nuevo_src = src_carta_boca_arriba
        .replace("spanish", "french")
        .replace(palo, equivalentes_cambiar_a_french[palo]);
      carta_boca_arriba.setAttribute("src", nuevo_src);
    }

    baraja_ejemplo[0].setAttribute(
      "src",
      "src/barajas/french-baraja/corazon1.png"
    );
  }
}

/*------------------------------------------------------End Opciones------------------------------------------------------*/

/*------------------------------------------------------Idiomas------------------------------------------------------*/

function cambiar_idioma() {

  var html = document.querySelector("html");
  var custom_select = document.querySelector(".container_custom_lenguaje");
  var container_select_selected =
    custom_select.querySelector(".select_selected");
  var select_selected = container_select_selected.querySelector("p");
  var select_options = custom_select.querySelector(".select_options");
  var select_options_listado = select_options.querySelector("li");

  //Intercambia un valor con el otro
  var select_selected_value = select_selected.getAttribute("value");
  var idioma_value = event.target.getAttribute("value");

  //Value para el idioma. ejemplos: es, en, fr
  select_selected.setAttribute("value", idioma_value);
  event.target.setAttribute("value", select_selected_value);

  select_options.classList.remove("active");

  //Implementa la traducción
  html.setAttribute("lang", idioma_value);
  var idioma_code = html.getAttribute("lang");

  // Carga el archivo JSON
  $.getJSON("src/resources/translations.json", function (jsonData) {
    // Obtén la traducción del texto al idioma seleccionado

    // Container_custom_lenguaje
    select_selected.innerHTML = jsonData.languages[0][idioma_code].name;
    select_options_listado.textContent =
      jsonData.languages[0][idioma_code].name_li;

    // Tabs
    document.querySelector(".tabs a[href='#tab1']").innerHTML =
      jsonData.languages[0][idioma_code].tabs.instrucciones;
    document.querySelector(".tabs a[href='#tab2']").innerHTML =
      jsonData.languages[0][idioma_code].tabs.apariencia;
    document.querySelector(".tabs a[href='#tab3']").innerHTML =
      jsonData.languages[0][idioma_code].tabs.empezar;

    // Instrucciones
    document.querySelector(".instrucciones > p:nth-child(1)").innerHTML =
      jsonData.languages[0][idioma_code].instrucciones.primer_p;
    document.querySelector(".instrucciones_container_ejemplos > p").innerHTML =
      jsonData.languages[0][idioma_code].instrucciones.ejemplos_p;
    document.querySelector(".instrucciones li:nth-child(1)").innerHTML =
      jsonData.languages[0][idioma_code].instrucciones.ejemplos_primer_li;
    document.querySelector(".instrucciones li:nth-child(2)").innerHTML =
      jsonData.languages[0][idioma_code].instrucciones.ejemplos_segundo_li;
    document.querySelector(".instrucciones > p:nth-child(3)").innerHTML =
      jsonData.languages[0][idioma_code].instrucciones.segundo_p;
    document.querySelector(".instrucciones > p:nth-child(4)").innerHTML =
      jsonData.languages[0][idioma_code].instrucciones.tercer_p;

    // Apariencia

    document.querySelector(
      ".apariencia .title_acordeon:nth-child(1) p"
    ).textContent = jsonData.languages[0][idioma_code].apariencia.dorso_titulo;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_dorso1']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.dorso_primer_radio;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_dorso2']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.dorso_segundo_radio;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_dorso3']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.dorso_tercer_radio;

    document.querySelector(
      ".apariencia .title_acordeon:nth-child(3) p"
    ).textContent = jsonData.languages[0][idioma_code].apariencia.fondo_titulo;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_fondo1']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.fondo_primer_radio;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_fondo2']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.fondo_segundo_radio;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_fondo3']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.fondo_tercer_radio;

    document.querySelector(
      ".apariencia .title_acordeon:nth-child(5) p"
    ).textContent = jsonData.languages[0][idioma_code].apariencia.baraja_titulo;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_baraja1']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.baraja_primer_radio;
    document.querySelector(
      ".apariencia .label_checkbox[for='radio_baraja2']"
    ).textContent =
      jsonData.languages[0][idioma_code].apariencia.baraja_segundo_radio;

    // Dificultad
    var button_dificultad_facil = document.querySelectorAll(
      ".button_dificultad[data-dificultad='Facil']"
    );
    var button_dificultad_medio = document.querySelectorAll(
      ".button_dificultad[data-dificultad='Medio']"
    );
    var button_dificultad_dificil = document.querySelectorAll(
      ".button_dificultad[data-dificultad='Dificil']"
    );

    document.querySelector(".start_game p").textContent =
      jsonData.languages[0][idioma_code].dificultad.titulo;
    document.querySelector(".restart_game p").textContent =
      jsonData.languages[0][idioma_code].dificultad.titulo;
    button_dificultad_facil[0].textContent =
      jsonData.languages[0][idioma_code].dificultad.facil;
    button_dificultad_facil[1].textContent =
      jsonData.languages[0][idioma_code].dificultad.facil;
    button_dificultad_medio[0].textContent =
      jsonData.languages[0][idioma_code].dificultad.medio;
    button_dificultad_medio[1].textContent =
      jsonData.languages[0][idioma_code].dificultad.medio;
    button_dificultad_dificil[0].textContent =
      jsonData.languages[0][idioma_code].dificultad.dificil;
    button_dificultad_dificil[1].textContent =
      jsonData.languages[0][idioma_code].dificultad.dificil;

    // Resultados
    document.querySelector(".new_game").textContent =
      jsonData.languages[0][idioma_code].volver;

    var resultado = document.querySelector(".result");
    resultado.textContent =
      resultado.hasAttribute("data-win") === true
        ? jsonData.languages[0][idioma_code].resultado_win
        : resultado.hasAttribute("data-lose") === true
          ? jsonData.languages[0][idioma_code].resultado_lose
          : "";

    // Tablet
    document.querySelector(".tablet_vertical_alert_text").textContent =
      jsonData.languages[0][idioma_code].tablet_alert;
  });
}
/*------------------------------------------------------End Idiomas------------------------------------------------------*/

function win_game() {
  //Activamos la animación de fuegos artificiales
  start_particula(TIPO_PARTICULA.fuegos_artificiales);
  var html = document.querySelector("html");

  var idioma_code = html.getAttribute("lang");
  var resultado = document.getElementsByClassName("result")[0];
  resultado.innerHTML =
    idioma_code === "es"
      ? "¡Felicidades!"
      : idioma_code === "en"
        ? "Congratulations!"
        : "";
  resultado.setAttribute("data-win", "true");

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
    var html = document.querySelector("html");
    var idioma_code = html.getAttribute("lang");
    var resultado = document.getElementsByClassName("result")[0];
    resultado.innerHTML =
      idioma_code === "es"
        ? "¡Suerte la próxima vez!"
        : idioma_code === "en"
          ? "Good luck next time!"
          : "";
    resultado.setAttribute("data-lose", "true");

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

  document.getElementsByClassName("result")[0].removeAttribute("data-win");
  document.getElementsByClassName("result")[0].removeAttribute("data-lose");

  $(".restart_game").removeClass("opened");
  z_index = 40;

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
