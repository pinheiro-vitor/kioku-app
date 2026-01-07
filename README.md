# Kioku (記憶) - Anime & Manga Tracker

Kioku ("Memory" in Japanese) is a modern, privacy-focused application for tracking your Anime and Manga progress. Built with a stunning UI and powerful cloud synchronization, it helps you keep your collection organized across all your devices.

![Kioku Banner](https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2670&auto=format&fit=crop)

## Features

- 📚 **Universal Library**: Track Anime, Manga, and Manhwa in one place.
- ☁️ **Cloud Sync**: Powered by **Supabase**, your data is safely stored in the cloud and accessible anywhere.
- 📅 **Interactive Calendar**: Manual weekly schedule to keep track of airing episodes.
- 📊 **Statistics**: Detailed insights into your watching habits, top genres, and time spent.
- 🎨 **Modern Design**: A beautiful, dark-themed UI built with Tailwind CSS and Shadcn/UI.
- 🔐 **Secure Auth**: Full authentication system with email/password support.

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend / Database**: Supabase (PostgreSQL + Auth)
- **State Management**: TanStack Query

## Getting Started

### Prerequisites
- Node.js installed
- A Supabase project (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pinheiro-vitor/kioku-app.git
   cd kioku-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

## License

This project is open source and available under the [MIT License](LICENSE).
