// Synthetic teaching records, not a prediction of model accuracy.
export const QUESTION=['In October 2025, which department had the highest infection rate, and what was it?','เดือน ต.ค. 2568 หน่วยงานไหนมีอัตราการติดเชื้อสูงสุด และเท่าไร'];
export const KPI_CARDS=[
 {id:'definition',cost:1,tokens:120,title:['Definition and formula','นิยามและสูตรคำนวณ'],text:['Infection rate = infections ÷ patients × 100. Compare rates, not counts.','อัตราการติดเชื้อ = จำนวนผู้ติดเชื้อ ÷ จำนวนผู้ป่วย × 100 เปรียบเทียบอัตรา ไม่ใช่จำนวน'],kind:'useful'},
 {id:'current',cost:2,tokens:260,title:['October 2025 KPI data','ข้อมูล KPI เดือน ต.ค. 2568'],text:['Synthetic records: Ward A 4/200; Ward B 3/100; Ward C 5/250.','ข้อมูลสมมติ: หอผู้ป่วย A 4/200; หอผู้ป่วย B 3/100; หอผู้ป่วย C 5/250'],kind:'useful'},
 {id:'template',cost:1,tokens:90,title:['Report template','แบบฟอร์มรายงาน'],text:['State the department, month and percentage in one sentence.','ระบุหน่วยงาน เดือน และร้อยละ ในประโยคเดียว'],kind:'useful'},
 {id:'rules',cost:1,tokens:70,title:['Patient data rules','กฎการใช้ข้อมูลผู้ป่วย'],text:['Use department totals only. Never include patient identifiers.','ใช้เฉพาะยอดรวมของหน่วยงาน ไม่ใส่ข้อมูลระบุตัวผู้ป่วย'],kind:'useful'},
 {id:'mail',cost:1,tokens:60,title:['Annual party email','อีเมลงานเลี้ยงประจำปี'],text:['The staff party starts at 18:00 on Friday.','งานเลี้ยงเจ้าหน้าที่เริ่มวันศุกร์ เวลา 18:00'],kind:'irrelevant'},
 {id:'oldchat',cost:2,tokens:180,title:['An old conversation','บทสนทนาเก่า'],text:['An unverified earlier conversation mentioned Ward C at 6%.','บทสนทนาเก่าที่ยังไม่ตรวจสอบเคยกล่าวว่าหอผู้ป่วย C มีอัตรา 6%'],kind:'outdated'},
 {id:'parking',cost:1,tokens:110,title:['Parking manual','คู่มือจองที่จอดรถ'],text:['Book a visitor parking space using the parking form.','จองที่จอดรถสำหรับผู้มาติดต่อผ่านแบบฟอร์ม'],kind:'irrelevant'},
 {id:'oldyear',cost:2,tokens:200,title:['2023 KPI report','รายงาน KPI ปี 2566'],text:['Historical synthetic result: Ward A had the highest rate at 5%.','ผลสมมติในอดีต: หอผู้ป่วย A มีอัตราสูงสุดที่ 5%'],kind:'outdated'},
];
export function evaluateKpi(ids){
 const noise=KPI_CARDS.filter(c=>ids.includes(c.id)&&c.kind!=='useful').length;
 if(!ids.includes('current'))return {state:'missing',answer:['I need the October 2025 data to answer.','ผมต้องใช้ข้อมูลเดือน ต.ค. 2568 เพื่อตอบคำถามนี้'],why:['Add the current month’s records.','เพิ่มข้อมูลของเดือนที่ถาม']};
 if(noise>=3)return {state:'overloaded',answer:ids.includes('oldyear')?['I mixed in old records and picked Ward A at 5%. That is the wrong year.','ผมนำข้อมูลเก่ามาปน แล้วเลือกหอผู้ป่วย A ที่ 5% ซึ่งเป็นข้อมูลผิดปี']:['I picked Ward C at 6% from the old conversation. That is not the current month’s result.','ผมเลือกหอผู้ป่วย C ที่ 6% จากบทสนทนาเก่า ซึ่งไม่ใช่ผลของเดือนที่ถาม'],why:['The correct data is still here, but this simulation lets distracting context bury it. Remove old and unrelated documents and compare.','ข้อมูลที่ถูกต้องยังอยู่ แต่แบบจำลองนี้แสดงว่าข้อมูลรบกวนอาจกลบข้อมูลสำคัญ ลองนำเอกสารเก่าและเอกสารไม่เกี่ยวข้องออกแล้วเปรียบเทียบ']};
 if(!ids.includes('definition'))return {state:'formula',answer:['Ward C has the most infections: 5. But that does not establish the highest rate.','หอผู้ป่วย C มีผู้ติดเชื้อมากที่สุด 5 ราย แต่ยังสรุปไม่ได้ว่ามีอัตราสูงสุด'],why:['Add the formula to compare infections relative to patient totals.','เพิ่มสูตรเพื่อเปรียบเทียบจำนวนผู้ติดเชื้อกับจำนวนผู้ป่วยทั้งหมด']};
 return {state:'correct',answer:['In October 2025, Ward B had the highest infection rate: 3% (3 ÷ 100 × 100).','เดือน ต.ค. 2568 หอผู้ป่วย B มีอัตราการติดเชื้อสูงสุด 3% (3 ÷ 100 × 100)'],why:['The current data and formula support the answer: A = 2%, B = 3%, C = 2%.','ข้อมูลปัจจุบันและสูตรรองรับคำตอบ: A = 2%, B = 3%, C = 2%']};
}
