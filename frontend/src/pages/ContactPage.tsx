import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { contactAPI, bannersAPI } from "../services/api";
import BannerCarousel from "../components/BannerCarousel";
import contactBg from "../assets/Contact Page Image/contactimg.webp";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersAPI.getByPage("contact");
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification");
      return;
    }

    setLoading(true);

    try {
      await contactAPI.submit({
        ...formData,
        recaptcha_token: recaptchaToken,
      });
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setRecaptchaToken(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to submit contact form. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {banners && banners.length > 0 && <BannerCarousel banners={banners} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
          <div className="bg-white px-8 py-10 shadow-xl rounded-[32px] border border-[#d8c8a5] text-gray-900 w-full">
            <p className="text-sm font-semibold tracking-[0.35em] text-[#b08b4f] uppercase mb-2">
              Get in touch
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#355b24] uppercase mb-3">
              Leave a Message
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-8">
              If you have any questions about the services we provide, simply
              use the form below. We try and respond to all queries and comments
              within 24 hours.
            </p>
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Type your Name"
                  className="w-full px-4 py-3 rounded-md border border-[#d8c8a5] focus:outline-none focus:ring-2 focus:ring-[#a6813a] placeholder:text-gray-500"
                />

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Type your Mobile"
                  className="w-full px-4 py-3 rounded-md border border-[#d8c8a5] focus:outline-none focus:ring-2 focus:ring-[#a6813a] placeholder:text-gray-500"
                />

                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Type your Email"
                  className="w-full px-4 py-3 rounded-md border border-[#d8c8a5] focus:outline-none focus:ring-2 focus:ring-[#a6813a] placeholder:text-gray-500"
                />
              </div>

              <div>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={8}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your Additional Requirements"
                  className="w-full px-4 py-3 rounded-md border border-[#d8c8a5] focus:outline-none focus:ring-2 focus:ring-[#a6813a] placeholder:text-gray-500"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  {recaptchaSiteKey && (
                    <ReCAPTCHA
                      sitekey={recaptchaSiteKey}
                      onChange={handleRecaptchaChange}
                    />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center border border-black px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] bg-white text-black rounded-none hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? "Submitting…" : "Submit Enquiry"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] overflow-hidden border border-[#d8c8a5] shadow-lg">
              <img
                src={contactBg}
                alt="Contact"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="card p-6 border border-[#d8c8a5] rounded-2xl shadow-sm md:flex-[0.95]">
                <h3 className="text-xl font-semibold text-primary-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                  Dubai Address
                </h3>
                <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                  <div>
                    <p className="font-semibold text-gray-900 uppercase">
                      Shams Bag Industries LLC
                    </p>
                    <p>
                      Warehouse No. 1, Al Qusais Industrial Area 4, Dubai, UAE.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-[#c2185b] font-semibold">
                      <span aria-hidden="true">📞</span>
                      <span>+971 42 673449</span>
                    </p>
                    <p className="flex items-center gap-2 text-[#c2185b] font-semibold">
                      <span aria-hidden="true">📞</span>
                      <span>+971 55 1906177</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-primary-700 uppercase tracking-wide">
                      Warehouse Address
                    </p>
                    <p className="font-semibold text-gray-900 uppercase">
                      Saifzone Sharjah
                    </p>
                    <p className="font-semibold text-gray-900 uppercase">
                      Shams Bag Industries LLC
                    </p>
                    <p>Q4-003, Saif Zone, Sharjah, UAE</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 border border-[#d8c8a5] rounded-2xl shadow-sm md:flex-[1.05]">
                <h3 className="text-xl font-semibold text-primary-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                  Poland Address
                </h3>
                <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                  <div>
                    <p className="font-semibold text-gray-900 uppercase">
                      Shams Naturals Sp. z.o.o
                    </p>
                    <p>
                      Marcina Kasprzaka 31, Room 119, Warsaw, Post Code 00-123,
                      Poland
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-[#c2185b] font-semibold">
                      <span aria-hidden="true">📞</span>
                      <span>+48 578 625 210</span>
                    </p>
                    <p className="flex items-center gap-2 text-[#c2185b] font-semibold">
                      <span aria-hidden="true">📞</span>
                      <span>+48 795 876 741</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-primary-700 uppercase tracking-wide">
                      Warehouse Address
                    </p>
                    <p className="font-semibold text-gray-900 uppercase">
                      Poland
                    </p>
                    <p>Lodz, 93-231, at 3B Dostawcza Street.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
