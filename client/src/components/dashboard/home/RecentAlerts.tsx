
import { type ReactNode, type FC } from "react";
import { FaCircleInfo } from "react-icons/fa6";

interface AlertItem {
    id: number;
    icon: ReactNode;
    title: string;
    level: "High" | "Medium" | "Low";
    date: string;
    description: string;
    sector: string;
    acknowledged: boolean;
}

const levelStyles: Record<AlertItem["level"], string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
};

const levelIcons: Record<AlertItem["level"], ReactNode> = {
    High: <FaCircleInfo className="text-red-600" />,
    Medium: <FaCircleInfo className="text-yellow-600" />,
    Low: <FaCircleInfo className="text-green-600" />,
};

interface RecentAlertsProps {
    alertData: Omit<AlertItem, 'icon'>[];
    loading?: boolean;
}

const RecentAlerts: FC<RecentAlertsProps> = ({ alertData = [], loading = false }) => {
    const items: AlertItem[] = alertData.map((alert) => ({
        ...alert,
        icon: levelIcons[alert.level],
    }));

    if (loading) {
        return (
            <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm">
                <h2 className="font-bold text-xl mb-4">Recent Alerts</h2>
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm">
            <h2 className="font-bold text-xl mb-4">Recent Alerts</h2>

            {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No recent alerts</p>
                    <p className="text-sm mt-1">Alerts will be displayed here when they occur</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`border border-border rounded-lg p-4 hover:bg-gray-50 transition ${
                                item.acknowledged ? 'opacity-60 bg-gray-50' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                    {item.icon}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-medium text-sm ${
                                                item.acknowledged ? 'line-through text-gray-500' : ''
                                            }`}>
                                                {item.title}
                                            </h3>
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-full ${levelStyles[item.level]}`}
                                            >
                                                {item.level}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Sector: {item.sector} • {item.date}
                                            {item.acknowledged && (
                                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                    Acknowledged
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
};

export default RecentAlerts;