# PetSim (ペットお迎えシミュレーター) - AI Agent Instructions

これは、自律型コーディングAIエージェント（Julesなど）向けのプロジェクト指示書です。本プロジェクトで作業を行う際は、以下のルールとプロジェクト構造を必ず遵守してください。

## プロジェクト概要

これから犬を飼いたいユーザーが、犬種ごとの特徴や「生涯にかかる概算費用」をひと目で比較・シミュレーションできる軽量SPAアプリケーションです。
各種オプションを選ぶことで、よりリアルな飼育コストを可視化できます。

## 技術スタック

*   **Framework**: React (TypeScript) + Vite
*   **Styling**: Tailwind CSS (v4)
*   **Charts**: Recharts
*   **Testing**: Playwright
*   **PWA**: vite-plugin-pwa

## ディレクトリ構成

*   `src/`: アプリケーションのソースコード
    *   `App.tsx`: 主要なコンポーネント、状態管理、データ（`DOG_BREEDS`など）、ロジックがすべて集約されている。
    *   `index.css`: Tailwind CSS のエントリーポイント。
    *   `main.tsx`: React のマウントポイント。
*   `test/`: Playwright を用いた E2E テストのコード。
*   `.github/workflows/deploy.yml`: GitHub Pages への自動デプロイ設定。

## 開発・コーディングのルール

### 1. 状態管理とURL同期 (`useUrlSyncedState`)
*   本アプリケーションは、バックエンドを持たない完全なSPAです。
*   ユーザーがシミュレーション結果をURLで共有できるように、すべての重要な状態（選択した犬種、オプションなど）はカスタムフック `useUrlSyncedState` を用いて管理されています。
*   `useUrlSyncedState` は状態を Base64 (`btoa`) でエンコードし、URLパラメータおよび LocalStorage と同期します。
*   **ルール**: 新しい設定項目や状態を追加する場合は、必ず `useUrlSyncedState` を使用し、`useState` を直接使用しないでください（UIの開閉状態など、共有不要なローカルUI状態は除く）。

### 2. データ構造 (`DOG_BREEDS`)
*   犬種のデータは `src/App.tsx` 内の `DOG_BREEDS` 定数配列で管理されています。
*   **ルール**: 新しい犬種を追加・編集する場合は、既存のデータ構造（`id`, `name`, `price`, `lifespan`, `monthlyFood`, `trimmingCost`, `description`, `size`, `tags`, `diseases`, `tips`）を崩さないようにしてください。プロパティ名に注意すること（例: `monthlyFoodCost` ではなく `monthlyFood`）。

### 3. モバイルファーストと UI/UX
*   本アプリはスマートフォンからのアクセスを主眼に置いています。
*   **ルール**: `<input>` や `<select>` のフォントサイズは `text-base` (16px) 以上に設定してください（iOS Safariでの自動ズームを防ぐため）。
*   設定項目が増えた場合は、画面が縦に長くなりすぎないように `<details>` 要素やアコーディオンUIを活用してレイアウトをコンパクトに保ってください。
*   ダークモード (`isDarkMode`) に対応しているため、新しい要素を追加する際は `dark:bg-*` や `dark:text-*` などの Tailwind クラスを適切に設定してください。

### 4. テストと検証 (Playwright)
*   新しい機能を追加したり、既存のロジック（クイズ機能やフィルター機能など）を変更した場合は、必ず対応する Playwright テストを `test/` ディレクトリに作成または更新してください。
*   **実行方法**: `npx playwright test`
*   **ルール**: コミット前に必ずテストを実行し、すべて Pass することを確認してください。

### 5. ビルドチェック
*   本番環境へのデプロイは GitHub Actions 経由で行われます。
*   **ルール**: `npm run build` および `npx tsc --noEmit` を実行し、TypeScriptの型エラーやビルドエラーが発生しないことを確認してからコミットしてください。

### 6. その他
*   金額を表示する際は、小数点以下を切り捨てるために `Math.floor()` を適用したフォーマット関数を使用してください。
*   外部依存（npmパッケージ）を追加する場合は、アプリケーションのバンドルサイズに与える影響を最小限に抑えるようにしてください。
