/* js/crud.js - CRUD de películas en localStorage */

function getPeliculas() {
  return JSON.parse(localStorage.getItem('peliculas') || '[]');
}

function savePeliculas(lista) {
  localStorage.setItem('peliculas', JSON.stringify(lista));
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

let editId = null;

async function renderPeliculas(filter = '') {
  const container = document.getElementById('listaPeliculas');
  const session = window.auth.getSession();
  if (!container || !session) return;
  const all = getPeliculas().filter(p => p.ownerEmail === session.email);
  const peliculas = filter ? all.filter(p => p.titulo.toLowerCase().includes(filter.toLowerCase())) : all;
  container.innerHTML = '';

  if (peliculas.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No hay películas todavía.</p>';
    return;
  }

  peliculas.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-xl shadow flex gap-4';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'w-28 flex-shrink-0';
    const img = document.createElement('img');
    img.className = 'w-28 h-40 object-cover rounded-md';
    img.src = p.poster || 'https://via.placeholder.com/200x300?text=No+Poster';
    img.alt = p.titulo;
    imgWrap.appendChild(img);

    const body = document.createElement('div');
    body.className = 'flex-1';
    body.innerHTML = `
      <h3 class="text-lg font-semibold">${escapeHtml(p.titulo)} <span class="text-sm text-gray-500">(${p.anio})</span></h3>
      <p class="text-sm text-gray-600">Director: ${escapeHtml(p.director)}</p>
      <p class="text-sm text-gray-600">Género: ${escapeHtml(p.genero)}</p>
    `;

    const actions = document.createElement('div');
    actions.className = 'flex flex-col gap-2 justify-between';
    const editBtn = document.createElement('button');
    editBtn.className = 'px-3 py-1 bg-yellow-400 rounded-md';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => cargarParaEditar(p.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'px-3 py-1 bg-red-500 text-white rounded-md';
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', () => eliminarPelicula(p.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(imgWrap);
    card.appendChild(body);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function initCrud() {
  const form = document.getElementById('formPelicula');
  const tituloInput = document.getElementById('titulo');
  const anioInput = document.getElementById('anio');
  const directorInput = document.getElementById('director');
  const generoInput = document.getElementById('genero');
  const guardarBtn = document.getElementById('guardarBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formError = document.getElementById('formError');
  const buscarInput = document.getElementById('buscarInput');

  if (!form) return;

  await renderPeliculas();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';
    const titulo = tituloInput.value.trim();
    const anio = anioInput.value.trim();
    const director = directorInput.value.trim();
    const genero = generoInput.value.trim();

    if (!titulo || !anio || !director || !genero) {
      formError.textContent = 'Completa todos los campos.';
      return;
    }
    if (!/^\d{4}$/.test(anio) || Number(anio) < 1888) {
      formError.textContent = 'Año inválido.';
      return;
    }
    if (!/^[a-zA-Z\s\-\.]+$/.test(director)) {
      formError.textContent = 'Nombre de director inválido.';
      return;
    }

    const session = window.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    let peliculas = getPeliculas();

    if (editId) {
      peliculas = peliculas.map(p => {
        if (p.id === editId) {
          return { ...p, titulo, anio, director, genero };
        }
        return p;
      });
      savePeliculas(peliculas);
      editId = null;
      form.reset();
      await renderPeliculas();
      return;
    }

    let poster = null;
    try {
      if (typeof buscarPosterPorTitulo === 'function') {
        poster = await buscarPosterPorTitulo(titulo);
      }
    } catch (err) {
      console.warn('No se pudo obtener poster:', err);
    }

    const nueva = {
      id: generarId(),
      titulo,
      anio,
      director,
      genero,
      poster,
      ownerEmail: session.email
    };

    peliculas.push(nueva);
    savePeliculas(peliculas);
    form.reset();
    await renderPeliculas();
  });

  cancelEditBtn.addEventListener('click', () => {
    editId = null;
    form.reset();
    document.getElementById('formError').textContent = '';
  });

  window.cargarParaEditar = function(id) {
    const peliculas = getPeliculas();
    const p = peliculas.find(x => x.id === id);
    if (!p) return;
    editId = id;
    tituloInput.value = p.titulo;
    anioInput.value = p.anio;
    directorInput.value = p.director;
    generoInput.value = p.genero;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.eliminarPelicula = function(id) {
    if (!confirm('¿Eliminar película?')) return;
    let peliculas = getPeliculas();
    peliculas = peliculas.filter(p => p.id !== id);
    savePeliculas(peliculas);
    renderPeliculas();
  }

  buscarInput && buscarInput.addEventListener('input', async (e) => {
    await renderPeliculas(e.target.value);
  });
}

if (document.readyState !== 'loading') {
  initCrud();
} else {
  document.addEventListener('DOMContentLoaded', initCrud);
}
