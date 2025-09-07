# RSS Aggregator Frontend

A rich, magazine-style frontend for the RSS aggregation site built with React, Vite, and TailwindCSS.

## Features

- **Magazine-style layout** with visual hierarchy and responsive design
- **Publication branding** prominently displayed with logos
- **Article cards** with images, headlines, and excerpts
- **Reading progress indicators** for articles
- **Search functionality** across all articles
- **Read/unread tracking** with local storage
- **Save for later** functionality
- **Mobile-responsive design** with touch-friendly interface
- **Smooth animations** and hover effects

## Tech Stack

- **React 18** - Component-based UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons
- **date-fns** - Date formatting utilities

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ArticleCard.jsx     # Article display component
│   ├── Header.jsx          # Navigation header
│   ├── PublicationFilter.jsx  # Filter by publication
│   ├── LoadingSpinner.jsx  # Loading indicator
│   └── ReadingProgress.jsx # Reading progress bar
├── pages/              # Route components
│   ├── HomePage.jsx        # Main article feed
│   ├── ArticlePage.jsx     # Individual article view
│   ├── PublicationPage.jsx # Publication-specific articles
│   ├── SearchPage.jsx      # Search results
│   └── SavedArticles.jsx   # Saved articles list
├── utils/              # Utility functions
│   └── api.js             # API calls (mock data included)
├── App.jsx            # Main app component
└── main.jsx           # App entry point
```

## Design System

### Colors
- **Primary:** Slate gray tones for text and backgrounds
- **Accent:** Purple tones for interactive elements
- **Status:** Green for read articles, standard grays for unread

### Typography
- **Display font:** Playfair Display (serif) for headings
- **Body font:** Inter (sans-serif) for body text
- **Font weights:** 300, 400, 500, 600, 700

### Layout
- **Featured article:** Large card with prominent placement
- **Article grid:** Responsive masonry-style layout
- **Magazine layout:** Mix of card sizes for visual interest

## Key Components

### ArticleCard
Displays article information with:
- Publication branding and logo
- Article image with hover effects
- Title, excerpt, and metadata
- Save/bookmark functionality
- Read status indicator

### Header
Navigation component with:
- Logo and branding
- Search functionality
- Mobile-responsive menu
- Navigation links

### ReadingProgress
Visual progress indicator for article reading

## Features in Detail

### Article Management
- Save articles for later reading
- Track read/unread status
- Filter by publication
- Search across all content

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive grid layouts
- Collapsible navigation

### Performance
- Optimized images with proper sizing
- Lazy loading for better performance
- Efficient state management
- Fast development with Vite

## Mock Data

The app includes comprehensive mock data for development:
- 5 sample articles with rich content
- 3 publication profiles with branding
- Realistic metadata and timestamps
- High-quality placeholder images

## API Integration

The `api.js` utility provides:
- Article fetching with filtering
- Search functionality
- Publication management
- Mock delay simulation

Replace the mock functions with actual API calls when integrating with a backend.

## Customization

### Colors
Modify the color palette in `tailwind.config.js`:
```javascript
colors: {
  primary: { /* your primary colors */ },
  accent: { /* your accent colors */ }
}
```

### Fonts
Update font imports in `src/index.css` and the Tailwind config.

### Layout
Adjust grid layouts and component spacing in the respective component files.

## Development

- Hot module replacement for fast development
- ESLint integration for code quality
- PostCSS with TailwindCSS for styling
- Modern JavaScript/JSX syntax

## Production

- Optimized build output
- CSS purging for smaller bundle size
- Asset optimization
- Modern browser support
