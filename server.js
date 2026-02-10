const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Funções auxiliares
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Erro ao ler arquivo:', error);
  }
  return { registros: [], garantias: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function calcularProximaData(dataAtual, dias) {
  const data = new Date(dataAtual);
  data.setDate(data.getDate() + dias);
  return data.toISOString().split('T')[0];
}

// Rotas
app.get('/api/registros', (req, res) => {
  const data = loadData();
  res.json(data.registros);
});

app.post('/api/registros', (req, res) => {
  const { cliente, modelo, oleo, contato, dataManutencao, diasRecorrencia } = req.body;

  if (!cliente || !modelo || !oleo || !contato || !dataManutencao || !diasRecorrencia) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  const data = loadData();
  const proximaData = calcularProximaData(dataManutencao, parseInt(diasRecorrencia));

  const novoRegistro = {
    id: Date.now(),
    cliente,
    modelo,
    oleo,
    contato,
    dataManutencao,
    proximaData,
    diasRecorrencia: parseInt(diasRecorrencia),
    criado: new Date().toISOString()
  };

  data.registros.push(novoRegistro);
  saveData(data);

  res.status(201).json(novoRegistro);
});

app.put('/api/registros/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();

  const registro = data.registros.find(r => r.id == id);
  if (!registro) {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }

  const novaDataManutencao = new Date().toISOString().split('T')[0];
  const novaProximaData = calcularProximaData(novaDataManutencao, registro.diasRecorrencia);

  registro.dataManutencao = novaDataManutencao;
  registro.proximaData = novaProximaData;

  saveData(data);
  res.json(registro);
});

app.delete('/api/registros/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();

  data.registros = data.registros.filter(r => r.id != id);
  saveData(data);

  res.json({ mensagem: 'Registro deletado com sucesso' });
});

app.get('/api/pendentes', (req, res) => {
  const data = loadData();
  const hoje = new Date().toISOString().split('T')[0];

  const pendentes = data.registros.filter(r => {
    const proximaData = new Date(r.proximaData);
    const dataHoje = new Date(hoje);
    return proximaData <= dataHoje;
  });

  res.json(pendentes);
});

// ===== ROTAS DE GARANTIA =====

app.get('/api/garantias', (req, res) => {
  const data = loadData();
  res.json(data.garantias || []);
});

app.post('/api/garantias', (req, res) => {
  const { cliente, servico, valor, dataServico, mesesGarantia, telefone, descricaoServico } = req.body;

  if (!cliente || !servico || !valor || !dataServico || !mesesGarantia) {
    return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
  }

  const data = loadData();
  
  // Calcular data de vencimento
  const dataInicio = new Date(dataServico);
  const dataVencimento = new Date(dataInicio);
  dataVencimento.setMonth(dataVencimento.getMonth() + parseInt(mesesGarantia));

  const novaGarantia = {
    id: Date.now(),
    cliente,
    servico,
    valor: parseFloat(valor),
    dataServico,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    mesesGarantia: parseInt(mesesGarantia),
    telefone,
    descricaoServico,
    statusAtivo: true,
    dataCriacao: new Date().toISOString()
  };

  if (!data.garantias) data.garantias = [];
  data.garantias.push(novaGarantia);
  saveData(data);

  res.status(201).json(novaGarantia);
});

app.put('/api/garantias/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();

  const garantia = data.garantias.find(g => g.id == id);
  if (!garantia) {
    return res.status(404).json({ erro: 'Garantia não encontrada' });
  }

  Object.assign(garantia, req.body);
  saveData(data);
  res.json(garantia);
});

app.delete('/api/garantias/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();

  data.garantias = data.garantias.filter(g => g.id != id);
  saveData(data);

  res.json({ mensagem: 'Garantia deletada com sucesso' });
});

app.get('/api/garantias/ativas', (req, res) => {
  const data = loadData();
  const hoje = new Date().toISOString().split('T')[0];

  const ativas = data.garantias.filter(g => {
    const dataVencimento = new Date(g.dataVencimento);
    const dataHoje = new Date(hoje);
    return dataVencimento >= dataHoje && g.statusAtivo;
  });

  res.json(ativas);
});

app.get('/api/garantias/:id/pdf', async (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const garantia = data.garantias.find(g => g.id == id);

  if (!garantia) {
    return res.status(404).json({ erro: 'Garantia não encontrada' });
  }

  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    });

    // Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('TERMO DE GARANTIA', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('Box Motors - Serviços de Manutenção', { align: 'center' });
    doc.fontSize(9)
       .text('CNPJ: 52.301.740/0001-61 | (69) 99314-4190', { align: 'center' });
    
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(1);

    // Cliente
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMAÇÕES DO CLIENTE', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${garantia.cliente}`);
    doc.text(`Telefone: ${garantia.telefone || 'N/A'}`);
    doc.moveDown(0.5);

    // Serviço
    doc.fontSize(11).font('Helvetica-Bold').text('SERVIÇO REALIZADO', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Tipo: ${garantia.servico}`);
    doc.text(`Descrição: ${garantia.descricaoServico || 'Serviço geral'}`);
    doc.text(`Valor: R$ ${garantia.valor.toFixed(2)}`);
    doc.text(`Data: ${new Date(garantia.dataServico).toLocaleDateString('pt-BR')}`);
    doc.moveDown(0.5);

    // Garantia
    doc.fontSize(11).font('Helvetica-Bold').text('PERÍODO DE GARANTIA', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Duração: ${garantia.mesesGarantia} mês(es)`);
    doc.text(`Início: ${new Date(garantia.dataServico).toLocaleDateString('pt-BR')}`);
    doc.text(`Vencimento: ${new Date(garantia.dataVencimento).toLocaleDateString('pt-BR')}`);
    
    const hoje = new Date().toISOString().split('T')[0];
    const status = new Date(garantia.dataVencimento) >= new Date(hoje) ? 'ATIVA' : 'VENCIDA';
    const cor = status === 'ATIVA' ? [0, 150, 0] : [200, 0, 0];
    
    doc.fillColor(...cor).fontSize(12).font('Helvetica-Bold').text(`STATUS: ${status}`);
    doc.fillColor(0, 0, 0);
    doc.moveDown(0.8);

    // Condições
    doc.fontSize(11).font('Helvetica-Bold').text('CONDIÇÕES', { underline: true });
    doc.fontSize(9).font('Helvetica');
    
    doc.text('1. Cobre defeitos de fabricação e mau funcionamento.');
    doc.text('2. Válida pelo período especificado a partir da data do serviço.');
    doc.text('3. Não cobre desgaste normal ou uso incorreto.');
    doc.text('4. Apresente este termo e nota fiscal para ativar garantia.');
    doc.text('5. Revisões podem ser necessárias para validação.');
    doc.text('6. Box Motors reserva-se o direito de reparar ou reembolsar.');
    
    doc.moveDown(1);
    
    // Rodapé
    doc.fontSize(8).text('Este documento é válido como comprovante de garantia.', { align: 'center' });
    doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
    doc.text('Box Motors © 2026', { align: 'center' });

    // Resposta
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Garantia_${garantia.cliente.replace(/\\s+/g, '_')}_${garantia.id}.pdf"`);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ erro: 'Erro ao gerar PDF' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
