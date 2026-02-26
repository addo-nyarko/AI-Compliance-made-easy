import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    );
}

export default Layout;
