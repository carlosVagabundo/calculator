(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.CalculatorStorage=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const KEYS={history:"calculator.history.v5",favorites:"calculator.favorites.v5",settings:"calculator.settings.v5"};
const LEGACY={history:"calculator.history.v4",favorites:"calculator.favorites.v4",settings:"calculator.settings.v4"};
const DEFAULT_SETTINGS={theme:"dark",style:"glass",angleMode:"DEG",largeText:false,sound:false,animations:true};
const MAX_HISTORY=100,MAX_FAVORITES=50;
function safeParse(storage,key,fallback){try{const parsed=JSON.parse(storage.getItem(key)||"null");return parsed===null?fallback:parsed;}catch{return fallback;}}
function cleanRecord(x){return x&&typeof x==="object"&&typeof x.expression==="string"&&typeof x.result==="string"?{id:String(x.id||Date.now()),expression:x.expression,result:x.result,timestamp:Number(x.timestamp)||Date.now(),angleMode:x.angleMode==="RAD"?"RAD":"DEG"}:null;}
function cleanList(v,max){return Array.isArray(v)?v.map(cleanRecord).filter(Boolean).slice(0,max):[];}
function createStorage(storage){const adapter=storage||(typeof localStorage!=="undefined"?localStorage:null);
 const read=(key,legacy,fallback)=>{if(!adapter)return fallback;const direct=safeParse(adapter,key,null);if(direct!==null)return direct;return legacy?safeParse(adapter,legacy,fallback):fallback};
 const write=(key,value)=>{if(!adapter)return;try{adapter.setItem(key,JSON.stringify(value))}catch{}};
 return{
  loadHistory(){return cleanList(read(KEYS.history,LEGACY.history,[]),MAX_HISTORY)},
  saveHistory(v){write(KEYS.history,cleanList(v,MAX_HISTORY))},
  loadFavorites(){return cleanList(read(KEYS.favorites,LEGACY.favorites,[]),MAX_FAVORITES)},
  saveFavorites(v){write(KEYS.favorites,cleanList(v,MAX_FAVORITES))},
  loadSettings(){const v=read(KEYS.settings,LEGACY.settings,{});return{...DEFAULT_SETTINGS,...(v&&typeof v==="object"?v:{})}},
  saveSettings(v){write(KEYS.settings,{...DEFAULT_SETTINGS,...v})},
  clearHistory(){if(!adapter)return;try{adapter.removeItem(KEYS.history);adapter.removeItem(LEGACY.history)}catch{}},
  snapshot(){return{history:this.loadHistory(),favorites:this.loadFavorites(),settings:this.loadSettings()}},
  importSnapshot(data){if(!data||typeof data!=="object")throw new Error("Arquivo de dados inválido");this.saveHistory(data.history);this.saveFavorites(data.favorites);this.saveSettings(data.settings);return this.snapshot()}
 };
}
return{createStorage,DEFAULT_SETTINGS,KEYS,MAX_HISTORY,MAX_FAVORITES};
});