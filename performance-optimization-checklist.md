# Performance Optimization Checklist

A comprehensive guide for optimizing web application performance, focusing on bundle size, load times, and runtime performance.

## 📋 Quick Assessment

Use this checklist to identify performance bottlenecks in your application:

### Bundle Size Analysis
- [ ] **Bundle size < 250KB** (gzipped initial bundle)
- [ ] **Code splitting implemented** for routes and heavy components
- [ ] **Tree-shaking enabled** and configured correctly
- [ ] **Vendor libraries separated** into chunks
- [ ] **Unused dependencies removed** from package.json
- [ ] **Heavy dependencies replaced** with lighter alternatives

### Load Time Optimization
- [ ] **Critical CSS inlined** for above-the-fold content
- [ ] **Font loading optimized** with font-display: swap
- [ ] **Images optimized** (WebP/AVIF formats, appropriate sizes)
- [ ] **Lazy loading implemented** for images and components
- [ ] **Resource hints used** (preload, prefetch, dns-prefetch)
- [ ] **Service Worker implemented** for caching

### Runtime Performance
- [ ] **React.memo/useMemo** used for expensive computations
- [ ] **Virtual scrolling** for large lists
- [ ] **Debouncing/throttling** for user input handlers
- [ ] **Web Workers** for heavy computations
- [ ] **Efficient state management** (minimal re-renders)
- [ ] **Optimized animations** (CSS transforms, 60fps)

---

## 🎯 Detailed Optimization Strategies

### 1. Bundle Size Optimization

#### Dependencies
- **Audit and remove unused packages**
  ```bash
  npx depcheck
  npm ls --depth=0
  ```

- **Replace heavy libraries with lighter alternatives**
  | Heavy Library | Lighter Alternative | Size Savings |
  |---------------|---------------------|--------------|
  | Moment.js (67KB) | date-fns (13KB) | 80% |
  | Lodash (71KB) | Native methods/Ramda (15KB) | 79% |
  | jQuery (85KB) | Native DOM APIs | 100% |
  | Bootstrap (158KB) | Tailwind CSS (3KB) | 98% |

- **Use tree-shaking friendly imports**
  ```javascript
  // ❌ Bad - imports entire library
  import _ from 'lodash';
  import { Button } from '@material-ui/core';

  // ✅ Good - imports only needed functions
  import debounce from 'lodash/debounce';
  import Button from '@material-ui/core/Button';
  ```

#### Code Splitting
- **Route-based splitting**
  ```javascript
  // React Router with lazy loading
  const Home = lazy(() => import('./components/Home'));
  const About = lazy(() => import('./components/About'));

  function App() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    );
  }
  ```

- **Component-based splitting**
  ```javascript
  // Heavy components
  const Chart = lazy(() => import('./Chart'));
  const DataTable = lazy(() => import('./DataTable'));
  ```

- **Vendor splitting configuration**
  ```javascript
  // Webpack
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  }
  ```

### 2. Load Time Optimization

#### Critical Resource Optimization
- **Inline critical CSS** (above-the-fold styles)
  ```html
  <style>
    /* Critical CSS for header, hero section */
    .header { /* styles */ }
    .hero { /* styles */ }
  </style>
  ```

- **Optimize font loading**
  ```html
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- Use font-display: swap -->
  <style>
    @font-face {
      font-family: 'MainFont';
      src: url('/fonts/main.woff2') format('woff2');
      font-display: swap;
    }
  </style>
  ```

#### Image Optimization
- **Use modern image formats**
  ```html
  <picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Description" loading="lazy">
  </picture>
  ```

- **Implement responsive images**
  ```html
  <img 
    srcset="image-320.jpg 320w, image-640.jpg 640w, image-1024.jpg 1024w"
    sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1024px"
    src="image-640.jpg" 
    alt="Description"
    loading="lazy"
  >
  ```

#### Resource Hints
```html
<!-- DNS prefetch for external domains -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//api.example.com">

<!-- Preload critical resources -->
<link rel="preload" href="/app.js" as="script">
<link rel="preload" href="/styles.css" as="style">

<!-- Prefetch likely next pages -->
<link rel="prefetch" href="/about">
<link rel="prefetch" href="/contact">
```

### 3. Runtime Performance

#### React Optimization
- **Memoization strategies**
  ```javascript
  // Component memoization
  const ExpensiveComponent = React.memo(({ data }) => {
    return <div>{/* expensive rendering */}</div>;
  });

  // Hook memoization
  const Component = ({ items, filter }) => {
    const filteredItems = useMemo(() => 
      items.filter(item => item.category === filter),
      [items, filter]
    );

    const handleClick = useCallback((id) => {
      // handle click
    }, []);

    return <div>{/* render */}</div>;
  };
  ```

