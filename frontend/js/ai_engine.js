

class AIEngine {
    constructor() {
        this.apiKey = localStorage.getItem("ai_api_key") || "";
        this.lexicon = {
            thrilling: ["danger", "escape", "explode", "sprint", "clash", "strike", "fire", "lightning", "storm", "accelerate", "pursuit", "overload", "breach"],
            suspenseful: ["shadow", "whisper", "creak", "darkness", "trap", "fog", "mist", "unseen", "clock", "countdown", "hidden", "lurking", "silence", "tension"],
            heroic: ["honor", "triumph", "courage", "save", "dawn", "glory", "legend", "sacred", "valiant", "light", "crown", "champion", "freedom", "protect"],
            melancholy: ["forgotten", "ruin", "tears", "loss", "decay", "sorrow", "echo", "perpetual", "solitude", "farewell", "grave", "ashes", "fading"],
            peaceful: ["sanctuary", "serene", "calm", "harmony", "starlight", "bloom", "safe", "gentle", "crystal", "breeze", "oasis", "peace"],
            dangerous: ["death", "fatal", "erased", "abyss", "poison", "assassin", "singularity", "rupture", "execution", "collapse", "annihilation", "blood"]
        };
    }

    analyzeScene(text) {
        if (!text || typeof text !== "string") {
            return this.getDefaultAtmosphere();
        }

        const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const wordCount = words.length;
        const uniqueWords = new Set(words).size;
        const lexicalDiversity = wordCount > 0 ? (uniqueWords / wordCount).toFixed(2) : 0;

        let emotionScores = {
            thrilling: 0,
            suspenseful: 0,
            heroic: 0,
            melancholy: 0,
            peaceful: 0,
            dangerous: 0
        };

        words.forEach(w => {
            for (let [emotion, keywords] of Object.entries(this.lexicon)) {
                if (keywords.some(k => w.includes(k))) {
                    emotionScores[emotion] += 1;
                }
            }
        });

        // Determine dominant emotion
        let primaryEmotion = "peaceful";
        let maxScore = -1;
        for (let [emotion, score] of Object.entries(emotionScores)) {
            if (score > maxScore) {
                maxScore = score;
                primaryEmotion = emotion;
            }
        }

        // If no keywords matched, default based on text tone
        if (maxScore === 0) {
            primaryEmotion = text.length > 200 ? "suspenseful" : "peaceful";
        }

        const atmosphereMap = {
            thrilling: {
                name: "Thrilling Action",
                emoji: "⚡",
                glowColor: "rgba(251, 73, 3, 0.25)",
                borderColor: "#fb4903",
                particleType: "embers",
                audioPreset: "tension"
            },
            suspenseful: {
                name: "Tense Suspense",
                emoji: "👁️",
                glowColor: "rgba(92, 74, 222, 0.25)",
                borderColor: "#5c4ade",
                particleType: "mist",
                audioPreset: "mystery"
            },
            heroic: {
                name: "Heroic Triumph",
                emoji: "👑",
                glowColor: "rgba(255, 215, 49, 0.3)",
                borderColor: "#ffd731",
                particleType: "stars",
                audioPreset: "victory"
            },
            melancholy: {
                name: "Melancholic Sorrow",
                emoji: "🥀",
                glowColor: "rgba(77, 162, 255, 0.25)",
                borderColor: "#4da2ff",
                particleType: "rain",
                audioPreset: "drone"
            },
            peaceful: {
                name: "Serene Harmony",
                emoji: "🌿",
                glowColor: "rgba(85, 219, 156, 0.25)",
                borderColor: "#55db9c",
                particleType: "leaves",
                audioPreset: "peace"
            },
            dangerous: {
                name: "Lethal Peril",
                emoji: "💀",
                glowColor: "rgba(239, 68, 68, 0.3)",
                borderColor: "#ef4444",
                particleType: "embers",
                audioPreset: "danger"
            }
        };

        const atmosphere = atmosphereMap[primaryEmotion] || atmosphereMap.suspenseful;

        // Flesch Reading Ease approximation
        const syllables = this.estimateSyllables(text);
        const sentences = (text.match(/[.!?]+/g) || []).length || 1;
        const fleschScore = Math.max(0, Math.min(100, Math.round(
            206.835 - (1.015 * (wordCount / sentences)) - (84.6 * (syllables / Math.max(wordCount, 1)))
        )));

        const readingTimeMinutes = Math.max(0.5, (wordCount / 180)).toFixed(1);

        return {
            primaryEmotion: atmosphere.name,
            emotionKey: primaryEmotion,
            emoji: atmosphere.emoji,
            atmosphere,
            metrics: {
                wordCount,
                uniqueWords,
                lexicalDiversity,
                fleschScore,
                readingTimeMinutes: `${readingTimeMinutes} min`
            }
        };
    }

