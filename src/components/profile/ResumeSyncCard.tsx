import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DiffField {
  oldValue: any;
  newValue: any;
  confidence: number;
  source: string;
  evidence?: string;
}

interface ResumeDiff {
  added: Record<string, DiffField>;
  modified: Record<string, DiffField>;
  removed: Record<string, DiffField>;
}

interface ResumeSyncCardProps {
  diff: ResumeDiff;
  onCommit: (decisions: Record<string, 'approve' | 'reject'>) => void;
  onCancel: () => void;
}

export const ResumeSyncCard: React.FC<ResumeSyncCardProps> = ({ diff, onCommit, onCancel }) => {
  // Initialize all to approved
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'reject'>>(() => {
    const initial: Record<string, 'approve' | 'reject'> = {};
    Object.keys(diff.added || {}).forEach((key) => (initial[key] = 'approve'));
    Object.keys(diff.modified || {}).forEach((key) => (initial[key] = 'approve'));
    return initial;
  });

  const handleToggle = (key: string, checked: boolean) => {
    setDecisions((prev) => ({
      ...prev,
      [key]: checked ? 'approve' : 'reject',
    }));
  };

  const handleApproveAll = () => {
    const updated: Record<string, 'approve' | 'reject'> = {};
    Object.keys(decisions).forEach((key) => (updated[key] = 'approve'));
    setDecisions(updated);
  };

  const handleRejectAll = () => {
    const updated: Record<string, 'approve' | 'reject'> = {};
    Object.keys(decisions).forEach((key) => (updated[key] = 'reject'));
    setDecisions(updated);
  };

  const renderSection = (title: string, data: Record<string, DiffField>, type: 'added' | 'modified') => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center text-slate-800 dark:text-slate-200">
          {type === 'added' ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" /> : <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />}
          {title}
        </h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, field]) => {
            const isApproved = decisions[key] === 'approve';
            return (
              <div 
                key={key} 
                className={`p-4 rounded-xl border transition-all ${
                  isApproved 
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10' 
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 w-full pr-4">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    
                    <div className="flex items-center space-x-3 mt-2">
                      {type === 'modified' && (
                        <>
                          <span className="text-slate-500 line-through decoration-slate-400">{String(field.oldValue)}</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </>
                      )}
                      <span className={`font-semibold ${isApproved ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {String(field.newValue)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                      <div className="flex items-center">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        {field.confidence}% Confidence
                      </div>
                      <div className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {field.source}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center h-full pt-1">
                    <Switch 
                      checked={isApproved} 
                      onCheckedChange={(c) => handleToggle(key, c)} 
                    />
                    <span className="text-[10px] mt-1 font-medium text-slate-400">
                      {isApproved ? 'ACCEPT' : 'REJECT'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalChanges = Object.keys(diff.added || {}).length + Object.keys(diff.modified || {}).length;
  if (totalChanges === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center text-slate-500">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
          <p>No new changes detected in the uploaded resume.</p>
        </CardContent>
      </Card>
    );
  }

  const approvedCount = Object.values(decisions).filter(d => d === 'approve').length;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-slate-200/60 overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <CheckCircle2 className="mr-2 h-6 w-6 text-indigo-500" />
              Resume Synchronization
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Review the intelligence extracted from your resume.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleRejectAll}>Reject All</Button>
            <Button variant="outline" size="sm" onClick={handleApproveAll}>Approve All</Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 px-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {renderSection('Added Information', diff.added, 'added')}
        {renderSection('Modified Information', diff.modified, 'modified')}
      </CardContent>

      <Separator />
      
      <CardFooter className="flex justify-between items-center py-4 px-6 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-sm text-slate-600 font-medium">
          {approvedCount} of {totalChanges} changes selected
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all px-8"
            onClick={() => onCommit(decisions)}
          >
            Update Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResumeSyncCard;
