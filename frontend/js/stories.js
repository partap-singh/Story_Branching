/**
 * Dynamic Story Engine - Story & Graph Studio Controller
 * Dual View (Cards + Interactive Canvas), AI Story Synthesizer,
 * Cascading Graph Edge Cleanup, and Topological Validation.
 */

let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../auth/login.html";
}

const urlParams = new URLSearchParams(window.location.search);
let currentStoryId = urlParams.get("id") || null;
let currentStory = null;
let activeStudioView = "cards"; // "cards" | "canvas"
let isStorySaving = false;

const COVER_PRESETS = {
    adventure: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
    cyberpunk: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    "sci-fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
    mystery: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1000&q=80",
    fantasy: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1000&q=80",
    horror: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1000&q=80"
};

function selectPresetCover(genre) {
    let input = document.getElementById("image");
    if (!input) return;
    let url = COVER_PRESETS[genre] || COVER_PRESETS.adventure;
    input.value = url;
    updateCoverPreview();
}

function updateCoverPreview() {
    let input = document.getElementById("image");
    let container = document.getElementById("coverPreviewContainer");
    let img = document.getElementById("coverPreviewImg");
    if (!input || !container || !img) return;

    let val = input.value.trim();
    if (val) {
        img.src = val;
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }
}

function onGenreSelectChange(genre) {
    let input = document.getElementById("image");
    if (input && !input.value.trim() && COVER_PRESETS[genre]) {
        input.value = COVER_PRESETS[genre];
        updateCoverPreview();
    }
}

async function initPage() {
    let nodeHidden = document.getElementById("nodeHidden");
    let activeId = new URLSearchParams(window.location.search).get("id") || currentStoryId;

    if (activeId) {
        try {
            let story = await window.dataService.getStoryById(activeId);
            if (story) {
                currentStory = story;
                currentStoryId = story.id;
                if (document.getElementById("storyIdInput")) document.getElementById("storyIdInput").value = story.id;
                localStorage.setItem("currentStory", JSON.stringify(currentStory));

                if (document.getElementById("story")) document.getElementById("story").value = currentStory.title || "";
                if (document.getElementById("genre")) document.getElementById("genre").value = currentStory.genre || "";
                if (document.getElementById("status")) document.getElementById("status").value = currentStory.status || "draft";
                if (document.getElementById("storyDescr")) document.getElementById("storyDescr").value = currentStory.description || "";
                if (document.getElementById("image")) {
                    document.getElementById("image").value = currentStory.imageURL || currentStory.coverImage || "";
                    updateCoverPreview();
                }

                let heading = document.getElementById("editorPageHeading");
                if (heading) heading.textContent = `EDIT STORY: ${currentStory.title.toUpperCase()}`;

                showNodes(currentStory);
                return;
            }
        } catch (err) {
            console.error("Error loading story in studio:", err);
        }
    }

    // New Story Mode
    localStorage.removeItem("currentStory");
    currentStory = null;
    currentStoryId = null;
    if (document.getElementById("storyIdInput")) document.getElementById("storyIdInput").value = "";

    if (document.getElementById("storyForm")) document.getElementById("storyForm").reset();
    updateCoverPreview();

    if (nodeHidden) {
        nodeHidden.innerHTML = `
            <div style="border: 3px dashed #000; border-radius: 24px; padding: 48px 24px; text-align: center; background: #ffffff; box-shadow: 4px 4px 0px #000;">
                <h3 style="font-family: var(--font-display); font-size: 24px; margin-bottom: 10px;">NO SCENE NODES ADDED</h3>
                <p style="font-weight: 700; font-size: 15px; color: #444;">
                    Save Story Metadata first, or click "+ Add Scene Node" / "✨ AI Auto-Gen Scene" above.
                </p>
            </div>
        `;
    }
}

// 1. Handle Story Metadata Submit
async function handleStory(event) {
    if (event) event.preventDefault();
    if (isStorySaving) return;

    let storyTitle = document.getElementById("story").value.trim();
    let genre = document.getElementById("genre").value;
    let status = document.getElementById("status").value;
    let description = document.getElementById("storyDescr").value.trim();
    let imageURL = document.getElementById("image").value.trim();
    let hiddenId = document.getElementById("storyIdInput") ? document.getElementById("storyIdInput").value : null;

    if (!storyTitle) {
        alert("Please enter a Story Title.");
        document.getElementById("story").focus();
        return;
    }

    if (!imageURL) {
        alert("Cover Image URL is required! Please select a quick preset or paste an image link.");
        document.getElementById("image").focus();
        return;
    }

    let existingId = hiddenId || currentStoryId || (currentStory ? currentStory.id : null);

    isStorySaving = true;
    try {
        let storyObject = {
            id: existingId ? existingId : `story_${Date.now()}`,
            title: storyTitle,
            author: (currentStory && currentStory.author) ? currentStory.author : (user ? (user.name || "Explorer") : "Admin"),
            authorId: (currentStory && currentStory.authorId) ? currentStory.authorId : (user ? (user.id || user.email) : "usr_admin_1"),
            genre: genre || "adventure",
            status: status || "draft",
            description: description,
            imageURL: imageURL,
            nodes: (currentStory && currentStory.nodes) ? currentStory.nodes : [],
            startNodeId: (currentStory && currentStory.startNodeId) ? currentStory.startNodeId : null
        };

        let saved = await window.dataService.saveStory(storyObject);
        currentStory = saved;
        currentStoryId = saved.id;
        if (document.getElementById("storyIdInput")) {
            document.getElementById("storyIdInput").value = saved.id;
        }
        localStorage.setItem("currentStory", JSON.stringify(currentStory));

        window.history.replaceState({}, "", `add_stories.html?id=${saved.id}`);

        let heading = document.getElementById("editorPageHeading");
        if (heading) heading.textContent = `EDIT STORY: ${currentStory.title.toUpperCase()}`;

        alert("Story metadata saved successfully!");
        showNodes(currentStory);
    } catch (e) {
        console.error("Save story error:", e);
        alert("Failed to save story. Please try again.");
    } finally {
        isStorySaving = false;
    }
}

async function quickSaveStatus(newStatus) {
    if (!currentStory) {
        let storyTitle = document.getElementById("story").value.trim();
        let imageURL = document.getElementById("image").value.trim();
        if (!storyTitle) {
            alert("Please provide at least a Story Title before saving.");
            return;
        }
        if (!imageURL) {
            alert("Cover Image URL is required! Please select a preset or paste an image link.");
            return;
        }
        document.getElementById("status").value = newStatus;
        await handleStory(null);
        return;
    }

    currentStory.status = newStatus;
    if (document.getElementById("status")) document.getElementById("status").value = newStatus;

    await window.dataService.saveStory(currentStory);
    localStorage.setItem("currentStory", JSON.stringify(currentStory));
    alert(`Story successfully saved as: ${newStatus.toUpperCase()}`);
    showNodes(currentStory);
}
// 2. Handle Node Submit
async function handleNode(event) {
    if (event) event.preventDefault();

    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    if (!activeStory) {
        let titleInput = document.getElementById("story");
        if (titleInput && titleInput.value.trim()) {
            await handleStory(null);
            activeStory = currentStory;
        } else {
            alert("Please save Story Metadata first!");
            return;
        }
    }

    let nodeTitle = document.getElementById("nodeTitle").value.trim();
    let nodeText = document.getElementById("nodeText").value.trim();
    let nodeLocation = document.getElementById("nodeLocation").value.trim();
    let nodeCharacters = document.getElementById("nodeCharacters").value.trim();
    let isEnding = document.getElementById("isEnding").checked;
    let endingType = document.getElementById("endingType").value;
    let editingNodeId = document.getElementById("editingNodeId").value;

    let charArray = nodeCharacters.split(",").map(c => c.trim()).filter(Boolean);

    if (editingNodeId) {
        let node = activeStory.nodes.find(n => n.id === editingNodeId);
        if (!node) {
            alert("Node to edit not found.");
            return;
        }
        node.title = nodeTitle;
        node.text = nodeText;
        node.location = nodeLocation;
        node.characters = charArray;
        node.isEnding = isEnding;
        node.endingType = isEnding ? endingType : null;
        if (isEnding) {
            node.choices = [];
        }
    } else {
        let newNodeId = `node_${Date.now()}`;
        let newNode = {
            id: newNodeId,
            title: nodeTitle,
            text: nodeText,
            location: nodeLocation,
            characters: charArray,
            isEnding: isEnding,
            endingType: isEnding ? endingType : null,
            choices: []
        };

        if (!activeStory.nodes) activeStory.nodes = [];
        activeStory.nodes.push(newNode);

        if (!activeStory.startNodeId || activeStory.nodes.length === 1) {
            activeStory.startNodeId = newNodeId;
        }
    }

    currentStory = activeStory;
    await window.dataService.saveStory(currentStory);
    localStorage.setItem("currentStory", JSON.stringify(currentStory));

    closeNodeModal();
    showNodes(currentStory);
}

