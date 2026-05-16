"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { driversAPI } from "@/lib/api"
import { Pagination } from "@/components/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Phone, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DriverEditModal } from "./_components/driver-edit-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DriversPage() {
  const [page, setPage] = useState(1)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["drivers", page],
    queryFn: () => driversAPI.getAllDrivers(page, 12),
  })

  const drivers: any[] = data?.data?.data ?? []
  const totalPages = data?.data?.meta?.totalPages ?? 1

  const statusMutation = useMutation({
    mutationFn: ({ detailId, status }: { detailId: string; status: "active" | "deactivate" }) =>
      driversAPI.toggleDriverStatus(detailId, status),
    onSuccess: (_, { status }) => {
      toast.success(status === "active" ? "Driver activated" : "Driver deactivated")
      qc.invalidateQueries({ queryKey: ["drivers"] })
    },
    onError: () => toast.error("Failed to update driver status"),
  })

  const deleteMutation = useMutation({
    mutationFn: (detailId: string) => driversAPI.deleteDriverDetails(detailId),
    onSuccess: () => {
      toast.success("Driver removed")
      qc.invalidateQueries({ queryKey: ["drivers"] })
    },
    onError: () => toast.error("Failed to remove driver"),
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver List</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View and manage all registered drivers, their details, and availability status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))
          : drivers.map((driver: any) => {
              const name = driver?.name ?? "Unknown"
              const email = driver?.email ?? "—"
              const phone = driver?.phone ?? driver?.driverDetails?.userId?.phone ?? "—"
              const initial = (name.trim()[0] ?? "?").toUpperCase()
              const detailStatus = driver?.driverDetails?.status ?? driver?.status ?? "active"
              const isActive = detailStatus !== "deactivate"
              const detailId = driver?.driverDetails?._id
              const vehicle = driver?.driverDetails?.assignedVehicle
              const route = driver?.driverDetails?.AssignedRoute

              return (
                <Card
                  key={driver._id}
                  className="border border-border shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-muted/40 p-4 flex items-start justify-between border-b border-border">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
                          {driver.avatar?.url ? (
                            <img
                              src={driver.avatar.url}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                            />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{email}</p>
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            {isActive ? "Active" : "Deactivated"}
                          </span>
                        </div>
                      </div>
                      {phone !== "—" && (
                        <a href={`tel:${phone}`} className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shrink-0 transition-colors ml-2">
                          <Phone size={15} />
                        </a>
                      )}
                    </div>

                    {/* Details */}
                    <div className="px-4 py-3 space-y-2.5 text-sm">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Contact</p>
                          <p className="font-semibold text-foreground text-xs mt-0.5">{phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium">Vehicle</p>
                          <p className="font-semibold text-foreground text-xs mt-0.5">
                            {vehicle?.regNum ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Route</p>
                          <p className="font-semibold text-foreground text-xs mt-0.5 truncate max-w-24">
                            {route?.routeName ?? "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium">Type</p>
                          <p className="font-semibold text-foreground text-xs mt-0.5">
                            {vehicle?.type ?? "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border">
                      <Link href={`/dashboard/drivers/${driver._id}`} className="block">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-full h-9">
                          <Eye size={14} className="mr-1.5" />
                          View Details
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-primary text-primary hover:bg-primary/10 font-semibold text-xs rounded-full h-8 bg-transparent"
                          onClick={() => { setSelectedDriver(driver); setEditOpen(true) }}
                        >
                          Edit
                        </Button>
                        {detailId && (
                          <Button
                            variant="outline"
                            className={`flex-1 font-semibold text-xs rounded-full h-8 bg-transparent ${
                              isActive
                                ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                                : "border-green-300 text-green-600 hover:bg-green-50"
                            }`}
                            onClick={() => statusMutation.mutate({
                              detailId,
                              status: isActive ? "deactivate" : "active",
                            })}
                            disabled={statusMutation.isPending}
                          >
                            {isActive ? (
                              <><UserX size={12} className="mr-1" />Deactivate</>
                            ) : (
                              <><UserCheck size={12} className="mr-1" />Activate</>
                            )}
                          </Button>
                        )}
                        {detailId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-500 hover:bg-red-50 text-xs rounded-full h-8 px-3 bg-transparent"
                              >
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Remove Driver</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the driver record permanently. Are you sure?
                              </AlertDialogDescription>
                              <div className="flex justify-end gap-3 mt-4">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteMutation.mutate(detailId)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {drivers.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">No drivers found.</div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <DriverEditModal
        open={editOpen}
        onOpenChange={(v) => { setEditOpen(v); if (!v) setSelectedDriver(null) }}
        driver={selectedDriver}
      />
    </div>
  )
}
