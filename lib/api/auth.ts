import api from "./axios"

export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdatePasswordResponse {
  success: boolean
  message: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// Auth API functions
export const authApi = {
  // Update password
  updatePassword: async (passwordData: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
    const response = await api.patch<ApiResponse<UpdatePasswordResponse>>("/api/auth/update-password", passwordData)
    return response.data.data
  },

  // Verify current password
  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    const response = await api.post<ApiResponse<{ valid: boolean }>>("/api/auth/verify-password", { password })
    return response.data.data
  },

  // Change password (alternative endpoint)
  changePassword: async (oldPassword: string, newPassword: string): Promise<UpdatePasswordResponse> => {
    const response = await api.put<ApiResponse<UpdatePasswordResponse>>("/api/auth/change-password", {
      oldPassword,
      newPassword,
    })
    return response.data.data
  },
}
