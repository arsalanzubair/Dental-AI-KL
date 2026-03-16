import { useState } from 'react';
import { Search, Eye, Edit3, Calendar, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, useAppointments } from '../../hooks/useAppointments';
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
    onView: (apt: Appointment) => void;
    onEdit: (apt: Appointment) => void;
    onReschedule: (apt: Appointment) => void;
    onCancel: (apt: Appointment) => void;
    onDelete: (apt: Appointment) => void;
}

export function AppointmentTable({ onView, onEdit, onReschedule, onCancel, onDelete }: AppointmentTableProps) {

    const { appointments, loading, error } = useAppointments();
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
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading appointments...</div>;
    if (error) return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div className="table-container">

            <div className="table-header-row">

                <div className="search-input-wrapper" style={{ maxWidth: '360px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                    <input
                        type="text"
                        placeholder="Search patient, email, phone..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--input)',
                        fontSize: '14px'
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                </select>

            </div>

            <div style={{ overflowX: 'auto' }}>

                <table className="data-table">

                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Reason</th>
                            <th>Appointment Time</th>
                            <th>Status</th>
                            <th>Reminder</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {paginatedAppointments.map((apt) => (

                            <tr key={apt.id}>

                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '700' }}>{apt.patient_name || "N/A"}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{apt.email || "N/A"}</span>
                                    </div>
                                </td>

                                <td>
                                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
                                        {apt.reason_for_visit || "N/A"}
                                    </span>
                                </td>

                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600' }}>
                                            {safeFormat(apt.appointment_time, 'MMM dd, yyyy')}
                                        </span>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                            {safeFormat(apt.appointment_time, 'hh:mm a')}
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    <Badge status={apt.status} />
                                </td>

                                <td>
                                    {apt.reminder_status
                                        ? apt.reminder_status.charAt(0).toUpperCase() + apt.reminder_status.slice(1)
                                        : "Pending"}
                                </td>

                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>

                                        <ActionButton icon={<Eye size={16} />} onClick={() => onView(apt)} tooltip="View" />

                                        {role === 'Admin' && (
                                            <>
                                                <ActionButton icon={<Edit3 size={16} />} onClick={() => onEdit(apt)} tooltip="Edit" />
                                                <ActionButton icon={<Calendar size={16} />} onClick={() => onReschedule(apt)} tooltip="Reschedule" />
                                                <ActionButton icon={<XCircle size={16} />} onClick={() => onCancel(apt)} tooltip="Cancel" />
                                                <ActionButton icon={<Trash2 size={16} />} onClick={() => onDelete(apt)} tooltip="Delete" />
                                            </>
                                        )}

                                    </div>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

function ActionButton({ icon, onClick, tooltip }: any) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className="btn"
            style={{ padding: '8px', backgroundColor: 'transparent' }}
        >
            {icon}
        </button>
    );
}
