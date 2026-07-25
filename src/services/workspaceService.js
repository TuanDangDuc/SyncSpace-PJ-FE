import api from './api'

const workspaceService = {
  /**
   * GET /api/workspace?page={page}&size={size}
   * Response: { content: WorkSpaceDtoResponse[], page: { ... } }
   */
  getAll: ({ page = 0, size = 20 } = {}) =>
    api.get('/api/workspace', { params: { page, size } }).then((r) => r.data),

  /**
   * GET /api/workspace/{id}
   * Response: WorkSpaceDtoResponse (includes ListImageUrl[])
   */
  getById: (id) =>
    api.get(`/api/workspace/${id}`).then((r) => r.data),

  /**
   * GET /api/workspace/location/{locationId}?page={page}&size={size}
   * Response: Paginated WorkSpaceDtoResponse
   */
  getByLocation: (locationId, { page = 0, size = 50 } = {}) =>
    api.get(`/api/workspace/location/${locationId}`, { params: { page, size } }).then((r) => r.data),

  /**
   * POST /api/workspace  (Admin)
   * Body: { floor, roomNumber, type, acreage, status, capacity, locationId, thumbnailUrl }
   * Response 201: WorkSpaceDtoResponse
   */
  create: (payload) =>
    api.post('/api/workspace', payload).then((r) => r.data),

  /**
   * PUT /api/workspace/{id}  (Admin)
   * Body: WorkSpaceDtoRequest
   * Response 200: WorkSpaceDtoResponse
   */
  update: (id, payload) =>
    api.put(`/api/workspace/${id}`, payload).then((r) => r.data),

  /**
   * DELETE /api/workspace/{id}  (Admin)
   * Response 204 No Content
   */
  delete: (id) =>
    api.delete(`/api/workspace/${id}`).then((r) => r.data),

  /**
   * POST /api/image — Upload images to Cloudinary
   * Content-Type: multipart/form-data, field: file (can be multiple)
   * Response: string[] — array of Cloudinary URLs
   */
  uploadImages: (formData) =>
    api.post('/api/image', formData, {
      headers: { 'Content-Type': null }
    }).then((r) => r.data),
}

export default workspaceService
