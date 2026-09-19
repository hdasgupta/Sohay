const listeners=new Set();
export const uiEvents={on(fn){listeners.add(fn);return()=>listeners.delete(fn)},emit(event,payload){listeners.forEach(fn=>fn(event,payload));}};
