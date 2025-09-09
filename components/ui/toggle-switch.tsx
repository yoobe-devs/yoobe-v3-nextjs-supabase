import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`inline-flex items-center px-3 py-1 rounded border ${
        checked ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {checked ? 'On' : 'Off'}
    </button>
  )
}
