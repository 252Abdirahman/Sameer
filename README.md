# Performance Analysis & Optimization Toolkit

A comprehensive suite of tools for analyzing and optimizing web application performance, focusing on bundle size, load times, and runtime optimizations.

## 🚀 Quick Start

### Run Complete Analysis
```bash
# Run both performance and bundle analysis
node run-performance-analysis.js

# Run with HTML report output
node run-performance-analysis.js --html

# Run only performance analysis
node run-performance-analysis.js --performance-only

# Run only bundle analysis
node run-performance-analysis.js --bundle-only
```

### Individual Tool Usage
```bash
# Performance analysis
node performance-analyzer.js

# Bundle analysis
node bundle-analyzer.js
```

## 📊 What Gets Analyzed

### Performance Analysis
- **Project Type Detection**: React, Vue, Angular, Next.js, etc.
- **Dependency Analysis**: Heavy libraries, duplicates, unused packages
- **Code Patterns**: Large files, inline styles, console statements
- **Bundle Configuration**: Webpack, Vite, Rollup, Parcel detection
- **Framework-specific Recommendations**: Tailored optimization suggestions

### Bundle Analysis
- **Bundle Size**: Total size, file counts, largest files
- **Code Splitting**: Chunk detection and recommendations
- **Tree Shaking**: Configuration analysis
- **Compression**: Gzip/Brotli detection
- **Optimized Configurations**: Generated configs for Webpack, Vite, Rollup

## 🛠️ Tools Included

### 1. Performance Analyzer (`performance-analyzer.js`)
Comprehensive performance analysis including:
- Project type detection
- Dependency analysis and recommendations
- Code pattern analysis
- Bundle configuration detection
- Framework-specific optimization suggestions

### 2. Bundle Analyzer (`bundle-analyzer.js`)
Detailed bundle analysis featuring:
- Build output analysis
- Code splitting detection
- Tree-shaking verification
- Compression analysis
- Optimized configuration generation

### 3. Performance Monitor (`performance-monitor.js`)
Real-time performance monitoring for:
- Core Web Vitals (LCP, FID, CLS, TTFB)
- Resource timing analysis
- Long task detection
- Custom metric tracking

### 4. Optimization Examples (`optimization-examples.js`)
Practical code examples for:
- Code splitting strategies
- React memoization patterns
- List virtualization
- Image optimization
- Debouncing and throttling
- Web Workers
- Service Worker caching

### 5. Performance Checklist (`performance-optimization-checklist.md`)
Comprehensive guide covering:
- Bundle size optimization
- Load time improvements
- Runtime performance
- Framework-specific optimizations
- Performance monitoring setup

## 📁 Generated Files

After running the analysis, you'll get:

- `performance-report.json` - Detailed performance analysis data
- `bundle-analysis-report.json` - Bundle analysis results
- `performance-analysis-complete.json` - Combined results (with --json flag)
- `performance-analysis-report.html` - HTML report (with --html flag)
- `webpack.config.optimized.js` - Optimized Webpack config (if Webpack detected)
- `vite.config.optimized.js` - Optimized Vite config (if Vite detected)
- `rollup.config.optimized.js` - Optimized Rollup config (if Rollup detected)

## 🎯 Performance Scoring

The toolkit provides an overall performance score (0-100) based on:

- **Critical Issues** (-15 points each): Large bundles, missing compression, poor code splitting
- **Medium Issues** (-10 points each): Suboptimal configurations, heavy dependencies
- **Low Issues** (-5 points each): Minor optimizations, cleanup tasks

### Score Ranges
- **90-100**: 🟢 Excellent - Well optimized
- **75-89**: 🟡 Good - Minor improvements needed
- **50-74**: 🟠 Fair - Several optimizations required
- **0-49**: 🔴 Poor - Major optimization needed

## 💡 Common Optimization Recommendations

### Bundle Size Reduction
- Replace heavy libraries (moment.js → date-fns, lodash → native methods)
- Implement code splitting for routes and heavy components
- Enable tree-shaking in bundler configuration
- Remove unused dependencies

### Load Time Optimization
- Optimize images (WebP/AVIF formats, responsive images)
- Implement lazy loading for images and components
- Inline critical CSS
- Add resource hints (preload, prefetch, dns-prefetch)

### Runtime Performance
- Use React.memo, useMemo, useCallback for expensive operations
- Implement virtualization for large lists
- Debounce user input handlers
- Optimize state management to minimize re-renders

## 🔧 Framework-Specific Features

### React
- Component memoization analysis
- Hook optimization recommendations
- Bundle splitting suggestions
- Performance profiling tips

### Vue
- Computed property optimization
- Component lazy loading
- V-memo usage recommendations

### Angular
- OnPush change detection suggestions
- Lazy loading module recommendations
- Bundle budget configuration

## 📊 Real-time Monitoring

The performance monitor can be integrated into your application:

```html
<!-- Auto-start monitoring -->
<html data-performance-monitor>
```

```javascript
// Manual setup
const monitor = new PerformanceMonitor({
  reportInterval: 30000,
  enableConsoleLogging: true,
  enableWebVitals: true
});
monitor.start();

// Listen for metrics
document.addEventListener('performance-metric', (event) => {
  console.log('Metric recorded:', event.detail);
});
```

## 🚀 Usage Examples

### Basic Analysis
```bash
# Run complete analysis
node run-performance-analysis.js
```

### Advanced Usage
```bash
# Generate HTML report
node run-performance-analysis.js --html

# JSON output for CI/CD integration
node run-performance-analysis.js --json

# Performance analysis only
node run-performance-analysis.js --performance-only
```

### Integration with Build Process
```json
{
  "scripts": {
    "build": "vite build",
    "analyze": "npm run build && node run-performance-analysis.js --html",
    "perf-check": "node performance-analyzer.js"
  }
}
```

## 📈 Best Practices

1. **Run analysis regularly** during development
2. **Set performance budgets** for your team
3. **Monitor Core Web Vitals** in production
4. **Prioritize critical issues** for maximum impact
5. **Use generated configurations** as starting points
6. **Implement monitoring** for continuous insights

## 🔍 Troubleshooting

### No Build Output Found
- Run your build command first (npm run build)
- Check for dist/, build/, or out/ directories

### Analysis Not Detecting Framework
- Ensure package.json exists with proper dependencies
- Check that framework-specific files are present

### Bundle Analysis Issues
- Make sure you have a build output directory
- Verify bundler configuration files exist

## 📋 Requirements

- Node.js 14+ 
- Existing web application project
- Build output for bundle analysis (optional)

## 🤝 Contributing

This toolkit is designed to be extensible. You can:
- Add new analysis patterns
- Extend framework-specific recommendations
- Customize scoring algorithms
- Add new bundler support

---

*Start optimizing your web application performance today! Run the analysis and follow the prioritized recommendations for maximum impact.* 
