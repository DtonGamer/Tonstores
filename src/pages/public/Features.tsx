import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, Shield, Lock, Zap, BarChart4, Users, TrendingUp, Target, ArrowRight } from "lucide-react";

const features = [
  { title: "Update once, change everywhere", text: "Edit a price or photo in one place and every shared link is current.", icon: Zap },
  { title: "Looks trustworthy", text: "A clean catalog makes new customers comfortable paying by transfer.", icon: Lock },
  { title: "Works on every platform", text: "One link for WhatsApp, Instagram, TikTok, SMS and email. If one app changes, you lose nothing.", icon: Shield },
  { title: "You own your data", text: "Export customers, products and orders anytime. No lock-in.", icon: Database },
  { title: "See what sells", text: "Pro and Business show which products and platforms bring in orders.", icon: BarChart4 },
  { title: "Grows with you", text: "Start with 10 products, move to 100, then unlimited, with the same workflow.", icon: TrendingUp },
  { title: "Save hours each week", text: "Stop reposting statuses and answering price questions one by one.", icon: Target },
  { title: "Friendly support", text: "Email or WhatsApp. We reply within 24 hours.", icon: Users },
];

const steps = [
  { title: "Add your products", text: "Photos, descriptions and prices, organised in one catalog." },
  { title: "Share your link", text: "Post it anywhere your customers already are." },
  { title: "Receive orders", text: "Every order and customer detail lands in your dashboard." },
  { title: "Get paid directly", text: "Customers pay your bank account. We never touch your money." },
];

const Features = () => (
  <main className="flex-grow bg-Tonstores-cream">
    <section className="py-16 md:py-24 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <p className="text-Tonstores-green font-semibold mb-3">Features</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-Tonstores-darkblue mb-5">Everything you need to sell from one link.</h1>
        <p className="text-xl text-gray-600 mb-8">Simple tools for sellers on WhatsApp, Instagram and TikTok.</p>
        <Link to="/register"><Button className="px-7 py-6 text-lg rounded-lg bg-Tonstores-green hover:bg-Tonstores-green/90 text-white font-bold">Create your free catalog <ArrowRight className="ml-2" size={20} /></Button></Link>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-Tonstores-green/10 flex items-center justify-center mb-4"><f.icon className="text-Tonstores-green" size={24} /></div>
              <h3 className="text-lg font-bold mb-2 text-Tonstores-darkblue">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2 className="text-3xl font-extrabold text-Tonstores-darkblue mb-8">How it works</h2>
        <div className="grid md:grid-cols-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {steps.map((s, i) => (
            <div key={s.title} className="p-7 border-b md:border-b-0 md:border-r last:border-0 border-gray-200">
              <div className="text-5xl font-extrabold text-Tonstores-amber leading-none">{i + 1}</div>
              <h3 className="text-lg font-bold mt-3 mb-2 text-Tonstores-darkblue">{s.title}</h3>
              <p className="text-gray-600 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Features;
