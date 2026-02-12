// TMDB API Configuration
const API_KEY = '947483b65dc5127f5e0a037175fb6593';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// Global variables
let currentMediaType = 'movie';
let currentSeasons = [];
let currentSeason = 1;
let currentEpisode = 1;

// Get movie/series ID and type from URL parameter
function getMediaInfoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id') || '438631',
        type: urlParams.get('type') || 'movie'
    };
}

// Get movie ID from URL parameter (legacy support)
function getMovieIdFromURL() {
    return getMediaInfoFromURL().id;
}

// Fetch movie details
async function fetchMovieDetails(movieId) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'movie';
        const endpoint = type === 'tv' ? 'tv' : 'movie';
        
        const response = await fetch(`${BASE_URL}/${endpoint}/${movieId}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching details:', error);
        return null;
    }
}

// Fetch season details
async function fetchSeasonDetails(tvId, seasonNumber) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching season details:', error);
        return null;
    }
}

// Fetch movie videos (trailers)
async function fetchMovieVideos(movieId) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'movie';
        const endpoint = type === 'tv' ? 'tv' : 'movie';
        
        const response = await fetch(`${BASE_URL}/${endpoint}/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
    }
}

// Fetch movie cast
async function fetchMovieCast(movieId) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'movie';
        const endpoint = type === 'tv' ? 'tv' : 'movie';
        
        const response = await fetch(`${BASE_URL}/${endpoint}/${movieId}/credits?api_key=${API_KEY}`);
        const data = await response.json();
        return data.cast;
    } catch (error) {
        console.error('Error fetching cast:', error);
        return [];
    }
}

