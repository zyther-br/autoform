let CONFIG_KEY = location.origin + location.pathname;
let isCapturing = false;
let currentTheme = "dark";
let formType = "generic"; 


function detectFormType() {
  const url = window.location.href;
  const domain = window.location.hostname;
  
  if (domain.includes('docs.google.com') && url.includes('/forms/')) {
    return 'google';
  }
  
  const msDomains = ['forms.office.com', 'forms.microsoft.com', 'forms.cloud.microsoft', 'microsoft.com', 'office.com'];
  if (msDomains.some(d => domain.includes(d))) {
    return 'microsoft';
  }
  
  if (document.querySelector('[data-automation-id="textInput"]') ||
      document.querySelector('[data-automation-id="questionItem"]') ||
      document.querySelector('[data-automation-id="questionTitle"]') ||
      document.querySelector('[data-automation-id="sectionTitle"]')) {
    return 'microsoft';
  }
  
  const anyInput = document.querySelector('input[aria-labelledby*="QuestionId_"]');
  if (anyInput) {
    return 'microsoft';
  }

  if (document.querySelector('.freebirdFormviewerView') ||
      document.querySelector('[data-params*="google"]')) {
    return 'google';
  }
  
  return 'generic';
}

if (!document.querySelector('link[href*="materialdesignicons"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
  document.head.appendChild(link);
}


function createModal(config){
  const overlay=document.createElement("div");
  overlay.style.cssText=`
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background:rgba(0,0,0,0.75);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:99999999;
    animation:backdropFadeIn 0.25s ease;
    backdrop-filter:blur(8px);
  `;
  
  const modal=document.createElement("div");
  modal.style.cssText=`
    background:${currentTheme==="dark"?"#27272a":"#ffffff"};
    border-radius:16px;
    padding:24px;
    min-width:320px;
    max-width:400px;
    box-shadow:0 25px 60px rgba(0,0,0,0.6);
    animation:scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border:1px solid ${currentTheme==="dark"?"#3f3f46":"#e4e4e7"};
  `;
  
  const title=document.createElement("div");
  title.style.cssText=`
    font-size:16px;
    font-weight:600;
    margin-bottom:8px;
    color:${currentTheme==="dark"?"#fafafa":"#18181b"};
    display:flex;
    align-items:center;
    gap:8px;
  `;
  if(config.icon){
    title.innerHTML=`<i class="mdi ${config.icon}" style="font-size:20px;color:#3b82f6;"></i><span>${config.title}</span>`;
  } else {
    title.innerText=config.title;
  }
  
  const message=document.createElement("div");
  message.style.cssText=`
    margin:12px 0;
    color:${currentTheme==="dark"?"#a1a1aa":"#71717a"};
    line-height:1.5;
    font-size:14px;
  `;
  message.innerText=config.message;
  
  const input=document.createElement("input");
  input.type="text";
  input.placeholder=config.placeholder||"";
  input.value=config.defaultValue||"";
  input.style.cssText=`
    width:calc(100% - 24px);
    padding:10px 12px;
    border-radius:8px;
    border:1px solid ${currentTheme==="dark"?"#3f3f46":"#e4e4e7"};
    background:${currentTheme==="dark"?"#3f3f46":"#f4f4f5"};
    color:${currentTheme==="dark"?"#fafafa":"#18181b"};
    font-size:14px;
    margin-top:12px;
    transition:all 0.2s ease;
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  `;
  
  input.onfocus=()=>{
    input.style.borderColor="#3b82f6";
    input.style.boxShadow="0 0 0 3px rgba(59,130,246,0.1)";
  };
  
  input.onblur=()=>{
    input.style.borderColor=currentTheme==="dark"?"#3f3f46":"#e4e4e7";
    input.style.boxShadow="none";
  };
  
  const actions=document.createElement("div");
  actions.style.cssText=`
    display:flex;
    gap:12px;
    margin-top:24px;
  `;
  
  const cancelBtn=document.createElement("button");
  cancelBtn.innerText="Cancelar";
  cancelBtn.style.cssText=`
    flex:1;
    padding:10px;
    border-radius:8px;
    border:none;
    background:${currentTheme==="dark"?"#3f3f46":"#f4f4f5"};
    color:${currentTheme==="dark"?"#fafafa":"#18181b"};
    cursor:pointer;
    font-weight:500;
    font-size:14px;
    transition:all 0.2s ease;
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  `;
  
  const confirmBtn=document.createElement("button");
  confirmBtn.innerText="Confirmar";
  confirmBtn.style.cssText=`
    flex:1;
    padding:10px;
    border-radius:8px;
    border:none;
    background:#3b82f6;
    color:white;
    cursor:pointer;
    font-weight:500;
    font-size:14px;
    transition:all 0.2s ease;
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  `;
  
  cancelBtn.onmouseenter=()=>{
    cancelBtn.style.transform="translateY(-1px)";
    cancelBtn.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)";
  };
  
  cancelBtn.onmouseleave=()=>{
    cancelBtn.style.transform="translateY(0)";
    cancelBtn.style.boxShadow="none";
  };
  
  confirmBtn.onmouseenter=()=>{
    confirmBtn.style.transform="translateY(-1px)";
    confirmBtn.style.background="#2563eb";
    confirmBtn.style.boxShadow="0 4px 12px rgba(59,130,246,0.3)";
  };
  
  confirmBtn.onmouseleave=()=>{
    confirmBtn.style.transform="translateY(0)";
    confirmBtn.style.background="#3b82f6";
    confirmBtn.style.boxShadow="none";
  };
  
  const modalObj={
    onConfirm:null,
    close:()=>overlay.remove()
  };
  
  confirmBtn.onclick=()=>{
    if(modalObj.onConfirm) modalObj.onConfirm(input.value);
    overlay.remove();
  };
  
  cancelBtn.onclick=()=>overlay.remove();
  
  input.onkeypress=(e)=>{
    if(e.key==="Enter") confirmBtn.click();
    if(e.key==="Escape") cancelBtn.click();
  };
  
  overlay.onclick=(e)=>{
    if(e.target===overlay) overlay.remove();
  };
  
  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(input);
  modal.appendChild(actions);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  setTimeout(()=>input.focus(),100);
  
  return modalObj;
}