- **Virtualization for large lists**
  ```javascript
  import { FixedSizeList as List } from 'react-window';

  const VirtualizedList = ({ items }) => (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {({ index, style, data }) => (
        <div style={style}>
          {data[index].name}
        </div>
      )}
    </List>
  );
  ```

#### State Management
- **Minimize re-renders**
  ```javascript
  // ❌ Bad - causes unnecessary re-renders
  const [state, setState] = useState({ count: 0, name: 'John' });
  
  // ✅ Good - separate concerns
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  ```

- **Use state managers efficiently**
  ```javascript
  // Redux Toolkit with selective subscriptions
  const count = useSelector(state => state.counter.value);
  const name = useSelector(state => state.user.name);
  
  // Zustand with shallow comparison
  const { count, increment } = useStore(
    state => ({ count: state.count, increment: state.increment }),
    shallow
  );
  ```

#### Event Handling
- **Debounce user inputs**
  ```javascript
  const debouncedSearch = useMemo(
    () => debounce(searchFunction, 300),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);
  ```

- **Throttle scroll/resize handlers**
  ```javascript
  const throttledScroll = useMemo(
    () => throttle(handleScroll, 16), // ~60fps
    []
  );
  ```

### 4. Advanced Optimizations

#### Service Workers
```javascript
// Basic caching strategy
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          const responseClone = fetchResponse.clone();
          caches.open('images').then(cache => {
            cache.put(event.request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
  }
});
```

#### Web Workers for Heavy Computations
```javascript
// main.js
const worker = new Worker('/worker.js');
worker.postMessage({ data: largeDataSet, operation: 'process' });
worker.onmessage = (event) => {
  const processedData = event.data;
  // Update UI with processed data
};

// worker.js
self.onmessage = (event) => {
  const { data, operation } = event.data;
  
  if (operation === 'process') {
    const result = heavyComputation(data);
    self.postMessage(result);
  }
};
```

#### CSS Performance
- **Optimize CSS delivery**
  ```html
  <!-- Critical CSS inline -->
  <style>/* critical styles */</style>
  
  <!-- Non-critical CSS loaded asynchronously -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  ```

- **Use efficient selectors**
  ```css
  /* ❌ Bad - complex selectors */
  .header .nav ul li a:hover { }
  
  /* ✅ Good - simple, specific selectors */
  .nav-link:hover { }
  ```

---

## 🔧 Framework-Specific Optimizations

### React
- Use `React.StrictMode` in development
- Implement error boundaries
- Use `React.Profiler` to identify bottlenecks
- Consider React Server Components for SSR

### Vue
- Use `v-memo` for expensive list items
- Implement `v-once` for static content
- Use async components for code splitting
- Optimize computed properties

### Angular
- Use OnPush change detection strategy
- Implement lazy loading for modules
- Use TrackBy functions in *ngFor
- Optimize with Angular CLI bundle budgets

---

## 📊 Performance Monitoring

### Core Web Vitals
- **Largest Contentful Paint (LCP)** < 2.5s
- **First Input Delay (FID)** < 100ms
- **Cumulative Layout Shift (CLS)** < 0.1

### Tools for Measurement
- **Lighthouse** - Overall performance audit
- **Chrome DevTools** - Real-time performance analysis
- **WebPageTest** - Network performance testing
- **Bundle analyzers** - Bundle size analysis
- **Real User Monitoring (RUM)** - Production performance data

### Performance Budget
```json
{
  "budget": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "5kb"
    },
    {
      "type": "bundle",
      "name": "vendor",
      "maximumWarning": "200kb"
    }
  ]
}
```

---

## 🚀 Implementation Priority

### High Priority (Immediate Impact)
1. **Bundle analysis and code splitting**
2. **Image optimization and lazy loading**
3. **Remove unused dependencies**
4. **Enable compression (gzip/brotli)**

### Medium Priority (Moderate Impact)
1. **Implement service worker caching**
2. **Optimize critical rendering path**
3. **Add resource hints**
4. **Optimize state management**

### Low Priority (Fine-tuning)
1. **Advanced caching strategies**
2. **Web Workers for heavy tasks**
3. **Progressive enhancement**
4. **Advanced bundle splitting**

---

## 📈 Performance Metrics Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| First Contentful Paint | < 1.8s | 1.8s - 3s | > 3s |
| Largest Contentful Paint | < 2.5s | 2.5s - 4s | > 4s |
| First Input Delay | < 100ms | 100ms - 300ms | > 300ms |
| Cumulative Layout Shift | < 0.1 | 0.1 - 0.25 | > 0.25 |
| Time to Interactive | < 3.8s | 3.9s - 7.3s | > 7.3s |
| Total Blocking Time | < 200ms | 200ms - 600ms | > 600ms |

---

*Use the provided `performance-analyzer.js` and `bundle-analyzer.js` scripts to automatically detect and analyze performance bottlenecks in your application.*