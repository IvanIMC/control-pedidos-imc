// Configuración de Firestore (asume que ya se inicializó firebase.js)
const db = firebase.firestore();

let pedidos = [];

function agregarPedido() {
  const codigo = document.getElementById("codigo").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!codigo || !cantidad || !proveedor || !fecha) {
    mostrarMensaje("⚠️ Completá todos los campos", "error");
    return;
  }

  const nuevo = { codigo, cantidad, proveedor, fecha, recibida: 0 };

  // Agregar visualmente
  pedidos.push(nuevo);
  renderizarTabla();

  // Guardar en Firebase
  db.collection("pedidos").add(nuevo)
    .then(() => {
      mostrarMensaje("✅ Pedido agregado correctamente");
      limpiarCampos();
    })
    .catch((error) => {
      mostrarMensaje("❌ Error al guardar en Firebase", "error");
      console.error("Error:", error);
    });
}

function limpiarCampos() {
  document.getElementById("codigo").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("proveedor").value = "";
  document.getElementById("fecha").value = "";
}

function buscarPedido() {
  const codigoBuscado = document.getElementById("busqueda").value.trim().toUpperCase();
  const resultado = pedidos.find(p => p.codigo.toUpperCase() === codigoBuscado);

  const div = document.getElementById("resultado-busqueda");
  div.innerHTML = "";

  if (resultado) {
    div.innerHTML = `
      <div class="resultado">
        <p><strong>Código:</strong> ${resultado.codigo}</p>
        <p><strong>Cantidad:</strong> ${resultado.cantidad}</p>
        <p><strong>Proveedor:</strong> ${resultado.proveedor}</p>
        <p><strong>Fecha:</strong> ${resultado.fecha}</p>
        <p><strong>Recibida:</strong> ${resultado.recibida}</p>
      </div>`;
  } else {
    div.innerHTML = `<p class="no-encontrado">❌ Pedido no encontrado</p>`;
  }
}

function renderizarTabla() {
  const tbody = document.getElementById("tabla-pedidos");
  tbody.innerHTML = "";

  pedidos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.codigo}</td>
      <td>${p.cantidad}</td>
      <td>${p.proveedor}</td>
      <td>${p.fecha}</td>
    `;
    tbody.appendChild(fila);
  });

  actualizarResumen();
}

function actualizarResumen() {
  const total = pedidos.length;
  const entregados = pedidos.filter(p => p.recibida >= p.cantidad).length;
  const parciales = pedidos.filter(p => p.recibida > 0 && p.recibida < p.cantidad).length;
  const pendientes = total - entregados - parciales;

  document.querySelector("#card-total span").textContent = total;
  document.querySelector("#card-entregados span").textContent = entregados;
  document.querySelector("#card-parciales span").textContent = parciales;
  document.querySelector("#card-pendientes span").textContent = pendientes;
}

function mostrarMensaje(mensaje, tipo = "ok") {
  const div = document.createElement("div");
  div.className = tipo === "ok" ? "toast" : "toast error";
  div.textContent = mensaje;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Eventos para botones
document.getElementById("btn-agregar").onclick = agregarPedido;
document.getElementById("btn-limpiar").onclick = limpiarCampos;

