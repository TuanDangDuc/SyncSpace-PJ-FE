import api from './api'

const locationService = {
  /**
   * GET /api/location?page={page}&size={size}
   * Response: { content: LocationDtoResponse[], page: { size, number, totalElements, totalPages } }
   */
  getAll: ({ page = 0, size = 20, search = '', ward = '' } = {}) =>
    api.get('/api/location', { params: { page, size, search, ward } }).then((r) => r.data),

  /**
   * GET /api/location/{id}
   * Response: { id, name, ward }
   */
  getById: (id) =>
    api.get(`/api/location/${id}`).then((r) => r.data),

  /**
   * POST /api/location  (Admin)
   * Body: { name, ward }
   * Response 201: LocationDtoResponse
   */
  create: (payload) =>
    api.post('/api/location', payload).then((r) => r.data),

  /**
   * PUT /api/location/{id}  (Admin)
   * Body: { name, ward }
   * Response 200: LocationDtoResponse
   */
  update: (id, payload) =>
    api.put(`/api/location/${id}`, payload).then((r) => r.data),

  /**
   * DELETE /api/location/{id}  (Admin)
   * Response 204 No Content
   */
  delete: (id) =>
    api.delete(`/api/location/${id}`).then((r) => r.data),
}

export default locationService
