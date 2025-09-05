document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chamado-form');
    const ticketsList = document.getElementById('tickets-list');
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
            data: new Date().toLocaleDateString('pt-BR')
        };

        tickets.push(novoTicket);
        saveTickets();
        renderTickets();
        form.reset();
        salaSelectGroup.classList.add('hidden'); // Esconde a sala novamente
    });

    function renderTickets() {
        ticketsList.innerHTML = '';
        tickets.forEach(ticket => {
            const ticketElement = createTicketElement(ticket);
            ticketsList.appendChild(ticketElement);
        });
    }

    function createTicketElement(ticket) {
        const ticketDiv = document.createElement('div');
        ticketDiv.classList.add('ticket');
        ticketDiv.classList.add(`status-${ticket.status}`);

        let setorInfo = `<strong>Setor:</strong> ${ticket.setor}`;
        if (ticket.setor === 'Sala de aula') {
            setorInfo += ` (${ticket.sala})`;
        }

        ticketDiv.innerHTML = `
            <button class="delete-btn" data-id="${ticket.id}"><i class="fas fa-trash-alt"></i></button>
            <div class="ticket-header">
                <h3>${ticket.titulo}</h3>
                <span class="status">${getStatusText(ticket.status)}</span>
            </div>
            <p><strong>Usuário:</strong> ${ticket.usuario}</p>
            <p>${setorInfo}</p>
            <p><strong>Descrição:</strong> ${ticket.descricao}</p>
            <p><strong>Data:</strong> ${ticket.data}</p>
        `;

        // Evento para mudar o status ao clicar no status
        const statusSpan = ticketDiv.querySelector('.status');
        statusSpan.addEventListener('click', () => {
            toggleStatus(ticket);
        });
        
        // Evento para excluir o ticket
        const deleteBtn = ticketDiv.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique no botão ative a mudança de status
            const ticketId = parseInt(e.currentTarget.dataset.id);
            deleteTicket(ticketId);
        });

        return ticketDiv;
    }
    
    // Função para excluir o ticket
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