function showSuccessToast(message){
  const toast=document.createElement("div");
  toast.style.cssText=`
    position:fixed;
    top:20px;
    right:20px;
    background:#3b82f6;
    color:white;
    padding:12px 20px;
    border-radius:10px;
    box-shadow:0 8px 30px rgba(59,130,246,0.5);
    z-index:2147483647;
    font-weight:500;
    font-size:14px;
    animation:slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    border:1px solid rgba(255,255,255,0.2);
    display:flex;
    align-items:center;
    gap:8px;
    backdrop-filter:blur(10px);
  `;
  toast.innerHTML=`<i class="mdi mdi-check-circle" style="font-size:18px;"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(()=>{
    toast.style.transition="all 0.3s ease";
    toast.style.opacity="0";
    toast.style.transform="translateY(-10px)";
    setTimeout(()=>toast.remove(),300);
  },2500);
}


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "startCapture") startCapture();
  if (msg.action === "fillNow") fillFields();
  if (msg.action === "themeChanged") {
    currentTheme = msg.theme;
    updateFloatingTheme();
  }
});


function startCapture() {
  showSuccessToast("Clique no campo que deseja configurar");

  isCapturing = true;

  document.addEventListener("click", captureClick, true);
}

function captureClick(e) {
  if (!isCapturing) return;

  const el = e.target.closest("input, textarea");
  if (!el) return;

  e.preventDefault();
  e.stopPropagation();

  showInputModal(el);

  isCapturing = false;
  document.removeEventListener("click", captureClick, true);
}

function showInputModal(el){
  formType = detectFormType();
  
  const modal=createModal({
    title:"Configurar Campo",
    icon:"mdi-form-textbox",
    message:"Digite o valor que deseja salvar para este campo:",
    placeholder:el.placeholder||"Digite o valor...",
    defaultValue:el.value||""
  });
  
  modal.onConfirm=(value)=>{
    if(value){
      const identity=buildIdentity(el);
      saveField(identity,value);
      highlight(el);
      showSuccessToast("Campo configurado com sucesso!");
    }
  };
}


function buildIdentity(el) {
  const identity = {
    formType: formType 
  };

  if (formType === 'microsoft') {
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const firstId = labelledBy.split(' ')[0]; 
      identity.questionId = firstId;
      identity.priority = 'questionId';
    }
    
    const questionItem = el.closest('[data-automation-id="questionItem"]');
    if (questionItem) {
      const titleEl = questionItem.querySelector('[data-automation-id="questionTitle"] .text-format-content');
      if (titleEl) {
        identity.questionText = titleEl.innerText.trim();
      }
    }
  }
  
  else if (formType === 'google') {
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const texts = labelledBy
        .split(" ")
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .map(n => n.innerText.trim());

      if (texts.length) {
        identity.ariaLabelledByText = texts;
        identity.priority = 'ariaLabelledByText';
      }
    }
    
    if (el.getAttribute("data-params")) {
      identity.dataParams = el.getAttribute("data-params");
    }
  }
  
  else {
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const texts = labelledBy
        .split(" ")
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .map(n => n.innerText.trim());

      if (texts.length) {
        identity.ariaLabelledByText = texts;
      }
    }

    if (el.getAttribute("aria-label")) {
      identity.ariaLabel = el.getAttribute("aria-label");
    }

    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label) {
        identity.labelText = label.innerText.trim();
      }
    }
  }

  if (el.placeholder) identity.placeholder = el.placeholder;
  if (el.name) identity.name = el.name;
  if (el.id) identity.elementId = el.id;
  if (el.type) identity.inputType = el.type;

  identity.position = Array.from(document.querySelectorAll("input, textarea")).indexOf(el);

  return identity;
}


function saveField(identity, value) {
  chrome.storage.local.get([CONFIG_KEY], (data) => {
    let fields = data[CONFIG_KEY] || [];

    fields = fields.filter(f => JSON.stringify(f.identity) !== JSON.stringify(identity));

    fields.push({ identity, value });

    chrome.storage.local.set({ [CONFIG_KEY]: fields });

  });
}


function resolveField(identity) {
  const inputs = document.querySelectorAll("input, textarea");
  const currentFormType = detectFormType();
  const savedFormType = currentFormType;
  
  if (savedFormType === 'microsoft' && !identity.questionId && identity.ariaLabelledByText) {
    for (const input of inputs) {
      const questionItem = input.closest('[data-automation-id="questionItem"]');
      if (questionItem) {
        const titleEl = questionItem.querySelector('[data-automation-id="questionTitle"]');
        if (titleEl) {
          const titleText = titleEl.innerText.trim();
          const match = identity.ariaLabelledByText.some(t => titleText.includes(t.replace(/^\d+\.\n/, '')));
          if (match) return input;
        }
      }
    }
  }

  for (const input of inputs) {
    
    if (savedFormType === 'microsoft') {
      if (identity.questionId) {
        const inputLabelledBy = input.getAttribute("aria-labelledby");
        if (inputLabelledBy && inputLabelledBy.includes(identity.questionId)) {
          return input;
        }
      }
      
      if (identity.questionText) {
        const questionItem = input.closest('[data-automation-id="questionItem"]');
        if (questionItem) {
          const titleEl = questionItem.querySelector('[data-automation-id="questionTitle"] .text-format-content');
          if (titleEl && titleEl.innerText.trim() === identity.questionText) {
            return input;
          }
        }
      }
    }
    
    else if (savedFormType === 'google') {
      if (identity.ariaLabelledByText) {
        const labelledBy = input.getAttribute("aria-labelledby");
        if (labelledBy) {
          const texts = labelledBy
            .split(" ")
            .map(id => document.getElementById(id))
            .filter(Boolean)
            .map(n => n.innerText.trim());

          const match = identity.ariaLabelledByText.every(t => texts.includes(t));
          if (match) return input;
        }
      }
      
      if (identity.dataParams && input.getAttribute("data-params") === identity.dataParams) {
        return input;
      }
    }
    
    else {
      if (identity.ariaLabelledByText) {
        const labelledBy = input.getAttribute("aria-labelledby");
        if (labelledBy) {
          const texts = labelledBy
            .split(" ")
            .map(id => document.getElementById(id))
            .filter(Boolean)
            .map(n => n.innerText.trim());

          const match = identity.ariaLabelledByText.every(t => texts.includes(t));
          if (match) return input;
        }
      }

      if (identity.ariaLabel && input.getAttribute("aria-label") === identity.ariaLabel) {
        const allWithSameLabel = Array.from(inputs).filter(
          i => i.getAttribute("aria-label") === identity.ariaLabel
        );
        if (allWithSameLabel.length === 1) {
          return input;
        }
      }

      if (identity.labelText && input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label && label.innerText.trim() === identity.labelText) {
          return input;
        }
      }

      if (identity.name && input.name === identity.name) return input;

      if (identity.placeholder && input.placeholder === identity.placeholder) {
        const allWithSamePlaceholder = Array.from(inputs).filter(
          i => i.placeholder === identity.placeholder
        );
        if (allWithSamePlaceholder.length === 1) {
          return input;
        }
      }
    }
  }

  if (identity.position != null && savedFormType === 'generic') {
    return inputs[identity.position];
  }

  return null;
}


function fillFields() {
  formType = detectFormType();
  
  chrome.storage.local.get([CONFIG_KEY], (data) => {
    const fields = data[CONFIG_KEY];
    if (!fields) return;

    fields.forEach(f => {
      const el = resolveField(f.identity);
      if (el) {
        el.focus();
        el.value = f.value;

        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        
        el.style.transition = "all 0.3s ease";
        el.style.background = "rgba(59,130,246,0.15)";
        setTimeout(() => {
          el.style.background = "";
        }, 1000);
      }
    });
  });
}


function setupFieldPreview() {
  chrome.storage.local.get([CONFIG_KEY], (data) => {
    const fields = data[CONFIG_KEY];
    if (!fields || !fields.length) return;

    fields.forEach(f => {
      const el = resolveField(f.identity);
      if (el && !el.dataset.smartConfigured) {
        el.dataset.smartConfigured = "true";
        el.dataset.smartValue = f.value;
        
        el.style.borderLeft = "2px solid #3b82f6";
        el.style.transition = "all 0.2s ease";
        
        el.addEventListener("mouseenter", () => {
          const preview = document.createElement("div");
          preview.className = "smart-preview";
          preview.style.cssText = `
            position: absolute;
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            z-index: 9999999;
            pointer-events: none;
            box-shadow: 0 4px 15px rgba(59,130,246,0.3);
            animation: fadeIn 0.2s ease;
            font-family: 'Inter', -apple-system, sans-serif;
            max-width: 200px;
            word-wrap: break-word;
            border: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            gap: 6px;
          `;
          preview.innerHTML = `<i class="mdi mdi-check" style="font-size:14px;"></i><span>${f.value}</span>`;
          preview.id = `preview-${Date.now()}`;
          
          const rect = el.getBoundingClientRect();
          preview.style.top = `${rect.top - 40}px`;
          preview.style.left = `${rect.left}px`;
          
          document.body.appendChild(preview);
          
          el.dataset.previewId = preview.id;
          
          el.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.3)";
          el.style.transform = "scale(1.005)";
        });
        
        el.addEventListener("mouseleave", () => {
          if (el.dataset.previewId) {
            const preview = document.getElementById(el.dataset.previewId);
            if (preview) preview.remove();
          }
          
          el.style.boxShadow = "";
          el.style.transform = "";
        });
      }
    });
  });
}

function highlight(el) {
  el.style.transition = "all 0.3s ease";
  el.style.outline = "2px solid #3b82f6";
  el.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.2)";
  el.style.transform = "scale(1.01)";
  
  createSuccessParticles(el);
  
  setTimeout(() => {
    el.style.outline = "";
    el.style.boxShadow = "";
    el.style.transform = "";
  }, 1200);
}

function createSuccessParticles(el) {
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: 6px;
      height: 6px;
      background: #3b82f6;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      animation: particle-explode 0.6s ease-out forwards;
    `;
    
    const angle = (Math.PI * 2 * i) / 8;
    particle.style.setProperty('--tx', `${Math.cos(angle) * 50}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * 50}px`);
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 800);
  }
}

