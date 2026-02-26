import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Scan from "@/pages/Scan";
import Results from "@/pages/Results";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Settings from "@/pages/Settings";
import Export from "@/pages/Export";
import Example from "@/pages/Example";

// Layout
import Layout from "@/components/Layout";

// Protected route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/example" element={<Example />} />
            
            {/* Semi-protected: Can start scan without auth, but need auth to save */}
            <Route path="/scan" element={<Layout><Scan /></Layout>} />
            
            {/* Protected routes */}
            <Route path="/results/:id" element={
                <ProtectedRoute>
                    <Layout><Results /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/projects" element={
                <ProtectedRoute>
                    <Layout><Projects /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
                <ProtectedRoute>
                    <Layout><ProjectDetail /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Layout><Settings /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/export/:id" element={
                <ProtectedRoute>
                    <Layout><Export /></Layout>
                </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
                <Toaster position="top-right" richColors />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
