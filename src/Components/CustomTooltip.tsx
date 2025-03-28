import { useTheme } from "../Contexts/ThemeProvider";

const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{
        name: string;
        dataKey: string;
        value: number;
        payload: { platform: string; value: number };
        color?: string;
    }>;
    label?: string;
}> = ({ active, payload, label }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    if (active && payload && payload.length) {
        return (
            <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded shadow-lg`}>
                <p className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{label}</p>
                {payload.map((entry, index) => (
                    <p
                        key={index}
                        className='text-white'
                        style={{ color: entry.color }}
                    >
                        {entry.name ? entry.name : entry.dataKey}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default CustomTooltip;