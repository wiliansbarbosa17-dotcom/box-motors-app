const http = require('http');
const data = JSON.stringify({
  cliente: 'Teste',
  servico: 'Reparo de Motor',
  valor: 250.5,
  dataServico: '2026-02-10',
  mesesGarantia: 3,
  telefone: '(11) 99999-0000',
  descricaoServico: 'Reparo completo'
});

const opts = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/garantias',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(opts, res => {
  console.log('status', res.statusCode);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('body:', body));
});

req.on('error', e => console.error('req error', e));
req.write(data);
req.end();
