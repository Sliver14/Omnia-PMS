// app/page.tsx
import Link from 'next/link';
import { Bed, Calendar, Users, Wrench, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            HotelAdmin Pro
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            The complete hotel management suite – from bookings to housekeeping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              <Shield className="w-5 h-5" /> Staff Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: 'Smart Bookings', desc: 'Calendar + list view with drag & drop' },
              { icon: Bed, title: 'Live Room Status', desc: 'Real-time availability grid' },
              { icon: Users, title: 'Housekeeping Portal', desc: 'Kanban task board' },
              { icon: Wrench, title: 'Maintenance Alerts', desc: 'Instant issue tracking' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 HotelAdmin Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}