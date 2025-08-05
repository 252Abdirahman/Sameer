#!/usr/bin/env node

/**
 * Performance Analysis Runner
 * Orchestrates all performance analysis tools
 */

const PerformanceAnalyzer = require('./performance-analyzer');
const BundleAnalyzer = require('./bundle-analyzer');

class PerformanceAnalysisRunner {
  constructor(options = {}) {
    this.options = {
      runPerformanceAnalysis: options.runPerformanceAnalysis !== false,
      runBundleAnalysis: options.runBundleAnalysis !== false,
      generateReport: options.generateReport !== false,
      outputFormat: options.outputFormat || 'console', // 'console' | 'json' | 'html'
      ...options
    };
  }

  /**
   * Run complete performance analysis
   */
  async runComplete() {
    console.log('🚀 Starting Complete Performance Analysis...\n');

    const results = {
      timestamp: new Date().toISOString(),
      performance: null,
      bundle: null,
      summary: {}
    };

    try {
      // Run performance analysis
      if (this.options.runPerformanceAnalysis) {
        console.log('📊 Running Performance Analysis...');
        const performanceAnalyzer = new PerformanceAnalyzer();
        await performanceAnalyzer.analyze();
        results.performance = performanceAnalyzer.results;
      }

      // Run bundle analysis
      if (this.options.runBundleAnalysis) {
        console.log('\n📦 Running Bundle Analysis...');
        const bundleAnalyzer = new BundleAnalyzer();
        await bundleAnalyzer.analyze();
        results.bundle = bundleAnalyzer.results;
      }

      // Generate summary
      results.summary = this.generateSummary(results);

      // Output results
      if (this.options.generateReport) {
        this.outputResults(results);
      }

      return results;

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate analysis summary
   */
  generateSummary(results) {
    const summary = {
      totalIssues: 0,
      criticalIssues: 0,
      recommendations: [],
      score: 100
    };

    // Aggregate performance issues
    if (results.performance?.recommendations) {
      results.performance.recommendations.forEach(rec => {
        summary.totalIssues++;
        if (rec.priority === 'High') {
          summary.criticalIssues++;
          summary.score -= 15;
        } else if (rec.priority === 'Medium') {
          summary.score -= 10;
        } else {
          summary.score -= 5;
        }
        summary.recommendations.push({
          source: 'Performance',
          ...rec
        });
      });
    }

    // Aggregate bundle issues
    if (results.bundle?.optimizations) {
      results.bundle.optimizations.forEach(opt => {
        summary.totalIssues++;
        if (opt.priority === 'High') {
          summary.criticalIssues++;
          summary.score -= 15;
        } else if (opt.priority === 'Medium') {
          summary.score -= 10;
        } else {
          summary.score -= 5;
        }
        summary.recommendations.push({
          source: 'Bundle',
          ...opt
        });
      });
    }

    // Ensure score doesn't go below 0
    summary.score = Math.max(0, summary.score);

    return summary;
  }

  /**
   * Output results in specified format
   */
  outputResults(results) {
    switch (this.options.outputFormat) {
      case 'json':
        this.outputJSON(results);
        break;
      case 'html':
        this.outputHTML(results);
        break;
      default:
        this.outputConsole(results);
    }
  }

  /**
   * Output results to console
   */
  outputConsole(results) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PERFORMANCE ANALYSIS SUMMARY');
    console.log('='.repeat(80));

    const summary = results.summary;
    
    // Overall score
    console.log(`\n📊 Overall Performance Score: ${summary.score}/100`);
    this.printScoreBar(summary.score);

    // Issue summary
    console.log(`\n🔍 Issues Found:`);
    console.log(`   • Total Issues: ${summary.totalIssues}`);
    console.log(`   • Critical Issues: ${summary.criticalIssues}`);
    console.log(`   • Medium Issues: ${summary.totalIssues - summary.criticalIssues}`);

    // Top recommendations
    console.log(`\n💡 Top Recommendations:`);
    const topRecs = summary.recommendations
      .sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);

    topRecs.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category || rec.source}: ${rec.issue}`);
      console.log(`   💡 ${rec.solution}`);
    });

    // Next steps
    console.log(`\n🚀 Next Steps:`);
    console.log(`   1. Address critical issues first (${summary.criticalIssues} found)`);
    console.log(`   2. Check the performance checklist: performance-optimization-checklist.md`);
    console.log(`   3. Review optimization examples: optimization-examples.js`);
    console.log(`   4. Implement performance monitoring: performance-monitor.js`);

    // File locations
    console.log(`\n📁 Generated Files:`);
    console.log(`   • performance-report.json - Detailed performance analysis`);
    console.log(`   • bundle-analysis-report.json - Bundle analysis results`);
    console.log(`   • performance-optimization-checklist.md - Optimization guidelines`);
    console.log(`   • optimization-examples.js - Code examples`);
  }

  /**
   * Print score visualization bar
   */
  printScoreBar(score) {
    const barLength = 40;
    const filledLength = Math.round((score / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    let color = '🔴'; // Poor
    if (score >= 90) color = '🟢'; // Excellent
    else if (score >= 75) color = '🟡'; // Good
    else if (score >= 50) color = '🟠'; // Fair

    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    console.log(`${color} [${bar}] ${score}%`);
  }

  /**
   * Output results to JSON file
   */
  outputJSON(results) {
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(process.cwd(), 'performance-analysis-complete.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log(`\n📄 Complete analysis saved to: ${outputPath}`);
  }

  /**
   * Output results to HTML file
   */
  outputHTML(results) {
    const fs = require('fs');
    const path = require('path');
    
    const html = this.generateHTMLReport(results);
    const outputPath = path.join(process.cwd(), 'performance-analysis-report.html');
    fs.writeFileSync(outputPath, html);
    
    console.log(`\n📄 HTML report saved to: ${outputPath}`);
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(results) {
    const summary = results.summary;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .score { font-size: 3em; font-weight: bold; color: ${summary.score >= 90 ? '#28a745' : summary.score >= 75 ? '#ffc107' : summary.score >= 50 ? '#fd7e14' : '#dc3545'}; }
        .section { margin: 30px 0; padding: 20px; border-radius: 8px; background: #f8f9fa; }
        .issue { margin: 15px 0; padding: 15px; border-left: 4px solid #007bff; background: white; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Performance Analysis Report</h1>
        <div class="score">${summary.score}/100</div>
        <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
    </div>

    <div class="grid">
        <div class="card">
            <h3>📊 Summary</h3>
            <p><strong>Total Issues:</strong> ${summary.totalIssues}</p>
            <p><strong>Critical Issues:</strong> ${summary.criticalIssues}</p>
            <p><strong>Performance Score:</strong> ${summary.score}/100</p>
        </div>

        <div class="card">
            <h3>🔍 Analysis Types</h3>
            <p><strong>Performance Analysis:</strong> ${results.performance ? '✅ Complete' : '❌ Skipped'}</p>
            <p><strong>Bundle Analysis:</strong> ${results.bundle ? '✅ Complete' : '❌ Skipped'}</p>
        </div>
    </div>

    <div class="section">
        <h2>💡 Recommendations</h2>
        ${summary.recommendations.map(rec => `
            <div class="issue priority-${rec.priority.toLowerCase()}">
                <h4>[${rec.priority}] ${rec.category || rec.source}: ${rec.issue}</h4>
                <p><strong>Solution:</strong> ${rec.solution}</p>
                ${rec.dependencies ? `<p><strong>Dependencies:</strong> ${rec.dependencies.join(', ')}</p>` : ''}
                ${rec.size ? `<p><strong>Size:</strong> ${rec.size}</p>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📁 Resources</h2>
        <ul>
            <li><strong>performance-optimization-checklist.md</strong> - Complete optimization checklist</li>
            <li><strong>optimization-examples.js</strong> - Practical code examples</li>
            <li><strong>performance-monitor.js</strong> - Real-time monitoring tools</li>
            <li><strong>performance-report.json</strong> - Detailed performance data</li>
            <li><strong>bundle-analysis-report.json</strong> - Bundle analysis data</li>
        </ul>
    </div>
</body>
</html>`;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    if (arg === '--json') options.outputFormat = 'json';
    if (arg === '--html') options.outputFormat = 'html';
    if (arg === '--performance-only') options.runBundleAnalysis = false;
    if (arg === '--bundle-only') options.runPerformanceAnalysis = false;
    if (arg === '--no-report') options.generateReport = false;
  });

  const runner = new PerformanceAnalysisRunner(options);
  
  runner.runComplete()
    .then(() => {
      console.log('\n✅ Performance analysis complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = PerformanceAnalysisRunner;