# demo-app

A tiny Electron app (one IPC channel `synth:note`: MIDI pitch → frequency) used to trial-run REA's static JavaScript analysis.

```bash
npx -y rea-agents@latest analyze-javascript-application ./rea-notes/demo-app --json
```

Needs Node.js 22.19+ / 24.11+. No Hopper/Ghidra required.
