"use client"

import * as React from "react"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookingsAPI } from "@/lib/api"
import { toast } from "sonner"
import type { Booking } from "@/lib/types"

export function BookingEditModal({
  open,
  onOpenChange,
  booking,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  booking: Booking | null
}) {
  const qc = useQueryClient()
  const [pickupLocation, setPickupLocation] = React.useState("")
  const [dropOffLocation, setDropOffLocation] = React.useState("")
  const [dropOffTime, setDropOffTime] = React.useState("")
  const [totalPayment, setTotalPayment] = React.useState("")
  const [status, setStatus] = React.useState<string>("")

  React.useEffect(() => {
    if (!open || !booking) return
    setPickupLocation(booking.pickupLocation || "")
    setDropOffLocation(booking.dropOffLocation || "")
    setDropOffTime(booking.dropOffTime || "")
    setTotalPayment(String(booking.totalPayment ?? ""))
    setStatus(booking.status || "inProgress")
  }, [open, booking])

  const mutation = useMutation({
    mutationFn: (data: any) => bookingsAPI.updateBooking(booking!._id, data),
    onSuccess: () => {
      toast.success("Booking updated")
      qc.invalidateQueries({ queryKey: ["bookings"] })
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to update booking"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return
    mutation.mutate({
      pickupLocation,
      dropOffLocation,
      dropOffTime,
      totalPayment: parseFloat(totalPayment) || 0,
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>Update the booking details below.</DialogDescription>
        </DialogHeader>
        {!booking ? (
          <div className="py-4 text-sm text-muted-foreground">No booking selected.</div>
        ) : (
          <form id="booking-edit-form" onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Pickup Location</Label>
              <Input
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Pickup address"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Drop-off Location</Label>
              <Input
                value={dropOffLocation}
                onChange={(e) => setDropOffLocation(e.target.value)}
                placeholder="Drop-off address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Drop-off Time</Label>
                <Input
                  value={dropOffTime}
                  onChange={(e) => setDropOffTime(e.target.value)}
                  placeholder="e.g. 09:00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Total Payment (£)</Label>
                <Input
                  type="number"
                  value={totalPayment}
                  onChange={(e) => setTotalPayment(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        )}
        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="booking-edit-form"
            disabled={mutation.isPending || !booking}
          >
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
