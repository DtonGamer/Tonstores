import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const values = [
  { title: "Built for sellers like you", text: "Made for people running real shops on WhatsApp, Instagram and TikTok, not adapted from Western tools." },
  { title: "You own your data", text: "Your customers, products and orders are yours. Export them anytime." },
  { title: "No cut of your sales", text: "You pay a flat monthly fee, or use the free plan. You keep 100% of what you earn." },
  { title: "Real support", text: "You talk to the person building the product, not a script." },
];

const About = () => (
  <main className="flex-grow bg-Tonstores-cream">
    <section className="py-16 md:py-24 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <p className="text-Tonstores-green font-semibold mb-3">About Tonstores</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-Tonstores-darkblue mb-5">
          Tools for Nigerian sellers who run real businesses from their phones.
        </h1>
        <p className="text-xl text-gray-600">
          Many sellers earn good money but are treated as too small by banks and too niche by big platforms. We build simple tools so they can look professional and stay in control of their customers.
        </p>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h2 className="text-3xl font-extrabold text-Tonstores-darkblue mb-6">Why we built it</h2>
        <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
          <p>Tonstores started by watching a friend sell fashion on WhatsApp. Every Sunday night she updated her status with photos and prices. By Tuesday she would spot a wrong price and message customers one by one.</p>
          <p>She was earning about ₦300,000 a month, but banks said she was too small for a merchant account, Shopify was priced for other markets, and Instagram's reach kept changing.</p>
          <p>So we built a simple catalog: add products once, share one link everywhere, and receive orders in one place. Your customers and data stay with you.</p>
        </div>
      </div>
    </section>

    <section className="pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h2 className="text-3xl font-extrabold text-Tonstores-darkblue mb-8">What we stand for</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {values.map((v) => (
            <div key={v.title} className="bg-white border border-gray-200 border-l-4 border-l-Tonstores-green rounded-2xl p-7">
              <h3 className="text-xl font-bold text-Tonstores-darkblue mb-2">{v.title}</h3>
              <p className="text-gray-600">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <p className="text-Tonstores-green font-semibold mb-1">Who's behind it</p>
          <h3 className="text-2xl font-bold text-Tonstores-darkblue">Richie Ton</h3>
          <p className="text-gray-500 mb-4">Founder</p>
          <p className="text-gray-700">I'm building Tonstores for small sellers who deserve tools as good as anyone else's. Write to me anytime with feedback or ideas.</p>
        </div>
      </div>
    </section>

    <section className="pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-Tonstores-green text-white rounded-3xl py-14 px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Ready to set up your shop?</h2>
          <p className="text-white/80 mb-8">It's free to start.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"><Button className="px-8 py-6 text-lg rounded-lg bg-white text-Tonstores-green hover:bg-white/90 font-bold">Create your free catalog <ArrowRight className="ml-2" size={20} /></Button></Link>
            <Link to="/contact"><Button variant="outline" className="px-8 py-6 text-lg rounded-lg border-2 border-white text-white bg-transparent hover:bg-white/10 font-bold">Get in touch</Button></Link>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default About;
