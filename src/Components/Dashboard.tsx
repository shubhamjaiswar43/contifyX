import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader, Calendar, Clock, ExternalLink } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeProvider';
import { toast } from 'react-toastify';

// Types for Contest
interface Contest {
    name: string;
    contestLink: string;
    platform: 'Codeforces' | 'CodeChef' | 'LeetCode';
    platformLink: string;
    startTime: Date;
    length: string;
}

// Utility function to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    }).format(date);
};

const ContestDashboard: React.FC = () => {
    const { theme } = useTheme();
    const darkMode = (theme === 'dark');
    const cf_base_url = import.meta.env.VITE_APP_CF_BASE_URL;

    // loading states
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Dropdown states
    const [contestType, setContestType] = useState<'upcoming' | 'past'>('upcoming');
    const [platform, setPlatform] = useState<'all' | 'Codeforces' | 'CodeChef' | 'LeetCode'>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const contestsPerPage = 8;

    // fetching contents information
    const getFormattedLength = (second: number) => {
        if (second == 0) return "0 seconds";
        let res: string = ""
        if (second >= (60 * 60 * 24)) {
            let days = Math.floor(second / (60 * 60 * 24));
            res += `${days} ${days == 1 ? "day" : "days"} `;
            second %= (60 * 60 * 24);
        }
        if (second >= (60 * 60)) {
            let hrs = Math.floor(second / (60 * 60));
            res += `${hrs} ${hrs == 1 ? "hr" : "hrs"} `;
            second %= (60 * 60);
        }
        if (second >= 60) {
            let mints = Math.floor(second / 60);
            res += `${mints} ${mints == 1 ? "mint" : "mints"} `;
            second %= 60;
        }
        if (second >= 1) {
            res += `${second} ${second == 1 ? "sec" : "secs"} `;
        }
        res = res.slice(0, res.length - 1);
        return res;
    };
    const [contestInfo, setContestInfo] = useState<Array<Contest>>([]);
    const getCodeforcesContests = async () => {
        const contests: Array<Contest> = [];
        try {
            const r1 = await fetch(`${cf_base_url}/contest.list`);
            const r2 = await r1.json();
            if (r2.status === "OK") {
                for (const contest of r2.result) {
                    contests.push({
                        name: contest.name,
                        contestLink: `https://codeforces.com/contest/${contest.id}`,
                        platform: 'Codeforces',
                        platformLink: 'https://codeforces.com/contests',
                        startTime: new Date(contest.startTimeSeconds * 1000),
                        length: getFormattedLength(contest.durationSeconds)
                    });
                }
            } else {
                toast(r2.comment);
            }
        } catch (err) {
            toast("Something Went Wrong!!");
            console.log(err);
        }
        return contests;
    };
    const computeContestsData = (baseTime: number, baseContest: number, timeGap: number,
        upcomingCount: number, pastCount: number, platform: 'Codeforces' | 'CodeChef' | 'LeetCode',
        platformLink: string, contestName: string, contestLink: string, contestLength: string, contests: Array<Contest>) => {
        const currTime = new Date().getTime();
        const contestGap = Math.floor((currTime - baseTime) / timeGap);
        const pushContest = (contestNumber: number, contestTime: number) => {
            contests.push({
                'name': contestName.replace('<contestNumber>', `${contestNumber}`),
                platform,
                platformLink,
                'contestLink': contestLink.replace('<contestNumber>', `${contestNumber}`),
                'length': contestLength,
                'startTime': new Date(contestTime)
            });
        }
        let nextContest = baseContest + contestGap + 1;
        for (let i = 0; i < upcomingCount; i++) {
            const contestTime = baseTime + timeGap * (nextContest - baseContest);
            pushContest(nextContest, contestTime);
            nextContest++;
        }
        let pastContest = baseContest + contestGap;
        for (let i = 0; i < pastCount; i++) {
            const contestTime = baseTime + timeGap * (pastContest - baseContest);
            pushContest(pastContest, contestTime);
            pastContest--;
        }
    };
    const getCodechefContests = (): Array<Contest> => {
        const baseTime = 1710340200000;
        const baseContest = 125;
        const timeGap = 7 * 24 * 60 * 60 * 1000;
        const contests: Array<Contest> = [];
        computeContestsData(baseTime,
            baseContest, timeGap, 2, 5, 'CodeChef',
            'https://codechef.com',
            'Codechef Starters <contestNumber>',
            'https://www.codechef.com/START<contestNumber>',
            getFormattedLength(2 * 60 * 60), contests
        );
        return contests;
    };
    const getLeetcodeContests = (): Array<Contest> => {
        const baseTimeWeekly = 1550975400000;
        const baseContestWeekly = 125;
        const baseTimeBiweekly = 1709389800000;
        const baseContestBiweekly = 125;
        const timeGap = 7 * 24 * 60 * 60 * 1000;
        const contests: Array<Contest> = [];
        // for weekly
        computeContestsData(baseTimeWeekly,
            baseContestWeekly, timeGap, 2, 4, 'LeetCode',
            'https://leetcode.com',
            'Leetcode Weekly Contest <contestNumber>',
            'https://leetcode.com/contest/weekly-contest-<contestNumber>',
            getFormattedLength(90 * 60),
            contests
        );
        // for biweekly
        computeContestsData(baseTimeBiweekly,
            baseContestBiweekly, 2 * timeGap, 1, 2, 'LeetCode',
            'https://leetcode.com',
            'Leetcode Biweekly Contest <contestNumber>',
            'https://leetcode.com/contest/biweekly-contest-<contestNumber>',
            getFormattedLength(90 * 60),
            contests
        );
        return contests;
    };
    const fetchContestData = async () => {
        setIsLoading(true);
        const contests: Array<Contest> = [];
        const codeforesContests: Array<Contest> = await getCodeforcesContests();
        const codechefContests: Array<Contest> = getCodechefContests();
        const leetcodeContests: Array<Contest> = getLeetcodeContests();
        for (const contest of codeforesContests) contests.push(contest);
        for (const contest of codechefContests) contests.push(contest);
        for (const contest of leetcodeContests) contests.push(contest);
        contests.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        setContestInfo(contests);
        setIsLoading(false);
    }
    useEffect(() => {
        fetchContestData();
    }, []);

    // Filter and sort contests
    const filteredContests = useMemo(() => {
        const now = new Date();
        const contests = contestInfo
            .filter(contest => {
                const isUpcomingContest = contest.startTime > now;
                const isPlatformMatch = platform === 'all' || contest.platform === platform;
                return (contestType === 'upcoming' ? isUpcomingContest : !isUpcomingContest) &&
                    isPlatformMatch;
            });
        if (contestType === "upcoming") {
            contests.reverse();
        }
        return contests;
    }, [contestInfo, contestType, platform]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredContests.length / contestsPerPage);
    const indexOfLastContest = currentPage * contestsPerPage;
    const indexOfFirstContest = indexOfLastContest - contestsPerPage;
    const currentContests = filteredContests.slice(indexOfFirstContest, indexOfLastContest);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Determine which pagination buttons to show
    const getPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 md:px-4 md:py-2 rounded-md text-sm md:text-base ${
                        currentPage === i
                            ? 'bg-blue-600 text-white'
                            : darkMode
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    // Function to render card view for mobile
    const renderContestCard = (contest: Contest, index: number) => {
        return (
            <div 
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                } border`}
            >
                <h3 className="font-semibold text-lg mb-1 break-words">
                    <a href={contest.contestLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 inline-flex items-center">
                        {contest.name}
                        <ExternalLink className="ml-1" size={16} />
                    </a>
                </h3>
                
                <div className={`inline-block px-2 py-1 rounded text-xs mb-2 ${
                    contest.platform === 'Codeforces' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    contest.platform === 'CodeChef' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                    <a href={contest.platformLink} target="_blank" rel="noopener noreferrer">
                        {contest.platform}
                    </a>
                </div>
                
                <div className="grid grid-cols-1 gap-1 mt-2 text-sm">
                    <div className="flex items-center">
                        <Calendar size={16} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{formatDate(contest.startTime)}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock size={16} className="mr-2 flex-shrink-0" />
                        <span>{contest.length}</span>
                    </div>
                </div>
            </div>
        );
    };

    // Function to toggle contest refresh
    const refreshContests = () => {
        fetchContestData();
    };

    return (
        <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen p-2 sm:p-4 md:p-6`}>
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-between items-center mb-4 sm:mb-6">
                    <h1 className="text-xl md:text-2xl font-bold m-2">
                        {contestType === 'upcoming' ? 'Upcoming' : 'Past'} Contests
                    </h1>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        {/* Contest Type Dropdown */}
                        <select
                            value={contestType}
                            onChange={(e) => {
                                setContestType(e.target.value as 'upcoming' | 'past');
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-2 rounded-md w-full sm:w-auto ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-gray-100 text-gray-900 border-gray-300'
                            }`}
                        >
                            <option value="upcoming">Upcoming Contests</option>
                            <option value="past">Past Contests</option>
                        </select>

                        {/* Platform Dropdown */}
                        <select
                            value={platform}
                            onChange={(e) => {
                                setPlatform(e.target.value as 'all' | 'Codeforces' | 'CodeChef' | 'LeetCode');
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-2 rounded-md w-full sm:w-auto ${darkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-gray-100 text-gray-900 border-gray-300'
                            }`}
                        >
                            <option value="all">All Platforms</option>
                            <option value="Codeforces">Codeforces</option>
                            <option value="CodeChef">CodeChef</option>
                            <option value="LeetCode">LeetCode</option>
                        </select>
                    </div>
                </div>

                {/* Refresh button */}
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={refreshContests} 
                        className={`px-3 py-2 rounded-md text-sm flex items-center ${
                            darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader size={16} className="animate-spin mr-2" />
                        ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        )}
                        Refresh
                    </button>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-center items-center mt-8 mb-8">
                        <Loader size={30} className="animate-spin text-blue-500" />
                    </div>
                )}

                {/* Mobile card view */}
                <div className="sm:hidden">
                    {!isLoading && currentContests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {currentContests.map((contest, index) => renderContestCard(contest, index))}
                        </div>
                    ) : !isLoading && (
                        <div className="text-center mt-6 text-gray-500">
                            No contests found.
                        </div>
                    )}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block overflow-x-auto">
                    {!isLoading && currentContests.length > 0 ? (
                        <table className={`w-full border-collapse ${darkMode
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-900'
                        }`}>
                            <thead>
                                <tr className={`${darkMode
                                    ? 'bg-gray-700 border-gray-600'
                                    : 'bg-gray-200 border-gray-300'
                                    } border-b`}>
                                    <th className="p-3 text-left">Contest Name</th>
                                    <th className="p-3 text-left">Platform</th>
                                    <th className="p-3 text-left">Date & Time (IST)</th>
                                    <th className="p-3 text-left">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentContests.map((contest, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b ${darkMode
                                            ? 'border-gray-700 hover:bg-gray-700'
                                            : 'border-gray-200 hover:bg-gray-100'
                                            } transition-colors`}
                                    >
                                        <td className="p-3">
                                            <a target='_blank' className='hover:text-blue-400 inline-flex items-center' href={contest.contestLink}>
                                                {contest.name}
                                                <ExternalLink className="ml-1" size={16} />
                                            </a>
                                        </td>
                                        <td className="p-3">
                                            <a target='_blank' className='hover:text-blue-400' href={contest.platformLink}>{contest.platform}</a>
                                        </td>
                                        <td className="p-3">{formatDate(contest.startTime)}</td>
                                        <td className="p-3">{contest.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !isLoading && (
                        <div className="text-center mt-6 text-gray-500">
                            No contests found.
                        </div>
                    )}
                </div>

                {/* Pagination - responsive */}
                {!isLoading && filteredContests.length > 0 && (
                    <div className="flex justify-center items-center mt-6 flex-wrap gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1 md:p-2 rounded-md ${currentPage === 1
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-blue-600'
                                } ${darkMode
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex space-x-1 md:space-x-2">
                            {getPaginationButtons()}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-1 md:p-2 rounded-md ${currentPage === totalPages
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-blue-600'
                                } ${darkMode
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Page indicator for mobile */}
                {!isLoading && filteredContests.length > 0 && (
                    <div className="text-center mt-2 text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestDashboard;