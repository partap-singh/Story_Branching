/**
 * Dynamic Story Engine - Admin Management Subsystem
 * Story CRUD, Cloning, Graph Diagnostics Auditor, and Analytics.
 */

function redirectStory() {
    window.location.href = "add_stories.html";
}

function editStory(storyId) {
    window.location.href = `add_stories.html?id=${storyId}`;
}

async function cloneStory(storyId) {
    let story = await window.dataService.getStoryById(storyId);
    if (!story) return;

    // Deep clone with fresh IDs for all nodes and choices
    let idMap = new Map();
    (story.nodes || []).forEach(n => {
        idMap.set(n.id, `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
    });

    let clonedNodes = (story.nodes || []).map(n => {
        let newId = idMap.get(n.id);
        let newChoices = (n.choices || []).map(c => ({
            id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: c.text,
            targetNodeId: idMap.get(c.targetNodeId) || c.targetNodeId
        }));

        return {
            ...n,
            id: newId,
            choices: newChoices
        };
    });

    let newStartNodeId = idMap.get(story.startNodeId) || (clonedNodes[0] ? clonedNodes[0].id : null);

    let clonedStory = {
        ...story,
        id: `story_${Date.now()}`,
        title: `${story.title} (Clone)`,
        status: "draft",
        nodes: clonedNodes,
        startNodeId: newStartNodeId
    };

    await window.dataService.saveStory(clonedStory);
    alert(`Cloned '${story.title}' successfully as a new draft!`);
    loadStories();
}

async function deleteStory(storyId) {
    if (!confirm("Are you sure you want to permanently delete this story?")) return;

    await window.dataService.deleteStory(storyId);
    alert("Story deleted successfully!");
    loadStories();
}

async function auditGraph(storyId) {
    let story = await window.dataService.getStoryById(storyId);
    if (!story) return;

    let analysis = window.graphStudio.analyzeGraph(story);
    let modal = document.getElementById("diagnosticsModal");
    let title = document.getElementById("diagnosticsTitle");
    let body = document.getElementById("diagnosticsBody");

    if (!modal || !body) return;

    title.textContent = `GRAPH AUDIT: ${story.title.toUpperCase()}`;

    let statusBg = analysis.status === "EXCELLENT" ? "#34d399" : analysis.status === "GOOD_WITH_WARNINGS" ? "#ffd731" : "#f87171";

    let errorsHtml = analysis.errors.length > 0 
        ? `<div style="background:#fee2e2; border:2px solid #ef4444; border-radius:12px; padding:12px; margin-bottom:12px;">
            <strong style="color:#b91c1c;">⚠️ Critical Topology Errors (${analysis.errors.length}):</strong>
            <ul style="margin:6px 0 0 18px; color:#7f1d1d; font-size:13px;">
                ${analysis.errors.map(e => `<li>${e}</li>`).join("")}
            </ul>
           </div>`
        : "";

    let warningsHtml = analysis.warnings.length > 0
        ? `<div style="background:#fef3c7; border:2px solid #f59e0b; border-radius:12px; padding:12px; margin-bottom:12px;">
            <strong style="color:#b45309;">⚡ Graph Warnings (${analysis.warnings.length}):</strong>
            <ul style="margin:6px 0 0 18px; color:#78350f; font-size:13px;">
                ${analysis.warnings.map(w => `<li>${w}</li>`).join("")}
            </ul>
           </div>`
        : "";

    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
            <span style="background:${statusBg}; padding:6px 16px; border-radius:100px; border:2px solid #000; font-weight:800; font-size:13px;">
                STATUS: ${analysis.status}
            </span>
            <span style="font-weight:800; font-size:13px;">Reachability: ${analysis.metrics.reachabilityScore}</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
            <div style="background:#f8f8f8; border:2px solid #000; border-radius:12px; padding:10px; text-align:center;">
                <div style="font-family:var(--font-display); font-size:20px;">${analysis.metrics.nodeCount}</div>
                <div style="font-size:11px; font-weight:800; text-transform:uppercase;">Vertices (Nodes)</div>
            </div>
            <div style="background:#f8f8f8; border:2px solid #000; border-radius:12px; padding:10px; text-align:center;">
                <div style="font-family:var(--font-display); font-size:20px;">${analysis.metrics.edgeCount}</div>
                <div style="font-size:11px; font-weight:800; text-transform:uppercase;">Edges (Choices)</div>
            </div>
            <div style="background:#f8f8f8; border:2px solid #000; border-radius:12px; padding:10px; text-align:center;">
                <div style="font-family:var(--font-display); font-size:20px;">${analysis.metrics.branchingFactor}</div>
                <div style="font-size:11px; font-weight:800; text-transform:uppercase;">Branch Factor</div>
            </div>
            <div style="background:#f8f8f8; border:2px solid #000; border-radius:12px; padding:10px; text-align:center;">
                <div style="font-family:var(--font-display); font-size:20px;">${analysis.metrics.maxDepth}</div>
                <div style="font-size:11px; font-weight:800; text-transform:uppercase;">Max Story Depth</div>
            </div>
            <div style="background:#f8f8f8; border:2px solid #000; border-radius:12px; padding:10px; text-align:center;">
                <div style="font-family:var(--font-display); font-size:20px;">${analysis.metrics.narrativeEntropy}</div>
                <div style="font-size:11px; font-weight:800; text-transform:uppercase;">Entropy (H)</div>
            </div>
        </div>

        ${errorsHtml}
        ${warningsHtml}

        ${analysis.errors.length === 0 && analysis.warnings.length === 0 ? `
            <div style="background:#ecfdf5; border:2px solid #10b981; border-radius:12px; padding:14px; text-align:center; font-weight:800; color:#065f46;">
                ✨ Complete Graph Structural Health: Directed Acyclic Structure is fully reachable without dead ends!
            </div>
        ` : ''}
    `;

    modal.classList.remove("hidden");
}

function closeDiagnosticsModal() {
    let modal = document.getElementById("diagnosticsModal");
    if (modal) modal.classList.add("hidden");
}

async function exportDatabaseJson() {
    let stories = await window.dataService.getStories();
    let dataStr = JSON.stringify(stories, null, 2);
    let blob = new Blob([dataStr], { type: "application/json" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Story_Branching_Dataset_${Date.now()}.json`;
    a.click();
}

async function restoreSampleStory() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Admin") {
        alert("Only Administrator accounts can restore sample datasets.");
        return;
    }

    if (!confirm("This will restore all 4 pre-built high-concept genre stories (Fantasy, Cyberpunk, Sci-Fi, Mystery). Proceed?")) return;

    await window.dataService.restoreSampleStories();
    alert("Sample multi-genre story library restored successfully!");
    loadStories();
}

async function loadStories() {
    let stories = await window.dataService.getStories();
    let container = document.getElementById("storiesContainer");
    if (!container) return;

    // Compute Analytics
    let totalStories = stories.length;
    let totalNodes = 0;
    let totalEdges = 0;
    let publishedCount = 0;

    stories.forEach(s => {
        if (s.status === "published") publishedCount++;
        if (s.nodes) {
            totalNodes += s.nodes.length;
            s.nodes.forEach(n => {
                if (n.choices) totalEdges += n.choices.length;
            });
        }
    });

    let avgBranching = totalNodes > 0 ? (totalEdges / totalNodes).toFixed(2) : "0.0";

    if (document.getElementById("statTotalStories")) document.getElementById("statTotalStories").textContent = totalStories;
    if (document.getElementById("statTotalNodes")) document.getElementById("statTotalNodes").textContent = totalNodes;
    if (document.getElementById("statAvgBranches")) document.getElementById("statAvgBranches").textContent = avgBranching;
    if (document.getElementById("statPublishedStories")) document.getElementById("statPublishedStories").textContent = publishedCount;

    if (stories.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; border: 3px dashed #000; border-radius: 24px; padding: 48px 24px; text-align: center; background: #fff; box-shadow: 6px 6px 0px #000;">
                <h2 style="font-family: var(--font-display); font-size: 28px; margin-bottom: 12px;">NO STORIES CREATED YET</h2>
                <p style="font-weight: 700; margin-bottom: 20px;">Restore sample universe presets or create your first story.</p>
                <button onclick="restoreSampleStory()" class="primary-btn" style="width: auto; padding: 12px 28px;">🔄 Restore 4 Presets</button>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    stories.forEach((element) => {
        let nodeCount = element.nodes ? element.nodes.length : 0;
        let statusClass = element.status === "published" ? "status-published" : "status-draft";
        let statusText = element.status === "published" ? "PUBLISHED" : "DRAFT";

        let coverImg = element.imageURL || element.coverImage
            ? `<img src="${element.imageURL || element.coverImage}" alt="${element.title}" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'">`
            : `<div class="no-image" style="display: flex; align-items: center; justify-content: center; height: 100%; font-weight: 800; color: #666;">No Cover Image</div>`;

        container.innerHTML += `
            <div class="story-card">
                <div class="story-card-image">
                    ${coverImg}
                </div>
                <div class="story-card-content">
                    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;">
                        <span class="badge-genre">${(element.genre || "General").toUpperCase()}</span>
                        <span class="badge-status ${statusClass}">${statusText}</span>
                    </div>
                    <h3>${element.title || "Untitled Story"}</h3>
                    <div class="author-tag" style="margin-bottom: 10px;">BY ${(element.author || "ADMIN").toUpperCase()}</div>
                    <p class="story-description">
                        ${element.description || "No description provided."}
                    </p>
                    <div class="stat-lockup-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span><strong>${nodeCount}</strong> SCENES / NODES</span>
                    </div>
                </div>
                <div class="story-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 14px;">
                    <button class="secondary-btn" onclick="editStory('${element.id}')" title="Edit Story & Scene Graph">
                        ✏️ Edit Graph
                    </button>
                    <button class="secondary-btn" onclick="auditGraph('${element.id}')" title="Graph Theory Topology Audit">
                        🩺 Audit Graph
                    </button>
                    <button class="secondary-btn" onclick="cloneStory('${element.id}')" title="Duplicate Story">
                        📋 Clone
                    </button>
                    <button class="danger-btn delete-btn" onclick="deleteStory('${element.id}')" title="Delete Story">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    });
}

function handleLogout() {
    localStorage.removeItem("user");
    window.location.href = "../auth/login.html";
}

function renderAdminProfileHeader() {
    let navAuthContainer = document.getElementById("navAuthContainer");
    let user = JSON.parse(localStorage.getItem("user"));
    if (!navAuthContainer || !user) return;

    let initial = user.name ? user.name.charAt(0).toUpperCase() : "A";

    navAuthContainer.innerHTML = `
        <div class="user-profile-menu-container">
            <button type="button" class="profile-menu-btn" onclick="toggleProfileDropdown(event)">
                <span class="user-avatar">${initial}</span>
                <span class="user-name-label">${user.name || 'Admin'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-left: 2px;"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div id="profileDropdown" class="profile-dropdown-menu hidden" onclick="event.stopPropagation()">
                <div class="profile-dropdown-header">
                    <strong>${user.name || 'Admin'}</strong>
                    <div style="display: flex; gap: 6px; margin-top: 4px; align-items: center;">
                        <span class="user-role-badge">ADMINISTRATOR</span>
                    </div>
                </div>
                <div class="profile-dropdown-links">
                    <a href="admin.html" class="dropdown-item">Admin Dashboard</a>
                    <a href="../reader/stories.html" class="dropdown-item">Reader View</a>
                    <hr style="border: 0; border-top: 2px solid #000; margin: 6px 0;">
                    <button type="button" class="dropdown-item logout-item" onclick="handleLogout()">Sign Out</button>
                </div>
            </div>
        </div>
    `;
}

function toggleProfileDropdown(event) {
    if (event) event.stopPropagation();
    let menu = document.getElementById("profileDropdown");
    if (menu) menu.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
    let menu = document.getElementById("profileDropdown");
    if (menu && !menu.classList.contains("hidden")) {
        if (!e.target.closest(".user-profile-menu-container")) {
            menu.classList.add("hidden");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    renderAdminProfileHeader();
    loadStories();
});

renderAdminProfileHeader();
