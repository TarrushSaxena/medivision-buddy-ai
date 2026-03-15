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
  Brain,
  Activity,
  Files,
  Zap,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictionResult {
  prediction: 'covid19' | 'pneumonia' | 'lung_opacity' | 'normal';
  confidence: number;
  allPredictions: {
    covid19: number;
    pneumonia: number;
    lung_opacity: number;
    normal: number;
  };
  heatmapImage?: string;
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
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(80);

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
        heatmapImage: response.analysis.heatmap_image,
      };

      setResult(predictionResult);
      setShowHeatmap(true); // Automatically show heatmap when analysis finishes
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
    setShowHeatmap(false);
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
          <Card className="liquid-glass-premium border-none shadow-none">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Drag and drop or click to upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {!preview ? (
                  <motion.div
                    key="upload-zone"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      'upload-zone-premium group cursor-pointer h-64 flex flex-col items-center justify-center p-6 text-center',
                      dragging && 'dragging ripple-effect'
                    )}
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
                    
                    <div className="relative mb-4">
                      <div className={cn(
                        "absolute inset-0 bg-primary/20 blur-xl rounded-full transition-all duration-500",
                        dragging ? "scale-150 opacity-100" : "scale-100 opacity-0"
                      )} />
                      <div className="relative p-4 rounded-2xl bg-muted border border-border/50 group-hover:border-primary/50 transition-colors">
                        <Upload className={cn("h-8 w-8 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
                      </div>
                    </div>

                    <p className="font-bold text-lg mb-1 tracking-tight">
                      {dragging ? "Release to Analyze" : "Drop X-ray here"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      JPEG, PNG, DICOM (max 10MB)
                    </p>

                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      <span className="flex items-center gap-1.5 border border-border/50 px-2 py-1 rounded-md">
                        <Check className="h-3 w-3 text-emerald-500" /> PA/AP
                      </span>
                      <span className="flex items-center gap-1.5 border border-border/50 px-2 py-1 rounded-md">
                        <Check className="h-3 w-3 text-emerald-500" /> NO BLUR
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview-zone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                  <div className="rounded-lg overflow-hidden bg-muted aspect-square relative">
                    {showHeatmap && result?.heatmapImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={preview!} 
                          alt="X-ray original" 
                          className="w-full h-full object-contain absolute inset-0" 
                        />
                        <img 
                          src={result.heatmapImage} 
                          alt="X-ray AI vision" 
                          className="w-full h-full object-contain absolute inset-0 mix-blend-screen transition-opacity duration-300" 
                          style={{ opacity: showHeatmap ? heatmapOpacity / 100 : 0 }}
                        />
                      </div>
                    ) : (
                      <img src={preview!} alt="X-ray preview" className="w-full h-full object-contain" />
                    )}
                    
                    {result?.heatmapImage && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
                        <div className="flex-1 bg-background/80 backdrop-blur-md rounded-xl p-2 border border-border/50 shadow-xl flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant={showHeatmap ? "default" : "secondary"}
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={() => setShowHeatmap(!showHeatmap)}
                          >
                            <Zap className={cn("h-4 w-4", showHeatmap && "fill-current")} />
                          </Button>
                          <div className="flex-1 px-2">
                             <input 
                              type="range"
                              min="0"
                              max="100"
                              value={heatmapOpacity}
                              onChange={(e) => {
                                setHeatmapOpacity(parseInt(e.target.value));
                                if (!showHeatmap) setShowHeatmap(true);
                              }}
                              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                             />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground w-8">{heatmapOpacity}%</span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="shadow-xl bg-background/80 backdrop-blur-md border-border/50 hover:bg-primary hover:text-white transition-all group"
                          onClick={() => window.location.href = `/chat?context=last_analysis&prediction=${result.prediction}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                          Discuss Result
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      {file?.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={resetAnalysis}>Remove</Button>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 opacity-20" />
                  </div>
                  <p>Upload and analyze an image to see medical findings</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Primary Finding</h3>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                      result.prediction === 'normal' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                    )}>
                      {result.prediction.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI Confidence</span>
                      <span className="font-bold">{result.confidence}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        className={cn(
                          "h-full transition-all",
                          result.confidence > 80 ? "bg-emerald-500" : result.confidence > 50 ? "bg-amber-500" : "bg-destructive"
                        )}
                      />
                    </div>
                  </div>

                  {/* Internal Model Visualization Explanation */}
                  {result.heatmapImage && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                      <div className="flex items-center gap-2 text-primary font-medium text-sm">
                        <Zap className="h-4 w-4 fill-current" />
                        <span>How the AI works</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        The <span className="text-foreground font-medium">Grad-CAM Heatmap</span> (AI Vision) highlights the exact biological patterns and features the model used to reach this diagnosis. Warmer colors (red/yellow) indicate areas of high architectural significance to the neural network.
                      </p>
                    </div>
                  )}

                  {/* All Predictions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">All Classifications</h4>
                    {Object.entries(result.allPredictions)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([key, value]) => {
                        const info = predictionInfo[key as keyof typeof predictionInfo];
                        if (!info) return null;
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{info.label}</span>
                              <span className="text-muted-foreground">{value as number}%</span>
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
