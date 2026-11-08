/**
 * 全黑立耳小黑狗 (Black Pointy-Eared Dog) 動態角色控制器
 * 具備純黑油亮毛色、生動立耳抖動、搖尾巴、表情切換與配件圖層
 */

class BlackDogActor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentState = 'idle'; // idle, happy, pet, eat, bath, sleep, sit, paw, rollover, bark
        this.eyeState = 'normal';   // normal, happy, blink, sleep, look-left, look-right, dizzy
        this.mouthState = 'smile';  // smile, open, pant, chew, bark
        this.earTwitching = false;
        this.tailSpeed = 'normal';  // normal, fast, still

        this.equipped = {
            collar: 'red_collar', // 預設經典紅色項圈
            glasses: null,
            hat: null,
            cape: null
        };

        this.blinkTimer = null;
        this.idleActionTimer = null;

        this.init();
    }

    init() {
        this.render();
        this.startLifeCycles();
    }

    // 建立小黑狗的向量 SVG 骨架
    render() {
        this.container.innerHTML = `
        <div class="dog-skeleton" id="dog-skeleton">
            <svg viewBox="0 0 300 300" class="dog-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <!-- 黑色毛髮油亮漸層 -->
                    <linearGradient id="blackCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#2c3038" />
                        <stop offset="40%" stop-color="#181a20" />
                        <stop offset="100%" stop-color="#0f1115" />
                    </linearGradient>

                    <!-- 深黑光影層 -->
                    <linearGradient id="blackDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1e2129" />
                        <stop offset="100%" stop-color="#0a0c0e" />
                    </linearGradient>

                    <!-- 立耳內部微粉黑漸層 -->
                    <linearGradient id="innerEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3d2a35" />
                        <stop offset="60%" stop-color="#2d1c25" />
                        <stop offset="100%" stop-color="#181a20" />
                    </linearGradient>

                    <!-- 琥珀金色大眼光澤 -->
                    <radialGradient id="eyeAmberGrad" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#f59e0b" />
                        <stop offset="65%" stop-color="#b45309" />
                        <stop offset="100%" stop-color="#451a03" />
                    </radialGradient>

                    <!-- 陰影濾鏡 -->
                    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="rgba(0,0,0,0.25)"/>
                    </filter>
                </defs>

                <!-- 地面陰影 -->
                <ellipse cx="150" cy="272" rx="75" ry="14" fill="rgba(0,0,0,0.18)" id="dog-ground-shadow" />

                <!-- 披風配件 (底層) -->
                <g id="acc-cape" class="acc-layer"></g>

                <!-- 尾巴 (在身體後方，擺動樞紐在 x:95, y:210) -->
                <g id="dog-tail-group" class="tail-wag-normal">
                    <!-- 帥氣立耳黑狗的鐮刀型或捲尾 -->
                    <path d="M 95 210 Q 55 190 50 140 Q 62 135 72 155 Q 85 185 105 210 Z" fill="url(#blackCoatGrad)" />
                    <!-- 尾巴尖端光澤 -->
                    <path d="M 52 145 Q 50 140 55 138 Q 60 142 58 152 Z" fill="#3f4452" opacity="0.6"/>
                </g>

                <!-- 後腿與腳掌 -->
                <g id="dog-back-legs">
                    <ellipse cx="90" cy="245" rx="22" ry="18" fill="url(#blackDarkGrad)" />
                    <ellipse cx="210" cy="245" rx="22" ry="18" fill="url(#blackDarkGrad)" />
                </g>

                <!-- 身體主幹 (烏黑油亮) -->
                <g id="dog-body-group">
                    <path d="M 100 170 Q 150 150 200 170 Q 220 220 205 255 Q 150 265 95 255 Q 80 220 100 170 Z" 
                          fill="url(#blackCoatGrad)" filter="url(#dropShadow)" />
                    <!-- 胸前微亮黑色胸毛反光 -->
                    <path d="M 135 180 Q 150 195 165 180 Q 155 225 145 225 Z" fill="#2d323e" opacity="0.75" />
                </g>

                <!-- 前腿與肉球腳掌 -->
                <g id="dog-front-legs">
                    <!-- 左前腿 -->
                    <g id="leg-left">
                        <rect x="115" y="210" width="22" height="52" rx="11" fill="url(#blackCoatGrad)" />
                        <ellipse cx="126" cy="262" rx="13" ry="8" fill="#14161b" />
                    </g>
                    <!-- 右前腿 (可舉起握手) -->
                    <g id="leg-right">
                        <rect x="163" y="210" width="22" height="52" rx="11" fill="url(#blackCoatGrad)" />
                        <ellipse cx="174" cy="262" rx="13" ry="8" fill="#14161b" />
                    </g>
                </g>

                <!-- 項圈配件 -->
                <g id="acc-collar" class="acc-layer"></g>

                <!-- 頭部組 (包含立耳、臉龐、眼睛、嘴巴) -->
                <g id="dog-head-group">
                    <!-- 🐕‍🦺 招牌特徵：高挺帥氣的黑色立耳 (Pointy Erect Ears) -->
                    <!-- 左立耳 (點擊可抖動) -->
                    <g id="ear-left" class="dog-ear ear-left-origin">
                        <!-- 外耳黑毛 -->
                        <path d="M 102 125 L 70 30 Q 88 20 120 75 Z" fill="url(#blackDarkGrad)" />
                        <!-- 內耳粉深色 -->
                        <path d="M 98 115 L 76 42 Q 90 35 112 80 Z" fill="url(#innerEarGrad)" />
                        <!-- 耳緣立體亮光 -->
                        <path d="M 70 30 Q 75 22 88 20" stroke="#4b5563" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>

                    <!-- 右立耳 (點擊可抖動) -->
                    <g id="ear-right" class="dog-ear ear-right-origin">
                        <!-- 外耳黑毛 -->
                        <path d="M 198 125 L 230 30 Q 212 20 180 75 Z" fill="url(#blackDarkGrad)" />
                        <!-- 內耳粉深色 -->
                        <path d="M 202 115 L 224 42 Q 210 35 188 80 Z" fill="url(#innerEarGrad)" />
                        <!-- 耳緣立體亮光 -->
                        <path d="M 230 30 Q 225 22 212 20" stroke="#4b5563" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>

                    <!-- 圓潤帥氣的黑犬臉龐 -->
                    <ellipse cx="150" cy="120" rx="56" ry="50" fill="url(#blackCoatGrad)" filter="url(#dropShadow)" />

                    <!-- 頭頂毛髮光澤 -->
                    <ellipse cx="150" cy="85" rx="30" ry="10" fill="#374151" opacity="0.4" />

                    <!-- 靈動大眼睛 -->
                    <g id="dog-eyes">
                        <!-- 左眼 -->
                        <g id="eye-left" transform="translate(122, 110)">
                            <ellipse cx="0" cy="0" rx="12" ry="14" fill="#0f172a" class="eye-outer" />
                            <ellipse cx="0" cy="1" rx="9" ry="11" fill="url(#eyeAmberGrad)" class="eye-iris" />
                            <circle cx="1" cy="2" r="5" fill="#050505" class="eye-pupil" />
                            <!-- 眼神光芒 -->
                            <circle cx="-3" cy="-4" r="3.5" fill="#ffffff" class="eye-shine-1" />
                            <circle cx="3" cy="4" r="1.8" fill="#ffffff" class="eye-shine-2" />
                            <!-- 眨眼閉眼時的弧線 (預設隱藏) -->
                            <path d="M -12 2 Q 0 -6 12 2" stroke="#111827" stroke-width="3.5" fill="none" stroke-linecap="round" class="eye-closed" style="display:none;" />
                        </g>

                        <!-- 右眼 -->
                        <g id="eye-right" transform="translate(178, 110)">
                            <ellipse cx="0" cy="0" rx="12" ry="14" fill="#0f172a" class="eye-outer" />
                            <ellipse cx="0" cy="1" rx="9" ry="11" fill="url(#eyeAmberGrad)" class="eye-iris" />
                            <circle cx="-1" cy="2" r="5" fill="#050505" class="eye-pupil" />
                            <!-- 眼神光芒 -->
                            <circle cx="-3" cy="-4" r="3.5" fill="#ffffff" class="eye-shine-1" />
                            <circle cx="3" cy="4" r="1.8" fill="#ffffff" class="eye-shine-2" />
                            <!-- 眨眼閉眼時的弧線 -->
                            <path d="M -12 2 Q 0 -6 12 2" stroke="#111827" stroke-width="3.5" fill="none" stroke-linecap="round" class="eye-closed" style="display:none;" />
                        </g>
                    </g>

                    <!-- 吻部與鼻子 (Muzzle & Nose) -->
                    <g id="dog-snout">
                        <ellipse cx="150" cy="138" rx="26" ry="18" fill="#121418" />
                        <!-- 黑色濕潤鼻子 -->
                        <path d="M 141 128 C 141 124, 159 124, 159 128 C 159 135, 150 139, 150 139 C 150 139, 141 135, 141 128 Z" fill="#05070a" />
                        <!-- 鼻頭高光 -->
                        <ellipse cx="147" cy="127" rx="3.5" ry="1.5" fill="#ffffff" opacity="0.75" />
                        <ellipse cx="153" cy="127" rx="2" ry="1" fill="#ffffff" opacity="0.6" />
                    </g>

                    <!-- 嘴巴與吐舌頭 (Mouth & Tongue) -->
                    <g id="dog-mouth">
                        <!-- 微笑三瓣嘴 -->
                        <path id="mouth-line" d="M 142 143 Q 150 148 150 140 Q 150 148 158 143" stroke="#262626" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        
                        <!-- 俏皮粉紅舌頭 (喘氣或開心時吐出) -->
                        <g id="dog-tongue" class="tongue-pant" style="display: none;">
                            <path d="M 144 144 C 144 158 156 158 156 144 Z" fill="#ff7675" />
                            <line x1="150" y1="144" x2="150" y2="154" stroke="#d63031" stroke-width="1.5" />
                        </g>
                    </g>

                    <!-- 墨鏡與帽子配件 (頂層) -->
                    <g id="acc-glasses" class="acc-layer"></g>
                    <g id="acc-hat" class="acc-layer"></g>
                </g>
            </svg>
        </div>
        `;

        this.applyStyles();
        this.updateAccessories();
    }

    applyStyles() {
        if (document.getElementById('dog-actor-inline-styles')) return;

        const style = document.createElement('style');
        style.id = 'dog-actor-inline-styles';
        style.textContent = `
            .dog-skeleton {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .dog-svg {
                width: 100%;
                height: 100%;
                overflow: visible;
            }

            /* 立耳樞紐與抖動動畫 */
            .ear-left-origin {
                transform-origin: 102px 125px;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .ear-right-origin {
                transform-origin: 198px 125px;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .ear-twitch-l {
                animation: earTwitchLeft 0.35s ease-in-out;
            }
            .ear-twitch-r {
                animation: earTwitchRight 0.35s ease-in-out;
            }

            @keyframes earTwitchLeft {
                0%, 100% { transform: rotate(0deg); }
                35% { transform: rotate(-16deg); }
                70% { transform: rotate(6deg); }
            }
            @keyframes earTwitchRight {
                0%, 100% { transform: rotate(0deg); }
                35% { transform: rotate(16deg); }
                70% { transform: rotate(-6deg); }
            }

            /* 尾巴擺動 */
            #dog-tail-group {
                transform-origin: 95px 210px;
            }
            .tail-wag-normal {
                animation: tailWag 1.2s infinite ease-in-out;
            }
            .tail-wag-fast {
                animation: tailWag 0.35s infinite ease-in-out;
            }
            .tail-wag-still {
                animation: none;
            }

            @keyframes tailWag {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-22deg); }
            }

            /* 待機呼吸律動 */
            .state-idle #dog-head-group {
                animation: headBreathe 3s infinite ease-in-out;
                transform-origin: 150px 170px;
            }
            .state-idle #dog-body-group {
                animation: bodyBreathe 3s infinite ease-in-out;
                transform-origin: 150px 240px;
            }

            @keyframes headBreathe {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(2.5px); }
            }
            @keyframes bodyBreathe {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.015, 0.985); }
            }

            /* 開心蹦跳 */
            .state-happy {
                animation: dogBounce 0.6s infinite ease-in-out alternate;
            }
            @keyframes dogBounce {
                0% { transform: translateY(0); }
                100% { transform: translateY(-22px) scale(0.98, 1.04); }
            }

            /* 撫摸撒嬌 */
            .state-pet #dog-head-group {
                transform: rotate(3deg) translateY(4px);
                transition: transform 0.3s;
            }

            /* 坐下與握手 */
            .state-paw #leg-right {
                transform-origin: 174px 210px;
                transform: rotate(-75deg) translate(-10px, -15px);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            /* 翻肚打滾 */
            .state-rollover {
                animation: dogRoll 1.4s infinite ease-in-out;
                transform-origin: center center;
            }
            @keyframes dogRoll {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(180deg) scale(0.9); }
                100% { transform: rotate(360deg); }
            }

            /* 睡覺姿態 */
            .state-sleep {
                transform: scale(0.9) translateY(20px);
                filter: brightness(0.8);
            }

            /* 吐舌喘氣微動畫 */
            .tongue-pant {
                animation: pantTongue 0.4s infinite ease-in-out alternate;
                transform-origin: 150px 144px;
            }
            @keyframes pantTongue {
                0% { transform: scaleY(0.85); }
                100% { transform: scaleY(1.15); }
            }
        `;
        document.head.appendChild(style);
    }

    // 生命週期：自動眨眼與隨機抖耳
    startLifeCycles() {
        this.scheduleBlink();
        this.scheduleRandomAction();
    }

    scheduleBlink() {
        const nextBlink = 2500 + Math.random() * 4000;
        this.blinkTimer = setTimeout(() => {
            if (this.currentState !== 'sleep') {
                this.blink();
            }
            this.scheduleBlink();
        }, nextBlink);
    }

    scheduleRandomAction() {
        const nextAction = 4000 + Math.random() * 6000;
        this.idleActionTimer = setTimeout(() => {
            if (this.currentState === 'idle') {
                const rand = Math.random();
                if (rand < 0.4) {
                    this.twitchEars(Math.random() > 0.5 ? 'left' : 'right');
                } else if (rand < 0.7) {
                    this.pantTongue(1800);
                }
            }
            this.scheduleRandomAction();
        }, nextAction);
    }

    // 眨眼動作
    blink(duration = 180) {
        const eyesClosed = document.querySelectorAll('.eye-closed');
        const eyesOpen = document.querySelectorAll('.eye-outer, .eye-iris, .eye-pupil, .eye-shine-1, .eye-shine-2');

        eyesClosed.forEach(el => el.style.display = 'block');
        eyesOpen.forEach(el => el.style.display = 'none');

        setTimeout(() => {
            if (this.currentState !== 'sleep' && this.eyeState !== 'sleep') {
                eyesClosed.forEach(el => el.style.display = 'none');
                eyesOpen.forEach(el => el.style.display = 'block');
            }
        }, duration);
    }

    // 立耳抖動 (招牌互動)
    twitchEars(side = 'both') {
        const earL = document.getElementById('ear-left');
        const earR = document.getElementById('ear-right');

        if ((side === 'left' || side === 'both') && earL) {
            earL.classList.remove('ear-twitch-l');
            void earL.offsetWidth;
            earL.classList.add('ear-twitch-l');
        }
        if ((side === 'right' || side === 'both') && earR) {
            earR.classList.remove('ear-twitch-r');
            void earR.offsetWidth;
            earR.classList.add('ear-twitch-r');
        }
    }

    // 吐出小舌頭喘氣
    pantTongue(duration = 2000) {
        const tongue = document.getElementById('dog-tongue');
        if (!tongue) return;
        tongue.style.display = 'block';

        if (duration > 0) {
            setTimeout(() => {
                if (this.currentState !== 'happy' && this.currentState !== 'eat') {
                    tongue.style.display = 'none';
                }
            }, duration);
        }
    }

    // 設定行為狀態
    setState(state) {
        this.currentState = state;
        const actor = this.container;
        const tail = document.getElementById('dog-tail-group');
        const tongue = document.getElementById('dog-tongue');
        const eyesClosed = document.querySelectorAll('.eye-closed');
        const eyesOpen = document.querySelectorAll('.eye-outer, .eye-iris, .eye-pupil, .eye-shine-1, .eye-shine-2');

        actor.className = `dog-actor state-${state}`;

        // 狀態重設
        eyesClosed.forEach(el => el.style.display = 'none');
        eyesOpen.forEach(el => el.style.display = 'block');
        if (tongue) tongue.style.display = 'none';

        if (tail) {
            tail.className.baseVal = (state === 'happy' || state === 'pet') ? 'tail-wag-fast' : (state === 'sleep' ? 'tail-wag-still' : 'tail-wag-normal');
        }

        switch (state) {
            case 'happy':
                if (tongue) tongue.style.display = 'block';
                this.twitchEars('both');
                break;
            case 'pet':
                eyesClosed.forEach(el => el.style.display = 'block');
                eyesOpen.forEach(el => el.style.display = 'none');
                break;
            case 'sleep':
                eyesClosed.forEach(el => el.style.display = 'block');
                eyesOpen.forEach(el => el.style.display = 'none');
                break;
            case 'eat':
                if (tongue) tongue.style.display = 'block';
                break;
            case 'paw':
                this.twitchEars('right');
                break;
        }
    }

    // 更新穿戴配件
    setAccessory(type, itemId) {
        this.equipped[type] = itemId;
        this.updateAccessories();
    }

    updateAccessories() {
        const collarLayer = document.getElementById('acc-collar');
        const glassesLayer = document.getElementById('acc-glasses');
        const hatLayer = document.getElementById('acc-hat');
        const capeLayer = document.getElementById('acc-cape');

        if (!collarLayer) return;

        // 1. 項圈 (Collar)
        if (this.equipped.collar === 'red_collar') {
            collarLayer.innerHTML = `
                <!-- 經典紅色皮項圈與金色圓牌 -->
                <path d="M 112 165 Q 150 178 188 165 Q 185 174 150 186 Q 115 174 112 165 Z" fill="#e74c3c" />
                <ellipse cx="150" cy="184" rx="7" ry="7" fill="#f1c40f" stroke="#d4ac0d" stroke-width="1.5" />
            `;
        } else if (this.equipped.collar === 'gold_bell') {
            collarLayer.innerHTML = `
                <!-- 藍色項圈與金色大鈴鐺 -->
                <path d="M 112 165 Q 150 178 188 165 Q 185 174 150 186 Q 115 174 112 165 Z" fill="#3498db" />
                <circle cx="150" cy="186" r="9" fill="#f1c40f" stroke="#b7950b" stroke-width="1.5"/>
                <circle cx="150" cy="189" r="2" fill="#7d6608"/>
            `;
        } else if (this.equipped.collar === 'bandana') {
            collarLayer.innerHTML = `
                <!-- 帥氣三角紅領巾 -->
                <path d="M 110 165 Q 150 176 190 165 L 150 206 Z" fill="#e74c3c" />
                <circle cx="140" cy="176" r="2.5" fill="white" opacity="0.8"/>
                <circle cx="160" cy="176" r="2.5" fill="white" opacity="0.8"/>
                <circle cx="150" cy="192" r="2.5" fill="white" opacity="0.8"/>
            `;
        } else {
            collarLayer.innerHTML = '';
        }

        // 2. 墨鏡 (Glasses)
        if (this.equipped.glasses === 'sunglasses') {
            glassesLayer.innerHTML = `
                <!-- 酷炫黑超墨鏡 -->
                <g id="sunglasses-svg" transform="translate(108, 98)">
                    <rect x="0" y="0" width="34" height="22" rx="6" fill="#111827" stroke="#374151" stroke-width="2" />
                    <rect x="50" y="0" width="34" height="22" rx="6" fill="#111827" stroke="#374151" stroke-width="2" />
                    <line x1="34" y1="8" x2="50" y2="8" stroke="#374151" stroke-width="3" />
                    <!-- 反光斜線 -->
                    <line x1="6" y1="18" x2="22" y2="4" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="56" y1="18" x2="72" y2="4" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" stroke-linecap="round"/>
                </g>
            `;
        } else {
            glassesLayer.innerHTML = '';
        }

        // 3. 帽子 (Hat)
        if (this.equipped.hat === 'wizard_hat') {
            hatLayer.innerHTML = `
                <!-- 魔法師尖帽 -->
                <g id="wizard-hat-svg" transform="translate(110, 20)">
                    <path d="M 0 60 Q 40 50 80 60 L 52 0 Q 40 5 35 15 Z" fill="#6c5ce7" />
                    <ellipse cx="40" cy="58" rx="46" ry="12" fill="#5849be" />
                    <polygon points="40,25 43,32 50,33 45,38 46,45 40,41 34,45 35,38 30,33 37,32" fill="#fdcb6e" />
                </g>
            `;
        } else if (this.equipped.hat === 'party_hat') {
            hatLayer.innerHTML = `
                <!-- 派對生日帽 -->
                <g transform="translate(125, 25)">
                    <polygon points="25,0 0,55 50,55" fill="#ff7675" />
                    <circle cx="25" cy="0" r="6" fill="#ffeaa7" />
                    <line x1="5" y1="40" x2="45" y2="40" stroke="#74b9ff" stroke-width="4" />
                </g>
            `;
        } else {
            hatLayer.innerHTML = '';
        }

        // 4. 披風 (Cape)
        if (this.equipped.cape === 'hero_cape') {
            capeLayer.innerHTML = `
                <!-- 超狗正義紅色披風 -->
                <path d="M 105 170 Q 60 210 50 260 Q 150 275 240 260 Q 235 210 195 170 Z" fill="#d63031" filter="url(#dropShadow)" />
            `;
        } else {
            capeLayer.innerHTML = '';
        }
    }
}
