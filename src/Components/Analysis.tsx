import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../Contexts/ThemeProvider';
import UsernameInput from './UsernameInput';
import { toast } from 'react-toastify';
import { Usernames, NameValue, KeyStats, TimelyProblemSolvedData, ProgressData } from './Interface';
import { getCFRating, getCCRating, getLCRating, getProblemSolvedCount, getLCTotalProblemSolved, getCFTotalACCount, getLCTotalACCount, getCCTotalACCount, getCFParticipatedContestCount, getLCParticipatedContestCount } from './UserData';
import CustomTooltip from './CustomTooltip';
import { FaPlus, FaEdit } from 'react-icons/fa';

const Analysis: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [usernames, setUsernames] = useState<Usernames | null>(null);

    // Monthly CF Problem Solved Data
    const [timelyProblemSolvedData, setTimelyProblemSolvedData] = useState<Array<TimelyProblemSolvedData>>([]);
    const getTimeStamp = (time: string) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        const date = new Date();
        date.setMonth(months.indexOf(time.split(' ')[0]));
        date.setFullYear(2000 + parseInt(time.split(' ')[1]))
        return date.getTime();
    };
    const fetchTimelyProblemSolvedData = async () => {
        const data: { [key: string]: number } = await getProblemSolvedCount(usernames);
        let psd: Array<TimelyProblemSolvedData> = [];
        for (const key in data) {
            psd.push({ time: key, problems: data[key] });
        }
        psd.sort((a, b) => getTimeStamp(a.time) - getTimeStamp(b.time))
        if (psd.length > 10) {
            psd = psd.slice(psd.length - 10, psd.length);
        }
        setTimelyProblemSolvedData(psd);
    };
    useEffect(() => {
        if (usernames) {
            fetchTimelyProblemSolvedData();
        }
    }, [usernames]);

    // rating info
    const [ProgressData, setProgressData] = useState<Array<ProgressData>>([
        { platform: 'Codeforces', rating: 0, problemSolved: 0 },
        { platform: 'CodeChef', rating: 0, problemSolved: 0 },
        { platform: 'LeetCode', rating: 0, problemSolved: 0 },
    ]);
    const fetchProgressData = async () => {
        const rating: Array<ProgressData> = [
            { platform: 'Codeforces', rating: 0, problemSolved: 0 },
            { platform: 'CodeChef', rating: 0, problemSolved: 0 },
            { platform: 'LeetCode', rating: 0, problemSolved: 0 },
        ];
        rating[0].rating = await getCFRating(usernames?.codeforces);
        rating[0].problemSolved = await getCFTotalACCount(usernames?.codeforces);
        rating[1].rating = await getCCRating(usernames?.codechef);
        rating[1].problemSolved = await getCCTotalACCount(usernames?.codechef);
        rating[2].rating = await getLCRating(usernames?.leetcode);
        rating[2].problemSolved = await getLCTotalACCount(usernames?.leetcode);
        setProgressData(rating);
    };
    useEffect(() => {
        if (usernames) {
            fetchProgressData();
        }
    }, [usernames]);

    // lc difficulty solved
    const [NameValueData, setNameValueData] = useState<Array<NameValue>>([
        { name: 'Easy', value: 45 },
        { name: 'Medium', value: 35 },
        { name: 'Hard', value: 20 },
    ]);
    const fetchNameValue = async () => {
        if (usernames?.leetcode) {
            let dbd: Array<NameValue> = [];
            dbd = await getLCTotalProblemSolved(usernames.leetcode);
            setNameValueData(dbd);
        }
    };
    useEffect(() => {
        if (usernames) {
            fetchNameValue();
        }
    }, [usernames]);

    // key stats
    const [keyStats, setKeyStats] = useState<Array<KeyStats>>([]);
    const fetchKeyStats = async () => {
        const ks: Array<KeyStats> = [
            {
                platform: "Codeforces",
                stats: [{ name: 'problemSolved', value: 0 }, { name: "contestParticipated", value: 0 }]
            },
            {
                platform: "Leetcode",
                stats: [{ name: 'problemSolved', value: 0 }, { name: "contestParticipated", value: 0 }]
            },
        ];
        ks[0].stats[0].value = await getCFTotalACCount(usernames?.codeforces);
        ks[0].stats[1].value = await getCFParticipatedContestCount(usernames?.codeforces);
        ks[1].stats[0].value = await getLCTotalACCount(usernames?.leetcode);
        ks[1].stats[1].value = await getLCParticipatedContestCount(usernames?.leetcode);
        setKeyStats(ks);
    };

    useEffect(() => {
        if (usernames) {
            fetchKeyStats();
        }
    }, [usernames]);

    // usernames input and storing in cookies
    const storeUsernames = (usernames: Usernames) => {
        const usernamesString = JSON.stringify(usernames);
        document.cookie = `usernames=${usernamesString}; max-age=5184000; path=/`
    };
    const handleUsernameSubmit = (usernames: Usernames) => {
        storeUsernames(usernames);
        setUsernames(usernames);
    };
    const getUsernames = () => {
        const name = "usernames";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                const usernames = JSON.parse(cookie.substring(name.length + 1));
                setUsernames(usernames);
                return true;
            }
        }
        return false;
    }
    useEffect(() => {
        if (usernames === null) {
            if (!getUsernames()) {
                toast("Please Add Username Details");
            }
        }
    }, []);

    const COLORS = ['#00b8a3', '#ffc01e', '#ff3254'];

    return (
        <div className={`px-3 py-4 sm:p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className='flex justify-between items-center flex-wrap mb-4'>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Performance Analysis</h1>
                <UsernameInput element={<div className='pb-1'>{usernames ? <FaEdit /> : <FaPlus />}</div>} usernames={usernames} onSubmit={handleUsernameSubmit} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Problem Solved Over Time */}
                <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-md sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4">CF Problems Solved Monthly</h2>
                    <div className="h-64 sm:h-72 md:h-80 lg:h-72 xl:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelyProblemSolvedData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tick={{ fontSize: 10 }} tickMargin={5} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line type="monotone" dataKey="problems" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rating Progression */}
                <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <h2 className="text-md sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4">Rating and Problem Solved</h2>
                    <div className="h-64 sm:h-72 md:h-80 lg:h-72 xl:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={ProgressData}
                                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="platform" tick={{ fontSize: 10 }} />
                                <YAxis 
                                    yAxisId="left" 
                                    tick={{ fontSize: 10 }} 
                                    label={{ 
                                        value: 'Rating/Problems', 
                                        angle: -90, 
                                        position: 'insideLeft',
                                        style: { fontSize: '10px', textAnchor: 'middle' },
                                        dx: -10
                                    }} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar yAxisId="left" dataKey="problemSolved" fill="#5ef85e" name="Problems" />
                                <Bar yAxisId="left" dataKey="rating" fill="#ff5a74" name="Rating" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-md sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4">LC Problem Difficulty</h2>
                    <div className="h-64 sm:h-72 md:h-80 lg:h-72 xl:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Pie
                                    data={NameValueData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {NameValueData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value}`, name]} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Statistics */}
                <div className={`p-3 sm:p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-md sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4">Key Statistics</h2>
                    <div className="h-64 sm:h-72 md:h-80 lg:h-72 xl:h-80 overflow-y-auto">
                        <div className='grid grid-cols-1 gap-4'>
                            {keyStats.map((keyStat, key) => (
                                <div key={`parentKeyStatDiv${key}`} className="mb-4">
                                    <p className='text-lg sm:text-xl lg:text-2xl mb-2'>{keyStat.platform}</p>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        {keyStat.stats.map((stat, idx) => (
                                            <div key={`childKeyStatDiv${idx}`} className="bg-opacity-20 bg-gray-500 p-3 rounded-lg">
                                                <p className="text-xs sm:text-sm lg:text-base text-gray-400">
                                                    {stat.name === "problemSolved" 
                                                        ? "Problems Solved" 
                                                        : "Contests"}
                                                </p>
                                                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;