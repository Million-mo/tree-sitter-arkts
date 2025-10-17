#!/usr/bin/env node
/**
 * 验证报告趋势分析工具
 * 分析 reports/ 目录下的历史验证记录，显示成功率变化趋势
 * 支持从 summary.json 读取汇总数据
 */

const fs = require('fs');
const path = require('path');

const reportsDir = './reports';
const summaryFile = './reports/summary.json';

/**
 * 从汇总文件读取数据
 */
function loadFromSummary() {
  if (!fs.existsSync(summaryFile)) {
    return null;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
    return data.history || [];
  } catch (error) {
    console.log('警告：无法读取汇总报告');
    return null;
  }
}

/**
 * 读取所有 JSON 格式的验证报告
 */
function loadReports() {
  if (!fs.existsSync(reportsDir)) {
    console.log('错误：reports 目录不存在');
    return [];
  }

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.json') && f.startsWith('validation_'))
    .sort();

  const reports = [];
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
      const data = JSON.parse(content);
      reports.push({
        file: file,
        ...data
      });
    } catch (error) {
      console.log(`警告：跳过无效文件 ${file}`);
    }
  });

  return reports;
}

/**
 * 显示趋势表格
 */
function showTrend(reports) {
  if (reports.length === 0) {
    console.log('\n暂无历史验证记录');
    console.log('\n生成记录：');
    console.log('  npm run validate\n');
    return;
  }

  console.log('\n╭────────────────────────────────────────────────────────────╮');
  console.log('│              验证成功率趋势分析                            │');
  console.log('╰────────────────────────────────────────────────────────────╯\n');

  // 按目录分组
  const byDir = {};
  reports.forEach(r => {
    const dir = r.targetDir || '未知目录';
    if (!byDir[dir]) {
      byDir[dir] = [];
    }
    byDir[dir].push(r);
  });

  // 显示每个目录的趋势
  Object.keys(byDir).forEach(dir => {
    const dirReports = byDir[dir];
    
    console.log(`📂 目录: ${dir}\n`);
    console.log('┌────────────────────┬───────┬───────┬───────┬─────────┐');
    console.log('│ 验证时间           │ 总数  │ 通过  │ 失败  │ 通过率  │');
    console.log('├────────────────────┼───────┼───────┼───────┼─────────┤');

    // 只显示最近10条记录
    const recentReports = dirReports.slice(-10);
    recentReports.forEach(report => {
      const datetime = report.datetime || '未知时间';
      const total = report.total.toString().padStart(5);
      const passed = report.passed.toString().padStart(5);
      const failed = report.failed.toString().padStart(5);
      const passRate = (report.passRate + '%').padStart(7);

      console.log(`│ ${datetime.padEnd(18)} │ ${total} │ ${passed} │ ${failed} │ ${passRate} │`);
    });

    console.log('└────────────────────┴───────┴───────┴───────┴─────────┘\n');

    // 显示趋势
    if (dirReports.length > 1) {
      const first = dirReports[0];
      const last = dirReports[dirReports.length - 1];
      const firstRate = parseFloat(first.passRate);
      const lastRate = parseFloat(last.passRate);
      const change = lastRate - firstRate;

      console.log('📊 趋势分析:\n');
      console.log(`  首次验证: ${first.datetime} - ${first.passRate}%`);
      console.log(`  最新验证: ${last.datetime} - ${last.passRate}%`);
      
      if (change > 0) {
        console.log(`  📈 提升: +${change.toFixed(2)}%`);
      } else if (change < 0) {
        console.log(`  📉 下降: ${change.toFixed(2)}%`);
      } else {
        console.log(`  ➡️  无变化`);
      }
      console.log('');
    }
  });

  console.log('────────────────────────────────────────────────────────────\n');
}

// 主函数
function main() {
  // 优先从 summary.json 读取
  let reports = loadFromSummary();
  
  // 如果汇总文件不存在，尝试读取单个报告文件
  if (!reports) {
    reports = loadReports();
  }
  
  showTrend(reports);
}

main();
