"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Route as RouteIcon, Clock, School, User, Bus, Phone } from "lucide-react";

type Stop = {
  _id: string;
  name: string;
  arrivalTime?: string;
  order?: number;
  location?: { type: "Point"; coordinates: [number, number] };
};

type Booking = {
  _id: string;
  onTime?: boolean;
  parentId: { _id: string; name: string; username?: string };
  childId: { _id: string; fullName: string; schoolName?: string };
  dateAndTime?: { date: string; time: string; type: "pickup" | "dropoff" | "both" }[];
  routeId?: {
    _id: string;
    routeType?: string;
    routeName?: string;
    routeFare?: number;
    routeTime?: string;
    driverId?: string;
    startLocation?: { name?: string };
    endLocation?: { name?: string };
    stops?: Stop[];
  };
  pickupLocation?: string;
  dropOffLocation?: string;
  dropOffTime?: string;
  totalPayment?: number;
  credit?: number;
  isApprove?: boolean;
  stopAges?: string[];
  newRoute?: boolean;
  status: "completed" | "inProgress" | "pending" | string;
  createdAt?: string;
  updatedAt?: string;
};

function formatMoney(v?: number) {
  if (v == null) return "£0";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(v);
}

function prettyDate(d?: string) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d as string;
  }
}

function statusBadgeClass(status: Booking["status"]) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "inProgress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export function BookingDetailsModal({
  open,
  onOpenChange,
  booking,
  onCancelBooking,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  onCancelBooking?: (id: string) => Promise<void> | void;
}) {
  const dtPickup = booking?.dateAndTime?.find((d) => d.type === "pickup");
  const dtDrop = booking?.dateAndTime?.find((d) => d.type === "dropoff");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] p-0 overflow-hidden"
        aria-describedby={undefined}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl">Booking Detail</DialogTitle>
            <DialogDescription className="text-sm">
              View complete ride information, including passenger, pickup & drop-off, driver, and route details.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="px-6 pt-4 pb-12 max-h-[calc(85vh-7.5rem)]">
          {!booking ? (
            <div className="py-8 text-sm text-muted-foreground">No booking selected.</div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.onTime && <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-xs">On time</span>}
                </div>
                <div className="text-xs text-muted-foreground">Created {prettyDate(booking.createdAt)}</div>
              </div>

              <Separator />

              {/* Booking info */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={<Clock className="h-4 w-4" />} label="Pickup" value={`${prettyDate(dtPickup?.date)} • ${dtPickup?.time ?? "-"}`} />
                <InfoRow icon={<Clock className="h-4 w-4" />} label="Drop-off" value={`${prettyDate(dtDrop?.date)} • ${dtDrop?.time ?? booking?.dropOffTime ?? "-"}`} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Pickup Location" value={booking?.pickupLocation} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Drop-off Location" value={booking?.dropOffLocation} />
                <InfoRow icon={<RouteIcon className="h-4 w-4" />} label="Route" value={booking?.routeId?.routeName} />
                <InfoRow icon={<RouteIcon className="h-4 w-4" />} label="Fare" value={formatMoney(booking?.totalPayment)} />
              </section>

              <Separator />

              {/* Passenger */}
              <section className="space-y-3">
                <h3 className="font-semibold">Passenger Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<User className="h-4 w-4" />} label="Parent/Guardian" value={booking?.parentId?.name} />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Username" value={booking?.parentId?.username} />
                  <InfoRow icon={<User className="h-4 w-4" />} label="Child" value={booking?.childId?.fullName} />
                  <InfoRow icon={<School className="h-4 w-4" />} label="School" value={booking?.childId?.schoolName} />
                </div>
              </section>

              <Separator />

              {/* Route */}
              <section className="space-y-3">
                <h3 className="font-semibold">Route</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<Bus className="h-4 w-4" />} label="Route Type" value={booking?.routeId?.routeType} />
                  <InfoRow icon={<Clock className="h-4 w-4" />} label="Route Time" value={booking?.routeId?.routeTime} />
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="Start" value={booking?.routeId?.startLocation?.name} />
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="Destination" value={booking?.routeId?.endLocation?.name} />
                </div>

                {!!booking?.routeId?.stops?.length && (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium mb-2">Stops</p>
                    <ul className="text-sm space-y-1">
                      {booking.routeId.stops
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((s) => (
                          <li key={s._id} className="flex justify-between gap-3">
                            <span className="truncate">{s.order ? `${s.order}. ` : ""}{s.name}</span>
                            <span className="text-muted-foreground">{s.arrivalTime ?? "-"}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </section>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated {prettyDate(booking?.updatedAt)}</span>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 bg-background border-t">
          <DialogFooter className="p-4">
            <div className="ml-auto flex items-center gap-2">
              {!!booking && onCancelBooking && (
                <Button variant="destructive" onClick={() => onCancelBooking(booking._id)}>
                  Cancel Booking
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-medium">{value ?? "-"}</div>
    </div>
  );
}
