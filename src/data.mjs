export const projects=['Север','Горизонт','Орбита','Маяк'];
export const colors=['#62a5ff','#27cebc','#b895ff','#ffb451'];
let seed=418;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const date=n=>new Date(Date.UTC(2026,8,1+n)).toISOString().slice(0,10);
export const data={asOf:"2026-11-23",campaigns:[],spend:[],leads:[],presentations:[],meetings:[],payments:[]};
for(let p=0;p<4;p++)for(let n=0;n<6;n++){
 const channel=n<3?'vk':'ao',id=`DEMO-${channel.toUpperCase()}-${p+1}${n+1}`;
 const names=['Видео · предприниматели','Лид-форма · интересы','Ретаргетинг · посетители','База · заявки прошлых периодов','База · тематические каталоги','База · повторное касание'];
 data.campaigns.push({id,name:names[n],project:projects[p],channel,owner:`Специалист ${p+1}`,service:channel==='vk'?'VK Реклама':n===4?'Zvonok':'CRM Calls',enabled:n!==2&&n!==5,first:date(n*2)});
 for(let d=n*2;d<84;d++){
  if((n===2||n===5)&&d>55)continue;
  const direct=Math.round((650+random()*1500)*(channel==='vk'?1.3:1)*100),overhead=Math.round(direct*(channel==='vk'?.12:.16));
  data.spend.push({campaignId:id,date:date(d),direct,overhead});
  const count=2+Math.floor(random()*7);
  for(let j=0;j<count;j++){
   const leadId=`L-${data.leads.length+1}`,manager=`Менеджер ${1+Math.floor(random()*4)}`,created=date(d);
   data.leads.push({id:leadId,campaignId:id,created,manager});
   if(random()<.32){const pd=d+1+Math.floor(random()*4);if(pd<84)data.presentations.push({leadId,date:date(pd),confirmed:true});
    if(random()<.5){const md=pd+2+Math.floor(random()*6);if(md<84){data.meetings.push({leadId,date:date(md),source:'Секретарь'});if(random()<.3)data.meetings.push({leadId,date:date(md),source:'Доп. журнал'});}
     if(random()<(n===4||(n===1&&p===2)?0:.24)){const pay=md+5+Math.floor(random()*18);if(pay<84){const dealId=`D-${leadId}`,amount=(80000+Math.floor(random()*8)*20000)*100;data.payments.push({leadId,dealId,date:date(pay),amount});if(random()<.2&&pay+8<84)data.payments.push({leadId,dealId,date:date(pay+8),amount:amount/2});}}
    }
   }
  }
 }
}
