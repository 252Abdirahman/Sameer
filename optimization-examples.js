/**
 * Performance Optimization Examples
 * Practical implementations of common performance optimizations
 */

// ============================================
// 1. CODE SPLITTING EXAMPLES
// ============================================

/**
 * Route-based code splitting with React Router
 */
const RouteCodeSplitting = {
  // Basic lazy loading
  implementation: `
    import { lazy, Suspense } from 'react';
    import { Routes, Route } from 'react-router-dom';

    // Lazy load route components
    const Home = lazy(() => import('./pages/Home'));
    const Dashboard = lazy(() => import('./pages/Dashboard'));
    const Profile = lazy(() => import('./pages/Profile'));

    function App() {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      );
    }
  `,

  // Advanced lazy loading with loading states
  advancedImplementation: `
    import { lazy, Suspense } from 'react';
    
    const LoadingSpinner = () => (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );

    const ErrorBoundary = ({ children }) => {
      const [hasError, setHasError] = useState(false);
      
      if (hasError) {
        return <div>Something went wrong. Please try again.</div>;
      }
      
      return children;
    };

    // Preload components on hover
    const LazyComponent = lazy(() => {
      return Promise.all([
        import('./HeavyComponent'),
        new Promise(resolve => setTimeout(resolve, 300)) // Minimum loading time
      ]).then(([moduleExports]) => moduleExports);
    });

    function App() {
      const [preloaded, setPreloaded] = useState(new Set());

      const handleLinkHover = (componentName) => {
        if (!preloaded.has(componentName)) {
          import(\`./pages/\${componentName}\`);
          setPreloaded(prev => new Set(prev).add(componentName));
        }
      };

      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <nav>
              <Link 
                to="/dashboard" 
                onMouseEnter={() => handleLinkHover('Dashboard')}
              >
                Dashboard
              </Link>
            </nav>
            <Routes>
              <Route path="/dashboard" element={<LazyComponent />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      );
    }
  `
};

/**
 * Component-based code splitting
 */
const ComponentCodeSplitting = {
  // Modal lazy loading
  modal: `
    import { lazy, Suspense, useState } from 'react';

    const Modal = lazy(() => import('./Modal'));

    function App() {
      const [showModal, setShowModal] = useState(false);

      return (
        <div>
          <button onClick={() => setShowModal(true)}>
            Open Modal
          </button>
          
          {showModal && (
            <Suspense fallback={<div>Loading modal...</div>}>
              <Modal onClose={() => setShowModal(false)} />
            </Suspense>
          )}
        </div>
      );
    }
  `,

  // Chart library lazy loading
  chart: `
    import { lazy, Suspense } from 'react';

    const Chart = lazy(() => import('react-chartjs-2'));

    function Dashboard({ data }) {
      const [showChart, setShowChart] = useState(false);

      return (
        <div>
          <h1>Dashboard</h1>
          
          {!showChart ? (
            <button onClick={() => setShowChart(true)}>
              Show Chart
            </button>
          ) : (
            <Suspense fallback={<div>Loading chart...</div>}>
              <Chart data={data} />
            </Suspense>
          )}
        </div>
      );
    }
  `
};

// ============================================
// 2. MEMOIZATION EXAMPLES
// ============================================

/**
 * React memoization patterns
 */
