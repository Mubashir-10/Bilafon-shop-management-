// frontend/src/pages/Settings.jsx

import React, { useState } from 'react';
import { authService, tokenStore, getErrorMessage } from '../services/api';

const MIN_PASSWORD_LENGTH = 4;

export default function Settings() {
  const user = tokenStore.getUser();
  const [form, setForm] = useState({
    newEmail: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (notice) setNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.currentPassword) {
      setNotice({ type: 'error', text: 'Tabadili ke liye maujooda (Current) password likhna zaroori hai.' });
      return;
    }

    if (form.newPassword) {
      if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
        setNotice({ type: 'error', text: `Naya password kam az kam ${MIN_PASSWORD_LENGTH} characters ka hona chahiye.` });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setNotice({ type: 'error', text: 'Naya password aur Confirm password aapas me match nahi kar rahe.' });
        return;
      }
    }

    setSaving(true);
    setNotice(null);
    try {
      const res = await authService.changePassword({
        currentPassword: form.currentPassword,
        newEmail: form.newEmail !== user?.email ? form.newEmail : undefined,
        newPassword: form.newPassword || undefined
      });

      if (res.data?.user) {
        tokenStore.setUser(res.data.user);
      }

      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setNotice({ type: 'success', text: 'Account details kamyabi se update ho gayi hain!' });
    } catch (err) {
      const msg = getErrorMessage(err, 'Update nahi ho saka. Dobara koshish karein.');
      setNotice({
        type: 'error',
        text: /current password is incorrect/i.test(msg) ? 'Maujooda (Current) password galat hai.' : msg
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500';

  return (
    <div className="space-y-6">
      {/* Shop Configuration */}
      <div className="max-w-2xl bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3">Bilafon Shop Configuration</h3>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Shop Name</label>
            <input type="text" defaultValue="Bilafon Mobile Shop" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Currency Symbol</label>
            <input type="text" defaultValue="PKR / Rs." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Receipt Footer Note</label>
            <input type="text" defaultValue="Shukriya! Exchange option valid for 3 days with bill." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
          </div>
          <button className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold">Save Settings</button>
        </div>
      </div>

      {/* Account Security: Change Email & Password */}
      <div className="max-w-2xl bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-white text-lg">Account Security & Credentials</h3>
            <p className="text-xs text-slate-400 mt-1">Apna Email aur Password yahan se change karein.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            {showPasswords ? 'Hide' : 'Show'} passwords
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Admin Email Address</label>
            <input
              type="email"
              value={form.newEmail}
              onChange={handleChange('newEmail')}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Maujooda (Current) Password *</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={handleChange('currentPassword')}
              placeholder="Confirm karne ke liye purana password dalein"
              autoComplete="current-password"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Naya Password (Optional)</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="Khali chhod dein agar password change nahi karna"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Confirm Naya Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Naya password dobara likhein"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {notice && (
            <div
              role="alert"
              className={`rounded-xl px-4 py-3 border ${
                notice.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {notice.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving Changes...' : 'Update Account Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}