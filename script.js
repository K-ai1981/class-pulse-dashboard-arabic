// ============================================================
// لوحة نبض الصف — JavaScript
// ============================================================

// ── Backend URL ──
// ✅ ضع هنا رابط Google Apps Script الخاص بك
// مثال: 'https://script.google.com/macros/s/AKfycbx.../exec'
const BACKEND_URL  = 'https://script.google.com/macros/s/AKfycbxTbjcanMIp2_UdiIWwR7E8r__v1pMYsM4RAOHQmitDRPukA2bpQI8arAdzipkPXegO/exec';
const SECRET_TOKEN = 'pulse2025';

// ── كلمة مرور المعلم ──
// ✅ غيّر هذه الكلمة قبل النشر
const TEACHER_PASSWORD = 'teacher123';

const STORAGE_KEY      = 'classPulseResponses_v2';
const AUTH_KEY         = 'classPulseTeacherAuth';

// ============================================================
// 🔐  Teacher Authentication
// ============================================================

function openTeacherLogin() {
    // إذا كان المعلم مسجلاً دخوله بالفعل — افتح اللوحة مباشرة
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        showTeacherDashboard();
        return;
    }
    document.getElementById('teacherModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('teacherPassword').focus(), 100);
}

function closeTeacherLogin() {
    document.getElementById('teacherModal').classList.add('hidden');
    document.getElementById('teacherPassword').value = '';
    document.getElementById('passwordError').classList.add('hidden');
}

function handleOverlayClick(e) {
    if (e.target.id === 'teacherModal') closeTeacherLogin();
}

function checkTeacherPassword() {
    const input = document.getElementById('teacherPassword');
    const error = document.getElementById('passwordError');

    if (input.value === TEACHER_PASSWORD) {
        // ✅ كلمة المرور صحيحة
        sessionStorage.setItem(AUTH_KEY, 'true');
        closeTeacherLogin();
        showTeacherDashboard();
    } else {
        // ❌ كلمة المرور خاطئة
        error.classList.remove('hidden');
        input.classList.add('shake');
        input.value = '';
        setTimeout(() => input.classList.remove('shake'), 450);
        input.focus();
    }
}

