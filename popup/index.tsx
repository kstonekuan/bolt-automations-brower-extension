import { createRoot } from 'react-dom/client';
import { Popup } from './popup';
import './popup.css';

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);