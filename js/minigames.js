/**
 * 迷你遊戲模組：
 * 1. 接飛盤跑跳挑戰 (Frisbee Catch Mini-Game)
 * 2. 猜猜骨頭在哪裡 (Bone & Cup Shell Mini-Game)
 */

class MiniGamesManager {
    constructor(gameInstance) {
        this.mainGame = gameInstance;
        this.frisbeeActive = false;
        this.cupsActive = false;

        this.initFrisbeeGame();
        this.initCupsGame();
    }

    // =========================================================================
    // 遊戲 1：接飛盤跑跳挑戰
    // =========================================================================
    initFrisbeeGame() {
        this.frisbeeCanvas = document.getElementById('frisbee-canvas');
        if (!this.frisbeeCanvas) return;
        this.ctx = this.frisbeeCanvas.getContext('2d');

        this.jumpBtn = document.getElementById('frisbee-jump-btn');
        this.exitBtn = document.getElementById('exit-frisbee-btn');
        this.scoreEl = document.getElementById('frisbee-score');
        this.timerEl = document.getElementById('frisbee-timer');
        this.comboEl = document.getElementById('frisbee-combo');
        this.container = document.getElementById('frisbee-game-container');

        // 事件綁定
        this.jumpBtn.addEventListener('click', () => this.frisbeeJump());
        this.frisbeeCanvas.addEventListener('pointerdown', () => this.frisbeeJump());
        this.exitBtn.addEventListener('click', () => this.stopFrisbeeGame());

        window.addEventListener('keydown', (e) => {
            if (this.frisbeeActive && (e.code === 'Space' || e.code === 'ArrowUp')) {
                e.preventDefault();
                this.frisbeeJump();
            }
        });
    }

