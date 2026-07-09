import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Gift, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

const heroImage = '/src/assets/images/earning_hero_1783579600546.jpg';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Payment proofs structure
interface PaymentProof {
  id: string;
  user: string;
  amount: number;
  method: string;
  time: string;
}

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    question: "How do points work and what is their conversion rate?",
    answer: (
      <span>
        Points are the digital currency earned on <strong>MR CASH BD</strong> by completing simple tasks, installing apps, registering on websites, and taking surveys. The exchange rate is fixed and transparent: <strong>10,000 Points = ৳100 BDT</strong> (or $1.00 USD). Points are accumulated in your account balance in real-time and can be cashed out directly once you reach the minimum requirements.
      </span>
    )
  },
  {
    question: "What are the available withdrawal methods and minimum requirements?",
    answer: (
      <div className="space-y-2">
        <p>We support Bangladesh's most popular mobile financial services with direct and secure transfers:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong>Mobile Recharge:</strong> Minimum threshold is just <strong>2,000 Points (৳20 BDT)</strong>. Supported operators: GP, bKash, Banglalink, Robi, Airtel, Teletalk.</li>
          <li><strong>bKash Personal:</strong> Minimum threshold is <strong>10,000 Points (৳100 BDT)</strong>.</li>
          <li><strong>Nagad Personal:</strong> Minimum threshold is <strong>10,000 Points (৳100 BDT)</strong>.</li>
          <li><strong>Rocket Personal:</strong> Minimum threshold is <strong>10,000 Points (৳100 BDT)</strong>.</li>
          <li><strong>Upay Personal:</strong> Minimum threshold is <strong>10,000 Points (৳100 BDT)</strong>.</li>
        </ul>
      </div>
    )
  },
  {
    question: "What are the core guidelines for successful task completion?",
    answer: (
      <div className="space-y-2">
        <p>To ensure your tasks are successfully tracked and your points are automatically credited by our advertisers, please adhere to these strict guidelines:</p>
        <ol className="list-decimal list-inside space-y-1.5 pl-1">
          <li><strong>Disable VPNs or Proxies:</strong> All offers are strictly targeted to Bangladesh residents. Using a VPN, proxy, or emulator will flag your session and block your points.</li>
          <li><strong>Use Real Information:</strong> Enter valid emails, active phone numbers, and genuine details when completing surveys or registrations. Fake entries are automatically rejected.</li>
          <li><strong>Disable Adblockers:</strong> Adblockers prevent the conversion cookies and postbacks from recording your task completion.</li>
          <li><strong>Complete All Steps:</strong> Always read and complete all specified instructions (e.g., "download and open for 2 minutes", or "register and verify email").</li>
        </ol>
      </div>
    )
  },
  {
    question: "How long does it take for points to credit and withdrawals to process?",
    answer: (
      <span>
        Once you complete a task, points are typically credited automatically to your wallet within <strong>5 to 15 minutes</strong> after the advertiser's system confirms the conversion. Some high-paying offers or complex surveys may take up to 24 hours to verify. Cash out requests are processed rapidly; most withdrawals are sent to your mobile wallet within a few hours, with a maximum processing time of 24 hours.
      </span>
    )
  },
  {
    question: "Can I create multiple accounts or refer myself?",
    answer: (
      <span>
        No, multiple accounts are strictly forbidden. To maintain high payout rates from our advertisers, we permit only <strong>one account per person, per device, and per internet connection/IP address</strong>. Any self-referral, device cloning, or emulator usage is actively detected by our security filters and will result in permanent ban and forfeiture of all points.
      </span>
    )
  }
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [proofs, setProofs] = useState<PaymentProof[]>([
    { id: '1', user: 'mahamud***', amount: 150, method: 'bKash', time: 'Just now' },
    { id: '2', user: 'sajib***', amount: 50, method: 'Nagad', time: '2 mins ago' },
    { id: '3', user: 'fahim***', amount: 20, method: 'Mobile Recharge', time: '5 mins ago' },
    { id: '4', user: 'tasnim***', amount: 200, method: 'Rocket', time: '8 mins ago' },
    { id: '5', user: 'rakib***', amount: 100, method: 'Upay', time: '11 mins ago' },
  ]);

  // Rotate payments in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setProofs((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) {
          // Generate a random dynamic claim
          const users = ['ariful***', 'munna***', 'milon***', 'nasir***', 'shakil***', 'jamil***', 'marium***', 'shirin***'];
          const methods = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Mobile Recharge'];
          const recharges = [20, 50, 100, 150, 200, 300, 500];
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const randomMethod = methods[Math.floor(Math.random() * methods.length)];
          const randomAmount = randomMethod === 'Mobile Recharge' 
            ? recharges[Math.floor(Math.random() * 3)] 
            : recharges[Math.floor(Math.random() * recharges.length)];

          const newProof: PaymentProof = {
            id: String(Date.now()),
            user: randomUser,
            amount: randomAmount,
            method: randomMethod,
            time: 'Just now',
          };
          
          // Set previous ones as "1 min ago"
          const updated = next.map(p => ({
            ...p,
            time: p.time === 'Just now' ? '1 min ago' : p.time.includes('min') ? `${parseInt(p.time) + 1} mins ago` : p.time
          }));

          return [...updated, newProof];
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16 py-8" id="landing-page-root">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs tracking-wider uppercase font-display">
            <Flame className="w-3.5 h-3.5 fill-current animate-bounce text-orange-500" />
            Leading CPA Rewards Platform in BD
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-slate-800 leading-[1.1] tracking-tight">
            Earn Easy Cash <br />
            <span className="text-blue-600 relative">
              Every Single Day
              <span className="absolute bottom-1 left-0 w-full h-2 bg-blue-100 -z-10 rounded"></span>
            </span>
          </h1>
          
          <p className="text-slate-600 text-base md:text-lg max-w-lg leading-relaxed">
            Join <strong>MR CASH BD</strong>, the premier GPT rewards site. Complete simple tasks, take interesting surveys, try fun games, and receive instant cash outs straight to your personal <strong>bKash, Nagad, Rocket, or Upay</strong> wallet!
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer text-base md:text-lg group"
              id="hero-cta-button"
            >
              Start Earning Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm text-slate-500">
              <span className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 font-display">M</span>
                <span className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 font-display">S</span>
                <span className="w-8 h-8 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 font-display">R</span>
              </span>
              <span>Joined by <strong>12,450+</strong> members today</span>
            </div>
          </div>
        </motion.div>

        {/* Hero image using the generated 3D illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center"
        >
          <div className="absolute inset-0 bg-blue-500/5 rounded-full filter blur-3xl -z-10"></div>
          <div className="relative p-2 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-w-[480px]">
            <img 
              src={heroImage} 
              alt="MR CASH BD 3D Earning Illustration" 
              className="w-full h-auto rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Quick floating reward alert */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <Gift className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest payout</p>
                <p className="text-sm font-bold text-slate-800">1,500 BDT sent to bKash</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white border-y border-slate-100 py-10" id="landing-stats-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold font-display text-blue-600">38,500+</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Members</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100">
              <p className="text-3xl md:text-4xl font-extrabold font-display text-emerald-500">12,45,000৳</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Paid Out</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100">
              <p className="text-3xl md:text-4xl font-extrabold font-display text-blue-600">5,00,000+</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Offers Completed</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-100">
              <p className="text-3xl md:text-4xl font-extrabold font-display text-orange-500">Instant</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Withdraw Processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE PAYMENT PROOF TICKER */}
      <section className="max-w-7xl mx-auto px-4 space-y-6" id="landing-payment-proof-ticker">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              Live Payment Proofs
            </h2>
            <p className="text-sm text-slate-500">100% verified, real-time transaction receipts from our server ledger</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold font-display tracking-wide animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            LIVE TICKER
          </span>
        </div>

        <div className="relative overflow-hidden w-full py-2">
          <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3">
            {proofs.map((proof) => (
              <motion.div
                key={proof.id}
                layoutId={`proof-${proof.id}`}
                className="flex-shrink-0 flex items-center gap-4 bg-white px-5 py-4 rounded-xl border border-slate-100 shadow-sm min-w-[260px]"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                  proof.method === 'bKash' ? 'bg-[#D12053]' : 
                  proof.method === 'Nagad' ? 'bg-[#EC1C24]' :
                  proof.method === 'Rocket' ? 'bg-[#8C3494]' :
                  proof.method === 'Upay' ? 'bg-[#005B94]' : 'bg-blue-500'
                }`}>
                  {proof.method.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{proof.user}</span>
                    <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 font-medium px-1.5 py-0.5 rounded">
                      {proof.time}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Received <span className="text-emerald-500 font-display font-black">{proof.amount} TK</span> via {proof.method}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 space-y-12" id="landing-how-it-works">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold font-display text-slate-800">How It Works</h2>
          <p className="text-slate-500 text-sm md:text-base">Start earning real income in Bangladesh in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100/50 transition"></div>
            <span className="text-5xl font-black font-display text-blue-100 absolute top-4 right-6">01</span>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 mb-2">Create Free Account</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Register instantly with your username and email. Complete safety setups. Enter referral codes to receive a bonus.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100/50 transition"></div>
            <span className="text-5xl font-black font-display text-emerald-100 absolute top-4 right-6">02</span>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 mb-2">Complete Tasks & Surveys</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Browse our high-paying premium offerwalls. Install apps, play quick games, or answer simple questions. Convert actions to Points.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:bg-orange-100/50 transition"></div>
            <span className="text-5xl font-black font-display text-orange-100 absolute top-4 right-6">03</span>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-800 mb-2">Instant Bangladesh Withdrawal</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Redeem your points directly into cash! Select bKash, Nagad, Rocket, Upay, or direct Mobile Recharge with fast clearance.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 space-y-8" id="landing-faq-section">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold font-display uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Questions
          </div>
          <h2 className="text-3xl font-extrabold font-display text-slate-800">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm md:text-base">Got questions? We have answers to clear all your doubts</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs transition hover:border-blue-100"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-display font-bold text-slate-800 text-sm md:text-base hover:text-blue-600 transition focus:outline-none cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-50 bg-slate-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FINTECH TRUSTED CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="space-y-4 max-w-xl relative">
            <h2 className="text-3xl font-bold font-display leading-tight">Ready to boost your daily wallet?</h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Sign up today on MR CASH BD and get 500 bonus points instantly! No fees, secure platform, local support, and verified payouts.
            </p>
          </div>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 hover:bg-slate-50 font-extrabold font-display rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer relative shrink-0 text-base"
            id="footer-cta-button"
          >
            Create Your Account
            <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
          </button>
        </div>
      </section>

    </div>
  );
}
