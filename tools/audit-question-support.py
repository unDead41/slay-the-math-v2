"""Read-only audit of the supplied bank; never rewrites authored question content."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'modules/mechanics/source/QUESTION_BANK/question-bank-form4-120.json'
b=json.loads(p.read_text());issues=[];locations=[]
def text(parts):return ''.join(x.get('text','') for x in parts)
def walk(x,path,id):
 if isinstance(x,dict):
  if x.get('type')=='term' and x.get('glossary_id')=='qb:common-denominator' and x.get('text','').lower() in ('denominator','denominators'):locations.append({'id':id,'field':path,'text':x['text']})
  for k,v in x.items():walk(v,path+'.'+k,id)
 elif isinstance(x,list):
  for i,v in enumerate(x):walk(v,path+f'[{i}]',id)
for q in b['questions']:
 for field in ['prompt','hint','moreHint','explanation']:
  for source in ['richText','mathText','themedRichText']:
   if text(q[source][field])!=q[field]:issues.append([q['id'],source,field])
 for x in q['hintSteps']:
  if text(q['themedRichText']['hintSteps'][x['id']])!=x['text']:issues.append([q['id'],'hintSteps',x['id']])
 for x in q['learning']['workedSteps']:
  if text(x['richText'])!=x['text']:issues.append([q['id'],'workedSteps',x['id']])
 walk(q['themedRichText'],'themedRichText',q['id']);walk(q['learning'],'learning',q['id'])
report={'bankVersion':b['bankVersion'],'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'items':len(b['questions']),'hintSteps':sum(len(q['hintSteps']) for q in b['questions']),'moreHints':len(b['questions']),'workedSteps':sum(len(q['learning']['workedSteps']) for q in b['questions']),'text_projection_mismatches':issues,'glossary_harmonization':{'term':'qb:common-denominator','issue':'Generic denominator(s) is linked to Common denominator even in multiplication; separate bottom-number meaning from the same-denominator method for addition/comparison.','example':'PROB-008 moreHint: multiply the numerators and denominators','locations':locations},'content_modified':False}
out=ROOT/'docs/verification/question-support-audit-2-12.json';out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='glossary_harmonization'},indent=2));print('Generic denominator locations:',len(locations),'item IDs:',sorted(set(x['id'] for x in locations)))
