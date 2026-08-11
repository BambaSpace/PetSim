import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, CartesianGrid } from 'recharts';
import html2canvas from 'html2canvas';

// URL(Base64暗号化)とLocalStorageを同期するカスタムフック
function useUrlSyncedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        try {
           const decoded = decodeURIComponent(atob(urlValue));
           return JSON.parse(decoded);
        } catch (e) {
           return JSON.parse(decodeURIComponent(urlValue));
        }
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // 外部からの更新（別コンポーネントからのURLやStorage変更）を検知する
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlValue = searchParams.get(key);
        if (urlValue !== null) {
          try {
            setStoredValue(JSON.parse(decodeURIComponent(atob(urlValue))));
            return;
          } catch (e) {
            setStoredValue(JSON.parse(decodeURIComponent(urlValue)));
            return;
          }
        }
        const item = window.localStorage.getItem(key);
        if (item) setStoredValue(JSON.parse(item));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    // カスタムイベント用の検知
    window.addEventListener('quizResult', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('quizResult', handleStorageChange);
    };
  }, [key]);


  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));

      const searchParams = new URLSearchParams(window.location.search);
      // JSON文字化 -> URIエンコード -> Base64エンコード (難読化)
      const encodedValue = btoa(encodeURIComponent(JSON.stringify(value)));
      searchParams.set(key, encodedValue);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  };

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (!searchParams.has(key)) {
        const encodedValue = btoa(encodeURIComponent(JSON.stringify(storedValue)));
        searchParams.set(key, encodedValue);
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (error) {
       console.error(`Error initializing URL for ${key}:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

type DiseaseRisk = {
  name: string;
  probability: number; // 発症確率 (0~1)
  cost: number; // 生涯での概算治療費
};

type DogBreed = {
  id: string;
  name: string;
  price: number;
  lifespan: number;
  monthlyFood: number;
  trimmingCost: number;
  description: string;
  size: '小型犬' | '中型犬' | '大型犬' | 'カスタム';
  tags: string[];
  weight: string; // 体重の目安
  walkingTime: string; // 必要な散歩時間
  diseases: DiseaseRisk[]; // かかりやすい病気とリスク
  tips: string[]; // 節約・飼育Tips
};

const DOG_BREEDS: DogBreed[] = [
  // --- カスタム ---
  {
    id: 'custom-mix',
    name: 'ミックス犬 / 保護犬 / その他',
    price: 0, // カスタムモード時はUIで変更可能にする
    lifespan: 14,
    monthlyFood: 5000,
    trimmingCost: 0,
    description: '雑種や保護犬など、リストにないワンちゃん用のカスタム設定です。',
    size: 'カスタム',
    tags: ['ミックス', '保護犬'],
    weight: '自由入力',
    walkingTime: '体格に合わせる',
    diseases: [],
    tips: ['一般的にミックス犬は遺伝的疾患が少ない傾向にありますが、毎年の健康診断は欠かさずに受けましょう。']
  },
  // --- 小型犬 ---
  {
    id: 'maltese',
    diseases: [ { name: "流涙症（涙やけ）", probability: 0.6, cost: 50000 }, { name: "僧帽弁閉鎖不全症", probability: 0.3, cost: 400000 } ],
    tips: ['自宅でのこまめなブラッシングと涙やけケアで、トリミング費用や皮膚炎の治療費を節約できます。'],
    name: 'マルチーズ',
    price: 350000,
    lifespan: 14,
    monthlyFood: 4000,
    trimmingCost: 7000,
    description: '純白の被毛が美しい。甘えん坊で大人しいが、毎日の被毛ケアが欠かせない。',
    size: '小型犬',
    tags: ['一人暮らし向け', '甘えん坊', '抜け毛少ない'],
    weight: '2〜3kg',
    walkingTime: '1日20分程度'
  },
  {
    id: 'shih-tzu',
    diseases: [ { name: "外耳炎", probability: 0.7, cost: 80000 }, { name: "角膜炎", probability: 0.5, cost: 60000 } ],
    tips: ['耳掃除を定期的に行い、外耳炎を予防しましょう。自宅シャンプーを覚えれば美容代が浮きます。'],
    name: 'シーズー',
    price: 250000,
    lifespan: 14,
    monthlyFood: 5000,
    trimmingCost: 6000,
    description: '穏やかで愛情深い。運動量が少なめで飼いやすいが、暑さに弱い。',
    size: '小型犬',
    tags: ['初心者向け', '運動量少なめ'],
    weight: '4〜8kg',
    walkingTime: '1日30分程度'
  },
  {
    id: 'pug',
    diseases: [ { name: "短頭種気道症候群", probability: 0.4, cost: 300000 }, { name: "皮膚炎", probability: 0.6, cost: 100000 } ],
    tips: ['夏場のエアコン代は必須ですが、サーキュレーターを併用することで電気代を少し節約できます。'],
    name: 'パグ',
    price: 300000,
    lifespan: 13,
    monthlyFood: 6000,
    trimmingCost: 0,
    description: '愛嬌のある鼻ペチャ。非常に人懐っこいが、皮膚炎や熱中症に注意。',
    size: '小型犬',
    tags: ['ファミリー向け', '抜け毛多い'],
    weight: '6〜8kg',
    walkingTime: '1日30分程度'
  },
  {
    id: 'schnauzer',
    diseases: [ { name: "尿路結石症", probability: 0.3, cost: 150000 }, { name: "白内障", probability: 0.25, cost: 300000 } ],
    tips: ['水分をしっかり摂らせることで尿路結石のリスクを下げられます。療法食になると食費が上がります。'],
    name: 'ミニチュア・シュナウザー',
    price: 350000,
    lifespan: 13,
    monthlyFood: 6000,
    trimmingCost: 8000,
    description: 'おじいさんのような眉とヒゲ。賢く勇敢で抜け毛が非常に少ない。',
    size: '小型犬',
    tags: ['抜け毛少ない', '賢い', '活発'],
    weight: '4〜8kg',
    walkingTime: '1日40分程度'
  },
  {
    id: 'toy-poodle',
    diseases: [ { name: "膝蓋骨脱臼（パテラ）", probability: 0.4, cost: 250000 }, { name: "外耳炎", probability: 0.5, cost: 60000 } ],
    tips: ['床に滑り止めマットを敷くことで、パテラ（膝の脱臼）の予防になり、将来の高額な手術費を防げます。'],
    name: 'トイプードル',
    price: 400000,
    lifespan: 15,
    monthlyFood: 5000,
    trimmingCost: 8000,
    description: '賢くしつけやすい。抜け毛が少なく室内飼いに最適。毎月のトリミング必須。',
    size: '小型犬',
    tags: ['一人暮らし向け', '抜け毛少ない', '初心者向け'],
    weight: '3〜4kg',
    walkingTime: '1日30分程度'
  },
  {
    id: 'chihuahua',
    diseases: [ { name: "水頭症", probability: 0.1, cost: 500000 }, { name: "膝蓋骨脱臼（パテラ）", probability: 0.4, cost: 250000 } ],
    tips: ['段差からの飛び降りを防ぐ環境づくりが最大の節約に。服は買いすぎず、お下がりやフリマも活用しましょう。'],
    name: 'チワワ',
    price: 300000,
    lifespan: 14,
    monthlyFood: 4000,
    trimmingCost: 3000,
    description: '超小型で省スペース。活発だが運動量は少なめで済む。寒さに弱い。',
    size: '小型犬',
    tags: ['一人暮らし向け', '運動量少なめ'],
    weight: '1.5〜3kg',
    walkingTime: '1日20分程度'
  },
  {
    id: 'dachshund',
    diseases: [ { name: "椎間板ヘルニア", probability: 0.25, cost: 400000 }, { name: "歯周病", probability: 0.7, cost: 50000 } ],
    tips: ['肥満防止と段差をなくすことでヘルニアを予防。ヘルニアの手術は非常に高額です。毎日の歯磨きも必須！'],
    name: 'ミニチュアダックスフンド',
    price: 300000,
    lifespan: 14,
    monthlyFood: 5500,
    trimmingCost: 5000,
    description: '胴長短足が愛らしい。猟犬気質で活発。腰の負担に注意が必要。',
    size: '小型犬',
    tags: ['ファミリー向け', '活発'],
    weight: '4〜5kg',
    walkingTime: '1日30〜40分'
  },
  {
    id: 'pomeranian',
    diseases: [ { name: "気管虚脱", probability: 0.3, cost: 150000 }, { name: "骨折", probability: 0.2, cost: 200000 } ],
    tips: ['首輪ではなくハーネスを使うことで気管への負担を減らせます。骨が細いので抱っこからの落下に要注意。'],
    name: 'ポメラニアン',
    price: 350000,
    lifespan: 13,
    monthlyFood: 4500,
    trimmingCost: 7000,
    description: 'ふわふわの被毛が特徴。活発で好奇心旺盛。骨折などのケガに注意。',
    size: '小型犬',
    tags: ['抜け毛多い', '活発'],
    weight: '2〜3kg',
    walkingTime: '1日30分程度'
  },
  {
    id: 'papillon',
    diseases: [ { name: "膝蓋骨脱臼（パテラ）", probability: 0.3, cost: 250000 }, { name: "進行性網膜萎縮症", probability: 0.1, cost: 100000 } ],
    tips: ['運動能力が高い分、足腰に負担がかかることも。適正体重を維持することが病気予防の近道です。'],
    name: 'パピヨン',
    price: 250000,
    lifespan: 15,
    monthlyFood: 6000,
    trimmingCost: 5000,
    description: '蝶のような耳が特徴。非常に賢く運動能力が高い。',
    size: '小型犬',
    tags: ['一人暮らし向け', '賢い'],
    weight: '4〜5kg',
    walkingTime: '1日40分程度'
  },
  {
    id: 'yorkie',
    diseases: [ { name: "気管虚脱", probability: 0.3, cost: 150000 }, { name: "低血糖症（幼犬期）", probability: 0.2, cost: 30000 } ],
    tips: ['長毛を維持するとトリミング代がかさむため、お手入れしやすいショートカット（パピーカット）が人気です。'],
    name: 'ヨークシャーテリア',
    price: 300000,
    lifespan: 14,
    monthlyFood: 4000,
    trimmingCost: 7000,
    description: '美しい被毛の「動く宝石」。負けん気が強く活発。定期的なカットが必要。',
    size: '小型犬',
    tags: ['抜け毛少ない', '活発'],
    weight: '2〜3kg',
    walkingTime: '1日30分程度'
  },
  {
    id: 'cavalier',
    name: 'キャバリア・キング・チャールズ・スパニエル',
    diseases: [ { name: "僧帽弁閉鎖不全症", probability: 0.8, cost: 500000 }, { name: "外耳炎", probability: 0.5, cost: 60000 } ],
    tips: ['心臓病（僧帽弁閉鎖不全症）の遺伝的リスクが非常に高いため、ペット保険の加入は必須レベルです。'],
    price: 300000,
    lifespan: 11,
    monthlyFood: 6000,
    trimmingCost: 6000,
    description: '大きな垂れ耳と優しい性格が魅力。争いを好まない癒し系ですが、心臓疾患には要注意。',
    size: '小型犬',
    tags: ['ファミリー向け', '穏やか', '抜け毛多い'],
    weight: '6〜8kg',
    walkingTime: '1日40分程度'
  },
  {
    id: 'bichon',
    name: 'ビション・フリーゼ',
    diseases: [ { name: "皮膚炎", probability: 0.4, cost: 100000 }, { name: "尿石症", probability: 0.2, cost: 150000 } ],
    tips: ['真っ白なアフロヘアを維持するには毎月のトリミングが必須。美容代は高めに見積もっておきましょう。'],
    price: 400000,
    lifespan: 14,
    monthlyFood: 5000,
    trimmingCost: 9000,
    description: '綿あめのようなボリュームのある被毛。陽気で人なつっこく、抜け毛や体臭が少ない。',
    size: '小型犬',
    tags: ['抜け毛少ない', '活発'],
    weight: '5〜7kg',
    walkingTime: '1日30分程度'
  },
  {
    id: 'jack-russell',
    name: 'ジャック・ラッセル・テリア',
    diseases: [ { name: "膝蓋骨脱臼（パテラ）", probability: 0.3, cost: 250000 }, { name: "白内障", probability: 0.2, cost: 200000 } ],
    tips: ['小型犬ですが大型犬並みの運動量が必要です。十分な散歩でストレスを減らすことが問題行動や病気の予防に繋がります。'],
    price: 250000,
    lifespan: 14,
    monthlyFood: 6000,
    trimmingCost: 0, // スムース〜ラフまで毛種によるが平均して安価
    description: '無尽蔵のスタミナを持つ小型のアスリート。非常に賢いが、しつけと十分な運動が不可欠。',
    size: '小型犬',
    tags: ['運動量非常に多い', '活発', '上級者向け'],
    weight: '5〜6kg',
    walkingTime: '1日1時間以上'
  },
  {
    id: 'pekingese',
    name: 'ペキニーズ',
    diseases: [ { name: "椎間板ヘルニア", probability: 0.3, cost: 400000 }, { name: "短頭種気道症候群", probability: 0.4, cost: 200000 } ],
    tips: ['ヘルニア予防のため、抱っこの仕方や段差に注意。夏場は24時間エアコン稼働が必須なので電気代がかかります。'],
    price: 300000,
    lifespan: 13,
    monthlyFood: 5000,
    trimmingCost: 6000,
    description: '獅子のようなたてがみを持つマイペースな犬種。運動量は少なめでよいが、暑さに非常に弱い。',
    size: '小型犬',
    tags: ['運動量少なめ', 'マイペース', '抜け毛多い'],
    weight: '4〜5kg',
    walkingTime: '1日20分程度'
  },
  {
    id: 'min-pin',
    name: 'ミニチュア・ピンシャー',
    diseases: [ { name: "レッグ・ペルテス病", probability: 0.15, cost: 300000 }, { name: "皮膚疾患（脱毛症等）", probability: 0.2, cost: 80000 } ],
    tips: ['短毛でお手入れは楽ですが、極端に寒さに弱いため、冬場の暖房費や防寒着のコストがかかります。'],
    price: 250000,
    lifespan: 14,
    monthlyFood: 4000,
    trimmingCost: 0,
    description: 'ドーベルマンの小型版のような精悍な姿。好奇心旺盛で活発だが、寒さに弱く骨が細い。',
    size: '小型犬',
    tags: ['抜け毛少ない', '活発'],
    weight: '4〜5kg',
    walkingTime: '1日40分程度'
  },

  // --- 中型犬 ---
  {
    id: 'beagle',
    diseases: [ { name: "外耳炎", probability: 0.6, cost: 80000 }, { name: "肥満による関節炎", probability: 0.4, cost: 100000 } ],
    tips: ['食欲旺盛なので肥満に注意。ご飯の計量を徹底し、おやつのあげすぎを防ぐのが一番の節約になります。'],
    name: 'ビーグル',
    price: 250000,
    lifespan: 13,
    monthlyFood: 9000,
    trimmingCost: 0,
    description: 'スヌーピーのモデル。底抜けに明るいが、声が大きく食欲旺盛。',
    size: '中型犬',
    tags: ['ファミリー向け', '活発', '食いしん坊'],
    weight: '9〜11kg',
    walkingTime: '1日1時間程度'
  },
  {
    id: 'border-collie',
    diseases: [ { name: "股関節形成不全", probability: 0.15, cost: 400000 }, { name: "コリー眼異常", probability: 0.1, cost: 100000 } ],
    tips: ['運動量が多いため、ドッグラン付きの公園の近くに住むなど、環境選びがコストに影響します。'],
    name: 'ボーダーコリー',
    price: 350000,
    lifespan: 13,
    monthlyFood: 11000,
    trimmingCost: 5000,
    description: '全犬種で最も賢いとされる牧羊犬。膨大な運動量と頭脳ゲームが必要。',
    size: '中型犬',
    tags: ['運動量非常に多い', '賢い', '上級者向け'],
    weight: '14〜20kg',
    walkingTime: '1日2時間以上'
  },
  {
    id: 'shiba',
    diseases: [ { name: "アトピー性皮膚炎", probability: 0.4, cost: 200000 }, { name: "緑内障", probability: 0.15, cost: 300000 } ],
    tips: ['皮膚トラブルが多いため、質の良いフード選びが重要ですが、大袋でまとめ買いするとコストを抑えられます。'],
    name: '柴犬',
    price: 250000,
    lifespan: 14,
    monthlyFood: 7000,
    trimmingCost: 0,
    description: '独立心が強く番犬適性あり。換毛期の抜け毛が非常に多い。',
    size: '中型犬',
    tags: ['抜け毛多い', '運動量多い', '番犬向き'],
    weight: '9〜11kg',
    walkingTime: '1日1時間程度'
  },
  {
    id: 'corgi',
    diseases: [ { name: "椎間板ヘルニア", probability: 0.3, cost: 400000 }, { name: "変性性脊髄症（DM）", probability: 0.1, cost: 200000 } ],
    tips: ['太りやすいので体重管理が超重要。ヘルニア予防のため、抱っこの仕方（腰を支える）にも気をつけましょう。'],
    name: 'ウェルシュ・コーギー',
    price: 300000,
    lifespan: 13,
    monthlyFood: 8000,
    trimmingCost: 0,
    description: '牧牛犬としてのスタミナと賢さ。運動量がかなり必要。太りやすい体質。',
    size: '中型犬',
    tags: ['運動量多い', '抜け毛多い', 'ファミリー向け'],
    weight: '10〜14kg',
    walkingTime: '1日1時間以上'
  },
  {
    id: 'spitz',
    diseases: [ { name: "膝蓋骨脱臼（パテラ）", probability: 0.3, cost: 250000 }, { name: "流涙症", probability: 0.4, cost: 50000 } ],
    tips: ['抜け毛が非常に多いので、自宅でのこまめなブラッシングを日課にすることでトリミング代を抑えられます。'],
    name: '日本スピッツ',
    price: 300000,
    lifespan: 13,
    monthlyFood: 8000,
    trimmingCost: 7000,
    description: '真っ白で豊かな被毛。活発で遊び好き。ブラッシングが必須。',
    size: '中型犬',
    tags: ['抜け毛多い'],
    weight: '9〜11kg',
    walkingTime: '1日1時間程度'
  },
  {
    id: 'sheltie',
    diseases: [ { name: "コリー眼異常", probability: 0.2, cost: 100000 }, { name: "甲状腺機能低下症", probability: 0.15, cost: 150000 } ],
    tips: ['被毛の手入れをプロに任せると高額になります。スリッカーブラシ等でのセルフケアを習得しましょう。'],
    name: 'シェットランドシープドッグ',
    price: 350000,
    lifespan: 12,
    monthlyFood: 10000,
    trimmingCost: 8000,
    description: '牧羊犬由来の知性と体力。豊かな被毛のお手入れと運動量の確保が必要。',
    size: '中型犬',
    tags: ['運動量多い', '抜け毛多い', '賢い'],
    weight: '8〜12kg',
    walkingTime: '1日1時間以上'
  },
  {
    id: 'french-bulldog',
    diseases: [ { name: "短頭種気道症候群", probability: 0.6, cost: 300000 }, { name: "皮膚炎", probability: 0.5, cost: 150000 } ],
    tips: ['温度管理が命。夏場のエアコン代はケチらず、代わりにペット保険は補償割合の高いものを選ぶと安心です。'],
    name: 'フレンチブルドッグ',
    price: 400000,
    lifespan: 10,
    monthlyFood: 9000,
    trimmingCost: 0,
    description: '愛嬌のある顔立ち。暑さに非常に弱く、室温管理が必須。',
    size: '中型犬',
    tags: ['運動量少なめ', '室内飼い特化'],
    weight: '10〜14kg',
    walkingTime: '1日30分程度（涼しい時間帯）'
  },

  // --- 大型犬 ---
  {
    id: 'dalmatian',
    diseases: [ { name: "尿路結石（尿酸塩結石）", probability: 0.3, cost: 200000 }, { name: "難聴", probability: 0.2, cost: 50000 } ],
    tips: ['特殊な尿路結石ができやすい犬種です。飲水量を増やし、指定された療法食を守ることが一番の治療費節約です。'],
    name: 'ダルメシアン',
    price: 300000,
    lifespan: 12,
    monthlyFood: 14000,
    trimmingCost: 0,
    description: '白地に黒い斑点が特徴的。非常にスタミナがあり、長距離の運動が必要。',
    size: '大型犬',
    tags: ['運動量非常に多い', '活発'],
    weight: '23〜25kg',
    walkingTime: '1日2時間以上'
  },
  {
    id: 'doberman',
    diseases: [ { name: "拡張型心筋症", probability: 0.25, cost: 500000 }, { name: "胃拡張・捻転", probability: 0.15, cost: 300000 } ],
    tips: ['胃捻転を防ぐため、食後すぐの運動は絶対に避けましょう。また、しつけ教室代は惜しまない方が後々のためです。'],
    name: 'ドーベルマン',
    price: 350000,
    lifespan: 11,
    monthlyFood: 16000,
    trimmingCost: 0,
    description: '優美で筋肉質。飼い主に極めて忠実だが、徹底したしつけが不可欠。',
    size: '大型犬',
    tags: ['番犬向き', '賢い', '上級者向け'],
    weight: '32〜45kg',
    walkingTime: '1日1.5〜2時間'
  },
  {
    id: 'akita',
    diseases: [ { name: "股関節形成不全", probability: 0.2, cost: 400000 }, { name: "甲状腺機能低下症", probability: 0.15, cost: 150000 } ],
    tips: ['体が大きく力が強いため、首輪やリードなどの消耗品は頑丈で良質なものを長く使うのがおすすめです。'],
    name: '秋田犬',
    price: 250000,
    lifespan: 10,
    monthlyFood: 16000,
    trimmingCost: 5000,
    description: '忠犬ハチ公で知られる日本犬。家族には忠実だが警戒心が強い。',
    size: '大型犬',
    tags: ['番犬向き', '抜け毛多い', '上級者向け'],
    weight: '35〜50kg',
    walkingTime: '1日1.5時間程度'
  },
  {
    id: 'golden',
    diseases: [ { name: "悪性腫瘍（ガン）", probability: 0.4, cost: 800000 }, { name: "股関節形成不全", probability: 0.2, cost: 400000 } ],
    tips: ['ガンなどの大病にかかるリスクが高め。ペット保険は必ず入り、医療費の貯金もしっかり準備しておきましょう。'],
    name: 'ゴールデンレトリバー',
    price: 350000,
    lifespan: 11,
    monthlyFood: 15000,
    trimmingCost: 10000,
    description: '温和で人懐っこい。食費や医療費など大型犬ならではのコストがかかる。',
    size: '大型犬',
    tags: ['ファミリー向け', '運動量多い', '抜け毛多い'],
    weight: '25〜35kg',
    walkingTime: '1日1.5〜2時間'
  },
  {
    id: 'labrador',
    diseases: [ { name: "悪性腫瘍", probability: 0.3, cost: 600000 }, { name: "肥満による関節炎", probability: 0.4, cost: 150000 } ],
    tips: ['非常に食欲旺盛です。おやつをローカロリーな野菜（キャベツ等）に代えることで、健康維持と節約を両立できます。'],
    name: 'ラブラドールレトリバー',
    price: 300000,
    lifespan: 12,
    monthlyFood: 15000,
    trimmingCost: 5000,
    description: '非常に賢く従順。短毛だが抜け毛は多い。十分な運動が必須。',
    size: '大型犬',
    tags: ['ファミリー向け', '運動量多い', '賢い'],
    weight: '25〜36kg',
    walkingTime: '1日1.5〜2時間'
  },
  {
    id: 'husky',
    diseases: [ { name: "白内障", probability: 0.2, cost: 300000 }, { name: "股関節形成不全", probability: 0.15, cost: 400000 } ],
    tips: ['抜け毛の量がすさまじいため、強力な掃除機が必要です。また夏の冷房代は多めに見積もっておく必要があります。'],
    name: 'シベリアンハスキー',
    price: 350000,
    lifespan: 12,
    monthlyFood: 16000,
    trimmingCost: 0,
    description: 'オオカミのような風貌。非常に体力があり長時間の散歩が必要。暑さに弱い。',
    size: '大型犬',
    tags: ['運動量非常に多い', '抜け毛多い'],
    weight: '20〜28kg',
    walkingTime: '1日2時間以上'
  },
  {
    id: 'bernese',
    diseases: [ { name: "悪性腫瘍（組織球肉腫など）", probability: 0.5, cost: 800000 }, { name: "胃捻転", probability: 0.2, cost: 300000 } ],
    tips: ['寿命が短く、ガンにかかる確率が高い犬種です。医療費がかさむ前提で、日々の消耗品はまとめ買い等で工夫を。'],
    name: 'バーニーズマウンテンドッグ',
    price: 400000,
    lifespan: 8,
    monthlyFood: 20000,
    trimmingCost: 12000,
    description: '優しく穏やかな性格。暑さに弱く、寿命が比較的短い傾向にある。',
    size: '大型犬',
    tags: ['ファミリー向け', '抜け毛多い', 'のんびり'],
    weight: '40〜50kg',
    walkingTime: '1日1時間程度'
  }
];

const VACCINE_COST = 15000;
const INSURANCE_MONTHLY = 3000;

const SENIOR_AGE_START = 7;
const SENIOR_MEDICAL_MULTIPLIER = 1.5; // シニア期の医療費・ケア増加率

// サイズ別の予防薬（フィラリア・ノミダニ）の年間コスト目安
const PREVENTION_COST = {
  '小型犬': 25000,
  '中型犬': 35000,
  '大型犬': 45000,
};

function Simulator({ idSuffix, defaultBreedId }: { idSuffix: string, defaultBreedId: string }) {
  // useUrlSyncedStateを用いて状態を保存・復元
  const [selectedBreedId, setSelectedBreedId] = useUrlSyncedState<string>(`selectedBreedId_${idSuffix}`, defaultBreedId);
  const [hasInsurance, setHasInsurance] = useUrlSyncedState<boolean>(`hasInsurance_${idSuffix}`, true);
  const [trimmingFrequency, setTrimmingFrequency] = useUrlSyncedState<number>(`trimmingFrequency_${idSuffix}`, 12);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  const [customPrice, setCustomPrice] = useUrlSyncedState<number>(`customPrice_${idSuffix}`, 0);
  const [customLifespan, setCustomLifespan] = useUrlSyncedState<number>(`customLifespan_${idSuffix}`, 14);
  const [customSize, setCustomSize] = useUrlSyncedState<'小型犬' | '中型犬' | '大型犬'>(`customSize_${idSuffix}`, '小型犬');

  const [dogName, setDogName] = useUrlSyncedState<string>(`dogName_${idSuffix}`, '');
  const [areaScale, setAreaScale] = useUrlSyncedState<number>(`areaScale_${idSuffix}`, 1.0); // 都市部1.1, 地方1.0
  const [housingType, setHousingType] = useUrlSyncedState<string>(`housingType_${idSuffix}`, 'owned'); // owned: 持ち家, rental: 賃貸

  const [starterSetCost, setStarterSetCost] = useUrlSyncedState<number>(`starterSetCost_${idSuffix}`, 50000);
  const [snackCost, setSnackCost] = useUrlSyncedState<number>(`snackCost_${idSuffix}`, 3000);
  const [hotelCost, setHotelCost] = useUrlSyncedState<number>(`hotelCost_${idSuffix}`, 0);
  const [trainingCost, setTrainingCost] = useUrlSyncedState<number>(`trainingCost_${idSuffix}`, 0);
  const [toiletSheetCost, setToiletSheetCost] = useUrlSyncedState<number>(`toiletSheetCost_${idSuffix}`, 1500);
  const [acCost, setAcCost] = useUrlSyncedState<number>(`acCost_${idSuffix}`, 3000);
  const [hasSpayNeuter, setHasSpayNeuter] = useUrlSyncedState<boolean>(`hasSpayNeuter_${idSuffix}`, true);
  const [hasAnnualCheckup, setHasAnnualCheckup] = useUrlSyncedState<boolean>(`hasAnnualCheckup_${idSuffix}`, false);

  // 診断機能用の状態
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const resultRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLElement>(null);

  // 診断の質問データ
  const QUIZ_QUESTIONS = [
    { text: "休日の過ごし方は？", options: [{ label: "アウトドア派！外でアクティブに遊ぶ", score: 'active' }, { label: "インドア派！家でのんびり過ごす", score: 'indoor' }] },
    { text: "ブラッシングなどの毎日のお手入れは？", options: [{ label: "面倒見が良いので苦にならない", score: 'care_ok' }, { label: "なるべく手間がかからない方がいい", score: 'care_no' }] },
    { text: "お住まいの環境は？", options: [{ label: "マンション・アパート（スペース限られる）", score: 'small' }, { label: "一戸建て（お庭があったり広い）", score: 'large' }] }
  ];

  const handleQuizAnswer = (optionScore: string) => {
    const newAnswers = [...quizAnswers, optionScore];
    setQuizAnswers(newAnswers);

    if (newAnswers.length === QUIZ_QUESTIONS.length) {
      // 診断ロジック（簡易版）
      let recommendedId = 'toy-poodle'; // デフォルト

      const isIndoor = newAnswers.includes('indoor');
      const isCareNo = newAnswers.includes('care_no');
      const isSmall = newAnswers.includes('small');

      if (isIndoor && isCareNo && isSmall) recommendedId = 'chihuahua';
      else if (isIndoor && !isCareNo && isSmall) recommendedId = 'shih-tzu';
      else if (!isIndoor && !isCareNo && !isSmall) recommendedId = 'golden';
      else if (!isIndoor && isCareNo && !isSmall) recommendedId = 'shiba';
      else if (!isIndoor && isCareNo && isSmall) recommendedId = 'jack-russell';
      else if (isIndoor && !isCareNo && !isSmall) recommendedId = 'bernese';
      else if (!isIndoor && !isCareNo && isSmall) recommendedId = 'toy-poodle';

      setSelectedBreedId(recommendedId);
      setShowQuiz(false);
      setQuizAnswers([]);

      // 設定エリアへスクロール
      setTimeout(() => {
        settingsRef.current?.scrollIntoView({ behavior: 'smooth' });
        alert('あなたにピッタリの犬種が選択されました！✨');
      }, 500);
    }
  };

  const handleDownloadImage = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff7ed' });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `petsim-result-${breed.id}.png`;
      link.href = image;
      link.click();
    } catch (e) {
      console.error("画像保存に失敗しました", e);
      alert("画像の保存に失敗しました。");
    }
  };

  const breed = DOG_BREEDS.find((b) => b.id === selectedBreedId) || DOG_BREEDS.find((b) => b.id === defaultBreedId) || DOG_BREEDS[0];
  const isCustom = breed.id === 'custom-mix';

  // カスタムモード時の値の上書き
  const activePrice = isCustom ? customPrice : breed.price;
  const activeLifespan = isCustom ? customLifespan : breed.lifespan;
  const activeSize = isCustom ? customSize : breed.size as '小型犬' | '中型犬' | '大型犬';

  // 1. 初期費用 (生体代 + スターターセット + しつけ教室 + 去勢避妊手術)
  const spayNeuterCost = hasSpayNeuter ? 40000 : 0;
  const initialCost = activePrice + starterSetCost + trainingCost + spayNeuterCost;

  // 病気リスクの期待値計算 (生涯かかる治療費の期待値を年割にする)
  // (治療費 * 発症確率) / 寿命
  let annualDiseaseExpected = 0;
  breed.diseases.forEach(d => {
    // 保険加入時は自己負担額を3割（70%補償）と仮定して計算
    const patientCost = hasInsurance ? d.cost * 0.3 : d.cost;
    annualDiseaseExpected += (patientCost * d.probability) / activeLifespan;
  });
  // 地域物価を適用
  annualDiseaseExpected = annualDiseaseExpected * areaScale;

  // 賃貸の場合は、退去時の壁紙や床の修繕費として年間3万円積み立てる計算
  const annualHousingMaintenance = housingType === 'rental' ? 30000 : 0;

  // 2. 基本の年間費用 (シニア期以外)
  // - 食費・日用品・光熱費 (物価係数を適用)
  const annualFoodAndGoods = ((breed.monthlyFood + snackCost + toiletSheetCost + acCost) * 12) * areaScale;
  // - 美容・お世話 (物価係数を適用)
  const annualCare = ((breed.trimmingCost * trimmingFrequency) + hotelCost) * areaScale + annualHousingMaintenance;
  // - 医療・保険 (ワクチン + 予防薬 + 保険 + 定期健診)
  const annualCheckupCost = hasAnnualCheckup ? 20000 * areaScale : 0;
  // 医療費は病気期待値をプラスする
  const annualMedical = (VACCINE_COST + PREVENTION_COST[activeSize]) * areaScale + annualCheckupCost + (hasInsurance ? INSURANCE_MONTHLY * 12 : 0) + annualDiseaseExpected;

  const normalAnnualCost = annualFoodAndGoods + annualCare + annualMedical;

  // 3. 生涯費用の計算とタイムラインデータの生成 (シニア期を考慮)
  let totalFoodAndGoods = 0;
  let totalCare = 0;
  let totalMedical = 0;

  const timelineData = [];

  for (let year = 1; year <= activeLifespan; year++) {
    const isSenior = year >= SENIOR_AGE_START;
    const medicalMultiplier = isSenior ? SENIOR_MEDICAL_MULTIPLIER : 1;

    // シニア期はベースの医療費に加えて、病気期待値そのものも1.5倍にするロジックをより明確に
    const currentYearMedical = (annualMedical - annualDiseaseExpected) * medicalMultiplier + (annualDiseaseExpected * medicalMultiplier);

    totalFoodAndGoods += annualFoodAndGoods;
    totalCare += annualCare;
    totalMedical += currentYearMedical;

    // タイムライン用のデータ構築（1年目は初期費用を含む）
    const yearCost = annualFoodAndGoods + annualCare + currentYearMedical + (year === 1 ? initialCost : 0);

    timelineData.push({
      age: `${year}歳`,
      cost: yearCost,
      initial: year === 1 ? initialCost : 0,
      running: annualFoodAndGoods + annualCare + currentYearMedical
    });
  }

  const lifetimeCost = initialCost + totalFoodAndGoods + totalCare + totalMedical;

  const chartData = [
    { name: '初期費用', value: initialCost },
    { name: '食費・日用品', value: totalFoodAndGoods },
    { name: '美容・お世話', value: totalCare },
    { name: '医療・保険', value: totalMedical },
  ];

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(Math.floor(num)) + '円';
  };

  const filteredBreeds = DOG_BREEDS.filter((b) => {
    const matchSearch = b.name.includes(searchQuery) || b.description.includes(searchQuery) || b.tags.some(t => t.includes(searchQuery));
    const matchSize = selectedSize === 'all' || b.size === selectedSize;
    return matchSearch && matchSize;
  });

  return (
    <div className="w-full flex flex-col gap-6">

      {/* お楽しみ機能: わんこ診断 */}
      <section className="dark:bg-indigo-900/30 bg-indigo-50 p-5 rounded-3xl shadow-sm border-2 dark:border-indigo-800 border-indigo-200 transition-colors">
        {!showQuiz ? (
          <div className="text-center">
            <h2 className="text-lg font-black dark:text-indigo-300 text-indigo-700 mb-2">🐾 迷ったらこれ！ワンコ相性診断 🐾</h2>
            <p className="text-xs dark:text-indigo-200/80 text-indigo-600/80 font-bold mb-4">3つの質問に答えて、あなたにピッタリの犬種を見つけよう！</p>
            <button
              onClick={() => setShowQuiz(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-2 px-6 rounded-full transition-transform active:scale-95 shadow-md"
            >
              診断をスタート！
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-sm font-bold dark:text-indigo-300 text-indigo-700 mb-4">
              Q{quizAnswers.length + 1}. {QUIZ_QUESTIONS[quizAnswers.length].text}
            </h3>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {QUIZ_QUESTIONS[quizAnswers.length].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuizAnswer(opt.score)}
                  className="bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 text-indigo-900 border-2 border-indigo-100 py-3 px-4 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => {setShowQuiz(false); setQuizAnswers([]);}} className="mt-4 text-[10px] text-gray-400 underline">やめる</button>
          </div>
        )}
      </section>

      {/* Step 1: Breed Selection */}
        <section ref={settingsRef} className="dark:bg-gray-800 bg-white p-5 rounded-3xl shadow-sm border-2 dark:border-gray-700 border-orange-100 transition-colors">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 dark:text-orange-400 text-orange-600">
            <span className="text-2xl">🔍</span> 1. 犬種をえらぶ
          </h2>

          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="犬種名や特徴で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 md:p-2 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 flex-wrap mb-2">
              {['all', '小型犬', '中型犬', '大型犬'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-transform active:scale-95 ${
                    selectedSize === size ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}
                >
                  {size === 'all' ? '🐾 すべて' : size}
                </button>
              ))}
            </div>

            {/* 特徴タグのクイック検索 */}
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-gray-500 py-1 mr-1">特徴:</span>
              {['一人暮らし向け', 'ファミリー向け', '抜け毛少ない', '活発', '運動量少なめ'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-full border transition-colors ${
                    searchQuery === tag ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredBreeds.length > 0 ? (
              ['カスタム', '小型犬', '中型犬', '大型犬'].map(sizeCategory => {
                const breedsInSize = filteredBreeds.filter(b => b.size === sizeCategory);
                if (breedsInSize.length === 0) return null;

                return (
                  <div key={sizeCategory} className="mb-3">
                    <h3 className="text-xs font-extrabold dark:text-pink-400 text-pink-600 dark:bg-pink-900/30 bg-pink-50 px-3 py-1.5 rounded-full mb-3 inline-block shadow-sm transition-colors">
                      ✨ {sizeCategory}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {breedsInSize.map((b) => (
                        <label
                          key={b.id}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedBreedId === b.id ? 'dark:border-orange-500 border-orange-400 dark:bg-orange-900/20 bg-orange-50 shadow-md transform scale-[1.02]' : 'dark:border-gray-700 border-orange-100 dark:bg-gray-800 bg-white dark:hover:bg-gray-700 hover:bg-orange-50 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="breed"
                              value={b.id}
                              checked={selectedBreedId === b.id}
                              onChange={(e) => setSelectedBreedId(e.target.value)}
                              className="w-5 h-5 mt-1 text-orange-500 focus:ring-orange-400 focus:ring-offset-orange-50"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-extrabold dark:text-gray-200 text-gray-800 text-base">{b.name}</div>
                              </div>
                              <div className="text-xs dark:text-gray-400 text-gray-600 leading-relaxed mb-2">{b.description}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {b.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-bold bg-white border border-pink-200 text-pink-500 px-2 py-0.5 rounded-full shadow-sm">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">該当する犬種が見つかりません</p>
            )}
          </div>
        </section>

        {/* 基本データの表示 */}
        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-3xl shadow-sm border-2 border-yellow-200 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-10">🦴</div>
          <h2 className="text-sm font-extrabold text-orange-700 mb-3 flex items-center gap-1">
            <span className="text-lg">📋</span> {breed.name} の基本データ
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-white">
              <span className="text-orange-500 font-bold block text-[10px] mb-1">⏳ 推定寿命</span>
              <span className="font-extrabold text-gray-800 text-lg">{activeLifespan}<span className="text-xs font-normal">年</span></span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-white">
              <span className="text-orange-500 font-bold block text-[10px] mb-1">📏 サイズ</span>
              <span className="font-extrabold text-gray-800 text-lg">{activeSize}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-white">
              <span className="text-orange-500 font-bold block text-[10px] mb-1">⚖️ 体重目安</span>
              <span className="font-extrabold text-gray-800">{breed.weight}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-white">
              <span className="text-orange-500 font-bold block text-[10px] mb-1">🦮 散歩時間</span>
              <span className="font-extrabold text-gray-800">{breed.walkingTime}</span>
            </div>
          </div>
        </section>

        {/* 新しいセクション: ワンちゃんの情報と居住環境 */}
        <section className="dark:bg-gray-800 bg-white p-5 rounded-3xl shadow-sm border-2 dark:border-gray-700 border-orange-100 transition-colors">
          <h2 className="text-lg font-bold mb-4 dark:text-orange-400 text-orange-600 flex items-center gap-2">
            <span className="text-2xl">📛</span> {isCustom ? '2.' : '2.'} ワンちゃんの情報と環境
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">お名前（任意）</h3>
              <input
                type="text"
                placeholder="例: ポチ、ココ..."
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                className="w-full p-3 md:p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">お住まいの地域</h3>
                <select
                  value={areaScale}
                  onChange={(e) => setAreaScale(Number(e.target.value))}
                  className="w-full p-3 md:p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-base md:text-sm bg-white transition-colors"
                >
                  <option value={1.0}>地方・郊外 (標準)</option>
                  <option value={1.1}>都市部 (物価高め)</option>
                </select>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">住居タイプ</h3>
                <select
                  value={housingType}
                  onChange={(e) => setHousingType(e.target.value)}
                  className="w-full p-3 md:p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-base md:text-sm bg-white transition-colors"
                >
                  <option value="owned">持ち家</option>
                  <option value="rental">賃貸 (修繕費を加算)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* カスタム設定 (ミックス・保護犬選択時のみ表示) */}
        {isCustom && (
          <section className="bg-green-50 p-5 rounded-3xl shadow-sm border-2 border-green-200">
            <h2 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2">
              <span className="text-2xl">✏️</span> 3. カスタム情報の設定
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>生体代（譲渡費用など）</span>
                  <span className="text-xs text-gray-500">{formatCurrency(customPrice)}</span>
                </h3>
                <input
                  type="range" min="0" max="500000" step="10000"
                  value={customPrice} onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>予想される寿命</span>
                  <span className="text-xs text-gray-500">{customLifespan}年</span>
                </h3>
                <input
                  type="range" min="5" max="20" step="1"
                  value={customLifespan} onChange={(e) => setCustomLifespan(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">成長後の予想サイズ</h3>
                <div className="flex bg-white p-1.5 rounded-xl border-2 border-green-100 shadow-inner">
                  {['小型犬', '中型犬', '大型犬'].map(s => (
                    <button
                      key={s}
                      onClick={() => setCustomSize(s as any)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${customSize === s ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-green-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-green-600 mt-1.5">※このサイズによって予防薬（フィラリア等）の金額が変わります。</p>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Environment Settings */}
        <section className="dark:bg-gray-800 bg-white p-5 rounded-3xl shadow-sm border-2 dark:border-gray-700 border-orange-100 transition-colors">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-orange-400 text-orange-600">
            <span className="text-2xl">🏡</span> {isCustom ? '4.' : '3.'} お世話オプションをえらぶ
          </h2>

          <div className="space-y-4">

            {/* 常に表示する最重要項目（トリミング、保険） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-orange-100 dark:border-gray-600">
              {/* 保険 */}
              <div>
                <h3 className="text-sm font-bold dark:text-gray-300 text-gray-700 mb-2 flex justify-between">
                  <span>🏥 ペット保険</span>
                  <span className="text-[10px] text-gray-500">月額3,000円</span>
                </h3>
                <div className="flex bg-gray-200/50 dark:bg-gray-900 p-1 rounded-xl">
                  <button
                    onClick={() => setHasInsurance(true)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${hasInsurance ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                  >
                    加入する
                  </button>
                  <button
                    onClick={() => setHasInsurance(false)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!hasInsurance ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}
                  >
                    加入しない
                  </button>
                </div>
              </div>

              {/* トリミング */}
              {breed.trimmingCost > 0 && (
                <div>
                  <h3 className="text-sm font-bold dark:text-gray-300 text-gray-700 mb-2">✂️ トリミング頻度</h3>
                  <div className="grid grid-cols-3 gap-1 bg-gray-200/50 dark:bg-gray-900 p-1 rounded-xl">
                    {[
                      { label: '毎月', value: 12 },
                      { label: '2ヶ月に1回', value: 6 },
                      { label: '行かない', value: 0 }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTrimmingFrequency(option.value)}
                        className={`py-2 text-[11px] font-bold rounded-lg transition-colors ${trimmingFrequency === option.value ? 'bg-white dark:bg-gray-700 shadow text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* アコーディオン: 詳細設定 */}
            <details className="group border dark:border-gray-700 border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-800/80">
              <summary className="p-4 cursor-pointer font-bold dark:text-gray-300 text-gray-700 list-none flex justify-between items-center select-none">
                <span className="flex items-center gap-2">⚙️ 詳細オプションを開く (日用品・医療・初期費用等)</span>
                <span className="transform transition-transform group-open:rotate-180 text-xl">▼</span>
              </summary>

              <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t dark:border-gray-700 border-gray-200 mt-2 pt-4">

                {/* 初期費用系 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-500 mb-1 flex justify-between"><span>スターターセット(初期)</span></h3>
                    <select value={starterSetCost} onChange={(e) => setStarterSetCost(Number(e.target.value))} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                      <option value={30000}>節約・最低限 (3万)</option><option value={50000}>普通 (5万)</option><option value={100000}>高級 (10万)</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-500 mb-1 flex justify-between"><span>しつけ教室 (初期)</span></h3>
                    <select value={trainingCost} onChange={(e) => setTrainingCost(Number(e.target.value))} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                      <option value={0}>自分でやる (0円)</option><option value={50000}>プロに通う (5万)</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-500 mb-1 flex justify-between"><span>去勢・避妊手術 (初期)</span></h3>
                    <select value={hasSpayNeuter ? 1 : 0} onChange={(e) => setHasSpayNeuter(e.target.value === '1')} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                      <option value={1}>受ける (約4万)</option><option value={0}>受けない</option>
                    </select>
                  </div>
                </div>

                {/* 毎月・毎年の費用系 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-500 mb-1 flex justify-between"><span>おやつ・サプリ (月額)</span></h3>
                    <select value={snackCost} onChange={(e) => setSnackCost(Number(e.target.value))} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                      <option value={1000}>控えめ (1,000円/月)</option><option value={3000}>普通 (3,000円/月)</option><option value={5000}>高級 (5,000円/月)</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-500 mb-1 flex justify-between"><span>トイレシート等消耗品 (月額)</span></h3>
                    <select value={toiletSheetCost} onChange={(e) => setToiletSheetCost(Number(e.target.value))} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                      <option value={1000}>節約・安い (1,000円/月)</option><option value={1500}>普通 (1,500円/月)</option><option value={3000}>厚手・高級 (3,000円/月)</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-500 mb-1 flex justify-between"><span>冷暖房費(エアコン) (月額)</span></h3>
                    <select value={acCost} onChange={(e) => setAcCost(Number(e.target.value))} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                      <option value={0}>計算に含めない</option><option value={3000}>普通 (3,000円/月)</option><option value={6000}>24Hつけっぱ (6,000円/月)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h3 className="text-[11px] font-bold text-gray-500 mb-1">ペットホテル (年額)</h3>
                      <select value={hotelCost} onChange={(e) => setHotelCost(Number(e.target.value))} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                        <option value={0}>なし</option><option value={20000}>たまに</option><option value={60000}>頻繁</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-gray-500 mb-1">定期健診 (年額)</h3>
                      <select value={hasAnnualCheckup ? 1 : 0} onChange={(e) => setHasAnnualCheckup(e.target.value === '1')} className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 rounded-lg text-sm bg-white">
                        <option value={0}>受けない</option><option value={1}>受ける (2万)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </details>

          </div>
        </section>
        {/* Step 4: Result */}
        <section ref={resultRef} className="dark:from-gray-800 dark:to-gray-900 bg-gradient-to-b from-white to-orange-50 p-6 rounded-3xl shadow-lg border-4 dark:border-gray-700 border-orange-300 flex flex-col gap-4 relative overflow-hidden transition-colors">
          <div className="absolute -top-10 -right-10 text-9xl opacity-5 transform rotate-12" data-html2canvas-ignore>💰</div>
          <div className="relative z-10">
            <h2 className="text-center text-sm font-extrabold dark:text-orange-400 text-orange-600 mb-2 dark:bg-gray-800 bg-orange-100 inline-block px-4 py-1 rounded-full mx-auto block w-fit transition-colors">
              ✨ {dogName ? `${dogName}ちゃん` : breed.name} の概算生涯費用 ✨
            </h2>
            <p className="text-center text-xs dark:text-gray-400 text-gray-500 font-bold mb-1">推定寿命: {activeLifespan}年</p>
            <div className="text-center mt-2 mb-2">
              <span className="text-5xl font-black text-pink-500 tracking-tight drop-shadow-sm">{formatCurrency(lifetimeCost)}</span>
            </div>
          </div>

          {/* グラフ表示 */}
          <div className="space-y-6 mt-4">
            {/* 年表（タイムライン）グラフ */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 text-center mb-2">年齢ごとの費用推移</h3>
              <div className="h-48 md:h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="age" tick={{ fontSize: 10 }} tickMargin={5} />
                    <YAxis tickFormatter={(val) => `${val / 10000}万`} tick={{ fontSize: 10 }} />
                    <BarTooltip
                      formatter={(value: any) => formatCurrency(Number(value) || 0)}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="initial" name="初期費用" stackId="a" fill="#fb923c" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="running" name="年間費用" stackId="a" fill="#f472b6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 内訳（円グラフ） */}
            <div className="bg-white/60 p-4 rounded-3xl border border-white shadow-sm">
              <h3 className="text-sm font-extrabold text-orange-600 text-center mb-2">📊 生涯費用の内訳</h3>
              <div className="h-56 md:h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#fb923c" /> {/* 初期費用 */}
                      <Cell fill="#f472b6" /> {/* 食費・日用品 */}
                      <Cell fill="#34d399" /> {/* 美容・お世話 */}
                      <Cell fill="#fbbf24" /> {/* 医療・保険 */}
                    </Pie>
                    <PieTooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dark:bg-gray-800 bg-white/80 rounded-2xl p-5 space-y-4 mt-4 text-sm shadow-sm border dark:border-gray-700 border-white transition-colors">
            <div className="flex justify-between items-center border-b dark:border-gray-700 border-orange-100 pb-3 transition-colors">
              <span className="dark:text-gray-300 text-gray-600 font-bold flex items-center gap-2"><span className="text-lg">🎁</span>初期費用</span>
              <span className="font-black dark:text-gray-100 text-gray-800 text-lg">{formatCurrency(initialCost)}</span>
            </div>
            <div className="flex justify-between items-center border-b dark:border-gray-700 border-orange-100 pb-3 transition-colors">
              <span className="dark:text-gray-300 text-gray-600 font-bold flex items-center gap-2"><span className="text-lg">🌱</span>年間費用 (若年期)</span>
              <span className="font-black dark:text-gray-100 text-gray-800 text-lg">{formatCurrency(normalAnnualCost)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="dark:text-gray-300 text-gray-600 font-bold flex items-center gap-2"><span className="text-lg">🍂</span>年間費用 (シニア期7歳~)</span>
              <span className="font-black text-pink-500 text-lg">{formatCurrency(normalAnnualCost + (annualMedical * (SENIOR_MEDICAL_MULTIPLIER - 1)))}</span>
            </div>
          </div>
          <p className="text-[10px] dark:text-orange-400/80 text-orange-600/70 mt-3 text-center font-bold">
            ※シニア期は医療・保険カテゴリの費用が1.5倍になる想定で計算しています。
          </p>

          {/* 新しいセクション: 病気リスクとTips */}
          {!isCustom && breed.diseases.length > 0 && (
            <div className="mt-4 p-4 dark:bg-red-900/30 bg-red-50 rounded-2xl border dark:border-red-800 border-red-100">
              <h3 className="text-sm font-bold dark:text-red-400 text-red-600 mb-3 flex items-center gap-2">
                <span className="text-lg">🏥</span> かかりやすい病気とリスク
              </h3>
              <ul className="space-y-3 mb-4">
                {breed.diseases.map((d, i) => (
                  <li key={i} className="text-xs dark:text-red-200 text-red-800 bg-white/50 dark:bg-black/20 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-bold">{d.name}</span>
                    <span className="text-right">
                      <span className="block text-[10px] opacity-80">生涯発症率: {d.probability * 100}%</span>
                      <span className="font-black">{formatCurrency(d.cost)}~</span>
                    </span>
                  </li>
                ))}
              </ul>
              {breed.tips.map((tip, i) => (
                <p key={i} className="text-xs dark:text-red-300 text-red-700 font-bold leading-relaxed flex items-start gap-1.5">
                  <span className="mt-0.5">💡</span> {tip}
                </p>
              ))}
            </div>
          )}

          {/* URL共有ボタン追加 */}
          <div className="mt-5 flex justify-center relative z-10" data-html2canvas-ignore>
             <button
               onClick={() => {
                 navigator.clipboard.writeText(window.location.href);
                 alert('この結果のURLをコピーしました！');
               }}
               className="text-xs font-bold dark:text-blue-400 text-blue-600 underline hover:opacity-80 flex items-center gap-1"
             >
               🔗 このシミュレーション結果のURLをコピーして共有する
             </button>
          </div>

          {/* アクションボタン群 */}
          <div className="mt-3 flex flex-col sm:flex-row justify-center gap-3 relative z-10" data-html2canvas-ignore>
            <button
              onClick={handleDownloadImage}
              className="bg-orange-500 text-white text-sm font-extrabold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-orange-600 transition-transform active:scale-95 shadow-md flex-1"
            >
              <span>📸</span>
              画像を保存
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私のワンコ(${breed.name})お迎え概算生涯費用は ${new Intl.NumberFormat('ja-JP').format(lifetimeCost)}円 でした！🐶🐾\n\n#PetSim #ワンコお迎えコスト計算機\n`)}&url=${encodeURIComponent('https://BambaSpace.github.io/PetSim/')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white text-sm font-extrabold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 shadow-md flex-1"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.92H5.078z"></path></g></svg>
              ポスト
            </a>
          </div>
        </section>
    </div>
  );
}

export default function App() {
  const [isCompareMode, setIsCompareMode] = useUrlSyncedState<boolean>('isCompareMode', false);
  const [isDarkMode, setIsDarkMode] = useUrlSyncedState<boolean>('isDarkMode', false);

  // 診断機能用の状態 (Global level)
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  // 診断の質問データ
  const QUIZ_QUESTIONS = [
    { text: "休日の過ごし方は？", options: [{ label: "アウトドア派！外でアクティブに遊ぶ", score: 'active' }, { label: "インドア派！家でのんびり過ごす", score: 'indoor' }] },
    { text: "ブラッシングなどの毎日のお手入れは？", options: [{ label: "面倒見が良いので苦にならない", score: 'care_ok' }, { label: "なるべく手間がかからない方がいい", score: 'care_no' }] },
    { text: "お住まいの環境は？", options: [{ label: "マンション・アパート（スペース限られる）", score: 'small' }, { label: "一戸建て（お庭があったり広い）", score: 'large' }] }
  ];

  const handleQuizAnswer = (optionScore: string) => {
    const newAnswers = [...quizAnswers, optionScore];
    setQuizAnswers(newAnswers);

    if (newAnswers.length === QUIZ_QUESTIONS.length) {
      // 診断結果はURL経由でAのシミュレーターに渡す（簡易的）
      let recommendedId = 'toy-poodle'; // デフォルト
      const isIndoor = newAnswers.includes('indoor');
      const isCareNo = newAnswers.includes('care_no');
      const isSmall = newAnswers.includes('small');

      if (isIndoor && isCareNo && isSmall) recommendedId = 'chihuahua';
      else if (isIndoor && !isCareNo && isSmall) recommendedId = 'shih-tzu';
      else if (!isIndoor && !isCareNo && !isSmall) recommendedId = 'golden';
      else if (!isIndoor && isCareNo && !isSmall) recommendedId = 'shiba';
      else if (!isIndoor && isCareNo && isSmall) recommendedId = 'jack-russell';
      else if (isIndoor && !isCareNo && !isSmall) recommendedId = 'bernese';
      else if (!isIndoor && !isCareNo && isSmall) recommendedId = 'toy-poodle';

      // URLを更新し、カスタムイベントを発火してSimulatorコンポーネントに通知する
      try {
        const key = 'selectedBreedId_A';
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, btoa(encodeURIComponent(JSON.stringify(recommendedId))));
        window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);

        // ローカルストレージイベントをシミュレートしてフックを再レンダリングさせる
        window.localStorage.setItem(key, JSON.stringify(recommendedId));
        window.dispatchEvent(new Event('storage'));
        // 独自イベントも発火
        window.dispatchEvent(new CustomEvent('quizResult', { detail: recommendedId }));
      } catch (e) {}

      setShowQuiz(false);
      setQuizAnswers([]);
      alert('あなたにピッタリの犬種が選択されました！✨');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen flex flex-col items-center font-sans ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-orange-50 text-gray-800'} transition-colors duration-300 relative`}>
      {/* モーダル表示時の背景オーバーレイ */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dark:bg-gray-800 bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up border-4 dark:border-indigo-500 border-indigo-300">
            <div className="text-center">
              <h3 className="text-sm font-bold dark:text-indigo-300 text-indigo-700 mb-4">
                Q{quizAnswers.length + 1}. {QUIZ_QUESTIONS[quizAnswers.length].text}
              </h3>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                {QUIZ_QUESTIONS[quizAnswers.length].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(opt.score)}
                    className="bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 text-indigo-900 border-2 border-indigo-100 py-3 px-4 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button onClick={() => {setShowQuiz(false); setQuizAnswers([]);}} className="mt-6 text-xs text-gray-400 underline hover:text-gray-500">やめる</button>
            </div>
          </div>
        </div>
      )}

      <header className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white p-5 shadow-md text-center rounded-b-3xl sticky top-0 z-50 relative">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-10"
          title={isDarkMode ? 'ライトモードにする' : 'ダークモードにする'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-md mt-2 md:mt-0 relative z-0">🐶 ワンコお迎えコスト計算機 🐾</h1>
        <p className="text-xs font-medium mt-1 opacity-90 relative z-0">〜うちの子にどれくらいかかる？〜</p>
      </header>

      <div className="w-full max-w-4xl px-4 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
        {/* 診断機能スタートボタン (ヘッダー直下に移動) */}
        <button
          onClick={() => setShowQuiz(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-2 px-6 rounded-full transition-transform active:scale-95 shadow-md flex items-center gap-2 text-sm w-full md:w-auto justify-center animate-pulse"
        >
          <span className="text-lg">✨</span> 迷ったらこれ！ワンコ相性診断
        </button>
        <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-full shadow-sm border-2 border-orange-200 hover:bg-orange-50 transition-colors">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={isCompareMode} onChange={() => setIsCompareMode(!isCompareMode)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isCompareMode ? 'bg-orange-400' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isCompareMode ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm font-extrabold text-orange-700">
            ⚖️ 2匹並べて比較する
          </div>
        </label>
      </div>

      <main className={`flex-1 w-full p-4 flex flex-col lg:flex-row gap-6 ${isCompareMode ? 'max-w-7xl' : 'max-w-lg'}`}>

        <div className="flex-1 flex flex-col gap-6">
          {isCompareMode && <h2 className="text-center font-black text-xl text-orange-500 bg-orange-100 py-2 rounded-full mx-10 border-2 border-orange-200">ワンコ A</h2>}
          <Simulator idSuffix="A" defaultBreedId="toy-poodle" />
        </div>

        {isCompareMode && (
          <div className="flex-1 flex flex-col gap-6 lg:border-l-4 lg:border-dashed lg:border-orange-200 lg:pl-6">
            <h2 className="text-center font-black text-xl text-pink-500 bg-pink-100 py-2 rounded-full mx-10 border-2 border-pink-200">ワンコ B</h2>
            <Simulator idSuffix="B" defaultBreedId="shiba" />
          </div>
        )}

      </main>

      {/* アフィリエイト（マネタイズ）エリア */}
      <section className="flex flex-col gap-4 mt-8 w-full max-w-lg px-4 mb-6">

          {/* ペット保険の紹介 */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-5 rounded-3xl shadow-sm border-2 border-blue-100 flex flex-col items-center text-center">
            <h3 className="text-blue-800 font-extrabold text-base mb-1">
              🏥 万が一のケガや病気に備えよう
            </h3>
            <p className="text-xs text-blue-600/80 font-bold mb-4">
              シニア期は医療費が急増します。若いうちの加入がおすすめ！
            </p>
            <a
              href="#" // ここにASPのペット保険一括見積もりリンクを入れる
              className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-teal-400 text-white text-sm font-extrabold py-3 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>📄</span>
              複数のペット保険を無料・一括比較！
            </a>
            <p className="text-[9px] text-gray-400 mt-2">※提携サイトへ移動します</p>
          </div>

          {/* スターターセット・フードの紹介 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="#" className="bg-white p-4 rounded-3xl shadow-sm border-2 border-orange-100 hover:border-orange-300 transition-colors flex flex-col items-center text-center block group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛍️</div>
              <h4 className="text-xs font-extrabold text-gray-800 mb-1">はじめての<br/>お迎えセット</h4>
              <p className="text-[9px] text-gray-500 font-bold">ケージやトイレの準備はこちらから</p>
              <span className="text-[10px] font-bold text-orange-500 mt-2 flex items-center gap-1">
                Amazonで見る <span className="text-xs">›</span>
              </span>
            </a>

            <a href="#" className="bg-white p-4 rounded-3xl shadow-sm border-2 border-pink-100 hover:border-pink-300 transition-colors flex flex-col items-center text-center block group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍖</div>
              <h4 className="text-xs font-extrabold text-gray-800 mb-1">獣医師推奨の<br/>プレミアムフード</h4>
              <p className="text-[9px] text-gray-500 font-bold">健康と長生きのために</p>
              <span className="text-[10px] font-bold text-pink-500 mt-2 flex items-center gap-1">
                詳細をチェック <span className="text-xs">›</span>
              </span>
            </a>
          </div>

        </section>

      {/* Google AdSense Area (準備用プレースホルダー) */}
      <section className="w-full max-w-lg px-4 mb-8">
        <div className="w-full h-[100px] md:h-[250px] bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-400 dark:text-gray-500 text-sm font-bold text-center">
            [Google AdSense 広告エリア]<br/>
            <span className="text-xs font-normal">※ 審査通過後にここに広告が表示されます</span>
          </p>
          {/* 実際の広告タグの例 (審査通過後に使用) */}
          {/* <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="YYYYYYYYYY"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-orange-100 dark:bg-gray-800 p-6 mt-auto text-center transition-colors">
        <p className="text-xs text-orange-800 font-bold opacity-70">
          © {new Date().getFullYear()} ワンコお迎えコスト計算機
        </p>
      </footer>
    </div>
  );
}