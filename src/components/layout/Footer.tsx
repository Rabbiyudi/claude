'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function Footer() {
  const settings = useStore((s) => s.settings);

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="text-primary-dark font-bold text-lg">&#x2721;</span>
              </div>
              <h3 className="text-xl font-bold">{settings.chabadNameHe}</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {settings.aboutText.substring(0, 150)}...
            </p>
            <div className="flex gap-3">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary-dark transition-colors"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary-dark transition-colors"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary-dark transition-colors"
                >
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-accent">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-gray-300 hover:text-accent text-sm">
                  אירועים קרובים
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-accent text-sm">
                  גלריית תמונות
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-300 hover:text-accent text-sm">
                  תרומה לבית חב&quot;ד
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-accent text-sm">
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-accent">פרטי התקשרות</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <MapPin size={16} className="text-accent shrink-0" />
                {settings.address}
              </li>
              <li>
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-accent text-sm"
                >
                  <Phone size={16} className="text-accent shrink-0" />
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-accent text-sm"
                >
                  <Mail size={16} className="text-accent shrink-0" />
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {settings.chabadNameHe} | כל הזכויות שמורות
          </p>
        </div>
      </div>
    </footer>
  );
}
