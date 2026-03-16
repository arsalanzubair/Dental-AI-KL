import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../hooks/useAppointments';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { User, Phone, Mail, FileText, Clock, AlertTriangle, Bell } from 'lucide-react';

function safeFormat(dateValue: any, formatStr: string) {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatStr);
}

interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
}

export function ViewAppointmentModal({ isOpen, onClose, appointment }: ViewModalProps) {

    if (!appointment) return null;

    return (

        <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                        <div className="sidebar-logo" style={{ width: '48px', height: '48px' }}>
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

                    <DetailItem icon={<Phone size={18} />} label="Phone" value={appointment.phone || "N/A"} />

                    <DetailItem icon={<Mail size={18} />} label="Email" value={appointment.email || "N/A"} />

                    <DetailItem
                        icon={<Clock size={18} />}
                        label="Appointment Time"
                        value={safeFormat(appointment.appointment_time, 'EEEE, MMMM dd, yyyy @ hh:mm a')}
                    />

                    <DetailItem icon={<FileText size={18} />} label="Reason for Visit" value={appointment.reason_for_visit || "N/A"} />

                    <DetailItem
                        icon={<Bell size={18} />}
                        label="Reminder Status"
                        value={
                            appointment.reminder_status
                                ? appointment.reminder_status.charAt(0).toUpperCase() + appointment.reminder_status.slice(1)
                                : "Pending"
                        }
                    />

                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>

                    <span>
                        Created: {safeFormat(appointment.created_at, 'MMM dd, yyyy HH:mm')}
                    </span>

                    <span>
                        Updated: {safeFormat(appointment.updated_at, 'MMM dd, yyyy HH:mm')}
                    </span>

                </div>

            </div>

        </Modal>

    );
}
