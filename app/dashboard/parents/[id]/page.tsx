"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Trash2 } from "lucide-react"
import { parentsAPI, bookingsAPI } from "@/lib/api"
import type { Parent, Booking } from "@/lib/types"

function prettyDate(d?: string) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    })
  } catch { return d }
}

function prettyDateTime(d?: string, t?: string) {
  if (!d) return "—"
  const date = prettyDate(d)
  return t ? `${date}, ${t}` : date
}

function padNum(n: number) {
  return String(n).padStart(2, "0")
}

export default function ParentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const parentId = params.id as string

  const { data: parentRes, isLoading: parentLoading } = useQuery({
    queryKey: ["parent", parentId],
    queryFn: () => parentsAPI.getParentDetails(parentId),
    enabled: !!parentId,
  })

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", 1, 1000],
    queryFn: () => bookingsAPI.getAllBookings(1, 1000),
    enabled: !!parentId,
  })

  const parent: Parent | null =
    parentRes?.data?.data ?? parentRes?.data ?? null

  const allBookings: Booking[] = bookingsRes?.data?.data ?? []
  const parentBookings = allBookings.filter(
    (b) => b.parentId?._id === parentId
  )

  // Children from parentSetup.childProfiles
  const childProfiles = parent?.parentSetup?.childProfiles ?? []

  // Count bookings per child name
  const bookingsPerChild = (childName: string) =>
    parentBookings.filter(
      (b) => b.childId?.fullName?.toLowerCase() === childName?.toLowerCase()
    ).length

  const contactNumber =
    parent?.phone ?? parent?.parentSetup?.phoneNumber ?? "—"

  const emergencyContact = parent?.emergencyContact
    ? String(parent.emergencyContact)
    : "—"

  const address = parent?.location ?? "—"

  const councilMember = parent?.parentSetupCompleted ? "Yes" : "No"

  const childrenCount = padNum(childProfiles.length)

  if (parentLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 rounded-full"
        >
          <ArrowLeft size={16} /> Go back
        </Button>
        <p className="text-muted-foreground">Parent not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parent Profile Detail</h1>
        <p className="text-gray-500 mt-1">This is route detail page</p>
      </div>

      {/* Go back */}
      <Button
        onClick={() => router.back()}
        className="bg-[#8E97FD] hover:bg-[#7D86E0] text-white font-semibold rounded-full px-6 gap-2"
      >
        <ArrowLeft size={16} />
        Go back
      </Button>

      {/* Basic Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Parent Name</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Contact Number</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Emergency Number</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Address</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Council Member</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-600">Children</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-5 font-semibold text-gray-900">{parent.name}</td>
                  <td className="py-3 px-5 text-gray-700">{contactNumber}</td>
                  <td className="py-3 px-5 text-gray-700">{emergencyContact}</td>
                  <td className="py-3 px-5 text-gray-700">{address}</td>
                  <td className="py-3 px-5 text-gray-700">{councilMember}</td>
                  <td className="py-3 px-5 text-gray-700">{childrenCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Total Bookings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Total Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium">Passenger Name</TableHead>
                  <TableHead className="text-gray-500 font-medium">Contact Number</TableHead>
                  <TableHead className="text-gray-500 font-medium">Pickup Location</TableHead>
                  <TableHead className="text-gray-500 font-medium">Drop-off Location</TableHead>
                  <TableHead className="text-gray-500 font-medium">Ride Date & Time</TableHead>
                  <TableHead className="text-gray-500 font-medium">Driver Assigned</TableHead>
                  <TableHead className="text-gray-500 font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-400 text-sm">
                      Loading bookings…
                    </TableCell>
                  </TableRow>
                ) : parentBookings.length > 0 ? (
                  parentBookings.map((b) => {
                    const dt = b.dateAndTime?.[0]
                    return (
                      <TableRow
                        key={b._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="font-semibold text-gray-900">
                          {b.childId?.fullName ?? b.parentId?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {contactNumber}
                        </TableCell>
                        <TableCell className="text-gray-700 max-w-36 truncate">
                          {b.pickupLocation ?? "—"}
                        </TableCell>
                        <TableCell className="text-gray-700 max-w-36 truncate">
                          {b.dropOffLocation ?? "—"}
                        </TableCell>
                        <TableCell className="text-gray-700 whitespace-nowrap">
                          {prettyDateTime(dt?.date, dt?.time)}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {/* driverId isn't populated in booking — show dash */}
                          {(b as any).driverName ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#8E97FD] hover:bg-[#7D86E0] text-white font-semibold rounded-full h-8 px-4 text-sm"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full h-8 px-4 text-sm bg-transparent"
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-400"
                    >
                      No bookings found for this parent.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Children Profiles */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Children Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {childProfiles.length === 0 ? (
            <p className="text-sm text-gray-400">No children profiles found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {childProfiles.map((child, i) => {
                const childBookings = bookingsPerChild(child.name)
                return (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      {child.avatarUrl ? (
                        <img
                          src={child.avatarUrl}
                          alt={child.name}
                          className="w-11 h-11 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-linear-to-br from-primary/60 to-secondary/60 flex items-center justify-center text-white font-bold text-base shrink-0">
                          {child.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 text-base">
                        {child.name}
                      </h3>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">Booking</p>
                        <p className="font-bold text-gray-900 text-base">
                          {padNum(childBookings)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Date of Birth</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {child.dateOfBirth ? prettyDate(child.dateOfBirth) : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mb-4">
                      <p className="text-gray-400 text-xs mb-0.5">School Name</p>
                      <p className="font-semibold text-gray-900 text-sm leading-snug">
                        {child.schoolName ?? "—"}
                      </p>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-500 hover:bg-red-50 font-semibold rounded-full bg-transparent gap-2"
                    >
                      <Trash2 size={14} />
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
