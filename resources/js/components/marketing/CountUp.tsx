import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    className?: string;
}

export default function CountUp({
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
    duration = 1600,
    className = '',
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const [display, setDisplay] = useState(prefix);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (typeof IntersectionObserver === 'undefined') {
            setDisplay(prefix + value.toLocaleString());
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();

                const start = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setDisplay(prefix + (value * eased).toFixed(decimals));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [value, prefix, decimals, duration]);

    return (
        <span ref={ref} className={className}>
            {display}
            {suffix}
        </span>
    );
}