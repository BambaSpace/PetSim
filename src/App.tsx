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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-blue-600 text-white p-4 shadow-md text-center">
        <h1 className="text-xl font-bold">ワンコお迎えコスト計算機</h1>
      </header>

      <main className="flex-1 w-full max-w-lg p-4 flex flex-col gap-6">

        {/* Step 1: Breed Selection */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">1. 犬種を選ぶ</h2>

          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="犬種名や特徴で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              {['all', '小型犬', '中型犬', '大型犬'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedSize === size ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {size === 'all' ? 'すべて' : size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
            {filteredBreeds.length > 0 ? (
              ['カスタム', '小型犬', '中型犬', '大型犬'].map(sizeCategory => {
                const breedsInSize = filteredBreeds.filter(b => b.size === sizeCategory);
                if (breedsInSize.length === 0) return null;

                return (
                  <div key={sizeCategory} className="mb-2">
                    <h3 className="text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-md mb-2">{sizeCategory}</h3>
                    <div className="flex flex-col gap-2">
                      {breedsInSize.map((b) => (
                        <label
                          key={b.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex-shrink-0 ${
                            selectedBreedId === b.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="breed"
                              value={b.id}
                              checked={selectedBreedId === b.id}
                              onChange={(e) => setSelectedBreedId(e.target.value)}
                              className="w-5 h-5 mt-0.5 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-bold text-gray-900">{b.name}</div>
                              </div>
                              <div className="text-xs text-gray-500 leading-snug mb-1.5">{b.description}</div>
                              <div className="flex flex-wrap gap-1">
                                {b.tags.map(tag => (
                                  <span key={tag} className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-nowrap">
                                    #{tag}
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
        <section className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
          <h2 className="text-sm font-bold text-blue-800 mb-2">選択中の犬種データ: {breed.name}</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="text-gray-500 block text-xs">推定寿命</span>
              <span className="font-semibold text-gray-800">{activeLifespan}年</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="text-gray-500 block text-xs">サイズ目安</span>
              <span className="font-semibold text-gray-800">{activeSize}</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="text-gray-500 block text-xs">体重目安</span>
              <span className="font-semibold text-gray-800">{breed.weight}</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="text-gray-500 block text-xs">必要散歩時間</span>
              <span className="font-semibold text-gray-800">{breed.walkingTime}</span>
            </div>
          </div>
        </section>

        {/* カスタム設定 (ミックス・保護犬選択時のみ表示) */}
        {isCustom && (
          <section className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">2. カスタム情報の設定</h2>
            <div className="space-y-4">
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">成長後の予想サイズ</h3>
                <div className="flex bg-white p-1 rounded-lg border border-gray-300">
                  {['小型犬', '中型犬', '大型犬'].map(s => (
                    <button
                      key={s}
                      onClick={() => setCustomSize(s as any)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${customSize === s ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">※このサイズによって予防薬（フィラリア等）の金額が変わります。</p>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Environment Settings */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">{isCustom ? '3.' : '2.'} 飼育環境・オプションを選ぶ</h2>

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
        <section className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-500 flex flex-col gap-4">
          <div>
            <h2 className="text-center text-sm font-bold text-gray-500 mb-2">概算生涯費用（推定寿命: {activeLifespan}年）</h2>
            <div className="text-center mb-2">
              <span className="text-4xl font-extrabold text-red-600">{formatCurrency(lifetimeCost)}</span>
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
                    <Bar dataKey="initial" name="初期費用" stackId="a" fill="#60a5fa" />
                    <Bar dataKey="running" name="年間費用" stackId="a" fill="#f472b6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 内訳（円グラフ） */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 text-center mb-2">生涯費用の内訳</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#60a5fa" /> {/* 初期費用 */}
                      <Cell fill="#f472b6" /> {/* 食費・日用品 */}
                      <Cell fill="#34d399" /> {/* 美容・お世話 */}
                      <Cell fill="#fbbf24" /> {/* 医療・保険 */}
                    </Pie>
                    <PieTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-4 text-sm">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600">初期費用</span>
              <span className="font-semibold text-gray-800">{formatCurrency(initialCost)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600">年間費用 (若年期)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(normalAnnualCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">年間費用 (シニア期7歳~)</span>
              <span className="font-semibold text-red-500">{formatCurrency(normalAnnualCost + (annualMedical * (SENIOR_MEDICAL_MULTIPLIER - 1)))}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            ※シニア期は医療・保険カテゴリの費用が1.5倍になる想定で計算しています。
          </p>

          {/* SNS Share Button */}
          <div className="mt-4 flex justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私のワンコ(${breed.name})お迎え概算生涯費用は ${new Intl.NumberFormat('ja-JP').format(lifetimeCost)}円 でした！🐶🐾\n\n#PetSim #ワンコお迎えコスト計算機\n`)}&url=${encodeURIComponent('https://BambaSpace.github.io/PetSim/')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white text-sm font-bold py-2 px-6 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.92H5.078z"></path></g></svg>
              X (Twitter) で結果をシェア
            </a>
          </div>
        </section>

      </main>

      {/* Footer / Ad Placeholder */}
      <footer className="w-full bg-gray-200 p-4 mt-auto">
        <div className="w-full max-w-sm mx-auto h-16 bg-gray-300 border border-gray-400 border-dashed flex items-center justify-center text-gray-500 text-sm">
          スポンサーリンク (広告エリア)
        </div>
      </footer>
    </div>
  );
}