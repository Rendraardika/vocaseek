import { router, usePage } from '@inertiajs/react';
import { translate } from '@/lib/translations';

const localeLabels = {
    id: 'Indonesia',
    en: 'English',
};

export default function LanguageSwitcher() {
    const { locale, availableLocales = [] } = usePage().props;
    const t = (key, fallback) => translate(locale, key, fallback);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{t('common.language', 'Language')}</span>
            <select
                value={locale}
                onChange={(e) =>
                    router.post(
                        route('locale.switch'),
                        { locale: e.target.value },
                        { preserveScroll: true, preserveState: true },
                    )
                }
                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
                {availableLocales.map((item) => (
                    <option key={item} value={item}>
                        {localeLabels[item] ?? item.toUpperCase()}
                    </option>
                ))}
            </select>
        </div>
    );
}
