/**
 * Dynamic Story Engine - Graph Studio & Discrete Math Analytics Subsystem
 * Directed Graph (DAG) Analysis, Cycle Detection (DFS/Tarjan), Pathfinding,
 * Entropy Metrics, and Interactive Visual Node-Edge Canvas Renderer.
 */

class GraphStudio {
    constructor() {
        this.colorPalette = {
            start: "#ffd731",
            scene: "#4da2ff",
            good: "#34d399",
            tragic: "#fb923c",
            bad: "#f87171",
            neutral: "#e9ccff",
            edge: "#000000",
            activeEdge: "#fb4903",
            activeNode: "#ffd731"
        };
    }

    /* =========================================================
       1. TOPOLOGICAL & GRAPH THEORY DIAGNOSTICS
    ========================================================= */

    /**
     * Complete structural audit of story narrative directed graph
     * @param {Object} story - Story object containing nodes and startNodeId
     */
    analyzeGraph(story) {
        if (!story || !story.nodes || story.nodes.length === 0) {
            return {
                isValid: false,
                status: "EMPTY",
                errors: ["Story contains no scene nodes."],
                warnings: [],
                metrics: { nodeCount: 0, edgeCount: 0, branchingFactor: 0, maxDepth: 0, entropy: 0 }
            };
        }

        const nodes = story.nodes;
        const nodeMap = new Map();
        nodes.forEach(n => nodeMap.set(n.id, n));

        const errors = [];
        const warnings = [];

        // Check start node validity
        let startNode = nodeMap.get(story.startNodeId);
        if (!startNode) {
            startNode = nodes[0];
            warnings.push(`Start node was missing or invalid. Defaulting to '${startNode.title}'.`);
        }

        let edgeCount = 0;
        const adjacency = new Map();
        const inDegree = new Map();
        nodes.forEach(n => {
            adjacency.set(n.id, []);
            inDegree.set(n.id, 0);
        });

        // Build adjacency and validate edge references
        nodes.forEach(n => {
            if (n.choices && Array.isArray(n.choices)) {
                n.choices.forEach(c => {
                    edgeCount++;
                    if (!c.targetNodeId || !nodeMap.has(c.targetNodeId)) {
                        errors.push(`Broken choice edge in scene '${n.title}': target node does not exist.`);
                    } else {
                        adjacency.get(n.id).push(c.targetNodeId);
                        inDegree.set(c.targetNodeId, (inDegree.get(c.targetNodeId) || 0) + 1);
                    }
                });
            }
        });

        // 1. Unreachable Nodes Check (BFS from start)
        const reachable = new Set();
        const queue = [startNode.id];
        reachable.add(startNode.id);

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = adjacency.get(current) || [];
            neighbors.forEach(nbr => {
                if (!reachable.has(nbr)) {
                    reachable.add(nbr);
                    queue.push(nbr);
                }
            });
        }

        const unreachableNodeIds = [];
        nodes.forEach(n => {
            if (!reachable.has(n.id) && n.id !== startNode.id) {
                unreachableNodeIds.push(n.id);
                warnings.push(`⚠️ Orphan Scene '${n.title}' (ID: ${n.id}): Cannot be reached from Start Scene.`);
            }
        });

        // 2. Dead-end Check (Non-ending nodes with 0 choices)
        nodes.forEach(n => {
            if (!n.isEnding && (!n.choices || n.choices.length === 0)) {
                errors.push(`Dead-end without ending flag: Scene '${n.title}' has 0 choices but is not marked as an ending.`);
            }
            if (n.isEnding && n.choices && n.choices.length > 0) {
                warnings.push(`Ending scene '${n.title}' contains ${n.choices.length} outgoing choices (endings should typically terminate).`);
            }
        });

        // 3. Cycle Detection using DFS (Recursion Stack)
        const visited = new Set();
        const recStack = new Set();
        const cycles = [];

        const detectCycle = (nodeId, path = []) => {
            visited.add(nodeId);
            recStack.add(nodeId);
            path.push(nodeId);

            const neighbors = adjacency.get(nodeId) || [];
            for (let nbr of neighbors) {
                if (!visited.has(nbr)) {
                    detectCycle(nbr, [...path]);
                } else if (recStack.has(nbr)) {
                    const cyclePath = path.slice(path.indexOf(nbr)).concat(nbr);
                    const cycleNames = cyclePath.map(id => (nodeMap.get(id) ? nodeMap.get(id).title : id)).join(" → ");
                    cycles.push(cycleNames);
                }
            }

            recStack.delete(nodeId);
        };

        nodes.forEach(n => {
            if (!visited.has(n.id)) {
                detectCycle(n.id, []);
            }
        });

