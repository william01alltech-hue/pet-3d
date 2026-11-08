/**
 * 3D 萌寵成長日記 (3D Multi-Pet Virtual Simulator)
 * 支援全黑立耳小黑狗、緬因貓幼崽與三色狐狸幼崽 (赤狐/北極狐/銀狐) 的領養、切換、養成與存檔管理
 */

class BlackDogGame {
    constructor() {
        // 多寵物家族資料庫 (初始僅有小黑犬 黑寶)
        this.defaultInitialPets = [
            {
                id: 'pet_black_dog',
                type: 'dog',
                variant: 'default',
                name: '黑寶 (Kuro)',
                level: 1,
                exp: 0,
                maxExp: 100,
                equipped: { collar: 'red_collar', glasses: null, hat: null, cape: null }
            }
        ];

        this.adoptedPets = JSON.parse(JSON.stringify(this.defaultInitialPets));
        this.currentPetId = 'pet_black_dog';
        this.currentSaveSlot = localStorage.getItem('pet_active_slot') || 'pet_save_slot_1';

        this.coins = 200;
        this.isSleeping = false;
        this.currentTheme = 'room';

        // 核心狀態
        this.stats = {
            hunger: 85,
            mood: 90,
            energy: 80,
            clean: 95
        };

        // 訓練特技
        this.skills = {
            sit: { name: '乖乖坐好 (Sit)', icon: '🪑', level: 1, maxLevel: 5, unlocked: true, desc: '學會乖乖收起後腿端坐' },
            paw: { name: '搭搭小肉爪 (Paw)', icon: '🐾', level: 0, maxLevel: 5, unlocked: false, reqLv: 2, desc: '伸出軟軟的小爪碰碰你的手' },
            spin: { name: '追小尾巴 (Spin)', icon: '💫', level: 0, maxLevel: 5, unlocked: false, reqLv: 3, desc: '追著自己可愛的小尾巴原地轉圈' },
            rollover: { name: '翻肚肚撒嬌 (Roll)', icon: '🔄', level: 0, maxLevel: 5, unlocked: false, reqLv: 4, desc: '露出軟綿綿的肚子討摸摸' },
            bark: { name: '大聲發出叫聲 (Vocal)', icon: '📢', level: 0, maxLevel: 5, unlocked: false, reqLv: 5, desc: '挺起胸膛發出專屬清脆叫聲' }
        };

        this.records = {
            daysAccomp: 1,
            feedsCount: 0,
            petCount: 0,
            gamesPlayed: 0,
            bathCount: 0,
            startTime: Date.now()
        };

        this.inventory = ['red_collar', 'theme_room'];
        this.speechTimer = null;

        // 專屬食物食譜 (嚴格對應各種動物生理習性)
        this.petDietMap = {
            harpy: ['chicken', 'banana'], // 哈比鷹：雞和香蕉
            maned_wolf: ['chicken', 'milk', 'biscuit', 'puree'], // 鬃狼：雞和汪汪配方奶和磨牙骨小餅乾和肉泥
            hyena: ['chicken', 'milk', 'biscuit', 'puree'],      // 鬣狗
            cheetah: ['chicken', 'milk', 'biscuit', 'puree'],    // 獵豹
            dog: ['chicken', 'milk', 'biscuit', 'puree'],        // 小黑
            fox: ['chicken', 'milk', 'biscuit', 'puree'],        // 狐狸
            wolf: ['chicken', 'milk', 'biscuit', 'puree'],       // 黑狼
            elephant: ['grass', 'banana'],                       // 大象：草和香蕉
            bat: ['banana'],                                     // 狐蝠：香蕉
            gibbon: ['banana'],                                  // 長臂猿：香蕉
            orca: ['tuna'],                                      // 虎鯨：鮪魚
            crow: ['nuts'],                                      // 烏鴉：堅果
            capybara: ['grass', 'banana'],                       // 水豚：青草與香蕉
            red_panda: ['banana', 'grass', 'biscuit'],           // 小熊貓：香蕉、嫩竹青草、小餅乾
            snow_leopard: ['chicken', 'milk', 'biscuit', 'puree'], // 雪豹：鮮雞塊、配方奶、餅乾、肉泥
            penguin: ['tuna'],                                   // 帝企鵝：深海鮪魚
            sea_otter: ['tuna'],                                 // 海獺：深海鮪魚與海味
            koala: ['grass', 'banana'],                          // 無尾熊：尤加利鮮嫩青草與香蕉
            bunny: ['grass', 'banana', 'biscuit'],               // 垂耳兔：青草、香蕉與磨牙餅乾
            lion: ['chicken', 'milk', 'biscuit', 'puree'],       // 非洲獅：鮮雞塊、配方奶、餅乾、肉泥
            panda: ['grass', 'banana', 'milk', 'biscuit'],       // 大熊貓：鮮竹青草、香蕉、配方奶、餅乾
            fennec: ['chicken', 'milk', 'biscuit', 'puree', 'banana'], // 耳廓狐：雞肉、配方奶、餅乾、肉泥、水果香蕉
            giraffe: ['grass', 'banana'],                        // 長頸鹿：金合歡青草與香甜香蕉
            polar_bear: ['tuna', 'chicken', 'milk', 'puree'],    // 北極熊：深海鮪魚、鮮雞塊、配方奶、肉泥
            hamster: ['nuts', 'banana', 'biscuit'],              // 黃金倉鼠：堅果瓜子、香蕉、小餅乾
            hedgehog: ['chicken', 'banana', 'biscuit', 'puree'], // 森林小刺蝟：鮮雞塊、水果香蕉、餅乾、肉泥
            dolphin: ['tuna'],                                   // 瓶鼻海豚：深海極鮮鮪魚
            tiger: ['chicken', 'milk', 'biscuit', 'puree'],      // 孟加拉虎：鮮雞塊、配方奶、餅乾、肉泥
            condor: ['chicken', 'puree', 'banana']               // 安地斯神鷲：鮮嫩雞塊、高蛋白肉泥、香甜熟香蕉
        };

        // 8 種美味食物資料表
        this.foodDetails = {
            chicken: { name: '鮮嫩鮮雞塊', icon: '🍗', hunger: 45, energy: 20, mood: 25, price: 15, exp: 25 },
            banana: { name: '香甜熟香蕉', icon: '🍌', hunger: 40, mood: 35, energy: 15, price: 10, exp: 22 },
            milk: { name: '汪汪配方奶', icon: '🍼', hunger: 25, energy: 20, mood: 15, price: 0, exp: 12 },
            biscuit: { name: '磨牙骨小餅乾', icon: '🦴', hunger: 30, mood: 35, energy: 15, price: 12, exp: 20 },
            puree: { name: '特製軟嫩肉泥', icon: '🍲', hunger: 50, mood: 25, energy: 20, price: 15, exp: 26 },
            grass: { name: '草原鮮嫩青草', icon: '🌿', hunger: 35, energy: 30, mood: 20, price: 8, exp: 18 },
            tuna: { name: '深海極鮮鮪魚', icon: '🐟', hunger: 55, mood: 40, energy: 25, price: 18, exp: 30 },
            nuts: { name: '香脆綜合堅果', icon: '🌰', hunger: 35, mood: 30, energy: 20, price: 10, exp: 20 }
        };

        // 食物中毒狀態與定時器
        this.isPoisoned = false;
        this.poisonInterval = null;

        // 各種寵物專屬台詞庫
        this.dialogueBank = {
            dog: {
                idle: ['嚶嚶～ 汪！主人抱抱！🐾', '（立耳左右抖動，歪著頭看你）🍼', '小短尾巴開心地像雨刷一樣狂搖～ ✨', '黑寶最喜歡主人了！❤️'],
                hungry: ['肚子空空的，想喝溫熱配方奶！🍼', '想吃香噴噴幼犬牛肉泥～ 🍲', '乳牙癢癢的，想要小磨牙棒！🦴'],
                tired: ['揉眼睛，想去軟墊窩窩呼呼大睡～ 💤', '（打了個萌萌的小哈欠）🥱'],
                dirty: ['身上沾到毛屑啦，想要洗香香的泡泡澡！🛁'],
                bored: ['想去草地上玩接飛盤！🥏', '快抓抓黑寶的下巴嘛～ ✋']
            },
            crow: {
                idle: [
                    '（黑煤球歪著圓圓小腦袋，水靈靈大眼睛瞅著你）🐥 唧唧～！',
                    '噗噗噗！小絨毛翅膀興奮地快速拍動！🪶',
                    '唧唧～ 想要主人用掌心暖暖地托著！❤️',
                    '（優雅地梳理黑曜石羽翼，眼神敏銳沉穩）🪶 嘎——！',
                    '「主人，今天也找到亮晶晶的漂亮寶物送給你！」✨🪙',
                    '（展開寬大黑曜石雙翼，英氣勃發地昂首迎風）我是守護你的暗夜使者！🦅'
                ],
                hungry: [
                    '張大嫩粉色嘴角，嗷嗷待哺等吃美味肉泥！🍼',
                    '（興奮扇動小肉翅索食）唧唧！肚子餓扁啦！🍲',
                    '烏鴉是超聰明的雜食者，想吃美味漿果與高蛋白肉肉！🥩'
                ],
                tired: [
                    '（縮成一個黑芝麻小毛球，小腦袋埋進絨毛裡）💤',
                    '呼嚕... 渡鴉在靜謐夜空中展翅滑翔... 🌙'
                ],
                dirty: [
                    '黑曜石羽毛要保持油亮光澤，快給我洗個清爽泡泡澡！🛁',
                    '身上沾到灰塵啦，想拍拍翅膀洗香香！🚿'
                ],
                bored: [
                    '想去草地上玩接飛盤與藏硬幣遊戲！🪙',
                    '快輕輕撫摸我喉部的帥氣披針刺羽！✋',
                    '（蹦蹦跳跳小碎步繞著你轉圈圈）唧唧～！🐾'
                ]
            },
            maned_wolf: {
                idle: [
                    '（邁著逆天黑長襪大長腿，優雅在草地上踱步）🌾 喔—汪！',
                    '大家都叫我「長腿狐狸」，但其實我是獨一無二的南美鬃狼！✨',
                    '（頸背帥氣黑鬃毛蓬起，昂首遠眺原野）我是原野上的九頭身超模！👠',
                    '小時候還是灰撲撲的小短腿毛球，長大後腿長驚豔全場！🐾',
                    '（晃了晃白尖大蓬尾，大耳朵機靈地轉動）主人，今天也是超模步態的一天！❤️'
                ],
                hungry: [
                    '肚子咕嚕嚕叫啦！鬃狼最喜歡吃美味的狼果（Solanum）和高蛋白肉泥！🍎🥩',
                    '這雙大長腿奔馳好消耗熱量呀，想吃香噴噴大餐！🍲'
                ],
                tired: [
                    '（優雅折疊四條大長腿，白尾尖搭在爪前入眠）💤',
                    '呼嚕... 夢見自己在黃昏金色稀樹草原漫步... 🌾'
                ],
                dirty: [
                    '黑色過膝長襪上沾到泥巴啦，想要洗個香噴噴泡泡澡！🛁',
                    '美麗的金橘紅毛髮要保持乾淨清爽！🚿'
                ],
                bored: [
                    '想去草地上大步流星狂奔接飛盤！🥏',
                    '快摸摸我後頸上軟蓬蓬的高聳黑鬃毛！✋',
                    '（興奮地踩著高蹺小跳步，黑鬃毛炸毛豎立）嗷嗚～！✨'
                ]
            },
            elephant: {
                idle: [
                    '（大耳朵扇呀扇～長鼻捲起甜甜的微風）啵啵～！🐘✨',
                    '主人你看！我的小象鼻今天學會靈巧抓取小青草了！🍃',
                    '（踏著穩健的厚厚腳掌，小短尾巴晃呀晃）跟在主人身後最安心啦！🐾',
                    '「象群的記憶永遠不會忘記最愛的人」—— 我會永遠記得你！❤️',
                    '（長鼻昂首朝天，吹出一曲歡快銅管小象鳴）嗚昂～！🎺'
                ],
                hungry: [
                    '肚子咕嚕嚕響得像雷聲啦！想吃大捆香甜嫩草和多汁大胡蘿蔔！🥕🌾',
                    '大象是超級大胃王哦～想吃滿滿一整盆水果沙拉！🍉🍎'
                ],
                tired: [
                    '（厚厚大耳朵自然垂下，長鼻放鬆捲在腳邊）好睏好睏... 💤',
                    '夢見非洲大草原的金色夕陽和清涼的大泥坑... 🌾'
                ],
                dirty: [
                    '雖然大象喜歡滾泥巴防曬，但現在好想洗個清爽泡泡澡！🛁',
                    '快用大噴頭幫我的大耳朵和長鼻洗白白～ 🚿💦'
                ],
                bored: [
                    '想去大水池吸滿水噴水花玩！💦',
                    '快輕輕撫摸我的額頭和軟軟的大扇耳！✋',
                    '（興奮地高昂長鼻長嘯，威武象牙在陽光下閃閃發光）昂嗚——！👑'
                ]
            },
            harpy: {
                idle: [
                    '（抖了抖頭頂傲岸的雙叉王冠羽，金色鷹隼魔眸微瞇）唳——！🦅✨',
                    '身為亞馬遜雨林天花板，我的握力可是能輕鬆捏碎堅硬樹幹的！👑',
                    '（收攏厚重的黑灰鐵羽大翼，俯瞰全場）今天也是俯瞰萬里樹冠的一天！🌿',
                    '小時候我可是台北市立動物園最受歡迎的白雪棉花糖小雛鳥呢～🐥',
                    '快看我粗壯的斑馬條紋巨腿和黑金巨爪，帥氣吧！🐾',
                    '（棲息在大原木上歪頭打量著你，眼周墨色羽輪輕眨）啾啾～！'
                ],
                hungry: [
                    '肚子咕嚕嚕叫了！想吃大塊鮮嫩多汁的高蛋白鮮肉！🥩🍗',
                    '雨林空中霸主需要補充體力，準備去空中巡獵啦！🍲'
                ],
                tired: [
                    '（王冠羽舒緩放平，雙翼緊緊裹住身軀）哈欠... 想棲息在最高樹冠上入眠... 💤',
                    '夢見自己在熱帶雨林狂風中傲然展翼飛翔... 🌲'
                ],
                dirty: [
                    '一身黑白分明的威武羽衣不能沾染灰塵，想洗個清爽的瀑布泡泡浴！🛁',
                    '快幫我梳理胸前的墨黑羽甲胸帶！🚿'
                ],
                bored: [
                    '想要衝上雲霄做急速俯衝特技飛行！🥏',
                    '快輕輕撫摸我頭頂柔順的雙叉王冠羽！✋',
                    '（興奮地王冠羽完全炸開，雙翼展開發出刺破蒼穹的長嘯）昂唳——！✨'
                ]
            },
            orca: {
                idle: [
                    '（在蔚藍水波中輕快翻滾，背鰭劃開晶瑩浪花）嚶嗚～！🐋✨',
                    '虎鯨可是海洋中智慧最高的頂級霸主哦！我們有專屬的家族方言和海豚音！🌊',
                    '（頂了頂圓滾滾的西瓜頭，噴氣孔噴出一小朵彩虹水花）噗咻～！🌈',
                    '看我標誌性的黑白燕尾服配色和帥氣大背鰭，是不是海洋中最優雅的？👑',
                    '（擺動寬大的新月尾鰭，在身邊轉圈圈蹭蹭你）最喜歡和主人一起在碧海裡暢泳啦！❤️',
                    '（發出清脆的咔噠咔噠回聲定位聲波探測四周）嘀嘀～探測到最喜歡的主人！'
                ],
                hungry: [
                    '肚子空空啦！想吃大條新鮮肥美的鮭魚和多汁小魚！🐟🍣',
                    '海洋獵手需要滿滿能量，準備來一場深海巡航覓食！🍲'
                ],
                tired: [
                    '（雙眼輕輕半闔，浮在平靜如鏡的蔚藍海面上輕輕漂流）呼嚕嚕... 💤',
                    '夢見自己跟著虎鯨家族一起躍過南極冰洋與金黃夕陽... 🌅'
                ],
                dirty: [
                    '皮膚上沾了小海藻，想去海面做個清爽大跳躍洗個泡泡澡！🛁',
                    '快幫我把光滑油亮的黑白皮膚擦得晶瑩剔透！🚿'
                ],
                bored: [
                    '想要來一記超級帥氣的海面後空翻大躍擊！🥏',
                    '快摸摸我光滑的小腦袋和高聳的黑背鰭！✋',
                    '（興奮地噴氣孔大噴水花，發出空靈悠揚的虎鯨長鳴）呼咻——！✨'
                ]
            },
            gibbon: {
                idle: [
                    '（兩手抓著雨林老藤輕盈蕩秋千，金色蓬鬆長毛在微風中飄揚）嗚呼～！🐒✨',
                    '「兩岸猿聲啼不住」說的就是我們長臂猿！我的天籟啼鳴可以傳遍整座熱帶雨林！🌿',
                    '（伸長柔韌纖長的手臂，做出可愛的討抱抱姿勢）快抱抱我嘛～！❤️',
                    '我們長臂猿是樹冠上的臂行大師，在萬丈高空飛蕩就像走平地一樣靈巧！👑',
                    '小時候我最喜歡縮在樹杈間，像一顆軟綿綿金黃色的小毛球～🍼',
                    '（眨了眨靈動黑曜石大眼，輕巧翻身抓住另一根老藤）嘻嘻，抓不到我吧！'
                ],
                hungry: [
                    '肚子咕嚕嚕了！好想吃甜甜多汁的成熟野生無花果和香蕉！🍌🍇',
                    '樹冠跳躍需要滿滿體力，想吃一整大碗熱帶水果總匯！🍍'
                ],
                tired: [
                    '（收攏長長的手臂蜷在樹杈間，小腦袋靠在毛茸茸膝蓋上）哈欠... 💤',
                    '夢見自己在雨林清晨的薄霧與金色朝陽中隨風蕩漾... 🌅'
                ],
                dirty: [
                    '金色毛衣上沾了小樹葉和花粉，想洗個香噴噴的雨林花瓣泡泡澡！🛁',
                    '快幫我把金黃色長毛梳理得蓬鬆發亮～ 🚿✨'
                ],
                bored: [
                    '想要來一場驚險刺激的高空樹冠大飛蕩！🥏',
                    '快摸摸我頭頂黑金相間的帥氣毛冠和柔軟小臉蛋！✋',
                    '（興奮地仰頭引吭高歌，發出穿透萬里雲霄的天籟雙重奏長鳴）呼咿——呼咿——！🎶✨'
                ]
            },
            fox: {
                idle: ['嚶嚶咿～ （大蓬尾巴歡快地搖動）🦊', '（大尖耳朵機靈地轉動）✨', '小狐狸蹦蹦跳跳向你討抱抱！❤️', '小爪子輕輕踩踩你的手心～ 🐾'],
                hungry: ['嚶嚶～ 想吃香脆小骨頭和美味肉肉！🍖', '肚子餓扁啦，想要吃好料！🍲'],
                tired: ['把大尾巴抱在懷裡當枕頭想睡覺～ 💤', '（縮成一個毛茸茸的小雪球）🥱'],
                dirty: ['身上沾了落葉，想要洗香香泡泡澡！🛁'],
                bored: ['想去戶外草地跑跳撲飛盤！🥏', '揉揉小狐狸的尖尖大耳朵嘛～ ✋']
            },
            bat: {
                idle: ['吱吱～ （眨著水汪汪的大黑眼睛看著你）🦇', '（小耳朵靈巧地前後動了動）✨', '裹在軟綿綿的毛巾捲裡好舒服～ 🧣', '倒過來看主人也是超級好看！❤️'],
                hungry: ['吱咿～ 想吃香甜熟透的大香蕉！🍌', '小肚子咕嚕咕嚕，香蕉在哪裡呢？🍼'],
                tired: ['（舒服地縮進毛巾捲裡打哈欠）💤', '把小翅膀裹成小黑繭準備睡覺啦～ 😴'],
                dirty: ['毛巾弄髒髒了，想要洗得香噴噴乾淨！🛁'],
                bored: ['想要展開小翅膀撲騰撲騰～ 🪽', '輕輕摸摸小狐蝠的鼓鼓小臉頰嘛！✋']
            },
            wolf: {
                idle: ['嗷嗚～ （挺起胸膛，冰藍魔眸專注地凝望著你）🐺', '（抖了抖身上的細碎雪花，毛髮蓬鬆深邃）❄️', '雪原的孤狼，願一生為主人忠誠守護！❤️', '輕輕用毛茸茸的狼吻蹭了蹭你的手掌～ 🐾'],
                hungry: ['嗷嗚～ 想吃新鮮鮮美的大塊肉肉！🥩', '肚子咕嚕嚕響，該補充雪原體能啦！🍲'],
                tired: ['（將大蓬鬆長狼尾圈在身側蜷縮入眠）💤', '呼嚕... 狼王在夢中奔跑在落雪森林... 🌲'],
                dirty: ['毛髮沾了雪泥，想要洗個暖烘烘的熱水澡！🛁'],
                bored: ['想對著夜空放聲長嚎～ 🌕', '快摸摸黑狼厚實溫暖的頸部鬃毛！✋']
            },
            hyena: {
                idle: ['嘿嘿嘿～ （咧嘴發出歡快的咯咯笑聲）🦴', '（前肢修長昂揚，後腿微蹲警惕地環視草原）🌾', '在荒野我是最強的耐力奔跑者，但在你身邊只想撒嬌！❤️', '（用寬厚的圓圓大耳朵輕碰你的手心）🐾'],
                hungry: ['咯咯～ 肚子咕嚕叫了！想啃香脆的大骨頭和鮮肉！🥩', '草原獵手需要補充蛋白質啦！🦴'],
                tired: ['（前長後短地伏低趴在草地上伸懶腰）💤', '呼嚕... 夢見在廣袤的稀樹草原上奔跑... 🌅'],
                dirty: ['泥巴沾滿了棕色斑點毛皮，想要洗個舒服的泡泡浴！🛁'],
                bored: ['嘿嘿嘿！想在原野上追逐奔跑呀！🐾', '快摸摸我脖頸上帥氣的深色鬃毛！✋']
            },
            cheetah: {
                idle: ['啾啾～ （歪著小腦袋，清澈琥珀大眼好奇看著你）🐆', '（甩了甩長長黑環平衡舵尾巴，身姿靈巧修長）✨', '我是陸地極速之王，但我最想和你一起在原野奔馳！❤️', '（用帶著招牌黑淚痕的小臉蛋輕蹭你的手心）🐾'],
                hungry: ['啾咿～ 肚子咕嚕咕嚕！想吃鮮嫩的大肉肉補充電能！🥩', '極速衝刺需要好多蛋白質熱量呀！🍖'],
                tired: ['（將修長的前腿疊在一起，呼嚕嚕打哈欠）💤', '呼嚕... 夢見自己化為金色閃電掠過金合歡草原... 🌅'],
                dirty: ['全速奔馳時揚起好多沙塵，想要洗個香噴噴泡泡浴！🛁'],
                bored: ['啾！想去大草原上全速狂奔賽跑～ 🐾', '快輕輕撫摸我背上軟綿綿的毛毛！✋']
            },
            capybara: {
                idle: [
                    '（頂著圓滾滾的大蜜柑，眼神充滿看透世事的佛系寧靜）🍊 咕嚕～',
                    '天塌下來也沒關係，先泡個暖呼呼的柚子溫泉再說吧～ ♨️✨',
                    '（小耳朵輕輕晃了晃，萬物皆可停在我頭上）動物界人緣王就是我！🐾',
                    '啾啾～ 跟主人待在一起發呆，就是最幸福的慢活時光！❤️'
                ],
                hungry: ['肚子咕嚕咕嚕了，想慢慢嚼鮮嫩青草和香甜熟香蕉！🌿🍌', '佛系水豚君也需要補充草本能量喔～ 🥗'],
                tired: ['（眼皮半垂，在溫暖的檜木桶裡舒服地打瞌睡）呼嚕嚕... 💤', '夢見自己泡在飄滿金黃柚子的露天溫泉裡... ♨️'],
                dirty: ['毛毛上沾了泥巴，快幫我淋個清爽的溫泉泡泡浴！🛁'],
                bored: ['來玩頭頂疊大蜜柑平衡挑戰吧！🍊', '快摸摸我呆萌的方形大鼻頭！✋']
            },
            red_panda: {
                idle: [
                    '（歪著白臉頰小腦袋，抱著九節蓬鬆大尾巴晃呀晃）🎋 啾咿～！',
                    '（突然雙腳站立、高舉雙手搖晃）「嗷嗚！我很兇喔！有沒有被我萌到？」🙌✨',
                    '我是喜馬拉雅山林裡的火狐小精靈，最喜歡在竹林間爬高高！🐾',
                    '大大的環紋尾巴不只能平衡，冬天還能當最保暖的大圍巾喔！❤️'
                ],
                hungry: ['啾啾！肚子餓了，想吃甜甜的香蕉和鮮嫩翠竹草！🍌🌿', '能再來一塊香脆磨牙小餅乾就更完美啦！🦴'],
                tired: ['（把蓬鬆的九節大尾巴蓋在臉上當眼罩呼呼大睡）💤', '夢見在雲霧繚繞的竹林樹冠上睡午覺... 🎋'],
                dirty: ['赤紅色的漂亮毛衣沾到灰塵啦，想洗個香噴噴泡泡澡！🛁'],
                bored: ['想表演必殺技「雙腳站立舉手裝兇」給你看！🙌', '快揉揉我毛茸茸的白邊圓耳朵嘛～ ✋']
            },
            snow_leopard: {
                idle: [
                    '（冰晶藍魔眸靜靜凝視著你，隨即低頭一口咬住自己的大毛尾巴）❄️ 嗷嗚～',
                    '別看我是高冷的喜馬拉雅雪山之王，其實最喜歡抱著自己的大尾巴撒嬌！🐾',
                    '（抖了抖銀白玫瑰斑紋厚毛，在覆雪岩台上優雅踱步）👑✨',
                    '我的大粗尾巴有身體一樣長，既是高原跳躍平衡器，也是暖暖的抱枕！❤️'
                ],
                hungry: ['嗷嗚～ 雪山獵手肚子餓了，想吃鮮嫩雞塊與特製肉泥！🍗🍲', '補充高蛋白才能在雪峰間凌空飛躍！🍼'],
                tired: ['（用又粗又長的銀白大尾巴圈住全身，把鼻頭埋進毛毛裡）💤', '呼嚕... 夢見在帕米爾高原的璀璨星空下巡視領地... 🏔️'],
                dirty: ['銀白如雪的玫瑰斑毛皮需要洗個清爽泡泡澡！🛁'],
                bored: ['想在雪地上凌空翻躍撲玩具球！🎾', '快摸摸我軟綿綿的大粗尾巴和粉鼻頭！✋']
            },
            penguin: {
                idle: [
                    '（穿著筆挺黑曜石燕尾服，左右搖擺走著呆萌企鵝步）🐧 嘎嗚～！',
                    '小時候我是灰撲撲的奇異果絨毛球，長大後可是南極最帥氣的帝企鵝皇！👑',
                    '（啪嗒啪嗒歡快地拍動小翅膀，露出雪白圓滾滾的大肚皮）❄️✨',
                    '南極冰原再冷，只要貼在主人身邊就暖呼呼的！❤️'
                ],
                hungry: ['嘎嗚！肚子咕嚕叫啦，最想吃深海極鮮大鮪魚！🐟🍣', '南極游泳健將需要補充肥美鮮魚能量！🐟'],
                tired: ['（把小腦袋縮進溫暖的肩膀羽絨裡，站在浮冰上打盹）💤', '夢見在南極極光下的冰海裡暢快潛泳... 🌌'],
                dirty: ['燕尾服羽毛需要梳理清潔，快給我洗個冰爽泡泡浴！🛁'],
                bored: ['想噗通趴下用圓肚皮貼地滑冰大衝刺！🧊🛷', '快摸摸我圓滾滾的白肚皮和小翅膀！✋']
            },
            sea_otter: {
                idle: [
                    '（仰躺在水面上隨波漂浮，兩隻小爪子緊緊抱著粉紅扇貝）🦦 啾咿～！',
                    '我們海獺睡覺時會手牽手並裹上海帶，這樣就不會跟最愛的人漂散啦！🌊❤️',
                    '（用短短的小肉掌揉了揉奶油白圓臉頰，萌度破表）✨',
                    '我腋下有個神祕小口袋，專門藏最喜歡的小石頭和送給主人的大珍珠喔！🦪'
                ],
                hungry: ['肚子咕嚕咕嚕！海獺一天要吃掉體重四分之一的鮮魚海味，想吃深海鮪魚！🐟', '快給我一條肥美大鮪魚補充熱量嘛～ 🍣'],
                tired: ['（在身上裹好海帶被被，牽著主人的手指在水面上安心入睡）💤', '夢見在陽光灑落的海藻森林裡仰泳漂流... 🌊'],
                dirty: ['海獺的毛髮密度是動物界第一名！快幫我洗個泡泡浴梳理蓬鬆毛毛！🛁'],
                bored: ['叩叩叩！想拿私房小石頭在肚皮上敲扇貝開珍珠！🐚🪨', '快摸摸我圓鼓鼓的花生鬍鬚臉頰！✋']
            },
            koala: {
                idle: [
                    '（緊緊抱著尤加利樹幹，毛茸茸的白毛大耳朵輕輕抖動）🐨 咕嚕～',
                    '我一天要睡 20 個小時，剩下的 4 個小時用來吃尤加利葉和跟主人撒嬌！🌿❤️',
                    '（歪著大黑鼻子小腦袋，在樹枝上向你慢吞吞地揮揮手）👋✨',
                    '只要聞到尤加利樹葉的清香，整隻熊都變得好幸福喔～ 🍃'
                ],
                hungry: ['肚子餓啦！想吃鮮嫩多汁的翠綠青草與香甜香蕉！🌿🍌', '快餵我吃香噴噴的草本嫩葉大餐！🥗'],
                tired: ['（把圓滾滾的下巴靠在樹杈上，一秒進入香甜夢鄉）呼嚕嚕... 💤', '夢見整座森林都長滿了最嫩的尤加利樹芽... 🌳'],
                dirty: ['銀灰色的厚絨毛沾到樹皮屑啦，想洗個尤加利精油泡泡澡！🛁'],
                bored: ['想爬到尤加利樹冠頂端搖落滿天星光！🌿✨', '快揉揉我蓬鬆的雪白大圓耳朵！✋']
            },
            bunny: {
                idle: [
                    '（粉嫩小兔鼻一抽一抽地快速嗅聞，長長的垂耳輕輕晃動）🐰 噗啾～！',
                    '小時候我是雪白軟糯的糯米糰子，長大後戴上了春日小雛菊花冠！🌼✨',
                    '（在草地上蹦蹦跳跳，露出毛茸茸的雪球小短尾）🐾',
                    '當兔兔幸福到極點時，就會在半空中使出扭腰旋轉跳（Binky）喔！❤️'
                ],
                hungry: ['小粉鼻聞到香味啦！想吃鮮嫩青草、甜甜香蕉和磨牙小餅乾！🌿🍌🦴', '兔兔的門牙需要多嚼青草與餅乾才健康喔！🥕'],
                tired: ['（將四隻小短腿收進圓滾滾的肚子下，變成一顆焦糖吐司母雞蹲）💤', '夢見在開滿蒲公英與櫻花的草地上奔跑... 🌸'],
                dirty: ['雪白蓬鬆的兔毛沾到草屑了，快幫我洗香香梳毛！🛁'],
                bored: ['想在房間裡表演快樂扭腰旋轉兔兔跳（Binky）！🐰✨', '快輕輕撫摸我的長垂耳和額頭嘛～ ✋']
            },
            lion: {
                idle: [
                    '（昂首佇立於榮耀石上，雙層濃密金紅獅鬃在微風中威武飄揚）🦁 吼嗚——！',
                    '小時候我是愛撒嬌的辛巴小幼獅，長大後成為守護主人的萬獸之王！👑✨',
                    '（用毛茸茸的大腦袋與厚實獅鬃蹭了蹭你的手心，發出大貓般的呼嚕聲）❤️',
                    '太陽照亮的地方，都是我陪主人一起守護的榮耀王國！🌅'
                ],
                hungry: ['吼嗚！草原獅王肚子餓了，想大口享用鮮嫩雞塊與特製肉泥！🍗🍲', '再來一瓶溫熱配方奶或磨牙骨餅乾補充王者體能！🍼🦴'],
                tired: ['（四腳朝天在陽光下打起震天呼嚕，露出大貓肚皮）💤', '夢見在塞倫蓋提大草原的星空下威風巡獵... 🌌'],
                dirty: ['威武濃密的太陽獅鬃需要洗個皇家香氛泡泡浴，吹得蓬鬆閃亮！🛁'],
                bored: ['想在大草原上全速飛撲接玩具球！🎾', '快摸摸我蓬鬆霸氣的金色大鬃毛！✋']
            },
            panda: {
                idle: [
                    '（抱著鮮嫩翠竹咔嚓咔嚓大口嚼著，圓滾滾肚皮跟著上下起伏）🐼 嗯咿～！',
                    '小時候我是軟糯的黑白芝麻湯圓小團子，長大後是會打滾賣萌的國寶大熊貓！🎋✨',
                    '（歪著八字黑眼圈的大腦袋，用短短的黑肉掌抱住你的腳踝撒嬌）❤️',
                    '明明是食肉目猛獸，但我覺得還是躺著吃竹子跟喝盆盆奶最幸福啦！🍼'
                ],
                hungry: ['肚子咕嚕嚕叫啦！想吃鮮嫩翠竹青草、甜甜香蕉和溫熱盆盆奶！🌿🍌🍼', '再來一塊香脆磨牙小餅乾就更滿足了！🦴'],
                tired: ['（直接掛在樹杈上或趴成一張黑白大貓熊餅呼呼大睡）💤', '夢見自己泡在滿滿的盆盆奶與竹筍海裡... 🎋'],
                dirty: ['白白胖胖的糯米毛衣沾到泥巴變成灰熊貓啦，快幫我洗白白！🛁'],
                bored: ['咕嚕咕嚕！想縮成一顆球表演「大熊貓前滾翻特技」給你看！🐼✨', '快摸摸我圓滾滾的黑耳朵和軟肚皮！✋']
            },
            fennec: {
                idle: [
                    '（一對佔了半個身體大的超巨型招風耳像雷達一樣靈敏轉動）🦊 啾啾啾～！',
                    '我是世界上體型最小、耳朵最大的撒哈拉沙漠小精靈——耳廓狐！🏜️✨',
                    '（發出像發條玩具一樣高頻歡快的吱吱撒嬌聲，黑尖大尾巴瘋狂搖擺）❤️',
                    '我的大耳朵不只能聽見沙地下的細微聲音，還能幫我散熱喔！🐾'
                ],
                hungry: ['啾咿！沙漠小獵手肚子餓了，想吃鮮嫩雞塊、肉泥、小餅乾或甜香蕉！🍗🍲🍌', '喝口溫熱配方奶補充水分與體力吧！🍼'],
                tired: ['（把長長的大蓬尾捲在鼻子前，一對大耳朵放鬆垂下進入夢鄉）💤', '夢見在撒哈拉沙漠的璀璨銀河下奔跑... 🌌'],
                dirty: ['香檳金沙色的柔順毛毛沾了沙塵，想洗個清爽泡泡浴！🛁'],
                bored: ['想豎起雷達大耳朵表演「沙漠高空飛撲特技」！📡✨', '快輕輕揉揉我大大的招風耳嘛～ ✋']
            },
            giraffe: {
                idle: [
                    '（優雅地彎下長長的脖子，用頭頂兩根毛茸茸的圓球小鹿角輕碰你的臉頰）🦒 嗚嗯～',
                    '站在雲端看風景雖然很美，但我最喜歡低頭看著身邊的你！🌿❤️',
                    '（眨了眨長睫毛水靈大眼睛，焦糖網紋在陽光下閃閃發亮）✨',
                    '我們長頸鹿平時很安靜，只會對最親密的夥伴發出溫柔的低頻共鳴喔！🎶'
                ],
                hungry: ['長脖子咕嚕嚕叫了！最喜歡吃高處的鮮嫩青草與香甜熟香蕉！🌿🍌', '快餵我吃翠綠多汁的草本大餐吧！🍃'],
                tired: ['（將長長的脖子優雅彎曲靠在自己背上，安靜地閉目養神）💤', '夢見在金合歡樹林的微風中漫步... 🌅'],
                dirty: ['漂亮的焦糖網紋毛皮沾了灰塵，快用高壓花灑幫我的長脖子洗個泡泡澡！🛁'],
                bored: ['想邁開大長腿在草地上優雅奔馳撿玩具球！🎾', '快摸摸我頭頂可愛的毛絨圓球小鹿角！✋']
            },
            polar_bear: {
                idle: [
                    '（一身純淨如雪的蓬鬆白毛，歪著大腦袋露出黑溜溜的眼睛與黑鼻頭）🐻‍❄️ 呼嚕～！',
                    '小時候我是軟綿綿的雪白棉花糖小熊崽，長大後是守護你的北極冰原雪熊王！❄️👑',
                    '（抬起厚實的雪白大熊掌向你揮揮手，露出粉黑相間的可愛肉墊）🐾❤️',
                    '北極的風雪再冷，只要抱著我厚實溫暖的白毛就一點都不冷囉！✨'
                ],
                hungry: ['吼嗚～ 極地游泳健將肚子餓了，最想吃深海極鮮大鮪魚與鮮嫩雞塊！🐟🍗', '喝碗溫熱配方奶或特製肉泥也能瞬間充滿元氣！🍼🍲'],
                tired: ['（用大白熊掌遮住黑鼻頭，趴在晶瑩冰川上呼呼大睡）💤', '夢見在北極絢麗的極光下暢快潛泳抓大魚... 🌌'],
                dirty: ['雪白蓬鬆的極地毛皮要保持一塵不染，快幫我洗個清爽泡泡浴！🛁'],
                bored: ['想在冰原上大步奔跑撲接玩具球！🎾', '快摸摸我毛茸茸的圓耳朵和大肚皮！✋']
            },
            hamster: {
                idle: [
                    '（兩邊大腮幫子塞得鼓鼓囊囊，小短手抱著香脆瓜子狂啃）🐹 吱吱～！',
                    '呼嚕嚕～ 跑跑滾輪轉呀轉，我可是全宇宙最努力跑步的小倉鼠！🎡✨',
                    '（變成一顆圓滾滾的蜜糖金麻糬球，黑豆眼骨碌碌轉動）❤️'
                ],
                hungry: ['吱吱！腮幫子空空啦，想塞滿香脆綜合堅果與磨牙小餅乾！🌰🦴'],
                tired: ['（縮成一顆軟綿綿的金黃毛球睡在木屑窩裡）💤'],
                dirty: ['毛毛需要浴沙與泡泡洗香香啦！🛁'],
                bored: ['想跳上天藍飛輪來一場極速狂飆秀！🎡']
            },
            hedgehog: {
                idle: [
                    '（小黑鼻頭一抽一抽嗅聞，背上頂著一顆紅通通的小蘋果）🦔🍎 噗哧～！',
                    '雖然我背上有可可色小刺，但我的奶油白肚皮超級柔軟喔！✨',
                    '（縮成一顆圓滾滾的小刺球晃呀晃，偷偷露出一雙黑亮小眼睛看你）❤️'
                ],
                hungry: ['肚子餓啦！想吃鮮嫩雞肉塊、肉泥與香甜水果！🍗🍌'],
                tired: ['（捲成溫暖的小刺球安穩入眠）💤'],
                dirty: ['想用溫水與小刷子幫背刺洗個舒服的泡泡浴！🛁'],
                bored: ['想縮成小刺球在草地上施展旋風滾滾衝刺！💨']
            },
            dolphin: {
                idle: [
                    '（從蔚藍水波中探出光滑流線腦袋，帶著天生微笑弧度看著你）🐬🌊 咔噠～！',
                    '我是大海中最快樂的瓶鼻海豚！最喜歡躍出水面畫出美麗弧線！✨',
                    '（發出清脆悅耳的海豚音，尾鰭拍起晶瑩浪花向你撒嬌）❤️'
                ],
                hungry: ['咔噠咔噠～ 想吃最新鮮肥美的深海大鮪魚！🐟'],
                tired: ['（靜靜漂浮在湛藍海面上半閉著眼休息）💤'],
                dirty: ['想用清爽泡泡把光滑海豚皮洗得閃閃發亮！🛁'],
                bored: ['快陪我玩！我要表演騰空破浪連環跳躍秀！🌊']
            },
            tiger: {
                idle: [
                    '（額頭霸氣的黑色「王」字紋閃耀，甩動虎斑長尾威風凜凜地踱步）🐯🔥 吼嗚～！',
                    '小時候我是呆萌小虎崽，長大後是威震叢林的烈焰孟加拉虎王！👑',
                    '（收起銳利虎爪，用毛茸茸的白腮幫子溫柔蹭蹭你的手心）🐾❤️'
                ],
                hungry: ['吼嗚～ 叢林之王肚子餓得咕嚕響，想大口吃鮮嫩雞塊與特製肉泥！🍗🍲'],
                tired: ['（霸氣趴臥在陽光下，打了一個超大的大貓哈欠）💤'],
                dirty: ['烈焰橘黑虎紋沾到泥土啦，快幫本虎王洗個泡泡澡！🛁'],
                bored: ['想施展威震四方的叢林猛虎連環飛撲！🔥']
            },
            condor: {
                idle: [
                    '（昂首佇立於安地斯山巔巨岩，脖頸一圈厚實雪白絨毛頸圈迎風飄揚）🏔️🦅 呼嘯——！',
                    '我是南美蒼穹的守護神「安地斯神鷲」！展開雙翼足足有 3.3 公尺寬，能乘著山谷氣流翱翔萬里！👑',
                    '（收攏烏黑巨翼，身體兩側顯露超大片耀眼純白翼斑，頭頂紫紅肉冠威嚴聳立）✨',
                    '小時候我可是穿著溫暖肉桂褐絨毛大衣、水汪汪大眼睛的小神鷲雛呢～🐥❤️',
                    '（展開黑白雙色巨翼與 8 根分明開叉的指狀飛羽，在陽光下享受高山日光浴）☀️'
                ],
                hungry: [
                    '高空巡航消耗了好多體力！想吃鮮嫩雞塊與營養滿分的特製肉泥！🍗🍲',
                    '（象牙白彎鉤喙尖輕輕點了點食盆）肚子餓啦，來點高蛋白美食吧！🥩'
                ],
                tired: [
                    '（將紫紅肉冠頭輕輕縮進厚實溫暖的雪白絨毛頸圈裡休息）💤',
                    '夢見自己乘著安地斯山脈的金色上升氣流，在雲海之上無聲滑翔... 🏔️🌅'
                ],
                dirty: [
                    '潔白如雪的絨毛頸圈和兩側純白翼斑不能沾上灰塵，快幫我洗個清爽高山泉水澡！🛁',
                    '洗完澡後還要展開三公尺巨翼曬太陽烘乾羽毛喔！🚿☀️'
                ],
                bored: [
                    '想從安地斯山岩一躍而起，展開黑白巨翼與 8 指飛羽衝上雲霄滑翔！🏔️🪽',
                    '快摸摸我脖子上那圈超級蓬鬆柔軟的雪白絨毛圍脖！✋'
                ]
            }
        };

        // 狐狸領養暫存選擇毛色
        this.selectedFoxVariant = 'red';

        this.init();
    }

