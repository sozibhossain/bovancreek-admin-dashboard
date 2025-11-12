import { Dialog as Dialog2, DialogContent as DialogContent2, DialogHeader as DialogHeader2, DialogTitle as DialogTitle2, DialogDescription as DialogDescription2, DialogFooter as DialogFooter2 } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function VehicleDetailsModal({ open, onOpenChange, vehicle }: { open: boolean; onOpenChange: (v: boolean) => void; vehicle: any | null; }) {
  return (
    <Dialog2 open={open} onOpenChange={onOpenChange}>
      <DialogContent2 className="sm:max-w-xl">
        <DialogHeader2>
          <DialogTitle2>Vehicle Details</DialogTitle2>
          <DialogDescription2>Registration and compliance information.</DialogDescription2>
        </DialogHeader2>

        {!vehicle ? (
          <div className="text-sm text-muted-foreground">No vehicle selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{vehicle.regNum}</div>
                <div className="text-sm text-muted-foreground capitalize">{vehicle.type}</div>
              </div>
              <Badge variant="secondary">Capacity: {vehicle.capacity}</Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">MOT Date</div>
                <div className="font-medium">{vehicle.motDate ? new Date(vehicle.motDate).toLocaleDateString() : "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Insurance Expiry</div>
                <div className="font-medium">{vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Driver</div>
                <div className="font-medium">{vehicle.driverId?.name ?? "-"}</div>
              </div>
            </div>

            {(vehicle.fitnessCertificateUrl || vehicle.insuranceFileUrl) && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Files</div>
                <ul className="list-disc list-inside text-sm text-blue-600">
                  {vehicle.fitnessCertificateUrl && (
                    <li><a href={vehicle.fitnessCertificateUrl} target="_blank" rel="noreferrer">Fitness certificate</a></li>
                  )}
                  {vehicle.insuranceFileUrl && (
                    <li><a href={vehicle.insuranceFileUrl} target="_blank" rel="noreferrer">Insurance file</a></li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter2>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter2>
      </DialogContent2>
    </Dialog2>
  );
}