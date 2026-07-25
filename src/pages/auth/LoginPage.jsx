import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      navigate('/')
    } else {
      showToast.error(result.message)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-gray-900 text-[1.75rem] leading-tight mb-1.5">
          Sign in
        </h1>
        <p className="text-sm text-gray-500">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder="Enter username"
          icon={<User size={15} strokeWidth={1.5} />}
          error={errors.username?.message}
          {...register('username', { required: 'Username is required' })}
        />
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock size={15} strokeWidth={1.5} />}
          iconRight={
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
          })}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox"
              className="w-3.5 h-3.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500/30" />
            <span className="text-gray-600 text-xs">Remember me</span>
          </label>
          <a href="#" className="text-xs text-primary-600 hover:text-primary-700 transition-colors">
            Forgot password?
          </a>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-1">
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-150" />
        <span className="text-xs text-gray-400">or continue with</span>
        <div className="flex-1 h-px bg-gray-150" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {['Google', 'GitHub'].map((p) => (
          <button key={p} type="button"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-75 hover:border-gray-300 transition-colors">
            {p}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mt-7">
        No account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