    get currentPet() {
        return this.adoptedPets.find(p => p.id === this.currentPetId) || this.adoptedPets[0];
    }

    get currentPetType() {
        return this.currentPet.type;
    }

    get currentPetVariant() {
        return this.currentPet.variant || 'default';
    }

    init() {
        this.loadGame();

        // 1. 初始化 3D 渲染場景與 3D 寵物
        this.scene3d = new PetScene3D('webgl-container', this);
        this.switchPet(this.currentPetId, false);

        // 2. 初始化小遊戲
        this.minigames = new MiniGamesManager(this);

        // 3. 綁定事件與主循環
        this.bindEvents();
        this.startGameLoop();
        this.updateUI();
        this.triggerSpeech('idle');

        // 4. 進去時跳出選擇進度 (已獲得哪些角色、幾等、金幣數量等等)
        setTimeout(() => {
            this.renderSaveSlots();
            this.openModal('save-select-modal');
        }, 350);
    }

    // 依等級設定體型縮放
    applyGrowthScaleByLevel() {
        if (!this.dogActor) return;
        const lv = this.currentPet.level;
        if (lv < 5) {
            this.dogActor.setGrowthScale(0.75); // 萌萌幼崽體型
        } else if (lv < 10) {
            this.dogActor.setGrowthScale(0.9);
        } else if (lv < 20) {
            this.dogActor.setGrowthScale(1.05);
        } else {
            this.dogActor.setGrowthScale(1.18);
        }
    }

