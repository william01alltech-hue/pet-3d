/**
 * 音效與音樂合成器 (Web Audio API 零外部依賴)
 * 專屬多寵物語音庫：
 * 1. 🐕‍🦺 黑狗幼犬：清脆奶音吠叫、嚶嚶撒嬌
 * 2. 🐱 緬因貓幼崽：軟萌甜美喵喵叫、咕嚕咕嚕呼嚕聲
 * 3. 🦊 狐狸幼崽：俏皮狐狸嚶嚶叫、狐笑聲
 */

class SoundController {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.initAudioContext();
    }

    initAudioContext() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !this.ctx) {
            this.ctx = new AudioCtx();
        }
    }

    ensureContext() {
        if (!this.ctx) this.initAudioContext();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    // 依據寵物種類播放專屬叫聲
    playVoice(petType = 'dog', mood = 'happy', stage = null) {
        if (!this.soundEnabled) return;
        this.ensureContext();

        if (!stage && window.game && window.game.dogActor) {
            if (petType === 'gibbon') stage = window.game.dogActor.gibbonStage || 'baby';
            else if (petType === 'orca') stage = window.game.dogActor.orcaStage || 'baby';
            else if (petType === 'harpy') stage = window.game.dogActor.harpyStage || 'baby';
            else if (petType === 'elephant') stage = window.game.dogActor.elephantStage || 'baby';
            else if (petType === 'maned_wolf') stage = window.game.dogActor.manedWolfStage || 'baby';
            else if (petType === 'crow') stage = window.game.dogActor.crowStage || 'baby';
            else if (petType === 'capybara') stage = window.game.dogActor.capybaraStage || 'baby';
            else if (petType === 'red_panda') stage = window.game.dogActor.redPandaStage || 'baby';
            else if (petType === 'snow_leopard') stage = window.game.dogActor.snowLeopardStage || 'baby';
            else if (petType === 'penguin') stage = window.game.dogActor.penguinStage || 'baby';
            else if (petType === 'sea_otter') stage = window.game.dogActor.seaOtterStage || 'baby';
            else if (petType === 'koala') stage = window.game.dogActor.koalaStage || 'baby';
            else if (petType === 'bunny') stage = window.game.dogActor.bunnyStage || 'baby';
            else if (petType === 'lion') stage = window.game.dogActor.lionStage || 'baby';
            else if (petType === 'panda') stage = window.game.dogActor.pandaStage || 'baby';
            else if (petType === 'fennec') stage = window.game.dogActor.fennecStage || 'baby';
            else if (petType === 'giraffe') stage = window.game.dogActor.giraffeStage || 'baby';
            else if (petType === 'polar_bear') stage = window.game.dogActor.polarBearStage || 'baby';
            else if (petType === 'hamster') stage = window.game.dogActor.hamsterStage || 'baby';
            else if (petType === 'hedgehog') stage = window.game.dogActor.hedgehogStage || 'baby';
            else if (petType === 'dolphin') stage = window.game.dogActor.dolphinStage || 'baby';
            else if (petType === 'tiger') stage = window.game.dogActor.tigerStage || 'baby';
            else if (petType === 'condor') stage = window.game.dogActor.condorStage || 'baby';
        }
        if (!stage) stage = 'baby';

        if (petType === 'cat') {
            this.playMeow(mood);
        } else if (petType === 'fox') {
            this.playFoxVoice(mood);
        } else if (petType === 'bat') {
            this.playBatVoice(mood);
        } else if (petType === 'wolf') {
            this.playWolfVoice(mood);
        } else if (petType === 'hyena') {
            this.playHyenaVoice(mood);
        } else if (petType === 'cheetah') {
            this.playCheetahVoice(mood);
        } else if (petType === 'crow') {
            this.playCrowVoice(mood);
        } else if (petType === 'maned_wolf') {
            this.playManedWolfVoice(mood, stage);
        } else if (petType === 'elephant') {
            this.playElephantVoice(mood, stage);
        } else if (petType === 'harpy') {
            this.playHarpyVoice(mood, stage);
        } else if (petType === 'orca') {
            this.playOrcaVoice(mood, stage);
        } else if (petType === 'gibbon') {
            this.playGibbonVoice(mood, stage);
        } else if (petType === 'capybara') {
            this.playCapybaraVoice(mood, stage);
        } else if (petType === 'red_panda') {
            this.playRedPandaVoice(mood, stage);
        } else if (petType === 'snow_leopard') {
            this.playSnowLeopardVoice(mood, stage);
        } else if (petType === 'penguin') {
            this.playPenguinVoice(mood, stage);
        } else if (petType === 'sea_otter') {
            this.playSeaOtterVoice(mood, stage);
        } else if (petType === 'koala') {
            this.playKoalaVoice(mood, stage);
        } else if (petType === 'bunny') {
            this.playBunnyVoice(mood, stage);
        } else if (petType === 'lion') {
            this.playLionVoice(mood, stage);
        } else if (petType === 'panda') {
            this.playPandaVoice(mood, stage);
        } else if (petType === 'fennec') {
            this.playFennecVoice(mood, stage);
        } else if (petType === 'giraffe') {
            this.playGiraffeVoice(mood, stage);
        } else if (petType === 'polar_bear') {
            this.playPolarBearVoice(mood, stage);
        } else if (petType === 'hamster') {
            this.playHamsterVoice(mood, stage);
        } else if (petType === 'hedgehog') {
            this.playHedgehogVoice(mood, stage);
        } else if (petType === 'dolphin') {
            this.playDolphinVoice(mood, stage);
        } else if (petType === 'tiger') {
            this.playTigerVoice(mood, stage);
        } else if (petType === 'condor') {
            this.playCondorVoice(mood, stage);
        } else {
            this.playBark(mood);
        }
    }

    // 🦅 安地斯神鷲（Andean Condor）專屬聲音合成器（幼雛軟萌啾鳴 vs 成鳥深沉氣流呼嘯與威嚴低鳴）
    playCondorVoice(mood = 'happy', stage = 'adult') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            const count = (mood === 'sad') ? 1 : 2;
            for (let i = 0; i < count; i++) {
                const t = now + i * 0.14;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1450, t);
                osc.frequency.exponentialRampToValueAtTime(1920, t + 0.06);
                osc.frequency.exponentialRampToValueAtTime(1320, t + 0.12);
                gain.gain.setValueAtTime(0.01, t);
                gain.gain.linearRampToValueAtTime(0.16, t + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.14);
            }
        } else {
            // 成年安地斯神鷲：深沉渾厚的胸腔共鳴與巨翼破風呼嘯聲
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const startF = (mood === 'sad') ? 260 : 340;
            osc.frequency.setValueAtTime(startF, now);
            osc.frequency.exponentialRampToValueAtTime(startF * 1.25, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(startF * 0.72, now + 0.42);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.46);
        }
    }

    // 🐹 黃金倉鼠（頰囊鼠球）專屬聲音合成器 (超萌高頻吱吱聲 ＋ 啃葵花籽咔嚓聲)
    playHamsterVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const count = (mood === 'sad') ? 1 : 3;
        const baseF = (stage === 'baby') ? 2100 : 1780;
        for (let i = 0; i < count; i++) {
            const t = now + i * 0.075;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseF, t);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? baseF * 0.65 : baseF * 1.4, t + 0.055);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.07);
        }
    }

    // 🦔 刺蝟（軟萌小刺球）專屬聲音合成器 (小鼻子嗅聞噗噗氣音 ＋ 軟萌細微啾鳴)
    playHedgehogVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const count = (mood === 'sad') ? 1 : 3;
        for (let i = 0; i < count; i++) {
            const t = now + i * 0.085;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const f0 = (stage === 'baby') ? 1350 : 1080;
            osc.frequency.setValueAtTime(f0, t);
            osc.frequency.exponentialRampToValueAtTime(f0 * 1.35, t + 0.045);
            osc.frequency.exponentialRampToValueAtTime(f0 * 0.85, t + 0.075);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.16, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.078);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
        }
    }

    // 🐬 瓶鼻海豚（微笑天使）專屬聲音合成器 (清脆海豚音哨鳴 ＋ 高頻快樂咔噠聲)
    playDolphinVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const f0 = (stage === 'baby') ? 1650 : 1320;
        osc.frequency.setValueAtTime(f0, now);
        osc.frequency.exponentialRampToValueAtTime(f0 * 2.1, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.4, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(f0 * 2.35, now + 0.38);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);

        if (mood === 'happy') {
            for (let i = 0; i < 4; i++) {
                const ct = now + 0.42 + i * 0.045;
                const cOsc = this.ctx.createOscillator();
                const cGain = this.ctx.createGain();
                cOsc.type = 'triangle';
                cOsc.frequency.setValueAtTime(3600 + i * 250, ct);
                cGain.gain.setValueAtTime(0.15, ct);
                cGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.02);
                cOsc.connect(cGain);
                cGain.connect(this.ctx.destination);
                cOsc.start(ct);
                cOsc.stop(ct + 0.025);
            }
        }
    }

    // 🐅 孟加拉白虎（神獸虎王）專屬聲音合成器 (小黃虎崽奶兇嗷嗚 vs 成年白虎王威震山林虎嘯＋噴氣友好音 Prusten)
    playTigerVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1250, now);
            osc.frequency.setValueAtTime(490, now);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(360, now + 0.30);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.33);
        } else {
            const osc = this.ctx.createOscillator();
            const sub = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            sub.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(92, now + 0.56);
            sub.frequency.setValueAtTime(70, now);
            sub.frequency.exponentialRampToValueAtTime(46, now + 0.56);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(520, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.30, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
            osc.connect(filter);
            sub.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            sub.start(now);
            osc.stop(now + 0.60);
            sub.stop(now + 0.60);
        }
    }

    // 🐼 四川大熊貓（國寶貓熊）專屬聲音合成器 (小團子軟萌「嗯嗯/咩咩」羊叫奶音 ＋ 成年大熊貓啃竹子清脆聲與撒嬌哼鳴)
    playPandaVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            // 熊貓幼崽標誌性高頻奶音「嗯咿～！」
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(920, now);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? 540 : 1480, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(1080, now + 0.28);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.31);
        } else {
            // 成年大熊貓溫厚羊叫「咩嗯～」＋ 清脆咬竹子聲
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(380, now + 0.36);

            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(22, now);
            lfoGain.gain.setValueAtTime(28, now);
            lfo.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 0.38);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.26, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.39);
        }
    }

    // 🦊 撒哈拉耳廓狐（大耳沙漠精靈）專屬聲音合成器 (超萌高頻顫音吱吱叫 Chittering Purr)
    playFennecVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const count = (mood === 'sad') ? 1 : 4;
        const baseF = (stage === 'baby') ? 1680 : 1380;
        for (let i = 0; i < count; i++) {
            const t = now + i * 0.065;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseF + (i % 2) * 260, t);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? baseF * 0.6 : baseF * 1.45, t + 0.055);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.065);
        }
    }

    // 🦒 非洲長頸鹿專屬聲音合成器 (溫柔低頻共鳴 Hum 與小鹿清脆幼鳴)
    playGiraffeVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const f0 = (stage === 'baby') ? 580 : 240;
        osc.frequency.setValueAtTime(f0, now);
        osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? f0 * 0.72 : f0 * 1.42, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.12, now + 0.48);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
    }

    // 🐻‍❄️ 北極熊（極地雪熊王）專屬聲音合成器 (棉花糖小熊奶音哼哼 vs 極地白熊渾厚低吼 Chuff)
    playPolarBearVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(760, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.31);
        } else {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(155, now);
            osc.frequency.exponentialRampToValueAtTime(235, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.48);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(480, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.52);
        }
    }

    // 🦦 海獺（牽手漂浮貝殼海獺）專屬聲音合成器 (幼崽奶萌吱吱叫 ＋ 敲擊貝殼清脆石頭音)
    playSeaOtterVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const f0 = (stage === 'baby') ? 1550 : 1180;
        osc.frequency.setValueAtTime(f0, now);
        osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? f0 * 0.6 : f0 * 1.65, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.15, now + 0.26);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        if (mood === 'happy') {
            // 附帶兩聲清脆敲貝殼音效 (Clack-Clack)
            [0.18, 0.30].forEach(delay => {
                const ct = now + delay;
                const cOsc = this.ctx.createOscillator();
                const cGain = this.ctx.createGain();
                cOsc.type = 'triangle';
                cOsc.frequency.setValueAtTime(2400, ct);
                cOsc.frequency.exponentialRampToValueAtTime(900, ct + 0.025);
                cGain.gain.setValueAtTime(0.16, ct);
                cGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.03);
                cOsc.connect(cGain);
                cGain.connect(this.ctx.destination);
                cOsc.start(ct);
                cOsc.stop(ct + 0.035);
            });
        }
    }

    // 🐨 無尾熊 / 考拉（尤加利樹睡神）專屬聲音合成器 (軟萌尤加利鼻音嚶嚀 ＋ 溫柔咕嚕聲)
    playKoalaVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const fBase = stage === 'baby' ? 780 : 420;
        osc.frequency.setValueAtTime(fBase, now);
        osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? fBase * 0.7 : fBase * 1.4, now + 0.16);
        osc.frequency.exponentialRampToValueAtTime(fBase * 0.95, now + 0.34);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
    }

    // 🐰 垂耳兔（軟綿綿麻糬兔兔）專屬聲音合成器 (輕巧鼻息噗噗聲 ＋ 開心磨牙咕嚕音)
    playBunnyVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        [0, 0.11].forEach((offset, idx) => {
            const t = now + offset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const f = (stage === 'baby' ? 1680 : 1380) + idx * 240;
            osc.frequency.setValueAtTime(f, t);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? f * 0.65 : f * 1.35, t + 0.08);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.17, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
        });
    }

    // 🦁 非洲獅（榮耀大地萬獸之王）專屬聲音合成器 (幼獅辛巴奶凶嗷嗚 ＋ 成體震撼大地王者獅吼)
    playLionVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby' || mood === 'sad') {
            // 幼獅奶凶「嗷嗚～！」(Cute Simba Cub Roar)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? 380 : 1080, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(480, now + 0.34);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } else {
            // 成年獅王：震撼草原的渾厚低頻獅吼 (Majestic King of Beasts Roar)
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc2.type = 'triangle';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(620, now);
            filter.frequency.exponentialRampToValueAtTime(340, now + 0.65);

            osc.frequency.setValueAtTime(115, now);
            osc.frequency.exponentialRampToValueAtTime(175, now + 0.18);
            osc.frequency.exponentialRampToValueAtTime(88, now + 0.65);

            osc2.frequency.setValueAtTime(230, now);
            osc2.frequency.exponentialRampToValueAtTime(340, now + 0.18);
            osc2.frequency.exponentialRampToValueAtTime(170, now + 0.65);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.30, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc2.start(now);
            osc.stop(now + 0.7);
            osc2.stop(now + 0.7);
        }
    }

    // 🍊 水豚（佛系溫泉水豚君）專屬療癒聲音合成器 (幼崽輕柔啾啾口哨音 ＋ 成體泡湯呼嚕與水滴聲)
    playCapybaraVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (mood === 'sad') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(340, now + 0.35);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.37);
            return;
        }

        if (stage === 'baby') {
            // 水豚幼崽特有的高頻輕柔「啾啾～咕嚕」口哨聲 (Gentle Capybara Whistle-Chirp)
            [0, 0.14, 0.28].forEach((offset, idx) => {
                const t = now + offset;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                const baseF = 1150 + idx * 120;
                osc.frequency.setValueAtTime(baseF, t);
                osc.frequency.exponentialRampToValueAtTime(baseF + 420, t + 0.06);
                osc.frequency.exponentialRampToValueAtTime(baseF + 150, t + 0.11);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.12);
            });
        } else {
            // 成體溫泉水豚：療癒低頻呼嚕咕嚕聲 + 溫泉水滴聲
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
            osc.frequency.exponentialRampToValueAtTime(210, now + 0.42);

            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 18;
            lfoGain.gain.value = 25;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 0.43);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.43);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.44);

            // 附帶一聲清脆溫泉水滴聲
            setTimeout(() => this.playBubble(), 180);
        }
    }

    // 🎋 小熊貓 / 紅熊貓（喜馬拉雅火狐）專屬聲音合成器 (清脆啾啾鳥鳴音 & 威嚇噗哧聲)
    playRedPandaVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (mood === 'sad') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(980, now);
            osc.frequency.exponentialRampToValueAtTime(480, now + 0.32);
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.33);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.34);
            return;
        }

        // 小熊貓特有的「啾咿～啾！」(Red Panda Tweet-Quack)
        const notes = stage === 'baby'
            ? [{ t: 0, f1: 1600, f2: 2450, d: 0.11 }, { t: 0.14, f1: 1850, f2: 2700, d: 0.14 }]
            : [{ t: 0, f1: 1200, f2: 1950, d: 0.12 }, { t: 0.15, f1: 1450, f2: 2250, d: 0.14 }, { t: 0.32, f1: 1600, f2: 1100, d: 0.15 }];

        notes.forEach(n => {
            const st = now + n.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.f1, st);
            osc.frequency.exponentialRampToValueAtTime(n.f2, st + n.d * 0.65);
            gain.gain.setValueAtTime(0, st);
            gain.gain.linearRampToValueAtTime(0.22, st + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, st + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(st);
            osc.stop(st + n.d + 0.01);
        });
    }

    // ❄️ 雪豹（喜馬拉雅雪山之王）專屬聲音合成器 (幼崽奶萌喵嗚 ＋ 成體雪山噴鼻呼嚕 Chuff 與低沉豹嘯)
    playSnowLeopardVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby' || mood === 'sad') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const fStart = mood === 'sad' ? 750 : 920;
            const fPeak = mood === 'sad' ? 420 : 1480;
            osc.frequency.setValueAtTime(fStart, now);
            osc.frequency.exponentialRampToValueAtTime(fPeak, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(640, now + 0.34);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } else {
            // 成體雪豹：標誌性的「呼嚕噴氣聲 (Prusten / Chuff)」+ 磁性低鳴
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(680, now);

            osc.frequency.setValueAtTime(165, now);
            osc.frequency.exponentialRampToValueAtTime(245, now + 0.16);
            osc.frequency.exponentialRampToValueAtTime(135, now + 0.45);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.47);
        }
    }

    // 🐧 企鵝（南極帝企鵝）專屬聲音合成器 (幼雛奇異果啾啾叫 ＋ 成體南極號角長鳴)
    playPenguinVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby' || mood === 'sad') {
            // 小企鵝清脆顫音啾啾聲 (Penguin Chick Vibrato Peep)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? 850 : 2250, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(mood === 'sad' ? 600 : 1750, now + 0.28);

            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 28;
            lfoGain.gain.value = 60;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 0.29);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } else {
            // 成年帝企鵝：歡快響亮的雙音節小號鳴叫 (Emperor Penguin Trumpet Honk)
            [0, 0.22].forEach((offset, idx) => {
                const t = now + offset;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                const f1 = idx === 0 ? 520 : 640;
                const f2 = idx === 0 ? 780 : 920;
                osc.frequency.setValueAtTime(f1, t);
                osc.frequency.exponentialRampToValueAtTime(f2, t + 0.12);
                osc.frequency.exponentialRampToValueAtTime(f1 * 0.9, t + 0.2);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.24, t + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.21);
            });
        }
    }

    // 🐒 長臂猿（金絲長臂猿）專屬天籟長鳴合成器 (幼猿奶萌唧唧討抱抱 ＋ 成猿穿透萬里雲霄的天籟雙重奏猿啼)
    playGibbonVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;

        if (stage === 'baby') {
            // 幼猿：清脆奶萌的求抱抱呼喚音 (Sweet Baby Peep-Whoop)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1450, now);
            osc.frequency.exponentialRampToValueAtTime(2600, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(1950, now + 0.28);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);

            // 第二聲雀躍小尾音
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(2200, now + 0.18);
            osc2.frequency.exponentialRampToValueAtTime(3100, now + 0.28);
            gain2.gain.setValueAtTime(0.12, now + 0.18);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(now + 0.18);
            osc2.stop(now + 0.33);

        } else {
            // 成體：「兩岸猿聲啼不住」高空空靈悠揚的林冠雙重奏啼鳴 (Melodious Canopy Great Call)
            const phrases = [
                { start: 0, dur: 0.24, fStart: 720, fPeak: 1450, fEnd: 1100 },
                { start: 0.28, dur: 0.32, fStart: 950, fPeak: 1980, fEnd: 1650 },
                { start: 0.65, dur: 0.45, fStart: 1200, fPeak: 2450, fEnd: 1800 }
            ];

            phrases.forEach(p => {
                const pTime = now + p.start;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';

                osc.frequency.setValueAtTime(p.fStart, pTime);
                osc.frequency.exponentialRampToValueAtTime(p.fPeak, pTime + p.dur * 0.55);
                osc.frequency.exponentialRampToValueAtTime(p.fEnd, pTime + p.dur);

                gain.gain.setValueAtTime(0, pTime);
                gain.gain.linearRampToValueAtTime(0.26, pTime + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, pTime + p.dur);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(pTime);
                osc.stop(pTime + p.dur + 0.02);
            });
        }
    }

    // 🐋 虎鯨（海洋霸主・殺人鯨）專屬聲音合成器 (幼鯨空靈海豚口哨 ＋ 成體深海霸王長嘯與回聲定位點擊)
    playOrcaVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;

        if (stage === 'baby') {
            // 幼鯨：清脆空靈的高頻海豚音口哨 (Baby Orca Whistle) + 輕快小回聲點擊
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1350, now);
            osc.frequency.exponentialRampToValueAtTime(2600, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(1800, now + 0.32);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.33);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.34);

            // 附帶一組幼鯨回聲定位喀噠聲 (Echolocation clicks)
            for (let i = 0; i < 3; i++) {
                const cTime = now + 0.36 + i * 0.045;
                const cOsc = this.ctx.createOscillator();
                const cGain = this.ctx.createGain();
                cOsc.type = 'triangle';
                cOsc.frequency.setValueAtTime(2800, cTime);
                cGain.gain.setValueAtTime(0.12, cTime);
                cGain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.015);
                cOsc.connect(cGain);
                cGain.connect(this.ctx.destination);
                cOsc.start(cTime);
                cOsc.stop(cTime + 0.018);
            }

        } else {
            // 成體：空靈雄渾的深海長鳴 (Majestic Ocean Whale Song) + 噴氣孔氣流音
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';

            // 悠揚多段滑音與顫音
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(1450, now + 0.22);
            osc.frequency.exponentialRampToValueAtTime(920, now + 0.55);
            osc.frequency.exponentialRampToValueAtTime(1180, now + 0.78);

            // 顫音 Vibrato LFO
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 6.5;
            lfoGain.gain.value = 35;
            lfo.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 0.82);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.06);
            gain.gain.setValueAtTime(0.26, now + 0.55);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.83);

            // 噴氣孔海面噴水氣流聲 (Blowhole water spray whoosh)
            try {
                const bufferSize = this.ctx.sampleRate * 0.35;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1800, now);
                filter.Q.value = 1.8;

                const sprayGain = this.ctx.createGain();
                sprayGain.gain.setValueAtTime(0.08, now);
                sprayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                noise.connect(filter);
                filter.connect(sprayGain);
                sprayGain.connect(this.ctx.destination);
                noise.start(now);
            } catch (e) {}

            // 成體強勁回聲定位點擊串
            for (let i = 0; i < 4; i++) {
                const cTime = now + 0.45 + i * 0.06;
                const cOsc = this.ctx.createOscillator();
                const cGain = this.ctx.createGain();
                cOsc.type = 'triangle';
                cOsc.frequency.setValueAtTime(3200, cTime);
                cGain.gain.setValueAtTime(0.14, cTime);
                cGain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.016);
                cOsc.connect(cGain);
                cGain.connect(this.ctx.destination);
                cOsc.start(cTime);
                cOsc.stop(cTime + 0.02);
            }
        }
    }

    // 🦅 哈比鷹（美洲角雕）專屬聲音合成器 (台北動物園幼雛軟萌小鷹嘰嘰叫 ＋ 雨林角雕皇穿透蒼穹裂帛長嘯)
    playHarpyVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            // 幼雛：台北動物園純白雪球小鷹清脆歡快的幼鳴 (Chirping Raptor Peep)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1250, now);
            osc.frequency.exponentialRampToValueAtTime(2600, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(1600, now + 0.22);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.24);
        } else {
            // 成年角雕：刺破亞馬遜雨林天際的裂帛長嘯 (Piercing Harpy Raptor Cry！)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(2800, now + 0.15);
            filter.frequency.exponentialRampToValueAtTime(1100, now + 0.55);
            filter.Q.setValueAtTime(3.5, now);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.exponentialRampToValueAtTime(2450, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(1300, now + 0.58);

            // 猛禽嘯鳴高頻顫音 (Screech Flutter LFO)
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(24, now); // 24Hz 猛禽鳴叫氣流顫震
            lfoGain.gain.setValueAtTime(35, now);
            lfo.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 0.6);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.36, now + 0.04);
            gain.gain.setValueAtTime(0.32, now + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.61);
        }
    }

    // 🐘 大象專屬聲音合成器 (小象軟萌長鼻幼鳴 ＋ 成年象王霸氣銅管長鳴與草原次聲波轟鳴)
    playElephantVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            // 小象寶寶：清脆歡快的小象尖叫幼鳴 (High-pitched playful trumpet peep)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.Q.setValueAtTime(3.5, now);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(1350, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.28);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.33);
        } else {
            // 成年象王：響徹非洲草原的標誌性「銅管昂首長鳴」(Brass Trumpet Call) + 低頻次聲胸腔共振
            // 1. 銅管昂鳴
            const oscBrass = this.ctx.createOscillator();
            const gainBrass = this.ctx.createGain();
            const filterBrass = this.ctx.createBiquadFilter();

            filterBrass.type = 'bandpass';
            filterBrass.frequency.setValueAtTime(800, now);
            filterBrass.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
            filterBrass.frequency.exponentialRampToValueAtTime(600, now + 0.65);
            filterBrass.Q.setValueAtTime(4.0, now);

            oscBrass.type = 'sawtooth';
            // 象鳴特有的起伏滑音 (Pitch Glissando)
            oscBrass.frequency.setValueAtTime(240, now);
            oscBrass.frequency.exponentialRampToValueAtTime(540, now + 0.18);
            oscBrass.frequency.exponentialRampToValueAtTime(460, now + 0.45);
            oscBrass.frequency.exponentialRampToValueAtTime(210, now + 0.7);

            // 震顫顫音 (Brass Vibrato LFO)
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(18, now); // 18Hz 象鼻氣流震顫
            lfoGain.gain.setValueAtTime(25, now);
            lfo.connect(oscBrass.frequency);
            lfo.start(now);
            lfo.stop(now + 0.72);

            gainBrass.gain.setValueAtTime(0, now);
            gainBrass.gain.linearRampToValueAtTime(0.35, now + 0.05);
            gainBrass.gain.setValueAtTime(0.32, now + 0.45);
            gainBrass.gain.exponentialRampToValueAtTime(0.001, now + 0.72);

            oscBrass.connect(filterBrass);
            filterBrass.connect(gainBrass);
            gainBrass.connect(this.ctx.destination);
            oscBrass.start(now);
            oscBrass.stop(now + 0.73);

            // 2. 伴隨的低頻沉厚隆隆聲 (Sub Rumble)
            const oscRumble = this.ctx.createOscillator();
            const gainRumble = this.ctx.createGain();
            oscRumble.type = 'sine';
            oscRumble.frequency.setValueAtTime(65, now);
            oscRumble.frequency.exponentialRampToValueAtTime(45, now + 0.6);

            gainRumble.gain.setValueAtTime(0, now);
            gainRumble.gain.linearRampToValueAtTime(0.28, now + 0.08);
            gainRumble.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

            oscRumble.connect(gainRumble);
            gainRumble.connect(this.ctx.destination);
            oscRumble.start(now);
            oscRumble.stop(now + 0.66);
        }
    }

    // 🌾 南美鬃狼專屬聲音合成器 (小灰崽軟萌嚶嚶 ＋ 成年鬃狼標誌性空靈吼吠 Roar-Bark)
    playManedWolfVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            // 幼崽：軟萌委屈的小奶犬嚶嚶 yip-yip
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(680, now);
            osc.frequency.exponentialRampToValueAtTime(1180, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(520, now + 0.22);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.23);
        } else {
            // 成年鬃狼：草原上傳播數公里的標誌性「吼吠」(Roar-Bark: 渾厚胸腔共鳴 ＋ 破空吠聲)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(450, now + 0.35);

            osc.type = 'sawtooth';
            // 前綴喉音快速升至飽滿爆發，隨後深沉下墜
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.38);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.41);
        }
    }

    // 🪶 烏鴉/渡鴉專屬聲音合成器 (黑煤球幼雛軟萌索食啾鳴 ＋ 渡鴉大佬霸氣深沉嘎鳴)
    playCrowVoice(mood = 'happy', stage = 'baby') {
        const now = this.ctx.currentTime;
        if (stage === 'baby') {
            // 幼雛：軟萌清脆連續索食鳥鳴「唧唧～ 啾啾～」
            const chirps = (mood === 'happy') ? 3 : 2;
            for (let i = 0; i < chirps; i++) {
                const t = now + i * 0.12;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(2200, t);
                filter.Q.setValueAtTime(4.0, t);

                osc.type = 'sine';
                // 幼鳥索食微上揚再微降的高頻清音
                const startFreq = 1650 + Math.random() * 120;
                osc.frequency.setValueAtTime(startFreq, t);
                osc.frequency.exponentialRampToValueAtTime(2450, t + 0.04);
                osc.frequency.exponentialRampToValueAtTime(1400, t + 0.09);

                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.18, t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + 0.095);
            }
        } else {
            // 成體渡鴉：深沉、沙啞、極具穿透力與金屬泛音的渡鴉長啼「嘎——！克洛——！」
            const count = (mood === 'happy') ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const t = now + i * 0.38;
                // 主音源（鋸齒波模擬聲帶撕扯震動）
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                // 渡鴉共鳴腔（約 650Hz 喉部共鳴峰）
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(700, t);
                filter.Q.setValueAtTime(3.2, t);

                osc1.type = 'sawtooth';
                osc2.type = 'square';

                // 經典渡鴉音高走向：340Hz -> 270Hz 沉穩微降
                osc1.frequency.setValueAtTime(340, t);
                osc1.frequency.exponentialRampToValueAtTime(280, t + 0.12);
                osc1.frequency.exponentialRampToValueAtTime(220, t + 0.28);

                osc2.frequency.setValueAtTime(348, t); // 輕微微失諧增強沙啞感
                osc2.frequency.exponentialRampToValueAtTime(288, t + 0.12);
                osc2.frequency.exponentialRampToValueAtTime(225, t + 0.28);

                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
                gain.gain.setValueAtTime(0.18, t + 0.18);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc1.start(t);
                osc2.start(t);
                osc1.stop(t + 0.33);
                osc2.stop(t + 0.33);
            }
        }
    }

    // 🦴 斑鬣狗魔性咯咯歡笑聲與空靈呼喚 (Hyena Laugh & Whoop)
    playHyenaVoice(mood = 'happy') {
        const now = this.ctx.currentTime;
        // 4 ~ 5 次快速歡快的斷奏咯咯笑聲 (Staccato Laugh Giggles)
        const burstCount = (mood === 'happy') ? 5 : 3;
        for (let i = 0; i < burstCount; i++) {
            const t = now + i * 0.11;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(750 + i * 40, t);
            filter.Q.setValueAtTime(2.5, t);

            osc.type = 'sawtooth';
            // 咯咯笑特徵：音高快速在 520Hz 到 820Hz 之間上揚並急速落下
            const baseFreq = 520 + (i % 2 === 0 ? 60 : 0);
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq + 280, t + 0.04);
            osc.frequency.exponentialRampToValueAtTime(baseFreq - 80, t + 0.09);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.1);
        }

        // 接一個標誌性的結尾微翹呼嚕音 (Slight closing Whoop)
        const endT = now + burstCount * 0.11;
        const whoopOsc = this.ctx.createOscillator();
        const whoopGain = this.ctx.createGain();
        whoopOsc.type = 'sine';
        whoopOsc.frequency.setValueAtTime(420, endT);
        whoopOsc.frequency.exponentialRampToValueAtTime(680, endT + 0.16);
        whoopGain.gain.setValueAtTime(0, endT);
        whoopGain.gain.linearRampToValueAtTime(0.12, endT + 0.04);
        whoopGain.gain.exponentialRampToValueAtTime(0.001, endT + 0.22);
        whoopOsc.connect(whoopGain);
        whoopGain.connect(this.ctx.destination);
        whoopOsc.start(endT);
        whoopOsc.stop(endT + 0.23);
    }

    // 🐺 冰眸黑狼悠遠長嚎聲 (Wolf Howl & Pup Awoo)
    playWolfVoice(mood = 'happy') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(2.2, now);

        // 主頻率：從中低音悠揚滑升至高音長鳴再漸退
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.35);
        osc.frequency.setValueAtTime(460, now + 0.85);
        osc.frequency.exponentialRampToValueAtTime(310, now + 1.55);

        // 和聲伴音增加曠野厚重感
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(260 * 1.5, now);
        osc2.frequency.exponentialRampToValueAtTime(460 * 1.5, now + 0.35);
        osc2.frequency.setValueAtTime(460 * 1.5, now + 0.85);
        osc2.frequency.exponentialRampToValueAtTime(310 * 1.5, now + 1.55);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
        gain.gain.setValueAtTime(0.18, now + 0.85);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 1.62);
        osc2.stop(now + 1.62);
    }

    // 🐆 獵豹專屬高頻清脆鳥鳴啾啾聲與親暱呼嚕 (Cheetah Bird-like Chirp & Purr)
    playCheetahVoice(mood = 'happy') {
        const now = this.ctx.currentTime;
        // 獵豹最具生物學特色的高頻「啾啾」聲（Chirp-chirp）
        const chirpCount = (mood === 'happy') ? 3 : 2;
        for (let i = 0; i < chirpCount; i++) {
            const startT = now + i * 0.14;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800 + i * 120, startT);
            filter.Q.setValueAtTime(4.0, startT);

            osc.type = 'sine';
            // 典型鳥鳴啾啾：從 1350Hz 迅速滑升至 2200Hz 再急速回落
            osc.frequency.setValueAtTime(1350 + i * 80, startT);
            osc.frequency.exponentialRampToValueAtTime(2350 + i * 100, startT + 0.045);
            osc.frequency.exponentialRampToValueAtTime(1400, startT + 0.095);

            gain.gain.setValueAtTime(0, startT);
            gain.gain.linearRampToValueAtTime(0.18, startT + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.11);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startT);
            osc.stop(startT + 0.12);
        }

        // 伴隨親暱滿足的獵豹震動呼嚕聲 (Purring)
        if (mood === 'happy') {
            const purrStart = now + chirpCount * 0.14;
            const purrOsc = this.ctx.createOscillator();
            const purrMod = this.ctx.createOscillator();
            const purrModGain = this.ctx.createGain();
            const purrGain = this.ctx.createGain();

            purrMod.type = 'sine';
            purrMod.frequency.setValueAtTime(32, purrStart); // 32Hz 喉腔震動
            purrModGain.gain.setValueAtTime(0.08, purrStart);

            purrOsc.type = 'triangle';
            purrOsc.frequency.setValueAtTime(85, purrStart);

            purrGain.gain.setValueAtTime(0, purrStart);
            purrGain.gain.linearRampToValueAtTime(0.12, purrStart + 0.08);
            purrGain.gain.exponentialRampToValueAtTime(0.001, purrStart + 0.45);

            purrMod.connect(purrGain.gain);
            purrOsc.connect(purrGain);
            purrGain.connect(this.ctx.destination);

            purrMod.start(purrStart);
            purrOsc.start(purrStart);
            purrMod.stop(purrStart + 0.46);
            purrOsc.stop(purrStart + 0.46);
        }
    }

    // 🦇 狐蝠（果蝠）幼崽軟糯唧唧叫聲 (Bat Chirp / Squeak)
    playBatVoice(mood = 'happy') {
        const now = this.ctx.currentTime;
        const count = (mood === 'happy') ? 3 : 2;
        for (let i = 0; i < count; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            const startT = now + i * 0.12;
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1600 + i * 150, startT);
            filter.Q.setValueAtTime(3.0, startT);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400 + i * 120, startT);
            osc.frequency.exponentialRampToValueAtTime(2200 + i * 80, startT + 0.05);
            osc.frequency.exponentialRampToValueAtTime(1250, startT + 0.1);

            gain.gain.setValueAtTime(0, startT);
            gain.gain.linearRampToValueAtTime(0.14, startT + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.1);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startT);
            osc.stop(startT + 0.11);
        }
    }

    // 🐱 貓咪幼崽喵喵叫與呼嚕聲
    playMeow(mood = 'happy') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, now);

        osc.type = 'sine';
        // 甜美漸升再微降的「喵～嗚」
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.16);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.42);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
    }

    // 🦊 狐狸幼崽嚶嚶嬉笑聲 (Fox Gecker / Chirp)
    playFoxVoice(mood = 'happy') {
        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                if (!this.soundEnabled) return;
                const now2 = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(820, now2);
                osc.frequency.exponentialRampToValueAtTime(1350, now2 + 0.05);
                osc.frequency.exponentialRampToValueAtTime(700, now2 + 0.12);

                gain.gain.setValueAtTime(0.16, now2);
                gain.gain.exponentialRampToValueAtTime(0.001, now2 + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now2);
                osc.stop(now2 + 0.12);
            }, i * 90);
        }
    }

    // 🐕‍🦺 小黑狗幼犬吠叫
    playBark(type = 'happy') {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'happy' || type === 'puppy') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(950, now + 0.06);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.14);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

            osc.start(now);
            osc.stop(now + 0.14);

            setTimeout(() => {
                if (!this.soundEnabled) return;
                const now2 = this.ctx.currentTime;
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                const filter2 = this.ctx.createBiquadFilter();
                filter2.type = 'lowpass';
                filter2.frequency.setValueAtTime(2400, now2);
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(700, now2);
                osc2.frequency.exponentialRampToValueAtTime(1050, now2 + 0.05);
                osc2.frequency.exponentialRampToValueAtTime(550, now2 + 0.12);

                gain2.gain.setValueAtTime(0, now2);
                gain2.gain.linearRampToValueAtTime(0.2, now2 + 0.02);
                gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.12);

                osc2.connect(filter2);
                filter2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.start(now2);
                osc2.stop(now2 + 0.12);
            }, 100);

        } else if (type === 'whine') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(680, now);
            osc.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
            osc.frequency.exponentialRampToValueAtTime(550, now + 0.38);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.16, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc.start(now);
            osc.stop(now + 0.38);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(360, now);
            osc.frequency.exponentialRampToValueAtTime(580, now + 0.06);
            osc.frequency.exponentialRampToValueAtTime(280, now + 0.2);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.start(now);
            osc.stop(now + 0.2);
        }
    }

    playEat() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(350 + Math.random() * 150, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.06);
            }, i * 80);
        }
    }

    playPet() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.15);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playBubble() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 700 + Math.random() * 400;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 350, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playCoin() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now);
        osc.frequency.setValueAtTime(1396.91, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playLevelUp() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        const notes = [659.25, 783.99, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            }, idx * 100);
        });
    }

    playClick() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.03);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
    }
}

window.soundCtrl = new SoundController();
