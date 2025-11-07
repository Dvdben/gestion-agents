// Configuration Supabase
const supabaseUrl = 'https://zrqjvzfwihwmbmctwjgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycWp2emZ3aWh3bWJtY3R3amd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODU2MTMsIm极客4cCI6MjA0NjU2MTYxM30.2kJaP5q8-3Vv极客zH9iYwQJtVlJ7JZV8V9Q1QZ0ZJZJZJZ';

// Initialisation de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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

    console.log('Tentative d\'ajout:', nouvelAgent);

    // Insérer dans Supabase
    const { data, error } = await supabase
        .from('agents')
        .insert([nouvelAgent])
        .select();

    if (error) {
        console.error('Erreur détaillée:', error);
        alert('Erreur lors de l\'ajout: ' + error.message);
    } else {
        console.log('Agent ajouté avec succès:', data);
        form.reset();
        chargerAgents();
    }
});

// Fonction pour charger les agents
async function chargerAgents() {
    console.log('Chargement des agents...');
    const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erreur de chargement:', error);
        return;
    }

    console.log('Agents chargés:', agents);
    afficherAgents(agents);
}

// Fonction pour afficher les agents
function afficher极客Agents(agents) {
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
        alert('Erreur lors de la suppression: ' + error.message);
    } else {
        console.log('Agent supprimé avec succès');
        chargerAgents();
    }
};
