document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('new-airdrop-form');
  const stageSelect = document.getElementById('stage-select');
  const airdropNameInput = document.getElementById('airdrop-name');
  const airdropWebsiteInput = document.getElementById('airdrop-website');
  const airdropWalletInput = document.getElementById('airdrop-wallet');
  const dailyCheckinCheckbox = document.getElementById('daily-checkin');

  // Carrega as etapas para o select
  function loadStages() {
    const stages = JSON.parse(localStorage.getItem('stages')) || [];
    stages.forEach((stage, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = stage.name;
      stageSelect.appendChild(option);
    });
  }

  loadStages();

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const existingAirdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // Gerar um ID único para o novo airdrop usando um timestamp
    const uniqueID = Date.now();

    existingAirdrops.push({
      id: uniqueID, // ID único atribuído aqui
      stageIndex: stageSelect.value,
      name: airdropNameInput.value,
      website: airdropWebsiteInput.value,
      wallet: airdropWalletInput.value,
      date: currentDate,
      dailyCheckin: dailyCheckinCheckbox.checked,
      lastCheckin: currentDate
    });

    localStorage.setItem('airdrops', JSON.stringify(existingAirdrops));
    form.reset();
    updateCheckinInfo(currentDate); // Atualiza imediatamente o status do check-in
    window.location.href = 'options.html'; // Redireciona após salvar
  });

  function updateCheckinInfo(checkinDate) {
    let checkinInfo = document.querySelector('.airdrop-checkin-info');
    if (!checkinInfo) {
      checkinInfo = document.createElement('div');
      checkinInfo.className = 'airdrop-checkin-info';
      document.body.appendChild(checkinInfo); // Anexe a um elemento específico no DOM se necessário
    }
    checkinInfo.textContent = `Checkin Realizado em: ${checkinDate}`;
  }
});
