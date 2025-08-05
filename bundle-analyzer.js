#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * Analyzes bundle configurations and provides size optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      bundler: null,
      buildSize: {},
      chunkAnalysis: {},
      optimizations: [],
      treeshaking: {},
      compression: {}
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    console.log('📦 Starting Bundle Analysis...\n');
    
    try {
      await this.detectBundler();
      await this.analyzeBuildOutput();
      await this.analyzeChunking();
      await this.checkTreeShaking();
      await this.checkCompression();
      await this.generateOptimizations();
      
      this.printReport();
      this.generateConfigs();
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
    }
  }

  /**
   * Detect bundler type and configuration
   */
  async detectBundler() {
    console.log('🔍 Detecting bundler...');
    
    const bundlers = [
      { name: 'webpack', config: 'webpack.config.js', alt: 'webpack.config.ts' },
      { name: 'vite', config: 'vite.config.js', alt: 'vite.config.ts' },
      { name: 'rollup', config: 'rollup.config.js', alt: 'rollup.config.ts' },
      { name: 'parcel', config: '.parcelrc', alt: 'parcel.config.js' },
      { name: 'esbuild', config: 'esbuild.config.js', alt: 'build.js' },
      { name: 'snowpack', config: 'snowpack.config.js', alt: 'snowpack.config.mjs' }
    ];

    for (const bundler of bundlers) {
      const configPath = path.join(this.projectRoot, bundler.config);
      const altConfigPath = path.join(this.projectRoot, bundler.alt);
      
      if (fs.existsSync(configPath) || fs.existsSync(altConfigPath)) {
        this.results.bundler = {
          name: bundler.name,
          configFile: fs.existsSync(configPath) ? bundler.config : bundler.alt,
          hasConfig: true
        };
        console.log(`✅ Detected: ${bundler.name}`);
        return;
      }
    }

    // Check package.json for bundler hints
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (scripts.build && scripts.build.includes('vite')) {
        this.results.bundler = { name: 'vite', hasConfig: false };
      } else if (scripts.build && scripts.build.includes('webpack')) {
        this.results.bundler = { name: 'webpack', hasConfig: false };
      } else if (deps['@parcel/core'] || deps.parcel) {
        this.results.bundler = { name: 'parcel', hasConfig: false };
      } else if (deps.rollup) {
        this.results.bundler = { name: 'rollup', hasConfig: false };
      } else {
        this.results.bundler = { name: 'unknown', hasConfig: false };
      }
    }

    console.log(`✅ Inferred bundler: ${this.results.bundler?.name || 'unknown'}`);
  }

  /**
   * Analyze build output size
   */
  async analyzeBuildOutput() {
    console.log('\n📊 Analyzing build output...');
    
    const buildDirs = ['dist', 'build', 'public', 'out', '.next'];
    const foundBuilds = buildDirs.filter(dir => 
      fs.existsSync(path.join(this.projectRoot, dir))
    );

    if (foundBuilds.length === 0) {
      console.log('⚠️  No build output found. Run your build command first.');
      return;
    }

    for (const buildDir of foundBuilds) {
      const buildPath = path.join(this.projectRoot, buildDir);
      const analysis = await this.analyzeBuildDirectory(buildPath);
      this.results.buildSize[buildDir] = analysis;
    }

    console.log('📊 Build analysis complete');
  }

  /**
   * Analyze a build directory
   */
  async analyzeBuildDirectory(dirPath) {
    const analysis = {
      totalSize: 0,
      fileCount: 0,
      jsFiles: [],
      cssFiles: [],
      assetFiles: [],
      largestFiles: []
    };

    const files = this.getAllFiles(dirPath);
    
    for (const file of files) {
      const stats = fs.statSync(file);
      const relativePath = path.relative(this.projectRoot, file);
      const ext = path.extname(file).toLowerCase();
      
      analysis.totalSize += stats.size;
      analysis.fileCount++;

      const fileInfo = {
        path: relativePath,
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100
      };

      if (['.js', '.mjs', '.jsx', '.ts', '.tsx'].includes(ext)) {
        analysis.jsFiles.push(fileInfo);
      } else if (['.css', '.scss', '.sass', '.less'].includes(ext)) {
        analysis.cssFiles.push(fileInfo);
      } else {
        analysis.assetFiles.push(fileInfo);
      }

      if (stats.size > 100000) { // Files > 100KB
        analysis.largestFiles.push(fileInfo);
      }
    }

    // Sort by size
    analysis.jsFiles.sort((a, b) => b.size - a.size);
    analysis.cssFiles.sort((a, b) => b.size - a.size);
    analysis.largestFiles.sort((a, b) => b.size - a.size);

    return analysis;
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dirPath) {
    const files = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze code splitting and chunking
   */
  async analyzeChunking() {
    console.log('\n🧩 Analyzing code splitting...');
    
    const analysis = {
      hasCodeSplitting: false,
      chunkFiles: [],
      vendorChunks: [],
      entryChunks: [],
      recommendations: []
    };

    // Look for chunk files in build output
    Object.values(this.results.buildSize).forEach(buildAnalysis => {
      buildAnalysis.jsFiles.forEach(file => {
        const filename = path.basename(file.path);
        
        // Common chunk patterns
        if (filename.includes('chunk') || filename.includes('vendor') || 
            filename.includes('common') || /\.[a-f0-9]{8,}\.js$/.test(filename)) {
          analysis.hasCodeSplitting = true;
          analysis.chunkFiles.push(file);
          
          if (filename.includes('vendor') || filename.includes('node_modules')) {
            analysis.vendorChunks.push(file);
          }
        }
      });
    });

    // Check for large entry files
    Object.values(this.results.buildSize).forEach(buildAnalysis => {
      buildAnalysis.jsFiles.forEach(file => {
        if (file.size > 500000 && !analysis.chunkFiles.find(c => c.path === file.path)) { // 500KB
          analysis.recommendations.push({
            type: 'code-splitting',
            file: file.path,
            size: file.sizeKB,
            message: 'Large entry file detected - consider code splitting'
          });
        }
      });
    });

    this.results.chunkAnalysis = analysis;
    
    console.log(`📊 Code splitting: ${analysis.hasCodeSplitting ? 'Yes' : 'No'}`);
    console.log(`📊 Chunk files found: ${analysis.chunkFiles.length}`);
  }

  /**
   * Check tree-shaking effectiveness
   */
  async checkTreeShaking() {
    console.log('\n🌳 Checking tree-shaking...');
    
    const analysis = {
      enabled: false,
      unusedExports: [],
      recommendations: []
    };

    // Check for tree-shaking indicators in config
    if (this.results.bundler?.configFile) {
      const configPath = path.join(this.projectRoot, this.results.bundler.configFile);
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check for tree-shaking related configs
        if (configContent.includes('sideEffects') || 
            configContent.includes('usedExports') ||
            configContent.includes('mode: "production"')) {
          analysis.enabled = true;
        }
      } catch (error) {
        console.log(`⚠️  Could not read config: ${error.message}`);
      }
    }

    // Check package.json for sideEffects
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.sideEffects !== undefined) {
        analysis.enabled = true;
      }
    }

    this.results.treeshaking = analysis;
    
    console.log(`📊 Tree-shaking: ${analysis.enabled ? 'Enabled' : 'Not detected'}`);
  }

  /**
   * Check compression configuration
   */
  async checkCompression() {
    console.log('\n🗜️  Checking compression...');
    
    const analysis = {
      gzip: false,
      brotli: false,
      minification: false,
      recommendations: []
    };

    // Check for compressed files in build output
    Object.values(this.results.buildSize).forEach(buildAnalysis => {
      const allFiles = [...buildAnalysis.jsFiles, ...buildAnalysis.cssFiles, ...buildAnalysis.assetFiles];
      
      allFiles.forEach(file => {
        if (file.path.endsWith('.gz')) {
          analysis.gzip = true;
        }
        if (file.path.endsWith('.br')) {
          analysis.brotli = true;
        }
      });
    });

    // Check for minification (heuristic: short variable names in JS files)
    Object.values(this.results.buildSize).forEach(buildAnalysis => {
      buildAnalysis.jsFiles.slice(0, 3).forEach(file => {
        try {
          const content = fs.readFileSync(path.join(this.projectRoot, file.path), 'utf8');
          // Simple heuristic: minified files usually have long lines and short variable names
          const avgLineLength = content.length / content.split('\n').length;
          if (avgLineLength > 500) {
            analysis.minification = true;
          }
        } catch (error) {
          // Ignore read errors
        }
      });
    });

    this.results.compression = analysis;
    
    console.log(`📊 Gzip compression: ${analysis.gzip ? 'Yes' : 'No'}`);
    console.log(`📊 Brotli compression: ${analysis.brotli ? 'Yes' : 'No'}`);
    console.log(`📊 Minification: ${analysis.minification ? 'Yes' : 'No'}`);
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizations() {
    console.log('\n💡 Generating optimizations...');
    
    const optimizations = [];

    // Bundle size optimizations
    Object.entries(this.results.buildSize).forEach(([buildDir, analysis]) => {
      if (analysis.totalSize > 5000000) { // 5MB
        optimizations.push({
          category: 'Bundle Size',
          priority: 'High',
          issue: `Large bundle size in ${buildDir}`,
          solution: 'Implement code splitting and lazy loading',
          size: Math.round(analysis.totalSize / 1024 / 1024 * 100) / 100 + 'MB'
        });
      }

      // Large JavaScript files
      analysis.jsFiles.slice(0, 3).forEach(file => {
        if (file.size > 1000000) { // 1MB
          optimizations.push({
            category: 'Code Splitting',
            priority: 'High',
            issue: `Large JavaScript file: ${file.path}`,
            solution: 'Split this file into smaller chunks',
            size: file.sizeKB + 'KB'
          });
        }
      });
    });

    // Tree-shaking recommendations
    if (!this.results.treeshaking.enabled) {
      optimizations.push({
        category: 'Tree Shaking',
        priority: 'Medium',
        issue: 'Tree-shaking not detected',
        solution: 'Enable tree-shaking to remove unused code'
      });
    }

    // Compression recommendations
    if (!this.results.compression.gzip) {
      optimizations.push({
        category: 'Compression',
        priority: 'Medium',
        issue: 'Gzip compression not enabled',
        solution: 'Enable gzip compression on your server'
      });
    }

    if (!this.results.compression.brotli) {
      optimizations.push({
        category: 'Compression',
        priority: 'Low',
        issue: 'Brotli compression not enabled',
        solution: 'Enable Brotli compression for better compression ratios'
      });
    }

    // Bundler-specific optimizations
    this.addBundlerSpecificOptimizations(optimizations);

    this.results.optimizations = optimizations;
  }

  /**
   * Add bundler-specific optimization recommendations
   */
  addBundlerSpecificOptimizations(optimizations) {
    switch (this.results.bundler?.name) {
      case 'webpack':
        optimizations.push({
          category: 'Webpack',
          priority: 'Medium',
          issue: 'Webpack optimizations',
          solution: 'Use SplitChunksPlugin, optimize chunks, enable production mode'
        });
        break;
        
      case 'vite':
        optimizations.push({
          category: 'Vite',
          priority: 'Low',
          issue: 'Vite optimizations',
          solution: 'Configure build.rollupOptions for better chunking'
        });
        break;
        
      case 'rollup':
        optimizations.push({
          category: 'Rollup',
          priority: 'Medium',
          issue: 'Rollup optimizations',
          solution: 'Use rollup-plugin-terser for minification, configure external dependencies'
        });
        break;
    }
  }

  /**
   * Print analysis report
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📦 BUNDLE ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n🔧 Bundler: ${this.results.bundler?.name || 'Unknown'}`);
    if (this.results.bundler?.configFile) {
      console.log(`📄 Config: ${this.results.bundler.configFile}`);
    }

    // Build size summary
    console.log('\n📊 Build Size Analysis:');
    Object.entries(this.results.buildSize).forEach(([buildDir, analysis]) => {
      const totalMB = Math.round(analysis.totalSize / 1024 / 1024 * 100) / 100;
      console.log(`\n   ${buildDir}/:`);
      console.log(`   • Total size: ${totalMB}MB (${analysis.fileCount} files)`);
      console.log(`   • JavaScript: ${analysis.jsFiles.length} files`);
      console.log(`   • CSS: ${analysis.cssFiles.length} files`);
      console.log(`   • Assets: ${analysis.assetFiles.length} files`);
      
      if (analysis.largestFiles.length > 0) {
        console.log(`   • Largest files:`);
        analysis.largestFiles.slice(0, 3).forEach(file => {
          console.log(`     - ${file.path} (${file.sizeKB}KB)`);
        });
      }
    });

    // Code splitting
    console.log(`\n🧩 Code Splitting:`);
    console.log(`   • Enabled: ${this.results.chunkAnalysis.hasCodeSplitting ? 'Yes' : 'No'}`);
    console.log(`   • Chunk files: ${this.results.chunkAnalysis.chunkFiles.length}`);
    console.log(`   • Vendor chunks: ${this.results.chunkAnalysis.vendorChunks.length}`);

    // Optimizations
    console.log(`\n💡 Optimizations: ${this.results.optimizations.length}`);
    this.results.optimizations.forEach((opt, index) => {
      console.log(`\n${index + 1}. [${opt.priority}] ${opt.category}: ${opt.issue}`);
      console.log(`   Solution: ${opt.solution}`);
      if (opt.size) {
        console.log(`   Size: ${opt.size}`);
      }
    });

    // Save detailed report
    this.saveReport();
  }

  /**
   * Save detailed report to file
   */
  saveReport() {
    const reportPath = path.join(this.projectRoot, 'bundle-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Generate optimized configurations
   */
  generateConfigs() {
    console.log('\n⚙️  Generating optimized configurations...');
    
    switch (this.results.bundler?.name) {
      case 'webpack':
        this.generateWebpackConfig();
        break;
      case 'vite':
        this.generateViteConfig();
        break;
      case 'rollup':
        this.generateRollupConfig();
        break;
    }
  }

  /**
   * Generate optimized Webpack configuration
   */
  generateWebpackConfig() {
    const config = `// webpack.config.optimized.js
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    usedExports: true,
    sideEffects: false,
  },
  
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
    
    // Uncomment to analyze bundle
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   openAnalyzer: false,
    // }),
  ],
  
  performance: {
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
    hints: 'warning',
  },
};`;

    fs.writeFileSync(path.join(this.projectRoot, 'webpack.config.optimized.js'), config);
    console.log('✅ Generated webpack.config.optimized.js');
  }

  /**
   * Generate optimized Vite configuration
   */
  generateViteConfig() {
    const config = `// vite.config.optimized.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Adjust based on your dependencies
          utils: ['lodash', 'date-fns'], // Utility libraries
        },
      },
    },
    
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  plugins: [
    // Bundle analyzer
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});`;

    fs.writeFileSync(path.join(this.projectRoot, 'vite.config.optimized.js'), config);
    console.log('✅ Generated vite.config.optimized.js');
  }

  /**
   * Generate optimized Rollup configuration
   */
  generateRollupConfig() {
    const config = `// rollup.config.optimized.js
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.js',
  
  output: [
    {
      dir: 'dist',
      format: 'es',
      chunkFileNames: '[name]-[hash].js',
      manualChunks: {
        vendor: ['react', 'react-dom'],
        utils: ['lodash'],
      },
    },
  ],
  
  plugins: [
    resolve(),
    commonjs(),
    
    // Minification
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }),
    
    // Bundle visualization
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  external: ['react', 'react-dom'], // Adjust based on your needs
};`;

    fs.writeFileSync(path.join(this.projectRoot, 'rollup.config.optimized.js'), config);
    console.log('✅ Generated rollup.config.optimized.js');
  }
}

// CLI Usage
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = BundleAnalyzer;