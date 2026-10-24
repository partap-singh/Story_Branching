/**
 * Dynamic Story Engine - Audio Intelligence & Ambient Soundscape Subsystem
 * Web Speech API (TTS AI Narrator) & Web Audio API Procedural Synthesizer.
 */

class AudioEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.audioCtx = null;
        this.activeSoundscape = null;
        this.soundscapeGain = null;
        this.isSoundscapePlaying = false;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.speechRate = 1.0;
        this.speechPitch = 1.0;
        this.selectedVoice = null;

        // Initialize Web Speech voices
        if (this.synth) {
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => this.loadVoices();
            }
            this.loadVoices();
        }
    }

    /* =========================================================
       1. WEB AUDIO PROCEDURAL AMBIENT SOUNDSCAPES
    ========================================================= */

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    /**
     * Start procedural generative soundscape matched to scene sentiment
     * @param {string} preset - "mystery" | "tension" | "cyberpunk" | "victory" | "peace" | "drone"
     */
    startSoundscape(preset = "mystery") {
        this.stopSoundscape();
        const ctx = this.getAudioContext();
        if (!ctx) return;

        this.soundscapeGain = ctx.createGain();
        this.soundscapeGain.gain.setValueAtTime(0.01, ctx.currentTime);
        this.soundscapeGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 2.0);
        this.soundscapeGain.connect(ctx.destination);

        const nodes = [];

        if (preset === "mystery" || preset === "drone") {
            // Ethereal chord (D3, A3, F4) with sweeping filter
            const freqs = [146.83, 220.00, 349.23];
            freqs.forEach(f => {
                const osc = ctx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(f, ctx.currentTime);

                const filter = ctx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(400, ctx.currentTime);
                filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 6.0);

                osc.connect(filter);
                filter.connect(this.soundscapeGain);
                osc.start();
                nodes.push(osc);
            });
        } else if (preset === "tension" || preset === "danger") {
            // Low sub-bass pulse + heart-beat modulation
            const osc = ctx.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(55, ctx.currentTime); // A1

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(200, ctx.currentTime);

            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(1.2, ctx.currentTime); // 72 BPM pulse
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(80, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            osc.connect(filter);
            filter.connect(this.soundscapeGain);
            osc.start();
            lfo.start();
            nodes.push(osc, lfo);
        } else if (preset === "cyberpunk") {
            // Dual detuned sawtooth with resonance
            [110, 110.8].forEach(f => {
                const osc = ctx.createOscillator();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(f, ctx.currentTime);

                const filter = ctx.createBiquadFilter();
                filter.type = "bandpass";
                filter.Q.setValueAtTime(4, ctx.currentTime);
                filter.frequency.setValueAtTime(600, ctx.currentTime);

                osc.connect(filter);
                filter.connect(this.soundscapeGain);
                osc.start();
                nodes.push(osc);
            });
        } else {
            // Peace / Victory warm major chord (C4, G4, E5)
            [261.63, 392.00, 659.25].forEach(f => {
                const osc = ctx.createOscillator();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(f, ctx.currentTime);
                osc.connect(this.soundscapeGain);
                osc.start();
                nodes.push(osc);
            });
        }

        this.activeSoundscape = nodes;
        this.isSoundscapePlaying = true;
    }

    stopSoundscape() {
        if (this.soundscapeGain && this.audioCtx) {
            try {
                this.soundscapeGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);
            } catch (e) {}
        }
        if (this.activeSoundscape) {
            this.activeSoundscape.forEach(n => {
                try { n.stop(); n.disconnect(); } catch (e) {}
            });
            this.activeSoundscape = null;
        }
        this.isSoundscapePlaying = false;
    }

    toggleSoundscape(preset = "mystery") {
        if (this.isSoundscapePlaying) {
            this.stopSoundscape();
            return false;
        } else {
            this.startSoundscape(preset);
            return true;
        }
    }

    /* =========================================================
       2. PROCEDURAL SOUND EFFECTS (SYNTHESIZED)
    ========================================================= */

    playClick() {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
    }

    playRewind() {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    }

    playVictory() {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const time = ctx.currentTime + (i * 0.12);
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.45);
        });
    }

    playWarning() {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        [220, 180].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const time = ctx.currentTime + (i * 0.12);
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        });
    }

    /* =========================================================
       3. WEB SPEECH AI NARRATOR (TTS)
    ========================================================= */

    loadVoices() {
        if (!this.synth) return [];
        const voices = this.synth.getVoices();
        // Prefer natural English voices
        this.selectedVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural"))) || voices[0] || null;
        return voices;
    }

    speak(text, onEnd = null) {
        if (!this.synth) return;
        this.stopSpeech();

        const cleanText = text.replace(/<[^>]*>/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = this.speechRate;
        utterance.pitch = this.speechPitch;
        if (this.selectedVoice) utterance.voice = this.selectedVoice;

        utterance.onend = () => {
            this.isSpeaking = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        this.isSpeaking = true;
        this.synth.speak(utterance);
    }

    stopSpeech() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
    }

    toggleSpeech(text, onEnd = null) {
        if (this.isSpeaking) {
            this.stopSpeech();
            return false;
        } else {
            this.speak(text, onEnd);
            return true;
        }
    }
}

// Global Singleton Export
window.audioEngine = new AudioEngine();
