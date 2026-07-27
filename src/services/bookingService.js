import api from './api'

const bookingService = {
  /**
   * POST /api/booking  (Authenticated User)
   * Body: { userId, bookingSlots: [{ workspaceId, startTime, endTime }] }
   * startTime/endTime format: "2026-07-20T08:00:00"
   * Response 201: BookingEntity
   */
  create: (payload) =>
    api.post('/api/booking', payload).then((r) => r.data),

  /**
   * GET /api/booking?page={page}&size={size}
   */
  getAllBookings: ({ page = 0, size = 8, status = '', sort = '' } = {}) => {
    const params = { page, size }
    if (status) params.paymentStatus = status
    if (sort) params.sort = sort
    return api.get('/api/booking', { params }).then((r) => r.data)
  },

  /**
   * GET /api/booking/get-history-booking/{userId}?page={page}&size={size}
   * Response: Page<BookingEntity>
   * BookingEntity: { id, createAt, paymentStatus, totalCost, bookingSlots }
   * BookingSlotEntity: { id, startTime, endTime, bookingStatus, workspace: { roomNumber, location } }
   * Page format: { content: [], totalPages, totalElements, number, size }
   */
  getMyBookings: (userId, { page = 0, size = 6, status = '', sort = '' } = {}) => {
    const params = { page, size }
    if (status) params.paymentStatus = status
    if (sort) params.sort = sort
    return api.get(`/api/booking/get-history-booking/${userId}`, { params }).then((r) => r.data)
  },

  /**
   * DELETE /api/booking/{id}/cancel?userId={userId}
   * Response: 204 No Content
   */
  cancel: (id, userId) =>
    api.delete(`/api/booking/${id}/cancel`, { params: { userId } }),
}

export default bookingService
