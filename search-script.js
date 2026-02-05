// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Search state
let currentQuery = '';
let currentPage = 1;
let totalPages = 1;
let currentFilter = 'all';
let allResults = [];
let searchTimeout = null;

// Get query from URL
function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('query') || '';
}

// Debounce function for live search
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Search TMDB
async function searchTMDB(query, page = 1) {
    if (!query || query.trim().length < 2) {
        return { results: [], total_pages: 0 };
    }
    
    try {
        const response = await fetch(
            `${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Search error:', error);
        return { results: [], total_pages: 0 };
    }
}

// Create result card
function createResultCard(item) {
    const mediaType = item.media_type;
    const title = item.title || item.name;
    const posterPath = item.poster_path || item.profile_path;
    const posterUrl = posterPath 
        ? `${IMG_BASE_URL}/w500${posterPath}` 
        : 'https://via.placeholder.com/300x450/4a5568/ffffff?text=No+Image';
    
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const year = (item.release_date || item.first_air_date || '').split('-')[0] || '';
    const overview = item.overview || 'No description available.';
    
    let typeLabel = '';
    let clickUrl = '';
    
    if (mediaType === 'movie') {
        typeLabel = 'Movie';
        clickUrl = `player.html?id=${item.id}`;
    } else if (mediaType === 'tv') {
        typeLabel = 'TV Show';
        clickUrl = `player.html?id=${item.id}&type=tv`;
    } else if (mediaType === 'person') {
        typeLabel = 'Person';
        clickUrl = '#';
    }
    
    const isClickable = mediaType !== 'person';
    
    return `
        <div class="result-card ${isClickable ? 'clickable' : ''}" ${isClickable ? `onclick="window.location.href='${clickUrl}'"` : ''}>
            <div class="result-poster">
                <img src="${posterUrl}" alt="${title}">
                <div class="result-type">${typeLabel}</div>
            </div>
            <div class="result-info">
                <h3 class="result-title">${title}</h3>
                ${mediaType !== 'person' ? `
                    <div class="result-meta">
                        ${rating !== 'N/A' ? `<span class="rating"><i class="fas fa-star"></i> ${rating}</span>` : ''}
                        ${year ? `<span class="year">${year}</span>` : ''}
                    </div>
                    <p class="result-overview">${overview.substring(0, 150)}${overview.length > 150 ? '...' : ''}</p>
                ` : `
                    <p class="result-known-for">${item.known_for_department || 'Actor'}</p>
                `}
            </div>
        </div>
    `;
}

// Filter results
function filterResults(results, filterType) {
    if (filterType === 'all') return results;
    return results.filter(item => item.media_type === filterType);
}

// Display results
function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');
    const pagination = document.getElementById('pagination');
    
    loadingIndicator.style.display = 'none';
    
    if (results.length === 0) {
        resultsContainer.style.display = 'none';
        noResults.style.display = 'flex';
        pagination.style.display = 'none';
        return;
    }
    
    noResults.style.display = 'none';
    resultsContainer.style.display = 'grid';
    resultsContainer.innerHTML = results.map(item => createResultCard(item)).join('');
    
    // Show pagination if there are multiple pages
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages;
    } else {
        pagination.style.display = 'none';
    }
}

// Perform search
async function performSearch(page = 1) {
    const query = currentQuery;
    if (!query || query.length < 2) return;
    
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContainer = document.getElementById('results-container');
    const initialMessage = document.getElementById('initial-message');
    
    // Hide initial message
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }
    
    loadingIndicator.style.display = 'flex';
    resultsContainer.style.display = 'none';
    
    const data = await searchTMDB(query, page);
    allResults = data.results || [];
    totalPages = data.total_pages || 1;
    currentPage = page;
    
    const filteredResults = filterResults(allResults, currentFilter);
    displayResults(filteredResults);
}

// Pagination
function loadNextPage() {
    if (currentPage < totalPages) {
        performSearch(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function loadPreviousPage() {
    if (currentPage > 1) {
        performSearch(currentPage - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Filter buttons
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            const filteredResults = filterResults(allResults, currentFilter);
            displayResults(filteredResults);
        });
    });
}

// Live search - triggered on input
const liveSearch = debounce(async (query) => {
    currentQuery = query.trim();
    
    if (currentQuery.length < 2) {
        const resultsContainer = document.getElementById('results-container');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');
        
        resultsContainer.style.display = 'none';
        loadingIndicator.style.display = 'none';
        noResults.style.display = 'none';
        return;
    }
    
    await performSearch(1);
}, 500); // Wait 500ms after user stops typing

// Initialize search
function initializeSearch() {
    const urlQuery = getSearchQuery();
    const mainSearchInput = document.getElementById('main-search-input');
    const clearSearch = document.getElementById('clear-search');
    
    // Set initial value from URL
    if (urlQuery) {
        mainSearchInput.value = urlQuery;
        currentQuery = urlQuery;
        performSearch();
        clearSearch.style.display = 'block';
    }
    
    // Live search as user types
    mainSearchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Show/hide clear button
        if (value.length > 0) {
            clearSearch.style.display = 'block';
        } else {
            clearSearch.style.display = 'none';
        }
        
        // Trigger live search
        liveSearch(value);
    });
    
    // Clear search
    clearSearch.addEventListener('click', () => {
        mainSearchInput.value = '';
        clearSearch.style.display = 'none';
        currentQuery = '';
        allResults = [];
        
        const resultsContainer = document.getElementById('results-container');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');
        
        resultsContainer.style.display = 'none';
        loadingIndicator.style.display = 'none';
        noResults.style.display = 'none';
        
        mainSearchInput.focus();
    });
    
    // Focus on input
    mainSearchInput.focus();
    
    setupFilterButtons();
}

// Initialize
document.addEventListener('DOMContentLoaded', initializeSearch);
