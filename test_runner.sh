#!/bin/bash
# ArkTS Tree-sitter测试脚本
# 遍历 examples/ test/ corpus/ 下的 .ets 文件，
# 用 web-tree-sitter + WASM 解析并统计结果

set -euo pipefail

echo "=== ArkTS Tree-sitter 测试报告 ==="
echo "开始时间: $(date)"
echo

# 查找所有 .ets 测试文件
search_dirs=()
for dir in examples test corpus; do
  [ -d "$dir" ] && search_dirs+=("$dir")
done

if [ ${#search_dirs[@]} -eq 0 ]; then
  echo "⚠️  未找到测试目录（期望 examples/ test/ corpus/）"
  exit 0
fi

echo "搜索目录: ${search_dirs[*]}"
echo

files=()
while IFS= read -r -d '' f; do
  files+=("$f")
done < <(find "${search_dirs[@]}" -name '*.ets' -print0 2>/dev/null || true)

if [ ${#files[@]} -eq 0 ]; then
  echo "⚠️  未找到 .ets 文件"
  exit 0
fi

echo "共发现 ${#files[@]} 个文件"
echo

# 构建 JSON 文件列表传给 Node（避免 shell 引用地狱）
json_files='['
sep=''
for f in "${files[@]}"; do
  json_files+="${sep}\"${f}\""
  sep=','
done
json_files+=']'

node -e "
const fs = require('fs');
const path = require('path');
const { Parser: WTParser, Language } = require('web-tree-sitter');
const files = ${json_files};

(async () => {
  await WTParser.init();
  const parser = new WTParser();
  const Lang = await Language.load('tree-sitter-arkts.wasm');
  parser.setLanguage(Lang);

  // 文件名中含 error_recovery 的文件用于测试错误恢复，解析含 ERROR 节点是预期的
  function isExpectedFailure(file) {
    return path.basename(file).includes('error_recovery');
  }

  let passed = 0, failed = 0, expected = 0, details = [];

  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const tree = parser.parse(src);
    const root = tree.rootNode;

    let hasError = false;
    function check(n) {
      if (n.type === 'ERROR' || n.isError) hasError = true;
      for (let i = 0; i < n.childCount; i++) check(n.child(i));
    }
    check(root);

    if (hasError) {
      const errs = [];
      function collect(n) {
        if (n.type === 'ERROR' || n.isError) errs.push(
          '第' + (n.startPosition.row + 1) + '行:' + n.startPosition.column + '列'
        );
        for (let i = 0; i < n.childCount; i++) collect(n.child(i));
      }
      collect(root);

      if (isExpectedFailure(file)) {
        expected++;
        details.push({ file, ok: false, expected: true, errors: errs });
      } else {
        failed++;
        details.push({ file, ok: false, expected: false, errors: errs });
      }
    } else {
      passed++;
      details.push({ file, ok: true });
    }
  }

  // 输出结果
  for (const d of details) {
    const rel = d.file.replace(process.cwd() + '/', '');
    if (d.ok) {
      console.log('PASS: ' + rel);
    } else if (d.expected) {
      console.log('XPCT: ' + rel + ' (expected error recovery test)');
      for (const e of d.errors) console.log('  ERROR at ' + e);
    } else {
      console.log('FAIL: ' + rel);
      for (const e of d.errors) console.log('  ERROR at ' + e);
    }
  }

  console.log('');
  console.log('=== 测试总结 ===');
  console.log('总文件数: ' + files.length);
  console.log('成功: ' + passed);
  console.log('预期失败(error_recovery): ' + expected);
  console.log('意外失败: ' + failed);
  const effectiveTotal = files.length - expected;
  console.log('有效率: ' + (effectiveTotal > 0 ? Math.round(passed / effectiveTotal * 100) : 0) + '%（扣除预期失败）');
  console.log('结束时间: ' + new Date().toLocaleString());
})();
" 2>&1
