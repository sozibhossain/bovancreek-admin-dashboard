"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { bookingsAPI } from "@/lib/api"
import { Pagination } from "@/components/pagination"
import { TableSkeleton } from "@/components/table-skeleton"
import { BookingDetailsModal } from "./booking-details-sheet"
import { BookingEditModal } from "./booking-edit-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Trash2 } from "lucide-react"
import type { Booking } from "@/lib/types"

function StatusBadge({ status, isApprove }: { status: string; isApprove: boolean }) {
  if (status === "completed")
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completed</span>
  if (status === "cancelled")
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Cancelled</span>
  if (isApprove)
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Approved</span>
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
}

function prettyDate(d?: string) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return d
  }
}

export default function BookingsPage() {
  const [page, setPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", page],
    queryFn: () => bookingsAPI.getAllBookings(page, 10),
  })

  const bookings: Booking[] = data?.data?.data || []
  const meta = data?.data?.meta || { totalPages: 1 }

  const approveMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      bookingsAPI.updateBookingStatus(id, approve),
    onSuccess: (_, { approve }) => {
      toast.success(approve ? "Booking approved" : "Booking unapproved")
      qc.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: () => toast.error("Failed to update booking status"),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsAPI.cancelBooking(id),
    onSuccess: () => {
      toast.success("Booking cancelled")
      qc.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: () => toast.error("Failed to cancel booking"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookingsAPI.deleteBooking(id),
    onSuccess: () => {
      toast.success("Booking deleted")
      qc.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: () => toast.error("Failed to delete booking"),
  })

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailsOpen(true)
  }

  const openEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Passenger Bookings</h1>
        <p className="text-gray-500 mt-1">Manage and track all ride bookings made by passengers.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-gray-900">All Bookings</CardTitle>
            <div className="text-sm text-gray-500">
              {meta?.total ? `${meta.total} total` : `${bookings.length} shown`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Parent</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Child</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Pickup</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Drop-off</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Amount</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={10} columns={8} />
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow key={booking._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-semibold text-gray-900">
                        {booking.parentId?.name || "—"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {booking.childId?.fullName || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-36 truncate">
                        {booking.pickupLocation || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-36 truncate">
                        {booking.dropOffLocation || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {booking.dateAndTime?.[0]
                          ? `${prettyDate(booking.dateAndTime[0].date)} ${booking.dateAndTime[0].time}`
                          : prettyDate(booking.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        £{booking.totalPayment ?? 0}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} isApprove={booking.isApprove} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent h-7 px-2"
                            onClick={() => openDetails(booking)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent h-7 px-2"
                            onClick={() => openEdit(booking)}
                          >
                            Edit
                          </Button>
                          {!booking.isApprove && booking.status === "inProgress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-green-200 text-green-600 hover:bg-green-50 bg-transparent h-7 px-2"
                              onClick={() => approveMutation.mutate({ id: booking._id, approve: true })}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle2 size={12} className="mr-1" />
                              Approve
                            </Button>
                          )}
                          {booking.status === "inProgress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent h-7 px-2"
                              onClick={() => cancelMutation.mutate(booking._id)}
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle size={12} className="mr-1" />
                              Cancel
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-red-200 text-red-500 hover:bg-red-50 bg-transparent h-7 px-2"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this booking. Are you sure?
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-3 mt-4">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteMutation.mutate(booking._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                      No bookings found
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

      <BookingDetailsModal
        open={detailsOpen}
        onOpenChange={(v) => { setDetailsOpen(v); if (!v) setSelectedBooking(null) }}
        booking={selectedBooking}
        onCancelBooking={(id) => { cancelMutation.mutate(id); setDetailsOpen(false) }}
      />

      <BookingEditModal
        open={editOpen}
        onOpenChange={(v) => { setEditOpen(v); if (!v) setSelectedBooking(null) }}
        booking={selectedBooking}
      />
    </div>
  )
}
