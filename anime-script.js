// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Pagination state
const paginationState = {
    'popular-anime': { page: 1, data: [], totalPages: 1 },
    'top-rated-anime': { page: 1, data: [], totalPages: 1 },
    'airing-anime': { page: 1, data: [], totalPages: 1 },
    'action-anime': { page: 1, data: [], totalPages: 1 }
};

const ITEMS_PER_PAGE = 20; // Show 20 items in grid layout

// Fetch anime (Animation genre TV shows with Japanese origin)
async function fetchPopularAnime() {
    try {
        const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchTopRatedAnime() {
    try {
        const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchAiringAnime() {
    try {
        const response = await fetch(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}&with_genres=16&with_original_language=ja&page=1`);
        const data = await response.json();
        // Filter for animation
        const filtered = data.results.filter(show => 
            show.genre_ids && show.genre_ids.includes(16) && 
            (show.original_language === 'ja' || show.origin_country.includes('JP'))
        );
        return filtered;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchActionAnime() {
    try {
        // Genre 16 = Animation, 10759 = Action & Adventure
        const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16,10759&with_original_language=ja&sort_by=popularity.desc&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Create anime card
function createAnimeCard(anime) {
    const posterUrl = anime.poster_path 
        ? `${IMG_BASE_URL}/w500${anime.poster_path}` 
        : 'https://via.placeholder.com/300x400/4a5568/ffffff?text=No+Image';
    
    const title = anime.name || anime.original_name;
    const year = anime.first_air_date?.split('-')[0] || 'N/A';
    const rating = anime.vote_average ? anime.vote_average.toFixed(1) : 'N/A';
    
    return `
        <div class="movie-card" onclick="window.location.href='player.html?id=${anime.id}&type=tv'">
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${title}">
            </div>
            <h3 class="movie-title">${title}</h3>
            <p class="movie-meta">⭐ ${rating} · ${year} · Anime</p>
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
    
    container.innerHTML = items.map(item => createAnimeCard(item)).join('');
}

// Load sections
async function loadPopularAnime() {
    const anime = await fetchPopularAnime();
    if (anime.length > 0) {
        paginationState['popular-anime'].data = anime;
        paginationState['popular-anime'].page = 1;
        renderSection('popular-anime');
    }
}

async function loadTopRatedAnime() {
    const anime = await fetchTopRatedAnime();
    if (anime.length > 0) {
        paginationState['top-rated-anime'].data = anime;
        paginationState['top-rated-anime'].page = 1;
        renderSection('top-rated-anime');
    }
}

async function loadAiringAnime() {
    const anime = await fetchAiringAnime();
    if (anime.length > 0) {
        paginationState['airing-anime'].data = anime;
        paginationState['airing-anime'].page = 1;
        renderSection('airing-anime');
    }
}

async function loadActionAnime() {
    const anime = await fetchActionAnime();
    if (anime.length > 0) {
        paginationState['action-anime'].data = anime;
        paginationState['action-anime'].page = 1;
        renderSection('action-anime');
    }
}

// Initialize
async function initializePage() {
    await loadPopularAnime();
    await loadTopRatedAnime();
    await loadAiringAnime();
    await loadActionAnime();
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
                    placeholder="Search anime..." 
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