(() => {
"use strict";
const engine=window.CalculatorEngine;
const store=window.CalculatorStorage.createStorage();
const MAX_HISTORY=100,MAX_FAVORITES=50;
const state={expression:"",result:"0",justCalculated:false,memory:0,history:store.loadHistory(),favorites:store.loadFavorites(),settings:store.loadSettings(),panel:"history"};
const q=(s)=>document.querySelector(s);
const refs={expr:q("#expression-display"),result:q("#result-display"),status:q("#status-message"),memory:q("#memory-indicator"),keypad:q("#keypad"),memoryButtons:q(".memory-buttons"),history:q("#history-list"),favorites:q("#favorites-list"),clearHistory:q("#clear-history"),tabs:[...document.querySelectorAll("[data-panel]")],panels:[...document.querySelectorAll("[data-panel-content]")],copy:q("#copy-result"),angle:q("#angle-mode"),theme:q("#theme-select"),style:q("#style-select"),large:q("#large-text"),sound:q("#sound-toggle"),reset:q("#reset-settings"),toast:q("#toast")};

function fmt(n){return String(n).replace(".",",")}
function display(exp){return exp.replaceAll("sqrt(","√(").replaceAll("sin(","sen(").replaceAll("*","×").replaceAll("/","÷").replaceAll("-","−")}
function toast(message){refs.toast.textContent=message;refs.toast.classList.add("is-visible");clearTimeout(toast.t);toast.t=setTimeout(()=>refs.toast.classList.remove("is-visible"),1700)}
function setStatus(message){refs.status.textContent=message||"";refs.status.classList.toggle("is-visible",!!message)}
function applySettings(){store.saveSettings(state.settings);render()}
function renderPanels(){refs.tabs.forEach(t=>{const on=t.dataset.panel===state.panel;t.classList.toggle("is-active",on);t.setAttribute("aria-selected",String(on))});refs.panels.forEach(p=>p.hidden=p.dataset.panelContent!==state.panel)}
function render(){
  refs.expr.textContent=state.justCalculated?display(state.expression)+" =":(display(state.expression)||"0");
  refs.result.textContent=fmt(state.result);refs.memory.hidden=state.memory===0;
  refs.angle.value=state.settings.angleMode;refs.theme.value=state.settings.theme;refs.style.value=state.settings.style;refs.large.checked=!!state.settings.largeText;refs.sound.checked=!!state.settings.sound;
  document.body.dataset.theme=state.settings.theme;document.body.dataset.style=state.settings.style;document.body.classList.toggle("large-text",!!state.settings.largeText);
  renderHistory();renderFavorites();renderPanels();
}
function clearAll(){state.expression="";state.result="0";state.justCalculated=false;setStatus("");render()}
function lastChar(){return state.expression.at(-1)||""}
function currentNumberHasDecimal(){const m=state.expression.match(/(?:^|[+\-*/^(])(-?(?:\d+(?:\.\d*)?|\.\d*))$/);return !!(m&&m[1].includes("."))}
function insert(text,kind){
  if(state.justCalculated){
    if(/^[+\-*/^]$/.test(text)||text==="%"||text==="!")state.expression=state.result;
    else{state.expression="";state.result="0"}
    state.justCalculated=false
  }
  if(kind==="function"){if(/[0-9.)A-Za-z]/.test(lastChar()))state.expression+="*";state.expression+=text+"(";setStatus("");render();return}
  if(kind==="constant"){if(/[0-9.)]/.test(lastChar()))state.expression+="*";state.expression+=text;render();return}
  if(text==="("){if(/[0-9.)]/.test(lastChar()))state.expression+="*";state.expression+="(";render();return}
  if(text===")"){let b=0;for(const c of state.expression){if(c==="(")b++;else if(c===")")b--}if(b<=0||/[+\-*/^(]$/.test(state.expression)){toast("Parênteses incompletos.");return}state.expression+=")";setStatus("");render();return}
  if(text==="!"||text==="%"){if(!state.expression||/[+\-*/^(]$/.test(state.expression)){toast("Digite um valor primeiro.");return}state.expression+=text;setStatus("");render();return}
  if(/^[+\-*/^]$/.test(text)){
    if(!state.expression){if(text==="-")state.expression="-";else{toast("Comece com um número.");return}}
    else if(/[+\-*/^]$/.test(state.expression)){if(text==="-"&&!state.expression.endsWith("-"))state.expression+="-";else state.expression=state.expression.slice(0,-1)+text}
    else state.expression+=text;
    setStatus("");render();return
  }
  if(/^\d$/.test(text)||text==="."){if(text==="."&&currentNumberHasDecimal())return;if(text==="."&&(!state.expression||/[+\-*/^(]$/.test(state.expression)))state.expression+="0.";else state.expression+=text;setStatus("");render()}
}
function toggleSign(){if(!state.expression)state.expression="-";else if(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(state.expression))state.expression=state.expression.startsWith("-")?state.expression.slice(1):"-"+state.expression;else if(state.expression.startsWith("-(")&&state.expression.endsWith(")"))state.expression=state.expression.slice(2,-1);else state.expression="-("+state.expression+")";state.justCalculated=false;render()}
function square(){if(!state.expression)return;state.expression+="^2";state.justCalculated=false;render()}
function inverse(){state.expression=state.expression?"1/("+state.expression+")":"1/(";state.justCalculated=false;render()}
function calculate(){
  if(!state.expression.trim())return;
  try{const value=engine.evaluate(state.expression,{angleMode:state.settings.angleMode});const result=engine.formatResult(value);if(result==="Erro")throw new Error("Resultado inválido");addHistory(display(state.expression),result);state.result=result;state.justCalculated=true;setStatus("");render();if(state.settings.sound)beep()}
  catch(err){state.result="Erro";state.justCalculated=true;setStatus(err instanceof Error?err.message:"Expressão inválida");render()}
}
function addHistory(expression,result){state.history.unshift({id:Date.now()+"-"+Math.random().toString(36).slice(2,7),expression,result,timestamp:Date.now()});state.history=state.history.slice(0,MAX_HISTORY);store.saveHistory(state.history)}
function removeHistory(id){state.history=state.history.filter(x=>x.id!==id);store.saveHistory(state.history);renderHistory()}
function clearHistory(){state.history=[];store.saveHistory(state.history);renderHistory()}
function favoriteExists(expression,result){return state.favorites.some(x=>x.expression===expression&&x.result===result)}
function toggleFavorite(expression,result){const i=state.favorites.findIndex(x=>x.expression===expression&&x.result===result);if(i>=0){state.favorites.splice(i,1);toast("Removido dos favoritos.")}else{if(state.favorites.length>=MAX_FAVORITES)state.favorites.pop();state.favorites.unshift({id:Date.now()+"-"+Math.random().toString(36).slice(2,7),expression,result});toast("Adicionado aos favoritos.")}store.saveFavorites(state.favorites);renderHistory();renderFavorites()}
function copyText(value){Promise.resolve().then(()=>navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(value):fallbackCopy(value)).then(()=>toast("Resultado copiado.")).catch(()=>toast("Não foi possível copiar."))}
function fallbackCopy(value){const a=document.createElement("textarea");a.value=value;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}
function record(item,allowDelete){
  const wrap=document.createElement("div");wrap.className="record";
  const main=document.createElement("button");main.type="button";main.className="record__main";main.dataset.expression=item.expression;main.dataset.result=item.result;
  const ex=document.createElement("span");ex.className="record__expression";ex.textContent=item.expression;const rs=document.createElement("strong");rs.className="record__result";rs.textContent=fmt(item.result);main.append(ex,rs);wrap.appendChild(main);
  const actions=document.createElement("div");actions.className="record__actions";
  const fav=document.createElement("button");fav.type="button";fav.className="icon-button";fav.dataset.action="favorite";fav.dataset.expression=item.expression;fav.dataset.result=item.result;fav.textContent=favoriteExists(item.expression,item.result)?"★":"☆";fav.setAttribute("aria-label",favoriteExists(item.expression,item.result)?"Remover favorito":"Adicionar favorito");actions.appendChild(fav);
  const cp=document.createElement("button");cp.type="button";cp.className="icon-button";cp.dataset.action="copy";cp.dataset.result=item.result;cp.textContent="⧉";cp.setAttribute("aria-label","Copiar resultado");actions.appendChild(cp);
  if(allowDelete){const del=document.createElement("button");del.type="button";del.className="icon-button icon-button--danger";del.dataset.action="delete";del.dataset.id=item.id;del.textContent="×";del.setAttribute("aria-label","Excluir histórico");actions.appendChild(del)}
  wrap.appendChild(actions);return wrap
}
function renderHistory(){refs.history.replaceChildren();if(!state.history.length){const e=document.createElement("div");e.className="empty-state";e.textContent="Nenhum cálculo no histórico.";refs.history.appendChild(e);return}state.history.forEach(x=>refs.history.appendChild(record(x,true)))}
function renderFavorites(){refs.favorites.replaceChildren();if(!state.favorites.length){const e=document.createElement("div");e.className="empty-state";e.textContent="Nenhuma expressão favorita.";refs.favorites.appendChild(e);return}state.favorites.forEach(x=>refs.favorites.appendChild(record(x,false)))}
function useRecord(expression,result){state.expression=expression.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replaceAll("√(","sqrt(").replaceAll("sen(","sin(").replaceAll("π","pi");state.result=result;state.justCalculated=false;setStatus("");render()}
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=560;g.gain.value=.025;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.05)}catch{}}
function action(type){
  if(type==="clear")return clearAll();if(type==="backspace"){if(state.justCalculated)return clearAll();state.expression=state.expression.slice(0,-1);render();return}
  if(type==="toggle-sign")return toggleSign();if(type==="equals")return calculate();if(type==="square")return square();if(type==="inverse")return inverse();
  if(type==="open-paren")return insert("(");if(type==="close-paren")return insert(")");if(type==="factorial")return insert("!");
  if(type==="constant-pi")return insert("pi","constant");if(type==="constant-e")return insert("e","constant")
}
refs.keypad.addEventListener("click",(e)=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;if(d.number!==undefined)insert(d.number);else if(d.operation!==undefined)insert(d.operation);else if(d.functionName)insert(d.functionName,"function");else if(d.action)action(d.action)});
refs.memoryButtons.addEventListener("click",(e)=>{const b=e.target.closest("button[data-action]");if(!b)return;const t=b.dataset.action;if(t==="memory-clear")state.memory=0;else if(t==="memory-recall")state.expression=engine.formatResult(state.memory);else if(t==="memory-add")state.memory+=Number(state.result)||0;else if(t==="memory-subtract")state.memory-=Number(state.result)||0;render()});
[refs.history,refs.favorites].forEach(list=>list.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const a=t.dataset.action;if(a==="favorite")toggleFavorite(t.dataset.expression,t.dataset.result);else if(a==="copy")copyText(t.dataset.result);else if(a==="delete")removeHistory(t.dataset.id);else if(t.classList.contains("record__main"))useRecord(t.dataset.expression,t.dataset.result)}));
refs.clearHistory.addEventListener("click",clearHistory);refs.copy.addEventListener("click",()=>copyText(state.result));
refs.tabs.forEach(t=>t.addEventListener("click",()=>{state.panel=t.dataset.panel;renderPanels()}));
refs.angle.addEventListener("change",()=>{state.settings.angleMode=refs.angle.value;store.saveSettings(state.settings);render()});
refs.theme.addEventListener("change",()=>{state.settings.theme=refs.theme.value;applySettings()});refs.style.addEventListener("change",()=>{state.settings.style=refs.style.value;applySettings()});refs.large.addEventListener("change",()=>{state.settings.largeText=refs.large.checked;applySettings()});refs.sound.addEventListener("change",()=>{state.settings.sound=refs.sound.checked;applySettings()});refs.reset.addEventListener("click",()=>{state.settings={...window.CalculatorStorage.DEFAULT_SETTINGS};applySettings();toast("Configurações restauradas.")});
document.addEventListener("keydown",(e)=>{const k=e.key;if(/^\d$/.test(k)){e.preventDefault();insert(k);return}if(k==="."||k===","){e.preventDefault();insert(".");return}if("+-*/^%".includes(k)||k==="("||k===")"||k==="!"){e.preventDefault();insert(k);return}if(k==="Enter"||k==="="){e.preventDefault();calculate();return}if(k==="Backspace"){e.preventDefault();action("backspace");return}if(k==="Escape"||k.toLowerCase()==="c"){e.preventDefault();clearAll();return}if(k.toLowerCase()==="m"){e.preventDefault();state.memory+=Number(state.result)||0;render();return}if(k.toLowerCase()==="r"){e.preventDefault();state.expression=engine.formatResult(state.memory);render();return}if(k.toLowerCase()==="d"){e.preventDefault();state.memory=0;render()}});
render();
})();