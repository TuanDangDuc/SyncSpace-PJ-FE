import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export default function SessionTimeoutModal() {
  const { isSessionExpiring, refreshNow, setSessionExpiring, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleExtend = async () => {
    setLoading(true)
    try {
      await refreshNow()
      setSessionExpiring(false)
    } catch (err) {
      // If refresh fails, it will automatically logout via authStore
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setSessionExpiring(false)
    logout()
  }

  return (
    <Modal open={isSessionExpiring} onClose={() => {}} title="Phiên đăng nhập sắp hết hạn" size="sm">
      <div className="flex flex-col items-center text-center py-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-amber-500" />
        </div>
        <p className="font-medium text-gray-900 mb-1.5">Bạn có muốn tiếp tục sử dụng?</p>
        <p className="text-sm text-gray-500 mb-6">Phiên làm việc của bạn sắp kết thúc. Hãy gia hạn để không bị đăng xuất và tiếp tục công việc của mình nhé!</p>
        <div className="flex gap-2.5 w-full">
          <Button variant="secondary" className="flex-1" onClick={handleLogout} disabled={loading}>Đăng xuất</Button>
          <Button variant="primary" className="flex-1" onClick={handleExtend} loading={loading}>Gia hạn ngay</Button>
        </div>
      </div>
    </Modal>
  )
}
