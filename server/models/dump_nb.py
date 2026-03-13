import json

with open("densenet201-covidqu-ex.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

with open("dumped_code.py", "w", encoding="utf-8") as out:
    for cell in nb.get("cells", []):
        if cell.get("cell_type") == "code":
            out.write("".join(cell.get("source", [])))
            out.write("\n\n")
