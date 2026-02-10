# ⚡ Deploy Rápido em 5 Passos (Railway)

## ✅ Pré-requisitos
- Conta GitHub (crie em https://github.com/signup)
- Conta Railway (crie em https://railway.app)
- Git instalado

---

## 🚀 Passo 1: Versionando o código

Abra PowerShell **na pasta do projeto** e execute:

```powershell
cd "c:\Users\BOX\Documents\recorrente 2026"
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
git init
git add .
git commit -m "Box Motors v1.0 - Sistema de manutenção de motos"
```

---

## 🔗 Passo 2: Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `box-motors`
   - **Description**: "Sistema de manutenção de motos"
   - **Visibility**: Public
3. Clique: "Create repository"

**Copie a URL HTTPS mostrada** (será algo como: `https://github.com/seu-usuario/box-motors.git`)

---

## 📤 Passo 3: Fazer upload do código

Volte ao PowerShell e execute:

```powershell
git remote add origin https://github.com/SEU_USUARIO/box-motors.git
git branch -M main
git push -u origin main
```

Quando pedir senha: crie um Personal Access Token em https://github.com/settings/tokens

**Pronto!** Seu código está no GitHub.

---

## 🚀 Passo 4: Fazer deploy no Railway

1. Acesse: https://railway.app
2. Clique: **"New Project"** (canto superior direito)
3. Selecione: **"Deploy from GitHub"**
4. Autorize Railway a acessar GitHub
5. Procure e selecione: **`box-motors`**
6. Clique: **"Deploy Now"**

Railway vai:
- ✅ Detectar que é Node.js
- ✅ Instalar automaticamente (`npm install`)
- ✅ Iniciar o servidor (`npm start`)
- ✅ Gerar URL automática

⏳ **Aguarde 2-5 minutos...**

---

## 🎉 Passo 5: Acessar seu app!

No dashboard do Railway, procure por:
- **Domains** ou **Environment**
- Uma URL será gerada (ex: `https://box-motors-production.up.railway.app`)

**Clique na URL e seu app está ONLINE!** 🌍

---

## 📝 Depois: Fazer Atualizações

Qualquer mudança é super fácil:

```powershell
# Fazer mudanças no código (exemplo: editar index.html)

# Fazer commit
git add .
git commit -m "Descrição da mudança"

# Fazer push
git push

# ✨ Deploy automático em Railway (não precisa fazer nada!)
```

Railway detecta mudanças automaticamente e redeploy em ~1 minuto.

---

## 🆘 Se Algo Deu Errado

### Erro "Failed to parse origin"
```powershell
# Verificar URL remota
git remote -v

# Se estiver errada, corrigir:
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/box-motors.git
```

### Erro "400 Bad Request"
- Verifique seu Personal Access Token no GitHub
- Gere um novo em: https://github.com/settings/tokens

### App não inicia no Railway
- Vá ao Dashboard → Logs
- Procure pela mensagem de erro
- Verifique se `server.js` está correto

---

## 💡 Dicas Importantes

1. **Backup local**: Sempre mantenha cópia local do projeto
2. **Dados**: Com `data.json` os dados são perdidos ao reiniciar. Para produção, use banco de dados (Railway PostgreSQL é grátis)
3. **Domínio próprio**: Depois pode configurar domínio customizado na Railway
4. **Limite**: Railway free: 500 horas/mês (mais que suficiente)

---

## 📌 Links Úteis

- Railway Dashboard: https://railway.app/dashboard
- Seus Projetos GitHub: https://github.com/seu-usuario?tab=repositories
- Documentação Railway: https://docs.railway.app

---

**Pronto! Seu Box Motors está online! 🎊**

Compartilhe a URL com clientes e colegas. Qualquer atualização é automática ao fazer `git push`.
