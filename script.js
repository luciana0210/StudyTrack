class Disciplina {
    constructor(id, nome, cargaHoraria = 0) {
        this.id = id;
        this.nome = nome;
        this.cargaHoraria = cargaHoraria;
    }
    getNome() { return this.nome; }
    setNome(nome) { this.nome = nome; }
}

class Meta {
    constructor(id, disciplinaId, horasMeta) {
        this.id = id;
        this.disciplinaId = disciplinaId;
        this.horasMeta = horasMeta;
    }
    getHorasMeta() { return this.horasMeta; }
    setHorasMeta(horas) { this.horasMeta = horas; }
}

class RegistroDeEstudo {
    constructor(id, disciplinaId, data, horas) {
        this.id = id;
        this.disciplinaId = disciplinaId;
        this.data = data;
        this.horas = horas;
    }
    getHoras() { return this.horas; }
}

let disciplinas = [];
let metas = [];
let registros = [];

function gerarId() { return Date.now() + '-' + Math.random().toString(36).substr(2, 6); }

function salvarDados() {
    localStorage.setItem('studytrack_disciplinas', JSON.stringify(disciplinas.map(d => ({ id: d.id, nome: d.nome, cargaHoraria: d.cargaHoraria }))));
    localStorage.setItem('studytrack_metas', JSON.stringify(metas));
    localStorage.setItem('studytrack_registros', JSON.stringify(registros));
}

function carregarDados() {
    const discData = localStorage.getItem('studytrack_disciplinas');
    if (discData) {
        const parsed = JSON.parse(discData);
        disciplinas = parsed.map(d => new Disciplina(d.id, d.nome, d.cargaHoraria));
    } else {
        disciplinas = [new Disciplina('1', 'Engenharia de Software', 60), new Disciplina('2', 'Banco de Dados', 40)];
    }
    const metasData = localStorage.getItem('studytrack_metas');
    if (metasData) {
        metas = JSON.parse(metasData).map(m => new Meta(m.id, m.disciplinaId, m.horasMeta));
    } else {
        metas = [new Meta('m1', '1', 10), new Meta('m2', '2', 8)];
    }
    const regData = localStorage.getItem('studytrack_registros');
    if (regData) {
        registros = JSON.parse(regData).map(r => new RegistroDeEstudo(r.id, r.disciplinaId, r.data, r.horas));
    } else {
        const hoje = new Date().toISOString().slice(0,10);
        registros = [
            new RegistroDeEstudo('r1', '1', hoje, 2.5),
            new RegistroDeEstudo('r2', '2', hoje, 1.5)
        ];
    }
}

function atualizarSelects() {
    const metaSelect = document.getElementById('metaDisciplinaSelect');
    const estudoSelect = document.getElementById('estudoDisciplinaSelect');
    const options = disciplinas.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    metaSelect.innerHTML = options;
    estudoSelect.innerHTML = options;
}

function renderDisciplinas() {
    const container = document.getElementById('disciplinasList');
    if (!disciplinas.length) {
        container.innerHTML = '<p class="small-text">Nenhuma disciplina cadastrada.</p>';
        return;
    }
    container.innerHTML = disciplinas.map(d => `
        <div class="list-item">
            <span><strong>${d.nome}</strong> ${d.cargaHoraria ? `(Carga: ${d.cargaHoraria}h)` : ''}</span>
            <button class="small" data-id="${d.id}" data-action="removerDisc">Remover</button>
        </div>
    `).join('');
    document.querySelectorAll('[data-action="removerDisc"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            disciplinas = disciplinas.filter(d => d.id !== id);
            metas = metas.filter(m => m.disciplinaId !== id);
            registros = registros.filter(r => r.disciplinaId !== id);
            salvarDados();
            atualizarSelects();
            renderDisciplinas();
            renderMetas();
            renderRegistros();
            atualizarRelatorio('todas');
        });
    });
}

