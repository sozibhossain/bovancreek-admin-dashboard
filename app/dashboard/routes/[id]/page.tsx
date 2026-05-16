"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { routesAPI } from "@/lib/api"
import { toast } from "sonner"
import { useState } from "react"
import { RouteFormModal } from "../_components/route-form-modal"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Route } from "@/lib/types"

export default function RouteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["route", routeId],
    queryFn: () => routesAPI.getRouteDetails(routeId),
    enabled: !!routeId,
  })

  const route: Route | null = data?.data?.data ?? data?.data ?? null

  const deleteMutation = useMutation({
    mutationFn: () => routesAPI.deleteRoute(routeId),
    onSuccess: () => {
      toast.success("Route deleted")
      router.push("/dashboard/routes")
    },
    onError: () => toast.error("Failed to delete route"),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!route) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 rounded-full">
          <ArrowLeft size={16} /> Go back
        </Button>
        <p className="text-muted-foreground">Route not found.</p>
      </div>
    )
  }

  const driverName = typeof route.driverId === "object" ? (route.driverId as any)?.name : "—"
  const driverPhone = typeof route.driverId === "object" ? (route.driverId as any)?.phone : "—"
  const sortedStops = [...(route.stops ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Route Detail</h1>
        <p className="text-muted-foreground mt-1 text-sm">{route.routeName}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 rounded-full">
          <ArrowLeft size={16} /> Go back
        </Button>
        <Button
          className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-5 gap-2"
          onClick={() => setEditOpen(true)}
        >
          <Pencil size={15} /> Edit Route
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-300 text-red-500 hover:bg-red-50 rounded-full px-5 gap-2 bg-transparent"
            >
              <Trash2 size={15} /> Delete Route
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{route.routeName}"? This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex justify-end gap-3 mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Route Information */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Route Information</CardTitle>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              route.routeType === "pickup" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
            }`}>
              {route.routeType}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              route.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}>
              {route.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              ["Route Name", route.routeName],
              ["Route Type", route.routeType],
              ["Route Time", route.routeTime],
              ["Start", route.startLocation?.name],
              ["End", route.endLocation?.name],
              ["Fare", `£${route.routeFare ?? 0}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-foreground mt-1.5">{value || "—"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver & Vehicle */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Driver & Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["Driver", driverName],
              ["Contact", driverPhone],
              ["Email", typeof route.driverId === "object" ? (route.driverId as any)?.email : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-foreground mt-1.5">{value || "—"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Stops */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Route Stops</CardTitle>
              <p className="text-sm text-primary mt-0.5">{sortedStops.length} stop{sortedStops.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {sortedStops.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stops defined.</p>
          ) : (
            <div className="flex flex-wrap gap-6 items-start">
              {sortedStops.map((stop, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="w-11 h-11 rounded-full border-4 border-primary bg-white flex items-center justify-center font-bold text-primary text-sm">
                      {String(stop.order ?? idx + 1).padStart(2, "0")}
                    </div>
                    {idx < sortedStops.length - 1 && (
                      <div className="w-8 h-0.5 bg-primary/30" />
                    )}
                  </div>
                  <div className="mt-2 text-center max-w-28">
                    <p className="text-xs font-semibold text-foreground">{stop.name}</p>
                    {stop.arrivalTime && (
                      <p className="text-xs text-muted-foreground mt-0.5">{stop.arrivalTime}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RouteFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initial={route}
      />
    </div>
  )
}
