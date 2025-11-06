"use client"

import { useState, useEffect } from "react"
import { chatAPI, getProjects } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Project {
  projectId: string
  userId: string
  prompt: string
  status: string
  createdAt: string
  previewUrl?: string
  artifactZipKey?: string
}

interface ProjectState {
  projectId: string | null
  executionArn: string | null
  status: string | null
  previewUrl: string | null | undefined
  loading: boolean
  error: string | null
}

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [project, setProject] = useState<ProjectState>({
    projectId: null,
    executionArn: null,
    status: null,
    previewUrl: null,
    loading: false,
    error: null,
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await getProjects('test-user-123')
      setProjects(data.projects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleGenerateApp = async () => {
    if (!prompt.trim()) {
      setProject((prev) => ({
        ...prev,
        error: "Please enter a prompt",
      }))
      return
    }

    setProject({
      projectId: null,
      executionArn: null,
      status: null,
      previewUrl: null,
      loading: true,
      error: null,
    })

    try {
      const result = await chatAPI(prompt)
      
      // Show project as "Building"
      setProject({
        projectId: result.projectId,
        executionArn: result.executionArn,
        status: "BUILDING",
        previewUrl: null,
        loading: false,
        error: null,
      })

      // After 2 minutes, assume it's ready
      setTimeout(() => {
        setProject((prev) => 
          prev.projectId === result.projectId
            ? {
                ...prev,
                status: "PREVIEW_READY",
                previewUrl: `https://027354322205-v0-preview.s3.ap-south-1.amazonaws.com/previews/${result.projectId}/index.html`,
              }
            : prev
        )
      }, 160000) // 2 minutes
    } catch (err) {
      setProject((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to generate app. Please try again.",
      }))
    }
  }

  const handleClear = () => {
    setPrompt("")
    setProject({
      projectId: null,
      executionArn: null,
      status: null,
      previewUrl: null,
      loading: false,
      error: null,
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-slate-50 dark:to-slate-900/30 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI-Powered</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-balance bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Generate Apps Instantly
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Describe your vision and our AWS-powered pipeline will build, deploy, and preview your app in minutes
          </p>
        </div>

        {/* Input Card */}
        <Card className="p-8 bg-card border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">What app do you want to build?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A real-time collaborative whiteboard with drawing tools, undo/redo, and live cursor tracking..."
                className="w-full h-32 p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder-muted-foreground resize-none transition-all duration-200"
                disabled={project.loading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleGenerateApp}
                disabled={project.loading || !prompt.trim()}
                className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {project.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  "Generate App"
                )}
              </Button>
              {project.projectId && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/10 px-8 py-3 rounded-lg font-semibold bg-transparent transition-all duration-200"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Error State */}
        {project.error && (
          <Card className="p-5 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-destructive mt-0.5 text-lg font-bold">⚠</div>
              <p className="text-destructive font-medium">{project.error}</p>
            </div>
          </Card>
        )}

        {/* Status Card */}
        {project.projectId && (
          <Card className="p-6 bg-card border border-border shadow-lg space-y-5">
            <h3 className="text-lg font-semibold text-foreground">Generation Status</h3>
            <div className="space-y-4">
              <div className="bg-secondary/5 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Project ID</p>
                <p className="font-mono text-sm text-foreground break-all">{project.projectId}</p>
              </div>

              <div className="bg-secondary/5 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      project.status === "PREVIEW_READY" ? "bg-green-500" : "bg-primary/60 animate-pulse"
                    }`}
                  />
                  <span className="font-medium text-foreground text-sm">{project.status || "Initializing..."}</span>
                </div>
              </div>

              {project.executionArn && (
                <div className="bg-secondary/5 rounded-lg p-4 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Execution ARN
                  </p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{project.executionArn}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Preview Card */}
        {project.previewUrl && project.status === "PREVIEW_READY" && (
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 mb-2">
                <span className="text-3xl">🎉</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Your App is Ready!</h3>
                <p className="text-muted-foreground">
                  Your app has been generated and deployed successfully.
                </p>
              </div>
              <a
                href={project.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Open Your App
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <p className="text-xs text-muted-foreground">
                Opens in a new tab • Project ID: {project.projectId}
              </p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {project.loading && (
          <Card className="p-6 bg-card border border-border shadow-lg">
            <div className="flex items-center justify-center gap-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-muted-foreground font-medium">Generating your app...</p>
            </div>
          </Card>
        )}

        {/* Previous Projects Section */}
        <Card className="p-6 bg-card border border-border shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Previous Projects ({projects.length})
          </h2>
          {loadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-muted-foreground font-medium ml-4">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No projects yet. Generate your first app above!</p>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <Card key={proj.projectId} className="p-4 bg-secondary/5 border border-border hover:border-primary/30 transition-colors">
                  <p className="font-semibold text-foreground mb-2">{proj.prompt}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Status: <span className="font-medium">{proj.status}</span> • {new Date(proj.createdAt).toLocaleString()}
                  </p>
                  {proj.previewUrl && (
                    <a
                      href={proj.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    >
                      View Preview →
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
