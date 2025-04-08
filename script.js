const formulario = document.getElementById("formulario");
const tabla = document.getElementById("tabla-productos");

// 🔄 Mostrar pedidos al cargar la web
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const snapshot = await db.collection("pedidos").orderBy("fecha", "desc").get();
    snapshot.forEach(doc => {
      const pedido = doc.data();
      agregarFila(pedido);
    });
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    mostrarMensaje("⚠️ No se pudieron cargar los pedidos.");
  }
});

// 📝 Agregar nuevo pedido
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const codigo = document.getElementById("codigo").value.trim().toUpperCase();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!codigo || isNaN(cantidad) || !fecha) {
    alert("Completá todos los campos obligatorios.");
    return;
  }

  const pedido = { codigo, cantidad, proveedor, fecha, recibida: 0 };

  try {
    await db.collection("pedidos").add(pedido);
    mostrarMensaje("✔ Pedido guardado correctamente.");
    agregarFila(pedido);
    formulario.reset();
  } catch (error) {
    console.error("Error al guardar:", error);
    mostrarMensaje("❌ Error al guardar pedido.");
  }
});

// 👇 Agrega una fila en pantalla
function agregarFila(p) {
  const fila = document.createElement("div");
  fila.className = "fila";
  fila.innerHTML = `
    <div>${p.codigo}</div>
    <div>${p.proveedor}</div>
    <div>${p.cantidad}</div>
    <div>${p.fecha}</div>
  `;
  tabla.prepend(fila);
}

// ✅ Toast de confirmación
function mostrarMensaje(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
