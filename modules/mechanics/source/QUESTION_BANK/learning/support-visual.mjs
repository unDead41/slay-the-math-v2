/** Hint 1 shows actual values, following the user's 22 October instruction.
 * Keep the authored method, but leave final answer highlighting to the solution.
 */
export function selectSupportVisual(question) {
  const hint=question.learning.visual.hint,solution=question.learning.visual.solution;
  if(!['table','venn'].includes(hint.kind))return hint;
  const venn=hint.kind==='venn';
  const text=value=>typeof value==='object'?value.text:value;
  const cell=value=>text(value)==='?'?'Not given':typeof value==='object'?{text:value.text}:value;
  const columns=venn?2:solution.headers.length;
  const caption=venn?
    'Each region shows its elements or count. ∅ means no elements. Not given means the question does not specify that value. Region areas do not represent their counts.':
    'Read the row and column labels together. Use these values with the method in the Hint.';
  return {...solution,reference:true,
    title:venn?'Values in each set region':hint.title==='Build the ordered-outcome grid'?'Ordered outcomes':'Values for this question',
    headers:solution.headers.slice(0,columns),headerRichText:solution.headerRichText.slice(0,columns),
    rows:solution.rows.map(row=>row.slice(0,columns).map(cell)),
    rowRichText:solution.rowRichText.map((row,r)=>row.slice(0,columns).map((runs,c)=>text(solution.rows[r][c])==='?'?[{type:'text',text:'Not given'}]:runs)),
    ...(venn?{regions:solution.regions.map(region=>({...region,selected:false,text:region.text==='?'?'Not given':region.text}))}:{}),
    caption,captionRichText:[{type:'text',text:caption}]};
}
