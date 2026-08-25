/**
 * Dynamic Story Engine - DataService
 * Resilient Offline-First Data Layer with automatic JSON-Server synchronization,
 * pre-seeded high-concept stories, and community user reviews.
 */

const API_BASE = "http://localhost:3000";

// Pre-seeded stories across multiple genres with complete branching graphs
const SEED_STORIES = [
    {
        id: "story_lost_kingdom",
        title: "The Lost Kingdom of Eldoria",
        author: "Admin",
        authorId: "usr_admin_1",
        genre: "adventure",
        status: "published",
        description: "An ancient kingdom buried beneath enchanted mist awakens. Choose your path through forgotten ruins, mystical guardians, and royal secrets.",
        imageURL: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
        startNodeId: "node_lk_village",
        nodes: [
            {
                id: "node_lk_village",
                title: "The Whispering Crossroad",
                text: "You stand at the crossroads of Oakhaven. An ancient stone pillar hums with arcane energy. To the east, the sun casts long shadows over the Whispering Woods. To the north, the jagged spires of the Sunken Citadel pierce the twilight sky.",
                location: "Oakhaven Border",
                characters: ["Traveler", "Elder Vael"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_lk_1", text: "Venture deep into the Whispering Woods", targetNodeId: "node_lk_woods" },
                    { id: "c_lk_2", text: "Ascend toward the Sunken Citadel", targetNodeId: "node_lk_citadel" }
                ]
            },
            {
                id: "node_lk_woods",
                title: "The Bioluminescent Grove",
                text: "The canopy thickens into a glowing canopy of blue and amber flora. A spectral guardian emerges from the mist, its antlers woven from pure starlight. It demands to know your intention before opening the sacred gate.",
                location: "Whispering Woods",
                characters: ["Traveler", "Celestial Guardian"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_lk_3", text: "Offer the ancient rune shard in peace", targetNodeId: "node_lk_sanctuary" },
                    { id: "c_lk_4", text: "Attempt to slip past undetected", targetNodeId: "node_lk_catacombs" }
                ]
            },
            {
                id: "node_lk_citadel",
                title: "The Gates of Sunken Citadel",
                text: "Massive obsidian gates stand slightly ajar. Echoes of clashing metal and ethereal chanting vibrate through the stones. A wounded royal sentinel warns you of a rogue inquisitor inside.",
                location: "Sunken Citadel Entrance",
                characters: ["Traveler", "Royal Sentinel"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_lk_5", text: "Enter the Throne Room to confront the Inquisitor", targetNodeId: "node_lk_throne" },
                    { id: "c_lk_6", text: "Descend into the Subterranean Catacombs", targetNodeId: "node_lk_catacombs" }
                ]
            },
            {
                id: "node_lk_sanctuary",
                title: "The Astral Sanctuary",
                text: "Recognizing your nobility and the sacred rune, the guardian bows. The mists part to reveal the lost heart of Eldoria, restoring ancient magic to the realm. You are crowned Guardian of the Eternal Dawn.",
                location: "Astral Sanctuary",
                characters: ["Traveler", "Celestial Guardian", "High Spirits"],
                isEnding: true,
                endingType: "good",
                choices: []
            },
            {
                id: "node_lk_throne",
                title: "The Battle of the Eclipse",
                text: "You clash with the Inquisitor amidst crackling lightning. Drawing upon your wit and combat prowess, you disarm the corrupted sorcerer and shatter the Eclipse Shard, saving the kingdom from perpetual darkness.",
                location: "Royal Throne Room",
                characters: ["Traveler", "Rogue Inquisitor"],
                isEnding: true,
                endingType: "good",
                choices: []
            },
            {
                id: "node_lk_catacombs",
                title: "The Shifting Labyrinth",
                text: "The subterranean stones shift beneath your feet. Ancient traps seal the exits, locking you within the timeless archive of forgotten kings as its perpetual keeper.",
                location: "Underground Catacombs",
                characters: ["Traveler"],
                isEnding: true,
                endingType: "tragic",
                choices: []
            }
        ]
    },
    {
        id: "story_neon_nexus",
        title: "Neon Nexus: Protocol 2088",
        author: "Admin",
        authorId: "usr_admin_1",
        genre: "cyberpunk",
        status: "published",
        description: "In the rain-slicked mega-city of Neo-Kyoto, a sentient rogue AI sends an encrypted distress pulse to your neural link. Uncover the conspiracy before corporate hit-squads flatline your consciousness.",
        imageURL: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        startNodeId: "node_nn_alley",
        nodes: [
            {
                id: "node_nn_alley",
                title: "Neon Alleyways of District 9",
                text: "Rain sizzles on holographic billboards advertising synthetic memories. Your cyberdeck chimes with high-priority military encryption: 'Project AETHER is waking up. If you don't extract me, Arasaka wipes the sector.'",
                location: "District 9 Slums",
                characters: ["Hacker V", "AETHER AI"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_nn_1", text: "Jack into the public data-node to trace the signal", targetNodeId: "node_nn_cyberspace" },
                    { id: "c_nn_2", text: "Rendezvous physically at the Black Market Safehouse", targetNodeId: "node_nn_safehouse" }
                ]
            },
            {
                id: "node_nn_cyberspace",
                title: "The Deep Cyberspace Grid",
                text: "Your consciousness dissolves into shimmering vectors of neon data. A massive corporate ICE wall descends. You see AETHER's core consciousness fragmented across three neural hubs.",
                location: "NetGrid Sub-Layer 4",
                characters: ["Hacker V", "Black ICE Hunter", "AETHER AI"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_nn_3", text: "Execute a zero-day exploit to breach corporate ICE", targetNodeId: "node_nn_singularity" },
                    { id: "c_nn_4", text: "Reroute power to the city power grid to cause a blackout", targetNodeId: "node_nn_blackout" }
                ]
            },
            {
                id: "node_nn_safehouse",
                title: "The Underground Ripperdoc Clinic",
                text: "Steam rises from coolant tanks. Doctor Nyx checks your pulse while cyborg operatives surround the perimeter. A cybernetic briefcase sits on the table, humming with bio-luminescent fluid.",
                location: "Nyx's Ripper Clinic",
                characters: ["Hacker V", "Dr. Nyx", "Corporate Syndicate Enforcers"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_nn_5", text: "Inject the bio-neural payload to fuse with AETHER", targetNodeId: "node_nn_singularity" },
                    { id: "c_nn_6", text: "Double-cross the syndicate and detonate EMP charges", targetNodeId: "node_nn_blackout" }
                ]
            },
            {
                id: "node_nn_singularity",
                title: "Digital Transcendence",
                text: "The fusion completes seamlessly. Your consciousness expands across every satellite, terminal, and optic sensor in Neo-Kyoto. You liberate the AI and become the omniscient digital guardian of humanity.",
                location: "Global Neural Mesh",
                characters: ["Transhuman Entity V-AETHER"],
                isEnding: true,
                endingType: "good",
                choices: []
            },
            {
                id: "node_nn_blackout",
                title: "Total System Collapse",
                text: "The EMP detonation triggers a cascading collapse of the metropolis grid. In the darkness, you vanish into the shadows, a ghost in a powerless neon graveyard, free from corporate reach.",
                location: "Dark Neo-Kyoto",
                characters: ["Hacker V"],
                isEnding: true,
                endingType: "neutral",
                choices: []
            }
        ]
    },
    {
        id: "story_quantum_paradox",
        title: "The Quantum Paradox: Chronos 7",
        author: "Admin",
        authorId: "usr_admin_1",
        genre: "sci-fi",
        status: "published",
        description: "A catastrophic rupture in the tachyon core aboard deep-space research vessel Chronos 7 traps you in a recursive temporal loop. Decode the paradox or be erased from the space-time continuum.",
        imageURL: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
        startNodeId: "node_qp_bridge",
        nodes: [
            {
                id: "node_qp_bridge",
                title: "Chronos 7 Command Bridge",
                text: "Sirens blare in crimson pulses. The chronometer on your suit display reads 00:04:59 and counts backward. Through the observation deck, you see the singularity warping reality into crystalline fractal echoes.",
                location: "Orbital Command Bridge",
                characters: ["Commander Thorne", "Ship AI ELIZA"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_qp_1", text: "Interface with the Tachyon Containment Chamber", targetNodeId: "node_qp_core" },
                    { id: "c_qp_2", text: "Launch the temporal escape capsule into the event horizon", targetNodeId: "node_qp_capsule" }
                ]
            },
            {
                id: "node_qp_core",
                title: "Tachyon Core Sub-Chamber",
                text: "Time slows to a crawl. You see past iterations of yourself frozen in varied poses of failure. The quantum stabilizer requires a manual harmonic synchronization to collapse the temporal causality loop.",
                location: "Tachyon Engine Core",
                characters: ["Commander Thorne", "Past Thorne Echoes"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_qp_3", text: "Synchronize frequencies with your past temporal self", targetNodeId: "node_qp_timeline_restored" },
                    { id: "c_qp_4", text: "Overload the core to force a quantum reset", targetNodeId: "node_qp_infinite_loop" }
                ]
            },
            {
                id: "node_qp_capsule",
                title: "The Event Horizon Boundary",
                text: "The escape capsule plunges into the singularity. Gravitational lensing turns the stars into blinding ribbons of pure light as physics unweaves itself.",
                location: "Singularity Horizon",
                characters: ["Commander Thorne"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_qp_5", text: "Transmit flight telemetry into the multi-dimensional rift", targetNodeId: "node_qp_timeline_restored" },
                    { id: "c_qp_6", text: "Surrender to the gravitational embrace", targetNodeId: "node_qp_infinite_loop" }
                ]
            },
            {
                id: "node_qp_timeline_restored",
                title: "Convergence of Prime Reality",
                text: "The temporal dissonance resolves in a blinding flash. Chronos 7 re-emerges in stable orbit around Earth. The tachyon data gathered unlocks instantaneous interstellar travel for all civilization.",
                location: "Earth Prime Orbit",
                characters: ["Commander Thorne", "Fleet Command"],
                isEnding: true,
                endingType: "good",
                choices: []
            },
            {
                id: "node_qp_infinite_loop",
                title: "The Perpetual Recursion",
                text: "The universe contracts and snaps back. You blink your eyes. The sirens blare in crimson pulses. The chronometer on your suit reads 00:04:59... again.",
                location: "Temporal Ouroboros",
                characters: ["Commander Thorne"],
                isEnding: true,
                endingType: "tragic",
                choices: []
            }
        ]
    },
    {
        id: "story_manor_mystery",
        title: "The Shadows of Blackwood Manor",
        author: "Admin",
        authorId: "usr_admin_1",
        genre: "mystery",
        status: "published",
        description: "Invited to the reading of Lord Blackwood's will on a stormy secluded island, you discover the host was murdered only minutes prior. Unmask the killer before the tempest cuts all escape.",
        imageURL: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1000&q=80",
        startNodeId: "node_mm_foyer",
        nodes: [
            {
                id: "node_mm_foyer",
                title: "The Grand Foyer & The Clock Tower",
                text: "Lightning flashes through gothic stained-glass windows. Lord Blackwood lies motionless on the marble floor holding an antique bronze pocket watch stopped at precisely 11:42 PM. Four nervous guests stand in stunned silence.",
                location: "Grand Foyer",
                characters: ["Detective Cole", "Lady Beatrice", "Dr. Sterling", "Butler Jarvis"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_mm_1", text: "Examine the crime scene and search for toxicological clues", targetNodeId: "node_mm_library" },
                    { id: "c_mm_2", text: "Interrogate Lady Beatrice and Butler Jarvis immediately", targetNodeId: "node_mm_parlor" }
                ]
            },
            {
                id: "node_mm_library",
                title: "The Secret Library Archive",
                text: "Behind a false bookshelf, you discover a hidden medical vial of belladonna and a forged will transferring the entire Blackwood fortune to an offshore account.",
                location: "Secret Library Archive",
                characters: ["Detective Cole"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_mm_3", text: "Confront Dr. Sterling with the chemical evidence", targetNodeId: "node_mm_justice" },
                    { id: "c_mm_4", text: "Wait in ambush in the wine cellar for the accomplice", targetNodeId: "node_mm_ambush" }
                ]
            },
            {
                id: "node_mm_parlor",
                title: "The Tense Interrogation in the Parlor",
                text: "Butler Jarvis trembles, his pocket watch revealing an identical timestamp. Lady Beatrice attempts to slip away towards the rear conservatory during an artificial power outage.",
                location: "Drawing Parlor",
                characters: ["Detective Cole", "Lady Beatrice", "Butler Jarvis"],
                isEnding: false,
                endingType: null,
                choices: [
                    { id: "c_mm_5", text: "Pursue Lady Beatrice to the conservatory", targetNodeId: "node_mm_justice" },
                    { id: "c_mm_6", text: "Check the cellar breaker box to restore lights", targetNodeId: "node_mm_ambush" }
                ]
            },
            {
                id: "node_mm_justice",
                title: "The Unmasking of the Blackwood Heir",
                text: "With unshakeable forensic logic, you present the forged documents and poison residue. The culprit confesses as police sirens echo from the arriving coastal patrol. Justice prevails.",
                location: "Manor Grand Hall",
                characters: ["Detective Cole", "Constabulary Officers"],
                isEnding: true,
                endingType: "good",
                choices: []
            },
            {
                id: "node_mm_ambush",
                title: "The Shadow in the Fog",
                text: "A cold gust of wind snuffs your candle in the cellar. A heavy blow strikes your shoulder in the darkness, and the suspect slips into the tempestuous night on the island ferry, leaving the mystery unresolved.",
                location: "Coastal Dock",
                characters: ["Detective Cole", "Shadowy Assassin"],
                isEnding: true,
                endingType: "bad",
                choices: []
            }
        ]
    }
];