// 3. Handle Choice Submit
async function handleChoice(event) {
    if (event) event.preventDefault();

    let fromNodeId = document.getElementById("choiceFromNodeId").value;
    let choiceText = document.getElementById("choiceText").value.trim();
    let targetNodeId = document.getElementById("choiceTargetNode").value;
    let editingChoiceId = document.getElementById("editingChoiceId").value;

    if (!fromNodeId || !choiceText || !targetNodeId) {
        alert("Please fill in all choice fields.");
        return;
    }

    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    let node = activeStory.nodes.find(n => n.id === fromNodeId);
    if (!node) return;

    if (!node.choices) node.choices = [];

    if (editingChoiceId) {
        let choice = node.choices.find(c => c.id === editingChoiceId);
        if (choice) {
            choice.text = choiceText;
            choice.targetNodeId = targetNodeId;
        }
    } else {
        node.choices.push({
            id: `choice_${Date.now()}`,
            text: choiceText,
            targetNodeId: targetNodeId
        });
    }

    currentStory = activeStory;
    await window.dataService.saveStory(currentStory);
    localStorage.setItem("currentStory", JSON.stringify(currentStory));

    closeChoiceModal();
    showNodes(currentStory);
}

// 4. Set as Starting Node
async function setAsStartingNode(nodeId) {
    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    if (!activeStory) return;

    activeStory.startNodeId = nodeId;
    currentStory = activeStory;
    await window.dataService.saveStory(currentStory);
    localStorage.setItem("currentStory", JSON.stringify(currentStory));

    alert("Starting scene updated!");
    showNodes(currentStory);
}

// 5. Delete Node with Cascading Edge Cleanup
async function deleteNode(nodeId) {
    if (!confirm("Delete this scene node? All outgoing choices and incoming branches pointing to this node will also be cleaned up.")) return;

    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    if (!activeStory) return;

    // Filter out node
    activeStory.nodes = activeStory.nodes.filter(n => n.id !== nodeId);

    // Cascading Edge Cleanup: remove any choices targeting this deleted node
    activeStory.nodes.forEach(n => {
        if (n.choices) {
            n.choices = n.choices.filter(c => c.targetNodeId !== nodeId);
        }
    });

    if (activeStory.startNodeId === nodeId) {
        activeStory.startNodeId = activeStory.nodes.length > 0 ? activeStory.nodes[0].id : null;
    }

    currentStory = activeStory;
    await window.dataService.saveStory(currentStory);
    localStorage.setItem("currentStory", JSON.stringify(currentStory));

    showNodes(currentStory);
}

// 6. Delete Choice Edge
async function deleteChoice(fromNodeId, choiceId) {
    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    let node = activeStory.nodes.find(n => n.id === fromNodeId);
    if (!node || !node.choices) return;

    node.choices = node.choices.filter(c => c.id !== choiceId);

    currentStory = activeStory;
    await window.dataService.saveStory(currentStory);
    localStorage.setItem("currentStory", JSON.stringify(currentStory));

    showNodes(currentStory);
}

