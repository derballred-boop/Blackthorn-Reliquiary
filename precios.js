// ======================================================
// BLACKTHORN RELIQUIARY
// CARGA DE ÍTEMS DESDE FIREBASE FIRESTORE
// + SISTEMA DE VARIANTES / PATRONES
// ======================================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const contenedor = document.getElementById("productos");
const buscador = document.getElementById("buscador");
const categorias = document.getElementById("Items");
const filtroPatron = document.getElementById("filtroPatron");
const filtroEvento = document.getElementById("filtroEvento");
const sugerencias = document.getElementById("sugerencias");


// ======================================================
// LISTA DE PRODUCTOS
// ======================================================

let productos = [];


// ======================================================
// CARGAR PRODUCTOS
// ======================================================

async function cargarProductos() {

    if (!contenedor) {
        console.error("No se encontró #productos en el HTML.");
        return;
    }

    try {

        const mensajeCarga = document.createElement("p");

        mensajeCarga.className = "cargando";

        mensajeCarga.textContent = "Cargando ítems...";

        contenedor.innerHTML = "";

        contenedor.appendChild(mensajeCarga);


        const referencia =
            collection(db, "productos");


        const snapshot =
            await getDocs(referencia);


        productos = [];


        snapshot.forEach(documento => {

            productos.push({

                id: documento.id,

                ...documento.data()

            });

        });


        console.log(
            "Ítems cargados desde Firebase:",
            productos
        );


        // Actualizar filtros

        cargarCategorias();

        cargarPatrones();

        cargarEventos();


        // Mostrar productos

        mostrarProductos(productos);


    } catch (error) {

        console.error(
            "Error al cargar los ítems desde Firebase:",
            error
        );


        const mensajeError =
            document.createElement("p");

        mensajeError.className =
            "error-productos";

        mensajeError.textContent =
            "No se pudieron cargar los ítems.";

        contenedor.innerHTML = "";

        contenedor.appendChild(
            mensajeError
        );

    }

}


// ======================================================
// MOSTRAR PRODUCTOS
// ======================================================

function mostrarProductos(lista) {

    if (!contenedor) return;


    contenedor.innerHTML = "";


    if (lista.length === 0) {

        const mensaje =
            document.createElement("p");

        mensaje.className =
            "sin-productos";

        mensaje.textContent =
            "No se encontraron ítems.";

        contenedor.appendChild(
            mensaje
        );

        return;
    }


    lista.forEach(producto => {

        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "tarjeta-producto";


        // ==================================================
        // HACER LA TARJETA CLICKEABLE
        // ==================================================

        tarjeta.style.cursor = "pointer";


        tarjeta.title =
            "Haz clic para ver sus patrones y precios";


        tarjeta.addEventListener(
            "click",
            () => {

                mostrarVariantes(producto);

            }
        );


        // ==================================================
        // IMAGEN
        // ==================================================

        if (producto.imagen) {

            const imagen =
                document.createElement("img");

            imagen.src =
                producto.imagen;

            imagen.alt =
                producto.nombre || "Ítem";

            imagen.className =
                "imagen-producto";


            imagen.onerror =
                function () {

                    this.style.display =
                        "none";

                };


            tarjeta.appendChild(
                imagen
            );

        }


        // ==================================================
        // NOMBRE
        // ==================================================

        const nombre =
            document.createElement("h3");


        nombre.textContent =
            producto.nombre || "Sin nombre";


        tarjeta.appendChild(
            nombre
        );


        // ==================================================
        // CATEGORÍA
        // ==================================================

        if (producto.categoria) {

            const categoria =
                document.createElement("p");


            categoria.innerHTML =
                "<strong>Categoría:</strong> " +
                escaparHTML(
                    producto.categoria
                );


            tarjeta.appendChild(
                categoria
            );

        }


        // ==================================================
        // PATRÓN
        // ==================================================

        if (producto.patron) {

            const patron =
                document.createElement("p");


            patron.innerHTML =
                "<strong>Patrón:</strong> " +
                escaparHTML(
                    producto.patron
                );


            tarjeta.appendChild(
                patron
            );

        } else {

            const patron =
                document.createElement("p");


            patron.innerHTML =
                "<strong>Patrón:</strong> Sin patrón";


            tarjeta.appendChild(
                patron
            );

        }


        // ==================================================
        // EVENTO
        // ==================================================

        if (producto.evento) {

            const evento =
                document.createElement("p");


            evento.innerHTML =
                "<strong>Evento:</strong> " +
                escaparHTML(
                    producto.evento
                );


            tarjeta.appendChild(
                evento
            );

        }


        // ==================================================
        // PRECIO
        // ==================================================

        const precio =
            document.createElement("p");


        precio.className =
            "precio";


        precio.innerHTML =
            "<strong>Precio:</strong> " +
            obtenerPrecio(producto);


        tarjeta.appendChild(
            precio
        );


        // ==================================================
        // DESCRIPCIÓN
        // ==================================================

        if (producto.descripcion) {

            const descripcion =
                document.createElement("p");


            descripcion.className =
                "descripcion-producto";


            descripcion.textContent =
                producto.descripcion;


            tarjeta.appendChild(
                descripcion
            );

        }


        // ==================================================
        // INDICADOR
        // ==================================================

        const indicador =
            document.createElement("div");


        indicador.textContent =
            "✦ Ver patrones y precios";


        indicador.style.marginTop =
            "16px";


        indicador.style.paddingTop =
            "10px";


        indicador.style.borderTop =
            "1px solid rgba(105, 67, 109, 0.25)";


        indicador.style.color =
            "#765578";


        indicador.style.fontSize =
            "9px";


        indicador.style.letterSpacing =
            "1.5px";


        indicador.style.textAlign =
            "center";


        tarjeta.appendChild(
            indicador
        );


        // ==================================================
        // AGREGAR TARJETA
        // ==================================================

        contenedor.appendChild(
            tarjeta
        );

    });

}


