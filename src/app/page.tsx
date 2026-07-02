"use client";

import { useEffect, useState, useRef } from "react";
import ScrollCurve from "@/components/ScrollCurve";

const SERVICES = [
  { id: "cut", name: "Precision Cut", duration: "75 min", price: "LKR 3,500", desc: "Architecture, movement, and face framing styling." },
  { id: "color", name: "Luxury Color", duration: "120 min", price: "LKR 9,500", desc: "Dimensional blondes, rich brunettes, and tonal color correction." },
  { id: "straight", name: "Keratin Straightening", duration: "150 min", price: "LKR 18,000", desc: "Premium Keratin treatments and relaxing therapies." },
  { id: "skin", name: "Skincare Rituals", duration: "60 min", price: "LKR 6,000", desc: "Deep facial rituals and high-performance skin care." }
];

const STYLISTS = [
  { id: "any", name: "First Available", role: "Expert Stylist Team", image: "https://www.salonliyo.com/assets/images/sub-logo-3.png" },
  { id: "dhanushka", name: "Dhanushka", role: "Creative Director", image: "https://www.salonliyo.com/assets/images/our-team.jpg" },
  { id: "ruchira", name: "Ruchira & Dilshani", role: "Chemical Specialists", image: "https://www.salonliyo.com/assets/images/our-service.png" },
  { id: "subash", name: "Subash & Sisan", role: "Master Cutters", image: "https://www.salonliyo.com/assets/images/our-product.jpg" }
];

