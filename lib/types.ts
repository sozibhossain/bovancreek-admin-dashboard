export interface Booking {
  _id: string
  parentId: {
    _id: string
    name: string
    username: string
    phone?: string
    email?: string
  }
  childId: {
    _id: string
    fullName: string
    schoolName: string
    dateOfBirth?: string
    emergencyContactName?: string
    emergencyContactNumber?: string[]
  }
  routeId?: {
    _id: string
    routeName: string
    routeType: string
    routeFare: number
    routeTime: string
    driverId?: string
    startLocation?: { name: string }
    endLocation?: { name: string }
    stops?: Stop[]
  }
  dateAndTime?: { date: string; time: string; type: "pickup" | "dropoff" | "both" }[]
  pickupLocation: string
  dropOffLocation: string
  dropOffTime: string
  totalPayment: number
  credit: number
  isApprove: boolean
  rideType?: "homeToSchool" | "schoolToHome"
  status: "inProgress" | "completed" | "cancelled"
  stopAges?: string[]
  newRoute?: boolean
  onTime?: boolean
  driverId?: string
  createdAt: string
  updatedAt: string
}

export interface Stop {
  _id?: string
  name: string
  arrivalTime?: string
  order: number
  location?: {
    type: string
    coordinates: number[]
  }
}

export interface Vehicle {
  _id: string
  regNum: string
  type: string
  capacity: number
  fitNessCertificate?: {
    public_id: string
    url: string
  }
  insurance?: {
    public_id: string
    url: string
  }
  motDate?: string
  insuranceExpire?: string
  driverId?: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
}

export interface DriverDetails {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone?: string
    emergencyContact?: string
    location?: string
    role: string
    avatar?: { url: string; public_id: string }
  }
  assignedVehicle?: Vehicle
  AssignedRoute?: Route
  license?: {
    public_id: string
    url: string
  }
  certificate?: {
    public_id: string
    url: string
  }
  status: "active" | "deactivate"
  createdAt: string
  updatedAt: string
}

// Driver as returned by /users/all/drivers-with-details
export interface Driver {
  _id: string
  name: string
  email: string
  phone?: string
  emergencyContact?: string
  location?: string
  role: string
  avatar?: { url: string; public_id: string }
  driverDetails?: DriverDetails
  assignedVehicle?: Vehicle
  AssignedRoute?: Route
  license?: string
  status?: "active" | "deactivate"
  createdAt: string
  updatedAt: string
}

export interface Route {
  _id: string
  routeName: string
  routeType: "pickup" | "dropoff"
  routeFare: number
  routeTime: string
  driverId?: {
    _id: string
    name: string
    email: string
    phone?: string
  } | string
  startLocation: {
    name: string
    location?: {
      type: string
      coordinates: number[]
    }
  }
  endLocation: {
    name: string
    location?: {
      type: string
      coordinates: number[]
    }
  }
  stops: Stop[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Parent {
  _id: string
  name: string
  email: string
  username: string
  phone?: string
  avatar?: {
    url: string
    public_id: string
  }
  emergencyContact?: string | number
  location?: string
  credit?: number | null
  fine?: number
  role: string
  parentSetupCompleted?: boolean
  parentSetup?: {
    firstNameOnId?: string
    lastNameOnId?: string
    dateOfBirth?: string
    phoneNumber?: string
    streetAddress?: string
    area?: string
    postcode?: string
    childProfiles?: ChildProfile[]
    termsAccepted?: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface ChildProfile {
  _id?: string
  name: string
  schoolName: string
  relationship?: string
  dateOfBirth?: string
  avatarUrl?: string
}

export interface ChildInfo {
  _id: string
  userId: string
  fullName: string
  dateOfBirth?: string
  schoolName: string
  emergencyContactName: string
  emergencyContactNumber: string[]
  relationship?: string
  avatar?: { url: string; public_id: string }
  createdAt: string
  updatedAt: string
}

export interface Payment {
  _id: string
  orderId: string
  userId?: {
    _id: string
    name: string
    email: string
  } | string | null
  amount: number
  currency: string
  status: "completed" | "pending" | "failed"
  paymentMethod: string
  captureId?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name?: string
  email: string
  role: "admin" | "parent" | "driver"
  accessToken: string
  refreshToken: string
}

export interface ApiMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