chrome.storage.local.get(["autoFillEnabled"], (data) => {
  if (data.autoFillEnabled) {
    setTimeout(fillFields, 1000);
  }
});

function shouldShowFloating(){
  return new Promise(resolve=>{
    chrome.storage.local.get([CONFIG_KEY],data=>{
      const hasConfig = data[CONFIG_KEY] && data[CONFIG_KEY].length > 0;
      resolve(hasConfig);
    });
  });
}

function getFloatingColors() {
  if (currentTheme === 'light') {
    return {
      bg: '#3b82f6',
      bgHover: '#2563eb',
      btnBg: 'rgba(255,255,255,0.95)',
      btnBorder: 'rgba(59,130,246,0.3)',
      btnColor: '#3b82f6',
      btnHoverBg: '#3b82f6',
      btnHoverColor: 'white',
      shadow: '0 4px 20px rgba(59,130,246,0.35)',
    };
  }
  return {
    bg: '#3b82f6',
    bgHover: '#2563eb',
    btnBg: 'rgba(30,30,35,0.95)',
    btnBorder: 'rgba(59,130,246,0.4)',
    btnColor: 'white',
    btnHoverBg: '#3b82f6',
    btnHoverColor: 'white',
    shadow: '0 4px 20px rgba(0,0,0,0.5)',
  };
}

