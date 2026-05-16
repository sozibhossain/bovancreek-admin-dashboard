"use client";

import React from "react";
import {
  Card as CardV,
  CardContent as CardContentV,
} from "@/components/ui/card";
import { Plus, Search, ChevronDown, Bus, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleFormModal } from "./VehicleFormModal";
import { VehicleDetailsModal } from "./VehicleDetailsModal";
import { VehicleAssignDriverModal } from "./VehicleAssignDriverModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function VehiclesPage() {
  const [page, setPage] = React.useState(1);
  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [currentVehicle, setCurrentVehicle] = React.useState<any | null>(null);
  const [openDetails, setOpenDetails] = React.useState(false);
  const [openAssignDriver, setOpenAssignDriver] = React.useState(false);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", page],
    queryFn: () => vehiclesAPI.getAllVehicles(page, 12),
  });

  const delMutation = useMutation({
    mutationFn: async (id: string) => vehiclesAPI.deleteVehicle(id),
    onSuccess: () => {
      toast.success("Vehicle deleted");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const vehicles = data?.data?.data || [];
  const meta = data?.data?.meta || { totalPages: 1 };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Vehicle List</h1>
          <p className="text-[#717171] mt-1 text-sm">
            Manage and monitor all registered vehicles, including their details,
            drivers, and current status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full border-[#E5E5E5] text-sm text-[#717171]"
          >
            Sort by: <span className="text-[#8E97FD] ml-1">Status</span>{" "}
            <ChevronDown size={16} className="ml-2" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-[#E5E5E5] text-sm text-[#717171]"
          >
            Route <ChevronDown size={16} className="ml-2" />
          </Button>
          <Button
            className="bg-[#D9B5D9] hover:bg-[#C8A4C8] text-white rounded-full px-6 transition-all"
            onClick={() => {
              setFormMode("create");
              setOpenForm(true);
            }}
          >
            <Plus size={18} className="mr-1" /> Add Vehicle
          </Button>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1A1]"
            size={18}
          />
          <Input
            placeholder="Search"
            className="pl-10 rounded-full border-[#E5E5E5] focus-visible:ring-[#8E97FD]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] rounded-[32px]" />
            ))
          : vehicles.map((vehicle: any) => (
              <CardV
                key={vehicle._id}
                className="border border-[#F0F0F0] rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <CardContentV className="p-6">
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#A1A1A1] font-bold">
                        School Bus
                      </p>
                      <h3 className="text-xl font-bold text-[#4A4A4A] mt-1">
                        {vehicle.routeName || "Route #12"}
                      </h3>
                    </div>
                    <div className="relative w-20 h-10">
                      <Bus className="text-[#8E97FD]" size={40} />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div>
                      <p className="text-xs text-[#A1A1A1]">Capacity</p>
                      <p className="text-sm font-bold text-[#4A4A4A]">
                        {vehicle.capacity} Seats
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A1A1A1]">Driver</p>
                      <p className="text-sm font-bold text-[#4A4A4A] truncate">
                        {vehicle.driverId?.name || "John Smith"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A1A1A1]">Status</p>
                      <p className="text-sm font-bold text-[#4A4A4A]">Active</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A1A1A1]">License Plate</p>
                      <p className="text-sm font-bold text-[#4A4A4A] uppercase">
                        {vehicle.regNum}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-[#8E97FD] hover:bg-[#7D86E0] text-white rounded-full h-11 font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentVehicle(vehicle);
                        setOpenAssignDriver(true);
                      }}
                    >
                      Assign Driver
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-full border-[#DDE1FF] text-[#8E97FD] hover:bg-[#F0F2FF]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormMode("edit");
                          setCurrentVehicle(vehicle);
                          setOpenForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 rounded-full border-[#FFDEDE] text-[#FF7E7E] hover:bg-[#FFF0F0]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[32px]">
                          <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex gap-3 justify-end mt-4">
                            <AlertDialogCancel className="rounded-full">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-[#FF7E7E] hover:bg-red-600 rounded-full"
                              onClick={() => delMutation.mutate(vehicle._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContentV>
              </CardV>
            ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />

      {/* Modals */}
      <VehicleFormModal
        open={openForm}
        onOpenChange={setOpenForm}
        mode={formMode}
        initial={currentVehicle}
      />
      <VehicleAssignDriverModal
        open={openAssignDriver}
        onOpenChange={setOpenAssignDriver}
        vehicle={currentVehicle}
      />
      <VehicleDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        vehicle={currentVehicle}
      />
    </div>
  );
}
