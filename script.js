document.addEventListener("DOMContentLoaded", () => {
  // Elementos principais
  const sections = {
    apresentacao: document.getElementById("section-apresentacao"),
    verificacao: document.getElementById("section-verificacao"),
    calendario: document.getElementById("section-calendario"),
    selecaoAulas: document.getElementById("section-selecaoAulas"),
    calendarioConfirmacao: document.getElementById("section-calendario-confirmacao"),
    confirmacaoEquipe: document.getElementById("section-confirmacaoEquipe"),
    selecaoAulasConfirmacao: document.getElementById("section-selecaoAulasConfirmacao"),
    termos: document.getElementById("section-termos"),
    fim: document.getElementById("section-fim")
  };

  // Elementos do modal
  const modal = document.getElementById("modal-repeticao");
  const modalTitulo = document.getElementById("modal-titulo");
  const modalMensagem = document.getElementById("modal-mensagem");
  const modalFechar = document.getElementById("modal-fechar");
  const modalAplicar = document.getElementById("modal-aplicar");

  // Estado global
  const state = {
    cpf: "",
    selectedDays: [],
    currentMonth: new Date(),
    aulas: [],
    // Variáveis para professores - serão importadas do banco de dados futuramente
    professoresDB: [
      { nome: "José Welligton", materia: "Matemática" },
      { nome: "Eden Pereira", materia: "Física" },
      { nome: "Lucas Gabriel", materia: "Química" },
      { nome: "Noemi de Castro", materia: "Biologia" },
      { nome: "Thuane Barbosa", materia: "História" },
      { nome: "Carlos Silva", materia: "Geografia" },
      { nome: "Ana Paula", materia: "Língua Portuguesa" },
      { nome: "Roberto Alves", materia: "Língua Inglesa" },
      { nome: "Mariana Costa", materia: "Filosofia" },
      { nome: "Pedro Santos", materia: "Sociologia" },
      { nome: "Fernanda Lima", materia: "Ciências" },
      { nome: "Ricardo Oliveira", materia: "Pedagogia" }
    ],
    materias: [
      "Biologia", "Ciências", "Filosofia", "Física", "Geografia",
      "História", "Língua Portuguesa", "Língua Inglesa", "Matemática", 
      "Química", "Sociologia", "Pedagogia"
    ].sort(),
    tipoAgendamento: null, // 'padrao' ou 'variadas'
    manterProfessores: false
  };

  // Navegação entre seções
  function showSection(section) {
    Object.values(sections).forEach(sec => sec.classList.add("hidden"));
    section.classList.remove("hidden");
    window.scrollTo(0, 0);
    
    // Esconder botões fixos se não for a seção de seleção de aulas
    const botoesFixos = document.getElementById("botoes-fixos");
    if (section.id === "section-selecaoAulas") {
      botoesFixos.classList.remove("hidden");
    } else {
      botoesFixos.classList.add("hidden");
    }
  }

  // Configuração do calendário
  function initCalendar() {
    const monthYear = document.getElementById("month-year");
    const calendarDays = document.getElementById("calendar-days");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");

    function renderCalendar() {
      const year = state.currentMonth.getFullYear();
      const month = state.currentMonth.getMonth();
      
      monthYear.textContent = state.currentMonth.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase());

      calendarDays.innerHTML = '';

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Dias vazios no início
      for (let i = 0; i < firstDay.getDay(); i++) {
        calendarDays.appendChild(document.createElement('div'));
      }

      // Dias do mês
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.textContent = day;

        // Verificar se é passado
        if (date < today) {
          dayElement.classList.add('past');
        } else {
          // Verificar se está selecionado
          const isSelected = state.selectedDays.some(selected => 
            selected.toDateString() === date.toDateString()
          );
          
          if (isSelected) dayElement.classList.add('selected');
          
          // Adicionar evento de clique
          dayElement.addEventListener('click', () => toggleDaySelection(date, dayElement));
        }

        // Marcar dia atual
        if (date.toDateString() === today.toDateString()) {
          dayElement.classList.add('today');
        }

        calendarDays.appendChild(dayElement);
      }
    }

    function toggleDaySelection(date, element) {
      const index = state.selectedDays.findIndex(
        d => d.toDateString() === date.toDateString()
      );

      if (index === -1) {
        state.selectedDays.push(date);
        element.classList.add('selected');
      } else {
        state.selectedDays.splice(index, 1);
        element.classList.remove('selected');
      }
    }

    prevBtn.addEventListener('click', () => {
      state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
      renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
      state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
      renderCalendar();
    });

    renderCalendar();
  }

  // Formatação de data
  function formatDate(date) {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    const diaSemana = diasSemana[date.getDay()];
    
    return `${diaSemana} - ${dia}/${mes}/${ano}`;
  }

  // Configurar seção de seleção de aulas
  function setupSelecaoAulas() {
    const btnAulasPadrao = document.getElementById("button-AulasPadrao");
    const btnAulasVariadas = document.getElementById("button-AulasVariadas");
    const contentPadrao = document.getElementById("aulas-padrao-content");
    const contentVariadas = document.getElementById("aulas-variadas-content");
    const btnAvancar = document.getElementById("selecao-avancar");
    const botoesRepeticao = document.getElementById("botoes-repeticao");
    
    // Popular matéria padrão
    const selectMateriaPadrao = document.getElementById("select-materia-padrao");
    selectMateriaPadrao.innerHTML = '<option value="">Selecione a matéria que iremos estudar</option>';
    state.materias.forEach(materia => {
      const option = document.createElement("option");
      option.value = materia;
      option.textContent = materia;
      selectMateriaPadrao.appendChild(option);
    });

    // Resetar estado
    btnAulasPadrao.classList.remove("bg-orange-500", "text-white");
    btnAulasVariadas.classList.remove("bg-orange-500", "text-white");
    contentPadrao.classList.remove("expanded");
    contentVariadas.classList.remove("expanded");
    botoesRepeticao.classList.add("hidden");
    btnAvancar.disabled = true;
    state.tipoAgendamento = null;

    btnAulasPadrao.addEventListener("click", () => {
      btnAulasPadrao.classList.add("bg-orange-500", "text-white");
      btnAulasVariadas.classList.remove("bg-orange-500", "text-white");
      contentPadrao.classList.add("expanded");
      contentVariadas.classList.remove("expanded");
      
      // Ocultar botões de repetição com animação
      botoesRepeticao.classList.remove("show");
      botoesRepeticao.classList.add("hide");
      setTimeout(() => {
        botoesRepeticao.classList.add("hidden");
      }, 300);
      
      state.tipoAgendamento = 'padrao';
      verificarCamposPreenchidos();
      
      // Ajustar altura da seção
      setTimeout(() => {
        ajustarAlturaSelecaoAulas();
      }, 500);
    });

    btnAulasVariadas.addEventListener("click", () => {
      btnAulasVariadas.classList.add("bg-orange-500", "text-white");
      btnAulasPadrao.classList.remove("bg-orange-500", "text-white");
      contentVariadas.classList.add("expanded");
      contentPadrao.classList.remove("expanded");
      
      // Mostrar botões de repetição com animação
      botoesRepeticao.classList.remove("hide", "hidden");
      botoesRepeticao.classList.add("show");
      
      state.tipoAgendamento = 'variadas';
      renderAulasVariadas();
      
      // Ajustar altura da seção
      setTimeout(() => {
        ajustarAlturaSelecaoAulas();
      }, 500);
    });

    // Adicionar eventos para verificar campos
    document.getElementById("select-materia-padrao").addEventListener("change", verificarCamposPreenchidos);
    document.getElementById("input-horario-padrao").addEventListener("change", verificarCamposPreenchidos);
    document.getElementById("select-duracao-padrao").addEventListener("change", verificarCamposPreenchidos);

    // Botões de repetição com modal
    document.getElementById("btn-repetir-horario").addEventListener("click", () => mostrarModal('horario'));
    document.getElementById("btn-repetir-disciplinas").addEventListener("click", () => mostrarModal('disciplinas'));
    document.getElementById("btn-repetir-duracao").addEventListener("click", () => mostrarModal('duracao'));
  }

  // Ajustar altura da seção de seleção de aulas
  function ajustarAlturaSelecaoAulas() {
    const cardInner = document.querySelector("#section-selecaoAulas .card-inner");
    const contentHeight = cardInner.scrollHeight;
    
    // Definir altura mínima baseada no conteúdo
    if (contentHeight > 400) {
      cardInner.style.minHeight = "auto";
      cardInner.style.height = "auto";
    }
  }

  function mostrarModal(tipo) {
    const mensagens = {
      horario: { titulo: "Repetir Horário", mensagem: "Esta ação irá replicar o mesmo horário para todas as aulas selecionadas." },
      disciplinas: { titulo: "Repetir Disciplinas", mensagem: "Esta ação irá aplicar a mesma disciplina para todas as aulas selecionadas." },
      duracao: { titulo: "Repetir Duração", mensagem: "Esta ação irá definir a mesma duração para todas as aulas selecionadas." }
    };
    
    modalTitulo.textContent = mensagens[tipo].titulo;
    modalMensagem.textContent = mensagens[tipo].mensagem;
    modal.classList.remove("hidden");
    
    // Configurar ação do botão aplicar
    modalAplicar.onclick = () => {
      switch(tipo) {
        case 'horario': repetirHorario(); break;
        case 'disciplinas': repetirDisciplinas(); break;
        case 'duracao': repetirDuracao(); break;
      }
      modal.classList.add("hidden");
    };
  }

  // Fechar modal
  modalFechar.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  function verificarCamposPreenchidos() {
    const btnAvancar = document.getElementById("selecao-avancar");
    
    if (state.tipoAgendamento === 'padrao') {
      const materia = document.getElementById("select-materia-padrao").value;
      const horario = document.getElementById("input-horario-padrao").value;
      const duracao = document.getElementById("select-duracao-padrao").value;
      
      btnAvancar.disabled = !(materia && horario && duracao);
    } else if (state.tipoAgendamento === 'variadas') {
      const todosPreenchidos = Array.from(document.querySelectorAll('.select-materia, .input-horario, .select-duracao'))
        .every(campo => campo.value !== '');
      
      btnAvancar.disabled = !todosPreenchidos;
    } else {
      btnAvancar.disabled = true;
    }
  }

  function renderAulasVariadas() {
    const container = document.getElementById("aulas-variadas-container");
    container.innerHTML = "";

    state.selectedDays.sort((a, b) => a - b).forEach((day, index) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow p-4";
      card.innerHTML = `
        <h4 class="font-semibold mb-2">${formatDate(day)}</h4>
        <select class="select-materia w-full rounded-lg border px-3 py-2 text-comfortaa mb-2" data-index="${index}">
          <option value="">Selecione a matéria</option>
        </select>
        <input type="time" class="input-horario w-full rounded-lg border px-3 py-2 text-comfortaa mb-2" data-index="${index}">
        <select class="select-duracao w-full rounded-lg border px-3 py-2 text-comfortaa" data-index="${index}">
          <option value="">Selecione a duração</option>
          <option value="1h">1h</option>
          <option value="1h30">1h30</option>
          <option value="2h">2h</option>
          <option value="2h30">2h30</option>
          <option value="3h">3h</option>
        </select>
      `;
      
      // Popular matérias
      const selectMateria = card.querySelector(".select-materia");
      state.materias.forEach(materia => {
        const option = document.createElement("option");
        option.value = materia;
        option.textContent = materia;
        selectMateria.appendChild(option);
      });

      // Adicionar eventos para verificar preenchimento
      selectMateria.addEventListener("change", verificarCamposPreenchidos);
      card.querySelector(".input-horario").addEventListener("change", verificarCamposPreenchidos);
      card.querySelector(".select-duracao").addEventListener("change", verificarCamposPreenchidos);

      container.appendChild(card);
    });
    
    verificarCamposPreenchidos();
    
    // Scroll automático para o último card no container das aulas variadas
    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }, 300);
  }

  function repetirHorario() {
    const horarios = document.querySelectorAll(".input-horario");
    if (horarios.length > 0) {
      const primeiroHorario = horarios[0].value;
      horarios.forEach(input => input.value = primeiroHorario);
    }
    verificarCamposPreenchidos();
  }

  function repetirDisciplinas() {
    const materias = document.querySelectorAll(".select-materia");
    if (materias.length > 0) {
      const primeiraMateria = materias[0].value;
      materias.forEach(select => select.value = primeiraMateria);
    }
    verificarCamposPreenchidos();
  }

  function repetirDuracao() {
    const duracoes = document.querySelectorAll(".select-duracao");
    if (duracoes.length > 0) {
      const primeiraDuracao = duracoes[0].value;
      duracoes.forEach(select => select.value = primeiraDuracao);
    }
    verificarCamposPreenchidos();
  }

  // Processar dados das aulas
  function processarAulas() {
    state.aulas = [];
    
    const aulasPadraoContent = document.getElementById("aulas-padrao-content");
    
    if (aulasPadraoContent.classList.contains("expanded")) {
      // Aulas Padrão
      const materia = document.getElementById("select-materia-padrao").value;
      const horario = document.getElementById("input-horario-padrao").value;
      const duracao = document.getElementById("select-duracao-padrao").value;
      
      if (materia && horario && duracao) {
        state.selectedDays.sort((a, b) => a - b).forEach(day => {
          // Encontrar professor correspondente à matéria
          const professor = state.manterProfessores ? 
            (state.professoresDB.find(p => p.materia === materia)?.nome || "A definir") : 
            "A definir";
            
          state.aulas.push({
            data: day,
            materia: materia,
            horario: horario,
            duracao: duracao,
            professor: professor
          });
        });
      }
    } else {
      // Aulas Variadas
      state.selectedDays.sort((a, b) => a - b).forEach((day, index) => {
        const materiaElement = document.querySelector(`.select-materia[data-index="${index}"]`);
        const horarioElement = document.querySelector(`.input-horario[data-index="${index}"]`);
        const duracaoElement = document.querySelector(`.select-duracao[data-index="${index}"]`);
        
        const materia = materiaElement ? materiaElement.value : '';
        const horario = horarioElement ? horarioElement.value : '';
        const duracao = duracaoElement ? duracaoElement.value : '';
        
        if (materia && horario && duracao) {
          // Encontrar professor correspondente à matéria
          const professor = state.manterProfessores ? 
            (state.professoresDB.find(p => p.materia === materia)?.nome || "A definir") : 
            "A definir";
          
          state.aulas.push({
            data: day,
            materia: materia,
            horario: horario,
            duracao: duracao,
            professor: professor
          });
        }
      });
    }
  }

  // Preencher tabela de confirmação
  function fillConfirmationTable() {
    const tbody = document.getElementById("tabela-corpo");
    tbody.innerHTML = '';

    state.aulas.forEach(aula => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${formatDate(aula.data)}</td>
        <td class="p-2">${aula.horario || '--'}</td>
        <td class="p-2">${aula.duracao || '--'}</td>
        <td class="p-2">${aula.materia || '--'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Preencher tabela de confirmação de aulas com professores
  function fillAulasConfirmacaoTable() {
    const tbody = document.getElementById("tabela-corpo-aulas");
    tbody.innerHTML = '';

    state.aulas.forEach(aula => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${formatDate(aula.data)}</td>
        <td class="p-2">${aula.horario || '--'}</td>
        <td class="p-2">${aula.duracao || '--'}</td>
        <td class="p-2">${aula.materia || '--'}</td>
        <td class="p-2">${aula.professor || '--'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Configurar professores
  function setupProfessores() {
    const btnSemPref = document.getElementById("sem-preferencia");
    const btnManter = document.getElementById("manter-professores");
    const lista = document.getElementById("professores-lista");
    const info = document.getElementById("professores-info");
    const btnAvancar = document.getElementById("equipe-avancar");
    
    // Resetar estado
    btnSemPref.classList.remove("bg-orange-500", "text-white");
    btnManter.classList.remove("bg-orange-500", "text-white");
    lista.classList.remove("expanded");
    info.classList.remove("expanded");
    btnAvancar.disabled = true;
    state.manterProfessores = false;

    btnSemPref.addEventListener('click', () => {
      btnSemPref.classList.add('bg-orange-500', 'text-white');
      btnManter.classList.remove('bg-orange-500', 'text-white');
      lista.classList.remove("expanded");
      info.classList.remove("expanded");
      state.manterProfessores = false;
      btnAvancar.disabled = false;
    });

    btnManter.addEventListener('click', () => {
      btnManter.classList.add('bg-orange-500', 'text-white');
      btnSemPref.classList.remove('bg-orange-500', 'text-white');
      lista.classList.add("expanded");
      info.classList.add("expanded");
      state.manterProfessores = true;
      btnAvancar.disabled = false;
      renderProfessores();
    });
  }

  function renderProfessores() {
    const container = document.getElementById("professores-columns");
    container.innerHTML = '';
    
    // Obter lista de matérias únicas selecionadas
    const materiasSelecionadas = [...new Set(state.aulas.map(aula => aula.materia))];
    
    // Filtrar professores apenas pelas matérias selecionadas
    const professoresFiltrados = state.professoresDB.filter(prof => 
      materiasSelecionadas.includes(prof.materia)
    );
    
    professoresFiltrados.forEach(prof => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center border-b border-gray-200 pb-1';
      div.innerHTML = `
        <span>${prof.materia} - ${prof.nome}</span>
        <button class="text-red-500 remover-professor">×</button>
      `;
      
      div.querySelector('.remover-professor').addEventListener('click', () => {
        div.remove();
        // Atualizar state.professoresDB removendo o professor
        state.professoresDB = state.professoresDB.filter(p => 
          !(p.materia === prof.materia && p.nome === prof.nome)
        );
      });
      
      container.appendChild(div);
    });
  }

  // Configurar termos
  function setupTermos() {
    const termoUso = document.getElementById("termo-uso");
    const termoPriv = document.getElementById("termo-privacidade");
    const avancarBtn = document.getElementById("termos-avancar");

    function updateButtonState() {
      avancarBtn.disabled = !(termoUso.checked && termoPriv.checked);
    }

    termoUso.addEventListener('change', updateButtonState);
    termoPriv.addEventListener('change', updateButtonState);
  }

  // Gerar código único
  function gerarCodigo() {
    const now = new Date();
    const dataStr = now.getDate().toString().padStart(2, '0') +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getFullYear() +
                   now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0');
    return state.cpf + dataStr;
  }

  // Event Listeners
  document.getElementById("apresentacao-avancar").addEventListener("click", () => {
    showSection(sections.verificacao);
  });

  document.getElementById("button-redirecionamento").addEventListener("click", () => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSejoEoyJBb6DhHDvzZO_8e3bMAPDU2g_pmIdY35Dm6ZAvnBFg/viewform";
  });

  document.getElementById("button-continuarContratacao").addEventListener("click", () => {
    const cpfArea = document.getElementById("cpf-area");
    cpfArea.classList.add("expanded");
  });

  document.getElementById("input-cpf").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length === 11) {
      state.cpf = value;
      showSection(sections.calendario);
      initCalendar();
    }
  });

  document.getElementById("calendario-voltar").addEventListener("click", () => {
    showSection(sections.verificacao);
  });

  document.getElementById("calendario-avancar").addEventListener("click", () => {
    if (state.selectedDays.length === 0) {
      alert("Selecione pelo menos um dia de aula");
      return;
    }
    showSection(sections.selecaoAulas);
    setupSelecaoAulas();
  });

  document.getElementById("selecao-voltar").addEventListener("click", () => {
    // Limpar dias selecionados e voltar
    state.selectedDays = [];
    showSection(sections.calendario);
    initCalendar(); // Re-renderizar calendário para limpar seleções
  });

  document.getElementById("selecao-avancar").addEventListener("click", () => {
    processarAulas();
    
    // Verificar se todas as aulas foram processadas corretamente
    if (state.aulas.length === state.selectedDays.length) {
      fillConfirmationTable();
      showSection(sections.calendarioConfirmacao);
    } else {
      alert("Por favor, preencha todos os campos de aula corretamente.");
    }
  });

  document.getElementById("confirmacao-voltar").addEventListener("click", () => {
    showSection(sections.selecaoAulas);
    setupSelecaoAulas();
  });

  document.getElementById("confirmacao-avancar").addEventListener("click", () => {
    showSection(sections.confirmacaoEquipe);
    setupProfessores();
  });

  document.getElementById("equipe-voltar").addEventListener("click", () => {
    showSection(sections.calendarioConfirmacao);
  });

  document.getElementById("equipe-avancar").addEventListener("click", () => {
    // Atualizar as aulas com os professores selecionados
    state.aulas.forEach(aula => {
      const professorSelecionado = state.professoresDB.find(p => p.materia === aula.materia);
      if (professorSelecionado) {
        aula.professor = professorSelecionado.nome;
      }
    });
    
    fillAulasConfirmacaoTable();
    showSection(sections.selecaoAulasConfirmacao);
  });

  document.getElementById("confirmacao-aulas-voltar").addEventListener("click", () => {
    showSection(sections.confirmacaoEquipe);
  });

  document.getElementById("confirmacao-aulas-avancar").addEventListener("click", () => {
    showSection(sections.termos);
    setupTermos();
  });

  document.getElementById("termos-voltar").addEventListener("click", () => {
    showSection(sections.selecaoAulasConfirmacao);
  });

  // Atualização Envio de Dados para Planilha Teste Final
  
  // Cógido Antigo - Backup
  document.getElementById("termos-avancar").addEventListener("click", () => {
    const codigo = gerarCodigo();
    
    console.log("CPF:", state.cpf);
    console.log("Cod:", codigo);
    console.log("Dados Cronograma:");
    
    state.aulas.forEach(aula => {
      const dataFormatada = aula.data.toISOString().split('T')[0];
      console.log(`${dataFormatada}, ${aula.horario}, ${aula.duracao}, ${aula.materia}, ${aula.professor}`);
    });
    
    showSection(sections.fim);
  });



  // Inicialização
  showSection(sections.apresentacao);
});