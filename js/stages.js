document.addEventListener('DOMContentLoaded', function() {
  const stagesList = document.getElementById('stages-list');
  let stages = JSON.parse(localStorage.getItem('stages')) || [];

  function renderStages() {
    stagesList.innerHTML = stages.map((stage, index) => `
      <div class="stage-item" data-index="${index}">
        <input type="text" class="stage-name-input" value="${stage.name}" />
        <input type="checkbox" class="stage-show-checkbox" ${stage.showInKanban ? 'checked' : ''} />
        <label>Exibir no funil</label>
        <button class="delete-stage-button">🗑️</button>
      </div>
    `).join('');

    bindDeleteButtons();
  }

  function bindDeleteButtons() {
    // Adiciona eventos aos botões de lixeira
    document.querySelectorAll('.delete-stage-button').forEach(button => {
      button.onclick = function() {
        const index = this.parentNode.getAttribute('data-index');
        deleteStage(index);
      };
    });
  }

  function addNewStageElement() {
    const newStageElement = document.createElement('div');
    newStageElement.classList.add('stage-item');
    newStageElement.innerHTML = `
      <input type="text" class="stage-name-input" value="" placeholder="Nova Etapa" />
      <input type="checkbox" class="stage-show-checkbox" />
      <label>Exibir no funil</label>
      <button class="delete-stage-button">🗑️</button>
    `;
    stagesList.appendChild(newStageElement);
    // Foca no novo input
    newStageElement.querySelector('.stage-name-input').focus();

    // Adiciona evento ao novo botão de lixeira
    newStageElement.querySelector('.delete-stage-button').addEventListener('click', function() {
      stagesList.removeChild(newStageElement);
    });
  }

  function saveStages() {
    stages = Array.from(document.querySelectorAll('.stage-item')).map(item => {
      return {
        name: item.querySelector('.stage-name-input').value,
        showInKanban: item.querySelector('.stage-show-checkbox').checked
      };
    }).filter(stage => stage.name.trim() !== '');

    localStorage.setItem('stages', JSON.stringify(stages));
    renderStages();

    window.location.href = 'options.html';
  }

  function deleteStage(index) {
    stages.splice(index, 1);
    localStorage.setItem('stages', JSON.stringify(stages));
    renderStages(); // Re-renderiza a lista após deletar a etapa
  }

  // Vincula a função addNewStageElement ao botão de adicionar nova etapa
  document.getElementById('new-stage-btn').addEventListener('click', addNewStageElement);

  // Vincula a função saveStages ao botão de gravar
  document.getElementById('save-stages-btn').addEventListener('click', saveStages);

  renderStages();
});
