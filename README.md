# 🔍 Service Status Page

A modern, responsive service status monitoring page that tracks the availability and response times of multiple web services in real-time. Built with vanilla JavaScript as a lightweight static site optimized for Vercel deployment.

## ✨ Features

- **Multi-endpoint monitoring** with automatic failover
- **Multiple connection methods** (Direct CORS, Proxy fallback, Mixed approach)
- **Real-time monitoring** of multiple services with redundancy
- **Beautiful, responsive design** with modern UI
- **Color-coded status indicators** (🟢 Green = Up, 🟡 Yellow = Slow, 🔴 Red = Down)
- **Response time tracking** for performance monitoring
- **Auto-refresh functionality** with customizable intervals
- **Mobile-friendly interface** that works on all devices
- **Easy JSON configuration** with multiple URL fallbacks per service
- **Vercel optimized** - clean static site deployment
- **No database required** - runs entirely client-side
- **Advanced debugging** with individual service testing

## 🚀 Quick Start

### Option 1: Static Version (Vercel/Netlify)

1. **Open the static version**:
   - Simply open `index.html` in your browser
   - Or deploy to Vercel/Netlify by uploading the files

2. **For Vercel deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

### Option 2: Node.js Version

#### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

#### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

The status page now reads its configuration from <mcfile name="config.json" path="c:\Users\wahee\OneDrive\Documents\Code\Javascript\Status Page\config.json"></mcfile>. This makes it easy to modify services without touching the code:

```json
{
  "services": [
    {
      "name": "Your Service",
      "description": "Service description",
      "urls": [
        "https://your-service.com",
        "https://backup.your-service.com"
      ],
      "checkMethod": "mixed",
      "category": "Your Category"
    }
  ],
  "settings": {
    "refreshInterval": 30000,
    "timeout": 10000,
    "slowThreshold": 5000,
    "corsProxies": [
      "https://api.codetabs.com/v1/proxy?quest=",
      "https://thingproxy.freeboard.io/fetch/",
      "https://api.allorigins.win/get?url="
    ]
  }
}
```

### Service Configuration Options:
- **name**: Display name of the service
- **description**: Brief description shown on the card
- **urls**: Array of URLs to check (supports multiple fallback endpoints)
- **checkMethod**: Connection method (`direct`, `cors`, or `mixed`)
- **category**: Service category for organization

### Settings Configuration:
- **refreshInterval**: Auto-refresh interval in milliseconds (default: 30000)
- **timeout**: Request timeout in milliseconds (default: 10000)
- **slowThreshold**: Response time threshold for "slow" status (default: 5000)
- **corsProxies**: Array of CORS proxy URLs for fallback

## 🎨 Status Colors

- **🟢 Green (Operational)**: Response time < 5 seconds, HTTP status 2xx/3xx
- **🟡 Yellow (Slow)**: Response time ≥ 5 seconds, but service is reachable
- **🔴 Red (Down)**: Service unreachable, timeout, or HTTP error status

## 📁 Project Structure

```
status-page/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── static-script.js    # JavaScript functionality
├── config.json         # Service configuration
├── vercel.json         # Vercel deployment config
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. The `vercel.json` file is configured with:
   - CORS headers for API compatibility
   - Caching optimization
   - Static file serving

### Other Static Hosts
The status page works on any static hosting service:
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- Any web server serving static files

## 🛠️ Development

1. Clone the repository
2. Open `index.html` in your browser
3. Edit `config.json` to add/modify services
4. Customize styles in `styles.css` if needed

## 📊 Status Indicators

- 🟢 **Green (Up)**: Service is operational (response time < 5 seconds)
- 🟡 **Yellow (Slow)**: Service is slow (response time > 5 seconds)
- 🔴 **Red (Down)**: Service is unreachable or returned an error

## 🎨 Customization

### Colors
Edit the CSS variables in `styles.css` to customize the color scheme:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}
```

### Services
Modify the `config.json` file to monitor your own services - no code changes required!

## 🚀 Production Deployment

### Static Version (Recommended)

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
- Drag and drop the files to Netlify dashboard
- Or connect your Git repository

**GitHub Pages:**
- Push to GitHub repository
- Enable GitHub Pages in repository settings

## 🛠️ Customization

### Adding New Services
1. Edit `config.json`
2. Add your service to the `services` array
3. The server will automatically pick up changes on restart

### Styling
- Modify `public/styles.css` to change colors, fonts, or layout
- The current theme uses a purple gradient background with glassmorphism cards

### Monitoring Logic
- Edit `server.js` to modify how services are checked
- Current logic considers 2xx and 3xx status codes as "up"
- Response times > 5 seconds are marked as "slow"

## 📱 Mobile Support

The status page is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers

## 🔄 Auto-refresh

- Page automatically refreshes every 30 seconds (configurable)
- Manual refresh button available
- Pauses updates when page is not visible (performance optimization)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in server.js or set environment variable
2. **CORS errors**: The server includes CORS middleware for cross-origin requests
3. **Timeout errors**: Increase the timeout value in config.json
4. **SSL/HTTPS issues**: Some services may require specific SSL configurations

### Logs

The server logs all status checks to the console:
- ✅ Service up
- ❌ Service down
- ⚠️ Service slow

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this status page!

---

**Happy Monitoring!** 🎉