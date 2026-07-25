import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    // Backend POST /api/user/register only accepts: { username, password, email }
    const { confirmPassword, terms, sex, dateOfBirth, ...rest } = data
    const payload = { username: rest.username, password: rest.password, email: rest.email }
    const result = await registerUser(payload)
    if (result.success) {
      showToast.success('Account created! Please sign in.')
      navigate('/login')
    } else {
      showToast.error(result.message)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-gray-900 text-[1.75rem] leading-tight mb-1.5">Create account</h1>
        <p className="text-sm text-gray-500">Get started with SyncSpace today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input label="Username" placeholder="johndoe" icon={<User size={15} />}
          error={errors.username?.message}
          {...register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 characters' } })} />

        <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          })} />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Gender"
            options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]}
            placeholder="Gender" error={errors.sex?.message}
            {...register('sex', { required: 'Required' })} />
          <Input label="Date of birth" type="date" icon={<Calendar size={15} />}
            {...register('dateOfBirth')} />
        </div>

        <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
          icon={<Lock size={15} />}
          iconRight={
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password', {
            required: 'Required',
            minLength: { value: 8, message: 'Min 8 characters' },
            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase & number' },
          })} />

        <Input label="Confirm password" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
          icon={<Lock size={15} />}
          iconRight={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Required',
            validate: (v) => v === password || 'Passwords do not match',
          })} />

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input type="checkbox"
            className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500/30"
            {...register('terms', { required: 'You must accept the terms' })} />
          <span className="text-xs text-gray-500 leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-danger-600 -mt-2">{errors.terms.message}</p>}

        <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">Sign in</Link>
      </p>
    </div>
  )
}
