import { EXTENSIONS, type Preferences } from '@/lib/preferences';
export function MarkdownSettings({ extensions, onChange }: {
    extensions: Preferences['extensions'];
    onChange: (extensions: Preferences['extensions']) => void;
}) {
    return (
        <details className="border-b border-divider bg-surface px-3 py-2 text-sm print:hidden">
            <summary className="w-fit text-muted">Markdown extensions</summary>
            <div className="grid gap-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
                {EXTENSIONS.map(({ key, label, description }) => (
                    <label key={key} className="flex cursor-pointer items-start gap-2">
                        <input type="checkbox" className="mt-1" checked={extensions[key]}
                            onChange={event => onChange({ ...extensions, [key]: event.target.checked })} />
                        <span><span className="block font-medium">{label}</span><span className="text-xs text-muted">{description}</span></span>
                    </label>
                ))}
            </div>
        </details>
    );
}