// Fetch similar movies
async function fetchSimilarMovies(movieId) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'movie';
        const endpoint = type === 'tv' ? 'tv' : 'movie';
        
        const response = await fetch(`${BASE_URL}/${endpoint}/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching similar:', error);
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
    const mediaInfo = getMediaInfoFromURL();
    const movieId = mediaInfo.id;
    currentMediaType = mediaInfo.type;
    
    const movie = await fetchMovieDetails(movieId);
    
    if (movie) {
        // Update poster
        const posterUrl = movie.poster_path 
            ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
        document.getElementById('movie-poster').src = posterUrl;
        
        // Update title
        const title = movie.title || movie.name;
        document.getElementById('movie-title').textContent = title;
        
        // Update meta info
        document.getElementById('rating').textContent = (movie.vote_average || 0).toFixed(1);
        document.getElementById('year').textContent = (movie.release_date || movie.first_air_date || '').split('-')[0] || 'N/A';
        
        if (movie.runtime) {
            document.getElementById('duration').textContent = formatRuntime(movie.runtime);
        } else if (movie.episode_run_time && movie.episode_run_time.length > 0) {
            document.getElementById('duration').textContent = formatRuntime(movie.episode_run_time[0]);
        } else {
            document.getElementById('duration').textContent = 'N/A';
        }
        
        document.getElementById('genre').textContent = movie.genres?.map(g => g.name).join(', ') || 'N/A';
        
        // Update description
        document.getElementById('movie-description').textContent = movie.overview;
        
        // Update page title
        document.title = `${title} - SaintStream`;
        
        // Handle TV show seasons/episodes
        if (currentMediaType === 'tv' && movie.seasons) {
            currentSeasons = movie.seasons;
            setupEpisodeSelector();
        }
    }
}

// Setup episode selector for TV shows
async function setupEpisodeSelector() {
    const episodeSelector = document.getElementById('episode-selector');
    const seasonSelect = document.getElementById('season-select');
    const episodeSelect = document.getElementById('episode-select');
    
    if (currentSeasons && currentSeasons.length > 0) {
        episodeSelector.style.display = 'flex';
        
        // Populate seasons (skip season 0 which is usually specials)
        const validSeasons = currentSeasons.filter(s => s.season_number > 0);
        seasonSelect.innerHTML = validSeasons.map(season => 
            `<option value="${season.season_number}">Season ${season.season_number}</option>`
        ).join('');
        
        // Load episodes for first season
        await loadEpisodes();
    }
}

// Load episodes for selected season
async function loadEpisodes() {
    const mediaInfo = getMediaInfoFromURL();
    const seasonSelect = document.getElementById('season-select');
    const episodeSelect = document.getElementById('episode-select');
    
    currentSeason = parseInt(seasonSelect.value);
    
    const seasonData = await fetchSeasonDetails(mediaInfo.id, currentSeason);
    
    if (seasonData && seasonData.episodes) {
        episodeSelect.innerHTML = seasonData.episodes.map(episode => 
            `<option value="${episode.episode_number}">Episode ${episode.episode_number} - ${episode.name}</option>`
        ).join('');
        
        currentEpisode = 1;
    }
}

// Change episode
function changeEpisode() {
    const episodeSelect = document.getElementById('episode-select');
    currentEpisode = parseInt(episodeSelect.value);
    
    // If player is loaded, reload with new episode
    const player = document.getElementById('video-player');
    if (player.querySelector('iframe')) {
        playMovie();
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
                    <p>${member.character || 'Actor'}</p>
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
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'movie';
    
    const similarGrid = document.getElementById('similar-grid');
    
    if (similar.length > 0) {
        similarGrid.innerHTML = similar.slice(0, 10).map(item => {
            const posterUrl = item.poster_path 
                ? `${IMG_BASE_URL}/w500${item.poster_path}` 
                : 'https://via.placeholder.com/200x300/4a5568/ffffff?text=No+Image';
            
            const title = item.title || item.name;
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            const typeParam = type === 'tv' ? '&type=tv' : '';
            
            return `
                <div class="similar-card" onclick="window.location.href='player.html?id=${item.id}${typeParam}'">
                    <img src="${posterUrl}" alt="${title}">
                    <h3>${title}</h3>
                    <p>⭐ ${rating}</p>
                </div>
            `;
        }).join('');
    } else {
        similarGrid.innerHTML = '<p style="color: #8b92a7;">No similar content found.</p>';
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
                <p style="font-size: 18px; color: #fff;">Loading...</p>
                <p style="font-size: 14px; color: #8b92a7; margin-top: 10px;">Server: ${source}</p>
            </div>
        </div>
    `;
    
    // Check if it's a TV show
    const mediaInfo = getMediaInfoFromURL();
    const type = mediaInfo.type;
    
    // Get current season and episode for TV shows
    let season = currentSeason || 1;
    let episode = currentEpisode || 1;
    
    if (type === 'tv') {
        const seasonSelect = document.getElementById('season-select');
        const episodeSelect = document.getElementById('episode-select');
        if (seasonSelect && seasonSelect.value) season = parseInt(seasonSelect.value);
        if (episodeSelect && episodeSelect.value) episode = parseInt(episodeSelect.value);
    }
    
    // Determine embed URL based on source
    let embedUrl = '';
    
    switch(source) {
        case 'vidsrc':
            embedUrl = type === 'tv'
                ? `https://vidsrc.to/embed/tv/${movieId}/${season}/${episode}`
                : `https://vidsrc.to/embed/movie/${movieId}`;
            break;
        case 'vidsrc2':
            embedUrl = type === 'tv'
                ? `https://vidsrc.me/embed/tv/${movieId}/${season}/${episode}`
                : `https://vidsrc.me/embed/movie/${movieId}`;
            break;
        case '2embed':
            embedUrl = type === 'tv' 
                ? `https://www.2embed.cc/embedtv/${movieId}?s=${season}&e=${episode}`
                : `https://www.2embed.cc/embed/${movieId}`;
            break;
        case 'moviesapi':
            embedUrl = type === 'tv'
                ? `https://moviesapi.club/tv/${movieId}-${season}-${episode}`
                : `https://moviesapi.club/movie/${movieId}`;
            break;
        default:
            embedUrl = type === 'tv'
                ? `https://vidsrc.to/embed/tv/${movieId}/${season}/${episode}`
                : `https://vidsrc.to/embed/movie/${movieId}`;
    }
    
    // Load the iframe — no sandbox (breaks HLS/streams), ad blocking via Worker
    setTimeout(() => {
        console.log('Loading video from:', embedUrl);
        player.innerHTML = `
            <iframe 
                id="player-iframe"
                src="${embedUrl}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 1;">
            </iframe>
        `;

        // Client-side ad blocking runs regardless of Worker
        blockPopupAds();
        blockAdOverlays();

    }, 500);
}

// ============================================================
//  AD BLOCKING SYSTEM
// ============================================================

// Block window.open popups & new-tab ads
function blockPopupAds() {
    // Kill window.open — almost always ads from embed players
    window.open = function(url) {
        console.warn('🚫 Popup blocked:', url);
        return null;
    };

    // Kill any <a target="_blank"> clicks that originate from ad injections
    document.addEventListener('click', function(e) {
        const a = e.target.closest('a');
        if (!a) return;
        const href  = (a.href  || '').toLowerCase();
        const target = (a.target || '').toLowerCase();
        const adDomains = [
            'doubleclick', 'googlesyndication', 'adnxs', 'adtech',
            'popads', 'popcash', 'exoclick', 'trafficjunky', 'juicyads',
            'adsterra', 'hilltopads', 'adskeeper', 'propellerads',
            'clkrev', 'clickadu', 'clickaine', 'adcash', 'yllix'
        ];
        if (adDomains.some(d => href.includes(d))) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.warn('🚫 Ad link blocked:', href);
            return;
        }
        // Block any blank-target link NOT inside our player
        if (target === '_blank' && !a.closest('#video-player')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.warn('🚫 New-tab ad blocked:', href);
        }
    }, true);

    // Refocus window if an ad stole focus (popup tab opened)
    window.addEventListener('blur', () => {
        setTimeout(() => window.focus(), 200);
    });
}

