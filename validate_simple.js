#!/usr/bin/env node
/**
 * ArkTS 文件简化验证工具
 * 仅显示：哪些文件有问题 + 通过率统计
 * 
 * 用法：
 *   node validate_simple.js [目录路径]                  # 默认生成报告
 *   node validate_simple.js [目录路径] --no-report     # 仅显示不保存
 *   node validate_simple.js [目录路径] --json          # JSON格式输出
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const targetDir = process.argv[2] || './examples';
const jsonOutput = process.argv.includes('--json');
const noReport = process.argv.includes('--no-report');
let outputFile = null;

// 解析 --output 参数
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--output=')) {
    outputFile = process.argv[i].split('=')[1];
  }
}

// 默认生成报告（除非指定 --no-report）
if (!outputFile && !noReport) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  const reportDir = 'reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  outputFile = `${reportDir}/validation_${timestamp}.json`;
}

// 结果统计
const results = {
  timestamp: new Date().toISOString(),
  datetime: new Date().toLocaleString('zh-CN'),
  targetDir: targetDir,
  total: 0,
  passed: 0,
  failed: 0,
  passRate: 0,
  passedFiles: [],
  failedFiles: []
};

/**
 * 递归查找所有 .ets 文件
 */
function findEtsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.conda', 'bindings'].includes(file)) {
        findEtsFiles(filePath, fileList);
      }
    } else if (path.extname(file) === '.ets') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * 验证单个文件
 */
