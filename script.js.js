// script.js

window.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tabla-pedidos");
  const alerta = document.getElementById("alerta");

  function mostrarAlerta(mensaje) {
    alerta.textContent = mensaje;
    alerta.style.display = "block";
    setTimeout(() => alerta.style.display = "none", 3000);
  }

  // Navegación entre vistas por tarjetas
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const tipo = card.dataset.tipo;
      document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
      document.getElementById(`vista-${tipo}`).classList.add("activa");
    });
  });

  document.getElementById("btn-volver").addEventListener("click", () => {
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
    document.getElementById("vista-inicio").classList.add("activa");
  });

  // Función agregar pedido
  document.getElementById("btn-agregar").addEventListener("click", () => {
    const codigo = document.getElementById("codigo").value.trim();
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const proveedor = document.getElementById("proveedor").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!codigo || !cantidad || !proveedor || !fecha) {
      mostrarAlerta("Completá todos los campos");
      return;
    }

    db.collection("pedidos").add({ codigo, cantidad, proveedor, fecha })
      .then(() => {
        mostrarAlerta("Pedido agregado correctamente");
        document.getElementById("codigo").value = "";
        document.getElementById("cantidad").value = "";
        document.getElementById("proveedor").value = "";
        document.getElementById("fecha").value = "";
      });
  });

  // Función buscar
  document.getElementById("btn-buscar").addEventListener("click", () => {
    const valor = document.getElementById("busqueda").value.toLowerCase();
    const filas = document.querySelectorAll("#tabla-pedidos tr");
    filas.forEach(f => {
      const codigo = f.children[0]?.textContent.toLowerCase();
      f.style.display = codigo?.includes(valor) ? "" : "none";
    });
  });

  // Mostrar pedidos
  db.collection("pedidos").onSnapshot(snapshot => {
    tabla.innerHTML = "";
    let total = 0;
    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.codigo}</td>
        <td>${d.cantidad}</td>
        <td>${d.proveedor}</td>
        <td>${d.fecha}</td>
        <td><button onclick="eliminarPedido('${doc.id}')">🗑️</button></td>
      `;
      tabla.appendChild(tr);
      total++;
    });
    document.querySelector("#card-total span").textContent = total;
    document.querySelector("#card-pendientes span").textContent = total;
  });
});

function eliminarPedido(id) {
  db.collection("pedidos").doc(id).delete();
}
