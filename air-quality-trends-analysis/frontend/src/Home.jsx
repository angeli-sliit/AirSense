import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuroraBackground from "./components/common/AuroraBackground";
import AuroraButton from "./components/common/AuroraButton";
import Header from "./components/Header";
import CloudIcon from "./components/common/icons/CloudIcon";
import BarChartIcon from "./components/common/icons/BarChartIcon";
import CpuIcon from "./components/common/icons/CpuIcon";
import MessageIcon from "./components/common/icons/MessageIcon";
import LiquidEther from "./components/LiquidEther.jsx";

export default function Home() {
  const navigate = useNavigate();
  
  const handleNavigateToWorkspace = () => {
    navigate('/workspace');
  };

  return (
    <div className="w-screen min-h-screen bg-gray-950 text-white relative overflow-x-hidden">
      <AuroraBackground />
      <Header />
      <HeroSection onNavigateToWorkspace={handleNavigateToWorkspace} />
      <ServicesSection />
      <PricingSection onNavigateToWorkspace={handleNavigateToWorkspace} />
      <FAQSection />
      <Footer />
    </div>
  );
}

function HeroSection({ onNavigateToWorkspace }) {
  return (
    <section className="relative py-40 px-6 max-w-7xl mx-auto h-[800px] overflow-hidden">
      {/* LiquidEther Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <LiquidEther
            colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            className="w-full h-full"
        />
      </div>
      
      <div className="text-center space-y-8 relative z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-bold"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Intelligent Air Quality
          </span>
          <br />
          <span className="text-white">Analytics Platform</span>
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Advanced AI-powered platform for real-time air quality monitoring,
          predictive forecasting, and comprehensive environmental analytics.
          Make data-driven decisions for healthier cities.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <AuroraButton onClick={onNavigateToWorkspace} variant="primary" className="text-lg px-8 py-4">
            Start Analyzing
          </AuroraButton>
        </motion.div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl rounded-full -z-10" />
    </section>
  );
}

function ServicesSection() {
  const services = [
    { icon: CloudIcon, title: "Data Collection", description: "Real-time air quality data scraping from multiple sources with advanced validation", color: "from-cyan-500 to-blue-500" },
    { icon: BarChartIcon, title: "City Comparison", description: "Compare PM2.5 levels across multiple cities with interactive visualizations", color: "from-purple-500 to-pink-500" },
    { icon: CpuIcon, title: "AI Forecasting", description: "Predict future air quality trends using machine learning models", color: "from-green-500 to-cyan-500" },
    { icon: MessageIcon, title: "AI Assistant", description: "Natural language queries for instant air quality insights and analysis", color: "from-orange-500 to-red-500" },
    { icon: CloudIcon, title: "Report Generation", description: "Automated PDF reports with charts, insights, and recommendations", color: "from-blue-500 to-purple-500" },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Services</span>
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Comprehensive suite of tools for air quality analysis and environmental monitoring
        </motion.p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-6 hover:border-cyan-500/30 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <service.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
            <p className="text-gray-400 leading-relaxed">{service.description}</p>
          </motion.div>
        ))}
        <motion.div
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 md:col-span-2 lg:col-span-1"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-4">
            <CpuIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Advanced Analytics</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Leverage cutting-edge AI and machine learning for deep environmental insights
          </p>
          <div className="flex gap-2 flex-wrap">
            {["Real-time", "Predictive", "Multi-city", "Historical"].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-cyan-300 border border-cyan-500/30">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection({ onNavigateToWorkspace }) {
  const plans = [
    { name: "Free", price: "$0", period: "Per month", popular: false, features: { cities: "1 city per request", lookback: "7 days scrape lookback", forecasting: "Not available", confidence: "✗ Confidence intervals", reports: "✗ PDF report generator", agent: "Limited agentic planner", api: "Rate-limited API access", support: "Community support" }, cta: "Get Started", variant: "secondary" },
    { name: "Pro", price: "$19.99", period: "Per month", popular: true, features: { cities: "Up to 3 cities", lookback: "30 days scrape lookback", forecasting: "Yes 💹 up to 7-day horizon", confidence: "Included Confidence intervals", reports: "Basic PDF reports", agent: "Full agentic planner", api: "Standard API access", support: "Email support" }, cta: "Start Pro", variant: "primary" },
    { name: "Enterprise", price: "Custom", period: "Billed annually", popular: false, features: { cities: "Unlimited cities", lookback: "90 days scrape lookback", forecasting: "Yes 💹 up to 30-day horizon", confidence: "Included Confidence intervals", reports: "Branded, multi-chart reports", agent: "Full + customization", api: "Priority + SLA API access", support: "Priority support" }, cta: "Contact Sales", variant: "success" },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Pricing & <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Plans</span>
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Choose the plan that fits your air-quality analytics needs. Upgrade anytime.
        </motion.p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={`relative bg-gray-900/40 backdrop-blur-xl rounded-2xl border ${
              plan.popular ? "border-cyan-500/50 shadow-2xl shadow-cyan-500/20" : "border-gray-700/30"
            } p-8`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ y: -5 }}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              {Object.entries(plan.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                  <span className="text-white font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
            <AuroraButton onClick={plan.name === 'Free' ? onNavigateToWorkspace : undefined} variant={plan.variant} className="w-full justify-center">
              {plan.cta}
            </AuroraButton>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { question: "How accurate is the air quality data?", answer: "Our data is sourced from multiple reliable environmental monitoring stations and validated through advanced algorithms for maximum accuracy." },
    { question: "Can I integrate with my existing systems?", answer: "Yes, we provide comprehensive API access for seamless integration with your existing environmental monitoring systems." },
    { question: "What cities are currently supported?", answer: "We support major cities worldwide with continuous expansion. Contact us for specific city availability." },
    { question: "How often is the data updated?", answer: "Data is updated in real-time with most sources providing updates every 15-30 minutes." },
  ];
  return (
    <section className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Questions</span>
        </motion.h2>
      </div>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-6 hover:border-cyan-500/30 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
            <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <CloudIcon />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AirSense
            </span>
          </div>
          <div className="flex gap-8 text-gray-400">
            {["Privacy", "Terms", "Contact", "Docs"].map((item) => (
              <button key={item} className="hover:text-white transition-colors duration-200">
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© 2024 AirQuality AI. All rights reserved. Building cleaner, healthier cities through data intelligence.</p>
        </div>
      </div>
    </footer>
  );
}



