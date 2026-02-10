# 🚀 Guia de Deploy - Box Motors

Esta aplicação possui **backend Node.js + frontend estático**. Aqui estão as melhores opções para colocar online:

---

## 📌 Opção 1: RAILWAY.APP (Recomendado ⭐)

**Melhor relação custo/benefício. Hospeda backend E frontend juntos.**

### Passo 1: Criar conta
1. Acesse https://railway.app
2. Clique em "Start a New Project"
3. Conecte sua conta GitHub

### Passo 2: Preparar repositório Git
```bash
# Na pasta do projeto
git init
git add .
git commit -m "Box Motors - Sistema de manutenção de motos"
git remote add origin https://github.com/SEU_USUARIO/box-motors.git
git branch -M main
git push -u origin main
```

### Passo 3: Deploy no Railway
1. No Railway, clique "Deploy from GitHub"
2. Selecione seu repositório `box-motors`
3. Railway detecta Node.js automaticamente
4. Clique "Deploy"
5. Em 2-3 minutos seu app estará online!

**URL gerada automaticamente**: `https://box-motors-production.up.railway.app`

**Vantagens:**
- ✅ Backend + Frontend funcionam juntos
- ✅ Nível gratuito generoso
- ✅ Deploy automático ao fazer push
- ✅ Banco de dados gratuito (Railway Postgres)

---

## 📌 Opção 2: RENDER.COM (Também Recomendado)

**Simples, com nível free, e deploy automático.**

### Passo 1: Criar conta
1. Acesse https://render.com
2. Clique "New" → "Web Service"
3. Conecte seu GitHub

### Passo 2: Configurar
1. Selecione o repositório
2. Nome: `box-motors`
3. Ambiente: `Node`
4. Build: `npm install`
5. Start: `npm start`

### Passo 3: Deploy
1. Clique "Deploy"
2. Aguarde deploy automático (~5 minutos)
3. Seu app está online!

**URL gerada**: `https://box-motors.onrender.com`

**Vantagens:**
- ✅ Nível free funciona bem
- ✅ Deploy automático
- ✅ Interface simples

---

## 📌 Opção 3: REPLIT (Mais Fácil para Iniciantes)

**Não precisa de Git. Edita diretamente online.**

### Passo 1: Criar conta
1. Acesse https://replit.com
2. Clique "Create"

### Passo 2: Importar projeto
1. Clique "Import from GitHub"
2. Cole: `https://github.com/SEU_USUARIO/box-motors`
3. Clique "Import"

### Passo 3: Deploy
1. Clique "Run" (no topo)
2. Clique "Publish" (no canto superior direito)
3. Seu app está online e o link será mostrado!

**Vantagens:**
- ✅ Super fácil
- ✅ Editar código online
- ✅ Compartilhamento instantâneo

---

## 📌 Opção 4: Separar Frontend e Backend

Se quiser máxima flexibilidade:

### Frontend em GitHub Pages + Netlify
```bash
# Criar pasta frontend
mkdir frontend
# Copiar public/* para frontend/
# Fazer deploy em Netlify
```

### Backend em Railway/Render
```bash
# Deploy do server.js
# Atualizar URL da API no frontend
```

**Mudança necessária em app.js:**
```javascript
const API_URL = 'https://sua-api.railway.app/api';
```

---

## 🔧 Configuração para Deploy

### 1. Arquivo .env (opcional mas recomendado)
Crie arquivo `.env` na raiz:
```
NODE_ENV=production
PORT=3000
```

### 2. Atualizar package.json para produção
Já está pronto! Mas se precisar adicionar variáveis:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

### 3. Arquivo gitignore
Já existe! Protege `node_modules` e `data.json`

---

## 📋 Passo a Passo Completo (Railway)

### 1. Versionar seu projeto
```bash
cd c:\Users\BOX\Documents\recorrente\ 2026
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git init
git add .
git commit -m "Box Motors v1.0"
```

### 2. Criar repositório no GitHub
1. Acesse https://github.com/new
2. Nome: `box-motors`
3. Descrição: "Sistema de manutenção de motos"
4. Clique "Create repository"

### 3. Fazer push
```bash
git remote add origin https://github.com/SEU_USUARIO/box-motors.git
git branch -M main
git push -u origin main
```

### 4. Fazer upload do código
1. Copie o link HTTPS do repositório
2. No Railway: New Project → Deploy from GitHub
3. Autorize e selecione `box-motors`
4. Clique Deploy

### 5. Pronto! 🎉
Acesse a URL gerada em ~3 minutos

---

## 🔄 Atualizar o App Online

Depois do primeiro deploy, qualquer mudança é fácil:

```bash
# Fazer mudanças localmente
# Ex: editar app.js, index.html, etc

# Enviar para GitHub
git add .
git commit -m "Descrição da mudança"
git push

# Deploy automático em Railway/Render
# (não precisa fazer nada, atualiza automaticamente)
```

---

## 📊 Limite de Dados (Importante!)

Com `data.json`, os dados são perdidos ao reiniciar o servidor. **Para produção, considere:**

### Opção A: Usar Banco de Dados
- Railway oferece PostgreSQL gratuito
- Render oferece MongoDB gratuito
- Modificar `server.js` para usar banco

### Opção B: Usar objeto em memória
- Ok para pequeno volume de dados
- Dados perdidos ao reiniciar

### Opção C: Usar Firebase (fácil!)
- Google Firebase (nível free é generoso)
- Menos de 10 linhas de código para integrar

---

## 🆘 Troubleshooting

### "Port já está em uso"
```bash
# Encontrar processo na porta 3000
netstat -ano | findstr :3000
# Matar processo
taskkill /PID <PID> /F
```

### Mudanças não aparecem no site
```bash
# Fazer hard refresh
Ctrl + Shift + Delete  (Chrome)
Cmd + Shift + Delete   (Firefox)
```

### Erro 503 - Serviço unavailable
- Esperar alguns segundos
- Verificar logs no Railway/Render dashboard

---

## 💡 Próximos Passos

### Melhorias recomendadas:
1. Adicionar banco de dados (Firebase ou PostgreSQL)
2. Integração WhatsApp/SMS para notificações
3. Autenticação para múltiplos mecânicos
4. Relatórios em PDF
5. App mobile (React Native ou Flutter)

### Links úteis:
- Railway: https://railway.app/docs
- Render: https://render.com/docs
- GitHub: https://github.com

---

**Dúvidas? Teste localmente primeiro com `npm start` antes de fazer deploy!**
