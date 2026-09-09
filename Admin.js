// ==========================================================
// BLACKTHORN RELIQUIARY
// ADMIN.JS
// ==========================================================

import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";


// ==========================================================
// FIREBASE STORAGE
// ==========================================================

const storage = getStorage();


// ==========================================================
// LOGIN
// ==========================================================

const formLogin = document.getElementById("formLogin");
const correoLogin = document.getElementById("correoLogin");
const passwordLogin = document.getElementById("passwordLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

const pantallaLogin = document.getElementById("pantallaLogin");
const panelAdmin = document.getElementById("panelAdmin");
const botonCerrarSesion = document.getElementById("botonCerrarSesion");


// ==========================================================
// PRODUCTOS
// ==========================================================

const formItem = document.getElementById("formItem");

const nombre = document.getElementById("nombre");
const categoria = document.getElementById("categoria");
const patron = document.getElementById("patron");
const evento = document.getElementById("evento");
const descripcion = document.getElementById("descripcion");

const precioMin = document.getElementById("precioMin");
const precioMax = document.getElementById("precioMax");

const imagen = document.getElementById("imagen");
const imagenArchivo = document.getElementById("imagenArchivo");
const vistaPrevia = document.getElementById("vistaPrevia");

const botonGuardar = document.getElementById("botonGuardar");
const botonCancelar = document.getElementById("botonCancelar");

const tituloFormulario = document.getElementById("tituloFormulario");

const busquedaAdmin = document.getElementById("busquedaAdmin");
const listaItems = document.getElementById("listaItems");


// ==========================================================
// PATRONES
// ==========================================================

const nuevoPatron = document.getElementById("nuevoPatron");
const botonAgregarPatron =
    document.getElementById("botonAgregarPatron");

const listaPatrones =
    document.getElementById("listaPatrones");


// ==========================================================
// EVENTOS
// ==========================================================

const nuevoEvento = document.getElementById("nuevoEvento");
const botonAgregarEvento =
    document.getElementById("botonAgregarEvento");

const listaEventos =
    document.getElementById("listaEventos");


// ==========================================================
// VARIABLES
// ==========================================================

let productos = [];
let patrones = [];
let eventos = [];

let productoEditando = null;


// ==========================================================
// LOGIN
// ==========================================================

if (formLogin) {

    formLogin.addEventListener("submit", async (e) => {

        e.preventDefault();

        const correo =
            correoLogin.value.trim();

        const password =
            passwordLogin.value;

        try {

            mensajeLogin.textContent =
                "Iniciando sesión...";

            await signInWithEmailAndPassword(
                auth,
                correo,
                password
            );

            mensajeLogin.textContent = "";

        } catch (error) {

            console.error(error);

            mensajeLogin.textContent =
                "❌ Correo o contraseña incorrectos.";
        }
    });
}


// ==========================================================
// ESTADO DE AUTENTICACIÓN
// ==========================================================

onAuthStateChanged(auth, (usuario) => {

    if (usuario) {

        if (pantallaLogin) {
            pantallaLogin.style.display = "none";
        }

        if (panelAdmin) {
            panelAdmin.style.display = "block";
        }

        cargarProductos();
        cargarPatrones();
        cargarEventos();

    } else {

        if (pantallaLogin) {
            pantallaLogin.style.display = "block";
        }

        if (panelAdmin) {
            panelAdmin.style.display = "none";
        }
    }
});


// ==========================================================
// CERRAR SESIÓN
// ==========================================================

if (botonCerrarSesion) {

    botonCerrarSesion.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

            } catch (error) {

                console.error(error);

            }
        }
    );
}


// ==========================================================
// SUBIR IMAGEN A FIREBASE STORAGE
// ==========================================================

