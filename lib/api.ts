import apiClient from "./api-client"

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post("/users/login", { email, password }),
  forgetPassword: (email: string) =>
    apiClient.post("/users/forgot-password", { email }),
  verifyOtp: (email: string, otp: string) =>
    apiClient.post("/users/verify-otp", { email, otp }),
  resetPassword: (token: string, password: string) =>
    apiClient.post(`/users/reset-password/${token}`, { password }),
}

// Bookings APIs
export const bookingsAPI = {
  getAllBookings: (page = 1, limit = 10) =>
    apiClient.get(`/scheduleBooking/all-booking?page=${page}&limit=${limit}`),
  getBookingDetails: (bookingId: string) =>
    apiClient.get(`/scheduleBooking/get/${bookingId}`),
  updateBookingStatus: (bookingId: string, isApprove: boolean) =>
    apiClient.put(`/scheduleBooking/booking-status/${bookingId}`, { isApprove }),
  assignDriver: (bookingId: string, driverId: string) =>
    apiClient.put(`/scheduleBooking/add-driver/${bookingId}`, { driverId }),
  cancelBooking: (bookingId: string) =>
    apiClient.patch(`/scheduleBooking/${bookingId}/cancel`),
  completeBooking: (bookingId: string) =>
    apiClient.patch(`/scheduleBooking/${bookingId}/complete`),
  deleteBooking: (bookingId: string) =>
    apiClient.delete(`/scheduleBooking/delete-booking/${bookingId}`),
  updateBooking: (bookingId: string, data: any) =>
    apiClient.put(`/scheduleBooking/update-booking/${bookingId}`, data),
}

// Vehicles APIs
export const vehiclesAPI = {
  getAllVehicles: (page = 1, limit = 10) =>
    apiClient.get(`/vehicles?page=${page}&limit=${limit}`),
  getVehicleDetails: (vehicleId: string) =>
    apiClient.get(`/vehicles/${vehicleId}`),
  createVehicle: (data: FormData) =>
    apiClient.post("/vehicles", data),
  updateVehicle: (vehicleId: string, data: FormData) =>
    apiClient.put(`/vehicles/${vehicleId}`, data),
  deleteVehicle: (vehicleId: string) =>
    apiClient.delete(`/vehicles/${vehicleId}`),
  assignDriver: (vehicleId: string, driverId: string) =>
    apiClient.put(`/vehicles/${vehicleId}/assign-driver`, { driverId }),
}

// Drivers APIs
export const driversAPI = {
  getAllDrivers: (page = 1, limit = 10) =>
    apiClient.get(`/users/all/drivers-with-details?page=${page}&limit=${limit}`),
  getDriverDetails: (driverId: string) =>
    apiClient.get(`/driver-details/${driverId}`),
  createDriverDetails: (data: FormData) =>
    apiClient.post("/driver-details", data),
  updateDriverDetails: (detailId: string, data: FormData) =>
    apiClient.put(`/driver-details/${detailId}`, data),
  deleteDriverDetails: (detailId: string) =>
    apiClient.delete(`/driver-details/${detailId}`),
  toggleDriverStatus: (detailId: string, status: "active" | "deactivate") =>
    apiClient.patch(`/driver-details/${detailId}/status`, { status }),
  getAllDriverDetails: () =>
    apiClient.get("/driver-details"),
}

// Routes APIs
export const routesAPI = {
  getAllRoutes: (page = 1, limit = 100) =>
    apiClient.get(`/routes/get-all?page=${page}&limit=${limit}`),
  getRouteDetails: (routeId: string) =>
    apiClient.get(`/routes/get/${routeId}`),
  createRoute: (data: any) =>
    apiClient.post("/routes/add", data),
  updateRoute: (routeId: string, data: any) =>
    apiClient.put(`/routes/update/${routeId}`, data),
  deleteRoute: (routeId: string) =>
    apiClient.delete(`/routes/delete/${routeId}`),
}

// Parents APIs
export const parentsAPI = {
  getAllParents: (page = 1, limit = 10) =>
    apiClient.get(`/users/parents?page=${page}&limit=${limit}`),
  getParentDetails: (parentId: string) =>
    apiClient.get(`/users/users/${parentId}`),
  getParentBookings: (parentId: string) =>
    apiClient.get(`/scheduleBooking/all-booking?parentId=${parentId}`),
}

// Payments APIs
export const paymentsAPI = {
  getAllPayments: (page = 1, limit = 10, status = "") =>
    apiClient.get(
      `/paypal/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`
    ),
}

// User APIs
export const userAPI = {
  getMyProfile: () => apiClient.get("/users/my-profile"),
  getUserById: (userId: string) => apiClient.get(`/users/users/${userId}`),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.put("/users/change-password", { oldPassword, newPassword }),
  updateProfile: (data: FormData) =>
    apiClient.put("/users/update-profile", data),
}
