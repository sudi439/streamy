// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Pagination state
const paginationState = {
    'continue-watching': { page: 0, data: [] },
    'popular-week': { page: 0, data: [] },
    'just-release': { page: 0, data: [] },
    'watchlist': { page: 0, data: [] },
    'upcoming-movies': { page: 0, data: [] },
    'top-tv-shows': { page: 0, data: [] },
    'action-movies': { page: 0, data: [] }
};

// Hero rotation state
let heroMovies = [];
let currentHeroIndex = 0;
let heroRotationInterval = null;
let currentHeroMovieId = null;

const ITEMS_PER_PAGE = 5;
const HERO_ROTATION_TIME = 5000; // 5 seconds

// Scroll section function for arrow navigation
function scrollSection(sectionId, direction) {
    const state = paginationState[sectionId];
    if (!state || !state.data.length) return;
    
    const newPage = state.page + direction;
    const maxPage = Math.ceil(state.data.length / ITEMS_PER_PAGE) - 1;
    
    if (newPage < 0 || newPage > maxPage) return;
    
    state.page = newPage;
    renderSection(sectionId);
}

// Render section with current page
function renderSection(sectionId) {
    const state = paginationState[sectionId];
    if (!state || !state.data.length) return;
    
    const container = document.getElementById(sectionId);
    if (!container) return;
    
    const start = state.page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = state.data.slice(start, end);
    
    // Check if it's popular week (different rendering)
    if (sectionId === 'popular-week') {
        container.innerHTML = items.map((item, index) => 
            createPopularCard(item, (state.page * ITEMS_PER_PAGE) + index + 1)
        ).join('');
    } else {
        const showProgress = sectionId === 'continue-watching';
        container.innerHTML = items.map(item => createMovieCard(item, showProgress)).join('');
    }
}

// Fetch popular movies
async function fetchPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

// Fetch trending movies/TV shows
async function fetchTrending() {
    try {
        const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending:', error);
        return [];
    }
}

// Fetch now playing movies
async function fetchNowPlaying() {
    try {
        const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching now playing:', error);
        return [];
    }
}

// Fetch top rated movies
async function fetchTopRated() {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching top rated:', error);
        return [];
    }
}

// Fetch upcoming movies
async function fetchUpcoming() {
    try {
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching upcoming:', error);
        return [];
    }
}

// Fetch top rated TV shows
async function fetchTopRatedTV() {
    try {
        const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching top rated TV:', error);
        return [];
    }
}

// Fetch movies by genre (Action = 28)
async function fetchActionMovies() {
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&sort_by=popularity.desc&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching action movies:', error);
        return [];
    }
}

