import { useState } from 'react';
import { Search, Eye, Edit3, Calendar, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '../../hooks/useAppointments';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

function safeFormat(dateValue: any, formatStr: string) {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatStr);
}

interface AppointmentTableProps {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;

    onView: (apt: Appointment) => void;
    onEdit: (apt: Appointment) => void;
    onReschedule: (apt: Appointment) => void;
    onCancel: (apt: Appointment) => void;
    onDelete: (apt: Appointment) => void;
}

export function AppointmentTable({
    appointments,
    loading,
    error,
    onView,
    onEdit,
    onReschedule,
    onCancel,
    onDelete
}: AppointmentTableProps) {

    const { role } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 8;

    const filteredAppointments = appointments.filter((apt) => {

        const matchesSearch =
            (apt.patient_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.phone || '').includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedAppointments = filteredAppointments.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    if (loading) {
        return <div style={{ padding: '48px', textAlign: 'center' }}>Loading appointments...</div>;
    }

    if (error) {
        return <div style={{ padding: '48px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    return (
        <div className="table-container">

            <div className="table-header-row">

                <div className="search-input-wrapper" style={{ maxWidth: '360px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Search patient..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                </select>

            </div>

            <table className="data-table">

                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Reason</th>
                        <th>Appointment Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {paginatedAppointments.map((apt) => (

                        <tr key={apt.id}>

                            <td>
                                <strong>{apt.patient_name}</strong>
                                <div>{apt.email}</div>
                            </td>

                            <td>{apt.reason_for_visit}</td>

                            <td>
                                {safeFormat(apt.appointment_time, "MMM dd yyyy")} <br />
                                {safeFormat(apt.appointment_time, "hh:mm a")}
                            </td>

                            <td>
                                <Badge status={apt.status} />
                            </td>

                            <td>

                                <ActionButton icon={<Eye size={16} />} onClick={() => onView(apt)} />

                                {role === "Admin" && (
                                    <>
                                        <ActionButton icon={<Edit3 size={16} />} onClick={() => onEdit(apt)} />
                                        <ActionButton icon={<Calendar size={16} />} onClick={() => onReschedule(apt)} />
                                        <ActionButton icon={<XCircle size={16} />} onClick={() => onCancel(apt)} />
                                        <ActionButton icon={<Trash2 size={16} />} onClick={() => onDelete(apt)} />
                                    </>
                                )}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

function ActionButton({ icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
            {icon}
        </button>
    );
}
