"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { bookingsAPI } from "@/lib/api";
import { Pagination } from "@/components/pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { Eye } from "lucide-react";
import { BookingDetailsModal } from "./booking-details-sheet";

type BookingRow = any;

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", page],
    queryFn: () => bookingsAPI.getAllBookings(page, 10),
  });

  const bookings = data?.data?.data || [];
  const meta = data?.data?.meta || { totalPages: 1 };

  const openDetails = (booking: BookingRow) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  return (
    <div className="md:ml-64 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Passenger Bookings</h1>
        <p className="text-gray-600 mt-1">Manage and track all passenger bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Dropoff</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={10} columns={7} />
                ) : bookings.length > 0 ? (
                  bookings.map((booking: any) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking.parentId.name}</TableCell>
                      <TableCell>{booking.childId.fullName}</TableCell>
                      <TableCell>{booking.pickupLocation}</TableCell>
                      <TableCell>{booking.dropOffLocation}</TableCell>
                      <TableCell>£{booking.totalPayment}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "inProgress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetails(booking)}
                          aria-label="View details"
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination currentPage={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
        </CardContent>
      </Card>

      <BookingDetailsModal
        open={detailsOpen}
        onOpenChange={(v) => {
          setDetailsOpen(v);
          if (!v) setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}
