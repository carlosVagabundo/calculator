(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.CalculatorEngine=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const FUNCTIONS=new Set(["sqrt","cbrt","sin","cos","tan","asin","acos","atan","log","ln","abs","exp","floor","ceil"]);
const CONSTANTS={pi:Math.PI,e:Math.E};
const PRECEDENCE={"+":1,"-":1,"*":2,"/":2,"u+":3,"u-":3,"^":4,"!":5,"%":5};
const RIGHT_ASSOCIATIVE=new Set(["^","u+","u-"]);
function isNumberToken(token){return typeof token==="string"&&/^(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/.test(token);}
function isOperator(token){return token in PRECEDENCE;}
function isValueToken(token){return token===")"||token==="!"||token==="%"||token==="ans"||token in CONSTANTS||isNumberToken(token);}
function canStartValue(token){return token==="("||token==="ans"||token in CONSTANTS||FUNCTIONS.has(token)||isNumberToken(token);}
function addImplicitMultiplication(tokens){const out=[];for(const token of tokens){const prev=out.at(-1);if(prev&&isValueToken(prev)&&canStartValue(token))out.push("*");out.push(token);}return out;}
function tokenize(input){
 const text=String(input).replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-");
 const tokens=[];
 for(let i=0;i<text.length;){
  const c=text[i];
  if(/\s/.test(c)){i++;continue;}
  if(/\d|\./.test(c)){const m=text.slice(i).match(/^(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?/);if(!m)throw new Error("Número inválido");if(!Number.isFinite(Number(m[0])))throw new Error("Número inválido");tokens.push(m[0]);i+=m[0].length;continue;}
  if(/[A-Za-z]/.test(c)){const m=text.slice(i).match(/^[A-Za-z]+/);const word=m[0].toLowerCase();if(word!=="ans"&&!FUNCTIONS.has(word)&&!(word in CONSTANTS))throw new Error(`Função ou constante desconhecida: ${word}`);tokens.push(word);i+=m[0].length;continue;}
  if("+-*/^%()!".includes(c)){tokens.push(c);i++;continue;}
  throw new Error(`Caractere inválido: ${c}`);
 }
 return addImplicitMultiplication(tokens);
}
function shouldPop(current,top){if(current==="u+"||current==="u-")return false;if(RIGHT_ASSOCIATIVE.has(current))return PRECEDENCE[current]<PRECEDENCE[top];return PRECEDENCE[current]<=PRECEDENCE[top];}
function toRpn(tokens){
 const output=[],stack=[];let expectsValue=true;
 for(const token of addImplicitMultiplication(tokens)){
  if(isNumberToken(token)||token in CONSTANTS||token==="ans"){if(!expectsValue)throw new Error("Dois valores consecutivos");output.push(token==="ans"?token:(token in CONSTANTS?CONSTANTS[token]:Number(token)));expectsValue=false;continue;}
  if(FUNCTIONS.has(token)){if(!expectsValue)throw new Error("Função em posição inválida");stack.push(token);expectsValue=true;continue;}
  if(token==="("){if(!expectsValue)throw new Error("Multiplicação implícita ausente");stack.push(token);expectsValue=true;continue;}
  if(token===")"){if(expectsValue)throw new Error("Parênteses vazios ou expressão incompleta");while(stack.length&&stack.at(-1)!=="(")output.push(stack.pop());if(stack.pop()!=="(")throw new Error("Parênteses desbalanceados");if(FUNCTIONS.has(stack.at(-1)))output.push(stack.pop());expectsValue=false;continue;}
  if(token==="!"||token==="%"){if(expectsValue)throw new Error("Operador pós-fixo em posição inválida");output.push(token);expectsValue=false;continue;}
  if((token==="+"||token==="-")&&expectsValue){const unary=token==="+"?"u+":"u-";while(stack.length&&isOperator(stack.at(-1))&&shouldPop(unary,stack.at(-1)))output.push(stack.pop());stack.push(unary);expectsValue=true;continue;}
  if(isOperator(token)){if(expectsValue)throw new Error("Operador em posição inválida");while(stack.length&&isOperator(stack.at(-1))&&shouldPop(token,stack.at(-1)))output.push(stack.pop());stack.push(token);expectsValue=true;continue;}
  throw new Error("Token inválido");
 }
 if(!tokens.length||expectsValue)throw new Error("Expressão incompleta");
 while(stack.length){const token=stack.pop();if(token==="(")throw new Error("Parênteses desbalanceados");output.push(token);}
 return output;
}
function factorial(v){if(v<0||!Number.isInteger(v))throw new Error("Fatorial exige inteiro não negativo");if(v>170)throw new Error("Fatorial muito grande");let r=1;for(let i=2;i<=v;i++)r*=i;return r;}
function applyFunction(name,v,angleMode){
 switch(name){
  case "sqrt":if(v<0)throw new Error("Raiz de número negativo");return Math.sqrt(v);\n  case "cbrt":return Math.cbrt(v);
  case "sin":return Math.sin(angleMode==="DEG"?v*Math.PI/180:v);
  case "cos":return Math.cos(angleMode==="DEG"?v*Math.PI/180:v);
  case "tan":{const r=angleMode==="DEG"?v*Math.PI/180:v;if(Math.abs(Math.cos(r))<1e-12)throw new Error("Tangente indefinida");return Math.tan(r);}
  case "asin":{const r=Math.asin(v);if(Number.isNaN(r))throw new Error("asin exige valor entre -1 e 1");return angleMode==="DEG"?r*180/Math.PI:r;}
  case "acos":{const r=Math.acos(v);if(Number.isNaN(r))throw new Error("acos exige valor entre -1 e 1");return angleMode==="DEG"?r*180/Math.PI:r;}
  case "atan":{const r=Math.atan(v);return angleMode==="DEG"?r*180/Math.PI:r;}
  case "log":if(v<=0)throw new Error("Logaritmo exige valor positivo");return Math.log10(v);
  case "ln":if(v<=0)throw new Error("Logaritmo natural exige valor positivo");return Math.log(v);
  case "abs":return Math.abs(v);
  case "exp":return Math.exp(v);
  case "floor":return Math.floor(v);
  case "ceil":return Math.ceil(v);
  default:throw new Error("Função desconhecida");
 }
}
function evaluate(input,{angleMode="DEG",ans=0}={}){
 const stack=[];const safeAns=Number.isFinite(Number(ans))?Number(ans):0;
 for(const token of toRpn(Array.isArray(input)?input:tokenize(input))){
  if(typeof token==="number"){stack.push(token);continue;}
  if(token==="ans"){stack.push(safeAns);continue;}
  if(FUNCTIONS.has(token)){const v=stack.pop();if(v===undefined)throw new Error("Argumento ausente");const result=applyFunction(token,v,angleMode);if(!Number.isFinite(result))throw new Error("Resultado inválido");stack.push(result);continue;}
  if(token==="!"){const v=stack.pop();if(v===undefined)throw new Error("Valor ausente");stack.push(factorial(v));continue;}
  if(token==="%"){const v=stack.pop();if(v===undefined)throw new Error("Valor ausente");stack.push(v/100);continue;}
  if(token==="u+"||token==="u-"){const v=stack.pop();if(v===undefined)throw new Error("Valor ausente");stack.push(token==="u-"?-v:v);continue;}
  const right=stack.pop(),left=stack.pop();if(left===undefined||right===undefined)throw new Error("Expressão inválida");
  let result;
  switch(token){case "+":result=left+right;break;case "-":result=left-right;break;case "*":result=left*right;break;case "/":if(right===0)throw new Error("Divisão por zero");result=left/right;break;case "^":result=left**right;break;default:throw new Error(`Operador inválido: ${token}`);}
  if(!Number.isFinite(result))throw new Error("Resultado inválido");stack.push(result);
 }
 if(stack.length!==1||!Number.isFinite(stack[0]))throw new Error("Expressão inválida");
 return stack[0];
}
function formatResult(value){if(!Number.isFinite(value))return"Erro";const n=Number(Number(value).toPrecision(12));return Object.is(n,-0)?"0":String(n);}
return{tokenize,toRpn,evaluate,formatResult,FUNCTIONS,CONSTANTS};
});