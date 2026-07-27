"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ApplicationPoint = {
  day: string
  applications: number
  reviewed: number
}

const areaConfig = {
  applications: { label: "Applications", color: "var(--chart-1)" },
  reviewed: { label: "Reviewed", color: "var(--chart-2)" },
} satisfies ChartConfig

export function RecruitmentAreaChart({
  data,
  range,
  onRangeChange,
}: {
  data: ApplicationPoint[]
  range: string
  onRangeChange: (range: "7" | "30" | "90") => void
}) {
  return (
    <Card className="career-shadcn-chart">
      <CardHeader className="flex items-center gap-3 border-b sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Application summary</CardTitle>
          <CardDescription>Applicant and review activity</CardDescription>
        </div>
        <Select value={range} onValueChange={(value) => onRangeChange(value as "7" | "30" | "90")}>
          <SelectTrigger className="w-[150px]" aria-label="Select reporting period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-5 sm:px-6">
        <ChartContainer config={areaConfig} className="h-[280px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="careerApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-applications)" stopOpacity={0.42} />
                <stop offset="95%" stopColor="var(--color-applications)" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="careerReviewed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-reviewed)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-reviewed)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="applications" type="natural" fill="url(#careerApplications)" stroke="var(--color-applications)" strokeWidth={2.5} />
            <Area dataKey="reviewed" type="natural" fill="url(#careerReviewed)" stroke="var(--color-reviewed)" strokeWidth={2.5} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const statusConfig = {
  value: { label: "Applications" },
  reviewed: { label: "Reviewed", color: "var(--chart-1)" },
  interview: { label: "Interview", color: "var(--chart-2)" },
  shortlisted: { label: "Shortlisted", color: "var(--chart-3)" },
  pending: { label: "Pending", color: "var(--chart-4)" },
} satisfies ChartConfig

export function ApplicationStatusDonut({
  reviewed,
  interviews,
  shortlisted,
  pending,
}: {
  reviewed: number
  interviews: number
  shortlisted: number
  pending: number
}) {
  const chartData = React.useMemo(
    () => [
      { status: "reviewed", value: reviewed, fill: "var(--color-reviewed)" },
      { status: "interview", value: interviews, fill: "var(--color-interview)" },
      { status: "shortlisted", value: shortlisted, fill: "var(--color-shortlisted)" },
      { status: "pending", value: pending, fill: "var(--color-pending)" },
    ],
    [reviewed, interviews, shortlisted, pending]
  )
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="career-shadcn-chart flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Application status</CardTitle>
        <CardDescription>Current hiring pipeline</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-[245px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="status" innerRadius={68} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {total.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">
                          Applications
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="career-chart-legend">
          {chartData.map((item) => (
            <div key={item.status}>
              <i style={{ background: item.fill }} />
              <span>{statusConfig[item.status as keyof typeof statusConfig].label}</span>
              <b>{item.value}</b>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Live recruitment pipeline <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="text-muted-foreground">Updated from current applications</div>
      </CardFooter>
    </Card>
  )
}
