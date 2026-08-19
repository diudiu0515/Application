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
NAME_BLOCK=("program","computer","science","research","committee","faculty","project","specialization","requirement","education","institute","center","university","school","department","about","online","load","more")
PROFILE_HINTS=("/people/","/faculty/","/profile/","/profiles/","/~")
WEIGHTS={}
PRIMARY=set()
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
def name_like(text):
    text=" ".join(text.split()).strip(" |,–—")
    words=text.split()
    if not 4<=len(text)<=45 or not 2<=len(words)<=5 or any(x in text.lower() for x in BLOCK+NAME_BLOCK): return False
    if any(c in text for c in ":/|+&"): return False
    return all(bool(re.match(r"^[A-Z][A-Za-zÀ-ÖØ-öø-ÿ.-]*$", w)) for w in words)
def sid(prefix,value): return prefix+hashlib.sha1(value.encode()).hexdigest()[:12]

def directory_urls(home):
    p=parse(fetch(home)); found=[]
    for label,href in p.links:
        url=link(home,href)
        if url and same(home,url):
            score=sum(x in (label+" "+url).lower() for x in HINTS)
            if score: found.append((score,url))
    guesses=[urljoin(home,x) for x in ("faculty/","people/faculty/","people/","directory/")]
    return list(dict.fromkeys([x[1] for x in sorted(set(found),reverse=True)[:5]]+guesses+[home]))

def profile_urls(home,directory):
    p=parse(fetch(directory)); found={}
    for label,href in p.links:
        url=link(directory,href)
        if url and same(home,url) and name_like(label) and any(x in url.lower() for x in PROFILE_HINTS) and not any(x in url.lower() for x in BLOCK):
            found.setdefault(url," ".join(label.split()))
    return [(name,url) for url,name in found.items()][:140]

def assess(args):
    school,name,url,families=args
    try: page=parse(fetch(url)); text=" ".join(page.main_text or page.text).lower()
    except Exception: return None
    hits={family:[k for k in keys if k in text] for family,keys in families.items()}
    hits={family:keys for family,keys in hits.items() if keys}
    total=sum(map(len,hits.values()))
    if total<2 or not any(family in PRIMARY for family in hits) or not ROLE_RE.search(text): return None
    keywords=sorted({k for keys in hits.values() for k in keys})
    weighted=sum(len(keys)*WEIGHTS.get(family,1) for family,keys in hits.items())
    return {"school":school,"name":name,"url":url,"families":hits,"keywords":keywords,"score":min(95,round(34+7*len(hits)+4*weighted))}

def collect_school(entry,families):
    school,home=entry; profiles={}; errors=[]
    try:
        for directory in directory_urls(home):
            try:
                for name,url in profile_urls(home,directory): profiles.setdefault(url,name)
            except Exception as e: errors.append(f"{directory}: {type(e).__name__}")
    except Exception as e: errors.append(f"{home}: {type(e).__name__}")
    jobs=[(school,name,url,families) for url,name in profiles.items()]
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        found=[x for x in pool.map(assess,jobs) if x]
    return school,home,found,errors

def emit(results,path):
    now=datetime.now(timezone.utc).isoformat(); programs=[]; faculty=[]; sources=[]
    for school,home,found,_ in results:
        pid=sid("auto-pr-",school)
        programs.append({"id":pid,"school":school,"department":"Computer Science / related","program":"CS PhD","city":"","state":"","tier":"Research set","deadline":"2027-12-15","fee":0,"gre":"Needs verification","toefl":"Needs verification","funding":"Needs verification","model":"Needs verification","facultyCount":len(found),"priority":0,"status":"Researching","sourceId":sid("auto-src-",home)})
        for c in found:
            faculty.append({"id":sid("auto-f-",school+"|"+c["name"]),"name":c["name"],"programId":pid,"position":"Faculty candidate","interests":c["keywords"],"recruiting":"unknown","consideration":"not_reviewed","contact":"not_planned","completion":20,"tsinghua":0,"lastChecked":now[:10],"email":"","website":c["url"],"why":"Official-page keyword match: "+", ".join(c["keywords"][:8]),"concerns":"Automated candidate only. Confirm advising eligibility, research and recruiting manually.","autoFamilies":c["families"],"discoveryScore":c["score"]})
            sources.append({"id":sid("auto-src-",c["url"]),"entity":c["name"],"name":"Official university/faculty page","url":c["url"],"type":"official_candidate","lastChecked":now[:10],"confidence":"medium","status":"unverified","claim":"Automated keyword discovery; human review required."})
    payload={"generatedAt":now,"programs":programs,"faculty":faculty,"sources":sources,"report":{"schools":len(results),"candidates":len(faculty)}}
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text("// Generated candidate evidence; human verification required.\nwindow.AUTO_DATA="+json.dumps(payload,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
    return payload

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--limit-schools",type=int); args=ap.parse_args()
    targets=json.loads((ROOT/"config/top50-programs.json").read_text())["programs"]
    if args.limit_schools: targets=targets[:args.limit_schools]
    config=json.loads((ROOT/"config/research-directions.json").read_text()); families=config["families"]; WEIGHTS.update(config.get("strategy",{}).get("family_weights",{})); PRIMARY.update(config.get("strategy",{}).get("primary_families",[]))
    results=[]
    for i,item in enumerate(targets,1):
        print(f"[{i}/{len(targets)}] {item[0]}",flush=True); results.append(collect_school(item,families)); print(f"  candidates={len(results[-1][2])} errors={len(results[-1][3])}",flush=True); time.sleep(.2)
    payload=emit(results,ROOT/"data/generated-faculty.js")
    report={"generatedAt":payload["generatedAt"],"schools":len(results),"candidates":len(payload["faculty"]),"details":[{"school":s,"candidates":len(f),"errors":e} for s,_,f,e in results]}
    (ROOT/"data/collection-report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(payload["report"]))
if __name__=="__main__": main()