const MemoizationExamples = {
  // Component memoization
  reactMemo: `
    import React, { memo } from 'react';

    // Expensive component that should only re-render when props change
    const ExpensiveComponent = memo(({ data, onAction }) => {
      console.log('ExpensiveComponent rendered');
      
      return (
        <div>
          {data.map(item => (
            <div key={item.id} onClick={() => onAction(item.id)}>
              {item.name}
            </div>
          ))}
        </div>
      );
    });

    // Custom comparison function
    const SmartComponent = memo(({ user, settings }) => {
      return <div>{user.name} - {settings.theme}</div>;
    }, (prevProps, nextProps) => {
      // Only re-render if user.name or settings.theme changed
      return prevProps.user.name === nextProps.user.name &&
             prevProps.settings.theme === nextProps.settings.theme;
    });
  `,

  // useMemo for expensive calculations
  useMemo: `
    import { useMemo, useState } from 'react';

    function ExpensiveCalculation({ items, filter }) {
      // Expensive filtering and sorting
      const processedItems = useMemo(() => {
        console.log('Processing items...');
        return items
          .filter(item => item.category === filter)
          .sort((a, b) => a.priority - b.priority)
          .map(item => ({
            ...item,
            displayName: \`\${item.name} (\${item.category})\`
          }));
      }, [items, filter]); // Only recalculate when items or filter change

      // Expensive derived state
      const statistics = useMemo(() => {
        return {
          total: processedItems.length,
          highPriority: processedItems.filter(item => item.priority > 5).length,
          avgPriority: processedItems.reduce((sum, item) => sum + item.priority, 0) / processedItems.length
        };
      }, [processedItems]);

      return (
        <div>
          <div>Total: {statistics.total}</div>
          <div>High Priority: {statistics.highPriority}</div>
          <div>Average Priority: {statistics.avgPriority.toFixed(2)}</div>
          
          {processedItems.map(item => (
            <div key={item.id}>{item.displayName}</div>
          ))}
        </div>
      );
    }
  `,

  // useCallback for stable function references
  useCallback: `
    import { useCallback, useState, memo } from 'react';

    const ChildComponent = memo(({ onAction, data }) => {
      console.log('ChildComponent rendered');
      return (
        <button onClick={() => onAction(data.id)}>
          {data.name}
        </button>
      );
    });

    function ParentComponent({ items }) {
      const [count, setCount] = useState(0);
      const [selectedItems, setSelectedItems] = useState([]);

      // Stable function reference prevents unnecessary re-renders
      const handleItemSelect = useCallback((itemId) => {
        setSelectedItems(prev => {
          if (prev.includes(itemId)) {
            return prev.filter(id => id !== itemId);
          }
          return [...prev, itemId];
        });
      }, []); // No dependencies since we use functional updates

      // Function with dependencies
      const handleItemAction = useCallback((itemId) => {
        console.log(\`Action on item \${itemId}, current count: \${count}\`);
        // Some action that depends on current count
      }, [count]); // Re-create when count changes

      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>
            Count: {count}
          </button>
          
          {items.map(item => (
            <ChildComponent
              key={item.id}
              data={item}
              onAction={handleItemSelect} // Stable reference
            />
          ))}
        </div>
      );
    }
  `
};

// ============================================
// 3. VIRTUALIZATION EXAMPLES
// ============================================

/**
 * List virtualization for large datasets
 */
const VirtualizationExamples = {
  // react-window implementation
  reactWindow: `
    import { FixedSizeList as List } from 'react-window';

    const Row = ({ index, style, data }) => (
      <div style={style} className="list-item">
        <div className="item-content">
          <h3>{data[index].name}</h3>
          <p>{data[index].description}</p>
          <span className="item-date">{data[index].date}</span>
        </div>
      </div>
    );

    function VirtualizedList({ items }) {
      return (
        <List
          height={600}        // Container height
          itemCount={items.length}
          itemSize={80}       // Height of each item
          itemData={items}    // Data passed to each row
          overscanCount={5}   // Render extra items for smooth scrolling
        >
          {Row}
        </List>
      );
    }
  `,

  // Variable size list
  variableSize: `
    import { VariableSizeList as List } from 'react-window';

    const getItemSize = (index, items) => {
      const item = items[index];
      // Calculate height based on content
      const baseHeight = 60;
      const extraHeight = item.description ? 40 : 0;
      const imageHeight = item.image ? 100 : 0;
      return baseHeight + extraHeight + imageHeight;
    };

    const VariableRow = ({ index, style, data }) => {
      const item = data.items[index];
      
      return (
        <div style={style} className="variable-item">
          <h3>{item.name}</h3>
          {item.description && <p>{item.description}</p>}
          {item.image && <img src={item.image} alt={item.name} />}
        </div>
      );
    };

    function VariableSizeVirtualList({ items }) {
      const itemData = { items };
      
      return (
        <List
          height={600}
          itemCount={items.length}
          itemSize={(index) => getItemSize(index, items)}
          itemData={itemData}
        >
          {VariableRow}
        </List>
      );
    }
  `,

  // Custom virtualization (without libraries)
  custom: `
    import { useState, useEffect, useRef } from 'react';

    function CustomVirtualList({ items, itemHeight = 50 }) {
      const [scrollTop, setScrollTop] = useState(0);
      const [containerHeight, setContainerHeight] = useState(400);
      const containerRef = useRef();

      // Calculate visible range
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length - 1
      );

      const visibleItems = items.slice(startIndex, endIndex + 1);
      const offsetY = startIndex * itemHeight;
      const totalHeight = items.length * itemHeight;

      useEffect(() => {
        const container = containerRef.current;
        if (container) {
          setContainerHeight(container.clientHeight);
        }
      }, []);

      const handleScroll = (e) => {
        setScrollTop(e.target.scrollTop);
      };

      return (
        <div
          ref={containerRef}
          style={{ height: 400, overflow: 'auto' }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: \`translateY(\${offsetY}px)\` }}>
              {visibleItems.map((item, index) => (
                <div
                  key={startIndex + index}
                  style={{ height: itemHeight }}
                  className="virtual-item"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  `
};

// ============================================
// 4. IMAGE OPTIMIZATION EXAMPLES
// ============================================

