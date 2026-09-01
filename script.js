(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineCursor = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 900;

  /* ---------------------------------------------------------
     Header + scroll progress bar (single rAF-throttled loop)
  --------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var progressBar = document.getElementById('scrollProgress');
  var heroGrid = document.querySelector('.hero-grid');
  var heroStructure = document.querySelector('.hero-structure');
  var lastScrolledState = false;

  function onScroll() {
    var y = window.scrollY;
    var scrolled = y > 64;
    if (scrolled !== lastScrolledState) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolledState = scrolled;
    }

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (y / docH) * 100 : 0;
    progressBar.style.width = pct + '%';

    if (!reduceMotion) {
      var heroH = window.innerHeight;
      if (y < heroH * 1.2) {
        if (heroGrid) heroGrid.style.transform = 'translateY(' + (y * 0.12) + 'px)';
        if (heroStructure) heroStructure.style.transform = 'translateY(' + (y * -0.06) + 'px)';
      }
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Hero video — subtle scroll parallax. Lightweight, transform-only, reduced-motion aware.
(function () {
  var hero = document.getElementById('top');
  var media = hero ? hero.querySelector('.hero-media') : null;
  if (!hero || !media) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var ticking = false;

  function update() {
    var rect = hero.getBoundingClientRect();
    var progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    var shift = progress * 40; // px, subtle
    media.style.setProperty('--hero-parallax', shift + 'px');
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Pause video off-screen to save resources
  var video = hero.querySelector('.hero-video');
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) video.play().catch(function () {});
        else video.pause();
      });
    }, { threshold: 0.05 }).observe(hero);
  }
})();

  /* ---------------------------------------------------------
     Reveal-on-scroll (generic elements)
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal-up');
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Federal partnership network diagram: draw on view
  --------------------------------------------------------- */
  var netDraw = document.querySelector('.net-draw');
  if (netDraw) {
    if (reduceMotion) {
      netDraw.classList.add('is-drawn');
    } else if ('IntersectionObserver' in window) {
      var netIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            netDraw.classList.add('is-drawn');
            netIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      netIo.observe(netDraw);
    } else {
      netDraw.classList.add('is-drawn');
    }
  }

  /* ---------------------------------------------------------
     Capabilities: hover / focus swaps preview panel + tilt
  --------------------------------------------------------- */
  var capRows = document.querySelectorAll('.cap-row');
  var capPanels = document.querySelectorAll('.cap-preview-panel');
  var capPreview = document.querySelector('.cap-preview');
  var capPreviewInner = document.getElementById('capPreviewInner');

  function activateCap(key) {
    capRows.forEach(function (row) {
      row.classList.toggle('is-active', row.dataset.cap === key);
    });
    capPanels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === key);
    });
  }
  capRows.forEach(function (row) {
    row.addEventListener('mouseenter', function () { activateCap(row.dataset.cap); });
    row.addEventListener('focus', function () { activateCap(row.dataset.cap); });
    row.addEventListener('click', function () { activateCap(row.dataset.cap); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateCap(row.dataset.cap);
      }
    });
  });

  if (capPreview && capPreviewInner && fineCursor && !reduceMotion) {
    capPreview.addEventListener('mousemove', function (e) {
      var rect = capPreview.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      capPreviewInner.style.setProperty('--tiltX', (px * 6) + 'deg');
      capPreviewInner.style.setProperty('--tiltY', (py * -6) + 'deg');
    });
    capPreview.addEventListener('mouseleave', function () {
      capPreviewInner.style.setProperty('--tiltX', '0deg');
      capPreviewInner.style.setProperty('--tiltY', '0deg');
    });
  }

  /* ---------------------------------------------------------
     Projects rail: prev/next, dot indicators, stagger reveal, tilt
  --------------------------------------------------------- */
  var rail = document.getElementById('rail');
  var railTrack = document.getElementById('railTrack');
  var railPrev = document.getElementById('railPrev');
  var railNext = document.getElementById('railNext');
  var railDots = document.getElementById('railDots');

  if (rail && railTrack) {
    var panels = Array.prototype.slice.call(railTrack.querySelectorAll('.rail-panel'));

    panels.forEach(function (panel, i) {
      panel.style.setProperty('--i', i);
    });

    if (reduceMotion) {
      panels.forEach(function (p) { p.classList.add('is-visible'); });
    } else if ('IntersectionObserver' in window) {
      var railIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            railIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      panels.forEach(function (p) { railIo.observe(p); });
    } else {
      panels.forEach(function (p) { p.classList.add('is-visible'); });
    }

    if (fineCursor && !reduceMotion) {
      panels.forEach(function (panel) {
        var img = panel.querySelector('.rail-img');
        panel.addEventListener('mousemove', function (e) {
          var rect = panel.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          img.style.setProperty('--tiltX', (px * 8) + 'deg');
          img.style.setProperty('--tiltY', (py * -8) + 'deg');
        });
        panel.addEventListener('mouseleave', function () {
          img.style.setProperty('--tiltX', '0deg');
          img.style.setProperty('--tiltY', '0deg');
        });
      });
    }

    panels.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function () {
        panels[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
      });
      railDots.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(railDots.children);

    function scrollByPanel(dir) {
      var w = panels[0].getBoundingClientRect().width + 20;
      rail.scrollBy({ left: dir * w, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    railPrev.addEventListener('click', function () { scrollByPanel(-1); });
    railNext.addEventListener('click', function () { scrollByPanel(1); });

    function syncDots() {
      var railRect = rail.getBoundingClientRect();
      var closest = 0;
      var closestDist = Infinity;
      panels.forEach(function (p, i) {
        var d = Math.abs(p.getBoundingClientRect().left - railRect.left);
        if (d < closestDist) { closestDist = d; closest = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === closest); });
    }
    var railTicking = false;
    rail.addEventListener('scroll', function () {
      if (!railTicking) {
        window.requestAnimationFrame(function () { syncDots(); railTicking = false; });
        railTicking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Stats: count-up animation on view
  --------------------------------------------------------- */
  var statNums = document.querySelectorAll('.stat-num[data-count]');
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (statNums.length && 'IntersectionObserver' in window) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { statIo.observe(el); });
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------------------------------------------------------
     Magnetic buttons (desktop, fine pointer only)
  --------------------------------------------------------- */
  if (fineCursor && !reduceMotion) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = (e.clientX - rect.left - rect.width / 2) * 0.28;
        var my = (e.clientY - rect.top - rect.height / 2) * 0.32;
        btn.style.setProperty('--mx', mx + 'px');
        btn.style.setProperty('--my', my + 'px');
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------------------------------------------------------
     Subtle cursor dot — desktop only, grows over interactive elements
  --------------------------------------------------------- */
  var cursorDot = document.getElementById('cursorDot');
  if (cursorDot && fineCursor && !reduceMotion) {
    var cx = 0, cy = 0, dx = 0, dy = 0;
    var shown = false;
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!shown) { cursorDot.classList.add('is-visible'); shown = true; }
    });
    function loop() {
      dx += (cx - dx) * 0.22;
      dy += (cy - dy) * 0.22;
      cursorDot.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    document.querySelectorAll('a, button, .cap-row').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorDot.classList.add('is-active'); });
      el.addEventListener('mouseleave', function () { cursorDot.classList.remove('is-active'); });
    });
    document.addEventListener('mouseleave', function () { cursorDot.classList.remove('is-visible'); shown = false; });
  } else if (cursorDot) {
    cursorDot.style.display = 'none';
  }

})();

// Reveal animation — triggers once when the footer enters the viewport.
(function () {
  var footer = document.getElementById('site-footer');
  if (!footer || !('IntersectionObserver' in window)) {
    if (footer) footer.classList.add('is-visible');
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        footer.classList.add('is-visible');
        observer.unobserve(footer);
      }
    });
  }, { threshold: 0.25 });
  observer.observe(footer);
})();

(function () {
  const intro = document.querySelector('.intro');
  if (!intro) return;

  // line-by-line / element reveal, once
  const revealTargets = intro.querySelectorAll('.reveal-line, .reveal-rule');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intro.classList.add('in-view');
          io.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );
  io.observe(intro);

  // scroll-linked hairline — skipped under reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    let ticking = false;
    const updateProgress = () => {
      const rect = intro.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const progressed = vh - rect.top;
      const progress = Math.min(1, Math.max(0, progressed / total));
      intro.style.setProperty('--scroll-progress', progress.toFixed(3));
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateProgress);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateProgress();
  }
})();