export const EXPRESSIONS=['auto','angry','tired','sad','motivated'];
export function faceWeight(key,expression,automatic,blink=0){
 if(key==='Blink')return blink;
 if(expression==='auto')return automatic;
 return key===expression[0].toUpperCase()+expression.slice(1)?1-blink:0;
}
