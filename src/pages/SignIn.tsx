import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import tcsLogoBlack from "@/assets/tcs-logo-black.png";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Login successful",
        description: `Welcome ${email.includes("admin") ? "Admin" : "User"}!`,
      });
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4 relative">
      {/* Top Left Title */}
      <div className="absolute top-6 left-6">
        <h1 className="text-xl font-semibold text-primary">Data Reliability Assistant</h1>
      </div>

      {/* Bottom Right TCS Logo */}
      <div className="absolute bottom-6 right-6">
        <div className="w-20 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg p-2">
          <img src={tcsLogoBlack} alt="TCS Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="text-center pb-2">
            {/* TCS Logo */}
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-20 h-16 bg-white rounded-xl flex items-center justify-center shadow-md p-2">
                <img src={tcsLogoBlack} alt="TCS Logo" className="w-full h-full object-contain" />
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
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
                  className="h-11 pr-10"
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

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium">Admin:</span> admin@tcs.com / admin123</p>
              <p><span className="font-medium">Analyst:</span> analyst@tcs.com / analyst123</p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