    startFrisbeeGame() {
        this.frisbeeActive = true;
        this.container.classList.remove('hidden');

        // 遊戲狀態重設
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 30;
        this.frisbees = [];
        this.particles = [];
        this.spawnTimer = 0;

        // 寵物玩家參數 (支援二段跳與當前陪伴寵物配色)
        this.dog = {
            x: 120,
            groundY: 340,
            y: 340,
            vy: 0,
            gravity: 0.85,
            jumpStrength: -17.5,
            isGrounded: true,
            jumpCount: 0,
            maxJumps: 2,
            width: 80,
            height: 60,
            runFrame: 0
        };

        this.scoreEl.textContent = '0';
        this.comboEl.textContent = '0';
        this.timerEl.textContent = '30';

        // 倒數計時器
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            if (!this.frisbeeActive) return;
            this.timeLeft--;
            this.timerEl.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                this.endFrisbeeGame();
            }
        }, 1000);

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.frisbeeLoop(t));
    }

    frisbeeJump() {
        if (!this.frisbeeActive) return;
        if (this.dog.isGrounded || this.dog.jumpCount < this.dog.maxJumps) {
            this.dog.vy = this.dog.jumpCount === 0 ? this.dog.jumpStrength : this.dog.jumpStrength * 0.88;
            this.dog.isGrounded = false;
            this.dog.jumpCount++;
            const petType = (this.mainGame && this.mainGame.currentPetType) ? this.mainGame.currentPetType : 'dog';
            window.soundCtrl.playVoice(petType, 'happy');
        }
    }

    frisbeeLoop(timestamp) {
        if (!this.frisbeeActive) return;

        this.updateFrisbee(timestamp);
        this.drawFrisbee();

        requestAnimationFrame((t) => this.frisbeeLoop(t));
    }

    updateFrisbee(timestamp) {
        // 重力與跳躍更新
        this.dog.vy += this.dog.gravity;
        this.dog.y += this.dog.vy;

        if (this.dog.y >= this.dog.groundY) {
            this.dog.y = this.dog.groundY;
            this.dog.vy = 0;
            this.dog.isGrounded = true;
            this.dog.jumpCount = 0;
        }

        this.dog.runFrame += 0.2;

        // 生成飛盤 (含高分黃金星光飛盤！)
        this.spawnTimer++;
        if (this.spawnTimer > 72) {
            this.spawnTimer = 0;
            const isGold = Math.random() < 0.25;
            const colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#e056fd'];
            this.frisbees.push({
                x: 850,
                y: isGold ? (125 + Math.random() * 65) : (180 + Math.random() * 120),
                vx: -(5.8 + Math.random() * 3.8),
                vy: Math.sin(Date.now() / 300) * 0.8,
                radius: isGold ? 21 : 18,
                color: isGold ? '#fbbf24' : colors[Math.floor(Math.random() * colors.length)],
                isGold: isGold,
                caught: false
            });
        }

        // 飛盤移動與碰撞檢測
        for (let i = this.frisbees.length - 1; i >= 0; i--) {
            const f = this.frisbees[i];
            f.x += f.vx;
            f.y += f.vy;

            // 嘴部接住碰撞盒 (小黑狗頭部位置)
            const dogMouthX = this.dog.x + 65;
            const dogMouthY = this.dog.y - 30;
            const dist = Math.hypot(f.x - dogMouthX, f.y - dogMouthY);

            if (dist < 44 && !f.caught) {
                f.caught = true;
                this.combo++;
                const mult = f.isGold ? 2 : 1;
                const earned = 10 * Math.min(this.combo, 5) * mult;
                this.score += earned;
                this.scoreEl.textContent = this.score;
                this.comboEl.textContent = this.combo;

                window.soundCtrl.playCoin();

                // 產生接住金光粒子
                for (let p = 0; p < 12; p++) {
                    this.particles.push({
                        x: f.x,
                        y: f.y,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        color: f.color,
                        alpha: 1,
                        size: 4 + Math.random() * 5
                    });
                }

                this.frisbees.splice(i, 1);
                continue;
            }

            // 飛盤飛出左側邊界未接住 -> 斷連擊
            if (f.x < -30) {
                this.combo = 0;
                this.comboEl.textContent = '0';
                this.frisbees.splice(i, 1);
            }
        }

        // 粒子更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.035;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawFrisbee() {
        const ctx = this.ctx;
        const w = this.frisbeeCanvas.width;
        const h = this.frisbeeCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // 1. 繪製草地與遠景山丘
        ctx.fillStyle = '#6ab04c';
        ctx.fillRect(0, 360, w, 90);
        ctx.fillStyle = '#badc58';
        ctx.fillRect(0, 360, w, 8);

        // 2. 繪製飛盤
        for (const f of this.frisbees) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = f.color;
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.ellipse(f.x, f.y, f.radius, f.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.ellipse(f.x, f.y - 2, f.radius * 0.6, f.radius * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 3. 繪製主角：全黑立耳帥氣小黑狗 (奔跑/跳躍造型)
        this.drawBlackDogRunner(ctx, this.dog.x, this.dog.y, !this.dog.isGrounded);

        // 4. 繪製特效粒子
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // 在 Canvas 上繪製生動的萌寵跑者 (自動對應當前寵物毛色與頭頂徽章)
    drawBlackDogRunner(ctx, x, y, isJumping) {
        ctx.save();
        ctx.translate(x, y);

        const petType = (this.mainGame && this.mainGame.currentPetType) ? this.mainGame.currentPetType : 'dog';
        const paletteMap = {
            dog: { body: '#121418', head: '#181a20', ear: '#0f1115', eye: '#f59e0b' },
            fox: { body: '#e66728', head: '#f07838', ear: '#1e1b18', eye: '#d97706' },
            wolf: { body: '#1e293b', head: '#334155', ear: '#0f172a', eye: '#38bdf8' },
            snow_leopard: { body: '#e2e8f0', head: '#f1f5f9', ear: '#475569', eye: '#38bdf8' },
            capybara: { body: '#9c6638', head: '#aa7243', ear: '#5c3a1e', eye: '#1e293b' },
            red_panda: { body: '#c8431f', head: '#d94e28', ear: '#ffffff', eye: '#1e293b' },
            penguin: { body: '#0f172a', head: '#1e293b', ear: '#f59e0b', eye: '#ffffff' },
            sea_otter: { body: '#6b4423', head: '#f5e6d3', ear: '#5c3a1e', eye: '#1e293b' },
            koala: { body: '#7c8594', head: '#94a3b8', ear: '#f8fafc', eye: '#1e293b' },
            bunny: { body: '#d99b66', head: '#e6b17e', ear: '#fda4af', eye: '#1e293b' },
            lion: { body: '#eab308', head: '#d97706', ear: '#7c2d12', eye: '#f59e0b' },
            panda: { body: '#f8fafc', head: '#ffffff', ear: '#171717', eye: '#171717' },
            fennec: { body: '#fde68a', head: '#fef08a', ear: '#f59e0b', eye: '#1e293b' },
            giraffe: { body: '#fde047', head: '#facc15', ear: '#b45309', eye: '#1e293b' },
            polar_bear: { body: '#f8fafc', head: '#ffffff', ear: '#e2e8f0', eye: '#0f172a' }
        };
        const pal = paletteMap[petType] || paletteMap.dog;

        // 狗陰影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        const shadowScale = isJumping ? 0.6 : 1;
        ctx.ellipse(20, 16 + (isJumping ? 25 : 0), 38 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 尾巴 (翹起搖動)
        ctx.fillStyle = pal.head;
        ctx.beginPath();
        ctx.moveTo(-20, -15);
        ctx.quadraticCurveTo(-45, -35 + Math.sin(Date.now() / 100) * 8, -35, -50);
        ctx.quadraticCurveTo(-25, -30, -15, -10);
        ctx.fill();

        // 身體
        ctx.fillStyle = pal.body;
        ctx.beginPath();
        ctx.ellipse(15, -15, 36, 20, isJumping ? -0.2 : 0, 0, Math.PI * 2);
        ctx.fill();

        // 招牌紅色項圈
        ctx.fillStyle = '#ee5253';
        ctx.beginPath();
        ctx.ellipse(40, -25, 6, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 頭部
        ctx.fillStyle = pal.head;
        ctx.beginPath();
        ctx.ellipse(45, -32, 22, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // 耳朵
        ctx.fillStyle = pal.ear;
        ctx.beginPath();
        ctx.moveTo(35, -45);
        ctx.lineTo(28, -75);
        ctx.lineTo(48, -48);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(48, -46);
        ctx.lineTo(54, -75);
        ctx.lineTo(62, -43);
        ctx.fill();
        // 內耳漸層
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.moveTo(36, -46);
        ctx.lineTo(31, -70);
        ctx.lineTo(45, -48);
        ctx.fill();

        // 吻部與鼻子
        ctx.fillStyle = '#0a0c0e';
        ctx.beginPath();
        ctx.ellipse(62, -26, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛與眼神光
        ctx.fillStyle = pal.eye;
        ctx.beginPath();
        ctx.arc(48, -36, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(47, -37, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 歡快張嘴吐舌
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(63, -22, 4, 0, Math.PI);
        ctx.fill();

        // 奔跑前腿與後腿 (擺動)
        ctx.fillStyle = pal.body;
        const legSwing = isJumping ? 0.8 : Math.sin(this.dog.runFrame) * 16;
        ctx.beginPath();
        ctx.ellipse(32 + legSwing, 0, 6, 14, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-5 - legSwing, 0, 7, 14, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // 頭頂當前出戰寵物徽章
        if (this.mainGame && this.mainGame.getPetEmoji) {
            const emoji = this.mainGame.getPetEmoji(petType, this.mainGame.currentPetVariant);
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(emoji, 42, -82);
        }

        ctx.restore();
    }

    endFrisbeeGame() {
        this.stopFrisbeeGame();

        // 獎勵結算
        const coinsEarned = 100;
        const expEarned = Math.floor(this.score / 3) + 30;

        this.mainGame.addCoins(coinsEarned);
        this.mainGame.addExp(expEarned);
        this.mainGame.stats.mood = Math.min(100, this.mainGame.stats.mood + 25);
        this.mainGame.stats.energy = Math.max(10, this.mainGame.stats.energy - 20);
        this.mainGame.stats.hunger = Math.max(10, this.mainGame.stats.hunger - 15);
        this.mainGame.records.gamesPlayed++;
        this.mainGame.saveGame();
        this.mainGame.updateUI();

        window.soundCtrl.playLevelUp();
        this.mainGame.showToast(`🎉 接飛盤結束！獲得 🪙 ${coinsEarned} 金幣 與 ⚡ ${expEarned} 經驗值！`);
    }

    stopFrisbeeGame() {
        this.frisbeeActive = false;
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.container.classList.add('hidden');
    }

    // =========================================================================
    // 遊戲 2：猜猜骨頭在哪裡 (Cup Shell Game)
    // =========================================================================
    initCupsGame() {
        this.cupsContainer = document.getElementById('cups-game-container');
        this.startCupsBtn = document.getElementById('start-cups-round-btn');
        this.exitCupsBtn = document.getElementById('exit-cups-btn');
        this.cupsStatus = document.getElementById('cups-status-text');
        this.streakEl = document.getElementById('cups-streak');
        this.coinsEl = document.getElementById('cups-coins');

        this.winningCup = 0;
        this.canPick = false;
        this.streak = 0;
        this.totalCoins = 0;

        if (this.startCupsBtn) {
            this.startCupsBtn.addEventListener('click', () => this.startCupsRound());
        }
        if (this.exitCupsBtn) {
            this.exitCupsBtn.addEventListener('click', () => this.stopCupsGame());
        }

        const cupSlots = document.querySelectorAll('.cup-slot');
        cupSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (!this.canPick) return;
                const idx = parseInt(slot.dataset.index);
                this.chooseCup(idx);
            });
        });
    }

    startCupsGame() {
        this.cupsActive = true;
        this.cupsContainer.classList.remove('hidden');
        this.streak = 0;
        this.totalCoins = 0;
        this.streakEl.textContent = '0';
        this.coinsEl.textContent = '0';
        this.resetCupsView();
    }

    resetCupsView() {
        document.querySelectorAll('.cup-slot').forEach(s => s.classList.remove('lifted'));
        document.querySelectorAll('.cup-prize').forEach(p => p.classList.add('hidden'));
        this.cupsStatus.textContent = '請點擊【開始洗碗挑戰】開始！';
        this.startCupsBtn.style.display = 'block';
        this.canPick = false;
    }

    startCupsRound() {
        this.startCupsBtn.style.display = 'none';
        this.winningCup = Math.floor(Math.random() * 3);

        // 1. 先掀開展示骨頭在哪
        document.querySelectorAll('.cup-slot').forEach((slot, idx) => {
            if (idx === this.winningCup) {
                slot.classList.add('lifted');
                document.getElementById(`prize-${idx}`).classList.remove('hidden');
            }
        });
        this.cupsStatus.textContent = '看好囉！骨頭藏在這一碗...';
        window.soundCtrl.playBark('happy');

        // 2. 蓋上並開始隨機洗牌動畫
        setTimeout(() => {
            document.querySelectorAll('.cup-slot').forEach(slot => slot.classList.remove('lifted'));
            document.querySelectorAll('.cup-prize').forEach(p => p.classList.add('hidden'));
            this.cupsStatus.textContent = '快速洗牌中... 盯緊碗盤！';

            this.animateShuffle(4 + this.streak, () => {
                this.cupsStatus.textContent = '洗牌完成！請點選藏有骨頭的碗！';
                this.canPick = true;
            });
        }, 1200);
    }

    animateShuffle(movesLeft, onDone) {
        if (movesLeft <= 0) {
            onDone();
            return;
        }

        const cups = document.querySelectorAll('.cup-item');
        const r1 = Math.floor(Math.random() * 3);
        let r2 = Math.floor(Math.random() * 3);
        while (r1 === r2) r2 = Math.floor(Math.random() * 3);

        cups[r1].style.transform = 'translateY(-15px) scale(1.1)';
        cups[r2].style.transform = 'translateY(-15px) scale(1.1)';
        window.soundCtrl.playBubble();

        setTimeout(() => {
            cups[r1].style.transform = '';
            cups[r2].style.transform = '';
            setTimeout(() => {
                this.animateShuffle(movesLeft - 1, onDone);
            }, 180);
        }, 220);
    }

    chooseCup(chosenIdx) {
        this.canPick = false;
        const chosenSlot = document.querySelector(`.cup-slot[data-index="${chosenIdx}"]`);
        chosenSlot.classList.add('lifted');

        if (chosenIdx === this.winningCup) {
            document.getElementById(`prize-${chosenIdx}`).classList.remove('hidden');
            this.streak++;
            const reward = 100;
            this.totalCoins += reward;

            this.streakEl.textContent = this.streak;
            this.coinsEl.textContent = this.totalCoins;
            this.cupsStatus.textContent = `🎉 太神了！猜對了！獲得 🪙 ${reward} 金幣！`;

            window.soundCtrl.playCoin();
            window.soundCtrl.playBark('happy');
            this.mainGame.addCoins(reward);
            this.mainGame.addExp(20);
        } else {
            // 猜錯，揭曉正確答案
            document.querySelector(`.cup-slot[data-index="${this.winningCup}"]`).classList.add('lifted');
            document.getElementById(`prize-${this.winningCup}`).classList.remove('hidden');

            this.cupsStatus.textContent = `😢 哎呀猜錯了！骨頭在另一碗。連續答對中斷！`;
            this.streak = 0;
            this.streakEl.textContent = '0';
            window.soundCtrl.playBark('whine');
        }

        setTimeout(() => {
            this.resetCupsView();
        }, 2000);
    }

    stopCupsGame() {
        this.cupsActive = false;
        this.cupsContainer.classList.add('hidden');
        this.mainGame.saveGame();
        this.mainGame.updateUI();
    }
}
