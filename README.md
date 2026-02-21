# Link da Turma

O professor monta a página da turma (blocos/semanas), adiciona materiais com link e instrução, cadastra alunos por email e gera um link único. Alunos acessam com ou sem login; professor vê só suas turmas; sysadmin vê todas.

**Stack:** React 18 + TypeScript + Vite (front) · Node + Express + TypeScript (back) · PostgreSQL 15 · Docker.

---

## Rodar o projeto

```bash
cd fiap-hackaton
cp backend/.env.example backend/.env
docker compose up -d postgres
```

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed    # opcional: dados de teste (turmas, professores, alunos)
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Backend: `http://localhost:3000` · Swagger: `http://localhost:3000/api-docs`  
Frontend: `http://localhost:5173` (proxy `/api` → backend)

**Docker completo:** na raiz, `docker compose up -d --build`. Postgres na porta 5450, backend 3000, front (nginx) 80. Depois: `docker compose exec backend npm run db:migrate`.

---

## O que faz

| Quem       | Ação |
|------------|------|
| Professor  | Cria turma → blocos → materiais (links) → cadastra alunos por email → compartilha 1 link; vê só suas turmas |
| Aluno      | Acessa o link (público) ou entra logado e vê “Minhas turmas”; só leitura |
| Admin      | Vê todas as turmas e professores (menu “Todas as turmas”); pode criar professor via API |

---

Registro público (`/register` ou `POST /auth/register`) cria **aluno**. Professor só é criado pelo sysadmin em `POST /api/admin/users`. Aluno criado pelo professor na turma: senha `aluno123`. Qualquer usuário logado pode trocar a **própria** senha em **Trocar senha** (menu) ou `POST /auth/change-password`.

**Primeiro sysadmin:** cadastre alguém pelo front e no banco rode:
`UPDATE users SET role = 'sysadmin' WHERE email = 'seu@email.com';` — depois login de novo.

---

## API (base `/api`)

**Swagger:** `http://localhost:3000/api-docs` · Token: `POST /auth/login` → resposta `token` → header `Authorization: Bearer <token>`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST   | `/auth/register` | Registro (email, password, name) → user + token |
| POST   | `/auth/login`    | Login → user + token |
| POST   | `/auth/change-password` | Trocar própria senha (auth); body: currentPassword, newPassword |
| GET    | `/public/turmas/link/:linkToken` | Página pública da turma (sem auth); link usa token, não slug |
| GET    | `/turmas`        | Lista: professor=suas, aluno=matriculadas, sysadmin=todas |
| POST   | `/turmas`        | Criar turma (name, subject, slug?) |
| GET    | `/turmas/:id`    | Detalhe com blocos e materiais |
| PUT    | `/turmas/:id`    | Atualizar turma |
| DELETE | `/turmas/:id`    | Excluir turma |
| GET    | `/turmas/:id/alunos` | Listar alunos |
| POST   | `/turmas/:id/alunos` | Cadastrar aluno (email, name?) |
| DELETE | `/turmas/:id/alunos/:userId` | Remover aluno |
| GET    | `/admin/turmas`  | Todas as turmas (sysadmin) |
| POST   | `/admin/users`   | Criar usuário professor/aluno (sysadmin) |

Blocos: `GET/POST /turmas/:turmaId/blocos`, `PUT/DELETE /blocos/:id`.  
Materiais: `GET/POST /blocos/:blocoId/materiais`, `PUT/DELETE /materiais/:id`. Tipos: `video`, `reading`, `exercise`, `test`, `other`.

---

## Estrutura

```
fiap-hackaton/
├── backend/src/    → config, models, repositories, services, controllers, routes, middlewares, docs (Swagger)
├── frontend/src/   → api, components (ui, layout), contexts, pages, styles, types
├── docker-compose.yml
└── README.md
```


## Operação rápida

**DBeaver:** mesmo do `.env` — host `localhost`, port `5450`, database `link_da_turma`, user/pass `postgres`.

**Connection terminated:** quase sempre é Postgres parado ou porta errada. Com Docker use `POSTGRES_PORT=5450` no `.env` e sobe o Postgres antes do backend.

**Deploy:** backend + front em build estático + Postgres; HTTPS e `JWT_SECRET` forte. O link da turma é `origin/t/{linkToken}` (token único por turma, não adivinhável).

**Segurança:** JWT nas rotas; professor só suas turmas, aluno só as matriculadas; bcrypt e express-validator; login registrado em `login_logs` e no console.

**Turma:** tem campo `description` opcional; material é link (URL). O link compartilhado usa `link_token` (gerado na criação da turma), não o slug — só quem tem o link acessa. Upload de arquivo não tem — usar link (Drive etc).