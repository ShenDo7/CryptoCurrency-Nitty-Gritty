// CryptoCurrency Nitty Gritty - Modern JavaScript (no jQuery required)

// API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const GIPHY_API_KEY = 'BkaUZZWcFij6J7AoQj3WtPb1R2p9O6V9';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const gifBtn = document.getElementById('gifBtn');
const cryptoInformation = document.getElementById('cryptoInformation');
const alertDiv = document.getElementById('alertDiv');
const gifsAppearHere = document.getElementById('gifsAppearHere');

// Generate crypto card HTML
function createCryptoCard(data) {
  const card = document.createElement('div');
  card.className = 'col-lg-6';
  card.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="card-header bg-primary text-white d-flex align-items-center gap-3">
        <img src="${data.image}" alt="${data.name}" style="width: 40px; height: 40px; border-radius: 50%;">
        <div>
          <h5 class="mb-0">${data.name}</h5>
          <small class="text-uppercase">${data.symbol}</small>
        </div>
      </div>
      <div class="card-body">
        <p class="card-text small">${data.description ? data.description.substring(0, 300) + '...' : 'No description available.'}</p>
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item d-flex justify-content-between">
          <span>💰 Current Price:</span>
          <strong>$${data.currentPrice?.toLocaleString() || 'N/A'}</strong>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span>📊 Circulating Supply:</span>
          <strong>${data.circulatingSupply?.toLocaleString() || 'N/A'}</strong>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span>📈 Total Supply:</span>
          <strong>${data.totalSupply?.toLocaleString() || 'N/A'}</strong>
        </li>
      </ul>
      <div class="card-footer">
        ${data.homepage ? `<a href="${data.homepage}" target="_blank" class="btn btn-outline-primary btn-sm me-2">🌐 Website</a>` : ''}
        ${data.exchange ? `<a href="${data.exchange}" target="_blank" class="btn btn-success btn-sm">💱 Buy Now</a>` : ''}
      </div>
    </div>
  `;
  return card;
}

// Show alert message
function showAlert(message, type = 'warning') {
  alertDiv.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  setTimeout(() => alertDiv.innerHTML = '', 5000);
}

// Fetch crypto data from CoinGecko
async function fetchCryptoData(cryptoId) {
  try {
    const response = await fetch(`${COINGECKO_API}/coins/${cryptoId}`);
    
    if (!response.ok) {
      throw new Error('Cryptocurrency not found');
    }
    
    const data = await response.json();
    
    const cryptoData = {
      name: data.name,
      symbol: data.symbol,
      description: data.description?.en || '',
      currentPrice: data.market_data?.current_price?.usd,
      circulatingSupply: data.market_data?.circulating_supply,
      totalSupply: data.market_data?.total_supply,
      homepage: data.links?.homepage?.[0] || '',
      image: data.image?.large || '',
      exchange: data.tickers?.[0]?.trade_url || ''
    };

    // Save to session storage
    const keyName = `${cryptoData.name}-information`;
    sessionStorage.setItem(keyName, JSON.stringify(cryptoData));

    // Create and prepend card
    const card = createCryptoCard(cryptoData);
    cryptoInformation.prepend(card);

  } catch (error) {
    console.error('Error fetching crypto data:', error);
    showAlert('Please enter a valid cryptocurrency name (e.g., bitcoin, ethereum, dogecoin)');
  }
}

// Fetch random crypto
async function fetchRandomCrypto() {
  try {
    const response = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&per_page=100`);
    const coins = await response.json();
    
    const randomIndex = Math.floor(Math.random() * coins.length);
    const randomCoin = coins[randomIndex];
    
    await fetchCryptoData(randomCoin.id);
  } catch (error) {
    console.error('Error fetching random crypto:', error);
    showAlert('Error fetching random cryptocurrency. Please try again.');
  }
}

// Fetch GIF from Giphy
async function fetchCryptoGif() {
  try {
    const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=cryptocurrency`);
    const data = await response.json();
    
    const img = document.createElement('img');
    img.src = data.data.images.fixed_height_small.url;
    img.alt = 'Crypto GIF';
    img.className = 'rounded';
    img.style.height = '100px';
    
    gifsAppearHere.appendChild(img);
  } catch (error) {
    console.error('Error fetching GIF:', error);
  }
}

// Load saved searches from session storage
function loadSavedSearches() {
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key.endsWith('-information')) {
      const data = JSON.parse(sessionStorage.getItem(key));
      const card = createCryptoCard(data);
      cryptoInformation.appendChild(card);
    }
  }
}

// Event Listeners
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const crypto = searchInput.value.toLowerCase().trim().replace(/\s+/g, '-');
  
  if (!crypto) {
    showAlert('Please enter a cryptocurrency name');
    return;
  }
  
  fetchCryptoData(crypto);
  searchInput.value = '';
});

// Allow Enter key to search
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchBtn.click();
  }
});

clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.clear();
  cryptoInformation.innerHTML = '';
  gifsAppearHere.innerHTML = '';
});

randomBtn.addEventListener('click', (e) => {
  e.preventDefault();
  fetchRandomCrypto();
});

gifBtn.addEventListener('click', (e) => {
  e.preventDefault();
  fetchCryptoGif();
});

// Initialize - load any saved searches
document.addEventListener('DOMContentLoaded', loadSavedSearches);