async function subirImagen(archivo) {

    if (!archivo) return null;


    // Comprobar que sea una imagen

    if (!archivo.type.startsWith("image/")) {

        alert(
            "❌ El archivo seleccionado no es una imagen."
        );

        return null;
    }


    try {

        // Mostrar mensaje

        if (vistaPrevia) {

            vistaPrevia.innerHTML = `
                <span>
                    ⏳ Subiendo imagen...
                </span>
            `;
        }


        // Limpiar nombre

        let nombreSeguro =
            archivo.name
                .replace(/\s+/g, "_")
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    ""
                );


        // Si la captura no tiene nombre,
        // usamos uno automático

        if (!nombreSeguro) {

            nombreSeguro =
                "imagen.png";
        }


        // Crear nombre único

        const nombreFinal =
            Date.now() +
            "_" +
            nombreSeguro;


        // Carpeta de Firebase Storage

        const ruta =
            `productos/${nombreFinal}`;


        // Crear referencia

        const referencia =
            ref(storage, ruta);


        // Subir archivo

        await uploadBytes(
            referencia,
            archivo
        );


        // Obtener URL

        const url =
            await getDownloadURL(
                referencia
            );


        // Guardar URL

        if (imagen) {

            imagen.value = url;
        }


        // Mostrar preview

        mostrarVistaPrevia(url);


        console.log(
            "✅ Imagen subida correctamente:",
            url
        );


        return url;


    } catch (error) {

        console.error(
            "❌ Error al subir imagen:",
            error
        );


        if (vistaPrevia) {

            vistaPrevia.innerHTML = `
                <span>
                    ❌ Error al subir la imagen
                </span>
            `;
        }


        alert(
            "❌ No se pudo subir la imagen.\n\n" +
            "Revisa Firebase Storage y sus reglas."
        );


        return null;
    }
}


// ==========================================================
// SELECCIONAR IMAGEN DESDE LA COMPUTADORA
// ==========================================================

if (imagenArchivo) {

    imagenArchivo.addEventListener(
        "change",
        async () => {

            const archivo =
                imagenArchivo.files[0];

            if (archivo) {

                await subirImagen(
                    archivo
                );
            }
        }
    );
}


// ==========================================================
// PEGAR CAPTURAS CON CTRL + V
// ==========================================================

document.addEventListener(
    "paste",
    async (e) => {

        const items =
            e.clipboardData?.items;

        if (!items) return;


        for (const item of items) {

            if (
                item.type.startsWith(
                    "image/"
                )
            ) {

                const archivo =
                    item.getAsFile();


                if (archivo) {

                    // Crear nombre para captura

                    const archivoCaptura =
                        new File(
                            [archivo],
                            "captura.png",
                            {
                                type:
                                    archivo.type ||
                                    "image/png"
                            }
                        );


                    await subirImagen(
                        archivoCaptura
                    );
                }


                break;
            }
        }
    }
);


// ==========================================================
// VISTA PREVIA DE IMAGEN
// ==========================================================

if (imagen) {

    imagen.addEventListener(
        "input",
        () => {

            mostrarVistaPrevia(
                imagen.value.trim()
            );
        }
    );
}


function mostrarVistaPrevia(url) {

    if (!vistaPrevia) return;


    if (!url) {

        vistaPrevia.innerHTML = `
            <span>
                La vista previa aparecerá aquí
            </span>
        `;

        return;
    }


    vistaPrevia.innerHTML = `
        <img
            src="${url}"
            alt="Vista previa"
            style="
                max-width: 100%;
                max-height: 250px;
                width: auto;
                height: auto;
                object-fit: contain;
                border-radius: 10px;
                display: block;
                margin: auto;
            "
            onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='block';
            "
        >

        <span style="display:none;">
            ❌ No se pudo cargar la imagen
        </span>
    `;
}


// ==========================================================
// CARGAR PRODUCTOS
// ==========================================================

async function cargarProductos() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "productos"
                )
            );


        productos = [];


        snapshot.forEach(
            (documento) => {

                productos.push({

                    id: documento.id,

                    ...documento.data()

                });
            }
        );


        mostrarItems(productos);


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );
    }
}


// ==========================================================
// MOSTRAR PRODUCTOS
// ==========================================================

