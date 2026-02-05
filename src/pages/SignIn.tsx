import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import tcsLogoSignin from "@/assets/tcs-logo-signin.png";

// ==========================================
// DEMO CREDENTIALS (stored in this file)
// ==========================================
// Admin User:
//   Username: admin@tcs.com
//   Password: admin123
//
// Analyst User:
//   Username: analyst@tcs.com
//   Password: analyst123
// ==========================================

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      toast({
        title: "Login successful",
        description: `Welcome ${username.includes("admin") ? "Admin" : "User"}!`,
      });
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Top Header Bar */}
      <div className="h-12 bg-[hsl(220,40%,13%)] border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-white">Data Reliability Assistant</h1>
      </div>

      {/* Bottom Right TCS Logo */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-primary-foreground font-bold text-lg">TCS</span>
        </div>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-border bg-card">
          <CardHeader className="text-center pb-2">
            {/* TCS Logo */}
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-20 h-14 bg-[hsl(220,40%,13%)] rounded-lg flex items-center justify-center shadow-md p-2">
                <img src={tcsLogoSignin} alt="TCS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Data Reliability Assistant</h1>
                <p className="text-sm text-muted-foreground">TCS Interactive</p>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
              </div>
            </div>
          </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Submit"
              )}
            </Button>

            <Button type="button" variant="outline" className="w-full h-11 border-muted-foreground/30">
              Sign-up
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
