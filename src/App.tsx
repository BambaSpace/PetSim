import { useState } from 'react';

type DogBreed = {
  id: string;
  name: string;
  price: number;
  lifespan: number;
  monthlyFood: number;
  trimmingCost: number;
  description: string;
};

const DOG_BREEDS: DogBreed[] = [
  {
    id: 'spitz',
    name: '日本スピッツ',
    price: 300000,
    lifespan: 13,
    monthlyFood: 8000,
    trimmingCost: 7000,
    description: '真っ白で豊かな被毛。活発で遊び好き。ブラッシングが必須。'
  },
  {
    id: 'papillon',
    name: 'パピヨン',
    price: 250000,
    lifespan: 15,
    monthlyFood: 6000,
    trimmingCost: 5000,
    description: '蝶のような耳が特徴。賢く運動能力が高い。'
  },
  {
    id: 'sheltie',
    name: 'シェットランドシープドッグ',
    price: 350000,
    lifespan: 12,
    monthlyFood: 10000,
    trimmingCost: 8000,
    description: '牧羊犬由来の知性と体力。運動量の確保が必要。'
  }
];

const COMMON_INITIAL_COST = 50000;
const VACCINE_COST = 15000;
const INSURANCE_MONTHLY = 3000;

export default function App() {
  const [selectedBreedId, setSelectedBreedId] = useState<string>(DOG_BREEDS[0].id);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [trimmingFrequency, setTrimmingFrequency] = useState<number>(12);

  const breed = DOG_BREEDS.find((b) => b.id === selectedBreedId) || DOG_BREEDS[0];

  const initialCost = breed.price + COMMON_INITIAL_COST;
  const annualCost = ((breed.monthlyFood + (hasInsurance ? INSURANCE_MONTHLY : 0)) * 12) +
                     (breed.trimmingCost * trimmingFrequency) +
                     VACCINE_COST;
  const lifetimeCost = initialCost + (annualCost * breed.lifespan);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num) + '円';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-blue-600 text-white p-4 shadow-md text-center">
        <h1 className="text-xl font-bold">ワンコお迎えコスト計算機</h1>
      </header>

      <main className="flex-1 w-full max-w-lg p-4 flex flex-col gap-6">

        {/* Step 1: Breed Selection */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">1. 犬種を選ぶ</h2>
          <div className="flex flex-col gap-2">
            {DOG_BREEDS.map((b) => (
              <label
                key={b.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedBreedId === b.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="breed"
                    value={b.id}
                    checked={selectedBreedId === b.id}
                    onChange={(e) => setSelectedBreedId(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{b.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Step 2: Environment Settings */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">2. 飼育環境を選ぶ</h2>

          <div className="mb-5">
            <h3 className="text-sm font-medium text-gray-700 mb-2">ペット保険の有無 (月額3,000円)</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setHasInsurance(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${hasInsurance ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                あり
              </button>
              <button
                onClick={() => setHasInsurance(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!hasInsurance ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                なし
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">トリミングの頻度</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="trimming"
                  checked={trimmingFrequency === 12}
                  onChange={() => setTrimmingFrequency(12)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">毎月</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="trimming"
                  checked={trimmingFrequency === 6}
                  onChange={() => setTrimmingFrequency(6)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">2ヶ月に1回</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="trimming"
                  checked={trimmingFrequency === 0}
                  onChange={() => setTrimmingFrequency(0)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">行かない</span>
              </label>
            </div>
          </div>
        </section>

        {/* Step 3: Result */}
        <section className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-500">
          <h2 className="text-center text-sm font-bold text-gray-500 mb-2">概算生涯費用（推定寿命: {breed.lifespan}年）</h2>
          <div className="text-center mb-6">
            <span className="text-4xl font-extrabold text-red-600">{formatCurrency(lifetimeCost)}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm text-gray-600">初期費用 (生体代+用品等)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(initialCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">年間費用 (食費+保険+美容等)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(annualCost)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            ※費用はあくまで目安です。病気やケガによる医療費は含まれていません。
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