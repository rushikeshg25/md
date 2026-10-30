export function scrollFraction(scrollTop: number, scrollHeight: number, clientHeight: number): number {
    const range = scrollHeight - clientHeight;
    return range > 0 ? Math.max(0, Math.min(1, scrollTop / range)) : 0;
}