function showTeacherDashboard() {
    // أظهر شريط المعلم الثابت في الأعلى
    document.getElementById('teacherBar').classList.remove('hidden');
    document.body.classList.add('teacher-mode');

    // أظهر أقسام المعلم مع أنيميشن
    const sections = document.querySelectorAll('.teacher-section');
    sections.forEach((sec, i) => {
        sec.classList.remove('hidden');
        sec.style.animationDelay = (i * 0.12) + 's';
        sec.classList.add('reveal');
    });

    // تحديث اللوحة بالبيانات
    updateDashboard();

    // تمرير لأول قسم للمعلم
    setTimeout(() => {
        document.getElementById('teacher-dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

function logoutTeacher() {
    sessionStorage.removeItem(AUTH_KEY);
    document.getElementById('teacherBar').classList.add('hidden');
    document.body.classList.remove('teacher-mode');
    document.querySelectorAll('.teacher-section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('reveal');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Storage helpers ──
function getResponses() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
}
function saveResponses(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function addResponse(data) {
    const list = getResponses();
    data.id = Date.now();
    data.timestamp = new Date().toLocaleString('ar-SA', {
        year:'numeric', month:'short', day:'numeric',
        hour:'2-digit', minute:'2-digit'
    });
    list.unshift(data);
    saveResponses(list);
}

// ── Animated number counter ──
function animateCounter(el, target) {
    const duration = 700;
    const start = performance.now();
    const from = parseInt(el.textContent) || 0;
    function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3); // ease-out-cubic
        el.textContent = Math.round(from + (target - from) * ease);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

// ── Update dashboard ──
function updateDashboard() {
    const list  = getResponses();
    const total = list.length;

    const counts = {
        'فهمت الدرس جيداً':      0,
        'أحتاج إلى تدريب إضافي': 0,
        'ما زلت أشعر بالارتباك': 0,
        'أستطيع مساعدة زملائي':  0,
    };
    list.forEach(r => {
        if (counts.hasOwnProperty(r.understanding)) counts[r.understanding]++;
    });

    // Animate counters
    animateCounter(document.getElementById('totalCount'),        total);
    animateCounter(document.getElementById('understoodCount'),   counts['فهمت الدرس جيداً']);
    animateCounter(document.getElementById('needsPracticeCount'),counts['أحتاج إلى تدريب إضافي']);
    animateCounter(document.getElementById('confusedCount'),     counts['ما زلت أشعر بالارتباك']);
    animateCounter(document.getElementById('canHelpCount'),      counts['أستطيع مساعدة زملائي']);

    // Progress bars + percentages
    updateBar('bar-total',      100, total, total, 'pct-total', false);
    updateBar('bar-understood', counts['فهمت الدرس جيداً'],      total, total, 'pct-understood');
    updateBar('bar-practice',   counts['أحتاج إلى تدريب إضافي'], total, total, 'pct-practice');
    updateBar('bar-confused',   counts['ما زلت أشعر بالارتباك'], total, total, 'pct-confused');
    updateBar('bar-canhelp',    counts['أستطيع مساعدة زملائي'],  total, total, 'pct-canhelp');

    updateRecommendation(total, counts);
    renderResponses(list);
}

function updateBar(barId, count, total, _t, pctId, showPct = true) {
    const bar = document.getElementById(barId);
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    if (bar) setTimeout(() => bar.style.width = pct + '%', 80);
    if (showPct && pctId) {
        const el = document.getElementById(pctId);
        if (el) el.textContent = total > 0 ? pct + '%' : '—';
    }
}

// ── Smart recommendation ──
function updateRecommendation(total, counts) {
    const card = document.getElementById('recommendationCard');
    const icon = document.getElementById('recommendationIcon');
    const text = document.getElementById('recommendationText');
    const label = document.getElementById('recLabel');
    if (!card) return;

    if (total === 0) {
        setRec(card, icon, text, label,
            'recommendation-empty', '💬',
            'في انتظار المشاركة',
            'لم يتم إرسال أي تقييم بعد. ستظهر التوصية بعد مشاركة الطلاب.');
        return;
    }

    // find dominant
    let dominant = '', max = 0;
    for (const [k, v] of Object.entries(counts)) {
        if (v > max) { max = v; dominant = k; }
    }

    if (dominant === 'أحتاج إلى تدريب إضافي') {
        setRec(card, icon, text, label,
            'recommendation-warning', '📚',
            'يُنصح بمراجعة المادة',
            'يبدو أن عدداً من الطلاب يحتاجون إلى تدريب إضافي. من الأفضل بدء الحصة القادمة بنشاط مراجعة قصير.');
    } else if (dominant === 'ما زلت أشعر بالارتباك') {
        setRec(card, icon, text, label,
            'recommendation-alert', '⚠️',
            'تنبيه: ارتباك لدى الطلاب',
            'هناك مؤشرات على وجود ارتباك لدى بعض الطلاب. يمكن إعادة شرح المفهوم الأساسي باستخدام مثال أبسط.');
    } else if (dominant === 'فهمت الدرس جيداً') {
        setRec(card, icon, text, label,
            'recommendation-success', '🌟',
            'ممتاز! الطلاب فهموا جيداً',
            'يبدو أن معظم الطلاب فهموا الدرس. يمكنك الانتقال إلى نشاط تطبيقي أو تحدي متقدم.');
    } else if (dominant === 'أستطيع مساعدة زملائي') {
        setRec(card, icon, text, label,
            'recommendation-info', '🤝',
            'فرصة للتعلم التعاوني',
            'يمكنك استخدام التعلم التعاوني وتكليف هؤلاء الطلاب بدعم زملائهم في الحصة القادمة.');
    }
}

function setRec(card, icon, text, label, cls, iconVal, labelVal, msg) {
    card.className = 'recommendation-card ' + cls;
    icon.textContent = iconVal;
    text.textContent = msg;
    if (label) label.textContent = labelVal;
}

// ── Render response cards ──
function renderResponses(list) {
    const container = document.getElementById('responsesList');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML =
            '<div class="empty-state">' +
            '  <span class="empty-illustration">📭</span>' +
            '  <h3 class="empty-title">لا توجد ردود بعد</h3>' +
            '  <p class="empty-sub">سيظهر هنا ردود الطلاب فور إرسال النموذج</p>' +
            '</div>';
        return;
    }

    container.innerHTML = list.map(r => {
        const cls   = statusClass(r.understanding);
        const badge = statusBadge(r.understanding);
        const initial = (r.studentName || '؟')[0];
        const questionBlock = r.remainingQuestion
            ? '<div class="response-field">' +
              '  <div class="response-field-label">❓ السؤال المتبقي</div>' +
              '  <div class="response-field-value">' + safe(r.remainingQuestion) + '</div>' +
              '</div>'
            : '';

        return (
            '<div class="response-card ' + cls + '">' +
            '  <div class="response-header">' +
            '    <div class="response-avatar">' + safe(initial) + '</div>' +
            '    <div class="response-info">' +
            '      <div class="response-student-name">' + safe(r.studentName) + '</div>' +
            '      <div class="response-class">🏫 ' + safe(r.className) + '</div>' +
            '    </div>' +
            '    <div class="response-badge">' + badge + '</div>' +
            '  </div>' +
            '  <hr class="response-divider">' +
            '  <div class="response-field">' +
            '    <div class="response-field-label">⭐ أهم شيء تعلمه</div>' +
            '    <div class="response-field-value">' + safe(r.mainLearning) + '</div>' +
            '  </div>' +
            questionBlock +
            '  <div class="response-time">🕐 ' + safe(r.timestamp) + '</div>' +
            '</div>'
        );
    }).join('');
}

function statusClass(s) {
    return { 'فهمت الدرس جيداً': 'status-understood', 'أحتاج إلى تدريب إضافي': 'status-practice',
             'ما زلت أشعر بالارتباك': 'status-confused', 'أستطيع مساعدة زملائي': 'status-canhelp' }[s] || '';
}
function statusBadge(s) {
    return { 'فهمت الدرس جيداً': '✅ فهمت جيداً', 'أحتاج إلى تدريب إضافي': '📚 تدريب إضافي',
             'ما زلت أشعر بالارتباك': '😕 ارتباك', 'أستطيع مساعدة زملائي': '🤝 يساعد الآخرين' }[s] || s;
}

// XSS protection
function safe(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str || '')));
    return d.innerHTML;
}

// ── Form progress indicator ──
function updateFormProgress(step) {
    const steps = document.querySelectorAll('.form-progress-step');
    steps.forEach((el, i) => {
        el.classList.toggle('active', i <= step);
    });
}

// Watch scroll to activate progress steps
function watchFormFields() {
    const sec2 = document.querySelector('.form-section:nth-child(2)');
    const sec3 = document.querySelector('.form-section:nth-child(3)');
    function check() {
        const radio = document.querySelector('input[name="understanding"]:checked');
        const name  = document.getElementById('studentName')?.value.trim();
        if (name)  updateFormProgress(1);
        if (radio) updateFormProgress(2);
    }
    document.getElementById('studentName')?.addEventListener('input', check);
    document.querySelectorAll('input[name="understanding"]').forEach(r => r.addEventListener('change', check));
}

// ── Form validation ──
function validate() {
    let ok = true;
    function check(fieldId, errorId, test) {
        const f = document.getElementById(fieldId);
        const e = document.getElementById(errorId);
        if (!f || !e) return;
        if (test) { f.classList.add('has-error'); e.classList.add('visible'); ok = false; }
        else       { f.classList.remove('has-error'); e.classList.remove('visible'); }
    }
    check('studentName',  'error-studentName',  !document.getElementById('studentName').value.trim());
    check('className',    'error-className',    !document.getElementById('className').value.trim());
    check('mainLearning', 'error-mainLearning', !document.getElementById('mainLearning').value.trim());

    const radio = document.querySelector('input[name="understanding"]:checked');
    const re    = document.getElementById('error-understanding');
    if (!radio) { re?.classList.add('visible'); ok = false; }
    else         re?.classList.remove('visible');

    return ok;
}

// ── Send to backend ──
function sendToBackend(data) {
    if (!BACKEND_URL) {
        console.log('📝 Backend غير مرتبط بعد. البيانات محفوظة محلياً.', data);
        return;
    }
    fetch(BACKEND_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token: SECRET_TOKEN }),
    })
    .then(() => console.log('✅ أُرسلت البيانات إلى Google Sheets'))
    .catch(err => console.error('❌ خطأ:', err));
}

