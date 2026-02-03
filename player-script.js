// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Get movie ID from URL parameter
function getMovieIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '438631'; // Default to Dune if no ID
}

// Fetch movie details
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Fetch movie videos (trailers)
async function fetchMovieVideos(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movie videos:', error);
        return [];
    }
}

// Fetch movie cast
async function fetchMovieCast(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
        const data = await response.json();
        return data.cast;
    } catch (error) {
        console.error('Error fetching movie cast:', error);
        return [];
    }
}

// Fetch similar movies
async function fetchSimilarMovies(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching similar movies:', error);
        return [];
    }
}

// Format runtime
function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Load movie details
async function loadMovieDetails() {
    const movieId = getMovieIdFromURL();
    const movie = await fetchMovieDetails(movieId);
    
    if (movie) {
        // Update poster
        const posterUrl = movie.poster_path 
            ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
        document.getElementById('movie-poster').src = posterUrl;
        
        // Update title
        document.getElementById('movie-title').textContent = movie.title;
        
        // Update meta info
        document.getElementById('rating').textContent = movie.vote_average.toFixed(1);
        document.getElementById('year').textContent = movie.release_date?.split('-')[0] || 'N/A';
        document.getElementById('duration').textContent = formatRuntime(movie.runtime);
        document.getElementById('genre').textContent = movie.genres?.map(g => g.name).join(', ') || 'N/A';
        
        // Update description
        document.getElementById('movie-description').textContent = movie.overview;
        
        // Update page title
        document.title = `${movie.title} - SaintStream`;
    }
}

// Load trailer
async function loadTrailer() {
    const movieId = getMovieIdFromURL();
    const videos = await fetchMovieVideos(movieId);
    
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    
    if (trailer) {
        const trailerContainer = document.getElementById('trailer-container');
        trailerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${trailer.key}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }
}

// Load cast
async function loadCast() {
    const movieId = getMovieIdFromURL();
    const cast = await fetchMovieCast(movieId);
    
    const castGrid = document.getElementById('cast-grid');
    
    if (cast.length > 0) {
        castGrid.innerHTML = cast.slice(0, 10).map(member => {
            const profileUrl = member.profile_path 
                ? `${IMG_BASE_URL}/w185${member.profile_path}` 
                : 'https://via.placeholder.com/150/4a5568/ffffff?text=No+Image';
            
            return `
                <div class="cast-card">
                    <img src="${profileUrl}" alt="${member.name}">
                    <h3>${member.name}</h3>
                    <p>${member.character}</p>
                </div>
            `;
        }).join('');
    } else {
        castGrid.innerHTML = '<p style="color: #8b92a7;">No cast information available.</p>';
    }
}

// Load similar movies
async function loadSimilarMovies() {
    const movieId = getMovieIdFromURL();
    const similar = await fetchSimilarMovies(movieId);
    
    const similarGrid = document.getElementById('similar-grid');
    
    if (similar.length > 0) {
        similarGrid.innerHTML = similar.slice(0, 10).map(movie => {
            const posterUrl = movie.poster_path 
                ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
                : 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
            
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
            
            return `
                <div class="similar-card" onclick="window.location.href='player.html?id=${movie.id}'">
                    <img src="${posterUrl}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <p>⭐ ${rating}</p>
                </div>
            `;
        }).join('');
    } else {
        similarGrid.innerHTML = '<p style="color: #8b92a7;">No similar movies found.</p>';
    }
}

// Action button functions
function playMovie() {
    const movieId = getMovieIdFromURL();
    const source = document.getElementById('source-select').value;
    loadPlayerSource(movieId, source);
    
    // Scroll to player
    const player = document.getElementById('video-player');
    player.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Load player with selected source
function loadPlayerSource(movieId, source) {
    const player = document.getElementById('video-player');
    
    // Show loading state
    player.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000;">
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 60px; color: #00d4aa; margin-bottom: 20px;"></i>
                <p style="font-size: 18px; color: #fff;">Loading movie...</p>
            </div>
        </div>
    `;
    
    // Determine embed URL based on source
    let embedUrl = '';
    
    switch(source) {
        case '2embed':
            embedUrl = `https://www.2embed.cc/embed/${movieId}`;
            break;
        case 'vidsrc':
            embedUrl = `https://vidsrc.to/embed/movie/${movieId}`;
            break;
        case 'embedsoap':
            embedUrl = `https://www.embedsoap.com/embed/movie/${movieId}`;
            break;
        case 'autoembed':
            embedUrl = `https://player.autoembed.cc/embed/movie/${movieId}`;
            break;
        default:
            embedUrl = `https://www.2embed.cc/embed/${movieId}`;
    }
    
    // Load the iframe after a short delay to show loading state
    setTimeout(() => {
        player.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                scrolling="no"
                style="border: none;">
            </iframe>
        `;
    }, 500);
}

// Change streaming source
function changeSource() {
    const movieId = getMovieIdFromURL();
    const source = document.getElementById('source-select').value;
    
    // Check if movie is already playing
    const player = document.getElementById('video-player');
    if (player.querySelector('iframe')) {
        loadPlayerSource(movieId, source);
    }
}

// Reload player
function reloadPlayer() {
    const movieId = getMovieIdFromURL();
    const source = document.getElementById('source-select').value;
    loadPlayerSource(movieId, source);
}

function playTrailer() {
    const trailerContainer = document.getElementById('trailer-container');
    trailerContainer.scrollIntoView({ behavior: 'smooth' });
}

function downloadMovie() {
    const movieId = getMovieIdFromURL();
    const downloadUrl = `https://dl.vidsrc.me/movie/${movieId}`;
    window.open(downloadUrl, '_blank');
}

function addToWatchlist() {
    const movieTitle = document.getElementById('movie-title').textContent;
    
    // Save to localStorage
    let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const movieId = getMovieIdFromURL();
    
    if (!watchlist.includes(movieId)) {
        watchlist.push(movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert(`${movieTitle} added to your watchlist!`);
    } else {
        alert(`${movieTitle} is already in your watchlist.`);
    }
}

function addToList() {
    alert('Add to custom list feature. This would open a modal to select or create a list.');
}

function shareMovie() {
    const movieTitle = document.getElementById('movie-title').textContent;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: movieTitle,
            text: `Check out ${movieTitle} on SaintStream!`,
            url: url
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
}

// Initialize page
async function initializePage() {
    await loadMovieDetails();
    await loadTrailer();
    await loadCast();
    await loadSimilarMovies();
    
    // Check if autoplay parameter is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoplay') === 'true') {
        setTimeout(() => {
            playMovie();
        }, 1000);
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initializePage);