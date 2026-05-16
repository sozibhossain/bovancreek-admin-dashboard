"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Calendar, Shield } from "lucide-react"

function DocCard({
  title,
  url,
  expiry,
}: {
  title: string
  url?: string
  expiry?: string
}) {
  const isImage = url && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Preview */}
      <div className="bg-muted/30 h-32 flex items-center justify-center relative">
        {url ? (
          isImage ? (
            <img
              src={url}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText size={32} />
              <span className="text-xs">PDF Document</span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText size={32} />
            <span className="text-xs">No file uploaded</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="font-semibold text-sm">{title}</p>
        {expiry && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={11} />
            Expires: {new Date(expiry).toLocaleDateString("en-GB")}
          </p>
        )}
        {url ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 rounded-full bg-transparent text-xs h-7"
            onClick={() => window.open(url, "_blank")}
          >
            <ExternalLink size={12} /> View / Download
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground italic">Not uploaded</p>
        )}
      </div>
    </div>
  )
}

export function VehicleDetailsModal({
  open,
  onOpenChange,
  vehicle,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  vehicle: any | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Vehicle Details</DialogTitle>
          <DialogDescription>Registration and compliance information.</DialogDescription>
        </DialogHeader>

        {!vehicle ? (
          <div className="text-sm text-muted-foreground py-4">No vehicle selected.</div>
        ) : (
          <div className="space-y-5">
            {/* Basic info */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold">{vehicle.regNum}</p>
                <p className="text-sm text-muted-foreground capitalize">{vehicle.type}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {vehicle.capacity} Seats
              </Badge>
            </div>

            <Separator />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Driver</p>
                <p className="font-semibold mt-0.5">{vehicle.driverId?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Status</p>
                <p className="font-semibold mt-0.5">Active</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">MOT Date</p>
                <p className="font-semibold mt-0.5">
                  {vehicle.motDate
                    ? new Date(vehicle.motDate).toLocaleDateString("en-GB")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Insurance Expiry</p>
                <p className="font-semibold mt-0.5">
                  {vehicle.insuranceExpire
                    ? new Date(vehicle.insuranceExpire).toLocaleDateString("en-GB")
                    : "—"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-2">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Shield size={14} /> Documents
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DocCard
                  title="Fitness Certificate"
                  url={vehicle.fitNessCertificate?.url}
                  expiry={vehicle.motDate}
                />
                <DocCard
                  title="Insurance Document"
                  url={vehicle.insurance?.url}
                  expiry={vehicle.insuranceExpire}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