// Continuously remove injected ad elements
function blockAdOverlays() {
    const adSelectors = [
        'ins.adsbygoogle',
        '[id*="google_ads"]',
        '[id*="div-gpt-ad"]',
        '[class*="popunder"]',
        '[class*="pop-up"]',
        '[id*="popunder"]',
        '[data-adsbygoogle-status]',
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="adnxs.com"]',
        'iframe[src*="adtech.de"]',
        'iframe[src*="popads"]',
        'iframe[src*="popcash"]',
        'iframe[src*="exoclick"]',
        'iframe[src*="trafficjunky"]',
        'iframe[src*="adsterra"]',
        'iframe[src*="propellerads"]'
    ];

    const knownAdDomains = [
        'doubleclick', 'googlesyndication', 'adnxs', 'adtech',
        'popads', 'popcash', 'exoclick', 'trafficjunky', 'juicyads',
        'adsterra', 'hilltopads', 'adskeeper', 'propellerads',
        'clkrev', 'clickadu', 'yllix', 'adcash', 'clickaine',
        'adblade', 'revcontent', 'taboola', 'outbrain'
    ];

    const allowedEmbeds = ['vidsrc', '2embed', 'moviesapi', 'embedsoap', 'autoembed'];

    function cleanAds() {
        // Remove known ad selectors
        adSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (!el.closest('#video-player')) {
                    el.remove();
                }
            });
        });

        // Kill any injected <iframe> outside the player that looks like an ad
        document.querySelectorAll('body > iframe, body > div > iframe').forEach(iframe => {
            const src = (iframe.src || '').toLowerCase();
            const isOurPlayer = iframe.id === 'player-iframe';
            const isAllowed = allowedEmbeds.some(e => src.includes(e));
            if (!isOurPlayer && !isAllowed) {
                iframe.remove();
                console.warn('🚫 Injected ad iframe removed:', src);
            }
        });

        // Kill injected <script> pointing to ad networks
        document.querySelectorAll('script[src]').forEach(script => {
            const src = (script.src || '').toLowerCase();
            if (knownAdDomains.some(d => src.includes(d))) {
                script.remove();
                console.warn('🚫 Ad script removed:', src);
            }
        });

        // Kill full-screen overlay divs injected on top of content
        document.querySelectorAll('body > div').forEach(div => {
            const style = window.getComputedStyle(div);
            const isFixed = style.position === 'fixed';
            const coversAll = parseInt(style.width) > window.innerWidth * 0.8 &&
                              parseInt(style.height) > window.innerHeight * 0.8;
            const zIndex = parseInt(style.zIndex) || 0;
            const isOurs = div.id === 'video-player' || div.classList.contains('navbar') ||
                           div.classList.contains('mobile-nav') || div.closest('nav');
            if (isFixed && coversAll && zIndex > 100 && !isOurs) {
                div.remove();
                console.warn('🚫 Full-screen ad overlay removed');
            }
        });
    }

    // Run immediately and every 1.5 seconds
    cleanAds();
    setInterval(cleanAds, 1500);

    // Watch for dynamically injected nodes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const tag = node.tagName.toLowerCase();
                const src = (node.src || '').toLowerCase();
                const id  = (node.id || '').toLowerCase();
                const cls = (typeof node.className === 'string' ? node.className : '').toLowerCase();

                // Block injected iframes that aren't our player
                if (tag === 'iframe' && node.id !== 'player-iframe') {
                    if (!allowedEmbeds.some(e => src.includes(e))) {
                        node.remove();
                        console.warn('🚫 MutationObserver blocked iframe:', src);
                        return;
                    }
                }
                // Block injected ad scripts
                if (tag === 'script' && src && knownAdDomains.some(d => src.includes(d))) {
                    node.remove();
                    console.warn('🚫 MutationObserver blocked script:', src);
                }
                // Block classic ad div/span class names
                if ((tag === 'div' || tag === 'span') &&
                    (cls.includes('popunder') || cls.includes('pop-up') || 
                     id.includes('popunder') || cls.includes('ad-overlay')) &&
                    !node.closest('#video-player')) {
                    node.remove();
                    console.warn('🚫 MutationObserver blocked ad element');
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Override document.write used by legacy ad scripts
const _origWrite = document.write.bind(document);
document.write = function(html) {
    const adPhrases = ['googlesyndication', 'doubleclick', 'popads', 'adsbygoogle', 'popcash'];
    if (typeof html === 'string' && adPhrases.some(p => html.includes(p))) {
        console.warn('🚫 document.write ad blocked');
        return;
    }
    _origWrite(html);
};

// Run ad blocking immediately on page load (before player starts)
blockPopupAds();
blockAdOverlays();

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
    const movieTitle = document.getElementById('movie-title').textContent;
    
    // Create download modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; max-width: 500px; width: 100%;">
            <h2 style="color: #fff; margin-bottom: 20px; font-size: 24px;">Download Options</h2>
            <p style="color: #8b92a7; margin-bottom: 25px;">Choose download quality for: ${movieTitle}</p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <a href="https://dl.vidsrc.me/movie/${movieId}" target="_blank" style="background: linear-gradient(135deg, #00d4aa, #00a885); color: #0d0d0d; padding: 15px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600;">
                    <i class="fas fa-download"></i> Download HD (VidSrc)
                </a>
                <a href="https://www.2embed.cc/embed/${movieId}" target="_blank" style="background: rgba(255, 255, 255, 0.1); color: #fff; padding: 15px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.2);">
                    <i class="fas fa-download"></i> Alternative Source
                </a>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: rgba(255, 0, 0, 0.2); color: #fff; padding: 15px; border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addToWatchlist() {
    const movieTitle = document.getElementById('movie-title').textContent;
    
    // Save to localStorage
    let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const movieId = getMovieIdFromURL();
    
    const movieData = {
        id: movieId,
        title: movieTitle,
        poster: document.getElementById('movie-poster').src,
        addedAt: new Date().toISOString()
    };
    
    // Check if already in watchlist
    const exists = watchlist.find(item => item.id === movieId);
    
    if (!exists) {
        watchlist.push(movieData);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showNotification(`✓ ${movieTitle} added to watchlist!`, 'success');
    } else {
        showNotification(`${movieTitle} is already in your watchlist.`, 'info');
    }
}

