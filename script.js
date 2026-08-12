/* ══════════════════════════════════════════════
   PARAXMEDIA — Interactive Scripts
   Pure Vanilla JS · No Dependencies
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── Scroll Reveal (IntersectionObserver) ─── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ─── Navbar Scroll Effect ─── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  }, { passive: true });

  /* ─── Mobile Nav Toggle ─── */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ─── Service Track Switcher ─── */
  const trackBtns = document.querySelectorAll('.track-btn');
  const panelPersonal = document.getElementById('panelPersonal');
  const panelCorporate = document.getElementById('panelCorporate');

  trackBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      trackBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const track = btn.dataset.track;
      if (track === 'personal') {
        panelPersonal.classList.add('active');
        panelCorporate.classList.remove('active');
      } else {
        panelCorporate.classList.add('active');
        panelPersonal.classList.remove('active');
      }

      // Re-trigger reveals in new panel
      const activePanel = track === 'personal' ? panelPersonal : panelCorporate;
      activePanel.querySelectorAll('.reveal').forEach((el) => {
        el.classList.remove('visible');
        void el.offsetWidth; // force reflow
        revealObserver.observe(el);
      });
    });
  });

  /* ─── Brand Audit Wizard ─── */
  let currentStep = 1;
  const totalSteps = 4;
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const progressFill = document.getElementById('auditProgress');
  const stepText = document.getElementById('auditStepText');
  const prevBtn = document.getElementById('wizardPrev');
  const nextBtn = document.getElementById('wizardNext');

  function updateWizard() {
    wizardSteps.forEach((s) => s.classList.remove('active'));
    const target = currentStep <= totalSteps ? `[data-step="${currentStep}"]` : '[data-step="result"]';
    document.querySelector(target).classList.add('active');

    if (currentStep <= totalSteps) {
      progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
      stepText.textContent = `Step ${currentStep} of ${totalSteps}`;
      nextBtn.textContent = currentStep === totalSteps ? 'See My Score' : 'Next';
      prevBtn.disabled = currentStep === 1;
      nextBtn.style.display = '';
      prevBtn.style.display = '';
    } else {
      // Result step
      progressFill.style.width = '100%';
      stepText.textContent = 'Done';
      nextBtn.style.display = 'none';
      prevBtn.textContent = 'Retake';
      prevBtn.disabled = false;
      calculateScore();
    }
  }

  nextBtn.addEventListener('click', () => {
    // Validate current step has selection
    if (currentStep <= totalSteps) {
      const selected = document.querySelector(`[data-step="${currentStep}"] input:checked`);
      if (!selected) {
        const opts = document.querySelector(`[data-step="${currentStep}"] .wizard-options`);
        opts.style.animation = 'none';
        void opts.offsetWidth;
        opts.style.animation = 'shake 0.4s ease';
        return;
      }
    }
    currentStep++;
    updateWizard();
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > totalSteps) {
      currentStep = 1;
      document.querySelectorAll('.wizard-option input').forEach((i) => (i.checked = false));
    } else {
      currentStep--;
    }
    updateWizard();
  });

  // Add shake keyframe dynamically
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  function animateCounter(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function calculateScore() {
    const answers = [];
    for (let i = 1; i <= totalSteps; i++) {
      const selected = document.querySelector(`[name="q${i}"]:checked`);
      answers.push(selected ? parseInt(selected.value, 10) : 0);
    }
    const total = Math.round(answers.reduce((a, b) => a + b, 0) / totalSteps);

    // Add SVG gradient def if not exists
    const scoreCircle = document.getElementById('scoreCircle');
    let svg = scoreCircle.closest('svg');
    if (!svg.querySelector('defs')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00e5a0"/>
          <stop offset="100%" style="stop-color:#06b6d4"/>
        </linearGradient>
      `;
      svg.prepend(defs);
    }

    // Animate score ring
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (total / 100) * circumference;
    setTimeout(() => {
      scoreCircle.style.strokeDashoffset = offset;
    }, 100);

    // Animate score number
    const scoreValue = document.getElementById('scoreValue');
    animateCounter(scoreValue, 0, total, 1500);

    // Score label — honest, no hype
    const scoreLabel = document.getElementById('scoreLabel');
    const scoreDesc = document.getElementById('scoreDesc');
    if (total >= 80) {
      scoreLabel.textContent = 'Strong Presence';
      scoreDesc.textContent = 'You\'re doing a lot right. There may still be areas to optimize — especially around converting that audience into business results.';
    } else if (total >= 55) {
      scoreLabel.textContent = 'Solid Foundation';
      scoreDesc.textContent = 'You\'ve got the basics in place. The next step is usually tightening your content strategy and posting more consistently.';
    } else if (total >= 30) {
      scoreLabel.textContent = 'Room to Grow';
      scoreDesc.textContent = 'There\'s a gap between where you are and where you could be. A structured approach to content and engagement would make a noticeable difference.';
    } else {
      scoreLabel.textContent = 'Just Getting Started';
      scoreDesc.textContent = 'You\'re early in the process, which is completely fine. Building a brand presence takes time — but starting with the right foundation makes it much easier.';
    }

    // Breakdown
    const breakdown = document.getElementById('scoreBreakdown');
    const labels = ['Posting Consistency', 'Visual Identity', 'Audience Engagement', 'Lead Generation'];
    breakdown.innerHTML = answers
      .map(
        (val, i) => `
        <div class="breakdown-item">
          <div class="label">${labels[i]}</div>
          <div class="value">${val}/100</div>
          <div class="bar"><div class="bar-fill" style="width: 0%"></div></div>
        </div>
      `
      )
      .join('');

    // Animate bars
    setTimeout(() => {
      breakdown.querySelectorAll('.bar-fill').forEach((bar, i) => {
        bar.style.width = `${answers[i]}%`;
      });
    }, 200);
  }

  /* ─── Service Builder ─── */
  const builderItems = document.querySelectorAll('.builder-item input');
  const builderTotalContent = document.getElementById('builderTotalContent');
  const builderTotalWrap = document.getElementById('builderTotalWrap');
  const builderSelected = document.getElementById('builderSelected');

  function updateBuilder() {
    let totalMonthly = 0;
    let totalOneTime = 0;
    let selected = [];

    builderItems.forEach((item) => {
      if (item.checked) {
        const val = parseInt(item.value, 10);
        const type = item.dataset.type || 'monthly';
        if (type === 'one-time') {
          totalOneTime += val;
          selected.push(`${item.dataset.name} (One-Time)`);
        } else {
          totalMonthly += val;
          selected.push(`${item.dataset.name} (/mo)`);
        }
      }
    });

    let contentHtml = '';
    if (totalOneTime > 0) {
      contentHtml += `<span class="builder-total">$${totalOneTime.toLocaleString()}</span><span class="builder-total-sub" style="display: block; margin-top: 0.1rem;">one-time setup</span>`;
    }
    if (totalMonthly > 0) {
      if (totalOneTime > 0) {
        contentHtml += `<div style="margin: 0.75rem 0; border-top: 1px dashed var(--glass-border);"></div>`;
      }
      contentHtml += `<span class="builder-total">$${totalMonthly.toLocaleString()}</span><span class="builder-total-sub" style="display: block; margin-top: 0.1rem;">per month</span>`;
    }
    if (totalOneTime === 0 && totalMonthly === 0) {
      contentHtml += `<span class="builder-total">$0</span><span class="builder-total-sub" style="display: block; margin-top: 0.1rem;">per month</span>`;
    }

    builderTotalContent.innerHTML = contentHtml;

    // Bump animation
    builderTotalWrap.classList.remove('bump');
    void builderTotalWrap.offsetWidth;
    builderTotalWrap.classList.add('bump');
    setTimeout(() => builderTotalWrap.classList.remove('bump'), 300);

    // Selected list
    builderSelected.innerHTML = selected.length
      ? selected.map((s) => `<div class="builder-selected-item">✓ ${s}</div>`).join('')
      : '<div class="builder-selected-item" style="color: var(--text-dim)">No services selected</div>';
  }

  builderItems.forEach((item) => item.addEventListener('change', updateBuilder));
  updateBuilder(); // Initial

  /* ─── Contact Form ─── */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactForm.innerHTML = `
      <div class="form-success">
        <h3>Message Sent</h3>
        <p style="color: var(--text-secondary)">Thanks for reaching out. We'll get back to you within 1-2 business days.</p>
      </div>
    `;
  });

  /* ─── Smooth Scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
});
