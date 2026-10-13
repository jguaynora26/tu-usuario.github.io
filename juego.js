// ===== ESTADO INICIAL (por si no hay nada guardado) =====
const ESTADO_INICIAL = {
  dinero: 10.00,
  ventasDelDia: 0,
  gananciaTotal: 0.00,
  inventario: [
    { nombre: "Manzana", emoji: "🍎", costo: 0.30, precio: 0.60, stock: 5 },
    { nombre: "Plátano", emoji: "🍌", costo: 0.20, precio: 0.50, stock: 5 },
    { nombre: "Ensalada", emoji: "🥗", costo: 0.80, precio: 1.50, stock: 3 },
    { nombre: "Jugo natural", emoji: "🥤", costo: 0.40, precio: 1.00, stock: 4 },
    { nombre: "Zanahoria", emoji: "🥕", costo: 0.15, precio: 0.40, stock: 6 },
    { nombre: "Yogur", emoji: "🥛", costo: 0.50, precio: 1.10, stock: 3 }
  ]
};

// ===== VARIABLES DEL JUEGO =====
let dinero;
let ventasDelDia;
let gananciaTotal;
let inventario;
let clienteActual = null;

// ===== CARGAR DATOS GUARDADOS =====
function cargarJuego() {
  const guardado = localStorage.getItem("davidStore");
  
  if (guardado) {
    const datos = JSON.parse(guardado);
    dinero = datos.dinero;
    ventasDelDia = datos.ventasDelDia;
    gananciaTotal = datos.gananciaTotal;
    inventario = datos.inventario;
  } else {
    // No hay datos, empezar desde cero
    dinero = ESTADO_INICIAL.dinero;
    ventasDelDia = ESTADO_INICIAL.ventasDelDia;
    gananciaTotal = ESTADO_INICIAL.gananciaTotal;
    inventario = JSON.parse(JSON.stringify(ESTADO_INICIAL.inventario));
  }
}

// ===== GUARDAR DATOS =====
function guardarJuego() {
  const datos = {
    dinero: dinero,
    ventasDelDia: ventasDelDia,
    gananciaTotal: gananciaTotal,
    inventario: inventario
  };
  
  localStorage.setItem("davidStore", JSON.stringify(datos));
  mostrarNotificacionGuardado();
}

// ===== NOTIFICACIÓN DE GUARDADO =====
function mostrarNotificacionGuardado() {
  let notif = document.getElementById("notifGuardado");
  
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notifGuardado";
    notif.className = "notificacion-guardado";
    notif.textContent = "💾 Guardado";
    document.body.appendChild(notif);
  }
  
  notif.classList.add("visible");
  
  clearTimeout(notif.timeout);
  notif.timeout = setTimeout(function() {
    notif.classList.remove("visible");
  }, 1500);
}

// ===== ACTUALIZAR PANTALLA =====
function actualizarPantalla() {
  document.getElementById("dinero").textContent = dinero.toFixed(2);
  document.getElementById("ventas").textContent = ventasDelDia;
  document.getElementById("ganancia").textContent = gananciaTotal.toFixed(2);
  
  const contenedor = document.getElementById("inventario");
  contenedor.innerHTML = "";
  
  inventario.forEach(function(producto, indice) {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = 
      "<div class='emoji'>" + producto.emoji + "</div>" +
      "<h3>" + producto.nombre + "</h3>" +
      "<p class='costo'>Costo: B/. " + producto.costo.toFixed(2) + "</p>" +
      "<p>Venta: B/. " + producto.precio.toFixed(2) + "</p>" +
      "<p>Stock: " + producto.stock + "</p>" +
      "<input type='number' id='precio-" + indice + "' value='" + producto.precio.toFixed(2) + "' step='0.05' min='0'>" +
      "<button class='btn-precio' onclick='cambiarPrecio(" + indice + ")'>Cambiar precio</button>" +
      "<button class='btn-reabastecer' onclick='reabastecer(" + indice + ")'>+5 unidades</button>";
    contenedor.appendChild(div);
  });
}

