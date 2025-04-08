// script.js

// Inicializar Firebase ya está hecho desde firebase.js

const db = firebase.firestore();
let pedidos = [];

function renderPedidos() {
  const tbody = document.getElementById("tabla-pedidos");
  tbody.innerHTML = "";
  pedidos.forEach(p => {
    const row = `<tr>
      <td>${p.codigo}</td>
      <td>${p.cantidad}</td>
      <td>${p.proveedor}</td>
      <td>${p.fecha}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function agregarPedido() {
  const codigo = document.getElementById("codigo").value.trim().toUpperCase();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!codigo || !cantidad || !proveedor || !fecha) {
    alert("Completá todos los campos");
    return;
  }

  const nuevo = { codigo, cantidad, proveedor, fecha };
  pedidos.push(nuevo);
  renderPedidos();
  limpiarCampos();

  // Guardar en Firebase
  db.collection("pedidos").add(nuevo).then(() => {
    console.log("Pedido guardado en Firebase");
  });
}

function limpiarCampos() {
  document.getElementById("codigo").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("proveedor").value = "";
  document.getElementById("fecha").value = "";
}

function buscarPedido() {
  const cod = document.getElementById("busqueda").value.trim().toUpperCase();
  const resultado = pedidos.find(p => p.codigo === cod);
  const contenedor = document.getElementById("resultado-busqueda");

  if (resultado) {
    contenedor.innerHTML = `<div class="resultado-ok">
      <p><strong>Código:</strong> ${resultado.codigo}</p>
      <p><strong>Cantidad:</strong> ${resultado.cantidad}</p>
      <p><strong>Proveedor:</strong> ${resultado.proveedor}</p>
      <p><strong>Fecha:</strong> ${resultado.fecha}</p>
    </div>`;
  } else {
    contenedor.innerHTML = `<div class="resultado-error">❌ Pedido no encontrado</div>`;
  }
}