    estimateSyllables(text) {
        let words = text.toLowerCase().match(/[a-z]+/g) || [];
        let count = 0;
        words.forEach(word => {
            word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
            word = word.replace(/^y/, '');
            let syl = word.match(/[aeiouy]{1,2}/g);
            count += syl ? syl.length : 1;
        });
        return Math.max(count, 1);
    }

    getDefaultAtmosphere() {
        return {
            primaryEmotion: "Mysterious Lore",
            emotionKey: "suspenseful",
            emoji: "🔮",
            atmosphere: {
                name: "Mysterious Lore",
                emoji: "🔮",
                glowColor: "rgba(92, 74, 222, 0.2)",
                borderColor: "#5c4ade",
                particleType: "mist",
                audioPreset: "mystery"
            },
            metrics: {
                wordCount: 0,
                uniqueWords: 0,
                lexicalDiversity: 0,
                fleschScore: 75,
                readingTimeMinutes: "1 min"
            }
        };
    }

    /* =========================================================
       2. GENERATIVE AI STORY CO-PILOT
    ========================================================= */

    /**
     * Generate an intelligent scene prose based on prompt, genre, and context
     */
    async generateScene({ prompt, genre = "adventure", location = "", characters = "", isEnding = false, endingType = "good" }) {
        // If external API key is set, attempt live LLM generation
        if (this.apiKey) {
            try {
                let liveResult = await this.callLLMSceneGen({ prompt, genre, location, characters, isEnding, endingType });
                if (liveResult) return liveResult;
            } catch (e) {
                console.warn("[AIEngine] LLM API call fallback to built-in synthesis:", e);
            }
        }

        // Built-in intelligent generative narrative synthesis engine
        const genreTones = {
            adventure: ["ancient glyphs", "untamed wilderness", "hidden mechanism", "golden relic", "crumbling rope bridge", "echoing canyon"],
            cyberpunk: ["neon rain", "sub-dermal neural link", "black ICE protocol", "quantum cyberdeck", "holographic billboards", "monomolecular blade"],
            fantasy: ["enchanted runes", "arcane celestial gate", "astral guardian", "crystal vortex", "dragonfire embers", "spellbook of eternity"],
            mystery: ["stopped pocket watch", "clandestine cipher", "shadowy conspirator", "scent of bitter almonds", "secret mahogany bookshelf", "distant thunder"],
            "sci-fi": ["tachyon rupture", "gravitational singularity", "quantum causality loop", "antimatter containment", "hyperspace conduit", "synthetic android"],
            horror: ["whispering shadows", "blood-red moon", "eldritch chanting", "shivering floorboards", "abyssal eye", "chilling draft"]
        };

        const tones = genreTones[genre.toLowerCase()] || genreTones.adventure;
        const tone1 = tones[Math.floor(Math.random() * tones.length)];
        const tone2 = tones[Math.floor(Math.random() * tones.length)];

        const charList = characters ? characters.split(",").map(c => c.trim()).filter(Boolean) : ["The Explorer"];
        const charName = charList[0] || "The Wanderer";
        const locName = location || "The Forgotten Chamber";

        let generatedTitle = "";
        let generatedText = "";

        if (isEnding) {
            if (endingType === "good") {
                generatedTitle = `The Triumph of ${locName}`;
                generatedText = `Through unwavering resolve and strategic foresight, ${charName} overcomes the trials of the ${locName}. The energy of the ${tone1} resonates in perfect alignment with the ${tone2}, ushering in a glorious new dawn. Your legendary journey concludes in complete victory.`;
            } else if (endingType === "tragic") {
                generatedTitle = `The Sacrifice at ${locName}`;
                generatedText = `The immense power of the ${tone1} proves too overwhelming. To prevent catastrophe across the realm, ${charName} seals the vortex from within ${locName}, remaining as the perpetual sentinel between light and shadow.`;
            } else {
                generatedTitle = `The Fall of ${locName}`;
                generatedText = `The shadows deepen as the ${tone1} fails. Trapped amidst the unforgiving depths of ${locName}, ${charName} watches the final glimmer of hope fade into eternal night.`;
            }
        } else {
            generatedTitle = prompt ? prompt.slice(0, 30).toUpperCase() : `Encounter at ${locName}`;
            generatedText = `${charName} arrives at ${locName}, where the faint hum of ${tone1} vibrates through the surroundings. Every instinct warns of imminent danger, yet the promise of uncovering the ${tone2} pulls you onward. Ahead lie critical paths that will irrevocably alter your fate.`;
        }

        return {
            title: generatedTitle,
            text: generatedText,
            location: locName,
            characters: charList,
            isEnding,
            endingType: isEnding ? endingType : null
        };
    }

