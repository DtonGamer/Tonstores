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

const Testimonials = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="bg-Tonstores-green/10 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
            BUILDERS LIKE YOU
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">
            From Chaos to Control
          </h1>
          <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Nigerian entrepreneurs are building independent businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition-all hover:-translate-y-2"
            >
              <div className="flex mb-4 items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-Tonstores-green/20 to-Tonstores-darkblue/10 flex items-center justify-center mr-4">
                  <span className="text-Tonstores-green text-2xl font-bold">{testimonial.initials}</span>
                </div>
                <div>
                  <h3 className="font-bold text-Tonstores-darkblue text-xl">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mt-6 relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-Tonstores-green before:rounded-full">
                "{testimonial.content}"
              </p>

              <div className="flex mt-6 text-Tonstores-green text-xl">
                ★★★★★
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {testimonial.location} • {testimonial.duration} • {testimonial.sales}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-Tonstores-darkblue">500+</div>
            <div className="text-gray-600 mt-2">Active Users</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-Tonstores-darkblue">₦50M+</div>
            <div className="text-gray-600 mt-2">Sales Processed</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-Tonstores-darkblue">100%</div>
            <div className="text-gray-600 mt-2">Data Ownership</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-Tonstores-darkblue">24/7</div>
            <div className="text-gray-600 mt-2">Nigeria Support</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-Tonstores-darkblue mb-6">
            Ready to <span className="text-Tonstores-green">Own Your Infrastructure</span>?
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Join Nigerian Builders who stopped asking permission and started building anyway
          </p>

          <Link
            to="/register"
            className="inline-block bg-Tonstores-green hover:bg-Tonstores-darkblue text-white px-8 py-4 rounded-xl font-medium transition-colors"
          >
            Start Building Free
          </Link>
        </div>
      </div>
    </div>
  );
};


export default Testimonials; 