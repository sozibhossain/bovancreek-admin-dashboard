"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { paymentsAPI } from "@/lib/api"
import { Pagination } from "@/components/pagination"
import { TableSkeleton } from "@/components/table-skeleton"
import { DollarSign, CreditCard, TrendingUp, Clock } from "lucide-react"
import type { Payment } from "@/lib/types"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function prettyDate(d?: string) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }
  catch { return d }
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["payments", page, status],
    queryFn: () => paymentsAPI.getAllPayments(page, 10, status),
  })

  const payments: Payment[] = data?.data?.payments ?? data?.data?.data ?? []
  const meta = data?.data?.meta || { totalPages: 1, total: 0 }

  const totalCompleted = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (p.amount ?? 0), 0)

  const totalPending = payments.filter((p) => p.status === "pending").length
  const totalFailed = payments.filter((p) => p.status === "failed").length

  const stats = [
    { label: "Total Revenue", value: `£${totalCompleted.toFixed(2)}`, icon: DollarSign, color: "bg-green-500" },
    { label: "Pending Payments", value: totalPending, icon: Clock, color: "bg-yellow-500" },
    { label: "Failed Payments", value: totalFailed, icon: CreditCard, color: "bg-red-500" },
    { label: "Total Transactions", value: meta.total ?? payments.length, icon: TrendingUp, color: "bg-blue-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-500 mt-1">Track and manage all ride payments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{s.value}</p>
                  </div>
                  <div className={`${s.color} p-3 rounded-xl text-white shrink-0`}>
                    <Icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-gray-900">Payment Transactions</CardTitle>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="px-4 py-2 border border-gray-200 rounded-full bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Order ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">User</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Amount</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Currency</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Method</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Capture ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={10} columns={8} />
                ) : payments.length > 0 ? (
                  payments.map((payment) => {
                    const userName = typeof payment.userId === "object" && payment.userId
                      ? (payment.userId as any).name
                      : typeof payment.userId === "string"
                      ? payment.userId.substring(0, 8) + "…"
                      : "—"
                    return (
                      <TableRow key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-mono text-xs text-gray-700">
                          {payment.orderId?.substring(0, 12)}…
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{userName}</TableCell>
                        <TableCell className="font-bold text-gray-900">
                          £{payment.amount?.toFixed(2) ?? "0.00"}
                        </TableCell>
                        <TableCell className="text-gray-600 uppercase text-xs">{payment.currency}</TableCell>
                        <TableCell className="text-gray-600">{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-gray-600 whitespace-nowrap text-xs">
                          {prettyDate(payment.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">
                          {payment.captureId ? payment.captureId.substring(0, 10) + "…" : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
