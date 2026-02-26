import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
    FileSearch, Route, Download, Eye, MessageSquare, Users,
    CheckCircle, ArrowRight, ChevronRight, Sparkles, Shield,
    FileText, BarChart3, Clock, Zap, Menu, X
} from 'lucide-react';

function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [introComplete, setIntroComplete] = useState(false);
    const [introPhase, setIntroPhase] = useState('visible'); // 'visible', 'shrinking', 'done'

    useEffect(() => {
        // Check if intro was already shown this session
        const introShown = sessionStorage.getItem('kodex_intro_shown');
        if (introShown) {
            setIntroComplete(true);
            setIntroPhase('done');
            return;
        }

        // Start shrinking after 1.5 seconds
        const shrinkTimer = setTimeout(() => {
            setIntroPhase('shrinking');
        }, 1500);

        // Complete intro after animation
        const completeTimer = setTimeout(() => {
            setIntroPhase('done');
            setIntroComplete(true);
            sessionStorage.setItem('kodex_intro_shown', 'true');
        }, 2500);

        return () => {
            clearTimeout(shrinkTimer);
            clearTimeout(completeTimer);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Intro Animation Overlay */}
            {!introComplete && (
                <div 
                    className={`fixed inset-0 z-[100] bg-[#FAFAFA] flex items-center justify-center transition-opacity duration-500 ${
                        introPhase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                >
                    <div 
                        className={`flex items-center gap-4 transition-all duration-1000 ease-out ${
                            introPhase === 'shrinking' 
                                ? 'scale-[0.15] -translate-y-[45vh] opacity-0' 
                                : 'scale-100 translate-y-0 opacity-100'
                        }`}
                    >
                        <div className={`rounded-2xl bg-[#1E3A5F] flex items-center justify-center transition-all duration-1000 ${
                            introPhase === 'shrinking' ? 'h-8 w-8' : 'h-24 w-24'
                        }`}>
                            <span className={`text-white font-bold transition-all duration-1000 ${
                                introPhase === 'shrinking' ? 'text-sm' : 'text-5xl'
                            }`}>K</span>
                        </div>
                        <span className={`font-semibold text-[#1E3A5F] tracking-tight transition-all duration-1000 ${
                            introPhase === 'shrinking' ? 'text-lg' : 'text-6xl sm:text-7xl md:text-8xl'
                        }`}>
                            KODEX Compliance
                        </span>
                    </div>
                </div>
            )}

            {/* Sticky Header */}
            <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 transition-opacity duration-500 ${
                introComplete ? 'opacity-100' : 'opacity-0'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5" data-testid="landing-logo">
                            <div className="h-8 w-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">K</span>
                            </div>
                            <span className="font-semibold text-[#1E3A5F] text-lg tracking-tight">KODEX Compliance</span>
                        </Link>
                        
                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-[#1E3A5F] transition-colors">
                                How it works
                            </a>
                            <a href="#features" className="text-sm text-slate-600 hover:text-[#1E3A5F] transition-colors">
                                Product
                            </a>
                            <a href="#pricing" className="text-sm text-slate-600 hover:text-[#1E3A5F] transition-colors">
                                Pricing
                            </a>
                            <a href="#faq" className="text-sm text-slate-600 hover:text-[#1E3A5F] transition-colors">
                                Resources
                            </a>
                        </nav>
                        
                        {/* CTA */}
                        <div className="flex items-center gap-3">
                            <Button 
                                asChild 
                                className="hidden sm:inline-flex bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white rounded-md px-5"
                                data-testid="header-cta"
                            >
                                <Link to="/scan">Run 3-minute scan</Link>
                            </Button>
                            
                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-100">
                            <nav className="flex flex-col gap-3">
                                <a href="#how-it-works" className="px-2 py-2 text-sm text-slate-600 hover:text-[#1E3A5F]" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                                <a href="#features" className="px-2 py-2 text-sm text-slate-600 hover:text-[#1E3A5F]" onClick={() => setMobileMenuOpen(false)}>Product</a>
                                <a href="#pricing" className="px-2 py-2 text-sm text-slate-600 hover:text-[#1E3A5F]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                                <a href="#faq" className="px-2 py-2 text-sm text-slate-600 hover:text-[#1E3A5F]" onClick={() => setMobileMenuOpen(false)}>Resources</a>
                                <Button asChild className="mt-2 bg-[#1E3A5F] hover:bg-[#2D4A6F]">
                                    <Link to="/scan">Run 3-minute scan</Link>
                                </Button>
                            </nav>
                        </div>
                    )}
                </div>
            </header>
            
            {/* Main Content - fades in after intro */}
            <div className={`transition-opacity duration-700 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E3A5F' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                    
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left: Copy */}
                            <div className="max-w-xl">
                                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold text-[#1E3A5F] leading-[1.15] tracking-tight mb-6" data-testid="hero-headline">
                                    3-minute AI Act risk scan for EU SMBs
                                </h1>
                                <p className="text-lg text-slate-600 leading-relaxed mb-8" data-testid="hero-subhead">
                                    Get a clear risk bucket, a practical roadmap, and an exportable summary. Educational only — not legal advice.
                                </p>
                                
                                {/* CTAs */}
                                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                    <Button 
                                        size="lg" 
                                        asChild 
                                        className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white rounded-md px-8 h-12 text-base"
                                        data-testid="hero-cta-primary"
                                    >
                                        <Link to="/scan">
                                            Run the scan
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        asChild 
                                        className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md px-8 h-12 text-base"
                                        data-testid="hero-cta-secondary"
                                    >
                                        <Link to="/example">View example</Link>
                                    </Button>
                                </div>
                                
                                {/* Trust bullets */}
                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle className="h-4 w-4 text-[#0D9488]" />
                                        EU AI Act + GDPR focus
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle className="h-4 w-4 text-[#0D9488]" />
                                        Plain-language outputs
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle className="h-4 w-4 text-[#0D9488]" />
                                        No heavy setup
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right: Product Mock */}
                            <div className="relative lg:pl-8">
                                <div className="relative">
                                    {/* Main card */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 space-y-5">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assessment Result</span>
                                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                                                High-risk
                                            </Badge>
                                        </div>
                                        
                                        {/* Confidence */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full w-[85%] bg-[#0D9488] rounded-full" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">85% confidence</span>
                                        </div>
                                        
                                        {/* Decisive factors */}
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Top Decisive Factors</p>
                                            <div className="space-y-2">
                                                {[
                                                    'HR recruitment domain (Annex III)',
                                                    'Significant impact on individuals',
                                                    'Processing of personal data'
                                                ].map((factor, i) => (
                                                    <div key={i} className="flex items-start gap-2.5">
                                                        <div className="h-5 w-5 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-xs font-semibold text-[#1E3A5F]">{i + 1}</span>
                                                        </div>
                                                        <span className="text-sm text-slate-700">{factor}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Top actions */}
                                        <div className="pt-3 border-t border-slate-100">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Top 5 Actions</p>
                                            <div className="space-y-2">
                                                {[
                                                    'Create AI Use-Case Register',
                                                    'Map Data Flows',
                                                    'Confirm GDPR Lawful Basis',
                                                    'Design Human Oversight',
                                                    'Vendor Inventory'
                                                ].map((action, i) => (
                                                    <div key={i} className="flex items-center gap-2.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
                                                        <span className="text-sm text-slate-600">{action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Floating card accent */}
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#0D9488]/10 rounded-xl -z-10" />
                                    <div className="absolute -top-3 -left-3 w-16 h-16 bg-[#1E3A5F]/5 rounded-lg -z-10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* How it works */}
                <section id="how-it-works" className="py-20 md:py-28 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E3A5F] mb-4">How it works</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Three simple steps to understand your AI compliance posture
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                            {[
                                {
                                    step: '01',
                                    title: 'Answer ~10 questions',
                                    description: 'Quick questions about your AI system, its domain, data use, and human oversight. Takes about 3 minutes.',
                                    icon: FileText
                                },
                                {
                                    step: '02',
                                    title: 'Get your risk bucket',
                                    description: 'Receive a clear classification with confidence level, assumptions made, and what factors drove the result.',
                                    icon: BarChart3
                                },
                                {
                                    step: '03',
                                    title: 'Get a prioritized roadmap',
                                    description: 'Download a practical action list with checklists, owners, and deliverables tailored to your situation.',
                                    icon: Route
                                }
                            ].map((item, index) => (
                                <div key={index} className="relative">
                                    {/* Connector line */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
                                    )}
                                    
                                    <div className="relative bg-[#FAFAFA] rounded-xl p-8 border border-slate-100">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="h-12 w-12 rounded-lg bg-[#1E3A5F]/5 flex items-center justify-center">
                                                <item.icon className="h-6 w-6 text-[#1E3A5F]" strokeWidth={1.5} />
                                            </div>
                                            <span className="text-4xl font-light text-slate-300">{item.step}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">{item.title}</h3>
                                        <p className="text-slate-600 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Features Grid */}
                <section id="features" className="py-20 md:py-28 bg-[#FAFAFA]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E3A5F] mb-4">What you get</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Everything you need to understand and act on your AI compliance requirements
                            </p>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: FileSearch,
                                    title: 'Risk Scanner',
                                    description: 'Deterministic classification into Prohibited, High-risk, Limited, or Minimal risk buckets.'
                                },
                                {
                                    icon: Route,
                                    title: 'Roadmap Generator',
                                    description: 'Prioritized action list with checklists, deliverables, and suggested owners for each task.'
                                },
                                {
                                    icon: Download,
                                    title: 'Exportable Summary',
                                    description: 'Print-friendly PDF export with all results, assumptions, and recommendations.'
                                },
                                {
                                    icon: Eye,
                                    title: 'Full Transparency',
                                    description: 'See exactly why you got your classification, what we assumed, and what would change it.'
                                },
                                {
                                    icon: MessageSquare,
                                    title: 'Plain Language',
                                    description: 'No legal jargon. Clear explanations written for founders and product teams.'
                                },
                                {
                                    icon: Users,
                                    title: 'Project History',
                                    description: 'Track assessments over time, compare versions, and manage multiple AI systems.'
                                }
                            ].map((feature, index) => (
                                <Card key={index} className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                                    <CardContent className="pt-6">
                                        <div className="h-10 w-10 rounded-lg bg-[#0D9488]/10 flex items-center justify-center mb-4">
                                            <feature.icon className="h-5 w-5 text-[#0D9488]" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-semibold text-[#1E3A5F] mb-2">{feature.title}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Pricing */}
                <section id="pricing" className="py-20 md:py-28 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E3A5F] mb-4">Simple pricing</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Choose the plan that fits your team
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Starter */}
                            <Card className="border-slate-200 relative">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl text-[#1E3A5F]">Starter</CardTitle>
                                    <CardDescription>For small teams getting started</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <span className="text-4xl font-semibold text-[#1E3A5F]">€99</span>
                                        <span className="text-slate-500">/month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Up to 5 projects',
                                            'Unlimited assessments',
                                            'PDF exports',
                                            'Email support'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                                                <CheckCircle className="h-4 w-4 text-[#0D9488]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="outline" className="w-full border-slate-300" asChild>
                                        <Link to="/scan">Get started</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                            
                            {/* Pro */}
                            <Card className="border-[#1E3A5F] border-2 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]">Most popular</Badge>
                                </div>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl text-[#1E3A5F]">Pro</CardTitle>
                                    <CardDescription>For growing companies</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <span className="text-4xl font-semibold text-[#1E3A5F]">€299</span>
                                        <span className="text-slate-500">/month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Unlimited projects',
                                            'Unlimited assessments',
                                            'PDF & branded exports',
                                            'Priority support',
                                            'Team collaboration',
                                            'API access'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                                                <CheckCircle className="h-4 w-4 text-[#0D9488]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-[#1E3A5F] hover:bg-[#2D4A6F]" asChild>
                                        <Link to="/scan">Get started</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
                
                {/* FAQ */}
                <section id="faq" className="py-20 md:py-28 bg-[#FAFAFA]">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E3A5F] mb-4">Frequently asked questions</h2>
                        </div>
                        
                        <Accordion type="single" collapsible className="space-y-3">
                            {[
                                {
                                    q: 'Is this legal advice?',
                                    a: 'No. KODEX Compliance provides educational information to help you understand the EU AI Act and GDPR requirements. Our classifications and recommendations are based on your inputs and general interpretations. Always consult qualified legal counsel for compliance decisions.'
                                },
                                {
                                    q: 'How accurate is the classification?',
                                    a: 'Our classification engine uses deterministic rules based on the EU AI Act text. We show you exactly which factors drove your result and what assumptions we made. Accuracy depends on the completeness and accuracy of your answers.'
                                },
                                {
                                    q: 'Do I need to integrate with other tools?',
                                    a: 'No integrations required. KODEX is a standalone tool. Answer the questions, get your results, and export them. Pro plans include API access if you want to integrate with your existing workflows.'
                                },
                                {
                                    q: 'What data do you store?',
                                    a: 'We store your assessment answers and results to enable project history and exports. We do not share your data with third parties. You can delete your data at any time from your account settings.'
                                },
                                {
                                    q: 'Can I export and share results?',
                                    a: 'Yes. Every assessment can be exported as a print-friendly summary. Use your browser\'s print function to save as PDF. Pro plans include branded exports with your company logo.'
                                }
                            ].map((item, index) => (
                                <AccordionItem 
                                    key={index} 
                                    value={`item-${index}`}
                                    className="bg-white border border-slate-200 rounded-lg px-6 data-[state=open]:border-slate-300"
                                >
                                    <AccordionTrigger className="text-left font-medium text-[#1E3A5F] hover:no-underline py-5">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
                
                {/* Final CTA */}
                <section className="py-20 md:py-24 bg-[#1E3A5F]">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                            Ready to understand your AI risk?
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                            Answer 10 questions and get clarity in under 3 minutes. No signup required to start.
                        </p>
                        <Button 
                            size="lg" 
                            asChild 
                            className="bg-white text-[#1E3A5F] hover:bg-slate-100 rounded-md px-8 h-12 text-base"
                        >
                            <Link to="/scan">
                                Run your free scan
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </section>
                
                {/* Footer */}
                <footer className="py-12 bg-white border-t border-slate-200">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Logo */}
                            <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-md bg-[#1E3A5F] flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">K</span>
                                </div>
                                <span className="font-medium text-slate-700">KODEX Compliance</span>
                            </div>
                            
                            {/* Links */}
                            <div className="flex items-center gap-8 text-sm">
                                <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Privacy</a>
                                <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Terms</a>
                                <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Contact</a>
                            </div>
                        </div>
                        
                        {/* Disclaimer */}
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">
                                Educational information only — not legal advice. Consult qualified counsel for compliance decisions.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default Landing;