        if (cycles.length > 0) {
            warnings.push(`Detected ${cycles.length} recursive cycle loop(s): ${cycles.join(" | ")}`);
        }

        // 4. Graph Mathematical Metrics
        const nodeCount = nodes.length;
        const branchingFactor = nodeCount > 0 ? (edgeCount / Math.max(1, nodeCount)).toFixed(2) : 0;
        const endingCount = nodes.filter(n => n.isEnding).length;

        // Shannon Narrative Entropy H = - sum(p * log2(p)) based on choice fanout
        let entropy = 0;
        const choiceCounts = nodes.map(n => (n.choices ? n.choices.length : 0)).filter(c => c > 0);
        if (edgeCount > 0) {
            choiceCounts.forEach(c => {
                let p = c / edgeCount;
                entropy -= p * Math.log2(p);
            });
        }

        // Compute maximum path depth to endings using BFS
        let maxDepth = 1;
        const depthQueue = [{ id: startNode.id, depth: 1 }];
        const depthVisited = new Map([[startNode.id, 1]]);

        while (depthQueue.length > 0) {
            const { id, depth } = depthQueue.shift();
            if (depth > maxDepth) maxDepth = depth;
            const neighbors = adjacency.get(id) || [];
            neighbors.forEach(nbr => {
                if (!depthVisited.has(nbr) || depthVisited.get(nbr) < depth + 1) {
                    depthVisited.set(nbr, depth + 1);
                    depthQueue.push({ id: nbr, depth: depth + 1 });
                }
            });
        }

        const isValid = errors.length === 0;
        const status = isValid ? (warnings.length === 0 ? "EXCELLENT" : "GOOD_WITH_WARNINGS") : "NEEDS_FIXES";

