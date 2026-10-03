#!/usr/bin/env python3
import csv, io, json, re, sys, zipfile
from pathlib import Path
from datetime import datetime, timezone

if len(sys.argv) < 3:
    raise SystemExit("Uso: python3 tools/import_tse.py consulta_cand_2026.zip data")

zip_path=Path(sys.argv[1]); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)

def norm(s):
    import unicodedata
    s=unicodedata.normalize("NFKD", str(s or "")).encode("ascii","ignore").decode().upper()
    return re.sub(r"\s+"," ",s).strip()

cargo_map={
 "DEPUTADO FEDERAL":"DEPUTADO FEDERAL","DEPUTADO ESTADUAL":"DEPUTADO ESTADUAL",
 "DEPUTADO DISTRITAL":"DEPUTADO DISTRITAL","SENADOR":"SENADOR",
 "GOVERNADOR":"GOVERNADOR","PRESIDENTE":"PRESIDENTE"
}
byuf={}
parties={}

with zipfile.ZipFile(zip_path) as z:
    csvs=[n for n in z.namelist() if n.lower().endswith(".csv") and "consulta_cand" in n.lower()]
    if not csvs: csvs=[n for n in z.namelist() if n.lower().endswith(".csv")]
    for name in csvs:
        raw=z.read(name)
        text=raw.decode("latin-1",errors="replace")
        rd=csv.DictReader(io.StringIO(text),delimiter=";")
        for r in rd:
            cargo=cargo_map.get(norm(r.get("DS_CARGO")))
            if not cargo: continue
            uf=(r.get("SG_UF") or "").strip().upper()
            if cargo=="PRESIDENTE": uf="BR"
            if not uf: continue
            numero=str(r.get("NR_CANDIDATO") or "").strip()
            nome=(r.get("NM_URNA_CANDIDATO") or r.get("NM_CANDIDATO") or "").strip()
            sigla=(r.get("SG_PARTIDO") or "").strip()
            nrpart=str(r.get("NR_PARTIDO") or numero[:2]).strip()
            situacao=(r.get("DS_SITUACAO_CANDIDATURA") or r.get("DS_SITUACAO_CANDIDATO_URNA") or "").strip()
            cid=str(r.get("SQ_CANDIDATO") or f"{uf}-{cargo}-{numero}")
            if not numero or not nome: continue
            c={"id":cid,"uf":uf,"cargo":cargo,"numero":numero,"nomeUrna":nome,"partido":sigla,
               "numeroPartido":nrpart,"situacao":situacao,"foto":None}
            byuf.setdefault(uf,[]).append(c)
            if nrpart:
                parties[(uf,nrpart)]={"numero":nrpart,"sigla":sigla}

generated=datetime.now(timezone.utc).isoformat()
for uf,cs in byuf.items():
    # De-duplicate because the national ZIP may contain multiple extraction files.
    uniq={ (c["id"],c["cargo"]):c for c in cs }
    ps={}
    for (puf,nr),p in parties.items():
        if puf in (uf,"BR"): ps[nr]=p
    payload={"source":"TSE Dados Abertos - Candidatos 2026","generatedAt":generated,
             "uf":uf,"candidates":list(uniq.values()),"parties":list(ps.values())}
    (out/f"{uf}.json").write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print(f"Gerados {len(byuf)} arquivos JSON em {out}")