// 7. Render Scene Nodes & Graph
function showNodes(story) {
    let nodeHidden = document.getElementById("nodeHidden");
    let canvasContainer = document.getElementById("interactiveCanvasContainer");
    if (!nodeHidden) return;

    if (!story || !story.nodes || story.nodes.length === 0) {
        nodeHidden.innerHTML = `
            <div style="border: 3px dashed #000; border-radius: 24px; padding: 48px 24px; text-align: center; background: #ffffff; box-shadow: 4px 4px 0px #000;">
                <h3 style="font-family: var(--font-display); font-size: 24px; margin-bottom: 10px;">NO SCENE NODES CREATED</h3>
                <p style="font-weight: 700; font-size: 15px; color: #444;">
                    Click "+ Add Scene Node" or "✨ AI Auto-Gen Scene" above to add your first branching scene.
                </p>
            </div>
        `;
        if (canvasContainer) canvasContainer.innerHTML = `<p style="text-align: center; padding: 40px; font-weight: 800;">Add scenes to visualize graph canvas.</p>`;
        return;
    }

    // Run Graph Topological Diagnostics
    let audit = window.graphStudio.analyzeGraph(story);

    let orphanWarningBanner = "";
    if (audit.unreachableNodeIds && audit.unreachableNodeIds.length > 0) {
        orphanWarningBanner = `
            <div style="background: #fee2e2; border: 3px solid #ef4444; border-radius: 16px; padding: 14px 20px; margin-bottom: 20px; box-shadow: 3px 3px 0 #ef4444;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #b91c1c; margin-bottom: 4px;">
                    <span style="font-size: 18px;">⚠️</span>
                    <span>ORPHAN NODE VALIDATION WARNING (${audit.unreachableNodeIds.length} Unreachable Scene(s) Detected)</span>
                </div>
                <p style="font-size: 13px; font-weight: 700; color: #7f1d1d; margin: 0;">
                    The following scenes cannot be reached from the Start Scene: 
                    <strong>${audit.unreachableNodeIds.map(id => { let n = story.nodes.find(item => item.id === id); return n ? n.title : id; }).join(", ")}</strong>.
                    Add a choice pointing to them or set one as the Start Scene to resolve orphan status.
                </p>
            </div>
        `;
    }

    let diagnosticsBar = `
        <div style="background: #ffffff; border: 2px solid #000; border-radius: 16px; padding: 14px 20px; margin-bottom: 20px; box-shadow: 3px 3px 0px #000; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="nav-pill" style="font-size: 12px; padding: 4px 12px; background: #dceeff;">VERTICES: ${audit.metrics.nodeCount}</span>
                <span class="nav-pill" style="font-size: 12px; padding: 4px 12px; background: #ffd731;">EDGES: ${audit.metrics.edgeCount}</span>
                <span class="nav-pill" style="font-size: 12px; padding: 4px 12px; background: ${audit.isValid && (!audit.unreachableNodeIds || audit.unreachableNodeIds.length === 0) ? '#34d399' : '#f87171'};">
                    ${audit.isValid && (!audit.unreachableNodeIds || audit.unreachableNodeIds.length === 0) ? '✅ NO ORPHAN NODES' : '⚠️ ORPHAN / TOPOLOGY WARNINGS'}
                </span>
            </div>
            <span style="font-size: 12px; font-weight: 800; color: #555;">REACHABILITY: ${audit.metrics.reachabilityScore}</span>
        </div>
    `;

    // Render Cards View
    let cardsHtml = orphanWarningBanner + diagnosticsBar + `<div class="nodes-grid">` + story.nodes.map((node, index) => {
        let isStart = story.startNodeId === node.id || (index === 0 && !story.startNodeId);
        let isOrphan = audit.unreachableNodeIds && audit.unreachableNodeIds.includes(node.id) && !isStart;

        let startBadge = isStart
            ? `<span style="background: var(--color-sunburst, #ffd731); color: #000; border: 2px solid #000; border-radius: 100px; padding: 2px 10px; font-size: 11px; font-weight: 800;">⭐ START SCENE</span>`
            : `<button type="button" class="nav-pill" style="font-size: 11px; padding: 2px 10px;" onclick="setAsStartingNode('${node.id}')">Set as Start</button>`;

        let orphanBadge = isOrphan
            ? `<span style="background: #f87171; color: #fff; border: 2px solid #000; border-radius: 100px; padding: 2px 10px; font-size: 11px; font-weight: 800;">⚠️ ORPHAN NODE</span>`
            : "";

        let endBadge = node.isEnding
            ? `<span style="background: #34d399; color: #000; border: 2px solid #000; border-radius: 100px; padding: 2px 10px; font-size: 11px; font-weight: 800;">🏁 ENDING (${(node.endingType || 'GOOD').toUpperCase()})</span>`
            : "";

        let cardBorder = isOrphan ? "3px solid #ef4444" : "3px solid #000";

        let choicesList = (node.choices && node.choices.length > 0)
            ? node.choices.map(c => {
                let target = story.nodes.find(n => n.id === c.targetNodeId);
                let targetTitle = target ? target.title : "<span style='color:red;'>⚠️ Broken Link</span>";
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 2px solid #000; border-radius: 12px; padding: 8px 12px; margin-bottom: 6px; box-shadow: 2px 2px 0px #000;">
                        <span style="font-size: 13px; font-weight: 700;">👉 "${c.text}" &rarr; <strong>${targetTitle}</strong></span>
                        <div style="display: flex; gap: 4px;">
                            <button type="button" class="nav-pill" style="font-size: 10px; padding: 2px 6px;" onclick="openEditChoiceModal('${node.id}', '${c.id}')">✏️</button>
                            <button type="button" class="nav-pill" style="font-size: 10px; padding: 2px 6px; background: #f87171;" onclick="deleteChoice('${node.id}', '${c.id}')">🗑️</button>
                        </div>
                    </div>
                `;
            }).join("")
            : `<p style="font-size: 12px; font-style: italic; color: #666; font-weight: 700;">No outgoing choices connected.</p>`;

        return `
            <div class="node-card" style="background: #fff; border: ${cardBorder}; border-radius: 20px; padding: 22px; box-shadow: 5px 5px 0px #000;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 6px;">
                    <span style="font-weight: 900; font-size: 13px; color: var(--color-voltage-violet);">SCENE #${index + 1}</span>
                    <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        ${startBadge}
                        ${orphanBadge}
                        ${endBadge}
                    </div>
                </div>
                <h3 style="font-family: var(--font-display); font-size: 20px; margin-bottom: 8px; text-transform: uppercase;">${node.title}</h3>
                <p style="font-size: 14px; line-height: 1.5; font-weight: 600; color: #333; margin-bottom: 16px; max-height: 80px; overflow-y: auto;">
                    ${node.text}
                </p>

                <!-- Choices Box -->
                <div style="background: var(--color-sky-wash, #dceeff); border: 2px solid #000; border-radius: 14px; padding: 12px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 800; font-size: 12px; text-transform: uppercase;">Directed Choices (${node.choices ? node.choices.length : 0})</span>
                        ${!node.isEnding ? `
                            <button type="button" class="nav-pill" style="font-size: 11px; padding: 3px 10px; background: #fff;" onclick="openAddChoiceModal('${node.id}')">
                                + Add Choice
                            </button>
                        ` : ''}
                    </div>
                    ${choicesList}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #eee; padding-top: 12px;">
                    <button type="button" class="nav-pill" style="font-size: 12px; padding: 6px 14px; background: var(--color-yellow);" onclick="openEditNodeModal('${node.id}')">
                        ✏️ Edit Scene
                    </button>
                    <button type="button" class="nav-pill" style="font-size: 12px; padding: 6px 14px; background: #f87171; color: #000;" onclick="deleteNode('${node.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join("") + `</div>`;

    nodeHidden.innerHTML = cardsHtml;

    // Render Canvas View
    if (canvasContainer) {
        window.graphStudio.renderCanvas(canvasContainer, story, {
            width: Math.min(1000, window.innerWidth - 80),
            height: 480,
            onNodeSelect: (node) => {
                openEditNodeModal(node.id);
            }
        });
    }
}

function switchView(view) {
    activeStudioView = view;
    let tabCards = document.getElementById("tabCardsView");
    let tabCanvas = document.getElementById("tabCanvasView");
    let cardsContainer = document.getElementById("nodeHidden");
    let canvasSection = document.getElementById("canvasViewSection");

    if (view === "canvas") {
        if (tabCards) tabCards.classList.remove("active");
        if (tabCanvas) tabCanvas.classList.add("active");
        if (cardsContainer) cardsContainer.style.display = "none";
        if (canvasSection) canvasSection.style.display = "block";

        let story = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
        if (story) {
            let container = document.getElementById("interactiveCanvasContainer");
            window.graphStudio.renderCanvas(container, story, {
                width: Math.min(1000, window.innerWidth - 80),
                height: 520,
                onNodeSelect: (node) => openEditNodeModal(node.id)
            });
        }
    } else {
        if (tabCards) tabCards.classList.add("active");
        if (tabCanvas) tabCanvas.classList.remove("active");
        if (cardsContainer) cardsContainer.style.display = "block";
        if (canvasSection) canvasSection.style.display = "none";
    }
}

/* =====================================================
   MODAL CONTROLLERS & GRAPH HELPERS
===================================================== */

function openNodeModal() {
    let modal = document.getElementById("nodeModal");
    if (!modal) return;

    if (document.getElementById("editingNodeId")) document.getElementById("editingNodeId").value = "";
    if (document.getElementById("nodeTitle")) document.getElementById("nodeTitle").value = "";
    if (document.getElementById("nodeText")) document.getElementById("nodeText").value = "";
    if (document.getElementById("nodeLocation")) document.getElementById("nodeLocation").value = "";
    if (document.getElementById("nodeCharacters")) document.getElementById("nodeCharacters").value = "";
    if (document.getElementById("isEnding")) document.getElementById("isEnding").checked = false;
    
    let endingGroup = document.getElementById("endingTypeGroup");
    if (endingGroup) endingGroup.style.display = "none";

    let modalHeading = document.getElementById("nodeModalHeading");
    if (modalHeading) modalHeading.textContent = "ADD SCENE NODE";

    modal.classList.remove("hidden");
}

function openEditNodeModal(nodeId) {
    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    let node = activeStory ? activeStory.nodes.find(n => n.id === nodeId) : null;
    if (!node) return;

    if (document.getElementById("editingNodeId")) document.getElementById("editingNodeId").value = node.id;
    if (document.getElementById("nodeTitle")) document.getElementById("nodeTitle").value = node.title || "";
    if (document.getElementById("nodeText")) document.getElementById("nodeText").value = node.text || "";
    if (document.getElementById("nodeLocation")) document.getElementById("nodeLocation").value = node.location || "";
    if (document.getElementById("nodeCharacters")) document.getElementById("nodeCharacters").value = node.characters ? node.characters.join(", ") : "";
    if (document.getElementById("isEnding")) document.getElementById("isEnding").checked = node.isEnding || false;

    let endingGroup = document.getElementById("endingTypeGroup");
    if (endingGroup) endingGroup.style.display = node.isEnding ? "block" : "none";
    if (document.getElementById("endingType")) document.getElementById("endingType").value = node.endingType || "good";

    let modalHeading = document.getElementById("nodeModalHeading");
    if (modalHeading) modalHeading.textContent = `EDIT SCENE: ${node.title.toUpperCase()}`;

    let modal = document.getElementById("nodeModal");
    if (modal) modal.classList.remove("hidden");
}

function closeNodeModal() {
    let modal = document.getElementById("nodeModal");
    if (modal) modal.classList.add("hidden");
}

function toggleEndingType(checkbox) {
    let group = document.getElementById("endingTypeGroup");
    if (group) group.style.display = checkbox.checked ? "block" : "none";
}

function openAddChoiceModal(fromNodeId) {
    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    let node = activeStory ? activeStory.nodes.find(n => n.id === fromNodeId) : null;
    if (!node) return;

    let targetSelect = document.getElementById("choiceTargetNode");
    if (targetSelect) {
        targetSelect.innerHTML = `<option value="">-- Select Destination Scene --</option>` +
            activeStory.nodes
                .filter(n => n.id !== fromNodeId)
                .map(n => `<option value="${n.id}">${n.title} (${n.isEnding ? 'Ending' : 'Scene'})</option>`)
                .join("");
    }

    if (document.getElementById("choiceFromNodeId")) document.getElementById("choiceFromNodeId").value = fromNodeId;
    if (document.getElementById("editingChoiceId")) document.getElementById("editingChoiceId").value = "";
    if (document.getElementById("choiceText")) document.getElementById("choiceText").value = "";

    let modalHeading = document.getElementById("choiceModalHeading");
    if (modalHeading) modalHeading.textContent = `ADD CHOICE FROM: ${node.title.toUpperCase()}`;

    let modal = document.getElementById("choiceModal");
    if (modal) modal.classList.remove("hidden");
}

function openEditChoiceModal(fromNodeId, choiceId) {
    let activeStory = JSON.parse(localStorage.getItem("currentStory")) || currentStory;
    let node = activeStory ? activeStory.nodes.find(n => n.id === fromNodeId) : null;
    if (!node) return;

    let choice = node.choices ? node.choices.find(c => c.id === choiceId) : null;
    if (!choice) return;

    let targetSelect = document.getElementById("choiceTargetNode");
    targetSelect.innerHTML = `<option value="">-- Select Destination Scene --</option>` +
        activeStory.nodes
            .filter(n => n.id !== fromNodeId)
            .map(n => `<option value="${n.id}" ${n.id === choice.targetNodeId ? 'selected' : ''}>${n.title}</option>`)
            .join("");

    document.getElementById("choiceFromNodeId").value = fromNodeId;
    document.getElementById("editingChoiceId").value = choice.id;
    document.getElementById("choiceText").value = choice.text;

    let suggestionsContainer = document.getElementById("aiChoiceSuggestions");
    if (suggestionsContainer) suggestionsContainer.innerHTML = "";

    let modal = document.getElementById("choiceModal");
    if (modal) modal.classList.remove("hidden");
}

function closeChoiceModal() {
    let modal = document.getElementById("choiceModal");
    if (modal) modal.classList.add("hidden");
}

/* AI Full Tree Auto-Synthesizer */
function openAITreeModal() {
    let modal = document.getElementById("aiTreeModal");
    if (modal) modal.classList.remove("hidden");
}

function closeAITreeModal() {
    let modal = document.getElementById("aiTreeModal");
    if (modal) modal.classList.add("hidden");
}

async function runAITreeSynthesis() {
    let title = document.getElementById("aiTreeTitle").value.trim() || "AI Generated Branching Universe";
    let genre = document.getElementById("aiTreeGenre").value || "sci-fi";
    let btn = document.getElementById("generateTreeBtn");

    if (btn) btn.textContent = "⚡ Synthesizing Graph Tree...";

    try {
        let synthesizedStory = await window.aiEngine.autoSynthesizeStoryTree({
            title: title,
            genre: genre
        });

        synthesizedStory.author = user ? (user.name || "Explorer") : "Admin";
        synthesizedStory.authorId = user ? (user.id || user.email) : "usr_admin_1";

        let saved = await window.dataService.saveStory(synthesizedStory);
        currentStory = saved;
        currentStoryId = saved.id;
        if (document.getElementById("storyIdInput")) document.getElementById("storyIdInput").value = saved.id;
        localStorage.setItem("currentStory", JSON.stringify(currentStory));

        window.history.replaceState({}, "", `add_stories.html?id=${saved.id}`);

        // Fill form fields
        if (document.getElementById("story")) document.getElementById("story").value = currentStory.title;
        if (document.getElementById("genre")) document.getElementById("genre").value = currentStory.genre;
        if (document.getElementById("storyDescr")) document.getElementById("storyDescr").value = currentStory.description;
        if (document.getElementById("image")) {
            document.getElementById("image").value = currentStory.imageURL;
            updateCoverPreview();
        }

        closeAITreeModal();
        alert("Complete branching story tree synthesized successfully!");
        showNodes(currentStory);
    } catch (e) {
        console.error("AI Synthesis error:", e);
        alert("Error during story synthesis.");
    } finally {
        if (btn) btn.textContent = "⚡ Auto-Synthesize Story Tree";
    }
}

// Single initialization on DOM load
document.addEventListener("DOMContentLoaded", initPage);