// Fetch watch providers
async function fetchWatchProviders() {
    try {
        const response = await fetch(`${BASE_URL}/watch/providers/movie?api_key=${API_KEY}&language=en-US&watch_region=US`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching providers:', error);
        return [];
    }
}

// Update streaming providers section
async function updateStreamingProviders() {
    const providers = await fetchWatchProviders();
    const container = document.getElementById('streaming-providers');
    
    if (container && providers.length > 0) {
        // Define specific provider IDs we want to display (matching the design)
        const preferredProviders = [
            'Disney Plus',
            'Netflix', 
            'HBO Max',
            'Hulu',
            'Amazon Prime Video',
            'Apple TV Plus',
            'Paramount Plus',
            'Peacock',
            'Showtime',
            'Starz'
        ];
        
        // Filter and sort providers to match preferred list
        const filteredProviders = providers
            .filter(provider => preferredProviders.some(name => 
                provider.provider_name.includes(name) || name.includes(provider.provider_name)
            ))
            .slice(0, 8);
        
        container.innerHTML = filteredProviders.map(provider => {
            const logoUrl = provider.logo_path 
                ? `${IMG_BASE_URL}/original${provider.logo_path}` 
                : '';
            
            return logoUrl ? `<img src="${logoUrl}" alt="${provider.provider_name}" title="${provider.provider_name}">` : '';
        }).join('');
        
        // Add scroll arrow
        container.innerHTML += '<i class="fas fa-chevron-right scroll-arrow"></i>';
    }
}

// Get movie runtime in hours and minutes
function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Update hero section with featured movie
async function updateHeroSection() {
    heroMovies = await fetchPopularMovies();
    if (heroMovies.length > 0) {
        displayHeroMovie(0);
        startHeroRotation();
    }
}

// Display specific hero movie
function displayHeroMovie(index) {
    if (!heroMovies.length) return;
    
    currentHeroIndex = index;
    const featured = heroMovies[index];
    currentHeroMovieId = featured.id; // Store current movie ID
    
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const backdropUrl = `${IMG_BASE_URL}/original${featured.backdrop_path}`;
    
    // Add fade out
    heroContent.style.opacity = '0';
    heroContent.style.transition = 'opacity 0.4s ease-in-out';
    
    setTimeout(() => {
        hero.style.backgroundImage = `linear-gradient(to right, #0d0d0d 0%, rgba(13, 13, 13, 0.98) 25%, rgba(13, 13, 13, 0.85) 40%, rgba(13, 13, 13, 0.5) 60%, rgba(13, 13, 13, 0.2) 75%, transparent 90%), url(${backdropUrl})`;
        
        document.querySelector('.hero-title').textContent = featured.title || featured.name;
        document.querySelector('.hero-meta').textContent = `${featured.release_date?.split('-')[0] || 'N/A'} · PG-13 · Action`;
        document.querySelector('.hero-description').textContent = featured.overview;
        
        // Update dots
        updateHeroDots(index);
        
        // Fade in
        heroContent.style.opacity = '1';
    }, 400);
}

// Start hero auto-rotation
function startHeroRotation() {
    // Clear existing interval
    if (heroRotationInterval) {
        clearInterval(heroRotationInterval);
    }
    
    // Set new interval
    heroRotationInterval = setInterval(() => {
        const nextIndex = (currentHeroIndex + 1) % Math.min(heroMovies.length, 5);
        displayHeroMovie(nextIndex);
    }, HERO_ROTATION_TIME);
}

// Update hero dots indicator
function updateHeroDots(activeIndex) {
    const dots = document.querySelectorAll('.hero-dots .dot');
    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Stop hero rotation (optional - can be called on user interaction)
function stopHeroRotation() {
    if (heroRotationInterval) {
        clearInterval(heroRotationInterval);
        heroRotationInterval = null;
    }
}

// Create movie card HTML
function createMovieCard(movie, showProgress = false) {
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/300x400/4a5568/ffffff?text=No+Image';
    
    const title = movie.title || movie.name;
    const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    const progressBar = showProgress ? `
        <div class="progress-bar">
            <div class="progress" style="width: ${Math.random() * 100}%"></div>
        </div>
    ` : '';
    
    return `
        <div class="movie-card" onclick="window.location.href='player.html?id=${movie.id}'">
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${title}">
                ${progressBar}
            </div>
            <h3 class="movie-title">${title}</h3>
            <p class="movie-meta">⭐ ${rating} · ${year} · ${movie.media_type === 'tv' ? 'TV Show' : 'Movie'}</p>
            ${showProgress ? `<p class="movie-time">${Math.floor(Math.random() * 120)}m / ${Math.floor(Math.random() * 60) + 90}m</p>` : ''}
        </div>
    `;
}

// Create popular card HTML
function createPopularCard(movie, rank) {
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Image';
    
    const title = movie.title || movie.name;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    return `
        <div class="popular-card" onclick="window.location.href='player.html?id=${movie.id}'">
            <div class="rank">${rank}</div>
            <img src="${posterUrl}" alt="${title}">
            <div class="popular-info">
                <h3>${title}</h3>
                <p>⭐ ${rating} · ${movie.media_type === 'tv' ? 'TV Show' : 'Movie'}</p>
            </div>
        </div>
    `;
}

// Update Continue Watching section
async function updateContinueWatching() {
    const movies = await fetchNowPlaying();
    
    if (movies.length > 0) {
        paginationState['continue-watching'].data = movies;
        paginationState['continue-watching'].page = 0;
        renderSection('continue-watching');
    }
}

// Update Popular of the Week section
async function updatePopularWeek() {
    const trending = await fetchTrending();
    
    if (trending.length > 0) {
        paginationState['popular-week'].data = trending;
        paginationState['popular-week'].page = 0;
        renderSection('popular-week');
    }
}

// Update Just Release section
async function updateJustRelease() {
    const movies = await fetchNowPlaying();
    
    if (movies.length > 0) {
        // Use different movies for Just Release
        paginationState['just-release'].data = movies.slice(5);
        paginationState['just-release'].page = 0;
        renderSection('just-release');
    }
}

// Update Your Watchlist section
async function updateWatchlist() {
    const movies = await fetchTopRated();
    
    if (movies.length > 0) {
        paginationState['watchlist'].data = movies;
        paginationState['watchlist'].page = 0;
        renderSection('watchlist');
    }
}

// Update Upcoming Movies section
async function updateUpcomingMovies() {
    const movies = await fetchUpcoming();
    
    if (movies.length > 0) {
        paginationState['upcoming-movies'].data = movies;
        paginationState['upcoming-movies'].page = 0;
        renderSection('upcoming-movies');
    }
}

// Update Top Rated TV Shows section
async function updateTopTVShows() {
    const shows = await fetchTopRatedTV();
    
    if (shows.length > 0) {
        // Add media_type to all shows
        const formattedShows = shows.map(show => ({ ...show, media_type: 'tv' }));
        paginationState['top-tv-shows'].data = formattedShows;
        paginationState['top-tv-shows'].page = 0;
        renderSection('top-tv-shows');
    }
}

// Update Action Movies section
async function updateActionMovies() {
    const movies = await fetchActionMovies();
    
    if (movies.length > 0) {
        paginationState['action-movies'].data = movies;
        paginationState['action-movies'].page = 0;
        renderSection('action-movies');
    }
}

// Initialize the page
async function initializePage() {
    await updateStreamingProviders();
    await updateHeroSection();
    await updateContinueWatching();
    await updatePopularWeek();
    await updateJustRelease();
    await updateWatchlist();
    await updateUpcomingMovies();
    await updateTopTVShows();
    await updateActionMovies();
    
    // Add click handlers to hero dots
    setupHeroDotHandlers();
    
    // Setup hero button handlers
    setupHeroButtons();
    
    // Pause hero rotation on button hover
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('mouseenter', stopHeroRotation);
        btn.addEventListener('mouseleave', startHeroRotation);
    });
}

