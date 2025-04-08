// Obtener referencia a la base de datos Firebase
const db = firebase.firestore();

// Función para agregar un nuevo pedido
function agregarPedido() {
  const codigo = document.getElementById('codigo').value;
  const cantidad = document.getElementById('cantidad').value;
  const proveedor = document.getElementById('proveedor').value;
  const fecha = document.getElementById('fecha').value;

  if (!codigo || !cantidad || !proveedor || !fecha) {
    alert('Por favor, complete todos los campos.');
    return;
  }

  // Agregar el nuevo pedido a Firebase Firestore
  db.collection('pedidos').add({
    codigo,
    cantidad: parseInt(cantidad),
    proveedor,
    fecha,
    estado: 'pendiente', // Estado inicial del pedido
  })
  .then(() => {
    console.log('Pedido agregado con éxito');
    mostrarToast('Pedido agregado con éxito');
    limpiarFormulario();
    obtenerPedidosPendientes();
  })
  .catch((error) => {
    console.error('Error al agregar el pedido: ', error);
    mostrarToast('Error al agregar el pedido');
  });
}

// Función para limpiar el formulario de carga
function limpiarFormulario() {
  document.getElementById('codigo').value = '';
  document.getElementById('cantidad').value = '';
  document.getElementById('proveedor').value = '';
  document.getElementById('fecha').value = '';
}

// Función para mostrar toast de éxito o error
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  toast.className = 'toast';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Función para obtener los pedidos pendientes
function obtenerPedidosPendientes() {
  db.collection('pedidos').where('estado', '==', 'pendiente')
    .get()
    .then((querySnapshot) => {
      const pedidos = querySnapshot.docs.map(doc => doc.data());
      mostrarPedidos(pedidos);
    })
    .catch((error) => {
      console.error('Error al obtener los pedidos: ', error);
    });
}

// Función para mostrar los pedidos en la tabla
function mostrarPedidos(pedidos) {
  const tablaPedidos = document.getElementById('tabla-pedidos');
  tablaPedidos.innerHTML = '';

  pedidos.forEach(pedido => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${pedido.codigo}</td>
      <td>${pedido.cantidad}</td>
      <td>${pedido.proveedor}</td>
      <td>${pedido.fecha}</td>
    `;
    tablaPedidos.appendChild(row);
  });
}

// Función para buscar un pedido
function buscarPedido() {
  const busqueda = document.getElementById('busqueda').value.toUpperCase();
  db.collection('pedidos').where('codigo', '==', busqueda)
    .get()
    .then((querySnapshot) => {
      const resultados = querySnapshot.docs.map(doc => doc.data());
      mostrarResultadosBusqueda(resultados);
    })
    .catch((error) => {
      console.error('Error al buscar el pedido: ', error);
    });
}

// Función para mostrar los resultados de búsqueda
function mostrarResultadosBusqueda(resultados) {
  const resultadoBusqueda = document.getElementById('resultado-busqueda');
  resultadoBusqueda.innerHTML = '';

  if (resultados.length > 0) {
    resultados.forEach(resultado => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h3>Pedido: ${resultado.codigo}</h3>
        <p>Cantidad: ${resultado.cantidad}</p>
        <p>Proveedor: ${resultado.proveedor}</p>
        <p>Fecha: ${resultado.fecha}</p>
        <p>Estado: ${resultado.estado}</p>
      `;
      resultadoBusqueda.appendChild(div);
    });
  } else {
    resultadoBusqueda.innerHTML = `<p>No se encontró ningún pedido con ese código.</p>`;
  }
}

// Cargar los pedidos pendientes al cargar la página
window.onload = obtenerPedidosPendientes;
