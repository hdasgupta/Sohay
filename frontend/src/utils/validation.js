export const PASSWORD_RULES=[['At least 8 characters',v=>(v||'').length>=8],['Uppercase letter',v=>/[A-Z]/.test(v||'')],['Lowercase letter',v=>/[a-z]/.test(v||'')],['Digit',v=>/\d/.test(v||'')],['Special character',v=>/[^A-Za-z0-9]/.test(v||'')],['No spaces',v=>!(/\s/.test(v||''))]];
export const emailOk=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value||'');
