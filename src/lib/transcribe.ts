export async function transcribeAudio(audioUrl: string): Promise<string> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ url: audioUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Transcription failed: ${error.error || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.text;
} 