// ===== CAMBIAR PRECIO =====
function cambiarPrecio(indice) {
  const input = document.getElementById("precio-" + indice);
  const nuevoPrecio = parseFloat(input.value);
  
  if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
    alert("Precio inválido");
    return;
  }
  
  inventario[indice].precio = nuevoPrecio;
  actualizarPantalla();
  guardarJuego();
  alert("Precio de " + inventario[indice].nombre + " cambiado a B/. " + nuevoPrecio.toFixed(2));
}

// ===== REABASTECER =====
function reabastecer(indice) {
  const producto = inventario[indice];
  const costoTotal = producto.costo * 5;
  
  if (dinero < costoTotal) {
    alert("No tienes suficiente dinero. Necesitas B/. " + costoTotal.toFixed(2));
    return;
  }
  
  dinero = dinero - costoTotal;
  producto.stock = producto.stock + 5;
  actualizarPantalla();
  guardarJuego();
  alert("Compraste 5 " + producto.emoji + " " + producto.nombre + " por B/. " + costoTotal.toFixed(2));
}

// ===== GENERAR CLIENTE =====
function generarCliente() {
  const disponibles = inventario.filter(function(p) { return p.stock > 0; });
  
  if (disponibles.length === 0) {
    const mensaje = document.getElementById("mensajeCliente");
    mensaje.textContent = "😢 No tienes productos. ¡Reabastece el inventario!";
    mensaje.classList.remove("aparecer");
    document.getElementById("btnAtender").disabled = true;
    return;
  }
  
  const indice = Math.floor(Math.random() * disponibles.length);
  clienteActual = disponibles[indice];
  
  const mensaje = document.getElementById("mensajeCliente");
  mensaje.textContent = "👤 Un cliente quiere comprar " + 
    clienteActual.emoji + " " + clienteActual.nombre + 
    " (Venta: B/. " + clienteActual.precio.toFixed(2) + ")";
  
  mensaje.classList.remove("aparecer");
  void mensaje.offsetWidth;
  mensaje.classList.add("aparecer");
  
  document.getElementById("btnAtender").disabled = false;
}

// ===== ATENDER CLIENTE =====
function atenderCliente() {
  if (clienteActual === null) return;
  
  if (clienteActual.stock <= 0) {
    document.getElementById("mensajeCliente").textContent = 
      "❌ No tienes " + clienteActual.emoji + " " + clienteActual.nombre + " en stock.";
    clienteActual = null;
    setTimeout(generarCliente, 1500);
    return;
  }
  
  // Vender
  dinero = dinero + clienteActual.precio;
  const ganancia = clienteActual.precio - clienteActual.costo;
  gananciaTotal = gananciaTotal + ganancia;
  clienteActual.stock = clienteActual.stock - 1;
  ventasDelDia = ventasDelDia + 1;
  
  const mensaje = document.getElementById("mensajeCliente");
  mensaje.textContent = "✅ Vendiste " + clienteActual.emoji + " " + 
    clienteActual.nombre + " por B/. " + clienteActual.precio.toFixed(2) + 
    " (Ganancia: B/. " + ganancia.toFixed(2) + ")";
  
  // Animación del dinero
  const dineroElemento = document.getElementById("dinero");
  dineroElemento.classList.remove("dinero-animado");
  void dineroElemento.offsetWidth;
  dineroElemento.classList.add("dinero-animado");
  
  clienteActual = null;
  actualizarPantalla();
  guardarJuego();
  
  setTimeout(generarCliente, 2000);
}

// ===== REINICIAR JUEGO =====
function reiniciarJuego() {
  const confirmar = confirm("¿Seguro que quieres reiniciar el juego? Perderás todo tu progreso.");
  
  if (!confirmar) return;
  
  localStorage.removeItem("davidStore");
  cargarJuego();
  actualizarPantalla();
  generarCliente();
  alert("🔄 Juego reiniciado. ¡Empiezas de nuevo con B/. 10.00!");
}

// ===== INICIO =====
cargarJuego();
actualizarPantalla();
generarCliente();