    // 切換當前活動寵物
    switchPet(petId, notify = true) {
        const pet = this.adoptedPets.find(p => p.id === petId);
        if (!pet) return;

        this.currentPetId = pet.id;
        if (this.scene3d) {
            this.scene3d.switchPetModel(pet.type, pet.variant, pet.equipped);
            this.dogActor = this.scene3d.dog;
        }

        // 切換寵物時清除中毒狀態
        this.clearPoison();

        // 更新頂部頭像 Icon
        const avatarEl = document.getElementById('current-pet-avatar');
        if (avatarEl) {
            if (pet.type === 'fox') avatarEl.textContent = (pet.variant === 'white') ? '🤍' : (pet.variant === 'silver' ? '🖤' : '🦊');
            else if (pet.type === 'bat') avatarEl.textContent = '🦇';
            else if (pet.type === 'wolf') avatarEl.textContent = '🐺';
            else if (pet.type === 'hyena') avatarEl.textContent = '🦴';
            else if (pet.type === 'cheetah') avatarEl.textContent = '🐆';
            else if (pet.type === 'crow') avatarEl.textContent = '🪶';
            else if (pet.type === 'maned_wolf') avatarEl.textContent = '🌾';
            else if (pet.type === 'elephant') avatarEl.textContent = '🐘';
            else if (pet.type === 'harpy') avatarEl.textContent = '🦅';
            else if (pet.type === 'orca') avatarEl.textContent = '🐋';
            else if (pet.type === 'gibbon') avatarEl.textContent = '🐒';
            else if (pet.type === 'capybara') avatarEl.textContent = '🍊';
            else if (pet.type === 'red_panda') avatarEl.textContent = '🎋';
            else if (pet.type === 'snow_leopard') avatarEl.textContent = '❄️';
            else if (pet.type === 'penguin') avatarEl.textContent = '🐧';
            else if (pet.type === 'sea_otter') avatarEl.textContent = '🦦';
            else if (pet.type === 'koala') avatarEl.textContent = '🐨';
            else if (pet.type === 'bunny') avatarEl.textContent = '🐰';
            else if (pet.type === 'lion') avatarEl.textContent = '🦁';
            else if (pet.type === 'panda') avatarEl.textContent = '🐼';
            else if (pet.type === 'fennec') avatarEl.textContent = '🏜️';
            else if (pet.type === 'giraffe') avatarEl.textContent = '🦒';
            else if (pet.type === 'polar_bear') avatarEl.textContent = '🐻‍❄️';
            else if (pet.type === 'hamster') avatarEl.textContent = '🐹';
            else if (pet.type === 'hedgehog') avatarEl.textContent = '🦔';
            else if (pet.type === 'dolphin') avatarEl.textContent = '🐬';
            else if (pet.type === 'tiger') avatarEl.textContent = '🐯';
            else if (pet.type === 'condor') avatarEl.textContent = '🏔️';
            else avatarEl.textContent = '🐶';
        }

        this.applyGrowthScaleByLevel();

        // 確保安地斯神鷲切換時維持幼雛/成鳥狀態（按切換鍵前始終為幼雛）
        if (pet.type === 'condor' && this.dogActor && this.dogActor.setCondorStage) {
            this.dogActor.setCondorStage(pet.condorStage || 'baby');
        }

        this.updateUI();
        this.saveGame();

        if (notify) {
            window.soundCtrl.playVoice(pet.type, 'happy');
            this.showToast(`✨ 已切換至【${pet.name}】陪伴在身邊！`);
            this.triggerSpeech('idle');
        }
    }

    // 領養新寵物
    adoptPet(type, variant = 'default', defaultName = '', price = 600) {
        if (this.coins < price) {
            this.showToast('🪙 金幣不足喔！快去玩接飛盤或猜碗小遊戲賺金幣吧！');
            return;
        }

        this.coins -= price;
        const newId = `pet_${type}_${Date.now()}`;
        const newPet = {
            id: newId,
            type: type,
            variant: variant,
            name: defaultName,
            level: 1,
            exp: 0,
            maxExp: 100,
            condorStage: (type === 'condor') ? 'baby' : undefined,
            equipped: { collar: 'red_collar', glasses: null, hat: null, cape: null }
        };

        this.adoptedPets.push(newPet);
        window.soundCtrl.playLevelUp();
        this.showToast(`🎉 恭喜成功領養【${defaultName}】！`);
        this.switchPet(newId);
        this.closeAllModals();
        this.updateUI();
        this.saveGame();
    }

