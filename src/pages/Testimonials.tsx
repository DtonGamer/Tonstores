import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "John Doe",
    role: "Small Business Owner",
    image: "/testimonials/john.jpg",
    content: "TonStores has transformed how I manage my product catalog. The platform is intuitive and makes it easy to showcase my products to customers.",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    role: "Online Retailer",
    image: "/testimonials/sarah.jpg",
    content: "The ability to create and share catalogs instantly has boosted my sales significantly. My customers love how easy it is to browse and order.",
    rating: 5
  },
  {
    name: "Michael Brown",
    role: "Fashion Boutique Owner",
    image: "/testimonials/michael.jpg",
    content: "The platform's simplicity and effectiveness are unmatched. It's exactly what my business needed to expand its online presence.",
    rating: 4
  },
  {
    name: "Emma Wilson",
    role: "Artisan Crafts Seller",
    image: "/testimonials/emma.jpg",
    content: "TonStores has made it possible for me to reach customers I never could before. The catalog sharing feature is a game-changer.",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Electronics Store Owner",
    image: "/testimonials/david.jpg",
    content: "Managing my product inventory has never been easier. The platform is reliable and the support team is always helpful.",
    rating: 5
  },
  {
    name: "Lisa Anderson",
    role: "Home Decor Business",
    image: "/testimonials/lisa.jpg",
    content: "I love how professional my catalog looks on TonStores. It's helped me establish credibility with new customers.",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-tonstores-darkblue dark:text-tonstores-blue mb-4">
              What Our Users Say
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how TonStores is helping businesses grow their online presence
              and manage their catalogs effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 p-6 flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-avatar.svg";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}
                    />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 flex-grow">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Ready to Get Started?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of businesses already using TonStores to grow their online presence.
            </p>
            <Link
              to="/register"
              className="inline-block bg-tonstores-green hover:bg-tonstores-darkblue text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your Free Account
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Testimonials; 