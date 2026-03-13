import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { xrayAPI } from '@/lib/api';
import {
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Check,
  Image,
  Eye,
  FileText
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

const predictionInfo: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle; description: string }> = {
  normal: {
    label: 'Normal',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCircle,
    description: 'No significant abnormalities detected.',
  },
  covid19: {
    label: 'COVID-19',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: XCircle,
    description: 'Pattern consistent with COVID-19 pneumonia.',
  },
  pneumonia: {
    label: 'Pneumonia',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: AlertTriangle,
    description: 'Signs of bacterial or viral pneumonia detected.',
  },
  lung_opacity: {
    label: 'Lung Opacity',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: Info,
    description: 'Lung opacity detected, requires investigation.',
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
    handleFileChange(e.dataTransfer.files[0]);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Convert image to base64 for storage
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Send to real backend API which contacts Python FastAPI
      const response = await xrayAPI.upload({
        image_data: imageData,
        notes: notes || undefined,
      });

      const predictionResult: PredictionResult = {
        prediction: response.analysis.prediction as PredictionResult['prediction'],
        confidence: response.analysis.confidence,
        allPredictions: response.analysis.all_predictions,
      };

      setResult(predictionResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze. Please try again.');
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
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">X-Ray Analysis</h1>
            <p className="text-muted-foreground">Upload chest X-rays for AI-assisted analysis</p>
          </div>
        </div>

        {/* Compact Disclaimer */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Educational Tool:</strong> AI findings require verification by a qualified healthcare professional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload */}
          <Card className="card-simple">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Drag and drop or click to upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!preview ? (
                <div
                  className={cn('upload-zone', dragging && 'border-primary bg-primary/5')}
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
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Drop X-ray image here</p>
                  <p className="text-sm text-muted-foreground mb-4">JPEG, PNG, DICOM (max 10MB)</p>

                  {/* Quality Checklist */}
                  <div className="text-left bg-muted/50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-medium mb-2 text-foreground">For best results:</p>
                    <div className="space-y-1.5">
                      {[
                        'Correct PA/AP orientation',
                        'No blur or motion artifacts',
                        'Full chest visible in frame'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-success" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-muted aspect-square">
                    <img src={preview} alt="X-ray preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      {file?.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={resetAnalysis}>Remove</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Clinical Notes (Optional)</label>
                <Textarea
                  placeholder="Add relevant patient history or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={analyzeImage}
                disabled={!file || analyzing}
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing... please wait
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

          {/* Results */}
          <Card className="card-simple">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>AI-generated findings</CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12">
                  {/* Placeholder skeleton */}
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Upload an X-ray to see:</p>
                      <div className="space-y-2 text-sm text-muted-foreground/70">
                        <div className="flex items-center justify-center gap-2">
                          <Eye className="h-3 w-3" />
                          AI-detected findings
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Confidence levels
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-3 w-3" />
                          Classification breakdown
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Primary Result */}
                  <div className={cn('text-center p-6 rounded-xl', resultInfo?.bgColor)}>
                    <ResultIcon className={cn('h-12 w-12 mx-auto mb-3', resultInfo?.color)} />
                    <h3 className={cn('text-xl font-semibold mb-1', resultInfo?.color)}>
                      {resultInfo?.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{resultInfo?.description}</p>
                    <div className="text-3xl font-bold">{result.confidence}%</div>
                    <p className="text-xs text-muted-foreground">Confidence Score</p>
                  </div>

                  {/* All Predictions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">All Classifications</h4>
                    {Object.entries(result.allPredictions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([key, value]) => {
                        const info = predictionInfo[key];
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{info.label}</span>
                              <span className="text-muted-foreground">{value}%</span>
                            </div>
                            <div className="confidence-bar">
                              <div
                                className={cn('confidence-fill', {
                                  'bg-green-500': key === 'normal',
                                  'bg-red-500': key === 'covid19',
                                  'bg-amber-500': key === 'pneumonia',
                                  'bg-blue-500': key === 'lung_opacity',
                                })}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Educational Note */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> These results are for educational purposes.
                      Clinical correlation and professional interpretation are essential.
                    </p>
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
