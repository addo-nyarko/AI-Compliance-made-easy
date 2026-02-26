import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assessmentsAPI, settingsAPI, estimatorAPI } from '@/lib/api';
import { getBucketClasses, getConfidenceClasses, getPriorityClasses, getEffortClasses, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    AlertTriangle, CheckCircle, HelpCircle, Ban, FileText, Download, 
    ChevronRight, Lightbulb, ListChecks, Calculator, MessageSquare,
    Users, Code, FileCheck, Eye, BarChart, Building2, Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Bucket icon mapping
const bucketIcons = {
    'Prohibited': Ban,
    'High-risk': AlertTriangle,
    'Limited risk': HelpCircle,
    'Minimal risk': CheckCircle,
    'Needs clarification': HelpCircle
};

function Results() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [settings, setSettings] = useState(null);
    const [estimatorResult, setEstimatorResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const [assessmentData, settingsData] = await Promise.all([
                    assessmentsAPI.get(id),
                    settingsAPI.get()
                ]);
                setAssessment(assessmentData);
                setSettings(settingsData);
                
                // Calculate fine exposure if turnover is set
                if (settingsData.default_turnover && assessmentData.classification_json?.bucket) {
                    const estimate = await estimatorAPI.calculate({
                        classification_bucket: assessmentData.classification_json.bucket,
                        turnover: settingsData.default_turnover,
                        currency: settingsData.currency,
                        tier_parameters: settingsData.tier_parameters
                    });
                    setEstimatorResult(estimate);
                }
            } catch (err) {
                setError('Failed to load assessment');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [id]);
    
    if (loading) {
        return <ResultsSkeleton />;
    }
    
    if (error || !assessment) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || 'Assessment not found'}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const { classification_json: classification, roadmap_json: roadmap } = assessment;
    const BucketIcon = bucketIcons[classification?.bucket] || HelpCircle;
    
    // Group roadmap by theme
    const roadmapByTheme = roadmap?.reduce((acc, task) => {
        const theme = task.theme || 'Other';
        if (!acc[theme]) acc[theme] = [];
        acc[theme].push(task);
        return acc;
    }, {}) || {};
    
    const top5Tasks = roadmap?.filter(t => t.is_top_5) || [];
    
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2" data-testid="results-title">
                        Assessment Results
                    </h1>
                    <p className="text-muted-foreground">
                        Version {assessment.version} • Created {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild data-testid="export-btn">
                        <Link to={`/export/${id}`}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Link>
                    </Button>
                </div>
            </div>
            
            {/* Summary Card */}
            <Card className="mb-8" data-testid="summary-card">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Bucket Badge */}
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${getBucketClasses(classification?.bucket)}`} data-testid="bucket-badge">
                            <BucketIcon className="h-8 w-8" />
                            <div>
                                <div className="font-heading font-bold text-lg">{classification?.bucket}</div>
                                <div className={`text-sm font-medium ${getConfidenceClasses(classification?.confidence)}`}>
                                    {classification?.confidence} confidence
                                </div>
                            </div>
                        </div>
                        
                        {/* Summary */}
                        <div className="flex-1">
                            <p className="text-foreground leading-relaxed" data-testid="summary-text">
                                {classification?.plain_language_summary}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Disclaimer */}
            <Alert className="mb-8" data-testid="disclaimer-alert">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Educational information only — not legal advice</AlertTitle>
                <AlertDescription>
                    {settings?.disclaimer_text || 'This classification is based on your inputs and general interpretation of the EU AI Act. Consult qualified legal counsel for compliance decisions.'}
                </AlertDescription>
            </Alert>
            
            {/* Main Content Tabs */}
            <Tabs defaultValue="why" className="mb-8" data-testid="results-tabs">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                    <TabsTrigger value="why" className="py-2" data-testid="tab-why">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Why This Result
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="py-2" data-testid="tab-roadmap">
                        <ListChecks className="mr-2 h-4 w-4" />
                        Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="exposure" className="py-2" data-testid="tab-exposure">
                        <Calculator className="mr-2 h-4 w-4" />
                        Fine Exposure
                    </TabsTrigger>
                    <TabsTrigger value="counsel" className="py-2" data-testid="tab-counsel">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Ask Counsel
                    </TabsTrigger>
                </TabsList>
                
                {/* Why This Result */}
                <TabsContent value="why" className="mt-6 space-y-6">
                    {/* Decisive Factors */}
                    <Card data-testid="decisive-factors-card">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ChevronRight className="h-5 w-5 text-primary" />
                                Decisive Factors
                            </CardTitle>
                            <CardDescription>The top factors that determined your classification</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classification?.decisive_factors?.length > 0 ? (
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
                            ) : (
                                <p className="text-muted-foreground">No decisive factors identified.</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Assumptions */}
                    <Card data-testid="assumptions-card">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-primary" />
                                Assumptions Made
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classification?.assumptions?.length > 0 ? (
                                <ul className="space-y-2">
                                    {classification.assumptions.map((assumption, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{assumption}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No assumptions documented.</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Missing Info */}
                    {classification?.missing_info?.length > 0 && (
                        <Card className="border-amber-200 dark:border-amber-900" data-testid="missing-info-card">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                    <HelpCircle className="h-5 w-5" />
                                    Missing Information
                                </CardTitle>
                                <CardDescription>Answering these questions could change your classification</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {classification.missing_info.map((info, index) => (
                                        <div key={index} className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                            <p className="font-medium text-amber-800 dark:text-amber-200">{info.label}</p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{info.whyItMatters}</p>
                                            <p className="text-sm font-medium mt-2">
                                                Follow-up: {info.followUpQuestion}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* What Changes Outcome */}
                    <Card data-testid="what-changes-card">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-primary" />
                                What Would Change the Outcome
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classification?.what_changes_outcome?.length > 0 ? (
                                <ul className="space-y-2">
                                    {classification.what_changes_outcome.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No changes identified.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Roadmap */}
                <TabsContent value="roadmap" className="mt-6 space-y-6">
                    {/* Top 5 */}
                    <Card data-testid="top5-tasks-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Top 5 Priority Actions</CardTitle>
                            <CardDescription>Start with these high-impact tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {top5Tasks.map((task, index) => (
                                    <TaskCard key={task.id} task={task} index={index + 1} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Full Roadmap by Theme */}
                    <Card data-testid="full-roadmap-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Full Roadmap</CardTitle>
                            <CardDescription>All recommended tasks grouped by theme</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                {Object.entries(roadmapByTheme).map(([theme, tasks]) => (
                                    <AccordionItem key={theme} value={theme}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <ThemeIcon theme={theme} />
                                                <span>{theme}</span>
                                                <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                {tasks.map((task) => (
                                                    <TaskCard key={task.id} task={task} compact />
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Fine Exposure */}
                <TabsContent value="exposure" className="mt-6">
                    <Card data-testid="exposure-card">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                Fine Exposure Simulation
                            </CardTitle>
                            <CardDescription>
                                Theoretical penalty range based on your settings. This is a simulation for prioritization — not a legal determination.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {estimatorResult && !estimatorResult.error ? (
                                <div className="space-y-6">
                                    {/* Range display */}
                                    <div className="p-6 bg-muted/50 rounded-lg text-center">
                                        <p className="text-sm text-muted-foreground mb-2">Theoretical Exposure Range</p>
                                        <div className="text-3xl font-heading font-bold text-foreground">
                                            {formatCurrency(estimatorResult.min, estimatorResult.currency)} — {formatCurrency(estimatorResult.max, estimatorResult.currency)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Based on tier {estimatorResult.tier} parameters
                                        </p>
                                    </div>
                                    
                                    {/* Assumptions */}
                                    <div>
                                        <h4 className="font-medium mb-2">Assumptions used:</h4>
                                        <ul className="space-y-1">
                                            {estimatorResult.assumptions.map((a, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    {a}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <Button variant="outline" asChild data-testid="edit-assumptions-btn">
                                        <Link to="/settings">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Edit Assumptions in Settings
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">
                                        {estimatorResult?.error || 'Set your turnover and penalty assumptions to run the simulation.'}
                                    </p>
                                    <Button asChild data-testid="configure-estimator-btn">
                                        <Link to="/settings">Configure in Settings</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Questions for Counsel */}
                <TabsContent value="counsel" className="mt-6">
                    <Card data-testid="counsel-card">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Questions to Ask Legal Counsel
                            </CardTitle>
                            <CardDescription>
                                Based on your assessment, consider discussing these points with a qualified attorney
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Generated from missing info and high-impact uncertainties */}
                                {classification?.missing_info?.map((info, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <p className="font-medium">{info.followUpQuestion}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Why this matters: {info.whyItMatters}
                                        </p>
                                    </div>
                                ))}
                                
                                {/* Standard questions based on bucket */}
                                <CounselQuestions bucket={classification?.bucket} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Task card component
function TaskCard({ task, index, compact = false }) {
    return (
        <div className={`border rounded-lg ${compact ? 'p-3' : 'p-4'}`} data-testid={`task-${task.id}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {index && (
                            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {index}
                            </span>
                        )}
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={getPriorityClasses(task.priority)}>{task.priority}</Badge>
                        <Badge variant="outline" className={getEffortClasses(task.effort)}>
                            {task.effort === 'S' ? 'Small' : task.effort === 'M' ? 'Medium' : 'Large'}
                        </Badge>
                    </div>
                    
                    {!compact && (
                        <>
                            <p className="text-sm text-muted-foreground mt-2">{task.why}</p>
                            
                            {/* Checklist */}
                            <div className="mt-3">
                                <p className="text-sm font-medium mb-2">Checklist:</p>
                                <ul className="space-y-1">
                                    {task.checklist?.slice(0, 5).map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Theme icon mapping
function ThemeIcon({ theme }) {
    const icons = {
        'Governance basics': Building2,
        'Data & privacy': Eye,
        'Documentation': FileText,
        'Human oversight': Users,
        'Monitoring': BarChart,
        'Vendor management': Code,
        'Transparency': Lightbulb
    };
    const Icon = icons[theme] || FileText;
    return <Icon className="h-4 w-4" />;
}

// Counsel questions based on bucket
function CounselQuestions({ bucket }) {
    const questions = {
        'Prohibited': [
            'Is there any exception under Art. 5 that might apply to our use case?',
            'What are the immediate steps we should take to ensure compliance?',
            'Are there alternative approaches that would achieve our goals without triggering prohibition?'
        ],
        'High-risk': [
            'What conformity assessment procedure applies to our system?',
            'Do we need to register in the EU AI database, and when?',
            'What documentation do we need to prepare for potential audits?',
            'How should we structure our quality management system?'
        ],
        'Limited risk': [
            'How should we disclose AI involvement to users to meet transparency requirements?',
            'Do we need to mark AI-generated content, and how?',
            'Are there any additional sector-specific requirements we should consider?'
        ],
        'Minimal risk': [
            'Are there any GDPR implications we should review for our AI processing?',
            'Should we implement any voluntary codes of conduct or best practices?',
            'How should we monitor for regulatory changes that might affect our classification?'
        ],
        'Needs clarification': [
            'Based on our actual use case, which AI Act category do we fall into?',
            'What information do you need from us to provide a definitive classification?',
            'Should we proceed with caution assuming a higher-risk classification until clarified?'
        ]
    };
    
    return (
        <>
            {questions[bucket]?.map((q, i) => (
                <div key={i} className="p-4 border rounded-lg bg-muted/30">
                    <p className="font-medium">{q}</p>
                </div>
            ))}
        </>
    );
}

// Loading skeleton
function ResultsSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex gap-6">
                        <Skeleton className="h-20 w-48" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

export default Results;
