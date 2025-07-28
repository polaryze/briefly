// Fallback newsletter template that doesn't rely on external files
export const FALLBACK_NEWSLETTER_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .newsletter-container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .section h2 {
            color: #2c3e50;
            font-size: 1.5em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-content {
            color: #555;
            line-height: 1.7;
        }
        .social-highlights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .social-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .social-card h3 {
            color: #2c3e50;
            font-size: 1.1em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .social-card p {
            color: #666;
            font-size: 0.9em;
            margin: 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #7f8c8d;
        }
        .cta-button {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background: #2980b9;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .newsletter-container {
                padding: 20px;
            }
            .header h1 {
                font-size: 2em;
            }
            .social-highlights {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="newsletter-container">
        <div class="header">
            <h1>Your Weekly Newsletter</h1>
            <div class="subtitle">Generated with AI from your social media content</div>
        </div>
        
        <div class="section">
            <h2>🚀 This Week's Highlights</h2>
            <div class="section-content">
                <p>This is a fallback newsletter template that will be used when the main template fails to load. 
                Your AI-generated content will appear here once the newsletter generation is working properly.</p>
            </div>
        </div>
        
        <div class="section">
            <h2>📱 Social Media Updates</h2>
            <div class="section-content">
                <p>Your social media content will be summarized and displayed here, showing the most engaging posts 
                from your various platforms.</p>
                
                <div class="social-highlights">
                    <div class="social-card">
                        <h3>🐦 X (Twitter)</h3>
                        <p>Your latest tweets and engagement metrics will appear here.</p>
                    </div>
                    <div class="social-card">
                        <h3>📸 Instagram</h3>
                        <p>Your Instagram posts and stories will be featured here.</p>
                    </div>
                    <div class="social-card">
                        <h3>🎥 YouTube</h3>
                        <p>Your YouTube videos and channel updates will be shown here.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>💡 Key Insights</h2>
            <div class="section-content">
                <p>AI-generated insights and analysis of your content performance will be displayed here, 
                helping you understand what resonates with your audience.</p>
            </div>
        </div>
        
        <div class="footer">
            <a href="#" class="cta-button">Reply & Share Your Thoughts</a>
            <p>Generated with ❤️ by Briefly AI</p>
        </div>
    </div>
</body>
</html>
`;

// Function to get fallback template with dynamic content
export function getFallbackTemplate(data: any = {}): string {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return FALLBACK_NEWSLETTER_TEMPLATE.replace(
    'Your Weekly Newsletter',
    `${data.authorName || 'Your'} Weekly Newsletter`
  ).replace(
    'Generated with AI from your social media content',
    `Generated on ${currentDate} with AI from your social media content`
  );
} 