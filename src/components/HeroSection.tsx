"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  TrendingUp, 
  PieChart, 
  Target, 
  Sparkles, 
  Shield, 
  Users,
  Star,
  CheckCircle,
  Zap,
  Bot,
  Eye,
  BarChart3,
  ArrowRight,
  Play,
  Space,
  Loader2
} from "lucide-react";
import cyberHero from "@/assets/cyber-hero.jpg";

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_FILE_MB = 25;

// ✅ Point your frontend at FastAPI
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

const HeroSection = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const features = [
    { icon: Bot, text: "AI-Powered Analytics" },
    { icon: Eye, text: "Spending Insights" },
    { icon: BarChart3, text: "Investment Planning" },
    { icon: Users, text: "Social Benchmarking" },
  ];

  // ---- Helpers ----
  const validateFile = (file: File) => {
    const isOkType =
      ACCEPTED_TYPES.includes(file.type) ||
      file.name.toLowerCase().endsWith(".csv") ||
      file.name.toLowerCase().endsWith(".pdf");
    const isOkSize = file.size <= MAX_FILE_MB * 1024 * 1024;

    if (!isOkType) {
      setStatus("Unsupported file type. Use PDF, CSV, or an image.");
      return false;
    }
    if (!isOkSize) {
      setStatus(`File too large. Max ${MAX_FILE_MB}MB.`);
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setStatus("Uploading PDF file...");

      const form = new FormData();
      form.append("file", file);

      console.log("Starting upload to:", `/api/v1/statements/upload`);
      
      // Add timeout and progress updates
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000); // 5 minutes
      
      // Update status periodically
      const statusInterval = setInterval(() => {
        const messages = [
          "Processing PDF content...",
          "Extracting transaction data...", 
          "Analyzing with AI...",
          "Uploading to Databricks...",
          "Almost done..."
        ];
        setStatus(messages[Math.floor(Math.random() * messages.length)]);
      }, 10000);
      
      const res = await fetch(`/api/v1/statements/upload`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeout);
        clearInterval(statusInterval);
      });
      
      console.log("Upload response status:", res.status);

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }

      if (!res.ok) {
        throw new Error(
          data?.detail || data?.error || data?.message || "Upload failed"
        );
      }

      const size =
        typeof data.size_bytes === "number"
          ? data.size_bytes
          : typeof data.size === "number"
          ? data.size
          : file.size;

      if (data.processing) {
        // File is being processed in background
        setStatus("✅ Upload successful! Processing in background...");
        toast({
          title: "Upload successful!",
          description: "Your file is being processed. Check back in a few minutes to see your data in the dashboard.",
        });
        
        // Show completion message after 30 seconds
        setTimeout(() => {
          setStatus("✅ Processing complete! Check your dashboard for new data.");
        }, 30000);
        
      } else {
        // Immediate processing (fallback)
        setStatus(
          `Uploaded: ${data.filename ?? file.name} (${Math.round(size / 1024)} KB)`
        );
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus(
        err?.name === "AbortError"
          ? "Upload timed out. Try again."
          : err?.message || "Something went wrong during upload."
      );
    } finally {
      setUploading(false);
    }
  };

  // ---- Events ----
  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="min-h-screen pt-16 bg-background relative overflow-hidden">
      {/* Animated Background */}

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Announcement Banner */}
        <div className="pt-12 pb-8 text-center animate-fade-in">
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 px-5 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            No bulls**t, just numbers and a plan.
          </Badge>
        </div>

        {/* Hero Headlines */}
        <div className="text-center space-y-8 pt-8 pb-16">
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none">
              Finance Gets
              <span className="text-cyber block animate-glow-pulse">Superhuman</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Upload one monthly statement. See insights you never imagined, budgets that actually fit
              your life, and a roadmap that shows what’s possible, whether it's cutting hidden drains or visualizing the house you could buy if you stick to the plan.
              No filler, just cold hard finance.
            </p>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-background"
                  ></div>
                ))}
              </div>
              <span>230+ statements analyzed</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-warning text-warning" />
              ))}
              <span className="ml-2">4.9/5 rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Bank-level security</span>
            </div>
          </div>

          {/* Main CTA */}
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button
                variant="cyber"
                size="lg"
                className="flex-1"
                onClick={handleBrowseClick}
                disabled={uploading}
              >
                <Upload className="w-5 h-5 mr-2" />
                {uploading ? "Uploading…" : "Upload Statement"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 bg-background/50 border-primary/30 hover:bg-primary/10"
                disabled={uploading}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              SOC 2 Certified • 5-second setup • Data never used in training.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {status && (
              <p className="text-xs text-muted-foreground pt-2" role="status" aria-live="polite">
                {status}
              </p>
            )}
          </div>
        </div>
        {/* Interactive Upload Zone */}
        <div className="max-w-3xl mx-auto mb-16 animate-slide-up">
          <div className="card-neon">
            <div
              className={`card-neon-inner transition-all duration-500 cursor-pointer ${
                isDragOver ? "scale-105 border-primary/50" : ""
              }`}
              onClick={handleBrowseClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center space-y-6 py-8">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary via-electric to-secondary rounded-3xl flex items-center justify-center animate-float">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-cyber-pulse">
                    <Zap className="w-3 h-3 text-accent-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-electric">
                    Drop Your Statement Here
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    PDF, CSV, or image files supported • Instant AI analysis • 100% secure processing
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="flex items-center space-x-2 text-muted-foreground">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Click or drag a file to upload. Max {MAX_FILE_MB}MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example final CTA */}
        <div className="text-center pb-20">
          <Card className="card-neon max-w-2xl mx-auto">
            <div className="card-neon-inner py-12">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-cyber">Ready to Transform Your Finances?</h3>
                <p className="text-muted-foreground">
                  Join 12,450+ users who've already discovered the power of AI-driven financial insights.
                </p>
                <Button
                  variant="cyber"
                  size="lg"
                  className="px-12"
                  onClick={handleBrowseClick}
                  disabled={uploading}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploading ? "Uploading…" : "Get Started Free"}

                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
