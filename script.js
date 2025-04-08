// script.js
const db = firebase.firestore();

const alerta = document.getElementById("alerta");
const tabla = document.getElementById("tabla-pedidos");

// Mostrar alertas visuales
function mostrarAlerta(mensaje, tipo = "info") {
  alerta.textContent = mensaje;
  alerta.className = tipo === "error" ? "error" : "";
  alerta.style.display = "block";
  setTimeout(() => alerta.style.display = "none", 3000);
}

// Cargar pedidos (onSnapshot)
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
      <td><button class="btn-eliminar" data-id="${doc.id}">🗑️</button></td>
    `;
    tabla.appendChild(tr);
    total++;
  });
  document.querySelector("#card-total span").textContent = total;
  document.querySelector("#card-pendientes span").textContent = total;
});

// Agregar pedido
function agregarPedido() {
  const codigo = document.getElementById("codigo").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!codigo || !cantidad || !proveedor || !fecha) {
    mostrarAlerta("Completá todos los campos", "error");
    return;
  }

  db.collection("pedidos")
    .where("codigo", "==", codigo)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        mostrarAlerta("Ya existe este Código", "error");
      } else {
        db.collection("pedidos")
          .add({ codigo, cantidad, proveedor, fecha })
          .then(() => {
            limpiarCampos();
            mostrarAlerta("Pedido agregado correctamente");
          });
      }
    });
}

// Limpiar formulario
function limpiarCampos() {
  document.getElementById("codigo").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("proveedor").value = "";
  document.getElementById("fecha").value = "";
}

// Buscar pedido
function buscarPedido() {
  const valor = document.getElementById("busqueda").value.trim().toLowerCase();
  const filas = document.querySelectorAll("#tabla-pedidos tr");

  filas.forEach(fila => {
    const codigo = fila.children[0].textContent.toLowerCase();
    fila.style.display = codigo.includes(valor) ? "" : "none";
  });
}

// Eliminar pedido
function eliminarPedido(id) {
  if (confirm("¿Estás seguro de eliminar este pedido?")) {
    db.collection("pedidos").doc(id).delete().then(() => {
      mostrarAlerta("Pedido eliminado");
    });
  }
}

// Exportar a CSV
function exportarCSV() {
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
}

// Leer PDF
function leerPDF(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      let textoTotal = "";
      let tareas = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        tareas.push(pdf.getPage(i).then(pagina => pagina.getTextContent().then(txt => {
          txt.items.forEach(t => textoTotal += t.str + " ");
        })));
      }

      Promise.all(tareas).then(() => {
        procesarTextoFactura(textoTotal);
      });
    });
  };
  reader.readAsArrayBuffer(file);
}

// Procesar texto del PDF
function procesarTextoFactura(texto) {
  const lineas = texto.split("\n").join(" ").split(" ");
  const productos = [];

  for (let i = 0; i < lineas.length; i++) {
    const cant = parseFloat(lineas[i]);
    const posibleCodigo = lineas[i + 1];
    if (!isNaN(cant) && /^[A-Z0-9]{5,}$/.test(posibleCodigo)) {
      productos.push({ codigo: posibleCodigo, cantidad: cant });
    }
  }

  if (productos.length === 0) {
    mostrarAlerta("No se encontraron productos en el PDF", "error");
    return;
  }

  actualizarPedidosDesdeFactura(productos);
}

// Comparar productos recibidos con pedidos
function actualizarPedidosDesdeFactura(recibidos) {
  db.collection("pedidos").get().then(snapshot => {
    const pedidos = {};
    snapshot.forEach(doc => pedidos[doc.data().codigo] = { ...doc.data(), id: doc.id });

    recibidos.forEach(({ codigo, cantidad }) => {
      const pedido = pedidos[codigo];
      const hoy = new Date().toISOString().slice(0, 10);

      if (pedido) {
        if (cantidad >= pedido.cantidad) {
          db.collection("entregados").add({ ...pedido, fechaEntrega: hoy });
        } else {
          const faltan = pedido.cantidad - cantidad;
          db.collection("parciales").add({ ...pedido, cantidadRecibida: cantidad, faltantes: faltan, fechaEntrega: hoy });
        }
        db.collection("pedidos").doc(pedido.id).delete();
      } else {
        db.collection("no_pedidos").add({ codigo, cantidad, fechaEntrega: hoy });
      }
    });

    mostrarAlerta("Factura procesada correctamente");
  });
}

// Listeners
window.addEventListener("load", () => {
  document.getElementById("btn-agregar").addEventListener("click", agregarPedido);
  document.getElementById("btn-limpiar").addEventListener("click", limpiarCampos);
  document.getElementById("btn-buscar").addEventListener("click", buscarPedido);
  document.getElementById("btn-exportar").addEventListener("click", exportarCSV);
  document.getElementById("pdf-input").addEventListener("change", e => leerPDF(e.target.files[0]));
  tabla.addEventListener("click", e => {
    if (e.target.classList.contains("btn-eliminar")) {
      eliminarPedido(e.target.dataset.id);
    }
  });
});
