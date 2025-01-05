const countriesContainer = document.querySelector('.countries-container');
const filterByCurrency = document.querySelector('.filter-by-currency');
const searchInput = document.querySelector('.search-container input');
let allCountriesData = [];
let allCurrencies = new Set(); // Usaremos um Set para garantir que não haja moedas duplicadas

// Fetch de todos os países na inicialização
fetch('https://restcountries.com/v3.1/all')
  .then((res) => res.json())
  .then((data) => {
    allCountriesData = data; // Armazena os dados em uma variável global
    populateCurrencyFilter(data); // Popula o filtro de moedas
    renderCountries(data); // Renderiza todos os países inicialmente
  })
  .catch((error) => {
    console.error('Erro ao buscar os países:', error);
  });

// Função para popular o filtro de moedas
function populateCurrencyFilter(data) {
  allCurrencies.clear(); // Garante que não haja duplicatas no Set

  data.forEach((country) => {
    if (country.currencies) {
      Object.keys(country.currencies).forEach((currency) => {
        allCurrencies.add(currency); // Adiciona a moeda ao Set
      });
    }
  });

  // Ordena as moedas em ordem alfabética
  const sortedCurrencies = Array.from(allCurrencies).sort();

  // Limpa o filtro antes de popular novamente
  filterByCurrency.innerHTML = '<option value="" hidden>Filtrar por Moeda</option>';

  // Adiciona cada moeda ordenada ao dropdown
  sortedCurrencies.forEach((currency) => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    filterByCurrency.appendChild(option);
  });
}

// Filtro por moeda
filterByCurrency.addEventListener('change', (e) => {
  const selectedCurrency = e.target.value;

  if (!selectedCurrency) {
    renderCountries(allCountriesData); // Mostra todos os países
    return;
  }

  const filteredCountries = allCountriesData.filter((country) => {
    if (country.currencies) {
      return Object.keys(country.currencies).includes(selectedCurrency);
    }
    return false;
  });

  if (filteredCountries.length > 0) {
    renderCountries(filteredCountries); // Mostra os países filtrados
  } else {
    countriesContainer.innerHTML = `<p>Nenhum país encontrado com a moeda: ${selectedCurrency}</p>`;
  }
});

// Função para renderizar os países na tela
function renderCountries(data) {
  countriesContainer.innerHTML = ''; // Limpa o container

  if (data.length === 0) {
    countriesContainer.innerHTML = '<p>Nenhum país encontrado.</p>';
    return;
  }

  data.forEach((country) => {
    const countryCard = document.createElement('div');
    countryCard.classList.add('country-card');
    countryCard.innerHTML = `
      <img src="${country.flags.svg}" alt="${country.name.common} flag" class="country-flag" />
      <div class="card-text">
        <h3 class="card-title">${country.name.common}</h3>
        <p><b>Population: </b>${country.population.toLocaleString('en-IN')}</p>
        <p><b>Region: </b>${country.region}</p>
        <p><b>Capital: </b>${country.capital?.[0] || 'N/A'}</p>
      </div>
      <div class="text-center mt-3">
        <button class="favorite-button btn btn-outline-primary favorite-btn"><span class="favorite-icon">☆</span> Favorito</button>
      </div>
    `;

    // Evento para redirecionar ao clicar na bandeira
    countryCard.querySelector('.country-flag').addEventListener('click', () => {
      window.location.href = `country.html?name=${encodeURIComponent(country.name.common)}`;
    });

    // Adiciona evento ao botão de favoritos
    countryCard.querySelector('.favorite-button').addEventListener('click', () => {
      addToFavorites(country.name.common, country.flags.svg);
    });

    countriesContainer.append(countryCard);
  });
}

// Adicionar aos favoritos
function addToFavorites(name, flag) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Verifica se já está nos favoritos
  if (favorites.some((fav) => fav.name === name)) {
    alert(`${name} já está nos favoritos!`);
    return;
  }

  favorites.push({ name, flag });
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert(`${name} foi adicionado aos favoritos!`);
}

// Busca por nome do país
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (query === '') {
    renderCountries(allCountriesData); // Mostra todos os países se o campo estiver vazio
    return;
  }

  const filteredCountries = allCountriesData.filter((country) =>
    country.name.common.toLowerCase().includes(query)
  );

  renderCountries(filteredCountries); // Renderiza os países filtrados
});
