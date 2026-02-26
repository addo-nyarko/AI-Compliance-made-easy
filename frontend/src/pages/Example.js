import React from 'react';
import { Link } from 'react-router-dom';
import { getBucketClasses, getPriorityClasses, getEffortClasses, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    AlertTriangle, CheckCircle, HelpCircle, ArrowLeft, Shield,
    Lightbulb, ListChecks, Calculator, MessageSquare, ChevronRight,
    FileCheck, BarChart, FileText, Users
} from 'lucide-react';

// Example data for demonstration
const exampleData = {
    project: {
        name: 'HR AI Assistant',
        org_name: 'TechStartup GmbH',
        created_at: '2025-01-15T10:30:00Z'
    },
    classification: {
        bucket: 'High-risk',
        confidence: 'High',
        plain_language_summary: `Based on your inputs, this AI system likely falls into the high-risk category under the EU AI Act. High-risk systems in HR and hiring require conformity assessment, registration in the EU database, quality management systems, and ongoing monitoring. This does not mean you cannot use the system—it means specific compliance steps are required.`,
        decisive_factors: [
            {
                questionId: 'q3_domain',
                answer: 'hiring_hr',
                reason: "AI systems used in employment for recruitment, screening, filtering applications, or evaluating candidates are classified as high-risk under Annex III."
            },
            {
                questionId: 'q4_decision_impact',
                answer: 'significant_impact',
                reason: "The system makes decisions with significant impact on individuals, which triggers high-risk classification when combined with HR domain."
            },
            {
                questionId: 'q8_human_oversight',
                answer: 'human_reviews',
                reason: "Human review before action is present, which is a positive factor but doesn't remove high-risk classification for HR systems."
            }
        ],
        assumptions: [
            'Domain: HR/Hiring domain',
            'You integrate third-party AI (deployer obligations may apply)',
            'Classification based on answers provided; actual classification may differ with more context'
        ],
        missing_info: [],
        what_changes_outcome: [
            'If human oversight is added before all decisions, some obligations may be simplified',
            'If impact on individuals is reduced, may be reclassified as limited risk'
        ]
    },
    roadmap: [
        {
            id: 'gov_register',
            title: 'Create an AI Use-Case Register',
            theme: 'Governance basics',
            why: 'You need a single source of truth for all AI systems in your organization. This is foundational for any compliance effort and required for high-risk systems.',
            checklist: [
                'List all AI tools and systems currently in use',
                'Document the purpose and owner for each system',
                'Note vendor names and contract details for third-party AI',
                'Record deployment dates and user counts',
                'Identify which systems process personal data'
            ],
            deliverable: 'AI Use-Case Register (spreadsheet or database)',
            owner: 'Product / Engineering',
            effort: 'S',
            priority: 'P0',
            is_top_5: true,
            order: 1
        },
        {
            id: 'data_inventory',
            title: 'Map Data Flows for AI Systems',
            theme: 'Data & privacy',
            why: 'Understanding what data your AI processes is essential for both AI Act and GDPR compliance. High-risk systems have specific data governance requirements.',
            checklist: [
                'Document input data types for each AI system',
                'Identify personal data being processed',
                'Note data retention periods',
                'Map data flows (collection → processing → storage → deletion)',
                'Flag any sensitive/special category data'
            ],
            deliverable: 'AI Data Flow Diagram + Data Inventory',
            owner: 'Engineering',
            effort: 'M',
            priority: 'P0',
            is_top_5: true,
            order: 2
        },
        {
            id: 'data_lawful_basis',
            title: 'Confirm GDPR Lawful Basis for AI Processing',
            theme: 'Data & privacy',
            why: 'AI processing of personal data requires a valid GDPR lawful basis. This is foundational—without it, the AI use may be unlawful regardless of AI Act compliance.',
            checklist: [
                'Identify lawful basis for each AI system processing personal data',
                'Document justification for chosen basis',
                'Update privacy notices if needed',
                'Review consent mechanisms if relying on consent'
            ],
            deliverable: 'Lawful Basis Register (extension of AI Use-Case Register)',
            owner: 'Legal / Compliance',
            effort: 'M',
            priority: 'P0',
            is_top_5: true,
            order: 3
        },
        {
            id: 'oversight_design',
            title: 'Design Human Oversight Mechanisms',
            theme: 'Human oversight',
            why: 'High-risk AI must enable effective human oversight. This means designing systems so humans can intervene, not just observe.',
            checklist: [
                'Define what decisions require human review',
                'Design intervention points in AI workflow',
                'Create override/stop mechanisms',
                'Document how humans will be notified of AI decisions'
            ],
            deliverable: 'Human Oversight Design Document + Training Materials',
            owner: 'Product / Engineering',
            effort: 'M',
            priority: 'P0',
            is_top_5: true,
            order: 4
        },
        {
            id: 'vendor_inventory',
            title: 'Create Third-Party AI Vendor Inventory',
            theme: 'Vendor management',
            why: 'If you use third-party AI (like OpenAI, cloud ML services), you\'re still responsible for compliance. You need to know what you\'re using.',
            checklist: [
                'List all third-party AI services and APIs',
                'Document what each vendor provides',
                'Record contract terms and data processing agreements',
                'Note vendor compliance certifications'
            ],
            deliverable: 'Third-Party AI Vendor Register',
            owner: 'Product / Legal',
            effort: 'S',
            priority: 'P0',
            is_top_5: true,
            order: 5
        }
    ],
    estimator: {
        min: 75000,
        max: 350000,
        currency: 'EUR',
        tier: 'B',
        assumptions: [
            'Annual turnover: EUR 5,000,000',
            'Penalty tier: B (High-risk system violations)',
            'Percentage range: 1.5% - 7%'
        ]
    }
};

