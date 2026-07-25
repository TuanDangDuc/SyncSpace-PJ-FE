import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Calendar, Shield, Camera, Lock, Save } from 'lucide-react'
import { showToast } from '@/utils/toast'
import authService from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'

function Section({ title, description, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-150 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
      <div className="px-5 py-4 border-b border-gray-150">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passLoading,    setPassLoading]    = useState(false)

  const { register: rp, handleSubmit: hp, formState: { errors: pe } } = useForm({
    defaultValues: {
      username:    user?.username    || '',
      email:       user?.email       || '',
      sex:         user?.sex         || '',
      dateOfBirth: user?.dateOfBirth || '',
    },
  })

  const { register: rpass, handleSubmit: hpass, watch: wpass, reset: resetPass, formState: { errors: pw } } = useForm()
  const newPass = wpass('newPassword')

  const onSaveProfile = async (data) => {
    setProfileLoading(true)
    try {
      // Backend PUT /api/user/update-info/{username} accepts: email, sex, dateOfBirth, avatarUrl
      const payload = {
        email:       data.email,
        sex:         data.sex || null,
        dateOfBirth: data.dateOfBirth || null,
        avatarUrl:   user?.avatarUrl || null,
      }
      const updated = await authService.updateProfile(user.username, payload)
      updateUser(updated)
      showToast.success('Profile updated')
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Update failed')
    } finally { setProfileLoading(false) }
  }

  const onChangePassword = async () => {
    toast('Tính năng đổi mật khẩu đang được phát triển')
  }

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const urls = await authService.uploadImages(formData)
      const avatarUrl = Array.isArray(urls) ? urls[0] : null
      if (!avatarUrl) return
      const updated = await authService.updateProfile(user.username, {
        email:       user.email,
        sex:         user.sex || null,
        dateOfBirth: user.dateOfBirth || null,
        avatarUrl,
      })
      updateUser(updated)
      showToast.success('Avatar updated')
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-[#FAF9F6] border-b border-gray-150">
        <div className="page-container py-10">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <Avatar src={user?.avatarUrl} name={user?.username} size="2xl" />
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={18} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="font-display font-semibold text-gray-900 text-[1.75rem]">{user?.username}</h1>
                <Badge variant={user?.role === 'ADMIN' ? 'warm' : 'primary'}>{user?.role}</Badge>
                <Badge variant={user?.status === 'ACTIVE' ? 'success' : 'danger'} dot>{user?.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Mail size={13} strokeWidth={1.5} />{user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="max-w-xl space-y-5">
          {/* Profile form */}
          <Section title="Personal Information" description="Update your display name and details">
            <form onSubmit={hp(onSaveProfile)} className="space-y-4">
              <Input label="Email" type="email" icon={<Mail size={14} />} error={pe.email?.message}
                {...rp('email', { required: 'Required' })} />
              <div className="grid grid-cols-2 gap-3.5">
                <Select label="Gender"
                  options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]}
                  placeholder="Gender" {...rp('sex')} />
                <Input label="Date of birth" type="date" icon={<Calendar size={14} />} {...rp('dateOfBirth')} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" loading={profileLoading} icon={<Save size={14} />}>
                  Save changes
                </Button>
              </div>
            </form>
          </Section>

          {/* Password */}
          <Section title="Change Password" description="Use a strong password with uppercase, lowercase and numbers">
            <form onSubmit={hpass(onChangePassword)} className="space-y-4">
              <Input label="Current password" type="password" placeholder="••••••••" icon={<Lock size={14} />}
                error={pw.oldPassword?.message}
                {...rpass('oldPassword', { required: 'Required' })} />
              <Input label="New password" type="password" placeholder="Min 8 characters" icon={<Lock size={14} />}
                error={pw.newPassword?.message}
                {...rpass('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
              <Input label="Confirm new password" type="password" placeholder="Re-enter new password" icon={<Lock size={14} />}
                error={pw.confirmPassword?.message}
                {...rpass('confirmPassword', {
                  required: 'Required',
                  validate: (v) => v === newPass || 'Passwords do not match',
                })} />
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" size="sm" loading={passLoading} icon={<Shield size={14} />}>
                  Update password
                </Button>
              </div>
            </form>
          </Section>

          {/* Account meta */}
          <Section title="Account Details">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'User ID',  value: user?.id?.slice(0, 12) + '…' },
                { label: 'Role',     value: user?.role },
                { label: 'Status',   value: user?.status },
                { label: 'Joined',   value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-md border border-gray-150" style={{ backgroundColor: '#F5F1EB' }}>
                  <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
