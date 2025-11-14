import { useState } from 'react'
import { authAPI } from '../../services/api'

const getInitialFormState = () => ({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const AdminChangePassword = () => {
  const [formData, setFormData] = useState(getInitialFormState())
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage(null)

    try {
      await authAPI.changePassword(formData)
      setStatusMessage({ type: 'success', text: 'Password updated successfully.' })
      setFormData(getInitialFormState())
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.new_password?.[0] ||
        'Unable to update password. Please try again.'
      setStatusMessage({ type: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500">Update your CMS access password securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {statusMessage && (
              <div
                className={`px-4 py-3 rounded-md text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#9dbf93] focus:ring-[#9dbf93]"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#9dbf93] focus:ring-[#9dbf93]"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#9dbf93] focus:ring-[#9dbf93]"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Tip: Use a strong password with letters, numbers, & symbols.</p>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-[#4a7c28] mt-1">•</span>
              Password changes update your CMS & API access instantly.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4a7c28] mt-1">•</span>
              Never reuse passwords from other systems.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4a7c28] mt-1">•</span>
              Contact your platform admin if you suspect unauthorized access.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminChangePassword

