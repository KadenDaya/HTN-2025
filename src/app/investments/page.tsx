"use client";

import { useMemo, useState } from "react";
import {
  Home,
  Car,
  Rocket,
  ChevronDown,
  CalendarClock,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";

// --- Helpers ---
function formatCurrency(n: number | string) {
  const num = typeof n === "string" ? Number(n.replace(/[^0-9.]/g, "")) : n;
  if (Number.isNaN(num)) return "";
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function PlanningPage() {
  const [prompt, setPrompt] = useState<"house" | "car" | "explore" | null>(null);
  const [goal, setGoal] = useState<"house" | "purchase" | "explore">("house");
  const [duration, setDuration] = useState("3"); // years
  const [target, setTarget] = useState<string>("");
  const [isPromptSelected, setIsPromptSelected] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // House buying form data
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<string>("");

  const prettyTarget = useMemo(() => (target ? `$ ${formatCurrency(target)}` : ""), [target]);
  const prettyIncome = useMemo(() => (monthlyIncome ? `$ ${formatCurrency(monthlyIncome)}` : ""), [monthlyIncome]);
  const prettyRent = useMemo(() => (monthlyRent ? `$ ${formatCurrency(monthlyRent)}` : ""), [monthlyRent]);

  const riskOptions = [
    { value: "very-aggressive", label: "Very Aggressive", description: "High risk, high reward - I want maximum growth potential" },
    { value: "aggressive", label: "Aggressive", description: "Above average risk - I can handle volatility for better returns" },
    { value: "moderate", label: "Moderate", description: "Balanced approach - Some risk for steady growth" },
    { value: "conservative", label: "Conservative", description: "Lower risk - I prefer stability over high returns" },
    { value: "very-conservative", label: "Very Conservative", description: "Minimal risk - Capital preservation is my priority" }
  ];

  const handlePromptSelect = (promptId: "house" | "car" | "explore") => {
    setPrompt(promptId);
    setIsPromptSelected(true);
    
    // Show form for house buying
    if (promptId === "house") {
      setTimeout(() => setShowForm(true), 800);
    }
  };

  const handleBackToSelection = () => {
    setPrompt(null);
    setIsPromptSelected(false);
    setShowForm(false);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    // Reset form data
    setMonthlyIncome("");
    setMonthlyRent("");
    setRiskTolerance("");
  };

  const callRBCAnalysis = async (income: string, rent: string, risk: string) => {
    const incomeNum = parseInt(income.replace(/[^0-9]/g, ""));
    const rentNum = parseInt(rent.replace(/[^0-9]/g, ""));
    
    const response = await fetch("/api/v1/house-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer mock-jwt-token",
      },
      body: JSON.stringify({
        monthly_income: incomeNum,
        monthly_rent: rentNum,
        risk_tolerance: risk,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    return await response.json();
  };

  const handleFormSubmit = async () => {
    if (!monthlyIncome || !monthlyRent || !riskTolerance) {
      return; // Basic validation
    }

    setShowForm(false); // Close modal
    setIsAnalyzing(true);
    
    try {
      // Call RBC API for real analysis
      const results = await callRBCAnalysis(monthlyIncome, monthlyRent, riskTolerance);
      setAnalysisResults(results);
      setAnalysisComplete(true);
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback to basic calculation if API fails
      const incomeNum = parseInt(monthlyIncome.replace(/[^0-9]/g, ""));
      const rentNum = parseInt(monthlyRent.replace(/[^0-9]/g, ""));
      const creditCardNum = incomeNum * 0.15; // Estimate 15% of income for credit cards
      const disposableIncome = incomeNum - rentNum - creditCardNum;
      const monthlySavings = disposableIncome * 0.3;
      const totalContributions = monthlySavings * 60; // 5 years
      const fallbackResults = {
        monthly_income: incomeNum,
        monthly_rent: rentNum,
        monthly_credit_card: creditCardNum,
        disposable_income: disposableIncome,
        monthly_savings: monthlySavings,
        investment_period_years: 5,
        total_contributions: totalContributions,
        projected_value_5_years: totalContributions * 1.4, // Basic 40% growth estimate
        investment_growth: totalContributions * 0.4,
        expected_annual_return: "7.0%",
        risk_profile: riskTolerance,
        portfolio_type: "balanced",
        recommendations: ["Analysis temporarily unavailable - showing basic estimates"]
      };
      setAnalysisResults(fallbackResults);
      setAnalysisComplete(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickPrompts = [
    {
      id: "house" as const,
      label: "I want to buy a house in the next 5 years",
      Icon: Home,
    },
    { id: "car" as const, label: "I want to buy my dream car", Icon: Car },
    {
      id: "explore" as const,
      label: "Show me what's possible in the next 3 years",
      Icon: Rocket,
    },
  ];

  const handleConfirm = () => {
    // In a future step you can route to a results page or open a side panel.
    console.log({ prompt, goal, duration, target: Number(target || 0) });
  };

  return (
    <div className="mt-15 relative min-h-screen w-full overflow-x-hidden bg-[radial-gradient(1200px_600px_at_70%_-10%,rgba(147,51,234,0.15),transparent),radial-gradient(900px_500px_at_20%_10%,rgba(59,130,246,0.15),transparent)]">
      {/* Subtle grid background */}
      <Navigation />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06]"
      />

      {/* Content */}
      <main className={cn(
        "relative mx-auto flex w-full flex-col items-center transition-all duration-1000 ease-in-out",
        isPromptSelected 
          ? "max-w-4xl px-4 pt-8" 
          : "max-w-6xl gap-8 px-4 pb-24 pt-14 sm:pt-20"
      )}>
        {/* Heading - Hide when prompt is selected */}
        <div className={cn(
          "text-center space-y-4 transition-all duration-700 ease-in-out",
          isPromptSelected ? "opacity-0 scale-95 -translate-y-12 pointer-events-none absolute" : "opacity-100 scale-100 translate-y-0"
        )}>
          <h1 className="text-balance bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-5xl lg:text-6xl">
            Choose a goal, a timeframe, and stick to it.
          </h1>
          <div className="flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
          </div>
        </div>

        {/* Selected Prompt Display - Move to top when selected */}
        {isPromptSelected && prompt && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            <div className="text-center space-y-6">
              <button
                onClick={handleBackToSelection}
                className="text-white/60 hover:text-white text-sm transition-colors duration-200 mb-6"
              >
                ← Back to selection
              </button>
              
              <div className="relative max-w-3xl mx-auto">
                {/* Gradient border wrapper */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-75 blur-sm" />
                
                <div className="relative rounded-2xl bg-gradient-to-b from-white/15 to-white/5 p-8 backdrop-blur-sm shadow-[0_20px_60px_-12px_rgba(147,51,234,0.4)]">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 ring-2 ring-white/30 shadow-lg shadow-purple-500/20">
                      {(() => {
                        const selectedPrompt = quickPrompts.find(p => p.id === prompt);
                        const Icon = selectedPrompt?.Icon;
                        return Icon ? <Icon className="h-10 w-10 text-white drop-shadow-sm" /> : null;
                      })()}
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {quickPrompts.find(p => p.id === prompt)?.label}
                  </h2>
                  
                  <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-purple-400 to-blue-400 mx-auto" />
                </div>
              </div>
            </div>
            
            {/* AI Response Area - Simplified */}
            <div className="mt-12 w-full max-w-4xl mx-auto">
              <div className="min-h-[200px] rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                {prompt === "house" && !isAnalyzing && !analysisComplete && !showForm ? (
                  <div className="text-center text-white/60">
                    <div className="animate-pulse">Preparing your personalized analysis...</div>
                  </div>
                ) : analysisComplete && analysisResults ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        💰 Your 5-Year Investment Projection
                      </h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        analysisResults.rbc_api_used 
                          ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                      }`}>
                        {analysisResults.rbc_api_used ? '✅ RBC InvestEase API' : '⚠️ Estimated Data'}
                        <span className="text-white/60">• {analysisResults.data_source}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      {/* Currently Section */}
                      <div>
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-3">
                            Currently
                          </h4>
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                              ${analysisResults.monthly_savings?.toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70 mb-1">Monthly Savings</div>
                            <div className="text-xs text-white/50">
                              After rent (${analysisResults.monthly_rent?.toLocaleString()}) & credit cards (${analysisResults.monthly_credit_card?.toLocaleString()})
                            </div>
                          </div>
                          
                          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                              ${analysisResults.total_contributions?.toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70 mb-1">Total Contributions (5 years)</div>
                            <div className="text-xs text-white/50">
                              ${analysisResults.monthly_savings?.toLocaleString()}/month × 60 months
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Changing a Habit Section */}
                      <div>
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-3">
                            Changing a habit
                          </h4>
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-orange-400 mb-2">
                              ${((analysisResults.monthly_savings || 0) + (analysisResults.monthly_credit_card || 0) * 0.3).toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70 mb-1">Monthly Savings by reducing credit card spending by 30%</div>
                            <div className="text-xs text-white/50">
                              +${((analysisResults.monthly_credit_card || 0) * 0.3).toLocaleString()}/month extra savings
                            </div>
                          </div>

                          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">
                              ${analysisResults.projected_value_5_years?.toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70 mb-1">
                              {analysisResults.rbc_api_used ? 'RBC Projected Value' : 'Estimated Value'}
                            </div>
                            <div className="text-xs text-white/50">
                              {analysisResults.rbc_analysis?.rbc_portfolio_type || 'balanced'} portfolio • {analysisResults.expected_annual_return} return
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Investment Details */}
                      <div className="bg-white/5 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">📊 Investment Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Monthly Income:</span>
                            <span className="text-white font-medium">${analysisResults.monthly_income?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Monthly Rent:</span>
                            <span className="text-white font-medium">${analysisResults.monthly_rent?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Credit Card Spending:</span>
                            <div className="text-right">
                              <span className="text-white font-medium">${analysisResults.monthly_credit_card?.toLocaleString()}</span>
                              <div className="text-xs text-white/50">
                                {analysisResults.credit_card_data_source || "From statements"}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Disposable Income:</span>
                            <span className="text-white font-medium">${analysisResults.disposable_income?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Monthly Investment:</span>
                            <span className="text-green-400 font-medium">${analysisResults.monthly_savings?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Expected Annual Return:</span>
                            <span className="text-blue-400 font-medium">{analysisResults.expected_annual_return}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Investment Period:</span>
                            <span className="text-white font-medium">{analysisResults.investment_period_years} years</span>
                          </div>
                          {analysisResults.rbc_analysis?.rbc_portfolio_type && (
                            <div className="flex justify-between col-span-2">
                              <span className="text-white/70">RBC Portfolio Strategy:</span>
                              <span className="text-purple-400 font-medium capitalize">{analysisResults.rbc_analysis.rbc_portfolio_type}</span>
                            </div>
                          )}
                          {analysisResults.rbc_api_used && analysisResults.rbc_analysis?.portfolio_id && (
                            <div className="flex justify-between col-span-2">
                              <span className="text-white/70">RBC Portfolio ID:</span>
                              <span className="text-green-400 font-medium text-xs">{analysisResults.rbc_analysis.portfolio_id.substring(0, 8)}...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-white/5 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">📋 Personalized Recommendations</h4>
                        <div className="space-y-3">
                          {analysisResults.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-white/80 text-sm">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={handleBackToSelection}
                          variant="outline"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                        >
                          Try Another Goal
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          onClick={() => {
                            // Future: Navigate to detailed planning page
                            console.log("Navigate to detailed planning");
                          }}
                        >
                          Create Detailed Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                    <div className="text-white/80">Analyzing your financial situation...</div>
                    <div className="text-white/60 text-sm">This may take a few moments</div>
                  </div>
                ) : (
                  <div className="text-center text-white/60">
                    {/* This is where other prompt responses or AI typing animation will go */}
                    <div className="animate-pulse">AI analysis will appear here...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compact Form Modal - Overlay */}
        {prompt === "house" && showForm && !isAnalyzing && !analysisComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-md bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/20 p-6 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">🏠 House Analysis</h3>
                <p className="text-sm text-white/70">Quick financial assessment</p>
                <div className="mt-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <p className="text-xs text-blue-300">💳 Credit card spending will be automatically pulled from your uploaded statements</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Monthly Income - Compact */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Monthly income after taxes
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="5,000"
                      className="pl-8 h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      value={prettyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      onFocus={(e) => {
                        const raw = e.currentTarget.value.replace(/[^0-9]/g, "");
                        setMonthlyIncome(raw);
                        const el = e.currentTarget; // Store reference before async operation
                        requestAnimationFrame(() => {
                          if (el && el.value !== undefined) {
                            el.selectionStart = el.selectionEnd = el.value.length;
                          }
                        });
                      }}
                      onBlur={(e) => {
                        setMonthlyIncome(e.currentTarget.value.replace(/[^0-9]/g, ""));
                      }}
                    />
                  </div>
                </div>

                {/* Monthly Rent - Compact */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Monthly rent/housing costs
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="1,500"
                      className="pl-8 h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      value={prettyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      onFocus={(e) => {
                        const raw = e.currentTarget.value.replace(/[^0-9]/g, "");
                        setMonthlyRent(raw);
                        const el = e.currentTarget; // Store reference before async operation
                        requestAnimationFrame(() => {
                          if (el && el.value !== undefined) {
                            el.selectionStart = el.selectionEnd = el.value.length;
                          }
                        });
                      }}
                      onBlur={(e) => {
                        setMonthlyRent(e.currentTarget.value.replace(/[^0-9]/g, ""));
                      }}
                    />
                  </div>
                </div>


                {/* Risk Tolerance - Compact Options Bar */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Investment risk tolerance
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {riskOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={() => setRiskTolerance(option.value)}
                        className={cn(
                          "relative p-2 rounded-lg text-xs font-medium transition-all duration-200 text-center",
                          riskTolerance === option.value
                            ? "bg-purple-500/30 text-white ring-1 ring-purple-400/50"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        )}
                        title={option.description}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            riskTolerance === option.value ? "bg-purple-400" : "bg-white/40"
                          )} />
                          <span className="leading-tight">
                            {option.label.split(' ')[0]}
                            <br />
                            <span className="text-[10px] opacity-80">
                              {option.label.split(' ')[1] || ''}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {riskTolerance && (
                    <p className="text-[10px] text-white/60 mt-1 text-center">
                      {riskOptions.find(opt => opt.value === riskTolerance)?.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1 h-8 text-xs border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    disabled={!monthlyIncome || !monthlyRent || !riskTolerance}
                    className="flex-2 h-8 text-xs bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed"
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Prompt Cards - Hide when prompt is selected */}
        {!isPromptSelected && (
          <section className="mt-[2%] grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {quickPrompts.map(({ id, label, Icon }) => (
            <div key={id} className="group relative">
              {/* Gradient border wrapper */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100",
                  prompt === id
                    ? "from-purple-400 via-pink-400 to-blue-400 opacity-75"
                    : "from-purple-400/50 via-pink-400/50 to-blue-400/50"
                )}
              />
              
              {/* Animated gradient border */}
              <div
                className=""
              >
                <button
                  onClick={() => handlePromptSelect(id)}
                  className={cn(
                    "relative h-full w-full rounded-2xl bg-gradient-to-b p-6 text-left transition-all duration-300",
                    "from-white/8 to-white/2 group-hover:from-white/12 group-hover:to-white/4",
                    "backdrop-blur-sm",
                    prompt === id && "from-white/15 to-white/5 shadow-[0_20px_60px_-12px_rgba(147,51,234,0.4)]"
                  )}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="relative flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                        "bg-gradient-to-br shadow-lg",
                        prompt === id
                          ? "from-purple-500/20 to-blue-500/20 ring-2 ring-white/30 shadow-purple-500/20"
                          : "from-white/10 to-white/5 ring-1 ring-white/20 group-hover:from-purple-500/10 group-hover:to-blue-500/10 group-hover:ring-white/30"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "h-6 w-6 transition-all duration-300",
                          prompt === id 
                            ? "text-white drop-shadow-sm" 
                            : "text-white/80 group-hover:text-white group-hover:scale-110"
                        )} 
                      />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "font-semibold leading-snug transition-all duration-300",
                        prompt === id 
                          ? "text-white text-base" 
                          : "text-white/90 text-sm group-hover:text-white group-hover:text-base"
                      )}>
                        {label}
                      </p>
                      <div className={cn(
                        "h-0.5 w-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500",
                        prompt === id ? "w-full" : "group-hover:w-3/4"
                      )} />
                    </div>
                  </div>
                  
                  {/* Click indicator */}
                  <div className={cn(
                    "absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                    "bg-white/10 opacity-0 group-hover:opacity-100",
                    prompt === id && "bg-purple-500/30 opacity-100"
                  )}>
                    <ChevronDown className="h-3 w-3 rotate-[-90deg] text-white/80" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </section>
        )}

        {/* Middle Compact Control Bar - Hide when prompt is selected */}
        {!isPromptSelected && (
          <Card className="mt-[6%] w-full max-w-4xl rounded-2xl border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.45)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
              {/* Goal */}
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-white/60">Goal</label>
                <div className="relative">
                  <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                  <Select value={goal} onValueChange={(v) => setGoal(v as any)}>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        <SelectItem value="house">I want to save for a house</SelectItem>
                        <SelectItem value="purchase">I want to splurge on a big purchase</SelectItem>
                        <SelectItem value="explore">I want to see what's possible</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration */}
              <div className="w-full md:w-48">
                <label className="mb-1.5 block text-xs font-medium text-white/60">Duration</label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                  <Select value={String(duration)} onValueChange={setDuration}>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="10">10+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target */}
              <div className="w-full md:w-64">
                <label className="mb-1.5 block text-xs font-medium text-white/60">Target amount</label>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Amount ($)"
                    className="pl-10"
                    value={prettyTarget}
                    onChange={(e) => setTarget(e.target.value)}
                    onFocus={(e) => {
                      // strip formatting on focus for easier typing
                      const raw = e.currentTarget.value.replace(/[^0-9]/g, "");
                      setTarget(raw);
                      // place caret at end on next tick
                      const el = e.currentTarget; // Store reference before async operation
                      requestAnimationFrame(() => {
                        if (el && el.value !== undefined) {
                          el.selectionStart = el.selectionEnd = el.value.length;
                        }
                      });
                    }}
                    onBlur={(e) => {
                      setTarget(e.currentTarget.value.replace(/[^0-9]/g, ""));
                    }}
                  />
                </div>
              </div>

              {/* Confirm */}
              <div className="w-full md:w-auto">
                <label className="mb-1.5 block text-xs font-medium text-transparent select-none">confirm</label>
                <Button className="w-full md:w-auto" onClick={handleConfirm}>
                  Confirm
                </Button>
              </div>
            </div>

            <p className="text-xs text-white/60">
              Tip: Set an amount that feels ambitious yet achievable for your timeframe.
            </p>
          </div>
        </Card>
        )}
      </main>
    </div>
  );
}