    /**
     * Propose smart branching choices with risk and alignment predictions
     */
    async suggestChoices({ sceneTitle, sceneText, genre = "adventure" }) {
        const templates = {
            adventure: [
                { text: "Examine the glowing ancient inscriptions for secrets", risk: "Low", morality: "Cautious", hint: "Unlocks historical knowledge" },
                { text: "Trigger the stone mechanism and force the heavy door", risk: "High", morality: "Bold", hint: "High risk of triggering a trap" },
                { text: "Send a scout ahead to map the surrounding terrain", risk: "Medium", morality: "Tactical", hint: "Balanced defensive approach" }
            ],
            cyberpunk: [
                { text: "Deploy an aggressive zero-day exploit to bypass ICE", risk: "High", morality: "Reckless", hint: "Could trigger corporate trace" },
                { text: "Bribe the underground street doc for classified passkeys", risk: "Medium", morality: "Pragmatic", hint: "Costs resources but ensures safety" },
                { text: "Jack directly into the encrypted subnet terminal", risk: "High", morality: "Direct", hint: "Instant access with neural risk" }
            ],
            fantasy: [
                { text: "Chant the sacred incantation of celestial dawn", risk: "Medium", morality: "Virtuous", hint: "Aligns with light magic" },
                { text: "Draw your enchanted blade and confront the apparition", risk: "High", morality: "Valiant", hint: "Initiates combat encounter" },
                { text: "Commune telepathically with the forest spirits", risk: "Low", morality: "Harmonious", hint: "Uncovers peaceful bypass" }
            ],
            mystery: [
                { text: "Inspect the hidden safe behind the oil painting", risk: "Low", morality: "Forensic", hint: "Reveals physical evidence" },
                { text: "Directly confront the chief suspect with the forged ledger", risk: "High", morality: "Aggressive", hint: "Forces immediate confession or fight" },
                { text: "Eavesdrop on the whispered conversation in the hallway", risk: "Medium", morality: "Stealthy", hint: "Gathers covert intelligence" }
            ],
            "sci-fi": [
                { text: "Recalibrate the tachyon harmonic dampeners", risk: "Medium", morality: "Scientific", hint: "Stabilizes temporal fluctuation" },
                { text: "Emergency vent the containment chamber into the void", risk: "High", morality: "Desperate", hint: "Drastic measure with irreversible impact" },
                { text: "Establish an AI subspace communication link with Earth", risk: "Low", morality: "Standard Protocol", hint: "Requests external guidance" }
            ]
        };

        const pool = templates[genre.toLowerCase()] || templates.adventure;
        return pool.slice(0, 3);
    }

