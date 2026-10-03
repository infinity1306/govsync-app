import React from 'react';
import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <Network size={24} style={{ marginRight: '8px' }} /> GovSync
            </div>
            <p>An Integrated Government Project Coordination & Fund Management Platform — eliminating duplicate infrastructure work and saving public money.</p>
            <p style={{ color: 'var(--accent)', fontWeight: 600, fontStyle: 'italic' }}>"Coordinate Once. Build Right."</p>
          </div>
          <div>
            <h5>Platform</h5>
            <ul>
              <li><Link to="/">The Problem</Link></li>
              <li><Link to="/">Our Solution</Link></li>
              <li><Link to="/">Features</Link></li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/">Impact</Link></li>
              <li><Link to="/">GIS Map</Link></li>
            </ul>
          </div>
          <div>
            <h5>Connect</h5>
            <ul>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Security & Privacy</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-divider">
          <p>Built for Smart Governance · Hackathon 2026 · Made with ❤️ for India</p>
        </div>
      </div>
    </footer>
  );
}
