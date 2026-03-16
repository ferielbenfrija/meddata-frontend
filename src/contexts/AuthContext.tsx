import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'researcher';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: User[] = [
  { id: '1', email: 'admin@demo.com', name: 'Admin User', role: 'admin', createdAt: '2024-01-05T09:00:00.000Z' },
  { id: '2', email: 'researcher@demo.com', name: 'Dr. Research', role: 'researcher', createdAt: '2024-01-12T10:30:00.000Z' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('medical-platform-user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as User;
      if (!parsed.createdAt) {
        const numericId = Number(parsed.id);
        const inferred = Number.isFinite(numericId) ? new Date(numericId).toISOString() : new Date().toISOString();
        const updated = { ...parsed, createdAt: inferred };
        setUser(updated);
        localStorage.setItem('medical-platform-user', JSON.stringify(updated));
      } else {
        setUser(parsed);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check demo users first
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('medical-platform-user', JSON.stringify(demoUser));
      return;
    }

    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('medical-platform-registered-users') || '[]');
    const registeredUser = registeredUsers.find((u: User & { password: string }) => u.email === email && u.password === password);
    
    if (registeredUser) {
      const { password: _, ...userWithoutPassword } = registeredUser;
      const ensured = {
        ...userWithoutPassword,
        createdAt: userWithoutPassword.createdAt || new Date().toISOString(),
      };
      setUser(ensured);
      localStorage.setItem('medical-platform-user', JSON.stringify(ensured));
      if (!registeredUser.createdAt) {
        const updatedUsers = registeredUsers.map((u: User & { password: string }) =>
          u.email === email ? { ...u, createdAt: ensured.createdAt } : u
        );
        localStorage.setItem('medical-platform-registered-users', JSON.stringify(updatedUsers));
      }
      return;
    }

    throw new Error('Invalid credentials');
  };

  const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const registeredUsers = JSON.parse(localStorage.getItem('medical-platform-registered-users') || '[]');
    
    // Check if email exists
    if (registeredUsers.find((u: User) => u.email === email) || DEMO_USERS.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role,
      password,
      createdAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem('medical-platform-registered-users', JSON.stringify(registeredUsers));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('medical-platform-user', JSON.stringify(userWithoutPassword));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('medical-platform-user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
