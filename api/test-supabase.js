import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const envCheck = {
      SUPABASE_URL: supabaseUrl ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? '✅ Set' : '❌ Missing'
    };

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.json({
        error: 'Supabase environment variables not configured',
        envCheck
      });
    }

    // Try to connect to Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Test connection by getting count
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.json({
        error: 'Supabase connection failed',
        details: error.message,
        envCheck
      });
    }

    // Try to get all data
    const { data, error: dataError } = await supabase
      .from('waitlist')
      .select('*')
      .limit(5);

    return res.json({
      success: true,
      message: 'Supabase connection working',
      count: count || 0,
      data: data || [],
      envCheck
    });

  } catch (error) {
    return res.json({
      error: 'Test failed',
      details: error.message
    });
  }
} 