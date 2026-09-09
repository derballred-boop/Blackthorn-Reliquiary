const formulario = document.getElementById("productoForm");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

const item = {

    nombre:
        document.getElementById("nombre").value,

    categoria:
        document.getElementById("categoria").value,

    patron:
        document.getElementById("patron").value,

    evento:
        document.getElementById("evento").value,

    descripcion:
        document.getElementById("descripcion").value,

    precio:
        document.getElementById("precio").value,

    imagen:
        document.getElementById("imagen").value
};

    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos.push(producto);

    localStorage.setItem("productos", JSON.stringify(productos));

    alert("Producto agregado correctamente");

    formulario.reset();
});