        return {
            isValid,
            status,
            errors,
            warnings,
            cycles,
            unreachableNodeIds,
            metrics: {
                nodeCount,
                edgeCount,
                endingCount,
                branchingFactor: parseFloat(branchingFactor),
                maxDepth,
                narrativeEntropy: entropy.toFixed(2),
                reachabilityScore: `${Math.round((reachable.size / Math.max(1, nodeCount)) * 100)}%`
            }
        };
    }

    /* =========================================================
       2. INTERACTIVE VISUAL GRAPH CANVAS RENDERER
    ========================================================= */

    /**
     * Render an interactive visual Node-Link graph inside a container
     * @param {HTMLElement} container - DOM container element
     * @param {Object} story - Story object with nodes
     * @param {Object} options - Custom visual options
     */
    renderCanvas(container, story, options = {}) {
        if (!container || !story || !story.nodes || story.nodes.length === 0) {
            if (container) container.innerHTML = `<div class="canvas-empty-state">No graph nodes to visualize.</div>`;
            return null;
        }

        const width = options.width || container.clientWidth || 800;
        const height = options.height || 460;
        const activePathNodeIds = options.activePath || [];
        const onNodeSelect = options.onNodeSelect || null;

        container.innerHTML = "";

        // Create Canvas element
        const canvas = document.createElement("canvas");
        canvas.width = width * 2; // Hi-DPI
        canvas.height = height * 2;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.className = "story-graph-canvas";
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        ctx.scale(2, 2);

        // Position nodes in layered hierarchical layout
        const nodes = story.nodes;
        const startId = story.startNodeId || nodes[0].id;

        const nodePositions = new Map();
        const startNode = nodes.find(n => n.id === startId) || nodes[0];
        
        // Calculate tree level for each node
        const levels = new Map([[startNode.id, 0]]);
        const queue = [startNode.id];
        
        while (queue.length > 0) {
            const currId = queue.shift();
            const currLvl = levels.get(currId);
            const currNode = nodes.find(n => n.id === currId);
            if (currNode && currNode.choices) {
                currNode.choices.forEach(c => {
                    if (!levels.has(c.targetNodeId)) {
                        levels.set(c.targetNodeId, currLvl + 1);
                        queue.push(c.targetNodeId);
                    }
                });
            }
        }

        // Group nodes by level
        const levelGroups = {};
        nodes.forEach(n => {
            const lvl = levels.get(n.id) || (n.isEnding ? 3 : 1);
            if (!levelGroups[lvl]) levelGroups[lvl] = [];
            levelGroups[lvl].push(n);
        });

        const maxLevel = Math.max(...Object.keys(levelGroups).map(Number), 1);
        const colWidth = (width - 120) / Math.max(maxLevel, 1);

        Object.entries(levelGroups).forEach(([lvlStr, groupNodes]) => {
            const lvl = parseInt(lvlStr);
            const x = 60 + (lvl * colWidth);
            const rowHeight = height / (groupNodes.length + 1);

            groupNodes.forEach((n, idx) => {
                const y = (idx + 1) * rowHeight;
                nodePositions.set(n.id, { x, y, node: n, radius: 26 });
            });
        });

        // State for dragging
        let draggedNode = null;
        let dragOffset = { x: 0, y: 0 };

        const redraw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Background Grid
            ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 24) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
            }
            for (let y = 0; y < height; y += 24) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
            }

            // Draw Edges (Directed Arrows)
            nodes.forEach(n => {
                const fromPos = nodePositions.get(n.id);
                if (!fromPos || !n.choices) return;

                n.choices.forEach(c => {
                    const toPos = nodePositions.get(c.targetNodeId);
                    if (!toPos) return;

                    const isPathActive = activePathNodeIds.includes(n.id) && activePathNodeIds.includes(c.targetNodeId);

                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = isPathActive ? "#fb4903" : "#000000";
                    ctx.lineWidth = isPathActive ? 3.5 : 2;

                    // Draw subtle curved edge
                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2;
                    ctx.moveTo(fromPos.x, fromPos.y);
                    ctx.lineTo(toPos.x, toPos.y);
                    ctx.stroke();

                    // Arrowhead
                    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
                    const arrowX = toPos.x - (toPos.radius + 2) * Math.cos(angle);
                    const arrowY = toPos.y - (toPos.radius + 2) * Math.sin(angle);

                    ctx.fillStyle = isPathActive ? "#fb4903" : "#000000";
                    ctx.beginPath();
                    ctx.moveTo(arrowX, arrowY);
                    ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY - 10 * Math.sin(angle - Math.PI / 6));
                    ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY - 10 * Math.sin(angle + Math.PI / 6));
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                });
            });

            // Draw Nodes (Vertices)
            nodes.forEach(n => {
                const pos = nodePositions.get(n.id);
                if (!pos) return;

                const isStart = n.id === startId;
                const isEnding = n.isEnding;
                const isActive = activePathNodeIds.includes(n.id);
                const isCurrent = activePathNodeIds.length > 0 && activePathNodeIds[activePathNodeIds.length - 1] === n.id;

                let fillColor = this.colorPalette.scene;
                if (isStart) fillColor = this.colorPalette.start;
                else if (isEnding) {
                    let et = (n.endingType || "good").toLowerCase();
                    fillColor = this.colorPalette[et] || this.colorPalette.good;
                }

                ctx.save();
                // Shadow
                ctx.beginPath();
                ctx.arc(pos.x + 3, pos.y + 3, pos.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#000000";
                ctx.fill();

                // Node Circle
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
                ctx.fillStyle = fillColor;
                ctx.fill();
                ctx.lineWidth = isCurrent ? 3.5 : 2;
                ctx.strokeStyle = isCurrent ? "#fb4903" : "#000000";
                ctx.stroke();

                // Pulse indicator for active node
                if (isCurrent) {
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, pos.radius + 6, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(251, 73, 3, 0.6)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Node Icon / Short Label
                ctx.fillStyle = "#000000";
                ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                let label = isStart ? "START" : isEnding ? "END" : `#${nodes.indexOf(n) + 1}`;
                ctx.fillText(label, pos.x, pos.y);

                // Node Title Label below
                ctx.font = "800 10px 'Plus Jakarta Sans', sans-serif";
                let truncatedTitle = n.title.length > 15 ? n.title.slice(0, 13) + ".." : n.title;
                ctx.fillText(truncatedTitle, pos.x, pos.y + pos.radius + 12);
                ctx.restore();
            });
        };

        // Canvas Interaction Handlers
        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        canvas.onmousedown = (e) => {
            const { x, y } = getMousePos(e);
            for (let [id, pos] of nodePositions.entries()) {
                const dist = Math.hypot(pos.x - x, pos.y - y);
                if (dist <= pos.radius + 4) {
                    draggedNode = pos;
                    dragOffset = { x: pos.x - x, y: pos.y - y };
                    if (onNodeSelect) onNodeSelect(pos.node);
                    break;
                }
            }
        };

        window.addEventListener("mousemove", (e) => {
            if (!draggedNode) return;
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(30, Math.min(width - 30, e.clientX - rect.left + dragOffset.x));
            const y = Math.max(30, Math.min(height - 30, e.clientY - rect.top + dragOffset.y));
            draggedNode.x = x;
            draggedNode.y = y;
            redraw();
        });

        window.addEventListener("mouseup", () => {
            draggedNode = null;
        });

        redraw();

        return {
            redraw,
            highlightPath: (pathIds) => {
                options.activePath = pathIds;
                redraw();
            }
        };
    }
}

// Global Singleton Export
window.graphStudio = new GraphStudio();
