import Dropdown from './Dropdown.jsx';import './Field.css';export default function SelectField({label,...props}){return <div className="field"><label>{label}</label><Dropdown {...props}/></div>}
