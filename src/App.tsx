import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type DogBreed = {
  id: string;
  name: string;
  price: number;
  lifespan: number;
  monthlyFood: number;
  trimmingCost: number;
  description: string;
  size: '小型犬' | '中型犬' | '大型犬';
  tags: string[];
};

const DOG_BREEDS: DogBreed[] = [
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
    tags: ['一人暮らし向け', '抜け毛少ない', '初心者向け']
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
    tags: ['一人暮らし向け', '運動量少なめ']
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
    tags: ['ファミリー向け', '活発']
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
    tags: ['抜け毛多い', '活発']
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
    tags: ['一人暮らし向け', '賢い']
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
    tags: ['抜け毛少ない', '活発']
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
    tags: ['抜け毛多い', '運動量多い', '番犬向き']
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
    tags: ['運動量多い', '抜け毛多い', 'ファミリー向け']
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
    tags: ['抜け毛多い']
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
    tags: ['運動量多い', '抜け毛多い', '賢い']
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
    tags: ['運動量少なめ', '室内飼い特化']
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
    tags: ['ファミリー向け', '運動量多い', '抜け毛多い']
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
    tags: ['ファミリー向け', '運動量多い', '賢い']
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
    tags: ['運動量非常に多い', '抜け毛多い']
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
    tags: ['ファミリー向け', '抜け毛多い', 'のんびり']
  }
];

const COMMON_INITIAL_COST = 50000;
const VACCINE_COST = 15000;
const INSURANCE_MONTHLY = 3000;

const SENIOR_AGE_START = 7;
const SENIOR_MEDICAL_MULTIPLIER = 1.5; // シニア期の医療費・ケア増加率

export default function App() {
  const [selectedBreedId, setSelectedBreedId] = useState<string>(DOG_BREEDS[0].id);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [trimmingFrequency, setTrimmingFrequency] = useState<number>(12);

  // 絞り込み・検索用の状態
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // 新しい飼育オプション状態
  const [snackCost, setSnackCost] = useState<number>(3000); // 月額おやつ・サプリ代
  const [hotelCost, setHotelCost] = useState<number>(0); // 年間ホテル・ドッグラン代
  const [trainingCost, setTrainingCost] = useState<number>(0); // 初期しつけ教室代
  const [toiletSheetCost, setToiletSheetCost] = useState<number>(1500); // 月額トイレシート代

  const breed = DOG_BREEDS.find((b) => b.id === selectedBreedId) || DOG_BREEDS[0];

  // 1. 初期費用 (生体代 + 用品・登録料 + しつけ教室)
  const initialCost = breed.price + COMMON_INITIAL_COST + trainingCost;

  // 2. 基本の年間費用 (シニア期以外)
  // - 食費・日用品
  const annualFoodAndGoods = (breed.monthlyFood + snackCost + toiletSheetCost) * 12;
  // - 美容・お世話
  const annualCare = (breed.trimmingCost * trimmingFrequency) + hotelCost;
  // - 医療・保険
  const annualMedical = VACCINE_COST + (hasInsurance ? INSURANCE_MONTHLY * 12 : 0);

  const normalAnnualCost = annualFoodAndGoods + annualCare + annualMedical;

  // 3. 生涯費用の計算 (シニア期を考慮)
  let totalFoodAndGoods = 0;
  let totalCare = 0;
  let totalMedical = 0;

  for (let year = 1; year <= breed.lifespan; year++) {
    const isSenior = year >= SENIOR_AGE_START;
    const medicalMultiplier = isSenior ? SENIOR_MEDICAL_MULTIPLIER : 1;

    totalFoodAndGoods += annualFoodAndGoods;
    totalCare += annualCare;
    totalMedical += annualMedical * medicalMultiplier;
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
              ['小型犬', '中型犬', '大型犬'].map(sizeCategory => {
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

        {/* Step 2: Environment Settings */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">2. 飼育環境・オプションを選ぶ</h2>

          <div className="space-y-5">
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
            <h2 className="text-center text-sm font-bold text-gray-500 mb-2">概算生涯費用（推定寿命: {breed.lifespan}年）</h2>
            <div className="text-center mb-2">
              <span className="text-4xl font-extrabold text-red-600">{formatCurrency(lifetimeCost)}</span>
            </div>
          </div>

          {/* グラフ表示 */}
          <div className="h-48 w-full mt-2">
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
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-2 text-sm">
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