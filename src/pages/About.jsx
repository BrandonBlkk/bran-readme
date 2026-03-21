import React from 'react'
import Sidebar from '../components/Sidebar'
import { Info, Layout, Zap, Shield, Github, ExternalLink } from 'lucide-react'

const About = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar activePanel="about" onPanelChange={() => {}} />
      
      <div
        style={{
          marginLeft: '48px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          padding: '40px',
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <header style={{ marginBottom: '48px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '16px', color: 'var(--accent)' }}>About ReadmeForge</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              ReadmeForge is a powerful, intuitive tool designed to help developers create professional GitHub READMEs in minutes.
            </p>
          </header>

          <section style={{ 
            background: 'rgba(24, 24, 27, 0.4)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '32px',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(8px)',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Info size={24} style={{ color: 'var(--accent)' }} />
              Key Features
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Layout size={20} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontWeight: '600' }}>Drag & Drop Builder</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Easily arrange and customize sections of your README with our intuitive drag-and-drop interface.
                </p>
              </div>

              <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Zap size={20} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontWeight: '600' }}>Real-time Preview</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  See your changes instantly with our live markdown preview that matches GitHub's styling.
                </p>
              </div>

              <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Shield size={20} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontWeight: '600' }}>Ready-to-use Templates</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Start quickly with professionally designed templates for various types of projects.
                </p>
              </div>
            </div>
          </section>

          <section style={{ 
            background: 'rgba(24, 24, 27, 0.4)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '32px',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(8px)',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px' }}>Our Mission</h2>
            <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              We believe that every project deserves a great README. Our mission is to simplify the process of 
              documenting your work, allowing you to focus on what matters most: building amazing software.
            </p>
          </section>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a 
              href="https://github.com/BrandonBlkk/bran-readme" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 24px', 
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <Github size={20} />
              <span>View on GitHub</span>
              <ExternalLink size={14} style={{ marginLeft: '4px' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
