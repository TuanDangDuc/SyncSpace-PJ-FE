import api from './api'

const authService = {
  /**
   * POST /api/user/login
   * Body: { username, password }
   * Response: { accessToken, refreshToken }
   */
  login: (credentials) =>
    api.post('/api/user/login', credentials, { withCredentials: true }).then((r) => r.data),

  /**
   * POST /api/user/register
   * Body: { username, password, email }
   * Response 201 Created
   */
  register: (payload) =>
    api.post('/api/user/register', payload).then((r) => r.data),

  /**
   * GET /api/user/get-info/{username}
   * Response: UserDtoResponse
   */
  getMe: (username) =>
    api.get(`/api/user/get-info/${username}`).then((r) => r.data),

  /**
   * PUT /api/user/update-info/{username}
   * Body: { email, sex, dateOfBirth, avatarUrl }
   * Response: UserDtoResponse
   */
  updateProfile: (username, payload) =>
    api.put(`/api/user/update-info/${username}`, payload).then((r) => r.data),

  /**
   * POST /api/image
   * Content-Type: multipart/form-data
   * Form field: file (one or multiple)
   * Response: string[] — array of Cloudinary URLs
   */
  uploadImages: (formData) =>
    api.post('/api/image', formData, {
      headers: { 'Content-Type': null }
    }).then((r) => r.data),
}

export default authService
