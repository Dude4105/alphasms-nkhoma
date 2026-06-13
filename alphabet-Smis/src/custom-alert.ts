const injectStyles = () => {
  if (document.getElementById('custom-alert-styles')) return;
  const style = document.createElement('style');
  style.id = 'custom-alert-styles';
  style.innerHTML = `
    .custom-alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.25s ease;
      padding: 1.5rem;
    }
    .custom-alert-overlay.show {
      opacity: 1;
    }
    .custom-alert-card {
      background: var(--bg-darker, #060708);
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      padding: 2.25rem 2rem 2rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      text-align: center;
      transform: scale(0.95) translateY(15px);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }
    .custom-alert-overlay.show .custom-alert-card {
      transform: scale(1) translateY(0);
    }
    .custom-alert-icon {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.25rem;
    }
    .custom-alert-icon.success {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .custom-alert-icon.error {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .custom-alert-icon.warning {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .custom-alert-icon.info {
      background: var(--primary-gold-dim, rgba(253, 184, 19, 0.12));
      color: var(--primary-gold, #FDB813);
      border: 1px solid rgba(253, 184, 19, 0.2);
    }
    .custom-alert-title {
      font-family: var(--font-display, 'Outfit', sans-serif);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-light, #ffffff);
      margin: 0;
    }
    .custom-alert-message {
      font-family: var(--font-family, 'Inter', sans-serif);
      font-size: 0.95rem;
      color: var(--text-muted, #888888);
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }
    .custom-alert-btn {
      width: 100%;
      background: var(--primary-gold, #FDB813);
      border: none;
      color: #000000;
      padding: 0.85rem 1.5rem;
      font-family: var(--font-family, 'Inter', sans-serif);
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px var(--primary-gold-dim, rgba(253, 184, 19, 0.2));
    }
    .custom-alert-btn:hover {
      background: var(--primary-gold-bright, #FFCC33);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(253, 184, 19, 0.35);
    }
    .custom-alert-btn:active {
      transform: translateY(0);
    }

    /* Confirm dialog styles */
    .custom-confirm-actions {
      display: flex;
      gap: 0.75rem;
      width: 100%;
    }
    .custom-confirm-btn-cancel {
      flex: 1;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #888888);
      padding: 0.85rem 1.5rem;
      font-family: var(--font-family, 'Inter', sans-serif);
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .custom-confirm-btn-cancel:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.18);
      color: var(--text-light, #ffffff);
    }
    .custom-confirm-btn-ok {
      flex: 1;
      background: var(--primary-gold, #FDB813);
      border: none;
      color: #000000;
      padding: 0.85rem 1.5rem;
      font-family: var(--font-family, 'Inter', sans-serif);
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px var(--primary-gold-dim, rgba(253, 184, 19, 0.2));
    }
    .custom-confirm-btn-ok:hover {
      background: var(--primary-gold-bright, #FFCC33);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(253, 184, 19, 0.35);
    }
    .custom-confirm-btn-ok.danger {
      background: #ef4444;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);
      color: #ffffff;
    }
    .custom-confirm-btn-ok.danger:hover {
      background: #f87171;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
    .custom-confirm-btn-ok:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
};

/* ─── ALERT ─────────────────────────────────────────────── */

let alertQueue: { message: string; resolve: () => void }[] = [];
let isAlertActive = false;

const processQueue = () => {
  if (alertQueue.length === 0) {
    isAlertActive = false;
    return;
  }

  isAlertActive = true;
  const { message, resolve } = alertQueue.shift()!;
  
  injectStyles();

  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';

  const card = document.createElement('div');
  card.className = 'custom-alert-card';

  // Determine type
  let alertType = 'info';
  let titleText = 'Notice';
  let iconSvg = '';
  
  const msgLower = message.toLowerCase();
  if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('cannot') || msgLower.includes('invalid') || msgLower.includes('incorrect') || msgLower.includes('offline') || msgLower.includes('must be')) {
    alertType = 'error';
    titleText = 'Notice';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
  } else if (msgLower.includes('success') || msgLower.includes('saved') || msgLower.includes('completed') || msgLower.includes('created') || msgLower.includes('successfully')) {
    alertType = 'success';
    titleText = 'Success';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else {
    alertType = 'info';
    titleText = 'Notification';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
  }

  const iconContainer = document.createElement('div');
  iconContainer.className = `custom-alert-icon ${alertType}`;
  iconContainer.innerHTML = iconSvg;

  const title = document.createElement('div');
  title.className = 'custom-alert-title';
  title.innerText = titleText;

  const msg = document.createElement('div');
  msg.className = 'custom-alert-message';
  msg.innerText = message;

  const btn = document.createElement('button');
  btn.className = 'custom-alert-btn';
  btn.innerText = 'Got it';

  card.appendChild(iconContainer);
  card.appendChild(title);
  card.appendChild(msg);
  card.appendChild(btn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Trigger animations
  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });

  const closeAlert = () => {
    overlay.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      resolve();
      processQueue();
    }, 250);
  };

  btn.addEventListener('click', closeAlert);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeAlert();
    }
  });
};

window.alert = (message: any) => {
  return new Promise<void>((resolve) => {
    alertQueue.push({ message: String(message), resolve });
    if (!isAlertActive) {
      processQueue();
    }
  }) as any;
};

/* ─── CONFIRM ────────────────────────────────────────────── */

window.confirm = (message?: string): any => {
  injectStyles();

  return new Promise<boolean>((resolve) => {
    const msg = message ?? '';
    const msgLower = msg.toLowerCase();

    // Detect if it is a destructive action
    const isDanger =
      msgLower.includes('delete') ||
      msgLower.includes('remove') ||
      msgLower.includes('unenroll') ||
      msgLower.includes('permanently') ||
      msgLower.includes('cannot be undone') ||
      msgLower.includes('critical');

    let iconSvg = '';
    let titleText = 'Confirm Action';

    if (isDanger) {
      titleText = 'Are You Sure?';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
    } else {
      titleText = 'Confirm';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const card = document.createElement('div');
    card.className = 'custom-alert-card';

    const iconContainer = document.createElement('div');
    iconContainer.className = `custom-alert-icon ${isDanger ? 'warning' : 'info'}`;
    iconContainer.innerHTML = iconSvg;

    const title = document.createElement('div');
    title.className = 'custom-alert-title';
    title.innerText = titleText;

    const msgEl = document.createElement('div');
    msgEl.className = 'custom-alert-message';
    msgEl.innerText = msg;

    const actions = document.createElement('div');
    actions.className = 'custom-confirm-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'custom-confirm-btn-cancel';
    cancelBtn.innerText = 'Cancel';

    const okBtn = document.createElement('button');
    okBtn.className = `custom-confirm-btn-ok${isDanger ? ' danger' : ''}`;
    okBtn.innerText = isDanger ? 'Yes, Proceed' : 'Confirm';

    actions.appendChild(cancelBtn);
    actions.appendChild(okBtn);

    card.appendChild(iconContainer);
    card.appendChild(title);
    card.appendChild(msgEl);
    card.appendChild(actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('show');
    });

    const close = (result: boolean) => {
      overlay.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        resolve(result);
      }, 250);
    };

    okBtn.addEventListener('click', () => close(true));
    cancelBtn.addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  }) as any;
};