function mostrarItems(lista) {

    if (!listaItems) return;


    listaItems.innerHTML = "";


    if (lista.length === 0) {

        listaItems.innerHTML = `
            <p style="text-align:center;">
                No hay productos.
            </p>
        `;

        return;
    }


    lista.forEach((producto) => {


        const elemento =
            document.createElement("div");


        elemento.className =
            "item-card";


        // Precio mínimo

        const precioMinimo =
            producto.precioMin ??
            producto.precio ??
            "";


        // Precio máximo

        const precioMaximo =
            producto.precioMax ??
            producto.precio ??
            "";


        let precioTexto =
            "Sin precio";


        if (
            precioMinimo !== "" &&
            precioMaximo !== ""
        ) {

            precioTexto =
                `${precioMinimo} - ${precioMaximo}`;

        } else if (
            precioMinimo !== ""
        ) {

            precioTexto =
                `${precioMinimo}`;
        }


        elemento.innerHTML = `

            <div class="item-imagen">

                ${
                    producto.imagen

                    ?

                    `
                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre || ""}"
                    >
                    `

                    :

                    `
                    <div class="sin-imagen">
                        Sin imagen
                    </div>
                    `
                }

            </div>


            <div class="item-info">

                <h3>
                    ${producto.nombre || "Sin nombre"}
                </h3>

                <p>
                    <strong>Categoría:</strong>
                    ${producto.categoria || "Sin categoría"}
                </p>

                <p>
                    <strong>Patrón:</strong>
                    ${producto.patron || "Sin patrón"}
                </p>

                <p>
                    <strong>Evento:</strong>
                    ${producto.evento || "Sin evento"}
                </p>

                <p>
                    <strong>Precio:</strong>
                    ${precioTexto}
                </p>

            </div>


            <div class="item-botones">

                <button
                    type="button"
                    class="boton-editar"
                >
                    ✏️ Editar
                </button>


                <button
                    type="button"
                    class="boton-eliminar"
                >
                    🗑️ Eliminar
                </button>

            </div>

        `;


        // EDITAR

        elemento
            .querySelector(".boton-editar")
            .addEventListener(
                "click",
                () => {

                    editarProducto(
                        producto
                    );
                }
            );


        // ELIMINAR

        elemento
            .querySelector(".boton-eliminar")
            .addEventListener(
                "click",
                () => {

                    eliminarProducto(
                        producto.id
                    );
                }
            );


        listaItems.appendChild(
            elemento
        );
    });
}


// ==========================================================
// GUARDAR PRODUCTO
// ==========================================================

if (formItem) {

    formItem.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const item = {

                nombre:
                    nombre.value.trim(),

                categoria:
                    categoria.value.trim(),

                patron:
                    patron.value.trim(),

                evento:
                    evento.value.trim(),

                descripcion:
                    descripcion.value.trim(),

                precioMin:
                    precioMin.value !== ""
                        ? Number(
                            precioMin.value
                        )
                        : null,

                precioMax:
                    precioMax.value !== ""
                        ? Number(
                            precioMax.value
                        )
                        : null,

                imagen:
                    imagen.value.trim()
            };


            try {

                botonGuardar.disabled =
                    true;


                // EDITAR

                if (productoEditando) {

                    await updateDoc(

                        doc(
                            db,
                            "productos",
                            productoEditando
                        ),

                        item

                    );


                    alert(
                        "✅ Producto actualizado."
                    );


                }

                // NUEVO

                else {

                    await addDoc(

                        collection(
                            db,
                            "productos"
                        ),

                        item

                    );


                    alert(
                        "✅ Producto agregado."
                    );
                }


                limpiarFormulario();


                await cargarProductos();


            } catch (error) {

                console.error(
                    "Error guardando producto:",
                    error
                );


                alert(
                    "❌ Ocurrió un error al guardar el producto."
                );


            } finally {

                botonGuardar.disabled =
                    false;
            }
        }
    );
}


// ==========================================================
// EDITAR PRODUCTO
// ==========================================================