    bindEvents() {
        // 0. 手機與觸控螢幕初次輕觸解鎖 Web Audio 音訊與觸控支援
        const unlockAudioOnTouch = () => {
            if (window.soundCtrl && window.soundCtrl.ensureContext) {
                window.soundCtrl.ensureContext();
            }
        };
        window.addEventListener('touchstart', unlockAudioOnTouch, { once: true, passive: true });
        window.addEventListener('pointerdown', unlockAudioOnTouch, { once: true, passive: true });

        // 0.1 手機版單行控制列（同一行）點開／收合切換邏輯
        const mobileButtons = [
            { btnId: 'm-toggle-profile', panelClass: 'top-nav' },
            { btnId: 'm-toggle-stats', panelClass: 'stats-card' },
            { btnId: 'm-toggle-actions', panelClass: 'action-dock' }
        ];

        this.closeAllMobilePanels = () => {
            mobileButtons.forEach(({ btnId, panelClass }) => {
                const btn = document.getElementById(btnId);
                const panel = document.querySelector(`.${panelClass}`);
                if (btn) btn.classList.remove('active');
                if (panel) panel.classList.remove('mobile-open');
            });
        };

        mobileButtons.forEach(({ btnId, panelClass }) => {
            const btn = document.getElementById(btnId);
            const panel = document.querySelector(`.${panelClass}`);
            if (btn && panel) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = panel.classList.contains('mobile-open');
                    this.closeAllMobilePanels();
                    if (!isOpen) {
                        panel.classList.add('mobile-open');
                        btn.classList.add('active');
                        if (window.soundCtrl) window.soundCtrl.playClick();
                        if (navigator.vibrate) {
                            try { navigator.vibrate(12); } catch (_) {}
                        }
                    }
                });
            }
        });

        // 點擊 3D 主畫面舞台任意處時，自動收合所有手機展開面板，還原最廣闊視野！
        const stageEl = document.getElementById('stage');
        if (stageEl) {
            stageEl.addEventListener('pointerdown', (e) => {
                if (window.innerWidth <= 768) {
                    this.closeAllMobilePanels();
                }
            });
        }

        // 1. 頂部改名按鈕
        document.getElementById('edit-name-btn').addEventListener('click', () => {
            document.getElementById('rename-input').value = this.currentPet.name;
            this.openModal('rename-modal');
        });

        document.getElementById('confirm-rename-btn').addEventListener('click', () => {
            const val = document.getElementById('rename-input').value.trim();
            if (val) {
                this.currentPet.name = val;
                this.saveGame();
                this.updateUI();
                this.closeAllModals();
                this.showToast(`✨ 記住新名字「${val}」了！`);
                window.soundCtrl.playVoice(this.currentPetType, 'happy');
            }
        });

        // 2. 我的寵物庫按鈕 & 點擊個人資料
        const openPetsModal = () => {
            this.renderMyPetsList();
            this.openModal('pets-modal');
            window.soundCtrl.playClick();
        };

        document.getElementById('my-pets-btn').addEventListener('click', openPetsModal);
        document.getElementById('pet-profile-btn').addEventListener('click', openPetsModal);

        // 點擊階段標籤快速切換形態 (狐蝠幼崽毛巾捲 ↔ 長大倒掛)
        const stageBadge = document.getElementById('pet-stage-badge');
        if (stageBadge) {
            stageBadge.style.cursor = 'pointer';
            stageBadge.title = '點擊可切換幼崽期/長大期外觀！';
            stageBadge.addEventListener('click', () => {
                if (this.currentPetType === 'bat' && this.dogActor && this.dogActor.setBatStage) {
                    const curStage = this.dogActor.batStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setBatStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🦇 果果已切換為【長大倒掛期】！帥氣倒掛在橫樑上展翅～');
                    } else {
                        this.showToast('🧣 果果已切換為【幼崽毛巾捲期】！裹在軟綿綿毛巾裡吃香蕉～');
                    }
                    window.soundCtrl.playVoice('bat', 'happy');
                } else if (this.currentPetType === 'wolf' && this.dogActor && this.dogActor.setWolfStage) {
                    const curStage = this.dogActor.wolfStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setWolfStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🐺 玄夜已切換為【雪原冰眸狼王】！冰藍魔眸傲立風雪，仰天長嘯！');
                        this.dogActor.setState('happy');
                    } else {
                        this.showToast('🐾 玄夜已切換為【毛茸茸小狼崽】！深藍幼瞳呆萌活潑～');
                    }
                    window.soundCtrl.playVoice('wolf', 'happy');
                } else if (this.currentPetType === 'hyena' && this.dogActor && this.dogActor.setHyenaStage) {
                    const curStage = this.dogActor.hyenaStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setHyenaStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🦴 斑斑已切換為【非洲草原斑鬣狗】！前肢修長後腿微蹲，英姿勃發！');
                        this.dogActor.setState('happy');
                    } else {
                        this.showToast('🐾 斑斑已切換為【深棕絨毛小鬣狗崽】！圓圓大耳朵呆萌可愛～');
                    }
                    window.soundCtrl.playVoice('hyena', 'happy');
                } else if (this.currentPetType === 'cheetah' && this.dogActor && this.dogActor.setCheetahStage) {
                    const curStage = this.dogActor.cheetahStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setCheetahStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🐆 閃電已切換為【原野極速獵豹】！深胸細腰金黃斑點，全速奔馳！');
                        this.dogActor.setState('happy');
                    } else {
                        this.showToast('🐾 閃電已切換為【銀鬃小獵豹崽】！銀灰蓬鬆披風黑淚痕，啾啾鳥鳴撒嬌～');
                    }
                    window.soundCtrl.playVoice('cheetah', 'happy');
                } else if (this.currentPetType === 'crow' && this.dogActor && this.dogActor.setCrowStage) {
                    const curStage = this.dogActor.crowStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setCrowStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🦅 夜煞已切換為【極夜渡鴉領主】！油亮藍黑羽衣，披針毛領傲視全場！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playCrowVoice('happy', 'adult');
                    } else {
                        this.showToast('🐥 小煤球已切換為【黑煤球幼雛期】！軟萌毛球歪頭殺，噗噗扇小翅膀～');
                        window.soundCtrl.playCrowVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'maned_wolf' && this.dogActor && this.dogActor.setManedWolfStage) {
                    const curStage = this.dogActor.manedWolfStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setManedWolfStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 腿哥已切換為【九頭身長腿超模】！逆天過膝黑長襪、金橘紅狐毛、背脊黑鬃傲視全場！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playManedWolfVoice('happy', 'adult');
                    } else {
                        this.showToast('🐾 腿哥已切換為【煙灰圓滾幼崽】！毛茸茸短腿小灰團，呆萌可愛～');
                        window.soundCtrl.playManedWolfVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'elephant' && this.dogActor && this.dogActor.setElephantStage) {
                    const curStage = this.dogActor.elephantStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setElephantStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 波波已切換為【草原巍峨象王】！優美彎曲白象牙、巨型非洲大扇耳、長鼻昂首長鳴震撼全場！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playElephantVoice('happy', 'adult');
                    } else {
                        this.showToast('🍼 波波已切換為【軟萌小象寶寶】！圓滾小肉球、靈巧小象鼻吸水噴水、呆萌扇耳拍打～');
                        window.soundCtrl.playElephantVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'harpy' && this.dogActor && this.dogActor.setHarpyStage) {
                    const curStage = this.dogActor.harpyStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setHarpyStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 哈比已切換為【雨林神獸角雕皇】！雙叉王冠羽炸起、致命黑金巨爪、霸氣展翼！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playHarpyVoice('happy', 'adult');
                    } else {
                        this.showToast('🐥 哈比已切換為【台北市立動物園白雪幼雛】！純白雪球羽絨、小肉翅拍打、呆萌歪頭殺～');
                        window.soundCtrl.playHarpyVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'orca' && this.dogActor && this.dogActor.setOrcaStage) {
                    const curStage = this.dogActor.orcaStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setOrcaStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 波浪已切換為【深海霸主虎鯨】！高聳威武黑背鰭、流線魚雷身軀、噴氣孔彩虹水柱！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playOrcaVoice('happy', 'adult');
                    } else {
                        this.showToast('🍼 波浪已切換為【軟萌虎鯨寶寶】！圓滾西瓜頭、暖杏白幼斑、靈巧翻滾與水花氣泡～');
                        window.soundCtrl.playOrcaVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'gibbon' && this.dogActor && this.dogActor.setGibbonStage) {
                    const curStage = this.dogActor.gibbonStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setGibbonStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 金寶已切換為【林冠臂行宗師】！高空老藤樹杈、優雅長臂攀藤、天籟雙重奏長鳴！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playGibbonVoice('happy', 'adult');
                    } else {
                        this.showToast('🍼 金寶已切換為【軟萌金毛幼崽】！金黃毛球小精靈、小黑面具臉、長臂揮手討抱抱～');
                        window.soundCtrl.playGibbonVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'capybara' && this.dogActor && this.dogActor.setCapybaraStage) {
                    const curStage = this.dogActor.capybaraStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setCapybaraStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('♨️ 豚豚已切換為【溫泉佛系水豚大王】！泡在飄著金黃柚子的檜木溫泉桶，頭頂雙層蜜柑塔！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playCapybaraVoice('happy', 'adult');
                    } else {
                        this.showToast('🍊 豚豚已切換為【軟糯小水豚崽】！圓滾滾焦糖栗棕小土豆，頭頂頂著小橘子悠哉散步～');
                        window.soundCtrl.playCapybaraVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'red_panda' && this.dogActor && this.dogActor.setRedPandaStage) {
                    const curStage = this.dogActor.redPandaStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setRedPandaStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🎋 圓圓已切換為【竹林威嚇大師紅熊貓】！雙腳站立高舉雙手裝兇賣萌，九節環紋大尾超蓬鬆！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playRedPandaVoice('happy', 'adult');
                    } else {
                        this.showToast('🐾 圓圓已切換為【毛茸茸小火狐幼崽】！白眉白臉頰面具，抱著大尾巴歪頭殺～');
                        window.soundCtrl.playRedPandaVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'snow_leopard' && this.dogActor && this.dogActor.setSnowLeopardStage) {
                    const curStage = this.dogActor.snowLeopardStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setSnowLeopardStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🏔️ 凜冬已切換為【喜馬拉雅雪山之王】！傲立覆雪岩台，開心時還會咬住自己的大毛尾巴賣萌！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playSnowLeopardVoice('happy', 'adult');
                    } else {
                        this.showToast('❄️ 凜冬已切換為【冰原煙灰小雪豹崽】！冰晶藍圓眼與玫瑰斑點，呆萌活潑～');
                        window.soundCtrl.playSnowLeopardVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'penguin' && this.dogActor && this.dogActor.setPenguinStage) {
                    const curStage = this.dogActor.penguinStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setPenguinStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 企鵝已切換為【南極燕尾服帝企鵝皇】！黑曜石燕尾服配璀璨金橘頸斑，佇立晶瑩浮冰！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playPenguinVoice('happy', 'adult');
                    } else {
                        this.showToast('🐣 企鵝已切換為【灰絨毛奇異果小企鵝】！黑白熊貓小臉譜，拍動小短翅搖擺走路～');
                        window.soundCtrl.playPenguinVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'sea_otter' && this.dogActor && this.dogActor.setSeaOtterStage) {
                    const curStage = this.dogActor.seaOtterStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setSeaOtterStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🦪 貝貝已切換為【敲貝殼藏寶海獺】！仰躺碧海用石頭敲開粉紅扇貝，露出璀璨發光大珍珠！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playSeaOtterVoice('happy', 'adult');
                    } else {
                        this.showToast('🦦 貝貝已切換為【仰泳抱扇貝毛球幼獺】！蓬鬆栗子毛球隨波漂浮，揉臉賣萌超療癒～');
                        window.soundCtrl.playSeaOtterVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'koala' && this.dogActor && this.dogActor.setKoalaStage) {
                    const curStage = this.dogActor.koalaStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setKoalaStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🌿 尤加利已切換為【尤加利樹冠無尾熊】！抱著分岔翠綠大樹幹，揮動小手熱情打招呼！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playKoalaVoice('happy', 'adult');
                    } else {
                        this.showToast('🐨 尤加利已切換為【叼嫩葉呆萌樹熊寶寶】！超蓬鬆白毛大耳配大黑鼻，軟萌度滿分～');
                        window.soundCtrl.playKoalaVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'bunny' && this.dogActor && this.dogActor.setBunnyStage) {
                    const curStage = this.dogActor.bunnyStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setBunnyStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🌼 團團已切換為【焦糖花冠垂耳兔】！頭戴春日小雛菊花環、腳邊有紅蘿蔔，開心扭腰兔兔跳！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playBunnyVoice('happy', 'adult');
                    } else {
                        this.showToast('🐰 團團已切換為【雪白糯米糰小幼兔】！粉嫩長垂耳配高頻抽動小粉鼻～');
                        window.soundCtrl.playBunnyVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'lion' && this.dogActor && this.dogActor.setLionStage) {
                    const curStage = this.dogActor.lionStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setLionStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('👑 辛巴已切換為【榮耀石萬獸之王雄獅】！雙層濃密紅金大鬃毛，昂首獅吼震撼全場！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playLionVoice('happy', 'adult');
                    } else {
                        this.showToast('🦁 辛巴已切換為【金黃呆萌小幼獅】！圓滾滾大耳與絨毛球尾尖，奶音吼叫超可愛～');
                        window.soundCtrl.playLionVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'panda' && this.dogActor && this.dogActor.setPandaStage) {
                    const curStage = this.dogActor.pandaStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setPandaStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🎋 滾滾已切換為【啃翠竹國寶大熊貓】！坐姿手握鮮嫩竹子大口嚼，還能表演前滾翻打滾！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playPandaVoice('happy', 'adult');
                    } else {
                        this.showToast('🐼 滾滾已切換為【軟糯芝麻湯圓小團子】！八字黑眼圈配小黑馬甲，嗯咿奶音萌翻天～');
                        window.soundCtrl.playPandaVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'fennec' && this.dogActor && this.dogActor.setFennecStage) {
                    const curStage = this.dogActor.fennecStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setFennecStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🏜️ 沙沙已切換為【撒哈拉雷達大耳狐】！金沙奶油毛皮配超巨型招風耳，靈巧飛撲！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playFennecVoice('happy', 'adult');
                    } else {
                        this.showToast('🦊 沙沙已切換為【巴掌大大耳幼狐】！耳朵比臉還大，高頻吱吱叫超撒嬌～');
                        window.soundCtrl.playFennecVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'giraffe' && this.dogActor && this.dogActor.setGiraffeStage) {
                    const curStage = this.dogActor.giraffeStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setGiraffeStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🦒 喬治已切換為【高挑優雅網紋長頸鹿】！修長鹿頸與焦糖網紋，低頭溫柔蹭蹭你！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playGiraffeVoice('happy', 'adult');
                    } else {
                        this.showToast('🍼 喬治已切換為【絨球小鹿角長頸鹿寶寶】！呆萌圓球小鹿角與大眼睛～');
                        window.soundCtrl.playGiraffeVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'polar_bear' && this.dogActor && this.dogActor.setPolarBearStage) {
                    const curStage = this.dogActor.polarBearStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setPolarBearStage(nextStage);
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('❄️ 白雪已切換為【北極冰川雪熊王】！佇立晶瑩浮冰台，一身純白厚毛威武又溫柔！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playPolarBearVoice('happy', 'adult');
                    } else {
                        this.showToast('🐻‍❄️ 白雪已切換為【棉花糖小北極熊崽】！雪白毛球配黑豆眼黑鼻頭，歪頭討抱抱～');
                        window.soundCtrl.playPolarBearVoice('happy', 'baby');
                    }
                } else if (this.currentPetType === 'hamster' && this.dogActor && this.dogActor.setHamsterStage) {
                    const curStage = this.dogActor.hamsterStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setHamsterStage(nextStage);
                    this.checkStageChange();
                    this.showToast(nextStage === 'adult' ? '🎡 哈姆已切換為【飛輪狂飆成鼠】！' : '🐹 哈姆已切換為【塞滿腮幫子幼鼠】！');
                    window.soundCtrl.playHamsterVoice('happy', nextStage);
                } else if (this.currentPetType === 'hedgehog' && this.dogActor && this.dogActor.setHedgehogStage) {
                    const curStage = this.dogActor.hedgehogStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setHedgehogStage(nextStage);
                    this.checkStageChange();
                    this.showToast(nextStage === 'adult' ? '🍎 刺刺已切換為【頭頂紅蘋果成體刺蝟】！' : '🦔 刺刺已切換為【軟萌捲球小刺蝟崽】！');
                    window.soundCtrl.playHedgehogVoice('happy', nextStage);
                } else if (this.currentPetType === 'dolphin' && this.dogActor && this.dogActor.setDolphinStage) {
                    const curStage = this.dogActor.dolphinStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setDolphinStage(nextStage);
                    this.checkStageChange();
                    this.showToast(nextStage === 'adult' ? '🌊 藍藍已切換為【破浪騰空成年海豚】！' : '🐬 藍藍已切換為【微笑浪花小海豚崽】！');
                    window.soundCtrl.playDolphinVoice('happy', nextStage);
                } else if (this.currentPetType === 'tiger' && this.dogActor && this.dogActor.setTigerStage) {
                    const curStage = this.dogActor.tigerStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setTigerStage(nextStage);
                    this.checkStageChange();
                    this.showToast(nextStage === 'adult' ? '🔥 琥珀已切換為【額頭王字烈焰猛虎王】！' : '🐯 琥珀已切換為【呆萌王字小虎崽】！');
                    window.soundCtrl.playTigerVoice('happy', nextStage);
                } else if (this.currentPetType === 'condor' && this.dogActor && this.dogActor.setCondorStage) {
                    const curStage = this.dogActor.condorStage || 'baby';
                    const nextStage = (curStage === 'baby') ? 'adult' : 'baby';
                    this.dogActor.setCondorStage(nextStage);
                    this.currentPet.condorStage = nextStage;
                    this.saveGame();
                    this.checkStageChange();
                    if (nextStage === 'adult') {
                        this.showToast('🏔️ 安地斯已切換為【安地斯神鷲皇】！雪白絨毛頸圈、雙側純白翼斑、紫紅肉冠與 3.3m 巨翼霸氣全開！');
                        this.dogActor.setState('happy');
                        window.soundCtrl.playCondorVoice('happy', 'adult');
                    } else {
                        this.showToast('🐥 安地斯已切換為【肉桂褐絨毛小神鷲雛】！水汪汪深琥珀大眼與蓬鬆絨毛小翅膀超萌拍動～');
                        window.soundCtrl.playCondorVoice('happy', 'baby');
                    }
                } else if (['dog','fox'].includes(this.currentPetType) && this.dogActor) {
                    // 狗/狐狸：切換幼崽 <-> 成體毛飾
                    const isAdultNow = this.dogActor._adultStage === true;
                    const nextAdult = !isAdultNow;
                    this.dogActor._adultStage = nextAdult;
                    // 使用 setGrowthScale 驅動 adultFurGroup 顯示
                    const targetScale = nextAdult ? 1.18 : 0.75;
                    this.dogActor.setGrowthScale(targetScale);
                    this.checkStageChange();
                    if (this.currentPetType === 'fox') {
                        if (nextAdult) {
                            this.showToast('🦊 已切換為【成體狐狸】！蓬鬆領毛隨風飄揚，帥氣無敵！');
                        } else {
                            this.showToast('🦊 已切換為【幼崽小狐狸】！毛茸茸圓滾滾超可愛！');
                        }
                    } else {
                        if (nextAdult) {
                            this.showToast('🐕 已切換為【成年黑犬】！健壯胸膛，沈穩威武！');
                        } else {
                            this.showToast('🐾 已切換為【幼崽小黑狗】！萌萌大頭，活力四射！');
                        }
                    }
                } else {
                    this.showToast(`🐾 目前處於【${this.getStageInfo().title}】！`);
                }
            });
        }

        // 3. 音效開關
        document.getElementById('sound-toggle-btn').addEventListener('click', (e) => {
            const enabled = window.soundCtrl.toggleSound();
            e.target.textContent = enabled ? '🔊' : '🔇';
            this.showToast(enabled ? '🔊 音效已開啟' : '🔇 音效已靜音');
        });

        // 4. 成長日記
        document.getElementById('diary-btn').addEventListener('click', () => {
            this.renderDiary();
            this.openModal('diary-modal');
        });

        const resetBtn = document.getElementById('reset-game-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }

        // 4.1 存檔與進度管理按鈕
        const saveBtn = document.getElementById('save-manager-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.renderSaveSlots();
                this.openModal('save-select-modal');
                window.soundCtrl.playClick();
            });
        }

        const resetNewBtn = document.getElementById('btn-reset-new-game');
        if (resetNewBtn) {
            resetNewBtn.addEventListener('click', () => {
                this.resetNewGame();
            });
        }

        const exportBtn = document.getElementById('btn-export-save');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSaveFile();
            });
        }

        const importTrigger = document.getElementById('btn-import-save-trigger');
        const importInput = document.getElementById('input-import-save');
        if (importTrigger && importInput) {
            importTrigger.addEventListener('click', () => {
                importInput.value = '';
                importInput.click();
            });
            importInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.importSaveFile(e.target.files[0]);
                }
            });
        }

        // 5. 底部動作列
        document.getElementById('act-feed').addEventListener('click', () => {
            this.toggleDrawer('feed-menu');
            window.soundCtrl.playClick();
        });

        document.getElementById('act-pet').addEventListener('click', () => {
            this.closeAllDrawers();
            this.performPetInteraction('head', window.innerWidth / 2, window.innerHeight / 2);
        });

        document.getElementById('act-bath').addEventListener('click', () => {
            this.performBath();
        });

        document.getElementById('act-train').addEventListener('click', () => {
            this.renderTrainSkills();
            this.openModal('train-modal');
            window.soundCtrl.playClick();
        });

        document.getElementById('act-play').addEventListener('click', () => {
            this.triggerInteractiveGame();
        });

        document.getElementById('act-sleep').addEventListener('click', () => {
            this.toggleSleep();
        });

        document.getElementById('act-shop').addEventListener('click', () => {
            this.renderShop('adopt'); // 預設開啟寵物領養分頁
            this.openModal('shop-modal');
            window.soundCtrl.playClick();
        });

        // 6. 食物選擇點擊
        document.querySelectorAll('.food-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const foodType = btn.dataset.food;
                this.feedPet(foodType);
            });
        });

        // 7. 小遊戲入口
        document.getElementById('open-frisbee-game').addEventListener('click', () => {
            this.closeAllModals();
            this.minigames.startFrisbeeGame();
        });

        document.getElementById('open-cups-game').addEventListener('click', () => {
            this.closeAllModals();
            this.minigames.startCupsGame();
        });

        // 8. 商城分頁切換
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderShop(tab.dataset.tab);
            });
        });

        // 9. 關閉按鈕
        document.querySelectorAll('.modal-close-btn, .close-drawer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
                this.closeAllDrawers();
            });
        });

        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAllModals();
            });
        });
    }

    // =========================================================================
    // 渲染我的寵物庫 (My Pets List)
    // =========================================================================
    renderMyPetsList() {
        const container = document.getElementById('my-pets-list');
        container.innerHTML = '';

        this.adoptedPets.forEach(pet => {
            const isActive = (pet.id === this.currentPetId);
            const card = document.createElement('div');
            card.className = `my-pet-card ${isActive ? 'active-pet' : ''}`;

            let icon = '🐶';
            let speciesName = '全黑立耳黑狗幼犬';
            if (pet.type === 'fox') {
                if (pet.variant === 'white') { icon = '🤍'; speciesName = '白色北極狐幼崽'; }
                else if (pet.variant === 'silver') { icon = '🖤'; speciesName = '黑色銀狐幼崽'; }
                else { icon = '🦊'; speciesName = '橘色赤狐幼崽'; }
            } else if (pet.type === 'bat') {
                icon = '🦇';
                speciesName = '呆萌狐蝠（果蝠）';
            } else if (pet.type === 'wolf') {
                icon = '🐺';
                speciesName = '冰眸雪原黑狼';
            } else if (pet.type === 'hyena') {
                icon = '🦴';
                speciesName = '非洲斑鬣狗';
            } else if (pet.type === 'cheetah') {
                icon = '🐆';
                speciesName = '非洲極速獵豹';
            } else if (pet.type === 'crow') {
                icon = '🪶';
                speciesName = '黑煤球烏鴉／極夜渡鴉';
            } else if (pet.type === 'maned_wolf') {
                icon = '🌾';
                speciesName = '南美鬃狼・長腿超模';
            } else if (pet.type === 'elephant') {
                icon = '🐘';
                speciesName = '非洲大象・象王';
            } else if (pet.type === 'harpy') {
                icon = '🦅';
                speciesName = '美洲角雕・哈比鷹';
            } else if (pet.type === 'orca') {
                icon = '🐋';
                speciesName = '深海霸主・虎鯨';
            } else if (pet.type === 'gibbon') {
                icon = '🐒';
                speciesName = '金絲長臂猿・林冠臂行大師';
            } else if (pet.type === 'capybara') {
                icon = '🍊';
                speciesName = '佛系溫泉水豚君';
            } else if (pet.type === 'red_panda') {
                icon = '🎋';
                speciesName = '喜馬拉雅小熊貓・紅熊貓';
            } else if (pet.type === 'snow_leopard') {
                icon = '❄️';
                speciesName = '喜馬拉雅雪豹・雪山之王';
            } else if (pet.type === 'penguin') {
                icon = '🐧';
                speciesName = '南極帝企鵝・冰原紳士';
            } else if (pet.type === 'sea_otter') {
                icon = '🦦';
                speciesName = '太平洋海獺・扇貝珍珠王';
            } else if (pet.type === 'koala') {
                icon = '🐨';
                speciesName = '澳洲無尾熊・尤加利樹精靈';
            } else if (pet.type === 'bunny') {
                icon = '🐰';
                speciesName = '荷蘭垂耳兔・春日花冠兔';
            } else if (pet.type === 'lion') {
                icon = '🦁';
                speciesName = '非洲雄獅・萬獸之王';
            } else if (pet.type === 'panda') {
                icon = '🐼';
                speciesName = '四川大熊貓・國寶貓熊';
            } else if (pet.type === 'fennec') {
                icon = '🏜️';
                speciesName = '撒哈拉耳廓狐・大耳精靈';
            } else if (pet.type === 'giraffe') {
                icon = '🦒';
                speciesName = '非洲網紋長頸鹿・雲端紳士';
            } else if (pet.type === 'polar_bear') {
                icon = '🐻‍❄️';
                speciesName = '北極白熊・極地雪熊王';
            } else if (pet.type === 'hamster') {
                icon = '🐹';
                speciesName = '黃金倉鼠・飛輪小萌鼠';
            } else if (pet.type === 'hedgehog') {
                icon = '🦔';
                speciesName = '森林小刺蝟・蘋果刺刺';
            } else if (pet.type === 'dolphin') {
                icon = '🐬';
                speciesName = '瓶鼻海豚・微笑浪花精靈';
            } else if (pet.type === 'tiger') {
                icon = '🐯';
                speciesName = '孟加拉虎・烈焰叢林之王';
            } else if (pet.type === 'condor') {
                icon = '🏔️';
                speciesName = '安地斯神鷲・南美蒼穹之神';
            }

            card.innerHTML = `
                <div class="my-pet-icon">${icon}</div>
                <div class="my-pet-name">${pet.name}</div>
                <div class="my-pet-badge">${speciesName}・Lv.${pet.level}</div>
                <button class="primary-btn switch-pet-btn" data-id="${pet.id}" style="margin-top:8px; width:100%;">
                    ${isActive ? '陪伴中 🐾' : '切換陪伴 ✨'}
                </button>
            `;

            container.appendChild(card);
        });

        container.querySelectorAll('.switch-pet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.id;
                this.switchPet(targetId);
                this.closeAllModals();
            });
        });
    }

    // =========================================================================
    // 照料互動 (餵食、撫摸、洗澡、睡覺、訓練)
    // =========================================================================
    feedPet(foodType) {
        const item = this.foodDetails[foodType];
        if (!item) return;

        if (this.coins < item.price) {
            this.showToast('🪙 金幣不足喔！快去玩小遊戲賺金幣吧！');
            return;
        }

        this.coins -= item.price;
        this.closeAllDrawers();

        // 檢查該寵物是否能吃此食物
        const allowedFoods = this.petDietMap[this.currentPetType] || ['banana'];
        const isDietValid = allowedFoods.includes(foodType);

        if (!isDietValid) {
            // ❌ 餵錯食物：引發食物中毒，體力慢慢往下掉
            this.handleFoodPoison(foodType, item);
        } else {
            // ✅ 餵對食物：享受美食並解除中毒（若處於中毒狀態）
            this.handleCorrectFeed(foodType, item);
        }

        this.saveGame();
        this.updateUI();
    }

    // 處理食物中毒反應
    handleFoodPoison(foodType, item) {
        if (this.scene3d) {
            this.scene3d.trigger3DFeed('poison');
        }
        if (this.dogActor && this.dogActor.setState) {
            this.dogActor.setState('sad');
        }
        window.soundCtrl.playVoice(this.currentPetType, 'sad');

        this.stats.mood = Math.max(0, this.stats.mood - 15);
        this.isPoisoned = true;
        this.poisonFoodName = item.name;

        // 噴發紫色毒氣泡泡與飄字
        this.spawnPoisonBubbles(window.innerWidth / 2, window.innerHeight * 0.45);
        this.triggerFloatText(`☠️ 誤食 ${item.name}！中毒體力流失！`, '#c084fc');

        this.showToast(`☠️ 糟糕！【${this.currentPet.name}】不能吃【${item.name}】！出現食物中毒反應，體力正在持續流失...快餵正確食物解毒！`);
        this.triggerSpeech('idle', `🤢 嘔... 肚子好痛！我不能吃【${item.name}】！快給我專屬的食物解毒...！`);

        this.startPoisonDoT();
    }

    // 啟動中毒持續扣體力 (DoT)
    startPoisonDoT() {
        if (this.poisonInterval) clearInterval(this.poisonInterval);
        this.applyPoisonVisuals(true);

        this.poisonInterval = setInterval(() => {
            if (!this.isPoisoned) {
                clearInterval(this.poisonInterval);
                this.poisonInterval = null;
                this.applyPoisonVisuals(false);
                return;
            }

            if (this.stats.energy > 0) {
                this.stats.energy = Math.max(0, this.stats.energy - 3);
                this.stats.mood = Math.max(0, this.stats.mood - 2);
                this.updateUI();
                this.triggerFloatText('-3⚡ 中毒體力流失', '#a855f7');
                this.spawnPoisonBubbles(window.innerWidth / 2, window.innerHeight * 0.45);

                // 偶爾發出痛苦呻吟
                if (Math.random() < 0.4 && this.dogActor && this.dogActor.setState) {
                    this.dogActor.setState('sad');
                    window.soundCtrl.playVoice(this.currentPetType, 'sad');
                }
            } else {
                this.showToast(`💤 體力已完全耗盡！【${this.currentPet.name}】虛弱無力，請立刻餵食專屬食物解毒！`);
            }
        }, 2600);
    }

    // 解除食物中毒狀態
    clearPoison() {
        if (this.isPoisoned || this.poisonInterval) {
            this.isPoisoned = false;
            if (this.poisonInterval) {
                clearInterval(this.poisonInterval);
                this.poisonInterval = null;
            }
            this.applyPoisonVisuals(false);
        }
    }

    // 更新體力條中毒視覺效果
    applyPoisonVisuals(active) {
        const energyItem = document.getElementById('stat-energy-item');
        const energyBar = document.getElementById('bar-energy');
        const energyIcon = energyItem ? energyItem.querySelector('.stat-icon') : null;
        if (active) {
            if (energyItem) energyItem.classList.add('poisoned');
            if (energyBar) energyBar.classList.add('poisoned-bar');
            if (energyIcon) energyIcon.textContent = '☠️';
        } else {
            if (energyItem) energyItem.classList.remove('poisoned');
            if (energyBar) energyBar.classList.remove('poisoned-bar');
            if (energyIcon) energyIcon.textContent = '⚡';
        }
    }

    // 處理正確餵食
    handleCorrectFeed(foodType, item) {
        const wasPoisoned = this.isPoisoned;
        this.clearPoison();

        this.stats.hunger = Math.min(100, this.stats.hunger + item.hunger);
        if (item.mood) this.stats.mood = Math.min(100, this.stats.mood + item.mood);
        if (item.energy) this.stats.energy = Math.min(100, this.stats.energy + item.energy);
        this.records.feedsCount++;

        window.soundCtrl.playEat();
        if (this.dogActor && this.dogActor.setState) {
            this.dogActor.setState('eat');
        }

        if (this.scene3d) {
            this.scene3d.trigger3DFeed(foodType);
        }

        if (wasPoisoned) {
            this.showToast(`✨【${this.currentPet.name}】吃到了專屬美食【${item.name}】，成功解除食物中毒！💖`);
            this.triggerSpeech('idle', `🥰 呼～ 肚子不痛了！吃到專屬的【${item.name}】太幸福了，謝謝主人！✨`);
            this.triggerFloatText('💖 中毒解除！體力恢復！', '#10b981');
            this.spawnScreenHearts(window.innerWidth / 2, window.innerHeight * 0.45);
        } else {
            this.showToast(`😋 餵食了【${item.name}】！${this.currentPet.name} 開心地吃得一乾二淨！`);
            this.triggerFloatText(`+${item.hunger} 飽食 🍼`, '#3b82f6');
        }

        this.addExp(item.exp);

        setTimeout(() => {
            if (this.dogActor && this.dogActor.setState) {
                this.dogActor.setState('happy');
                window.soundCtrl.playVoice(this.currentPetType, 'happy');
                setTimeout(() => this.dogActor.setState('idle'), 1500);
            }
        }, 2000);
    }

    // 畫面噴發中毒紫氣氣泡
    spawnPoisonBubbles(x, y) {
        const layer = document.getElementById('fx-layer');
        if (!layer) return;
        const emojis = ['☠️', '🧪', '🤢', '💜', '🫧'];
        for (let i = 0; i < 5; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'floating-poison';
            bubble.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            bubble.style.left = `${x + (Math.random() - 0.5) * 80}px`;
            bubble.style.top = `${y + (Math.random() - 0.5) * 50}px`;
            bubble.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
            layer.appendChild(bubble);
            setTimeout(() => bubble.remove(), 1400);
        }
    }

    // 畫面飄字特效
    triggerFloatText(text, color = '#ffffff', x = null, y = null) {
        const layer = document.getElementById('fx-layer');
        if (!layer) return;
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.color = color;
        el.style.left = `${x !== null ? x : window.innerWidth / 2}px`;
        el.style.top = `${y !== null ? y : window.innerHeight * 0.42}px`;
        layer.appendChild(el);
        setTimeout(() => el.remove(), 1600);
    }

    performPetInteraction(zone, clientX, clientY) {
        if (this.isSleeping) {
            this.showToast(`💤 ${this.currentPet.name} 正在甜甜地睡覺... 輕輕摸摸頭～`);
            return;
        }

        window.soundCtrl.playPet();
        this.records.petCount++;

        this.stats.mood = Math.min(100, this.stats.mood + 6);
        this.addExp(5);

        if (zone === 'ear-left' || zone === 'ear-right') {
            this.dogActor.twitchEars(zone === 'ear-left' ? 'left' : 'right');
            this.showToast(`👂 尖立耳抖動了兩下！${this.currentPet.name} 舒服地瞇起大眼睛！`);
            window.soundCtrl.playVoice(this.currentPetType, 'whine');
        } else if (zone === 'chin') {
            this.dogActor.setState('happy');
            this.showToast(`🥰 抓抓小下巴～ ${this.currentPet.name} 開心發出萌音！`);
            window.soundCtrl.playVoice(this.currentPetType, 'whine');
        } else if (zone === 'body') {
            this.dogActor.setState('happy');
            this.showToast(`✨ 摸摸柔軟的毛毛！${this.currentPet.name} 搖尾巴討抱抱！`);
            window.soundCtrl.playVoice(this.currentPetType, 'happy');
        } else {
            this.dogActor.setState('pet');
            this.showToast(`❤️ 摸摸頭～ 和 ${this.currentPet.name} 的親密度上升！`);
        }

        this.spawnScreenHearts(clientX || window.innerWidth / 2, clientY || window.innerHeight / 2);

        setTimeout(() => {
            if (this.dogActor.currentState === 'pet') {
                this.dogActor.setState('idle');
            }
        }, 1500);

        this.saveGame();
        this.updateUI();
    }

    performBath() {
        if (this.isSleeping) {
            this.showToast(`💤 ${this.currentPet.name} 正在睡覺，等醒來再洗澡吧！`);
            return;
        }

        this.stats.clean = 100;
        this.stats.mood = Math.min(100, this.stats.mood + 15);
        this.records.bathCount++;
        this.addExp(25);

        this.dogActor.setState('happy');
        this.showToast(`🛁 嘩啦啦～ 抹上香噴噴溫和泡泡，${this.currentPet.name} 洗得乾乾淨淨發亮！`);

        if (this.scene3d) {
            this.scene3d.trigger3DBathBubbles();
        }

        for (let i = 0; i < 8; i++) {
            setTimeout(() => window.soundCtrl.playBubble(), i * 120);
        }

        setTimeout(() => {
            window.soundCtrl.playVoice(this.currentPetType, 'happy');
            this.dogActor.setState('idle');
        }, 2000);

        this.saveGame();
        this.updateUI();
    }

    toggleSleep() {
        this.isSleeping = !this.isSleeping;
        const sleepBtnIcon = document.getElementById('sleep-btn-icon');
        const sleepBtnText = document.getElementById('sleep-btn-text');

        if (this.isSleeping) {
            document.body.classList.add('theme-night');
            this.dogActor.setState('sleep');
            if (this.scene3d) this.scene3d.setTheme('night');
            sleepBtnIcon.textContent = '☀️';
            sleepBtnText.textContent = '喚醒';
            this.showToast(`🌙 晚安 ${this.currentPet.name}～ 蜷在暖暖窩裡呼呼大睡！`);
        } else {
            this.applyTheme(this.currentTheme);
            this.dogActor.setState('idle');
            sleepBtnIcon.textContent = '🌙';
            sleepBtnText.textContent = '睡覺';
            this.showToast(`☀️ 早安！${this.currentPet.name} 精神飽滿地起床囉！`);
            window.soundCtrl.playVoice(this.currentPetType, 'happy');
        }
        this.updateUI();
    }

    trainSkill(skillId) {
        const sk = this.skills[skillId];
        if (!sk || !sk.unlocked) return;

        if (this.stats.energy < 15) {
            this.showToast(`⚡ ${this.currentPet.name} 玩累了，先讓牠喝點奶或睡個覺吧！`);
            return;
        }

        this.stats.energy = Math.max(0, this.stats.energy - 15);
        this.stats.mood = Math.min(100, this.stats.mood + 10);
        this.addExp(30);

        if (sk.level < sk.maxLevel) {
            sk.level++;
        }

        this.closeAllModals();

        if (skillId === 'sit') {
            this.dogActor.setState('sit');
            this.showToast(`🐕 ${this.currentPet.name} 乖乖坐好啦！獲得滿滿讚美！`);
        } else if (skillId === 'paw') {
            this.dogActor.setState('paw');
            this.showToast(`🤝 ${this.currentPet.name} 伸出小肉爪搭在你的手上！`);
        } else if (skillId === 'spin') {
            this.dogActor.setState('happy');
            this.dogActor.twitchEars('both');
            this.showToast(`💫 ${this.currentPet.name} 追著尾巴原地轉圈圈！`);
        } else if (skillId === 'rollover') {
            this.dogActor.setState('rollover');
            this.showToast(`🔄 ${this.currentPet.name} 翻肚肚打滾撒嬌！`);
        } else if (skillId === 'bark') {
            window.soundCtrl.playVoice(this.currentPetType, 'deep');
            this.dogActor.setState('happy');
            this.showToast(`📢 ${this.currentPet.name} 立起尖尖耳朵發出清脆叫聲！`);
        }

        this.spawnScreenHearts(window.innerWidth / 2, window.innerHeight * 0.45);

        setTimeout(() => {
            this.dogActor.setState('idle');
        }, 2400);

        this.saveGame();
        this.updateUI();
    }

    // 發起 3D 專屬互動玩遊戲 (撿球 / 頂球 / 飛走再回來 / 碰拳)
    triggerInteractiveGame() {
        if (this.isSleeping) {
            this.showToast(`💤 ${this.currentPet.name} 正在甜甜睡覺呢，先叫醒牠再玩遊戲吧！`);
            return;
        }

        if (this.scene3d && this.scene3d.activeMinigame) {
            this.showToast('🎮 遊戲正在進行中喔！');
            return;
        }

        this.closeAllModals();
        const feedMenu = document.getElementById('feed-menu');
        if (feedMenu) feedMenu.classList.add('hidden');

        window.soundCtrl.playClick();

        const bannerEl = document.getElementById('minigame-banner');
        const iconEl = document.getElementById('minigame-banner-icon');
        const textEl = document.getElementById('minigame-banner-text');

        const updateBanner = (icon, text) => {
            if (bannerEl && iconEl && textEl) {
                iconEl.textContent = icon;
                textEl.textContent = text;
                bannerEl.classList.remove('hidden');
            }
        };

        const petName = this.currentPet.name;
        const petType = this.currentPetType;

        const started = this.scene3d.playPetGame(petType, petName, updateBanner, (rewards) => {
            if (bannerEl) bannerEl.classList.add('hidden');
            if (rewards && rewards.success) {
                this.stats.mood = Math.min(100, this.stats.mood + rewards.mood);
                this.stats.energy = Math.max(0, this.stats.energy - 10);
                this.coins += rewards.coins;
                this.addExp(rewards.exp);
                if (this.records) this.records.gamesPlayed = (this.records.gamesPlayed || 0) + 1;

                this.updateUI();
                this.saveGame();

                window.soundCtrl.playVoice(this.currentPetType, 'happy');
                this.showToast(`🎉 玩遊戲大成功！獲得 🪙 ${rewards.coins} 金幣 與 ⚡ ${rewards.exp} 經驗值！`);
            }
        });

        if (!started) {
            this.showToast('🎮 遊戲準備中...');
        }
    }

    addExp(amount) {
        const pet = this.currentPet;
        pet.exp += amount;
        while (pet.exp >= pet.maxExp) {
            pet.exp -= pet.maxExp;
            this.levelUp();
        }
        this.updateUI();
    }

    levelUp() {
        const pet = this.currentPet;
        pet.level++;
        pet.maxExp = Math.floor(pet.maxExp * 1.35);
        this.coins += 50;
        window.soundCtrl.playLevelUp();

        this.applyGrowthScaleByLevel();

        Object.keys(this.skills).forEach(id => {
            const sk = this.skills[id];
            if (!sk.unlocked && pet.level >= sk.reqLv) {
                sk.unlocked = true;
                this.showToast(`🎉 升級到 Lv.${pet.level}！解鎖新動作：【${sk.name}】！`);
            }
        });

        this.showToast(`🌟 恭喜！${pet.name} 升級到了 Lv.${pet.level}！獲得 🪙 50 金幣！`);
        this.checkStageChange();
    }

    getStageInfo() {
        const lv = this.currentPet.level;
        if (this.currentPetType === 'bat') {
            const isAdult = (this.dogActor && this.dogActor.batStage === 'adult');
            if (isAdult) return { title: '長大倒掛期', badge: '長大倒掛 🦇' };
            return { title: '幼崽毛巾捲', badge: '幼崽毛巾捲 🧣' };
        } else if (this.currentPetType === 'wolf') {
            const isAdult = (this.dogActor && this.dogActor.wolfStage === 'adult');
            if (isAdult) return { title: '雪原冰眸狼王', badge: '冰眸狼王 🐺' };
            return { title: '煙燻小狼崽', badge: '幼崽小狼 🐾' };
        } else if (this.currentPetType === 'hyena') {
            const isAdult = (this.dogActor && this.dogActor.hyenaStage === 'adult');
            if (isAdult) return { title: '非洲草原斑鬣狗', badge: '草原斑鬣狗 🦴' };
            return { title: '深棕小斑鬣狗崽', badge: '幼崽鬣狗 🐾' };
        } else if (this.currentPetType === 'cheetah') {
            const isAdult = (this.dogActor && this.dogActor.cheetahStage === 'adult');
            if (isAdult) return { title: '原野極速獵豹', badge: '極速獵豹 🐆' };
            return { title: '銀鬃小獵豹崽', badge: '幼崽獵豹 🐾' };
        } else if (this.currentPetType === 'crow') {
            const isAdult = (this.dogActor && this.dogActor.crowStage === 'adult');
            if (isAdult) return { title: '暗夜渡鴉領主', badge: '極夜渡鴉 🦅' };
            return { title: '呆萌黑煤球烏鴉', badge: '黑煤球幼雛 🐥' };
        } else if (this.currentPetType === 'maned_wolf') {
            const isAdult = (this.dogActor && this.dogActor.manedWolfStage === 'adult');
            if (isAdult) return { title: '九頭身長腿超模', badge: '長腿超模 👑' };
            return { title: '煙灰圓滾幼崽', badge: '小灰幼崽 🐾' };
        } else if (this.currentPetType === 'elephant') {
            const isAdult = (this.dogActor && this.dogActor.elephantStage === 'adult');
            if (isAdult) return { title: '巍峨草原象王', badge: '草原巨擘 👑' };
            return { title: '軟萌小象寶寶', badge: '小象寶寶 🍼' };
        } else if (this.currentPetType === 'harpy') {
            const isAdult = (this.dogActor && this.dogActor.harpyStage === 'adult');
            if (isAdult) return { title: '雨林神獸角雕皇', badge: '雨林霸主 👑' };
            return { title: '台北動物園雪白幼雛', badge: '白雪幼雛 🐥' };
        } else if (this.currentPetType === 'orca') {
            const isAdult = (this.dogActor && this.dogActor.orcaStage === 'adult');
            if (isAdult) return { title: '深海霸主虎鯨', badge: '深海霸主 👑' };
            return { title: '軟萌虎鯨寶寶', badge: '虎鯨寶寶 🍼' };
        } else if (this.currentPetType === 'gibbon') {
            const isAdult = (this.dogActor && this.dogActor.gibbonStage === 'adult');
            if (isAdult) return { title: '林冠臂行宗師', badge: '林冠飛人 👑' };
            return { title: '軟萌金絲幼猿', badge: '金毛幼崽 🍼' };
        } else if (this.currentPetType === 'capybara') {
            const isAdult = (this.dogActor && this.dogActor.capybaraStage === 'adult');
            if (isAdult) return { title: '溫泉佛系水豚大王', badge: '柚子溫泉王 ♨️' };
            return { title: '頂橘子小水豚崽', badge: '呆萌水豚崽 🍊' };
        } else if (this.currentPetType === 'red_panda') {
            const isAdult = (this.dogActor && this.dogActor.redPandaStage === 'adult');
            if (isAdult) return { title: '竹林威嚇大師紅熊貓', badge: '舉手裝兇王 🙌' };
            return { title: '毛茸茸小火狐幼崽', badge: '火狐小幼崽 🎋' };
        } else if (this.currentPetType === 'snow_leopard') {
            const isAdult = (this.dogActor && this.dogActor.snowLeopardStage === 'adult');
            if (isAdult) return { title: '喜馬拉雅雪山之王', badge: '雪山豹王 🏔️' };
            return { title: '冰原煙灰小雪豹崽', badge: '冰眸小雪豹 ❄️' };
        } else if (this.currentPetType === 'penguin') {
            const isAdult = (this.dogActor && this.dogActor.penguinStage === 'adult');
            if (isAdult) return { title: '南極燕尾服帝企鵝皇', badge: '南極企鵝皇 👑' };
            return { title: '灰絨毛奇異果小企鵝', badge: '奇異果幼雛 🐣' };
        } else if (this.currentPetType === 'sea_otter') {
            const isAdult = (this.dogActor && this.dogActor.seaOtterStage === 'adult');
            if (isAdult) return { title: '敲貝殼藏寶海獺', badge: '扇貝珍珠王 🦪' };
            return { title: '仰泳抱扇貝毛球幼獺', badge: '漂浮小幼獺 🦦' };
        } else if (this.currentPetType === 'koala') {
            const isAdult = (this.dogActor && this.dogActor.koalaStage === 'adult');
            if (isAdult) return { title: '尤加利樹冠無尾熊', badge: '尤加利樹熊 🌿' };
            return { title: '叼嫩葉呆萌樹熊寶寶', badge: '呆萌小樹熊 🐨' };
        } else if (this.currentPetType === 'bunny') {
            const isAdult = (this.dogActor && this.dogActor.bunnyStage === 'adult');
            if (isAdult) return { title: '焦糖花冠垂耳兔', badge: '花冠垂耳兔 🌼' };
            return { title: '雪白糯米糰小幼兔', badge: '糯米糰幼兔 🐰' };
        } else if (this.currentPetType === 'lion') {
            const isAdult = (this.dogActor && this.dogActor.lionStage === 'adult');
            if (isAdult) return { title: '榮耀石萬獸之王雄獅', badge: '萬獸之王 👑' };
            return { title: '金黃呆萌小幼獅', badge: '辛巴小幼獅 🦁' };
        } else if (this.currentPetType === 'panda') {
            const isAdult = (this.dogActor && this.dogActor.pandaStage === 'adult');
            if (isAdult) return { title: '啃翠竹國寶大熊貓', badge: '國寶大熊貓 🎋' };
            return { title: '軟糯芝麻湯圓小團子', badge: '糯米小團子 🐼' };
        } else if (this.currentPetType === 'fennec') {
            const isAdult = (this.dogActor && this.dogActor.fennecStage === 'adult');
            if (isAdult) return { title: '撒哈拉雷達大耳狐', badge: '沙漠大耳精靈 🏜️' };
            return { title: '巴掌大大耳幼狐', badge: '招風耳幼狐 🦊' };
        } else if (this.currentPetType === 'giraffe') {
            const isAdult = (this.dogActor && this.dogActor.giraffeStage === 'adult');
            if (isAdult) return { title: '高挑優雅網紋長頸鹿', badge: '雲端長頸鹿 🦒' };
            return { title: '絨球小鹿角長頸鹿寶寶', badge: '呆萌小長頸鹿 🍼' };
        } else if (this.currentPetType === 'polar_bear') {
            const isAdult = (this.dogActor && this.dogActor.polarBearStage === 'adult');
            if (isAdult) return { title: '北極冰川雪熊王', badge: '極地雪熊王 ❄️' };
            return { title: '棉花糖小北極熊崽', badge: '雪白小熊崽 🐻‍❄️' };
        } else if (this.currentPetType === 'hamster') {
            const isAdult = (this.dogActor && this.dogActor.hamsterStage === 'adult');
            if (isAdult) return { title: '飛輪狂飆成鼠', badge: '飛輪倉鼠王 🎡' };
            return { title: '鼓鼓腮幫子幼鼠', badge: '貪吃小倉鼠 🐹' };
        } else if (this.currentPetType === 'hedgehog') {
            const isAdult = (this.dogActor && this.dogActor.hedgehogStage === 'adult');
            if (isAdult) return { title: '頭頂紅蘋果刺蝟', badge: '蘋果小刺蝟 🍎' };
            return { title: '軟萌捲球小刺蝟崽', badge: '捲球小刺蝟 🦔' };
        } else if (this.currentPetType === 'dolphin') {
            const isAdult = (this.dogActor && this.dogActor.dolphinStage === 'adult');
            if (isAdult) return { title: '破浪騰空瓶鼻海豚', badge: '躍浪海豚王 🌊' };
            return { title: '微笑浪花小海豚崽', badge: '微笑小海豚 🐬' };
        } else if (this.currentPetType === 'tiger') {
            const isAdult = (this.dogActor && this.dogActor.tigerStage === 'adult');
            if (isAdult) return { title: '額頭王字烈焰猛虎王', badge: '烈焰猛虎王 🔥' };
            return { title: '呆萌王字小虎崽', badge: '王字小虎崽 🐯' };
        } else if (this.currentPetType === 'condor') {
            const isAdult = (this.dogActor && this.dogActor.condorStage === 'adult');
            if (isAdult) return { title: '安地斯神鷲皇（成年）', badge: '安地斯神鷲皇 🏔️' };
            return { title: '肉桂褐絨毛小神鷲雛', badge: '絨毛小神鷲雛 🐥' };
        }
        // 狗 / 狐狸的成體/幼崽 badge
        if (['dog','fox'].includes(this.currentPetType) && this.dogActor) {
            const isAdult = this.dogActor._adultStage === true;
            if (this.currentPetType === 'fox') {
                if (isAdult) return { title: '成體狐狸', badge: '成體狐狸 🦊' };
                return { title: '幼崽小狐狸', badge: '幼崽狐狸 🦊' };
            } else {
                if (isAdult) return { title: '成年黑犬', badge: '成年黑犬 🐕' };
                return { title: '幼崽小黑狗', badge: '幼崽黑狗 🐾' };
            }
        }
        if (lv >= 20) return { title: '傳奇期', badge: '傳奇期' };
        if (lv >= 10) return { title: '成犬期', badge: '成寵期' };
        if (lv >= 5) return { title: '少年期', badge: '少年期' };
        return { title: '幼崽期', badge: '幼崽期' };
    }

    checkStageChange() {
        const stage = this.getStageInfo();
        document.getElementById('pet-stage-badge').textContent = stage.badge;
    }

    addCoins(amount) {
        this.coins += amount;
        this.updateUI();
    }

    startGameLoop() {
        setInterval(() => {
            if (this.isSleeping) {
                this.stats.energy = Math.min(100, this.stats.energy + 4);
                this.stats.hunger = Math.max(0, this.stats.hunger - 0.5);
            } else {
                this.stats.hunger = Math.max(0, this.stats.hunger - 1.2);
                this.stats.mood = Math.max(0, this.stats.mood - 0.8);
                this.stats.energy = Math.max(0, this.stats.energy - 0.5);
                this.stats.clean = Math.max(0, this.stats.clean - 0.6);
            }

            this.updateUI();
            this.checkPetDialogueConditions();
        }, 8000);
    }

    checkPetDialogueConditions() {
        if (this.stats.hunger < 30) {
            this.triggerSpeech('hungry');
        } else if (this.stats.energy < 25) {
            this.triggerSpeech('tired');
        } else if (this.stats.clean < 30) {
            this.triggerSpeech('dirty');
        } else if (this.stats.mood < 40) {
            this.triggerSpeech('bored');
        }
    }

    triggerSpeech(type = 'idle', customText = null) {
        const bubble = document.getElementById('pet-speech');
        const textEl = document.getElementById('speech-text');
        let msg = customText;
        if (!msg) {
            const bank = this.dialogueBank[this.currentPetType] || this.dialogueBank.dog;
            const list = bank[type] || bank.idle;
            msg = list[Math.floor(Math.random() * list.length)];
        }

        textEl.textContent = msg;
        bubble.classList.add('show');

        if (this.speechTimer) clearTimeout(this.speechTimer);
        this.speechTimer = setTimeout(() => {
            bubble.classList.remove('show');
        }, 4000);
    }

    updateUI() {
        const pet = this.currentPet;
        document.getElementById('pet-name-display').textContent = pet.name;
        document.getElementById('pet-level').textContent = pet.level;
        document.getElementById('coin-amount').textContent = this.coins;

        const expPct = Math.min(100, Math.floor((pet.exp / pet.maxExp) * 100));
        document.getElementById('exp-bar').style.width = `${expPct}%`;
        document.getElementById('exp-text').textContent = `${pet.exp} / ${pet.maxExp}`;

        const updateBar = (id, val) => {
            const rounded = Math.round(val);
            document.getElementById(`val-${id}`).textContent = `${rounded}%`;
            const bar = document.getElementById(`bar-${id}`);
            bar.style.width = `${rounded}%`;
            const item = document.getElementById(`stat-${id}-item`);
            if (rounded < 25) item.classList.add('stat-low');
            else item.classList.remove('stat-low');
        };

        updateBar('hunger', this.stats.hunger);
        updateBar('mood', this.stats.mood);
        updateBar('energy', this.stats.energy);
        updateBar('clean', this.stats.clean);

        // 同步手機版精簡單行控制列數值
        const mAvatar = document.getElementById('m-bar-avatar');
        const mName = document.getElementById('m-bar-name');
        const mBadge = document.getElementById('m-bar-badge');
        const mCoins = document.getElementById('m-bar-coins');
        const mAvgStat = document.getElementById('m-bar-avg-stat');
        const curAvatar = document.getElementById('current-pet-avatar');
        if (mAvatar && curAvatar) mAvatar.textContent = curAvatar.textContent || '🐾';
        if (mName) mName.textContent = pet.name;
        if (mBadge) mBadge.textContent = `Lv.${pet.level}`;
        if (mCoins) mCoins.textContent = this.coins;
        if (mAvgStat) {
            const avg = Math.round((this.stats.hunger + this.stats.mood + this.stats.energy + this.stats.clean) / 4);
            mAvgStat.textContent = `${avg}%`;
        }

        this.checkStageChange();
    }

    renderTrainSkills() {
        const container = document.getElementById('skills-list');
        container.innerHTML = '';

        Object.keys(this.skills).forEach(id => {
            const sk = this.skills[id];
            const div = document.createElement('div');
            div.className = `skill-card ${sk.unlocked ? 'unlocked' : 'locked'}`;

            div.innerHTML = `
                <div class="skill-left">
                    <span class="skill-icon">${sk.icon}</span>
                    <div class="skill-info">
                        <h4>${sk.name} ${sk.unlocked ? `(熟練度: Lv.${sk.level}/${sk.maxLevel})` : ''}</h4>
                        <p>${sk.unlocked ? sk.desc : `🔒 需達到等級 Lv.${sk.reqLv} 解鎖`}</p>
                    </div>
                </div>
                <div class="skill-right">
                    ${sk.unlocked 
                        ? `<button class="primary-btn train-act-btn" data-skill="${id}">練習 (-15⚡)</button>` 
                        : `<button class="primary-btn" disabled style="opacity:0.5;">未解鎖</button>`}
                </div>
            `;

            container.appendChild(div);
        });

        document.querySelectorAll('.train-act-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trainSkill(btn.dataset.skill);
            });
        });
    }

    // =========================================================================
    // 渲染商城 (含 🐾 領養專區、🎀 裝扮、🏡 場景)
    // =========================================================================
    renderShop(tab = 'adopt') {
        const container = document.getElementById('shop-items-container');
        container.innerHTML = '';

        if (tab === 'adopt') {
            // 🐾 寵物領養專區 (狐狸幼崽自選毛色 & 稀有萌寵)
            const adoptGrid = document.createElement('div');
            adoptGrid.className = 'adopt-grid';

            // 1. 狐狸幼崽 (三色自選：赤狐、北極狐、銀狐)
            const foxCard = document.createElement('div');
            foxCard.className = 'adopt-card';
            foxCard.innerHTML = `
                <div class="adopt-icon" id="adopt-fox-preview-icon">🦊</div>
                <div class="adopt-title">靈動狐狸幼崽</div>
                <div class="adopt-desc">大而機靈的立耳、蓬鬆白尖大尾巴與活潑可愛的性格！</div>
                <div class="fox-variant-picker">
                    <button class="variant-btn ${this.selectedFoxVariant === 'red' ? 'active' : ''}" data-variant="red">🟠 赤狐</button>
                    <button class="variant-btn ${this.selectedFoxVariant === 'white' ? 'active' : ''}" data-variant="white">⚪ 北極狐</button>
                    <button class="variant-btn ${this.selectedFoxVariant === 'silver' ? 'active' : ''}" data-variant="silver">⚫ 銀狐</button>
                </div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 750</div>
                <button class="primary-btn adopt-action-btn" data-type="fox" data-price="750" style="width:100%; margin-top:6px;">
                    立即領養 🦊
                </button>
            `;
            adoptGrid.appendChild(foxCard);

            // 3. 呆萌狐蝠（果蝠）(幼崽毛巾捲 + 長大倒掛)
            const batCard = document.createElement('div');
            batCard.className = 'adopt-card';
            batCard.innerHTML = `
                <div class="adopt-icon">🦇</div>
                <div class="adopt-title">呆萌狐蝠（果蝠）</div>
                <div class="adopt-desc">幼崽期被軟毛巾捲著大口嚼香蕉，長大後會帥氣倒掛展翅！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 600</div>
                <button class="primary-btn adopt-action-btn" data-type="bat" data-name="果果 (Guoguo)" data-price="600" style="width:100%; margin-top:6px;">
                    立即領養 🦇
                </button>
            `;
            adoptGrid.appendChild(batCard);

            // 4. 冰眸黑狼 (幼狼煙燻黑 + 成狼冰藍眸雪松王者)
            const wolfCard = document.createElement('div');
            wolfCard.className = 'adopt-card';
            wolfCard.innerHTML = `
                <div class="adopt-icon">🐺</div>
                <div class="adopt-title">冰眸黑狼（雪原孤狼）</div>
                <div class="adopt-desc">幼狼呆萌毛茸煙燻黑，長大後擁有攝人心魄的冰藍魔眸與仰天長嘯！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 750</div>
                <button class="primary-btn adopt-action-btn" data-type="wolf" data-name="玄夜 (Kuroya)" data-price="750" style="width:100%; margin-top:6px;">
                    立即領養 🐺
                </button>
            `;
            adoptGrid.appendChild(wolfCard);

            // 5. 斑鬣狗 (前臂長後腿短 + 獨特笑聲)
            const hyenaCard = document.createElement('div');
            hyenaCard.className = 'adopt-card';
            hyenaCard.innerHTML = `
                <div class="adopt-icon">🦴</div>
                <div class="adopt-title">斑鬣狗（草原荒野獵手）</div>
                <div class="adopt-desc">幼崽深棕毛茸圓耳，長大後擁有標誌性「前臂修長後腿較短」身軀與斑點鬃毛，發出歡快魔性咯咯笑聲！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 750</div>
                <button class="primary-btn adopt-action-btn" data-type="hyena" data-name="斑斑 (Banban)" data-price="750" style="width:100%; margin-top:6px;">
                    立即領養 🦴
                </button>
            `;
            adoptGrid.appendChild(hyenaCard);

            // 6. 獵豹 (銀灰披風幼崽 + 極速深胸細腰成體)
            const cheetahCard = document.createElement('div');
            cheetahCard.className = 'adopt-card';
            cheetahCard.innerHTML = `
                <div class="adopt-icon">🐆</div>
                <div class="adopt-title">非洲獵豹（陸地極速之王）</div>
                <div class="adopt-desc">幼崽擁有銀灰披風背毛與黑淚痕鳥鳴啾叫，成體深胸細腰全速狂奔，速度霸主！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 750</div>
                <button class="primary-btn adopt-action-btn" data-type="cheetah" data-name="閃電 (Flash)" data-price="750" style="width:100%; margin-top:6px;">
                    立即領養 🐆
                </button>
            `;
            adoptGrid.appendChild(cheetahCard);

            // 7. 烏鴉 / 渡鴉 (黑煤球幼雛 + 極夜渡鴉領主大佬)
            const crowCard = document.createElement('div');
            crowCard.className = 'adopt-card';
            crowCard.innerHTML = `
                <div class="adopt-icon">🪶</div>
                <div class="adopt-title">暗夜渡鴉（靈禽領主）</div>
                <div class="adopt-desc">幼鳥是手心上的黑煤球芝麻毛球、歪頭殺超萌索食；成年後進化為油亮暗夜黑羽、巨大彎鉤喙與帥氣披針毛領的大佬渡鴉！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 750</div>
                <button class="primary-btn adopt-action-btn" data-type="crow" data-name="小煤球 (Kurokoma)" data-price="750" style="width:100%; margin-top:6px;">
                    立即領養 🪶
                </button>
            `;
            adoptGrid.appendChild(crowCard);

            // 8. 南美鬃狼 / 長腿狐狼 (煙灰短腿幼崽 + 九頭身長腿超模)
            const manedWolfCard = document.createElement('div');
            manedWolfCard.className = 'adopt-card';
            manedWolfCard.innerHTML = `
                <div class="adopt-icon">🌾</div>
                <div class="adopt-title">長腿狐狼・南美鬃狼</div>
                <div class="adopt-desc">幼崽是圓滾滾煙灰短腿小萌球；長大驚豔全場，擁有逆天過膝黑長襪、金橘紅狐身、高聳黑鬃毛與優雅超模同側步！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 750</div>
                <button class="primary-btn adopt-action-btn" data-type="maned_wolf" data-name="腿哥 (Leggy)" data-price="750" style="width:100%; margin-top:6px;">
                    立即領養 🌾
                </button>
            `;
            adoptGrid.appendChild(manedWolfCard);

            // 9. 非洲大象 / 象王 (軟萌小象寶寶 + 巍峨草原象王)
            const elephantCard = document.createElement('div');
            elephantCard.className = 'adopt-card';
            elephantCard.innerHTML = `
                <div class="adopt-icon">🐘</div>
                <div class="adopt-title">非洲大象・象王</div>
                <div class="adopt-desc">幼象是圓滾滾軟糯小肉球，靈巧小象鼻吸水噴水；成年蛻變為巍峨象王，擁有潔白優雅長象牙、霸氣非洲大扇耳與震撼草原的昂首長鳴！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 800</div>
                <button class="primary-btn adopt-action-btn" data-type="elephant" data-name="波波 (Bobo)" data-price="800" style="width:100%; margin-top:6px;">
                    立即領養 🐘
                </button>
            `;
            adoptGrid.appendChild(elephantCard);

            // 10. 美洲角雕 / 哈比鷹 (台北動物園白雪幼雛 + 雨林神獸角雕皇)
            const harpyCard = document.createElement('div');
            harpyCard.className = 'adopt-card';
            harpyCard.innerHTML = `
                <div class="adopt-icon">🦅</div>
                <div class="adopt-title">美洲角雕・哈比鷹</div>
                <div class="adopt-desc">幼雛是軟綿綿純白雪球棉花糖；成年蛻變為雨林神獸角雕皇，具備標誌性炸毛雙叉王冠羽、墨黑羽甲、黑白斑紋巨腿與黑金致命巨爪！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 850</div>
                <button class="primary-btn adopt-action-btn" data-type="harpy" data-name="哈比 (Harpy)" data-price="850" style="width:100%; margin-top:6px;">
                    立即領養 🦅
                </button>
            `;
            adoptGrid.appendChild(harpyCard);

            // 11. 蔚藍海洋・虎鯨 (軟萌虎鯨寶寶 + 深海霸主虎鯨)
            const orcaCard = document.createElement('div');
            orcaCard.className = 'adopt-card';
            orcaCard.innerHTML = `
                <div class="adopt-icon">🐋</div>
                <div class="adopt-title">深海霸主・虎鯨</div>
                <div class="adopt-desc">幼鯨是圓滾滾西瓜頭與暖白幼斑，在蔚藍水波中俏皮翻滾；成鯨蛻變為深海巨擘，擁有直立威武高聳黑背鰭、經典黑白燕尾服、噴氣孔彩虹水柱與空靈長鳴！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 900</div>
                <button class="primary-btn adopt-action-btn" data-type="orca" data-name="波浪 (Nami)" data-price="900" style="width:100%; margin-top:6px;">
                    立即領養 🐋
                </button>
            `;
            adoptGrid.appendChild(orcaCard);

            // 12. 熱帶林冠・金絲長臂猿 (軟萌金毛幼崽 + 林冠臂行宗師)
            const gibbonCard = document.createElement('div');
            gibbonCard.className = 'adopt-card';
            gibbonCard.innerHTML = `
                <div class="adopt-icon">🐒</div>
                <div class="adopt-title">金絲長臂猿・臂行大師</div>
                <div class="adopt-desc">幼猿是耀眼暖金茸毛球、俏皮黑面具臉，伸出纖長小手臂討抱抱；成體長臂猿身披金色修長毛羽、頭頂帥氣黑頂斑與白頰光環，在雨林老藤間優雅飛蕩！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 880</div>
                <button class="primary-btn adopt-action-btn" data-type="gibbon" data-name="金寶 (Kiki)" data-price="880" style="width:100%; margin-top:6px;">
                    立即領養 🐒
                </button>
            `;
            adoptGrid.appendChild(gibbonCard);

            // 13. 佛系療癒・溫泉水豚君 (頂橘子小水豚崽 + 檜木柚子溫泉大王)
            const capybaraCard = document.createElement('div');
            capybaraCard.className = 'adopt-card';
            capybaraCard.innerHTML = `
                <div class="adopt-icon">🍊</div>
                <div class="adopt-title">佛系溫泉水豚君</div>
                <div class="adopt-desc">幼崽是頭頂蜜柑橘子的圓滾滾焦糖栗棕小土豆；成年後直接泡在飄滿金黃柚子的日式檜木溫泉桶裡，頭頂雙層橘子塔，療癒感滿分！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 820</div>
                <button class="primary-btn adopt-action-btn" data-type="capybara" data-name="豚豚 (Puku)" data-price="820" style="width:100%; margin-top:6px;">
                    立即領養 🍊
                </button>
            `;
            adoptGrid.appendChild(capybaraCard);

            // 14. 喜馬拉雅・小熊貓 / 紅熊貓 (毛茸茸火狐幼崽 + 站立舉手威嚇大師)
            const redPandaCard = document.createElement('div');
            redPandaCard.className = 'adopt-card';
            redPandaCard.innerHTML = `
                <div class="adopt-icon">🎋</div>
                <div class="adopt-title">喜馬拉雅小熊貓（紅熊貓）</div>
                <div class="adopt-desc">擁有赤紅蓬鬆毛皮、雪白眉斑面具與九節大環紋尾！成年後伴隨翠綠孟宗竹林，玩耍時會展示招牌「雙腳站立高舉雙手裝兇賣萌」必殺技！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 850</div>
                <button class="primary-btn adopt-action-btn" data-type="red_panda" data-name="圓圓 (Maru)" data-price="850" style="width:100%; margin-top:6px;">
                    立即領養 🎋
                </button>
            `;
            adoptGrid.appendChild(redPandaCard);

            // 15. 喜馬拉雅雪山之王・雪豹 (冰眸小雪豹崽 + 咬尾巴雪山豹王)
            const snowLeopardCard = document.createElement('div');
            snowLeopardCard.className = 'adopt-card';
            snowLeopardCard.innerHTML = `
                <div class="adopt-icon">❄️</div>
                <div class="adopt-title">雪山之王・冰眸雪豹</div>
                <div class="adopt-desc">銀白冰霧厚毛搭配炭黑玫瑰斑環與璀璨冰晶藍寶石眼眸！成年佇立於覆雪高山岩台，開心時會低頭「叼住自己超長超粗的大毛尾巴」反差萌爆表！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 920</div>
                <button class="primary-btn adopt-action-btn" data-type="snow_leopard" data-name="凜冬 (Frost)" data-price="920" style="width:100%; margin-top:6px;">
                    立即領養 ❄️
                </button>
            `;
            adoptGrid.appendChild(snowLeopardCard);

            // 16. 南極冰原紳士・帝企鵝 (奇異果灰絨毛幼雛 + 燕尾服滑冰企鵝皇)
            const penguinCard = document.createElement('div');
            penguinCard.className = 'adopt-card';
            penguinCard.innerHTML = `
                <div class="adopt-icon">🐧</div>
                <div class="adopt-title">南極帝企鵝・冰原紳士</div>
                <div class="adopt-desc">幼雛是灰撲撲奇異果絨毛球與黑白熊貓小臉譜；成年蛻變為黑曜石燕尾服、雪白圓肚與璀璨金橘頸斑的帝企鵝皇，還能表演肚皮貼地滑冰大衝刺！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 860</div>
                <button class="primary-btn adopt-action-btn" data-type="penguin" data-name="波波企 (Pingu)" data-price="860" style="width:100%; margin-top:6px;">
                    立即領養 🐧
                </button>
            `;
            adoptGrid.appendChild(penguinCard);

            // 17. 太平洋療癒萌神・海獺 (仰泳抱扇貝毛球幼獺 + 敲貝殼開大珍珠海獺)
            const seaOtterCard = document.createElement('div');
            seaOtterCard.className = 'adopt-card';
            seaOtterCard.innerHTML = `
                <div class="adopt-icon">🦦</div>
                <div class="adopt-title">太平洋海獺・扇貝珍珠王</div>
                <div class="adopt-desc">幼獺是仰躺碧海隨波漂浮的蓬鬆栗子毛球，雙爪抱著粉紅扇貝揉臉賣萌；成年後會在肚皮放小石頭砧板，叩叩敲開扇貝露出璀璨發光大珍珠！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 880</div>
                <button class="primary-btn adopt-action-btn" data-type="sea_otter" data-name="貝貝 (Shell)" data-price="880" style="width:100%; margin-top:6px;">
                    立即領養 🦦
                </button>
            `;
            adoptGrid.appendChild(seaOtterCard);

            // 18. 澳洲森林睡神・無尾熊 (叼嫩葉樹熊寶寶 + 尤加利樹冠大耳無尾熊)
            const koalaCard = document.createElement('div');
            koalaCard.className = 'adopt-card';
            koalaCard.innerHTML = `
                <div class="adopt-icon">🐨</div>
                <div class="adopt-title">澳洲無尾熊・尤加利精靈</div>
                <div class="adopt-desc">擁有標誌性超蓬鬆雪白毛絨大圓耳與大黑橢圓橡膠鼻！幼崽嘴角叼著翠綠嫩葉靠著小樹樁；成年抱在茂密尤加利樹幹上，會爬樹搖落星光並揮手撒嬌！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 840</div>
                <button class="primary-btn adopt-action-btn" data-type="koala" data-name="尤加利 (Koko)" data-price="840" style="width:100%; margin-top:6px;">
                    立即領養 🐨
                </button>
            `;
            adoptGrid.appendChild(koalaCard);

            // 19. 軟糯春日萌寵・荷蘭垂耳兔 (雪白糯米糰幼兔 + 焦糖花冠兔兔跳成兔)
            const bunnyCard = document.createElement('div');
            bunnyCard.className = 'adopt-card';
            bunnyCard.innerHTML = `
                <div class="adopt-icon">🐰</div>
                <div class="adopt-title">荷蘭垂耳兔・春日花冠兔</div>
                <div class="adopt-desc">小粉鼻會高頻一抽一抽嗅聞！幼兔是純白軟糯的糯米糰子配粉嫩長垂耳；成兔換上焦糖奶油雙色毛衣、頭戴春日小雛菊花冠，玩耍時會表演空中扭腰兔兔跳！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 780</div>
                <button class="primary-btn adopt-action-btn" data-type="bunny" data-name="團團 (Mochi)" data-price="780" style="width:100%; margin-top:6px;">
                    立即領養 🐰
                </button>
            `;
            adoptGrid.appendChild(bunnyCard);

            // 20. 非洲榮耀萬獸之王・獅子 (呆萌辛巴小幼獅 + 榮耀石雙層大鬃毛獅王)
            const lionCard = document.createElement('div');
            lionCard.className = 'adopt-card';
            lionCard.innerHTML = `
                <div class="adopt-icon">🦁</div>
                <div class="adopt-title">非洲雄獅・萬獸之王</div>
                <div class="adopt-desc">幼獅是金黃圓耳、帶著可愛奶音吼叫的辛巴小萌獅；成年後傲立於榮耀石底座，披著濃密深紅棕與璀璨金雙層太陽大獅鬃，昂首獅吼威震全場！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 950</div>
                <button class="primary-btn adopt-action-btn" data-type="lion" data-name="辛巴 (Simba)" data-price="950" style="width:100%; margin-top:6px;">
                    立即領養 🦁
                </button>
            `;
            adoptGrid.appendChild(lionCard);

            // 21. 四川國寶頂流・大熊貓 (軟糯芝麻湯圓小團子 + 坐姿啃翠竹前滾翻貓熊)
            const pandaCard = document.createElement('div');
            pandaCard.className = 'adopt-card';
            pandaCard.innerHTML = `
                <div class="adopt-icon">🐼</div>
                <div class="adopt-title">四川大熊貓・國寶滾滾</div>
                <div class="adopt-desc">幼崽是軟糯黑白芝麻湯圓小團子與八字黑眼圈；成年後坐在翠竹叢旁手握鮮嫩竹子大口嚼，玩耍時會縮成一顆球表演招牌「前滾翻打滾賣萌」！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 900</div>
                <button class="primary-btn adopt-action-btn" data-type="panda" data-name="滾滾 (GunGun)" data-price="900" style="width:100%; margin-top:6px;">
                    立即領養 🐼
                </button>
            `;
            adoptGrid.appendChild(pandaCard);

            // 22. 撒哈拉沙漠精靈・耳廓狐 (巴掌大大耳幼狐 + 雷達巨耳沙漠小狐)
            const fennecCard = document.createElement('div');
            fennecCard.className = 'adopt-card';
            fennecCard.innerHTML = `
                <div class="adopt-icon">🏜️</div>
                <div class="adopt-title">撒哈拉耳廓狐・大耳精靈</div>
                <div class="adopt-desc">擁有佔了半個身體大的超巨型招風耳與香檳金沙奶油毛皮！發出高頻歡快的吱吱撒嬌聲，玩耍時會豎起雷達大耳施展靈巧的沙漠飛撲！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 820</div>
                <button class="primary-btn adopt-action-btn" data-type="fennec" data-name="沙沙 (Sands)" data-price="820" style="width:100%; margin-top:6px;">
                    立即領養 🏜️
                </button>
            `;
            adoptGrid.appendChild(fennecCard);

            // 23. 非洲草原雲端紳士・長頸鹿 (絨球角小長頸鹿 + 高挑優雅網紋長頸鹿)
            const giraffeCard = document.createElement('div');
            giraffeCard.className = 'adopt-card';
            giraffeCard.innerHTML = `
                <div class="adopt-icon">🦒</div>
                <div class="adopt-title">非洲長頸鹿・雲端紳士</div>
                <div class="adopt-desc">頭頂兩根毛茸茸的圓球小鹿角與水靈大眼！幼鹿呆萌可愛，成年後擁有修長優雅的焦糖網紋長頸，開心時會彎下長脖子溫柔蹭蹭你！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 860</div>
                <button class="primary-btn adopt-action-btn" data-type="giraffe" data-name="喬治 (George)" data-price="860" style="width:100%; margin-top:6px;">
                    立即領養 🦒
                </button>
            `;
            adoptGrid.appendChild(giraffeCard);

            // 24. 北極冰原霸主・北極熊 (雪白棉花糖小熊崽 + 北極冰川雪熊王)
            const polarBearCard = document.createElement('div');
            polarBearCard.className = 'adopt-card';
            polarBearCard.innerHTML = `
                <div class="adopt-icon">🐻‍❄️</div>
                <div class="adopt-title">北極白熊・極地雪熊王</div>
                <div class="adopt-desc">幼崽是純白蓬鬆的棉花糖小毛球配黑豆眼與黑鼻頭；成年後佇立於北極晶瑩浮冰台，體格雄偉卻對主人無比溫柔，最愛吃深海大鮪魚！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 920</div>
                <button class="primary-btn adopt-action-btn" data-type="polar_bear" data-name="白雪 (Shiro)" data-price="920" style="width:100%; margin-top:6px;">
                    立即領養 🐻‍❄️
                </button>
            `;
            adoptGrid.appendChild(polarBearCard);

            // 25. 蜜糖頰囊萌球・黃金倉鼠 (塞滿腮幫子幼鼠 + 天藍飛輪狂飆成鼠)
            const hamsterCard = document.createElement('div');
            hamsterCard.className = 'adopt-card';
            hamsterCard.innerHTML = `
                <div class="adopt-icon">🐹</div>
                <div class="adopt-title">黃金倉鼠・飛輪小萌神</div>
                <div class="adopt-desc">擁有軟綿綿鼓鼓大腮幫子與蜜糖橘金毛色！成年後自帶天藍透明感跑跑滾輪，玩耍時會跳上飛輪展現超高速狂飆秀！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 680</div>
                <button class="primary-btn adopt-action-btn" data-type="hamster" data-name="哈姆 (Hamu)" data-price="680" style="width:100%; margin-top:6px;">
                    立即領養 🐹
                </button>
            `;
            adoptGrid.appendChild(hamsterCard);

            // 26. 童話森林精靈・小刺蝟 (軟萌捲球幼崽 + 頭頂紅蘋果刺蝟)
            const hedgehogCard = document.createElement('div');
            hedgehogCard.className = 'adopt-card';
            hedgehogCard.innerHTML = `
                <div class="adopt-icon">🦔</div>
                <div class="adopt-title">森林小刺蝟・蘋果刺刺</div>
                <div class="adopt-desc">可可色小背刺配溫暖杏仁白軟肚皮！成年後背上頂著一顆紅通通的森林小蘋果，玩耍時會縮成圓球施展旋風滾滾衝刺！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 720</div>
                <button class="primary-btn adopt-action-btn" data-type="hedgehog" data-name="刺刺 (Toge)" data-price="720" style="width:100%; margin-top:6px;">
                    立即領養 🦔
                </button>
            `;
            adoptGrid.appendChild(hedgehogCard);

            // 27. 蔚藍海洋微笑天使・瓶鼻海豚 (浪花小海豚 + 破浪騰空海豚王)
            const dolphinCard = document.createElement('div');
            dolphinCard.className = 'adopt-card';
            dolphinCard.innerHTML = `
                <div class="adopt-icon">🐬</div>
                <div class="adopt-title">瓶鼻海豚・微笑浪花天使</div>
                <div class="adopt-desc">晴空蔚藍光滑海豚皮與天生療癒微笑！伴隨晶瑩水波漣漪，玩耍時會破浪騰空躍起，在空中劃出璀璨水花弧線！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 880</div>
                <button class="primary-btn adopt-action-btn" data-type="dolphin" data-name="藍藍 (Aqua)" data-price="880" style="width:100%; margin-top:6px;">
                    立即領養 🐬
                </button>
            `;
            adoptGrid.appendChild(dolphinCard);

            // 28. 烈焰叢林百獸霸主・孟加拉虎 (呆萌王字小虎崽 + 烈焰猛虎王)
            const tigerCard = document.createElement('div');
            tigerCard.className = 'adopt-card';
            tigerCard.innerHTML = `
                <div class="adopt-icon">🐯</div>
                <div class="adopt-title">孟加拉虎・烈焰叢林之王</div>
                <div class="adopt-desc">烈焰琥珀橘毛皮搭配純黑霸氣虎紋與額頭「王」字印記！玩耍時展現威震八方的叢林猛虎連環飛躍，落地後瞬間變回大貓咪蹭蹭你！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 950</div>
                <button class="primary-btn adopt-action-btn" data-type="tiger" data-name="琥珀 (Kohaku)" data-price="950" style="width:100%; margin-top:6px;">
                    立即領養 🐯
                </button>
            `;
            adoptGrid.appendChild(tigerCard);

            // 29. 南美蒼穹守護神・安地斯神鷲 (肉桂褐絨毛幼雛 + 雪白頸圈 3.3m 黑白巨翼神鷲皇)
            const condorCard = document.createElement('div');
            condorCard.className = 'adopt-card';
            condorCard.innerHTML = `
                <div class="adopt-icon">🏔️</div>
                <div class="adopt-title">安地斯神鷲・南美蒼穹之神</div>
                <div class="adopt-desc">幼雛是肉桂褐蓬鬆絨毛與水汪汪深琥珀大眼；成年佇立於安地斯山岩，擁有標誌性厚實雪白絨毛頸圈、紫紅肉冠頭、象牙白尖鉤喙、收翼兩側大片白斑與 3.3m 開叉指羽黑白巨翼！</div>
                <div class="shop-item-price" style="margin-top:auto;">🪙 960</div>
                <button class="primary-btn adopt-action-btn" data-type="condor" data-name="安地斯 (Andes)" data-price="960" style="width:100%; margin-top:6px;">
                    立即領養 🏔️
                </button>
            `;
            adoptGrid.appendChild(condorCard);

            container.appendChild(adoptGrid);

            // 狐狸毛色切換
            foxCard.querySelectorAll('.variant-btn').forEach(vBtn => {
                vBtn.addEventListener('click', () => {
                    foxCard.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                    vBtn.classList.add('active');
                    this.selectedFoxVariant = vBtn.dataset.variant;
                    const previewIcon = document.getElementById('adopt-fox-preview-icon');
                    if (this.selectedFoxVariant === 'white') previewIcon.textContent = '🤍';
                    else if (this.selectedFoxVariant === 'silver') previewIcon.textContent = '🖤';
                    else previewIcon.textContent = '🦊';
                });
            });

            // 領養按鈕事件
            container.querySelectorAll('.adopt-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const type = btn.dataset.type;
                    const price = parseInt(btn.dataset.price);

                    if (type === 'fox') {
                        const v = this.selectedFoxVariant;
                        let defaultName = '赤赤 (Akane)';
                        if (v === 'white') defaultName = '雪寶 (Snow)';
                        if (v === 'silver') defaultName = '影狐 (Shadow)';
                        this.adoptPet('fox', v, defaultName, price);
                    } else if (type === 'bat') {
                        this.adoptPet('bat', 'default', '果果 (Guoguo)', price);
                    } else if (type === 'wolf') {
                        this.adoptPet('wolf', 'default', '玄夜 (Kuroya)', price);
                    } else if (type === 'hyena') {
                        this.adoptPet('hyena', 'default', '斑斑 (Banban)', price);
                    } else if (type === 'cheetah') {
                        this.adoptPet('cheetah', 'default', '閃電 (Flash)', price);
                    } else if (type === 'crow') {
                        this.adoptPet('crow', 'default', '小煤球 (Kurokoma)', price);
                    } else if (type === 'maned_wolf') {
                        this.adoptPet('maned_wolf', 'default', '腿哥 (Leggy)', price);
                    } else if (type === 'elephant') {
                        this.adoptPet('elephant', 'default', '波波 (Bobo)', price);
                    } else if (type === 'harpy') {
                        this.adoptPet('harpy', 'default', '哈比 (Harpy)', price);
                    } else if (type === 'orca') {
                        this.adoptPet('orca', 'default', '波浪 (Nami)', price);
                    } else if (type === 'gibbon') {
                        this.adoptPet('gibbon', 'default', '金寶 (Kiki)', price);
                    } else if (type === 'capybara') {
                        this.adoptPet('capybara', 'default', '豚豚 (Puku)', price);
                    } else if (type === 'red_panda') {
                        this.adoptPet('red_panda', 'default', '圓圓 (Maru)', price);
                    } else if (type === 'snow_leopard') {
                        this.adoptPet('snow_leopard', 'default', '凜冬 (Frost)', price);
                    } else if (type === 'penguin') {
                        this.adoptPet('penguin', 'default', '波波企 (Pingu)', price);
                    } else if (type === 'sea_otter') {
                        this.adoptPet('sea_otter', 'default', '貝貝 (Shell)', price);
                    } else if (type === 'koala') {
                        this.adoptPet('koala', 'default', '尤加利 (Koko)', price);
                    } else if (type === 'bunny') {
                        this.adoptPet('bunny', 'default', '團團 (Mochi)', price);
                    } else if (type === 'lion') {
                        this.adoptPet('lion', 'default', '辛巴 (Simba)', price);
                    } else if (type === 'panda') {
                        this.adoptPet('panda', 'default', '滾滾 (GunGun)', price);
                    } else if (type === 'fennec') {
                        this.adoptPet('fennec', 'default', '沙沙 (Sands)', price);
                    } else if (type === 'giraffe') {
                        this.adoptPet('giraffe', 'default', '喬治 (George)', price);
                    } else if (type === 'polar_bear') {
                        this.adoptPet('polar_bear', 'default', '白雪 (Shiro)', price);
                    } else if (type === 'hamster') {
                        this.adoptPet('hamster', 'default', '哈姆 (Hamu)', price);
                    } else if (type === 'hedgehog') {
                        this.adoptPet('hedgehog', 'default', '刺刺 (Toge)', price);
                    } else if (type === 'dolphin') {
                        this.adoptPet('dolphin', 'default', '藍藍 (Aqua)', price);
                    } else if (type === 'tiger') {
                        this.adoptPet('tiger', 'default', '琥珀 (Kohaku)', price);
                    } else if (type === 'condor') {
                        this.adoptPet('condor', 'default', '安地斯 (Andes)', price);
                    }
                });
            });

            return;
        }

        // 裝扮與場景分頁
        const accessories = [
            { id: 'red_collar', type: 'collar', name: '3D 經典紅色幼犬項圈', icon: '🔴', price: 0, desc: '帥氣經典款' },
            { id: 'gold_bell', type: 'collar', name: '3D 叮噹金鈴鐺', icon: '🔔', price: 45, desc: '走路叮噹作響' },
            { id: 'bandana', type: 'collar', name: '3D 萌萌紅領巾', icon: '🧣', price: 60, desc: '探險家必備' },
            { id: 'sunglasses', type: 'glasses', name: '3D 酷炫小墨鏡', icon: '🕶️', price: 80, desc: '全街最帥萌寵' },
            { id: 'party_hat', type: 'hat', name: '3D 慶生派對帽', icon: '🥳', price: 50, desc: '滿月派對必備' },
            { id: 'wizard_hat', type: 'hat', name: '3D 星空魔法帽', icon: '🧙‍♂️', price: 95, desc: '神秘小法師' },
            { id: 'crown_gold', type: 'hat', name: '3D 璀璨黃金皇冠', icon: '👑', price: 150, desc: '鑲嵌紅藍寶石的王者皇冠' },
            { id: 'hero_cape', type: 'cape', name: '3D 小超狗披風', icon: '🦸‍♂️', price: 120, desc: '守護小英雄' },
            { id: 'angel_wings', type: 'cape', name: '3D 純白小天使羽翼', icon: '🪽', price: 160, desc: '會輕盈拍動的聖潔雙翼' }
        ];

        const rooms = [
            { id: 'theme_room', type: 'theme', themeKey: 'room', name: '3D 溫馨客廳', icon: '🛋️', price: 0, desc: '舒適木地板' },
            { id: 'theme_garden', type: 'theme', themeKey: 'garden', name: '3D 陽光草地庭院', icon: '🌳', price: 70, desc: '奔跑玩耍的好地方' },
            { id: 'theme_sunset', type: 'theme', themeKey: 'sunset', name: '3D 黃昏暖色場景', icon: '🌅', price: 100, desc: '浪漫夕陽光影' },
            { id: 'theme_snow', type: 'theme', themeKey: 'snow', name: '3D 極光冰雪奇境', icon: '❄️', price: 130, desc: '冰晶雪地與極光光影' },
            { id: 'theme_sakura', type: 'theme', themeKey: 'sakura', name: '3D 粉櫻花瓣春日庭院', icon: '🌸', price: 140, desc: '浪漫櫻花粉色春光' }
        ];

        const list = (tab === 'accessories') ? accessories : rooms;

        const grid = document.createElement('div');
        grid.className = 'shop-grid';

        list.forEach(item => {
            const isOwned = this.inventory.includes(item.id);
            const isEquipped = (item.type === 'theme') 
                ? (this.currentTheme === item.themeKey) 
                : (this.currentPet.equipped[item.type] === item.id);

            const card = document.createElement('div');
            card.className = `shop-item-card ${isEquipped ? 'equipped' : ''}`;

            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-title">${item.name}</div>
                <div class="shop-item-price">${isOwned ? '已擁有' : `🪙 ${item.price}`}</div>
                <button class="shop-action-btn ${isOwned ? (isEquipped ? 'unequip-btn' : 'equip-btn') : 'buy-btn'}" data-id="${item.id}">
                    ${isOwned ? (isEquipped ? '已穿戴' : '使用') : '購買'}
                </button>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);

        container.querySelectorAll('.shop-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.id;
                const item = [...accessories, ...rooms].find(x => x.id === itemId);
                if (!item) return;

                if (!this.inventory.includes(itemId)) {
                    if (this.coins < item.price) {
                        this.showToast('🪙 金幣不足喔！快去玩小遊戲吧！');
                        return;
                    }
                    this.coins -= item.price;
                    this.inventory.push(itemId);
                    window.soundCtrl.playCoin();
                    this.showToast(`🛍️ 成功購買【${item.name}】！`);
                } else {
                    if (item.type === 'theme') {
                        this.applyTheme(item.themeKey);
                        this.showToast(`🏡 3D 場景已切換為【${item.name}】！`);
                    } else {
                        if (this.currentPet.equipped[item.type] === itemId) {
                            this.currentPet.equipped[item.type] = null;
                        } else {
                            this.currentPet.equipped[item.type] = itemId;
                        }
                        if (this.dogActor) {
                            this.dogActor.updateAccessories(this.currentPet.equipped);
                        }
                        window.soundCtrl.playClick();
                    }
                }
                this.saveGame();
                this.updateUI();
                this.renderShop(tab);
            });
        });
    }

    applyTheme(themeKey) {
        this.currentTheme = themeKey;
        document.body.className = `theme-${themeKey}`;
        if (this.scene3d) {
            this.scene3d.setTheme(themeKey);
        }
    }

    renderDiary() {
        document.getElementById('total-feed-val').textContent = this.records.feedsCount;
        document.getElementById('total-play-val').textContent = this.records.gamesPlayed;
        document.getElementById('total-days-val').textContent = Math.max(1, Math.floor((Date.now() - this.records.startTime) / 86400000) + 1);

        const list = document.getElementById('achievements-list');
        list.innerHTML = '';

        const achieves = [
            { icon: '🍼', title: '第一瓶配方奶', cond: this.records.feedsCount >= 1, desc: '第一次餵食小萌寵喝奶' },
            { icon: '🐾', title: '多寵物家庭', cond: this.adoptedPets.length >= 2, desc: '領養 2 隻以上的 3D 萌寵' },
            { icon: '🥏', title: '草地探險家', cond: this.records.gamesPlayed >= 3, desc: '完成 3 場接飛盤或猜碗遊戲' },
            { icon: '🎓', title: '聰明小毛球', cond: this.currentPet.level >= 5, desc: '達到等級 Lv.5 並長大為少年期' },
            { icon: '✨', title: '香噴噴萌寵', cond: this.records.bathCount >= 5, desc: '為寵物洗澡累積 5 次' }
        ];

        achieves.forEach(a => {
            const div = document.createElement('div');
            div.className = `achieve-item ${a.cond ? 'unlocked' : ''}`;
            div.innerHTML = `
                <span class="achieve-icon">${a.icon}</span>
                <div class="achieve-info">
                    <h4>${a.title} ${a.cond ? '✅ (已達成)' : '🔒'}</h4>
                    <p style="font-size:0.8rem; color:#64748b;">${a.desc}</p>
                </div>
            `;
            list.appendChild(div);
        });
    }

    spawnScreenHearts(x, y) {
        const layer = document.getElementById('fx-layer');
        for (let i = 0; i < 4; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = '❤️';
            heart.style.left = `${x + (Math.random() - 0.5) * 60}px`;
            heart.style.top = `${y + (Math.random() - 0.5) * 40}px`;
            heart.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
            layer.appendChild(heart);

            setTimeout(() => heart.remove(), 1200);
        }
    }

    showToast(msg) {
        let toast = document.querySelector('.game-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'game-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
    }

    openModal(id) {
        this.closeAllDrawers();
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('hidden');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    }

    toggleDrawer(id) {
        const drawer = document.getElementById(id);
        if (drawer.classList.contains('hidden')) {
            this.closeAllDrawers();
            drawer.classList.remove('hidden');
        } else {
            drawer.classList.add('hidden');
        }
    }

    closeAllDrawers() {
        document.querySelectorAll('.floating-drawer').forEach(d => d.classList.add('hidden'));
    }

    getSavePayload() {
        return {
            version: 5,
            timestamp: Date.now(),
            adoptedPets: this.adoptedPets,
            currentPetId: this.currentPetId,
            coins: this.coins,
            stats: this.stats,
            skills: this.skills,
            records: this.records,
            inventory: this.inventory,
            currentTheme: this.currentTheme
        };
    }

    saveGame(targetSlot = null) {
        const slot = targetSlot || this.currentSaveSlot || 'pet_save_slot_1';
        const data = this.getSavePayload();
        try {
            const jsonStr = JSON.stringify(data);
            localStorage.setItem(slot, jsonStr);
            // 同步寫入自動存檔槽與當前活動槽標記
            localStorage.setItem('pet_save_auto', jsonStr);
            localStorage.setItem('pet_active_slot', slot);
            this.currentSaveSlot = slot;
        } catch (e) {
            console.warn('存檔失敗:', e);
        }
    }

    loadGame(targetSlot = null) {
        // 優先順序：指定槽位 -> 當前使用槽位 -> localStorage('pet_active_slot') -> slot_1
        const slot = targetSlot || this.currentSaveSlot || localStorage.getItem('pet_active_slot') || 'pet_save_slot_1';
        try {
            let raw = localStorage.getItem(slot);

            // 首次進入新存檔系統遷移支援：若無任何 slot 存檔，但有舊版存檔，將舊版轉為 slot_2 備份，slot_1 重設為純小黑
            if (!raw && !localStorage.getItem('pet_save_slot_1') && !localStorage.getItem('pet_save_slot_2')) {
                const oldSave = localStorage.getItem('multi_pet_save_v4') || localStorage.getItem('multi_pet_save_v3');
                if (oldSave) {
                    try {
                        localStorage.setItem('pet_save_slot_2', oldSave);
                    } catch (_) {}
                }
            }

            if (!raw) {
                // 若指定槽位沒有資料，嘗試讀取 auto 槽
                raw = localStorage.getItem('pet_save_auto');
            }

            if (raw) {
                const data = JSON.parse(raw);
                if (data.adoptedPets && Array.isArray(data.adoptedPets) && data.adoptedPets.length > 0) {
                    // 徹底過濾移除貓咪
                    this.adoptedPets = data.adoptedPets.filter(p => p.type !== 'cat');
                    if (this.adoptedPets.length === 0) {
                        this.adoptedPets = JSON.parse(JSON.stringify(this.defaultInitialPets));
                    }
                    if (data.currentPetId && this.adoptedPets.some(p => p.id === data.currentPetId)) {
                        this.currentPetId = data.currentPetId;
                    } else {
                        this.currentPetId = this.adoptedPets[0].id;
                    }
                } else {
                    this.adoptedPets = JSON.parse(JSON.stringify(this.defaultInitialPets));
                    this.currentPetId = 'pet_black_dog';
                }

                if (data.coins !== undefined) this.coins = data.coins;
                if (data.stats) this.stats = data.stats;
                if (data.skills) this.skills = Object.assign(this.skills, data.skills);
                if (data.records) this.records = Object.assign(this.records, data.records);
                if (data.inventory) this.inventory = Object.assign(this.inventory, data.inventory);
                if (data.currentTheme) this.currentTheme = data.currentTheme;

                this.currentSaveSlot = slot;
                localStorage.setItem('pet_active_slot', slot);
            } else {
                // 全新狀態：僅有小黑
                this.adoptedPets = JSON.parse(JSON.stringify(this.defaultInitialPets));
                this.currentPetId = 'pet_black_dog';
                this.coins = 200;
                this.currentSaveSlot = slot;
                this.saveGame(slot);
            }
        } catch (e) {
            console.warn('讀取存檔失敗，使用初始設定 (僅小黑):', e);
            this.adoptedPets = JSON.parse(JSON.stringify(this.defaultInitialPets));
            this.currentPetId = 'pet_black_dog';
        }
    }

    getPetEmoji(type, variant = 'default') {
        switch (type) {
            case 'dog': return '🐶';
            case 'bat': return '🦇';
            case 'wolf': return '🐺';
            case 'hyena': return '🦴';
            case 'cheetah': return '🐆';
            case 'crow': return '🪶';
            case 'maned_wolf': return '🌾';
            case 'elephant': return '🐘';
            case 'harpy': return '🦅';
            case 'orca': return '🐋';
            case 'gibbon': return '🐒';
            case 'capybara': return '🍊';
            case 'red_panda': return '🎋';
            case 'snow_leopard': return '❄️';
            case 'penguin': return '🐧';
            case 'sea_otter': return '🦦';
            case 'koala': return '🐨';
            case 'bunny': return '🐰';
            case 'lion': return '🦁';
            case 'panda': return '🐼';
            case 'fennec': return '🏜️';
            case 'giraffe': return '🦒';
            case 'polar_bear': return '🐻‍❄️';
            case 'hamster': return '🐹';
            case 'hedgehog': return '🦔';
            case 'dolphin': return '🐬';
            case 'tiger': return '🐯';
            case 'condor': return '🏔️';
            case 'fox':
                if (variant === 'white') return '🤍';
                if (variant === 'silver') return '🖤';
                return '🦊';
            default: return '🐾';
        }
    }

    renderSaveSlots() {
        const container = document.getElementById('save-slots-container');
        if (!container) return;

        const slots = [
            { key: 'pet_save_slot_1', name: '進度槽位 1 (Slot 1)' },
            { key: 'pet_save_slot_2', name: '進度槽位 2 (Slot 2)' },
            { key: 'pet_save_slot_3', name: '進度槽位 3 (Slot 3)' },
            { key: 'pet_save_auto', name: '自動備份 (Auto Save)' }
        ];

        const activeSlotKey = this.currentSaveSlot || localStorage.getItem('pet_active_slot') || 'pet_save_slot_1';

        let html = '';
        slots.forEach(slot => {
            const raw = localStorage.getItem(slot.key);
            const isActive = (slot.key === activeSlotKey);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    const timeStr = data.timestamp ? new Date(data.timestamp).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '已保存';
                    const coins = (data.coins !== undefined) ? data.coins : 0;
                    const pets = Array.isArray(data.adoptedPets) ? data.adoptedPets : [];

                    let petPills = '';
                    pets.forEach(p => {
                        const emoji = this.getPetEmoji(p.type, p.variant);
                        const isCur = (p.id === data.currentPetId);
                        petPills += `
                            <span class="save-pet-pill ${isCur ? 'active-pet' : ''}" title="${p.name} - 等級 Lv.${p.level || 1}">
                                <span>${emoji}</span>
                                <span class="save-pet-name">${p.name}</span>
                                <span class="save-pet-level">Lv.${p.level || 1}</span>
                            </span>
                        `;
                    });

                    html += `
                        <div class="save-slot-card ${isActive ? 'active-slot' : ''}">
                            <div class="slot-card-header">
                                <div class="slot-title-group">
                                    <span class="save-slot-badge">${slot.name}</span>
                                    ${isActive ? '<span class="slot-current-tag">🌟 當前使用中</span>' : ''}
                                </div>
                                <span class="slot-time-text">⏱️ ${timeStr}</span>
                            </div>
                            <div class="slot-card-body">
                                <div class="slot-stat-row">
                                    <span class="slot-coin-label">🪙 金幣儲備:</span>
                                    <span class="slot-coin-val">${coins.toLocaleString()}</span>
                                </div>
                                <div class="slot-pets-header">
                                    🐾 已解鎖角色 (${pets.length} 隻):
                                </div>
                                <div class="save-pet-pills-wrap">
                                    ${petPills || '<span class="empty-hint">無寵物資料</span>'}
                                </div>
                            </div>
                            <div class="slot-card-actions">
                                <button class="btn-slot-load" onclick="window.game.loadSaveSlot('${slot.key}')">
                                    📂 進入此進度
                                </button>
                                <button class="btn-slot-save" onclick="window.game.saveToSlot('${slot.key}')">
                                    💾 保存當前進度至此槽
                                </button>
                                ${slot.key !== 'pet_save_auto' ? `<button class="btn-slot-del" onclick="window.game.deleteSaveSlot('${slot.key}')" title="清空此槽存檔">🗑️</button>` : ''}
                            </div>
                        </div>
                    `;
                } catch (e) {
                    html += `
                        <div class="save-slot-card empty-slot">
                            <div class="slot-card-header">
                                <span class="save-slot-badge">${slot.name}</span>
                                <span class="slot-time-text">存檔損壞</span>
                            </div>
                            <div class="slot-card-body">
                                <p class="empty-desc">存檔讀取異常</p>
                            </div>
                            <div class="slot-card-actions">
                                <button class="btn-slot-save" onclick="window.game.saveToSlot('${slot.key}')">💾 覆蓋為當前進度</button>
                            </div>
                        </div>
                    `;
                }
            } else {
                html += `
                    <div class="save-slot-card empty-slot">
                        <div class="slot-card-header">
                            <span class="save-slot-badge">${slot.name}</span>
                            <span class="slot-time-text">空白槽位</span>
                        </div>
                        <div class="slot-card-body">
                            <p class="empty-desc">🌱 尚無存檔記錄，點擊右方可保存當前進度至此槽位</p>
                        </div>
                        <div class="slot-card-actions">
                            <button class="btn-slot-save" onclick="window.game.saveToSlot('${slot.key}')">
                                💾 保存當前進度至此槽
                            </button>
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    }

    loadSaveSlot(slotKey) {
        this.currentSaveSlot = slotKey;
        this.loadGame(slotKey);
        this.switchPet(this.currentPetId, false);
        this.updateUI();
        this.closeAllModals();
        window.soundCtrl.playClick();
        window.soundCtrl.playVoice(this.currentPetType, 'happy');
        this.showToast(`📂 已成功載入存檔進度！當前夥伴：【${this.currentPet.name}】`);
    }

    saveToSlot(slotKey) {
        this.saveGame(slotKey);
        this.renderSaveSlots();
        window.soundCtrl.playClick();
        this.showToast(`💾 當前冒險進度已成功儲存至槽位！`);
    }

    deleteSaveSlot(slotKey) {
        if (!confirm('確定要清空這個存檔槽位嗎？此操作無法復原。')) return;
        localStorage.removeItem(slotKey);
        this.renderSaveSlots();
        window.soundCtrl.playClick();
        this.showToast('🗑️ 已清空該存檔槽位！');
    }

    resetNewGame() {
        if (!confirm('確定要全新開始遊戲嗎？\n進度將重置為【僅剩小黑 (Lv.1)】，金幣 200，重新開啟冒險！')) return;
        this.adoptedPets = JSON.parse(JSON.stringify(this.defaultInitialPets));
        this.currentPetId = 'pet_black_dog';
        this.coins = 200;
        this.stats = { hunger: 85, mood: 90, energy: 80, clean: 95 };
        this.skills = {
            sit: { name: '乖乖坐好 (Sit)', icon: '🪑', level: 1, maxLevel: 5, unlocked: true, desc: '學會乖乖收起後腿端坐' },
            paw: { name: '搭搭小肉爪 (Paw)', icon: '🐾', level: 0, maxLevel: 5, unlocked: false, reqLv: 2, desc: '伸出軟軟的小爪碰碰你的手' },
            spin: { name: '追小尾巴 (Spin)', icon: '💫', level: 0, maxLevel: 5, unlocked: false, reqLv: 3, desc: '追著自己可愛的小尾巴原地轉圈' },
            bark: { name: '打招呼汪汪叫 (Bark)', icon: '📢', level: 0, maxLevel: 5, unlocked: false, reqLv: 4, desc: '昂首發出清脆充滿精神的開心叫聲' },
            jump: { name: '立耳原地跳耀 (Jump)', icon: '🦘', level: 0, maxLevel: 5, unlocked: false, reqLv: 5, desc: '興奮地跳得高高的，展示健壯活力' },
            roll: { name: '翻肚皮討摸摸 (Roll)', icon: '🥐', level: 0, maxLevel: 5, unlocked: false, reqLv: 6, desc: '整隻翻肚肚在地上扭動撒嬌' }
        };
        this.records = { days: 1, totalFeed: 0, totalPet: 0, totalBath: 0, totalTrain: 0, totalFrisbee: 0, totalCoinsEarned: 0 };
        this.inventory = {
            hat_straw: false,
            hat_party: false,
            glasses_cool: false,
            glasses_heart: false,
            cape_red: false,
            cape_blue: false,
            collar_gold: false
        };
        this.saveGame(this.currentSaveSlot);
        this.switchPet(this.currentPetId, false);
        this.updateUI();
        this.closeAllModals();
        window.soundCtrl.playVoice('dog', 'happy');
        this.showToast('✨ 已重置全新遊戲！身邊只有小黑陪伴～');
    }

    exportSaveFile() {
        const payload = this.getSavePayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
        a.href = url;
        a.download = `萌寵成長日記存檔備份_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.soundCtrl.playClick();
        this.showToast('📤 存檔備份已成功下載！可隨時匯入恢復進度。');
    }

    importSaveFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.adoptedPets && Array.isArray(data.adoptedPets)) {
                    localStorage.setItem(this.currentSaveSlot, JSON.stringify(data));
                    this.loadGame(this.currentSaveSlot);
                    this.switchPet(this.currentPetId, false);
                    this.updateUI();
                    this.renderSaveSlots();
                    window.soundCtrl.playClick();
                    window.soundCtrl.playVoice(this.currentPetType, 'happy');
                    this.showToast('📥 存檔已成功匯入並立即載入！');
                } else {
                    alert('存檔檔案格式不相符！');
                }
            } catch (err) {
                alert('讀取存檔檔案失敗: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    resetGame() {
        this.resetNewGame();
    }
}

// 啟動 3D 多寵物遊戲
window.addEventListener('DOMContentLoaded', () => {
    window.game = new BlackDogGame();
});
