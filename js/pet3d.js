/**
 * 3D 虛擬寵物模型與骨骼動畫控制器 (Virtual Pet 3D Engine) - 參考圖寫實升級版
 * 完美還原參考圖細節：
 * 1. 🐕‍🦺 全黑立耳小黑狗 (Pointy-Eared Black Puppy)
 * 2. 🐱 緬因貓幼崽 (Maine Coon Kitten) - 銀灰煙燻虎斑、金色大圓眼、層次蓬鬆大圍脖、銀爪項鍊
 * 3. 🦊 狐狸幼崽 (Fox Kit) - 三種自選款式：
 *    - 🟠 橘色赤狐 (Red Fox) - 暖橘白頰、黑靴小爪、白尖大尾、甜美微笑、銀爪項鍊
 *    - ⚪ 白色北極狐 (Arctic Fox) - 棉花糖雪球狐、眯眼甜笑、超蓬鬆白尾
 *    - ⚫ 黑色銀狐 (Silver Fox) - 銀霜黑灰毛色、琥珀大眼、白頰胸毛、白尖尾巴、銀爪項鍊
 */

class VirtualPet3D {
    constructor(petType = 'dog', colorVariant = 'default') {
        this.petType = petType; // 'dog' | 'cat' | 'fox'
        this.colorVariant = colorVariant; // for fox: 'red' | 'white' | 'silver'

        this.group = new THREE.Group();
        this.group.name = 'VirtualPet3D_' + petType;

        this.currentState = 'idle';
        this.state = 'idle';
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = 2.0;

        // 🌟 犬類與獵豹、雪豹、水豚、小熊貓、垂耳兔、非洲獅、耳廓狐、長頸鹿、北極熊、刺蝟、孟加拉虎自由走動與趴下休息自主控制器
        this.autonomy = {
            enabled: ['dog', 'fox', 'wolf', 'hyena', 'cheetah', 'maned_wolf', 'snow_leopard', 'capybara', 'red_panda', 'bunny', 'lion', 'fennec', 'giraffe', 'polar_bear', 'hedgehog', 'tiger'].includes(this.petType),
            state: 'idle_rest', // 'idle_rest' | 'walking'
            timer: 4.0 + Math.random() * 4.0,
            currentSpotIndex: 0,
            targetSpot: null,
            lieDownFactor: 0.0,
            targetLieDownFactor: 0.0,
            walkCycle: 0.0,
            speed: 0.82
        };

        // 🐋 虎鯨潛入水底與破浪噴水控制器
        this.orcaDive = {
            timer: 6.0 + Math.random() * 6.0,
            phase: 'surface', // 'surface' | 'diving' | 'underwater' | 'breaching' | 'recovering'
            phaseTime: 0.0,
            depth: 0.0,
            pitch: 0.0
        };

        // 🦅 鳥類（角雕、渡鴉）高空展翼飛行控制器
        this.birdFlight = {
            timer: 8.0 + Math.random() * 6.0,
            phase: 'perch', // 'perch' | 'takeoff' | 'flying' | 'landing'
            phaseTime: 0.0,
            flightAngle: 0.0
        };

        // 🦇 狐蝠（幼蝠不飛，長大成蝠飛翔巡航）控制器
        this.batFlight = {
            timer: 10.0 + Math.random() * 6.0,
            phase: 'roosting', // 'roosting' | 'drop_launch' | 'flying' | 'return_hang'
            phaseTime: 0.0,
            flightAngle: 0.0
        };

        // 立耳抖動彈簧
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

        this.growthScale = 0.75;

        // 構建材質與 3D 結構
        this.initMaterials();
        this.buildPetMesh();
        this.ensureInteractiveHitParts();
        this.buildAccessories();
        this.setGrowthScale(0.75);
    }

    // 確保所有 3D 寵物網格皆具備射線點擊互動標籤 (userData.part)
    ensureInteractiveHitParts() {
        if (!this.root) return;
        this.root.traverse(obj => {
            if (obj.isMesh && (!obj.userData || !obj.userData.part)) {
                let p = obj.parent;
                let detectedPart = 'body';
                while (p && p !== this.root) {
                    const n = (p.name || '').toLowerCase();
                    if (n.includes('earl') || n.includes('earleft')) { detectedPart = 'ear-left'; break; }
                    if (n.includes('earr') || n.includes('earright')) { detectedPart = 'ear-right'; break; }
                    if (n.includes('head') || p === this.head || p === this.batFlightHead || p === this.crowFlightHead || p === this.harpyFlightHead || p === this.condorFlightHead || p === this.condorBabyHead || p === this.condorAdultHead || p === this.capybaraBabyHead || p === this.capybaraAdultHead || p === this.redPandaBabyHead || p === this.redPandaAdultHead || p === this.snowLeopardBabyHead || p === this.snowLeopardAdultHead || p === this.penguinBabyHead || p === this.penguinAdultHead || p === this.gibbonBabyHead || p === this.gibbonAdultHead || p === this.seaOtterBabyHead || p === this.seaOtterAdultHead || p === this.koalaBabyHead || p === this.koalaAdultHead || p === this.bunnyBabyHead || p === this.bunnyAdultHead || p === this.lionBabyHead || p === this.lionAdultHead || p === this.pandaBabyHead || p === this.pandaAdultHead || p === this.fennecBabyHead || p === this.fennecAdultHead || p === this.giraffeBabyHead || p === this.giraffeAdultHead || p === this.polarBearBabyHead || p === this.polarBearAdultHead || p === this.hamsterBabyHead || p === this.hamsterAdultHead || p === this.hedgehogBabyHead || p === this.hedgehogAdultHead || p === this.dolphinBabyHead || p === this.dolphinAdultHead || p === this.tigerBabyHead || p === this.tigerAdultHead) {
                        detectedPart = 'head';
                        break;
                    }
                    p = p.parent;
                }
                obj.userData = Object.assign({}, obj.userData, { part: detectedPart });
            }
        });
    }

    initMaterials() {
        // --- 1. 黑狗材質 ---
        this.matBlackCoat = new THREE.MeshStandardMaterial({
            color: 0x111317,
            roughness: 0.35,
            metalness: 0.15
        });

        // --- 2. 緬因貓材質 (高級暖棕煙燻虎斑長毛 Maine Coon) ---
        this.matCatCoat = new THREE.MeshStandardMaterial({
            color: 0x8a6340, // 溫暖棕褐底色 (Classic brown tabby)
            roughness: 0.72,
            metalness: 0.0
        });
        this.matCatCoatDark = new THREE.MeshStandardMaterial({
            color: 0x4a3018, // 深棕虎斑條紋
            roughness: 0.75
        });
        this.matCatFluff = new THREE.MeshStandardMaterial({
            color: 0xf5e6d0, // 奶油暖白 - 胸前豪華大圍脖
            roughness: 0.9,
            metalness: 0.0
        });
        this.matCatFluffInner = new THREE.MeshStandardMaterial({
            color: 0xfff8f0, // 純奶白內層
            roughness: 0.95
        });
        this.matCatEarTuft = new THREE.MeshStandardMaterial({
            color: 0x5c3d1e, // 深棕耳尖簇毛
            roughness: 0.75
        });
        this.matCatEye = new THREE.MeshStandardMaterial({
            color: 0x22c55e, // 翠綠色大眼 (Maine Coon 特徵)
            roughness: 0.1,
            metalness: 0.05,
            emissive: 0x16a34a,
            emissiveIntensity: 0.4
        });
        this.matCatNose = new THREE.MeshStandardMaterial({
            color: 0xff8fab, // 嫩粉色三角鼻
            roughness: 0.2
        });
        this.matCatMuzzle = new THREE.MeshStandardMaterial({
            color: 0xd4b896, // 淡棕色口鼻墊
            roughness: 0.8
        });

        // --- 3. 狐狸材質 (赤狐 / 北極狐 / 銀狐) ---
        if (this.colorVariant === 'white') {
            // ⚪ 白色北極狐 (參考圖 1：棉花糖般超蓬鬆純白雪球狐)
            this.matFoxCoat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 });
            this.matFoxWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
            this.matFoxPaw = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
            this.matFoxEarBack = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
            this.matFoxEye = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 }); // 眯眼黑色甜笑大眼
        } else if (this.colorVariant === 'silver') {
            // ⚫ 黑色銀狐 (參考圖 2：銀霜黑灰毛色、琥珀大眼、白頰胸毛、白尾尖)
            this.matFoxCoat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.55, metalness: 0.1 }); // 銀灰霜毛
            this.matFoxWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }); // 純白頰與胸毛
            this.matFoxPaw = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 }); // 深黑爪
            this.matFoxEarBack = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 }); // 耳背純黑
            this.matFoxEye = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, emissive: 0xb45309, emissiveIntensity: 0.35 }); // 璀璨琥珀大眼
        } else {
            // 🟠 橘色赤狐 (參考圖 4：鮮豔暖橘、白頰白圍脖、黑襪小爪、白尾尖)
            this.matFoxCoat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.5, metalness: 0.08 }); // 暖亮橘紅
            this.matFoxWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }); // 雪白面頰與胸毛
            this.matFoxPaw = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.65 }); // 黑襪小爪
            this.matFoxEarBack = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 }); // 耳背黑毛
            this.matFoxEye = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.15, emissive: 0x451a03, emissiveIntensity: 0.3 }); // 暖棕靈動大眼
        }

        // --- 4. 招牌銀爪吊墜項鍊材質 (Silver Paw Necklace) ---
        this.matSilverNecklace = new THREE.MeshStandardMaterial({
            color: 0xe5e7eb,
            metalness: 0.95,
            roughness: 0.15
        });

        // --- 5. 狐蝠（果蝠）專屬材質 ---
        this.matBatFur = new THREE.MeshStandardMaterial({
            color: 0x241d19, // 深焦糖深黑棕色柔毛 (參考圖 1, 2)
            roughness: 0.82,
            metalness: 0.05
        });
        this.matBatFace = new THREE.MeshStandardMaterial({
            color: 0x1c1512, // 吻部與臉部柔光深黑棕色
            roughness: 0.72
        });
        this.matBatWing = new THREE.MeshStandardMaterial({
            color: 0x131111, // 黑色皮革光澤雙翼 (參考圖 3)
            roughness: 0.45,
            metalness: 0.18,
            side: THREE.DoubleSide
        });
        this.matBatGoldenMantle = new THREE.MeshStandardMaterial({
            color: 0xeab308, // 飛翔狐蝠標誌性金黃暖橙頸圈毛領 (Golden-ochre neck ruff)
            roughness: 0.88,
            emissive: 0x78350f,
            emissiveIntensity: 0.08
        });
        this.matBatFlightMembrane = new THREE.MeshStandardMaterial({
            color: 0x3d281f, // 迎光半透明深棕翼膜 (Translucent warm brown patagium)
            roughness: 0.48,
            metalness: 0.06,
            transparent: true,
            opacity: 0.89,
            side: THREE.DoubleSide
        });
        this.matBatWingBone = new THREE.MeshStandardMaterial({
            color: 0x160f0c, // 翼指骨架與血管深黑棕色
            roughness: 0.42
        });
        this.matBatEye = new THREE.MeshStandardMaterial({
            color: 0x050508, // 黑曜石深邃水靈靈大圓眼
            roughness: 0.08,
            metalness: 0.3
        });
        this.matBatTowel = new THREE.MeshStandardMaterial({
            color: 0x93c5fd, // 參考圖 2：淡天藍色柔軟包裹毛巾 (Baby blue fleece towel)
            roughness: 0.92,
            metalness: 0.0
        });
        this.matBatTowelTrim = new THREE.MeshStandardMaterial({
            color: 0xdbeafe, // 毛巾白色/淡奶藍柔軟滾邊
            roughness: 0.95
        });
        this.matBananaPeel = new THREE.MeshStandardMaterial({
            color: 0xfacc15, // 香蕉外皮亮黃
            roughness: 0.35,
            metalness: 0.05
        });
        this.matBananaFruit = new THREE.MeshStandardMaterial({
            color: 0xfef9c3, // 香蕉白嫩果肉
            roughness: 0.45
        });
        this.matWoodPerch = new THREE.MeshStandardMaterial({
            color: 0x6b4f3b, // 倒掛原木橫樑
            roughness: 0.78,
            metalness: 0.05
        });

        // --- 6. 冰眸黑狼（Black Wolf）專屬材質 ---
        this.matWolfPupCoat = new THREE.MeshStandardMaterial({
            color: 0x232328, // 參考圖 1：煙燻黑幼狼蓬鬆柔毛 (Smoky charcoal dark fur)
            roughness: 0.88,
            metalness: 0.0
        });
        this.matWolfPupInnerEar = new THREE.MeshStandardMaterial({
            color: 0x475569, // 參考圖 1：幼狼內耳淡煙燻灰柔毛 (Soft smoky grey inner ear)
            roughness: 0.92
        });
        this.matWolfPupEye = new THREE.MeshStandardMaterial({
            color: 0x5b8296, // 參考圖 1：深邃灰藍鋼藍幼狼瞳孔 (Steel blue pup eye)
            roughness: 0.2,
            metalness: 0.1
        });
        this.matWolfAdultCoat = new THREE.MeshStandardMaterial({
            color: 0x0c0e12, // 參考圖 2：落雪黑狼深邃漆黑毛皮 (Deep obsidian black coat)
            roughness: 0.62,
            metalness: 0.08
        });
        this.matWolfMane = new THREE.MeshStandardMaterial({
            color: 0x14171d, // 參考圖 2：狼王厚實頸部鬃毛與胸脯 (Thick wolf neck ruff)
            roughness: 0.82,
            metalness: 0.04
        });
        this.matWolfAdultInnerEar = new THREE.MeshStandardMaterial({
            color: 0x334155, // 狼耳內軟灰毛
            roughness: 0.9
        });
        this.matWolfIcyEye = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // 參考圖 2 核心：攝人心魄的晶亮冰藍眸
            emissive: 0x00d8ff, // 冰霜藍發光魔眸
            emissiveIntensity: 0.95,
            roughness: 0.05,
            metalness: 0.15
        });
        this.matSnowFlake = new THREE.MeshStandardMaterial({
            color: 0xf8fafc, // 參考圖 2：雪松林細碎積雪落雪微塵 (Sparkling snow dusting)
            roughness: 0.9
        });

        // --- 7. 斑鬣狗（Spotted Hyena / 獵狗）專屬材質 ---
        this.matHyenaCubCoat = new THREE.MeshStandardMaterial({
            color: 0x3d3129, // 參考圖 1：幼崽深焦褐炭灰蓬鬆柔毛 (Deep fuzzy brown coat)
            roughness: 0.88,
            metalness: 0.0
        });
        this.matHyenaCubFace = new THREE.MeshStandardMaterial({
            color: 0xba9f83, // 參考圖 1：幼崽面部與耳部淺沙米黃柔毛 (Sandy buff face)
            roughness: 0.85
        });
        this.matHyenaAdultCoat = new THREE.MeshStandardMaterial({
            color: 0xc4a478, // 參考圖 2：成體乾燥草原沙金黃褐色皮毛 (Tawny sandy coat)
            roughness: 0.72,
            metalness: 0.05
        });
        this.matHyenaSpots = new THREE.MeshStandardMaterial({
            color: 0x32231b, // 參考圖 2：標誌性深黑褐色斑點 (Dark brown spots)
            roughness: 0.78
        });
        this.matHyenaMane = new THREE.MeshStandardMaterial({
            color: 0x241a13, // 參考圖 2：高聳頸背深色短鬃毛脊 (Dorsal crest mane)
            roughness: 0.85
        });
        this.matHyenaMuzzle = new THREE.MeshStandardMaterial({
            color: 0x261e18, // 結實有力深黑褐吻部
            roughness: 0.7
        });
        this.matHyenaAmberEye = new THREE.MeshStandardMaterial({
            color: 0x854d0e, // 靈動深邃琥珀棕眼眸
            roughness: 0.15,
            emissive: 0x451a03,
            emissiveIntensity: 0.25
        });
        this.matHyenaInnerEar = new THREE.MeshStandardMaterial({
            color: 0x9e8062, // 參考圖 2：沙棕微深絨毛內耳
            roughness: 0.85
        });

        // --- 8. 非洲獵豹（Cheetah / 陸地極速之王）專屬材質 ---
        this.matCheetahCoat = new THREE.MeshStandardMaterial({
            color: 0xdfa552, // 參考圖 1 & 2：溫暖金黃沙質獵豹短毛皮 (Golden tawny coat)
            roughness: 0.65,
            metalness: 0.05
        });
        this.matCheetahBelly = new THREE.MeshStandardMaterial({
            color: 0xf5eedb, // 腹部與胸前純白/淡奶白柔毛 (Pale creamy underbelly)
            roughness: 0.78
        });
        this.matCheetahSpots = new THREE.MeshStandardMaterial({
            color: 0x0a0908, // 參考圖 1：純黑實心圓斑點 (Solid black spots)
            roughness: 0.72
        });
        this.matCheetahMantle = new THREE.MeshStandardMaterial({
            color: 0xc8ced4, // 參考圖 2 幼崽特有：銀灰色蓬鬆背毛披風 (Silvery-gray fuzzy mantle)
            roughness: 0.92
        });
        this.matCheetahMantleInner = new THREE.MeshStandardMaterial({
            color: 0x9ca3af, // 披風內層煙霧深灰底色
            roughness: 0.88
        });
        this.matCheetahTear = new THREE.MeshStandardMaterial({
            color: 0x080706, // 參考圖 1 & 2 招牌：自眼角至唇角的深黑淚痕 (Facial tear stripes)
            roughness: 0.45
        });
        this.matCheetahAmberEye = new THREE.MeshStandardMaterial({
            color: 0xb8861b, // 靈動金琥珀色貓科獵手眼眸
            roughness: 0.12,
            emissive: 0x3d2503,
            emissiveIntensity: 0.22
        });

        // --- 9. 暗夜烏鴉 / 極夜渡鴉（Crow & Raven / 靈禽領主）專屬材質 ---
        this.matCrowBabyFluff = new THREE.MeshStandardMaterial({
            color: 0x141417, // 參考圖 1：黑煤球幼雛純黑柔軟絨毛 (Charcoal fluffy baby down)
            roughness: 0.96,
            metalness: 0.02
        });
        this.matCrowBabyCheek = new THREE.MeshStandardMaterial({
            color: 0x1c1d22, // 幼雛臉頰微淺蓬鬆軟毛
            roughness: 0.92
        });
        this.matCrowAdultPlumage = new THREE.MeshStandardMaterial({
            color: 0x090a0f, // 參考圖 2：成體渡鴉油亮暗黑羽衣 (Iridescent midnight raven coat)
            roughness: 0.28,
            metalness: 0.35
        });
        this.matCrowWingFeather = new THREE.MeshStandardMaterial({
            color: 0x0e1017, // 渡鴉初級飛羽與長翼羽片 (Flight feather sheen)
            roughness: 0.32,
            metalness: 0.28
        });
        this.matCrowBeak = new THREE.MeshStandardMaterial({
            color: 0x121316, // 堅硬深黑角質鳥喙 (Polished raven bill)
            roughness: 0.18,
            metalness: 0.4
        });
        this.matCrowBeakHighlight = new THREE.MeshStandardMaterial({
            color: 0xcbd5e1, // 參考圖：飛行時鳥喙中段與上緣反射天光的銀灰角質光澤
            roughness: 0.22,
            metalness: 0.48
        });
        this.matCrowHeadSlate = new THREE.MeshStandardMaterial({
            color: 0x1e242d, // 參考圖：飛行時頭頸側面受天光映照的深石板灰藍黑光澤
            roughness: 0.42,
            metalness: 0.25
        });
        this.matCrowBabyGape = new THREE.MeshStandardMaterial({
            color: 0xfda4af, // 參考圖 1 幼鳥特有：粉嫩肉質口緣嘴角 (Pinkish baby gape)
            roughness: 0.55
        });
        this.matCrowLegs = new THREE.MeshStandardMaterial({
            color: 0x18191d, // 烏鴉鱗片鳥爪 (Scaled talons)
            roughness: 0.75,
            metalness: 0.1
        });
        this.matCrowEyeRing = new THREE.MeshStandardMaterial({
            color: 0xa1a1aa, // 幼雛水靈大眼睛周圍淡銀灰幼鳥眼圈
            roughness: 0.7
        });
        this.matCrowRavenEye = new THREE.MeshStandardMaterial({
            color: 0x0a1120, // 成年渡鴉深邃靈動暗黑魔眸
            roughness: 0.08,
            metalness: 0.2
        });

        // --- 10. 南美鬃狼 / 長腿狐狼（Maned Wolf / 九頭身超模狼）專屬材質 ---
        this.matManedWolfPupCoat = new THREE.MeshStandardMaterial({
            color: 0x423832, // 參考圖 2：幼崽期煙燻深灰褐絨毛 (Smoky brownish-charcoal pup coat)
            roughness: 0.88
        });
        this.matManedWolfPupMuzzle = new THREE.MeshStandardMaterial({
            color: 0x241d1a, // 幼崽黑色小面具吻部
            roughness: 0.72
        });
        this.matManedWolfAdultCoat = new THREE.MeshStandardMaterial({
            color: 0xd66127, // 參考圖 1 & 2：鮮豔金橘赤紅長毛 (Striking golden-red fox coat)
            roughness: 0.65,
            metalness: 0.04
        });
        this.matManedWolfStockings = new THREE.MeshStandardMaterial({
            color: 0x151413, // 參考圖 1：標誌性超長黑靴/黑色過膝長襪 (Black stockings)
            roughness: 0.7,
            metalness: 0.08
        });
        this.matManedWolfMane = new THREE.MeshStandardMaterial({
            color: 0x181615, // 參考圖 1：頸部至背脊高聳直立黑鬃毛 (Black dorsal mane crest)
            roughness: 0.85
        });
        this.matManedWolfWhitePatch = new THREE.MeshStandardMaterial({
            color: 0xfafafa, // 參考圖 1：下巴喉部、大耳內襯與尾巴尖純白柔毛 (White throat & tail tip)
            roughness: 0.75
        });
        this.matManedWolfBlackMuzzle = new THREE.MeshStandardMaterial({
            color: 0x1a1816, // 修長深黑狐系吻部 (Slender black muzzle)
            roughness: 0.5
        });
        this.matManedWolfAmberEye = new THREE.MeshStandardMaterial({
            color: 0xc47b19, // 靈動金琥珀色眼眸
            roughness: 0.12,
            emissive: 0x4f2203,
            emissiveIntensity: 0.22
        });
        this.matManedWolfPupEye = new THREE.MeshStandardMaterial({
            color: 0xdf8a28, // 幼崽水潤純真暖琥珀金棕
            roughness: 0.12,
            emissive: 0x78350f,
            emissiveIntensity: 0.35
        });
        this.matManedWolfEyeRing = new THREE.MeshStandardMaterial({
            color: 0x141211, // 眼眶深色邊緣
            roughness: 0.8
        });

        // 🐘 大象專屬質感材質
        this.matElephantSkin = new THREE.MeshStandardMaterial({
            color: 0x726a63, // 參考圖 2：成年象深邃古樸大地灰皮（帶歲月微褶皺質感）
            roughness: 0.88,
            metalness: 0.02
        });
        this.matElephantBabySkin = new THREE.MeshStandardMaterial({
            color: 0x938880, // 參考圖 1：小象幼崽溫潤軟糯的暖灰肉粉調
            roughness: 0.82,
            metalness: 0.02
        });
        this.matElephantInnerEar = new THREE.MeshStandardMaterial({
            color: 0xad968d, // 耳廓內側透光溫柔粉褐質感
            roughness: 0.85
        });
        this.matElephantTusk = new THREE.MeshStandardMaterial({
            color: 0xfffcf0, // 威武象牙純淨乳白帶細膩溫潤光澤
            roughness: 0.18,
            metalness: 0.08
        });
        this.matElephantToenail = new THREE.MeshStandardMaterial({
            color: 0xd6cebe, // 圓圓的憨厚小象趾甲
            roughness: 0.6
        });
        this.matElephantTailBrush = new THREE.MeshStandardMaterial({
            color: 0x221f1c, // 尾尖剛硬黑色剛毛刷
            roughness: 0.9
        });
        this.matElephantEye = new THREE.MeshStandardMaterial({
            color: 0x3d2817, // 大象特有的深邃、溫柔、極具智慧的暖棕靈瞳
            roughness: 0.1,
            emissive: 0x1f1208,
            emissiveIntensity: 0.2
        });

        // 🦅 哈比鷹（美洲角雕）專屬高級材質
        this.matHarpyBabyFluff = new THREE.MeshStandardMaterial({
            color: 0xfbf9f6, // 參考圖 2：台北市立動物園軟綿綿純白羽絨雪球
            roughness: 0.95
        });
        this.matHarpyBabyBeak = new THREE.MeshStandardMaterial({
            color: 0x93a3b1, // 幼雛青灰粉嫩小鉤喙
            roughness: 0.5
        });
        this.matHarpyBabyMask = new THREE.MeshStandardMaterial({
            color: 0x47494e, // 幼雛眼周初生淡淡青黑面罩
            roughness: 0.9
        });
        this.matHarpyBabyFoot = new THREE.MeshStandardMaterial({
            color: 0xd9d3c7, // 幼雛肉粉淺灰恐龍爪爪
            roughness: 0.7
        });
        this.matHarpyAdultCrest = new THREE.MeshStandardMaterial({
            color: 0x18191b, // 參考圖 1：標誌性「雙叉羽冠」濃墨黑羽（可豎起王冠）
            roughness: 0.7
        });
        this.matHarpyFaceDisk = new THREE.MeshStandardMaterial({
            color: 0xbac0c7, // 參考圖 1：貓頭鷹般深沉高貴的銀灰色面盤
            roughness: 0.8
        });
        this.matHarpyChestBand = new THREE.MeshStandardMaterial({
            color: 0x141517, // 參考圖 1：厚實墨黑胸甲胸帶羽 (Black breast band)
            roughness: 0.75
        });
        this.matHarpyBodyWhite = new THREE.MeshStandardMaterial({
            color: 0xf5f6f8, // 參考圖 1：純白腹部與腿羽
            roughness: 0.8
        });
        this.matHarpyWingSlate = new THREE.MeshStandardMaterial({
            color: 0x222429, // 參考圖 1：黑灰厚重鐵羽大翼
            roughness: 0.65,
            metalness: 0.05
        });
        this.matHarpyBeak = new THREE.MeshStandardMaterial({
            color: 0x161719, // 巨型深黑銳利彎鉤猛禽喙
            roughness: 0.25,
            metalness: 0.1
        });
        this.matHarpyLegSkin = new THREE.MeshStandardMaterial({
            color: 0xe2d69e, // 粗壯金黃獵足
            roughness: 0.6
        });
        this.matHarpyLegBar = new THREE.MeshStandardMaterial({
            color: 0x28292c, // 腿羽斑馬狀黑白橫條斑紋
            roughness: 0.8
        });
        this.matHarpyTalon = new THREE.MeshStandardMaterial({
            color: 0x08080a, // 參考圖 1：比灰熊更長、致命彎曲的黑金巨爪！
            roughness: 0.15,
            metalness: 0.2
        });
        this.matHarpyEye = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // 參考圖 1：刺破蒼穹的金色犀利猛禽魔眸
            roughness: 0.1,
            emissive: 0xb45309,
            emissiveIntensity: 0.35
        });
        this.matHarpyLog = new THREE.MeshStandardMaterial({
            color: 0x4a3b32, // 雨林古木棲木
            roughness: 0.95
        });

        // 🐋 虎鯨（海洋霸主・殺人鯨）專屬高級材質
        this.matOrcaSkinBlack = new THREE.MeshStandardMaterial({
            color: 0x0a0d14, // 深邃光滑亮黑鯨皮 (Glossy jet-black skin)
            roughness: 0.12,
            metalness: 0.15
        });
        this.matOrcaWhite = new THREE.MeshStandardMaterial({
            color: 0xfafbfc, // 潔白無瑕的眼斑、白腹與側腹斑
            roughness: 0.18,
            metalness: 0.05
        });
        this.matOrcaBabyWhite = new THREE.MeshStandardMaterial({
            color: 0xf5eedb, // 參考圖中新生虎鯨幼崽特有的暖白/微杏色白斑
            roughness: 0.22,
            metalness: 0.04
        });
        this.matOrcaSaddle = new THREE.MeshStandardMaterial({
            color: 0x64748b, // 參考圖：背鰭後方標誌性灰白「鞍斑」 (Grey saddle patch)
            roughness: 0.35
        });
        this.matOrcaEye = new THREE.MeshStandardMaterial({
            color: 0x0f172a, // 虎鯨明亮靈慧的深藍黑海獸明眸
            roughness: 0.05,
            metalness: 0.3
        });
        this.matOrcaWater = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // 蔚藍透亮水花與海洋漣漪
            roughness: 0.1,
            metalness: 0.1,
            transparent: true,
            opacity: 0.45
        });
        this.matOrcaSpout = new THREE.MeshStandardMaterial({
            color: 0xe0f2fe, // 噴氣孔晶瑩彩虹水氣
            roughness: 0.2,
            transparent: true,
            opacity: 0.65
        });

        // 🐒 長臂猿（金絲長臂猿・林冠臂行大師）專屬高級材質
        this.matGibbonGoldenFur = new THREE.MeshStandardMaterial({
            color: 0xeda249, // 參考圖：溫暖明媚的金黃杏色蓬鬆長毛 (Golden-buff fur)
            roughness: 0.88
        });
        this.matGibbonBabyFur = new THREE.MeshStandardMaterial({
            color: 0xfbbf24, // 參考圖：依偎在懷裡的初生金黃幼崽毛絨 (Bright buttery baby fluff)
            roughness: 0.92
        });
        this.matGibbonCrownPatch = new THREE.MeshStandardMaterial({
            color: 0x1c1917, // 參考圖：成猿頭頂標誌性深黑直立毛冠中線 (Black dorsal crown patch)
            roughness: 0.85
        });
        this.matGibbonHaloWhite = new THREE.MeshStandardMaterial({
            color: 0xfdfbf7, // 參考圖：面龐外圍白霜般的柔軟白毛圈與白手腕 (White face halo & wrist fluff)
            roughness: 0.88
        });
        this.matGibbonFaceSkin = new THREE.MeshStandardMaterial({
            color: 0x121214, // 靈長類特有純黑小巧面具臉 (Jet-black facial disk)
            roughness: 0.55
        });
        this.matGibbonEye = new THREE.MeshStandardMaterial({
            color: 0x09090b, // 深邃靈慧的黑曜石靈長之眸
            roughness: 0.08,
            metalness: 0.2
        });
        this.matGibbonHands = new THREE.MeshStandardMaterial({
            color: 0x18181b, // 臂行特化纖長黑手與彎曲指節
            roughness: 0.65
        });
        this.matGibbonBranch = new THREE.MeshStandardMaterial({
            color: 0x544338, // 蒼勁古雅的雨林老藤樹杈
            roughness: 0.95
        });

        // 🍊 水豚（佛系溫泉水豚君 Capybara）專屬高級材質
        this.matCapybaraFur = new THREE.MeshStandardMaterial({
            color: 0x9c6b43, // 溫暖焦糖栗棕粗毛質感
            roughness: 0.88,
            metalness: 0.02
        });
        this.matCapybaraBabyFur = new THREE.MeshStandardMaterial({
            color: 0xb07d52, // 幼崽柔和奶栗色絨毛
            roughness: 0.9
        });
        this.matCapybaraMuzzle = new THREE.MeshStandardMaterial({
            color: 0x5c3d28, // 招牌呆萌深褐方吻部
            roughness: 0.82
        });
        this.matCapybaraOrange = new THREE.MeshStandardMaterial({
            color: 0xff8c00, // 頭頂圓滾滾蜜柑橘子
            roughness: 0.32,
            metalness: 0.05
        });
        this.matCapybaraLeaf = new THREE.MeshStandardMaterial({
            color: 0x22c55e, // 蜜柑翠綠小葉
            roughness: 0.5
        });
        this.matCapybaraTub = new THREE.MeshStandardMaterial({
            color: 0xc89d66, // 日式檜木溫泉桶
            roughness: 0.72
        });
        this.matCapybaraWater = new THREE.MeshStandardMaterial({
            color: 0x7dd3fc, // 暖呼呼透亮溫泉湯水
            roughness: 0.12,
            transparent: true,
            opacity: 0.58
        });

        // 🎋 小熊貓 / 紅熊貓（喜馬拉雅火狐 Red Panda）專屬高級材質
        this.matRedPandaCoat = new THREE.MeshStandardMaterial({
            color: 0xc84b20, // 鮮亮赤紅栗色蓬鬆毛皮
            roughness: 0.8,
            metalness: 0.03
        });
        this.matRedPandaDark = new THREE.MeshStandardMaterial({
            color: 0x1c1917, // 純黑毛絨四肢與腹底
            roughness: 0.85
        });
        this.matRedPandaWhite = new THREE.MeshStandardMaterial({
            color: 0xfdfbf7, // 雪白眉斑、臉頰與耳廓毛邊
            roughness: 0.88
        });
        this.matRedPandaRing = new THREE.MeshStandardMaterial({
            color: 0x5c2410, // 大尾巴深栗紅環紋
            roughness: 0.84
        });
        this.matBambooStalk = new THREE.MeshStandardMaterial({
            color: 0x4ade80, // 翠綠孟宗竹幹
            roughness: 0.45
        });

        // ❄️ 雪豹（喜馬拉雅雪山之王 Snow Leopard）專屬高級材質
        this.matSnowLeopardCoat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0, // 冰霧銀白厚實毛皮
            roughness: 0.78,
            metalness: 0.05
        });
        this.matSnowLeopardBelly = new THREE.MeshStandardMaterial({
            color: 0xf8fafc, // 純雪白胸腹長毛
            roughness: 0.88
        });
        this.matSnowLeopardRosette = new THREE.MeshStandardMaterial({
            color: 0x334155, // 炭灰黑玫瑰斑環 (Rosettes)
            roughness: 0.75
        });
        this.matSnowLeopardEye = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // 晶澈冰晶藍寶石眼眸
            roughness: 0.1,
            emissive: 0x0284c7,
            emissiveIntensity: 0.38
        });
        this.matSnowRock = new THREE.MeshStandardMaterial({
            color: 0x94a3b8, // 覆雪高山岩台
            roughness: 0.85
        });

        // 🐧 企鵝（南極帝企鵝 Emperor Penguin）專屬高級材質
        this.matPenguinChickFluff = new THREE.MeshStandardMaterial({
            color: 0x9ca3af, // 幼雛銀灰奇異果絨毛
            roughness: 0.94
        });
        this.matPenguinBlack = new THREE.MeshStandardMaterial({
            color: 0x0f172a, // 成年帝企鵝光滑黑曜石燕尾服羽衣
            roughness: 0.28,
            metalness: 0.15
        });
        this.matPenguinWhite = new THREE.MeshStandardMaterial({
            color: 0xffffff, // 純白光滑圓肚皮
            roughness: 0.35
        });
        this.matPenguinGold = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // 帝企鵝頸側標誌性璀璨金橘漸層羽斑
            roughness: 0.4,
            emissive: 0xb45309,
            emissiveIntensity: 0.2
        });
        this.matPenguinBeak = new THREE.MeshStandardMaterial({
            color: 0xf43f5e, // 鳥喙側邊珊瑚粉橘高光條
            roughness: 0.25
        });
        this.matPenguinIce = new THREE.MeshStandardMaterial({
            color: 0xe0f2fe, // 南極晶瑩浮冰台
            roughness: 0.2,
            metalness: 0.1
        });

        // 🦦 海獺（太平洋海獺 Sea Otter）專屬高級材質
        this.matOtterFur = new THREE.MeshStandardMaterial({
            color: 0x6b4423, // 濃密絲絨深暖棕海獺毛
            roughness: 0.88
        });
        this.matOtterBabyFluff = new THREE.MeshStandardMaterial({
            color: 0x8d5b34, // 幼獺蓬鬆不沉水栗子絨毛
            roughness: 0.95
        });
        this.matOtterCream = new THREE.MeshStandardMaterial({
            color: 0xf5e6d3, // 海獺奶油白圓臉頰與胸毛
            roughness: 0.85
        });
        this.matOtterShell = new THREE.MeshStandardMaterial({
            color: 0xf472b6, // 粉紅扇貝貝殼
            roughness: 0.35,
            metalness: 0.15
        });
        this.matOtterPearl = new THREE.MeshStandardMaterial({
            color: 0xfffbeb, // 璀璨發光珍珠
            roughness: 0.08,
            metalness: 0.3,
            emissive: 0xfef08a,
            emissiveIntensity: 0.45
        });
        this.matOtterWater = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // 碧藍海面水波墊
            roughness: 0.15,
            transparent: true,
            opacity: 0.72
        });

        // 🐨 無尾熊（澳洲樹熊 Koala）專屬高級材質
        this.matKoalaFur = new THREE.MeshStandardMaterial({
            color: 0x7c8594, // 澳洲銀灰藍絨毛
            roughness: 0.92
        });
        this.matKoalaWhite = new THREE.MeshStandardMaterial({
            color: 0xf8fafc, // 蓬鬆雪白大耳毛與白肚皮
            roughness: 0.95
        });
        this.matKoalaNose = new THREE.MeshStandardMaterial({
            color: 0x1e293b, // 標誌性大黑橢圓橡膠鼻
            roughness: 0.35,
            metalness: 0.15
        });
        this.matEucalyptusTrunk = new THREE.MeshStandardMaterial({
            color: 0xa8a29e, // 尤加利樹淺灰褐樹幹
            roughness: 0.85
        });
        this.matEucalyptusLeaf = new THREE.MeshStandardMaterial({
            color: 0x10b981, // 尤加利翠綠香葉
            roughness: 0.55
        });

        // 🐰 垂耳兔（荷蘭垂耳兔 Holland Lop Bunny）專屬高級材質
        this.matBunnyWhite = new THREE.MeshStandardMaterial({
            color: 0xffffff, // 雪白糯米糰幼兔絨毛
            roughness: 0.9
        });
        this.matBunnyCaramel = new THREE.MeshStandardMaterial({
            color: 0xd99b66, // 焦糖奶油雙色成兔毛色
            roughness: 0.86
        });
        this.matBunnyPink = new THREE.MeshStandardMaterial({
            color: 0xfda4af, // 粉嫩兔耳內側與小粉鼻
            roughness: 0.65
        });
        this.matCarrotOrange = new THREE.MeshStandardMaterial({
            color: 0xf97316, // 鮮脆紅蘿蔔
            roughness: 0.45
        });

        // 🦁 非洲獅（萬獸之王 African Lion）專屬高級材質
        this.matLionGold = new THREE.MeshStandardMaterial({
            color: 0xeab308, // 榮耀金黃獅毛
            roughness: 0.78
        });
        this.matLionCream = new THREE.MeshStandardMaterial({
            color: 0xfef3c7, // 淺奶油下巴與肚皮
            roughness: 0.82
        });
        this.matLionManeDark = new THREE.MeshStandardMaterial({
            color: 0x7c2d12, // 濃密深紅棕霸氣獅鬃外層
            roughness: 0.92
        });
        this.matLionManeGold = new THREE.MeshStandardMaterial({
            color: 0xd97706, // 璀璨琥珀金獅鬃內層
            roughness: 0.88
        });
        this.matLionEye = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // 王者琥珀金瞳
            roughness: 0.12,
            emissive: 0xb45309,
            emissiveIntensity: 0.35
        });

        // 🐼 四川大熊貓（國寶貓熊 Giant Panda）專屬高級材質
        this.matPandaWhite = new THREE.MeshStandardMaterial({
            color: 0xfafaf9, // 軟糯糯米白厚絨毛
            roughness: 0.9
        });
        this.matPandaBlack = new THREE.MeshStandardMaterial({
            color: 0x171717, // 濃墨黑眼圈、黑圓耳與黑肩帶
            roughness: 0.88
        });

        // 🦊 撒哈拉耳廓狐（大耳沙漠小狐 Fennec Fox）專屬高級材質
        this.matFennecCream = new THREE.MeshStandardMaterial({
            color: 0xfde68a, // 撒哈拉香檳金沙奶油毛色
            roughness: 0.82
        });
        this.matFennecSand = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // 暖金沙丘背部漸層
            roughness: 0.78
        });

        // 🦒 非洲長頸鹿（網紋長頸鹿 Giraffe）專屬高級材質
        this.matGiraffeYellow = new THREE.MeshStandardMaterial({
            color: 0xfde047, // 陽光奶油金底毛
            roughness: 0.8
        });
        this.matGiraffeSpot = new THREE.MeshStandardMaterial({
            color: 0xb45309, // 焦糖栗棕多邊形網紋斑塊
            roughness: 0.82
        });

        // 🐻‍❄️ 北極熊（極地雪熊王 Polar Bear）專屬高級材質
        this.matPolarWhite = new THREE.MeshStandardMaterial({
            color: 0xf8fafc, // 純淨北極冰雪白厚毛
            roughness: 0.85
        });

        // 🐹 黃金倉鼠（Golden Hamster）專屬高級材質
        this.matHamsterGold = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // 蜜糖暖橘金背毛
            roughness: 0.85
        });
        this.matHamsterCream = new THREE.MeshStandardMaterial({
            color: 0xfffbeb, // 軟綿綿奶白肚肚與大腮幫子
            roughness: 0.9
        });
        this.matHamsterWheel = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // 天藍透明感跑跑滾輪
            roughness: 0.25,
            metalness: 0.15
        });

        // 🦔 森林小刺蝟（Hedgehog）專屬高級材質
        this.matHedgehogQuill = new THREE.MeshStandardMaterial({
            color: 0x573b26, // 可可深褐背刺
            roughness: 0.75
        });
        this.matHedgehogCream = new THREE.MeshStandardMaterial({
            color: 0xfef3c7, // 溫暖杏仁奶白軟肚皮與小臉
            roughness: 0.85
        });
        this.matAppleRed = new THREE.MeshStandardMaterial({
            color: 0xef4444, // 紅潤小蘋果
            roughness: 0.25
        });

        // 🐬 瓶鼻海豚（Bottlenose Dolphin）專屬高級材質
        this.matDolphinBlue = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // 晴空蔚藍光滑海豚皮
            roughness: 0.12,
            metalness: 0.2
        });
        this.matDolphinBelly = new THREE.MeshStandardMaterial({
            color: 0xf0f9ff, // 珍珠白肚皮
            roughness: 0.18
        });

        // 🐯 孟加拉虎（Bengal Tiger）專屬高級材質
        this.matTigerOrange = new THREE.MeshStandardMaterial({
            color: 0xea580c, // 烈焰琥珀橘虎毛
            roughness: 0.78
        });
        this.matTigerStripe = new THREE.MeshStandardMaterial({
            color: 0x171717, // 霸氣純黑虎斑與額頭「王」字紋
            roughness: 0.82
        });

        // 🦅 安地斯神鷲（Andean Condor — 天空巨擘・安地斯山脈守護神）專屬高級材質
        this.matCondorBabyDown = new THREE.MeshStandardMaterial({
            color: 0x87674b, // 參考圖 4：幼雛溫暖肉桂摩卡褐絨毛 (Warm cinnamon-taupe down)
            roughness: 0.92
        });
        this.matCondorBabyRuff = new THREE.MeshStandardMaterial({
            color: 0xb28f6d, // 參考圖 4：幼雛頸部蓬鬆淺褐毛領 (Lighter buff downy neck ruff)
            roughness: 0.94
        });
        this.matCondorBabySkin = new THREE.MeshStandardMaterial({
            color: 0x323438, // 參考圖 4：幼雛深炭灰毛絨頭臉與腳爪
            roughness: 0.82
        });
        this.matCondorBabyEye = new THREE.MeshStandardMaterial({
            color: 0x6b3e1b, // 參考圖 4：幼雛水汪汪深琥珀暖棕大眼
            roughness: 0.12,
            emissive: 0x3b1f0b,
            emissiveIntensity: 0.25
        });
        this.matCondorBlack = new THREE.MeshStandardMaterial({
            color: 0x0d0f14, // 參考圖 1/2/3：成年神鷲墨黑油亮大羽衣 (Glossy jet-black plumage)
            roughness: 0.42,
            metalness: 0.12
        });
        this.matCondorWhiteRuff = new THREE.MeshStandardMaterial({
            color: 0xfafcff, // 參考圖 1/2/3：標誌性純白蓬鬆雪絨頸圈披肩 (Snow-white fluffy collar ruff)
            roughness: 0.92
        });
        this.matCondorWingWhite = new THREE.MeshStandardMaterial({
            color: 0xf4f6fa, // 參考圖 1/2/3：雙翼超大片醒目銀白／雪白翼斑與次級飛羽 (Striking white wing panels)
            roughness: 0.55,
            metalness: 0.05
        });
        this.matCondorHeadSkin = new THREE.MeshStandardMaterial({
            color: 0xa8606a, // 參考圖 1/3：成年神鷲裸露紫紅／暗粉紅皺褶頭頸皮膚
            roughness: 0.68
        });
        this.matCondorComb = new THREE.MeshStandardMaterial({
            color: 0x884250, // 參考圖 1/3：雄性安地斯神鷲頭頂霸氣高聳肉冠 (Fleshy caruncle/comb)
            roughness: 0.62
        });
        this.matCondorBeakBase = new THREE.MeshStandardMaterial({
            color: 0x2a292e, // 喙基深色角質
            roughness: 0.35
        });
        this.matCondorBeakTip = new THREE.MeshStandardMaterial({
            color: 0xf5f0e6, // 參考圖 1/3：鮮明象牙白彎鉤喙尖 (Ivory-white hooked bill tip)
            roughness: 0.25,
            metalness: 0.08
        });
        this.matCondorLeg = new THREE.MeshStandardMaterial({
            color: 0x6e737b, // 參考圖 1/3：粗壯岩石灰巨足
            roughness: 0.75
        });
        this.matCondorRock = new THREE.MeshStandardMaterial({
            color: 0x78736a, // 參考圖 1/3/4：安地斯山脈高聳花崗岩山巔巨石
            roughness: 0.92
        });

        // 通用五官材質
        this.matInnerEar = new THREE.MeshStandardMaterial({ color: 0xffe4e6, roughness: 0.6 });
        this.matNose = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.08, metalness: 0.3 });
        this.matPupil = new THREE.MeshBasicMaterial({ color: 0x020202 });
        this.matShine = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.matTongue = new THREE.MeshStandardMaterial({ color: 0xff7675, roughness: 0.2 });
    }

    buildPetMesh() {
        this.root = new THREE.Group();
        this.group.add(this.root);

        if (this.petType === 'bat') {
            this.buildBatMesh();
            return;
        }

        if (this.petType === 'wolf') {
            this.buildWolfMesh();
            return;
        }

        if (this.petType === 'hyena') {
            this.buildHyenaMesh();
            return;
        }

        if (this.petType === 'cheetah') {
            this.buildCheetahMesh();
            return;
        }

        if (this.petType === 'crow') {
            this.buildCrowMesh();
            return;
        }

        if (this.petType === 'maned_wolf') {
            this.buildManedWolfMesh();
            return;
        }

        if (this.petType === 'elephant') {
            this.buildElephantMesh();
            return;
        }

        if (this.petType === 'harpy') {
            this.buildHarpyMesh();
            return;
        }

        if (this.petType === 'orca') {
            this.buildOrcaMesh();
            return;
        }

        if (this.petType === 'gibbon') {
            this.buildGibbonMesh();
            return;
        }

        if (this.petType === 'capybara') {
            this.buildCapybaraMesh();
            return;
        }

        if (this.petType === 'red_panda') {
            this.buildRedPandaMesh();
            return;
        }

        if (this.petType === 'snow_leopard') {
            this.buildSnowLeopardMesh();
            return;
        }

        if (this.petType === 'penguin') {
            this.buildPenguinMesh();
            return;
        }

        if (this.petType === 'sea_otter') {
            this.buildSeaOtterMesh();
            return;
        }

        if (this.petType === 'koala') {
            this.buildKoalaMesh();
            return;
        }

        if (this.petType === 'bunny') {
            this.buildBunnyMesh();
            return;
        }

        if (this.petType === 'lion') {
            this.buildLionMesh();
            return;
        }

        if (this.petType === 'panda') {
            this.buildPandaMesh();
            return;
        }

        if (this.petType === 'fennec') {
            this.buildFennecMesh();
            return;
        }

        if (this.petType === 'giraffe') {
            this.buildGiraffeMesh();
            return;
        }

        if (this.petType === 'polar_bear') {
            this.buildPolarBearMesh();
            return;
        }

        if (this.petType === 'hamster') {
            this.buildHamsterMesh();
            return;
        }

        if (this.petType === 'hedgehog') {
            this.buildHedgehogMesh();
            return;
        }

        if (this.petType === 'dolphin') {
            this.buildDolphinMesh();
            return;
        }

        if (this.petType === 'tiger') {
            this.buildTigerMesh();
            return;
        }

        if (this.petType === 'condor') {
            this.buildCondorMesh();
            return;
        }

        let mainCoat = this.matBlackCoat;
        let eyeMat = this.matBlackCoat;
        if (this.petType === 'cat') {
            mainCoat = this.matCatCoat;
            eyeMat = this.matCatEye;
        } else if (this.petType === 'fox') {
            mainCoat = this.matFoxCoat;
            eyeMat = this.matFoxEye;
        } else {
            eyeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, emissive: 0x78350f, emissiveIntensity: 0.25 });
        }

        // 1. 幼崽身軀
        this.body = new THREE.Group();
        this.body.position.set(0, 0.65, 0);
        this.root.add(this.body);

        if (this.petType === 'fox' && this.colorVariant === 'white') {
            // ⚪ 北極狐：棉花糖般的渾圓蓬鬆雪球身軀
            const puffGeo = new THREE.SphereGeometry(0.48, 18, 18);
            puffGeo.scale(1.05, 0.9, 1.3);
            this.chestMesh = new THREE.Mesh(puffGeo, this.matFoxCoat);
            this.chestMesh.position.set(0, -0.05, 0);
            this.chestMesh.castShadow = true;
            this.chestMesh.userData = { part: 'body' };
            this.body.add(this.chestMesh);
        } else {
            // 苗條精緻身形
            const chestGeo = new THREE.SphereGeometry(0.36, 16, 16);
            chestGeo.scale(0.88, 0.95, 1.25);
            this.chestMesh = new THREE.Mesh(chestGeo, mainCoat);
            this.chestMesh.position.set(0, 0, 0.08);
            this.chestMesh.castShadow = true;
            this.chestMesh.userData = { part: 'body' };
            this.body.add(this.chestMesh);

            const bellyGeo = new THREE.SphereGeometry(0.3, 14, 14);
            bellyGeo.scale(0.78, 0.82, 1.1);
            const bellyMesh = new THREE.Mesh(bellyGeo, (this.petType === 'fox') ? this.matFoxWhite : mainCoat);
            bellyMesh.position.set(0, -0.02, -0.28);
            bellyMesh.castShadow = true;
            bellyMesh.userData = { part: 'body' };
            this.body.add(bellyMesh);
        }

        // 🐱 緬因貓：三層豪華超蓬鬆大圍脖 (Triple-Layer Luxurious Maine Coon Ruff)
        if (this.petType === 'cat') {
            // 最底層 - 主圍脖（最大，往前突出）
            const ruff0Geo = new THREE.SphereGeometry(0.45, 18, 18);
            ruff0Geo.scale(1.15, 1.0, 0.75);
            const ruff0 = new THREE.Mesh(ruff0Geo, this.matCatFluff);
            ruff0.position.set(0, 0.05, 0.28);
            ruff0.rotation.x = -0.35;
            ruff0.castShadow = true;
            ruff0.userData = { part: 'body' };
            this.body.add(ruff0);

            // 中層 - 奶白圍脖
            const ruff1Geo = new THREE.SphereGeometry(0.38, 16, 16);
            ruff1Geo.scale(1.05, 0.9, 0.65);
            const ruff1 = new THREE.Mesh(ruff1Geo, this.matCatFluffInner);
            ruff1.position.set(0, 0.1, 0.35);
            ruff1.rotation.x = -0.3;
            ruff1.castShadow = true;
            this.body.add(ruff1);

            // 上層 - 頸部小圍脖蓬鬆感
            const ruff2Geo = new THREE.SphereGeometry(0.28, 14, 14);
            ruff2Geo.scale(1.2, 0.75, 0.7);
            const ruff2 = new THREE.Mesh(ruff2Geo, this.matCatFluff);
            ruff2.position.set(0, 0.18, 0.38);
            ruff2.rotation.x = -0.25;
            this.body.add(ruff2);

        } else if (this.petType === 'fox') {
            // 🦊 狐狸：胸前雪白大圍脖
            const ruffGeo = new THREE.SphereGeometry(0.36, 16, 16);
            ruffGeo.scale(0.95, 1.2, 0.85);
            const ruff = new THREE.Mesh(ruffGeo, this.matFoxWhite);
            ruff.position.set(0, -0.05, 0.32);
            ruff.rotation.x = -0.2;
            ruff.castShadow = true;
            ruff.userData = { part: 'body' };
            this.body.add(ruff);
        }

        // 2. 頸部與頭部
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.22, 0.45);
        this.body.add(this.neck);

        this.head = new THREE.Group();
        this.neck.add(this.head);

        if (this.petType === 'cat') {
            // 🐱 緬因貓大頭：寬圓頭型 + 蓬鬆臉頰是 Maine Coon 的最大特徵
            const headGeo = new THREE.SphereGeometry(0.48, 20, 20);
            headGeo.scale(1.08, 1.02, 1.05);
            this.headMesh = new THREE.Mesh(headGeo, mainCoat);
            this.headMesh.position.set(0, 0.3, 0.1);
            this.headMesh.castShadow = true;
            this.headMesh.userData = { part: 'head' };
            this.head.add(this.headMesh);

            // 標誌性大蓬鬆臉頰 (Fluffy Cheeks - Maine Coon 最萌特徵)
            const cheekGeo = new THREE.SphereGeometry(0.3, 16, 16);
            cheekGeo.scale(0.85, 0.72, 0.78);
            const cheekL = new THREE.Mesh(cheekGeo, this.matCatFluff);
            cheekL.position.set(-0.3, 0.2, 0.3);
            cheekL.rotation.z = -0.25;
            const cheekR = new THREE.Mesh(cheekGeo, this.matCatFluff);
            cheekR.position.set(0.3, 0.2, 0.3);
            cheekR.rotation.z = 0.25;
            this.head.add(cheekL, cheekR);

            // 額頭蓬鬆頂毛（Maine Coon 標誌）
            const topFluffGeo = new THREE.SphereGeometry(0.22, 12, 12);
            topFluffGeo.scale(0.9, 0.65, 0.7);
            const topFluff = new THREE.Mesh(topFluffGeo, mainCoat);
            topFluff.position.set(0, 0.55, 0.05);
            this.head.add(topFluff);

        } else {
            const headGeo = new THREE.SphereGeometry(0.44, 18, 18);
            headGeo.scale(1.02, 0.98, 1.05);
            this.headMesh = new THREE.Mesh(headGeo, mainCoat);
            this.headMesh.position.set(0, 0.28, 0.12);
            this.headMesh.castShadow = true;
            this.headMesh.userData = { part: 'head' };
            this.head.add(this.headMesh);

            // 🦊 狐狸大蓬鬆臉頰
            if (this.petType === 'fox') {
                const cheekGeo = new THREE.SphereGeometry(0.24, 14, 14);
                cheekGeo.scale(0.9, 0.65, 0.85);
                const cheekL = new THREE.Mesh(cheekGeo, this.matFoxWhite);
                cheekL.position.set(-0.25, 0.18, 0.28);
                cheekL.rotation.z = -0.2;
                const cheekR = new THREE.Mesh(cheekGeo, this.matFoxWhite);
                cheekR.position.set(0.25, 0.18, 0.28);
                cheekR.rotation.z = 0.2;
                this.head.add(cheekL, cheekR);
            }
        }

        // 💎 參考圖 2, 3, 4 招牌：「銀色小肉爪吊墜項鍊 (Silver Paw Necklace)」
        if (this.petType === 'fox' || this.petType === 'cat') {
            const necklaceGroup = new THREE.Group();
            
            // 銀色細鍊
            const chainGeo = new THREE.TorusGeometry(0.38, 0.015, 8, 24);
            chainGeo.rotateX(Math.PI / 2.2);
            const chainMesh = new THREE.Mesh(chainGeo, this.matSilverNecklace);
            necklaceGroup.add(chainMesh);

            // 銀色小肉爪吊墜 (Pendant)
            const pendantGroup = new THREE.Group();
            pendantGroup.position.set(0, -0.16, 0.38);

            // 肉爪主肉墊
            const mainPad = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16), this.matSilverNecklace);
            mainPad.rotateX(Math.PI / 2);
            pendantGroup.add(mainPad);

            // 4 顆小腳趾肉墊
            const toeOffsets = [
                [-0.038, 0.042],
                [-0.013, 0.055],
                [0.013, 0.055],
                [0.038, 0.042]
            ];
            toeOffsets.forEach(([tx, ty]) => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.012, 10), this.matSilverNecklace);
                toe.rotateX(Math.PI / 2);
                toe.position.set(tx, ty, 0);
                pendantGroup.add(toe);
            });

            necklaceGroup.add(pendantGroup);
            necklaceGroup.position.set(0, 0.02, 0.18);
            this.neck.add(necklaceGroup);
        }

        // 3. 立耳系統 (Dog / Cat / Fox 各具特色)
        this.earLeftPivot = new THREE.Group();
        this.earLeftPivot.position.set(-0.28, 0.62, 0.1);
        this.head.add(this.earLeftPivot);

        this.earRightPivot = new THREE.Group();
        this.earRightPivot.position.set(0.28, 0.62, 0.1);
        this.head.add(this.earRightPivot);

        if (this.petType === 'cat') {
            // 🐱 緬因貓耳朵：寬底大立耳 + 誇張精靈耳尖簇毛 + 奶白內毛 (Maine Coon 最標誌外形)
            const earGeo = new THREE.ConeGeometry(0.22, 0.58, 5);
            earGeo.scale(1.1, 1.0, 0.4);

            const earL = new THREE.Mesh(earGeo, mainCoat);
            earL.position.set(0, 0.25, 0);
            earL.rotation.z = -0.1;
            earL.userData = { part: 'ear-left' };
            this.earLeftPivot.add(earL);

            // 奶白內耳毛
            const inL = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.44, 5), this.matCatFluffInner);
            inL.position.set(0.02, 0.23, 0.06);
            inL.rotation.z = -0.08;
            this.earLeftPivot.add(inL);

            // 耳尖超長精靈簇毛 (Lynx Tip - Maine Coon 最招牌特徵)
            const tuftGeo = new THREE.ConeGeometry(0.04, 0.32, 4);
            const tuftL = new THREE.Mesh(tuftGeo, this.matCatEarTuft);
            tuftL.position.set(-0.02, 0.55, 0.02);
            tuftL.rotation.z = -0.2;
            this.earLeftPivot.add(tuftL);
            // 雙股簇毛
            const tuftL2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.25, 4), this.matCatEarTuft);
            tuftL2.position.set(0.03, 0.52, 0.02);
            tuftL2.rotation.z = 0.1;
            this.earLeftPivot.add(tuftL2);

            const earR = new THREE.Mesh(earGeo, mainCoat);
            earR.position.set(0, 0.25, 0);
            earR.rotation.z = 0.1;
            earR.scale.x = -1;
            earR.userData = { part: 'ear-right' };
            this.earRightPivot.add(earR);

            const inR = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.44, 5), this.matCatFluffInner);
            inR.position.set(-0.02, 0.23, 0.06);
            inR.rotation.z = 0.08;
            this.earRightPivot.add(inR);

            const tuftR = new THREE.Mesh(tuftGeo, this.matCatEarTuft);
            tuftR.position.set(0.02, 0.55, 0.02);
            tuftR.rotation.z = 0.2;
            this.earRightPivot.add(tuftR);
            const tuftR2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.25, 4), this.matCatEarTuft);
            tuftR2.position.set(-0.03, 0.52, 0.02);
            tuftR2.rotation.z = -0.1;
            this.earRightPivot.add(tuftR2);

        } else if (this.petType === 'fox') {
            // 🦊 狐狸耳朵：大而高聳的尖立耳 (耳背深色、內襯雪白軟毛，參考圖 2 & 4)
            const earGeo = new THREE.ConeGeometry(0.22, 0.62, 4);
            earGeo.scale(1.0, 1.0, 0.36);
            earGeo.rotateZ(0.12);

            const earL = new THREE.Mesh(earGeo, mainCoat);
            earL.position.set(0, 0.26, 0);
            earL.userData = { part: 'ear-left' };
            this.earLeftPivot.add(earL);

            const earBackL = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.58, 4), this.matFoxEarBack);
            earBackL.position.set(0, 0.26, -0.02);
            this.earLeftPivot.add(earBackL);

            const inL = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.46, 4), this.matFoxWhite);
            inL.position.set(0.01, 0.24, 0.06);
            this.earLeftPivot.add(inL);

            const earR = new THREE.Mesh(earGeo, mainCoat);
            earR.position.set(0, 0.26, 0);
            earR.scale.x = -1;
            earR.userData = { part: 'ear-right' };
            this.earRightPivot.add(earR);

            const earBackR = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.58, 4), this.matFoxEarBack);
            earBackR.position.set(0, 0.26, -0.02);
            this.earRightPivot.add(earBackR);

            const inR = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.46, 4), this.matFoxWhite);
            inR.position.set(-0.01, 0.24, 0.06);
            this.earRightPivot.add(inR);

        } else {
            // 🐕‍🦺 黑狗立耳
            const earGeo = new THREE.ConeGeometry(0.2, 0.55, 4);
            earGeo.scale(1.0, 1.0, 0.4);
            earGeo.rotateZ(0.12);
            earGeo.rotateX(-0.1);

            const earL = new THREE.Mesh(earGeo, this.matBlackCoat);
            earL.position.set(0, 0.24, 0);
            earL.userData = { part: 'ear-left' };
            this.earLeftPivot.add(earL);

            const inL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), this.matInnerEar);
            inL.position.set(0.01, 0.22, 0.06);
            this.earLeftPivot.add(inL);

            const earR = new THREE.Mesh(earGeo, this.matBlackCoat);
            earR.position.set(0, 0.24, 0);
            earR.scale.x = -1;
            earR.userData = { part: 'ear-right' };
            this.earRightPivot.add(earR);

            const inR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), this.matInnerEar);
            inR.position.set(-0.01, 0.22, 0.06);
            this.earRightPivot.add(inR);
        }

        // 4. 立體流線吻部、鼻子與微笑下顎 (Organic 3D Streamlined Snout & Nose)
        this.snout = new THREE.Group();
        // 緬因貓的鼻口位置稍低（配合大而圓的頭型）
        this.snout.position.set(0, 0.15, (this.petType === 'cat') ? 0.46 : 0.42);
        this.head.add(this.snout);

        if (this.petType === 'fox') {
            // 🦊 狐狸立體尖吻部 (告別平截面！流線漸尖至鼻頭，搭配雪白下顎與微笑嘴角)
            const snoutMat = (this.colorVariant === 'white') ? this.matFoxCoat : this.matFoxWhite;

            // 上吻部 (鼻樑流線錐體)
            const upperSnoutGeo = new THREE.ConeGeometry(0.18, 0.38, 16);
            upperSnoutGeo.rotateX(Math.PI / 2);
            upperSnoutGeo.scale(0.9, 0.72, 1.0);
            const upperSnout = new THREE.Mesh(upperSnoutGeo, snoutMat);
            upperSnout.position.set(0, 0.02, 0.16);
            upperSnout.castShadow = true;
            upperSnout.userData = { part: 'chin' };
            this.snout.add(upperSnout);

            // 狐狸鼻樑上方毛色飾條 (赤狐/銀狐鼻樑帶原色，側面與下巴純白)
            if (this.colorVariant !== 'white') {
                const bridgeGeo = new THREE.ConeGeometry(0.1, 0.32, 12);
                bridgeGeo.rotateX(Math.PI / 2);
                bridgeGeo.scale(0.8, 0.4, 1.0);
                const bridgeMesh = new THREE.Mesh(bridgeGeo, mainCoat);
                bridgeMesh.position.set(0, 0.065, 0.14);
                this.snout.add(bridgeMesh);
            }

            // 下顎 (微微內縮，形成立體下巴與微笑弧度)
            const chinGeo = new THREE.SphereGeometry(0.13, 12, 12);
            chinGeo.scale(0.85, 0.55, 1.25);
            const chinMesh = new THREE.Mesh(chinGeo, snoutMat);
            chinMesh.position.set(0, -0.04, 0.12);
            chinMesh.userData = { part: 'chin' };
            this.snout.add(chinMesh);

            // 狐狸小巧立體黑鼻頭 (自然坐落在尖吻前端)
            const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), this.matNose);
            noseMesh.scale.set(1.2, 0.9, 1.1);
            noseMesh.position.set(0, 0.03, 0.35);
            this.snout.add(noseMesh);

        } else if (this.petType === 'cat') {
            // 🐱 緬因貓方形口吻 (Maine Coon 特徵：寬方下顎 + 大而立體的胡鬚墊 + 粉鼻頭)
            // 方形主吻部底座
            const muzzleBaseGeo = new THREE.BoxGeometry(0.28, 0.18, 0.18);
            const muzzleBase = new THREE.Mesh(muzzleBaseGeo, this.matCatMuzzle);
            muzzleBase.position.set(0, -0.02, 0.07);
            muzzleBase.userData = { part: 'chin' };
            this.snout.add(muzzleBase);

            // 左右大圓胡鬚墊（立體圓滾滾）
            const padGeo = new THREE.SphereGeometry(0.12, 14, 14);
            padGeo.scale(0.95, 0.78, 0.88);
            const padL = new THREE.Mesh(padGeo, this.matCatMuzzle);
            padL.position.set(-0.1, 0.0, 0.1);
            const padR = new THREE.Mesh(padGeo, this.matCatMuzzle);
            padR.position.set(0.1, 0.0, 0.1);
            padL.userData = { part: 'chin' };
            padR.userData = { part: 'chin' };
            this.snout.add(padL, padR);

            // 小下巴（下方奶白色）
            const chinMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), this.matCatFluff);
            chinMesh.scale.set(0.95, 0.6, 0.85);
            chinMesh.position.set(0, -0.08, 0.08);
            chinMesh.userData = { part: 'chin' };
            this.snout.add(chinMesh);

            // 粉嫩三角形倒三角鼻頭（Maine Coon 大鼻頭）
            const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), this.matCatNose);
            noseMesh.scale.set(1.3, 0.8, 1.0);
            noseMesh.position.set(0, 0.06, 0.17);
            this.snout.add(noseMesh);

            // 鼻樑突起（增加立體感）
            const bridgeGeo = new THREE.SphereGeometry(0.06, 10, 10);
            bridgeGeo.scale(0.7, 0.5, 1.2);
            const bridge = new THREE.Mesh(bridgeGeo, mainCoat);
            bridge.position.set(0, 0.1, 0.05);
            this.snout.add(bridge);

        } else {
            // 🐕‍🦺 黑狗立體幼犬吻部 (立體圓錐流線，告別平頭圓柱)
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

            // 黑豆濕潤鼻頭
            const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), this.matNose);
            noseMesh.scale.set(1.25, 0.9, 1.1);
            noseMesh.position.set(0, 0.035, 0.31);
            this.snout.add(noseMesh);
        }

        // 舌頭 (Tongue)
        const tongueGeo = new THREE.BoxGeometry(0.08, 0.02, 0.16);
        tongueGeo.translate(0, 0, 0.08);
        this.tongue = new THREE.Mesh(tongueGeo, this.matTongue);
        this.tongue.position.set(0, -0.06, 0.1);
        this.tongue.rotation.x = 0.25;
        this.tongue.visible = false;
        this.snout.add(this.tongue);

        // 5. 靈動大眼睛 (Eyes with Catchlights)
        this.eyesGroup = new THREE.Group();
        this.head.add(this.eyesGroup);

        // 緬因貓：稍大的杏仁眼，帶輕微傾斜（斜眼貓咪特徵）
        const eyeRadius = (this.petType === 'cat') ? 0.14 : 0.12;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 14, 14);
        if (this.petType === 'cat') eyeGeo.scale(1.1, 0.85, 1.0); // 杏仁眼形狀
        const pupilGeo = new THREE.SphereGeometry(0.075, 10, 10);
        if (this.petType === 'cat') pupilGeo.scale(0.65, 1.2, 1.0); // 貓咪大萌瞳孔（縱向橢圓）

        const shine1Geo = new THREE.SphereGeometry(0.045, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.022, 8, 8);

        // 緬因貓眼睛位置：稍寬分開，略帶外側傾斜（Maine Coon 迷人大眼）
        const eyeOffX = (this.petType === 'cat') ? 0.23 : 0.2;
        const eyeOffY = (this.petType === 'cat') ? 0.35 : 0.32;
        const eyeOffZ = (this.petType === 'cat') ? 0.46 : 0.45;

        // 左眼
        this.eyeLeft = new THREE.Group();
        this.eyeLeft.position.set(-eyeOffX, eyeOffY, eyeOffZ);
        if (this.petType === 'cat') this.eyeLeft.rotation.z = 0.22; // 杏仁傾斜
        const irisL = new THREE.Mesh(eyeGeo, eyeMat);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.07);
        const shine1L = new THREE.Mesh(shine1Geo, this.matShine);
        shine1L.position.set(-0.04, 0.05, 0.11);
        const shine2L = new THREE.Mesh(shine2Geo, this.matShine);
        shine2L.position.set(0.03, -0.03, 0.11);
        this.eyeLeft.add(irisL, pupilL, shine1L, shine2L);
        this.eyesGroup.add(this.eyeLeft);

        // 右眼
        this.eyeRight = new THREE.Group();
        this.eyeRight.position.set(eyeOffX, eyeOffY, eyeOffZ);
        if (this.petType === 'cat') this.eyeRight.rotation.z = -0.22; // 杏仁傾斜
        const irisR = new THREE.Mesh(eyeGeo, eyeMat);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.07);
        const shine1R = new THREE.Mesh(shine1Geo, this.matShine);
        shine1R.position.set(-0.04, 0.05, 0.11);
        const shine2R = new THREE.Mesh(shine2Geo, this.matShine);
        shine2R.position.set(0.03, -0.03, 0.11);
        this.eyeRight.add(irisR, pupilR, shine1R, shine2R);
        this.eyesGroup.add(this.eyeRight);

        // 6. 四肢
        this.legs = {};
        const legRadius = 0.09;
        const legHeight = (this.petType === 'cat') ? 0.38 : 0.42;
        const legGeo = new THREE.CylinderGeometry(legRadius * 0.9, legRadius, legHeight, 10);
        const pawGeo = new THREE.SphereGeometry(0.12, 10, 10);
        pawGeo.scale(1.0, 0.55, 1.25);

        const legMat = (this.petType === 'fox') ? this.matFoxPaw : mainCoat;

        const createLeg = (name, x, y, z) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, z);
            const limb = new THREE.Mesh(legGeo, legMat);
            limb.position.set(0, -legHeight / 2, 0);
            limb.castShadow = true;
            pivot.add(limb);

            const paw = new THREE.Mesh(pawGeo, legMat);
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

        // 7. 尾巴 (Fox 巨大白尖蓬尾 / Cat 蓬鬆羽尾 / Dog 尖翹尾)
        this.tailBase = new THREE.Group();
        this.tailBase.position.set(0, 0.16, -0.5);
        this.tailBase.rotation.x = (this.petType === 'cat') ? 1.1 : 0.7;
        this.body.add(this.tailBase);

        if (this.petType === 'cat') {
            // 🐱 緬因貓超蓬鬆羽毛尾巴 (Maine Coon 粗大蓬鬆尾是招牌！)
            const tailSeg0Geo = new THREE.CylinderGeometry(0.1, 0.14, 0.28, 10);
            tailSeg0Geo.translate(0, 0.14, 0);
            this.tail0 = new THREE.Mesh(tailSeg0Geo, mainCoat);
            this.tailBase.add(this.tail0);

            // 尾巴中段（加粗，模擬蓬鬆感）
            const tailSeg1Geo = new THREE.CylinderGeometry(0.12, 0.13, 0.3, 10);
            tailSeg1Geo.translate(0, 0.15, 0);
            this.tail1 = new THREE.Mesh(tailSeg1Geo, mainCoat);
            this.tail1.position.set(0, 0.26, 0);
            this.tail1.rotation.x = -0.45;
            this.tail0.add(this.tail1);

            // 尾巴上段（再往上彎）
            const tailSeg2Geo = new THREE.CylinderGeometry(0.09, 0.12, 0.28, 10);
            tailSeg2Geo.translate(0, 0.14, 0);
            this.tail2 = new THREE.Mesh(tailSeg2Geo, mainCoat);
            this.tail2.position.set(0, 0.28, 0);
            this.tail2.rotation.x = -0.5;
            this.tail1.add(this.tail2);

            // 尾尖蓬鬆球（奶白色）
            const tailTipGeo = new THREE.SphereGeometry(0.14, 12, 12);
            const tailTip = new THREE.Mesh(tailTipGeo, this.matCatFluff);
            tailTip.scale.set(1.0, 1.3, 1.0);
            tailTip.position.set(0, 0.26, 0);
            this.tail2.add(tailTip);

        } else if (this.petType === 'fox') {
            // 🦊 狐狸超大蓬尾 (參考圖 2 & 4：厚實大尾巴 + 標誌性純白尾尖)
            const foxTail0Geo = new THREE.SphereGeometry(0.22, 14, 14);
            foxTail0Geo.scale(1.0, 1.8, 1.0);
            this.tail0 = new THREE.Mesh(foxTail0Geo, mainCoat);
            this.tail0.position.set(0, 0.28, 0);
            this.tailBase.add(this.tail0);

            // 純白尾尖 (White Tip)
            const foxTailTipGeo = new THREE.ConeGeometry(0.2, 0.42, 12);
            foxTailTipGeo.translate(0, 0.22, 0);
            this.tail1 = new THREE.Mesh(foxTailTipGeo, (this.colorVariant === 'white') ? this.matFoxCoat : this.matFoxWhite);
            this.tail1.position.set(0, 0.28, 0);
            this.tail0.add(this.tail1);
            this.tail2 = this.tail1;

        } else {
            // 🐕‍🦺 黑狗小尾巴
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

        // ────────────────────────────────────────────────────────────
        // 成體特有毛飾群組 (Adult-only fur features — hidden by default)
        // ────────────────────────────────────────────────────────────
        this.adultFurGroup = new THREE.Group();
        this.adultFurGroup.visible = false;
        this.body.add(this.adultFurGroup);

        if (this.petType === 'fox') {
            // 🦊 成體狐狸：類黑狼帥氣蓬鬆領毛圈 (Fluffy Neck Ruff like Black Wolf)
            // 底層厚實頸毛盤
            const foxMane0Geo = new THREE.SphereGeometry(0.42, 18, 18);
            foxMane0Geo.scale(1.10, 0.90, 0.85);
            const foxMane0 = new THREE.Mesh(foxMane0Geo, this.matFoxCoat);
            foxMane0.position.set(0, 0.04, 0.30);
            foxMane0.rotation.x = -0.28;
            foxMane0.castShadow = true;
            this.adultFurGroup.add(foxMane0);

            // 中層白胸頸毛
            const foxMane1Geo = new THREE.SphereGeometry(0.36, 16, 16);
            foxMane1Geo.scale(1.08, 0.82, 0.72);
            const foxMane1 = new THREE.Mesh(foxMane1Geo, this.matFoxWhite);
            foxMane1.position.set(0, 0.10, 0.36);
            foxMane1.rotation.x = -0.22;
            this.adultFurGroup.add(foxMane1);

            // 上層頸圈蓬鬆感
            const foxMane2Geo = new THREE.SphereGeometry(0.26, 14, 14);
            foxMane2Geo.scale(1.18, 0.68, 0.65);
            const foxMane2 = new THREE.Mesh(foxMane2Geo, this.matFoxCoat);
            foxMane2.position.set(0, 0.18, 0.38);
            foxMane2.rotation.x = -0.18;
            this.adultFurGroup.add(foxMane2);

            // 左右側頸毛蓬起
            const foxManeGeoSide = new THREE.SphereGeometry(0.22, 12, 12);
            foxManeGeoSide.scale(0.65, 0.95, 0.88);
            const foxManeSideL = new THREE.Mesh(foxManeGeoSide, this.matFoxCoat);
            foxManeSideL.position.set(-0.24, 0.08, 0.24);
            foxManeSideL.rotation.z = -0.30;
            const foxManeSideR = new THREE.Mesh(foxManeGeoSide, this.matFoxCoat);
            foxManeSideR.position.set(0.24, 0.08, 0.24);
            foxManeSideR.rotation.z = 0.30;
            this.adultFurGroup.add(foxManeSideL, foxManeSideR);

        } else if (this.petType === 'cat') {
            // 🐱 緬因貓成體：一撮一撮毛叢感頸毛 + 腳踝腳掌毛叢
            // 頸部毛叢 (不是甜甜圈，而是一撮一撮互相重疊的毛束)
            const tuftPositions = [
                [0,    0.18, 0.32,  0,      0],
                [-0.20, 0.12, 0.26, -0.30, -0.10],
                [ 0.20, 0.12, 0.26,  0.30,  0.10],
                [-0.32, 0.06, 0.16, -0.55, -0.05],
                [ 0.32, 0.06, 0.16,  0.55,  0.05],
                [-0.18, 0.20, 0.14, -0.25,  0.06],
                [ 0.18, 0.20, 0.14,  0.25, -0.06],
                [0,     0.24, 0.22,  0,      0.08],
            ];
            tuftPositions.forEach(([tx, ty, tz, rz, rx]) => {
                const tGeo = new THREE.SphereGeometry(0.14, 10, 10);
                tGeo.scale(0.70, 1.35, 0.60); // 撮狀豎立
                const tuft = new THREE.Mesh(tGeo, this.matCatFluff);
                tuft.position.set(tx, ty, tz);
                tuft.rotation.z = rz;
                tuft.rotation.x = rx - 0.30;
                tuft.castShadow = true;
                this.adultFurGroup.add(tuft);
            });

            // 腳踝腳掌毛叢 (Ankle & Paw Fur Tufts)
            const pawTuftPositions = [
                [-0.24, -0.16, 0.28],  // 前左
                [ 0.24, -0.16, 0.28],  // 前右
                [-0.25, -0.16, -0.32], // 後左
                [ 0.25, -0.16, -0.32], // 後右
            ];
            const ankleHeight = (this.petType === 'cat') ? 0.38 : 0.42;
            pawTuftPositions.forEach(([px, py, pz]) => {
                // 腳踝蓬鬆毛環 (ankle cuff tuft)
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const pawTGeo = new THREE.SphereGeometry(0.07, 8, 8);
                    pawTGeo.scale(0.55, 1.20, 0.50);
                    const pawTuft = new THREE.Mesh(pawTGeo, this.matCatFluff);
                    const tuftR = 0.095;
                    pawTuft.position.set(
                        px + Math.cos(angle) * tuftR,
                        py - ankleHeight + 0.04,
                        pz + Math.sin(angle) * tuftR * 0.65
                    );
                    pawTuft.rotation.x = -0.18;
                    pawTuft.rotation.z = angle * 0.25;
                    this.adultFurGroup.add(pawTuft);
                }
            });

        } else if (this.petType === 'dog') {
            // 🐕 成體黑狗：更沈穩成熟的胸膛與頜骨輪廓 (Adult maturity overlay)
            // 加厚前胸肌肉感
            const dogAdultChestGeo = new THREE.SphereGeometry(0.40, 16, 16);
            dogAdultChestGeo.scale(0.90, 0.95, 1.10);
            const dogAdultChest = new THREE.Mesh(dogAdultChestGeo, this.matBlackCoat);
            dogAdultChest.position.set(0, 0.04, 0.16);
            dogAdultChest.castShadow = true;
            this.adultFurGroup.add(dogAdultChest);

            // 肩胛肌肉感隆起 (Shoulder blades)
            [-0.28, 0.28].forEach(sx => {
                const shoulderGeo = new THREE.SphereGeometry(0.22, 12, 12);
                shoulderGeo.scale(0.75, 0.80, 1.0);
                const shoulder = new THREE.Mesh(shoulderGeo, this.matBlackCoat);
                shoulder.position.set(sx, 0.06, 0.12);
                shoulder.castShadow = true;
                this.adultFurGroup.add(shoulder);
            });

            // 成體頜骨感（更方正有力）
            const jowlGeo = new THREE.SphereGeometry(0.28, 12, 12);
            jowlGeo.scale(1.12, 0.78, 0.95);
            const jowlMesh = new THREE.Mesh(jowlGeo, this.matBlackCoat);
            // 掛到 neck group 而非 body — 位置相對 body 計算
            jowlMesh.position.set(0, 0.22 + 0.04, 0.45 + 0.08);
            jowlMesh.castShadow = true;
            this.adultFurGroup.add(jowlMesh);
        }
    }

    setGrowthScale(scale) {
        this.growthScale = scale;
        if (this.petType === 'bat') {
            const isAdult = (scale >= 0.95) || (this.batStage === 'adult');
            this.updateBatStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'wolf') {
            const isAdult = (scale >= 0.95) || (this.wolfStage === 'adult');
            this.updateWolfStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'hyena') {
            const isAdult = (scale >= 0.95) || (this.hyenaStage === 'adult');
            this.updateHyenaStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'cheetah') {
            const isAdult = (scale >= 0.95) || (this.cheetahStage === 'adult');
            this.updateCheetahStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'crow') {
            const isAdult = (scale >= 0.95) || (this.crowStage === 'adult');
            this.updateCrowStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'maned_wolf') {
            const isAdult = (scale >= 0.95) || (this.manedWolfStage === 'adult');
            this.updateManedWolfStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'elephant') {
            const isAdult = (scale >= 0.95) || (this.elephantStage === 'adult');
            this.updateElephantStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'harpy') {
            const isAdult = (scale >= 0.95) || (this.harpyStage === 'adult');
            this.updateHarpyStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'orca') {
            const isAdult = (scale >= 0.95) || (this.orcaStage === 'adult');
            this.updateOrcaStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'gibbon') {
            const isAdult = (scale >= 0.95) || (this.gibbonStage === 'adult');
            this.updateGibbonStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'capybara') {
            const isAdult = (scale >= 0.95) || (this.capybaraStage === 'adult');
            this.updateCapybaraStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'red_panda') {
            const isAdult = (scale >= 0.95) || (this.redPandaStage === 'adult');
            this.updateRedPandaStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'snow_leopard') {
            const isAdult = (scale >= 0.95) || (this.snowLeopardStage === 'adult');
            this.updateSnowLeopardStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'penguin') {
            const isAdult = (scale >= 0.95) || (this.penguinStage === 'adult');
            this.updatePenguinStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'sea_otter') {
            const isAdult = (scale >= 0.95) || (this.seaOtterStage === 'adult');
            this.updateSeaOtterStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'koala') {
            const isAdult = (scale >= 0.95) || (this.koalaStage === 'adult');
            this.updateKoalaStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'bunny') {
            const isAdult = (scale >= 0.95) || (this.bunnyStage === 'adult');
            this.updateBunnyStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'lion') {
            const isAdult = (scale >= 0.95) || (this.lionStage === 'adult');
            this.updateLionStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'panda') {
            const isAdult = (scale >= 0.95) || (this.pandaStage === 'adult');
            this.updatePandaStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'fennec') {
            const isAdult = (scale >= 0.95) || (this.fennecStage === 'adult');
            this.updateFennecStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'giraffe') {
            const isAdult = (scale >= 0.95) || (this.giraffeStage === 'adult');
            this.updateGiraffeStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'polar_bear') {
            const isAdult = (scale >= 0.95) || (this.polarBearStage === 'adult');
            this.updatePolarBearStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'hamster') {
            const isAdult = (scale >= 0.95) || (this.hamsterStage === 'adult');
            this.updateHamsterStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'hedgehog') {
            const isAdult = (scale >= 0.95) || (this.hedgehogStage === 'adult');
            this.updateHedgehogStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'dolphin') {
            const isAdult = (scale >= 0.95) || (this.dolphinStage === 'adult');
            this.updateDolphinStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'tiger') {
            const isAdult = (scale >= 0.95) || (this.tigerStage === 'adult');
            this.updateTigerStage(isAdult ? 'adult' : 'baby');
        } else if (this.petType === 'condor') {
            // 安地斯神鷲：在按切換鍵前始終保持幼雛形態（不受等級縮放強制變為成體）
            const isAdult = (this.condorStage === 'adult');
            this.updateCondorStage(isAdult ? 'adult' : 'baby');
        }

        // 顯示或隱藏 fox / cat / dog 的成體毛飾群組
        if (this.adultFurGroup) {
            this.adultFurGroup.visible = (scale >= 0.95);
        }

        this.group.scale.set(scale, scale, scale);
    }

    setCondorStage(stage) {
        this.condorStage = stage;
        this.updateCondorStage(stage);
    }

    setHamsterStage(stage) {
        this.hamsterStage = stage;
        this.updateHamsterStage(stage);
    }

    setHedgehogStage(stage) {
        this.hedgehogStage = stage;
        this.updateHedgehogStage(stage);
    }

    setDolphinStage(stage) {
        this.dolphinStage = stage;
        this.updateDolphinStage(stage);
    }

    setTigerStage(stage) {
        this.tigerStage = stage;
        this.updateTigerStage(stage);
    }

    setPandaStage(stage) {
        this.pandaStage = stage;
        this.updatePandaStage(stage);
    }

    setFennecStage(stage) {
        this.fennecStage = stage;
        this.updateFennecStage(stage);
    }

    setGiraffeStage(stage) {
        this.giraffeStage = stage;
        this.updateGiraffeStage(stage);
    }

    setPolarBearStage(stage) {
        this.polarBearStage = stage;
        this.updatePolarBearStage(stage);
    }

    setSeaOtterStage(stage) {
        this.seaOtterStage = stage;
        this.updateSeaOtterStage(stage);
    }

    setKoalaStage(stage) {
        this.koalaStage = stage;
        this.updateKoalaStage(stage);
    }

    setBunnyStage(stage) {
        this.bunnyStage = stage;
        this.updateBunnyStage(stage);
    }

    setLionStage(stage) {
        this.lionStage = stage;
        this.updateLionStage(stage);
    }

    setCapybaraStage(stage) {
        this.capybaraStage = stage;
        this.updateCapybaraStage(stage);
    }

    setRedPandaStage(stage) {
        this.redPandaStage = stage;
        this.updateRedPandaStage(stage);
    }

    setSnowLeopardStage(stage) {
        this.snowLeopardStage = stage;
        this.updateSnowLeopardStage(stage);
    }

    setPenguinStage(stage) {
        this.penguinStage = stage;
        this.updatePenguinStage(stage);
    }

    setGibbonStage(stage) {
        this.gibbonStage = stage;
        this.updateGibbonStage(stage);
    }

    setOrcaStage(stage) {
        this.orcaStage = stage;
        this.updateOrcaStage(stage);
    }

    setHarpyStage(stage) {
        this.harpyStage = stage;
        this.updateHarpyStage(stage);
    }

    setElephantStage(stage) {
        this.elephantStage = stage;
        this.updateElephantStage(stage);
    }

    setManedWolfStage(stage) {
        this.manedWolfStage = stage;
        this.updateManedWolfStage(stage);
    }

    setCrowStage(stage) {
        this.crowStage = stage;
        this.updateCrowStage(stage);
    }

    setBatStage(stage) {
        this.batStage = stage;
        this.updateBatStage(stage);
    }

    setWolfStage(stage) {
        this.wolfStage = stage;
        this.updateWolfStage(stage);
    }

    setHyenaStage(stage) {
        this.hyenaStage = stage;
        this.updateHyenaStage(stage);
    }

    setCheetahStage(stage) {
        this.cheetahStage = stage;
        this.updateCheetahStage(stage);
    }

    buildAccessories() {
        if (!this.neck || !this.head) return;

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

        // 3. 萌萌紅領巾
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

        // 4. 墨鏡
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

        // 5. 魔法帽
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

        // 6. 派對帽
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

        // 7. 英雄披風
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

        // 8. 璀璨黃金皇冠 (Royal Golden Crown)
        const crownGroup = new THREE.Group();
        const matRoyalGold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.15, emissive: 0x92400e, emissiveIntensity: 0.2 });
        const matRuby = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.1, metalness: 0.3, emissive: 0xbe123c, emissiveIntensity: 0.4 });
        const matSapphire = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.3, emissive: 0x0284c7, emissiveIntensity: 0.4 });
        const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.12, 16, 1, false), matRoyalGold);
        crownGroup.add(crownBand);
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 8), matRoyalGold);
            spike.position.set(Math.cos(ang) * 0.21, 0.12, Math.sin(ang) * 0.21);
            const tipGem = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), i % 2 === 0 ? matRuby : matSapphire);
            tipGem.position.set(Math.cos(ang) * 0.21, 0.21, Math.sin(ang) * 0.21);
            crownGroup.add(spike, tipGem);
        }
        crownGroup.position.set(0, 0.72, 0.08);
        crownGroup.visible = false;
        this.head.add(crownGroup);
        this.accessories.crown_gold = crownGroup;

        // 9. 純白小天使羽翼 (Seraphim Angel Wings)
        const wingsGroup = new THREE.Group();
        const matFeather = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, emissive: 0xe0f2fe, emissiveIntensity: 0.18 });
        this.angelWingL = new THREE.Group();
        this.angelWingR = new THREE.Group();
        this.angelWingL.position.set(-0.18, 0.22, -0.05);
        this.angelWingR.position.set(0.18, 0.22, -0.05);
        [this.angelWingL, this.angelWingR].forEach((wg, idx) => {
            const dir = idx === 0 ? -1 : 1;
            for (let f = 0; f < 4; f++) {
                const feather = new THREE.Mesh(new THREE.SphereGeometry(0.14 - f * 0.018, 12, 10), matFeather);
                feather.scale.set(1.8, 0.45, 0.35);
                feather.position.set(dir * (0.22 + f * 0.07), 0.12 - f * 0.07, -f * 0.02);
                feather.rotation.z = dir * (0.25 - f * 0.15);
                wg.add(feather);
            }
        });
        wingsGroup.add(this.angelWingL, this.angelWingR);
        wingsGroup.visible = false;
        this.body.add(wingsGroup);
        this.accessories.angel_wings = wingsGroup;
    }

    twitchEars(side = 'both') {
        if (side === 'left' || side === 'both') {
            this.earVelocityL = 22;
        }
        if (side === 'right' || side === 'both') {
            this.earVelocityR = -22;
        }
    }

    resetAutonomy() {
        if (this.autonomy) {
            this.autonomy.targetLieDownFactor = 0.0;
            this.autonomy.lieDownFactor = 0.0;
            this.autonomy.state = 'idle_rest';
            this.autonomy.timer = 5.0;
        }
        if (this.orcaDive) {
            this.orcaDive.phase = 'surface';
            this.orcaDive.phaseTime = 0.0;
            this.orcaDive.depth = 0.0;
            this.orcaDive.pitch = 0.0;
            this.orcaDive.timer = 8.0;
            if (this.orcaBabySpout) this.orcaBabySpout.scale.set(0.001, 0.001, 0.001);
            if (this.orcaAdultSpout) this.orcaAdultSpout.scale.set(0.001, 0.001, 0.001);
        }
        if (this.birdFlight) {
            this.birdFlight.phase = 'perch';
            this.birdFlight.phaseTime = 0.0;
            this.birdFlight.timer = 10.0;
            if (this.harpyAdultGroup) {
                this.harpyAdultGroup.position.set(0, 0.62, 0);
                this.harpyAdultGroup.rotation.set(0, 0, 0);
            }
            if (this.harpyBabyGroup) {
                this.harpyBabyGroup.position.set(0, 0.42, 0);
                this.harpyBabyGroup.rotation.set(0, 0, 0);
            }
            if (this.harpyFlightRig) {
                this.harpyFlightRig.visible = false;
                this.harpyFlightRig.position.set(0, 0, 0);
                this.harpyFlightRig.rotation.set(0, 0, 0);
            }
            if (this.harpyPerchGroup) {
                this.harpyPerchGroup.visible = true;
            }
            if (this.crowAdultGroup) {
                this.crowAdultGroup.position.set(0, 0.65, 0);
                this.crowAdultGroup.rotation.set(0, 0, 0);
            }
            if (this.crowBabyGroup) {
                this.crowBabyGroup.position.set(0, 0.42, 0);
                this.crowBabyGroup.rotation.set(0, 0, 0);
            }
            if (this.crowFlightRig) {
                this.crowFlightRig.visible = false;
                this.crowFlightRig.position.set(0, 0, 0);
                this.crowFlightRig.rotation.set(0, 0, 0);
            }
            if (this.condorAdultGroup) {
                this.condorAdultGroup.position.set(0, 0.64, 0);
                this.condorAdultGroup.rotation.set(0, 0, 0);
            }
            if (this.condorBabyGroup) {
                this.condorBabyGroup.position.set(0, 0.44, 0);
                this.condorBabyGroup.rotation.set(0, 0, 0);
            }
            if (this.condorFlightRig) {
                this.condorFlightRig.visible = false;
                this.condorFlightRig.position.set(0, 0.64, 0);
                this.condorFlightRig.rotation.set(0, 0, 0);
            }
            if (this.condorPerchGroup) {
                this.condorPerchGroup.visible = true;
                this.condorPerchGroup.position.set(0, 0, 0);
                this.condorPerchGroup.rotation.set(0, 0, 0);
            }
        }
        if (this.batFlight) {
            this.batFlight.phase = 'roosting';
            this.batFlight.phaseTime = 0.0;
            this.batFlight.timer = 12.0;
            if (this.batHangBodyPivot) {
                this.batHangBodyPivot.position.set(0, -0.04, 0);
                this.batHangBodyPivot.rotation.set(0, 0, 0);
            }
            if (this.batFlightRig) {
                this.batFlightRig.position.set(0, 0, 0);
                this.batFlightRig.rotation.set(0, 0, 0);
            }
        }
    }

    // 🐾 犬類與獵豹自由走動與趴下休息控制器
    updateCanineAutonomy(delta, elapsedTime) {
        if (!this.autonomy || !this.autonomy.enabled) return;
        const auto = this.autonomy;

        // 僅在待機 (idle) 狀態下執行自主走動與趴下
        if (this.currentState !== 'idle') {
            auto.targetLieDownFactor = 0.0;
            auto.lieDownFactor = 0.0;
            return;
        }

        const CANINE_REST_SPOTS = [
            { name: 'center', x: 0.0, z: 0.0, rotY: 0.0, restTime: 12.0 },
            { name: 'bed', x: 1.5, z: -1.0, rotY: -2.3, restTime: 20.0 }, // 趴在狗窩軟墊上
            { name: 'bowl', x: -1.2, z: 0.6, rotY: -0.8, restTime: 14.0 }, // 趴在食盆旁
            { name: 'ball', x: 1.1, z: 0.9, rotY: 2.1, restTime: 15.0 }, // 趴在玩具球旁
            { name: 'rug_left', x: -0.9, z: -0.4, rotY: 0.5, restTime: 18.0 }, // 趴在左側地毯
            { name: 'rug_right', x: 0.8, z: 0.3, rotY: -1.2, restTime: 16.0 } // 趴在右側地毯
        ];

        // 趴下姿態平滑插值 (0 = 站立, 1 = 趴下)
        auto.lieDownFactor += (auto.targetLieDownFactor - auto.lieDownFactor) * Math.min(1.0, delta * 3.5);

        auto.timer -= delta;

        if (auto.state === 'idle_rest') {
            // 已經在某個地點趴著或休息
            if (auto.timer <= 0) {
                // 休息時間結束，站起來準備前往下一個地點
                auto.targetLieDownFactor = 0.0;
                // 當完全站起後，選擇下一個地點並出發
                if (auto.lieDownFactor < 0.08) {
                    auto.currentSpotIndex = (auto.currentSpotIndex + 1 + Math.floor(Math.random() * (CANINE_REST_SPOTS.length - 1))) % CANINE_REST_SPOTS.length;
                    auto.targetSpot = CANINE_REST_SPOTS[auto.currentSpotIndex];
                    auto.state = 'walking';
                }
            }
        } else if (auto.state === 'walking') {
            if (!auto.targetSpot) {
                auto.state = 'idle_rest';
                auto.timer = 5.0;
                return;
            }

            const dx = auto.targetSpot.x - this.group.position.x;
            const dz = auto.targetSpot.z - this.group.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist < 0.1) {
                // 抵達目標地點！
                this.group.position.x = auto.targetSpot.x;
                this.group.position.z = auto.targetSpot.z;
                this.group.rotation.y = auto.targetSpot.rotY;
                auto.state = 'idle_rest';
                auto.targetLieDownFactor = 1.0; // 趴下休息！
                auto.timer = auto.targetSpot.restTime + Math.random() * 6.0;
            } else {
                // 朝著目標方向轉向並走動
                const targetAngle = Math.atan2(dx, dz);
                let diff = targetAngle - this.group.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.group.rotation.y += diff * Math.min(1.0, delta * 6.0);

                const step = Math.min(dist, auto.speed * delta);
                this.group.position.x += Math.sin(this.group.rotation.y) * step;
                this.group.position.z += Math.cos(this.group.rotation.y) * step;
                auto.walkCycle += delta * 7.5;
            }
        }
    }

    setState(state) {
        this.currentState = state;
        this.state = state;
        if (state !== 'idle') {
            this.resetAutonomy();
        }
        if (this.tongue) {
            this.tongue.visible = (state === 'happy' || state === 'eat');
        }

        if (state === 'happy') {
            this.twitchEars('both');
        } else if (state === 'sit') {
            this.twitchEars('left');
        } else if (state === 'paw') {
            this.twitchEars('right');
        }
    }

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

    update(delta, elapsedTime) {
        if (this.petType === 'bat') {
            this.updateBat(delta, elapsedTime);
            return;
        } else if (this.petType === 'wolf') {
            this.updateWolf(delta, elapsedTime);
            return;
        } else if (this.petType === 'hyena') {
            this.updateHyena(delta, elapsedTime);
            return;
        } else if (this.petType === 'cheetah') {
            this.updateCheetah(delta, elapsedTime);
            return;
        } else if (this.petType === 'crow') {
            this.updateCrow(delta, elapsedTime);
            return;
        } else if (this.petType === 'maned_wolf') {
            this.updateManedWolf(delta, elapsedTime);
            return;
        } else if (this.petType === 'elephant') {
            this.updateElephant(delta, elapsedTime);
            return;
        } else if (this.petType === 'harpy') {
            this.updateHarpy(delta, elapsedTime);
            return;
        } else if (this.petType === 'orca') {
            this.updateOrca(delta, elapsedTime);
            return;
        } else if (this.petType === 'gibbon') {
            this.updateGibbon(delta, elapsedTime);
            return;
        } else if (this.petType === 'capybara') {
            this.updateCapybara(delta, elapsedTime);
            return;
        } else if (this.petType === 'red_panda') {
            this.updateRedPanda(delta, elapsedTime);
            return;
        } else if (this.petType === 'snow_leopard') {
            this.updateSnowLeopard(delta, elapsedTime);
            return;
        } else if (this.petType === 'penguin') {
            this.updatePenguin(delta, elapsedTime);
            return;
        } else if (this.petType === 'sea_otter') {
            this.updateSeaOtter(delta, elapsedTime);
            return;
        } else if (this.petType === 'koala') {
            this.updateKoala(delta, elapsedTime);
            return;
        } else if (this.petType === 'bunny') {
            this.updateBunny(delta, elapsedTime);
            return;
        } else if (this.petType === 'lion') {
            this.updateLion(delta, elapsedTime);
            return;
        } else if (this.petType === 'panda') {
            this.updatePanda(delta, elapsedTime);
            return;
        } else if (this.petType === 'fennec') {
            this.updateFennec(delta, elapsedTime);
            return;
        } else if (this.petType === 'giraffe') {
            this.updateGiraffe(delta, elapsedTime);
            return;
        } else if (this.petType === 'polar_bear') {
            this.updatePolarBear(delta, elapsedTime);
            return;
        } else if (this.petType === 'hamster') {
            this.updateHamster(delta, elapsedTime);
            return;
        } else if (this.petType === 'hedgehog') {
            this.updateHedgehog(delta, elapsedTime);
            return;
        } else if (this.petType === 'dolphin') {
            this.updateDolphin(delta, elapsedTime);
            return;
        } else if (this.petType === 'tiger') {
            this.updateTiger(delta, elapsedTime);
            return;
        } else if (this.petType === 'condor') {
            this.updateCondor(delta, elapsedTime);
            return;
        }

        // 天使羽翼輕盈拍動動畫
        if (this.angelWingL && this.angelWingR && this.accessories.angel_wings && this.accessories.angel_wings.visible) {
            const wingFlap = Math.sin(elapsedTime * 5.2) * 0.25;
            this.angelWingL.rotation.y = 0.35 + wingFlap;
            this.angelWingR.rotation.y = -0.35 - wingFlap;
        }

        const spring = 85;
        const damping = 7;

        this.earVelocityL += (-this.earTwitchL * spring - this.earVelocityL * damping) * delta;
        this.earTwitchL += this.earVelocityL * delta;
        this.earLeftPivot.rotation.z = THREE.MathUtils.degToRad(this.earTwitchL);

        this.earVelocityR += (-this.earTwitchR * spring - this.earVelocityR * damping) * delta;
        this.earTwitchR += this.earVelocityR * delta;
        this.earRightPivot.rotation.z = THREE.MathUtils.degToRad(this.earTwitchR);

        // 眨眼
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

        // 尾巴流暢擺動
        let wagSpeed = (this.petType === 'cat') ? 4 : 8;
        let wagAmp = (this.petType === 'fox') ? 0.4 : 0.45;

        if (this.currentState === 'happy' || this.currentState === 'pet') {
            wagSpeed = (this.petType === 'cat') ? 10 : 22;
            wagAmp = 0.75;
        } else if (this.currentState === 'sleep') {
            wagSpeed = 0;
            wagAmp = 0;
        }

        const tailWave = Math.sin(elapsedTime * wagSpeed) * wagAmp;
        this.tailBase.rotation.y = tailWave;
        if (this.tail1) this.tail1.rotation.y = tailWave * 0.8;

        if (this.capeMesh && this.accessories.hero_cape && this.accessories.hero_cape.visible) {
            this.capeMesh.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 8) * 0.15;
        }

        const t = elapsedTime;

        switch (this.currentState) {
            case 'idle':
                this.updateCanineAutonomy(delta, elapsedTime);
                if (this.autonomy && this.autonomy.state === 'walking') {
                    // 漫步走動肢體循環
                    const wc = this.autonomy.walkCycle;
                    this.body.position.y = 0.65 + Math.abs(Math.sin(wc * 2)) * 0.04;
                    this.legs.frontLeft.rotation.x = Math.sin(wc) * 0.45;
                    this.legs.frontRight.rotation.x = -Math.sin(wc) * 0.45;
                    this.legs.backLeft.rotation.x = -Math.sin(wc) * 0.45;
                    this.legs.backRight.rotation.x = Math.sin(wc) * 0.45;
                    this.head.rotation.x = Math.sin(wc * 2) * 0.04;
                    this.head.rotation.y = 0;
                    this.head.rotation.z = 0;
                    this.tailBase.rotation.y = Math.sin(wc) * 0.35;
                } else {
                    // 趴下 (lieDownFactor > 0) 或站立待機
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    const breathe = Math.sin(t * (1.8 - lf * 0.5)) * (0.02 - lf * 0.008);
                    this.body.position.y = THREE.MathUtils.lerp(0.65, 0.28, lf) + breathe;
                    this.legs.frontLeft.rotation.x = -0.45 * lf;
                    this.legs.frontRight.rotation.x = -0.45 * lf;
                    this.legs.backLeft.rotation.x = 0.85 * lf;
                    this.legs.backRight.rotation.x = 0.85 * lf;
                    this.head.rotation.x = 0.12 * lf + Math.sin(t * 1.5) * 0.03;
                    this.head.rotation.y = Math.sin(t * 0.9) * (0.08 - lf * 0.04);
                    this.head.rotation.z = Math.sin(t * 1.2) * (0.04 - lf * 0.02);
                }
                this.root.rotation.set(0, 0, 0);
                break;

            case 'happy':
                const hop = Math.abs(Math.sin(t * 9));
                this.body.position.y = 0.65 + hop * 0.28;
                this.head.rotation.x = -0.2 + hop * 0.18;
                this.legs.frontLeft.rotation.x = hop * 0.35;
                this.legs.frontRight.rotation.x = hop * 0.35;
                this.legs.backLeft.rotation.x = -hop * 0.25;
                this.legs.backRight.rotation.x = -hop * 0.25;
                break;

            case 'pet':
                this.body.position.y = 0.62;
                this.head.rotation.x = -0.25 + Math.sin(t * 3.5) * 0.04;
                this.head.rotation.z = 0.12;
                this.eyeLeft.scale.y = 0.18;
                this.eyeRight.scale.y = 0.18;
                break;

            case 'sit':
                this.body.position.y = 0.5;
                this.body.rotation.x = -0.28;
                this.head.rotation.x = 0.25;
                this.legs.backLeft.rotation.x = 1.1;
                this.legs.backRight.rotation.x = 1.1;
                this.legs.frontLeft.rotation.x = 0.25;
                this.legs.frontRight.rotation.x = 0.25;
                break;

            case 'paw':
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
                this.body.position.y = 0.3;
                this.root.rotation.z = Math.sin(t * 4.5) * 0.35 + Math.PI;
                this.legs.frontLeft.rotation.x = 0.7;
                this.legs.frontRight.rotation.x = 0.7;
                this.legs.backLeft.rotation.x = 0.7;
                this.legs.backRight.rotation.x = 0.7;
                break;

            case 'eat':
                this.body.position.y = 0.58;
                this.body.rotation.x = 0.22;
                this.neck.rotation.x = 0.32 + Math.sin(t * 14) * 0.07;
                this.resetLegs();
                break;

            case 'sleep':
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

    // ─────────────────────────────────────────────────────────
    //  🦇 狐蝠（果蝠）3D 模型引擎：毛巾捲幼崽 ＋ 長大倒掛成蝠
    // ─────────────────────────────────────────────────────────
    buildBatMesh() {
        this.batStage = 'baby'; // 預設呈現幼崽毛巾捲型態（按切換鍵後變為長大倒掛成蝠）
        this.batRoot = new THREE.Group();
        this.root.add(this.batRoot);

        // 為配件系統建立容錯節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.tailBase = new THREE.Group();
        this.legs = { frontLeft: new THREE.Group(), frontRight: new THREE.Group(), backLeft: new THREE.Group(), backRight: new THREE.Group() };
        this.tongue = new THREE.Group();
        this.snout = new THREE.Group();
        this.batRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 構建幼崽期蝠蝠毛巾捲 (Bat Burrito - 參考圖 1, 2)
        this.buildBatBabyMesh();

        // 2. 構建成年期倒掛大狐蝠 (Upside Down Flying Fox - 參考圖 3)
        this.buildBatAdultMesh();

        // 預設呈現幼崽期（按切換鍵前為幼崽型態）
        this.updateBatStage('baby');
    }

    // 1. 幼崽期：被柔軟藍色毛巾像捲餅般裹著的果蝠寶寶
    buildBatBabyMesh() {
        this.batBabyGroup = new THREE.Group();
        this.batBabyGroup.name = 'BatBabyGroup';
        this.batBabyGroup.position.set(0, 0.45, 0);
        this.batRoot.add(this.batBabyGroup);

        // 襁褓微後傾傾角
        const burritoPivot = new THREE.Group();
        burritoPivot.rotation.x = 0.26;
        this.batBabyGroup.add(burritoPivot);
        this.batBurritoPivot = burritoPivot;

        // 1.1 毛巾捲本體 (Burrito Body)
        const burritoGeo = new THREE.CylinderGeometry(0.36, 0.22, 0.72, 20);
        const burritoMesh = new THREE.Mesh(burritoGeo, this.matBatTowel);
        burritoMesh.castShadow = true;
        burritoPivot.add(burritoMesh);

        // 底部圓頭封口
        const botCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), this.matBatTowel);
        botCap.position.set(0, -0.36, 0);
        botCap.scale.set(1.0, 0.7, 1.0);
        burritoPivot.add(botCap);

        // 毛巾捲厚實毛絨滾邊 (Towel Fluffy Collar)
        const rimGeo = new THREE.TorusGeometry(0.36, 0.07, 12, 24);
        rimGeo.rotateX(Math.PI / 2);
        const rimMesh = new THREE.Mesh(rimGeo, this.matBatTowelTrim);
        rimMesh.position.set(0, 0.36, 0);
        burritoPivot.add(rimMesh);

        // 毛巾斜向對角折痕 (Swaddle Fold)
        const foldCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.35, 0.28, 0.12),
            new THREE.Vector3(0, 0.05, 0.36),
            new THREE.Vector3(0.3, -0.22, 0.18)
        ]);
        const foldGeo = new THREE.TubeGeometry(foldCurve, 16, 0.038, 8, false);
        const foldMesh = new THREE.Mesh(foldGeo, this.matBatTowelTrim);
        burritoPivot.add(foldMesh);

        // 兩隻搭在毛巾邊緣的小黑爪爪 (Tiny Claws clutched on towel edge)
        const pawMat = new THREE.MeshStandardMaterial({ color: 0x181615, roughness: 0.5 });
        const createBabyPaw = (x, rotZ) => {
            const paw = new THREE.Group();
            paw.position.set(x, 0.34, 0.32);
            paw.rotation.z = rotZ;
            paw.rotation.x = -0.35;
            for (let i = -1.5; i <= 1.5; i++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.07, 6), pawMat);
                claw.position.set(i * 0.024, 0.02, 0.01);
                claw.rotation.x = 0.75;
                paw.add(claw);
            }
            return paw;
        };
        burritoPivot.add(createBabyPaw(-0.16, 0.2));
        burritoPivot.add(createBabyPaw(0.16, -0.2));

        // 1.2 呆萌毛茸小腦袋 (Cute Baby Bat Head)
        const headPivot = new THREE.Group();
        headPivot.position.set(0, 0.44, 0.02);
        burritoPivot.add(headPivot);
        this.batBabyHead = headPivot;

        // 頭球
        const headGeo = new THREE.SphereGeometry(0.36, 18, 18);
        headGeo.scale(1.02, 0.96, 1.0);
        const headMesh = new THREE.Mesh(headGeo, this.matBatFur);
        headMesh.castShadow = true;
        headPivot.add(headMesh);

        // 鼓鼓圓臉頰 (Puffed Cheeks eating banana! 參考圖 1, 2)
        const cheekGeo = new THREE.SphereGeometry(0.16, 14, 14);
        cheekGeo.scale(1.05, 0.85, 0.95);
        const cheekL = new THREE.Mesh(cheekGeo, this.matBatFace);
        cheekL.position.set(-0.19, -0.06, 0.24);
        const cheekR = new THREE.Mesh(cheekGeo, this.matBatFace);
        cheekR.position.set(0.19, -0.06, 0.24);
        headPivot.add(cheekL, cheekR);

        // 軟萌小狗吻部 (Dog-like Snout)
        const snoutGeo = new THREE.ConeGeometry(0.16, 0.28, 16);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(1.0, 0.8, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matBatFace);
        snoutMesh.position.set(0, -0.04, 0.28);
        headPivot.add(snoutMesh);

        // 濕潤黑鼻頭 (Wet Black Nose)
        const noseGeo = new THREE.SphereGeometry(0.05, 10, 10);
        noseGeo.scale(1.2, 0.85, 1.0);
        const noseMesh = new THREE.Mesh(noseGeo, this.matNose);
        noseMesh.position.set(0, -0.01, 0.41);
        headPivot.add(noseMesh);

        // 下顎
        const jawMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), this.matBatFace);
        jawMesh.scale.set(0.9, 0.6, 1.1);
        jawMesh.position.set(0, -0.12, 0.22);
        headPivot.add(jawMesh);

        // 1.3 水汪汪深邃大黑圓眼 (Huge Innocent Obsidian Eyes)
        const eyeRadius = 0.125;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 16, 16);
        const pupilGeo = new THREE.SphereGeometry(0.085, 12, 12);
        const shine1Geo = new THREE.SphereGeometry(0.042, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.024, 8, 8);

        this.batBabyEyeL = new THREE.Group();
        this.batBabyEyeL.position.set(-0.18, 0.08, 0.32);
        const irisL = new THREE.Mesh(eyeGeo, this.matBatEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.06);
        const shine1L = new THREE.Mesh(shine1Geo, this.matShine);
        shine1L.position.set(-0.035, 0.04, 0.125);
        const shine2L = new THREE.Mesh(shine2Geo, this.matShine);
        shine2L.position.set(0.03, -0.03, 0.125);
        this.batBabyEyeL.add(irisL, pupilL, shine1L, shine2L);
        headPivot.add(this.batBabyEyeL);

        this.batBabyEyeR = new THREE.Group();
        this.batBabyEyeR.position.set(0.18, 0.08, 0.32);
        const irisR = new THREE.Mesh(eyeGeo, this.matBatEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.06);
        const shine1R = new THREE.Mesh(shine1Geo, this.matShine);
        shine1R.position.set(-0.035, 0.04, 0.125);
        const shine2R = new THREE.Mesh(shine2Geo, this.matShine);
        shine2R.position.set(0.03, -0.03, 0.125);
        this.batBabyEyeR.add(irisR, pupilR, shine1R, shine2R);
        headPivot.add(this.batBabyEyeR);

        // 1.4 靈巧扇形尖立耳 (Curved Bat Ears)
        this.batBabyEarLPivot = new THREE.Group();
        this.batBabyEarLPivot.position.set(-0.25, 0.28, 0.02);
        this.batBabyEarLPivot.rotation.z = 0.35;
        this.batBabyEarLPivot.rotation.x = -0.15;
        const earGeo = new THREE.ConeGeometry(0.14, 0.38, 4);
        earGeo.scale(1.0, 1.0, 0.3);
        const earL = new THREE.Mesh(earGeo, this.matBatFace);
        earL.position.set(0, 0.16, 0);
        this.batBabyEarLPivot.add(earL);
        headPivot.add(this.batBabyEarLPivot);

        this.batBabyEarRPivot = new THREE.Group();
        this.batBabyEarRPivot.position.set(0.25, 0.28, 0.02);
        this.batBabyEarRPivot.rotation.z = -0.35;
        this.batBabyEarRPivot.rotation.x = -0.15;
        const earR = new THREE.Mesh(earGeo, this.matBatFace);
        earR.position.set(0, 0.16, 0);
        earR.scale.x = -1;
        this.batBabyEarRPivot.add(earR);
        headPivot.add(this.batBabyEarRPivot);

        // 1.5 專屬美味熟香蕉 🍌 (Reference Photos 1 & 2 - Munching Banana)
        const bananaGroup = new THREE.Group();
        bananaGroup.position.set(0, -0.15, 0.42);
        bananaGroup.rotation.x = 0.45;
        
        // 白嫩香蕉果肉
        const fruitGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.22, 10);
        const fruitMesh = new THREE.Mesh(fruitGeo, this.matBananaFruit);
        fruitMesh.position.set(0, 0.06, 0);
        bananaGroup.add(fruitMesh);

        // 剝開的黃香蕉皮
        const peelBot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.18, 10), this.matBananaPeel);
        peelBot.position.set(0, -0.08, 0);
        bananaGroup.add(peelBot);

        // 3 瓣外翻的香蕉皮片
        for (let i = 0; i < 3; i++) {
            const flap = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4), this.matBananaPeel);
            flap.rotation.z = Math.PI;
            flap.rotation.y = (i * Math.PI * 2) / 3;
            flap.rotation.x = 0.6;
            flap.position.set(0, 0.02, 0);
            bananaGroup.add(flap);
        }
        headPivot.add(bananaGroup);
        this.batBanana = bananaGroup;
        this.batBanana.visible = false;
    }

    // 2. 成年期：抓著原木橫樑帥氣棲息的金冠大狐蝠 ＋ 起飛時平滑轉為水平流線展翼姿勢（起飛前、飛行中、降落後同款頭臉、金黃頸圈與半透明翼膜 100% 統一！）
    buildBatAdultMesh() {
        this.batAdultGroup = new THREE.Group();
        this.batAdultGroup.name = 'BatAdultGroup';
        // 倒掛在半空中高度
        this.batAdultGroup.position.set(0, 1.85, 0);
        this.batRoot.add(this.batAdultGroup);

        // 2.1 獨立原木橫樑棲木群組（掛載於 batRoot，起飛與飛行時永遠留在原地 (0, 1.85, 0)，絕不消失或跟著飛走！）
        this.batPerchGroup = new THREE.Group();
        this.batPerchGroup.name = 'BatPerchGroup';
        this.batPerchGroup.position.set(0, 1.85, 0);
        this.batRoot.add(this.batPerchGroup);

        const perchGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.4, 16);
        perchGeo.rotateZ(Math.PI / 2);
        const perchMesh = new THREE.Mesh(perchGeo, this.matWoodPerch);
        perchMesh.castShadow = true;
        this.batPerchGroup.add(perchMesh);

        // 吊掛金屬鏈環
        const cordMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.3 });
        const cordL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8), cordMat);
        cordL.position.set(-1.0, 0.6, 0);
        const cordR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8), cordMat);
        cordR.position.set(1.0, 0.6, 0);
        this.batPerchGroup.add(cordL, cordR);

        // 2.2 倒掛身軀懸掛群組 (與飛行模型 1:1 同款比例、同款金黃頸圈、同款狐狸頭臉與同款半透明翼膜！)
        const hangBodyPivot = new THREE.Group();
        hangBodyPivot.position.set(0, -0.04, 0);
        this.batAdultGroup.add(hangBodyPivot);
        this.batHangBodyPivot = hangBodyPivot;

        // 抓握橫樑的五趾黑鉤爪（隸屬於懸掛身軀，起飛時隨雙腿向後伸直鬆開橫樑！）
        const clawMat = new THREE.MeshStandardMaterial({ color: 0x11100f, roughness: 0.38 });
        const createAdultFoot = (x) => {
            const foot = new THREE.Group();
            foot.position.set(x, 0.04, 0);
            for (let i = -2; i <= 2; i++) {
                const talonCurve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(i * 0.018, 0.05, -0.04),
                    new THREE.Vector3(i * 0.018, 0.06, 0.03),
                    new THREE.Vector3(i * 0.018, 0.01, 0.05),
                    new THREE.Vector3(i * 0.018, -0.03, 0.02)
                ]);
                const talonMesh = new THREE.Mesh(new THREE.TubeGeometry(talonCurve, 8, 0.008, 6, false), clawMat);
                foot.add(talonMesh);
            }
            return foot;
        };
        hangBodyPivot.add(createAdultFoot(-0.11));
        hangBodyPivot.add(createAdultFoot(0.11));

        // 倒掛雙後腿
        const legCurveL = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.11, 0, 0),
            new THREE.Vector3(-0.09, -0.16, 0.01),
            new THREE.Vector3(-0.07, -0.32, 0.02)
        ]);
        const legMeshL = new THREE.Mesh(new THREE.TubeGeometry(legCurveL, 8, 0.028, 8, false), this.matBatFur);
        const legCurveR = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.11, 0, 0),
            new THREE.Vector3(0.09, -0.16, 0.01),
            new THREE.Vector3(0.07, -0.32, 0.02)
        ]);
        const legMeshR = new THREE.Mesh(new THREE.TubeGeometry(legCurveR, 8, 0.028, 8, false), this.matBatFur);
        hangBodyPivot.add(legMeshL, legMeshR);

        // 軀幹 (Torso — 與飛行骨架完全同尺寸 0.26 * [0.88, 1.58, 0.76])
        const torsoGeo = new THREE.SphereGeometry(0.26, 22, 18);
        torsoGeo.scale(0.88, 1.55, 0.80);
        const torsoMesh = new THREE.Mesh(torsoGeo, this.matBatFur);
        torsoMesh.position.set(0, -0.52, 0.02);
        torsoMesh.castShadow = true;
        hangBodyPivot.add(torsoMesh);

        // 標誌性金黃暖橙色飽滿頸圈與胸領毛 (Golden-Yellow Neck Ruff & Chest Mantle — 與飛行模型完全一致！)
        const hangMantleMain = new THREE.Mesh(new THREE.SphereGeometry(0.245, 22, 18), this.matBatGoldenMantle);
        hangMantleMain.scale.set(1.06, 0.82, 0.96);
        hangMantleMain.position.set(0, -0.75, 0.04);
        hangMantleMain.castShadow = true;
        hangBodyPivot.add(hangMantleMain);

        const hangMantleChest = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 16), this.matBatGoldenMantle);
        hangMantleChest.scale.set(1.02, 0.72, 0.88);
        hangMantleChest.position.set(0, -0.78, 0.10);
        hangBodyPivot.add(hangMantleChest);

        // 2.3 棲息收攏的半透明深棕翼膜、腕關節拇指小鉤爪與翼指骨架 (與飛行翼膜同材質同結構！)
        this.batAdultWingLPivot = new THREE.Group();
        this.batAdultWingLPivot.position.set(-0.20, -0.58, 0.05);
        hangBodyPivot.add(this.batAdultWingLPivot);

        this.batAdultWingRPivot = new THREE.Group();
        this.batAdultWingRPivot.position.set(0.20, -0.58, 0.05);
        hangBodyPivot.add(this.batAdultWingRPivot);

        const createWingShape = (isLeft) => {
            const wingGroup = new THREE.Group();
            const sign = isLeft ? -1 : 1;

            const wristPos = new THREE.Vector3(sign * 0.22, -0.18, 0.14);
            const armCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(sign * 0.16, -0.06, 0.08),
                wristPos
            ]);
            const armMesh = new THREE.Mesh(new THREE.TubeGeometry(armCurve, 12, 0.022, 8, false), this.matBatWingBone);
            wingGroup.add(armMesh);

            // 腕部拇指小鉤爪（與飛行姿態完全一致）
            const thumbCurve = new THREE.CatmullRomCurve3([
                wristPos,
                new THREE.Vector3(wristPos.x + sign * 0.03, wristPos.y - 0.04, wristPos.z + 0.05),
                new THREE.Vector3(wristPos.x + sign * 0.05, wristPos.y - 0.07, wristPos.z + 0.03)
            ]);
            wingGroup.add(new THREE.Mesh(new THREE.TubeGeometry(thumbCurve, 6, 0.008, 6, false), clawMat));

            // 收攏的四根放射翼指骨架
            [
                new THREE.Vector3(sign * 0.28, -0.46, 0.16),
                new THREE.Vector3(sign * 0.20, -0.58, 0.18),
                new THREE.Vector3(sign * 0.12, -0.52, 0.14),
                new THREE.Vector3(sign * 0.05, -0.40, 0.08)
            ].forEach((tip) => {
                const fCurve = new THREE.CatmullRomCurve3([wristPos, tip]);
                wingGroup.add(new THREE.Mesh(new THREE.TubeGeometry(fCurve, 8, 0.010, 6, false), this.matBatWingBone));
            });

            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.quadraticCurveTo(sign * 0.30, -0.24, sign * 0.20, -0.58);
            shape.quadraticCurveTo(sign * 0.08, -0.48, 0, -0.36);
            shape.quadraticCurveTo(-sign * 0.04, -0.18, 0, 0);

            const extrudeSettings = { depth: 0.012, bevelEnabled: false };
            const wingMembrane = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, extrudeSettings), this.matBatFlightMembrane);
            wingMembrane.position.z = 0.06;
            wingMembrane.castShadow = true;
            wingGroup.add(wingMembrane);

            return wingGroup;
        };

        this.batAdultWingL = createWingShape(true);
        this.batAdultWingLPivot.add(this.batAdultWingL);

        this.batAdultWingR = createWingShape(false);
        this.batAdultWingRPivot.add(this.batAdultWingR);

        // 2.4 狐狸型可愛小腦袋與吻部（與飛行模型 batFlightHead 1:1 完全同尺寸、同五官比例！）
        const adultHead = new THREE.Group();
        adultHead.position.set(0, -0.92, 0.10);
        hangBodyPivot.add(adultHead);
        this.batAdultHead = adultHead;

        const headGeo = new THREE.SphereGeometry(0.20, 20, 18);
        headGeo.scale(0.96, 0.94, 1.12);
        const headMesh = new THREE.Mesh(headGeo, this.matBatFur);
        headMesh.castShadow = true;
        adultHead.add(headMesh);

        // 狐狸型吻部
        const snoutGeo = new THREE.ConeGeometry(0.092, 0.22, 14);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(0.95, 0.82, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matBatFace);
        snoutMesh.position.set(0, -0.02, 0.20);
        adultHead.add(snoutMesh);

        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), this.matNose);
        noseMesh.position.set(0, -0.005, 0.30);
        adultHead.add(noseMesh);

        // 眼睛（雙高光靈動黑曜眼）
        const eyeGeo = new THREE.SphereGeometry(0.048, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.032, 10, 10);
        const shine1Geo = new THREE.SphereGeometry(0.016, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.009, 8, 8);

        this.batAdultEyeL = new THREE.Group();
        this.batAdultEyeL.position.set(-0.092, 0.045, 0.17);
        const irisL = new THREE.Mesh(eyeGeo, this.matBatEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.022);
        const s1L = new THREE.Mesh(shine1Geo, this.matShine);
        s1L.position.set(-0.012, 0.015, 0.048);
        const s2L = new THREE.Mesh(shine2Geo, this.matShine);
        s2L.position.set(0.010, -0.010, 0.048);
        this.batAdultEyeL.add(irisL, pupilL, s1L, s2L);
        adultHead.add(this.batAdultEyeL);

        this.batAdultEyeR = new THREE.Group();
        this.batAdultEyeR.position.set(0.092, 0.045, 0.17);
        const irisR = new THREE.Mesh(eyeGeo, this.matBatEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.022);
        const s1R = new THREE.Mesh(shine1Geo, this.matShine);
        s1R.position.set(-0.012, 0.015, 0.048);
        const s2R = new THREE.Mesh(shine2Geo, this.matShine);
        s2R.position.set(0.010, -0.010, 0.048);
        this.batAdultEyeR.add(irisR, pupilR, s1R, s2R);
        adultHead.add(this.batAdultEyeR);

        // 耳朵
        this.batAdultEarLPivot = new THREE.Group();
        this.batAdultEarLPivot.position.set(-0.125, 0.15, -0.02);
        this.batAdultEarLPivot.rotation.z = 0.28;
        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.17, 8), this.matBatFace);
        earL.scale.set(0.9, 1.0, 0.4);
        earL.position.set(0, 0.08, 0);
        this.batAdultEarLPivot.add(earL);
        adultHead.add(this.batAdultEarLPivot);

        this.batAdultEarRPivot = new THREE.Group();
        this.batAdultEarRPivot.position.set(0.125, 0.15, -0.02);
        this.batAdultEarRPivot.rotation.z = -0.28;
        const earR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.17, 8), this.matBatFace);
        earR.scale.set(-0.9, 1.0, 0.4);
        earR.position.set(0, 0.08, 0);
        this.batAdultEarRPivot.add(earR);
        adultHead.add(this.batAdultEarRPivot);

        // 2.5 建立起飛與翱翔專用的「水平俯臥流線展翼狐蝠模型」(完全依照玩家上傳參考圖打造，並與倒掛模型 1:1 統一五官與頸圈！)
        this.buildBatFlightRig();
    }

    // 🦇 完美還原參考圖：狐蝠起飛與空中翱翔姿勢（與棲息模型共享完全相同五官、金黃頸圈與翼膜材質，支援起飛／降落平滑收展翼過渡！）
    buildBatFlightRig() {
        this.batFlightRig = new THREE.Group();
        this.batFlightRig.name = 'BatFlightRig';
        this.batFlightRig.position.set(0, 1.30, 0);
        this.batFlightRig.visible = false;
        this.batRoot.add(this.batFlightRig);

        // 核心機體樞紐（略微昂首迎風傾角）
        this.batFlightCore = new THREE.Group();
        this.batFlightCore.rotation.x = -0.16;
        this.batFlightRig.add(this.batFlightCore);

        // 1. 水平流線型深黑棕毛茸身軀 (Horizontal Streamlined Torso)
        const bodyGeo = new THREE.SphereGeometry(0.26, 22, 18);
        bodyGeo.scale(0.88, 0.76, 1.58);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matBatFur);
        bodyMesh.castShadow = true;
        this.batFlightCore.add(bodyMesh);

        // 2. 標誌性金黃暖橙色頸圈毛領 (Golden-Yellow Neck Ruff / Mantle — 參考圖最顯眼特徵！)
        const mantleMain = new THREE.Mesh(new THREE.SphereGeometry(0.245, 22, 18), this.matBatGoldenMantle);
        mantleMain.scale.set(1.06, 0.94, 0.82);
        mantleMain.position.set(0, 0.03, 0.24);
        mantleMain.castShadow = true;
        this.batFlightCore.add(mantleMain);

        const mantleChest = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 16), this.matBatGoldenMantle);
        mantleChest.scale.set(1.02, 0.86, 0.72);
        mantleChest.position.set(0, -0.05, 0.28);
        this.batFlightCore.add(mantleChest);

        // 3. 朝前平視的狐狸型小腦袋與吻部 (與 batAdultHead 1:1 完全同尺寸、同五官雙高光黑曜眼！)
        this.batFlightHead = new THREE.Group();
        this.batFlightHead.name = 'BatFlightHead';
        this.batFlightHead.position.set(0, 0.08, 0.44);
        this.batFlightHead.rotation.x = 0.14;
        this.batFlightCore.add(this.batFlightHead);

        const fHead = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 18), this.matBatFur);
        fHead.scale.set(0.96, 0.94, 1.12);
        fHead.castShadow = true;
        this.batFlightHead.add(fHead);

        const fSnout = new THREE.Mesh(new THREE.ConeGeometry(0.092, 0.22, 14), this.matBatFace);
        fSnout.rotation.x = Math.PI / 2;
        fSnout.scale.set(0.95, 0.82, 1.0);
        fSnout.position.set(0, -0.02, 0.20);
        this.batFlightHead.add(fSnout);

        const fNose = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), this.matNose);
        fNose.position.set(0, -0.005, 0.30);
        this.batFlightHead.add(fNose);

        // 與棲息成蝠完全相同的雙高光黑曜眼與耳廓
        [-0.092, 0.092].forEach((ex, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const eyeGrp = new THREE.Group();
            eyeGrp.position.set(ex, 0.045, 0.17);
            const iris = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 14), this.matBatEye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), this.matPupil);
            pupil.position.set(0, 0, 0.022);
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
            shine1.position.set(-0.012, 0.015, 0.048);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), this.matShine);
            shine2.position.set(0.010, -0.010, 0.048);
            eyeGrp.add(iris, pupil, shine1, shine2);

            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.17, 8), this.matBatFace);
            ear.scale.set(0.9, 1.0, 0.4);
            ear.position.set(dir * 0.125, 0.18, -0.02);
            ear.rotation.z = dir * -0.28;
            this.batFlightHead.add(eyeGrp, ear);
        });

        // 4. 向後水平伸直的雙後腿、五趾黑鉤爪與股間膜 (Backward-Stretched Hind Legs & Claws — 參考圖左下方細節！)
        const clawMat = new THREE.MeshStandardMaterial({ color: 0x11100f, roughness: 0.38 });
        this.batFlightLegs = [];
        [-0.12, 0.12].forEach(lx => {
            const legGroup = new THREE.Group();
            const legCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(lx * 0.85, -0.04, -0.32),
                new THREE.Vector3(lx * 1.05, -0.09, -0.54),
                new THREE.Vector3(lx * 1.18, -0.14, -0.74)
            ]);
            const legMesh = new THREE.Mesh(new THREE.TubeGeometry(legCurve, 10, 0.028, 8, false), this.matBatFur);
            legGroup.add(legMesh);

            // 腳掌與向後伸展的 5 根彎曲黑爪
            for (let c = -2; c <= 2; c++) {
                const clawCurve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(lx * 1.18 + c * 0.015, -0.14, -0.73),
                    new THREE.Vector3(lx * 1.22 + c * 0.018, -0.15, -0.82),
                    new THREE.Vector3(lx * 1.22 + c * 0.018, -0.19, -0.85)
                ]);
                const clawTube = new THREE.Mesh(new THREE.TubeGeometry(clawCurve, 6, 0.0065, 5, false), clawMat);
                legGroup.add(clawTube);
            }
            this.batFlightCore.add(legGroup);
            this.batFlightLegs.push(legGroup);
        });

        // 尾部下方小肉突（參考圖腹部後端特徵）
        const tailStub = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.11, 8), this.matBatFur);
        tailStub.position.set(0, -0.18, -0.32);
        tailStub.rotation.x = 0.25;
        this.batFlightCore.add(tailStub);

        // 5. 雙節式超寬展半透明翼膜、腕部拇指鉤爪與四根放射翼指骨架 (Wide-Spanning Articulated Bat Wings)
        const buildRealisticBatWing = (isLeft) => {
            const sign = isLeft ? -1 : 1; // 左翼 -X，右翼 +X
            const shoulderPivot = new THREE.Group();
            shoulderPivot.position.set(sign * 0.17, 0.05, 0.15);

            // 腕關節位置 (前緣高點)
            const wristPos = new THREE.Vector3(sign * 0.56, 0.16, 0.26);
            const elbowPos = new THREE.Vector3(sign * 0.28, 0.04, 0.02);
            const ankleLocal = new THREE.Vector3(sign * -0.03, -0.18, -0.78);
            const digit5Tip = new THREE.Vector3(sign * 0.68, -0.08, -0.46);

            // 上臂與前臂前緣粗骨架 (Humerus & Radius)
            const armCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                elbowPos,
                wristPos
            ]);
            const armBone = new THREE.Mesh(new THREE.TubeGeometry(armCurve, 14, 0.022, 8, false), this.matBatWingBone);
            shoulderPivot.add(armBone);

            // 第五指骨 (內側支撐骨：腕關節 -> 內翼後緣尖端)
            const d5Curve = new THREE.CatmullRomCurve3([
                wristPos,
                new THREE.Vector3(sign * 0.64, 0.02, -0.12),
                digit5Tip
            ]);
            const d5Bone = new THREE.Mesh(new THREE.TubeGeometry(d5Curve, 12, 0.012, 6, false), this.matBatWingBone);
            shoulderPivot.add(d5Bone);

            // 腕關節前緣標誌性「拇指小鉤爪」(Thumb Claw jutting forward at wrist apex — 參考圖超清晰細節！)
            const thumbCurve = new THREE.CatmullRomCurve3([
                wristPos,
                new THREE.Vector3(wristPos.x + sign * 0.04, wristPos.y + 0.04, wristPos.z + 0.08),
                new THREE.Vector3(wristPos.x + sign * 0.08, wristPos.y + 0.02, wristPos.z + 0.12),
                new THREE.Vector3(wristPos.x + sign * 0.09, wristPos.y - 0.01, wristPos.z + 0.10)
            ]);
            const thumbClaw = new THREE.Mesh(new THREE.TubeGeometry(thumbCurve, 8, 0.0085, 6, false), clawMat);
            shoulderPivot.add(thumbClaw);

            // 內翼膜 (Plagiopatagium + Propatagium)：由肩頸前緣 -> 腕關節 -> 第五指尖 -> 弧形波浪連回後腳踝
            const innerGeo = new THREE.BufferGeometry();
            const pShoulderFront = new THREE.Vector3(0, 0.02, 0.12);
            const pRearHip = new THREE.Vector3(0, -0.08, -0.45);
            const pArchMid = new THREE.Vector3(sign * 0.34, -0.14, -0.52);
            const innerVerts = new Float32Array([
                // 前緣三角膜 (Propatagium)
                0, 0, 0,  pShoulderFront.x, pShoulderFront.y, pShoulderFront.z,  wristPos.x, wristPos.y, wristPos.z,
                // 主內翼膜上半
                0, 0, 0,  wristPos.x, wristPos.y, wristPos.z,  pArchMid.x, pArchMid.y, pArchMid.z,
                // 主內翼膜外半
                wristPos.x, wristPos.y, wristPos.z,  digit5Tip.x, digit5Tip.y, digit5Tip.z,  pArchMid.x, pArchMid.y, pArchMid.z,
                // 主內翼膜後緣連接後腿與臀部
                0, 0, 0,  pArchMid.x, pArchMid.y, pArchMid.z,  pRearHip.x, pRearHip.y, pRearHip.z,
                pRearHip.x, pRearHip.y, pRearHip.z,  pArchMid.x, pArchMid.y, pArchMid.z,  ankleLocal.x, ankleLocal.y, ankleLocal.z
            ]);
            innerGeo.setAttribute('position', new THREE.BufferAttribute(innerVerts, 3));
            innerGeo.computeVertexNormals();
            const innerMembrane = new THREE.Mesh(innerGeo, this.matBatFlightMembrane);
            innerMembrane.castShadow = true;
            shoulderPivot.add(innerMembrane);

            // 內翼膜微血管紋理線
            for (let v = 1; v <= 3; v++) {
                const f = v / 4;
                const vCurve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(elbowPos.x * f, elbowPos.y * f, -0.05 * v),
                    new THREE.Vector3(sign * (0.25 + v * 0.09), -0.04, -0.18 - v * 0.08),
                    new THREE.Vector3(sign * (0.18 + v * 0.12), -0.11, -0.46 - v * 0.05)
                ]);
                const vein = new THREE.Mesh(new THREE.TubeGeometry(vCurve, 8, 0.004, 4, false), this.matBatWingBone);
                shoulderPivot.add(vein);
            }

            // 外側手翼關節樞紐 (Hand-Wing / Dactylopatagium — 隨拍翅產生自然二段柔韌折疊！)
            const handWingPivot = new THREE.Group();
            handWingPivot.position.copy(wristPos);
            shoulderPivot.add(handWingPivot);

            // 相對於腕關節 (0,0,0) 的四根放射狀修長翼指尖端座標
            const d2Tip = new THREE.Vector3(sign * 0.46, 0.02, 0.02);   // 第二指 (前緣食指)
            const d3Tip = new THREE.Vector3(sign * 0.98, -0.08, -0.18); // 第三指 (最長主翼尖)
            const d4Tip = new THREE.Vector3(sign * 0.68, -0.18, -0.58); // 第四指 (中後翼指)
            const d5Rel = new THREE.Vector3(digit5Tip.x - wristPos.x, digit5Tip.y - wristPos.y, digit5Tip.z - wristPos.z);

            // 繪製第 2、3、4 指骨架
            [d2Tip, d3Tip, d4Tip].forEach((tip, idx) => {
                const mid = new THREE.Vector3(tip.x * 0.55, tip.y * 0.4 + 0.03, tip.z * 0.45 + 0.04);
                const dCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), mid, tip]);
                const radius = idx === 1 ? 0.013 : 0.010;
                const dBone = new THREE.Mesh(new THREE.TubeGeometry(dCurve, 12, radius, 6, false), this.matBatWingBone);
                handWingPivot.add(dBone);
            });

            // 外側扇形手翼膜 (帶有指間波浪凹弧 Scalloped Trailing Edge)
            const arch34 = new THREE.Vector3(sign * 0.76, -0.14, -0.34);
            const arch45 = new THREE.Vector3(sign * 0.36, -0.18, -0.58);
            const outerGeo = new THREE.BufferGeometry();
            const outerVerts = new Float32Array([
                // 腕 -> 第二指 -> 第三指前緣
                0, 0, 0,  d2Tip.x, d2Tip.y, d2Tip.z,  d3Tip.x, d3Tip.y, d3Tip.z,
                // 腕 -> 第三指 -> 3-4指波浪弧頂 -> 第四指
                0, 0, 0,  d3Tip.x, d3Tip.y, d3Tip.z,  arch34.x, arch34.y, arch34.z,
                0, 0, 0,  arch34.x, arch34.y, arch34.z,  d4Tip.x, d4Tip.y, d4Tip.z,
                // 腕 -> 第四指 -> 4-5指波浪弧頂 -> 第五指
                0, 0, 0,  d4Tip.x, d4Tip.y, d4Tip.z,  arch45.x, arch45.y, arch45.z,
                0, 0, 0,  arch45.x, arch45.y, arch45.z,  d5Rel.x, d5Rel.y, d5Rel.z
            ]);
            outerGeo.setAttribute('position', new THREE.BufferAttribute(outerVerts, 3));
            outerGeo.computeVertexNormals();
            const outerMembrane = new THREE.Mesh(outerGeo, this.matBatFlightMembrane);
            outerMembrane.castShadow = true;
            handWingPivot.add(outerMembrane);

            // 參考圖細節：翼膜上的透光小白點 (Wing Pinholes)
            const pinholeCoords = isLeft
                ? [[sign * 0.24, -0.02, -0.18], [sign * 0.31, -0.04, -0.22], [sign * 0.29, -0.07, -0.28]]
                : [[sign * 0.22, -0.04, -0.20], [sign * 0.26, -0.05, -0.24]];
            pinholeCoords.forEach(([px, py, pz]) => {
                const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), this.matShine);
                dot.position.set(px, py, pz);
                handWingPivot.add(dot);
            });

            return { shoulderPivot, handWingPivot };
        };

        const leftWing = buildRealisticBatWing(true);
        const rightWing = buildRealisticBatWing(false);
        this.batFlightWingL = leftWing.shoulderPivot;
        this.batFlightOuterL = leftWing.handWingPivot;
        this.batFlightWingR = rightWing.shoulderPivot;
        this.batFlightOuterR = rightWing.handWingPivot;
        this.batFlightCore.add(this.batFlightWingL, this.batFlightWingR);
    }

    // 驅動水平飛翔狐蝠的擬真雙節拍翅動畫（支援 flightBlend: 0 = 棲息收翼倒掛過渡 <-> 1 = 水平展翅飛行）
    animateBatFlightPose(elapsedTime, flapSpeed = 11.5, flightBlend = 1.0) {
        if (!this.batFlightRig) return;
        const b = THREE.MathUtils.clamp(flightBlend, 0.0, 1.0);
        const fold = 1.0 - b;
        const phase = elapsedTime * flapSpeed;
        const mainFlap = (Math.sin(phase) * 0.58 + 0.12) * b; // 上揚幅度略大，符合參考圖高揚展翼姿態
        const wristLag = (Math.sin(phase - 0.65) * 0.36) * b;

        if (this.batFlightWingL) {
            this.batFlightWingL.rotation.z = -mainFlap + fold * 0.35;
            this.batFlightWingL.rotation.y = fold * 1.15;
            this.batFlightWingL.scale.setScalar(THREE.MathUtils.lerp(0.45, 1.0, b));
        }
        if (this.batFlightOuterL) {
            this.batFlightOuterL.rotation.z = -wristLag;
            this.batFlightOuterL.rotation.y = fold * 0.85;
        }
        if (this.batFlightWingR) {
            this.batFlightWingR.rotation.z = mainFlap - fold * 0.35;
            this.batFlightWingR.rotation.y = -fold * 1.15;
            this.batFlightWingR.scale.setScalar(THREE.MathUtils.lerp(0.45, 1.0, b));
        }
        if (this.batFlightOuterR) {
            this.batFlightOuterR.rotation.z = wristLag;
            this.batFlightOuterR.rotation.y = -fold * 0.85;
        }

        if (this.batFlightCore) {
            this.batFlightCore.position.y = -Math.sin(phase) * 0.06 * b;
            // b=0 時身軀垂直倒掛 (rotation.x = 1.42)，b=1 時平滑轉為水平流線俯臥 (rotation.x = -0.16)
            this.batFlightCore.rotation.x = THREE.MathUtils.lerp(1.42, -0.16 + Math.cos(phase) * 0.06, b);
        }
        if (this.batFlightHead) {
            this.batFlightHead.rotation.x = THREE.MathUtils.lerp(-1.15, 0.14, b);
        }
    }

    updateBatStage(stage = 'baby') {
        this.batStage = stage;
        if (this.batFlightRig) this.batFlightRig.visible = false;
        if (this.batPerchGroup) this.batPerchGroup.visible = (stage === 'adult');
        if (this.batHangBodyPivot) this.batHangBodyPivot.visible = true;

        if (stage === 'adult') {
            this.batBabyGroup.visible = false;
            this.batAdultGroup.visible = true;
            this.eyeLeft = this.batAdultEyeL;
            this.eyeRight = this.batAdultEyeR;
            this.earLeftPivot = this.batAdultEarLPivot;
            this.earRightPivot = this.batAdultEarRPivot;
            this.head = this.batAdultHead;
        } else {
            this.batBabyGroup.visible = true;
            this.batAdultGroup.visible = false;
            this.eyeLeft = this.batBabyEyeL;
            this.eyeRight = this.batBabyEyeR;
            this.earLeftPivot = this.batBabyEarLPivot;
            this.earRightPivot = this.batBabyEarRPivot;
            this.head = this.batBabyHead;
        }
    }

    updateBat(delta, elapsedTime) {
        const t = elapsedTime;

        // 眨眼
        this.nextBlinkTime -= delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.0 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        }

        // 耳朵微動
        const earBob = Math.sin(t * 3.5) * 0.08;
        if (this.earLeftPivot) this.earLeftPivot.rotation.x = -0.15 + earBob;
        if (this.earRightPivot) this.earRightPivot.rotation.x = -0.15 - earBob;

        // 🦇 當觸發「玩遊戲飛行 (bat_flying)」且處於成年期時：展開雙翼水平起飛（若在幼崽期則保持毛巾捲幼崽形態，不強制突變成大蝙蝠）
        if (this.currentState === 'bat_flying' && this.batStage === 'adult') {
            if (this.batBabyGroup) this.batBabyGroup.visible = false;
            if (this.batAdultGroup) this.batAdultGroup.visible = false;
            // 原木橫樑棲木隱藏或固定，不跟隨狐蝠在空中移動
            if (this.batPerchGroup) this.batPerchGroup.visible = false;
            if (this.batFlightRig) {
                this.batFlightRig.visible = true;
                // 基底高度設為棲息高度 1.30，與待機倒掛位置完全對齊，起飛與降落零落差！
                this.batFlightRig.position.set(0, 1.30, 0);
                this.batFlightRig.rotation.set(0, 0, 0);
            }
            return;
        }

        if (this.batStage === 'baby') {
            if (this.batFlightRig) this.batFlightRig.visible = false;
            if (this.batPerchGroup) this.batPerchGroup.visible = false;
            if (this.batBabyGroup) this.batBabyGroup.visible = true;
            if (this.batAdultGroup) this.batAdultGroup.visible = false;

            // 幼崽毛巾捲動畫
            const breathe = Math.sin(t * 2.5) * 0.015;
            this.batBabyGroup.position.y = 0.45 + breathe;

            // 頭部好奇歪頭
            this.batBabyHead.rotation.z = Math.sin(t * 1.2) * 0.08;
            this.batBabyHead.rotation.x = Math.sin(t * 1.8) * 0.05;

            // 餵食或吃香蕉動畫
            if (this.currentState === 'eat') {
                this.batBanana.visible = true;
                const chomp = Math.abs(Math.sin(t * 14)) * 0.06;
                this.batBabyHead.position.y = 0.44 + chomp;
                this.batBabyHead.rotation.x = 0.08 + chomp * 0.4;
            } else {
                this.batBanana.visible = (this.currentState === 'happy');
            }

            if (this.currentState === 'sleep') {
                this.batBabyHead.position.y = 0.38;
                this.batBabyHead.rotation.x = 0.25;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.15;
                if (this.eyeRight) this.eyeRight.scale.y = 0.15;
            } else if (this.currentState === 'pet') {
                this.batBabyHead.rotation.z = 0.15 + Math.sin(t * 5) * 0.05;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            }
        } else {
            if (this.batBabyGroup) this.batBabyGroup.visible = false;
            if (this.batAdultGroup) this.batAdultGroup.visible = true;
            if (this.batPerchGroup) {
                this.batPerchGroup.visible = true;
                this.batPerchGroup.position.set(0, 1.85, 0);
            }

            // 成蝠：平時倒掛棲息，待機起飛時平滑翻身展開寬翼在房間高空飛巡，降落時平滑收翼抓回橫樑！
            if (!this.batFlight) {
                this.batFlight = {
                    timer: 6.0 + Math.random() * 5.0,
                    phase: 'roosting', // 'roosting' | 'drop_launch' | 'flying' | 'return_hang'
                    phaseTime: 0.0,
                    flightAngle: 0.0
                };
            }

            const bf = this.batFlight;
            const isIdle = (this.currentState === 'idle' || !this.currentState);

            if (isIdle) {
                if (bf.phase === 'roosting') {
                    bf.timer -= delta;
                    if (bf.timer <= 0) {
                        bf.phase = 'drop_launch';
                        bf.phaseTime = 0.0;
                    }
                } else if (bf.phase === 'drop_launch') {
                    bf.phaseTime += delta;
                    if (bf.phaseTime >= 1.1) {
                        bf.phase = 'flying';
                        bf.phaseTime = 0.0;
                        bf.flightAngle = 0.0;
                    }
                } else if (bf.phase === 'flying') {
                    bf.phaseTime += delta;
                    bf.flightAngle += delta * 1.35;
                    if (bf.phaseTime >= 6.5) {
                        bf.phase = 'return_hang';
                        bf.phaseTime = 0.0;
                    }
                } else if (bf.phase === 'return_hang') {
                    bf.phaseTime += delta;
                    if (bf.phaseTime >= 1.5) {
                        bf.phase = 'roosting';
                        bf.phaseTime = 0.0;
                        bf.timer = 10.0 + Math.random() * 6.0;
                        if (this.batHangBodyPivot) {
                            this.batHangBodyPivot.position.set(0, -0.04, 0);
                            this.batHangBodyPivot.rotation.set(0, 0, 0);
                        }
                    }
                }
            } else {
                bf.phase = 'roosting';
                bf.timer = 10.0;
            }

            if (this.currentState === 'happy') {
                // 開心歡呼時：展示參考圖的帥氣水平展翼飛翔姿勢懸停拍翅！
                this.batHangBodyPivot.visible = false;
                this.batFlightRig.visible = true;
                this.batFlightRig.position.set(0, 1.30, 0.22);
                this.batFlightRig.rotation.set(0, -0.35, 0.12);
                this.animateBatFlightPose(t, 12.0, 1.0);
            } else if (this.currentState === 'pet') {
                this.batFlightRig.visible = false;
                this.batHangBodyPivot.visible = true;
                this.batHangBodyPivot.position.set(0, -0.04, 0);
                this.batHangBodyPivot.rotation.set(0, 0, 0);
                const flap = Math.sin(t * 10) * 0.55 + 0.35;
                this.batAdultWingLPivot.rotation.y = -flap;
                this.batAdultWingRPivot.rotation.y = flap;
            } else if (this.currentState === 'sleep') {
                this.batFlightRig.visible = false;
                this.batHangBodyPivot.visible = true;
                this.batHangBodyPivot.position.set(0, -0.04, 0);
                this.batHangBodyPivot.rotation.set(0, 0, 0);
                // 睡覺時：雙翼緊緊包裹成黑繭
                this.batAdultWingLPivot.rotation.y = 0.35;
                this.batAdultWingRPivot.rotation.y = -0.35;
                this.batAdultHead.rotation.x = -0.3;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                // 待機狀態：原木倒掛微晃 <-> 平滑轉為水平流線姿勢高空展翼翱翔
                if (bf.phase === 'drop_launch') {
                    // 由棲木倒掛位置 (0, 1.30, 0) 平滑翻身展開雙翼起飛 (flightBlend: 0 -> 1)
                    this.batHangBodyPivot.visible = false;
                    this.batFlightRig.visible = true;
                    const p = Math.min(1.0, bf.phaseTime / 1.1);
                    const easeP = 1 - Math.pow(1 - p, 2);
                    const blend = Math.min(1.0, p * 1.35);
                    this.batFlightRig.position.set(
                        THREE.MathUtils.lerp(0, 1.45, easeP),
                        THREE.MathUtils.lerp(1.30, 1.48, easeP),
                        THREE.MathUtils.lerp(0, 0.15, easeP)
                    );
                    this.batFlightRig.rotation.set(0, THREE.MathUtils.lerp(0, Math.PI, easeP), 0.22 * easeP);
                    this.animateBatFlightPose(t, 13.0, blend);
                } else if (bf.phase === 'flying') {
                    // 高空巡航：水平流線展翼大狐蝠在房間空中繞大圈翱翔
                    this.batHangBodyPivot.visible = false;
                    this.batFlightRig.visible = true;
                    const fa = bf.flightAngle;
                    const rx = Math.cos(fa) * 1.45;
                    const rz = Math.sin(fa) * 1.15;
                    const ry = 1.48 + Math.sin(fa * 2.0) * 0.22;
                    this.batFlightRig.position.set(rx, ry, rz);
                    this.batFlightRig.rotation.y = Math.atan2(-Math.sin(fa) * 1.45, Math.cos(fa) * 1.15);
                    this.batFlightRig.rotation.z = 0.22;
                    this.animateBatFlightPose(t, 11.5, 1.0);
                } else if (bf.phase === 'return_hang') {
                    // 飛回橫樑棲木下方 (0, 1.30, 0)，並平滑收攏雙翼、轉回倒掛姿態 (flightBlend: 1 -> 0)！
                    this.batHangBodyPivot.visible = false;
                    this.batFlightRig.visible = true;
                    const p = Math.min(1.0, bf.phaseTime / 1.5);
                    const easeP = p * p * (3 - 2 * p);
                    const blend = Math.max(0.0, 1.0 - Math.max(0, (p - 0.35) / 0.65));
                    this.batFlightRig.position.x = THREE.MathUtils.lerp(this.batFlightRig.position.x, 0, easeP);
                    this.batFlightRig.position.z = THREE.MathUtils.lerp(this.batFlightRig.position.z, 0, easeP);
                    this.batFlightRig.position.y = THREE.MathUtils.lerp(1.48, 1.30, easeP);
                    this.batFlightRig.rotation.y = THREE.MathUtils.lerp(this.batFlightRig.rotation.y, 0, easeP);
                    this.batFlightRig.rotation.z = THREE.MathUtils.lerp(this.batFlightRig.rotation.z, 0, easeP);
                    this.animateBatFlightPose(t, 12.5, blend);
                } else {
                    // 原木棲木下平靜倒掛鐘擺微晃
                    this.batFlightRig.visible = false;
                    this.batHangBodyPivot.visible = true;
                    const sway = Math.sin(t * 1.4) * 0.05;
                    this.batHangBodyPivot.position.set(0, -0.04, 0);
                    this.batHangBodyPivot.rotation.z = sway;
                    this.batHangBodyPivot.rotation.x = Math.sin(t * 1.1) * 0.03;
                    this.batHangBodyPivot.rotation.y = 0;

                    this.batAdultHead.rotation.x = 0.2 + Math.sin(t * 2) * 0.06;
                    this.batAdultHead.rotation.y = Math.sin(t * 1.3) * 0.08;

                    const breatheWing = Math.sin(t * 2.2) * 0.04;
                    this.batAdultWingLPivot.rotation.y = 0.05 + breatheWing;
                    this.batAdultWingRPivot.rotation.y = -0.05 - breatheWing;
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    //  🐺 冰眸黑狼（Black Wolf）3D 模型引擎：煙燻小狼崽 ＋ 冰眸雪原狼王
    // ─────────────────────────────────────────────────────────
    buildWolfMesh() {
        this.wolfStage = 'baby'; // 'baby' | 'adult'
        this.wolfRoot = new THREE.Group();
        this.root.add(this.wolfRoot);

        // 為配件系統建立容錯節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.tailBase = new THREE.Group();
        this.legs = { frontLeft: new THREE.Group(), frontRight: new THREE.Group(), backLeft: new THREE.Group(), backRight: new THREE.Group() };
        this.tongue = new THREE.Group();
        this.snout = new THREE.Group();
        this.wolfRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼崽期煙燻黑幼狼 (Wolf Pup - 參考圖 1)
        this.buildWolfPupMesh();

        // 2. 成年期雪原冰眸黑狼 (Adult Ice-Eyed Black Wolf - 參考圖 2)
        this.buildWolfAdultMesh();

        // 預設呈現幼崽期
        this.updateWolfStage('baby');
    }

    // 1. 幼崽期：毛茸茸煙燻深炭灰幼狼 (參考圖 1：幼崽毛茸煙燻黑、圓滾滾、深邃灰藍眼瞳)
    buildWolfPupMesh() {
        this.wolfPupGroup = new THREE.Group();
        this.wolfPupGroup.name = 'WolfPupGroup';
        this.wolfPupGroup.position.set(0, 0.65, 0);
        this.wolfRoot.add(this.wolfPupGroup);

        // 1.1 圓滾滾毛茸小身軀 (Fluffy Cub Torso)
        const pupTorsoGeo = new THREE.SphereGeometry(0.38, 18, 18);
        pupTorsoGeo.scale(0.92, 0.95, 1.25);
        const pupTorso = new THREE.Mesh(pupTorsoGeo, this.matWolfPupCoat);
        pupTorso.position.set(0, 0, 0.08);
        pupTorso.castShadow = true;
        this.wolfPupGroup.add(pupTorso);

        const pupBelly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), this.matWolfPupCoat);
        pupBelly.scale.set(0.85, 0.85, 1.1);
        pupBelly.position.set(0, -0.02, -0.25);
        pupBelly.castShadow = true;
        this.wolfPupGroup.add(pupBelly);

        // 1.2 幼狼頸部與大圓頭 (Pup Head)
        const pupNeck = new THREE.Group();
        pupNeck.position.set(0, 0.22, 0.45);
        this.wolfPupGroup.add(pupNeck);
        this.wolfPupNeck = pupNeck;

        const pupHead = new THREE.Group();
        pupNeck.add(pupHead);
        this.wolfPupHead = pupHead;

        // 幼狼頭顱（圓潤軟萌）
        const headGeo = new THREE.SphereGeometry(0.42, 18, 18);
        headGeo.scale(1.0, 0.95, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matWolfPupCoat);
        headMesh.position.set(0, 0.25, 0.1);
        headMesh.castShadow = true;
        pupHead.add(headMesh);

        // 幼狼圓鼓鼓軟萌臉頰 (Fluffy Cheeks)
        const cheekGeo = new THREE.SphereGeometry(0.24, 14, 14);
        cheekGeo.scale(0.9, 0.65, 0.85);
        const cheekL = new THREE.Mesh(cheekGeo, this.matWolfPupCoat);
        cheekL.position.set(-0.25, 0.18, 0.28);
        cheekL.rotation.z = -0.2;
        const cheekR = new THREE.Mesh(cheekGeo, this.matWolfPupCoat);
        cheekR.position.set(0.25, 0.18, 0.28);
        cheekR.rotation.z = 0.2;
        pupHead.add(cheekL, cheekR);

        // 幼狼小吻部 (Puppy Snout)
        const pupSnout = new THREE.Group();
        pupSnout.position.set(0, 0.15, 0.42);
        pupHead.add(pupSnout);

        const snoutGeo = new THREE.ConeGeometry(0.2, 0.34, 16);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(1.0, 0.85, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matWolfPupCoat);
        snoutMesh.position.set(0, 0.01, 0.14);
        snoutMesh.castShadow = true;
        pupSnout.add(snoutMesh);

        // 下巴
        const chinGeo = new THREE.SphereGeometry(0.14, 12, 12);
        chinGeo.scale(0.9, 0.6, 1.15);
        const chinMesh = new THREE.Mesh(chinGeo, this.matWolfPupCoat);
        chinMesh.position.set(0, -0.05, 0.11);
        pupSnout.add(chinMesh);

        // 濕潤黑豆小鼻頭
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), this.matNose);
        noseMesh.scale.set(1.25, 0.9, 1.1);
        noseMesh.position.set(0, 0.035, 0.31);
        pupSnout.add(noseMesh);

        // 1.3 深邃好奇鋼藍色幼瞳 (Steel-Blue Pup Eyes with Catchlights)
        const eyeRadius = 0.12;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.065, 10, 10);
        const shine1Geo = new THREE.SphereGeometry(0.042, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.02, 8, 8);

        this.wolfPupEyeL = new THREE.Group();
        this.wolfPupEyeL.position.set(-0.2, 0.32, 0.46);
        const irisL = new THREE.Mesh(eyeGeo, this.matWolfPupEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.07);
        const s1L = new THREE.Mesh(shine1Geo, this.matShine);
        s1L.position.set(-0.035, 0.045, 0.105);
        const s2L = new THREE.Mesh(shine2Geo, this.matShine);
        s2L.position.set(0.03, -0.03, 0.105);
        this.wolfPupEyeL.add(irisL, pupilL, s1L, s2L);
        pupHead.add(this.wolfPupEyeL);

        this.wolfPupEyeR = new THREE.Group();
        this.wolfPupEyeR.position.set(0.2, 0.32, 0.46);
        const irisR = new THREE.Mesh(eyeGeo, this.matWolfPupEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.07);
        const s1R = new THREE.Mesh(shine1Geo, this.matShine);
        s1R.position.set(-0.035, 0.045, 0.105);
        const s2R = new THREE.Mesh(shine2Geo, this.matShine);
        s2R.position.set(0.03, -0.03, 0.105);
        this.wolfPupEyeR.add(irisR, pupilR, s1R, s2R);
        pupHead.add(this.wolfPupEyeR);

        // 1.4 毛茸茸立體幼狼耳朵 (Soft Fluffy Wolf Ears with Inner Fluff)
        this.wolfPupEarLPivot = new THREE.Group();
        this.wolfPupEarLPivot.position.set(-0.28, 0.62, 0.1);
        pupHead.add(this.wolfPupEarLPivot);

        this.wolfPupEarRPivot = new THREE.Group();
        this.wolfPupEarRPivot.position.set(0.28, 0.62, 0.1);
        pupHead.add(this.wolfPupEarRPivot);

        const earGeo = new THREE.ConeGeometry(0.2, 0.52, 4);
        earGeo.scale(1.0, 1.0, 0.4);
        earGeo.rotateZ(0.12);
        earGeo.rotateX(-0.1);

        const earL = new THREE.Mesh(earGeo, this.matWolfPupCoat);
        earL.position.set(0, 0.24, 0);
        this.wolfPupEarLPivot.add(earL);

        const inL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.40, 4), this.matWolfPupInnerEar);
        inL.position.set(0.01, 0.22, 0.06);
        this.wolfPupEarLPivot.add(inL);

        const earR = new THREE.Mesh(earGeo, this.matWolfPupCoat);
        earR.position.set(0, 0.24, 0);
        earR.scale.x = -1;
        this.wolfPupEarRPivot.add(earR);

        const inR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.40, 4), this.matWolfPupInnerEar);
        inR.position.set(-0.01, 0.22, 0.06);
        this.wolfPupEarRPivot.add(inR);

        // 1.5 厚實軟萌幼狼爪爪 (Chunky Pup Paws)
        this.wolfPupLegs = {};
        const legRadius = 0.09;
        const legHeight = 0.42;
        const legGeo = new THREE.CylinderGeometry(legRadius * 0.9, legRadius, legHeight, 10);
        const pawGeo = new THREE.SphereGeometry(0.12, 10, 10);
        pawGeo.scale(1.0, 0.55, 1.25);

        const createPupLeg = (name, x, y, z) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, z);
            const limb = new THREE.Mesh(legGeo, this.matWolfPupCoat);
            limb.position.set(0, -legHeight * 0.5, 0);
            limb.castShadow = true;
            pivot.add(limb);
            const paw = new THREE.Mesh(pawGeo, this.matWolfPupCoat);
            paw.position.set(0, -legHeight, 0.05);
            paw.castShadow = true;
            pivot.add(paw);
            this.wolfPupGroup.add(pivot);
            this.wolfPupLegs[name] = pivot;
        };
        createPupLeg('frontLeft', -0.2, -0.15, 0.28);
        createPupLeg('frontRight', 0.2, -0.15, 0.28);
        createPupLeg('backLeft', -0.2, -0.15, -0.25);
        createPupLeg('backRight', 0.2, -0.15, -0.25);

        // 1.6 歡快搖擺小狼尾 (Pup Tail)
        this.wolfPupTailBase = new THREE.Group();
        this.wolfPupTailBase.position.set(0, 0.12, -0.38);
        this.wolfPupTailBase.rotation.x = -0.55;
        const tailGeo = new THREE.ConeGeometry(0.09, 0.42, 10);
        tailGeo.translate(0, 0.2, 0);
        const tailMesh = new THREE.Mesh(tailGeo, this.matWolfPupCoat);
        tailMesh.castShadow = true;
        this.wolfPupTailBase.add(tailMesh);
        this.wolfPupGroup.add(this.wolfPupTailBase);
    }

    // 2. 成年期：雪松林王者黑狼・冰藍發光魔眸 (參考圖 2：純黑毛皮、厚實威風狼鬃、晶亮發光冰眸、落雪點綴)
    buildWolfAdultMesh() {
        this.wolfAdultGroup = new THREE.Group();
        this.wolfAdultGroup.name = 'WolfAdultGroup';
        this.wolfAdultGroup.position.set(0, 0.78, 0);
        this.wolfRoot.add(this.wolfAdultGroup);

        // 2.1 強健修長狼王身軀 (Muscular Wolf Body)
        const adultTorsoGeo = new THREE.SphereGeometry(0.42, 18, 18);
        adultTorsoGeo.scale(0.88, 1.0, 1.4);
        const adultTorso = new THREE.Mesh(adultTorsoGeo, this.matWolfAdultCoat);
        adultTorso.position.set(0, 0.05, 0.05);
        adultTorso.castShadow = true;
        this.wolfAdultGroup.add(adultTorso);

        // 狼腰腹 (Slender Waist)
        const waistGeo = new THREE.SphereGeometry(0.34, 14, 14);
        waistGeo.scale(0.76, 0.88, 1.1);
        const waist = new THREE.Mesh(waistGeo, this.matWolfAdultCoat);
        waist.position.set(0, 0.02, -0.36);
        this.wolfAdultGroup.add(waist);

        // 2.2 霸氣厚實黑狼頸部鬃毛 (Thick Layered Wolf Neck Ruff - 參考圖 2)
        const mane0 = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 18), this.matWolfMane);
        mane0.scale.set(1.15, 1.02, 0.82);
        mane0.position.set(0, 0.16, 0.32);
        mane0.rotation.x = -0.3;
        mane0.castShadow = true;
        this.wolfAdultGroup.add(mane0);

        const mane1 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), this.matWolfMane);
        mane1.scale.set(1.16, 0.92, 0.72);
        mane1.position.set(0, 0.25, 0.38);
        mane1.rotation.x = -0.22;
        this.wolfAdultGroup.add(mane1);

        // 2.3 狼頭與長嚎顎部 (Wolf Head & Howling Jaw)
        const adultNeck = new THREE.Group();
        adultNeck.position.set(0, 0.26, 0.44);
        this.wolfAdultGroup.add(adultNeck);
        this.wolfAdultNeck = adultNeck;

        const adultHead = new THREE.Group();
        adultNeck.add(adultHead);
        this.wolfAdultHead = adultHead;

        // 狼頭顱 (修長有神)
        const headGeo = new THREE.SphereGeometry(0.42, 18, 18);
        headGeo.scale(1.0, 0.95, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matWolfAdultCoat);
        headMesh.position.set(0, 0.25, 0.1);
        headMesh.castShadow = true;
        adultHead.add(headMesh);

        // 狼吻部 (Noble Lupine Snout)
        const adultSnout = new THREE.Group();
        adultSnout.position.set(0, 0.16, 0.44);
        adultHead.add(adultSnout);

        const snoutGeo = new THREE.ConeGeometry(0.2, 0.42, 16);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(0.95, 0.78, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matWolfAdultCoat);
        snoutMesh.position.set(0, 0.01, 0.18);
        snoutMesh.castShadow = true;
        adultSnout.add(snoutMesh);

        // 狼吻鼻樑突起 (Muzzle Bridge)
        const bridgeGeo = new THREE.ConeGeometry(0.12, 0.38, 14);
        bridgeGeo.rotateX(Math.PI / 2);
        bridgeGeo.scale(0.85, 0.42, 1.0);
        const bridgeMesh = new THREE.Mesh(bridgeGeo, this.matWolfAdultCoat);
        bridgeMesh.position.set(0, 0.06, 0.16);
        adultSnout.add(bridgeMesh);

        // 濕潤純黑狼鼻頭
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), this.matNose);
        noseMesh.scale.set(1.3, 0.88, 1.1);
        noseMesh.position.set(0, 0.035, 0.38);
        adultSnout.add(noseMesh);

        // 可張開長嚎的下顎 (Howling Jaw with Natural Chin & Tongue)
        this.wolfAdultJaw = new THREE.Group();
        this.wolfAdultJaw.position.set(0, -0.05, 0.14);
        const chinGeo = new THREE.SphereGeometry(0.14, 12, 12);
        chinGeo.scale(0.9, 0.55, 1.15);
        const jawMesh = new THREE.Mesh(chinGeo, this.matWolfAdultCoat);
        jawMesh.position.set(0, -0.02, 0.06);
        this.wolfAdultJaw.add(jawMesh);
        // 嘴內與微露小舌
        const jawTongue = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.015, 0.14), this.matTongue);
        jawTongue.position.set(0, 0.02, 0.06);
        this.wolfAdultJaw.add(jawTongue);
        adultSnout.add(this.wolfAdultJaw);

        // 2.4 攝人心魄的晶亮冰川藍發光魔眸 (Icy Glowing Blue Eyes - 參考圖 2 核心)
        const eyeRadius = 0.125;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 16, 16);
        const pupilGeo = new THREE.SphereGeometry(0.055, 12, 12);
        const shine1Geo = new THREE.SphereGeometry(0.04, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.02, 8, 8);

        this.wolfAdultEyeL = new THREE.Group();
        this.wolfAdultEyeL.position.set(-0.20, 0.32, 0.48);
        const irisL = new THREE.Mesh(eyeGeo, this.matWolfIcyEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.08);
        const s1L = new THREE.Mesh(shine1Geo, this.matShine);
        s1L.position.set(-0.035, 0.04, 0.105);
        const s2L = new THREE.Mesh(shine2Geo, this.matShine);
        s2L.position.set(0.03, -0.03, 0.105);
        this.wolfAdultEyeL.add(irisL, pupilL, s1L, s2L);
        adultHead.add(this.wolfAdultEyeL);

        this.wolfAdultEyeR = new THREE.Group();
        this.wolfAdultEyeR.position.set(0.20, 0.32, 0.48);
        const irisR = new THREE.Mesh(eyeGeo, this.matWolfIcyEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.08);
        const s1R = new THREE.Mesh(shine1Geo, this.matShine);
        s1R.position.set(-0.035, 0.04, 0.105);
        const s2R = new THREE.Mesh(shine2Geo, this.matShine);
        s2R.position.set(0.03, -0.03, 0.105);
        this.wolfAdultEyeR.add(irisR, pupilR, s1R, s2R);
        adultHead.add(this.wolfAdultEyeR);

        // 2.5 挺拔警惕狼耳 (Alert Wolf Ears with Soft Inner Liner)
        this.wolfAdultEarLPivot = new THREE.Group();
        this.wolfAdultEarLPivot.position.set(-0.28, 0.64, 0.10);
        adultHead.add(this.wolfAdultEarLPivot);

        this.wolfAdultEarRPivot = new THREE.Group();
        this.wolfAdultEarRPivot.position.set(0.28, 0.64, 0.10);
        adultHead.add(this.wolfAdultEarRPivot);

        const adultEarGeo = new THREE.ConeGeometry(0.2, 0.56, 4);
        adultEarGeo.scale(1.0, 1.0, 0.4);
        adultEarGeo.rotateZ(0.14);
        adultEarGeo.rotateX(-0.1);

        const earL = new THREE.Mesh(adultEarGeo, this.matWolfAdultCoat);
        earL.position.set(0, 0.25, 0);
        this.wolfAdultEarLPivot.add(earL);
        const earInL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.44, 4), this.matWolfAdultInnerEar);
        earInL.position.set(0.01, 0.23, 0.06);
        this.wolfAdultEarLPivot.add(earInL);

        const earR = new THREE.Mesh(adultEarGeo, this.matWolfAdultCoat);
        earR.position.set(0, 0.25, 0);
        earR.scale.x = -1;
        this.wolfAdultEarRPivot.add(earR);
        const earInR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.44, 4), this.matWolfAdultInnerEar);
        earInR.position.set(-0.01, 0.23, 0.06);
        this.wolfAdultEarRPivot.add(earInR);

        // 2.6 雄健有力的四肢 (Athletic Wolf Legs & Paws)
        this.wolfAdultLegs = {};
        const legRadius = 0.092;
        const legHeight = 0.52;
        const legGeo = new THREE.CylinderGeometry(legRadius * 0.9, legRadius, legHeight, 10);
        const pawGeo = new THREE.SphereGeometry(0.13, 10, 10);
        pawGeo.scale(1.0, 0.55, 1.35);

        const createAdultLeg = (name, x, y, z) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, z);
            const limb = new THREE.Mesh(legGeo, this.matWolfAdultCoat);
            limb.position.set(0, -legHeight * 0.5, 0);
            limb.castShadow = true;
            pivot.add(limb);
            const paw = new THREE.Mesh(pawGeo, this.matWolfAdultCoat);
            paw.position.set(0, -legHeight, 0.05);
            paw.castShadow = true;
            pivot.add(paw);
            this.wolfAdultGroup.add(pivot);
            this.wolfAdultLegs[name] = pivot;
        };
        createAdultLeg('frontLeft', -0.21, -0.1, 0.3);
        createAdultLeg('frontRight', 0.21, -0.1, 0.3);
        createAdultLeg('backLeft', -0.21, -0.1, -0.3);
        createAdultLeg('backRight', 0.21, -0.1, -0.3);

        // 2.7 蓬鬆濃密大長狼尾 (Bushy Wolf Tail)
        this.wolfAdultTailBase = new THREE.Group();
        this.wolfAdultTailBase.position.set(0, 0.16, -0.48);
        this.wolfAdultTailBase.rotation.x = -0.45;
        const tailGeo0 = new THREE.ConeGeometry(0.14, 0.58, 12);
        tailGeo0.translate(0, -0.26, 0);
        tailGeo0.rotateX(Math.PI);
        const tailMesh0 = new THREE.Mesh(tailGeo0, this.matWolfAdultCoat);
        tailMesh0.castShadow = true;
        this.wolfAdultTailBase.add(tailMesh0);
        this.wolfAdultGroup.add(this.wolfAdultTailBase);

        // 2.8 細碎落雪微塵 (Snow Dusting Flecks - 參考圖 2 精準還原)
        const snowGeo = new THREE.SphereGeometry(1, 8, 8);
        // 頭部與面部積雪（跟隨頭部動作擺動）
        const headSnows = [
            { x: 0.0, y: 0.24, z: 0.65, s: 0.024 },
            { x: -0.04, y: 0.22, z: 0.60, s: 0.018 },
            { x: 0.03, y: 0.23, z: 0.56, s: 0.022 },
            { x: 0.0, y: 0.44, z: 0.34, s: 0.03 },
            { x: -0.07, y: 0.45, z: 0.31, s: 0.022 },
            { x: 0.08, y: 0.44, z: 0.32, s: 0.025 },
            { x: -0.22, y: 0.76, z: 0.06, s: 0.02 },
            { x: 0.22, y: 0.75, z: 0.05, s: 0.022 }
        ];
        headSnows.forEach(sn => {
            const flake = new THREE.Mesh(snowGeo, this.matSnowFlake);
            flake.scale.setScalar(sn.s);
            flake.position.set(sn.x, sn.y, sn.z);
            adultHead.add(flake);
        });

        // 鬃毛與背部積雪（固定在身軀）
        const bodySnows = [
            { x: 0.0, y: 0.46, z: 0.26, s: 0.035 },
            { x: -0.16, y: 0.38, z: 0.28, s: 0.028 },
            { x: 0.17, y: 0.39, z: 0.27, s: 0.03 },
            { x: -0.24, y: 0.3, z: 0.31, s: 0.025 },
            { x: 0.24, y: 0.31, z: 0.3, s: 0.026 },
            { x: 0.0, y: 0.28, z: 0.06, s: 0.035 },
            { x: -0.12, y: 0.25, z: 0.02, s: 0.026 },
            { x: 0.13, y: 0.26, z: 0.04, s: 0.028 },
            { x: 0.0, y: 0.25, z: -0.16, s: 0.032 },
            { x: -0.1, y: 0.22, z: -0.22, s: 0.024 },
            { x: 0.09, y: 0.21, z: -0.2, s: 0.026 },
            { x: 0.0, y: 0.19, z: -0.36, s: 0.028 }
        ];
        bodySnows.forEach(sn => {
            const flake = new THREE.Mesh(snowGeo, this.matSnowFlake);
            flake.scale.setScalar(sn.s);
            flake.position.set(sn.x, sn.y, sn.z);
            this.wolfAdultGroup.add(flake);
        });
    }

    updateWolfStage(stage = 'baby') {
        this.wolfStage = stage;
        if (stage === 'adult') {
            this.wolfPupGroup.visible = false;
            this.wolfAdultGroup.visible = true;
            this.eyeLeft = this.wolfAdultEyeL;
            this.eyeRight = this.wolfAdultEyeR;
            this.earLeftPivot = this.wolfAdultEarLPivot;
            this.earRightPivot = this.wolfAdultEarRPivot;
            this.head = this.wolfAdultHead;
        } else {
            this.wolfPupGroup.visible = true;
            this.wolfAdultGroup.visible = false;
            this.eyeLeft = this.wolfPupEyeL;
            this.eyeRight = this.wolfPupEyeR;
            this.earLeftPivot = this.wolfPupEarLPivot;
            this.earRightPivot = this.wolfPupEarRPivot;
            this.head = this.wolfPupHead;
        }
    }

    updateWolf(delta, elapsedTime) {
        const t = elapsedTime;
        this.updateCanineAutonomy(delta, elapsedTime);

        // 眨眼
        this.nextBlinkTime -= delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.5 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        }

        // 耳朵微動
        const earBob = Math.sin(t * 3.0) * 0.06;
        if (this.earLeftPivot) this.earLeftPivot.rotation.x = -0.1 + earBob;
        if (this.earRightPivot) this.earRightPivot.rotation.x = -0.1 - earBob;

        // 🐺 狼嚎 / 開心長嘯 (Wolf Howl)
        const isHowling = (this.currentState === 'happy' || this.currentState === 'howl' || this.currentState === 'bark');

        if (this.wolfStage === 'baby') {
            // 幼狼動態
            const breathe = Math.sin(t * 2.8) * 0.015;
            this.wolfPupGroup.position.y = 0.65 + breathe;

            // 幼狼搖尾
            const wag = Math.sin(t * (isHowling ? 16 : 7)) * (isHowling ? 0.6 : 0.35);
            this.wolfPupTailBase.rotation.y = wag;

            if (isHowling) {
                // 幼狼奶音嗷嗚～
                this.wolfPupHead.rotation.x = -0.45;
                this.wolfPupHead.rotation.z = Math.sin(t * 8) * 0.08;
                this.wolfPupLegs.frontLeft.rotation.x = 0.15;
                this.wolfPupLegs.frontRight.rotation.x = 0.15;
            } else if (this.currentState === 'pet') {
                this.wolfPupHead.rotation.x = -0.2;
                this.wolfPupHead.rotation.z = 0.15;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            } else if (this.currentState === 'sleep') {
                this.wolfPupGroup.position.y = 0.42;
                this.wolfPupHead.rotation.x = 0.25;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    const wc = this.autonomy.walkCycle;
                    this.wolfPupGroup.position.y = 0.65 + Math.abs(Math.sin(wc * 2)) * 0.03;
                    this.wolfPupLegs.frontLeft.rotation.x = Math.sin(wc) * 0.45;
                    this.wolfPupLegs.frontRight.rotation.x = -Math.sin(wc) * 0.45;
                    this.wolfPupLegs.backLeft.rotation.x = -Math.sin(wc) * 0.45;
                    this.wolfPupLegs.backRight.rotation.x = Math.sin(wc) * 0.45;
                    this.wolfPupHead.rotation.x = Math.sin(wc * 2) * 0.04;
                    this.wolfPupHead.rotation.y = 0;
                    this.wolfPupHead.rotation.z = 0;
                } else {
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.wolfPupGroup.position.y = THREE.MathUtils.lerp(0.65, 0.36, lf) + Math.sin(t * (2.0 - lf * 0.6)) * 0.01;
                    this.wolfPupLegs.frontLeft.rotation.x = -0.42 * lf;
                    this.wolfPupLegs.frontRight.rotation.x = -0.42 * lf;
                    this.wolfPupLegs.backLeft.rotation.x = 0.75 * lf;
                    this.wolfPupLegs.backRight.rotation.x = 0.75 * lf;
                    this.wolfPupHead.rotation.x = 0.12 * lf + Math.sin(t * 1.8) * 0.04;
                    this.wolfPupHead.rotation.y = Math.sin(t * 1.1) * (0.06 - lf * 0.03);
                    this.wolfPupHead.rotation.z = Math.sin(t * 1.4) * (0.03 - lf * 0.015);
                }
            }
        } else {
            // 成年黑狼王者動態
            const breathe = Math.sin(t * 2.2) * 0.012;
            this.wolfAdultGroup.position.y = 0.78 + breathe;

            // 沉穩長尾擺動
            const tailSway = Math.sin(t * (isHowling ? 10 : 3.5)) * (isHowling ? 0.45 : 0.2);
            this.wolfAdultTailBase.rotation.y = tailSway;

            if (isHowling) {
                // 🌕 經典仰天長嘯（Wolf Howl）動作！
                this.wolfAdultNeck.rotation.x = -0.25;
                this.wolfAdultHead.rotation.x = -0.65;
                this.wolfAdultJaw.rotation.x = 0.35 + Math.sin(t * 8) * 0.06; // 張嘴嗷嗚
                this.wolfAdultLegs.frontLeft.rotation.x = 0.2;
                this.wolfAdultLegs.frontRight.rotation.x = 0.2;
            } else if (this.currentState === 'pet') {
                this.wolfAdultHead.rotation.x = -0.15;
                this.wolfAdultHead.rotation.z = 0.1;
                this.wolfAdultJaw.rotation.x = 0.0;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            } else if (this.currentState === 'sleep') {
                this.wolfAdultGroup.position.y = 0.55;
                this.wolfAdultHead.rotation.x = 0.25;
                this.wolfAdultJaw.rotation.x = 0.0;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    const wc = this.autonomy.walkCycle;
                    this.wolfAdultGroup.position.y = 0.78 + Math.abs(Math.sin(wc * 2)) * 0.04;
                    this.wolfAdultLegs.frontLeft.rotation.x = Math.sin(wc) * 0.45;
                    this.wolfAdultLegs.frontRight.rotation.x = -Math.sin(wc) * 0.45;
                    this.wolfAdultLegs.backLeft.rotation.x = -Math.sin(wc) * 0.45;
                    this.wolfAdultLegs.backRight.rotation.x = Math.sin(wc) * 0.45;
                    this.wolfAdultHead.rotation.x = Math.sin(wc * 2) * 0.04;
                    this.wolfAdultHead.rotation.y = 0;
                    this.wolfAdultHead.rotation.z = 0;
                } else {
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.wolfAdultGroup.position.y = THREE.MathUtils.lerp(0.78, 0.46, lf) + Math.sin(t * (2.0 - lf * 0.6)) * 0.01;
                    this.wolfAdultLegs.frontLeft.rotation.x = -0.45 * lf;
                    this.wolfAdultLegs.frontRight.rotation.x = -0.45 * lf;
                    this.wolfAdultLegs.backLeft.rotation.x = 0.8 * lf;
                    this.wolfAdultLegs.backRight.rotation.x = 0.8 * lf;
                    this.wolfAdultNeck.rotation.x = 0.15 * lf;
                    this.wolfAdultHead.rotation.x = 0.12 * lf + Math.sin(t * 1.5) * 0.03;
                    this.wolfAdultHead.rotation.y = Math.sin(t * 0.9) * (0.05 - lf * 0.025);
                    this.wolfAdultHead.rotation.z = 0;
                }
                this.wolfAdultJaw.rotation.x = 0.0;
            }
        }
    }

    resetWolfPupLegs() {
        if (!this.wolfPupLegs) return;
        Object.keys(this.wolfPupLegs).forEach(k => this.wolfPupLegs[k].rotation.set(0, 0, 0));
    }

    resetWolfAdultLegs() {
        if (!this.wolfAdultLegs) return;
        Object.keys(this.wolfAdultLegs).forEach(k => this.wolfAdultLegs[k].rotation.set(0, 0, 0));
    }

    // ==========================================
    // 7. 斑鬣狗（Spotted Hyena / 獵狗）雙形態系統
    // ==========================================
    buildHyenaMesh() {
        this.hyenaStage = 'baby'; // 'baby' | 'adult'
        this.hyenaRoot = new THREE.Group();
        this.root.add(this.hyenaRoot);

        // 為配件系統建立容錯節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.tailBase = new THREE.Group();
        this.legs = { frontLeft: new THREE.Group(), frontRight: new THREE.Group(), backLeft: new THREE.Group(), backRight: new THREE.Group() };
        this.tongue = new THREE.Group();
        this.snout = new THREE.Group();
        this.hyenaRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼崽期：深焦褐炭灰毛茸小鬣狗崽 (參考圖 1)
        this.buildHyenaCubMesh();

        // 2. 成年期：非洲草原斑鬣狗王 (前臂長、後腿短、斑點毛皮、高聳斜背 - 參考圖 2)
        this.buildHyenaAdultMesh();

        // 預設呈現幼崽期
        this.updateHyenaStage('baby');
    }

    // 1. 幼崽期：深焦黑褐絨毛幼崽（參考圖 1：深色毛皮、米黃臉頰、大圓闊耳、好奇眼神）
    buildHyenaCubMesh() {
        this.hyenaCubGroup = new THREE.Group();
        this.hyenaCubGroup.name = 'HyenaCubGroup';
        this.hyenaCubGroup.position.set(0, 0.62, 0);
        this.hyenaRoot.add(this.hyenaCubGroup);

        // 幼崽微斜背身軀 (前高後低)
        const cubTorsoGeo = new THREE.SphereGeometry(0.38, 18, 18);
        cubTorsoGeo.scale(0.95, 1.05, 1.25);
        const cubTorso = new THREE.Mesh(cubTorsoGeo, this.matHyenaCubCoat);
        cubTorso.position.set(0, 0.04, 0.06);
        cubTorso.rotation.x = -0.16; // 標誌性前高後低初顯
        cubTorso.castShadow = true;
        this.hyenaCubGroup.add(cubTorso);

        const cubHips = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), this.matHyenaCubCoat);
        cubHips.scale.set(0.85, 0.85, 1.05);
        cubHips.position.set(0, -0.06, -0.22);
        cubHips.castShadow = true;
        this.hyenaCubGroup.add(cubHips);

        // 幼崽頸部與頭部
        const cubNeck = new THREE.Group();
        cubNeck.position.set(0, 0.22, 0.38);
        this.hyenaCubGroup.add(cubNeck);
        this.hyenaCubNeck = cubNeck;

        const cubHead = new THREE.Group();
        cubNeck.add(cubHead);
        this.hyenaCubHead = cubHead;

        // 幼崽圓頭顱
        const headGeo = new THREE.SphereGeometry(0.42, 18, 18);
        headGeo.scale(1.02, 0.96, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matHyenaCubCoat);
        headMesh.position.set(0, 0.24, 0.08);
        headMesh.castShadow = true;
        cubHead.add(headMesh);

        // 幼崽淺米黃面部柔毛面罩 (參考圖 1 特徵：臉面與眼周為淺米黃色)
        const maskGeo = new THREE.SphereGeometry(0.34, 16, 16);
        maskGeo.scale(0.96, 0.82, 0.75);
        const maskMesh = new THREE.Mesh(maskGeo, this.matHyenaCubFace);
        maskMesh.position.set(0, 0.21, 0.26);
        cubHead.add(maskMesh);

        // 幼崽小肉頰
        const cheekGeo = new THREE.SphereGeometry(0.2, 12, 12);
        cheekGeo.scale(0.9, 0.7, 0.8);
        const cheekL = new THREE.Mesh(cheekGeo, this.matHyenaCubFace);
        cheekL.position.set(-0.22, 0.16, 0.24);
        const cheekR = new THREE.Mesh(cheekGeo, this.matHyenaCubFace);
        cheekR.position.set(0.22, 0.16, 0.24);
        cubHead.add(cheekL, cheekR);

        // 幼崽深黑吻部
        const snoutGeo = new THREE.ConeGeometry(0.18, 0.32, 16);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(1.0, 0.82, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matHyenaMuzzle);
        snoutMesh.position.set(0, 0.12, 0.36);
        snoutMesh.castShadow = true;
        cubHead.add(snoutMesh);

        // 濕潤黑鼻頭
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), this.matNose);
        noseMesh.scale.set(1.25, 0.9, 1.1);
        noseMesh.position.set(0, 0.14, 0.52);
        cubHead.add(noseMesh);

        // 靈動純真黑曜石眼眸
        const eyeRadius = 0.12;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.075, 10, 10);
        const shine1Geo = new THREE.SphereGeometry(0.042, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.02, 8, 8);

        this.hyenaCubEyeL = new THREE.Group();
        this.hyenaCubEyeL.position.set(-0.19, 0.28, 0.44);
        const irisL = new THREE.Mesh(eyeGeo, this.matHyenaAmberEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.07);
        const s1L = new THREE.Mesh(shine1Geo, this.matShine);
        s1L.position.set(-0.035, 0.04, 0.105);
        const s2L = new THREE.Mesh(shine2Geo, this.matShine);
        s2L.position.set(0.03, -0.03, 0.105);
        this.hyenaCubEyeL.add(irisL, pupilL, s1L, s2L);
        cubHead.add(this.hyenaCubEyeL);

        this.hyenaCubEyeR = new THREE.Group();
        this.hyenaCubEyeR.position.set(0.19, 0.28, 0.44);
        const irisR = new THREE.Mesh(eyeGeo, this.matHyenaAmberEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.07);
        const s1R = new THREE.Mesh(shine1Geo, this.matShine);
        s1R.position.set(-0.035, 0.04, 0.105);
        const s2R = new THREE.Mesh(shine2Geo, this.matShine);
        s2R.position.set(0.03, -0.03, 0.105);
        this.hyenaCubEyeR.add(irisR, pupilR, s1R, s2R);
        cubHead.add(this.hyenaCubEyeR);

        // 幼崽招牌闊圓大耳 (Round Cup Ears - 參考圖 1)
        const earGeo = new THREE.SphereGeometry(0.2, 14, 14);
        earGeo.scale(0.9, 1.25, 0.35);

        this.hyenaCubEarLPivot = new THREE.Group();
        this.hyenaCubEarLPivot.position.set(-0.28, 0.54, 0.06);
        this.hyenaCubEarLPivot.rotation.z = 0.26;
        this.hyenaCubEarLPivot.rotation.x = -0.1;
        const earL = new THREE.Mesh(earGeo, this.matHyenaCubCoat);
        earL.position.set(0, 0.16, 0);
        this.hyenaCubEarLPivot.add(earL);
        const inL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), this.matHyenaCubFace);
        inL.scale.set(0.85, 1.15, 0.3);
        inL.position.set(0.01, 0.15, 0.05);
        this.hyenaCubEarLPivot.add(inL);
        cubHead.add(this.hyenaCubEarLPivot);

        this.hyenaCubEarRPivot = new THREE.Group();
        this.hyenaCubEarRPivot.position.set(0.28, 0.54, 0.06);
        this.hyenaCubEarRPivot.rotation.z = -0.26;
        this.hyenaCubEarRPivot.rotation.x = -0.1;
        const earR = new THREE.Mesh(earGeo, this.matHyenaCubCoat);
        earR.position.set(0, 0.16, 0);
        earR.scale.x = -1;
        this.hyenaCubEarRPivot.add(earR);
        const inR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), this.matHyenaCubFace);
        inR.scale.set(0.85, 1.15, 0.3);
        inR.position.set(-0.01, 0.15, 0.05);
        this.hyenaCubEarRPivot.add(inR);
        cubHead.add(this.hyenaCubEarRPivot);

        // 幼崽四肢（前肢長 0.44、後肢短 0.34，初顯前長後短）
        this.hyenaCubLegs = {};
        const frontH = 0.44;
        const backH = 0.34;
        const legRadius = 0.088;

        const createCubLeg = (name, x, y, z, h) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, z);
            const limb = new THREE.Mesh(new THREE.CylinderGeometry(legRadius * 0.9, legRadius, h, 10), this.matHyenaCubCoat);
            limb.position.set(0, -h * 0.5, 0);
            limb.castShadow = true;
            pivot.add(limb);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), this.matHyenaCubCoat);
            paw.scale.set(1.0, 0.55, 1.25);
            paw.position.set(0, -h, 0.04);
            paw.castShadow = true;
            pivot.add(paw);
            this.hyenaCubGroup.add(pivot);
            this.hyenaCubLegs[name] = pivot;
        };
        // 前肢 pivot 在 y = -0.06，伸至 y = -0.50
        createCubLeg('frontLeft', -0.18, -0.06, 0.24, frontH);
        createCubLeg('frontRight', 0.18, -0.06, 0.24, frontH);
        // 後腿 pivot 在 y = -0.16，伸至 y = -0.50
        createCubLeg('backLeft', -0.18, -0.16, -0.22, backH);
        createCubLeg('backRight', 0.18, -0.16, -0.22, backH);

        // 幼崽小尾巴
        this.hyenaCubTailBase = new THREE.Group();
        this.hyenaCubTailBase.position.set(0, 0.02, -0.34);
        this.hyenaCubTailBase.rotation.x = -0.65;
        const tailGeo = new THREE.ConeGeometry(0.08, 0.35, 10);
        tailGeo.translate(0, 0.15, 0);
        const tailMesh = new THREE.Mesh(tailGeo, this.matHyenaCubCoat);
        tailMesh.castShadow = true;
        this.hyenaCubTailBase.add(tailMesh);
        this.hyenaCubGroup.add(this.hyenaCubTailBase);
    }

    // 2. 成年期：非洲草原斑鬣狗王（前肢長後腿較短・斜背・全身深褐斑點・高聳肩背・背脊短鬃毛 - 參考圖 2）
    buildHyenaAdultMesh() {
        this.hyenaAdultGroup = new THREE.Group();
        this.hyenaAdultGroup.name = 'HyenaAdultGroup';
        this.hyenaAdultGroup.position.set(0, 0.72, 0);
        this.hyenaRoot.add(this.hyenaAdultGroup);

        // 2.1 強壯高聳肩背與向下傾斜的經典鬣狗軀幹 (Sloping Muscular Torso)
        const chestGeo = new THREE.SphereGeometry(0.44, 18, 18);
        chestGeo.scale(1.06, 1.16, 1.25);
        const chestMesh = new THREE.Mesh(chestGeo, this.matHyenaAdultCoat);
        chestMesh.position.set(0, 0.16, 0.14);
        chestMesh.rotation.x = -0.22; // 招牌向後傾斜高聳肩胛！
        chestMesh.castShadow = true;
        this.hyenaAdultGroup.add(chestMesh);

        // 收緊的後傾腹部與低矮臀部
        const hipsGeo = new THREE.SphereGeometry(0.35, 16, 16);
        hipsGeo.scale(0.85, 0.9, 1.1);
        const hipsMesh = new THREE.Mesh(hipsGeo, this.matHyenaAdultCoat);
        hipsMesh.position.set(0, -0.06, -0.28);
        hipsMesh.rotation.x = -0.15;
        hipsMesh.castShadow = true;
        this.hyenaAdultGroup.add(hipsMesh);

        // 2.2 背脊立體深色鬃毛脊 (Dorsal Crest Ridge - 沿著高聳肩胛向下斜坡背部生長)
        const crestGeo = new THREE.ConeGeometry(0.065, 0.22, 8);
        for (let i = 0; i < 7; i++) {
            const ridge = new THREE.Mesh(crestGeo, this.matHyenaMane);
            const frac = i / 6;
            // 沿著前高後低的脊椎外表面排列 (高處 y=0.64 延伸至臀部 y=0.28)
            const ry = 0.63 - frac * 0.35;
            const rz = 0.32 - frac * 0.55;
            ridge.position.set(0, ry, rz);
            ridge.rotation.x = -0.32; // 順著背脊向下傾斜
            ridge.scale.set(0.9, 1.0 - frac * 0.25, 1.3);
            this.hyenaAdultGroup.add(ridge);
        }

        // 2.3 斑鬣狗全身經典斑點群 (Spotted Coat Markings - 貼合高肩低臀曲面)
        const spotGeo = new THREE.SphereGeometry(1, 10, 10);
        const spotList = [
            // 高聳肩胛與頸側斑點 (x 貼合 chest 表面 ~0.43)
            [-0.43, 0.26, 0.20, 0.055], [0.43, 0.26, 0.20, 0.055],
            [-0.44, 0.16, 0.28, 0.06],  [0.44, 0.16, 0.28, 0.06],
            [-0.42, 0.06, 0.18, 0.05],  [0.42, 0.06, 0.18, 0.05],
            [-0.38, 0.36, 0.10, 0.048], [0.38, 0.36, 0.10, 0.048],
            // 肋腹兩側斑點 (x 貼合 waist 表面 ~0.34)
            [-0.34, 0.18, -0.02, 0.065], [0.34, 0.18, -0.02, 0.065],
            [-0.35, 0.06, -0.08, 0.06],  [0.35, 0.06, -0.08, 0.06],
            [-0.33, -0.04, 0.02, 0.055], [0.33, -0.04, 0.02, 0.055],
            [-0.32, 0.22, -0.12, 0.05],  [0.32, 0.22, -0.12, 0.05],
            // 臀部與後大腿斑點 (x 貼合 hips 表面 ~0.33)
            [-0.33, 0.08, -0.24, 0.06],  [0.33, 0.08, -0.24, 0.06],
            [-0.34, -0.04, -0.28, 0.055], [0.34, -0.04, -0.28, 0.055],
            [-0.28, -0.15, -0.34, 0.05],  [0.28, -0.15, -0.34, 0.05],
            [-0.24, -0.24, -0.28, 0.045], [0.24, -0.24, -0.28, 0.045],
            // 頸項下側斑點
            [-0.28, 0.40, 0.36, 0.045], [0.28, 0.40, 0.36, 0.045]
        ];
        spotList.forEach(([sx, sy, sz, sr]) => {
            const spot = new THREE.Mesh(spotGeo, this.matHyenaSpots);
            spot.scale.set(sr * 1.3, sr * 1.1, sr * 0.45);
            spot.position.set(sx, sy, sz);
            spot.rotation.y = (sx > 0 ? -1 : 1) * 0.45;
            this.hyenaAdultGroup.add(spot);
        });

        // 2.4 頸部與強壯頭部 (Arched Muscular Neck & Broad Head)
        const adultNeck = new THREE.Group();
        adultNeck.position.set(0, 0.32, 0.40);
        this.hyenaAdultGroup.add(adultNeck);
        this.hyenaAdultNeck = adultNeck;

        const adultHead = new THREE.Group();
        adultNeck.add(adultHead);
        this.hyenaAdultHead = adultHead;

        // 結實粗壯頭顱
        const headGeo = new THREE.SphereGeometry(0.42, 18, 18);
        headGeo.scale(1.02, 0.96, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matHyenaAdultCoat);
        headMesh.position.set(0, 0.24, 0.08);
        headMesh.castShadow = true;
        adultHead.add(headMesh);

        // 粗壯有力深黑褐吻部 (Heavy Powerful Muzzle - 參考圖 2)
        const adultSnout = new THREE.Group();
        adultSnout.position.set(0, 0.15, 0.40);
        adultHead.add(adultSnout);

        const snoutGeo = new THREE.ConeGeometry(0.21, 0.40, 16);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(1.0, 0.85, 1.0);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matHyenaMuzzle);
        snoutMesh.position.set(0, 0.01, 0.16);
        snoutMesh.castShadow = true;
        adultSnout.add(snoutMesh);

        // 鼻樑微拱
        const bridgeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 12), this.matHyenaMuzzle);
        bridgeMesh.rotateX(Math.PI / 2);
        bridgeMesh.scale.set(0.85, 0.45, 1.0);
        bridgeMesh.position.set(0, 0.06, 0.15);
        adultSnout.add(bridgeMesh);

        // 黑色大鼻頭
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), this.matNose);
        noseMesh.scale.set(1.3, 0.9, 1.1);
        noseMesh.position.set(0, 0.035, 0.36);
        adultSnout.add(noseMesh);

        // 咯咯大笑專屬下顎 (Laughing Jaw with Teeth & Tongue)
        this.hyenaAdultJaw = new THREE.Group();
        this.hyenaAdultJaw.position.set(0, -0.05, 0.14);
        const chinGeo = new THREE.SphereGeometry(0.14, 12, 12);
        chinGeo.scale(0.9, 0.58, 1.15);
        const jawMesh = new THREE.Mesh(chinGeo, this.matHyenaMuzzle);
        jawMesh.position.set(0, -0.02, 0.06);
        this.hyenaAdultJaw.add(jawMesh);
        const jawTongue = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.14), this.matTongue);
        jawTongue.position.set(0, 0.02, 0.06);
        this.hyenaAdultJaw.add(jawTongue);
        adultSnout.add(this.hyenaAdultJaw);

        // 2.5 靈動深邃琥珀大眼 (Amber Eyes)
        const eyeRadius = 0.12;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.065, 10, 10);
        const shine1Geo = new THREE.SphereGeometry(0.042, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.02, 8, 8);

        this.hyenaAdultEyeL = new THREE.Group();
        this.hyenaAdultEyeL.position.set(-0.20, 0.31, 0.46);
        this.hyenaAdultEyeL.rotation.y = -0.16;
        const irisL = new THREE.Mesh(eyeGeo, this.matHyenaAmberEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.07);
        const s1L = new THREE.Mesh(shine1Geo, this.matShine);
        s1L.position.set(-0.035, 0.04, 0.105);
        const s2L = new THREE.Mesh(shine2Geo, this.matShine);
        s2L.position.set(0.03, -0.03, 0.105);
        this.hyenaAdultEyeL.add(irisL, pupilL, s1L, s2L);
        adultHead.add(this.hyenaAdultEyeL);

        this.hyenaAdultEyeR = new THREE.Group();
        this.hyenaAdultEyeR.position.set(0.20, 0.31, 0.46);
        this.hyenaAdultEyeR.rotation.y = 0.16;
        const irisR = new THREE.Mesh(eyeGeo, this.matHyenaAmberEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.07);
        const s1R = new THREE.Mesh(shine1Geo, this.matShine);
        s1R.position.set(-0.035, 0.04, 0.105);
        const s2R = new THREE.Mesh(shine2Geo, this.matShine);
        s2R.position.set(0.03, -0.03, 0.105);
        this.hyenaAdultEyeR.add(irisR, pupilR, s1R, s2R);
        adultHead.add(this.hyenaAdultEyeR);

        // 2.6 招牌寬圓杯狀立耳 (Iconic Rounded Ears - 參考圖 2)
        const adultEarGeo = new THREE.SphereGeometry(0.22, 16, 16);
        adultEarGeo.scale(0.9, 1.25, 0.32);

        this.hyenaAdultEarLPivot = new THREE.Group();
        this.hyenaAdultEarLPivot.position.set(-0.28, 0.58, 0.08);
        this.hyenaAdultEarLPivot.rotation.z = 0.28;
        this.hyenaAdultEarLPivot.rotation.x = -0.12;
        const earL = new THREE.Mesh(adultEarGeo, this.matHyenaAdultCoat);
        earL.position.set(0, 0.18, 0);
        this.hyenaAdultEarLPivot.add(earL);
        const inL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.matHyenaInnerEar);
        inL.scale.set(0.85, 1.15, 0.28);
        inL.position.set(0.01, 0.16, 0.05);
        this.hyenaAdultEarLPivot.add(inL);
        adultHead.add(this.hyenaAdultEarLPivot);

        this.hyenaAdultEarRPivot = new THREE.Group();
        this.hyenaAdultEarRPivot.position.set(0.28, 0.58, 0.08);
        this.hyenaAdultEarRPivot.rotation.z = -0.28;
        this.hyenaAdultEarRPivot.rotation.x = -0.12;
        const earR = new THREE.Mesh(adultEarGeo, this.matHyenaAdultCoat);
        earR.position.set(0, 0.18, 0);
        earR.scale.x = -1;
        this.hyenaAdultEarRPivot.add(earR);
        const inR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.matHyenaInnerEar);
        inR.scale.set(0.85, 1.15, 0.28);
        inR.position.set(-0.01, 0.16, 0.05);
        this.hyenaAdultEarRPivot.add(inR);
        adultHead.add(this.hyenaAdultEarRPivot);

        // 2.7 核心需求：【前臂長、後腿較短】(Long Forelimbs, Shorter Hind Legs)
        this.hyenaAdultLegs = {};
        const frontH = 0.65; // 長前臂！
        const backH = 0.45;  // 較短後腿！
        const legRadius = 0.092;

        const createAdultLeg = (name, x, y, z, h) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, z);
            const limb = new THREE.Mesh(new THREE.CylinderGeometry(legRadius * 0.88, legRadius, h, 12), this.matHyenaAdultCoat);
            limb.position.set(0, -h * 0.5, 0);
            limb.castShadow = true;
            pivot.add(limb);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), this.matHyenaAdultCoat);
            paw.scale.set(1.0, 0.55, 1.35);
            paw.position.set(0, -h, 0.05);
            paw.castShadow = true;
            pivot.add(paw);
            this.hyenaAdultGroup.add(pivot);
            this.hyenaAdultLegs[name] = pivot;
        };
        // 前肢 pivot 在高肩部 y = 0.08，前臂長度 0.65，延伸至 y = -0.57
        createAdultLeg('frontLeft', -0.21, 0.08, 0.28, frontH);
        createAdultLeg('frontRight', 0.21, 0.08, 0.28, frontH);
        // 後腿 pivot 在低臀部 y = -0.12，後腿較短 0.45，延伸至 y = -0.57
        createAdultLeg('backLeft', -0.20, -0.12, -0.28, backH);
        createAdultLeg('backRight', 0.20, -0.12, -0.28, backH);

        // 2.8 黑尖長毛鬣狗尾
        this.hyenaAdultTailBase = new THREE.Group();
        this.hyenaAdultTailBase.position.set(0, 0.04, -0.44);
        this.hyenaAdultTailBase.rotation.x = -0.65;
        const tailGeo0 = new THREE.ConeGeometry(0.12, 0.52, 12);
        tailGeo0.translate(0, -0.22, 0);
        tailGeo0.rotateX(Math.PI);
        const tailMesh0 = new THREE.Mesh(tailGeo0, this.matHyenaMane); // 黑深色毛尾
        tailMesh0.castShadow = true;
        this.hyenaAdultTailBase.add(tailMesh0);
        this.hyenaAdultGroup.add(this.hyenaAdultTailBase);
    }

    updateHyenaStage(stage = 'baby') {
        this.hyenaStage = stage;
        if (stage === 'adult') {
            this.hyenaCubGroup.visible = false;
            this.hyenaAdultGroup.visible = true;
            this.eyeLeft = this.hyenaAdultEyeL;
            this.eyeRight = this.hyenaAdultEyeR;
            this.earLeftPivot = this.hyenaAdultEarLPivot;
            this.earRightPivot = this.hyenaAdultEarRPivot;
            this.head = this.hyenaAdultHead;
        } else {
            this.hyenaCubGroup.visible = true;
            this.hyenaAdultGroup.visible = false;
            this.eyeLeft = this.hyenaCubEyeL;
            this.eyeRight = this.hyenaCubEyeR;
            this.earLeftPivot = this.hyenaCubEarLPivot;
            this.earRightPivot = this.hyenaCubEarRPivot;
            this.head = this.hyenaCubHead;
        }
    }

    updateHyena(delta, elapsedTime) {
        const t = elapsedTime;
        this.updateCanineAutonomy(delta, elapsedTime);

        // 眨眼
        this.nextBlinkTime -= delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.5 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        }

        // 耳朵微動
        const earBob = Math.sin(t * 3.5) * 0.05;
        if (this.earLeftPivot) this.earLeftPivot.rotation.x = -0.12 + earBob;
        if (this.earRightPivot) this.earRightPivot.rotation.x = -0.12 - earBob;

        // 🦴 招牌魔性笑聲（Hyena Laugh & Chitter）
        const isLaughing = (this.currentState === 'happy' || this.currentState === 'howl' || this.currentState === 'bark');

        if (this.hyenaStage === 'baby') {
            const breathe = Math.sin(t * 2.8) * 0.012;
            this.hyenaCubGroup.position.y = 0.62 + breathe;

            const wag = Math.sin(t * (isLaughing ? 18 : 6)) * (isLaughing ? 0.5 : 0.3);
            this.hyenaCubTailBase.rotation.y = wag;

            if (isLaughing) {
                this.hyenaCubHead.rotation.x = -0.25;
                this.hyenaCubHead.rotation.z = Math.sin(t * 20) * 0.08; // 歡快咯咯笑微抖
                this.hyenaCubLegs.frontLeft.rotation.x = 0.12;
                this.hyenaCubLegs.frontRight.rotation.x = 0.12;
            } else if (this.currentState === 'pet') {
                this.hyenaCubHead.rotation.x = -0.15;
                this.hyenaCubHead.rotation.z = 0.12;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            } else if (this.currentState === 'sleep') {
                this.hyenaCubGroup.position.y = 0.40;
                this.hyenaCubHead.rotation.x = 0.22;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    const wc = this.autonomy.walkCycle;
                    this.hyenaCubGroup.position.y = 0.62 + Math.abs(Math.sin(wc * 2)) * 0.03;
                    this.hyenaCubLegs.frontLeft.rotation.x = Math.sin(wc) * 0.42;
                    this.hyenaCubLegs.frontRight.rotation.x = -Math.sin(wc) * 0.42;
                    this.hyenaCubLegs.backLeft.rotation.x = -Math.sin(wc) * 0.42;
                    this.hyenaCubLegs.backRight.rotation.x = Math.sin(wc) * 0.42;
                    this.hyenaCubHead.rotation.x = Math.sin(wc * 2) * 0.04;
                    this.hyenaCubHead.rotation.y = 0;
                    this.hyenaCubHead.rotation.z = 0;
                } else {
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.hyenaCubGroup.position.y = THREE.MathUtils.lerp(0.62, 0.35, lf) + Math.sin(t * (2.0 - lf * 0.6)) * 0.01;
                    this.hyenaCubLegs.frontLeft.rotation.x = -0.4 * lf;
                    this.hyenaCubLegs.frontRight.rotation.x = -0.4 * lf;
                    this.hyenaCubLegs.backLeft.rotation.x = 0.72 * lf;
                    this.hyenaCubLegs.backRight.rotation.x = 0.72 * lf;
                    this.hyenaCubHead.rotation.x = 0.12 * lf + Math.sin(t * 1.8) * 0.04;
                    this.hyenaCubHead.rotation.y = Math.sin(t * 1.1) * (0.05 - lf * 0.025);
                    this.hyenaCubHead.rotation.z = Math.sin(t * 1.3) * (0.03 - lf * 0.015);
                }
            }
        } else {
            // 成年斑鬣狗王者
            const breathe = Math.sin(t * 2.2) * 0.01;
            this.hyenaAdultGroup.position.y = 0.72 + breathe;

            const tailSway = Math.sin(t * (isLaughing ? 12 : 3.5)) * (isLaughing ? 0.4 : 0.18);
            this.hyenaAdultTailBase.rotation.y = tailSway;

            if (isLaughing) {
                // 經典魔性咯咯狂笑！下顎快速張合顫動
                this.hyenaAdultNeck.rotation.x = -0.15;
                this.hyenaAdultHead.rotation.x = -0.32;
                this.hyenaAdultHead.rotation.z = Math.sin(t * 24) * 0.06;
                this.hyenaAdultJaw.rotation.x = 0.28 + Math.sin(t * 24) * 0.12; // 咯咯笑張嘴顫動
                this.hyenaAdultLegs.frontLeft.rotation.x = 0.15;
                this.hyenaAdultLegs.frontRight.rotation.x = 0.15;
            } else if (this.currentState === 'pet') {
                this.hyenaAdultHead.rotation.x = -0.12;
                this.hyenaAdultHead.rotation.z = 0.1;
                this.hyenaAdultJaw.rotation.x = 0.0;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            } else if (this.currentState === 'sleep') {
                this.hyenaAdultGroup.position.y = 0.48;
                this.hyenaAdultHead.rotation.x = 0.22;
                this.hyenaAdultJaw.rotation.x = 0.0;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    const wc = this.autonomy.walkCycle;
                    this.hyenaAdultGroup.position.y = 0.72 + Math.abs(Math.sin(wc * 2)) * 0.035;
                    this.hyenaAdultLegs.frontLeft.rotation.x = Math.sin(wc) * 0.44;
                    this.hyenaAdultLegs.frontRight.rotation.x = -Math.sin(wc) * 0.44;
                    this.hyenaAdultLegs.backLeft.rotation.x = -Math.sin(wc) * 0.44;
                    this.hyenaAdultLegs.backRight.rotation.x = Math.sin(wc) * 0.44;
                    this.hyenaAdultNeck.rotation.x = 0.06 + Math.sin(wc * 2) * 0.03;
                    this.hyenaAdultHead.rotation.x = Math.sin(wc * 2) * 0.04;
                    this.hyenaAdultHead.rotation.y = 0;
                    this.hyenaAdultHead.rotation.z = 0;
                } else {
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.hyenaAdultGroup.position.y = THREE.MathUtils.lerp(0.72, 0.44, lf) + Math.sin(t * (2.0 - lf * 0.6)) * 0.01;
                    this.hyenaAdultLegs.frontLeft.rotation.x = -0.42 * lf;
                    this.hyenaAdultLegs.frontRight.rotation.x = -0.42 * lf;
                    this.hyenaAdultLegs.backLeft.rotation.x = 0.75 * lf;
                    this.hyenaAdultLegs.backRight.rotation.x = 0.75 * lf;
                    this.hyenaAdultNeck.rotation.x = 0.12 * lf;
                    this.hyenaAdultHead.rotation.x = 0.12 * lf + Math.sin(t * 1.4) * 0.03;
                    this.hyenaAdultHead.rotation.y = Math.sin(t * 0.8) * (0.04 - lf * 0.02);
                    this.hyenaAdultHead.rotation.z = 0;
                }
                this.hyenaAdultJaw.rotation.x = 0.0;
            }
        }
    }

    resetHyenaCubLegs() {
        if (!this.hyenaCubLegs) return;
        Object.keys(this.hyenaCubLegs).forEach(k => this.hyenaCubLegs[k].rotation.set(0, 0, 0));
    }

    resetHyenaAdultLegs() {
        if (!this.hyenaAdultLegs) return;
        Object.keys(this.hyenaAdultLegs).forEach(k => this.hyenaAdultLegs[k].rotation.set(0, 0, 0));
    }

    // ==========================================
    // 8. 非洲獵豹（Cheetah / 陸地極速之王）雙形態系統
    // ==========================================
    buildCheetahMesh() {
        this.cheetahStage = 'baby'; // 'baby' | 'adult'
        this.cheetahRoot = new THREE.Group();
        this.root.add(this.cheetahRoot);

        // 為配件系統建立容錯節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.tailBase = new THREE.Group();
        this.legs = { frontLeft: new THREE.Group(), frontRight: new THREE.Group(), backLeft: new THREE.Group(), backRight: new THREE.Group() };
        this.tongue = new THREE.Group();
        this.snout = new THREE.Group();
        this.cheetahRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼崽期：銀鬃披風小獵豹崽 (參考幼崽照片 2)
        this.buildCheetahCubMesh();

        // 2. 成年期：原野極速深胸細腰獵豹 (參考奔跑照片 1)
        this.buildCheetahAdultMesh();

        // 預設呈現幼崽期
        this.updateCheetahStage('baby');
    }

    // ----------------------------------------------------
    // 8.1 幼崽期：銀灰披風軟萌小獵豹崽（參考圖 2：黑淚痕、銀灰背毛披風、水汪汪大眼）
    // ----------------------------------------------------
    buildCheetahCubMesh() {
        this.cheetahCubGroup = new THREE.Group();
        this.cheetahCubGroup.position.set(0, 0.58, 0);
        this.cheetahRoot.add(this.cheetahCubGroup);

        // 幼崽身軀 (圓潤小豹體)
        const cubTorsoGeo = new THREE.SphereGeometry(0.36, 16, 16);
        cubTorsoGeo.scale(0.88, 0.95, 1.22);
        const cubTorso = new THREE.Mesh(cubTorsoGeo, this.matCheetahCoat);
        cubTorso.position.set(0, 0.02, 0.04);
        cubTorso.castShadow = true;
        this.cheetahCubGroup.add(cubTorso);

        // 幼崽淡奶白小肚皮
        const cubBellyGeo = new THREE.SphereGeometry(0.32, 14, 14);
        cubBellyGeo.scale(0.80, 0.85, 1.15);
        const cubBelly = new THREE.Mesh(cubBellyGeo, this.matCheetahBelly);
        cubBelly.position.set(0, -0.06, 0.04);
        this.cheetahCubGroup.add(cubBelly);

        // 幼崽特有標誌【銀灰蓬鬆背毛披風 (Dorsal Mantle) - 參考照片 2】
        this.cheetahCubMantle = new THREE.Group();
        this.cheetahCubMantle.position.set(0, 0.16, 0.06);
        const mantlePuffGeo = new THREE.SphereGeometry(0.16, 12, 12);
        mantlePuffGeo.scale(1.25, 0.9, 1.1);
        for (let i = 0; i < 6; i++) {
            const mat = (i % 2 === 0) ? this.matCheetahMantle : this.matCheetahMantleInner;
            const puff = new THREE.Mesh(mantlePuffGeo, mat);
            const frac = i / 5;
            puff.position.set(0, 0.14 - frac * 0.06, 0.22 - frac * 0.44);
            puff.scale.set(1.15 - frac * 0.2, 1.05 - frac * 0.15, 1.25);
            puff.castShadow = true;
            this.cheetahCubMantle.add(puff);
        }
        this.cheetahCubGroup.add(this.cheetahCubMantle);

        // 幼崽斑點群 (小圓黑斑)
        const spotGeo = new THREE.SphereGeometry(1, 8, 8);
        const cubSpotCoords = [
            [-0.30, 0.10, 0.14, 0.038], [0.30, 0.10, 0.14, 0.038],
            [-0.32, 0.00, 0.02, 0.042], [0.32, 0.00, 0.02, 0.042],
            [-0.28, -0.08, -0.10, 0.038], [0.28, -0.08, -0.10, 0.038],
            [-0.26, 0.02, -0.20, 0.035], [0.26, 0.02, -0.20, 0.035]
        ];
        cubSpotCoords.forEach(([sx, sy, sz, sr]) => {
            const spot = new THREE.Mesh(spotGeo, this.matCheetahSpots);
            spot.scale.set(sr * 1.1, sr * 1.1, sr * 0.35);
            spot.position.set(sx, sy, sz);
            spot.rotation.y = (sx > 0 ? -1 : 1) * 0.4;
            this.cheetahCubGroup.add(spot);
        });

        // 幼崽頭部 (圓萌大眼、黑淚痕、微低圓耳)
        const cubNeck = new THREE.Group();
        cubNeck.position.set(0, 0.22, 0.32);
        this.cheetahCubGroup.add(cubNeck);
        this.cheetahCubNeck = cubNeck;

        const cubHead = new THREE.Group();
        cubNeck.add(cubHead);
        this.cheetahCubHead = cubHead;

        const headGeo = new THREE.SphereGeometry(0.33, 16, 16);
        headGeo.scale(1.06, 0.98, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matCheetahCoat);
        headMesh.position.set(0, 0.18, 0.06);
        headMesh.castShadow = true;
        cubHead.add(headMesh);

        // 幼崽淡奶白下巴與吻部小墊
        const muzzleGeo = new THREE.SphereGeometry(0.18, 14, 14);
        muzzleGeo.scale(1.0, 0.75, 1.0);
        const muzzleMesh = new THREE.Mesh(muzzleGeo, this.matCheetahBelly);
        muzzleMesh.position.set(0, 0.12, 0.24);
        cubHead.add(muzzleMesh);

        // 小黑鼻
        const noseGeo = new THREE.SphereGeometry(0.048, 12, 12);
        noseGeo.scale(1.15, 0.85, 1.0);
        const noseMesh = new THREE.Mesh(noseGeo, this.matNose);
        noseMesh.position.set(0, 0.16, 0.38);
        cubHead.add(noseMesh);

        // 🌟 幼崽招牌【黑色淚痕 (Tear Tracks) - 參考照片 2】
        // 左淚痕：從內眼角沿著吻部兩側直通嘴邊
        const tearL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.20, 8), this.matCheetahTear);
        tearL.position.set(-0.11, 0.12, 0.31);
        tearL.rotation.z = -0.24;
        tearL.rotation.x = 0.35;
        cubHead.add(tearL);

        // 右淚痕
        const tearR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.20, 8), this.matCheetahTear);
        tearR.position.set(0.11, 0.12, 0.31);
        tearR.rotation.z = 0.24;
        tearR.rotation.x = 0.35;
        cubHead.add(tearR);

        // 幼崽清澈靈動大眼睛
        const eyeGeo = new THREE.SphereGeometry(0.088, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.062, 12, 12);
        const shineGeo = new THREE.SphereGeometry(0.038, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.018, 8, 8);

        this.cheetahCubEyeL = new THREE.Group();
        this.cheetahCubEyeL.position.set(-0.16, 0.24, 0.32);
        this.cheetahCubEyeL.rotation.y = -0.16;
        const irisL = new THREE.Mesh(eyeGeo, this.matCheetahAmberEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.06);
        const s1L = new THREE.Mesh(shineGeo, this.matShine);
        s1L.position.set(-0.025, 0.035, 0.095);
        const s2L = new THREE.Mesh(shine2Geo, this.matShine);
        s2L.position.set(0.025, -0.025, 0.095);
        this.cheetahCubEyeL.add(irisL, pupilL, s1L, s2L);
        cubHead.add(this.cheetahCubEyeL);

        this.cheetahCubEyeR = new THREE.Group();
        this.cheetahCubEyeR.position.set(0.16, 0.24, 0.32);
        this.cheetahCubEyeR.rotation.y = 0.16;
        const irisR = new THREE.Mesh(eyeGeo, this.matCheetahAmberEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.06);
        const s1R = new THREE.Mesh(shineGeo, this.matShine);
        s1R.position.set(-0.025, 0.035, 0.095);
        const s2R = new THREE.Mesh(shine2Geo, this.matShine);
        s2R.position.set(0.025, -0.025, 0.095);
        this.cheetahCubEyeR.add(irisR, pupilR, s1R, s2R);
        cubHead.add(this.cheetahCubEyeR);

        // 幼崽圓潤小立耳 (微向兩側傾斜)
        const cubEarGeo = new THREE.SphereGeometry(0.14, 12, 12);
        cubEarGeo.scale(1.0, 1.15, 0.35);

        this.cheetahCubEarLPivot = new THREE.Group();
        this.cheetahCubEarLPivot.position.set(-0.24, 0.44, 0.06);
        this.cheetahCubEarLPivot.rotation.z = 0.42;
        const earL = new THREE.Mesh(cubEarGeo, this.matCheetahCoat);
        this.cheetahCubEarLPivot.add(earL);
        const earInL = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), this.matCheetahBelly);
        earInL.scale.set(0.9, 1.0, 0.3);
        earInL.position.set(0.01, 0, 0.03);
        this.cheetahCubEarLPivot.add(earInL);
        cubHead.add(this.cheetahCubEarLPivot);

        this.cheetahCubEarRPivot = new THREE.Group();
        this.cheetahCubEarRPivot.position.set(0.24, 0.44, 0.06);
        this.cheetahCubEarRPivot.rotation.z = -0.42;
        const earR = new THREE.Mesh(cubEarGeo, this.matCheetahCoat);
        this.cheetahCubEarRPivot.add(earR);
        const earInR = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), this.matCheetahBelly);
        earInR.scale.set(0.9, 1.0, 0.3);
        earInR.position.set(-0.01, 0, 0.03);
        this.cheetahCubEarRPivot.add(earInR);
        cubHead.add(this.cheetahCubEarRPivot);

        // 幼崽小短腿 (細巧萌爪)
        this.cheetahCubLegs = {};
        const legPos = [
            { key: 'frontLeft', x: -0.13, y: -0.04, z: 0.16 },
            { key: 'frontRight', x: 0.13, y: -0.04, z: 0.16 },
            { key: 'backLeft', x: -0.12, y: -0.06, z: -0.18 },
            { key: 'backRight', x: 0.12, y: -0.06, z: -0.18 }
        ];
        const cubLegGeo = new THREE.CylinderGeometry(0.045, 0.036, 0.40, 12);
        const pawGeo = new THREE.SphereGeometry(0.055, 12, 12);
        pawGeo.scale(0.9, 0.50, 1.2);

        legPos.forEach(p => {
            const pivot = new THREE.Group();
            pivot.position.set(p.x, p.y, p.z);
            const legMesh = new THREE.Mesh(cubLegGeo, this.matCheetahCoat);
            legMesh.position.y = -0.20;
            legMesh.castShadow = true;
            pivot.add(legMesh);

            // 小爪掌
            const paw = new THREE.Mesh(pawGeo, this.matCheetahCoat);
            paw.position.set(0, -0.38, 0.04);
            pivot.add(paw);

            this.cheetahCubGroup.add(pivot);
            this.cheetahCubLegs[p.key] = pivot;
        });

        // 幼崽細長靈動小尾巴
        this.cheetahCubTailBase = new THREE.Group();
        this.cheetahCubTailBase.position.set(0, 0.06, -0.28);
        const tailGeo = new THREE.CylinderGeometry(0.032, 0.022, 0.45, 10);
        const tailMesh = new THREE.Mesh(tailGeo, this.matCheetahCoat);
        tailMesh.position.set(0, -0.18, -0.12);
        tailMesh.rotation.x = -0.55;
        this.cheetahCubTailBase.add(tailMesh);
        this.cheetahCubGroup.add(this.cheetahCubTailBase);
    }

    // ----------------------------------------------------
    // 8.2 成年期：非洲原野極速深胸細腰獵豹（極致瘦削、修長優雅四肢、流線一體身軀）
    // ----------------------------------------------------
    buildCheetahAdultMesh() {
        this.cheetahAdultGroup = new THREE.Group();
        this.cheetahAdultGroup.position.set(0, 0.70, 0);
        this.cheetahRoot.add(this.cheetahAdultGroup);

        // 1. 流線一體型深胸細腰身軀 (Continuous Aerodynamic Feline Torso - 極致流暢無接縫)
        // 核心主軀幹：連續平滑的流線型貓科脊柱與腰身
        const torsoGeo = new THREE.SphereGeometry(0.24, 20, 20);
        torsoGeo.scale(0.56, 0.94, 1.90); // 窄扁、深沈、修長流線形
        const torsoMesh = new THREE.Mesh(torsoGeo, this.matCheetahCoat);
        torsoMesh.position.set(0, 0.14, -0.06);
        torsoMesh.castShadow = true;
        this.cheetahAdultGroup.add(torsoMesh);

        // 深前胸腔 (Deep Ribcage - 增加獵豹标志性的大肺活量深胸廓)
        const chestGeo = new THREE.SphereGeometry(0.22, 16, 16);
        chestGeo.scale(0.56, 1.15, 1.05);
        const chestMesh = new THREE.Mesh(chestGeo, this.matCheetahCoat);
        chestMesh.position.set(0, 0.12, 0.20);
        chestMesh.castShadow = true;
        this.cheetahAdultGroup.add(chestMesh);

        // 腹底淡奶白毛色 (Pale Creamy Underbelly Fluff)
        const bellyGeo = new THREE.SphereGeometry(0.21, 16, 16);
        bellyGeo.scale(0.50, 0.75, 1.55);
        const bellyMesh = new THREE.Mesh(bellyGeo, this.matCheetahBelly);
        bellyMesh.position.set(0, 0.06, -0.02);
        this.cheetahAdultGroup.add(bellyMesh);

        // 2. 貼合瘦長流線身軀的實心純黑圓斑點群 (Solid Black Spots - 參考照片 1)
        const spotGeo = new THREE.SphereGeometry(1, 8, 8);
        const adultSpots = [
            // 肩胛與深胸兩側 (x 貼合 ~0.13 - 0.14)
            [-0.135, 0.24, 0.22, 0.034], [0.135, 0.24, 0.22, 0.034],
            [-0.140, 0.14, 0.28, 0.035], [0.140, 0.14, 0.28, 0.035],
            [-0.130, 0.04, 0.16, 0.030], [0.130, 0.04, 0.16, 0.030],
            [-0.135, 0.26, 0.08, 0.033], [0.135, 0.26, 0.08, 0.033],
            // 極細腰腹兩側 (x 貼合 ~0.12 - 0.13)
            [-0.130, 0.18, -0.04, 0.033], [0.130, 0.18, -0.04, 0.033],
            [-0.128, 0.09, -0.14, 0.032], [0.128, 0.09, -0.14, 0.032],
            [-0.120, 0.03, -0.08, 0.028], [0.120, 0.03, -0.08, 0.028],
            [-0.125, 0.16, -0.24, 0.032], [0.125, 0.16, -0.24, 0.032],
            // 緊實後臀兩側 (x 貼合 ~0.12 - 0.13)
            [-0.125, 0.15, -0.34, 0.034], [0.125, 0.15, -0.34, 0.034],
            [-0.118, 0.06, -0.42, 0.030], [0.118, 0.06, -0.42, 0.030],
            // 脊背中線兩側
            [-0.055, 0.32, 0.14, 0.028], [0.055, 0.32, 0.14, 0.028],
            [-0.050, 0.28, -0.08, 0.028], [0.050, 0.28, -0.08, 0.028],
            [-0.050, 0.24, -0.28, 0.026], [0.050, 0.24, -0.28, 0.026]
        ];
        adultSpots.forEach(([sx, sy, sz, sr]) => {
            const spot = new THREE.Mesh(spotGeo, this.matCheetahSpots);
            spot.scale.set(sr * 1.05, sr * 1.05, sr * 0.30);
            spot.position.set(sx, sy, sz);
            spot.rotation.y = (sx > 0 ? -1 : 1) * 0.45;
            this.cheetahAdultGroup.add(spot);
        });

        // 3. 修長優雅頸部與流線型小頭部 (Forward-Focused Aerodynamic Head)
        const adultNeck = new THREE.Group();
        adultNeck.position.set(0, 0.20, 0.34);
        this.cheetahAdultGroup.add(adultNeck);
        this.cheetahAdultNeck = adultNeck;

        // 昂首前望的優雅柔和圓潤頸項 (無生硬圓柱斷面)
        const neckMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), this.matCheetahCoat);
        neckMesh.scale.set(0.68, 1.48, 0.82);
        neckMesh.rotation.x = -0.48;
        neckMesh.position.set(0, 0.10, 0.06);
        neckMesh.castShadow = true;
        adultNeck.add(neckMesh);

        const adultHead = new THREE.Group();
        adultHead.position.set(0, 0.18, 0.18);
        adultNeck.add(adultHead);
        this.cheetahAdultHead = adultHead;

        // 獵豹精巧流線小頭
        const headGeo = new THREE.SphereGeometry(0.24, 18, 18);
        headGeo.scale(0.92, 0.90, 1.08);
        const headMesh = new THREE.Mesh(headGeo, this.matCheetahCoat);
        headMesh.position.set(0, 0.10, 0.06);
        headMesh.castShadow = true;
        adultHead.add(headMesh);

        // 吻部淡奶白毛皮與下顎
        const snoutGeo = new THREE.SphereGeometry(0.12, 14, 14);
        snoutGeo.scale(0.92, 0.72, 1.15);
        const snoutMesh = new THREE.Mesh(snoutGeo, this.matCheetahBelly);
        snoutMesh.position.set(0, 0.06, 0.20);
        adultHead.add(snoutMesh);

        // 精緻小黑鼻
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), this.matNose);
        noseMesh.scale.set(1.15, 0.85, 1.0);
        noseMesh.position.set(0, 0.09, 0.30);
        adultHead.add(noseMesh);

        // 🌟 招牌立體黑淚痕 (Facial Tear Tracks - 參考照片 1 & 2)
        const tearL = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.20, 8), this.matCheetahTear);
        tearL.position.set(-0.085, 0.07, 0.22);
        tearL.rotation.z = -0.25;
        tearL.rotation.x = 0.38;
        adultHead.add(tearL);

        const tearR = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.20, 8), this.matCheetahTear);
        tearR.position.set(0.085, 0.07, 0.22);
        tearR.rotation.z = 0.25;
        tearR.rotation.x = 0.38;
        adultHead.add(tearR);

        // 獵豹專注敏銳金琥珀眸
        const eyeGeo = new THREE.SphereGeometry(0.068, 14, 14);
        const pupilGeo = new THREE.SphereGeometry(0.046, 12, 12);
        const shineGeo = new THREE.SphereGeometry(0.026, 8, 8);

        this.cheetahAdultEyeL = new THREE.Group();
        this.cheetahAdultEyeL.position.set(-0.11, 0.15, 0.23);
        this.cheetahAdultEyeL.rotation.y = -0.16;
        const irisL = new THREE.Mesh(eyeGeo, this.matCheetahAmberEye);
        const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilL.position.set(0, 0, 0.046);
        const s1L = new THREE.Mesh(shineGeo, this.matShine);
        s1L.position.set(-0.018, 0.024, 0.068);
        this.cheetahAdultEyeL.add(irisL, pupilL, s1L);
        adultHead.add(this.cheetahAdultEyeL);

        this.cheetahAdultEyeR = new THREE.Group();
        this.cheetahAdultEyeR.position.set(0.11, 0.15, 0.23);
        this.cheetahAdultEyeR.rotation.y = 0.16;
        const irisR = new THREE.Mesh(eyeGeo, this.matCheetahAmberEye);
        const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
        pupilR.position.set(0, 0, 0.046);
        const s1R = new THREE.Mesh(shineGeo, this.matShine);
        s1R.position.set(-0.018, 0.024, 0.068);
        this.cheetahAdultEyeR.add(irisR, pupilR, s1R);
        adultHead.add(this.cheetahAdultEyeR);

        // 圓潤小巧立耳 (降低風阻)
        const earGeo = new THREE.SphereGeometry(0.10, 12, 12);
        earGeo.scale(0.85, 1.10, 0.28);

        this.cheetahAdultEarLPivot = new THREE.Group();
        this.cheetahAdultEarLPivot.position.set(-0.16, 0.30, 0.04);
        this.cheetahAdultEarLPivot.rotation.z = 0.32;
        const earL = new THREE.Mesh(earGeo, this.matCheetahCoat);
        this.cheetahAdultEarLPivot.add(earL);
        const earInL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), this.matCheetahBelly);
        earInL.scale.set(0.85, 1.0, 0.28);
        earInL.position.set(0.01, 0, 0.02);
        this.cheetahAdultEarLPivot.add(earInL);
        adultHead.add(this.cheetahAdultEarLPivot);

        this.cheetahAdultEarRPivot = new THREE.Group();
        this.cheetahAdultEarRPivot.position.set(0.16, 0.30, 0.04);
        this.cheetahAdultEarRPivot.rotation.z = -0.32;
        const earR = new THREE.Mesh(earGeo, this.matCheetahCoat);
        this.cheetahAdultEarRPivot.add(earR);
        const earInR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), this.matCheetahBelly);
        earInR.scale.set(0.85, 1.0, 0.28);
        earInR.position.set(-0.01, 0, 0.02);
        this.cheetahAdultEarRPivot.add(earInR);
        adultHead.add(this.cheetahAdultEarRPivot);

        // 4. ✨ 核心特點：【極度細長優雅四肢】(Super Slender, Long & Elegant Limbs)
        this.cheetahAdultLegs = {};
        const adultPawGeo = new THREE.SphereGeometry(0.045, 12, 12);
        adultPawGeo.scale(0.85, 0.48, 1.25); // 精巧優雅貓科小爪

        // 前肢：肩胛平滑過渡，腿骨修長筆直優美 (高度 0.70)
        const frontConfigs = [
            { key: 'frontLeft', x: -0.13, y: 0.08, z: 0.22 },
            { key: 'frontRight', x: 0.13, y: 0.08, z: 0.22 }
        ];
        const frontUpperGeo = new THREE.CylinderGeometry(0.040, 0.032, 0.36, 12);
        const frontLowerGeo = new THREE.CylinderGeometry(0.032, 0.025, 0.36, 12);

        frontConfigs.forEach(c => {
            const pivot = new THREE.Group();
            pivot.position.set(c.x, c.y, c.z);

            // 肩胛與上前肢
            const upMesh = new THREE.Mesh(frontUpperGeo, this.matCheetahCoat);
            upMesh.position.y = -0.18;
            upMesh.castShadow = true;
            pivot.add(upMesh);

            // 下前臂
            const lowMesh = new THREE.Mesh(frontLowerGeo, this.matCheetahCoat);
            lowMesh.position.y = -0.50;
            lowMesh.castShadow = true;
            pivot.add(lowMesh);

            // 前臂細小圓斑
            const legSpot = new THREE.Mesh(spotGeo, this.matCheetahSpots);
            legSpot.scale.set(0.022, 0.022, 0.015);
            legSpot.position.set(c.x > 0 ? 0.028 : -0.028, -0.32, 0);
            pivot.add(legSpot);

            // 優雅爪掌
            const paw = new THREE.Mesh(adultPawGeo, this.matCheetahCoat);
            paw.position.set(0, -0.69, 0.02);
            pivot.add(paw);

            this.cheetahAdultGroup.add(pivot);
            this.cheetahAdultLegs[c.key] = pivot;
        });

        // 後肢：窄扁爆發力大腿、超修長流暢後腿骨 (高度 0.70)
        const backConfigs = [
            { key: 'backLeft', x: -0.12, y: 0.06, z: -0.38 },
            { key: 'backRight', x: 0.12, y: 0.06, z: -0.38 }
        ];
        const thighGeo = new THREE.SphereGeometry(0.13, 12, 12);
        thighGeo.scale(0.38, 1.25, 0.82); // 窄扁爆發力大腿
        const backShankGeo = new THREE.CylinderGeometry(0.034, 0.025, 0.46, 12);

        backConfigs.forEach(c => {
            const pivot = new THREE.Group();
            pivot.position.set(c.x, c.y, c.z);

            // 大腿
            const thigh = new THREE.Mesh(thighGeo, this.matCheetahCoat);
            thigh.position.set(0, -0.14, 0);
            thigh.castShadow = true;
            pivot.add(thigh);

            // 細長後腿
            const shank = new THREE.Mesh(backShankGeo, this.matCheetahCoat);
            shank.position.set(0, -0.46, -0.01);
            shank.castShadow = true;
            pivot.add(shank);

            // 爪掌
            const paw = new THREE.Mesh(adultPawGeo, this.matCheetahCoat);
            paw.position.set(0, -0.69, 0.02);
            pivot.add(paw);

            this.cheetahAdultGroup.add(pivot);
            this.cheetahAdultLegs[c.key] = pivot;
        });

        // 5. 招牌細長黑白環平衡舵長尾 (Slender Whip Tail - 參考照片 1)
        this.cheetahAdultTailBase = new THREE.Group();
        this.cheetahAdultTailBase.position.set(0, 0.14, -0.50);

        // 尾身第 1 段 (細長向下)
        const tail1Geo = new THREE.CylinderGeometry(0.026, 0.020, 0.46, 10);
        const tail1 = new THREE.Mesh(tail1Geo, this.matCheetahCoat);
        tail1.position.set(0, -0.18, -0.10);
        tail1.rotation.x = -0.58;
        this.cheetahAdultTailBase.add(tail1);

        // 尾身第 2 段 (細長向上翹起的高速舵尾)
        const tail2Group = new THREE.Group();
        tail2Group.position.set(0, -0.34, -0.18);
        const tail2Geo = new THREE.CylinderGeometry(0.020, 0.015, 0.46, 10);
        const tail2 = new THREE.Mesh(tail2Geo, this.matCheetahCoat);
        tail2.position.set(0, 0.14, -0.15);
        tail2.rotation.x = 0.58;
        tail2Group.add(tail2);

        // 尾尖 4 道純黑環 (Black Rings)
        for (let r = 0; r < 4; r++) {
            const ringGeo = new THREE.TorusGeometry(0.022, 0.007, 8, 16);
            ringGeo.rotateX(Math.PI / 2);
            const ring = new THREE.Mesh(ringGeo, this.matCheetahSpots);
            ring.position.set(0, 0.06 + r * 0.07, -0.10 - r * 0.05);
            tail2Group.add(ring);
        }

        // 尾末純黑與白毛尖
        const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), this.matNose);
        tipMesh.position.set(0, 0.30, -0.28);
        tail2Group.add(tipMesh);

        this.cheetahAdultTailBase.add(tail2Group);
        this.cheetahAdultGroup.add(this.cheetahAdultTailBase);
    }

    // ----------------------------------------------------
    // 8.3 形態切換與更新
    // ----------------------------------------------------
    updateCheetahStage(stage) {
        this.cheetahStage = stage;
        if (stage === 'adult') {
            this.cheetahCubGroup.visible = false;
            this.cheetahAdultGroup.visible = true;
            this.eyeLeft = this.cheetahAdultEyeL;
            this.eyeRight = this.cheetahAdultEyeR;
            this.earLeftPivot = this.cheetahAdultEarLPivot;
            this.earRightPivot = this.cheetahAdultEarRPivot;
            this.head = this.cheetahAdultHead;
        } else {
            this.cheetahCubGroup.visible = true;
            this.cheetahAdultGroup.visible = false;
            this.eyeLeft = this.cheetahCubEyeL;
            this.eyeRight = this.cheetahCubEyeR;
            this.earLeftPivot = this.cheetahCubEarLPivot;
            this.earRightPivot = this.cheetahCubEarRPivot;
            this.head = this.cheetahCubHead;
        }
    }

    // ----------------------------------------------------
    // 8.4 動畫系統：高速奔馳脊椎屈伸、鳥鳴啾啾歪頭與尾舵平衡
    // ----------------------------------------------------
    updateCheetah(delta, elapsedTime) {
        const t = elapsedTime;
        this.updateCanineAutonomy(delta, elapsedTime);

        // 眨眼
        this.nextBlinkTime -= delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.5 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        }

        // 耳朵微動
        const earBob = Math.sin(t * 4.0) * 0.04;
        if (this.earLeftPivot) this.earLeftPivot.rotation.x = -0.12 + earBob;
        if (this.earRightPivot) this.earRightPivot.rotation.x = -0.12 - earBob;

        if (this.cheetahStage === 'baby') {
            // 幼崽期：好奇歪頭、短尾輕搖、軟萌呼吸
            const breathe = Math.sin(t * 2.8) * 0.015;
            this.cheetahCubGroup.position.y = 0.58 + breathe;

            // 好奇歪頭 (參考照片 2)
            const headTilt = Math.sin(t * 1.6) * 0.12;
            this.cheetahCubHead.rotation.z = headTilt;
            this.cheetahCubHead.rotation.x = Math.sin(t * 2.2) * 0.04;
            this.cheetahCubHead.rotation.y = Math.sin(t * 1.1) * 0.06;

            const tailWag = Math.sin(t * 6.5) * 0.25;
            this.cheetahCubTailBase.rotation.y = tailWag;

            if (this.currentState === 'pet') {
                this.cheetahCubHead.rotation.x = -0.18;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            } else if (this.currentState === 'sleep') {
                this.cheetahCubGroup.position.y = 0.38;
                this.cheetahCubHead.rotation.x = 0.20;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    const wc = this.autonomy.walkCycle;
                    this.cheetahCubGroup.position.y = 0.58 + Math.abs(Math.sin(wc * 2)) * 0.03;
                    this.cheetahCubLegs.frontLeft.rotation.x = Math.sin(wc) * 0.42;
                    this.cheetahCubLegs.frontRight.rotation.x = -Math.sin(wc) * 0.42;
                    this.cheetahCubLegs.backLeft.rotation.x = -Math.sin(wc) * 0.42;
                    this.cheetahCubLegs.backRight.rotation.x = Math.sin(wc) * 0.42;
                } else {
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.cheetahCubGroup.position.y = THREE.MathUtils.lerp(0.58, 0.35, lf) + Math.sin(t * (2.0 - lf * 0.6)) * 0.01;
                    this.cheetahCubLegs.frontLeft.rotation.x = -0.42 * lf;
                    this.cheetahCubLegs.frontRight.rotation.x = -0.42 * lf;
                    this.cheetahCubLegs.backLeft.rotation.x = 0.75 * lf;
                    this.cheetahCubLegs.backRight.rotation.x = 0.75 * lf;
                    this.cheetahCubHead.rotation.x = 0.10 * lf + Math.sin(t * 2.2) * 0.04;
                }
            }
        } else {
            // 成年極速獵豹：標誌性極速衝刺（Spine Flexion / Extension）
            const isSprint = (this.currentState === 'happy');
            const breathe = Math.sin(t * 3.2) * 0.01;
            this.cheetahAdultGroup.position.y = 0.70 + breathe;

            // 高速奔跑舵尾平衡搖擺
            const tailSpeed = isSprint ? 16 : 4.0;
            const tailAmp = isSprint ? 0.35 : 0.16;
            this.cheetahAdultTailBase.rotation.y = Math.sin(t * tailSpeed) * tailAmp;

            if (isSprint) {
                // 經典獵豹全速飛奔動作（前後腿輪番大幅屈伸，脊椎波浪狀律動）
                const runCycle = t * 14;
                const frontSwing = Math.sin(runCycle) * 0.65;
                const backSwing = Math.sin(runCycle + Math.PI) * 0.65;

                this.cheetahAdultLegs.frontLeft.rotation.x = frontSwing;
                this.cheetahAdultLegs.frontRight.rotation.x = -frontSwing * 0.7;
                this.cheetahAdultLegs.backLeft.rotation.x = backSwing;
                this.cheetahAdultLegs.backRight.rotation.x = -backSwing * 0.7;

                // 脊椎極限屈伸 (Spine Flexion)
                this.cheetahAdultGroup.rotation.x = Math.sin(runCycle) * 0.08;
                this.cheetahAdultNeck.rotation.x = -0.10 + Math.sin(runCycle) * 0.06;
                this.cheetahAdultHead.rotation.x = -0.15;
            } else if (this.currentState === 'pet') {
                this.cheetahAdultHead.rotation.x = -0.15;
                this.cheetahAdultHead.rotation.z = 0.08;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.2;
                if (this.eyeRight) this.eyeRight.scale.y = 0.2;
            } else if (this.currentState === 'sleep') {
                this.cheetahAdultGroup.position.y = 0.44;
                this.cheetahAdultHead.rotation.x = 0.22;
                if (this.eyeLeft) this.eyeLeft.scale.y = 0.1;
                if (this.eyeRight) this.eyeRight.scale.y = 0.1;
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    // 優雅獵豹踱步：肩胛微浮、長尾舵擺動、流線漫步
                    const wc = this.autonomy.walkCycle;
                    this.cheetahAdultGroup.position.y = 0.70 + Math.abs(Math.sin(wc * 2)) * 0.035;
                    this.cheetahAdultLegs.frontLeft.rotation.x = Math.sin(wc) * 0.46;
                    this.cheetahAdultLegs.frontRight.rotation.x = -Math.sin(wc) * 0.46;
                    this.cheetahAdultLegs.backLeft.rotation.x = -Math.sin(wc) * 0.46;
                    this.cheetahAdultLegs.backRight.rotation.x = Math.sin(wc) * 0.46;
                    this.cheetahAdultGroup.rotation.x = Math.sin(wc * 2) * 0.02;
                    this.cheetahAdultNeck.rotation.x = Math.sin(wc * 2) * 0.025;
                    this.cheetahAdultHead.rotation.x = Math.sin(wc * 2) * 0.03;
                    this.cheetahAdultHead.rotation.y = 0;
                    this.cheetahAdultHead.rotation.z = 0;
                    this.cheetahAdultTailBase.rotation.y = Math.sin(wc) * 0.25;
                } else {
                    // 趴下 (趴在地上如埃及獅身人面或優雅舒展休息)
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.cheetahAdultGroup.position.y = THREE.MathUtils.lerp(0.70, 0.40, lf) + Math.sin(t * (2.2 - lf * 0.7)) * 0.01;
                    this.cheetahAdultLegs.frontLeft.rotation.x = -0.45 * lf;
                    this.cheetahAdultLegs.frontRight.rotation.x = -0.45 * lf;
                    this.cheetahAdultLegs.backLeft.rotation.x = 0.82 * lf;
                    this.cheetahAdultLegs.backRight.rotation.x = 0.82 * lf;
                    this.cheetahAdultGroup.rotation.x = 0;
                    this.cheetahAdultNeck.rotation.x = 0.14 * lf;
                    this.cheetahAdultHead.rotation.x = 0.10 * lf + Math.sin(t * 1.5) * 0.03;
                    this.cheetahAdultHead.rotation.y = Math.sin(t * 0.9) * (0.04 - lf * 0.02);
                    this.cheetahAdultHead.rotation.z = 0;
                }
            }
        }
    }

    resetCheetahCubLegs() {
        if (!this.cheetahCubLegs) return;
        Object.keys(this.cheetahCubLegs).forEach(k => this.cheetahCubLegs[k].rotation.set(0, 0, 0));
    }

    resetCheetahAdultLegs() {
        if (!this.cheetahAdultLegs) return;
        Object.keys(this.cheetahAdultLegs).forEach(k => this.cheetahAdultLegs[k].rotation.set(0, 0, 0));
    }

    // ─────────────────────────────────────────────────────────
    //  🪶 烏鴉 / 渡鴉（Crow & Raven）3D 模型引擎：
    //  1. 幼雛期：呆萌黑煤球小烏鴉（參考圖 1 軟萌毛球、水汪大眼、粉嫩嘴角）
    //  2. 成年期：暗夜極夜渡鴉領主（參考圖 2 油亮藍黑羽衣、巨大彎鉤喙、帥氣披針喉羽）
    // ─────────────────────────────────────────────────────────
    buildCrowMesh() {
        this.crowStage = 'baby'; // 'baby' | 'adult'
        this.crowRoot = new THREE.Group();
        this.root.add(this.crowRoot);

        // 配件系統與相容性虛擬節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.tailBase = new THREE.Group();
        this.legs = { frontLeft: new THREE.Group(), frontRight: new THREE.Group(), backLeft: new THREE.Group(), backRight: new THREE.Group() };
        this.tongue = new THREE.Group();
        this.snout = new THREE.Group();
        this.crowRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼雛期黑煤球幼鳥
        this.buildCrowBabyMesh();

        // 2. 成年期帥氣渡鴉
        this.buildCrowAdultMesh();

        // 3. 飛行專用姿勢骨架（參考照片：水平流線俯衝身軀、前伸頭頸與銀灰高光微彎烏喙、收攏貼腹黑爪、修長微下傾楔形扇尾、翼尖 8 根分明開叉指狀初級飛羽）
        this.buildCrowFlightRig();

        // 預設呈現幼雛期黑煤球（按切換鍵前為幼崽型態）
        this.updateCrowStage('baby');
    }

    // 1. 幼雛期：毛茸茸黑煤球（參考圖 1：手心上的黑芝麻毛球、好奇大眼、嫩嘴角、細鳥爪）
    buildCrowBabyMesh() {
        this.crowBabyGroup = new THREE.Group();
        this.crowBabyGroup.name = 'CrowBabyGroup';
        this.crowBabyGroup.position.set(0, 0.42, 0);
        this.crowRoot.add(this.crowBabyGroup);

        // 1.1 圓滾滾黑煤球身軀 (Fluffy Baby Body)
        const babyTorsoGeo = new THREE.SphereGeometry(0.36, 18, 18);
        babyTorsoGeo.scale(1.06, 0.98, 1.12);
        const babyTorso = new THREE.Mesh(babyTorsoGeo, this.matCrowBabyFluff);
        babyTorso.position.set(0, 0, 0);
        babyTorso.castShadow = true;
        this.crowBabyGroup.add(babyTorso);

        // 周圍蓬鬆絨毛細節凸塊 (Fluff Puffs around torso)
        const fluffPuffs = [
            [-0.22, -0.05, 0.18], [0.22, -0.05, 0.18],
            [-0.28, 0.05, -0.1],  [0.28, 0.05, -0.1],
            [0, -0.16, 0.12],     [0, 0.15, -0.22],
            [-0.18, -0.12, -0.15],[0.18, -0.12, -0.15]
        ];
        fluffPuffs.forEach(([x, y, z]) => {
            const puffGeo = new THREE.SphereGeometry(0.14, 10, 10);
            puffGeo.scale(1.2, 0.8, 1.1);
            const puff = new THREE.Mesh(puffGeo, this.matCrowBabyFluff);
            puff.position.set(x, y, z);
            this.crowBabyGroup.add(puff);
        });

        // 1.2 呆萌大圓頭顱與大眼睛 (Baby Head & Inquisitive Big Eyes)
        const babyHeadPivot = new THREE.Group();
        babyHeadPivot.position.set(0, 0.22, 0.18);
        this.crowBabyGroup.add(babyHeadPivot);
        this.crowBabyHead = babyHeadPivot;

        // 頭部大毛球
        const headGeo = new THREE.SphereGeometry(0.34, 18, 18);
        headGeo.scale(1.02, 0.98, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matCrowBabyFluff);
        headMesh.position.set(0, 0.16, 0.05);
        headMesh.castShadow = true;
        babyHeadPivot.add(headMesh);

        // 兩側微凸軟萌毛絨臉頰
        const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.matCrowBabyCheek);
        cheekL.scale.set(0.9, 0.7, 0.9);
        cheekL.position.set(-0.22, 0.12, 0.16);
        const cheekR = cheekL.clone();
        cheekR.position.set(0.22, 0.12, 0.16);
        babyHeadPivot.add(cheekL, cheekR);

        // 頭頂呆毛小絨毛尖 (Baby Crown Down Tufts)
        const tuftGroup = new THREE.Group();
        tuftGroup.position.set(0, 0.46, 0.08);
        for (let i = -1; i <= 1; i++) {
            const tuftGeo = new THREE.ConeGeometry(0.035, 0.14, 6);
            const tuft = new THREE.Mesh(tuftGeo, this.matCrowBabyFluff);
            tuft.position.set(i * 0.05, 0, 0);
            tuft.rotation.z = -i * 0.25;
            tuft.rotation.x = -0.3;
            tuftGroup.add(tuft);
        }
        babyHeadPivot.add(tuftGroup);

        // 1.3 幼鳥大眼睛（水汪汪黑曜石 ＋ 雙高光 ＋ 幼鳥眼圈）
        const eyeRingGeo = new THREE.TorusGeometry(0.09, 0.018, 8, 18);
        const eyeBallGeo = new THREE.SphereGeometry(0.085, 16, 16);

        // 左眼
        const eyeGroupL = new THREE.Group();
        eyeGroupL.position.set(-0.19, 0.18, 0.25);
        eyeGroupL.rotation.y = -0.28;
        const ringL = new THREE.Mesh(eyeRingGeo, this.matCrowEyeRing);
        const ballL = new THREE.Mesh(eyeBallGeo, this.matPupil);
        // 主高光與次高光（營造水汪汪超萌反光）
        const shine1L = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), this.matShine);
        shine1L.position.set(0.025, 0.03, 0.075);
        const shine2L = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
        shine2L.position.set(-0.025, -0.02, 0.078);
        eyeGroupL.add(ringL, ballL, shine1L, shine2L);

        // 右眼
        const eyeGroupR = new THREE.Group();
        eyeGroupR.position.set(0.19, 0.18, 0.25);
        eyeGroupR.rotation.y = 0.28;
        const ringR = new THREE.Mesh(eyeRingGeo, this.matCrowEyeRing);
        const ballR = new THREE.Mesh(eyeBallGeo, this.matPupil);
        const shine1R = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), this.matShine);
        shine1R.position.set(0.025, 0.03, 0.075);
        const shine2R = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
        shine2R.position.set(-0.025, -0.02, 0.078);
        eyeGroupR.add(ringR, ballR, shine1R, shine2R);

        babyHeadPivot.add(eyeGroupL, eyeGroupR);
        this.crowBabyEyeL = eyeGroupL;
        this.crowBabyEyeR = eyeGroupR;

        // 1.4 短鈍幼鳥小黑喙（帶粉嫩嘴角肉緣）
        const babyBeakPivot = new THREE.Group();
        babyBeakPivot.position.set(0, 0.12, 0.35);
        babyHeadPivot.add(babyBeakPivot);
        this.crowBabyBeak = babyBeakPivot;

        // 上喙（微彎黑錐）
        const upperBeakGeo = new THREE.ConeGeometry(0.075, 0.18, 8);
        upperBeakGeo.rotateX(Math.PI / 2);
        upperBeakGeo.scale(1.1, 0.85, 1.0);
        const upperBeak = new THREE.Mesh(upperBeakGeo, this.matCrowBeak);
        upperBeak.position.set(0, 0.02, 0.07);
        babyBeakPivot.add(upperBeak);

        // 下喙
        const lowerBeakGeo = new THREE.ConeGeometry(0.065, 0.15, 8);
        lowerBeakGeo.rotateX(Math.PI / 2);
        lowerBeakGeo.scale(1.0, 0.7, 1.0);
        const lowerBeak = new THREE.Mesh(lowerBeakGeo, this.matCrowBeak);
        lowerBeak.position.set(0, -0.02, 0.06);
        babyBeakPivot.add(lowerBeak);

        // 幼鳥招牌粉紅嫩嘴角 (Pink Gape flange)
        const gapeGeo = new THREE.SphereGeometry(0.03, 8, 8);
        gapeGeo.scale(1.4, 0.6, 1.0);
        const gapeL = new THREE.Mesh(gapeGeo, this.matCrowBabyGape);
        gapeL.position.set(-0.072, 0.005, 0.01);
        const gapeR = gapeL.clone();
        gapeR.position.set(0.072, 0.005, 0.01);
        babyBeakPivot.add(gapeL, gapeR);

        // 1.5 幼雛小絨毛翅膀（兩側圓萌肉翅，可快速扇動噗噗拍翅）
        this.crowBabyWings = {};
        [-1, 1].forEach((side) => {
            const wingPivot = new THREE.Group();
            wingPivot.position.set(side * 0.32, 0.08, 0.02);
            this.crowBabyGroup.add(wingPivot);

            const wingGeo = new THREE.SphereGeometry(0.18, 12, 12);
            wingGeo.scale(0.35, 0.9, 1.35);
            const wingMesh = new THREE.Mesh(wingGeo, this.matCrowBabyFluff);
            wingMesh.position.set(side * 0.05, -0.05, -0.08);
            wingMesh.rotation.y = side * 0.2;
            wingPivot.add(wingMesh);

            // 翅端羽尖
            const tipGeo = new THREE.ConeGeometry(0.06, 0.16, 6);
            tipGeo.rotateX(-Math.PI / 2);
            const tip = new THREE.Mesh(tipGeo, this.matCrowBabyFluff);
            tip.position.set(side * 0.05, -0.08, -0.22);
            wingPivot.add(tip);

            if (side === -1) this.crowBabyWings.left = wingPivot;
            else this.crowBabyWings.right = wingPivot;
        });

        // 1.6 短小毛球尾巴 (Tiny Bobtail)
        const tailGeo = new THREE.SphereGeometry(0.12, 10, 10);
        tailGeo.scale(0.9, 0.6, 1.4);
        const babyTail = new THREE.Mesh(tailGeo, this.matCrowBabyFluff);
        babyTail.position.set(0, 0.02, -0.36);
        babyTail.rotation.x = 0.25;
        this.crowBabyGroup.add(babyTail);
        this.crowBabyTail = babyTail;

        // 1.7 幼雛小黑細爪 (Baby Bird Feet & Claws)
        this.crowBabyLegs = {};
        [-1, 1].forEach((side) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.14, -0.26, 0.02);
            this.crowBabyGroup.add(legPivot);

            // 小腿
            const legGeo = new THREE.CylinderGeometry(0.02, 0.018, 0.18, 8);
            const leg = new THREE.Mesh(legGeo, this.matCrowLegs);
            leg.position.set(0, -0.08, 0);
            legPivot.add(leg);

            // 前三趾
            const footGroup = new THREE.Group();
            footGroup.position.set(0, -0.16, 0);
            [-0.32, 0, 0.32].forEach((angle) => {
                const toeGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.12, 6);
                toeGeo.rotateX(Math.PI / 2);
                const toe = new THREE.Mesh(toeGeo, this.matCrowLegs);
                toe.position.set(0, 0, 0.05);
                toe.rotation.y = angle;
                footGroup.add(toe);
            });
            // 後一趾
            const backToeGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.07, 6);
            backToeGeo.rotateX(Math.PI / 2);
            const backToe = new THREE.Mesh(backToeGeo, this.matCrowLegs);
            backToe.position.set(0, 0, -0.035);
            footGroup.add(backToe);

            legPivot.add(footGroup);

            if (side === -1) this.crowBabyLegs.left = legPivot;
            else this.crowBabyLegs.right = legPivot;
        });
    }

    // 2. 成年期：極夜暗黑烏鴉／渡鴉領主（與飛行模型 1:1 共享完全相同的流線頭顱、銀灰天光高光彎喙、眼圈、7 片楔形扇尾與疊合的 8 指飛羽，起飛與降落後外觀 100% 統一！）
    buildCrowAdultMesh() {
        this.crowAdultGroup = new THREE.Group();
        this.crowAdultGroup.name = 'CrowAdultGroup';
        this.crowAdultGroup.position.set(0, 0.65, 0);
        this.crowRoot.add(this.crowAdultGroup);

        // 2.1 流線挺拔軀幹（與 crowFlightBodyPivot 共享完全相同的胸腹流線比例，僅以 -0.32 仰角挺立！）
        const adultTorsoGeo = new THREE.SphereGeometry(0.28, 22, 18);
        adultTorsoGeo.scale(0.88, 0.82, 1.82);
        const adultTorso = new THREE.Mesh(adultTorsoGeo, this.matCrowAdultPlumage);
        adultTorso.position.set(0, 0, 0);
        adultTorso.rotation.x = -0.32;
        adultTorso.castShadow = true;
        this.crowAdultGroup.add(adultTorso);

        const keelGeo = new THREE.SphereGeometry(0.23, 18, 16);
        keelGeo.scale(0.86, 0.78, 1.35);
        const keel = new THREE.Mesh(keelGeo, this.matCrowAdultPlumage);
        keel.position.set(0, 0.02, 0.14);
        keel.rotation.x = -0.32;
        this.crowAdultGroup.add(keel);

        // 2.2 精緻喉部披針羽領 (Throat Hackles)
        const hacklesGroup = new THREE.Group();
        hacklesGroup.position.set(0, 0.12, 0.28);
        this.crowAdultGroup.add(hacklesGroup);
        this.crowAdultHackles = hacklesGroup;

        const hacklePlates = [
            [0, 0, 0.08, 0.04, 0.16, -0.2],
            [-0.07, -0.04, 0.06, 0.035, 0.15, -0.25],
            [0.07, -0.04, 0.06, 0.035, 0.15, -0.25],
            [0, -0.09, 0.09, 0.042, 0.17, -0.15]
        ];
        hacklePlates.forEach(([x, y, z, w, len, rx]) => {
            const hGeo = new THREE.ConeGeometry(w, len, 4);
            hGeo.scale(1.3, 1.0, 0.35);
            const feather = new THREE.Mesh(hGeo, this.matCrowWingFeather);
            feather.position.set(x, y, z);
            feather.rotation.x = rx;
            hacklesGroup.add(feather);
        });

        // 2.3 流線頸部與烏鴉頭部（與飛行骨架 crowFlightHead 完全同尺寸、同石板黑材質、同銀灰高光烏喙！）
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 0.18, 0.32);
        this.crowAdultGroup.add(neckPivot);
        this.crowAdultNeck = neckPivot;

        const neckGeo = new THREE.CylinderGeometry(0.145, 0.195, 0.26, 16);
        neckGeo.scale(0.88, 1.0, 0.88);
        const neckMesh = new THREE.Mesh(neckGeo, this.matCrowHeadSlate);
        neckMesh.position.set(0, 0.04, 0.02);
        neckMesh.rotation.x = 0.25;
        neckPivot.add(neckMesh);

        const headPivot = new THREE.Group();
        headPivot.position.set(0, 0.14, 0.08);
        neckPivot.add(headPivot);
        this.crowAdultHead = headPivot;

        // 頭顱主體（與 crowFlightHead 1:1 完全一致！）
        const adultHeadGeo = new THREE.SphereGeometry(0.165, 18, 16);
        adultHeadGeo.scale(0.86, 0.86, 1.32);
        const adultHead = new THREE.Mesh(adultHeadGeo, this.matCrowHeadSlate);
        adultHead.castShadow = true;
        headPivot.add(adultHead);

        const crownCap = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 12), this.matCrowAdultPlumage);
        crownCap.scale.set(0.82, 0.65, 1.25);
        crownCap.position.set(0, 0.035, -0.01);
        headPivot.add(crownCap);

        // 2.4 與飛行姿態完全一致的「銀灰天光高光微彎厚烏喙 ＋ 基部鼻鬚」
        const billPivot = new THREE.Group();
        billPivot.position.set(0, -0.005, 0.16);
        headPivot.add(billPivot);
        this.crowAdultBeak = billPivot;

        const upperBeakGeo = new THREE.ConeGeometry(0.068, 0.30, 12);
        upperBeakGeo.rotateX(Math.PI / 2);
        upperBeakGeo.scale(0.82, 0.88, 1.0);
        const billUpper = new THREE.Mesh(upperBeakGeo, this.matCrowBeak);
        billUpper.position.set(0, 0.012, 0.13);
        billUpper.rotation.x = 0.06;
        billPivot.add(billUpper);

        const beakSheenGeo = new THREE.ConeGeometry(0.056, 0.21, 10);
        beakSheenGeo.rotateX(Math.PI / 2);
        beakSheenGeo.scale(0.88, 0.62, 1.0);
        const beakSheen = new THREE.Mesh(beakSheenGeo, this.matCrowBeakHighlight);
        beakSheen.position.set(0, 0.014, 0.11);
        beakSheen.rotation.x = 0.06;
        billPivot.add(beakSheen);

        const hookGeo = new THREE.ConeGeometry(0.022, 0.065, 8);
        hookGeo.rotateX(Math.PI / 2 + 0.32);
        const billHook = new THREE.Mesh(hookGeo, this.matCrowBeak);
        billHook.position.set(0, -0.004, 0.275);
        billPivot.add(billHook);

        const billLowerGeo = new THREE.ConeGeometry(0.054, 0.25, 10);
        billLowerGeo.rotateX(Math.PI / 2);
        billLowerGeo.scale(0.78, 0.68, 1.0);
        const billLower = new THREE.Mesh(billLowerGeo, this.matCrowBeak);
        billLower.position.set(0, -0.020, 0.11);
        billPivot.add(billLower);

        for (let b = -2; b <= 2; b++) {
            const bristle = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.08, 5), this.matCrowAdultPlumage);
            bristle.rotation.x = Math.PI / 2;
            bristle.position.set(b * 0.018, 0.028, 0.03);
            billPivot.add(bristle);
        }

        // 2.5 敏銳烏鴉眼眸（與飛行模型完全相同的淺灰眼圈環與高光）
        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.118, 0.032, 0.095);
            eyeGroup.rotation.y = side * 0.38;

            const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 8, 14), this.matCrowEyeRing);
            const eyeSclera = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), this.matCrowRavenEye);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), this.matShine);
            shine.position.set(side * 0.006, 0.010, 0.028);

            eyeGroup.add(eyeRing, eyeSclera, shine);
            headPivot.add(eyeGroup);
        });

        // 2.6 收攏於體側的層疊次級飛羽與 8 根修長初級飛羽尖（與飛行展開的雙翼同材質同層次！）
        this.crowAdultWings = {};
        [-1, 1].forEach((side) => {
            const wingPivot = new THREE.Group();
            wingPivot.position.set(side * 0.22, 0.08, 0.12);
            this.crowAdultGroup.add(wingPivot);

            const wingBaseGeo = new THREE.SphereGeometry(0.20, 14, 12);
            wingBaseGeo.scale(0.32, 0.95, 1.65);
            const wingBase = new THREE.Mesh(wingBaseGeo, this.matCrowAdultPlumage);
            wingBase.position.set(side * 0.03, -0.08, -0.18);
            wingBase.rotation.x = -0.32;
            wingPivot.add(wingBase);

            // 8 根收攏交疊的修長指狀初級飛羽尖
            for (let f = 0; f < 8; f++) {
                const fLen = 0.56 - f * 0.04;
                const featherGeo = new THREE.ConeGeometry(0.024, fLen, 6);
                featherGeo.rotateX(-Math.PI / 2);
                featherGeo.scale(0.65, 1.0, 1.0);
                const feather = new THREE.Mesh(featherGeo, this.matCrowWingFeather);
                feather.position.set(side * (0.04 + f * 0.005), -0.12 - f * 0.028, -0.28 - f * 0.045);
                feather.rotation.x = -0.34 + f * 0.02;
                feather.rotation.y = -side * 0.06;
                feather.castShadow = true;
                wingPivot.add(feather);
            }

            if (side === -1) this.crowAdultWings.left = wingPivot;
            else this.crowAdultWings.right = wingPivot;
        });

        // 2.7 與飛行模型完全一致的 7 片修長楔形／圓弧扇形黑尾羽
        const tailPivot = new THREE.Group();
        tailPivot.position.set(0, -0.14, -0.44);
        tailPivot.rotation.x = -0.36;
        this.crowAdultGroup.add(tailPivot);
        this.crowAdultTail = tailPivot;

        for (let i = -3; i <= 3; i++) {
            const absI = Math.abs(i);
            const featherLen = 0.62 - absI * 0.038;
            const featherWidth = 0.076;
            const rectrixGroup = new THREE.Group();
            rectrixGroup.rotation.y = i * 0.038;
            rectrixGroup.position.set(i * 0.022, -absI * 0.003, 0);

            const bladeGeo = new THREE.BoxGeometry(featherWidth, 0.012, featherLen);
            const blade = new THREE.Mesh(bladeGeo, this.matCrowWingFeather);
            blade.position.set(0, 0, -featherLen * 0.5);
            blade.castShadow = true;
            rectrixGroup.add(blade);

            tailPivot.add(rectrixGroup);
        }

        // 2.8 強悍黑色烏鴉雙腿與足爪
        this.crowAdultLegs = {};
        [-1, 1].forEach((side) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.14, -0.22, -0.04);
            this.crowAdultGroup.add(legPivot);

            const thighGeo = new THREE.SphereGeometry(0.095, 10, 10);
            thighGeo.scale(0.8, 1.25, 0.95);
            const thigh = new THREE.Mesh(thighGeo, this.matCrowAdultPlumage);
            legPivot.add(thigh);

            const shankGeo = new THREE.CylinderGeometry(0.030, 0.024, 0.34, 8);
            const shank = new THREE.Mesh(shankGeo, this.matCrowLegs);
            shank.position.set(0, -0.20, 0.02);
            shank.rotation.x = 0.12;
            legPivot.add(shank);

            const talonGroup = new THREE.Group();
            talonGroup.position.set(0, -0.38, 0.05);
            [-0.36, 0, 0.36].forEach((angle) => {
                const toeGeo = new THREE.CylinderGeometry(0.014, 0.010, 0.18, 6);
                toeGeo.rotateX(Math.PI / 2);
                const toe = new THREE.Mesh(toeGeo, this.matCrowLegs);
                toe.position.set(0, 0, 0.08);
                toe.rotation.y = angle;

                const clawGeo = new THREE.ConeGeometry(0.010, 0.05, 6);
                clawGeo.rotateX(Math.PI / 2 + 0.5);
                const claw = new THREE.Mesh(clawGeo, this.matCrowBeak);
                claw.position.set(0, -0.015, 0.16);
                toe.add(claw);

                talonGroup.add(toe);
            });
            const backToeGeo = new THREE.CylinderGeometry(0.014, 0.010, 0.12, 6);
            backToeGeo.rotateX(Math.PI / 2);
            const backToe = new THREE.Mesh(backToeGeo, this.matCrowLegs);
            backToe.position.set(0, 0, -0.06);
            talonGroup.add(backToe);

            legPivot.add(talonGroup);

            if (side === -1) this.crowAdultLegs.left = legPivot;
            else this.crowAdultLegs.right = legPivot;
        });
    }

    // 3. 飛行專用姿勢骨架（完全依照使用者上傳的烏鴉飛行實拍圖打造，並與站立模型 1:1 共享頭喙眼尾與可收放黑爪！）：
    //    - 飛行中 (flightBlend=1)：身體水平流線、頭喙前伸、雙腳完全收攏貼腹（如參考圖）、修長楔尾微下傾、雙翼展開 8 根開叉指狀初級飛羽
    //    - 起飛／降落過渡 (flightBlend 0<->1)：身體平滑仰起／俯平、雙腳由腹部平滑伸出踩地／收攏貼腹、雙翼平滑收攏貼背／展開高飛，起飛與降落零突兀感！
    buildCrowFlightRig() {
        this.crowFlightRig = new THREE.Group();
        this.crowFlightRig.name = 'CrowFlightRig';
        this.crowFlightRig.position.set(0, 0.65, 0);
        this.crowFlightRig.visible = false;
        this.crowRoot.add(this.crowFlightRig);

        this.crowFlightBodyPivot = new THREE.Group();
        this.crowFlightRig.add(this.crowFlightBodyPivot);

        // 3.1 水平流線型黑曜胸腹軀幹 (Streamlined Horizontal Fuselage)
        const fuselageGeo = new THREE.SphereGeometry(0.28, 22, 18);
        fuselageGeo.scale(0.88, 0.78, 1.85);
        const fuselage = new THREE.Mesh(fuselageGeo, this.matCrowAdultPlumage);
        fuselage.castShadow = true;
        this.crowFlightBodyPivot.add(fuselage);

        // 飽滿前胸肌 (Deep Pectoral Breast Contour)
        const keelGeo = new THREE.SphereGeometry(0.23, 18, 16);
        keelGeo.scale(0.86, 0.76, 1.35);
        const keel = new THREE.Mesh(keelGeo, this.matCrowAdultPlumage);
        keel.position.set(0, -0.05, 0.14);
        this.crowFlightBodyPivot.add(keel);

        // 後腹向尾根收束錐體
        const rearTaperGeo = new THREE.ConeGeometry(0.19, 0.42, 14);
        rearTaperGeo.rotateX(-Math.PI / 2);
        rearTaperGeo.scale(0.95, 0.75, 1.0);
        const rearTaper = new THREE.Mesh(rearTaperGeo, this.matCrowAdultPlumage);
        rearTaper.position.set(0, -0.01, -0.42);
        this.crowFlightBodyPivot.add(rearTaper);

        // 3.2 可動式烏鴉雙腳：飛行時 (flightBlend=1) 完全向上折疊收攏貼緊下腹部（還原照片腹部微凸輪廓）；起飛／降落時 (flightBlend->0) 平滑向下伸直站立！
        this.crowFlightTuckedFeet = new THREE.Group();
        this.crowFlightTuckedFeet.position.set(0, -0.18, -0.14);
        this.crowFlightBodyPivot.add(this.crowFlightTuckedFeet);

        this.crowFlightLegs = { left: null, right: null };
        [-1, 1].forEach((side) => {
            // 收攏的大腿腹羽凸起
            const thighPuff = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), this.matCrowAdultPlumage);
            thighPuff.scale.set(0.85, 0.65, 1.45);
            thighPuff.position.set(side * 0.065, 0.02, 0.02);
            this.crowFlightTuckedFeet.add(thighPuff);

            // 可收放關節腿（飛行中向後折貼腹底，降落時伸直落地）
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.12, -0.16, -0.08);
            this.crowFlightBodyPivot.add(legPivot);

            const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.020, 0.30, 8), this.matCrowLegs);
            shank.position.set(0, -0.15, 0);
            legPivot.add(shank);

            const footGrp = new THREE.Group();
            footGrp.position.set(0, -0.30, 0.02);
            [-0.32, 0, 0.32].forEach((ang) => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.009, 0.15, 6), this.matCrowLegs);
                toe.rotation.x = Math.PI / 2;
                toe.rotation.y = ang;
                toe.position.set(0, 0, 0.06);
                footGrp.add(toe);
            });
            legPivot.add(footGrp);

            if (side === -1) this.crowFlightLegs.left = legPivot;
            else this.crowFlightLegs.right = legPivot;
        });

        // 3.3 向前水平伸展的流線頸部與頭顱 (Forward-Stretched Neck & Head)
        const neckGeo = new THREE.CylinderGeometry(0.145, 0.195, 0.30, 16);
        neckGeo.rotateX(Math.PI / 2);
        neckGeo.scale(0.88, 0.85, 1.0);
        const neckMesh = new THREE.Mesh(neckGeo, this.matCrowHeadSlate);
        neckMesh.position.set(0, 0.03, 0.38);
        this.crowFlightBodyPivot.add(neckMesh);

        this.crowFlightHead = new THREE.Group();
        this.crowFlightHead.name = 'CrowFlightHead';
        this.crowFlightHead.position.set(0, 0.045, 0.52);
        this.crowFlightBodyPivot.add(this.crowFlightHead);

        // 頭顱主體（平順流線過渡至長喙）
        const headGeo = new THREE.SphereGeometry(0.165, 18, 16);
        headGeo.scale(0.86, 0.82, 1.32);
        const headMesh = new THREE.Mesh(headGeo, this.matCrowHeadSlate);
        headMesh.castShadow = true;
        this.crowFlightHead.add(headMesh);

        // 頭頂平滑黑羽冠面
        const crownCap = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 12), this.matCrowAdultPlumage);
        crownCap.scale.set(0.82, 0.65, 1.25);
        crownCap.position.set(0, 0.035, -0.01);
        this.crowFlightHead.add(crownCap);

        // 3.4 向前平伸、帶銀灰天光高光的微彎厚烏喙 (Forward-Pointing Corvid Beak with Silvery Sheen)
        const beakGroup = new THREE.Group();
        beakGroup.position.set(0, -0.005, 0.16);
        this.crowFlightHead.add(beakGroup);
        this.crowFlightBeak = beakGroup;

        // 上喙主體（深黑角質微彎錐體）
        const upperBeakGeo = new THREE.ConeGeometry(0.068, 0.30, 12);
        upperBeakGeo.rotateX(Math.PI / 2);
        upperBeakGeo.scale(0.82, 0.88, 1.0);
        const upperBeak = new THREE.Mesh(upperBeakGeo, this.matCrowBeak);
        upperBeak.position.set(0, 0.012, 0.13);
        upperBeak.rotation.x = 0.06;
        beakGroup.add(upperBeak);

        // 參考照片重點細節：鳥喙側面與上脊中段反射天光的銀灰亮面 (Silver-Grey Beak Side Highlight)
        const beakSheenGeo = new THREE.ConeGeometry(0.056, 0.21, 10);
        beakSheenGeo.rotateX(Math.PI / 2);
        beakSheenGeo.scale(0.88, 0.62, 1.0);
        const beakSheen = new THREE.Mesh(beakSheenGeo, this.matCrowBeakHighlight);
        beakSheen.position.set(0, 0.014, 0.11);
        beakSheen.rotation.x = 0.06;
        beakGroup.add(beakSheen);

        // 上喙前端微彎尖鉤
        const beakTipGeo = new THREE.ConeGeometry(0.022, 0.065, 8);
        beakTipGeo.rotateX(Math.PI / 2 + 0.32);
        const beakTip = new THREE.Mesh(beakTipGeo, this.matCrowBeak);
        beakTip.position.set(0, -0.004, 0.275);
        beakGroup.add(beakTip);

        // 下喙
        const lowerBeakGeo = new THREE.ConeGeometry(0.054, 0.25, 10);
        lowerBeakGeo.rotateX(Math.PI / 2);
        lowerBeakGeo.scale(0.78, 0.68, 1.0);
        const lowerBeak = new THREE.Mesh(lowerBeakGeo, this.matCrowBeak);
        lowerBeak.position.set(0, -0.020, 0.11);
        beakGroup.add(lowerBeak);

        // 鳥喙基部黑色鼻鬚羽 (Nasal Bristles)
        for (let b = -2; b <= 2; b++) {
            const bristle = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.08, 5), this.matCrowAdultPlumage);
            bristle.rotation.x = Math.PI / 2;
            bristle.position.set(b * 0.018, 0.028, 0.03);
            beakGroup.add(bristle);
        }

        // 3.5 敏銳烏鴉眼眸（帶淺灰眼圈環與高光，貼合參考照片眼部神韻）
        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.118, 0.032, 0.095);
            eyeGroup.rotation.y = side * 0.38;

            const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 8, 14), this.matCrowEyeRing);
            const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), this.matCrowRavenEye);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), this.matShine);
            shine.position.set(side * 0.006, 0.010, 0.028);

            eyeGroup.add(eyeRing, eyeBall, shine);
            this.crowFlightHead.add(eyeGroup);
        });

        // 3.6 修長水平微下傾的楔形／圓弧扇尾 (Long Slightly Down-Angled Wedge-Fan Tail)
        this.crowFlightTail = new THREE.Group();
        this.crowFlightTail.position.set(0, -0.02, -0.52);
        this.crowFlightTail.rotation.x = -0.15; // 參考照片：尾羽向後延伸並帶約 8~9 度微下傾角
        this.crowFlightBodyPivot.add(this.crowFlightTail);

        // 7 片交疊修長黑尾羽（中央最長、兩側微漸短，末端帶圓弧羽尖構成照片中的楔形長尾）
        for (let i = -3; i <= 3; i++) {
            const absI = Math.abs(i);
            const featherLen = 0.64 - absI * 0.038;
            const featherWidth = 0.082;
            const rectrixGroup = new THREE.Group();
            rectrixGroup.rotation.y = i * 0.048;
            rectrixGroup.position.set(i * 0.026, -absI * 0.003, 0);

            const bladeGeo = new THREE.BoxGeometry(featherWidth, 0.012, featherLen);
            const blade = new THREE.Mesh(bladeGeo, this.matCrowWingFeather);
            blade.position.set(0, 0, -featherLen * 0.5);
            blade.castShadow = true;
            rectrixGroup.add(blade);

            // 尾羽末端圓弧羽尖（呈現參考圖尾端分瓣層次感）
            const tipGeo = new THREE.CircleGeometry(featherWidth * 0.5, 10);
            tipGeo.rotateX(-Math.PI / 2);
            tipGeo.scale(1.0, 1.35, 1.0);
            const tipMesh = new THREE.Mesh(tipGeo, this.matCrowWingFeather);
            tipMesh.position.set(0, 0, -featherLen);
            tipMesh.material = this.matCrowWingFeather.clone();
            tipMesh.material.side = THREE.DoubleSide;
            rectrixGroup.add(tipMesh);

            this.crowFlightTail.add(rectrixGroup);
        }

        // 尾下覆羽與尾根過渡羽（照片中腹部後方至尾羽根部的小羽簇）
        const underTailCovert = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 10), this.matCrowAdultPlumage);
        underTailCovert.rotateX(-Math.PI / 2 + 0.08);
        underTailCovert.scale.set(1.1, 0.55, 1.0);
        underTailCovert.position.set(0, -0.025, -0.12);
        this.crowFlightTail.add(underTailCovert);

        // 3.7 寬大黑羽雙翼與翼尖 8 根分明開叉「指狀初級飛羽」 (Broad Jet-Black Wings with 8 Slotted Primary Fingers)
        this.crowFlightWings = { left: null, right: null };
        const doubleSideFeatherMat = this.matCrowWingFeather.clone();
        doubleSideFeatherMat.side = THREE.DoubleSide;
        const doubleSidePlumageMat = this.matCrowAdultPlumage.clone();
        doubleSidePlumageMat.side = THREE.DoubleSide;

        [-1, 1].forEach((side) => {
            // 第一關節：肩關節樞紐 (Shoulder Pivot)
            const shoulderPivot = new THREE.Group();
            shoulderPivot.position.set(side * 0.18, 0.06, 0.08);
            this.crowFlightBodyPivot.add(shoulderPivot);

            // 前緣肱骨／前臂骨架（由肩部向前外方延伸至腕關節彎角，形成照片中明顯的前折前緣）
            const armShape = new THREE.Shape();
            armShape.moveTo(0, 0.12);
            armShape.quadraticCurveTo(side * 0.28, 0.26, side * 0.56, 0.22); // 前緣向前拱起至腕關節
            armShape.lineTo(side * 0.56, -0.26);                             // 腕部後緣
            armShape.quadraticCurveTo(side * 0.28, -0.34, 0, -0.30);         // 內側次級飛羽基底
            armShape.closePath();

            const innerWingPlane = new THREE.Mesh(new THREE.ShapeGeometry(armShape, 12), doubleSidePlumageMat);
            innerWingPlane.rotation.x = -Math.PI / 2;
            innerWingPlane.castShadow = true;
            shoulderPivot.add(innerWingPlane);

            // 內翼立體覆羽層（賦予翅膀厚實肌肉與羽毛體積感）
            const covertPuff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), this.matCrowAdultPlumage);
            covertPuff.scale.set(1.65, 0.26, 1.15);
            covertPuff.position.set(side * 0.26, 0.01, -0.02);
            covertPuff.rotation.y = -side * 0.22;
            shoulderPivot.add(covertPuff);

            // 腕關節前緣標誌性「小翼羽 (Alula)」凸起（參考照片翅膀前緣中上段的分叉小羽尖！）
            const alulaGeo = new THREE.ConeGeometry(0.032, 0.19, 6);
            alulaGeo.rotateZ(-side * (Math.PI / 2 - 0.38));
            alulaGeo.rotateY(side * 0.25);
            alulaGeo.scale(1.0, 0.28, 0.65);
            const alula = new THREE.Mesh(alulaGeo, doubleSideFeatherMat);
            alula.position.set(side * 0.52, 0.012, 0.24);
            shoulderPivot.add(alula);

            // 內側 9 片次級飛羽 (Secondary Flight Feathers S1~S9) — 構成內翼後緣緊密鋸齒波浪邊
            for (let s = 0; s < 9; s++) {
                const frac = s / 8;
                const sx = side * (0.07 + frac * 0.47);
                const sz = -0.10 - Math.sin(frac * Math.PI) * 0.06;
                const sLen = 0.34 + Math.sin(frac * Math.PI) * 0.06;

                const secGroup = new THREE.Group();
                secGroup.position.set(sx, -0.004, sz);
                secGroup.rotation.y = side * (0.04 + frac * 0.14);

                const secBlade = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.010, sLen), doubleSideFeatherMat);
                secBlade.position.set(0, 0, -sLen * 0.5);
                secGroup.add(secBlade);

                const secTip = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.09, 6), doubleSideFeatherMat);
                secTip.rotateX(-Math.PI / 2);
                secTip.scale.set(1.0, 0.25, 1.0);
                secTip.position.set(0, 0, -sLen - 0.035);
                secGroup.add(secTip);

                shoulderPivot.add(secGroup);
            }

            // 腋羽與後側飛羽（參考照片中翅膀根部後方微露出的兩片小尖羽）
            for (let t = 0; t < 2; t++) {
                const tertial = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.20, 6), doubleSideFeatherMat);
                tertial.rotateX(-Math.PI / 2 + 0.08 * t);
                tertial.rotation.z = side * (0.18 + t * 0.12);
                tertial.scale.set(1.0, 0.25, 1.0);
                tertial.position.set(side * (0.10 + t * 0.05), -0.01, -0.34 - t * 0.04);
                shoulderPivot.add(tertial);
            }

            // 第二關節：外翼腕關節樞紐 (Outer Hand-Wing Pivot) — 放射展開 8 根分明開叉的指狀初級飛羽！
            const outerWingPivot = new THREE.Group();
            outerWingPivot.position.set(side * 0.54, 0.0, 0.16);
            shoulderPivot.add(outerWingPivot);

            // 外翼掌骨基座覆羽 (Primary Coverts Web)
            const handCovertShape = new THREE.Shape();
            handCovertShape.moveTo(0, 0.06);
            handCovertShape.lineTo(side * 0.28, -0.02);
            handCovertShape.lineTo(side * 0.22, -0.26);
            handCovertShape.lineTo(0, -0.34);
            handCovertShape.closePath();
            const handCovertMesh = new THREE.Mesh(new THREE.ShapeGeometry(handCovertShape, 8), doubleSidePlumageMat);
            handCovertMesh.rotation.x = -Math.PI / 2;
            outerWingPivot.add(handCovertMesh);

            // 🌟 8 根清晰分開、帶有指縫間隙的「指狀初級飛羽 (8 Slotted Finger-like Primary Feathers)」
            const primaryConfigs = [
                { angle: 0.20, bx: 0.04, bz: 0.04, len: 0.44, bw: 0.042, tw: 0.012, up: 0.05 }, // P10 最前緣短指羽
                { angle: 0.34, bx: 0.07, bz: 0.01, len: 0.62, bw: 0.048, tw: 0.014, up: 0.08 }, // P9  前緣長指羽
                { angle: 0.48, bx: 0.09, bz: -0.02, len: 0.72, bw: 0.052, tw: 0.015, up: 0.10 }, // P8  翼尖最長主指羽 1
                { angle: 0.62, bx: 0.09, bz: -0.05, len: 0.74, bw: 0.054, tw: 0.015, up: 0.09 }, // P7  翼尖最長主指羽 2
                { angle: 0.77, bx: 0.08, bz: -0.08, len: 0.70, bw: 0.054, tw: 0.016, up: 0.07 }, // P6  外側開叉長指羽
                { angle: 0.93, bx: 0.06, bz: -0.11, len: 0.63, bw: 0.056, tw: 0.018, up: 0.05 }, // P5  中段開叉指羽
                { angle: 1.10, bx: 0.04, bz: -0.15, len: 0.54, bw: 0.058, tw: 0.022, up: 0.03 }, // P4  後段開叉指羽
                { angle: 1.28, bx: 0.02, bz: -0.19, len: 0.45, bw: 0.062, tw: 0.026, up: 0.01 }  // P3  內側銜接初級飛羽
            ];

            const primaryFingerNodes = [];
            primaryConfigs.forEach((cfg, idx) => {
                const fingerPivot = new THREE.Group();
                fingerPivot.position.set(side * cfg.bx, idx * 0.0015, cfg.bz);
                fingerPivot.rotation.y = -side * (Math.PI / 2 - cfg.angle);
                fingerPivot.rotation.x = cfg.up;

                const innerLen = cfg.len * 0.48;
                const innerBladeGeo = new THREE.BoxGeometry(cfg.bw, 0.009, innerLen);
                const innerBlade = new THREE.Mesh(innerBladeGeo, doubleSideFeatherMat);
                innerBlade.position.set(0, 0, innerLen * 0.5);
                fingerPivot.add(innerBlade);

                const outerLen = cfg.len * 0.56;
                const fingerTipGeo = new THREE.ConeGeometry(cfg.bw * 0.44, outerLen, 6);
                fingerTipGeo.rotateX(Math.PI / 2);
                fingerTipGeo.scale(1.0, 0.22, 1.0);
                const fingerTip = new THREE.Mesh(fingerTipGeo, doubleSideFeatherMat);
                fingerTip.position.set(0, 0.004, innerLen + outerLen * 0.46);
                fingerTip.castShadow = true;
                fingerPivot.add(fingerTip);

                const shaftGeo = new THREE.CylinderGeometry(0.004, 0.008, cfg.len * 0.92, 5);
                shaftGeo.rotateX(Math.PI / 2);
                const shaft = new THREE.Mesh(shaftGeo, this.matCrowBeak);
                shaft.position.set(0, 0.005, cfg.len * 0.46);
                fingerPivot.add(shaft);

                outerWingPivot.add(fingerPivot);
                primaryFingerNodes.push({ pivot: fingerPivot, baseUp: cfg.up, idx: idx });
            });

            const wingData = {
                shoulder: shoulderPivot,
                outerWing: outerWingPivot,
                fingers: primaryFingerNodes,
                side: side
            };
            if (side === -1) this.crowFlightWings.left = wingData;
            else this.crowFlightWings.right = wingData;
        });
    }

    // 驅動烏鴉水平展翅高飛與指狀飛羽振翅動畫（支援 flightBlend: 0 = 站立收翅伸腳 <-> 1 = 水平收爪展翅飛行）
    animateCrowFlightPose(elapsedTime, flapSpeed = 11.5, flightBlend = 1.0) {
        if (!this.crowFlightRig || !this.crowFlightWings) return;
        const b = THREE.MathUtils.clamp(flightBlend, 0.0, 1.0);
        const fold = 1.0 - b;
        const phase = elapsedTime * flapSpeed;
        const sinW = Math.sin(phase);
        const cosW = Math.cos(phase);

        // 上揚時雙翼高舉（還原參考照片中雙翼昂揚上揮、指狀飛羽舒展開叉的經典瞬間！），下拍時有力壓氣推升
        const shoulderFlap = (0.24 + sinW * 0.56) * b;
        const forwardSweep = (cosW * 0.14) * b;
        const wristFlap = (0.12 + Math.sin(phase - 0.45) * 0.34) * b;

        [this.crowFlightWings.left, this.crowFlightWings.right].forEach((w) => {
            if (!w) return;
            const s = w.side;
            // b=1 時展翅拍動；b->0 (起飛前/降落時) 雙翼平滑向後收攏貼緊背側！
            w.shoulder.rotation.z = -s * shoulderFlap + s * fold * 0.15;
            w.shoulder.rotation.y = -s * forwardSweep + s * fold * 1.18;
            w.shoulder.rotation.x = (0.05 + sinW * 0.06) * b - fold * 0.22;
            w.shoulder.scale.setScalar(THREE.MathUtils.lerp(0.62, 1.0, b));

            w.outerWing.rotation.z = -s * wristFlap;
            w.outerWing.rotation.y = -s * (cosW * 0.08) * b + s * fold * 0.45;

            if (w.fingers) {
                w.fingers.forEach((f) => {
                    f.pivot.rotation.x = (f.baseUp + sinW * (0.04 + f.idx * 0.008)) * b;
                });
            }
        });

        // 身軀俯仰與頭頸角度：b=0 時挺胸站立 (-0.32)，b=1 時平滑轉為水平流線飛行 (0.0)
        if (this.crowFlightBodyPivot) {
            this.crowFlightBodyPivot.position.y = -sinW * 0.045 * b;
            this.crowFlightBodyPivot.rotation.x = THREE.MathUtils.lerp(-0.32, cosW * 0.04, b);
        }
        if (this.crowFlightHead) {
            this.crowFlightHead.rotation.x = THREE.MathUtils.lerp(0.30, -cosW * 0.03, b);
        }
        // 雙腳：b=1 時完全向上收攏貼緊下腹部（如飛行參考照片）；b->0 時平滑向下伸出踩地站立！
        if (this.crowFlightLegs) {
            const legFoldAngle = THREE.MathUtils.lerp(0.32, -1.42, b);
            const legScale = THREE.MathUtils.lerp(1.0, 0.25, b);
            ['left', 'right'].forEach((k) => {
                const leg = this.crowFlightLegs[k];
                if (leg) {
                    leg.rotation.x = legFoldAngle;
                    leg.scale.set(1.0, legScale, 1.0);
                }
            });
        }
        // 修長楔形尾羽隨振翅微調俯仰
        if (this.crowFlightTail) {
            this.crowFlightTail.rotation.x = THREE.MathUtils.lerp(-0.12, -0.15 + cosW * 0.05, b);
        }
    }

    // 切換幼雛 / 成年形態顯示
    updateCrowStage(stage = 'baby') {
        this.crowStage = stage;
        const isBaby = (stage === 'baby');
        if (this.crowFlightRig) this.crowFlightRig.visible = false;
        if (this.crowBabyGroup) this.crowBabyGroup.visible = isBaby;
        if (this.crowAdultGroup) this.crowAdultGroup.visible = !isBaby;
    }

    // ─────────────────────────────────────────────────────────
    //  🪶 烏鴉/渡鴉專屬動態引擎：
    //  - 幼雛：歪頭殺（好奇左右歪頭）、噗噗扇動小肉翅、索食張嘴、蹦跳小碎步（幼雛保持黑煤球小幼鳥外觀，不會突變成大鳥！）
    //  - 成年：沉穩呼吸、梳理黑曜羽翼、高昂長啼，並支援起飛<->高空展翅<->收翅伸爪降落無縫過渡！
    // ─────────────────────────────────────────────────────────
    updateCrow(delta, elapsedTime) {
        const t = elapsedTime;
        const isGameFlying = (this.currentState === 'crow_flying');
        const isBaby = (this.crowStage === 'baby');

        // 幼雛期觸發飛行小遊戲時：保持黑煤球幼雛外觀拍動小翅膀飛翔，起飛與降落皆為幼雛！
        if (isGameFlying && isBaby) {
            if (this.crowFlightRig) this.crowFlightRig.visible = false;
            if (this.crowAdultGroup) this.crowAdultGroup.visible = false;
            if (this.crowBabyGroup) {
                this.crowBabyGroup.visible = true;
                this.crowBabyGroup.position.y = 0.42 + Math.sin(t * 14) * 0.03;
                if (this.crowBabyWings && this.crowBabyWings.left) {
                    const flap = Math.sin(t * 20) * 0.55;
                    this.crowBabyWings.left.rotation.z = 0.35 + flap;
                    this.crowBabyWings.right.rotation.z = -0.35 - flap;
                }
            }
            return;
        }

        // 🦅 鳥類偶爾高空飛行控制器 (僅在成年期 !isBaby 且待機時觸發，避免幼雛突變成大鳥！)
        if (!this.birdFlight) {
            this.birdFlight = {
                timer: 7.0 + Math.random() * 6.0,
                phase: 'perch',
                phaseTime: 0.0,
                flightAngle: 0.0
            };
        }

        const bf = this.birdFlight;
        const isIdle = (this.currentState === 'idle' || !this.currentState);

        if (!isBaby && isIdle) {
            if (bf.phase === 'perch') {
                bf.timer -= delta;
                if (bf.timer <= 0) {
                    bf.phase = 'takeoff';
                    bf.phaseTime = 0.0;
                }
            } else if (bf.phase === 'takeoff') {
                bf.phaseTime += delta;
                if (bf.phaseTime >= 1.4) {
                    bf.phase = 'flying';
                    bf.phaseTime = 0.0;
                    bf.flightAngle = 0.0;
                }
            } else if (bf.phase === 'flying') {
                bf.phaseTime += delta;
                bf.flightAngle += delta * 1.35;
                if (bf.phaseTime >= 5.5) {
                    bf.phase = 'landing';
                    bf.phaseTime = 0.0;
                }
            } else if (bf.phase === 'landing') {
                bf.phaseTime += delta;
                if (bf.phaseTime >= 1.8) {
                    bf.phase = 'perch';
                    bf.phaseTime = 0.0;
                    bf.timer = 11.0 + Math.random() * 7.0;
                }
            }
        } else {
            bf.phase = 'perch';
            bf.timer = 10.0;
        }

        // ✈️ 若處於飛行小遊戲 ('crow_flying') 或成年待機自主飛行階段 ('takeoff' | 'flying' | 'landing')：
        const isAutoAirborne = !isBaby && isIdle && (bf.phase === 'takeoff' || bf.phase === 'flying' || bf.phase === 'landing');
        if ((isGameFlying || isAutoAirborne) && this.crowFlightRig) {
            if (this.crowBabyGroup) this.crowBabyGroup.visible = false;
            if (this.crowAdultGroup) this.crowAdultGroup.visible = false;
            this.crowFlightRig.visible = true;

            if (isGameFlying) {
                // 基底高度設為 0.65，與站立成鳥 (crowAdultGroup.position.y = 0.65) 完全對齊，起飛與降落零高度落差！
                this.crowFlightRig.position.set(0, 0.65, 0);
                this.crowFlightRig.rotation.set(0, 0, 0);
                return;
            }

            if (bf.phase === 'takeoff') {
                const p = Math.min(1.0, bf.phaseTime / 1.4);
                const easeP = 1 - Math.pow(1 - p, 2);
                const blend = Math.min(1.0, p * 1.35);
                this.crowFlightRig.position.set(0, THREE.MathUtils.lerp(0.65, 2.05, easeP), THREE.MathUtils.lerp(0, 0.35, easeP));
                this.crowFlightRig.rotation.set(-0.16 * Math.sin(p * Math.PI), 0, 0);
                this.animateCrowFlightPose(t, 14.0, blend);
            } else if (bf.phase === 'flying') {
                const fa = bf.flightAngle;
                const rx = Math.sin(fa) * 1.45;
                const rz = Math.cos(fa) * 1.10;
                const ry = 2.05 + Math.sin(fa * 2.0) * 0.20;
                const vx = Math.cos(fa) * 1.45;
                const vz = -Math.sin(fa) * 1.10;
                this.crowFlightRig.position.set(rx, ry, rz);
                this.crowFlightRig.rotation.y = Math.atan2(vx, vz);
                this.crowFlightRig.rotation.z = -0.24;
                this.crowFlightRig.rotation.x = -Math.cos(fa * 2.0) * 0.08;
                this.animateCrowFlightPose(t, 12.0, 1.0);
            } else if (bf.phase === 'landing') {
                const p = Math.min(1.0, bf.phaseTime / 1.8);
                const easeP = p * p * (3 - 2 * p);
                // 降落後段 (p > 0.35) 平滑將身體仰起、伸出雙腳、收攏雙翼 (flightBlend: 1 -> 0)，無縫銜接站立姿態！
                const blend = Math.max(0.0, 1.0 - Math.max(0, (p - 0.35) / 0.65));
                this.crowFlightRig.position.x = THREE.MathUtils.lerp(this.crowFlightRig.position.x, 0, easeP);
                this.crowFlightRig.position.z = THREE.MathUtils.lerp(this.crowFlightRig.position.z, 0, easeP);
                this.crowFlightRig.position.y = THREE.MathUtils.lerp(2.05, 0.65, easeP);
                this.crowFlightRig.rotation.x = THREE.MathUtils.lerp(0, -0.12, Math.sin(p * Math.PI));
                this.crowFlightRig.rotation.z = THREE.MathUtils.lerp(this.crowFlightRig.rotation.z, 0, easeP);
                this.crowFlightRig.rotation.y = THREE.MathUtils.lerp(this.crowFlightRig.rotation.y, 0, easeP);
                this.animateCrowFlightPose(t, 10.5, blend);
            }
            return;
        }

        // 非飛行狀態：隱藏飛行骨架，恢復幼雛或成年站立渡鴉模型
        if (this.crowFlightRig) {
            this.crowFlightRig.visible = false;
        }
        if (this.crowBabyGroup) this.crowBabyGroup.visible = isBaby;
        if (this.crowAdultGroup) this.crowAdultGroup.visible = !isBaby;

        if (isBaby) {
            if (!this.crowBabyGroup) return;

            // 1. 軟綿綿黑煤球幼雛呼吸律動
            const breathe = Math.sin(t * 3.6) * 0.012;
            this.crowBabyGroup.position.y = 0.42 + breathe;

            // 2. 幼鳥經典招牌「歪頭殺」（Inquisitive Head Tilting）
            const tiltCycle = t * 1.6;
            const headTiltZ = Math.sin(tiltCycle) * 0.25; // 左右傾斜
            const headPanY = Math.sin(tiltCycle * 0.5) * 0.2; // 左右觀望
            const headPitchX = Math.sin(tiltCycle * 0.8) * 0.08 - 0.05; // 仰望主人

            if (this.currentState === 'happy' || this.currentState === 'eat') {
                // 索食或超開心：興奮上下點頭 ＋ 幼鳥小翅膀「噗噗噗」超高速快速拍動！
                this.crowBabyHead.rotation.x = Math.sin(t * 14) * 0.16;
                this.crowBabyHead.rotation.z = Math.sin(t * 6) * 0.1;
                this.crowBabyHead.rotation.y = 0;

                // 幼鳥張大嫩黃嘴嗷嗷待哺
                if (this.crowBabyBeak) {
                    this.crowBabyBeak.rotation.x = Math.abs(Math.sin(t * 12)) * 0.25;
                }

                // 兩側小肉翅高頻扇動 (Flapping baby wings!)
                const wingFlap = Math.sin(t * 28) * 0.55;
                if (this.crowBabyWings.left) {
                    this.crowBabyWings.left.rotation.z = -0.3 + wingFlap;
                    this.crowBabyWings.left.rotation.y = -0.2 - wingFlap * 0.3;
                }
                if (this.crowBabyWings.right) {
                    this.crowBabyWings.right.rotation.z = 0.3 - wingFlap;
                    this.crowBabyWings.right.rotation.y = 0.2 + wingFlap * 0.3;
                }

                // 雀躍小蹦跳
                this.crowBabyGroup.position.y = 0.42 + Math.abs(Math.sin(t * 12)) * 0.1;
            } else if (this.currentState === 'pet') {
                // 撫摸中：舒服地瞇起眼睛、腦袋偏向撫摸方向、翅膀微張
                this.crowBabyHead.rotation.x = -0.15;
                this.crowBabyHead.rotation.z = 0.18;
                this.crowBabyHead.rotation.y = 0.05;
                if (this.crowBabyWings.left) this.crowBabyWings.left.rotation.z = -0.25;
                if (this.crowBabyWings.right) this.crowBabyWings.right.rotation.z = 0.25;
                if (this.crowBabyBeak) this.crowBabyBeak.rotation.x = 0.05;
            } else if (this.currentState === 'sleep') {
                // 睡覺中：整個毛球窩在地上，腦袋埋進胸口
                this.crowBabyGroup.position.y = 0.32;
                this.crowBabyHead.rotation.x = 0.28;
                this.crowBabyHead.rotation.z = 0.05;
                this.crowBabyHead.rotation.y = 0.12;
                if (this.crowBabyBeak) this.crowBabyBeak.rotation.x = 0;
                if (this.crowBabyWings.left) this.crowBabyWings.left.rotation.z = 0.05;
                if (this.crowBabyWings.right) this.crowBabyWings.right.rotation.z = -0.05;
            } else {
                // 一般待機：自然歪頭看主人，小毛球尾巴微擺，偶爾快扇小肉翅
                this.crowBabyHead.rotation.z = headTiltZ;
                this.crowBabyHead.rotation.y = headPanY;
                this.crowBabyHead.rotation.x = headPitchX;
                if (this.crowBabyBeak) this.crowBabyBeak.rotation.x = 0;

                const babyFlap = (bf.phase === 'flying' || bf.phase === 'takeoff') ? Math.sin(t * 18.0) * 0.45 : 0;
                if (this.crowBabyWings.left) this.crowBabyWings.left.rotation.z = Math.sin(t * 2) * 0.04 - babyFlap;
                if (this.crowBabyWings.right) this.crowBabyWings.right.rotation.z = -Math.sin(t * 2) * 0.04 + babyFlap;
            }

            // 小短尾巴上下萌萌微晃
            if (this.crowBabyTail) {
                this.crowBabyTail.rotation.x = 0.25 + Math.sin(t * 4.5) * 0.08;
            }

        } else {
            // 成年極夜渡鴉大佬
            if (!this.crowAdultGroup) return;

            // 1. 沉穩大氣的深呼吸
            const breathe = Math.sin(t * 2.2) * 0.015;

            // 2. 喉部披針刺羽隨氣流微動
            if (this.crowAdultHackles) {
                this.crowAdultHackles.rotation.x = Math.sin(t * 3.5) * 0.05;
            }

            if (this.currentState === 'happy') {
                this.crowAdultGroup.position.set(0, 0.65 + breathe, 0);
                this.crowAdultGroup.rotation.set(0, 0, 0);
                // 大佬昂首長啼：胸膛挺起、大喙張開、黑色巨翼霸氣半展！
                this.crowAdultHead.rotation.x = -0.32; // 昂天
                this.crowAdultHead.rotation.y = Math.sin(t * 2) * 0.08;
                if (this.crowAdultBeak) {
                    this.crowAdultBeak.rotation.x = 0.28 + Math.sin(t * 8) * 0.1;
                }

                // 霸氣展翼
                const wingSpread = 0.65 + Math.sin(t * 4) * 0.15;
                if (this.crowAdultWings.left) {
                    this.crowAdultWings.left.rotation.z = -wingSpread;
                    this.crowAdultWings.left.rotation.y = -0.4;
                }
                if (this.crowAdultWings.right) {
                    this.crowAdultWings.right.rotation.z = wingSpread;
                    this.crowAdultWings.right.rotation.y = 0.4;
                }

                // 尾羽下壓展開
                if (this.crowAdultTail) {
                    this.crowAdultTail.rotation.x = -0.15 + Math.sin(t * 3) * 0.08;
                }
            } else if (this.currentState === 'eat') {
                this.crowAdultGroup.position.set(0, 0.65 + breathe, 0);
                this.crowAdultGroup.rotation.set(0, 0, 0);
                this.crowAdultNeck.rotation.x = 0.4 + Math.sin(t * 10) * 0.25;
                if (this.crowAdultBeak) {
                    this.crowAdultBeak.rotation.x = Math.abs(Math.sin(t * 10)) * 0.2;
                }
                if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.z = -0.1;
                if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.z = 0.1;
            } else if (this.currentState === 'pet') {
                this.crowAdultGroup.position.set(0, 0.65 + breathe, 0);
                this.crowAdultGroup.rotation.set(0, 0, 0);
                this.crowAdultHead.rotation.x = -0.12;
                this.crowAdultHead.rotation.z = 0.14;
                if (this.crowAdultHackles) this.crowAdultHackles.scale.set(1.15, 1.15, 1.15);
                if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.z = -0.05;
                if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.z = 0.05;
            } else if (this.currentState === 'sleep') {
                this.crowAdultGroup.position.set(0, 0.52, 0);
                this.crowAdultGroup.rotation.set(0, 0, 0);
                this.crowAdultHead.rotation.x = 0.18;
                this.crowAdultHead.rotation.y = 0.25;
                if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.z = 0.05;
                if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.z = -0.05;
                if (this.crowAdultHackles) this.crowAdultHackles.scale.set(1.0, 1.0, 1.0);
            } else {
                if (bf.phase === 'takeoff') {
                    // 起飛：深色巨翼怒展升空
                    const p = Math.min(1.0, bf.phaseTime / 1.4);
                    this.crowAdultGroup.position.y = THREE.MathUtils.lerp(0.65, 2.15, p);
                    this.crowAdultGroup.rotation.x = -0.22 * p;
                    const flap = Math.sin(t * 20.0) * 0.75;
                    if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.z = -0.5 - flap;
                    if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.z = 0.5 + flap;
                } else if (bf.phase === 'flying') {
                    // 巡航飛行：穿行房間上空
                    const fa = bf.flightAngle;
                    const rx = Math.sin(fa) * 1.35;
                    const rz = Math.cos(fa) * 1.05;
                    const ry = 2.1 + Math.sin(fa * 2.0) * 0.22;
                    this.crowAdultGroup.position.set(rx, ry, rz);
                    this.crowAdultGroup.rotation.y = fa + Math.PI / 2;
                    this.crowAdultGroup.rotation.z = -0.26;
                    this.crowAdultGroup.rotation.x = 0.03;

                    const isGliding = Math.sin(fa * 3.2) > 0.15;
                    const wingFlap = isGliding ? 0.04 : Math.sin(t * 15.0) * 0.65;
                    if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.z = -0.65 - wingFlap;
                    if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.z = 0.65 + wingFlap;
                } else if (bf.phase === 'landing') {
                    // 減速著陸
                    const p = Math.min(1.0, bf.phaseTime / 1.8);
                    this.crowAdultGroup.position.x = THREE.MathUtils.lerp(this.crowAdultGroup.position.x, 0, p);
                    this.crowAdultGroup.position.z = THREE.MathUtils.lerp(this.crowAdultGroup.position.z, 0, p);
                    this.crowAdultGroup.position.y = THREE.MathUtils.lerp(this.crowAdultGroup.position.y, 0.65, p);
                    this.crowAdultGroup.rotation.x = -0.25 * (1.0 - p);
                    this.crowAdultGroup.rotation.z = THREE.MathUtils.lerp(this.crowAdultGroup.rotation.z, 0, p);
                    this.crowAdultGroup.rotation.y = THREE.MathUtils.lerp(this.crowAdultGroup.rotation.y, 0, p);

                    if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.z = -0.85 * (1.0 - p);
                    if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.z = 0.85 * (1.0 - p);
                } else {
                    // 一般待機：威嚴敏銳環視四周，氣場十足
                    this.crowAdultGroup.position.set(0, 0.65 + breathe, 0);
                    this.crowAdultGroup.rotation.set(0, 0, 0);
                    this.crowAdultHead.rotation.x = Math.sin(t * 1.2) * 0.04;
                    this.crowAdultHead.rotation.y = Math.sin(t * 0.7) * 0.18;
                    this.crowAdultHead.rotation.z = 0;
                    if (this.crowAdultBeak) this.crowAdultBeak.rotation.x = 0;
                    if (this.crowAdultHackles) this.crowAdultHackles.scale.set(1.0, 1.0, 1.0);

                    // 雙翼自然收攏在背部
                    if (this.crowAdultWings.left) this.crowAdultWings.left.rotation.set(0, 0, 0);
                    if (this.crowAdultWings.right) this.crowAdultWings.right.rotation.set(0, 0, 0);

                    // 楔形尾羽微動
                    if (this.crowAdultTail) {
                        this.crowAdultTail.rotation.y = Math.sin(t * 1.5) * 0.06;
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    //  🌾 南美鬃狼 / 長腿狐狼（Maned Wolf）3D 模型引擎：
    //  1. 幼崽期：煙灰小短腿毛茸幼崽（參考圖 2：灰褐圓滾滾、好奇大耳、黑吻部）
    //  2. 成年期：九頭身長腿超模狼（參考圖 1 & 2：逆天黑長襪細腿、金橘狐毛、背脊黑鬃、白喉白尾尖、同側步踱步）
    // ─────────────────────────────────────────────────────────
    buildManedWolfMesh() {
        this.manedWolfStage = 'baby'; // 'baby' | 'adult'
        this.manedWolfRoot = new THREE.Group();
        this.root.add(this.manedWolfRoot);

        // 配件系統與相容性虛擬節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.tailBase = new THREE.Group();
        this.legs = { frontLeft: new THREE.Group(), frontRight: new THREE.Group(), backLeft: new THREE.Group(), backRight: new THREE.Group() };
        this.tongue = new THREE.Group();
        this.snout = new THREE.Group();
        this.manedWolfRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼崽期煙灰圓滾短腿崽
        this.buildManedWolfPupMesh();

        // 2. 成年期九頭身超模鬃狼
        this.buildManedWolfAdultMesh();

        // 預設呈現幼崽期
        this.updateManedWolfStage('baby');
    }

    // 1. 幼崽期：煙燻灰褐毛茸幼崽 (參考圖 2：圓滾滾小身子、小短腿、好奇大眼、黑吻部)
    buildManedWolfPupMesh() {
        this.manedWolfPupGroup = new THREE.Group();
        this.manedWolfPupGroup.name = 'ManedWolfPupGroup';
        this.manedWolfPupGroup.position.set(0, 0.45, 0);
        this.manedWolfRoot.add(this.manedWolfPupGroup);

        // 1.1 圓滾滾煙灰小軀幹 (Fluffy Chubby Body)
        const pupTorsoGeo = new THREE.SphereGeometry(0.38, 18, 18);
        pupTorsoGeo.scale(0.95, 0.95, 1.25);
        const pupTorso = new THREE.Mesh(pupTorsoGeo, this.matManedWolfPupCoat);
        pupTorso.position.set(0, 0, 0);
        pupTorso.castShadow = true;
        this.manedWolfPupGroup.add(pupTorso);

        // 幼崽肚肚軟毛
        const bellyGeo = new THREE.SphereGeometry(0.28, 14, 14);
        bellyGeo.scale(0.9, 0.8, 1.1);
        const belly = new THREE.Mesh(bellyGeo, this.matManedWolfPupCoat);
        belly.position.set(0, -0.06, -0.15);
        this.manedWolfPupGroup.add(belly);

        // 1.2 幼崽短頸與大圓頭 (Pup Head)
        const pupNeck = new THREE.Group();
        pupNeck.position.set(0, 0.2, 0.35);
        this.manedWolfPupGroup.add(pupNeck);
        this.manedWolfPupNeck = pupNeck;

        const pupHead = new THREE.Group();
        pupNeck.add(pupHead);
        this.manedWolfPupHead = pupHead;

        // 大頭顱
        const headGeo = new THREE.SphereGeometry(0.32, 18, 18);
        headGeo.scale(0.98, 0.95, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matManedWolfPupCoat);
        headMesh.position.set(0, 0.15, 0.05);
        headMesh.castShadow = true;
        pupHead.add(headMesh);

        // 幼崽黑面具與吻部 (Dark Charcoal Mask & Muzzle)
        const snoutGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.22, 12);
        snoutGeo.rotateX(Math.PI / 2);
        snoutGeo.scale(0.85, 0.85, 1.0);
        const snout = new THREE.Mesh(snoutGeo, this.matManedWolfPupMuzzle);
        snout.position.set(0, 0.08, 0.28);
        pupHead.add(snout);

        // 小黑鼻頭
        const noseGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const nose = new THREE.Mesh(noseGeo, this.matNose);
        nose.position.set(0, 0.1, 0.38);
        pupHead.add(nose);

        // 幼崽大耳朵（圓鈍可愛）
        [-1, 1].forEach((side) => {
            const earGeo = new THREE.ConeGeometry(0.12, 0.24, 6);
            earGeo.scale(1.0, 1.0, 0.45);
            const ear = new THREE.Mesh(earGeo, this.matManedWolfPupCoat);
            ear.position.set(side * 0.18, 0.38, 0.02);
            ear.rotation.z = -side * 0.3;
            ear.rotation.x = -0.15;

            // 耳內淺色絨毛
            const innerEarGeo = new THREE.ConeGeometry(0.08, 0.18, 6);
            innerEarGeo.scale(0.9, 0.9, 0.3);
            const innerEar = new THREE.Mesh(innerEarGeo, this.matInnerEar);
            innerEar.position.set(0, -0.02, 0.03);
            ear.add(innerEar);

            pupHead.add(ear);
        });

        // 幼崽純真水汪汪大眼睛 (Baby Maned Wolf Puppy Eyes with Catchlights)
        const eyeRingGeo = new THREE.TorusGeometry(0.072, 0.014, 8, 16);
        const eyeIrisGeo = new THREE.SphereGeometry(0.068, 16, 16);
        eyeIrisGeo.scale(1.0, 1.0, 0.65);
        const pupilGeo = new THREE.SphereGeometry(0.044, 14, 14);
        pupilGeo.scale(1.0, 1.0, 0.4);
        const shine1Geo = new THREE.SphereGeometry(0.018, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.010, 8, 8);

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.145, 0.19, 0.335);
            eyeGroup.rotation.y = side * 0.28;
            eyeGroup.rotation.x = -0.04;

            // 眼眶黑毛邊（襯托眼形，立體分明）
            const eyeRing = new THREE.Mesh(eyeRingGeo, this.matManedWolfEyeRing);
            eyeRing.position.set(0, 0, 0.012);

            // 靈動暖琥珀虹膜（溫潤透亮）
            const iris = new THREE.Mesh(eyeIrisGeo, this.matManedWolfPupEye);

            // 水汪汪黑瞳孔
            const pupil = new THREE.Mesh(pupilGeo, this.matPupil);
            pupil.position.set(0, 0, 0.026);

            // 雙高光反光（主光斑 + 星光小亮斑，營造頂級水汪汪萌寵感）
            const shine1 = new THREE.Mesh(shine1Geo, this.matShine);
            shine1.position.set(side * 0.016, 0.020, 0.046);
            const shine2 = new THREE.Mesh(shine2Geo, this.matShine);
            shine2.position.set(-side * 0.014, -0.015, 0.046);

            eyeGroup.add(eyeRing, iris, pupil, shine1, shine2);
            pupHead.add(eyeGroup);

            if (side === -1) {
                this.manedWolfPupEyeL = eyeGroup;
            } else {
                this.manedWolfPupEyeR = eyeGroup;
            }
        });

        // 1.3 幼崽小短腿（四條小萌腿，還未長成大長腿）
        this.manedWolfPupLegs = {};
        const legOffsets = [
            ['frontLeft', -0.16, -0.18, 0.22],
            ['frontRight', 0.16, -0.18, 0.22],
            ['backLeft', -0.16, -0.18, -0.25],
            ['backRight', 0.16, -0.18, -0.25]
        ];
        legOffsets.forEach(([name, x, y, z]) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(x, y, z);
            this.manedWolfPupGroup.add(legPivot);

            const legGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.26, 8);
            const leg = new THREE.Mesh(legGeo, this.matManedWolfPupCoat);
            leg.position.set(0, -0.12, 0);
            legPivot.add(leg);

            // 小黑爪爪
            const pawGeo = new THREE.SphereGeometry(0.05, 8, 8);
            pawGeo.scale(1.0, 0.65, 1.3);
            const paw = new THREE.Mesh(pawGeo, this.matManedWolfPupMuzzle);
            paw.position.set(0, -0.24, 0.03);
            legPivot.add(paw);

            this.manedWolfPupLegs[name] = legPivot;
        });

        // 1.4 幼崽毛茸小尾巴
        const pupTailGeo = new THREE.SphereGeometry(0.12, 10, 10);
        pupTailGeo.scale(0.8, 0.8, 1.8);
        const pupTail = new THREE.Mesh(pupTailGeo, this.manedWolfPupCoat);
        pupTail.position.set(0, 0.02, -0.42);
        pupTail.rotation.x = -0.4;
        this.manedWolfPupGroup.add(pupTail);
        this.manedWolfPupTail = pupTail;
    }

    // 2. 成年期：九頭身逆天長腿超模鬃狼 (參考圖 1 & 2：大長黑過膝襪、金橘紅狐身、高聳黑鬃脊、白喉白尾尖)
    buildManedWolfAdultMesh() {
        this.manedWolfAdultGroup = new THREE.Group();
        this.manedWolfAdultGroup.name = 'ManedWolfAdultGroup';
        this.manedWolfAdultGroup.position.set(0, 0.95, 0); // 體型高挑，離地中心高
        this.manedWolfRoot.add(this.manedWolfAdultGroup);

        // 2.1 高挑流線型金橘軀幹 (Slender Golden-Red Torso)
        const adultTorsoGeo = new THREE.SphereGeometry(0.38, 20, 20);
        adultTorsoGeo.scale(0.78, 1.12, 1.55);
        const adultTorso = new THREE.Mesh(adultTorsoGeo, this.matManedWolfAdultCoat);
        adultTorso.position.set(0, 0, 0);
        adultTorso.castShadow = true;
        this.manedWolfAdultGroup.add(adultTorso);

        // 豐滿深胸膛 (Deep Muscular Chest)
        const chestGeo = new THREE.SphereGeometry(0.32, 16, 16);
        chestGeo.scale(0.82, 1.15, 1.1);
        const chest = new THREE.Mesh(chestGeo, this.matManedWolfAdultCoat);
        chest.position.set(0, -0.06, 0.35);
        this.manedWolfAdultGroup.add(chest);

        // 2.2 招牌高聳黑鬃毛 (Iconic Black Dorsal Mane Crest - 遇到動靜炸毛！)
        const maneGroup = new THREE.Group();
        maneGroup.position.set(0, 0.36, 0.1);
        this.manedWolfAdultGroup.add(maneGroup);
        this.manedWolfAdultMane = maneGroup;

        // 沿著頸背排布的 10 組直立黑鬃刺毛簇
        for (let i = 0; i < 9; i++) {
            const zPos = 0.35 - i * 0.11;
            const h = (i < 4) ? (0.28 + i * 0.04) : (0.42 - (i - 4) * 0.05); // 頸背最高處聳立
            const mGeo = new THREE.ConeGeometry(0.045, h, 4);
            mGeo.scale(1.2, 1.0, 0.4); // 壓扁呈毛片狀
            const maneMesh = new THREE.Mesh(mGeo, this.matManedWolfMane);
            maneMesh.position.set(0, 0, zPos);
            maneMesh.rotation.x = -0.25 + i * 0.04;
            maneMesh.castShadow = true;
            maneGroup.add(maneMesh);
        }

        // 2.3 優雅長頸與狐形俊美頭部 (Long Slender Neck & Regal Fox-like Head)
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 0.28, 0.52);
        this.manedWolfAdultGroup.add(neckPivot);
        this.manedWolfAdultNeck = neckPivot;

        // 修長脖頸
        const neckMeshGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.42, 14);
        neckMeshGeo.scale(0.8, 1.0, 1.1);
        const neckMesh = new THREE.Mesh(neckMeshGeo, this.matManedWolfAdultCoat);
        neckMesh.position.set(0, 0.12, 0.08);
        neckMesh.rotation.x = 0.4;
        neckPivot.add(neckMesh);

        // 喉部純白飾毛 (Pure White Throat & Bib Patch)
        const whiteThroatGeo = new THREE.SphereGeometry(0.16, 12, 12);
        whiteThroatGeo.scale(0.8, 1.4, 0.7);
        const whiteThroat = new THREE.Mesh(whiteThroatGeo, this.matManedWolfWhitePatch);
        whiteThroat.position.set(0, 0.08, 0.24);
        whiteThroat.rotation.x = 0.35;
        neckPivot.add(whiteThroat);

        // 頭部主節點
        const headPivot = new THREE.Group();
        headPivot.position.set(0, 0.34, 0.22);
        neckPivot.add(headPivot);
        this.manedWolfAdultHead = headPivot;

        // 狐狼俊雅頭顱
        const headGeo = new THREE.SphereGeometry(0.24, 18, 18);
        headGeo.scale(0.82, 0.95, 1.25);
        const head = new THREE.Mesh(headGeo, this.matManedWolfAdultCoat);
        head.position.set(0, 0.08, 0);
        head.castShadow = true;
        headPivot.add(head);

        // 下巴純白毛片 (White Chin)
        const chinGeo = new THREE.ConeGeometry(0.06, 0.18, 6);
        chinGeo.rotateX(Math.PI / 2);
        chinGeo.scale(1.0, 0.6, 1.0);
        const chin = new THREE.Mesh(chinGeo, this.matManedWolfWhitePatch);
        chin.position.set(0, -0.06, 0.16);
        headPivot.add(chin);

        // 標誌性修長墨黑狐系吻部 (Slender Black Muzzle)
        const muzzleGeo = new THREE.CylinderGeometry(0.06, 0.11, 0.34, 12);
        muzzleGeo.rotateX(Math.PI / 2);
        muzzleGeo.scale(0.8, 0.85, 1.0);
        const muzzle = new THREE.Mesh(muzzleGeo, this.matManedWolfBlackMuzzle);
        muzzle.position.set(0, 0.04, 0.28);
        headPivot.add(muzzle);

        // 濕潤黑鼻頭
        const noseGeo = new THREE.SphereGeometry(0.038, 8, 8);
        const nose = new THREE.Mesh(noseGeo, this.matNose);
        nose.position.set(0, 0.07, 0.44);
        headPivot.add(nose);

        // 超大狐狼尖立耳（耳內純白絨毛）
        [-1, 1].forEach((side) => {
            const earPivot = new THREE.Group();
            earPivot.position.set(side * 0.14, 0.26, -0.05);
            earPivot.rotation.z = -side * 0.22;
            earPivot.rotation.x = -0.15;
            earPivot.rotation.y = side * 0.18;

            // 大耳外廓
            const earGeo = new THREE.ConeGeometry(0.12, 0.42, 6);
            earGeo.scale(1.1, 1.0, 0.35);
            const ear = new THREE.Mesh(earGeo, this.matManedWolfAdultCoat);
            ear.position.set(0, 0.18, 0);
            earPivot.add(ear);

            // 耳內純白襯毛 (White Ear Lining)
            const innerGeo = new THREE.ConeGeometry(0.08, 0.34, 6);
            innerGeo.scale(0.9, 0.9, 0.25);
            const inner = new THREE.Mesh(innerGeo, this.matManedWolfWhitePatch);
            inner.position.set(0, 0.16, 0.035);
            earPivot.add(inner);

            headPivot.add(earPivot);
        });

        // 靈動金琥珀色魔瞳
        const adultEyeIrisGeo = new THREE.SphereGeometry(0.052, 14, 14);
        adultEyeIrisGeo.scale(1.0, 1.0, 0.65);
        const adultPupilGeo = new THREE.SphereGeometry(0.034, 12, 12);
        adultPupilGeo.scale(1.0, 1.0, 0.4);

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.125, 0.13, 0.215);
            eyeGroup.rotation.y = side * 0.32;

            const eyeAmber = new THREE.Mesh(adultEyeIrisGeo, this.matManedWolfAmberEye);
            const eyePupil = new THREE.Mesh(adultPupilGeo, this.matPupil);
            eyePupil.position.z = 0.024;
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine1.position.set(side * 0.012, 0.015, 0.042);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), this.matShine);
            shine2.position.set(-side * 0.010, -0.012, 0.042);

            eyeGroup.add(eyeAmber, eyePupil, shine1, shine2);
            headPivot.add(eyeGroup);

            if (side === -1) {
                this.manedWolfAdultEyeL = eyeGroup;
            } else {
                this.manedWolfAdultEyeR = eyeGroup;
            }
        });

        // 2.4 逆天超模黑色長筒過膝長腿 (The Supermodel Long Stilt Legs with Black Stockings)
        this.manedWolfAdultLegs = {};
        const adultLegConfig = [
            ['frontLeft', -0.15, -0.15, 0.32],
            ['frontRight', 0.15, -0.15, 0.32],
            ['backLeft', -0.15, -0.15, -0.36],
            ['backRight', 0.15, -0.15, -0.36]
        ];

        adultLegConfig.forEach(([name, x, y, z]) => {
            const legRoot = new THREE.Group();
            legRoot.position.set(x, y, z);
            this.manedWolfAdultGroup.add(legRoot);

            // 大腿上段（金橘色皮毛，長度約 0.32）
            const thighGeo = new THREE.CylinderGeometry(0.065, 0.048, 0.34, 10);
            const thigh = new THREE.Mesh(thighGeo, this.matManedWolfAdultCoat);
            thigh.position.set(0, -0.15, 0);
            legRoot.add(thigh);

            // 膝關節以下：極致修長的「純黑過膝長筒襪 / 黑長靴」（長度達 0.58）
            const stockingGeo = new THREE.CylinderGeometry(0.042, 0.026, 0.58, 10);
            const stocking = new THREE.Mesh(stockingGeo, this.matManedWolfStockings);
            stocking.position.set(0, -0.58, 0.02);
            stocking.castShadow = true;
            legRoot.add(stocking);

            // 黑色纖細優雅腳爪
            const pawGeo = new THREE.SphereGeometry(0.038, 8, 8);
            pawGeo.scale(0.9, 0.6, 1.4);
            const paw = new THREE.Mesh(pawGeo, this.matManedWolfStockings);
            paw.position.set(0, -0.86, 0.04);
            legRoot.add(paw);

            this.manedWolfAdultLegs[name] = legRoot;
        });

        // 2.5 招牌白尾尖大蓬尾 (Bushy Red Tail with Distinctive White Tip)
        const tailPivot = new THREE.Group();
        tailPivot.position.set(0, 0.05, -0.56);
        tailPivot.rotation.x = -0.45;
        this.manedWolfAdultGroup.add(tailPivot);
        this.manedWolfAdultTail = tailPivot;

        // 尾巴前半部金橘蓬毛
        const tailMainGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.45, 10);
        tailMainGeo.scale(1.0, 1.0, 1.1);
        const tailMain = new THREE.Mesh(tailMainGeo, this.matManedWolfAdultCoat);
        tailMain.position.set(0, -0.22, 0);
        tailPivot.add(tailMain);

        // 尾巴末端 1/3 招牌純白毛尖 (Pure White Tail Tip)
        const tailTipGeo = new THREE.ConeGeometry(0.11, 0.28, 10);
        const tailTip = new THREE.Mesh(tailTipGeo, this.matManedWolfWhitePatch);
        tailTip.position.set(0, -0.54, 0);
        tailTip.rotation.x = Math.PI; // 尖端朝下
        tailPivot.add(tailTip);
    }

    // 切換幼崽 / 成年形態顯示
    updateManedWolfStage(stage) {
        this.manedWolfStage = stage;
        const isBaby = (stage === 'baby');
        if (this.manedWolfPupGroup) this.manedWolfPupGroup.visible = isBaby;
        if (this.manedWolfAdultGroup) this.manedWolfAdultGroup.visible = !isBaby;
        this.eyeLeft = isBaby ? this.manedWolfPupEyeL : this.manedWolfAdultEyeL;
        this.eyeRight = isBaby ? this.manedWolfPupEyeR : this.manedWolfAdultEyeR;
    }

    // ─────────────────────────────────────────────────────────
    //  🌾 鬃狼專屬動態引擎：
    //  - 幼崽：短腿小步快跑、呆萌搖頭、小短尾搖擺
    //  - 成年超模：
    //    1. 招牌「同側步踱步」（Pacing Gait：左前+左後同時邁、右前+右後同時邁，宛如 T 台走秀！）
    //    2. 背脊黑鬃毛炸毛豎立（興奮長嚎時黑鬃聳起！）
    //    3. 空靈長嚎與挺胸傲立
    // ─────────────────────────────────────────────────────────
    updateManedWolf(delta, elapsedTime) {
        const t = elapsedTime;
        this.updateCanineAutonomy(delta, elapsedTime);
        const isBaby = (this.manedWolfStage === 'baby');

        // 眨眼動畫
        this.nextBlinkTime = (this.nextBlinkTime || 3.0) - delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.5 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        } else if (this.currentState === 'sleep') {
            if (this.eyeLeft) this.eyeLeft.scale.y = 0.12;
            if (this.eyeRight) this.eyeRight.scale.y = 0.12;
        } else {
            if (this.eyeLeft && this.eyeLeft.scale.y !== 1) this.eyeLeft.scale.y = 1;
            if (this.eyeRight && this.eyeRight.scale.y !== 1) this.eyeRight.scale.y = 1;
        }

        if (isBaby) {
            if (!this.manedWolfPupGroup) return;

            // 幼崽呼吸
            const breathe = Math.sin(t * 3.5) * 0.01;
            this.manedWolfPupGroup.position.y = 0.45 + breathe;

            if (this.currentState === 'happy') {
                // 幼崽歡樂小碎步快跑
                const runCycle = t * 10;
                this.manedWolfPupLegs.frontLeft.rotation.x = Math.sin(runCycle) * 0.4;
                this.manedWolfPupLegs.frontRight.rotation.x = -Math.sin(runCycle) * 0.4;
                this.manedWolfPupLegs.backLeft.rotation.x = -Math.sin(runCycle) * 0.4;
                this.manedWolfPupLegs.backRight.rotation.x = Math.sin(runCycle) * 0.4;

                this.manedWolfPupHead.rotation.x = Math.sin(t * 8) * 0.12;
                this.manedWolfPupTail.rotation.y = Math.sin(t * 14) * 0.55;
            } else if (this.currentState === 'sleep') {
                this.manedWolfPupGroup.position.y = 0.32;
                this.manedWolfPupHead.rotation.x = 0.25;
                this.resetManedWolfPupLegs();
            } else {
                if (this.autonomy && this.autonomy.state === 'walking') {
                    const wc = this.autonomy.walkCycle;
                    this.manedWolfPupGroup.position.y = 0.45 + Math.abs(Math.sin(wc * 2)) * 0.03;
                    this.manedWolfPupLegs.frontLeft.rotation.x = Math.sin(wc) * 0.4;
                    this.manedWolfPupLegs.frontRight.rotation.x = -Math.sin(wc) * 0.4;
                    this.manedWolfPupLegs.backLeft.rotation.x = -Math.sin(wc) * 0.4;
                    this.manedWolfPupLegs.backRight.rotation.x = Math.sin(wc) * 0.4;
                } else {
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.manedWolfPupGroup.position.y = THREE.MathUtils.lerp(0.45, 0.30, lf) + Math.sin(t * 2.0) * 0.008;
                    this.manedWolfPupLegs.frontLeft.rotation.x = -0.4 * lf;
                    this.manedWolfPupLegs.frontRight.rotation.x = -0.4 * lf;
                    this.manedWolfPupLegs.backLeft.rotation.x = 0.7 * lf;
                    this.manedWolfPupLegs.backRight.rotation.x = 0.7 * lf;
                    this.manedWolfPupHead.rotation.x = 0.1 * lf + Math.sin(t * 1.5) * 0.04;
                    this.manedWolfPupHead.rotation.y = Math.sin(t * 0.8) * 0.12;
                    this.manedWolfPupTail.rotation.y = Math.sin(t * 3.5) * 0.2;
                }
            }

        } else {
            // 成年九頭身長腿超模鬃狼
            if (!this.manedWolfAdultGroup) return;

            // 1. 優美起伏呼吸律動
            const breathe = Math.sin(t * 2.4) * 0.014;
            this.manedWolfAdultGroup.position.y = 0.95 + breathe;

            // 2. 尾巴白尖自然微擺
            if (this.manedWolfAdultTail) {
                this.manedWolfAdultTail.rotation.y = Math.sin(t * 2.8) * 0.18;
            }

            if (this.currentState === 'happy') {
                // 興奮狀態：黑鬃毛「炸毛」聳起 ＋ 昂首空靈吼吠 (Roar-Bark)！
                if (this.manedWolfAdultMane) {
                    this.manedWolfAdultMane.scale.y = 1.35 + Math.sin(t * 6) * 0.1; // 黑鬃高聳豎起！
                }
                this.manedWolfAdultHead.rotation.x = -0.32; // 昂首向天
                this.manedWolfAdultHead.rotation.y = Math.sin(t * 2.5) * 0.08;

                // 歡快踩高蹺小跳步
                const bounce = Math.sin(t * 8);
                this.manedWolfAdultLegs.frontLeft.rotation.x = bounce * 0.25;
                this.manedWolfAdultLegs.frontRight.rotation.x = -bounce * 0.25;
                this.manedWolfAdultLegs.backLeft.rotation.x = bounce * 0.25;
                this.manedWolfAdultLegs.backRight.rotation.x = -bounce * 0.25;

            } else if (this.currentState === 'eat') {
                // 優雅長腿伏低吃食
                if (this.manedWolfAdultMane) this.manedWolfAdultMane.scale.y = 1.0;
                this.manedWolfAdultNeck.rotation.x = 0.55 + Math.sin(t * 8) * 0.08;
                this.manedWolfAdultHead.rotation.x = 0.2;
                this.manedWolfAdultLegs.frontLeft.rotation.x = 0.18;
                this.manedWolfAdultLegs.frontRight.rotation.x = 0.18;
                this.manedWolfAdultLegs.backLeft.rotation.x = -0.15;
                this.manedWolfAdultLegs.backRight.rotation.x = -0.15;

            } else if (this.currentState === 'pet') {
                // 撫摸中：超模溫柔微低頭顱，黑鬃毛舒緩
                if (this.manedWolfAdultMane) this.manedWolfAdultMane.scale.y = 1.1;
                this.manedWolfAdultHead.rotation.x = -0.1;
                this.manedWolfAdultHead.rotation.z = 0.12;
                this.resetManedWolfAdultLegs();

            } else if (this.currentState === 'sleep') {
                // 睡覺中：優雅蜷伏長腿臥地
                this.manedWolfAdultGroup.position.y = 0.52;
                if (this.manedWolfAdultMane) this.manedWolfAdultMane.scale.y = 0.9;
                this.manedWolfAdultNeck.rotation.x = 0.45;
                this.manedWolfAdultHead.rotation.x = 0.2;
                this.resetManedWolfAdultLegs();

            } else {
                if (this.manedWolfAdultMane) this.manedWolfAdultMane.scale.y = 1.0;
                if (this.autonomy && this.autonomy.state === 'walking') {
                    // 超模 T 台走秀：大幅同側步踱步！
                    const wc = this.autonomy.walkCycle;
                    const leftSideSwing = Math.sin(wc) * 0.42;
                    const rightSideSwing = -Math.sin(wc) * 0.42;
                    this.manedWolfAdultLegs.frontLeft.rotation.x = leftSideSwing;
                    this.manedWolfAdultLegs.backLeft.rotation.x = leftSideSwing * 0.88;
                    this.manedWolfAdultLegs.frontRight.rotation.x = rightSideSwing;
                    this.manedWolfAdultLegs.backRight.rotation.x = rightSideSwing * 0.88;
                    this.manedWolfAdultGroup.position.y = 0.95 + Math.abs(Math.sin(wc * 2)) * 0.04;
                    this.manedWolfAdultGroup.rotation.y = Math.sin(wc) * 0.04;
                    this.manedWolfAdultHead.rotation.x = Math.sin(wc * 2) * 0.03;
                    this.manedWolfAdultHead.rotation.y = 0;
                    this.manedWolfAdultHead.rotation.z = 0;
                } else {
                    // 趴下休息 (長腿優雅蜷屈臥地)
                    const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
                    this.manedWolfAdultGroup.position.y = THREE.MathUtils.lerp(0.95, 0.46, lf) + Math.sin(t * (2.2 - lf * 0.6)) * 0.01;
                    this.manedWolfAdultLegs.frontLeft.rotation.x = -0.45 * lf;
                    this.manedWolfAdultLegs.frontRight.rotation.x = -0.45 * lf;
                    this.manedWolfAdultLegs.backLeft.rotation.x = 0.82 * lf;
                    this.manedWolfAdultLegs.backRight.rotation.x = 0.82 * lf;
                    this.manedWolfAdultNeck.rotation.x = 0.18 * lf;
                    this.manedWolfAdultHead.rotation.x = 0.10 * lf + Math.sin(t * 1.6) * 0.03;
                    this.manedWolfAdultHead.rotation.y = Math.sin(t * 0.9) * (0.12 - lf * 0.06);
                    this.manedWolfAdultHead.rotation.z = 0;
                    this.manedWolfAdultGroup.rotation.y = 0;
                }
            }
        }
    }

    resetManedWolfPupLegs() {
        if (!this.manedWolfPupLegs) return;
        Object.keys(this.manedWolfPupLegs).forEach(k => this.manedWolfPupLegs[k].rotation.set(0, 0, 0));
    }

    resetManedWolfAdultLegs() {
        if (!this.manedWolfAdultLegs) return;
        Object.keys(this.manedWolfAdultLegs).forEach(k => this.manedWolfAdultLegs[k].rotation.set(0, 0, 0));
    }

    // ─────────────────────────────────────────────────────────
    //  🐘 大象專屬 3D 模型系統：
    //  - 幼象期（Baby Elephant Calf）：參考圖 1，圓滾滾胖嘟嘟軟糯身軀、靈動小長鼻、軟萌扇耳、頭頂胎毛
    //  - 成年象王（Adult Tusker King）：參考圖 2，巍峨霸氣魁梧身軀、大扇耳、向外向上優美彎曲的潔白長象牙、神武長鼻長鳴
    // ─────────────────────────────────────────────────────────
    buildElephantMesh() {
        this.elephantRoot = new THREE.Group();
        this.elephantRoot.name = 'ElephantRoot';
        this.group.add(this.elephantRoot);

        // 基礎節點引用
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.elephantRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼象期軟萌小象寶寶 (Baby Calf)
        this.buildElephantBabyMesh();

        // 2. 成年期巍峨神武象王 (Adult Tusker King)
        this.buildElephantAdultMesh();

        // 預設呈現幼崽期
        this.updateElephantStage('baby');
    }

    // 1. 幼象期：軟萌小象寶寶 (參考圖 1：圓滾滾軟糯小身子、短短柱狀腿、靈動小軟鼻、好奇大眼)
    buildElephantBabyMesh() {
        this.elephantBabyGroup = new THREE.Group();
        this.elephantBabyGroup.name = 'ElephantBabyGroup';
        this.elephantBabyGroup.position.set(0, 0.44, 0);
        this.elephantRoot.add(this.elephantBabyGroup);

        // 1.1 圓滾滾軟糯小軀幹 (Chubby Baby Torso)
        const torsoGeo = new THREE.SphereGeometry(0.42, 20, 20);
        torsoGeo.scale(1.05, 0.98, 1.25);
        const torso = new THREE.Mesh(torsoGeo, this.matElephantBabySkin);
        torso.position.set(0, 0, 0);
        torso.castShadow = true;
        this.elephantBabyGroup.add(torso);

        // 幼象微垂的圓圓軟肚肚 (Soft Baby Belly)
        const bellyGeo = new THREE.SphereGeometry(0.35, 16, 16);
        bellyGeo.scale(0.96, 0.88, 1.15);
        const belly = new THREE.Mesh(bellyGeo, this.matElephantBabySkin);
        belly.position.set(0, -0.08, -0.04);
        this.elephantBabyGroup.add(belly);

        // 1.2 粗短頸部與大圓頭 (Baby Elephant Head & Neck)
        const babyNeck = new THREE.Group();
        babyNeck.position.set(0, 0.16, 0.36);
        this.elephantBabyGroup.add(babyNeck);
        this.elephantBabyNeck = babyNeck;

        const babyHead = new THREE.Group();
        babyNeck.add(babyHead);
        this.elephantBabyHead = babyHead;

        // 大頭顱
        const headGeo = new THREE.SphereGeometry(0.32, 20, 20);
        headGeo.scale(1.0, 1.06, 1.06);
        const headMesh = new THREE.Mesh(headGeo, this.matElephantBabySkin);
        headMesh.position.set(0, 0.14, 0.05);
        headMesh.castShadow = true;
        babyHead.add(headMesh);

        // 幼象頭頂雙圓拱骨感 (Baby Parietal Domes)
        [-1, 1].forEach((side) => {
            const domeGeo = new THREE.SphereGeometry(0.12, 12, 12);
            domeGeo.scale(0.9, 0.8, 0.9);
            const dome = new THREE.Mesh(domeGeo, this.matElephantBabySkin);
            dome.position.set(side * 0.11, 0.38, 0.05);
            babyHead.add(dome);
        });

        // 參考圖 1：頭頂呆萌胎毛毛叢 (Cute Baby Hair Tufts)
        const tuftGroup = new THREE.Group();
        tuftGroup.position.set(0, 0.44, 0.05);
        [-0.04, 0, 0.04].forEach((xOff, idx) => {
            const tuftGeo = new THREE.ConeGeometry(0.02, 0.08, 6);
            const tuft = new THREE.Mesh(tuftGeo, this.matElephantTailBrush);
            tuft.position.set(xOff, 0, (idx === 1 ? 0.02 : -0.01));
            tuft.rotation.z = -xOff * 3;
            tuft.rotation.x = -0.2;
            tuftGroup.add(tuft);
        });
        babyHead.add(tuftGroup);

        // 1.3 軟萌小扇耳 (Soft Floppy Baby Ears)
        this.elephantBabyEars = {};
        [-1, 1].forEach((side) => {
            const earPivot = new THREE.Group();
            earPivot.position.set(side * 0.25, 0.18, 0.02);
            earPivot.rotation.z = -side * 0.12;
            earPivot.rotation.y = side * 0.22;

            // 外耳廓
            const earGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.022, 18);
            earGeo.scale(1.15, 1.35, 0.35);
            const ear = new THREE.Mesh(earGeo, this.matElephantBabySkin);
            ear.position.set(side * 0.14, -0.04, 0);
            ear.rotation.x = Math.PI / 2;
            earPivot.add(ear);

            // 耳內柔和粉肉色襯面
            const innerEarGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.012, 18);
            innerEarGeo.scale(1.1, 1.3, 0.25);
            const innerEar = new THREE.Mesh(innerEarGeo, this.matElephantInnerEar);
            innerEar.position.set(0, 0.012, 0);
            ear.add(innerEar);

            babyHead.add(earPivot);
            if (side === -1) this.elephantBabyEarL = earPivot;
            else this.elephantBabyEarR = earPivot;
        });

        // 1.4 水汪汪溫柔大眼 (Innocent Hazel Baby Eyes)
        const eyeRingGeo = new THREE.TorusGeometry(0.048, 0.01, 8, 16);
        const irisGeo = new THREE.SphereGeometry(0.046, 14, 14);
        irisGeo.scale(1.0, 1.0, 0.65);
        const pupilGeo = new THREE.SphereGeometry(0.032, 12, 12);
        pupilGeo.scale(1.0, 1.0, 0.4);
        const shine1Geo = new THREE.SphereGeometry(0.012, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.007, 8, 8);

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.22, 0.16, 0.26);
            eyeGroup.rotation.y = side * 0.42;

            const eyeRing = new THREE.Mesh(eyeRingGeo, this.matElephantSkin);
            const iris = new THREE.Mesh(irisGeo, this.matElephantEye);
            const pupil = new THREE.Mesh(pupilGeo, this.matPupil);
            pupil.position.set(0, 0, 0.024);
            const shine1 = new THREE.Mesh(shine1Geo, this.matShine);
            shine1.position.set(side * 0.01, 0.012, 0.038);
            const shine2 = new THREE.Mesh(shine2Geo, this.matShine);
            shine2.position.set(-side * 0.01, -0.01, 0.038);

            eyeGroup.add(eyeRing, iris, pupil, shine1, shine2);
            babyHead.add(eyeGroup);

            if (side === -1) this.elephantBabyEyeL = eyeGroup;
            else this.elephantBabyEyeR = eyeGroup;
        });

        // 1.5 軟糯靈動多節長鼻 (Articulated Baby Elephant Trunk)
        // 參考圖 1：好奇探索的小軟鼻，可自由捲曲、左右搖擺與吸水噴噴
        const trunkSeg0 = new THREE.Group();
        trunkSeg0.position.set(0, 0.02, 0.32);
        trunkSeg0.rotation.x = 0.25; // 默認向前微垂
        babyHead.add(trunkSeg0);

        const mesh0 = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.105, 0.13, 14), this.matElephantBabySkin);
        mesh0.position.set(0, -0.065, 0);
        trunkSeg0.add(mesh0);

        const trunkSeg1 = new THREE.Group();
        trunkSeg1.position.set(0, -0.13, 0);
        trunkSeg0.add(trunkSeg1);
        const mesh1 = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.082, 0.12, 14), this.matElephantBabySkin);
        mesh1.position.set(0, -0.06, 0);
        trunkSeg1.add(mesh1);

        const trunkSeg2 = new THREE.Group();
        trunkSeg2.position.set(0, -0.12, 0);
        trunkSeg1.add(trunkSeg2);
        const mesh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.068, 0.11, 14), this.matElephantBabySkin);
        mesh2.position.set(0, -0.055, 0);
        trunkSeg2.add(mesh2);

        const trunkSeg3 = new THREE.Group();
        trunkSeg3.position.set(0, -0.11, 0);
        trunkSeg2.add(trunkSeg3);
        const mesh3 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.054, 0.10, 14), this.matElephantBabySkin);
        mesh3.position.set(0, -0.05, 0);
        trunkSeg3.add(mesh3);

        // 鼻尖小突起（粉嫩小鼻孔邊緣）
        const tipGeo = new THREE.SphereGeometry(0.042, 10, 10);
        tipGeo.scale(1.0, 0.5, 1.0);
        const tipMesh = new THREE.Mesh(tipGeo, this.matElephantInnerEar);
        tipMesh.position.set(0, -0.10, 0);
        trunkSeg3.add(tipMesh);

        this.elephantBabyTrunk = { seg0: trunkSeg0, seg1: trunkSeg1, seg2: trunkSeg2, seg3: trunkSeg3 };

        // 1.6 憨厚短粗柱狀小象腿與可愛白趾甲 (Sturdy Columnar Baby Legs)
        this.elephantBabyLegs = {};
        const babyLegOffsets = [
            ['frontLeft', -0.22, -0.16, 0.22],
            ['frontRight', 0.22, -0.16, 0.22],
            ['backLeft', -0.22, -0.16, -0.24],
            ['backRight', 0.22, -0.16, -0.24]
        ];

        babyLegOffsets.forEach(([name, x, y, z]) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(x, y, z);
            this.elephantBabyGroup.add(legPivot);

            // 圓柱小腿
            const legGeo = new THREE.CylinderGeometry(0.092, 0.105, 0.32, 14);
            const leg = new THREE.Mesh(legGeo, this.matElephantBabySkin);
            leg.position.set(0, -0.16, 0);
            leg.castShadow = true;
            legPivot.add(leg);

            // 圓形肉掌底座
            const footGeo = new THREE.CylinderGeometry(0.11, 0.115, 0.06, 14);
            const foot = new THREE.Mesh(footGeo, this.matElephantBabySkin);
            foot.position.set(0, -0.32, 0.01);
            legPivot.add(foot);

            // 前緣 3 顆圓圓可愛小象甲 (Baby Toenails)
            [-0.05, 0, 0.05].forEach((nailX) => {
                const nailGeo = new THREE.SphereGeometry(0.024, 8, 8);
                nailGeo.scale(1.0, 1.2, 0.8);
                const nail = new THREE.Mesh(nailGeo, this.matElephantToenail);
                nail.position.set(nailX, -0.32, 0.10);
                legPivot.add(nail);
            });

            this.elephantBabyLegs[name] = legPivot;
        });

        // 1.7 小象尾巴與毛刷
        const babyTailPivot = new THREE.Group();
        babyTailPivot.position.set(0, 0.06, -0.48);
        babyTailPivot.rotation.x = -0.35;
        this.elephantBabyGroup.add(babyTailPivot);
        this.elephantBabyTail = babyTailPivot;

        const babyTailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.034, 0.28, 8), this.matElephantBabySkin);
        babyTailStem.position.set(0, -0.14, 0);
        babyTailPivot.add(babyTailStem);

        const babyTailBrush = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.10, 8), this.matElephantTailBrush);
        babyTailBrush.position.set(0, -0.28, 0);
        babyTailBrush.rotation.x = Math.PI;
        babyTailPivot.add(babyTailBrush);
    }

    // 2. 成年期：巍峨霸氣神武象王 (參考圖 2：馬鞍凹背、巨型非洲大扇耳、優美彎曲的威武長象牙、神武長鼻長鳴)
    buildElephantAdultMesh() {
        this.elephantAdultGroup = new THREE.Group();
        this.elephantAdultGroup.name = 'ElephantAdultGroup';
        this.elephantAdultGroup.position.set(0, 0.88, 0);
        this.elephantRoot.add(this.elephantAdultGroup);

        // 2.1 高聳肩峰與標誌性非洲象馬鞍背 (Majestic Withers & African Saddle Back)
        const withersGeo = new THREE.SphereGeometry(0.48, 20, 20);
        withersGeo.scale(0.96, 1.25, 0.96);
        const withers = new THREE.Mesh(withersGeo, this.matElephantSkin);
        withers.position.set(0, 0.25, 0.32);
        withers.castShadow = true;
        this.elephantAdultGroup.add(withers);

        // 魁梧軀幹 (Massive Muscular Torso)
        const adultTorsoGeo = new THREE.SphereGeometry(0.64, 22, 22);
        adultTorsoGeo.scale(0.88, 1.05, 1.50);
        const adultTorso = new THREE.Mesh(adultTorsoGeo, this.matElephantSkin);
        adultTorso.position.set(0, 0, 0);
        adultTorso.castShadow = true;
        this.elephantAdultGroup.add(adultTorso);

        // 2.2 霸氣巍峨頭頸 (King Tusker Head & Arched Neck)
        const adultNeck = new THREE.Group();
        adultNeck.position.set(0, 0.26, 0.52);
        this.elephantAdultGroup.add(adultNeck);
        this.elephantAdultNeck = adultNeck;

        const adultHead = new THREE.Group();
        adultNeck.add(adultHead);
        this.elephantAdultHead = adultHead;

        // 雄偉頭骨（非洲象特有雙冠突起）
        const headGeo = new THREE.SphereGeometry(0.46, 22, 22);
        headGeo.scale(0.88, 1.15, 1.12);
        const headMesh = new THREE.Mesh(headGeo, this.matElephantSkin);
        headMesh.position.set(0, 0.16, 0.08);
        headMesh.castShadow = true;
        adultHead.add(headMesh);

        // 雙冠凸起峰 (African Elephant Parietal Peaks)
        [-1, 1].forEach((side) => {
            const peakGeo = new THREE.SphereGeometry(0.18, 14, 14);
            peakGeo.scale(0.85, 0.9, 0.85);
            const peak = new THREE.Mesh(peakGeo, this.matElephantSkin);
            peak.position.set(side * 0.16, 0.52, 0.08);
            adultHead.add(peak);
        });

        // 2.3 標誌性巨型非洲大扇耳 (The Iconic Giant African Fan Ears)
        // 參考圖 2：如同非洲大陸版圖般宏偉張開的大扇耳，自然前後扇動、邊緣波浪褶皺
        this.elephantAdultEars = {};
        [-1, 1].forEach((side) => {
            const earPivot = new THREE.Group();
            earPivot.position.set(side * 0.38, 0.28, 0.04);
            earPivot.rotation.z = -side * 0.18;
            earPivot.rotation.y = side * 0.28;

            // 巨型大扇面
            const earGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.026, 20);
            earGeo.scale(1.26, 1.62, 0.25);
            const ear = new THREE.Mesh(earGeo, this.matElephantSkin);
            ear.position.set(side * 0.32, -0.12, 0);
            ear.rotation.x = Math.PI / 2;
            earPivot.add(ear);

            // 耳內柔和血管微紅襯面
            const innerEarGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.015, 20);
            innerEarGeo.scale(1.2, 1.55, 0.2);
            const innerEar = new THREE.Mesh(innerEarGeo, this.matElephantInnerEar);
            innerEar.position.set(0, 0.015, 0);
            ear.add(innerEar);

            adultHead.add(earPivot);
            if (side === -1) this.elephantAdultEarL = earPivot;
            else this.elephantAdultEarR = earPivot;
        });

        // 2.4 威武典雅潔白長象牙 (Magnificent Curved Ivory Tusks)
        // 參考圖 2：粗壯象牙自吻側長出，優美向前、向外、再向上優雅彎曲，銳利耀眼！
        [-1, 1].forEach((side) => {
            const tuskRoot = new THREE.Group();
            tuskRoot.position.set(side * 0.19, -0.08, 0.42);
            tuskRoot.rotation.x = 1.35; // 向前微下
            tuskRoot.rotation.y = side * 0.22; // 略向外張開
            adultHead.add(tuskRoot);

            // 根段
            const seg0 = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.34, 12), this.matElephantTusk);
            seg0.position.set(0, 0.17, 0);
            tuskRoot.add(seg0);

            // 中段弧度向上
            const midPivot = new THREE.Group();
            midPivot.position.set(0, 0.32, 0);
            midPivot.rotation.x = -0.55; // 向上揚起！
            midPivot.rotation.y = -side * 0.12;
            tuskRoot.add(midPivot);

            const seg1 = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.34, 12), this.matElephantTusk);
            seg1.position.set(0, 0.17, 0);
            midPivot.add(seg1);

            // 尖端優美微鉤
            const tipPivot = new THREE.Group();
            tipPivot.position.set(0, 0.32, 0);
            tipPivot.rotation.x = -0.48; // 再向上翹起！
            tipPivot.rotation.y = -side * 0.08;
            midPivot.add(tipPivot);

            const seg2 = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.36, 12), this.matElephantTusk);
            seg2.position.set(0, 0.18, 0);
            tipPivot.add(seg2);
        });

        // 2.5 睿智深邃眼眸 (Wise Tusker Gaze)
        const adultEyeRingGeo = new THREE.TorusGeometry(0.055, 0.012, 8, 16);
        const adultIrisGeo = new THREE.SphereGeometry(0.052, 14, 14);
        adultIrisGeo.scale(1.0, 1.0, 0.65);
        const adultPupilGeo = new THREE.SphereGeometry(0.035, 12, 12);
        adultPupilGeo.scale(1.0, 1.0, 0.4);

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.31, 0.22, 0.34);
            eyeGroup.rotation.y = side * 0.45;

            const eyeRing = new THREE.Mesh(adultEyeRingGeo, this.matElephantSkin);
            const iris = new THREE.Mesh(adultIrisGeo, this.matElephantEye);
            const pupil = new THREE.Mesh(adultPupilGeo, this.matPupil);
            pupil.position.set(0, 0, 0.026);
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine1.position.set(side * 0.012, 0.015, 0.042);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), this.matShine);
            shine2.position.set(-side * 0.01, -0.012, 0.042);

            eyeGroup.add(eyeRing, iris, pupil, shine1, shine2);
            adultHead.add(eyeGroup);

            if (side === -1) this.elephantAdultEyeL = eyeGroup;
            else this.elephantAdultEyeR = eyeGroup;
        });

        // 2.6 威武神聖多節長鼻 (Multi-segment King Trunk)
        // 參考圖 2：象王昂首長鳴時，長鼻向上高揚形成令人震撼的 S 型銅管長嘯曲線！
        const aTrunk0 = new THREE.Group();
        aTrunk0.position.set(0, -0.02, 0.44);
        aTrunk0.rotation.x = 0.35;
        adultHead.add(aTrunk0);

        const aMesh0 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.24, 16), this.matElephantSkin);
        aMesh0.position.set(0, -0.12, 0);
        aTrunk0.add(aMesh0);

        const aTrunk1 = new THREE.Group();
        aTrunk1.position.set(0, -0.24, 0);
        aTrunk0.add(aTrunk1);
        const aMesh1 = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.13, 0.24, 16), this.matElephantSkin);
        aMesh1.position.set(0, -0.12, 0);
        aTrunk1.add(aMesh1);

        const aTrunk2 = new THREE.Group();
        aTrunk2.position.set(0, -0.24, 0);
        aTrunk1.add(aTrunk2);
        const aMesh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.105, 0.22, 16), this.matElephantSkin);
        aMesh2.position.set(0, -0.11, 0);
        aTrunk2.add(aMesh2);

        const aTrunk3 = new THREE.Group();
        aTrunk3.position.set(0, -0.22, 0);
        aTrunk2.add(aTrunk3);
        const aMesh3 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.084, 0.20, 16), this.matElephantSkin);
        aMesh3.position.set(0, -0.10, 0);
        aTrunk3.add(aMesh3);

        const aTrunk4 = new THREE.Group();
        aTrunk4.position.set(0, -0.20, 0);
        aTrunk3.add(aTrunk4);
        const aMesh4 = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.065, 0.18, 16), this.matElephantSkin);
        aMesh4.position.set(0, -0.09, 0);
        aTrunk4.add(aMesh4);

        // 靈巧指狀突起 (Trunk Grasping Finger / Tip)
        const aTip = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), this.matElephantInnerEar);
        aTip.scale.set(1.0, 0.6, 1.2);
        aTip.position.set(0, -0.18, 0.02);
        aTrunk4.add(aTip);

        this.elephantAdultTrunk = { seg0: aTrunk0, seg1: aTrunk1, seg2: aTrunk2, seg3: aTrunk3, seg4: aTrunk4 };

        // 2.7 巨型擎天巨柱腿 (Colossal Pillar Legs with Ivory Toenails)
        this.elephantAdultLegs = {};
        const adultLegOffsets = [
            ['frontLeft', -0.32, -0.22, 0.36],
            ['frontRight', 0.32, -0.22, 0.36],
            ['backLeft', -0.32, -0.22, -0.40],
            ['backRight', 0.32, -0.22, -0.40]
        ];

        adultLegOffsets.forEach(([name, x, y, z]) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(x, y, z);
            this.elephantAdultGroup.add(legPivot);

            // 魁梧巨柱腿
            const legGeo = new THREE.CylinderGeometry(0.145, 0.175, 0.72, 16);
            const leg = new THREE.Mesh(legGeo, this.matElephantSkin);
            leg.position.set(0, -0.36, 0);
            leg.castShadow = true;
            legPivot.add(leg);

            // 穩健重踏腳底盤
            const footGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.12, 16);
            const foot = new THREE.Mesh(footGeo, this.matElephantSkin);
            foot.position.set(0, -0.72, 0.02);
            legPivot.add(foot);

            // 腳前緣象趾甲 (前 4 顆、後 3 顆)
            const nailCount = name.startsWith('front') ? 4 : 3;
            const nailSpacing = 0.07;
            const startX = -((nailCount - 1) * nailSpacing) / 2;

            for (let i = 0; i < nailCount; i++) {
                const nailX = startX + i * nailSpacing;
                const nailGeo = new THREE.SphereGeometry(0.032, 8, 8);
                nailGeo.scale(1.0, 1.3, 0.85);
                const nail = new THREE.Mesh(nailGeo, this.matElephantToenail);
                nail.position.set(nailX, -0.72, 0.17);
                legPivot.add(nail);
            }

            this.elephantAdultLegs[name] = legPivot;
        });

        // 2.8 剛硬黑毛刷長尾巴 (Long Pendulous Tail with Bristle Brush)
        const tailPivot = new THREE.Group();
        tailPivot.position.set(0, 0.12, -0.68);
        tailPivot.rotation.x = -0.25;
        this.elephantAdultGroup.add(tailPivot);
        this.elephantAdultTail = tailPivot;

        const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, 0.58, 10), this.matElephantSkin);
        tailStem.position.set(0, -0.29, 0);
        tailPivot.add(tailStem);

        const tailBrush = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.24, 10), this.matElephantTailBrush);
        tailBrush.position.set(0, -0.65, 0);
        tailBrush.rotation.x = Math.PI;
        tailPivot.add(tailBrush);
    }

    // 切換幼象 / 成年象王形態顯示
    updateElephantStage(stage) {
        this.elephantStage = stage;
        const isBaby = (stage === 'baby');
        if (this.elephantBabyGroup) this.elephantBabyGroup.visible = isBaby;
        if (this.elephantAdultGroup) this.elephantAdultGroup.visible = !isBaby;
        this.eyeLeft = isBaby ? this.elephantBabyEyeL : this.elephantAdultEyeL;
        this.eyeRight = isBaby ? this.elephantBabyEyeR : this.elephantAdultEyeR;
    }

    // ─────────────────────────────────────────────────────────
    //  🐘 大象專屬動態引擎：
    //  - 幼象：短腿歡快小跑、軟糯小象鼻靈活探索/吸水噴水、軟萌扇耳拍打
    //  - 成年象王：
    //    1. 象王昂首長鳴（Trumpet Pose！頭顱後仰、長鼻捲成大 S 形向天長鳴、扇耳全展！）
    //    2. 巨型扇耳大氣扇動散熱
    //    3. 沉穩重踏的王者步伐
    // ─────────────────────────────────────────────────────────
    updateElephant(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.elephantStage === 'baby');

        // 眨眼動畫
        this.nextBlinkTime = (this.nextBlinkTime || 3.0) - delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.8 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        } else if (this.currentState === 'sleep') {
            if (this.eyeLeft) this.eyeLeft.scale.y = 0.12;
            if (this.eyeRight) this.eyeRight.scale.y = 0.12;
        } else {
            if (this.eyeLeft && this.eyeLeft.scale.y !== 1) this.eyeLeft.scale.y = 1;
            if (this.eyeRight && this.eyeRight.scale.y !== 1) this.eyeRight.scale.y = 1;
        }

        if (isBaby) {
            if (!this.elephantBabyGroup) return;

            // 幼象呼吸
            const breathe = Math.sin(t * 3.2) * 0.012;
            this.elephantBabyGroup.position.y = 0.44 + breathe;

            // 幼象軟萌小扇耳輕輕扇動
            const earFlap = Math.sin(t * 3.6) * 0.22;
            if (this.elephantBabyEarL) this.elephantBabyEarL.rotation.y = -0.22 + earFlap;
            if (this.elephantBabyEarR) this.elephantBabyEarR.rotation.y = 0.22 - earFlap;

            // 小短尾巴歡快微搖
            if (this.elephantBabyTail) {
                this.elephantBabyTail.rotation.z = Math.sin(t * 4.2) * 0.24;
            }

            const trunk = this.elephantBabyTrunk;

            if (this.currentState === 'happy') {
                // 幼象開心跳躍、小象鼻高高昂起噴水長叫！
                const runCycle = t * 9;
                this.elephantBabyLegs.frontLeft.rotation.x = Math.sin(runCycle) * 0.32;
                this.elephantBabyLegs.frontRight.rotation.x = -Math.sin(runCycle) * 0.32;
                this.elephantBabyLegs.backLeft.rotation.x = -Math.sin(runCycle) * 0.32;
                this.elephantBabyLegs.backRight.rotation.x = Math.sin(runCycle) * 0.32;

                this.elephantBabyHead.rotation.x = -0.22 + Math.sin(t * 6) * 0.08;
                if (trunk) {
                    trunk.seg0.rotation.x = -0.65;
                    trunk.seg1.rotation.x = -0.45;
                    trunk.seg2.rotation.x = 0.45;
                    trunk.seg3.rotation.x = 0.55;
                    trunk.seg1.rotation.y = Math.sin(t * 8) * 0.2;
                }
            } else if (this.currentState === 'eat') {
                // 吃草/喝水：小象鼻垂到地面捲起食物送到小嘴邊
                this.elephantBabyHead.rotation.x = 0.25;
                if (trunk) {
                    const eatCycle = Math.sin(t * 6);
                    trunk.seg0.rotation.x = 0.45 + eatCycle * 0.15;
                    trunk.seg1.rotation.x = 0.35;
                    trunk.seg2.rotation.x = -0.45 - eatCycle * 0.2;
                    trunk.seg3.rotation.x = -0.55;
                }
                this.resetElephantBabyLegs();
            } else if (this.currentState === 'pet') {
                // 撫摸：小長鼻向前親暱伸出、小耳朵加速拍打
                this.elephantBabyHead.rotation.x = -0.05;
                this.elephantBabyHead.rotation.z = 0.12;
                if (trunk) {
                    trunk.seg0.rotation.x = -0.3;
                    trunk.seg1.rotation.x = -0.15;
                    trunk.seg2.rotation.x = 0.25;
                    trunk.seg3.rotation.x = 0.35;
                    trunk.seg2.rotation.y = Math.sin(t * 4) * 0.15;
                }
                this.resetElephantBabyLegs();
            } else if (this.currentState === 'sleep') {
                // 幼象蜷地入睡
                this.elephantBabyGroup.position.y = 0.30;
                this.elephantBabyHead.rotation.x = 0.18;
                if (trunk) {
                    trunk.seg0.rotation.x = 0.4;
                    trunk.seg1.rotation.x = 0.3;
                    trunk.seg2.rotation.x = 0.3;
                    trunk.seg3.rotation.x = 0.1;
                }
                this.resetElephantBabyLegs();
            } else {
                // 待機：小長鼻好奇左右擺動探尋四周
                this.elephantBabyHead.rotation.x = Math.sin(t * 1.5) * 0.04;
                this.elephantBabyHead.rotation.y = Math.sin(t * 0.8) * 0.14;
                if (trunk) {
                    trunk.seg0.rotation.x = 0.18 + Math.sin(t * 2.2) * 0.1;
                    trunk.seg1.rotation.y = Math.sin(t * 2.6) * 0.22;
                    trunk.seg2.rotation.x = 0.15 + Math.sin(t * 3.0) * 0.12;
                    trunk.seg3.rotation.y = Math.sin(t * 3.2) * 0.2;
                }
                this.resetElephantBabyLegs();
            }

        } else {
            // 成年巍峨象王
            if (!this.elephantAdultGroup) return;

            // 1. 沉厚王者呼吸
            const breathe = Math.sin(t * 2.0) * 0.016;
            this.elephantAdultGroup.position.y = 0.88 + breathe;

            // 2. 標誌性巨型非洲扇耳緩慢而大氣地扇動 (Slow Majestic Fanning)
            const earFlap = Math.sin(t * 1.8) * 0.32;
            if (this.elephantAdultEarL) this.elephantAdultEarL.rotation.y = -0.28 + earFlap;
            if (this.elephantAdultEarR) this.elephantAdultEarR.rotation.y = 0.28 - earFlap;

            // 3. 粗壯毛刷尾巴自然擺動驅趕蚊蠅
            if (this.elephantAdultTail) {
                this.elephantAdultTail.rotation.z = Math.sin(t * 2.2) * 0.26;
            }

            const trunk = this.elephantAdultTrunk;

            if (this.currentState === 'happy') {
                // 🌟 象王經典名場面：昂首長鳴 (The Majestic Elephant Trumpet Call！)
                // 頭顱高昂、長牙向天、巨耳完全展寬、神武長鼻向天捲成巨大 S 型狂嘯！
                this.elephantAdultHead.rotation.x = -0.42;
                this.elephantAdultHead.rotation.y = Math.sin(t * 3) * 0.06;

                // 巨耳威嚴全展
                if (this.elephantAdultEarL) this.elephantAdultEarL.rotation.y = -0.75;
                if (this.elephantAdultEarR) this.elephantAdultEarR.rotation.y = 0.75;

                // 神武長鼻高卷向天
                if (trunk) {
                    trunk.seg0.rotation.x = -0.85;
                    trunk.seg1.rotation.x = -0.75;
                    trunk.seg2.rotation.x = 0.55 + Math.sin(t * 8) * 0.08;
                    trunk.seg3.rotation.x = 0.65;
                    trunk.seg4.rotation.x = 0.60;
                }

                // 前腿歡快微踏步
                const bounce = Math.sin(t * 6);
                this.elephantAdultLegs.frontLeft.rotation.x = bounce * 0.15;
                this.elephantAdultLegs.frontRight.rotation.x = -bounce * 0.15;

            } else if (this.currentState === 'eat') {
                // 象王吃食：頭微低，長鼻捲取地面牧草送入口中
                this.elephantAdultHead.rotation.x = 0.28;
                if (trunk) {
                    const eatCycle = Math.sin(t * 5);
                    trunk.seg0.rotation.x = 0.55 + eatCycle * 0.15;
                    trunk.seg1.rotation.x = 0.45;
                    trunk.seg2.rotation.x = -0.45 - eatCycle * 0.2;
                    trunk.seg3.rotation.x = -0.65;
                    trunk.seg4.rotation.x = -0.55;
                }
                this.resetElephantAdultLegs();

            } else if (this.currentState === 'pet') {
                // 撫摸：巍峨象王溫柔低下龐大頭顱，長鼻親暱輕觸玩家
                this.elephantAdultHead.rotation.x = -0.12;
                this.elephantAdultHead.rotation.z = 0.08;
                if (trunk) {
                    trunk.seg0.rotation.x = -0.35;
                    trunk.seg1.rotation.x = -0.25;
                    trunk.seg2.rotation.x = 0.35;
                    trunk.seg3.rotation.x = 0.45;
                    trunk.seg4.rotation.x = 0.35;
                }
                this.resetElephantAdultLegs();

            } else if (this.currentState === 'sleep') {
                // 象王臥地休整
                this.elephantAdultGroup.position.y = 0.52;
                this.elephantAdultHead.rotation.x = 0.15;
                if (trunk) {
                    trunk.seg0.rotation.x = 0.45;
                    trunk.seg1.rotation.x = 0.35;
                    trunk.seg2.rotation.x = 0.25;
                    trunk.seg3.rotation.x = 0.15;
                    trunk.seg4.rotation.x = 0.05;
                }
                this.resetElephantAdultLegs();

            } else {
                // 待機漫步：沉著威嚴的草原王者踱步
                const walkCycle = t * 2.2;
                const swing = Math.sin(walkCycle) * 0.12;
                this.elephantAdultLegs.frontLeft.rotation.x = swing;
                this.elephantAdultLegs.frontRight.rotation.x = -swing;
                this.elephantAdultLegs.backLeft.rotation.x = -swing * 0.8;
                this.elephantAdultLegs.backRight.rotation.x = swing * 0.8;

                this.elephantAdultHead.rotation.x = Math.sin(t * 1.4) * 0.03;
                this.elephantAdultHead.rotation.y = Math.sin(t * 0.7) * 0.10;

                // 長鼻如鐘擺般自然舒緩擺動
                if (trunk) {
                    trunk.seg0.rotation.x = 0.25 + Math.sin(t * 1.8) * 0.08;
                    trunk.seg1.rotation.y = Math.sin(t * 2.0) * 0.18;
                    trunk.seg2.rotation.x = 0.18 + Math.sin(t * 2.4) * 0.10;
                    trunk.seg3.rotation.y = Math.sin(t * 2.6) * 0.15;
                    trunk.seg4.rotation.x = 0.10;
                }
            }
        }
    }

    resetElephantBabyLegs() {
        if (!this.elephantBabyLegs) return;
        Object.keys(this.elephantBabyLegs).forEach(k => this.elephantBabyLegs[k].rotation.set(0, 0, 0));
    }

    resetElephantAdultLegs() {
        if (!this.elephantAdultLegs) return;
        Object.keys(this.elephantAdultLegs).forEach(k => this.elephantAdultLegs[k].rotation.set(0, 0, 0));
    }

    // ─────────────────────────────────────────────────────────
    //  🦅 哈比鷹（美洲角雕）專屬 3D 模型系統：
    //  - 幼雛期（Baby Harpy Chick）：參考圖 2，台北市立動物園軟綿綿純白羽絨雪球、小肉翅、歪頭殺、青灰小鉤喙
    //  - 成年期（Adult Harpy Eagle）：參考圖 1，世界頂級雨林猛禽神獸、標誌性可豎起「雙叉王冠羽」、黑胸帶、橫紋斑紋巨腿與黑金致命巨爪
    // ─────────────────────────────────────────────────────────
    buildHarpyMesh() {
        this.harpyRoot = new THREE.Group();
        this.harpyRoot.name = 'HarpyRoot';
        this.root.add(this.harpyRoot);

        // 獨立棲木群組（固定於地面／原位，起飛與飛行時絕不跟隨哈比鷹升空！）
        this.harpyPerchGroup = new THREE.Group();
        this.harpyPerchGroup.name = 'HarpyPerchGroup';
        this.harpyRoot.add(this.harpyPerchGroup);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.harpyRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼雛期純白雪球棉花糖 (Baby Chick)
        this.buildHarpyBabyMesh();

        // 2. 成年期雨林神獸角雕皇 (Adult King Raptor)
        this.buildHarpyAdultMesh();

        // 3. 飛行專用姿勢骨架（完全依照使用者上傳的哈比鷹飛行實拍圖打造，不抓樹木與獵物！）
        this.buildHarpyFlightRig();

        // 預設呈現幼雛期白雪球（按切換鍵前為幼崽型態）
        this.updateHarpyStage('baby');
    }

    // 1. 幼雛期：台北市立動物園純白雪球羽絨幼雛 (參考圖 2)
    buildHarpyBabyMesh() {
        this.harpyBabyGroup = new THREE.Group();
        this.harpyBabyGroup.name = 'HarpyBabyGroup';
        this.harpyBabyGroup.position.set(0, 0.42, 0);
        this.harpyRoot.add(this.harpyBabyGroup);

        // 1.1 軟綿綿渾圓純白絨毛身軀 (Snowball Downy Body)
        const torsoGeo = new THREE.SphereGeometry(0.36, 20, 20);
        torsoGeo.scale(1.05, 1.0, 1.15);
        const torso = new THREE.Mesh(torsoGeo, this.matHarpyBabyFluff);
        torso.position.set(0, 0, 0);
        torso.castShadow = true;
        this.harpyBabyGroup.add(torso);

        // 胸前柔軟微隆起的白絨毛
        const bibGeo = new THREE.SphereGeometry(0.24, 14, 14);
        bibGeo.scale(1.1, 0.9, 1.0);
        const bib = new THREE.Mesh(bibGeo, this.matHarpyBabyFluff);
        bib.position.set(0, 0.05, 0.16);
        this.harpyBabyGroup.add(bib);

        // 1.2 圓滾滾大頭部與眼周青黑初羽面盤
        const babyHeadPivot = new THREE.Group();
        babyHeadPivot.position.set(0, 0.24, 0.16);
        this.harpyBabyGroup.add(babyHeadPivot);
        this.harpyBabyHead = babyHeadPivot;

        const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
        headGeo.scale(1.0, 1.05, 1.05);
        const headMesh = new THREE.Mesh(headGeo, this.matHarpyBabyFluff);
        headMesh.position.set(0, 0.12, 0);
        headMesh.castShadow = true;
        babyHeadPivot.add(headMesh);

        // 參考圖 2：面盤前緣眼眶青黑色軟斑 (Charcoal Eye Mask Shading)
        const maskGeo = new THREE.SphereGeometry(0.25, 16, 16);
        maskGeo.scale(0.96, 0.75, 0.4);
        const maskMesh = new THREE.Mesh(maskGeo, this.matHarpyBabyMask);
        maskMesh.position.set(0, 0.12, 0.18);
        babyHeadPivot.add(maskMesh);

        // 兩側軟萌蓬鬆羽絨臉頰
        [-1, 1].forEach((side) => {
            const cheekGeo = new THREE.SphereGeometry(0.14, 12, 12);
            cheekGeo.scale(0.8, 0.8, 0.8);
            const cheek = new THREE.Mesh(cheekGeo, this.matHarpyBabyFluff);
            cheek.position.set(side * 0.18, 0.08, 0.10);
            babyHeadPivot.add(cheek);
        });

        // 1.3 水汪汪黑曜石大圓眼 (Huge Curious Obsidian Baby Eyes)
        const eyeRingGeo = new THREE.TorusGeometry(0.058, 0.012, 8, 16);
        const eyeBallGeo = new THREE.SphereGeometry(0.054, 16, 16);
        const shine1Geo = new THREE.SphereGeometry(0.016, 8, 8);
        const shine2Geo = new THREE.SphereGeometry(0.009, 8, 8);

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.145, 0.14, 0.25);
            eyeGroup.rotation.y = side * 0.22;

            const eyeRing = new THREE.Mesh(eyeRingGeo, this.matHarpyBabyMask);
            const ball = new THREE.Mesh(eyeBallGeo, this.matPupil);
            const shine1 = new THREE.Mesh(shine1Geo, this.matShine);
            shine1.position.set(side * 0.012, 0.016, 0.046);
            const shine2 = new THREE.Mesh(shine2Geo, this.matShine);
            shine2.position.set(-side * 0.012, -0.012, 0.046);

            eyeGroup.add(eyeRing, ball, shine1, shine2);
            babyHeadPivot.add(eyeGroup);

            if (side === -1) this.harpyBabyEyeL = eyeGroup;
            else this.harpyBabyEyeR = eyeGroup;
        });

        // 1.4 青灰下彎幼雛小鉤喙 (Baby Harpy Hooked Beak)
        const beakPivot = new THREE.Group();
        beakPivot.position.set(0, 0.08, 0.28);
        babyHeadPivot.add(beakPivot);
        this.harpyBabyBeak = beakPivot;

        const upperBeakGeo = new THREE.ConeGeometry(0.055, 0.16, 10);
        upperBeakGeo.rotateX(Math.PI / 2 + 0.35); // 猛禽鉤喙向前微下彎
        upperBeakGeo.scale(1.1, 0.85, 1.0);
        const upperBeak = new THREE.Mesh(upperBeakGeo, this.matHarpyBabyBeak);
        upperBeak.position.set(0, 0.01, 0.06);
        beakPivot.add(upperBeak);

        const lowerBeakGeo = new THREE.ConeGeometry(0.042, 0.12, 8);
        lowerBeakGeo.rotateX(Math.PI / 2);
        const lowerBeak = new THREE.Mesh(lowerBeakGeo, this.matHarpyBabyBeak);
        lowerBeak.position.set(0, -0.03, 0.05);
        beakPivot.add(lowerBeak);

        // 1.5 軟軟白絨小肉翅 (Fluffy Baby Winglets)
        this.harpyBabyWings = {};
        [-1, 1].forEach((side) => {
            const wingPivot = new THREE.Group();
            wingPivot.position.set(side * 0.26, 0.05, 0.02);
            wingPivot.rotation.z = -side * 0.15;
            this.harpyBabyGroup.add(wingPivot);

            const wingGeo = new THREE.SphereGeometry(0.16, 12, 12);
            wingGeo.scale(0.42, 0.9, 1.4);
            const wing = new THREE.Mesh(wingGeo, this.matHarpyBabyFluff);
            wing.position.set(side * 0.04, -0.06, -0.02);
            wingPivot.add(wing);

            if (side === -1) this.harpyBabyWings.left = wingPivot;
            else this.harpyBabyWings.right = wingPivot;
        });

        // 1.6 軟萌小白尾
        const tailGeo = new THREE.ConeGeometry(0.08, 0.18, 8);
        tailGeo.rotateX(-Math.PI / 2);
        tailGeo.scale(1.1, 0.6, 1.0);
        const tail = new THREE.Mesh(tailGeo, this.matHarpyBabyFluff);
        tail.position.set(0, -0.08, -0.36);
        this.harpyBabyGroup.add(tail);
        this.harpyBabyTail = tail;

        // 1.7 恐龍般穩健幼雛雙爪 (Cute Baby Raptor Feet)
        [-1, 1].forEach((side) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, 0.18, 10), this.matHarpyBabyFluff);
            leg.position.set(side * 0.12, -0.22, 0.04);
            this.harpyBabyGroup.add(leg);

            // 爪掌
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), this.matHarpyBabyFoot);
            foot.scale.set(1.0, 0.5, 1.3);
            foot.position.set(side * 0.12, -0.32, 0.08);
            this.harpyBabyGroup.add(foot);

            // 幼雛小黑鉤爪尖
            [-0.03, 0, 0.03].forEach((tx) => {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.06, 6), this.matHarpyTalon);
                claw.rotateX(Math.PI / 2 + 0.3);
                claw.position.set(side * 0.12 + tx, -0.33, 0.14);
                this.harpyBabyGroup.add(claw);
            });
        });

        // 1.8 棲木原木底座 (掛載於獨立 harpyPerchGroup，起飛時留在原地不跟著飛！)
        const logGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.95, 14);
        logGeo.rotateZ(Math.PI / 2);
        const log = new THREE.Mesh(logGeo, this.matHarpyLog);
        log.position.set(0, 0.02, 0.04);
        log.castShadow = true;
        this.harpyBabyLog = log;
        this.harpyPerchGroup.add(log);
    }

    // 2. 成年期：雨林神獸角雕皇 (與飛行模型 1:1 統一五官、銀灰面盤、雙叉黑色王冠羽、墨黑胸帶與腹斑、6 道黑白細紋斑馬腿與金黃鷹爪、7 片黑白灰橫紋扇尾、以及折疊的黑白橫斑 8 指黑尖初級飛羽！)
    buildHarpyAdultMesh() {
        this.harpyAdultGroup = new THREE.Group();
        this.harpyAdultGroup.name = 'HarpyAdultGroup';
        this.harpyAdultGroup.position.set(0, 0.62, 0);
        this.harpyRoot.add(this.harpyAdultGroup);

        // 2.1 巍峨挺拔猛禽軀幹 (與飛行模型相同比例之純白腹羽與深灰黑背羽，傾斜站立於棲木上)
        const bodyTiltGroup = new THREE.Group();
        bodyTiltGroup.rotation.x = -0.52;
        this.harpyAdultGroup.add(bodyTiltGroup);
        this.harpyAdultBodyTilt = bodyTiltGroup;

        const adultTorsoGeo = new THREE.SphereGeometry(0.32, 22, 18);
        adultTorsoGeo.scale(0.92, 0.82, 1.75);
        const adultTorso = new THREE.Mesh(adultTorsoGeo, this.matHarpyBodyWhite);
        adultTorso.castShadow = true;
        bodyTiltGroup.add(adultTorso);

        // 背部深灰黑板岩覆羽
        const backGeo = new THREE.SphereGeometry(0.31, 20, 16);
        backGeo.scale(0.90, 0.65, 1.68);
        const backMesh = new THREE.Mesh(backGeo, this.matHarpyWingSlate);
        backMesh.position.set(0, 0.08, -0.02);
        bodyTiltGroup.add(backMesh);

        // 上胸標誌性濃墨黑寬胸帶 (Prominent Black Breast Collar Band — 與飛行姿態完全一致！)
        const chestGeo = new THREE.SphereGeometry(0.29, 18, 16);
        chestGeo.scale(0.96, 0.80, 0.92);
        const chest = new THREE.Mesh(chestGeo, this.matHarpyChestBand);
        chest.position.set(0, 0.02, 0.28);
        bodyTiltGroup.add(chest);

        // 白色胸腹交界處與側腹點綴的黑色斑點簇 (Black Belly Flecks — 與飛行姿態完全一致！)
        [
            [-0.14, -0.12, 0.12], [0.14, -0.12, 0.12],
            [-0.18, -0.08, 0.02], [0.18, -0.08, 0.02],
            [-0.10, -0.16, 0.05], [0.10, -0.16, 0.05]
        ].forEach(([fx, fy, fz]) => {
            const fleck = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), this.matHarpyChestBand);
            fleck.scale.set(1.2, 0.5, 1.4);
            fleck.position.set(fx, fy, fz);
            bodyTiltGroup.add(fleck);
        });

        // 2.2 霸氣銀灰頭頸與面盤 (Silver-Grey Head & Facial Disc — 與飛行模型 1:1 對齊！)
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 0.06, 0.44);
        bodyTiltGroup.add(neckPivot);
        this.harpyAdultNeck = neckPivot;

        const neckGeo = new THREE.CylinderGeometry(0.16, 0.21, 0.26, 14);
        neckGeo.rotateX(Math.PI / 2);
        const neckMesh = new THREE.Mesh(neckGeo, this.matHarpyFaceDisk);
        neckPivot.add(neckMesh);

        const headPivot = new THREE.Group();
        headPivot.position.set(0, 0.04, 0.12);
        headPivot.rotation.x = 0.52; // 抵消身體傾角，使頭部水平昂首直視前方
        neckPivot.add(headPivot);
        this.harpyAdultHead = headPivot;

        // 銀灰頭顱與面盤 (半徑 0.19，與 harpyFlightHead 完全一致)
        const skullGeo = new THREE.SphereGeometry(0.19, 18, 16);
        skullGeo.scale(0.90, 0.88, 1.25);
        const skull = new THREE.Mesh(skullGeo, this.matHarpyFaceDisk);
        skull.castShadow = true;
        headPivot.add(skull);

        // 2.3 🌟 標誌性「雙叉黑色王冠羽」（與飛行模型完全一致的雙叉黑羽冠！）
        const crestPivot = new THREE.Group();
        crestPivot.position.set(0, 0.14, -0.04);
        headPivot.add(crestPivot);
        this.harpyAdultCrest = crestPivot;

        [-1, 1].forEach((side) => {
            const crestHorn = new THREE.Group();
            crestHorn.position.set(side * 0.065, 0, 0);
            crestHorn.rotation.z = -side * 0.22;
            crestHorn.rotation.x = -0.58;
            crestPivot.add(crestHorn);

            const mainCrestGeo = new THREE.ConeGeometry(0.048, 0.28, 6);
            mainCrestGeo.scale(1.15, 1.0, 0.28);
            const mainCrest = new THREE.Mesh(mainCrestGeo, this.matHarpyAdultCrest);
            mainCrest.position.set(0, 0.12, 0);
            crestHorn.add(mainCrest);

            const subCrestGeo = new THREE.ConeGeometry(0.038, 0.22, 6);
            subCrestGeo.scale(1.1, 1.0, 0.25);
            const subCrest = new THREE.Mesh(subCrestGeo, this.matHarpyAdultCrest);
            subCrest.position.set(side * 0.02, 0.09, -0.03);
            subCrest.rotation.x = -0.15;
            crestHorn.add(subCrest);
        });

        // 2.4 犀利深色猛禽眉骨與雙高光金瞳 (與飛行模型完全一致！)
        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.125, 0.025, 0.10);
            eyeGroup.rotation.y = side * 0.28;

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.018, 0.09), this.matHarpyChestBand);
            brow.position.set(0, 0.028, 0);
            const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), this.matHarpyEye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.021, 10, 10), this.matPupil);
            pupil.position.z = 0.018;
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), this.matShine);
            shine1.position.set(side * 0.008, 0.010, 0.032);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), this.matShine);
            shine2.position.set(-side * 0.006, -0.008, 0.032);

            eyeGroup.add(brow, eyeBall, pupil, shine1, shine2);
            headPivot.add(eyeGroup);

            if (side === -1) this.harpyAdultEyeL = eyeGroup;
            else this.harpyAdultEyeR = eyeGroup;
        });

        // 2.5 深黑彎鉤猛禽巨喙 (與飛行模型完全一致！)
        const beakPivot = new THREE.Group();
        beakPivot.position.set(0, -0.01, 0.19);
        headPivot.add(beakPivot);
        this.harpyAdultBeak = beakPivot;

        const upperBaseGeo = new THREE.CylinderGeometry(0.048, 0.068, 0.17, 10);
        upperBaseGeo.rotateX(Math.PI / 2 + 0.15);
        const upperBase = new THREE.Mesh(upperBaseGeo, this.matHarpyBeak);
        upperBase.position.set(0, 0.015, 0.07);
        beakPivot.add(upperBase);

        const hookGeo = new THREE.ConeGeometry(0.042, 0.14, 10);
        hookGeo.rotateX(Math.PI / 2 + 0.68);
        const billHook = new THREE.Mesh(hookGeo, this.matHarpyBeak);
        billHook.position.set(0, -0.032, 0.18);
        beakPivot.add(billHook);

        const lowerBillGeo = new THREE.ConeGeometry(0.042, 0.14, 8);
        lowerBillGeo.rotateX(Math.PI / 2);
        const lowerBill = new THREE.Mesh(lowerBillGeo, this.matHarpyBeak);
        lowerBill.position.set(0, -0.035, 0.08);
        beakPivot.add(lowerBill);

        // 2.6 黑白橫斑與 8 指黑尖飛羽折疊大翼 (Folded Barred Raptor Wings — 收攏時也清楚展現黑白橫斑與黑尖初級飛羽，與展翅時完全同款！)
        const doubleWhiteMat = this.matHarpyBodyWhite.clone();
        doubleWhiteMat.side = THREE.DoubleSide;
        const doubleSlateMat = this.matHarpyFaceDisk.clone();
        doubleSlateMat.side = THREE.DoubleSide;
        const doubleBlackMat = this.matHarpyChestBand.clone();
        doubleBlackMat.side = THREE.DoubleSide;

        this.harpyAdultWings = {};
        [-1, 1].forEach((side) => {
            const wingPivot = new THREE.Group();
            wingPivot.position.set(side * 0.25, 0.16, 0.02);
            wingPivot.rotation.z = -side * 0.12;
            wingPivot.rotation.y = side * 0.10;
            this.harpyAdultGroup.add(wingPivot);

            // 肩部深灰黑與黑白斑駁覆羽
            const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 14), this.matHarpyWingSlate);
            shoulder.scale.set(0.55, 1.05, 1.35);
            shoulder.position.set(side * 0.03, -0.06, -0.02);
            shoulder.castShadow = true;
            wingPivot.add(shoulder);

            // 翼緣黑白橫斑次級飛羽層 (5 片疊合橫紋羽)
            for (let s = 0; s < 5; s++) {
                const secFeather = new THREE.Group();
                secFeather.position.set(side * (0.055 - s * 0.004), -0.14 - s * 0.075, -0.04 - s * 0.045);
                secFeather.rotation.x = -0.45;
                secFeather.rotation.z = side * 0.08;
                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.28, 0.09), doubleSlateMat);
                secFeather.add(blade);
                [-0.08, 0.0, 0.08].forEach(by => {
                    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.032, 0.094), doubleBlackMat);
                    bar.position.y = by;
                    secFeather.add(bar);
                });
                wingPivot.add(secFeather);
            }

            // 翼尖收攏的 6 根黑尖橫斑初級飛羽 (Folded Black-Tipped Barred Primaries)
            for (let p = 0; p < 6; p++) {
                const priBlade = new THREE.Group();
                priBlade.position.set(side * (0.045 - p * 0.005), -0.36 - p * 0.055, -0.16 - p * 0.055);
                priBlade.rotation.x = -0.52 - p * 0.03;
                priBlade.rotation.y = -side * 0.08;
                const fBody = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.34, 0.054), doubleWhiteMat);
                priBlade.add(fBody);
                [-0.08, 0.02].forEach(by => {
                    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.030, 0.056), doubleBlackMat);
                    bar.position.y = by;
                    priBlade.add(bar);
                });
                const tip = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.11, 6), doubleBlackMat);
                tip.rotation.z = Math.PI;
                tip.scale.set(0.4, 1.0, 1.0);
                tip.position.set(0, -0.20, 0);
                priBlade.add(tip);
                wingPivot.add(priBlade);
            }

            if (side === -1) this.harpyAdultWings.left = wingPivot;
            else this.harpyAdultWings.right = wingPivot;
        });

        // 2.7 寬大黑白灰橫條紋扇形尾羽 (7 片帶 3 道黑橫斑的尾羽，與飛行模型完全一致！)
        const tailPivot = new THREE.Group();
        tailPivot.position.set(0, -0.02, -0.46);
        tailPivot.rotation.x = -0.32;
        bodyTiltGroup.add(tailPivot);
        this.harpyAdultTail = tailPivot;

        for (let i = -3; i <= 3; i++) {
            const absI = Math.abs(i);
            const tLen = 0.56 - absI * 0.025;
            const tWidth = 0.088;
            const tailFeather = new THREE.Group();
            tailFeather.rotation.y = i * 0.055; // 站立時扇尾微收攏
            tailFeather.position.set(i * 0.022, -absI * 0.003, 0);

            const baseBlade = new THREE.Mesh(new THREE.BoxGeometry(tWidth, 0.010, tLen), doubleSlateMat);
            baseBlade.position.set(0, 0, -tLen * 0.5);
            tailFeather.add(baseBlade);

            [0.22, 0.54, 0.86].forEach((bandFrac, bIdx) => {
                const bandLen = (bIdx === 2) ? tLen * 0.22 : tLen * 0.15;
                const bandMesh = new THREE.Mesh(new THREE.BoxGeometry(tWidth * 1.02, 0.013, bandLen), doubleBlackMat);
                bandMesh.position.set(0, 0, -tLen * bandFrac);
                tailFeather.add(bandMesh);
            });

            tailPivot.add(tailFeather);
        }

        // 2.8 粗壯 6 道黑白細紋斑馬紋巨腿與黑金致命巨爪 (與飛行模型橘圈內腿爪 1:1 完全一致！)
        this.harpyAdultLegs = {};
        [-1, 1].forEach((side) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.15, -0.16, 0.04);
            this.harpyAdultGroup.add(legPivot);

            // 粗壯純白大腿羽覆羽
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.072, 0.30, 14), this.matHarpyBodyWhite);
            thigh.position.set(0, -0.13, 0);
            legPivot.add(thigh);

            // 6 道細密黑白斑馬橫條紋環 (與 harpyFlightLegs 完全一致)
            for (let r = 0; r < 6; r++) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.086 - r * 0.003, 0.009, 6, 16), this.matHarpyLegBar);
                ring.rotation.x = Math.PI / 2;
                ring.position.set(0, -0.03 - r * 0.042, 0);
                legPivot.add(ring);
            }

            // 金黃色粗大足跗 (Golden Raptor Tarsus)
            const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.052, 0.16, 10), this.matHarpyLegSkin);
            ankle.position.set(0, -0.32, 0.02);
            legPivot.add(ankle);

            // 掌心基座
            const footPad = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.matHarpyLegSkin);
            footPad.scale.set(1.1, 0.5, 1.35);
            footPad.position.set(0, -0.40, 0.05);
            legPivot.add(footPad);

            // 🌟 致命黑金大巨爪（3 前爪 + 1 後拇爪，抓握於橫木上）
            [
                { x: -0.040, z: 0.12 },
                { x: 0, z: 0.14 },
                { x: 0.040, z: 0.12 }
            ].forEach(t => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.015, 0.10, 8), this.matHarpyLegSkin);
                toe.rotation.x = Math.PI / 2;
                toe.position.set(t.x, -0.40, t.z - 0.04);
                legPivot.add(toe);

                const clawGeo = new THREE.ConeGeometry(0.022, 0.14, 8);
                clawGeo.rotateX(Math.PI / 2 + 0.55);
                const claw = new THREE.Mesh(clawGeo, this.matHarpyTalon);
                claw.position.set(t.x, -0.42, t.z + 0.03);
                legPivot.add(claw);
            });

            // 後拇爪 (Hallux)
            const backClaw = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.15, 8), this.matHarpyTalon);
            backClaw.rotateX(-Math.PI / 2 - 0.55);
            backClaw.position.set(0, -0.42, -0.05);
            legPivot.add(backClaw);

            this.harpyAdultLegs[side === -1 ? 'left' : 'right'] = legPivot;
        });

        // 2.9 雨林古木巨型橫木棲木 (掛載於獨立 harpyPerchGroup，起飛時留在原地不跟著飛！)
        const logGeo = new THREE.CylinderGeometry(0.18, 0.20, 1.5, 16);
        logGeo.rotateZ(Math.PI / 2);
        const log = new THREE.Mesh(logGeo, this.matHarpyLog);
        log.position.set(0, 0.06, 0.06);
        log.castShadow = true;
        this.harpyAdultLog = log;
        this.harpyPerchGroup.add(log);
    }

    // 3. 哈比鷹（美洲角雕）飛行專用姿勢骨架（完全依照使用者上傳的哈比鷹飛行實拍照片打造，並與棲木站立模型 100% 統一五官與羽毛，支援起飛／降落無縫收展翅與抓握過渡！）：
    //    - 絕不抓著樹木或獵物起飛！棲木留在地面原位！
    //    - 流線前傾微仰猛禽身軀：純白腹羽點綴黑斑、上胸濃墨黑寬胸帶 (Black Breast Band)、深灰黑背羽
    //    - 向前伸展的銀灰頭顱、深黑彎鉤猛禽巨喙、以及頭頂向後上方斜豎的「雙叉黑色王冠羽 (Twin Black Crown Crest)」
    //    - 腹部下方自然微垂後伸的粗壯「細密黑白橫紋大腿 (Barred Feathered Thighs)」與「金黃色鷹足＋黑金彎鉤巨爪（空爪自然微張，不抓木頭）」
    //    - 寬闊圓拱巨翼：翼下銀白灰底佈滿 4~5 道鮮明深黑橫斑條紋 (Black-and-White Barred Underwings)、翼前緣黑白斑駁覆羽，以及翼尖放射展開 8 根分明開叉、帶黑橫斑與黑羽尖的「指狀初級飛羽」
    //    - 黑灰寬橫條紋扇形尾羽 (Black-and-Grey Banded Fan Tail)
    buildHarpyFlightRig() {
        this.harpyFlightRig = new THREE.Group();
        this.harpyFlightRig.name = 'HarpyFlightRig';
        this.harpyFlightRig.position.set(0, 0.62, 0);
        this.harpyFlightRig.visible = false;
        this.harpyRoot.add(this.harpyFlightRig);

        this.harpyFlightBodyPivot = new THREE.Group();
        this.harpyFlightBodyPivot.rotation.x = -0.14; // 參考照片：飛行時胸腹微昂、流線前傾
        this.harpyFlightRig.add(this.harpyFlightBodyPivot);

        // 3.1 純白流線腹胸軀幹與背部黑灰板岩羽 (White Belly & Slate-Black Back)
        const bellyGeo = new THREE.SphereGeometry(0.32, 22, 18);
        bellyGeo.scale(0.92, 0.82, 1.75);
        const bellyMesh = new THREE.Mesh(bellyGeo, this.matHarpyBodyWhite);
        bellyMesh.castShadow = true;
        this.harpyFlightBodyPivot.add(bellyMesh);

        // 背部深灰黑板岩覆羽
        const backGeo = new THREE.SphereGeometry(0.31, 20, 16);
        backGeo.scale(0.90, 0.65, 1.68);
        const backMesh = new THREE.Mesh(backGeo, this.matHarpyWingSlate);
        backMesh.position.set(0, 0.08, -0.02);
        this.harpyFlightBodyPivot.add(backMesh);

        // 參考照片：上胸標誌性濃墨黑寬胸帶 (Prominent Black Breast Collar Band)
        const chestBandGeo = new THREE.SphereGeometry(0.29, 18, 16);
        chestBandGeo.scale(0.96, 0.80, 0.92);
        const chestBand = new THREE.Mesh(chestBandGeo, this.matHarpyChestBand);
        chestBand.position.set(0, 0.02, 0.28);
        this.harpyFlightBodyPivot.add(chestBand);

        // 參考照片：白色胸腹交界處與側腹點綴的黑色斑點簇 (Black Belly Flecks)
        [
            [-0.14, -0.12, 0.12], [0.14, -0.12, 0.12],
            [-0.18, -0.08, 0.02], [0.18, -0.08, 0.02],
            [-0.10, -0.16, 0.05], [0.10, -0.16, 0.05]
        ].forEach(([fx, fy, fz]) => {
            const fleck = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), this.matHarpyChestBand);
            fleck.scale.set(1.2, 0.5, 1.4);
            fleck.position.set(fx, fy, fz);
            this.harpyFlightBodyPivot.add(fleck);
        });

        // 3.2 向前伸展的銀灰頭頸、彎鉤猛禽巨喙與向後上方斜豎的「雙叉黑王冠羽」 (Silver-Grey Head & Twin Black Crest)
        const neckGeo = new THREE.CylinderGeometry(0.16, 0.21, 0.28, 14);
        neckGeo.rotateX(Math.PI / 2);
        const neckMesh = new THREE.Mesh(neckGeo, this.matHarpyFaceDisk);
        neckMesh.position.set(0, 0.06, 0.46);
        this.harpyFlightBodyPivot.add(neckMesh);

        this.harpyFlightHead = new THREE.Group();
        this.harpyFlightHead.name = 'HarpyFlightHead';
        this.harpyFlightHead.position.set(0, 0.08, 0.58);
        this.harpyFlightHead.rotation.x = 0.12;
        this.harpyFlightBodyPivot.add(this.harpyFlightHead);

        // 銀灰頭顱與面盤
        const headGeo = new THREE.SphereGeometry(0.19, 18, 16);
        headGeo.scale(0.90, 0.88, 1.25);
        const headMesh = new THREE.Mesh(headGeo, this.matHarpyFaceDisk);
        headMesh.castShadow = true;
        this.harpyFlightHead.add(headMesh);

        // 頭頂向後上方斜豎的「雙叉黑色王冠羽」 (參考照片頭頂兩簇斜指後上方的醒目黑羽冠！)
        this.harpyFlightCrest = new THREE.Group();
        this.harpyFlightCrest.position.set(0, 0.14, -0.04);
        this.harpyFlightHead.add(this.harpyFlightCrest);

        [-1, 1].forEach((side) => {
            const crestHorn = new THREE.Group();
            crestHorn.position.set(side * 0.065, 0, 0);
            crestHorn.rotation.z = -side * 0.22;
            crestHorn.rotation.x = -0.68; // 斜向後上方迎風揚起，與照片角度完全一致！
            this.harpyFlightCrest.add(crestHorn);

            const mainCrestGeo = new THREE.ConeGeometry(0.048, 0.28, 6);
            mainCrestGeo.scale(1.15, 1.0, 0.28);
            const mainCrest = new THREE.Mesh(mainCrestGeo, this.matHarpyAdultCrest);
            mainCrest.position.set(0, 0.12, 0);
            crestHorn.add(mainCrest);

            const subCrestGeo = new THREE.ConeGeometry(0.038, 0.22, 6);
            subCrestGeo.scale(1.1, 1.0, 0.25);
            const subCrest = new THREE.Mesh(subCrestGeo, this.matHarpyAdultCrest);
            subCrest.position.set(side * 0.02, 0.09, -0.03);
            subCrest.rotation.x = -0.15;
            crestHorn.add(subCrest);
        });

        // 向前突出的深黑彎鉤猛禽巨喙 (Hooked Raptor Bill)
        const beakGroup = new THREE.Group();
        beakGroup.position.set(0, -0.01, 0.19);
        this.harpyFlightHead.add(beakGroup);

        const upperBillGeo = new THREE.CylinderGeometry(0.048, 0.068, 0.17, 10);
        upperBillGeo.rotateX(Math.PI / 2 + 0.15);
        const upperBill = new THREE.Mesh(upperBillGeo, this.matHarpyBeak);
        upperBill.position.set(0, 0.015, 0.07);
        beakGroup.add(upperBill);

        const billHookGeo = new THREE.ConeGeometry(0.042, 0.14, 10);
        billHookGeo.rotateX(Math.PI / 2 + 0.68);
        const billHook = new THREE.Mesh(billHookGeo, this.matHarpyBeak);
        billHook.position.set(0, -0.032, 0.18);
        beakGroup.add(billHook);

        const lowerBillGeo = new THREE.ConeGeometry(0.042, 0.14, 8);
        lowerBillGeo.rotateX(Math.PI / 2);
        const lowerBill = new THREE.Mesh(lowerBillGeo, this.matHarpyBeak);
        lowerBill.position.set(0, -0.035, 0.08);
        beakGroup.add(lowerBill);

        // 犀利深色猛禽眼眶與雙高光金瞳（與站立模型 1:1 完全一致！）
        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.125, 0.025, 0.10);
            eyeGroup.rotation.y = side * 0.28;
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.018, 0.09), this.matHarpyChestBand);
            brow.position.set(0, 0.028, 0);
            const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), this.matHarpyEye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.021, 10, 10), this.matPupil);
            pupil.position.z = 0.018;
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), this.matShine);
            shine1.position.set(side * 0.008, 0.010, 0.032);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), this.matShine);
            shine2.position.set(-side * 0.006, -0.008, 0.032);
            eyeGroup.add(brow, eyeBall, pupil, shine1, shine2);
            this.harpyFlightHead.add(eyeGroup);
        });

        // 3.3 腹部下方自然微垂後伸的粗壯「細密黑白橫紋大腿」與「金黃鷹足＋黑金彎鉤巨爪」（空爪，絕不抓樹幹或獵物！）
        this.harpyFlightLegs = { left: null, right: null };
        [-1, 1].forEach((side) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.14, -0.18, -0.10);
            legPivot.rotation.x = -0.52; // 向後下方自然斜伸，貼合參考照片橘圈內的腿部角度
            legPivot.rotation.z = side * 0.08;
            this.harpyFlightBodyPivot.add(legPivot);

            // 粗壯純白大腿羽底
            const thighGeo = new THREE.CylinderGeometry(0.095, 0.072, 0.30, 14);
            const thigh = new THREE.Mesh(thighGeo, this.matHarpyBodyWhite);
            thigh.position.set(0, -0.13, 0);
            legPivot.add(thigh);

            // 參考照片重點：大腿上密集的黑白斑馬細橫紋 (6 道細密黑橫環)
            for (let r = 0; r < 6; r++) {
                const barRing = new THREE.Mesh(new THREE.TorusGeometry(0.086 - r * 0.003, 0.009, 6, 16), this.matHarpyLegBar);
                barRing.rotation.x = Math.PI / 2;
                barRing.position.set(0, -0.03 - r * 0.042, 0);
                legPivot.add(barRing);
            }

            // 粗壯金黃色足跗 (Golden-Yellow Tarsus)
            const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.052, 0.16, 10), this.matHarpyLegSkin);
            tarsus.position.set(0, -0.32, 0.02);
            tarsus.rotation.x = 0.25;
            legPivot.add(tarsus);

            // 金黃鷹爪掌與 4 根彎曲黑金巨爪（空爪自然微收，不抓任何木頭或獵物！）
            const talonCluster = new THREE.Group();
            talonCluster.position.set(0, -0.40, 0.05);
            legPivot.add(talonCluster);

            const footPad = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), this.matHarpyLegSkin);
            footPad.scale.set(1.0, 0.6, 1.25);
            talonCluster.add(footPad);

            [-0.036, 0, 0.036].forEach((tx, idx) => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.015, 0.10, 8), this.matHarpyLegSkin);
                toe.rotation.x = Math.PI / 2 + 0.35;
                toe.position.set(tx, -0.02, 0.05);
                talonCluster.add(toe);

                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.13, 8), this.matHarpyTalon);
                claw.rotation.x = Math.PI + 0.45;
                claw.position.set(tx, -0.06, 0.09);
                talonCluster.add(claw);
            });

            // 後拇趾與巨型後鉤爪
            const backToe = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.08, 8), this.matHarpyLegSkin);
            backToe.rotation.x = -Math.PI / 2 - 0.35;
            backToe.position.set(0, -0.02, -0.04);
            const backClaw = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.14, 8), this.matHarpyTalon);
            backClaw.rotation.x = -Math.PI + 0.45;
            backClaw.position.set(0, -0.06, -0.07);
            talonCluster.add(backToe, backClaw);

            if (side === -1) this.harpyFlightLegs.left = legPivot;
            else this.harpyFlightLegs.right = legPivot;
        });

        // 3.4 寬大黑白灰橫條紋扇形尾羽 (Broad Black-and-Grey Banded Fan Tail)
        this.harpyFlightTail = new THREE.Group();
        this.harpyFlightTail.position.set(0, 0.0, -0.50);
        this.harpyFlightTail.rotation.x = -0.08;
        this.harpyFlightBodyPivot.add(this.harpyFlightTail);

        const doubleWhiteMat = this.matHarpyBodyWhite.clone();
        doubleWhiteMat.side = THREE.DoubleSide;
        const doubleSlateMat = this.matHarpyFaceDisk.clone();
        doubleSlateMat.side = THREE.DoubleSide;
        const doubleBlackMat = this.matHarpyChestBand.clone();
        doubleBlackMat.side = THREE.DoubleSide;

        // 7 片扇形展開的寬尾羽，每片帶有 3 道黑橫斑與灰白底色（完全還原照片左下角的黑白灰條紋尾羽！）
        for (let i = -3; i <= 3; i++) {
            const absI = Math.abs(i);
            const tLen = 0.56 - absI * 0.025;
            const tWidth = 0.095;
            const tailFeather = new THREE.Group();
            tailFeather.rotation.y = i * 0.095;
            tailFeather.position.set(i * 0.032, -absI * 0.003, 0);

            // 淺灰白尾羽基底
            const baseBlade = new THREE.Mesh(new THREE.BoxGeometry(tWidth, 0.010, tLen), doubleSlateMat);
            baseBlade.position.set(0, 0, -tLen * 0.5);
            tailFeather.add(baseBlade);

            // 3 道寬黑色橫斑條紋 (Black Tail Bands)
            [0.22, 0.54, 0.86].forEach((bandFrac, bIdx) => {
                const bandLen = (bIdx === 2) ? tLen * 0.22 : tLen * 0.15;
                const bandMesh = new THREE.Mesh(new THREE.BoxGeometry(tWidth * 1.02, 0.013, bandLen), doubleBlackMat);
                bandMesh.position.set(0, 0, -tLen * bandFrac);
                tailFeather.add(bandMesh);
            });

            this.harpyFlightTail.add(tailFeather);
        }

        // 3.5 🌟 寬闊圓拱、佈滿黑白橫斑紋的巨翼與翼尖 8 根分明開叉的黑尖「指狀初級飛羽」
        //     (Broad Barred Harpy Wings with Mottled Leading Coverts & 8 Black-Tipped Slotted Primary Fingers)
        this.harpyFlightWings = { left: null, right: null };

        [-1, 1].forEach((side) => {
            // 第一關節：肩部樞紐 (Shoulder Pivot)
            const shoulderPivot = new THREE.Group();
            shoulderPivot.position.set(side * 0.22, 0.08, 0.08);
            this.harpyFlightBodyPivot.add(shoulderPivot);

            // 內翼銀白灰底面（寬闊圓拱猛禽翼型）
            const innerShape = new THREE.Shape();
            innerShape.moveTo(0, 0.18);
            innerShape.quadraticCurveTo(side * 0.32, 0.30, side * 0.64, 0.24);
            innerShape.lineTo(side * 0.64, -0.38);
            innerShape.quadraticCurveTo(side * 0.32, -0.46, 0, -0.38);
            innerShape.closePath();

            const innerWingBase = new THREE.Mesh(new THREE.ShapeGeometry(innerShape, 12), doubleWhiteMat);
            innerWingBase.rotation.x = -Math.PI / 2;
            innerWingBase.castShadow = true;
            shoulderPivot.add(innerWingBase);

            // 翼背深黑灰覆羽層（背部視角深色、翼下視角黑白橫斑分明）
            const upperWingCover = new THREE.Mesh(new THREE.ShapeGeometry(innerShape, 12), doubleBlackMat);
            upperWingCover.rotation.x = -Math.PI / 2;
            upperWingCover.position.y = 0.012;
            shoulderPivot.add(upperWingCover);

            // 參考照片重點：翼下前緣黑白斑駁覆羽帶 (Mottled Black-and-White Underwing Coverts along Leading Edge)
            for (let c = 0; c < 7; c++) {
                const cx = side * (0.08 + c * 0.078);
                const cz = 0.14 - (c % 2) * 0.06;
                const patch = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.016, 0.14), doubleBlackMat);
                patch.position.set(cx, -0.006, cz);
                patch.rotation.y = side * 0.20;
                shoulderPivot.add(patch);
            }

            // 內側 10 片寬大次級飛羽 (Secondary Flight Feathers S1~S10) — 每片帶有 4 道清晰的深黑橫斑條紋！
            for (let s = 0; s < 10; s++) {
                const frac = s / 9;
                const sx = side * (0.06 + frac * 0.56);
                const sz = -0.02 - Math.sin(frac * Math.PI) * 0.04;
                const sLen = 0.44 + Math.sin(frac * Math.PI) * 0.06;

                const secGroup = new THREE.Group();
                secGroup.position.set(sx, -0.005, sz);
                secGroup.rotation.y = side * (0.03 + frac * 0.12);

                // 灰白飛羽羽身
                const secBlade = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.010, sLen), doubleSlateMat);
                secBlade.position.set(0, 0, -sLen * 0.5);
                secGroup.add(secBlade);

                // 4 道深黑橫斑條紋 + 羽尖黑斑（構成照片中極具辨識度的猛禽同心黑橫紋翼面！）
                [0.22, 0.46, 0.70, 0.93].forEach((bPos, bIdx) => {
                    const bLen = (bIdx === 3) ? 0.065 : 0.042;
                    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.013, bLen), doubleBlackMat);
                    bar.position.set(0, -0.002, -sLen * bPos);
                    secGroup.add(bar);
                });

                shoulderPivot.add(secGroup);
            }

            // 第二關節：外翼腕關節樞紐 (Outer Hand-Wing Pivot) — 放射展開 8 根黑尖橫斑「指狀初級飛羽」！
            const outerWingPivot = new THREE.Group();
            outerWingPivot.position.set(side * 0.62, 0.0, 0.18);
            shoulderPivot.add(outerWingPivot);

            // 腕部前緣黑白斑駁初級覆羽墊
            const wristCovert = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), this.matHarpyChestBand);
            wristCovert.scale.set(1.4, 0.22, 1.1);
            wristCovert.position.set(side * 0.10, -0.004, -0.06);
            outerWingPivot.add(wristCovert);

            // 🌟 8 根分明開叉、帶黑橫斑與黑羽尖的「指狀初級飛羽 (8 Barred & Black-Tipped Slotted Primary Fingers)」
            const harpyPrimaries = [
                { angle: 0.16, bx: 0.03, bz: 0.04, len: 0.46, bw: 0.048, up: 0.06 }, // P10 最前緣短指羽
                { angle: 0.30, bx: 0.06, bz: 0.01, len: 0.64, bw: 0.054, up: 0.09 }, // P9  前緣長指羽
                { angle: 0.45, bx: 0.08, bz: -0.02, len: 0.76, bw: 0.058, up: 0.11 }, // P8  翼尖主指羽 1
                { angle: 0.60, bx: 0.08, bz: -0.05, len: 0.80, bw: 0.060, up: 0.10 }, // P7  翼尖最長主指羽 2
                { angle: 0.75, bx: 0.07, bz: -0.09, len: 0.76, bw: 0.060, up: 0.08 }, // P6  翼尖主指羽 3
                { angle: 0.91, bx: 0.06, bz: -0.13, len: 0.68, bw: 0.062, up: 0.06 }, // P5  外中段開叉指羽
                { angle: 1.08, bx: 0.04, bz: -0.17, len: 0.58, bw: 0.064, up: 0.04 }, // P4  內中段開叉指羽
                { angle: 1.25, bx: 0.02, bz: -0.21, len: 0.48, bw: 0.066, up: 0.02 }  // P3  銜接內翼初級飛羽
            ];

            const fingerNodes = [];
            harpyPrimaries.forEach((cfg, idx) => {
                const fingerPivot = new THREE.Group();
                fingerPivot.position.set(side * cfg.bx, idx * 0.0015, cfg.bz);
                fingerPivot.rotation.y = -side * (Math.PI / 2 - cfg.angle);
                fingerPivot.rotation.x = cfg.up;

                // 淺灰白羽片主體
                const innerLen = cfg.len * 0.52;
                const innerBlade = new THREE.Mesh(new THREE.BoxGeometry(cfg.bw, 0.010, innerLen), doubleWhiteMat);
                innerBlade.position.set(0, 0, innerLen * 0.5);
                fingerPivot.add(innerBlade);

                // 外半段窄化指狀羽片 (Slotted Outer Finger Blade)
                const outerLen = cfg.len * 0.48;
                const outerBlade = new THREE.Mesh(new THREE.BoxGeometry(cfg.bw * 0.62, 0.010, outerLen * 0.72), doubleSlateMat);
                outerBlade.position.set(0, 0, innerLen + outerLen * 0.36);
                fingerPivot.add(outerBlade);

                // 黑色尖端羽尖 (Black Primary Tip)
                const blackTipGeo = new THREE.ConeGeometry(cfg.bw * 0.34, outerLen * 0.38, 6);
                blackTipGeo.rotateX(Math.PI / 2);
                blackTipGeo.scale(1.0, 0.25, 1.0);
                const blackTip = new THREE.Mesh(blackTipGeo, doubleBlackMat);
                blackTip.position.set(0, 0, innerLen + outerLen * 0.85);
                fingerPivot.add(blackTip);

                // 指羽上的 3 道深黑橫斑環 (Black Bands across each primary finger)
                [0.24, 0.48, 0.70].forEach((bFrac) => {
                    const barW = (bFrac > 0.52) ? cfg.bw * 0.65 : cfg.bw * 1.04;
                    const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, 0.013, 0.042), doubleBlackMat);
                    bar.position.set(0, 0, cfg.len * bFrac);
                    fingerPivot.add(bar);
                });

                outerWingPivot.add(fingerPivot);
                fingerNodes.push({ pivot: fingerPivot, baseUp: cfg.up, idx: idx });
            });

            const wingData = {
                shoulder: shoulderPivot,
                outerWing: outerWingPivot,
                fingers: fingerNodes,
                side: side
            };
            if (side === -1) this.harpyFlightWings.left = wingData;
            else this.harpyFlightWings.right = wingData;
        });
    }

    // 驅動哈比鷹高空展翼振翅、起飛展翼與降落收翼抓木過渡姿態：
    // flightBlend = 1.0 為空中全展翼（雙翼高舉、8 指黑尖飛羽開叉、雙叉王冠羽斜豎、斑紋腿金爪向後微垂空爪）；
    // flightBlend = 0.0 為棲木挺立姿態（身軀昂首 -0.52、雙翼收攏貼身、雙腿前伸抓握棲木），消除起飛與降落瞬間任何突兀感！
    animateHarpyFlightPose(elapsedTime, flapSpeed = 10.0, flightBlend = 1.0) {
        if (!this.harpyFlightRig || !this.harpyFlightWings) return;
        const b = Math.max(0.0, Math.min(1.0, flightBlend));
        const fold = 1.0 - b;
        const phase = elapsedTime * flapSpeed;
        const sinW = Math.sin(phase);
        const cosW = Math.cos(phase);

        // 雙翼高揚上舉（偏向上揮大仰角，展現翼下黑白橫斑與 8 指開叉飛羽；b->0 時平滑向後收攏貼緊身側！）
        const shoulderFlap = (0.34 + sinW * 0.52) * b;
        const forwardSweep = (cosW * 0.12) * b;
        const wristFlap = (0.16 + Math.sin(phase - 0.4) * 0.30) * b;

        [this.harpyFlightWings.left, this.harpyFlightWings.right].forEach((w) => {
            if (!w) return;
            const s = w.side;
            w.shoulder.rotation.z = -s * shoulderFlap + s * fold * 0.18;
            w.shoulder.rotation.y = -s * forwardSweep + s * fold * 1.15;
            w.shoulder.rotation.x = (0.06 + sinW * 0.05) * b - fold * 0.25;
            w.shoulder.scale.setScalar(THREE.MathUtils.lerp(0.65, 1.0, b));

            w.outerWing.rotation.z = -s * wristFlap;
            w.outerWing.rotation.y = -s * (cosW * 0.07) * b + s * fold * 0.42;

            if (w.fingers) {
                w.fingers.forEach((f) => {
                    f.pivot.rotation.x = (f.baseUp + sinW * (0.04 + f.idx * 0.008)) * b;
                });
            }
        });

        // 身軀與頭部傾角：b=0 時挺胸昂首站立於棲木 (-0.52)，b=1 時平滑轉為流線飛行 (-0.14)
        if (this.harpyFlightBodyPivot) {
            this.harpyFlightBodyPivot.position.y = -sinW * 0.04 * b;
            this.harpyFlightBodyPivot.rotation.x = THREE.MathUtils.lerp(-0.52, -0.14 + cosW * 0.04, b);
        }
        if (this.harpyFlightHead) {
            this.harpyFlightHead.rotation.x = THREE.MathUtils.lerp(0.52, 0.12 - cosW * 0.03, b);
        }
        // 雙腿與空爪：b=0 時向前伸直踩握棲木 (+0.52 抵消身體傾角)，b=1 時向後下方自然斜垂 (-0.52，絕不抓木頭！)
        if (this.harpyFlightLegs) {
            const legSway = sinW * 0.06 * b;
            const baseLegRot = THREE.MathUtils.lerp(0.50, -0.52, b);
            if (this.harpyFlightLegs.left) this.harpyFlightLegs.left.rotation.x = baseLegRot + legSway;
            if (this.harpyFlightLegs.right) this.harpyFlightLegs.right.rotation.x = baseLegRot - legSway * 0.5;
        }
        if (this.harpyFlightTail) {
            this.harpyFlightTail.rotation.x = THREE.MathUtils.lerp(-0.32, -0.08 + cosW * 0.05, b);
        }
    }

    // 切換幼雛 / 成年角雕形態顯示
    updateHarpyStage(stage = 'baby') {
        this.harpyStage = stage;
        const isBaby = (stage === 'baby');
        if (this.harpyFlightRig) this.harpyFlightRig.visible = false;
        if (this.harpyBabyGroup) this.harpyBabyGroup.visible = isBaby;
        if (this.harpyAdultGroup) this.harpyAdultGroup.visible = !isBaby;
        if (this.harpyBabyLog) this.harpyBabyLog.visible = isBaby;
        if (this.harpyAdultLog) this.harpyAdultLog.visible = !isBaby;
        this.eyeLeft = isBaby ? this.harpyBabyEyeL : this.harpyAdultEyeL;
        this.eyeRight = isBaby ? this.harpyBabyEyeR : this.harpyAdultEyeR;
    }

    // ─────────────────────────────────────────────────────────
    //  🦅 哈比鷹（美洲角雕）專屬動態引擎：
    //  - 幼雛：台北動物園棉花糖雪球呆萌歪頭殺、小肉翅興奮拍打、索食張嘴幼鳴（幼雛保持雪白毛球外觀，不會突變成巨鷹！）
    //  - 成年皇：
    //    1. 標誌性「雙叉王冠羽炸起（Crest Flaring！）」
    //    2. 展翼昂首穿透長嘯
    //    3. 起飛 <-> 高空展翅 <-> 收翅伸爪降落回棲木無縫過渡！
    // ─────────────────────────────────────────────────────────
    updateHarpy(delta, elapsedTime) {
        const t = elapsedTime;
        const isGameFlying = (this.currentState === 'harpy_flying');
        const isBaby = (this.harpyStage === 'baby');

        // 幼雛期觸發飛行小遊戲時：棲木留在地面，白雪球幼雛拍動小肉翅飛翔，起飛與降落皆為幼雛！
        if (isGameFlying && isBaby) {
            if (this.harpyFlightRig) this.harpyFlightRig.visible = false;
            if (this.harpyAdultGroup) this.harpyAdultGroup.visible = false;
            if (this.harpyPerchGroup) {
                this.harpyPerchGroup.visible = true;
                if (this.harpyBabyLog) this.harpyBabyLog.visible = true;
                if (this.harpyAdultLog) this.harpyAdultLog.visible = false;
                this.harpyPerchGroup.position.set(-this.group.position.x, -this.group.position.y, -this.group.position.z);
                this.harpyPerchGroup.rotation.set(-this.group.rotation.x, -this.group.rotation.y, -this.group.rotation.z);
            }
            if (this.harpyBabyGroup) {
                this.harpyBabyGroup.visible = true;
                this.harpyBabyGroup.position.y = 0.42 + Math.sin(t * 14) * 0.03;
                if (this.harpyBabyWings && this.harpyBabyWings.left) {
                    const flap = Math.sin(t * 18) * 0.48;
                    this.harpyBabyWings.left.rotation.z = 0.35 + flap;
                    this.harpyBabyWings.right.rotation.z = -0.35 - flap;
                }
            }
            return;
        }

        // 眨眼動畫
        this.nextBlinkTime = (this.nextBlinkTime || 3.0) - delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.6 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        } else if (this.currentState === 'sleep') {
            if (this.eyeLeft) this.eyeLeft.scale.y = 0.12;
            if (this.eyeRight) this.eyeRight.scale.y = 0.12;
        } else {
            if (this.eyeLeft && this.eyeLeft.scale.y !== 1) this.eyeLeft.scale.y = 1;
            if (this.eyeRight && this.eyeRight.scale.y !== 1) this.eyeRight.scale.y = 1;
        }

        // 🦅 鳥類偶爾高空飛行控制器 (Flight Autonomy — 僅成年角雕會自主展翅升空！)
        if (!this.birdFlight) {
            this.birdFlight = {
                timer: 7.0 + Math.random() * 6.0,
                phase: 'perch',
                phaseTime: 0.0,
                flightAngle: 0.0
            };
        }

        const bf = this.birdFlight;
        const isIdle = (this.currentState === 'idle' || !this.currentState);

        if (isIdle && !isBaby) {
            if (bf.phase === 'perch') {
                bf.timer -= delta;
                if (bf.timer <= 0) {
                    bf.phase = 'takeoff';
                    bf.phaseTime = 0.0;
                }
            } else if (bf.phase === 'takeoff') {
                bf.phaseTime += delta;
                if (bf.phaseTime >= 1.4) {
                    bf.phase = 'flying';
                    bf.phaseTime = 0.0;
                    bf.flightAngle = 0.0;
                }
            } else if (bf.phase === 'flying') {
                bf.phaseTime += delta;
                bf.flightAngle += delta * 1.35;
                if (bf.phaseTime >= 5.5) {
                    bf.phase = 'landing';
                    bf.phaseTime = 0.0;
                }
            } else if (bf.phase === 'landing') {
                bf.phaseTime += delta;
                if (bf.phaseTime >= 1.8) {
                    bf.phase = 'perch';
                    bf.phaseTime = 0.0;
                    bf.timer = 11.0 + Math.random() * 7.0;
                }
            }
        } else {
            bf.phase = 'perch';
            bf.timer = 10.0;
        }

        // ✈️ 若處於哈比鷹飛行小遊戲 ('harpy_flying') 或成年待機自主飛行階段 ('takeoff' | 'flying' | 'landing')：
        // 棲木留在地面，哈比鷹鬆開爪子展翅升空，降落時平滑收翼伸爪踩回棲木原位！
        const isAutoAirborne = isIdle && !isBaby && (bf.phase === 'takeoff' || bf.phase === 'flying' || bf.phase === 'landing');
        if ((isGameFlying || isAutoAirborne) && this.harpyFlightRig) {
            if (this.harpyBabyGroup) this.harpyBabyGroup.visible = false;
            if (this.harpyAdultGroup) this.harpyAdultGroup.visible = false;
            this.harpyFlightRig.visible = true;

            if (isGameFlying) {
                // 小遊戲中整個 dog.group 在空中移動，將 harpyPerchGroup 反向補償固定於地面原點 (0,0,0)（或隱藏），確保絕不抓著樹木飛行，且降落回原位時棲木就在腳下！
                if (this.harpyPerchGroup) {
                    this.harpyPerchGroup.visible = true;
                    if (this.harpyBabyLog) this.harpyBabyLog.visible = false;
                    if (this.harpyAdultLog) this.harpyAdultLog.visible = true;
                    this.harpyPerchGroup.position.set(-this.group.position.x, -this.group.position.y, -this.group.position.z);
                    this.harpyPerchGroup.rotation.set(-this.group.rotation.x, -this.group.rotation.y, -this.group.rotation.z);
                }
                this.harpyFlightRig.position.set(0, 0.62, 0);
                this.harpyFlightRig.rotation.set(0, 0, 0);
                this.animateHarpyFlightPose(t, 11.0, 1.0);
                return;
            }

            // 待機自主飛行時：棲木留在地面原位 (0,0,0)，哈比鷹鬆開爪子單獨展翅飛上高空！
            if (this.harpyPerchGroup) {
                this.harpyPerchGroup.visible = true;
                this.harpyPerchGroup.position.set(0, 0, 0);
                this.harpyPerchGroup.rotation.set(0, 0, 0);
                if (this.harpyBabyLog) this.harpyBabyLog.visible = isBaby;
                if (this.harpyAdultLog) this.harpyAdultLog.visible = !isBaby;
            }

            if (bf.phase === 'takeoff') {
                const p = Math.min(1.0, bf.phaseTime / 1.4);
                const easeP = 1 - Math.pow(1 - p, 2);
                const blend = Math.min(1.0, p / 0.45);
                this.harpyFlightRig.position.set(0, THREE.MathUtils.lerp(0.62, 2.08, easeP), THREE.MathUtils.lerp(0, 0.35, easeP));
                this.harpyFlightRig.rotation.set(-0.18 * Math.sin(p * Math.PI), 0, 0);
                this.animateHarpyFlightPose(t, 12.5, blend);
            } else if (bf.phase === 'flying') {
                const fa = bf.flightAngle;
                const rx = Math.sin(fa) * 1.48;
                const rz = Math.cos(fa) * 1.12;
                const ry = 2.08 + Math.sin(fa * 2.0) * 0.22;
                const vx = Math.cos(fa) * 1.48;
                const vz = -Math.sin(fa) * 1.12;
                this.harpyFlightRig.position.set(rx, ry, rz);
                this.harpyFlightRig.rotation.y = Math.atan2(vx, vz);
                this.harpyFlightRig.rotation.z = -0.24;
                this.harpyFlightRig.rotation.x = -Math.cos(fa * 2.0) * 0.08;
                this.animateHarpyFlightPose(t, 10.5, 1.0);
            } else if (bf.phase === 'landing') {
                const p = Math.min(1.0, bf.phaseTime / 1.8);
                const easeP = p * p * (3 - 2 * p);
                const blend = Math.max(0.0, 1.0 - Math.max(0.0, (p - 0.35) / 0.65));
                this.harpyFlightRig.position.x = THREE.MathUtils.lerp(this.harpyFlightRig.position.x, 0, easeP);
                this.harpyFlightRig.position.z = THREE.MathUtils.lerp(this.harpyFlightRig.position.z, 0, easeP);
                this.harpyFlightRig.position.y = THREE.MathUtils.lerp(2.08, 0.62, easeP);
                this.harpyFlightRig.rotation.x = THREE.MathUtils.lerp(0, -0.14, Math.sin(p * Math.PI));
                this.harpyFlightRig.rotation.z = THREE.MathUtils.lerp(this.harpyFlightRig.rotation.z, 0, easeP);
                this.harpyFlightRig.rotation.y = THREE.MathUtils.lerp(this.harpyFlightRig.rotation.y, 0, easeP);
                this.animateHarpyFlightPose(t, 9.5, blend);
            }
            return;
        }

        // 非飛行狀態：恢復棲木與站立模型
        if (this.harpyFlightRig) this.harpyFlightRig.visible = false;
        if (this.harpyPerchGroup) {
            this.harpyPerchGroup.visible = true;
            this.harpyPerchGroup.position.set(0, 0, 0);
            this.harpyPerchGroup.rotation.set(0, 0, 0);
            if (this.harpyBabyLog) this.harpyBabyLog.visible = isBaby;
            if (this.harpyAdultLog) this.harpyAdultLog.visible = !isBaby;
        }
        if (this.harpyBabyGroup) this.harpyBabyGroup.visible = isBaby;
        if (this.harpyAdultGroup) this.harpyAdultGroup.visible = !isBaby;

        if (isBaby) {
            if (!this.harpyBabyGroup) return;

            // 幼雛軟綿綿呼吸律動
            const breathe = Math.sin(t * 3.8) * 0.012;
            this.harpyBabyGroup.position.y = 0.42 + breathe;

            if (this.currentState === 'happy') {
                // 幼雛開心索食：雙翅快扇、小嘴頻頻開合長叫
                this.harpyBabyHead.rotation.z = Math.sin(t * 8) * 0.18;
                this.harpyBabyHead.rotation.x = -0.15 + Math.sin(t * 10) * 0.08;
                if (this.harpyBabyBeak) {
                    this.harpyBabyBeak.rotation.x = 0.22 + Math.sin(t * 12) * 0.15;
                }
                const flap = Math.sin(t * 14) * 0.45;
                if (this.harpyBabyWings.left) this.harpyBabyWings.left.rotation.z = -0.2 - flap;
                if (this.harpyBabyWings.right) this.harpyBabyWings.right.rotation.z = 0.2 + flap;

            } else if (this.currentState === 'eat') {
                this.harpyBabyHead.rotation.x = 0.28 + Math.sin(t * 8) * 0.12;
                if (this.harpyBabyBeak) this.harpyBabyBeak.rotation.x = Math.abs(Math.sin(t * 10)) * 0.2;
                if (this.harpyBabyWings.left) this.harpyBabyWings.left.rotation.z = -0.1;
                if (this.harpyBabyWings.right) this.harpyBabyWings.right.rotation.z = 0.1;

            } else if (this.currentState === 'pet') {
                // 撫摸：極致可愛歪頭殺！
                this.harpyBabyHead.rotation.z = 0.35 + Math.sin(t * 2) * 0.05;
                this.harpyBabyHead.rotation.x = -0.1;
                if (this.harpyBabyWings.left) this.harpyBabyWings.left.rotation.z = -0.05;
                if (this.harpyBabyWings.right) this.harpyBabyWings.right.rotation.z = 0.05;

            } else if (this.currentState === 'sleep') {
                // 睡眠：小毛球縮脖入睡
                this.harpyBabyGroup.position.y = 0.36;
                this.harpyBabyHead.rotation.x = 0.2;
                this.harpyBabyHead.rotation.z = 0.12;
                if (this.harpyBabyWings.left) this.harpyBabyWings.left.rotation.z = 0;
                if (this.harpyBabyWings.right) this.harpyBabyWings.right.rotation.z = 0;

            } else {
                // 待機：經典台北動物園幼鳥「歪頭殺」探看世界，偶爾拍拍小肉翅
                const tiltCycle = t * 1.5;
                this.harpyBabyHead.rotation.z = Math.sin(tiltCycle) * 0.24;
                this.harpyBabyHead.rotation.y = Math.sin(t * 0.9) * 0.18;
                this.harpyBabyHead.rotation.x = Math.sin(t * 1.2) * 0.04;
                const babyFlap = (bf.phase === 'flying' || bf.phase === 'takeoff') ? Math.sin(t * 14.0) * 0.35 : 0;
                if (this.harpyBabyWings.left) this.harpyBabyWings.left.rotation.z = Math.sin(t * 2) * 0.05 - babyFlap;
                if (this.harpyBabyWings.right) this.harpyBabyWings.right.rotation.z = -Math.sin(t * 2) * 0.05 + babyFlap;
            }

        } else {
            // 成年雨林空霸角雕
            if (!this.harpyAdultGroup) return;

            // 1. 沉穩威嚴深呼吸
            const breathe = Math.sin(t * 2.2) * 0.015;
            const crest = this.harpyAdultCrest;

            if (this.currentState === 'happy') {
                // 🌟 經典神作動態：羽冠炸毛 ＋ 展翅長嘯 (The Sovereign Harpy Eagle Cry！)
                this.harpyAdultGroup.position.set(0, 0.62 + breathe, 0);
                this.harpyAdultGroup.rotation.set(0, 0, 0);
                this.harpyAdultHead.rotation.x = 0.52 - 0.34;
                this.harpyAdultHead.rotation.y = Math.sin(t * 2) * 0.08;

                if (crest) {
                    crest.rotation.x = -0.38 + Math.sin(t * 6) * 0.05;
                    crest.scale.set(1.25, 1.35, 1.25);
                }

                if (this.harpyAdultBeak) {
                    this.harpyAdultBeak.rotation.x = 0.32 + Math.sin(t * 8) * 0.08;
                }

                const wingSpread = 0.72 + Math.sin(t * 4) * 0.12;
                if (this.harpyAdultWings.left) {
                    this.harpyAdultWings.left.rotation.z = -wingSpread;
                    this.harpyAdultWings.left.rotation.y = -0.35;
                }
                if (this.harpyAdultWings.right) {
                    this.harpyAdultWings.right.rotation.z = wingSpread;
                    this.harpyAdultWings.right.rotation.y = 0.35;
                }

            } else if (this.currentState === 'eat') {
                this.harpyAdultGroup.position.set(0, 0.62 + breathe, 0);
                this.harpyAdultGroup.rotation.set(0, 0, 0);
                if (crest) {
                    crest.rotation.x = 0.2;
                    crest.scale.set(1.0, 1.0, 1.0);
                }
                this.harpyAdultHead.rotation.x = 0.52 + 0.35 + Math.sin(t * 8) * 0.18;
                if (this.harpyAdultBeak) this.harpyAdultBeak.rotation.x = Math.abs(Math.sin(t * 8)) * 0.18;
                if (this.harpyAdultWings.left) this.harpyAdultWings.left.rotation.z = -0.15;
                if (this.harpyAdultWings.right) this.harpyAdultWings.right.rotation.z = 0.15;

            } else if (this.currentState === 'pet') {
                this.harpyAdultGroup.position.set(0, 0.62 + breathe, 0);
                this.harpyAdultGroup.rotation.set(0, 0, 0);
                if (crest) {
                    crest.rotation.x = 0.55;
                    crest.scale.set(0.95, 0.95, 0.95);
                }
                this.harpyAdultHead.rotation.x = 0.52 - 0.08;
                this.harpyAdultHead.rotation.z = 0.14;
                if (this.harpyAdultWings.left) this.harpyAdultWings.left.rotation.z = -0.08;
                if (this.harpyAdultWings.right) this.harpyAdultWings.right.rotation.z = 0.08;

            } else if (this.currentState === 'sleep') {
                this.harpyAdultGroup.position.set(0, 0.52, 0);
                this.harpyAdultGroup.rotation.set(0, 0, 0);
                if (crest) {
                    crest.rotation.x = 0.65;
                    crest.scale.set(0.9, 0.9, 0.9);
                }
                this.harpyAdultHead.rotation.x = 0.52 + 0.18;
                this.harpyAdultHead.rotation.z = 0.12;
                if (this.harpyAdultWings.left) this.harpyAdultWings.left.rotation.z = 0.05;
                if (this.harpyAdultWings.right) this.harpyAdultWings.right.rotation.z = -0.05;

            } else {
                // 棲木常規待機
                if (crest) {
                    crest.rotation.x = Math.sin(t * 2.5) * 0.06;
                    crest.scale.set(1.0, 1.0, 1.0);
                }
                this.harpyAdultGroup.position.set(0, 0.62 + breathe, 0);
                this.harpyAdultGroup.rotation.set(0, 0, 0);
                this.harpyAdultHead.rotation.x = 0.52 + Math.sin(t * 1.4) * 0.03;
                this.harpyAdultHead.rotation.y = Math.sin(t * 0.8) * 0.28;
                this.harpyAdultHead.rotation.z = 0;
                if (this.harpyAdultBeak) this.harpyAdultBeak.rotation.x = 0;
                if (this.harpyAdultWings.left) this.harpyAdultWings.left.rotation.z = -0.12;
                if (this.harpyAdultWings.right) this.harpyAdultWings.right.rotation.z = 0.12;
            }
        }
    }

    // =========================================================================
    // 🐋 虎鯨（海洋霸主・殺人鯨 Orcinus orca）3D 雙形態模型系統
    // 1. 軟萌虎鯨幼崽：圓滾滾西瓜頭、暖杏白幼鯨斑紋、短萌背鰭、俏皮游泳擺尾、水花氣泡
    // 2. 深海霸主角雕鯨：高聳霸氣黑背鰭、灰白鞍斑、標誌性橢圓白眼斑與側腹白羽斑、流線魚雷身軀、噴氣孔彩虹水柱、新月水平尾鰭
    // =========================================================================
    buildOrcaMesh() {
        this.orcaRoot = new THREE.Group();
        this.orcaRoot.name = 'OrcaRoot';
        this.root.add(this.orcaRoot);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.orcaRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        this.orcaGroup = new THREE.Group();
        this.orcaRoot.add(this.orcaGroup);

        this.orcaStage = 'baby';

        this.buildOrcaBabyMesh();
        this.buildOrcaAdultMesh();

        this.updateOrcaStage('baby');
    }

    // 1. 軟萌虎鯨幼崽 (Baby Orca Calf - 參考圖中依偎在母親身邊的圓滾滾幼鯨)
    buildOrcaBabyMesh() {
        this.orcaBabyGroup = new THREE.Group();
        this.orcaGroup.add(this.orcaBabyGroup);

        // 蔚藍水波底座
        this.orcaBabyWater = new THREE.Group();
        const waterRing1 = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.95, 32), this.matOrcaWater);
        waterRing1.rotation.x = -Math.PI / 2;
        waterRing1.position.y = 0.04;
        const waterRing2 = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.45, 32), this.matOrcaWater);
        waterRing2.rotation.x = -Math.PI / 2;
        waterRing2.position.y = 0.05;
        this.orcaBabyWater.add(waterRing1, waterRing2);

        // 浮動微光水珠氣泡
        for (let i = 0; i < 4; i++) {
            const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this.matOrcaWater);
            const ang = (i / 4) * Math.PI * 2;
            bubble.position.set(Math.cos(ang) * 0.65, 0.08 + (i % 2) * 0.05, Math.sin(ang) * 0.65);
            this.orcaBabyWater.add(bubble);
        }
        this.orcaBabyGroup.add(this.orcaBabyWater);

        // 幼鯨身軀群組
        this.orcaBabyBody = new THREE.Group();
        this.orcaBabyBody.position.y = 0.52;
        this.orcaBabyGroup.add(this.orcaBabyBody);

        // 圓滾滾流線黑鯨身 (Melon Torpedo Body)
        const babyTorsoGeo = new THREE.SphereGeometry(0.42, 28, 20);
        babyTorsoGeo.scale(0.85, 0.88, 1.45);
        const babyTorso = new THREE.Mesh(babyTorsoGeo, this.matOrcaSkinBlack);
        this.orcaBabyBody.add(babyTorso);

        // 暖白軟糯白肚皮與下顎 (Belly & Chin)
        const babyBellyGeo = new THREE.SphereGeometry(0.40, 24, 18);
        babyBellyGeo.scale(0.82, 0.46, 1.35);
        const babyBelly = new THREE.Mesh(babyBellyGeo, this.matOrcaBabyWhite);
        babyBelly.position.set(0, -0.16, 0.06);
        this.orcaBabyBody.add(babyBelly);

        // 幼鯨橢圓白眼斑 (Baby Eye Patches)
        const eyePatchGeo = new THREE.SphereGeometry(0.11, 14, 14);
        eyePatchGeo.scale(0.08, 0.16, 0.34);
        const patchL = new THREE.Mesh(eyePatchGeo, this.matOrcaBabyWhite);
        patchL.position.set(-0.31, 0.11, 0.36);
        patchL.rotation.set(0.1, -0.15, -0.2);

        const patchR = new THREE.Mesh(eyePatchGeo, this.matOrcaBabyWhite);
        patchR.position.set(0.31, 0.11, 0.36);
        patchR.rotation.set(0.1, 0.15, 0.2);
        this.orcaBabyBody.add(patchL, patchR);

        // 幼鯨深黑明眸 (Eyes)
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), this.matOrcaEye);
        eyeL.position.set(-0.32, 0.02, 0.32);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), this.matOrcaEye);
        eyeR.position.set(0.32, 0.02, 0.32);
        const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), this.matShine);
        shineL.position.set(-0.33, 0.035, 0.34);
        const shineR = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), this.matShine);
        shineR.position.set(0.33, 0.035, 0.34);
        this.orcaBabyBody.add(eyeL, eyeR, shineL, shineR);

        // 幼鯨兩側暖白側腹斑 (Flank Patches)
        const flankPatchGeo = new THREE.SphereGeometry(0.14, 12, 12);
        flankPatchGeo.scale(0.08, 0.22, 0.45);
        const flankL = new THREE.Mesh(flankPatchGeo, this.matOrcaBabyWhite);
        flankL.position.set(-0.32, -0.05, -0.38);
        flankL.rotation.set(0, 0.12, -0.15);
        const flankR = new THREE.Mesh(flankPatchGeo, this.matOrcaBabyWhite);
        flankR.position.set(0.32, -0.05, -0.38);
        flankR.rotation.set(0, -0.12, 0.15);
        this.orcaBabyBody.add(flankL, flankR);

        // 幼鯨圓角短背鰭 (Baby Dorsal Fin)
        const finGeo = new THREE.ConeGeometry(0.14, 0.36, 12);
        finGeo.scale(0.14, 1.0, 0.48);
        const dorsalFin = new THREE.Mesh(finGeo, this.matOrcaSkinBlack);
        dorsalFin.position.set(0, 0.36, -0.1);
        dorsalFin.rotation.x = -0.35;
        this.orcaBabyBody.add(dorsalFin);

        // 灰白小鞍斑 (Baby Saddle Patch)
        const saddleGeo = new THREE.SphereGeometry(0.2, 12, 12);
        saddleGeo.scale(0.65, 0.1, 0.4);
        const saddle = new THREE.Mesh(saddleGeo, this.matOrcaSaddle);
        saddle.position.set(0, 0.34, -0.28);
        this.orcaBabyBody.add(saddle);

        // 噴氣孔 (Blowhole)
        const blowholeGeo = new THREE.TorusGeometry(0.04, 0.015, 6, 12);
        const blowhole = new THREE.Mesh(blowholeGeo, this.matOrcaSkinBlack);
        blowhole.position.set(0, 0.36, 0.18);
        blowhole.rotation.x = Math.PI / 2;
        this.orcaBabyBody.add(blowhole);

        // 幼鯨氣泡水柱 (Baby Spout)
        this.orcaBabySpout = new THREE.Group();
        const spoutMesh = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 10), this.matOrcaSpout);
        spoutMesh.position.y = 0.21;
        this.orcaBabySpout.add(spoutMesh);
        this.orcaBabySpout.position.set(0, 0.36, 0.18);
        this.orcaBabySpout.scale.set(0.001, 0.001, 0.001);
        this.orcaBabyBody.add(this.orcaBabySpout);

        // 幼鯨小胸鰭 (Pectoral Flippers)
        const flipperGeo = new THREE.SphereGeometry(0.22, 14, 14);
        flipperGeo.scale(0.1, 0.65, 0.35);

        this.orcaBabyFinL = new THREE.Group();
        this.orcaBabyFinL.position.set(-0.33, -0.12, 0.22);
        const fMeshL = new THREE.Mesh(flipperGeo, this.matOrcaSkinBlack);
        fMeshL.rotation.set(-0.25, 0.2, -0.6);
        this.orcaBabyFinL.add(fMeshL);
        this.orcaBabyBody.add(this.orcaBabyFinL);

        this.orcaBabyFinR = new THREE.Group();
        this.orcaBabyFinR.position.set(0.33, -0.12, 0.22);
        const fMeshR = new THREE.Mesh(flipperGeo, this.matOrcaSkinBlack);
        fMeshR.rotation.set(-0.25, -0.2, 0.6);
        this.orcaBabyFinR.add(fMeshR);
        this.orcaBabyBody.add(this.orcaBabyFinR);

        // 幼鯨尾柄與水平尾鰭 (Tail Stock & Flukes)
        this.orcaBabyTailStock = new THREE.Group();
        this.orcaBabyTailStock.position.set(0, 0, -0.62);
        this.orcaBabyBody.add(this.orcaBabyTailStock);

        const tailStemGeo = new THREE.CylinderGeometry(0.18, 0.08, 0.68, 14);
        tailStemGeo.rotateX(Math.PI / 2);
        const tailStem = new THREE.Mesh(tailStemGeo, this.matOrcaSkinBlack);
        tailStem.position.set(0, 0, -0.32);
        this.orcaBabyTailStock.add(tailStem);

        this.orcaBabyFlukes = new THREE.Group();
        this.orcaBabyFlukes.position.set(0, 0, -0.65);
        this.orcaBabyTailStock.add(this.orcaBabyFlukes);

        const flukeGeo = new THREE.SphereGeometry(0.22, 14, 12);
        flukeGeo.scale(0.75, 0.08, 0.32);
        const flukeL = new THREE.Mesh(flukeGeo, this.matOrcaSkinBlack);
        flukeL.position.set(-0.16, 0, 0);
        flukeL.rotation.y = -0.26;
        const flukeR = new THREE.Mesh(flukeGeo, this.matOrcaSkinBlack);
        flukeR.position.set(0.16, 0, 0);
        flukeR.rotation.y = 0.26;
        this.orcaBabyFlukes.add(flukeL, flukeR);
    }

    // 2. 深海霸主角雕鯨 (Adult Orca - 參考圖中帶有高聳背鰭與經典黑白燕尾服的成年虎鯨)
    buildOrcaAdultMesh() {
        this.orcaAdultGroup = new THREE.Group();
        this.orcaGroup.add(this.orcaAdultGroup);

        // 雄渾深邃的大洋水波底座
        this.orcaAdultWater = new THREE.Group();
        const waterRingA1 = new THREE.Mesh(new THREE.RingGeometry(0.85, 2.1, 36), this.matOrcaWater);
        waterRingA1.rotation.x = -Math.PI / 2;
        waterRingA1.position.y = 0.04;
        const waterRingA2 = new THREE.Mesh(new THREE.RingGeometry(0.42, 1.25, 32), this.matOrcaWater);
        waterRingA2.rotation.x = -Math.PI / 2;
        waterRingA2.position.y = 0.05;
        this.orcaAdultWater.add(waterRingA1, waterRingA2);

        // 外圈奔湧浪花水滴
        for (let i = 0; i < 6; i++) {
            const drop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), this.matOrcaWater);
            const ang = (i / 6) * Math.PI * 2;
            drop.position.set(Math.cos(ang) * 1.5, 0.09 + (i % 2) * 0.06, Math.sin(ang) * 1.5);
            this.orcaAdultWater.add(drop);
        }
        this.orcaAdultGroup.add(this.orcaAdultWater);

        // 成體身軀主群組
        this.orcaAdultBody = new THREE.Group();
        this.orcaAdultBody.position.y = 0.68;
        this.orcaAdultGroup.add(this.orcaAdultBody);

        // 宏偉流線型魚雷身軀 (Hydrodynamic Torpedo Body)
        const adultTorsoGeo = new THREE.SphereGeometry(0.62, 32, 24);
        adultTorsoGeo.scale(0.92, 0.96, 2.4);
        const adultTorso = new THREE.Mesh(adultTorsoGeo, this.matOrcaSkinBlack);
        this.orcaAdultBody.add(adultTorso);

        // 純白下顎與白肚皮 (Pure White Underbelly & Chin)
        const adultBellyGeo = new THREE.SphereGeometry(0.59, 32, 24);
        adultBellyGeo.scale(0.88, 0.52, 2.25);
        const adultBelly = new THREE.Mesh(adultBellyGeo, this.matOrcaWhite);
        adultBelly.position.set(0, -0.24, 0.12);
        this.orcaAdultBody.add(adultBelly);

        // 標誌性純白橢圓大眼斑 (Iconic White Eye Patches)
        const eyePatchAdultGeo = new THREE.SphereGeometry(0.22, 16, 16);
        eyePatchAdultGeo.scale(0.09, 0.24, 0.55);

        const patchAdultL = new THREE.Mesh(eyePatchAdultGeo, this.matOrcaWhite);
        patchAdultL.position.set(-0.48, 0.18, 0.85);
        patchAdultL.rotation.set(0.12, -0.18, -0.25);

        const patchAdultR = new THREE.Mesh(eyePatchAdultGeo, this.matOrcaWhite);
        patchAdultR.position.set(0.48, 0.18, 0.85);
        patchAdultR.rotation.set(0.12, 0.18, 0.25);
        this.orcaAdultBody.add(patchAdultL, patchAdultR);

        // 虎鯨深邃靈性海獸眼 (Cetacean Eyes)
        const eyeAdultL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), this.matOrcaEye);
        eyeAdultL.position.set(-0.50, 0.02, 0.8);
        const eyeAdultR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), this.matOrcaEye);
        eyeAdultR.position.set(0.50, 0.02, 0.8);
        const shineAdultL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), this.matShine);
        shineAdultL.position.set(-0.52, 0.04, 0.83);
        const shineAdultR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), this.matShine);
        shineAdultR.position.set(0.52, 0.04, 0.83);
        this.orcaAdultBody.add(eyeAdultL, eyeAdultR, shineAdultL, shineAdultR);

        // 側腹羽狀三叉大白斑 (Flank Patches)
        const flankAdultGeo = new THREE.SphereGeometry(0.28, 16, 16);
        flankAdultGeo.scale(0.12, 0.38, 0.95);
        const flankAdultL = new THREE.Mesh(flankAdultGeo, this.matOrcaWhite);
        flankAdultL.position.set(-0.52, -0.06, -0.85);
        flankAdultL.rotation.set(0, 0.15, -0.18);

        const flankAdultR = new THREE.Mesh(flankAdultGeo, this.matOrcaWhite);
        flankAdultR.position.set(0.52, -0.06, -0.85);
        flankAdultR.rotation.set(0, -0.15, 0.18);
        this.orcaAdultBody.add(flankAdultL, flankAdultR);

        // 標誌性高聳霸氣黑背鰭 (Tall Curved Dorsal Fin - 雄偉虎鯨的象徵！)
        const dorsalAdultGeo = new THREE.ConeGeometry(0.26, 0.95, 16);
        dorsalAdultGeo.scale(0.14, 1.0, 0.55);
        const dorsalAdult = new THREE.Mesh(dorsalAdultGeo, this.matOrcaSkinBlack);
        dorsalAdult.position.set(0, 0.62, -0.18);
        dorsalAdult.rotation.x = -0.32;
        this.orcaAdultBody.add(dorsalAdult);

        // 背鰭後方灰白鞍斑 (Grey Saddle Patch)
        const saddleAdultGeo = new THREE.SphereGeometry(0.35, 16, 14);
        saddleAdultGeo.scale(0.65, 0.12, 0.5);
        const saddleAdult = new THREE.Mesh(saddleAdultGeo, this.matOrcaSaddle);
        saddleAdult.position.set(0, 0.60, -0.58);
        this.orcaAdultBody.add(saddleAdult);

        // 頂部噴氣孔 (Blowhole)
        const blowholeAdultGeo = new THREE.TorusGeometry(0.07, 0.025, 8, 16);
        const blowholeAdult = new THREE.Mesh(blowholeAdultGeo, this.matOrcaSkinBlack);
        blowholeAdult.position.set(0, 0.58, 0.35);
        blowholeAdult.rotation.x = Math.PI / 2;
        this.orcaAdultBody.add(blowholeAdult);

        // 噴氣孔晶瑩彩虹噴泉水柱 (Erupting Water Spout)
        this.orcaAdultSpout = new THREE.Group();
        const spoutCone1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 12), this.matOrcaSpout);
        spoutCone1.position.y = 0.42;
        const spoutCone2 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.65, 12), this.matOrcaSpout);
        spoutCone2.position.y = 0.55;
        this.orcaAdultSpout.add(spoutCone1, spoutCone2);
        this.orcaAdultSpout.position.set(0, 0.58, 0.35);
        this.orcaAdultSpout.scale.set(0.001, 0.001, 0.001);
        this.orcaAdultBody.add(this.orcaAdultSpout);

        // 巨大划水胸鰭 (Large Pectoral Flippers)
        const flipperAdultGeo = new THREE.SphereGeometry(0.45, 18, 16);
        flipperAdultGeo.scale(0.12, 0.95, 0.55);

        this.orcaAdultFinL = new THREE.Group();
        this.orcaAdultFinL.position.set(-0.52, -0.18, 0.45);
        const fMeshAdultL = new THREE.Mesh(flipperAdultGeo, this.matOrcaSkinBlack);
        fMeshAdultL.rotation.set(-0.3, 0.22, -0.65);
        this.orcaAdultFinL.add(fMeshAdultL);
        this.orcaAdultBody.add(this.orcaAdultFinL);

        this.orcaAdultFinR = new THREE.Group();
        this.orcaAdultFinR.position.set(0.52, -0.18, 0.45);
        const fMeshAdultR = new THREE.Mesh(flipperAdultGeo, this.matOrcaSkinBlack);
        fMeshAdultR.rotation.set(-0.3, -0.22, 0.65);
        this.orcaAdultFinR.add(fMeshAdultR);
        this.orcaAdultBody.add(this.orcaAdultFinR);

        // 尾柄與寬闊水平新月尾鰭 (Tail Stock & Broad Horizontal Flukes)
        this.orcaAdultTailStock = new THREE.Group();
        this.orcaAdultTailStock.position.set(0, 0, -1.15);
        this.orcaAdultBody.add(this.orcaAdultTailStock);

        const tailStemAdultGeo = new THREE.CylinderGeometry(0.32, 0.14, 1.35, 16);
        tailStemAdultGeo.rotateX(Math.PI / 2);
        const tailStemAdult = new THREE.Mesh(tailStemAdultGeo, this.matOrcaSkinBlack);
        tailStemAdult.position.set(0, 0, -0.65);
        this.orcaAdultTailStock.add(tailStemAdult);

        // 尾柄底部白腹延伸
        const tailWhiteGeo = new THREE.CylinderGeometry(0.18, 0.08, 1.1, 14);
        tailWhiteGeo.rotateX(Math.PI / 2);
        const tailWhite = new THREE.Mesh(tailWhiteGeo, this.matOrcaWhite);
        tailWhite.position.set(0, -0.12, -0.55);
        this.orcaAdultTailStock.add(tailWhite);

        this.orcaAdultFlukes = new THREE.Group();
        this.orcaAdultFlukes.position.set(0, 0, -1.3);
        this.orcaAdultTailStock.add(this.orcaAdultFlukes);

        const flukeAdultGeo = new THREE.SphereGeometry(0.48, 18, 14);
        flukeAdultGeo.scale(0.92, 0.09, 0.42);
        const flukeAdultL = new THREE.Mesh(flukeAdultGeo, this.matOrcaSkinBlack);
        flukeAdultL.position.set(-0.42, 0, 0);
        flukeAdultL.rotation.set(0, -0.32, 0.08);

        const flukeAdultR = new THREE.Mesh(flukeAdultGeo, this.matOrcaSkinBlack);
        flukeAdultR.position.set(0.42, 0, 0);
        flukeAdultR.rotation.set(0, 0.32, -0.08);
        this.orcaAdultFlukes.add(flukeAdultL, flukeAdultR);
    }

    // 形態切換 (幼崽 ↔ 成體)
    updateOrcaStage(stage) {
        this.orcaStage = stage;
        const isBaby = (stage === 'baby');
        if (this.orcaBabyGroup) this.orcaBabyGroup.visible = isBaby;
        if (this.orcaAdultGroup) this.orcaAdultGroup.visible = !isBaby;
    }

    // 虎鯨游泳與海獸互動骨架動畫
    updateOrca(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.orcaStage === 'baby');

        // 水波自然旋轉流動
        if (this.orcaBabyWater) this.orcaBabyWater.rotation.y = t * 0.22;
        if (this.orcaAdultWater) this.orcaAdultWater.rotation.y = t * 0.16;

        // 🐋 虎鯨潛水控制器 (每隔 8-15 秒潛入水底悠游一會，再破浪浮出噴水)
        if (!this.orcaDive) {
            this.orcaDive = {
                timer: 5.0 + Math.random() * 5.0,
                phase: 'surface',
                phaseTime: 0.0,
                depth: 0.0,
                pitch: 0.0
            };
        }

        const dive = this.orcaDive;
        const isIdle = (this.currentState === 'idle' || this.state === 'idle' || !this.currentState);

        if (isIdle) {
            if (dive.phase === 'surface') {
                dive.timer -= delta;
                dive.depth = 0.0;
                dive.pitch = 0.0;
                if (dive.timer <= 0) {
                    dive.phase = 'diving';
                    dive.phaseTime = 0.0;
                }
            } else if (dive.phase === 'diving') {
                dive.phaseTime += delta;
                const p = Math.min(1.0, dive.phaseTime / 2.2);
                dive.depth = THREE.MathUtils.lerp(0.0, -0.42, p); // 潛入水下 -0.42
                dive.pitch = THREE.MathUtils.lerp(0.0, 0.32, Math.sin(p * Math.PI)); // 下潛俯衝
                if (dive.phaseTime >= 2.2) {
                    dive.phase = 'underwater';
                    dive.phaseTime = 0.0;
                }
            } else if (dive.phase === 'underwater') {
                dive.phaseTime += delta;
                dive.depth = -0.42; // 在水底潛游
                dive.pitch = Math.sin(t * 2.5) * 0.06;
                if (dive.phaseTime >= 3.6) {
                    dive.phase = 'breaching';
                    dive.phaseTime = 0.0;
                }
            } else if (dive.phase === 'breaching') {
                dive.phaseTime += delta;
                const p = Math.min(1.0, dive.phaseTime / 1.6);
                dive.depth = THREE.MathUtils.lerp(-0.42, 0.14, p); // 衝出水面！
                dive.pitch = THREE.MathUtils.lerp(0.12, -0.38, p); // 仰角破浪
                if (dive.phaseTime >= 1.6) {
                    dive.phase = 'recovering';
                    dive.phaseTime = 0.0;
                }
            } else if (dive.phase === 'recovering') {
                dive.phaseTime += delta;
                const p = Math.min(1.0, dive.phaseTime / 1.4);
                dive.depth = THREE.MathUtils.lerp(0.14, 0.0, p);
                dive.pitch = THREE.MathUtils.lerp(-0.38, 0.0, p);
                if (dive.phaseTime >= 1.4) {
                    dive.phase = 'surface';
                    dive.timer = 11.0 + Math.random() * 8.0;
                }
            }
        } else {
            dive.phase = 'surface';
            dive.depth = 0.0;
            dive.pitch = 0.0;
        }

        if (isBaby) {
            // 幼鯨頂球特技姿態
            if (this.state === 'ball_bounce' || this.currentState === 'ball_bounce') {
                const by = (this.orcaBounceY !== undefined) ? this.orcaBounceY : 0.16;
                const bp = (this.orcaBouncePitch !== undefined) ? this.orcaBouncePitch : -0.35;
                this.orcaBabyGroup.position.y = by;
                this.orcaBabyBody.rotation.x = bp;
                this.orcaBabyTailStock.rotation.x = 0.35;
                this.orcaBabyFlukes.rotation.x = 0.45;
                this.orcaBabyFinL.rotation.z = -0.75;
                this.orcaBabyFinR.rotation.z = 0.75;
                return;
            }

            // 幼鯨：俏皮靈活的游水與歡快擺尾
            if (this.state === 'happy' || this.currentState === 'happy') {
                // 興奮躍水與噴泡泡
                this.orcaBabyGroup.position.y = 0.22 + Math.sin(t * 6.0) * 0.14;
                this.orcaBabyBody.rotation.x = -0.18 + Math.sin(t * 6.0) * 0.22;
                this.orcaBabyTailStock.rotation.x = -Math.sin(t * 6.0) * 0.42;
                this.orcaBabyFlukes.rotation.x = -Math.sin(t * 6.0 - 0.5) * 0.55;

                this.orcaBabyFinL.rotation.z = -0.6 + Math.sin(t * 8.0) * 0.35;
                this.orcaBabyFinR.rotation.z = 0.6 - Math.sin(t * 8.0) * 0.35;

                // 噴出小水花氣泡
                this.orcaBabySpout.scale.set(1.4, 2.2, 1.4);

            } else if (this.state === 'sleeping' || this.currentState === 'sleep') {
                // 靜水漂浮入眠
                this.orcaBabyGroup.position.y = Math.sin(t * 1.2) * 0.03;
                this.orcaBabyBody.rotation.x = 0.04;
                this.orcaBabyTailStock.rotation.x = Math.sin(t * 1.2) * 0.08;
                this.orcaBabyFlukes.rotation.x = 0.05;
                this.orcaBabyFinL.rotation.z = -0.55;
                this.orcaBabyFinR.rotation.z = 0.55;
                this.orcaBabySpout.scale.set(0.001, 0.001, 0.001);

            } else {
                // 悠哉巡游 / 潛入水底
                const isUnder = (dive.phase === 'underwater' || dive.phase === 'diving');
                const swimSpeed = isUnder ? 4.2 : 3.0;
                this.orcaBabyGroup.position.y = dive.depth + Math.sin(t * swimSpeed) * 0.05;
                this.orcaBabyBody.rotation.x = dive.pitch + Math.sin(t * swimSpeed - 0.3) * 0.08;
                this.orcaBabyTailStock.rotation.x = -Math.sin(t * swimSpeed) * 0.32;
                this.orcaBabyFlukes.rotation.x = -Math.sin(t * swimSpeed - 0.5) * 0.45;

                this.orcaBabyFinL.rotation.z = -0.6 + Math.sin(t * swimSpeed) * 0.14;
                this.orcaBabyFinR.rotation.z = 0.6 - Math.sin(t * swimSpeed) * 0.14;

                // 破浪浮出水面噴水
                if (dive.phase === 'breaching') {
                    const sp = Math.sin((dive.phaseTime / 1.6) * Math.PI) * 1.5;
                    this.orcaBabySpout.scale.set(sp, sp * 1.8, sp);
                } else {
                    this.orcaBabySpout.scale.set(0.001, 0.001, 0.001);
                }
            }

        } else {
            // 成體虎鯨頂球特技姿態
            if (this.state === 'ball_bounce' || this.currentState === 'ball_bounce') {
                const by = (this.orcaBounceY !== undefined) ? this.orcaBounceY : 0.28;
                const bp = (this.orcaBouncePitch !== undefined) ? this.orcaBouncePitch : -0.38;
                this.orcaAdultGroup.position.y = by;
                this.orcaAdultBody.rotation.x = bp;
                this.orcaAdultTailStock.rotation.x = 0.42;
                this.orcaAdultFlukes.rotation.x = 0.55;
                this.orcaAdultFinL.rotation.z = -0.8;
                this.orcaAdultFinR.rotation.z = 0.8;
                return;
            }

            // 成體：威嚴優雅的深海巨擘，流暢無阻的背鰭破浪
            if (this.state === 'happy' || this.currentState === 'happy') {
                // 雄渾壯麗的空中大翻躍 (Breach Jump) 與噴氣孔彩虹水柱暴發！
                this.orcaAdultGroup.position.y = 0.35 + Math.sin(t * 4.8) * 0.22;
                this.orcaAdultBody.rotation.x = -0.22 + Math.sin(t * 4.8) * 0.28;
                this.orcaAdultTailStock.rotation.x = -Math.sin(t * 4.8) * 0.48;
                this.orcaAdultFlukes.rotation.x = -Math.sin(t * 4.8 - 0.5) * 0.6;

                this.orcaAdultFinL.rotation.z = -0.65 + Math.sin(t * 6.5) * 0.32;
                this.orcaAdultFinR.rotation.z = 0.65 - Math.sin(t * 6.5) * 0.32;

                // 噴出高聳晶瑩水花！
                this.orcaAdultSpout.scale.set(1.8, 3.2, 1.8);

            } else if (this.state === 'sleeping' || this.currentState === 'sleep') {
                // 深海平靜巡航入眠
                this.orcaAdultGroup.position.y = Math.sin(t * 1.0) * 0.03;
                this.orcaAdultBody.rotation.x = 0.02;
                this.orcaAdultTailStock.rotation.x = Math.sin(t * 1.0) * 0.06;
                this.orcaAdultFlukes.rotation.x = 0.04;
                this.orcaAdultFinL.rotation.z = -0.6;
                this.orcaAdultFinR.rotation.z = 0.6;
                this.orcaAdultSpout.scale.set(0.001, 0.001, 0.001);

            } else {
                // 霸氣常規游水 / 潛入水底
                const isUnder = (dive.phase === 'underwater' || dive.phase === 'diving');
                const swimSpeed = isUnder ? 3.5 : 2.2;
                this.orcaAdultGroup.position.y = dive.depth + Math.sin(t * swimSpeed) * 0.06;
                this.orcaAdultBody.rotation.x = dive.pitch + Math.sin(t * swimSpeed - 0.4) * 0.08;
                this.orcaAdultTailStock.rotation.x = -Math.sin(t * swimSpeed) * 0.30;
                this.orcaAdultFlukes.rotation.x = -Math.sin(t * swimSpeed - 0.5) * 0.42;

                this.orcaAdultFinL.rotation.z = -0.65 + Math.sin(t * swimSpeed) * 0.12;
                this.orcaAdultFinR.rotation.z = 0.65 - Math.sin(t * swimSpeed) * 0.12;

                // 破浪浮出水面噴水
                if (dive.phase === 'breaching') {
                    const sp = Math.sin((dive.phaseTime / 1.6) * Math.PI) * 1.8;
                    this.orcaAdultSpout.scale.set(sp, sp * 2.2, sp);
                } else {
                    this.orcaAdultSpout.scale.set(0.001, 0.001, 0.001);
                }
            }
        }
    }

    // =========================================================================
    // 🐒 長臂猿（金絲長臂猿・林冠臂行大師 Nomascus / Hylobates）3D 雙形態模型系統
    // 1. 金毛幼崽：圓滾滾金黃毛球、小黑面具臉、長臂揮手討抱抱、古藤小棲木
    // 2. 林冠飛人：雄渾老藤樹杈、頭頂黑毛冠與白霜毛圈、超長臂行雙臂抓藤盪躍、高空天籟長鳴
    // =========================================================================
    buildGibbonMesh() {
        this.gibbonRoot = new THREE.Group();
        this.gibbonRoot.name = 'GibbonRoot';
        this.root.add(this.gibbonRoot);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.gibbonRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        this.gibbonGroup = new THREE.Group();
        this.gibbonRoot.add(this.gibbonGroup);

        this.gibbonStage = 'baby';

        this.buildGibbonBabyMesh();
        this.buildGibbonAdultMesh();

        this.updateGibbonStage('baby');
    }

    // 1. 金毛幼崽 (Baby Gibbon - 參考圖中依偎在懷裡的超萌金黃毛球小精靈)
    buildGibbonBabyMesh() {
        this.gibbonBabyGroup = new THREE.Group();
        this.gibbonGroup.add(this.gibbonBabyGroup);

        // 幼猿老藤小棲木 (Baby Jungle Perch)
        this.gibbonBabyPerch = new THREE.Group();
        const bBranchGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.4, 14);
        bBranchGeo.rotateZ(Math.PI / 3.2);
        const bBranch = new THREE.Mesh(bBranchGeo, this.matGibbonBranch);
        bBranch.position.set(0.1, 0.22, 0);
        this.gibbonBabyPerch.add(bBranch);

        // 雨林小翠葉
        const leafGeo = new THREE.SphereGeometry(0.1, 8, 8);
        leafGeo.scale(1.4, 0.18, 0.6);
        const matLeaf = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
        const leaf1 = new THREE.Mesh(leafGeo, matLeaf);
        leaf1.position.set(0.48, 0.44, 0.1);
        leaf1.rotation.set(0.3, 0.5, 0.2);
        const leaf2 = new THREE.Mesh(leafGeo, matLeaf);
        leaf2.position.set(-0.25, 0.05, 0.1);
        leaf2.rotation.set(-0.2, -0.4, 0.3);
        this.gibbonBabyPerch.add(leaf1, leaf2);
        this.gibbonBabyGroup.add(this.gibbonBabyPerch);

        // 幼猿身軀主群組
        this.gibbonBabyBody = new THREE.Group();
        this.gibbonBabyBody.position.set(0, 0.45, 0);
        this.gibbonBabyGroup.add(this.gibbonBabyBody);

        // 圓滾滾金黃毛球身軀 (Golden Baby Torso)
        const bTorsoGeo = new THREE.SphereGeometry(0.28, 22, 18);
        bTorsoGeo.scale(0.95, 1.15, 0.95);
        const bTorso = new THREE.Mesh(bTorsoGeo, this.matGibbonBabyFur);
        this.gibbonBabyBody.add(bTorso);

        // 幼猿小腦袋 (Baby Head)
        this.gibbonBabyHead = new THREE.Group();
        this.gibbonBabyHead.position.set(0, 0.28, 0.06);
        this.gibbonBabyBody.add(this.gibbonBabyHead);

        const bHeadGeo = new THREE.SphereGeometry(0.19, 20, 18);
        const bHead = new THREE.Mesh(bHeadGeo, this.matGibbonBabyFur);
        this.gibbonBabyHead.add(bHead);

        // 幼猿金黃圓圓小耳朵 (Cute Baby Ears)
        const earGeo = new THREE.SphereGeometry(0.055, 10, 10);
        earGeo.scale(0.6, 1.0, 0.8);
        const earL = new THREE.Mesh(earGeo, this.matGibbonBabyFur);
        earL.position.set(-0.17, 0.02, -0.02);
        const earR = new THREE.Mesh(earGeo, this.matGibbonBabyFur);
        earR.position.set(0.17, 0.02, -0.02);
        this.gibbonBabyHead.add(earL, earR);

        // 幼猿純黑小面具臉 (Tiny Black Face Mask)
        const bFaceGeo = new THREE.SphereGeometry(0.13, 16, 16);
        bFaceGeo.scale(0.9, 0.95, 0.45);
        const bFace = new THREE.Mesh(bFaceGeo, this.matGibbonFaceSkin);
        bFace.position.set(0, -0.01, 0.13);
        this.gibbonBabyHead.add(bFace);

        // 水靈靈大黑眼睛與高光 (Curious Obsidian Eyes & Sparkles)
        const bEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 14), this.matGibbonEye);
        bEyeL.position.set(-0.052, 0.025, 0.175);
        const bEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 14), this.matGibbonEye);
        bEyeR.position.set(0.052, 0.025, 0.175);
        const bShineL = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
        bShineL.position.set(-0.06, 0.038, 0.195);
        const bShineR = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
        bShineR.position.set(0.06, 0.038, 0.195);
        this.gibbonBabyHead.add(bEyeL, bEyeR, bShineL, bShineR);

        // 幼猿小黑鼻吻部
        const bMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), this.matGibbonFaceSkin);
        bMuzzle.position.set(0, -0.03, 0.2);
        this.gibbonBabyHead.add(bMuzzle);

        // 幼猿纖長小臂膀 (Slender Arms)
        // 左臂抓藤
        this.gibbonBabyArmL = new THREE.Group();
        this.gibbonBabyArmL.position.set(-0.24, 0.16, 0);
        const bArmLGeo = new THREE.CylinderGeometry(0.048, 0.036, 0.48, 10);
        bArmLGeo.rotateZ(0.55);
        const bArmLMesh = new THREE.Mesh(bArmLGeo, this.matGibbonBabyFur);
        bArmLMesh.position.set(-0.13, -0.16, 0.04);
        this.gibbonBabyArmL.add(bArmLMesh);
        const bHandL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.matGibbonHands);
        bHandL.position.set(-0.26, -0.34, 0.06);
        this.gibbonBabyArmL.add(bHandL);
        this.gibbonBabyBody.add(this.gibbonBabyArmL);

        // 右臂歡快伸長揮手討抱抱 (Waving Arm Asking for Hugs - 參考圖中高舉求抱姿勢！)
        this.gibbonBabyArmR = new THREE.Group();
        this.gibbonBabyArmR.position.set(0.24, 0.16, 0);
        const bArmRGeo = new THREE.CylinderGeometry(0.048, 0.036, 0.52, 10);
        bArmRGeo.rotateZ(-0.95);
        const bArmRMesh = new THREE.Mesh(bArmRGeo, this.matGibbonBabyFur);
        bArmRMesh.position.set(0.22, 0.18, 0.08);
        this.gibbonBabyArmR.add(bArmRMesh);
        const bHandR = new THREE.Mesh(new THREE.SphereGeometry(0.046, 8, 8), this.matGibbonHands);
        bHandR.position.set(0.42, 0.36, 0.12);
        this.gibbonBabyArmR.add(bHandR);
        this.gibbonBabyBody.add(this.gibbonBabyArmR);

        // 幼猿小腿腿與小抓腳
        const bLegGeo = new THREE.SphereGeometry(0.13, 12, 12);
        bLegGeo.scale(0.82, 1.25, 0.88);
        const bLegL = new THREE.Mesh(bLegGeo, this.matGibbonBabyFur);
        bLegL.position.set(-0.15, -0.24, 0.09);
        const bLegR = new THREE.Mesh(bLegGeo, this.matGibbonBabyFur);
        bLegR.position.set(0.15, -0.24, 0.09);
        const bFootL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.matGibbonHands);
        bFootL.position.set(-0.15, -0.36, 0.16);
        const bFootR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.matGibbonHands);
        bFootR.position.set(0.15, -0.36, 0.16);
        this.gibbonBabyBody.add(bLegL, bLegR, bFootL, bFootR);
    }

    // 2. 林冠飛人成年長臂猿 (Adult Gibbon - 參考圖中高居樹杈、長臂攀藤的金色長臂猿)
    buildGibbonAdultMesh() {
        this.gibbonAdultGroup = new THREE.Group();
        this.gibbonGroup.add(this.gibbonAdultGroup);

        // 壯麗熱帶雨林高空老藤樹杈 (Rainforest Vine Fork Perch)
        this.gibbonAdultPerch = new THREE.Group();
        // 主藤幹：從右下方向上攀升並向左上方彎曲，完美配合母長臂猿攀握
        const vineMainGeo = new THREE.CylinderGeometry(0.14, 0.18, 3.0, 16);
        vineMainGeo.rotateZ(-0.42);
        vineMainGeo.rotateY(0.15);
        const vineMain = new THREE.Mesh(vineMainGeo, this.matGibbonBranch);
        vineMain.position.set(0.42, 1.05, -0.05);
        this.gibbonAdultPerch.add(vineMain);

        // 棲息橫杈：成猿安坐其上
        const forkGeo = new THREE.CylinderGeometry(0.16, 0.14, 1.6, 14);
        forkGeo.rotateX(Math.PI / 2.2);
        forkGeo.rotateZ(0.2);
        const forkMesh = new THREE.Mesh(forkGeo, this.matGibbonBranch);
        forkMesh.position.set(-0.05, 0.3, 0);
        this.gibbonAdultPerch.add(forkMesh);

        // 雨林翠綠寬葉
        const matJungleLeaf = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
        const leafGeoA = new THREE.SphereGeometry(0.16, 8, 8);
        leafGeoA.scale(1.5, 0.22, 0.7);
        const jLeaf1 = new THREE.Mesh(leafGeoA, matJungleLeaf);
        jLeaf1.position.set(0.75, 1.85, 0.05);
        jLeaf1.rotation.set(0.4, 0.6, 0.3);
        const jLeaf2 = new THREE.Mesh(leafGeoA, matJungleLeaf);
        jLeaf2.position.set(-0.45, 0.45, -0.15);
        jLeaf2.rotation.set(-0.2, -0.4, 0.5);
        this.gibbonAdultPerch.add(jLeaf1, jLeaf2);

        this.gibbonAdultGroup.add(this.gibbonAdultPerch);

        // 成猿身軀主群組
        this.gibbonAdultBody = new THREE.Group();
        this.gibbonAdultBody.position.set(0, 0.62, 0);
        this.gibbonAdultGroup.add(this.gibbonAdultBody);

        // 豐滿金黃暖杏色長毛身軀 (Golden-buff Torso)
        const aTorsoGeo = new THREE.SphereGeometry(0.4, 24, 20);
        aTorsoGeo.scale(0.96, 1.18, 0.92);
        const aTorso = new THREE.Mesh(aTorsoGeo, this.matGibbonGoldenFur);
        this.gibbonAdultBody.add(aTorso);

        // 成猿頭部 (Head Group)
        this.gibbonAdultHead = new THREE.Group();
        this.gibbonAdultHead.position.set(0, 0.44, 0.08);
        this.gibbonAdultBody.add(this.gibbonAdultHead);

        // 金黃毛頭顱
        const aHeadGeo = new THREE.SphereGeometry(0.25, 20, 18);
        aHeadGeo.scale(1.0, 0.96, 1.0);
        const aHead = new THREE.Mesh(aHeadGeo, this.matGibbonGoldenFur);
        this.gibbonAdultHead.add(aHead);

        // 金黃圓圓小耳朵 (Adult Ears)
        const aEarGeo = new THREE.SphereGeometry(0.065, 10, 10);
        aEarGeo.scale(0.55, 1.0, 0.8);
        const aEarL = new THREE.Mesh(aEarGeo, this.matGibbonGoldenFur);
        aEarL.position.set(-0.24, 0.02, -0.02);
        const aEarR = new THREE.Mesh(aEarGeo, this.matGibbonGoldenFur);
        aEarR.position.set(0.24, 0.02, -0.02);
        this.gibbonAdultHead.add(aEarL, aEarR);

        // 頭頂黑色毛冠中線 (Black Crown Patch - 參考圖中標誌性深黑頭冠！)
        const crownGeo = new THREE.BoxGeometry(0.09, 0.32, 0.28);
        const crown = new THREE.Mesh(crownGeo, this.matGibbonCrownPatch);
        crown.position.set(0, 0.14, 0.04);
        crown.rotation.x = -0.22;
        this.gibbonAdultHead.add(crown);

        // 面龐外緣白霜毛圈 (White Halo Fringe - 參考圖中面周白霜柔毛)
        const haloGeo = new THREE.TorusGeometry(0.22, 0.048, 10, 24);
        haloGeo.scale(1.0, 1.15, 0.6);
        const halo = new THREE.Mesh(haloGeo, this.matGibbonHaloWhite);
        halo.position.set(0, 0.02, 0.08);
        this.gibbonAdultHead.add(halo);

        // 純黑小巧面具臉 (Jet-black Face Disk)
        const aFaceGeo = new THREE.SphereGeometry(0.17, 18, 18);
        aFaceGeo.scale(0.86, 0.88, 0.46);
        const aFace = new THREE.Mesh(aFaceGeo, this.matGibbonFaceSkin);
        aFace.position.set(0, -0.02, 0.16);
        this.gibbonAdultHead.add(aFace);

        // 深邃靈慧靈長之眸 (Soulful Primate Eyes)
        const aEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 14), this.matGibbonEye);
        aEyeL.position.set(-0.075, 0.035, 0.23);
        const aEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 14), this.matGibbonEye);
        aEyeR.position.set(0.075, 0.035, 0.23);
        const aShineL = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
        aShineL.position.set(-0.085, 0.048, 0.255);
        const aShineR = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
        aShineR.position.set(0.085, 0.048, 0.255);
        this.gibbonAdultHead.add(aEyeL, aEyeR, aShineL, aShineR);

        // 小巧鼻子與嘴唇
        const noseGeo = new THREE.SphereGeometry(0.034, 10, 10);
        noseGeo.scale(1.2, 0.7, 0.8);
        const nose = new THREE.Mesh(noseGeo, this.matGibbonFaceSkin);
        nose.position.set(0, -0.02, 0.25);
        this.gibbonAdultHead.add(nose);

        // 標誌性神級超長手臂 (Super Long Arms for Brachiation)
        // 1. 右長臂 (高揚抓握右上側攀升的老藤樹幹 - 參考圖中經典攀藤姿態！)
        this.gibbonAdultArmR = new THREE.Group();
        this.gibbonAdultArmR.position.set(0.35, 0.28, 0);

        const upperArmRGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.76, 12);
        upperArmRGeo.rotateZ(-0.72);
        upperArmRGeo.rotateX(-0.15);
        const upperArmR = new THREE.Mesh(upperArmRGeo, this.matGibbonGoldenFur);
        upperArmR.position.set(0.28, 0.26, 0.05);
        this.gibbonAdultArmR.add(upperArmR);

        const foreArmRGeo = new THREE.CylinderGeometry(0.07, 0.058, 0.78, 12);
        foreArmRGeo.rotateZ(-0.48);
        const foreArmR = new THREE.Mesh(foreArmRGeo, this.matGibbonGoldenFur);
        foreArmR.position.set(0.55, 0.76, 0.06);
        this.gibbonAdultArmR.add(foreArmR);

        // 白毛手腕圈 (White wrist cuff)
        const wristCuffR = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.025, 8, 16), this.matGibbonHaloWhite);
        wristCuffR.position.set(0.72, 1.08, 0.06);
        this.gibbonAdultArmR.add(wristCuffR);

        // 纖長黑手牢牢抓握右上方老藤
        const handR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), this.matGibbonHands);
        handR.scale.set(0.7, 1.4, 0.8);
        handR.position.set(0.76, 1.15, 0.06);
        handR.rotation.z = 0.5;
        this.gibbonAdultArmR.add(handR);

        this.gibbonAdultBody.add(this.gibbonAdultArmR);

        // 2. 左長臂 (舒展拱起高揚／自然守護環抱姿態 - 參考圖中左臂高揚優雅彎曲姿勢！)
        this.gibbonAdultArmL = new THREE.Group();
        this.gibbonAdultArmL.position.set(-0.35, 0.28, 0);

        const upperArmLGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.76, 12);
        upperArmLGeo.rotateZ(0.88);
        upperArmLGeo.rotateX(-0.15);
        const upperArmL = new THREE.Mesh(upperArmLGeo, this.matGibbonGoldenFur);
        upperArmL.position.set(-0.28, 0.25, 0.05);
        this.gibbonAdultArmL.add(upperArmL);

        const foreArmLGeo = new THREE.CylinderGeometry(0.07, 0.058, 0.75, 12);
        foreArmLGeo.rotateZ(0.52);
        const foreArmL = new THREE.Mesh(foreArmLGeo, this.matGibbonGoldenFur);
        foreArmL.position.set(-0.52, 0.72, 0.08);
        this.gibbonAdultArmL.add(foreArmL);

        const wristCuffL = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.025, 8, 16), this.matGibbonHaloWhite);
        wristCuffL.position.set(-0.68, 1.0, 0.08);
        this.gibbonAdultArmL.add(wristCuffL);

        const handL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), this.matGibbonHands);
        handL.scale.set(0.7, 1.4, 0.8);
        handL.position.set(-0.72, 1.08, 0.08);
        handL.rotation.z = -0.5;
        this.gibbonAdultArmL.add(handL);

        this.gibbonAdultBody.add(this.gibbonAdultArmL);

        // 雙腿收攏蹲坐於樹杈 (Perching Legs)
        const thighGeo = new THREE.SphereGeometry(0.2, 14, 14);
        thighGeo.scale(0.85, 1.25, 0.9);
        const thighL = new THREE.Mesh(thighGeo, this.matGibbonGoldenFur);
        thighL.position.set(-0.25, -0.28, 0.12);
        const thighR = new THREE.Mesh(thighGeo, this.matGibbonGoldenFur);
        thighR.position.set(0.25, -0.28, 0.12);

        // 抓握老藤的黑手腳爪 (Gripping Ape Feet)
        const footGeo = new THREE.SphereGeometry(0.07, 10, 10);
        footGeo.scale(0.8, 0.6, 1.4);
        const footL = new THREE.Mesh(footGeo, this.matGibbonHands);
        footL.position.set(-0.22, -0.45, 0.2);
        const footR = new THREE.Mesh(footGeo, this.matGibbonHands);
        footR.position.set(0.22, -0.45, 0.2);

        this.gibbonAdultBody.add(thighL, thighR, footL, footR);
    }

    // 形態切換 (金毛幼崽 ↔ 林冠飛人)
    updateGibbonStage(stage) {
        this.gibbonStage = stage;
        const isBaby = (stage === 'baby');
        if (this.gibbonBabyGroup) this.gibbonBabyGroup.visible = isBaby;
        if (this.gibbonAdultGroup) this.gibbonAdultGroup.visible = !isBaby;
    }

    // 長臂猿樹冠臂行與靈動微表情動畫
    updateGibbon(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.gibbonStage === 'baby');

        if (isBaby) {
            // 幼猿：呆萌毛球微晃、高舉小長臂討抱抱！
            if (this.state === 'fist_bump' || this.currentState === 'fist_bump') {
                // 幼猿碰拳：小身軀探前，右長臂筆直伸向前方碰拳！
                this.gibbonBabyGroup.position.y = 0.04;
                this.gibbonBabyGroup.position.z = 0.28;
                this.gibbonBabyHead.rotation.x = -0.15;
                this.gibbonBabyHead.rotation.y = -0.1;
                this.gibbonBabyArmR.rotation.x = -1.35; // 筆直向前碰拳
                this.gibbonBabyArmR.rotation.y = -0.25;
                this.gibbonBabyArmR.rotation.z = 0.12;
                this.gibbonBabyArmL.rotation.z = -0.3;

            } else if (this.state === 'happy') {
                // 歡呼雀躍：上下蹦跳、雙手歡快拍打討抱抱
                this.gibbonBabyGroup.position.y = 0.12 + Math.sin(t * 8.0) * 0.08;
                this.gibbonBabyHead.rotation.z = Math.sin(t * 8.0) * 0.15;
                this.gibbonBabyArmR.rotation.z = 0.35 + Math.sin(t * 8.0) * 0.45;
                this.gibbonBabyArmL.rotation.z = -0.35 - Math.sin(t * 8.0) * 0.45;

            } else if (this.state === 'sleeping') {
                // 蜷縮入眠：小毛球縮在樹杈間
                this.gibbonBabyGroup.position.y = 0;
                this.gibbonBabyHead.rotation.x = 0.22;
                this.gibbonBabyHead.rotation.y = 0;
                this.gibbonBabyArmR.rotation.z = -0.3;
                this.gibbonBabyArmL.rotation.z = 0.2;

            } else {
                // 待機：身軀輕輕隨微風搖曳、右小手高揚伸展討抱抱
                this.gibbonBabyGroup.position.y = Math.sin(t * 2.2) * 0.03;
                this.gibbonBabyBody.rotation.z = Math.sin(t * 2.2) * 0.06;
                this.gibbonBabyHead.rotation.y = Math.sin(t * 1.4) * 0.22;
                this.gibbonBabyHead.rotation.x = Math.sin(t * 2.0) * 0.05;
                this.gibbonBabyArmR.rotation.z = 0.15 + Math.sin(t * 2.8) * 0.22;
                this.gibbonBabyArmL.rotation.z = Math.sin(t * 2.2) * 0.08;
            }

        } else {
            // 成體：威武舒展、林冠臂行大師高空盪蕩與天籟啼鳴
            if (this.state === 'fist_bump' || this.currentState === 'fist_bump') {
                // 成體長臂猿碰拳：霸氣前傾，超長右臂向前筆直伸向手套！
                this.gibbonAdultGroup.position.y = 0.06;
                this.gibbonAdultGroup.position.z = 0.35;
                this.gibbonAdultHead.rotation.x = -0.18;
                this.gibbonAdultHead.rotation.y = -0.08;
                this.gibbonAdultArmR.rotation.x = -1.45; // 筆直向前碰拳
                this.gibbonAdultArmR.rotation.y = -0.22;
                this.gibbonAdultArmR.rotation.z = 0.15;
                this.gibbonAdultArmL.rotation.z = -0.25;

            } else if (this.state === 'happy') {
                // 引吭高歌 & 臂行大盪躍！
                this.gibbonAdultGroup.position.y = 0.16 + Math.sin(t * 4.5) * 0.14;
                this.gibbonAdultBody.rotation.z = Math.sin(t * 4.5) * 0.18;
                // 頭仰起發出啼鳴
                this.gibbonAdultHead.rotation.x = -0.28 + Math.sin(t * 4.5) * 0.15;
                this.gibbonAdultHead.rotation.y = Math.sin(t * 2.5) * 0.2;
                // 右臂高空暢快揮舞
                this.gibbonAdultArmR.rotation.z = 0.45 + Math.sin(t * 5.5) * 0.45;
                this.gibbonAdultArmL.rotation.z = -0.15 + Math.sin(t * 4.5) * 0.15;

            } else if (this.state === 'sleeping') {
                // 樹冠棲息入眠
                this.gibbonAdultGroup.position.y = 0;
                this.gibbonAdultHead.rotation.x = 0.18;
                this.gibbonAdultHead.rotation.y = 0.08;
                this.gibbonAdultArmR.rotation.z = -0.25;
                this.gibbonAdultArmL.rotation.z = -0.05;

            } else {
                // 待機：左手穩抓老藤、身軀在空中優雅搖盪、右手瀟灑舒展
                this.gibbonAdultGroup.position.y = Math.sin(t * 2.0) * 0.04;
                this.gibbonAdultBody.rotation.z = Math.sin(t * 2.0) * 0.08;
                this.gibbonAdultHead.rotation.y = Math.sin(t * 1.0) * 0.28;
                this.gibbonAdultHead.rotation.x = Math.sin(t * 1.6) * 0.05;

                // 左臂隨老藤拉伸微動
                this.gibbonAdultArmL.rotation.z = -0.05 + Math.sin(t * 2.0) * 0.08;
                // 右臂悠然在微風中擺動
                this.gibbonAdultArmR.rotation.z = 0.2 + Math.sin(t * 1.8) * 0.2;
            }
        }
    }

    // =========================================================================
    // 🍊 水豚（佛系溫泉水豚君 Capybara）3D 雙形態模型系統
    // 1. 軟糯小水豚崽：圓滾滾焦糖栗棕小土豆、呆萌方吻部、半瞇佛系豆豆眼、頭頂頂著一顆小蜜柑 🍊
    // 2. 溫泉佛系水豚大王：泡在熱氣騰騰的日式檜木柚子溫泉桶裡、頭頂雙層蜜柑塔、水面漂浮金黃柚子
    // =========================================================================
    buildCapybaraMesh() {
        this.capybaraRoot = new THREE.Group();
        this.capybaraRoot.name = 'CapybaraRoot';
        this.root.add(this.capybaraRoot);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.capybaraRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        this.capybaraGroup = new THREE.Group();
        this.capybaraRoot.add(this.capybaraGroup);
        this.capybaraStage = 'baby';

        this.buildCapybaraBabyMesh();
        this.buildCapybaraAdultMesh();
        this.updateCapybaraStage('baby');
    }

    createOrangeProp(scale = 1.0) {
        const g = new THREE.Group();
        const bodyGeo = new THREE.SphereGeometry(0.11 * scale, 16, 14);
        bodyGeo.scale(1.12, 0.86, 1.12);
        const body = new THREE.Mesh(bodyGeo, this.matCapybaraOrange);
        body.castShadow = true;
        g.add(body);

        const leafGeo = new THREE.SphereGeometry(0.04 * scale, 8, 8);
        leafGeo.scale(1.6, 0.25, 0.7);
        const leaf = new THREE.Mesh(leafGeo, this.matCapybaraLeaf);
        leaf.position.set(0.03 * scale, 0.095 * scale, 0);
        leaf.rotation.z = -0.35;
        g.add(leaf);
        return g;
    }

    buildCapybaraBabyMesh() {
        this.capybaraBabyGroup = new THREE.Group();
        this.capybaraBabyGroup.position.set(0, 0.42, 0);
        this.capybaraGroup.add(this.capybaraBabyGroup);

        // 圓滾滾奇異果土豆身軀
        const torsoGeo = new THREE.SphereGeometry(0.38, 22, 18);
        torsoGeo.scale(0.95, 0.88, 1.32);
        const torso = new THREE.Mesh(torsoGeo, this.matCapybaraBabyFur);
        torso.castShadow = true;
        this.capybaraBabyGroup.add(torso);

        // 呆萌方形大頭與鈍方吻部
        this.capybaraBabyHead = new THREE.Group();
        this.capybaraBabyHead.name = 'CapybaraBabyHead';
        this.capybaraBabyHead.position.set(0, 0.22, 0.36);
        this.capybaraBabyGroup.add(this.capybaraBabyHead);

        const headGeo = new THREE.SphereGeometry(0.28, 20, 18);
        headGeo.scale(0.92, 0.95, 1.18);
        const headMesh = new THREE.Mesh(headGeo, this.matCapybaraBabyFur);
        headMesh.castShadow = true;
        this.capybaraBabyHead.add(headMesh);

        // 標誌性深褐方形鈍吻 (Blunt Rectangular Snout)
        const snoutGeo = new THREE.BoxGeometry(0.28, 0.26, 0.24);
        const snout = new THREE.Mesh(snoutGeo, this.matCapybaraMuzzle);
        snout.position.set(0, -0.02, 0.22);
        this.capybaraBabyHead.add(snout);

        const snoutRound = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), this.matCapybaraMuzzle);
        snoutRound.scale.set(1.0, 0.9, 0.7);
        snoutRound.position.set(0, -0.02, 0.31);
        this.capybaraBabyHead.add(snoutRound);

        // 鼻孔與人中線
        const nostrilL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), this.matNose);
        nostrilL.position.set(-0.06, 0.04, 0.38);
        const nostrilR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), this.matNose);
        nostrilR.position.set(0.06, 0.04, 0.38);
        this.capybaraBabyHead.add(nostrilL, nostrilR);

        // 佛系半瞇溫和豆豆眼 (Zen Half-Closed Eyes)
        const eyeGeo = new THREE.SphereGeometry(0.042, 12, 12);
        eyeGeo.scale(1.2, 0.65, 0.8);
        const eyeL = new THREE.Mesh(eyeGeo, this.matNose);
        eyeL.position.set(-0.21, 0.08, 0.12);
        const eyeR = new THREE.Mesh(eyeGeo, this.matNose);
        eyeR.position.set(0.21, 0.08, 0.12);
        const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
        shineL.position.set(-0.23, 0.09, 0.15);
        const shineR = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
        shineR.position.set(0.23, 0.09, 0.15);
        this.capybaraBabyHead.add(eyeL, eyeR, shineL, shineR);

        // 圓圓小巧貼頭耳
        const earGeo = new THREE.SphereGeometry(0.075, 10, 10);
        earGeo.scale(0.5, 1.0, 0.8);
        this.capybaraBabyEarL = new THREE.Mesh(earGeo, this.matCapybaraMuzzle);
        this.capybaraBabyEarL.name = 'CapybaraEarL';
        this.capybaraBabyEarL.position.set(-0.2, 0.24, -0.06);
        this.capybaraBabyEarR = new THREE.Mesh(earGeo, this.matCapybaraMuzzle);
        this.capybaraBabyEarR.name = 'CapybaraEarR';
        this.capybaraBabyEarR.position.set(0.2, 0.24, -0.06);
        this.capybaraBabyHead.add(this.capybaraBabyEarL, this.capybaraBabyEarR);

        // 頭頂招牌小橘子 🍊
        this.capybaraBabyOrange = this.createOrangeProp(0.95);
        this.capybaraBabyOrange.position.set(0, 0.31, 0.04);
        this.capybaraBabyHead.add(this.capybaraBabyOrange);

        // 四條小短腿
        this.capybaraBabyLegs = {};
        const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.28, 12);
        [
            ['frontLeft', -0.18, -0.18, 0.25],
            ['frontRight', 0.18, -0.18, 0.25],
            ['backLeft', -0.19, -0.18, -0.25],
            ['backRight', 0.19, -0.18, -0.25]
        ].forEach(([k, x, y, z]) => {
            const p = new THREE.Group();
            p.position.set(x, y, z);
            const m = new THREE.Mesh(legGeo, this.matCapybaraMuzzle);
            m.position.y = -0.1;
            m.castShadow = true;
            p.add(m);
            this.capybaraBabyGroup.add(p);
            this.capybaraBabyLegs[k] = p;
        });
    }

    buildCapybaraAdultMesh() {
        this.capybaraAdultGroup = new THREE.Group();
        this.capybaraAdultGroup.position.set(0, 0, 0);
        this.capybaraGroup.add(this.capybaraAdultGroup);

        // 1. 日式檜木柚子溫泉桶 (Hinoki Yuzu Hot Spring Tub)
        this.capybaraTubGroup = new THREE.Group();
        this.capybaraAdultGroup.add(this.capybaraTubGroup);

        const tubWallGeo = new THREE.CylinderGeometry(0.88, 0.78, 0.56, 28);
        const tubWall = new THREE.Mesh(tubWallGeo, this.matCapybaraTub);
        tubWall.position.y = 0.28;
        tubWall.castShadow = true;
        tubWall.receiveShadow = true;
        this.capybaraTubGroup.add(tubWall);

        // 桶箍黑鐵環
        const hoopMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.6, roughness: 0.35 });
        const hoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.022, 8, 32), hoopMat);
        hoop1.rotation.x = Math.PI / 2;
        hoop1.position.y = 0.42;
        const hoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.81, 0.022, 8, 32), hoopMat);
        hoop2.rotation.x = Math.PI / 2;
        hoop2.position.y = 0.16;
        this.capybaraTubGroup.add(hoop1, hoop2);

        // 溫暖溫泉水面与漂浮柚子
        this.capybaraWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.05, 28), this.matCapybaraWater);
        this.capybaraWaterMesh.position.y = 0.54;
        this.capybaraTubGroup.add(this.capybaraWaterMesh);

        // 水面漂浮的 3 顆金黃柚子
        this.floatingYuzus = [];
        [
            [-0.48, 0.56, 0.32],
            [0.52, 0.56, 0.22],
            [-0.35, 0.56, -0.45]
        ].forEach(([ux, uy, uz]) => {
            const yuzu = this.createOrangeProp(0.75);
            yuzu.position.set(ux, uy, uz);
            this.capybaraTubGroup.add(yuzu);
            this.floatingYuzus.push(yuzu);
        });

        // 2. 泡在溫泉裡享受的成年水豚大王
        this.capybaraAdultBody = new THREE.Group();
        this.capybaraAdultBody.position.set(0, 0.52, 0);
        this.capybaraAdultGroup.add(this.capybaraAdultBody);

        const aTorsoGeo = new THREE.SphereGeometry(0.52, 24, 20);
        aTorsoGeo.scale(1.02, 0.85, 1.25);
        const aTorso = new THREE.Mesh(aTorsoGeo, this.matCapybaraFur);
        aTorso.position.set(0, -0.05, -0.06);
        aTorso.castShadow = true;
        this.capybaraAdultBody.add(aTorso);

        // 搭在木桶邊緣的兩隻小前爪
        const pawGeo = new THREE.SphereGeometry(0.11, 12, 12);
        pawGeo.scale(0.85, 0.55, 1.35);
        const pawL = new THREE.Mesh(pawGeo, this.matCapybaraMuzzle);
        pawL.position.set(-0.28, 0.06, 0.68);
        const pawR = new THREE.Mesh(pawGeo, this.matCapybaraMuzzle);
        pawR.position.set(0.28, 0.06, 0.68);
        this.capybaraAdultBody.add(pawL, pawR);

        // 成年水豚佛系大頭
        this.capybaraAdultHead = new THREE.Group();
        this.capybaraAdultHead.name = 'CapybaraAdultHead';
        this.capybaraAdultHead.position.set(0, 0.34, 0.36);
        this.capybaraAdultBody.add(this.capybaraAdultHead);

        const aHeadGeo = new THREE.SphereGeometry(0.36, 22, 18);
        aHeadGeo.scale(0.95, 0.96, 1.22);
        const aHead = new THREE.Mesh(aHeadGeo, this.matCapybaraFur);
        aHead.castShadow = true;
        this.capybaraAdultHead.add(aHead);

        const aSnout = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.30), this.matCapybaraMuzzle);
        aSnout.position.set(0, -0.02, 0.28);
        this.capybaraAdultHead.add(aSnout);

        // 舒服享受的瞇瞇眼弧線
        const zenEyeGeo = new THREE.BoxGeometry(0.08, 0.022, 0.09);
        const aEyeL = new THREE.Mesh(zenEyeGeo, this.matNose);
        aEyeL.position.set(-0.28, 0.1, 0.14);
        const aEyeR = new THREE.Mesh(zenEyeGeo, this.matNose);
        aEyeR.position.set(0.28, 0.1, 0.14);
        this.capybaraAdultHead.add(aEyeL, aEyeR);

        // 圓耳
        const aEarGeo = new THREE.SphereGeometry(0.09, 10, 10);
        aEarGeo.scale(0.5, 1.0, 0.8);
        const aEarL = new THREE.Mesh(aEarGeo, this.matCapybaraMuzzle);
        aEarL.name = 'CapybaraAdultEarL';
        aEarL.position.set(-0.26, 0.3, -0.08);
        const aEarR = new THREE.Mesh(aEarGeo, this.matCapybaraMuzzle);
        aEarR.name = 'CapybaraAdultEarR';
        aEarR.position.set(0.26, 0.3, -0.08);
        this.capybaraAdultHead.add(aEarL, aEarR);

        // 頭頂雙層蜜柑橘子塔 🍊🍊
        this.capybaraAdultOrangeTower = new THREE.Group();
        this.capybaraAdultOrangeTower.position.set(0, 0.38, 0.05);
        const orangeBottom = this.createOrangeProp(1.15);
        const orangeTop = this.createOrangeProp(0.82);
        orangeTop.position.set(0, 0.17, 0);
        this.capybaraAdultOrangeTower.add(orangeBottom, orangeTop);
        this.capybaraAdultHead.add(this.capybaraAdultOrangeTower);
    }

    updateCapybaraStage(stage) {
        this.capybaraStage = stage;
        const isBaby = (stage === 'baby');
        if (this.capybaraBabyGroup) this.capybaraBabyGroup.visible = isBaby;
        if (this.capybaraAdultGroup) this.capybaraAdultGroup.visible = !isBaby;
    }

    updateCapybara(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.capybaraStage === 'baby');

        if (isBaby) {
            this.updateCanineAutonomy(delta, elapsedTime);
            const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
            const isWalking = (this.autonomy && this.autonomy.state === 'walking' && this.currentState === 'idle');

            if (this.currentState === 'happy') {
                this.capybaraBabyGroup.position.y = 0.42 + Math.abs(Math.sin(t * 7)) * 0.14;
                this.capybaraBabyHead.rotation.z = Math.sin(t * 7) * 0.12;
                this.capybaraBabyOrange.position.y = 0.31 + Math.abs(Math.sin(t * 14)) * 0.08;
            } else if (this.currentState === 'eat') {
                this.capybaraBabyHead.rotation.x = 0.25 + Math.sin(t * 14) * 0.08;
            } else if (this.currentState === 'sad') {
                this.capybaraBabyHead.rotation.x = 0.28;
                this.capybaraBabyHead.rotation.z = Math.sin(t * 4) * 0.08;
            } else if (this.currentState === 'sleep') {
                this.capybaraBabyGroup.position.y = 0.26;
                this.capybaraBabyHead.rotation.x = 0.18;
            } else if (isWalking) {
                const wc = this.autonomy.walkCycle;
                this.capybaraBabyGroup.position.y = 0.42 + Math.abs(Math.sin(wc * 2)) * 0.03;
                this.capybaraBabyLegs.frontLeft.rotation.x = Math.sin(wc) * 0.38;
                this.capybaraBabyLegs.frontRight.rotation.x = -Math.sin(wc) * 0.38;
                this.capybaraBabyLegs.backLeft.rotation.x = -Math.sin(wc) * 0.38;
                this.capybaraBabyLegs.backRight.rotation.x = Math.sin(wc) * 0.38;
                this.capybaraBabyHead.rotation.set(Math.sin(wc * 2) * 0.03, 0, 0);
            } else {
                this.capybaraBabyGroup.position.y = THREE.MathUtils.lerp(0.42, 0.26, lf) + Math.sin(t * 2.0) * 0.012;
                this.capybaraBabyHead.rotation.y = Math.sin(t * 0.9) * 0.12;
                this.capybaraBabyHead.rotation.x = Math.sin(t * 1.5) * 0.04;
                this.capybaraBabyHead.rotation.z = 0;
                this.capybaraBabyOrange.rotation.y = t * 0.5;
            }
        } else {
            // 成體溫泉水豚：悠然泡湯、水面柚子漂浮、頭頂橘子塔微晃
            this.group.position.x = 0;
            this.group.position.z = 0;
            if (this.floatingYuzus) {
                this.floatingYuzus.forEach((yuzu, idx) => {
                    yuzu.position.y = 0.56 + Math.sin(t * 2.2 + idx * 1.5) * 0.018;
                    yuzu.rotation.z = Math.sin(t * 1.8 + idx) * 0.1;
                });
            }
            if (this.currentState === 'happy') {
                this.capybaraAdultBody.position.y = 0.52 + Math.sin(t * 6.0) * 0.06;
                this.capybaraAdultHead.rotation.z = Math.sin(t * 6.0) * 0.1;
                this.capybaraAdultOrangeTower.position.y = 0.38 + Math.abs(Math.sin(t * 12.0)) * 0.09;
            } else if (this.currentState === 'eat') {
                this.capybaraAdultHead.rotation.x = 0.18 + Math.sin(t * 12.0) * 0.07;
            } else if (this.currentState === 'sad') {
                this.capybaraAdultHead.rotation.x = 0.22;
            } else {
                this.capybaraAdultBody.position.y = 0.52 + Math.sin(t * 1.6) * 0.018;
                this.capybaraAdultHead.rotation.y = Math.sin(t * 0.8) * 0.14;
                this.capybaraAdultHead.rotation.x = -0.06 + Math.sin(t * 1.4) * 0.03;
                this.capybaraAdultHead.rotation.z = Math.sin(t * 1.1) * 0.03;
                this.capybaraAdultOrangeTower.position.y = 0.38;
            }
        }
    }

    // =========================================================================
    // 🎋 小熊貓 / 紅熊貓（喜馬拉雅火狐 Red Panda）3D 雙形態模型系統
    // 1. 毛茸茸小火狐幼崽：暖紅棕圓身、白眉白頰面具、九節蓬鬆環紋大尾巴
    // 2. 竹林威嚇大師紅熊貓：翠綠竹林棲地，開心或玩耍時會「雙腳站立高舉雙手裝兇賣萌」！
    // =========================================================================
    buildRedPandaMesh() {
        this.redPandaRoot = new THREE.Group();
        this.redPandaRoot.name = 'RedPandaRoot';
        this.root.add(this.redPandaRoot);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.redPandaRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        this.redPandaGroup = new THREE.Group();
        this.redPandaRoot.add(this.redPandaGroup);
        this.redPandaStage = 'baby';

        this.buildRedPandaBabyMesh();
        this.buildRedPandaAdultMesh();
        this.updateRedPandaStage('baby');
    }

    createRingedTail(scale = 1.0) {
        const tailGroup = new THREE.Group();
        for (let i = 0; i < 7; i++) {
            const segGeo = new THREE.SphereGeometry((0.16 - i * 0.01) * scale, 14, 12);
            segGeo.scale(1.0, 0.95, 1.35);
            const mat = (i % 2 === 0) ? this.matRedPandaCoat : this.matRedPandaRing;
            const seg = new THREE.Mesh(segGeo, mat);
            seg.position.set(0, -i * 0.03 * scale, -i * 0.12 * scale);
            seg.castShadow = true;
            tailGroup.add(seg);
        }
        return tailGroup;
    }

    buildRedPandaBabyMesh() {
        this.redPandaBabyGroup = new THREE.Group();
        this.redPandaBabyGroup.position.set(0, 0.44, 0);
        this.redPandaGroup.add(this.redPandaBabyGroup);

        // 圓滾滾紅棕幼崽身軀
        const torsoGeo = new THREE.SphereGeometry(0.34, 20, 18);
        torsoGeo.scale(0.95, 0.92, 1.25);
        const torso = new THREE.Mesh(torsoGeo, this.matRedPandaCoat);
        torso.castShadow = true;
        this.redPandaBabyGroup.add(torso);

        // 黑色小肚皮
        const bellyGeo = new THREE.SphereGeometry(0.30, 16, 16);
        bellyGeo.scale(0.88, 0.75, 1.15);
        const belly = new THREE.Mesh(bellyGeo, this.matRedPandaDark);
        belly.position.set(0, -0.07, 0);
        this.redPandaBabyGroup.add(belly);

        // 幼崽大圓頭與白頰面具
        this.redPandaBabyHead = new THREE.Group();
        this.redPandaBabyHead.name = 'RedPandaBabyHead';
        this.redPandaBabyHead.position.set(0, 0.24, 0.34);
        this.redPandaBabyGroup.add(this.redPandaBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 18), this.matRedPandaCoat);
        headMesh.scale.set(1.08, 0.96, 0.98);
        headMesh.castShadow = true;
        this.redPandaBabyHead.add(headMesh);

        // 標誌性雪白臉頰與白眉斑
        const cheekGeo = new THREE.SphereGeometry(0.15, 14, 14);
        cheekGeo.scale(1.0, 0.85, 0.65);
        const cheekL = new THREE.Mesh(cheekGeo, this.matRedPandaWhite);
        cheekL.position.set(-0.18, -0.04, 0.20);
        const cheekR = new THREE.Mesh(cheekGeo, this.matRedPandaWhite);
        cheekR.position.set(0.18, -0.04, 0.20);
        const browL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.matRedPandaWhite);
        browL.position.set(-0.10, 0.14, 0.24);
        const browR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.matRedPandaWhite);
        browR.position.set(0.10, 0.14, 0.24);
        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.matRedPandaWhite);
        muzzle.scale.set(1.1, 0.85, 1.0);
        muzzle.position.set(0, -0.05, 0.25);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), this.matNose);
        nose.position.set(0, -0.02, 0.34);
        this.redPandaBabyHead.add(cheekL, cheekR, browL, browR, muzzle, nose);

        // 水汪汪黑曜石大圓眼
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), this.matNose);
        eyeL.position.set(-0.11, 0.05, 0.26);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), this.matNose);
        eyeR.position.set(0.11, 0.05, 0.26);
        const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), this.matShine);
        shineL.position.set(-0.125, 0.068, 0.305);
        const shineR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), this.matShine);
        shineR.position.set(0.125, 0.068, 0.305);
        this.redPandaBabyHead.add(eyeL, eyeR, shineL, shineR);

        // 白邊毛茸茸三角圓耳
        const createPandaEar = (isLeft) => {
            const g = new THREE.Group();
            g.name = isLeft ? 'RedPandaEarL' : 'RedPandaEarR';
            const sign = isLeft ? -1 : 1;
            g.position.set(sign * 0.24, 0.22, 0.02);
            g.rotation.z = -sign * 0.35;
            const outer = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 12), this.matRedPandaWhite);
            outer.scale.set(1.0, 1.0, 0.45);
            const inner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 10), this.matRedPandaDark);
            inner.scale.set(1.0, 1.0, 0.45);
            inner.position.set(0, -0.02, 0.02);
            g.add(outer, inner);
            return g;
        };
        this.redPandaBabyHead.add(createPandaEar(true), createPandaEar(false));

        // 黑色毛絨小短腿
        this.redPandaBabyLegs = {};
        const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.28, 12);
        [
            ['frontLeft', -0.17, -0.16, 0.22],
            ['frontRight', 0.17, -0.16, 0.22],
            ['backLeft', -0.18, -0.16, -0.22],
            ['backRight', 0.18, -0.16, -0.22]
        ].forEach(([k, x, y, z]) => {
            const p = new THREE.Group();
            p.position.set(x, y, z);
            const m = new THREE.Mesh(legGeo, this.matRedPandaDark);
            m.position.y = -0.12;
            m.castShadow = true;
            p.add(m);
            this.redPandaBabyGroup.add(p);
            this.redPandaBabyLegs[k] = p;
        });

        // 招牌九節環紋大蓬尾
        this.redPandaBabyTail = this.createRingedTail(0.95);
        this.redPandaBabyTail.position.set(0, -0.02, -0.36);
        this.redPandaBabyGroup.add(this.redPandaBabyTail);
    }

    buildRedPandaAdultMesh() {
        this.redPandaAdultGroup = new THREE.Group();
        this.redPandaAdultGroup.position.set(0, 0, 0);
        this.redPandaGroup.add(this.redPandaAdultGroup);

        // 翠綠孟宗竹林背景裝飾
        this.bambooDecor = new THREE.Group();
        [[-0.65, -0.35], [0.68, -0.30], [-0.52, -0.55]].forEach(([bx, bz], idx) => {
            const h = 1.35 + idx * 0.2;
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, h, 12), this.matBambooStalk);
            stalk.position.set(bx, h * 0.5, bz);
            stalk.castShadow = true;
            this.bambooDecor.add(stalk);
        });
        this.redPandaAdultGroup.add(this.bambooDecor);

        // 成體主樞軸 (可切換四足站立 vs 雙足直立舉手威嚇賣萌！)
        this.redPandaAdultPivot = new THREE.Group();
        this.redPandaAdultPivot.position.set(0, 0.52, 0);
        this.redPandaAdultGroup.add(this.redPandaAdultPivot);

        const torsoGeo = new THREE.SphereGeometry(0.38, 22, 18);
        torsoGeo.scale(0.95, 0.92, 1.35);
        const torso = new THREE.Mesh(torsoGeo, this.matRedPandaCoat);
        torso.castShadow = true;
        this.redPandaAdultPivot.add(torso);

        const bellyGeo = new THREE.SphereGeometry(0.35, 18, 16);
        bellyGeo.scale(0.90, 0.80, 1.25);
        const belly = new THREE.Mesh(bellyGeo, this.matRedPandaDark);
        belly.position.set(0, -0.06, 0);
        this.redPandaAdultPivot.add(belly);

        // 成體頭部
        this.redPandaAdultHead = new THREE.Group();
        this.redPandaAdultHead.name = 'RedPandaAdultHead';
        this.redPandaAdultHead.position.set(0, 0.28, 0.42);
        this.redPandaAdultPivot.add(this.redPandaAdultHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.33, 20, 18), this.matRedPandaCoat);
        headMesh.scale.set(1.1, 0.96, 0.98);
        headMesh.castShadow = true;
        this.redPandaAdultHead.add(headMesh);

        const cheekGeo = new THREE.SphereGeometry(0.17, 14, 14);
        cheekGeo.scale(1.05, 0.85, 0.65);
        const cheekL = new THREE.Mesh(cheekGeo, this.matRedPandaWhite);
        cheekL.position.set(-0.20, -0.04, 0.22);
        const cheekR = new THREE.Mesh(cheekGeo, this.matRedPandaWhite);
        cheekR.position.set(0.20, -0.04, 0.22);
        const browL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matRedPandaWhite);
        browL.position.set(-0.11, 0.15, 0.26);
        const browR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matRedPandaWhite);
        browR.position.set(0.11, 0.15, 0.26);
        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), this.matRedPandaWhite);
        muzzle.scale.set(1.1, 0.85, 1.0);
        muzzle.position.set(0, -0.05, 0.27);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.matNose);
        nose.position.set(0, -0.02, 0.37);
        this.redPandaAdultHead.add(cheekL, cheekR, browL, browR, muzzle, nose);

        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 14), this.matNose);
        eyeL.position.set(-0.12, 0.05, 0.28);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 14), this.matNose);
        eyeR.position.set(0.12, 0.05, 0.28);
        const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), this.matShine);
        shineL.position.set(-0.135, 0.07, 0.33);
        const shineR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), this.matShine);
        shineR.position.set(0.135, 0.07, 0.33);
        this.redPandaAdultHead.add(eyeL, eyeR, shineL, shineR);

        [-1, 1].forEach(sign => {
            const g = new THREE.Group();
            g.name = sign < 0 ? 'RedPandaAdultEarL' : 'RedPandaAdultEarR';
            g.position.set(sign * 0.27, 0.24, 0.02);
            g.rotation.z = -sign * 0.35;
            const outer = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.28, 12), this.matRedPandaWhite);
            outer.scale.set(1.0, 1.0, 0.45);
            const inner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 10), this.matRedPandaDark);
            inner.scale.set(1.0, 1.0, 0.45);
            inner.position.set(0, -0.02, 0.02);
            g.add(outer, inner);
            this.redPandaAdultHead.add(g);
        });

        // 成體四肢 (前肢可高舉做出招牌「站立威嚇賣萌」動作！)
        this.redPandaAdultLegs = {};
        const limbGeo = new THREE.CylinderGeometry(0.095, 0.085, 0.36, 12);
        const pawPadMat = new THREE.MeshStandardMaterial({ color: 0xfef2f2, roughness: 0.7 });
        [
            ['frontLeft', -0.22, -0.12, 0.28],
            ['frontRight', 0.22, -0.12, 0.28],
            ['backLeft', -0.22, -0.16, -0.28],
            ['backRight', 0.22, -0.16, -0.28]
        ].forEach(([k, x, y, z]) => {
            const p = new THREE.Group();
            p.position.set(x, y, z);
            const m = new THREE.Mesh(limbGeo, this.matRedPandaDark);
            m.position.y = -0.16;
            m.castShadow = true;
            p.add(m);
            const pad = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), pawPadMat);
            pad.position.set(0, -0.33, 0.04);
            p.add(pad);
            this.redPandaAdultPivot.add(p);
            this.redPandaAdultLegs[k] = p;
        });

        // 超大蓬鬆九節環紋尾
        this.redPandaAdultTail = this.createRingedTail(1.18);
        this.redPandaAdultTail.position.set(0, -0.04, -0.45);
        this.redPandaAdultPivot.add(this.redPandaAdultTail);
    }

    updateRedPandaStage(stage) {
        this.redPandaStage = stage;
        const isBaby = (stage === 'baby');
        if (this.redPandaBabyGroup) this.redPandaBabyGroup.visible = isBaby;
        if (this.redPandaAdultGroup) this.redPandaAdultGroup.visible = !isBaby;
    }

    updateRedPanda(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.redPandaStage === 'baby');

        if (isBaby) {
            this.updateCanineAutonomy(delta, elapsedTime);
            const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
            const isWalking = (this.autonomy && this.autonomy.state === 'walking' && this.currentState === 'idle');
            this.redPandaBabyTail.rotation.y = Math.sin(t * 4.5) * 0.35;

            if (this.currentState === 'happy' || this.currentState === 'stand_cute') {
                this.redPandaBabyGroup.position.y = 0.48 + Math.abs(Math.sin(t * 8)) * 0.14;
                this.redPandaBabyHead.rotation.z = Math.sin(t * 8) * 0.16;
                this.redPandaBabyLegs.frontLeft.rotation.x = -2.1;
                this.redPandaBabyLegs.frontRight.rotation.x = -2.1;
            } else if (this.currentState === 'eat') {
                this.redPandaBabyHead.rotation.x = 0.25 + Math.sin(t * 14) * 0.08;
            } else if (isWalking) {
                const wc = this.autonomy.walkCycle;
                this.redPandaBabyGroup.position.y = 0.44 + Math.abs(Math.sin(wc * 2)) * 0.035;
                this.redPandaBabyLegs.frontLeft.rotation.x = Math.sin(wc) * 0.42;
                this.redPandaBabyLegs.frontRight.rotation.x = -Math.sin(wc) * 0.42;
                this.redPandaBabyLegs.backLeft.rotation.x = -Math.sin(wc) * 0.42;
                this.redPandaBabyLegs.backRight.rotation.x = Math.sin(wc) * 0.42;
            } else {
                this.redPandaBabyGroup.position.y = THREE.MathUtils.lerp(0.44, 0.28, lf) + Math.sin(t * 2.2) * 0.015;
                this.redPandaBabyLegs.frontLeft.rotation.x = -0.35 * lf;
                this.redPandaBabyLegs.frontRight.rotation.x = -0.35 * lf;
                this.redPandaBabyHead.rotation.y = Math.sin(t * 1.2) * 0.15;
                this.redPandaBabyHead.rotation.z = Math.sin(t * 1.6) * 0.06;
            }
        } else {
            // 成體紅熊貓：開心或玩遊戲時展示經典「雙足站立高舉雙手威嚇賣萌」！
            const isStanding = (this.currentState === 'happy' || this.currentState === 'stand_cute' || this.currentState === 'paw');
            this.redPandaAdultTail.rotation.y = Math.sin(t * (isStanding ? 8 : 3.5)) * 0.35;

            if (isStanding) {
                this.redPandaAdultPivot.position.y = 0.72 + Math.abs(Math.sin(t * 6.5)) * 0.06;
                this.redPandaAdultPivot.rotation.x = -1.18; // 身軀直立！
                this.redPandaAdultHead.rotation.x = 1.05;   // 頭部朝前看玩家
                this.redPandaAdultHead.rotation.z = Math.sin(t * 6.5) * 0.16;
                // 雙臂高舉向兩側張開搖晃裝兇！
                this.redPandaAdultLegs.frontLeft.rotation.x = -1.65;
                this.redPandaAdultLegs.frontLeft.rotation.z = 0.55 + Math.sin(t * 8) * 0.22;
                this.redPandaAdultLegs.frontRight.rotation.x = -1.65;
                this.redPandaAdultLegs.frontRight.rotation.z = -0.55 - Math.sin(t * 8) * 0.22;
                this.redPandaAdultLegs.backLeft.rotation.x = 1.18;
                this.redPandaAdultLegs.backRight.rotation.x = 1.18;
            } else {
                this.redPandaAdultPivot.position.y = 0.52 + Math.sin(t * 2.0) * 0.018;
                this.redPandaAdultPivot.rotation.x = 0;
                this.redPandaAdultHead.rotation.x = Math.sin(t * 1.5) * 0.05;
                this.redPandaAdultHead.rotation.y = Math.sin(t * 1.1) * 0.18;
                this.redPandaAdultHead.rotation.z = Math.sin(t * 1.4) * 0.05;
                this.redPandaAdultLegs.frontLeft.rotation.set(0, 0, 0);
                this.redPandaAdultLegs.frontRight.rotation.set(0, 0, 0);
                this.redPandaAdultLegs.backLeft.rotation.set(0, 0, 0);
                this.redPandaAdultLegs.backRight.rotation.set(0, 0, 0);
            }
        }
    }

    // =========================================================================
    // ❄️ 雪豹（喜馬拉雅雪山之王・咬尾巴大貓 Snow Leopard）3D 雙形態模型系統
    // 1. 冰原煙灰小雪豹崽：冰霧銀白蓬鬆軟毛、玫瑰斑點、冰晶藍大圓眼、粗長毛尾
    // 2. 喜馬拉雅雪山之王：佇立覆雪高山岩台、霸氣銀白玫瑰斑紋、開心時會「抱著/咬著自己的大毛尾巴賣萌」！
    // =========================================================================
    buildSnowLeopardMesh() {
        this.snowLeopardRoot = new THREE.Group();
        this.snowLeopardRoot.name = 'SnowLeopardRoot';
        this.root.add(this.snowLeopardRoot);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.snowLeopardRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        this.snowLeopardGroup = new THREE.Group();
        this.snowLeopardRoot.add(this.snowLeopardGroup);
        this.snowLeopardStage = 'baby';

        this.buildSnowLeopardBabyMesh();
        this.buildSnowLeopardAdultMesh();
        this.updateSnowLeopardStage('baby');
    }

    buildSnowLeopardBabyMesh() {
        this.snowLeopardBabyGroup = new THREE.Group();
        this.snowLeopardBabyGroup.position.set(0, 0.50, 0);
        this.snowLeopardGroup.add(this.snowLeopardBabyGroup);

        // 銀白蓬鬆幼豹身軀
        const torsoGeo = new THREE.SphereGeometry(0.36, 20, 18);
        torsoGeo.scale(0.92, 0.94, 1.28);
        const torso = new THREE.Mesh(torsoGeo, this.matSnowLeopardCoat);
        torso.castShadow = true;
        this.snowLeopardBabyGroup.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), this.matSnowLeopardBelly);
        belly.scale.set(0.86, 0.82, 1.18);
        belly.position.set(0, -0.06, 0.04);
        this.snowLeopardBabyGroup.add(belly);

        // 玫瑰斑紋 (Rosettes)
        const spotGeo = new THREE.TorusGeometry(0.048, 0.014, 6, 14);
        [
            [-0.29, 0.08, 0.12], [0.29, 0.08, 0.12],
            [-0.31, -0.02, -0.08], [0.31, -0.02, -0.08],
            [-0.26, 0.10, -0.22], [0.26, 0.10, -0.22]
        ].forEach(([sx, sy, sz]) => {
            const r = new THREE.Mesh(spotGeo, this.matSnowLeopardRosette);
            r.position.set(sx, sy, sz);
            r.rotation.y = Math.PI / 2;
            this.snowLeopardBabyGroup.add(r);
        });

        // 幼豹圓萌大頭
        this.snowLeopardBabyHead = new THREE.Group();
        this.snowLeopardBabyHead.name = 'SnowLeopardBabyHead';
        this.snowLeopardBabyHead.position.set(0, 0.26, 0.36);
        this.snowLeopardBabyGroup.add(this.snowLeopardBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 18), this.matSnowLeopardCoat);
        headMesh.scale.set(1.06, 0.98, 1.02);
        headMesh.castShadow = true;
        this.snowLeopardBabyHead.add(headMesh);

        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), this.matSnowLeopardBelly);
        muzzle.scale.set(1.05, 0.80, 0.95);
        muzzle.position.set(0, -0.05, 0.24);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), this.matInnerEar);
        nose.position.set(0, -0.01, 0.36);
        this.snowLeopardBabyHead.add(muzzle, nose);

        // 冰晶藍寶石大圓眼
        [-0.13, 0.13].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 14), this.matSnowLeopardEye);
            eye.position.set(ex, 0.06, 0.26);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), this.matPupil);
            pupil.position.set(ex, 0.06, 0.30);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), this.matShine);
            shine.position.set(ex - 0.015, 0.08, 0.33);
            this.snowLeopardBabyHead.add(eye, pupil, shine);
        });

        // 圓潤毛絨小雪豹耳
        [-1, 1].forEach(sign => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.matSnowLeopardCoat);
            ear.name = sign < 0 ? 'SnowLeopardEarL' : 'SnowLeopardEarR';
            ear.scale.set(1.0, 0.95, 0.38);
            ear.position.set(sign * 0.24, 0.24, 0.02);
            this.snowLeopardBabyHead.add(ear);
        });

        // 雪地厚肉墊四肢（帶白絨毛雪鞋大厚肉墊）
        this.snowLeopardBabyLegs = {};
        const legGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.28, 12);
        [
            ['frontLeft', -0.17, -0.16, 0.22],
            ['frontRight', 0.17, -0.16, 0.22],
            ['backLeft', -0.18, -0.16, -0.22],
            ['backRight', 0.18, -0.16, -0.22]
        ].forEach(([k, x, y, z]) => {
            const p = new THREE.Group();
            p.position.set(x, y, z);
            const m = new THREE.Mesh(legGeo, this.matSnowLeopardCoat);
            m.position.y = -0.12;
            m.castShadow = true;
            // 寬厚雪地軟萌肉墊掌 (Fluffy Snow Paws)
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), this.matSnowLeopardBelly);
            paw.scale.set(1.08, 0.55, 1.22);
            paw.position.set(0, -0.24, 0.03);
            p.add(m, paw);
            this.snowLeopardBabyGroup.add(p);
            this.snowLeopardBabyLegs[k] = p;
        });

        // 雪豹招牌超粗超長毛絨大尾巴
        this.snowLeopardBabyTail = new THREE.Group();
        this.snowLeopardBabyTail.position.set(0, -0.02, -0.34);
        for (let i = 0; i < 6; i++) {
            const seg = new THREE.Mesh(
                new THREE.SphereGeometry(0.13, 12, 12),
                (i % 2 === 0) ? this.matSnowLeopardCoat : this.matSnowLeopardRosette
            );
            seg.scale.set(0.95, 0.95, 1.35);
            seg.position.set(Math.sin(i * 0.45) * 0.18, -0.12, -i * 0.11);
            this.snowLeopardBabyTail.add(seg);
        }
        this.snowLeopardBabyGroup.add(this.snowLeopardBabyTail);
    }

    buildSnowLeopardAdultMesh() {
        this.snowLeopardAdultGroup = new THREE.Group();
        this.snowLeopardAdultGroup.position.set(0, 0, 0);
        this.snowLeopardGroup.add(this.snowLeopardAdultGroup);

        // 成年雪豹王者身軀（徹底移除沉重黏腳冰塊台座，四肢健步如飛立於地面！）
        this.snowLeopardAdultBody = new THREE.Group();
        this.snowLeopardAdultBody.position.set(0, 0.58, 0);
        this.snowLeopardAdultGroup.add(this.snowLeopardAdultBody);

        const torsoGeo = new THREE.SphereGeometry(0.40, 22, 18);
        torsoGeo.scale(0.88, 0.96, 1.48);
        const torso = new THREE.Mesh(torsoGeo, this.matSnowLeopardCoat);
        torso.castShadow = true;
        this.snowLeopardAdultBody.add(torso);

        const chestFur = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 16), this.matSnowLeopardBelly);
        chestFur.scale.set(0.92, 1.05, 0.95);
        chestFur.position.set(0, -0.02, 0.26);
        this.snowLeopardAdultBody.add(chestFur);

        // 成體玫瑰斑環
        const rGeo = new THREE.TorusGeometry(0.055, 0.016, 6, 14);
        [
            [-0.32, 0.10, 0.18], [0.32, 0.10, 0.18],
            [-0.34, 0.02, -0.04], [0.34, 0.02, -0.04],
            [-0.31, 0.08, -0.26], [0.31, 0.08, -0.26],
            [-0.28, -0.08, -0.16], [0.28, -0.08, -0.16]
        ].forEach(([rx, ry, rz]) => {
            const m = new THREE.Mesh(rGeo, this.matSnowLeopardRosette);
            m.position.set(rx, ry, rz);
            m.rotation.y = Math.PI / 2;
            this.snowLeopardAdultBody.add(m);
        });

        // 成體威武頭部
        this.snowLeopardAdultHead = new THREE.Group();
        this.snowLeopardAdultHead.name = 'SnowLeopardAdultHead';
        this.snowLeopardAdultHead.position.set(0, 0.30, 0.46);
        this.snowLeopardAdultBody.add(this.snowLeopardAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 18), this.matSnowLeopardCoat);
        aHead.scale.set(1.06, 0.98, 1.05);
        aHead.castShadow = true;
        this.snowLeopardAdultHead.add(aHead);

        const aMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), this.matSnowLeopardBelly);
        aMuzzle.scale.set(1.05, 0.82, 1.0);
        aMuzzle.position.set(0, -0.06, 0.24);
        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.matNose);
        aNose.position.set(0, -0.02, 0.37);
        this.snowLeopardAdultHead.add(aMuzzle, aNose);

        [-0.13, 0.13].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 14), this.matSnowLeopardEye);
            eye.position.set(ex, 0.06, 0.26);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.matPupil);
            pupil.position.set(ex, 0.06, 0.30);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), this.matShine);
            shine.position.set(ex - 0.015, 0.078, 0.33);
            this.snowLeopardAdultHead.add(eye, pupil, shine);
        });

        [-1, 1].forEach(sign => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.matSnowLeopardCoat);
            ear.name = sign < 0 ? 'SnowLeopardAdultEarL' : 'SnowLeopardAdultEarR';
            ear.scale.set(0.95, 0.9, 0.35);
            ear.position.set(sign * 0.24, 0.25, 0.0);
            this.snowLeopardAdultHead.add(ear);
        });

        // 強健粗壯四肢（帶喜馬拉雅雪豹招牌大厚絨毛雪鞋腳掌）
        this.snowLeopardAdultLegs = {};
        const aLegGeo = new THREE.CylinderGeometry(0.095, 0.088, 0.38, 12);
        [
            ['frontLeft', -0.20, -0.18, 0.28],
            ['frontRight', 0.20, -0.18, 0.28],
            ['backLeft', -0.21, -0.18, -0.32],
            ['backRight', 0.21, -0.18, -0.32]
        ].forEach(([k, x, y, z]) => {
            const p = new THREE.Group();
            p.position.set(x, y, z);
            const m = new THREE.Mesh(aLegGeo, this.matSnowLeopardCoat);
            m.position.y = -0.16;
            m.castShadow = true;
            // 寬厚雪地軟萌大厚掌 (Fluffy Snow Paws，自然平踏於地板上)
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), this.matSnowLeopardBelly);
            paw.scale.set(1.12, 0.58, 1.28);
            paw.position.set(0, -0.33, 0.04);
            p.add(m, paw);
            this.snowLeopardAdultBody.add(p);
            this.snowLeopardAdultLegs[k] = p;
        });

        // 標誌性繞身超長大毛尾 (可環繞到胸前讓雪豹叼住賣萌！)
        this.snowLeopardAdultTail = new THREE.Group();
        this.snowLeopardAdultTail.position.set(0, -0.05, -0.48);
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.32, -0.22, -0.15),
            new THREE.Vector3(0.48, -0.30, 0.25),
            new THREE.Vector3(0.35, -0.24, 0.68),
            new THREE.Vector3(0.08, -0.12, 0.88)
        ]);
        const tailTube = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 24, 0.135, 12, false), this.matSnowLeopardCoat);
        tailTube.castShadow = true;
        const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12), this.matSnowLeopardRosette);
        tailTip.position.set(0.08, -0.12, 0.88);
        this.snowLeopardAdultTail.add(tailTube, tailTip);
        this.snowLeopardAdultBody.add(this.snowLeopardAdultTail);
    }

    updateSnowLeopardStage(stage) {
        this.snowLeopardStage = stage;
        const isBaby = (stage === 'baby');
        if (this.snowLeopardBabyGroup) this.snowLeopardBabyGroup.visible = isBaby;
        if (this.snowLeopardAdultGroup) this.snowLeopardAdultGroup.visible = !isBaby;
    }

    updateSnowLeopard(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.snowLeopardStage === 'baby');

        if (isBaby) {
            this.updateCanineAutonomy(delta, elapsedTime);
            const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
            const isWalking = (this.autonomy && this.autonomy.state === 'walking' && this.currentState === 'idle');
            this.snowLeopardBabyTail.rotation.y = Math.sin(t * 4.0) * 0.35;

            if (this.currentState === 'happy') {
                this.snowLeopardBabyGroup.position.y = 0.50 + Math.abs(Math.sin(t * 8.5)) * 0.20;
                this.snowLeopardBabyHead.rotation.z = Math.sin(t * 8.5) * 0.15;
            } else if (isWalking) {
                const wc = this.autonomy.walkCycle;
                this.snowLeopardBabyGroup.position.y = 0.50 + Math.abs(Math.sin(wc * 2)) * 0.04;
                this.snowLeopardBabyLegs.frontLeft.rotation.x = Math.sin(wc) * 0.45;
                this.snowLeopardBabyLegs.frontRight.rotation.x = -Math.sin(wc) * 0.45;
                this.snowLeopardBabyLegs.backLeft.rotation.x = -Math.sin(wc) * 0.45;
                this.snowLeopardBabyLegs.backRight.rotation.x = Math.sin(wc) * 0.45;
            } else {
                this.snowLeopardBabyGroup.position.y = THREE.MathUtils.lerp(0.50, 0.32, lf) + Math.sin(t * 2.0) * 0.015;
                this.snowLeopardBabyHead.rotation.y = Math.sin(t * 1.1) * 0.14;
                this.snowLeopardBabyHead.rotation.x = Math.sin(t * 1.6) * 0.04;
            }
        } else {
            // 成體雪豹：四肢自由奔跑走動、趴下休息，徹底擺脫冰塊束縛！
            this.updateCanineAutonomy(delta, elapsedTime);
            const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
            const isWalking = (this.autonomy && this.autonomy.state === 'walking' && this.currentState === 'idle');

            // 開心時低頭叼住環繞在身前的大毛尾巴搖晃賣萌！
            if (this.currentState === 'happy' || this.currentState === 'pet') {
                this.snowLeopardAdultBody.position.y = 0.58 + Math.abs(Math.sin(t * 6.5)) * 0.08;
                this.snowLeopardAdultHead.rotation.x = 0.32 + Math.sin(t * 7.0) * 0.08;
                this.snowLeopardAdultHead.rotation.z = Math.sin(t * 7.0) * 0.14;
                this.snowLeopardAdultTail.rotation.y = Math.sin(t * 7.0) * 0.18;
            } else if (isWalking) {
                const wc = this.autonomy.walkCycle;
                this.snowLeopardAdultBody.position.y = 0.58 + Math.abs(Math.sin(wc * 2)) * 0.04;
                this.snowLeopardAdultLegs.frontLeft.rotation.x = Math.sin(wc) * 0.45;
                this.snowLeopardAdultLegs.frontRight.rotation.x = -Math.sin(wc) * 0.45;
                this.snowLeopardAdultLegs.backLeft.rotation.x = -Math.sin(wc) * 0.45;
                this.snowLeopardAdultLegs.backRight.rotation.x = Math.sin(wc) * 0.45;
                this.snowLeopardAdultHead.rotation.x = Math.sin(wc * 2) * 0.04;
                this.snowLeopardAdultTail.rotation.y = Math.sin(wc) * 0.22;
            } else {
                this.snowLeopardAdultBody.position.y = THREE.MathUtils.lerp(0.58, 0.36, lf) + Math.sin(t * 1.8) * 0.016;
                this.snowLeopardAdultHead.rotation.x = Math.sin(t * 1.4) * 0.04;
                this.snowLeopardAdultHead.rotation.y = Math.sin(t * 0.9) * 0.18;
                this.snowLeopardAdultHead.rotation.z = 0;
                this.snowLeopardAdultTail.rotation.y = Math.sin(t * 2.2) * 0.08;
                if (lf > 0.05) {
                    this.snowLeopardAdultLegs.frontLeft.rotation.x = THREE.MathUtils.lerp(0, 0.85, lf);
                    this.snowLeopardAdultLegs.frontRight.rotation.x = THREE.MathUtils.lerp(0, 0.85, lf);
                    this.snowLeopardAdultLegs.backLeft.rotation.x = THREE.MathUtils.lerp(0, -0.95, lf);
                    this.snowLeopardAdultLegs.backRight.rotation.x = THREE.MathUtils.lerp(0, -0.95, lf);
                } else {
                    this.snowLeopardAdultLegs.frontLeft.rotation.x = 0;
                    this.snowLeopardAdultLegs.frontRight.rotation.x = 0;
                    this.snowLeopardAdultLegs.backLeft.rotation.x = 0;
                    this.snowLeopardAdultLegs.backRight.rotation.x = 0;
                }
            }
        }
    }

    // =========================================================================
    // 🐧 企鵝（南極帝企鵝・冰原搖擺紳士 Emperor Penguin）3D 雙形態模型系統
    // 1. 灰絨毛奇異果小企鵝：銀灰蓬鬆絨毛球、黑白熊貓小臉譜、小短翅啪嗒啪嗒扇動
    // 2. 南極燕尾服帝企鵝皇：晶瑩浮冰台、黑曜石燕尾服、頸側璀璨金橘羽斑、肚皮貼地滑冰特技！
    // =========================================================================
    buildPenguinMesh() {
        this.penguinRoot = new THREE.Group();
        this.penguinRoot.name = 'PenguinRoot';
        this.root.add(this.penguinRoot);

        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.penguinRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        this.penguinGroup = new THREE.Group();
        this.penguinRoot.add(this.penguinGroup);
        this.penguinStage = 'baby';

        this.buildPenguinBabyMesh();
        this.buildPenguinAdultMesh();
        this.updatePenguinStage('baby');
    }

    buildPenguinBabyMesh() {
        this.penguinBabyGroup = new THREE.Group();
        this.penguinBabyGroup.position.set(0, 0.44, 0);
        this.penguinGroup.add(this.penguinBabyGroup);

        // 銀灰蓬鬆梨形絨毛身軀
        const torsoGeo = new THREE.SphereGeometry(0.35, 22, 18);
        torsoGeo.scale(0.96, 1.18, 0.92);
        const torso = new THREE.Mesh(torsoGeo, this.matPenguinChickFluff);
        torso.castShadow = true;
        this.penguinBabyGroup.add(torso);

        // 幼雛小腦袋與黑白臉譜
        this.penguinBabyHead = new THREE.Group();
        this.penguinBabyHead.name = 'PenguinBabyHead';
        this.penguinBabyHead.position.set(0, 0.38, 0.02);
        this.penguinBabyGroup.add(this.penguinBabyHead);

        const headCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 18), this.matPenguinBlack);
        headCap.castShadow = true;
        this.penguinBabyHead.add(headCap);

        // 雪白心形小臉頰面具
        const cheekGeo = new THREE.SphereGeometry(0.15, 14, 14);
        cheekGeo.scale(0.95, 0.95, 0.55);
        const cheekL = new THREE.Mesh(cheekGeo, this.matPenguinWhite);
        cheekL.position.set(-0.08, -0.02, 0.16);
        const cheekR = new THREE.Mesh(cheekGeo, this.matPenguinWhite);
        cheekR.position.set(0.08, -0.02, 0.16);
        this.penguinBabyHead.add(cheekL, cheekR);

        // 小黑短喙
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 12), this.matNose);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, -0.03, 0.28);
        this.penguinBabyHead.add(beak);

        // 圓溜溜黑眼睛
        [-0.095, 0.095].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.matNose);
            eye.position.set(ex, 0.02, 0.22);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.035, 0.25);
            this.penguinBabyHead.add(eye, shine);
        });

        // 啪嗒啪嗒扇動的小絨毛翅膀
        const flipperGeo = new THREE.SphereGeometry(0.12, 12, 12);
        flipperGeo.scale(0.32, 1.85, 0.65);
        this.penguinBabyWingL = new THREE.Group();
        this.penguinBabyWingL.position.set(-0.32, 0.12, 0);
        const wL = new THREE.Mesh(flipperGeo, this.matPenguinChickFluff);
        wL.position.y = -0.12;
        this.penguinBabyWingL.add(wL);

        this.penguinBabyWingR = new THREE.Group();
        this.penguinBabyWingR.position.set(0.32, 0.12, 0);
        const wR = new THREE.Mesh(flipperGeo, this.matPenguinChickFluff);
        wR.position.y = -0.12;
        this.penguinBabyWingR.add(wR);
        this.penguinBabyGroup.add(this.penguinBabyWingL, this.penguinBabyWingR);

        // 璞足小腳丫
        [-0.14, 0.14].forEach(fx => {
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), this.matNose);
            foot.scale.set(0.95, 0.4, 1.4);
            foot.position.set(fx, -0.38, 0.12);
            this.penguinBabyGroup.add(foot);
        });
    }

    buildPenguinAdultMesh() {
        this.penguinAdultGroup = new THREE.Group();
        this.penguinAdultGroup.position.set(0, 0, 0);
        this.penguinGroup.add(this.penguinAdultGroup);

        // 南極晶瑩浮冰底座
        this.penguinIceBase = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.96, 0.16, 8), this.matPenguinIce);
        this.penguinIceBase.position.y = 0.08;
        this.penguinIceBase.receiveShadow = true;
        this.penguinAdultGroup.add(this.penguinIceBase);

        // 帝企鵝主軀幹群組 (支援站立搖擺 & 肚皮貼地滑冰姿勢！)
        this.penguinAdultBody = new THREE.Group();
        this.penguinAdultBody.position.set(0, 0.68, 0);
        this.penguinAdultGroup.add(this.penguinAdultBody);

        // 黑曜石燕尾服後背與純白圓肚皮
        const backGeo = new THREE.SphereGeometry(0.42, 24, 20);
        backGeo.scale(0.92, 1.38, 0.88);
        const backMesh = new THREE.Mesh(backGeo, this.matPenguinBlack);
        backMesh.castShadow = true;
        this.penguinAdultBody.add(backMesh);

        const bellyGeo = new THREE.SphereGeometry(0.38, 22, 18);
        bellyGeo.scale(0.86, 1.26, 0.78);
        const bellyMesh = new THREE.Mesh(bellyGeo, this.matPenguinWhite);
        bellyMesh.position.set(0, -0.04, 0.10);
        this.penguinAdultBody.add(bellyMesh);

        // 帝企鵝頸側與胸前璀璨金橘漸層羽斑
        const goldChest = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), this.matPenguinGold);
        goldChest.scale.set(0.85, 0.55, 0.75);
        goldChest.position.set(0, 0.34, 0.15);
        this.penguinAdultBody.add(goldChest);

        // 帝企鵝頭部
        this.penguinAdultHead = new THREE.Group();
        this.penguinAdultHead.name = 'PenguinAdultHead';
        this.penguinAdultHead.position.set(0, 0.54, 0.02);
        this.penguinAdultBody.add(this.penguinAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 18), this.matPenguinBlack);
        aHead.castShadow = true;
        this.penguinAdultHead.add(aHead);

        // 耳後金黃橘色斑塊 (Emperor Penguin Auricular Gold Patches)
        [-0.18, 0.18].forEach(gx => {
            const patch = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.matPenguinGold);
            patch.scale.set(0.55, 0.95, 0.85);
            patch.position.set(gx, -0.02, 0.06);
            this.penguinAdultHead.add(patch);
        });

        // 修長優雅流線型企鵝喙（帶珊瑚粉橘條紋）
        const aBeak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 12), this.matNose);
        aBeak.rotation.x = Math.PI / 2 + 0.12;
        aBeak.position.set(0, -0.02, 0.32);
        const beakStripe = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.22, 10), this.matPenguinBeak);
        beakStripe.rotation.x = Math.PI / 2 + 0.12;
        beakStripe.position.set(0, -0.035, 0.31);
        this.penguinAdultHead.add(aBeak, beakStripe);

        // 企鵝流線型划水雙翼
        const aFlipperGeo = new THREE.SphereGeometry(0.15, 14, 12);
        aFlipperGeo.scale(0.28, 2.35, 0.68);
        this.penguinAdultWingL = new THREE.Group();
        this.penguinAdultWingL.position.set(-0.38, 0.18, 0);
        const awL = new THREE.Mesh(aFlipperGeo, this.matPenguinBlack);
        awL.position.y = -0.18;
        this.penguinAdultWingL.add(awL);

        this.penguinAdultWingR = new THREE.Group();
        this.penguinAdultWingR.position.set(0.38, 0.18, 0);
        const awR = new THREE.Mesh(aFlipperGeo, this.matPenguinBlack);
        awR.position.y = -0.18;
        this.penguinAdultWingR.add(awR);
        this.penguinAdultBody.add(this.penguinAdultWingL, this.penguinAdultWingR);

        // 企鵝腳蹼
        [-0.16, 0.16].forEach(fx => {
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), this.matNose);
            foot.scale.set(0.95, 0.38, 1.45);
            foot.position.set(fx, -0.52, 0.14);
            this.penguinAdultBody.add(foot);
        });
    }

    updatePenguinStage(stage) {
        this.penguinStage = stage;
        const isBaby = (stage === 'baby');
        if (this.penguinBabyGroup) this.penguinBabyGroup.visible = isBaby;
        if (this.penguinAdultGroup) this.penguinAdultGroup.visible = !isBaby;
    }

    updatePenguin(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.penguinStage === 'baby');

        if (isBaby) {
            if (this.currentState === 'belly_slide') {
                this.penguinBabyGroup.position.y = 0.25;
                this.penguinBabyGroup.rotation.x = Math.PI / 2.2;
                this.penguinBabyWingL.rotation.z = 0.8 + Math.sin(t * 18) * 0.4;
                this.penguinBabyWingR.rotation.z = -0.8 - Math.sin(t * 18) * 0.4;
            } else if (this.currentState === 'happy') {
                this.penguinBabyGroup.rotation.x = 0;
                this.penguinBabyGroup.position.y = 0.44 + Math.abs(Math.sin(t * 9)) * 0.15;
                this.penguinBabyGroup.rotation.z = Math.sin(t * 9) * 0.16;
                this.penguinBabyWingL.rotation.z = 0.65 + Math.sin(t * 16) * 0.45;
                this.penguinBabyWingR.rotation.z = -0.65 - Math.sin(t * 16) * 0.45;
            } else {
                // 呆萌企鵝搖擺步待機
                this.penguinBabyGroup.rotation.x = 0;
                this.penguinBabyGroup.position.y = 0.44 + Math.abs(Math.sin(t * 3.2)) * 0.025;
                this.penguinBabyGroup.rotation.z = Math.sin(t * 3.2) * 0.08;
                this.penguinBabyHead.rotation.y = Math.sin(t * 1.6) * 0.2;
                this.penguinBabyWingL.rotation.z = 0.25 + Math.sin(t * 4.5) * 0.15;
                this.penguinBabyWingR.rotation.z = -0.25 - Math.sin(t * 4.5) * 0.15;
            }
        } else {
            if (this.currentState === 'belly_slide') {
                // 肚皮貼地滑冰衝刺！
                this.penguinIceBase.visible = false;
                this.penguinAdultBody.position.y = 0.28;
                this.penguinAdultBody.rotation.x = Math.PI / 2.1;
                this.penguinAdultHead.rotation.x = -0.75;
                this.penguinAdultWingL.rotation.z = 0.9 + Math.sin(t * 16) * 0.35;
                this.penguinAdultWingR.rotation.z = -0.9 - Math.sin(t * 16) * 0.35;
            } else if (this.currentState === 'happy') {
                this.penguinIceBase.visible = true;
                this.penguinAdultBody.rotation.x = 0;
                this.penguinAdultBody.position.y = 0.68 + Math.abs(Math.sin(t * 7.5)) * 0.16;
                this.penguinAdultHead.rotation.x = -0.35; // 昂首號角長鳴
                this.penguinAdultWingL.rotation.z = 0.75 + Math.sin(t * 12) * 0.38;
                this.penguinAdultWingR.rotation.z = -0.75 - Math.sin(t * 12) * 0.38;
            } else {
                this.penguinIceBase.visible = true;
                this.penguinAdultBody.rotation.x = 0;
                this.penguinAdultBody.position.y = 0.68 + Math.sin(t * 2.2) * 0.02;
                this.penguinAdultBody.rotation.z = Math.sin(t * 2.2) * 0.05;
                this.penguinAdultHead.rotation.x = Math.sin(t * 1.5) * 0.05;
                this.penguinAdultHead.rotation.y = Math.sin(t * 1.1) * 0.22;
                this.penguinAdultWingL.rotation.z = 0.18 + Math.sin(t * 2.5) * 0.1;
                this.penguinAdultWingR.rotation.z = -0.18 - Math.sin(t * 2.5) * 0.1;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🦦 17. 太平洋海獺 (Sea Otter) — 雙階段：仰泳抱扇貝毛球幼獺 vs 敲貝殼藏寶成體海獺
    // ═══════════════════════════════════════════════════════════════════════════
    buildSeaOtterMesh() {
        this.seaOtterStage = 'baby';
        this.seaOtterGroup = new THREE.Group();
        this.root.add(this.seaOtterGroup);

        // 配件相容骨架錨點
        this.body = new THREE.Group();
        this.body.position.set(0, 0.36, 0);
        this.seaOtterGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.18, -0.32);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildSeaOtterBabyMesh();
        this.buildSeaOtterAdultMesh();
        this.updateSeaOtterStage('baby');
    }

    buildSeaOtterBabyMesh() {
        this.seaOtterBabyGroup = new THREE.Group();
        this.seaOtterGroup.add(this.seaOtterBabyGroup);

        // 碧藍海面水波墊
        this.otterBabyWater = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.90, 0.08, 24), this.matOtterWater);
        this.otterBabyWater.position.y = 0.04;
        this.seaOtterBabyGroup.add(this.otterBabyWater);

        // 平躺仰泳於水面的蓬鬆栗子毛球幼獺軀幹
        this.otterBabyBody = new THREE.Group();
        this.otterBabyBody.position.set(0, 0.28, 0);
        this.seaOtterBabyGroup.add(this.otterBabyBody);

        const bodyGeo = new THREE.SphereGeometry(0.34, 22, 18);
        bodyGeo.scale(0.95, 0.68, 1.20);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matOtterBabyFluff);
        bodyMesh.position.set(0, 0, 0.16);
        bodyMesh.castShadow = true;
        this.otterBabyBody.add(bodyMesh);

        const bellyGeo = new THREE.SphereGeometry(0.28, 18, 16);
        bellyGeo.scale(0.88, 0.52, 1.05);
        const bellyMesh = new THREE.Mesh(bellyGeo, this.matOtterCream);
        bellyMesh.position.set(0, 0.10, 0.16);
        this.otterBabyBody.add(bellyMesh);

        // 第一版經典小圓頭（仰躺於水面、面部完全朝向上方仰望天空）
        this.seaOtterBabyHead = new THREE.Group();
        this.seaOtterBabyHead.name = 'SeaOtterBabyHead';
        this.seaOtterBabyHead.position.set(0, 0.06, -0.36);
        this.seaOtterBabyHead.rotation.x = -1.22; // 面部朝向上方（仰躺姿態）
        this.otterBabyBody.add(this.seaOtterBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 18), this.matOtterCream);
        headMesh.scale.set(1.08, 0.96, 0.95);
        headMesh.castShadow = true;
        this.seaOtterBabyHead.add(headMesh);

        // 圓鼓鼓花生鬍鬚臉頰墊（第一版造型）
        [-0.085, 0.085].forEach(cx => {
            const pad = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), this.matBunnyWhite);
            pad.scale.set(1.1, 0.85, 0.8);
            pad.position.set(cx, -0.04, 0.20);
            this.seaOtterBabyHead.add(pad);
        });

        // 菱形小黑鼻與黑豆圓眼（第一版造型）
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), this.matNose);
        nose.scale.set(1.1, 0.9, 0.8);
        nose.position.set(0, 0.02, 0.25);
        this.seaOtterBabyHead.add(nose);

        [-0.095, 0.095].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), this.matNose);
            eye.position.set(ex, 0.08, 0.21);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.095, 0.24);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.matOtterFur);
            ear.position.set(ex * 2.2, 0.12, 0.02);
            this.seaOtterBabyHead.add(eye, shine, ear);
        });

        // 肚子上抱著的粉紅小扇貝與揉臉小手手
        const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.04, 12), this.matOtterShell);
        shell.position.set(0, 0.23, 0.18);
        this.otterBabyBody.add(shell);

        this.otterBabyPawL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), this.matOtterFur);
        this.otterBabyPawL.position.set(-0.15, 0.21, 0.12);
        this.otterBabyPawR = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), this.matOtterFur);
        this.otterBabyPawR.position.set(0.15, 0.21, 0.12);
        this.otterBabyBody.add(this.otterBabyPawL, this.otterBabyPawR);

        // 小腳蹼
        [-0.16, 0.16].forEach(fx => {
            const flipper = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), this.matOtterFur);
            flipper.scale.set(0.85, 1.35, 0.45);
            flipper.position.set(fx, 0.14, 0.54);
            this.otterBabyBody.add(flipper);
        });
    }

    buildSeaOtterAdultMesh() {
        this.seaOtterAdultGroup = new THREE.Group();
        this.seaOtterGroup.add(this.seaOtterAdultGroup);

        // 雙層碧藍海浪水圈
        this.otterAdultWater = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.08, 0.09, 28), this.matOtterWater);
        this.otterAdultWater.position.y = 0.045;
        this.seaOtterAdultGroup.add(this.otterAdultWater);

        // 成年海獺平躺水面修長流線身軀
        this.otterAdultBody = new THREE.Group();
        this.otterAdultBody.position.set(0, 0.32, 0);
        this.seaOtterAdultGroup.add(this.otterAdultBody);

        const bodyGeo = new THREE.SphereGeometry(0.40, 24, 20);
        bodyGeo.scale(0.96, 0.68, 1.35);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matOtterFur);
        bodyMesh.position.set(0, 0, 0.20);
        bodyMesh.castShadow = true;
        this.otterAdultBody.add(bodyMesh);

        const bellyGeo = new THREE.SphereGeometry(0.33, 20, 16);
        bellyGeo.scale(0.88, 0.52, 1.18);
        const bellyMesh = new THREE.Mesh(bellyGeo, this.matOtterCream);
        bellyMesh.position.set(0, 0.11, 0.20);
        this.otterAdultBody.add(bellyMesh);

        // 第一版經典成年海獺奶油白圓頭（仰躺於水面、面部完全朝向上方仰望天空）
        this.seaOtterAdultHead = new THREE.Group();
        this.seaOtterAdultHead.name = 'SeaOtterAdultHead';
        this.seaOtterAdultHead.position.set(0, 0.08, -0.46);
        this.seaOtterAdultHead.rotation.x = -1.22; // 面部朝向上方（仰躺姿態）
        this.otterAdultBody.add(this.seaOtterAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), this.matOtterCream);
        aHead.scale.set(1.1, 0.96, 0.95);
        aHead.castShadow = true;
        this.seaOtterAdultHead.add(aHead);

        [-0.1, 0.1].forEach(cx => {
            const pad = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), this.matBunnyWhite);
            pad.scale.set(1.15, 0.88, 0.85);
            pad.position.set(cx, -0.04, 0.22);
            this.seaOtterAdultHead.add(pad);
        });

        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 12), this.matNose);
        aNose.scale.set(1.05, 1.15, 0.85);
        aNose.position.set(0, 0.02, 0.28);
        this.seaOtterAdultHead.add(aNose);

        [-0.11, 0.11].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.matNose);
            eye.position.set(ex, 0.09, 0.23);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.105, 0.26);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matOtterFur);
            ear.position.set(ex * 2.2, 0.12, 0.02);
            this.seaOtterAdultHead.add(eye, shine, ear);
        });

        // 肚皮上的小石頭砧板 + 璀璨珍珠扇貝 + 敲貝殼雙手
        const anvilRock = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.05, 12), this.matSnowRock);
        anvilRock.position.set(0, 0.25, 0.20);
        this.otterAdultBody.add(anvilRock);

        this.otterAdultPearl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), this.matOtterPearl);
        this.otterAdultPearl.position.set(0, 0.32, 0.20);
        this.otterAdultBody.add(this.otterAdultPearl);

        this.otterAdultClamGroup = new THREE.Group();
        this.otterAdultClamGroup.position.set(0, 0.35, 0.16);
        const clamShell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, 0.045, 14), this.matOtterShell);
        this.otterAdultClamGroup.add(clamShell);
        this.otterAdultBody.add(this.otterAdultClamGroup);

        this.otterAdultPawL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), this.matOtterFur);
        this.otterAdultPawL.position.set(-0.18, 0.31, 0.12);
        this.otterAdultPawR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), this.matOtterFur);
        this.otterAdultPawR.position.set(0.18, 0.31, 0.12);
        this.otterAdultBody.add(this.otterAdultPawL, this.otterAdultPawR);

        // 大蹼足與扁平舵尾
        [-0.20, 0.20].forEach(fx => {
            const flipper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), this.matOtterFur);
            flipper.scale.set(0.85, 1.45, 0.42);
            flipper.position.set(fx, 0.16, 0.68);
            this.otterAdultBody.add(flipper);
        });
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), this.matOtterFur);
        tail.scale.set(0.65, 0.38, 2.2);
        tail.position.set(0, 0.02, 0.82);
        this.otterAdultBody.add(tail);
    }

    updateSeaOtterStage(stage) {
        this.seaOtterStage = stage;
        const isBaby = (stage === 'baby');
        if (this.seaOtterBabyGroup) this.seaOtterBabyGroup.visible = isBaby;
        if (this.seaOtterAdultGroup) this.seaOtterAdultGroup.visible = !isBaby;
    }

    updateSeaOtter(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.seaOtterStage === 'baby');
        const isKnocking = (this.currentState === 'happy' || this.currentState === 'otter_shell');

        if (isBaby) {
            this.otterBabyBody.position.y = 0.28 + Math.sin(t * 2.6) * 0.035;
            this.otterBabyBody.rotation.z = Math.sin(t * 1.8) * 0.06;
            if (isKnocking) {
                // 幼獺搓臉臉賣萌與拍拍小貝殼（面部保持朝上仰望）
                this.seaOtterBabyHead.rotation.x = -1.22 + Math.sin(t * 8) * 0.06;
                this.seaOtterBabyHead.rotation.z = Math.sin(t * 9) * 0.14;
                this.otterBabyPawL.position.y = 0.23 + Math.abs(Math.sin(t * 14)) * 0.12;
                this.otterBabyPawR.position.y = 0.23 + Math.abs(Math.cos(t * 14)) * 0.12;
            } else {
                // 仰躺水面，面部朝向天空，隨水波輕柔微晃
                this.seaOtterBabyHead.rotation.x = -1.22 + Math.sin(t * 1.8) * 0.03;
                this.seaOtterBabyHead.rotation.z = Math.sin(t * 1.5) * 0.06;
                this.otterBabyPawL.position.y = 0.21 + Math.sin(t * 3.2) * 0.02;
                this.otterBabyPawR.position.y = 0.21 - Math.sin(t * 3.2) * 0.02;
            }
        } else {
            this.otterAdultBody.position.y = 0.32 + Math.sin(t * 2.4) * 0.04;
            this.otterAdultBody.rotation.z = Math.sin(t * 1.6) * 0.05;
            if (isKnocking) {
                // 叩叩叩！雙手抱著扇貝往肚皮石頭上快樂敲擊，露出發光大珍珠！（面部保持朝上仰望）
                const knock = Math.abs(Math.sin(t * 16));
                this.otterAdultClamGroup.position.y = 0.31 + knock * 0.18;
                this.otterAdultPawL.position.y = 0.29 + knock * 0.16;
                this.otterAdultPawR.position.y = 0.29 + knock * 0.16;
                this.otterAdultPearl.scale.setScalar(1.15 + Math.sin(t * 12) * 0.25);
                this.seaOtterAdultHead.rotation.x = -1.22 + Math.sin(t * 8) * 0.06;
                this.seaOtterAdultHead.rotation.z = Math.sin(t * 8) * 0.08;
            } else {
                this.otterAdultClamGroup.position.y = 0.35 + Math.sin(t * 2.4) * 0.015;
                this.otterAdultPawL.position.y = 0.31;
                this.otterAdultPawR.position.y = 0.31;
                this.otterAdultPearl.scale.setScalar(0.85);
                this.seaOtterAdultHead.rotation.x = -1.22 + Math.sin(t * 1.4) * 0.03;
                this.seaOtterAdultHead.rotation.y = Math.sin(t * 1.1) * 0.08;
                this.seaOtterAdultHead.rotation.z = 0;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🐨 18. 澳洲無尾熊 (Koala) — 雙階段：抱尤加利嫩枝呆萌寶寶 vs 尤加利樹冠大耳樹熊
    // ═══════════════════════════════════════════════════════════════════════════
    buildKoalaMesh() {
        this.koalaStage = 'baby';
        this.koalaGroup = new THREE.Group();
        this.root.add(this.koalaGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.55, 0);
        this.koalaGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.25, 0.18);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildKoalaBabyMesh();
        this.buildKoalaAdultMesh();
        this.updateKoalaStage('baby');
    }

    buildKoalaBabyMesh() {
        this.koalaBabyGroup = new THREE.Group();
        this.koalaBabyGroup.position.set(0, 0.42, 0);
        this.koalaGroup.add(this.koalaBabyGroup);

        // 迷你尤加利樹樁靠墊
        const miniTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.72, 12), this.matEucalyptusTrunk);
        miniTrunk.position.set(0.12, 0.02, 0.18);
        miniTrunk.rotation.z = 0.18;
        this.koalaBabyGroup.add(miniTrunk);

        // 圓滾滾銀灰無尾熊寶寶身軀
        const bodyGeo = new THREE.SphereGeometry(0.32, 20, 18);
        bodyGeo.scale(0.96, 1.08, 0.92);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matKoalaFur);
        bodyMesh.castShadow = true;
        this.koalaBabyGroup.add(bodyMesh);

        const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), this.matKoalaWhite);
        bellyMesh.scale.set(0.88, 0.95, 0.65);
        bellyMesh.position.set(0, -0.02, 0.14);
        this.koalaBabyGroup.add(bellyMesh);

        // 呆萌大腦袋與超蓬鬆白毛大圓耳
        this.koalaBabyHead = new THREE.Group();
        this.koalaBabyHead.name = 'KoalaBabyHead';
        this.koalaBabyHead.position.set(0, 0.36, 0.06);
        this.koalaBabyGroup.add(this.koalaBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 18), this.matKoalaFur);
        headMesh.scale.set(1.12, 0.98, 0.96);
        headMesh.castShadow = true;
        this.koalaBabyHead.add(headMesh);

        // 標誌性大黑橢圓橡膠鼻 (Big Koala Oval Nose)
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 14), this.matKoalaNose);
        noseMesh.scale.set(0.82, 1.28, 0.85);
        noseMesh.position.set(0, -0.01, 0.24);
        this.koalaBabyHead.add(noseMesh);

        // 蓬鬆雪白毛絨大耳朵
        [-0.27, 0.27].forEach(ex => {
            const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.matKoalaFur);
            earOuter.scale.set(1.0, 1.0, 0.55);
            earOuter.position.set(ex, 0.12, -0.02);
            const earFluff = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.matKoalaWhite);
            earFluff.scale.set(1.1, 1.05, 0.65);
            earFluff.position.set(ex * 1.05, 0.10, 0.02);
            this.koalaBabyHead.add(earOuter, earFluff);
        });

        [-0.11, 0.11].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), this.matNose);
            eye.position.set(ex, 0.04, 0.22);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.055, 0.25);
            this.koalaBabyHead.add(eye, shine);
        });

        // 嘴角叼著的小尤加利葉
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matEucalyptusLeaf);
        leaf.scale.set(0.45, 0.2, 1.8);
        leaf.position.set(0.08, -0.10, 0.26);
        leaf.rotation.z = -0.4;
        this.koalaBabyHead.add(leaf);
    }

    buildKoalaAdultMesh() {
        this.koalaAdultGroup = new THREE.Group();
        this.koalaGroup.add(this.koalaAdultGroup);

        // 尤加利分岔大樹幹與翠綠樹冠
        const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 1.45, 14), this.matEucalyptusTrunk);
        mainTrunk.position.set(0.18, 0.72, 0.12);
        mainTrunk.rotation.z = 0.08;
        mainTrunk.castShadow = true;
        this.koalaAdultGroup.add(mainTrunk);

        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.65, 10), this.matEucalyptusTrunk);
        branch.position.set(-0.08, 0.55, 0.08);
        branch.rotation.z = 1.05;
        this.koalaAdultGroup.add(branch);

        // 樹頂尤加利葉叢
        [[0.22, 1.42, 0.12, 0.28], [0.02, 1.35, 0.18, 0.22], [0.35, 1.28, 0.05, 0.20]].forEach(([lx, ly, lz, lr]) => {
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(lr, 14, 12), this.matEucalyptusLeaf);
            foliage.scale.set(1.15, 0.75, 1.05);
            foliage.position.set(lx, ly, lz);
            this.koalaAdultGroup.add(foliage);
        });

        // 抱在尤加利樹幹上的成年無尾熊主體
        this.koalaAdultBody = new THREE.Group();
        this.koalaAdultBody.position.set(-0.04, 0.68, 0.06);
        this.koalaAdultGroup.add(this.koalaAdultBody);

        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 18), this.matKoalaFur);
        aBody.scale.set(0.95, 1.15, 0.92);
        aBody.castShadow = true;
        this.koalaAdultBody.add(aBody);

        const aBelly = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 16), this.matKoalaWhite);
        aBelly.scale.set(0.86, 1.02, 0.68);
        aBelly.position.set(0, -0.02, 0.15);
        this.koalaAdultBody.add(aBelly);

        this.koalaAdultHead = new THREE.Group();
        this.koalaAdultHead.name = 'KoalaAdultHead';
        this.koalaAdultHead.position.set(0, 0.42, 0.06);
        this.koalaAdultBody.add(this.koalaAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.31, 22, 18), this.matKoalaFur);
        aHead.scale.set(1.14, 0.98, 0.96);
        aHead.castShadow = true;
        this.koalaAdultHead.add(aHead);

        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.098, 16, 14), this.matKoalaNose);
        aNose.scale.set(0.82, 1.32, 0.88);
        aNose.position.set(0, -0.01, 0.28);
        this.koalaAdultHead.add(aNose);

        // 超蓬鬆雪白流蘇大圓耳
        [-0.32, 0.32].forEach(ex => {
            const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 14), this.matKoalaFur);
            earOuter.scale.set(1.0, 1.0, 0.55);
            earOuter.position.set(ex, 0.14, -0.02);
            const earFluff = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.matKoalaWhite);
            earFluff.scale.set(1.15, 1.1, 0.68);
            earFluff.position.set(ex * 1.06, 0.11, 0.03);
            this.koalaAdultHead.add(earOuter, earFluff);
        });

        [-0.125, 0.125].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.matNose);
            eye.position.set(ex, 0.05, 0.26);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.065, 0.29);
            this.koalaAdultHead.add(eye, shine);
        });

        // 抱樹雙臂（支援揮手打招呼！）
        this.koalaAdultArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.36, 10), this.matKoalaFur);
        this.koalaAdultArmL.position.set(-0.28, 0.12, 0.16);
        this.koalaAdultArmL.rotation.z = 0.55;
        this.koalaAdultBody.add(this.koalaAdultArmL);

        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 10), this.matKoalaFur);
        armR.position.set(0.24, 0.10, 0.14);
        armR.rotation.z = -0.85;
        this.koalaAdultBody.add(armR);
    }

    updateKoalaStage(stage) {
        this.koalaStage = stage;
        const isBaby = (stage === 'baby');
        if (this.koalaBabyGroup) this.koalaBabyGroup.visible = isBaby;
        if (this.koalaAdultGroup) this.koalaAdultGroup.visible = !isBaby;
    }

    updateKoala(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.koalaStage === 'baby');
        const isHappy = (this.currentState === 'happy' || this.currentState === 'koala_climb');

        if (isBaby) {
            this.koalaBabyGroup.position.y = 0.42 + Math.sin(t * 2.2) * 0.018;
            this.koalaBabyHead.rotation.z = Math.sin(t * (isHappy ? 7.5 : 1.5)) * (isHappy ? 0.18 : 0.06);
            this.koalaBabyHead.rotation.y = Math.sin(t * 1.2) * 0.12;
        } else {
            if (isHappy) {
                // 快樂爬上尤加利樹頂並揮動小手！
                this.koalaAdultBody.position.y = 0.78 + Math.sin(t * 6.5) * 0.14;
                this.koalaAdultArmL.rotation.z = 1.85 + Math.sin(t * 14) * 0.45;
                this.koalaAdultHead.rotation.z = Math.sin(t * 7) * 0.15;
            } else {
                this.koalaAdultBody.position.y = 0.68 + Math.sin(t * 1.8) * 0.018;
                this.koalaAdultArmL.rotation.z = 0.55;
                this.koalaAdultHead.rotation.z = Math.sin(t * 1.2) * 0.06;
                this.koalaAdultHead.rotation.y = Math.sin(t * 0.9) * 0.12;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🐰 19. 荷蘭垂耳兔 (Holland Lop Bunny) — 雙階段：雪白糯米糰幼兔 vs 焦糖花冠兔兔跳成兔
    // ═══════════════════════════════════════════════════════════════════════════
    buildBunnyMesh() {
        this.bunnyStage = 'baby';
        this.bunnyGroup = new THREE.Group();
        this.root.add(this.bunnyGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.42, 0);
        this.bunnyGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.18, 0.25);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildBunnyBabyMesh();
        this.buildBunnyAdultMesh();
        this.updateBunnyStage('baby');
    }

    buildBunnyBabyMesh() {
        this.bunnyBabyGroup = new THREE.Group();
        this.bunnyBabyGroup.position.set(0, 0.34, 0);
        this.bunnyGroup.add(this.bunnyBabyGroup);

        // 圓滾滾雪白糯米糰身軀
        const bodyGeo = new THREE.SphereGeometry(0.32, 22, 18);
        bodyGeo.scale(0.98, 0.88, 1.18);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matBunnyWhite);
        bodyMesh.castShadow = true;
        this.bunnyBabyGroup.add(bodyMesh);

        // 毛茸茸雪球短尾
        const puffTail = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), this.matBunnyWhite);
        puffTail.position.set(0, -0.04, -0.36);
        this.bunnyBabyGroup.add(puffTail);

        // 大臉頰幼兔頭與長長垂耳
        this.bunnyBabyHead = new THREE.Group();
        this.bunnyBabyHead.name = 'BunnyBabyHead';
        this.bunnyBabyHead.position.set(0, 0.22, 0.24);
        this.bunnyBabyGroup.add(this.bunnyBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 18), this.matBunnyWhite);
        headMesh.scale.set(1.12, 0.96, 1.0);
        headMesh.castShadow = true;
        this.bunnyBabyHead.add(headMesh);

        // 會抽動的粉紅小兔鼻
        this.bunnyBabyNose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.matBunnyPink);
        this.bunnyBabyNose.position.set(0, -0.01, 0.25);
        this.bunnyBabyHead.add(this.bunnyBabyNose);

        // 紅寶石黑曜雙眸
        [-0.105, 0.105].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.matNose);
            eye.position.set(ex, 0.04, 0.21);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.055, 0.24);
            this.bunnyBabyHead.add(eye, shine);
        });

        // 雙側垂落軟萌兔耳 (Lop Ears)
        this.bunnyBabyEarL = new THREE.Group();
        this.bunnyBabyEarL.name = 'BunnyBabyEarL';
        this.bunnyBabyEarL.position.set(-0.22, 0.08, 0.02);
        this.bunnyBabyEarR = new THREE.Group();
        this.bunnyBabyEarR.name = 'BunnyBabyEarR';
        this.bunnyBabyEarR.position.set(0.22, 0.08, 0.02);

        [this.bunnyBabyEarL, this.bunnyBabyEarR].forEach((eg, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const earMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), this.matBunnyWhite);
            earMesh.scale.set(0.55, 1.95, 0.78);
            earMesh.position.set(dir * 0.04, -0.18, 0.02);
            const innerMesh = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), this.matBunnyPink);
            innerMesh.scale.set(0.45, 1.65, 0.65);
            innerMesh.position.set(dir * 0.055, -0.18, 0.04);
            eg.add(earMesh, innerMesh);
            eg.rotation.z = dir * 0.18;
            this.bunnyBabyHead.add(eg);
        });
    }

    buildBunnyAdultMesh() {
        this.bunnyAdultGroup = new THREE.Group();
        this.bunnyAdultGroup.position.set(0, 0.44, 0);
        this.bunnyGroup.add(this.bunnyAdultGroup);

        // 焦糖奶油雙色飽滿成兔身軀
        const bodyGeo = new THREE.SphereGeometry(0.40, 24, 20);
        bodyGeo.scale(0.96, 0.92, 1.26);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matBunnyCaramel);
        bodyMesh.castShadow = true;
        this.bunnyAdultGroup.add(bodyMesh);

        const chestFluff = new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 16), this.matBunnyWhite);
        chestFluff.scale.set(0.88, 0.92, 0.85);
        chestFluff.position.set(0, -0.02, 0.22);
        this.bunnyAdultGroup.add(chestFluff);

        const puffTail = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.matBunnyWhite);
        puffTail.position.set(0, -0.04, -0.48);
        this.bunnyAdultGroup.add(puffTail);

        // 腳邊鮮脆紅蘿蔔擺飾
        const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 12), this.matCarrotOrange);
        carrot.rotation.z = Math.PI / 2.2;
        carrot.rotation.y = 0.4;
        carrot.position.set(0.32, -0.36, 0.28);
        this.bunnyAdultGroup.add(carrot);

        // 成兔圓潤頭部與小雛菊花冠
        this.bunnyAdultHead = new THREE.Group();
        this.bunnyAdultHead.name = 'BunnyAdultHead';
        this.bunnyAdultHead.position.set(0, 0.28, 0.30);
        this.bunnyAdultGroup.add(this.bunnyAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.29, 22, 18), this.matBunnyCaramel);
        aHead.scale.set(1.12, 0.96, 1.0);
        aHead.castShadow = true;
        this.bunnyAdultHead.add(aHead);

        // 臉頰雪白澎毛
        [-0.12, 0.12].forEach(cx => {
            const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.matBunnyWhite);
            cheek.scale.set(1.05, 0.82, 0.9);
            cheek.position.set(cx, -0.06, 0.16);
            this.bunnyAdultHead.add(cheek);
        });

        this.bunnyAdultNose = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 10), this.matBunnyPink);
        this.bunnyAdultNose.position.set(0, -0.01, 0.29);
        this.bunnyAdultHead.add(this.bunnyAdultNose);

        [-0.12, 0.12].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), this.matNose);
            eye.position.set(ex, 0.05, 0.24);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.065, 0.27);
            this.bunnyAdultHead.add(eye, shine);
        });

        // 頭頂春日小雛菊花環 (Daisy Flower Crown)
        for (let i = -2; i <= 2; i++) {
            const flower = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), i % 2 === 0 ? this.matBunnyWhite : this.matBunnyPink);
            flower.position.set(i * 0.065, 0.25 - Math.abs(i) * 0.018, 0.12);
            this.bunnyAdultHead.add(flower);
        }

        // 焦糖色長垂耳
        this.bunnyAdultEarL = new THREE.Group();
        this.bunnyAdultEarL.name = 'BunnyAdultEarL';
        this.bunnyAdultEarL.position.set(-0.26, 0.08, 0.02);
        this.bunnyAdultEarR = new THREE.Group();
        this.bunnyAdultEarR.name = 'BunnyAdultEarR';
        this.bunnyAdultEarR.position.set(0.26, 0.08, 0.02);

        [this.bunnyAdultEarL, this.bunnyAdultEarR].forEach((eg, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const earMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), this.matBunnyCaramel);
            earMesh.scale.set(0.55, 2.15, 0.80);
            earMesh.position.set(dir * 0.04, -0.22, 0.02);
            eg.add(earMesh);
            eg.rotation.z = dir * 0.16;
            this.bunnyAdultHead.add(eg);
        });
    }

    updateBunnyStage(stage) {
        this.bunnyStage = stage;
        const isBaby = (stage === 'baby');
        if (this.bunnyBabyGroup) this.bunnyBabyGroup.visible = isBaby;
        if (this.bunnyAdultGroup) this.bunnyAdultGroup.visible = !isBaby;
    }

    updateBunny(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.bunnyStage === 'baby');
        const isWalking = (this.autonomy && this.autonomy.state === 'walking');
        const isBinky = (this.currentState === 'happy' || this.currentState === 'bunny_binky');

        // 兔子標誌性高頻小粉鼻抽動 (Twitching Nose)
        const noseTwitch = 1.0 + Math.sin(t * 18.0) * 0.18;
        if (this.bunnyBabyNose) this.bunnyBabyNose.scale.setScalar(noseTwitch);
        if (this.bunnyAdultNose) this.bunnyAdultNose.scale.setScalar(noseTwitch);

        if (isBaby) {
            if (isBinky) {
                const hop = Math.abs(Math.sin(t * 10.5));
                this.bunnyBabyGroup.position.y = 0.34 + hop * 0.38;
                this.bunnyBabyGroup.rotation.y = Math.sin(t * 10.5) * 0.32;
                this.bunnyBabyEarL.rotation.z = -0.55 - hop * 0.45;
                this.bunnyBabyEarR.rotation.z = 0.55 + hop * 0.45;
            } else if (isWalking) {
                const hop = Math.abs(Math.sin(t * 8.5));
                this.bunnyBabyGroup.position.y = 0.34 + hop * 0.16;
                this.bunnyBabyGroup.rotation.y = 0;
            } else {
                this.bunnyBabyGroup.position.y = 0.34 + Math.sin(t * 2.5) * 0.015;
                this.bunnyBabyGroup.rotation.y = 0;
                this.bunnyBabyHead.rotation.z = Math.sin(t * 1.6) * 0.06;
                this.bunnyBabyEarL.rotation.z = -0.18 + Math.sin(t * 2.2) * 0.05;
                this.bunnyBabyEarR.rotation.z = 0.18 - Math.sin(t * 2.2) * 0.05;
            }
        } else {
            if (isBinky) {
                // 兔子快樂扭腰旋轉跳 (Bunny Binky Jump)！
                const hop = Math.abs(Math.sin(t * 9.5));
                this.bunnyAdultGroup.position.y = 0.44 + hop * 0.46;
                this.bunnyAdultGroup.rotation.y = Math.sin(t * 9.5) * 0.38;
                this.bunnyAdultEarL.rotation.z = -0.6 - hop * 0.5;
                this.bunnyAdultEarR.rotation.z = 0.6 + hop * 0.5;
            } else if (isWalking) {
                const hop = Math.abs(Math.sin(t * 8.0));
                this.bunnyAdultGroup.position.y = 0.44 + hop * 0.18;
                this.bunnyAdultGroup.rotation.y = 0;
            } else {
                this.bunnyAdultGroup.position.y = 0.44 + Math.sin(t * 2.2) * 0.018;
                this.bunnyAdultGroup.rotation.y = 0;
                this.bunnyAdultHead.rotation.z = Math.sin(t * 1.4) * 0.06;
                this.bunnyAdultEarL.rotation.z = -0.16 + Math.sin(t * 2.0) * 0.05;
                this.bunnyAdultEarR.rotation.z = 0.16 - Math.sin(t * 2.0) * 0.05;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🦁 20. 非洲萬獸之王獅子 (African Lion) — 雙階段：辛巴小幼獅 vs 榮耀石大鬃毛獅王
    // ═══════════════════════════════════════════════════════════════════════════
    buildLionMesh() {
        this.lionStage = 'baby';
        this.lionGroup = new THREE.Group();
        this.root.add(this.lionGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.58, 0);
        this.lionGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.22, 0.42);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildLionBabyMesh();
        this.buildLionAdultMesh();
        this.updateLionStage('baby');
    }

    buildLionBabyMesh() {
        this.lionBabyGroup = new THREE.Group();
        this.lionBabyGroup.position.set(0, 0.44, 0);
        this.lionGroup.add(this.lionBabyGroup);

        // 金黃幼獅靈動健美身軀（減肥修身，活力充沛小辛巴）
        const bodyGeo = new THREE.SphereGeometry(0.28, 20, 16);
        bodyGeo.scale(0.85, 0.88, 1.22);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.matLionGold);
        bodyMesh.castShadow = true;
        this.lionBabyGroup.add(bodyMesh);

        const babyBelly = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 14), this.matLionCream);
        babyBelly.scale.set(0.70, 0.68, 1.05);
        babyBelly.position.set(0, -0.05, 0.02);
        this.lionBabyGroup.add(babyBelly);

        // 辛巴圓滾滾大頭與大圓耳
        this.lionBabyHead = new THREE.Group();
        this.lionBabyHead.name = 'LionBabyHead';
        this.lionBabyHead.position.set(0, 0.24, 0.32);
        this.lionBabyGroup.add(this.lionBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 18), this.matLionGold);
        headMesh.castShadow = true;
        this.lionBabyHead.add(headMesh);

        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), this.matLionCream);
        muzzle.scale.set(1.12, 0.85, 0.95);
        muzzle.position.set(0, -0.05, 0.20);
        this.lionBabyHead.add(muzzle);

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 10), this.matBunnyPink);
        nose.position.set(0, 0.0, 0.29);
        this.lionBabyHead.add(nose);

        [-0.10, 0.10].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.matLionEye);
            eye.position.set(ex, 0.05, 0.22);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.023, 10, 10), this.matPupil);
            pupil.position.set(ex, 0.05, 0.25);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), this.matLionGold);
            ear.scale.set(1.0, 1.0, 0.5);
            ear.position.set(ex * 2.1, 0.20, -0.02);
            this.lionBabyHead.add(eye, pupil, ear);
        });

        // 幼獅靈巧四肢與絨毛球尾尖
        this.lionBabyLegs = [];
        [[-0.13, 0.20], [0.13, 0.20], [-0.13, -0.20], [0.13, -0.20]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.34, 12), this.matLionGold);
            leg.position.set(lx, -0.22, lz);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 10), this.matLionGold);
            paw.scale.set(1.05, 0.55, 1.20);
            paw.position.set(lx, -0.36, lz + 0.02);
            this.lionBabyGroup.add(leg, paw);
            this.lionBabyLegs.push(leg);
        });

        this.lionBabyTail = new THREE.Group();
        this.lionBabyTail.position.set(0, 0.06, -0.38);
        const tailRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.40, 10), this.matLionGold);
        tailRod.rotation.x = 0.85;
        tailRod.position.set(0, 0.10, -0.14);
        const tailTuft = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matLionManeDark);
        tailTuft.position.set(0, 0.22, -0.28);
        this.lionBabyTail.add(tailRod, tailTuft);
        this.lionBabyGroup.add(this.lionBabyTail);
    }

    buildLionAdultMesh() {
        this.lionAdultGroup = new THREE.Group();
        this.lionGroup.add(this.lionAdultGroup);

        // 雄獅王者身軀（全面修身減肥・健美俐落流線型體態）
        this.lionAdultBody = new THREE.Group();
        this.lionAdultBody.position.set(0, 0.58, 0);
        this.lionAdultGroup.add(this.lionAdultBody);

        // 1. 寬厚雄健深胸 (Muscular Deep Chest — 保持獅王霸氣力量)
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.35, 22, 18), this.matLionGold);
        chest.scale.set(0.86, 1.06, 1.04);
        chest.position.set(0, 0.05, 0.16);
        chest.castShadow = true;
        this.lionAdultBody.add(chest);

        // 2. 俐落緊緻的收腰與腹線 (Athletic Tucked-in Waist & Flank — 告別水桶圓肚！)
        const waist = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), this.matLionGold);
        waist.scale.set(0.66, 0.82, 0.95);
        waist.position.set(0, 0.07, -0.06);
        waist.castShadow = true;
        this.lionAdultBody.add(waist);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), this.matLionCream);
        belly.scale.set(0.60, 0.66, 0.95);
        belly.position.set(0, -0.03, 0.03);
        this.lionAdultBody.add(belly);

        // 3. 結實敏捷後臀 (Lean Athletic Hips)
        const hips = new THREE.Mesh(new THREE.SphereGeometry(0.31, 20, 18), this.matLionGold);
        hips.scale.set(0.74, 0.92, 0.95);
        hips.position.set(0, 0.06, -0.29);
        hips.castShadow = true;
        this.lionAdultBody.add(hips);

        // 4. 肩頸後背貼身披肩式鬃毛 (Sleek Flowing Shoulder Mantle — 修身緊貼，不臃腫龐雜)
        const mantleGroup = new THREE.Group();
        mantleGroup.position.set(0, 0.16, 0.28);
        this.lionAdultBody.add(mantleGroup);

        [
            [0, 0.12, -0.05, -0.45, 0, 0, 1.15, 0.95, 1.25, true],
            [-0.20, 0.04, -0.02, -0.35, -0.20, -0.15, 0.95, 1.10, 1.15, true],
            [0.20, 0.04, -0.02, -0.35, 0.20, 0.15, 0.95, 1.10, 1.15, true],
            [-0.24, -0.06, 0.06, -0.20, -0.25, -0.10, 0.90, 1.15, 1.05, false],
            [0.24, -0.06, 0.06, -0.20, 0.25, 0.10, 0.90, 1.15, 1.05, false],
            [0, 0.18, 0.06, -0.30, 0, 0, 1.05, 0.85, 1.10, false],
            [-0.16, 0.10, 0.10, -0.25, -0.12, 0, 0.88, 0.95, 0.98, false],
            [0.16, 0.10, 0.10, -0.25, 0.12, 0, 0.88, 0.95, 0.98, false]
        ].forEach(([px, py, pz, rx, ry, rz, sx, sy, sz, isDark]) => {
            const tuft = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 14, 12),
                isDark ? this.matLionManeDark : this.matLionManeGold
            );
            tuft.scale.set(sx, sy, sz);
            tuft.position.set(px, py, pz);
            tuft.rotation.set(rx, ry, rz);
            tuft.castShadow = true;
            mantleGroup.add(tuft);
        });

        // 5. 雄獅頭部與威風凜凜的「盾型瀑布王者鬃毛」（非甜甜圈、修身俊美）
        this.lionAdultHead = new THREE.Group();
        this.lionAdultHead.name = 'LionAdultHead';
        this.lionAdultHead.position.set(0, 0.25, 0.46);
        this.lionAdultBody.add(this.lionAdultHead);

        // 5.1 額頂向後梳展的逆立冠鬃 (Crown Mane)
        for (let i = -2; i <= 2; i++) {
            const crownTuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 7), this.matLionManeGold);
            crownTuft.rotation.x = -Math.PI / 2 - 0.42;
            crownTuft.rotation.z = -i * 0.18;
            crownTuft.position.set(i * 0.08, 0.24 - Math.abs(i) * 0.025, 0.05 - Math.abs(i) * 0.035);
            this.lionAdultHead.add(crownTuft);

            const crownDark = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 7), this.matLionManeDark);
            crownDark.rotation.x = -Math.PI / 2 - 0.50;
            crownDark.rotation.z = -i * 0.18;
            crownDark.position.set(i * 0.095, 0.26 - Math.abs(i) * 0.025, -0.02 - Math.abs(i) * 0.035);
            this.lionAdultHead.add(crownDark);
        }

        // 5.2 圓潤雄獅耳朵（從鬃毛兩側自然探出，帶黑褐色耳背）
        [-1, 1].forEach(side => {
            const earRim = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), this.matLionManeDark);
            earRim.scale.set(1.0, 1.05, 0.45);
            earRim.position.set(side * 0.22, 0.20, 0.02);

            const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), this.matLionCream);
            earInner.scale.set(0.9, 0.95, 0.4);
            earInner.position.set(side * 0.22, 0.20, 0.05);

            this.lionAdultHead.add(earRim, earInner);
        });

        // 5.3 臉頰兩側自然垂順的俊美長鬢毛 (Cheek Cascades)
        [-1, 1].forEach(side => {
            [
                [side * 0.24, 0.09, 0.05, 0.15, side * 0.25],
                [side * 0.26, -0.02, 0.07, 0.16, side * 0.18],
                [side * 0.24, -0.13, 0.09, 0.16, side * 0.08],
                [side * 0.19, -0.22, 0.10, 0.15, -side * 0.05]
            ].forEach(([cx, cy, cz, cr, rz]) => {
                const cheekTuftDark = new THREE.Mesh(new THREE.SphereGeometry(cr, 12, 10), this.matLionManeDark);
                cheekTuftDark.scale.set(1.10, 1.40, 0.90);
                cheekTuftDark.position.set(cx * 1.05, cy, cz - 0.03);
                cheekTuftDark.rotation.z = rz;

                const cheekTuftGold = new THREE.Mesh(new THREE.SphereGeometry(cr * 0.88, 12, 10), this.matLionManeGold);
                cheekTuftGold.scale.set(1.05, 1.30, 0.85);
                cheekTuftGold.position.set(cx, cy, cz);
                cheekTuftGold.rotation.z = rz;

                this.lionAdultHead.add(cheekTuftDark, cheekTuftGold);
            });
        });

        // 5.4 胸前瀑布式垂落深長大胸鬃 (Chest Bib / Dewlap — 俐落垂墜，修長氣派)
        [
            // 下巴喉部上層
            [0, -0.14, 0.16, 0.14, 1.10, 1.10, 0.95, false],
            [-0.08, -0.16, 0.15, 0.13, 0.95, 1.20, 0.90, false],
            [0.08, -0.16, 0.15, 0.13, 0.95, 1.20, 0.90, false],
            // 喉部中層延伸
            [0, -0.25, 0.16, 0.16, 1.05, 1.40, 0.90, true],
            [-0.10, -0.27, 0.14, 0.14, 1.0, 1.45, 0.85, true],
            [0.10, -0.27, 0.14, 0.14, 1.0, 1.45, 0.85, true],
            // 胸前垂墜鬃尖（直達前腿間）
            [0, -0.36, 0.15, 0.17, 1.0, 1.55, 0.80, true],
            [0, -0.44, 0.12, 0.14, 0.85, 1.45, 0.70, true]
        ].forEach(([bx, by, bz, br, sx, sy, sz, isDark]) => {
            const bibTuft = new THREE.Mesh(
                new THREE.SphereGeometry(br, 14, 12),
                isDark ? this.matLionManeDark : this.matLionManeGold
            );
            bibTuft.scale.set(sx, sy, sz);
            bibTuft.position.set(bx, by, bz);
            bibTuft.castShadow = true;
            this.lionAdultHead.add(bibTuft);
        });

        // 5.5 雄獅頭部五官（寬闊獅鼻、奶油吻部與威嚴金眸）
        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 18), this.matLionGold);
        aHead.position.z = 0.07;
        aHead.castShadow = true;
        this.lionAdultHead.add(aHead);

        const aMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 14), this.matLionCream);
        aMuzzle.scale.set(1.15, 0.90, 1.05);
        aMuzzle.position.set(0, -0.05, 0.27);
        this.lionAdultHead.add(aMuzzle);

        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), this.matNose);
        aNose.position.set(0, 0.02, 0.38);
        this.lionAdultHead.add(aNose);

        [-0.11, 0.11].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), this.matLionEye);
            eye.position.set(ex, 0.065, 0.29);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), this.matPupil);
            pupil.position.set(ex, 0.065, 0.32);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), this.matShine);
            shine.position.set(ex - 0.011, 0.078, 0.335);
            this.lionAdultHead.add(eye, pupil, shine);
        });

        // 6. 雄獅矯健四肢（精緻收腿、肌肉線條分明、平穩踏地）
        this.lionAdultLegs = [];
        [
            [-0.18, 0.28], [0.18, 0.28],
            [-0.16, -0.28], [0.16, -0.28]
        ].forEach(([lx, lz]) => {
            const p = new THREE.Group();
            p.position.set(lx, -0.15, lz);
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.078, 0.40, 12), this.matLionGold);
            leg.position.y = -0.18;
            leg.castShadow = true;
            // 雄獅敏捷大爪掌
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), this.matLionGold);
            paw.scale.set(1.08, 0.55, 1.22);
            paw.position.set(0, -0.36, 0.04);
            paw.castShadow = true;
            p.add(leg, paw);
            this.lionAdultBody.add(p);
            this.lionAdultLegs.push(p);
        });

        // 7. 獅王招牌修長黑褐絨毛長尾
        this.lionAdultTail = new THREE.Group();
        this.lionAdultTail.position.set(0, 0.08, -0.52);
        const aTailRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.60, 10), this.matLionGold);
        aTailRod.rotation.x = 0.78;
        aTailRod.position.set(0, 0.14, -0.22);
        const aTailTuft = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), this.matLionManeDark);
        aTailTuft.scale.set(1.0, 1.25, 1.0);
        aTailTuft.position.set(0, 0.32, -0.44);
        this.lionAdultTail.add(aTailRod, aTailTuft);
        this.lionAdultBody.add(this.lionAdultTail);
    }

    updateLionStage(stage) {
        this.lionStage = stage;
        const isBaby = (stage === 'baby');
        if (this.lionBabyGroup) this.lionBabyGroup.visible = isBaby;
        if (this.lionAdultGroup) this.lionAdultGroup.visible = !isBaby;
    }

    updateLion(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.lionStage === 'baby');
        const isWalking = (this.autonomy && this.autonomy.state === 'walking');
        const isRoaring = (this.currentState === 'happy');

        if (isBaby) {
            const walkSin = isWalking ? Math.sin(t * 9.0) * 0.35 : 0;
            this.lionBabyLegs.forEach((leg, i) => {
                leg.rotation.x = (i === 0 || i === 3) ? walkSin : -walkSin;
            });
            this.lionBabyTail.rotation.z = Math.sin(t * (isRoaring ? 10 : 3.2)) * 0.28;
            if (isRoaring) {
                this.lionBabyGroup.position.y = 0.44 + Math.abs(Math.sin(t * 8.5)) * 0.15;
                this.lionBabyHead.rotation.x = -0.25 + Math.sin(t * 14) * 0.08;
            } else {
                this.lionBabyGroup.position.y = 0.44 + Math.sin(t * 2.5) * 0.015;
                this.lionBabyHead.rotation.x = Math.sin(t * 1.6) * 0.05;
                this.lionBabyHead.rotation.y = Math.sin(t * 1.2) * 0.14;
            }
        } else {
            const lf = this.autonomy ? this.autonomy.lieDownFactor : 0;
            const walkSin = isWalking ? Math.sin(t * 7.5) * 0.35 : 0;
            this.lionAdultLegs.forEach((leg, i) => {
                if (isWalking) {
                    leg.rotation.x = (i === 0 || i === 3) ? walkSin : -walkSin;
                } else if (lf > 0.05) {
                    leg.rotation.x = (i < 2) ? THREE.MathUtils.lerp(0, 0.85, lf) : THREE.MathUtils.lerp(0, -0.95, lf);
                } else {
                    leg.rotation.x = 0;
                }
            });
            this.lionAdultTail.rotation.z = Math.sin(t * (isRoaring ? 8.5 : 2.4)) * 0.25;
            if (isRoaring) {
                // 萬獸之王昂首獅吼！雄偉鬃毛隨吼聲震動！
                this.lionAdultBody.position.y = 0.60 + Math.abs(Math.sin(t * 6.5)) * 0.12;
                this.lionAdultHead.rotation.x = -0.32 + Math.sin(t * 22) * 0.05;
                this.lionAdultHead.scale.setScalar(1.0 + Math.sin(t * 24) * 0.04);
            } else if (isWalking) {
                this.lionAdultBody.position.y = 0.60 + Math.abs(Math.sin(t * 7.5 * 2)) * 0.04;
                this.lionAdultHead.rotation.x = Math.sin(t * 7.5 * 2) * 0.04;
                this.lionAdultHead.rotation.y = Math.sin(t * 7.5) * 0.08;
                this.lionAdultHead.scale.setScalar(1.0);
            } else {
                this.lionAdultBody.position.y = THREE.MathUtils.lerp(0.60, 0.38, lf) + Math.sin(t * 2.0) * 0.018;
                this.lionAdultHead.rotation.x = Math.sin(t * 1.4) * 0.05;
                this.lionAdultHead.rotation.y = Math.sin(t * 0.9) * 0.16;
                this.lionAdultHead.scale.setScalar(1.0);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🐼 21. 四川大熊貓 (Giant Panda) — 雙階段：趴趴糯米糰小團子 vs 啃翠竹打滾國寶貓熊
    // ═══════════════════════════════════════════════════════════════════════════
    buildPandaMesh() {
        this.pandaStage = 'baby';
        this.pandaGroup = new THREE.Group();
        this.root.add(this.pandaGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.52, 0);
        this.pandaGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.25, 0.22);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildPandaBabyMesh();
        this.buildPandaAdultMesh();
        this.updatePandaStage('baby');
    }

    buildPandaBabyMesh() {
        this.pandaBabyGroup = new THREE.Group();
        this.pandaBabyGroup.position.set(0, 0.34, 0);
        this.pandaGroup.add(this.pandaBabyGroup);

        // 圓滾滾黑白芝麻湯圓幼崽身軀
        const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 22, 18), this.matPandaWhite);
        bodyMesh.scale.set(1.05, 0.88, 1.18);
        bodyMesh.castShadow = true;
        this.pandaBabyGroup.add(bodyMesh);

        // 黑色小馬甲肩帶
        const saddle = new THREE.Mesh(new THREE.SphereGeometry(0.355, 20, 16), this.matPandaBlack);
        saddle.scale.set(1.07, 0.85, 0.52);
        saddle.position.set(0, 0.02, 0.16);
        this.pandaBabyGroup.add(saddle);

        // 呆萌圓臉大頭與八字黑眼圈、黑圓耳
        this.pandaBabyHead = new THREE.Group();
        this.pandaBabyHead.name = 'PandaBabyHead';
        this.pandaBabyHead.position.set(0, 0.24, 0.32);
        this.pandaBabyGroup.add(this.pandaBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), this.matPandaWhite);
        headMesh.scale.set(1.12, 0.98, 0.98);
        headMesh.castShadow = true;
        this.pandaBabyHead.add(headMesh);

        [-0.22, 0.22].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), this.matPandaBlack);
            ear.scale.set(1.0, 1.0, 0.55);
            ear.position.set(ex, 0.22, -0.02);
            this.pandaBabyHead.add(ear);
        });

        [-0.105, 0.105].forEach((px, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const patch = new THREE.Mesh(new THREE.SphereGeometry(0.082, 14, 12), this.matPandaBlack);
            patch.scale.set(1.0, 1.25, 0.45);
            patch.rotation.z = dir * 0.35;
            patch.position.set(px, 0.03, 0.22);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), this.matNose);
            eye.position.set(px, 0.04, 0.25);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine.position.set(px - 0.01, 0.055, 0.27);
            this.pandaBabyHead.add(patch, eye, shine);
        });

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.matNose);
        nose.scale.set(1.2, 0.85, 0.9);
        nose.position.set(0, -0.02, 0.27);
        this.pandaBabyHead.add(nose);

        // 四隻短短黑肉爪
        [[-0.22, 0.20], [0.22, 0.20], [-0.20, -0.22], [0.20, -0.22]].forEach(([lx, lz]) => {
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.matPandaBlack);
            paw.scale.set(0.95, 0.75, 1.2);
            paw.position.set(lx, -0.22, lz);
            this.pandaBabyGroup.add(paw);
        });
    }

    buildPandaAdultMesh() {
        this.pandaAdultGroup = new THREE.Group();
        this.pandaGroup.add(this.pandaAdultGroup);

        // 身旁翠竹叢
        [-0.58, -0.46].forEach((bx, idx) => {
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 1.25 - idx * 0.2, 10), this.matEucalyptusLeaf);
            stalk.position.set(bx, 0.6, -0.18 + idx * 0.12);
            this.pandaAdultGroup.add(stalk);
        });

        // 坐姿啃竹子圓滾滾大熊貓主體 (支援前滾翻打滾動畫！)
        this.pandaAdultBody = new THREE.Group();
        this.pandaAdultBody.position.set(0, 0.52, 0);
        this.pandaAdultGroup.add(this.pandaAdultBody);

        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 20), this.matPandaWhite);
        aBody.scale.set(1.08, 1.05, 0.98);
        aBody.castShadow = true;
        this.pandaAdultBody.add(aBody);

        const aSaddle = new THREE.Mesh(new THREE.SphereGeometry(0.465, 22, 18), this.matPandaBlack);
        aSaddle.scale.set(1.1, 0.48, 0.98);
        aSaddle.position.set(0, 0.22, 0);
        this.pandaAdultBody.add(aSaddle);

        this.pandaAdultHead = new THREE.Group();
        this.pandaAdultHead.name = 'PandaAdultHead';
        this.pandaAdultHead.position.set(0, 0.48, 0.10);
        this.pandaAdultBody.add(this.pandaAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20), this.matPandaWhite);
        aHead.scale.set(1.15, 0.98, 0.98);
        aHead.castShadow = true;
        this.pandaAdultHead.add(aHead);

        [-0.27, 0.27].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), this.matPandaBlack);
            ear.scale.set(1.0, 1.0, 0.55);
            ear.position.set(ex, 0.26, -0.02);
            this.pandaAdultHead.add(ear);
        });

        [-0.125, 0.125].forEach((px, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const patch = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), this.matPandaBlack);
            patch.scale.set(1.0, 1.28, 0.45);
            patch.rotation.z = dir * 0.35;
            patch.position.set(px, 0.04, 0.27);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), this.matNose);
            eye.position.set(px, 0.05, 0.31);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), this.matShine);
            shine.position.set(px - 0.01, 0.065, 0.33);
            this.pandaAdultHead.add(patch, eye, shine);
        });

        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), this.matNose);
        aNose.scale.set(1.2, 0.85, 0.9);
        aNose.position.set(0, -0.02, 0.33);
        this.pandaAdultHead.add(aNose);

        // 手握鮮嫩翠竹與圓厚黑掌
        this.pandaBambooStick = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.58, 10), this.matEucalyptusLeaf);
        this.pandaBambooStick.rotation.z = 0.65;
        this.pandaBambooStick.position.set(0.05, 0.18, 0.42);
        this.pandaAdultBody.add(this.pandaBambooStick);

        [-0.26, 0.26].forEach(ax => {
            const arm = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), this.matPandaBlack);
            arm.scale.set(0.85, 1.45, 0.85);
            arm.position.set(ax, 0.14, 0.32);
            arm.rotation.z = ax < 0 ? -0.45 : 0.45;
            const leg = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), this.matPandaBlack);
            leg.scale.set(0.95, 0.85, 1.35);
            leg.position.set(ax * 1.1, -0.32, 0.28);
            this.pandaAdultBody.add(arm, leg);
        });
    }

    updatePandaStage(stage) {
        this.pandaStage = stage;
        const isBaby = (stage === 'baby');
        if (this.pandaBabyGroup) this.pandaBabyGroup.visible = isBaby;
        if (this.pandaAdultGroup) this.pandaAdultGroup.visible = !isBaby;
    }

    updatePanda(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.pandaStage === 'baby');
        const isRolling = (this.currentState === 'happy' || this.currentState === 'panda_roll');

        if (isBaby) {
            if (isRolling) {
                this.pandaBabyGroup.position.y = 0.36 + Math.abs(Math.sin(t * 7)) * 0.16;
                this.pandaBabyGroup.rotation.z = Math.sin(t * 7) * 0.35;
            } else {
                this.pandaBabyGroup.position.y = 0.34 + Math.sin(t * 2.4) * 0.015;
                this.pandaBabyGroup.rotation.z = 0;
                this.pandaBabyHead.rotation.z = Math.sin(t * 1.8) * 0.08;
                this.pandaBabyHead.rotation.y = Math.sin(t * 1.2) * 0.14;
            }
        } else {
            if (isRolling) {
                // 國寶大熊貓招牌前滾翻滾球特技！
                this.pandaAdultBody.rotation.x = t * 5.2;
                this.pandaAdultBody.position.y = 0.52 + Math.abs(Math.sin(t * 5.2)) * 0.14;
            } else {
                this.pandaAdultBody.rotation.x = 0;
                this.pandaAdultBody.position.y = 0.52 + Math.sin(t * 2.0) * 0.018;
                this.pandaAdultHead.rotation.z = Math.sin(t * 2.6) * 0.06;
                this.pandaAdultHead.rotation.x = Math.sin(t * 5.2) * 0.04; // 嚼竹子律動
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🦊 22. 撒哈拉耳廓狐 (Fennec Fox) — 雙階段：巴掌大大耳幼狐 vs 沙丘雷達大耳精靈
    // ═══════════════════════════════════════════════════════════════════════════
    buildFennecMesh() {
        this.fennecStage = 'baby';
        this.fennecGroup = new THREE.Group();
        this.root.add(this.fennecGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.45, 0);
        this.fennecGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.18, 0.28);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildFennecBabyMesh();
        this.buildFennecAdultMesh();
        this.updateFennecStage('baby');
    }

    buildFennecBabyMesh() {
        this.fennecBabyGroup = new THREE.Group();
        this.fennecBabyGroup.position.set(0, 0.36, 0);
        this.fennecGroup.add(this.fennecBabyGroup);

        const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 18), this.matFennecCream);
        bodyMesh.scale.set(0.88, 0.88, 1.25);
        bodyMesh.castShadow = true;
        this.fennecBabyGroup.add(bodyMesh);

        this.fennecBabyHead = new THREE.Group();
        this.fennecBabyHead.name = 'FennecBabyHead';
        this.fennecBabyHead.position.set(0, 0.22, 0.28);
        this.fennecBabyGroup.add(this.fennecBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 18), this.matFennecCream);
        headMesh.castShadow = true;
        this.fennecBabyHead.add(headMesh);

        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 12), this.matBunnyWhite);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.04, 0.24);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), this.matNose);
        nose.position.set(0, -0.02, 0.34);
        this.fennecBabyHead.add(snout, nose);

        [-0.095, 0.095].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), this.matNose);
            eye.position.set(ex, 0.03, 0.20);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.045, 0.23);
            this.fennecBabyHead.add(eye, shine);
        });

        // 標誌性超巨型招風大耳 (Giant Fennec Radar Ears)
        this.fennecBabyEarL = new THREE.Group();
        this.fennecBabyEarL.name = 'FennecBabyEarL';
        this.fennecBabyEarL.position.set(-0.14, 0.16, 0);
        this.fennecBabyEarR = new THREE.Group();
        this.fennecBabyEarR.name = 'FennecBabyEarR';
        this.fennecBabyEarR.position.set(0.14, 0.16, 0);

        [this.fennecBabyEarL, this.fennecBabyEarR].forEach((eg, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const outer = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.46, 14), this.matFennecCream);
            outer.scale.set(0.85, 1.0, 0.38);
            outer.position.set(dir * 0.12, 0.18, 0);
            outer.rotation.z = dir * -0.48;
            const inner = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 12), this.matInnerEar);
            inner.scale.set(0.8, 1.0, 0.3);
            inner.position.set(dir * 0.12, 0.16, 0.02);
            inner.rotation.z = dir * -0.48;
            eg.add(outer, inner);
            this.fennecBabyHead.add(eg);
        });

        // 蓬鬆黑尖尾巴
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), this.matFennecCream);
        tail.scale.set(0.75, 0.75, 2.2);
        tail.position.set(0, 0.02, -0.42);
        this.fennecBabyGroup.add(tail);
    }

    buildFennecAdultMesh() {
        this.fennecAdultGroup = new THREE.Group();
        this.fennecGroup.add(this.fennecAdultGroup);

        this.fennecBody = new THREE.Group();
        this.fennecBody.position.set(0, 0.46, 0);
        this.fennecAdultGroup.add(this.fennecBody);

        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.34, 22, 18), this.matFennecCream);
        aBody.scale.set(0.88, 0.90, 1.35);
        aBody.castShadow = true;
        this.fennecBody.add(aBody);

        this.fennecAdultHead = new THREE.Group();
        this.fennecAdultHead.name = 'FennecAdultHead';
        this.fennecAdultHead.position.set(0, 0.28, 0.38);
        this.fennecBody.add(this.fennecAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 18), this.matFennecCream);
        aHead.castShadow = true;
        this.fennecAdultHead.add(aHead);

        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.24, 12), this.matBunnyWhite);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.04, 0.28);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.matNose);
        nose.position.set(0, -0.02, 0.39);
        this.fennecAdultHead.add(snout, nose);

        [-0.105, 0.105].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), this.matNose);
            eye.position.set(ex, 0.04, 0.23);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
            shine.position.set(ex - 0.01, 0.055, 0.26);
            this.fennecAdultHead.add(eye, shine);
        });

        this.fennecAdultEarL = new THREE.Group();
        this.fennecAdultEarL.name = 'FennecAdultEarL';
        this.fennecAdultEarL.position.set(-0.16, 0.18, 0);
        this.fennecAdultEarR = new THREE.Group();
        this.fennecAdultEarR.name = 'FennecAdultEarR';
        this.fennecAdultEarR.position.set(0.16, 0.18, 0);

        [this.fennecAdultEarL, this.fennecAdultEarR].forEach((eg, idx) => {
            const dir = idx === 0 ? -1 : 1;
            const outer = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.56, 16), this.matFennecSand);
            outer.scale.set(0.88, 1.0, 0.38);
            outer.position.set(dir * 0.15, 0.22, 0);
            outer.rotation.z = dir * -0.45;
            const inner = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.44, 12), this.matBunnyWhite);
            inner.scale.set(0.82, 1.0, 0.32);
            inner.position.set(dir * 0.15, 0.20, 0.02);
            inner.rotation.z = dir * -0.45;
            eg.add(outer, inner);
            this.fennecAdultHead.add(eg);
        });

        // 纖細四肢與黑尖大蓬尾
        this.fennecLegs = [];
        [[-0.14, 0.24], [0.14, 0.24], [-0.14, -0.24], [0.14, -0.24]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.38, 10), this.matFennecCream);
            leg.position.set(lx, -0.26, lz);
            this.fennecBody.add(leg);
            this.fennecLegs.push(leg);
        });

        const aTail = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 14), this.matFennecSand);
        aTail.scale.set(0.8, 0.8, 2.5);
        aTail.position.set(0, 0.05, -0.56);
        this.fennecBody.add(aTail);
    }

    updateFennecStage(stage) {
        this.fennecStage = stage;
        const isBaby = (stage === 'baby');
        if (this.fennecBabyGroup) this.fennecBabyGroup.visible = isBaby;
        if (this.fennecAdultGroup) this.fennecAdultGroup.visible = !isBaby;
    }

    updateFennec(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.fennecStage === 'baby');
        const isHappy = (this.currentState === 'happy' || this.currentState === 'fennec_pounce');

        // 超大雷達耳靈敏轉動
        const earWave = Math.sin(t * (isHappy ? 14 : 3.5)) * 0.18;
        if (this.fennecBabyEarL) this.fennecBabyEarL.rotation.z = earWave;
        if (this.fennecBabyEarR) this.fennecBabyEarR.rotation.z = -earWave;
        if (this.fennecAdultEarL) this.fennecAdultEarL.rotation.z = earWave;
        if (this.fennecAdultEarR) this.fennecAdultEarR.rotation.z = -earWave;

        if (isBaby) {
            this.fennecBabyGroup.position.y = 0.36 + (isHappy ? Math.abs(Math.sin(t * 10)) * 0.25 : Math.sin(t * 2.5) * 0.015);
            this.fennecBabyHead.rotation.z = Math.sin(t * 2.0) * 0.1;
        } else {
            this.fennecBody.position.y = 0.46 + (isHappy ? Math.abs(Math.sin(t * 9.5)) * 0.32 : Math.sin(t * 2.2) * 0.018);
            this.fennecAdultHead.rotation.z = Math.sin(t * 1.8) * 0.08;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🦒 23. 非洲長頸鹿 (Giraffe) — 雙階段：呆萌絨球角小鹿 vs 優雅高挑網紋長頸鹿
    // ═══════════════════════════════════════════════════════════════════════════
    buildGiraffeMesh() {
        this.giraffeStage = 'baby';
        this.giraffeGroup = new THREE.Group();
        this.root.add(this.giraffeGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.65, 0);
        this.giraffeGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.45, 0.25);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildGiraffeBabyMesh();
        this.buildGiraffeAdultMesh();
        this.updateGiraffeStage('baby');
    }

    buildGiraffeBabyMesh() {
        this.giraffeBabyGroup = new THREE.Group();
        this.giraffeBabyGroup.position.set(0, 0.52, 0);
        this.giraffeGroup.add(this.giraffeBabyGroup);

        const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 18), this.matGiraffeYellow);
        bodyMesh.scale.set(0.85, 0.92, 1.22);
        bodyMesh.castShadow = true;
        this.giraffeBabyGroup.add(bodyMesh);

        // 焦糖網紋圓斑
        [[-0.22, 0.05, 0.08], [0.22, 0.06, -0.05], [-0.18, -0.04, -0.18], [0.20, -0.02, 0.15]].forEach(([sx, sy, sz]) => {
            const spot = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), this.matGiraffeSpot);
            spot.scale.set(0.4, 1.0, 1.1);
            spot.position.set(sx, sy, sz);
            this.giraffeBabyGroup.add(spot);
        });

        // 修長小鹿頸與頭部
        this.giraffeBabyNeck = new THREE.Group();
        this.giraffeBabyNeck.position.set(0, 0.18, 0.24);
        this.giraffeBabyGroup.add(this.giraffeBabyNeck);

        const neckRod = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.52, 14), this.matGiraffeYellow);
        neckRod.position.set(0, 0.22, 0.06);
        neckRod.rotation.x = 0.22;
        this.giraffeBabyNeck.add(neckRod);

        this.giraffeBabyHead = new THREE.Group();
        this.giraffeBabyHead.name = 'GiraffeBabyHead';
        this.giraffeBabyHead.position.set(0, 0.48, 0.14);
        this.giraffeBabyNeck.add(this.giraffeBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 16), this.matGiraffeYellow);
        headMesh.scale.set(0.92, 0.95, 1.28);
        this.giraffeBabyHead.add(headMesh);

        // 頭頂兩根毛茸茸圓球小鹿角 (Ossicones)
        [-0.065, 0.065].forEach(ox => {
            const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), this.matGiraffeYellow);
            horn.position.set(ox, 0.20, -0.02);
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.matGiraffeSpot);
            knob.position.set(ox, 0.26, -0.02);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), this.matGiraffeYellow);
            ear.scale.set(1.6, 0.55, 0.45);
            ear.position.set(ox * 2.6, 0.12, -0.04);
            this.giraffeBabyHead.add(horn, knob, ear);
        });

        [-0.085, 0.085].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), this.matNose);
            eye.position.set(ex, 0.04, 0.16);
            this.giraffeBabyHead.add(eye);
        });

        [[-0.14, 0.20], [0.14, 0.20], [-0.14, -0.20], [0.14, -0.20]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.52, 10), this.matGiraffeYellow);
            leg.position.set(lx, -0.28, lz);
            this.giraffeBabyGroup.add(leg);
        });
    }

    buildGiraffeAdultMesh() {
        this.giraffeAdultGroup = new THREE.Group();
        this.giraffeGroup.add(this.giraffeAdultGroup);

        this.giraffeAdultBody = new THREE.Group();
        this.giraffeAdultBody.position.set(0, 0.76, 0);
        this.giraffeAdultGroup.add(this.giraffeAdultBody);

        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 18), this.matGiraffeYellow);
        aBody.scale.set(0.86, 1.02, 1.28);
        aBody.castShadow = true;
        this.giraffeAdultBody.add(aBody);

        [[-0.28, 0.08, 0.12], [0.28, 0.08, -0.06], [-0.25, -0.05, -0.20], [0.26, -0.04, 0.18], [0, 0.32, -0.1]].forEach(([sx, sy, sz]) => {
            const spot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), this.matGiraffeSpot);
            spot.scale.set(0.45, 1.0, 1.1);
            spot.position.set(sx, sy, sz);
            this.giraffeAdultBody.add(spot);
        });

        // 高挑修長鹿頸
        this.giraffeAdultNeck = new THREE.Group();
        this.giraffeAdultNeck.position.set(0, 0.24, 0.30);
        this.giraffeAdultBody.add(this.giraffeAdultNeck);

        const neckRod = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.16, 0.88, 16), this.matGiraffeYellow);
        neckRod.position.set(0, 0.40, 0.10);
        neckRod.rotation.x = 0.22;
        this.giraffeAdultNeck.add(neckRod);

        this.giraffeAdultHead = new THREE.Group();
        this.giraffeAdultHead.name = 'GiraffeAdultHead';
        this.giraffeAdultHead.position.set(0, 0.84, 0.20);
        this.giraffeAdultNeck.add(this.giraffeAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 16), this.matGiraffeYellow);
        aHead.scale.set(0.90, 0.95, 1.35);
        this.giraffeAdultHead.add(aHead);

        [-0.07, 0.07].forEach(ox => {
            const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8), this.matGiraffeYellow);
            horn.position.set(ox, 0.22, -0.02);
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), this.matGiraffeSpot);
            knob.position.set(ox, 0.30, -0.02);
            this.giraffeAdultHead.add(horn, knob);
        });

        [-0.095, 0.095].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), this.matNose);
            eye.position.set(ex, 0.04, 0.18);
            this.giraffeAdultHead.add(eye);
        });

        [[-0.18, 0.26], [0.18, 0.26], [-0.18, -0.26], [0.18, -0.26]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.048, 0.76, 10), this.matGiraffeYellow);
            leg.position.set(lx, -0.42, lz);
            this.giraffeAdultBody.add(leg);
        });
    }

    updateGiraffeStage(stage) {
        this.giraffeStage = stage;
        const isBaby = (stage === 'baby');
        if (this.giraffeBabyGroup) this.giraffeBabyGroup.visible = isBaby;
        if (this.giraffeAdultGroup) this.giraffeAdultGroup.visible = !isBaby;
    }

    updateGiraffe(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.giraffeStage === 'baby');
        const isHappy = (this.currentState === 'happy');

        if (isBaby) {
            this.giraffeBabyNeck.rotation.z = Math.sin(t * (isHappy ? 6 : 1.6)) * 0.12;
            this.giraffeBabyNeck.rotation.x = isHappy ? Math.sin(t * 7) * 0.25 : 0;
        } else {
            this.giraffeAdultNeck.rotation.z = Math.sin(t * (isHappy ? 5.5 : 1.4)) * 0.12;
            this.giraffeAdultNeck.rotation.x = isHappy ? 0.35 + Math.sin(t * 6) * 0.22 : Math.sin(t * 1.2) * 0.05;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🐻‍❄️ 24. 北極熊 (Polar Bear) — 雙階段：雪白棉花糖小熊崽 vs 北極浮冰雪熊王
    // ═══════════════════════════════════════════════════════════════════════════
    buildPolarBearMesh() {
        this.polarBearStage = 'baby';
        this.polarBearGroup = new THREE.Group();
        this.root.add(this.polarBearGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.55, 0);
        this.polarBearGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.22, 0.35);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        this.buildPolarBearBabyMesh();
        this.buildPolarBearAdultMesh();
        this.updatePolarBearStage('baby');
    }

    buildPolarBearBabyMesh() {
        this.polarBearBabyGroup = new THREE.Group();
        this.polarBearBabyGroup.position.set(0, 0.42, 0);
        this.polarBearGroup.add(this.polarBearBabyGroup);

        const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 18), this.matPolarWhite);
        bodyMesh.scale.set(1.02, 0.95, 1.25);
        bodyMesh.castShadow = true;
        this.polarBearBabyGroup.add(bodyMesh);

        this.polarBearBabyHead = new THREE.Group();
        this.polarBearBabyHead.name = 'PolarBearBabyHead';
        this.polarBearBabyHead.position.set(0, 0.24, 0.36);
        this.polarBearBabyGroup.add(this.polarBearBabyHead);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 18), this.matPolarWhite);
        headMesh.castShadow = true;
        this.polarBearBabyHead.add(headMesh);

        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), this.matPolarWhite);
        snout.scale.set(1.0, 0.85, 1.2);
        snout.position.set(0, -0.04, 0.22);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), this.matNose);
        nose.position.set(0, -0.01, 0.35);
        this.polarBearBabyHead.add(snout, nose);

        [-0.10, 0.10].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), this.matNose);
            eye.position.set(ex, 0.05, 0.23);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), this.matPolarWhite);
            ear.position.set(ex * 2.0, 0.22, -0.02);
            this.polarBearBabyHead.add(eye, ear);
        });

        [[-0.18, 0.24], [0.18, 0.24], [-0.18, -0.24], [0.18, -0.24]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.09, 0.34, 12), this.matPolarWhite);
            leg.position.set(lx, -0.24, lz);
            this.polarBearBabyGroup.add(leg);
        });
    }

    buildPolarBearAdultMesh() {
        this.polarBearAdultGroup = new THREE.Group();
        this.polarBearGroup.add(this.polarBearAdultGroup);

        // 北極晶瑩冰川底座
        this.polarIceBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.08, 0.16, 8), this.matPenguinIce);
        this.polarIceBase.position.y = 0.08;
        this.polarAdultBody = new THREE.Group();
        this.polarAdultBody.position.set(0, 0.68, 0);
        this.polarBearAdultGroup.add(this.polarIceBase, this.polarAdultBody);

        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 20), this.matPolarWhite);
        aBody.scale.set(1.02, 1.02, 1.42);
        aBody.castShadow = true;
        this.polarAdultBody.add(aBody);

        this.polarBearAdultHead = new THREE.Group();
        this.polarBearAdultHead.name = 'PolarBearAdultHead';
        this.polarBearAdultHead.position.set(0, 0.26, 0.56);
        this.polarAdultBody.add(this.polarBearAdultHead);

        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.30, 22, 18), this.matPolarWhite);
        aHead.scale.set(0.96, 0.96, 1.15);
        this.polarBearAdultHead.add(aHead);

        const aSnout = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), this.matPolarWhite);
        aSnout.scale.set(0.95, 0.88, 1.3);
        aSnout.position.set(0, -0.04, 0.28);
        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), this.matNose);
        aNose.position.set(0, 0.0, 0.45);
        this.polarBearAdultHead.add(aSnout, aNose);

        [-0.11, 0.11].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), this.matNose);
            eye.position.set(ex, 0.06, 0.28);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), this.matPolarWhite);
            ear.position.set(ex * 2.1, 0.24, -0.04);
            this.polarBearAdultHead.add(eye, ear);
        });

        [[-0.24, 0.36], [0.24, 0.36], [-0.24, -0.36], [0.24, -0.36]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.52, 12), this.matPolarWhite);
            leg.position.set(lx, -0.34, lz);
            this.polarAdultBody.add(leg);
        });
    }

    updatePolarBearStage(stage) {
        this.polarBearStage = stage;
        const isBaby = (stage === 'baby');
        if (this.polarBearBabyGroup) this.polarBearBabyGroup.visible = isBaby;
        if (this.polarBearAdultGroup) this.polarBearAdultGroup.visible = !isBaby;
    }

    updatePolarBear(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.polarBearStage === 'baby');
        const isHappy = (this.currentState === 'happy');

        if (isBaby) {
            this.polarBearBabyGroup.position.y = 0.42 + (isHappy ? Math.abs(Math.sin(t * 8)) * 0.18 : Math.sin(t * 2.4) * 0.015);
            this.polarBearBabyHead.rotation.z = Math.sin(t * (isHappy ? 7 : 1.6)) * 0.12;
        } else {
            this.polarIceBase.visible = !(this.autonomy && this.autonomy.state === 'walking');
            this.polarAdultBody.position.y = 0.68 + (isHappy ? Math.abs(Math.sin(t * 7)) * 0.16 : Math.sin(t * 2.0) * 0.02);
            this.polarBearAdultHead.rotation.z = Math.sin(t * (isHappy ? 6 : 1.4)) * 0.1;
        }
    }

    // =========================================================================
    //  🐹 25. 黃金倉鼠（Golden Hamster）雙形態 3D 模型（幼鼠抱瓜子 vs 成鼠跑跑滾輪）
    // =========================================================================
    buildHamsterMesh() {
        this.hamsterStage = 'baby';
        this.hamsterGroup = new THREE.Group();
        this.root.add(this.hamsterGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.35, 0);
        this.hamsterGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.15, 0.18);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        // 1. 幼鼠：雙手捧著大葵花籽、塞滿鼓鼓腮幫子的呆萌小倉鼠
        this.hamsterBabyGroup = new THREE.Group();
        this.hamsterBabyGroup.position.set(0, 0.28, 0);
        this.hamsterGroup.add(this.hamsterBabyGroup);

        const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), this.matHamsterGold);
        bBody.scale.set(1.08, 0.98, 1.12);
        bBody.castShadow = true;
        const bBelly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 16), this.matHamsterCream);
        bBelly.scale.set(0.95, 0.92, 0.95);
        bBelly.position.set(0, -0.03, 0.09);
        this.hamsterBabyGroup.add(bBody, bBelly);

        // 粉紅小腳掌與小短尾
        [-0.12, 0.12].forEach(fx => {
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matBunnyPink);
            foot.scale.set(0.9, 0.55, 1.4);
            foot.position.set(fx, -0.24, 0.12);
            this.hamsterBabyGroup.add(foot);
        });
        const bTail = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.matBunnyPink);
        bTail.position.set(0, -0.10, -0.29);
        this.hamsterBabyGroup.add(bTail);

        // 捧著葵花籽的小手手
        const seedMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness: 0.5 });
        const bSeed = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 10), seedMat);
        bSeed.rotation.x = Math.PI;
        bSeed.position.set(0, 0.04, 0.30);
        this.hamsterBabyGroup.add(bSeed);
        [-0.08, 0.08].forEach(px => {
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), this.matBunnyPink);
            paw.position.set(px, 0.04, 0.28);
            this.hamsterBabyGroup.add(paw);
        });

        this.hamsterBabyHead = new THREE.Group();
        this.hamsterBabyHead.name = 'HamsterBabyHead';
        this.hamsterBabyHead.position.set(0, 0.18, 0.15);
        this.hamsterBabyGroup.add(this.hamsterBabyHead);

        const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 18), this.matHamsterGold);
        bHead.scale.set(1.06, 0.95, 0.98);
        this.hamsterBabyHead.add(bHead);

        const bNose = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), this.matBunnyPink);
        bNose.position.set(0, -0.01, 0.24);
        this.hamsterBabyHead.add(bNose);

        [-1, 1].forEach(side => {
            const cx = side * 0.145;
            const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), this.matHamsterCream);
            pouch.scale.set(1.05, 0.9, 0.95);
            pouch.position.set(cx, -0.05, 0.12);
            const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), this.matHamsterGold);
            earOuter.scale.set(1.0, 1.1, 0.45);
            earOuter.position.set(side * 0.17, 0.19, -0.02);
            const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), this.matBunnyPink);
            earInner.scale.set(1.0, 1.1, 0.45);
            earInner.position.set(side * 0.17, 0.19, 0.0);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), this.matNose);
            eye.position.set(side * 0.105, 0.05, 0.20);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine.position.set(side * 0.105 - 0.01, 0.065, 0.23);
            this.hamsterBabyHead.add(pouch, earOuter, earInner, eye, shine);
        });

        // 2. 成鼠：擁有專屬立體支架飛輪與大顆葵花籽的黃金倉鼠王
        this.hamsterAdultGroup = new THREE.Group();
        this.hamsterGroup.add(this.hamsterAdultGroup);

        // 飛輪底座與轉動輪框（含軸心輻條，轉動起來一清二楚！）
        const wheelStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.22, 0.48, 12), this.matHamsterWheel);
        wheelStand.position.set(-0.38, 0.24, -0.26);
        this.hamsterAdultGroup.add(wheelStand);

        this.hamsterWheelPivot = new THREE.Group();
        this.hamsterWheelPivot.position.set(-0.38, 0.48, -0.18);
        const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 14, 32), this.matHamsterWheel);
        this.hamsterWheelPivot.add(wheelRing);
        for (let i = 0; i < 6; i++) {
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.82, 8), this.matHamsterWheel);
            spoke.rotation.z = (i * Math.PI) / 6;
            this.hamsterWheelPivot.add(spoke);
        }
        this.hamsterAdultGroup.add(this.hamsterWheelPivot);

        this.hamsterAdultBody = new THREE.Group();
        this.hamsterAdultBody.position.set(0, 0.36, 0.08);
        this.hamsterAdultGroup.add(this.hamsterAdultBody);
        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.35, 22, 18), this.matHamsterGold);
        aBody.scale.set(1.06, 1.05, 1.15);
        aBody.castShadow = true;
        const aBelly = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 16), this.matHamsterCream);
        aBelly.position.set(0, -0.04, 0.11);
        this.hamsterAdultBody.add(aBody, aBelly);

        [-0.15, 0.15].forEach(fx => {
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 10), this.matBunnyPink);
            foot.scale.set(0.9, 0.55, 1.45);
            foot.position.set(fx, -0.31, 0.14);
            this.hamsterAdultBody.add(foot);
        });
        [-0.10, 0.10].forEach(px => {
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), this.matBunnyPink);
            paw.position.set(px, 0.05, 0.35);
            this.hamsterAdultBody.add(paw);
        });
        const aSeed = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.17, 10), seedMat);
        aSeed.rotation.x = Math.PI;
        aSeed.position.set(0, 0.05, 0.37);
        this.hamsterAdultBody.add(aSeed);

        this.hamsterAdultHead = new THREE.Group();
        this.hamsterAdultHead.name = 'HamsterAdultHead';
        this.hamsterAdultHead.position.set(0, 0.24, 0.20);
        this.hamsterAdultBody.add(this.hamsterAdultHead);
        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 18), this.matHamsterGold);
        aHead.scale.set(1.06, 0.96, 0.98);
        this.hamsterAdultHead.add(aHead);

        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.matBunnyPink);
        aNose.position.set(0, -0.01, 0.28);
        this.hamsterAdultHead.add(aNose);

        [-1, 1].forEach(side => {
            const cx = side * 0.175;
            const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 12), this.matHamsterCream);
            pouch.position.set(cx, -0.05, 0.14);
            const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 10), this.matHamsterGold);
            earOuter.scale.set(1.0, 1.1, 0.45);
            earOuter.position.set(side * 0.20, 0.22, -0.02);
            const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), this.matBunnyPink);
            earInner.scale.set(1.0, 1.1, 0.45);
            earInner.position.set(side * 0.20, 0.22, 0.0);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 12), this.matNose);
            eye.position.set(side * 0.125, 0.06, 0.24);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), this.matShine);
            shine.position.set(side * 0.125 - 0.01, 0.075, 0.275);
            this.hamsterAdultHead.add(pouch, earOuter, earInner, eye, shine);
        });

        this.updateHamsterStage('baby');
    }

    updateHamsterStage(stage) {
        this.hamsterStage = stage;
        const isBaby = (stage === 'baby');
        if (this.hamsterBabyGroup) this.hamsterBabyGroup.visible = isBaby;
        if (this.hamsterAdultGroup) this.hamsterAdultGroup.visible = !isBaby;
    }

    updateHamster(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.hamsterStage === 'baby');
        const isHappy = (this.currentState === 'happy' || this.currentState === 'hamster_wheel');
        if (isBaby) {
            this.hamsterBabyGroup.position.y = 0.28 + (isHappy ? Math.abs(Math.sin(t * 10)) * 0.14 : Math.sin(t * 3.5) * 0.012);
            this.hamsterBabyHead.rotation.z = Math.sin(t * 4.5) * 0.1;
        } else {
            this.hamsterWheelPivot.rotation.z -= delta * (isHappy ? 12.0 : 2.5);
            this.hamsterAdultBody.position.y = 0.36 + (isHappy ? Math.abs(Math.sin(t * 12)) * 0.15 : Math.sin(t * 3.0) * 0.015);
            this.hamsterAdultHead.rotation.z = Math.sin(t * 4.0) * 0.08;
        }
    }

    // =========================================================================
    //  🦔 26. 森林小刺蝟（Hedgehog）雙形態 3D 模型（捲球小刺蝟 vs 頭頂紅蘋果刺蝟）
    // =========================================================================
    buildHedgehogMesh() {
        this.hedgehogStage = 'baby';
        this.hedgehogGroup = new THREE.Group();
        this.root.add(this.hedgehogGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.32, 0);
        this.hedgehogGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.12, 0.22);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        // 輔助函式：在刺蝟背部生成立體層次棘刺簇與小腳掌
        const addHedgehogDetails = (grp, rx, ry, rz, isAdult) => {
            const belly = new THREE.Mesh(new THREE.SphereGeometry(rx * 0.88, 16, 14), this.matHedgehogCream);
            belly.scale.set(0.95, 0.65, 1.08);
            belly.position.set(0, -ry * 0.38, rz * 0.15);
            grp.add(belly);

            // 背部立體棘刺群
            for (let row = 0; row < 4; row++) {
                const zOff = -rz * 0.75 + row * (rz * 0.38);
                const count = 5;
                for (let i = 0; i < count; i++) {
                    const ang = ((i - (count - 1) / 2) / count) * 1.3;
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(isAdult ? 0.045 : 0.036, isAdult ? 0.16 : 0.12, 6), this.matHedgehogQuill);
                    spike.position.set(Math.sin(ang) * rx * 0.88, Math.cos(ang) * ry * 0.85, zOff);
                    spike.rotation.z = -ang * 0.85;
                    spike.rotation.x = -0.48;
                    grp.add(spike);
                }
            }

            // 粉嫩四隻小短腳
            [[-rx * 0.55, rz * 0.45], [rx * 0.55, rz * 0.45], [-rx * 0.55, -rz * 0.35], [rx * 0.55, -rz * 0.35]].forEach(([px, pz]) => {
                const paw = new THREE.Mesh(new THREE.SphereGeometry(isAdult ? 0.058 : 0.045, 10, 10), this.matBunnyPink);
                paw.scale.set(0.9, 0.6, 1.3);
                paw.position.set(px, -ry * 0.82, pz);
                grp.add(paw);
            });
        };

        // 1. 幼崽刺蝟
        this.hedgehogBabyGroup = new THREE.Group();
        this.hedgehogBabyGroup.position.set(0, 0.26, 0);
        this.hedgehogGroup.add(this.hedgehogBabyGroup);
        const bQuills = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 18), this.matHedgehogQuill);
        bQuills.scale.set(1.05, 0.92, 1.18);
        bQuills.castShadow = true;
        this.hedgehogBabyGroup.add(bQuills);
        addHedgehogDetails(this.hedgehogBabyGroup, 0.28, 0.26, 0.32, false);

        this.hedgehogBabyHead = new THREE.Group();
        this.hedgehogBabyHead.name = 'HedgehogBabyHead';
        this.hedgehogBabyHead.position.set(0, -0.02, 0.24);
        this.hedgehogBabyGroup.add(this.hedgehogBabyHead);
        const bSnout = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.26, 16), this.matHedgehogCream);
        bSnout.rotation.x = Math.PI / 2;
        const bNose = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), this.matNose);
        bNose.position.set(0, 0.01, 0.14);
        this.hedgehogBabyHead.add(bSnout, bNose);
        [-1, 1].forEach(side => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), this.matNose);
            eye.position.set(side * 0.082, 0.05, 0.04);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), this.matShine);
            shine.position.set(side * 0.082 - 0.008, 0.062, 0.068);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), this.matHedgehogCream);
            ear.scale.set(0.85, 1.0, 0.45);
            ear.position.set(side * 0.14, 0.10, -0.04);
            this.hedgehogBabyHead.add(eye, shine, ear);
        });

        // 2. 成體頭頂紅蘋果刺蝟
        this.hedgehogAdultGroup = new THREE.Group();
        this.hedgehogAdultGroup.position.set(0, 0.34, 0);
        this.hedgehogGroup.add(this.hedgehogAdultGroup);
        const aQuills = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 18), this.matHedgehogQuill);
        aQuills.scale.set(1.08, 0.95, 1.25);
        aQuills.castShadow = true;
        this.hedgehogAdultGroup.add(aQuills);
        addHedgehogDetails(this.hedgehogAdultGroup, 0.36, 0.34, 0.42, true);

        // 頭頂紅潤大蘋果（含果蒂與翠綠葉片）
        const appleGroup = new THREE.Group();
        appleGroup.position.set(0, 0.40, -0.04);
        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 14), this.matAppleRed);
        apple.scale.set(1.08, 0.94, 1.08);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.06, 8), this.matHedgehogQuill);
        stem.position.set(0, 0.11, 0);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), leafMat);
        leaf.scale.set(1.5, 0.3, 0.8);
        leaf.position.set(0.04, 0.12, 0);
        leaf.rotation.z = 0.35;
        appleGroup.add(apple, stem, leaf);
        this.hedgehogAdultGroup.add(appleGroup);

        this.hedgehogAdultHead = new THREE.Group();
        this.hedgehogAdultHead.name = 'HedgehogAdultHead';
        this.hedgehogAdultHead.position.set(0, -0.03, 0.32);
        this.hedgehogAdultGroup.add(this.hedgehogAdultHead);
        const aSnout = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.32, 16), this.matHedgehogCream);
        aSnout.rotation.x = Math.PI / 2;
        const aNose = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 10), this.matNose);
        aNose.position.set(0, 0.01, 0.17);
        this.hedgehogAdultHead.add(aSnout, aNose);
        [-1, 1].forEach(side => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), this.matNose);
            eye.position.set(side * 0.102, 0.06, 0.05);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine.position.set(side * 0.102 - 0.01, 0.075, 0.082);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), this.matHedgehogCream);
            ear.scale.set(0.85, 1.0, 0.45);
            ear.position.set(side * 0.18, 0.12, -0.05);
            this.hedgehogAdultHead.add(eye, shine, ear);
        });

        this.updateHedgehogStage('baby');
    }

    updateHedgehogStage(stage) {
        this.hedgehogStage = stage;
        const isBaby = (stage === 'baby');
        if (this.hedgehogBabyGroup) this.hedgehogBabyGroup.visible = isBaby;
        if (this.hedgehogAdultGroup) this.hedgehogAdultGroup.visible = !isBaby;
    }

    updateHedgehog(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.hedgehogStage === 'baby');
        const isHappy = (this.currentState === 'happy');
        const targetGroup = isBaby ? this.hedgehogBabyGroup : this.hedgehogAdultGroup;
        const baseY = isBaby ? 0.26 : 0.34;
        if (targetGroup) {
            targetGroup.position.y = baseY + (isHappy ? Math.abs(Math.sin(t * 9)) * 0.16 : Math.sin(t * 3.2) * 0.012);
        }
    }

    // =========================================================================
    //  🐬 27. 瓶鼻海豚（Bottlenose Dolphin）雙形態 3D 模型（浪花幼豚 vs 躍浪成豚）
    // =========================================================================
    buildDolphinMesh() {
        this.dolphinStage = 'baby';
        this.dolphinGroup = new THREE.Group();
        this.root.add(this.dolphinGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.45, 0);
        this.dolphinGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.1, 0.28);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        const waterPad = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.08, 28), this.matOtterWater);
        waterPad.position.y = 0.04;
        this.dolphinGroup.add(waterPad);

        // 1. 幼豚：流線天藍背部 + 雪白肚皮 + 背鰭 + 雙側胸鰭 + 水平雙尾鰭
        this.dolphinBabyGroup = new THREE.Group();
        this.dolphinBabyGroup.position.set(0, 0.42, 0);
        this.dolphinGroup.add(this.dolphinBabyGroup);
        const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), this.matDolphinBlue);
        bBody.scale.set(0.86, 0.82, 1.65);
        bBody.castShadow = true;
        const bBelly = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 16), this.matPolarWhite);
        bBelly.scale.set(0.80, 0.65, 1.50);
        bBelly.position.set(0, -0.06, 0.02);
        const bDorsal = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.20, 10), this.matDolphinBlue);
        bDorsal.position.set(0, 0.24, -0.05);
        bDorsal.rotation.x = -0.35;
        this.dolphinBabyGroup.add(bBody, bBelly, bDorsal);

        // 幼豚胸鰭與水平尾鰭
        [-1, 1].forEach(side => {
            const flipper = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.26, 10), this.matDolphinBlue);
            flipper.scale.set(0.45, 1.0, 1.2);
            flipper.position.set(side * 0.22, -0.08, 0.12);
            flipper.rotation.z = side * 1.15;
            flipper.rotation.x = 0.25;
            this.dolphinBabyGroup.add(flipper);
        });
        this.dolphinBabyTail = new THREE.Group();
        this.dolphinBabyTail.position.set(0, -0.02, -0.44);
        [-1, 1].forEach(side => {
            const fluke = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 10), this.matDolphinBlue);
            fluke.scale.set(1.2, 1.0, 0.35);
            fluke.position.set(side * 0.10, 0, -0.06);
            fluke.rotation.z = -side * 1.25;
            fluke.rotation.x = -0.35;
            this.dolphinBabyTail.add(fluke);
        });
        this.dolphinBabyGroup.add(this.dolphinBabyTail);

        this.dolphinBabyHead = new THREE.Group();
        this.dolphinBabyHead.name = 'DolphinBabyHead';
        this.dolphinBabyHead.position.set(0, 0.03, 0.34);
        this.dolphinBabyGroup.add(this.dolphinBabyHead);
        const bMelon = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 16), this.matDolphinBlue);
        bMelon.scale.set(0.95, 0.92, 1.12);
        const bRostrum = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.24, 14), this.matDolphinBlue);
        bRostrum.rotation.x = Math.PI / 2;
        bRostrum.scale.set(1.1, 0.72, 1.0);
        bRostrum.position.set(0, -0.05, 0.18);
        this.dolphinBabyHead.add(bMelon, bRostrum);
        [-1, 1].forEach(side => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), this.matNose);
            eye.position.set(side * 0.15, 0.02, 0.06);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), this.matShine);
            shine.position.set(side * 0.155, 0.032, 0.085);
            this.dolphinBabyHead.add(eye, shine);
        });

        // 2. 成年海豚：修長流線身軀 + 高聳鐮刀背鰭 + 胸鰭 + 水平尾鰭
        this.dolphinAdultGroup = new THREE.Group();
        this.dolphinAdultGroup.position.set(0, 0.56, 0);
        this.dolphinGroup.add(this.dolphinAdultGroup);
        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 18), this.matDolphinBlue);
        aBody.scale.set(0.86, 0.84, 1.85);
        aBody.castShadow = true;
        const aBelly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), this.matPolarWhite);
        aBelly.scale.set(0.80, 0.66, 1.68);
        aBelly.position.set(0, -0.08, 0.03);
        const dorsalFin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.30, 10), this.matDolphinBlue);
        dorsalFin.scale.set(0.55, 1.0, 1.25);
        dorsalFin.position.set(0, 0.34, -0.08);
        dorsalFin.rotation.x = -0.38;
        this.dolphinAdultGroup.add(aBody, aBelly, dorsalFin);

        [-1, 1].forEach(side => {
            const flipper = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.36, 10), this.matDolphinBlue);
            flipper.scale.set(0.42, 1.0, 1.25);
            flipper.position.set(side * 0.28, -0.10, 0.16);
            flipper.rotation.z = side * 1.18;
            flipper.rotation.x = 0.28;
            this.dolphinAdultGroup.add(flipper);
        });
        this.dolphinAdultTail = new THREE.Group();
        this.dolphinAdultTail.position.set(0, -0.02, -0.64);
        [-1, 1].forEach(side => {
            const fluke = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.32, 10), this.matDolphinBlue);
            fluke.scale.set(1.25, 1.0, 0.35);
            fluke.position.set(side * 0.14, 0, -0.08);
            fluke.rotation.z = -side * 1.25;
            fluke.rotation.x = -0.35;
            this.dolphinAdultTail.add(fluke);
        });
        this.dolphinAdultGroup.add(this.dolphinAdultTail);

        this.dolphinAdultHead = new THREE.Group();
        this.dolphinAdultHead.name = 'DolphinAdultHead';
        this.dolphinAdultHead.position.set(0, 0.04, 0.48);
        this.dolphinAdultGroup.add(this.dolphinAdultHead);
        const aMelon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), this.matDolphinBlue);
        aMelon.scale.set(0.95, 0.92, 1.15);
        const aRostrum = new THREE.Mesh(new THREE.ConeGeometry(0.098, 0.32, 14), this.matDolphinBlue);
        aRostrum.rotation.x = Math.PI / 2;
        aRostrum.scale.set(1.12, 0.72, 1.0);
        aRostrum.position.set(0, -0.06, 0.24);
        this.dolphinAdultHead.add(aMelon, aRostrum);
        [-1, 1].forEach(side => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 10), this.matNose);
            eye.position.set(side * 0.19, 0.03, 0.08);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine.position.set(side * 0.195, 0.045, 0.11);
            this.dolphinAdultHead.add(eye, shine);
        });

        this.updateDolphinStage('baby');
    }

    updateDolphinStage(stage) {
        this.dolphinStage = stage;
        const isBaby = (stage === 'baby');
        if (this.dolphinBabyGroup) this.dolphinBabyGroup.visible = isBaby;
        if (this.dolphinAdultGroup) this.dolphinAdultGroup.visible = !isBaby;
    }

    updateDolphin(delta, elapsedTime) {
        const t = elapsedTime;
        const isBaby = (this.dolphinStage === 'baby');
        const isHappy = (this.currentState === 'happy');
        const grp = isBaby ? this.dolphinBabyGroup : this.dolphinAdultGroup;
        const tail = isBaby ? this.dolphinBabyTail : this.dolphinAdultTail;
        const baseY = isBaby ? 0.42 : 0.56;
        if (grp) {
            grp.position.y = baseY + (isHappy ? Math.abs(Math.sin(t * 6)) * 0.45 : Math.sin(t * 2.8) * 0.05);
            grp.rotation.x = Math.cos(t * (isHappy ? 6 : 2.8)) * (isHappy ? 0.35 : 0.08);
        }
        if (tail) {
            tail.rotation.x = Math.sin(t * (isHappy ? 14 : 6)) * 0.32;
        }
    }

    // =========================================================================
    //  🐯 28. 孟加拉虎（Bengal Tiger）雙形態 3D 模型（額頭王字萌虎崽 vs 烈焰猛虎王）
    // =========================================================================
    buildTigerMesh() {
        this.tigerStage = 'baby';
        this.tigerGroup = new THREE.Group();
        this.root.add(this.tigerGroup);

        this.body = new THREE.Group();
        this.body.position.set(0, 0.48, 0);
        this.tigerGroup.add(this.body);
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.22, 0.32);
        this.body.add(this.neck);
        this.head = new THREE.Group();
        this.neck.add(this.head);

        // 輔助函式：在虎額頭繪製立體「王」字霸紋與臉部虎吻
        const buildTigerFaceDetails = (headGrp, r, isAdult) => {
            // 白色虎吻鬍鬚墊與粉紅虎鼻
            [-1, 1].forEach(side => {
                const muzzlePad = new THREE.Mesh(new THREE.SphereGeometry(r * 0.36, 14, 12), this.matPolarWhite);
                muzzlePad.scale.set(1.05, 0.85, 0.95);
                muzzlePad.position.set(side * r * 0.28, -r * 0.20, r * 0.78);
                headGrp.add(muzzlePad);
            });
            const chin = new THREE.Mesh(new THREE.SphereGeometry(r * 0.28, 12, 10), this.matPolarWhite);
            chin.scale.set(1.1, 0.65, 0.9);
            chin.position.set(0, -r * 0.42, r * 0.72);
            const nose = new THREE.Mesh(new THREE.SphereGeometry(r * 0.18, 12, 12), this.matBunnyPink);
            nose.scale.set(1.15, 0.85, 0.85);
            nose.position.set(0, -r * 0.05, r * 0.98);
            headGrp.add(chin, nose);

            // 額頭三橫一豎「王」字黑紋
            [0.64, 0.50, 0.36].forEach((yRatio, idx) => {
                const w = r * (idx === 1 ? 0.42 : 0.54);
                const hBar = new THREE.Mesh(new THREE.BoxGeometry(w, r * 0.08, 0.025), this.matTigerStripe);
                hBar.position.set(0, r * yRatio, r * (0.86 + idx * 0.04));
                hBar.rotation.x = -0.35;
                headGrp.add(hBar);
            });
            const vBar = new THREE.Mesh(new THREE.BoxGeometry(r * 0.09, r * 0.34, 0.028), this.matTigerStripe);
            vBar.position.set(0, r * 0.50, r * 0.91);
            vBar.rotation.x = -0.35;
            headGrp.add(vBar);

            // 琥珀虎眼、黑瞳孔與眼神光 + 黑邊虎耳
            [-1, 1].forEach(side => {
                const ex = side * r * 0.40;
                const eye = new THREE.Mesh(new THREE.SphereGeometry(r * 0.15, 12, 12), this.matLionEye);
                eye.position.set(ex, r * 0.15, r * 0.86);
                const pupil = new THREE.Mesh(new THREE.SphereGeometry(r * 0.09, 10, 10), this.matNose);
                pupil.position.set(ex, r * 0.15, r * 0.94);
                const shine = new THREE.Mesh(new THREE.SphereGeometry(r * 0.045, 8, 8), this.matShine);
                shine.position.set(ex - 0.01, r * 0.19, r * 0.99);
                const earRim = new THREE.Mesh(new THREE.SphereGeometry(r * 0.32, 12, 10), this.matTigerStripe);
                earRim.scale.set(1.0, 1.05, 0.45);
                earRim.position.set(side * r * 0.74, r * 0.82, -0.02);
                const earInner = new THREE.Mesh(new THREE.SphereGeometry(r * 0.22, 10, 10), this.matPolarWhite);
                earInner.scale.set(1.0, 1.0, 0.45);
                earInner.position.set(side * r * 0.74, r * 0.80, 0.01);
                headGrp.add(eye, pupil, shine, earRim, earInner);

                if (isAdult) {
                    const cheekRuff = new THREE.Mesh(new THREE.SphereGeometry(r * 0.42, 12, 10), this.matPolarWhite);
                    cheekRuff.scale.set(0.85, 1.05, 0.65);
                    cheekRuff.position.set(side * r * 0.82, -r * 0.12, r * 0.22);
                    headGrp.add(cheekRuff);
                }
            });
        };

        // 輔助函式：在虎軀幹添加雪白胸腹、兩側黑色虎斑紋與竹節虎尾
        const buildTigerBodyDetails = (grp, rx, ry, rz, isAdult) => {
            const belly = new THREE.Mesh(new THREE.SphereGeometry(rx * 0.86, 18, 16), this.matPolarWhite);
            belly.scale.set(0.88, 0.78, 1.22);
            belly.position.set(0, -ry * 0.22, 0.04);
            grp.add(belly);

            // 軀幹兩側黑色虎斑環紋
            [-0.22, -0.02, 0.18].forEach(zOff => {
                [-1, 1].forEach(side => {
                    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.03, ry * 1.15, 0.065), this.matTigerStripe);
                    stripe.position.set(side * rx * 0.92, 0.04, zOff * rz * 2.2);
                    stripe.rotation.z = side * 0.22;
                    grp.add(stripe);
                });
            });

            // 黑色環紋長虎尾
            const tailGrp = new THREE.Group();
            tailGrp.position.set(0, 0.08, -rz * 1.18);
            const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, isAdult ? 0.56 : 0.40, 12), this.matTigerOrange);
            tailMesh.rotation.x = -0.85;
            tailMesh.position.set(0, -0.08, -0.18);
            const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.matTigerStripe);
            tailTip.position.set(0, -0.22, -0.35);
            tailGrp.add(tailMesh, tailTip);
            grp.add(tailGrp);
            return tailGrp;
        };

        // 1. 幼虎：呆萌額頭王字小虎崽
        this.tigerBabyGroup = new THREE.Group();
        this.tigerBabyGroup.position.set(0, 0.42, 0);
        this.tigerGroup.add(this.tigerBabyGroup);
        const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 22, 18), this.matTigerOrange);
        bBody.scale.set(0.95, 0.92, 1.25);
        bBody.castShadow = true;
        this.tigerBabyGroup.add(bBody);
        this.tigerBabyTail = buildTigerBodyDetails(this.tigerBabyGroup, 0.30, 0.29, 0.36, false);

        this.tigerBabyHead = new THREE.Group();
        this.tigerBabyHead.name = 'TigerBabyHead';
        this.tigerBabyHead.position.set(0, 0.24, 0.32);
        this.tigerBabyGroup.add(this.tigerBabyHead);
        const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 18), this.matTigerOrange);
        bHead.castShadow = true;
        this.tigerBabyHead.add(bHead);
        buildTigerFaceDetails(this.tigerBabyHead, 0.26, false);

        [[-0.16, 0.22], [0.16, 0.22], [-0.16, -0.22], [0.16, -0.22]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 12), this.matTigerOrange);
            leg.position.set(lx, -0.24, lz);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.082, 10, 10), this.matPolarWhite);
            paw.scale.set(1.0, 0.6, 1.25);
            paw.position.set(lx, -0.39, lz + 0.03);
            this.tigerBabyGroup.add(leg, paw);
        });

        // 2. 成年猛虎王
        this.tigerAdultGroup = new THREE.Group();
        this.tigerAdultGroup.position.set(0, 0.62, 0);
        this.tigerGroup.add(this.tigerAdultGroup);
        const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), this.matTigerOrange);
        aBody.scale.set(0.95, 0.96, 1.45);
        aBody.castShadow = true;
        this.tigerAdultGroup.add(aBody);
        this.tigerAdultTail = buildTigerBodyDetails(this.tigerAdultGroup, 0.40, 0.40, 0.52, true);

        this.tigerAdultHead = new THREE.Group();
        this.tigerAdultHead.name = 'TigerAdultHead';
        this.tigerAdultHead.position.set(0, 0.28, 0.50);
        this.tigerAdultGroup.add(this.tigerAdultHead);
        const aHead = new THREE.Mesh(new THREE.SphereGeometry(0.30, 22, 18), this.matTigerOrange);
        aHead.castShadow = true;
        this.tigerAdultHead.add(aHead);
        buildTigerFaceDetails(this.tigerAdultHead, 0.30, true);

        [[-0.22, 0.34], [0.22, 0.34], [-0.22, -0.34], [0.22, -0.34]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.48, 12), this.matTigerOrange);
            leg.position.set(lx, -0.34, lz);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 10), this.matPolarWhite);
            paw.scale.set(1.0, 0.6, 1.25);
            paw.position.set(lx, -0.57, lz + 0.04);
            this.tigerAdultGroup.add(leg, paw);
        });

        this.updateTigerStage('baby');
    }

    updateTigerStage(stage) {
        this.tigerStage = stage;
        const isBaby = (stage === 'baby');
        if (this.tigerBabyGroup) this.tigerBabyGroup.visible = isBaby;
        if (this.tigerAdultGroup) this.tigerAdultGroup.visible = !isBaby;
    }

    updateTiger(delta, elapsedTime) {
        this.updateCanineAutonomy(delta, elapsedTime);
        const t = elapsedTime;
        const isBaby = (this.tigerStage === 'baby');
        const isHappy = (this.currentState === 'happy');
        const grp = isBaby ? this.tigerBabyGroup : this.tigerAdultGroup;
        const head = isBaby ? this.tigerBabyHead : this.tigerAdultHead;
        const tail = isBaby ? this.tigerBabyTail : this.tigerAdultTail;
        const baseY = isBaby ? 0.42 : 0.62;
        if (grp) {
            grp.position.y = baseY + (isHappy ? Math.abs(Math.sin(t * 8)) * 0.18 : Math.sin(t * 2.4) * 0.015);
        }
        if (head) {
            head.rotation.z = Math.sin(t * 1.8) * 0.08;
        }
        if (tail) {
            tail.rotation.y = Math.sin(t * (isHappy ? 9 : 3.2)) * 0.28;
        }
    }

    // =========================================================================
    //  🦅 29. 安地斯神鷲（Andean Condor — 南美蒼穹之神・世界最大飛禽之一）
    //  - 參考圖 4（幼雛期）：溫暖肉桂褐蓬鬆絨毛身軀、淺褐絨毛頸圈、深炭灰毛絨頭臉、水汪汪深琥珀大眼、微張絨毛小翅膀
    //  - 參考圖 1（成年站立）：墨黑油亮龐大身軀、標誌性「厚實雪白絨毛頸圈披肩」、收攏時兩側醒目的「大片純白翼斑」、紫紅裸露頭頸與高聳肉冠、象牙白彎鉤喙尖、岩石灰粗壯雙足立於安地斯山岩上
    //  - 參考圖 2 & 3（展翅與高空滑翔）：3.3 公尺巨翼展開、翼面大片雪白次級飛羽與覆羽區、翼尖 8 根超長分明開叉的「黑色指狀初級飛羽」、寬闊扇形黑尾羽，且絕不抓著岩石起飛！
    // =========================================================================
    buildCondorMesh() {
        this.condorRoot = new THREE.Group();
        this.condorRoot.name = 'CondorRoot';
        this.root.add(this.condorRoot);

        // 獨立安地斯山脈花崗岩石台座群組（固定於地面 (0,0,0)，起飛與高空滑翔時絕不跟著飛上天！）
        this.condorPerchGroup = new THREE.Group();
        this.condorPerchGroup.name = 'CondorPerchGroup';
        this.condorRoot.add(this.condorPerchGroup);

        // 打造參考圖 1/3/4 中的安地斯山脈層疊花崗岩石台座
        const mainRockGeo = new THREE.DodecahedronGeometry(0.46, 1);
        mainRockGeo.scale(1.45, 0.36, 1.15);
        const mainRock = new THREE.Mesh(mainRockGeo, this.matCondorRock);
        mainRock.position.set(0, 0.08, 0.02);
        mainRock.castShadow = true;
        mainRock.receiveShadow = true;
        this.condorPerchGroup.add(mainRock);

        [
            { x: -0.38, y: 0.04, z: 0.18, sx: 0.65, sy: 0.25, sz: 0.55, ry: 0.4 },
            { x: 0.40, y: 0.05, z: 0.14, sx: 0.60, sy: 0.28, sz: 0.52, ry: -0.5 },
            { x: 0.08, y: 0.03, z: -0.32, sx: 0.75, sy: 0.22, sz: 0.50, ry: 0.2 }
        ].forEach(r => {
            const subRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), this.matCondorRock);
            subRock.scale.set(r.sx, r.sy, r.sz);
            subRock.position.set(r.x, r.y, r.z);
            subRock.rotation.y = r.ry;
            subRock.castShadow = true;
            this.condorPerchGroup.add(subRock);
        });

        // 配件相容節點
        this.body = new THREE.Group();
        this.neck = new THREE.Group();
        this.head = new THREE.Group();
        this.condorRoot.add(this.body);
        this.body.add(this.neck);
        this.neck.add(this.head);

        // 1. 幼雛期：參考圖 4 肉桂褐絨毛小神鷲雛
        this.buildCondorBabyMesh();

        // 2. 成年期：參考圖 1 & 3 安地斯神鷲皇（雪白絨毛頸圈、雙側純白翼斑、紫紅肉冠頭、象牙白尖鉤喙）
        this.buildCondorAdultMesh();

        // 3. 飛行與滑翔專用骨架：參考圖 2 & 3（與站立成鳥 1:1 統一五官與羽色，支援起飛／降落平滑收展翼過渡！）
        this.buildCondorFlightRig();

        // 預設呈現幼雛期（在按切換鍵之前是肉桂褐絨毛小神鷲雛幼崽型態！）
        this.updateCondorStage('baby');
    }

    // 1. 幼雛期：安地斯神鷲絨毛幼雛（100% 還原用戶附圖：溫暖肉桂摩卡絨毛、蓬鬆淺褐金絨羽頸圈、深炭灰毛絨頭、水汪汪深琥珀大眼、微張絨羽小翅膀與粗壯深灰猛禽雙足）
    buildCondorBabyMesh() {
        this.condorBabyGroup = new THREE.Group();
        this.condorBabyGroup.name = 'CondorBabyGroup';
        this.condorBabyGroup.position.set(0, 0.44, 0);
        this.condorRoot.add(this.condorBabyGroup);

        // 1.1 圓滾滾肉桂褐蓬鬆羽絨身軀 (Puffed Warm Cinnamon Down Body)
        const torsoGeo = new THREE.SphereGeometry(0.35, 20, 18);
        torsoGeo.scale(0.96, 1.14, 1.06);
        const torso = new THREE.Mesh(torsoGeo, this.matCondorBabyDown);
        torso.castShadow = true;
        this.condorBabyGroup.add(torso);

        // 胸腹立體層次羽絨簇（呈現附圖中厚實暖洋洋的雛鳥絨羽質感）
        [
            [0, 0.08, 0.29, 0.16], [-0.15, 0.04, 0.25, 0.14], [0.15, 0.04, 0.25, 0.14],
            [0, -0.08, 0.27, 0.15], [-0.18, -0.07, 0.19, 0.13], [0.18, -0.07, 0.19, 0.13],
            [-0.08, -0.16, 0.22, 0.12], [0.08, -0.16, 0.22, 0.12],
            [0, 0.16, 0.22, 0.13]
        ].forEach(([px, py, pz, r]) => {
            const tuft = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), this.matCondorBabyDown);
            tuft.scale.set(1.12, 0.88, 0.95);
            tuft.position.set(px, py, pz);
            this.condorBabyGroup.add(tuft);
        });

        // 1.2 附圖焦點：頸部溫暖金褐蓬鬆絨毛圍脖 (Fluffy Buff-Tan Downy Neck Ruff)
        const babyRuffGroup = new THREE.Group();
        babyRuffGroup.position.set(0, 0.28, 0.07);
        babyRuffGroup.rotation.x = 0.20;
        this.condorBabyGroup.add(babyRuffGroup);

        for (let i = 0; i < 14; i++) {
            const ang = (i / 14) * Math.PI * 2;
            const puff = new THREE.Mesh(new THREE.SphereGeometry(0.098, 10, 10), this.matCondorBabyRuff);
            puff.scale.set(1.18, 0.82, 1.25);
            puff.position.set(Math.cos(ang) * 0.195, Math.sin(ang) * 0.02, Math.sin(ang) * 0.195);
            babyRuffGroup.add(puff);
        }

        // 1.3 深炭灰毛絨頭頸與水汪汪深琥珀大眼 (Charcoal Down Head & Soulful Amber Eyes)
        this.condorBabyHead = new THREE.Group();
        this.condorBabyHead.name = 'CondorBabyHead';
        this.condorBabyHead.position.set(0, 0.44, 0.12);
        this.condorBabyGroup.add(this.condorBabyHead);

        const neckCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.155, 0.18, 12), this.matCondorBabySkin);
        neckCyl.position.set(0, -0.08, -0.02);
        this.condorBabyHead.add(neckCyl);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.225, 18, 16), this.matCondorBabySkin);
        headMesh.scale.set(0.96, 0.98, 1.14);
        headMesh.castShadow = true;
        this.condorBabyHead.add(headMesh);

        // 頭頂絨毛細微輪廓簇（附圖逆光毛茸茸頭頂輪廓）
        for (let c = 0; c < 9; c++) {
            const ca = -0.6 + c * 0.18;
            const fuzz = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.085, 6), this.matCondorBabySkin);
            fuzz.position.set(0, Math.cos(ca) * 0.215, -Math.sin(ca) * 0.225);
            fuzz.rotation.x = -ca - 0.28;
            this.condorBabyHead.add(fuzz);
        }

        // 附圖細節：深炭灰猛禽彎鉤喙與鼻孔蠟膜 (Arched Down-Hooked Raptor Beak)
        const babyBeak = new THREE.Group();
        babyBeak.position.set(0, -0.025, 0.21);
        this.condorBabyHead.add(babyBeak);
        this.condorBabyBeak = babyBeak;

        // 鼻孔蠟膜底座 (Cere)
        const cere = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), this.matCondorBabySkin);
        cere.scale.set(1.0, 0.75, 1.15);
        cere.position.set(0, 0.04, 0.02);
        babyBeak.add(cere);

        // 兩側鼻孔小凹槽
        [-1, 1].forEach(side => {
            const nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.025, 6), this.matBlackCoat);
            nostril.rotation.z = side * 0.4;
            nostril.rotation.x = Math.PI / 2;
            nostril.position.set(side * 0.038, 0.035, 0.045);
            babyBeak.add(nostril);
        });

        // 彎鉤上喙
        const upperBeak = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.070, 0.17, 10), this.matCondorBeakBase);
        upperBeak.rotation.x = Math.PI / 2 + 0.20;
        upperBeak.position.set(0, 0.015, 0.075);
        const beakHook = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.135, 10), this.matCondorBeakBase);
        beakHook.rotation.x = Math.PI / 2 + 0.74;
        beakHook.position.set(0, -0.045, 0.165);
        const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.044, 0.13, 8), this.matCondorBeakBase);
        lowerBeak.rotation.x = Math.PI / 2 + 0.05;
        lowerBeak.position.set(0, -0.042, 0.07);
        babyBeak.add(upperBeak, beakHook, lowerBeak);

        // 水汪汪深琥珀暖棕大眼（附圖最迷人的靈動大眼！）
        [-1, 1].forEach((side) => {
            const eyeGrp = new THREE.Group();
            eyeGrp.position.set(side * 0.138, 0.038, 0.115);
            eyeGrp.rotation.y = side * 0.28;

            const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.011, 8, 16), this.matCondorBabySkin);
            const iris = new THREE.Mesh(new THREE.SphereGeometry(0.050, 14, 14), this.matCondorBabyEye);
            iris.scale.set(1.0, 1.0, 0.65);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), this.matPupil);
            pupil.scale.set(1.0, 1.0, 0.45);
            pupil.position.z = 0.026;
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.matShine);
            shine1.position.set(side * 0.011, 0.016, 0.042);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), this.matShine);
            shine2.position.set(-side * 0.008, -0.011, 0.042);

            eyeGrp.add(eyeRing, iris, pupil, shine1, shine2);
            this.condorBabyHead.add(eyeGrp);
            if (side === -1) this.condorBabyEyeL = eyeGrp;
            else this.condorBabyEyeR = eyeGrp;
        });

        // 1.4 完美還原附圖：兩側微展、羽尖如扇張開的溫暖絨羽小翅膀 (Semi-Spread Fluffy Baby Wings)
        this.condorBabyWings = { left: null, right: null };
        [-1, 1].forEach((side) => {
            const wingPivot = new THREE.Group();
            wingPivot.position.set(side * 0.29, 0.09, 0.02);
            wingPivot.rotation.z = -side * 0.56; // 附圖半張開展示小羽翼姿態
            wingPivot.rotation.y = -side * 0.14;
            wingPivot.rotation.x = 0.08;
            this.condorBabyGroup.add(wingPivot);

            // 翼基絨毛覆羽 (Downy Wing Coverts)
            const covertPad = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), this.matCondorBabyDown);
            covertPad.scale.set(1.40, 0.48, 0.88);
            covertPad.position.set(side * 0.17, 0, 0);
            wingPivot.add(covertPad);

            // 7 根如扇形分明微張開、帶深炭灰羽尖的初生飛羽（附圖清晰可見的翼緣飛羽）
            for (let f = 0; f < 7; f++) {
                const featherGrp = new THREE.Group();
                featherGrp.position.set(side * (0.07 + f * 0.052), -0.04, -0.03 + f * 0.01);
                featherGrp.rotation.z = side * (0.16 + f * 0.09);
                const upperF = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.19, 0.02), this.matCondorBabyRuff);
                upperF.position.y = -0.09;
                const tipF = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.17, 6), this.matCondorBabySkin);
                tipF.rotation.z = Math.PI;
                tipF.scale.set(1.0, 1.0, 0.35);
                tipF.position.y = -0.23;
                featherGrp.add(upperF, tipF);
                wingPivot.add(featherGrp);
            }

            if (side === -1) this.condorBabyWings.left = wingPivot;
            else this.condorBabyWings.right = wingPivot;
        });

        // 幼雛小短尾 (Cute Downy Tail)
        const babyTail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.26, 8), this.matCondorBabyDown);
        babyTail.scale.set(1.2, 1.0, 0.35);
        babyTail.position.set(0, -0.16, -0.32);
        babyTail.rotation.x = -1.1;
        this.condorBabyGroup.add(babyTail);

        // 1.5 附圖焦點：粗壯深炭灰石板紋幼鳥雙足與緊抓山岩的四趾彎爪 (Sturdy Scaled Legs & Curved Talons)
        [-1, 1].forEach((side) => {
            const legGrp = new THREE.Group();
            legGrp.position.set(side * 0.145, -0.22, 0.04);
            this.condorBabyGroup.add(legGrp);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.070, 0.18, 12), this.matCondorBabyDown);
            thigh.position.y = -0.04;
            const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.050, 0.17, 10), this.matCondorBabySkin);
            tarsus.position.y = -0.155;
            legGrp.add(thigh, tarsus);

            // 前三趾 (3 forward toes) 緊扣岩石
            [-0.038, 0, 0.038].forEach((tx, idx) => {
                const toeLen = (idx === 1) ? 0.11 : 0.095;
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.015, toeLen, 8), this.matCondorBabySkin);
                toe.rotation.x = Math.PI / 2;
                toe.position.set(tx, -0.225, 0.055);
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.017, 0.065, 8), this.matCondorBeakBase);
                claw.rotation.x = Math.PI / 2 + 0.55;
                claw.position.set(tx, -0.235, 0.115);
                legGrp.add(toe, claw);
            });

            // 後拇趾 (Hallux) 穩抓後方岩面
            const rearToe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.075, 8), this.matCondorBabySkin);
            rearToe.rotation.x = -Math.PI / 2;
            rearToe.position.set(0, -0.225, -0.04);
            const rearClaw = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.055, 8), this.matCondorBeakBase);
            rearClaw.rotation.x = -Math.PI / 2 - 0.55;
            rearClaw.position.set(0, -0.235, -0.08);
            legGrp.add(rearToe, rearClaw);
        });
    }

    // 2. 成年期：安地斯神鷲皇（參考圖 1 & 3：與飛行模型 1:1 完全統一的紫紅肉冠頭、象牙白尖彎鉤喙、厚實雪白絨毛頸圈披肩、墨黑油亮身軀、收攏時兩側醒目的大片純白翼斑、粗壯岩石灰巨足！）
    buildCondorAdultMesh() {
        this.condorAdultGroup = new THREE.Group();
        this.condorAdultGroup.name = 'CondorAdultGroup';
        this.condorAdultGroup.position.set(0, 0.64, 0);
        this.condorRoot.add(this.condorAdultGroup);

        // 2.1 巍峨昂首的墨黑油亮身軀 (與飛行模型相同比例之墨黑軀幹，傾斜昂立於安地斯山岩上)
        const bodyTiltGroup = new THREE.Group();
        bodyTiltGroup.rotation.x = -0.55;
        this.condorAdultGroup.add(bodyTiltGroup);
        this.condorAdultBodyTilt = bodyTiltGroup;

        const torsoGeo = new THREE.SphereGeometry(0.35, 22, 18);
        torsoGeo.scale(0.96, 0.86, 1.72);
        const torsoMesh = new THREE.Mesh(torsoGeo, this.matCondorBlack);
        torsoMesh.castShadow = true;
        bodyTiltGroup.add(torsoMesh);

        // 飽滿墨黑前胸羽
        const breastGeo = new THREE.SphereGeometry(0.31, 18, 16);
        breastGeo.scale(0.98, 0.82, 0.95);
        const breastMesh = new THREE.Mesh(breastGeo, this.matCondorBlack);
        breastMesh.position.set(0, -0.02, 0.28);
        bodyTiltGroup.add(breastMesh);

        // 2.2 🌟 標誌性「厚實雪白絨毛頸圈披肩 (Snow-White Fluffy Collar Ruff)」— 參考圖 1/2/3 最具辨識度的純白大毛領！
        const whiteRuffGroup = new THREE.Group();
        whiteRuffGroup.position.set(0, 0.08, 0.44);
        whiteRuffGroup.rotation.x = 0.45;
        bodyTiltGroup.add(whiteRuffGroup);

        const ruffTorus = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.085, 14, 24), this.matCondorWhiteRuff);
        ruffTorus.rotation.x = Math.PI / 2;
        ruffTorus.scale.set(1.08, 1.12, 0.95);
        whiteRuffGroup.add(ruffTorus);

        for (let i = 0; i < 14; i++) {
            const ang = (i / 14) * Math.PI * 2;
            const puff = new THREE.Mesh(new THREE.SphereGeometry(0.092, 10, 10), this.matCondorWhiteRuff);
            puff.position.set(Math.cos(ang) * 0.18, Math.sin(ang) * 0.02, Math.sin(ang) * 0.18);
            whiteRuffGroup.add(puff);
        }

        // 2.3 裸露紫紅頭頸、雄性霸氣「高聳肉冠 (Fleshy Comb/Caruncle)」與「象牙白尖彎鉤喙」 (與飛行模型 1:1 對齊！)
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 0.10, 0.48);
        bodyTiltGroup.add(neckPivot);
        this.condorAdultNeck = neckPivot;

        const neckGeo = new THREE.CylinderGeometry(0.125, 0.155, 0.26, 14);
        neckGeo.rotateX(Math.PI / 2);
        const neckMesh = new THREE.Mesh(neckGeo, this.matCondorHeadSkin);
        neckPivot.add(neckMesh);

        // 頸部皮膚皺褶環與喉囊
        [-0.04, 0.03].forEach(zOff => {
            const foldRing = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.016, 8, 16), this.matCondorComb);
            foldRing.position.set(0, -0.01, zOff);
            neckPivot.add(foldRing);
        });

        const headPivot = new THREE.Group();
        headPivot.position.set(0, 0.05, 0.13);
        headPivot.rotation.x = 0.55; // 抵消身體傾角，使神鷲昂首水平直視
        neckPivot.add(headPivot);
        this.condorAdultHead = headPivot;

        // 紫紅裸露頭顱
        const headGeo = new THREE.SphereGeometry(0.165, 18, 16);
        headGeo.scale(0.88, 0.90, 1.26);
        const headMesh = new THREE.Mesh(headGeo, this.matCondorHeadSkin);
        headMesh.castShadow = true;
        headPivot.add(headMesh);

        // 🌟 參考圖 1 & 3：頭頂與額前高聳厚實的「紫紅肉冠 (Male Andean Condor Fleshy Comb/Caruncle)」
        const combGroup = new THREE.Group();
        combGroup.position.set(0, 0.13, 0.05);
        headPivot.add(combGroup);
        this.condorAdultComb = combGroup;

        const mainCombGeo = new THREE.SphereGeometry(0.11, 14, 12);
        mainCombGeo.scale(0.32, 0.85, 1.35);
        const mainComb = new THREE.Mesh(mainCombGeo, this.matCondorComb);
        combGroup.add(mainComb);

        [-0.08, 0.0, 0.08].forEach((cz, idx) => {
            const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.048 - idx * 0.004, 10, 10), this.matCondorComb);
            lobe.scale.set(0.55, 1.1, 1.0);
            lobe.position.set(0, 0.04, cz);
            combGroup.add(lobe);
        });

        // 雙高光威嚴琥珀紅棕眼眸
        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.108, 0.022, 0.085);
            eyeGroup.rotation.y = side * 0.26;

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.016, 0.08), this.matCondorComb);
            brow.position.set(0, 0.026, 0);
            const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.030, 12, 12), this.matHarpyEye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), this.matPupil);
            pupil.position.z = 0.016;
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), this.matShine);
            shine1.position.set(side * 0.007, 0.009, 0.029);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), this.matShine);
            shine2.position.set(-side * 0.005, -0.007, 0.029);

            eyeGroup.add(brow, eyeBall, pupil, shine1, shine2);
            headPivot.add(eyeGroup);
            if (side === -1) this.condorAdultEyeL = eyeGroup;
            else this.condorAdultEyeR = eyeGroup;
        });

        // 🌟 參考圖 1 & 3：深色喙基 ＋ 鮮明「象牙白彎鉤喙尖 (Ivory-Tipped Hooked Beak)」
        const beakPivot = new THREE.Group();
        beakPivot.position.set(0, -0.015, 0.16);
        headPivot.add(beakPivot);
        this.condorAdultBeak = beakPivot;

        const beakBase = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.062, 0.11, 10), this.matCondorBeakBase);
        beakBase.rotation.x = Math.PI / 2 + 0.12;
        beakBase.position.set(0, 0.01, 0.04);
        const beakWhiteMid = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.044, 0.09, 10), this.matCondorBeakTip);
        beakWhiteMid.rotation.x = Math.PI / 2 + 0.22;
        beakWhiteMid.position.set(0, 0.0, 0.11);
        const beakWhiteHook = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.12, 10), this.matCondorBeakTip);
        beakWhiteHook.rotation.x = Math.PI / 2 + 0.72;
        beakWhiteHook.position.set(0, -0.035, 0.17);
        const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.14, 8), this.matCondorBeakBase);
        lowerBeak.rotation.x = Math.PI / 2 + 0.05;
        lowerBeak.position.set(0, -0.035, 0.07);
        beakPivot.add(beakBase, beakWhiteMid, beakWhiteHook, lowerBeak);

        // 2.4 🌟 參考圖 1：收攏於身體兩側、下半部呈現「超大片醒目純白翼斑」的巨翼 (Folded Black-and-White Condor Wings)
        const doubleWhiteMat = this.matCondorWingWhite.clone();
        doubleWhiteMat.side = THREE.DoubleSide;
        const doubleBlackMat = this.matCondorBlack.clone();
        doubleBlackMat.side = THREE.DoubleSide;

        this.condorAdultWings = {};
        [-1, 1].forEach((side) => {
            const wingPivot = new THREE.Group();
            wingPivot.position.set(side * 0.28, 0.18, 0.04);
            wingPivot.rotation.z = -side * 0.10;
            wingPivot.rotation.y = side * 0.08;
            this.condorAdultGroup.add(wingPivot);

            // 上半段墨黑肩羽蓋 (圖 1 肩部烏黑厚重)
            const blackShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 14), this.matCondorBlack);
            blackShoulder.scale.set(0.58, 1.15, 1.38);
            blackShoulder.position.set(side * 0.04, -0.04, 0.0);
            blackShoulder.castShadow = true;
            wingPivot.add(blackShoulder);

            // 🌟 中下半段超醒目「大片純白次級飛羽與覆羽區」（完全還原圖 1 站在男人旁邊時兩側垂下的大片雪白翼羽！）
            const whiteWingPanel = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 14), this.matCondorWingWhite);
            whiteWingPanel.scale.set(0.55, 1.45, 1.25);
            whiteWingPanel.position.set(side * 0.06, -0.28, -0.04);
            whiteWingPanel.castShadow = true;
            wingPivot.add(whiteWingPanel);

            // 6 片層疊純白次級飛羽條 (Layered White Secondary Plumes)
            for (let s = 0; s < 6; s++) {
                const whitePlume = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.36, 0.082), doubleWhiteMat);
                whitePlume.position.set(side * (0.08 - s * 0.005), -0.26 - s * 0.045, 0.04 - s * 0.045);
                whitePlume.rotation.x = -0.28;
                whitePlume.rotation.z = side * 0.06;
                wingPivot.add(whitePlume);
            }

            // 翼尖後緣收攏的黑色初級飛羽尖
            for (let p = 0; p < 5; p++) {
                const blackTip = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.24, 6), doubleBlackMat);
                blackTip.rotation.z = Math.PI;
                blackTip.rotation.x = -0.35;
                blackTip.scale.set(0.45, 1.0, 1.0);
                blackTip.position.set(side * 0.04, -0.46 - p * 0.035, -0.16 - p * 0.045);
                wingPivot.add(blackTip);
            }

            if (side === -1) this.condorAdultWings.left = wingPivot;
            else this.condorAdultWings.right = wingPivot;
        });

        // 2.5 寬大墨黑扇形尾羽 (7 片黑曜尾羽，與飛行模型完全一致)
        const tailPivot = new THREE.Group();
        tailPivot.position.set(0, -0.02, -0.48);
        tailPivot.rotation.x = -0.30;
        bodyTiltGroup.add(tailPivot);
        this.condorAdultTail = tailPivot;

        for (let i = -3; i <= 3; i++) {
            const absI = Math.abs(i);
            const tLen = 0.54 - absI * 0.022;
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.012, tLen), doubleBlackMat);
            blade.position.set(i * 0.026, -absI * 0.003, -tLen * 0.5);
            blade.rotation.y = i * 0.065;
            tailPivot.add(blade);
        }

        // 2.6 參考圖 1 & 3：粗壯黑色腿羽與岩石灰巨足 (Sturdy Black Feathered Thighs & Slate-Grey Feet)
        this.condorAdultLegs = {};
        [-1, 1].forEach((side) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.16, -0.18, 0.04);
            this.condorAdultGroup.add(legPivot);

            // 黑色豐厚大腿羽
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.082, 0.28, 14), this.matCondorBlack);
            thigh.position.set(0, -0.12, 0);
            legPivot.add(thigh);

            // 岩石灰粗壯足跗 (Grey Tarsus — 如圖 1 & 圖 3)
            const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.060, 0.20, 12), this.matCondorLeg);
            tarsus.position.set(0, -0.32, 0.02);
            legPivot.add(tarsus);

            const footPad = new THREE.Mesh(new THREE.SphereGeometry(0.060, 10, 10), this.matCondorLeg);
            footPad.scale.set(1.15, 0.45, 1.35);
            footPad.position.set(0, -0.42, 0.05);
            legPivot.add(footPad);

            // 3 前趾 + 1 後趾（站立於安地斯岩石上）
            [
                { x: -0.042, z: 0.13, ry: -0.22 },
                { x: 0, z: 0.15, ry: 0 },
                { x: 0.042, z: 0.13, ry: 0.22 }
            ].forEach(t => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.017, 0.11, 8), this.matCondorLeg);
                toe.rotation.x = Math.PI / 2;
                toe.rotation.z = -t.ry;
                toe.position.set(t.x, -0.42, t.z - 0.04);
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.09, 8), this.matCondorBeakBase);
                claw.rotation.x = Math.PI / 2 + 0.45;
                claw.position.set(t.x, -0.43, t.z + 0.03);
                legPivot.add(toe, claw);
            });

            const backClaw = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.08, 8), this.matCondorBeakBase);
            backClaw.rotation.x = -Math.PI / 2 - 0.45;
            backClaw.position.set(0, -0.43, -0.05);
            legPivot.add(backClaw);

            this.condorAdultLegs[side === -1 ? 'left' : 'right'] = legPivot;
        });
    }

    // 3. 安地斯神鷲高空滑翔與展翅專用骨架（完全還原參考圖 2 & 3，並與站立模型 1:1 統一五官、雪白頸圈與黑白巨翼，支援起飛／降落無縫收展翅過渡！）：
    //    - 絕不抓著岩石起飛！安地斯山岩留在地面原位！
    //    - 3.3 公尺級超大翼展比例：翼面內中段呈現「超大片耀眼純白羽區 (Huge White Dorsal/Secondary Wing Panel)」、翼前緣烏黑包邊
    //    - 翼尖放射展開 8 根超長、分明開叉的「黑色指狀初級飛羽 (8 Deeply Slotted Black Primary Fingers)」
    //    - 厚實雪白絨毛頸圈披肩、紫紅肉冠頭、象牙白尖彎鉤喙、寬闊扇形黑尾羽、收攏於尾下的岩石灰雙足
    buildCondorFlightRig() {
        this.condorFlightRig = new THREE.Group();
        this.condorFlightRig.name = 'CondorFlightRig';
        this.condorFlightRig.position.set(0, 0.64, 0);
        this.condorFlightRig.visible = false;
        this.condorRoot.add(this.condorFlightRig);

        this.condorFlightBodyPivot = new THREE.Group();
        this.condorFlightBodyPivot.rotation.x = -0.08;
        this.condorFlightRig.add(this.condorFlightBodyPivot);

        // 3.1 墨黑流線龐大身軀 (與站立模型完全一致)
        const torsoGeo = new THREE.SphereGeometry(0.35, 22, 18);
        torsoGeo.scale(0.96, 0.86, 1.72);
        const torsoMesh = new THREE.Mesh(torsoGeo, this.matCondorBlack);
        torsoMesh.castShadow = true;
        this.condorFlightBodyPivot.add(torsoMesh);

        // 3.2 標誌性「厚實雪白絨毛頸圈披肩」 (與站立模型完全一致，在空中俯仰視角皆極為醒目！)
        const whiteRuffGroup = new THREE.Group();
        whiteRuffGroup.position.set(0, 0.08, 0.44);
        whiteRuffGroup.rotation.x = 0.45;
        this.condorFlightBodyPivot.add(whiteRuffGroup);

        const ruffTorus = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.085, 14, 24), this.matCondorWhiteRuff);
        ruffTorus.rotation.x = Math.PI / 2;
        ruffTorus.scale.set(1.08, 1.12, 0.95);
        whiteRuffGroup.add(ruffTorus);

        for (let i = 0; i < 14; i++) {
            const ang = (i / 14) * Math.PI * 2;
            const puff = new THREE.Mesh(new THREE.SphereGeometry(0.092, 10, 10), this.matCondorWhiteRuff);
            puff.position.set(Math.cos(ang) * 0.18, Math.sin(ang) * 0.02, Math.sin(ang) * 0.18);
            whiteRuffGroup.add(puff);
        }

        // 3.3 裸露紫紅頭頸、高聳肉冠與象牙白尖彎鉤喙 (與站立模型 1:1 對齊！)
        const neckGeo = new THREE.CylinderGeometry(0.125, 0.155, 0.26, 14);
        neckGeo.rotateX(Math.PI / 2);
        const neckMesh = new THREE.Mesh(neckGeo, this.matCondorHeadSkin);
        neckMesh.position.set(0, 0.08, 0.50);
        this.condorFlightBodyPivot.add(neckMesh);

        this.condorFlightHead = new THREE.Group();
        this.condorFlightHead.name = 'CondorFlightHead';
        this.condorFlightHead.position.set(0, 0.10, 0.62);
        this.condorFlightHead.rotation.x = 0.08;
        this.condorFlightBodyPivot.add(this.condorFlightHead);

        const headGeo = new THREE.SphereGeometry(0.165, 18, 16);
        headGeo.scale(0.88, 0.90, 1.26);
        const headMesh = new THREE.Mesh(headGeo, this.matCondorHeadSkin);
        headMesh.castShadow = true;
        this.condorFlightHead.add(headMesh);

        // 頭頂高聳紫紅肉冠 (Male Andean Condor Comb)
        const combGroup = new THREE.Group();
        combGroup.position.set(0, 0.13, 0.05);
        this.condorFlightHead.add(combGroup);
        const mainCombGeo = new THREE.SphereGeometry(0.11, 14, 12);
        mainCombGeo.scale(0.32, 0.85, 1.35);
        combGroup.add(new THREE.Mesh(mainCombGeo, this.matCondorComb));
        [-0.08, 0.0, 0.08].forEach((cz, idx) => {
            const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.048 - idx * 0.004, 10, 10), this.matCondorComb);
            lobe.scale.set(0.55, 1.1, 1.0);
            lobe.position.set(0, 0.04, cz);
            combGroup.add(lobe);
        });

        // 雙高光威嚴眼眸
        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(side * 0.108, 0.022, 0.085);
            eyeGroup.rotation.y = side * 0.26;
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.016, 0.08), this.matCondorComb);
            brow.position.set(0, 0.026, 0);
            const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.030, 12, 12), this.matHarpyEye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), this.matPupil);
            pupil.position.z = 0.016;
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), this.matShine);
            shine1.position.set(side * 0.007, 0.009, 0.029);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), this.matShine);
            shine2.position.set(-side * 0.005, -0.007, 0.029);
            eyeGroup.add(brow, eyeBall, pupil, shine1, shine2);
            this.condorFlightHead.add(eyeGroup);
        });

        // 象牙白尖彎鉤喙
        const beakPivot = new THREE.Group();
        beakPivot.position.set(0, -0.015, 0.16);
        this.condorFlightHead.add(beakPivot);
        const beakBase = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.062, 0.11, 10), this.matCondorBeakBase);
        beakBase.rotation.x = Math.PI / 2 + 0.12;
        beakBase.position.set(0, 0.01, 0.04);
        const beakWhiteMid = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.044, 0.09, 10), this.matCondorBeakTip);
        beakWhiteMid.rotation.x = Math.PI / 2 + 0.22;
        beakWhiteMid.position.set(0, 0.0, 0.11);
        const beakWhiteHook = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.12, 10), this.matCondorBeakTip);
        beakWhiteHook.rotation.x = Math.PI / 2 + 0.72;
        beakWhiteHook.position.set(0, -0.035, 0.17);
        const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.14, 8), this.matCondorBeakBase);
        lowerBeak.rotation.x = Math.PI / 2 + 0.05;
        lowerBeak.position.set(0, -0.035, 0.07);
        beakPivot.add(beakBase, beakWhiteMid, beakWhiteHook, lowerBeak);

        // 3.4 可收放岩石灰雙腿（飛行時向後收攏於尾羽下，起降時平滑伸出踩上安地斯山岩！）
        this.condorFlightLegs = { left: null, right: null };
        [-1, 1].forEach((side) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.15, -0.18, -0.12);
            legPivot.rotation.x = -1.05;
            this.condorFlightBodyPivot.add(legPivot);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.075, 0.26, 12), this.matCondorBlack);
            thigh.position.set(0, -0.11, 0);
            const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.18, 10), this.matCondorLeg);
            tarsus.position.set(0, -0.28, 0.02);
            legPivot.add(thigh, tarsus);

            [-0.036, 0, 0.036].forEach(tx => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.09, 8), this.matCondorLeg);
                toe.rotation.x = Math.PI / 2 + 0.35;
                toe.position.set(tx, -0.36, 0.05);
                legPivot.add(toe);
            });

            if (side === -1) this.condorFlightLegs.left = legPivot;
            else this.condorFlightLegs.right = legPivot;
        });

        // 3.5 寬闊扇形黑尾羽 (參考圖 2 尾部展開的寬大黑扇尾)
        const doubleBlackMat = this.matCondorBlack.clone();
        doubleBlackMat.side = THREE.DoubleSide;
        const doubleWhiteMat = this.matCondorWingWhite.clone();
        doubleWhiteMat.side = THREE.DoubleSide;

        this.condorFlightTail = new THREE.Group();
        this.condorFlightTail.position.set(0, 0.0, -0.52);
        this.condorFlightTail.rotation.x = -0.06;
        this.condorFlightBodyPivot.add(this.condorFlightTail);

        for (let i = -3; i <= 3; i++) {
            const absI = Math.abs(i);
            const tLen = 0.56 - absI * 0.022;
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.012, tLen), doubleBlackMat);
            blade.position.set(i * 0.036, -absI * 0.003, -tLen * 0.5);
            blade.rotation.y = i * 0.11;
            this.condorFlightTail.add(blade);
        }

        // 3.6 🌟 3.3 公尺級黑白雙色巨翼：內中段「超大片雪白次級飛羽與覆羽區」＋ 外翼放射展開「8 根超長分明開叉指狀黑初級飛羽」（完全還原參考圖 2 & 3！）
        this.condorFlightWings = { left: null, right: null };

        [-1, 1].forEach((side) => {
            const shoulderPivot = new THREE.Group();
            shoulderPivot.position.set(side * 0.24, 0.08, 0.08);
            this.condorFlightBodyPivot.add(shoulderPivot);

            // 內翼墨黑前緣骨架基底 (Black Leading-Edge Wing Base)
            const innerShape = new THREE.Shape();
            innerShape.moveTo(0, 0.22);
            innerShape.quadraticCurveTo(side * 0.38, 0.32, side * 0.76, 0.24);
            innerShape.lineTo(side * 0.76, -0.44);
            innerShape.quadraticCurveTo(side * 0.38, -0.52, 0, -0.42);
            innerShape.closePath();

            const innerBlackBase = new THREE.Mesh(new THREE.ShapeGeometry(innerShape, 12), doubleBlackMat);
            innerBlackBase.rotation.x = -Math.PI / 2;
            innerBlackBase.castShadow = true;
            shoulderPivot.add(innerBlackBase);

            // 🌟 參考圖 2 & 3 核心特徵：翼背與翼下內中段超大片耀眼「雪白羽區 (Large White Wing Panel)」
            const whitePanelShape = new THREE.Shape();
            whitePanelShape.moveTo(side * 0.05, 0.08);
            whitePanelShape.quadraticCurveTo(side * 0.38, 0.16, side * 0.72, 0.10);
            whitePanelShape.lineTo(side * 0.72, -0.42);
            whitePanelShape.quadraticCurveTo(side * 0.38, -0.48, side * 0.05, -0.38);
            whitePanelShape.closePath();

            const upperWhitePanel = new THREE.Mesh(new THREE.ShapeGeometry(whitePanelShape, 12), doubleWhiteMat);
            upperWhitePanel.rotation.x = -Math.PI / 2;
            upperWhitePanel.position.y = 0.014;
            shoulderPivot.add(upperWhitePanel);

            const lowerWhitePanel = new THREE.Mesh(new THREE.ShapeGeometry(whitePanelShape, 12), doubleWhiteMat);
            lowerWhitePanel.rotation.x = -Math.PI / 2;
            lowerWhitePanel.position.y = -0.012;
            shoulderPivot.add(lowerWhitePanel);

            // 11 片排列整齊的雪白次級飛羽（末端帶細微深色羽緣，還原圖 2 & 圖 3 羽毛層次感！）
            for (let s = 0; s < 11; s++) {
                const frac = s / 10;
                const sx = side * (0.07 + frac * 0.64);
                const sz = -0.02 - Math.sin(frac * Math.PI) * 0.04;
                const sLen = 0.48 + Math.sin(frac * Math.PI) * 0.05;

                const secBlade = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.012, sLen), doubleWhiteMat);
                secBlade.position.set(sx, 0.004, sz - sLen * 0.5);
                secBlade.rotation.y = side * (0.02 + frac * 0.08);
                shoulderPivot.add(secBlade);
            }

            // 外翼腕關節樞紐 (Outer Hand-Wing Pivot)
            const outerWingPivot = new THREE.Group();
            outerWingPivot.position.set(side * 0.74, 0.0, 0.18);
            shoulderPivot.add(outerWingPivot);

            const wristPad = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), this.matCondorBlack);
            wristPad.scale.set(1.45, 0.22, 1.15);
            wristPad.position.set(side * 0.10, 0, -0.06);
            outerWingPivot.add(wristPad);

            // 🌟 參考圖 2 & 3：翼尖放射展開 8 根超長、根根分明開叉的「黑色指狀初級飛羽 (8 Deeply Slotted Black Primary Fingers)」
            const condorPrimaries = [
                { angle: 0.12, bx: 0.04, bz: 0.05, len: 0.52, bw: 0.046, up: 0.08 }, // P10 最前緣指羽
                { angle: 0.26, bx: 0.07, bz: 0.02, len: 0.74, bw: 0.052, up: 0.12 }, // P9  前緣長指羽
                { angle: 0.41, bx: 0.09, bz: -0.02, len: 0.88, bw: 0.056, up: 0.15 }, // P8  翼尖超長主指羽 1
                { angle: 0.56, bx: 0.09, bz: -0.06, len: 0.92, bw: 0.058, up: 0.14 }, // P7  翼尖最長主指羽 2
                { angle: 0.72, bx: 0.08, bz: -0.10, len: 0.86, bw: 0.058, up: 0.11 }, // P6  翼尖主指羽 3
                { angle: 0.88, bx: 0.06, bz: -0.14, len: 0.76, bw: 0.060, up: 0.08 }, // P5  外中段開叉指羽
                { angle: 1.05, bx: 0.04, bz: -0.18, len: 0.64, bw: 0.062, up: 0.05 }, // P4  內中段開叉指羽
                { angle: 1.22, bx: 0.02, bz: -0.22, len: 0.54, bw: 0.064, up: 0.03 }  // P3  內側初級飛羽（基部帶白斑）
            ];

            const fingerNodes = [];
            condorPrimaries.forEach((cfg, idx) => {
                const fingerPivot = new THREE.Group();
                fingerPivot.position.set(side * cfg.bx, idx * 0.0015, cfg.bz);
                fingerPivot.rotation.y = -side * (Math.PI / 2 - cfg.angle);
                fingerPivot.rotation.x = cfg.up;

                // 基部羽片（內側幾根初級飛羽基部帶白色，外段純黑開叉）
                const innerLen = cfg.len * 0.45;
                const baseMat = (idx >= 5) ? doubleWhiteMat : doubleBlackMat;
                const innerBlade = new THREE.Mesh(new THREE.BoxGeometry(cfg.bw, 0.011, innerLen), baseMat);
                innerBlade.position.set(0, 0, innerLen * 0.5);
                fingerPivot.add(innerBlade);

                // 外半段修長開叉黑指羽 (Slotted Black Finger Blade)
                const outerLen = cfg.len * 0.55;
                const outerBlade = new THREE.Mesh(new THREE.BoxGeometry(cfg.bw * 0.58, 0.010, outerLen * 0.75), doubleBlackMat);
                outerBlade.position.set(0, 0, innerLen + outerLen * 0.37);
                fingerPivot.add(outerBlade);

                const tipCone = new THREE.Mesh(new THREE.ConeGeometry(cfg.bw * 0.30, outerLen * 0.32, 6), doubleBlackMat);
                tipCone.rotation.x = Math.PI / 2;
                tipCone.scale.set(1.0, 0.25, 1.0);
                tipCone.position.set(0, 0, innerLen + outerLen * 0.88);
                fingerPivot.add(tipCone);

                outerWingPivot.add(fingerPivot);
                fingerNodes.push({ pivot: fingerPivot, baseUp: cfg.up, idx: idx });
            });

            const wingData = {
                shoulder: shoulderPivot,
                outerWing: outerWingPivot,
                fingers: fingerNodes,
                side: side
            };
            if (side === -1) this.condorFlightWings.left = wingData;
            else this.condorFlightWings.right = wingData;
        });
    }

    // 驅動安地斯神鷲御風展翼滑翔與起降無縫收展翅姿態：
    // flightBlend = 1.0 為高空巨翼滑翔（雙翼平展微揚呈現 V 字上反角、翼面雪白羽區與 8 根黑指羽分明、雙足收於尾下）；
    // flightBlend = 0.0 為安地斯山岩挺立姿態（身軀昂首 -0.55、雙翼收攏貼身露出兩側白斑、雙腿伸直踩踏山岩）！
    animateCondorFlightPose(elapsedTime, flapSpeed = 7.2, flightBlend = 1.0) {
        if (!this.condorFlightRig || !this.condorFlightWings) return;
        const b = Math.max(0.0, Math.min(1.0, flightBlend));
        const fold = 1.0 - b;
        const phase = elapsedTime * flapSpeed;
        const sinW = Math.sin(phase);
        const cosW = Math.cos(phase);

        // 安地斯神鷲以沉穩大氣的熱氣流滑翔與深緩振翅聞名（參考圖 2）
        const shoulderFlap = (0.18 + sinW * 0.36) * b;
        const forwardSweep = (cosW * 0.08) * b;
        const wristFlap = (0.08 + Math.sin(phase - 0.4) * 0.22) * b;

        [this.condorFlightWings.left, this.condorFlightWings.right].forEach((w) => {
            if (!w) return;
            const s = w.side;
            w.shoulder.rotation.z = -s * shoulderFlap + s * fold * 0.16;
            w.shoulder.rotation.y = -s * forwardSweep + s * fold * 1.18;
            w.shoulder.rotation.x = (0.05 + sinW * 0.04) * b - fold * 0.26;
            w.shoulder.scale.setScalar(THREE.MathUtils.lerp(0.60, 1.0, b));

            w.outerWing.rotation.z = -s * wristFlap;
            w.outerWing.rotation.y = -s * (cosW * 0.05) * b + s * fold * 0.45;

            if (w.fingers) {
                w.fingers.forEach((f) => {
                    f.pivot.rotation.x = (f.baseUp + sinW * (0.035 + f.idx * 0.007)) * b;
                });
            }
        });

        if (this.condorFlightBodyPivot) {
            this.condorFlightBodyPivot.position.y = -sinW * 0.035 * b;
            this.condorFlightBodyPivot.rotation.x = THREE.MathUtils.lerp(-0.55, -0.08 + cosW * 0.03, b);
        }
        if (this.condorFlightHead) {
            this.condorFlightHead.rotation.x = THREE.MathUtils.lerp(0.55, 0.08 - cosW * 0.02, b);
        }
        if (this.condorFlightLegs) {
            const legRot = THREE.MathUtils.lerp(0.52, -1.08, b);
            if (this.condorFlightLegs.left) this.condorFlightLegs.left.rotation.x = legRot;
            if (this.condorFlightLegs.right) this.condorFlightLegs.right.rotation.x = legRot;
        }
        if (this.condorFlightTail) {
            this.condorFlightTail.rotation.x = THREE.MathUtils.lerp(-0.30, -0.06 + cosW * 0.04, b);
        }
    }

    // 切換幼雛 / 成年安地斯神鷲形態顯示
    updateCondorStage(stage = 'baby') {
        this.condorStage = stage;
        const isBaby = (stage === 'baby');
        if (this.condorFlightRig) this.condorFlightRig.visible = false;
        if (this.condorBabyGroup) this.condorBabyGroup.visible = isBaby;
        if (this.condorAdultGroup) this.condorAdultGroup.visible = !isBaby;
        this.eyeLeft = isBaby ? this.condorBabyEyeL : this.condorAdultEyeL;
        this.eyeRight = isBaby ? this.condorBabyEyeR : this.condorAdultEyeR;
    }

    // ─────────────────────────────────────────────────────────
    //  🦅 安地斯神鷲專屬動態引擎：
    //  - 幼雛（圖 4）：肉桂褐絨毛小雛鳥歪頭殺、微張小翅膀興奮拍動、張嘴索食（按切換鍵前保持幼崽型態！）
    //  - 成年皇（圖 1/2/3）：
    //    1. 站立時展現厚實雪白絨毛頸圈與兩側醒目純白翼斑（圖 1）
    //    2. 開心時展現「安地斯山巔日光浴大展翼」（圖 3）
    //    3. 起飛 <-> 高空 3.3m 巨翼御風滑翔（圖 2） <-> 收翼伸足降落回山岩無縫過渡！
    // ─────────────────────────────────────────────────────────
    updateCondor(delta, elapsedTime) {
        const t = elapsedTime;
        const isGameFlying = (this.currentState === 'condor_flying');
        const isBaby = (this.condorStage === 'baby');

        // 幼雛期觸發飛行小遊戲時：山岩留在地面，肉桂褐絨毛小神鷲雛拍動絨毛小翅膀飛翔，起飛與降落皆為幼雛！
        if (isGameFlying && isBaby) {
            if (this.condorFlightRig) this.condorFlightRig.visible = false;
            if (this.condorAdultGroup) this.condorAdultGroup.visible = false;
            if (this.condorPerchGroup) {
                this.condorPerchGroup.visible = true;
                this.condorPerchGroup.position.set(-this.group.position.x, -this.group.position.y, -this.group.position.z);
                this.condorPerchGroup.rotation.set(-this.group.rotation.x, -this.group.rotation.y, -this.group.rotation.z);
            }
            if (this.condorBabyGroup) {
                this.condorBabyGroup.visible = true;
                this.condorBabyGroup.position.y = 0.44 + Math.sin(t * 14) * 0.03;
                if (this.condorBabyWings && this.condorBabyWings.left) {
                    const flap = Math.sin(t * 18) * 0.45;
                    this.condorBabyWings.left.rotation.z = 0.52 + flap;
                    this.condorBabyWings.right.rotation.z = -0.52 - flap;
                }
            }
            return;
        }

        // 眨眼動畫
        this.nextBlinkTime = (this.nextBlinkTime || 3.0) - delta;
        if (this.nextBlinkTime <= 0) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.nextBlinkTime = 2.8 + Math.random() * 3.5;
        }
        if (this.isBlinking) {
            this.blinkProgress += delta * 12;
            const eyeScaleY = Math.max(0.1, Math.abs(Math.sin(this.blinkProgress)));
            if (this.eyeLeft) this.eyeLeft.scale.y = eyeScaleY;
            if (this.eyeRight) this.eyeRight.scale.y = eyeScaleY;
            if (this.blinkProgress >= Math.PI) {
                this.isBlinking = false;
                if (this.eyeLeft) this.eyeLeft.scale.y = 1;
                if (this.eyeRight) this.eyeRight.scale.y = 1;
            }
        } else if (this.currentState === 'sleep') {
            if (this.eyeLeft) this.eyeLeft.scale.y = 0.12;
            if (this.eyeRight) this.eyeRight.scale.y = 0.12;
        } else {
            if (this.eyeLeft && this.eyeLeft.scale.y !== 1) this.eyeLeft.scale.y = 1;
            if (this.eyeRight && this.eyeRight.scale.y !== 1) this.eyeRight.scale.y = 1;
        }

        // 🦅 成年安地斯神鷲自主御風滑翔控制器
        if (!this.birdFlight) {
            this.birdFlight = {
                timer: 7.5 + Math.random() * 6.0,
                phase: 'perch',
                phaseTime: 0.0,
                flightAngle: 0.0
            };
        }

        const bf = this.birdFlight;
        const isIdle = (this.currentState === 'idle' || !this.currentState);

        if (isIdle && !isBaby) {
            if (bf.phase === 'perch') {
                bf.timer -= delta;
                if (bf.timer <= 0) {
                    bf.phase = 'takeoff';
                    bf.phaseTime = 0.0;
                }
            } else if (bf.phase === 'takeoff') {
                bf.phaseTime += delta;
                if (bf.phaseTime >= 1.5) {
                    bf.phase = 'flying';
                    bf.phaseTime = 0.0;
                    bf.flightAngle = 0.0;
                }
            } else if (bf.phase === 'flying') {
                bf.phaseTime += delta;
                bf.flightAngle += delta * 1.25;
                if (bf.phaseTime >= 6.0) {
                    bf.phase = 'landing';
                    bf.phaseTime = 0.0;
                }
            } else if (bf.phase === 'landing') {
                bf.phaseTime += delta;
                if (bf.phaseTime >= 1.8) {
                    bf.phase = 'perch';
                    bf.phaseTime = 0.0;
                    bf.timer = 11.0 + Math.random() * 7.0;
                }
            }
        } else {
            bf.phase = 'perch';
            bf.timer = 10.0;
        }

        // ✈️ 若處於安地斯神鷲飛行小遊戲 ('condor_flying') 或成年待機自主御風滑翔 ('takeoff' | 'flying' | 'landing')：
        // 安地斯山岩留在地面原位 (0,0,0)，神鷲展開 3.3m 黑白巨翼與 8 指初級飛羽御風升空！
        const isAutoAirborne = isIdle && !isBaby && (bf.phase === 'takeoff' || bf.phase === 'flying' || bf.phase === 'landing');
        if ((isGameFlying || isAutoAirborne) && this.condorFlightRig) {
            if (this.condorBabyGroup) this.condorBabyGroup.visible = false;
            if (this.condorAdultGroup) this.condorAdultGroup.visible = false;
            this.condorFlightRig.visible = true;

            if (isGameFlying) {
                // 小遊戲中將安地斯岩石台座反向補償固定在地面原點，絕不抓著岩石飛上天！
                if (this.condorPerchGroup) {
                    this.condorPerchGroup.visible = true;
                    this.condorPerchGroup.position.set(-this.group.position.x, -this.group.position.y, -this.group.position.z);
                    this.condorPerchGroup.rotation.set(-this.group.rotation.x, -this.group.rotation.y, -this.group.rotation.z);
                }
                this.condorFlightRig.position.set(0, 0.64, 0);
                this.condorFlightRig.rotation.set(0, 0, 0);
                this.animateCondorFlightPose(t, 8.0, 1.0);
                return;
            }

            if (this.condorPerchGroup) {
                this.condorPerchGroup.visible = true;
                this.condorPerchGroup.position.set(0, 0, 0);
                this.condorPerchGroup.rotation.set(0, 0, 0);
            }

            if (bf.phase === 'takeoff') {
                const p = Math.min(1.0, bf.phaseTime / 1.5);
                const easeP = 1 - Math.pow(1 - p, 2);
                const blend = Math.min(1.0, p / 0.45);
                this.condorFlightRig.position.set(0, THREE.MathUtils.lerp(0.64, 2.12, easeP), THREE.MathUtils.lerp(0, 0.35, easeP));
                this.condorFlightRig.rotation.set(-0.16 * Math.sin(p * Math.PI), 0, 0);
                this.animateCondorFlightPose(t, 9.5, blend);
            } else if (bf.phase === 'flying') {
                const fa = bf.flightAngle;
                const rx = Math.sin(fa) * 1.55;
                const rz = Math.cos(fa) * 1.18;
                const ry = 2.12 + Math.sin(fa * 2.0) * 0.20;
                const vx = Math.cos(fa) * 1.55;
                const vz = -Math.sin(fa) * 1.18;
                this.condorFlightRig.position.set(rx, ry, rz);
                this.condorFlightRig.rotation.y = Math.atan2(vx, vz);
                this.condorFlightRig.rotation.z = -0.22;
                this.condorFlightRig.rotation.x = -Math.cos(fa * 2.0) * 0.06;
                this.animateCondorFlightPose(t, 6.8, 1.0);
            } else if (bf.phase === 'landing') {
                const p = Math.min(1.0, bf.phaseTime / 1.8);
                const easeP = p * p * (3 - 2 * p);
                const blend = Math.max(0.0, 1.0 - Math.max(0.0, (p - 0.35) / 0.65));
                this.condorFlightRig.position.x = THREE.MathUtils.lerp(this.condorFlightRig.position.x, 0, easeP);
                this.condorFlightRig.position.z = THREE.MathUtils.lerp(this.condorFlightRig.position.z, 0, easeP);
                this.condorFlightRig.position.y = THREE.MathUtils.lerp(2.12, 0.64, easeP);
                this.condorFlightRig.rotation.x = THREE.MathUtils.lerp(0, -0.12, Math.sin(p * Math.PI));
                this.condorFlightRig.rotation.z = THREE.MathUtils.lerp(this.condorFlightRig.rotation.z, 0, easeP);
                this.condorFlightRig.rotation.y = THREE.MathUtils.lerp(this.condorFlightRig.rotation.y, 0, easeP);
                this.animateCondorFlightPose(t, 7.5, blend);
            }
            return;
        }

        // 非飛行狀態：恢復岩石台座與站立模型
        if (this.condorFlightRig) this.condorFlightRig.visible = false;
        if (this.condorPerchGroup) {
            this.condorPerchGroup.visible = true;
            this.condorPerchGroup.position.set(0, 0, 0);
            this.condorPerchGroup.rotation.set(0, 0, 0);
        }
        if (this.condorBabyGroup) this.condorBabyGroup.visible = isBaby;
        if (this.condorAdultGroup) this.condorAdultGroup.visible = !isBaby;

        if (isBaby) {
            if (!this.condorBabyGroup) return;
            const breathe = Math.sin(t * 3.5) * 0.014;
            this.condorBabyGroup.position.y = 0.44 + breathe;

            if (this.currentState === 'happy') {
                // 幼雛開心拍動絨毛小翅膀（還原圖 4 站在岩石上張開絨毛小翅膀的可愛模樣！）
                this.condorBabyHead.rotation.z = Math.sin(t * 7) * 0.16;
                this.condorBabyHead.rotation.x = -0.12 + Math.sin(t * 9) * 0.08;
                if (this.condorBabyBeak) this.condorBabyBeak.rotation.x = 0.20 + Math.sin(t * 12) * 0.12;
                const flap = Math.sin(t * 12) * 0.38;
                if (this.condorBabyWings.left) this.condorBabyWings.left.rotation.z = 0.52 + flap;
                if (this.condorBabyWings.right) this.condorBabyWings.right.rotation.z = -0.52 - flap;
            } else if (this.currentState === 'eat') {
                this.condorBabyHead.rotation.x = 0.26 + Math.sin(t * 8) * 0.12;
                if (this.condorBabyBeak) this.condorBabyBeak.rotation.x = Math.abs(Math.sin(t * 10)) * 0.18;
            } else if (this.currentState === 'pet') {
                this.condorBabyHead.rotation.z = 0.28 + Math.sin(t * 2.5) * 0.05;
                this.condorBabyHead.rotation.x = -0.08;
            } else if (this.currentState === 'sleep') {
                this.condorBabyGroup.position.y = 0.38;
                this.condorBabyHead.rotation.x = 0.22;
                if (this.condorBabyWings.left) this.condorBabyWings.left.rotation.z = 0.15;
                if (this.condorBabyWings.right) this.condorBabyWings.right.rotation.z = -0.15;
            } else {
                // 待機：100% 還原用戶附圖——半展扇形絨羽小翅膀、歪頭眨著大眼、胸腹呼吸微動
                this.condorBabyHead.rotation.z = Math.sin(t * 1.4) * 0.16;
                this.condorBabyHead.rotation.y = Math.sin(t * 0.85) * 0.22;
                this.condorBabyHead.rotation.x = Math.sin(t * 1.1) * 0.04;
                if (this.condorBabyBeak) this.condorBabyBeak.rotation.x = 0;
                const gentleFlap = Math.sin(t * 2.4) * 0.06;
                if (this.condorBabyWings.left) this.condorBabyWings.left.rotation.z = 0.56 + gentleFlap;
                if (this.condorBabyWings.right) this.condorBabyWings.right.rotation.z = -0.56 - gentleFlap;
            }
        } else {
            if (!this.condorAdultGroup) return;
            const breathe = Math.sin(t * 2.0) * 0.015;

            if (this.currentState === 'happy') {
                // 🌟 經典參考圖 3 姿態：安地斯山巔霸氣半展翼日光浴姿態！
                this.condorAdultGroup.position.set(0, 0.64 + breathe, 0);
                this.condorAdultGroup.rotation.set(0, 0, 0);
                this.condorAdultHead.rotation.x = 0.55 - 0.18;
                this.condorAdultHead.rotation.y = Math.sin(t * 2.2) * 0.15;
                if (this.condorAdultBeak) this.condorAdultBeak.rotation.x = 0.18 + Math.sin(t * 6) * 0.06;

                const sunSpread = 0.92 + Math.sin(t * 3.5) * 0.12;
                if (this.condorAdultWings.left) {
                    this.condorAdultWings.left.rotation.z = sunSpread;
                    this.condorAdultWings.left.rotation.y = -0.25;
                }
                if (this.condorAdultWings.right) {
                    this.condorAdultWings.right.rotation.z = -sunSpread;
                    this.condorAdultWings.right.rotation.y = 0.25;
                }
            } else if (this.currentState === 'eat') {
                this.condorAdultGroup.position.set(0, 0.64 + breathe, 0);
                this.condorAdultHead.rotation.x = 0.55 + 0.32 + Math.sin(t * 8) * 0.15;
                if (this.condorAdultBeak) this.condorAdultBeak.rotation.x = Math.abs(Math.sin(t * 8)) * 0.18;
            } else if (this.currentState === 'pet') {
                this.condorAdultGroup.position.set(0, 0.64 + breathe, 0);
                this.condorAdultHead.rotation.x = 0.55 - 0.08;
                this.condorAdultHead.rotation.z = 0.12;
            } else if (this.currentState === 'sleep') {
                this.condorAdultGroup.position.set(0, 0.55, 0);
                this.condorAdultHead.rotation.x = 0.55 + 0.22;
            } else {
                // 參考圖 1：巍峨佇立於安地斯岩石上，雪白絨毛頸圈與兩側純白翼斑熠熠生輝
                this.condorAdultGroup.position.set(0, 0.64 + breathe, 0);
                this.condorAdultGroup.rotation.set(0, 0, 0);
                this.condorAdultHead.rotation.x = 0.55 + Math.sin(t * 1.3) * 0.03;
                this.condorAdultHead.rotation.y = Math.sin(t * 0.75) * 0.26;
                this.condorAdultHead.rotation.z = 0;
                if (this.condorAdultBeak) this.condorAdultBeak.rotation.x = 0;
                if (this.condorAdultWings.left) {
                    this.condorAdultWings.left.rotation.z = 0.10;
                    this.condorAdultWings.left.rotation.y = -0.08;
                }
                if (this.condorAdultWings.right) {
                    this.condorAdultWings.right.rotation.z = -0.10;
                    this.condorAdultWings.right.rotation.y = 0.08;
                }
            }
        }
    }
}


