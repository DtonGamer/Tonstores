import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Check } from "lucide-react";
import useAuth from "@/contexts/AuthContext";

const steps = [
  { n: "1", title: "Add your products", text: "Upload photos, set prices and descriptions once." },
  { n: "2", title: "Share your link", text: "Put it in your WhatsApp status, Instagram bio or TikTok live chat." },
  { n: "3", title: "Get orders", text: "See every order in one dashboard. Customers pay you directly by bank transfer." },
];

const quotes = [
  { text: "I update once and send one link to all my customer groups. I save about 5 hours a week.", who: "Chidinma E.", role: "Fashion seller, Lagos" },
  { text: "I drop my link in the TikTok live chat and people buy while I'm still streaming.", who: "David T.", role: "Electronics reseller, Abuja" },
  { text: "Customers trust me more now. They even ask for my link to share with friends.", who: "Fatima B.", role: "Artisan crafts, Kano" },
];

const plans = [
  { name: "Free", price: "₦0", note: "Just getting started", items: ["Up to 10 products", "Shareable catalog link"] },
  { name: "Pro", price: "₦15,000", per: "/month", note: "Growing steadily", items: ["Up to 100 products", "Sales by platform", "Priority support"], popular: true },
  { name: "Business", price: "₦33,000", per: "/month", note: "Busy, established shop", items: ["Unlimited products", "Everything in Pro"] },
];

const faqs = [
  { q: "How do I get paid?", a: "Customers pay by bank transfer straight to your account. We don't hold your money and we don't take a cut of your sales." },
  { q: "Do I need a business bank account?", a: "No. You can use your regular account." },
  { q: "Can I leave and take my data?", a: "Yes. Export your customers, products and orders anytime." },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-Tonstores-cream">
      <main className="flex-grow">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-Tonstores-darkblue mb-5">
                Your whole shop in <span className="bg-Tonstores-amber/25 px-2 rounded-md">one link.</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl mb-8">
                Add your products once. Share the link on WhatsApp, Instagram or TikTok. Customers order, you get paid by transfer, and you stop retyping prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <Link to="/dashboard">
                    <Button className="px-7 py-6 text-lg rounded-lg bg-Tonstores-green hover:bg-Tonstores-green/90 text-white font-bold">
                      Go to Dashboard <LayoutDashboard className="ml-2" size={20} />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button className="px-7 py-6 text-lg rounded-lg bg-Tonstores-green hover:bg-Tonstores-green/90 text-white font-bold">
                        Create your free catalog <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </Link>
                    <Link to="/features">
                      <Button variant="outline" className="px-7 py-6 text-lg rounded-lg border-2 border-Tonstores-darkblue text-Tonstores-darkblue bg-transparent hover:bg-Tonstores-darkblue/5 font-bold">
                        How it works
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                {["Free for 10 products", "No commission on sales", "No card needed"].map((t) => (
                  <li key={t} className="flex items-center"><Check size={16} className="text-Tonstores-green mr-1" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="max-w-sm w-full mx-auto">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">
                🔗 tonstores.com/your-shop
                <span className="ml-auto bg-Tonstores-green/10 text-Tonstores-green px-3 py-1 rounded-full text-xs">Copy</span>
              </div>
              <div className="rounded-3xl overflow-hidden border-2 border-Tonstores-darkblue bg-white">
                <img
                  src="https://hhxpuadernawdgdrdnok.supabase.co/storage/v1/object/public/profiles/avatars/ChatGPT%20Image%20May%203,%202025,%2012_21_52%20AM.png"
                  alt="A Tonstores catalog on a phone"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Platform strip */}
        <div className="bg-Tonstores-green/10 border-y border-gray-200 py-5">
          <div className="container mx-auto px-4 flex flex-wrap justify-between gap-4 text-Tonstores-green font-bold text-sm">
            {["WhatsApp", "Instagram", "TikTok", "Facebook", "SMS", "One link for all"].map((p) => <span key={p}>{p}</span>)}
          </div>
        </div>

        {/* Steps */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-Tonstores-darkblue">Live in three steps</h2>
            <p className="text-gray-600 mt-2">Most sellers finish in under 10 minutes.</p>
            <div className="mt-8 grid md:grid-cols-3 bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {steps.map((s) => (
                <div key={s.n} className="p-8 border-b md:border-b-0 md:border-r last:border-0 border-gray-200">
                  <div className="text-5xl font-extrabold text-Tonstores-amber leading-none">{s.n}</div>
                  <h3 className="text-xl font-bold mt-3 mb-2 text-Tonstores-darkblue">{s.title}</h3>
                  <p className="text-gray-600">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-Tonstores-darkblue mb-8">Built for how you sell</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 bg-Tonstores-green text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-2">Change a price once, it updates everywhere</h3>
                <p className="text-white/80">No more Sunday nights reposting statuses or messaging every customer about a new price.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-2 text-Tonstores-darkblue">Looks trustworthy</h3>
                <p className="text-gray-600">A clean catalog helps new buyers feel safe sending money.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-2 text-Tonstores-darkblue">You keep your data</h3>
                <p className="text-gray-600">Export customers and orders anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-Tonstores-darkblue">What sellers say</h2>
              <Link to="/testimonials" className="text-Tonstores-green font-bold hidden sm:block">Read more →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {quotes.map((q) => (
                <figure key={q.who} className="bg-white border border-gray-200 border-l-4 border-l-Tonstores-green rounded-2xl p-7">
                  <blockquote className="text-gray-700 mb-4">“{q.text}”</blockquote>
                  <figcaption className="text-sm text-gray-500"><b className="text-Tonstores-darkblue">{q.who}</b> · {q.role}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-Tonstores-darkblue">Pricing that stays simple</h2>
            <p className="text-gray-600 mt-2 mb-8">A flat monthly fee. We never take a cut of your sales.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.name} className={`bg-white rounded-2xl p-7 ${p.popular ? "border-2 border-Tonstores-green" : "border border-gray-200"}`}>
                  {p.popular && <span className="bg-Tonstores-amber text-Tonstores-darkblue text-xs font-extrabold px-3 py-1 rounded-full">MOST POPULAR</span>}
                  <h3 className="text-xl font-bold mt-2 text-Tonstores-darkblue">{p.name}</h3>
                  <div className="text-4xl font-extrabold my-1 text-Tonstores-darkblue">{p.price}<span className="text-base font-medium text-gray-500">{p.per}</span></div>
                  <p className="text-sm text-gray-500 mb-3">{p.note}</p>
                  <ul className="space-y-1 text-gray-600">
                    {p.items.map((i) => <li key={i} className="flex items-center"><Check size={16} className="text-Tonstores-green mr-2" />{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6"><Link to="/pricing" className="text-Tonstores-green font-bold">Compare all plans →</Link></div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-Tonstores-darkblue mb-4">Quick answers</h2>
            {faqs.map((f) => (
              <details key={f.q} className="border-b border-gray-200 py-4 group">
                <summary className="font-bold cursor-pointer list-none flex justify-between text-Tonstores-darkblue">
                  {f.q}<span className="text-Tonstores-green text-xl leading-none group-open:hidden">+</span><span className="text-Tonstores-green text-xl leading-none hidden group-open:inline">–</span>
                </summary>
                <p className="text-gray-600 mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        {!user && (
          <section className="pb-16 md:pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-Tonstores-green text-white rounded-3xl py-14 px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Set up your shop tonight</h2>
                <p className="text-white/80 mb-8">Share your link tomorrow. It's free to start.</p>
                <Link to="/register">
                  <Button className="px-8 py-6 text-lg rounded-lg bg-white text-Tonstores-green hover:bg-white/90 font-bold">Create your free catalog</Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Sticky mobile CTA */}
      {!user && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-Tonstores-cream border-t border-gray-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40">
          <Link to="/register"><Button className="w-full py-6 text-base rounded-lg bg-Tonstores-green text-white font-bold">Create your free catalog</Button></Link>
        </div>
      )}
    </div>
  );
};

export default Index;
