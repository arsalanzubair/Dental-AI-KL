import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../hooks/useAppointments';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { User, Phone, Mail, FileText, Clock, AlertTriangle, Bell } from 'lucide-react';

/* ---------- SAFE DATE FORMATTER ---------- */

function safeFormat(dateValue: any, formatStr: string) {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "N/A";

    return format(date, formatStr);
}

/* ---------- DETAIL ITEM ---------- */

function DetailItem({
    icon,
    label,
    value
}: {
    icon: React.ReactNode,
    label: string,
    value: string
}) {
    return (
        <div className="detail-item">
            <div className="detail-icon">{icon}</div>
            <div className="detail-content">
                <p className="detail-label">{label}</p>
                <p className="detail-value">{value}</p>
            </div>
        </div>
    );
}

/* ---------- VIEW MODAL ---------- */

interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
}

export function ViewAppointmentModal({
    isOpen,
    onClose,
    appointment
}: ViewModalProps) {

    if (!appointment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '24px',
                    borderBottom: '1px solid var(--border)'
                }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                        <div
                            className="sidebar-logo"
                            style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'var(--primary-light)',
                                color: 'var(--primary)'
                            }}
                        >
                            <User size={24} />
                        </div>

                        <div>
                            <h4 style={{ fontSize: '20px', fontWeight: '800' }}>
                                {appointment.patient_name || "N/A"}
                            </h4>

                            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                ID: {appointment.id?.slice(0, 8) || "N/A"}
                            </p>
                        </div>

                    </div>

                    <Badge status={appointment.status} />

                </div>

                <div className="detail-grid">

                    <DetailItem
                        icon={<Phone size={18} />}
                        label="Phone"
                        value={appointment.phone || "N/A"}
                    />

                    <DetailItem
                        icon={<Mail size={18} />}
                        label="Email"
                        value={appointment.email || "N/A"}
                    />

                    <DetailItem
                        icon={<Clock size={18} />}
                        label="Appointment Time"
                        value={safeFormat(
                            appointment.appointment_time,
                            'EEEE, MMMM dd, yyyy @ hh:mm a'
                        )}
                    />

                    <DetailItem
                        icon={<FileText size={18} />}
                        label="Reason for Visit"
                        value={appointment.reason_for_visit || "N/A"}
                    />

                    <DetailItem
                        icon={<Bell size={18} />}
                        label="Reminder Status"
                        value={
                            appointment.reminder_status
                                ? appointment.reminder_status.charAt(0).toUpperCase() +
                                appointment.reminder_status.slice(1)
                                : "Pending"
                        }
                    />

                </div>

                <div
                    style={{
                        paddingTop: '24px',
                        borderTop: '1px solid var(--border)',
                        fontSize: '11px',
                        color: 'var(--muted)',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>
                        Created: {safeFormat(
                            appointment.created_at,
                            'MMM dd, yyyy HH:mm'
                        )}
                    </span>

                    <span>
                        Last Updated: {safeFormat(
                            appointment.updated_at,
                            'MMM dd, yyyy HH:mm'
                        )}
                    </span>
                </div>

            </div>

        </Modal>
    );
}

/* ---------- EDIT MODAL ---------- */

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onSave: (updates: Partial<Appointment>) => Promise<void>;
}

export function EditAppointmentModal({
    isOpen,
    onClose,
    appointment,
    onSave
}: EditModalProps) {

    const [formData, setFormData] = useState<Partial<Appointment>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {

        if (appointment) {

            setFormData({
                patient_name: appointment.patient_name,
                phone: appointment.phone,
                email: appointment.email,
                reason_for_visit: appointment.reason_for_visit,
                status: appointment.status
            });

        }

    }, [appointment]);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setIsSubmitting(true);

        try {

            await onSave(formData);

            onClose();

        } catch {

            alert('Failed to update appointment');

        } finally {

            setIsSubmitting(false);

        }

    };

    return (

        <Modal isOpen={isOpen} onClose={onClose} title="Edit Appointment">

            <form onSubmit={handleSubmit}>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px'
                    }}
                >

                    <InputGroup
                        label="Patient Name"
                        value={formData.patient_name || ''}
                        onChange={(val) =>
                            setFormData({ ...formData, patient_name: val })
                        }
                    />

                    <InputGroup
                        label="Status"
                        value={formData.status || ''}
                        type="select"
                        options={[
                            'booked',
                            'cancelled',
                            'rescheduled',
                            'completed'
                        ]}
                        onChange={(val) =>
                            setFormData({
                                ...formData,
                                status: val as AppointmentStatus
                            })
                        }
                    />

                    <InputGroup
                        label="Phone"
                        value={formData.phone || ''}
                        onChange={(val) =>
                            setFormData({ ...formData, phone: val })
                        }
                    />

                    <InputGroup
                        label="Email"
                        value={formData.email || ''}
                        type="email"
                        onChange={(val) =>
                            setFormData({ ...formData, email: val })
                        }
                    />

                </div>

                <InputGroup
                    label="Reason for Visit"
                    value={formData.reason_for_visit || ''}
                    type="textarea"
                    onChange={(val) =>
                        setFormData({
                            ...formData,
                            reason_for_visit: val
                        })
                    }
                />

                <div className="modal-footer">

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn"
                        style={{
                            padding: '10px 24px',
                            border: '1px solid var(--border)'
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px' }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>

                </div>

            </form>

        </Modal>

    );
}
