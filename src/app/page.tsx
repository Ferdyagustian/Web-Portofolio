"use client";

import { useState, useRef } from 'react';
import PixelForest from '../components/three/PixelForest';
import DialogueBox from '../components/ui/DialogueBox';
import PixelCard from '../components/ui/PixelCard';
import ObservableSkill from '../components/ui/ObservableSkill';
import PixelButton from '../components/ui/PixelButton';
import ProjectGallery from '../components/ui/ProjectGallery';
import InteractiveAvatar from '../components/ui/InteractiveAvatar';
import { useTheme } from '../providers/TimeThemeProvider';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. RPG Bouncy Pop-in elements
    gsap.utils.toArray('.gsap-pop').forEach((el: any) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
    });

    // 2. Staggered Pop-in for Skills
    if (document.querySelector('.gsap-skill-card')) {
      gsap.from('.gsap-skill-card', {
        scrollTrigger: {
          trigger: '#skills',
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.5)"
      });
    }

    // 3. Parallax Effect Option
    gsap.utils.toArray('.gsap-parallax').forEach((el: any) => {
      const speed = parseFloat(el.getAttribute('data-speed') || "0.2");
      gsap.to(el, {
        yPercent: 50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main style={{ position: 'relative' }} ref={container}>
      {/* 3D Background — theme-aware */}
      <PixelForest theme={theme} />

      {/* Scrollable Content Layers */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Section 1: Hero */}
        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="hero-box" style={{ margin: '0 1rem' }}>
            <div className="wave-text-wrapper">
              <h1 className="hero-title" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                {"FERDY AGUSTIAN".split(' ').map((word, wIdx) => (
                  <span key={wIdx} style={{ display: 'flex' }}>
                    {word.split('').map((char, index) => (
                      <span key={index} className="pixel-font wave-letter">
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
            </div>
            <p className="vt323-font hero-subtitle">
              AI Enthusiast &nbsp;|&nbsp; CS UnderGraduate Student
            </p>
          </div>

          <div style={{
            marginTop: '3rem',
            animation: 'bounce 2s infinite',
            fontSize: '2rem',
            color: 'var(--color-cream)',
            textShadow: '2px 2px 0px var(--color-black)'
          }}>
            ▼
          </div>
        </section>

        {/* Section 2: About (The Campfire) */}
        <section id="about" style={{ minHeight: '100vh', padding: '100px 5%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="gsap-pop" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <DialogueBox title="Ferdy Agustian Prasetyo">
              <div className="about-content">
                {/* Pixel Art Avatar / Character Sprite (Interactive 3D) */}
                <InteractiveAvatar />

                <div style={{ flex: '1', minWidth: '250px' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Halo! (こんにちは!)</strong> Saya Ferdy Agustian Prasetyo, seorang mahasiswa semester akhir dari <strong>Universitas Gunadarma</strong>.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    Saya memiliki ketertarikan yang mendalam terhadap <strong>Artificial Intelligence</strong> dan pengembangan perangkat lunak (Software Development). Saya senang menggabungkan logika dan kreativitas dalam membangun aplikasi yang menyenangkan dan bermanfaat. <br /><br />If there's an interesting project, let's collaborate! I will be more than glad to connect with you!
                  </p>
                  <div className="about-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <a href="https://github.com/Ferdyagustian" target="_blank" rel="noreferrer">
                      <PixelButton variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[GH]</span> GitHub
                      </PixelButton>
                    </a>
                    <a href="https://www.linkedin.com/in/ferdy-agustian-5a3521247/" target="_blank" rel="noreferrer">
                      <PixelButton style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="pixel-font" style={{ fontSize: '0.6rem' }}>[IN]</span> LinkedIn
                      </PixelButton>
                    </a>
                  </div>
                </div>
              </div>
            </DialogueBox>
          </div>
        </section>

        {/* Section 3: Skills (The Workshop) */}
        <section id="skills" style={{ minHeight: '100vh', padding: '100px 5%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="gsap-parallax" data-speed="0.8" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="pixel-font" style={{ fontSize: '2rem', color: 'var(--color-cream)', textShadow: '4px 4px 0px var(--color-black)' }}>
              WORKSHOP // SKILLS
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div className="gsap-skill-card">
              <PixelCard title="Frontend">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ObservableSkill name="HTML/CSS/JS" rank="A" percentage={85} iconColor="#e34c26" />
                  <ObservableSkill name="React / Next.js" rank="S" percentage={95} iconColor="#61dafb" />
                  <ObservableSkill name="WebGL / Three.js" rank="B" percentage={70} iconColor="#88ce02" />
                </div>
              </PixelCard>
            </div>

            <div className="gsap-skill-card">
              <PixelCard title="Backend">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ObservableSkill name="Node.js" rank="S" percentage={90} iconColor="#339933" />
                  <ObservableSkill name="Python" rank="A" percentage={80} iconColor="#3776ab" />
                  <ObservableSkill name="Java" rank="B" percentage={75} iconColor="#5382a1" />
                </div>
              </PixelCard>
            </div>

            <div className="gsap-skill-card">
              <PixelCard title="Database">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ObservableSkill name="MySQL" rank="A" percentage={85} iconColor="#4479a1" />
                  <ObservableSkill name="PostgreSQL" rank="A" percentage={80} iconColor="#336791" />
                  <ObservableSkill name="MongoDB" rank="B" percentage={75} iconColor="#47a248" />
                </div>
              </PixelCard>
            </div>

            <div className="gsap-skill-card">
              <PixelCard title="Tools & Others">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ObservableSkill name="Git / GitHub" rank="S" percentage={90} iconColor="#f05032" />
                  <ObservableSkill name="Docker" rank="B" percentage={70} iconColor="#2496ed" />
                  <ObservableSkill name="Figma" rank="A" percentage={85} iconColor="#f24e1e" />
                  <ObservableSkill name="AI / ML" rank="B" percentage={75} iconColor="#ffeb3b" />
                </div>
              </PixelCard>
            </div>
          </div>
        </section>

        {/* Section 4: Projects (Interactive Gallery - Sutera.ch Inspired) */}
        <ProjectGallery />

        {/* Section 5: Contact (Messenger Owl) */}
        <section id="contact" style={{ padding: '100px 5% 50px 5%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="gsap-pop" style={{ width: '100%', maxWidth: '600px' }}>
            <DialogueBox title="Send a Message" className="contact-box" style={{ width: '100%' }}>
              <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                Im more to be happy when i can make a good things for other people , so if you have a good things for me , just send a message!
              </p>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
                <div>
                  <label className="pixel-font" style={{ fontSize: '0.7rem', color: 'var(--color-forest-dark)' }}>NAMA</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--color-black)', backgroundColor: '#fff', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.2rem' }}
                  />
                </div>
                <div>
                  <label className="pixel-font" style={{ fontSize: '0.7rem', color: 'var(--color-forest-dark)' }}>EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--color-black)', backgroundColor: '#fff', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.2rem' }}
                  />
                </div>
                <div>
                  <label className="pixel-font" style={{ fontSize: '0.7rem', color: 'var(--color-forest-dark)' }}>PESAN</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--color-black)', backgroundColor: '#fff', outline: 'none', fontFamily: "'VT323', monospace", fontSize: '1.2rem', resize: 'vertical' }}
                  />
                </div>
                <PixelButton type="submit" disabled={status === 'loading'} style={{ width: '100%', marginTop: '0.5rem', opacity: status === 'loading' ? 0.5 : 1 }}>
                  {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
                </PixelButton>
                {status === 'success' && <p style={{ color: 'var(--color-moss-green)', fontSize: '1.2rem', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'VT323', monospace" }}>Berhasil dikirim , terimakasih telah mengirim pesan! :D</p>}
                {status === 'error' && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'VT323', monospace" }}>Gagal mengirim pesan.</p>}
              </form>
            </DialogueBox>
          </div>
          <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-cream)' }} className="pixelify-font">
            <span className="pixel-font" style={{ fontSize: '0.8rem' }}>[EMAIL]</span>
            <span style={{ wordBreak: 'break-all', textAlign: 'center' }}>agustianprasetyoferdy@gmail.com</span>
          </div>
          <footer style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-cream)', fontSize: '0.8rem' }} className="pixelify-font">
            © {new Date().getFullYear()} Ferdy Agustian Prasetyo. Designed with ♥ and Pixel Art.
          </footer>
        </section>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      `}} />
    </main>
  );
}
