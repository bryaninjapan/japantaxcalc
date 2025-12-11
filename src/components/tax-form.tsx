"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calculator, Info, Coins, TrendingUp, Users, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { TaxInput } from "@/lib/tax-calculator"

const formSchema = z.object({
  salaryRevenue: z.coerce.number().min(0),
  socialInsurancePaid: z.coerce.number().min(0),
  cryptoProfit: z.coerce.number().min(0),
  stockProfit: z.coerce.number().min(0),
  stockDividends: z.coerce.number().min(0),
  dependentsCount: z.coerce.number().min(0).int(),
  lifeInsuranceDeduction: z.coerce.number().min(0),
  idecoContribution: z.coerce.number().min(0),
  nisaCapitalGains: z.coerce.number().min(0),
  nisaDividends: z.coerce.number().min(0),
  isSingle: z.boolean().default(true), // Hidden or implied for now
})

type FormData = z.infer<typeof formSchema>

interface TaxFormProps {
  onCalculate: (data: TaxInput) => void
}

export function TaxForm({ onCalculate }: TaxFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salaryRevenue: 6000000,
      socialInsurancePaid: 900000,
      cryptoProfit: 0,
      stockProfit: 0,
      stockDividends: 0,
      dependentsCount: 0,
      lifeInsuranceDeduction: 0,
      idecoContribution: 0,
      nisaCapitalGains: 0,
      nisaDividends: 0,
      isSingle: true,
    },
  })

  const onSubmit = (data: FormData) => {
    onCalculate(data)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          入力フォーム
        </CardTitle>
        <CardDescription>
          源泉徴収票や取引報告書から数字を入力してください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <Tabs defaultValue="salary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="salary">給与・控除</TabsTrigger>
              <TabsTrigger value="invest">投資・副業</TabsTrigger>
              <TabsTrigger value="other">その他</TabsTrigger>
            </TabsList>

            {/* --- Salary Section --- */}
            <TabsContent value="salary" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salaryRevenue" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> 支払金額 (年収)
                  </Label>
                  <Input
                    id="salaryRevenue"
                    type="number"
                    placeholder="例: 6000000"
                    {...register("salaryRevenue")}
                  />
                  <p className="text-xs text-muted-foreground">源泉徴収票の「支払金額」</p>
                  {errors.salaryRevenue && (
                    <p className="text-sm text-red-500">{errors.salaryRevenue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialInsurancePaid" className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> 社会保険料等の金額
                  </Label>
                  <Input
                    id="socialInsurancePaid"
                    type="number"
                    placeholder="例: 900000"
                    {...register("socialInsurancePaid")}
                  />
                  <p className="text-xs text-muted-foreground">源泉徴収票の「社会保険料等の金額」</p>
                  {errors.socialInsurancePaid && (
                    <p className="text-sm text-red-500">{errors.socialInsurancePaid.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* --- Investment Section --- */}
            <TabsContent value="invest" className="space-y-4 pt-4">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                <Info className="mr-1 inline h-4 w-4" />
                暗号資産の損失は給与所得と相殺できません（0として計算されます）。
              </div>

              <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                 <h3 className="font-semibold text-sm flex items-center gap-2">
                   <Coins className="h-4 w-4" /> 暗号資産 (総合課税・雑所得)
                 </h3>
                 <div className="space-y-2">
                  <Label htmlFor="cryptoProfit" className="text-xs">
                     利益 (売却益 - 原価 - 経費)
                  </Label>
                  <Input
                    id="cryptoProfit"
                    type="number"
                    placeholder="例: 200000"
                    {...register("cryptoProfit")}
                  />
                  <p className="text-xs text-muted-foreground">マイナスは不可</p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                 <h3 className="font-semibold text-sm flex items-center gap-2">
                   <TrendingUp className="h-4 w-4" /> 特定口座 (申告分離課税)
                 </h3>
                 <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stockProfit" className="text-xs">譲渡益 (売却益)</Label>
                      <Input
                        id="stockProfit"
                        type="number"
                        placeholder="例: 50000"
                        {...register("stockProfit")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stockDividends" className="text-xs">配当金 (税引前)</Label>
                      <Input
                        id="stockDividends"
                        type="number"
                        placeholder="例: 10000"
                        {...register("stockDividends")}
                      />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-900/20">
                 <h3 className="font-semibold text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                   <TrendingUp className="h-4 w-4" /> 新NISA (非課税)
                 </h3>
                 <p className="text-xs text-muted-foreground mb-2">
                   ※税金はかかりませんが、節税額のシミュレーションに使用します。
                 </p>
                 <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nisaCapitalGains" className="text-xs">NISA 譲渡益</Label>
                      <Input
                        id="nisaCapitalGains"
                        type="number"
                        placeholder="例: 300000"
                        {...register("nisaCapitalGains")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nisaDividends" className="text-xs">NISA 配当金</Label>
                      <Input
                        id="nisaDividends"
                        type="number"
                        placeholder="例: 20000"
                        {...register("nisaDividends")}
                      />
                    </div>
                 </div>
              </div>
            </TabsContent>

            {/* --- Other Deductions --- */}
            <TabsContent value="other" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dependentsCount">扶養親族の数 (配偶者含む)</Label>
                  <Input
                    id="dependentsCount"
                    type="number"
                    placeholder="例: 1"
                    {...register("dependentsCount")}
                  />
                  <p className="text-xs text-muted-foreground">16歳未満は含みません</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceDeduction">生命保険料控除額 (合計)</Label>
                  <Input
                    id="lifeInsuranceDeduction"
                    type="number"
                    placeholder="例: 40000"
                    {...register("lifeInsuranceDeduction")}
                  />
                  <p className="text-xs text-muted-foreground">控除証明書の合計額 (支払額ではありません)</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 rounded-lg border p-4 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/20">
                 <h3 className="font-semibold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400">
                   <Users className="h-4 w-4" /> iDeCo (個人型確定拠出年金)
                 </h3>
                 <div className="space-y-2">
                   <Label htmlFor="idecoContribution" className="text-xs">年間掛金 (小規模企業共済等掛金控除)</Label>
                   <Input
                     id="idecoContribution"
                     type="number"
                     placeholder="例: 276000"
                     {...register("idecoContribution")}
                   />
                   <p className="text-xs text-muted-foreground">全額が所得控除になります。</p>
                 </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full text-lg">
            税額を計算する
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

