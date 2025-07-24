import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  BookOpen, 
  Video, 
  Users, 
  ArrowRight,
  Sparkles,
  Zap,
  Home
} from 'lucide-react';
import useSmoothNavigate from '@/hooks/useSmoothNavigate';

const Support = () => {
  const navigate = useNavigate();
  const smoothNavigate = useSmoothNavigate();

  const supportOptions = [
    {
      title: 'Help Center',
      description: 'Browse our comprehensive documentation and guides',
      icon: BookOpen,
      action: 'Browse Docs',
      href: '#',
      color: 'from-gray-600 to-gray-700'
    },
    {
      title: 'Video Tutorials',
      description: 'Learn with step-by-step video guides',
      icon: Video,
      action: 'Watch Videos',
      href: '#',
      color: 'from-gray-700 to-gray-800'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other Briefly users',
      icon: Users,
      action: 'Join Community',
      href: '#',
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      href: '#',
      color: 'from-gray-800 to-black'
    }
  ];

  const faqs = [
    {
      question: 'How do I connect my social media accounts?',
      answer: 'Go to your dashboard and click "Connect Accounts". We support LinkedIn, Twitter, Instagram, and YouTube. The process takes just a few clicks and is completely secure.'
    },
    {
      question: 'Can I customize the newsletter templates?',
      answer: 'Yes! All templates are fully customizable. You can modify colors, fonts, layouts, and add your own branding elements.'
    },
    {
      question: 'How often can I generate newsletters?',
      answer: 'Free users can generate 3 newsletters per month. Pro users have unlimited generation. Enterprise plans include custom frequency limits.'
    },
    {
      question: 'Is my content secure?',
      answer: 'Absolutely. We use enterprise-grade encryption and never share your data with third parties. Your content remains private and secure.'
    },
    {
      question: 'Can I export to different formats?',
      answer: 'Yes, you can export to PDF, HTML, and various newsletter platform formats including Substack, ConvertKit, and Mailchimp.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact our support team for a full refund.'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Back to Home Button */}
      <div className="absolute top-6 right-6 z-10">
        <Button 
          variant="outline" 
          onClick={() => smoothNavigate('/')}
          size="icon"
          className="border-gray-300 hover:border-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <Home className="w-4 h-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
            We're Here to <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">Help</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the help you need to make the most of Briefly. Our team is ready to assist you.
          </p>
        </div>
      </div>

      {/* Support Options */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {supportOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.title}
                className="group cursor-pointer"
                onClick={() => window.open(option.href, '_blank')}
              >
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:border-black/50 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className={`bg-gradient-to-r ${option.color} p-4 rounded-2xl`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-black">{option.title}</h3>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      <div className="flex items-center gap-2 text-black font-medium group-hover:gap-3 transition-all duration-200">
                        <span>{option.action}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-black">Get in Touch</h2>
            <p className="text-gray-600">Can't find what you're looking for? Reach out to our team.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Email Support</h3>
              <p className="text-gray-600 mb-4">Get help via email</p>
              <a 
                href="mailto:hello@briefly.ai" 
                className="text-black hover:text-gray-700 transition-colors font-medium"
              >
                hello@briefly.ai
              </a>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Live Chat</h3>
              <p className="text-gray-600 mb-4">Instant support</p>
              <Button variant="outline" className="font-medium">
                Start Chat
              </Button>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Phone Support</h3>
              <p className="text-gray-600 mb-4">For enterprise customers</p>
              <a 
                href="tel:+1-555-0123" 
                className="text-black hover:text-gray-700 transition-colors font-medium"
              >
                +1 (555) 0123
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find answers to common questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-lg text-black">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-3xl p-8">
            <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-black">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Join thousands of creators who are already using Briefly to transform their content.
            </p>
            <Button
              onClick={() => smoothNavigate('/newsletter-builder')}
              className="bg-gradient-to-r from-black to-gray-700 hover:from-gray-700 hover:to-black text-white font-medium px-8 py-3"
            >
              Start Building
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 