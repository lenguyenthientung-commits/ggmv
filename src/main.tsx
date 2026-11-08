import {createRoot} from 'react-dom/client';
import {AuthGate} from './components/AuthGate.tsx';
import './index.css';
import './seasons/worlds.css';

createRoot(document.getElementById('root')!).render(<AuthGate />);
