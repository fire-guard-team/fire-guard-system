import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import AddSensorModal from "./AddSensorModal";

type Sensor = {
    id: string;
    name: string;
    type: string;
    location: string;
    status: "online" | "offline";
};

const sensors: Sensor[] = [
    {
        id: "SN-001",
        name: "Sector Alpha",
        type: "Temperature",
        location: "Redwood Forest Sector",
        status: "online",
    },
    {
        id: "SN-002",
        name: "Central Basin",
        type: "Humidity",
        location: "Central Basin Reserve",
        status: "offline",
    },
    {
        id: "SN-003",
        name: "Peak Lookout",
        type: "Smoke",
        location: "Peak Lookout Point",
        status: "online",
    },
    {
        id: "SN-004",
        name: "Valley Edge",
        type: "Multi-sensor",
        location: "Valley Edge Sector D",
        status: "offline",
    },
    {
        id: "SN-005",
        name: "Riverbend Watch",
        type: "Temperature",
        location: "Riverbend Wetlands",
        status: "online",
    },
    {
        id: "SN-006",
        name: "Northern Ridge",
        type: "Smoke",
        location: "Northern Ridge Trail",
        status: "online",
    },
];

const ITEMS_PER_PAGE = 6;

const DeployedSensors = () => {
    const [openModal, setOpenModal] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("")
    const filteredSensors = sensors.filter((sensor) =>
        `${sensor.id} ${sensor.name} ${sensor.type} ${sensor.location}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    const paginatedSensors = filteredSensors.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredSensors.length / ITEMS_PER_PAGE);




    return (
        <div className="bg-white border border-border rounded-xl p-8 shadow-sm space-y-8 max-w-4xl">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Deployed Sensors</h1>
                    <p className="text-sm text-gray-600 max-w-md">
                        Manage and monitor all environmental sensors in your network.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="search"
                        placeholder="Search sensors..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                        onClick={() => setOpenModal(true)}
                        className="flex items-center gap-2 bg-btn rounded-lg px-4 py-2.5 text-[#015109] font-semibold cursor-pointer"
                    >
                        <CiCirclePlus size={22} />
                        Add Sensor
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b-2 border-border text-gray-500">
                        <tr className="text-left">
                            <th className="py-5">ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody >
                        {paginatedSensors.map((sensor) => (
                            <tr
                                key={sensor.id}
                                className="hover:bg-gray-50 transition"
                            >
                                <td className="py-8 font-medium">{sensor.id}</td>
                                <td>{sensor.name}</td>
                                <td>{sensor.type}</td>
                                <td>{sensor.location}</td>
                                <td>
                                    <span
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${sensor.status === "online"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {sensor.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <button className="text-gray-500 hover:text-gray-700 text-lg">
                                        •••
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-8 pt-6 border-t-2 border-border">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 text-gray-600 disabled:opacity-50"
                >
                    <FaAngleLeft size={18} />
                    Previous
                </button>

                <span className="w-10 h-10 flex items-center justify-center border border-border rounded-full font-semibold">
                    {page}
                </span>

                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 text-gray-600 disabled:opacity-50"
                >
                    Next
                    <FaAngleRight size={18} />
                </button>
            </div>
            <div className="">
                <AddSensorModal onClose={() => setOpenModal(false)} open={openModal} />
            </div>
        </div>
    );
};

export default DeployedSensors;
