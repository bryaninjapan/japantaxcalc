"use client"

import { useState } from "react"
import { calculateTax, TaxInput, TaxResult } from "@/lib/tax-calculator"
import { TaxForm } from "@/components/tax-form"
import { TaxDashboard } from "@/components/tax-dashboard"
import { FileSpreadsheet } from "lucide-react"

export default function Home() {
  const [result, setResult] = useState<TaxResult | null>(null)
  const [formData, setFormData] = useState<TaxInput | null>(null)

  const handleCalculate = (data: TaxInput) => {
    setFormData(data)
    const res = calculateTax(data)
    setResult(res)
    
    // Smooth scroll to results on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  // Calculate total revenue for the dashboard
  const totalRevenue = formData 
    ? formData.salaryRevenue + formData.cryptoProfit + formData.stockProfit + formData.stockDividends + (formData.nisaCapitalGains || 0) + (formData.nisaDividends || 0)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Japan Tax Calc 2025
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              令和7年分 所得税・住民税シミュレーター (兼業投資家向け)
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Input Form (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24">
              <TaxForm onCalculate={handleCalculate} />
            </div>
          </div>

          {/* Right Column: Dashboard (8 cols) */}
          <div id="results-section" className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">計算結果</h2>
                {result && (
                  <span className="text-sm text-muted-foreground">
                    ※ あくまで概算です。正確な税額は税務署または税理士にご確認ください。
                  </span>
                )}
              </div>
              
              <TaxDashboard 
                result={result} 
                originalRevenue={totalRevenue}
                socialInsurance={formData?.socialInsurancePaid || 0}
              />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
