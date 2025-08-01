import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['DM Sans', 'system-ui', 'sans-serif'],
				'serif': ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
				},
				error: {
					DEFAULT: 'hsl(var(--error))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'typewriter': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'blink': {
					'50%': { borderColor: 'transparent' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'scroll': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(-50%)' }
				},
				'polka-float': {
					'0%': {
						transform: 'translateY(0px) translateX(0px)'
					},
					'25%': {
						transform: 'translateY(-10px) translateX(5px)'
					},
					'50%': {
						transform: 'translateY(-5px) translateX(-3px)'
					},
					'75%': {
						transform: 'translateY(-15px) translateX(2px)'
					},
					'100%': {
						transform: 'translateY(0px) translateX(0px)'
					}
				},
				'border-trace': {
					'0%': { borderColor: 'rgba(0,0,0,0.0)', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
					'10%': { borderTopColor: 'rgba(0,0,0,0.6)' },
					'30%': { borderRightColor: 'rgba(0,0,0,0.6)' },
					'60%': { borderBottomColor: 'rgba(0,0,0,0.6)' },
					'90%': { borderLeftColor: 'rgba(0,0,0,0.6)' },
					'100%': { borderColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 16px 2px rgba(0,0,0,0.15)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.8s ease-out forwards',
				'typewriter': 'typewriter 3s steps(30) 1s forwards',
				'blink': 'blink 1s infinite',
				'float': 'float 3s ease-in-out infinite',
				'scroll': 'scroll 10s linear infinite',
				'polka-float': 'polka-float 20s linear infinite',
				'border-trace': 'border-trace 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
			},
			backgroundImage: {
				'polka-dots': 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)'
			},
			backgroundSize: {
				'polka': '20px 20px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
	// Add scrollbar-hide utility
	variants: {
		extend: {
			scrollbar: ['rounded']
		}
	}
} satisfies Config;
