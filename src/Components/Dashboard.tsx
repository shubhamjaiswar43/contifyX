import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

// Dummy contest data
// const DUMMY_CONTESTS: Contest[] = [
//     {
//         name: 'Contest1',
//         platform: 'Codeforces',
//         startTime: new Date('2025-04-15T20:00:00+05:30'),
//         length: '2h'
//     },
//     {
//         name: 'Contest2',
//         platform: 'CodeChef',
//         startTime: new Date('2025-04-20T21:30:00+05:30'),
//         length: '3h'
//     },
//     {
//         name: 'Contest3',
//         platform: 'LeetCode',
//         startTime: new Date('2025-04-21T10:00:00+05:30'),
//         length: '1h 30m'
//     },
//     {
//         name: 'Contest4',
//         platform: 'Codeforces',
//         startTime: new Date('2025-04-25T19:45:00+05:30'),
//         length: '2h 15m'
//     },
//     {
//         name: 'Contest5',
//         platform: 'Codeforces',
//         startTime: new Date('2025-04-25T19:45:00+05:30'),
//         length: '2h 15m'
//     },
//     {
//         name: 'Contest6',
//         platform: 'Codeforces',
//         startTime: new Date('2025-04-25T19:45:00+05:30'),
//         length: '2h 15m'
//     },
//     {
//         name: 'Contest7',
//         platform: 'Codeforces',
//         startTime: new Date('2025-04-25T19:45:00+05:30'),
//         length: '2h 15m'
//     },
//     {
//         name: 'Contest7',
//         platform: 'Codeforces',
//         startTime: new Date('2025-04-25T19:45:00+05:30'),
//         length: '2h 15m'
//     },
//     {
//         name: 'Contest8',
//         platform: 'CodeChef',
//         startTime: new Date('2025-05-01T00:00:00+05:30'),
//         length: '10 days'
//     }
// ];

// Utility function to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
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
    const fetchContestData = async () => {
        const contests: Array<Contest> = [];
        const codeforesContests: Array<Contest> = await getCodeforcesContests();
        for (const contest of codeforesContests) contests.push(contest);
        contests.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        setContestInfo(contests);
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

    return (
        <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen p-6`}>
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {contestType === 'upcoming' ? 'Upcoming' : 'Past'} Contests
                    </h1>

                    <div className="flex space-x-4">
                        {/* Contest Type Dropdown */}
                        <select
                            value={contestType}
                            onChange={(e) => {
                                setContestType(e.target.value as 'upcoming' | 'past');
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-2 rounded-md ${darkMode
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
                            className={`px-3 py-2 rounded-md ${darkMode
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

                {/* Contest Table */}
                <div className="overflow-x-auto">
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
                                        <a target='_blank' className='hover:text-blue-400' href={contest.contestLink}>{contest.name}</a>
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

                    {/* Pagination */}
                    {filteredContests.length > 0 ? (
                        <div className="flex justify-center items-center mt-6 space-x-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${currentPage === 1
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-blue-600'
                                    } ${darkMode
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                    }`}
                            >
                                <ChevronLeft />
                            </button>

                            {[...Array(Math.min(5, totalPages))].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 rounded-md ${currentPage === index + 1
                                        ? 'bg-blue-600 text-white'
                                        : darkMode
                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md ${currentPage === totalPages
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-blue-600'
                                    } ${darkMode
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                    }`}
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center mt-6 text-gray-500">
                            No contests found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestDashboard;