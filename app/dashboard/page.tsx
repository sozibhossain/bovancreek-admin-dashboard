"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Calendar, DollarSign, TrendingUp } from "lucide-react"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { bookingsAPI, vehiclesAPI, parentsAPI, paymentsAPI, driversAPI } from "@/lib/api"

const chartData = [
  { day: "Mon", bookings: 12, revenue: 800 },
  { day: "Tue", bookings: 19, revenue: 1200 },
  { day: "Wed", bookings: 15, revenue: 900 },
  { day: "Thu", bookings: 25, revenue: 1500 },
  { day: "Fri", bookings: 22, revenue: 1400 },
  { day: "Sat", bookings: 8, revenue: 500 },
  { day: "Sun", bookings: 5, revenue: 300 },
]

export default function DashboardPage() {
  const { data: bookings } = useQuery({
    queryKey: ["bookings", 1, 100],
    queryFn: () => bookingsAPI.getAllBookings(1, 100),
  })

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", 1, 100],
    queryFn: () => vehiclesAPI.getAllVehicles(1, 100),
  })

  const { data: parents } = useQuery({
    queryKey: ["parents", 1, 100],
    queryFn: () => parentsAPI.getAllParents(1, 100),
  })

  const { data: payments } = useQuery({
    queryKey: ["payments", 1, 100, ""],
    queryFn: () => paymentsAPI.getAllPayments(1, 100, ""),
  })

  const { data: drivers } = useQuery({
    queryKey: ["drivers", 1, 100],
    queryFn: () => driversAPI.getAllDrivers(1, 100),
  })

  const allBookings: any[] = bookings?.data?.data || []
  const allVehicles: any[] = vehicles?.data?.data || []
  const allParents: any[] = parents?.data?.data || []
  const allPayments: any[] = payments?.data?.payments || payments?.data?.data || []
  const allDrivers: any[] = drivers?.data?.data || []

  const totalRevenue = allPayments
    .filter((p) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

  const stats = [
    {
      label: "Total Bookings",
      value: bookings?.data?.meta?.total ?? allBookings.length,
      icon: Calendar,
      color: "bg-blue-500",
      sub: `${allBookings.filter((b) => b.status === "inProgress").length} in progress`,
    },
    {
      label: "Total Vehicles",
      value: vehicles?.data?.meta?.total ?? allVehicles.length,
      icon: Car,
      color: "bg-green-500",
      sub: `${allVehicles.length} registered`,
    },
    {
      label: "Active Drivers",
      value: drivers?.data?.meta?.total ?? allDrivers.length,
      icon: Users,
      color: "bg-purple-500",
      sub: `${allDrivers.filter((d: any) => d.status !== "deactivate").length} active`,
    },
    {
      label: "Total Parents",
      value: parents?.data?.meta?.total ?? allParents.length,
      icon: Users,
      color: "bg-orange-500",
      sub: `${allParents.length} registered`,
    },
    {
      label: "Total Revenue",
      value: `£${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      sub: `${allPayments.filter((p) => p.status === "pending").length} pending`,
    },
    {
      label: "Active Routes",
      value: "—",
      icon: TrendingUp,
      color: "bg-pink-500",
      sub: "via routes page",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back to BPOOL Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow col-span-1 xl:col-span-2">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl text-white shrink-0`}>
                    <Icon size={22} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-base">Bookings over Time</CardTitle>
            <p className="text-xs text-gray-500">Last 7 Days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#aaa" tick={{ fontSize: 12 }} />
                <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="bookings" stroke="#6b7fdb" strokeWidth={2} dot={{ fill: "#6b7fdb", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-base">Revenue over Time</CardTitle>
            <p className="text-xs text-gray-500">Last 7 Days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#aaa" tick={{ fontSize: 12 }} />
                <YAxis stroke="#aaa" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#d084c1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-base">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs uppercase">Parent</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs uppercase">Child</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs uppercase">Pickup</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs uppercase">Drop-off</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs uppercase">Amount</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.slice(0, 5).map((b: any) => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{b.parentId?.name || "—"}</td>
                    <td className="py-2 px-3 text-gray-600">{b.childId?.fullName || "—"}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-40 truncate">{b.pickupLocation || "—"}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-40 truncate">{b.dropOffLocation || "—"}</td>
                    <td className="py-2 px-3 font-semibold text-gray-900">£{b.totalPayment ?? 0}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "completed" ? "bg-green-100 text-green-700"
                        : b.status === "cancelled" ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {allBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400 text-sm">No bookings yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
