const fs = require('fs');
const nb = JSON.parse(fs.readFileSync('densenet201-covidqu-ex.ipynb', 'utf-8'));
let output = '';
nb.cells.forEach(c => {
    if (c.cell_type === 'code') {
        const text = c.source.join('');
        if (text.includes('DenseNet201') || text.includes('Dense') || text.includes('Sequential') || text.includes('Model')) {
            output += text + '\n\n-----------------\n\n';
        }
    }
});
fs.writeFileSync('extracted_model_code.txt', output);
console.log('Done');
