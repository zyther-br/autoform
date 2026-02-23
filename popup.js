let currentKey = null;


function showModal(config){
  return new Promise(resolve=>{
    const overlay=document.createElement("div");
    overlay.className="modal-overlay";
    
    const modal=document.createElement("div");
    modal.className="modal";
    
    const header=document.createElement("div");
    header.className="modal-header";
    if(config.icon){
      header.innerHTML=`<i class="mdi ${config.icon}"></i> ${config.title}`;
    } else {
      header.innerText=config.title;
    }
    
    const body=document.createElement("div");
    body.className="modal-body";
    body.innerText=config.message;
    
    const actions=document.createElement("div");
    actions.className="modal-actions";
    
    modal.appendChild(header);
    modal.appendChild(body);
    
    if(config.type==="prompt"){
      const input=document.createElement("input");
      input.className="modal-input";
      input.placeholder=config.placeholder||"Digite aqui...";
      input.value=config.defaultValue||"";
      body.appendChild(input);
      
      const confirmBtn=document.createElement("button");
      confirmBtn.className="modal-btn primary";
      confirmBtn.innerText=config.confirmText||"Confirmar";
      confirmBtn.onclick=()=>{
        overlay.remove();
        resolve(input.value||null);
      };
      
      const cancelBtn=document.createElement("button");
      cancelBtn.className="modal-btn secondary";
      cancelBtn.innerText="Cancelar";
      cancelBtn.onclick=()=>{
        overlay.remove();
        resolve(null);
      };
      
      input.onkeypress=(e)=>{
        if(e.key==="Enter") confirmBtn.click();
        if(e.key==="Escape") cancelBtn.click();
      };
      
      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      
      setTimeout(()=>input.focus(),100);
    }
    else if(config.type==="confirm"){
      const confirmBtn=document.createElement("button");
      confirmBtn.className="modal-btn primary";
      confirmBtn.innerText=config.confirmText||"Confirmar";
      confirmBtn.onclick=()=>{
        overlay.remove();
        resolve(true);
      };
      
      const cancelBtn=document.createElement("button");
      cancelBtn.className="modal-btn secondary";
      cancelBtn.innerText="Cancelar";
      cancelBtn.onclick=()=>{
        overlay.remove();
        resolve(false);
      };
      
      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
    }
    else{
      const okBtn=document.createElement("button");
      okBtn.className="modal-btn primary";
      okBtn.innerText="OK";
      okBtn.onclick=()=>{
        overlay.remove();
        resolve(true);
      };
      actions.appendChild(okBtn);
    }
    
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.getElementById("modalContainer").appendChild(overlay);
    
    overlay.onclick=(e)=>{
      if(e.target===overlay){
        overlay.remove();
        resolve(null);
      }
    };
  });
}


function loadTheme(){
  chrome.storage.local.get(["theme"],data=>{
    const theme=data.theme||"dark";
    document.body.setAttribute("data-theme",theme);
    updateThemeIcon(theme);
  });
}

function toggleTheme(){
  chrome.storage.local.get(["theme"],data=>{
    const current=data.theme||"dark";
    const newTheme=current==="dark"?"light":"dark";
    chrome.storage.local.set({theme:newTheme});
    document.body.setAttribute("data-theme",newTheme);
    updateThemeIcon(newTheme);
    
    chrome.tabs.query({active:true,currentWindow:true},tabs=>{
      if(tabs[0]){
        chrome.tabs.sendMessage(tabs[0].id,{action:"themeChanged",theme:newTheme});
      }
    });
  });
}

function updateThemeIcon(theme){
  const icon=document.getElementById("themeToggle");
  icon.innerHTML=theme==="dark"?'<i class="mdi mdi-weather-sunny"></i>':'<i class="mdi mdi-weather-night"></i>';
}


async function init(){
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  const url = new URL(tab.url);
  currentKey = url.origin + url.pathname;

  loadFields();
  loadAutoState();
  loadTheme();
}

