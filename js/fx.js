/* LumiLínguas — Efeitos dinâmicos compartilhados.
 * Dá vida à sessão: transições entre atividades, mascote que reage,
 * partículas no toque, estrelas que voam para a coleção e vibração suave.
 *
 * Regra de ouro: nada aqui pode assustar, apressar ou punir. Movimento serve
 * para explicar ("olhe aqui", "conseguiu!"), nunca para criar urgência.
 * Tudo respeita prefers-reduced-motion (a classe .reduce-motion no <body>
 * desliga os efeitos opcionais).
 */
(function (g) {
  'use strict';

  var reduced = false;
  try {
    reduced = g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- transição de entrada do palco ---------- */

  /* Cada atividade entra com um leve deslize + escala, e os filhos diretos
   * aparecem em cascata (stagger) para o olho seguir a ordem da tela. */
  function enter(container, direction) {
    if (!container) return;
    if (reduced) { container.classList.add('stage-in-done'); return; }
    container.classList.remove('stage-in', 'stage-in-done', 'stage-from-left');
    if (direction === 'left') container.classList.add('stage-from-left');
    // reflow para reiniciar a animação
    void container.offsetWidth;
    container.classList.add('stage-in');
    var kids = container.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].style.setProperty('--stagger', (i * 70) + 'ms');
      kids[i].classList.add('stagger-in');
    }
  }

  /* Saída rápida antes de trocar de atividade (mantém o ritmo sem pressa). */
  function leave(container) {
    return new Promise(function (resolve) {
      if (!container || reduced) return resolve();
      container.classList.add('stage-out');
      setTimeout(function () {
        container.classList.remove('stage-out');
        resolve();
      }, 220);
    });
  }

  /* ---------- mascote reativo ---------- */

  var mascotEl = null;

  /* O personagem-guia acompanha a criança no canto da tela e reage ao que
   * acontece: pensa, comemora, encoraja. É a "presença" que substitui o
   * texto que a criança ainda não lê. */
  function mascot(parent, emoji, color) {
    if (!parent) return null;
    if (!mascotEl || !mascotEl.isConnected) {
      mascotEl = el('div', 'mascot', '<span class="mascot-face"></span>');
      parent.appendChild(mascotEl);
    }
    if (emoji) mascotEl.querySelector('.mascot-face').textContent = emoji;
    if (color) mascotEl.style.setProperty('--mascot-color', color);
    return mascotEl;
  }

  /* mood: 'idle' | 'think' | 'cheer' | 'encourage' | 'listen' */
  function mascotMood(mood) {
    if (!mascotEl) return;
    mascotEl.classList.remove('m-idle', 'm-think', 'm-cheer', 'm-encourage', 'm-listen');
    mascotEl.classList.add('m-' + (mood || 'idle'));
  }

  function mascotHide() {
    if (mascotEl && mascotEl.isConnected) mascotEl.remove();
    mascotEl = null;
  }

  /* ---------- partículas e estrelas ---------- */

  /* Estouro de partículas no ponto tocado: confirma o toque na hora,
   * antes mesmo do áudio começar. */
  function burst(x, y, colors) {
    if (reduced) return;
    colors = colors || ['#F4B400', '#2BB673', '#4A6CF7', '#E2574C', '#8E6CF0'];
    var layer = el('div', 'fx-layer');
    document.body.appendChild(layer);
    for (var i = 0; i < 10; i++) {
      var p = el('div', 'fx-dot');
      var ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      var dist = 40 + Math.random() * 46;
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      layer.appendChild(p);
    }
    setTimeout(function () { layer.remove(); }, 800);
  }

  function burstFrom(element, colors) {
    if (!element) return;
    var r = element.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, colors);
  }

  /* A estrela ganha voa até o canto da coleção: a criança vê o progresso
   * virar objeto, sem precisar de número nenhum. */
  function starFly(fromEl, emoji) {
    return new Promise(function (resolve) {
      if (reduced || !fromEl) return resolve();
      var r = fromEl.getBoundingClientRect();
      var star = el('div', 'fx-star', emoji || '⭐');
      star.style.left = (r.left + r.width / 2) + 'px';
      star.style.top = (r.top + r.height / 2) + 'px';
      document.body.appendChild(star);
      // destino: topo direito (onde fica a contagem da sessão)
      var tx = window.innerWidth - 56 - (r.left + r.width / 2);
      var ty = 40 - (r.top + r.height / 2);
      star.style.setProperty('--tx', tx + 'px');
      star.style.setProperty('--ty', ty + 'px');
      void star.offsetWidth;
      star.classList.add('fly');
      setTimeout(function () { star.remove(); resolve(); }, 760);
    });
  }

  /* ---------- toque e vibração ---------- */

  /* Vibração curtíssima: reforço tátil do acerto para quem ouve pouco.
   * Silenciosa em aparelhos sem suporte. */
  function buzz(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern || 18);
    } catch (e) {}
  }

  /* Balanço suave = "olhe de novo", nunca um erro. */
  function nudge(element) {
    if (!element || reduced) return;
    element.classList.remove('nudge');
    void element.offsetWidth;
    element.classList.add('nudge');
  }

  /* Pulso de atenção: destaca o que a criança deve tocar agora. */
  function highlight(element) {
    if (!element || reduced) return;
    element.classList.add('attention');
    setTimeout(function () { element.classList.remove('attention'); }, 2400);
  }

  /* ---------- confete da celebração ---------- */

  function confetti(container, count) {
    if (!container || reduced) return;
    var colors = ['#F4B400', '#4A6CF7', '#E2574C', '#2BB673', '#8E6CF0', '#E2648F'];
    for (var i = 0; i < (count || 18); i++) {
      var c = el('div', 'confetti');
      c.style.left = (4 + Math.random() * 92) + '%';
      c.style.animationDelay = (Math.random() * 1.1) + 's';
      c.style.background = colors[i % colors.length];
      if (i % 3 === 0) c.style.borderRadius = '50%';
      container.appendChild(c);
    }
  }

  var api = {
    reduced: function () { return reduced; },
    enter: enter, leave: leave,
    mascot: mascot, mascotMood: mascotMood, mascotHide: mascotHide,
    burst: burst, burstFrom: burstFrom, starFly: starFly,
    buzz: buzz, nudge: nudge, highlight: highlight, confetti: confetti
  };

  g.LUMI_FX = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
