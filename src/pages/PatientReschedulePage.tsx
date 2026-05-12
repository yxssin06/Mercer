import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import type { AppointmentType } from '../types';
import { Masthead } from '../components/shared/Masthead';
import { StepView } from '../components/shared/StepView';
import { PhysicianStep } from '../components/patient/PhysicianStep';
import { TimeStep } from '../components/patient/TimeStep';
import { useBookings } from '../context/BookingContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useToast } from '../context/ToastContext';

export function PatientReschedulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPatient } = usePatientAuth();
  const { bookings, updateBooking } = useBookings();
  const { addToast } = useToast();

  if (!currentPatient) return <Navigate to="/patient" replace />;

  const booking = bookings.find(b => b.id === id);
  if (!booking || booking.status === 'cancelled') return <Navigate to="/patient/dashboard" replace />;

  const bookingId = booking.id;

  const [step, setStep] = useState(0);
  const [physicianId, setPhysicianId] = useState(booking.physicianId);
  const [dateIso, setDateIso] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>(booking.type);

  const nextVersion = (booking?.calendarVersion ?? 0) + 1;

  function handleConfirm() {
    updateBooking(bookingId, {
      physicianId, date: dateIso, time, type, status: 'pending',
      calendarVersion: nextVersion,
    });
    addToast('Appointment rescheduled — awaiting confirmation.');
    navigate('/patient/dashboard');
  }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          <button className="text-btn" onClick={() => navigate('/patient/dashboard')}>
            ← Back to dashboard
          </button>
        }
      />

      <div className="stage">
        <div className="reschedule-banner">
          <span className="reschedule-label">Rescheduling</span>
          <span className="pbc-id">{bookingId}</span>
        </div>

        <StepView step={step}>
          {(s) => (
            <>
              {s === 0 && (
                <PhysicianStep
                  selectedId={physicianId}
                  onSelect={setPhysicianId}
                  onNext={() => setStep(1)}
                />
              )}
              {s === 1 && (
                <TimeStep
                  physicianId={physicianId}
                  dateIso={dateIso}
                  time={time}
                  type={type}
                  onSetType={setType}
                  onPick={(d, t) => { setDateIso(d); setTime(t); }}
                  onBack={() => setStep(0)}
                  onNext={handleConfirm}
                  nextLabel="Confirm changes"
                />
              )}
            </>
          )}
        </StepView>
      </div>
    </div>
  );
}
