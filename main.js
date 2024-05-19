document.addEventListener('DOMContentLoaded', function() {
  const kanbanBoard = document.getElementById('kanban-board');
  const archiveButton = document.getElementById('archive-button');
  const modal = document.getElementById('archive-modal');
  const closeModal = document.querySelector('.modal .close');

  if (!kanbanBoard) {
    console.error("Kanban board não encontrado!");
    return;
  }
  const stages = JSON.parse(localStorage.getItem('stages')) || [];
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  renderKanban(kanbanBoard, stages, airdrops);

  archiveButton.addEventListener('click', function() {
    showArchivedCards();
    modal.style.display = 'block';
  });

  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });
});

function renderKanban(kanbanBoard, stages, airdrops) {
  kanbanBoard.innerHTML = ''; // Limpa o quadro do Kanban
  stages.forEach((stage, stageIndex) => {
    if (stage.showInKanban) {
      const column = createKanbanColumn(stage, airdrops, stageIndex);
      kanbanBoard.appendChild(column);
    }
  });

  addDragAndDropEvents();
}

function createKanbanColumn(stage, airdrops, stageIndex) {
  const column = document.createElement('div');
  column.className = 'kanban-column';
  column.setAttribute('data-stage-index', stageIndex);
  column.appendChild(createStageHeader(stage, airdrops, stageIndex));
  column.appendChild(createAirdropList(airdrops, stageIndex));
  return column;
}

function createStageHeader(stage, airdrops, stageIndex) {
  const stageHeader = document.createElement('div');
  stageHeader.className = 'kanban-stage-header';
  const airdropCount = document.createElement('div');
  airdropCount.className = 'kanban-stage-number';
  airdropCount.textContent = airdrops.filter(airdrop => airdrop.stageIndex == stageIndex && !airdrop.archived).length;
  const stageTitle = document.createElement('div');
  stageTitle.className = 'kanban-stage-title';
  stageTitle.textContent = stage.name;
  stageHeader.appendChild(airdropCount);
  stageHeader.appendChild(stageTitle);
  return stageHeader;
}

function createAirdropList(airdrops, stageIndex) {
  const airdropList = document.createElement('div');
  airdropList.className = 'airdrop-list';
  airdrops.filter(airdrop => airdrop.stageIndex == stageIndex && !airdrop.archived).forEach((airdrop, airdropIndex) => {
    airdropList.appendChild(createAirdropCard(airdrop, stageIndex, airdropIndex));
  });
  return airdropList;
}

