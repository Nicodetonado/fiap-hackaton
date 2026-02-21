import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', type, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="input-wrap">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-password-wrap">
        <input
          id={inputId}
          type={inputType}
          className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword((s) => !s)}
            title={showPassword ? 'Ocultar senha' : 'Ver senha'}
            tabIndex={-1}
          >
            {showPassword ? 'Ocultar' : 'Ver'}
          </button>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
