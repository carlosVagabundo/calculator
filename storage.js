(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.CalculatorStorage=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const KEYS={history:"calculator.history.v4",favorites:"calculator.favorites.v4",settings:"calculator.settings.v4"};
const DEFAULT_SETTINGS={theme:"dark",style:"glass",angleMode:"DEG",largeText:false,sound:false};
function safeParse(storage,key,fallback){try{const parsed=JSON.parse(storage.getItem(key)||"null");return parsed===null?fallback:parsed;}catch{return fallback;}}
function createStorage(storage){const adapter=storage||(typeof localStorage!=="undefined"?localStorage:null);const read=(key,fallback)=>adapter?safeParse(adapter,key,fallback):fallback;const write=(key,value)=>{if(!adapter)return;try{adapter.setItem(key,JSON.stringify(value));}catch{}};return{
loadHistory(){const v=read(KEYS.history,[]);return Array.isArray(v)?v:[]},saveHistory(v){write(KEYS.history,v)},
loadFavorites(){const v=read(KEYS.favorites,[]);return Array.isArray(v)?v:[]},saveFavorites(v){write(KEYS.favorites,v)},
loadSettings(){const v=read(KEYS.settings,{});return{...DEFAULT_SETTINGS,...(v&&typeof v==="object"?v:{})}},saveSettings(v){write(KEYS.settings,{...DEFAULT_SETTINGS,...v})},
clearHistory(){if(!adapter)return;try{adapter.removeItem(KEYS.history)}catch{}}
};}
return{createStorage,DEFAULT_SETTINGS,KEYS};
});