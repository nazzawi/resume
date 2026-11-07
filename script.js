(function () {
  // Tabs: shared logic for "Ask me" questions and the timeline.
  function tabs(listSel) {
    var tabsEls = [].slice.call(document.querySelectorAll(listSel + ' [role="tab"]'));
    function select(tab, focus) {
      tabsEls.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabsEls.forEach(function (t, i) {
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = tabsEls[(i + 1) % tabsEls.length];
        if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabsEls[(i - 1 + tabsEls.length) % tabsEls.length];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    return select;
  }
  tabs('.qlist');
  var selectYear = tabs('.tl-track');

  // Links to a story open its row (or timeline point) before scrolling.
  function openTarget(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    var panel = el.closest('[role="tabpanel"]');
    if (panel && panel.closest('.tl-panels')) {
      var btn = document.querySelector('[aria-controls="' + panel.id + '"]');
      if (btn) selectYear(btn);
      el = panel.closest('.tl');
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#story-"]');
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute('href').slice(1);
    history.replaceState(null, '', '#' + id);
    openTarget(id);
  });
  if (location.hash.indexOf('#story-') === 0) openTarget(location.hash.slice(1));

  // Highlight the nav pill for the section in view.
  var links = [].slice.call(document.querySelectorAll('.nav a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  function setOn(id) {
    links.forEach(function (a) { a.classList.toggle('on', a === map[id]); });
    var a = map[id];
    if (a) { var n = a.parentNode; n.scrollLeft = a.offsetLeft - n.clientWidth / 2 + a.clientWidth / 2; }
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setOn(e.target.id); });
    }, { rootMargin: '-80px 0px -65% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // Experience filters.
  var fbtns = [].slice.call(document.querySelectorAll('.filters .f'));
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fbtns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      [].slice.call(document.querySelectorAll('#experience .job')).forEach(function (job) {
        var groups = [].slice.call(job.querySelectorAll('.grp'));
        if (!groups.length) { job.classList.toggle('is-empty', f !== 'all'); return; }
        var shown = 0;
        groups.forEach(function (g) { var on = f === 'all' || g.getAttribute('data-g') === f; g.hidden = !on; if (on) shown++; });
        job.classList.toggle('is-empty', shown === 0);
        job.classList.toggle('single', f !== 'all');
      });
    });
  });

  // Launch filters.
  var lbtns = [].slice.call(document.querySelectorAll('.lfilters .lf'));
  lbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-k');
      lbtns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      [].slice.call(document.querySelectorAll('.launches li')).forEach(function (li) {
        li.hidden = !(k === 'all' || li.getAttribute('data-k') === k);
      });
    });
  });

  // Copy email.
  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var text = document.getElementById('email').textContent.trim();
    function done(msg) { copy.textContent = msg; setTimeout(function () { copy.textContent = 'Copy email'; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done('Copied'); }, function () { done('Select it to copy'); });
    } else { done('Select it to copy'); }
  });
})();
