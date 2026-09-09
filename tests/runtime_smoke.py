"""Parse and render every static application view with QuickJS."""
from pathlib import Path
import json
import re
import quickjs

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ["data/generated-faculty.js", "seed.js", "summer-data.js", "modules-data.js", "modules.js", "faculty-review.js", "data-tools.js", "candidate-workspace.js", "application-workspace.js", "evidence.js", "summer-workspace.js", "calendar-workspace.js", "fit-workspace.js", "decision-tools.js", "search-tools.js", "program-workspace.js", "shortlist-workspace.js", "materials-workspace.js", "intelligence-workspace.js", "faculty-operations.js", "faculty-detail-workspace.js", "requirements-completion.js", "app.js"]
VIEWS = [
    "dashboard", "programs", "faculty", "matrix", "research", "papers",
    "publications", "sop", "recommendations", "contact_workspace", "tests",
    "cv", "applications", "shortlist", "summer", "calendar", "costs",
    "sources", "labnetwork", "community", "faculty_timeline", "interviews",
    "offers", "notes", "history", "settings",
]

PRELUDE = r"""
var window=globalThis;
var Intl={DateTimeFormat:function(){return {format:function(x){return String(x)}}}};
var localStorage={data:{},getItem:function(k){return this.data[k]||null},setItem:function(k,v){this.data[k]=v}};
var appended=[];
function node(){return {innerHTML:"",value:"",dataset:{},style:{},classList:{toggle:function(){}},append:function(x){appended.push(x)},appendChild:function(x){appended.push(x)},remove:function(){},click:function(){},addEventListener:function(){},querySelector:function(){return node()},querySelectorAll:function(){return []}}}
var document={documentElement:{dataset:{}},body:node(),getElementById:function(){return node()},querySelector:function(){return node()},querySelectorAll:function(){return []},createElement:function(){return node()}};
var confirm=function(){return true}; var alert=function(){}; var Blob=function(){}; var setTimeout=function(){return 1};
var URL={createObjectURL:function(){return "blob:"},revokeObjectURL:function(){}};
var FileReader=function(){};
"""

