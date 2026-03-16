import { useState } from 'react';
import { useAppointments, Appointment } from '../hooks/useAppointments';
import { AppointmentTable } from '../components/Dashboard/AppointmentTable';
import { ViewAppointmentModal, EditAppointmentModal, DeleteConfirmationModal, RescheduleModal } from '../components/Dashboard/AppointmentModals';
import { Users, CalendarCheck, CalendarX, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
    const { appointments, updateAppointment, deleteAppointment } = useAppointments();
    const { role } = useAuth();

    // Modal States
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | 'reschedule' | null>(null);

    const stats = {
        total: appointments.length,
        booked: appointments.filter(a => a.status === 'booked').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        completed: appointments.filter(a => a.status === 'completed').length,
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedAppointment(null);
    };

    return (
        <div className="animate-up">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Appointment Dashboard</h1>
                    <p className="page-subtitle">
                        Real-time monitoring and management of dental appointments.
                    </p>
                </div>
            </header>

            <div className="stat-grid">
                <StatCard
                    label="Total Appointments"
                    value={stats.total.toString()}
                    icon={<Users size={20} />}
                    trend="+4%"
                    type="total"
                />

                <StatCard
                    label="Booked"
                    value={stats.booked.toString()}
                    icon={<CalendarCheck size={20} />}
                    trend="+2%"
                    type="booked"
                />

                <StatCard
                    label="Cancelled"
                    value={stats.cancelled.toString()}
                    icon={<CalendarX size={20} />}
                    trend="-1%"
                    type="cancelled"
                />

                <StatCard
                    label="Completed"
                    value={stats.completed.toString()}
                    icon={<CheckCircle2 size={20} />}
                    trend="+8%"
                    type="completed"
                />
            </div>

            <div style={{ marginTop: '32px' }}>
                <AppointmentTable
                    onView={(apt) => {
                        setSelectedAppointment(apt);
                        setModalType('view');
                    }}

                    onEdit={(apt) => {
                        setSelectedAppointment(apt);
                        setModalType('edit');
                    }}

                    onReschedule={(apt) => {
                        setSelectedAppointment(apt);
                        setModalType('reschedule');
                    }}

                    onCancel={async (apt) => {
                        if (confirm(`Cancel appointment for ${apt.patient_name}?`)) {
                            await updateAppointment(apt.id, { status: 'cancelled' });
                        }
                    }}

                    onDelete={(apt) => {
                        setSelectedAppointment(apt);
                        setModalType('delete');
                    }}
                />
            </div>

            <ViewAppointmentModal
                isOpen={modalType === 'view'}
                onClose={closeModal}
                appointment={selectedAppointment}
            />

            <EditAppointmentModal
                isOpen={modalType === 'edit'}
                onClose={closeModal}
                appointment={selectedAppointment}
                onSave={async (updates) => {
                    if (selectedAppointment) {
                        await updateAppointment(selectedAppointment.id, updates);
                    }
                }}
            />

            <RescheduleModal
                isOpen={modalType === 'reschedule'}
                onClose={closeModal}
                appointment={selectedAppointment}
                onSave={async (newTime) => {
                    if (selectedAppointment) {
                        await updateAppointment(selectedAppointment.id, {
                            appointment_time: newTime,
                            status: 'rescheduled'
                        });
                    }
                }}
            />

            <DeleteConfirmationModal
                isOpen={modalType === 'delete'}
                onClose={closeModal}
                patientName={selectedAppointment?.patient_name || ''}
                onConfirm={async () => {
                    if (selectedAppointment) {
                        await deleteAppointment(selectedAppointment.id);
                    }
                }}
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    trend,
    type
}: {
    label: string,
    value: string,
    icon: React.ReactNode,
    trend: string,
    type: 'total' | 'booked' | 'cancelled' | 'completed'
}) {

    const config = {
        total: { color: 'var(--primary)', bg: 'var(--primary-light)' },
        booked: { color: 'var(--status-booked)', bg: 'var(--status-booked-bg)' },
        cancelled: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
        completed: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' }
    };

    const { color, bg } = config[type];
    const isPositive = trend.startsWith('+');

    return (
        <div className="card stat-card">
            <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: bg, color: color }}>
                    {icon}
                </div>

                <div className={`stat-trend ${isPositive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                    {trend}
                </div>
            </div>

            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
}
