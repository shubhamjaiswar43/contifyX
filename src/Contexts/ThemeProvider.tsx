import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode
} from 'react';

// Define the theme type
type Theme = 'dark' | 'light';

// Define the context type
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { }
});

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Initialize theme from localStorage, default to dark
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'dark';
    });

    // Effect to update localStorage and apply theme to document
    useEffect(() => {
        localStorage.setItem('theme', theme);

        // // // Apply theme to the entire document
        // if (theme === 'dark') {
        //     document.documentElement.classList.add('dark');
        // } else {
        //     document.documentElement.classList.remove('dark');
        // }
    }, [theme]);

    // Toggle theme function
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);