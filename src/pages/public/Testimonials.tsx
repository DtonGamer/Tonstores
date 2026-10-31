import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Chidinma E.",
    role: "Lagos Fashion Seller",
    location: "Lagos",
    duration: "3 months with Tonstores",
    sales: "₦423k weekly sales",
    content: "I was spending every Sunday night updating my WhatsApp status with product photos. Tuesday I'd realize I got the price wrong and have to message everyone individually. Now I update once and send one link to all my customer groups. I'm spending 5 hours less per week and closing 30% more sales.",
    initials: "CE"
  },
  {
    name: "David T.",
    role: "Abuja Electronics Reseller",
    location: "Abuja",
    duration: "5 months with Tonstores",
    sales: "89 sales this week",
    content: "Before, people would see my TikTok live and ask 'How do I buy?' I'd say 'DM me' and lose half of them. Now I drop my Tonstores link in the live chat and people buy while I'm still streaming. No 'send your account details' back and forth.",
    initials: "DT"
  },
  {
    name: "Fatima B.",
    role: "Kano Artisan Crafts",
    location: "Kano",
    duration: "2 months with Tonstores",
    sales: "156 orders this month",
    content: "Customers always complained about scattered product photos. Now I have a professional catalog that makes them trust me. They even ask for my link to share with friends.",
    initials: "FB"
  },
  {
    name: "Emeka O.",
    role: "Port Harcourt Food Vendor",
    location: "Port Harcourt",
    duration: "4 months with Tonstores",
    sales: "₦280k monthly sales",
    content: "My customers can now order ahead before coming to my shop. The order management system helps me prepare for busy periods and manage inventory better.",
    initials: "EO"
  }
];

const stats = [
  { value: "500+", label: "Active users" }, // TODO: verify before publishing
  { value: "₦50M+", label: "Sales processed" }, // TODO: verify before publishing
  { value: "Paystack", label: "Secure checkout" },
  { value: "<24h", label: "Support response" },
];

const Testimonials = () => (
  <main className="flex-grow bg-Tonstores-cream py-16 md:py-24">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-12">
        <p className="text-Tonstores-green font-semibold mb-3">Seller stories</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-Tonstores-darkblue mb-4">From scattered posts to one simple link</h1>
        <p className="text-xl text-gray-600">How Nigerian sellers use Tonstores to save time and sell more.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <figure key={t.name} className="bg-white border border-gray-200 border-l-4 border-l-Tonstores-green rounded-2xl p-8">
            <blockquote className="text-lg text-gray-700 mb-6">“{t.content}”</blockquote>
            <figcaption className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-Tonstores-green/10 text-Tonstores-green font-bold flex items-center justify-center mr-4">{t.initials}</div>
              <div>
                <div className="font-bold text-Tonstores-darkblue">{t.name}</div>
                <div className="text-sm text-gray-600">{t.role}</div>
                <div className="text-xs text-gray-500 mt-1">{t.duration} · {t.sales}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <div className="text-3xl font-extrabold text-Tonstores-green">{s.value}</div>
            <div className="text-gray-600 mt-1 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto mt-16 bg-Tonstores-green text-white rounded-3xl py-14 px-6 text-center">
        <h2 className="text-3xl font-extrabold mb-3">Set up your shop tonight</h2>
        <p className="text-white/80 mb-8">Share your link tomorrow. It's free to start.</p>
        <Link to="/register" className="inline-block bg-white text-Tonstores-green px-8 py-4 rounded-lg font-bold">Create your free catalog</Link>
      </div>
    </div>
  </main>
);

export default Testimonials;