function renderMetas() {
    const container = document.getElementById('metasList');
    if (!metas.length) {
        container.innerHTML = '<p class="small-text">Nenhuma meta definida.</p>';
        return;
    }
    container.innerHTML = metas.map(meta => {
        const disc = disciplinas.find(d => d.id === meta.disciplinaId);
        const nomeDisc = disc ? disc.nome : 'Desconhecida';
        return `
            <div class="list-item">
                <span><strong>${nomeDisc}</strong>: ${meta.horasMeta} h/semana</span>
                <button class="small" data-id="${meta.id}" data-action="removerMeta">Remover</button>
            </div>
        `;
    }).join('');
    document.querySelectorAll('[data-action="removerMeta"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            metas = metas.filter(m => m.id !== id);
            salvarDados();
            renderMetas();
            atualizarRelatorio('todas');
        });
    });
}

function renderRegistros() {
    const container = document.getElementById('registrosList');
    if (!registros.length) {
        container.innerHTML = '<p class="small-text">Nenhum registro de estudo.</p>';
        return;
    }
    const sorted = [...registros].sort((a,b) => b.data.localeCompare(a.data)).slice(0,5);
    container.innerHTML = sorted.map(reg => {
        const disc = disciplinas.find(d => d.id === reg.disciplinaId);
        const nomeDisc = disc ? disc.nome : 'Desconhecida';
        return `
            <div class="list-item">
                <span><strong>${nomeDisc}</strong> - ${reg.data}: ${reg.horas} h</span>
                <button class="small" data-id="${reg.id}" data-action="removerReg">Remover</button>
            </div>
        `;
    }).join('');
    document.querySelectorAll('[data-action="removerReg"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            registros = registros.filter(r => r.id !== id);
            salvarDados();
            renderRegistros();
            atualizarRelatorio('todas');
        });
    });
}

function obterInicioSemana(data) {
    const d = new Date(data);
    const dia = d.getDay();
    const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0,10);
}

function obterInicioMes(data) {
    const d = new Date(data);
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10);
}

function calcularHorasPorPeriodo(inicio, fim) {
    const resumo = {};
    registros.forEach(reg => {
        if (reg.data >= inicio && reg.data <= fim) {
            resumo[reg.disciplinaId] = (resumo[reg.disciplinaId] || 0) + reg.horas;
        }
    });
    return resumo;
}

