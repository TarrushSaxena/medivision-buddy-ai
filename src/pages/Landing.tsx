import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Aurora Effect */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--aurora-1))] rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--aurora-2))] rounded-full blur-[128px] animate-pulse delay-1000" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Next-Gen Medical AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Meet MediVision. <br />
              <span className="text-primary relative">
                Medical AI Reimagined.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Advanced AI-powered diagnostics for educational and research purposes.
              Experience the future of radiology with clinical-grade precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-border/50 hover:bg-muted/50 backdrop-blur-sm">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image / Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
              <img
                src="/images/hero_dashboard_1769245460172.png"
                alt="MediVision Dashboard"
                className="w-full h-auto rounded-lg"
              />
            </div>
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 bg-card rounded-xl shadow-xl border border-border/50 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Analysis Complete</p>
                  <p className="text-sm font-bold text-foreground">98.5% Accuracy</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 p-4 bg-card rounded-xl shadow-xl border border-border/50 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Model Status</p>
                  <p className="text-sm font-bold text-foreground">Active & Ready</p>
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
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Streamlined Workflow</h2>
            <p className="text-lg text-muted-foreground">
              From upload to diagnosis in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            {[
              { icon: Upload, title: 'Upload Scan', desc: 'Securely upload high-res X-ray images.' },
              { icon: Zap, title: 'AI Analysis', desc: 'Advanced algorithms process the image.' },
              { icon: UserCheck, title: 'Review', desc: 'Expert verification of AI findings.' },
              { icon: Files, title: 'Report', desc: 'Download comprehensive PDF report.' }
            ].map((item, index, arr) => (
              <div key={index} className="relative flex flex-col items-center text-center bg-background p-4">
                <div className="w-24 h-24 rounded-full bg-card border border-border shadow-lg flex items-center justify-center mb-6 z-10 relative group hover:border-primary/50 transition-colors">
                  <item.icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                {/* Arrow connector between steps */}
                {index < arr.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-4 transform translate-x-1/2 z-20">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" /> {/** Placeholder for pattern */}

        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 tracking-tight max-w-3xl mx-auto leading-tight">
            Ready to experience the future <span className="text-primary">of medical imaging?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Join thousands of medical professionals using MediVision to enhance their diagnostic capabilities.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 px-4">
            <Button asChild size="lg" className="h-12 md:h-14 px-6 md:px-10 text-base md:text-lg rounded-full shadow-lg shadow-primary/20 w-full md:w-auto">
              <Link to="/register">
                Create Free Account
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 md:h-14 px-6 md:px-10 text-base md:text-lg rounded-full w-full md:w-auto">
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
