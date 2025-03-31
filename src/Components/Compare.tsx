import React, { useState } from 'react';
import { useTheme } from '../Contexts/ThemeProvider';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { BarChart, Bar, XAxis as BarXAxis, YAxis as BarYAxis } from 'recharts';
import {
    Star,
    Target,
    Award,
    ChevronDown,
    TrendingUp,
    Loader,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getCFContestStatus, getCFSubmissionStatus, getCFUserInfo, getFormatTimeString } from './UserData';

interface ContestRating {
    contestName: string;
    contestLink: string;
    ratingBefore: number;
    ratingAfter: number;
    ratingUpdateTimestampInSecond: number;
};

interface ProblemSolvedRating {
    ratingRange: string;
    problemsSolved: number;
};

// Enhanced user stats interface
interface UserStats {
    username: string;
    monthlyProblemsSolved: {
        month: string;
        problems: number;
    }[];
    contestRatings: Array<ContestRating>;
    problemSolvedByRating: Array<ProblemSolvedRating>;
    totalProblems: number;
    currentRating: number;
    highestRating: number;
}

// Mock data functions (replace with actual API calls)
const fetchUserStats = async (username: string, platform: string): Promise<UserStats> => {
    const userStats: UserStats = {
        username,
        monthlyProblemsSolved: [],
        contestRatings: [],
        problemSolvedByRating: [],
        totalProblems: 0,
        currentRating: 0,
        highestRating: 0,
    }
    if (platform === 'codeforces') {
        const userInfo = await getCFUserInfo(username);
        userStats.currentRating = userInfo.rating;
        userStats.highestRating = userInfo.maxRating;
        const submissions = await getCFSubmissionStatus(username, 1000000000);
        const contests = await getCFContestStatus(username);
        const monthlyProblems: { [key: string]: number } = {};
        const ratingProblems: { [key: number]: number } = {};

        const now = new Date();
        const acceptedMonths: Array<string> = [];
        let month = now.getMonth(), year = now.getFullYear();
        for (let i = 0; i < 12; i++) {
            const time = new Date();
            time.setMonth(month);
            time.setFullYear(year);
            const monthString = getFormatTimeString(time.getTime());
            monthlyProblems[monthString] = 0;
            acceptedMonths.push(monthString);
            month--;
            if (month < 0) {
                month = 11;
                year--;
            }
        }
        acceptedMonths.reverse();

        // for (let rating = 800; rating <= 2500; rating += 100) {
        //     ratingProblems[rating] = 0;
        // }

        for (const subs of submissions) {
            if (subs.verdict !== "OK") continue;

            // totalProblemCount
            userStats.totalProblems++;

            // monthlyProblemSolved
            let monthString = getFormatTimeString(subs.creationTimeSeconds * 1000);
            if (acceptedMonths.indexOf(monthString) !== -1) monthlyProblems[monthString]++;

            // problemSolvedRatingWise
            let rating = subs.problem.rating;
            if (rating) {
                if (ratingProblems[rating]) { ratingProblems[rating]++; }
                else { ratingProblems[rating] = 1; }
            }
        }

        // contestRatingsInfo
        for (let i = Math.max(contests.length - 10, 0); i < contests.length; i++) {
            const contestRating: ContestRating = {
                contestName: contests[i].contestName,
                contestLink: `https://codeforces.com/contest/${contests[i].contestId}`,
                ratingBefore: contests[i].oldRating,
                ratingAfter: contests[i].newRating,
                ratingUpdateTimestampInSecond: contests[i].ratingUpdateTimeSeconds
            };
            userStats.contestRatings.push(contestRating);
        }

        // monthlyProblemSolved
        for (const month of acceptedMonths) {
            userStats.monthlyProblemsSolved.push({ month, problems: monthlyProblems[month] });
        }
        for (const rating in ratingProblems) {
            userStats.problemSolvedByRating.push({ ratingRange: `${rating}`, problemsSolved: ratingProblems[rating] });
        }
    } else if (platform === 'codechef') {
    } else if (platform === 'leetcode') {
    }
    return userStats;
};

