import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Activity,
  FileImage,
  Stethoscope,
  MessageSquare,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Upload,
  Brain,
  ClipboardList,
} from 'lucide-react';

const features = [
  {
    icon: FileImage,
    title: 'X-Ray Analysis',
    description: 'Upload chest X-ray images and receive AI-powered analysis for COVID-19, Pneumonia, Lung Opacity, or Normal classification.',
  },
  {
    icon: Stethoscope,
    title: 'Symptom Checker',
    description: 'Input symptoms and receive supportive diagnostic insights based on established medical knowledge.',
  },
  {
    icon: MessageSquare,
    title: 'AI Medical Assistant',
    description: 'Chat with our AI to understand results, ask questions, and get general medical precautions explained.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your medical data is encrypted and protected with enterprise-grade security standards.',
  },
];

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload or Input',
    description: 'Upload a chest X-ray image or enter your symptoms into the system.',
  },
  {
    icon: Brain,
    step: '02',
    title: 'AI Analysis',
    description: 'Our CNN-based model analyzes the data and generates predictions with confidence scores.',
  },
  {
    icon: ClipboardList,
    step: '03',
    title: 'Review Results',
    description: 'View detailed results with explanations and chat with AI for clarifications.',
  },
];

const stats = [
  { value: '98%', label: 'Accuracy Rate' },
  { value: '10K+', label: 'Scans Analyzed' },
  { value: '500+', label: 'Healthcare Users' },
  { value: '24/7', label: 'Available' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="badge-medical mb-6 mx-auto w-fit animate-fade-in">
              <Activity className="h-4 w-4" />
              AI-Powered Medical Decision Support
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 animate-slide-up">
              Intelligent Chest Disease Detection
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              MediVision Buddy combines advanced AI with medical expertise to help healthcare professionals 
              and students analyze chest X-rays and symptoms with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 mt-16">
          <div className="glass rounded-2xl p-6 max-w-3xl mx-auto animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Powerful Features for Medical Professionals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to enhance your diagnostic workflow with AI-powered insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-medical p-6 group"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How MediVision Buddy Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, intuitive, and designed for healthcare workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="card-medical p-8 text-center h-full">
                  <div className="text-5xl font-bold text-accent/20 mb-4">{step.step}</div>
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Designed for Healthcare Excellence
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                MediVision Buddy empowers healthcare professionals with AI-driven insights 
                while maintaining the highest standards of accuracy and privacy.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time X-ray analysis with confidence scores',
                  'Comprehensive symptom evaluation',
                  'Educational AI explanations',
                  'HIPAA-compliant data handling',
                  'Continuous model improvements',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button variant="medical" size="lg" className="mt-8" asChild>
                <Link to="/register">
                  Start Analyzing Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="card-medical p-4 text-center">
                    <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
                    <div className="text-sm font-medium">Fast Results</div>
                  </div>
                  <div className="card-medical p-4 text-center">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium">Secure</div>
                  </div>
                  <div className="card-medical p-4 text-center">
                    <Brain className="h-8 w-8 text-accent mx-auto mb-2" />
                    <div className="text-sm font-medium">AI-Powered</div>
                  </div>
                  <div className="card-medical p-4 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium">Collaborative</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Enhance Your Diagnostic Workflow?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join healthcare professionals who are already using MediVision Buddy 
            to support their medical decisions.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/register">
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
