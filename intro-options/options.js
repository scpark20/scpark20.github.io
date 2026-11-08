'use strict';
const ui = {
  ko: { homepage:'홈페이지 ↗',eyebrow:'BIOGRAPHY EXPLORER',heading:'같은 이력, 열 가지 소개.',lead:'최근 활동부터 과거로. 중심 활동에 따라 유튜브·강의·커뮤니티까지 연결한 10가지 소개문입니다.',recommendations:'먼저 읽어 볼 추천안',rec1:'홈페이지 기본 소개',rec2:'연구직·연구 협업',rec9:'게임·콘텐츠 AI',single:'한 안씩 보기',compare:'나란히 비교',all:'전체 10안',draftNote:'비교용 초안 · 현재 소개문은 유지됩니다.',selectVersion:'소개문 선택',leftVersion:'왼쪽 소개문',rightVersion:'오른쪽 소개문',original:'현재 홈페이지 소개문 보기',footer:'제공된 이력과 현재 홈페이지 내용을 바탕으로 작성한 소개문 제안입니다.',copy:'소개문 복사',copied:'소개문을 복사했습니다.',copyError:'복사하지 못했습니다. 소개문을 선택해 복사해 주세요.',recommendation:'이 안을 추천하는 이유',sources:'반영한 이력',version:'제안',chars:'자',words:'단어',error:'소개문을 불러오지 못했습니다. 페이지를 새로고침해 주세요.' },
  en: { homepage:'Homepage ↗',eyebrow:'BIOGRAPHY EXPLORER',heading:'One career. Ten introductions.',lead:'From recent work to earlier experience. Ten perspectives connecting research, industry, YouTube, teaching and community.',recommendations:'Recommended starting points',rec1:'Main homepage biography',rec2:'Research & collaboration',rec9:'Games & content AI',single:'One at a time',compare:'Side by side',all:'All 10 drafts',draftNote:'Drafts for comparison · Your current biography is unchanged.',selectVersion:'Select a draft',leftVersion:'Left draft',rightVersion:'Right draft',original:'Read the current homepage biography',footer:'Biography proposals based on the supplied résumé and current homepage.',copy:'Copy biography',copied:'Biography copied.',copyError:'Could not copy. Please select and copy the biography text.',recommendation:'Why choose this version',sources:'Experience included',version:'Version',chars:'characters',words:'words',error:'The drafts could not be loaded. Please refresh the page.' }
};
const params=new URLSearchParams(location.hash.slice(1));
const state={lang:params.get('lang')==='en'?'en':'ko',selected:Math.min(10,Math.max(1,parseInt(params.get('option'),10)||1)),view:['single','compare','all'].includes(params.get('view'))?params.get('view'):'single',left:1,right:9};
let content, toastTimer;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=key=>ui[state.lang][key];
function rich(text,highlights=[],seen=new Set()) {
  const terms=[...new Set(['Soochul Park','박수철',...highlights])].sort((a,b)=>b.length-a.length);
  const regex=new RegExp(terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  let result='',last=0;
  for(const match of text.matchAll(regex)) {
    result+=esc(text.slice(last,match.index));
    const name=match[0]==='Soochul Park'||match[0]==='박수철';
    result+=name?`<strong>${esc(match[0])}</strong>`:seen.has(match[0])?esc(match[0]):`<span class="keyword">${esc(match[0])}</span>`;
    seen.add(match[0]);last=match.index+match[0].length;
  }
  return result+esc(text.slice(last));
}
function proposal(option) {
  const lang=state.lang, paragraphs=option.paragraphs[lang], plain=paragraphs.join('\n\n'), seen=new Set();
  const length=lang==='ko'?`${plain.replace(/\s/g,'').length} ${tr('chars')} · 공백 제외`:`${plain.trim().split(/\s+/).length} ${tr('words')}`;
  return `<article class="proposal" data-option="${option.id}"><header class="proposal-head"><p class="proposal-label">${tr('version')} ${option.id}</p><h2>${esc(option.title[lang])}</h2><p class="proposal-focus">${esc(option.focus[lang])}</p></header><div class="bio-copy">${paragraphs.map(p=>`<p>${rich(p,option.highlights[lang],seen)}</p>`).join('')}</div><div class="proposal-toolbar"><button class="copy-button" type="button" data-copy="${option.id}">${tr('copy')}</button><span class="length">${length}</span></div><aside class="editor-note"><h3>${tr('recommendation')}</h3><p class="use">${esc(option.use[lang])}</p><p class="reason">${esc(option.reason[lang])}</p><details class="sources"><summary>${tr('sources')}</summary><div class="source-links">${option.sources.map(key=>{const s=content.sources[key];return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s[lang])} ↗</a>`;}).join('')}</div></details></aside></article>`;
}
function render() {
  document.documentElement.lang=state.lang;
  document.title=state.lang==='ko'?'소개문 10가지 제안 · Soochul Park':'Ten biography proposals · Soochul Park';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));
  document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===state.lang)));
  document.querySelectorAll('[data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.view===state.view)));
  document.querySelector('.view-switch').setAttribute('aria-label',state.lang==='ko'?'보기 방식':'View');
  document.querySelector('.skip').textContent=state.lang==='ko'?'소개문으로 이동':'Skip to biographies';
  const nav=document.querySelector('#options-nav');nav.setAttribute('aria-label',tr('selectVersion'));
  nav.innerHTML=content.options.map(o=>`<button type="button" class="option-link" data-pick="${o.id}" aria-current="${o.id===state.selected}"><span class="nav-number">${o.id}</span><span class="nav-title">${esc(o.title[state.lang])}<span class="nav-focus">${esc(o.focus[state.lang])}</span></span></button>`).join('');
  const options=content.options.map(o=>`<option value="${o.id}">${o.id}. ${esc(o.title[state.lang])}</option>`).join('');
  [['mobile-option','selected'],['compare-left','left'],['compare-right','right']].forEach(([id,key])=>{const el=document.getElementById(id);el.innerHTML=options;el.value=state[key];});
  ['single','compare','all'].forEach(v=>document.getElementById(v+'-view').hidden=state.view!==v);
  document.getElementById('selected-option').innerHTML=proposal(content.options[state.selected-1]);
  document.getElementById('comparison').innerHTML=[state.left,state.right].map(id=>proposal(content.options[id-1])).join('');
  document.getElementById('all-view').innerHTML=state.view==='all'?content.options.map(proposal).join(''):'';
  document.getElementById('original-text').innerHTML=rich(content.original[state.lang]);
  history.replaceState(null,'','#'+new URLSearchParams({option:state.selected,view:state.view,lang:state.lang}));
}
function notify(message) {const el=document.getElementById('status');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600);}
async function copy(id,button) {
  const text=content.options[id-1].paragraphs[state.lang].join('\n\n');
  try {
    try {await navigator.clipboard.writeText(text);} catch {
      const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();
      let copied;try {copied=document.execCommand('copy');} finally {area.remove();button.focus();}
      if(!copied)throw new Error('Copy unavailable');
    }
    notify(tr('copied'));
  } catch {notify(tr('copyError'));}
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!content)return;
  if(button.dataset.copy){copy(Number(button.dataset.copy),button);return;}
  if(button.dataset.lang){state.lang=button.dataset.lang;render();return;}
  if(button.dataset.view){state.view=button.dataset.view;render();return;}
  if(button.dataset.pick){state.selected=Number(button.dataset.pick);state.view='single';const fromRecommendation=!!button.closest('.recommendations');render();if(fromRecommendation)document.getElementById('reading').scrollIntoView({behavior:'auto',block:'start'});else document.querySelector(`#options-nav [data-pick="${state.selected}"]`).focus({preventScroll:true});}
});
document.addEventListener('change',event=>{const key={'mobile-option':'selected','compare-left':'left','compare-right':'right'}[event.target.id];if(key){state[key]=Number(event.target.value);render();document.getElementById(event.target.id).focus({preventScroll:true});}});
fetch('content.json?v=4').then(response=>{if(!response.ok)throw new Error('Content unavailable');return response.json();}).then(data=>{content=data;render();}).catch(()=>{document.getElementById('reading').innerHTML=`<p class="error" role="alert">${tr('error')}</p>`;});
