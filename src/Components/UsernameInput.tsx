import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeProvider';
import { Usernames } from './Interface';

interface UsernameInputProps {
    usernames?: Usernames | null
    onSubmit: (usernames: Usernames) => void;
    element?: React.ReactNode
}



export const UsernameInput: React.FC<UsernameInputProps> = ({ usernames, onSubmit, element }) => {
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const [isOpen, setIsOpen] = useState(false);
    const [codeforcesUsername, setCodeforcesUsername] = useState('');
    const [codechefUsername, setCodechefUsername] = useState('');
    const [leetcodeUsername, setLeetcodeUsername] = useState('');

    const handleSubmit = () => {
        onSubmit({
            codeforces: codeforcesUsername,
            codechef: codechefUsername,
            leetcode: leetcodeUsername
        });
        setIsOpen(false);
        setCodeforcesUsername('');
        setCodechefUsername('');
        setLeetcodeUsername('');
    };
    const handleCancel = () => {
        setIsOpen(false);
    };
    useEffect(() => {
        if (usernames && isOpen) {
            setCodeforcesUsername(usernames.codeforces);
            setCodechefUsername(usernames.codechef);
            setLeetcodeUsername(usernames.leetcode);
        }
    }, [usernames, isOpen]);
    return (
        <div>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`px-4 py-2 rounded-md ${darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors duration-200 cursor-pointer`}
            >
                {
                    element ? element : <p>Add Coding Platforms</p>
                }
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    {/* Modal Container */}
                    <div className={`${darkMode
                        ? 'bg-gray-800 text-white border-gray-700'
                        : 'bg-white text-gray-900 border-gray-200'
                        } rounded-lg shadow-xl w-96 p-6 border`}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Enter Coding Platform Usernames</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`rounded-full p-1 ${darkMode
                                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                    : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                                    } transition-colors duration-200`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Codeforces Input */}
                        <div className="mb-4">
                            <label
                                htmlFor="codeforces"
                                className={`block text-sm font-medium ${darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                    } mb-2`}
                            >
                                Codeforces Username
                            </label>
                            <input
                                id="codeforces"
                                type="text"
                                value={codeforcesUsername}
                                onChange={(e) => setCodeforcesUsername(e.target.value)}
                                className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 ${darkMode
                                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                    : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="Enter Codeforces username"
                            />
                        </div>

                        {/* CodeChef Input */}
                        <div className="mb-4">
                            <label
                                htmlFor="codechef"
                                className={`block text-sm font-medium ${darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                    } mb-2`}
                            >
                                CodeChef Username
                            </label>
                            <input
                                id="codechef"
                                type="text"
                                value={codechefUsername}
                                onChange={(e) => setCodechefUsername(e.target.value)}
                                className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 ${darkMode
                                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                    : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="Enter CodeChef username"
                            />
                        </div>

                        {/* LeetCode Input */}
                        <div className="mb-4">
                            <label
                                htmlFor="leetcode"
                                className={`block text-sm font-medium ${darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                    } mb-2`}
                            >
                                LeetCode Username
                            </label>
                            <input
                                id="leetcode"
                                type="text"
                                value={leetcodeUsername}
                                onChange={(e) => setLeetcodeUsername(e.target.value)}
                                className={`w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 ${darkMode
                                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                    : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="Enter LeetCode username"
                            />
                        </div>

                        {/* Button Container */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancel}
                                className={`px-4 py-2 rounded-md ${darkMode
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                                    } transition-colors duration-200`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!codeforcesUsername && !codechefUsername && !leetcodeUsername}
                                className={`px-4 py-2 rounded-md ${darkMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600'
                                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500'
                                    } transition-colors duration-200 disabled:cursor-not-allowed`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsernameInput;