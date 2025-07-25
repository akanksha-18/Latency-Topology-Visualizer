# Latency Topology Visualizer

A real-time network latency monitoring and visualization tool built with Next.js, TypeScript, Three.js, and Tailwind CSS. Monitor cryptocurrency exchange connections worldwide and visualize network performance on an interactive 3D globe with real-time latency topology mapping.

Hosted Link: latency-topology-visualizer-six.vercel.app

## 🚀 Features

### 📊 Real-Time Monitoring
- **Live Latency Tracking**: Monitor real-time network latency to cryptocurrency exchanges
- **Interactive Charts**: Responsive area charts with multiple time ranges (1h, 24h, 7d, 30d)
- **Network Quality Assessment**: Automatic quality classification (Excellent, Good, Fair, Poor, Very Poor)

### 🌐 3D Interactive Globe
- **3D Globe Visualization**: Interactive 3D globe powered by Three.js showing global exchange locations
- **Real-Time Network Topology**: Dynamic visualization of connections between exchanges worldwide
- **Geographic Mapping**: Accurate positioning of exchanges based on their physical locations
- **Interactive Navigation**: Zoom, rotate, and explore the globe with smooth animations
- **Cloud Provider Integration**: Visual representation of AWS, GCP, and Azure infrastructure

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile, tablet, and desktop viewing
- **Touch-Friendly**: Intuitive touch controls and navigation
- **Adaptive UI**: Dynamic layouts that adapt to screen size and orientation

### 🎯 Advanced Filtering
- **Exchange Search**: Search exchanges by name or location
- **Cloud Provider Filters**: Filter by AWS, GCP, or Azure
- **Real-Time Stats**: Live statistics and performance metrics

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Automatic theme detection and switching
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Professional Design**: Clean, modern interface with attention to detail

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics**: [Three.js](https://threejs.org/) for globe visualization
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/) for latency charts
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Custom React hooks for data management
- **Theme System**: Custom theme provider with dark/light mode support

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/latency-topology-visualizer.git
cd latency-topology-visualizer
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── ControlPanel.tsx       # Exchange filtering & controls
│   │   ├── Global3D.tsx           # Interactive 3D globe visualization
│   │   ├── LatencyChart.tsx       # Interactive latency charts
│   │   ├── LoadingScreen.tsx      # Loading screen component
│   │   ├── StatusPanel.tsx        # Status and metrics panel
│   │   └── ThemeProvider.tsx      # Theme management provider
│   ├── hooks/              # Custom React hooks
│   │   ├── useLatencyData.ts      # Latency data management
│   │   └── useTheme.ts            # Theme management hook
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared interfaces and types
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main application page
├── public/                 # Static assets
├── .gitignore             # Git ignore rules
├── eslint.config.mjs      # ESLint configuration
├── next-env.d.ts          # Next.js TypeScript declarations
├── next.config.ts         # Next.js configuration
├── package-lock.json      # NPM lock file
├── package.json           # Project dependencies
├── postcss.config.mjs     # PostCSS configuration
├── README.md              # Project documentation
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🎮 Usage

### Explore Interactive 3D Globe
1. **Global Visualization**: Navigate the interactive 3D globe to see exchange locations worldwide
2. **Geographic Context**: View exchanges positioned accurately on their real-world locations
3. **Network Connections**: Visualize latency connections as arcs between geographic points
4. **Zoom & Rotate**: Use mouse/touch controls to explore different regions of the globe
5. **Real-Time Updates**: Watch as connections update with live latency data

### Monitor Exchange Latency
1. **Select Exchange**: Choose an exchange from the control panel
2. **View Real-Time Data**: Watch live latency measurements update every 5 seconds
3. **Analyze Trends**: Switch between different time ranges to analyze performance

### Explore Network Topology
1. **3D Globe Navigation**: Rotate and zoom the interactive globe to explore global exchange locations
2. **Geographic Latency Mapping**: See how geographic distance affects network performance
3. **Filter Connections**: Use cloud provider filters to focus on specific infrastructure
4. **Inspect Details**: Click on exchange locations to view detailed information

### Customize View
1. **Theme Toggle**: Switch between light and dark modes
2. **Responsive Layout**: The interface adapts automatically to your screen size
3. **Advanced Filters**: Use search and filters to find specific exchanges

## 🌐 Supported Exchanges

The visualizer monitors latency to major cryptocurrency exchanges including:
- **Binance** - Global leading exchange
- **Coinbase** - US-based exchange
- **Kraken** - European exchange
- **Huobi** - Asian market leader
- **OKEx** - Derivatives platform
- **Bitfinex** - Professional trading
- **KuCoin** - Global exchange
- **Bybit** - Derivatives specialist
- **Gate.io** - Altcoin exchange

## 📊 Network Quality Metrics

| Quality Level | Latency Range | Color Indicator |
|---------------|---------------|-----------------|
| Excellent     | < 50ms        | 🟢 Green       |
| Good          | 50-100ms      | 🔵 Blue        |
| Fair          | 100-200ms     | 🟡 Yellow      |
| Poor          | 200-500ms     | 🟠 Orange      |
| Very Poor     | > 500ms       | 🔴 Red         |

## 🔧 Configuration



### Tailwind Customization
Modify `tailwind.config.js` to customize the design system:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      animation: {
        // Custom animations
      }
    }
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```


### Static Export
```bash
npm run build
npm run export
```

## 🔍 Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Use `npm run analyze` to inspect bundle size
- **Caching**: Efficient caching strategies for API responses

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write responsive, mobile-first code
- Test on multiple devices and browsers
- Maintain clean, readable code structure

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community** - For the amazing 3D graphics library
- **Vercel Team** - For Next.js and deployment platform
- **Tailwind Labs** - For the utility-first CSS framework
- **Recharts Team** - For the responsive charting library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/latency-topology-visualizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/latency-topology-visualizer/discussions)
- **Email**: your.email@example.com

---

Built with ❤️ using Next.js, TypeScript, Three.js, and Tailwind CSS
