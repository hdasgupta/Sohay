const KEY='wbffmh_auth';
export const auth={save(value){localStorage.setItem(KEY,JSON.stringify(value));},read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}},clear(){localStorage.removeItem(KEY);},token(){return auth.read()?.token||'';},user(){return auth.read()?.user||null;}};
