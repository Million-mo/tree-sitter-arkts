#!/bin/bash
# ArkTS Tree-sitter测试脚本
# 用于验证所有测试用例的解析结果

echo "=== ArkTS Tree-sitter 测试报告 ==="
echo "开始时间: $(date)"
echo

total_files=0
successful_files=0
error_files=0

# 遍历所有.ets测试文件
for file in test/*.ets; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        echo "测试文件: $file"
        
        # 运行tree-sitter解析并捕获输出
        output=$(tree-sitter parse "$file" 2>&1)
        exit_code=$?
        
        # 检查是否包含ERROR节点
        if echo "$output" | grep -q "ERROR"; then
            echo "  状态: ❌ 解析有错误"
            echo "  错误信息:"
            echo "$output" | grep "ERROR" | head -3 | sed 's/^/    /'
            error_files=$((error_files + 1))
        else
            echo "  状态: ✅ 解析成功"
            successful_files=$((successful_files + 1))
        fi
        
        # 提取解析统计信息
        if echo "$output" | grep -q "Parse:"; then
            parse_stats=$(echo "$output" | grep "Parse:" | tail -1)
            echo "  统计: $parse_stats"
        fi
        
        echo
    fi
done

# 输出测试总结
echo "=== 测试总结 ==="
echo "总测试文件数: $total_files"
echo "成功解析文件数: $successful_files"
echo "有错误文件数: $error_files"
echo "成功率: $(( successful_files * 100 / total_files ))%"
echo "结束时间: $(date)"