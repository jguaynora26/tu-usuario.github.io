// ===== ESTADO DEL JUEGO =====
let dinero = 10.00;
let ventasDelDia = 0;
let gananciaTotal = 0.00;

// Inventario: cada producto tiene un costo (lo que pagas al mayorista)
// y un precio (a cuánto lo vendes tú)
let inventario = [
  { nombre: "Patacones", costo: 0.40, precio: 0.75, stock: 5 },
  { nombre: "Raspao", costo: 0.60, precio: 1.00, stock: 3 },
  { nombre: "Chicha", costo: 0.25, precio: 0.50, stock: 8 },
  { nombre: "Empanada", costo: 0.80, precio: 1.25, stock: 4 }
];

let clienteActual = null;

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
  alert("Precio de " + inventario[indice].nombre + " cambiado a B/. " + nuevoPrecio.toFixed(2));
}

// ===== REABASTECER (comprar 5 unidades al costo) =====
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
  alert("Compraste 5 " + producto.nombre + " por B/. " + costoTotal.toFixed(2));
}

// ===== GENERAR CLIENTE =====
function generarCliente() {
  const disponibles = inventario.filter(function(p) { return p.stock > 0; });
  
  if (disponibles.length === 0) {
    document.getElementById("mensajeCliente").textContent = 
      "😢 No tienes productos. ¡Reabastece el inventario!";
    document.getElementById("btnAtender").disabled = true;
    return;
  }
  
  const indice = Math.floor(Math.random() * disponibles.length);
  clienteActual = disponibles[indice];
  
  // Cliente acepta comprar si el precio es razonable
  document.getElementById("mensajeCliente").textContent = 
    "👤 Cliente quiere: " + clienteActual.nombre + 
    " (Venta: B/. " + clienteActual.precio.toFixed(2) + ")";
  
  document.getElementById("btnAtender").disabled = false;
}

// ===== ATENDER CLIENTE =====
function atenderCliente() {
  if (clienteActual === null) return;
  
  if (clienteActual.stock <= 0) {
    document.getElementById("mensajeCliente").textContent = 
      "❌ No tienes " + clienteActual.nombre + " en stock.";
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
  
  document.getElementById("mensajeCliente").textContent = 
    "✅ Vendiste " + clienteActual.nombre + " por B/. " + 
    clienteActual.precio.toFixed(2) + 
    " (Ganancia: B/. " + ganancia.toFixed(2) + ")";
  
  clienteActual = null;
  actualizarPantalla();
  
  setTimeout(generarCliente, 2000);
}

// ===== INICIO =====
actualizarPantalla();
generarCliente();