// ── Form submit ──
document.getElementById('assessmentForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
        studentName:       document.getElementById('studentName').value.trim(),
        className:         document.getElementById('className').value.trim(),
        understanding:     document.querySelector('input[name="understanding"]:checked').value,
        mainLearning:      document.getElementById('mainLearning').value.trim(),
        remainingQuestion: document.getElementById('remainingQuestion').value.trim(),
    };

    // Button loading state
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.querySelector('.submit-text').textContent = 'جارٍ الإرسال...';

    setTimeout(() => {
        addResponse(data);
        sendToBackend(data);

        document.getElementById('assessmentForm').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        updateDashboard();

        setTimeout(() => {
            document.getElementById('teacher-dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);

        btn.disabled = false;
        btn.querySelector('.submit-text').textContent = 'إرسال التقييم';
    }, 480); // slight delay for feel
});

// ── New response ──
document.getElementById('newResponseBtn').addEventListener('click', () => {
    document.getElementById('assessmentForm').reset();
    document.getElementById('assessmentForm').classList.remove('hidden');
    document.getElementById('successMessage').classList.add('hidden');
    document.querySelectorAll('.field-error').forEach(e => e.classList.remove('visible'));
    document.querySelectorAll('.has-error').forEach(e => e.classList.remove('has-error'));
    updateFormProgress(0);
    document.getElementById('student-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Clear all ──
document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (confirm('هل أنت متأكد من مسح جميع التقييمات؟')) {
        localStorage.removeItem(STORAGE_KEY);
        updateDashboard();
    }
});

// ── Animate stat cards on scroll ──
function observeStats() {
    const cards = document.querySelectorAll('.stat-card');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: .1 });
    cards.forEach((c, i) => {
        c.style.opacity = '0';
        c.style.transform = 'translateY(20px)';
        c.style.transition = `opacity .4s ease ${i * 0.07}s, transform .4s ease ${i * 0.07}s`;
        io.observe(c);
    });
}

// ── Section fade-in on scroll ──
function observeSections() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('is-visible');
        });
    }, { threshold: .08 });
    document.querySelectorAll('.section').forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(24px)';
        s.style.transition = 'opacity .5s ease, transform .5s ease';
        io.observe(s);
    });
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.section.is-visible').forEach(s => {
            s.style.opacity = '1';
            s.style.transform = 'none';
        });
    });
}
// Simple visibility toggle
document.querySelectorAll('.section').forEach(s => {
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { s.style.opacity='1'; s.style.transform='translateY(0)'; }
    }, { threshold: .05 }).observe(s);
    s.style.cssText += 'opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease;';
});

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    // استعادة جلسة المعلم إذا كان مسجلاً دخوله مسبقاً
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        showTeacherDashboard();
    } else {
        updateDashboard(); // تحديث الأرقام حتى لو مخفية
    }
    watchFormFields();
    observeStats();
    console.log('✅ لوحة نبض الصف — جاهزة');
});
