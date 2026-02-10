# 🏍️ Gerenciador de Manutenção de Motos

Uma aplicação web simples e prática para gerenciar recorrências de manutenção de motos, com foco em troca de óleo e alertas automáticos.

## 📋 Funcionalidades

- ✅ **Cadastro de Clientes**: Registre informações do cliente e sua moto
- ✅ **Rastreamento de Manutenção**: Acompanhe a data da última manutenção e próxima prevista
- ✅ **Sistema de Alertas**: Receba alertas quando a manutenção estiver vencida
- ✅ **Recorrência Configurável**: Defina o intervalo em dias entre manutenções (ex: 29 dias)
- ✅ **Contato do Cliente**: Mantenha informações de contato para avisar o cliente
- ✅ **Histórico de Manutenções**: Visualize todos os registros de manutenção
- ✅ **Interface Responsiva**: Funciona em desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Armazenamento**: JSON (data.json)
- **Servidor**: Express.js na porta 3000

## 📦 Instalação

### Pré-requisitos
- Node.js v14+ e npm instalados

### Passos

1. **Instale as dependências**:
```bash
npm install
```

2. **Inicie o servidor**:
```bash
npm start
```

3. **Acesse a aplicação**:
Abra seu navegador e acesse: `http://localhost:3000`

## 📱 Como Usar

### 1. Cadastrar Nova Manutenção
1. Preencha o formulário "Novo Registro de Manutenção" com:
   - **Nome do Cliente**: Ex: "João Silva"
   - **Modelo da Moto**: Ex: "Honda CB 500"
   - **Tipo de Óleo**: Ex: "Mobil 1 5W30"
   - **Contato do Cliente**: Telefone ou email
   - **Data da Manutenção**: Data que foi realizada (padrão: hoje)
   - **Próxima Manutenção em (dias)**: Intervalo em dias (padrão: 29 dias)

2. Clique em "Cadastrar Manutenção"

### 2. Visualizar Alertas
- A seção **"Manutenções Vencidas"** mostra todos os clientes que precisam fazer manutenção
- Clique em "✓ Manutenção Realizada" para atualizar o registro

### 3. Gerenciar Registros
- Na seção **"Registros de Manutenção"** você vê todos os clientes cadastrados
- **Status**:
  - 🟢 **OK**: Manutenção em dia
  - 🟡 **AVISO**: Falta menos de 3 dias
  - 🔴 **VENCIDA**: Passou da data prevista
- Clique em "✓ Fazer Manutenção" para atualizar
- Clique em "🗑 Deletar" para remover o registro

## 📊 Exemplo de Uso

**Cenário**: Cliente "João" trocar óleo do motor hoje (10-02-2026), precisa trocar novamente daqui 29 dias

1. Preencha o formulário:
   - Cliente: "João"
   - Modelo: "Honda CB 500"
   - Óleo: "Mobil 1 5W30"
   - Contato: "(11) 98765-4321"
   - Data: "10/02/2026"
   - Dias: "29"

2. A aplicação calcula automaticamente que a próxima manutenção será em **11/03/2026**

3. No dia 11/03/2026, o alerta aparecerá na seção "Manutenções Vencidas"

4. Após realizar a manutenção, clique em "✓ Manutenção Realizada" para atualizar para a próxima data

## 📁 Estrutura do Projeto

```
recorrente 2026/
├── package.json           # Dependências do projeto
├── server.js              # Servidor Express
├── data.json              # Arquivo com dados das manutenções (criado automaticamente)
└── public/
    ├── index.html         # Interface principal
    ├── styles.css         # Estilos
    └── app.js            # Lógica do frontend
```

## 🔧 API REST

### Endpoints disponíveis:

**GET** `/api/registros` - Lista todos os registros
```bash
curl http://localhost:3000/api/registros
```

**POST** `/api/registros` - Criar novo registro
```bash
curl -X POST http://localhost:3000/api/registros \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "João",
    "modelo": "Honda CB 500",
    "oleo": "Mobil 1 5W30",
    "contato": "(11) 98765-4321",
    "dataManutencao": "2026-02-10",
    "diasRecorrencia": 29
  }'
```

**PUT** `/api/registros/:id` - Atualizar registro (marca como feito)
```bash
curl -X PUT http://localhost:3000/api/registros/1707559200000
```

**DELETE** `/api/registros/:id` - Deletar registro
```bash
curl -X DELETE http://localhost:3000/api/registros/1707559200000
```

**GET** `/api/pendentes` - Lista apenas manutenções vencidas
```bash
curl http://localhost:3000/api/pendentes
```

## 💾 Persistência de Dados

Todos os dados são salvos automaticamente em um arquivo `data.json` na raiz do projeto. Este arquivo é criado automaticamente na primeira vez que você cadastra um registro.

## 🚀 Funcionalidades Futuras

- [ ] Envio automático de SMS/WhatsApp para cliente quando vencer
- [ ] Integração com banco de dados MySQL/MongoDB
- [ ] Dashboard com gráficos e estatísticas
- [ ] Autenticação de usuários
- [ ] Histórico detalhado de cada cliente
- [ ] Relatório de manutenções realizadas
- [ ] Soft para Android/iOS

## 📝 Notas Importantes

1. **Backup dos dados**: Faça backup regularmente do arquivo `data.json`
2. **Intervalo padrão**: O intervalo padrão é 29 dias (pode ser alterado ao cadastrar)
3. **Notificações**: Verifique a seção "Manutenções Vencidas" regularmente
4. **Atualização de Interface**: A interface atualiza automaticamente a cada 30 segundos

## 🤝 Suporte

Se encontrar problemas:
1. Verifique se o Node.js e npm estão instalados
2. Certifique-se de que a porta 3000 está disponível
3. Verifique se não há erros no navegador (F12 > Console)
4. Reinicie o servidor

## 📄 Licença

Projeto criado para uso pessoal/comercial. Sinta-se livre para modificar conforme necessário.

---

**Desenvolvido em 2026**
