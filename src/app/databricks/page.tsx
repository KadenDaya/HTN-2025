'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import { Eye, EyeOff } from 'lucide-react'

interface Transaction {
  date: string
  description: string
  amount: number
  location: string
}

interface DashboardData {
  total_spent: number
  total_credits: number
  total_transactions: number
  avg_transaction: number
  recent_transactions: Transaction[]
  spending_by_category: Array<{
    category: string
    amount: number
    count: number
    color: string
    icon: string
  }>
  monthly_trend: Array<{
    month: string
    amount: number
  }>
}

export default function DataPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/dashboard')
        const result = await response.json()
        setData(result)
        setAllTransactions(result.recent_transactions || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchAllTransactions = async () => {
    if (!showAllTransactions) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/transactions')
        const result = await response.json()
        setAllTransactions(result.transactions || [])
        setShowAllTransactions(true)
      } catch (error) {
        console.error('Failed to fetch all transactions:', error)
        // Fallback to existing data
        setShowAllTransactions(true)
      }
    } else {
      setShowAllTransactions(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your financial data...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">Failed to load data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mt-5 container mx-auto p-6 space-y-6 pt-20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Your Financial Data</h1>
          <p className="text-muted-foreground">Real data from your uploaded Scotiabank statement</p>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_transactions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.total_spent.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${data.total_credits.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.avg_transaction.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
              </CardTitle>
              <CardDescription>
                {showAllTransactions 
                  ? `All ${data.total_transactions} transactions from your statement`
                  : 'Your latest financial activity'
                }
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchAllTransactions}
              className="flex items-center gap-2"
            >
              {showAllTransactions ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show All ({data.total_transactions})
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(showAllTransactions ? allTransactions : data.recent_transactions.slice(0, 5)).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.date} • {transaction.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${transaction.amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
          {!showAllTransactions && data.recent_transactions.length > 5 && (
            <div className="text-center pt-4">
              <Button variant="ghost" onClick={fetchAllTransactions}>
                View {data.total_transactions - 5} more transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Categories */}
      {data.spending_by_category.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.spending_by_category.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-muted-foreground">{category.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${category.amount.toFixed(2)}</div>
                    <Badge variant="outline" style={{ backgroundColor: category.color + '20', color: category.color }}>
                      {((category.amount / data.total_spent) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trend */}
      {data.monthly_trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.monthly_trend.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="font-medium">{month.month}</div>
                  <div className="font-bold">${month.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}