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
    total_amount: number
    transaction_count: number
    color: string
    icon: string
  }>
  monthly_trend: Array<{
    date: string
    spending: number
    transactions: number
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
      } catch (error) {
        console.error('Failed to fetch all transactions:', error)
        // Fallback to existing data if API fails
        setAllTransactions(data?.recent_transactions || [])
      }
    }
    // Toggle the state regardless of API success/failure
    setShowAllTransactions(!showAllTransactions)
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
            <div className="text-2xl font-bold">${Math.abs(data.total_spent || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(data.total_credits || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.abs(data.avg_transaction || 0).toFixed(2)}</div>
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
                  <div className="font-bold text-lg">${Math.abs(transaction.amount || 0).toFixed(2)}</div>
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

      </div>
    </div>
  )
}