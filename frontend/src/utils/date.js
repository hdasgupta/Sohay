export const isoDate=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;};
export const addDays=(date,n)=>{const d=new Date(`${date}T00:00:00`);d.setDate(d.getDate()+n);return isoDate(d)};
export const formatDate=value=>new Date(`${String(value).slice(0,10)}T00:00:00`).toLocaleDateString();
export const today=()=>isoDate(new Date());
export const ageFromDob=(dob,on= new Date())=>{const b=new Date(`${dob}T00:00:00`);let a=on.getFullYear()-b.getFullYear();if(on.getMonth()<b.getMonth()||on.getMonth()===b.getMonth()&&on.getDate()<b.getDate())a--;return Math.max(0,a)};
