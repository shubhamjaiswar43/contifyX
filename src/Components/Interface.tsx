export interface Usernames {
    codeforces: string;
    codechef: string;
    leetcode: string;
};

export interface NameValue {
    name: string;
    value: number;
}

export interface KeyStats {
    platform: string;
    stats: Array<NameValue>
}
export interface TimelyProblemSolvedData {
    time: string;
    problems: number;
}

export interface ProgressData {
    platform: string;
    rating: number;
    problemSolved: number;
}

export interface CompetitorsInfo {
    platform: string;
    values: Array<number>
};