import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PatientInfo, AppointmentType, Booking } from '../types';
import { Masthead } from '../components/shared/Masthead';
import { PhysicianStep } from '../components/patient/PhysicianStep';
import { TimeStep } from '../components/patient/TimeStep';
import { DetailsStep } from '../components/patient/DetailsStep';
import { ConfirmStep } from '../components/patient/ConfirmStep';
import { useBookings } from '../context/BookingContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { PHYSICIANS } from '../data/physicians';
import { sendBookingConfirmation } from '../services/email';

const BLANK_PATIENT: PatientInfo = { name: '', email: '', phone: '', dob: '', insurance: '' };

export function PatientBookingPage() {
  const { addBooking } = useBookings();
  const { currentPatient } = usePatientAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [physicianId, setPhysicianId] = useState<string | null>(null);
  const [dateIso, setDateIso] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('In-person');
  const [patient, setPatient] = useState<PatientInfo>(
    currentPatient
      ? {
          name: currentPatient.name,
          email: currentPatient.email,
          phone: currentPatient.phone ?? '',
          dob: currentPatient.dob ?? '',
          insurance: currentPatient.insurance ?? '',
        }
      : BLANK_PATIENT
  );
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState<Booking | null>(null);

  function handleSubmit() {
    if (!physicianId || !dateIso || !time) return;
    const booking: Booking = {
      id: 'BK-' + Math.floor(1100 + Math.random() * 800),
      physicianId,
      patient: { ...patient },
      reason,
      notes,
      date: dateIso,
      time,
      type,
      status: 'pending',
      createdAt: Date.now(),
    };
    addBooking(booking);
    setSubmitted(booking);
    setStep(3);
    const physician = PHYSICIANS.find(p => p.id === physicianId);
    if (physician) sendBookingConfirmation(booking, physician).catch(() => {});
  }

  function handleReset() {
    setStep(0);
    setPhysicianId(null);
    setDateIso('');
    setTime('');
    setType('In-person');
    setPatient(BLANK_PATIENT);
    setReason('');
    setNotes('');
    setSubmitted(null);
  }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          step < 3
            ? <button className="text-btn" onClick={() => navigate('/')}>← Leave booking</button>
            : null
        }
      />

      <div className="stage">
        {step === 0 && (
          <PhysicianStep
            selectedId={physicianId}
            onSelect={setPhysicianId}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && physicianId && (
          <TimeStep
            physicianId={physicianId}
            dateIso={dateIso}
            time={time}
            type={type}
            onSetType={setType}
            onPick={(d, t) => { setDateIso(d); setTime(t); }}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && physicianId && (
          <DetailsStep
            physicianId={physicianId}
            date={dateIso}
            time={time}
            type={type}
            patient={patient}
            reason={reason}
            notes={notes}
            onSetPatient={setPatient}
            onSetReason={setReason}
            onSetNotes={setNotes}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}
        {step === 3 && submitted && (
          <ConfirmStep
            booking={submitted}
            patient={patient}
            reason={reason}
            onAnother={handleReset}
            onHome={() => navigate('/')}
            onDashboard={currentPatient ? () => navigate('/patient/dashboard') : undefined}
          />
        )}
      </div>
    </div>
  );
}
