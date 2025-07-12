import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Missing url' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Use AssemblyAI for transcription
    const assemblyaiApiKey = Deno.env.get('ASSEMBLYAI_API_KEY')
    if (!assemblyaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing AssemblyAI API key' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyaiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: url,
        speech_model: 'best'
      })
    })

    const data = await response.json()
    
    if (data.status === 'error') {
      return new Response(
        JSON.stringify({ error: data.error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Poll for completion
    let transcript = data
    while (transcript.status !== 'completed' && transcript.status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcript.id}`, {
        headers: {
          'Authorization': assemblyaiApiKey,
        }
      })
      transcript = await pollResponse.json()
    }

    if (transcript.status === 'error') {
      return new Response(
        JSON.stringify({ error: transcript.error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ text: transcript.text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Transcription failed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 