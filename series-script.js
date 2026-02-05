// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Pagination state
const paginationState = {
    'popular-series': { page: 1, data: [], totalPages: 1 },
    'airing-today': { page: 1, data: [], totalPages: 1 },
    'top-rated-series': { page: 1, data: [], totalPages: 1 },
    'on-the-air': { page: 1, data: [], totalPages: 1 },
    'genre-series': { page: 1, data: [], totalPages: 1 }
};

const ITEMS_PER_PAGE = 20; // Show 20 items in grid layout

// Fetch functions
async function fetchPopularSeries() {
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchAiringToday() {
    try {
        const response = await fetch(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchTopRatedSeries() {
    try {
        const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchOnTheAir() {
    try {
        const response = await fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchSeriesByGenre(genreId) {
    try {
        const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Create series card
function createSeriesCard(series) {
    const posterUrl = series.poster_path 
        ? `${IMG_BASE_URL}/w500${series.poster_path}` 
        : 'https://via.placeholder.com/300x400/4a5568/ffffff?text=No+Image';
    
    const title = series.name || series.original_name;
    const year = series.first_air_date?.split('-')[0] || 'N/A';
    const rating = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';
    
    return `
        <div class="movie-card" onclick="window.location.href='player.html?id=${series.id}&type=tv'">
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${title}">
            </div>
            <h3 class="movie-title">${title}</h3>
            <p class="movie-meta">⭐ ${rating} · ${year} · TV</p>
        </div>
    `;
}

// Scroll section function - now for grid pagination
function scrollSection(sectionId, direction) {
    const state = paginationState[sectionId];
    if (!state || !state.data.length) return;
    
    const newPage = state.page + direction;
    const maxPage = Math.ceil(state.data.length / ITEMS_PER_PAGE);
    
    if (newPage < 1 || newPage > maxPage) return;
    
    state.page = newPage;
    renderSection(sectionId);
    
    // Scroll to section
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Render section
function renderSection(sectionId) {
    const state = paginationState[sectionId];
    if (!state || !state.data.length) return;
    
    const container = document.getElementById(sectionId);
    if (!container) return;
    
    const start = (state.page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = state.data.slice(start, end);
    
    container.innerHTML = items.map(item => createSeriesCard(item)).join('');
}

// Load sections
async function loadPopularSeries() {
    const series = await fetchPopularSeries();
    if (series.length > 0) {
        paginationState['popular-series'].data = series;
        paginationState['popular-series'].page = 1;
        renderSection('popular-series');
    }
}

async function loadAiringToday() {
    const series = await fetchAiringToday();
    if (series.length > 0) {
        paginationState['airing-today'].data = series;
        paginationState['airing-today'].page = 1;
        renderSection('airing-today');
    }
}

async function loadTopRatedSeries() {
    const series = await fetchTopRatedSeries();
    if (series.length > 0) {
        paginationState['top-rated-series'].data = series;
        paginationState['top-rated-series'].page = 1;
        renderSection('top-rated-series');
    }
}

async function loadOnTheAir() {
    const series = await fetchOnTheAir();
    if (series.length > 0) {
        paginationState['on-the-air'].data = series;
        paginationState['on-the-air'].page = 1;
        renderSection('on-the-air');
    }
}

// Genre filter
const genreNames = {
    '10759': 'Action & Adventure',
    '16': 'Animation',
    '35': 'Comedy',
    '80': 'Crime',
    '99': 'Documentary',
    '18': 'Drama',
    '10751': 'Family',
    '10765': 'Sci-Fi & Fantasy',
    '9648': 'Mystery'
};

async function filterByGenre(genreId) {
    const genreSection = document.getElementById('genre-section');
    const genreTitle = document.getElementById('genre-title');
    
    if (genreId === 'all') {
        genreSection.style.display = 'none';
        return;
    }
    
    genreSection.style.display = 'block';
    genreTitle.textContent = `${genreNames[genreId]} Series`;
    
    const series = await fetchSeriesByGenre(genreId);
    if (series.length > 0) {
        paginationState['genre-series'].data = series;
        paginationState['genre-series'].page = 1;
        renderSection('genre-series');
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
    await loadPopularSeries();
    await loadAiringToday();
    await loadTopRatedSeries();
    await loadOnTheAir();
    setupGenreButtons();
}

document.addEventListener('DOMContentLoaded', initializePage);

// Search function for mobile nav
function openSearch() {
    const searchModal = document.createElement('div');
    searchModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        padding-top: 80px;
    `;
    
    searchModal.innerHTML = `
        <div style="width: 100%; max-width: 600px;">
            <div style="position: relative;">
                <input 
                    type="text" 
                    id="search-input"
                    placeholder="Search TV series..." 
                    style="width: 100%; padding: 18px 50px 18px 20px; background: #1a1d29; border: 2px solid rgba(0, 212, 170, 0.3); border-radius: 12px; font-size: 16px; color: #fff; outline: none;"
                />
                <i class="fas fa-search" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: #00d4aa; font-size: 20px;"></i>
            </div>
            <button 
                onclick="this.parentElement.parentElement.remove()" 
                style="width: 100%; margin-top: 15px; padding: 15px; background: rgba(255, 0, 0, 0.2); border: 2px solid rgba(255, 0, 0, 0.3); border-radius: 12px; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer;">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    document.body.appendChild(searchModal);
    setTimeout(() => document.getElementById('search-input').focus(), 100);
}

// Helper functions
function openSearch() {
    alert('Search feature coming soon!');
}

function showNotifications() {
    alert('No new notifications');
}