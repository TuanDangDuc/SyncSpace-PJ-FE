import api from './api'

const adminService = {
  /**
   * GET /api/user?page={page}&size={size}
   * Response: { content: UserDtoResponse[], page: { size, number, totalElements, totalPages } }
   */
  getUsers: ({ page = 0, size = 10 } = {}) =>
    api.get('/api/user', { params: { page, size } }).then((r) => r.data),

  /**
   * PATCH /api/user/change-role?username={username}&role={role}
   * role: USER | ADMIN
   * Response 200: UserDtoResponse
   */
  updateUserRole: (username, role) =>
    api.patch('/api/user/change-role', null, { params: { username, role } }).then((r) => r.data),

  /**
   * PATCH /api/user/change-status?username={username}&status={status}
   * status: ACTIVE | INACTIVE
   * Response 200: UserDtoResponse
   */
  updateUserStatus: (username, status) =>
    api.patch('/api/user/change-status', null, { params: { username, status } }).then((r) => r.data),

  /**
   * DELETE /api/user/{username}
   * Response 240 No Content
   */
  deleteUser: (username) =>
    api.delete(`/api/user/${username}`).then((r) => r.data),
}

export default adminService
