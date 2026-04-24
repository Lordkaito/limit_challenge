import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update the debounced value before the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
  });

  it('updates the debounced value after the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('ab');
  });

  it('resets the timer on each new value — only the final value fires', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: 'abc' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 0 },
    });
    rerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(42);
  });
});
