import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/projects';
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            navigate(returnTo);
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2.5 mb-8" data-testid="auth-logo">
                    <div className="h-9 w-9 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                        <span className="text-white font-bold text-base">K</span>
                    </div>
                    <span className="font-semibold text-[#1E3A5F] text-xl tracking-tight">KODEX Compliance</span>
                </Link>
                
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-heading" data-testid="auth-title">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </CardTitle>
                        <CardDescription>
                            {isLogin 
                                ? 'Sign in to access your saved assessments' 
                                : 'Sign up to save and track your AI assessments'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" data-testid="auth-error">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    data-testid="auth-email-input"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={loading}
                                    data-testid="auth-password-input"
                                />
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={loading}
                                data-testid="auth-submit-btn"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLogin ? 'Sign in' : 'Create account'}
                            </Button>
                        </form>
                        
                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-primary hover:underline font-medium"
                                data-testid="auth-toggle-mode"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
                
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By signing in, you agree that this tool provides educational information only — not legal advice.
                </p>
            </div>
        </div>
    );
}

export default Auth;