function editarProducto(producto) {

    productoEditando =
        producto.id;


    nombre.value =
        producto.nombre || "";


    categoria.value =
        producto.categoria || "";


    patron.value =
        producto.patron || "";


    evento.value =
        producto.evento || "";


    descripcion.value =
        producto.descripcion || "";


    precioMin.value =
        producto.precioMin ??
        producto.precio ??
        "";


    precioMax.value =
        producto.precioMax ??
        producto.precio ??
        "";


    imagen.value =
        producto.imagen || "";


    if (imagenArchivo) {

        imagenArchivo.value =
            "";
    }


    tituloFormulario.textContent =
        "Editar producto";


    botonGuardar.textContent =
        "💾 Guardar cambios";


    botonCancelar.style.display =
        "inline-flex";


    mostrarVistaPrevia(
        producto.imagen || ""
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });
}


// ==========================================================
// CANCELAR EDICIÓN
// ==========================================================

if (botonCancelar) {

    botonCancelar.addEventListener(
        "click",
        limpiarFormulario
    );
}


// ==========================================================
// LIMPIAR FORMULARIO
// ==========================================================

function limpiarFormulario() {

    if (formItem) {

        formItem.reset();
    }


    productoEditando =
        null;


    if (tituloFormulario) {

        tituloFormulario.textContent =
            "Agregar producto";
    }


    if (botonGuardar) {

        botonGuardar.textContent =
            "➕ Guardar producto";
    }


    if (botonCancelar) {

        botonCancelar.style.display =
            "none";
    }


    if (vistaPrevia) {

        vistaPrevia.innerHTML = `
            <span>
                La vista previa aparecerá aquí
            </span>
        `;
    }
}


// ==========================================================
// ELIMINAR PRODUCTO
// ==========================================================

async function eliminarProducto(id) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar este producto?"
        );


    if (!confirmar) return;


    try {

        await deleteDoc(

            doc(
                db,
                "productos",
                id
            )

        );


        await cargarProductos();


    } catch (error) {

        console.error(
            "Error eliminando producto:",
            error
        );


        alert(
            "❌ No se pudo eliminar el producto."
        );
    }
}


// ==========================================================
// BUSCAR PRODUCTOS
// ==========================================================

if (busquedaAdmin) {

    busquedaAdmin.addEventListener(
        "input",
        filtrarProductos
    );
}


function filtrarProductos() {

    const texto =
        busquedaAdmin.value
            .toLowerCase()
            .trim();


    const filtrados =
        productos.filter(
            (producto) => {

                return (

                    (producto.nombre || "")
                        .toLowerCase()
                        .includes(texto)

                    ||

                    (producto.categoria || "")
                        .toLowerCase()
                        .includes(texto)

                    ||

                    (producto.patron || "")
                        .toLowerCase()
                        .includes(texto)

                    ||

                    (producto.evento || "")
                        .toLowerCase()
                        .includes(texto)

                );
            }
        );


    mostrarItems(
        filtrados
    );
}


// ==========================================================
// CARGAR PATRONES
// ==========================================================

async function cargarPatrones() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "patrones"
                )
            );


        patrones = [];


        if (patron) {

            patron.innerHTML = `
                <option value="">
                    Sin patrón
                </option>
            `;
        }


        snapshot.forEach(
            (documento) => {

                const datos =
                    documento.data();


                const item = {

                    id:
                        documento.id,

                    nombre:
                        datos.nombre

                };


                patrones.push(
                    item
                );


                if (patron) {

                    patron.innerHTML += `

                        <option
                            value="${item.nombre}"
                        >
                            ${item.nombre}
                        </option>

                    `;
                }
            }
        );


        mostrarPatrones();


    } catch (error) {

        console.error(
            "Error cargando patrones:",
            error
        );
    }
}


// ==========================================================
// AGREGAR PATRÓN
// ==========================================================

