import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsAPI, assessmentsAPI } from '@/lib/api';
import { getBucketClasses, formatDate, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Plus, ArrowLeft, FileText, Copy, Download, AlertTriangle, 
    CheckCircle, HelpCircle, Ban, Clock, MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const bucketIcons = {
    'Prohibited': Ban,
    'High-risk': AlertTriangle,
    'Limited risk': HelpCircle,
    'Minimal risk': CheckCircle,
    'Needs clarification': HelpCircle
};

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [duplicating, setDuplicating] = useState(null);
    
    useEffect(() => {
        loadData();
    }, [id]);
    
    const loadData = async () => {
        try {
            const [projectData, assessmentsData] = await Promise.all([
                projectsAPI.get(id),
                assessmentsAPI.listByProject(id)
            ]);
            setProject(projectData);
            setAssessments(assessmentsData);
        } catch (err) {
            setError('Failed to load project');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDuplicate = async (assessmentId) => {
        setDuplicating(assessmentId);
        try {
            const newAssessment = await assessmentsAPI.duplicate(assessmentId);
            toast.success('Assessment duplicated');
            navigate(`/results/${newAssessment.id}`);
        } catch (err) {
            toast.error('Failed to duplicate assessment');
        } finally {
            setDuplicating(null);
        }
    };
    
    if (loading) {
        return <ProjectDetailSkeleton />;
    }
    
    if (error || !project) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || 'Project not found'}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const BucketIcon = bucketIcons[project.latest_bucket] || HelpCircle;
    
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            {/* Back link */}
            <Button variant="ghost" asChild className="mb-4" data-testid="back-to-projects">
                <Link to="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
            </Button>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="font-heading text-2xl sm:text-3xl font-bold" data-testid="project-name">
                            {project.name}
                        </h1>
                        {project.latest_bucket && (
                            <Badge className={`${getBucketClasses(project.latest_bucket)} flex items-center gap-1`}>
                                <BucketIcon className="h-3 w-3" />
                                {project.latest_bucket}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        {project.org_name && <span>{project.org_name} • </span>}
                        Created {formatDate(project.created_at)}
                    </p>
                </div>
                <Button asChild data-testid="new-version-btn">
                    <Link to="/scan">
                        <Plus className="mr-2 h-4 w-4" />
                        New Version
                    </Link>
                </Button>
            </div>
            
            {/* Assessment History */}
            <Card data-testid="assessments-card">
                <CardHeader>
                    <CardTitle className="text-lg">Assessment History</CardTitle>
                    <CardDescription>
                        {assessments.length} version{assessments.length !== 1 ? 's' : ''} of this assessment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {assessments.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No assessments yet</p>
                            <Button asChild>
                                <Link to="/scan">Run First Assessment</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assessments.map((assessment, index) => {
                                const AssessmentIcon = bucketIcons[assessment.classification_json?.bucket] || HelpCircle;
                                const isLatest = index === 0;
                                
                                return (
                                    <div 
                                        key={assessment.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${
                                            isLatest ? 'border-primary bg-primary/5' : ''
                                        }`}
                                        data-testid={`assessment-${assessment.id}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                getBucketClasses(assessment.classification_json?.bucket)
                                            }`}>
                                                <AssessmentIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Version {assessment.version}</span>
                                                    {isLatest && (
                                                        <Badge variant="secondary">Latest</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateTime(assessment.created_at)}
                                                    <span>•</span>
                                                    <span>{assessment.classification_json?.bucket}</span>
                                                    <span>•</span>
                                                    <span>{assessment.classification_json?.confidence} confidence</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild data-testid={`view-results-${assessment.id}`}>
                                                <Link to={`/results/${assessment.id}`}>View Results</Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/results/${assessment.id}`}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            View Results
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/export/${assessment.id}`}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Export
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDuplicate(assessment.id)}
                                                        disabled={duplicating === assessment.id}
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        {duplicating === assessment.id ? 'Duplicating...' : 'Duplicate'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ProjectDetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="mb-8">
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProjectDetail;
