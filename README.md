# smac-viz | State Machine Visualizer

`smac-viz` is a standalone, browser-based tool for visualizing and simulating state machines defined in JSON. It uses **Mermaid.js** for diagram generation and **Monaco Editor** for real-time JSON editing.

![smac-viz Preview](https://raw.githubusercontent.com/mermaid-js/mermaid/develop/docs/public/img/state.png) *(Placeholder image, replace with your actual screenshot)*

## Features

- **Live JSON Editor**: Modify your state machine configuration and see changes instantly.
- **Interactive Visualizer**: High-quality Mermaid diagrams with pan and zoom capabilities.
- **Simulation Controls**: Walk through states, send events with inputs, and view history/context.
- **Undo & Replay**: Revert transitions or replay your entire simulation sequence.
- **Expandable Layout**: Flexible panel sizes with a draggable resizer.
- **GitHub Pages Ready**: Optimized for static hosting with a modern build process.

## State Machine Configuration

The simulator uses a simple JSON format. Example:

```json
{
  "id": "coffee-machine",
  "initialState": "idle",
  "context": { "water": 100 },
  "states": {
    "idle": {
      "label": "Ready",
      "on": {
        "BREW": {
          "to": "brewing",
          "action": "context.water -= 10"
        }
      }
    },
    "brewing": {
      "on": {
        "FINISH": { "to": "idle" }
      }
    }
  }
}
```

## License

MIT
