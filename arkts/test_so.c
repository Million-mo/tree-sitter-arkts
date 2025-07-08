#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <tree_sitter/api.h>

// 声明外部符号
const TSLanguage *tree_sitter_arkts(void);

int main() {
    // 获取ArkTS语言
    const TSLanguage *language = tree_sitter_arkts();
    if (!language) {
        printf("❌ Failed to load ArkTS language\n");
        return 1;
    }
    
    // 创建解析器
    TSParser *parser = ts_parser_new();
    if (!parser) {
        printf("❌ Failed to create parser\n");
        return 1;
    }
    
    // 设置语言
    if (!ts_parser_set_language(parser, language)) {
        printf("❌ Failed to set language\n");
        ts_parser_delete(parser);
        return 1;
    }
    
    // 测试解析简单的ArkTS代码
    const char *source_code = 
        "@Component\n"
        "struct TestComponent {\n"
        "  @State message: string = 'Hello ArkTS'\n"
        "  \n"
        "  build() {\n"
        "    Text(this.message)\n"
        "  }\n"
        "}\n";
    
    // 解析代码
    TSTree *tree = ts_parser_parse_string(parser, NULL, source_code, strlen(source_code));
    if (!tree) {
        printf("❌ Failed to parse source code\n");
        ts_parser_delete(parser);
        return 1;
    }
    
    // 获取根节点
    TSNode root_node = ts_tree_root_node(tree);
    
    // 打印解析结果
    char *string = ts_node_string(root_node);
    printf("✅ ArkTS .so file is working!\n");
    printf("📊 Parse tree:\n%s\n", string);
    
    // 验证是否包含struct_declaration
    TSNode child = ts_node_child(root_node, 0);
    const char *node_type = ts_node_type(child);
    if (strcmp(node_type, "struct_declaration") == 0) {
        printf("✅ Successfully identified struct_declaration!\n");
    } else {
        printf("⚠️  Expected struct_declaration, got: %s\n", node_type);
    }
    
    // 清理资源
    free(string);
    ts_tree_delete(tree);
    ts_parser_delete(parser);
    
    printf("🎉 ArkTS tree-sitter library test completed successfully!\n");
    return 0;
}