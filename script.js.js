// script.js

window.addEventListener("DOMContentLoaded", () => {
  const alerta = document.getElementById("alerta");
  const vistas = document.querySelectorAll("main");
  const volverBtn = document.getElementById("btn-volver");

  function mostrarVista(idVista) {
    vistas.forEach(v => v.classList.remove("activa"));
    document.getElementById(idVista).classList.add("activa");
    volverBtn.style.display = idVista === "vista-inicio" ? "none" : "inline-block";
  }

  // Cargar vistas al hacer clic en tarjetas
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const destino = "vista-" + card.dataset.vista;
      mostrarVista(destino);
    });
  });

  volverBtn.addEventListener("click", () => mostrarVista("vista-inicio"));

  // Mostrar alertas
  function mostrarAlerta(mensaje, tipo = "error") {
    alerta.textContent = mensaje;
    alerta.className = "alerta" + (tipo === "error" ? " error" : "");
    alerta.style.display = "block";
    setTimeout(() => alerta.style.display = "none", 3000);
  }

  // Agregar pedido
  document.getElementById("btn-agregar").addEventListener("click", () => {
    const codigo = document.getElementById("codigo").value.trim();
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const proveedor = document.getElementById("proveedor").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!codigo || !cantidad || !proveedor || !fecha) {
      mostrarAlerta("Completá todos los campos");
      return;
    }

    db.collection("pedidos").where("codigo", "==", codigo).get().then(snapshot => {
      if (!snapshot.empty) {
        mostrarAlerta("Ya existe este Código");
      } else {
        db.collection("pedidos").add({ codigo, cantidad, proveedor, fecha })
          .then(() => {
            limpiarCampos();
            mostrarAlerta("Pedido agregado correctamente", "success");
          });
      }
    });
  });

  function limpiarCampos() {
    document.getElementById("codigo").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("proveedor").value = "";
    document.getElementById("fecha").value = "";
  }

  document.getElementById("btn-limpiar").addEventListener("click", limpiarCampos);

  document.getElementById("btn-buscar").addEventListener("click", () => {
    const valor = document.getElementById("busqueda").value.trim().toLowerCase();
    const filas = document.querySelectorAll("#tabla-pedidos tr");
    filas.forEach(fila => {
      const codigo = fila.children[0].textContent.toLowerCase();
      fila.style.display = codigo.includes(valor) ? "" : "none";
    });
  });

  document.getElementById("btn-exportar").addEventListener("click", () => {
    db.collection("pedidos").get().then(snapshot => {
      let csv = "Código,Cantidad,Proveedor,Fecha\n";
      snapshot.forEach(doc => {
        const d = doc.data();
        csv += `${d.codigo},${d.cantidad},${d.proveedor},${d.fecha}\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "pedidos.csv");
      link.click();
    });
  });

  // Renderizado de tablas
  db.collection("pedidos").onSnapshot(snapshot => {
    const tabla = document.getElementById("tabla-pedidos");
    tabla.innerHTML = "";
    let total = 0;
    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.codigo}</td><td>${d.cantidad}</td><td>${d.proveedor}</td><td>${d.fecha}</td><td><button class='btn-eliminar' data-id='${doc.id}'>🗑️</button></td>`;
      tabla.appendChild(tr);
      total++;
    });
    document.getElementById("card-total").textContent = total;
    document.getElementById("card-pendientes").textContent = total;
  });

  document.getElementById("tabla-pedidos").addEventListener("click", e => {
    if (e.target.classList.contains("btn-eliminar")) {
      const id = e.target.dataset.id;
      db.collection("pedidos").doc(id).delete();
    }
  });

  // Inicial
  mostrarVista("vista-inicio");
});

