# BranReadme

BranReadme is a web app for building GitHub profile README files with drag-and-drop sections, live preview, and template sharing.

<img width="1910" height="906" alt="image" src="https://github.com/user-attachments/assets/b57e6eff-1c88-420a-8fa1-00fd157053e2" />

## Features

Everything you need to ship fast.  
No code, no fuss. Drag sections, pick a theme, and export clean markdown in minutes.

### Core Features

- **Live Preview**  
  See every edit reflected instantly in a real GitHub-style markdown preview.

- **Drag & Drop**  
  Reorder sections, tech icons, and highlights with smooth drag-and-drop.

- **Theme Studio**  
  Tune colors, spacing, and stat cards without writing a single line of CSS.

- **Smart Sections**  
  Pre-built blocks for tech stacks, pinned repos, banners, and social links.

- **One-Click Export**  
  Copy clean markdown to your clipboard — paste into GitHub and you're live.

- **Polished Output**  
  Every export is formatted, valid, and ready to impress recruiters and peers.

### Templates & Sharing

- Build custom templates from your README layout  
- Share templates with the community  
- Discover and reuse public templates  
- Remix existing templates easily  

### Favorites System

- Save templates to favorites  
- Quickly access preferred layouts  
- Organize frequently used designs  
- Improve workflow efficiency  

## Tech Stack

- **Frontend:** React + Vite  
- **Styling:** Tailwind CSS  
- **Backend / Database:** Supabase  

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Start the app:

```bash
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor in Supabase.
3. Create the `templates`, `favorite`, `feedback`  table and policies in SQL Editor.
4. Copy your project URL + anon key into `.env`.

The Templates page reads public templates from Supabase and allows creating new public templates from your current builder snapshot.

## Contributing

Contributions are welcome!  
Feel free to submit issues, feature requests, or pull requests.

👉 Please read the full contribution guidelines here:  
[CONTRIBUTING.md](./CONTRIBUTING.md)

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run preview` - preview production build
