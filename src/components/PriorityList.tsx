import React, { useState, useMemo } from 'react';

// --- Mock Data and Types (for standalone example) ---
// In a real project, you would import these from your project's type definitions.
interface Task {
    id: number;
    priority_code: string;
    work_item_link: string;
    name: string;
    status: 'Todo' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    assignee: string;
    start_date: string;
    end_date: string;
    delivery_date: string;
    release_version: string;
    num_resources: number;
    total_hours_available: number;
}

const mockTasks: Task[] = [
    { id: 1, priority_code: 'P1-H', work_item_link: 'http://example.com/1', name: 'Design new dashboard', status: 'In Progress', priority: 'High', assignee: 'Alice', start_date: '2024-01-10', end_date: '2024-01-20', delivery_date: '2024-01-22', release_version: 'v1.1', num_resources: 2, total_hours_available: 80 },
    { id: 2, priority_code: 'P2-M', work_item_link: 'http://example.com/2', name: 'Develop API endpoints', status: 'Todo', priority: 'Medium', assignee: 'Bob', start_date: '2024-01-15', end_date: '2024-01-25', delivery_date: '2024-01-28', release_version: 'v1.1', num_resources: 1, total_hours_available: 40 },
    { id: 3, priority_code: 'P3-L', work_item_link: 'http://example.com/3', name: 'Fix login bug', status: 'Done', priority: 'High', assignee: 'Charlie', start_date: '2024-01-05', end_date: '2024-01-08', delivery_date: '2024-01-09', release_version: 'v1.0', num_resources: 1, total_hours_available: 24 },
    { id: 4, priority_code: 'P1-M', work_item_link: 'http://example.com/4', name: 'Update documentation', status: 'In Progress', priority: 'Low', assignee: 'Alice', start_date: '2024-01-18', end_date: '2024-01-28', delivery_date: '2024-02-01', release_version: 'v1.1', num_resources: 1, total_hours_available: 30 },
];

// --- Main Component ---

const allColumns = [
    { id: 'priority_code', name: 'Priority Code' },
    { id: 'work_item_link', name: 'Work Item Link' },
    { id: 'name', name: 'Task Name' },
    { id: 'status', name: 'Status' },
    { id: 'priority', name: 'Priority' },
    { id: 'assignee', name: 'Assignee' },
    { id: 'start_date', name: 'Start Date' },
    { id: 'end_date', name: 'End Date' },
    { id: 'delivery_date', name: 'Delivery Date' },
    { id: 'release_version', name: 'Release Version' },
    { id: 'num_resources', name: 'Number of Resources' },
    { id: 'total_hours_available', name: 'Total Hours Available' },
];

function PriorityList({ tasks }: { tasks: Task[] }) {
    const [visibleColumns, setVisibleColumns] = useState<string[]>(['priority_code', 'name', 'status', 'priority', 'assignee', 'delivery_date', 'release_version']);
    const [filter, setFilter] = useState('');
    const [filterColumn, setFilterColumn] = useState('name');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Memoize filtered tasks to avoid recalculating on every render
    const filteredTasks = useMemo(() => {
        if (!filter) return tasks;
        return tasks.filter(task => {
            const taskValue = task[filterColumn as keyof Task];
            return taskValue?.toString().toLowerCase().includes(filter.toLowerCase());
        });
    }, [tasks, filter, filterColumn]);

    // Get the display name for the current filter column
    const filterColumnName = allColumns.find(c => c.id === filterColumn)?.name || filterColumn;

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Filter Section */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filterColumn}
                            onChange={(e) => setFilterColumn(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {allColumns.map(col => (
                                <option key={col.id} value={col.id}>{col.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder={`Filter by ${filterColumnName}...`}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Column Visibility Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Columns
                        </button>
                        {isDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                    {allColumns.map(column => (
                                        <label key={column.id} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={visibleColumns.includes(column.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setVisibleColumns(prev =>
                                                        checked ? [...prev, column.id] : prev.filter(colId => colId !== column.id)
                                                    );
                                                }}
                                            />
                                            {column.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {allColumns.filter(col => visibleColumns.includes(col.id)).map(col => (
                                <th key={col.id} scope="col" className="px-6 py-3">{col.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                                {allColumns.filter(col => visibleColumns.includes(col.id)).map(col => (
                                    <td key={col.id} className="px-6 py-4">
                                        {String(task[col.id as keyof Task])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- App Component to render the PriorityList ---
export default function App() {
    return (
        <PriorityList tasks={mockTasks} />
    );
}
