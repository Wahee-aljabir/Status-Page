class StaticStatusPage {
    constructor() {
        this.services = [];
        this.serviceStatuses = {};
        this.lastUpdate = null;
        this.refreshInterval = 30000;
        this.autoRefreshTimer = null;
        this.corsProxies = [];
        this.timeout = 10000;
        this.slowThreshold = 5000;
        
        this.loadConfig().then(() => {
            this.init();
        }).catch(error => {
            console.error('Failed to load configuration:', error);
            this.showError('Failed to load configuration. Please check config.json file.');
        });
    }
    
    async loadConfig() {
        try {
            const response = await fetch('./config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            
            this.services = config.services || [];
            
            if (config.settings) {
                this.refreshInterval = config.settings.refreshInterval || 30000;
                this.timeout = config.settings.timeout || 10000;
                this.slowThreshold = config.settings.slowThreshold || 5000;
                this.corsProxies = config.settings.corsProxies || [
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.allorigins.win/get?url='
                ];
            }
            
            console.log('Configuration loaded successfully:', {
                services: this.services.length,
                refreshInterval: this.refreshInterval,
                corsProxies: this.corsProxies.length
            });
        } catch (error) {
            console.error('Error loading config:', error);
            throw error;
        }
    }
    
    showError(message) {
        const grid = document.getElementById('servicesGrid');
        if (grid) {
            grid.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }
    
    async init() {
        this.initializeStatuses();
        await this.checkAllServices();
        this.setupEventListeners();
        this.startAutoRefresh();
    }
    
    initializeStatuses() {
        this.services.forEach(service => {
            this.serviceStatuses[service.name] = {
                status: 'unknown',
                responseTime: null,
                lastChecked: null,
                error: null
            };
        });
    }
    
    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        const testBtn = document.getElementById('testBtn');
        const refreshInterval = document.getElementById('refreshInterval');
        
        refreshBtn.addEventListener('click', () => {
            this.checkAllServices();
        });
        
        testBtn.addEventListener('click', () => {
            this.testIndividualServices();
        });
        
        refreshInterval.addEventListener('change', (e) => {
            this.updateRefreshInterval();
        });
        
        // Refresh when page becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkAllServices();
            }
        });
    }
    
    async checkServiceStatus(service) {
        const startTime = Date.now();
        const urls = service.urls || [service.url]; // Support both new and old format
        
        // Try each URL until one succeeds
        for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
            const currentUrl = urls[urlIndex];
            console.log(`🔍 Trying ${service.name} URL ${urlIndex + 1}/${urls.length}: ${currentUrl}`);
            
            // Try direct connection first for direct and mixed methods
            if (service.checkMethod === 'direct' || service.checkMethod === 'mixed') {
                try {
                    const response = await fetch(currentUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'User-Agent': 'StatusPage/1.0'
                        }
                    });
                    
                    const responseTime = Date.now() - startTime;
                    
                    if (response.ok) {
                        let status = 'up';
                        if (responseTime > this.slowThreshold) {
                            status = 'slow';
                        }
                        
                        this.serviceStatuses[service.name] = {
                            status: status,
                            responseTime: responseTime,
                            lastChecked: new Date().toISOString(),
                            error: null,
                            workingUrl: currentUrl
                        };
                        
                        console.log(`✅ ${service.name}: ${status} (${responseTime}ms) via ${currentUrl}`);
                        return;
                    }
                } catch (error) {
                    console.log(`⚠️ Direct connection failed for ${service.name} (${currentUrl}): ${error.message}`);
                    
                    // If this is a 'direct' only service and we've tried all URLs, mark as down
                    if (service.checkMethod === 'direct' && urlIndex === urls.length - 1) {
                        this.serviceStatuses[service.name] = {
                            status: 'down',
                            responseTime: null,
                            lastChecked: new Date().toISOString(),
                            error: `All direct connections failed. Last error: ${error.message}`
                        };
                        console.log(`❌ ${service.name}: down - All direct URLs failed`);
                        return;
                    }
                }
            }
            
            // Try CORS proxies for cors and mixed methods
            if (service.checkMethod === 'cors' || service.checkMethod === 'mixed') {
                const corsProxies = this.corsProxies.length > 0 ? this.corsProxies : [
                    'https://api.allorigins.win/get?url=',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://cors-anywhere.herokuapp.com/',
                    'https://thingproxy.freeboard.io/fetch/'
                ];
                
                for (let proxyIndex = 0; proxyIndex < corsProxies.length; proxyIndex++) {
                    try {
                        const proxyUrl = corsProxies[proxyIndex];
                        let requestUrl;
                        
                        if (proxyUrl.includes('allorigins')) {
                            requestUrl = proxyUrl + encodeURIComponent(currentUrl);
                        } else {
                            requestUrl = proxyUrl + currentUrl;
                        }
                        
                        console.log(`🔍 Trying ${service.name} with proxy ${proxyIndex + 1}/${corsProxies.length}`);
                        
                        const response = await fetch(requestUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const responseTime = Date.now() - startTime;
                        
                        if (response.ok) {
                            let isServiceUp = false;
                            
                            // Handle different proxy response formats
                            if (proxyUrl.includes('allorigins')) {
                                try {
                                    const data = await response.json();
                                    isServiceUp = data.status && data.status.http_code >= 200 && data.status.http_code < 400;
                                } catch {
                                    isServiceUp = true; // If we can't parse, assume it's working
                                }
                            } else {
                                isServiceUp = true;
                            }
                            
                            if (isServiceUp) {
                                let status = 'up';
                                if (responseTime > this.slowThreshold) {
                                    status = 'slow';
                                }
                                
                                this.serviceStatuses[service.name] = {
                                    status: status,
                                    responseTime: responseTime,
                                    lastChecked: new Date().toISOString(),
                                    error: null,
                                    workingUrl: currentUrl,
                                    usedProxy: proxyUrl
                                };
                                
                                console.log(`✅ ${service.name}: ${status} (${responseTime}ms) via proxy`);
                                return;
                            }
                        }
                        
                    } catch (error) {
                        console.log(`⚠️ Proxy ${proxyIndex + 1} failed for ${service.name}: ${error.message}`);
                    }
                }
            }
        }
        
        // If we get here, all methods failed
        this.serviceStatuses[service.name] = {
            status: 'down',
            responseTime: null,
            lastChecked: new Date().toISOString(),
            error: `All connection methods failed for all URLs`
        };
        
        console.log(`❌ ${service.name}: down - All methods and URLs failed`);
    }
    
    async checkAllServices() {
        console.log('🔍 Checking all services...');
        
        // Show loading state
        this.updateLoadingState();
        
        // Check services with a reasonable delay to avoid rate limiting
        for (let i = 0; i < this.services.length; i++) {
            await this.checkServiceStatus(this.services[i]);
            this.updateUI(); // Update UI after each service check
            
            // Add small delay between requests
            if (i < this.services.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        this.lastUpdate = new Date().toISOString();
        this.updateUI();
        console.log('✨ All services checked');
    }
    
    async testIndividualServices() {
        console.log('🧪 Testing individual services...');
        
        for (const service of this.services) {
            console.log(`\n--- Testing ${service.name} ---`);
            console.log(`URL: ${service.url}`);
            console.log(`Method: ${service.checkMethod}`);
            
            this.updateLoadingState();
            
            await this.checkServiceStatus(service);
            
            this.updateUI();
            
            // Wait a bit between tests to avoid overwhelming the browser
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n✅ Individual service testing completed!');
    }
    
    updateLoadingState() {
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = '<div class="loading">Checking services</div>';
    }
    
    updateUI() {
        this.updateOverview();
        this.renderServices();
        this.updateLastUpdateTime();
        this.updateRefreshInterval();
    }
    
    updateOverview() {
        const upCount = Object.values(this.serviceStatuses).filter(s => s.status === 'up').length;
        const slowCount = Object.values(this.serviceStatuses).filter(s => s.status === 'slow').length;
        const downCount = Object.values(this.serviceStatuses).filter(s => s.status === 'down').length;
        
        document.getElementById('upCount').textContent = upCount;
        document.getElementById('slowCount').textContent = slowCount;
        document.getElementById('downCount').textContent = downCount;
    }
    
    renderServices() {
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = '';
        
        this.services.forEach(service => {
            const serviceStatus = this.serviceStatuses[service.name];
            const card = this.createServiceCard(service, serviceStatus);
            grid.appendChild(card);
        });
    }
    
    createServiceCard(service, serviceStatus) {
        const card = document.createElement('div');
        card.className = `service-card ${serviceStatus.status || 'unknown'}`;
        
        const statusText = this.getStatusText(serviceStatus.status);
        const statusIcon = this.getStatusIcon(serviceStatus.status);
        const urls = service.urls || [service.url];
        const workingUrl = serviceStatus.workingUrl || urls[0];
        
        card.innerHTML = `
            <div class="service-header">
                <h3 class="service-name">${this.escapeHtml(service.name)}</h3>
                <div class="service-status ${serviceStatus.status || 'unknown'}">
                    <div class="status-dot ${serviceStatus.status || 'unknown'}"></div>
                    ${statusIcon} ${statusText}
                </div>
            </div>
            
            <p class="service-description">${this.escapeHtml(service.description || '')}</p>
            
            <a href="${workingUrl}" target="_blank" class="service-url" rel="noopener noreferrer">
                ${this.escapeHtml(workingUrl)}
            </a>
            ${urls.length > 1 ? `<div class="url-count">(${urls.length} endpoints)</div>` : ''}
            
            <div class="service-metrics">
                <div class="metric">
                    <div class="metric-value">
                        ${serviceStatus.responseTime ? `${serviceStatus.responseTime}ms` : 'N/A'}
                    </div>
                    <div class="metric-label">Response Time</div>
                </div>
                <div class="metric">
                    <div class="metric-value">
                        ${serviceStatus.lastChecked ? this.formatTime(serviceStatus.lastChecked) : 'Never'}
                    </div>
                    <div class="metric-label">Last Checked</div>
                </div>
            </div>
            
            ${serviceStatus.usedProxy ? `<div class="proxy-info">🔄 Via CORS Proxy</div>` : ''}
            
            ${serviceStatus.error ? `<div class="error-message">❌ ${this.escapeHtml(serviceStatus.error)}</div>` : ''}
        `;
        
        return card;
    }
    
    getStatusText(status) {
        const statusMap = {
            'up': 'Operational',
            'slow': 'Slow Response',
            'down': 'Down',
            'unknown': 'Checking...'
        };
        return statusMap[status] || 'Unknown';
    }
    
    getStatusIcon(status) {
        const iconMap = {
            'up': '✅',
            'slow': '⚠️',
            'down': '❌',
            'unknown': '🔄'
        };
        return iconMap[status] || '❓';
    }
    
    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate');
        if (this.lastUpdate) {
            const time = new Date(this.lastUpdate);
            element.textContent = `Last updated: ${time.toLocaleTimeString()}`;
        } else {
            element.textContent = 'Last updated: Never';
        }
    }
    
    updateRefreshInterval() {
        const intervalSeconds = Math.floor(this.refreshInterval / 1000);
        document.getElementById('refreshInterval').textContent = intervalSeconds;
    }
    
    startAutoRefresh() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
        
        this.autoRefreshTimer = setInterval(() => {
            if (!document.hidden) {
                this.checkAllServices();
            }
        }, this.refreshInterval);
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else {
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else {
                return date.toLocaleDateString();
            }
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the status page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StaticStatusPage();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing updates');
    } else {
        console.log('Page visible - resuming updates');
    }
});