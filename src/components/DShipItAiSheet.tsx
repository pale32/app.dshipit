"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, HelpCircle, AlertTriangle, ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TranslationService } from "@/components/TranslationService"
import { FuturisticSpinner } from "@/components/FuturisticSpinner"

// HuggingFace API constants
const HF_API_BASE = 'https://api-inference.huggingface.co/models'
const HF_API_TOKEN = process.env.NEXT_PUBLIC_HF_API_TOKEN || ''

interface AiProductSheetProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialProductTitle?: string;
  initialProductDescription?: string;
  onOptimizedTitle?: (title: string) => void;
  onOptimizedDescription?: (description: string) => void;
}

export function DShipItAiSheet({
  trigger,
  open,
  onOpenChange,
  initialProductTitle,
  initialProductDescription,
  onOptimizedTitle,
  onOptimizedDescription
}: AiProductSheetProps) {
  const [selectedFunction, setSelectedFunction] = useState("AI Product Information Optimization")
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [optimizationLanguage, setOptimizationLanguage] = useState("English")
  const [productTitle, setProductTitle] = useState(initialProductTitle || "Eyebrow Liquid Pigment Permanent Makeup Machine Use Henna Eyebrows Tattoo Ink tinta para tatuar tatoo supplies maquiagem 10ML")
  const [requirements, setRequirements] = useState("Keep short, eye catching")
  const [generatedContent, setGeneratedContent] = useState("")

  // Update product title when initialProductTitle changes (when editing different products)
  useEffect(() => {
    if (initialProductTitle) {
      setProductTitle(initialProductTitle);
      setSourceText(initialProductTitle);
    }
  }, [initialProductTitle]);
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Translation-specific states
  const [sourceText, setSourceText] = useState("Eyebrow Liquid Pigment Permanent Makeup Machine Use Henna Eyebrows Tattoo Ink tinta para tatuar tatoo supplies maquiagem 10ML")
  const [targetLanguage, setTargetLanguage] = useState("German")
  const [translatedText, setTranslatedText] = useState("")

  // API key from environment variable
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''

  // AI function handlers
  const handleAIGeneration = async () => {
    if (!productTitle.trim()) {
      setShowError(true)
      return
    }

    setIsLoading(true)
    setShowError(false)
    setGeneratedContent("")
    setProgress(0)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return Math.min(prev + Math.random() * 15 + 5, 90)
      })
    }, 400)

    try {
      let result = ""
      
      switch (selectedFunction) {
        case "AI Product Information Optimization":
          console.log(`🔍 DEBUGGING: About to call optimizeProductInfo()`)
          const optimizedResult = await optimizeProductInfo()
          console.log(`🔍 DEBUGGING: optimizeProductInfo() returned:`, optimizedResult)
          setProgress(70)
          // If output language is not English, translate the optimized content
          if (optimizationLanguage !== "English") {
            console.log(`🔍 DEBUGGING: Need translation to:`, optimizationLanguage)
            const translationResult = await TranslationService.translateText(optimizedResult, optimizationLanguage)
            result = translationResult.success ? translationResult.translatedText : optimizedResult
            setProgress(90)
          } else {
            console.log(`🔍 DEBUGGING: Using English result directly`)
            result = optimizedResult
          }
          console.log(`🔍 DEBUGGING: Final result to display:`, result)
          setProgress(100)
          setTimeout(() => {
            console.log(`🔍 DEBUGGING: Setting generatedContent to:`, result)
            setGeneratedContent(result)
          }, 200)
          break
        case "AI Translation":
          result = await translateContent()
          setProgress(100)
          setTimeout(() => setTranslatedText(result), 200)
          break
        default:
          result = "Function not implemented"
          setProgress(100)
          setTimeout(() => setGeneratedContent(result), 200)
      }
    } catch (error) {
      console.error('AI Generation Error:', error)
      setShowError(true)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => setIsLoading(false), 400)
    }
  }

  const optimizeProductInfo = async (): Promise<string> => {
    console.log(`🔍 DEBUGGING: Starting AI optimization`)
    console.log(`🔍 DEBUGGING: Product title:`, productTitle)
    console.log(`🔍 DEBUGGING: Requirements:`, requirements)
    console.log(`🔍 DEBUGGING: Environment check:`, {
      'NEXT_PUBLIC_GROQ_API_KEY': process.env.NEXT_PUBLIC_GROQ_API_KEY,
      'NODE_ENV': process.env.NODE_ENV,
      'Keys available': Object.keys(process.env).filter(k => k.includes('GROQ'))
    })
    
    const prompt = `Transform this product title based on requirements. Return ONLY the final optimized title text. No "Title:", no explanations, no descriptions.

Product: ${productTitle}
Requirements: ${requirements}

Output:`

    console.log(`🔍 DEBUGGING: Sending prompt:`, prompt)
    
    // Try multiple AI services in order of preference
    const aiServices = [
      {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: {
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.7
        },
        parseResponse: (data: any) => data.choices?.[0]?.message?.content
      },
      {
        name: 'Together',
        url: 'https://api.together.xyz/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TOGETHER_API_KEY || ''}`
        },
        body: {
          model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.7
        },
        parseResponse: (data: any) => data.choices?.[0]?.message?.content
      },
      {
        name: 'Replicate',
        url: 'https://api.replicate.com/v1/predictions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_KEY || ''}`
        },
        body: {
          version: '2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1',
          input: { prompt: prompt, max_tokens: 50 }
        },
        parseResponse: (data: any) => data.output?.join('')
      }
    ]

    for (const service of aiServices) {
      try {
        console.log(`🔍 DEBUGGING: Trying ${service.name} AI service`)
        
        const authHeader = service.headers.Authorization
        const hasApiKey = authHeader && authHeader !== 'Bearer ' && authHeader !== 'Token ' && !authHeader.includes('undefined')
        
        console.log(`🔍 DEBUGGING: ${service.name} auth header:`, authHeader)
        console.log(`🔍 DEBUGGING: ${service.name} has valid key:`, hasApiKey)
        
        if (!hasApiKey) {
          console.log(`🔍 DEBUGGING: ${service.name} - No API key found`)
          continue
        }
        
        const response = await fetch(service.url, {
          method: 'POST',
          headers: service.headers,
          body: JSON.stringify(service.body)
        })

        console.log(`🔍 DEBUGGING: ${service.name} response status:`, response.status)
        
        if (response.status === 200) {
          const data = await response.json()
          console.log(`🔍 DEBUGGING: ${service.name} response:`, data)
          
          let result = service.parseResponse(data)
          if (result && result.trim().length > 0) {
            // Clean up the response by removing chat-like responses
            result = result.trim()
            
            // Remove common AI chat prefixes/suffixes and title labels
            result = result.replace(/^(Optimized Result:?|Result:?|Optimized:?|Here's|Here is|The optimized|Optimized title:?|Title:?|Output:?)\s*/i, '')
            result = result.replace(/\s*\.?\s*$/g, '') // Remove trailing dots
            
            // Take only the first line if multiple lines
            result = result.split('\n')[0].trim()
            
            // Remove quotes if the AI wrapped the result
            result = result.replace(/^["']|["']$/g, '')
            
            result = result.trim()
            
            console.log(`🔍 DEBUGGING: ✅ SUCCESS with ${service.name} AI:`, result)
            return result
          }
        } else {
          const errorText = await response.text()
          console.log(`🔍 DEBUGGING: ${service.name} failed:`, response.status, errorText)
        }
        
      } catch (error) {
        console.log(`🔍 DEBUGGING: ${service.name} exception:`, error)
        continue
      }
    }
    
    console.log(`🔍 DEBUGGING: All AI services failed, need API keys`)
    throw new Error('All AI services failed. Please provide API keys for: Groq, Together, or Replicate')
  }


  const translateContent = async (): Promise<string> => {
    try {
      const result = await TranslationService.translateText(sourceText, targetLanguage)
      
      if (result.success) {
        return result.translatedText
      } else {
        console.error('Translation failed:', result.error)
        return result.translatedText // Will be the fallback translation
      }
    } catch (error) {
      console.error('Translation error:', error)
      // Fallback to the service's manual translation
      const fallbackResult = await TranslationService.translateText(sourceText, targetLanguage)
      return fallbackResult.translatedText
    }
  }


  const generateContent = async (): Promise<string> => {
    try {
      const prompt = `Write a compelling product description:\n\n"${productTitle}"\n\nDescription:`
      
      const response = await fetch(`${HF_API_BASE}/gpt2`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.8,
            do_sample: true,
            return_full_text: false
          }
        })
      })

      console.log('Content Generation API Response Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Content Generation API Error:', errorText)
        throw new Error(`Content API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Content Generation API Response Data:', data)
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.replace(prompt, '').trim()
      }
      
      // No manual fallback - AI only
      throw new Error('AI model failed to generate content')
      
    } catch (error) {
      console.error('Content generation error:', error)
      throw new Error('AI model failed to generate content')
    }
  }


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col bg-gray-50 ai-sheet-custom"
        style={{ 
          width: '738px', 
          maxWidth: '738px',
          '--ai-hover-border': 'rgb(139 92 246)',
          '--ai-focus-ring': 'rgba(139, 92, 246, 0.5)',
          '--ai-focus-ring-pink': 'rgba(236, 72, 153, 0.3)'
        } as React.CSSProperties}
      >
        {/* Compact Header */}
        <SheetHeader className="px-6 py-3 bg-white relative">
          <SheetTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="url(#sparkles-header)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="sparkles-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(236, 72, 153)" />
                  <stop offset="50%" stopColor="rgb(139, 92, 246)" />
                  <stop offset="100%" stopColor="#673DE6" />
                </linearGradient>
              </defs>
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
              <path d="M20 3v4"/>
              <path d="M22 5h-4"/>
              <path d="M4 17v2"/>
              <path d="M5 18H3"/>
              <circle cx="18" cy="6" r="0.5"/>
              <circle cx="6" cy="18" r="0.5"/>
              <path d="m19 8-2-2"/>
              <path d="m5 16 2 2"/>
            </svg>
            <span className="text-gray-900">DShipIt AI Assistant</span>
            <span className="text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-md ml-2" style={{background: 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(139, 92, 246) 50%, #673DE6 100%)'}}>
              Beta
            </span>
          </SheetTitle>
        </SheetHeader>
        
        {/* AI Sheet - Block global orange styling */}
        <style jsx global>{`
          /* Block all orange styling on AI sheet dropdowns only */
          .ai-sheet-custom [role="combobox"] {
            border-color: rgb(209, 213, 219) !important;
            background: white !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          .ai-sheet-custom [role="combobox"]:hover {
            border-color: rgb(209, 213, 219) !important;
            background: white !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          .ai-sheet-custom [role="combobox"]:focus {
            border-color: rgb(209, 213, 219) !important;
            background: white !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* KILL ALL GRADIENTS AND ORANGE - NUCLEAR OVERRIDE */
          .ai-sheet-custom button.generate-button-ai,
          .ai-sheet-custom button.generate-button-ai:hover,
          .ai-sheet-custom button.generate-button-ai:focus,
          .ai-sheet-custom button.generate-button-ai:active,
          .ai-sheet-custom button.generate-button-ai:focus-visible,
          .ai-sheet-custom button.generate-button-ai:focus-within {
            background: rgb(99, 102, 241) !important;
            background-color: rgb(99, 102, 241) !important;
            background-image: none !important;
            background-clip: border-box !important;
            border: 1px solid rgb(99, 102, 241) !important;
            border-color: rgb(99, 102, 241) !important;
            color: white !important;
            outline: none !important;
            box-shadow: none !important;
            --tw-bg-opacity: 1 !important;
            --tw-border-opacity: 1 !important;
            --tw-text-opacity: 1 !important;
            --tw-ring-color: transparent !important;
            --tw-ring-offset-color: transparent !important;
            --tw-ring-shadow: none !important;
            --tw-shadow: none !important;
            --tw-gradient-from: transparent !important;
            --tw-gradient-to: transparent !important;
            --tw-gradient-via: transparent !important;
            --tw-gradient-stops: none !important;
          }
          
          .ai-sheet-custom button.generate-button-ai:hover:not(:disabled) {
            background: rgb(79, 70, 229) !important;
            background-color: rgb(79, 70, 229) !important;
            background-image: none !important;
            border-color: rgb(79, 70, 229) !important;
          }
          
          .ai-sheet-custom button.generate-button-ai:disabled {
            background: rgb(156, 163, 175) !important;
            background-color: rgb(156, 163, 175) !important;
            background-image: none !important;
            border-color: rgb(156, 163, 175) !important;
            color: rgb(209, 213, 219) !important;
            cursor: not-allowed !important;
          }
        `}</style>

        {/* Error Alert - Directly attached to header */}
        {showError && (
          <Alert className="border-red-200 bg-red-50 rounded-none border-b">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              {!productTitle.trim() ? 'Please enter a product title to optimize.' : 'Generation failed. Please try again or check your internet connection.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Body with Sticky Footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '24px', marginRight: '0' }}>
            <div className="px-6 py-4">

          {/* Unified Form Container */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            
            {/* Form Content */}
            <div className="p-6 space-y-5">
              
              {/* Function Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  AI Function
                </Label>
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger className="w-full h-11 text-base border-gray-300 rounded-lg bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                    <SelectItem value="AI Product Information Optimization" className="text-base py-2">
                      Product Information Optimization
                    </SelectItem>
                    <SelectItem value="AI Translation" className="text-base py-2">
                      AI Translation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Content Based on Selected Function */}
              {selectedFunction === "AI Product Information Optimization" && (
                <>
                  {/* Product Title */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Product Title Keywords
                    </Label>
                    <div className="relative">
                      <Textarea
                        rows={4}
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        placeholder="Enter your product title and keywords for optimization..."
                        className="w-full resize-y min-h-[100px] max-h-[300px] text-base leading-relaxed border-gray-300 rounded-lg bg-white"
                        style={{
                          borderColor: 'rgb(209, 213, 219)',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'
                          e.currentTarget.style.outline = 'none'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 69, 233, 0.2)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        maxLength={1000}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {productTitle.length}/1000
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Optimization Requirements
                    </Label>
                    <div className="relative">
                      <Textarea
                        rows={3}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Describe how you want the content optimized (e.g., concise, professional, SEO-friendly)..."
                        className="w-full resize-y min-h-[80px] max-h-[200px] text-base leading-relaxed border-gray-300 rounded-lg bg-white"
                        style={{
                          borderColor: 'rgb(209, 213, 219)',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'
                          e.currentTarget.style.outline = 'none'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 69, 233, 0.2)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        maxLength={200}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {requirements.length}/200
                      </div>
                    </div>
                  </div>

                  {/* Language Selection for Product Optimization */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      Output Language
                    </Label>
                    <Select value={optimizationLanguage} onValueChange={setOptimizationLanguage}>
                      <SelectTrigger className="w-full h-11 text-base border-gray-300 rounded-lg bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                        <SelectItem value="English" className="text-base py-2">English</SelectItem>
                        <SelectItem value="Spanish" className="text-base py-2">Spanish</SelectItem>
                        <SelectItem value="French" className="text-base py-2">French</SelectItem>
                        <SelectItem value="German" className="text-base py-2">German</SelectItem>
                        <SelectItem value="Portuguese" className="text-base py-2">Portuguese</SelectItem>
                        <SelectItem value="Italian" className="text-base py-2">Italian</SelectItem>
                        <SelectItem value="Russian" className="text-base py-2">Russian</SelectItem>
                        <SelectItem value="Chinese" className="text-base py-2">Chinese</SelectItem>
                        <SelectItem value="Japanese" className="text-base py-2">Japanese</SelectItem>
                        <SelectItem value="Korean" className="text-base py-2">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </>
              )}

              {selectedFunction === "AI Translation" && (
                <>
                  {/* Translation Header */}
                  <div className="space-y-4 mt-6">
                    <Label className="text-lg font-medium text-gray-800">
                      Please check the translated content
                    </Label>
                    
                    {/* Language Selection Row */}
                    <div className="grid grid-cols-11 gap-1 items-center mb-3">
                      {/* English Label */}
                      <div className="col-span-5">
                        <div className="flex items-center justify-start h-9">
                          <Label className="text-base font-medium text-gray-700">
                            English
                          </Label>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="col-span-1 flex justify-center">
                        <div className="p-1.5 rounded-lg bg-gray-100">
                          <ArrowRight className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>

                      {/* Language Selector */}
                      <div className="col-span-5">
                        <div className="flex items-center justify-start h-9">
                          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                            <SelectTrigger className="w-full h-9 text-base font-medium border-gray-300 rounded bg-white text-left">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded border-gray-200">
                              <SelectItem value="German" className="text-base py-1.5 font-normal">German</SelectItem>
                              <SelectItem value="Spanish" className="text-base py-1.5 font-normal">Spanish</SelectItem>
                              <SelectItem value="French" className="text-base py-1.5 font-normal">French</SelectItem>
                              <SelectItem value="Portuguese" className="text-base py-1.5 font-normal">Portuguese</SelectItem>
                              <SelectItem value="Italian" className="text-base py-1.5 font-normal">Italian</SelectItem>
                              <SelectItem value="Russian" className="text-base py-1.5 font-normal">Russian</SelectItem>
                              <SelectItem value="Chinese" className="text-base py-1.5 font-normal">Chinese</SelectItem>
                              <SelectItem value="Japanese" className="text-base py-1.5 font-normal">Japanese</SelectItem>
                              <SelectItem value="Korean" className="text-base py-1.5 font-normal">Korean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Text Areas Row */}
                    <div className="grid grid-cols-11 gap-1">
                      {/* Source Text Area */}
                      <div className="col-span-5">
                        <div className="relative">
                          <Textarea
                            rows={6}
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Enter text to translate..."
                            className="w-full h-[180px] resize-none text-base leading-relaxed border-gray-300 rounded-lg bg-white"
                            style={{
                              borderColor: 'rgb(209, 213, 219)',
                              outline: 'none',
                              boxShadow: 'none'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'
                              e.currentTarget.style.outline = 'none'
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 69, 233, 0.2)'
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                            maxLength={1000}
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                            {sourceText.length}/1000
                          </div>
                        </div>
                      </div>

                      {/* Minimal space for arrow alignment */}
                      <div className="col-span-1"></div>

                      {/* Target Text Area */}
                      <div className="col-span-5">
                        <div className="relative">
                          <Textarea
                            rows={6}
                            value={translatedText}
                            onChange={(e) => setTranslatedText(e.target.value)}
                            placeholder="The translated content will be displayed here"
                            className="w-full h-[180px] resize-none text-base leading-relaxed border-gray-300 bg-gray-50 rounded-lg"
                            style={{
                              borderColor: 'rgb(209, 213, 219)',
                              outline: 'none',
                              boxShadow: 'none'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'
                              e.currentTarget.style.outline = 'none'
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 69, 233, 0.2)'
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                            readOnly
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                            {translatedText.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Generated Content - Only show for Product Optimization */}
              {selectedFunction === "AI Product Information Optimization" && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    AI Generated Content
                  </Label>
                  <div className="relative">
                    <Textarea
                      rows={6}
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      placeholder="Your AI-generated content will appear here..."
                      className="w-full resize-y min-h-[150px] max-h-[400px] text-base leading-relaxed border-gray-300 bg-gray-50 rounded-lg"
                      style={{
                        borderColor: 'rgb(209, 213, 219)',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgb(139, 69, 233)'
                        e.currentTarget.style.outline = 'none'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 69, 233, 0.2)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      readOnly
                    />
                    {isLoading && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">0</span>
                          <span className="text-xs text-gray-500">100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                      {generatedContent.length}
                    </div>
                  </div>
                </div>
              )}
            </div>

            </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white shadow-lg px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="url(#sparkles-footer)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="sparkles-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(236, 72, 153)" />
                      <stop offset="50%" stopColor="rgb(139, 92, 246)" />
                      <stop offset="100%" stopColor="#673DE6" />
                    </linearGradient>
                  </defs>
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                  <path d="M20 3v4"/>
                  <path d="M22 5h-4"/>
                  <path d="M4 17v2"/>
                  <path d="M5 18H3"/>
                  <circle cx="18" cy="6" r="0.5"/>
                  <circle cx="6" cy="18" r="0.5"/>
                  <path d="m19 8-2-2"/>
                  <path d="m5 16 2 2"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-900">AI Credits Available</span>
                  <span className="text-sm text-gray-600">0 Free + 0 Premium</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your available AI generation credits</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <button 
                type="button"
                disabled={isLoading}
                className="px-6 py-2 text-lg font-normal rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  background: isLoading 
                    ? 'rgb(107, 114, 128)' 
                    : 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(139, 92, 246) 50%, #673DE6 100%)',
                  border: 'none',
                  color: 'white',
                  outline: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  minWidth: '200px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgb(219, 39, 119) 0%, rgb(124, 58, 237) 50%, #5B35CC 100%)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(139, 92, 246) 50%, #673DE6 100%)'
                  }
                }}
                onClick={handleAIGeneration}
              >
                <Sparkles className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Generate Content</span>
              </button>

              {/* Apply button - only show when content is generated */}
              {generatedContent && selectedFunction === "AI Product Information Optimization" && (
                <button
                  type="button"
                  className="px-6 py-2 text-lg font-normal rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    color: 'white',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '150px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  }}
                  onClick={() => {
                    if (onOptimizedTitle && generatedContent) {
                      onOptimizedTitle(generatedContent);
                    }
                  }}
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  <span>Apply Title</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}