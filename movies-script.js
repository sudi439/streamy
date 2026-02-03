// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Pagination state
const paginationState = {
    'popular-movies': { page: 0, data: [] },
    'now-playing': { page: 0, data: [] },
    'top-rated-movies': { page: 0, data: [] },
    'upcoming': { page: 0, data: [] },
    'genre-movies': { page: 0, data: [] }
};

const ITEMS_PER_PAGE = 5;

// Fetch functions
async function fetchPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchNowPlaying() {
    try {
        const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchTopRated() {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchUpcoming() {
    try {
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchMoviesByGenre(genreId) {
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Create movie card
function createMovieCard(movie) {
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/300x400/4a5568/ffffff?text=No+Image';
    
    const title = movie.title || movie.name;
    const year = movie.release_date?.split('-')[0] || 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    return `
        <div class="movie-card" onclick="window.location.href='player.html?id=${movie.id}'">
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${title}">
            </div>
            <h3 class="movie-title">${title}</h3>
            <p class="movie-meta">⭐ ${rating} · ${year}</p>
        </div>
    `;
}

// Scroll section function
function scrollSection(sectionId, direction) {
    const state = paginationState[sectionId];
    if (!state || !state.data.length) return;
    
    const newPage = state.page + direction;
    const maxPage = Math.ceil(state.data.length / ITEMS_PER_PAGE) - 1;
    
    if (newPage < 0 || newPage > maxPage) return;
    
    state.page = newPage;
    renderSection(sectionId);
}

// Render section
function renderSection(sectionId) {
    const state = paginationState[sectionId];
    if (!state || !state.data.length) return;
    
    const container = document.getElementById(sectionId);
    if (!container) return;
    
    const start = state.page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = state.data.slice(start, end);
    
    container.innerHTML = items.map(item => createMovieCard(item)).join('');
}

// Load sections
async function loadPopularMovies() {
    const movies = await fetchPopularMovies();
    if (movies.length > 0) {
        paginationState['popular-movies'].data = movies;
        paginationState['popular-movies'].page = 0;
        renderSection('popular-movies');
    }
}

async function loadNowPlaying() {
    const movies = await fetchNowPlaying();
    if (movies.length > 0) {
        paginationState['now-playing'].data = movies;
        paginationState['now-playing'].page = 0;
        renderSection('now-playing');
    }
}

async function loadTopRated() {
    const movies = await fetchTopRated();
    if (movies.length > 0) {
        paginationState['top-rated-movies'].data = movies;
        paginationState['top-rated-movies'].page = 0;
        renderSection('top-rated-movies');
    }
}

async function loadUpcoming() {
    const movies = await fetchUpcoming();
    if (movies.length > 0) {
        paginationState['upcoming'].data = movies;
        paginationState['upcoming'].page = 0;
        renderSection('upcoming');
    }
}

// Genre filter
const genreNames = {
    '28': 'Action',
    '12': 'Adventure',
    '16': 'Animation',
    '35': 'Comedy',
    '80': 'Crime',
    '18': 'Drama',
    '14': 'Fantasy',
    '27': 'Horror',
    '10749': 'Romance',
    '878': 'Sci-Fi',
    '53': 'Thriller'
};

async function filterByGenre(genreId) {
    const genreSection = document.getElementById('genre-section');
    const genreTitle = document.getElementById('genre-title');
    
    if (genreId === 'all') {
        genreSection.style.display = 'none';
        return;
    }
    
    genreSection.style.display = 'block';
    genreTitle.textContent = `${genreNames[genreId]} Movies`;
    
    const movies = await fetchMoviesByGenre(genreId);
    if (movies.length > 0) {
        paginationState['genre-movies'].data = movies;
        paginationState['genre-movies'].page = 0;
        renderSection('genre-movies');
    }
    
    // Scroll to genre section
    genreSection.scrollIntoView({ behavior: 'smooth' });
}

// Setup genre buttons
function setupGenreButtons() {
    const genreBtns = document.querySelectorAll('.genre-btn');
    genreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            genreBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            // Filter
            const genre = btn.getAttribute('data-genre');
            filterByGenre(genre);
        });
    });
}

// Initialize
async function initializePage() {
    await loadPopularMovies();
    await loadNowPlaying();
    await loadTopRated();
    await loadUpcoming();
    setupGenreButtons();
}

document.addEventListener('DOMContentLoaded', initializePage);