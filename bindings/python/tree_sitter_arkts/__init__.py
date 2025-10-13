"""ArkTS grammar for tree-sitter.

This package provides tree-sitter bindings for the ArkTS programming language,
which is used in HarmonyOS development by Huawei.

ArkTS is based on TypeScript with additional language features for:
- Decorators (@Component, @State, @Prop, etc.)
- UI description syntax
- State management
- Component-based architecture

Example usage:
    import tree_sitter_arkts as arkts
    from tree_sitter import Language, Parser
    
    ARKTS_LANGUAGE = Language(arkts.language())
    parser = Parser(ARKTS_LANGUAGE)
    
    source_code = '''
    @Component
    struct MyComponent {
      @State count: number = 0
      
      build() {
        Text(`Count: ${this.count}`)
      }
    }
    '''
    
    tree = parser.parse(bytes(source_code, 'utf8'))
    print(tree.root_node)
"""

from importlib.resources import files as _files

from ._binding import language


def _get_query(name, file):
    query = _files(f"{__package__}.queries") / file
    globals()[name] = query.read_text()
    return globals()[name]


def __getattr__(name):
    # NOTE: uncomment these to include any queries that this grammar contains:

    if name == "HIGHLIGHTS_QUERY":
        return _get_query("HIGHLIGHTS_QUERY", "highlights.scm")
    # if name == "INJECTIONS_QUERY":
    #     return _get_query("INJECTIONS_QUERY", "injections.scm")
    # if name == "LOCALS_QUERY":
    #     return _get_query("LOCALS_QUERY", "locals.scm")
    if name == "TAGS_QUERY":
        return _get_query("TAGS_QUERY", "tags.scm")

    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "language",
    "HIGHLIGHTS_QUERY",
    # "INJECTIONS_QUERY",
    # "LOCALS_QUERY",
    "TAGS_QUERY",
]


def __dir__():
    return sorted(__all__ + [
        "__all__", "__builtins__", "__cached__", "__doc__", "__file__",
        "__loader__", "__name__", "__package__", "__path__", "__spec__",
    ])
