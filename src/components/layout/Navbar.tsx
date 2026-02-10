'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { useStore } from '@/store/useStore';

const navLinks = [
  { href: '/', label: 'ראשי' },
  { href: '/events', label: 'אירועים' },
  { href: '/gallery', label: 'גלריה' },
  { href: '/donate', label: 'תרומות' },
  { href: '/contact', label: 'צור קשר' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const settings = useStore((s) => s.settings);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary-dark font-bold text-lg">&#x2721;</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{settings.chabadNameHe}</h1>
              <p className="text-xs text-gray-300 leading-tight">{settings.city}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-accent text-primary-dark'
                    : 'text-gray-200 hover:bg-primary-light hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-primary-light hover:text-white"
            >
              ניהול
            </Link>
          </div>

          {/* Phone + Mobile menu button */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${settings.phone}`}
              className="hidden sm:flex items-center gap-2 bg-accent text-primary-dark px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent-light"
            >
              <Phone size={16} />
              {settings.phone}
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary-light"
              aria-label="תפריט"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary-dark border-t border-primary-light">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-accent text-primary-dark'
                    : 'text-gray-200 hover:bg-primary-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-primary-light"
            >
              ניהול
            </Link>
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center justify-center gap-2 bg-accent text-primary-dark px-4 py-3 rounded-lg text-sm font-semibold mt-2"
            >
              <Phone size={16} />
              {settings.phone}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
