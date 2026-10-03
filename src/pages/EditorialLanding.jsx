import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Check } from 'lucide-react';
import '../editorial.css'; // Import bespoke editorial CSS

export default function EditorialLanding() {
  
  // Intersection Observer for scroll animations (fade-up)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.ed-fade-up').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ed-page">
      
      {/* 1. HERO SECTION */}
      <section className="ed-py-32">
        <div className="ed-container ed-max-w-2xl" style={{ textAlign: 'center' }}>
          <div className="ed-fade-up" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ed-muted)', marginBottom: '1.5rem', fontWeight: 600 }}>
            Infrastructure Planning Tool
          </div>
          <h1 className="ed-text-6xl ed-fade-up ed-stagger-1" style={{ marginBottom: '1.5rem' }}>
            Synchronize public works. <br />Build it right, once.
          </h1>
          <p className="ed-text-2xl ed-text-muted ed-fade-up ed-stagger-2" style={{ marginBottom: '2.5rem', maxWidth: '36rem', margin: '0 auto 2.5rem' }}>
            A unified platform for government departments to coordinate projects, prevent overlaps, and save taxpayer money.
          </p>
          <div className="ed-fade-up ed-stagger-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '4rem' }}>
            <Link to="/login" className="ed-btn ed-btn-solid">
              Access Dashboard
            </Link>
            <a href="#how-it-works" className="ed-btn ed-btn-ghost">
              See how it works <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </a>
          </div>
        </div>
        
        {/* Floating Screenshot */}
        <div className="ed-container ed-fade-up ed-stagger-3" style={{ padding: '0 24px', marginTop: '2rem' }}>
          <div className="ed-floating-image" style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            {/* Soft UI illustration mock */}
            <div style={{ width: '80%', height: '80%', border: '1px solid var(--ed-border)', borderRadius: '8px', background: '#FAFAF9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '40px', borderBottom: '1px solid var(--ed-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E4E4E7' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E4E4E7' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E4E4E7' }}></div>
              </div>
              <div style={{ padding: '24px', display: 'flex', gap: '24px', flex: 1 }}>
                <div style={{ width: '25%', height: '100%', background: 'white', border: '1px solid var(--ed-border)', borderRadius: '6px' }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '60%', height: '24px', background: 'var(--ed-accent-light)', borderRadius: '4px' }}></div>
                  <div style={{ width: '100%', flex: 1, background: 'white', border: '1px solid var(--ed-border)', borderRadius: '6px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE HIGHLIGHTS */}
      <section id="how-it-works" className="ed-py-24">
        <div className="ed-container">
          
          {/* Feature 1 */}
          <div className="ed-feature-grid ed-fade-up" style={{ marginBottom: '8rem' }}>
            <div style={{ padding: '2rem' }}>
              <h2 className="ed-text-2xl" style={{ marginBottom: '1rem' }}>No more duplicate excavations.</h2>
              <p className="ed-text-muted" style={{ fontSize: '1.125rem' }}>
                When the Water department plans a pipeline, and Telecom plans fiber optics on the same road, GovSync identifies the overlap. It automatically schedules them together, so the road is dug and paved exactly once.
              </p>
            </div>
            <div className="ed-floating-image" style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ed-accent-light)' }}>
              <div style={{ padding: '24px', background: 'white', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ed-text)' }}></div>
                  <span style={{ fontSize: '0.875rem' }}>Schedule optimized by AI</span>
                </div>
                <div style={{ width: '200px', height: '4px', background: '#E4E4E7', borderRadius: '2px', marginBottom: '8px' }}>
                  <div style={{ width: '60%', height: '100%', background: 'var(--ed-accent)', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="ed-feature-grid ed-fade-up" style={{ marginBottom: '8rem' }}>
            <div className="ed-floating-image" style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', order: -1 }}>
               <div style={{ width: '60%', border: '1px solid var(--ed-border)', borderRadius: '8px', overflow: 'hidden' }}>
                 <div style={{ padding: '12px', borderBottom: '1px solid var(--ed-border)', fontSize: '0.75rem', color: 'var(--ed-muted)' }}>Escrow Release</div>
                 <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontFamily: 'var(--ed-font-serif)', fontSize: '1.5rem' }}>₹12.5 Cr</span>
                   <Check size={20} color="var(--ed-accent)" />
                 </div>
               </div>
            </div>
            <div style={{ padding: '2rem' }}>
              <h2 className="ed-text-2xl" style={{ marginBottom: '1rem' }}>Money follows milestones.</h2>
              <p className="ed-text-muted" style={{ fontSize: '1.125rem' }}>
                Funds are held in a secure central escrow. Contractors receive payouts only when the District Administration and Finance department digitally verify that the milestone is complete. Accountability is built in.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="ed-feature-grid ed-fade-up">
            <div style={{ padding: '2rem' }}>
              <h2 className="ed-text-2xl" style={{ marginBottom: '1rem' }}>Quietly powerful AI.</h2>
              <p className="ed-text-muted" style={{ fontSize: '1.125rem' }}>
                Our algorithms don't replace engineers; they support them. By analyzing historical traffic patterns, weather delays, and spatial GIS data, GovSync suggests realistic timelines that human teams can review and refine.
              </p>
            </div>
            <div className="ed-floating-image" style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '70%' }}>
                <div style={{ aspectRatio: '1', background: 'var(--ed-bg)', borderRadius: '4px', border: '1px solid var(--ed-border)' }}></div>
                <div style={{ aspectRatio: '1', background: 'var(--ed-accent)', borderRadius: '4px' }}></div>
                <div style={{ aspectRatio: '1', background: 'var(--ed-bg)', borderRadius: '4px', border: '1px solid var(--ed-border)' }}></div>
                <div style={{ aspectRatio: '1', background: 'var(--ed-accent-light)', borderRadius: '4px' }}></div>
                <div style={{ aspectRatio: '1', background: 'var(--ed-bg)', borderRadius: '4px', border: '1px solid var(--ed-border)' }}></div>
                <div style={{ aspectRatio: '1', background: 'var(--ed-bg)', borderRadius: '4px', border: '1px solid var(--ed-border)' }}></div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 3. MILESTONE / TIMELINE STRIP */}
      <section className="ed-py-24" style={{ borderTop: '1px solid var(--ed-border)', borderBottom: '1px solid var(--ed-border)' }}>
        <div className="ed-container">
          <div className="ed-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontFamily: 'var(--ed-font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>July 2026</div>
              <p className="ed-text-muted" style={{ fontSize: '0.875rem' }}>Deployed across 4 pilot districts, linking 12 distinct government departments.</p>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontFamily: 'var(--ed-font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>₹420 Crore</div>
              <p className="ed-text-muted" style={{ fontSize: '0.875rem' }}>Successfully routed and verified through the smart escrow vault in Q1.</p>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontFamily: 'var(--ed-font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Zero</div>
              <p className="ed-text-muted" style={{ fontSize: '0.875rem' }}>Number of repeated excavations on synced infrastructure projects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="ed-py-32">
        <div className="ed-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            <div className="ed-fade-up">
              <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "We used to find out about road excavations after they had already started. Now, we plan alongside the PWD before a single shovel hits the dirt."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="ed-avatar"></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Anil Sharma</div>
                  <div className="ed-text-muted" style={{ fontSize: '0.75rem' }}>Chief Engineer, Water Department</div>
                </div>
              </div>
            </div>
            <div className="ed-fade-up ed-stagger-1">
              <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "The escrow feature means we don't have to wait six months for payment clearance. Once the milestone is checked, the funds move. It's clean and predictable."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="ed-avatar"></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Vikram Patel</div>
                  <div className="ed-text-muted" style={{ fontSize: '0.75rem' }}>Director, L&T Infrastructure</div>
                </div>
              </div>
            </div>
            <div className="ed-fade-up ed-stagger-2">
              <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "Finally, a tool that doesn't feel like a clunky government spreadsheet. It is actually a pleasure to use for daily site reporting."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="ed-avatar"></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Meera Reddy</div>
                  <div className="ed-text-muted" style={{ fontSize: '0.75rem' }}>District Administration Coordinator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST / PRIVACY CALLOUT */}
      <section className="ed-py-24" style={{ background: 'white' }}>
        <div className="ed-container ed-max-w-2xl" style={{ textAlign: 'center' }}>
          <div className="ed-fade-up" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--ed-accent-light)', marginBottom: '1.5rem' }}>
            <ShieldCheck size={24} color="var(--ed-accent)" />
          </div>
          <h2 className="ed-text-2xl ed-fade-up" style={{ marginBottom: '1rem' }}>Your data, heavily guarded.</h2>
          <p className="ed-text-muted ed-fade-up" style={{ fontSize: '1.125rem' }}>
            We know government data is sensitive. That's why GovSync uses end-to-end AES-256 encryption. We don't sell your data, we don't run ads, and you own your project history entirely. Hosted locally, secured globally.
          </p>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="ed-py-32">
        <div className="ed-container" style={{ textAlign: 'center' }}>
          <h2 className="ed-text-5xl ed-fade-up" style={{ marginBottom: '2rem' }}>Ready to coordinate?</h2>
          <div className="ed-fade-up ed-stagger-1">
            <Link to="/login" className="ed-btn ed-btn-solid">
              Access the Platform
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--ed-border)', fontSize: '0.875rem' }}>
        <div className="ed-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--ed-font-serif)', fontSize: '1.25rem', marginBottom: '1rem' }}>GovSync</div>
            <p className="ed-text-muted" style={{ maxWidth: '250px' }}>Coordinate once. Build right. Saving time and public money.</p>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Product</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#" className="ed-text-muted" style={{ textDecoration: 'none' }}>Features</a></li>
              <li><a href="#" className="ed-text-muted" style={{ textDecoration: 'none' }}>Security</a></li>
              <li><a href="#" className="ed-text-muted" style={{ textDecoration: 'none' }}>Case Studies</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Company</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#" className="ed-text-muted" style={{ textDecoration: 'none' }}>About</a></li>
              <li><a href="#" className="ed-text-muted" style={{ textDecoration: 'none' }}>Contact</a></li>
              <li><a href="#" className="ed-text-muted" style={{ textDecoration: 'none' }}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="ed-container ed-text-muted" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--ed-border)', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 GovSync. All rights reserved.</span>
        </div>
      </footer>
      
    </div>
  );
}
