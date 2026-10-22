import React, { useEffect, useState } from 'react';
import { Heart, Activity, MapPin, Phone, Mail, Calendar, Droplet, CheckCircle2 } from 'lucide-react';

export const PublicDonorProfile: React.FC = () => {
  const [donor, setDonor] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract ID from URL path (e.g. /donor/1234)
    const path = window.location.pathname;
    const match = path.match(/\/donor\/([a-zA-Z0-9_-]+)/);
    
    if (match && match[1]) {
      const id = match[1];
      const donors = JSON.parse(localStorage.getItem('hemotwin_donors') || '[]');
      const found = donors.find((d: any) => d.id === id);
      if (found) {
        setDonor(found);
      } else {
        setError('Donor profile not found. It may have been removed or the link is invalid.');
      }
    } else {
      setError('Invalid link format.');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!donor) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 md:p-6 flex justify-center">
      <div className="w-full max-w-md bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header Cover */}
        <div className="h-40 bg-gradient-to-br from-cyan-600 to-blue-700 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Decorative circles */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-cyan-400/30 rounded-full blur-xl"></div>
        </div>

        {/* Profile Avatar & Title */}
        <div className="relative px-6 pb-6 text-center -mt-16 z-10">
          <div className="w-32 h-32 mx-auto bg-white rounded-full p-2 shadow-xl mb-4">
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-full border border-slate-100 flex items-center justify-center shadow-inner">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-600">
                {donor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{donor.name}</h1>
          <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-sm mt-1 mb-4 bg-emerald-50 w-max mx-auto px-3 py-1 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> Verified Donor
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood</div>
              <div className="text-xl font-black text-rose-600">{donor.bloodGroup}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Age</div>
              <div className="text-xl font-black text-slate-700">{donor.age}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Weight</div>
              <div className="text-xl font-black text-slate-700">{donor.weight}<span className="text-xs text-slate-500 ml-0.5">kg</span></div>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="px-6 pb-8 space-y-4 flex-1">
          <h3 className="font-bold text-slate-800 text-lg mb-3">Contact Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</div>
                <div className="font-semibold text-slate-700 truncate">{donor.contact}</div>
              </div>
            </div>

            {donor.email && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</div>
                  <div className="font-semibold text-slate-700 truncate">{donor.email}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</div>
                <div className="font-semibold text-slate-700 leading-snug">{donor.address}</div>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-slate-800 text-lg mb-3 mt-6">Medical Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Donation</div>
                <div className="font-semibold text-slate-700">{donor.lastDonation || 'First time donor'}</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conditions / Allergies</div>
                <div className="font-semibold text-slate-700 leading-snug">{donor.medicalConditions || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white text-center">
          <div className="flex items-center justify-center gap-2 text-slate-900/50 text-xs font-mono">
            <Droplet className="w-3 h-3 text-rose-500" /> Powered by HemoTwin Digital Surrogate
          </div>
        </div>
      </div>
    </div>
  );
};
