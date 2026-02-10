'use client';

import { useState } from 'react';
import { Heart, CheckCircle, CreditCard, Shield, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Donation } from '@/types';

const presetAmounts = [50, 100, 180, 360, 500, 1000];

export default function DonatePage() {
  const settings = useStore((s) => s.settings);
  const addDonation = useStore((s) => s.addDonation);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    amount: 0,
    customAmount: '',
    currency: 'ILS' as 'ILS' | 'USD' | 'EUR',
    dedication: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'monthly' | 'yearly',
  });

  const actualAmount =
    formData.amount > 0
      ? formData.amount
      : parseInt(formData.customAmount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualAmount <= 0) return;

    const donation: Donation = {
      id: Date.now().toString(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      amount: actualAmount,
      currency: formData.currency,
      dedication: formData.dedication,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.isRecurring
        ? formData.recurringFrequency
        : undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    addDonation(donation);
    setSubmitted(true);
  };

  const currencySymbol = {
    ILS: '\u20AA',
    USD: '$',
    EUR: '\u20AC',
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <section className="hero-gradient text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">תודה רבה!</h1>
          </div>
        </section>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              התרומה התקבלה בהצלחה!
            </h2>
            <p className="text-gray-500 mb-2">
              תודה לך, {formData.fullName}, על תרומתך הנדיבה של{' '}
              {currencySymbol[formData.currency]}
              {actualAmount} ל{settings.chabadNameHe}.
            </p>
            {formData.dedication && (
              <p className="text-gray-500 mb-4">
                הקדשה: &quot;{formData.dedication}&quot;
              </p>
            )}
            <p className="text-sm text-gray-400 mb-6">
              אישור נשלח לכתובת {formData.email}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  amount: 0,
                  customAmount: '',
                  currency: 'ILS',
                  dedication: '',
                  isRecurring: false,
                  recurringFrequency: 'monthly',
                });
              }}
              className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-bold"
            >
              תרומה נוספת
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">תרומה</h1>
          <p className="text-gray-300 text-lg">
            תרומתכם מאפשרת לנו להמשיך בפעילות הקהילתית
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-bold">פרטי התרומה</h2>

              {/* Currency Selection */}
              <div>
                <label className="form-label">מטבע</label>
                <div className="flex gap-2">
                  {(['ILS', 'USD', 'EUR'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, currency: cur }))
                      }
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        formData.currency === cur
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {currencySymbol[cur]} {cur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="form-label">סכום</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          amount,
                          customAmount: '',
                        }))
                      }
                      className={`py-3 rounded-xl font-bold text-lg transition-colors ${
                        formData.amount === amount
                          ? 'bg-accent text-primary-dark shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {currencySymbol[formData.currency]}
                      {amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="סכום אחר"
                    value={formData.customAmount}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        customAmount: e.target.value,
                        amount: 0,
                      }))
                    }
                    className="form-input"
                  />
                </div>
              </div>

              {/* Recurring */}
              <div className="bg-warm-bg rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        isRecurring: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-accent"
                  />
                  <div className="flex items-center gap-2">
                    <RefreshCw size={18} className="text-accent-dark" />
                    <span className="font-medium">תרומה חוזרת</span>
                  </div>
                </label>
                {formData.isRecurring && (
                  <div className="mt-3 flex gap-3 mr-8">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          recurringFrequency: 'monthly',
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        formData.recurringFrequency === 'monthly'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      חודשי
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          recurringFrequency: 'yearly',
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        formData.recurringFrequency === 'yearly'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      שנתי
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <h3 className="text-lg font-bold pt-2">פרטים אישיים</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">שם מלא *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">אימייל *</label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">טלפון</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="form-input"
                />
              </div>

              {/* Dedication */}
              <div>
                <label className="form-label">הקדשה (לעילוי נשמת, לרפואה שלמה וכו&#39;)</label>
                <textarea
                  value={formData.dedication}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, dedication: e.target.value }))
                  }
                  className="form-input"
                  rows={3}
                  placeholder="לעילוי נשמת... / לרפואה שלמה של..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={actualAmount <= 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
                  actualAmount > 0
                    ? 'bg-accent hover:bg-accent-light text-primary-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Heart size={20} />
                {actualAmount > 0
                  ? `תרום ${currencySymbol[formData.currency]}${actualAmount}`
                  : 'בחרו סכום'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">למה לתרום?</h3>
              <ul className="space-y-3">
                {[
                  'ארוחות שבת חינם לכל הקהילה',
                  'שיעורי תורה ויהדות',
                  'חוגי ילדים ופעילויות נוער',
                  'אירועי חגים לכל המשפחה',
                  'סיוע למשפחות נזקקות',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Heart
                      size={16}
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} className="text-green-600" />
                <h3 className="font-bold">תרומה מאובטחת</h3>
              </div>
              <p className="text-gray-500 text-sm">
                כל התרומות מעובדות בצורה מאובטחת. התרומה מוכרת לצורכי מס.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={20} className="text-primary" />
                <h3 className="font-bold">אמצעי תשלום</h3>
              </div>
              <p className="text-gray-500 text-sm">
                אשראי, PayPal, העברה בנקאית, ביט/פייבוקס
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