function createFloating(){
  if(document.getElementById("smart-float")) return;

  const root=document.createElement("div");
  root.id="smart-float";
  root.style.cssText=`
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 999999;
    width: 56px;
    height: 56px;
  `;

  const colors = getFloatingColors();

  const circle=document.createElement("div");
  circle.id="smart-float-circle";
  circle.style.cssText=`
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
  `;
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');
  circle.innerHTML=`<img src="${iconUrl}" style="width:44px;height:44px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(59,130,246,0.6));transition:all 0.3s ease;" draggable="false" id="smart-float-img">`;

  const actions = [
    { icon: 'mdi-cog',          fn: startCapture, offsetX: 0,   offsetY: -62, title: 'Configurar' },
    { icon: 'mdi-lightning-bolt', fn: fillFields,   offsetX: -62, offsetY: 0,   title: 'Preencher'  },
  ];

  const actionBtns = actions.map(({icon, fn, offsetX, offsetY, title}) => {
    const btn = document.createElement('div');
    btn.title = title;
    btn.style.cssText=`
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${colors.btnBg};
      color: ${colors.btnColor};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: ${colors.shadow};
      border: 1px solid ${colors.btnBorder};
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0;
      pointer-events: none;
      transform: translate(0px, 0px) scale(0.5);
      top: 6px;
      left: 6px;
      z-index: 1;
    `;
    btn.innerHTML = `<i class="mdi ${icon}" style="font-size:20px;"></i>`;

    btn.onmouseenter = () => {
      btn.style.background = colors.btnHoverBg;
      btn.style.color = colors.btnHoverColor;
      btn.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.15)`;
      btn.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)';
    };
    btn.onmouseleave = () => {
      btn.style.background = colors.btnBg;
      btn.style.color = colors.btnColor;
      btn.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1)`;
      btn.style.boxShadow = colors.shadow;
    };
    btn.onclick = (e) => {
      e.stopPropagation();
      fn();
      hideMenu();
    };

    btn._offsetX = offsetX;
    btn._offsetY = offsetY;
    root.appendChild(btn);
    return btn;
  });

  let hideTimeout;
  let menuOpen = false;

  const showMenu = () => {
    clearTimeout(hideTimeout);
    if (menuOpen) return;
    menuOpen = true;
    circle.style.transform = 'scale(1.1) rotate(15deg)';
    const img = document.getElementById('smart-float-img');
    if (img) img.style.filter = 'drop-shadow(0 6px 20px rgba(59,130,246,0.8))';
    actionBtns.forEach((btn) => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.style.transform = `translate(${btn._offsetX}px, ${btn._offsetY}px) scale(1)`;
    });
  };

  const hideMenu = () => {
    hideTimeout = setTimeout(() => {
      menuOpen = false;
      circle.style.transform = 'scale(1) rotate(0deg)';
      const img = document.getElementById('smart-float-img');
      if (img) img.style.filter = 'drop-shadow(0 4px 12px rgba(59,130,246,0.5))';
      actionBtns.forEach((btn) => {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        btn.style.transform = `translate(0px, 0px) scale(0.5)`;
      });
    }, 200);
  };

  root.onmouseenter = showMenu;
  root.onmouseleave = hideMenu;

  root.appendChild(circle);
  document.body.appendChild(root);
}