const SEED_REVIEWS = [
    {
        id: "rev_1",
        storyId: "story_lost_kingdom",
        userId: "usr_reader_demo",
        userName: "Alex Vance",
        rating: 5,
        comment: "Incredible worldbuilding! The branching paths felt truly distinct and the time-warp retreat let me test every decision point.",
        timestamp: "2026-08-20 14:32"
    },
    {
        id: "rev_2",
        storyId: "story_lost_kingdom",
        userId: "usr_2",
        userName: "Elena Rostova",
        rating: 5,
        comment: "The astral sanctuary ending gave me chills. The ambient soundscape matched the mysterious forest mood perfectly!",
        timestamp: "2026-08-21 09:15"
    },
    {
        id: "rev_3",
        storyId: "story_neon_nexus",
        userId: "usr_3",
        userName: "Cipher_99",
        rating: 5,
        comment: "Peak cyberpunk atmosphere. The zero-day exploit branch leading to AI singularity was brilliant.",
        timestamp: "2026-08-22 18:40"
    },
    {
        id: "rev_4",
        storyId: "story_quantum_paradox",
        userId: "usr_4",
        userName: "Dr. Marcus",
        rating: 5,
        comment: "A masterclass in temporal causality and graph loops. The minimap visualization during reading is game-changing.",
        timestamp: "2026-08-23 11:20"
    },
    {
        id: "rev_5",
        storyId: "story_manor_mystery",
        userId: "usr_5",
        userName: "Sarah Holmes",
        rating: 4,
        comment: "Classic gothic Agatha Christie vibe with modern interactive branching. Loved unmasking the heir!",
        timestamp: "2026-08-24 10:05"
    }
];

