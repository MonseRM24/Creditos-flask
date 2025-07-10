document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('creditoForm');
    const table = document.getElementById('creditosTable');
    const ctx = document.getElementById('graficaMontos').getContext('2d');
    let chart;

    async function cargarCreditos() {
        const res = await fetch('/api/creditos');
        const data = await res.json();
        table.innerHTML = '';
        let total = 0;
        data.forEach(c => {
            total += c.monto;
            table.innerHTML += `
                <tr>
                    <td>${c.cliente}</td>
                    <td>$${c.monto}</td>
                    <td>${c.tasa_interes}%</td>
                    <td>${c.plazo}</td>
                    <td>${c.fecha_otorgamiento}</td>
                    <td>
                        <button onclick="eliminarCredito(${c.id})">🗑️</button>
                    </td>
                </tr>`;
        });
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total Créditos'],
                datasets: [{
                    label: 'Monto Total',
                    data: [total],
                    backgroundColor: '#3498db'
                }]
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoCredito = {
            cliente: form.cliente.value,
            monto: parseFloat(form.monto.value),
            tasa_interes: parseFloat(form.tasa.value),
            plazo: parseInt(form.plazo.value),
            fecha_otorgamiento: form.fecha.value
        };
        await fetch('/api/creditos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nuevoCredito)
        });
        form.reset();
        cargarCreditos();
    });

    window.eliminarCredito = async (id) => {
        await fetch(`/api/creditos/${id}`, { method: 'DELETE' });
        cargarCreditos();
    };

    cargarCreditos();
});
