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
