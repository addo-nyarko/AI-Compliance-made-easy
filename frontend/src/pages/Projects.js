import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI } from '@/lib/api';
import { getBucketClasses, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Plus, Search, FolderOpen, AlertTriangle, CheckCircle, 
    HelpCircle, Ban, FileText, Trash2, MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const bucketOptions = [
    { value: 'all', label: 'All buckets' },
    { value: 'Prohibited', label: 'Prohibited' },
    { value: 'High-risk', label: 'High-risk' },
    { value: 'Limited risk', label: 'Limited risk' },
    { value: 'Minimal risk', label: 'Minimal risk' },
    { value: 'Needs clarification', label: 'Needs clarification' },
];

const bucketIcons = {
    'Prohibited': Ban,
    'High-risk': AlertTriangle,
    'Limited risk': HelpCircle,
    'Minimal risk': CheckCircle,
    'Needs clarification': HelpCircle
};

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [bucketFilter, setBucketFilter] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    const navigate = useNavigate();
    
    useEffect(() => {
        loadProjects();
    }, []);
    
    const loadProjects = async () => {
        try {
            const data = await projectsAPI.list();
            setProjects(data);
        } catch (err) {
            toast.error('Failed to load projects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await projectsAPI.delete(deleteId);
            setProjects(projects.filter(p => p.id !== deleteId));
            toast.success('Project deleted');
        } catch (err) {
            toast.error('Failed to delete project');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };
    
    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = !searchTerm || 
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.org_name && project.org_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesBucket = bucketFilter === 'all' || project.latest_bucket === bucketFilter;
        return matchesSearch && matchesBucket;
    });
    
    if (loading) {
        return <ProjectsSkeleton />;
    }
    
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold" data-testid="projects-title">
                        My Projects
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your AI system assessments
                    </p>
                </div>
                <Button asChild data-testid="new-scan-btn">
                    <Link to="/scan">
                        <Plus className="mr-2 h-4 w-4" />
                        New Assessment
                    </Link>
                </Button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                        data-testid="search-input"
                    />
                </div>
                <Select value={bucketFilter} onValueChange={setBucketFilter}>
                    <SelectTrigger className="w-full sm:w-48" data-testid="bucket-filter">
                        <SelectValue placeholder="Filter by bucket" />
                    </SelectTrigger>
                    <SelectContent>
                        {bucketOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <Card data-testid="empty-state">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-heading text-lg font-semibold mb-2">
                            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
                        </h3>
                        <p className="text-muted-foreground text-center mb-4 max-w-md">
                            {projects.length === 0 
                                ? 'Start by running your first AI risk assessment. It only takes 3 minutes.'
                                : 'Try adjusting your search or filter criteria.'
                            }
                        </p>
                        {projects.length === 0 && (
                            <Button asChild data-testid="empty-state-cta">
                                <Link to="/scan">Run Your First Scan</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredProjects.map(project => {
                        const BucketIcon = bucketIcons[project.latest_bucket] || HelpCircle;
                        return (
                            <Card 
                                key={project.id} 
                                className="hover:border-primary/50 transition-colors cursor-pointer"
                                data-testid={`project-card-${project.id}`}
                            >
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <Link to={`/projects/${project.id}`} className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-heading font-semibold text-lg truncate">
                                                    {project.name}
                                                </h3>
                                                {project.latest_bucket && (
                                                    <Badge className={`${getBucketClasses(project.latest_bucket)} flex items-center gap-1`}>
                                                        <BucketIcon className="h-3 w-3" />
                                                        {project.latest_bucket}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {project.org_name && (
                                                    <span>{project.org_name}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {project.assessment_count} assessment{project.assessment_count !== 1 ? 's' : ''}
                                                </span>
                                                <span>Created {formatDate(project.created_at)}</span>
                                            </div>
                                        </Link>
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" data-testid={`project-menu-${project.id}`}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/projects/${project.id}`}>View details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive"
                                                    onClick={() => setDeleteId(project.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            
            {/* Delete confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent data-testid="delete-dialog">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project and all its assessments. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground">
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ProjectsSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            <div className="flex justify-between mb-8">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-64 mb-3" />
                            <Skeleton className="h-4 w-48" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default Projects;
