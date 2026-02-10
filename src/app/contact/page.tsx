'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle,
  MessageCircle,
  Clock,
  Facebook,
  Instagram,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ContactMessage } from '@/types';

export default function ContactPage() {
  const settings = useStore((s) => s.settings);
  const addMessage = useStore((s) => s.addMessage);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const msg: ContactMessage = {
      id: Date.now().toString(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(msg);
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">צור קשר</h1>
          <p className="text-gray-300 text-lg">
            נשמח לשמוע מכם! צרו קשר בכל דרך שנוחה לכם
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ההודעה נשלחה בהצלחה!
                </h2>
                <p className="text-gray-500 mb-6">
                  תודה ש{formData.fullName} פנית אלינו. נחזור אליך בהקדם האפשרי.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                      subject: '',
                      message: '',
                    });
                  }}
                  className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-bold"
                >
                  שליחת הודעה נוספת
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-6 shadow-sm space-y-5"
              >
                <h2 className="text-xl font-bold">שלחו לנו הודעה</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">שם מלא *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
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
                <div>
                  <label className="form-label">נושא *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, subject: e.target.value }))
                    }
                    className="form-input"
                  >
                    <option value="">בחרו נושא</option>
                    <option value="שאלה כללית">שאלה כללית</option>
                    <option value="הרשמה לאירוע">הרשמה לאירוע</option>
                    <option value="תרומה">תרומה</option>
                    <option value="שיעורי תורה">שיעורי תורה</option>
                    <option value="ארוחות שבת">ארוחות שבת</option>
                    <option value="חוגי ילדים">חוגי ילדים</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">הודעה *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, message: e.target.value }))
                    }
                    className="form-input"
                    rows={5}
                    placeholder="כתבו את הודעתכם כאן..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-light text-primary-dark py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  שליחה
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Map placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-primary/30 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{settings.address}</p>
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${settings.phone}`}
                className="card-hover bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">טלפון</p>
                  <p className="font-bold text-gray-900">{settings.phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="card-hover bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">אימייל</p>
                  <p className="font-bold text-gray-900 text-sm" dir="ltr">
                    {settings.email}
                  </p>
                </div>
              </a>

              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-hover bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <MessageCircle size={22} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <p className="font-bold text-gray-900">שלחו לנו הודעה</p>
                  </div>
                </a>
              )}

              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">שעות פעילות</p>
                  <p className="font-bold text-gray-900 text-sm">
                    א-ה: 9:00-21:00
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">עקבו אחרינו</h3>
              <div className="flex gap-3">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100"
                  >
                    <Facebook size={18} />
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-xl hover:bg-pink-100"
                  >
                    <Instagram size={18} />
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
