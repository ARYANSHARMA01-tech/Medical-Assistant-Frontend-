import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FloatingDoctorButton } from "@/components/FloatingDoctorButton";

interface AnalysisResult {
  disease: string;
  details: string;
}

const ImageAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG or PNG)");
        return;
      }

      setSelectedFile(file);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        // "http://127.0.0.1:8000/image",
            "https://brand-sunrise-production-keys.trycloudflare.com/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult({
        disease: response.data.detected_disease || "Unknown",
        details: response.data.details || "Analysis complete",
      });

      toast.success("Image analyzed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to analyze image. Make sure your backend is running at http://127.0.0.1:8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                AI Skin Disease Detector 🖼️
              </h1>
              <p className="text-muted-foreground">
                Upload an image to detect potential skin conditions using AI
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="p-6 shadow-medium border-border">
                <h2 className="text-xl font-semibold mb-4">Upload Image</h2>

                <div className="space-y-4">
                  {/* File Input */}
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-smooth"
                  >
                    {preview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG or JPG (MAX. 10MB)</p>
                      </div>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 w-4 h-4" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                    {(selectedFile || result) && (
                      <Button variant="outline" onClick={handleReset}>
                        Reset
                      </Button>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Selected: {selectedFile.name}</p>
                      <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Results Section */}
              <Card className="p-6 shadow-medium border-border">
                <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>

                {!result && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Upload an image and click "Analyze Image" to see results
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Analyzing your image...</p>
                  </div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Analysis Complete</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Detected Condition</p>
                        <p className="text-xl font-bold text-primary">{result.disease}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-sm text-muted-foreground mb-2">Details</p>
                        <p className="text-sm whitespace-pre-wrap">{result.details}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Disclaimer: This is an AI prediction and should not replace professional medical advice. Please consult a healthcare provider for accurate diagnosis.
                      </p>
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>

            <Card className="mt-8 p-6 bg-secondary/30 border-border">
              <h3 className="font-semibold mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use clear, well-lit images</li>
                <li>• Focus on the affected area</li>
                <li>• Avoid blurry or low-quality photos</li>
                <li>• Ensure the skin condition is clearly visible</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
      <FloatingDoctorButton />
    </div>
  );
};

export default ImageAnalysis;
