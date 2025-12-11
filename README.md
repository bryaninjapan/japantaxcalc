# Japan Tax Calc 2025 (令和7年版 源泉徴収・確定申告シミュレーター)

A modern, privacy-focused tax calculator for Japanese residents, specifically designed for salary earners with side income (Cryptocurrency, Stocks) and tax-saving investments (NISA, iDeCo).

Build with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)

## 🌟 特徴 (Features)

This application estimates Income Tax (所得税) and Residence Tax (住民税) based on **2025 (Reiwa 7)** tax laws.

*   **📊 複合的な所得計算 (Complex Income Calculation)**
    *   **給与所得**: 令和7年の給与所得控除を適用。
    *   **暗号資産 (Crypto)**: 雑所得（総合課税）として計算。*損益通算ができない仕様も正確に反映（給与所得との相殺不可）。*
    *   **株式投資**: 特定口座（源泉徴収あり/なし）の申告分離課税（15.315% + 5%）に対応。

*   **💰 節税シミュレーション (Tax Savings)**
    *   **iDeCo**: 小規模企業共済等掛金控除による節税額（所得税+住民税）を即時計算。
    *   **新NISA**: 非課税メリットの可視化。
    *   **ふるさと納税**: 寄付上限額（自己負担2,000円）の目安を、投資収益を含めた課税所得から算出。

*   **📉 詳細な分析 (Detailed Analytics)**
    *   **限界税率 (Marginal Tax Rate)**: 次の1円稼いだ時にかかる税率を表示。「税率の崖」を可視化。
    *   **手取り推移**: 額面から税金・社会保険料を引いた実質手取りをグラフ化。

*   **⚡ 定額減税対応 (Fixed Tax Reduction)**
    *   2024年（令和6年）実施の定額減税（本人4万円〜）ロジックを搭載（2025年の実施状況に応じて調整可能）。

## 🛠️ 技術スタック (Tech Stack)

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
*   **Validation**: React Hook Form + Zod
*   **Charts**: Recharts
*   **Icons**: Lucide React

## 🚀 始め方 (Getting Started)

### Prerequisites

*   Node.js 18.17 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/bryaninjapan/japantaxcalc.git

# Navigate to directory
cd japantaxcalc

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚠️ 免責事項 (Disclaimer)

本ツールによる計算結果はあくまで概算（シミュレーション）であり、正確な税額を保証するものではありません。
実際の申告にあたっては、必ず**税理士 (Tax Accountant)** または **所轄の税務署** にご確認ください。

This tool provides estimates only. Tax laws are subject to change. Please consult a certified tax professional for official filing.

## 📄 License

MIT License