function atualizarRelatorio(filtro) {
    const container = document.getElementById('relatorioProgresso');
    if (!disciplinas.length) {
        container.innerHTML = '<p class="small-text">Nenhuma disciplina cadastrada ainda.</p>';
        return;
    }
    const hoje = new Date().toISOString().slice(0,10);
    let inicio, nomePeriodo;
    if (filtro === 'semana') {
        inicio = obterInicioSemana(hoje);
        nomePeriodo = `Esta semana (${inicio} a ${hoje})`;
    } else if (filtro === 'mes') {
        inicio = obterInicioMes(hoje);
        nomePeriodo = `Este mês (${inicio.slice(0,7)})`;
    } else {
        inicio = '2000-01-01';
        nomePeriodo = 'Todas as datas';
    }
    const fim = hoje;
    const horasPorDisc = calcularHorasPorPeriodo(inicio, fim);
    let html = `<p><strong>Período: ${nomePeriodo}</strong></p>`;
    html += '<div style="display:flex; flex-direction:column; gap:16px;">';
    disciplinas.forEach(disc => {
        const meta = metas.find(m => m.disciplinaId === disc.id);
        const horasMeta = meta ? meta.horasMeta : 0;
        const horasEstudadas = horasPorDisc[disc.id] || 0;
        const progresso = horasMeta > 0 ? (horasEstudadas / horasMeta * 100).toFixed(1) : 0;
        const atingida = horasMeta > 0 && horasEstudadas >= horasMeta ? '✅ Sim' : '❌ Não';
        html += `
            <div class="progress-card">
                <div class="progress-title"><strong>${disc.nome}</strong> ${disc.cargaHoraria ? `(Carga: ${disc.cargaHoraria}h)` : ''}</div>
                <div>Meta semanal: ${horasMeta} h | Estudadas: ${horasEstudadas} h</div>
                <div class="progress-bar-bg"><div class="progress-fill" style="width: ${Math.min(progresso, 100)}%;"></div></div>
                <div>Progresso: ${progresso}% | Meta atingida: ${atingida}</div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function adicionarDisciplina() {
    const nomeInput = document.getElementById('discNome');
    const cargaInput = document.getElementById('cargaHoraria');
    const nome = nomeInput.value.trim();
    const carga = parseFloat(cargaInput.value) || 0;
    if (!nome) return;
    const nova = new Disciplina(gerarId(), nome, carga);
    disciplinas.push(nova);
    salvarDados();
    atualizarSelects();
    renderDisciplinas();
    renderMetas();
    renderRegistros();
    atualizarRelatorio('todas');
    nomeInput.value = '';
    cargaInput.value = '';
}

function definirMeta() {
    const select = document.getElementById('metaDisciplinaSelect');
    const discId = select.value;
    const horas = parseFloat(document.getElementById('metaHoras').value);
    if (!discId || isNaN(horas) || horas <= 0) return;
    const existente = metas.find(m => m.disciplinaId === discId);
    if (existente) {
        existente.setHorasMeta(horas);
    } else {
        metas.push(new Meta(gerarId(), discId, horas));
    }
    salvarDados();
    renderMetas();
    atualizarRelatorio('todas');
    document.getElementById('metaHoras').value = '';
}

function adicionarRegistro() {
    const select = document.getElementById('estudoDisciplinaSelect');
    const discId = select.value;
    const data = document.getElementById('estudoData').value;
    const horas = parseFloat(document.getElementById('estudoHoras').value);
    if (!discId || !data || isNaN(horas) || horas <= 0) return;
    const novo = new RegistroDeEstudo(gerarId(), discId, data, horas);
    registros.push(novo);
    salvarDados();
    renderRegistros();
    atualizarRelatorio('todas');
    document.getElementById('estudoHoras').value = '';
    document.getElementById('estudoData').valueAsDate = new Date();
}

function initApp() {
    carregarDados();
    atualizarSelects();
    renderDisciplinas();
    renderMetas();
    renderRegistros();
    atualizarRelatorio('todas');
    document.getElementById('addDisciplinaBtn').addEventListener('click', adicionarDisciplina);
    document.getElementById('setMetaBtn').addEventListener('click', definirMeta);
    document.getElementById('addRegistroBtn').addEventListener('click', adicionarRegistro);
    document.getElementById('filtroTodasBtn').addEventListener('click', () => atualizarRelatorio('todas'));
    document.getElementById('filtroSemanaBtn').addEventListener('click', () => atualizarRelatorio('semana'));
    document.getElementById('filtroMesBtn').addEventListener('click', () => atualizarRelatorio('mes'));
    document.getElementById('estudoData').valueAsDate = new Date();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

initApp();








































class StudyTrack {
    constructor() {
        this.disciplinas = JSON.parse(localStorage.getItem('disciplinas')) || [];
        this.registros = JSON.parse(localStorage.getItem('registros')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.atualizarSelects();
        this.renderDashboard();
    }

    bindEvents() {
        document.getElementById('disciplinaForm').addEventListener('submit', (e) => this.cadastrarDisciplina(e));
        document.getElementById('metaForm').addEventListener('submit', (e) => this.cadastrarMeta(e));
        document.getElementById('registroForm').addEventListener('submit', (e) => this.registrarHoras(e));
        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filtrarRelatorios(e));
        });
    }

    cadastrarDisciplina(e) {
        e.preventDefault();
        const nome = document.getElementById('nomeDisciplina').value;
        const cargaHoraria = parseFloat(document.getElementById('cargaHoraria').value);

        const disciplina = {
            id: Date.now(),
            nome,
            cargaHoraria,
            horasRealizadas: 0,
            metas: []
        };

        this.disciplinas.push(disciplina);
        this.salvarDados();
        this.atualizarSelects();
        this.renderDashboard();
        e.target.reset();
        this.mostrarMensagem('Disciplina cadastrada com sucesso!', 'success');
    }

    cadastrarMeta(e) {
        e.preventDefault();
        const disciplinaId = parseInt(document.getElementById('selectDisciplina').value);
        const descricao = document.getElementById('descricaoMeta').value;

        const disciplina = this.disciplinas.find(d => d.id === disciplinaId);
        if (disciplina) {
            disciplina.metas.push({
                id: Date.now(),
                descricao,
                concluida: false
            });
            this.salvarDados();
            this.renderDashboard();
            e.target.reset();
            this.mostrarMensagem('Meta cadastrada com sucesso!', 'success');
        }
    }

    registrarHoras(e) {
        e.preventDefault();
        const disciplinaId = parseInt(document.getElementById('selectDisciplinaRegistro').value);
        const data = document.getElementById('dataEstudo').value;
        const horas = parseFloat(document.getElementById('horasEstudadas').value);

        this.registros.push({
            id: Date.now(),
            disciplinaId,
            data,
            horas
        });

        const disciplina = this.disciplinas.find(d => d.id === disciplinaId);
        if (disciplina) {
            disciplina.horasRealizadas += horas;
        }

        this.salvarDados();
        this.renderDashboard();
        e.target.reset();
        this.mostrarMensagem('Horas registradas com sucesso!', 'success');
    }

    atualizarSelects() {
        const selects = [document.getElementById('selectDisciplina'), document.getElementById('selectDisciplinaRegistro')];
        
        selects.forEach(select => {
            select.innerHTML = '<option value="">Selecione uma disciplina...</option>';
            this.disciplinas.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.textContent = d.nome;
                select.appendChild(option);
            });
        });
    }

    calcularProgresso(disciplina) {
        return Math.min((disciplina.horasRealizadas / disciplina.cargaHoraria) * 100, 100);
    }

    filtrarRelatorios(e) {
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.renderDashboard();
    }

    renderDashboard() {
        const filtro = document.querySelector('.filtro-btn.active').dataset.filtro;
        const hoje = new Date();
        
        let registrosFiltrados = this.registros;
        if (filtro === 'semana') {
            const inicioSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
            registrosFiltrados = this.registros.filter(r => new Date(r.data) >= inicioSemana);
        } else if (filtro === 'mes') {
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            registrosFiltrados = this.registros.filter(r => new Date(r.data) >= inicioMes);
        }

        const relatoriosHTML = this.disciplinas.map(disciplina => {
            const horasDisciplina = registrosFiltrados
                .filter(r => r.disciplinaId === disciplina.id)
                .reduce((sum, r) => sum + r.horas, 0);
            
            const progresso = this.calcularProgresso(disciplina);
            const metaSemanalAtingida = horasDisciplina >= 10; // Exemplo de meta

            return `
                <div class="relatorio-card">
                    <h3>${disciplina.nome}</h3>
                    <div class="progresso-bar">
                        <div class="progresso-fill" style="width: ${progresso}%"></div>
                    </div>
                    <div><strong>${progresso.toFixed(1)}%</strong></div>
                    <div>Total Previsto: ${disciplina.cargaHoraria}h</div>
                    <div>Total Realizado: ${disciplina.horasRealizadas.toFixed(1)}h</div>
                    <div class="status">
                        ${disciplina.metas.length} metas | 
                        Semana: ${metaSemanalAtingida ? '✅ Atingida' : '❌ Pendente'}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('relatorios').innerHTML = relatoriosHTML || '<p>Nenhuma disciplina cadastrada ainda.</p>';
    }

    salvarDados() {
        localStorage.setItem('disciplinas', JSON.stringify(this.disciplinas));
        localStorage.setItem('registros', JSON.stringify(this.registros));
    }

    mostrarMensagem(texto, tipo) {
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem ${tipo}`;
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            background: ${tipo === 'success' ? '#4CAF50' : '#f44336'};
            color: white; border-radius: 8px; z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.remove();
        }, 3000);
    }
}

// Inicializar aplicação
const app = new StudyTrack();