async function agregarPatron() {

    const nombrePatron =
        nuevoPatron.value.trim();


    if (!nombrePatron) {

        alert(
            "Escribe el nombre del patrón."
        );

        return;
    }


    try {

        await addDoc(

            collection(
                db,
                "patrones"
            ),

            {
                nombre:
                    nombrePatron
            }

        );


        nuevoPatron.value =
            "";


        await cargarPatrones();


    } catch (error) {

        console.error(
            "Error agregando patrón:",
            error
        );


        alert(
            "❌ No se pudo agregar el patrón."
        );
    }
}


if (botonAgregarPatron) {

    botonAgregarPatron.addEventListener(
        "click",
        agregarPatron
    );
}


// ==========================================================
// MOSTRAR PATRONES
// ==========================================================

function mostrarPatrones() {

    if (!listaPatrones) return;


    listaPatrones.innerHTML =
        "";


    patrones.forEach(
        (item) => {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "opcion-card";


            elemento.innerHTML = `

                <span>
                    🎨 ${item.nombre}
                </span>

                <button
                    type="button"
                >
                    🗑️
                </button>

            `;


            elemento
                .querySelector("button")
                .addEventListener(
                    "click",
                    async () => {

                        if (
                            !confirm(
                                `¿Eliminar "${item.nombre}"?`
                            )
                        ) {

                            return;
                        }


                        try {

                            await deleteDoc(

                                doc(
                                    db,
                                    "patrones",
                                    item.id
                                )

                            );


                            await cargarPatrones();


                        } catch (error) {

                            console.error(
                                error
                            );
                        }
                    }
                );


            listaPatrones.appendChild(
                elemento
            );
        }
    );
}


// ==========================================================
// CARGAR EVENTOS
// ==========================================================

async function cargarEventos() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "eventos"
                )
            );


        eventos = [];


        if (evento) {

            evento.innerHTML = `
                <option value="">
                    Sin evento
                </option>
            `;
        }


        snapshot.forEach(
            (documento) => {

                const datos =
                    documento.data();


                const item = {

                    id:
                        documento.id,

                    nombre:
                        datos.nombre

                };


                eventos.push(
                    item
                );


                if (evento) {

                    evento.innerHTML += `

                        <option
                            value="${item.nombre}"
                        >
                            ${item.nombre}
                        </option>

                    `;
                }
            }
        );


        mostrarEventos();


    } catch (error) {

        console.error(
            "Error cargando eventos:",
            error
        );
    }
}


// ==========================================================
// AGREGAR EVENTO
// ==========================================================

async function agregarEvento() {

    const nombreEvento =
        nuevoEvento.value.trim();


    if (!nombreEvento) {

        alert(
            "Escribe el nombre del evento."
        );

        return;
    }


    try {

        await addDoc(

            collection(
                db,
                "eventos"
            ),

            {
                nombre:
                    nombreEvento
            }

        );


        nuevoEvento.value =
            "";


        await cargarEventos();


    } catch (error) {

        console.error(
            "Error agregando evento:",
            error
        );


        alert(
            "❌ No se pudo agregar el evento."
        );
    }
}


if (botonAgregarEvento) {

    botonAgregarEvento.addEventListener(
        "click",
        agregarEvento
    );
}


// ==========================================================
// MOSTRAR EVENTOS
// ==========================================================

function mostrarEventos() {

    if (!listaEventos) return;


    listaEventos.innerHTML =
        "";


    eventos.forEach(
        (item) => {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "opcion-card";


            elemento.innerHTML = `

                <span>
                    🎉 ${item.nombre}
                </span>

                <button
                    type="button"
                >
                    🗑️
                </button>

            `;


            elemento
                .querySelector("button")
                .addEventListener(
                    "click",
                    async () => {

                        if (
                            !confirm(
                                `¿Eliminar "${item.nombre}"?`
                            )
                        ) {

                            return;
                        }


                        try {

                            await deleteDoc(

                                doc(
                                    db,
                                    "eventos",
                                    item.id
                                )

                            );


                            await cargarEventos();


                        } catch (error) {

                            console.error(
                                error
                            );
                        }
                    }
                );


            listaEventos.appendChild(
                elemento
            );
        }
    );
}
