"use client"

import * as React from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { routesAPI, driversAPI } from "@/lib/api"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import type { Route } from "@/lib/types"

type Stop = { name: string; arrivalTime: string; order: number; lat: string; lng: string }

const emptyStop = (): Stop => ({ name: "", arrivalTime: "", order: 0, lat: "", lng: "" })

export function RouteFormModal({
  open,
  onOpenChange,
  mode,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: "create" | "edit"
  initial?: Route | null
}) {
  const qc = useQueryClient()

  const [routeName, setRouteName] = React.useState("")
  const [routeType, setRouteType] = React.useState<"pickup" | "dropoff">("pickup")
  const [routeFare, setRouteFare] = React.useState("")
  const [routeTime, setRouteTime] = React.useState("")
  const [driverId, setDriverId] = React.useState("")
  const [startName, setStartName] = React.useState("")
  const [startLat, setStartLat] = React.useState("")
  const [startLng, setStartLng] = React.useState("")
  const [endName, setEndName] = React.useState("")
  const [endLat, setEndLat] = React.useState("")
  const [endLng, setEndLng] = React.useState("")
  const [stops, setStops] = React.useState<Stop[]>([emptyStop()])

  const { data: driversRes } = useQuery({
    queryKey: ["drivers", 1, 200],
    queryFn: () => driversAPI.getAllDrivers(1, 200),
    enabled: open,
  })
  const drivers: any[] = driversRes?.data?.data ?? []

  React.useEffect(() => {
    if (!open) return
    if (mode === "edit" && initial) {
      setRouteName(initial.routeName ?? "")
      setRouteType(initial.routeType ?? "pickup")
      setRouteFare(String(initial.routeFare ?? ""))
      setRouteTime(initial.routeTime ?? "")
      const dId = typeof initial.driverId === "object" ? (initial.driverId as any)?._id : initial.driverId
      setDriverId(dId ?? "")
      setStartName(initial.startLocation?.name ?? "")
      setStartLat(String(initial.startLocation?.location?.coordinates?.[1] ?? ""))
      setStartLng(String(initial.startLocation?.location?.coordinates?.[0] ?? ""))
      setEndName(initial.endLocation?.name ?? "")
      setEndLat(String(initial.endLocation?.location?.coordinates?.[1] ?? ""))
      setEndLng(String(initial.endLocation?.location?.coordinates?.[0] ?? ""))
      setStops(
        initial.stops?.length
          ? initial.stops.map((s) => ({
              name: s.name,
              arrivalTime: s.arrivalTime ?? "",
              order: s.order,
              lat: String(s.location?.coordinates?.[1] ?? ""),
              lng: String(s.location?.coordinates?.[0] ?? ""),
            }))
          : [emptyStop()]
      )
    } else {
      setRouteName(""); setRouteType("pickup"); setRouteFare(""); setRouteTime("")
      setDriverId(""); setStartName(""); setStartLat(""); setStartLng("")
      setEndName(""); setEndLat(""); setEndLng(""); setStops([emptyStop()])
    }
  }, [open, mode, initial])

  const mutationOptions = {
    onSuccess: () => {
      toast.success(`Route ${mode === "create" ? "created" : "updated"}`)
      qc.invalidateQueries({ queryKey: ["routes"] })
      onOpenChange(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Operation failed"),
  }
  const createMutation = useMutation({ mutationFn: routesAPI.createRoute, ...mutationOptions })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => routesAPI.updateRoute(id, data),
    ...mutationOptions,
  })

  const buildPayload = () => ({
    routeName,
    routeType,
    routeFare: parseFloat(routeFare) || 0,
    routeTime,
    driverId,
    startLocation: {
      name: startName,
      location: { type: "Point", coordinates: [parseFloat(startLng) || 0, parseFloat(startLat) || 0] },
    },
    endLocation: {
      name: endName,
      location: { type: "Point", coordinates: [parseFloat(endLng) || 0, parseFloat(endLat) || 0] },
    },
    stops: stops.map((s, i) => ({
      name: s.name,
      arrivalTime: s.arrivalTime,
      order: s.order || i + 1,
      location: { type: "Point", coordinates: [parseFloat(s.lng) || 0, parseFloat(s.lat) || 0] },
    })),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "create") createMutation.mutate(buildPayload())
    else if (initial?._id) updateMutation.mutate({ id: initial._id, data: buildPayload() })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  const updateStop = (i: number, field: keyof Stop, value: string | number) =>
    setStops((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add New Route" : "Edit Route"}</DialogTitle>
            <DialogDescription>Fill in the route details, locations and stops.</DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[65vh]">
          <form id="route-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Route Name <span className="text-destructive">*</span></Label>
                <Input value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="e.g. Route A" required />
              </div>
              <div className="space-y-1.5">
                <Label>Route Type <span className="text-destructive">*</span></Label>
                <Select value={routeType} onValueChange={(v) => setRouteType(v as "pickup" | "dropoff")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="dropoff">Drop-off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Route Time <span className="text-destructive">*</span></Label>
                <Input value={routeTime} onChange={(e) => setRouteTime(e.target.value)} placeholder="e.g. 07:30" required />
              </div>
              <div className="space-y-1.5">
                <Label>Fare (£)</Label>
                <Input type="number" value={routeFare} onChange={(e) => setRouteFare(e.target.value)} placeholder="0.00" min={0} step={0.01} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Assign Driver <span className="text-destructive">*</span></Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Start location */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Start Location</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input value={startName} onChange={(e) => setStartName(e.target.value)} placeholder="Location name" className="sm:col-span-1" />
                <Input value={startLat} onChange={(e) => setStartLat(e.target.value)} placeholder="Latitude" type="number" step="any" />
                <Input value={startLng} onChange={(e) => setStartLng(e.target.value)} placeholder="Longitude" type="number" step="any" />
              </div>
            </div>

            {/* End location */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">End Location</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input value={endName} onChange={(e) => setEndName(e.target.value)} placeholder="Location name" className="sm:col-span-1" />
                <Input value={endLat} onChange={(e) => setEndLat(e.target.value)} placeholder="Latitude" type="number" step="any" />
                <Input value={endLng} onChange={(e) => setEndLng(e.target.value)} placeholder="Longitude" type="number" step="any" />
              </div>
            </div>

            <Separator />

            {/* Stops */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stops ({stops.length})</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-full bg-transparent"
                  onClick={() => setStops((p) => [...p, { ...emptyStop(), order: p.length + 1 }])}
                >
                  <Plus size={14} /> Add Stop
                </Button>
              </div>
              <div className="space-y-3">
                {stops.map((stop, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">Stop {i + 1}</span>
                      {stops.length > 1 && (
                        <Button
                          type="button" variant="ghost" size="sm"
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          onClick={() => setStops((p) => p.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        value={stop.name}
                        onChange={(e) => updateStop(i, "name", e.target.value)}
                        placeholder="Stop name"
                        className="sm:col-span-2"
                      />
                      <Input
                        value={stop.arrivalTime}
                        onChange={(e) => updateStop(i, "arrivalTime", e.target.value)}
                        placeholder="Arrival time"
                      />
                      <Input
                        type="number"
                        value={stop.order}
                        onChange={(e) => updateStop(i, "order", parseInt(e.target.value) || i + 1)}
                        placeholder="Order"
                        min={1}
                      />
                      <Input value={stop.lat} onChange={(e) => updateStop(i, "lat", e.target.value)} placeholder="Latitude" type="number" step="any" />
                      <Input value={stop.lng} onChange={(e) => updateStop(i, "lng", e.target.value)} placeholder="Longitude" type="number" step="any" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="p-4 border-t gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="route-form" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Route" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
