class StatusPage {
    constructor() {
        this.services = [];
        this.lastUpdate = null;
        this.refreshInterval = 30000;
        this.autoRefreshTimer = null;
        
        this.init();
    }
    
    async init() {
        await this.loadStatus();
        this.setupEventListeners();
        this.startAutoRefresh();
    }
    
    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => {
            this.loadStatus();
        });
        
        // Refresh when page becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadStatus();
            }
        });
    }
    
    async loadStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            this.services = data.services;
            this.lastUpdate = data.lastUpdate;
            this.refreshInterval = data.checkInterval;
            
            this.updateUI();
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error loading status:', error);
            this.showError('Failed to load service status');
        }
    }
    
    updateUI() {
        this.updateOverview();
        this.renderServices();
        this.updateRefreshInterval();
    }
    
    updateOverview() {
        const upCount = this.services.filter(s => s.status === 'up').length;
        const slowCount = this.services.filter(s => s.status === 'slow').length;
        const downCount = this.services.filter(s => s.status === 'down').length;
        
        document.getElementById('upCount').textContent = upCount;
        document.getElementById('slowCount').textContent = slowCount;
        document.getElementById('downCount').textContent = downCount;
    }
    
    renderServices() {
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = '';
        
        if (this.services.length === 0) {
            grid.innerHTML = '<div class="loading">Loading services</div>';
            return;
        }
        
        this.services.forEach(service => {
            const card = this.createServiceCard(service);
            grid.appendChild(card);
        });
    }
    
    createServiceCard(service) {
        const card = document.createElement('div');
        card.className = `service-card ${service.status || 'unknown'}`;
        
        const statusText = this.getStatusText(service.status);
        const statusIcon = this.getStatusIcon(service.status);
        
        card.innerHTML = `
            <div class="service-header">
                <h3 class="service-name">${this.escapeHtml(service.name)}</h3>
                <div class="service-status ${service.status || 'unknown'}">
                    <div class="status-dot ${service.status || 'unknown'}"></div>
                    ${statusIcon} ${statusText}
                </div>
            </div>
            
            <p class="service-description">${this.escapeHtml(service.description || '')}</p>
            
            <a href="${service.url}" target="_blank" class="service-url" rel="noopener noreferrer">
                ${this.escapeHtml(service.url)}
            </a>
            
            <div class="service-metrics">
                <div class="metric">
                    <div class="metric-value">
                        ${service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                    </div>
                    <div class="metric-label">Response Time</div>
                </div>
                <div class="metric">
                    <div class="metric-value">
                        ${service.lastChecked ? this.formatTime(service.lastChecked) : 'Never'}
                    </div>
                    <div class="metric-label">Last Checked</div>
                </div>
            </div>
            
            ${service.error ? `<div class="error-message">❌ ${this.escapeHtml(service.error)}</div>` : ''}
        `;
        
        return card;
    }
    
    getStatusText(status) {
        const statusMap = {
            'up': 'Operational',
            'slow': 'Slow Response',
            'down': 'Down',
            'unknown': 'Unknown'
        };
        return statusMap[status] || 'Unknown';
    }
    
    getStatusIcon(status) {
        const iconMap = {
            'up': '✅',
            'slow': '⚠️',
            'down': '❌',
            'unknown': '❓'
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
            this.loadStatus();
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
    
    showError(message) {
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                ❌ ${this.escapeHtml(message)}
                <br><br>
                <button onclick="location.reload()" class="refresh-btn">🔄 Retry</button>
            </div>
        `;
    }
}

// Initialize the status page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StatusPage();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing updates');
    } else {
        console.log('Page visible - resuming updates');
    }
});