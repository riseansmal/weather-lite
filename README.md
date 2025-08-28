# 🌤️ Weather Lite

[![Github Followers](https://img.shields.io/github/followers/riseansmal?label=Follow%20riseansmal&style=social)](https://github.com/riseansmal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A modern, lightweight weather application built with Next.js 15, TypeScript, and Tailwind CSS. Weather Lite provides real-time weather updates with a beautiful, responsive interface and seamless user experience.

![Weather Lite - Modern Weather Application](https://via.placeholder.com/800x400/4a90e2/ffffff?text=Weather+Lite)

## ✨ Features

### Core Functionality
- **Real-time Weather Data**: Current conditions and 5-day forecast
- **Smart Location Detection**: 
  - Browser geolocation API (GPS) with reverse geocoding
  - IP-based location fallback
  - Default location configuration
  - Automatic city and country name resolution
- **City Search**: Global city search with autocomplete
- **Auto-refresh**: Configurable automatic data updates
- **Offline Support**: Graceful degradation with cached data
- **Network Status Detection**: Real-time online/offline awareness

### User Experience
- **Dark/Light Mode**: System-aware theme with manual toggle
- **Responsive Design**: Optimized for all screen sizes
- **Loading States**: Skeleton screens for smooth transitions
- **Error Handling**: User-friendly error messages
- **Performance**: In-memory LRU cache for API responses
- **Location Display**: Shows city and country names in the weather card
- **Visual Feedback**: Disabled states and loading indicators for all actions

## 🤖 AI-Assisted Development

This project was built using cutting-edge AI-assisted development tools and methodologies:

### **TaskMaster AI Orchestration**
- **Intelligent Project Management**: The entire development process was orchestrated using [TaskMaster AI](https://github.com/riseansmal/task-master-ai), which parsed a comprehensive Product Requirements Document (PRD) and automatically generated a structured task hierarchy
- **Task Breakdown**: 12 main tasks with 50+ subtasks were systematically generated and executed using AI-driven task analysis and complexity assessment
- **Progress Tracking**: Real-time task completion tracking with dependency management and automated status updates

### **AI-Powered Development Workflow**
- **Cursor Integration**: Built entirely within [Cursor](https://cursor.com/), leveraging Claude Sonnet 3.5 for intelligent code completion, debugging, and feature implementation
- **Iterative Refinement**: Each component was developed through AI-assisted iteration, ensuring code quality and best practices
- **Problem Solving**: Complex challenges like reverse geocoding, unified location systems, and responsive design were solved through AI-guided analysis and implementation

### **Intelligent Code Generation**
- **Architecture Design**: AI assistance in designing the component architecture, state management, and API integration patterns
- **Error Handling**: Comprehensive error handling and edge cases identified and implemented through AI analysis
- **Performance Optimization**: Bundle optimization, caching strategies, and performance improvements guided by AI recommendations

This approach demonstrates the power of combining human creativity with AI capabilities to rapidly build production-quality applications.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weather-lite.git
cd weather-lite
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

This project is ready for deployment on Vercel with minimal configuration:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard (copy from `.env.local`)
3. Deploy with automatic builds on each commit

The included `vercel.json` provides optimal configuration for the deployment.

## 🛠️ Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern UI components
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives

### State & Data
- **[Zod](https://zod.dev/)** - Runtime validation
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **LRU Cache** - Performance optimization

### APIs
- **[Open-Meteo](https://open-meteo.com/)** - Weather data only
- **[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)** - All geocoding (forward search & reverse lookup)
- **[IP-API](http://ip-api.com/)** - IP-based coordinate detection

### Development Tools & Workflow
- **[Cursor](https://cursor.com/)** - AI-powered code editor with integrated AI assistance
- **[TaskMaster AI](https://github.com/riseansmal/task-master-ai)** - Intelligent project management and task orchestration
- **[Claude Sonnet 3.5](https://anthropic.com/claude)** - Advanced AI model for code generation and problem-solving
- **[Git](https://git-scm.com/)** - Version control system
- **[npm](https://www.npmjs.com/)** - Package manager and build tooling
- **[ESLint](https://eslint.org/)** - Code linting and quality enforcement
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vercel](https://vercel.com/)** - Deployment platform (ready for deployment)

### Build & Development
- **[Turbopack](https://turbo.build/pack)** - Ultra-fast bundler for development
- **[Webpack 5](https://webpack.js.org/)** - Production bundling
- **[PostCSS](https://postcss.org/)** - CSS processing and optimization
- **[TypeScript Compiler](https://www.typescriptlang.org/)** - Type checking and compilation

## 📁 Project Structure

```
weather-lite/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── weather/       # Weather data proxy endpoint
│   ├── error.tsx          # Error boundary
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── weather/          # Weather-specific components
│       ├── current-weather.tsx
│       ├── forecast-card.tsx
│       ├── location-selector.tsx
│       ├── offline-indicator.tsx
│       ├── refresh-button.tsx
│       └── weather-display.tsx
├── lib/                   # Utility functions
│   ├── cache.ts          # LRU cache implementation
│   ├── constants.ts      # App constants
│   ├── env.ts           # Environment validation
│   ├── location.ts      # Location detection & reverse geocoding
│   ├── utils.ts         # Helper functions
│   ├── weather.ts       # Weather API integration
│   └── hooks/           # Custom React hooks
│       └── use-network-status.ts  # Network connectivity hook
└── public/              # Static assets
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Default Location
NEXT_PUBLIC_DEFAULT_CITY="San Francisco, California"
NEXT_PUBLIC_DEFAULT_LAT=37.7749
NEXT_PUBLIC_DEFAULT_LON=-122.4194

# Temperature Unit (celsius or fahrenheit)
NEXT_PUBLIC_TEMP_UNIT=celsius

# API Timeouts (milliseconds)
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_GEO_TIMEOUT=5000

# Cache Settings
NEXT_PUBLIC_CACHE_TTL=600000      # 10 minutes

# Refresh Settings
NEXT_PUBLIC_REFRESH_INTERVAL=600000  # 10 minutes

# Feature Flags
NEXT_PUBLIC_ENABLE_AUTO_REFRESH=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_CACHE=true
```

### Customization

#### Theme Configuration
The app uses CSS custom properties for theming. Edit `app/globals.css` to customize colors:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... other variables */
}
```

#### Weather Icons
Weather conditions are mapped to emoji icons in `lib/constants.ts`. Customize the `WEATHER_ICONS` object to use different icons.

## 🔌 API Integration

### Weather Data Endpoint

The app provides a proxy endpoint for weather data:

```
GET /api/weather?lat={latitude}&lon={longitude}&city={city}&country={country}
```

#### Query Parameters
- `lat` (required): Latitude
- `lon` (required): Longitude
- `city` (optional): City name for display
- `country` (optional): Country name for display
- `forceRefresh` (optional): Bypass cache

#### Response Format
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "country": "USA",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "current": {
      "temperature": 22,
      "apparentTemperature": 20,
      "weatherCode": 0,
      "humidity": 65,
      "windSpeed": 15,
      "windDirection": 180,
      "pressure": 1013,
      "uvIndex": 5,
      "visibility": 10000
    },
    "forecast": [
      {
        "date": "2024-01-15",
        "dayOfWeek": "Monday",
        "temperatureMax": 25,
        "temperatureMin": 18,
        "weatherCode": 1,
        "condition": "Mainly Clear",
        "icon": "☀️",
        "precipitationProbability": 10
      }
    ],
    "timestamp": 1704931200000,
    "source": "api"
  },
  "cached": false
}
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler
```

### Recent Improvements

- **Default Location Updated**: Changed default fallback location from Tbilisi, Georgia to San Francisco, California for improved user experience
- **Completely Unified Location System**: ALL location operations (GPS, IP, manual search, default) now use **exclusively** OpenStreetMap Nominatim for both forward geocoding (search) and reverse geocoding (coordinate → city/country names)
- **Enhanced Location Display**: All coordinates are automatically reverse geocoded to show standardized city and country names from the same authoritative source
- **Consistent Location Names**: No more discrepancies between different location detection methods - all use identical naming conventions
- **Conditional UI Rendering**: Location section only displays when location data is available
- **Network-Aware Features**: Refresh button is disabled when offline
- **Improved Error Handling**: Better fallback mechanisms for location detection with graceful degradation
- **Cache Management**: Added comprehensive cache clearing functionality with UI controls

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode

### Adding New Features

1. **Components**: Add to `components/weather/` for weather-specific components
2. **API Integration**: Extend `lib/weather.ts` for new weather data
3. **Styling**: Use Tailwind CSS utilities and shadcn/ui components
4. **State Management**: Use React hooks and context where needed

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### **APIs & Services**
- [Open-Meteo](https://open-meteo.com/) for providing free weather data
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for geocoding services
- [IP-API](http://ip-api.com/) for IP-based location detection

### **UI & Design**
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- Weather icons inspired by various emoji sets

### **Development Platform & AI**
- [Cursor](https://cursor.com/) for revolutionizing the development experience with AI
- [TaskMaster AI](https://github.com/riseansmal/task-master-ai) for intelligent project orchestration
- [Anthropic Claude](https://anthropic.com/claude) for advanced AI assistance
- [Vercel](https://vercel.com/) for Next.js framework and hosting platform

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🚧 Roadmap

- [ ] Add hourly forecast view
- [ ] Implement weather alerts and notifications
- [ ] Add weather map integration
- [ ] Support for multiple saved locations
- [ ] Progressive Web App (PWA) features
- [ ] Weather widgets for different platforms

---

**Weather Lite** - Simple, fast, and beautiful weather updates.