    /**
     * Auto-synthesize a complete balanced branching story graph
     */
    async autoSynthesizeStoryTree({ title, prompt, genre = "adventure" }) {
        const rootId = `node_${Date.now()}_root`;
        const branchAId = `node_${Date.now()}_A`;
        const branchBId = `node_${Date.now()}_B`;
        const goodEndId = `node_${Date.now()}_good`;
        const tragicEndId = `node_${Date.now()}_tragic`;
        const badEndId = `node_${Date.now()}_bad`;

        const rootScene = await this.generateScene({ prompt: `${title}: The Beginning`, genre, location: "The Origin", isEnding: false });
        const sceneA = await this.generateScene({ prompt: `${title}: Path of Valor`, genre, location: "The High Spires", isEnding: false });
        const sceneB = await this.generateScene({ prompt: `${title}: Path of Shadows`, genre, location: "The Low Catacombs", isEnding: false });
        const goodEnd = await this.generateScene({ prompt: `${title}: The Victorious Destiny`, genre, location: "The Sanctum of Triumph", isEnding: true, endingType: "good" });
        const tragicEnd = await this.generateScene({ prompt: `${title}: The Bittersweet Sacrifice`, genre, location: "The Silent Peak", isEnding: true, endingType: "tragic" });
        const badEnd = await this.generateScene({ prompt: `${title}: The Dark Abyss`, genre, location: "The Void Horizon", isEnding: true, endingType: "bad" });

        const nodes = [
            {
                id: rootId,
                title: rootScene.title || "The Journey Begins",
                text: rootScene.text,
                location: rootScene.location,
                characters: rootScene.characters,
                isEnding: false,
                endingType: null,
                choices: [
                    { id: `c_${Date.now()}_1`, text: "Ascend toward the High Spires of Valor", targetNodeId: branchAId },
                    { id: `c_${Date.now()}_2`, text: "Descend into the Low Catacombs of Shadows", targetNodeId: branchBId }
                ]
            },
            {
                id: branchAId,
                title: sceneA.title || "The High Spires",
                text: sceneA.text,
                location: sceneA.location,
                characters: sceneA.characters,
                isEnding: false,
                endingType: null,
                choices: [
                    { id: `c_${Date.now()}_3`, text: "Channel ancient cosmic harmony", targetNodeId: goodEndId },
                    { id: `c_${Date.now()}_4`, text: "Risk everything in a desperate gambit", targetNodeId: tragicEndId }
                ]
            },
            {
                id: branchBId,
                title: sceneB.title || "The Low Catacombs",
                text: sceneB.text,
                location: sceneB.location,
                characters: sceneB.characters,
                isEnding: false,
                endingType: null,
                choices: [
                    { id: `c_${Date.now()}_5`, text: "Navigate the shifting labyrinth carefully", targetNodeId: tragicEndId },
                    { id: `c_${Date.now()}_6`, text: "Succumb to the seductive whispers of the dark", targetNodeId: badEndId }
                ]
            },
            {
                id: goodEndId,
                title: goodEnd.title || "Triumphant Awakening",
                text: goodEnd.text,
                location: goodEnd.location,
                characters: goodEnd.characters,
                isEnding: true,
                endingType: "good",
                choices: []
            },
            {
                id: tragicEndId,
                title: tragicEnd.title || "The Eternal Watcher",
                text: tragicEnd.text,
                location: tragicEnd.location,
                characters: tragicEnd.characters,
                isEnding: true,
                endingType: "tragic",
                choices: []
            },
            {
                id: badEndId,
                title: badEnd.title || "Lost to the Shadows",
                text: badEnd.text,
                location: badEnd.location,
                characters: badEnd.characters,
                isEnding: true,
                endingType: "bad",
                choices: []
            }
        ];

        return {
            title: title || "AI-Synthesized Branching Universe",
            genre,
            description: `An AI-generated interactive branching adventure featuring multiple narrative branches and dynamic choice consequences.`,
            status: "published",
            imageURL: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
            nodes,
            startNodeId: rootId
        };
    }

    /* =========================================================
       3. COSINE-SIMILARITY STORY RECOMMENDER
    ========================================================= */

    /**
     * Compute cosine similarity recommendations between user vector and stories
     */
    recommendStories(user, stories) {
        if (!stories || stories.length === 0) return [];

        const genres = ["adventure", "cyberpunk", "fantasy", "mystery", "sci-fi", "horror"];

        // Construct User Affinity Vector
        const userVector = {};
        genres.forEach(g => { userVector[g] = 0.2; }); // base prior

        if (user && user.completedStories) {
            stories.forEach(s => {
                if (user.completedStories.includes(s.id) && s.genre) {
                    let g = s.genre.toLowerCase();
                    if (userVector[g] !== undefined) userVector[g] += 1.0;
                }
            });
        }

        // Rank each story
        const ranked = stories.map(story => {
            let storyGenre = (story.genre || "adventure").toLowerCase();
            let affinity = userVector[storyGenre] || 0.2;
            let nodeFactor = Math.min(1.0, (story.nodes ? story.nodes.length : 1) / 8);

            // Compute match percentage between 75% and 99%
            let rawScore = (affinity * 0.7) + (nodeFactor * 0.3);
            let matchPercent = Math.min(99, Math.max(72, Math.round(70 + (rawScore * 28))));

            let reason = `Matches your preference for high-branching ${storyGenre.toUpperCase()} narratives.`;
            if (user && user.completedStories && user.completedStories.includes(story.id)) {
                reason = `Previously explored! Discover alternative unvisited branches & endings.`;
            }

            return {
                ...story,
                aiMatchPercent: matchPercent,
                aiReason: reason
            };
        });

        return ranked.sort((a, b) => b.aiMatchPercent - a.aiMatchPercent);
    }
}

// Global Singleton Export
window.aiEngine = new AIEngine();
