export type Theme = 'light';

export function useTheme() {
    if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
    return { theme: 'light' as Theme, setTheme: () => {} };
}