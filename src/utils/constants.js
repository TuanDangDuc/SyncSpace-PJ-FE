export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.syncspace.anhchuno.id.vn'

// ── WorkSpace Types (backend enum: Type) ─────────────────────────────────────
export const WORKSPACE_TYPE = {
  PRIVATE_OFFICE:   'PRIVATE_OFFICE',
  SHARED_OFFICE:    'SHARED_OFFICE',
  OPEN_OFFICE:      'OPEN_OFFICE',
  MEETING_ROOM:     'MEETING_ROOM',
  CONFERENCE_ROOM:  'CONFERENCE_ROOM',
  CREATIVE_STUDIO:  'CREATIVE_STUDIO',
  TRAINING_ROOM:    'TRAINING_ROOM',
}

export const WORKSPACE_TYPE_LABEL = {
  PRIVATE_OFFICE:   'Private Office',
  SHARED_OFFICE:    'Shared Office',
  OPEN_OFFICE:      'Open Office',
  MEETING_ROOM:     'Meeting Room',
  CONFERENCE_ROOM:  'Conference Room',
  CREATIVE_STUDIO:  'Creative Studio',
  TRAINING_ROOM:    'Training Room',
}

// ── WorkSpace Status (backend enum: WorkSpaceStatus) ─────────────────────────
export const WORKSPACE_STATUS = {
  ACTIVE:      'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE:    'INACTIVE',
}

export const WORKSPACE_STATUS_LABEL = {
  ACTIVE:      'Active',
  MAINTENANCE: 'Maintenance',
  INACTIVE:    'Inactive',
}

// ── Booking Status (backend enum: BookingStatus) ──────────────────────────────
export const BOOKING_STATUS = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export const BOOKING_STATUS_LABEL = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

// ── Payment Status (backend enum: PaymentStatus) ──────────────────────────────
export const PAYMENT_STATUS = {
  PENDING:   'PENDING',
  PAID:      'PAID',
  FAILED:    'FAILED',
  CANCELLED: 'CANCELLED',
}

export const PAYMENT_STATUS_LABEL = {
  PENDING:   'Pending',
  PAID:      'Paid',
  FAILED:    'Failed',
  CANCELLED: 'Cancelled',
}

// ── User Role (backend enum: Role) ───────────────────────────────────────────
export const USER_ROLE = {
  USER:  'USER',
  ADMIN: 'ADMIN',
}

// ── User Status (backend enum: UserStatus) ───────────────────────────────────
export const USER_STATUS = {
  ACTIVE:   'ACTIVE',
  INACTIVE: 'INACTIVE',
}

export const USER_STATUS_LABEL = {
  ACTIVE:   'Active',
  INACTIVE: 'Inactive',
}

// ── Sex (backend enum: Sex) ───────────────────────────────────────────────────
export const SEX = { MALE: 'MALE', FEMALE: 'FEMALE', OTHER: 'OTHER' }

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10

// ── Workspace type UI meta ────────────────────────────────────────────────────
export const WORKSPACE_TYPE_META = {
  PRIVATE_OFFICE:  { icon: 'Briefcase', color: 'text-violet-400', bg: 'bg-violet-500/10',  border: 'border-violet-500/20'  },
  SHARED_OFFICE:   { icon: 'Users',     color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
  OPEN_OFFICE:     { icon: 'Layout',    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'    },
  MEETING_ROOM:    { icon: 'Users',     color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
  CONFERENCE_ROOM: { icon: 'Monitor',   color: 'text-indigo-400', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20'  },
  CREATIVE_STUDIO: { icon: 'Palette',   color: 'text-pink-400',   bg: 'bg-pink-500/10',    border: 'border-pink-500/20'    },
  TRAINING_ROOM:   { icon: 'BookOpen',  color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
}

// ── Workspace status UI meta ──────────────────────────────────────────────────
export const STATUS_META = {
  ACTIVE:      { dot: 'status-available',   badge: 'bg-success-50 text-success-700 border-success-200' },
  MAINTENANCE: { dot: 'status-maintenance', badge: 'bg-warning-50 text-warning-700 border-warning-200' },
  INACTIVE:    { dot: 'status-occupied',    badge: 'bg-danger-50 text-danger-700 border-danger-200'    },
}