function validateFile(filePath) {
  try {
    const output = execSync(`tree-sitter parse "${filePath}"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return !output.includes('ERROR');
  } catch (error) {
    return !error.stdout?.includes('ERROR');
  }
}

/**
 * 主函数
 */
function main() {
  // 检查 tree-sitter CLI
  try {
    execSync('tree-sitter --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('错误：未找到 tree-sitter CLI');
    console.error('请运行：npm install -g tree-sitter-cli');
    process.exit(1);
  }

  // 扫描文件
  const files = findEtsFiles(targetDir);
  results.total = files.length;

  if (!jsonOutput) {
    console.log(`正在验证 ${results.total} 个文件...\n`);
  }

  // 验证每个文件
  files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file);
    const passed = validateFile(file);
    
    if (passed) {
      results.passed++;
      results.passedFiles.push(relativePath);
    } else {
      results.failed++;
      results.failedFiles.push(relativePath);
    }

    if (!jsonOutput) {
      process.stdout.write(`\r进度: ${index + 1}/${results.total}`);
    }
  });

  if (!jsonOutput) {
    console.log('\n');
  }

  // 计算通过率
  results.passRate = results.total > 0 
    ? ((results.passed / results.total) * 100).toFixed(2) 
    : 0;

  // 生成报告内容
  const reportContent = jsonOutput 
    ? generateJsonReport() 
    : generateTextReport();

  // 输出或保存报告
  if (outputFile) {
    // 保存到文件
    const reportDir = path.dirname(outputFile);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, reportContent, 'utf-8');
    
    // 更新汇总报告
    updateSummaryReport();
    
    if (!jsonOutput && !noReport) {
      console.log(`\n✅ 报告已保存: ${outputFile}`);
      console.log(`✅ 汇总已更新: reports/summary.json`);
      console.log(`📊 趋势图已生成: reports/trend_chart.html\n`);
    }
  } else {
    // 输出到控制台
    console.log(reportContent);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * 更新汇总报告
 */
function updateSummaryReport() {
  const summaryFile = 'reports/summary.json';
  let summaryData = { history: [] };
  
  // 读取现有汇总
  if (fs.existsSync(summaryFile)) {
    try {
      summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
    } catch (error) {
      console.log('警告：汇总报告格式错误，将重新创建');
    }
  }
  
  // 添加当前记录
  summaryData.history.push({
    timestamp: results.timestamp,
    datetime: results.datetime,
    targetDir: results.targetDir,
    total: results.total,
    passed: results.passed,
    failed: results.failed,
    passRate: results.passRate
  });
  
  // 保持最近100条记录
  if (summaryData.history.length > 100) {
    summaryData.history = summaryData.history.slice(-100);
  }
  
  // 保存汇总
  fs.writeFileSync(summaryFile, JSON.stringify(summaryData, null, 2), 'utf-8');
  
  // 生成趋势图 HTML
  generateTrendChart(summaryData);
}

/**
 * 生成 JSON 格式报告
 */
function generateJsonReport() {
  return JSON.stringify({
    timestamp: results.timestamp,
    datetime: results.datetime,
    targetDir: results.targetDir,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      passRate: `${results.passRate}%`
    },
    passedFiles: results.passedFiles,
    failedFiles: results.failedFiles
  }, null, 2);
}

/**
 * 生成文本格式报告
 */
function generateTextReport() {
  const lines = [];
  
  lines.push('╭────────────────────────────────────────╮');
  lines.push('│     ArkTS 文件验证结果统计             │');
  lines.push('╰────────────────────────────────────────╯\n');
  
  lines.push(`验证时间: ${results.datetime}`);
  lines.push(`目标目录: ${results.targetDir}\n`);
  
  // 统计表格
  lines.push('┌──────────────┬────────┐');
  lines.push('│ 指标         │ 数值   │');
  lines.push('├──────────────┼────────┤');
  lines.push(`│ 总文件数     │ ${results.total.toString().padStart(6)} │`);
  lines.push(`│ ✅ 通过      │ ${results.passed.toString().padStart(6)} │`);
  lines.push(`│ ❌ 失败      │ ${results.failed.toString().padStart(6)} │`);
  lines.push(`│ 通过率       │ ${(results.passRate + '%').padStart(6)} │`);
  lines.push('└──────────────┴────────┘\n');

  // 失败文件列表
  if (results.failed > 0) {
    lines.push('❌ 解析失败的文件:\n');
    results.failedFiles.forEach((file, index) => {
      lines.push(`  ${(index + 1).toString().padStart(2)}. ${file}`);
    });
    lines.push('');
  }

  // 成功文件列表
  if (results.passed > 0) {
    lines.push('✅ 解析通过的文件:\n');
    results.passedFiles.forEach((file, index) => {
      lines.push(`  ${(index + 1).toString().padStart(2)}. ${file}`);
    });
    lines.push('');
  }

  lines.push('──────────────────────────────────────────');
  
  return lines.join('\n');
}

/**
 * 生成趋势图 HTML
 */
function generateTrendChart(summaryData) {
  const chartFile = 'reports/trend_chart.html';
  
  // 按目录分组数据
  const dataByDir = {};
  summaryData.history.forEach(item => {
    const dir = item.targetDir;
    if (!dataByDir[dir]) {
      dataByDir[dir] = [];
    }
    dataByDir[dir].push(item);
  });
  
  // 获取所有目录列表
  const directories = Object.keys(dataByDir);
  
  // 为每个目录准备图表数据
  const chartDataByDir = {};
  directories.forEach(dir => {
    const dirData = dataByDir[dir];
    chartDataByDir[dir] = {
      labels: dirData.map(item => {
        const date = new Date(item.timestamp);
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      }),
      passRateData: dirData.map(item => parseFloat(item.passRate)),
      passedData: dirData.map(item => item.passed),
      failedData: dirData.map(item => item.failed),
      totalData: dirData.map(item => item.total),
      count: dirData.length,
      latest: dirData[dirData.length - 1],
      previous: dirData.length > 1 ? dirData[dirData.length - 2] : null
    };
  });
  
  // 使用最新验证的目录作为默认显示
  const currentDir = summaryData.history[summaryData.history.length - 1].targetDir;
  const currentData = chartDataByDir[currentDir];
  
  // 兼容性：保留旧变量以便后续代码使用
  const labels = currentData.labels;
  const passRateData = currentData.passRateData;
  const passedData = currentData.passedData;
  const failedData = currentData.failedData;
  const totalData = currentData.totalData;
  
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ArkTS 验证趋势图</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    .stat-trend {
      font-size: 0.85em;
      margin-top: 5px;
    }
    .trend-up { color: #10b981; }
    .trend-down { color: #ef4444; }
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .chart-wrapper {
      position: relative;
      height: 400px;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 20px;
      font-size: 0.9em;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 ArkTS 验证趋势分析</h1>
    
    <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <label style="font-weight: bold; color: #333; margin-right: 10px;">📁 选择目录:</label>
      <select id="dirSelector" style="padding: 10px 15px; border-radius: 8px; border: 2px solid #667eea; font-size: 1em; cursor: pointer; background: white; min-width: 300px;">
        ${directories.map(dir => `<option value="${dir}" ${dir === currentDir ? 'selected' : ''}>${dir}</option>`).join('')}
      </select>
      <span style="margin-left: 15px; color: #666; font-size: 0.9em;">共 <span id="totalRuns">${currentData.count}</span> 次验证</span>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">最新通过率</div>
        <div class="stat-value" id="statPassRate">${currentData.latest.passRate}%</div>
        <div class="stat-trend ${currentData.previous && parseFloat(currentData.latest.passRate) > parseFloat(currentData.previous.passRate) ? 'trend-up' : 'trend-down'}" id="statPassRateTrend">
          ${currentData.previous ? (parseFloat(currentData.latest.passRate) - parseFloat(currentData.previous.passRate) > 0 ? '↑' : '↓') + ' ' + Math.abs(parseFloat(currentData.latest.passRate) - parseFloat(currentData.previous.passRate)).toFixed(2) + '%' : '-'}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总文件数</div>
        <div class="stat-value" id="statTotal">${currentData.latest.total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最新通过数</div>
        <div class="stat-value" style="color: #10b981;" id="statPassed">${currentData.latest.passed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最新失败数</div>
        <div class="stat-value" style="color: #ef4444;" id="statFailed">${currentData.latest.failed}</div>
      </div>
    </div>

    <div class="chart-container">
      <h2 style="margin-bottom: 20px; color: #333;">通过率趋势</h2>
      <div class="chart-wrapper">
        <canvas id="passRateChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <h2 style="margin-bottom: 20px; color: #333;">文件数量趋势</h2>
      <div class="chart-wrapper">
        <canvas id="filesChart"></canvas>
      </div>
    </div>

    <div class="footer">
      最后更新: ${new Date().toLocaleString('zh-CN')}
    </div>
  </div>

  <script>
    // 所有目录的数据
    const allData = ${JSON.stringify(chartDataByDir)};
    let currentChart1, currentChart2;
    
    // 初始化图表
    function initCharts(dirKey) {
      const data = allData[dirKey];
      
      // 更新统计卡片
      document.getElementById('statPassRate').textContent = data.latest.passRate + '%';
      document.getElementById('statTotal').textContent = data.latest.total;
      document.getElementById('statPassed').textContent = data.latest.passed;
      document.getElementById('statFailed').textContent = data.latest.failed;
      document.getElementById('totalRuns').textContent = data.count;
      
      // 更新趋势指标
      const trendElement = document.getElementById('statPassRateTrend');
      if (data.previous) {
        const diff = parseFloat(data.latest.passRate) - parseFloat(data.previous.passRate);
        const isUp = diff > 0;
        trendElement.className = 'stat-trend ' + (isUp ? 'trend-up' : 'trend-down');
        trendElement.textContent = (isUp ? '↑' : '↓') + ' ' + Math.abs(diff).toFixed(2) + '%';
      } else {
        trendElement.textContent = '-';
      }
      
      // 销毁旧图表
      if (currentChart1) currentChart1.destroy();
      if (currentChart2) currentChart2.destroy();
      
      // 创建通过率趋势图
      const passRateCtx = document.getElementById('passRateChart').getContext('2d');
      currentChart1 = new Chart(passRateCtx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: '通过率 (%)',
          data: data.passRateData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgb(16, 185, 129)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) { return value + '%'; }
            }
          }
        }
      }
    });

      // 创建文件数量趋势图
      const filesCtx = document.getElementById('filesChart').getContext('2d');
      currentChart2 = new Chart(filesCtx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '✅ 通过',
            data: data.passedData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          },
          {
            label: '❌ 失败',
            data: data.failedData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: { stacked: false },
          y: { stacked: false, beginAtZero: true }
        }
      }
    });
    }
    
    // 目录切换事件
    document.getElementById('dirSelector').addEventListener('change', function(e) {
      initCharts(e.target.value);
    });
    
    // 初始化默认目录
    initCharts('${currentDir}');
  </script>
</body>
</html>`;
  
  fs.writeFileSync(chartFile, htmlContent, 'utf-8');
}

/**
 * 打印报告（已废弃，使用 generateTextReport）
 */
function printReport() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     ArkTS 文件验证结果统计             ║');
  console.log('╚════════════════════════════════════════╝\n');

  // 统计表格
  console.log('┌──────────────┬────────┐');
  console.log('│ 指标         │ 数值   │');
  console.log('├──────────────┼────────┤');
  console.log(`│ 总文件数     │ ${results.total.toString().padStart(6)} │`);
  console.log(`│ ✅ 通过      │ ${results.passed.toString().padStart(6)} │`);
  console.log(`│ ❌ 失败      │ ${results.failed.toString().padStart(6)} │`);
  console.log(`│ 通过率       │ ${(results.passRate + '%').padStart(6)} │`);
  console.log('└──────────────┴────────┘\n');

  // 失败文件列表
  if (results.failed > 0) {
    console.log('❌ 解析失败的文件:\n');
    results.failedFiles.forEach((file, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${file}`);
    });
    console.log('');
  }

  // 成功文件列表
  if (results.passed > 0) {
    console.log('✅ 解析通过的文件:\n');
    results.passedFiles.forEach((file, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${file}`);
    });
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 运行
main();
