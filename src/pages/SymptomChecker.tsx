import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import {
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const symptomCategories = [
  {
    category: 'Respiratory',
    symptoms: [
      { id: 'cough', label: 'Cough (dry or productive)' },
      { id: 'shortness_of_breath', label: 'Shortness of breath' },
      { id: 'chest_pain', label: 'Chest pain or tightness' },
      { id: 'wheezing', label: 'Wheezing' },
      { id: 'rapid_breathing', label: 'Rapid breathing' },
    ],
  },
  {
    category: 'Systemic',
    symptoms: [
      { id: 'fever', label: 'Fever (>38°C / 100.4°F)' },
      { id: 'chills', label: 'Chills or rigors' },
      { id: 'fatigue', label: 'Fatigue or weakness' },
      { id: 'body_aches', label: 'Body aches or muscle pain' },
      { id: 'night_sweats', label: 'Night sweats' },
    ],
  },
  {
    category: 'Other',
    symptoms: [
      { id: 'loss_of_taste_smell', label: 'Loss of taste or smell' },
      { id: 'headache', label: 'Headache' },
      { id: 'sore_throat', label: 'Sore throat' },
      { id: 'nausea', label: 'Nausea or vomiting' },
      { id: 'diarrhea', label: 'Diarrhea' },
    ],
  },
];

interface AnalysisResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  possibleConditions: string[];
  recommendations: string[];
  urgency: string;
}

const riskInfo: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  low: {
    label: 'Low Risk',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: CheckCircle2,
  },
  moderate: {
    label: 'Moderate Risk',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: AlertTriangle,
  },
  high: {
    label: 'High Risk',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    icon: AlertCircle,
  },
  critical: {
    label: 'Critical',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    icon: XCircle,
  },
};

export default function SymptomChecker() {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    if (!user) return;

    setAnalyzing(true);

    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Rule-based analysis (mock)
      const hasRespiratorySymptoms = selectedSymptoms.some((s) =>
        ['cough', 'shortness_of_breath', 'chest_pain', 'wheezing', 'rapid_breathing'].includes(s)
      );
      const hasFever = selectedSymptoms.includes('fever');
      const hasLossOfSmell = selectedSymptoms.includes('loss_of_taste_smell');
      const symptomCount = selectedSymptoms.length;

      let riskLevel: AnalysisResult['riskLevel'] = 'low';
      let possibleConditions: string[] = [];
      let recommendations: string[] = [];
      let urgency = 'Monitor symptoms and rest at home.';

      if (symptomCount >= 5 && hasRespiratorySymptoms && hasFever) {
        riskLevel = 'high';
        possibleConditions = ['Pneumonia', 'COVID-19', 'Severe respiratory infection'];
        recommendations = [
          'Seek immediate medical attention',
          'Get tested for COVID-19 and other respiratory pathogens',
          'Monitor oxygen saturation if possible',
          'Avoid contact with others',
        ];
        urgency = 'Seek medical attention within 24 hours.';
      } else if (hasLossOfSmell && (hasFever || selectedSymptoms.includes('cough'))) {
        riskLevel = 'moderate';
        possibleConditions = ['COVID-19', 'Viral respiratory infection'];
        recommendations = [
          'Get tested for COVID-19',
          'Self-isolate until test results',
          'Monitor for worsening symptoms',
          'Stay hydrated and rest',
        ];
        urgency = 'Schedule a medical consultation within 48 hours.';
      } else if (hasRespiratorySymptoms && symptomCount >= 3) {
        riskLevel = 'moderate';
        possibleConditions = ['Bronchitis', 'Upper respiratory infection', 'Allergic reaction'];
        recommendations = [
          'Rest and stay hydrated',
          'Consider over-the-counter symptom relief',
          'Monitor for fever or worsening symptoms',
          'Consult a doctor if symptoms persist beyond 7 days',
        ];
        urgency = 'Monitor symptoms; consult if worsening.';
      } else {
        riskLevel = 'low';
        possibleConditions = ['Common cold', 'Minor viral infection', 'Allergies'];
        recommendations = [
          'Rest and stay hydrated',
          'Use over-the-counter remedies as needed',
          'Monitor for new or worsening symptoms',
        ];
        urgency = 'Self-care at home; no immediate medical attention needed.';
      }

      if (selectedSymptoms.includes('shortness_of_breath') && selectedSymptoms.includes('chest_pain')) {
        riskLevel = 'critical';
        possibleConditions = ['Possible cardiac event', 'Severe respiratory distress', 'Pulmonary embolism'];
        recommendations = [
          'Seek emergency medical care immediately',
          'Call emergency services if symptoms are severe',
          'Do not drive yourself to the hospital',
        ];
        urgency = 'EMERGENCY: Seek immediate medical attention.';
      }

      const analysisResult: AnalysisResult = {
        riskLevel,
        possibleConditions,
        recommendations,
        urgency,
      };

      // Save to database
      const { error: dbError } = await supabase.from('symptom_checks').insert([{
        user_id: user.id,
        symptoms: JSON.parse(JSON.stringify(selectedSymptoms)),
        analysis_result: JSON.parse(JSON.stringify(analysisResult)),
        risk_level: riskLevel,
        recommendations,
      }]);
      
      if (dbError) throw dbError;

      setResult(analysisResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedSymptoms([]);
    setAdditionalInfo('');
    setResult(null);
  };

  const risk = result ? riskInfo[result.riskLevel] : null;
  const RiskIcon = risk?.icon || AlertCircle;

  return (
    <DashboardLayout title="Symptom Checker">
      <div className="max-w-5xl mx-auto space-y-6">
        <MedicalDisclaimer />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Symptom Selection */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Select Your Symptoms
              </CardTitle>
              <CardDescription>
                Check all symptoms you are currently experiencing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {symptomCategories.map((category) => (
                <div key={category.category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.symptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer',
                          selectedSymptoms.includes(symptom.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        )}
                        onClick={() => toggleSymptom(symptom.id)}
                      >
                        <Checkbox
                          id={symptom.id}
                          checked={selectedSymptoms.includes(symptom.id)}
                          onCheckedChange={() => toggleSymptom(symptom.id)}
                        />
                        <Label
                          htmlFor={symptom.id}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {symptom.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label>Additional Information (Optional)</Label>
                <Textarea
                  placeholder="Any other symptoms or relevant medical history..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="medical"
                  size="lg"
                  className="flex-1"
                  onClick={analyzeSymptoms}
                  disabled={selectedSymptoms.length === 0 || analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Symptoms
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                {selectedSymptoms.length > 0 && (
                  <Button variant="outline" size="lg" onClick={resetAnalysis}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {selectedSymptoms.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-generated assessment based on your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No analysis yet</p>
                  <p className="text-sm">Select symptoms to get an assessment</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Risk Level */}
                  <div className={cn('p-6 rounded-xl text-center', risk?.bgColor)}>
                    <RiskIcon className={cn('h-12 w-12 mx-auto mb-3', risk?.color)} />
                    <h3 className={cn('text-2xl font-bold mb-2', risk?.color)}>
                      {risk?.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.urgency}</p>
                  </div>

                  {/* Possible Conditions */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Possible Conditions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.possibleConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="outline" className="w-full" onClick={resetAnalysis}>
                    Start New Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
