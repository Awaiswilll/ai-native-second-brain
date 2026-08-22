# Understand-Anything

## Summary
Turn any codebase into an interactive knowledge graph — explore, search, and ask questions about code structure.

## Details
- **Installed**: 2026-08-22
- **Location**: `/home/grok/.understand-anything/repo/`
- **GitHub**: https://github.com/Awaiswilll/Understand-Anything (forked from Egonex-AI/Understand-Anything)
- **Website**: https://understand-anything.com

### Features
- **Knowledge Graph**: Interactive visual graph of codebase
- **Multi-Agent Pipeline**: 5 specialized agents analyze code
- **Guided Tours**: Auto-generated walkthroughs
- **Search**: Fuzzy + semantic search across graph
- **Diff Impact**: See which parts your changes affect
- **Domain View**: Map code to business processes
- **Wiki Analysis**: Analyze knowledge bases

### Installation
- **Claude Code**: `/plugin marketplace add Egonex-AI/Understand-Anything` then `/plugin install understand-anything`
- **Codex**: `install.sh codex` (done)
- **Location**: `/home/grok/.understand-anything/repo/`

### Usage
```bash
# In Claude Code
/understand                    # Analyze codebase
/understand-dashboard          # Open interactive dashboard
/understand-chat               # Ask questions about code

# In Codex
$understand                    # Analyze codebase
$understand-dashboard          # Open interactive dashboard
```

### Commands
| Command | Description |
|---------|-------------|
| `/understand` | Analyze codebase (initial or incremental) |
| `/understand-dashboard` | Open interactive graph dashboard |
| `/understand-chat` | Ask questions about code |
| `/understand-diff` | Analyze impact of current changes |
| `/understand-explain` | Deep-dive into specific file/function |
| `/understand-onboard` | Generate onboarding guide |
| `/understand-domain` | Extract business domain knowledge |
| `/understand-knowledge` | Analyze wiki/knowledge base |

## Related
- [Potpie](./potpie.md) - Context graph for this repo
- [AI Hub](../hub/index.html) - Dashboard with Understand-Anything card
