import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { classifyAPI, projectsAPI, assessmentsAPI } from '@/lib/api';
import { draftStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Wizard steps configuration
const WIZARD_STEPS = [
    { id: 'role', title: 'Your Role', questions: ['q1_company_role', 'q2_deployment'] },
    { id: 'domain', title: 'Domain & Impact', questions: ['q3_domain', 'q4_decision_impact'] },
    { id: 'data', title: 'Data & Privacy', questions: ['q5_data_types', 'q6_biometric'] },
    { id: 'operations', title: 'Operations', questions: ['q7_safety_critical', 'q8_human_oversight'] },
    { id: 'behavior', title: 'Behavior & Logging', questions: ['q9_behavior', 'q10_logging'] },
    { id: 'context', title: 'Additional Context', questions: ['q11_use_case', 'q12_concern'] },
];

export default function Scan() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [showProjectDialog, setShowProjectDialog] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [classificationResult, setClassificationResult] = useState(null);
    
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Load questions from API
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const data = await classifyAPI.getQuestions();
                setQuestions(data.questions);
                
                // Check for saved draft
                const draft = draftStorage.getDraft();
                if (draft && draft.answers) {
                    setAnswers(draft.answers);
                    if (draft.step !== undefined) {
                        setCurrentStep(Math.min(draft.step, WIZARD_STEPS.length - 1));
                    }
                }
            } catch (err) {
                setError('Failed to load questions. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        loadQuestions();
    }, []);
    
    // Auto-save draft
    const saveDraft = useCallback((newAnswers, step) => {
        draftStorage.saveDraft(newAnswers, step);
    }, []);
    
    // Handle answer change
    const handleAnswer = (questionId, value) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);
        saveDraft(newAnswers, currentStep);
    };
    
    // Get question by ID
    const getQuestion = (id) => questions.find(q => q.id === id);
    
    // Get current step questions
    const getCurrentStepQuestions = () => {
        const step = WIZARD_STEPS[currentStep];
        return step.questions.map(qId => getQuestion(qId)).filter(Boolean);
    };
    
    // Check if step is complete
    const isStepComplete = (stepIndex) => {
        const step = WIZARD_STEPS[stepIndex];
        return step.questions.every(qId => {
            const q = getQuestion(qId);
            if (!q) return true;
            if (!q.required) return true;
            return answers[qId] !== undefined && answers[qId] !== '';
        });
    };
    
    // Navigate steps
    const nextStep = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
            saveDraft(answers, currentStep + 1);
        }
    };
    
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            saveDraft(answers, currentStep - 1);
        }
    };
    
    // Handle completion
    const handleComplete = async () => {
        if (!isAuthenticated) {
            setShowAuthDialog(true);
            return;
        }
        
        setShowProjectDialog(true);
    };
    
    // Create project and assessment
    const createAssessment = async () => {
        if (!projectName.trim()) {
            toast.error('Please enter a project name');
            return;
        }
        
        setSubmitting(true);
        setError('');
        
        try {
            // Create project
            const project = await projectsAPI.create({ name: projectName });
            
            // Create assessment
            const assessment = await assessmentsAPI.create({
                project_id: project.id,
                answers_json: answers
            });
            
            // Clear draft
            draftStorage.clearDraft();
            
            // Navigate to results
            navigate(`/results/${assessment.id}`);
            toast.success('Assessment complete!');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save assessment');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };
    
    // Preview classification (for current answers)
    const previewClassification = async () => {
        try {
            const result = await classifyAPI.classify(answers);
            setClassificationResult(result);
        } catch (err) {
            console.error('Preview failed:', err);
        }
    };
    
    // Progress percentage
    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
    
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error && !questions.length) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const currentStepData = WIZARD_STEPS[currentStep];
    const stepQuestions = getCurrentStepQuestions();
    const canProceed = isStepComplete(currentStep);
    const isLastStep = currentStep === WIZARD_STEPS.length - 1;
    
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
            {/* Progress header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        Step {currentStep + 1} of {WIZARD_STEPS.length}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                        {Math.round(progress)}% complete
                    </span>
                </div>
                <Progress value={progress} className="h-2" data-testid="scan-progress" />
            </div>
            
            {/* Step content */}
            <Card className="mb-8" data-testid="scan-step-card">
                <CardHeader>
                    <CardTitle className="font-heading text-xl sm:text-2xl" data-testid="scan-step-title">
                        {currentStepData.title}
                    </CardTitle>
                    <CardDescription>
                        Answer the questions below to help us assess your AI system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {stepQuestions.map((question) => (
                        <QuestionField
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onChange={(value) => handleAnswer(question.id, value)}
                        />
                    ))}
                </CardContent>
            </Card>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    data-testid="scan-prev-btn"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                
                {isLastStep ? (
                    <Button
                        onClick={handleComplete}
                        disabled={!canProceed || submitting}
                        data-testid="scan-complete-btn"
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Complete Assessment
                        <CheckCircle className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed}
                        data-testid="scan-next-btn"
                    >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mt-8">
                {WIZARD_STEPS.map((step, index) => (
                    <button
                        key={step.id}
                        onClick={() => {
                            if (index <= currentStep || isStepComplete(index - 1)) {
                                setCurrentStep(index);
                            }
                        }}
                        disabled={index > currentStep && !isStepComplete(index - 1)}
                        className={`h-2 rounded-full transition-all ${
                            index === currentStep 
                                ? 'w-8 bg-primary' 
                                : index < currentStep 
                                    ? 'w-2 bg-primary/50' 
                                    : 'w-2 bg-muted'
                        }`}
                        data-testid={`scan-step-indicator-${index}`}
                    />
                ))}
            </div>
            
            {/* Auth dialog */}
            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogContent data-testid="auth-required-dialog">
                    <DialogHeader>
                        <DialogTitle>Sign in to save your assessment</DialogTitle>
                        <DialogDescription>
                            Create a free account to save your results, track multiple projects, and export reports.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => navigate('/auth?returnTo=/scan')} data-testid="auth-dialog-signin">
                            Sign in / Sign up
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Project name dialog */}
            <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                <DialogContent data-testid="project-name-dialog">
                    <DialogHeader>
                        <DialogTitle>Name your assessment</DialogTitle>
                        <DialogDescription>
                            Give this assessment a name so you can find it later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="projectName">Project name</Label>
                        <Input
                            id="projectName"
                            placeholder="e.g., HR Chatbot, Code Assistant, etc."
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            data-testid="project-name-input"
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={createAssessment} disabled={submitting || !projectName.trim()} data-testid="save-assessment-btn">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save & View Results
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Question field component
export function QuestionField({ question, value, onChange }) {
    if (question.type === 'text') {
        return (
            <div className="space-y-3" data-testid={`question-${question.id}`}>
                <div>
                    <Label className="text-base font-medium">{question.label}</Label>
                    {question.help_text && (
                        <p className="text-sm text-muted-foreground mt-1">{question.help_text}</p>
                    )}
                </div>
                <Textarea
                    placeholder={question.placeholder}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    data-testid={`input-${question.id}`}
                />
            </div>
        );
    }
    
    return (
        <div className="space-y-3" data-testid={`question-${question.id}`}>
            <div>
                <Label className="text-base font-medium">{question.label}</Label>
                {question.help_text && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                        <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {question.help_text}
                    </p>
                )}
            </div>
            <RadioGroup
                value={value || ''}
                onValueChange={onChange}
                className="space-y-2"
            >
                {question.options.map((option) => (
                    <div
                        key={option.value}
                        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            value === option.value 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => onChange(option.value)}
                    >
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} data-testid={`option-${question.id}-${option.value}`} />
                        <Label 
                            htmlFor={`${question.id}-${option.value}`} 
                            className="flex-1 cursor-pointer font-normal"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );

}