// ======================================================
// OBTENER PRECIO
// ======================================================

function obtenerPrecio(producto) {

    if (
        producto.precioMin !== undefined &&
        producto.precioMax !== undefined &&
        producto.precioMin !== "" &&
        producto.precioMax !== ""
    ) {

        return (
            escaparHTML(producto.precioMin) +
            " - " +
            escaparHTML(producto.precioMax)
        );

    }


    if (
        producto.precio !== undefined &&
        producto.precio !== ""
    ) {

        return escaparHTML(
            producto.precio
        );

    }


    return "Sin precio";

}


// ======================================================
// MOSTRAR VARIANTES
// ======================================================
//
// Busca todos los productos que tengan el mismo nombre.
// De esta forma podemos tener:
//
// Sombrero X - Sin patrón
// Sombrero X - Dorado
// Sombrero X - Negro
//
// Cada uno con su propio precio.
// ======================================================

function mostrarVariantes(productoPrincipal) {

    const nombreBase =
        String(
            productoPrincipal.nombre || ""
        )
        .trim()
        .toLowerCase();


    const variantes =
        productos.filter(producto => {

            const nombre =
                String(
                    producto.nombre || ""
                )
                .trim()
                .toLowerCase();


            return nombre === nombreBase;

        });


    // ==================================================
    // CREAR FONDO
    // ==================================================

    const fondo =
        document.createElement("div");


    fondo.id =
        "ventanaVariantes";


    Object.assign(
        fondo.style,
        {

            position: "fixed",

            inset: "0",

            background:
                "rgba(0, 0, 0, 0.82)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            padding: "25px",

            zIndex: "9999",

            backdropFilter: "blur(5px)"

        }
    );


    // ==================================================
    // VENTANA
    // ==================================================

    const ventana =
        document.createElement("div");


    Object.assign(
        ventana.style,
        {

            position: "relative",

            width: "100%",

            maxWidth: "720px",

            maxHeight: "85vh",

            overflowY: "auto",

            padding: "32px",

            background:
                "linear-gradient(145deg, #1b141e, #0d0b10)",

            border:
                "1px solid #5c3f60",

            boxShadow:
                "0 20px 60px rgba(0,0,0,0.65)",

            color: "#ddd5df"

        }
    );


    // ==================================================
    // BOTÓN CERRAR
    // ==================================================

    const cerrar =
        document.createElement("button");


    cerrar.textContent =
        "✕";


    Object.assign(
        cerrar.style,
        {

            position: "absolute",

            top: "12px",

            right: "15px",

            width: "35px",

            height: "35px",

            background: "transparent",

            border: "1px solid #49334d",

            color: "#a98bab",

            cursor: "pointer",

            fontSize: "16px"

        }
    );


    cerrar.addEventListener(
        "click",
        () => {

            fondo.remove();

        }
    );


    ventana.appendChild(
        cerrar
    );


    // ==================================================
    // TÍTULO
    // ==================================================

    const titulo =
        document.createElement("h2");


    titulo.textContent =
        productoPrincipal.nombre ||
        "Ítem";


    Object.assign(
        titulo.style,
        {

            marginBottom: "8px",

            color: "#e5d8e7",

            fontSize: "25px",

            fontWeight: "normal",

            letterSpacing: "2px",

            paddingRight: "40px"

        }
    );


    ventana.appendChild(
        titulo
    );


    // ==================================================
    // CATEGORÍA
    // ==================================================

    const categoria =
        document.createElement("p");


    categoria.textContent =
        productoPrincipal.categoria
            ? productoPrincipal.categoria
            : "Sin categoría";


    Object.assign(
        categoria.style,
        {

            marginBottom: "25px",

            color: "#87618a",

            fontSize: "11px",

            letterSpacing: "2px"

        }
    );


    ventana.appendChild(
        categoria
    );


    // ==================================================
    // SEPARADOR
    // ==================================================

    const separador =
        document.createElement("div");


    Object.assign(
        separador.style,
        {

            width: "100%",

            height: "1px",

            background: "#302331",

            marginBottom: "20px"

        }
    );


    ventana.appendChild(
        separador
    );


    // ==================================================
    // TÍTULO DE VARIANTES
    // ==================================================

    const subtitulo =
        document.createElement("p");


    subtitulo.textContent =
        "PATRONES Y PRECIOS";


    Object.assign(
        subtitulo.style,
        {

            marginBottom: "15px",

            color: "#765578",

            fontSize: "9px",

            letterSpacing: "4px"

        }
    );


    ventana.appendChild(
        subtitulo
    );


    // ==================================================
    // LISTA DE VARIANTES
    // ==================================================

    const lista =
        document.createElement("div");


    variantes.forEach((
        variante,
        indice
    ) => {

        const fila =
            document.createElement("div");


        Object.assign(
            fila.style,
            {

                display: "grid",

                gridTemplateColumns:
                    "80px 1fr auto",

                alignItems: "center",

                gap: "15px",

                padding: "15px",

                marginBottom: "10px",

                background:
                    "rgba(10, 8, 12, 0.65)",

                border:
                    "1px solid #302331"

            }
        );


        // ==================================================
        // IMAGEN
        // ==================================================

        if (variante.imagen) {

            const imagen =
                document.createElement("img");


            imagen.src =
                variante.imagen;


            imagen.alt =
                variante.nombre ||
                "Ítem";


            Object.assign(
                imagen.style,
                {

                    width: "70px",

                    height: "70px",

                    objectFit: "contain",

                    border:
                        "1px solid #2d222f",

                    background:
                        "#0b090d"

                }
            );


            imagen.onerror =
                function () {

                    this.style.display =
                        "none";

                };


            fila.appendChild(
                imagen
            );

        } else {

            const espacio =
                document.createElement("div");


            Object.assign(
                espacio.style,
                {

                    width: "70px",

                    height: "70px",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    border:
                        "1px solid #2d222f",

                    color: "#654667"

                }
            );


            espacio.textContent =
                "✦";


            fila.appendChild(
                espacio
            );

        }


        // ==================================================
        // INFORMACIÓN
        // ==================================================

        const informacion =
            document.createElement("div");


        const patron =
            document.createElement("div");


        patron.textContent =
            variante.patron ||
            "Sin patrón";


        Object.assign(
            patron.style,
            {

                color: "#d8c7da",

                fontSize: "14px",

                letterSpacing: "1px",

                marginBottom: "6px"

            }
        );


        informacion.appendChild(
            patron
        );


        if (variante.evento) {

            const evento =
                document.createElement("div");


            evento.textContent =
                "Evento: " +
                variante.evento;


            Object.assign(
                evento.style,
                {

                    color: "#796d7b",

                    fontSize: "10px",

                    letterSpacing: "0.8px"

                }
            );


            informacion.appendChild(
                evento
            );

        }


        fila.appendChild(
            informacion
        );


        // ==================================================
        // PRECIO
        // ==================================================

        const precio =
            document.createElement("div");


        precio.textContent =
            obtenerPrecio(variante);


        Object.assign(
            precio.style,
            {

                color: "#c8a7ca",

                fontSize: "14px",

                letterSpacing: "1px",

                textAlign: "right",

                whiteSpace: "nowrap"

            }
        );


        fila.appendChild(
            precio
        );


        lista.appendChild(
            fila
        );

    });


    ventana.appendChild(
        lista
    );


    // ==================================================
    // INFORMACIÓN EXTRA
    // ==================================================

    if (variantes.length === 1) {

        const aviso =
            document.createElement("p");


        aviso.textContent =
            "Este ítem todavía no tiene otros patrones registrados.";


        Object.assign(
            aviso.style,
            {

                marginTop: "18px",

                color: "#665d68",

                fontSize: "11px",

                textAlign: "center",

                letterSpacing: "0.5px"

            }
        );


        ventana.appendChild(
            aviso
        );

    }


    // ==================================================
    // AGREGAR VENTANA
    // ==================================================

    fondo.appendChild(
        ventana
    );


    document.body.appendChild(
        fondo
    );


    // ==================================================
    // CERRAR AL TOCAR FUERA
    // ==================================================

    fondo.addEventListener(
        "click",
        (evento) => {

            if (
                evento.target === fondo
            ) {

                fondo.remove();

            }

        }
    );


    // ==================================================
    // CERRAR CON ESC
    // ==================================================

    const cerrarConEscape =
        (evento) => {

            if (
                evento.key === "Escape"
            ) {

                fondo.remove();

                document.removeEventListener(
                    "keydown",
                    cerrarConEscape
                );

            }

        };


    document.addEventListener(
        "keydown",
        cerrarConEscape
    );

}


