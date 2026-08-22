# AirLLM

## Summary
Python library for running massive LLMs (70B+) on small GPUs (4GB) by loading only one layer at a time.

## Details
- **Installed**: 2026-08-22
- **Version**: 3.2.0
- **Location**: `/home/grok/airllm-env/`
- **GitHub**: https://github.com/Awaiswilll/airllm (forked from lyogavin/airllm)

### Key Features
- Run 70B models on 4GB GPU (no quantization)
- Run 235B MoE models on ~3GB
- Run DeepSeek-V3 (671B) on ~12GB
- Supports: Llama, Qwen, DeepSeek, Mistral, Phi, Gemma, ChatGLM, Baichuan, InternLM

### Your GPU Capabilities (GTX 1660, 6GB)
| Model | VRAM Needed | Status |
|-------|-------------|--------|
| Qwen3-8B | ~1-2 GB | ✅ Can run |
| Qwen3-30B (MoE) | ~1-3 GB | ✅ Can run |
| Qwen3-235B (MoE) | ~3 GB | ✅ Can run |
| Llama 3.x 70B | ~4 GB | ✅ Can run |
| Llama 3.1 405B | ~8 GB | ❌ Need 8GB |
| DeepSeek-V3 (671B) | ~12 GB | ❌ Need 12GB |

### Usage
```bash
cd ~/airllm-env
source bin/activate
python3 -c "from airllm import AutoModel; print('AirLLM ready')"
```

### Review Due: 2026-08-29

## Related
- [Ollama](./ollama.md) - Local model runner
- [AI Hub](../hub/index.html) - Dashboard with AirLLM card
