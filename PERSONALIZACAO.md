# 🎨 Como Personalizar a Interface do Box Motors

## Mudanças Rápidas

### 1. Trocar Cores da Box Motors
Abra `public/styles.css` e procure por:

```css
/* Cores principais */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Opções de cores populares para oficinas:**

```css
/* Opção 1: Laranja/Profissional */
background: linear-gradient(135deg, #FF6B35 0%, #D92E1B 100%);

/* Opção 2: Azul Profissional */
background: linear-gradient(135deg, #003D82 0%, #00509E 100%);

/* Opção 3: Vermelho Performance */
background: linear-gradient(135deg, #E63946 0%, #A4161A 100%);

/* Opção 4: Verde Moderno */
background: linear-gradient(135deg, #06A77D 0%, #047A5C 100%);

/* Opção 5: Preto Sofisticado */
background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
```

---

### 2. Trocar Nome da Oficina
Abra `public/index.html` e procure por:

```html
<h1>Box Motors</h1>
<p class="tagline">Gerenciador de Manutenção de Motos</p>
```

**Altere para:**
```html
<h1>Sua Oficina Aqui</h1>
<p class="tagline">Seu lema ou descrição</p>
```

**Exemplos:**
```html
<!-- Opção 1 -->
<h1>Moto Express</h1>
<p class="tagline">Manutenção Rápida e Confiável</p>

<!-- Opção 2 -->
<h1>Mecânica Pro</h1>
<p class="tagline">Especialista em Motos</p>

<!-- Opção 3 -->
<h1>Speed Motors</h1>
<p class="tagline">Performance e Qualidade</p>
```

---

### 3. Trocar Logo
Você pode:

#### Opção A: Usar sua própria imagem
1. Salve sua logo (PNG ou JPG) em `public/` com nome `logo.svg` (ou crie uma pasta `images/`)
2. Atualize `index.html`:
```html
<img src="seu-logo.png" alt="Box Motors Logo" class="logo">
```

#### Opção B: Usar um site de logos
- Canva: https://www.canva.com
- Logomaker: https://www.logomaker.com
- Adobe Express: https://www.adobe.com/express

### Opção C: Customizar SVG da logo
A logo atual está em `public/logo.svg`. Você pode:
- Editar no VS Code
- Ou usar: https://www.svgviewer.dev/

---

### 4. Trocar Ícones/Emojis
Procure por em `index.html`:

```html
<!-- Principais ícones -->
⚙️ → ⚡, 🔧, 🛠️, 🏍️
🔴 → ⚠️, 🚨, 🔔
📋 → 📰, 📄, 📑
✓ → ✔️, ✅, 👍
```

**Passos:**
1. Abra `public/index.html`
2. encontre o emoji que quer trocar
3. Substitua por outro

**Links de emojis:**
- https://emojipedia.org/
- https://getemoji.com/

---

## Mudanças Avançadas

### 5. Alterar Fonte
No `public/styles.css`, procure:

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

**Opções de fontes Google:**
```css
/* Fonte Sans Serif Moderna */
font-family: 'Roboto', sans-serif;

/* Fonte Geométrica */
font-family: 'Poppins', sans-serif;

/* Fonte Profissional */
font-family: 'Inter', sans-serif;

/* Fonte Elegante */
font-family: 'Playfair Display', serif;
```

Para usar Google Fonts, adicione no `<head>` do HTML:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
```

---

### 6. Trocar Tema Escuro/Claro
O app atualmente é claro. Para modo escuro:

```css
/* Adicionar ao final de styles.css */
@media (prefers-color-scheme: dark) {
    body {
        background: #1a1a1a;
    }
    
    .container {
        background: #2d2d2d;
    }
    
    section h2, label, .registro-cliente {
        color: #f0f0f0;
    }
    
    input, textarea {
        background: #3d3d3d;
        color: #f0f0f0;
        border-color: #555;
    }
}
```

---

### 7. Adicionar Redes Sociais no Rodapé
Edite `public/index.html` na seção `<footer>`:

```html
<footer>
    <p>&copy; 2026 - Box Motors | Serviços Especializados em Manutenção</p>
    <div class="social-links">
        <a href="https://instagram.com/boxmotors" target="_blank">Instagram</a>
        <a href="https://wa.me/5511987654321" target="_blank">WhatsApp</a>
        <a href="mailto:contato@boxmotors.com">Email</a>
    </div>
</footer>
```

Adicione CSS em `styles.css`:
```css
.social-links {
    margin-top: 10px;
    display: flex;
    gap: 15px;
    justify-content: center;
}

.social-links a {
    color: #667eea;
    text-decoration: none;
    font-size: 12px;
    transition: color 0.3s;
}

.social-links a:hover {
    color: #764ba2;
}
```

---

### 8. Adicionar Informações de Contato no Header
Abra `public/index.html` e atualize o header:

```html
<div class="header-contact">
    <p>📱 (11) 98765-4321</p>
    <p>📧 contato@boxmotors.com</p>
</div>
```

CSS:
```css
.header-contact {
    text-align: center;
    font-size: 12px;
    opacity: 0.9;
    margin-top: 10px;
}
```

---

## 🎯 Exemplos de Personalizações Completas

### Template 1: Profissional Corporate
```css
/* Colors.scss */
Primary: #003D82 (Azul)
Secondary: #00509E
Accent: #FFB81C (Amarelo)

Font: Roboto
```

### Template 2: Moderno e Ousado
```css
Primary: #FF6B35 (Laranja)
Secondary: #D92E1B (Vermelho)
Accent: #F7931E (Ouro)

Font: Poppins
```

### Template 3: Elegante Minimalista
```css
Primary: #1a1a1a (Preto)
Secondary: #333333
Accent: #00FF00 (Verde Neon)

Font: Inter
```

---

## 📋 Checklist de Personalização

- [ ] Trocar nome de "Box Motors" para nome da sua oficina
- [ ] Trocar cores do header com gradiente
- [ ] Substituir logo SVG pela sua imagem
- [ ] Adição de contato (WhatsApp, email, telefone)
- [ ] Adicionar redes sociais no rodapé
- [ ] Trocar fonte (opcional)
- [ ] Adicionar favicon (ícone da aba)
- [ ] Trocar textos de placeholders (ex: "Ex: João Silva")

---

## 📌 Arquivo para Customizar Favicon

Crie um arquivo SVG simples como favicon:

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#667eea"/>
  <text x="50" y="60" font-size="60" font-weight="bold" text-anchor="middle" fill="white">BM</text>
</svg>
```

Adicione ao `<head>` do HTML:
```html
<link rel="icon" href="favicon.svg">
```

---

## 🚀 Próximas Personalizações

1. **Dashboard com Gráficos**: Adicionar Chart.js para visualizar dados
2. **Modo Noturno Completo**: Implementar toggle de tema
3. **Multi-idioma**: Adicionar suporte a outros idiomas
4. **Notificações**: Integrar Pusher ou Firebase para alertas em tempo real
5. **Sistema de Usuários**: Permitir múltiplos mecânicos/oficinas

---

**Dica**: Sempre faça backup antes de grandes mudanças!
