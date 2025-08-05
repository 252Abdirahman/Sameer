/**
 * Performance Monitor
 * Real-time performance monitoring for Core Web Vitals and other metrics
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      reportInterval: options.reportInterval || 30000, // 30 seconds
      enableConsoleLogging: options.enableConsoleLogging !== false,
      enableWebVitals: options.enableWebVitals !== false,
      enableResourceTiming: options.enableResourceTiming !== false,
      enableLongTasks: options.enableLongTasks !== false,
      thresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 800,
        ...options.thresholds
      },
      ...options
    };

    this.metrics = new Map();
    this.observers = [];
    this.isRunning = false;
    
    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.reportMetrics = this.reportMetrics.bind(this);
  }

  /**
   * Start monitoring performance
   */
  start() {
    if (this.isRunning) {
      console.warn('Performance monitor already running');
      return;
    }

    this.isRunning = true;
    
    if (this.options.enableConsoleLogging) {
      console.log('🚀 Performance monitoring started');
    }

    // Initialize Core Web Vitals monitoring
    if (this.options.enableWebVitals) {
      this.initWebVitals();
    }

    // Initialize resource timing monitoring
    if (this.options.enableResourceTiming) {
      this.initResourceTiming();
    }

    // Initialize long task monitoring
    if (this.options.enableLongTasks) {
      this.initLongTasks();
    }

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Set up periodic reporting
    if (this.options.reportInterval > 0) {
      this.reportTimer = setInterval(this.reportMetrics, this.options.reportInterval);
    }

    // Monitor navigation timing
    this.measureNavigationTiming();
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    this.observers = [];

    // Clear timers
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.options.enableConsoleLogging) {
      console.log('⏹️ Performance monitoring stopped');
    }
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  initWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          this.recordMetric('LCP', Math.round(lastEntry.startTime), {
            element: lastEntry.element?.tagName || 'unknown',
            url: lastEntry.url || '',
            size: lastEntry.size || 0
          });
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-input') {
            this.recordMetric('FID', Math.round(entry.processingStart - entry.startTime), {
              eventType: entry.entryType,
              target: entry.target?.tagName || 'unknown'
            });
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue &&
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.recordMetric('CLS', Math.round(clsValue * 1000) / 1000, {
                entries: sessionEntries.length,
                sources: sessionEntries.map(e => e.sources?.[0]?.node?.tagName || 'unknown')
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }
  }

  /**
   * Measure Time to First Byte
   */
  measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.recordMetric('TTFB', Math.round(ttfb));
    }
  }

  /**
   * Initialize resource timing monitoring
   */
  initResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.analyzeResourceEntry(entry);
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing monitoring not supported:', error);
    }
  }

  /**
   * Analyze resource timing entry
   */
  analyzeResourceEntry(entry) {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;
    const cached = entry.transferSize === 0 && entry.decodedBodySize > 0;

    // Track slow resources
    if (duration > 1000) { // Resources taking more than 1 second
      this.recordMetric('SLOW_RESOURCE', Math.round(duration), {
        name: entry.name,
        type: this.getResourceType(entry.name),
        size: size,
        cached: cached
      });
    }

    // Track large resources
    if (size > 1024 * 1024) { // Resources larger than 1MB
      this.recordMetric('LARGE_RESOURCE', size, {
        name: entry.name,
        type: this.getResourceType(entry.name),
        duration: Math.round(duration)
      });
    }
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    const extension = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    
    if (['js', 'mjs'].includes(extension)) return 'script';
    if (['css'].includes(extension)) return 'stylesheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    
    return 'other';
  }

  /**
   * Initialize long task monitoring
   */
  initLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('LONG_TASK', Math.round(entry.duration), {
            attribution: entry.attribution?.[0]?.name || 'unknown'
          });
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }
  }

  /**
   * Measure navigation timing
   */
  measureNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return;

        // Domain lookup time
        const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
        this.recordMetric('DNS_TIME', Math.round(dnsTime));

        // Connection time
        const connectTime = navigation.connectEnd - navigation.connectStart;
        this.recordMetric('CONNECT_TIME', Math.round(connectTime));

        // DOM Content Loaded
        const dcl = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        this.recordMetric('DOM_CONTENT_LOADED', Math.round(dcl));

        // Load event
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        this.recordMetric('LOAD_TIME', Math.round(loadTime));

        // DOM processing time
        const domProcessing = navigation.domContentLoadedEventStart - navigation.domLoading;
        this.recordMetric('DOM_PROCESSING', Math.round(domProcessing));

      }, 0);
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value, metadata = {}) {
    const timestamp = Date.now();
    const metric = {
      name,
      value,
      timestamp,
      metadata,
      rating: this.getRating(name, value)
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);

    if (this.options.enableConsoleLogging && this.shouldLogMetric(metric)) {
      this.logMetric(metric);
    }

    // Trigger custom event
    this.dispatchMetricEvent(metric);
  }

  /**
   * Get performance rating for a metric
   */
  getRating(name, value) {
    const thresholds = this.options.thresholds;
    
    switch (name) {
      case 'LCP':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'FID':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'CLS':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'TTFB':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      case 'LONG_TASK':
        return value <= 50 ? 'good' : value <= 100 ? 'needs-improvement' : 'poor';
      default:
        return 'neutral';
    }
  }

  /**
   * Check if metric should be logged
   */
  shouldLogMetric(metric) {
    // Always log Core Web Vitals
    if (['LCP', 'FID', 'CLS', 'TTFB'].includes(metric.name)) {
      return true;
    }

    // Log poor performing metrics
    if (metric.rating === 'poor') {
      return true;
    }

    return false;
  }

  /**
   * Log metric to console
   */
  logMetric(metric) {
    const emoji = this.getMetricEmoji(metric);
    const color = this.getMetricColor(metric.rating);
    
    console.log(
      `${emoji} %c${metric.name}: ${metric.value}${this.getMetricUnit(metric.name)} (${metric.rating})`,
      `color: ${color}; font-weight: bold`,
      metric.metadata
    );
  }

  /**
   * Get emoji for metric type
   */
  getMetricEmoji(metric) {
    const emojiMap = {
      'LCP': '🖼️',
      'FID': '⚡',
      'CLS': '📐',
      'TTFB': '🌐',
      'LONG_TASK': '⏱️',
      'SLOW_RESOURCE': '🐌',
      'LARGE_RESOURCE': '📦'
    };
    
    return emojiMap[metric.name] || '📊';
  }

  /**
   * Get color for rating
   */
  getMetricColor(rating) {
    const colorMap = {
      'good': '#0CCE6B',
      'needs-improvement': '#FFA400',
      'poor': '#FF4E42',
      'neutral': '#333'
    };
    
    return colorMap[rating] || '#333';
  }

  /**
   * Get unit for metric
   */
  getMetricUnit(name) {
    const unitMap = {
      'LCP': 'ms',
      'FID': 'ms',
      'CLS': '',
      'TTFB': 'ms',
      'LONG_TASK': 'ms',
      'DNS_TIME': 'ms',
      'CONNECT_TIME': 'ms',
      'DOM_CONTENT_LOADED': 'ms',
      'LOAD_TIME': 'ms',
      'DOM_PROCESSING': 'ms',
      'SLOW_RESOURCE': 'ms',
      'LARGE_RESOURCE': 'bytes'
    };
    
    return unitMap[name] || '';
  }

  /**
   * Dispatch custom metric event
   */
  dispatchMetricEvent(metric) {
    const event = new CustomEvent('performance-metric', {
      detail: metric
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.reportMetrics();
    }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metrics: {}
    };

    // Process each metric type
    this.metrics.forEach((entries, name) => {
      const latest = entries[entries.length - 1];
      const values = entries.map(e => e.value);
      
      report.metrics[name] = {
        current: latest?.value,
        rating: latest?.rating,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        count: entries.length,
        metadata: latest?.metadata
      };
    });

    return report;
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  /**
   * Report metrics (can be overridden for custom reporting)
   */
  reportMetrics() {
    const report = this.generateReport();
    
    if (this.options.enableConsoleLogging) {
      console.group('📊 Performance Report');
      console.table(report.metrics);
      console.groupEnd();
    }

    // Trigger custom event for external reporting
    const event = new CustomEvent('performance-report', {
      detail: report
    });
    
    document.dispatchEvent(event);

    return report;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics() {
    this.metrics.clear();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

// Global usage
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  
  // Auto-start with default options if data attribute is present
  if (document.documentElement.hasAttribute('data-performance-monitor')) {
    const monitor = new PerformanceMonitor();
    monitor.start();
    
    // Make globally accessible
    window.performanceMonitor = monitor;
  }
}