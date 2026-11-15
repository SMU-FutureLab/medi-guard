import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from './Icon';

interface Props {
  initialValue?: string;
  onSearch: (query: string) => void;
  /** 지우기(X) 버튼을 눌렀을 때 */
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** hero: 홈 화면의 큰 검색창(오른쪽 원형 버튼) / plain: 검색 결과 화면의 검색창(X 버튼) */
  variant?: 'hero' | 'plain';
}

export function SearchBar({
  initialValue = '',
  onSearch,
  onClear,
  placeholder = '의약품명을 검색해 보세요. (예: 타이레놀)',
  autoFocus,
  variant = 'plain',
}: Props) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form className={`search-bar search-${variant}`} role="search" onSubmit={submit}>
      <Icon name="search" className="search-icon" />
      <input
        id={`search-${variant}`}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="의약품 검색"
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      {variant === 'plain' && value && (
        <button
          type="button"
          className="icon-btn"
          aria-label="검색어 지우기"
          onClick={() => {
            setValue('');
            onClear?.();
          }}
        >
          <Icon name="close" />
        </button>
      )}
      {variant === 'hero' && (
        <button type="submit" className="search-submit" aria-label="검색">
          <Icon name="search" size={22} />
        </button>
      )}
    </form>
  );
}