const CompetitorComparison: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState('performance');
    const [username1, setUsername1] = useState('');
    const [username2, setUsername2] = useState('');
    const [platform, setPlatform] = useState('codeforces');
    const [user1Stats, setUser1Stats] = useState<UserStats | null>(null);
    const [user2Stats, setUser2Stats] = useState<UserStats | null>(null);
    const [performanceVisualization, setPerformanceVisualization] = useState('monthlyProblems');

    const platforms = [
        { value: 'codeforces', label: 'Codeforces' },
        { value: 'codechef', label: 'CodeChef' },
        { value: 'leetcode', label: 'LeetCode' }
    ];

    const performanceVisualizations = [
        { value: 'monthlyProblems', label: 'Monthly Problems Solved' },
        { value: 'contestRatings', label: 'Contest Ratings' }
    ];

    const combineContestStats = (stats1: UserStats, stats2: UserStats) => {
        let idx1 = stats1.contestRatings.length - 1;
        let idx2 = stats2.contestRatings.length - 1;
        const cr1: Array<ContestRating> = [];
        const cr2: Array<ContestRating> = [];
        let lastRating1 = stats1.currentRating;
        let lastRating2 = stats2.currentRating;
        while (idx1 >= 0 || idx2 >= 0) {
            let c1 = 1, c2 = 0;
            if (idx1 >= 0 && idx2 >= 0) {
                c1 = stats1.contestRatings[idx1].ratingUpdateTimestampInSecond;
                c2 = stats2.contestRatings[idx2].ratingUpdateTimestampInSecond;
            } else if (idx2 >= 0) {
                c1--;
                c2++;
            }
            if (c1 === c2) {
                const cn1 = stats1.contestRatings[idx1].contestName;
                const cn2 = stats2.contestRatings[idx2].contestName;
                const mergeContestName = cn1 === cn2 ? cn1 : `${cn1} / ${cn2}`;
                cr1.push({ ...stats1.contestRatings[idx1], contestName: mergeContestName });
                cr2.push({ ...stats2.contestRatings[idx2], contestName: mergeContestName });
                idx1--, idx2--;
            } else if (c1 > c2) {
                cr1.push(stats1.contestRatings[idx1]);
                cr2.push({ ...stats1.contestRatings[idx1] });
                cr2[cr2.length - 1].ratingBefore = lastRating2;
                cr2[cr2.length - 1].ratingAfter = lastRating2;
                idx1--;
            } else {
                cr1.push({ ...stats2.contestRatings[idx2] });
                cr1[cr1.length - 1].ratingBefore = lastRating1;
                cr1[cr1.length - 1].ratingAfter = lastRating1;
                cr2.push(stats2.contestRatings[idx2]);
                idx2--;
            }
            lastRating1 = cr1[cr1.length - 1].ratingBefore;
            lastRating2 = cr2[cr2.length - 1].ratingBefore;
        }
        cr1.reverse();
        cr2.reverse();
        stats1.contestRatings = cr1;
        stats2.contestRatings = cr2;
    };

    const handleCompare = async () => {
        if (!username1 || !username2) {
            toast.error('Please enter usernames for both competitors');
            return;
        }
        setIsLoading(true);
        try {
            const [stats1, stats2] = await Promise.all([
                fetchUserStats(username1, platform),
                fetchUserStats(username2, platform)
            ]);
            combineContestStats(stats1, stats2);
            setUser1Stats(stats1);
            setUser2Stats(stats2);
        } catch (err) {
            console.log(err);
            toast.error('Error fetching user statistics');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPerformanceVisualization = () => {
        if (!user1Stats || !user2Stats) return null;

        switch (performanceVisualization) {
            case 'monthlyProblems':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={user1Stats.monthlyProblemsSolved.map((item, index) => ({
                                month: item.month,
                                [username1]: item.problems,
                                [username2]: user2Stats.monthlyProblemsSolved[index].problems
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e0e0e0'} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#fff',
                                    borderColor: isDark ? '#374151' : '#e0e0e0'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey={username1}
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey={username2}
                                stroke="#82ca9d"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'contestRatings':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            onClick={(data) => {
                                const contestLink = data?.activePayload ? data.activePayload[0]?.payload?.contestLink : "";
                                window.open(contestLink, '_blank');
                            }}
                            data={user1Stats.contestRatings.map((contest, index) => ({
                                contestName: contest.contestName,
                                contestLink: contest.contestLink,
                                [username1]: contest.ratingAfter,
                                [username2]: user2Stats.contestRatings[index].ratingAfter
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e0e0e0'} />
                            <XAxis dataKey="contestName" />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const contest1 = user1Stats.contestRatings.find(c => c.contestName === label);
                                        const contest2 = user2Stats.contestRatings.find(c => c.contestName === label);
                                        return (
                                            <div className={`p-4 rounded ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                                                <h4 className="font-bold mb-2">{label}</h4>
                                                <div>{username1}: {contest1?.ratingBefore} → {contest1?.ratingAfter}</div>
                                                <div>{username2}: {contest2?.ratingBefore} → {contest2?.ratingAfter}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#fff',
                                    borderColor: isDark ? '#374151' : '#e0e0e0'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey={username1}
                                stroke="#8884d8"
                                activeDot={{
                                    r: 8,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey={username2}
                                stroke="#82ca9d"
                                activeDot={{
                                    r: 8,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    const renderProblemSolvedByRating = () => {
        if (!user1Stats || !user2Stats) return null;

        return (

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    onClick={(data) => {
                        const rating = data?.activePayload ? data.activePayload[0].payload.ratingRange : 800;
                        const url = `https://codeforces.com/problemset?tags=${rating}-${rating}`;
                        window.open(url, '_blank');
                    }}
                    data={
                        user1Stats.problemSolvedByRating.length > user2Stats.problemSolvedByRating.length ?
                            user1Stats.problemSolvedByRating.map((item, index) => ({
                                ratingRange: item.ratingRange,
                                [username1]: item.problemsSolved,
                                [username2]: user2Stats.problemSolvedByRating[index]?.problemsSolved
                            }))
                            :
                            user2Stats.problemSolvedByRating.map((item, index) => ({
                                ratingRange: item.ratingRange,
                                [username1]: user1Stats.problemSolvedByRating[index]?.problemsSolved,
                                [username2]: item.problemsSolved,
                            }))
                    }
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e0e0e0'} />
                    <BarXAxis dataKey="ratingRange" />
                    <BarYAxis />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#fff',
                            borderColor: isDark ? '#374151' : '#e0e0e0'
                        }}
                    />
                    <Legend />
                    <Bar dataKey={username1} fill="#8884d8" />
                    <Bar dataKey={username2} fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderAdditionalStats = () => {
        if (!user1Stats || !user2Stats) return null;

        return (
            <div className="grid md:grid-cols-2 gap-4 w-full h-full">
                {[user1Stats, user2Stats].map((userStats, index) => {
                    const username = index === 0 ? username1 : username2;
                    return (
                        <div
                            key={username}
                            className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'} h-full`}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <TrendingUp className="mr-2" />
                                {username} Advanced Stats
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Problems Solved</span>
                                    <strong>{userStats.totalProblems}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Current Rating</span>
                                    <strong>{userStats.currentRating}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Highest Rating</span>
                                    <strong>{userStats.highestRating}</strong>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`w-full overflow-hidden h-screen flex flex-col p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header with input and compare button - same as before */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Competitor Comparison</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Username 1"
                        value={username1}
                        onChange={(e) => setUsername1(e.target.value)}
                        className={`p-2 rounded-lg w-40 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                    />
                    <input
                        type="text"
                        placeholder="Username 2"
                        value={username2}
                        onChange={(e) => setUsername2(e.target.value)}
                        className={`p-2 rounded-lg w-40 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                    />
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className={`p-2 rounded-lg w-40 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                        {platforms.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleCompare}
                        className={`p-2 rounded-lg w-24 cursor-pointer flex justify-center ${isDark
                            ? 'bg-purple-700 text-white hover:bg-purple-600'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                    >
                        {
                            isLoading ? <Loader className='animate-spin' /> : 'Compare'
                        }
                    </button>
                </div>
            </div>

            {/* Tabs and Content */}
            <div className="flex-grow flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-600 mb-4">
                    {[
                        { value: 'performance', icon: Award, label: 'Performance' },
                        { value: 'problemRatings', icon: Star, label: 'Problem Ratings' },
                        { value: 'additionalStats', icon: Target, label: 'Additional Stats' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`
                                flex items-center px-4 py-2 mr-2 cursor-pointer 
                                ${activeTab === tab.value
                                    ? 'border-b-2 border-purple-500 text-purple-500'
                                    : 'text-gray-500 hover:text-gray-300'}
                            `}
                        >
                            <tab.icon className="mr-2" size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Performance Tab - with Visualization Dropdown */}
                {activeTab === 'performance' && (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-end mb-4">
                            <div className="relative">
                                <select
                                    value={performanceVisualization}
                                    onChange={(e) => setPerformanceVisualization(e.target.value)}
                                    className={`
                                        appearance-none p-2 pr-8 rounded-lg
                                        ${isDark
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }
                                    `}
                                >
                                    {performanceVisualizations.map((vis) => (
                                        <option key={vis.value} value={vis.value}>
                                            {vis.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                />
                            </div>
                        </div>
                        <div className="flex-grow">
                            {renderPerformanceVisualization()}
                        </div>
                    </div>
                )}

                {/* Problem Ratings Tab */}
                {activeTab === 'problemRatings' && (
                    <div className="flex-grow">
                        {renderProblemSolvedByRating()}
                    </div>
                )}

                {/* Additional Stats Tab */}
                {activeTab === 'additionalStats' && (
                    <div className="flex-grow">
                        {renderAdditionalStats()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitorComparison;