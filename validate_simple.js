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
      console.log(`✅ 汇总已更新: reports/summary.json\n`);
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