// ======================================================
// CATEGORÍAS
// ======================================================

function cargarCategorias() {

    if (!categorias) return;


    const seleccion =
        categorias.value;


    categorias.innerHTML = "";


    const opcionTodas =
        document.createElement("option");


    opcionTodas.value =
        "";


    opcionTodas.textContent =
        "Todas las categorías";


    categorias.appendChild(
        opcionTodas
    );


    const lista = [

        ...new Set(

            productos
                .map(
                    producto =>
                        producto.categoria
                )
                .filter(Boolean)

        )

    ];


    lista.sort(
        (a, b) =>
            a.localeCompare(b)
    );


    lista.forEach(
        categoria => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                categoria;


            opcion.textContent =
                categoria;


            categorias.appendChild(
                opcion
            );

        }
    );


    if (
        lista.includes(seleccion)
    ) {

        categorias.value =
            seleccion;

    }

}


// ======================================================
// PATRONES
// ======================================================

function cargarPatrones() {

    if (!filtroPatron) return;


    const seleccion =
        filtroPatron.value;


    filtroPatron.innerHTML = "";


    const opcionTodos =
        document.createElement("option");


    opcionTodos.value =
        "";


    opcionTodos.textContent =
        "Todos los patrones";


    filtroPatron.appendChild(
        opcionTodos
    );


    const lista = [

        ...new Set(

            productos
                .map(
                    producto =>
                        producto.patron
                )
                .filter(Boolean)

        )

    ];


    lista.sort(
        (a, b) =>
            a.localeCompare(b)
    );


    lista.forEach(
        patron => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                patron;


            opcion.textContent =
                patron;


            filtroPatron.appendChild(
                opcion
            );

        }
    );


    if (
        lista.includes(seleccion)
    ) {

        filtroPatron.value =
            seleccion;

    }

}


