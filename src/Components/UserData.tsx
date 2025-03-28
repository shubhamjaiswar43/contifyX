import { toast } from "react-toastify";
import { NameValue, Usernames } from "./Interface";

const devRating = 0;
const cf_base_url = import.meta.env.VITE_APP_CF_BASE_URL;
const cc_base_url = import.meta.env.VITE_APP_CC_BASE_URL;
const lc_base_url = import.meta.env.VITE_APP_LC_BASE_URL;

export const getCodeforcesRating = async (username: string | undefined) => {
    if (!username || devRating) {
        return 0;
    }
    try {
        const api = `${cf_base_url}/user.info?handles=${username.split(',')[0]}`
        const r1 = await fetch(api);
        const res = await r1.json();
        if (res.status === "OK") {
            return res.result[0].rating;
        }
        toast(res.comment);
    } catch (err) {
        toast('Something Went Wrong!!');
        console.log(err);
    }
    return 0;
};
export const getCodechefRating = async (username: string | undefined) => {
    if (!username || devRating) {
        return 0;
    }
    try {
        const api = `${cc_base_url}/handle/${username.split(',')[0]}`;
        const r1 = await fetch(api);
        const res = await r1.json();
        if (res.success) {
            return res.currentRating;
        }
        console.log(res);
    } catch (err) {
        toast('Something Went Wrong!!');
        console.log(err);
    }
    toast(`Codechef Username ${username} Not Found Please Give Correct Username`);
    return 0;
};

export const getLeetcodeRating = async (username: string | undefined) => {
    if (!username || devRating) {
        return 0;
    }
    try {
        const api = `${lc_base_url}/userContestRankingInfo/${username.split(',')[0]}`;
        const r1 = await fetch(api);
        const res = await r1.json();
        return Math.round(res.data.userContestRanking.rating);
    } catch (err) {
        toast('Something Went Wrong!!');
        console.log(err);
    }
    return 0;
};

// takes timestamp (a number ms from 1970s)
const getFormatString = (timestamp: number) => {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    const date = new Date(timestamp);
    const month = months[date.getMonth()];
    const year = date.getFullYear() % 100;
    return `${month} ${year}`;
};

const getCFProblemSolvedCount = async (username: string, data: { [key: string]: number }) => {
    try {
        const api = `${cf_base_url}/user.status?handle=${username}&from=1&count=10000`
        const r1 = await fetch(api);
        const res = await r1.json();
        if (res.status === "OK") {
            for (const subs of res.result) {
                if (subs.verdict !== "OK") continue;
                const time = getFormatString(subs.creationTimeSeconds * 1000);
                if (data[time]) {
                    data[time]++;
                } else {
                    data[time] = 1;
                }
            }
        } else {
            toast(res.comment);
        }
    } catch (err) {
        console.log(err);
    }
};

const getCCProblemSolvedCount = async (username: string, data: { [key: string]: number }) => {
    if (username.length === 0 || !data) return;
    // !!todo doesn't found any useful api for this
    try {
        // !!todo this is the submission count (figure out to get ac submission)
        // const api = `${cc_base_url}/handle/${username}`;
        // const r1 = await fetch(api);
        // const res = await r1.json();
        // if (res.success) {
        //     for (const solvedData of res.heatMap) {
        //         const time = getFormatString(new Date(solvedData.date).getTime())
        //         if (data[time]) {
        //             data[time] += solvedData.value;
        //         } else {
        //             data[time] = solvedData.value;
        //         }
        //     }
        // }
    } catch (err) {
        console.log(err);
    }
};

const getLCProblemSolvedCount = async (username: string, data: { [key: string]: number }) => {
    if (username.length === 0 || !data) return;
    try {
        // !!todo it's limited to 20 submission
        // const api = `${lc_base_url}/${username}/acsubmission`;
        // const r1 = await fetch(api);
        // const res = await r1.json();
        // console.log(res);
        // for (const subs of res.submission) {
        //     const time = getFormatString(subs.timestamp * 1000);
        //     if (data[time]) {
        //         data[time]++;
        //     } else {
        //         data[time] = 1;
        //     }
        // }
    } catch (err) {
        console.log(err);
    }
};

