import React, { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../Contexts/ThemeProvider';
import { Usernames, CompetitorsInfo } from './Interface';
import CustomTooltip from './CustomTooltip';
import UsernameInput from './UsernameInput';
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { getCFRating, getCCRating, getLCRating, getCFTotalACCount, getLCTotalACCount, getCFParticipatedContestCount, getLCParticipatedContestCount } from './UserData';

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
                getCFRating(competitor.codeforces),
                getCCRating(competitor.codechef),
                getLCRating(competitor.leetcode),
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
    const [problemSolvedData, setProblemSolvedData] = useState<Array<CompetitorsInfo>>([]);
    const fetchCompetitorsProblemSolved = async () => {
        const psD: Array<CompetitorsInfo> = [];
        const platforms = ['codeforces', /*'codechef',*/ 'leetcode'];
        for (const platform of platforms) {
            const ratingInfo: CompetitorsInfo = { platform, values: [] };
            psD.push(ratingInfo);
        }

        const problemSolvedPromises = competitors.map((competitor, index) => {
            return Promise.all([
                getCFTotalACCount(competitor.codeforces),
                // getCCTotalACCount(competitor.codechef),
                getLCTotalACCount(competitor.leetcode),
            ]).then(([codeforcesRating, /*codechefRating,*/ leetcodeRating]) => {
                psD[0].values[index] = codeforcesRating;
                // psD[1].values[index] = codechefRating;
                psD[1].values[index] = leetcodeRating;
            });
        });

        await Promise.all(problemSolvedPromises);
        setProblemSolvedData(psD);
    };
    const fetchCompetitorsProblemSolvedCB = useCallback(() => { fetchCompetitorsProblemSolved(); }, [competitors]);
    useEffect(() => {
        fetchCompetitorsProblemSolvedCB();
    }, [competitors]);

    // contest participated info
    const [contestParticipatedData, setContestParticipatedData] = useState<Array<CompetitorsInfo>>([]);
    const fetchCompetitorsContestParticipated = async () => {
        const cpD: Array<CompetitorsInfo> = [];
        const platforms = ['codeforces', /*'codechef',*/ 'leetcode'];
        for (const platform of platforms) {
            const ratingInfo: CompetitorsInfo = { platform, values: [] };
            cpD.push(ratingInfo);
        }

        const problemSolvedPromises = competitors.map((competitor, index) => {
            return Promise.all([
                getCFParticipatedContestCount(competitor.codeforces),
                // get(competitor.codechef),
                getLCParticipatedContestCount(competitor.leetcode),
            ]).then(([codeforcesRating, /*codechefRating,*/ leetcodeRating]) => {
                cpD[0].values[index] = codeforcesRating;
                // cpD[1].values[index] = codechefRating;
                cpD[1].values[index] = leetcodeRating;
            });
        });

        await Promise.all(problemSolvedPromises);
        setContestParticipatedData(cpD);
    };
    const fetchCompetitorsContestParticipatedCB = useCallback(() => { fetchCompetitorsContestParticipated(); }, [competitors]);
    useEffect(() => {
        fetchCompetitorsContestParticipatedCB();
    }, [competitors]);

    return (
        <div className={`px-3 sm:px-4 md:px-6 py-4 md:py-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6'>
                <h1 className="text-lg sm:text-xl md:text-3xl font-bold mb-2 sm:mb-0">Competitors Tracking</h1>
                <UsernameInput element={<p className="flex items-center"><FaPlus className="mr-1" /> <span className="hidden sm:inline">Add Competitor</span></p>} onSubmit={handleUsernameSubmit} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Competitors List */}
                <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'} h-[300px] sm:h-[350px] md:h-[400px] overflow-auto`}>
                    <h2 className="text-sm sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4">Tracked Competitors</h2>
                    {competitors.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No competitors added yet</p>
                    ) : (
                        competitors.map((competitor, index) => (
                            <div
                                key={`${competitor.codeforces}${index}`}
                                className={`p-2 sm:p-3 mb-2 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                            >
                                <div className="w-full sm:w-auto mb-2 sm:mb-0">
                                    <p className="font-bold text-sm md:text-lg truncate max-w-[200px] sm:max-w-none">{competitor.codeforces}</p>
                                    <div className="text-xs md:text-sm text-gray-500 flex flex-col sm:flex-row">
                                        <span className="mr-2">CF: {competitor.codeforces}</span>
                                        <span className="hidden sm:inline mx-2">|</span>
                                        <span className="mr-2">CC: {competitor.codechef}</span>
                                        <span className="hidden sm:inline mx-2">|</span>
                                        <span>LC: {competitor.leetcode}</span>
                                    </div>
                                </div>
                                <div className='flex sm:scale-90 md:scale-100'>
                                    <UsernameInput 
                                        usernames={competitor} 
                                        element={<div className="flex items-center"><FaEdit className="mr-1" /> <span className="text-xs hidden sm:inline">Edit</span></div>} 
                                        onSubmit={(usernames: Usernames) => handleEditCompetitor(usernames, index)} 
                                    />
                                    <button 
                                        className={`ml-2 p-2 sm:px-3 sm:py-2 rounded-md ${
                                            isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } transition-colors duration-200 flex items-center`} 
                                        onClick={() => handleDeleteCompetitor(index)}
                                    >
                                        <FaTrash className="mr-1" />
                                        <span className="text-xs hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Charts Section - Wrapped in a container for better small screen display */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6 col-span-1 lg:col-span-1">
                    {/* Platform Ratings Comparison */}
                    <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h2 className="text-sm sm:text-md md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">Platform Ratings</h2>
                        {competitors.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Add competitors to see ratings</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={ratingData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="platform" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    {competitors.map((competitor, index) => (
                                        <Bar key={`barChart${index}`} name={competitor.codeforces} dataKey={`values[${index}]`} fill={`hsl(${(index * 30) % 360}, 70%, 60%)`} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Platform Problem Solved Comparison */}
                    <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h2 className="text-sm sm:text-md md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">Problems Solved</h2>
                        {competitors.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Add competitors to see problems solved</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={problemSolvedData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="platform" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    {competitors.map((competitor, index) => (
                                        <Bar key={`barChart${index}`} name={competitor.codeforces} dataKey={`values[${index}]`} fill={`hsl(${(index * 30) % 360}, 70%, 60%)`} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Platform Contest Participated Comparison */}
                    <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h2 className="text-sm sm:text-md md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">Contests Participated</h2>
                        {competitors.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Add competitors to see contest participation</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={contestParticipatedData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="platform" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    {competitors.map((competitor, index) => (
                                        <Bar key={`barChart${index}`} name={competitor.codeforces} dataKey={`values[${index}]`} fill={`hsl(${(index * 30) % 360}, 70%, 60%)`} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitorsPage;