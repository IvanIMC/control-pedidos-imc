// Firebase
const db = firebase.firestore();

// Cargar pedidos
document.getElementById("btn-agregar").addEventListener("click", agregarPedido);
document.getElementById("btn-limpiar").addEventListener("click", limpiarCampos);

function agregarPedido() {
  const codigo = document.getElementById("codigo").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!codigo || !cantidad || !proveedor || !fecha) {
    alert("Completá todos los campos.");
    return;
  }

  db.collection("pedidos").add({ codigo, cantidad, proveedor, fecha })
    .then(doc => {
      cargarPedidos();
      limpiarCampos();
    })
    .catch(err => console.error("Error al agregar:", err));
}

function limpiarCampos() {
  document.getElementById("codigo").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("proveedor").value = "";
  document.getElementById("fecha").value = "";
}

function cargarPedidos() {
  const tbody = document.getElementById("tabla-pedidos");
  tbody.innerHTML = "";

  db.collection("pedidos").get().then(snapshot => {
    let total = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${data.codigo}</td>
        <td>${data.cantidad}</td>
        <td>${data.proveedor}</td>
        <td>${data.fecha}</td>
        <td><button onclick="eliminarPedido('${doc.id}')">🗑️</button></td>
      `;

      tbody.appendChild(tr);
      total++;
    });

    document.querySelector("#card-total span").textContent = total;
    document.querySelector("#card-pendientes span").textContent = total;
  });
}

function eliminarPedido(id) {
  db.collection("pedidos").doc(id).delete().then(() => cargarPedidos());
}

function buscarPedido() {
  const valor = document.getElementById("busqueda").value.trim().toLowerCase();
  const filas = document.querySelectorAll("#tabla-pedidos tr");

  filas.forEach(fila => {
    const codigo = fila.children[0].textContent.toLowerCase();
    fila.style.display = codigo.includes(valor) ? "" : "none";
  });
}

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("activo");
}

function cerrarMenuSiActivo(e) {
  if (!e.target.closest(".sidebar") && document.getElementById("sidebar").classList.contains("activo")) {
    document.getElementById("sidebar").classList.remove("activo");
  }
}

function cambiarVista(seccion) {
  alert(`(⚙️) En el futuro, esto mostrará la vista de: ${seccion}`);
}

window.onload = cargarPedidos;
