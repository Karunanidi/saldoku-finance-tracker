import { ENV } from '@/core/config/env';

export const DevelopmentBanner = () => {
    if (!ENV.VITE_ENABLE_DEV_BANNER) return null;

    return (
        <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 px-4 py-2 text-center text-sm font-semibold select-none">
            🚧 This application is currently under development 🚧
        </div>
    );
};
