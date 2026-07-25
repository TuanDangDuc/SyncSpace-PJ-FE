import { cn } from '@/utils/cn'

const sizes = {
  xs:   'w-6 h-6 text-[10px]',
  sm:   'w-8 h-8 text-xs',
  md:   'w-9 h-9 text-sm',
  lg:   'w-11 h-11 text-base',
  xl:   'w-14 h-14 text-lg',
  '2xl':'w-20 h-20 text-2xl',
}

const palettes = [
  'bg-primary-100 text-primary-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

function pickPalette(name = '') {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return palettes[code % palettes.length]
}

export default function Avatar({ src, name = '', size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover ring-2 ring-white shadow-xs', sizes[size], className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold shrink-0', pickPalette(name), sizes[size], className)}>
      {initials(name)}
    </div>
  )
}