function Example() {
    const { classification, roadmap, estimator, project } = exampleData;
    const top5Tasks = roadmap.filter(t => t.is_top_5);
    
    return (
        <div className="min-h-screen bg-background">
            {/* Simple navbar for example page */}
            <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="flex items-center gap-2.5" data-testid="example-logo">
                            <div className="h-8 w-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">K</span>
                            </div>
                            <span className="font-semibold text-[#1E3A5F] tracking-tight">KODEX Compliance</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild data-testid="example-back">
                                <Link to="/">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Link>
                            </Button>
                            <Button size="sm" asChild data-testid="example-try-scan">
                                <Link to="/scan">Try Your Own Scan</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8">
                    <Badge variant="outline" className="mb-4">Example Assessment</Badge>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2" data-testid="example-title">
                        Sample Results: {project.name}
                    </h1>
                    <p className="text-muted-foreground">
                        This is an example of what your assessment results look like. 
                        The data shown is fictional and for demonstration purposes only.
                    </p>
                </div>
                
                {/* Summary Card */}
                <Card className="mb-8" data-testid="example-summary">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${getBucketClasses(classification.bucket)}`}>
                                <AlertTriangle className="h-8 w-8" />
                                <div>
                                    <div className="font-heading font-bold text-lg">{classification.bucket}</div>
                                    <div className="text-sm font-medium text-orange-600">
                                        {classification.confidence} confidence
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-foreground leading-relaxed">
                                    {classification.plain_language_summary}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Disclaimer */}
                <Alert className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Example Data — Not Real</AlertTitle>
                    <AlertDescription>
                        This is a demonstration with fictional data. Your actual assessment will be based on your specific inputs. 
                        Educational information only — not legal advice.
                    </AlertDescription>
                </Alert>
                
                {/* Tabs */}
                <Tabs defaultValue="why" className="mb-8" data-testid="example-tabs">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                        <TabsTrigger value="why" className="py-2">
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Why This Result
                        </TabsTrigger>
                        <TabsTrigger value="roadmap" className="py-2">
                            <ListChecks className="mr-2 h-4 w-4" />
                            Roadmap
                        </TabsTrigger>
                        <TabsTrigger value="exposure" className="py-2">
                            <Calculator className="mr-2 h-4 w-4" />
                            Fine Exposure
                        </TabsTrigger>
                        <TabsTrigger value="counsel" className="py-2">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Ask Counsel
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Why This Result */}
                    <TabsContent value="why" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ChevronRight className="h-5 w-5 text-primary" />
                                    Decisive Factors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {classification.decisive_factors.map((factor, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-primary">{index + 1}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{factor.reason}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Your answer: <code className="bg-muted px-1 rounded">{factor.answer}</code>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileCheck className="h-5 w-5 text-primary" />
                                    Assumptions Made
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {classification.assumptions.map((assumption, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{assumption}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart className="h-5 w-5 text-primary" />
                                    What Would Change the Outcome
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {classification.what_changes_outcome.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Roadmap */}
                    <TabsContent value="roadmap" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Top 5 Priority Actions</CardTitle>
                                <CardDescription>Start with these high-impact tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {top5Tasks.map((task, index) => (
                                        <div key={task.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                            {index + 1}
                                                        </span>
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        <Badge className={getPriorityClasses(task.priority)}>{task.priority}</Badge>
                                                        <Badge variant="outline" className={getEffortClasses(task.effort)}>
                                                            {task.effort === 'S' ? 'Small' : task.effort === 'M' ? 'Medium' : 'Large'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{task.why}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <FileText className="h-4 w-4" />
                                                            {task.deliverable}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Users className="h-4 w-4" />
                                                            {task.owner}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Fine Exposure */}
                    <TabsContent value="exposure" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    Fine Exposure Simulation
                                </CardTitle>
                                <CardDescription>
                                    Theoretical penalty range based on example settings. This is for prioritization — not a legal determination.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="p-6 bg-muted/50 rounded-lg text-center">
                                        <p className="text-sm text-muted-foreground mb-2">Theoretical Exposure Range</p>
                                        <div className="text-3xl font-heading font-bold text-foreground">
                                            {formatCurrency(estimator.min, estimator.currency)} — {formatCurrency(estimator.max, estimator.currency)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Based on tier {estimator.tier} parameters
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium mb-2">Assumptions used:</h4>
                                        <ul className="space-y-1">
                                            {estimator.assumptions.map((a, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    {a}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Questions for Counsel */}
                    <TabsContent value="counsel" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Questions to Ask Legal Counsel
                                </CardTitle>
                                <CardDescription>
                                    Based on a high-risk HR classification, consider discussing these points with a qualified attorney
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-lg">
                                        <p className="font-medium">What conformity assessment procedure applies to our system?</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="font-medium">Do we need to register in the EU AI database, and when?</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="font-medium">What documentation do we need to prepare for potential audits?</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="font-medium">How should we structure our quality management system?</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                
                {/* CTA */}
                <Card className="bg-[#1E3A5F]/5 border-[#1E3A5F]/20">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="font-semibold text-xl text-[#1E3A5F] mb-2">Ready to assess your own AI system?</h3>
                            <p className="text-slate-600 mb-4">
                                Run the 3-minute scan to get your personalized classification and roadmap.
                            </p>
                            <Button size="lg" asChild data-testid="example-cta" className="bg-[#1E3A5F] hover:bg-[#2D4A6F]">
                                <Link to="/scan">Start Your Free Assessment</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Example;
