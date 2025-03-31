import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, BarChart3, Users, GitCompare, Home, Menu, X } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeProvider';

interface NavItemProps {
    icon: React.ReactNode;
    text: string;
    darkMode: boolean;
    path: string;
    onClick?: () => void;
}

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === 'dark';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`${darkMode ? 'bg-gray-900' : 'bg-white'} py-4 px-4 md:px-6 shadow-md transition-colors duration-200`}>
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src="/logo.svg"
                            alt="Contify Logo"
                            className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3"
                        />
                        <span className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Contify
                        </span>
                    </div>

                    {/* Navigation Links - Desktop Only */}
                    <div className="hidden md:flex items-center mx-auto space-x-6 lg:space-x-8">
                        <NavItem
                            icon={<Home size={20} />}
                            text="Dashboard"
                            darkMode={darkMode}
                            path="/"
                        />
                        <NavItem
                            icon={<BarChart3 size={20} />}
                            text="Analysis"
                            darkMode={darkMode}
                            path="/analysis"
                        />
                        <NavItem
                            icon={<Users size={20} />}
                            text="Competitors"
                            darkMode={darkMode}
                            path="/competitors"
                        />
                        <NavItem
                            icon={<GitCompare size={20} />}
                            text="Compare"
                            darkMode={darkMode}
                            path="/compare"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Theme toggle button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors duration-200`}
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-md"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
                            ) : (
                                <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className={`md:hidden mt-4 py-2 px-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex flex-col space-y-2">
                            <MobileNavItem
                                icon={<Home size={20} />}
                                text="Dashboard"
                                darkMode={darkMode}
                                path="/"
                                onClick={closeMobileMenu}
                            />
                            <MobileNavItem
                                icon={<BarChart3 size={20} />}
                                text="Analysis"
                                darkMode={darkMode}
                                path="/analysis"
                                onClick={closeMobileMenu}
                            />
                            <MobileNavItem
                                icon={<Users size={20} />}
                                text="Competitors"
                                darkMode={darkMode}
                                path="/competitors"
                                onClick={closeMobileMenu}
                            />
                            <MobileNavItem
                                icon={<GitCompare size={20} />}
                                text="Compare"
                                darkMode={darkMode}
                                path="/compare"
                                onClick={closeMobileMenu}
                            />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, darkMode, path }) => {
    return (
        <Link
            to={path}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                } transition-colors duration-200`}
        >
            {icon}
            <span>{text}</span>
        </Link>
    );
};

const MobileNavItem: React.FC<NavItemProps> = ({ icon, text, darkMode, path, onClick }) => {
    return (
        <Link
            to={path}
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md ${darkMode
                ? 'text-gray-200 hover:text-white hover:bg-gray-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                } transition-colors duration-200`}
        >
            {icon}
            <span className="font-medium">{text}</span>
        </Link>
    );
};