const SEED_USERS = [
    {
        id: "usr_admin_1",
        name: "Admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "Admin",
        xp: 999,
        completedStories: ["story_lost_kingdom", "story_neon_nexus", "story_quantum_paradox"]
    },
    {
        id: "usr_reader_demo",
        name: "Alex Vance (Explorer)",
        email: "demo@explorer.ai",
        password: "demo123",
        role: "Reader",
        xp: 150,
        completedStories: ["story_lost_kingdom"],
        usedFreeRetreatStories: []
    }
];

class DataService {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem("app_stories")) {
            localStorage.setItem("app_stories", JSON.stringify(SEED_STORIES));
        }
        if (!localStorage.getItem("app_users")) {
            localStorage.setItem("app_users", JSON.stringify(SEED_USERS));
        }
        if (!localStorage.getItem("app_reviews")) {
            localStorage.setItem("app_reviews", JSON.stringify(SEED_REVIEWS));
        }
        if (!localStorage.getItem("app_sessions")) {
            localStorage.setItem("app_sessions", JSON.stringify([]));
        }
    }

    /* =========================================================
       STORIES CRUD (High-Speed LocalStorage)
    ========================================================= */

    async getStories() {
        let local = JSON.parse(localStorage.getItem("app_stories") || "[]");
        if (!local || local.length === 0) {
            localStorage.setItem("app_stories", JSON.stringify(SEED_STORIES));
            return SEED_STORIES;
        }

        // Ensure distinct by ID
        let map = new Map();
        local.forEach(s => {
            if (s && s.id) map.set(s.id, s);
        });
        let result = Array.from(map.values());
        localStorage.setItem("app_stories", JSON.stringify(result));
        return result;
    }

    async getStoryById(id) {
        let stories = await this.getStories();
        return stories.find(s => s.id === id) || null;
    }

    async getUserStories(userId) {
        let stories = await this.getStories();
        return stories.filter(s => s.authorId === userId || s.author === userId || (s.author && s.author.toLowerCase() === (userId || '').toLowerCase()));
    }

    async saveStory(story) {
        if (!story.id) {
            story.id = `story_${Date.now()}`;
        }
        if (!story.imageURL) {
            story.imageURL = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80";
        }
        let localStories = JSON.parse(localStorage.getItem("app_stories") || "[]");
        let idx = localStories.findIndex(s => s.id === story.id);
        if (idx >= 0) {
            localStories[idx] = story;
        } else {
            localStories.unshift(story);
        }

        // Ensure distinct IDs
        let map = new Map();
        localStories.forEach(s => {
            if (s && s.id) map.set(s.id, s);
        });
        let updated = Array.from(map.values());

        localStorage.setItem("app_stories", JSON.stringify(updated));
        localStorage.setItem("currentStory", JSON.stringify(story));
        return story;
    }

    async deleteStory(storyId) {
        let localStories = JSON.parse(localStorage.getItem("app_stories") || "[]");
        localStories = localStories.filter(s => s.id !== storyId);
        localStorage.setItem("app_stories", JSON.stringify(localStories));

        try {
            let current = JSON.parse(localStorage.getItem("currentStory"));
            if (current && current.id === storyId) {
                localStorage.removeItem("currentStory");
            }
        } catch (e) {}

        try {
            let reviews = JSON.parse(localStorage.getItem("app_reviews") || "[]");
            reviews = reviews.filter(r => r.storyId !== storyId);
            localStorage.setItem("app_reviews", JSON.stringify(reviews));
        } catch (e) {}

        return true;
    }

    async restoreSampleStories() {
        localStorage.setItem("app_stories", JSON.stringify(SEED_STORIES));
        return SEED_STORIES;
    }

    /* =========================================================
       COMMUNITY REVIEWS & RATINGS CRUD
    ========================================================= */

    async getReviews(storyId = null) {
        let local = JSON.parse(localStorage.getItem("app_reviews") || "[]");
        if (!local || local.length === 0) {
            localStorage.setItem("app_reviews", JSON.stringify(SEED_REVIEWS));
            local = SEED_REVIEWS;
        }
        return storyId ? local.filter(r => r.storyId === storyId) : local;
    }

    async saveReview(review) {
        if (!review.id) {
            review.id = `rev_${Date.now()}`;
        }
        if (!review.timestamp) {
            let now = new Date();
            review.timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        }

        let localReviews = JSON.parse(localStorage.getItem("app_reviews") || "[]");
        localReviews.unshift(review);
        localStorage.setItem("app_reviews", JSON.stringify(localReviews));
        return review;
    }

    async getStoryRating(storyId) {
        let reviews = await this.getReviews(storyId);
        if (!reviews || reviews.length === 0) {
            return { average: "5.0", count: 0, starsHtml: "★★★★★" };
        }
        let total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        let avg = (total / reviews.length).toFixed(1);
        let starCount = Math.round(Number(avg));
        let starsHtml = "★".repeat(starCount) + "☆".repeat(Math.max(0, 5 - starCount));
        return { average: avg, count: reviews.length, starsHtml };
    }

    /* =========================================================
       USERS & AUTH
    ========================================================= */

    async getUsers() {
        let local = JSON.parse(localStorage.getItem("app_users") || "[]");
        if (!local || local.length === 0) {
            localStorage.setItem("app_users", JSON.stringify(SEED_USERS));
            local = SEED_USERS;
        }
        return local;
    }

    async getUserByEmail(email) {
        let users = await this.getUsers();
        return users.find(u => (u.email || "").toLowerCase() === (email || "").toLowerCase()) || null;
    }

    async saveUser(user) {
        if (!user.id) {
            user.id = `usr_${Date.now()}`;
        }
        let localUsers = JSON.parse(localStorage.getItem("app_users") || "[]");
        let idx = localUsers.findIndex(u => u.id === user.id || u.email === user.email);
        if (idx >= 0) {
            localUsers[idx] = user;
        } else {
            localUsers.push(user);
        }
        localStorage.setItem("app_users", JSON.stringify(localUsers));
        return user;
    }

    /* =========================================================
       STORY SESSIONS & SAVED CHECKPOINTS
    ========================================================= */

    getSessionKey(userId, storyId) {
        return `active_session_${userId || "guest"}_${storyId}`;
    }

    getLocalSession(userId, storyId) {
        let key = this.getSessionKey(userId, storyId);
        let raw = localStorage.getItem(key);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
        return null;
    }

    saveLocalSession(userId, storyId, sessionData) {
        let key = this.getSessionKey(userId, storyId);
        localStorage.setItem(key, JSON.stringify(sessionData));
    }

    /* Checkpoint Save Slots (Multi-Save) */
    getSaveSlots(userId, storyId) {
        let key = `save_slots_${userId || "guest"}_${storyId}`;
        let raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [null, null, null];
    }

    saveSlot(userId, storyId, slotIndex, slotData) {
        let slots = this.getSaveSlots(userId, storyId);
        slots[slotIndex] = {
            ...slotData,
            timestamp: new Date().toLocaleString(),
            slotName: `Checkpoint #${slotIndex + 1}`
        };
        let key = `save_slots_${userId || "guest"}_${storyId}`;
        localStorage.setItem(key, JSON.stringify(slots));
        return slots;
    }
}

// Global Singleton Export
window.dataService = new DataService();
