import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, QrCode, UserPlus, Droplets, CheckCircle2, AlertCircle } from 'lucide-react';

interface DonorQRModalProps {
  onClose: () => void;
  onSave: (donor: any) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorQRModal: React.FC<DonorQRModalProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState<'form' | 'qr'>('form');
  const [savedDonor, setSavedDonor] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('None');

  const handleSave = () => {
    setError('');
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!age || +age < 18 || +age > 65) { setError('Age must be between 18 and 65.'); return; }
    if (!weight || +weight < 45) { setError('Weight must be at least 45 kg.'); return; }
    if (!contact.trim()) { setError('Contact number is required.'); return; }
    if (!address.trim()) { setError('Residential address is required.'); return; }

    const donor = {
      id: generateId(),
      name, bloodGroup, gender, age, weight,
      contact, email, address, lastDonation, medicalConditions,
      donationDate: new Date().toISOString().split('T')[0],
    };

    const existing = JSON.parse(localStorage.getItem('hemotwin_donors') || '[]');
    localStorage.setItem('hemotwin_donors', JSON.stringify([...existing, donor]));
    onSave(donor);

    // Encode donor details DIRECTLY in the QR — no URL needed.
    // Phone camera will display this text instantly, works offline & on any network.
    const qrText = [
      '🩸 HEMOTWIN — BLOOD DONOR PROFILE',
      '─────────────────────────────',
      `👤 Name        : ${donor.name}`,
      `🩸 Blood Group  : ${donor.bloodGroup}`,
      `⚧  Gender       : ${donor.gender}`,
      `🎂 Age          : ${donor.age} years`,
      `⚖️  Weight       : ${donor.weight} kg`,
      `📞 Contact      : ${donor.contact}`,
      donor.email ? `📧 Email        : ${donor.email}` : '',
      `🏠 Address      : ${donor.address}`,
      donor.lastDonation ? `📅 Last Donated : ${donor.lastDonation}` : '📅 Last Donated : First Time Donor',
      `🏥 Medical      : ${donor.medicalConditions || 'None'}`,
      `📆 Registered   : ${donor.donationDate}`,
      '─────────────────────────────',
      `🔖 Donor ID: ${donor.id}`,
    ].filter(Boolean).join('\n');

    setQrUrl(qrText);
    setSavedDonor(donor);
    setStep('qr');
  };

  const handleReset = () => {
    setStep('form');
    setSavedDonor(null);
    setQrUrl('');
    setError('');
    setName(''); setAge(''); setWeight(''); setContact('');
    setEmail(''); setAddress(''); setLastDonation(''); setMedicalConditions('None');
  };

  const inputClass = "w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all text-slate-900 bg-white placeholder-slate-400 text-base font-medium";
  const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.75rem' }}>
              <Droplets style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: "'Poppins', 'Inter', sans-serif" }}>
              Donor Registration
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.75rem', padding: '0.5rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '2rem' }}>
          {step === 'form' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Full Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="e.g. Ramkumar S"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#0891b2', background: '#ffffff', outline: 'none', fontFamily: 'inherit', fontWeight: 700, boxSizing: 'border-box' }}
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  >
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Age * (18–65)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => { setAge(e.target.value); setError(''); }}
                    placeholder="25"
                    min="18" max="65"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {/* Weight */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Weight (kg) *</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={e => { setWeight(e.target.value); setError(''); }}
                    placeholder="65"
                    min="45"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {/* Contact */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Contact Number *</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={e => { setContact(e.target.value); setError(''); }}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="donor@example.com"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {/* Last Donation */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Last Donation Date</label>
                  <input
                    type="date"
                    value={lastDonation}
                    onChange={e => setLastDonation(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Address */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Residential Address *</label>
                  <textarea
                    value={address}
                    onChange={e => { setAddress(e.target.value); setError(''); }}
                    placeholder="Full address..."
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {/* Medical Conditions */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.375rem' }}>Medical Conditions / Allergies</label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={e => setMedicalConditions(e.target.value)}
                    placeholder="None"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '1rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0891b2'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.75rem', color: '#b91c1c', fontSize: '0.875rem', fontWeight: 600 }}>
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSave}
                style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #0891b2, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(8,145,178,0.35)', transition: 'transform 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <QrCode style={{ width: 22, height: 22 }} />
                Save & Generate QR Code
              </button>
            </div>
          ) : (
            /* QR Code Display */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '999px', padding: '0.5rem 1.25rem', color: '#16a34a', fontWeight: 700, fontSize: '0.95rem' }}>
                <CheckCircle2 style={{ width: 20, height: 20 }} />
                Donor Profile Saved!
              </div>

              <div style={{ padding: '1.5rem', background: '#ffffff', border: '4px solid #cffafe', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(8,145,178,0.15)' }}>
                <QRCode value={qrUrl} size={220} />
              </div>

              <div style={{ textAlign: 'center', background: '#ffffff', padding: '1.5rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0', width: '100%', maxWidth: '360px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{savedDonor?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ background: '#cffafe', color: '#0e7490', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '1rem' }}>{savedDonor?.bloodGroup}</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#475569', fontWeight: 600 }}>{savedDonor?.age} yrs</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#475569', fontWeight: 600 }}>{savedDonor?.gender}</span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  📱 Scan with any smartphone camera to view the full donor profile
                </div>
              </div>

              <button
                onClick={handleReset}
                style={{ width: '100%', maxWidth: '360px', padding: '0.875rem', background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '0.75rem', color: '#334155', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', fontSize: '1rem' }}
              >
                <UserPlus style={{ width: 20, height: 20 }} />
                Register Another Donor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
