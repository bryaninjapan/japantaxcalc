"use client"

import { TaxResult } from "@/lib/tax-calculator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Wallet, PiggyBank, ArrowUpRight, TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"

interface TaxDashboardProps {
  result: TaxResult | null
  originalRevenue: number // To calculate take home percentage
  socialInsurance: number
}

export function TaxDashboard({ result, originalRevenue, socialInsurance }: TaxDashboardProps) {
  if (!result) {
    return (
      <Card className="h-full min-h-[400px] flex items-center justify-center bg-muted/20 border-dashed">
        <div className="text-center text-muted-foreground">
          <p>左側のフォームに入力して</p>
          <p>「税額を計算する」を押してください</p>
        </div>
      </Card>
    );
  }

  // Data for Pie Chart
  // Total Revenue vs (Tax + Social Insurance) vs Take Home
  const totalTax = result.totalTax
  const takeHome = Math.max(0, originalRevenue - totalTax - socialInsurance)
  
  const chartData = [
    { name: "手取り (Take Home)", value: takeHome, color: "#10b981" }, // emerald-500
    { name: "社会保険料", value: socialInsurance, color: "#3b82f6" }, // blue-500
    { name: "税金 (所得税+住民税)", value: totalTax, color: "#ef4444" }, // red-500
  ]

  // Marginal Rate Estimation (Aggregate)
  const getMarginalRate = (taxable: number) => {
    if (taxable <= 1950000) return 5;
    if (taxable <= 3300000) return 10;
    if (taxable <= 6950000) return 20;
    if (taxable <= 8999000) return 23;
    if (taxable <= 17999000) return 33;
    if (taxable <= 39999000) return 40;
    return 45;
  }
  
  const marginalRate = getMarginalRate(result.aggregateTaxableIncome);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              年間税額合計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{result.totalTax.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              実効税率: {result.effectiveTaxRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              所得税 (国税)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{result.totalNationalIncomeTax.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              復興特別所得税含む
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              住民税 (地方税)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{result.totalResidentTax.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              均等割 + 所得割
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Tax Breakdown & Furusato */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" /> ふるさと納税 上限額目安
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ¥{result.furusatoLimit.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    自己負担2,000円で寄付できる上限額の目安です。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(result.idecoTaxSavings > 0 || result.nisaTaxSavings > 0) && (
             <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-900/10">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                   <TrendingUp className="h-5 w-5" /> 節税効果 (Estimated Savings)
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {result.idecoTaxSavings > 0 && (
                   <div className="flex justify-between items-center">
                     <span className="text-sm">iDeCoによる節税額</span>
                     <span className="font-bold text-emerald-600">¥{result.idecoTaxSavings.toLocaleString()}</span>
                   </div>
                 )}
                 {result.nisaTaxSavings > 0 && (
                   <div className="flex justify-between items-center">
                     <span className="text-sm">NISAによる非課税メリット</span>
                     <span className="font-bold text-emerald-600">¥{result.nisaTaxSavings.toLocaleString()}</span>
                   </div>
                 )}
                 <Separator className="bg-emerald-200 dark:bg-emerald-800"/>
                 <div className="flex justify-between items-center pt-1">
                   <span className="font-semibold">合計節税額</span>
                   <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
                     ¥{(result.idecoTaxSavings + result.nisaTaxSavings).toLocaleString()}
                   </span>
                 </div>
               </CardContent>
             </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" /> 手取りシミュレーション
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 <div className="flex justify-between border-b pb-2">
                   <span>総収入 (額面)</span>
                   <span className="font-semibold">¥{originalRevenue.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-red-500">
                   <span>▲ 税金合計</span>
                   <span>-¥{totalTax.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-blue-500 border-b pb-2">
                   <span>▲ 社会保険料</span>
                   <span>-¥{socialInsurance.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-xl font-bold text-emerald-600 dark:text-emerald-400 pt-2">
                   <span>手取り額</span>
                   <span>¥{takeHome.toLocaleString()}</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Visualization & Insights */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>収支の内訳</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                 <div className="flex items-center justify-between text-sm">
                   <span className="flex items-center gap-2">
                     <ArrowUpRight className="h-4 w-4" /> 限界税率 (所得税)
                   </span>
                   <Badge variant={marginalRate >= 33 ? "destructive" : "secondary"}>
                     {marginalRate}%
                   </Badge>
                 </div>
                 <p className="text-xs text-muted-foreground">
                   あなたの総合課税所得に対する最高税率です。
                   {marginalRate >= 33 && " 税率が高くなっています。iDeCo等の活用を検討してください。"}
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Warnings / Tips */}
      {result.incomeTaxAggregate > 0 && result.incomeTaxSeparate > 0 && (
         <Alert>
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>申告分離課税の注意点</AlertTitle>
           <AlertDescription>
             株式等の利益は申告分離課税として計算されています。
             原則として確定申告が必要ですが、源泉徴収ありの特定口座の場合は申告不要制度も選べます。
             申告することで国民健康保険料等が上がる可能性があるためご注意ください。
           </AlertDescription>
         </Alert>
      )}
    </div>
  )
}

