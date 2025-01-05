"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Users, 
  Bot, 
  Mail, 
  Brain, 
  Target,
  Zap,
  ArrowRight,
  Globe,
  Search,
  ListFilter,
  Download,
  Wrench
} from 'lucide-react'
import { PageHeader } from "@/components/ui/page-header"
import PageTransition from '@/components/animations/PageTransition'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { useRouter } from 'next/navigation'

const tools = [
  {
    id: 'lead-scraper',
    name: 'Sales Lead Scraper',
    description: 'Automatically discover and analyze potential leads',
    icon: Users,
    color: 'from-pink-500/30 to-pink-500/10 hover:from-pink-500/40 hover:to-pink-500/20',
    comingSoon: false,
    features: [
      { icon: Globe, name: 'Website Scraping' },
      { icon: Search, name: 'Lead Discovery' },
      { icon: ListFilter, name: 'Auto Categorization' },
      { icon: Download, name: 'Data Export' }
    ]
  },
  {
    id: 'shugbot',
    name: 'Ask Shug',
    description: 'Your AI assistant for CRM guidance and support',
    icon: Bot,
    color: 'from-blue-500/30 to-blue-500/10 hover:from-blue-500/40 hover:to-blue-500/20',
    comingSoon: false
  },
  {
    id: 'email-assistant',
    name: 'Email Campaign Assistant',
    description: 'Generate and optimize email campaigns with AI',
    icon: Mail,
    color: 'from-violet-500/30 to-violet-500/10 hover:from-violet-500/40 hover:to-violet-500/20',
    comingSoon: true
  },
  {
    id: 'content-generator',
    name: 'Content Generator',
    description: 'Create personalized proposals and messages',
    icon: Brain,
    color: 'from-emerald-500/30 to-emerald-500/10 hover:from-emerald-500/40 hover:to-emerald-500/20',
    comingSoon: true
  },
  {
    id: 'deal-analyzer',
    name: 'Smart Deal Analyzer',
    description: 'AI-powered deal insights and recommendations',
    icon: Target,
    color: 'from-orange-500/30 to-orange-500/10 hover:from-orange-500/40 hover:to-orange-500/20',
    comingSoon: true
  },
  {
    id: 'sentiment-analyzer',
    name: 'Customer Sentiment Analyzer',
    description: 'Track and analyze customer relationship health',
    icon: Zap,
    color: 'from-yellow-500/30 to-yellow-500/10 hover:from-yellow-500/40 hover:to-yellow-500/20',
    comingSoon: true
  }
]

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const { setContentAndShow, hide } = useSplitViewStore()
  const router = useRouter()

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.comingSoon) return
    
    setSelectedTool(tool.id)
    
    const topContent = (
      <motion.div
        className="h-full bg-[#111111] rounded-t-2xl"
        initial={{ y: "-100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "tween",
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
      >
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
              <tool.icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{tool.name}</h2>
              <p className="text-zinc-400 mt-1">{tool.description}</p>
            </div>
          </div>

          {/* Quick Stats or Features */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {tool.features?.map((feature, index) => (
              <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-2">
                  <feature.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-zinc-400">{feature.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Full View Button */}
          <button
            onClick={() => router.push(`/tools/${tool.id}`)}
            className="mt-6 w-full p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] text-sm font-medium text-zinc-400 hover:text-white hover:from-zinc-800/70 hover:to-zinc-900/70 transition-all flex items-center justify-center gap-2"
          >
            Open Full View
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )

    const bottomContent = (
      <motion.div
        className="h-full bg-[#111111] rounded-b-2xl"
        initial={{ y: "100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "tween",
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
      >
        <div className="p-8 border-t border-white/[0.03]">
          {/* Tool-specific quick actions and main interface */}
          {tool.id === 'lead-scraper' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter website URL"
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/[0.05] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                />
                <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                  Scan
                </button>
              </div>
              
              <div className="text-sm text-zinc-400">
                Enter a website URL to start scanning for potential leads. The tool will analyze the website and extract relevant contact information.
              </div>
            </div>
          )}

          {tool.id === 'shugbot' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/[0.05]">
                  <p className="text-sm text-zinc-400">
                    Hi! I'm Shug, your AI assistant. How can I help you today?
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/[0.05] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                  />
                  <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )

    setContentAndShow(topContent, bottomContent, `tool-${tool.id}`)
  }

  return (
    <PageTransition>
      <div className="p-8">
        <PageHeader 
          heading="AI Tools"
          description="Enhance your workflow with AI-powered tools"
          icon={<div className="icon-tools"><Sparkles className="h-6 w-6" /></div>}
        />

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className={`group cursor-pointer p-6 rounded-2xl bg-gradient-to-br ${tool.color} border border-white/[0.05] relative`}
              onClick={() => handleToolClick(tool)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    {tool.comingSoon && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{tool.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  )
} 