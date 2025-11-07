// Configuration Supabase - REMPLACEZ AVEC VOS VRAIES CLÉS !
const supabaseUrl = 'https://gbnotarigfteynwchmnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdibm90YXJpZ2Z0ZXlud2NobW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTg0OTgsImV4cCI6MjA3ODA5NDQ5OH0.kOyYb-wql3FTLe5iD5l-oup3FDk1Jb1xCgGpK3fQFCA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Éléments du DOM
const form = document.getElementById('form-agent');
const listeContainer = document.getElementById('liste-agents-container');

// Charger les agents au démarrage
chargerAgents();

// Écouter la soumission du formulaire
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nouvelAgent = {
        prenom: document.getElementById('prenom').value,
        nom: document.getElementById('nom').value,
        poste: document.getElementById('poste').value
    };

    // Insérer dans Supabase
    const { data, error } = await supabase
        .from('agents')
        .insert([nouvelAgent])
        .select();

    if (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout');
    } else {
        console.log('Agent ajouté:', data);
        form.reset();
        chargerAgents();
    }
});

// Fonction pour charger les agents
async function chargerAgents() {
    const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erreur de chargement:', error);
        return;
    }

    afficherAgents(agents);
}

// Fonction pour afficher les agents
function afficherAgents(agents) {
    listeContainer.innerHTML = '';
    
    if (agents.length === 0) {
        listeContainer.innerHTML = '<p class="text-center">Aucun agent enregistré</p>';
        return;
    }

    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <div class="agent-info">
                <h3>${agent.prenom} ${agent.nom}</h3>
                <p>${agent.poste}</p>
            </div>
            <button class="btn-supprimer" onclick="supprimerAgent(${agent.id})">
                🗑️ Supprimer
            </button>
        `;
        listeContainer.appendChild(agentCard);
    });
}

// Fonction pour supprimer un agent
window.supprimerAgent = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;

    const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erreur de suppression:', error);
        alert('Erreur lors de la suppression');
    } else {
        console.log('Agent supprimé');
        chargerAgents();
    }
};