function addToList() {
    const movieTitle = document.getElementById('movie-title').textContent;
    
    // Create custom list modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; max-width: 400px; width: 100%;">
            <h2 style="color: #fff; margin-bottom: 20px; font-size: 24px;">Add to List</h2>
            <p style="color: #8b92a7; margin-bottom: 20px;">${movieTitle}</p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button onclick="addToCustomList('favorites'); this.parentElement.parentElement.parentElement.remove();" style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 15px; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-star"></i> Favorites
                </button>
                <button onclick="addToCustomList('watch-later'); this.parentElement.parentElement.parentElement.remove();" style="background: rgba(0, 212, 170, 0.2); color: #00d4aa; padding: 15px; border: 1px solid rgba(0, 212, 170, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-clock"></i> Watch Later
                </button>
                <button onclick="addToCustomList('completed'); this.parentElement.parentElement.parentElement.remove();" style="background: rgba(0, 150, 255, 0.2); color: #0096ff; padding: 15px; border: 1px solid rgba(0, 150, 255, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-check"></i> Completed
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: rgba(255, 0, 0, 0.2); color: #fff; padding: 15px; border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addToCustomList(listName) {
    const movieTitle = document.getElementById('movie-title').textContent;
    const movieId = getMovieIdFromURL();
    
    let customLists = JSON.parse(localStorage.getItem('customLists') || '{}');
    if (!customLists[listName]) {
        customLists[listName] = [];
    }
    
    const movieData = {
        id: movieId,
        title: movieTitle,
        poster: document.getElementById('movie-poster').src,
        addedAt: new Date().toISOString()
    };
    
    const exists = customLists[listName].find(item => item.id === movieId);
    if (!exists) {
        customLists[listName].push(movieData);
        localStorage.setItem('customLists', JSON.stringify(customLists));
        showNotification(`✓ Added to ${listName.replace('-', ' ')}!`, 'success');
    } else {
        showNotification(`Already in ${listName.replace('-', ' ')}.`, 'info');
    }
}

function shareMovie() {
    const movieTitle = document.getElementById('movie-title').textContent;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: movieTitle,
            text: `Check out ${movieTitle} on SaintStream!`,
            url: url
        }).catch(() => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✓ Link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('✓ Link copied to clipboard!', 'success');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(0, 212, 170, 0.95)' : 'rgba(0, 150, 255, 0.95)';
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: #fff;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize page
async function initializePage() {
    await loadMovieDetails();
    await loadTrailer();
    await loadCast();
    await loadSimilarMovies();
    
    // Auto-play if parameter is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoplay') === 'true' || urlParams.get('play') === 'true') {
        setTimeout(() => {
            playMovie();
        }, 1000);
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initializePage);