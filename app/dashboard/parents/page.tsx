"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { parentsAPI, bookingsAPI } from "@/lib/api"
import { Pagination } from "@/components/pagination"
import { TableSkeleton } from "@/components/table-skeleton"
import { Eye, Search, ChevronDown } from "lucide-react"
import Link from "next/link"
import type { Parent, Booking } from "@/lib/types"

const PAGE_SIZE = 10

export default function ParentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("revenue")
  const [councilFilter, setCouncilFilter] = useState("all")

  // Backend returns flat array — no pagination meta
  const { data: parentsRes, isLoading: parentsLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: () => parentsAPI.getAllParents(1, 1000),
  })

  // Fetch all bookings to derive per-parent totals
  const { data: bookingsRes } = useQuery({
    queryKey: ["bookings", 1, 1000],
    queryFn: () => bookingsAPI.getAllBookings(1, 1000),
  })

  const allParents: Parent[] = parentsRes?.data?.data ?? parentsRes?.data ?? []
  const allBookings: Booking[] = bookingsRes?.data?.data ?? []

  // Build a map: parentId -> booking count
  const bookingCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    allBookings.forEach((b) => {
      const pid = b.parentId?._id
      if (pid) map[pid] = (map[pid] ?? 0) + 1
    })
    return map
  }, [allBookings])

  // Enrich parents with derived fields
  const enriched = useMemo(() => {
    return allParents.map((p) => ({
      ...p,
      totalBookings: bookingCountMap[p._id] ?? 0,
      childrenCount: p.parentSetup?.childProfiles?.length ?? 0,
      // Council member: treat parentSetupCompleted as a proxy (no real field)
      councilMember: p.parentSetupCompleted ?? false,
    }))
  }, [allParents, bookingCountMap])

  // Filter + sort
  const filtered = useMemo(() => {
    let list = enriched
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.location ?? "").toLowerCase().includes(q)
      )
    }
    if (councilFilter === "yes") list = list.filter((p) => p.councilMember)
    if (councilFilter === "no") list = list.filter((p) => !p.councilMember)

    if (sortBy === "revenue") list = [...list].sort((a, b) => b.totalBookings - a.totalBookings)
    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === "bookings") list = [...list].sort((a, b) => b.totalBookings - a.totalBookings)

    return list
  }, [enriched, search, councilFilter, sortBy])

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleSort = (v: string) => { setSortBy(v); setPage(1) }
  const handleCouncil = (v: string) => { setCouncilFilter(v); setPage(1) }

  const padNum = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parents List</h1>
        <p className="text-gray-500 mt-1">
          View Parents And Their Details Including Children Signed Up To The App
        </p>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 border border-gray-200 rounded-full bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="revenue">Sort by: Revenue</option>
              <option value="name">Sort by: Name</option>
              <option value="bookings">Sort by: Bookings</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Council Member filter */}
          <div className="relative">
            <select
              value={councilFilter}
              onChange={(e) => handleCouncil(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 border border-gray-200 rounded-full bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="all">Council Member: All</option>
              <option value="yes">Council Member: Yes</option>
              <option value="no">Council Member: No</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium text-sm">Parent Name</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Contact Number</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Emergency Number</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Address</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Council Member</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Total Bookings</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Children</TableHead>
                  <TableHead className="text-gray-500 font-medium text-sm">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentsLoading ? (
                  <TableSkeleton rows={10} columns={8} />
                ) : paginated.length > 0 ? (
                  paginated.map((parent: any) => (
                    <TableRow
                      key={parent._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="font-semibold text-gray-900">
                        {parent.name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {parent.phone ?? parent.parentSetup?.phoneNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {parent.emergencyContact
                          ? String(parent.emergencyContact)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-gray-700 max-w-44 truncate">
                        {parent.location ?? "—"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {parent.councilMember ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">
                        {padNum(parent.totalBookings)}
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">
                        {padNum(parent.childrenCount)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/parents/${parent._id}`}>
                          <Button
                            size="sm"
                            className="bg-[#8E97FD] hover:bg-[#7D86E0] text-white font-semibold rounded-full h-8 px-5 text-sm"
                          >
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-gray-400"
                    >
                      No parents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
