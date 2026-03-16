import { useState } from 'react';
import { useAppointments, Appointment } from '../hooks/useAppointments';
import { AppointmentTable } from '../components/Dashboard/AppointmentTable';

import {
    ViewAppointmentModal,
    EditAppointmentModal,
    DeleteConfirmationModal,
    RescheduleModal
} from '../components/Dashboard/AppointmentModals';

import { Users, CalendarCheck, CalendarX, CheckCircle2 } from 'lucide-react';

export function Dashboard() {

    const {
        appointments,
        loading,
        error,
        updateAppointment,
        deleteAppointment
    } = useAppointments();

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const [modalType, setModalType] = useState<
        'view' | 'edit' | 'delete' | 'reschedule' | null
    >(null);

    const closeModal = () => {
        setModalType(null);
        setSelectedAppointment(null);
    };

    return (

        <div>

            <AppointmentTable

                appointments={appointments}
                loading={loading}
                error={error}

                onView={(apt) => {
                    setSelectedAppointment(apt);
                    setModalType("view");
                }}

                onEdit={(apt) => {
                    setSelectedAppointment(apt);
                    setModalType("edit");
                }}

                onReschedule={(apt) => {
                    setSelectedAppointment(apt);
                    setModalType("reschedule");
                }}

                onCancel={async (apt) => {

                    await updateAppointment(
                        apt.id,
                        { status: "cancelled" }
                    );

                }}

                onDelete={(apt) => {
                    setSelectedAppointment(apt);
                    setModalType("delete");
                }}

            />

            {selectedAppointment && (

                <>

                    <ViewAppointmentModal
                        isOpen={modalType === "view"}
                        appointment={selectedAppointment}
                        onClose={closeModal}
                    />

                    <EditAppointmentModal
                        isOpen={modalType === "edit"}
                        appointment={selectedAppointment}
                        onClose={closeModal}
                        onSave={(updates) =>
                            updateAppointment(selectedAppointment.id, updates)
                        }
                    />

                    <RescheduleModal
                        isOpen={modalType === "reschedule"}
                        appointment={selectedAppointment}
                        onClose={closeModal}
                        onSave={(time) =>
                            updateAppointment(selectedAppointment.id, {
                                appointment_time: time
                            })
                        }
                    />

                    <DeleteConfirmationModal
                        isOpen={modalType === "delete"}
                        patientName={selectedAppointment.patient_name}
                        onClose={closeModal}
                        onConfirm={() =>
                            deleteAppointment(selectedAppointment.id)
                        }
                    />

                </>

            )}

        </div>
    );
}
