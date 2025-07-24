import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, ArrowRight, Home } from 'lucide-react';
import useSmoothNavigate from '../hooks/useSmoothNavigate';

const Pricing = () => {
  const navigate = useNavigate();
  const smoothNavigate = useSmoothNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Briefly',
      features: [
        '3 newsletters per month',
        'Basic AI generation',
        'Standard templates',
        'Email support'
      ],
      cta: 'Get Started',
      popular: false,
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Pro',
      price: '$6.99',
      period: 'per month',
      description: 'For creators and small teams',
      features: [
        'Unlimited newsletters',
        'Advanced AI features',
        'Custom templates',
        'Priority support',
        'Analytics dashboard',
        'Multi-platform integration'
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-black to-gray-700'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'per month',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Custom AI training',
        'White-label options',
        'Dedicated support',
        'API access',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-gray-700 to-gray-800'
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
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
            Choose Your <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group ${
                plan.popular 
                  ? 'md:scale-105' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-black to-gray-700 text-white px-6 py-3 rounded-3xl text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`bg-white border border-gray-200 rounded-3xl p-8 h-full hover:border-black/50 transition-all duration-300 hover:shadow-xl shadow-sm ${
                plan.popular ? 'ring-2 ring-gray-300' : ''
              }`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-black">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-black">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                                  <Button
                    onClick={() => {
                      if (plan.name === 'Free') {
                        navigate('/newsletter-builder');
                      } else if (plan.name === 'Pro') {
                        navigate('/newsletter-builder');
                      } else {
                        // Contact sales
                        window.open('mailto:hello@briefly.ai?subject=Enterprise%20Inquiry', '_blank');
                      }
                    }}
                    className={`w-full group ${
                      plan.popular
                        ? 'bg-gradient-to-r from-black to-gray-700 hover:from-gray-700 hover:to-black'
                        : 'bg-black hover:bg-gray-800'
                    } text-white font-medium`}
                  >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8 text-black">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-black">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time with no questions asked.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-black">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-black">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and Apple Pay.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-black">Is my data secure?</h3>
              <p className="text-gray-600">Yes, we use enterprise-grade security and never share your data with third parties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 