// ======================================================
// EVENTOS
// ======================================================

function cargarEventos() {

    if (!filtroEvento) return;


    const seleccion =
        filtroEvento.value;


    filtroEvento.innerHTML = "";


    const opcionTodos =
        document.createElement("option");


    opcionTodos.value =
        "";


    opcionTodos.textContent =
        "Todos los eventos";


    filtroEvento.appendChild(
        opcionTodos
    );


    const lista = [

        ...new Set(

            productos
                .map(
                    producto =>
                        producto.evento
                )
                .filter(Boolean)

        )

    ];


    lista.sort(
        (a, b) =>
            a.localeCompare(b)
    );


    lista.forEach(
        evento => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                evento;


            opcion.textContent =
                evento;


            filtroEvento.appendChild(
                opcion
            );

        }
    );


    if (
        lista.includes(seleccion)
    ) {

        filtroEvento.value =
            seleccion;

    }

}


// ======================================================
// FILTRAR PRODUCTOS
// ======================================================

function filtrarProductos() {

    const texto =
        buscador
            ? buscador.value
                .toLowerCase()
                .trim()
            : "";


    const categoria =
        categorias
            ? categorias.value
            : "";


    const patron =
        filtroPatron
            ? filtroPatron.value
            : "";


    const evento =
        filtroEvento
            ? filtroEvento.value
            : "";


    const resultados =
        productos.filter(
            producto => {

                const contenido = [

                    producto.nombre,

                    producto.categoria,

                    producto.patron,

                    producto.evento,

                    producto.descripcion

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const coincideTexto =
                    !texto ||
                    contenido.includes(
                        texto
                    );


                const coincideCategoria =
                    !categoria ||
                    producto.categoria ===
                    categoria;


                const coincidePatron =
                    !patron ||
                    producto.patron ===
                    patron;


                const coincideEvento =
                    !evento ||
                    producto.evento ===
                    evento;


                return (

                    coincideTexto &&

                    coincideCategoria &&

                    coincidePatron &&

                    coincideEvento

                );

            }
        );


    mostrarProductos(
        resultados
    );


    mostrarSugerencias(
        texto
    );

}


// ======================================================
// SUGERENCIAS
// ======================================================

function mostrarSugerencias(texto) {

    if (!sugerencias) return;


    sugerencias.innerHTML = "";


    if (!texto) {

        sugerencias.style.display =
            "none";

        return;

    }


    const coincidencias =
        productos.filter(
            producto => {

                const nombre =
                    producto.nombre
                        ? producto.nombre
                            .toLowerCase()
                        : "";


                return nombre.includes(
                    texto
                );

            }
        );


    if (
        coincidencias.length === 0
    ) {

        sugerencias.style.display =
            "none";

        return;

    }


    coincidencias
        .slice(0, 5)
        .forEach(
            producto => {

                const opcion =
                    document.createElement(
                        "div"
                    );


                opcion.className =
                    "sugerencia";


                opcion.textContent =
                    producto.nombre;


                opcion.addEventListener(
                    "click",
                    () => {

                        if (buscador) {

                            buscador.value =
                                producto.nombre;

                        }


                        sugerencias.innerHTML =
                            "";


                        sugerencias.style.display =
                            "none";


                        filtrarProductos();

                    }
                );


                sugerencias.appendChild(
                    opcion
                );

            }
        );


    sugerencias.style.display =
        "block";

}


// ======================================================
// SEGURIDAD
// ======================================================

function escaparHTML(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {

        return "";

    }


    return String(valor)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// EVENTOS DEL BUSCADOR
// ======================================================

if (buscador) {

    buscador.addEventListener(
        "input",
        filtrarProductos
    );

}


// ======================================================
// EVENTOS DE FILTROS
// ======================================================

if (categorias) {

    categorias.addEventListener(
        "change",
        filtrarProductos
    );

}


if (filtroPatron) {

    filtroPatron.addEventListener(
        "change",
        filtrarProductos
    );

}


if (filtroEvento) {

    filtroEvento.addEventListener(
        "change",
        filtrarProductos
    );

}


// ======================================================
// INICIAR
// ======================================================

cargarProductos();