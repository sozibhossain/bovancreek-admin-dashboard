"use client";


import { Card as CardV, CardContent as CardContentV, CardHeader as CardHeaderV, CardTitle as CardTitleV } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { vehiclesAPI as vehiclesAPI2 } from "@/lib/api";
import { useQueryClient as useQueryClient2, useMutation as useMutation2 } from "@tanstack/react-query";
import { toast as toast2 } from "sonner";
import React from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { VehicleFormModal } from "./VehicleFormModal";
import { VehicleDetailsModal } from "./VehicleDetailsModal";

export default function VehiclesPage() {
  const [page, setPage] = React.useState(1);
  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [currentVehicle, setCurrentVehicle] = React.useState<any | null>(null);
  const [openDetails, setOpenDetails] = React.useState(false);

  const qc = useQueryClient2();

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", page],
    queryFn: () => vehiclesAPI2.getAllVehicles(page, 10),
  });

  const delMutation = useMutation2({
    mutationFn: async (id: string) => vehiclesAPI2.deleteVehicle(id),
    onSuccess: () => {
      toast2.success("Vehicle deleted");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (err: any) => toast2.error(err?.response?.data?.message || "Delete failed"),
  });

  const vehicles = data?.data?.data || [];
  const meta = data?.data?.meta || { totalPages: 1 };

  const onAdd = () => { setFormMode("create"); setCurrentVehicle(null); setOpenForm(true); };
  const onEdit = (v: any) => { setFormMode("edit"); setCurrentVehicle(v); setOpenForm(true); };
  const onCardClick = (v: any) => { setCurrentVehicle(v); setOpenDetails(true); };

  return (
    <div className="md:ml-64 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicle List</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all registered vehicles</p>
        </div>
        <Button className="bg-[#96A1DB] hover:bg-[#556ff3]" onClick={onAdd}>
          <Plus size={20} />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <CardV key={i}><CardContentV className="pt-6"><Skeleton className="h-40 w-full" /></CardContentV></CardV>
            ))
          : vehicles.map((vehicle: any) => (
              <CardV key={vehicle._id} className="cursor-pointer" onClick={() => onCardClick(vehicle)}>
                <CardHeaderV>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitleV>{vehicle.regNum}</CardTitleV>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{vehicle.type}</p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => onEdit(vehicle)}>
                        <Edit2 size={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this vehicle?</AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => delMutation.mutate(vehicle._id)}>
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeaderV>
                <CardContentV>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Capacity:</span><span className="font-medium">{vehicle.capacity} seats</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Driver:</span><span className="font-medium">{vehicle.driverId?.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">MOT Date:</span><span className="font-medium">{vehicle.motDate ? new Date(vehicle.motDate).toLocaleDateString() : "-"}</span></div>
                  </div>
                </CardContentV>
              </CardV>
            ))}
      </div>

      <Pagination currentPage={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />

      {/* Modals */}
      <VehicleFormModal open={openForm} onOpenChange={setOpenForm} mode={formMode} initial={currentVehicle} />
      <VehicleDetailsModal open={openDetails} onOpenChange={setOpenDetails} vehicle={currentVehicle} />
    </div>
  );
}