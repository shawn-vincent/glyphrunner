# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GlyphRunner is an early-stage project. The repository currently contains:
- `docs/` - Documentation directory with project logo
- `docs/requirements/` - Requirements specification directory (empty)
- `meta/history/` - Project history metadata (empty)

## Development Setup

This project is in initial development phase. No build system, dependencies, or development commands have been established yet.

## Architecture

The project structure is being established. Key architectural decisions and patterns will be documented here as the codebase develops.

## Available External Tools

### ChatGPT (via Codex CLI)
- **Command**: `codex exec "prompt"` - AI code generation and assistance using GPT-5
- **Model**: GPT-5 with advanced reasoning capabilities
- **Context Size**: 400,000 tokens total (272k input + 128k output)
- **Best for**: 
  - Multi-step reasoning and problem solving
  - Advanced code generation and refactoring
  - Mathematical problem solving (94.6% on AIME 2025)
  - Real-world coding tasks (74.9% on SWE-bench Verified)
  - Multimodal understanding and visual reasoning
  - Complex debugging with step-by-step analysis
- **Key Features**:
  - 80% less likely to hallucinate than previous models
  - Deliberate multi-step thinking process
  - Built-in chain-of-thought reasoning
  - State-of-the-art performance across coding benchmarks
- **Usage Examples**:
  - `codex exec "write a React hook for managing form state with validation"`
  - `codex exec "refactor this component to use TypeScript and add error handling"`
  - `codex exec "explain this algorithm step-by-step and suggest optimizations"`
- **Alias**: Consider `alias cx="codex exec"` for quicker access

## Notes

This CLAUDE.md file should be updated as the project develops to include:
- Build and development commands
- Testing frameworks and commands
- Code architecture and patterns
- Development workflow and conventions