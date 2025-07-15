import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { configManager } from '@/lib/config';
import { logger } from '@/lib/logger';

const platforms = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
];

const DebugSocialAPIs: React.FC = () => {
  const [platform, setPlatform] = useState('linkedin');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Hardcoded LinkedIn API Test ---
  const [hardcodedLinkedinRaw, setHardcodedLinkedinRaw] = useState<string | null>(null);
  const [hardcodedLinkedinError, setHardcodedLinkedinError] = useState<string | null>(null);
  const runHardcodedLinkedinTest = async () => {
    setHardcodedLinkedinRaw(null);
    setHardcodedLinkedinError(null);
    const url = 'https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fpranaybapna%2F&type=posts';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
      }
    };
    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
      setHardcodedLinkedinRaw(result);
    } catch (error: any) {
      console.error(error);
      setHardcodedLinkedinError(error.message || 'Unknown error');
    }
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRawResponse(null);
    setParsed(null);
    setError(null);
    try {
      if (platform === 'youtube') {
        // Test YouTube summarizer via local backend
        setError(null);
        setRawResponse(null);
        setParsed(null);
        try {
          const resp = await fetch('http://localhost:8080/api/scrape-socials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ links: [input], timeRange: 'week', youtubeSummaries: { [input]: 'Test summary from frontend' } })
          });
          const data = await resp.json();
          setRawResponse(data);
          setParsed(data.posts || data.error || data);
          if (!resp.ok) setError(data.error || 'Unknown error');
        } catch (err: any) {
          setError(err.message || 'Failed to connect to local backend');
        }
      } else if (platform === 'linkedin') {
        // Run the provided fetch snippet directly from the frontend
        setError(null);
        setRawResponse(null);
        setParsed(null);
        try {
          const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=https%3A%2F%2Fwww.linkedin.com%2Fin%2F${encodeURIComponent(input)}%2F&type=posts`;
          const options = {
            method: 'GET',
            headers: {
              'x-rapidapi-key': RAPIDAPI_KEY,
              'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
            }
          };
          const response = await fetch(url, options);
          const result = await response.text();
          setRawResponse(result);
          try {
            setParsed(JSON.parse(result));
          } catch {
            setParsed(result);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to connect to LinkedIn API');
        }
      } else if (platform === 'instagram') {
        // Test Instagram scraping via local backend
        setError(null);
        setRawResponse(null);
        setParsed(null);
        try {
          const resp = await fetch('http://localhost:8080/api/scrape-socials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ links: [input], timeRange: 'week' })
          });
          const data = await resp.json();
          setRawResponse(data);
          setParsed(data.posts || data.error || data);
          if (!resp.ok) setError(data.error || 'Unknown error');
        } catch (err: any) {
          setError(err.message || 'Failed to connect to local backend');
        }
      } else if (platform === 'twitter') {
        // Test X API directly from frontend using two-step process
        setError(null);
        setRawResponse(null);
        setParsed(null);
        try {
          // Extract handle from URL or @handle format
          let handle = input;
          if (input.includes('twitter.com/') || input.includes('x.com/')) {
            const match = input.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
            handle = match ? match[1] : input;
          } else if (input.startsWith('@')) {
            handle = input.substring(1);
          }
          
          // Step 1: Get user ID by username
          const userUrl = `https://twitter241.p.rapidapi.com/user?username=${encodeURIComponent(handle)}`;
          const userOptions = {
            method: 'GET',
            headers: {
              'x-rapidapi-key': RAPIDAPI_KEY,
              'x-rapidapi-host': 'twitter241.p.rapidapi.com'
            }
          };
          
          const userResponse = await fetch(userUrl, userOptions);
          const userResult = await userResponse.text();
          console.log('X User API Response:', userResult);
          
          let userData;
          try {
            userData = JSON.parse(userResult);
          } catch (parseError) {
            setError('Failed to parse X user API response');
            setRawResponse(userResult);
            return;
          }
          
          // Extract rest_id from user data - handle different response structures
          let restId = userData?.result?.data?.user?.result?.rest_id;
          
          // Try alternative paths if the first one doesn't work
          if (!restId) {
            restId = userData?.data?.user?.result?.rest_id;
          }
          if (!restId) {
            restId = userData?.data?.user?.rest_id;
          }
          if (!restId) {
            restId = userData?.user?.rest_id;
          }
          if (!restId) {
            restId = userData?.rest_id;
          }
          if (!restId) {
            restId = userData?.data?.rest_id;
          }
          if (!restId) {
            // Search through the entire response for rest_id
            const searchForRestId = (obj: any): string | null => {
              if (typeof obj !== 'object' || obj === null) return null;
              if (obj.rest_id) return obj.rest_id;
              for (const key in obj) {
                const result = searchForRestId(obj[key]);
                if (result) return result;
              }
              return null;
            };
            restId = searchForRestId(userData);
          }
          if (!restId) {
            setError('User not found or no rest_id available');
            setRawResponse(userResult);
            return;
          }
          
          console.log('X User rest_id:', restId);
          
          // Step 2: Get tweets using rest_id
          const tweetsUrl = `https://twitter241.p.rapidapi.com/user-tweets?user=${restId}&count=20`;
          const tweetsOptions = {
            method: 'GET',
            headers: {
              'x-rapidapi-key': RAPIDAPI_KEY,
              'x-rapidapi-host': 'twitter241.p.rapidapi.com'
            }
          };
          
          const tweetsResponse = await fetch(tweetsUrl, tweetsOptions);
          const tweetsResult = await tweetsResponse.text();
          console.log('X Tweets API Response:', tweetsResult);
          
          // Combine both responses for debugging
          const combinedResponse = {
            step1_user: userData,
            step2_tweets: JSON.parse(tweetsResult)
          };
          
          setRawResponse(JSON.stringify(combinedResponse, null, 2));
          
          try {
            const tweetsData = JSON.parse(tweetsResult);
            setParsed(tweetsData);
            if (!tweetsResponse.ok) setError(tweetsData.error || 'Unknown error');
          } catch (parseError) {
            setParsed(tweetsResult);
            setError('Failed to parse tweets response');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to connect to X API');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      logger.error('DebugSocialAPIs error', err);
    } finally {
      setLoading(false);
    }
  };

  const RAPIDAPI_KEY = configManager.getRapidAPIKey();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background py-12 px-2 md:px-4">
      <Card className="max-w-xl w-full p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Debug Social API Integrations</h2>
        {/* --- Hardcoded LinkedIn API Test Button --- */}
        <div className="mb-6">
          <Button type="button" onClick={runHardcodedLinkedinTest} className="mb-2">Run Hardcoded LinkedIn API Test (pranaybapna)</Button>
          {hardcodedLinkedinRaw && (
            <div className="mt-2">
              <h3 className="font-semibold mb-2">Raw Response (Hardcoded LinkedIn)</h3>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">{hardcodedLinkedinRaw}</pre>
            </div>
          )}
          {hardcodedLinkedinError && (
            <div className="mt-2 text-destructive">Error: {hardcodedLinkedinError}</div>
          )}
        </div>
        <form onSubmit={handleTest} className="flex flex-col gap-4">
          <div>
            <label className="block text-foreground text-sm mb-1">Platform</label>
            <select
              className="border border-border rounded px-3 py-2 text-base bg-background text-foreground"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              disabled={loading}
            >
              {platforms.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-foreground text-sm mb-1">Profile/Video URL or Handle</label>
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={platform === 'youtube' ? 'https://youtube.com/watch?v=...' : 'Profile URL or @handle'}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !input}>
              {loading ? 'Testing...' : 'Test API'}
            </Button>
          </div>
        </form>
        {error && <div className="mt-4 text-destructive">Error: {error}</div>}
        {rawResponse && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Raw API Response</h3>
            <pre className="bg-muted rounded p-2 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">{JSON.stringify(rawResponse, null, 2)}</pre>
          </div>
        )}
        {parsed && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Parsed Data</h3>
            <pre className="bg-muted rounded p-2 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">{typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}</pre>
          </div>
        )}
      </Card>
      <Card className="max-w-xl w-full p-4 text-xs text-muted-foreground">
        <b>Note:</b> This page is for development/debugging only. It is not linked from the main app and can be deleted at any time.
      </Card>
    </div>
  );
};

export default DebugSocialAPIs; 