import { useEffect, useState, type FormEvent } from 'react';

interface Props {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ initialValue = '', onSearch, placeholder = '약 이름 또는 성분명 (예: 타이레놀)', autoFocus }: Props) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form className="search-bar" role="search" onSubmit={submit}>
      <svg className="search-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="의약품 검색"
        autoFocus={autoFocus}
      />
      <button type="submit" className="btn btn-primary">
        검색
      </button>
    </form>
  );
}
