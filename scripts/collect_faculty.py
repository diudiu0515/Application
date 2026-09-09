#!/usr/bin/env python3
"""Discover relevant faculty from official university pages.

Results are candidate evidence only and remain unverified in the application.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, json, re, ssl, time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
UA="ApplicationIntelligenceBot/1.0 (+https://github.com/diudiu0515/Application)"
HINTS=("faculty","people","directory","professor","academic-staff")
BLOCK=("admission","student","alumni","staff","news","event","course","login","giving")
NAME_BLOCK=("program","computer","science","research","committee","faculty","project","specialization","requirement","education","institute","center","university","school","department","about","online","load","more","people","advisory","expand","collapse","search","home page","personal page","personal website","phd advisor","machine learning","in memoriam","post docs","postdoc","postdoctoral","visiting scholar","emeriti","emeritus","tenure track","courtesy appointment","lab website","oski bear")
PROFILE_HINTS=("/people/","/faculty/","/profile/","/profiles/","/directory/","/staff/","/~")
URL_BLOCK=("admission","student","alumni","news","event","course","login","giving")
FOCUSED_DIRECTORY_HINTS=("robot","computer-vision","computer_vision","/vision","ivc/","rail.","rail/","ember-lab","ego-exo","multimodal","embodied")
STRONG_KEYWORDS=("multimodal","vision-language","vision language","multimodal llm","audio-visual","robot learning","embodied ai","embodied intelligence","human-robot interaction","video understanding","video qa","egocentric","ego-exo","first-person vision","temporal grounding","spatial reasoning","3d vision","human-object interaction")
ROLE_SUFFIX_RE=re.compile(r"\s+(?:(?:assistant|associate|adjunct|research|visiting|courtesy|emeritus|emerita|practice|clinical|teaching|part-time|senior|distinguished|wise|gabilan)\s+)*(?:professor|lecturer)\b.*$",re.I)
WEIGHTS={}
PRIMARY=set()
ADAPTERS={}
ROLE_RE=re.compile(r"\b(assistant professor|associate professor|professor|faculty|principal investigator)\b",re.I)
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]; self.text=[]; self.main_text=[]; self.href=None; self.anchor=[]; self.skip=0; self.main_depth=0
    def handle_starttag(self,tag,attrs):
        if tag=="main": self.main_depth+=1
        if tag in ("script","style","nav","header","footer","aside"): self.skip+=1
        if tag=="a": self.href=dict(attrs).get("href"); self.anchor=[]
    def handle_data(self,data):
        x=" ".join(data.split())
        if x and self.main_depth and not self.skip: self.main_text.append(x)
        if x and not self.skip: self.text.append(x)
        if self.href and x: self.anchor.append(x)
    def handle_endtag(self,tag):
        if tag=="a" and self.href:
            self.links.append((" ".join(self.anchor).strip(),self.href)); self.href=None; self.anchor=[]
        if tag=="main" and self.main_depth: self.main_depth-=1
        if tag in ("script","style","nav","header","footer","aside") and self.skip: self.skip-=1

def fetch(url):
    req=Request(url,headers={"User-Agent":UA,"Accept":"text/html"})
    with urlopen(req,timeout=18,context=ssl.create_default_context()) as r:
        if "html" not in r.headers.get("Content-Type",""): return ""
        return r.read(2_000_000).decode(r.headers.get_content_charset() or "utf-8","replace")
def parse(raw): p=Parser(); p.feed(raw); return p
def host(url): return urlparse(url).netloc.lower().removeprefix("www.")
def same(a,b): return host(a)==host(b) or host(a).endswith("."+host(b)) or host(b).endswith("."+host(a))
def link(base,href):
    if not href or href.startswith(("#","mailto:","tel:","javascript:")): return None
    url=urljoin(base,href).split("#")[0]
    return url if urlparse(url).scheme in ("http","https") else None

def extract_name(text):
    text=" ".join(text.split()).strip(" |,–—")
    text=re.sub(r"^(?:prof\.?|dr\.?)\s+", "", text, flags=re.I)
    match=ROLE_SUFFIX_RE.search(text)
    if match: text=text[:match.start()]
    return text if name_like(text) else None
def name_like(text):
    text=" ".join(text.split()).strip(" |,–—")
    words=text.split()
    if not 4<=len(text)<=45 or not 2<=len(words)<=5 or any(x in text.lower() for x in BLOCK+NAME_BLOCK): return False
    if any(c in text for c in ":/|+&"): return False
    return all(bool(re.match(r"^[A-Z][A-Za-zÀ-ÖØ-öø-ÿ.-]*$", w)) for w in words)
def sid(prefix,value): return prefix+hashlib.sha1(value.encode()).hexdigest()[:12]

def directory_urls(home,school=None):
    p=parse(fetch(home)); found=[]
    for label,href in p.links:
        url=link(home,href)
        if url and same(home,url):
            score=sum(x in (label+" "+url).lower() for x in HINTS)
            if score: found.append((score,url))
    guesses=[urljoin(home,x) for x in ("faculty/","people/faculty/","people/","directory/")]
    extras=ADAPTERS.get(school,{}).get("directories",[])
    return list(dict.fromkeys(extras+[x[1] for x in sorted(set(found),reverse=True)[:5]]+guesses+[home]))

def profile_urls(home,directory):
    p=parse(fetch(directory)); found={}
    for label,href in p.links:
        url=link(directory,href)
        candidate=extract_name(label)
        if url and (same(home,url) or same(directory,url)) and candidate and any(x in url.lower() for x in PROFILE_HINTS) and not any(x in url.lower() for x in URL_BLOCK):
            found.setdefault(url,candidate)
    return [(name,url) for url,name in found.items()][:140]

def assess(args):
    school,name,url,families=args
    try: page=parse(fetch(url)); text=" ".join(page.main_text or page.text).lower()
    except Exception: return None
    hits={family:[k for k in keys if k in text] for family,keys in families.items()}
    hits={family:keys for family,keys in hits.items() if keys}
    total=sum(map(len,hits.values()))
    if not any(family in PRIMARY for family in hits) or not ROLE_RE.search(text): return None
    keywords=sorted({k for keys in hits.values() for k in keys})
    if total<2 and not any(keyword in STRONG_KEYWORDS for keyword in keywords): return None
    weighted=sum(len(keys)*WEIGHTS.get(family,1) for family,keys in hits.items())
    return {"school":school,"name":name,"url":url,"families":hits,"keywords":keywords,"score":min(95,round(34+7*len(hits)+4*weighted))}

def collect_school(entry,families):
    school,home=entry; profiles={}; fallbacks={}; errors=[]
    for item in ADAPTERS.get(school,{}).get("profiles",[]):
        if isinstance(item,list) and len(item)==2:
            profiles[item[1]]=item[0]
            fallbacks[item[1]]={"name":item[0],"reason":"curated adapter profile"}
    try:
        for directory in directory_urls(home,school):
            try:
                for name,url in profile_urls(home,directory):
                    profiles.setdefault(url,name)
            except Exception as e: errors.append(f"{directory}: {type(e).__name__}")
    except Exception as e: errors.append(f"{home}: {type(e).__name__}")
    jobs=[(school,name,url,families) for url,name in profiles.items()]
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        found=[x for x in pool.map(assess,jobs) if x]
    live_urls={candidate["url"] for candidate in found}
    for url,meta in fallbacks.items():
        if url not in live_urls:
            found.append({"school":school,"name":meta["name"],"url":url,"families":{"manual_primary_verification":[meta["reason"]]},"keywords":["manual direction verification required"],"score":40,"collectionMode":"official_roster_fallback"})
    deduped={}
    for candidate in found:
        key=re.sub(r"[^a-z]","",candidate["name"].lower())
        if key not in deduped or candidate["score"]>deduped[key]["score"]:
            deduped[key]=candidate
    return school,home,list(deduped.values()),errors

def emit(results,path):
    now=datetime.now(timezone.utc).isoformat(); programs=[]; faculty=[]; sources=[]
    applicant_config=json.loads((ROOT/"config/applicant-context.json").read_text())
    default_applicant=applicant_config.get("default",{})
    school_applicants=applicant_config.get("schools",{})
    for rank,(school,home,found,_) in enumerate(results,1):
        pid=sid("auto-pr-",school)
        reputation=max(35,round(101-rank*1.2))
        direction_depth=min(100,35+len(found)*8)
        gpa_viability=min(88,30+rank*1.15)
        initial_priority=round(reputation*.20+direction_depth*.65+gpa_viability*.15)
        tier="Dream" if rank<=8 else "Reach" if rank<=22 else "Target" if rank<=38 else "Lower Risk"
        applicant={**default_applicant,**school_applicants.get(school,{})}
        if not applicant.get("mainlandApplicantSource"):
            applicant["mainlandApplicantSource"]=home
        programs.append({"id":pid,"school":school,"department":"Computer Science / related","program":"CS PhD","degree":"PhD","country":"United States","city":"","state":"","tier":tier,"applicationCycle":"2028 Fall","deadline":"2027-12-15","deadlineStatus":"planning_placeholder_needs_official_2028_recheck","fee":0,"gre":"Needs verification","toefl":"Needs verification","ielts":"Needs verification","funding":"Needs verification","model":"Needs verification","facultyCount":len(found),"priority":initial_priority,"status":"Researching","sourceId":sid("auto-src-",home),"rankingCustom":rank,"rankingYear":2026,"rankingSource":"User-defined Top 50 research set order; not an official ranking","admissionRisk":"extremely_high" if rank<=10 else "very_high" if rank<=30 else "high","gpaContext":"GPA 3.3: emphasize research output, advisor fit, references, and maintain portfolio breadth.","selectionBasis":"Initial priority weights discovered multimodal/robotics faculty depth 65%, custom rank proxy 20%, and GPA 3.3 portfolio viability 15%; human verification required.",**applicant})
        sources.append({"id":sid("auto-src-",home),"entity":school,"name":"Official CS department / faculty entry point","url":home,"type":"official_department","lastChecked":now[:10],"confidence":"high","status":"official_source_unverified_fields","claim":"Official entry point for recurring faculty discovery; individual 2028 program fields still require verification."})
        deduped={}
        for c in found:
            key=re.sub(r"[^a-z]","",c["name"].lower())
            if key not in deduped or c["score"]>deduped[key]["score"]: deduped[key]=c
        found=list(deduped.values())
        programs[-1]["facultyCount"]=len(found)
        for c in found:
            faculty.append({"id":sid("auto-f-",school+"|"+c["name"]),"name":c["name"],"programId":pid,"position":"Faculty candidate","interests":c["keywords"],"recruiting":"unknown","consideration":"not_reviewed","contact":"not_planned","completion":20,"tsinghua":0,"lastChecked":now[:10],"email":"","website":c["url"],"why":("Official research roster candidate: " if c.get("collectionMode")=="official_roster_fallback" else "Official-page keyword match: ")+", ".join(c["keywords"][:8]),"concerns":"Automated candidate only. Confirm advising eligibility, research and recruiting manually.","autoFamilies":c["families"],"discoveryScore":c["score"],"reviewStatus":"needs_review","discoveryActive":True,"collectionMode":c.get("collectionMode","official_directory_profile_keyword_match"),"roleBasis":"Profile link discovered from configured official university/department source."})
            sources.append({"id":sid("auto-src-",c["url"]),"entity":c["name"],"name":"Official university/faculty page","url":c["url"],"type":"official_candidate","lastChecked":now[:10],"confidence":"medium","status":"unverified","claim":"Automated keyword discovery; human review required."})
    details=[{"rank":i,"school":school,"candidates":len(found),"coverage":"covered" if found else "zero","errors":errors} for i,(school,_,found,errors) in enumerate(results,1)]
    payload={"generatedAt":now,"programs":programs,"faculty":faculty,"sources":sources,"report":{"schools":len(results),"candidates":len(faculty),"coveredSchools":sum(1 for row in details if row["candidates"]),"zeroSchools":sum(1 for row in details if not row["candidates"]),"details":details}}
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text("// Generated candidate evidence; human verification required.\nwindow.AUTO_DATA="+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
    return payload

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--limit-schools",type=int); ap.add_argument("--school"); ap.add_argument("--workers",type=int,default=4); args=ap.parse_args()
    targets=json.loads((ROOT/"config/top50-programs.json").read_text())["programs"]
    if args.school: targets=[x for x in targets if args.school.lower() in x[0].lower()]
    ADAPTERS.update(json.loads((ROOT/"config/faculty-adapters.json").read_text()))
    if args.limit_schools: targets=targets[:args.limit_schools]
    config=json.loads((ROOT/"config/research-directions.json").read_text()); families=config["families"]; WEIGHTS.update(config.get("strategy",{}).get("family_weights",{})); PRIMARY.update(config.get("strategy",{}).get("primary_families",[]))
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,args.workers)) as pool:
        for i,result in enumerate(pool.map(lambda item: collect_school(item,families),targets),1):
            results.append(result)
            print(f"[{i}/{len(targets)}] {result[0]} candidates={len(result[2])} errors={len(result[3])}",flush=True)
    payload=emit(results,ROOT/"data/generated-faculty.js")
    report={"generatedAt":payload["generatedAt"],**payload["report"]}
    (ROOT/"data/collection-report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(payload["report"]))
if __name__=="__main__": main()
