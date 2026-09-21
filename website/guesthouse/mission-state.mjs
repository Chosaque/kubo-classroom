// QI-01 follows the original three teaching beats; this is a classroom simulation.
export const records = [
 {id:'request',title:['คำขอคืนนี้','Tonight’s request'],source:['วันนี้ 19:00 · Luma ยืนยันเอง','Today, 19:00 · Confirmed by Luma'],body:['“เพิ่งกลับจากเที่ยวบินกลางคืน คืนนี้ขอห้องเงียบและแสงสลัว ขอเปลี่ยนจากห้องสว่างที่เคยพักครั้งก่อนนะ”','“I’ve just arrived after a night flight. Tonight I need quiet and dim lighting—a change from the bright room I had last time.”']},
 {id:'rooms',title:['ข้อมูลห้องที่ว่าง','Available rooms'],source:['วันนี้ 18:50 · แม่บ้านตรวจแล้ว','Today, 18:50 · Checked by housekeeping'],body:['101 — เงียบ · แสงสลัว\n102 — แสงสว่าง · วิวสวน\n103 — อากาศเย็น · วิวดาว','101 — Quiet · Dim lighting\n102 — Bright · Garden view\n103 — Cool · Star view']},
 {id:'old',title:['บันทึกการพักครั้งก่อน','Previous stay'],source:['ครั้งก่อน · เก็บไว้เป็นประวัติ','Previous visit · Kept in the archive'],body:['“Luma ขอห้อง 102 เพราะชอบแสงสว่าง”','“Luma requested room 102 for its bright lighting.”']},
 {id:'menu',title:['ประกาศร้านอาหาร','Café notice'],source:['วันนี้ · ร้านอาหารของโรงแรม','Today · Guesthouse café'],body:['คืนนี้มีซุปดาวหางกับขนมปังวงแหวน เริ่มเสิร์ฟ 20:00','Comet soup and Saturn rolls tonight. Dinner starts at 20:00.']}
];
export function createState(){return {step:0,answers:[null,null],cards:new Set(records.map(r=>r.id)),draft:null,verified:false,check:null,notesOpen:false,mapOpen:false,archiveOpen:false}}
export function assessCards(cards){
 if(!cards.has('request'))return {kind:'missing-request',ok:false};
 if(!cards.has('rooms'))return {kind:'missing-rooms',ok:false};
 if(cards.has('old')||cards.has('menu'))return {kind:'cleanup',ok:false,old:cards.has('old'),menu:cards.has('menu')};
 return {kind:'recommendation',ok:true,room:101};
}
export function answer(state,choice){if(state.step>1)return;state.answers[state.step]=choice}
export function canContinue(state){return state.step===0?state.answers[0]==='desk':state.step===1?state.answers[1]==='current':state.verified}
export function next(state){if(state.step<2&&canContinue(state)){state.step++;return true}return false}
export function toggleCard(state,id){if(state.step!==2||!records.some(r=>r.id===id))return;state.cards.has(id)?state.cards.delete(id):state.cards.add(id);state.draft=null;state.verified=false;state.check=null}
export function draft(state){if(state.step!==2)return;state.draft=assessCards(state.cards);state.verified=false;state.check=null}
export function verify(state,choice){if(!state.draft?.ok)return;state.check=choice;state.verified=choice==='both'}
