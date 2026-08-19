"""Parse and render every static application view with QuickJS."""
from pathlib import Path
import quickjs

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ["data/generated-faculty.js", "seed.js", "summer-data.js", "modules-data.js", "modules.js", "faculty-review.js", "data-tools.js", "application-workspace.js", "evidence.js", "calendar-workspace.js", "app.js"]
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
var confirm=function(){return true}; var alert=function(){}; var Blob=function(){};
var URL={createObjectURL:function(){return "blob:"},revokeObjectURL:function(){}};
var FileReader=function(){};
"""

def main():
    context = quickjs.Context()
    context.eval(PRELUDE)
    for relative in SCRIPTS:
        context.eval((ROOT / relative).read_text(encoding="utf-8"))
    for view in VIEWS:
        context.eval(f"currentView={view!r}")
        length = context.eval("renderView().length")
        assert length > 100, f"{view} produced an empty view"
        print(f"{view}: {length} chars")
    assert context.eval("state.meta.schemaVersion") == 3
    print("runtime smoke passed")

if __name__ == "__main__":
    main()
