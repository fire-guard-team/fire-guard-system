import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const chartData = [
    { time: "10:52 PM", value: 22 },
    { time: "05:52 AM", value: 30 },
    { time: "12:52 PM", value: 24 },
    { time: "08:52 PM", value: 32 },
    { time: "10:52 PM", value: 28 },
];

const SectorAlphaTemp = () => {
    return (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm w-full max-w-2xl space-y-6">

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold">Sector Alpha Temp (SN-001)</h2>
                    <p className="text-sm text-gray-500">
                        Detailed information and historical data for this sensor.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm cursor-pointer">
                        <FiEdit2 /> Edit
                    </button>
                    <button className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm cursor-pointer">
                        <FiTrash2 /> Remove
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 text-sm border-b border-border pb-8">
                <p className="text-gray-500">Type</p>
                <p>Temperature</p>

                <p className="text-gray-500">Status</p>
                <span className="w-fit px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    online
                </span>

                <p className="text-gray-500">Location</p>
                <p>Redwood Forest Sector A</p>

                <p className="text-gray-500">Coordinates</p>
                <p>34.0522, -118.2437</p>

                <p className="text-gray-500">Installation Date</p>
                <p>1/15/2023</p>

                <p className="text-gray-500">Last Maintenance</p>
                <p>3/10/2024</p>
            </div>


            <div className="space-y-6">
                <h3 className="font-semibold text-xl">Historical Data</h3>

                <div className="flex items-center gap-2">
                    <button className="border px-3 py-1 rounded-md text-sm bg-gray-100">
                        Temperature
                    </button>
                    <button className="border px-3 py-1 rounded-md text-sm text-gray-500">
                        Humidity
                    </button>
                    <button className="border px-3 py-1 rounded-md text-sm text-gray-500">
                        Smoke
                    </button>

                    <select className="ml-auto border rounded-md px-2 py-1 text-sm">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                    </select>
                </div>

                <div className="h-68">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis unit="°C" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SectorAlphaTemp;
