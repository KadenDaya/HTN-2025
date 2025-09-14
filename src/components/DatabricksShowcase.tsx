"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  BarChart3, 
  Zap, 
  RefreshCw, 
  TrendingUp,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

interface ShowcaseData {
  title: string
  description: string
  showcase: {
    connection_test: {
      status: string
      message: string
      database_type: string
    }
    capabilities: string[]
    demo_queries: Array<{
      title: string
      description: string
      query: string
    }>
    dashboard_url: string
    event_ready: boolean
  }
  event_sponsor: string
  demo_ready: boolean
}

interface SyncResult {
  title: string
  sync_result: {
    status: string
    message: string
    synced_records: {
      transactions: number
      statements: number
    }
    databricks_ready: boolean
  }
  next_steps: string[]
}

interface AnalyticsData {
  title: string
  analytics: {
    status: string
    analytics: {
      spending_patterns: any[]
      time_patterns: any[]
      location_analysis: any[]
    }
    powered_by: string
  }
  features_used: string[]
}

export default function DatabricksShowcase() {
  const [showcaseData, setShowcaseData] = useState<ShowcaseData | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchShowcaseData()
  }, [])

  const fetchShowcaseData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/databricks/showcase')
      const data = await response.json()
      setShowcaseData(data)
    } catch (error) {
      console.error('Failed to fetch showcase data:', error)
    }
  }

  const handleSync = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/databricks/sync', {
        method: 'POST'
      })
      const data = await response.json()
      setSyncResult(data)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/databricks/analytics')
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Databricks Analytics Showcase</h1>
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-lg text-muted-foreground">
          Advanced financial analytics powered by Databricks - Perfect for event demos!
        </p>
        {showcaseData?.event_sponsor && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Event Sponsor: {showcaseData.event_sponsor}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                System Status
              </CardTitle>
              <CardDescription>
                Current status of your hybrid SQLite + Databricks architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showcaseData?.showcase.connection_test && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Local Database</h3>
                    <Badge variant={showcaseData.showcase.connection_test.status === 'success' ? 'default' : 'destructive'}>
                      {showcaseData.showcase.connection_test.database_type}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <h3 className="font-semibold">Databricks Ready</h3>
                    <Badge variant={showcaseData.showcase.event_ready ? 'default' : 'secondary'}>
                      {showcaseData.showcase.event_ready ? 'Ready' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold">Demo Status</h3>
                    <Badge variant={showcaseData.demo_ready ? 'default' : 'secondary'}>
                      {showcaseData.demo_ready ? 'Demo Ready' : 'Setup Needed'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Databricks Capabilities
              </CardTitle>
              <CardDescription>
                Advanced features showcased in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showcaseData?.showcase.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo SQL Queries</CardTitle>
              <CardDescription>
                Advanced SQL showcasing Databricks capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showcaseData?.showcase.demo_queries.map((query, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{query.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{query.description}</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {query.query.substring(0, 200)}...
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Sync your SQLite data to Databricks for advanced analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSync} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Syncing...' : 'Sync Data to Databricks'}
              </Button>

              {syncResult && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Status:</strong> {syncResult.sync_result.status}</p>
                      <p><strong>Message:</strong> {syncResult.sync_result.message}</p>
                      {syncResult.sync_result.synced_records && (
                        <div>
                          <p><strong>Synced Records:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            <li>Transactions: {syncResult.sync_result.synced_records.transactions}</li>
                            <li>Statements: {syncResult.sync_result.synced_records.statements}</li>
                          </ul>
                        </div>
                      )}
                      {syncResult.next_steps && (
                        <div>
                          <p><strong>Next Steps:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {syncResult.next_steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Advanced Analytics
              </CardTitle>
              <CardDescription>
                Complex analytics powered by Databricks SQL engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={fetchAnalytics} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Loading...' : 'Run Advanced Analytics'}
              </Button>

              {analyticsData && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      <p><strong>Powered by:</strong> {analyticsData.analytics.powered_by}</p>
                      <p><strong>Status:</strong> {analyticsData.analytics.status}</p>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-semibold mb-2">Features Used:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analyticsData.features_used.map((feature, index) => (
                        <Badge key={index} variant="outline" className="justify-start">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              🎯 Perfect for demonstrating hybrid architecture at Databricks events
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline">SQLite for Reliability</Badge>
              <Badge variant="outline">Databricks for Analytics</Badge>
              <Badge variant="outline">Event Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
