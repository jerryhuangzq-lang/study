# REA (Reverse Engineer Anything) 架构笔记 / Architecture Notes

- Repo: https://github.com/morluto/REA (MIT)
- 来源 / Sources: README, `docs/architecture.mermaid`, `AGENTS.md`, `src/` 目录列表。未读具体源码 / source code itself not read.

## 是什么 / What it is
开源 MCP 服务器,让 AI agent 逆向没有源码的软件(原生二进制、Electron/JS、.NET、APK、网站/抓包、WASM、EVM、固件等)。
An open-source MCP server that lets AI agents reverse engineer software without source.

安装 / Install: `npx rea-agents setup`; CLI: `npm i -g rea-agents` → `rea --help`. Node 22.19+ / 24.11+ / 26+.

## 分层 / Layers (outer → inner)

```
入口 Entry        scripts/rea.mjs ─► src/cli.ts   (one-shot CLI)
                                  └► src/main.ts  (MCP stdio server)
适配器 Adapters   src/server/       MCP request translation, tool registration
组合 Composition  src/composition/  provider & session factories
应用层 Application src/application/ shared CLI/MCP workflows, investigations, EvidenceLedger
Provider 层       hopper/ ghidra/ ida/ android/ dotnet/ wasm/ evm/ browser/ firmware/ ...
进程基础 Process  src/process/      process groups, deadlines, bounded reads, cleanup
契约+领域         src/contracts/ (Zod schemas) → src/domain/ (pure, no side effects)
```

## Provider 一览 / Providers
| Provider | 位置 | 机制 |
|---|---|---|
| Hopper | `src/hopper/`, `bridge/hopper_bridge.py` | Python bridge + Unix socket |
| Ghidra | `src/ghidra/`, `bridge/ghidra/ReaGhidraBridge.java` | packaged HeadlessScript |
| IDA | `src/ida/` | adapts external `ida-pro-mcp` (GUI or headless DB) |
| Android | `src/android/` | static APK via headless JADX |
| .NET | `src/dotnet/` | managed static metadata |
| WASM / EVM | `src/wasm/`, `src/evm/` | WABT / EVMole in bounded worker |
| Firmware | `src/firmware/` | Binwalk / Unblob |
| Browser | `src/browser/`, `src/inspector/` | CDP / Playwright, V8 Inspector |
| ELF/core | `src/native/pwntools/`, `pwndbg/` | offline adapters |

另有 / also: `frida`, `flutter`, `go`, `sqlite`, `jeb`, `signals`, `adb`, `apktool`, `captures`.

## 关键设计 / Key ideas
1. 一个 dispatcher,两种模式;CLI 与 MCP 共用 `application/` 工作流 → 结果一致。
2. 每个目标一个不可变 session 绑定;`AnalysisProviderRegistry` 确定性选择,**无 fallback**。
3. Evidence-first:`InvestigationRecords` + `EvidenceLedger` 让结论可追溯。
4. 所有外部工具经 `src/process/` 启动,有超时与清理;Windows 有 Node-API 原生层。

## 设计原则 / Principles (AGENTS.md)
- Unknown stays unknown(不当成"不存在")。
- 每种资源单一拥有者,下游复用已解析的事实,不重复解析。
- Ghidra/IDA 严格只读。
- 安装器改动增量、幂等、先备份。
- 性能优先级:agent tokens/context > 分析时间 > CPU/内存。

## 技术栈 / Stack
TypeScript, Node.js, Zod, Vitest, Turborepo, oxlint/oxfmt.

## 想继续读 / Next
- `src/application/investigation/` — 证据账本
- `src/server/` — MCP 工具注册
- `docs/mcp-contracts.md`, `docs/tool-design.md`
