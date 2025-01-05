// Função para carregar os favoritos
async function loadFavorites() {
  const favoritesTableBody = document.getElementById('favoritesTableBody');
  favoritesTableBody.innerHTML = ''; // Limpa a tabela antes de carregar os dados

  // Recupera os favoritos do localStorage
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const updatedFavorites = [];

  for (let favorite of favorites) {
    if (!favorite.population || !favorite.region || !favorite.capital || !favorite.flag) {
      try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(favorite.name)}?fullText=true`);
        const data = await response.json();
        const country = data[0];

        // Atualiza os dados do país
        favorite.population = country.population || 'N/A';
        favorite.region = country.region || 'N/A';
        favorite.capital = country.capital ? country.capital[0] : 'N/A';
        favorite.flag = country.flags?.svg || country.flags?.png || 'default-flag.png'; // Adiciona um fallback para a bandeira
      } catch (error) {
        console.error(`Erro ao buscar informações para ${favorite.name}:`, error);
        continue;
      }
    }

    updatedFavorites.push(favorite);

    // Cria uma linha na tabela
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <a href="country.html?name=${encodeURIComponent(favorite.name)}" target="_blank">
          <img src="${favorite.flag}" alt="Bandeira de ${favorite.name}" class="favorite-flag" />
        </a>
      </td>
      <td>${favorite.name}</td>
      <td>${favorite.population}</td>
      <td>${favorite.region}</td>
      <td>${favorite.capital}</td>
      <td><button class="rounded" onclick="removeFromFavorites('${favorite.name}')">Remover</button></td>
    `;
    favoritesTableBody.appendChild(row);
  }

  // Atualiza os favoritos no localStorage
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
}

// Função para remover um favorito
function removeFromFavorites(name) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(favorite => favorite.name !== name);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

// Chamada para carregar os favoritos após o DOM estar carregado
document.addEventListener('DOMContentLoaded', loadFavorites);
