# AutoForm – Smart Form Filler

> Extensão para Chrome e Edge que preenche formulários automaticamente com seus dados salvos.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat&logo=googlechrome&logoColor=white)
![Edge Extension](https://img.shields.io/badge/Edge-Compatible-0078D7?style=flat&logo=microsoftedge&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=flat)

---

## ✨ Funcionalidades

- **Preenchimento automático** ao carregar a página
- **Configuração por campo** — clique no campo e salve o valor
- **Multi-formulário** — suporte nativo a:
  - 📋 Microsoft Forms
  - 📝 Google Forms
  - 🌐 Formulários genéricos (qualquer site)
- **Detecção inteligente de campos** via `aria-labelledby`, `QuestionId`, texto da pergunta
- **Preenchimento por seções** — detecta mudança de seção automaticamente
- **Tema claro / escuro** com toggle
- **Botão flutuante** com menu radial (aparece apenas em páginas com configuração salva)
- **Preview no hover** — mostra o valor salvo ao passar o mouse no campo

---

## 🚀 Instalação

### Modo Desenvolvedor (Chrome / Edge)

1. Clone ou baixe este repositório
2. Abra `chrome://extensions/` (ou `edge://extensions/`)
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação**
5. Selecione a pasta do projeto

---

## 🗂️ Estrutura do Projeto

```
autoform-dev/
├── icons/              # Ícones da extensão (16, 32, 48, 128px)
├── manifest.json       # Configuração da extensão (Manifest V3)
├── background.js       # Service Worker
├── content.js          # Script injetado nas páginas
├── popup.html          # Interface do popup
├── popup.js            # Lógica do popup
└── styles.css          # Animações e estilos injetados
```

---

## 🔧 Como Usar

### 1. Configurar um campo
- Abra o formulário no navegador
- Clique no ícone da extensão na barra do Chrome
- Clique em **"Configurar Campo"**
- Clique no campo do formulário que deseja salvar
- Digite o valor e confirme

### 2. Preencher automaticamente
- Ative **"Auto preencher ao carregar página"** nas configurações
- Ou clique em **"Preencher Agora"** no popup

### 3. Botão flutuante
- Aparece automaticamente em páginas com campos já configurados
- Passe o mouse para revelar o menu com **Configurar** e **Preencher**

---

## 🧠 Detecção de Formulários

| Tipo | Identificador principal | Fallback |
|------|------------------------|----------|
| Microsoft Forms | `QuestionId_XXX` do `aria-labelledby` | Texto da pergunta |
| Google Forms | Texto do `aria-labelledby` | `data-params` |
| Genérico | `aria-label`, `label[for]`, `name` | Posição no DOM |

---

## 🛠️ Tecnologias

- JavaScript puro (sem frameworks)
- Chrome Extension API (Manifest V3)
- `chrome.storage.local` para persistência
- Material Design Icons via CDN
- Google Fonts — Outfit

---

## 📄 Licença

MIT
