export const EXAMPLES={
 long:{en:'This is a friendly reminder that your appointment at Sunny Clinic is scheduled for Tuesday at 10:00 at reception B. Please make sure to arrive 10 minutes early so you have time to check in.',th:'ขอแจ้งเตือนด้วยความยินดีว่าคุณมีนัดที่คลินิกซันนีในวันอังคาร เวลา 10:00 น. ที่จุดต้อนรับ B กรุณามาถึงก่อนเวลานัด 10 นาที เพื่อให้มีเวลาลงทะเบียน'},
 short:{en:'Sunny Clinic: Tuesday, 10:00, reception B. Please arrive 10 minutes early.',th:'คลินิกซันนี: วันอังคาร 10:00 น. จุดต้อนรับ B กรุณามาก่อน 10 นาที'},
};
export function roughEstimate(text){return Math.ceil(Array.from(text).length/4);}
export function budgetUse(count,reserved,budget){const total=count+reserved;return {total,over:Math.max(0,total-budget),remaining:Math.max(0,budget-total),percent:Math.min(100,total/budget*100)};}
