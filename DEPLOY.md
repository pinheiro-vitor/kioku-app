# Guia de Deploy - Kioku 2.0 (Stack Grátis)

Este guia cobre o deploy completo usando **Render (Backend)**, **Vercel (Frontend)** e **Neon (Banco de Dados)**.

---

## 1. Banco de Dados (Neon.tech)
O Neon oferece Postgres gerenciado com plano grátis generoso.

1.  Crie uma conta em [neon.tech](https://neon.tech).
2.  Crie um novo projeto "kioku-db".
3.  No Dashboard, copie a "Connection String" (algo como `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb`).
    *   **Importante**: Vamos usar essa string no Render.

---

## 2. Backend (Render)
O Render vai hospedar o Laravel usando o `Dockerfile` que criamos.

1.  Crie uma conta em [render.com](https://render.com).
2.  Clique em **New +** -> **Web Service**.
3.  Conecte seu repositório do GitHub (`kioku-app`).
4.  Configure:
    *   **Name**: `kioku-api`
    *   **Root Directory**: `backend` (Muito importante! O Dockerfile está lá).
    *   **Runtime**: `Docker`.
    *   **Instance Type**: `Free`.
5.  **Environment Variables** (Adicione estas variáveis):
    *   `APP_KEY`: Gere uma nova chave (rode `php artisan key:generate --show` no seu terminal local e copie).
    *   `APP_DEBUG`: `false`
    *   `APP_URL`: A URL que o Render gerar (ex: `https://kioku-api.onrender.com`).
    *   `DB_CONNECTION`: `pgsql`
    *   `DATABASE_URL`: Cole a Connection String do Neon aqui.
    *   `Review Model`: Adicione uma variável `JWT_SECRET` se estiver usando JWT, ou garanta que o `APP_KEY` seja usado.
6.  Clique em **Create Web Service**.
    *   O deploy vai demorar uns minutos. Acompanhe os logs.
    *   Se der sucesso, ele vai mostrar "Live".
7.  **Rodar Migrations**:
    *   No painel do Render, vá em "Shell" (ou Connect).
    *   Digite: `php artisan migrate --force` para criar as tabelas no Neon.

---

## 3. Frontend (Vercel)
A Vercel vai hospedar o React/Vite.

1.  Crie uma conta em [vercel.com](https://vercel.com).
2.  Clique em **Add New...** -> **Project**.
3.  Importe o repositório `kioku-app`.
4.  Configure:
    *   **Framework Preset**: Vite (deve detectar automático).
    *   **Root Directory**: `./` (padrão).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
    *   **Install Command**: `npm install`
5.  **Environment Variables**:
    *   `VITE_API_URL`: A URL do seu backend no Render (ex: `https://kioku-api.onrender.com/api`).
        *   **Atenção**: Não esqueça do `/api` no final se o seu axios estiver esperando isso, ou configure conforme seu `src/lib/api.ts`.
6.  Clique em **Deploy**.

---

## 4. Finalização
1.  Acesse a URL que a Vercel gerou (ex: `https://kioku-app.vercel.app`).
2.  Tente criar uma conta e fazer login.
3.  Se der erro de CORS, você precisa voltar no **Backend (Render)** e adicionar a URL da Vercel no `.env` ou `config/cors.php`:
    *   No Render, adicione a variável: `FRONTEND_URL` = `https://kioku-app.vercel.app`.
    *   (Certifique-se que o arquivo `config/cors.php` usa essa variável em `allowed_origins`).

**Pronto! Seu Kioku 2.0 está online.** 🚀
