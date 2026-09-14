import { createRoot } from "react-dom/client";
import ShapeBlockApp from './app';
import 'antd/dist/reset.css';
import '../assets/css/style.css';
import '../assets/css/editor.css';
// import './template-importer';
// import '../assets/css/template-importer.css';
const container = document.getElementById('shapeblock-dashboard');
if (container) {
    const root = createRoot(container);
    root.render(<ShapeBlockApp initialTab={container.dataset.initialTab} />);
}