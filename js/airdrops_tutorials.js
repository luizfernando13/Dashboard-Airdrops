document.addEventListener('DOMContentLoaded', function() {
    fetchAirdropTutorials();

    function fetchAirdropTutorials() {
      fetch('https://raw.githubusercontent.com/DaskSs/airdrops/main/airdropstutorial.json')
        .then(response => response.json())
        .then(data => {
          renderAirdrops(data.airdrops);
        })
        .catch(error => console.error('Error fetching airdrop tutorials:', error));
    }

    function renderAirdrops(airdrops) {
      const tutorialsContainer = document.querySelector('.airdrops-list-tutorial');
      if (!tutorialsContainer) {
        console.error("Não foi possível encontrar o container de airdrops. Verifique se o seletor está correto.");
        return;
      }
      airdrops.forEach(airdrop => {
        const airdropElement = document.createElement('div');
        airdropElement.classList.add('airdrop-item-tutorial');
        airdropElement.innerHTML = `
          <h3>${airdrop.Nome}</h3>
          <p>Ação: ${airdrop.Acao}</p>
        `;
        airdropElement.onclick = () => createModal(airdrop);
        tutorialsContainer.appendChild(airdropElement);
      });
    }
  
    function createModal(airdrop) {
      const modal = document.createElement('div');
      modal.classList.add('modal-tutorial');
    
      // Primeiro substitui '\n' por '<br>'
      let formattedTutorial = airdrop.Tutorial.replace(/\n/g, '<br>');
    
      // Depois procura por URLs e as substitui por links clicáveis, garantindo que não inclui '<br>' nos links
      formattedTutorial = formattedTutorial.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>');
    
      // Usamos 'innerHTML' para que as quebras de linha '<br>' e os links sejam interpretados como HTML
      modal.innerHTML = `
        <div class="modal-content-tutorial">
          <span class="close-button-tutorial">&times;</span>
          <h2>${airdrop.Nome}</h2>
          <p><strong>Site:</strong> <a href="${airdrop.Site}" target="_blank">${airdrop.Site}</a></p>
          <p><strong>Ação:</strong> ${airdrop.Acao}</p>
          <p><strong>Rede:</strong> ${airdrop.Rede}</p>
          <p><strong>Tipo:</strong> ${airdrop.Tipo}</p>
          <p><strong>Tutorial - Passo a Passo:</strong><br><div class="tutorial-text">${formattedTutorial}</div></p>
        </div>
      `;
    
      document.body.appendChild(modal);
      modal.querySelector('.close-button-tutorial').onclick = () => modal.remove();
      modal.style.display = 'block';
    }            
});
