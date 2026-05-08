export interface Staff {
  staff_id: number
  full_name: string
  role: string
  email: string
  phone?: string
}

export interface Student {
  student_id: number
  full_name: string
  email: string
  phone?: string
  national_id?: string
  date_of_birth?: string
  gender?: string
  faculty?: string
  year_of_study?: number
  created_at: string
}

export interface Dormitory {
  dorm_id: number
  name: string
  address?: string
  type: 'mixed' | 'male' | 'female'
  total_rooms?: number
  staff_id?: number
}

export interface Room {
  room_id: number
  dorm_id: number
  room_number: string
  room_type?: 'single' | 'double' | 'triple'
  capacity: number
  current_occupancy: number
  monthly_fee?: number
  status: 'available' | 'full' | 'maintenance'
}

export interface Application {
  application_id: number
  student_id: number
  dorm_id: number
  preferred_move_in?: string
  room_preference?: string
  status: 'pending' | 'approved' | 'rejected'
  applied_at: string
  reviewed_at?: string
  reviewed_by?: number
  student_name?: string
  dorm_name?: string
}

export interface Assignment {
  assignment_id: number
  student_id: number
  room_id: number
  application_id: number
  check_in_date: string
  check_out_date?: string
  status: 'active' | 'completed'
  created_at: string
}

export interface Payment {
  payment_id: number
  student_id: number
  assignment_id: number
  amount: number
  payment_type?: string
  status: 'paid' | 'unpaid' | 'overdue'
  due_date: string
  paid_date?: string
  receipt_number?: string
}

export interface MaintenanceRequest {
  request_id: number
  room_id: number
  student_id: number
  assigned_to?: number
  category?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved'
  submitted_at: string
  resolved_at?: string
}