export const getProblemSolvedCount = async (usernames: Usernames | null) => {
    const data: { [key: string]: number } = {};
    if (usernames) {
        for (const username of usernames.codeforces.split(',')) {
            await getCFProblemSolvedCount(username, data);
        }
        for (const username of usernames.codechef.split(',')) {
            await getCCProblemSolvedCount(username, data);
        }
        for (const username of usernames.leetcode.split(',')) {
            await getLCProblemSolvedCount(username, data);
        }
    }
    return data;
};


export const getLCTotalProblemSolved = async (username: string | undefined) => {
    const dbd: Array<NameValue> = [];
    if (username && username.length) {
        try {
            const api = `${lc_base_url}/${username}/solved`;
            const r1 = await fetch(api);
            const res = await r1.json();
            dbd.push({ name: "Easy Solved", value: res.easySolved });
            dbd.push({ name: "Medium Solved", value: res.mediumSolved });
            dbd.push({ name: "Hard Solved", value: res.hardSolved });
        } catch (err) {
            toast("Something Went Wrong");
            console.log(err);
        }
    }
    return dbd;
}

export const getLCTotalACCount = async (username: string | undefined) => {
    let lcTotalACCount = 0;
    if (username && username.length) {
        const dbd: Array<NameValue> = await getLCTotalProblemSolved(username);
        lcTotalACCount = dbd[0].value + dbd[1].value + dbd[2].value;
    }
    return lcTotalACCount;
};

export const getCFTotalACCount = async (username: string | undefined) => {
    let cfTotalACCount = 0;
    if (username && username.length) {
        try {
            const api = `${cf_base_url}/user.status?handle=${username.split(',')[0]}&from=1&count=1000000000`;
            const r1 = await fetch(api);
            const res = await r1.json();
            if (res.status === "OK") {
                let s = new Set();
                for (const subs of res.result) {
                    if (subs.verdict !== "OK") continue;
                    s.add(`${subs.problem.contestId}${subs.problem.index}`);
                }
                cfTotalACCount = s.size;
            } else {
                toast(res.comment);
            }
        } catch (err) {
            toast("Something Went Wrong");
            console.log(err);
        }
    }
    return cfTotalACCount;
};

export const getCCTotalACCount = async (username: string | undefined) => {
    let ccTotalACCount = 0;
    // !!todo (need to create a backend server which would scrape the data)
    if (username) {
        try {
        } catch (err) {
            console.log(err);
        }
    }

    return ccTotalACCount;
}


export const getCFParticipatedContestCount = async (username: string | undefined) => {
    let cfParticipatedContestCount = 0;
    if (username) {
        try {
            const api = `${cf_base_url}/user.status?handle=${username.split(',')[0]}&from=1&count=1000000000`;
            const r1 = await fetch(api);
            const res = await r1.json();
            if (res.status === "OK") {
                let s = new Set();
                for (const subs of res.result) {
                    if (subs.author.participantType !== "CONTESTANT") continue;
                    s.add(subs.contestId);
                }
                cfParticipatedContestCount = s.size;
            } else {
                toast(res.comment);
            }
        } catch (err) {
            toast("Something Went Wrong");
            console.log(err);
        }
    }
    return cfParticipatedContestCount;
}

export const getLCParticipatedContestCount = async (username: string | undefined) => {
    let lcParticipatedContestCount = 0;
    if (username) {
        try {
            const api = `${lc_base_url}/${username.split(',')[0]}/contest`;
            const r1 = await fetch(api);
            const res = await r1.json();
            lcParticipatedContestCount = res.contestAttend;
        } catch (err) {
            toast("Something Went Wrong");
            console.log(err);
        }
    }
    return lcParticipatedContestCount;
}