function updateFloatingTheme(){
  const circle = document.getElementById("smart-float-circle");
  const root = document.getElementById("smart-float");
  if (!circle || !root) return;

  const colors = getFloatingColors();

  root.querySelectorAll('div:not(#smart-float-circle)').forEach(btn => {
    btn.style.background = colors.btnBg;
    btn.style.color = colors.btnColor;
    btn.style.borderColor = colors.btnBorder;
    btn.style.boxShadow = colors.shadow;
  });
}


window.addEventListener("load",async()=>{
  formType = detectFormType();
  
  chrome.storage.local.get(["theme"], data => {
    currentTheme = data.theme || "dark";
  });
  
  const shouldShow = await shouldShowFloating();
  if(shouldShow) {
    createFloating();
    
    chrome.storage.local.get(["autoFillEnabled"], (data) => {
      if (data.autoFillEnabled) {
        setTimeout(fillFields, 1000);
      }
    });
  }
  
  chrome.storage.local.get([CONFIG_KEY], data => {
    if(data[CONFIG_KEY] && data[CONFIG_KEY].length > 0){
      setTimeout(setupFieldPreview, 500);
    }
  });
});

let fillAttempted = false;
let seenQuestionIds = new Set();

const observer = new MutationObserver(() => {
  chrome.storage.local.get([CONFIG_KEY, "autoFillEnabled"], data => {
    const fields = data[CONFIG_KEY];
    const autoFill = data.autoFillEnabled;

    if (fields && fields.length > 0) {
      setupFieldPreview();

      if (autoFill) {
        const currentType = detectFormType();

        if (currentType === 'microsoft') {
          const msInputs = document.querySelectorAll('input[aria-labelledby*="QuestionId_"]');
          if (msInputs.length > 0) {
            let hasNew = false;
            msInputs.forEach(input => {
              const lb = input.getAttribute('aria-labelledby');
              const qid = lb ? lb.split(' ')[0] : null;
              if (qid && !seenQuestionIds.has(qid)) {
                hasNew = true;
                seenQuestionIds.add(qid);
              }
            });

            if (hasNew) {
              setTimeout(fillFields, 500);
            }
          }
        } else if (!fillAttempted) {
          const inputs = document.querySelectorAll("input:not([type='hidden']), textarea");
          if (inputs.length >= 2) {
            fillAttempted = true;
            setTimeout(fillFields, 500);
          }
        }
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});