document.addEventListener('DOMContentLoaded', () => {
  // Obtém o parâmetro "name" do URL
  const urlParams = new URLSearchParams(window.location.search);
  const countryName = urlParams.get('name');

  if (!countryName) {
    document.querySelector('.country-details-container').innerHTML =
      '<p class="text-danger">Erro: Nome do país não fornecido.</p>';
    return;
  }

  // Busca informações do país pelo nome
  fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao buscar informações do país.');
      }
      return response.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        throw new Error('País não encontrado.');
      }

      const country = data[0];

      // Popula os elementos da página com os dados do país
      document.querySelector('.country-details img').src = country.flags.svg;
      document.querySelector('.country-details img').alt = `${country.name.common} flag`;
      document.querySelector('.details-text-container h1').textContent = country.name.common;
      document.querySelector('.native-name').textContent =
        Object.values(country.name.nativeName || {})[0]?.common || 'N/A';
      document.querySelector('.population').textContent = country.population.toLocaleString('en-IN');
      document.querySelector('.region').textContent = country.region;
      document.querySelector('.sub-region').textContent = country.subregion || 'N/A';
      document.querySelector('.capital').textContent = country.capital?.[0] || 'N/A';
      document.querySelector('.top-level-domain').textContent = country.tld?.[0] || 'N/A';

      // Moedas
      const currencies = Object.values(country.currencies || {})
        .map((currency) => currency.name)
        .join(', ');
      document.querySelector('.currencies').textContent = currencies || 'N/A';

      // Idiomas
      const languages = Object.values(country.languages || {}).join(', ');
      document.querySelector('.languages').textContent = languages || 'N/A';

      // Países fronteiriços
      const borderCountriesContainer = document.querySelector('.border-countries');
      if (country.borders && country.borders.length > 0) {
        Promise.all(
          country.borders.map((borderCode) =>
            fetch(`https://restcountries.com/v3.1/alpha/${borderCode}`)
              .then((res) => res.json())
              .then((data) => data[0]?.name.common) // Extrai o nome comum do país
          )
        )
          .then((borderNames) => {
            if (borderNames.length > 0) {
              borderNames.forEach((borderName) => {
                const link = document.createElement('a');
                link.href = `country.html?name=${encodeURIComponent(borderName)}`;
                link.textContent = borderName;
                link.classList.add('border-country');
                borderCountriesContainer.appendChild(link);
              });
            } else {
              borderCountriesContainer.innerHTML += '<span>Nenhum país fronteiriço.</span>';
            }
          })
          .catch((error) => {
            console.error('Erro ao carregar países fronteiriços:', error);
            borderCountriesContainer.innerHTML += '<span>Erro ao carregar fronteiras.</span>';
          });
      } else {
        borderCountriesContainer.innerHTML += '<span>Nenhum país fronteiriço.</span>';
      }
    })
    .catch((error) => {
      console.error('Erro:', error);
      document.querySelector('.country-details-container').innerHTML =
        `<p class="text-danger">${error.message}</p>`;
    });
});
