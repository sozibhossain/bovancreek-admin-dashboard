"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Clock, Navigation, Bus } from "lucide-react"
import type { Route } from "@/lib/types"

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-sm">{value ?? "—"}</p>
    </div>
  )
}

export function RouteDetailsModal({
  open,
  onOpenChange,
  route,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  route: Route | null
}) {
  if (!route) return null

  const driverName = typeof route.driverId === "object" ? (route.driverId as any)?.name : "—"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <DialogHeader>
            <DialogTitle className="text-xl">{route.routeName}</DialogTitle>
            <DialogDescription className="flex items-center gap-3 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                route.routeType === "pickup" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
              }`}>
                {route.routeType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                route.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {route.isActive ? "Active" : "Inactive"}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[65vh]">
          <div className="p-6 space-y-6">
            {/* Route info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Row label="Route Time" value={route.routeTime} />
              <Row label="Fare" value={`£${route.routeFare ?? 0}`} />
              <Row label="Driver" value={driverName} />
              <Row label="Start" value={route.startLocation?.name} />
              <Row label="End" value={route.endLocation?.name} />
              <Row label="Total Stops" value={route.stops?.length ?? 0} />
            </div>

            <Separator />

            {/* Stops timeline */}
            {route.stops?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Route Stops
                </h3>
                <div className="space-y-2">
                  {[...route.stops]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((stop, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full border-2 border-primary bg-white flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {stop.order ?? i + 1}
                          </div>
                          {i < route.stops.length - 1 && (
                            <div className="w-0.5 h-4 bg-primary/30 my-1" />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-semibold">{stop.name}</p>
                          {stop.arrivalTime && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock size={11} /> {stop.arrivalTime}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
