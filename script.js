document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chamado-form');
    const ticketsListAbertos = document.getElementById('tickets-list-abertos');
    const ticketsListConcluidos = document.getElementById('tickets-list-concluidos');
    const setorSelect = document.getElementById('setor');
    const salaSelectGroup = document.querySelector('.sala-select');
    const salaSelect = document.getElementById('sala');

    // Popula o campo de salas de aula
    for (let i = 1; i <= 15; i++) {
        const option = document.createElement('option');
        option.value = `Sala ${i}`;
        option.textContent = `Sala ${i}`;
        salaSelect.appendChild(option);
    }

    // Mostra/Esconde a seleção de sala de aula
    setorSelect.addEventListener('change', () => {
        if (setorSelect.value === 'Sala de aula') {
            salaSelectGroup.classList.remove('hidden');
            salaSelect.setAttribute('required', 'required');
        } else {
            salaSelectGroup.classList.add('hidden');
            salaSelect.removeAttribute('required');
        }
    });

    let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    renderTickets();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value;
        const setor = document.getElementById('setor').value;
        const sala = setor === 'Sala de aula' ? document.getElementById('sala').value : '';
        const titulo = document.getElementById('titulo').value;
        const descricao = document.getElementById('descricao').value;

        const novoTicket = {
            id: Date.now(),
            usuario: usuario,
            setor: setor,
            sala: sala,
            titulo: titulo,
            descricao: descricao,
            status: 'aberto',
            dataAbertura: new Date().toLocaleDateString('pt-BR'),
            dataConclusao: null // Novo campo
        };

        tickets.push(novoTicket);
        saveTickets();
        renderTickets();
        form.reset();
        salaSelectGroup.classList.add('hidden');
    });

    function renderTickets() {
        ticketsListAbertos.innerHTML = '';
        ticketsListConcluidos.innerHTML = '';
        
        tickets.forEach(ticket => {
            const ticketElement = createTicketElement(ticket);
            if (ticket.status === 'concluido') {
                ticketsListConcluidos.appendChild(ticketElement);
            } else {
                ticketsListAbertos.appendChild(ticketElement);
            }
        });
    }

    function createTicketElement(ticket) {
        const ticketDiv = document.createElement('div');
        ticketDiv.classList.add('ticket');
        ticketDiv.classList.add(`ticket--status-${ticket.status}`);

        let setorInfo = `<strong>Setor:</strong> ${ticket.setor}`;
        if (ticket.setor === 'Sala de aula') {
            setorInfo += ` (${ticket.sala})`;
        }
        
        // Determina qual data mostrar
        const dataInfo = ticket.status === 'concluido' ? `<strong>Data de Conclusão:</strong> ${ticket.dataConclusao}` : `<strong>Data de Abertura:</strong> ${ticket.dataAbertura}`;

        ticketDiv.innerHTML = `
            <button class="ticket__delete-btn" data-id="${ticket.id}"><i class="fas fa-trash-alt"></i></button>
            <div class="ticket-header">
                <h3>${ticket.titulo}</h3>
                <span class="ticket__status">${getStatusText(ticket.status)}</span>
            </div>
            <p><strong>Usuário:</strong> ${ticket.usuario}</p>
            <p>${setorInfo}</p>
            <p><strong>Descrição:</strong> ${ticket.descricao}</p>
            <p>${dataInfo}</p>
        `;

        const statusSpan = ticketDiv.querySelector('.ticket__status');
        statusSpan.addEventListener('click', () => {
            toggleStatus(ticket);
        });
        
        const deleteBtn = ticketDiv.querySelector('.ticket__delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ticketId = parseInt(e.currentTarget.dataset.id);
            deleteTicket(ticketId);
        });

        return ticketDiv;
    }
    
    function deleteTicket(id) {
        if (confirm('Tem certeza que deseja excluir este chamado?')) {
            tickets = tickets.filter(ticket => ticket.id !== id);
            saveTickets();
            renderTickets();
        }
    }

    function toggleStatus(ticket) {
        const currentIndex = ['aberto', 'analise', 'concluido'].indexOf(ticket.status);
        const nextIndex = (currentIndex + 1) % 3;
        ticket.status = ['aberto', 'analise', 'concluido'][nextIndex];
        
        // Se o novo status for "concluido", registra a data atual
        if (ticket.status === 'concluido') {
            ticket.dataConclusao = new Date().toLocaleDateString('pt-BR');
        } else {
            ticket.dataConclusao = null; // Limpa a data se o status mudar
        }

        saveTickets();
        renderTickets();
    }

    function getStatusText(status) {
        switch (status) {
            case 'aberto': return 'Não Feito';
            case 'analise': return 'Em Análise';
            case 'concluido': return 'Concluído';
            default: return 'Não Feito';
        }
    }

    function saveTickets() {
        localStorage.setItem('tickets', JSON.stringify(tickets));
    }
});