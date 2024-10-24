












import React from 'react'

interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  className?: string
}

const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange, className }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
    />
  )
}

export { Slider }












