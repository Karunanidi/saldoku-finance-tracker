/// <reference types="vite/client" />
import { z } from 'zod';

const envSchema = z.object({
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1),
    VITE_GEMINI_API_KEY: z.string().min(1),
    VITE_ENABLE_DEV_BANNER: z.string().optional().transform((val) => val?.toLowerCase() === 'true'),
});

const _env = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    VITE_ENABLE_DEV_BANNER: import.meta.env.VITE_ENABLE_DEV_BANNER,
});

export const ENV = {
    ...(_env.success ? _env.data : {
        VITE_SUPABASE_URL: "",
        VITE_SUPABASE_ANON_KEY: "",
        VITE_GEMINI_API_KEY: "",
        VITE_ENABLE_DEV_BANNER: import.meta.env.VITE_ENABLE_DEV_BANNER,
    }),
    IS_VALID: _env.success,
};
