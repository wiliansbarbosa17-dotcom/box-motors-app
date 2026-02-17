// API Base URL
const API_URL = '/api';

// ===== STATUS ONLINE/OFFLINE =====
let isOnline = navigator.onLine;

function updateStatusIndicator() {
    const onlineIndicator = document.getElementById('status-online');
    const offlineIndicator = document.getElementById('status-offline');
    
    if (isOnline) {
        if (onlineIndicator) onlineIndicator.style.display = 'inline-block';
        if (offlineIndicator) offlineIndicator.style.display = 'none';
    } else {
        if (onlineIndicator) onlineIndicator.style.display = 'none';
        if (offlineIndicator) offlineIndicator.style.display = 'inline-block';
    }
}

window.addEventListener('online', () => {
    isOnline = true;
    updateStatusIndicator();
    console.log('✓ Conexão restaurada');
    sincronizarDadosOffline();
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateStatusIndicator();
    console.log('✗ Sem conexão - usando dados locais');
});

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service worker registrado'))
            .catch(err => console.error('Erro ao registrar SW:', err));
    });
}

// ===== SINCRONIZAÇÃO OFFLINE =====
async function sincronizarDadosOffline() {
    if (!db) return;
    
    try {
        const queue = await getSyncQueue();
        
        for (let item of queue) {
            try {
                if (item.action === 'CREATE_REGISTRO') {
                    await fetch(`${API_URL}/registros`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data)
                    });
                } else if (item.action === 'UPDATE_REGISTRO') {
                    await fetch(`${API_URL}/registros/${item.data.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else if (item.action === 'DELETE_REGISTRO') {
                    await fetch(`${API_URL}/registros/${item.data.id}`, {
                        method: 'DELETE'
                    });
                } else if (item.action === 'CREATE_GARANTIA') {
                    await fetch(`${API_URL}/garantias`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data)
                    });
                } else if (item.action === 'DELETE_GARANTIA') {
                    await fetch(`${API_URL}/garantias/${item.data.id}`, {
                        method: 'DELETE'
                    });
                }
                
                // Remover da fila após sucesso
                await removeFromSyncQueue(item.id);
                console.log(`✓ Sincronizado: ${item.action}`);
            } catch (error) {
                console.error(`Erro ao sincronizar ${item.action}:`, error);
                break; // Para na primeira falha
            }
        }
        
        if (queue.length > 0) {
            carregarDados();
            carregarGarantias();
        }
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

// Tabs
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Manutenção
const formCadastro = document.getElementById('form-cadastro');
const clienteInput = document.getElementById('cliente');
const modeloInput = document.getElementById('modelo');
const oleoInput = document.getElementById('oleo');
const contatoInput = document.getElementById('contato');
const data_manutencaoInput = document.getElementById('data-manutencao');
const diasInput = document.getElementById('dias-recorrencia');
const alertasContainer = document.getElementById('alertas-container');
const registrosContainer = document.getElementById('registros-container');

// Garantia
const formGarantia = document.getElementById('form-garantia');
const garantiaClienteInput = document.getElementById('garantia-cliente');
const garantiaServicoInput = document.getElementById('garantia-servico');
const garantiaDescricaoInput = document.getElementById('garantia-descricao');
const garantiaValorInput = document.getElementById('garantia-valor');
const garantiaDataInput = document.getElementById('garantia-data');
const garantiaMesesInput = document.getElementById('garantia-meses');
const garantiaTelefoneInput = document.getElementById('garantia-telefone');
const garantiasContainer = document.getElementById('garantias-container');
const garantiasAtivasContainer = document.getElementById('garantias-ativas-container');

// SISTEMA DE ABAS
function inicializarAbas() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            mudarAba(tabName);
        });
    });
}

function mudarAba(tabName) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    if (tabName === 'garantia') carregarGarantias();
    else carregarDados();
}

// UTILIDADES
function configurarDataHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    data_manutencaoInput.value = hoje;
    garantiaDataInput.value = hoje;
}

function formatarData(data) {
    const opcoes = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(data).toLocaleDateString('pt-BR', opcoes);
}

function calcularDiasVencimento(proxima_manutencao) {
    const hoje = new Date();
    const dataProxima = new Date(proxima_manutencao);
    const diff = hoje - dataProxima;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function obterStatusRegistro(proxima_manutencao) {
    const hoje = new Date();
    const dataProxima = new Date(proxima_manutencao);
    const diff = dataProxima - hoje;
    const diasFaltando = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (diasFaltando < 0) return 'vencido';
    if (diasFaltando <= 3) return 'aviso';
    return 'ok';
}

function obterStatusGarantia(dataVencimento) {
    const hoje = new Date().toISOString().split('T')[0];
    const dataVenc = new Date(dataVencimento);
    const dataHoje = new Date(hoje);
    if (dataVenc < dataHoje) return 'vencida';
    const diff = dataVenc - dataHoje;
    const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 7) return 'aviso';
    return 'ativa';
}

// MANUTENÇÃO
async function carregarDados() {
    try {
        if (isOnline) {
            const pendentes = await fetch(`${API_URL}/pendentes`).then(r => r.json());
            exibirAlertas(pendentes);
            const registros = await fetch(`${API_URL}/registros`).then(r => r.json());
            exibirRegistros(registros);
            
            // Atualizar cache local
            registros.forEach(r => saveRegistroLocal(r));
        } else {
            // Modo offline - usar dados locais
            const registros = await getRegistrosLocal();
            const hoje = new Date().toISOString().slice(0, 10);
            const pendentes = registros.filter(r => r.proxima_manutencao < hoje);
            
            exibirAlertas(pendentes);
            exibirRegistros(registros);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para dados offline
        if (!isOnline) {
            const registros = await getRegistrosLocal();
            exibirRegistros(registros);
        }
    }
}

function exibirAlertas(pendentes) {
    if (pendentes.length === 0) {
        alertasContainer.innerHTML = '<p style="color: #28a745; font-weight: 600;">✓ Nenhuma manutenção vencida!</p>';
        return;
    }
    let html = '';
    pendentes.forEach(registro => {
        const diasVencido = calcularDiasVencimento(registro.proxima_manutencao);
        html += `
            <div class="alerta-item critico">
                <h3>🚨 ${registro.cliente}</h3>
                <p><strong>Modelo:</strong> ${registro.modelo}</p>
                <p><strong>Contato:</strong> ${registro.contato}</p>
                <p><strong>Óleo:</strong> ${registro.oleo}</p>
                <div class="alerta-info">
                    <div><strong>Vencida há:</strong> ${diasVencido > 1 ? diasVencido + ' dias' : 'HOJE'}</div>
                    <div><strong>Data prevista:</strong> ${formatarData(registro.proxima_manutencao)}</div>
                </div>
                <button class="btn-marcar-feito" onclick="marcarComoFeito(${registro.id})">✓ Manutenção Realizada</button>
            </div>
        `;
    });
    alertasContainer.innerHTML = html;
}

function exibirRegistros(registros) {
    if (registros.length === 0) {
        registrosContainer.innerHTML = '<p>Nenhum registro cadastrado. Crie um novo para começar!</p>';
        return;
    }
    let html = '';
    registros.forEach(registro => {
        const status = obterStatusRegistro(registro.proxima_manutencao);
        html += `
            <div class="registro-card">
                <div class="registro-header">
                    <div class="registro-cliente">${registro.cliente}</div>
                    <div class="registro-status status-${status}">
                        ${status === 'ok' ? '✓ OK' : status === 'aviso' ? '⚠ AVISO' : '🔴 VENCIDA'}
                    </div>
                </div>
                <div class="registro-detalhes">
                    <div class="detalhe-item">
                        <span class="detalhe-label">Modelo da Moto</span>
                        <span class="detalhe-valor">${registro.modelo}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Tipo de Óleo</span>
                        <span class="detalhe-valor">${registro.oleo}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Contato</span>
                        <span class="detalhe-valor">${registro.contato}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Recorrência</span>
                        <span class="detalhe-valor">A cada ${registro.dias} dias</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Última Manutenção</span>
                        <span class="detalhe-valor">${formatarData(registro.data_manutencao)}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Próxima Prevista</span>
                        <span class="detalhe-valor">${formatarData(registro.proxima_manutencao)}</span>
                    </div>
                </div>
                <div class="registro-acoes">
                    <button class="btn-atualizar" onclick="atualizarRegistro(${registro.id})">✓ Fazer Manutenção</button>
                    <button class="btn-deletar" onclick="deletarRegistro(${registro.id})">🗑 Deletar</button>
                </div>
            </div>
        `;
    });
    registrosContainer.innerHTML = html;
}

async function cadastrarManutencao(event) {
    event.preventDefault();
    const dados = {
        cliente: clienteInput.value.trim(),
        modelo: modeloInput.value.trim(),
        oleo: oleoInput.value.trim(),
        contato: contatoInput.value.trim(),
        data_manutencao: data_manutencaoInput.value,
        dias: Number(diasInput.value)
    };
    
    if (!dados.cliente || !dados.modelo || !dados.oleo || !dados.contato) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    try {
        if (isOnline) {
            // Online - enviar para servidor
            const response = await fetch(`${API_URL}/registros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            if (response.ok) {
                const resultado = await response.json();
                await saveRegistroLocal(resultado);
                alert('✓ Manutenção cadastrada com sucesso!');
                formCadastro.reset();
                configurarDataHoje();
                carregarDados();
            } else {
                const erro = await response.json();
                alert('Erro: ' + erro.erro);
            }
        } else {
            // Offline - salvar localmente e adicionar à fila
            const proximaISO = new Date(dados.data_manutencao);
            proximaISO.setDate(proximaISO.getDate() + dados.dias);
            
            const registroLocal = {
                id: Date.now(),
                ...dados,
                proxima_manutencao: proximaISO.toISOString().slice(0, 10),
                _offline: true
            };
            
            await saveRegistroLocal(registroLocal);
            await addToSyncQueue('CREATE_REGISTRO', dados);
            
            alert('✓ Manutenção salva localmente. Será sincronizada quando conectado!');
            formCadastro.reset();
            configurarDataHoje();
            carregarDados();
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar manutenção.');
    }
}

async function atualizarRegistro(id) {
    if (!confirm('Confirmar que a manutenção foi realizada?')) return;
    try {
        const response = await fetch(`${API_URL}/registros/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            alert('✓ Manutenção atualizada! Próxima data já foi calculada.');
            carregarDados();
        } else {
            alert('Erro ao atualizar registro');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar');
    }
}

async function deletarRegistro(id) {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return;
    try {
        const response = await fetch(`${API_URL}/registros/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('✓ Registro deletado com sucesso.');
            carregarDados();
        } else {
            alert('Erro ao deletar registro');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar');
    }
}

async function marcarComoFeito(id) {
    await atualizarRegistro(id);
}

// GARANTIA
async function carregarGarantias() {
    try {
        if (isOnline) {
            const garantias = await fetch(`${API_URL}/garantias`).then(r => r.json());
            garantias.forEach(g => saveGarantiaLocal(g));
            const ativas = garantias.filter(g => obterStatusGarantia(g.dataVencimento) !== 'vencida');
            exibirGarantiasAtivas(ativas);
            exibirTodasGarantias(garantias);
        } else {
            // Modo offline - usar dados locais
            const garantias = await getGarantiasLocal();
            const ativas = garantias.filter(g => obterStatusGarantia(g.dataVencimento) !== 'vencida');
            exibirGarantiasAtivas(ativas);
            exibirTodasGarantias(garantias);
        }
    } catch (error) {
        console.error('Erro ao carregar garantias:', error);
        // Fallback para dados offline
        if (!isOnline) {
            const garantias = await getGarantiasLocal();
            exibirTodasGarantias(garantias);
        }
    }
}

function exibirGarantiasAtivas(garantias) {
    if (garantias.length === 0) {
        garantiasAtivasContainer.innerHTML = '<p style="color: #28a745; font-weight: 600;">✓ Nenhuma garantia ativa!</p>';
        return;
    }
    let html = '';
    garantias.forEach(g => {
        const diasRestantes = Math.ceil((new Date(g.dataVencimento) - new Date()) / (1000 * 60 * 60 * 24));
        const status = obterStatusGarantia(g.dataVencimento);
        const iconStatus = status === 'ativa' ? '✅' : '⚠️';
        html += `
            <div class="alerta-item">
                <h3>${iconStatus} ${g.cliente}</h3>
                <p><strong>Serviço:</strong> ${g.servico}</p>
                <p><strong>Contato:</strong> ${g.telefone || 'N/A'}</p>
                <p><strong>Valor:</strong> R$ ${g.valor.toFixed(2)}</p>
                <div class="alerta-info">
                    <div><strong>Falta:</strong> ${diasRestantes} dias</div>
                    <div><strong>Vence em:</strong> ${formatarData(g.dataVencimento)}</div>
                </div>
                <button class="btn-pdf" onclick="gerarPDF(${g.id})">📄 Gerar PDF</button>
            </div>
        `;
    });
    garantiasAtivasContainer.innerHTML = html;
}

function exibirTodasGarantias(garantias) {
    if (garantias.length === 0) {
        garantiasContainer.innerHTML = '<p>Nenhuma garantia cadastrada</p>';
        return;
    }
    let html = '';
    garantias.forEach(g => {
        const status = obterStatusGarantia(g.dataVencimento);
        const statusTexto = status === 'ativa' ? '✅ ATIVA' : status === 'aviso' ? '⚠️ VENCENDO' : '❌ VENCIDA';
        const borderColor = status === 'ativa' ? '#28a745' : status === 'aviso' ? '#ffc107' : '#dc3545';
        html += `
            <div class="garantia-card" style="border-left-color: ${borderColor}">
                <div class="registro-header">
                    <div class="registro-cliente">${g.cliente}</div>
                    <div class="registro-status status-${status === 'ativa' ? 'ok' : status === 'aviso' ? 'aviso' : 'vencido'}">
                        ${statusTexto}
                    </div>
                </div>
                <div class="registro-detalhes">
                    <div class="detalhe-item">
                        <span class="detalhe-label">Serviço</span>
                        <span class="detalhe-valor">${g.servico}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Valor</span>
                        <span class="detalhe-valor">R$ ${g.valor.toFixed(2)}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Razão</span>
                        <span class="detalhe-valor">${g.descricaoServico || 'Serviço geral'}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Duração</span>
                        <span class="detalhe-valor">${g.mesesGarantia} mês(es)</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Data do Serviço</span>
                        <span class="detalhe-valor">${formatarData(g.dataServico)}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Vencimento</span>
                        <span class="detalhe-valor">${formatarData(g.dataVencimento)}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">Telefone</span>
                        <span class="detalhe-valor">${g.telefone || 'N/A'}</span>
                    </div>
                    
                </div>
                <div class="registro-acoes">
                    <button class="btn-pdf" onclick="gerarPDF(${g.id})">📄 Gerar PDF</button>
                    <button class="btn-deletar" onclick="deletarGarantia(${g.id})">🗑 Deletar</button>
                </div>
            </div>
        `;
    });
    garantiasContainer.innerHTML = html;
}

async function cadastrarGarantia(event) {
    event.preventDefault();
    const dados = {
        cliente: garantiaClienteInput.value.trim(),
        servico: garantiaServicoInput.value,
        descricaoServico: garantiaDescricaoInput.value.trim(),
        valor: garantiaValorInput.value,
        dataServico: garantiaDataInput.value,
        mesesGarantia: garantiaMesesInput.value,
        telefone: garantiaTelefoneInput.value.trim()
    };
    
    if (!dados.cliente || !dados.servico || !dados.valor || !dados.dataServico) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    try {
        if (isOnline) {
            // Online - enviar para servidor
            const response = await fetch(`${API_URL}/garantias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            if (response.ok) {
                const resultado = await response.json();
                await saveGarantiaLocal(resultado);
                alert('✓ Garantia cadastrada com sucesso!');
                formGarantia.reset();
                configurarDataHoje();
                carregarGarantias();
            } else {
                const erro = await response.json();
                alert('Erro: ' + erro.erro);
            }
        } else {
            // Offline - salvar localmente
            const venc = new Date(dados.dataServico);
            venc.setMonth(venc.getMonth() + Number(dados.mesesGarantia));
            
            const garantiaLocal = {
                id: Date.now(),
                ...dados,
                dataVencimento: venc.toISOString().slice(0, 10),
                _offline: true
            };
            
            await saveGarantiaLocal(garantiaLocal);
            await addToSyncQueue('CREATE_GARANTIA', dados);
            
            alert('✓ Garantia salva localmente. Será sincronizada quando conectado!');
            formGarantia.reset();
            configurarDataHoje();
            carregarGarantias();
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar garantia.');
    }
}

async function deletarGarantia(id) {
    if (!confirm('Tem certeza que deseja deletar esta garantia?')) return;
    try {
        const response = await fetch(`${API_URL}/garantias/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('✓ Garantia deletada com sucesso.');
            carregarGarantias();
        } else {
            alert('Erro ao deletar garantia');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar');
    }
}

async function gerarPDF(id) {
    try {
        const response = await fetch(`${API_URL}/garantias/${id}/pdf`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Garantia_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Erro ao gerar PDF');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao gerar PDF');
    }
}

// EVENT LISTENERS
formCadastro.addEventListener('submit', cadastrarManutencao);
formGarantia.addEventListener('submit', cadastrarGarantia);

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    updateStatusIndicator();
    inicializarAbas();
    configurarDataHoje();
    carregarDados();
    setInterval(() => {
        const tabAtiva = document.querySelector('.tab-content.active').id.split('-')[0];
        if (tabAtiva === 'manutencao') carregarDados();
        else carregarGarantias();
    }, 30000);
});
