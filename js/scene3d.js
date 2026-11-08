/**
 * 3D 場景管理器 (Three.js 3D Virtual Scene & Environment)
 * 支援黑狗、緬因貓與三色狐狸多寵物動態切換、光影、互動道具與 3D 射線拾取
 */

class PetScene3D {
    constructor(containerId, gameInstance) {
        this.container = document.getElementById(containerId);
        this.game = gameInstance;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.dog = null; // 當前活動 3D 寵物

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.props = {};
        this.particles = [];
        this.bubbles = [];
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // 1. 建立 3D 場景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf1f5f9);

        // 2. 建立透視相機
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(0, 2.6, 5.2);

        // 3. 建立 WebGL 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // 4. 軌道控制器（針對手機與平板觸控專屬優化）
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.minDistance = 1.8;
        this.controls.maxDistance = 8.5;
        this.controls.target.set(0, 0.65, 0);
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // 手機/平板動態手勢操作提示與自動淡出
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const hintEl = document.getElementById('camera-hint');
        if (hintEl) {
            if (isTouch) {
                hintEl.innerHTML = '<span>👆 單指旋轉・雙指捏合縮放・輕點寵物互動</span>';
            }
            setTimeout(() => {
                hintEl.style.transition = 'opacity 1s ease';
                hintEl.style.opacity = '0';
                setTimeout(() => { hintEl.style.display = 'none'; }, 1000);
            }, 4500);
        }

        // 5. 建立燈光
        this.setupLights();

        // 6. 建立 3D 房間環境
        this.buildEnvironment();

        // 7. 載入初始 3D 寵物 (黑狗幼犬)
        this.dog = new VirtualPet3D('dog', 'default');
        this.scene.add(this.dog.group);

        // 8. 建立 3D 互動道具
        this.buildProps();

        // 9. 事件監聽
        this.bindEvents();

        // 10. 開始渲染循環
        this.animate();
    }

    // 切換 3D 寵物外觀與種類 (黑狗 / 緬因貓 / 赤狐 / 北極狐 / 銀狐)
    switchPetModel(petType = 'dog', colorVariant = 'default', equipped = null) {
        if (this.dog) {
            this.scene.remove(this.dog.group);
        }

        this.dog = new VirtualPet3D(petType, colorVariant);
        if (equipped) {
            this.dog.updateAccessories(equipped);
        }
        this.scene.add(this.dog.group);
        if (this.game) {
            this.game.dogActor = this.dog;
            this.game.applyGrowthScaleByLevel();
        }
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xfff3e0, 1.25);
        this.dirLight.position.set(4, 7, 5);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.bias = -0.001;
        this.scene.add(this.dirLight);

