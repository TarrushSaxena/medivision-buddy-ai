import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import {
  Upload,
  FileImage,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PredictionResult {
  prediction: 'covid19' | 'pneumonia' | 'lung_opacity' | 'normal';
  confidence: number;
  allPredictions: {
    covid19: number;
    pneumonia: number;
    lung_opacity: number;
    normal: number;
  };
}

const predictionInfo: Record<string, { label: string; color: string; icon: typeof CheckCircle2; description: string }> = {
  normal: {
    label: 'Normal',
    color: 'text-success',
    icon: CheckCircle2,
    description: 'No significant abnormalities detected in the chest X-ray.',
  },
  covid19: {
    label: 'COVID-19',
    color: 'text-destructive',
    icon: XCircle,
    description: 'Pattern consistent with COVID-19 pneumonia. Ground-glass opacities may be present.',
  },
  pneumonia: {
    label: 'Pneumonia',
    color: 'text-warning',
    icon: AlertTriangle,
    description: 'Signs of bacterial or viral pneumonia detected. Consolidation patterns visible.',
  },
  lung_opacity: {
    label: 'Lung Opacity',
    color: 'text-info',
    icon: Info,
    description: 'Lung opacity detected. May indicate various conditions requiring further investigation.',
  },
};

export default function XRayAnalysis() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const analyzeImage = async () => {
    if (!file || !user) return;

    setAnalyzing(true);

    try {
      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('xray-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('xray-images')
        .getPublicUrl(fileName);

      // Mock AI prediction (simulates CNN model)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const predictions = {
        covid19: Math.random() * 0.3,
        pneumonia: Math.random() * 0.3,
        lung_opacity: Math.random() * 0.3,
        normal: Math.random() * 0.5 + 0.2,
      };

      const total = Object.values(predictions).reduce((a, b) => a + b, 0);
      const normalized = Object.fromEntries(
        Object.entries(predictions).map(([k, v]) => [k, (v / total) * 100])
      ) as PredictionResult['allPredictions'];

      const maxPrediction = Object.entries(normalized).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );

      const predictionResult: PredictionResult = {
        prediction: maxPrediction[0] as PredictionResult['prediction'],
        confidence: Math.round(maxPrediction[1] * 10) / 10,
        allPredictions: {
          covid19: Math.round(normalized.covid19 * 10) / 10,
          pneumonia: Math.round(normalized.pneumonia * 10) / 10,
          lung_opacity: Math.round(normalized.lung_opacity * 10) / 10,
          normal: Math.round(normalized.normal * 10) / 10,
        },
      };

      // Save to database
      await supabase.from('x_ray_analyses').insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        prediction: predictionResult.prediction,
        confidence: predictionResult.confidence,
        all_predictions: predictionResult.allPredictions,
        notes: notes || null,
      });

      setResult(predictionResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setNotes('');
  };

  const resultInfo = result ? predictionInfo[result.prediction] : null;
  const ResultIcon = resultInfo?.icon || Info;

  return (
    <DashboardLayout title="X-Ray Analysis">
      <div className="max-w-5xl mx-auto space-y-6">
        <MedicalDisclaimer />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Upload X-Ray Image</CardTitle>
              <CardDescription>
                Upload a chest X-ray image for AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!preview ? (
                <div
                  className={cn('upload-zone', dragging && 'dragging')}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-1">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPEG, PNG, DICOM (max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
                    <img
                      src={preview}
                      alt="X-ray preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="h-4 w-4" />
                      {file?.name}
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetAnalysis}>
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Clinical Notes (Optional)</label>
                <Textarea
                  placeholder="Add any relevant clinical notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                variant="medical"
                size="lg"
                className="w-full"
                onClick={analyzeImage}
                disabled={!file || analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4 mr-2" />
                    Analyze X-Ray
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className={cn('card-medical', result && `result-${result.prediction}`)}>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-generated predictions with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No analysis yet</p>
                  <p className="text-sm">Upload an X-ray image to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Primary Result */}
                  <div className="text-center p-6 rounded-xl bg-muted/50">
                    <ResultIcon className={cn('h-16 w-16 mx-auto mb-4', resultInfo?.color)} />
                    <h3 className={cn('text-2xl font-bold mb-2', resultInfo?.color)}>
                      {resultInfo?.label}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {resultInfo?.description}
                    </p>
                    <div className="text-3xl font-bold text-foreground">
                      {result.confidence}%
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                  </div>

                  {/* All Predictions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">All Classifications</h4>
                    {Object.entries(result.allPredictions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([key, value]) => {
                        const info = predictionInfo[key];
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{info.label}</span>
                              <span className="text-muted-foreground">{value}%</span>
                            </div>
                            <div className="confidence-bar">
                              <div
                                className={cn('confidence-fill', {
                                  'bg-success': key === 'normal',
                                  'bg-destructive': key === 'covid19',
                                  'bg-warning': key === 'pneumonia',
                                  'bg-info': key === 'lung_opacity',
                                })}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <Button variant="outline" className="w-full" onClick={resetAnalysis}>
                    Analyze Another Image
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
