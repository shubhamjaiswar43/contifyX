import React, { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../Contexts/ThemeProvider';
import { Usernames, CompetitorsInfo } from './Interface';
import CustomTooltip from './CustomTooltip';
import UsernameInput from './UsernameInput';
import { FaEdit, FaTrash } from "react-icons/fa";
import { getCodeforcesRating, getCodechefRating, getLeetcodeRating } from './UserData';

const CompetitorsPage: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Competitors Usernames Data
    const [competitors, setCompetitors] = useState<Array<Usernames>>([]);
    // for retrieving competitor data stored in cookie
    useEffect(() => {
        const name = "competitors";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                const data = JSON.parse(cookie.substring(name.length + 1));
                setCompetitors(data);
                break;
            }
        }
    }, []);
    // for storing competitor data in cookie
    const store = (competitors: Array<Usernames>) => {
        const competitorsString = JSON.stringify(competitors);
        document.cookie = `competitors=${competitorsString}; max-age=5184000; path=/`
    };
    const handleUsernameSubmit = (usernames: Usernames) => {
        store([...competitors, usernames]);
        setCompetitors(prev => [...prev, usernames]);
    };
    const handleEditCompetitor = (usernames: Usernames, index: number) => {
        const prev: Array<Usernames> = [...competitors];
        prev[index] = usernames;
        setCompetitors(prev);
        store(prev);
    };
    const handleDeleteCompetitor = (index: number) => {
        if (confirm('do you confirm to delete?')) {
            const prev: Array<Usernames> = [];
            for (let i = 0; i < competitors.length; i++) {
                if (index === i) continue;
                prev.push(competitors[i]);
            }
            setCompetitors(prev);
            store(prev);
        }
    };

    // ratingData
    const [ratingData, setRatingData] = useState<Array<CompetitorsInfo>>([]);
    const fetchCompetitorsRating = async () => {
        const rD: Array<CompetitorsInfo> = [];
        const platforms = ['codeforces', 'codechef', 'leetcode'];
        for (const platform of platforms) {
            const ratingInfo: CompetitorsInfo = { platform, values: [] };
            rD.push(ratingInfo);
        }

        const ratingPromises = competitors.map((competitor, index) => {
            return Promise.all([
                getCodeforcesRating(competitor.codeforces),
                getCodechefRating(competitor.codechef),
                getLeetcodeRating(competitor.leetcode),
            ]).then(([codeforcesRating, codechefRating, leetcodeRating]) => {
                rD[0].values[index] = codeforcesRating;
                rD[1].values[index] = codechefRating;
                rD[2].values[index] = leetcodeRating;
            });
        });

        await Promise.all(ratingPromises);
        setRatingData(rD);
    };
    const fetchCompetitorsRatingCB = useCallback(() => { fetchCompetitorsRating(); }, [competitors]);
    useEffect(() => {
        fetchCompetitorsRatingCB();
    }, [competitors]);

    // problem solved info

    return (
        <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className='flex justify-between'>
                <h1 className="text-3xl font-bold mb-6">Competitors Tracking</h1>
                <UsernameInput onSubmit={handleUsernameSubmit} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Competitors List */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'} h-[400px] overflow-auto`}>
                    <h2 className="text-xl font-semibold mb-4">Tracked Competitors</h2>
                    {competitors.map((competitor, index) => (
                        <div
                            key={`${competitor.codeforces}${index}`}
                            className={`p-3 mb-2 rounded-lg flex justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                        >
                            <div>
                                <p className="font-bold">{competitor.codeforces}</p>
                                <div className="text-sm text-gray-500">
                                    <span>CF: {competitor.codeforces}</span>
                                    <span className="mx-2">|</span>
                                    <span>CC: {competitor.codechef}</span>
                                    <span className="mx-2">|</span>
                                    <span>LC: {competitor.leetcode}</span>
                                </div>
                            </div>
                            <div className='flex'>
                                <UsernameInput usernames={competitor} element={<FaEdit />} onSubmit={(usernames: Usernames) => handleEditCompetitor(usernames, index)} />
                                <button className={`px-4 ml-4 py-2 rounded-md ${isDark
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    } transition-colors duration-200 cursor-pointer`} onClick={() => handleDeleteCompetitor(index)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Platform Ratings Comparison */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-xl font-semibold mb-4">Platform Ratings Comparison</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="platform" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {
                                competitors.map((competitor, index) => (
                                    <Bar key={`barChart${index}`} name={competitor.codeforces} dataKey={`values[${index}]`} fill="#8884d8" />
                                ))
                            }
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Platform Problem Solved Comparison */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-xl font-semibold mb-4">Platform Problem Solved Comparison</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="platform" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {
                                competitors.map((competitor, index) => (
                                    <Bar key={`barChart${index}`} name={competitor.codeforces} dataKey={`values[${index}]`} fill="#8884d8" />
                                ))
                            }
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Platform Contest Participated Comparison */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-xl font-semibold mb-4">Platform Contest Participated Comparison</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="platform" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {
                                competitors.map((competitor, index) => (
                                    <Bar key={`barChart${index}`} name={competitor.codeforces} dataKey={`values[${index}]`} fill="#8884d8" />
                                ))
                            }
                        </BarChart>
                    </ResponsiveContainer>
                </div>


            </div>
        </div>
    );
};

export default CompetitorsPage;