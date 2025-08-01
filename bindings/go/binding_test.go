package tree_sitter_pic_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_pic "github.com/smoeding/tree-sitter-pic/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pic.Language())
	if language == nil {
		t.Errorf("Error loading Pic grammar")
	}
}
