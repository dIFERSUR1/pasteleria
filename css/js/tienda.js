const productos = [
  { id: 1, nombre: "Torta Tres Leches", categoria: "tortas", precio: 45.00, img: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500" },
  { id: 2, nombre: "Torta de Chocolate", categoria: "tortas", precio: 55.00, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500" },
  { id: 3, nombre: "Alfajores Artesanales (12u)", categoria: "pasteles", precio: 22.00, img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500" },
  { id: 4, nombre: "Pie de Limón", categoria: "pasteles", precio: 38.00, img: "https://images.unsplash.com/photo-1519869325930-281384150729?w=500" },
  
  // 4 productos de la categoría Salados
  { id: 5, nombre: "Empanada de Carne Criolla", categoria: "salados", precio: 8.50, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500" },
  { id: 6, nombre: "Pan con Chicharrón", categoria: "salados", precio: 16.00, img: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500" },
  { id: 7, nombre: "Quiche de Jamón y Queso", categoria: "salados", precio: 12.00, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500" },
  { id: 8, nombre: "Tamal Criollo Especial", categoria: "salados", precio: 9.00, img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500" }
];

const soles = (monto) => `S/ ${monto.toFixed(2)}`;
const sumar = (...numeros) => numeros.reduce((a, n) => a + n, 0);
function contarUnidades(lista) {
  if (lista.length === 0) return 0;
  const [primero, ...resto] = lista;
  return primero.cantidad + contarUnidades(resto);
}

// Función con parámetro por defecto para el descuento (> S/ 100)
const aplicarDescuento = (total, porcentaje = 10) => {
  return total > 100 ? total * (porcentaje / 100) : 0;
};

// Closure para el estado privado del carrito
function crearCarrito() {
  let items = [];

  return {
    agregar(producto, cantidad = 1) {
      const existe = items.find(it => it.id === producto.id);
      if (existe) {
        existe.cantidad += cantidad;
      } else {
        items.push({ ...producto, cantidad });
      }
    },
    eliminar(id) {
      items = items.filter(it => it.id !== id);
    },
    obtenerItems: () => [...items],
    subtotal: () => sumar(...items.map(it => it.precio * it.cantidad)),
    unidades: () => contarUnidades(items),
    vaciar() { items = []; }
  };
}

const carrito = crearCarrito();

// ==========================================
// 3. Renderizado y Manejo de Eventos
// ==========================================

const contenedorProductos = document.querySelector("#contenedor-productos");
const contenedorItemsCarrito = document.querySelector("#items-carrito");
const badgeContador = document.querySelector("#badge-contador");
const elemSubtotal = document.querySelector("#subtotal-carrito");
const elemMontoDescuento = document.querySelector("#monto-descuento");
const elemFilaDescuento = document.querySelector("#fila-descuento");
const elemTotal = document.querySelector("#total-carrito");
const inputBuscar = document.querySelector("#input-buscar");

// Renderizar tarjetas de productos
function renderizarProductos(lista) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";
  
  if (lista.length === 0) {
    contenedorProductos.innerHTML = `<p class="text-center fg-secondary w-100 py-5">No se encontraron productos.</p>`;
    return;
  }

  lista.forEach(prod => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card h-100 shadow-sm border rounded-4 overflow-hidden">
        <img src="${prod.img}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge theme-primary text-uppercase fs-xs">${prod.categoria}</span>
              <span class="fw-bold fs-lg color-marca">${soles(prod.precio)}</span>
            </div>
            <h5 class="card-title fw-bold fs-xl mb-3">${prod.nombre}</h5>
          </div>
          <button class="btn btn-solid theme-primary w-100 btn-agregar" data-id="${prod.id}">
            + Agregar al Carrito
          </button>
        </div>
      </div>
    `;
    contenedorProductos.appendChild(col);
  });

  // Event listeners para agregar
  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const prod = productos.find(p => p.id === id);
      carrito.agregar(prod);
      actualizarCarritoUI();
      mostrarToast(`¡${prod.nombre} agregado al carrito!`);
    });
  });
}

// Actualizar Drawer y Totales
function actualizarCarritoUI() {
  const items = carrito.obtenerItems();
  contenedorItemsCarrito.innerHTML = "";

  if (items.length === 0) {
    contenedorItemsCarrito.innerHTML = `<p class="text-center fg-secondary py-5">El carrito está vacío.</p>`;
  } else {
    items.forEach(it => {
      const div = document.createElement("div");
      div.className = "list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom";
      div.innerHTML = `
        <div>
          <h6 class="mb-1 fw-bold">${it.nombre}</h6>
          <small class="fg-secondary">${soles(it.precio)} x ${it.cantidad}</small>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="fw-bold">${soles(it.precio * it.cantidad)}</span>
          <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${it.id}">✕</button>
        </div>
      `;
      contenedorItemsCarrito.appendChild(div);
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        carrito.eliminar(id);
        actualizarCarritoUI();
      });
    });
  }

  const subtotal = carrito.subtotal();
  const descuento = aplicarDescuento(subtotal);
  const total = subtotal - descuento;

  badgeContador.textContent = carrito.unidades();
  elemSubtotal.textContent = soles(subtotal);
  
  if (descuento > 0) {
    elemFilaDescuento.style.display = "flex";
    elemMontoDescuento.textContent = `-${soles(descuento)}`;
  } else {
    elemFilaDescuento.style.display = "none";
  }

  elemTotal.textContent = soles(total);
}

// Mostrar Toast de Bootstrap 6 de manera segura
function mostrarToast(mensaje) {
  const toastElem = document.querySelector("#notificacion-toast");
  document.querySelector("#toast-mensaje").textContent = mensaje;
  
  if (window.bootstrap && window.bootstrap.Toast) {
    const toast = window.bootstrap.Toast.getOrCreateInstance(toastElem);
    toast.show();
  }
}

// Evento de Filtros
document.querySelector("#contenedor-filtros")?.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    document.querySelectorAll("#contenedor-filtros .btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    const cat = e.target.dataset.categoria;
    const filtrados = cat === "todos" ? productos : productos.filter(p => p.categoria === cat);
    renderizarProductos(filtrados);
  }
});

// Evento Buscador
inputBuscar?.addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase().trim();
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
  renderizarProductos(filtrados);
});

// Evento Formulario
document.querySelector("#form-personalizado")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("¡Gracias por tu solicitud! Te contactaremos pronto con la cotización.");
  e.target.reset();
});

// Inicializar la carga al estar listo el DOM
document.addEventListener("DOMContentLoaded", () => {
  renderizarProductos(productos);
  actualizarCarritoUI();
});

// Ejecución directa de seguridad por si el evento DOMContentLoaded ya pasó
renderizarProductos(productos);
actualizarCarritoUI();
