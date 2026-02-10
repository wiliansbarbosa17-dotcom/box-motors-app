Deploy rápido na Railway

1) Crie uma conta em https://railway.app/ e conecte ao seu repositório GitHub.

2) No GitHub, suba este projeto (root contendo `package.json`, `server.js`, pasta `public/`).

3) No Railway, crie um novo projeto -> "Deploy from GitHub" -> selecione o repositório.

4) Railway detecta o `package.json` e executa `npm install` e `npm start`.

5) Certifique-se que `package.json` tem o script `start` (já configurado como `node server.js`).

6) Variáveis de ambiente: se quiser usar `NODE_ENV` ou chaves, configure em Settings -> Variables.

7) Depois do deploy, abra a URL pública fornecida pelo Railway. O backend serve o frontend estático em `/`.

Observações:
- Há um `Procfile` com `web: node server.js` para compatibilidade com algumas plataformas.
- Se preferir, também é possível usar Render ou Railway CLI (`railway up`).
