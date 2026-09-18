import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    style?: CSSProperties;
}

const OFFSCREEN: Record<NonNullable<RevealProps['direction']>, CSSProperties> = {
    up: { opacity: 0, transform: 'translate3d(0, 28px, 0)' },
    down: { opacity: 0, transform: 'translate3d(0, -28px, 0)' },
    left: { opacity: 0, transform: 'translate3d(28px, 0, 0)' },
    right: { opacity: 0, transform: 'translate3d(-28px, 0, 0)' },
    none: { opacity: 0 },
};

export default function Reveal({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    style,
}: RevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                transition:
                    'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                transitionDelay: `${delay}ms`,
                willChange: 'opacity, transform',
                ...(visible ? { opacity: 1, transform: 'translate3d(0, 0, 0)' } : OFFSCREEN[direction]),
                ...style,
            }}
        >
            {children}
        </div>
    );
}