export default function Home() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(soundEnabled);

  // Wordmark rectangle animation state
  const [animKey, setAnimKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 2500); // 1.5s last delay + 0.8s animation + 0.2s buffer
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [animKey]);

  const handleWordmarkHover = () => {
    if (!isAnimating) {
      setAnimKey(prev => prev + 1);
    }
  };
  
  // Keep sound ref up to date
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Audio Tick sound generator
  const playTick = () => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 520;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Sound toggle button click
  const handleSoundToggle = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    // Play sound immediately using the next state
    if (nextSound) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 520;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Custom cursor state
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorIsLabel, setCursorIsLabel] = useState(false);
  const [cursorLabelText, setCursorLabelText] = useState("");

  // Smooth custom cursor movement and label hover effects
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const root = document.documentElement;
    
    // Physics variables for smooth cursor spring lag animation
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let targetX = cursorX;
    let targetY = cursorY;

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.style.setProperty('--mx', (event.clientX / window.innerWidth * 100) + '%');
      root.style.setProperty('--my', (event.clientY / window.innerHeight * 100) + '%');
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animId: number;
    const renderCursor = () => {
      // Spring physics (lag coefficient .18 for smoother visual inertia)
      cursorX += (targetX - cursorX) * 0.18;
      cursorY += (targetY - cursorY) * 0.18;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      }
      animId = requestAnimationFrame(renderCursor);
    };
    renderCursor();

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button, [data-cursor], input, select') as HTMLElement | null;
      if (target) {
        setCursorIsLabel(true);
        setCursorLabelText(target.getAttribute('data-cursor') || 'View');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button, [data-cursor], input, select') as HTMLElement | null;
      if (target) {
        setCursorIsLabel(false);
        setCursorLabelText('');
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Intersection observer for data-reveal animations
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);



  // Magnetic CTA translations on mouse hover
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const magneticElements = document.querySelectorAll('.magnetic');

    const handleMouseMove = (e: MouseEvent, el: HTMLElement) => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    };

    const handleMouseLeave = (el: HTMLElement) => {
      el.style.transform = '';
    };

    const listeners: Array<[HTMLElement, (e: MouseEvent) => void, () => void]> = [];

    magneticElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const onMouseMove = (e: MouseEvent) => handleMouseMove(e, htmlEl);
      const onMouseLeave = () => handleMouseLeave(htmlEl);

      htmlEl.addEventListener('mousemove', onMouseMove);
      htmlEl.addEventListener('mouseleave', onMouseLeave);
      listeners.push([htmlEl, onMouseMove, onMouseLeave]);
    });

    return () => {
      listeners.forEach(([htmlEl, onMouseMove, onMouseLeave]) => {
        htmlEl.removeEventListener('mousemove', onMouseMove);
        htmlEl.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  // Wipe navigation transition
  const [isWipeActive, setIsWipeActive] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    playTick();

    setIsWipeActive(false);
    // Trigger reset and active class
    setTimeout(() => {
      setIsWipeActive(true);
      document.body.classList.add('is-transitioning');

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        document.body.classList.remove('is-transitioning');
      }, prefersReducedMotion ? 0 : 260);
    }, 50);

    // Reset wipe state after animation completes (.72s in CSS)
    setTimeout(() => {
      setIsWipeActive(false);
    }, 750);
  };

  // Interactive texture slider state
  const [textureValue, setTextureValue] = useState(52);

  // Gallery rails dragging state (supports multiple drag rails)
  useEffect(() => {
    const rails = document.querySelectorAll('[data-drag-rail]');
    const cleanups: Array<() => void> = [];

    rails.forEach((railEl) => {
      const rail = railEl as HTMLElement;
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let activePointerId = -1;

      const handlePointerDown = (e: PointerEvent) => {
        isDown = true;
        rail.classList.add('is-dragging');
        startX = e.clientX;
        scrollLeft = rail.scrollLeft;
        activePointerId = e.pointerId;
        rail.setPointerCapture(e.pointerId);
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!isDown) return;
        rail.scrollLeft = scrollLeft - (e.clientX - startX) * 1.25;
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (!isDown) return;
        isDown = false;
        rail.classList.remove('is-dragging');
        try {
          rail.releasePointerCapture(activePointerId);
        } catch (err) {}
      };

      rail.addEventListener('pointerdown', handlePointerDown);
      rail.addEventListener('pointermove', handlePointerMove);
      rail.addEventListener('pointerup', handlePointerUp);
      rail.addEventListener('pointercancel', handlePointerUp);

      cleanups.push(() => {
        rail.removeEventListener('pointerdown', handlePointerDown);
        rail.removeEventListener('pointermove', handlePointerMove);
        rail.removeEventListener('pointerup', handlePointerUp);
        rail.removeEventListener('pointercancel', handlePointerUp);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  // Booking widgets state
  const slots = [
    { label: "Tue 10:00", value: "tue-1000" },
    { label: "Tue 14:30", value: "tue-1430" },
    { label: "Wed 11:15", value: "wed-1115" },
    { label: "Fri 16:00", value: "fri-1600" }
  ];
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [selectedStylist, setSelectedStylist] = useState(STYLISTS[0]);
  const [bookingStatus, setBookingStatus] = useState("Request Appointment");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [stylistDropdownOpen, setStylistDropdownOpen] = useState(false);

  const handleSlotSelect = (val: string) => {
    setSelectedSlot(val);
    playTick();
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTick();
    setBookingStatus("Request Sent");
    setTimeout(() => {
      setBookingStatus("Request Appointment");
    }, 1800);
  };

  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <div className={`page-wipe ${isWipeActive ? 'active' : ''}`} aria-hidden="true"></div>
      <div 
        ref={cursorRef} 
        className={`cursor ${cursorIsLabel ? 'is-label' : ''}`} 
        aria-hidden="true"
      >
        <span>{cursorLabelText}</span>
      </div>

      <header className="site-header" data-reveal>
        <a 
          className="mini-mark" 
          href="#home" 
          aria-label="LIYO home"
          onClick={(e) => handleNavClick(e, '#home')}
        >
          LIYO
        </a>
        <nav aria-label="Primary navigation">
          <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a>
          <a href="#team" onClick={(e) => handleNavClick(e, '#team')}>Stylists</a>
          <a href="#testimonials" onClick={(e) => handleNavClick(e, '#testimonials')}>Reviews</a>
          <a href="#studio" onClick={(e) => handleNavClick(e, '#studio')}>Studio</a>
          <a href="#book" onClick={(e) => handleNavClick(e, '#book')}>Book</a>
        </nav>
        <a 
          href="#book" 
          className="book-now-header-btn" 
          data-cursor="Book"
          onClick={(e) => handleNavClick(e, '#book')}
        >
          Book Now
        </a>
      </header>

      <main id="home">
        <section className="hero section" aria-labelledby="hero-title">
          <div className="hero-media" role="img" aria-label="Dark editorial background"></div>
          <div className="hero-copy">
            <p className="eyebrow" data-reveal>Flagship salon / luxury hair experience</p>
            <div 
              className={`wordmark-blocks ${isAnimating ? 'is-animating' : 'is-resolved'}`}
              onMouseEnter={handleWordmarkHover}
              key={animKey}
            >
              <h1 id="hero-title" className="sr-only">LIYO</h1>
              <div className="letter-block" style={{ "--delay": "0s" } as React.CSSProperties}>
                <span className="letter l-letter">L</span>
              </div>
              <div className="letter-block" style={{ "--delay": "0.5s" } as React.CSSProperties}>
                <span className="letter i-letter">I</span>
              </div>
              <div className="letter-block" style={{ "--delay": "1.0s" } as React.CSSProperties}>
                <span className="letter y-letter">Y</span>
              </div>
              <div className="letter-block" style={{ "--delay": "1.5s" } as React.CSSProperties}>
                <span className="letter o-letter">O</span>
              </div>
            </div>
            <div className="hero-bottom" data-reveal>
              <div className="hero-divider" aria-hidden="true"></div>
              <p className="hero-tagline">Sculpted With Intent</p>
              <p className="hero-desc">Sri Lanka's premier luxury salon — precision cuts, couture color, keratin restoration, and transformative skin therapies. Every appointment is shaped around you.</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-number">10+</span>
                  <span className="hero-stat-label">Years of Excellence</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-number">6</span>
                  <span className="hero-stat-label">Expert Stylists</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-number">5K+</span>
                  <span className="hero-stat-label">Happy Clients</span>
                </div>
              </div>
              <a 
                href="#book" 
                className="magnetic cta hero-cta" 
                data-cursor="Book"
                onClick={(e) => handleNavClick(e, '#book')}
              >
                Book Now
              </a>
            </div>
          </div>
          <div className="hero-brands">
            <div className="brands-ticker-container">
              <div className="brands-ticker-wrapper">
                <div className="brands-ticker-set">
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-1.png" alt="L'Oréal" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-2.png" alt="TRESemmé" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-3.png" alt="Keune" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-7.png" alt="Wella" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-5.png" alt="Jeval" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-6.png" alt="Sothys" />
                </div>
                <div className="brands-ticker-set">
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-1.png" alt="L'Oréal" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-2.png" alt="TRESemmé" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-3.png" alt="Keune" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-7.png" alt="Wella" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-5.png" alt="Jeval" />
                  <img src="https://www.salonliyo.com/assets/images/sub-logo-6.png" alt="Sothys" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="statement section" data-reveal>
          <p>Where expert care meets luxurious services. As Sri Lanka's largest luxury salon, we offer hair styling, couture color, skin therapies, and quiet personal transformation.</p>
        </section>

        <section id="services" className="services section" aria-labelledby="services-title">
          <div className="section-kicker" data-reveal>
            <p>Services</p>
            <h2 id="services-title">Designed like a wardrobe. Sculpted with intent.</h2>
          </div>
          <div className="service-grid">
            <article className="service-card" data-reveal data-reveal-delay="100" data-cursor="View">
              <div className="photo-slot service-visual">
                <img src="https://www.salonliyo.com/assets/images/our-service.png" alt="Precision Cuts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3>Precision Cuts</h3>
              <p>Architecture, movement, face framing, and volume adjustments.</p>
              <b>from LKR 3,500</b>
            </article>
            <article className="service-card" data-reveal data-reveal-delay="200" data-cursor="View">
              <div className="photo-slot service-visual">
                <img src="https://www.salonliyo.com/assets/images/our-product.jpg" alt="Luxury Color" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3>Luxury Color</h3>
              <p>Dimensional blondes, rich brunettes, global color, and tonal correction.</p>
              <b>from LKR 9,500</b>
            </article>
            <article className="service-card" data-reveal data-reveal-delay="300" data-cursor="View">
              <div className="photo-slot service-visual">
                <img src="https://www.salonliyo.com/assets/images/our-team.jpg" alt="Keratin & Straightening" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3>Straightening</h3>
              <p>Premium Keratin treatments, rebonding, and relaxing therapies.</p>
              <b>from LKR 18,000</b>
            </article>
            <article className="service-card" data-reveal data-reveal-delay="400" data-cursor="View">
              <div className="photo-slot service-visual">
                <img src="https://www.salonliyo.com/assets/images/you-tube-thumbnail.jpg" alt="Skincare Rituals" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3>Skincare</h3>
              <p>Deep facial rituals, hydration, and high-performance skin care.</p>
              <b>from LKR 6,000</b>
            </article>
          </div>
        </section>

        <section className="texture section" aria-labelledby="texture-title">
          <div className="texture-copy" data-reveal>
            <p className="eyebrow">Interactive texture</p>
            <h2 id="texture-title">Drag the finish.</h2>
            <p>Preview shape, tone, and movement without turning the site into a brochure.</p>
          </div>
          <div className="texture-stage" data-reveal>
            {/* Bottom Layer: Before treatment (left side) */}
            <div className="texture-face texture-before"></div>
            {/* Top Layer: After treatment (right side), clipped from the left based on slider position */}
            <div 
              className="texture-face texture-after" 
              id="textureAfter"
              style={{ clipPath: `inset(0 0 0 ${textureValue}%)` }}
            ></div>

            {/* Labels container (non-clipped, centered in their respective halves) */}
            <div className="texture-labels" aria-hidden="true">
              <span 
                className="texture-label before-label"
                style={{ 
                  left: `${textureValue / 2}%`, 
                  opacity: textureValue > 15 ? 1 : 0 
                }}
              >
                [NATURAL SHAPE: before treatment]
              </span>
              <span 
                className="texture-label after-label"
                style={{ 
                  left: `${textureValue + (100 - textureValue) / 2}%`, 
                  opacity: (100 - textureValue) > 15 ? 1 : 0 
                }}
              >
                [GLOSS FINISH: after keratin straightening]
              </span>
            </div>

            <input 
              id="textureSlider" 
              type="range" 
              min="0" 
              max="100" 
              value={textureValue} 
              onChange={(e) => setTextureValue(Number(e.target.value))}
              aria-label="Adjust before and after hair texture preview" 
            />
          </div>
        </section>

        <section className="type-band section" aria-label="Brand mantra">
          <div className="slice-text-container" data-reveal>
            <h2 className="slice-text align-center">
              PRECISION.
              <span>PRECISION.</span>
              <span>PRECISION.</span>
              <span>EXPERT CARE</span>
            </h2>
            <h2 className="slice-text align-center outline-text">
              LUXURY.
              <span>LUXURY.</span>
              <span>LUXURY.</span>
              <span>PREMIER SALON</span>
            </h2>
            <h2 className="slice-text align-center accent-text">
              LIYO.
              <span>LIYO.</span>
              <span>LIYO.</span>
              <span>SCULPTED WITH INTENT</span>
            </h2>
          </div>
        </section>

        <section className="brands-ticker-section" aria-label="Brand partners">
          <div className="brands-ticker-container">
            <div className="brands-ticker-wrapper">
              <div className="brands-ticker-set">
                <img src="https://www.salonliyo.com/assets/images/sub-logo-1.png" alt="L'Oréal" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-2.png" alt="TRESemmé" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-3.png" alt="Keune" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-7.png" alt="Wella" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-5.png" alt="Jeval" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-6.png" alt="Sothys" />
              </div>
              <div className="brands-ticker-set">
                <img src="https://www.salonliyo.com/assets/images/sub-logo-1.png" alt="L'Oréal" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-2.png" alt="TRESemmé" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-3.png" alt="Keune" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-7.png" alt="Wella" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-5.png" alt="Jeval" />
                <img src="https://www.salonliyo.com/assets/images/sub-logo-6.png" alt="Sothys" />
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="team section" aria-labelledby="team-title">
          <div className="section-kicker" data-reveal>
            <p>Stylists</p>
            <h2 id="team-title">Led by Dhanushka Chathuranga.</h2>
          </div>
          <div className="team-grid">
            <article className="stylist" data-reveal data-reveal-delay="100" data-cursor="View">
              <div className="portrait photo-slot">
                <img src="https://www.salonliyo.com/assets/images/our-team.jpg" alt="Dhanushka Chathuranga" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <strong>Creative Director</strong>
              </div>
              <h3>Dhanushka</h3>
              <p>Founder & master stylist. Elevating Sri Lanka's high-end beauty industry.</p>
            </article>
            <article className="stylist" data-reveal data-reveal-delay="200" data-cursor="View">
              <div className="portrait photo-slot">
                <img src="https://www.salonliyo.com/assets/images/our-service.png" alt="Ruchira & Dilshani" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <strong>Chemical Specialists</strong>
              </div>
              <h3>Ruchira & Dilshani</h3>
              <p>Straightening, keratin restoration, and precision hair colors.</p>
            </article>
            <article className="stylist" data-reveal data-reveal-delay="300" data-cursor="View">
              <div className="portrait photo-slot">
                <img src="https://www.salonliyo.com/assets/images/our-product.jpg" alt="Subash & Sisan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <strong>Master Cutters</strong>
              </div>
              <h3>Subash & Sisan</h3>
              <p>Sculptural haircuts, layers, and signature texturizing.</p>
            </article>
          </div>
        </section>



        <section id="testimonials" className="testimonials section" style={{ background: 'var(--paper)', color: 'var(--ink)' }} aria-labelledby="testimonials-title">
          <div className="section-kicker" data-reveal>
            <p>Reviews</p>
            {/* ── Title + Scissor container (ghost-style) ── */}
            <div className="title-scissor-container">
              <h2 id="testimonials-title" style={{ color: 'var(--ink)' }}>Transformative Experiences.</h2>
              <div className="scissor-animation" aria-hidden="true">
                <svg className="scissor-svg" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* ── Top blade + arm + ring ── */}
                  <g className="scissor-blade-top">
                    {/* Blade — tapered wedge from pivot to tip */}
                    <path
                      d="M110,55 C95,50 70,44 18,32 C10,30 9,38 17,40 C70,50 95,54 110,58 Z"
                      fill="var(--accent)"
                    />
                    {/* Arm */}
                    <line x1="110" y1="52" x2="168" y2="26" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
                    {/* Finger ring */}
                    <circle cx="180" cy="20" r="18" stroke="var(--accent)" strokeWidth="7" fill="none" />
                    <circle cx="180" cy="20" r="8" fill="var(--accent)" />
                  </g>

                  {/* ── Bottom blade + arm + ring ── */}
                  <g className="scissor-blade-bottom">
                    {/* Blade */}
                    <path
                      d="M110,55 C95,60 70,66 18,78 C10,80 9,72 17,70 C70,60 95,56 110,52 Z"
                      fill="var(--accent)"
                    />
                    {/* Arm */}
                    <line x1="110" y1="58" x2="168" y2="84" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
                    {/* Finger ring */}
                    <circle cx="180" cy="90" r="18" stroke="var(--accent)" strokeWidth="7" fill="none" />
                    <circle cx="180" cy="90" r="8" fill="var(--accent)" />
                  </g>

                  {/* ── Pivot screw ── */}
                  <circle cx="110" cy="55" r="7" fill="var(--accent)" />
                  <circle cx="110" cy="55" r="3" fill="var(--paper)" />
                </svg>
              </div>
            </div>
          </div>
          <div 
            className="rail" 
            data-drag-rail 
            data-cursor="Drag" 
            tabIndex={0} 
            style={{ paddingBottom: '32px' }}
            aria-label="Horizontal testimonials gallery"
          >
            <article className="transformation" data-reveal data-reveal-delay="100" style={{ flex: '0 0 min(82vw, 560px)', background: 'var(--paper)', border: '1px solid rgba(10,10,10,0.12)', padding: '42px', borderRadius: '4px' }}>
              <span className="quote-mark">“</span>
              <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontFamily: 'var(--serif)', lineHeight: 1.6, color: '#222', margin: '22px 0' }}>
                "Today is my first experience with you. I had a feather haircut and straightened my hair. Ms. Ruchira and Ms. Dilshani did a great job. I am really satisfied with their service."
              </p>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--ink)', margin: 0 }}>Shalika Prasadi</h3>
              <div className="star-rating">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </article>

            <article className="transformation" data-reveal data-reveal-delay="200" style={{ flex: '0 0 min(82vw, 560px)', background: 'var(--paper)', border: '1px solid rgba(10,10,10,0.12)', padding: '42px', borderRadius: '4px' }}>
              <span className="quote-mark">“</span>
              <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontFamily: 'var(--serif)', lineHeight: 1.6, color: '#222', margin: '22px 0' }}>
                "Absolutely thrilled with my experience at salon LIYO for their keratin treatment! The keratin treatment left my hair feeling smooth, shiny, and frizz-free. Shout out to Don who did an amazing job."
              </p>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--ink)', margin: 0 }}>Akila Weerasinghe</h3>
              <div className="star-rating">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </article>

            <article className="transformation" data-reveal data-reveal-delay="300" style={{ flex: '0 0 min(82vw, 560px)', background: 'var(--paper)', border: '1px solid rgba(10,10,10,0.12)', padding: '42px', borderRadius: '4px' }}>
              <span className="quote-mark">“</span>
              <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontFamily: 'var(--serif)', lineHeight: 1.6, color: '#222', margin: '22px 0' }}>
                "I had a feather haircut (Subash) & rebonding (Ruchira). I'm really happy with the great service I got at Salon LIYO, especially from Ruchira. I highly recommend them for their commitment."
              </p>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--ink)', margin: 0 }}>Nelukshi Jayasinghe</h3>
              <div className="star-rating">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </article>
          </div>
        </section>

        <section id="studio" className="studio section" aria-labelledby="studio-title">
          <div 
            className="studio-image photo-slot studio-frame" 
            data-reveal
            style={{
              '--frame-duration': `${2 * 58 * 0.22}s`,
              '--frame-delay-character': '0.22s'
            } as React.CSSProperties}
          >
            <img src="/salon-place.jfif" alt="LIYO Studio interior" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="studio-text-border">
              {(() => {
                const baseText = "✂ LIYO STUDIO ✂ QUIET TRANSFORMATION ✂ RESERVE YOUR CHAIR ";
                const repeatedText = baseText.repeat(2);
                const chars = repeatedText.split("").reverse();
                return chars.map((char, index) => (
                  <span 
                    key={index} 
                    style={{ '--i': index + 1 } as React.CSSProperties}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ));
              })()}
            </div>
          </div>
          <div className="studio-copy" data-reveal>
            <p className="eyebrow">Studio</p>
            <h2 id="studio-title">A room designed around quiet transformation.</h2>
            <p>No visual noise. No rushed chair. Every appointment is shaped around proportion, hair health, and how your hair moves in real life.</p>
          </div>
        </section>

        <section id="book" className="booking section monolith-theme" aria-labelledby="book-title" style={{ position: 'relative', overflow: 'hidden', background: 'var(--ink)', color: 'var(--paper)', paddingTop: '100px' }}>
          
          {/* Dynamic Marquee Separator */}
          <div className="marquee-separator">
            <div className="marquee-content">
              RESERVE YOUR CHAIR • BOOK AN APPOINTMENT • EXPERIENCE LIYO • SECURE YOUR SPOT • RESERVE YOUR CHAIR • BOOK AN APPOINTMENT • EXPERIENCE LIYO • SECURE YOUR SPOT • RESERVE YOUR CHAIR • BOOK AN APPOINTMENT • EXPERIENCE LIYO • SECURE YOUR SPOT • 
            </div>
          </div>

          <ScrollCurve />
          <div className="monolith-layout">
            <div className="section-kicker" data-reveal style={{ position: 'sticky', top: '120px' }}>
              <p>Book now</p>
              <h2 id="book-title" style={{ fontSize: 'clamp(40px, 5vw, 64px)', marginBottom: '24px' }}>Reserve the chair.</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '13px', lineHeight: '1.6', maxWidth: '480px', letterSpacing: '0.01em' }}>
                Your appointment is crafted with intent. Select from our wardrobe of precision cuts, dimensional colors, and skin rituals. Pair with Dhanushka or our specialists to secure your quiet, personal transformation.
              </p>
            </div>

            <div className="booking-collage-column" data-reveal style={{ position: 'sticky', top: '120px' }}>
              <div className="booking-visual-collage">
                <div className="collage-frame collage-frame-1">
                  <img src="https://www.salonliyo.com/assets/images/our-service.png" alt="LIYO Hair Styling" />
                  <div className="collage-overlay"></div>
                </div>
                <div className="collage-frame collage-frame-2">
                  <img src="https://www.salonliyo.com/assets/images/our-product.jpg" alt="LIYO Product Treatment" />
                  <div className="collage-overlay"></div>
                </div>
                <div className="collage-frame collage-frame-3">
                  <img src="/salon-place.jfif" alt="LIYO Studio interior" />
                  <div className="collage-overlay"></div>
                  <div className="collage-badge">LIYO STUDIO</div>
                </div>
              </div>
            </div>
            
            <div className="luxury-booking-console" data-reveal>
              <form onSubmit={handleBookingSubmit} className="booking-widget">
                <div className="minimal-booking-card">
                  {bookingStatus === "Request Sent" && (
                    <div className="success-overlay">
                      <div className="success-stamp">RESERVATION REQUESTED</div>
                      <p>We have reserved your chair. Check your confirmation details shortly.</p>
                    </div>
                  )}

                  <div className="card-header-luxury">
                    <div className="status-indicator">
                      <span className="pulse-dot"></span>
                      <span className="status-text">LIYO FLAGSHIP CONSOLE</span>
                    </div>
                    <span className="serial-num">SEC: B-06</span>
                  </div>

                  {/* 1. Choose Service */}
                  <div className="custom-dropdown-container">
                    <label className="minimal-label">01. Service</label>
                    <button
                      type="button"
                      className="custom-dropdown-trigger"
                      onClick={() => {
                        setServiceDropdownOpen(!serviceDropdownOpen);
                        setStylistDropdownOpen(false);
                      }}
                    >
                      <span className="selected-value-text">{selectedService.name} — {selectedService.price}</span>
                      <span className="dropdown-arrow-icon">▾</span>
                    </button>
                    {serviceDropdownOpen && (
                      <div className="custom-dropdown-options">
                        {SERVICES.map((s) => (
                          <div
                            key={s.id}
                            className={`custom-dropdown-option ${selectedService.id === s.id ? 'is-selected' : ''}`}
                            onClick={() => {
                              setSelectedService(s);
                              setServiceDropdownOpen(false);
                              playTick();
                            }}
                          >
                            <div className="option-title-row">
                              <span className="option-name">{s.name}</span>
                              <span className="option-price">{s.price}</span>
                            </div>
                            <span className="option-duration">{s.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Choose Stylist */}
                  <div className="custom-dropdown-container">
                    <label className="minimal-label">02. Stylist</label>
                    <button
                      type="button"
                      className="custom-dropdown-trigger"
                      onClick={() => {
                        setStylistDropdownOpen(!stylistDropdownOpen);
                        setServiceDropdownOpen(false);
                      }}
                    >
                      <span className="selected-value-text">{selectedStylist.name} — {selectedStylist.role}</span>
                      <span className="dropdown-arrow-icon">▾</span>
                    </button>
                    {stylistDropdownOpen && (
                      <div className="custom-dropdown-options">
                        {STYLISTS.map((st) => (
                          <div
                            key={st.id}
                            className={`custom-dropdown-option ${selectedStylist.id === st.id ? 'is-selected' : ''}`}
                            onClick={() => {
                              setSelectedStylist(st);
                              setStylistDropdownOpen(false);
                              playTick();
                            }}
                          >
                            <span className="option-name">{st.name}</span>
                            <span className="option-role">{st.role}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Choose Time */}
                  <div className="minimal-time-slots">
                    <label className="minimal-label">03. Time Slot</label>
                    <div className="minimal-slots-grid">
                      {slots.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          className={`minimal-time-slot-btn ${selectedSlot === s.value ? 'is-active' : ''}`}
                          onClick={() => handleSlotSelect(s.value)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className={`minimal-submit-btn ${selectedSlot ? 'is-ready' : ''}`}
                    type="submit"
                    disabled={!selectedSlot || bookingStatus === "Request Sent"}
                  >
                    {bookingStatus}
                  </button>

                  <div className="card-footer-info">
                    <span>● CONFIRMATION INSTANTLY VIA SMS</span>
                    <span>LKR / NETT RATE</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="contact section" aria-labelledby="contact-title">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title">LIYO Studio</h2>
            <p>No.6, Pagoda Road,</p>
            <p>Nugegoda, Sri Lanka</p>
            <p>Tue-Sun / 09:00-19:00</p>
          </div>
          <div className="map" aria-label="Salon Liyo location map">
            <iframe
              src="https://maps.google.com/maps?q=Salon%20Liyo%2C%20No.%206%2C%20Pagoda%20Road%2C%20Nugegoda%2C%20Sri%20Lanka&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Salon Liyo Location Map"
            />
          </div>
        </section>
      </main>

      <footer className="site-footer" data-reveal>
        <div className="footer-grid">
          <div className="footer-brand-col">
            <a 
              href="#home" 
              className="footer-logo" 
              onClick={(e) => handleNavClick(e, '#home')}
            >
              LIYO
            </a>
            <p className="footer-tagline">SCULPTED WITH INTENT</p>
            <p className="footer-brand-desc">
              Sri Lanka's premier luxury salon. Precision cuts, couture color, and quiet personal transformation.
            </p>
          </div>
          
          <div className="footer-nav-col">
            <h4>WARDROBE</h4>
            <nav className="footer-nav" aria-label="Footer navigation">
              <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a>
              <a href="#team" onClick={(e) => handleNavClick(e, '#team')}>Stylists</a>
              <a href="#testimonials" onClick={(e) => handleNavClick(e, '#testimonials')}>Reviews</a>
              <a href="#studio" onClick={(e) => handleNavClick(e, '#studio')}>Studio</a>
              <a href="#book" onClick={(e) => handleNavClick(e, '#book')}>Book Now</a>
            </nav>
          </div>
          
          <div className="footer-hours-col">
            <h4>JOURNAL</h4>
            <p><strong>Tue – Sun</strong>: 9:00 AM – 7:00 PM</p>
            <p><strong>Monday</strong>: Closed</p>
            <p className="footer-tel">
              <a href="tel:+94773885122">+94 77 388 5122</a>
            </p>
            <p className="footer-email">
              <a href="mailto:salonliyo@gmail.com">salonliyo@gmail.com</a>
            </p>
          </div>
          
          <div className="footer-social-col">
            <h4>SOCIALS</h4>
            <div className="footer-social-links">
              <a 
                href="https://www.facebook.com/salonliyo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                data-cursor="Follow"
                aria-label="Facebook"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span>Facebook</span>
              </a>
              <a 
                href="https://www.instagram.com/salon_liyo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                data-cursor="Follow"
                aria-label="Instagram"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>Instagram</span>
              </a>
              <a 
                href="https://www.youtube.com/user/salonliyo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                data-cursor="Follow"
                aria-label="YouTube"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
                <span>YouTube</span>
              </a>
              <a 
                href="https://wa.me/94773885122" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                data-cursor="WhatsApp"
                aria-label="WhatsApp"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">&copy; {new Date().getFullYear()} LIYO STUDIO. All rights reserved.</p>
          <a 
            href="#home" 
            className="back-to-top" 
            onClick={(e) => handleNavClick(e, '#home')}
          >
            Back to top &uarr;
          </a>
        </div>
      </footer>
    </>
  );
}