function createAirdropCard(airdrop, stageIndex, airdropIndex) {
  const airdropCard = document.createElement('div');
  airdropCard.className = 'airdrop-card';
  airdropCard.setAttribute('data-airdrop-id', airdrop.id);
  airdropCard.setAttribute('draggable', true); // Torna o card arrastável

  // Resumo do endereço da carteira
  const walletText = summarizeText(airdrop.wallet, 25);

  airdropCard.innerHTML = `
    <div class="airdrop-details">
      <div class="airdrop-name">${airdrop.name}</div>
      <div style="margin-top: 10px;">
        <div class="airdrop-website">Site: <a href="${airdrop.website}" target="_blank">${formatUrl(airdrop.website)}</a></div>
        <div class="airdrop-wallet" data-full-wallet="${airdrop.wallet}">Carteira: ${walletText}</div>
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

  // Botão para arquivar o airdrop
  const archiveButton = document.createElement('button');
  archiveButton.className = 'archive-airdrop-button';
  archiveButton.innerHTML = '📁 Arquivar Airdrop';
  archiveButton.title = 'Arquivar Airdrop';
  archiveButton.dataset.airdropId = airdrop.id;
  archiveButton.onclick = function() {
    archiveAirdrop(airdrop.id);
  };
  airdropCard.appendChild(archiveButton);

  // Adiciona a funcionalidade de check-in diário
  const checkbox = checkinContainer.querySelector('.daily-checkin-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', function() {
      performDailyCheckin(airdrop.id);
    });
  }

  return airdropCard;
}

function summarizeText(text, maxChars) {
  if (text.length <= maxChars) return text;
  let half = Math.floor(maxChars / 2);
  return text.substring(0, half) + '...' + text.substring(text.length - half);
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

// Adiciona o evento para copiar o endereço completo da carteira
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('airdrop-wallet')) {
    const fullWalletAddress = event.target.getAttribute('data-full-wallet');
    copyToClipboard(fullWalletAddress);
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

function addDragAndDropEvents() {
  const cards = document.querySelectorAll('.airdrop-card');
  const columns = document.querySelectorAll('.kanban-column');

  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
    column.addEventListener('drop', handleDrop);
  });

  // Adiciona o evento de arrastar para o botão de arquivamento
  const archiveButton = document.getElementById('archive-button');
  archiveButton.addEventListener('dragover', handleDragOver);
  archiveButton.addEventListener('drop', handleArchiveDrop);
}

function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.getAttribute('data-airdrop-id'));
  event.currentTarget.style.opacity = '0.4';
}

function handleDragEnd(event) {
  event.currentTarget.style.opacity = '1';
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDragEnter(event) {
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  const airdropId = event.dataTransfer.getData('text/plain');
  const airdropCard = document.querySelector(`[data-airdrop-id="${airdropId}"]`);
  const newStageIndex = event.currentTarget.getAttribute('data-stage-index');

  // Atualize a etapa do airdrop
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  const airdrop = airdrops.find(airdrop => airdrop.id.toString() === airdropId);
  if (airdrop) {
    airdrop.stageIndex = parseInt(newStageIndex, 10);
    localStorage.setItem('airdrops', JSON.stringify(airdrops));
  }

  event.currentTarget.querySelector('.airdrop-list').appendChild(airdropCard);
  renderKanban(document.getElementById('kanban-board'), JSON.parse(localStorage.getItem('stages')), airdrops);
}

function handleArchiveDrop(event) {
  event.preventDefault();
  const airdropId = event.dataTransfer.getData('text/plain');
  archiveAirdrop(parseInt(airdropId, 10));
}

function archiveAirdrop(airdropId) {
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  const airdrop = airdrops.find(airdrop => airdrop.id === airdropId);
  if (airdrop) {
    airdrop.archived = true;
    localStorage.setItem('airdrops', JSON.stringify(airdrops));
    // Remover o card do DOM
    document.querySelector(`[data-airdrop-id="${airdropId}"]`).remove();
    renderKanban(document.getElementById('kanban-board'), JSON.parse(localStorage.getItem('stages')), airdrops);
  }
}

function showArchivedCards() {
  const archivedCardsContainer = document.getElementById('archived-cards');
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  const archivedAirdrops = airdrops.filter(airdrop => airdrop.archived);

  archivedCardsContainer.innerHTML = '';

  archivedAirdrops.forEach(airdrop => {
    const archivedCard = document.createElement('div');
    archivedCard.className = 'archived-card';
    archivedCard.innerHTML = `
      <div class="airdrop-name">${airdrop.name}</div>
      <div style="margin-top: 10px;">
        <div class="airdrop-website">Site: <a href="${airdrop.website}" target="_blank">${formatUrl(airdrop.website)}</a></div>
        <div class="airdrop-wallet" data-full-wallet="${airdrop.wallet}">Carteira: ${airdrop.wallet}</div>
        <div class="buttons-archived">
        <select class="stage-select">
          ${getStagesOptions()}
        </select>
        <button class="unarchive-button" data-airdrop-id="${airdrop.id}">Desarquivar</button>
        <label class="delete-airdrop-container">
          <button class="delete-airdrop-button" data-airdrop-id="${airdrop.id}" title="Excluir Airdrop">&times;</button>
          Excluir
        </label>
        </div>
      </div>
    `;
    archivedCardsContainer.appendChild(archivedCard);

    const unarchiveButton = archivedCard.querySelector('.unarchive-button');
    unarchiveButton.addEventListener('click', function() {
      unarchiveAirdrop(airdrop.id, archivedCard.querySelector('.stage-select').value);
    });

    const deleteButton = archivedCard.querySelector('.delete-airdrop-button');
    deleteButton.addEventListener('click', function() {
      const airdropId = this.dataset.airdropId;
      if (confirm('Tem certeza que deseja excluir este airdrop?')) {
        deleteAirdrop(airdropId);
        showArchivedCards(); // Atualiza a lista de cartões arquivados após a exclusão
      }
    });
  });
}

function getStagesOptions() {
  const stages = JSON.parse(localStorage.getItem('stages')) || [];
  return stages.map((stage, index) => `<option value="${index}">${stage.name}</option>`).join('');
}

function unarchiveAirdrop(airdropId, stageIndex) {
  const airdrops = JSON.parse(localStorage.getItem('airdrops')) || [];
  const airdrop = airdrops.find(airdrop => airdrop.id === airdropId);
  if (airdrop) {
    airdrop.archived = false;
    airdrop.stageIndex = parseInt(stageIndex, 10);
    localStorage.setItem('airdrops', JSON.stringify(airdrops));
    renderKanban(document.getElementById('kanban-board'), JSON.parse(localStorage.getItem('stages')), airdrops);
    showArchivedCards(); // Atualiza a lista de cartões arquivados
  }
}
