import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, CartesianGrid } from 'recharts';

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
    walkingTime: '体格に合わせる'
  },
  // --- 小型犬 ---
  {
    id: 'maltese',
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

  // --- 中型犬 ---
  {
    id: 'beagle',
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

export default function App() {
  const [selectedBreedId, setSelectedBreedId] = useState<string>(DOG_BREEDS[0].id);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [trimmingFrequency, setTrimmingFrequency] = useState<number>(12);

  // 絞り込み・検索用の状態
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // カスタムモード用の状態
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customLifespan, setCustomLifespan] = useState<number>(14);
  const [customSize, setCustomSize] = useState<'小型犬' | '中型犬' | '大型犬'>('小型犬');

  // 飼育オプション状態
  const [starterSetCost, setStarterSetCost] = useState<number>(50000); // 初期スターターセット（ケージ等）
  const [snackCost, setSnackCost] = useState<number>(3000); // 月額おやつ・サプリ代
  const [hotelCost, setHotelCost] = useState<number>(0); // 年間ホテル・ドッグラン代
  const [trainingCost, setTrainingCost] = useState<number>(0); // 初期しつけ教室代
  const [toiletSheetCost, setToiletSheetCost] = useState<number>(1500); // 月額トイレシート代
  const [acCost, setAcCost] = useState<number>(3000); // 月額の冷暖房費（エアコン追加分）
  const [hasSpayNeuter, setHasSpayNeuter] = useState<boolean>(true); // 去勢・避妊手術（初期）
  const [hasAnnualCheckup, setHasAnnualCheckup] = useState<boolean>(false); // 年次定期健診・ペットドック

  const breed = DOG_BREEDS.find((b) => b.id === selectedBreedId) || DOG_BREEDS[0];
  const isCustom = breed.id === 'custom-mix';

  // カスタムモード時の値の上書き
  const activePrice = isCustom ? customPrice : breed.price;
  const activeLifespan = isCustom ? customLifespan : breed.lifespan;
  const activeSize = isCustom ? customSize : breed.size as '小型犬' | '中型犬' | '大型犬';

  // 1. 初期費用 (生体代 + スターターセット + しつけ教室 + 去勢避妊手術)
  const spayNeuterCost = hasSpayNeuter ? 40000 : 0;
  const initialCost = activePrice + starterSetCost + trainingCost + spayNeuterCost;

  // 2. 基本の年間費用 (シニア期以外)
  // - 食費・日用品・光熱費
  const annualFoodAndGoods = (breed.monthlyFood + snackCost + toiletSheetCost + acCost) * 12;
  // - 美容・お世話
  const annualCare = (breed.trimmingCost * trimmingFrequency) + hotelCost;
  // - 医療・保険 (ワクチン + 予防薬 + 保険 + 定期健診)
  const annualCheckupCost = hasAnnualCheckup ? 20000 : 0;
  const annualMedical = VACCINE_COST + PREVENTION_COST[activeSize] + annualCheckupCost + (hasInsurance ? INSURANCE_MONTHLY * 12 : 0);

  const normalAnnualCost = annualFoodAndGoods + annualCare + annualMedical;

  // 3. 生涯費用の計算とタイムラインデータの生成 (シニア期を考慮)
  let totalFoodAndGoods = 0;
  let totalCare = 0;
  let totalMedical = 0;

  const timelineData = [];

  for (let year = 1; year <= activeLifespan; year++) {
    const isSenior = year >= SENIOR_AGE_START;
    const medicalMultiplier = isSenior ? SENIOR_MEDICAL_MULTIPLIER : 1;

    const currentYearMedical = annualMedical * medicalMultiplier;

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
    return new Intl.NumberFormat('ja-JP').format(num) + '円';
  };

  const filteredBreeds = DOG_BREEDS.filter((b) => {
    const matchSearch = b.name.includes(searchQuery) || b.description.includes(searchQuery) || b.tags.some(t => t.includes(searchQuery));
    const matchSize = selectedSize === 'all' || b.size === selectedSize;
    return matchSearch && matchSize;
  });

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center font-sans text-gray-800">
      <header className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white p-5 shadow-md text-center rounded-b-3xl">
        <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-md">🐶 ワンコお迎えコスト計算機 🐾</h1>
        <p className="text-xs font-medium mt-1 opacity-90">〜うちの子にどれくらいかかる？〜</p>
      </header>

      <main className="flex-1 w-full max-w-lg p-4 flex flex-col gap-6 mt-2">

        {/* Step 1: Breed Selection */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-orange-600">
            <span className="text-2xl">🔍</span> 1. 犬種をえらぶ
          </h2>

          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="犬種名や特徴で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 flex-wrap">
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
          </div>

          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredBreeds.length > 0 ? (
              ['カスタム', '小型犬', '中型犬', '大型犬'].map(sizeCategory => {
                const breedsInSize = filteredBreeds.filter(b => b.size === sizeCategory);
                if (breedsInSize.length === 0) return null;

                return (
                  <div key={sizeCategory} className="mb-3">
                    <h3 className="text-xs font-extrabold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full mb-3 inline-block shadow-sm">
                      ✨ {sizeCategory}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {breedsInSize.map((b) => (
                        <label
                          key={b.id}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedBreedId === b.id ? 'border-orange-400 bg-orange-50 shadow-md transform scale-[1.02]' : 'border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-200'
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
                                <div className="font-extrabold text-gray-800 text-base">{b.name}</div>
                              </div>
                              <div className="text-xs text-gray-600 leading-relaxed mb-2">{b.description}</div>
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

        {/* カスタム設定 (ミックス・保護犬選択時のみ表示) */}
        {isCustom && (
          <section className="bg-green-50 p-5 rounded-3xl shadow-sm border-2 border-green-200">
            <h2 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2">
              <span className="text-2xl">✏️</span> 2. カスタム情報の設定
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

        {/* Step 2: Environment Settings */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border-2 border-orange-100">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-orange-600">
            <span className="text-2xl">🏡</span> {isCustom ? '3.' : '2.'} お世話オプションをえらぶ
          </h2>

          <div className="space-y-5">
            {/* スターターセット (初期費用) */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>スターターセット (初期)</span>
                <span className="text-xs text-gray-500">ケージ・ベッド等</span>
              </h3>
              <select
                value={starterSetCost}
                onChange={(e) => setStarterSetCost(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value={30000}>節約・最低限 (30,000円)</option>
                <option value={50000}>普通 (50,000円)</option>
                <option value={100000}>こだわり・高級 (100,000円)</option>
              </select>
            </div>

            {/* 保険 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>ペット保険</span>
                <span className="text-xs text-gray-500">月額3,000円</span>
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setHasInsurance(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${hasInsurance ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  加入する
                </button>
                <button
                  onClick={() => setHasInsurance(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!hasInsurance ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  加入しない
                </button>
              </div>
            </div>

            {/* トリミング */}
            {breed.trimmingCost > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">トリミングの頻度</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '毎月', value: 12 },
                    { label: '2ヶ月に1回', value: 6 },
                    { label: '行かない', value: 0 }
                  ].map(option => (
                    <label key={option.value} className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer border ${trimmingFrequency === option.value ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}>
                      <input
                        type="radio"
                        name="trimming"
                        value={option.value}
                        checked={trimmingFrequency === option.value}
                        onChange={() => setTrimmingFrequency(option.value)}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* おやつ・サプリ */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">おやつ・サプリ (月額)</h3>
              <select
                value={snackCost}
                onChange={(e) => setSnackCost(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value={1000}>控えめ (1,000円/月)</option>
                <option value={3000}>普通 (3,000円/月)</option>
                <option value={5000}>たっぷり・高級 (5,000円/月)</option>
              </select>
            </div>

            {/* トイレシート */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">トイレシート等消耗品 (月額)</h3>
              <select
                value={toiletSheetCost}
                onChange={(e) => setToiletSheetCost(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value={1000}>節約・安いもの (1,000円/月)</option>
                <option value={1500}>普通 (1,500円/月)</option>
                <option value={3000}>厚手・高級 (3,000円/月)</option>
              </select>
            </div>

            {/* 冷暖房費 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>冷暖房費 (月額)</span>
                <span className="text-xs text-gray-500">留守番時等のエアコン代</span>
              </h3>
              <select
                value={acCost}
                onChange={(e) => setAcCost(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value={0}>計算に含めない (0円/月)</option>
                <option value={3000}>普通 (3,000円/月)</option>
                <option value={6000}>24時間つけっぱなし等 (6,000円/月)</option>
              </select>
            </div>

            {/* ペットホテル・ドッグラン */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">ペットホテル等利用 (年額)</h3>
              <select
                value={hotelCost}
                onChange={(e) => setHotelCost(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value={0}>利用しない (0円/年)</option>
                <option value={20000}>たまに利用 (20,000円/年)</option>
                <option value={60000}>頻繁に利用 (60,000円/年)</option>
              </select>
            </div>

            {/* 去勢・避妊手術 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">去勢・避妊手術 (初期費用)</h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setHasSpayNeuter(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${hasSpayNeuter ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  受ける (約40,000円)
                </button>
                <button
                  onClick={() => setHasSpayNeuter(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!hasSpayNeuter ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  受けない
                </button>
              </div>
            </div>

            {/* 定期健診・ペットドック */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">定期健診・ペットドック (年額)</h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setHasAnnualCheckup(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${hasAnnualCheckup ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  毎年受ける (約20,000円)
                </button>
                <button
                  onClick={() => setHasAnnualCheckup(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!hasAnnualCheckup ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  受けない・都度
                </button>
              </div>
            </div>

            {/* しつけ教室 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">プロのしつけ教室 (初期費用)</h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setTrainingCost(50000)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${trainingCost > 0 ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  通う (50,000円)
                </button>
                <button
                  onClick={() => setTrainingCost(0)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${trainingCost === 0 ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  自分でやる
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Step 3: Result */}
        <section className="bg-gradient-to-b from-white to-orange-50 p-6 rounded-3xl shadow-lg border-4 border-orange-300 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 text-9xl opacity-5 transform rotate-12">💰</div>
          <div className="relative z-10">
            <h2 className="text-center text-sm font-extrabold text-orange-600 mb-2 bg-orange-100 inline-block px-4 py-1 rounded-full mx-auto block w-fit">
              ✨ 概算生涯費用（推定寿命: {activeLifespan}年） ✨
            </h2>
            <div className="text-center mt-4 mb-2">
              <span className="text-5xl font-black text-pink-500 tracking-tight drop-shadow-sm">{formatCurrency(lifetimeCost)}</span>
            </div>
          </div>

          {/* グラフ表示 */}
          <div className="space-y-6 mt-4">
            {/* 年表（タイムライン）グラフ */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 text-center mb-2">年齢ごとの費用推移</h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="age" tick={{ fontSize: 10 }} tickMargin={5} />
                    <YAxis tickFormatter={(val) => `${val / 10000}万`} tick={{ fontSize: 10 }} />
                    <BarTooltip
                      formatter={(value: number) => formatCurrency(value)}
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
              <div className="h-48 w-full">
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
                    <PieTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-5 space-y-4 mt-4 text-sm shadow-sm border border-white">
            <div className="flex justify-between items-center border-b border-orange-100 pb-3">
              <span className="text-gray-600 font-bold flex items-center gap-2"><span className="text-lg">🎁</span>初期費用</span>
              <span className="font-black text-gray-800 text-lg">{formatCurrency(initialCost)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-orange-100 pb-3">
              <span className="text-gray-600 font-bold flex items-center gap-2"><span className="text-lg">🌱</span>年間費用 (若年期)</span>
              <span className="font-black text-gray-800 text-lg">{formatCurrency(normalAnnualCost)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-600 font-bold flex items-center gap-2"><span className="text-lg">🍂</span>年間費用 (シニア期7歳~)</span>
              <span className="font-black text-pink-500 text-lg">{formatCurrency(normalAnnualCost + (annualMedical * (SENIOR_MEDICAL_MULTIPLIER - 1)))}</span>
            </div>
          </div>
          <p className="text-[10px] text-orange-600/70 mt-3 text-center font-bold">
            ※シニア期は医療・保険カテゴリの費用が1.5倍になる想定で計算しています。
          </p>

          {/* SNS Share Button */}
          <div className="mt-5 flex justify-center relative z-10">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私のワンコ(${breed.name})お迎え概算生涯費用は ${new Intl.NumberFormat('ja-JP').format(lifetimeCost)}円 でした！🐶🐾\n\n#PetSim #ワンコお迎えコスト計算機\n`)}&url=${encodeURIComponent('https://BambaSpace.github.io/PetSim/')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white text-sm font-extrabold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.92H5.078z"></path></g></svg>
              X (Twitter) で結果をシェアする
            </a>
          </div>
        </section>

        {/* アフィリエイト（マネタイズ）エリア */}
        <section className="flex flex-col gap-4 mt-2">

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
          <div className="grid grid-cols-2 gap-3">
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

      </main>

      {/* Footer */}
      <footer className="w-full bg-orange-100 p-6 mt-auto text-center">
        <p className="text-xs text-orange-800 font-bold opacity-70">
          © {new Date().getFullYear()} ワンコお迎えコスト計算機
        </p>
      </footer>
    </div>
  );
}