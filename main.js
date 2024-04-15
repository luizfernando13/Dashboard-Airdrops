// main.js

document.addEventListener('DOMContentLoaded', function() {
  const kanbanBoard = document.getElementById('kanban-board');
  if (!kanbanBoard) {
    console.error("Kanban board não encontrado!");
    return;
  }
  const stages = JSON.parse(localStorage.getItem('stages')) || [];
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  renderKanban(kanbanBoard, stages, airdrops);
});

function renderKanban(kanbanBoard, stages, airdrops) {
  kanbanBoard.innerHTML = ''; // Limpa o quadro do Kanban
  stages.forEach((stage, stageIndex) => {
    if (stage.showInKanban) {
      const column = createKanbanColumn(stage, airdrops, stageIndex);
      kanbanBoard.appendChild(column);
    }
  });
}

function createKanbanColumn(stage, airdrops, stageIndex) {
  const column = document.createElement('div');
  column.className = 'kanban-column';
  column.appendChild(createStageHeader(stage, airdrops, stageIndex));
  column.appendChild(createAirdropList(airdrops, stageIndex));
  return column;
}

function createStageHeader(stage, airdrops, stageIndex) {
  const stageHeader = document.createElement('div');
  stageHeader.className = 'kanban-stage-header';
  const airdropCount = document.createElement('div');
  airdropCount.className = 'kanban-stage-number';
  airdropCount.textContent = airdrops.filter(airdrop => airdrop.stageIndex == stageIndex).length;
  const stageTitle = document.createElement('div');
  stageTitle.className = 'kanban-stage-title';
  stageTitle.textContent = stage.name;
  stageHeader.appendChild(airdropCount);
  stageHeader.appendChild(stageTitle);
  return stageHeader;
}

function createAirdropList(airdrops, stageIndex) {
  const airdropList = document.createElement('div');
  airdrops.filter(airdrop => airdrop.stageIndex == stageIndex).forEach((airdrop, airdropIndex) => {
    airdropList.appendChild(createAirdropCard(airdrop, stageIndex, airdropIndex));
  });
  return airdropList;
}

function createAirdropCard(airdrop, stageIndex, airdropIndex) {
  const airdropCard = document.createElement('div');
  airdropCard.className = 'airdrop-card';
  airdropCard.setAttribute('data-airdrop-id', airdrop.id); // Definir o ID do airdrop no cartão
  airdropCard.innerHTML = `
    <div class="airdrop-details">
      <div class="airdrop-name">${airdrop.name}</div>
      <div style="margin-top: 10px;">
        <div class="airdrop-website">Site: <a href="${airdrop.website}" target="_blank">${formatUrl(airdrop.website)}</a></div>
        <div class="airdrop-wallet">Carteira: ${airdrop.wallet}</div>
      </div>
    </div>
  `;

  // Container para o check-in diário
  const checkinContainer = document.createElement('div');
  checkinContainer.className = 'checkin-container';
  checkinContainer.innerHTML = createCheckinElement(airdrop);
  airdropCard.appendChild(checkinContainer);

  // Botão para excluir o airdrop
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-airdrop-button';
  deleteButton.innerHTML = '&times;';
  deleteButton.title = 'Excluir Airdrop';
  deleteButton.dataset.airdropId = airdrop.id; // Usando dataset para definir o atributo de data.
  deleteButton.onclick = function() {
    const airdropId = this.dataset.airdropId; // Acessando o ID usando dataset.
    if (confirm('Tem certeza que deseja excluir este airdrop?')) {
      deleteAirdrop(airdropId);
    }
  };
  airdropCard.appendChild(deleteButton);

  const deleteButtonContainer = document.createElement('div');
  deleteButtonContainer.className = 'delete-button-container';
  deleteButtonContainer.appendChild(deleteButton);
  airdropCard.appendChild(deleteButtonContainer);

  // Adiciona a funcionalidade de check-in diário
  const checkbox = checkinContainer.querySelector('.daily-checkin-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', function() {
      performDailyCheckin(airdrop.id);
    });
  }

  return airdropCard;
}

// Cria o elemento de check-in
function createCheckinElement(airdrop) {
  if (!airdrop.dailyCheckin) {
    // Se a propriedade dailyCheckin for false, não mostra a checkbox.
    return '';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastCheckin = airdrop.lastCheckin ? new Date(airdrop.lastCheckin) : null;

  // Compara as datas sem a hora
  const isCheckinToday = lastCheckin && lastCheckin.toDateString() === today.toDateString();

  if (isCheckinToday) {
    return `<div class="daily-checkin-done">Checkin diário realizado em: ${lastCheckin.toLocaleDateString('pt-BR')}</div>`;
  } else {
    return `
      <label class="checkbox-container">
        Check-in diário
        <input type="checkbox" class="daily-checkin-checkbox" data-airdrop-id="${airdrop.id}">
        <span class="checkmark"></span>
      </label>
    `;
  }
}


document.addEventListener('click', function(event) {
  if (event.target.classList.contains('daily-checkin-checkbox')) {
    const airdropId = event.target.getAttribute('data-airdrop-id');
    performDailyCheckin(airdropId);
  }
});

// Realiza o check-in diário
function performDailyCheckin(airdropId) {
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  const airdrop = airdrops.find(airdrop => airdrop.id.toString() === airdropId);

  if (airdrop) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Data sem hora

    airdrop.lastCheckin = today.toISOString(); // Salva como string ISO sem hora
    localStorage.setItem('airdrops', JSON.stringify(airdrops));

    // Atualize o DOM
    const airdropCard = document.querySelector(`[data-airdrop-id="${airdropId}"]`).closest('.airdrop-card');
    const checkinContainer = airdropCard.querySelector('.checkin-container');
    checkinContainer.innerHTML = `<div class="daily-checkin-done">Checkin diário realizado em: ${today.toLocaleDateString('pt-BR')}</div>`;
  }
}



function deleteAirdrop(airdropId) {
  let airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  // Certifique-se de converter o id armazenado para o mesmo tipo antes de comparar
  airdropId = parseInt(airdropId, 10);
  airdrops = airdrops.filter(airdrop => airdrop.id !== airdropId);
  localStorage.setItem('airdrops', JSON.stringify(airdrops));
  renderKanban(document.getElementById('kanban-board'), JSON.parse(localStorage.getItem('stages')), airdrops);
}

function formatUrl(url) {
  return url.replace(/^https?:\/\/www\./i, '');
}


function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Endereço copiado para a área de transferência!');
  }).catch(err => {
    console.error('Falha ao copiar: ', err);
  });
}
