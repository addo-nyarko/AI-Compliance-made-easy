import React, { useState, useEffect } from 'react';
import { settingsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Loader2, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

const currencies = [
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
];

function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Form state
    const [currency, setCurrency] = useState('EUR');
    const [turnover, setTurnover] = useState('');
    const [disclaimerText, setDisclaimerText] = useState('');
    const [tierA, setTierA] = useState({ min_percent: 0.5, max_percent: 3 });
    const [tierB, setTierB] = useState({ min_percent: 1.5, max_percent: 7 });
    const [tierC, setTierC] = useState({ min_percent: 2, max_percent: 6, fixed_max: 35000000 });
    
    useEffect(() => {
        loadSettings();
    }, []);
    
    const loadSettings = async () => {
        try {
            const data = await settingsAPI.get();
            setSettings(data);
            setCurrency(data.currency || 'EUR');
            setTurnover(data.default_turnover?.toString() || '');
            setDisclaimerText(data.disclaimer_text || '');
            if (data.tier_parameters) {
                if (data.tier_parameters.A) setTierA(data.tier_parameters.A);
                if (data.tier_parameters.B) setTierB(data.tier_parameters.B);
                if (data.tier_parameters.C) setTierC(data.tier_parameters.C);
            }
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        setSaving(true);
        setError('');
        
        try {
            const updateData = {
                currency,
                default_turnover: turnover ? parseFloat(turnover) : null,
                disclaimer_text: disclaimerText,
                tier_parameters: {
                    A: { ...tierA, description: 'General AI Act violations' },
                    B: { ...tierB, description: 'High-risk system violations' },
                    C: { ...tierC, description: 'Prohibited AI practices' }
                }
            };
            
            const updated = await settingsAPI.update(updateData);
            setSettings(updated);
            toast.success('Settings saved');
        } catch (err) {
            setError('Failed to save settings');
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <SettingsSkeleton />;
    }
    
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
            <div className="mb-8">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold" data-testid="settings-title">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Configure your fine exposure estimator and preferences
                </p>
            </div>
            
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {/* Estimator Assumptions */}
            <Card className="mb-6" data-testid="estimator-card">
                <CardHeader>
                    <CardTitle>Fine Exposure Estimator</CardTitle>
                    <CardDescription>
                        These settings are used to simulate theoretical penalty exposure. 
                        They are placeholders for prioritization — not legal determinations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            The fine exposure simulation is for prioritization purposes only. Actual penalties depend on many factors 
                            and are determined by regulatory authorities. The percentages below are editable assumptions.
                        </AlertDescription>
                    </Alert>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger id="currency" data-testid="currency-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="turnover">Annual Turnover</Label>
                            <Input
                                id="turnover"
                                type="number"
                                placeholder="e.g., 5000000"
                                value={turnover}
                                onChange={(e) => setTurnover(e.target.value)}
                                data-testid="turnover-input"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used for penalty range calculations
                            </p>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <h4 className="font-medium mb-4">Penalty Tier Parameters (Editable Placeholders)</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            These represent different violation severity levels. Adjust as needed for your simulations.
                        </p>
                        
                        {/* Tier A */}
                        <div className="p-4 border rounded-lg mb-4" data-testid="tier-a-settings">
                            <h5 className="font-medium mb-3">Tier A — General Violations</h5>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min % of turnover</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={tierA.min_percent}
                                        onChange={(e) => setTierA({ ...tierA, min_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max % of turnover</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={tierA.max_percent}
                                        onChange={(e) => setTierA({ ...tierA, max_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Tier B */}
                        <div className="p-4 border rounded-lg mb-4" data-testid="tier-b-settings">
                            <h5 className="font-medium mb-3">Tier B — High-Risk System Violations</h5>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min % of turnover</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={tierB.min_percent}
                                        onChange={(e) => setTierB({ ...tierB, min_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max % of turnover</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={tierB.max_percent}
                                        onChange={(e) => setTierB({ ...tierB, max_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Tier C */}
                        <div className="p-4 border rounded-lg" data-testid="tier-c-settings">
                            <h5 className="font-medium mb-3">Tier C — Prohibited AI Practices</h5>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Min % of turnover</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={tierC.min_percent}
                                        onChange={(e) => setTierC({ ...tierC, min_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max % of turnover</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={tierC.max_percent}
                                        onChange={(e) => setTierC({ ...tierC, max_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fixed Max ({currency})</Label>
                                    <Input
                                        type="number"
                                        value={tierC.fixed_max || ''}
                                        onChange={(e) => setTierC({ ...tierC, fixed_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Disclaimer Text */}
            <Card className="mb-6" data-testid="disclaimer-card">
                <CardHeader>
                    <CardTitle>Disclaimer Text</CardTitle>
                    <CardDescription>
                        This text appears on results and exports to clarify the tool's limitations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={disclaimerText}
                        onChange={(e) => setDisclaimerText(e.target.value)}
                        rows={3}
                        placeholder="Educational information only — not legal advice. Consult qualified counsel."
                        data-testid="disclaimer-textarea"
                    />
                </CardContent>
            </Card>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} data-testid="save-settings-btn">
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Settings
                </Button>
            </div>
        </div>
    );
}

function SettingsSkeleton() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-8" />
            <Card className="mb-6">
                <CardContent className="pt-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default Settings;
