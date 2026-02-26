import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, User, LogOut, Settings, FolderOpen, Menu, X } from 'lucide-react';

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const navLinks = [
        { href: '/scan', label: 'Run Scan' },
        { href: '/projects', label: 'Projects', protected: true },
        { href: '/example', label: 'Example' },
    ];
    
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5" data-testid="nav-logo">
                        <div className="h-8 w-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">K</span>
                        </div>
                        <span className="hidden sm:inline font-semibold text-[#1E3A5F] tracking-tight">KODEX Compliance</span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            if (link.protected && !isAuthenticated) return null;
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`text-sm font-medium transition-colors hover:text-primary ${
                                        location.pathname === link.href 
                                            ? 'text-primary' 
                                            : 'text-muted-foreground'
                                    }`}
                                    data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                    
                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2" data-testid="user-menu-trigger">
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline max-w-32 truncate">{user?.email}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link to="/projects" className="flex items-center gap-2" data-testid="menu-projects">
                                            <FolderOpen className="h-4 w-4" />
                                            My Projects
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/settings" className="flex items-center gap-2" data-testid="menu-settings">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive" data-testid="menu-logout">
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild data-testid="nav-signin">
                                    <Link to="/auth">Sign in</Link>
                                </Button>
                                <Button size="sm" asChild data-testid="nav-start-scan">
                                    <Link to="/scan">Start Scan</Link>
                                </Button>
                            </div>
                        )}
                        
                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            data-testid="mobile-menu-toggle"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
                
                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                if (link.protected && !isAuthenticated) return null;
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            location.pathname === link.href 
                                                ? 'bg-primary/10 text-primary' 
                                                : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
