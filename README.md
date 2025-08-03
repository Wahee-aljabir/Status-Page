# 🔍 Service Status Page

A beautiful, real-time status page that monitors URLs and displays their operational status using a modern web interface with red, green, and yellow color indicators.

## ✨ Features

- **Real-time Monitoring**: Automatically checks service status every 30 seconds
- **Visual Status Indicators**: 
  - 🟢 **Green**: Service is operational (response time < 5s)
  - 🟡 **Yellow**: Service is slow (response time > 5s)
  - 🔴 **Red**: Service is down or unreachable
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient backgrounds with glassmorphism effects
- **Configurable**: Easy to add/remove services via JSON configuration
- **Auto-refresh**: Automatically updates status without page reload
- **Error Handling**: Displays detailed error messages for debugging

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

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

Edit the `config.json` file to customize which services to monitor:

```json
{
  "services": [
    {
      "name": "Your Service Name",
      "url": "https://your-service.com",
      "description": "Description of your service"
    }
  ],
  "checkInterval": 30000,
  "timeout": 10000
}
```

### Configuration Options

- **services**: Array of services to monitor
  - `name`: Display name for the service
  - `url`: URL to monitor
  - `description`: Optional description
- **checkInterval**: How often to check services (in milliseconds)
- **timeout**: Request timeout (in milliseconds)

## 🎨 Status Colors

- **🟢 Green (Operational)**: Response time < 5 seconds, HTTP status 2xx/3xx
- **🟡 Yellow (Slow)**: Response time ≥ 5 seconds, but service is reachable
- **🔴 Red (Down)**: Service unreachable, timeout, or HTTP error status

## 📁 Project Structure

```
status-page/
├── server.js          # Express server and monitoring logic
├── config.json        # Service configuration
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML page
│   ├── styles.css     # CSS styles with color themes
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## 🔧 API Endpoints

- `GET /` - Main status page
- `GET /api/status` - JSON API for current service status
- `GET /api/config` - JSON API for configuration

## 🚀 Production Deployment

For production use:

```bash
npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "status-page"
```

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