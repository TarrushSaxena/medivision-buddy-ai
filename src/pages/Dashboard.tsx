import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  FileImage,
  Stethoscope,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

interface AnalysisSummary {
  totalXRays: number;
  totalSymptomChecks: number;
  recentActivity: Array<{
    type: 'xray' | 'symptom';
    date: string;
    result: string;
  }>;
}

const quickActions = [
  {
    icon: FileImage,
    title: 'Analyze X-Ray',
    description: 'Upload a chest X-ray for AI analysis',
    href: '/xray-analysis',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Stethoscope,
    title: 'Check Symptoms',
    description: 'Enter symptoms for diagnostic insights',
    href: '/symptom-checker',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Chat with our medical AI assistant',
    href: '/chat',
    color: 'bg-success/10 text-success',
  },
];

const medicalTips = [
  "Always verify AI predictions with clinical findings and patient history.",
  "X-ray image quality significantly affects analysis accuracy.",
  "Consider multiple differential diagnoses for better patient outcomes.",
  "Document all AI-assisted analyses in patient records appropriately.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalysisSummary>({
    totalXRays: 0,
    totalSymptomChecks: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;

      try {
        // Fetch X-ray analyses count
        const { count: xrayCount } = await supabase
          .from('x_ray_analyses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch symptom checks count
        const { count: symptomCount } = await supabase
          .from('symptom_checks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch recent X-ray analyses
        const { data: recentXRays } = await supabase
          .from('x_ray_analyses')
          .select('prediction, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent symptom checks
        const { data: recentSymptoms } = await supabase
          .from('symptom_checks')
          .select('risk_level, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

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

        setSummary({
          totalXRays: xrayCount || 0,
          totalSymptomChecks: symptomCount || 0,
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  const getResultBadge = (type: string, result: string) => {
    if (type === 'xray') {
      const colors: Record<string, string> = {
        normal: 'bg-success/10 text-success',
        covid19: 'bg-destructive/10 text-destructive',
        pneumonia: 'bg-warning/10 text-warning',
        lung_opacity: 'bg-info/10 text-info',
      };
      return colors[result] || 'bg-muted text-muted-foreground';
    }
    const riskColors: Record<string, string> = {
      low: 'bg-success/10 text-success',
      moderate: 'bg-warning/10 text-warning',
      high: 'bg-destructive/10 text-destructive',
      critical: 'bg-destructive/10 text-destructive',
    };
    return riskColors[result] || 'bg-muted text-muted-foreground';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your diagnostic activity
            </p>
          </div>
          <Button variant="medical" asChild>
            <Link to="/xray-analysis">
              <FileImage className="h-4 w-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-medical">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                X-Ray Analyses
              </CardTitle>
              <FileImage className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalXRays}</div>
              <p className="text-xs text-muted-foreground mt-1">Total scans analyzed</p>
            </CardContent>
          </Card>

          <Card className="card-medical">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Symptom Checks
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalSymptomChecks}</div>
              <p className="text-xs text-muted-foreground mt-1">Total assessments</p>
            </CardContent>
          </Card>

          <Card className="card-medical">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Assistant
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24/7</div>
              <p className="text-xs text-muted-foreground mt-1">Available for questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className="card-medical h-full cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest diagnostic analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm">Start by uploading an X-ray or checking symptoms</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {activity.type === 'xray' ? (
                          <FileImage className="h-5 w-5 text-accent" />
                        ) : (
                          <Stethoscope className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {activity.type === 'xray' ? 'X-Ray Analysis' : 'Symptom Check'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultBadge(activity.type, activity.result)}`}>
                        {activity.result.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Tips */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Best Practices
              </CardTitle>
              <CardDescription>Tips for effective AI-assisted diagnosis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