        this.pointLight = new THREE.PointLight(0xff9f43, 0.8, 10);
        this.pointLight.position.set(-2, 3, 2);
        this.scene.add(this.pointLight);
    }

    buildEnvironment() {
        this.envGroup = new THREE.Group();
        this.scene.add(this.envGroup);

        // 木質地板
        const floorGeo = new THREE.PlaneGeometry(14, 14);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xeddcd2,
            roughness: 0.6,
            metalness: 0.05
        });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.envGroup.add(this.floor);

        // 圓形地毯
        const rugGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.02, 32);
        const rugMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.position.set(0, 0.01, 0);
        rug.receiveShadow = true;
        this.envGroup.add(rug);

        const rugRingGeo = new THREE.RingGeometry(2.1, 2.3, 32);
        rugRingGeo.rotateX(-Math.PI / 2);
        const rugRing = new THREE.Mesh(rugRingGeo, new THREE.MeshStandardMaterial({ color: 0xff9f43, side: THREE.DoubleSide }));
        rugRing.position.set(0, 0.025, 0);
        this.envGroup.add(rugRing);
    }

    buildProps() {
        // 1. 食盆
        const bowlGroup = new THREE.Group();
        bowlGroup.position.set(-1.6, 0, 0.8);

        const bowlOuterGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.22, 20);
        const matBowl = new THREE.MeshStandardMaterial({ color: 0xee5253, roughness: 0.3 });
        const bowlMesh = new THREE.Mesh(bowlOuterGeo, matBowl);
        bowlMesh.castShadow = true;
        bowlMesh.receiveShadow = true;
        bowlMesh.position.y = 0.11;
        bowlGroup.add(bowlMesh);

        // 盆內食物
        const foodGeo = new THREE.SphereGeometry(0.3, 16, 16);
        foodGeo.scale(1, 0.3, 1);
        this.foodContent = new THREE.Mesh(foodGeo, new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.7 }));
        this.foodContent.position.set(0, 0.18, 0);
        this.foodContent.visible = false;
        bowlGroup.add(this.foodContent);

        this.scene.add(bowlGroup);
        this.props.bowl = bowlGroup;

        // 2. 狗窩 / 貓窩
        const bedGroup = new THREE.Group();
        bedGroup.position.set(1.8, 0, -1.2);

        const bedRimGeo = new THREE.TorusGeometry(0.9, 0.22, 12, 30);
        bedRimGeo.rotateX(Math.PI / 2);
        const matBed = new THREE.MeshStandardMaterial({ color: 0x74b9ff, roughness: 0.5 });
        const bedRim = new THREE.Mesh(bedRimGeo, matBed);
        bedRim.position.y = 0.18;
        bedRim.castShadow = true;
        bedGroup.add(bedRim);

        const cushionGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.15, 24);
        const cushion = new THREE.Mesh(cushionGeo, new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.7 }));
        cushion.position.y = 0.1;
        cushion.receiveShadow = true;
        bedGroup.add(cushion);

        this.scene.add(bedGroup);
        this.props.bed = bedGroup;

        // 3. 彈力球
        const ballGeo = new THREE.SphereGeometry(0.24, 20, 20);
        const matBall = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        this.ballMesh = new THREE.Mesh(ballGeo, matBall);
        this.ballMesh.position.set(1.5, 0.24, 1.2);
        this.ballMesh.castShadow = true;
        this.ballMesh.userData = { part: 'ball' };
        this.scene.add(this.ballMesh);
        this.props.ball = this.ballMesh;
        this.ballVelY = 0;

        // 4. 專屬 3D 遊戲道具：玩具球 / 碰拳手套 / 探險信標
        this.buildInteractiveBall();
        this.buildFistProp();
        this.buildFlightBeacon();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.onWindowResize(), 150);
        });

        // 觸控與滑鼠防誤觸機制：旋轉/平移鏡頭時不觸發互動，只有輕觸（位移 < 14px）才觸發寵物互動
        let pointerDownPos = null;
        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
        });

        this.renderer.domElement.addEventListener('pointerup', (e) => {
            if (!pointerDownPos) return;
            const dx = e.clientX - pointerDownPos.x;
            const dy = e.clientY - pointerDownPos.y;
            const dist = Math.hypot(dx, dy);
            const dt = performance.now() - pointerDownPos.time;
            pointerDownPos = null;

            if (dist < 14 && dt < 450) {
                this.handlePointerDown(e);
            }
        });

        const resetBtn = document.getElementById('camera-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCamera();
            });
        }
    }

    onWindowResize() {
        if (!this.container || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    resetCamera() {
        this.camera.position.set(0, 2.6, 5.2);
        this.controls.target.set(0, 0.65, 0);
        this.controls.update();
        if (this.game) this.game.showToast('🎥 3D 視角已重設');
    }

    handlePointerDown(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            for (const hit of intersects) {
                const part = hit.object.userData.part;
                if (part) {
                    this.onHitPart(part, hit.point, event.clientX, event.clientY);
                    break;
                }
            }
        }
    }

    onHitPart(part, worldPoint, screenX, screenY) {
        // 手機觸覺反饋（輕微震動）
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(15); } catch (_) {}
        }
        if (part === 'ball') {
            this.ballVelY = 0.25;
            if (this.game) {
                window.soundCtrl.playVoice(this.game.currentPetType, 'happy');
                this.dog.setState('happy');
                this.spawn3DHeart(worldPoint.x, worldPoint.y + 0.3, worldPoint.z);
                this.game.stats.mood = Math.min(100, this.game.stats.mood + 6);
                this.game.updateUI();
                this.game.showToast('⚽ 拍打了彈力球！寵物開心地跳躍！');
            }
            setTimeout(() => this.dog.setState('idle'), 1500);
            return;
        }

        if (this.game) {
            this.game.performPetInteraction(part, screenX, screenY);
            this.spawn3DHeart(worldPoint.x, worldPoint.y + 0.2, worldPoint.z);
        }
    }

    spawn3DHeart(x, y, z) {
        const heartGeo = new THREE.SphereGeometry(0.12, 10, 10);
        heartGeo.scale(1, 1, 0.4);
        const matHeart = new THREE.MeshBasicMaterial({ color: 0xff4757 });
        const heart = new THREE.Mesh(heartGeo, matHeart);
        heart.position.set(x, y, z);
        this.scene.add(heart);

        this.particles.push({
            mesh: heart,
            vy: 0.03 + Math.random() * 0.02,
            vx: (Math.random() - 0.5) * 0.015,
            vz: (Math.random() - 0.5) * 0.015,
            life: 1.0
        });
    }

    trigger3DBathBubbles() {
        const matBubble = new THREE.MeshStandardMaterial({
            color: 0xa5f3fc,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.75
        });

        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                const size = 0.08 + Math.random() * 0.16;
                const bubble = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 12), matBubble);
                bubble.position.set(
                    (Math.random() - 0.5) * 1.2,
                    0.5 + Math.random() * 1.0,
                    (Math.random() - 0.5) * 1.2
                );
                this.scene.add(bubble);
                this.bubbles.push({
                    mesh: bubble,
                    vy: 0.02 + Math.random() * 0.03,
                    vx: (Math.random() - 0.5) * 0.02,
                    life: 1.5
                });
            }, i * 60);
        }
    }

    trigger3DFeed(foodType) {
        this.foodContent.visible = true;
        if (foodType === 'milk') {
            this.foodContent.material.color.setHex(0xffffff); // 溫熱白牛奶
        } else if (foodType === 'banana') {
            this.foodContent.material.color.setHex(0xfacc15); // 香甜金黃香蕉
        } else if (foodType === 'bone' || foodType === 'biscuit') {
            this.foodContent.material.color.setHex(0xf5f5dc); // 磨牙骨米白
        } else if (foodType === 'chicken') {
            this.foodContent.material.color.setHex(0xf59e0b); // 鮮雞金黃
        } else if (foodType === 'grass') {
            this.foodContent.material.color.setHex(0x22c55e); // 嫩葉草綠
        } else if (foodType === 'tuna') {
            this.foodContent.material.color.setHex(0x0284c7); // 鮮鮪魚海藍
        } else if (foodType === 'nuts') {
            this.foodContent.material.color.setHex(0x78350f); // 堅果褐棕
        } else if (foodType === 'puree') {
            this.foodContent.material.color.setHex(0xb91c1c); // 鮮嫩肉泥深紅
        } else if (foodType === 'poison') {
            this.foodContent.material.color.setHex(0x7e22ce); // 劇毒紫黑
        } else {
            this.foodContent.material.color.setHex(0xd97706);
        }

        setTimeout(() => {
            this.foodContent.visible = false;
        }, 3200);
    }

    setTheme(themeKey) {
        this.activeThemeKey = themeKey;
        if (themeKey === 'night') {
            this.scene.background.setHex(0x0f172a);
            this.ambientLight.intensity = 0.25;
            this.dirLight.intensity = 0.3;
            this.dirLight.color.setHex(0x94a3b8);
            this.pointLight.intensity = 1.2;
            this.pointLight.color.setHex(0x6366f1);
            this.floor.material.color.setHex(0x1e293b);
        } else if (themeKey === 'garden') {
            this.scene.background.setHex(0xd4f1f9);
            this.ambientLight.intensity = 0.8;
            this.dirLight.intensity = 1.4;
            this.dirLight.color.setHex(0xffffff);
            this.pointLight.intensity = 0.4;
            this.floor.material.color.setHex(0x7cb342);
        } else if (themeKey === 'sunset') {
            this.scene.background.setHex(0xfeb47b);
            this.ambientLight.intensity = 0.7;
            this.dirLight.intensity = 1.1;
            this.dirLight.color.setHex(0xff7675);
            this.pointLight.intensity = 0.9;
            this.pointLight.color.setHex(0xfdcb6e);
            this.floor.material.color.setHex(0xdf8a58);
        } else if (themeKey === 'snow') {
            this.scene.background.setHex(0xdbeafe);
            this.ambientLight.intensity = 0.85;
            this.dirLight.intensity = 1.3;
            this.dirLight.color.setHex(0xe0f2fe);
            this.pointLight.intensity = 1.1;
            this.pointLight.color.setHex(0x38bdf8);
            this.floor.material.color.setHex(0xf8fafc);
        } else if (themeKey === 'sakura') {
            this.scene.background.setHex(0xfce7f3);
            this.ambientLight.intensity = 0.82;
            this.dirLight.intensity = 1.25;
            this.dirLight.color.setHex(0xfff1f2);
            this.pointLight.intensity = 0.95;
            this.pointLight.color.setHex(0xf472b6);
            this.floor.material.color.setHex(0xfbcfe8);
        } else {
            this.scene.background.setHex(0xf1f5f9);
            this.ambientLight.intensity = 0.75;
            this.dirLight.intensity = 1.25;
            this.dirLight.color.setHex(0xfff3e0);
            this.pointLight.intensity = 0.8;
            this.floor.material.color.setHex(0xeddcd2);
        }
    }

    // ==========================================
    // 3D 專屬互動玩遊戲道具建構與特效系統
    // ==========================================

    buildInteractiveBall() {
        this.interactiveBall = new THREE.Group();
        this.interactiveBall.position.set(0, -10, 0);
        this.interactiveBall.visible = false;

        // 核心球體
        const sphereGeo = new THREE.SphereGeometry(0.28, 24, 24);
        this.ballCoreMat = new THREE.MeshStandardMaterial({
            color: 0xbfff00, // 活力螢光網球綠
            roughness: 0.5,
            metalness: 0.05
        });
        this.ballCoreMesh = new THREE.Mesh(sphereGeo, this.ballCoreMat);
        this.ballCoreMesh.castShadow = true;
        this.ballCoreMesh.receiveShadow = true;
        this.interactiveBall.add(this.ballCoreMesh);

        // 網球白色弧形縫線環 (兩道立體交錯)
        const seamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const seamGeo = new THREE.TorusGeometry(0.283, 0.015, 8, 36);
        this.ballSeam1 = new THREE.Mesh(seamGeo, seamMat);
        this.ballSeam1.rotation.set(0.65, 0.45, 0);
        this.ballCoreMesh.add(this.ballSeam1);

        const seamGeo2 = new THREE.TorusGeometry(0.283, 0.015, 8, 36);
        this.ballSeam2 = new THREE.Mesh(seamGeo2, seamMat);
        this.ballSeam2.rotation.set(-0.65, -0.45, 0);
        this.ballCoreMesh.add(this.ballSeam2);

        // 虎鯨專屬水球飾環 (湛藍水波環)
        this.waterBallRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.286, 0.026, 8, 32),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.3 })
        );
        this.waterBallRing.visible = false;
        this.interactiveBall.add(this.waterBallRing);

        this.scene.add(this.interactiveBall);
    }

    setBallStyle(type = 'tennis') {
        if (type === 'water') {
            this.ballCoreMat.color.setHex(0x38bdf8); // 蔚藍水球
            this.ballCoreMat.roughness = 0.15;
            this.ballCoreMat.metalness = 0.35;
            if (this.waterBallRing) this.waterBallRing.visible = true;
            if (this.ballSeam1) this.ballSeam1.visible = false;
            if (this.ballSeam2) this.ballSeam2.visible = false;
            this.interactiveBall.scale.set(1.25, 1.25, 1.25);
        } else if (type === 'orange') {
            this.ballCoreMat.color.setHex(0xff8c00); // 金黃大蜜柑
            this.ballCoreMat.roughness = 0.3;
            this.ballCoreMat.metalness = 0.05;
            if (this.waterBallRing) this.waterBallRing.visible = false;
            if (this.ballSeam1) this.ballSeam1.visible = false;
            if (this.ballSeam2) this.ballSeam2.visible = false;
            this.interactiveBall.scale.set(0.95, 0.82, 0.95);
        } else {
            this.ballCoreMat.color.setHex(0xbfff00); // 經典網球綠
            this.ballCoreMat.roughness = 0.55;
            this.ballCoreMat.metalness = 0.05;
            if (this.waterBallRing) this.waterBallRing.visible = false;
            if (this.ballSeam1) this.ballSeam1.visible = true;
            if (this.ballSeam2) this.ballSeam2.visible = true;
            this.interactiveBall.scale.set(1.0, 1.0, 1.0);
        }
    }

    buildFistProp() {
        this.fistProp = new THREE.Group();
        this.fistProp.position.set(0, -10, 0);
        this.fistProp.visible = false;

        // 拳頭主體 (鎏金戰鬥手套)
        const gloveGeo = new THREE.SphereGeometry(0.24, 18, 18);
        gloveGeo.scale(1.15, 1.25, 1.15);
        const matGlove = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // 亮金
            roughness: 0.25,
            metalness: 0.4
        });
        const gloveMesh = new THREE.Mesh(gloveGeo, matGlove);
        gloveMesh.castShadow = true;
        this.fistProp.add(gloveMesh);

        // 4 個指節隆起防護墊
        const matKnuckle = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
        for (let i = 0; i < 4; i++) {
            const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), matKnuckle);
            kn.rotation.x = Math.PI / 2;
            kn.position.set(-0.15 + i * 0.1, 0.14, 0.2);
            this.fistProp.add(kn);
        }

        // 大拇指握拳結構
        const thumbMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.07, 0.16, 12),
            new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 })
        );
        thumbMesh.rotation.set(0.3, 0.4, 0.6);
        thumbMesh.position.set(-0.2, 0.02, 0.12);
        this.fistProp.add(thumbMesh);

        // 猩紅拳擊手腕綁帶
        const cuffMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.21, 0.14, 16),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
        );
        cuffMesh.position.set(0, -0.22, 0);
        this.fistProp.add(cuffMesh);

        // 鎏金飾環
        const cuffGold = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.015, 8, 24),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.6, roughness: 0.2 })
        );
        cuffGold.rotation.x = Math.PI / 2;
        cuffGold.position.set(0, -0.22, 0);
        this.fistProp.add(cuffGold);

        // 碰拳能量瞄準脈衝光環
        const haloGeo = new THREE.TorusGeometry(0.38, 0.016, 8, 32);
        this.fistHalo = new THREE.Mesh(
            haloGeo,
            new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.7,
                roughness: 0.1
            })
        );
        this.fistHalo.rotation.x = 0;
        this.fistProp.add(this.fistHalo);

        this.scene.add(this.fistProp);
    }

    buildFlightBeacon() {
        this.flightBeacon = new THREE.Group();
        this.flightBeacon.position.set(0, -10, 0);
        this.flightBeacon.visible = false;

        // 中心超音波水晶
        const gemGeo = new THREE.OctahedronGeometry(0.16, 0);
        const gemMat = new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            emissive: 0x9333ea,
            emissiveIntensity: 0.8,
            roughness: 0.1,
            metalness: 0.2
        });
        this.beaconCore = new THREE.Mesh(gemGeo, gemMat);
        this.flightBeacon.add(this.beaconCore);

        // 兩重擴散聲波漣漪光環
        this.beaconRing1 = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.014, 8, 32),
            new THREE.MeshStandardMaterial({ color: 0xe9d5ff, emissive: 0xa855f7, emissiveIntensity: 0.6 })
        );
        this.beaconRing2 = new THREE.Mesh(
            new THREE.TorusGeometry(0.44, 0.012, 8, 32),
            new THREE.MeshStandardMaterial({ color: 0xddd6fe, emissive: 0x7c3aed, emissiveIntensity: 0.5 })
        );
        this.flightBeacon.add(this.beaconRing1, this.beaconRing2);

        this.scene.add(this.flightBeacon);
    }

    spawn3DStars(x, y, z, count = 12, colorHex = 0xfbbf24) {
        const starGeo = new THREE.OctahedronGeometry(0.08, 0);
        const starMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.7,
            roughness: 0.2
        });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(starGeo, starMat);
            mesh.position.set(x, y, z);
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.04 + Math.random() * 0.05;
            this.particles.push({
                mesh: mesh,
                vx: Math.cos(angle) * speed,
                vy: 0.03 + Math.random() * 0.05,
                vz: Math.sin(angle) * speed,
                life: 1.0
            });
        }
    }

    triggerImpactBurst(x, y, z) {
        // 碰拳衝擊波環
        const ringGeo = new THREE.TorusGeometry(0.12, 0.032, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xfffbeb,
            emissive: 0xfef08a,
            emissiveIntensity: 0.9,
            transparent: true,
            opacity: 1.0
        });
        const shockwave = new THREE.Mesh(ringGeo, ringMat);
        shockwave.position.set(x, y, z);
        this.scene.add(shockwave);

        this.particles.push({
            mesh: shockwave,
            vx: 0,
            vy: 0,
            vz: 0,
            isShockwave: true,
            scaleRate: 3.8,
            life: 0.6
        });

        // 金色星芒爆發與愛心
        this.spawn3DStars(x, y, z, 16, 0xfbbf24);
        this.spawn3DHeart(x, y + 0.3, z);
    }

    triggerWaterSplash(x, y, z, count = 18) {
        const splashMat = new THREE.MeshStandardMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,
            metalness: 0.3
        });

        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 8, 8);
            const mesh = new THREE.Mesh(geo, splashMat);
            mesh.position.set(x, y, z);
            this.scene.add(mesh);
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.03 + Math.random() * 0.04;
            this.particles.push({
                mesh: mesh,
                vx: Math.cos(angle) * speed,
                vy: 0.05 + Math.random() * 0.06,
                vz: Math.sin(angle) * speed,
                gravity: 0.003,
                life: 1.1
            });
        }
    }

    spawnStardustTrail(x, y, z) {
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xec4899,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), mat);
        m.position.set(x + (Math.random()-0.5)*0.2, y + (Math.random()-0.5)*0.2, z + (Math.random()-0.5)*0.2);
        this.scene.add(m);
        this.particles.push({
            mesh: m,
            vx: (Math.random()-0.5)*0.005,
            vy: -0.005,
            vz: (Math.random()-0.5)*0.005,
            life: 0.6
        });
    }

    // ==========================================
    // 寵物專屬小遊戲發起與狀態機
    // ==========================================

    playPetGame(petType, petName, onBanner, onComplete) {
        if (this.activeMinigame) return false;

        if (this.dog && this.dog.resetAutonomy) {
            this.dog.resetAutonomy();
        }

        let mode = 'fetch';
        if (petType === 'orca') {
            mode = 'orca_bounce';
        } else if (petType === 'bat') {
            mode = 'bat_flight';
        } else if (petType === 'crow') {
            mode = 'crow_flight';
        } else if (petType === 'harpy') {
            mode = 'harpy_flight';
        } else if (petType === 'gibbon') {
            mode = 'gibbon_fist';
        } else if (petType === 'capybara') {
            mode = 'capybara_orange';
        } else if (petType === 'red_panda') {
            mode = 'red_panda_stand';
        } else if (petType === 'penguin') {
            mode = 'penguin_slide';
        } else if (petType === 'sea_otter') {
            mode = 'otter_shell';
        } else if (petType === 'koala') {
            mode = 'koala_climb';
        } else if (petType === 'bunny') {
            mode = 'bunny_binky';
        } else if (petType === 'panda') {
            mode = 'panda_roll';
        } else if (petType === 'fennec') {
            mode = 'fennec_pounce';
        } else if (petType === 'hamster') {
            mode = 'hamster_wheel';
        } else if (petType === 'hedgehog') {
            mode = 'hedgehog_roll';
        } else if (petType === 'dolphin') {
            mode = 'dolphin_leap';
        } else if (petType === 'tiger') {
            mode = 'tiger_roar';
        } else if (petType === 'condor') {
            mode = 'condor_flight';
        }

        this.activeMinigame = {
            mode: mode,
            petType: petType,
            petName: petName,
            time: 0,
            subphase: 'start',
            subTime: 0,
            onBanner: onBanner,
            onComplete: onComplete,
            originPos: { x: this.dog ? this.dog.group.position.x : 0, y: this.dog ? this.dog.group.position.y : 0, z: this.dog ? this.dog.group.position.z : 0 },
            originRotY: this.dog ? this.dog.group.rotation.y : 0
        };

        // 初始道具與提示設置
        if (mode === 'fetch') {
            this.setBallStyle('tennis');
            this.interactiveBall.visible = true;
            this.interactiveBall.position.set(0, 1.1, 1.8);
            this.activeMinigame.ballStart = { x: 0, y: 1.1, z: 1.8 };
            this.activeMinigame.ballTarget = { x: 1.35, y: 0.22, z: 0.35 };
            if (onBanner) onBanner('🎾', `投出玩具球！${petName} 興奮地盯住球！`);
        } else if (mode === 'orca_bounce') {
            this.setBallStyle('water');
            this.interactiveBall.visible = true;
            this.interactiveBall.position.set(0, 2.2, 0.1);
            if (this.dog) this.dog.setState('ball_bounce');
            if (onBanner) onBanner('🏐', `拋出蔚藍水球！虎鯨躍出水面準備頂球！`);
        } else if (mode === 'bat_flight') {
            this.flightBeacon.position.set(0, 1.15, 1.0);
            this.flightBeacon.visible = true;
            if (this.dog) this.dog.setState('bat_flying');
            if (onBanner) onBanner('🦇', `發出探險聲波召喚！狐蝠展開金黃頸圈與寬大雙翼水平起飛！`);
        } else if (mode === 'crow_flight') {
            this.flightBeacon.position.set(0, 1.15, 1.0);
            this.flightBeacon.visible = true;
            if (this.dog) this.dog.setState('crow_flying');
            if (onBanner) onBanner('🪶', `吹響高空呼哨！${petName} 收起雙爪、平伸長喙、展開 8 指開叉黑翼破空起飛！`);
        } else if (mode === 'harpy_flight') {
            this.flightBeacon.position.set(0, 1.15, 1.0);
            this.flightBeacon.visible = true;
            if (this.dog) this.dog.setState('harpy_flying');
            if (onBanner) onBanner('🦅', `吹響雨林鷹哨！${petName} 鬆開棲木、豎起雙叉黑王冠羽、展開黑白橫斑巨翼破空起飛！`);
        } else if (mode === 'gibbon_fist') {
            this.fistProp.position.set(0.18, 0.85, 0.95);
            this.fistProp.visible = true;
            this.fistProp.scale.set(0.01, 0.01, 0.01);
            if (onBanner) onBanner('👊', `伸出碰拳道具！邀請長臂猿碰拳！`);
        } else if (mode === 'capybara_orange') {
            this.setBallStyle('orange');
            this.interactiveBall.visible = true;
            this.interactiveBall.position.set(0, 2.3, 0.32);
            if (onBanner) onBanner('🍊', `空投大蜜柑！考驗佛系水豚君的頭頂平衡神功！`);
        } else if (mode === 'red_panda_stand') {
            if (onBanner) onBanner('🎋', `${petName} 晃著蓬鬆大尾巴走上前，準備展現必殺特技！`);
        } else if (mode === 'penguin_slide') {
            if (onBanner) onBanner('🧊', `${petName} 噗通趴下！準備展開南極肚皮貼地滑冰大衝刺！`);
        } else if (mode === 'otter_shell') {
            if (onBanner) onBanner('🐚', `${petName} 從私房口袋掏出小石頭與寶藏扇貝，準備敲貝殼！`);
        } else if (mode === 'koala_climb') {
            if (onBanner) onBanner('🌿', `${petName} 抱緊尤加利樹幹，準備展現樹冠攀爬特技！`);
        } else if (mode === 'bunny_binky') {
            if (onBanner) onBanner('🥕', `${petName} 小粉鼻狂動！準備施展傳說中的快樂扭腰兔兔跳 (Binky)！`);
        } else if (mode === 'panda_roll') {
            if (onBanner) onBanner('🎋', `${petName} 放下竹子抱成一顆黑白湯圓，準備表演前滾翻打滾特技！`);
        } else if (mode === 'fennec_pounce') {
            if (onBanner) onBanner('📡', `${petName} 豎起超巨型雷達大耳，鎖定目標準備施展沙漠飛撲！`);
        } else if (mode === 'hamster_wheel') {
            if (onBanner) onBanner('🐹', `${petName} 塞滿鼓鼓腮幫子，跳上跑跑滾輪展開極速狂飆！`);
        } else if (mode === 'hedgehog_roll') {
            if (onBanner) onBanner('🦔', `${petName} 縮成一顆可愛小刺球，準備施展旋風滾滾衝刺！`);
        } else if (mode === 'dolphin_leap') {
            if (onBanner) onBanner('🐬', `${petName} 在蔚藍水波中加速助跑，準備表演空中躍浪翻騰秀！`);
        } else if (mode === 'tiger_roar') {
            if (onBanner) onBanner('🐯', `${petName} 額頭「王」字霸紋閃耀，伏低身軀準備施展猛虎飛撲！`);
        } else if (mode === 'condor_flight') {
            this.flightBeacon.position.set(0, 1.15, 1.0);
            this.flightBeacon.visible = true;
            if (this.dog) this.dog.setState('condor_flying');
            if (onBanner) onBanner('🏔️', `吹響安地斯山巔風笛！${petName} 離開山岩、展開雪白頸圈與 3.3m 黑白巨翼御風升空！`);
        }

        return true;
    }

    stopMinigame(success = false) {
        if (!this.activeMinigame) return;
        const g = this.activeMinigame;
        this.activeMinigame = null;

        if (this.interactiveBall) this.interactiveBall.visible = false;
        if (this.fistProp) this.fistProp.visible = false;
        if (this.flightBeacon) this.flightBeacon.visible = false;

        if (this.dog) {
            this.dog.setState('idle');
            if (this.dog.resetAutonomy) this.dog.resetAutonomy();
        }

        if (g.onComplete) {
            g.onComplete({
                success: success,
                mood: 20,
                intimacy: 15,
                coins: 100,
                exp: 25
            });
        }
    }

    updateMinigame(delta, elapsedTime) {
        const g = this.activeMinigame;
        if (!g || !this.dog) return;

        g.time += delta;
        g.subTime += delta;

        // ----------------------------------------
        // 模式 1：撿球 (犬類、獵豹、鳥類、大象)
        // ----------------------------------------
        if (g.mode === 'fetch') {
            if (g.time <= 1.2) {
                // 階段 1：拋出球弧線飛行
                const p = g.time / 1.2;
                const bx = THREE.MathUtils.lerp(g.ballStart.x, g.ballTarget.x, p);
                const bz = THREE.MathUtils.lerp(g.ballStart.z, g.ballTarget.z, p);
                const by = THREE.MathUtils.lerp(g.ballStart.y, g.ballTarget.y, p) + Math.sin(p * Math.PI) * 0.9;
                this.interactiveBall.position.set(bx, by, bz);
                this.interactiveBall.rotation.x += delta * 8;
                this.interactiveBall.rotation.y += delta * 6;

                // 寵物轉向球降落點
                const targetAngle = Math.atan2(g.ballTarget.x - this.dog.group.position.x, g.ballTarget.z - this.dog.group.position.z);
                this.dog.group.rotation.y = THREE.MathUtils.lerp(g.originRotY, targetAngle, Math.min(1.0, p * 2.5));

            } else if (g.time <= 3.2) {
                // 階段 2：飛奔撿球
                if (g.subphase !== 'chase') {
                    g.subphase = 'chase';
                    this.interactiveBall.position.set(g.ballTarget.x, g.ballTarget.y, g.ballTarget.z);
                    if (g.onBanner) g.onBanner('💨', `${g.petName} 飛奔過去撿球！`);
                }
                const cp = Math.min(1.0, (g.time - 1.2) / 2.0);
                this.dog.group.position.x = THREE.MathUtils.lerp(g.originPos.x, g.ballTarget.x - 0.18, cp);
                this.dog.group.position.z = THREE.MathUtils.lerp(g.originPos.z, g.ballTarget.z, cp);

                // 跑動動畫
                if (['harpy', 'crow'].includes(g.petType)) {
                    this.dog.group.position.y = Math.sin(cp * Math.PI) * 0.35;
                } else {
                    if (this.dog.autonomy) this.dog.autonomy.walkCycle += delta * 15;
                    if (this.dog.legFL) this.dog.legFL.rotation.x = Math.sin(elapsedTime * 15) * 0.45;
                    if (this.dog.legFR) this.dog.legFR.rotation.x = -Math.sin(elapsedTime * 15) * 0.45;
                    if (this.dog.legBL) this.dog.legBL.rotation.x = -Math.sin(elapsedTime * 15) * 0.45;
                    if (this.dog.legBR) this.dog.legBR.rotation.x = Math.sin(elapsedTime * 15) * 0.45;
                    if (this.dog.tail) this.dog.tail.rotation.y = Math.sin(elapsedTime * 18) * 0.5;
                }

            } else if (g.time <= 5.6) {
                // 階段 3：叼起球並跑回主人面前
                if (g.subphase !== 'return') {
                    g.subphase = 'return';
                    this.spawn3DStars(g.ballTarget.x, 0.4, g.ballTarget.z, 8);
                    if (g.onBanner) g.onBanner('🐾', `${g.petName} 叼起球，開心地跑回你身邊！`);
                }
                const rp = Math.min(1.0, (g.time - 3.2) / 2.4);
                const returnAngle = Math.atan2(0 - this.dog.group.position.x, 1.15 - this.dog.group.position.z);
                this.dog.group.rotation.y = returnAngle;
                this.dog.group.position.x = THREE.MathUtils.lerp(g.ballTarget.x - 0.18, 0, rp);
                this.dog.group.position.z = THREE.MathUtils.lerp(g.ballTarget.z, 1.15, rp);

                // 球附著在嘴部
                const mouthOffset = 0.38;
                this.interactiveBall.position.set(
                    this.dog.group.position.x + Math.sin(this.dog.group.rotation.y) * mouthOffset,
                    this.dog.group.position.y + 0.3 + Math.sin(elapsedTime * 12) * 0.03,
                    this.dog.group.position.z + Math.cos(this.dog.group.rotation.y) * mouthOffset
                );

                if (this.dog.autonomy) this.dog.autonomy.walkCycle += delta * 12;
                if (this.dog.legFL) this.dog.legFL.rotation.x = Math.sin(elapsedTime * 12) * 0.35;
                if (this.dog.legFR) this.dog.legFR.rotation.x = -Math.sin(elapsedTime * 12) * 0.35;
                if (this.dog.legBL) this.dog.legBL.rotation.x = -Math.sin(elapsedTime * 12) * 0.35;
                if (this.dog.legBR) this.dog.legBR.rotation.x = Math.sin(elapsedTime * 12) * 0.35;
                if (this.dog.tail) this.dog.tail.rotation.y = Math.sin(elapsedTime * 20) * 0.6;

            } else if (g.time <= 7.6) {
                // 階段 4：放下球歡呼
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.interactiveBall.position.set(0, 0.22, 1.45);
                    this.dog.setState('happy');
                    this.spawn3DHeart(0, 0.8, 1.15);
                    this.spawn3DStars(0, 0.9, 1.15, 14, 0xfacc15);
                    if (g.onBanner) g.onBanner('🎉', `撿球大成功！${g.petName} 搖尾討賞，心情與親密度提升！`);
                }
                this.dog.group.position.y = Math.abs(Math.sin((g.time - 5.6) * 8)) * 0.12;

            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 2：頂球 (虎鯨)
        // ----------------------------------------
        } else if (g.mode === 'orca_bounce') {
            if (g.time <= 1.2) {
                // 水球下落
                const p = g.time / 1.2;
                this.interactiveBall.position.set(0, THREE.MathUtils.lerp(2.2, 0.85, p), 0.1);

            } else if (g.time <= 2.5) {
                // 第一頂！
                if (g.subphase !== 'bounce_1') {
                    g.subphase = 'bounce_1';
                    this.triggerWaterSplash(0, 0.8, 0.1, 14);
                    this.triggerImpactBurst(0, 0.85, 0.1);
                    if (g.onBanner) g.onBanner('💥', `第一頂！好球！水花躍起！`);
                }
                const p = (g.time - 1.2) / 1.3;
                this.interactiveBall.position.y = 0.85 + Math.sin(p * Math.PI) * 1.05;
                this.dog.orcaBouncePitch = -0.42;
                this.dog.orcaBounceY = 0.22;

            } else if (g.time <= 3.8) {
                // 第二頂！
                if (g.subphase !== 'bounce_2') {
                    g.subphase = 'bounce_2';
                    this.triggerWaterSplash(0, 0.85, 0.1, 16);
                    this.spawn3DStars(0, 1.0, 0.1, 10, 0x38bdf8);
                    if (g.onBanner) g.onBanner('🌊', `第二頂！連續頂球！極致靈活！`);
                }
                const p = (g.time - 2.5) / 1.3;
                this.interactiveBall.position.y = 0.85 + Math.sin(p * Math.PI) * 1.35;
                this.dog.orcaBouncePitch = -0.45;
                this.dog.orcaBounceY = 0.28;

            } else if (g.time <= 5.5) {
                // 第三頂！360° 空中特技翻滾
                if (g.subphase !== 'bounce_3') {
                    g.subphase = 'bounce_3';
                    this.triggerWaterSplash(0, 0.95, 0.1, 22);
                    this.triggerImpactBurst(0, 0.95, 0.1);
                    if (g.onBanner) g.onBanner('⭐', `第三頂！空中 360° 旋轉特技爆發！`);
                }
                const p = (g.time - 3.8) / 1.7;
                this.interactiveBall.position.y = 0.95 + Math.sin(p * Math.PI) * 1.6;
                this.dog.group.rotation.y += delta * 6.2;
                this.dog.orcaBounceY = 0.42;

            } else if (g.time <= 7.8) {
                // 水球落水 & 虎鯨噴水彩虹歡呼
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.triggerWaterSplash(0, 0.1, 0.1, 25);
                    this.interactiveBall.visible = false;
                    this.dog.setState('happy');
                    if (this.dog.orcaBabySpout) this.dog.orcaBabySpout.scale.set(1.8, 2.5, 1.8);
                    if (this.dog.orcaAdultSpout) this.dog.orcaAdultSpout.scale.set(2.2, 3.8, 2.2);
                    this.spawn3DHeart(0, 0.9, 0.1);
                    if (g.onBanner) g.onBanner('🐳', `頂球特技大成功！虎鯨噴水歡呼！心情與親密度提升！`);
                }

            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 3：飛走再回來 (狐蝠水平俯臥展翅起飛與翱翔 — 起飛與降落平滑收展翼零落差！)
        // ----------------------------------------
        } else if (g.mode === 'bat_flight') {
            if (this.dog && this.dog.currentState !== 'bat_flying') {
                this.dog.setState('bat_flying');
            }
            if (g.time <= 1.2) {
                // 聲波召喚與蹬腿起飛：從棲息高度 (local y=1.30) 平滑翻身展開金黃頸圈與半透明寬翼升空
                const tp = Math.min(1.0, g.time / 1.2);
                const blend = Math.min(1.0, tp / 0.55);
                if (this.beaconRing1) this.beaconRing1.scale.setScalar(1.0 + Math.sin(elapsedTime * 8) * 0.2);
                if (this.beaconRing2) this.beaconRing2.scale.setScalar(1.0 + Math.cos(elapsedTime * 8) * 0.2);
                this.dog.group.position.set(
                    THREE.MathUtils.lerp(g.originPos.x, 0, tp),
                    THREE.MathUtils.lerp(g.originPos.y, 0.25, tp),
                    THREE.MathUtils.lerp(g.originPos.z, 0.35, tp)
                );
                this.dog.group.rotation.set(-0.14 * Math.sin(tp * Math.PI), 0, 0);
                if (this.dog.animateBatFlightPose) this.dog.animateBatFlightPose(elapsedTime, 13.5, blend);

            } else if (g.time <= 4.6) {
                // 飛走：在房間高空繞行大圈（水平俯臥姿態、頭朝飛行切線方向、後腳向後平伸）
                if (g.subphase !== 'fly_away') {
                    g.subphase = 'fly_away';
                    this.flightBeacon.visible = false;
                    if (g.onBanner) g.onBanner('🌌', `狐蝠露出金黃頸圈、雙後爪向後平伸，在高空展翅翱翔巡遊！`);
                }
                const p = (g.time - 1.2) / 3.4;
                const angle = p * Math.PI * 2 - Math.PI / 2;
                const fx = Math.cos(angle) * 1.8;
                const fz = Math.sin(angle) * 1.3 - 0.2;
                const fy = 0.25 + Math.sin(p * Math.PI * 4) * 0.22;

                // 飛行切線方向向量 (dx, dz)
                const vx = -Math.sin(angle) * 1.8;
                const vz = Math.cos(angle) * 1.3;

                this.dog.group.position.set(fx, fy, fz);
                this.dog.group.rotation.y = Math.atan2(vx, vz);
                this.dog.group.rotation.z = 0.26;
                this.dog.group.rotation.x = -Math.cos(p * Math.PI * 4) * 0.12;

                if (this.dog.animateBatFlightPose) this.dog.animateBatFlightPose(elapsedTime, 14.0, 1.0);

                if (Math.random() < 0.35) this.spawnStardustTrail(fx, fy + 1.30, fz);

            } else if (g.time <= 7.0) {
                // 再回來：直接俯衝飛向玩家螢幕前水平懸停展翅撒嬌
                if (g.subphase !== 'fly_return') {
                    g.subphase = 'fly_return';
                    if (g.onBanner) g.onBanner('💖', `狐蝠飛回來了！在螢幕前水平展翅懸停向你溫柔撒嬌！`);
                }
                const rp = Math.min(1.0, (g.time - 4.6) / 0.8);
                this.dog.group.position.x = THREE.MathUtils.lerp(this.dog.group.position.x, 0, rp * 0.22);
                this.dog.group.position.y = THREE.MathUtils.lerp(this.dog.group.position.y, -0.20 + Math.sin(elapsedTime * 5) * 0.04, 0.18);
                this.dog.group.position.z = THREE.MathUtils.lerp(this.dog.group.position.z, 1.15, rp * 0.22);
                this.dog.group.rotation.set(-0.08, 0.35 * Math.sin(elapsedTime * 1.6), -0.08 * Math.cos(elapsedTime * 1.6));

                if (this.dog.animateBatFlightPose) this.dog.animateBatFlightPose(elapsedTime, 10.5, 1.0);

                if (Math.random() < 0.18) this.spawn3DHeart((Math.random() - 0.5) * 0.3, 1.1, 1.15);

            } else if (g.time <= 8.5) {
                // 平穩飛回原位收翼倒掛休息（與待機棲息姿態無縫銜接！）
                if (g.subphase !== 'roost') {
                    g.subphase = 'roost';
                    if (g.onBanner) g.onBanner('🎉', `飛行巡遊大成功！狐蝠心滿意足，心情與親密度提升！`);
                }
                const lp = Math.min(1.0, (g.time - 7.0) / 1.5);
                const blend = Math.max(0.0, 1.0 - Math.max(0.0, (lp - 0.35) / 0.65));
                this.dog.group.position.x = THREE.MathUtils.lerp(0, g.originPos.x, lp);
                this.dog.group.position.y = THREE.MathUtils.lerp(-0.20, g.originPos.y, lp);
                this.dog.group.position.z = THREE.MathUtils.lerp(1.15, g.originPos.z, lp);
                this.dog.group.rotation.y = THREE.MathUtils.lerp(0, g.originRotY, lp);
                this.dog.group.rotation.x = THREE.MathUtils.lerp(-0.08, 0, lp);
                this.dog.group.rotation.z = 0;
                if (this.dog.animateBatFlightPose) this.dog.animateBatFlightPose(elapsedTime, 9.0, blend);

            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 4：碰拳 (長臂猿 / 猴子 👊)
        // ----------------------------------------
        } else if (g.mode === 'gibbon_fist') {
            if (g.time <= 1.2) {
                // 拳套道具華麗登場
                const ep = Math.min(1.0, g.time / 0.8);
                this.fistProp.scale.setScalar(THREE.MathUtils.lerp(0.01, 1.35, ep));
                if (this.fistHalo) this.fistHalo.scale.setScalar(1.0 + Math.sin(elapsedTime * 6) * 0.15);
                this.fistProp.position.set(0.28, 0.45 + Math.sin(elapsedTime * 4) * 0.03, 0.55);

            } else if (g.time <= 2.8) {
                // 長臂猿伸長手臂靠近拳頭
                if (g.subphase !== 'arm_reach') {
                    g.subphase = 'arm_reach';
                    this.dog.setState('fist_bump');
                    if (g.onBanner) g.onBanner('🐒', `長臂猿興奮地伸長招牌手臂，準備碰拳！`);
                }
                this.fistProp.position.set(0.28, 0.45 + Math.sin(elapsedTime * 4) * 0.02, 0.55);

            } else if (g.time <= 4.5) {
                // 碰拳衝擊爆發！
                if (g.subphase !== 'impact') {
                    g.subphase = 'impact';
                    this.triggerImpactBurst(0.28, 0.45, 0.55);
                    this.fistProp.scale.set(1.5, 0.85, 1.5);
                    this.dog.setState('happy');
                    if (g.onBanner) g.onBanner('💥', `👊 BUMP！碰拳成功！超強默契！`);
                }
                this.fistProp.scale.multiplyScalar(0.96);
                if (g.time > 3.8) this.fistProp.visible = false;

                // 歡呼上下蹦跳
                this.dog.group.position.y = Math.abs(Math.sin((g.time - 2.8) * 8)) * 0.14;
                if (Math.random() < 0.2) this.spawn3DHeart(0.1, 0.9, 0.5);

            } else if (g.time <= 7.0) {
                // 勝利歡呼
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    if (g.onBanner) g.onBanner('🏆', `碰拳成功！長臂猿興奮歡呼！心情與親密度提升！`);
                }
                this.fistProp.visible = false;

            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 5：水豚頂橘子平衡疊高高 (Capybara Orange Balance 🍊)
        // ----------------------------------------
        } else if (g.mode === 'capybara_orange') {
            const targetY = (this.dog.capybaraStage === 'adult') ? 1.38 : 0.95;
            if (g.time <= 1.5) {
                const p = g.time / 1.5;
                this.interactiveBall.position.set(0, THREE.MathUtils.lerp(2.3, targetY, p), 0.32);
            } else if (g.time <= 4.2) {
                if (g.subphase !== 'balance') {
                    g.subphase = 'balance';
                    this.spawn3DStars(0, targetY, 0.32, 12, 0xff9f43);
                    if (g.onBanner) g.onBanner('🧘', `穩穩接住！${g.petName} 展現泰山崩於前而色不變的佛系平衡力！`);
                }
                this.interactiveBall.position.set(Math.sin(elapsedTime * 5) * 0.04, targetY, 0.32);
                this.dog.group.rotation.z = Math.sin(elapsedTime * 5) * 0.04;
                if (Math.random() < 0.25) this.spawn3DHeart((Math.random() - 0.5) * 0.5, 1.1, 0.3);
            } else if (g.time <= 6.5) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.setState('happy');
                    this.triggerImpactBurst(0, targetY, 0.32);
                    if (g.onBanner) g.onBanner('🍊', `頂橘子大滿貫！療癒氣場全開，心情與親密度大幅提升！`);
                }
                this.dog.group.rotation.z = 0;
                this.interactiveBall.position.y = targetY + Math.abs(Math.sin(elapsedTime * 8)) * 0.22;
            } else {
                this.dog.group.rotation.z = 0;
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 6：小熊貓站立舉手萌萌威嚇秀 (Red Panda Stand & Wave 🙌)
        // ----------------------------------------
        } else if (g.mode === 'red_panda_stand') {
            if (g.time <= 1.5) {
                const p = g.time / 1.5;
                this.dog.group.position.z = THREE.MathUtils.lerp(g.originPos.z, 0.85, p);
                this.dog.group.position.x = THREE.MathUtils.lerp(g.originPos.x, 0, p);
                this.dog.group.rotation.y = 0;
            } else if (g.time <= 5.0) {
                if (g.subphase !== 'stand_roar') {
                    g.subphase = 'stand_roar';
                    this.dog.setState('stand_cute');
                    this.triggerImpactBurst(0, 0.8, 0.85);
                    if (g.onBanner) g.onBanner('🙌', `「嗷嗚～我很兇喔！」${g.petName} 雙腳站立高舉雙手搖晃，萌翻全場！`);
                }
                this.dog.group.position.y = Math.abs(Math.sin((g.time - 1.5) * 7)) * 0.1;
                if (Math.random() < 0.3) this.spawn3DHeart((Math.random() - 0.5) * 0.6, 0.95, 0.85);
            } else if (g.time <= 6.8) {
                if (g.subphase !== 'return') {
                    g.subphase = 'return';
                    this.dog.setState('happy');
                    this.spawn3DStars(0, 0.8, 0.85, 16, 0xfbbf24);
                    if (g.onBanner) g.onBanner('💖', `萌力爆擊大成功！${g.petName} 開心地抱著大尾巴轉圈！`);
                }
                const rp = (g.time - 5.0) / 1.8;
                this.dog.group.position.z = THREE.MathUtils.lerp(0.85, g.originPos.z, rp);
                this.dog.group.position.y = 0;
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 7：帝企鵝南極肚皮貼地滑冰大衝刺 (Penguin Belly Slide 🧊)
        // ----------------------------------------
        } else if (g.mode === 'penguin_slide') {
            if (g.time <= 4.5) {
                if (g.subphase !== 'sliding') {
                    g.subphase = 'sliding';
                    this.dog.setState('belly_slide');
                    if (g.onBanner) g.onBanner('🛷', `${g.petName} 用圓滾滾肚皮貼地高速滑行繞場，濺起晶瑩冰花！`);
                }
                const p = g.time / 4.5;
                const angle = p * Math.PI * 2;
                const sx = Math.sin(angle) * 1.45;
                const sz = Math.cos(angle) * 1.15 - 0.15;
                this.dog.group.position.set(sx, 0, sz);
                this.dog.group.rotation.y = angle + Math.PI / 2;
                if (Math.random() < 0.45) this.triggerWaterSplash(sx, 0.15, sz, 2);
            } else if (g.time <= 6.8) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.spawn3DStars(0, 0.8, 0, 14, 0x38bdf8);
                    this.spawn3DHeart(0, 0.9, 0);
                    if (g.onBanner) g.onBanner('🐧', `滑冰特技完美落地！${g.petName} 拍拍翅膀昂首歡呼！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 8：海獺敲扇貝開珍珠寶藏 (Sea Otter Shell Knock 🐚)
        // ----------------------------------------
        } else if (g.mode === 'otter_shell') {
            if (g.time <= 4.2) {
                if (g.subphase !== 'knocking') {
                    g.subphase = 'knocking';
                    this.dog.setState('otter_shell');
                    if (g.onBanner) g.onBanner('🪨', `叩！叩！叩！${g.petName} 雙手抱著扇貝往肚皮石頭上快樂敲擊！`);
                }
                if (Math.random() < 0.35) {
                    this.triggerWaterSplash(0, 0.35, 0.1, 3);
                    this.spawn3DStars(0, 0.55, 0.1, 2, 0xfef08a);
                }
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'pearl_open') {
                    g.subphase = 'pearl_open';
                    this.dog.setState('happy');
                    this.triggerImpactBurst(0, 0.5, 0.1);
                    this.spawn3DStars(0, 0.65, 0.1, 18, 0xfacc15);
                    if (g.onBanner) g.onBanner('🦪', `開出璀璨發光大珍珠！${g.petName} 開心地把珍珠舉高高送給你！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 9：無尾熊尤加利樹冠星光秀 (Koala Eucalyptus Climb 🌿)
        // ----------------------------------------
        } else if (g.mode === 'koala_climb') {
            if (g.time <= 4.2) {
                if (g.subphase !== 'climbing') {
                    g.subphase = 'climbing';
                    this.dog.setState('koala_climb');
                    if (g.onBanner) g.onBanner('🐨', `${g.petName} 靈巧地爬上尤加利樹枝頂端，搖落翠綠香葉與星光！`);
                }
                if (Math.random() < 0.35) this.spawn3DStars((Math.random() - 0.5) * 0.6, 1.2, 0.1, 2, 0x34d399);
            } else if (g.time <= 6.5) {
                if (g.subphase !== 'wave') {
                    g.subphase = 'wave';
                    this.dog.setState('happy');
                    this.spawn3DHeart(0, 1.1, 0.1);
                    if (g.onBanner) g.onBanner('💚', `${g.petName} 在樹頂向你熱情揮手撒嬌！心情與親密度大提升！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 10：垂耳兔快樂扭腰旋轉跳 (Bunny Binky Hop 🐰)
        // ----------------------------------------
        } else if (g.mode === 'bunny_binky') {
            if (g.time <= 4.5) {
                if (g.subphase !== 'binky') {
                    g.subphase = 'binky';
                    this.dog.setState('bunny_binky');
                    if (g.onBanner) g.onBanner('✨', `咻——啪！${g.petName} 在半空中連續使出兔子最開心的扭腰旋轉跳！`);
                }
                const angle = (g.time / 4.5) * Math.PI * 2;
                this.dog.group.position.x = Math.sin(angle) * 1.1;
                this.dog.group.position.z = Math.cos(angle) * 0.85;
                if (Math.random() < 0.3) this.spawn3DHeart(this.dog.group.position.x, 0.7, this.dog.group.position.z);
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'land') {
                    g.subphase = 'land';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.triggerImpactBurst(0, 0.5, 0);
                    if (g.onBanner) g.onBanner('🐰', `兔兔跳完美收尾！${g.petName} 甩甩長垂耳開心地蹭蹭你！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 11：大熊貓滾滾前滾翻特技 (Panda Roll 🐼)
        // ----------------------------------------
        } else if (g.mode === 'panda_roll') {
            if (g.time <= 4.4) {
                if (g.subphase !== 'rolling') {
                    g.subphase = 'rolling';
                    this.dog.setState('panda_roll');
                    if (g.onBanner) g.onBanner('🐼', `咕嚕咕嚕～！${g.petName} 像顆軟糯芝麻湯圓一樣快樂連續翻滾！`);
                }
                const angle = (g.time / 4.4) * Math.PI * 2;
                this.dog.group.position.x = Math.sin(angle) * 1.15;
                this.dog.group.position.z = Math.cos(angle) * 0.85;
                if (Math.random() < 0.35) this.spawn3DStars(this.dog.group.position.x, 0.45, this.dog.group.position.z, 1, 0x4ade80);
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'sit_bamboo') {
                    g.subphase = 'sit_bamboo';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.triggerImpactBurst(0, 0.55, 0);
                    if (g.onBanner) g.onBanner('🎋', `滾滾特技大成功！${g.petName} 拍拍肚皮開心地抱住竹子！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 12：撒哈拉耳廓狐大耳雷達飛撲 (Fennec Radar Pounce 🦊)
        // ----------------------------------------
        } else if (g.mode === 'fennec_pounce') {
            if (g.time <= 4.4) {
                if (g.subphase !== 'pouncing') {
                    g.subphase = 'pouncing';
                    this.dog.setState('fennec_pounce');
                    if (g.onBanner) g.onBanner('✨', `${g.petName} 扇動超大招風耳，在房間裡靈巧高高躍起撲抓星光！`);
                }
                const angle = (g.time / 4.4) * Math.PI * 2;
                this.dog.group.position.x = Math.sin(angle) * 1.25;
                this.dog.group.position.z = Math.cos(angle) * 0.95;
                if (Math.random() < 0.35) this.spawn3DStars(this.dog.group.position.x, 0.65, this.dog.group.position.z, 2, 0xfde047);
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.spawn3DHeart(0, 0.75, 0);
                    if (g.onBanner) g.onBanner('🦊', `雷達飛撲滿分！${g.petName} 抖動大耳朵開心地蹭蹭你！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 13：烏鴉／渡鴉水平流線展翅高空翱翔 (Crow Flight 🪶 — 起飛展翼收爪與降落伸爪收翼無縫過渡！)
        // ----------------------------------------
        } else if (g.mode === 'crow_flight') {
            if (this.dog && this.dog.currentState !== 'crow_flying') {
                this.dog.setState('crow_flying');
            }
            if (g.time <= 1.2) {
                // 階段 1：從站立高度 (local y=0.65) 平滑收爪、展開 8 指開叉初級飛羽蓄力升空
                const tp = Math.min(1.0, g.time / 1.2);
                const blend = Math.min(1.0, tp / 0.50);
                if (this.beaconRing1) this.beaconRing1.scale.setScalar(1.0 + Math.sin(elapsedTime * 8) * 0.2);
                if (this.beaconRing2) this.beaconRing2.scale.setScalar(1.0 + Math.cos(elapsedTime * 8) * 0.2);
                this.dog.group.position.set(
                    THREE.MathUtils.lerp(g.originPos.x, 0, tp),
                    THREE.MathUtils.lerp(g.originPos.y, 0.90, tp),
                    THREE.MathUtils.lerp(g.originPos.z, 0.35, tp)
                );
                this.dog.group.rotation.set(-0.14 * Math.sin(tp * Math.PI), 0, 0);
                if (this.dog.animateCrowFlightPose) this.dog.animateCrowFlightPose(elapsedTime, 13.5, blend);

            } else if (g.time <= 4.8) {
                // 階段 2：高空大迴旋巡航（水平流線身軀、前伸烏喙朝向飛行切線、雙爪收攏貼腹、修長楔尾微下傾、8 指飛羽根根分明）
                if (g.subphase !== 'crow_soar') {
                    g.subphase = 'crow_soar';
                    this.flightBeacon.visible = false;
                    if (g.onBanner) g.onBanner('🦅', `${g.petName} 雙翼高揚展現分明指狀飛羽，在高空流線盤旋翱翔！`);
                }
                const p = (g.time - 1.2) / 3.6;
                const angle = p * Math.PI * 2 - Math.PI / 2;
                const fx = Math.cos(angle) * 1.85;
                const fz = Math.sin(angle) * 1.32 - 0.2;
                const fy = 0.92 + Math.sin(p * Math.PI * 4) * 0.20;

                const vx = -Math.sin(angle) * 1.85;
                const vz = Math.cos(angle) * 1.32;

                this.dog.group.position.set(fx, fy, fz);
                this.dog.group.rotation.y = Math.atan2(vx, vz);
                this.dog.group.rotation.z = 0.24;
                this.dog.group.rotation.x = -Math.cos(p * Math.PI * 4) * 0.10;

                if (this.dog.animateCrowFlightPose) this.dog.animateCrowFlightPose(elapsedTime, 12.8, 1.0);
                if (Math.random() < 0.35) this.spawnStardustTrail(fx, fy + 0.65, fz);

            } else if (g.time <= 7.2) {
                // 階段 3：俯衝飛回鏡頭前水平展翅懸停（近距離展示照片同款高揚開叉黑翼與前伸鳥喙！）
                if (g.subphase !== 'crow_hover') {
                    g.subphase = 'crow_hover';
                    if (g.onBanner) g.onBanner('💖', `${g.petName} 飛回鏡頭前優雅展翅懸停，向你炫耀帥氣的黑曜飛羽！`);
                }
                const rp = Math.min(1.0, (g.time - 4.8) / 0.8);
                this.dog.group.position.x = THREE.MathUtils.lerp(this.dog.group.position.x, 0, rp * 0.22);
                this.dog.group.position.y = THREE.MathUtils.lerp(this.dog.group.position.y, 0.45 + Math.sin(elapsedTime * 5) * 0.04, 0.18);
                this.dog.group.position.z = THREE.MathUtils.lerp(this.dog.group.position.z, 1.15, rp * 0.22);
                // 微側身展示如參考照片般完美的側面流線與高揚指狀飛羽剪影！
                this.dog.group.rotation.set(-0.06, -0.55 + Math.sin(elapsedTime * 1.4) * 0.35, 0.08);

                if (this.dog.animateCrowFlightPose) this.dog.animateCrowFlightPose(elapsedTime, 10.5, 1.0);
                if (Math.random() < 0.20) this.spawn3DHeart((Math.random() - 0.5) * 0.3, 1.15, 1.15);

            } else if (g.time <= 8.5) {
                // 階段 4：平穩滑翔降落回原位、伸出雙腳並收攏雙翼（與地面站立姿態 100% 無縫銜接！）
                if (g.subphase !== 'crow_land') {
                    g.subphase = 'crow_land';
                    if (g.onBanner) g.onBanner('🎉', `翱翔巡遊大成功！${g.petName} 帥氣收翼降落，心情與親密度大幅提升！`);
                }
                const lp = Math.min(1.0, (g.time - 7.2) / 1.3);
                const blend = Math.max(0.0, 1.0 - Math.max(0.0, (lp - 0.30) / 0.70));
                this.dog.group.position.x = THREE.MathUtils.lerp(0, g.originPos.x, lp);
                this.dog.group.position.y = THREE.MathUtils.lerp(0.45, g.originPos.y, lp);
                this.dog.group.position.z = THREE.MathUtils.lerp(1.15, g.originPos.z, lp);
                this.dog.group.rotation.y = THREE.MathUtils.lerp(-0.55, g.originRotY, lp);
                this.dog.group.rotation.x = THREE.MathUtils.lerp(-0.06, 0, lp);
                this.dog.group.rotation.z = 0;
                if (this.dog.animateCrowFlightPose) this.dog.animateCrowFlightPose(elapsedTime, 9.0, blend);

            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 14：哈比鷹／美洲角雕展翅高空霸王翱翔 (Harpy Eagle Flight 🦅 — 棲木留原地，起飛與降落無縫收展翅！)
        // ----------------------------------------
        } else if (g.mode === 'harpy_flight') {
            if (this.dog && this.dog.currentState !== 'harpy_flying') {
                this.dog.setState('harpy_flying');
            }
            if (g.time <= 1.2) {
                // 階段 1：鬆開棲木（棲木留在地面，絕不抓木頭起飛）、雙叉黑王冠羽斜豎、黑白橫斑巨翼平滑展開升空
                const tp = Math.min(1.0, g.time / 1.2);
                const blend = Math.min(1.0, tp / 0.50);
                if (this.beaconRing1) this.beaconRing1.scale.setScalar(1.0 + Math.sin(elapsedTime * 8) * 0.2);
                if (this.beaconRing2) this.beaconRing2.scale.setScalar(1.0 + Math.cos(elapsedTime * 8) * 0.2);
                this.dog.group.position.set(
                    THREE.MathUtils.lerp(g.originPos.x, 0, tp),
                    THREE.MathUtils.lerp(g.originPos.y, 0.95, tp),
                    THREE.MathUtils.lerp(g.originPos.z, 0.35, tp)
                );
                this.dog.group.rotation.set(-0.14 * Math.sin(tp * Math.PI), 0, 0);
                if (this.dog.animateHarpyFlightPose) this.dog.animateHarpyFlightPose(elapsedTime, 11.5, blend);

            } else if (g.time <= 4.8) {
                // 階段 2：高空王者盤旋（黑白橫斑翼面、8 根黑尖開叉初級飛羽、斑馬紋大腿與金黃巨爪自然微垂）
                if (g.subphase !== 'harpy_soar') {
                    g.subphase = 'harpy_soar';
                    this.flightBeacon.visible = false;
                    if (g.onBanner) g.onBanner('🦅', `${g.petName} 展開黑白橫斑巨翼與 8 指黑尖飛羽，霸氣盤旋天際！`);
                }
                const p = (g.time - 1.2) / 3.6;
                const angle = p * Math.PI * 2 - Math.PI / 2;
                const fx = Math.cos(angle) * 1.88;
                const fz = Math.sin(angle) * 1.35 - 0.2;
                const fy = 1.00 + Math.sin(p * Math.PI * 4) * 0.22;

                const vx = -Math.sin(angle) * 1.88;
                const vz = Math.cos(angle) * 1.35;

                this.dog.group.position.set(fx, fy, fz);
                this.dog.group.rotation.y = Math.atan2(vx, vz);
                this.dog.group.rotation.z = 0.25;
                this.dog.group.rotation.x = -Math.cos(p * Math.PI * 4) * 0.10;

                if (this.dog.animateHarpyFlightPose) this.dog.animateHarpyFlightPose(elapsedTime, 10.8, 1.0);
                if (Math.random() < 0.35) this.spawnStardustTrail(fx, fy + 0.62, fz);

            } else if (g.time <= 7.2) {
                // 階段 3：飛回鏡頭前微側身懸停（完美展示參考照片中的翼下黑白橫斑、雙叉黑王冠羽與斑紋腿金爪！）
                if (g.subphase !== 'harpy_hover') {
                    g.subphase = 'harpy_hover';
                    if (g.onBanner) g.onBanner('👑', `${g.petName} 在鏡頭前霸氣懸停展翼，展示雨林空霸的威嚴英姿！`);
                }
                const rp = Math.min(1.0, (g.time - 4.8) / 0.8);
                this.dog.group.position.x = THREE.MathUtils.lerp(this.dog.group.position.x, 0, rp * 0.22);
                this.dog.group.position.y = THREE.MathUtils.lerp(this.dog.group.position.y, 0.50 + Math.sin(elapsedTime * 4.5) * 0.04, 0.18);
                this.dog.group.position.z = THREE.MathUtils.lerp(this.dog.group.position.z, 1.15, rp * 0.22);
                this.dog.group.rotation.set(-0.08, 0.52 + Math.sin(elapsedTime * 1.4) * 0.32, -0.06);

                if (this.dog.animateHarpyFlightPose) this.dog.animateHarpyFlightPose(elapsedTime, 9.5, 1.0);
                if (Math.random() < 0.20) this.spawn3DHeart((Math.random() - 0.5) * 0.3, 1.18, 1.15);

            } else if (g.time <= 8.5) {
                // 階段 4：平穩滑翔降落回棲木原位、收攏雙翼並前伸斑馬腿抓握棲木（與棲木站立姿態 100% 無縫銜接！）
                if (g.subphase !== 'harpy_land') {
                    g.subphase = 'harpy_land';
                    if (g.onBanner) g.onBanner('🎉', `高空巡航大成功！${g.petName} 威武收翼降落回棲木，心情與親密度大幅提升！`);
                }
                const lp = Math.min(1.0, (g.time - 7.2) / 1.3);
                const blend = Math.max(0.0, 1.0 - Math.max(0.0, (lp - 0.30) / 0.70));
                this.dog.group.position.x = THREE.MathUtils.lerp(0, g.originPos.x, lp);
                this.dog.group.position.y = THREE.MathUtils.lerp(0.50, g.originPos.y, lp);
                this.dog.group.position.z = THREE.MathUtils.lerp(1.15, g.originPos.z, lp);
                this.dog.group.rotation.y = THREE.MathUtils.lerp(0.52, g.originRotY, lp);
                this.dog.group.rotation.x = THREE.MathUtils.lerp(-0.08, 0, lp);
                this.dog.group.rotation.z = 0;
                if (this.dog.animateHarpyFlightPose) this.dog.animateHarpyFlightPose(elapsedTime, 8.5, blend);

            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 15：黃金倉鼠飛輪狂飆秀 (Hamster Wheel Sprint 🐹)
        // ----------------------------------------
        } else if (g.mode === 'hamster_wheel') {
            if (g.time <= 4.4) {
                if (g.subphase !== 'wheel_run') {
                    g.subphase = 'wheel_run';
                    this.dog.setState('hamster_wheel');
                    if (g.onBanner) g.onBanner('🎡', `咕嚕咕嚕！${g.petName} 小短腿幻化成殘影，飛輪高速旋轉冒出星星火花！`);
                }
                this.dog.group.position.y = Math.abs(Math.sin(elapsedTime * 16)) * 0.08;
                if (Math.random() < 0.35) this.spawn3DStars(0, 0.55, 0, 2, 0xfbbf24);
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.spawn3DHeart(0, 0.65, 0);
                    if (g.onBanner) g.onBanner('🌻', `飛輪運動大成功！${g.petName} 摸摸鼓鼓的腮幫子向你討葵花籽！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 16：森林刺蝟旋風刺球翻滾 (Hedgehog Sonic Roll 🦔)
        // ----------------------------------------
        } else if (g.mode === 'hedgehog_roll') {
            if (g.time <= 4.4) {
                if (g.subphase !== 'rolling') {
                    g.subphase = 'rolling';
                    this.dog.setState('happy');
                    if (g.onBanner) g.onBanner('💨', `${g.petName} 捲成高速小刺球繞場飛馳！頭頂紅蘋果穩穩不掉！`);
                }
                const ang = (g.time / 4.4) * Math.PI * 2;
                this.dog.group.position.set(Math.sin(ang) * 1.15, Math.abs(Math.sin(elapsedTime * 10)) * 0.12, Math.cos(ang) * 0.90);
                this.dog.group.rotation.y = ang + Math.PI / 2;
                if (Math.random() < 0.35) this.spawn3DStars(this.dog.group.position.x, 0.4, this.dog.group.position.z, 2, 0xef4444);
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.spawn3DHeart(0, 0.65, 0);
                    if (g.onBanner) g.onBanner('🍎', `旋風刺球大滿貫！${g.petName} 展開軟肚皮對你露出療癒微笑！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 17：瓶鼻海豚蔚藍躍浪空翻秀 (Dolphin Ocean Leap 🐬)
        // ----------------------------------------
        } else if (g.mode === 'dolphin_leap') {
            if (g.time <= 4.5) {
                if (g.subphase !== 'leaping') {
                    g.subphase = 'leaping';
                    this.dog.setState('happy');
                    this.triggerWaterSplash(0, 0.15, 0, 18);
                    if (g.onBanner) g.onBanner('🌊', `${g.petName} 破浪騰空躍起！在空中劃出璀璨水花弧線！`);
                }
                const p = (g.time % 2.25) / 2.25;
                this.dog.group.position.y = Math.sin(p * Math.PI) * 1.15;
                this.dog.group.rotation.x = Math.cos(p * Math.PI) * 0.45;
                if (Math.random() < 0.4) this.triggerWaterSplash(0, this.dog.group.position.y + 0.3, 0, 2);
            } else if (g.time <= 6.8) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.triggerWaterSplash(0, 0.15, 0, 22);
                    this.spawn3DHeart(0, 0.85, 0);
                    if (g.onBanner) g.onBanner('🐬', `海豚躍浪特技滿分！${g.petName} 發出歡快海豚音向你撒嬌！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 18：孟加拉虎烈焰王者飛撲 (Bengal Tiger Pounce 🐯)
        // ----------------------------------------
        } else if (g.mode === 'tiger_roar') {
            if (g.time <= 4.4) {
                if (g.subphase !== 'pouncing') {
                    g.subphase = 'pouncing';
                    this.dog.setState('happy');
                    this.triggerImpactBurst(0, 0.6, 0.2);
                    if (g.onBanner) g.onBanner('🔥', `吼嗚——！${g.petName} 額頭「王」字霸紋閃耀，展現叢林猛虎連環飛躍！`);
                }
                const ang = (g.time / 4.4) * Math.PI * 2;
                this.dog.group.position.set(Math.sin(ang) * 1.25, Math.abs(Math.sin(elapsedTime * 8)) * 0.32, Math.cos(ang) * 0.95);
                this.dog.group.rotation.y = ang + Math.PI / 2;
                if (Math.random() < 0.35) this.spawn3DStars(this.dog.group.position.x, 0.65, this.dog.group.position.z, 2, 0xf97316);
            } else if (g.time <= 6.6) {
                if (g.subphase !== 'celebrate') {
                    g.subphase = 'celebrate';
                    this.dog.group.position.set(0, 0, 0);
                    this.dog.group.rotation.set(0, 0, 0);
                    this.dog.setState('happy');
                    this.spawn3DHeart(0, 0.85, 0);
                    if (g.onBanner) g.onBanner('🐯', `猛虎飛撲霸氣落地！${g.petName} 收起爪子變成大貓咪蹭蹭你！`);
                }
            } else {
                this.stopMinigame(true);
            }

        // ----------------------------------------
        // 模式 19：安地斯神鷲 3.3m 巨翼御風滑翔秀 (Andean Condor Soaring 🏔️🦅)
        // ----------------------------------------
        } else if (g.mode === 'condor_flight') {
            if (this.dog && this.dog.currentState !== 'condor_flying') {
                this.dog.setState('condor_flying');
            }
            if (g.time <= 1.2) {
                // 階段 1：離開安地斯山岩（岩石留在地面原位）、展開雪白絨毛頸圈與大片雪白翼斑巨翼升空
                const tp = Math.min(1.0, g.time / 1.2);
                const blend = Math.min(1.0, tp / 0.50);
                if (this.beaconRing1) this.beaconRing1.scale.setScalar(1.0 + Math.sin(elapsedTime * 8) * 0.2);
                if (this.beaconRing2) this.beaconRing2.scale.setScalar(1.0 + Math.cos(elapsedTime * 8) * 0.2);
                this.dog.group.position.set(
                    THREE.MathUtils.lerp(g.originPos.x, 0, tp),
                    THREE.MathUtils.lerp(g.originPos.y, 0.98, tp),
                    THREE.MathUtils.lerp(g.originPos.z, 0.35, tp)
                );
                this.dog.group.rotation.set(-0.14 * Math.sin(tp * Math.PI), 0, 0);
                if (this.dog.animateCondorFlightPose) this.dog.animateCondorFlightPose(elapsedTime, 9.0, blend);

            } else if (g.time <= 4.8) {
                // 階段 2：高空御風大迴旋滑翔（展現參考圖 2 的超大片雪白翼區與 8 根分明開叉指狀黑飛羽！）
                if (g.subphase !== 'condor_soar') {
                    g.subphase = 'condor_soar';
                    this.flightBeacon.visible = false;
                    if (g.onBanner) g.onBanner('🏔️', `${g.petName} 展開 3.3 公尺黑白巨翼與 8 指開叉飛羽，乘著上升氣流霸氣滑翔！`);
                }
                const p = (g.time - 1.2) / 3.6;
                const angle = p * Math.PI * 2 - Math.PI / 2;
                const fx = Math.cos(angle) * 1.92;
                const fz = Math.sin(angle) * 1.38 - 0.2;
                const fy = 1.02 + Math.sin(p * Math.PI * 4) * 0.20;

                const vx = -Math.sin(angle) * 1.92;
                const vz = Math.cos(angle) * 1.38;

                this.dog.group.position.set(fx, fy, fz);
                this.dog.group.rotation.y = Math.atan2(vx, vz);
                this.dog.group.rotation.z = 0.24;
                this.dog.group.rotation.x = -Math.cos(p * Math.PI * 4) * 0.08;

                if (this.dog.animateCondorFlightPose) this.dog.animateCondorFlightPose(elapsedTime, 6.8, 1.0);
                if (Math.random() < 0.35) this.spawnStardustTrail(fx, fy + 0.64, fz);

            } else if (g.time <= 7.2) {
                // 階段 3：飛回鏡頭前展翅懸停（完美展示參考圖 2 & 3 的雪白絨毛頸圈、紫紅肉冠、象牙白尖鉤喙與黑白巨翼！）
                if (g.subphase !== 'condor_hover') {
                    g.subphase = 'condor_hover';
                    if (g.onBanner) g.onBanner('👑', `${g.petName} 在鏡頭前霸氣展翼懸停，閃耀雪白頸圈與安地斯天空之神的威儀！`);
                }
                const rp = Math.min(1.0, (g.time - 4.8) / 0.8);
                this.dog.group.position.x = THREE.MathUtils.lerp(this.dog.group.position.x, 0, rp * 0.22);
                this.dog.group.position.y = THREE.MathUtils.lerp(this.dog.group.position.y, 0.50 + Math.sin(elapsedTime * 4.2) * 0.04, 0.18);
                this.dog.group.position.z = THREE.MathUtils.lerp(this.dog.group.position.z, 1.15, rp * 0.22);
                this.dog.group.rotation.set(-0.08, 0.48 + Math.sin(elapsedTime * 1.3) * 0.30, -0.06);

                if (this.dog.animateCondorFlightPose) this.dog.animateCondorFlightPose(elapsedTime, 7.2, 1.0);
                if (Math.random() < 0.20) this.spawn3DHeart((Math.random() - 0.5) * 0.3, 1.18, 1.15);

            } else if (g.time <= 8.5) {
                // 階段 4：平穩滑翔降落回安地斯山岩、收攏雙翼露出兩側純白翼斑並伸出雙足（與山岩站立姿態 100% 無縫銜接！）
                if (g.subphase !== 'condor_land') {
                    g.subphase = 'condor_land';
                    if (g.onBanner) g.onBanner('🎉', `御風巡航大成功！${g.petName} 威武收翼降落回安地斯山岩，心情與親密度大幅提升！`);
                }
                const lp = Math.min(1.0, (g.time - 7.2) / 1.3);
                const blend = Math.max(0.0, 1.0 - Math.max(0.0, (lp - 0.30) / 0.70));
                this.dog.group.position.x = THREE.MathUtils.lerp(0, g.originPos.x, lp);
                this.dog.group.position.y = THREE.MathUtils.lerp(0.50, g.originPos.y, lp);
                this.dog.group.position.z = THREE.MathUtils.lerp(1.15, g.originPos.z, lp);
                this.dog.group.rotation.y = THREE.MathUtils.lerp(0.48, g.originRotY, lp);
                this.dog.group.rotation.x = THREE.MathUtils.lerp(-0.08, 0, lp);
                this.dog.group.rotation.z = 0;
                if (this.dog.animateCondorFlightPose) this.dog.animateCondorFlightPose(elapsedTime, 7.0, blend);

            } else {
                this.stopMinigame(true);
            }
        }
    }

    spawnAmbientWeatherParticle() {
        if (this.activeThemeKey !== 'snow' && this.activeThemeKey !== 'sakura') return;
        const isSnow = (this.activeThemeKey === 'snow');
        const geo = isSnow ? new THREE.OctahedronGeometry(0.045, 0) : new THREE.SphereGeometry(0.045, 8, 8);
        if (!isSnow) geo.scale(1.3, 0.35, 0.85);
        const mat = new THREE.MeshBasicMaterial({
            color: isSnow ? 0xffffff : 0xf9a8d4,
            transparent: true,
            opacity: 0.85
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 6.5, 3.6 + Math.random() * 0.8, (Math.random() - 0.5) * 5.0);
        this.scene.add(mesh);
        this.particles.push({
            mesh: mesh,
            vx: (Math.random() - 0.5) * 0.012,
            vy: -(0.015 + Math.random() * 0.012),
            vz: (Math.random() - 0.5) * 0.012,
            life: 2.2
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        if (this.dog) {
            this.dog.update(delta, elapsedTime);
        }

        if (this.controls) {
            this.controls.update();
        }

        // 3D 小遊戲即時狀態更新
        if (this.activeMinigame) {
            this.updateMinigame(delta, elapsedTime);
        }

        // 冰雪與粉櫻主題動態飄落粒子
        if ((this.activeThemeKey === 'snow' || this.activeThemeKey === 'sakura') && Math.random() < 0.22) {
            this.spawnAmbientWeatherParticle();
        }

        if (this.ballMesh) {
            if (this.ballVelY !== 0 || this.ballMesh.position.y > 0.24) {
                this.ballMesh.position.y += this.ballVelY;
                this.ballVelY -= 0.015;

                if (this.ballMesh.position.y <= 0.24) {
                    this.ballMesh.position.y = 0.24;
                    this.ballVelY = -this.ballVelY * 0.7;
                    if (Math.abs(this.ballVelY) < 0.02) this.ballVelY = 0;
                }
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.mesh.position.y += p.vy;
            p.mesh.position.x += p.vx;
            p.mesh.position.z += p.vz;
            if (p.gravity) {
                p.vy -= p.gravity;
            }
            if (p.isShockwave) {
                p.mesh.scale.addScalar(delta * p.scaleRate);
                if (p.mesh.material) p.mesh.material.opacity = Math.max(0, p.life / 0.6);
            } else {
                p.mesh.scale.multiplyScalar(0.98);
            }
            p.life -= delta * 0.92;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.mesh.position.y += b.vy;
            b.mesh.position.x += b.vx;
            b.life -= delta * 0.8;

            if (b.life <= 0) {
                this.scene.remove(b.mesh);
                this.bubbles.splice(i, 1);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

