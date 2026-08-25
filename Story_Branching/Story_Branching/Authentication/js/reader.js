/**
 * Dynamic Story Engine - Reader Controller & Immersive Story Player
 * Integrates DataService, Community Reviews & Ratings, User Story Management,
 * AIEngine (Sentiment & Recommendations), GraphStudio (Minimap), and AudioEngine.
 */

let user = null;
try {
    user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        if (user.xp === undefined) user.xp = 100;
        if (!user.completedStories) user.completedStories = [];
        if (!user.usedFreeRetreatStories) user.usedFreeRetreatStories = [];
        localStorage.setItem("user", JSON.stringify(user));
    }
} catch (e) {
    user = null;
}

// Redirect if not logged in
if (!user) {
    window.location.href = "../auth/login.html";
}

let activeLibraryTab = "all"; // "all" | "my"
let selectedReviewRating = 5;

/* =====================================================
   HEADER & USER PROFILE
===================================================== */

function renderUserProfileHeader() {
    let navAuthContainer = document.getElementById("navAuthContainer");
    if (!navAuthContainer || !user) return;

    let initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
    let activeXp = (user.xp !== undefined) ? user.xp : 100;
    let roleTitle = user.role || "Reader";
    let xpBadgeHtml = (user.role !== "Admin") ? `<span class="user-xp-badge">⭐ ${activeXp} XP</span>` : ``;

    let adminPill = document.getElementById("adminNavPill");
    if (adminPill && user.role === "Admin") {
        adminPill.style.display = "inline-block";
    }

    navAuthContainer.innerHTML = `
        <div class="user-profile-menu-container">
            <button type="button" class="profile-menu-btn" onclick="toggleProfileDropdown(event)">
                <span class="user-avatar">${initial}</span>
                <span class="user-name-label">${user.name || 'User'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-left: 2px;"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div id="profileDropdown" class="profile-dropdown-menu hidden" onclick="event.stopPropagation()">
                <div class="profile-dropdown-header">
                    <strong>${user.name || 'User'}</strong>
                    <div style="display: flex; gap: 6px; margin-top: 4px; align-items: center; flex-wrap: wrap;">
                        <span class="user-role-badge">${roleTitle.toUpperCase()}</span>
                        ${xpBadgeHtml}
                    </div>
                </div>
                <div class="profile-dropdown-links">
                    ${user.role === 'Admin' ? `
                        <a href="../admin/admin.html" class="dropdown-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            Admin Dashboard
                        </a>
                    ` : ''}
                    <a href="../admin/add_stories.html" class="dropdown-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        + Create Story Studio
                    </a>
                    <a href="stories.html" class="dropdown-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        Story Library
                    </a>
                    <hr style="border: 0; border-top: 2px solid #000; margin: 6px 0;">
                    <button type="button" class="dropdown-item logout-item" onclick="handleLogout()">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    `;

    renderReaderProgressionBanner();
}