// Setup hero buttons
function setupHeroButtons() {
    const playBtn = document.getElementById('hero-play-btn');
    const trailerBtn = document.getElementById('hero-trailer-btn');
    const watchlistBtn = document.getElementById('hero-watchlist-btn');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (currentHeroMovieId) {
                window.location.href = `player.html?id=${currentHeroMovieId}&autoplay=true`;
            }
        });
    }
    
    if (trailerBtn) {
        trailerBtn.addEventListener('click', () => {
            if (currentHeroMovieId) {
                window.location.href = `player.html?id=${currentHeroMovieId}#trailer`;
            }
        });
    }
    
    if (watchlistBtn) {
        watchlistBtn.addEventListener('click', () => {
            if (currentHeroMovieId) {
                let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
                if (!watchlist.includes(currentHeroMovieId)) {
                    watchlist.push(currentHeroMovieId);
                    localStorage.setItem('watchlist', JSON.stringify(watchlist));
                    alert('Added to your watchlist!');
                    watchlistBtn.innerHTML = '<i class="fas fa-check"></i> Added';
                } else {
                    alert('Already in your watchlist.');
                }
            }
        });
    }
}

// Setup hero dot click handlers
function setupHeroDotHandlers() {
    const dots = document.querySelectorAll('.hero-dots .dot');
    dots.forEach((dot, index) => {
        dot.style.cursor = 'pointer';
        dot.addEventListener('click', () => {
            stopHeroRotation();
            displayHeroMovie(index);
            // Resume after 10 seconds
            setTimeout(startHeroRotation, 10000);
        });
    });
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initializePage);

// Go to search page
function goToSearch() {
    window.location.href = 'search.html';
}

// Notification and profile functions
function showNotifications() {
    alert('Notifications feature coming soon!');
}

function showProfile() {
    alert('Profile page coming soon!');
}

// Search function for mobile nav
function openSearch() {
    window.location.href = 'search.html';
}

// Search functionality
function openSearch() {
    alert('Search feature coming soon! You can browse Movies, Series, and Anime pages to find content.');
}

// Notifications
function showNotifications() {
    alert('No new notifications');
}

// Profile
function showProfile() {
    alert('Profile page coming soon!');
}
