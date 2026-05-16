"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Download, ExternalLink, UserX, UserCheck } from "lucide-react"
import Link from "next/link"
import { driversAPI } from "@/lib/api"
import { toast } from "sonner"
import { useState } from "react"
import { DriverEditModal } from "../_components/driver-edit-modal"

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1.5">{value || "—"}</p>
    </div>
  )
}

function FileBox({
  title,
  url,
}: {
  title: string
  url?: string
}) {
  const isImage = url ? /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) : false

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Preview area */}
      <div className="bg-muted/30 h-36 flex items-center justify-center relative">
        {url ? (
          isImage ? (
            <img
              src={url}
              alt={title}
              className="h-full w-full object-contain p-2"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement
                el.style.display = "none"
                const parent = el.parentElement
                if (parent) {
                  const fallback = document.createElement("div")
                  fallback.className = "flex flex-col items-center gap-1 text-muted-foreground"
                  fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span style="font-size:11px">PDF Document</span>'
                  parent.appendChild(fallback)
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Download size={28} className="text-primary" />
              <span className="text-xs font-medium">PDF Document</span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ExternalLink size={28} className="opacity-30" />
            <span className="text-xs">Not uploaded</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <p className="font-semibold text-sm">{title}</p>
        {url ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 bg-transparent rounded-full h-8 text-xs"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink size={12} /> View
            </Button>
            <a href={url} download target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-white gap-1.5 rounded-full h-8 text-xs"
              >
                <Download size={12} /> Download
              </Button>
            </a>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No file uploaded</p>
        )}
      </div>
    </div>
  )
}

export default function DriverDetailPage() {
  const params = useParams()
  const router = useRouter()
  const driverId = params.id as string
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  // Fetch the driver user + details
  const { data, isLoading } = useQuery({
    queryKey: ["driver-detail", driverId],
    queryFn: () => driversAPI.getAllDrivers(1, 200),
    enabled: !!driverId,
  })

  const allDrivers: any[] = data?.data?.data ?? []
  const driver = allDrivers.find((d: any) => d._id === driverId)
  const det = driver?.driverDetails

  const statusMutation = useMutation({
    mutationFn: ({ detailId, status }: { detailId: string; status: "active" | "deactivate" }) =>
      driversAPI.toggleDriverStatus(detailId, status),
    onSuccess: (_, { status }) => {
      toast.success(status === "active" ? "Driver activated" : "Driver deactivated")
      qc.invalidateQueries({ queryKey: ["driver-detail", driverId] })
      qc.invalidateQueries({ queryKey: ["drivers"] })
    },
    onError: () => toast.error("Failed to update driver status"),
  })

  const isActive = det?.status !== "deactivate"
  const vehicle = det?.assignedVehicle
  const route = det?.AssignedRoute

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft size={16} /> Go back
        </Button>
        <p className="text-muted-foreground">Driver not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Detail</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Full profile for {driver.name}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 rounded-full"
        >
          <ArrowLeft size={16} /> Go back
        </Button>
        <Button
          className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-5 gap-2"
          onClick={() => setEditOpen(true)}
        >
          Edit Details
        </Button>
        {det?._id && (
          <Button
            variant="outline"
            className={`rounded-full px-5 gap-2 ${
              isActive
                ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                : "border-green-300 text-green-600 hover:bg-green-50"
            }`}
            onClick={() => statusMutation.mutate({ detailId: det._id, status: isActive ? "deactivate" : "active" })}
            disabled={statusMutation.isPending}
          >
            {isActive ? <><UserX size={15} /> Deactivate</> : <><UserCheck size={15} /> Activate</>}
          </Button>
        )}
      </div>

      {/* Driver Information */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Driver Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <InfoField label="Name" value={driver.name} />
            <InfoField label="Email" value={driver.email} />
            <InfoField label="Contact Number" value={driver.phone} />
            <InfoField label="Emergency Contact" value={String(driver.emergencyContact ?? "—")} />
            <InfoField
              label="Status"
              value={isActive ? "Active" : "Deactivated"}
            />
            <div className="col-span-2 md:col-span-3 lg:col-span-5">
              <InfoField label="Home Address" value={driver.location} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License & DBS */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">License & DBS Certificate</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FileBox
              title="Driving License"
              url={det?.license?.url}
            />
            <FileBox
              title="DBS Certificate"
              url={det?.certificate?.url}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Assigned */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Vehicle Assigned</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {vehicle ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <InfoField label="Registration" value={vehicle.regNum} />
              <InfoField label="Type" value={vehicle.type} />
              <InfoField label="Capacity" value={vehicle.capacity ? `${vehicle.capacity} Seats` : "—"} />
              <InfoField label="MOT Date" value={vehicle.motDate ? new Date(vehicle.motDate).toLocaleDateString("en-GB") : "—"} />
              <InfoField label="Insurance Expires" value={vehicle.insuranceExpire ? new Date(vehicle.insuranceExpire).toLocaleDateString("en-GB") : "—"} />
              <div className="col-span-2 md:col-span-4 flex gap-3 pt-1">
                <Link href={`/dashboard/vehicles`}>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-full bg-transparent">
                    <ExternalLink size={13} /> View Vehicle
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No vehicle assigned.</p>
          )}
        </CardContent>
      </Card>

      {/* Route Assigned */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Route Assigned</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {route ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 font-semibold text-foreground text-xs uppercase">Route Name</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-foreground text-xs uppercase">Type</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-foreground text-xs uppercase">Time</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-foreground text-xs uppercase">Start</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-foreground text-xs uppercase">End</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-foreground text-xs uppercase">Fare</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/50">
                    <td className="py-2.5 px-3 font-medium">{route.routeName}</td>
                    <td className="py-2.5 px-3 capitalize">{route.routeType}</td>
                    <td className="py-2.5 px-3">{route.routeTime}</td>
                    <td className="py-2.5 px-3">{route.startLocation?.name ?? "—"}</td>
                    <td className="py-2.5 px-3">{route.endLocation?.name ?? "—"}</td>
                    <td className="py-2.5 px-3 font-semibold">£{route.routeFare ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No route assigned.</p>
          )}
        </CardContent>
      </Card>

      <DriverEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        driver={driver}
      />
    </div>
  )
}
