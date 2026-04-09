import { useState, useCallback, useRef, useEffect } from 'react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function AnswerInput({ onSubmit, disabled, placeholder }: AnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSubmit(trimmed);
      setValue('');
    }
  }, [value, disabled, onSubmit]);

  return (
    <div className="answer-input">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={disabled}
        placeholder={placeholder ?? '?'}
        autoFocus
      />
      <button onClick={handleSubmit} disabled={disabled || !value.trim()}>
        ✓
      </button>
    </div>
  );
}
