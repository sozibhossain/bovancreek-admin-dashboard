"use client";

// ===============================
// _components/vehicle-form-modal.tsx
// ===============================
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Upload } from "lucide-react";
import { vehiclesAPI } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Vehicle = {
  _id?: string;
  regNum: string;
  type: string;
  capacity: number;
  motDate?: string; // ISO
  insuranceExpiry?: string; // ISO
  driverId?: { _id: string; name: string } | string;
  fitnessCertificateUrl?: string;
  insuranceFileUrl?: string;
};

function toISOFromParts(d?: string, m?: string, y?: string) {
  if (!d || !m || !y) return undefined;
  const day = parseInt(d, 10);
  const mon = parseInt(m, 10) - 1;
  const yr = parseInt(y, 10);
  const date = new Date(Date.UTC(yr, mon, day));
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function VehicleFormModal({
  open,
  onOpenChange,
  mode, // "create" | "edit"
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  initial?: Partial<Vehicle> | null;
}) {
  const qc = useQueryClient();

  const [regNum, setRegNum] = React.useState(initial?.regNum ?? "");
  const [type, setType] = React.useState(initial?.type ?? "");
  const [capacity, setCapacity] = React.useState(initial?.capacity?.toString() ?? "");

  // date parts (MOT)
  const initMot = initial?.motDate ? new Date(initial.motDate) : undefined;
  const [motD, setMotD] = React.useState(initMot ? String(initMot.getUTCDate()).padStart(2, "0") : "");
  const [motM, setMotM] = React.useState(initMot ? String(initMot.getUTCMonth() + 1).padStart(2, "0") : "");
  const [motY, setMotY] = React.useState(initMot ? String(initMot.getUTCFullYear()) : "");

  // date parts (Insurance)
  const initIns = initial?.insuranceExpiry ? new Date(initial.insuranceExpiry) : undefined;
  const [insD, setInsD] = React.useState(initIns ? String(initIns.getUTCDate()).padStart(2, "0") : "");
  const [insM, setInsM] = React.useState(initIns ? String(initIns.getUTCMonth() + 1).padStart(2, "0") : "");
  const [insY, setInsY] = React.useState(initIns ? String(initIns.getUTCFullYear()) : "");

  const [fitnessFile, setFitnessFile] = React.useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    // reset on open with latest initial
    setRegNum(initial?.regNum ?? "");
    setType(initial?.type ?? "");
    setCapacity(initial?.capacity != null ? String(initial.capacity) : "");

    const m = initial?.motDate ? new Date(initial.motDate) : undefined;
    setMotD(m ? String(m.getUTCDate()).padStart(2, "0") : "");
    setMotM(m ? String(m.getUTCMonth() + 1).padStart(2, "0") : "");
    setMotY(m ? String(m.getUTCFullYear()) : "");

    const i = initial?.insuranceExpiry ? new Date(initial.insuranceExpiry) : undefined;
    setInsD(i ? String(i.getUTCDate()).padStart(2, "0") : "");
    setInsM(i ? String(i.getUTCMonth() + 1).padStart(2, "0") : "");
    setInsY(i ? String(i.getUTCFullYear()) : "");

    setFitnessFile(null);
    setInsuranceFile(null);
  }, [open, initial]);

  const createMutation = useMutation({
    mutationFn: async (payload: FormData) => vehiclesAPI.createVehicle(payload),
    onSuccess: () => {
      toast.success("Vehicle added");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to add vehicle"),
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string; data: FormData }) => vehiclesAPI.updateVehicle(args.id, args.data),
    onSuccess: () => {
      toast.success("Vehicle updated");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update vehicle"),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum || !type || !capacity) {
      toast.error("Please fill in registration, type and capacity");
      return;
    }

    const fd = new FormData();
    fd.append("regNum", regNum.trim());
    fd.append("type", type);
    fd.append("capacity", String(parseInt(capacity, 10)));

    const motISO = toISOFromParts(motD, motM, motY);
    const insISO = toISOFromParts(insD, insM, insY);
    if (motISO) fd.append("motDate", motISO);
    if (insISO) fd.append("insuranceExpiry", insISO);
    if (fitnessFile) fd.append("fitnessCertificate", fitnessFile);
    if (insuranceFile) fd.append("insuranceFile", insuranceFile);

    try {
      setIsSubmitting(true);
      if (mode === "create") {
        await createMutation.mutateAsync(fd);
      } else if (mode === "edit" && initial?._id) {
        await updateMutation.mutateAsync({ id: initial._id, data: fd });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const years = Array.from({ length: 15 }, (_, i) => String(new Date().getUTCFullYear() + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden" aria-describedby={undefined}>
        {/* Header */}
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Vehicle" : "Edit Vehicle"}</DialogTitle>
            <DialogDescription>Fill in vehicle details. Files are optional.</DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <ScrollArea className="max-h-[65vh] px-6 py-4">
          <form id="vehicle-form" onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Vehicle Registration Number</Label>
                <Input
                  placeholder="Enter registration number"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Vehicle Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minibus">Minibus</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vehicle Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g., 15"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadBox title="Upload fitness certificate" file={fitnessFile} setFile={setFitnessFile} />
                <UploadBox title="Upload insurance file" file={insuranceFile} setFile={setInsuranceFile} />
              </div>

              {/* MOT Expiry */}
              <div className="space-y-2">
                <Label>Select MOT Expiry</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={motD} onValueChange={setMotD}>
                    <SelectTrigger><SelectValue placeholder="DD" /></SelectTrigger>
                    <SelectContent>{days.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                  </Select>
                  <Select value={motM} onValueChange={setMotM}>
                    <SelectTrigger><SelectValue placeholder="MM" /></SelectTrigger>
                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                  </Select>
                  <Select value={motY} onValueChange={setMotY}>
                    <SelectTrigger><SelectValue placeholder="YYYY" /></SelectTrigger>
                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Insurance Expiry */}
              <div className="space-y-2">
                <Label>Select Insurance Expiry</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={insD} onValueChange={setInsD}>
                    <SelectTrigger><SelectValue placeholder="DD" /></SelectTrigger>
                    <SelectContent>{days.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                  </Select>
                  <Select value={insM} onValueChange={setInsM}>
                    <SelectTrigger><SelectValue placeholder="MM" /></SelectTrigger>
                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                  </Select>
                  <Select value={insY} onValueChange={setInsY}>
                    <SelectTrigger><SelectValue placeholder="YYYY" /></SelectTrigger>
                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Illustration (optional) */}
            <div className="hidden lg:flex items-center justify-center">
              <Image src="/vehicle-illustration.png" alt="Vehicle" width={480} height={240} className="object-contain" />
            </div>
          </form>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="vehicle-form" className="bg-[#96A1DB] hover:bg-[#556ff3]" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Add Vehicle" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadBox({ title, file, setFile }: { title: string; file: File | null; setFile: (f: File | null) => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center ${dragOver ? "border-primary" : "border-muted"}`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-5 w-5" />
          {file ? (
            <span className="text-foreground font-medium">{file.name}</span>
          ) : (
            <>
              <span className="font-medium">Drag & Drop or Select a File</span>
              <span>PDF, DOC, MP3, MP4, PPT, XLS</span>
            </>
          )}
          <Button variant="link" type="button" onClick={() => inputRef.current?.click()} className="mt-1">
            Select a File
          </Button>
        </div>
      </div>
    </div>
  );
}

