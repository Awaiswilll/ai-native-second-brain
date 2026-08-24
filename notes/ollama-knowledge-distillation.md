# Ollama Knowledge Distillation

## Summary
Strategy for transferring deeper knowledge from larger cloud agents into the local 4B qwen3.5 model while preserving portability and avoiding unnecessary cloud spend.

## Details

### Core principle
The 4B local model cannot hold frontier-level reasoning depth in its weights. Therefore the durable knowledge layer is the second-brain markdown corpus. Cloud agents are used only to generate high-signal, structured content that is stored as plain `.md` files. The local model then consumes this corpus via RAG or direct context.

### Chosen pipeline (2026-08-24)

1. **Identify gaps**  
   Use `second-brain/notes/` coverage and Potpie graph queries to find topics where the local model is weak.

2. **Cloud generation (explicit approval required)**  
   When the local model cannot produce sufficient depth, request a one-time cloud call. The user must explicitly approve any switch away from `qwen35`.

3. **Structured output**  
   Every cloud response is written to a dedicated note file using the exact template below. This guarantees immediate ingestion by any local agent or future fine-tuning run.

4. **Ingestion options**  
   - Immediate: local Ollama reads the new `.md` file via filesystem context or Potpie.  
   - Periodic: collect multiple notes into a synthetic Q&A dataset and fine-tune the 4B model (axolotl / unsloth / Ollama fine-tune) on a GPU host.

5. **Fallbacks**  
   - Pure second-brain RAG (no fine-tuning) is the default and sufficient for most work.  
   - Fine-tuning is reserved for domains where retrieval alone is repeatedly insufficient.

### Reusable prompt template for cloud agents

```
You are producing durable knowledge for a second-brain system stored as flat markdown.

Output ONLY in this exact structure. Do not add extra commentary.

# <Concise Topic Title>

## Summary
One or two sentences that capture the core insight.

## Details
Free-form but high-signal explanation, code, reasoning steps, edge cases, and references. Use short paragraphs and bullet lists. Keep every sentence factual.

## Related
- [Link to existing note if relevant](./notes/related-topic.md)
```

Any cloud agent (grok-*, claude-*, etc.) receives this prompt plus the specific question. The resulting markdown is saved directly under `second-brain/notes/<topic>.md`.

### Current status
- Local default model remains `qwen35` (qwen3.5:4b via Ollama).  
- Cloud models are used only after explicit user approval and only for the distillation step described above.  
- All generated knowledge is stored in human-readable markdown that survives model or OS changes.

## Related
- [decisions.md](../decisions.md)
- [CLAUDE.md](../CLAUDE.md)
