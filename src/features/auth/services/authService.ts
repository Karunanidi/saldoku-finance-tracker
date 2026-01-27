import { supabase } from '@/core/api/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
    user: User | null;
    session: Session | null;
    error: AuthError | null;
}

export const authService = {
    async register(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { user: data.user, session: data.session, error };
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { user: data.user, session: data.session, error };
    },

    async logout(): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async getSession() {
        return await supabase.auth.getSession();
    },

    onAuthStateChange(callback: (session: Session | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session);
        });
    }
};
