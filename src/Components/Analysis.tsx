import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../Contexts/ThemeProvider';
import UsernameInput from './UsernameInput';
import { toast } from 'react-toastify';
import { Usernames, NameValue, KeyStats, TimelyProblemSolvedData, ProgressData } from './Interface';
import { getCFRating, getCCRating, getLCRating, getProblemSolvedCount, getLCTotalProblemSolved, getCFTotalACCount, getLCTotalACCount, getCCTotalACCount, getCFParticipatedContestCount, getLCParticipatedContestCount } from './UserData';
import CustomTooltip from './CustomTooltip';

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
        fetchTimelyProblemSolvedData();
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
        fetchProgressData();
    }, [usernames]);

    // lc difficulty solved
    const [NameValueData, setNameValueData] = useState<Array<NameValue>>([
        { name: 'Easy', value: 45 },
        { name: 'Medium', value: 35 },
        { name: 'Hard', value: 20 },
    ]);
    const fetchNameValue = async () => {
        let dbd: Array<NameValue> = [];
        dbd = await getLCTotalProblemSolved(usernames?.leetcode);
        setNameValueData(dbd);
    };
    useEffect(() => {
        fetchNameValue();
    }, [usernames]);

    // key stats
    const [keyStats, setKeyStats] = useState<Array<KeyStats>>([]);
    const fetchKeyStats = async () => {
        const ks: Array<KeyStats> = [
            {
                platform: "Codeforces",
                stats: [{ name: 'problemSolved', value: 0 }, { name: "contestParticipated", value: 0 }]
            },
            // {
            //     platform: "Codechef",
            //     stats: [{ name: 'problemSolved', value: 0 }, { name: "contestParticipated", value: 0 }]
            // },
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
        fetchKeyStats();
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
                toast("Please Enter Username Details");
            }
        }
    }, []);

    const COLORS = ['#00b8a3', '#ffc01e', '#ff3254'];

    return (
        <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className='flex justify-between'>
                <h1 className="text-3xl font-bold mb-6">Performance Analysis</h1>
                <UsernameInput usernames={usernames} onSubmit={handleUsernameSubmit} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Problem Solved Over Time */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-xl font-semibold mb-4">CF Problems Solved Monthly</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelyProblemSolvedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="problems" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Rating Progression */}
                {/* <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <h2 className="text-xl font-semibold mb-4">Rating Across Platforms</h2>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#8884d8" />
                    </BarChart>
                    </ResponsiveContainer>
                    </div> */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <h2 className="text-xl font-semibold mb-4">Rating and Problem Solved Across Platforms</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={ProgressData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="platform" />
                            <YAxis yAxisId="left" label={{ value: 'Rating/Problems Solved', angle: -90, position: 'insideLeft' }} />
                            {/* <YAxis yAxisId="right" orientation="right" label={{ value: 'Rating', angle: 90, position: 'insideRight' }} /> */}
                            <Tooltip content={<CustomTooltip />} />
                            <Tooltip
                                formatter={(value, name, _) => {
                                    return [`${value}`, name];
                                }}
                                labelClassName="font-bold"
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="problemSolved" fill="#5ef85e" name="Problems Solved" />
                            <Bar yAxisId="left" dataKey="rating" fill="#ff5a74" name="Rating" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Difficulty Breakdown */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-xl font-semibold mb-4">LC Problem Difficulty Solved</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={NameValueData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {NameValueData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Key Statistics */}
                <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
                    <div className='grid grid-rows-2 gap-4'>
                        {
                            keyStats.map((keyStat, key) => {
                                return (
                                    <div key={`parentKeyStatDiv${key}`}>
                                        <p className='text-2xl mb-2'>{keyStat.platform}</p>
                                        <div className={`grid grid-cols-${keyStat.stats.length} gap-4`}>
                                            {
                                                keyStat.stats.map((stat, key) => {
                                                    return (
                                                        <div key={`childKeyStatDiv${key}`}>
                                                            <p className="text-gray-400">{stat.name}</p>
                                                            <p className="text-2xl font-bold">{stat.value}</p>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {/* <div>
                            <p className='text-2xl mb-2'>Codeforces</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500">Total Problems Solved</p>
                                    <p className="text-2xl font-bold">235</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Contests Participated</p>
                                    <p className="text-2xl font-bold">42</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className='text-2xl mb-2'>Leetcode</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500">Total Problems Solved</p>
                                    <p className="text-2xl font-bold">235</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Contests Participated</p>
                                    <p className="text-2xl font-bold">42</p>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;