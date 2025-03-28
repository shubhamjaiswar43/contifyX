import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, BarChart3, Users, GitCompare, Home } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeProvider';
interface NavItemProps {
    icon: React.ReactNode;
    text: string;
    darkMode: boolean;
    path: string;
}
export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === 'dark';
    return (
        <nav className={`${darkMode ? 'bg-gray-900' : 'bg-white'} py-4 px-6 shadow-md transition-colors duration-200`}>
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo and company name */}
                <div className="flex items-center">
                    <img
                        src="/logo.svg"
                        alt="Contify Logo"
                        className="h-10 w-10 mr-3"
                    />
                    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Contify
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center mx-auto space-x-8">
                    <NavItem
                        icon={<Home size={20} />}
                        text="Dashboard"
                        darkMode={darkMode}
                        path = "/"
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

                {/* Theme toggle button */}
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors duration-200`}
                    aria-label="Toggle theme"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
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
}