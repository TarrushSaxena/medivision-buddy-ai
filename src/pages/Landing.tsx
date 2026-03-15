import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid';
import { NeuralBackground } from '@/components/ui/NeuralBackground';
import {
  ArrowRight,
  Upload,
  MessageSquare,
  BarChart2,
  Shield,
  Zap,
  Info,
  UserCheck,
  ClipboardCheck,
  Brain,
  Activity,
  Files,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-midnight-cobalt text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Neural Background */}
      <section 
        className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden"
      >
        <NeuralBackground />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bio-emerald/10 border border-bio-emerald/20 text-bio-emerald-light text-xs font-semibold mb-8 uppercase tracking-wider animate-membrane">
              <Sparkles className="h-3 w-3" />
              Neural Membrane Evolution
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-crystal-shine leading-tight">
              Meet MediVision. <br />
              <span className="relative">
                Medical AI Reimagined.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-bio-emerald opacity-40 shrink-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Advanced AI-powered diagnostics for educational and research purposes.
              Experience the future of radiology with clinical-grade precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="xl" className="h-16 px-12 text-xl rounded-full shadow-2xl shadow-bio-emerald/40 transition-all bg-bio-emerald hover:bg-bio-emerald-light text-white border-none group relative overflow-hidden">
                <Link to="/register" className="flex items-center gap-2">
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="relative z-10 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="h-16 px-12 text-xl rounded-full border-white/20 hover:bg-white/10 backdrop-blur-xl text-white shadow-xl">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Simplified Autonomous Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative max-w-5xl mx-auto group perspective-1000"
          >
            {/* The Main Dashboard Image with 3D Tilt on Hover */}
            <motion.div 
              whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="liquid-glass-premium rounded-3xl p-3 shadow-2xl overflow-hidden relative border-white/10 ring-1 ring-white/20 bg-background/40"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-bio-emerald/10 via-transparent to-primary/10 pointer-events-none" />
              
              <img
                src="/images/hero_dashboard_1769245460172.png"
                alt="MediVision Dashboard"
                className="w-full h-auto rounded-2xl shadow-inner"
              />
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 p-5 liquid-glass-premium !w-auto !h-auto !rounded-2xl shadow-xl hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-bio-emerald/20 flex items-center justify-center bio-glow">
                  <Activity className="h-6 w-6 text-bio-emerald-light" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Analysis Accuracy</p>
                  <p className="text-lg font-bold text-foreground">98.5%</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 p-5 liquid-glass-premium !w-auto !h-auto !rounded-2xl shadow-xl hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">AI Model Status</p>
                  <p className="text-lg font-bold text-foreground">Active & Ready</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Modern Bento Grid Features */}
      <section className="py-24 bg-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for comprehensive medical image analysis in one unified platform.
            </p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            <BentoGridItem
              title={<span className="text-xl">AI X-Ray Analysis</span>}
              description="State-of-the-art computer vision models to detect abnormalities with heatmaps and confidence scores."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/feature_xray_scan_1769245475435.png" alt="AI X-Ray Analysis" className="w-full h-full object-cover" /></div>}
              icon={<Brain className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-2"
            />
            <BentoGridItem
              title={<span className="text-xl">Instant Reporting</span>}
              description="Generate detailed, exportable PDF reports for clinical reviews and patient records."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/hero_dashboard_1769245460172.png" alt="Instant Reporting" className="w-full h-full object-cover" /></div>}
              icon={<ClipboardCheck className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title={<span className="text-xl">Analytics Dashboard</span>}
              description="Track your analysis history, common findings, and operational metrics over time."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/feature_analytics_1769245511189.png" alt="Analytics Dashboard" className="w-full h-full object-cover" /></div>}
              icon={<BarChart2 className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title={<span className="text-xl">Clinical Assistant</span>}
              description="Chat with our AI assistant to get context-aware answers about medical conditions."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden"><img src="/images/feature_chatbot_1769245495974.png" alt="Clinical Assistant" className="w-full h-full object-cover" /></div>}
              icon={<MessageSquare className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-2"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Simplified How It Works */}
      <section className="py-24 bg-midnight-cobalt/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-bio-emerald/30 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-foreground animate-membrane">Streamlined Workflow</h2>
            <p className="text-lg text-muted-foreground">
              From upload to diagnosis in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-bio-emerald/20 to-transparent -z-10" />

            {[
              { icon: Upload, title: 'Upload Scan', desc: 'Securely upload high-res X-ray images.' },
              { icon: Zap, title: 'AI Analysis', desc: 'Advanced algorithms process the image.' },
              { icon: UserCheck, title: 'Review', desc: 'Expert verification of AI findings.' },
              { icon: Files, title: 'Report', desc: 'Download comprehensive PDF report.' }
            ].map((item, index, arr) => (
              <div key={index} className="relative flex flex-col items-center text-center p-4 group">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center mb-6 z-10 relative group-hover:border-bio-emerald/50 group-hover:animate-membrane transition-all duration-500 backdrop-blur-xl">
                  <item.icon className="h-10 w-10 text-bio-emerald-light group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-bio-emerald text-[10px] font-bold flex items-center justify-center text-white border-2 border-midnight-cobalt">
                    {index + 1}
                  </div>
                </div>
                {/* Arrow connector between steps */}
                {index < arr.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-4 transform translate-x-1/2 z-20 opacity-30">
                    <ArrowRight className="h-6 w-6 text-bio-emerald-light" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-midnight-cobalt">
        <div className="absolute inset-0 bg-bio-emerald/5 -z-10" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-bio-emerald/20 blur-[150px] rounded-full" />
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 tracking-tight max-w-3xl mx-auto leading-tight text-white">
            Ready to experience the future <span className="text-bio-emerald-light">of medical imaging?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Join thousands of medical professionals using MediVision to enhance their diagnostic capabilities.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 px-4">
            <Button asChild size="lg" className="h-12 md:h-16 px-6 md:px-12 text-base md:text-xl rounded-full shadow-2xl shadow-bio-emerald/20 w-full md:w-auto bg-bio-emerald hover:bg-bio-emerald-light transition-all border-none">
              <Link to="/register">
                Create Free Account
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 md:h-16 px-6 md:px-12 text-base md:text-xl rounded-full w-full md:w-auto border-white/10 hover:bg-white/5 backdrop-blur-md">
              <Link to="/about">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
