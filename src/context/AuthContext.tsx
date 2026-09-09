import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AppRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: AppRole;
    phone?: string;
  };
}

// Pre-seeded Demo Accounts for immediate testing & offline fallback
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-demo-1',
    full_name: 'Rajesh Admin',
    email: 'admin@gmail.com',
    phone: '+91 98765 00001',
    role: 'admin',
    status: 'Active',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'usr-stock-demo-2',
    full_name: 'Arjun Stock Staff',
    email: 'stock@gmail.com',
    phone: '+91 98765 00002',
    role: 'stock',
    status: 'Active',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    permissions: { inventory: true, 'b2c-pos': true },
  },
  {
    id: 'usr-customer-demo-3',
    full_name: 'Rahul Customer',
    email: 'customer@gmail.com',
    phone: '+91 98765 00003',
    role: 'customer',
    status: 'Active',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
];

const LOCAL_ACCOUNTS_KEY = 'ronix_sports_crm_auth_accounts_v1';
const LOCAL_SESSION_KEY = 'ronix_sports_crm_auth_session_v1';
const LOCAL_PASSWORDS_KEY = 'ronix_sports_crm_passwords_v1';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  role: AppRole | null;
  loading: boolean;
  allProfiles: UserProfile[];
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: AppRole }>;
  signUpCustomer: (data: { fullName: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  adminCreateStaffUser: (data: { fullName: string; email: string; role: AppRole; tempPassword: string; phone?: string; permissions?: Record<string, boolean> }) => Promise<{ success: boolean; error?: string }>;
  adminUpdateUser: (userId: string, updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  adminUpdateUserPermissions: (userId: string, permissions: Record<string, boolean>) => Promise<{ success: boolean; error?: string }>;
  adminResetUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  adminToggleUserStatus: (userId: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (moduleId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Managed User Accounts (Local & Supabase synchronized)
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error reading local auth profiles', e);
      }
    }
    return DEMO_PROFILES;
  });

  // Local Passwords Map (for demo credentials & offline support)
  const [passwordsMap, setPasswordsMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(LOCAL_PASSWORDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      'admin@gmail.com': 'demo123',
      'stock@gmail.com': 'demo123',
      'customer@gmail.com': 'demo123',
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(allProfiles));
  }, [allProfiles]);

  useEffect(() => {
    localStorage.setItem(LOCAL_PASSWORDS_KEY, JSON.stringify(passwordsMap));
  }, [passwordsMap]);

  // Sync Supabase Auth state & local session
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const sbUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata as any,
            };
            setUser(sbUser);

            // Fetch profile from Supabase profiles table
            const { data: profData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profData && mounted) {
              const matchedRole: AppRole = profData.role || 'customer';
              const userProf: UserProfile = {
                id: profData.id,
                full_name: profData.full_name || sbUser.email,
                email: profData.email || sbUser.email,
                phone: profData.phone || '',
                role: matchedRole,
                status: profData.status || 'Active',
                created_at: profData.created_at,
                last_login: new Date().toISOString(),
              };
              setProfile(userProf);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase auth session fetch warning:', err);
      }

      // Check local session storage if no Supabase session active
      if (mounted) {
        const localSession = localStorage.getItem(LOCAL_SESSION_KEY);
        if (localSession) {
          try {
            const savedProfile: UserProfile = JSON.parse(localSession);
            if (savedProfile && savedProfile.id) {
              setProfile((curr) => curr || savedProfile);
              setUser((curr) => curr || { id: savedProfile.id, email: savedProfile.email });
            }
          } catch (e) {}
        }
        setLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const sbUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata as any,
        };
        setUser(sbUser);

        try {
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profData) {
            const matchedRole: AppRole = profData.role || 'customer';
            const userProf: UserProfile = {
              id: profData.id,
              full_name: profData.full_name || sbUser.email,
              email: profData.email || sbUser.email,
              phone: profData.phone || '',
              role: matchedRole,
              status: profData.status || 'Active',
              created_at: profData.created_at,
              last_login: new Date().toISOString(),
            };
            setProfile(userProf);
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProf));
          }
        } catch (e) {}
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // SIGN IN METHOD
  const signIn = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string; role?: AppRole }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter email.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter password.' };
    }

    // Try Supabase Auth first
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (data?.user && !error) {
          // Fetch profile from Supabase
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const activeRole: AppRole = profData?.role || (data.user.user_metadata?.role as AppRole) || 'customer';
          const userProf: UserProfile = {
            id: data.user.id,
            full_name: profData?.full_name || data.user.user_metadata?.full_name || cleanEmail,
            email: cleanEmail,
            phone: profData?.phone || '',
            role: activeRole,
            status: profData?.status || 'Active',
            last_login: new Date().toISOString(),
          };

          if (userProf.status === 'Inactive') {
            await supabase.auth.signOut();
            return { success: false, error: 'Account disabled. Please contact system administrator.' };
          }

          setUser({ id: data.user.id, email: cleanEmail });
          setProfile(userProf);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProf));

          return { success: true, role: activeRole };
        }
      } catch (err) {
        console.warn('Supabase signIn attempt failed, checking demo/local fallback:', err);
      }
    }

    // Demo & Local Account Validation (Works seamlessly online/offline)
    const existingProfile = allProfiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!existingProfile) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (existingProfile.status === 'Inactive') {
      return { success: false, error: 'Account disabled. Please contact system administrator.' };
    }

    const expectedPassword = passwordsMap[cleanEmail] || 'demo123';
    if (cleanPassword !== expectedPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Successful Login
    const updatedProfile: UserProfile = {
      ...existingProfile,
      last_login: new Date().toISOString(),
    };

    setAllProfiles((prev) => prev.map((p) => (p.email.toLowerCase() === cleanEmail ? updatedProfile : p)));
    setUser({ id: updatedProfile.id, email: updatedProfile.email });
    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedProfile));

    return { success: true, role: updatedProfile.role };
  };

  // PUBLIC SIGNUP METHOD (STRICTLY AUTOMATIC ROLE = 'CUSTOMER')
  const signUpCustomer = async (data: { fullName: string; email: string; phone?: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.fullName.trim();
    const cleanPassword = data.password.trim();

    if (!cleanName) return { success: false, error: 'Please enter your full name.' };
    if (!cleanEmail) return { success: false, error: 'Please enter your email.' };
    if (!cleanPassword) return { success: false, error: 'Please enter a password.' };
    if (cleanPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

    // Check if email already registered locally
    if (allProfiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // Try Supabase Auth SignUp with role = 'customer' strictly metadata enforced
    if (isSupabaseConfigured) {
      try {
        const { data: sbData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              phone: data.phone || '',
              role: 'customer', // STRICT ENFORCEMENT
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (sbData.user) {
          // Explicitly insert into profiles table if trigger is delayed
          await supabase.from('profiles').upsert({
            id: sbData.user.id,
            full_name: cleanName,
            email: cleanEmail,
            phone: data.phone || '',
            role: 'customer',
            status: 'Active',
          });
        }
      } catch (err: any) {
        console.warn('Supabase signUp warning:', err);
      }
    }

    // Create Customer UserProfile locally
    const newId = `usr-cust-${Date.now()}`;
    const newCustomerProfile: UserProfile = {
      id: newId,
      full_name: cleanName,
      email: cleanEmail,
      phone: data.phone || '',
      role: 'customer', // AUTOMATIC CUSTOMER ROLE
      status: 'Active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    setAllProfiles((prev) => [newCustomerProfile, ...prev]);
    setPasswordsMap((prev) => ({ ...prev, [cleanEmail]: cleanPassword }));

    // Automatically sign in the new customer
    setUser({ id: newCustomerProfile.id, email: cleanEmail });
    setProfile(newCustomerProfile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newCustomerProfile));

    return { success: true };
  };

  // SIGN OUT METHOD
  const signOut = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {}
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  };

  // SELF-SERVICE CHANGE PASSWORD
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'User is not logged in.' };
    if (!newPassword || newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };

    const userEmail = profile.email.toLowerCase();
    const storedPass = passwordsMap[userEmail] || 'demo123';

    if (currentPassword !== storedPass) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        console.warn('Supabase updatePassword error:', err);
      }
    }

    setPasswordsMap((prev) => ({ ...prev, [userEmail]: newPassword }));
    return { success: true };
  };

  // FORGOT PASSWORD / EMAIL RESET LINK
  const resetPasswordForEmail = async (emailInput: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: 'Please enter your email.' };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        console.warn('Supabase resetPasswordForEmail warning:', err);
      }
    }

    return {
      success: true,
      message: `If an account exists for ${cleanEmail}, password reset instructions have been sent.`,
    };
  };

  // ADMIN CREATE STAFF USER (ADMIN / STOCK ROLE ONLY)
  const adminCreateStaffUser = async (data: {
    fullName: string;
    email: string;
    role: AppRole;
    tempPassword: string;
    phone?: string;
    permissions?: Record<string, boolean>;
  }): Promise<{ success: boolean; error?: string }> => {
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Permission denied: Only Admins can create staff accounts.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.fullName.trim();
    const cleanPassword = data.tempPassword.trim();

    if (!cleanName) return { success: false, error: 'Please enter staff full name.' };
    if (!cleanEmail) return { success: false, error: 'Please enter staff email address.' };
    if (!cleanPassword || cleanPassword.length < 6) return { success: false, error: 'Temporary password must be at least 6 characters.' };

    if (allProfiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const initialPermissions = data.permissions || (data.role === 'stock' ? { inventory: true, 'b2c-pos': true } : {});

    // Try Supabase Auth API
    if (isSupabaseConfigured) {
      try {
        const { data: sbUser, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              role: data.role,
              phone: data.phone || '',
            },
          },
        });

        if (sbUser?.user) {
          await supabase.from('profiles').upsert({
            id: sbUser.user.id,
            full_name: cleanName,
            email: cleanEmail,
            phone: data.phone || '',
            role: data.role,
            status: 'Active',
          });

          // Insert permissions into user_permissions table
          const permRows = Object.entries(initialPermissions).map(([mod, can]) => ({
            user_id: sbUser.user!.id,
            module: mod,
            can_access: can,
          }));
          if (permRows.length > 0) {
            await supabase.from('user_permissions').upsert(permRows, { onConflict: 'user_id,module' });
          }
        }
      } catch (err: any) {
        console.warn('Supabase admin create user warning:', err);
      }
    }

    const newStaffId = `usr-staff-${Date.now()}`;
    const newStaffProfile: UserProfile = {
      id: newStaffId,
      full_name: cleanName,
      email: cleanEmail,
      phone: data.phone || '',
      role: data.role,
      status: 'Active',
      created_at: new Date().toISOString(),
      permissions: initialPermissions,
    };

    setAllProfiles((prev) => [newStaffProfile, ...prev]);
    setPasswordsMap((prev) => ({ ...prev, [cleanEmail]: cleanPassword }));

    return { success: true };
  };

  // ADMIN UPDATE USER
  const adminUpdateUser = async (userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Permission denied: Admin rights required.' };
    }

    const targetUser = allProfiles.find((p) => p.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    // Prevent changing role of Super Admin admin@gmail.com
    if (targetUser.email === 'admin@gmail.com' && updates.role && updates.role !== 'admin') {
      return { success: false, error: 'Super Admin role cannot be modified.' };
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update(updates).eq('id', userId);
      } catch (err) {}
    }

    setAllProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );

    return { success: true };
  };

  // ADMIN UPDATE USER PERMISSIONS
  const adminUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>): Promise<{ success: boolean; error?: string }> => {
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Permission denied: Admin rights required.' };
    }

    const targetUser = allProfiles.find((p) => p.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    if (targetUser.role === 'customer') {
      return { success: false, error: 'Customer accounts cannot be granted staff module permissions.' };
    }

    if (isSupabaseConfigured) {
      try {
        const rowsToUpsert = Object.entries(permissions).map(([mod, canAccess]) => ({
          user_id: userId,
          module: mod,
          can_access: canAccess,
          updated_at: new Date().toISOString(),
        }));

        if (rowsToUpsert.length > 0) {
          await supabase.from('user_permissions').upsert(rowsToUpsert, { onConflict: 'user_id,module' });
        }
      } catch (err) {
        console.warn('Error saving permissions to Supabase:', err);
      }
    }

    setAllProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, permissions: { ...permissions }, updated_at: new Date().toISOString() } : p))
    );

    if (profile?.id === userId) {
      const updatedProf = { ...profile, permissions: { ...permissions } };
      setProfile(updatedProf);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedProf));
    }

    return { success: true };
  };

  // HAS PERMISSION CHECK
  const hasPermission = (moduleId: string): boolean => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role === 'customer') {
      return moduleId === 'storefront' || moduleId === 'customer-orders';
    }

    if (profile.permissions && typeof profile.permissions[moduleId] === 'boolean') {
      return profile.permissions[moduleId];
    }

    // Default stock staff permissions if explicit map not set
    if (profile.role === 'stock') {
      return moduleId === 'inventory' || moduleId === 'b2c-pos';
    }

    return false;
  };

  // ADMIN RESET USER PASSWORD
  const adminResetUserPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Permission denied: Admin rights required.' };
    }

    const targetUser = allProfiles.find((p) => p.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };
    if (!newPassword || newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };

    setPasswordsMap((prev) => ({ ...prev, [targetUser.email.toLowerCase()]: newPassword }));
    return { success: true };
  };

  // ADMIN TOGGLE USER STATUS
  const adminToggleUserStatus = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (profile?.role !== 'admin') {
      return { success: false, error: 'Permission denied: Admin rights required.' };
    }

    const targetUser = allProfiles.find((p) => p.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    // Prevent deactivating Super Admin admin@gmail.com
    if (targetUser.email === 'admin@gmail.com') {
      return { success: false, error: 'Super Admin account cannot be deactivated.' };
    }

    const newStatus: 'Active' | 'Inactive' = targetUser.status === 'Active' ? 'Inactive' : 'Active';

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
      } catch (err) {}
    }

    setAllProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p))
    );

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        loading,
        allProfiles,
        signIn,
        signUpCustomer,
        signOut,
        updatePassword,
        resetPasswordForEmail,
        adminCreateStaffUser,
        adminUpdateUser,
        adminUpdateUserPermissions,
        adminResetUserPassword,
        adminToggleUserStatus,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
