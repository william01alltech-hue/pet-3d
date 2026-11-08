/**
 * 3D 全黑立耳小奶狗 (3D Pointy-Eared Black Baby Puppy) 角色模型與骨骼動畫控制器
 * 專為小奶狗比例量身打造：苗條小巧身軀、大而精神的高挺立耳、純黑油亮毛色、
 * 靈動無辜琥珀大眼、搖晃小尾巴與小碎步搖擺動畫！
 */

class BlackDog3D {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'BlackDog3D';

        this.currentState = 'idle';
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = 2.0;

        // 幼犬成長比例 (從小奶狗開始，隨著等級逐漸長大)
        this.growthScale = 0.75; // 小奶狗基礎縮放

        // 立耳抖動物理彈簧參數
        this.earTwitchL = 0;
        this.earTwitchR = 0;
        this.earVelocityL = 0;
        this.earVelocityR = 0;

        // 裝扮物件對應表
        this.accessories = {};
        this.equipped = {
            collar: 'red_collar',
            glasses: null,
            hat: null,
            cape: null
        };

        // 初始化材質與骨架
        this.initMaterials();
        this.buildPuppyMesh();
        this.buildAccessories();
        this.setGrowthScale(0.75); // 預設小奶狗體型
    }

    initMaterials() {
        // 烏黑油亮純黑幼犬毛皮 (深邃柔光黑)
        this.matBlackCoat = new THREE.MeshStandardMaterial({
            color: 0x111317,
            roughness: 0.35,
            metalness: 0.15,
            flatShading: false
        });

        // 內耳深粉黑漸層色
        this.matInnerEar = new THREE.MeshStandardMaterial({
            color: 0x3d2230,
            roughness: 0.5,
            metalness: 0.05
        });

        // 濕潤黑鼻頭
        this.matNose = new THREE.MeshStandardMaterial({
            color: 0x050505,
            roughness: 0.08,
            metalness: 0.3
        });

        // 無辜清澈的琥珀金色大眼
        this.matAmberEye = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.15,
            metalness: 0.1,
            emissive: 0x78350f,
            emissiveIntensity: 0.25
        });

        // 瞳孔
        this.matPupil = new THREE.MeshBasicMaterial({ color: 0x020202 });
        // 眼神光
        this.matShine = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // 粉嫩小舌頭
        this.matTongue = new THREE.MeshStandardMaterial({
            color: 0xff7675,
            roughness: 0.2,
            metalness: 0.05
        });

        // 幼犬小肉球
        this.matPawPad = new THREE.MeshStandardMaterial({
            color: 0x27272a,
            roughness: 0.7
        });
    }

    buildPuppyMesh() {
        // 根節點 (Root)
        this.root = new THREE.Group();
        this.group.add(this.root);

        // 1. 幼犬苗條身軀 (Slender Puppy Torso - 告別臃腫肥胖，呈現苗條流線身形)
        this.body = new THREE.Group();
        this.body.position.set(0, 0.65, 0);
        this.root.add(this.body);

        // 胸部 (略帶弧度但苗條緊實)
        const chestGeo = new THREE.SphereGeometry(0.36, 16, 16);
        chestGeo.scale(0.88, 0.95, 1.25);
        this.chestMesh = new THREE.Mesh(chestGeo, this.matBlackCoat);
        this.chestMesh.position.set(0, 0, 0.08);
        this.chestMesh.castShadow = true;
        this.chestMesh.receiveShadow = true;
        this.chestMesh.userData = { part: 'body' };
        this.body.add(this.chestMesh);

        // 苗條後腹腰部
        const bellyGeo = new THREE.SphereGeometry(0.3, 14, 14);
        bellyGeo.scale(0.78, 0.82, 1.1);
        const bellyMesh = new THREE.Mesh(bellyGeo, this.matBlackCoat);
        bellyMesh.position.set(0, -0.02, -0.28);
        bellyMesh.castShadow = true;
        bellyMesh.userData = { part: 'body' };
        this.body.add(bellyMesh);

        // 2. 幼犬大頭部 (萌萌大頭幼犬比例)
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.22, 0.45);
        this.body.add(this.neck);

        this.head = new THREE.Group();
        this.neck.add(this.head);

        // 幼犬圓潤萌萌頭部
        const headGeo = new THREE.SphereGeometry(0.44, 18, 18);
        headGeo.scale(1.02, 0.98, 1.05);
        this.headMesh = new THREE.Mesh(headGeo, this.matBlackCoat);
        this.headMesh.position.set(0, 0.28, 0.12);
        this.headMesh.castShadow = true;
        this.headMesh.userData = { part: 'head' };
        this.head.add(this.headMesh);

        // 🐕‍🦺 招牌核心：小奶狗高挺帥氣的 3D 尖立耳 (Pointy Erect Puppy Ears)
        // 左立耳關節 (Left Ear Pivot)
        this.earLeftPivot = new THREE.Group();
        this.earLeftPivot.position.set(-0.28, 0.62, 0.1);
        this.head.add(this.earLeftPivot);

        const earGeo = new THREE.ConeGeometry(0.2, 0.55, 4);
        earGeo.scale(1.0, 1.0, 0.4);
        earGeo.rotateZ(0.12);
        earGeo.rotateX(-0.1);
        this.earLeftMesh = new THREE.Mesh(earGeo, this.matBlackCoat);
        this.earLeftMesh.position.set(0, 0.24, 0);
        this.earLeftMesh.castShadow = true;
        this.earLeftMesh.userData = { part: 'ear-left' };
        this.earLeftPivot.add(this.earLeftMesh);

        // 左內耳粉嫩襯片
        const innerEarGeo = new THREE.ConeGeometry(0.14, 0.42, 4);
        innerEarGeo.scale(0.85, 0.85, 0.2);
        const innerEarL = new THREE.Mesh(innerEarGeo, this.matInnerEar);
        innerEarL.position.set(0.01, 0.22, 0.06);
        innerEarL.userData = { part: 'ear-left' };
        this.earLeftPivot.add(innerEarL);

        // 右立耳關節 (Right Ear Pivot)
        this.earRightPivot = new THREE.Group();
        this.earRightPivot.position.set(0.28, 0.62, 0.1);
        this.head.add(this.earRightPivot);

        const earRightGeo = new THREE.ConeGeometry(0.2, 0.55, 4);
        earRightGeo.scale(1.0, 1.0, 0.4);
        earRightGeo.rotateZ(-0.12);
        earRightGeo.rotateX(-0.1);
        this.earRightMesh = new THREE.Mesh(earRightGeo, this.matBlackCoat);
        this.earRightMesh.position.set(0, 0.24, 0);
        this.earRightMesh.castShadow = true;
        this.earRightMesh.userData = { part: 'ear-right' };
        this.earRightPivot.add(this.earRightMesh);

        // 右內耳粉嫩襯片
        const innerEarR = new THREE.Mesh(innerEarGeo, this.matInnerEar);
        innerEarR.position.set(-0.01, 0.22, 0.06);
        innerEarR.userData = { part: 'ear-right' };
        this.earRightPivot.add(innerEarR);

        // 3. 幼犬立體流線吻部與小鼻子 (3D Organic Puppy Snout)
        this.snout = new THREE.Group();
        this.snout.position.set(0, 0.18, 0.42);
        this.head.add(this.snout);

        const snoutGeo = new THREE.ConeGeometry(0.2, 0.34, 16);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(1.0, 0.85, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matBlackCoat);
        snoutMesh.position.set(0, 0.01, 0.14);
        snoutMesh.castShadow = true;
        snoutMesh.userData = { part: 'chin' };
        this.snout.add(snoutMesh);

        // 下顎
        const chinGeo = new THREE.SphereGeometry(0.14, 12, 12);
        chinGeo.scale(0.9, 0.6, 1.15);
        const chinMesh = new THREE.Mesh(chinGeo, this.matBlackCoat);
        chinMesh.position.set(0, -0.05, 0.11);
        chinMesh.userData = { part: 'chin' };
        this.snout.add(chinMesh);

        // 小黑豆濕潤鼻頭
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), this.matNose);
        noseMesh.scale.set(1.25, 0.9, 1.1);
        noseMesh.position.set(0, 0.035, 0.31);
        this.snout.add(noseMesh);

        // 粉紅幼犬小舌頭
        const tongueGeo = new THREE.BoxGeometry(0.08, 0.02, 0.16);
        tongueGeo.translate(0, 0, 0.08);
        this.tongue = new THREE.Mesh(tongueGeo, this.matTongue);
        this.tongue.position.set(0, -0.06, 0.1);
        this.tongue.rotation.x = 0.25;
        this.tongue.visible = false;
        this.snout.add(this.tongue);

        // 4. 無辜靈動琥珀大眼 (Puppy Innocent Big Eyes)
        this.eyesGroup = new THREE.Group();
        this.head.add(this.eyesGroup);

        const eyeGeo = new THREE.SphereGeometry(0.12, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.07, 10, 10);
        const shine1Geo = new THREE.SphereGeometry(0.04, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.02, 8, 8);

        // 左眼
        this.eyeLeft = new THREE.Group();
        this.eyeLeft.position.set(-0.2, 0.32, 0.45);
        const irisL = new THREE.Mesh(eyeGeo, this.matAmberEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.06);
        const shine1L = new THREE.Mesh(shine1Geo, this.matShine);
        shine1L.position.set(-0.03, 0.04, 0.095);
        const shine2L = new THREE.Mesh(shine2Geo, this.matShine);
        shine2L.position.set(0.03, -0.03, 0.095);
        this.eyeLeft.add(irisL, pupilL, shine1L, shine2L);
        this.eyesGroup.add(this.eyeLeft);

        // 右眼
        this.eyeRight = new THREE.Group();
        this.eyeRight.position.set(0.2, 0.32, 0.45);
        const irisR = new THREE.Mesh(eyeGeo, this.matAmberEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.06);
        const shine1R = new THREE.Mesh(shine1Geo, this.matShine);
        shine1R.position.set(-0.03, 0.04, 0.095);
        const shine2R = new THREE.Mesh(shine2Geo, this.matShine);
        shine2R.position.set(0.03, -0.03, 0.095);
        this.eyeRight.add(irisR, pupilR, shine1R, shine2R);
        this.eyesGroup.add(this.eyeRight);

        // 5. 幼犬小短腿與萌萌腳掌 (Articulated Puppy Legs)
        this.legs = {};
        const legRadius = 0.09;
        const legHeight = 0.42;
        const legGeo = new THREE.CylinderGeometry(legRadius * 0.9, legRadius, legHeight, 10);
        const pawGeo = new THREE.SphereGeometry(0.12, 10, 10);
        pawGeo.scale(1.0, 0.55, 1.25);

        const createLeg = (name, x, y, z) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, z);
            
            const limb = new THREE.Mesh(legGeo, this.matBlackCoat);
            limb.position.set(0, -legHeight / 2, 0);
            limb.castShadow = true;
            pivot.add(limb);

            const paw = new THREE.Mesh(pawGeo, this.matBlackCoat);
            paw.position.set(0, -legHeight, 0.05);
            paw.castShadow = true;
            pivot.add(paw);

            this.body.add(pivot);
            return pivot;
        };

        this.legs.frontLeft = createLeg('frontLeft', -0.24, -0.16, 0.28);
        this.legs.frontRight = createLeg('frontRight', 0.24, -0.16, 0.28);
        this.legs.backLeft = createLeg('backLeft', -0.25, -0.16, -0.32);
        this.legs.backRight = createLeg('backRight', 0.25, -0.16, -0.32);

        // 6. 萌萌立體小翹尾巴 (Cute Pointy Puppy Tail)
        this.tailBase = new THREE.Group();
        this.tailBase.position.set(0, 0.16, -0.5);
        this.tailBase.rotation.x = 0.7;
        this.body.add(this.tailBase);

        const tailSegGeo = new THREE.CylinderGeometry(0.045, 0.07, 0.18, 8);
        tailSegGeo.translate(0, 0.09, 0);

        this.tail0 = new THREE.Mesh(tailSegGeo, this.matBlackCoat);
        this.tailBase.add(this.tail0);

        this.tail1 = new THREE.Mesh(tailSegGeo, this.matBlackCoat);
        this.tail1.position.set(0, 0.16, 0);
        this.tail1.rotation.x = 0.35;
        this.tail0.add(this.tail1);

        this.tail2 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 8), this.matBlackCoat);
        this.tail2.position.set(0, 0.16, 0);
        this.tail2.rotation.x = 0.35;
        this.tail1.add(this.tail2);
    }

    // 設定體型大小 (幼犬 -> 少年 -> 成犬)
    setGrowthScale(scale) {
        this.growthScale = scale;
        this.group.scale.set(scale, scale, scale);
    }

    // 建立 3D 裝扮配件
    buildAccessories() {
        // 1. 經典紅色項圈與金牌
        const collarGroup = new THREE.Group();
        const collarGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 24);
        collarGeo.rotateX(Math.PI / 2);
        const matCollar = new THREE.MeshStandardMaterial({ color: 0xee5253, roughness: 0.3 });
        const collarMesh = new THREE.Mesh(collarGeo, matCollar);
        collarGroup.add(collarMesh);

        const tagGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
        tagGeo.rotateX(Math.PI / 2);
        const matGold = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.8, roughness: 0.2 });
        const tagMesh = new THREE.Mesh(tagGeo, matGold);
        tagMesh.position.set(0, -0.12, 0.35);
        collarGroup.add(tagMesh);

        collarGroup.position.set(0, 0.04, 0.24);
        this.neck.add(collarGroup);
        this.accessories.red_collar = collarGroup;

        // 2. 金色大鈴鐺項圈
        const bellGroup = new THREE.Group();
        const blueCollar = new THREE.Mesh(collarGeo, new THREE.MeshStandardMaterial({ color: 0x3498db }));
        bellGroup.add(blueCollar);
        const bellMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), matGold);
        bellMesh.position.set(0, -0.14, 0.35);
        bellGroup.add(bellMesh);
        bellGroup.position.set(0, 0.04, 0.24);
        bellGroup.visible = false;
        this.neck.add(bellGroup);
        this.accessories.gold_bell = bellGroup;

        // 3. 帥氣紅領巾 (Bandana)
        const bandanaGroup = new THREE.Group();
        const bandanaGeo = new THREE.ConeGeometry(0.26, 0.32, 3);
        bandanaGeo.rotateX(Math.PI);
        const matBandana = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.5 });
        const bandanaMesh = new THREE.Mesh(bandanaGeo, matBandana);
        bandanaMesh.position.set(0, -0.08, 0.32);
        bandanaMesh.scale.set(1.1, 0.8, 0.3);
        bandanaGroup.add(bandanaMesh);
        bandanaGroup.position.set(0, 0.04, 0.24);
        bandanaGroup.visible = false;
        this.neck.add(bandanaGroup);
        this.accessories.bandana = bandanaGroup;

        // 4. 酷炫黑超墨鏡 (Sunglasses)
        const glassesGroup = new THREE.Group();
        const matGlassFrame = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.2 });
        const matLens = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.05, metalness: 0.9 });
        
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.03), matLens);
        frameL.position.set(-0.2, 0.32, 0.52);
        const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.03), matLens);
        frameR.position.set(0.2, 0.32, 0.52);
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.025), matGlassFrame);
        bridge.position.set(0, 0.34, 0.52);
        glassesGroup.add(frameL, frameR, bridge);
        glassesGroup.visible = false;
        this.head.add(glassesGroup);
        this.accessories.sunglasses = glassesGroup;

        // 5. 魔法師尖帽 (Wizard Hat)
        const hatGroup = new THREE.Group();
        const matPurple = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.4 });
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 20), matPurple);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 16), matPurple);
        cone.position.set(0, 0.35, 0);
        cone.rotation.x = -0.15;
        hatGroup.add(brim, cone);
        hatGroup.position.set(0, 0.7, 0.08);
        hatGroup.rotation.x = -0.2;
        hatGroup.visible = false;
        this.head.add(hatGroup);
        this.accessories.wizard_hat = hatGroup;

        // 6. 派對帽 (Party Hat)
        const partyGroup = new THREE.Group();
        const partyCone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xff7675 }));
        partyCone.position.set(0, 0.25, 0);
        const pompom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffeaa7 }));
        pompom.position.set(0, 0.52, 0);
        partyGroup.add(partyCone, pompom);
        partyGroup.position.set(0, 0.7, 0.08);
        partyGroup.visible = false;
        this.head.add(partyGroup);
        this.accessories.party_hat = partyGroup;

        // 7. 正義超狗紅色披風 (Hero Cape)
        const capeGroup = new THREE.Group();
        const capeGeo = new THREE.PlaneGeometry(0.65, 0.9, 8, 8);
        capeGeo.rotateX(Math.PI / 3);
        const matCape = new THREE.MeshStandardMaterial({ color: 0xd63031, side: THREE.DoubleSide, roughness: 0.4 });
        this.capeMesh = new THREE.Mesh(capeGeo, matCape);
        this.capeMesh.position.set(0, 0.08, -0.45);
        capeGroup.add(this.capeMesh);
        capeGroup.visible = false;
        this.body.add(capeGroup);
        this.accessories.hero_cape = capeGroup;
    }

    // 觸發立耳抖動
    twitchEars(side = 'both') {
        if (side === 'left' || side === 'both') {
            this.earVelocityL = 22;
        }
        if (side === 'right' || side === 'both') {
            this.earVelocityR = -22;
        }
    }

    // 切換動作狀態
    setState(state) {
        this.currentState = state;
        this.tongue.visible = (state === 'happy' || state === 'eat');

        if (state === 'happy') {
            this.twitchEars('both');
        } else if (state === 'sit') {
            this.twitchEars('left');
        } else if (state === 'paw') {
            this.twitchEars('right');
        }
    }

    // 更新配件顯示
    updateAccessories(equippedMap) {
        if (equippedMap) this.equipped = equippedMap;

        Object.keys(this.accessories).forEach(key => {
            this.accessories[key].visible = false;
        });

        if (this.equipped.collar && this.accessories[this.equipped.collar]) {
            this.accessories[this.equipped.collar].visible = true;
        }
        if (this.equipped.glasses && this.accessories[this.equipped.glasses]) {
            this.accessories[this.equipped.glasses].visible = true;
        }
        if (this.equipped.hat && this.accessories[this.equipped.hat]) {
            this.accessories[this.equipped.hat].visible = true;
        }
        if (this.equipped.cape && this.accessories[this.equipped.cape]) {
            this.accessories[this.equipped.cape].visible = true;
        }
    }

    // 每幀動畫更新循環 (60 FPS)
    update(delta, elapsedTime) {
        // 1. 立耳彈簧物理 (Ear Twitch Spring Physics)
        const spring = 85;
        const damping = 7;

        this.earVelocityL += (-this.earTwitchL * spring - this.earVelocityL * damping) * delta;
        this.earTwitchL += this.earVelocityL * delta;
        this.earLeftPivot.rotation.z = THREE.MathUtils.degToRad(this.earTwitchL);

        this.earVelocityR += (-this.earTwitchR * spring - this.earVelocityR * damping) * delta;
        this.earTwitchR += this.earVelocityR * delta;
        this.earRightPivot.rotation.z = THREE.MathUtils.degToRad(this.earTwitchR);

        // 2. 幼犬眨眼動畫計時
        this.nextBlinkTime -= delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.0 + Math.random() * 3.0;
        }

        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            this.eyeLeft.scale.y = eyeScaleY;
            this.eyeRight.scale.y = eyeScaleY;

            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                this.eyeLeft.scale.y = 1;
                this.eyeRight.scale.y = 1;
            }
        }

        // 3. 幼犬小雨刷式快速搖尾 (Puppy Fast Wagging Tail)
        let wagSpeed = 8;
        let wagAmp = 0.45;

        if (this.currentState === 'happy' || this.currentState === 'pet') {
            wagSpeed = 22;
            wagAmp = 0.75;
        } else if (this.currentState === 'sleep') {
            wagSpeed = 0;
            wagAmp = 0;
        }

        const tailWave = Math.sin(elapsedTime * wagSpeed) * wagAmp;
        this.tailBase.rotation.y = tailWave;
        this.tail1.rotation.y = tailWave * 0.8;
        this.tail2.rotation.y = tailWave * 0.6;

        // 4. 披風飄動
        if (this.capeMesh && this.accessories.hero_cape && this.accessories.hero_cape.visible) {
            this.capeMesh.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 8) * 0.15;
        }

        // 5. 幼犬特有動作機 (Puppy Wobble & Cute Actions)
        const t = elapsedTime;

        switch (this.currentState) {
            case 'idle':
                // 幼犬搖頭晃腦小呼吸律動
                this.body.position.y = 0.65 + Math.sin(t * 3.0) * 0.02;
                this.head.rotation.x = Math.sin(t * 2.0) * 0.05;
                this.head.rotation.y = Math.sin(t * 1.2) * 0.08;
                this.head.rotation.z = Math.sin(t * 1.5) * 0.04; // 歪頭殺
                this.root.rotation.set(0, 0, 0);
                this.resetLegs();
                break;

            case 'happy':
                // 小奶狗興奮原地小碎跳
                const hop = Math.abs(Math.sin(t * 9));
                this.body.position.y = 0.65 + hop * 0.28;
                this.head.rotation.x = -0.2 + hop * 0.18;
                this.legs.frontLeft.rotation.x = hop * 0.35;
                this.legs.frontRight.rotation.x = hop * 0.35;
                this.legs.backLeft.rotation.x = -hop * 0.25;
                this.legs.backRight.rotation.x = -hop * 0.25;
                break;

            case 'pet':
                // 幼犬被摸摸時舒服閉眼歪頭仰起
                this.body.position.y = 0.62;
                this.head.rotation.x = -0.25 + Math.sin(t * 3.5) * 0.04;
                this.head.rotation.z = 0.12;
                this.eyeLeft.scale.y = 0.18;
                this.eyeRight.scale.y = 0.18;
                break;

            case 'sit':
                // 小奶狗乖乖坐下
                this.body.position.y = 0.5;
                this.body.rotation.x = -0.28;
                this.head.rotation.x = 0.25;
                this.legs.backLeft.rotation.x = 1.1;
                this.legs.backRight.rotation.x = 1.1;
                this.legs.frontLeft.rotation.x = 0.25;
                this.legs.frontRight.rotation.x = 0.25;
                break;

            case 'paw':
                // 抬起小短爪握手
                this.body.position.y = 0.5;
                this.body.rotation.x = -0.22;
                this.head.rotation.x = 0.22;
                this.legs.frontRight.rotation.x = -1.25;
                this.legs.frontRight.rotation.z = -0.25;
                this.legs.frontLeft.rotation.x = 0.22;
                this.legs.backLeft.rotation.x = 1.0;
                this.legs.backRight.rotation.x = 1.0;
                break;

            case 'rollover':
                // 小奶狗翻肚肚倒地撒嬌
                this.body.position.y = 0.3;
                this.root.rotation.z = Math.sin(t * 4.5) * 0.35 + Math.PI;
                this.legs.frontLeft.rotation.x = 0.7;
                this.legs.frontRight.rotation.x = 0.7;
                this.legs.backLeft.rotation.x = 0.7;
                this.legs.backRight.rotation.x = 0.7;
                break;

            case 'eat':
                // 喝奶 / 吃肉泥低頭咀嚼
                this.body.position.y = 0.58;
                this.body.rotation.x = 0.22;
                this.neck.rotation.x = 0.32 + Math.sin(t * 14) * 0.07;
                this.resetLegs();
                break;

            case 'sleep':
                // 幼犬蜷縮在窩裡側躺睡覺
                this.body.position.y = 0.3;
                this.body.rotation.z = 1.35;
                this.head.rotation.y = 0.25;
                this.eyeLeft.scale.y = 0.1;
                this.eyeRight.scale.y = 0.1;
                this.legs.frontLeft.rotation.z = 0.45;
                this.legs.frontRight.rotation.z = 0.45;
                this.legs.backLeft.rotation.z = 0.45;
                this.legs.backRight.rotation.z = 0.45;
                break;
        }
    }

    resetLegs() {
        this.legs.frontLeft.rotation.set(0, 0, 0);
        this.legs.frontRight.rotation.set(0, 0, 0);
        this.legs.backLeft.rotation.set(0, 0, 0);
        this.legs.backRight.rotation.set(0, 0, 0);
        this.body.rotation.set(0, 0, 0);
    }
}