def main():
    matrix = (ROOT / "docs/REQUIREMENTS_MATRIX.md").read_text(encoding="utf-8")
    module_numbers = [int(x) for x in re.findall(r"^\|\s*(\d+)\s*\|", matrix, re.M)]
    assert module_numbers == list(range(1, 49)), "requirements matrix must cover modules 1-48 exactly"
    generated = (ROOT / "data/generated-faculty.js").read_text(encoding="utf-8")
    payload = json.loads(generated.split("window.AUTO_DATA=", 1)[1].rsplit(";", 1)[0])
    program_ids = {row["id"] for row in payload["programs"]}
    assert len(program_ids) == 50
    assert len({row["id"] for row in payload["faculty"]}) == len(payload["faculty"]), "duplicate faculty id"
    assert {row["programId"] for row in payload["faculty"]} == program_ids, "every Top 50 school needs candidates"
    assert all(row["reviewStatus"] == "needs_review" for row in payload["faculty"]), "automation must not confirm faculty"
    assert all(row.get("mainlandApplicantStatus") for row in payload["programs"]), "all Top 50 programs need applicant context"
    assert all(row.get("mainlandApplicantSource", "").startswith("http") for row in payload["programs"]), "all applicant contexts need an official entry point"
    mit = next(row for row in payload["programs"] if row["school"] == "Massachusetts Institute of Technology")
    assert mit["mainlandApplicantStatus"] == "international_applicants_supported"
    assert mit["mainlandVerification"] == "official_current_general_policy"
    forbidden = {"post docs", "visiting scholars", "professors emeriti", "postdoctoral fellows", "tenure track", "courtesy appointments", "rudin lab website", "oski bear"}
    assert not forbidden.intersection(row["name"].lower() for row in payload["faculty"]), "non-faculty roster label leaked into candidates"
    context = quickjs.Context()
    context.eval(PRELUDE)
    for relative in SCRIPTS:
        context.eval((ROOT / relative).read_text(encoding="utf-8"))
    for view in VIEWS:
        context.eval(f"currentView={view!r}")
        length = context.eval("renderView().length")
        assert length > 100, f"{view} produced an empty view"
        print(f"{view}: {length} chars")
    assert context.eval("state.meta.schemaVersion") == 5
    assert context.eval("AUTO_DATA.programs.length") == 50
    assert context.eval("AUTO_DATA.report.schools") == 50
    assert context.eval("AUTO_DATA.report.details.length") == 50
    assert context.eval("AUTO_DATA.report.coveredSchools") == 50
    assert context.eval("AUTO_DATA.report.zeroSchools") == 0
    context.eval("currentView='dashboard'")
    dashboard_html = context.eval("renderView()")
    for label in ("Total Programs", "Target Programs", "Faculty Tracked", "High-Fit Faculty", "Applications Planned", "Applications Submitted", "Professor Contacts", "Replies", "Interviews", "Offers", "Earliest Deadline", "Days Remaining", "Next Deadline", "Faculty Research Queue"):
        assert label in dashboard_html, f"dashboard missing {label}"
    context.eval("currentView='faculty'")
    faculty_html = context.eval("renderView()")
    for label in ("Top 50 collection coverage", "Research topic", "Any recruiting", "Any mainland/international policy", "Any summer route", "Mainland / Intl", "Summer", "Workflow stage", "Quick checks"):
        assert label in faculty_html, f"faculty view missing {label}"
    before = context.eval("state.history.length")
    context.eval("persist('Smoke mutation','Test','history persistence')")
    assert context.eval("state.history.length") == before + 1
    assert context.eval("localStorage.getItem(STORAGE_KEY)!==null")
    assert context.eval("state.summerResearch.length") >= 12
    assert context.eval("state.summerResearch.some(function(x){return x.school==='University of Chicago'&&x.internationalStatus==='eligible'})")
    assert context.eval("state.summerResearch.some(function(x){return x.school==='California Institute of Technology'&&x.internationalStatus==='eligible'})")
    assert context.eval("state.programs.filter(function(x){return x.school==='Massachusetts Institute of Technology'}).every(function(x){return x.mainlandApplicantStatus==='international_applicants_supported'})")
    assert context.eval("(function(){var s=clone(state),p=s.programs.find(function(x){return x.school==='Massachusetts Institute of Technology'});p.applicantContextOverride=true;p.mainlandApplicantNotes='my verified note';mergeAuto(s);return p.mainlandApplicantNotes==='my verified note'})()")
    assert context.eval("(function(){var s=clone(state),x=s.summerResearch.find(function(y){return y.id==='sr12'});s.meta.summerStrategyVersion=2;x.updatedAt='2026-09-09T00:00:00Z';x.notes='my summer note';mergeAuto(s);return s.summerResearch.find(function(y){return y.id==='sr12'}).notes==='my summer note'})()")
    assert 'data-fdetail=' in faculty_html
    detail_source = (ROOT / "faculty-detail-workspace.js").read_text(encoding="utf-8")
    for label in ("Mainland China Applicant & Summer Research", "Public China / Tsinghua lab evidence", "Names are never used to infer nationality"):
        assert label in detail_source, f"faculty detail missing {label}"
    assert context.eval("typeof openFacultyWorkspace") == "function"
    context.eval("var testedProgram=state.programs.find(function(x){return x.school===\'Massachusetts Institute of Technology\'&&x.mainlandApplicantSource}); var testedFaculty=state.faculty.find(function(x){return x.programId===testedProgram.id}); openFacultyWorkspace(testedFaculty.id)")
    detail_html = context.eval("appended[appended.length-1].innerHTML")
    for label in ("Mainland China Applicant & Summer Research", "Official admissions source", "Summer routes at this school", "No publicly confirmed record yet"):
        assert label in detail_html, f"opened faculty modal missing {label}"
    print("runtime smoke passed")

if __name__ == "__main__":
    main()
