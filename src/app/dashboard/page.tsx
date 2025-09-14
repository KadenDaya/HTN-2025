"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";

// Typing effect hook
const useTypingEffect = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setIsTyping(true);
    setDisplayedText("");
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Smartphone,
  Plane,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
  Eye,
  CreditCard,
  Wallet,
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';

// Typing Tooltip Component with AI-style typography
const TypingTooltip = ({ title, insight, insightColor, insightIcon, categoryName }: {
  title: string;
  insight: string;
  insightColor: string;
  insightIcon: string;
  categoryName: string;
}) => {
  const { displayedText, isTyping } = useTypingEffect(insight, 25);
  
  return (
    <div className="bg-black/95 backdrop-blur-xl border border-green-400/30 rounded-2xl p-6 shadow-2xl max-w-lg animate-in fade-in-0 zoom-in-95 duration-200 font-mono">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${insightColor} rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
          {insightIcon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-green-400 text-lg mb-1 tracking-wide font-mono">{categoryName}</h4>
          <p className="text-green-300/90 text-sm font-medium font-mono tracking-wider">{title}</p>
        </div>
      </div>
      
      <div className="bg-gray-900/80 border border-green-400/20 p-4 rounded-xl min-h-[80px] flex items-start">
        <div className="flex items-start gap-2 w-full">
          <span className="text-green-400 text-xs font-mono mt-1 flex-shrink-0">  </span>
          <p className="text-green-100 text-sm font-mono leading-relaxed tracking-wide flex-1">
            {displayedText}
            {isTyping && <span className="animate-pulse text-green-400 font-bold">█</span>}
          </p>
        </div>
      </div>
      
      {/* AI Terminal-style footer */}
      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-green-400/60">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span>MARTIAN_AI_ASSISTANT_v2.1</span>
        <span className="ml-auto">ANALYZING...</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data
        const dashboardResponse = await fetch('http://127.0.0.1:8000/api/v1/dashboard');
        if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await dashboardResponse.json();
        setDashboardData(dashboardData);

        // Fetch all transactions for real bad spending analysis
        const transactionsResponse = await fetch('http://127.0.0.1:8000/api/v1/transactions');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setAllTransactions(transactionsData.transactions || []);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for charts
  const spendingData = dashboardData?.spending_by_category || [];
  
  // Function to find real bad spending examples from actual transactions
  const findBadSpendingExamples = () => {
    if (!allTransactions.length || !spendingData.length) return [];

    return spendingData
      .filter((item: any) => {
        const percentage = ((item.total_amount / (dashboardData?.total_spent || 1)) * 100);
        return percentage > 15; // Only categories with significant spending
      })
      .slice(0, 4)
      .map((categoryData: any) => {
        // Find transactions that match this category by description keywords
        const categoryName = categoryData.category.toLowerCase();
        let categoryKeywords: string[] = [];
        
        if (categoryName.includes('food') || categoryName.includes('dining') || categoryName.includes('restaurant')) {
          categoryKeywords = ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'burger', 'starbucks', 'mcdonalds', 'subway', 'tim hortons'];
        } else if (categoryName.includes('transport') || categoryName.includes('uber') || categoryName.includes('taxi')) {
          categoryKeywords = ['uber', 'lyft', 'taxi', 'transport', 'gas', 'fuel', 'parking', 'transit'];
        } else if (categoryName.includes('entertainment') || categoryName.includes('streaming')) {
          categoryKeywords = ['netflix', 'spotify', 'entertainment', 'movie', 'theater', 'gaming', 'steam'];
        } else if (categoryName.includes('shopping') || categoryName.includes('retail')) {
          categoryKeywords = ['amazon', 'walmart', 'target', 'shopping', 'retail', 'store', 'mall'];
        } else {
          // Generic keywords for other categories
          categoryKeywords = [categoryName.split(' ')[0]];
        }

        // Find matching transactions
        const matchingTransactions = allTransactions.filter((transaction: any) => {
          const description = (transaction.description || '').toLowerCase();
          return categoryKeywords.some(keyword => description.includes(keyword)) && 
                 Math.abs(transaction.amount) > 0; // Only actual spending (negative amounts)
        });

        // Find the highest transaction in this category
        const highestTransaction = matchingTransactions.reduce((max: any, current: any) => {
          const currentAmount = Math.abs(current.amount);
          const maxAmount = Math.abs(max?.amount || 0);
          return currentAmount > maxAmount ? current : max;
        }, null);

        if (!highestTransaction) {
          // Fallback to simulated data if no matching transactions found
          const avgPerTransaction = categoryData.total_amount / categoryData.transaction_count;
          const simulatedAmount = avgPerTransaction * 2.5;
          return {
            category: categoryData.category,
            isReal: false,
            amount: simulatedAmount,
            description: `Estimated high ${categoryName} expense`,
            location: 'Various locations',
            date: 'Recent'
          };
        }

        return {
          category: categoryData.category,
          isReal: true,
          amount: Math.abs(highestTransaction.amount),
          description: highestTransaction.description,
          location: highestTransaction.location || 'Not specified',
          date: highestTransaction.date || highestTransaction.transaction_date,
          percentage: ((categoryData.total_amount / (dashboardData?.total_spent || 1)) * 100)
        };
      });
  };

  const badSpendingExamples = findBadSpendingExamples();
  
  // Enhanced gradient colors for charts
  const COLORS = [
    'url(#gradient0)', 'url(#gradient1)', 'url(#gradient2)', 
    'url(#gradient3)', 'url(#gradient4)', 'url(#gradient5)', 'url(#gradient6)'
  ];
  
  // Fallback solid colors
  const SOLID_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
  
  // Prepare pie chart data
  const pieChartData = spendingData.map((item: any, index: number) => ({
    name: item.category,
    value: item.total_amount,
    count: item.transaction_count,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare bar chart data
  const barChartData = spendingData.map((item: any) => ({
    category: item.category.replace(' & ', '\n& '),
    amount: item.total_amount,
    transactions: item.transaction_count
  }));

  // Generate AI-powered insights
  const generateInsights = () => {
    if (!dashboardData) return [];
    
    const insights = [];
    const totalSpent = dashboardData.total_spent;
    const avgTransaction = dashboardData.avg_transaction;
    const categories = dashboardData.spending_by_category;
    
    // Top spending category insight
    if (categories.length > 0) {
      const topCategory = categories[0];
      const percentage = ((topCategory.total_amount / totalSpent) * 100).toFixed(1);
      insights.push({
        title: `${topCategory.category} is your biggest expense`,
        description: `You spent $${topCategory.total_amount.toFixed(2)} (${percentage}%) on ${topCategory.category.toLowerCase()} this period`,
        type: "info",
        icon: Eye,
        value: `$${topCategory.total_amount.toFixed(2)}`
      });
    }
    
    // Average transaction insight
    if (avgTransaction > 20) {
      insights.push({
        title: "Higher than average transactions",
        description: `Your average transaction of $${avgTransaction.toFixed(2)} suggests premium spending habits`,
        type: "warning",
        icon: TrendingUp,
        value: `$${avgTransaction.toFixed(2)}`
      });
    } else {
      insights.push({
        title: "Controlled spending pattern",
        description: `Your average transaction of $${avgTransaction.toFixed(2)} shows disciplined spending`,
        type: "success",
        icon: CheckCircle,
        value: `$${avgTransaction.toFixed(2)}`
      });
    }
    
    // Transaction frequency insight
    const totalTransactions = dashboardData.total_transactions;
    if (totalTransactions > 30) {
      insights.push({
        title: "High transaction frequency",
        description: `${totalTransactions} transactions suggest active spending - consider consolidating purchases`,
        type: "warning",
        icon: CreditCard,
        value: `${totalTransactions} txns`
      });
    }
    
    // Savings opportunity
    const potentialSavings = totalSpent * 0.15; // Assume 15% savings potential
    insights.push({
      title: "Savings opportunity identified",
      description: `By optimizing your top 3 categories, you could save up to $${potentialSavings.toFixed(2)}`,
      type: "success",
      icon: Target,
      value: `$${potentialSavings.toFixed(2)}`
    });
    
    // Budget recommendation
    const recommendedBudget = totalSpent * 1.1; // 10% buffer
    insights.push({
      title: "Recommended monthly budget",
      description: `Based on your spending pattern, set a budget of $${recommendedBudget.toFixed(2)} for better control`,
      type: "info",
      icon: Wallet,
      value: `$${recommendedBudget.toFixed(2)}`
    });
    
    return insights;
  };

  const insights = generateInsights();

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading your financial insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <Navigation />
      <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Financial Analytics Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            The story behind your statement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-cyber hover-lift bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Spent</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                    ${dashboardData?.total_spent?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">This period</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-cyber hover-lift bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Transactions</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {dashboardData?.total_transactions || "0"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total count</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-cyber hover-lift bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Transaction</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    ${dashboardData?.avg_transaction?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-cyber hover-lift bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Categories</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    {spendingData.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Spending areas</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Left Side */}
          <Card className="card-cyber overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                Spending Distribution
              </CardTitle>
              <CardDescription className="text-sm opacity-80">
                Hover for AI insights ✨
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={140}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {pieChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <defs>
                      <linearGradient id="gradient0" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#65a30d" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          const percentage = ((data.value / (dashboardData?.total_spent || 1)) * 100);
                          const avgPerTransaction = data.value / data.count;
                          
                          // Generate category-specific AI insights with Martian credits consideration
                          let insight = "";
                          let insightColor = "";
                          let insightIcon = "";
                          let title = "";
                          
                          const categoryName = data.name.toLowerCase();
                          const isHighSpending = percentage > 25;
                          const isFrequentBuying = data.count > 15;
                          const isExpensivePurchases = avgPerTransaction > 100;
                          
                          // Category-specific insights
                          if (categoryName.includes('food') || categoryName.includes('dining') || categoryName.includes('restaurant') || categoryName.includes('grocery')) {
                            if (isHighSpending) {
                              title = "🍔 EATING OUT TOO MUCH";
                              insightColor = "from-red-500 to-orange-500";
                              insightIcon = "🍔";
                              insight = `${percentage.toFixed(0)}% on food is expensive! You're spending $${data.value.toFixed(0)} when you could meal prep for $${(data.value * 0.4).toFixed(0)}. Try cooking 4 days a week, use grocery apps like Instacart for deals, batch cook on Sundays. Those $15 lunch orders add up to $300/month - make sandwiches instead and save $200!`;
                            } else if (isFrequentBuying) {
                              title = "🥪 TOO MANY FOOD ORDERS";
                              insightColor = "from-yellow-500 to-orange-500";
                              insightIcon = "🥪";
                              insight = `${data.count} food purchases is a lot! You're ordering out instead of planning meals. Try meal prepping on weekends, keep healthy snacks at work, use a grocery list app. Cook in batches - make 4 servings at once. Your wallet and health will thank you!`;
                            } else {
                              title = "✅ SMART FOOD SPENDING";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Great job! ${percentage.toFixed(0)}% on food is reasonable. You're balancing eating out with home cooking. Keep using grocery store loyalty programs, try generic brands, and don't shop when hungry. You're already doing what nutritionists recommend!`;
                            }
                          } else if (categoryName.includes('transport') || categoryName.includes('gas') || categoryName.includes('uber') || categoryName.includes('taxi') || categoryName.includes('car')) {
                            if (isHighSpending) {
                              title = "🚗 TRANSPORTATION COSTS HIGH";
                              insightColor = "from-red-500 to-orange-500";
                              insightIcon = "🚗";
                              insight = `${percentage.toFixed(0)}% on transport is steep! If you're Ubering everywhere, try public transit, bike sharing, or carpooling. A monthly metro pass costs $100 vs $400+ in rideshares. Walk short distances, combine errands into one trip. Your Martian credits are precious - don't waste them on convenience!`;
                            } else if (isFrequentBuying) {
                              title = "🚕 TOO MANY RIDES";
                              insightColor = "from-yellow-500 to-orange-500";
                              insightIcon = "🚕";
                              insight = `${data.count} transport purchases suggests lots of short trips. Try walking distances under 1 mile, use a bike, or batch your errands. Those $8 Uber rides for 6 blocks add up fast. Plan your routes better and save those Martian credits for important trips!`;
                            } else {
                              title = "✅ EFFICIENT TRANSPORT";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Smart transportation choices! You're not overspending on rides and gas. Keep using public transit when possible, walk short distances, and plan efficient routes. Your Martian credits are being used wisely for necessary travel.`;
                            }
                          } else if (categoryName.includes('entertainment') || categoryName.includes('movie') || categoryName.includes('game') || categoryName.includes('streaming')) {
                            if (isHighSpending) {
                              title = "🎮 ENTERTAINMENT OVERLOAD";
                              insightColor = "from-purple-500 to-pink-500";
                              insightIcon = "🎮";
                              insight = `${percentage.toFixed(0)}% on entertainment is a lot! Cancel unused streaming subscriptions (Netflix, Hulu, Disney+ adds up to $50/month). Try free activities like hiking, library events, free museum days. Your Martian credits could be better spent on experiences that last longer than a 2-hour movie!`;
                            } else if (isFrequentBuying) {
                              title = "🎬 TOO MANY SUBSCRIPTIONS";
                              insightColor = "from-yellow-500 to-orange-500";
                              insightIcon = "🎬";
                              insight = `${data.count} entertainment purchases suggests subscription overload. Audit your monthly subscriptions - you probably forgot about half of them! Keep 2 streaming services max, use your library's free movie rentals, try free podcasts instead of paid apps.`;
                            } else {
                              title = "✅ BALANCED FUN SPENDING";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Perfect entertainment balance! You're having fun without overspending. Keep rotating streaming subscriptions monthly, look for group discounts, use student pricing if eligible. Entertainment is important for mental health - you're doing it right!`;
                            }
                          } else if (categoryName.includes('shopping') || categoryName.includes('retail') || categoryName.includes('amazon') || categoryName.includes('clothes')) {
                            if (isHighSpending) {
                              title = "🛍️ SHOPPING ADDICTION ALERT";
                              insightColor = "from-red-500 to-pink-500";
                              insightIcon = "🛍️";
                              insight = `${percentage.toFixed(0)}% on shopping is dangerous! You're impulse buying too much. Try the 30-day rule: want something? Wait 30 days. Unsubscribe from store emails, delete shopping apps, use a shopping list. Those Martian credits should go to needs, not wants. Ask yourself: do I really need this?`;
                            } else if (isFrequentBuying) {
                              title = "📦 PACKAGE DELIVERY ADDICT";
                              insightColor = "from-yellow-500 to-orange-500";
                              insightIcon = "📦";
                              insight = `${data.count} shopping orders means you're buying constantly! Batch your purchases, use wish lists instead of buying immediately, try the "cart abandonment" trick - add items but don't checkout for 24 hours. You'll realize you don't need half of it!`;
                            } else {
                              title = "✅ CONTROLLED SHOPPING";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Great shopping discipline! You're buying what you need without going overboard. Keep using price comparison tools, wait for sales, buy quality items that last. Your Martian credits are being spent thoughtfully on things that add real value.`;
                            }
                          } else if (categoryName.includes('health') || categoryName.includes('medical') || categoryName.includes('pharmacy') || categoryName.includes('doctor')) {
                            title = "🏥 HEALTH INVESTMENT";
                            insightColor = "from-blue-500 to-green-500";
                            insightIcon = "🏥";
                            insight = `Health spending is always worth it! ${percentage.toFixed(0)}% on healthcare shows you prioritize wellness. Use generic medications when possible, check if your insurance covers preventive care, use HSA accounts for tax benefits. Your Martian credits are well-spent on staying healthy - it's the best investment you can make!`;
                          } else if (categoryName.includes('education') || categoryName.includes('book') || categoryName.includes('course') || categoryName.includes('learning')) {
                            title = "📚 INVESTING IN YOURSELF";
                            insightColor = "from-blue-500 to-purple-500";
                            insightIcon = "📚";
                            insight = `Education spending is smart! ${percentage.toFixed(0)}% on learning will pay dividends. Look for free alternatives first - YouTube tutorials, library books, free online courses. But don't cheap out on quality education that advances your career. Your Martian credits spent on skills will multiply your future earning potential!`;
                          } else {
                            // Generic insights for other categories
                            if (isHighSpending) {
                              title = "⚠️ HIGH SPENDING ALERT";
                              insightColor = "from-red-500 to-orange-500";
                              insightIcon = "⚠️";
                              insight = `${percentage.toFixed(0)}% is a lot for this category! Your Martian credits are precious - don't abuse them. Set a monthly limit of $${(data.value * 0.8).toFixed(0)}, track every purchase, find cheaper alternatives. Ask yourself: is this really necessary or just convenient?`;
                            } else if (isFrequentBuying) {
                              title = "🔄 FREQUENT PURCHASES";
                              insightColor = "from-yellow-500 to-orange-500";
                              insightIcon = "🔄";
                              insight = `${data.count} purchases suggests you're buying often. Try batching purchases, making lists, waiting 24 hours before buying. Your Martian credits should be used thoughtfully, not impulsively. Plan your spending to avoid waste!`;
                            } else {
                              title = "✅ BALANCED SPENDING";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Good job! ${percentage.toFixed(0)}% is reasonable for this category. You're using your Martian credits wisely without overspending. Keep tracking your purchases and looking for optimization opportunities.`;
                            }
                          }
                          
                          return (
                            <TypingTooltip 
                              title={title}
                              insight={insight}
                              insightColor={insightColor}
                              insightIcon={insightIcon}
                              categoryName={data.name}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Right Side */}
          <Card className="card-cyber overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Category Analysis
              </CardTitle>
              <CardDescription className="text-sm opacity-80">
                Hover for merchant insights 🧠
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const amount = Number(payload[0]?.value) || 0;
                          const transactions = Number(payload[1]?.value) || 0;
                          const avgPerTransaction = transactions > 0 ? amount / transactions : 0;
                          const percentage = ((amount / (dashboardData?.total_spent || 1)) * 100);
                          
                          // Generate category-specific merchant insights with Martian credits awareness
                          let insight = "";
                          let insightColor = "";
                          let insightIcon = "";
                          let title = "";
                          
                          const categoryName = (label || "").toLowerCase();
                          const isHighSpending = percentage > 25;
                          const isFrequentBuying = transactions > 20;
                          const isExpensivePurchases = avgPerTransaction > 150;
                          
                          // Category-specific merchant analysis
                          if (categoryName.includes('food') || categoryName.includes('dining') || categoryName.includes('restaurant') || categoryName.includes('grocery')) {
                            if (isHighSpending && isFrequentBuying) {
                              title = "🍕 FOOD DELIVERY ADDICTION";
                              insightColor = "from-red-600 to-red-700";
                              insightIcon = "🍕";
                              insight = `${transactions} food orders for ${percentage.toFixed(0)}% of your Martian credits! You're stuck in the DoorDash/UberEats trap. Those $12 delivery fees add up to $240/month. Try meal kits like HelloFresh ($60/week vs $20/day delivery), batch cook on Sundays, keep frozen meals for emergencies. Your Martian credits deserve better than overpriced soggy fries!`;
                            } else if (isFrequentBuying) {
                              title = "🥡 TOO MANY TAKEOUT ORDERS";
                              insightColor = "from-orange-500 to-red-500";
                              insightIcon = "🥡";
                              insight = `${transactions} food purchases means you're not meal planning. Try grocery pickup to avoid impulse buys, prep ingredients on weekends, keep easy meals ready (pasta, stir-fry kits). Those daily $8 lunch runs cost $160/month when homemade costs $40. Save those Martian credits for special dinner dates!`;
                            } else if (isExpensivePurchases) {
                              title = "🍾 FANCY FOOD SPENDING";
                              insightColor = "from-purple-500 to-indigo-500";
                              insightIcon = "🍾";
                              insight = `$${avgPerTransaction.toFixed(0)} per meal is restaurant-level pricing! You're either going to expensive places or ordering for groups. Try happy hour specials, lunch portions instead of dinner, BYOB restaurants. Use OpenTable for deals. Your Martian credits can get the same quality food for 40% less with smart timing!`;
                            } else {
                              title = "✅ BALANCED FOOD HABITS";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Great food spending balance! You're mixing home cooking with eating out smartly. Keep using grocery store apps for deals, try store brands, shop sales. Your Martian credits are being used wisely - you're feeding yourself well without breaking the bank!`;
                            }
                          } else if (categoryName.includes('transport') || categoryName.includes('gas') || categoryName.includes('uber') || categoryName.includes('taxi') || categoryName.includes('car')) {
                            if (isHighSpending && isFrequentBuying) {
                              title = "🚖 RIDESHARE DEPENDENCY";
                              insightColor = "from-red-600 to-red-700";
                              insightIcon = "🚖";
                              insight = `${transactions} rides for ${percentage.toFixed(0)}% of your Martian credits! You're Ubering everywhere instead of planning. A monthly metro pass costs $100 vs your $${amount.toFixed(0)} in rideshares. Try bike sharing ($15/month), walk trips under 1 mile, carpool with friends. Stop burning Martian credits on 6-block rides!`;
                            } else if (isFrequentBuying) {
                              title = "🚗 TOO MANY SHORT TRIPS";
                              insightColor = "from-orange-500 to-red-500";
                              insightIcon = "🚗";
                              insight = `${transactions} transport purchases suggests poor trip planning. Batch your errands, walk short distances, use public transit for regular routes. Those $8 Uber rides add up when you could walk 10 minutes. Plan your routes better and save those precious Martian credits!`;
                            } else if (isExpensivePurchases) {
                              title = "✈️ PREMIUM TRANSPORT CHOICES";
                              insightColor = "from-purple-500 to-indigo-500";
                              insightIcon = "✈️";
                              insight = `$${avgPerTransaction.toFixed(0)} per trip is premium pricing! You're taking Uber Black or long-distance rides. Try regular Uber/Lyft, split rides with friends, book flights in advance for better deals. Your Martian credits deserve first-class experiences, but shop around for the best value!`;
                            } else {
                              title = "✅ SMART TRANSPORT CHOICES";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Excellent transport spending! You're balancing convenience with cost. Keep using public transit when possible, walking short distances, and planning efficient routes. Your Martian credits are being used wisely for necessary travel without waste!`;
                            }
                          } else if (categoryName.includes('entertainment') || categoryName.includes('movie') || categoryName.includes('game') || categoryName.includes('streaming')) {
                            if (isHighSpending && isFrequentBuying) {
                              title = "🎮 ENTERTAINMENT OVERLOAD";
                              insightColor = "from-purple-600 to-pink-600";
                              insightIcon = "🎮";
                              insight = `${transactions} entertainment purchases for ${percentage.toFixed(0)}% of your Martian credits! You're subscribed to everything and buying more. Cancel unused streaming services, share family plans with friends, use your library's free movie/game rentals. Those $15/month subscriptions add up to $180/year each!`;
                            } else if (isFrequentBuying) {
                              title = "🎬 SUBSCRIPTION OVERLOAD";
                              insightColor = "from-orange-500 to-red-500";
                              insightIcon = "🎬";
                              insight = `${transactions} entertainment charges suggests too many subscriptions. Audit what you actually use - most people forget about 40% of their subscriptions! Rotate streaming services monthly, use free trials strategically, try library events. Your Martian credits shouldn't fund forgotten subscriptions!`;
                            } else if (isExpensivePurchases) {
                              title = "🎪 PREMIUM ENTERTAINMENT";
                              insightColor = "from-purple-500 to-indigo-500";
                              insightIcon = "🎪";
                              insight = `$${avgPerTransaction.toFixed(0)} per entertainment purchase is high-end! You're going to concerts, buying premium games, or VIP experiences. Look for early bird discounts, group deals, student pricing. Your Martian credits can still get great entertainment for less with smart timing!`;
                            } else {
                              title = "✅ BALANCED FUN BUDGET";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Perfect entertainment balance! You're having fun without overspending your Martian credits. Keep rotating subscriptions, looking for group discounts, and mixing free activities with paid ones. Entertainment is important - you're doing it sustainably!`;
                            }
                          } else if (categoryName.includes('shopping') || categoryName.includes('retail') || categoryName.includes('amazon') || categoryName.includes('clothes')) {
                            if (isHighSpending && isFrequentBuying) {
                              title = "🛒 SHOPPING ADDICTION CRISIS";
                              insightColor = "from-red-600 to-red-700";
                              insightIcon = "🛒";
                              insight = `${transactions} shopping orders for ${percentage.toFixed(0)}% of your Martian credits is dangerous! You're impulse buying constantly. Delete shopping apps, unsubscribe from store emails, try the 30-day rule. Those "small" $20 purchases become $400/month. Your Martian credits should buy things you actually need and use!`;
                            } else if (isFrequentBuying) {
                              title = "📦 PACKAGE DELIVERY ADDICTION";
                              insightColor = "from-orange-500 to-red-500";
                              insightIcon = "📦";
                              insight = `${transactions} orders means constant buying! Use wish lists instead of instant purchases, batch your orders for free shipping, try the "cart abandonment" trick - wait 24 hours before checkout. You'll realize you don't need 60% of what you almost bought. Save those Martian credits!`;
                            } else if (isExpensivePurchases) {
                              title = "💎 LUXURY SHOPPING HABITS";
                              insightColor = "from-purple-500 to-indigo-500";
                              insightIcon = "💎";
                              insight = `$${avgPerTransaction.toFixed(0)} per purchase is luxury territory! You're buying premium brands or expensive items. Try outlet stores, wait for sales, use price tracking apps. Even luxury items go on sale - patience can save 30-50%. Your Martian credits deserve quality, but shop smart!`;
                            } else {
                              title = "✅ CONTROLLED SHOPPING";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Great shopping discipline! You're buying what you need without going overboard. Keep using price comparison tools, waiting for sales, and buying quality items that last. Your Martian credits are being invested in things that add real value to your life!`;
                            }
                          } else {
                            // Generic insights for other categories
                            if (isHighSpending && isFrequentBuying) {
                              title = "🚨 CATEGORY OVERSPENDING";
                              insightColor = "from-red-600 to-red-700";
                              insightIcon = "🚨";
                              insight = `${transactions} purchases for ${percentage.toFixed(0)}% of your Martian credits is too much! You're either overpaying or buying too often. Research cheaper alternatives, batch your purchases, set monthly limits. Don't abuse your Martian credits - they're precious and finite!`;
                            } else if (isFrequentBuying) {
                              title = "🔄 FREQUENT BUYER PATTERN";
                              insightColor = "from-orange-500 to-red-500";
                              insightIcon = "🔄";
                              insight = `${transactions} purchases suggests you're buying often without planning. Try batching purchases, making lists, waiting 24 hours before buying. Your Martian credits should be used thoughtfully, not impulsively. Plan your spending to maximize value!`;
                            } else if (isExpensivePurchases) {
                              title = "💰 HIGH-VALUE PURCHASES";
                              insightColor = "from-purple-500 to-indigo-500";
                              insightIcon = "💰";
                              insight = `$${avgPerTransaction.toFixed(0)} per purchase is significant! Make sure you're getting good value for your Martian credits. Research alternatives, wait for sales, consider if you really need the premium option. Quality is worth paying for, but don't overpay!`;
                            } else {
                              title = "✅ BALANCED CATEGORY SPENDING";
                              insightColor = "from-green-500 to-emerald-500";
                              insightIcon = "✅";
                              insight = `Good job! ${percentage.toFixed(0)}% is reasonable for this category. You're using your Martian credits wisely without overspending. Keep tracking your purchases and looking for optimization opportunities while maintaining this balance!`;
                            }
                          }
                          
                          return (
                            <TypingTooltip 
                              title={title}
                              insight={insight}
                              insightColor={insightColor}
                              insightIcon={insightIcon}
                              categoryName={label || "Category"}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="url(#colorAmount)" name="Amount ($)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="transactions" fill="url(#colorTransactions)" name="Transactions" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="50%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="50%" stopColor="#059669" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#047857" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown and Insights */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Category Details */}
          <div className="lg:col-span-2">
            <Card className="card-cyber bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-600/30">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-b border-slate-600/20">
                <CardTitle className="text-2xl bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent font-bold">
                  Category Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">Comprehensive breakdown of your spending patterns and optimization opportunities</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {spendingData.map((item: any, index: number) => {
                    const percentage = ((item.total_amount / (dashboardData?.total_spent || 1)) * 100);
                    const avgPerTransaction = item.total_amount / item.transaction_count;
                    // Professional spending analysis
                    const isHighSpending = percentage > 25;
                    const isMediumSpending = percentage > 15;
                    const isFrequentBuying = item.transaction_count > 15;
                    
                    let statusLevel, gradientColors, statusMessage, statusColor;
                    if (isHighSpending) {
                      statusLevel = "Focus Area";
                      gradientColors = 'from-slate-700/40 to-slate-800/30 border-slate-500/40';
                      statusMessage = `${percentage.toFixed(1)}% of total spending`;
                      statusColor = 'text-blue-400';
                    } else if (isMediumSpending) {
                      statusLevel = "Monitor";
                      gradientColors = 'from-slate-700/30 to-slate-800/20 border-slate-600/30';
                      statusMessage = `${percentage.toFixed(1)}% of total spending`;
                      statusColor = 'text-slate-400';
                    } else {
                      statusLevel = "Optimized";
                      gradientColors = 'from-slate-700/20 to-slate-800/10 border-slate-600/20';
                      statusMessage = `${percentage.toFixed(1)}% of total spending`;
                      statusColor = 'text-green-400';
                    }
                    
                    const optimizationTarget = item.total_amount * 0.85; // 15% optimization target
                    
                    return (
                      <div key={index} className={`p-5 rounded-xl border bg-gradient-to-r ${gradientColors} hover:scale-[1.01] transition-all duration-300 shadow-lg`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div 
                                className="w-8 h-8 rounded-full shadow-lg border border-white/10" 
                                style={{ backgroundColor: SOLID_COLORS[index % SOLID_COLORS.length] }}
                              />
                              <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-xl text-white">{item.category}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full bg-black/30 ${statusColor} font-medium`}>
                                  {statusLevel}
                                </span>
                                <span className="text-xs text-slate-400">{statusMessage}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl text-white">
                              ${item.total_amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                            <p className="text-xs text-blue-400 font-medium">
                              Target: ${optimizationTarget.toFixed(0)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-slate-600/30">
                            <p className="text-slate-400 text-xs font-medium">Transactions</p>
                            <p className="font-bold text-lg text-white">{item.transaction_count}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-slate-600/30">
                            <p className="text-slate-400 text-xs font-medium">Average</p>
                            <p className="font-bold text-lg text-white">${avgPerTransaction.toFixed(0)}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-slate-600/30">
                            <p className="text-slate-400 text-xs font-medium">Efficiency</p>
                            <p className={`font-bold text-lg ${statusColor}`}>
                              {isHighSpending ? 'Review' : isMediumSpending ? 'Good' : 'Optimal'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Professional Progress Bar */}
                        <div className="relative mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400 font-medium">Category Allocation</span>
                            <span className="text-xs font-medium text-white">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${Math.min(percentage, 100)}%`,
                                background: `linear-gradient(90deg, ${SOLID_COLORS[index % SOLID_COLORS.length]}, ${SOLID_COLORS[index % SOLID_COLORS.length]}cc)`
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Optimization Insight */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              <span className="text-blue-400 text-xs font-medium">Optimization Potential</span>
                            </div>
                            <span className="text-blue-300 text-sm font-medium">
                              ${(item.total_amount - optimizationTarget).toFixed(0)} savings opportunity
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bad Spending Examples */}
          <div>
            <Card className="card-cyber bg-gradient-to-br from-red-900/20 via-orange-900/10 to-red-900/20 border-red-600/30 overflow-hidden relative">
              {/* Warning background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/3 via-orange-600/5 to-red-600/3" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
              
              <CardHeader className="relative z-10 bg-gradient-to-r from-red-800/10 to-orange-800/10 border-b border-red-600/20 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl animate-ping opacity-20" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                      Spending Red Flags
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-orange-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
                        <div className="w-1 h-1 bg-red-200 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
                      </div>
                      <span className="text-xs text-red-400 font-medium tracking-wide">AVOIDABLE EXPENSES</span>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-slate-300 font-medium">
                  High-cost transactions that could be avoided • Protect your Martian credits
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-6">
                <div className="space-y-4">
                  {badSpendingExamples.map((example: any, index: number) => {
                    // Generate category-specific avoidance strategies
                    let avoidanceStrategy, merchantExample;
                    const categoryName = example.category.toLowerCase();
                    
                    if (categoryName.includes('food') || categoryName.includes('dining') || categoryName.includes('restaurant')) {
                      avoidanceStrategy = "Cook at home, meal prep, use grocery store deals";
                      merchantExample = example.isReal ? `Real transaction: ${example.description}` : "Expensive restaurant when local options cost 60% less";
                    } else if (categoryName.includes('transport') || categoryName.includes('uber') || categoryName.includes('taxi')) {
                      avoidanceStrategy = "Use public transit, walk short distances, plan trips";
                      merchantExample = example.isReal ? `Real transaction: ${example.description}` : "Long rideshare when public transit available";
                    } else if (categoryName.includes('entertainment') || categoryName.includes('streaming')) {
                      avoidanceStrategy = "Cancel unused subscriptions, use free alternatives";
                      merchantExample = example.isReal ? `Real transaction: ${example.description}` : "Multiple subscriptions when 1-2 would suffice";
                    } else if (categoryName.includes('shopping') || categoryName.includes('retail')) {
                      avoidanceStrategy = "Wait 24 hours, compare prices, buy on sale";
                      merchantExample = example.isReal ? `Real transaction: ${example.description}` : "Impulse purchase when alternatives available";
                    } else {
                      avoidanceStrategy = "Research alternatives, negotiate better rates";
                      merchantExample = example.isReal ? `Real transaction: ${example.description}` : "Premium service when standard meets needs";
                    }

                    return (
                      <div key={index} className="group p-5 rounded-xl border bg-gradient-to-r from-red-600/10 via-orange-600/5 to-red-600/10 border-red-500/30 hover:scale-[1.01] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm relative overflow-hidden">
                        {/* Warning shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="flex items-start space-x-4 relative z-10">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute inset-0 w-10 h-10 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl animate-pulse opacity-30" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-white text-base">
                                  {example.category} - {example.isReal ? 'Actual' : 'Estimated'} High Expense
                                </h4>
                                {example.isReal && (
                                  <p className="text-green-400 text-xs font-medium">✓ Real transaction from your data</p>
                                )}
                              </div>
                              <span className="text-xs font-bold text-red-300 bg-red-900/30 backdrop-blur-sm px-3 py-1 rounded-full border border-red-500/30">
                                {example.percentage ? example.percentage.toFixed(0) : '0'}% of budget
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                                  <span className="text-red-400 text-xs font-medium">
                                    {example.isReal ? 'Actual High Transaction' : 'Estimated Wasteful Transaction'}
                                  </span>
                                </div>
                                <p className="text-red-300 text-sm font-medium">
                                  ${example.amount.toFixed(2)} - {example.description}
                                </p>
                                <div className="flex justify-between text-slate-400 text-xs mt-1">
                                  <span>📍 {example.location}</span>
                                  <span>📅 {example.date}</span>
                                </div>
                              </div>
                              
                              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                                  <span className="text-green-400 text-xs font-medium">Smart Alternative</span>
                                </div>
                                <p className="text-green-300 text-sm">{avoidanceStrategy}</p>
                                <p className="text-slate-400 text-xs mt-1">
                                  Potential savings: ${(example.amount * 0.6).toFixed(0)} per month
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-orange-400 font-semibold">Monthly Savings Goal</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">
                    By avoiding these expensive transactions, you could save up to{' '}
                    <span className="text-green-400 font-bold">
                      ${badSpendingExamples.reduce((total: number, example: any) => total + (example.amount * 0.6), 0).toFixed(0)}
                    </span>{' '}
                    per month from these specific high-cost transactions alone.
                  </p>
                  <p className="text-slate-400 text-xs">
                    {badSpendingExamples.filter((ex: any) => ex.isReal).length > 0 
                      ? `${badSpendingExamples.filter((ex: any) => ex.isReal).length} of these are actual transactions from your Databricks data.`
                      : 'Analysis based on your spending patterns and transaction history.'
                    } Focus on your highest spending categories for maximum impact on your Martian credit balance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Items */}
        <Card className="card-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recommended Actions
            </CardTitle>
            <CardDescription>
              Take these steps to optimize your financial health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-semibold mb-2">Set Category Budgets</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Create spending limits for your top 3 categories to control expenses.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Create Budgets
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Wallet className="h-8 w-8 text-blue-500 mb-3" />
                <h4 className="font-semibold mb-2">Track Daily Spending</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitor your daily expenses to stay within your monthly budget.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Start Tracking
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <TrendingUp className="h-8 w-8 text-purple-500 mb-3" />
                <h4 className="font-semibold mb-2">Investment Planning</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Explore investment options with your potential savings.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Explore Options
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;