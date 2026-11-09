import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'
interface Ctx { locale: Locale; setLocale: (l: Locale)=>void; t: (k: TranslationKey)=>string }
const LanguageContext = createContext<Ctx>({ locale:'en', setLocale:()=>{}, t:(k)=>k })
export function LanguageProvider({children}:{children:ReactNode}) {
  const [locale, setLocaleState] = useState<Locale>(()=> (localStorage.getItem('bookora-locale') as Locale) || 'en')
  const setLocale = (l: Locale)=>{ setLocaleState(l); localStorage.setItem('bookora-locale', l) }
  useEffect(()=>{ document.documentElement.lang = locale },[locale])
  const t = (k: TranslationKey)=> (translations[locale][k] as string) || (translations.en[k] as string) || k
  return <LanguageContext.Provider value={{locale,setLocale,t}}>{children}</LanguageContext.Provider>
}
export function useLanguage(){ return useContext(LanguageContext) }
export function LanguageSwitcher(){
  const {locale,setLocale}=useLanguage()
  return <div className="flex rounded-full border overflow-hidden text-xs font-semibold" role="group" aria-label="Language">
    <button onClick={()=>setLocale('en')} className={`px-2.5 py-1.5 ${locale==='en'?'bg-indigo-600 text-white':'bg-white text-slate-600'}`}>EN</button>
    <button onClick={()=>setLocale('bn')} className={`px-2.5 py-1.5 ${locale==='bn'?'bg-indigo-600 text-white':'bg-white text-slate-600'}`}>বাংলা</button>
  </div>
}