function renderReaderProgressionBanner() {
    let banner = document.getElementById("readerStatsBanner");
    if (!banner || !user) return;

    let xp = user.xp || 100;
    let level = 1;
    let levelName = "Apprentice";
    let nextThreshold = 200;

    if (xp >= 500) { level = 5; levelName = "Mythweaver"; nextThreshold = 1000; }
    else if (xp >= 350) { level = 4; levelName = "Fate Shaper"; nextThreshold = 500; }
    else if (xp >= 200) { level = 3; levelName = "Pathfinder"; nextThreshold = 350; }
    else if (xp >= 100) { level = 2; levelName = "Voyager"; nextThreshold = 200; }

    let progressPct = Math.min(100, Math.round((xp / nextThreshold) * 100));

    let badgeElem = document.getElementById("playerLevelBadge");
    if (badgeElem) badgeElem.textContent = `⭐ LEVEL ${level}: ${levelName.toUpperCase()}`;

    let xpTextElem = document.getElementById("playerXpText");
    if (xpTextElem) xpTextElem.textContent = `${xp} XP Total`;

    let fillElem = document.getElementById("xpProgressFill");
    if (fillElem) fillElem.style.width = `${progressPct}%`;

    let nextElem = document.getElementById("xpToNextLevel");
    if (nextElem) nextElem.textContent = `${Math.max(0, nextThreshold - xp)} XP to Next Level`;
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

/* =====================================================
   TOAST NOTIFICATION SYSTEM
===================================================== */

function showToastNotification(title, message, icon = "🎉", duration = 4500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-notification-container";
        document.body.appendChild(container);
    }

    let toast = document.createElement("div");
    toast.className = "toast-notification-card";
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button type="button" class="toast-close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

/* =====================================================
   STORY LIBRARY & COMMUNITY REVIEWS
===================================================== */

let allPublishedStories = [];
let allStoryRatings = {}; // Map of storyId -> ratingObj

async function loadStories() {
    let container = document.getElementById("storiesContainer");
    if (!container) return;

    try {
        let stories = await window.dataService.getStories();
        allPublishedStories = stories;

        // Precompute ratings for all stories
        for (let s of allPublishedStories) {
            allStoryRatings[s.id] = await window.dataService.getStoryRating(s.id);
        }

        updateTabCounts();
        renderAIRecommendations();
        filterStories();
    } catch (err) {
        console.error("Error loading story library:", err);
    }
}

function updateTabCounts() {
    let allCountElem = document.getElementById("allStoriesCount");
    let myCountElem = document.getElementById("myStoriesCount");
    if (!user) return;

    let allCount = allPublishedStories.filter(s => s.status === "published" || s.authorId === user.id || s.author === user.name).length;
    let myCount = allPublishedStories.filter(s => s.authorId === user.id || s.author === user.name || (s.author && s.author.toLowerCase() === (user.name || '').toLowerCase())).length;

    if (allCountElem) allCountElem.textContent = allCount;
    if (myCountElem) myCountElem.textContent = myCount;
}

function switchLibraryTab(tab) {
    activeLibraryTab = tab;
    let tabAll = document.getElementById("tabAllStories");
    let tabMy = document.getElementById("tabMyStories");

    if (tab === "my") {
        if (tabAll) tabAll.classList.remove("active");
        if (tabMy) tabMy.classList.add("active");
    } else {
        if (tabAll) tabAll.classList.add("active");
        if (tabMy) tabMy.classList.remove("active");
    }
    filterStories();
}

function renderAIRecommendations() {
    let aiSection = document.getElementById("aiRecommendationSection");
    let aiContainer = document.getElementById("aiRecommendationContainer");
    if (!aiSection || !aiContainer || allPublishedStories.length === 0) return;

    let publishedOnly = allPublishedStories.filter(s => s.status === "published");
    let recommendations = window.aiEngine.recommendStories(user, publishedOnly);
    let topTwo = recommendations.slice(0, 2);

    if (topTwo.length > 0) {
        aiSection.style.display = "block";
        aiContainer.innerHTML = topTwo.map(story => {
            let ratingObj = allStoryRatings[story.id] || { average: 5.0, count: 0 };
            return `
                <div class="story-card" style="border: 3px solid #000; background: linear-gradient(135deg, #ffffff 0%, #fffde7 100%);">
                    <img src="${story.imageURL || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}" alt="${story.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';">
                    <div class="story-card-content">
                        <div style="display: flex; gap: 8px; margin-bottom: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                            <span class="badge-genre">${(story.genre || "Adventure").toUpperCase()}</span>
                            <span style="background: var(--color-sunburst, #ffd731); color: #000; padding: 4px 12px; border-radius: 100px; border: 2px solid #000; font-weight: 800; font-size: 12px;">
                                🎯 ${story.aiMatchPercent}% MATCH &bull; ⭐ ${ratingObj.average}
                            </span>
                        </div>
                        <h2>${story.title}</h2>
                        <p style="font-size: 13px; font-weight: 700; color: #555; margin-bottom: 12px;">💡 ${story.aiReason}</p>
                        <button type="button" class="primary-btn" onclick="openStoryDetails('${story.id}')" style="background: var(--color-voltage-violet, #5c4ade); color: #fff;">
                            ⚡ Explore Recommended Path →
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }
}

function filterStories() {
    let container = document.getElementById("storiesContainer");
    if (!container) return;

    let searchInput = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toLowerCase().trim() : "";
    let selectedGenre = document.getElementById("genreFilter") ? document.getElementById("genreFilter").value.toLowerCase() : "all";
    let sortOrder = document.getElementById("sortOrder") ? document.getElementById("sortOrder").value : "ai";

    let pool = allPublishedStories;

    // Filter by Active Tab (All vs My Stories)
    if (activeLibraryTab === "my" && user) {
        pool = pool.filter(s => s.authorId === user.id || s.author === user.name || (s.author && s.author.toLowerCase() === (user.name || '').toLowerCase()));
    } else {
        // In All tab, show published or user's own drafts
        pool = pool.filter(s => s.status === "published" || (user && (s.authorId === user.id || s.author === user.name)));
    }

    let filtered = pool.filter(story => {
        let title = (story.title || "").toLowerCase();
        let author = (story.author || "").toLowerCase();
        let description = (story.description || "").toLowerCase();
        let genre = (story.genre || "").toLowerCase();

        let matchesSearch = title.includes(searchInput) || author.includes(searchInput) || description.includes(searchInput);
        let matchesGenre = (selectedGenre === "all") || (genre === selectedGenre);
        return matchesSearch && matchesGenre;
    });

    // Sorting
    if (sortOrder === "rating") {
        filtered.sort((a, b) => {
            let rA = allStoryRatings[a.id] ? Number(allStoryRatings[a.id].average) : 0;
            let rB = allStoryRatings[b.id] ? Number(allStoryRatings[b.id].average) : 0;
            return rB - rA;
        });
    } else if (sortOrder === "scenes") {
        filtered.sort((a, b) => (b.nodes ? b.nodes.length : 0) - (a.nodes ? a.nodes.length : 0));
    } else if (sortOrder === "title") {
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    container.innerHTML = "";

    if (filtered.length === 0) {
        if (activeLibraryTab === "my") {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: #fff; border: 2px dashed #000; border-radius: 28px; box-shadow: 4px 4px 0 #000;">
                    <h2 style="font-family: var(--font-display); font-size: 26px; margin-bottom: 10px;">YOU HAVEN'T CREATED ANY STORIES YET</h2>
                    <p style="font-weight: 700; font-size: 15px; color: #444; margin-bottom: 18px;">Build your own interactive branching universe with the visual graph editor and AI co-pilot!</p>
                    <a href="../admin/add_stories.html" class="primary-btn" style="display: inline-block; padding: 12px 28px;">+ Create Your First Story</a>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: #fff; border: 2px dashed #000; border-radius: 28px; box-shadow: 4px 4px 0 #000;">
                    <h2 style="font-family: var(--font-display); font-size: 28px; margin-bottom: 12px;">NO STORIES FOUND</h2>
                    <p style="font-weight: 700; font-size: 15px; color: #444;">Try adjusting your search query or genre filter.</p>
                </div>
            `;
        }
        return;
    }

    filtered.forEach(story => {
        let sceneCount = story.nodes ? story.nodes.length : 0;
        let isCompleted = user && user.completedStories && user.completedStories.includes(story.id);
        let isAuthor = user && (story.authorId === user.id || story.author === user.name || (story.author && story.author.toLowerCase() === (user.name || '').toLowerCase()));
        let ratingObj = allStoryRatings[story.id] || { average: "5.0", count: 0 };

        let authorActions = isAuthor ? `
            <div style="display: flex; gap: 8px; margin-top: 10px;">
                <a href="../admin/add_stories.html?id=${story.id}" class="secondary-btn" style="flex: 1; text-align: center; font-size: 12px; padding: 8px;">✏️ Edit Graph</a>
                <button type="button" class="danger-btn" onclick="deleteUserStory('${story.id}')" style="font-size: 12px; padding: 8px 14px;">🗑️</button>
            </div>
        ` : '';

        container.innerHTML += `
            <div class="story-card">
                <img src="${story.imageURL || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"}" alt="${story.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';">
                <div class="story-card-content">
                    <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                        <span class="badge-genre">${(story.genre || "General").toUpperCase()}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="background: #fff; border: 2px solid #000; border-radius: 100px; padding: 2px 10px; font-weight: 800; font-size: 12px; box-shadow: 2px 2px 0 #000;">
                                ⭐ ${ratingObj.average} (${ratingObj.count})
                            </span>
                            ${isCompleted ? `<span style="background: #34d399; color: #000; border: 2px solid #000; border-radius: 100px; padding: 2px 8px; font-weight: 800; font-size: 11px;">✅ PLAYED</span>` : ''}
                        </div>
                    </div>
                    <h2>${story.title}</h2>
                    <div class="author-tag" style="margin-bottom: 8px; font-weight: 800; color: var(--color-voltage-violet);">
                        ✍️ BY ${(story.author || "CREATOR").toUpperCase()} ${isAuthor ? '(YOU)' : ''}
                    </div>
                    <p>${story.description || ""}</p>
                    <div class="stat-lockup-box" style="margin-bottom: 16px;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span><strong>${sceneCount}</strong> SCENES / NODES</span>
                    </div>
                    <button type="button" class="primary-btn" onclick="openStoryDetails('${story.id}')">
                        Begin Story Experience →
                    </button>
                    ${authorActions}
                </div>
            </div>
        `;
    });
}

async function deleteUserStory(storyId) {
    if (!confirm("Are you sure you want to permanently delete this story?")) return;
    await window.dataService.deleteStory(storyId);
    allPublishedStories = allPublishedStories.filter(s => s.id !== storyId);
    delete allStoryRatings[storyId];
    updateTabCounts();
    filterStories();
    showToastNotification("STORY DELETED", "Your story was removed.", "🗑️");
}

/* =====================================================
   STORY DETAIL & REVIEWS SHOWCASE MODAL
===================================================== */

async function openStoryDetails(storyId) {
    let story = allPublishedStories.find(s => s.id === storyId);
    if (!story) return;

    let modal = document.getElementById("storyDetailModal");
    if (!modal) return;

    let card = modal.querySelector(".story-detail-card");
    let sceneCount = story.nodes ? story.nodes.length : 0;
    let endingsCount = story.nodes ? story.nodes.filter(n => n.isEnding).length : 1;
    if (endingsCount === 0) endingsCount = 1;

    let reviews = await window.dataService.getReviews(storyId);
    let ratingObj = await window.dataService.getStoryRating(storyId);

    let reviewsListHtml = reviews.length > 0 ? reviews.map(r => `
        <div class="review-card-item">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--color-voltage-violet); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 1.5px solid #000;">
                        ${(r.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <strong style="font-size: 13px;">${r.userName || 'Explorer'}</strong>
                </div>
                <div style="color: #f59e0b; font-size: 14px; font-weight: 900;">
                    ${"★".repeat(r.rating || 5)}${"☆".repeat(Math.max(0, 5 - (r.rating || 5)))}
                </div>
            </div>
            <p style="font-size: 13px; line-height: 1.5; font-weight: 600; color: #222; margin-bottom: 4px;">"${r.comment}"</p>
            <div style="font-size: 11px; color: #777; font-weight: 700;">${r.timestamp || 'Recently'}</div>
        </div>
    `).join("") : `<p style="font-style: italic; color: #666; font-size: 13px; font-weight: 700; margin-bottom: 12px;">No reviews yet. Be the first explorer to leave a review!</p>`;

    card.innerHTML = `
        <div class="story-detail-grid">
            <div class="detail-left-column">
                <img class="detail-cover-img" src="${story.imageURL || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}" alt="${story.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';">
                
                <div class="detail-stats-grid">
                    <div class="detail-stat-box yellow">
                        <div class="detail-stat-num">${sceneCount}</div>
                        <div class="detail-stat-label">SCENES / NODES</div>
                    </div>
                    <div class="detail-stat-box green">
                        <div class="detail-stat-num">${endingsCount}</div>
                        <div class="detail-stat-label">UNIQUE ENDINGS</div>
                    </div>
                </div>

                <div class="detail-actions-row">
                    <button type="button" class="enter-world-btn" onclick="enterStoryWorld('${story.id}')">
                        ⚡ Begin Story Experience →
                    </button>
                    <button type="button" class="back-library-btn" onclick="closeStoryDetails()">
                        ← Back to Library
                    </button>
                </div>
            </div>

            <div class="detail-right-column">
                <div class="detail-badges-row">
                    <span class="badge-genre">${(story.genre || "General").toUpperCase()}</span>
                    <span style="background: #facc15; border: 2px solid #0f172a; border-radius: 100px; padding: 3px 12px; font-weight: 800; font-size: 12px; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
                        ⭐ ${ratingObj.average} / 5 (${ratingObj.count} Reviews)
                    </span>
                </div>
                
                <h1 class="detail-title">${story.title}</h1>
                <div class="detail-author">✍️ Written by ${(story.author || "CREATOR").toUpperCase()}</div>
                
                <div class="detail-description-box">
                    ${story.description || "Immerse yourself in a dynamic choose-your-own-adventure experience where your choices determine the story."}
                </div>

                <!-- Community Reviews Section -->
                <div class="reviews-section-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="font-family: var(--font-display); font-size: 16px; margin: 0; color: #0f172a;">💬 COMMUNITY REVIEWS &amp; RATINGS</h3>
                        <span style="font-size: 12px; font-weight: 800; color: #475569;">${reviews.length} total</span>
                    </div>

                    <!-- Write a Review Form -->
                    <div style="background: #ffffff; border: 2px solid #0f172a; border-radius: 14px; padding: 14px; margin-bottom: 14px; box-shadow: 2px 2px 0 #0f172a;">
                        <div style="font-weight: 800; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; color: #0f172a;">Rate this Adventure:</div>
                        <div class="star-rating-select" id="starPicker" style="margin-bottom: 8px;">
                            <span onclick="setReviewRating(1)">★</span>
                            <span onclick="setReviewRating(2)">★</span>
                            <span onclick="setReviewRating(3)">★</span>
                            <span onclick="setReviewRating(4)">★</span>
                            <span onclick="setReviewRating(5)" class="selected">★</span>
                        </div>
                        <textarea id="reviewCommentInput" rows="2" placeholder="Write your thoughts, favorite branch, or review..." style="width: 100%; border: 2px solid #0f172a; border-radius: 10px; padding: 10px; font-family: var(--font-ui); font-weight: 600; font-size: 13px; outline: none; margin-bottom: 8px; box-sizing: border-box;"></textarea>
                        <div style="text-align: right;">
                            <button type="button" class="primary-btn" onclick="submitStoryReview('${story.id}')" style="width: auto; padding: 8px 20px; font-size: 13px;">
                                💬 Submit Review
                            </button>
                        </div>
                    </div>

                    <!-- Reviews List -->
                    <div style="max-height: 180px; overflow-y: auto; padding-right: 4px;">
                        ${reviewsListHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    setReviewRating(5);
    modal.classList.remove("hidden");
}

function setReviewRating(stars) {
    selectedReviewRating = stars;
    let picker = document.getElementById("starPicker");
    if (!picker) return;
    let starSpans = picker.querySelectorAll("span");
    starSpans.forEach((s, idx) => {
        if (idx < stars) {
            s.style.color = "#f59e0b";
        } else {
            s.style.color = "#ccc";
        }
    });
}

async function submitStoryReview(storyId) {
    let input = document.getElementById("reviewCommentInput");
    let comment = input ? input.value.trim() : "";
    if (!comment) {
        alert("Please write a short comment before submitting your review.");
        return;
    }

    let review = {
        storyId: storyId,
        userId: user ? (user.id || user.name) : "guest",
        userName: user ? user.name : "Explorer",
        rating: selectedReviewRating,
        comment: comment
    };

    await window.dataService.saveReview(review);
    showToastNotification("REVIEW SUBMITTED!", "Thank you for reviewing this story! ⭐", "💬");

    // Refresh ratings
    allStoryRatings[storyId] = await window.dataService.getStoryRating(storyId);
    filterStories();
    openStoryDetails(storyId);
}

function closeStoryDetails(event) {
    if (event) event.stopPropagation();
    let modal = document.getElementById("storyDetailModal");
    if (modal) modal.classList.add("hidden");
}

function enterStoryWorld(storyId) {
    window.location.href = `play.html?id=${storyId}`;
}

/* =====================================================
   STORY PLAYER (PLAY.HTML)
===================================================== */

const urlParams = new URLSearchParams(window.location.search);
const currentStoryId = urlParams.get("id");

let activeStory = null;
let currentNode = null;
let traversalPath = [];
let storySession = null;
let minimapInstance = null;

const RETREAT_COST = 10;
const COMPLETION_XP = 25;

async function loadStoryPlayer() {
    if (!currentStoryId) return;

    try {
        activeStory = await window.dataService.getStoryById(currentStoryId);

        if (!activeStory || !activeStory.nodes || activeStory.nodes.length === 0) {
            alert("Story could not be loaded or contains no scenes.");
            window.location.href = "stories.html";
            return;
        }

        let startingNode = activeStory.nodes.find(n => n.id === activeStory.startNodeId) || activeStory.nodes[0];
        const userId = user ? (user.id || user.name) : "guest";

        // Check for existing session in localStorage
        let savedSession = window.dataService.getLocalSession(userId, currentStoryId);
        if (savedSession && savedSession.currentNodeId) {
            let foundNode = activeStory.nodes.find(n => n.id === savedSession.currentNodeId);
            if (foundNode) {
                storySession = savedSession;
                currentNode = foundNode;
                traversalPath = storySession.traversalPath || [{ nodeId: currentNode.id, title: currentNode.title, choiceText: null }];
                showStory();
                return;
            }
        }

        // Initialize brand new session
        currentNode = startingNode;
        traversalPath = [{ nodeId: startingNode.id, title: startingNode.title, choiceText: null }];
        storySession = {
            userId: userId,
            storyId: currentStoryId,
            currentNodeId: startingNode.id,
            traversalPath: traversalPath,
            visitedNodeIds: [startingNode.id],
            freeRetreatUsed: Boolean(user && user.usedFreeRetreatStories && user.usedFreeRetreatStories.includes(currentStoryId)),
            xp: user ? user.xp : 100,
            alreadyClaimed: false,
            ended: startingNode.isEnding || false,
            endingType: startingNode.isEnding ? startingNode.endingType : null
        };

        window.dataService.saveLocalSession(userId, currentStoryId, storySession);
        showStory();
    } catch (err) {
        console.error("Player initialization error:", err);
    }
}

function showStory() {
    let storyHeader = document.getElementById("storyHeader");
    let sceneContainer = document.getElementById("sceneContainer");
    let choicesContainer = document.getElementById("choicesContainer");
    let xpDisplay = document.getElementById("playerXpDisplay");

    if (!storyHeader || !sceneContainer || !choicesContainer || !currentNode) return;

    let activeXp = (user && user.xp !== undefined) ? user.xp : 100;
    if (xpDisplay) xpDisplay.textContent = `⭐ ${activeXp} XP`;

    // 1. NLP Sentiment & Atmosphere Analysis
    let analysis = window.aiEngine.analyzeScene(currentNode.text);
    applySceneAtmosphere(analysis);

    let decisions = Math.max(traversalPath.length - 1, 0);
    let pathLength = traversalPath.length;

    // Header Breadcrumbs
    storyHeader.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="stat-pill-yellow">DECISIONS: ${decisions}</span>
                <span class="stat-pill-green">SCENE ${pathLength} OF STORY</span>
            </div>
            <div class="emotion-badge-pill" style="border-color: ${analysis.atmosphere.borderColor};">
                ${analysis.emoji} ${analysis.primaryEmotion.toUpperCase()} &bull; Flesch Readability: ${analysis.metrics.fleschScore}
            </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 16px;">
            ${traversalPath.map((item, i) => `
                <span style="background:#fff; border:2px solid #000; border-radius:100px; padding:3px 12px; font-size:12px; font-weight:800; box-shadow:2px 2px 0 #000;">
                    ${i + 1}. ${item.title}
                </span>
                ${i < traversalPath.length - 1 ? '<span style="font-weight:900;">→</span>' : ''}
            `).join('')}
        </div>
    `;

    /* =====================================================
       ENDING SCREEN
    ===================================================== */
    if (currentNode.isEnding) {
        window.audioEngine.playVictory();
        storyHeader.innerHTML = "";

        let endType = (currentNode.endingType || "good").toLowerCase();
        let endingBg = endType === "good" ? "#34d399" : endType === "tragic" ? "#fb923c" : "#f87171";
        let endingEmoji = endType === "good" ? "🏆" : endType === "tragic" ? "🥀" : "💀";

        let totalNodes = activeStory.nodes.length;
        let exploredNodes = new Set(traversalPath.map(p => p.nodeId)).size;
        let coveragePercent = Math.round((exploredNodes / totalNodes) * 100);

        sceneContainer.innerHTML = "";
        choicesContainer.innerHTML = `
            <div class="story-card ending-card" style="border: 3px solid #000; border-radius: 24px; padding: 32px; box-shadow: 6px 6px 0px #000; background: #fff;">
                <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <div style="background: ${endingBg}; padding: 8px 22px; border-radius: 100px; border: 2px solid #000; font-weight: 800; font-size: 14px; text-transform: uppercase;">
                        ${endingEmoji} ${endType.toUpperCase()} ENDING ACHIEVED
                    </div>

                    <h1 style="font-family: var(--font-display); font-size: 34px; margin: 18px 0 14px 0; text-transform: uppercase;">
                        ${currentNode.title || "THE END"}
                    </h1>
                    
                    <div style="background: var(--color-sky); border: 2px solid #000; border-radius: 16px; padding: 22px; width: 100%; text-align: left; margin-bottom: 20px; box-shadow: 3px 3px 0px #000;">
                        <p style="font-size: 16px; line-height: 1.6; font-weight: 600; margin: 0;">${currentNode.text}</p>
                    </div>

                    <!-- Narrative Graph Traversal Summary -->
                    <div style="background: var(--color-lavender); border: 2px solid #000; border-radius: 16px; padding: 20px; width: 100%; margin-bottom: 20px; box-shadow: 3px 3px 0px #000;">
                        <h4 style="font-weight: 800; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; text-align: center;">
                            Narrative Graph Traversal Path (${decisions} Decisions &bull; ${coveragePercent}% Graph Explored):
                        </h4>
                        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;">
                            ${traversalPath.map((item, index) => `
                                <span style="background: #fff; border: 2px solid #000; padding: 6px 14px; border-radius: 100px; font-weight: 800; font-size: 13px; box-shadow: 2px 2px 0px #000;">
                                    ${index + 1}. ${item.title}
                                </span>
                                ${index < traversalPath.length - 1 ? `<span style="font-weight: 900;">→</span>` : ''}
                            `).join('')}
                        </div>
                    </div>

                    <!-- Ending Rating & Review Box -->
                    <div style="background: #ffffff; border: 2px solid #000; border-radius: 16px; padding: 20px; width: 100%; margin-bottom: 20px; box-shadow: 3px 3px 0 #000; text-align: left;">
                        <h4 style="font-family: var(--font-display); font-size: 15px; margin-bottom: 8px;">⭐ RATE &amp; REVIEW YOUR EXPERIENCE</h4>
                        <div class="star-rating-select" id="playEndStarPicker" style="margin-bottom: 8px;">
                            <span onclick="setPlayEndRating(1)">★</span>
                            <span onclick="setPlayEndRating(2)">★</span>
                            <span onclick="setPlayEndRating(3)">★</span>
                            <span onclick="setPlayEndRating(4)">★</span>
                            <span onclick="setPlayEndRating(5)" style="color: #f59e0b;">★</span>
                        </div>
                        <textarea id="playEndCommentInput" rows="2" placeholder="Leave a review for this author's branching story..." style="width: 100%; border: 2px solid #000; border-radius: 10px; padding: 8px 12px; font-family: var(--font-ui); font-weight: 600; font-size: 13px; outline: none; margin-bottom: 8px; box-sizing: border-box;"></textarea>
                        <div style="text-align: right;">
                            <button type="button" class="hud-btn" onclick="submitPlayEndReview('${activeStory.id}')" style="background: var(--color-yellow);">
                                💬 Submit Review &amp; Rating
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; width: 100%; margin-bottom: 16px; flex-wrap: wrap;">
                        <button type="button" class="hud-btn" onclick="openJourneyModal()" style="flex: 1; justify-content: center; padding: 12px;">
                            📜 Export Journey Chronicle (PDF / JSON)
                        </button>
                    </div>

                    <div style="display: flex; gap: 16px; width: 100%; flex-wrap: wrap;">
                        <button type="button" class="primary-btn" onclick="restartStory()" style="flex: 1; background: var(--color-voltage-violet, #5c4ade); color: #fff;">
                            🔄 Explore Alternate Timeline
                        </button>
                        <button type="button" class="primary-btn" onclick="window.location.href='stories.html'" style="flex: 1; background: #fff; color: #000;">
                            📚 Return to Story Library
                        </button>
                    </div>
                </div>
            </div>
        `;
        setPlayEndRating(5);
        return;
    }

    /* =====================================================
       REGULAR READING SCENE
    ===================================================== */
    let locationText = currentNode.location ? currentNode.location.toUpperCase() : "UNKNOWN REALM";
    let charsText = (currentNode.characters && currentNode.characters.length > 0)
        ? `👥 PRESENT: ${currentNode.characters.join(", ").toUpperCase()}`
        : "";

    let isFreeUsed = (storySession && storySession.freeRetreatUsed) || (user && user.usedFreeRetreatStories && user.usedFreeRetreatStories.includes(currentStoryId));
    let retreatText = isFreeUsed ? `← TIME-WARP RETREAT (-${RETREAT_COST} XP)` : "← TIME-WARP RETREAT (FREE TOKEN)";

    let retreatButtonHtml = "";
    if (traversalPath.length > 1) {
        retreatButtonHtml = `
            <div style="margin-top: 24px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <button type="button" class="primary-btn" onclick="retreat()" style="width: auto; background: var(--color-yellow); padding: 10px 24px;">
                    ${retreatText}
                </button>
                <span style="font-weight: 800; font-size: 13px;">⭐ XP: ${activeXp}</span>
            </div>
        `;
    }

    let visitedIds = (storySession && storySession.visitedNodeIds) ? storySession.visitedNodeIds : [];
    let choicesHTML = "";

    if (currentNode.choices && currentNode.choices.length > 0) {
        choicesHTML = currentNode.choices.map(choice => {
            let isVisited = visitedIds.includes(choice.targetNodeId);
            let visitedBadge = isVisited
                ? `<span style="font-size:10px; font-weight:900; background:#000; color:#fff; padding:2px 8px; border-radius:100px; margin-left:8px;">VISITED</span>`
                : "";
            let btnStyle = isVisited ? `background: #f0f0f0; opacity: 0.85;` : ``;

            return `
                <button type="button" class="primary-btn choice-btn-slush" style="${btnStyle}" onclick="selectChoice('${choice.targetNodeId}', '${choice.text.replace(/'/g, "\\'")}')"> 
                    <span>${choice.text}</span>${visitedBadge} <span style="font-size: 18px; font-weight: 900;">→</span>
                </button>
            `;
        }).join("");
    } else {
        choicesHTML = `<p style="font-style: italic; color: #666; font-weight: 700; text-align: center; margin: 16px 0;">No outgoing choices configured.</p>`;
    }

    sceneContainer.innerHTML = `
        <div class="story-card" style="border: 3px solid #000; border-radius: 24px; padding: 32px; box-shadow: 6px 6px 0px #000; background: #fff;">
            <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
                <span class="stat-pill-yellow">📍 ${locationText}</span>
                ${charsText ? `<span class="stat-pill-yellow">${charsText}</span>` : ""}
            </div>
            <h1 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 18px; text-transform: uppercase;">
                ${currentNode.title}
            </h1>
            <div style="background: var(--color-sky); border: 2px solid #000; border-radius: 16px; padding: 22px; margin-bottom: 24px; box-shadow: 3px 3px 0px #000;">
                <p id="activeNarrativeText" style="font-size: 16px; line-height: 1.65; font-weight: 600; margin: 0;">${currentNode.text}</p>
            </div>
            <h3 style="font-weight: 800; font-size: 14px; text-transform: uppercase; margin-bottom: 16px;">CHOOSE YOUR ACTION:</h3>
            <div id="readerChoices">
                ${choicesHTML}
                ${retreatButtonHtml}
            </div>
        </div>
    `;

    choicesContainer.innerHTML = "";

    // Sync Minimap if open
    let modal = document.getElementById("minimapModal");
    if (modal && !modal.classList.contains("hidden")) {
        renderMinimapCanvas();
    }
}

let playEndSelectedRating = 5;
function setPlayEndRating(stars) {
    playEndSelectedRating = stars;
    let picker = document.getElementById("playEndStarPicker");
    if (!picker) return;
    let starSpans = picker.querySelectorAll("span");
    starSpans.forEach((s, idx) => {
        s.style.color = idx < stars ? "#f59e0b" : "#ccc";
    });
}

async function submitPlayEndReview(storyId) {
    let input = document.getElementById("playEndCommentInput");
    let comment = input ? input.value.trim() : "";
    if (!comment) {
        alert("Please write a quick comment for the story author!");
        return;
    }

    let review = {
        storyId: storyId,
        userId: user ? (user.id || user.name) : "guest",
        userName: user ? user.name : "Explorer",
        rating: playEndSelectedRating,
        comment: comment
    };

    await window.dataService.saveReview(review);
    showToastNotification("REVIEW SUBMITTED!", "Your review and rating were saved! ⭐", "🎉");
    if (input) input.value = "";
}

function applySceneAtmosphere(analysis) {
    let overlay = document.getElementById("atmosphereGlowOverlay");
    if (overlay && analysis && analysis.atmosphere) {
        overlay.style.background = `radial-gradient(circle at 50% 30%, ${analysis.atmosphere.glowColor} 0%, transparent 65%)`;
    }
}

function selectChoice(targetNodeId, choiceText) {
    window.audioEngine.playClick();

    let nextNode = activeStory.nodes.find(n => n.id === targetNodeId);
    if (!nextNode) {
        alert("Target scene node not found.");
        return;
    }

    currentNode = nextNode;
    traversalPath.push({ nodeId: nextNode.id, title: nextNode.title, choiceText: choiceText });

    if (!storySession.visitedNodeIds) storySession.visitedNodeIds = [];
    if (!storySession.visitedNodeIds.includes(nextNode.id)) {
        storySession.visitedNodeIds.push(nextNode.id);
    }

    storySession.currentNodeId = nextNode.id;
    storySession.traversalPath = traversalPath;

    // Award XP on Ending
    if (nextNode.isEnding) {
        storySession.ended = true;
        storySession.endingType = nextNode.endingType;

        if (!user.completedStories) user.completedStories = [];
        if (!user.completedStories.includes(currentStoryId)) {
            user.completedStories.push(currentStoryId);
            user.xp = (user.xp || 100) + COMPLETION_XP;
            localStorage.setItem("user", JSON.stringify(user));
            showToastNotification("STORY COMPLETED!", `You earned +${COMPLETION_XP} XP bonus! ⭐`, "🏆");
        }
    }

    const userId = user ? (user.id || user.name) : "guest";
    window.dataService.saveLocalSession(userId, currentStoryId, storySession);
    showStory();
}

function retreat() {
    if (!currentNode || traversalPath.length <= 1) return;

    let activeXp = (user && user.xp !== undefined) ? user.xp : 100;
    let freeAlreadyUsed = (user.usedFreeRetreatStories && user.usedFreeRetreatStories.includes(currentStoryId)) || (storySession && storySession.freeRetreatUsed);

    if (!freeAlreadyUsed) {
        if (!user.usedFreeRetreatStories) user.usedFreeRetreatStories = [];
        user.usedFreeRetreatStories.push(currentStoryId);
        localStorage.setItem("user", JSON.stringify(user));
        if (storySession) storySession.freeRetreatUsed = true;
        showToastNotification("FREE RETREAT TOKEN USED!", "You rewound 1 scene back safely! ⏪", "⚡");
    } else {
        if (activeXp < RETREAT_COST) {
            window.audioEngine.playWarning();
            showToastNotification("INSUFFICIENT XP", "Not enough XP to time-warp retreat.", "⚠️");
            return;
        }
        user.xp = activeXp - RETREAT_COST;
        localStorage.setItem("user", JSON.stringify(user));
        if (storySession) storySession.xp = user.xp;
        showToastNotification("TIME-WARP REWIND!", `Rewound 1 scene back! -${RETREAT_COST} XP. ⭐`, "⏪");
    }

    window.audioEngine.playRewind();
    traversalPath.pop();

    let prev = traversalPath[traversalPath.length - 1];
    currentNode = activeStory.nodes.find(n => n.id === prev.nodeId);
    storySession.currentNodeId = currentNode.id;
    storySession.traversalPath = traversalPath;

    const userId = user ? (user.id || user.name) : "guest";
    window.dataService.saveLocalSession(userId, currentStoryId, storySession);
    showStory();
}

function restartStory() {
    let startingNode = activeStory.nodes.find(n => n.id === activeStory.startNodeId) || activeStory.nodes[0];
    currentNode = startingNode;
    traversalPath = [{ nodeId: startingNode.id, title: startingNode.title, choiceText: null }];
    storySession.currentNodeId = startingNode.id;
    storySession.traversalPath = traversalPath;
    storySession.ended = false;

    const userId = user ? (user.id || user.name) : "guest";
    window.dataService.saveLocalSession(userId, currentStoryId, storySession);
    showStory();
}

/* =====================================================
   AUDIO & NARRATION CONTROLS
===================================================== */

function toggleNarrator() {
    let narrativeElem = document.getElementById("activeNarrativeText");
    let text = narrativeElem ? narrativeElem.innerText : (currentNode ? currentNode.text : "");
    let btn = document.getElementById("ttsNarratorBtn");

    let isPlaying = window.audioEngine.toggleSpeech(text, () => {
        if (btn) { btn.classList.remove("active"); btn.innerHTML = `🔊 AI Narrator (TTS)`; }
    });

    if (btn) {
        if (isPlaying) {
            btn.classList.add("active");
            btn.innerHTML = `⏸️ Pause Narrator`;
        } else {
            btn.classList.remove("active");
            btn.innerHTML = `🔊 AI Narrator (TTS)`;
        }
    }
}

function toggleSoundscapeAudio() {
    let analysis = window.aiEngine.analyzeScene(currentNode ? currentNode.text : "");
    let preset = analysis.atmosphere.audioPreset || "mystery";

    let isPlaying = window.audioEngine.toggleSoundscape(preset);
    let statusElem = document.getElementById("soundscapeStatus");
    let btn = document.getElementById("soundscapeBtn");

    if (statusElem) statusElem.textContent = isPlaying ? "ON" : "OFF";
    if (btn) {
        if (isPlaying) btn.classList.add("active");
        else btn.classList.remove("active");
    }
}

/* =====================================================
   GRAPH MINIMAP MODAL
===================================================== */

function toggleMinimapModal(event) {
    if (event) event.stopPropagation();
    let modal = document.getElementById("minimapModal");
    if (!modal) return;

    modal.classList.toggle("hidden");
    if (!modal.classList.contains("hidden")) {
        renderMinimapCanvas();
    }
}

function renderMinimapCanvas() {
    let container = document.getElementById("minimapCanvasContainer");
    if (!container || !activeStory) return;

    let activePathIds = traversalPath.map(p => p.nodeId);
    window.graphStudio.renderCanvas(container, activeStory, {
        width: Math.min(800, window.innerWidth - 60),
        height: 420,
        activePath: activePathIds,
        onNodeSelect: (node) => {
            console.log("Inspected node in minimap:", node.title);
        }
    });
}

/* =====================================================
   CHECKPOINTS & SAVE SLOTS MODAL
===================================================== */

function openSaveSlotsModal() {
    let modal = document.getElementById("saveSlotsModal");
    let list = document.getElementById("saveSlotsList");
    if (!modal || !list || !activeStory) return;

    const userId = user ? (user.id || user.name) : "guest";
    let slots = window.dataService.getSaveSlots(userId, currentStoryId);

    list.innerHTML = slots.map((slot, idx) => {
        if (slot) {
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 2px solid #000; border-radius: 12px; padding: 12px 16px; box-shadow: 3px 3px 0 #000;">
                    <div>
                        <strong>Slot #${idx + 1}: ${slot.nodeTitle}</strong>
                        <div style="font-size: 12px; color: #555; font-weight: 700;">Saved: ${slot.timestamp} (${slot.traversalPath.length} scenes)</div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button type="button" class="hud-btn" onclick="restoreCheckpointSlot(${idx})">Restore</button>
                        <button type="button" class="hud-btn" onclick="saveCheckpointSlot(${idx})">Overwrite</button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8f8f8; border: 2px dashed #000; border-radius: 12px; padding: 12px 16px;">
                    <span style="font-weight: 700; color: #666;">Slot #${idx + 1}: Empty Checkpoint</span>
                    <button type="button" class="hud-btn" onclick="saveCheckpointSlot(${idx})">+ Save Here</button>
                </div>
            `;
        }
    }).join("");

    modal.classList.remove("hidden");
}

function closeSaveSlotsModal(event) {
    if (event) event.stopPropagation();
    let modal = document.getElementById("saveSlotsModal");
    if (modal) modal.classList.add("hidden");
}

function saveCheckpointSlot(idx) {
    const userId = user ? (user.id || user.name) : "guest";
    window.dataService.saveSlot(userId, currentStoryId, idx, {
        nodeId: currentNode.id,
        nodeTitle: currentNode.title,
        traversalPath: traversalPath,
        xp: user ? user.xp : 100
    });
    showToastNotification("CHECKPOINT SAVED!", `Progress saved to Slot #${idx + 1}`, "💾");
    openSaveSlotsModal();
}

function restoreCheckpointSlot(idx) {
    const userId = user ? (user.id || user.name) : "guest";
    let slots = window.dataService.getSaveSlots(userId, currentStoryId);
    let slot = slots[idx];
    if (!slot) return;

    let target = activeStory.nodes.find(n => n.id === slot.nodeId);
    if (!target) return;

    currentNode = target;
    traversalPath = slot.traversalPath || [{ nodeId: target.id, title: target.title, choiceText: null }];
    storySession.currentNodeId = target.id;
    storySession.traversalPath = traversalPath;

    window.dataService.saveLocalSession(userId, currentStoryId, storySession);
    closeSaveSlotsModal();
    showStory();
    showToastNotification("TIMELINE RESTORED!", `Restored checkpoint from Slot #${idx + 1}`, "⏳");
}

/* =====================================================
   JOURNEY CHRONICLE EXPORT MODAL
===================================================== */

function openJourneyModal() {
    let modal = document.getElementById("journeyModal");
    let content = document.getElementById("journeyContent");
    if (!modal || !content || !activeStory) return;

    let dateStr = new Date().toLocaleDateString();
    let chronicle = `=====================================================
STORY JOURNEY CHRONICLE: ${activeStory.title.toUpperCase()}
Date: ${dateStr} | Explorer: ${user ? user.name : "Guest Explorer"}
Genre: ${(activeStory.genre || "Adventure").toUpperCase()} | Ending: ${(currentNode.endingType || "GOOD").toUpperCase()}
=====================================================

NARRATIVE TRAVERSAL LOG (${traversalPath.length} Scenes Visited):

`;

    traversalPath.forEach((p, i) => {
        chronicle += `[Step ${i + 1}] Scene: ${p.title}\n`;
        if (p.choiceText) {
            chronicle += `       Choice Selected: "${p.choiceText}"\n`;
        }
        chronicle += `\n`;
    });

    chronicle += `=====================================================
Final Scene Conclusion:
"${currentNode.text}"
=====================================================`;

    content.textContent = chronicle;
    modal.classList.remove("hidden");
}

function closeJourneyModal(event) {
    if (event) event.stopPropagation();
    let modal = document.getElementById("journeyModal");
    if (modal) modal.classList.add("hidden");
}

function copyJourneyChronicle() {
    let content = document.getElementById("journeyContent");
    if (content) {
        navigator.clipboard.writeText(content.textContent);
        showToastNotification("COPIED!", "Story Journey Chronicle copied to clipboard.", "📋");
    }
}

function downloadJourneyChronicle() {
    let content = document.getElementById("journeyContent");
    if (!content) return;
    let blob = new Blob([content.textContent], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Story_Journey_${(activeStory ? activeStory.title : "Log").replace(/\s+/g, '_')}.txt`;
    a.click();
}

function handleLogout() {
    localStorage.removeItem("user");
    window.location.href = "../auth/login.html";
}

// Global Lifecycle Initializer
document.addEventListener("DOMContentLoaded", () => {
    renderUserProfileHeader();
    loadStories();
    loadStoryPlayer();
});

renderUserProfileHeader();
