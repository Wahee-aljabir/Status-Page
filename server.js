const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load configuration
let config;
try {
  const configData = fs.readFileSync('config.json', 'utf8');
  config = JSON.parse(configData);
} catch (error) {
  console.error('Error loading config.json:', error.message);
  process.exit(1);
}

// Store service statuses
let serviceStatuses = {};

// Initialize service statuses
config.services.forEach(service => {
  serviceStatuses[service.name] = {
    status: 'unknown',
    responseTime: null,
    lastChecked: null,
    error: null
  };
});

// Function to check service status
async function checkServiceStatus(service) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(service.url, {
      timeout: config.timeout || 10000,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    let status = 'up';
    if (responseTime > 5000) {
      status = 'slow';
    }
    
    serviceStatuses[service.name] = {
      status: status,
      responseTime: responseTime,
      lastChecked: new Date().toISOString(),
      error: null
    };
    
    console.log(`✅ ${service.name}: ${status} (${responseTime}ms)`);
  } catch (error) {
    serviceStatuses[service.name] = {
      status: 'down',
      responseTime: null,
      lastChecked: new Date().toISOString(),
      error: error.message
    };
    
    console.log(`❌ ${service.name}: down - ${error.message}`);
  }
}

// Function to check all services
async function checkAllServices() {
  console.log('🔍 Checking all services...');
  const promises = config.services.map(service => checkServiceStatus(service));
  await Promise.all(promises);
  console.log('✨ All services checked');
}

// API Routes
app.get('/api/status', (req, res) => {
  const response = {
    services: config.services.map(service => ({
      ...service,
      ...serviceStatuses[service.name]
    })),
    lastUpdate: new Date().toISOString(),
    checkInterval: config.checkInterval
  };
  
  res.json(response);
});

app.get('/api/config', (req, res) => {
  res.json(config);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Status page server running on http://localhost:${PORT}`);
  
  // Initial check
  checkAllServices();
  
  // Set up periodic checks
  setInterval(checkAllServices, config.checkInterval || 30000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});