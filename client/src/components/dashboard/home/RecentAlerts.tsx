
import { useState, type ReactNode } from "react";
import { FaAngleDown, FaCircleInfo } from "react-icons/fa6";
interface AlertItem {
    icon: ReactNode;
    title: string;
    level: "High" | "Medium" | "Low";
    date: string;
    icon2: ReactNode;
    description: string;
}
const levelStyles: Record<AlertItem["level"], string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
};

const items: AlertItem[] = [
    {
        icon: <FaCircleInfo className="text-red-600" />,
        title: "High Smoke Detection - North Sector A",
        level: "High",
        date: "2001/4/4",
        icon2: <FaAngleDown />,
        description:
            "Sensor S004 reported smoke levels exceeding critical thresholds (0.8 ppm). Immediate investigation required. Potential fire ignition in North Sector A.",
    },
    {
        icon: <FaCircleInfo className="text-yellow-600" />,
        title: "Smoke Level Warning - Sector B",
        level: "Medium",
        date: "2001/4/4",
        icon2: <FaAngleDown />,
        description:
            "Smoke levels approaching threshold limits. Monitoring recommended.",
    },
];
const RecentAlerts = () => {
    const [show, setShow] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setShow((prev) => (prev === index ? null : index));
    };

    return (
        <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm">
            <h2 className="font-bold text-xl mb-4">Recent Alerts</h2>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="border border-border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {item.icon}

                                <h3 className="font-medium text-sm">
                                    {item.title}
                                </h3>

                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${levelStyles[item.level]}`}
                                >
                                    {item.level}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-gray-600 text-sm">{item.date}</span>

                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className={`transition-transform duration-200 transition-all duration-300 ${show === index ? "rotate-180" : ""
                                        }`}
                                >
                                    {item.icon2}
                                </button>
                            </div>
                        </div>

                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${show === index ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
                                }`}
                        >
                            <p className="text-md font-medium text-gray-600">Details :</p>
                            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default RecentAlerts;