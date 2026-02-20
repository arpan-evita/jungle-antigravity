# Jungle Heritage Resort & Spa

> Where Luxury Meets Nature

Welcome to the official repository for the **Jungle Heritage Resort** website. This platform is designed to provide guests with a seamless booking experience and a window into the serene wilderness of Dudhwa.

## 🌿 Overview

This project is a high-performance web application built with modern technologies to deliver a premium user experience. It features dynamic room booking, curated experience listings, and a real-time reservation system.

## 🚀 Technology Stack

- **Frontend**: React (v18+) with TypeScript
- **Styling**: Tailwind CSS for a refined, responsive UI
- **Build Tool**: Vite for lightning-fast development
- **Components**: shadcn/ui for accessible, elegant design patterns
- **Backend**: Supabase (Database, Auth, and Edge Functions)
- **Deployment**: Vercel

## 📂 Project Structure

```text
/src
  /assets         - Brand assets and static images
  /components     - Reusable UI blocks and layout elements
  /hooks          - Custom React hooks for data fetching
  /integrations   - Supabase and third-party API configurations
  /pages          - Main application views and routes
/public           - Static assets (favicons, sitemaps, robots.txt)
/supabase         - Database migrations and Edge Functions
```

## 🛠️ Local Development

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arpan-evita/jungle-antigravity.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📄 License

Internal project for Jungle Heritage Resort. All rights reserved.
