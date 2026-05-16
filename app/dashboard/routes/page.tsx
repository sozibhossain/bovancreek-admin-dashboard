"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { routesAPI } from "@/lib/api"
import { TableSkeleton } from "@/components/table-skeleton"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Route } from "@/lib/types"
import { RouteFormModal } from "./_components/route-form-modal"
import { RouteDetailsModal } from "./_components/route-details-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RoutesPage() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selected, setSelected] = useState<Route | null>(null)

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () => routesAPI.getAllRoutes(),
  })

  const allRoutes: Route[] = data?.data?.data ?? data?.data ?? []
  const routes = typeFilter === "all"
    ? allRoutes
    : allRoutes.filter((r) => r.routeType === typeFilter)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => routesAPI.deleteRoute(id),
    onSuccess: () => {
      toast.success("Route deleted")
      qc.invalidateQueries({ queryKey: ["routes"] })
    },
    onError: () => toast.error("Failed to delete route"),
  })

  const openCreate = () => { setSelected(null); setFormMode("create"); setFormOpen(true) }
  const openEdit = (r: Route) => { setSelected(r); setFormMode("edit"); setFormOpen(true) }
  const openDetails = (r: Route) => { setSelected(r); setDetailsOpen(true) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
        <p className="text-gray-500 mt-1">Create and manage drop-off and pickup routes.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 items-center flex-wrap">
          <Button
            className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-5 gap-2"
            onClick={openCreate}
          >
            <Plus size={16} /> Add Route
          </Button>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-full bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Types</option>
            <option value="pickup">Pickup</option>
            <option value="dropoff">Drop-off</option>
          </select>
        </div>
        <span className="text-sm text-gray-400">{routes.length} routes</span>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Route Name</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Type</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Time</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Driver</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Start</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">End</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Fare</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Stops</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={8} columns={10} />
                ) : routes.length > 0 ? (
                  routes.map((route) => {
                    const driverName = typeof route.driverId === "object"
                      ? (route.driverId as any)?.name
                      : "—"
                    return (
                      <TableRow key={route._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-semibold text-gray-900">{route.routeName}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            route.routeType === "pickup"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {route.routeType}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">{route.routeTime}</TableCell>
                        <TableCell className="text-gray-600">{driverName}</TableCell>
                        <TableCell className="text-gray-600 max-w-36 truncate">{route.startLocation?.name || "—"}</TableCell>
                        <TableCell className="text-gray-600 max-w-36 truncate">{route.endLocation?.name || "—"}</TableCell>
                        <TableCell className="font-semibold text-gray-900">£{route.routeFare ?? 0}</TableCell>
                        <TableCell className="text-gray-600">{route.stops?.length ?? 0}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            route.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            {route.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                              onClick={() => openDetails(route)}
                              title="View"
                            >
                              <Eye size={13} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                              onClick={() => openEdit(route)}
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50 bg-transparent"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Delete Route</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete "{route.routeName}"? This cannot be undone.
                                </AlertDialogDescription>
                                <div className="flex justify-end gap-3 mt-4">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deleteMutation.mutate(route._id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-gray-400">
                      No routes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RouteFormModal
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setSelected(null) }}
        mode={formMode}
        initial={selected}
      />
      <RouteDetailsModal
        open={detailsOpen}
        onOpenChange={(v) => { setDetailsOpen(v); if (!v) setSelected(null) }}
        route={selected}
      />
    </div>
  )
}
