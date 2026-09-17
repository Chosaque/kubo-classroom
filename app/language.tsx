'use client';
import {createContext,useContext,useEffect,useState,cloneElement,isValidElement,ReactNode} from 'react';
import {translate} from './thai.mjs';
type Language='en'|'th';
const Context=createContext<{language:Language;setLanguage:(l:Language)=>void}>({language:'en',setLanguage:()=>{}});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>('en');
 useEffect(()=>{try{if(localStorage.getItem('agentic-presentation-language')==='th')setLanguage('th');}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language;document.documentElement.dataset.language=language;document.title=language==='th'?'ห้องเรียน Agentic AI · Kubo':'Agentic AI · Kubo';try{localStorage.setItem('agentic-presentation-language',language);}catch{}window.dispatchEvent(new CustomEvent('presentation-language',{detail:language}));},[language]);
 return <Context.Provider value={{language,setLanguage}}>{children}</Context.Provider>;
}
function localize(node:ReactNode,language:Language):ReactNode{
 if(language==='en')return node;
 if(typeof node==='string')return translate(node,'th');
 if(Array.isArray(node)){
  const merged:ReactNode[]=[];let pending='';const flush=()=>{if(pending){merged.push(translate(pending,'th'));pending='';}};
  node.forEach(n=>{if(typeof n==='string'||typeof n==='number')pending+=n;else{flush();merged.push(localize(n,language));}});flush();return merged;
 }
 if(!isValidElement(node))return node;
 const p=node.props as any;if(p['data-original-language'])return node;
 const changes:any={};for(const key of ['title','aria-label','aria-description','aria-valuetext','placeholder','alt'])if(typeof p[key]==='string')changes[key]=translate(p[key],language);
 if(p.children!==undefined)changes.children=localize(p.children,language);
 return cloneElement(node,changes);
}
export function useLanguage(){const context=useContext(Context);return {...context,t:(text:string)=>translate(text,context.language),L:(node:ReactNode)=>localize(node,context.language)};}
export function LanguageSwitch(){const {language,setLanguage}=useLanguage();return <label className="language-switch"><span>Language / ภาษา</span><select aria-label="Language / ภาษา" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="en">English</option><option value="th">ไทย</option></select></label>;}
