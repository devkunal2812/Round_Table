import { useState } from "react";
import { Apple, Chrome } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";

interface AuthProps {
  mode: "signin" | "signup";
  onLogin?: () => void;
  onSignup?: () => void;
}

export default function Auth({ mode }: AuthProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuthContext();

  const isSignUp = mode === "signup";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.fullName);
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      } else {
        await signIn(formData.email, formData.password);
        toast({ title: "Welcome back!", description: "Signed in successfully." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Google sign-in failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gradient-card shadow-soft border-border/50">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold italic text-foreground mb-2">Roundtable</h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 bg-background hover:bg-muted transition-colors"
              onClick={handleGoogleLogin}
              type="button"
            >
              <Chrome className="h-5 w-5 text-blue-500" />
              <span className="text-foreground">Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground bg-background px-2">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-12 bg-background border-border"
                />
              )}
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 bg-background border-border"
                required
              />
              <Input
                type="password"
                name="password"
                placeholder={isSignUp ? "Create password" : "Password"}
                value={formData.password}
                onChange={handleInputChange}
                className="h-12 bg-background border-border"
                required
              />
              {isSignUp && (
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 bg-background border-border"
                  required
                />
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 shadow-soft transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <Link
                  to={isSignUp ? "/auth" : "/signup"}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
