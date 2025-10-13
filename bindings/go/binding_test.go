package tree_sitter_arkts_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_arkts "github.com/million-mo/arkts_language_server/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_arkts.Language())
	if language == nil {
		t.Errorf("Error loading Arkts grammar")
	}
}
