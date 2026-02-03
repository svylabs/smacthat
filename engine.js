/**
 * Custom Simulation Engine
 * Handles JSON state machines, Mermaid generation, and context-driven transitions.
 */

class VisualizerEngine {
    constructor() {
        this.config = null;
        this.currentStateId = null;
        this.context = {};
        this.history = [];
        this.listeners = [];
    }

    /**
     * Load a simulation configuration
     * @param {Object} config 
     */
    load(config) {
        console.log("VisualizerEngine: Loading config", config?.id);
        if (!config || !config.states) {
            console.error("VisualizerEngine: Invalid config provided");
            return;
        }
        this.config = config;
        this.context = JSON.parse(JSON.stringify(config.context || {}));
        this.currentStateId = config.initialState;
        this.history = [];
        this.recordHistory('Initial State');
        this.notify();
        console.log("VisualizerEngine: Load complete. Current state:", this.currentStateId);
    }

    /**
     * Subscribe to engine changes
     */
    subscribe(fn) {
        this.listeners.push(fn);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.getState()));
    }

    /**
     * Send an event to trigger a transition
     * @param {string} eventId 
     * @param {Object} input 
     */
    send(eventId, input = {}) {
        const currentState = this.config.states[this.currentStateId];
        const transition = currentState.on[eventId];

        if (!transition) {
            console.error(`No transition found for event ${eventId} in state ${this.currentStateId}`);
            return false;
        }

        // Execute action if exists
        if (transition.action) {
            try {
                // Actions have access to 'context' and 'input'
                const actionFn = new Function('context', 'input', `
                    ${transition.action};
                    return context;
                `);
                this.context = actionFn(JSON.parse(JSON.stringify(this.context)), input);
            } catch (err) {
                console.error(`Action error for ${eventId}:`, err);
                // We return the error so the UI can handle it (e.g. show an alert)
                return { error: err.message };
            }
        }

        // Move to next state
        this.currentStateId = transition.to;
        this.recordHistory(eventId, input);
        this.notify();
        return true;
    }

    recordHistory(event, input = {}) {
        this.history.push({
            timestamp: new Date().toLocaleTimeString(),
            state: this.currentStateId,
            event: event,
            context: JSON.parse(JSON.stringify(this.context)),
            input: JSON.parse(JSON.stringify(input))
        });
    }

    /**
     * Generate Mermaid source string automatically from config
     */
    generateMermaid() {
        if (!this.config) return '';

        let m = 'stateDiagram-v2\n';
        m += '    direction LR\n\n';

        // Styling
        m += '    classDef current fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff\n\n';

        // States
        Object.entries(this.config.states).forEach(([id, data]) => {
            const label = data.label || id;
            m += `    state "${label}" as ${id}\n`;
            if (id === this.currentStateId) {
                m += `    class ${id} current\n`;
            }
        });

        m += '\n';

        // Transitions
        Object.entries(this.config.states).forEach(([sourceId, stateData]) => {
            if (stateData.on) {
                Object.entries(stateData.on).forEach(([eventId, trans]) => {
                    const label = trans.label || eventId;
                    m += `    ${sourceId} --> ${trans.to}: ${label}\n`;
                });
            }
        });

        return m;
    }

    getState() {
        const stateData = this.config ? this.config.states[this.currentStateId] : null;
        if (!stateData && this.config) {
            console.warn(`VisualizerEngine: State ${this.currentStateId} not found in config`);
        }
        return {
            id: this.currentStateId,
            data: stateData,
            context: this.context,
            availableEvents: stateData ? stateData.on : {},
            mermaid: this.generateMermaid(),
            history: this.history
        };
    }

    /**
     * Undo the last transition
     */
    undo() {
        if (this.history.length <= 1) return; // Can't undo initial state

        this.history.pop(); // Remove current state
        const prevState = this.history[this.history.length - 1];

        this.currentStateId = prevState.state;
        this.context = JSON.parse(JSON.stringify(prevState.context));

        console.log("VisualizerEngine: Undo to", this.currentStateId);
        this.notify();
    }

    /**
     * Replay a sequence of events
     * @param {Array<{event: string, input: Object}>} sequence 
     */
    async replay(sequence, delay = 500) {
        console.log("VisualizerEngine: Starting replay of", sequence.length, "events");
        this.reset();

        for (const item of sequence) {
            await new Promise(resolve => setTimeout(resolve, delay));
            this.send(item.event, item.input);
        }
        console.log("VisualizerEngine: Replay complete");
    }

    reset() {
        if (this.config) {
            console.log("VisualizerEngine: Resetting");
            this.load(this.config);
        }
    }
}

export { VisualizerEngine };
