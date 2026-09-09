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
function node(){return {innerHTML:"",value:"",dataset:{},style:{},classList:{toggle:function(){}},append:function(){},appendChild:function(){},remove:function(){},click:function(){},addEventListener:function(){},querySelector:function(){return node()},querySelectorAll:function(){return []}}}
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
    for label in ("Top 50 collection coverage", "Research topic", "Any recruiting", "Any project match", "Workflow stage", "Quick checks"):
        assert label in faculty_html, f"faculty view missing {label}"
    before = context.eval("state.history.length")
    context.eval("persist('Smoke mutation','Test','history persistence')")
    assert context.eval("state.history.length") == before + 1
    assert context.eval("localStorage.getItem(STORAGE_KEY)!==null")
    assert context.eval("typeof openFacultyWorkspace") == "function"
    context.eval("openFacultyWorkspace(state.faculty[0].id)")
    print("runtime smoke passed")

if __name__ == "__main__":
    main()