/**
 * Image loading and optimization strategies
 */
const ImageOptimization = {
  // Progressive image loading
  progressive: `
    import { useState, useRef, useEffect } from 'react';

    function ProgressiveImage({ src, placeholder, alt, className }) {
      const [imageSrc, setImageSrc] = useState(placeholder);
      const [isLoaded, setIsLoaded] = useState(false);
      const imageRef = useRef();

      useEffect(() => {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
        };
        img.src = src;
      }, [src]);

      return (
        <div className={\`progressive-image \${className}\`}>
          <img
            ref={imageRef}
            src={imageSrc}
            alt={alt}
            className={\`\${isLoaded ? 'loaded' : 'loading'}\`}
            style={{
              filter: isLoaded ? 'none' : 'blur(5px)',
              transition: 'filter 0.3s ease'
            }}
          />
        </div>
      );
    }
  `,

  // Responsive images with srcset
  responsive: `
    function ResponsiveImage({ basePath, alt, sizes }) {
      const generateSrcSet = () => {
        const breakpoints = [320, 640, 768, 1024, 1280, 1920];
        return breakpoints
          .map(width => \`\${basePath}-\${width}w.jpg \${width}w\`)
          .join(', ');
      };

      const generateSizes = () => {
        return sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
      };

      return (
        <picture>
          {/* WebP format for modern browsers */}
          <source
            srcSet={generateSrcSet().replace(/\.jpg/g, '.webp')}
            sizes={generateSizes()}
            type="image/webp"
          />
          
          {/* AVIF format for even better compression */}
          <source
            srcSet={generateSrcSet().replace(/\.jpg/g, '.avif')}
            sizes={generateSizes()}
            type="image/avif"
          />
          
          {/* Fallback JPEG */}
          <img
            srcSet={generateSrcSet()}
            sizes={generateSizes()}
            src={\`\${basePath}-640w.jpg\`}
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      );
    }
  `,

  // Intersection Observer for lazy loading
  lazyLoading: `
    import { useState, useRef, useEffect } from 'react';

    function LazyImage({ src, alt, placeholder, className }) {
      const [isIntersecting, setIsIntersecting] = useState(false);
      const [isLoaded, setIsLoaded] = useState(false);
      const imgRef = useRef();

      useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              observer.disconnect();
            }
          },
          { rootMargin: '50px' } // Start loading 50px before image enters viewport
        );

        if (imgRef.current) {
          observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
      }, []);

      const handleLoad = () => {
        setIsLoaded(true);
      };

      return (
        <div ref={imgRef} className={\`lazy-image \${className}\`}>
          {isIntersecting ? (
            <img
              src={src}
              alt={alt}
              onLoad={handleLoad}
              style={{
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            />
          ) : (
            <div className="placeholder" style={{ backgroundColor: '#f0f0f0' }}>
              {placeholder || 'Loading...'}
            </div>
          )}
        </div>
      );
    }
  `
};

// ============================================
// 5. DEBOUNCING AND THROTTLING
// ============================================

/**
 * Input optimization with debouncing and throttling
 */
const InputOptimization = {
  // Search input debouncing
  debounce: `
    import { useState, useEffect, useMemo } from 'react';

    function useDebounce(value, delay) {
      const [debouncedValue, setDebouncedValue] = useState(value);

      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);

        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]);

      return debouncedValue;
    }

    function SearchComponent({ onSearch }) {
      const [searchTerm, setSearchTerm] = useState('');
      const debouncedSearchTerm = useDebounce(searchTerm, 300);

      useEffect(() => {
        if (debouncedSearchTerm) {
          onSearch(debouncedSearchTerm);
        }
      }, [debouncedSearchTerm, onSearch]);

      return (
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      );
    }
  `,

  // Scroll event throttling
  throttle: `
    import { useEffect, useRef } from 'react';

    function useThrottle(callback, delay) {
      const lastRun = useRef(Date.now());

      return useRef((...args) => {
        if (Date.now() - lastRun.current >= delay) {
          callback(...args);
          lastRun.current = Date.now();
        }
      }).current;
    }

    function ScrollComponent() {
      const [scrollPosition, setScrollPosition] = useState(0);
      
      const handleScroll = useThrottle(() => {
        setScrollPosition(window.pageYOffset);
      }, 16); // ~60fps

      useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, [handleScroll]);

      return (
        <div className={\`scroll-indicator \${scrollPosition > 100 ? 'visible' : ''}\`}>
          Scroll position: {scrollPosition}
        </div>
      );
    }
  `,

  // Combined debounce and throttle hook
  combined: `
    function useDebounceThrottle(callback, delay, throttleDelay) {
      const lastThrottle = useRef(0);
      const timeoutRef = useRef();

      return useCallback((...args) => {
        const now = Date.now();
        
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Throttle: call immediately if enough time has passed
        if (now - lastThrottle.current >= throttleDelay) {
          callback(...args);
          lastThrottle.current = now;
        } else {
          // Debounce: delay the call
          timeoutRef.current = setTimeout(() => {
            callback(...args);
            lastThrottle.current = Date.now();
          }, delay);
        }
      }, [callback, delay, throttleDelay]);
    }
  `
};

