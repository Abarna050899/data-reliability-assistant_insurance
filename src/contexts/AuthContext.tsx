import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "data_analyst";

export interface User {
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for prototype
const MOCK_USERS = [
  { email: "admin@tcs.com", password: "admin123", name: "Admin User", role: "admin" as UserRole },
  { email: "analyst@tcs.com", password: "analyst123", name: "John Smith", role: "data_analyst" as UserRole },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dra_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        name: foundUser.name,
        role: foundUser.role,
        email: foundUser.email,
      };
      setUser(userData);
      localStorage.setItem("dra_user", JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dra_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
