import './Dropdown.css';
export default function Dropdown({options=[],value='',placeholder='Select',labelProcessor=o=>String(o?.label??o),onOptionSelected,name}){
  const selected=options.find(o=>String(o?.id??o?.value??o)===String(value));
  return <select className="dropdown" name={name} value={value} onChange={e=>{const v=e.target.value;const o=options.find(x=>String(x?.id??x?.value??x)===v);onOptionSelected?.(o)}}><option value="" disabled>{placeholder}</option>{options.map((o,i)=><option key={String(o?.id??o?.value??o)+i} value={String(o?.id??o?.value??o)}>{labelProcessor(o,selected)}</option>)}</select>;
}