// ============================================
// 6. WEB WORKERS FOR HEAVY COMPUTATIONS
// ============================================

/**
 * Web Workers for performance-intensive tasks
 */
const WebWorkerExamples = {
  // Main thread component
  mainThread: `
    import { useState, useRef, useEffect } from 'react';

    function HeavyComputationComponent() {
      const [result, setResult] = useState(null);
      const [isProcessing, setIsProcessing] = useState(false);
      const workerRef = useRef();

      useEffect(() => {
        // Create worker
        workerRef.current = new Worker('/workers/computation-worker.js');
        
        // Handle messages from worker
        workerRef.current.onmessage = (event) => {
          const { type, data, progress } = event.data;
          
          switch (type) {
            case 'progress':
              console.log(\`Progress: \${progress}%\`);
              break;
            case 'result':
              setResult(data);
              setIsProcessing(false);
              break;
            case 'error':
              console.error('Worker error:', data);
              setIsProcessing(false);
              break;
          }
        };

        return () => {
          workerRef.current.terminate();
        };
      }, []);

      const startComputation = (data) => {
        setIsProcessing(true);
        setResult(null);
        
        workerRef.current.postMessage({
          type: 'start',
          data: data
        });
      };

      return (
        <div>
          <button 
            onClick={() => startComputation(largeDataset)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Start Heavy Computation'}
          </button>
          
          {result && (
            <div>
              <h3>Results:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }
  `,

  // Worker script (computation-worker.js)
  workerScript: `
    // computation-worker.js
    self.onmessage = function(event) {
      const { type, data } = event.data;

      switch (type) {
        case 'start':
          performHeavyComputation(data);
          break;
      }
    };

    function performHeavyComputation(dataset) {
      try {
        const results = [];
        const total = dataset.length;

        for (let i = 0; i < total; i++) {
          // Simulate heavy computation
          const processed = complexAlgorithm(dataset[i]);
          results.push(processed);

          // Report progress every 100 items
          if (i % 100 === 0) {
            self.postMessage({
              type: 'progress',
              progress: Math.round((i / total) * 100)
            });
          }
        }

        // Send final results
        self.postMessage({
          type: 'result',
          data: {
            processedItems: results,
            summary: generateSummary(results)
          }
        });

      } catch (error) {
        self.postMessage({
          type: 'error',
          data: error.message
        });
      }
    }

    function complexAlgorithm(item) {
      // Simulate CPU-intensive operation
      let result = item.value;
      for (let i = 0; i < 10000; i++) {
        result = Math.sin(result) * Math.cos(result);
      }
      return {
        ...item,
        processed: result,
        timestamp: Date.now()
      };
    }

    function generateSummary(results) {
      return {
        total: results.length,
        average: results.reduce((sum, item) => sum + item.processed, 0) / results.length,
        max: Math.max(...results.map(item => item.processed)),
        min: Math.min(...results.map(item => item.processed))
      };
    }
  `
};

// ============================================
// 7. SERVICE WORKER CACHING
// ============================================

/**
 * Service Worker for performance optimization
 */
const ServiceWorkerExample = {
  // Service worker registration
  registration: `
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  `,

  // Service worker implementation (sw.js)
  implementation: `
    // sw.js
    const CACHE_NAME = 'app-cache-v1';
    const urlsToCache = [
      '/',
      '/static/js/bundle.js',
      '/static/css/main.css',
      '/manifest.json'
    ];

    // Install event
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.addAll(urlsToCache);
          })
      );
    });

    // Fetch event
    self.addEventListener('fetch', (event) => {
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            // Return cached version or fetch from network
            if (response) {
              return response;
            }

            return fetch(event.request).then((response) => {
              // Don't cache if not a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
          })
      );
    });

    // Activate event
    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
              }
            })
          );
        })
      );
    });
  `
};

// Export all examples
const PerformanceOptimizationExamples = {
  RouteCodeSplitting,
  ComponentCodeSplitting,
  MemoizationExamples,
  VirtualizationExamples,
  ImageOptimization,
  InputOptimization,
  WebWorkerExamples,
  ServiceWorkerExample
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizationExamples;
}

if (typeof window !== 'undefined') {
  window.PerformanceOptimizationExamples = PerformanceOptimizationExamples;
}