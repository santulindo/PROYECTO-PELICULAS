/* js/api.js - no-module version
   Reemplaza TU_OMDB_API_KEY por tu clave de OMDb */
const OMDB_API_KEY = 'TU_OMDB_API_KEY';

async function buscarPosterPorTitulo(titulo) {
  if (!titulo) return null;
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${OMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      return data.Poster;
    }
    return null;
  } catch (err) {
    console.error('Error OMDb:', err);
    return null;
  }
}
