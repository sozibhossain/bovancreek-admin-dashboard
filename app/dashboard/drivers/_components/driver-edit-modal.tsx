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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { driversAPI, vehiclesAPI, routesAPI } from "@/lib/api"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Upload } from "lucide-react"

export function DriverEditModal({
  open,
  onOpenChange,
  driver,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  driver: any | null
}) {
  const qc = useQueryClient()
  const [vehicleId, setVehicleId] = React.useState("")
  const [routeId, setRouteId] = React.useState("")
  const [status, setStatus] = React.useState<"active" | "deactivate">("active")
  const [licenseFile, setLicenseFile] = React.useState<File | null>(null)
  const [certFile, setCertFile] = React.useState<File | null>(null)
  const licenseRef = React.useRef<HTMLInputElement>(null)
  const certRef = React.useRef<HTMLInputElement>(null)

  const detailId = driver?.driverDetails?._id

  const { data: vehiclesRes } = useQuery({
    queryKey: ["vehicles", 1, 200],
    queryFn: () => vehiclesAPI.getAllVehicles(1, 200),
    enabled: open,
  })
  const { data: routesRes } = useQuery({
    queryKey: ["routes", 1, 200],
    queryFn: () => routesAPI.getAllRoutes(1, 200),
    enabled: open,
  })

  const vehicles: any[] = vehiclesRes?.data?.data ?? []
  const routes: any[] = routesRes?.data?.data ?? []

  React.useEffect(() => {
    if (!open || !driver) return
    const det = driver.driverDetails
    setVehicleId(det?.assignedVehicle?._id ?? det?.assignedVehicle ?? "")
    setRouteId(det?.AssignedRoute?._id ?? det?.AssignedRoute ?? "")
    setStatus(det?.status ?? "active")
    setLicenseFile(null)
    setCertFile(null)
  }, [open, driver])

  const mutation = useMutation({
    mutationFn: (fd: FormData) => driversAPI.updateDriverDetails(detailId, fd),
    onSuccess: () => {
      toast.success("Driver updated")
      qc.invalidateQueries({ queryKey: ["drivers"] })
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to update driver"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!detailId) { toast.error("No driver detail record found"); return }
    const fd = new FormData()
    if (vehicleId) fd.append("assignedVehicle", vehicleId)
    if (routeId) fd.append("AssignedRoute", routeId)
    fd.append("status", status)
    if (licenseFile) fd.append("license", licenseFile)
    if (certFile) fd.append("certificate", certFile)
    mutation.mutate(fd)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <DialogHeader>
            <DialogTitle>Edit Driver — {driver?.name ?? ""}</DialogTitle>
            <DialogDescription>Update assignment, status and documents.</DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[60vh]">
          {!driver ? (
            <div className="p-6 text-sm text-muted-foreground">No driver selected.</div>
          ) : (
            <form id="driver-edit-form" onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label>Assign Vehicle</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {v.regNum} — {v.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Assign Route</Label>
                <Select value={routeId} onValueChange={setRouteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {routes.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.routeName} ({r.routeType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "active" | "deactivate")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivate">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>License File (optional)</Label>
                <input ref={licenseRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)} />
                <Button type="button" variant="outline" className="w-full justify-start gap-2 bg-transparent"
                  onClick={() => licenseRef.current?.click()}>
                  <Upload size={14} />
                  {licenseFile ? licenseFile.name : "Upload License"}
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label>DBS Certificate (optional)</Label>
                <input ref={certRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} />
                <Button type="button" variant="outline" className="w-full justify-start gap-2 bg-transparent"
                  onClick={() => certRef.current?.click()}>
                  <Upload size={14} />
                  {certFile ? certFile.name : "Upload Certificate"}
                </Button>
              </div>
            </form>
          )}
        </ScrollArea>
        <DialogFooter className="p-4 border-t gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="driver-edit-form" disabled={mutation.isPending || !driver}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
