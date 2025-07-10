document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('creditoForm');
    const table = document.getElementById('creditosTable');
    const ctx = document.getElementById('graficaMontos').getContext('2d');
    let chart;
    let editandoId = null;

    async function cargarCreditos() {
        const res = await fetch('/api/creditos');
        const data = await res.json();
        table.innerHTML = '';

        const labels = [];
        const montos = [];
        const colores = [];

        data.forEach(c => {
            labels.push(`${c.cliente} #${c.id}`);
            montos.push(c.monto);
            colores.push(`rgba(${rand()}, ${rand()}, ${rand()}, 0.7)`);

            table.innerHTML += `
                <tr>
                    <td>${c.cliente}</td>
                    <td>$${c.monto}</td>
                    <td>${c.tasa_interes}%</td>
                    <td>${c.plazo}</td>
                    <td>${c.fecha_otorgamiento}</td>
                    <td>
                        <button class="editar-btn" data-id="${c.id}">✏️</button>
                        <button class="eliminar-btn" data-id="${c.id}">🗑️</button>
                    </td>
                </tr>`;
        });

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monto del Crédito',
                    data: montos,
                    backgroundColor: colores
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Asignar eventos después de renderizar la tabla
        document.querySelectorAll('.editar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const credito = data.find(c => c.id == id);
                editarCredito(credito);
            });
        });

        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if(confirm('¿Estás seguro de eliminar este crédito?')) {
                    await fetch(`/api/creditos/${id}`, { method: 'DELETE' });
                    cargarCreditos();
                }
            });
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

        if (editandoId) {
            await fetch(`/api/creditos/${editandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCredito)
            });
            editandoId = null;
        } else {
            await fetch('/api/creditos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCredito)
            });
        }

        form.reset();
        cargarCreditos();
    });

    function editarCredito(credito) {
        form.cliente.value = credito.cliente;
        form.monto.value = credito.monto;
        form.tasa.value = credito.tasa_interes;
        form.plazo.value = credito.plazo;
        form.fecha.value = credito.fecha_otorgamiento;
        editandoId = credito.id;
    }

    function rand() {
        return Math.floor(Math.random() * 200) + 30;
    }

    cargarCreditos();
});
