# Kioku (記憶) - Rastreador de Anime & Mangá

Kioku ("Memória" em japonês) começou como uma solução pessoal para um problema comum: acompanhar inúmeros animes e mangás sem perder o fio da meada.

Insatisfeito com os designs poluídos dos aplicativos existentes no mercado, criei o Kioku para servir como uma biblioteca pessoal imaculada — um lugar para preservar a memória de cada história vivida. Hoje, ele é uma aplicação moderna focada em privacidade, com uma interface deslumbrante e sincronização em nuvem robusta, projetada para manter sua coleção organizada em todos os seus dispositivos.

![Kioku Banner](https://unsplash.com/photos/IxDPZ-AHfoI/download)

## Funcionalidades

- 📚 **Biblioteca Universal**: Acompanhe Anime, Mangá e Manhwa em um único lugar.
- ☁️ **Sincronização em Nuvem**: Com tecnologia **Supabase**, seus dados ficam salvos na nuvem e acessíveis de qualquer lugar.
- 📅 **Calendário Interativo**: Agenda semanal manual para controlar episódios em lançamento.
- 📊 **Estatísticas**: Insights detalhados sobre seus hábitos, gêneros favoritos e tempo gasto.
- 🎨 **Design Moderno**: Uma interface linda com tema escuro, construída com Tailwind CSS e Shadcn/UI.
- 🔐 **Autenticação Segura**: Sistema completo de login com e-mail/senha.

## Tecnologias

- **Frontend**: React + TypeScript (Vite)
- **Estilo**: Tailwind CSS + Shadcn/UI
- **Backend / Banco de Dados**: Supabase (PostgreSQL + Auth)
- **Gerenciamento de Estado**: TanStack Query

## Começando

### Pré-requisitos
- Node.js instalado
- Um projeto Supabase (para o backend)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/pinheiro-vitor/kioku-app.git
   cd kioku-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Ambiente:
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
   ```

4. Rode o app:
   ```bash
   npm run dev
   ```

## Licença

Este projeto é open source e está disponível sob a [Licença MIT](LICENSE).

![Library Shelf](https://unsplash.com/photos/ilZ_h1ftS2c/download)
