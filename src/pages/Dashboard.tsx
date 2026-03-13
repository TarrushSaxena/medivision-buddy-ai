import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { xrayAPI, symptomsAPI } from '@/lib/api';
import { DashboardSkeleton } from '@/components/ui/page-skeletons';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { HealthScoreWidget } from '@/components/dashboard/HealthScoreWidget';
import {
  FileImage,
  Stethoscope,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle,
  Activity,
  Calendar,
  AlertCircle,
  Info,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useOnboarding } from '@/hooks/useOnboarding';

interface AnalysisSummary {
  totalXRays: number;
  totalSymptomChecks: number;
  lastAnalysisDate: string | null;
  recentActivity: Array<{
    type: 'xray' | 'symptom';
    date: string;
    result: string;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalysisSummary>({
    totalXRays: 0,
    totalSymptomChecks: 0,
    lastAnalysisDate: null,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Safely get user display name
  const getUserDisplayName = () => {
    if (!user) return '';

    // Try full_name from metadata
    if (user.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string') {
      return user.user_metadata.full_name;
    }

    // Try email and extract name part
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return '';
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;

      try {
        const { count: xrayCount } = await xrayAPI.getCount();
        const { count: symptomCount } = await symptomsAPI.getCount();
        const recentXRays = await xrayAPI.getRecent(3);
        const recentSymptoms = await symptomsAPI.getRecent(3);

        const recentActivity: AnalysisSummary['recentActivity'] = [
          ...(recentXRays?.map((x) => ({
            type: 'xray' as const,
            date: x.created_at,
            result: x.prediction,
          })) || []),
          ...(recentSymptoms?.map((s) => ({
            type: 'symptom' as const,
            date: s.created_at,
            result: s.risk_level || 'completed',
          })) || []),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        // Get last analysis date
        const lastDate = recentActivity.length > 0 ? recentActivity[0].date : null;

        setSummary({
          totalXRays: xrayCount || 0,
          totalSymptomChecks: symptomCount || 0,
          lastAnalysisDate: lastDate,
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    // Poll for updates every 10 seconds
    const intervalId = setInterval(fetchSummary, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  const getResultBadge = (type: string, result: string) => {
    if (type === 'xray') {
      const classes: Record<string, string> = {
        normal: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        covid19: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        pneumonia: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        lung_opacity: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      };
      return classes[result] || 'bg-muted text-muted-foreground';
    }
    const classes: Record<string, string> = {
      low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      moderate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      high: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      critical: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return classes[result] || 'bg-muted text-muted-foreground';
  };

  const formatResult = (result: string) => {
    return result.replace('_', ' ').charAt(0).toUpperCase() + result.replace('_', ' ').slice(1);
  };

  const displayName = getUserDisplayName();
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding();

  // Show skeleton while loading
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Onboarding Tour */}
      <OnboardingTour />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header - Personalized & Clean */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Your diagnostic insights are ready.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasCompletedOnboarding && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startOnboarding}
                className="h-9 hover:bg-muted"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Take Tour
              </Button>
            )}
            <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link to="/xray-analysis">
                <FileImage className="h-4 w-4 mr-2" />
                New Analysis
              </Link>
            </Button>
          </div>
        </div>

        {/* Health Score Widget - New Addition */}
        <HealthScoreWidget
          totalAnalyses={summary.totalXRays + summary.totalSymptomChecks}
          recentActivityCount={summary.recentActivity.length}
          lastAnalysisDate={summary.lastAnalysisDate}
        />

        {/* Stats - Compact Modern Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-tour="stats">
          <div className="glass-card p-4 group hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <FileImage className="h-4 w-4" />
              </div>
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{summary.totalXRays}</p>
            <p className="text-xs text-muted-foreground">X-Ray Scans</p>
          </div>

          <div className="glass-card p-4 group hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Stethoscope className="h-4 w-4" />
              </div>
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{summary.totalSymptomChecks}</p>
            <p className="text-xs text-muted-foreground">Symptom Checks</p>
          </div>

          <div className="glass-card p-4 group hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-lg font-bold truncate">
              {summary.lastAnalysisDate
                ? formatDistanceToNow(new Date(summary.lastAnalysisDate), { addSuffix: false })
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Since Last Analysis</p>
          </div>

          <div className="glass-card p-4 group hover:border-emerald-500/30 transition-colors bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Info className="h-4 w-4" />
              </div>
            </div>
            <p className="text-lg font-bold">Educational</p>
            <p className="text-xs text-muted-foreground">Research Mode</p>
          </div>
        </div>

        {/* Quick Actions - Compact Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link to="/xray-analysis" className="group" data-tour="xray-action">
              <div className="glass-card p-4 h-full hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">X-Ray Analysis</h3>
                    <p className="text-xs text-muted-foreground">AI-powered scan review</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload chest X-rays for instant AI analysis with heatmap visualization.
                </p>
                <div className="mt-3 flex items-center text-blue-500 text-sm font-medium group-hover:gap-2 transition-all">
                  Start Analysis <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link to="/symptom-checker" className="group" data-tour="symptom-action">
              <div className="glass-card p-4 h-full hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/25">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Symptom Checker</h3>
                    <p className="text-xs text-muted-foreground">Risk assessment</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Describe your symptoms for AI-driven health risk assessment.
                </p>
                <div className="mt-3 flex items-center text-purple-500 text-sm font-medium group-hover:gap-2 transition-all">
                  Check Symptoms <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link to="/chat" className="group" data-tour="chat-action">
              <div className="glass-card p-4 h-full hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-500/25">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      AI Assistant
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">Beta</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Chat with MediVision</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ask medical questions and get instant educational answers.
                </p>
                <div className="mt-3 flex items-center text-emerald-500 text-sm font-medium group-hover:gap-2 transition-all">
                  Start Chat <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity & Tips - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.recentActivity.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mb-1">No activity yet</p>
                  <Button variant="link" asChild className="text-primary p-0 h-auto text-sm">
                    <Link to="/xray-analysis">Start your first analysis</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recentActivity.map((activity, index) => (
                    <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.type === 'xray' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                          }`}>
                          {activity.type === 'xray' ? (
                            <FileImage className="h-4 w-4" />
                          ) : (
                            <Stethoscope className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.type === 'xray' ? 'X-Ray Analysis' : 'Symptom Check'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getResultBadge(activity.type, activity.result)}`}>
                        {formatResult(activity.result)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Verify AI predictions with clinical findings",
                  "Use high-quality images for best results",
                  "Consider differential diagnoses",
                  "Review past analyses regularly"
                ].map((tip, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Disclaimer - Compact */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Educational Only:</strong> Always consult healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
