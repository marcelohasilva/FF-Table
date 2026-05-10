# FF Table

Sistema web para gerenciamento de campeonatos inspirado em Free Fire, sem depender de qualquer API oficial do jogo.

## O que o projeto faz

- cadastro, edição e exclusão de squads com nome, tag e jogadores opcionais
- lançamento manual de resultados por partida
- cálculo automático de pontos por colocação + kills
- ranking em tempo real
- histórico completo das partidas cadastradas
- OCR opcional com Tesseract.js para sugerir squads e kills a partir de prints
- exportação do ranking em CSV
- tema dark/light
- API REST simples com endpoints para squads, resultados, partidas e ranking
- fallback local em JSON e suporte opcional a Firebase/Firestore para deploy persistente

## Stack

- SvelteKit
- API routes do próprio SvelteKit
- persistência local em `data/championship.json`
- Firebase/Firestore opcional para produção
- Tesseract.js para OCR opcional

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

3. Abra `http://localhost:5173`.

4. Para validar o projeto:

   ```bash
   npm run check
   npm run build
   ```

### Persistência local

Sem configurar Firebase, o sistema grava os dados em `data/championship.json`.

## Endpoints disponíveis

- `GET /api/squads`
- `POST /api/squads`
- `PUT /api/squads/:id`
- `DELETE /api/squads/:id`
- `GET /api/results`
- `POST /api/results`
- `DELETE /api/results/:id`
- `GET /api/matches`
- `GET /api/ranking`

## Deploy no Vercel

### Opção 1: rápido, com persistência local apenas para testes

O projeto já está configurado com `@sveltejs/adapter-vercel`, então o deploy sobe normalmente no Vercel. Porém, a persistência em arquivo não é indicada em produção.

### Opção 2: recomendado, com Firebase/Firestore

1. Crie um projeto no Firebase.
2. Ative o Firestore.
3. No Vercel, adicione estas variáveis de ambiente:

   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

4. Faça o deploy com o repositório conectado ao Vercel.
5. Quando as variáveis estiverem presentes, a API passa a usar Firestore automaticamente em vez do arquivo JSON local.

## Estrutura principal

```text
src/lib/components   -> componentes de UI
src/lib/services/api -> consumo da API no frontend
src/lib/utils        -> regras de pontuação, formatação e OCR
src/lib/server       -> persistência e integração opcional com Firebase
src/routes/api       -> endpoints do sistema
```

## Regra de pontuação implementada

- 1º lugar: 12 pontos
- 2º lugar: 9 pontos
- 3º lugar: 8 pontos
- 4º lugar: 7 pontos
- 5º lugar: 6 pontos
- 6º lugar: 5 pontos
- 7º lugar: 4 pontos
- 8º lugar: 3 pontos
- 9º lugar: 2 pontos
- 10º lugar: 1 ponto
- cada kill: 1 ponto
