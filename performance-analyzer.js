#!/usr/bin/env node

/**
 * Performance Analyzer Tool
 * Analyzes web applications for performance bottlenecks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      bundleAnalysis: {},
      dependencyAnalysis: {},
      codeAnalysis: {},
      recommendations: []
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    console.log('🔍 Starting Performance Analysis...\n');
    
    try {
      await this.detectProjectType();
      await this.analyzeDependencies();
      await this.analyzeCodePatterns();
      await this.analyzeBundleSize();
      await this.generateRecommendations();
      
      this.printReport();
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }

  /**
   * Detect project type (React, Vue, Angular, etc.)
   */
  async detectProjectType() {
    console.log('📋 Detecting project type...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.results.projectType = 'unknown';
      console.log('⚠️  No package.json found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (dependencies.react) {
      this.results.projectType = 'React';
    } else if (dependencies.vue || dependencies['@vue/cli-service']) {
      this.results.projectType = 'Vue';
    } else if (dependencies['@angular/core']) {
      this.results.projectType = 'Angular';
    } else if (dependencies.next) {
      this.results.projectType = 'Next.js';
    } else if (dependencies.svelte) {
      this.results.projectType = 'Svelte';
    } else {
      this.results.projectType = 'JavaScript';
    }

    console.log(`✅ Detected: ${this.results.projectType}`);
  }

  /**
   * Analyze dependencies for size and optimization opportunities
   */
  async analyzeDependencies() {
    console.log('\n📦 Analyzing dependencies...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('⚠️  No package.json found, skipping dependency analysis');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Check for heavy dependencies
    const heavyDependencies = [
      'lodash', 'moment', 'jquery', 'bootstrap', 'antd', 
      'material-ui', '@material-ui/core', 'rxjs'
    ];

    const foundHeavy = Object.keys(dependencies).filter(dep => 
      heavyDependencies.some(heavy => dep.includes(heavy))
    );

    this.results.dependencyAnalysis = {
      totalDependencies: Object.keys(dependencies).length,
      totalDevDependencies: Object.keys(devDependencies).length,
      heavyDependencies: foundHeavy,
      duplicateDependencies: this.findDuplicateDependencies(dependencies)
    };

    console.log(`📊 Production dependencies: ${this.results.dependencyAnalysis.totalDependencies}`);
    console.log(`📊 Dev dependencies: ${this.results.dependencyAnalysis.totalDevDependencies}`);
    
    if (foundHeavy.length > 0) {
      console.log(`⚠️  Heavy dependencies found: ${foundHeavy.join(', ')}`);
    }
  }

  /**
   * Find duplicate or similar dependencies
   */
  findDuplicateDependencies(dependencies) {
    const duplicates = [];
    const depNames = Object.keys(dependencies);
    
    // Check for common duplicates
    const duplicateGroups = [
      ['moment', 'dayjs', 'date-fns'],
      ['lodash', 'underscore', 'ramda'],
      ['axios', 'fetch', 'superagent'],
      ['uuid', 'shortid', 'nanoid']
    ];

    duplicateGroups.forEach(group => {
      const found = depNames.filter(dep => group.includes(dep));
      if (found.length > 1) {
        duplicates.push(found);
      }
    });

    return duplicates;
  }

  /**
   * Analyze code patterns for performance issues
   */
  async analyzeCodePatterns() {
    console.log('\n🔍 Analyzing code patterns...');
    
    const patterns = {
      largeFiles: [],
      inefficientPatterns: [],
      unusedImports: [],
      inlineStyles: 0,
      consoleStatements: 0
    };

    // Find JavaScript/TypeScript files
    const codeFiles = this.findFiles(['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']);
    
    for (const file of codeFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const stats = fs.statSync(file);
        
        // Check file size
        if (stats.size > 100000) { // 100KB
          patterns.largeFiles.push({
            file: path.relative(this.projectRoot, file),
            size: Math.round(stats.size / 1024) + 'KB'
          });
        }

        // Check for performance anti-patterns
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          // Inline styles
          if (line.includes('style={{') || line.includes('style="{')) {
            patterns.inlineStyles++;
          }
          
          // Console statements
          if (line.includes('console.')) {
            patterns.consoleStatements++;
          }
          
          // Inefficient patterns
          if (line.includes('document.querySelector') || line.includes('getElementById')) {
            patterns.inefficientPatterns.push({
              file: path.relative(this.projectRoot, file),
              line: index + 1,
              issue: 'DOM manipulation in component'
            });
          }
        });

      } catch (error) {
        console.log(`⚠️  Could not analyze ${file}: ${error.message}`);
      }
    }

    this.results.codeAnalysis = patterns;
    
    console.log(`📊 Code files analyzed: ${codeFiles.length}`);
    console.log(`📊 Large files (>100KB): ${patterns.largeFiles.length}`);
    console.log(`📊 Inline styles found: ${patterns.inlineStyles}`);
    console.log(`📊 Console statements: ${patterns.consoleStatements}`);
  }

  /**
   * Find files with specific extensions
   */
  findFiles(extensions, dir = this.projectRoot) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...this.findFiles(extensions, fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Analyze bundle size and suggest optimizations
   */
  async analyzeBundleSize() {
    console.log('\n📦 Analyzing bundle configuration...');
    
    const bundleConfig = {
      hasWebpack: fs.existsSync(path.join(this.projectRoot, 'webpack.config.js')),
      hasVite: fs.existsSync(path.join(this.projectRoot, 'vite.config.js')),
      hasRollup: fs.existsSync(path.join(this.projectRoot, 'rollup.config.js')),
      hasParcel: fs.existsSync(path.join(this.projectRoot, '.parcelrc')),
      buildScripts: this.getBuildScripts()
    };

    this.results.bundleAnalysis = bundleConfig;
    
    console.log('📊 Bundle tools found:');
    Object.entries(bundleConfig).forEach(([tool, exists]) => {
      if (typeof exists === 'boolean' && exists) {
        console.log(`  ✅ ${tool}`);
      }
    });
  }

  /**
   * Get build scripts from package.json
   */
  getBuildScripts() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return {};
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.scripts || {};
  }

  /**
   * Generate performance recommendations
   */
  async generateRecommendations() {
    console.log('\n💡 Generating recommendations...');
    
    const recommendations = [];

    // Bundle size recommendations
    if (this.results.dependencyAnalysis.heavyDependencies?.length > 0) {
      recommendations.push({
        category: 'Dependencies',
        priority: 'High',
        issue: 'Heavy dependencies detected',
        solution: 'Consider lighter alternatives or tree-shaking',
        dependencies: this.results.dependencyAnalysis.heavyDependencies
      });
    }

    // Code splitting recommendations
    if (this.results.codeAnalysis.largeFiles?.length > 0) {
      recommendations.push({
        category: 'Code Splitting',
        priority: 'High',
        issue: 'Large files detected',
        solution: 'Implement code splitting and lazy loading',
        files: this.results.codeAnalysis.largeFiles
      });
    }

    // Performance patterns
    if (this.results.codeAnalysis.inlineStyles > 10) {
      recommendations.push({
        category: 'Styling',
        priority: 'Medium',
        issue: 'Excessive inline styles',
        solution: 'Extract styles to CSS modules or styled components',
        count: this.results.codeAnalysis.inlineStyles
      });
    }

    // Production optimizations
    if (this.results.codeAnalysis.consoleStatements > 0) {
      recommendations.push({
        category: 'Production',
        priority: 'Medium',
        issue: 'Console statements in code',
        solution: 'Remove console statements in production builds',
        count: this.results.codeAnalysis.consoleStatements
      });
    }

    // Framework-specific recommendations
    this.addFrameworkSpecificRecommendations(recommendations);

    this.results.recommendations = recommendations;
  }

  /**
   * Add framework-specific recommendations
   */
  addFrameworkSpecificRecommendations(recommendations) {
    switch (this.results.projectType) {
      case 'React':
        recommendations.push({
          category: 'React Optimization',
          priority: 'Medium',
          issue: 'General React optimizations',
          solution: 'Implement React.memo, useMemo, useCallback for expensive operations'
        });
        break;
      
      case 'Vue':
        recommendations.push({
          category: 'Vue Optimization',
          priority: 'Medium',
          issue: 'General Vue optimizations',
          solution: 'Use v-memo, computed properties, and async components'
        });
        break;
        
      case 'Angular':
        recommendations.push({
          category: 'Angular Optimization',
          priority: 'Medium',
          issue: 'General Angular optimizations',
          solution: 'Implement OnPush change detection, lazy loading modules'
        });
        break;
    }
  }

  /**
   * Print analysis report
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n🏷️  Project Type: ${this.results.projectType}`);
    
    if (this.results.dependencyAnalysis.totalDependencies) {
      console.log(`\n📦 Dependencies:`);
      console.log(`   • Production: ${this.results.dependencyAnalysis.totalDependencies}`);
      console.log(`   • Development: ${this.results.dependencyAnalysis.totalDevDependencies}`);
      
      if (this.results.dependencyAnalysis.duplicateDependencies.length > 0) {
        console.log(`   • Potential duplicates: ${this.results.dependencyAnalysis.duplicateDependencies.map(d => d.join(', ')).join('; ')}`);
      }
    }

    console.log(`\n🔍 Code Analysis:`);
    console.log(`   • Large files: ${this.results.codeAnalysis.largeFiles?.length || 0}`);
    console.log(`   • Inline styles: ${this.results.codeAnalysis.inlineStyles || 0}`);
    console.log(`   • Console statements: ${this.results.codeAnalysis.consoleStatements || 0}`);

    console.log(`\n💡 Recommendations: ${this.results.recommendations.length}`);
    
    this.results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
      
      if (rec.dependencies) {
        console.log(`   Dependencies: ${rec.dependencies.join(', ')}`);
      }
      if (rec.files) {
        console.log(`   Files: ${rec.files.map(f => f.file).slice(0, 3).join(', ')}${rec.files.length > 3 ? '...' : ''}`);
      }
      if (rec.count) {
        console.log(`   Count: ${rec.count}`);
      }
    });

    // Save detailed report
    this.saveReport();
  }

  /**
   * Save detailed report to file
   */
  saveReport() {
    const reportPath = path.join(this.projectRoot, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// CLI Usage
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = PerformanceAnalyzer;