function loadFields(){
  chrome.storage.local.get([currentKey], data=>{
    const fields = data[currentKey] || [];
    const container = document.getElementById("fieldsContainer");
    container.innerHTML="";

    if(!fields.length){
      container.innerHTML="<div style='opacity:0.6;font-size:12px'>Nenhum campo salvo</div>";
      return;
    }

    fields.forEach((f,index)=>{
      const card=document.createElement("div");
      card.className="field-card";

      const title=document.createElement("div");
      title.innerText=getFieldName(f.identity);

      const input=document.createElement("input");
      input.type="text";
      input.value=f.value;

      const row=document.createElement("div");
      row.className="row";

      const saveBtn=document.createElement("button");
      saveBtn.innerText="Salvar";
      saveBtn.className="small-btn primary";
      saveBtn.onclick=()=>updateField(index,input.value);

      const deleteBtn=document.createElement("button");
      deleteBtn.innerText="Excluir";
      deleteBtn.className="small-btn danger";
      deleteBtn.onclick=()=>deleteField(index);

      row.appendChild(saveBtn);
      row.appendChild(deleteBtn);

      card.appendChild(title);
      card.appendChild(input);
      card.appendChild(row);

      container.appendChild(card);
    });
  });
}

function getFieldName(identity){
  if(identity.formType === 'microsoft'){
    return identity.questionText ||
           identity.questionId ||
           "Campo Microsoft Forms";
  }
  
  if(identity.formType === 'google'){
    return (identity.ariaLabelledByText && identity.ariaLabelledByText.join(' ')) ||
           identity.ariaLabel ||
           identity.placeholder ||
           "Campo Google Forms";
  }
  
  return identity.labelText ||
         identity.ariaLabel ||
         (identity.ariaLabelledByText && identity.ariaLabelledByText.join(' ')) ||
         identity.placeholder ||
         identity.name ||
         "Campo Detectado";
}

function updateField(index,value){
  chrome.storage.local.get([currentKey], data=>{
    const fields=data[currentKey]||[];
    fields[index].value=value;
    chrome.storage.local.set({[currentKey]:fields},loadFields);
  });
}

function deleteField(index){
  chrome.storage.local.get([currentKey], data=>{
    let fields=data[currentKey]||[];
    fields.splice(index,1);
    chrome.storage.local.set({[currentKey]:fields},loadFields);
  });
}

function loadAutoState(){
  chrome.storage.local.get(["autoFillEnabled"],data=>{
    document.getElementById("autoToggle").checked=data.autoFillEnabled||false;
  });
}


document.getElementById("capture").onclick=async()=>{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  chrome.tabs.sendMessage(tab.id,{action:"startCapture"});
};

document.getElementById("fill").onclick=async()=>{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  chrome.tabs.sendMessage(tab.id,{action:"fillNow"});
};

document.getElementById("autoToggle").onchange=(e)=>{
  chrome.storage.local.set({autoFillEnabled:e.target.checked});
};

document.getElementById("clearPage").onclick=()=>{
  chrome.storage.local.remove(currentKey,loadFields);
};

document.getElementById("clearAll").onclick=async()=>{
  const confirmed=await showModal({
    type:"confirm",
    title:"Limpar Dados",
    icon:"mdi-alert",
    message:"Tem certeza que deseja apagar TODOS os dados salvos? Esta ação não pode ser desfeita.",
    confirmText:"Sim, apagar tudo"
  });
  
  if(confirmed){
    chrome.storage.local.clear(()=>{
      loadFields();
      showModal({
        type:"alert",
        title:"Sucesso",
        icon:"mdi-check-circle",
        message:"Todos os dados foram apagados com sucesso!"
      });
    });
  }
};


const settingsIcon=document.getElementById("settingsIcon");
const mainTab=document.getElementById("mainTab");
const settingsTab=document.getElementById("settingsTab");
const backBtn=document.getElementById("backBtn");
const themeToggle=document.getElementById("themeToggle");

settingsIcon.onclick=()=>{
  mainTab.classList.add("hidden");
  settingsTab.classList.remove("hidden");
};

themeToggle.onclick=toggleTheme;

backBtn.onclick=()=>{
  settingsTab.classList.add("hidden");
  mainTab.classList.remove("hidden");
};

init();