import React, { useState, useEffect } from 'react';
import { Users, Search, Download, ExternalLink, Droplet } from 'lucide-react';
import { DonorQRModal } from '../components/DonorQRModal';

export const Donors: React.FC = () => {
  const [donors, setDonors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDonors = () => {
    const data = JSON.parse(localStorage.getItem('hemotwin_donors') || '[]');
    setDonors(data);
  };

  useEffect(() => {
    loadDonors();
  }, []);

  const filteredDonors = donors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contact.includes(searchTerm)
  );

  const handleExportCSV = () => {
    if (donors.length === 0) {
      alert('No donors to export.');
      return;
    }
    const headers = ['ID', 'Name', 'Blood Group', 'Gender', 'Age', 'Weight (kg)', 'Contact', 'Email', 'Address', 'Last Donation', 'Medical Conditions', 'Donation Date'];
    const rows = donors.map(d => [
      d.id, d.name, d.bloodGroup, d.gender, d.age, d.weight,
      d.contact, d.email, `"${(d.address || '').replace(/"/g, '""')}"`,
      d.lastDonation, d.medicalConditions, d.donationDate
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hemotwin_donors_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Inline styles for clean, non-grey look
  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 24px rgba(8,145,178,0.08)',
    border: '1.5px solid #e0f2fe',
    overflow: 'hidden',
  };

  return (
    <div style={{ padding: '0.5rem', fontFamily: "'Poppins', 'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#cffafe', color: '#0891b2', borderRadius: '0.75rem', padding: '0.5rem', display: 'inline-flex' }}>
              <Users style={{ width: 24, height: 24 }} />
            </span>
            Registered Donors
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>Manage and view all registered blood donors</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #0891b2, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.875rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(8,145,178,0.3)', fontFamily: 'inherit' }}
        >
          <Droplet style={{ width: 20, height: 20 }} />
          Register New Donor
        </button>
      </div>

      {/* Table Card */}
      <div style={cardStyle}>
        {/* Search & Export */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e0f2fe', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '420px' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, blood group or contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', border: '2px solid #bae6fd', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#1e293b', background: '#ffffff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#ffffff', border: '2px solid #0891b2', color: '#0891b2', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0891b2'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0891b2'; }}
          >
            <Download style={{ width: 16, height: 16 }} />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f0f9ff', borderBottom: '2px solid #e0f2fe' }}>
                {['Donor Name', 'Blood Group', 'Age / Gender', 'Contact', 'Last Donation', 'Profile'].map((h, i) => (
                  <th key={h} style={{ padding: '0.875rem 1rem', paddingLeft: i === 0 ? '1.5rem' : '1rem', paddingRight: i === 5 ? '1.5rem' : '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 5 ? 'right' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>
                    No donors found. Register a new donor to get started.
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor, idx) => (
                  <tr key={donor.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafcff', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ecfeff')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafcff')}
                  >
                    <td style={{ padding: '1rem 1rem 1rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{donor.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '0.15rem' }}>{donor.id}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#fef2f2', color: '#b91c1c', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1.5px solid #fecaca' }}>
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{donor.age} yrs</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{donor.gender}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{donor.contact}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{donor.email || '-'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {donor.lastDonation
                        ? <span style={{ color: '#1e293b', fontWeight: 600 }}>{donor.lastDonation}</span>
                        : <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.78rem' }}>First Time</span>
                      }
                    </td>
                    <td style={{ padding: '1rem 1.5rem 1rem 1rem', textAlign: 'right' }}>
                      <a
                        href={`/donor/${donor.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.375rem 0.875rem', background: '#e0f2fe', color: '#0891b2', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', transition: 'all 0.15s', border: '1.5px solid #bae6fd' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0891b2'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#e0f2fe'; (e.currentTarget as HTMLElement).style.color = '#0891b2'; }}
                      >
                        View <ExternalLink style={{ width: 12, height: 12 }} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filteredDonors.length > 0 && (
          <div style={{ padding: '0.875rem 1.5rem', background: '#f0f9ff', borderTop: '1.5px solid #e0f2fe', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredDonors.length} of {donors.length} donor{donors.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {isModalOpen && (
        <DonorQRModal
          onClose={() => setIsModalOpen(false)}
          onSave={() => loadDonors()}
        />
      )}
    </div>
  );
};
